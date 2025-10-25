# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**PRPROMPTS Flutter Generator** is an npm-published CLI tool that generates 32 customized, security-audited development guides for Flutter projects. It supports three AI assistants (Claude Code, Qwen Code, Gemini CLI) through an identical extension system.

**Core Innovation:** v4.0 automation pipeline transforms PRD → 32 PRPROMPTS files → Working Flutter app in 2-3 hours (40-60x faster than manual).

---

## Essential Commands

### Development & Testing
```bash
# Install dependencies
npm install

# Install locally for testing
npm install -g .

# Run all tests
npm test

# Run specific test suites
npm run test:validation    # Validate prompt files exist
npm run test:package       # Test package structure
npm run test:commands      # Test command availability
npm run test:bash          # Bash script tests

# Lint code
npm run lint               # Lint markdown + shell scripts
npm run lint:fix           # Auto-fix markdown issues

# Validate package before publish
npm run validate           # Validates package.json structure
npm pack --dry-run         # Test npm package creation
```

### Testing Changes Locally
```bash
# Test unified CLI
cd /tmp/test-project
prprompts create
prprompts generate

# Test AI-specific commands (requires AI installed)
claude gen-prprompts
qwen gen-prprompts
gemini gen-prprompts

# Test automation pipeline
claude bootstrap-from-prprompts
claude implement-next

# Test PRD workflow commands (NEW in v4.1)
claude create-prd       # Interactive PRD creation with template selection
claude analyze-prd      # Analyze PRD quality with scoring (A-F grade)
claude refine-prd       # Interactive PRD quality improvement loop
```

### Publishing
```bash
# Update version (updates package.json, creates git tag)
npm version patch    # 4.0.0 -> 4.0.1
npm version minor    # 4.0.0 -> 4.1.0

# Publish to npm
npm login
npm publish --access public

# Push version tag
git push origin v4.0.1
```

