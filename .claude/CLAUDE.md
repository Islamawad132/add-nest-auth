# Claude Instructions for add-nest-auth

> Comprehensive guide for working with the add-nest-auth CLI tool project

---

## Project Identity

**Name**: add-nest-auth
**Type**: CLI Tool / Code Generator
**Purpose**: Generate production-ready authentication modules for existing NestJS projects
**Target**: NestJS developers who want to quickly add JWT authentication to their applications
**Status**: MVP Complete (v1.0.0) - Ready for npm publish
**Last Updated**: 2026-02-11

---

## Core Concept

This is a **CLI-based code generator** (like `create-react-app`) that:
1. Analyzes an existing NestJS project
2. Asks interactive questions about auth requirements
3. Generates 21+ files from Handlebars templates
4. Safely modifies `app.module.ts` using AST manipulation (ts-morph)
5. Updates `package.json` with auth dependencies
6. Optionally runs `npm install` automatically

**Key Philosophy**: "Add to Existing Project" - Does NOT scaffold new projects, only adds auth to existing NestJS apps.

---

## Project Architecture

### Technology Stack

**Core Libraries**:
- `inquirer` - Interactive CLI prompts
- `chalk` - Terminal colors and formatting
- `ora` - Loading spinners
- `handlebars` - Template engine for code generation
- `ts-morph` - TypeScript AST manipulation (safer than regex)
- `execa` - Shell command execution
- `fs-extra` - Enhanced file operations
- `commander` - CLI argument parsing
- `detect-package-manager` - Auto-detect npm/yarn/pnpm

**Build Tools**:
- `tsup` - Fast TypeScript bundler
- TypeScript 5.x with ES2022 target
- CommonJS output (Node.js compatibility)

### Directory Structure

```
add-nest-auth/
├── .claude/                      # Claude-specific configuration (this directory)
├── bin/
│   └── cli.js                   # Executable entry with shebang
├── src/
│   ├── index.ts                 # Main orchestrator (run function)
│   ├── cli.ts                   # CLI entry with error handling
│   ├── cli/
│   │   ├── prompts.ts          # All Inquirer questions
│   │   ├── ui.ts               # Spinners, banners, colors
│   │   └── index.ts
│   ├── analyzer/
│   │   ├── project-detector.ts  # Validates NestJS projects
│   │   ├── orm-detector.ts      # Detects TypeORM/Prisma/Mongoose
│   │   └── index.ts
│   ├── config/
│   │   ├── config-builder.ts    # Builds configuration from prompts
│   │   └── utils.ts             # Utility functions
│   ├── generator/
│   │   ├── generator.ts         # File generation orchestrator
│   │   ├── template-engine.ts   # Handlebars engine with helpers
│   │   ├── file-writer.ts       # Safe file operations
│   │   ├── templates/           # 25+ Handlebars templates
│   │   │   ├── jwt/            # Auth module templates
│   │   │   ├── rbac/           # Role guards
│   │   │   ├── decorators/     # Custom decorators
│   │   │   ├── dto/            # Validation DTOs
│   │   │   ├── entities/       # TypeORM entities
│   │   │   └── shared/         # .env, README
│   │   └── index.ts
│   ├── installer/
│   │   ├── ast-updater.ts       # ts-morph app.module modifier
│   │   ├── package-updater.ts   # Updates package.json
│   │   ├── dependency-installer.ts # Runs npm/yarn/pnpm
│   │   └── index.ts
│   └── types/
│       ├── config.types.ts      # Configuration interfaces
│       ├── project.types.ts     # Project detection types
│       └── index.ts
├── dist/                         # Build output (CommonJS)
├── PROJECT_MEMORY.md            # Complete development history
├── USAGE.md                     # User documentation
├── README.md                    # Package overview
├── package.json
└── tsconfig.json
```

### Key Design Patterns

