# PRD Analyzer - Usage Examples

## Table of Contents
- [Basic Usage](#basic-usage)
- [Advanced Usage](#advanced-usage)
- [Integration with Workflows](#integration-with-workflows)
- [Troubleshooting Examples](#troubleshooting-examples)

---

## Basic Usage

### Example 1: Analyze Default PRD Location

**Command:**
```
@claude use skill prprompts-core/prd-analyzer
```

**Assumes:**
- PRD exists at `docs/PRD.md`

**Output:**
```json
{
  "valid": true,
  "score": 85,
  "errors": [],
  "warnings": [
    "No auth_method specified (recommend JWT or OAuth2)"
  ],
  "suggestions": [
    "Add concrete examples for 'User Management' feature",
    "Specify data encryption method (recommend aes-256-gcm)"
  ],
  "metadata": {
    "project_name": "TaskMaster",
    "project_type": "productivity",
    "platforms": ["ios", "android"],
    "features_count": 8
  }
}
```

**Next Steps:**
- Score 85 is good! Address the warning, then proceed to generate PRPROMPTS.

---

### Example 2: Analyze Custom PRD Location

**Command:**
```
@claude use skill prprompts-core/prd-analyzer --prd_path docs/healthcare-app-prd.md
```

**Use Case:**
- You have multiple PRDs
- Testing a PRD before moving it to `docs/PRD.md`

**Output:**
```json
{
  "valid": true,
  "score": 92,
  "errors": [],
  "warnings": [],
  "suggestions": [
    "Consider adding SOC2 compliance alongside HIPAA"
  ],
  "metadata": {
    "project_name": "HealthConnect",
    "project_type": "healthcare",
    "platforms": ["ios", "android", "web"],
    "compliance": ["hipaa", "gdpr"],
    "auth_method": "jwt",
    "features_count": 12
  }
}
```

**Verdict:** Excellent score (92)! Ready for PRPROMPTS generation.

---

### Example 3: Strict Mode Validation

**Command:**
```
@claude use skill prprompts-core/prd-analyzer --strict_mode true
```

**Use Case:**
- Production apps requiring 100% quality
- Pre-commit checks in CI/CD
- Enterprise projects

**Output (if warnings exist):**
```json
{
  "valid": false,
  "score": 85,
  "errors": [
    "STRICT MODE: No auth_method specified (recommend JWT or OAuth2)",
    "STRICT MODE: Feature descriptions too brief"
  ],
  "warnings": [],
  "suggestions": []
}
```

**Note:** All warnings become errors in strict mode. Fix them to pass.

---

## Advanced Usage

### Example 4: Healthcare App with HIPAA

**PRD Frontmatter:**
```yaml
---
project_name: "PatientPortal"
project_type: "healthcare"
platforms: ["ios", "android"]
compliance: ["hipaa", "gdpr"]
auth_method: "jwt"
data_encryption: "aes-256-gcm"
---
```

**Command:**
```
@claude use skill prprompts-core/prd-analyzer
```

**Output:**
```json
{
  "valid": true,
  "score": 95,
  "errors": [],
  "warnings": [],
  "suggestions": [
    "Add audit logging requirements for PHI access",
    "Define session timeout policy (recommend 15 minutes)",
    "Specify BAA (Business Associate Agreement) requirements"
  ],
  "metadata": {
    "project_name": "PatientPortal",
    "project_type": "healthcare",
    "compliance": ["hipaa", "gdpr"],
    "auth_method": "jwt",
    "data_encryption": "aes-256-gcm"
  },
  "sections": {
    "overview": "complete",
    "features": "complete",
    "technical": "complete",
    "compliance": "complete",
    "security": "complete"
  }
}
```

**Analysis:**
- Score 95 - Excellent!
- All required HIPAA fields present
- Suggestions are optional enhancements

---

### Example 5: Fintech App with PCI-DSS

**PRD Frontmatter:**
```yaml
---
project_name: "PaySafe"
project_type: "fintech"
platforms: ["ios", "android"]
compliance: ["pci-dss", "soc2"]
auth_method: "oauth2"
payment_provider: "stripe"
---
```

**Command:**
```
@claude use skill prprompts-core/prd-analyzer
```

**Output:**
```json
{
  "valid": true,
  "score": 90,
  "errors": [],
  "warnings": [],
  "suggestions": [
    "Add fraud detection requirements",
    "Define transaction limits and thresholds",
    "Specify 2FA requirements for sensitive operations"
  ],
  "metadata": {
    "project_name": "PaySafe",
    "project_type": "fintech",
    "compliance": ["pci-dss", "soc2"],
    "auth_method": "oauth2",
    "payment_provider": "stripe"
  },
  "pci_compliance": {
    "stores_card_data": false,
    "uses_tokenization": true,
    "provider": "stripe"
  }
}
```

**Analysis:**
- Score 90 - Great!
- PCI-DSS compliance properly configured (using Stripe, not storing cards)
- Suggestions are best practices

---

### Example 6: Incomplete PRD (Low Score)

**PRD Frontmatter:**
```yaml
---
project_name: "MyApp"
platforms: ["ios"]
---
```

**Command:**
```
@claude use skill prprompts-core/prd-analyzer
```

**Output:**
```json
{
  "valid": false,
  "score": 45,
  "errors": [
    "Missing required field: project_type",
    "No feature descriptions found in content",
    "Project description is too brief (< 50 words)"
  ],
  "warnings": [
    "Only 1 platform specified (recommend iOS + Android)",
    "No auth_method specified",
    "No compliance requirements"
  ],
  "suggestions": [
    "Add project_type (healthcare|fintech|ecommerce|productivity|etc)",
    "Write detailed feature descriptions (min 3 features)",
    "Expand project overview (target 100-200 words)",
    "Add concrete examples for each feature"
  ],
  "metadata": {
    "project_name": "MyApp",
    "platforms": ["ios"],
    "features_count": 0,
    "completeness": 30
  }
}
```

**Analysis:**
- Score 45 - FAIL
- Multiple critical errors
- Cannot generate PRPROMPTS until fixed

**Action Plan:**
1. Add `project_type: "productivity"` to frontmatter
2. Write 3+ feature descriptions in markdown body
3. Expand project description to 100+ words
4. Rerun analyzer

---

## Integration with Workflows

### Workflow 1: PRD Creation → Validation → PRPROMPTS

```bash
# Step 1: Create PRD
@claude use skill prprompts-core/prd-creator

# Step 2: Analyze (YOU ARE HERE)
@claude use skill prprompts-core/prd-analyzer

# Step 3: Fix issues if needed
# (manual editing)

# Step 4: Re-analyze until passing
@claude use skill prprompts-core/prd-analyzer

# Step 5: Generate PRPROMPTS
@claude use skill prprompts-core/prprompts-generator
```

---

### Workflow 2: Continuous Validation (CI/CD)

**GitHub Actions Example:**

```yaml
name: PRD Validation

on:
  pull_request:
    paths:
      - 'docs/PRD.md'

jobs:
  validate-prd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Analyze PRD
        run: |
          @claude use skill prprompts-core/prd-analyzer --strict_mode true

      - name: Check score
        run: |
          if [ $SCORE -lt 80 ]; then
            echo "❌ PRD score too low: $SCORE"
            exit 1
          fi
```

---

### Workflow 3: Multi-PRD Projects

**Use Case:** You have separate PRDs for iOS and Android versions.

```bash
# Analyze iOS PRD
@claude use skill prprompts-core/prd-analyzer --prd_path docs/PRD-ios.md

# Analyze Android PRD
@claude use skill prprompts-core/prd-analyzer --prd_path docs/PRD-android.md

# Compare results and choose which to use for PRPROMPTS
```

---

## Troubleshooting Examples

### Issue 1: "Invalid YAML frontmatter"

**Error:**
```json
{
  "valid": false,
  "errors": ["Invalid YAML frontmatter: unexpected character at line 3"]
}
```

**Cause:** YAML syntax error

**Bad PRD:**
```yaml
---
project_name: My App Name
platforms: ios, android
---
```

**Fixed PRD:**
```yaml
---
project_name: "My App Name"
platforms: ["ios", "android"]
---
```

**Solution:**
- Quote strings with spaces
- Use array syntax: `["item1", "item2"]` not `item1, item2`

---

### Issue 2: "PRD file not found"

**Error:**
```json
{
  "valid": false,
  "errors": ["PRD file not found at docs/PRD.md"]
}
```

**Solution:**
```bash
# Check if file exists
ls docs/PRD.md

# If in different location, specify path
@claude use skill prprompts-core/prd-analyzer --prd_path path/to/your/prd.md
```

---

### Issue 3: Compliance Warning for Healthcare App

**Output:**
```json
{
  "warnings": [
    "Healthcare app without HIPAA compliance requirements"
  ]
}
```

**Solution - Add to PRD frontmatter:**
```yaml
---
project_type: "healthcare"
compliance: ["hipaa", "gdpr"]
auth_method: "jwt"
data_encryption: "aes-256-gcm"
---
```

**Then add to PRD body:**
```markdown
## Security & Compliance

### HIPAA Requirements
- **PHI Encryption**: All patient health information encrypted at rest (AES-256-GCM)
- **Audit Logging**: All PHI access logged with user ID, timestamp, action
- **Session Timeout**: 15-minute timeout for inactive sessions
- **Access Controls**: Role-based access (Doctor, Nurse, Admin, Patient)
```

---

### Issue 4: "Feature descriptions too brief"

**Warning:**
```json
{
  "warnings": [
    "Feature 'User Management' description is only 12 words (minimum 30)"
  ]
}
```

**Bad (12 words):**
```markdown
## Features
- **User Management**: Allows users to create and manage their accounts.
```

**Good (45 words):**
```markdown
## Features
- **User Management**: Comprehensive account management system allowing users to:
  - Create accounts with email/password or OAuth (Google, Apple)
  - Update profile information (name, avatar, preferences)
  - Change password with security verification
  - Enable/disable two-factor authentication
  - Delete account with data export option (GDPR compliance)
```

---

## Performance Notes

**Execution Time:**
- Small PRD (< 500 words): 2-3 seconds
- Medium PRD (500-2000 words): 5-7 seconds
- Large PRD (> 2000 words): 8-10 seconds

**Caching:**
- Results are cached for 10 minutes (600 seconds)
- Same PRD analyzed again within 10 minutes = instant results
- Cache invalidated if PRD file is modified

---

## Related Skills

- **prd-creator** - Create PRD from scratch
- **prprompts-generator** - Generate all 32 PRPROMPTS files
- **phase-generator** - Generate specific phases
- **compliance-checker** - Deep compliance validation (after code generation)

---

**Version:** 1.0.0
**Last Updated:** 2025-10-24