---

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────┐
│         PRPROMPTS Multi-AI System               │
├─────────────────────────────────────────────────┤
│                                                 │
│  User runs: prprompts create                   │
│       ↓                                         │
│  bin/prprompts (CLI dispatcher)                │
│       ↓                                         │
│  Detects AI: claude/qwen/gemini                │
│       ↓                                         │
│  Executes: claude create-prd                   │
│       ↓                                         │
│  Claude loads: ~/.config/claude/prompts/       │
│       ↓                                         │
│  Generates: docs/PRD.md                        │
│       ↓                                         │
│  User runs: prprompts generate                 │
│       ↓                                         │
│  Generates: PRPROMPTS/ (32 files)              │
│       ↓                                         │
│  [v4.0 Automation Pipeline]                    │
│       ↓                                         │
│  Working Flutter App                           │
└─────────────────────────────────────────────────┘
```

### Key Components

**1. CLI Entry Point (`bin/prprompts`)**
- Unified command dispatcher for all AI assistants
- Maps friendly commands (`create` → `create-prd`, `generate` → `gen-prprompts`)
- Detects available AIs via `which claude`, `which qwen`, `which gemini`
- Manages config at `~/.prprompts/config.json`
- Routes commands to appropriate AI: `execSync(\`${ai} ${command}\`)`

**2. Extension System (`.claude/`, `.qwen/`, `.gemini/`)**
Each AI has **identical** structure:
```
.claude/
├── prompts/                    # 10 PRD/PRPROMPTS generation prompts
│   ├── generate-prd.md         # Interactive wizard (10 questions)
│   ├── auto-generate-prd.md    # Auto from description
│   ├── prprompts-generator.md  # All 32 files generator
│   └── ...
├── commands/automation/        # 5 v4.0 automation commands
│   ├── bootstrap-from-prprompts.md
│   ├── implement-next.md
│   ├── full-cycle.md
│   └── ...
└── config.yml                  # Command registry (maps names to prompts)
```

**Why identical across AIs?** Feature parity - users choose AI by accuracy/cost/context, not features.

**3. Installation Pipeline (`scripts/postinstall.js`)**
- Runs automatically after `npm install -g prprompts-flutter-generator`
- Detects installed AIs: `execSync('which claude')`, etc.
- Copies prompts/commands to `~/.config/{ai}/prompts/` and `~/.config/{ai}/commands/`
- Creates unified config at `~/.prprompts/config.json`

**4. PRD Generation (5 methods + Industry Templates)**
- **Interactive** - 10 questions, saves to `docs/PRD.md`
  - **NEW in v4.1:** Template selection before questions (Step 0)
  - 6 industry templates: Healthcare, Fintech, Education, E-commerce, Logistics, SaaS/B2B
  - Templates provide pre-configured compliance, features, and best practices
  - Load as defaults, fully customizable in wizard
- **Auto** - Infers from `project_description.md`
- **From Files** - Converts existing markdown docs
- **Manual** - User edits `templates/PRD-full-template.md` or industry starter templates

**NEW in v4.1: Industry Starter Templates**
Located in `templates/`:
- `prd-healthcare-starter.md` - HIPAA, PHI encryption, patient portal (531 lines)
- `prd-fintech-starter.md` - PCI-DSS, payment security, NEVER store cards (549 lines)
- `prd-education-starter.md` - COPPA/FERPA, parental consent, student data (112 lines)
- `prd-ecommerce-starter.md` - PCI-DSS + Stripe, shopping cart, checkout (123 lines)
- `prd-logistics-starter.md` - GPS tracking, route optimization, offline-first (123 lines)
- `prd-saas-starter.md` - Multi-tenancy, enterprise SSO, subscription billing (144 lines)

**NEW in v4.1: PRD Quality Tools**
- `claude analyze-prd` - Now includes 4-dimensional scoring (Completeness, Clarity, Feasibility, Security) with A-F grades + AI confidence levels
- `claude refine-prd` - Interactive quality improvement loop with before/after comparison

**NEW in v4.1 Phase 2: PRD Strategic Planning**
- `claude estimate-cost` - Generate comprehensive cost breakdown: development hours, labor costs (by role), infrastructure, compliance audits, third-party services. Outputs `docs/COST_ESTIMATE.md` with 10 sections including optimization opportunities and payment schedules. ±20% confidence ranges.

- `claude analyze-dependencies` - Map feature dependencies and calculate critical path. Identifies blocking features, parallel work streams, and implementation order. Generates `docs/FEATURE_DEPENDENCIES.md` with visual dependency graph, 4-phase implementation plan, risk assessment, and team allocation suggestions.

- `claude generate-stakeholder-review` - Create role-specific review checklists for PRD approval. Generates `docs/STAKEHOLDER_REVIEW.md` with sections for Executive/Business, Technical Lead, Product Manager, Compliance Officer, Security Lead, and Legal. Includes sign-off tracker and compliance-specific checklists (HIPAA, PCI-DSS, GDPR, COPPA).

**5. PRPROMPTS Generator**
- Reads `docs/PRD.md` (YAML frontmatter + markdown)
- Extracts metadata: `compliance: ["hipaa", "pci-dss"]`, `platforms: ["ios", "android"]`, etc.
- Generates 32 customized files following **PRP pattern** (6 sections):
  - FEATURE, EXAMPLES, CONSTRAINTS, VALIDATION GATES, BEST PRACTICES, REFERENCES
- Each file is 500-600 words
- **Critical:** File `16-security_and_compliance.md` adapts to PRD compliance requirements

**6. v4.0 Automation Pipeline (`.claude/commands/automation/`)**
Five commands that automate Flutter development:
- `bootstrap-from-prprompts.md` - Complete project setup (Clean Architecture, security, tests)
- `implement-next.md` - Auto-implement next feature from `IMPLEMENTATION_PLAN.md`
- `full-cycle.md` - Orchestrates 1-10 feature implementations automatically
- `review-and-commit.md` - Validates code against PRPROMPTS patterns + security checks
- `qa-check.md` - Comprehensive compliance audit, generates `QA_REPORT.md`

### Critical Security Patterns

**PRPROMPTS enforces security-first development:**

1. **JWT Verification (NOT signing)**
   - Flutter code ONLY verifies tokens with public key (RS256)
   - Backend signs with private key - NEVER expose in Flutter
   - Pattern defined in `16-security_and_compliance.md`

2. **PCI-DSS Compliance**
   - NEVER store full card numbers
   - Use tokenization (Stripe, PayPal, Braintree)
   - Generated code includes payment provider patterns

3. **HIPAA Compliance**
   - PHI encrypted at rest (AES-256-GCM)
   - Audit logging for all PHI access
   - HTTPS-only, session timeouts

4. **Compliance-Driven Generation**
   - PRD metadata drives code patterns: `compliance: ["hipaa", "pci-dss", "gdpr"]`
   - Every PRPROMPTS file references correct security patterns
   - File `16-security_and_compliance.md` is single source of truth

---

## File Organization

### Core Files (What They Do)

**Configuration:**
- `package.json` - npm package config, 14 scripts, peer dependencies
- `.claude/config.yml` - Command registry for Claude (17 commands: 7 PRD + 6 PRPROMPTS + 4 automation)
- `bin/prprompts` - CLI dispatcher (400 lines, maps commands to AIs)
- `scripts/postinstall.js` - Auto-installs extensions for detected AIs

**Prompts (15 identical files per AI):**
- `generate-prd.md` - Interactive wizard prompt (v4.1: added Step 0 template selection)
- `auto-generate-prd.md` - Auto-generation prompt
- `analyze-prd.md` - **ENHANCED v4.1:** PRD validation with 4-dimensional scoring (A-F grades) + AI confidence levels
- `refine-prd.md` - **NEW v4.1:** Interactive quality improvement loop
- `estimate-cost.md` - **NEW v4.1 Phase 2:** Comprehensive cost estimation with 10-section report
- `analyze-dependencies.md` - **NEW v4.1 Phase 2:** Feature dependency mapping and critical path analysis
- `generate-stakeholder-review.md` - **NEW v4.1 Phase 2:** Role-specific PRD review checklists
- `prprompts-generator.md` - Main generator (all 32 files)
- `phase-1-core.md`, `phase-2-quality.md`, `phase-3-demo.md` - Phase generators
- `single-file-generator.md` - Regenerate one file

**Automation Commands (5 identical files per AI):**
- Located in `.claude/commands/automation/`, `.qwen/commands/automation/`, `.gemini/commands/automation/`

**Templates:**
- `templates/PRD-full-template.md` - Manual PRD template (comprehensive, blank)
- **NEW v4.1: Industry Starter Templates** (pre-configured PRDs):
  - `prd-healthcare-starter.md` - HIPAA, PHI encryption, 8 healthcare features
  - `prd-fintech-starter.md` - PCI-DSS, payment security, 9 fintech features
  - `prd-education-starter.md` - COPPA/FERPA, parental consent, K-12 focus
  - `prd-ecommerce-starter.md` - PCI-DSS, Stripe, shopping cart, checkout
  - `prd-logistics-starter.md` - GPS tracking, route optimization, offline-first
  - `prd-saas-starter.md` - Multi-tenancy, enterprise SSO, subscription billing

**Tests:**
- `scripts/test-validation.sh` - Validates all 32 prompt files exist
- `scripts/test-commands.sh` - Tests command availability
- `tests/*.test.js` - Jest unit tests

**Documentation:**
- `ARCHITECTURE.md` - Deep dive system design (1046 lines - READ THIS)
- `DEVELOPMENT.md` - Contributing guide (778 lines)
- `docs/PRPROMPTS-SPECIFICATION.md` - v2.0 spec, PRP pattern
- `docs/AUTOMATION-GUIDE.md` - v4.0 automation workflows
- `docs/CLAUDE-USER-GUIDE.md` - User-facing extension guide

---

## Adding Features

### Adding a New PRPROMPTS File (e.g., 33rd file)

1. **Create prompt in all 3 AI directories:**
```bash
touch .claude/prompts/33-new-feature.md
cp .claude/prompts/33-new-feature.md .qwen/prompts/
cp .claude/prompts/33-new-feature.md .gemini/prompts/
```

2. **Follow PRP pattern (mandatory 6 sections):**
```markdown
## FEATURE
What this guide accomplishes (150-200 words)

## EXAMPLES
Real code with actual Flutter file paths (100-150 words + code)

## CONSTRAINTS
✅ DO / ❌ DON'T rules (100-150 words)

## VALIDATION GATES
Pre-commit checklist + CI/CD automation (50-100 words)

## BEST PRACTICES
Junior-friendly "Why?" explanations (100-150 words)

## REFERENCES
Official docs, compliance guides, ADRs (50 words)
```

3. **Update generator prompt:**
```bash
# Edit .claude/prompts/prprompts-generator.md
# Add new file to generation loop
vim .claude/prompts/prprompts-generator.md
```

4. **Update all config files:**
```bash
# If adding new command for single file generation
vim .claude/config.yml
vim .qwen/config.yml
vim .gemini/config.yml
```

5. **Update docs:**
- `README.md` - Update file count (32 → 33)
- `docs/PRPROMPTS-SPECIFICATION.md` - Add to spec
- `ARCHITECTURE.md` - Update component list

### Adding a New Automation Command

1. **Create prompt in all automation directories:**
```bash
touch .claude/commands/automation/new-command.md
cp .claude/commands/automation/new-command.md .qwen/commands/automation/
cp .claude/commands/automation/new-command.md .gemini/commands/automation/
```

2. **Register in all config.yml files:**
```yaml
# .claude/config.yml (repeat for .qwen, .gemini)
new-command:
  prompt: "commands/automation/new-command.md"
  description: "Brief description of automation"
```

3. **Update extension manifests:**
```json
// claude-extension.json, qwen-extension.json, gemini-extension.json
{
  "commands": [
    {
      "name": "/new-command",
      "description": "What it does",
      "file": "automation/new-command.md"
    }
  ]
}
```

4. **Document:**
- `docs/AUTOMATION-GUIDE.md` - Add workflow example
- `docs/CLAUDE-USER-GUIDE.md` - Add to command list
- Update `QWEN.md`, `GEMINI.md` similarly

### Adding Support for New AI Assistant

1. **Create directory structure:**
```bash
mkdir -p .newai/prompts
mkdir -p .newai/commands/automation
```

2. **Copy all prompts:**
```bash
cp .claude/prompts/*.md .newai/prompts/
cp .claude/commands/automation/*.md .newai/commands/automation/
```

3. **Create config.yml:**
```bash
cp .claude/config.yml .newai/config.yml
# Edit ai-specific paths if needed
```

4. **Create extension manifest:**
```bash
cp claude-extension.json newai-extension.json
# Update: "ai": "newai", paths, descriptions
```

5. **Create installer:**
```bash
cp install-claude-extension.sh install-newai-extension.sh
# Edit to use .newai/ and ~/.config/newai/
```

6. **Update postinstall.js:**
```javascript
// scripts/postinstall.js
const AI_ASSISTANTS = ['claude', 'qwen', 'gemini', 'newai'];
```

7. **Update bin/prprompts CLI:**
```javascript
// bin/prprompts - Add to loadConfig()
newai: { enabled: commandExists('newai') }
```

8. **Create user guide:**
```bash
cp docs/CLAUDE-USER-GUIDE.md docs/NEWAI-USER-GUIDE.md
# Edit for NewAI specifics
```

9. **Update README.md:**
- Add to extension comparison table
- Update installation instructions
- Add to "Choose Your AI Assistant" section

---

## Development Workflow

### Making Changes

1. **Create feature branch:**
```bash
git checkout -b feature/new-automation-command
```

2. **Make changes** (e.g., new automation command):
```bash
# Create in all 3 AI dirs
vim .claude/commands/automation/new-cmd.md
cp .claude/commands/automation/new-cmd.md .qwen/commands/automation/
cp .claude/commands/automation/new-cmd.md .gemini/commands/automation/

# Register in all configs
vim .claude/config.yml
vim .qwen/config.yml
vim .gemini/config.yml
```

3. **Test locally:**
```bash
npm install -g .
prprompts doctor
claude new-cmd
```

4. **Run tests:**
```bash
npm test
npm run lint
npm run validate
```

5. **Update docs:**
```bash
vim docs/AUTOMATION-GUIDE.md
vim CHANGELOG.md
```

6. **Commit (conventional format):**
```bash
git add .
git commit -m "feat(automation): add new-cmd command

- Create new-cmd.md automation prompt
- Register in config.yml for all 3 AIs
- Update documentation

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Testing Package Locally

```bash
# Build tarball
npm pack

# Install from tarball
npm install -g ./prprompts-flutter-generator-4.0.0.tgz

# Test in fresh Flutter project
cd /tmp/test-app
flutter create .
prprompts create
prprompts generate
claude bootstrap-from-prprompts

# Cleanup
npm uninstall -g prprompts-flutter-generator
rm *.tgz
```

---

## Key Architectural Decisions

### Why Unified CLI (`bin/prprompts`)?
- **User convenience** - Single command instead of AI-specific syntax
- **AI-agnostic** - Switch between Claude/Qwen/Gemini without workflow changes
- **Command aliasing** - Friendly names (`create` → `create-prd`)
- **Centralized config** - `~/.prprompts/config.json`

### Why Identical Prompts Across AIs?
- **Feature parity** - All AIs have same capabilities
- **Testing** - One test suite validates all
- **Maintenance** - Update once, copy to others
- **User choice** - Pick AI by accuracy/cost/context, not features

### Why PRP Pattern (6 Sections)?
- **Consistency** - Every file has same structure
- **Completeness** - Covers what/how/rules/checks/why/learn
- **Junior-friendly** - "Why?" explanations in BEST PRACTICES
- **Security-first** - CONSTRAINTS enforce correct patterns
- **Validation** - Pre-commit checklists + CI/CD automation

### Why v4.0 Automation?
- **Speed** - 40-60x faster (3-5 days → 2-3 hours)
- **Quality** - Follows PRPROMPTS patterns, security built-in
- **Testing** - Auto-generates tests with 70%+ coverage
- **Compliance** - Built-in HIPAA/PCI-DSS/GDPR validation

---

## Troubleshooting

### Extension Not Loading

```bash
# Check config paths
ls ~/.config/claude/prompts/
ls ~/.config/claude/commands/automation/
cat ~/.config/claude/config.yml

# Reinstall extension
bash install-claude-extension.sh
prprompts doctor
```

### Command Not Found

```bash
# Check PATH
which prprompts
echo $PATH

# Reinstall globally
npm install -g prprompts-flutter-generator
```

### Tests Failing

```bash
# Clean reinstall
rm -rf node_modules
npm install
npm test

# Individual tests
npm run test:validation
npm run test:package
```

---

## Important Conventions

### Code Style

**JavaScript:**
- ES6+ (async/await, arrow functions, const/let)
- Always try/catch async operations
- JSDoc for public functions

**Shell Scripts:**
- Shebang: `#!/bin/bash`
- Error handling: `set -e`
- Quote all variables: `"$var"`

**Markdown:**
- ATX headers (`#` not `===`)
- Unordered lists: `-`
- Always specify language in code blocks

### Commit Messages

Format: `<type>(<scope>): <subject>`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Example:
```
feat(automation): add qa-check compliance audit

- Create qa-check.md automation prompt
- Add architecture/security/test validation
- Generate QA_REPORT.md with score

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Documentation Updates

When adding features, update:
1. `README.md` - User-facing description
2. `CHANGELOG.md` - Version history
3. Relevant doc in `docs/`
4. `ARCHITECTURE.md` - If architecture changes
5. This file - If developer workflow changes

---

## Additional Resources

**For Developers:**
- `ARCHITECTURE.md` - System design deep dive (MUST READ - 1046 lines)
- `DEVELOPMENT.md` - Contributing guidelines (778 lines)
- `docs/PRPROMPTS-SPECIFICATION.md` - v2.0 spec, PRP pattern
- `docs/API.md` - All commands and options

**For Users:**
- `docs/CLAUDE-USER-GUIDE.md` - Extension user guide
- `README.md` - Main project documentation
- `docs/AUTOMATION-GUIDE.md` - v4.0 workflows
- `WINDOWS-QUICKSTART.md` - Windows installation

**For Security:**
- `docs/BEST-PRACTICES.md` - Security patterns, compliance
- `SECURITY.md` - Vulnerability reporting
- `examples/*-app-example.md` - Industry-specific compliance examples

---

## Summary

**This project's architecture:**

1. **Multi-AI extension system** - Identical prompts/commands for Claude/Qwen/Gemini
2. **Unified CLI dispatcher** - `bin/prprompts` routes to appropriate AI
3. **Postinstall automation** - Auto-configures detected AIs
4. **PRD → PRPROMPTS → Code** - Complete automation pipeline
5. **Security-first** - Compliance patterns (HIPAA/PCI-DSS/GDPR) built into every layer

**When working on this codebase:**
- Update **all 3 AI directories** when changing prompts
- Follow **PRP pattern** (6 sections) for PRPROMPTS files
- Use **conventional commits** (`feat:`, `fix:`, etc.)
- Test with `npm install -g .` before committing
- Read `ARCHITECTURE.md` for system design understanding

**Key insight:** This tool transforms a PRD into 32 security-audited guides that then auto-generate production-ready Flutter code. The magic is in the PRD metadata → prompt customization → code generation pipeline.
