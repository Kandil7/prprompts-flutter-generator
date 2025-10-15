# Auto PRD Generation Guide

## Overview

Automatically generate a complete Product Requirements Document from a simple project description. **No questions asked** - the AI infers everything.

## Quick Start

### Step 1: Create Description File

```bash
# Copy template
cp templates/project_description.md project_description.md

# Edit with your details
vim project_description.md
```

**Minimal content needed:**
- App name
- What it does (1-2 sentences)
- Target users (2-3 types)
- Key features (3-10 items)

### Step 2: Generate PRD

```bash
# Option 1: Using Claude Code
claude --prompt .claude/prompts/auto-generate-prd.md

# Option 2: Using script
./scripts/auto-gen-prd.sh

# Option 3: Specify custom file
./scripts/auto-gen-prd.sh path/to/description.md
```

### Step 3: Review Generated PRD

```bash
cat docs/PRD.md

# Check inference notes (section 18)
# Lists what was inferred and confidence level
```

### Step 4: Generate PRPROMPTS

```bash
prp-gen

# Now you have:
# - docs/PRD.md (complete PRD)
# - PRPROMPTS/ (32 customized guides)
```

## What Gets Inferred

### ✅ Automatically Detected:

| Field | Detection Method | Example |
|-------|------------------|---------|
| **Project Type** | Keywords | "patient" → healthcare |
| **Compliance** | Keywords | "HIPAA" → ["hipaa"] |
| **Platforms** | Keywords or default | "iOS" → ["ios"] |
| **Auth Method** | Keywords or default | "JWT" → "jwt" |
| **Offline Support** | Keywords | "offline" → true |
| **Real-Time** | Keywords | "real-time" → true |
| **Sensitive Data** | Keywords | "medical" → ["phi"] |
| **Team Size** | Complexity score | High complexity → "large" |
| **Timeline** | Complexity score | 15 features → "9 months" |
| **Features** | Extracted from description | Lists features with complexity |

### Keyword Detection Examples:

**Healthcare:**
- Keywords: patient, doctor, medical, health, HIPAA, telemedicine, diagnosis, prescription
- Result: `project_type: "healthcare"`, `compliance: ["hipaa"]`, `sensitive_data: ["phi"]`

**Fintech:**
- Keywords: payment, bank, transaction, credit card, financial, PCI
- Result: `project_type: "fintech"`, `compliance: ["pci-dss"]`, `sensitive_data: ["payment"]`

**Offline:**
- Keywords: offline, rural areas, poor connectivity, airplane mode, sync
- Result: `offline_support: true`, adds offline patterns to PRPROMPTS

**Real-Time:**
- Keywords: real-time, live, instant, WebSocket, chat, messaging
- Result: `real_time: true`, adds WebSocket patterns to PRPROMPTS

## Confidence Levels

The generator assigns confidence scores:

### **High Confidence (90-100%)**
- Explicit mentions: "Must comply with HIPAA"
- Clear keywords: "payment app" → fintech
- Direct statements: "iOS and Android"

### **Medium Confidence (70-89%)**
- Implied requirements: medical app → probably HIPAA
- Context clues: P2P payments → probably real-time
- Partial information: mentions "mobile" but not specific platforms

### **Low Confidence (50-69%)**
- Vague descriptions: "business app"
- Missing key info: no platforms mentioned
- Ambiguous features: "social features" (could be many things)

Check **Section 18 (AI Inference Notes)** in generated PRD for confidence scores.

## Examples

### Example 1: Healthcare (Minimal Description)

**Input:** `project_description.md`
```markdown
# PatientCare

Diabetes tracking app. Patients log blood sugar, message doctors. HIPAA compliant, works offline.

## Users
- Diabetes patients
- Endocrinologists

## Features
1. Blood glucose tracking
2. Medication reminders
3. Secure messaging
4. Reports
```

**Command:**
```bash
./scripts/auto-gen-prd.sh
```

