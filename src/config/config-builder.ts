/**
 * Build template context from configuration
 */

import { AuthConfig, TemplateContext } from '../types/index.js';

/**
 * Build template context for rendering
 */
export function buildTemplateContext(config: AuthConfig): TemplateContext {
  return {
    ...config,
    // Add any additional computed properties here
  };
}
