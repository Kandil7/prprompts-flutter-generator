# DEVELOPMENT.md

## Contributing to PRPROMPTS Flutter Generator

Welcome to the PRPROMPTS development guide! This document will help you get started with contributing to the project.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Adding New Features](#adding-new-features)
- [Testing Guidelines](#testing-guidelines)
- [Code Style and Standards](#code-style-and-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Extension Development](#extension-development)
- [Debugging Tips](#debugging-tips)
- [Release Process](#release-process)

---

## Getting Started

### Prerequisites

- **Node.js**: v18 or v20 (LTS recommended)
- **npm**: v9 or higher
- **Git**: Latest version
- **Text Editor**: VS Code recommended

### Initial Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/prprompts-flutter-generator.git
   cd prprompts-flutter-generator
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Test Installation**
   ```bash
   npm test
   node bin/prprompts --version
   ```

4. **Install Locally for Testing**
   ```bash
   npm install -g .
   prprompts --version
   ```

---

## Development Workflow

### Daily Development Cycle

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Edit code in `scripts/` or `prompts/`
   - Update documentation if needed
   - Add tests for new features

3. **Test Locally**
   ```bash
   npm test
   npm install -g .
   prprompts create  # Test your changes
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Testing Your Changes

**Quick Test:**
```bash
# Test command availability
prprompts --help
prprompts --version

# Test PRD creation
mkdir test-project
cd test-project
prprompts create
```

**Comprehensive Test:**
```bash
# Run validation tests
npm test

# Test on different platforms
# Windows:
scripts\test-commands.bat

# Unix (Linux/macOS):
bash scripts/test-commands.sh
```

---

## Project Structure

```
prprompts-flutter-generator/
├── bin/
│   └── prprompts              # Main CLI entry point
├── scripts/
│   ├── create-prd.js          # PRD creation logic
│   ├── generate-prprompts.js  # PRPROMPTS generation
│   ├── postinstall.js         # Extension auto-installation
│   └── test-*.sh/bat          # Test scripts
├── prompts/
│   ├── core/                  # Core 32 PRPROMPTS files
│   └── automation/            # v4.0 automation prompts
├── examples/
│   └── healthcare-prd.md      # Example PRD
├── docs/
│   ├── PRPROMPTS-SPECIFICATION.md
│   └── AUTOMATION-GUIDE.md
├── .github/
│   └── workflows/             # CI/CD pipelines
├── *-extension.json           # Extension manifests
└── install-*-extension.sh     # Extension installers
```

### Key Files

| File | Purpose |
|------|---------|
| `bin/prprompts` | CLI dispatcher - routes commands |
| `scripts/create-prd.js` | Handles PRD creation (4 methods) |
| `scripts/generate-prprompts.js` | Generates 32 PRPROMPTS files |
| `scripts/postinstall.js` | Auto-installs extensions post-npm-install |
| `prompts/core/*.md` | 32 PRPROMPTS templates (PRP pattern) |
| `prompts/automation/*.md` | v4.0 automation commands |

---

## Adding New Features

### Adding a New PRPROMPTS File

1. **Create the File**
   ```bash
   # Create in prompts/core/
   touch prompts/core/33-new-feature.md
   ```

2. **Use PRP Pattern**
   ```markdown
   # {Feature Name}

   ## Purpose
   What this prompt achieves...

   ## Requirements
   - Requirement 1
   - Requirement 2

   ## Prompt
   Detailed instructions...

   ## Response Structure
   Expected output format...

   ## Validation
   How to verify the output...

   ## Notes
   Additional context...
   ```

3. **Update Generator**
   ```javascript
   // In scripts/generate-prprompts.js
   const PRPROMPTS = [
     // ... existing prompts
     { id: 33, file: 'new-feature.md', name: 'New Feature' }
   ];
   ```

4. **Add Tests**
   ```bash
   # In scripts/test-validation.sh
   test_file "33-new-feature.md"
   ```

### Adding a New Automation Command

1. **Create Automation Prompt**
   ```bash
   touch prompts/automation/new-command.md
   ```

2. **Update Extension Manifests**
   ```json
   // In claude-extension.json, qwen-extension.json, gemini-extension.json
   {
     "commands": [
       {
         "name": "/prp-new-command",
         "description": "Description of new command",
         "file": "automation/new-command.md"
       }
     ]
   }
   ```

3. **Update Documentation**
   - Add to `docs/AUTOMATION-GUIDE.md`
   - Update `CLAUDE.md`, `QWEN.md`, `GEMINI.md`

### Adding Support for New AI Assistant

1. **Create Extension Manifest**
   ```bash
   touch newai-extension.json
   ```

   ```json
   {
     "name": "PRPROMPTS NewAI Extension",
     "version": "4.0.0",
     "ai": "newai",
     "commands": [
       {
         "name": "/prp-create",
         "description": "Create new PRD interactively",
         "file": "core/01-prd-creation-interactive.md"
       }
       // ... all 32 + 5 commands
     ]
   }
   ```

2. **Create Installer Script**
   ```bash
   touch install-newai-extension.sh
   chmod +x install-newai-extension.sh
   ```

3. **Update Postinstall**
   ```javascript
   // In scripts/postinstall.js
   const AI_ASSISTANTS = ['claude', 'qwen', 'gemini', 'newai'];
   ```

4. **Create Documentation**
   ```bash
   touch NEWAI.md
   ```

5. **Update README**
   - Add NewAI to extension list
   - Update installation instructions

---

## Testing Guidelines

### Running Tests

**Unit Tests:**
```bash
npm test
```

**Integration Tests:**
```bash
# Test all commands work
bash scripts/test-commands.sh       # Unix
scripts\test-commands.bat            # Windows

# Test validation
bash scripts/test-validation.sh
```

**Manual Testing:**
```bash
# Install locally
npm install -g .

# Test commands
prprompts create
prprompts generate
prprompts from-files
prprompts validate
```

### Writing Tests

**For New Features:**
```bash
# Add to scripts/test-validation.sh
test_prprompts_file() {
  local file=$1
  if [ -f "prompts/core/$file" ]; then
    echo "✓ $file exists"
  else
    echo "✗ $file missing"
    exit 1
  fi
}
```

**For Extension Commands:**
```bash
# Add to scripts/test-commands.sh
test_command() {
  local cmd=$1
  if prprompts $cmd --help >/dev/null 2>&1; then
    echo "✓ prprompts $cmd works"
  else
    echo "✗ prprompts $cmd failed"
    exit 1
  fi
}
```

---

## Code Style and Standards

### JavaScript

- **ES6+**: Use modern JavaScript features
- **Async/Await**: Prefer over callbacks
- **Error Handling**: Always handle errors gracefully
- **Comments**: Document complex logic

**Example:**
```javascript
async function createPRD(options) {
  try {
    // Validate inputs
    if (!options.name) {
      throw new Error('Project name required');
    }

    // Execute logic
    const prd = await generatePRD(options);

    // Return result
    return prd;
  } catch (error) {
    console.error('Failed to create PRD:', error.message);
    process.exit(1);
  }
}
```

### Markdown

- **Headers**: Use ATX style (`#` not `===`)
- **Lists**: Use `-` for unordered lists
- **Code Blocks**: Always specify language
- **Line Length**: No strict limit (MD013: false)

**Example:**
```markdown
## Section Title

### Subsection

- Item 1
- Item 2

```bash
# Code example
npm install
```
```

### Shell Scripts

- **Shebang**: Always include `#!/bin/bash` or `#!/bin/sh`
- **Error Handling**: Use `set -e` to exit on errors
- **Variables**: Quote all variables (`"$var"` not `$var`)
- **Functions**: Use lowercase with underscores

**Example:**
```bash
#!/bin/bash
set -e

test_command() {
  local cmd="$1"
  if ! command -v "$cmd" &> /dev/null; then
    echo "Error: $cmd not found"
    return 1
  fi
  echo "✓ $cmd available"
}
```

---

## Commit Guidelines

### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

**Feature:**
```
feat: add Gemini CLI extension support

- Create gemini-extension.json manifest
- Add install-gemini-extension.sh installer
- Update postinstall.js to include Gemini
- Add GEMINI.md documentation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Bug Fix:**
```
fix: resolve PRD creation path issue on Windows

- Normalize paths using path.join()
- Handle Windows backslashes in file paths
- Add Windows-specific test case

Fixes #123
```

**Documentation:**
```
docs: update AUTOMATION-GUIDE with qa-check command

- Add qa-check command documentation
- Include example output
- Update workflow diagram
```

---

## Pull Request Process

### Before Submitting

1. **Update from main**
   ```bash
   git checkout master
   git pull origin master
   git checkout your-branch
   git rebase master
   ```

2. **Run Tests**
   ```bash
   npm test
   bash scripts/test-commands.sh
   ```

3. **Update Documentation**
   - Update README.md if needed
   - Update CHANGELOG.md
   - Add JSDoc comments

4. **Lint Your Code**
   ```bash
   # Markdown
   markdownlint '**/*.md' --config .markdownlint.json

   # Shell scripts
   shellcheck scripts/*.sh
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Breaking change

## Testing
- [ ] All tests pass (`npm test`)
- [ ] Tested on Windows
- [ ] Tested on Linux/macOS
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No breaking changes (or documented)

## Screenshots (if applicable)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: Maintainer reviews your code
3. **Feedback**: Address any requested changes
4. **Approval**: PR merged once approved

---

## Extension Development

### Extension Architecture

Each AI extension consists of:

1. **Extension Manifest** (`*-extension.json`)
   - Metadata (name, version, AI)
   - Command definitions
   - File paths

2. **Installer Script** (`install-*-extension.sh`)
   - Detects config path
   - Copies prompts
   - Generates commands
   - Updates config

3. **Documentation** (`*.md`)
   - Installation guide
   - Command reference
   - Examples

### Creating Extension Manifest

```json
{
  "name": "PRPROMPTS Claude Extension",
  "version": "4.0.0",
  "ai": "claude",
  "description": "Complete PRPROMPTS integration for Claude Code",
  "commands": [
    {
      "name": "/prp-create",
      "description": "Create PRD interactively",
      "file": "core/01-prd-creation-interactive.md",
      "category": "prd-creation"
    }
  ],
  "installation": {
    "configPath": "~/.config/claude/prompts/",
    "commandsPath": "~/.config/claude/commands/"
  }
}
```

### Testing Extensions

1. **Install Locally**
   ```bash
   bash install-claude-extension.sh
   ```

2. **Verify Installation**
   ```bash
   # Claude Code
   ls ~/.config/claude/prompts/prprompts/
   ls ~/.config/claude/commands/

   # Qwen Code
   ls ~/.qwen/prompts/prprompts/

   # Gemini CLI
   ls ~/.gemini/prompts/prprompts/
   ```

3. **Test Commands**
   ```bash
   # In your AI assistant
   /prp-create
   /prp-auto
   /prp-bootstrap
   ```

---

## Debugging Tips

### Common Issues

**Issue: Command not found**
```bash
# Check PATH
echo $PATH

# Reinstall globally
npm uninstall -g prprompts-flutter-generator
npm install -g .
```

**Issue: Extension not loading**
```bash
# Check config path
ls ~/.config/claude/prompts/prprompts/
ls ~/.config/claude/commands/

# Reinstall extension
bash install-claude-extension.sh
```

**Issue: Tests failing**
```bash
# Clean and reinstall
rm -rf node_modules
npm install
npm test
```

### Debug Mode

Add debugging output:
```javascript
// In scripts/
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('Debug: Variable value:', variable);
}
```

Run with debug:
```bash
DEBUG=true prprompts create
```

---

## Release Process

### Version Bumping

1. **Update Version**
   ```bash
   npm version patch  # 4.0.0 -> 4.0.1
   npm version minor  # 4.0.0 -> 4.1.0
   npm version major  # 4.0.0 -> 5.0.0
   ```

2. **Update CHANGELOG.md**
   ```markdown
   ## [4.0.1] - 2025-10-18
   ### Fixed
   - Bug fix description
   ```

3. **Update Extension Versions**
   - Update all `*-extension.json` version fields
   - Update documentation version references

### Publishing to npm

**Manual Publish:**
```bash
# Login to npm
npm login

# Dry run
npm pack --dry-run

# Publish
npm publish --access public
```

**Automated Publish (via GitHub Actions):**
```bash
# Create version tag
git tag v4.0.1
git push origin v4.0.1

# GitHub Actions will:
# 1. Run tests
# 2. Verify package
# 3. Publish to npm
# 4. Create GitHub release
```

### Post-Release

1. **Verify npm Package**
   ```bash
   npm view prprompts-flutter-generator@4.0.1
   npm install -g prprompts-flutter-generator@4.0.1
   ```

2. **Update Documentation**
   - Update README.md with new version
   - Update social media posts
   - Announce on Dev.to, Medium, Hashnode

3. **GitHub Release**
   - Add release notes
   - Attach binaries if needed
   - Link to CHANGELOG.md

---

## Getting Help

### Resources

- **Documentation**: `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)

### Community

- **Discord**: [Coming Soon]
- **Twitter**: [@prprompts]
- **Email**: support@prprompts.com

---

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines

---

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

**Thank you for contributing to PRPROMPTS!**

Your contributions help make Flutter development easier for everyone.
