---
# ══════════════════════════════════════════════════════════════
# FINTECH APP - PRD STARTER TEMPLATE
# Pre-configured for PCI-DSS compliance and payment security
# ══════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════
# PROJECT METADATA
# ══════════════════════════════════════════════════════════════
project_name: "PayApp"  # CHANGE THIS
project_version: "1.0.0"
created_date: "2025-01-25"
last_updated: "2025-01-25"

# ══════════════════════════════════════════════════════════════
# CLASSIFICATION (Fintech pre-configured)
# ══════════════════════════════════════════════════════════════
project_type: "fintech"

compliance: ["pci-dss", "gdpr", "sox"]  # Add SOX if publicly traded company
# PCI-DSS: MANDATORY for payment card data
# GDPR: Required if serving EU customers
# SOX: Required for public companies (financial reporting)

platforms: ["ios", "android", "web"]
# Web typically required for fintech (desktop access)

# ══════════════════════════════════════════════════════════════
# AUTHENTICATION & SECURITY (PCI-DSS optimized)
# ══════════════════════════════════════════════════════════════
auth_method: "oauth2"  # Recommended for fintech (Google, Apple Sign-In)
# Alternative: "jwt" for custom auth

oauth2_config:
  providers: ["google", "apple", "microsoft"]
  pkce_enabled: true  # Proof Key for Code Exchange (security best practice)
  token_expiry: "15m"
  refresh_token_expiry: "30d"

# If using JWT instead:
# jwt_config:
#   algorithm: "RS256"
#   access_token_expiry: "5m"  # Very short for fintech
#   refresh_token_expiry: "7d"

sensitive_data: ["payment", "financial", "pii"]
# CRITICAL: NEVER store full credit card numbers (PCI-DSS violation)
# Use tokenization services (Stripe, PayPal, Braintree)

encryption_requirements:
  at_rest: "AES-256-GCM"
  in_transit: "TLS-1.3"  # TLS 1.2 minimum for PCI-DSS
  e2e_required: false  # Tokenization handles payment security

# ══════════════════════════════════════════════════════════════
# ARCHITECTURE & TECHNICAL (Fintech best practices)
# ══════════════════════════════════════════════════════════════
offline_support: false  # Financial transactions require online connectivity
real_time: true  # Critical for balance updates, fraud detection

state_management: "riverpod"  # Riverpod or BLoC recommended for complex state

architecture_style: "clean_architecture"
# Clean Architecture enforces separation of payment logic

backend_type: "rest"
# REST APIs common, GraphQL gaining adoption for fintech

# ══════════════════════════════════════════════════════════════
# FINTECH-SPECIFIC FEATURES (Customize for your app)
# ══════════════════════════════════════════════════════════════
features:
  - name: "User Authentication & KYC"
    complexity: "critical"
    requires: ["oauth2", "mfa", "biometric_auth", "kyc_verification"]
    priority: "p0"
    compliance_controls: ["aml_kyc", "identity_verification"]
    notes: "KYC required for AML compliance"

  - name: "Account Management"
    complexity: "high"
    requires: ["multi_account_support", "balance_display", "transaction_history"]
    priority: "p0"
    compliance_controls: ["access_control", "audit_logging"]

  - name: "Payment Processing"
    complexity: "critical"
    requires: ["tokenization", "stripe_sdk", "3d_secure", "fraud_detection"]
    priority: "p0"
    compliance_controls: ["pci_dss_tokenization", "no_card_storage"]
    notes: "CRITICAL: Never store card numbers - use Stripe/PayPal tokens"

  - name: "Money Transfers (P2P)"
    complexity: "high"
    requires: ["transfer_limits", "recipient_verification", "transfer_history"]
    priority: "p0"
    compliance_controls: ["transaction_monitoring", "aml_screening"]

  - name: "Bill Payments"
    complexity: "medium"
    requires: ["biller_directory", "scheduled_payments", "payment_confirmation"]
    priority: "p1"
    compliance_controls: ["transaction_limits"]

  - name: "Investment Tracking"
    complexity: "high"
    requires: ["portfolio_view", "market_data", "real_time_quotes"]
    priority: "p1"
    compliance_controls: ["disclosure_requirements"]
    notes: "May require securities licenses if offering trading"

  - name: "Card Management (Virtual Cards)"
    complexity: "high"
    requires: ["card_issuance", "freeze_unfreeze", "spending_limits"]
    priority: "p1"
    compliance_controls: ["pci_dss"]

  - name: "Fraud Detection & Alerts"
    complexity: "critical"
    requires: ["anomaly_detection", "push_notifications", "transaction_blocking"]
    priority: "p0"
    compliance_controls: ["fraud_monitoring"]

  - name: "Reports & Statements"
    complexity: "medium"
    requires: ["monthly_statements", "tax_forms", "pdf_generation"]
    priority: "p1"
    compliance_controls: ["sox_reporting"]

