/**
 * Configuration types for the add-nest-auth CLI
 */

export type AuthStrategy = 'jwt' | 'oauth' | 'session';
export type ORM = 'typeorm' | 'prisma' | 'mongoose' | 'none';
export type Database = 'postgres' | 'mysql' | 'sqlite' | 'mongodb';

export interface RBACConfig {
  enabled: boolean;
  roles: string[];
}

export interface FeaturesConfig {
  refreshTokens: boolean;
  rateLimiting: boolean;
  swagger?: boolean;
  unitTests?: boolean;
  useUsername?: boolean;
  emailVerification?: boolean;
  resetPassword?: boolean;
  twoFactor?: boolean;
}

export interface JWTConfig {
  secret: string;
  accessExpiration: string;
  refreshExpiration: string;
}

export interface AuthConfig {
  // Project metadata
  projectName: string;
  sourceRoot: string;

  // Auth configuration
  strategy: AuthStrategy;

  // Authorization
  rbac: RBACConfig;

  // Database
  orm: ORM;
  database: Database;

  // Features
  features: FeaturesConfig;

  // JWT configuration
  jwt: JWTConfig;

  // Options
  autoInstall: boolean;

  // Metadata
  timestamp: string;
  generatorVersion: string;
}

export interface TemplateContext extends AuthConfig {
  // Additional template-specific data
}
