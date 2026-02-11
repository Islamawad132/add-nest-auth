/**
 * Safe file writer with backup and rollback
 */

import * as path from 'path';
import * as fs from 'fs-extra';

export interface WriteOptions {
  overwrite?: boolean;
  backup?: boolean;
}

export class FileWriter {
  private writtenFiles: string[] = [];
  private backups: Map<string, string> = new Map();

  /**
   * Write a file to disk
   */
  async writeFile(
    filePath: string,
    content: string,
    options: WriteOptions = {}
  ): Promise<void> {
    const { overwrite = false, backup = true } = options;

    // Check if file exists
    const exists = await fs.pathExists(filePath);
    if (exists && !overwrite) {
      throw new Error(`File already exists: ${filePath}`);
    }

    // Create backup if file exists
    if (exists && backup) {
      await this.createBackup(filePath);
    }

    // Ensure directory exists
    await fs.ensureDir(path.dirname(filePath));

    // Write file
    await fs.writeFile(filePath, content, 'utf-8');

    // Track written file
    this.writtenFiles.push(filePath);
  }

  /**
   * Create a backup of an existing file
   */
  private async createBackup(filePath: string): Promise<void> {
    const backupPath = `${filePath}.backup`;
    await fs.copy(filePath, backupPath);
    this.backups.set(filePath, backupPath);
  }

  /**
   * Rollback all written files
   */
  async rollback(): Promise<void> {
    // Restore backups
    for (const [originalPath, backupPath] of this.backups) {
      if (await fs.pathExists(backupPath)) {
        await fs.copy(backupPath, originalPath, { overwrite: true });
        await fs.remove(backupPath);
      }
    }

    // Remove newly created files
    for (const filePath of this.writtenFiles) {
      if (!this.backups.has(filePath) && await fs.pathExists(filePath)) {
        await fs.remove(filePath);
      }
    }

    this.writtenFiles = [];
    this.backups.clear();
  }

  /**
   * Clean up backups
   */
  async cleanupBackups(): Promise<void> {
    for (const backupPath of this.backups.values()) {
      if (await fs.pathExists(backupPath)) {
        await fs.remove(backupPath);
      }
    }
    this.backups.clear();
  }

  /**
   * Get list of written files
   */
  getWrittenFiles(): string[] {
    return [...this.writtenFiles];
  }
}