1. **Template-Based Generation**
   - All generated files use Handlebars templates
   - Conditional blocks for RBAC, refresh tokens, ORM variations
   - Custom helpers: `eq`, `capitalize`, `camelCase`, `pascalCase`

2. **AST Manipulation (Not Regex)**
   - Uses `ts-morph` for safe code modification
   - Adds imports to `app.module.ts` programmatically
   - Preserves formatting and existing code
   - Rollback capability on errors

3. **Safety-First File Operations**
   - Creates backups before modifications
   - Validates TypeScript syntax after generation
   - Cleanup backups on success
   - Rollback on any error

4. **Progressive Enhancement**
   - Minimal viable generation (JWT only)
   - Optional features via prompts (RBAC, refresh tokens)
   - Extensible template system for future features

---

## Critical Files & Their Roles

### Entry Points
- **`bin/cli.js`** - Executable entry with `#!/usr/bin/env node` shebang (imports from dist/cli.js)
- **`src/cli.ts`** - CLI entry with error handling, no shebang (to avoid build issues)
- **`src/index.ts`** - Main `run()` function that orchestrates the entire flow

### Core Logic
- **`src/cli/prompts.ts`** - ALL Inquirer questions (strategy, RBAC, roles, tokens, JWT config, DB, install)
- **`src/analyzer/project-detector.ts`** - Validates NestJS projects, reads nest-cli.json
- **`src/generator/generator.ts`** - Orchestrates file generation from templates
- **`src/installer/ast-updater.ts`** - **CRITICAL**: Safely modifies app.module.ts using ts-morph

### Templates Location
- **`src/generator/templates/`** - 25+ Handlebars templates
  - **NOT** bundled by tsup by default
  - Copied to `dist/generator/templates/` via `copy-templates` script

---

## Development Practices

### When Making Changes

1. **Template Changes**:
   - Edit templates in `src/generator/templates/`
   - Run `npm run build` to copy to dist
   - Test in a real NestJS project

2. **Code Changes**:
   - Edit TypeScript files in `src/`
   - Run `npm run build` (tsup + copy-templates)
   - Test via `npx . ` from a test NestJS project

3. **AST Changes** (app.module.ts modification):
   - ALWAYS use ts-morph in `src/installer/ast-updater.ts`
   - NEVER use regex/string replacement
   - Test backup/rollback functionality

4. **Prompt Changes**:
   - Edit `src/cli/prompts.ts`
   - Update corresponding types in `src/types/config.types.ts`
   - Update templates if conditional logic changes

### Build Process

```bash
npm run build
```

This runs:
1. `tsup src/index.ts src/cli.ts --format cjs --dts --clean` - Bundle TypeScript
2. `npm run copy-templates` - Copy templates to dist/generator/templates/

**Important**: Templates MUST be copied to dist/ or runtime will fail with "template not found" errors.

### Testing Approach

**Manual Testing Required** (CLI needs interactive terminal):
1. Create a test NestJS project: `nest new test-app`
2. Navigate to test-app: `cd test-app`
3. Run CLI from add-nest-auth: `npx c:\Users\islam\Desktop\learn\add-nest-auth`
4. Follow prompts and verify:
   - All 21 files generated correctly
   - app.module.ts updated without syntax errors
   - package.json dependencies added
   - Generated code has no TypeScript errors
   - Database migrations work (if TypeORM)

**Cannot use Bash tool for full testing** - Inquirer requires TTY (interactive terminal).

---

## What Gets Generated (Output)

### Files Created (21 files)

```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── local-auth.guard.ts
│   │   └── roles.guard.ts (if RBAC)
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts (if RBAC)
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   ├── auth-response.dto.ts
│   │   └── create-user.dto.ts
│   ├── enums/
│   │   └── role.enum.ts (if RBAC)
│   └── README.md
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── entities/
│       ├── user.entity.ts
│       └── refresh-token.entity.ts (if refresh tokens enabled)
└── app.module.ts (MODIFIED - imports added)

.env.example (NEW - with crypto-secure JWT_SECRET)
```

