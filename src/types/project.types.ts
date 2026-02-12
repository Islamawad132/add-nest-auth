/**
 * Project detection and analysis types
 */

import { ORM } from './config.types.js';

export interface ProjectInfo {
  root: string;
  sourceRoot: string;
  appModulePath: string;
  mainTsPath: string;
  packageJsonPath: string;
  nestCliConfigPath: string;

  // Detected information
  orm: ORM;
  database?: string;
  nestVersion?: string;
  typescriptVersion?: string;
  authExists?: boolean;

  // Validation
  isValid: boolean;
  errors: string[];
}

export interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

export interface NestCliConfig {
  sourceRoot?: string;
  collection?: string;
  [key: string]: any;
}
