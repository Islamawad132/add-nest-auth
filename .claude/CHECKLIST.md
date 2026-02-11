# Development Checklists

> Step-by-step checklists for common tasks in add-nest-auth project

---

## 🆕 Adding a New Template

**Context**: When you want to add a new file to the generated output

- [ ] **Create Template File**
  - [ ] Navigate to appropriate directory in `src/generator/templates/`
  - [ ] Create `.hbs` file with Handlebars syntax
  - [ ] Add conditionals for optional features: `{{#if config.enableRbac}}`
  - [ ] Use template helpers: `{{capitalize}}`, `{{pascalCase}}`, `{{camelCase}}`
  - [ ] Add context variables: `{{config.jwtSecret}}`, `{{config.roles}}`

- [ ] **Update Generator**
  - [ ] Edit `src/generator/generator.ts`
  - [ ] Add `generateFile()` call in appropriate method
  - [ ] Specify correct output path
  - [ ] Add to file count in success message

- [ ] **Update Types (if needed)**
  - [ ] Edit `src/types/config.types.ts` if new config options needed
  - [ ] Update `AuthConfig` interface

- [ ] **Test**
  - [ ] Run `npm run build`
  - [ ] Test in a real NestJS project
  - [ ] Verify file is created with correct content
  - [ ] Verify conditionals work as expected

- [ ] **Update Documentation**
  - [ ] Update README.md file structure section
  - [ ] Update USAGE.md if user-facing
  - [ ] Update PROJECT_MEMORY.md with change notes

---

## ❓ Adding a New Prompt

**Context**: When you want to ask users a new question during CLI execution

- [ ] **Update Prompts**
  - [ ] Edit `src/cli/prompts.ts`
  - [ ] Add new `inquirer` question
  - [ ] Choose appropriate type: `list`, `confirm`, `checkbox`, `input`
  - [ ] Add validation if needed
  - [ ] Set sensible defaults

- [ ] **Update Configuration Types**
  - [ ] Edit `src/types/config.types.ts`
  - [ ] Add new property to `AuthConfig` interface
  - [ ] Add JSDoc comments

- [ ] **Update Config Builder**
  - [ ] Edit `src/config/config-builder.ts`
  - [ ] Map prompt answer to config object

- [ ] **Update Templates**
  - [ ] Modify templates that use the new config value
  - [ ] Add conditionals: `{{#if config.newOption}}`

- [ ] **Test**
  - [ ] Run `npm run build`
  - [ ] Run CLI interactively
  - [ ] Verify prompt appears
  - [ ] Verify answer affects generated code
  - [ ] Test all answer combinations

- [ ] **Update Documentation**
  - [ ] Update USAGE.md prompts section
  - [ ] Update README.md if notable feature
  - [ ] Add to PROJECT_MEMORY.md

---

## 🗄️ Adding Support for New ORM

**Context**: When you want to support Prisma, Mongoose, or other ORMs

- [ ] **Create Entity Templates**
  - [ ] Create directory: `src/generator/templates/entities/{orm}/`
  - [ ] Create `user.entity.{orm}.hbs`
  - [ ] Create `refresh-token.entity.{orm}.hbs` (if applicable)
  - [ ] Adapt to ORM syntax (e.g., Prisma schema, Mongoose model)

- [ ] **Update ORM Detector**
  - [ ] Edit `src/analyzer/orm-detector.ts`
  - [ ] Add detection logic for new ORM
  - [ ] Check for ORM-specific packages in package.json
  - [ ] Add to `SupportedORM` type

- [ ] **Update Generator Logic**
  - [ ] Edit `src/generator/generator.ts`
  - [ ] Add conditionals for new ORM
  - [ ] Route to correct entity templates based on detected ORM

- [ ] **Update Templates**
  - [ ] Add ORM-specific conditionals in service templates
  - [ ] Update import statements based on ORM
  - [ ] Example: `{{#if (eq config.orm "prisma")}}`

- [ ] **Update Dependencies**
  - [ ] Edit `src/installer/package-updater.ts`
  - [ ] Add ORM-specific packages to dependencies list

- [ ] **Test**
  - [ ] Create test project with new ORM
  - [ ] Run CLI and select new ORM
  - [ ] Verify entities generated correctly
  - [ ] Verify ORM-specific code is correct
  - [ ] Test database operations work

- [ ] **Update Documentation**
  - [ ] Update README.md supported ORMs section
  - [ ] Update USAGE.md with ORM-specific instructions
  - [ ] Add to roadmap completion in PROJECT_MEMORY.md

