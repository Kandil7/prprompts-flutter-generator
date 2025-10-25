---
# ══════════════════════════════════════════════════════════════
# HEALTHCARE APP - PRD STARTER TEMPLATE
# Pre-configured for HIPAA compliance and healthcare workflows
# ══════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════
# PROJECT METADATA
# ══════════════════════════════════════════════════════════════
project_name: "HealthApp"  # CHANGE THIS
project_version: "1.0.0"
created_date: "2025-01-25"
last_updated: "2025-01-25"

# ══════════════════════════════════════════════════════════════
# CLASSIFICATION (Healthcare pre-configured)
# ══════════════════════════════════════════════════════════════
project_type: "healthcare"

compliance: ["hipaa", "gdpr"]  # Add "fda" if medical device
# HIPAA: Required for PHI handling in US
# GDPR: Required if serving EU patients

platforms: ["ios", "android"]  # Add "web" if needed
# Most healthcare apps start mobile-first

# ══════════════════════════════════════════════════════════════
# AUTHENTICATION & SECURITY (HIPAA-optimized)
# ══════════════════════════════════════════════════════════════
auth_method: "jwt"
# JWT RS256 recommended for healthcare (no private keys in app)

jwt_config:
  algorithm: "RS256"  # Asymmetric - public key verification only
  access_token_expiry: "15m"  # HIPAA best practice: short sessions
  refresh_token_expiry: "7d"
  validate_claims: ["aud", "iss", "exp", "sub", "role"]  # Include role for RBAC

sensitive_data: ["phi", "pii", "biometric"]
# PHI: Protected Health Information (diagnoses, prescriptions, etc.)
# PII: Patient identifiers (name, DOB, SSN, etc.)
# Biometric: If using Face ID/Touch ID

encryption_requirements:
  at_rest: "AES-256-GCM"  # HIPAA requires encryption at rest
  in_transit: "TLS-1.3"   # HIPAA requires encryption in transit
  e2e_required: true      # End-to-end for messaging features

# ══════════════════════════════════════════════════════════════
# ARCHITECTURE & TECHNICAL (Healthcare best practices)
# ══════════════════════════════════════════════════════════════
offline_support: true  # Critical for rural healthcare
real_time: true        # For messaging, notifications

state_management: "bloc"
# BLoC recommended for complex healthcare workflows

architecture_style: "clean_architecture"
# Clean Architecture enforces HIPAA audit trails

backend_type: "rest"
# REST with HL7 FHIR standard for healthcare interoperability

# ══════════════════════════════════════════════════════════════
# HEALTHCARE-SPECIFIC FEATURES (Customize for your app)
# ══════════════════════════════════════════════════════════════
features:
  - name: "Patient Authentication"
    complexity: "high"
    requires: ["biometric_auth", "mfa", "session_timeout"]
    priority: "p0"
    hipaa_controls: ["access_control", "audit_logging"]

  - name: "Patient Records Management"
    complexity: "critical"
    requires: ["phi_encryption", "audit_logging", "rbac"]
    priority: "p0"
    hipaa_controls: ["encryption", "access_control", "audit_logging"]
    notes: "Full CRUD with encryption and audit trail"

  - name: "Secure Messaging (Doctor-Patient)"
    complexity: "high"
    requires: ["e2e_encryption", "audit_logging", "message_retention"]
    priority: "p0"
    hipaa_controls: ["encryption", "audit_logging"]
    notes: "HIPAA-compliant messaging with 7-year retention"

  - name: "Appointment Scheduling"
    complexity: "medium"
    requires: ["calendar_integration", "reminders", "cancellation"]
    priority: "p0"
    hipaa_controls: ["access_control"]

  - name: "Prescription Management"
    complexity: "high"
    requires: ["drug_database", "interaction_warnings", "refill_requests"]
    priority: "p1"
    hipaa_controls: ["encryption", "audit_logging"]
    notes: "May require e-prescribing integration (EPCS)"

  - name: "Health Data Sync (Wearables)"
    complexity: "medium"
    requires: ["health_kit", "google_fit", "data_normalization"]
    priority: "p1"
    hipaa_controls: ["encryption"]

  - name: "Lab Results Delivery"
    complexity: "medium"
    requires: ["hl7_fhir", "pdf_generation", "secure_notification"]
    priority: "p1"
    hipaa_controls: ["encryption", "access_control", "audit_logging"]

  - name: "Billing & Insurance"
    complexity: "critical"
    requires: ["insurance_verification", "claims_submission", "payment"]
    priority: "p2"
    hipaa_controls: ["encryption", "audit_logging"]
    notes: "Add pci-dss compliance if handling payments"

