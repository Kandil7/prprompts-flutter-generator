---
# SaaS/B2B App - Multi-tenancy PRD Template
project_name: "B2BApp"
project_version: "1.0.0"
created_date: "2025-01-25"
project_type: "saas"
compliance: ["gdpr", "sox"]  # Add SOX if publicly traded

platforms: ["ios", "android", "web"]  # Web critical for B2B

auth_method: "oauth2"
oauth2_config:
  providers: ["google", "microsoft", "okta"]  # Enterprise SSO

sensitive_data: ["business_data", "pii"]
encryption_requirements:
  at_rest: "AES-256-GCM"
  in_transit: "TLS-1.3"

offline_support: false  # SaaS typically requires connectivity
real_time: true  # Collaboration features
state_management: "riverpod"
architecture_style: "clean_architecture"
backend_type: "rest"

features:
  - name: "Enterprise SSO & RBAC"
    complexity: "critical"
    priority: "p0"
    notes: "OAuth2 with Okta, role-based access control"
    
  - name: "Multi-tenant Data Isolation"
    complexity: "critical"
    priority: "p0"
    notes: "Complete tenant data separation"
    
  - name: "Subscription Management"
    complexity: "high"
    priority: "p0"
    notes: "Stripe Billing, seat-based pricing"
    
  - name: "Team Collaboration"
    complexity: "medium"
    priority: "p0"
    notes: "Real-time editing, comments, mentions"
    
  - name: "Admin Dashboard"
    complexity: "high"
    priority: "p0"
    notes: "User management, analytics, billing"
    
  - name: "API Access for Integrations"
    complexity: "medium"
    priority: "p1"
    notes: "REST API with rate limiting"
    
  - name: "Audit Logs"
    complexity: "medium"
    priority: "p1"
    notes: "SOX/compliance requirement"

team_size: "large"
team_composition:
  mobile:
    size: 5
  backend:
    size: 6
  web:
    size: 4
  devsecops:
    size: 2
    
performance_targets:
  api_response: "200ms"
  real_time_sync: "< 1s"
  dashboard_load: "< 2s"

testing_requirements:
  unit_test_coverage: 85
  integration_tests: "multi_tenancy, subscription_flows"
  
business_context:
  timeline: "9 months"
  mvp_timeline: "4 months"
  target_users: 10000  # Seats across companies

saas_requirements:
  multi_tenancy:
    data_isolation: "complete"
    tenant_id_in_all_queries: true
    cross_tenant_access_prevention: true
    
  subscription_billing:
    provider: "stripe_billing"
    pricing_model: "per_seat_monthly"
    free_trial: "14_days"
    
  enterprise_features:
    sso_required: true
    audit_logs: true
    sla_99_9_uptime: true
    
integrations:
  sso:
    - name: "Okta"
      purpose: "enterprise_sso"
  billing:
    - name: "Stripe Billing"
      purpose: "subscription_management"
  analytics:
    - name: "Mixpanel"
      purpose: "product_analytics"

prprompts_config:
  generate_all_files: true
  verbosity: "detailed"
  saas_specialization: true
---

# SaaS/B2B App PRD

## Executive Summary
Multi-tenant SaaS platform with enterprise SSO, subscription billing, and team collaboration.

## Key Features
1. **Enterprise SSO** - Okta, Google Workspace, Microsoft 365 integration
2. **Multi-tenant Architecture** - Complete data isolation per customer
3. **Subscription Billing** - Stripe Billing, seat-based pricing, usage tracking
4. **Team Collaboration** - Real-time editing, comments, mentions, notifications

## Multi-tenancy
- Complete tenant data isolation
- Tenant ID required in all database queries
- Cross-tenant access prevention
- Per-tenant rate limiting

## Enterprise Requirements
- SSO with SAML/OAuth2
- Audit logs (SOX compliance)
- 99.9% uptime SLA
- Role-based access control (RBAC)
- API access with rate limiting

Next Steps: Customize for your B2B product, then run `claude analyze-prd`
