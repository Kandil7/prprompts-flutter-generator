# 🔍 PRD Analyzer Skill

## What Does This Do? (For Juniors)

This skill reads your project requirements document (PRD) and checks if it's complete and ready to use. Think of it like a spell-checker, but for project documents!

### Real-World Analogy

Imagine you're baking a cake and have a recipe. Before you start cooking, this skill checks:
- ✅ Do you have all ingredients listed? (required fields)
- ✅ Are the instructions clear? (feature descriptions)
- ✅ Did you mention oven temperature? (technical details)
- ⚠️ You might want to add frosting! (suggestions)

### What Gets Checked?

**Must Have (Errors if missing):**
- Project name (what's your app called?)
- Project type (healthcare? fintech? social media?)
- Platforms (iOS? Android? Web?)

**Should Have (Warnings if missing):**
- Authentication method (how do users log in?)
- Compliance requirements (HIPAA for healthcare, PCI-DSS for payments)
- Security settings (encryption, data protection)

**Nice to Have (Suggestions):**
- Concrete examples for each feature
- User flows (how users navigate your app)
- Technical architecture details

---

## When To Use This?

**Best Time:** Right after you create your PRD, before generating PRPROMPTS files.

**Workflow:**
1. Create PRD (using `prd-creator` skill or manually)
2. ✅ **Run `prd-analyzer`** ← YOU ARE HERE
3. Fix any errors/warnings
4. Generate PRPROMPTS files

---

## How Long Does It Take?

⏱️ **5-10 seconds**

Super fast! Just reads your file and gives you feedback.

---

## What Do You Get Back?

### A Quality Score (0-100)

- **90-100** 🌟 - Perfect! Ready to go!
- **80-89** ✅ - Good job, minor tweaks suggested
- **70-79** ⚠️ - Needs some work
- **60-69** 🔧 - Several issues to fix
- **0-59** ❌ - Not ready yet, fix critical errors

### A Report

```
✅ No errors found!
⚠️ 2 warnings:
   - No auth method specified (recommend JWT)
   - Feature descriptions are too brief

💡 3 suggestions:
   - Add concrete examples for "User Management" feature
   - Specify data encryption method
   - Define user flow for login
```

---

## Example Usage

### Basic Check
```
@claude use skill prprompts-core/prd-analyzer
```

**Output:**
```json
{
  "valid": true,
  "score": 85,
  "errors": [],
  "warnings": [
    "No compliance requirements specified"
  ],
  "suggestions": [
    "Add HIPAA compliance for healthcare app"
  ]
}
```

### Strict Mode (Fail on Warnings)
```
@claude use skill prprompts-core/prd-analyzer --strict_mode true
```

If there are ANY warnings, skill will fail. Use this when you want 100% perfect PRD.

---

## Common Issues (Troubleshooting)

### "PRD file not found"
**Problem:** Your PRD isn't at `docs/PRD.md`
**Solution:** Either move it there, or specify location:
```
@claude use skill prprompts-core/prd-analyzer --prd_path docs/my-custom-prd.md
```

### "Invalid YAML frontmatter"
**Problem:** The top section of your PRD (between `---` lines) has syntax errors
**Solution:** Check your YAML syntax. Common issues:
- Missing quotes around strings with special characters
- Incorrect indentation (use spaces, not tabs)
- Missing colons after field names

**Good:**
```yaml
---
project_name: "My App"
platforms: ["ios", "android"]
---
```

**Bad:**
```yaml
---
project_name My App
platforms ios, android
---
```

### "Score is too low (< 60)"
**Problem:** Your PRD is missing critical information
**Solution:** Read the errors and warnings carefully, then:
1. Add missing required fields (project_name, platforms, etc.)
2. Expand feature descriptions (should be > 30 words each)
3. Add compliance requirements if healthcare/fintech
4. Remove placeholders like `[TBD]` and `[TODO]`

---

## Understanding Compliance Warnings

### Healthcare Apps
If your app is healthcare-related, you'll see:
- ⚠️ "Add HIPAA compliance requirements"
- 💡 "Mention PHI encryption, audit logging"

**Why?** Healthcare apps handle sensitive patient data and must follow HIPAA rules.

### Fintech Apps
If your app handles money, you'll see:
- ⚠️ "Add PCI-DSS compliance requirements"
- 💡 "Use payment provider (Stripe, PayPal), never store card numbers"

**Why?** Financial apps must follow PCI-DSS rules to protect payment data.

### All Apps (Privacy)
You'll often see:
- 💡 "Add GDPR compliance for user privacy"

**Why?** If you have European users, you need GDPR compliance (data export, deletion, consent).

---

## What Happens Next?

### If Score >= 80 (Good!)
✅ Proceed to generating PRPROMPTS files:
```
@claude use skill prprompts-core/prprompts-generator
```

### If Score 60-79 (Needs Work)
1. Fix the errors listed
2. Address major warnings
3. Run `prd-analyzer` again
4. When score improves to 80+, generate PRPROMPTS

### If Score < 60 (Not Ready)
1. Review the error list carefully
2. Add missing required fields
3. Expand brief descriptions
4. Add concrete examples
5. Run `prd-analyzer` again until you pass

---

## Pro Tips

### 1. Run This Early and Often
Don't wait until your PRD is "done" - run this skill as you write! It helps you catch issues immediately.

### 2. Aim for 90+ Score
While 80 is "good enough", aiming for 90+ means your PRPROMPTS files will be much better quality.

### 3. Don't Ignore Warnings
Warnings won't stop you from proceeding, but addressing them saves time later. Better PRD = better generated code.

### 4. Use Strict Mode for Production
If building a production app (not just learning), use `--strict_mode true` to ensure 100% quality.

---

## Related Skills

**Before this skill:**
- `prd-creator` - Create PRD from scratch

**After this skill:**
- `prprompts-generator` - Generate 32 guide files from PRD
- `phase-generator` - Generate specific phases only

---

## Need Help?

**Common Questions:**

**Q: Can I skip this skill?**
A: Technically yes, but strongly not recommended! It's like skipping proofreading before publishing. Takes 10 seconds and saves hours of debugging later.

**Q: What if I disagree with a warning?**
A: Warnings are suggestions, not requirements. If you have a good reason to ignore one, that's fine! But consider the advice carefully.

**Q: Can this fix my PRD automatically?**
A: No, it only analyzes and reports issues. You need to manually fix them. (But we're working on an auto-fixer skill!)

---

**Version:** 1.0.0
**Category:** Core PRPROMPTS
**Difficulty:** Beginner-friendly 🟢
