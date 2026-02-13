/**
 * GUI orchestrator - event-emitting generation pipeline
 */

import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs from 'fs-extra';
import { AuthConfig, ProjectInfo } from '../types/index.js';
import { Generator } from '../generator/generator.js';
import { TemplateEngine } from '../generator/template-engine.js';
import { buildTemplateContext } from '../config/config-builder.js';

export interface ProgressEvent {
  step: string;
  label: string;
  status: 'started' | 'completed' | 'failed' | 'warning';
  detail?: string;
  timestamp: number;
}

export interface GenerateRequest {
  config: AuthConfig;
  projectInfo: ProjectInfo;
  overwrite: boolean;
}

export interface GenerateResult {
  success: boolean;
  filesCreated: string[];
  filesSkipped: string[];
  errors: string[];
  warnings: string[];
}

export interface PreviewFile {
  path: string;
  content: string;
  isNew: boolean;
}

export interface PreviewResult {
  files: PreviewFile[];
  modifiedFiles: Array<{ path: string; description: string }>;
  totalFiles: number;
}

export class GuiOrchestrator extends EventEmitter {
  constructor(_cwd: string) {
    super();
  }

  private emitProgress(step: string, label: string, status: ProgressEvent['status'], detail?: string): void {
    const event: ProgressEvent = { step, label, status, detail, timestamp: Date.now() };
    this.emit('progress', event);
  }

  /**
   * Preview which files would be generated (dry-run)
   */
  async preview(config: AuthConfig, projectInfo: ProjectInfo): Promise<PreviewResult> {
    const generator = new Generator();
    const templateEngine = new TemplateEngine();
    const context = buildTemplateContext(config);
    const plan = generator.buildGenerationPlan(config);

    const files: PreviewFile[] = [];

    for (const spec of plan) {
      const content = await templateEngine.render(spec.template, context);
      const fullPath = path.join(projectInfo.root, spec.output);
      const exists = await fs.pathExists(fullPath);

      files.push({
        path: spec.output,
        content,
        isNew: !exists,
      });
    }

    const modifiedFiles = [
      { path: `${config.sourceRoot}/app.module.ts`, description: 'Add ConfigModule, AuthModule, UsersModule imports' },
      { path: `${config.sourceRoot}/main.ts`, description: 'Add global JWT guard, ValidationPipe, Swagger setup' },
      { path: 'package.json', description: 'Add authentication dependencies' },
    ];

    return {
      files,
      modifiedFiles,
      totalFiles: files.length + modifiedFiles.length,
    };
  }

  /**
   * Run the full generation pipeline
   */
  async generate(request: GenerateRequest): Promise<GenerateResult> {
    const { config, projectInfo, overwrite } = request;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Step 1: Generate files
    this.emitProgress('generate', 'Generating files from templates...', 'started');
    const generator = new Generator();
    const result = await generator.generate(config, projectInfo, overwrite);

    if (!result.success) {
      this.emitProgress('generate', 'File generation failed', 'failed', result.error);
      return { success: false, filesCreated: [], filesSkipped: [], errors: [result.error || 'Unknown error'], warnings };
    }
    this.emitProgress('generate', `Generated ${result.filesCreated.length} files`, 'completed');

    // Step 2: Update app.module.ts
    this.emitProgress('ast-app-module', 'Updating app.module.ts...', 'started');
    try {
      const { AppModuleUpdater } = await import('../installer/index.js');
      const astUpdater = new AppModuleUpdater(projectInfo.appModulePath);
      await astUpdater.update(config);
      await astUpdater.cleanupBackup();
      this.emitProgress('ast-app-module', 'Updated app.module.ts', 'completed');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.emitProgress('ast-app-module', 'Failed to update app.module.ts', 'failed', msg);
      errors.push(msg);
      return { success: false, filesCreated: result.filesCreated, filesSkipped: result.filesSkipped, errors, warnings };
    }

    // Step 3: Update main.ts
    this.emitProgress('ast-main-ts', 'Updating main.ts...', 'started');
    try {
      const { MainTsUpdater } = await import('../installer/index.js');
      const mainUpdater = new MainTsUpdater(projectInfo.mainTsPath);
      await mainUpdater.update(config);
      await mainUpdater.cleanupBackup();
      this.emitProgress('ast-main-ts', 'Updated main.ts', 'completed');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.emitProgress('ast-main-ts', 'Could not auto-update main.ts', 'warning', msg);
      warnings.push('Could not auto-update main.ts - see main.ts.example for manual setup');
    }

    // Step 4: Update package.json
    this.emitProgress('package-json', 'Updating package.json...', 'started');
    try {
      const { PackageUpdater } = await import('../installer/index.js');
      const pkgUpdater = new PackageUpdater(projectInfo.packageJsonPath);
      await pkgUpdater.update(config);
      await pkgUpdater.cleanupBackup();
      this.emitProgress('package-json', 'Updated package.json', 'completed');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.emitProgress('package-json', 'Failed to update package.json', 'failed', msg);
      errors.push(msg);
      return { success: false, filesCreated: result.filesCreated, filesSkipped: result.filesSkipped, errors, warnings };
    }

    // Step 5: Install dependencies
    if (config.autoInstall) {
      this.emitProgress('install-deps', 'Installing dependencies...', 'started');
      try {
        const { DependencyInstaller } = await import('../installer/index.js');
        const installer = new DependencyInstaller();
        await installer.installCapture(projectInfo.root);
        this.emitProgress('install-deps', 'Dependencies installed', 'completed');
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        this.emitProgress('install-deps', 'Failed to install dependencies', 'warning', msg);
        warnings.push('Failed to install dependencies - run npm install manually');
      }
    }

    return {
      success: true,
      filesCreated: result.filesCreated,
      filesSkipped: result.filesSkipped,
      errors,
      warnings,
    };
  }
}