# ══════════════════════════════════════════════════════════════
# TEAM STRUCTURE (Healthcare projects typically need compliance experts)
# ══════════════════════════════════════════════════════════════
team_size: "medium"  # 8-12 people minimum for HIPAA projects

team_composition:
  mobile:
    size: 5
    junior: 1
    mid: 3
    senior: 1

  backend:
    size: 3
    tech_stack: ["node.js", "postgresql", "redis"]
    hipaa_experience_required: true

  qa:
    size: 2
    specializations: ["security_testing", "compliance_validation"]

  security:
    size: 1
    role: "consultant"  # HIPAA compliance officer or consultant
    responsibilities: ["compliance_audits", "security_reviews", "breach_response"]

  design:
    size: 1
    specializations: ["healthcare_ux", "accessibility"]

# ══════════════════════════════════════════════════════════════
# PERFORMANCE & QUALITY (HIPAA requirements)
# ══════════════════════════════════════════════════════════════
performance_targets:
  cold_start_time: "2s"
  frame_rate: "60fps"
  api_response_time: "500ms"

testing_requirements:
  unit_test_coverage: 90  # Higher for healthcare
  widget_test_coverage: 80
  integration_tests_required: true
  security_tests_required: true  # HIPAA mandates security testing
  penetration_testing: "quarterly"  # Required for HIPAA

# ══════════════════════════════════════════════════════════════
# HIPAA-SPECIFIC REQUIREMENTS
# ══════════════════════════════════════════════════════════════
hipaa_requirements:
  audit_logging:
    enabled: true
    log_retention: "6 years"  # HIPAA minimum
    logged_events: ["phi_access", "phi_modification", "phi_deletion", "failed_logins", "permission_changes"]

  access_controls:
    rbac_enabled: true
    roles: ["patient", "provider", "admin", "support"]
    mfa_required_for: ["provider", "admin"]
    session_timeout: "15 minutes"
    automatic_logoff: true

  data_retention:
    phi_retention_period: "7 years"  # State laws may require longer
    deletion_policy: "secure_wipe"
    backup_retention: "7 years"

  breach_notification:
    detection_mechanisms: ["audit_log_monitoring", "intrusion_detection"]
    notification_timeline: "60 days"  # HIPAA requirement
    affected_party_notification: true
    hhs_notification: true  # For breaches > 500 people

  business_associate_agreements:
    required_for: ["cloud_hosting", "analytics", "crash_reporting", "sms_provider"]
    baa_signed_before_production: true

  training_requirements:
    hipaa_training_for: ["all_team_members"]
    training_frequency: "annual"
    training_documentation: true

# ══════════════════════════════════════════════════════════════
# DEPLOYMENT & DEMO (Healthcare considerations)
# ══════════════════════════════════════════════════════════════
demo_frequency: "biweekly"
# Less frequent for healthcare due to stakeholder availability

demo_requirements:
  environment: "dedicated"
  entry_point: "lib/main_demo.dart"
  synthetic_data: true  # NEVER use real PHI in demos
  data_generator: "faker_with_hipaa_safe_data"
  demo_watermark: "DEMO - NOT FOR PRODUCTION USE"

deployment_requirements:
  hosting: "hipaa_compliant"  # AWS HIPAA, Google Cloud Healthcare API, Azure Healthcare
  baa_required: true
  data_residency: "us-east-1"  # Specify region for compliance
  disaster_recovery: true
  backup_frequency: "daily"
  incident_response_plan: true

# ══════════════════════════════════════════════════════════════
# BUSINESS CONTEXT (Healthcare timelines are longer)
# ══════════════════════════════════════════════════════════════
business_context:
  timeline: "12 months"  # Healthcare projects take longer due to compliance
  mvp_timeline: "6 months"  # MVP must still be HIPAA compliant
  target_users: 10000
  go_live_checklist:
    - "HIPAA compliance audit complete"
    - "Penetration testing passed"
    - "BAAs signed with all vendors"
    - "Incident response plan tested"
    - "Staff HIPAA training complete"

# ══════════════════════════════════════════════════════════════
# INTEGRATION REQUIREMENTS (Common healthcare integrations)
# ══════════════════════════════════════════════════════════════
integrations:
  ehr_systems:
    - name: "Epic FHIR API"
      standard: "HL7 FHIR R4"
      authentication: "OAuth2"
    - name: "Cerner"
      standard: "HL7 FHIR R4"
      authentication: "OAuth2"

  pharmacy_systems:
    - name: "Surescripts"
      purpose: "e-prescribing"
      compliance: "EPCS"

  lab_systems:
    - name: "LabCorp API"
      standard: "HL7 v2.5"
      data_format: "HL7 messages"

  telehealth:
    - name: "Twilio Video"
      purpose: "video_consultations"
      hipaa_compliant: true
      baa_required: true

