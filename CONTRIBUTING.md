# Contributing to PRPROMPTS

Thank you for your interest in contributing to PRPROMPTS! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Standards](#documentation-standards)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Community Guidelines](#community-guidelines)
- [Recognition](#recognition)

---

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## How Can I Contribute?

There are many ways to contribute to PRPROMPTS:

### 🐛 Reporting Bugs

**Before submitting a bug report:**
- Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- Search [existing issues](https://github.com/Kandil7/prprompts-flutter-generator/issues) to see if it's already reported
- Collect information about the bug (see issue template)

**How to submit a bug report:**
1. Use the bug report template
2. Provide a clear, descriptive title
3. Include steps to reproduce
4. Describe expected vs actual behavior
5. Include environment details (OS, Node version, PRPROMPTS version)
6. Add error messages and logs

**Example:**
```markdown
**Bug:** PRPROMPTS generation fails for healthcare compliance

**Steps to Reproduce:**
1. Create PRD with HIPAA requirements
2. Run `prprompts generate`
3. Error occurs at step 15/32

**Expected:** All 32 PRPROMPTS generated
**Actual:** Generation stops at 15/32

**Environment:**
- OS: macOS 14.2
- Node: v20.10.0
- PRPROMPTS: 4.0.0

**Error Output:**
```
Error: Cannot read property 'compliance' of undefined
```
```

---

### 💡 Suggesting Enhancements

**Before submitting an enhancement:**
- Check if it aligns with project goals
- Search existing feature requests
- Consider if it benefits the majority of users

**How to suggest an enhancement:**
1. Use the feature request template
2. Provide clear use case
3. Explain why it's valuable
4. Suggest implementation approach (optional)

**Example:**
```markdown
**Feature Request:** Add support for GDPR compliance

**Use Case:**
European healthcare apps need GDPR + HIPAA compliance

**Benefit:**
- Expands PRPROMPTS to European market
- Adds data protection patterns
- Includes right-to-be-forgotten features

**Suggested Implementation:**
1. Add GDPR to compliance options in PRD wizard
2. Create GDPR-specific PRPROMPTS (data export, deletion)
3. Add example in `examples/gdpr-app-example.md`
```

---

### 📝 Contributing Documentation

Documentation contributions are highly valued:

- Fix typos, grammar, or clarity issues
- Add missing documentation
- Create tutorials or guides
- Improve code examples
- Translate documentation (future)

**Documentation areas:**
- README.md
- TROUBLESHOOTING.md
- BEST-PRACTICES.md
- ARCHITECTURE.md
- API documentation
- Example projects

---

### 💻 Contributing Code

Code contributions include:

1. **Bug fixes** - Fix reported issues
2. **New features** - Add enhancements
3. **PRPROMPTS** - Create new prompt templates
4. **Automation commands** - Add AI assistant commands
5. **Tests** - Improve test coverage
6. **Performance** - Optimize existing code

---

### 🎨 Contributing Examples

Add industry-specific examples:

- New compliance standards (SOC2, ISO 27001, etc.)
- New industries (finance, logistics, etc.)
- Integration examples (Firebase, Supabase, etc.)
- Architecture patterns (microservices, serverless, etc.)

---

## Getting Started

### Prerequisites

- **Node.js:** 20.x or higher
- **npm:** 9.x or higher
- **Git:** Latest version
- **Code editor:** VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - Markdown All in One
  - ShellCheck (for bash scripts)

---

### Fork and Clone

1. **Fork the repository**
   - Click "Fork" button on GitHub
   - This creates your own copy

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/prprompts-flutter-generator.git
   cd prprompts-flutter-generator
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Kandil7/prprompts-flutter-generator.git
   ```

4. **Verify remotes**
   ```bash
   git remote -v
   # origin    https://github.com/YOUR-USERNAME/prprompts-flutter-generator.git (fetch)
   # origin    https://github.com/YOUR-USERNAME/prprompts-flutter-generator.git (push)
   # upstream  https://github.com/Kandil7/prprompts-flutter-generator.git (fetch)
   # upstream  https://github.com/Kandil7/prprompts-flutter-generator.git (push)
   ```

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Link for Local Development

```bash
npm link
```

This allows you to test `prprompts` commands locally.

### 3. Verify Installation

```bash
prprompts --version
# Should output: 4.0.0 (or current version)

npm run doctor
# Runs health check
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- tests/cli/create.test.js

# Run with coverage
npm run test:coverage

# Watch mode (for development)
npm run test:watch
```

### 5. Lint and Format

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

---

## Making Changes

### 1. Create a Branch

**Branch naming conventions:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/description` - Documentation changes
- `test/description` - Test additions/improvements
- `refactor/description` - Code refactoring
- `chore/description` - Maintenance tasks

**Examples:**
```bash
git checkout -b feature/add-gdpr-compliance
git checkout -b fix/prd-validation-error
git checkout -b docs/improve-troubleshooting
```

### 2. Make Your Changes

**Adding a new PRPROMPТ:**

1. Create the prompt file:
   ```bash
   nano templates/prprompts/new-prompt.md
   ```

2. Follow the PRPROMPT structure:
   ```markdown
   # [PRPROMPT Name]

   ## Purpose
   Clear statement of what this prompt does

   ## Instructions
   Step-by-step instructions for the AI

   ## Example
   Code example showing expected output

   ## Compliance Considerations
   Security, privacy, regulatory considerations

   ## Testing
   How to test the generated code
   ```

3. Add to generator:
   ```javascript
   // In src/generators/prprompts.js
   const newPrompt = {
     name: 'new-prompt',
     category: 'domain', // or 'data', 'presentation'
     template: 'new-prompt.md',
   };
   ```

4. Add tests:
   ```javascript
   // In tests/generators/prprompts.test.js
   describe('New Prompt Generation', () => {
     it('should generate new prompt correctly', () => {
       // Test implementation
     });
   });
   ```

**Adding an automation command:**

1. Create command file:
   ```bash
   nano .claude/commands/prp-new-command.md
   ```

2. Follow the command structure:
   ```markdown
   # /prp-new-command

   You are an AI assistant helping implement [feature] in a Flutter project.

   ## Context
   This command should be used when [scenario]

   ## Steps
   1. [Step 1]
   2. [Step 2]

   ## Best Practices
   - [Practice 1]
   - [Practice 2]

   ## Output
   Provide [what to provide]
   ```

3. Update installers:
   ```bash
   # Add to install-claude-extension.sh
   # Add to install-qwen-extension.sh
   # Add to install-gemini-extension.sh
   ```

4. Document the command:
   ```bash
   # Update README.md with new command
   # Add to docs/BEST-PRACTICES.md
   ```

**Adding a compliance standard:**

1. Update PRD wizard:
   ```javascript
   // In src/cli/create.js
   const complianceOptions = [
     'HIPAA',
     'PCI-DSS',
     'FERPA',
     'GDPR', // New standard
   ];
   ```

2. Create compliance-specific prompts:
   ```bash
   nano templates/prprompts/compliance/gdpr-data-export.md
   nano templates/prprompts/compliance/gdpr-data-deletion.md
   ```

3. Add example:
   ```bash
   nano examples/gdpr-app-example.md
   ```

4. Update documentation:
   ```markdown
   # In README.md
   - GDPR (EU data protection)
   ```

---

## Testing Guidelines

### Test Requirements

All contributions must include tests:

- **New features:** Unit tests + integration tests
- **Bug fixes:** Regression tests
- **PRPROMPTS:** Generation tests
- **Commands:** Command execution tests

### Test Coverage

Maintain or improve test coverage:

- **Overall:** 80%+ coverage
- **Critical paths:** 90%+ coverage
- **New code:** 100% coverage

### Running Tests

```bash
# All tests
npm test

# Specific suite
npm test -- tests/cli/

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Writing Tests

**Example unit test:**
```javascript
describe('PRD Validator', () => {
  it('should validate PRD with all required sections', () => {
    const prd = readFileSync('test-fixtures/valid-prd.md', 'utf8');
    const result = validatePRD(prd);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject PRD missing compliance section', () => {
    const prd = readFileSync('test-fixtures/invalid-prd.md', 'utf8');
    const result = validatePRD(prd);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing compliance section');
  });
});
```

**Example integration test:**
```javascript
describe('PRPROMPTS Generation', () => {
  beforeEach(() => {
    // Setup test environment
    process.chdir(testProjectDir);
  });

  afterEach(() => {
    // Cleanup
    rimraf.sync(testProjectDir);
  });

  it('should generate all 32 PRPROMPTS from valid PRD', async () => {
    await generatePRPROMPTS({
      prdPath: 'docs/PRD.md',
      outputDir: '.claude/prompts/prprompts',
    });

    const files = glob.sync('.claude/prompts/prprompts/*.md');
    expect(files).toHaveLength(32);
  });
});
```

---

## Documentation Standards

### Code Comments

```javascript
/**
 * Generates PRPROMPTS from a PRD file
 *
 * @param {Object} options - Generation options
 * @param {string} options.prdPath - Path to PRD.md file
 * @param {string} options.outputDir - Output directory for PRPROMPTS
 * @returns {Promise<GenerationResult>} Result with generated files
 *
 * @example
 * const result = await generatePRPROMPTS({
 *   prdPath: 'docs/PRD.md',
 *   outputDir: '.claude/prompts/prprompts'
 * });
 */
async function generatePRPROMPTS(options) {
  // Implementation
}
```

### README Updates

When adding features, update README.md:

```markdown
## New Feature

Brief description of what it does.

### Usage

\`\`\`bash
prprompts new-command
\`\`\`

### Example

\`\`\`bash
prprompts new-command --option value
\`\`\`

### Options

- `--option` - Description
```

### Changelog

Update CHANGELOG.md:

```markdown
## [Unreleased]

### Added
- New GDPR compliance support (#123)
- Added `/prp-gdpr-check` command (#124)

### Fixed
- Fixed PRD validation for multi-line features (#125)

### Changed
- Improved error messages in CLI (#126)
```

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

2. **Run all checks:**
   ```bash
   npm run lint
   npm test
   npm run format:check
   ```

3. **Update documentation:**
   - Update README.md if needed
   - Update relevant docs/ files
   - Add/update examples

4. **Review your changes:**
   ```bash
   git diff upstream/master
   ```

### Submitting PR

1. **Push to your fork:**
   ```bash
   git push origin feature/your-feature
   ```

2. **Create Pull Request on GitHub**

3. **Fill out PR template:**
   - Description of changes
   - Related issue (if any)
   - Type of change (feature/fix/docs/etc.)
   - Testing done
   - Checklist completion

### PR Template

```markdown
## Description

Brief description of what this PR does.

## Related Issue

Closes #123

## Type of Change

- [ ] Bug fix
- [x] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing

- [x] Unit tests added
- [x] Integration tests added
- [x] Manual testing performed

## Checklist

- [x] Code follows project style guidelines
- [x] Self-review completed
- [x] Comments added for complex code
- [x] Documentation updated
- [x] No new warnings generated
- [x] Tests pass locally
- [x] Dependent changes merged
```

### Review Process

**What to expect:**

1. **Automated checks** run (lint, tests, coverage)
2. **Maintainer review** within 2-3 business days
3. **Feedback** may request changes
4. **Iteration** until approved
5. **Merge** when all checks pass and approved

**During review:**

- Be responsive to feedback
- Make requested changes promptly
- Keep PR scope focused
- Avoid force-pushing after review starts

---

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Formatting, missing semicolons, etc.
- `refactor:` Code restructuring
- `perf:` Performance improvement
- `test:` Adding/updating tests
- `chore:` Maintenance tasks
- `ci:` CI/CD changes

### Scope (optional)

- `cli` - CLI commands
- `generator` - PRPROMPTS generation
- `validator` - PRD validation
- `docs` - Documentation
- `tests` - Test files

### Examples

**Feature:**
```bash
git commit -m "feat(cli): add GDPR compliance option to PRD wizard

- Add GDPR to compliance choices
- Generate GDPR-specific PRPROMPTS
- Include data export/deletion features

Closes #123"
```

**Bug fix:**
```bash
git commit -m "fix(validator): handle multi-line feature descriptions

PRD validator was failing when features spanned multiple lines.
Now correctly parses multi-line markdown lists.

Fixes #456"
```

**Documentation:**
```bash
git commit -m "docs: add GDPR example to README

Include step-by-step guide for GDPR compliance setup"
```

**Breaking change:**
```bash
git commit -m "feat(cli): change PRD path default to docs/PRD.md

BREAKING CHANGE: Default PRD path changed from ./PRD.md to docs/PRD.md.
Update your scripts if using default path.

Migration: Move PRD.md to docs/ or use --prd-path flag."
```

---

## Community Guidelines

### Communication

- Be respectful and inclusive
- Assume good intentions
- Provide constructive feedback
- Help others when possible

### Issue Discussions

- Stay on topic
- Provide relevant information
- Be patient with maintainers
- Follow up on your issues

### Code Reviews

**As a reviewer:**
- Be kind and constructive
- Explain the "why" behind suggestions
- Approve when satisfied
- Suggest, don't demand

**As a contributor:**
- Accept feedback gracefully
- Ask for clarification if needed
- Make requested changes
- Thank reviewers

---

## Recognition

Contributors are recognized in several ways:

### 1. Contributors List

All contributors are listed in:
- GitHub contributors page
- README.md (for significant contributions)
- CHANGELOG.md (for releases)

### 2. Acknowledgments

Major contributions are acknowledged in:
- Release notes
- Blog posts
- Social media

### 3. Maintainer Opportunities

Active contributors may be invited to become:
- Collaborators (triage issues, review PRs)
- Maintainers (merge PRs, manage releases)

---

## Development Tips

### Useful Commands

```bash
# Link for local development
npm link

# Unlink
npm unlink

# Test CLI locally
prprompts --version
prprompts create --help

# Debug mode
DEBUG=true prprompts generate

# Clean and rebuild
npm run clean
npm install

# Run specific test
npm test -- --testPathPattern=cli

# Update snapshots
npm test -- -u
```

### Debugging

**Enable debug output:**
```bash
export DEBUG=true
prprompts generate
```

**Use breakpoints (VS Code):**
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug PRPROMPTS",
  "program": "${workspaceFolder}/src/cli/index.js",
  "args": ["generate"]
}
```

### Project Structure

```
prprompts-flutter-generator/
├── .claude/               # Claude Code extension
│   ├── commands/         # Automation commands
│   └── prompts/          # PRPROMPTS templates
├── docs/                 # Documentation
│   ├── ARCHITECTURE.md
│   ├── BEST-PRACTICES.md
│   ├── TROUBLESHOOTING.md
│   └── MIGRATION-GUIDE.md
├── examples/             # Example projects
│   ├── healthcare-app-example.md
│   ├── ecommerce-app-example.md
│   └── education-app-example.md
├── src/                  # Source code
│   ├── cli/             # CLI commands
│   ├── generators/      # PRPROMPTS generators
│   ├── validators/      # PRD validators
│   └── utils/           # Utilities
├── templates/           # PRPROMPT templates
│   ├── prprompts/      # Individual templates
│   └── PRD-template.md
├── tests/               # Test files
│   ├── cli/
│   ├── generators/
│   └── validators/
└── scripts/             # Build/utility scripts
```

---

## Getting Help

**Questions about contributing?**

1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Search [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)
3. Ask in [Discussions Q&A](https://github.com/Kandil7/prprompts-flutter-generator/discussions/categories/q-a)
4. Tag maintainers in issues (for urgent matters)

**Stuck on an issue?**

- Comment on the issue asking for help
- Provide what you've tried
- Share error messages
- Be patient - maintainers volunteer their time

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## Thank You!

Your contributions make PRPROMPTS better for everyone. We appreciate your time and effort! 🙏

**Special Thanks** to all our contributors:
- [GitHub Contributors](https://github.com/Kandil7/prprompts-flutter-generator/graphs/contributors)

---

**Questions?** Open a [Discussion](https://github.com/Kandil7/prprompts-flutter-generator/discussions) or reach out to maintainers.

**Ready to contribute?** Check out [good first issues](https://github.com/Kandil7/prprompts-flutter-generator/labels/good%20first%20issue) to get started!
