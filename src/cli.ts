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
  .action(async (options) => {
    try {
      const { run } = await import('./index.js');
      await run(process.cwd(), { yes: options.yes || false });
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  });

program.parse();
