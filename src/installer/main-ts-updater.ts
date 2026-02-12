/**
 * AST-based main.ts updater using ts-morph
 * Adds Global JWT Guard and ValidationPipe to the NestJS bootstrap function
 */

import { Project, SourceFile, SyntaxKind, Node, IndentationText } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs-extra';

export class MainTsUpdater {
  private project: Project;
  private sourceFile: SourceFile | undefined;
  private backupPath: string | null = null;

  constructor(private mainTsPath: string) {
    this.project = new Project({
      skipAddingFilesFromTsConfig: true,
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
      },
    });
  }

  /**
   * Update main.ts with global guards and validation pipe
   */
  async update(): Promise<void> {
    // Check if main.ts exists
    if (!await fs.pathExists(this.mainTsPath)) {
      throw new Error(`main.ts not found at ${this.mainTsPath}`);
    }

    // Create backup
    await this.createBackup();

    try {
      // Load source file
      this.sourceFile = this.project.addSourceFileAtPath(this.mainTsPath);

      // Add imports
      this.addImports();

      // Add global guards and pipes to bootstrap function
      this.addGlobalGuardsAndPipes();

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
  private addImports(): void {
    if (!this.sourceFile) {
      throw new Error('Source file not loaded');
    }

    // Add Reflector to @nestjs/core import
    this.addImport('@nestjs/core', ['Reflector']);

    // Add ValidationPipe to @nestjs/common import
    this.addImport('@nestjs/common', ['ValidationPipe']);

    // Add JwtAuthGuard import
    this.addImport('./auth/guards/jwt-auth.guard', ['JwtAuthGuard']);
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
   * Add global guards and validation pipe to bootstrap function
   */
  private addGlobalGuardsAndPipes(): void {
    if (!this.sourceFile) return;

    // Find the bootstrap function
    const bootstrapFunc = this.sourceFile.getFunction('bootstrap');
    if (!bootstrapFunc) {
      throw new Error('bootstrap function not found in main.ts');
    }

    const body = bootstrapFunc.getBody();
    if (!body || !Node.isBlock(body)) {
      throw new Error('bootstrap function has no body');
    }

    // Check if global guards are already added
    const bodyText = body.getText();
    if (bodyText.includes('useGlobalGuards') || bodyText.includes('JwtAuthGuard')) {
      return; // Already configured
    }

    // Find the app.listen statement to insert before it
    const statements = body.getStatements();
    let listenIndex = -1;

    for (let i = 0; i < statements.length; i++) {
      const text = statements[i].getText();
      if (text.includes('.listen(') || text.includes('.listen (')) {
        listenIndex = i;
        break;
      }
    }

    if (listenIndex === -1) {
      // If no listen found, insert at the end
      listenIndex = statements.length;
    }

    // Build the code to insert (no leading spaces - ts-morph handles indentation)
    const codeToInsert = [
      '',
      '// Enable global validation pipe',
      'app.useGlobalPipes(',
      '  new ValidationPipe({',
      '    whitelist: true,',
      '    forbidNonWhitelisted: true,',
      '    transform: true,',
      '  }),',
      ');',
      '',
      '// Enable global JWT guard (all routes protected by default)',
      '// Use @Public() decorator on routes that should be accessible without auth',
      'const reflector = app.get(Reflector);',
      'app.useGlobalGuards(new JwtAuthGuard(reflector));',
      '',
    ].join('\n');

    // Insert at the correct position
    body.insertStatements(listenIndex, codeToInsert);
  }

  /**
   * Create backup of main.ts
   */
  private async createBackup(): Promise<void> {
    this.backupPath = `${this.mainTsPath}.backup`;
    await fs.copy(this.mainTsPath, this.backupPath);
  }

  /**
   * Restore backup
   */
  private async restoreBackup(): Promise<void> {
    if (this.backupPath && (await fs.pathExists(this.backupPath))) {
      await fs.copy(this.backupPath, this.mainTsPath, { overwrite: true });
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
