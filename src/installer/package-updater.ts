/**
 * Update package.json with new dependencies
 */

import * as fs from 'fs-extra';
import { AuthConfig } from '../types/index.js';

export interface DependencyMap {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export class PackageUpdater {
  private backupPath: string | null = null;

  constructor(private packageJsonPath: string) {}

  /**
   * Update package.json with auth dependencies
   */
  async update(config: AuthConfig): Promise<void> {
    // Create backup
    await this.createBackup();

    try {
      // Read package.json
      const packageJson = await fs.readJSON(this.packageJsonPath);

      // Get dependencies to add
      const deps = this.getDependencies(config);

      // Merge dependencies
      packageJson.dependencies = {
        ...packageJson.dependencies,
        ...deps.dependencies,
      };

      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        ...deps.devDependencies,
      };

      // Sort dependencies alphabetically
      packageJson.dependencies = this.sortObject(packageJson.dependencies);
      packageJson.devDependencies = this.sortObject(
        packageJson.devDependencies
      );

      // Write back with proper formatting
      await fs.writeJSON(this.packageJsonPath, packageJson, { spaces: 2 });
    } catch (error) {
      // Restore backup on error
      await this.restoreBackup();
      throw error;
    }
  }

  /**
   * Get dependencies based on configuration
   */
  private getDependencies(config: AuthConfig): DependencyMap {
    const dependencies: Record<string, string> = {
      '@nestjs/jwt': '^11.0.0',
      '@nestjs/passport': '^11.0.0',
      '@nestjs/config': '^4.0.0',
      passport: '^0.7.0',
      'passport-jwt': '^4.0.1',
      'passport-local': '^1.0.0',
      bcrypt: '^5.1.1',
      'class-validator': '^0.14.0',
      'class-transformer': '^0.5.1',
    };

    const devDependencies: Record<string, string> = {
      '@types/passport-jwt': '^4.0.0',
      '@types/passport-local': '^1.0.36',
      '@types/bcrypt': '^5.0.2',
    };

    // Add TypeORM dependencies if needed
    if (config.orm === 'typeorm') {
      dependencies['@nestjs/typeorm'] = '^11.0.0';
      dependencies['typeorm'] = '^0.3.20';

      // Add database driver
      switch (config.database) {
        case 'postgres':
          dependencies['pg'] = '^8.11.3';
          break;
        case 'mysql':
          dependencies['mysql2'] = '^3.9.1';
          break;
        case 'sqlite':
          dependencies['sqlite3'] = '^5.1.7';
          break;
        case 'mongodb':
          dependencies['mongodb'] = '^6.3.0';
          break;
      }
    }

    return { dependencies, devDependencies };
  }

  /**
   * Sort object keys alphabetically
   */
  private sortObject(obj: Record<string, string>): Record<string, string> {
    return Object.keys(obj)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = obj[key];
        return sorted;
      }, {} as Record<string, string>);
  }

  /**
   * Create backup
   */
  private async createBackup(): Promise<void> {
    this.backupPath = `${this.packageJsonPath}.backup`;
    await fs.copy(this.packageJsonPath, this.backupPath);
  }

  /**
   * Restore backup
   */
  private async restoreBackup(): Promise<void> {
    if (this.backupPath && (await fs.pathExists(this.backupPath))) {
      await fs.copy(this.backupPath, this.packageJsonPath, { overwrite: true });
      await fs.remove(this.backupPath);
    }
  }

  /**
   * Clean up backup
   */
  async cleanupBackup(): Promise<void> {
    if (this.backupPath && (await fs.pathExists(this.backupPath))) {
      await fs.remove(this.backupPath);
    }
  }
}
