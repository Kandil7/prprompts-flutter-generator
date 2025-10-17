# QA Check (PRPROMPTS Compliance Audit)

Comprehensive quality check against all PRPROMPTS.

## 1. PRPROMPTS Compliance Scan
For each PRPROMPTS file (1-32), check relevant sections:

### Architecture Compliance (Files 1-10)
- @PRPROMPTS/01-feature_scaffold.md
  - [ ] Folder structure matches specification
  - [ ] Clean Architecture layers separated
  - [ ] No business logic in presentation

- @PRPROMPTS/03-bloc_implementation.md
  - [ ] All BLoCs use events/states pattern
  - [ ] No direct API calls in BLoCs
  - [ ] Repository pattern used

- @PRPROMPTS/06-design_system.md
  - [ ] No hardcoded colors
  - [ ] Theme consistency
  - [ ] Material 3 compliance

### Security Compliance (File 16)
@PRPROMPTS/16-security_and_compliance.md:

**JWT Verification:**
```bash
# Search for insecure patterns
grep -r "JWT.*sign" lib/
# Should return: NO RESULTS (Flutter never signs!)

grep -r "HS256" lib/
# Should return: NO RESULTS (only RS256 allowed!)
```

**PII/PHI Encryption:**
```bash
# Check for unencrypted sensitive data
grep -r "SharedPreferences.*ssn\|creditCard\|password" lib/
# Should return: NO RESULTS (must use secure storage!)
```

**PCI-DSS Compliance:**
```bash
# Check for stored card numbers
grep -r "cardNumber\|creditCard.*[0-9]" lib/
# Should return: Only tokenized references
```

### Testing Compliance (File 5)
@PRPROMPTS/05-testing_strategy.md:
```bash
flutter test --coverage
# Check coverage: Should be > 70%
```

## 2. Static Analysis
```bash
flutter analyze --fatal-infos
```
Zero issues required.

## 3. Security Audit Checklist
Execute all items from @PRPROMPTS/14-security_audit_checklist.md:
- [ ] No API keys in code
- [ ] Certificate pinning configured
- [ ] Secure storage for tokens
- [ ] Input validation everywhere
- [ ] SQL injection prevention
- [ ] XSS prevention in WebViews

## 4. PRD Requirements Check
Compare @docs/PRD.md against implemented features:
```
Required Features: [X]
Implemented: [Y]
Missing: [Z]

Compliance Required: [HIPAA/PCI-DSS/GDPR]
Compliance Implemented: [Verified/Not Verified]
```

## 5. Generate QA Report
Create `docs/QA_REPORT.md`:
```markdown
# QA Report - [Date]

## PRPROMPTS Compliance Score: [X]/100

### Architecture: [X]/30
- Clean Architecture: ✓/✗
- BLoC Pattern: ✓/✗
- Design System: ✓/✗

### Security: [X]/40
- JWT Verification: ✓/✗ [Critical]
- PII Encryption: ✓/✗ [Critical]
- PCI-DSS: ✓/✗ [Critical]
- HIPAA: ✓/✗ [Critical]

### Testing: [X]/20
- Coverage: [%]
- Unit Tests: ✓/✗
- Widget Tests: ✓/✗

### Code Quality: [X]/10
- Analyzer: ✓/✗
- Formatting: ✓/✗
- Documentation: ✓/✗

## Critical Issues: [Count]
[List blocking issues with PRPROMPTS references]

## Warnings: [Count]
[List non-blocking issues]

## Recommendations:
[Improvement suggestions with PRPROMPTS references]
```

## 6. Summary
```
═══════════════════════════════════
   QA AUDIT COMPLETE
═══════════════════════════════════

Overall Score: [X]/100

Critical Issues: [X] 🚨
Warnings: [X] ⚠️

PRPROMPTS Compliance: [X]%

✓ Safe to deploy / ✗ Fixes required
```