---

## 🔧 Modifying AST Logic (app.module.ts)

**Context**: When you need to change how app.module.ts is modified

- [ ] **Understand Current Logic**
  - [ ] Read `src/installer/ast-updater.ts`
  - [ ] Understand ts-morph API usage
  - [ ] Review backup/rollback mechanism

- [ ] **Make Changes**
  - [ ] Use ts-morph API methods (NEVER regex)
  - [ ] Add new import: `sourceFile.addImportDeclaration()`
  - [ ] Modify decorator: Find @Module, update array
  - [ ] Test edge cases (existing imports, different formatting)

- [ ] **Test Backup/Rollback**
  - [ ] Force an error to test rollback
  - [ ] Verify backup is created before modification
  - [ ] Verify rollback restores original state
  - [ ] Verify cleanup happens on success

- [ ] **Test Different Scenarios**
  - [ ] Fresh NestJS project (minimal app.module.ts)
  - [ ] Complex project (many existing imports)
  - [ ] Already has ConfigModule
  - [ ] Unusual formatting

- [ ] **Update Documentation**
  - [ ] Update PROJECT_MEMORY.md if significant change
  - [ ] Add inline comments for complex logic

---

## 🎨 Adding a New CLI Command

**Context**: When you want to add command-line flags like `--dry-run`

- [ ] **Update CLI Parser**
  - [ ] Edit `src/cli.ts`
  - [ ] Add `commander` option
  - [ ] Example: `.option('--dry-run', 'Preview without creating files')`

- [ ] **Update Configuration**
  - [ ] Add option to config types
  - [ ] Pass through to main `run()` function

- [ ] **Implement Logic**
  - [ ] Edit appropriate module (generator, installer, etc.)
  - [ ] Add conditional logic based on flag
  - [ ] For dry-run: skip actual writes, show what would be done

- [ ] **Test**
  - [ ] Test with flag: `npx add-nest-auth --dry-run`
  - [ ] Test without flag (default behavior)
  - [ ] Verify help text: `npx add-nest-auth --help`

- [ ] **Update Documentation**
  - [ ] Update README.md command-line options
  - [ ] Update USAGE.md with examples
  - [ ] Update PROJECT_MEMORY.md roadmap (if planned feature)

---

## 📝 Pre-Publish Checklist

**Context**: Before publishing to npm registry

- [ ] **Code Quality**
  - [ ] All TypeScript compiles without errors: `npx tsc --noEmit`
  - [ ] No linting errors (if linter configured)
  - [ ] All tests pass: `npm test`
  - [ ] Code follows project conventions

- [ ] **Build**
  - [ ] Clean build: `rm -rf dist && npm run build`
  - [ ] Verify templates copied: `ls dist/generator/templates`
  - [ ] Check dist/ has all necessary files
  - [ ] Verify bin/cli.js has shebang
  - [ ] Verify dist/cli.js does NOT have shebang

- [ ] **Testing**
  - [ ] Test locally via npx: `npx .` from a test NestJS project
  - [ ] Test all prompt paths (yes/no for RBAC, refresh tokens, etc.)
  - [ ] Verify generated code compiles
  - [ ] Test on clean NestJS project (nest new test-app)
  - [ ] Test with existing auth/ directory (should error gracefully)

- [ ] **Version & Metadata**
  - [ ] Update version in package.json (semantic versioning)
  - [ ] Update CHANGELOG.md (if exists) with changes
  - [ ] Verify package.json metadata (author, repository, keywords)
  - [ ] Verify LICENSE file exists and is correct

- [ ] **Documentation**
  - [ ] README.md is up to date
  - [ ] USAGE.md reflects all features
  - [ ] PROJECT_MEMORY.md updated with milestone
  - [ ] All code comments are clear

- [ ] **Security**
  - [ ] Run `npm audit` and fix issues
  - [ ] No credentials or secrets in code
  - [ ] .gitignore excludes sensitive files

- [ ] **npm Package**
  - [ ] Dry run: `npm publish --dry-run`
  - [ ] Review files to be published
  - [ ] Verify .npmignore or "files" in package.json is correct
  - [ ] Check bundle size (should be reasonable)

- [ ] **Publish**
  - [ ] Login to npm: `npm login`
  - [ ] Publish: `npm publish`
  - [ ] Verify on npmjs.com
  - [ ] Test installation: `npx add-nest-auth@latest`

