# PRPROMPTS Architecture Documentation

> **Complete system design, component interactions, and automation pipeline architecture**

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Extension System](#extension-system)
5. [Automation Pipeline](#automation-pipeline)
6. [Security Model](#security-model)
7. [Integration Points](#integration-points)
8. [Development Guide](#development-guide)

---

## 🎯 System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRPROMPTS System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐      ┌──────────┐      ┌──────────────┐        │
│  │   PRD    │─────▶│ Generator │─────▶│  32 PRPROMPTS│        │
│  │ Creation │      │  Engine   │      │    Files     │        │
│  └──────────┘      └──────────┘      └──────────────┘        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           v4.0 Automation Pipeline (NEW)                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Bootstrap → Implement → Review → Full-Cycle → QA       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐        │
│  │   Claude    │   │    Qwen     │   │   Gemini    │        │
│  │  Extension  │   │  Extension  │   │  Extension  │        │
│  └─────────────┘   └─────────────┘   └─────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **AI-Agnostic Design**: Identical functionality across Claude, Qwen, and Gemini
2. **Security-First**: Built-in compliance patterns (HIPAA, PCI-DSS, GDPR, etc.)
3. **Automation-Driven**: v4.0 pipeline automates 90% of development workflow
4. **Template-Based**: PRD-driven customization of all generated content
5. **Extensible**: Easy to add new AIs, prompts, or automation commands

---

## 🏗️ Component Architecture

### 1. PRD Creation Layer

**Purpose:** Convert user intent into structured Product Requirements Document

**Components:**

```
PRD Creation Methods
├── Interactive Wizard (create-prd)
│   ├── 10 questions
│   ├── YAML frontmatter generation
│   └── docs/PRD.md output
│
├── Auto-Generation (auto-gen-prd)
│   ├── project_description.md input
│   ├── AI inference
│   └── docs/PRD.md output
│
├── From Files (prd-from-files)
│   ├── Multiple markdown inputs
│   ├── Content extraction
│   └── docs/PRD.md output
│
└── Manual (template copy)
    └── Direct editing of PRD template
```

**File Locations:**
- `.claude/prompts/generate-prd.md` - Interactive wizard prompt
- `.claude/prompts/auto-generate-prd.md` - Auto-generation prompt
- `.claude/prompts/generate-prd-from-files.md` - File conversion prompt
- `templates/PRD-full-template.md` - Manual template

**Data Format (PRD):**
```yaml
---
project_name: "YourApp"
project_type: "healthcare|fintech|ecommerce|productivity"
platforms: ["ios", "android", "web"]
compliance: ["hipaa", "pci-dss", "gdpr"]
auth_method: "jwt|oauth2|firebase"
sensitive_data: ["phi", "pii", "payment"]
offline_support: true|false
real_time: true|false
team_size: "solo|small|medium|large"
demo_frequency: "daily|weekly|biweekly|monthly"
---

# Project Name

[Markdown content with user stories, features, technical requirements]
```

### 2. PRPROMPTS Generator Engine

**Purpose:** Transform PRD into 32 customized development guides

**Architecture:**

```
Generator Engine
├── Phase 1: Core Architecture (10 files)
│   ├── Feature Scaffold
│   ├── Responsive Layout
│   ├── BLoC Implementation
│   ├── API Integration
│   ├── Testing Strategy
│   ├── Design System
│   ├── Junior Onboarding
│   ├── Accessibility
│   ├── Internationalization
│   └── Performance
│
├── Phase 2: Quality & Security (12 files)
│   ├── Git Branching
│   ├── Progress Tracking
│   ├── Multi-Team Coordination
│   ├── Security Audit
│   ├── Release Management
│   ├── Security & Compliance ★
│   ├── Performance (Detailed)
│   ├── Quality Gates
│   ├── Localization & A11y
│   ├── Versioning
│   ├── Team Culture
│   └── Auto-Documentation
│
└── Phase 3: Demo & Learning (10 files)
    ├── AI Pair Programming
    ├── Dashboard & Analytics
    ├── Tech Debt
    ├── Demo Environment ★
    ├── Demo Progress
    ├── Demo Branding
    ├── Demo Deployment
    ├── Client Reports
    ├── Role Adaptation ★
    └── Lessons Learned
```

**Generation Process:**

```
1. Read PRD
   ↓
2. Parse YAML frontmatter
   ↓
3. Extract project metadata
   ↓
4. For each of 32 files:
   a. Load file template
   b. Inject PRD data
   c. Apply customizations:
      - Compliance-specific patterns
      - Team-size adaptations
      - Platform-specific code
      - Auth method examples
   d. Generate 500-600 words
   e. Follow PRP pattern (6 sections)
   ↓
5. Create README.md index
   ↓
6. Validate output (optional)
```

**File Locations:**
- `.claude/prompts/prprompts-generator.md` - Main generator prompt (all 32 files)
- `.claude/prompts/phase-1-core.md` - Phase 1 generator
- `.claude/prompts/phase-2-quality.md` - Phase 2 generator
- `.claude/prompts/phase-3-demo.md` - Phase 3 generator
- `.claude/prompts/single-file-generator.md` - Single file generator

### 3. PRP Pattern (6-Section Structure)

Every PRPROMPTS file follows this exact structure:

```markdown
## FEATURE
What this guide helps you accomplish

[150-200 words describing the feature]

## EXAMPLES
Real code with actual Flutter file paths

[100-150 words + code examples]

## CONSTRAINTS
✅ DO / ❌ DON'T rules

[100-150 words of clear rules]

## VALIDATION GATES
Pre-commit checklist + CI/CD automation

[50-100 words + checklist]

## BEST PRACTICES
Junior-friendly "Why?" explanations

[100-150 words explaining rationale]

## REFERENCES
Official docs, compliance guides, ADRs

[50 words + links]
```

**Total:** 500-600 words per file

---

## 🔄 Data Flow

### Complete Workflow

```
User Intent
    ↓
[PRD Creation]
    ↓
docs/PRD.md (YAML + Markdown)
    ↓
[PRPROMPTS Generator]
    ↓
PRPROMPTS/*.md (32 files + README)
    ↓
[v4.0 Automation Pipeline] ← NEW!
    ↓
Working Flutter App
```

### Detailed PRD → PRPROMPTS Flow

```
┌─────────────────────────────────────────────────────────┐
│ PRD Analysis                                            │
├─────────────────────────────────────────────────────────┤
│ 1. Extract YAML frontmatter                            │
│ 2. Parse project_type, compliance, platforms           │
│ 3. Build customization matrix                          │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Customization Rules                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ IF compliance includes "hipaa":                        │
│   → Add PHI encryption patterns (AES-256-GCM)          │
│   → Add audit logging requirements                     │
│   → Add HTTPS-only validation                          │
│                                                         │
│ IF compliance includes "pci-dss":                      │
│   → Add payment tokenization (Stripe/PayPal)           │
│   → Add TLS 1.2+ requirements                          │
│   → Add SAQ checklist                                  │
│                                                         │
│ IF auth_method == "jwt":                               │
│   → Use RS256 verification (public key only)           │
│   → Never include signing (no private keys)            │
│                                                         │
│ IF team_size == "solo":                                │
│   → Simplify review process                            │
│   → Reduce approval requirements                       │
│                                                         │
│ IF platforms includes "web":                           │
│   → Add responsive layout patterns                     │
│   → Add browser-specific considerations                │
│                                                         │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ File Generation (32 files)                             │
├─────────────────────────────────────────────────────────┤
│ For each file:                                          │
│   1. Load base template                                │
│   2. Apply customization rules                         │
│   3. Inject real code examples                         │
│   4. Add compliance-specific patterns                  │
│   5. Generate validation gates                         │
│   6. Create best practices section                     │
│   7. Add references                                     │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Output (PRPROMPTS/)                                     │
├─────────────────────────────────────────────────────────┤
│ 01-feature_scaffold.md (custom for your project)       │
│ 02-responsive_layout.md (iOS/Android/Web specific)     │
│ 03-bloc_implementation.md (your use cases)             │
│ ...                                                     │
│ 16-security_and_compliance.md (HIPAA/PCI-DSS/GDPR)     │
│ ...                                                     │
│ 32-lessons_learned_engine.md                           │
│ README.md (index with usage instructions)              │
└─────────────────────────────────────────────────────────┘
```

---

## 🎁 Extension System

### Architecture

Each AI assistant (Claude, Qwen, Gemini) has an identical extension structure:

```
Extension Components
├── Extension Manifest (*-extension.json)
│   ├── Metadata (name, version, description)
│   ├── AI requirements
│   ├── Features list (14 commands)
│   ├── Installation instructions
│   ├── Quick start guide
│   └── Comparison advantages
│
├── Extension Installer (install-*-extension.sh)
│   ├── Prerequisites check (AI installed)
│   ├── Config directory creation
│   ├── Prompts installation
│   ├── Commands installation (14 + 5 automation)
│   ├── Config file setup
│   └── Verification
│
├── Configuration (.*/{AI}/config.yml)
│   ├── Command mappings
│   ├── Prompt paths
│   ├── Project metadata
│   └── AI-specific settings
│
├── Prompts (.*/{AI}/prompts/)
│   ├── PRD generation prompts (4 files)
│   ├── PRPROMPTS generation prompts (5 files)
│   └── Total: 9 prompt files
│
└── Automation Commands (.*/{AI}/commands/automation/)
    ├── bootstrap-from-prprompts.md
    ├── implement-next.md
    ├── full-cycle.md
    ├── review-and-commit.md
    └── qa-check.md
```

### Extension Installation Flow

```
User runs: npm install -g prprompts-flutter-generator
    ↓
[Postinstall Script]
    ↓
Detects installed AIs (Claude/Qwen/Gemini)
    ↓
For each detected AI:
  1. Create config directory (~/.config/{ai}/)
  2. Copy 9 prompt files
  3. Copy 5 automation commands
  4. Create config.yml
  5. Create extension.json
  6. Register all 14 commands
    ↓
User can now run:
  - claude create-prd
  - qwen gen-prprompts
  - gemini bootstrap-from-prprompts
  etc.
```

### Command Registry

**14 Total Commands per AI:**

**PRD Commands (4):**
1. `create-prd` - Interactive wizard
2. `auto-gen-prd` - Auto-generation
3. `prd-from-files` - From existing docs
4. `analyze-prd` - Validation

**PRPROMPTS Generation (5):**
5. `gen-prprompts` - All 32 files
6. `gen-phase-1` - Phase 1 only (10 files)
7. `gen-phase-2` - Phase 2 only (12 files)
8. `gen-phase-3` - Phase 3 only (10 files)
9. `gen-file <name>` - Single file

**v4.0 Automation (5):**
10. `bootstrap-from-prprompts` - Complete project setup
11. `implement-next` - Auto-implement next feature
12. `full-cycle` - Implement 1-10 features
13. `review-and-commit` - Validate & commit
14. `qa-check` - Compliance audit

---

## 🤖 v4.0 Automation Pipeline

### Architecture

```
PRPROMPTS Files
    ↓
[bootstrap-from-prprompts]
    ↓
Complete Project Structure
    ↓
ARCHITECTURE.md + IMPLEMENTATION_PLAN.md
    ↓
[implement-next] × N times
    ↓
Features with Tests
    ↓
[review-and-commit]
    ↓
Validated Commits
    ↓
[full-cycle] (orchestrates above)
    ↓
Production App
    ↓
[qa-check]
    ↓
QA_REPORT.md (compliance score)
```

### 1. Bootstrap Command

**Input:** 32 PRPROMPTS files
**Output:** Complete project structure

```
lib/
├── core/
│   ├── security/
│   │   ├── jwt_verifier.dart      ← From 16-security_and_compliance.md
│   │   ├── encryption_service.dart ← From 16-security_and_compliance.md
│   │   └── secure_storage.dart
│   ├── theme/
│   │   ├── app_theme.dart          ← From 06-design_system.md
│   │   └── design_tokens.dart
│   ├── network/
│   │   ├── api_client.dart         ← From 04-api_integration.md
│   │   └── interceptors/
│   └── di/
│       └── injection.dart
├── features/
│   └── auth/
│       ├── data/
│       │   ├── repositories/
│       │   └── datasources/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/
│           ├── bloc/
│           ├── pages/
│           └── widgets/
└── main.dart

test/
├── core/
├── features/
└── integration/

ARCHITECTURE.md          ← System overview
IMPLEMENTATION_PLAN.md   ← Task list for implement-next
```

**Process:**
1. Read all 32 PRPROMPTS files
2. Extract architecture patterns from 01-feature_scaffold.md
3. Extract security patterns from 16-security_and_compliance.md
4. Extract design system from 06-design_system.md
5. Generate Clean Architecture structure
6. Create core infrastructure files
7. Set up dependency injection
8. Create ARCHITECTURE.md
9. Generate IMPLEMENTATION_PLAN.md with 10-20 tasks

### 2. Implement-Next Command

**Input:** IMPLEMENTATION_PLAN.md, PRPROMPTS/
**Output:** Feature implementation + tests

```
[Read IMPLEMENTATION_PLAN.md]
    ↓
Get next pending task:
  "Implement user authentication with biometric support"
    ↓
[Reference relevant PRPROMPTS]
  - 01-feature_scaffold.md (structure)
  - 03-bloc_implementation.md (state management)
  - 04-api_integration.md (API calls)
  - 16-security_and_compliance.md (JWT verification)
    ↓
[Generate Implementation]
  lib/features/auth/
    ├── data/
    │   ├── repositories/auth_repository_impl.dart
    │   └── datasources/auth_remote_datasource.dart
    ├── domain/
    │   ├── entities/user.dart
    │   ├── repositories/auth_repository.dart
    │   └── usecases/login_usecase.dart
    └── presentation/
        ├── bloc/auth_bloc.dart
        ├── pages/login_page.dart
        └── widgets/biometric_button.dart
    ↓
[Generate Tests]
  test/features/auth/
    ├── data/
    │   └── repositories/auth_repository_test.dart (95% coverage)
    ├── domain/
    │   └── usecases/login_usecase_test.dart (100% coverage)
    └── presentation/
        └── bloc/auth_bloc_test.dart (100% coverage)
    ↓
[Security Validation]
  ✓ JWT verified with public key only
  ✓ No private keys in Flutter code
  ✓ Biometric data never leaves device
  ✓ PII encrypted at rest
    ↓
[Code Quality]
  ✓ flutter analyze (0 issues)
  ✓ dart format
  ✓ Test coverage > 70%
    ↓
[Stage Changes]
  git add lib/features/auth/ test/features/auth/
    ↓
Mark task complete in IMPLEMENTATION_PLAN.md
```

### 3. Full-Cycle Command

**Orchestrates multiple iterations of implement-next**

```
User: /full-cycle
System: How many features to implement? (1-10)
User: 5

[Loop 5 times]
    ↓
For i = 1 to 5:
  1. Run implement-next
  2. Validate (security, tests, code quality)
  3. If validation passes:
     - Auto-commit with conventional message
     - Mark task complete
     - Continue to next
  4. If validation fails:
     - Report errors
     - Ask user to fix or skip
    ↓
[Quality Gate]
  ✓ All 5 features implemented
  ✓ All tests passing
  ✓ flutter analyze: 0 issues
  ✓ Test coverage: 85%+
    ↓
[Summary Report]
  Features implemented: 5
  Time taken: 1.5 hours
  Tests generated: 37
  Coverage: 88%
  Security: ✓ All patterns validated
```

### 4. Review-and-Commit Command

**Validates before committing**

```
[PRPROMPTS Compliance]
  ✓ Follows 01-feature_scaffold.md structure
  ✓ Uses BLoC pattern from 03-bloc_implementation.md
  ✓ Security patterns from 16-security_and_compliance.md
    ↓
[Security Validation]
  ✓ JWT: Public key verification only
  ✓ PII: Encrypted at rest (AES-256-GCM)
  ✓ Secrets: None in code
  ✓ HTTPS: All API calls enforced
    ↓
[Test Coverage]
  ✓ Unit tests: > 70%
  ✓ Widget tests: > 60%
  ✓ Integration tests: Present
    ↓
[Code Quality]
  ✓ flutter analyze: 0 issues
  ✓ dart format: Applied
  ✓ No TODOs in production code
    ↓
[Generate Commit Message]
  feat(auth): implement biometric authentication

  - Add biometric login using local_auth
  - Implement JWT verification with RS256
  - Add comprehensive error handling
  - Test coverage: 92%

  Compliance:
  ✓ JWT verified with public key only
  ✓ Biometric data never leaves device
  ✓ PII encrypted at rest (AES-256-GCM)
  ✓ GDPR consent flow implemented

  PRPROMPTS: 16-security_and_compliance.md

  🤖 Generated with Claude Code
    ↓
[Commit]
  git commit -m "..."
```

### 5. QA-Check Command

**Comprehensive compliance audit**

```
[Architecture Validation]
  ✓ Clean Architecture layers
  ✓ BLoC pattern usage
  ✓ Dependency injection
  Score: 25/25
    ↓
[Security Audit]
  ✓ JWT verification (RS256)
  ✓ PHI encryption (AES-256-GCM)
  ✓ HTTPS-only API calls
  ⚠ Add request rate limiting
  Score: 23/25
    ↓
[Testing]
  ✓ Unit tests: 88%
  ✓ Widget tests: 85%
  ✓ Integration tests: 5 passing
  ⚠ Add edge case tests
  Score: 22/25
    ↓
[Compliance]
  ✓ HIPAA: PHI encryption
  ✓ GDPR: Consent management
  ✓ Audit logging
  ⚠ Add data portability
  Score: 22/25
    ↓
[Generate QA_REPORT.md]
  Overall Score: 92/100 ✅

  Recommendations:
  1. Add request rate limiting (minor)
  2. Add more edge case tests
  3. Implement data export feature
```

---

## 🔒 Security Model

### Security Principles

1. **Never sign JWTs in Flutter** - Only verify with public key
2. **Never store PII unencrypted** - Always use AES-256-GCM
3. **Never commit secrets** - Use environment variables
4. **Never log sensitive data** - Implement safe logging
5. **Always use HTTPS** - Enforce TLS 1.2+

### Security Patterns by Compliance

**HIPAA (Healthcare):**
- PHI encryption at rest (AES-256-GCM)
- Audit logging for all PHI access
- HTTPS-only API calls
- Session timeouts
- Device authentication

**PCI-DSS (Payment):**
- Tokenization (Stripe/PayPal)
- Never store full card numbers
- TLS 1.2+ enforcement
- SAQ checklist
- 2+ senior approvals for payment code

**GDPR (EU Users):**
- Consent management
- Right to erasure
- Data portability
- Privacy policy
- Cookie consent

### Implementation in Code

**File:** `16-security_and_compliance.md`

This file is the **single source of truth** for all security patterns. Every generated security file references this PRPROMPTS file.

**Example (JWT Verification):**

```dart
// ✅ CORRECT (From PRPROMPTS 16-security_and_compliance.md)
Future<bool> verifyToken(String token) async {
  final jwt = JWT.verify(
    token,
    RSAPublicKey(publicKey),  // Public key only!
    audience: Audience(['my-app']),
    issuer: 'api.example.com',
  );
  return jwt.payload['exp'] > DateTime.now().millisecondsSinceEpoch / 1000;
}

// ❌ WRONG (Never generated by PRPROMPTS)
final token = JWT({'user': 'john'}).sign(SecretKey('my-secret'));
```

---

## 🔗 Integration Points

### 1. npm Package

**Structure:**
```
prprompts-flutter-generator/
├── bin/
│   └── prprompts                # CLI entry point
├── lib/
│   └── updater.js               # Auto-update system
├── scripts/
│   ├── postinstall.js           # Post-install configuration
│   ├── install-*-extension.sh   # AI-specific installers
│   └── test-*.sh                # Test scripts
├── .claude/                      # Claude prompts & commands
├── .qwen/                        # Qwen prompts & commands
├── .gemini/                      # Gemini prompts & commands
├── templates/                    # PRD templates
├── completions/                  # Shell completions
└── package.json
```

**Postinstall Flow:**
```javascript
// scripts/postinstall.js
1. Detect OS (Windows/macOS/Linux)
2. Check for Claude Code (`which claude`)
3. Check for Qwen Code (`which qwen`)
4. Check for Gemini CLI (`which gemini`)
5. For each detected AI:
   - Run install-{ai}-extension.sh
   - Copy prompts to ~/.config/{ai}/prompts/
   - Copy automation commands
   - Create config.yml
6. Create unified config (~/.prprompts/config.json)
7. Set up CLI (`prprompts` command)
8. Show summary of installed extensions
```

### 2. AI Assistant Integration

**Claude Code:**
- Config: `~/.config/claude/config.yml`
- Prompts: `~/.config/claude/prompts/*.md`
- Commands: `~/.config/claude/commands/automation/*.md`
- Extension: `~/.config/claude/extension.json`

**Qwen Code:**
- Config: `~/.config/qwen/config.yml`
- Prompts: `~/.config/qwen/prompts/*.md`
- Commands: `~/.config/qwen/commands/automation/*.md`
- Extension: `~/.config/qwen/extension.json`

**Gemini CLI:**
- Config: `~/.config/gemini/config.yml`
- Prompts: `~/.config/gemini/prompts/*.md`
- Commands: `~/.config/gemini/commands/automation/*.md`
- Extension: `~/.config/gemini/extension.json`

### 3. Git Workflow

**Automation Pipeline & Git:**

```
[implement-next]
    ↓
Generates code + tests
    ↓
git add lib/features/{feature}/ test/features/{feature}/
    ↓
[review-and-commit]
    ↓
Validates code
    ↓
git commit -m "feat({feature}): ..."
    ↓
[full-cycle] (repeats above N times)
    ↓
Multiple validated commits
    ↓
[qa-check]
    ↓
Generates QA_REPORT.md
    ↓
Ready for: git push
```

**Commit Message Format:**

```
<type>(<scope>): <subject>

<body>

Compliance:
✓ Security pattern 1
✓ Security pattern 2

PRPROMPTS: 16-security_and_compliance.md

🤖 Generated with [Claude Code|Qwen Code|Gemini CLI]
```

---

## 💻 Development Guide

### Adding a New Prompt

1. **Create prompt file** (e.g., `.claude/prompts/my-new-prompt.md`)
2. **Follow PRPROMPTS pattern** (if applicable)
3. **Test with AI:**
   ```bash
   claude my-new-command
   ```
4. **Register in config.yml:**
   ```yaml
   commands:
     my-new-command:
       prompt: "prompts/my-new-prompt.md"
       description: "What it does"
   ```
5. **Copy to other AIs:**
   ```bash
   cp .claude/prompts/my-new-prompt.md .qwen/prompts/
   cp .claude/prompts/my-new-prompt.md .gemini/prompts/
   ```

### Adding a New AI

1. **Create AI directory:**
   ```bash
   mkdir -p .{newai}/prompts
   mkdir -p .{newai}/commands/automation
   ```

2. **Copy prompts:**
   ```bash
   cp .claude/prompts/*.md .{newai}/prompts/
   cp .claude/commands/automation/*.md .{newai}/commands/automation/
   ```

3. **Create config:**
   ```yaml
   # .{newai}/config.yml
   project:
     name: "prprompts-flutter-generator"
     version: "4.0.0"

   commands:
     create-prd:
       prompt: "prompts/generate-prd.md"
     # ... all 14 commands
   ```

4. **Create installer:**
   ```bash
   cp install-claude-extension.sh install-{newai}-extension.sh
   # Edit to use {newai} paths
   ```

5. **Update postinstall.js:**
   ```javascript
   // Add detection for new AI
   const hasNewAI = await checkCommand('newai');
   if (hasNewAI) {
     await installExtension('newai');
   }
   ```

### Testing Locally

```bash
# 1. Install package locally
npm install -g .

# 2. Verify CLI
prprompts --version
prprompts doctor

# 3. Test commands
cd /tmp/test-project
prprompts create
prprompts generate

# 4. Test with specific AI
claude gen-prprompts
qwen gen-prprompts
gemini gen-prprompts

# 5. Test automation
claude bootstrap-from-prprompts
claude implement-next
```

### Debugging

**Check installation:**
```bash
prprompts doctor
```

**Check config files:**
```bash
# Claude
cat ~/.config/claude/config.yml
ls ~/.config/claude/prompts/

# Qwen
cat ~/.config/qwen/config.yml
ls ~/.config/qwen/prompts/

# Gemini
cat ~/.config/gemini/config.yml
ls ~/.config/gemini/prompts/
```

**Check command registration:**
```bash
claude --help
qwen --help
gemini --help
```

**Test specific prompt:**
```bash
# Edit prompt file
vim ~/.config/claude/prompts/generate-prd.md

# Test immediately
claude create-prd
```

---

## 📊 Performance Metrics

### Generation Time

| Task | Time | Details |
|------|------|---------|
| PRD Creation (interactive) | 5 min | 10 questions |
| PRD Creation (auto) | 1 min | From description |
| PRPROMPTS Generation (all) | 60 sec | 32 files |
| Bootstrap Project | 2-5 min | Complete structure |
| Implement Feature | 5-15 min | With tests |
| Full Cycle (5 features) | 1-2 hours | Automated |
| QA Check | 2 min | Compliance audit |

### Speed Improvement

**Manual vs PRPROMPTS v4.0:**

| Task | Manual | v4.0 Automation | Speedup |
|------|--------|-----------------|---------|
| Project Setup | 4-8 hours | 2-5 min | **96-192x** |
| Single Feature | 2-4 hours | 5-15 min | **8-48x** |
| 10 Features | 3-5 days | 1-2 hours | **36-60x** |
| Complete App | 2-3 weeks | 2-3 hours | **56-84x** |

---

## 🎯 Summary

**PRPROMPTS Architecture:**

1. **Modular Design** - Each component independent and testable
2. **AI-Agnostic** - Works identically across Claude, Qwen, Gemini
3. **Security-First** - Compliance patterns built into every layer
4. **Automation-Driven** - v4.0 pipeline automates 90% of workflow
5. **Extensible** - Easy to add new AIs, prompts, commands

**Key Innovation:**

The **v4.0 Automation Pipeline** is the breakthrough feature that transforms PRPROMPTS from a "documentation generator" into a **complete development automation platform**.

```
PRD → PRPROMPTS → Working Code
 1min    60sec      1-2 hours

Total: Production app in 2-3 hours (vs 3-5 days manual)
```

---

## 📚 Additional Resources

- [PRPROMPTS Specification](docs/PRPROMPTS-SPECIFICATION.md) - File format and patterns
- [Automation Guide](docs/AUTOMATION-GUIDE.md) - Complete automation workflow
- [Development Guide](DEVELOPMENT.md) - Contributing guidelines
- [API Reference](docs/API.md) - All commands and options
- [AI Comparison](docs/AI-COMPARISON.md) - Claude vs Qwen vs Gemini

---

<div align="center">

**Made with ❤️ for Flutter developers**

[GitHub](https://github.com/Kandil7/prprompts-flutter-generator) •
[npm](https://www.npmjs.com/package/prprompts-flutter-generator) •
[Documentation](docs/)

</div>
