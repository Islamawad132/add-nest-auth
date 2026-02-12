/**
 * Project detector - validates NestJS projects and analyzes structure
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { ProjectInfo, PackageJson, NestCliConfig } from '../types/index.js';
import { detectORM, detectDatabase } from './orm-detector.js';

export class ProjectDetector {
  constructor(private cwd: string) {}

  /**
   * Detect and validate a NestJS project
   */
  async detectProject(): Promise<ProjectInfo> {
    const errors: string[] = [];
    const root = this.cwd;

    // Check package.json
    const packageJsonPath = path.join(root, 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      errors.push('package.json not found');
      return this.createInvalidProject(root, errors);
    }

    const packageJson = await this.readPackageJson(packageJsonPath);
    if (!packageJson) {
      errors.push('Failed to read package.json');
      return this.createInvalidProject(root, errors);
    }

    // Validate NestJS project
    const hasNestCore = packageJson.dependencies?.['@nestjs/core'];
    const hasNestCommon = packageJson.dependencies?.['@nestjs/common'];

    if (!hasNestCore || !hasNestCommon) {
      errors.push('Not a NestJS project (missing @nestjs/core or @nestjs/common)');
      return this.createInvalidProject(root, errors);
    }

    // Read nest-cli.json for source root
    const nestCliConfigPath = path.join(root, 'nest-cli.json');
    const nestCliConfig = await this.readNestCliConfig(nestCliConfigPath);
    const sourceRoot = nestCliConfig?.sourceRoot || 'src';

    // Check app.module.ts
    const appModulePath = path.join(root, sourceRoot, 'app.module.ts');
    if (!await fs.pathExists(appModulePath)) {
      errors.push(`app.module.ts not found at ${sourceRoot}/app.module.ts`);
      return this.createInvalidProject(root, errors);
    }

    // Check main.ts
    const mainTsPath = path.join(root, sourceRoot, 'main.ts');

    // Detect ORM and database
    const orm = await detectORM(packageJson);
    const database = detectDatabase(packageJson, orm);

    // Check if auth module already exists
    const authModulePath = path.join(root, sourceRoot, 'auth');
    const authExists = await fs.pathExists(authModulePath);

    return {
      authExists,
      root,
      sourceRoot,
      appModulePath,
      mainTsPath,
      packageJsonPath,
      nestCliConfigPath,
      orm,
      database,
      nestVersion: packageJson.dependencies?.['@nestjs/core'],
      typescriptVersion: packageJson.devDependencies?.['typescript'],
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Read and parse package.json
   */
  private async readPackageJson(packageJsonPath: string): Promise<PackageJson | null> {
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Read and parse nest-cli.json
   */
  private async readNestCliConfig(nestCliConfigPath: string): Promise<NestCliConfig | null> {
    try {
      if (!await fs.pathExists(nestCliConfigPath)) {
        return null;
      }
      const content = await fs.readFile(nestCliConfigPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Create invalid project info object
   */
  private createInvalidProject(root: string, errors: string[]): ProjectInfo {
    return {
      root,
      sourceRoot: 'src',
      appModulePath: path.join(root, 'src', 'app.module.ts'),
      mainTsPath: path.join(root, 'src', 'main.ts'),
      packageJsonPath: path.join(root, 'package.json'),
      nestCliConfigPath: path.join(root, 'nest-cli.json'),
      orm: 'none',
      isValid: false,
      errors,
    };
  }
}

/**
 * Detect project in current working directory
 */
export async function detectProject(cwd: string = process.cwd()): Promise<ProjectInfo> {
  const detector = new ProjectDetector(cwd);
  return detector.detectProject();
}
