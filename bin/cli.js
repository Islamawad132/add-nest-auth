#!/usr/bin/env node

/**
 * CLI executable wrapper
 * This file is used when running via npm/npx
 */

import('../dist/cli.js').catch((error) => {
  console.error('Failed to load CLI:', error);
  process.exit(1);
});
