# PRPROMPTS Flutter Generator - Gemini CLI Skills

## 🚀 Overview

The PRPROMPTS Flutter Generator is now available as native Gemini CLI TOML slash commands! All 8 specialized automation skills are automatically installed globally when you install PRPROMPTS via npm.

**Gemini-Specific Advantages:**
- ✅ **1M Token Context** - Analyze entire codebases (5x larger than Claude)
- ✅ **{{args}} Support** - Inline arguments for streamlined workflows
- ✅ **ReAct Agent Mode** - Autonomous reasoning and acting loops
- ✅ **Free Tier** - 60 req/min, 1,000/day (no credit card required)
- ✅ **Colon Separator** - `/skills:automation:code-reviewer` syntax

## 📦 Available Skills (8 Total)

### 🤖 Automation Skills (5)
Complete automation pipeline for Flutter development.

- **`flutter-bootstrapper`** - Bootstrap complete Flutter project with Clean Architecture, security, tests
- **`feature-implementer`** - Automatically implement features from implementation plan
- **`automation-orchestrator`** - Orchestrate multi-feature implementation (1-10 features)
- **`code-reviewer`** - Review code against PRPROMPTS patterns + security audit
- **`qa-auditor`** - Comprehensive compliance audit (HIPAA, PCI-DSS, GDPR)

### 📝 PRPROMPTS Core Skills (2)
Essential skills for PRPROMPTS generation.

- **`phase-generator`** - Generate PRPROMPTS files by phase (1=Core, 2=Quality, 3=Demo)
- **`single-file-generator`** - Regenerate individual PRPROMPTS files (1-32)

### 🔧 Development Workflow Skills (1)
Environment configuration and setup.

- **`flutter-flavors`** - Configure environment flavors (dev, staging, production)

## 🎯 Quick Start

### Installation

Skills are automatically installed when you install PRPROMPTS:

```bash
# Install PRPROMPTS globally
npm install -g prprompts-flutter-generator

# Skills auto-install to ~/.gemini/commands/skills/
```

### Verify Installation

```bash
# Start Gemini CLI
gemini

# List all commands (includes skills)
/help

# You should see:
# /skills:automation:flutter-bootstrapper
# /skills:automation:feature-implementer
# /skills:automation:automation-orchestrator
# /skills:automation:code-reviewer
# /skills:automation:qa-auditor
# /skills:prprompts-core:phase-generator
# /skills:prprompts-core:single-file-generator
# /skills:development-workflow:flutter-flavors
```

### Basic Usage

```bash
gemini

# Interactive mode (prompts for inputs)
/skills:automation:flutter-bootstrapper

# Inline arguments (no prompts!)
/skills:automation:flutter-bootstrapper . true true true true hipaa
```

## 🎨 Gemini-Specific Features

### 1. Colon Separator Syntax

Gemini uses **colons** to separate skill path components (not slashes like Qwen):

```bash
# Gemini syntax (colon separator)
/skills:automation:code-reviewer
/skills:prprompts-core:phase-generator

# NOT (this is Qwen syntax)
/skills/automation/code-reviewer
```

### 2. Inline Arguments with {{args}}

Pass arguments inline without interactive prompts:

```bash
# Interactive mode (traditional)
/skills:automation:code-reviewer
# > Review type? security
# > Target path? lib/features/auth
# > Auto-fix? true

# Inline mode (Gemini feature!)
/skills:automation:code-reviewer security lib/features/auth true
# No prompts - arguments parsed automatically!
```

**How it works:**
- Gemini captures everything after the command as `{{args}}`
- Skill prompt includes argument parsing instructions
- Arguments are matched to input schema from skill.json

### 3. 1M Token Context Utilization

Gemini can load entire projects in memory:

```bash
# Load entire codebase (150 files, 15K LOC)
/skills:automation:code-reviewer full lib/

# Gemini loads in single pass:
# - All 150 files in lib/
# - All 32 PRPROMPTS files
# - docs/PRD.md
# - IMPLEMENTATION_PLAN.md
# Total: ~800KB (fits in 1M context!)

# Benefits:
# - No "should I read more files?" questions
# - Cross-references patterns across all files
# - Detects architectural violations spanning multiple layers
```

### 4. ReAct Agent Mode

Gemini autonomously reasons and acts:

