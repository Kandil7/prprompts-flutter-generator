---
# ══════════════════════════════════════════════════════════════
# PROJECT METADATA
# ══════════════════════════════════════════════════════════════
project_name: "YourAppName"
project_version: "1.0.0"
created_date: "2025-01-15"
last_updated: "2025-01-15"

# ══════════════════════════════════════════════════════════════
# CLASSIFICATION (Used for PRPROMPTS customization)
# ══════════════════════════════════════════════════════════════
project_type: "healthcare"
# Options: healthcare | fintech | education | logistics | ecommerce | saas | generic

compliance: ["hipaa", "gdpr"]
# Options: hipaa | pci-dss | gdpr | sox | coppa | ferpa | fda | iso27001
# Use [] if no compliance requirements

platforms: ["ios", "android", "web"]
# Options: ios | android | web | windows | macos | linux

# ══════════════════════════════════════════════════════════════
# AUTHENTICATION & SECURITY
# ══════════════════════════════════════════════════════════════
auth_method: "jwt"
# Options: jwt | oauth2 | firebase | auth0 | custom | saml

jwt_config:
  algorithm: "RS256"  # RS256 | RS384 | RS512 | ES256
  access_token_expiry: "15m"
  refresh_token_expiry: "7d"
  validate_claims: ["aud", "iss", "exp", "sub"]

sensitive_data: ["phi", "pii"]
# Options: phi | pii | payment | financial | biometric | none

encryption_requirements:
  at_rest: "AES-256-GCM"
  in_transit: "TLS-1.3"
  e2e_required: true

# ══════════════════════════════════════════════════════════════
# ARCHITECTURE & TECHNICAL
# ══════════════════════════════════════════════════════════════
offline_support: true
real_time: true

state_management: "bloc"
# Options: bloc | riverpod | provider | getx | redux

architecture_style: "clean_architecture"
# Options: clean_architecture | mvvm | mvc | modular_monolith

backend_type: "rest"
# Options: rest | graphql | grpc | firebase

# ══════════════════════════════════════════════════════════════
# FEATURES (Will be expanded in document body)
# ══════════════════════════════════════════════════════════════
features:
  - name: "User Authentication"
    complexity: "medium"  # low | medium | high | critical
    requires: ["biometric_auth", "mfa"]
    priority: "p0"  # p0 (must-have) | p1 (should-have) | p2 (nice-to-have)

  - name: "Dashboard"
    complexity: "medium"
    requires: ["offline_sync", "real_time_updates"]
    priority: "p0"

# ══════════════════════════════════════════════════════════════
# TEAM STRUCTURE
# ══════════════════════════════════════════════════════════════
team_size: "medium"  # small (1-5) | medium (6-15) | large (16+)

team_composition:
  mobile:
    size: 5
    junior: 1
    mid: 3
    senior: 1

# ══════════════════════════════════════════════════════════════
# PERFORMANCE & QUALITY REQUIREMENTS
# ══════════════════════════════════════════════════════════════
performance_targets:
  cold_start_time: "2s"
  frame_rate: "60fps"
  api_response_time: "500ms"

testing_requirements:
  unit_test_coverage: 85
  widget_test_coverage: 75
  integration_tests_required: true

# ══════════════════════════════════════════════════════════════
# DEPLOYMENT & DEMO
# ══════════════════════════════════════════════════════════════
demo_frequency: "weekly"
# Options: none | weekly | biweekly | monthly

demo_requirements:
  environment: "dedicated"
  entry_point: "lib/main_demo.dart"
  synthetic_data: true

# ══════════════════════════════════════════════════════════════
# BUSINESS CONTEXT
# ══════════════════════════════════════════════════════════════
business_context:
  timeline: "9 months"
  mvp_timeline: "4 months"
  target_users: 50000

# ══════════════════════════════════════════════════════════════
# CUSTOMIZATION FLAGS (for PRPROMPTS generation)
# ══════════════════════════════════════════════════════════════
prprompts_config:
  generate_all_files: true
  verbosity: "detailed"
  include_junior_explanations: true
  auto_generate_subagents: true
