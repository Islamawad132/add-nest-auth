/**
 * Prisma schema updater - appends auth models to prisma/schema.prisma
 */

import * as fs from 'fs-extra';
import { execa } from 'execa';
import { AuthConfig } from '../types/index.js';
import { TemplateEngine } from '../generator/template-engine.js';
import { buildTemplateContext } from '../config/config-builder.js';

export interface PrismaUpdateResult {
  updated: boolean;
  message: string;
  skippedModels: string[];
}

export class PrismaSchemaUpdater {
  private backupPath: string | null = null;

  constructor(private schemaPath: string) {}

  /**
   * Update prisma/schema.prisma with auth models
   */
  async update(config: AuthConfig): Promise<PrismaUpdateResult> {
    // 1. Check if schema.prisma exists
    const exists = await fs.pathExists(this.schemaPath);
    if (!exists) {
      return {
        updated: false,
        message: 'prisma/schema.prisma not found. Run "npx prisma init" first, then re-run nest-authme.',
        skippedModels: [],
      };
    }

    // 2. Read existing schema content
    const existingContent = await fs.readFile(this.schemaPath, 'utf-8');

    // 3. Check for existing models independently
    const skippedModels: string[] = [];
    const hasUser = /^\s*model\s+User\s*\{/m.test(existingContent);
    const hasRefreshToken = /^\s*model\s+RefreshToken\s*\{/m.test(existingContent);

    if (hasUser) {
      skippedModels.push('User');
    }
    if (hasRefreshToken && config.features.refreshTokens) {
      skippedModels.push('RefreshToken');
    }

    // If all needed models already exist, skip entirely
    const needsUser = !hasUser;
    const needsRefreshToken = config.features.refreshTokens && !hasRefreshToken;

    if (!needsUser && !needsRefreshToken) {
      return {
        updated: false,
        message: `Models already exist in schema.prisma: ${skippedModels.join(', ')}. Please check that your existing models have all required auth fields.`,
        skippedModels,
      };
    }

    // 4. Render the models template
    const templateEngine = new TemplateEngine();
    const context = buildTemplateContext(config);
    let modelsContent = await templateEngine.render('prisma/schema.prisma.models.hbs', context);

    // 5. Strip models that already exist
    if (hasUser) {
      // Remove the User model block from rendered content
      modelsContent = modelsContent.replace(/model\s+User\s*\{[^}]*\}\n?/s, '');
    }
    if (hasRefreshToken) {
      // Remove the RefreshToken model block from rendered content
      modelsContent = modelsContent.replace(/model\s+RefreshToken\s*\{[^}]*\}\n?/s, '');
    }

    // Clean up extra blank lines
    modelsContent = modelsContent.replace(/\n{3,}/g, '\n\n').trim();

    if (!modelsContent) {
      return {
        updated: false,
        message: 'No new models to add.',
        skippedModels,
      };
    }

    // 6. Create backup
    await this.createBackup();

    try {
      // 7. Append models with separator comment
      const separator = '\n\n// === Auth models (added by nest-authme) ===\n\n';
      const updatedContent = existingContent.trimEnd() + separator + modelsContent + '\n';

      await fs.writeFile(this.schemaPath, updatedContent, 'utf-8');

      // 8. Try to run prisma format for consistent indentation (non-fatal)
      await this.tryPrismaFormat();

      const addedModels: string[] = [];
      if (needsUser) addedModels.push('User');
      if (needsRefreshToken) addedModels.push('RefreshToken');

      let message = `Added ${addedModels.join(', ')} model(s) to prisma/schema.prisma`;
      if (skippedModels.length > 0) {
        message += `. Skipped existing: ${skippedModels.join(', ')} (check for missing auth fields)`;
      }

      return {
        updated: true,
        message,
        skippedModels,
      };
    } catch (error) {
      await this.restoreBackup();
      throw error;
    }
  }

  /**
   * Try to run prisma format for consistent indentation
   */
  private async tryPrismaFormat(): Promise<void> {
    try {
      await execa('npx', ['prisma', 'format'], {
        cwd: this.schemaPath.replace(/[/\\]prisma[/\\]schema\.prisma$/, ''),
        timeout: 15000,
      });
    } catch {
      // Non-fatal - formatting is optional
    }
  }

  /**
   * Create backup of schema.prisma
   */
  private async createBackup(): Promise<void> {
    this.backupPath = `${this.schemaPath}.backup`;
    await fs.copy(this.schemaPath, this.backupPath);
  }

  /**
   * Restore backup on failure
   */
  private async restoreBackup(): Promise<void> {
    if (this.backupPath && (await fs.pathExists(this.backupPath))) {
      await fs.copy(this.backupPath, this.schemaPath, { overwrite: true });
      await fs.remove(this.backupPath);
    }
  }

  /**
   * Clean up backup after success
   */
  async cleanupBackup(): Promise<void> {
    if (this.backupPath && (await fs.pathExists(this.backupPath))) {
      await fs.remove(this.backupPath);
    }
  }
}
