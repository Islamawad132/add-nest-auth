/**
 * Handlebars template engine with helpers
 */

import Handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs-extra';

export class TemplateEngine {
  private handlebars: typeof Handlebars;
  private templateCache: Map<string, HandlebarsTemplateDelegate>;
  private templatesDir: string;

  constructor(templatesDir?: string) {
    this.handlebars = Handlebars.create();
    this.templateCache = new Map();
    this.templatesDir = templatesDir || path.join(__dirname, 'generator', 'templates');
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers(): void {
    // Conditional helpers
    this.handlebars.registerHelper('eq', (a, b) => a === b);
    this.handlebars.registerHelper('ne', (a, b) => a !== b);
    this.handlebars.registerHelper('or', (a, b) => a || b);
    this.handlebars.registerHelper('and', (a, b) => a && b);
    this.handlebars.registerHelper('includes', (arr, item) => arr?.includes(item));

    // String transformation helpers
    this.handlebars.registerHelper('capitalize', (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    this.handlebars.registerHelper('lowercase', (str: string) => {
      if (!str) return '';
      return str.toLowerCase();
    });

    this.handlebars.registerHelper('uppercase', (str: string) => {
      if (!str) return '';
      return str.toUpperCase();
    });

    this.handlebars.registerHelper('camelCase', (str: string) => {
      if (!str) return '';
      return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    });

    this.handlebars.registerHelper('pascalCase', (str: string) => {
      if (!str) return '';
      const camel = str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      return camel.charAt(0).toUpperCase() + camel.slice(1);
    });
  }

  /**
   * Render a template with context
   */
  async render(templatePath: string, context: any): Promise<string> {
    const template = await this.loadTemplate(templatePath);
    return template(context);
  }

  /**
   * Load a template (with caching)
   */
  private async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath)!;
    }

    const fullPath = path.join(this.templatesDir, templatePath);

    if (!await fs.pathExists(fullPath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const source = await fs.readFile(fullPath, 'utf-8');
    const compiled = this.handlebars.compile(source);

    this.templateCache.set(templatePath, compiled);
    return compiled;
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }
}