# ══════════════════════════════════════════════════════════════
# TEAM STRUCTURE (Fintech requires security & compliance experts)
# ══════════════════════════════════════════════════════════════
team_size: "large"  # 15+ people minimum for fintech with compliance

team_composition:
  mobile:
    size: 6
    junior: 0  # No juniors for payment code
    mid: 4
    senior: 2
    fintech_experience_required: true

  backend:
    size: 5
    tech_stack: ["node.js", "java_spring", "postgresql", "redis"]
    pci_dss_experience_required: true

  security:
    size: 2
    role: "full_time"  # Not consultant - full-time security team
    specializations: ["pci_dss_compliance", "fraud_detection", "penetration_testing"]

  compliance:
    size: 1
    role: "full_time"
    responsibilities: ["aml_kyc", "regulatory_reporting", "audit_coordination"]

  qa:
    size: 3
    specializations: ["security_testing", "payment_flow_testing", "compliance_validation"]

  devsecops:
    size: 2
    responsibilities: ["ci_cd_security", "secrets_management", "infrastructure_hardening"]

  design:
    size: 2
    specializations: ["fintech_ux", "data_visualization"]

# ══════════════════════════════════════════════════════════════
# PERFORMANCE & QUALITY (Fintech requirements)
# ══════════════════════════════════════════════════════════════
performance_targets:
  cold_start_time: "1.5s"  # Faster than average for fintech
  frame_rate: "60fps"
  api_response_time: "300ms"  # Financial data requires speed
  payment_processing_time: "3s"  # User-facing payment confirmation

testing_requirements:
  unit_test_coverage: 95  # Very high for payment code
  widget_test_coverage: 85
  integration_tests_required: true
  security_tests_required: true
  payment_flow_tests: "all_scenarios"  # Success, failure, timeout, retry
  penetration_testing: "quarterly"  # PCI-DSS requirement

# ══════════════════════════════════════════════════════════════
# PCI-DSS SPECIFIC REQUIREMENTS
# ══════════════════════════════════════════════════════════════
pci_dss_requirements:
  saq_level: "A"  # SAQ A if using tokenization (no card data touched)
  # SAQ D if handling card data (NOT RECOMMENDED for mobile apps)

  tokenization:
    provider: "stripe"  # or "paypal", "braintree", "adyen"
    never_store_card_numbers: true
    never_log_card_data: true
    tokens_stored_securely: true

  network_security:
    firewall_configured: true
    waf_enabled: true  # Web Application Firewall
    ddos_protection: true
    api_rate_limiting: true

  access_controls:
    mfa_required_for: ["admin", "developer", "support"]
    rbac_enabled: true
    least_privilege_principle: true

  monitoring:
    transaction_monitoring: true
    fraud_detection: "real_time"
    security_alerts: "immediate"
    log_retention: "1 year"  # PCI-DSS minimum

  vulnerability_management:
    penetration_testing: "quarterly"
    vulnerability_scanning: "weekly"
    patch_management: "within_30_days"

# ══════════════════════════════════════════════════════════════
# AML/KYC REQUIREMENTS
# ══════════════════════════════════════════════════════════════
aml_kyc_requirements:
  kyc_verification:
    identity_verification: true
    verification_provider: "jumio"  # or "onfido", "veriff"
    documents_required: ["government_id", "proof_of_address"]
    liveness_check: true

  transaction_monitoring:
    suspicious_activity_detection: true
    transaction_limits:
      daily: "$10,000"
      monthly: "$50,000"
    large_transaction_reporting: "FinCEN SAR"  # > $10k

  watchlist_screening:
    ofac_screening: true
    pep_screening: true  # Politically Exposed Persons
    sanctions_lists: ["OFAC", "EU", "UN"]

# ══════════════════════════════════════════════════════════════
# DEPLOYMENT & DEMO
# ══════════════════════════════════════════════════════════════
demo_frequency: "weekly"

demo_requirements:
  environment: "dedicated"
  entry_point: "lib/main_demo.dart"
  synthetic_data: true  # NEVER use real financial data
  demo_payment_gateway: "stripe_test_mode"
  demo_cards: "stripe_test_cards"  # 4242 4242 4242 4242
  demo_watermark: "DEMO - TEST MODE"

deployment_requirements:
  hosting: "pci_dss_compliant"  # AWS, GCP, Azure with PCI compliance
  data_residency: "us-east-1"
  multi_region: true  # For availability
  disaster_recovery: true
  backup_frequency: "hourly"
  incident_response_plan: true
  security_incident_response_team: true