### Files Modified (2 files)

1. **`src/app.module.ts`** - Adds:
   - Import for ConfigModule (from @nestjs/config)
   - Import for AuthModule
   - Import for UsersModule
   - Adds modules to @Module decorator

2. **`package.json`** - Adds ~8 dependencies:
   - @nestjs/jwt
   - @nestjs/passport
   - @nestjs/config
   - @nestjs/typeorm
   - passport
   - passport-jwt
   - passport-local
   - bcrypt
   - class-validator
   - class-transformer

---

## Common Tasks

### Adding a New Template

1. Create template file in `src/generator/templates/{category}/`
2. Use Handlebars syntax with conditionals:
   ```handlebars
   {{#if config.enableRbac}}
   import { Roles } from './decorators/roles.decorator';
   {{/if}}
   ```
3. Update `src/generator/generator.ts` to include new template
4. Run `npm run build` to copy to dist
5. Test generation

### Adding a New Prompt

1. Edit `src/cli/prompts.ts`
2. Add new question to appropriate function
3. Update `AuthConfig` interface in `src/types/config.types.ts`
4. Update templates that use the new config value
5. Test interactive flow

### Adding a New ORM

1. Create new entity templates in `src/generator/templates/entities/`
2. Update `src/analyzer/orm-detector.ts` to detect new ORM
3. Add conditional logic in templates:
   ```handlebars
   {{#if (eq config.orm "neworm")}}
   // NewORM specific code
   {{/if}}
   ```
4. Test with projects using the new ORM

### Modifying AST Logic

1. Edit `src/installer/ast-updater.ts`
2. Use ts-morph API (avoid string manipulation)
3. Test backup/rollback functionality
4. Verify no syntax errors after modification

---

## Known Issues & Limitations

### Current Limitations (MVP)

1. **Interactive Terminal Required** - Cannot run via non-interactive shell
2. **JWT Only** - OAuth and session-based auth coming in v1.1-v1.2
3. **TypeORM Priority** - Prisma/Mongoose support coming in v1.3
4. **No Dry Run** - `--dry-run` flag planned for v1.4
5. **No Force Overwrite** - Must manually delete existing auth/ directory
6. **Manual Testing** - CLI requires manual terminal testing

### Past Issues (Resolved)

1. **Shebang Syntax Error** - Fixed by removing shebang from src/cli.ts, keeping only in bin/cli.js
2. **Templates Not Bundled** - Fixed by adding copy-templates script to build process
3. **Cross-Platform Paths** - Fixed by always using path.join() and fs-extra

---

## Security Considerations

### Generated Code Security Features

- ✅ Password hashing with bcrypt (configurable salt rounds)
- ✅ JWT signing with HS256 algorithm
- ✅ Short-lived access tokens (15m-1h)
- ✅ One-time use refresh tokens with DB storage
- ✅ Input validation with class-validator
- ✅ Crypto-secure JWT_SECRET auto-generation (crypto.randomBytes(32))
- ✅ Type safety throughout

### When Making Changes

- NEVER weaken password hashing
- NEVER expose JWT secrets in generated code
- ALWAYS validate user input in DTOs
- ALWAYS use bcrypt for password comparison
- KEEP token expiration times reasonable

---

## Roadmap & Future Features

### v1.1 - OAuth Integration
- Google, GitHub, Facebook OAuth providers
- Abstract OAuth strategy

### v1.2 - Session-Based Auth
- Express session support
- Cookie-based authentication

### v1.3 - Multi-ORM Support
- Prisma templates (complete set)
- Mongoose templates (complete set)

### v1.4 - CLI Enhancements
- `--dry-run` flag
- `--force` flag
- `--no-install` flag
- Preset configurations (--preset jwt-basic, jwt-rbac)

