---
name: Generate PRD
description: Generate complete Product Requirements Document with YAML frontmatter
author: PRD Generator
version: 1.0.0
tags: [prd, requirements, documentation, flutter]
---

# Generate Product Requirements Document

## Overview
Generate a comprehensive Product Requirements Document (PRD) for a Flutter application. The PRD includes structured YAML frontmatter followed by detailed product specifications.

## Instructions

### Step 1: Gather Information

Ask the user these questions (or infer from their description):

1. **Project Name**: What's the app called?
2. **Project Type**: What category?
   - healthcare (patient apps, telemedicine, medical records)
   - fintech (payments, banking, investments)
   - education (learning platforms, student management)
   - logistics (delivery, tracking, fleet management)
   - ecommerce (shopping, marketplace)
   - saas (business tools, productivity)
   - generic (other)

3. **Compliance Requirements**: Any regulatory requirements?
   - HIPAA (US healthcare data)
   - PCI-DSS (payment card data)
   - GDPR (EU user data)
   - SOX (financial reporting)
   - COPPA (children under 13)
   - FERPA (education records)
   - FDA (medical devices)
   - None

4. **Platforms**: Which platforms?
   - iOS, Android, Web, Windows, macOS, Linux

5. **Authentication**: How do users sign in?
   - JWT (JSON Web Tokens)
   - OAuth2 (OAuth 2.0 / OpenID Connect)
   - Firebase Authentication
   - Auth0
   - Custom solution

6. **Architecture**:
   - Offline support needed? (Yes/No)
   - Real-time updates needed? (Yes/No)

7. **Sensitive Data**: What sensitive data is handled?
   - PHI (Protected Health Information)
   - PII (Personally Identifiable Information)
   - Payment data (credit cards)
   - Financial data
   - Biometric data
   - None

8. **Team**:
   - Team size? (small: 1-5, medium: 6-15, large: 16+)
   - How many junior developers?

9. **Demo**: How often will you demo to stakeholders?
   - None, Weekly, Biweekly, Monthly

10. **Features**: List 3-7 main features

### Step 2: Generate YAML Frontmatter

Create frontmatter with these exact keys:

```yaml
---
# PROJECT METADATA
project_name: "AppName"
project_version: "1.0.0"
created_date: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"

# CLASSIFICATION
project_type: "healthcare"  # healthcare|fintech|education|logistics|ecommerce|saas|generic
compliance: ["hipaa", "gdpr"]  # [] if none
platforms: ["ios", "android", "web"]

# AUTHENTICATION & SECURITY
auth_method: "jwt"  # jwt|oauth2|firebase|auth0|custom
jwt_config:  # Only if auth_method is jwt
  algorithm: "RS256"  # RS256|RS384|RS512|ES256
  access_token_expiry: "15m"
  refresh_token_expiry: "7d"
  validate_claims: ["aud", "iss", "exp", "sub"]

sensitive_data: ["phi", "pii"]  # phi|pii|payment|financial|biometric|[]

encryption_requirements:
  at_rest: "AES-256-GCM"
  in_transit: "TLS-1.3"
  e2e_required: true  # For messaging features

# ARCHITECTURE
offline_support: true
real_time: true
state_management: "bloc"  # bloc|riverpod|provider|getx
architecture_style: "clean_architecture"
backend_type: "rest"  # rest|graphql|grpc|firebase

# FEATURES
features:
  - name: "User Authentication"
    complexity: "medium"  # low|medium|high|critical
    requires: ["biometric_auth", "mfa"]
  - name: "Dashboard"
    complexity: "medium"
    requires: ["real_time_updates", "data_visualization"]

# TEAM
team_size: "large"  # small|medium|large
team_composition:
  mobile:
    size: 8
    junior: 2
    mid: 4
    senior: 2
  backend:
    size: 5
    tech_stack: ["node.js", "postgresql", "redis"]
  qa:
    size: 3
    specializations: ["automation", "security", "performance"]
  design:
    size: 2
  security:
    size: 1
    role: "consultant"  # full-time|consultant|part-time

# PERFORMANCE & QUALITY
performance_targets:
  cold_start_time: "2s"
  frame_rate: "60fps"
  api_response_time: "500ms"

testing_requirements:
  unit_test_coverage: 85
  widget_test_coverage: 75
  integration_tests_required: true

# DEPLOYMENT
demo_frequency: "weekly"  # none|weekly|biweekly|monthly
demo_requirements:
  environment: "dedicated"
  entry_point: "lib/main_demo.dart"
  auth_protection: "basic_auth"
  synthetic_data: true

# BUSINESS
business_context:
  timeline: "9 months"
  mvp_timeline: "4 months"
  target_users: 50000

# CUSTOMIZATION
prprompts_config:
  generate_all_files: true
  verbosity: "detailed"
  include_junior_explanations: true
  auto_generate_subagents: true
---
```

### Step 3: Generate Document Body

After the YAML frontmatter (closing with `---`), generate these sections:

#### Section 1: Executive Summary
2-3 paragraphs covering:
- What the app does
- Target users
- Core value proposition
- Key differentiators

#### Section 2: Product Vision
- Problem being solved
- Long-term vision (3-5 years)
- Success metrics

#### Section 3: Target Users

**Primary Users:**
- Persona 1: [Name, role, needs, pain points]
- Persona 2: [Name, role, needs, pain points]

**Secondary Users:**
- Persona 3: [Name, role, needs]

#### Section 4: Core Features (Detailed)

For each feature from frontmatter:

**4.X [Feature Name]**

**Description:** [2-3 sentences]

**User Stories:**
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Technical Requirements:**
- Requirement 1
- Requirement 2

**Compliance Considerations:** (if applicable)
- [Specific compliance rules for this feature]

[Continue with remaining sections: Non-Functional Requirements, Compliance, User Flows, Data Model, API Specifications, Design, Technical Architecture, Testing, Deployment, Timeline, Risks, Success Metrics, and Appendices]

## Output File

Save to: `docs/PRD.md`

## Validation

After generating, verify:
- [ ] YAML frontmatter is valid (test at yamllint.com)
- [ ] All required keys present in frontmatter
- [ ] Compliance sections match frontmatter
- [ ] Features are detailed with user stories
- [ ] Technical architecture matches project needs
- [ ] Timeline is realistic
- [ ] Success metrics are measurable

## Next Steps Message

After generating PRD, tell user:

```
✅ Generated PRD at docs/PRD.md

Your PRD includes:
- Project Type: [type]
- Compliance: [list]
- Platforms: [list]
- Features: [count]
- Timeline: [duration]

Next steps:
1. Review: cat docs/PRD.md
2. Customize: vim docs/PRD.md
3. Analyze: claude analyze-prd
4. Generate PRPROMPTS: claude gen-prprompts

PRD Highlights:
- [Key customization 1 based on project]
- [Key customization 2 based on compliance]
- [Key customization 3 based on team]

Ready to generate PRPROMPTS? (y/n)
```
