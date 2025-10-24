# Code Reviewer - Complete Guide

> **Automated code review in 3-10 minutes**
>
> Reviews Flutter code against PRPROMPTS patterns, Clean Architecture, security standards, and test coverage.

---

## Quick Start

```bash
# Review entire codebase
@claude use skill automation/code-reviewer

# Review specific feature
@claude use skill automation/code-reviewer
# Input: target_path: "lib/features/auth"

# Security-focused review
@claude use skill automation/code-reviewer
# Input: review_type: "security"

# Auto-fix issues
@claude use skill automation/code-reviewer
# Input: auto_fix: true
```

---

## Review Types

### 1. Full Review (Default)
- Architecture compliance
- Security patterns
- Test coverage
- Code style

### 2. Architecture Review
- Clean Architecture structure
- Dependency direction
- Layer separation
- Circular dependencies

### 3. Security Review
- JWT handling
- Password security
- API security (HTTPS)
- Compliance (HIPAA, PCI-DSS, GDPR)

### 4. Testing Review
- Test coverage percentage
- Test quality (assertions, mocks)
- Missing tests
- Empty tests

### 5. Style Review
- Flutter analyze results
- Naming conventions
- Code formatting
- Unused imports

---

## Output Example

```markdown
# Code Review Report

## Overall Score: 78/100 (C+)

### Issues Found: 24

🔴 CRITICAL: 2 issues
🟠 HIGH: 5 issues
🟡 MEDIUM: 12 issues
🔵 LOW: 5 issues

### Critical Issues

1. JWT Private Key Exposure
   - File: lib/core/auth/jwt_signer.dart:15
   - Fix: Remove JWT signing, verify only

2. Password Stored Locally
   - File: lib/features/auth/data/datasources/auth_local_data_source.dart:42
   - Fix: Use FlutterSecureStorage for tokens only

### Scores by Category

- Architecture: 85/100 ✅
- Security: 65/100 ⚠️
- Testing: 72/100 👍
- Code Style: 90/100 ✅

### Recommendations

Immediate:
1. Remove JWT signing
2. Remove password storage
3. Fix domain layer imports

Short-term:
4. Increase test coverage to 70%+
5. Fix code style issues
```

---

## Configuration

### Severity Threshold

```bash
# Only show critical and high issues
severity_threshold: "high"

# Show all issues including info
severity_threshold: "info"
```

### Auto-Fix

```bash
# Automatically fix common issues
auto_fix: true

# Creates commit:
# "style: auto-fix code review issues"
```

### Output Format

```bash
# Markdown (default)
output_format: "markdown"

# JSON (for CI/CD)
output_format: "json"

# HTML (for reports)
output_format: "html"
```

---

## Common Issues Detected

### Architecture Violations

```dart
// ❌ Domain importing data layer
import '../../data/repositories/auth_repository_impl.dart';

// ✅ Domain importing domain
import '../repositories/auth_repository.dart';
```

### Security Issues

```dart
// ❌ Signing JWT in Flutter
final jwt = JWT.encode(payload, privateKey);

// ✅ Verifying JWT only
final jwt = JWT.verify(token, publicKey);

// ❌ Storing passwords
prefs.setString('password', password);

// ✅ Storing tokens securely
secureStorage.write(key: 'access_token', value: token);
```

### Test Quality

```dart
// ❌ Empty test
test('login works', () {
  // TODO
});

// ✅ Complete test
test('should return User when login succeeds', () async {
  when(mockRepository.login(any, any))
      .thenAnswer((_) async => Right(tUser));

  final result = await loginUseCase(params);

  expect(result, Right(tUser));
  verify(mockRepository.login(email, password));
});
```

---

## Scoring System

### Overall Score Calculation

```
Overall Score =
  Architecture * 0.30 +
  Security * 0.30 +
  Testing * 0.25 +
  Style * 0.15

Letter Grades:
A: 90-100 (Excellent)
B: 80-89  (Good)
C: 70-79  (Acceptable)
D: 60-69  (Needs Work)
F: 0-59   (Critical Issues)
```

### Score Deductions

**Architecture:**
- Missing domain layer: -20
- Wrong imports: -5 per violation
- Circular dependencies: -10 per cycle

**Security:**
- Critical vulnerability: -20 per issue
- High risk: -10 per issue
- Medium risk: -5 per issue

**Testing:**
- Coverage < 70%: -30
- Empty tests: -10 per test
- No assertions: -5 per test

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Code Review

on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run code review
        run: |
          claude use skill automation/code-reviewer <<EOF
          review_type: full
          severity_threshold: high
          output_format: json
          EOF

      - name: Check score
        run: |
          SCORE=$(jq '.review_score' review-report.json)
          if [ $SCORE -lt 70 ]; then
            echo "Code review score too low: $SCORE"
            exit 1
          fi
```

---

## FAQ

**Q: Can I review a single file?**

A: Yes! Set `target_path: "lib/features/auth/domain/usecases/login.dart"`

**Q: Does auto-fix require git commit?**

A: Yes. Auto-fix will fail if you have uncommitted changes.

**Q: How long does a full review take?**

A: 3-10 minutes depending on codebase size (100-1000 files).

**Q: Can I ignore specific issues?**

A: Add comments in code:
```dart
// code-reviewer-ignore: jwt-signing
final jwt = JWT.encode(payload, key);
```

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
**Skill Status:** ✅ Implemented
