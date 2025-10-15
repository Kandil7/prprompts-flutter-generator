# PRD Creation Guide

## How to Use This Guide

This guide helps you create a complete Product Requirements Document (PRD) for your Flutter project that will automatically generate customized PRPROMPTS.

## Quick Start

### Option 1: Interactive Generator (Recommended)

```bash
claude --prompt .claude/prompts/generate-prd.md
```

Answer the wizard questions and get a complete PRD.

### Option 2: Copy Template

```bash
cp templates/PRD-full-template.md docs/PRD.md
vim docs/PRD.md  # Customize with your details
```

### Option 3: Copy Example

```bash
# For healthcare project
cp examples/healthcare-prd.md docs/PRD.md

# For fintech project
cp examples/fintech-prd.md docs/PRD.md

# For education project
cp examples/education-prd.md docs/PRD.md

# For SaaS project
cp examples/saas-prd.md docs/PRD.md

# Then customize
vim docs/PRD.md
```

## YAML Frontmatter Explained

### Required Fields

```yaml
project_name: "YourAppName"  # ✅ REQUIRED
project_type: "healthcare"   # ✅ REQUIRED
platforms: ["ios", "android"] # ✅ REQUIRED - at least one
auth_method: "jwt"           # ✅ REQUIRED
```

### Conditional Fields

```yaml
# Only needed if auth_method is "jwt"
jwt_config:
  algorithm: "RS256"
  access_token_expiry: "15m"

# Only needed if handling sensitive data
sensitive_data: ["phi", "pii"]

# Only needed if complying with standards
compliance: ["hipaa", "gdpr"]
```

### Boolean Flags

```yaml
offline_support: true  # Does app work offline?
real_time: true       # Does app need WebSockets?
```

## Field Reference

### project_type Options

- **healthcare**: Patient apps, telemedicine, EHR
- **fintech**: Banking, payments, investments
- **education**: Learning platforms, LMS
- **logistics**: Delivery, tracking, fleet
- **ecommerce**: Shopping, marketplace
- **saas**: Business tools, productivity
- **generic**: Everything else

**Impact:** Determines which PRPROMPTS files are customized

### compliance Options

- **hipaa**: US healthcare (PHI encryption, audit logs)
- **pci-dss**: Payment cards (tokenization, no storage)
- **gdpr**: EU data (right to erasure, consent)
- **sox**: Financial reporting
- **coppa**: Children under 13
- **ferpa**: Education records
- **fda**: Medical devices

**Impact:** Adds compliance sections, generates subagents

### auth_method Options

- **jwt**: JSON Web Tokens (recommended for mobile)
- **oauth2**: OAuth 2.0 / OpenID Connect
- **firebase**: Firebase Authentication
- **auth0**: Auth0
- **custom**: Custom solution

**Impact:** Customizes API integration guide

### sensitive_data Options

- **phi**: Protected Health Information
- **pii**: Personally Identifiable Information
- **payment**: Credit card, bank account
- **financial**: Balances, transactions
- **biometric**: Fingerprints, face data

**Impact:** Adds encryption requirements, security checks

## Common Patterns

### Healthcare App

```yaml
project_type: "healthcare"
compliance: ["hipaa", "gdpr"]
auth_method: "jwt"
sensitive_data: ["phi", "pii"]
offline_support: true
```

**Generates:**
- PHI encryption patterns
- HIPAA audit logging
- hipaa-compliance-checker subagent
- Synthetic data for demos

### Fintech App

```yaml
project_type: "fintech"
compliance: ["pci-dss", "sox"]
auth_method: "oauth2"
sensitive_data: ["payment", "financial"]
real_time: true
```

**Generates:**
- PCI-DSS compliance checklist
- Payment tokenization patterns
- fintech-security-reviewer subagent
- Real-time WebSocket patterns

### Education App

```yaml
project_type: "education"
compliance: ["coppa", "ferpa"]
auth_method: "firebase"
sensitive_data: ["pii"]
offline_support: true
```

**Generates:**
- COPPA compliance (parental consent)
- coppa-compliance-monitor subagent
- Firebase auth patterns
- Offline learning features

## Validation Checklist

Before generating PRPROMPTS, verify your PRD:

- [ ] YAML frontmatter between `---` markers
- [ ] All required fields present
- [ ] compliance matches sensitive_data (warn if mismatch)
- [ ] jwt_config present if auth_method is "jwt"
- [ ] Features list has 3-7 items
- [ ] Timeline is realistic (4-12 months)
- [ ] Team size matches features count

## Next Steps

After creating PRD:

1. **Review:** `cat docs/PRD.md`
2. **Validate:** Check YAML syntax at yamllint.com
3. **Generate PRPROMPTS:** Use the generator tool
4. **Commit:** `git add docs/PRD.md`

## Troubleshooting

**Error: "Invalid YAML frontmatter"**
- Ensure frontmatter is between `---` markers
- Validate at yamllint.com
- Check for proper indentation (use spaces, not tabs)

**Warning: "Compliance mismatch"**
- If compliance includes "hipaa", sensitive_data should include "phi"
- If compliance includes "pci-dss", sensitive_data should include "payment"

**Error: "Missing required field"**
- All fields marked ✅ REQUIRED must be present
- project_name, project_type, platforms, auth_method

## Examples

See `examples/` directory for complete PRDs:
- healthcare-prd.md - HealthTrack Pro
- fintech-prd.md - MoneyFlow
- education-prd.md - LearnHub
- saas-prd.md - TaskMaster Pro

## Support

- 📖 [Full Documentation](../README.md)
- 🐛 [Report Issue](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- 💬 [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)