**Output:** `docs/PRD.md` with:
```yaml
project_type: "healthcare"         # ✅ "diabetes", "patients"
compliance: ["hipaa"]              # ✅ Explicit mention
platforms: ["ios", "android"]      # ✅ Default for mobile
auth_method: "jwt"                 # ✅ Default secure
offline_support: true              # ✅ "work offline"
sensitive_data: ["phi"]            # ✅ Medical data
team_size: "small"                 # ✅ 4 simple features
```

**Confidence:** High (95%)

### Example 2: Fintech (Brief Description)

**Input:** `brief.md`
```markdown
# QuickPay

P2P payment app. Send money instantly.

Features:
- Instant transfers
- Split bills
- Request money
```

**Output:**
```yaml
project_type: "fintech"            # ✅ "payment"
compliance: ["pci-dss"]            # ✅ Inferred from payments
real_time: true                    # ✅ "instantly"
sensitive_data: ["payment", "pii"] # ✅ Money + personal
team_size: "medium"                # ✅ Payments = complex
```

**Confidence:** High (90%)

## Customization After Generation

If inference was wrong or incomplete:

### Method 1: Edit PRD Directly

```bash
vim docs/PRD.md

# Edit YAML frontmatter:
# Change: project_type: "generic"
# To:     project_type: "healthcare"

# Save and regenerate PRPROMPTS
prp-gen
```

### Method 2: Enhance Description

```bash
# Add more details to description
vim project_description.md

# Add keywords:
# - "HIPAA compliant"
# - "offline support needed"
# - "real-time notifications"

# Regenerate
./scripts/auto-gen-prd.sh
```

### Method 3: Use Interactive Mode

```bash
# If auto-gen fails, fall back to interactive
claude --prompt .claude/prompts/generate-prd.md

# Answer questions manually
```

## Troubleshooting

### Issue: "No description file found"

**Solution:**
```bash
# Create description file
cp templates/project_description.md project_description.md
vim project_description.md

# Or specify location
./scripts/auto-gen-prd.sh path/to/description.md
```

### Issue: "Low confidence inference"

**Cause:** Description too vague

**Solution:**
```markdown
# Add more keywords to description:

## Before (vague):
# "A mobile app for users"

## After (specific):
# "A HIPAA-compliant mobile health app for diabetes patients
# to track blood glucose and message their doctor. Must work
# offline for rural patients. iOS and Android."
```

### Issue: "Wrong project type inferred"

**Solution:** Edit PRD directly
```yaml
# docs/PRD.md
---
project_type: "healthcare"  # Change from "generic"
---
```

Then regenerate PRPROMPTS:
```bash
prp-gen
```

## Best Practices

### ✅ DO:

- **Be specific:** "HIPAA-compliant diabetes tracking" vs "health app"
- **Mention compliance:** Explicitly state HIPAA, PCI-DSS, GDPR, etc.
- **List features:** 3-10 clear feature bullets
- **State requirements:** Offline, real-time, platforms, auth
- **Review output:** Always check Section 18 (Inference Notes)

### ❌ DON'T:

- **Be vague:** "An app for people" tells AI nothing
- **Assume:** Don't assume AI knows your unstated requirements
- **Skip review:** Always review generated PRD
- **Ignore warnings:** Low confidence = manual review needed

## Comparison: Three Methods

| Method | Time | Accuracy | Best For |
|--------|------|----------|----------|
| **Auto** | 1 min | 85% | Quick prototypes, standard projects |
| **Interactive** | 5 min | 95% | Production projects, high stakes |
| **Manual** | 30 min | 100% | Complex projects, unique requirements |

**Recommendation:** Start with Auto, review output, switch to Interactive if needed.

## Support

- 📖 [Full Documentation](../README.md)
- 📝 [Templates](../templates/)
- 🐛 [Report Issue](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- 💬 [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)

## Next Steps

After auto-generating PRD:

1. **Review:** `cat docs/PRD.md` (especially Section 18)
2. **Validate:** Check inference confidence
3. **Customize:** `vim docs/PRD.md` (if needed)
4. **Generate:** `prp-gen`
5. **Start Coding:** `cat PRPROMPTS/01-feature_scaffold.md`
