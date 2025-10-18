---
name: analyze-prd
description: "[prprompts] Validate and analyze PRD, show customizations"
category: PRD Generation
version: 4.0.0
tags: [prprompts, prd, validation, analysis]
---

# /analyze-prd - Validate & Analyze PRD

Validates PRD structure, YAML frontmatter, and shows customizations that will be applied to PRPROMPTS generation.

## Usage

```bash
/analyze-prd
```

## What It Does

1. **Validates YAML Frontmatter:**
   - Checks all required keys exist
   - Validates value formats
   - Tests YAML syntax at yamllint.com
   - Ensures compliance settings are valid

2. **Analyzes Document Structure:**
   - Verifies all required sections present
   - Checks feature specifications completeness
   - Validates user stories format
   - Ensures technical architecture details

3. **Shows Customizations:**
   - Lists PRPROMPTS customizations based on PRD
   - Highlights compliance patterns
   - Shows security configurations
   - Displays team-specific settings

## Example Output

```
/analyze-prd

Reading PRD from docs/PRD.md...

✅ PRD Validation Complete

Project: HealthTracker Pro
Type: healthcare
Version: 1.0.0
Last Updated: 2025-01-15

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YAML Frontmatter Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Valid YAML syntax
✓ All required keys present (72/72)
✓ Project metadata complete
✓ Compliance settings valid: HIPAA, GDPR
✓ Authentication config: JWT RS256
✓ Features defined: 7 features
✓ Team composition: 19 total members

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Document Structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Executive Summary
✓ Product Vision
✓ Target Users (3 personas)
✓ Core Features (7 features detailed)
✓ Non-Functional Requirements
✓ Compliance Sections
✓ User Flows
✓ Data Model
✓ API Specifications
✓ Technical Architecture
✓ Testing Strategy
✓ Deployment Plan
✓ Timeline & Milestones
✓ Risk Assessment
✓ Success Metrics

Total Word Count: 2,847 words

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRPROMPTS Customizations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 Security & Compliance:
  • HIPAA compliance patterns
    - PHI encryption (AES-256-GCM)
    - Audit logging for all PHI access
    - Minimum necessary access principle
    - 6-year audit log retention

  • GDPR compliance patterns
    - Data subject rights (access, deletion, portability)
    - Consent management
    - Privacy by design
    - Data protection impact assessments

🔑 Authentication:
  • JWT RS256 implementation
    - Access token: 15 min expiry
    - Refresh token: 7 days expiry
    - Token rotation on refresh
    - Validate claims: aud, iss, exp, sub

🏗️ Architecture:
  • Clean Architecture with BLoC
  • Offline-first with Hive
  • Real-time updates via WebSocket
  • REST API client

📊 Data Security:
  • Sensitive data: PHI, PII
  • At-rest encryption: AES-256-GCM
  • In-transit encryption: TLS 1.3
  • End-to-end encryption for messaging

👥 Team Customizations:
  • Large team (19 members)
  • 2 junior mobile developers
    → Extra explanations in guides
    → Step-by-step instructions
    → Junior developer guide (file 32)

  • Mobile team: 8 developers
    → Detailed code review checklist
    → Advanced patterns documented

🎭 Demo Mode:
  • Weekly demos configured
  • Dedicated demo environment
  • Synthetic HIPAA-compliant data
  • Basic auth protection
  • Entry point: lib/main_demo.dart

📱 Platforms:
  • iOS, Android, Web

🎯 Quality Targets:
  • Unit test coverage: 85%
  • Widget test coverage: 75%
  • Integration tests required
  • Performance: 2s cold start, 60fps

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7 Features Defined:

1. User Authentication (MEDIUM)
   Requires: biometric_auth, mfa

2. Patient Dashboard (MEDIUM)
   Requires: real_time_updates, data_visualization

3. Appointment Scheduling (HIGH)
   Requires: calendar_integration, notifications

4. Secure Messaging (CRITICAL)
   Requires: e2e_encryption, real_time, hipaa_audit

5. Medical Records (HIGH)
   Requires: pdf_viewer, phi_encryption, offline_access

6. Prescription Management (MEDIUM)
   Requires: barcode_scanning, pci_compliance

7. Health Metrics Tracking (MEDIUM)
   Requires: charts, data_export, wearable_integration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Warnings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Feature "Prescription Management" requires PCI compliance
    but PRD compliance list only includes HIPAA, GDPR.
    Consider adding PCI-DSS if handling payment card data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ PRD is valid and ready for PRPROMPTS generation!

Next steps:
1. Review customizations above
2. Edit PRD if needed: vim docs/PRD.md
3. Generate PRPROMPTS: /gen-prprompts

Ready to generate? (y/n)
```

## Validation Checks

- ✅ YAML syntax validity
- ✅ Required keys present
- ✅ Compliance settings valid
- ✅ Authentication configuration
- ✅ Feature specifications
- ✅ Team composition
- ✅ Timeline realistic
- ✅ Success metrics measurable

## Related Commands

- `/create-prd` - Create new PRD
- `/gen-prprompts` - Generate PRPROMPTS from PRD
- `/auto-gen-prd` - Auto-generate PRD
- `/prd-from-files` - Generate from existing docs

---

**Powered by PRPROMPTS v4.0** | [Docs](https://github.com/Kandil7/prprompts-flutter-generator#readme)