---

# Product Requirements Document: [Project Name]

## 1. Executive Summary

[2-3 paragraphs describing what the app does, target users, and core value proposition]

This document outlines the requirements for [Project Name], a [project_type] application designed to [primary purpose]. The app will serve [target users] users across [platforms] platforms.

## 2. Product Vision

### 2.1 Problem Statement
[What problem does this app solve? Who experiences this problem?]

### 2.2 Vision
[Long-term vision - where do you see this product in 3-5 years?]

### 2.3 Success Criteria
[How will you measure success? What metrics matter?]

## 3. Target Users

### Primary Users
**Persona 1: [Name]**
- Role: [Job title/description]
- Demographics: [Age range, location]
- Goals: [What they want to achieve]
- Pain Points: [Current frustrations]
- Tech Savviness: [Low/Medium/High]

### Secondary Users
**Persona 2: [Name]**
[Description]

## 4. Core Features

### 4.1 [Feature 1 Name]

**Description:**
[2-3 sentences describing the feature]

**User Stories:**
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

**Acceptance Criteria:**
- [ ] User can [action] within [timeframe]
- [ ] System validates [constraint]
- [ ] Data is encrypted using [method]

**Technical Requirements:**
- Frontend: [Flutter widgets/packages needed]
- Backend: [API endpoints required]
- Storage: [Database needs]

**Priority:** P0 (Must-have for MVP)

[Repeat for each feature]

## 5. Non-Functional Requirements

### 5.1 Performance
- **Cold Start Time:** < 2 seconds
- **Frame Rate:** Consistent 60fps
- **API Response Time:** < 500ms for 95th percentile

### 5.2 Security
- **Encryption at Rest:** AES-256-GCM
- **Encryption in Transit:** TLS 1.3 minimum
- **Authentication:** JWT with RS256
- **Session Management:** 15-minute timeout

### 5.3 Accessibility
- **WCAG 2.1 AA Compliance:** All UI elements
- **Screen Reader Support:** iOS VoiceOver, Android TalkBack
- **Minimum Touch Target:** 44x44 points

## 6. Compliance Requirements

[Include sections based on compliance array]

### 6.1 HIPAA Compliance
[If "hipaa" in compliance]

**Security Rule Requirements:**
- PHI Encryption: AES-256-GCM at rest, TLS 1.3 in transit
- Access Controls: Role-based with MFA
- Audit Logs: All PHI access logged

### 6.2 GDPR Compliance
[If "gdpr" in compliance]

**User Rights:**
- Right to Access: Export all user data
- Right to Erasure: Delete within 30 days
- Right to Portability: JSON/CSV export

## 7. Technical Architecture

**Architecture Style:** Clean Architecture (Presentation/Domain/Data)

**State Management:** BLoC

**Dependency Injection:** get_it

**Local Storage:**
- Complex data: Drift
- Key-value: SharedPreferences
- Secrets: flutter_secure_storage

**Network:** Dio with retry logic

## 8. Testing Strategy

**Coverage Requirements:**
- Unit tests: 85%
- Widget tests: 75%
- Integration tests: Required

**Test Types:**
- Unit: Pure Dart logic
- Widget: UI components
- Integration: Full user flows

## 9. Timeline & Milestones

### Phase 1: MVP (Months 1-4)
- [ ] Authentication system
- [ ] Core features
- [ ] Basic testing
- [ ] Internal demo

### Phase 2: Beta (Months 5-6)
- [ ] Additional features
- [ ] Security audit
- [ ] Beta user feedback

### Phase 3: Production (Months 7-9)
- [ ] Final security audit
- [ ] App Store submission
- [ ] Soft launch
- [ ] Full rollout

## 10. Success Metrics

**User Acquisition:**
- [target_users] by Month 6

**User Satisfaction:**
- 95% satisfaction score
- < 1% crash rate
- Average session: 10+ minutes

**Technical:**
- 99.9% uptime
- < 2s cold start
- < 500ms API response

---

*This PRD is a living document and will be updated as requirements evolve.*
