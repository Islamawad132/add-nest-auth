/**
 * Main CLI orchestrator
 */

import { detectProject } from './analyzer/index.js';
import { promptConfig, buildConfig, getDefaultAnswers } from './cli/prompts.js';
import {
  showBanner,
  showProjectInfo,
  showError,
  showNestJSHelp,
  showSuccess,
  createSpinner,
} from './cli/ui.js';

export interface RunOptions {
  yes?: boolean;
}

export async function run(cwd: string = process.cwd(), options: RunOptions = {}): Promise<void> {
  // Show banner
  showBanner();

  // Analyze project
  const spinner = createSpinner('Analyzing project...').start();

  const projectInfo = await detectProject(cwd);

  if (!projectInfo.isValid) {
    spinner.fail('Project validation failed');
    showError('Not a valid NestJS project', projectInfo.errors);
    showNestJSHelp();
    process.exit(1);
  }

  spinner.succeed('Project analyzed');

  // Show detected info
  showProjectInfo({
    nestVersion: projectInfo.nestVersion,
    orm: projectInfo.orm,
    sourceRoot: projectInfo.sourceRoot,
  });

  // Check if auth module already exists
  if (projectInfo.authExists) {
    if (options.yes) {
      console.log('\n  auth/ directory already exists. Use interactive mode to overwrite.\n');
      process.exit(0);
    }
    const inquirer = (await import('inquirer')).default;
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: 'auth/ directory already exists. Overwrite existing files?',
      default: false,
    }]);
    if (!overwrite) {
      console.log('\n⏭️  Cancelled. Existing auth module unchanged.\n');
      process.exit(0);
    }
  }

  // Prompt for configuration (or use defaults with --yes)
  const answers = options.yes
    ? getDefaultAnswers(projectInfo.orm, projectInfo.database)
    : await promptConfig(projectInfo.orm, projectInfo.database);

  // Build configuration
  const config = buildConfig(
    answers,
    projectInfo.root.split(/[/\\]/).pop() || 'project',
    projectInfo.sourceRoot,
    projectInfo.orm,
    projectInfo.database
  );

  console.log();
  console.log('⚙️  Generating authentication module...');
  console.log();

  // Generate files
  const { Generator } = await import('./generator/index.js');
  const generator = new Generator();

  const genSpinner = createSpinner('Generating files from templates...').start();

  const result = await generator.generate(config, projectInfo, !!projectInfo.authExists);

  if (!result.success) {
    genSpinner.fail('Generation failed');
    showError('Failed to generate files', [result.error || 'Unknown error']);
    process.exit(1);
  }

  genSpinner.succeed(`Generated ${result.filesCreated.length} files`);

  if (result.filesSkipped.length > 0) {
    console.log(`  ⚠️  Skipped ${result.filesSkipped.length} existing file(s)`);
  }

  // Update app.module.ts with AST
  const astSpinner = createSpinner('Updating app.module.ts...').start();

  try {
    const { AppModuleUpdater } = await import('./installer/index.js');
    const astUpdater = new AppModuleUpdater(projectInfo.appModulePath);
    await astUpdater.update(config);
    await astUpdater.cleanupBackup();
    astSpinner.succeed('Updated app.module.ts');
  } catch (error) {
    astSpinner.fail('Failed to update app.module.ts');
    showError(
      'AST modification failed',
      [error instanceof Error ? error.message : 'Unknown error']
    );
    process.exit(1);
  }

  // Update main.ts with global guards
  const mainSpinner = createSpinner('Updating main.ts with global guards...').start();

  try {
    const { MainTsUpdater } = await import('./installer/index.js');
    const mainUpdater = new MainTsUpdater(projectInfo.mainTsPath);
    await mainUpdater.update(config);
    await mainUpdater.cleanupBackup();
    mainSpinner.succeed('Updated main.ts with global JWT guard');
  } catch (error) {
    mainSpinner.warn('Could not auto-update main.ts (see main.ts.example for manual setup)');
  }

  // Update package.json
  const pkgSpinner = createSpinner('Updating package.json...').start();

  try {
    const { PackageUpdater } = await import('./installer/index.js');
    const pkgUpdater = new PackageUpdater(projectInfo.packageJsonPath);
    await pkgUpdater.update(config);
    await pkgUpdater.cleanupBackup();
    pkgSpinner.succeed('Updated package.json');
  } catch (error) {
    pkgSpinner.fail('Failed to update package.json');
    showError(
      'Package update failed',
      [error instanceof Error ? error.message : 'Unknown error']
    );
    process.exit(1);
  }

  // Install dependencies
  if (config.autoInstall) {
    const installSpinner = createSpinner('Installing dependencies...').start();

    try {
      const { DependencyInstaller } = await import('./installer/index.js');
      const installer = new DependencyInstaller();
      await installer.install(projectInfo.root);
      installSpinner.succeed('Dependencies installed');
    } catch (error) {
      installSpinner.fail('Failed to install dependencies');
      console.log(
        '\n⚠️  Please run npm install manually to install dependencies\n'
      );
    }
  }

  // Show success message
  showSuccess({
    filesCreated: result.filesCreated.length,
    dependenciesAdded: 8,
    jwt: {
      accessExpiration: config.jwt.accessExpiration,
      refreshExpiration: config.features.refreshTokens
        ? config.jwt.refreshExpiration
        : undefined,
    },
    orm: config.orm,
    swagger: config.features.swagger,
    emailVerification: config.features.emailVerification,
    resetPassword: config.features.resetPassword,
  });

  console.log('🐛 Issues? https://github.com/Islamawad132/add-nest-auth/issues');
  console.log('⭐ Like it? https://github.com/Islamawad132/add-nest-auth');
  console.log();
}
