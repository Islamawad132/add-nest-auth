# .claude Directory

> Configuration and documentation for Claude Code when working with add-nest-auth project

---

## What is This?

This directory contains Claude-specific configuration files that help me (Claude) understand your project better, work more effectively, and maintain consistency when helping with development tasks.

## Files in This Directory

### 📘 CLAUDE.md (Main Reference)
**The authoritative guide for Claude when working with this project.**

Contains:
- Complete project overview and architecture
- Technology stack and design patterns
- Directory structure and file purposes
- Development practices and conventions
- Security considerations
- Common tasks and workflows
- Known issues and limitations
- Roadmap and future features

**When to reference**: Always read this first when starting work on the project.

---

### 🚫 .claudeignore
**Files and directories to ignore when searching or reading.**

Contains patterns for:
- node_modules/
- Build outputs (dist/, build/)
- Lock files
- IDE configurations
- OS-specific files
- Cache directories
- Environment files

**Purpose**: Speeds up file searches and prevents reading irrelevant files.

---

### ⚡ COMMANDS.md
**Quick reference for common commands and workflows.**

Contains:
- Build and development commands
- Testing procedures
- Template development workflow
- Debugging commands
- Git workflow
- Publishing to npm
- Maintenance tasks

**When to reference**: When you need to know how to build, test, or deploy.

---

### ✅ CHECKLIST.md
**Step-by-step checklists for common development tasks.**

Contains checklists for:
- Adding new templates
- Adding new prompts
- Supporting new ORMs
- Modifying AST logic
- Adding CLI commands
- Pre-publish tasks
- Debugging
- Updating dependencies
- Code review

**When to reference**: When performing specific development tasks to ensure nothing is missed.

---

## How Claude Uses These Files

### On Initial Interaction
1. Read CLAUDE.md for project context
2. Review .claudeignore to know what to skip
3. Reference COMMANDS.md for how to run things
4. Use CHECKLIST.md for task guidance

### During Development
- **Making changes**: Follow patterns in CLAUDE.md
- **Running commands**: Reference COMMANDS.md
- **Completing tasks**: Use CHECKLIST.md
- **Searching code**: .claudeignore filters noise

### For Specific Tasks
- **Adding feature**: CHECKLIST.md → "Adding a New Template"
- **Fixing bug**: CHECKLIST.md → "Debugging Checklist"
- **Publishing**: CHECKLIST.md → "Pre-Publish Checklist"
- **Building**: COMMANDS.md → "Build & Development"

---

## Benefits

### For You (Developer)
- ✅ Consistent help from Claude across sessions
- ✅ Claude remembers project context and conventions
- ✅ Faster onboarding when returning to project
- ✅ Reduced need to explain project structure repeatedly

### For Claude
- ✅ Complete understanding of project architecture
- ✅ Knowledge of development practices and patterns
- ✅ Awareness of known issues and limitations
- ✅ Ability to provide context-aware suggestions

---

## Maintaining These Files

### When to Update

**CLAUDE.md** - Update when:
- Architecture changes significantly
- New major features added
- Development practices evolve
- Dependencies change
- Roadmap shifts

**COMMANDS.md** - Update when:
- New commands added
- Build process changes
- New workflows discovered
- Scripts modified

**CHECKLIST.md** - Update when:
- New task types emerge
- Process improvements discovered
- Common pitfalls identified
- Best practices evolve

**.claudeignore** - Update when:
- New directories should be ignored
- Build outputs change
- IDE configurations change

### How to Update
1. Make changes to relevant file
2. Keep formatting consistent
3. Update "Last Updated" date at bottom
4. Test Claude's understanding with questions

---

## Example Usage Scenarios

### Scenario 1: Adding OAuth Support
**You**: "I want to add Google OAuth support"

**Claude**:
1. Reads CLAUDE.md → Sees v1.1 roadmap item for OAuth
2. Checks CHECKLIST.md → Follows "Adding a New Template"
3. References COMMANDS.md → Knows build process
4. Creates templates, updates prompts, builds, tests

---

### Scenario 2: Fixing a Bug
**You**: "Templates aren't being found at runtime"

**Claude**:
1. Reads CLAUDE.md → Sees "Past Issues (Resolved)" about template bundling
2. Checks CHECKLIST.md → Follows "Debugging Checklist"
3. References COMMANDS.md → Runs diagnostic commands
4. Identifies issue: templates not copied during build
5. Suggests fix: Check copy-templates script

---

### Scenario 3: Preparing for Release
**You**: "Let's publish v1.1 to npm"

**Claude**:
1. Checks CHECKLIST.md → Follows "Pre-Publish Checklist"
2. References COMMANDS.md → Knows publish commands
3. Reads CLAUDE.md → Verifies v1.1 features complete
4. Goes through each checklist item systematically
5. Helps execute publish process safely

---

## Best Practices

### For Developers
- Keep files updated as project evolves
- Reference these files when asking Claude for help
- Add new checklists when you discover patterns
- Document lessons learned in CLAUDE.md

### For Claude
- Always read CLAUDE.md first in new sessions
- Reference checklists for systematic work
- Suggest updates to these files when needed
- Follow conventions documented here

---

## File Relationships

```
.claude/
├── README.md (this file)    → Overview and index
├── CLAUDE.md                → Main reference (read this first)
├── .claudeignore            → Filter noise when searching
├── COMMANDS.md              → How to run things
└── CHECKLIST.md             → How to complete tasks

External references:
├── PROJECT_MEMORY.md        → Complete development history
├── USAGE.md                 → User-facing documentation
└── README.md                → Package overview
```

---

## Version History

**v1.0.0** (2026-02-11)
- Initial creation of .claude directory
- Added CLAUDE.md with comprehensive project documentation
- Added .claudeignore for file filtering
- Added COMMANDS.md for quick command reference
- Added CHECKLIST.md for task workflows
- Added README.md (this file) as directory overview

---

## Questions?

If Claude seems confused about the project:
1. Ask Claude to read `.claude/CLAUDE.md`
2. Point to specific sections: "Check the Architecture section"
3. Ask for clarification: "What do you understand about X?"

If these files are missing information:
1. Add it to the appropriate file
2. Keep formatting consistent
3. Update "Last Updated" date
4. Consider if other files need updates too

---

**Last Updated**: 2026-02-11
**Project**: add-nest-auth v1.0.0
**Location**: `c:\Users\islam\Desktop\learn\add-nest-auth\.claude\`

---

_These files are your project's "instruction manual" for Claude. Keep them accurate and up-to-date!_
