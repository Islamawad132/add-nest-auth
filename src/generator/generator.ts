/**
 * Main code generator orchestrator
 */

import * as path from 'path';
import { AuthConfig, ProjectInfo } from '../types/index.js';
import { TemplateEngine } from './template-engine.js';
import { FileWriter } from './file-writer.js';
import { buildTemplateContext } from '../config/config-builder.js';

export interface GenerationResult {
  filesCreated: string[];
  filesSkipped: string[];
  success: boolean;
  error?: string;
}

export interface FileSpec {
  template: string;
  output: string;
  condition?: (config: AuthConfig) => boolean;
}

export class Generator {
  private templateEngine: TemplateEngine;
  private fileWriter: FileWriter;

  constructor() {
    this.templateEngine = new TemplateEngine();
    this.fileWriter = new FileWriter();
  }

  /**
   * Generate all authentication files
   */
  async generate(
    config: AuthConfig,
    projectInfo: ProjectInfo,
    overwrite: boolean = false
  ): Promise<GenerationResult> {
    try {
      const context = buildTemplateContext(config);
      const plan = this.buildGenerationPlan(config);

      // Generate all files
      for (const fileSpec of plan) {
        // Check condition
        if (fileSpec.condition && !fileSpec.condition(config)) {
          continue;
        }

        // Render template
        const content = await this.templateEngine.render(
          fileSpec.template,
          context
        );

        // Write file
        const outputPath = path.join(projectInfo.root, fileSpec.output);
        await this.fileWriter.writeFile(outputPath, content, {
          overwrite,
        });
      }

      // Get list of created and skipped files
      const filesCreated = this.fileWriter.getWrittenFiles();
      const filesSkipped = this.fileWriter.getSkippedFiles();

      // Cleanup backups
      await this.fileWriter.cleanupBackups();

      return {
        filesCreated,
        filesSkipped,
        success: true,
      };
    } catch (error) {
      // Rollback on error
      await this.fileWriter.rollback();

      return {
        filesCreated: [],
        filesSkipped: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Build file generation plan
   */
  private buildGenerationPlan(config: AuthConfig): FileSpec[] {
    const plan: FileSpec[] = [];

    // Core auth module files
    plan.push(
      { template: 'jwt/auth.module.ts.hbs', output: `${config.sourceRoot}/auth/auth.module.ts` },
      { template: 'jwt/auth.service.ts.hbs', output: `${config.sourceRoot}/auth/auth.service.ts` },
      { template: 'jwt/auth.controller.ts.hbs', output: `${config.sourceRoot}/auth/auth.controller.ts` }
    );

    // Strategies
    plan.push(
      { template: 'jwt/jwt.strategy.ts.hbs', output: `${config.sourceRoot}/auth/strategies/jwt.strategy.ts` },
      { template: 'jwt/local.strategy.ts.hbs', output: `${config.sourceRoot}/auth/strategies/local.strategy.ts` }
    );

    // Guards
    plan.push(
      { template: 'jwt/jwt-auth.guard.ts.hbs', output: `${config.sourceRoot}/auth/guards/jwt-auth.guard.ts` },
      { template: 'jwt/local-auth.guard.ts.hbs', output: `${config.sourceRoot}/auth/guards/local-auth.guard.ts` }
    );

    // RBAC (conditional)
    if (config.rbac.enabled) {
      plan.push(
        { template: 'rbac/roles.guard.ts.hbs', output: `${config.sourceRoot}/auth/guards/roles.guard.ts` },
        { template: 'rbac/role.enum.ts.hbs', output: `${config.sourceRoot}/auth/enums/role.enum.ts` },
        { template: 'decorators/roles.decorator.ts.hbs', output: `${config.sourceRoot}/auth/decorators/roles.decorator.ts` }
      );
    }

    // Decorators
    plan.push(
      { template: 'decorators/public.decorator.ts.hbs', output: `${config.sourceRoot}/auth/decorators/public.decorator.ts` },
      { template: 'decorators/current-user.decorator.ts.hbs', output: `${config.sourceRoot}/auth/decorators/current-user.decorator.ts` }
    );

    // DTOs
    plan.push(
      { template: 'dto/login.dto.ts.hbs', output: `${config.sourceRoot}/auth/dto/login.dto.ts` },
      { template: 'dto/register.dto.ts.hbs', output: `${config.sourceRoot}/auth/dto/register.dto.ts` },
      { template: 'dto/change-password.dto.ts.hbs', output: `${config.sourceRoot}/auth/dto/change-password.dto.ts` },
      { template: 'dto/auth-response.dto.ts.hbs', output: `${config.sourceRoot}/auth/dto/auth-response.dto.ts` },
      { template: 'dto/create-user.dto.ts.hbs', output: `${config.sourceRoot}/auth/dto/create-user.dto.ts` }
    );

    // Reset password DTOs (conditional)
    if (config.features.resetPassword) {
      plan.push(
        { template: 'dto/forgot-password.dto.ts.hbs', output: `${config.sourceRoot}/auth/dto/forgot-password.dto.ts` },
        { template: 'dto/reset-password.dto.ts.hbs', output: `${config.sourceRoot}/auth/dto/reset-password.dto.ts` }
      );
    }

    // Users module
    plan.push(
      { template: 'users/users.module.ts.hbs', output: `${config.sourceRoot}/users/users.module.ts` },
      { template: 'users/users.service.ts.hbs', output: `${config.sourceRoot}/users/users.service.ts` },
      { template: 'users/users.controller.ts.hbs', output: `${config.sourceRoot}/users/users.controller.ts` }
    );

    // Entities / ORM-specific files
    if (config.orm === 'typeorm') {
      plan.push(
        { template: 'entities/user.entity.typeorm.hbs', output: `${config.sourceRoot}/users/entities/user.entity.ts` }
      );

      if (config.features.refreshTokens) {
        plan.push({
          template: 'entities/refresh-token.entity.typeorm.hbs',
          output: `${config.sourceRoot}/users/entities/refresh-token.entity.ts`,
        });
      }
    } else if (config.orm === 'prisma') {
      plan.push(
        { template: 'prisma/prisma.service.ts.hbs', output: `${config.sourceRoot}/prisma/prisma.service.ts` },
        { template: 'prisma/prisma.module.ts.hbs', output: `${config.sourceRoot}/prisma/prisma.module.ts` },
        { template: 'prisma/schema.prisma.additions.hbs', output: 'prisma-schema-additions.prisma' },
      );
    }

    // Unit tests (conditional)
    if (config.features.unitTests) {
      plan.push(
        { template: 'tests/auth.service.spec.ts.hbs', output: `${config.sourceRoot}/auth/auth.service.spec.ts` },
        { template: 'tests/auth.controller.spec.ts.hbs', output: `${config.sourceRoot}/auth/auth.controller.spec.ts` },
      );
    }

    // Configuration files
    plan.push(
      { template: 'shared/env.template.hbs', output: '.env.example' },
      { template: 'shared/env.hbs', output: '.env' },
      { template: 'shared/README.auth.md.hbs', output: `${config.sourceRoot}/auth/README.md` },
      { template: 'shared/main.ts.snippet.hbs', output: 'main.ts.example' }
    );

    return plan;
  }
}