# ══════════════════════════════════════════════════════════════
# BUSINESS CONTEXT
# ══════════════════════════════════════════════════════════════
business_context:
  timeline: "10 months"  # Fintech takes longer due to compliance
  mvp_timeline: "5 months"
  target_users: 50000
  regulatory_approval_timeline: "2-4 months"  # May require money transmitter license

  go_live_checklist:
    - "PCI-DSS SAQ completed"
    - "Penetration testing passed"
    - "AML/KYC procedures documented"
    - "Money transmitter license obtained (if required)"
    - "Privacy policy and terms of service reviewed by legal"
    - "Fraud detection system tested"
    - "Incident response plan tested"

# ══════════════════════════════════════════════════════════════
# INTEGRATION REQUIREMENTS
# ══════════════════════════════════════════════════════════════
integrations:
  payment_gateways:
    - name: "Stripe"
      purpose: "card_payments_ach_wallets"
      sdk: "stripe_flutter"
      test_mode: true
      live_mode_keys_in_backend_only: true

  banking_apis:
    - name: "Plaid"
      purpose: "bank_account_linking"
      authentication: "plaid_link"
      data_access: ["transactions", "balances", "identity"]

  fraud_detection:
    - name: "Sift"
      purpose: "fraud_prevention"
      integration: "server_side"

  kyc_verification:
    - name: "Jumio"
      purpose: "identity_verification"
      methods: ["document_scan", "liveness_check"]

  credit_bureaus:  # If offering credit
    - name: "Experian API"
      purpose: "credit_scoring"
      compliance: "FCRA"

# ══════════════════════════════════════════════════════════════
# CUSTOMIZATION FLAGS
# ══════════════════════════════════════════════════════════════
prprompts_config:
  generate_all_files: true
  verbosity: "detailed"
  include_junior_explanations: false  # Assume experienced fintech team
  auto_generate_subagents: true
  fintech_specialization: true
---

# Product Requirements Document: [Your Fintech App Name]

## 1. Executive Summary

[Your fintech app description. Example:]

[App Name] is a PCI-DSS compliant mobile payment application that enables [primary use case, e.g., "peer-to-peer money transfers, bill payments, and virtual card management"]. The app serves [target users] and prioritizes security, fraud prevention, and regulatory compliance.

Key differentiators:
- Full PCI-DSS compliance with tokenized payment processing (Stripe)
- Real-time fraud detection and transaction monitoring
- Multi-layer security (OAuth2, biometrics, MFA)
- Instant transfers with sub-second balance updates

**CRITICAL SECURITY RULE:** This app NEVER stores credit card numbers. All payment processing uses tokenization via Stripe/PayPal.

## 2. Product Vision

### 2.1 Problem Statement
[Describe the financial problem. Example:]

Traditional banking apps are slow, have high fees, and poor mobile experiences. Consumers need instant, low-cost money transfers and modern payment tools (virtual cards, spending insights).

### 2.2 Vision
Become the #1 mobile-first payment platform for millennials and Gen Z, processing $1B in transactions annually with 1M active users.

### 2.3 Success Criteria
- Transaction volume: $10M in first 6 months
- User growth: 50,000 users by month 6
- Fraud rate: < 0.1%
- App Store rating: 4.6+ stars
- PCI-DSS audit: Pass on first attempt

## 3. Target Users

### Primary Users

**Persona 1: Digital Native (Alex, 28)**
- Demographics: Young professional, tech-savvy
- Income: $60k/year
- Goals: Split bills with roommates, send money instantly, track spending
- Pain Points: Traditional banks have slow transfers (2-3 days), high fees
- Device: iPhone 14, always has phone

**Persona 2: Freelancer (Jordan, 34)**
- Demographics: Self-employed, receives payments from multiple clients
- Goals: Receive payments quickly, pay bills, track business expenses
- Pain Points: PayPal fees too high, wants business expense categorization
- Usage: Daily transactions, weekly expense reviews

## 4. Core Features (Detailed)

### 4.1 User Authentication & KYC

**Description:**
Secure multi-factor authentication with biometrics, plus KYC verification for AML compliance.

**User Stories:**
- As a new user, I want to verify my identity with ID scan so I can unlock full account features
- As a user, I want to log in with Face ID so access is quick and secure
- As an admin, I want MFA for my account so privileged access is protected

**Acceptance Criteria:**
- [ ] User can register with email/phone + OAuth2 (Google/Apple)
- [ ] KYC verification via Jumio (ID scan + liveness check)
- [ ] MFA required for admins and support staff
- [ ] Biometric auth on supported devices
- [ ] Transaction limits before KYC: $500/day, unlimited after KYC
- [ ] Failed login attempts trigger account lock after 5 attempts

**Technical Requirements:**
- OAuth2 with PKCE (Proof Key for Code Exchange)
- Jumio SDK for KYC
- LocalAuthentication for biometrics
- Backend: KYC data encrypted and access-logged

**PCI-DSS Compliance:**
- Access control (Requirement 7: Restrict access to cardholder data)
- MFA for privileged access (Requirement 8.3)

