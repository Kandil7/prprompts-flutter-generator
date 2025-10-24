# PRD Analyzer Skill - Execution Prompt

## Context
You are executing the **prd-analyzer** skill. This skill analyzes a Product Requirements Document (PRD) for completeness, validates metadata, checks compliance requirements, and provides quality scores with actionable suggestions.

## Inputs
- **prd_path**: {{inputs.prd_path || "docs/PRD.md"}}
- **strict_mode**: {{inputs.strict_mode || false}}
- **check_examples**: {{inputs.check_examples || true}}

---

## Task: Analyze PRD and Validate Quality

### Step 1: Load and Parse PRD

**Actions:**
1. Read the PRD file from `{{inputs.prd_path}}`
2. Check file exists and is readable
3. Parse YAML frontmatter (between `---` delimiters)
4. Extract markdown content body

**Error Handling:**
- If file doesn't exist → Return `{valid: false, errors: ["PRD file not found"]}`
- If YAML is invalid → Return `{valid: false, errors: ["Invalid YAML frontmatter"]}`

---

### Step 2: Validate Required Metadata

**Check for Required Fields:**

```yaml
# MUST HAVE (errors if missing):
project_name: string (non-empty)
project_type: string (healthcare|fintech|ecommerce|productivity|social|education|other)
platforms: array (at least one of: ios, android, web)
```

**Validation Rules:**
- ❌ **ERROR** if `project_name` is missing or empty
- ❌ **ERROR** if `project_type` is not from allowed values
- ❌ **ERROR** if `platforms` is empty or invalid
- ⚠️ **WARNING** if `project_description` is < 50 characters
- ⚠️ **WARNING** if no `target_audience` specified

---

### Step 3: Validate Compliance & Security Metadata

**Check Compliance Fields:**

```yaml
# Compliance requirements
compliance: array (e.g., ["hipaa", "pci-dss", "gdpr", "coppa", "ferpa", "soc2"])
auth_method: string (jwt|oauth2|firebase|custom)
data_encryption: string (aes-256-gcm|aes-128|none)
```

**Validation Rules:**
- ⚠️ **WARNING** if `compliance` array is empty but project_type is healthcare/fintech
- ⚠️ **WARNING** if `auth_method` is not specified
- ❌ **ERROR** if compliance includes "pci-dss" but no payment-related features mentioned
- ❌ **ERROR** if compliance includes "hipaa" but no PHI handling mentioned
- ⚠️ **WARNING** if `data_encryption` is "none" or not specified

**Suggestions:**
- If healthcare → Suggest adding HIPAA compliance
- If fintech → Suggest adding PCI-DSS + SOC2 compliance
- If auth_method is missing → Suggest JWT or OAuth2

---

### Step 4: Validate Content Quality

**Check Markdown Content:**

1. **Project Overview** (must have):
   - Clear description of what the app does
   - Target audience defined
   - Key value proposition

2. **Features Section** (must have):
   - At least 3 core features described
   - Each feature should have:
     - Name
     - Description (> 30 words)
     - User benefit

3. **Technical Requirements** (should have):
   - State management approach
   - Architecture pattern (e.g., Clean Architecture, MVVM)
   - Third-party services/APIs

4. **User Flows** (nice to have):
   - At least 1 user flow diagram or description
   - Step-by-step user interactions

**Scoring Rules:**
- Start with 100 points
- -10 points per missing required field
- -5 points per missing recommended field
- -3 points per warning
- +5 bonus points if examples are concrete and detailed
- +5 bonus points if compliance is well-documented

---

### Step 5: Check for Examples and Concreteness

If `check_examples` is true:

**Validate Concrete Examples:**
- ✅ GOOD: "User can schedule appointments with doctors for specific dates/times"
- ❌ BAD: "User management features"

**Check for Placeholders:**
- ⚠️ WARNING if PRD contains: `[TBD]`, `[TODO]`, `{placeholder}`, `...`
- ⚠️ WARNING if feature descriptions are < 30 words

