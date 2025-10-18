---
name: qa-check
description: "[prprompts] Comprehensive compliance audit - generates QA_REPORT.md with score"
category: Automation
version: 4.0.0
tags: [prprompts, qa, compliance, audit, security]
badge: NEW
---

# /qa-check - Comprehensive Compliance Audit

🔍 **v4.0 Automation** - Complete quality assurance and compliance audit. Generates detailed `QA_REPORT.md` with scores, findings, and recommendations.

## Usage

```bash
/qa-check
```

Or with specific compliance framework:
```bash
/qa-check --framework hipaa
/qa-check --framework pci-dss
/qa-check --framework gdpr
```

## What It Does

Performs comprehensive audit across 8 categories:

### 1. Architecture Compliance (15%)
- Clean Architecture structure
- Feature separation
- Dependency flow (presentation → domain → data)
- Layer isolation

### 2. Code Quality (15%)
- Static analysis (flutter analyze)
- Linting rules
- Code formatting
- Complexity metrics
- Duplicate code detection

### 3. Testing (20%)
- Test coverage (≥85%)
- Unit test quality
- Widget test coverage
- Integration test coverage
- Test naming conventions

### 4. Security (20%)
- Dependency vulnerabilities
- Hardcoded secrets
- Encryption implementation
- Authentication flows
- Authorization checks
- Input validation
- Secure storage usage

### 5. Compliance (15%)
- HIPAA rules (if applicable)
- PCI-DSS rules (if applicable)
- GDPR rules (if applicable)
- Custom compliance rules
- Audit logging
- Data retention policies

### 6. Performance (5%)
- App startup time
- Frame rendering (60fps)
- Memory usage
- Network efficiency
- Build size

### 7. Accessibility (5%)
- Semantic labels
- Screen reader support
- Color contrast
- Font scaling
- Keyboard navigation

### 8. Documentation (5%)
- Code comments
- README completeness
- API documentation
- Architecture diagrams
- Deployment guides

## Example Session

```
/qa-check

🔍 Starting Comprehensive QA Audit...

Project: HealthTracker Pro
Compliance Frameworks: HIPAA, GDPR
Date: 2025-01-15 14:23:45

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Architecture Compliance (15%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Clean Architecture structure
✓ Feature modules properly separated
✓ Dependency flow correct (presentation → domain → data)
✓ No circular dependencies
✓ Repository pattern implemented
✓ Use case single responsibility
⚠ Minor: 2 presentation files importing data layer directly

Score: 14/15 (93%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. Code Quality (15%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running flutter analyze...
✓ 0 errors
✓ 2 warnings (acceptable)
✓ All files formatted (dart format)
✓ Cyclomatic complexity avg: 4.2 (max: 8, target: <10)
✓ No duplicate code detected
✓ Naming conventions followed

Warnings:
  lib/features/auth/presentation/pages/login_page.dart:47
    - Prefer const constructors

Score: 14/15 (93%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. Testing (20%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Running tests...
✓ Unit tests: 247 passed, 0 failed
✓ Widget tests: 83 passed, 0 failed
✓ Integration tests: 23 passed, 0 failed

Coverage Analysis:
✓ Overall: 87.3% (target: 85%)
  - lib/core/: 91.2%
  - lib/features/auth/: 89.4%
  - lib/features/appointments/: 87.1%
  - lib/features/messaging/: 85.3%
  - lib/features/records/: 82.7% ⚠ Below target

✓ Test naming conventions
✓ Arrange-Act-Assert pattern
✓ Mock usage appropriate

Issues:
  - Medical records feature below 85% coverage

Score: 18/20 (90%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. Security (20%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dependency Scan:
✓ 0 critical vulnerabilities
✓ 0 high vulnerabilities
✓ 2 medium vulnerabilities (non-blocking)

Code Security Scan:
✓ No hardcoded secrets
✓ No hardcoded passwords/API keys
✓ PHI encrypted with AES-256-GCM
✓ Tokens stored in secure_storage
✓ JWT RS256 implementation correct
✓ Certificate pinning configured
✓ Biometric auth secured
✓ Input validation on all forms
✓ SQL injection prevention (parameterized queries)
✓ XSS prevention (HTML sanitization)

Authentication & Authorization:
✓ JWT token expiry: 15 min (acceptable)
✓ Refresh token rotation implemented
✓ Role-based access control (RBAC)
✓ Multi-factor authentication (MFA) supported

Issues:
  - 2 medium vulnerabilities in dependencies:
    1. http 0.13.5 (update to 1.1.0)
    2. intl 0.17.0 (update to 0.18.0)

Score: 18/20 (90%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. Compliance - HIPAA (15%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Technical Safeguards:
✓ Access Controls (§164.312(a)(1))
  - Unique user identification
  - Emergency access procedure
  - Automatic logoff (15 min)
  - Encryption and decryption

✓ Audit Controls (§164.312(b))
  - All PHI access logged
  - Audit logs encrypted
  - Log retention: 6 years

✓ Integrity Controls (§164.312(c)(1))
  - Mechanism to authenticate PHI
  - Digital signatures on records

✓ Transmission Security (§164.312(e)(1))
  - TLS 1.3 for data in transit
  - End-to-end encryption for messaging

Physical Safeguards:
✓ Device and Media Controls (§164.310(d)(1))
  - Data disposal (secure deletion)
  - Media re-use (data wiping)

Administrative Safeguards:
⚠ Security Management Process (§164.308(a)(1))
  - Risk analysis documented ✓
  - Risk management plan ✓
  - Sanction policy ⚠ Missing
  - Information system activity review ✓

Issues:
  - Missing sanction policy documentation

Score: 14/15 (93%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. Performance (5%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Cold start time: 1.8s (target: <2s)
✓ Frame rate: 60fps (no jank detected)
✓ Memory usage: 147MB avg (acceptable for healthcare app)
✓ Network efficiency: Request caching implemented
✓ App size: 23.4MB (Android APK)
✓ Build time: 42s (release build)

Score: 5/5 (100%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7. Accessibility (5%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Semantic labels on all interactive widgets
✓ Screen reader tested (TalkBack/VoiceOver)
✓ Color contrast ratio ≥4.5:1
✓ Font scaling supported (up to 200%)
⚠ Keyboard navigation incomplete (2 screens missing)

Score: 4/5 (80%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8. Documentation (5%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ README.md comprehensive
✓ API documentation (35% of public APIs)
✓ Architecture diagram exists
✓ Deployment guide exists
⚠ Code comment coverage: 67% (target: 80%)

Score: 4/5 (80%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Overall QA Score: 91/100 (91%)

Grade: A

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Category Breakdown:
  1. Architecture Compliance: 93%  [▓▓▓▓▓▓▓▓▓░]
  2. Code Quality:          93%  [▓▓▓▓▓▓▓▓▓░]
  3. Testing:               90%  [▓▓▓▓▓▓▓▓▓░]
  4. Security:              90%  [▓▓▓▓▓▓▓▓▓░]
  5. Compliance (HIPAA):    93%  [▓▓▓▓▓▓▓▓▓░]
  6. Performance:          100%  [▓▓▓▓▓▓▓▓▓▓]
  7. Accessibility:         80%  [▓▓▓▓▓▓▓▓░░]
  8. Documentation:         80%  [▓▓▓▓▓▓▓▓░░]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 Critical Issues (0):
  None

🟡 Warnings (5):
  1. 2 presentation files importing data layer directly
  2. Medical records feature test coverage: 82.7% (target: 85%)
  3. 2 medium dependency vulnerabilities
  4. Missing HIPAA sanction policy documentation
  5. Code comment coverage: 67% (target: 80%)

✅ Recommendations:
  1. Fix layer violations in presentation files
  2. Add tests to medical records feature (need 2.3% more)
  3. Update dependencies: http, intl
  4. Document sanction policy in docs/COMPLIANCE.md
  5. Add code comments to public APIs
  6. Complete keyboard navigation for 2 screens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Report saved to: QA_REPORT.md

✨ Great work! Your app is production-ready with minor improvements needed.

Next Steps:
1. Review QA_REPORT.md
2. Fix warnings (estimated: 2 hours)
3. Re-run /qa-check to verify fixes
4. Deploy to staging environment

```

