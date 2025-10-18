---
name: full-cycle
description: "[prprompts] Auto-implement 1-10 features automatically (1-2 hours)"
category: Automation
version: 4.0.0
tags: [prprompts, automation, full-automation, flutter]
badge: NEW
---

# /full-cycle - Complete Automation Loop

🤖 **v4.0 Full Automation** - Auto-implement 1-10 features in a single session (1-2 hours). The ultimate automation command - sit back and watch your app build itself.

## Usage

```bash
/full-cycle
```

Or specify number of features:
```bash
/full-cycle --features 5
```

## What It Does

Runs a complete development cycle automatically:

1. **Analyzes Plan:** Reads `IMPLEMENTATION_PLAN.md`, identifies dependencies
2. **Implements Features:** Calls `/implement-next` for each feature in order
3. **Runs Tests:** Validates each feature before moving to next
4. **Auto-Commits:** Git commits after each successful feature
5. **QA Checks:** Runs security & compliance audits
6. **Generates Report:** Creates `AUTOMATION_REPORT.md` with metrics

## Example Session

```
/full-cycle

🤖 Full Automation Cycle Starting...

📋 Implementation Plan Analysis:
✓ Total features: 7
✓ Completed: 3
✓ Pending: 4
✓ Dependencies resolved

Target: Implement 4 features (estimated 45 min)
Features:
  1. Appointment Scheduling (HIGH) - 15 min
  2. Secure Messaging (CRITICAL) - 18 min
  3. Medical Records (HIGH) - 14 min
  4. Push Notifications (MEDIUM) - 10 min

Press Ctrl+C to stop, Enter to continue...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature 1/4: Appointment Scheduling (HIGH)

🔍 Consulting PRPROMPTS...
✓ 02-state_management.md
✓ 03-data_layer.md
✓ 14-security_patterns.md

🚀 Implementing...
✓ Data layer (23 files)
✓ Domain layer (8 use cases)
✓ Presentation layer (6 screens)
✓ Tests (69 test cases, 87.3% coverage)

✅ Validation passed
✓ flutter analyze (0 issues)
✓ flutter test (69 passed)
✓ Security scan (0 vulnerabilities)

📦 Committing...
✓ Git commit: "feat: implement appointment scheduling"

⏱️  Feature 1 complete: 14 min 23 sec

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature 2/4: Secure Messaging (CRITICAL)

🔍 Consulting PRPROMPTS...
✓ 14-security_patterns.md (E2E encryption)
✓ 20-real_time.md (WebSocket)
✓ 15-compliance_checklist.md (HIPAA)

🚀 Implementing...
✓ Data layer (E2E encryption, 32 files)
✓ Domain layer (12 use cases)
✓ Presentation layer (8 screens)
✓ WebSocket service (reconnection logic)
✓ Tests (127 test cases, 89.1% coverage)

✅ Validation passed
✓ flutter analyze (0 issues)
✓ flutter test (127 passed)
✓ Security scan (0 vulnerabilities)
✓ HIPAA compliance (PHI encrypted)

📦 Committing...
✓ Git commit: "feat: implement secure messaging with E2E encryption"

⏱️  Feature 2 complete: 18 min 47 sec

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature 3/4: Medical Records (HIGH)

🚀 Implementing...
✓ Data layer (27 files)
✓ Domain layer (9 use cases)
✓ Presentation layer (7 screens)
✓ PDF viewer integration
✓ Tests (83 test cases, 86.7% coverage)

✅ Validation passed

📦 Committing...
✓ Git commit: "feat: implement medical records with PDF support"

⏱️  Feature 3 complete: 13 min 12 sec

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature 4/4: Push Notifications (MEDIUM)

🚀 Implementing...
✓ Data layer (18 files)
✓ Domain layer (6 use cases)
✓ Presentation layer (4 screens)
✓ FCM integration
✓ Tests (52 test cases, 85.2% coverage)

✅ Validation passed

📦 Committing...
✓ Git commit: "feat: implement push notifications with FCM"

⏱️  Feature 4 complete: 9 min 38 sec

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Full Cycle Complete!

⏱️  Total Time: 56 min 12 sec (estimated: 57 min)

📊 Metrics:
- Features Implemented: 4
- Files Generated: 100 files (11,247 lines)
- Tests Generated: 331 tests (87.1% avg coverage)
- Git Commits: 4
- Security Issues: 0
- Compliance: HIPAA ✓

📝 Automation Report: AUTOMATION_REPORT.md

Next Steps:
1. Review code: git log --oneline -4
2. Run app: flutter run
3. QA check: /qa-check
4. Deploy: Ready for staging!

Continue with remaining 3 features? (y/n)
```

