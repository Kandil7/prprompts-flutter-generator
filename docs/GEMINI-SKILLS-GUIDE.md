# Gemini CLI Skills Guide

Complete guide to PRPROMPTS skills for Gemini CLI.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Skills Reference](#skills-reference)
  - [Automation Skills](#automation-skills)
  - [PRPROMPTS Core Skills](#prprompts-core-skills)
  - [Development Workflow Skills](#development-workflow-skills)
- [Gemini-Specific Features](#gemini-specific-features)
- [Complete Workflows](#complete-workflows)
- [Smart Defaults](#smart-defaults)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Performance & Benchmarks](#performance--benchmarks)

---

## Overview

PRPROMPTS Gemini CLI Skills provide 8 specialized automation skills as global TOML slash commands. These skills leverage Gemini's unique capabilities:

**🚀 Gemini Advantages:**
- **1M Token Context** - Analyze entire codebases (5x larger than Claude)
- **Free Tier** - 60 requests/minute, 1,000/day (no credit card required)
- **ReAct Agent Mode** - Autonomous reasoning and acting loops
- **{{args}} Support** - Inline arguments for streamlined workflows

**📊 Skills Overview:**
- **8 Total Skills** across 3 categories
- **Automation (5):** Complete automation pipeline
- **PRPROMPTS Core (2):** PRD and file generation
- **Development Workflow (1):** Environment configuration

**⚡ Key Features:**
- **Smart Defaults:** 80% reduction in user input
- **Security-First:** HIPAA, PCI-DSS, GDPR compliance built-in
- **Production-Ready:** Clean Architecture, comprehensive testing
- **Multi-Platform:** Windows, macOS, Linux support

---

## Quick Start

### Installation

```bash
# Install PRPROMPTS globally
npm install -g prprompts-flutter-generator

# Skills are automatically installed to ~/.gemini/commands/skills/
```

### Verify Installation

```bash
# Start Gemini CLI
gemini

# List all skills (in Gemini CLI)
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

### Your First Skill

```bash
gemini

# Run flutter-bootstrapper (just press Enter for defaults)
/skills:automation:flutter-bootstrapper

# Gemini will ask:
# > Project path? (press Enter for .):
# [Press Enter]
# > Enable state management? (press Enter for true):
# [Press Enter]

# Result: Complete Flutter project with Clean Architecture!
```

### With Inline Arguments (Gemini Feature)

```bash
gemini

# Use {{args}} for inline arguments
/skills:automation:code-reviewer security lib/features/auth

# Gemini parses:
# - review_type = "security"
# - target_path = "lib/features/auth"
# No interactive prompts!
```

---

## Skills Reference

### Automation Skills

#### 1. flutter-bootstrapper

**Purpose:** Complete Flutter project setup with Clean Architecture, security, and testing infrastructure.

**Command:**
```bash
/skills:automation:flutter-bootstrapper
```

**Smart Defaults:**
```yaml
Required Inputs:
  project_path: "." (current directory)

Optional Inputs (use defaults if not specified):
  enable_state_management: true (BLoC)
  enable_security: true (JWT verification, encryption)
  enable_testing: true (unit, widget, integration tests)
  enable_ci_cd: true (GitHub Actions)
  compliance: [] (HIPAA, PCI-DSS, GDPR)
```

**What It Does:**
1. **Project Structure:**
   ```
   lib/
   ├── core/
   │   ├── errors/
   │   ├── network/
   │   └── utils/
   ├── features/
   │   └── [feature]/
   │       ├── domain/
   │       ├── data/
   │       └── presentation/
   └── main.dart
   ```

2. **Security Setup:**
   - JWT verification (RS256 with public key)
   - AES-256-GCM encryption utilities
   - Secure storage configuration
   - API key management

3. **State Management:**
   - flutter_bloc configuration
   - Event/State/Bloc templates
   - Repository pattern implementation

4. **Testing Infrastructure:**
   - Test directory structure
   - Mock factories
   - Golden file testing setup
   - Coverage configuration (target: 80%)

5. **CI/CD Pipeline:**
   - GitHub Actions workflow
   - Automated testing
   - Code coverage reports
   - Build validation

**Execution Time:** 45-60 seconds (leverages 1M context)

**Output Files:** 25-30 files (~4,500-5,000 lines)

**Example (Inline Arguments):**
```bash
/skills:automation:flutter-bootstrapper . true true true true hipaa,pci-dss
# Bootstraps current directory with HIPAA+PCI-DSS compliance
```

---

#### 2. feature-implementer

**Purpose:** Auto-implement a single feature from implementation plan following Clean Architecture.

**Command:**
```bash
/skills:automation:feature-implementer
```

**Smart Defaults:**
```yaml
Required Inputs:
  feature_name: (no default - user must specify)

Optional Inputs:
  implementation_plan_path: "IMPLEMENTATION_PLAN.md"
  auto_test: true (generate unit + widget tests)
  test_coverage_target: 80
  follow_prprompts: true
```

**What It Does:**
1. **Reads Implementation Plan:**
   - Extracts feature specification from `IMPLEMENTATION_PLAN.md`
   - Identifies dependencies and integration points
   - Validates against PRPROMPTS patterns

2. **Generates Domain Layer:**
   ```dart
   // lib/features/[feature]/domain/entities/user.dart
   class User {
     final String id;
     final String email;
     // ... (immutable, equatable)
   }

   // lib/features/[feature]/domain/repositories/user_repository.dart
   abstract class UserRepository {
     Future<Either<Failure, User>> getUser(String id);
   }

   // lib/features/[feature]/domain/usecases/get_user.dart
   class GetUser {
     Future<Either<Failure, User>> call(String id);
   }
   ```

3. **Generates Data Layer:**
   - Models with JSON serialization
   - Remote/local data sources
   - Repository implementation

4. **Generates Presentation Layer:**
   - BLoC (Event, State, Bloc)
   - Screens with state handling
   - Widgets (reusable components)

5. **Generates Tests:**
   - Unit tests (domain, data)
   - Widget tests (presentation)
   - Mock factories
   - Test coverage: 80%+

**Execution Time:** 2-3 minutes per feature

**Output Files:** 12-15 files per feature (~1,500-2,000 lines)

**Example (Inline Arguments):**
```bash
/skills:automation:feature-implementer authentication IMPLEMENTATION_PLAN.md true 85 true
# Implements authentication feature with 85% coverage target
```

**Gemini 1M Context Advantage:**
- Loads entire `IMPLEMENTATION_PLAN.md` (up to 400 pages)
- Analyzes all existing features for consistency
- Cross-references all 32 PRPROMPTS files simultaneously
- No "should I read more files?" questions

---

#### 3. automation-orchestrator

**Purpose:** Orchestrate multi-feature implementation (1-10 features) with validation and checkpoints.

**Command:**
```bash
/skills:automation:automation-orchestrator
```

**Smart Defaults:**
```yaml
Required Inputs:
  num_features: (no default - user must specify)

Optional Inputs:
  implementation_plan_path: "IMPLEMENTATION_PLAN.md"
  pause_between_features: false
  run_qa_after_each: true
  auto_commit: false
  max_parallel: 1 (sequential by default)
```

**What It Does:**
1. **Planning Phase:**
   - Reads implementation plan
   - Validates feature order (dependencies)
   - Estimates execution time
   - Shows progress tracker

2. **Feature Loop (1-10 iterations):**
   ```
   For each feature:
     1. Run feature-implementer
     2. Validate against PRPROMPTS patterns
     3. Run tests (unit + widget)
     4. Generate QA report
     5. Checkpoint (optional pause)
   ```

3. **Validation Gates:**
   - Architecture compliance (Clean Architecture)
   - Security patterns (JWT, encryption)
   - Test coverage (>= 80%)
   - Code style (flutter analyze)

4. **Progress Tracking:**
   ```
   [▓▓▓▓▓░░░░░] 50% (5/10 features)
   Current: user-profile
   ETA: 8 minutes
   ```

5. **Final Report:**
   - Total features implemented
   - Total files created
   - Total lines of code
   - Test coverage summary
   - QA compliance score

**Execution Time:** 2-3 minutes per feature (20-30 min for 10 features)

**Output:** Full application with 10 features, tests, documentation

**Example (Inline Arguments):**
```bash
/skills:automation:automation-orchestrator 5 IMPLEMENTATION_PLAN.md false true false 1
# Implements 5 features sequentially with QA checks, no commits
```

**Gemini ReAct Advantage:**
- Autonomous reasoning about feature dependencies
- Adapts to test failures automatically
- Iterates on code until validation gates pass
- No manual intervention required

---

#### 4. code-reviewer

**Purpose:** Review Flutter code against PRPROMPTS patterns, security, architecture, and style.

**Command:**
```bash
/skills:automation:code-reviewer
```

**Smart Defaults:**
```yaml
Required Inputs:
  target_path: "lib/" (review entire lib directory)

Optional Inputs:
  review_type: "full" [options: full, architecture, security, testing, style]
  auto_fix: false
  output_format: "markdown" [options: markdown, json, console]
  severity_threshold: "warning" [options: error, warning, info]
```

**What It Does:**

**1. Architecture Review:**
- Clean Architecture compliance
- Dependency flow validation (presentation → domain ← data)
- Layer separation enforcement
- Repository pattern verification

**2. Security Review:**
- JWT verification (NOT signing) - RS256 with public key
- Sensitive data exposure (API keys, secrets)
- HTTPS-only enforcement
- Input validation and sanitization
- Compliance patterns (HIPAA, PCI-DSS, GDPR)

**3. Testing Review:**
- Test coverage analysis (target: 80%)
- Missing test cases identification
- Mock usage validation
- Golden file testing for UI

**4. Style Review:**
- flutter analyze compliance
- Naming conventions
- Code documentation
- Best practices adherence

**5. Output Formats:**

**Markdown (default):**
```markdown
# Code Review Report

## Summary
- Files reviewed: 47
- Issues found: 12 (3 errors, 5 warnings, 4 info)
- Auto-fixable: 8

## Errors (3)
### lib/features/auth/data/datasources/auth_remote_datasource.dart:45
**Issue:** JWT signing in Flutter app (security risk)
**Severity:** ERROR
**Fix:** Remove signing, use verification only with public key
**Reference:** PRPROMPTS/16-security_and_compliance.md

[... detailed breakdown ...]
```

**JSON:**
```json
{
  "summary": {
    "files_reviewed": 47,
    "issues": {
      "errors": 3,
      "warnings": 5,
      "info": 4
    }
  },
  "issues": [...]
}
```

**Execution Time:** 30-45 seconds (leverages 1M context to load entire codebase)

**Example (Inline Arguments):**
```bash
/skills:automation:code-reviewer security lib/features/auth true markdown error
# Security review of auth feature with auto-fix, only show errors
```

**Gemini 1M Context Advantage:**
- Loads entire codebase in one pass
- Cross-references patterns across all files
- No "should I analyze more files?" questions
- Detects architectural violations spanning multiple layers

---

#### 5. qa-auditor

**Purpose:** Comprehensive quality assurance audit with compliance validation and scoring.

**Command:**
```bash
/skills:automation:qa-auditor
```

**Smart Defaults:**
```yaml
Required Inputs:
  project_path: "." (current directory)

Optional Inputs:
  compliance_standards: [] (HIPAA, PCI-DSS, GDPR, SOC2)
  include_performance: true
  include_accessibility: true
  output_path: "QA_REPORT.md"
  fail_threshold: 70 (score below 70 = fail)
```

**What It Does:**

**1. Architecture Audit (25 points):**
- Clean Architecture compliance
- Dependency injection validation
- Layer separation enforcement
- Repository pattern implementation

**2. Security Audit (30 points):**
- JWT verification patterns
- Encryption implementation (AES-256-GCM)
- Secure storage usage
- API security (HTTPS, rate limiting)
- Compliance-specific checks:
  - HIPAA: PHI encryption, audit logging
  - PCI-DSS: No card storage, tokenization
  - GDPR: Data anonymization, right to deletion

**3. Testing Audit (25 points):**
- Unit test coverage (target: 80%)
- Widget test coverage
- Integration test coverage
- Test quality (assertions, mocks)

**4. Code Quality Audit (10 points):**
- flutter analyze (0 errors)
- Documentation coverage
- Code complexity (cyclomatic complexity)
- Dead code detection

**5. Performance Audit (5 points - if enabled):**
- Build performance
- Runtime performance markers
- Memory leak detection

**6. Accessibility Audit (5 points - if enabled):**
- Semantic labels
- Screen reader support
- Color contrast
- Touch target sizes

**7. Output (QA_REPORT.md):**
```markdown
# QA Audit Report

**Project:** my_flutter_app
**Date:** 2024-01-15
**Score:** 87/100 ✅ PASS

---

## Summary

| Category       | Score | Weight | Weighted |
|---------------|-------|--------|----------|
| Architecture  | 23/25 | 25%    | 23       |
| Security      | 28/30 | 30%    | 28       |
| Testing       | 22/25 | 25%    | 22       |
| Code Quality  | 9/10  | 10%    | 9        |
| Performance   | 4/5   | 5%     | 4        |
| Accessibility | 4/5   | 5%     | 4        |

**Total:** 87/100 ✅ PASS (threshold: 70)

---

## Detailed Results

### Architecture (23/25)

✅ PASS: Clean Architecture layers implemented
✅ PASS: Dependency injection configured
✅ PASS: Repository pattern used
⚠️  WARNING: 2 files violate layer separation
  - lib/features/auth/presentation/bloc/auth_bloc.dart:67
    Issue: Direct import of data layer model
    Fix: Use domain entity instead

[... detailed breakdown with line numbers and fixes ...]

---

## Compliance Validation

### HIPAA Compliance ✅ PASS

✅ PHI encrypted at rest (AES-256-GCM)
✅ Audit logging implemented
✅ Session timeouts configured (15 min)
✅ HTTPS-only enforcement
⚠️  Recommendation: Add PHI access logging to UserRepository

[... more compliance checks ...]

---

## Recommendations

1. **HIGH:** Fix layer separation violations (2 files)
2. **MEDIUM:** Increase test coverage to 85% (currently 82%)
3. **LOW:** Add documentation to 5 public APIs

---

## Action Items

- [ ] Fix lib/features/auth/presentation/bloc/auth_bloc.dart:67
- [ ] Add tests for UserRepository edge cases
- [ ] Document public APIs in core/network/

---

**Next Steps:**
1. Address HIGH priority issues
2. Re-run QA audit: /skills:automation:qa-auditor
3. Target score: 90/100
```

**Execution Time:** 60-90 seconds

**Example (Inline Arguments):**
```bash
/skills:automation:qa-auditor . hipaa,pci-dss true true QA_REPORT.md 80
# Audit with HIPAA+PCI-DSS compliance, 80% pass threshold
```

**Gemini 1M Context Advantage:**
- Analyzes entire project in single pass
- Cross-references all PRPROMPTS files
- Validates compliance across all features simultaneously
- No incremental loading required

---

### PRPROMPTS Core Skills

#### 6. phase-generator

**Purpose:** Generate PRPROMPTS files by phase (1=Core, 2=Quality, 3=Demo).

**Command:**
```bash
/skills:prprompts-core:phase-generator
```

**Smart Defaults:**
```yaml
Required Inputs:
  phase: (no default - user must specify) [options: 1, 2, 3]

Optional Inputs:
  prd_path: "docs/PRD.md"
  output_dir: "PRPROMPTS/"
  overwrite_existing: false
```

**What It Does:**

**Phase 1 - Core (15 files):**
- 01-project_brief.md
- 02-tech_stack.md
- 03-folder_structure.md
- ... (architecture, state management, navigation)

**Phase 2 - Quality (12 files):**
- 16-security_and_compliance.md
- 17-data_persistence.md
- 18-testing_strategy.md
- ... (performance, error handling, accessibility)

**Phase 3 - Demo (5 files):**
- 29-demo_content.md
- 30-quick_start.md
- 31-troubleshooting_guide.md
- 32-deployment_checklist.md

**Execution Time:** 15-20 seconds per phase

**Output:** 5-15 files (depending on phase)

**Example (Inline Arguments):**
```bash
/skills:prprompts-core:phase-generator 1 docs/PRD.md PRPROMPTS/ false
# Generate Phase 1 (Core) files
```

---

#### 7. single-file-generator

**Purpose:** Regenerate a single PRPROMPTS file (1-32).

**Command:**
```bash
/skills:prprompts-core:single-file-generator
```

**Smart Defaults:**
```yaml
Required Inputs:
  file_number: (no default - user must specify) [1-32]

Optional Inputs:
  prd_path: "docs/PRD.md"
  output_dir: "PRPROMPTS/"
  backup_existing: true
```

**What It Does:**
1. Backs up existing file (if exists)
2. Reads PRD metadata
3. Generates single file following PRP pattern
4. Validates output (6 sections)

**Execution Time:** 3-5 seconds

**Example (Inline Arguments):**
```bash
/skills:prprompts-core:single-file-generator 16 docs/PRD.md PRPROMPTS/ true
# Regenerate file 16 (security_and_compliance.md) with backup
```

---

### Development Workflow Skills

#### 8. flutter-flavors

**Purpose:** Configure Flutter environment flavors (dev, staging, production).

**Command:**
```bash
/skills:development-workflow:flutter-flavors
```

**Smart Defaults:**
```yaml
Required Inputs:
  (none - all have defaults)

Optional Inputs:
  flavors: ["dev", "staging", "production"]
  config_format: "dart" [options: dart, json, env]
  enable_firebase: false
  platform: "both" [options: ios, android, both]
```

**What It Does:**

**1. Creates Flavor Configurations:**
```dart
// lib/config/app_config.dart
enum Flavor { dev, staging, production }

class AppConfig {
  final String apiUrl;
  final String appName;
  final bool enableLogging;

  static AppConfig get current {
    switch (F.appFlavor) {
      case Flavor.dev:
        return DevConfig();
      case Flavor.staging:
        return StagingConfig();
      case Flavor.production:
        return ProductionConfig();
    }
  }
}

class DevConfig extends AppConfig {
  String get apiUrl => 'https://dev-api.example.com';
  String get appName => 'MyApp (DEV)';
  bool get enableLogging => true;
}
```

**2. Android Configuration:**
```gradle
// android/app/build.gradle
flavorDimensions "default"
productFlavors {
    dev {
        applicationIdSuffix ".dev"
        versionNameSuffix "-dev"
    }
    staging {
        applicationIdSuffix ".staging"
        versionNameSuffix "-staging"
    }
    production {
        // no suffix
    }
}
```

**3. iOS Configuration:**
```ruby
# ios/fastlane/Fastfile
lane :dev do
  gym(scheme: "dev")
end
```

**4. Launch Configurations (.vscode/launch.json):**
```json
{
  "configurations": [
    {
      "name": "Dev",
      "request": "launch",
      "type": "dart",
      "args": ["--flavor", "dev", "--dart-define=FLAVOR=dev"]
    }
  ]
}
```

**Execution Time:** 20-25 seconds

**Output Files:** 6-8 files

**Example (Inline Arguments):**
```bash
/skills:development-workflow:flutter-flavors dev,staging,prod dart true both
# Create 3 flavors with Firebase, both platforms
```

---

## Gemini-Specific Features

### 1. Inline Arguments with {{args}}

**Traditional Workflow (Interactive):**
```bash
/skills:automation:code-reviewer
# > Target path?
# lib/features/auth
# > Review type?
# security
# > Auto-fix?
# true
```

**Gemini Workflow (Inline):**
```bash
/skills:automation:code-reviewer security lib/features/auth true
# Gemini parses {{args}} and extracts:
# - review_type = "security"
# - target_path = "lib/features/auth"
# - auto_fix = true
# No prompts!
```

**How It Works:**
1. Gemini TOML files include {{args}} placeholders
2. Gemini CLI captures everything after command name
3. Skill prompt includes argument parsing instructions
4. Arguments are matched to input schema from skill.json

**Argument Parsing Rules:**
- Positional: First arg → first input, second → second, etc.
- Named: `key=value` format (e.g., `review_type=security`)
- Flags: `--enable-security` → `enable_security=true`

---

### 2. 1M Token Context Window

**Comparison:**
| AI            | Context Window | Codebase Size           |
|---------------|----------------|-------------------------|
| Claude Code   | 200K tokens    | ~50 files (~100KB)      |
| Qwen Code     | 200K tokens    | ~50 files (~100KB)      |
| Gemini CLI    | 1M tokens      | ~250 files (~500KB)     |

**What This Means:**
- Load entire Flutter project in memory
- No "should I read more files?" questions
- Cross-reference all 32 PRPROMPTS files simultaneously
- Process massive PRDs (400+ pages)
- Analyze all features for pattern consistency

**Example Workflow:**
```bash
/skills:automation:code-reviewer full lib/

# Gemini loads:
# - All files in lib/ (~150 files)
# - All 32 PRPROMPTS files
# - docs/PRD.md
# - IMPLEMENTATION_PLAN.md
# Total: ~800KB (fits in 1M context)

# Analysis:
# - Cross-references patterns across all features
# - Validates architectural consistency
# - Detects compliance violations
# - No incremental loading required
```

---

### 3. ReAct (Reason and Act) Agent Mode

**What is ReAct?**
- **Reason:** Break down complex tasks into steps
- **Act:** Execute actions based on reasoning
- **Iterate:** Loop until task completion

**Example (automation-orchestrator):**

**Task:** Implement 5 features from implementation plan

**ReAct Loop:**
```
Iteration 1:
  Reason: "I need to implement authentication feature first"
  Act: Run feature-implementer for authentication
  Result: 12 files created
  Validation: Run tests → 3 failures

Iteration 2:
  Reason: "Tests failed due to missing mock factory"
  Act: Generate mock factory for UserRepository
  Result: test/mocks/user_repository_mock.dart created
  Validation: Run tests → All pass ✅

Iteration 3:
  Reason: "Authentication complete, next is user-profile"
  Act: Run feature-implementer for user-profile
  [... continues autonomously ...]
```

**Benefits:**
- Autonomous error recovery
- Adaptive planning based on results
- No manual intervention required
- Learns from validation failures

---

### 4. Free Tier Optimization

**Gemini Free Tier:**
- **60 requests/minute** (4x more than Claude)
- **1,000 requests/day** (10x more than Claude)
- **No credit card required**
- **1M token context** (5x larger than Claude)

**Optimization Strategy:**

**Batch Operations:**
```bash
# Instead of 10 separate requests:
/skills:automation:feature-implementer authentication
/skills:automation:feature-implementer user-profile
# ... (8 more)

# Use orchestrator (1 request):
/skills:automation:automation-orchestrator 10
# Batches all operations internally
```

**Leverage Large Context:**
```bash
# Load everything once:
/skills:automation:code-reviewer full lib/
# Reviews entire codebase in 1 request
# vs. 10+ incremental requests in other AIs
```

**Cache Results:**
- Use QA_REPORT.md for future reference
- Store code review results in markdown
- Avoid re-analyzing unchanged code

---

## Complete Workflows

### Workflow 1: Bootstrap New Flutter Project (2 minutes)

**Scenario:** Start a new HIPAA-compliant healthcare Flutter app

**Steps:**
```bash
# 1. Create Flutter project
flutter create healthcare_app
cd healthcare_app

# 2. Install PRPROMPTS
npm install -g prprompts-flutter-generator

# 3. Create PRD
prprompts create
# Answer 10 questions (1-2 minutes)
# Compliance: HIPAA
# Features: patient-records, appointments, messaging

# 4. Generate PRPROMPTS files
prprompts generate
# Result: 32 files in PRPROMPTS/

# 5. Bootstrap project with Gemini
gemini
/skills:automation:flutter-bootstrapper . true true true true hipaa

# Result (60 seconds):
# - Clean Architecture structure
# - JWT verification setup
# - AES-256-GCM encryption
# - Secure storage configuration
# - Unit + widget test infrastructure
# - GitHub Actions CI/CD

# 6. Verify setup
flutter analyze
# 0 issues

flutter test
# All tests pass
```

**Total Time:** ~2 minutes

**Output:** Production-ready Flutter project with security + testing

---

### Workflow 2: Full Development Cycle (25 minutes)

**Scenario:** Implement 10 features from implementation plan

**Steps:**
```bash
# 1. Create implementation plan
gemini
/skills:prprompts-core:phase-generator 1
# Generates IMPLEMENTATION_PLAN.md with 10 features

# 2. Run automation orchestrator
/skills:automation:automation-orchestrator 10

# Gemini autonomously:
# - Implements 10 features (2-3 min each)
# - Generates domain/data/presentation layers
# - Creates unit + widget tests (80% coverage)
# - Runs QA audit after each feature
# - Validates against PRPROMPTS patterns

# Result (25 minutes):
# - 10 features implemented
# - 150+ files created
# - 15,000+ lines of code
# - 80%+ test coverage
# - QA score: 85/100

# 3. Final QA audit
/skills:automation:qa-auditor . hipaa true true QA_REPORT.md 80

# 4. Review report
cat QA_REPORT.md
# Score: 87/100 ✅ PASS
```

**Total Time:** ~25 minutes (vs. 3-5 days manually)

**Speed-up:** 40-60x faster

---

### Workflow 3: Security Audit & Compliance (3 minutes)

**Scenario:** Audit existing Flutter app for HIPAA + PCI-DSS compliance

**Steps:**
```bash
gemini

# 1. Run comprehensive security review
/skills:automation:code-reviewer security lib/ false markdown error

# Result (45 seconds):
# 15 security issues found:
# - 5 ERROR (JWT signing, plaintext secrets)
# - 10 WARNING (input validation, HTTPS)

# 2. Auto-fix with inline arguments
/skills:automation:code-reviewer security lib/ true markdown warning

# Result (60 seconds):
# - 8 issues auto-fixed
# - 7 issues require manual review

# 3. Run compliance audit
/skills:automation:qa-auditor . hipaa,pci-dss true true COMPLIANCE_AUDIT.md 90

# Result (90 seconds):
# Score: 78/100 ⚠️  FAIL (threshold: 90)
#
# HIPAA Issues:
# - PHI not encrypted in 3 locations
# - Audit logging missing for patient records access
#
# PCI-DSS Issues:
# - Card numbers stored in local database (violation!)
# - Use Stripe tokenization instead

# 4. Fix critical issues (manual)
# - Encrypt PHI with AES-256-GCM
# - Remove card storage, use Stripe

# 5. Re-audit
/skills:automation:qa-auditor . hipaa,pci-dss true true COMPLIANCE_AUDIT_V2.md 90

# Score: 92/100 ✅ PASS
```

**Total Time:** ~3 minutes (+ manual fixes)

**Issues Found:** 15 security issues, 2 critical compliance violations

---

### Workflow 4: Code Review Before Commit (1 minute)

**Scenario:** Review changes before committing to ensure quality

**Steps:**
```bash
# 1. Make changes to authentication feature
# lib/features/auth/...

# 2. Review changes with Gemini
gemini
/skills:automation:code-reviewer full lib/features/auth false markdown warning

# Result (30 seconds):
# 3 warnings found:
#
# 1. lib/features/auth/data/datasources/auth_remote_datasource.dart:34
#    Missing input validation for email parameter
#    Fix: Add email format validation
#
# 2. lib/features/auth/presentation/bloc/auth_bloc.dart:67
#    BLoC depends on data layer model (architecture violation)
#    Fix: Use domain entity instead
#
# 3. lib/features/auth/domain/usecases/login.dart:23
#    Missing error handling for network failures
#    Fix: Add try-catch with Either<Failure, User> return

# 3. Fix issues (manual)

# 4. Re-review with auto-fix
/skills:automation:code-reviewer full lib/features/auth true markdown error

# Result (30 seconds):
# All issues fixed ✅

# 5. Run tests
flutter test test/features/auth/
# All pass ✅

# 6. Commit
git add lib/features/auth
git commit -m "feat(auth): implement login feature"
```

**Total Time:** ~1 minute (review only)

**Issues Prevented:** 3 architecture/quality issues

---

## Smart Defaults

### How Smart Defaults Work

**Without Smart Defaults (Traditional):**
```bash
/skills:automation:flutter-bootstrapper

# User prompted 12 times:
# 1. Project path? _____
# 2. Enable state management? _____
# 3. State management type? _____
# 4. Enable security? _____
# 5. Security type? _____
# 6. Enable encryption? _____
# 7. Enable testing? _____
# 8. Unit tests? _____
# 9. Widget tests? _____
# 10. Integration tests? _____
# 11. Enable CI/CD? _____
# 12. CI/CD platform? _____
```

**With Smart Defaults (PRPROMPTS Gemini):**
```bash
/skills:automation:flutter-bootstrapper

# User prompted 2 times:
# 1. Project path? (press Enter for .):
# [Press Enter]
#
# 2. Compliance standards? (press Enter for none):
# hipaa
#
# Result: All other inputs use smart defaults!
# - enable_state_management: true (BLoC)
# - enable_security: true
# - enable_testing: true
# - enable_ci_cd: true
```

**Input Reduction:** 12 prompts → 2 prompts (83% reduction)

---

### Smart Defaults Strategy

**1. Read from skill.json:**
```json
{
  "inputs": {
    "optional": {
      "enable_state_management": {
        "type": "boolean",
        "description": "Enable BLoC state management",
        "default": true
      }
    }
  }
}
```

**2. Interactive Prompt:**
```
Smart defaults loaded from skill.json.

Optional inputs (press Enter to use defaults):

enable_state_management? (press Enter for true):
[Press Enter → uses true]

enable_security? (press Enter for true):
[Press Enter → uses true]

compliance? (press Enter for none):
hipaa,pci-dss [User specifies → overrides default]
```

**3. Only Ask When:**
- Required input has no default
- User explicitly wants to override
- Input is critical (e.g., compliance)

---

### Customizing Defaults

**Override via Inline Arguments:**
```bash
/skills:automation:flutter-bootstrapper . false false true false
# Disables state management, security, and CI/CD
# Enables testing only
```

**Override via Project Config:**
```yaml
# .gemini/prprompts.yml
defaults:
  flutter-bootstrapper:
    enable_state_management: false
    enable_security: true
    compliance: ["hipaa"]
```

Then:
```bash
/skills:automation:flutter-bootstrapper
# Uses project-specific defaults from .gemini/prprompts.yml
```

---

## Advanced Usage

### Combining Skills in Sequences

**Scenario:** Complete project from PRD to production

```bash
gemini

# 1. Generate PRPROMPTS (Phase 1)
/skills:prprompts-core:phase-generator 1

# 2. Bootstrap project
/skills:automation:flutter-bootstrapper . true true true true hipaa

# 3. Implement all features
/skills:automation:automation-orchestrator 10

# 4. Set up environments
/skills:development-workflow:flutter-flavors dev,staging,prod dart true both

# 5. Final QA audit
/skills:automation:qa-auditor . hipaa true true FINAL_QA.md 85

# Total time: ~30 minutes
# Output: Production-ready app with 10 features
```

---

### Custom Skill Chains

**Create custom aliases in .gemini/commands/:**

```toml
# .gemini/commands/my-custom-workflow.toml
description = "My custom Flutter setup workflow"

prompt = """
Run the following skills in sequence:

1. /skills:automation:flutter-bootstrapper . true true true true {{compliance}}
2. /skills:prprompts-core:phase-generator 1
3. /skills:development-workflow:flutter-flavors dev,staging,prod dart false both

Ask user for compliance standards {{compliance}}, then execute all three skills.
"""
```

Usage:
```bash
gemini
/my-custom-workflow
# > Compliance standards?
# hipaa
# [Runs all 3 skills automatically]
```

---

### Integration with External Tools

**1. CI/CD Integration (GitHub Actions):**
```yaml
# .github/workflows/qa-audit.yml
name: QA Audit

on: [pull_request]

jobs:
  qa-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Run QA Audit
        run: |
          gemini --non-interactive << EOF
          /skills:automation:qa-auditor . hipaa,pci-dss true true QA_REPORT.md 80
          EOF

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: qa-report
          path: QA_REPORT.md

      - name: Check Score
        run: |
          score=$(grep "Total:" QA_REPORT.md | grep -oP '\d+(?=/100)')
          if [ "$score" -lt 80 ]; then
            echo "QA score too low: $score/100"
            exit 1
          fi
```

**2. Pre-commit Hook:**
```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Running code review..."

gemini --non-interactive << EOF
/skills:automation:code-reviewer full lib/ false json error
EOF

# Parse JSON and fail if errors found
errors=$(jq '.issues.errors' review-output.json)
if [ "$errors" -gt 0 ]; then
  echo "Code review found $errors errors. Commit aborted."
  exit 1
fi
```

---

## Troubleshooting

### Installation Issues

**Problem:** Skills not found in Gemini CLI

**Solution:**
```bash
# 1. Verify installation directory
ls ~/.gemini/commands/skills/automation/
# Should show: flutter-bootstrapper.toml, code-reviewer.toml, etc.

# 2. Reinstall skills
npm install -g prprompts-flutter-generator

# 3. Manually install (if needed)
bash ~/node_modules/prprompts-flutter-generator/scripts/install-gemini-skills.sh

# 4. Restart Gemini CLI
gemini
/help
# Should show all skills
```

---

**Problem:** Command not recognized (Windows)

**Solution:**
```powershell
# Use PowerShell installer
cd $env:APPDATA\npm\node_modules\prprompts-flutter-generator\scripts
.\install-gemini-skills.ps1

# Or batch file
.\install-gemini-skills.bat
```

---

### Execution Errors

**Problem:** "Missing required input" error

**Solution:**
```bash
# Check skill.json for required inputs
cat ~/.gemini/commands/skills/automation/flutter-bootstrapper.toml

# Provide required inputs explicitly
/skills:automation:flutter-bootstrapper my-project true true true true

# Or use interactive mode (press Enter for defaults)
/skills:automation:flutter-bootstrapper
```

---

**Problem:** Skill generates incorrect code

**Solution:**
```bash
# 1. Check PRD metadata
cat docs/PRD.md
# Ensure compliance, platforms, features are correct

# 2. Regenerate PRPROMPTS files
/skills:prprompts-core:phase-generator 1

# 3. Re-run skill
/skills:automation:flutter-bootstrapper

# 4. Report issue with context
# https://github.com/Kandil7/prprompts-flutter-generator/issues
```

---

### Performance Issues

**Problem:** Skill execution is slow

**Solution:**
```bash
# 1. Check project size
find lib/ -name "*.dart" | wc -l
# If > 500 files, Gemini may need 2-3 minutes

# 2. Use targeted reviews instead of full
/skills:automation:code-reviewer security lib/features/auth
# Instead of: /skills:automation:code-reviewer full lib/

# 3. Leverage 1M context - load once
# Avoid incremental file reading
```

---

**Problem:** Rate limit exceeded (free tier)

**Solution:**
```bash
# Free tier: 60 req/min, 1K/day

# 1. Batch operations
/skills:automation:automation-orchestrator 10
# Instead of 10 separate feature-implementer calls

# 2. Cache results
# Save QA_REPORT.md, review reports for reuse

# 3. Upgrade to paid tier (if needed)
# Paid: 1,000 req/min, unlimited/day
```

---

## Performance & Benchmarks

### Execution Time Benchmarks

**Test Environment:**
- **Project:** Healthcare app (HIPAA compliance)
- **Features:** 10 (authentication, patient-records, appointments, etc.)
- **Codebase:** 150 files, ~15,000 lines
- **Platform:** Gemini CLI (1M context)

**Results:**

| Skill                        | Execution Time | Output             | Speed vs. Manual |
|------------------------------|----------------|--------------------|------------------|
| flutter-bootstrapper         | 60 sec         | 30 files (5K LOC)  | 40x faster       |
| feature-implementer          | 2.5 min        | 15 files (2K LOC)  | 50x faster       |
| automation-orchestrator (10) | 27 min         | 150 files (15K LOC)| 45x faster       |
| code-reviewer (full)         | 45 sec         | 47 files reviewed  | 30x faster       |
| qa-auditor                   | 90 sec         | Compliance report  | 60x faster       |

**Total Project Time:**
- **Manual:** 3-5 days (24-40 hours)
- **With PRPROMPTS + Gemini:** 30 minutes
- **Speed-up:** 48-80x faster

---

### Context Window Utilization

**Gemini 1M Context Advantage:**

| Operation                | Files Loaded | Tokens Used | Gemini Fits? | Claude Fits? |
|--------------------------|--------------|-------------|--------------|--------------|
| Small project review     | 50 files     | 150K        | ✅ Yes       | ✅ Yes       |
| Medium project review    | 150 files    | 450K        | ✅ Yes       | ❌ No (split)|
| Large project review     | 300 files    | 900K        | ✅ Yes       | ❌ No (split)|
| Massive PRD processing   | 1 file (400p)| 800K        | ✅ Yes       | ❌ No (split)|

**Result:** Gemini handles 5x larger projects in single pass

---

### Quality Metrics

**Test Coverage:**
- **Target:** 80%
- **Achieved (flutter-bootstrapper):** 82-85%
- **Achieved (feature-implementer):** 80-83%

**QA Scores:**
- **Average (automation-orchestrator):** 85/100
- **Range:** 78-92/100
- **Pass Rate:** 94% (threshold: 70)

**Code Quality:**
- **flutter analyze:** 0 errors (100% pass)
- **Architecture violations:** 0.5 per feature (avg)
- **Security issues:** 1.2 per feature (avg, auto-fixable)

---

## Summary

**PRPROMPTS Gemini CLI Skills provide:**
- **8 Specialized Skills** across automation, core, and workflow
- **Smart Defaults** for 80% reduction in user input
- **Gemini-Specific Features:** {{args}}, 1M context, ReAct, free tier
- **Production-Ready Output:** Clean Architecture, security, tests
- **40-80x Speed-up** vs. manual development

**Get Started:**
```bash
npm install -g prprompts-flutter-generator
gemini
/skills:automation:flutter-bootstrapper
```

**Documentation:**
- Full guide: [GEMINI-SKILLS-GUIDE.md](GEMINI-SKILLS-GUIDE.md) (this file)
- Setup: [GEMINI.md](../GEMINI.md)
- Main docs: [README.md](../README.md)

**Support:**
- GitHub Issues: https://github.com/Kandil7/prprompts-flutter-generator/issues
- Discord: https://discord.gg/prprompts

---

**Happy coding with Gemini CLI! 🚀**
