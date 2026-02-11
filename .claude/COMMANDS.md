# Quick Command Reference

> Fast reference for common commands and workflows when working with add-nest-auth

---

## Build & Development

### Build the Project
```bash
npm run build
```
This runs:
1. `tsup` to bundle TypeScript to CommonJS
2. `npm run copy-templates` to copy templates to dist/

### Watch Mode (Development)
```bash
npm run dev
```
Watches for changes and rebuilds automatically.

### Run Tests
```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
```

---

## Testing the CLI

### Local Testing

**From the add-nest-auth project directory:**

1. Build first:
```bash
npm run build
```

2. Create a test NestJS project (if you don't have one):
```bash
cd ..
nest new test-nestjs-app
cd test-nestjs-app
```

3. Run the CLI from your test project:
```bash
npx c:\Users\islam\Desktop\learn\add-nest-auth
```

### Test via npx (simulating user experience)

**From any directory:**
```bash
npx add-nest-auth
```
(This will download from npm once published)

---

## Template Development

### Add a New Template

1. Create template in `src/generator/templates/{category}/`:
```bash
# Example: Add a new decorator
# Create: src/generator/templates/decorators/my-decorator.decorator.ts.hbs
```

2. Update generator to include it:
```typescript
// In src/generator/generator.ts
await this.generateFile('decorators/my-decorator.decorator.ts', context);
```

3. Rebuild:
```bash
npm run build
```

4. Test in a NestJS project

### Template Syntax

**Conditionals:**
```handlebars
{{#if config.enableRbac}}
  // RBAC-specific code
{{/if}}
```

**Equality Check:**
```handlebars
{{#if (eq config.orm "typeorm")}}
  // TypeORM-specific code
{{/if}}
```

**Custom Helpers:**
```handlebars
{{capitalize config.strategy}}  // JWT -> Jwt
{{pascalCase config.strategy}}  // jwt -> Jwt
{{camelCase config.strategy}}   // JWT -> jwt
```

---

## Project Structure Commands

### View Project Structure
```bash
# From project root
tree src /F    # Windows
tree -L 3 src  # Unix/Mac
```

### Find Files
```bash
# Find all TypeScript files
dir /s /b *.ts    # Windows
find . -name "*.ts"  # Unix/Mac

# Find templates
dir /s /b *.hbs    # Windows
find . -name "*.hbs"  # Unix/Mac
```

### Count Lines of Code
```bash
# Windows
powershell "Get-ChildItem -Recurse -Include *.ts | Get-Content | Measure-Object -Line"

# Unix/Mac
find . -name "*.ts" | xargs wc -l
```

---

## Debugging

### Check if Templates are Copied
```bash
# After npm run build, check:
dir dist\generator\templates /s    # Windows
ls -R dist/generator/templates     # Unix/Mac
```

Should show:
- dist/generator/templates/jwt/
- dist/generator/templates/rbac/
- dist/generator/templates/decorators/
- etc.

### Test Template Rendering (Manual)

Create a test script `test-template.js`:
```javascript
const Handlebars = require('handlebars');
const fs = require('fs');

const template = fs.readFileSync('./src/generator/templates/auth/auth.module.ts.hbs', 'utf-8');
const compiled = Handlebars.compile(template);

const result = compiled({
  config: {
    enableRbac: true,
    enableRefreshTokens: true,
    jwtSecret: 'test-secret',
    // ... other config
  }
});

console.log(result);
```

Run:
```bash
node test-template.js
```

### Check AST Modifications

After running CLI on a test project, check:
```bash
# View modified app.module.ts
cat src/app.module.ts

# Check for syntax errors
npx tsc --noEmit
```

---

## Git Workflow

### Commit Changes
```bash
git add .
git commit -m "feat: add new template for X"
git push
```

### Create a Feature Branch
```bash
git checkout -b feature/add-oauth-support
# Make changes
git add .
git commit -m "feat: add OAuth templates"
git push -u origin feature/add-oauth-support
```

---

## Publishing to npm

### Pre-publish Checklist

1. Update version in `package.json`
2. Update CHANGELOG.md (if exists)
3. Run tests: `npm test`
4. Build: `npm run build`
5. Test locally in a real NestJS project
6. Update README.md if needed

### Publish Commands

```bash
# Dry run (see what would be published)
npm publish --dry-run

# Publish (first time)
npm publish

# Publish with tag
npm publish --tag beta
```

### Verify Published Package
```bash
npm view add-nest-auth
npm info add-nest-auth
```

---

## Maintenance Commands

### Update Dependencies
```bash
npm outdated                    # Check for outdated packages
npm update                      # Update to latest minor versions
npm install package@latest      # Update specific package to latest major
```

### Clean Install
```bash
rm -rf node_modules package-lock.json
npm install
```

### Audit Security
```bash
npm audit                       # Check for vulnerabilities
npm audit fix                   # Auto-fix vulnerabilities
```

---

## Useful Checks

### Validate package.json
```bash
npm pkg get name version
npm pkg set version 1.0.1
```

### Check Executables
```bash
# Check bin entry works
npm link                        # Link globally
add-nest-auth --version        # Test command
npm unlink                     # Unlink when done
```

### Verify Build Output
```bash
# After npm run build, check:
dir dist                       # Should have cli.js, index.js, types
type dist\cli.js              # Check for shebang (should NOT be present)
type bin\cli.js               # Check for shebang (SHOULD be present)
```

---

## Environment Setup

### Required Globals
```bash
npm install -g @nestjs/cli      # For testing with nest new
npm install -g typescript       # TypeScript compiler
```

### Node Version
```bash
node --version                  # Should be >= 18.0.0
npm --version
```

---

## Documentation Updates

### After Making Changes

Update these files as needed:
- `PROJECT_MEMORY.md` - Add to development history
- `USAGE.md` - Update user-facing docs
- `README.md` - Update if changing features
- `.claude/CLAUDE.md` - Update if changing architecture

---

## Quick Troubleshooting

### "Template not found" error
```bash
# Fix: Rebuild to copy templates
npm run build
```

### "Invalid or unexpected token" (shebang error)
```bash
# Check: src/cli.ts should NOT have shebang
# Check: bin/cli.js SHOULD have shebang
```

### "Module not found"
```bash
# Fix: Install dependencies
npm install
```

### CLI doesn't accept input
```bash
# Cause: Running in non-interactive shell
# Fix: Run in actual terminal (not via Bash tool)
```

---

**Last Updated**: 2026-02-11

_This is a living document. Add new commands as you discover useful workflows._
