---
name: create-prd
description: "[prprompts] Interactive PRD creation wizard (10 questions)"
category: PRD Generation
version: 4.0.0
tags: [prprompts, prd, requirements, documentation, flutter]
---

# /create-prd - Interactive PRD Creation Wizard

Interactive Product Requirements Document (PRD) creation wizard. Asks 10 focused questions to generate a comprehensive, structured PRD with YAML frontmatter.

## Usage

```bash
/create-prd
```

## What It Does

1. **Asks 10 Questions:**
   - Project name & type (healthcare, fintech, education, etc.)
   - Compliance requirements (HIPAA, PCI-DSS, GDPR, etc.)
   - Platforms (iOS, Android, Web, etc.)
   - Authentication method (JWT, OAuth2, Firebase, etc.)
   - Architecture requirements (offline, real-time)
   - Sensitive data types (PHI, PII, payment data, etc.)
   - Team size & composition
   - Demo frequency
   - 3-7 main features

2. **Generates Structured PRD:**
   - YAML frontmatter with 70+ configuration keys
   - Executive summary
   - Product vision
   - Target user personas
   - Detailed feature specifications with user stories
   - Compliance sections
   - Technical architecture
   - Timeline & milestones
   - Risk assessment
   - Success metrics

3. **Saves to:** `docs/PRD.md`

## Example Session

```
/create-prd

📋 PRD Generation Wizard

1. Project Name: HealthTracker Pro
2. Project Type: healthcare
3. Compliance: HIPAA, GDPR
4. Platforms: iOS, Android
5. Authentication: JWT (RS256)
6. Offline support: Yes
7. Sensitive data: PHI, PII
8. Team size: medium (8 people)
9. Demo frequency: weekly
10. Features:
    - Patient portal
    - Appointment scheduling
    - Medical records
    - Secure messaging
    - Telemedicine

✅ Generated PRD at docs/PRD.md (2,847 words)

Next: /gen-prprompts to generate 32 development guides
```

## Output

- **File:** `docs/PRD.md`
- **Size:** ~2,000-3,000 words
- **Sections:** 15+ sections with detailed specifications
- **Frontmatter:** 70+ YAML configuration keys

## Next Steps

After creating your PRD:

1. **Review:** Open and review `docs/PRD.md`
2. **Customize:** Edit any sections as needed
3. **Analyze:** Run `/analyze-prd` to validate
4. **Generate:** Run `/gen-prprompts` to create 32 guides

## Related Commands

- `/auto-gen-prd` - Auto-generate from description (zero interaction)
- `/prd-from-files` - Generate from existing markdown files
- `/analyze-prd` - Validate and analyze PRD
- `/gen-prprompts` - Generate 32 PRPROMPTS files from PRD

## Requirements

- Gemini CLI v1.0.0+
- PRPROMPTS Flutter Generator extension v4.0.0+

---

**Powered by PRPROMPTS v4.0** | [Documentation](https://github.com/Kandil7/prprompts-flutter-generator#readme)
