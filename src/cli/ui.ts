/**
 * CLI UI utilities - colors, spinners, banners
 */

import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { readFileSync } from 'fs';
import { join } from 'path';

// Get version from package.json
function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    return '1.0.0'; // Fallback version
  }
}

/**
 * ASCII art banner
 */
export function showBanner(): void {
  console.log(chalk.cyan(`
   ___         _   _       __  __
  / _ \\       | | | |     |  \\/  |
 / /_\\ \\_   _ | |_| |__   | \\  / | ___
 |  _  | | | || __| '_ \\  | |\\/| |/ _ \\
 | | | | |_| || |_| | | | | |  | |  __/
 \\_| |_/\\__,_| \\__|_| |_| \\_|  |_/\\___|
  `));
  console.log(chalk.bold(`🔐 NestJS Authentication Module Generator v${getVersion()}`));
  console.log();
}

/**
 * Show project analysis results
 */
export function showProjectInfo(info: {
  nestVersion?: string;
  orm: string;
  sourceRoot: string;
}) {
  console.log(chalk.green('✓'), `Detected NestJS ${info.nestVersion || 'project'}`);
  if (info.orm !== 'none') {
    console.log(chalk.green('✓'), `Found ${info.orm.toUpperCase()}`);
  }
  console.log(chalk.green('✓'), `Source directory: ${info.sourceRoot}/`);
  console.log(chalk.green('✓'), 'No existing auth module found');
  console.log();
}

/**
 * Show error message
 */
export function showError(message: string, errors?: string[]): void {
  console.log();
  console.log(chalk.red('❌ Error:'), chalk.bold(message));
  if (errors && errors.length > 0) {
    console.log();
    errors.forEach((error) => {
      console.log(chalk.red('  •'), error);
    });
  }
  console.log();
}

/**
 * Show help for creating a NestJS project
 */
export function showNestJSHelp(): void {
  console.log(chalk.yellow('To create a new NestJS project:'));
  console.log();
  console.log(chalk.cyan('  npm i -g @nestjs/cli'));
  console.log(chalk.cyan('  nest new my-project'));
  console.log();
}

/**
 * Show success message
 */
export function showSuccess(stats: {
  filesCreated: number;
  dependenciesAdded: number;
  jwt: { accessExpiration: string; refreshExpiration?: string };
}): void {
  console.log();
  console.log(chalk.green.bold('🎉 Success!'), 'Authentication module generated.');
  console.log();

  console.log(chalk.bold('📁 Files created:'));
  console.log(`   • ${stats.filesCreated} new files in src/auth/ and src/users/`);
  console.log(`   • Updated src/app.module.ts`);
  console.log(`   • Updated package.json`);
  console.log();

  console.log(chalk.bold('📦 Dependencies added:'));
  console.log(`   • @nestjs/jwt, @nestjs/passport, @nestjs/config`);
  console.log(`   • passport, passport-jwt, passport-local`);
  console.log(`   • bcrypt, class-validator, class-transformer`);
  console.log(`   • ${stats.dependenciesAdded} packages total`);
  console.log();

  console.log(chalk.bold('🔐 JWT Configuration:'));
  console.log(`   • Access token: ${stats.jwt.accessExpiration}`);
  if (stats.jwt.refreshExpiration) {
    console.log(`   • Refresh token: ${stats.jwt.refreshExpiration}`);
  }
  console.log(`   • Secret: Auto-generated (see .env.example)`);
  console.log();

  console.log(chalk.bold('📋 Next steps:'));
  console.log(chalk.cyan('   1. Copy .env.example to .env'));
  console.log(chalk.gray('      cp .env.example .env'));
  console.log();
  console.log(chalk.cyan('   2. Update JWT_SECRET in .env (or keep auto-generated)'));
  console.log();
  console.log(chalk.cyan('   3. Create database migration (if using TypeORM)'));
  console.log(chalk.gray('      npm run migration:generate -- src/migrations/CreateUserTable'));
  console.log(chalk.gray('      npm run migration:run'));
  console.log();
  console.log(chalk.cyan('   4. Start your NestJS app'));
  console.log(chalk.gray('      npm run start:dev'));
  console.log();
  console.log(chalk.cyan('   5. Test authentication endpoints'));
  console.log(chalk.gray('      POST http://localhost:3000/auth/register'));
  console.log(chalk.gray('      POST http://localhost:3000/auth/login'));
  console.log(chalk.gray('      GET  http://localhost:3000/users/profile (requires JWT)'));
  console.log();

  console.log(chalk.bold('📖 Full documentation:'), 'src/auth/README.md');
  console.log();

  console.log(chalk.bold('💡 Tips:'));
  console.log('   • Use @Public() decorator for routes that don\'t require auth');
  console.log('   • Use @Roles(\'Admin\') to restrict routes by role');
  console.log('   • Access current user with @CurrentUser() decorator');
  console.log();
}

/**
 * Create a spinner
 */
export function createSpinner(text: string): Ora {
  return ora({
    text,
    color: 'cyan',
  });
}
