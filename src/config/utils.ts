/**
 * Configuration utilities
 */

import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure random secret
 */
export function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('base64');
}
