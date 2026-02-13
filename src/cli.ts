/**
 * CLI entry point
 */

import { Command } from 'commander';

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

const program = new Command();

program
  .name('nest-authme')
  .description('Add production-ready authentication to any NestJS project')
  .version('1.1.0')
  .option('-y, --yes', 'Skip all prompts and use sensible defaults')
  .option('-g, --gui', 'Launch web-based GUI mode')
  .option('--port <number>', 'Port for GUI server (default: auto)', parseInt)
  .action(async (options) => {
    try {
      // If --gui flag, launch GUI directly
      if (options.gui) {
        const { GuiServer } = await import('./gui/index.js');
        const server = new GuiServer({
          cwd: process.cwd(),
          port: options.port,
          autoOpen: true,
        });
        await server.start();

        process.on('SIGINT', () => {
          server.shutdown();
        });
        return;
      }

      // If --yes flag, run CLI directly
      if (options.yes) {
        const { run } = await import('./index.js');
        await run(process.cwd(), { yes: true });
        return;
      }

      // Interactive mode: ask user to choose CLI or GUI
      const inquirer = (await import('inquirer')).default;
      const { mode } = await inquirer.prompt([{
        type: 'list',
        name: 'mode',
        message: 'Choose your interface:',
        choices: [
          { name: 'CLI  — Terminal-based prompts', value: 'cli' },
          { name: 'GUI  — Web-based visual interface', value: 'gui' },
        ],
        default: 'cli',
      }]);

      if (mode === 'gui') {
        const { GuiServer } = await import('./gui/index.js');
        const server = new GuiServer({
          cwd: process.cwd(),
          port: options.port,
          autoOpen: true,
        });
        await server.start();

        process.on('SIGINT', () => {
          server.shutdown();
        });
      } else {
        const { run } = await import('./index.js');
        await run(process.cwd(), { yes: false });
      }
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  });

program.parse();
