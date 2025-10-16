# PRPROMPTS Generator - Usage Guide

Complete guide to using the PRD-to-PRPROMPTS Generator for Flutter projects.

## Table of Contents

- [Getting Started](#getting-started)
- [Creating PRDs](#creating-prds)
- [Generating PRPROMPTS](#generating-prprompts)
- [Working with Generated Files](#working-with-generated-files)
- [Common Workflows](#common-workflows)
- [Best Practices](#best-practices)
- [Tips and Tricks](#tips-and-tricks)

---

## Getting Started

### Prerequisites

Before using the generator, ensure you have:

```bash
# Required
- Claude Code CLI (or Qwen Code / Gemini CLI)
- Node.js 18+
- Flutter 3.24+
- Git

# Optional
- Structurizr CLI (for C4 diagrams)
- GitHub CLI (for PR automation)
```

### Verify Installation

```bash
# Check if commands are available
claude create-prd --help
claude gen-prprompts --help

# Windows users
cd %USERPROFILE%\.config\claude\
dir prompts

# macOS/Linux users
ls ~/.config/claude/prompts/
```

If commands don't work, see [Troubleshooting](TROUBLESHOOTING.md).

---

## Creating PRDs

### Method 1: Auto-Generate (Fastest - 1 minute)

**Best for:** Quick prototypes, standard projects, MVPs

```bash
# Step 1: Create a simple description file
cat > project_description.md << 'EOF'
# TaskFlow Pro

Project management app for remote teams with real-time collaboration
and Kanban boards. Must work offline and support 10+ languages.

## Users
- Project managers
- Team members
- Stakeholders

## Features
1. Kanban boards
2. Real-time updates
3. File attachments
4. Time tracking
5. Reports and analytics
EOF

# Step 2: Auto-generate PRD
claude auto-gen-prd

# Step 3: Review generated PRD
cat docs/PRD.md
```

**What Gets Auto-Inferred:**
- Project type (productivity/SaaS)
- Platforms (iOS, Android, Web)
- Architecture (Clean Architecture + BLoC)
- Authentication (JWT or OAuth2)
- Offline support (Yes, if mentioned)
- Real-time needs (WebSocket if "real-time" mentioned)
- Team size (Medium by default)
- Timeline (3-6 months for standard projects)

**When Auto-Generation May Need Help:**
- Specialized compliance (HIPAA, PCI-DSS) - mention explicitly
- Unusual tech stack - specify in description
- Custom authentication - include details
- Specific design system requirements

---

### Method 2: Generate from Existing Files (2 minutes)

**Best for:** Existing documentation, legacy projects, migrations

```bash
# Step 1: Run the command
claude prd-from-files

# Step 2: Provide paths to your files (one per line, then Enter twice)
docs/requirements.md
specs/features.md
notes/architecture.md
README.md


# Step 3: Answer 2-3 clarifying questions (if needed)
# Claude will ask ONLY for critical missing info

# Step 4: Review generated PRD
cat docs/PRD.md
```

**Supported File Types:**
- Markdown files (`.md`)
- Text files (`.txt`)
- Requirements documents
- Feature specs
- Technical architecture docs
- Meeting notes
- Existing PRDs (to restructure)

**Smart Inference Examples:**
```
"patient records" + "doctor" → Healthcare + HIPAA
"credit card" + "payment" → Fintech + PCI-DSS
"student grades" → Education + FERPA
"real-time chat" → WebSocket + real_time: true
"works offline" → offline_support: true + SQLite
```

---

### Method 3: Interactive Wizard (5 minutes)

**Best for:** Production projects, high-stakes apps, complex requirements

```bash
claude create-prd
```

**You'll Answer 10 Questions:**

1. **Project Name**
   - Example: "HealthTrack Pro"
   - Used in: YAML frontmatter, file headers

2. **Project Type**
   - Options: Healthcare, Fintech, Education, E-commerce, SaaS, etc.
   - Impact: Determines compliance, security patterns

3. **Platforms**
   - iOS, Android, Web, or combinations
   - Impact: Responsive layout guides, platform-specific code

4. **Compliance Requirements**
   - HIPAA, PCI-DSS, GDPR, SOC2, COPPA, FERPA
   - Impact: Security patterns, audit logging, encryption

5. **Authentication Method**
   - JWT (default), OAuth2, Firebase, Custom
   - Impact: Auth patterns in PRPROMPTS/04-api_integration.md

6. **Offline Support**
   - Yes/No
   - Impact: SQLite patterns, sync strategies, conflict resolution

7. **Real-time Updates**
   - Yes/No
   - Impact: WebSocket patterns, state management

8. **Sensitive Data Types**
   - PHI (Protected Health Info), PII, Payment, None
   - Impact: Encryption patterns, logging restrictions

9. **Team Size**
   - Small (1-5), Medium (5-15), Large (15+)
   - Impact: Code review requirements, coordination guides

10. **Demo Frequency**
    - Weekly, Biweekly, Monthly
    - Impact: Demo environment setup, reporting cadence

**Output:** Complete PRD saved to `docs/PRD.md` with YAML frontmatter.

---

### Method 4: Manual Template (30 minutes)

**Best for:** Complex projects, unique requirements, full control

```bash
# Copy template
cp templates/PRD-full-template.md docs/PRD.md

# Or copy example
cp examples/healthcare-prd.md docs/PRD.md

# Edit in your preferred editor
vim docs/PRD.md  # or nano, code, etc.
```

**Template Sections:**
- YAML Frontmatter (metadata)
- Executive Summary
- User Personas
- Feature Specifications
- Technical Architecture
- Compliance Requirements
- Testing Strategy
- Timeline & Milestones
- Success Metrics

---

## Generating PRPROMPTS

### Generate All Files (30-60 seconds)

```bash
# Using Claude Code commands
claude gen-prprompts

# Or with aliases (if configured)
prp-gen

# Or using script directly
./scripts/generate-prprompts.sh all
```

**Output:**
```
PRPROMPTS/
├── 01-feature_scaffold.md
├── 02-responsive_layout.md
├── 03-bloc_implementation.md
├── ... (29 more files)
├── 32-lessons_learned_engine.md
└── README.md
```

**Time to Generate:**
- Phase 1 (10 files): ~20 seconds
- Phase 2 (12 files): ~25 seconds
- Phase 3 (10 files): ~20 seconds
- README: ~5 seconds
- **Total: 60-90 seconds**

---

### Generate by Phase

```bash
# Phase 1: Core Architecture (10 files)
claude gen-phase-1
# Or: prp-p1

# Phase 2: Quality & Security (12 files)
claude gen-phase-2
# Or: prp-p2

# Phase 3: Demo & Learning (10 files + README)
claude gen-phase-3
# Or: prp-p3
```

**Use Cases for Phase-Based Generation:**
- **Iterative development** - Generate Phase 1 first, then later phases
- **Resource constraints** - Focus on essential files (Phase 1)
- **Specialized needs** - Only generate security guides (Phase 2)

---

### Generate Single File

```bash
# Generate specific guide
claude gen-file

# When prompted, enter filename (without number prefix):
security_and_compliance
```

**Common Single-File Requests:**
```bash
# Security guide
gen-file security_and_compliance

# Testing strategy
gen-file testing_strategy

# API integration
gen-file api_integration

# Performance optimization
gen-file performance_optimization
```

---

## Working with Generated Files

### File Structure

```
PRPROMPTS/
├── 01-feature_scaffold.md          # Clean Architecture patterns
├── 04-api_integration.md           # Auth, JWT, API calls
├── 16-security_and_compliance.md   # ⭐ PRD-customized security
├── 26-demo_environment_setup.md    # ⭐ PRD-based demo scenarios
└── README.md                        # Index and usage guide
```

**Files with PRD Customization:**
- `16-security_and_compliance.md` - Adapts to HIPAA/PCI-DSS/GDPR
- `26-demo_environment_setup.md` - Uses PRD features for demo data
- `31-project_role_adaptation.md` - Adjusts to team size

---

### Reading a PRPROMPT File

Every file follows the **PRP Pattern** (6 sections):

```markdown
## FEATURE
What this guide helps you accomplish

## EXAMPLES
Real Flutter code with actual file paths:
- lib/features/auth/presentation/login_screen.dart
- lib/core/network/api_client.dart

## CONSTRAINTS
✅ DO: Use Clean Architecture layers
❌ DON'T: Put business logic in widgets

## VALIDATION GATES
Pre-commit Checklist:
- [ ] Unit tests pass (flutter test)
- [ ] No business logic in widgets
- [ ] BLoC events/states documented

CI/CD Automation:
- flutter test --coverage (80%+ required)

## BEST PRACTICES
### Why separate presentation from business logic?
Because it makes testing easier and allows UI changes
without breaking core functionality.

## REFERENCES
- Flutter Clean Architecture: https://...
- BLoC pattern: https://bloclibrary.dev
```

---

### Using PRPROMPTS During Development

#### 1. Before Coding a Feature

```bash
# Read relevant guide
cat PRPROMPTS/01-feature_scaffold.md

# Follow the EXAMPLES section for structure
# Review CONSTRAINTS before writing code
```

#### 2. During Code Review

```bash
# Check validation gates
cat PRPROMPTS/18-quality_gates_and_code_metrics.md

# Verify compliance checklist
cat PRPROMPTS/14-security_audit_checklist.md
```

#### 3. Before PRs

```bash
# Run validation gates
flutter test --coverage
flutter analyze
dart format --set-exit-if-changed .

# Check security checklist (if healthcare/fintech)
grep "VALIDATION GATES" PRPROMPTS/16-security_and_compliance.md
```

#### 4. Onboarding New Developers

```bash
# Start here
cat PRPROMPTS/07-onboarding_junior.md

# Then architecture
cat PRPROMPTS/01-feature_scaffold.md

# Then testing
cat PRPROMPTS/05-testing_strategy.md
```

---

## Common Workflows

### Workflow 1: New Project from Scratch

```bash
# Step 1: Create Flutter project
flutter create my_app
cd my_app

# Step 2: Auto-generate PRD (1 min)
claude auto-gen-prd

# Step 3: Review and edit PRD
vim docs/PRD.md

# Step 4: Generate PRPROMPTS (1 min)
claude gen-prprompts

# Step 5: Read README
cat PRPROMPTS/README.md

# Step 6: Start coding with guides
cat PRPROMPTS/01-feature_scaffold.md
```

**Total Time:** 5-10 minutes to have complete development guides

---

### Workflow 2: Existing Project Migration

```bash
# Step 1: Navigate to project
cd existing_flutter_project

# Step 2: Collect existing docs
ls docs/  # requirements.md, architecture.md, etc.

# Step 3: Generate PRD from files (2 min)
claude prd-from-files

# Step 4: Review generated PRD
cat docs/PRD.md

# Step 5: Customize PRD for your needs
vim docs/PRD.md

# Step 6: Generate PRPROMPTS
claude gen-prprompts

# Step 7: Align existing code with guides
# - Review CONSTRAINTS in each file
# - Run validation gates
# - Refactor as needed
```

---

### Workflow 3: Adding New Feature

```bash
# Step 1: Check PRD
grep "Feature" docs/PRD.md

# Step 2: Read scaffold guide
cat PRPROMPTS/01-feature_scaffold.md

# Step 3: Create feature structure
mkdir -p lib/features/new_feature/{data,domain,presentation}

# Step 4: Implement following EXAMPLES
# (Copy structure from guide)

# Step 5: Validate before commit
flutter test
flutter analyze

# Step 6: Check validation gates
grep "VALIDATION" PRPROMPTS/01-feature_scaffold.md
```

---

### Workflow 4: Security Audit

```bash
# Step 1: Review security guide
cat PRPROMPTS/16-security_and_compliance.md

# Step 2: Run checklist
grep "VALIDATION GATES" PRPROMPTS/16-security_and_compliance.md

# Step 3: Check for violations
# - Search for "SecretKey" in code (JWT signing - bad!)
# - Search for full credit card storage
# - Check for PHI logging

# Step 4: Fix violations following EXAMPLES

# Step 5: Re-validate
./scripts/security-audit.sh  # If available
```

---

## Best Practices

### 1. Keep PRD Updated

```bash
# When requirements change:
vim docs/PRD.md

# Regenerate PRPROMPTS to reflect changes
claude gen-prprompts

# Review diffs
git diff PRPROMPTS/
```

**When to Regenerate:**
- Compliance requirements change (adding HIPAA)
- Authentication method changes
- New platform support (adding Web)
- Team size changes significantly

---

### 2. Use PRPROMPTS in Code Reviews

```markdown
# In PR description, reference guides:
This PR implements user authentication following:
- PRPROMPTS/04-api_integration.md (JWT verification pattern)
- PRPROMPTS/16-security_and_compliance.md (token storage)

Validation:
- [x] Unit tests pass
- [x] No business logic in widgets
- [x] JWT verified with public key only
```

---

### 3. Customize Generated Files

```bash
# Edit generated files for project-specific patterns
vim PRPROMPTS/01-feature_scaffold.md

# Add custom examples, constraints, or practices
# Commit customizations to Git
git add PRPROMPTS/
git commit -m "docs: customize PRPROMPTS for project patterns"
```

**Safe to Customize:**
- EXAMPLES (add project-specific code)
- BEST PRACTICES (add team conventions)
- REFERENCES (add internal wiki links)

**Avoid Changing:**
- FEATURE section (core purpose)
- CONSTRAINTS (security-critical rules)
- VALIDATION GATES (CI/CD automation)

---

### 4. Version Control

```bash
# Commit PRD and PRPROMPTS together
git add docs/PRD.md PRPROMPTS/
git commit -m "docs: add PRD and PRPROMPTS for v1.0"

# Tag releases
git tag -a v1.0-prprompts -m "PRPROMPTS baseline for v1.0"
```

---

## Tips and Tricks

### 1. Quick File Navigation

```bash
# Create aliases in ~/.bashrc or ~/.zshrc
alias prp='cat PRPROMPTS/README.md'
alias prp-scaffold='cat PRPROMPTS/01-feature_scaffold.md'
alias prp-security='cat PRPROMPTS/16-security_and_compliance.md'
alias prp-test='cat PRPROMPTS/05-testing_strategy.md'
```

### 2. Search Across PRPROMPTS

```bash
# Find all JWT mentions
grep -r "JWT" PRPROMPTS/

# Find all validation gates
grep -r "VALIDATION GATES" PRPROMPTS/

# Find examples of specific pattern
grep -r "BlocProvider" PRPROMPTS/
```

### 3. Generate PRPROMPTS Preview

```bash
# Dry-run to see what would be generated
./scripts/generate-prprompts.sh all --dry-run

# Preview single file
./scripts/generate-prprompts.sh file security_and_compliance --preview
```

### 4. Multi-AI Workflow

```bash
# Use Claude for PRD creation (best accuracy)
claude create-prd

# Use Gemini for PRPROMPTS generation (free tier)
gemini gen-prprompts

# Use Qwen for large codebase analysis
qwen analyze-prd
```

### 5. CI/CD Integration

```yaml
# .github/workflows/validate-prprompts.yml
name: Validate PRPROMPTS Compliance

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check validation gates
        run: |
          flutter test --coverage
          flutter analyze
          # Add custom validation scripts
```

---

## Next Steps

- **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Customization:** [CUSTOMIZATION.md](CUSTOMIZATION.md)
- **API Reference:** [API.md](API.md)
- **Examples:** [../examples/](../examples/)

---

## Quick Reference Card

```bash
# PRD Creation
claude auto-gen-prd         # 1 min - from description
claude prd-from-files       # 2 min - from existing docs
claude create-prd           # 5 min - interactive wizard

# PRPROMPTS Generation
claude gen-prprompts        # All 32 files + README
claude gen-phase-1          # Phase 1 (10 files)
claude gen-phase-2          # Phase 2 (12 files)
claude gen-phase-3          # Phase 3 (10 files)
claude gen-file             # Single file

# Validation
cat PRPROMPTS/README.md     # Index and usage
grep "VALIDATION" PRPROMPTS/*.md  # All validation gates
flutter test --coverage     # Run tests
```

---

**Need Help?**
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)
