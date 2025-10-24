# QA Auditor - Complete Guide

> **Comprehensive QA audit in 10-20 minutes**
>
> Production-readiness audit with compliance certification for HIPAA, PCI-DSS, GDPR, SOC2, COPPA, FERPA.

---

## Quick Start

```bash
# Full audit
@claude use skill automation/qa-auditor

# Pre-production audit
@claude use skill automation/qa-auditor
# Input: audit_type: "pre-production"

# HIPAA compliance audit
@claude use skill automation/qa-auditor
# Input:
#   audit_type: "compliance"
#   compliance_standards: ["HIPAA"]
#   generate_certificate: true
```

---

## Audit Types

### 1. Full Audit (Default)
- Architecture (25%)
- Security (25%)
- Testing (20%)
- Compliance (15%)
- Performance (10%)
- Code Quality (5%)

### 2. Pre-Production Audit
Focus on production blockers:
- Critical security issues
- Zero-error requirement
- Test coverage >= 70%
- No known bugs

### 3. Compliance Audit
Deep dive into specific standards:
- HIPAA: PHI protection, audit logs
- PCI-DSS: Payment security, tokenization
- GDPR: Data privacy, user rights
- SOC2: Security controls, availability

### 4. Security Audit
Security-only focus:
- Authentication & authorization
- Data protection
- API security
- Vulnerability scanning

---

## Scoring System

### Overall Score Calculation

```
Overall Score =
  Architecture × 0.25 +
  Security × 0.25 +
  Testing × 0.20 +
  Compliance × 0.15 +
  Performance × 0.10 +
  Code Quality × 0.05

Pass/Fail:
Pass: Score >= threshold AND critical_issues == 0
Fail: Score < threshold OR critical_issues > 0
```

### Score Breakdown

**Architecture (25 points):**
- Clean Architecture: 10 pts
- Dependency flow: 8 pts
- Repository pattern: 4 pts
- Use case design: 3 pts

**Security (25 points):**
- Authentication: 8 pts
- Data protection: 8 pts
- API security: 5 pts
- Compliance: 4 pts

**Testing (20 points):**
- Coverage: 10 pts
- Test quality: 6 pts
- Integration tests: 4 pts

**Compliance (15 points):**
- Required controls: 10 pts
- Documentation: 3 pts
- Audit trail: 2 pts

**Performance (10 points):**
- App performance: 6 pts
- Network efficiency: 4 pts

**Code Quality (5 points):**
- Zero errors: 3 pts
- Code standards: 2 pts

---

## Pass/Fail Criteria

### ✅ Pass Requirements

**Minimum Scores:**
- Overall: >= 75/100 (default)
- Architecture: >= 20/25
- Security: >= 20/25
- Testing: >= 14/20
- Compliance: >= 12/15 (if standards specified)

**Zero Tolerance:**
- Critical security issues: 0
- Flutter analyze errors: 0
- Failed tests: 0

### ❌ Fail Conditions

**Automatic Fail:**
- Critical security vulnerability
- Compliance violation (HIPAA, PCI-DSS, etc.)
- Test coverage < 60%
- Flutter analyze errors > 0

---

## Compliance Standards

### HIPAA (Healthcare)

**Requirements:**
- PHI encryption at rest (AES-256-GCM)
- Audit logging (all PHI access)
- Session timeout (15 minutes)
- No PHI in logs
- Access controls
- Data backup

**Certificate:** Valid for 90 days

### PCI-DSS (Payments)

**Requirements:**
- No card storage
- Tokenization (Stripe, PayPal)
- Only last 4 digits displayed
- CVV never stored
- HTTPS only
- SAQ compliance

**Certificate:** Valid for 90 days

### GDPR (EU Data Privacy)

**Requirements:**
- Data export (right to portability)
- Data deletion (right to be forgotten)
- Consent management
- Privacy policy
- Data minimization

**Certificate:** Valid for 1 year

### SOC2 (Enterprise)

**Requirements:**
- Security controls
- Availability (99.9% uptime)
- Processing integrity
- Confidentiality
- Privacy

**Certificate:** Valid for 1 year

---

## Output Example

```markdown
# QA Audit Report

## Overall Result: ✅ PASS

**Overall Score:** 87/100
**Threshold:** 75
**Status:** ✅ PASSED

## Scores by Category

Architecture: 24/25 (96%) ✅
Security: 23/25 (92%) ✅
Testing: 16/20 (80%) ✅
Compliance: 14/15 (93%) ✅ (HIPAA)
Performance: 8/10 (80%) ✅
Code Quality: 5/5 (100%) ✅

## Critical Issues: 0 ✅

## Compliance: HIPAA

Overall: 93/100 ✅

Requirements Met: 18/19

Controls:
✅ PHI encryption (AES-256-GCM)
✅ Audit logging enabled
✅ Session timeout (15 min)
✅ No PHI in logs
⚠️  MFA not enforced (recommended)

## Certification

✅ **PASSED QA AUDIT**

**Certification Details:**
- Audit Date: 2025-10-24
- Standards: HIPAA
- Valid Until: 2026-01-22 (90 days)

**Certificate:** docs/QA_CERTIFICATE_2025-10-24.pdf

**This application is production-ready!** 🎉
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: QA Audit

on:
  push:
    branches: [main, master]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run QA audit
        run: |
          claude use skill automation/qa-auditor <<EOF
          audit_type: pre-production
          fail_threshold: 75
          EOF

      - name: Check result
        run: |
          if grep -q "FAILED QA AUDIT" docs/QA_REPORT_*.md; then
            echo "QA audit failed"
            exit 1
          fi

      - name: Upload certificate
        if: success()
        uses: actions/upload-artifact@v3
        with:
          name: qa-certificate
          path: docs/QA_CERTIFICATE_*.pdf
```

---

## FAQ

**Q: How often should I run QA audit?**

A:
- Before production: Always
- After major features: Recommended
- Weekly: For compliance requirements
- Before releases: Mandatory

**Q: What if I fail the audit?**

A: Fix critical issues first, then re-run:
```bash
# Fix issues
# ...

# Re-audit
@claude use skill automation/qa-auditor
```

**Q: Can I customize the pass threshold?**

A: Yes! Set `fail_threshold`:
```bash
# Stricter (85%)
fail_threshold: 85

# Default (75%)
fail_threshold: 75

# Lenient (65%) - not recommended for production
fail_threshold: 65
```

**Q: How long is the certificate valid?**

A:
- HIPAA, PCI-DSS: 90 days
- GDPR, SOC2: 1 year
- Re-audit before expiration

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
**Skill Status:** ✅ Implemented