- [ ] **Post-Publish**
  - [ ] Tag release in Git: `git tag v1.0.0 && git push --tags`
  - [ ] Create GitHub release with notes
  - [ ] Share on social media / communities
  - [ ] Monitor for issues

---

## 🐛 Debugging Checklist

**Context**: When something isn't working as expected

- [ ] **Build Issues**
  - [ ] Check `npm run build` completes without errors
  - [ ] Verify `dist/` directory exists and has files
  - [ ] Check templates were copied to `dist/generator/templates/`
  - [ ] Review tsconfig.json settings
  - [ ] Check for tsup errors

- [ ] **Runtime Errors**
  - [ ] Check error message and stack trace
  - [ ] Verify running from correct directory (test NestJS project)
  - [ ] Check Node.js version: `node --version` (>= 18.0.0)
  - [ ] Verify package.json has @nestjs/core
  - [ ] Check for file permission issues

- [ ] **Template Issues**
  - [ ] Verify template file exists in `src/generator/templates/`
  - [ ] Check template syntax (Handlebars)
  - [ ] Test template rendering manually
  - [ ] Verify context object has required properties
  - [ ] Check conditional logic: `{{#if}}`

- [ ] **Generation Issues**
  - [ ] Check file path resolution
  - [ ] Verify source directory detection
  - [ ] Check for existing files (conflict)
  - [ ] Review file-writer.ts logs
  - [ ] Test with fresh NestJS project

- [ ] **AST Modification Issues**
  - [ ] Check app.module.ts syntax after modification
  - [ ] Run `npx tsc --noEmit` in test project
  - [ ] Review backup files (if any)
  - [ ] Check ts-morph logic in ast-updater.ts
  - [ ] Test with different app.module.ts formats

- [ ] **Dependency Issues**
  - [ ] Check package.json updated correctly
  - [ ] Verify versions are compatible
  - [ ] Check if `npm install` runs successfully
  - [ ] Review dependency-installer.ts logs

---

## 🔄 Update Dependencies Checklist

**Context**: When updating project dependencies

- [ ] **Before Updating**
  - [ ] Commit current changes
  - [ ] Run tests: `npm test`
  - [ ] Document current versions

- [ ] **Update Process**
  - [ ] Check outdated: `npm outdated`
  - [ ] Review changelogs for major updates
  - [ ] Update one category at a time (dev deps first)
  - [ ] Run `npm update` for minor/patch updates
  - [ ] For major: `npm install package@latest`

- [ ] **After Each Update**
  - [ ] Run build: `npm run build`
  - [ ] Run tests: `npm test`
  - [ ] Test CLI locally in a NestJS project
  - [ ] Check for deprecation warnings

- [ ] **Critical Dependencies to Test**
  - [ ] `inquirer` - Test all prompts work
  - [ ] `ts-morph` - Test app.module.ts modification
  - [ ] `handlebars` - Test template rendering
  - [ ] `chalk`, `ora` - Test UI elements

- [ ] **Finalize**
  - [ ] Commit updated package.json and lock file
  - [ ] Update PROJECT_MEMORY.md if major changes
  - [ ] Create test build and verify

---

## 📋 Code Review Checklist

**Context**: When reviewing code changes (for yourself or contributors)

- [ ] **Code Quality**
  - [ ] Follows TypeScript best practices
  - [ ] Uses strict typing (no `any` unless necessary)
  - [ ] Functions have clear, single responsibilities
  - [ ] Variable names are descriptive
  - [ ] No commented-out code (unless with explanation)

- [ ] **Security**
  - [ ] No hardcoded secrets or credentials
  - [ ] User input is validated
  - [ ] File operations have error handling
  - [ ] No arbitrary code execution risks

- [ ] **Performance**
  - [ ] No unnecessary loops or redundant operations
  - [ ] Async operations used appropriately
  - [ ] No blocking operations in main thread

- [ ] **Error Handling**
  - [ ] Try-catch blocks around risky operations
  - [ ] Errors provide clear, actionable messages
  - [ ] Rollback mechanisms work
  - [ ] Edge cases are handled

- [ ] **Testing**
  - [ ] Changes have been tested manually
  - [ ] Common use cases work
  - [ ] Edge cases handled correctly
  - [ ] No regressions in existing features

- [ ] **Documentation**
  - [ ] New features documented in USAGE.md
  - [ ] Complex logic has inline comments
  - [ ] README.md updated if user-facing
  - [ ] PROJECT_MEMORY.md updated for significant changes

---

**Last Updated**: 2026-02-11

_Use these checklists to ensure consistency and quality in the add-nest-auth project._