```bash
/skills:automation:automation-orchestrator 10

# ReAct Loop:
# Iteration 1:
#   Reason: "Need to implement auth first"
#   Act: Run feature-implementer for authentication
#   Result: 12 files created
#   Validation: Run tests → 3 failures
#
# Iteration 2:
#   Reason: "Tests failed due to missing mock factory"
#   Act: Generate mock factory
#   Result: test/mocks/user_repository_mock.dart created
#   Validation: Run tests → All pass ✅
#
# [Continues autonomously for all 10 features]
```

### 5. Free Tier Optimization

Maximize Gemini's generous free tier:

```bash
# Free tier limits:
# - 60 requests/minute (4x more than Claude)
# - 1,000 requests/day (10x more than Claude)

# Optimize by batching operations:
/skills:automation:automation-orchestrator 10
# Instead of 10 separate /skills:automation:feature-implementer calls

# Use 1M context to avoid multiple requests:
/skills:automation:code-reviewer full lib/
# Reviews entire codebase in 1 request
# vs. 10+ incremental requests in other AIs
```

## 📚 Skill Documentation

### 🚀 flutter-bootstrapper

**Purpose:** Complete Flutter project setup with Clean Architecture, security, and testing.

**Usage:**
```bash
# Interactive mode
/skills:automation:flutter-bootstrapper

# Inline arguments
/skills:automation:flutter-bootstrapper . true true true true hipaa,pci-dss
```

**Smart Defaults:**
- `project_path`: "." (current directory)
- `enable_state_management`: true (BLoC)
- `enable_security`: true (JWT, encryption)
- `enable_testing`: true (80% coverage target)
- `enable_ci_cd`: true (GitHub Actions)
- `compliance`: [] (optional: hipaa, pci-dss, gdpr)

**Execution Time:** 60 seconds (leverages 1M context)

**Output:** 30 files (~5,000 lines)
- Clean Architecture folder structure
- JWT verification setup (RS256)
- AES-256-GCM encryption utilities
- BLoC state management
- Unit + widget test infrastructure
- GitHub Actions CI/CD workflow

---

### ✨ feature-implementer

**Purpose:** Auto-implement a single feature from implementation plan.

**Usage:**
```bash
# Interactive
/skills:automation:feature-implementer

# Inline arguments
/skills:automation:feature-implementer authentication IMPLEMENTATION_PLAN.md true 85 true
```

**Smart Defaults:**
- `feature_name`: (required - user must specify)
- `implementation_plan_path`: "IMPLEMENTATION_PLAN.md"
- `auto_test`: true
- `test_coverage_target`: 80
- `follow_prprompts`: true

**Execution Time:** 2-3 minutes per feature

**Output:** 15 files per feature (~2,000 lines)
- Domain layer (entities, repositories, use cases)
- Data layer (models, data sources, repository impl)
- Presentation layer (BLoC, screens, widgets)
- Tests (unit + widget, 80%+ coverage)

---

### 🤖 automation-orchestrator

**Purpose:** Orchestrate multi-feature implementation (1-10 features).

**Usage:**
```bash
# Interactive
/skills:automation:automation-orchestrator

# Inline arguments
/skills:automation:automation-orchestrator 10 IMPLEMENTATION_PLAN.md false true false 1
```

**Smart Defaults:**
- `num_features`: (required - user must specify)
- `implementation_plan_path`: "IMPLEMENTATION_PLAN.md"
- `pause_between_features`: false
- `run_qa_after_each`: true
- `auto_commit`: false
- `max_parallel`: 1 (sequential)

**Execution Time:** 2-3 minutes per feature (20-30 min for 10 features)

**Output:** Full application with tests
- 150+ files for 10 features
- 15,000+ lines of code
- 80%+ test coverage
- QA compliance score: 85/100 average

**Gemini Advantage:** ReAct loop autonomously handles test failures and validation errors.

---

### ✅ code-reviewer

**Purpose:** Review code against PRPROMPTS patterns, security, architecture, style.

**Usage:**
```bash
# Interactive
/skills:automation:code-reviewer

# Inline arguments (security review with auto-fix)
/skills:automation:code-reviewer security lib/features/auth true markdown error
```

**Smart Defaults:**
- `target_path`: "lib/"
- `review_type`: "full" (options: full, architecture, security, testing, style)
- `auto_fix`: false
- `output_format`: "markdown" (options: markdown, json, console)
- `severity_threshold`: "warning" (options: error, warning, info)

