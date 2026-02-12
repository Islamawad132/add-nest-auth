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
    const packageJsonPath = join(__dirname, '../package.json');
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
     _         _   _     __  __
    / \\  _   _| |_| |__ |  \\/  | ___
   / _ \\| | | | __| '_ \\| |\\/| |/ _ \\
  / ___ \\ |_| | |_| | | | |  | |  __/
 /_/   \\_\\__,_|\\__|_| |_|_|  |_|\\___|
  `));
  console.log(chalk.bold(`🔐 AuthMe - NestJS Auth Generator v${getVersion()}`));
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
  orm?: string;
  swagger?: boolean;
  emailVerification?: boolean;
  resetPassword?: boolean;
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
  if (stats.orm === 'prisma') {
    console.log(`   • @prisma/client, prisma`);
  }
  if (stats.swagger) {
    console.log(`   • @nestjs/swagger`);
  }
  console.log();

  console.log(chalk.bold('🔐 JWT Configuration:'));
  console.log(`   • Access token: ${stats.jwt.accessExpiration}`);
  if (stats.jwt.refreshExpiration) {
    console.log(`   • Refresh token: ${stats.jwt.refreshExpiration}`);
  }
  console.log(`   • Secret: Auto-generated (see .env)`);
  console.log();

  console.log(chalk.bold('📋 Next steps:'));
  console.log(chalk.cyan('   1. Review .env file (auto-generated with secure secret)'));
  console.log(chalk.gray('      # .env.example is also provided as a git-safe reference'));
  console.log();

  if (stats.orm === 'prisma') {
    console.log(chalk.cyan('   2. Add Prisma schema models (see prisma-schema-additions.prisma)'));
    console.log(chalk.gray('      # Copy the models into your prisma/schema.prisma'));
    console.log(chalk.gray('      npx prisma migrate dev --name add-auth-models'));
    console.log(chalk.gray('      npx prisma generate'));
  } else {
    console.log(chalk.cyan('   2. Create database migration (if using TypeORM)'));
    console.log(chalk.gray('      npm run migration:generate -- src/migrations/CreateUserTable'));
    console.log(chalk.gray('      npm run migration:run'));
  }
  console.log();
  console.log(chalk.cyan('   3. Start your NestJS app'));
  console.log(chalk.gray('      npm run start:dev'));
  console.log();
  console.log(chalk.cyan('   4. Test authentication endpoints'));
  console.log(chalk.gray('      POST http://localhost:3000/auth/register'));
  console.log(chalk.gray('      POST http://localhost:3000/auth/login'));
  console.log(chalk.gray('      POST http://localhost:3000/auth/change-password (requires JWT)'));
  if (stats.emailVerification) {
    console.log(chalk.gray('      GET  http://localhost:3000/auth/verify-email?token=...'));
    console.log(chalk.gray('      POST http://localhost:3000/auth/resend-verification'));
  }
  if (stats.resetPassword) {
    console.log(chalk.gray('      POST http://localhost:3000/auth/forgot-password'));
    console.log(chalk.gray('      POST http://localhost:3000/auth/reset-password'));
  }
  console.log(chalk.gray('      POST http://localhost:3000/auth/refresh'));
  console.log(chalk.gray('      POST http://localhost:3000/auth/logout (requires JWT)'));
  console.log(chalk.gray('      POST http://localhost:3000/auth/logout-all (requires JWT)'));
  console.log(chalk.gray('      GET  http://localhost:3000/users/profile (requires JWT)'));
  if (stats.swagger) {
    console.log();
    console.log(chalk.cyan('   5. View Swagger API documentation'));
    console.log(chalk.gray('      http://localhost:3000/api'));
  }
  console.log();

  console.log(chalk.bold('📖 Full documentation:'), 'src/auth/README.md');
  console.log();

  console.log(chalk.bold('💡 Tips:'));
  console.log('   • Use @Public() decorator for routes that don\'t require auth');
  console.log('   • Use @Roles(\'Admin\') to restrict routes by role');
  console.log('   • Access current user with @CurrentUser() decorator');
  if (stats.swagger) {
    console.log('   • Visit /api for interactive Swagger documentation');
  }
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
