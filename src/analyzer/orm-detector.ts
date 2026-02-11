/**
 * ORM detector - detects TypeORM, Prisma, or Mongoose
 */

import { ORM } from '../types/index.js';
import type { PackageJson } from '../types/index.js';

/**
 * Detect which ORM is being used in the project
 */
export async function detectORM(packageJson: PackageJson): Promise<ORM> {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Check for TypeORM
  if (dependencies['@nestjs/typeorm'] || dependencies['typeorm']) {
    return 'typeorm';
  }

  // Check for Prisma
  if (dependencies['@prisma/client'] || dependencies['prisma']) {
    return 'prisma';
  }

  // Check for Mongoose
  if (dependencies['@nestjs/mongoose'] || dependencies['mongoose']) {
    return 'mongoose';
  }

  return 'none';
}

/**
 * Detect database type from ORM dependencies
 */
export function detectDatabase(packageJson: PackageJson, orm: ORM): string | undefined {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  if (orm === 'typeorm') {
    if (dependencies['pg']) return 'postgres';
    if (dependencies['mysql2'] || dependencies['mysql']) return 'mysql';
    if (dependencies['sqlite3']) return 'sqlite';
    if (dependencies['mongodb']) return 'mongodb';
  }

  if (orm === 'prisma') {
    // Would need to read schema.prisma to determine database
    return undefined;
  }

  if (orm === 'mongoose') {
    return 'mongodb';
  }

  return undefined;
}