**Execution Time:** 30-45 seconds (leverages 1M context to load entire codebase)

**Output:** Comprehensive review report with:
- Architecture compliance (Clean Architecture)
- Security patterns (JWT, encryption, HIPAA/PCI-DSS)
- Testing coverage analysis
- Style violations (flutter analyze)
- Line-by-line fixes with references

**Gemini Advantage:** Loads entire project in single pass, cross-references all 32 PRPROMPTS files.

---

### 🔍 qa-auditor

**Purpose:** Comprehensive QA and compliance audit.

**Usage:**
```bash
# Interactive
/skills:automation:qa-auditor

# Inline arguments (HIPAA + PCI-DSS audit)
/skills:automation:qa-auditor . hipaa,pci-dss true true QA_REPORT.md 85
```

**Smart Defaults:**
- `project_path`: "."
- `compliance_standards`: [] (hipaa, pci-dss, gdpr, soc2)
- `include_performance`: true
- `include_accessibility`: true
- `output_path`: "QA_REPORT.md"
- `fail_threshold`: 70 (score below 70 = fail)

**Execution Time:** 60-90 seconds

**Output:** `QA_REPORT.md` with score (0-100)
- Architecture audit (25 points)
- Security audit (30 points) - compliance-specific checks
- Testing audit (25 points)
- Code quality audit (10 points)
- Performance audit (5 points - optional)
- Accessibility audit (5 points - optional)

**Example Report:**
```
Score: 87/100 ✅ PASS (threshold: 85)

HIPAA Compliance ✅ PASS:
- PHI encrypted at rest (AES-256-GCM)
- Audit logging implemented
- Session timeouts configured
⚠️  Recommendation: Add PHI access logging

PCI-DSS Compliance ✅ PASS:
- No card storage detected
- Using Stripe tokenization
- HTTPS-only enforcement
```

---

### 📝 phase-generator

**Purpose:** Generate PRPROMPTS files by phase.

**Usage:**
```bash
# Interactive
/skills:prprompts-core:phase-generator

# Inline arguments (generate Phase 1)
/skills:prprompts-core:phase-generator 1 docs/PRD.md PRPROMPTS/ false
```

**Smart Defaults:**
- `phase`: (required - 1, 2, or 3)
- `prd_path`: "docs/PRD.md"
- `output_dir`: "PRPROMPTS/"
- `overwrite_existing`: false

**Execution Time:** 15-20 seconds per phase

**Output:**
- **Phase 1 (Core):** 15 files - architecture, tech stack, navigation
- **Phase 2 (Quality):** 12 files - security, testing, performance
- **Phase 3 (Demo):** 5 files - demo content, deployment

---

### 📄 single-file-generator

**Purpose:** Regenerate a single PRPROMPTS file (1-32).

**Usage:**
```bash
# Interactive
/skills:prprompts-core:single-file-generator

# Inline arguments (regenerate file 16 - security_and_compliance.md)
/skills:prprompts-core:single-file-generator 16 docs/PRD.md PRPROMPTS/ true
```

**Smart Defaults:**
- `file_number`: (required - 1 to 32)
- `prd_path`: "docs/PRD.md"
- `output_dir`: "PRPROMPTS/"
- `backup_existing`: true

**Execution Time:** 3-5 seconds

---

### 🔧 flutter-flavors

**Purpose:** Configure Flutter environment flavors (dev, staging, production).

**Usage:**
```bash
# Interactive
/skills:development-workflow:flutter-flavors

# Inline arguments
/skills:development-workflow:flutter-flavors dev,staging,prod dart true both
```

**Smart Defaults:**
- `flavors`: ["dev", "staging", "production"]
- `config_format`: "dart" (options: dart, json, env)
- `enable_firebase`: false
- `platform`: "both" (options: ios, android, both)

**Execution Time:** 20-25 seconds

**Output:** 6-8 files
- `lib/config/app_config.dart` - Flavor configurations
- Android flavor setup (`android/app/build.gradle`)
- iOS flavor setup (Fastlane)
- Launch configurations (`.vscode/launch.json`)

## 🔄 Complete Workflows

### Workflow 1: Quick Bootstrap (2 minutes)

