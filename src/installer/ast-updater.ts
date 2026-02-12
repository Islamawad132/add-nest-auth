/**
 * AST-based app.module.ts updater using ts-morph
 */

import { Project, SourceFile, SyntaxKind, Node, IndentationText } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs-extra';
import { AuthConfig } from '../types/index.js';

export class AppModuleUpdater {
  private project: Project;
  private sourceFile: SourceFile | undefined;
  private backupPath: string | null = null;

  constructor(private appModulePath: string) {
    this.project = new Project({
      skipAddingFilesFromTsConfig: true,
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
      },
    });
  }

  /**
   * Update app.module.ts with auth modules
   */
  async update(config?: AuthConfig): Promise<void> {
    // Create backup
    await this.createBackup();

    try {
      // Load source file
      this.sourceFile = this.project.addSourceFileAtPath(this.appModulePath);

      // Add imports
      this.addImports(config);

      // Add modules to @Module decorator
      this.addModulesToDecorator(config);

      // Format and save
      this.sourceFile.formatText();
      await this.sourceFile.save();
    } catch (error) {
      // Restore backup on error
      await this.restoreBackup();
      throw error;
    }
  }

  /**
   * Add necessary imports
   */
  private addImports(config?: AuthConfig): void {
    if (!this.sourceFile) {
      throw new Error('Source file not loaded');
    }

    // Add ConfigModule import
    this.addImport('@nestjs/config', ['ConfigModule']);

    // Add ORM-specific imports
    if (config && config.orm === 'typeorm') {
      this.addImport('@nestjs/typeorm', ['TypeOrmModule']);
      this.addImport('./users/entities/user.entity', ['User']);

      if (config.features.refreshTokens) {
        this.addImport('./users/entities/refresh-token.entity', ['RefreshToken']);
      }
    } else if (config && config.orm === 'prisma') {
      this.addImport('./prisma/prisma.module', ['PrismaModule']);
    }

    // Add AuthModule import
    this.addImport('./auth/auth.module', ['AuthModule']);

    // Add UsersModule import
    this.addImport('./users/users.module', ['UsersModule']);
  }

  /**
   * Add an import statement if it doesn't exist
   */
  private addImport(moduleSpecifier: string, namedImports: string[]): void {
    if (!this.sourceFile) return;

    // Check if import already exists
    const existingImport = this.sourceFile
      .getImportDeclarations()
      .find((imp) => imp.getModuleSpecifierValue() === moduleSpecifier);

    if (existingImport) {
      // Add missing named imports
      const existingNames = existingImport
        .getNamedImports()
        .map((ni) => ni.getName());

      const missingImports = namedImports.filter(
        (name) => !existingNames.includes(name)
      );

      if (missingImports.length > 0) {
        existingImport.addNamedImports(missingImports);
      }
    } else {
      // Add new import declaration
      this.sourceFile.addImportDeclaration({
        moduleSpecifier,
        namedImports,
      });
    }
  }

  /**
   * Add modules to @Module decorator imports array
   */
  private addModulesToDecorator(config?: AuthConfig): void {
    if (!this.sourceFile) return;

    // Find AppModule class
    const appModuleClass = this.sourceFile.getClass('AppModule');
    if (!appModuleClass) {
      throw new Error('AppModule class not found');
    }

    // Find @Module decorator
    const moduleDecorator = appModuleClass.getDecorator('Module');
    if (!moduleDecorator) {
      throw new Error('@Module decorator not found');
    }

    // Get decorator arguments
    const decoratorArgs = moduleDecorator.getArguments()[0];
    if (!decoratorArgs || !Node.isObjectLiteralExpression(decoratorArgs)) {
      throw new Error('Invalid @Module decorator structure');
    }

    // Get or create imports property
    let importsProperty = decoratorArgs.getProperty('imports');

    if (!importsProperty) {
      // Create imports property if it doesn't exist
      decoratorArgs.addPropertyAssignment({
        name: 'imports',
        initializer: '[]',
      });
      importsProperty = decoratorArgs.getProperty('imports');
    }

    if (!importsProperty || !Node.isPropertyAssignment(importsProperty)) {
      throw new Error('Invalid imports property');
    }

    const importsArray = importsProperty.getInitializer();
    if (!Node.isArrayLiteralExpression(importsArray)) {
      throw new Error('imports is not an array');
    }

    // Get existing module names and their text
    const existingModules = this.getExistingModuleNames(importsArray);
    const existingElements = importsArray.getElements().map(e => e.getText());

    // Build a list of all elements (existing + new)
    const allElements: string[] = [...existingElements];

    // Add ConfigModule.forRoot() if not exists
    if (!existingModules.has('ConfigModule')) {
      allElements.push('ConfigModule.forRoot({ isGlobal: true })');
    }

    // Add ORM module if not already present
    if (config && config.orm === 'typeorm' && !existingModules.has('TypeOrmModule')) {
      const entities = config.features.refreshTokens
        ? '[User, RefreshToken]'
        : '[User]';

      allElements.push(this.buildTypeOrmConfig(config.database, entities));
    } else if (config && config.orm === 'prisma' && !existingModules.has('PrismaModule')) {
      allElements.push('PrismaModule');
    }

    // Add AuthModule if not exists
    if (!existingModules.has('AuthModule')) {
      allElements.push('AuthModule');
    }

    // Add UsersModule if not exists
    if (!existingModules.has('UsersModule')) {
      allElements.push('UsersModule');
    }

    // Build multi-line array string with each element on its own line
    const indent = '    '; // 4 spaces for array elements inside @Module({})
    const formattedElements = allElements.map(el => `${indent}${el}`).join(',\n');
    const multiLineArray = `[\n${formattedElements},\n  ]`;

    // Replace the entire initializer with the formatted multi-line version
    importsProperty.setInitializer(multiLineArray);
  }

  /**
   * Build TypeORM.forRoot() configuration string based on database type
   */
  private buildTypeOrmConfig(database: string, entities: string): string {
    switch (database) {
      case 'sqlite':
        return `TypeOrmModule.forRoot({\n      type: 'sqlite',\n      database: 'database.sqlite',\n      entities: ${entities},\n      synchronize: true, // WARNING: disable in production!\n    })`;
      case 'mysql':
        return `TypeOrmModule.forRoot({\n      type: 'mysql',\n      host: process.env.DATABASE_HOST || 'localhost',\n      port: parseInt(process.env.DATABASE_PORT || '3306'),\n      username: process.env.DATABASE_USER || 'root',\n      password: process.env.DATABASE_PASSWORD || '',\n      database: process.env.DATABASE_NAME || 'auth_db',\n      entities: ${entities},\n      synchronize: true, // WARNING: disable in production!\n    })`;
      case 'postgres':
      default:
        return `TypeOrmModule.forRoot({\n      type: 'postgres',\n      host: process.env.DATABASE_HOST || 'localhost',\n      port: parseInt(process.env.DATABASE_PORT || '5432'),\n      username: process.env.DATABASE_USER || 'postgres',\n      password: process.env.DATABASE_PASSWORD || 'postgres',\n      database: process.env.DATABASE_NAME || 'auth_db',\n      entities: ${entities},\n      synchronize: true, // WARNING: disable in production!\n    })`;
    }
  }

  /**
   * Get existing module names from imports array
   */
  private getExistingModuleNames(importsArray: Node): Set<string> {
    const moduleNames = new Set<string>();

    if (!Node.isArrayLiteralExpression(importsArray)) {
      return moduleNames;
    }

    for (const element of importsArray.getElements()) {
      const text = element.getText();

      // Extract module name (handle both "ModuleName" and "ModuleName.forRoot(...)")
      const match = text.match(/^(\w+)/);
      if (match) {
        moduleNames.add(match[1]);
      }
    }

    return moduleNames;
  }

  /**
   * Create backup of app.module.ts
   */
  private async createBackup(): Promise<void> {
    this.backupPath = `${this.appModulePath}.backup`;
    await fs.copy(this.appModulePath, this.backupPath);
  }

  /**
   * Restore backup
   */
  private async restoreBackup(): Promise<void> {
    if (this.backupPath && (await fs.pathExists(this.backupPath))) {
      await fs.copy(this.backupPath, this.appModulePath, { overwrite: true });
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
