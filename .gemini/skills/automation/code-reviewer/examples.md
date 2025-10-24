# Code Reviewer Examples

> **4 real-world code review scenarios**

---

## 1. Full Codebase Review

### Scenario
Post-implementation review of authentication feature.

### Command
```bash
@claude use skill automation/code-reviewer
# Input: target_path: "lib/features/auth"
```

### Result
```markdown
# Code Review Report

Overall Score: 82/100 (B)

Issues Found: 8
- CRITICAL: 1 (Password storage)
- HIGH: 2 (Domain imports)
- MEDIUM: 3 (Test coverage)
- LOW: 2 (Style)

Architecture: 90/100 ✅
Security: 70/100 ⚠️
Testing: 75/100 👍
Style: 95/100 ✅

Critical Issue:
File: lib/features/auth/data/datasources/auth_local_data_source.dart:42
Issue: Password stored in SharedPreferences
Fix: Use FlutterSecureStorage for JWT tokens only
```

---

## 2. Security-Focused Review (Healthcare App - HIPAA)

### Scenario
Security audit for healthcare app before production.

### Command
```bash
@claude use skill automation/code-reviewer
# Input:
#   review_type: "security"
#   target_path: "lib/features/patient_records"
```

### Result
```markdown
# Security Review Report

Security Score: 95/100 (A)

HIPAA Compliance: ✅ Passed

Security Checks:
✅ PHI encrypted at rest (AES-256-GCM)
✅ Audit logging enabled
✅ Session timeout (15 minutes)
✅ No PHI in logs
⚠️ 1 issue: Missing MFA for admin users

Issues Found: 1 MEDIUM
- MFA not enforced for admin role
- File: lib/features/auth/domain/usecases/login.dart
- Fix: Add MFA check for admin users
```

---

## 3. Test Coverage Review

### Scenario
Pre-merge check to ensure 70%+ coverage.

### Command
```bash
@claude use skill automation/code-reviewer
# Input:
#   review_type: "testing"
#   severity_threshold: "medium"
```

### Result
```markdown
# Testing Review Report

Test Coverage: 68% (Target: 70%) ⚠️

Missing Coverage:
- lib/features/auth/domain/usecases/logout.dart (0%)
- lib/features/auth/data/datasources/auth_local_data_source.dart (45%)

Test Quality Issues: 3
1. Empty test in test/features/auth/domain/usecases/login_test.dart:42
2. No assertions in test/features/auth/data/repositories/auth_repository_test.dart:78
3. Missing mock verification in test/features/auth/presentation/bloc/auth_bloc_test.dart:120

Recommendations:
- Add 5 test cases to reach 70% coverage
- Complete 3 incomplete tests
```

---

## 4. Auto-Fix Run

### Scenario
Quick cleanup before merge.

### Command
```bash
@claude use skill automation/code-reviewer
# Input:
#   auto_fix: true
#   review_type: "style"
```

### Result
```markdown
# Code Review Report (with Auto-Fix)

Auto-Fixes Applied: 47

1. Formatted 23 files with dart format
2. Removed 12 unused imports
3. Fixed 8 trailing commas
4. Renamed 4 variables to follow conventions

Commit Created: 7f2d8a1
Message: "style: auto-fix code review issues"

Remaining Issues: 0

Final Score: 100/100 (A) ✅
```

---

## Summary

| Example | Review Type | Time | Score | Issues |
|---------|------------|------|-------|--------|
| Full Review | full | 5 min | 82/100 | 8 |
| Security (HIPAA) | security | 3 min | 95/100 | 1 |
| Test Coverage | testing | 4 min | 68% | 3 |
| Auto-Fix | style | 2 min | 100/100 | 47 fixed |

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