## Generated Report

Creates `QA_REPORT.md` with:

- **Executive Summary:** Overall score and grade
- **Category Scores:** Detailed breakdown with progress bars
- **Critical Issues:** Must-fix items
- **Warnings:** Should-fix items
- **Recommendations:** Best practice improvements
- **Detailed Findings:** Per-category analysis
- **Compliance Matrices:** Framework-specific checklists
- **Trend Analysis:** Comparison with previous audits
- **Action Items:** Prioritized TODO list

## Grading Scale

| Score | Grade | Status |
|-------|-------|--------|
| 95-100% | A+ | Excellent - Production ready |
| 90-94% | A | Great - Minor improvements |
| 85-89% | B+ | Good - Some work needed |
| 80-84% | B | Acceptable - Several issues |
| 75-79% | C+ | Fair - Significant work needed |
| 70-74% | C | Passing - Major improvements required |
| <70% | F | Failing - Not production ready |

## Compliance Frameworks

### HIPAA (Healthcare)
- Technical safeguards
- Physical safeguards
- Administrative safeguards
- Breach notification
- Business associate agreements

### PCI-DSS (Payment Cards)
- Build and maintain secure network
- Protect cardholder data
- Maintain vulnerability management
- Implement strong access controls
- Monitor and test networks
- Maintain information security policy

### GDPR (Privacy)
- Lawfulness, fairness, transparency
- Purpose limitation
- Data minimization
- Accuracy
- Storage limitation
- Integrity and confidentiality
- Accountability

## Options

| Option | Description |
|--------|-------------|
| `--framework <name>` | Focus on specific compliance framework |
| `--category <name>` | Audit specific category only |
| `--verbose` | Include detailed explanations |
| `--fix-suggestions` | Generate code fixes for issues |
| `--compare <tag>` | Compare with previous audit |

## Requirements

- **Flutter SDK:** Installed
- **Project:** Must be a Flutter project
- **Tests:** Test infrastructure recommended

## Related Commands

- `/review-and-commit` - Pre-commit validation
- `/implement-next` - Implement features
- `/full-cycle` - Auto-implement multiple features
- `/bootstrap-from-prprompts` - Initial setup

## Automation Integration

Use in CI/CD:
```yaml
- name: QA Check
  run: gemini qa-check --ci --min-score 85
```

Fails build if score < 85%.

---

**Powered by PRPROMPTS v4.0** | **Quality Assurance** | [Docs](https://github.com/Kandil7/prprompts-flutter-generator#readme)
