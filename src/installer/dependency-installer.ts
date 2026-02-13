/**
 * Install dependencies using detected package manager
 */

import { execa } from 'execa';
import { detect } from 'detect-package-manager';

export class DependencyInstaller {
  /**
   * Install dependencies using the detected package manager
   */
  async install(cwd: string): Promise<void> {
    const packageManager = await this.detectPackageManager(cwd);

    console.log(`📦 Installing dependencies with ${packageManager}...`);

    try {
      await execa(packageManager, ['install'], {
        cwd,
        stdio: 'inherit',
      });

      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      throw new Error(
        `Failed to install dependencies with ${packageManager}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Install dependencies, capturing output (for GUI mode)
   */
  async installCapture(cwd: string): Promise<{ stdout: string; stderr: string }> {
    const packageManager = await this.detectPackageManager(cwd);

    try {
      const result = await execa(packageManager, ['install'], {
        cwd,
        stdio: 'pipe',
      });

      return { stdout: result.stdout, stderr: result.stderr };
    } catch (error) {
      throw new Error(
        `Failed to install dependencies with ${packageManager}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Detect which package manager is being used
   */
  private async detectPackageManager(cwd: string): Promise<string> {
    try {
      return await detect({ cwd });
    } catch (error) {
      // Default to npm if detection fails
      return 'npm';
    }
  }
}
