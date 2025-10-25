---
# Education App - COPPA/FERPA Compliant PRD Template
project_name: "LearnApp"
project_version: "1.0.0"
created_date: "2025-01-25"
project_type: "education"
compliance: ["coppa", "ferpa", "gdpr"]

platforms: ["ios", "android", "web"]

auth_method: "oauth2"
oauth2_config:
  providers: ["google", "microsoft", "clever"]
  parental_consent_required: true

sensitive_data: ["student_records", "pii"]
encryption_requirements:
  at_rest: "AES-256-GCM"
  in_transit: "TLS-1.3"
  e2e_required: true

offline_support: true
real_time: true
state_management: "bloc"
architecture_style: "clean_architecture"
backend_type: "firebase"

features:
  - name: "Student Registration with Parental Consent"
    complexity: "high"
    priority: "p0"
    coppa_controls: ["verifiable_parental_consent"]
    
  - name: "Interactive Learning Content"
    complexity: "medium"
    priority: "p0"
    
  - name: "Quizzes & Assessments"
    complexity: "medium"
    priority: "p0"
    ferpa_controls: ["grade_privacy"]
    
  - name: "Progress Reports"
    complexity: "medium"
    priority: "p0"
    ferpa_controls: ["access_control"]
    
  - name: "Moderated Discussion Forums"
    complexity: "high"
    priority: "p1"
    coppa_controls: ["content_moderation"]

team_size: "medium"
team_composition:
  mobile:
    size: 4
  content:
    size: 2
    role: "content_creators"
  moderation:
    size: 1

coppa_requirements:
  age_gate: true
  age_threshold: 13
  parental_consent_methods: ["email_verification", "credit_card_check"]
  no_behavioral_advertising_under_13: true
  
ferpa_requirements:
  protect_student_records: true
  parental_access_to_records: true
  consent_for_third_party_disclosure: true

safety_requirements:
  content_moderation: true
  profanity_filter: true
  teacher_oversight: true
  
business_context:
  timeline: "8 months"
  mvp_timeline: "4 months"
  target_users: 20000

prprompts_config:
  generate_all_files: true
  verbosity: "detailed"
  include_junior_explanations: true
  education_specialization: true
---

# Education App PRD

## Executive Summary
COPPA/FERPA compliant learning platform for K-12 students with parental oversight and content moderation.

## Key Features
1. **Parental Consent Flow** - COPPA-compliant verification for users under 13
2. **Interactive Lessons** - Video content, quizzes, downloadable for offline
3. **Safe Communication** - Teacher-moderated forums, no direct student-to-student messaging
4. **Progress Tracking** - Parents and teachers view student progress securely

## Compliance
- **COPPA**: Parental consent for <13, limited data collection, no behavioral ads
- **FERPA**: Protected student records, parental access rights, consent for disclosure

## Safety
- Content moderation (AI + human)
- Profanity filtering
- Teacher approval for public posts
- Reporting mechanisms

Next Steps: Customize age range and subjects, then run `claude analyze-prd`
