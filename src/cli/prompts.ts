/**
 * CLI prompts using Inquirer
 */

import inquirer from 'inquirer';
import { AuthConfig, ORM } from '../types/index.js';
import { generateSecret } from '../config/utils.js';

export interface PromptAnswers {
  strategy: 'jwt';
  enableRBAC: boolean;
  roles: string[];
  refreshTokens: boolean;
  accessExpiration: string;
  refreshExpiration: string;
  enableRateLimiting: boolean;
  enableSwagger: boolean;
  generateTests: boolean;
  useUsername: boolean;
  useDetectedORM: boolean;
  database: string;
  autoInstall: boolean;
}

/**
 * Ask all configuration questions
 */
export async function promptConfig(detectedORM: ORM, detectedDB?: string): Promise<PromptAnswers> {
  const dbLabel = detectedDB
    ? ` with ${detectedDB.charAt(0).toUpperCase() + detectedDB.slice(1)}`
    : '';

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'strategy',
      message: 'Choose authentication strategy:',
      choices: [
        { name: 'JWT Authentication (Recommended)', value: 'jwt' },
        { name: 'OAuth 2.0 (Google, GitHub) [Coming soon]', value: 'oauth', disabled: true },
        { name: 'Session-based (Traditional) [Coming soon]', value: 'session', disabled: true },
      ],
      default: 'jwt',
    },
    {
      type: 'confirm',
      name: 'enableRBAC',
      message: 'Enable Role-Based Access Control (RBAC)?',
      default: true,
    },
    {
      type: 'checkbox',
      name: 'roles',
      message: 'Select default roles:',
      choices: [
        { name: 'Admin', value: 'Admin', checked: true },
        { name: 'User', value: 'User', checked: true },
        { name: 'Moderator', value: 'Moderator', checked: false },
        { name: 'Guest', value: 'Guest', checked: false },
      ],
      when: (answers: any) => answers.enableRBAC,
      validate: (input: string[]) => {
        if (input.length === 0) {
          return 'Please select at least one role';
        }
        return true;
      },
    },
    {
      type: 'confirm',
      name: 'refreshTokens',
      message: 'Enable Refresh Token rotation?',
      default: true,
    },
    {
      type: 'list',
      name: 'accessExpiration',
      message: 'JWT Access Token expiration:',
      choices: [
        { name: '15 minutes', value: '15m' },
        { name: '30 minutes', value: '30m' },
        { name: '1 hour (Recommended)', value: '1h' },
        { name: '4 hours', value: '4h' },
        { name: '1 day', value: '1d' },
      ],
      default: '1h',
    },
    {
      type: 'list',
      name: 'refreshExpiration',
      message: 'JWT Refresh Token expiration:',
      choices: [
        { name: '7 days (Recommended)', value: '7d' },
        { name: '30 days', value: '30d' },
        { name: '90 days', value: '90d' },
        { name: '1 year', value: '1y' },
      ],
      default: '7d',
      when: (answers: any) => answers.refreshTokens,
    },
    {
      type: 'confirm',
      name: 'enableRateLimiting',
      message: 'Enable rate limiting on auth endpoints? (recommended)',
      default: true,
    },
    {
      type: 'confirm',
      name: 'enableSwagger',
      message: 'Enable Swagger API documentation? (recommended)',
      default: true,
    },
    {
      type: 'confirm',
      name: 'generateTests',
      message: 'Generate unit tests? (recommended)',
      default: true,
    },
    {
      type: 'confirm',
      name: 'useUsername',
      message: 'Add username field to user?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'useDetectedORM',
      message: `Detected ${detectedORM.toUpperCase()}${dbLabel}. Use it?`,
      default: true,
      when: () => detectedORM !== 'none',
    },
    {
      type: 'list',
      name: 'database',
      message: 'Select database:',
      choices: [
        { name: 'PostgreSQL (Recommended)', value: 'postgres' },
        { name: 'MySQL', value: 'mysql' },
        { name: 'SQLite (for testing)', value: 'sqlite' },
        { name: 'MongoDB', value: 'mongodb' },
      ],
      default: 'postgres',
      when: (answers: any) => detectedORM === 'none' || !answers.useDetectedORM,
    },
    {
      type: 'confirm',
      name: 'autoInstall',
      message: 'Auto-install dependencies after generation?',
      default: true,
    },
  ]);

  return answers;
}

/**
 * Get default answers (for --yes flag)
 */
export function getDefaultAnswers(detectedORM: ORM, detectedDB?: string): PromptAnswers {
  return {
    strategy: 'jwt',
    enableRBAC: true,
    roles: ['Admin', 'User'],
    refreshTokens: true,
    accessExpiration: '1h',
    refreshExpiration: '7d',
    enableRateLimiting: true,
    enableSwagger: true,
    generateTests: true,
    useUsername: false,
    useDetectedORM: true,
    database: detectedDB || 'postgres',
    autoInstall: true,
  };
}

/**
 * Build AuthConfig from prompt answers
 */
export function buildConfig(
  answers: PromptAnswers,
  projectName: string,
  sourceRoot: string,
  detectedORM: ORM,
  detectedDB?: string
): AuthConfig {
  const config: AuthConfig = {
    projectName,
    sourceRoot,
    strategy: answers.strategy,
    rbac: {
      enabled: answers.enableRBAC,
      roles: answers.roles || [],
    },
    orm: answers.useDetectedORM !== false ? detectedORM : 'none',
    database: answers.database || detectedDB || 'postgres',
    features: {
      refreshTokens: answers.refreshTokens,
      rateLimiting: answers.enableRateLimiting,
      swagger: answers.enableSwagger,
      unitTests: answers.generateTests,
      useUsername: answers.useUsername,
    },
    jwt: {
      secret: generateSecret(),
      accessExpiration: answers.accessExpiration,
      refreshExpiration: answers.refreshExpiration || '7d',
    },
    autoInstall: answers.autoInstall,
    timestamp: new Date().toISOString(),
    generatorVersion: '1.3.0',
  };

  return config;
}