**AML/KYC Compliance:**
- Identity verification for all users
- OFAC screening before account activation

[Continue for all 9 features]

## 5. Non-Functional Requirements

### 5.1 Security (PCI-DSS Critical)
- **NO CARD STORAGE:** NEVER store full card numbers (PCI-DSS violation)
- **Tokenization:** All payments via Stripe tokens
- **Encryption:** AES-256-GCM at rest, TLS 1.3 in transit
- **Access Controls:** RBAC with least privilege
- **Session Management:** 15-minute timeout, 5-minute for payment screens
- **Secrets Management:** Vault or AWS Secrets Manager (no hardcoded keys)

### 5.2 Fraud Prevention
- Real-time transaction monitoring (Sift integration)
- Velocity checks (max transactions per hour/day)
- Device fingerprinting
- Geolocation anomaly detection
- Two-factor for large transactions (> $1000)

### 5.3 Performance
- Payment confirmation: < 3 seconds
- Balance update: < 1 second (real-time via WebSocket)
- API response: < 300ms (95th percentile)
- App crash rate: < 0.05% (financial apps demand stability)

## 6. Compliance Requirements

### 6.1 PCI-DSS Compliance (Level 1)

**SAQ A - Merchant Using Third-Party Processor:**
- ✅ No cardholder data stored, processed, or transmitted
- ✅ Tokenization via Stripe (PCI-DSS Level 1 certified)
- ✅ HTTPS only (TLS 1.3)
- ✅ Network segmentation
- ✅ Quarterly penetration testing
- ✅ Annual security audit

**Key Requirements:**
1. Install and maintain firewall (Requirement 1)
2. Never store card data (Requirement 3) ← CRITICAL
3. Encrypt transmission (Requirement 4)
4. Use anti-virus (Requirement 5)
5. Secure systems (Requirement 6)
6. Restrict access (Requirement 7)
7. Assign unique IDs (Requirement 8)
8. Restrict physical access (Requirement 9)
9. Track access to data (Requirement 10)
10. Test security systems (Requirement 11)
11. Maintain security policy (Requirement 12)

### 6.2 AML/KYC Compliance (Bank Secrecy Act)
- KYC verification for all users
- Suspicious Activity Reports (SARs) for transactions > $10k
- OFAC screening
- Transaction monitoring
- Money transmitter license (state-dependent)

### 6.3 GDPR (if serving EU)
- Right to access, erasure, portability
- Explicit consent for data processing
- Data breach notification (72 hours)

## 7. Technical Architecture

**Clean Architecture with Payment Security:**
- Presentation → Domain → Data
- Payment logic isolated in domain layer
- All payment API calls server-side only (never client-side card processing)

**Security Patterns:**
- **NEVER** log payment data (card numbers, CVV, PIN)
- Stripe tokens only (tok_xxxx)
- All sensitive API keys in backend
- Certificate pinning for API calls
- Root detection (block rooted/jailbroken devices for payments)

## 8. Testing Strategy

**Payment Flow Testing (Critical):**
- Success: Card accepted → payment processed → balance updated
- Decline: Insufficient funds → error shown → no charge
- Timeout: Network timeout → retry logic → user informed
- 3D Secure: Challenge flow → user authenticates → payment completes

**Security Testing:**
- Penetration testing (quarterly)
- OWASP Mobile Top 10
- Static analysis (SonarQube)
- Dependency scanning (Snyk)

## 9. Regulatory Approval

**Money Transmitter License:**
- Required in most US states
- Application timeline: 2-4 months
- Costs: $50k-$500k (varies by state)

**Banking Partner:**
- Partner bank required for account features
- Due diligence process
- Sponsor bank agreement

## 10. Timeline & Milestones

### Phase 1: MVP (Months 1-5)
- Authentication + KYC
- Account management
- P2P transfers (basic)
- Security audit + pen testing
- PCI-DSS SAQ completion

### Phase 2: Beta (Months 6-8)
- Bill payments
- Virtual cards
- Investment tracking
- Beta testing (1000 users)

### Phase 3: Launch (Months 9-10)
- Money transmitter license obtained
- Final security audit
- App Store submission
- Soft launch (controlled rollout)

---

**IMPORTANT SECURITY NOTES:**

1. **NEVER STORE CARD NUMBERS** - This is a PCI-DSS violation and massive security risk
2. Use Stripe/PayPal tokenization - they handle PCI compliance
3. All payment processing server-side
4. Test with Stripe test cards (4242 4242 4242 4242)
5. Require 2+ senior developers to approve payment code PRs
6. Security review mandatory for all payment features

**Next Steps:**
1. Customize features for your specific fintech app
2. Consult legal team on licensing requirements
3. Run: `claude analyze-prd`
4. Generate: `claude gen-prprompts`
