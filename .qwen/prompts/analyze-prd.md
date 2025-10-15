---
name: Analyze PRD
description: Validate and analyze PRD, show what customizations will be applied
author: PRD Analyzer
version: 1.0.0
tags: [prd, validation, analysis]
---

# Analyze Product Requirements Document

## Overview
Validate PRD structure, check for required fields, and show what PRPROMPTS customizations will be applied based on the PRD metadata.

## Input File
Look for: `docs/PRD.md`

## Analysis Steps

### Step 1: Validate YAML Frontmatter

Check for required fields:
- `project_name` (required)
- `project_type` (required)
- `platforms` (required, must have at least one)
- `auth_method` (required)

### Step 2: Validate Compliance Consistency

Check that compliance matches sensitive data:
- If `compliance` includes "hipaa" → `sensitive_data` should include "phi"
- If `compliance` includes "pci-dss" → `sensitive_data` should include "payment"
- If `compliance` includes "gdpr" → warn if no "pii"

### Step 3: Detect Customization Triggers

Based on PRD frontmatter, identify which customizations will be applied:

**Project Type Customizations:**
- healthcare → Add PHI handling patterns, HIPAA guides
- fintech → Add payment tokenization, PCI-DSS guides
- education → Add COPPA compliance, parental consent patterns
- logistics → Add GPS tracking, route optimization patterns
- ecommerce → Add shopping cart, checkout patterns
- saas → Add multi-tenancy, subscription patterns

**Compliance Customizations:**
- hipaa → `hipaa-compliance-checker` subagent, audit logging, PHI encryption
- pci-dss → `fintech-security-reviewer` subagent, tokenization, no card storage
- gdpr → Right to erasure, data portability, consent management
- coppa → `coppa-compliance-monitor` subagent, parental consent flows

**Architecture Customizations:**
- offline_support: true → Offline sync strategies, conflict resolution, local storage guides
- real_time: true → WebSocket patterns, real-time state management, presence tracking
- jwt auth → JWT RS256 verification, token refresh, secure storage

**Team Customizations:**
- junior developers > 0 → Add "Why?" explanations, detailed onboarding
- team size large → Multi-team coordination guides, CODEOWNERS automation
- demo_frequency not "none" → Demo environment setup, synthetic data generation

### Step 4: Count Affected Files

Calculate how many PRPROMPTS files will be customized (out of 32 total).

## Output Format

```
✅ PRD Validation Complete

**File:** docs/PRD.md
**Status:** Valid
**Confidence:** [High/Medium/Low based on completeness]

**Project Details:**
- Name: [project_name]
- Type: [project_type]
- Platforms: [platforms list]
- Compliance: [compliance list or "None"]
- Team Size: [team_size]
- Timeline: [timeline]

**Detected Triggers:**
- [List all customization triggers detected]

**Customizations To Apply:**
- [Number] files will be customized (out of 32 total)
- [List specific customizations]

**Subagents To Generate:**
- [List subagents that will be auto-generated]

**Warnings:**
[List any inconsistencies or missing recommended fields]

**Recommendations:**
[Suggest improvements or missing compliance requirements]

**Next Steps:**
1. Review customization list above
2. Run: claude gen-prprompts
3. Check: PRPROMPTS/ directory
4. Start coding with: cat PRPROMPTS/01-feature_scaffold.md
```

## Validation Rules

### Critical Errors (Block Generation):
- Missing required fields (project_name, project_type, platforms, auth_method)
- Invalid YAML syntax
- Empty features list

### Warnings (Allow but Warn):
- Compliance mismatch (HIPAA without PHI)
- No testing requirements specified
- Timeline seems unrealistic
- Team size doesn't match feature complexity

### Recommendations:
- Suggest compliance standards based on project type
- Recommend offline support for certain project types
- Suggest real-time for collaborative features
- Recommend team size adjustments

## Examples

### Example 1: Healthcare App Analysis

**Input PRD:**
```yaml
project_type: "healthcare"
compliance: ["hipaa", "gdpr"]
auth_method: "jwt"
sensitive_data: ["phi", "pii"]
offline_support: true
```

**Output:**
```
✅ PRD Validation Complete

Detected Triggers:
- HIPAA compliance
- GDPR compliance
- JWT authentication (RS256)
- Offline support
- PHI handling

Customizations To Apply:
- 16 files will be customized (out of 32 total)
- PHI encryption patterns (AES-256-GCM)
- HIPAA audit logging for all PHI access
- JWT RS256 token verification
- Offline sync with encrypted local storage
- GDPR data export functionality

Subagents To Generate:
- hipaa-compliance-checker (automated validation)
- gdpr-compliance-monitor (data privacy checks)

Next Steps:
1. Run: claude gen-prprompts
2. Check: PRPROMPTS/16-security_and_compliance.md
```

### Example 2: Fintech App with Warnings

**Input PRD:**
```yaml
project_type: "fintech"
compliance: []
auth_method: "jwt"
sensitive_data: ["payment"]
```

**Output:**
```
✅ PRD Validation Complete (with warnings)

⚠️  Warnings:
- PCI-DSS compliance not specified but handling payment data
- No GDPR compliance but likely handling PII

Recommendations:
- Add compliance: ["pci-dss", "gdpr"]
- Specify real_time: true for payment updates
- Add security_tests_required: true

Next Steps:
1. Fix warnings: vim docs/PRD.md
2. Then run: claude gen-prprompts
```