# ══════════════════════════════════════════════════════════════
# CUSTOMIZATION FLAGS
# ══════════════════════════════════════════════════════════════
prprompts_config:
  generate_all_files: true
  verbosity: "detailed"
  include_junior_explanations: true
  auto_generate_subagents: true
  healthcare_specialization: true  # Generates healthcare-specific patterns
---

# Product Requirements Document: [Your Healthcare App Name]

## 1. Executive Summary

[Describe your healthcare application. Example:]

[App Name] is a HIPAA-compliant mobile application designed to [primary purpose, e.g., "connect patients with their healthcare providers through secure messaging, appointment scheduling, and health record access"]. The app serves [target users, e.g., "100,000 patients and 5,000 healthcare providers across the US"] and prioritizes patient privacy, data security, and regulatory compliance.

Key differentiators:
- Full HIPAA compliance with built-in audit logging
- Offline-first architecture for rural healthcare access
- Integration with major EHR systems (Epic, Cerner) via HL7 FHIR
- End-to-end encrypted messaging for patient-provider communication

## 2. Product Vision

### 2.1 Problem Statement
[Describe the healthcare problem you're solving. Example:]

Patients struggle to access their health information and communicate with providers outside of office visits. Traditional patient portals are clunky, lack mobile optimization, and don't support offline access. Healthcare providers need a secure, HIPAA-compliant way to communicate with patients remotely.

### 2.2 Vision (3-5 years)
[Your long-term vision. Example:]

Become the leading patient engagement platform, trusted by 1 million patients and 50,000 providers nationwide. Expand to include telehealth consultations, chronic disease management, and integration with 100+ healthcare systems.

### 2.3 Success Criteria
- User adoption: 10,000 active patients in first 6 months
- Provider satisfaction: 4.5/5 stars
- HIPAA audit: Zero violations in first year
- App Store rating: 4.7/5 stars

## 3. Target Users

### Primary Users

**Persona 1: Active Patient (Sarah, 45)**
- Demographics: Working professional, manages chronic condition (diabetes)
- Tech Savvy: Medium (comfortable with apps, not developer-level)
- Goals: Track health data, message doctor between visits, refill prescriptions
- Pain Points: Can't access health records easily, long wait times for appointment scheduling
- Usage Pattern: Opens app 3-4x per week, primarily evenings

**Persona 2: Healthcare Provider (Dr. Johnson, 52)**
- Demographics: Family physician, sees 25 patients/day
- Tech Savvy: Low-Medium (uses EHR daily, prefers simple interfaces)
- Goals: Communicate with patients efficiently, review messages between appointments
- Pain Points: Phone tag with patients, EMR doesn't support mobile messaging
- Usage Pattern: Checks app during breaks, responds to messages in batch

### Secondary Users

**Persona 3: Caregiver (Michael, 38)**
- Demographics: Adult child caring for elderly parent
- Goals: Monitor parent's health, schedule appointments, view medication list
- Access Level: Limited proxy access (with patient consent)

## 4. Core Features (Detailed)

### 4.1 Patient Authentication

**Description:**
Secure authentication with biometric support (Face ID/Touch ID) and multi-factor authentication for providers and administrators.

**User Stories:**
- As a patient, I want to log in with Face ID so that I can access my health data quickly and securely
- As a provider, I want MFA so that patient data is protected even if my password is compromised
- As an admin, I want to enforce session timeouts so that unattended devices don't expose PHI

**Acceptance Criteria:**
- [ ] Patient can register with email/password + phone verification
- [ ] Biometric auth available on supported devices
- [ ] MFA required for provider and admin roles
- [ ] Sessions expire after 15 minutes of inactivity
- [ ] Failed login attempts logged in audit trail
- [ ] Password policy: minimum 12 characters, mixed case, symbols, no common passwords

**Technical Requirements:**
- JWT RS256 with public key verification (backend signs, app verifies)
- Biometric: LocalAuthentication package (iOS/Android)
- MFA: TOTP-based (Google Authenticator compatible)
- Secure storage: flutter_secure_storage for tokens

**HIPAA Compliance:**
- Access control implementation (45 CFR § 164.312(a)(1))
- Audit trail for authentication events (45 CFR § 164.312(b))
- Automatic logoff (45 CFR § 164.312(a)(2)(iii))

[Continue this pattern for all 8 features listed in frontmatter]

## 5. Non-Functional Requirements

### 5.1 Security (HIPAA-Critical)
- **PHI Encryption:** AES-256-GCM at rest, TLS 1.3 in transit
- **Access Controls:** Role-based (patient, provider, admin, support)
- **Audit Logging:** All PHI access logged with timestamp, user, action, IP
- **Session Management:** 15-minute timeout, no concurrent sessions
- **Data Deletion:** Secure wipe (NIST 800-88 standards)

### 5.2 Performance
- **Cold Start:** < 2 seconds on iPhone 12/Pixel 5
- **API Response:** < 500ms for 95th percentile
- **Frame Rate:** 60fps during scrolling
- **Offline Sync:** < 30 seconds to sync 100 records

### 5.3 Accessibility (WCAG 2.1 AA)
- Screen reader support (VoiceOver/TalkBack)
- Minimum touch targets: 44x44 points
- Color contrast ratio: 4.5:1 minimum
- Text scaling up to 200%

## 6. Compliance Requirements

### 6.1 HIPAA Compliance

**Security Rule (45 CFR § 164.312):**
- Technical safeguards implemented (encryption, access control, audit logs)
- Security risk assessment completed
- Security incident procedures documented

**Privacy Rule (45 CFR § 164.500):**
- Minimum necessary standard enforced
- Patient rights supported (access, amendment, accounting of disclosures)
- Notice of Privacy Practices provided

**Breach Notification Rule (45 CFR § 164.400):**
- Breach detection mechanisms in place
- Notification procedures within 60 days
- Breach log maintained

**Business Associate Agreements:**
- BAAs required for: Cloud hosting, analytics, crash reporting, SMS provider
- All BAAs signed before production launch

### 6.2 GDPR Compliance (for EU patients)
[Add if serving EU users]

## 7. Technical Architecture

**Clean Architecture Layers:**
1. Presentation (UI + BLoC)
2. Domain (Entities + Use Cases)
3. Data (Repositories + Data Sources)

**Key Components:**
- **State Management:** BLoC (flutter_bloc)
- **Dependency Injection:** get_it + injectable
- **Local Storage:** Drift (encrypted) + flutter_secure_storage
- **Networking:** Dio with retry logic
- **PHI Encryption:** encrypt package (AES-256-GCM)
- **Audit Logging:** Custom service writing to backend

**Security Patterns:**
- JWT verification only (no signing in app)
- PHI never logged or sent to crash reporting
- All sensitive data encrypted before storage
- API calls over TLS 1.3 only

## 8. Testing Strategy

**Unit Tests (90% coverage):**
- All business logic
- Encryption/decryption functions
- Audit logging service
- RBAC implementation

**Widget Tests (80% coverage):**
- All UI components
- Form validation
- Navigation flows
- Error states

**Integration Tests:**
- Full user journeys (login → view records → logout)
- Offline sync scenarios
- PHI encryption end-to-end
- Audit log generation

**Security Testing:**
- Penetration testing (quarterly)
- HIPAA compliance audit (annual)
- Vulnerability scanning (continuous)

## 9. Timeline & Milestones

### Phase 1: MVP (Months 1-6)
- [ ] HIPAA compliance foundation (encryption, audit logging, RBAC)
- [ ] Authentication + Patient Records
- [ ] Secure Messaging
- [ ] Appointment Scheduling
- [ ] Security audit + penetration testing
- [ ] Internal beta testing

### Phase 2: Beta (Months 7-9)
- [ ] Prescription Management
- [ ] Lab Results
- [ ] Wearable integration
- [ ] External beta (100 patients, 10 providers)
- [ ] HIPAA compliance audit

### Phase 3: Production (Months 10-12)
- [ ] Billing & Insurance (if applicable)
- [ ] Final security review
- [ ] App Store submission
- [ ] Soft launch (500 users)
- [ ] Full rollout

## 10. Success Metrics

**User Engagement:**
- DAU/MAU: > 40%
- Average session duration: 5+ minutes
- Messages per user per month: 3+

**Quality:**
- App crash rate: < 0.1%
- API error rate: < 1%
- App Store rating: 4.5+ stars

**Compliance:**
- HIPAA audit violations: 0
- Security incidents: 0
- Data breaches: 0

**Business:**
- Patient acquisition: 10,000 in 6 months
- Provider adoption: 500 in 6 months
- Monthly active users growth: 15%

---

## Healthcare-Specific Considerations

### Data Retention
- PHI retained for 7 years (state laws may require longer)
- Audit logs retained for 6 years minimum
- Deleted data securely wiped (NIST 800-88)

### Incident Response
- Security incident response plan documented
- Breach notification process tested
- Team trained on HIPAA breach notification timeline (60 days)

### Vendor Management
- All vendors assessed for HIPAA compliance
- BAAs in place before data sharing
- Regular vendor security reviews

---

**Next Steps:**
1. Review and customize this PRD for your specific healthcare application
2. Update features list to match your requirements
3. Run: `claude analyze-prd` to validate completeness
4. Generate PRPROMPTS: `claude gen-prprompts`

**Important:** This template is pre-configured for HIPAA compliance. Do not remove security/compliance sections without consulting a HIPAA expert.
