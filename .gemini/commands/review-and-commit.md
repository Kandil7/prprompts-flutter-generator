---
name: review-and-commit
description: "[prprompts] Validate and commit changes - PRPROMPTS compliance, security checks, tests"
category: Automation
version: 4.0.0
tags: [prprompts, automation, git, validation, security]
badge: NEW
---

# /review-and-commit - Validate & Commit Changes

✅ **v4.0 Automation** - Comprehensive validation and git commit workflow. Validates PRPROMPTS compliance, runs security checks, ensures tests pass, and creates descriptive commit messages.

## Usage

```bash
/review-and-commit
```

## What It Does

Runs a comprehensive validation pipeline before committing:

### 1. PRPROMPTS Compliance Check
- **Architecture Validation:** Verifies Clean Architecture structure
- **Pattern Adherence:** Checks BLoC, Repository, Use Case patterns
- **Naming Conventions:** Validates file/class naming standards
- **Documentation:** Ensures code comments and README updates

### 2. Security Audit
- **Dependency Scan:** Checks for vulnerable packages
- **Code Analysis:** Identifies potential security issues
- **Sensitive Data:** Scans for hardcoded secrets/API keys
- **Encryption:** Validates PHI/PII encryption patterns
- **Authentication:** Checks JWT/OAuth2 implementation

### 3. Code Quality
- **Static Analysis:** `flutter analyze` with strict rules
- **Linting:** Follows analysis_options.yaml rules
- **Formatting:** `dart format` compliance
- **Code Complexity:** Cyclomatic complexity checks

### 4. Testing
- **Unit Tests:** All unit tests must pass
- **Widget Tests:** Widget tests must pass
- **Integration Tests:** E2E tests must pass (if configured)
- **Coverage:** Must meet 85%+ threshold

### 5. Compliance Validation
- **HIPAA:** PHI encryption, audit logging, access controls
- **PCI-DSS:** Payment data handling, tokenization
- **GDPR:** Data privacy, consent management
- **Custom:** Project-specific compliance rules

### 6. Git Commit
- **Staged Files:** Reviews what will be committed
- **Commit Message:** Auto-generates descriptive message
- **Conventional Commits:** Follows conventional commit format
- **Branch Check:** Warns if committing to main/master

## Example Session

```
/review-and-commit

🔍 Validating changes before commit...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PRPROMPTS Compliance Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Clean Architecture structure (data/domain/presentation)
✓ BLoC pattern correctly implemented
✓ Repository pattern with offline-first
✓ Use cases follow single responsibility
✓ File naming conventions
✓ Code documentation (87% coverage)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. Security Audit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Dependency scan (0 vulnerabilities)
✓ No hardcoded secrets found
✓ PHI encrypted with AES-256-GCM
✓ JWT RS256 implementation correct
✓ Certificate pinning configured
✓ Biometric auth secured

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. Code Quality
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ flutter analyze (0 issues)
✓ dart format (all files formatted)
✓ Cyclomatic complexity (max: 8, avg: 4.2)
✓ No duplicate code detected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running tests...
✓ Unit tests: 127 passed, 0 failed
✓ Widget tests: 43 passed, 0 failed
✓ Integration tests: 12 passed, 0 failed
✓ Coverage: 87.3% (target: 85%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. Compliance Validation (HIPAA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ PHI encryption at rest (AES-256-GCM)
✓ PHI encryption in transit (TLS 1.3)
✓ Audit logging enabled
✓ Access controls implemented
✓ Minimum necessary access principle
✓ User authentication (JWT RS256)
✓ Session timeout (15 min)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ All Validation Gates Passed!

📋 Changes to commit:

Modified files:
  lib/features/appointments/ (23 files)
  test/features/appointments/ (12 files)
  IMPLEMENTATION_PLAN.md

New files:
  35 files (2,847 lines)

Deleted files:
  0 files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Generated Commit Message:

  feat: implement appointment scheduling feature

  - Add appointment booking, viewing, canceling, rescheduling
  - Offline-first sync with Hive local storage
  - Real-time updates via WebSocket
  - 87.3% test coverage (182 tests)
  - HIPAA compliant (PHI encryption, audit logs)
  - BLoC state management with 4 events, 3 states
  - Clean Architecture (data/domain/presentation)

  Security:
  - PHI encrypted with AES-256-GCM
  - JWT RS256 authentication required
  - Role-based access control (RBAC)
  - Audit logging for all actions

  Testing:
  - 127 unit tests
  - 43 widget tests
  - 12 integration tests
  - 87.3% code coverage

  Fixes: #42

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Accept this commit message? (y/n/edit)
> y

📦 Committing changes...

✓ git add .
✓ git commit -m "..."
✓ Commit created: abc1234

⚠️  You are on branch: feature/appointments
   To push: git push origin feature/appointments

🎉 Review and commit complete!

Next Steps:
1. Push changes: git push
2. Create PR: gh pr create
3. Continue: /implement-next or /full-cycle

```

## Validation Gates

All gates must pass (or be explicitly overridden):

| Gate | Requirement | Override |
|------|-------------|----------|
| **PRPROMPTS Compliance** | 100% architectural patterns | `--skip-prprompts-check` |
| **Security Audit** | 0 vulnerabilities | `--allow-security-warnings` |
| **Code Quality** | 0 analysis issues | `--allow-warnings` |
| **Tests** | All tests pass | `--skip-tests` (not recommended) |
| **Coverage** | ≥85% | `--allow-low-coverage` |
| **Compliance** | All rules pass | `--skip-compliance` |

## Commit Message Format

Follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code refactoring
- `test:` Adding/updating tests
- `docs:` Documentation
- `chore:` Maintenance
- `perf:` Performance improvement
- `security:` Security fix

## Options

| Option | Description |
|--------|-------------|
| `--skip-tests` | Skip test validation (not recommended) |
| `--allow-warnings` | Allow analyzer warnings |
| `--skip-compliance` | Skip compliance checks |
| `--no-push` | Don't prompt to push after commit |
| `--amend` | Amend previous commit |
| `--edit` | Edit commit message before committing |

## Security Checks

Scans for common security issues:

- ❌ Hardcoded API keys/secrets
- ❌ Hardcoded passwords
- ❌ SQL injection vulnerabilities
- ❌ XSS vulnerabilities
- ❌ Insecure random number generation
- ❌ Weak cryptography
- ❌ Unsafe deserialization
- ❌ Missing input validation
- ❌ Insecure file permissions
- ❌ Exposed sensitive logs

## Requirements

- **Git:** Repository must be initialized
- **Tests:** Test infrastructure must exist
- **Flutter:** Flutter SDK installed

## Related Commands

- `/implement-next` - Implement next feature
- `/full-cycle` - Auto-implement multiple features
- `/qa-check` - Comprehensive compliance audit
- `/bootstrap-from-prprompts` - Initial setup

## Best Practices

1. **Run Before Every Commit:** Ensure code quality
2. **Don't Override Gates:** Fix issues instead of skipping
3. **Review Message:** Ensure commit message is descriptive
4. **Check Branch:** Don't commit directly to main/master
5. **Push Frequently:** Push after each successful commit

---

**Powered by PRPROMPTS v4.0** | **Quality Assurance** | [Docs](https://github.com/Kandil7/prprompts-flutter-generator#readme)
