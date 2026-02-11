/**
 * AST-based app.module.ts updater using ts-morph
 */

import { Project, SourceFile, SyntaxKind, Node } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs-extra';

export class AppModuleUpdater {
  private project: Project;
  private sourceFile: SourceFile | undefined;
  private backupPath: string | null = null;

  constructor(private appModulePath: string) {
    this.project = new Project({
      skipAddingFilesFromTsConfig: true,
    });
  }

  /**
   * Update app.module.ts with auth modules
   */
  async update(): Promise<void> {
    // Create backup
    await this.createBackup();

    try {
      // Load source file
      this.sourceFile = this.project.addSourceFileAtPath(this.appModulePath);

      // Add imports
      this.addImports();

      // Add modules to @Module decorator
      this.addModulesToDecorator();

      // Save changes
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
  private addImports(): void {
    if (!this.sourceFile) {
      throw new Error('Source file not loaded');
    }

    // Add ConfigModule import
    this.addImport('@nestjs/config', ['ConfigModule']);

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
  private addModulesToDecorator(): void {
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

    // Get existing module names
    const existingModules = this.getExistingModuleNames(importsArray);

    // Add ConfigModule.forRoot() if not exists
    if (!existingModules.has('ConfigModule')) {
      importsArray.addElement('ConfigModule.forRoot({ isGlobal: true })');
    }

    // Add AuthModule if not exists
    if (!existingModules.has('AuthModule')) {
      importsArray.addElement('AuthModule');
    }

    // Add UsersModule if not exists
    if (!existingModules.has('UsersModule')) {
      importsArray.addElement('UsersModule');
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