```bash
gemini

# 1. Bootstrap project
/skills:automation:flutter-bootstrapper . true true true true hipaa

# Result:
# - 30 files created
# - Clean Architecture setup
# - Security infrastructure
# - Test framework
```

### Workflow 2: Full Development Cycle (30 minutes)

```bash
gemini

# 1. Bootstrap project
/skills:automation:flutter-bootstrapper

# 2. Implement 10 features
/skills:automation:automation-orchestrator 10

# 3. Final QA audit
/skills:automation:qa-auditor . hipaa,pci-dss true true QA_REPORT.md 85

# Result:
# - 150+ files
# - 15,000+ lines of code
# - 80%+ test coverage
# - QA score: 87/100 ✅ PASS
```

### Workflow 3: Security Audit (3 minutes)

```bash
gemini

# 1. Security review
/skills:automation:code-reviewer security lib/ false markdown error

# 2. Auto-fix issues
/skills:automation:code-reviewer security lib/ true markdown warning

# 3. Compliance audit
/skills:automation:qa-auditor . hipaa,pci-dss true true COMPLIANCE_AUDIT.md 90
```

## 📊 Performance Benchmarks

| Skill | Execution Time | Output | Speed vs. Manual |
|-------|---------------|--------|------------------|
| flutter-bootstrapper | 60 sec | 30 files (5K LOC) | 40x faster |
| feature-implementer | 2.5 min | 15 files (2K LOC) | 50x faster |
| automation-orchestrator (10) | 27 min | 150 files (15K LOC) | 45x faster |
| code-reviewer (full) | 45 sec | 47 files reviewed | 30x faster |
| qa-auditor | 90 sec | Compliance report | 60x faster |

**Total Project Time:**
- **Manual:** 3-5 days (24-40 hours)
- **With PRPROMPTS + Gemini:** 30 minutes
- **Speed-up:** 48-80x faster

## 🎨 Customization

### Custom Skill Chains

Create custom aliases in `.gemini/commands/`:

```toml
# .gemini/commands/my-workflow.toml
description = "My custom setup workflow"

prompt = """
Run the following skills in sequence:

1. /skills:automation:flutter-bootstrapper . true true true true {{compliance}}
2. /skills:prprompts-core:phase-generator 1
3. /skills:development-workflow:flutter-flavors dev,staging,prod dart false both

Ask user for compliance standards, then execute all three skills.
"""
```

Usage:
```bash
gemini
/my-workflow
# > Compliance? hipaa
# [Runs all 3 skills automatically]
```

## 🆘 Troubleshooting

### Skills Not Found

```bash
# Check installation
ls ~/.gemini/commands/skills/automation/
# Should show: flutter-bootstrapper.toml, code-reviewer.toml, etc.

# Reinstall if missing
npm install -g prprompts-flutter-generator

# Or manually:
bash ~/node_modules/prprompts-flutter-generator/scripts/install-gemini-skills.sh
```

### Command Not Recognized (Windows)

```powershell
# Use PowerShell installer
cd $env:APPDATA\npm\node_modules\prprompts-flutter-generator\scripts
.\install-gemini-skills.ps1

# Or batch file
.\install-gemini-skills.bat
```

### Missing Required Input

```bash
# Check required inputs in TOML file
cat ~/.gemini/commands/skills/automation/flutter-bootstrapper.toml

# Provide all required inputs explicitly
/skills:automation:flutter-bootstrapper my-project true true true true hipaa
```

### Rate Limit Exceeded

```bash
# Free tier: 60 req/min, 1,000 req/day

# Solution 1: Batch operations
/skills:automation:automation-orchestrator 10
# Instead of 10 separate calls

# Solution 2: Wait 1 minute (60 req/min limit resets)

# Solution 3: Upgrade to paid tier
# Paid: 1,000 req/min, unlimited/day
```

## 🔗 Links

- **[Complete Skills Guide](../../docs/GEMINI-SKILLS-GUIDE.md)** - 900+ line comprehensive guide
- **[Gemini Setup Guide](../../GEMINI.md)** - Installation and configuration
- **[PRPROMPTS Specification](../../docs/PRPROMPTS-SPECIFICATION.md)** - v2.0 specification
- **[Main README](../../README.md)** - Project overview

---

**Version 1.0.0 | PRPROMPTS Flutter Generator Skills for Gemini CLI**

*Powered by Gemini 2.5 Pro | 1M Token Context | Free Tier: 60 req/min*