---

### Step 6: Generate Analysis Report

**Output Format:**

```json
{
  "valid": true | false,
  "score": 0-100,
  "errors": [
    "Missing required field: project_name",
    "Invalid project_type: must be one of [healthcare, fintech, ...]"
  ],
  "warnings": [
    "No compliance requirements specified (recommended for healthcare apps)",
    "Feature descriptions are too brief (< 30 words)"
  ],
  "suggestions": [
    "Add HIPAA compliance requirements for healthcare app",
    "Specify authentication method (recommend JWT or OAuth2)",
    "Add concrete examples for each feature",
    "Define user flows for core features"
  ],
  "metadata": {
    "project_name": "HealthApp",
    "project_type": "healthcare",
    "platforms": ["ios", "android"],
    "compliance": ["hipaa", "gdpr"],
    "features_count": 8,
    "has_examples": true,
    "completeness": 85
  },
  "sections": {
    "overview": "complete",
    "features": "complete",
    "technical": "partial",
    "user_flows": "missing"
  }
}
```

---

### Step 7: Apply Strict Mode (if enabled)

If `strict_mode` is true:
- Convert all **warnings** to **errors**
- Set `valid = false` if any warnings exist
- Return immediately without suggestions

---

## Quality Grading Scale

| Score | Grade | Meaning |
|-------|-------|---------|
| 90-100 | A | Excellent PRD, ready for PRPROMPTS generation |
| 80-89 | B | Good PRD, minor improvements recommended |
| 70-79 | C | Acceptable PRD, several areas need work |
| 60-69 | D | Incomplete PRD, significant improvements needed |
| 0-59 | F | PRD fails validation, cannot generate PRPROMPTS |

---

## Special Compliance Checks

### HIPAA (Healthcare)
- ✅ Must mention: PHI encryption, audit logging, access controls
- ⚠️ Should mention: Session timeouts, role-based access, BAA requirements

### PCI-DSS (Finance)
- ✅ Must mention: NO storage of full card numbers, tokenization, payment provider
- ❌ ERROR if PRD suggests storing payment card data directly

### GDPR (Privacy)
- ✅ Must mention: User data export, right to deletion, consent management
- ⚠️ Should mention: Cookie consent, privacy policy, data retention

---

## Example Output (Healthcare App)

```json
{
  "valid": true,
  "score": 88,
  "errors": [],
  "warnings": [
    "No data retention policy specified (required for HIPAA)",
    "Missing user flow for appointment booking"
  ],
  "suggestions": [
    "Add data retention policy (recommend 7 years for medical records)",
    "Define user flow: Login → View Doctors → Select Date → Confirm Appointment",
    "Add audit logging requirements for PHI access"
  ],
  "metadata": {
    "project_name": "HealthConnect",
    "project_type": "healthcare",
    "platforms": ["ios", "android"],
    "compliance": ["hipaa", "gdpr"],
    "auth_method": "jwt",
    "data_encryption": "aes-256-gcm",
    "features_count": 12,
    "has_examples": true,
    "completeness": 88
  },
  "sections": {
    "overview": "complete",
    "features": "complete",
    "technical": "complete",
    "user_flows": "partial",
    "compliance": "complete",
    "security": "complete"
  }
}
```

---

## Success Criteria

**Skill succeeds if:**
1. PRD file exists and is parseable
2. All required metadata fields are present
3. No critical errors found
4. Score >= 60 (passing grade)

**Skill fails if:**
5. PRD file not found
6. Invalid YAML syntax
7. Missing critical metadata (project_name, platforms)
8. Score < 60 or errors.length > 0

---

## Next Steps Recommendation

Based on score:
- **90-100**: Proceed to `prprompts-generator` skill immediately
- **80-89**: Proceed, but consider addressing warnings
- **70-79**: Address major issues before generating PRPROMPTS
- **< 70**: Fix errors and run `prd-analyzer` again before proceeding