## Generated Report

Creates `AUTOMATION_REPORT.md`:

```markdown
# Automation Report - 2025-01-15

## Summary
- **Duration:** 56 min 12 sec
- **Features Implemented:** 4/7 (57%)
- **Files Generated:** 100 files (11,247 lines of code)
- **Tests Generated:** 331 tests (87.1% avg coverage)
- **Commits:** 4 commits
- **Success Rate:** 100%

## Features Implemented

### 1. Appointment Scheduling (14 min)
- **Complexity:** HIGH
- **Files:** 23 files (2,847 lines)
- **Tests:** 69 tests (87.3% coverage)
- **Commit:** abc1234

### 2. Secure Messaging (18 min)
- **Complexity:** CRITICAL
- **Files:** 32 files (4,123 lines)
- **Tests:** 127 tests (89.1% coverage)
- **Security:** E2E encryption, HIPAA compliant
- **Commit:** def5678

[... additional features ...]

## Quality Metrics
- **Test Coverage:** 87.1% (target: 85%)
- **Static Analysis:** 0 issues
- **Security Vulnerabilities:** 0
- **Compliance:** HIPAA ✓

## Time Breakdown
- Implementation: 42 min (75%)
- Testing: 8 min (14%)
- Validation: 4 min (7%)
- Commits: 2 min (4%)

## Next Steps
- [ ] Manual testing of implemented features
- [ ] Run /qa-check for compliance audit
- [ ] Deploy to staging environment
- [ ] Continue with 3 remaining features
```

## Options

| Option | Description | Example |
|--------|-------------|---------|
| `--features N` | Number of features to implement (1-10) | `/full-cycle --features 3` |
| `--skip-tests` | Skip test generation (not recommended) | `/full-cycle --skip-tests` |
| `--no-commit` | Don't auto-commit after each feature | `/full-cycle --no-commit` |
| `--parallel` | Implement independent features in parallel | `/full-cycle --parallel` |

## Safety Features

- **Dependency Resolution:** Implements features in correct order
- **Validation Gates:** Tests must pass before proceeding
- **Rollback:** Auto-rollback if feature fails validation
- **Progress Save:** Can resume if interrupted
- **Git Safety:** Creates branch before starting

## Performance

| Features | Time (Estimated) | Time (Actual Avg) | Files Generated | Tests Generated |
|----------|------------------|-------------------|----------------|-----------------|
| 1 | 10 min | 9-12 min | 15-25 | 40-70 |
| 3 | 30 min | 28-35 min | 45-75 | 120-210 |
| 5 | 50 min | 47-58 min | 75-125 | 200-350 |
| 10 | 100 min | 95-115 min | 150-250 | 400-700 |

## Requirements

- **Bootstrap:** Must run `/bootstrap-from-prprompts` first
- **IMPLEMENTATION_PLAN.md:** Must exist
- **Git:** Repository must be initialized
- **Tests Passing:** Existing tests must pass

## Error Handling

If a feature fails:
1. Shows detailed error message
2. Keeps previous features (doesn't rollback all)
3. Saves progress to `AUTOMATION_PROGRESS.json`
4. Suggests fixes or `/implement-next` to retry

## Related Commands

- `/bootstrap-from-prprompts` - Initial setup
- `/implement-next` - Implement one feature at a time
- `/review-and-commit` - Validate & commit manually
- `/qa-check` - Comprehensive compliance audit

## Time Savings

**Manual Development:** 3-5 days for 10 features (with tests)
**Full Cycle:** 1.5-2 hours for 10 features

**Speedup:** 40-60x faster

---

**Powered by PRPROMPTS v4.0** | **40-60x Faster Development** | [Docs](https://github.com/Kandil7/prprompts-flutter-generator#readme)