### v1.5 - Email Verification
- Email verification workflow
- Token-based verification

### v1.6 - Two-Factor Authentication
- TOTP implementation
- QR code generation

### v2.0 - Admin Panel
- Auto-generated admin UI
- User management interface

---

## Code Style & Conventions

### TypeScript
- Strict mode enabled
- No `any` types except where necessary
- Full type coverage
- Interfaces for all configuration
- Type guards for runtime validation

### File Naming
- kebab-case for files: `auth.service.ts`, `jwt-auth.guard.ts`
- PascalCase for classes: `AuthService`, `JwtAuthGuard`
- camelCase for functions and variables

### Error Handling
- Try-catch blocks around all file operations
- Clear error messages with actionable guidance
- Backup/rollback on failures
- Exit codes for scripting

### Comments
- JSDoc for public APIs
- Inline comments for complex logic
- No comments for self-explanatory code

---

## Working with Claude

### When Helping with This Project

1. **Read PROJECT_MEMORY.md First** - Complete development history
2. **Check USAGE.md** - User-facing documentation
3. **Understand Templates** - Most changes affect Handlebars templates
4. **Test Changes** - Always suggest testing in a real NestJS project
5. **Preserve Security** - Never weaken security features
6. **Follow Patterns** - Use AST for code modification, not regex
7. **Update Docs** - If changing functionality, update PROJECT_MEMORY.md and USAGE.md

### Common Requests

1. **"Add a new auth strategy"** → Create new templates, update prompts, update generator
2. **"Support new ORM"** → Create entity templates, update orm-detector, add conditionals
3. **"Fix generation error"** → Check templates, check file-writer, check ast-updater
4. **"Add new feature to generated code"** → Create/modify templates, update config types
5. **"CLI doesn't work"** → Check bin/cli.js shebang, check dist/ exists, check templates copied

### Files to Check When Debugging

- **Generation issues** → `src/generator/generator.ts`, templates
- **Prompt issues** → `src/cli/prompts.ts`
- **app.module.ts errors** → `src/installer/ast-updater.ts`
- **Package issues** → `src/installer/package-updater.ts`
- **Detection issues** → `src/analyzer/project-detector.ts`, `src/analyzer/orm-detector.ts`
- **Build issues** → `package.json` scripts, `tsconfig.json`, `tsup` config

---

## Quick Reference

### Run CLI Locally
```bash
cd c:\Users\islam\Desktop\learn\add-nest-auth
npm run build
# Then from a test NestJS project:
npx c:\Users\islam\Desktop\learn\add-nest-auth
```

### Build & Test
```bash
npm run build          # Build TypeScript + copy templates
npm run dev           # Watch mode
npm test              # Run tests
```

### Project Locations
- **Project Root**: `c:\Users\islam\Desktop\learn\add-nest-auth`
- **Node Version**: >= 18.0.0
- **License**: MIT

---

## Success Criteria

### MVP Completion ✅
- ✅ Installs via npx without errors
- ✅ Detects NestJS projects correctly
- ✅ Generates 21 files in under 2 seconds
- ✅ Generated code has zero TypeScript errors
- ✅ app.module.ts modified without syntax errors
- ✅ Works on Windows (tested)
- ✅ Comprehensive documentation

### Next Milestone
**npm Publish** - Ready to publish to npm registry

---

## References

- **NestJS Docs**: https://docs.nestjs.com/security/authentication
- **Passport.js**: http://www.passportjs.org/
- **ts-morph**: https://ts-morph.com/
- **Inquirer**: https://github.com/SBoudrias/Inquirer.js
- **Handlebars**: https://handlebarsjs.com/

---

**Last Updated**: 2026-02-11
**Maintained By**: add-nest-auth project team
**Claude Version**: For use with Claude Code CLI

---

_This document is the authoritative guide for Claude when working with the add-nest-auth project. Keep it updated when making significant changes._
