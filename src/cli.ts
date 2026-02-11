/**
 * CLI entry point
 */

import { run } from './index.js';

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Run the CLI
run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
