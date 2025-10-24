# QA Auditor Examples

> **4 real-world QA audit scenarios with results**

---

## 1. Full Pre-Production Audit (E-Commerce App)

### Scenario
Final audit before production deployment.

### Command
```bash
@claude use skill automation/qa-auditor
# Input:
#   audit_type: "pre-production"
#   fail_threshold: 75
```

### Result
```markdown
# QA Audit Report

Overall Result: ✅ PASS
Overall Score: 87/100

Scores:
- Architecture: 24/25 (96%) ✅
- Security: 23/25 (92%) ✅
- Testing: 17/20 (85%) ✅
- Compliance: N/A
- Performance: 9/10 (90%) ✅
- Code Quality: 5/5 (100%) ✅

Critical Issues: 0 ✅

Issues Found: 3 MEDIUM
1. Test coverage for ProductReviews: 68% (target: 70%)
2. API timeout not set for image uploads
3. Missing error message translations (2 screens)

Recommendations:
- Add 5 test cases for ProductReviews
- Set timeout: 30s for image uploads
- Translate error messages

Certificate: ✅ Production-ready!
Execution Time: 15 minutes
```

---

## 2. HIPAA Compliance Audit (Healthcare App)

### Scenario
Compliance certification for healthcare app before launch.

### Command
```bash
@claude use skill automation/qa-auditor
# Input:
#   audit_type: "compliance"
#   compliance_standards: ["HIPAA"]
#   generate_certificate: true
#   fail_threshold: 90
```

### Result
```markdown
# QA Audit Report - HIPAA Compliance

Overall Result: ✅ PASS
Overall Score: 92/100

Compliance: HIPAA
Score: 92/100 ✅

Requirements Met: 19/20

Controls Passed:
✅ PHI encryption (AES-256-GCM)
✅ Audit logging (all access)
✅ Session timeout (15 min)
✅ No PHI in logs
✅ Access controls (RBAC)
✅ Data backup enabled
✅ Secure communication (TLS 1.2+)
✅ Password policy (8+ chars, complex)
✅ Account lockout (5 attempts)
✅ Unique user IDs
✅ Automatic logoff
✅ Emergency access
✅ Audit report generation
✅ Data integrity
✅ Person authentication
✅ Transmission security
✅ Encryption in transit
✅ Mobile device security
⚠️  MFA not enforced (recommended, not required)

Critical Issues: 0 ✅

Certificate Generated:
📄 docs/HIPAA_CERTIFICATE_2025-10-24.pdf
Valid Until: 2026-01-22 (90 days)

Execution Time: 18 minutes
```

---

## 3. PCI-DSS Audit (FinTech App with Payments)

### Scenario
Payment security audit for app processing credit cards.

### Command
```bash
@claude use skill automation/qa-auditor
# Input:
#   audit_type: "compliance"
#   compliance_standards: ["PCI-DSS"]
#   generate_certificate: true
```

### Result
```markdown
# QA Audit Report - PCI-DSS Compliance

Overall Result: ✅ PASS
Overall Score: 95/100

Compliance: PCI-DSS
Score: 95/100 ✅

Requirements Met: 12/12

SAQ-A Validation (Stripe):
✅ No card data stored
✅ Tokenization implemented
✅ Only last 4 digits displayed
✅ CVV never stored or logged
✅ HTTPS enforced
✅ TLS 1.2+ required
✅ Secure SDK version (latest)
✅ Payment form isolated
✅ No card data in URLs
✅ Session timeout (10 min)
✅ Audit logging enabled
✅ PCI DSS policy documented

Security Scan:
✅ No SQL injection vulnerabilities
✅ No XSS vulnerabilities
✅ No CSRF vulnerabilities
✅ Secure headers configured

Certificate Generated:
📄 docs/PCI_CERTIFICATE_2025-10-24.pdf
Valid Until: 2026-01-22 (90 days)

Merchant Level: 4
SAQ Type: A (Stripe)

Execution Time: 12 minutes
```

---

## 4. Failed Audit with Critical Issues

### Scenario
Audit finds critical security issues blocking production.

### Command
```bash
@claude use skill automation/qa-auditor
# Input: audit_type: "security"
```

### Result
```markdown
# QA Audit Report

Overall Result: ❌ FAIL
Overall Score: 58/100

Critical Issues: 3 🔴

1. JWT Private Key Exposed
   - File: lib/core/auth/jwt_signer.dart:15
   - Severity: CRITICAL
   - Impact: Attackers can forge authentication tokens
   - Fix: Remove JWT signing from Flutter, verify only
   - Compliance Impact: HIPAA violation (authentication)

2. Passwords Stored in SharedPreferences
   - File: lib/features/auth/data/datasources/auth_local_data_source.dart:42
   - Severity: CRITICAL
   - Impact: Credential theft vulnerability
   - Fix: Use FlutterSecureStorage for JWT tokens only
   - Compliance Impact: SOC2 violation (access controls)

3. API Using HTTP Instead of HTTPS
   - File: lib/core/network/api_client.dart:12
   - Severity: CRITICAL
   - Impact: Man-in-the-middle attacks possible
   - Fix: Change baseUrl to https://
   - Compliance Impact: PCI-DSS violation (encryption in transit)

Scores:
- Architecture: 18/25 (72%) ⚠️
- Security: 10/25 (40%) ❌
- Testing: 12/20 (60%) ⚠️
- Compliance: 0/15 (0%) ❌ (Multiple violations)
- Performance: 7/10 (70%) 👍
- Code Quality: 4/5 (80%) 👍

**PRODUCTION BLOCKED**

Required Actions:
1. Fix all 3 critical security issues
2. Re-implement authentication (JWT verify only)
3. Migrate to HTTPS
4. Re-run audit after fixes

To Re-Audit:
```bash
@claude use skill automation/qa-auditor
```

Execution Time: 14 minutes
```

---

## Summary Comparison

| Example | Audit Type | Score | Critical Issues | Pass/Fail | Time |
|---------|-----------|-------|-----------------|-----------|------|
| E-Commerce | Pre-Production | 87/100 | 0 | ✅ PASS | 15 min |
| Healthcare | HIPAA Compliance | 92/100 | 0 | ✅ PASS | 18 min |
| FinTech | PCI-DSS Compliance | 95/100 | 0 | ✅ PASS | 12 min |
| Failed Security | Security Audit | 58/100 | 3 | ❌ FAIL | 14 min |

### Key Takeaways

1. **Zero Tolerance for Critical Issues:** Even high scores fail if critical issues exist
2. **Compliance Certification:** Automated certificate generation for passing audits
3. **Actionable Results:** Specific files, lines, and fixes provided
4. **Fast Execution:** 12-18 minutes for comprehensive audits
5. **Production Blocker:** Failed audits clearly identify what must be fixed

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
