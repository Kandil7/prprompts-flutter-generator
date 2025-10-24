# ⚡ Phase Generator Skill

## What Does This Do? (For Juniors)

Instead of generating all 32 PRPROMPTS files at once, this skill lets you generate them **in stages** (phases). This is useful when you want to focus on one area at a time.

### Real-World Analogy

Think of building a house:
- **Phase 1 (Core)**: Foundation, walls, roof - the essential structure
- **Phase 2 (Quality)**: Electrical, plumbing, insulation - quality and safety
- **Phase 3 (Demo)**: Paint, furniture, landscaping - finishing touches

Same with your Flutter app!

---

## The 3 Phases

### 📦 Phase 1: Core (Foundation) - 10 Files
**What:** Essential architecture and features
**When to use:** Start of project, need basic structure
**Time:** 30-60 seconds

**Files you get:**
1. Project overview
2. Architecture guide (Clean Architecture)
3. Folder structure
4. State management (BLoC/Riverpod/Provider)
5. Navigation and routing
6. API integration
7. Data models
8. Dependency injection
9. Error handling
10. Features implementation guide

---

### ✅ Phase 2: Quality (Polish & Security) - 12 Files
**What:** Testing, security, accessibility
**When to use:** After basic features work, before launch
**Time:** 40-60 seconds

**Files you get:**
11. Testing strategy
12. Unit testing guide
13. Widget testing guide
14. Integration testing
15. Code quality (linting)
16. Security & compliance (HIPAA, PCI-DSS, GDPR)
17. Performance optimization
18. Accessibility (a11y)
19. Localization (i18n)
20. Logging and monitoring
21. Offline support
22. Data persistence

---

### 🚀 Phase 3: Demo (Presentation & Deployment) - 10 Files
**What:** Demo preparation and app store launch
**When to use:** App is ready, preparing for demo/launch
**Time:** 30-60 seconds

**Files you get:**
23. Demo preparation
24. User flows
25. Presentation mode
26. Build configuration
27. Deployment pipeline (CI/CD)
28. App store preparation
29. Beta testing (TestFlight, Play Console)
30. Analytics and tracking
31. Documentation
32. Maintenance and updates

---

## When To Use Each Phase

### Use Phase 1 When:
- ✅ Starting a new project
- ✅ Need to set up architecture
- ✅ Want to implement core features first
- ✅ Team needs architecture guidance

### Use Phase 2 When:
- ✅ Core features are working
- ✅ Ready to add tests
- ✅ Need to implement security
- ✅ Preparing for production

### Use Phase 3 When:
- ✅ App is feature-complete
- ✅ Need to prepare demo
- ✅ Ready to deploy to stores
- ✅ Planning post-launch maintenance

---

## How To Use

### Generate Phase 1 (Core)
```
@claude use skill prprompts-core/phase-generator --phase 1
```

**What happens:**
- Reads your PRD (docs/PRD.md)
- Generates 10 core architecture files
- Files saved to PRPROMPTS/ directory
- Takes 30-60 seconds

**You get:**
```
PRPROMPTS/
  01-project_overview.md
  02-architecture_overview.md
  03-folder_structure.md
  ...
  10-features_implementation.md
```

---

### Generate Phase 2 (Quality)
```
@claude use skill prprompts-core/phase-generator --phase 2
```

**What happens:**
- Generates 12 quality & security files
- Includes compliance patterns from your PRD
- Takes 40-60 seconds

**You get:**
```
PRPROMPTS/
  11-testing_strategy.md
  12-unit_testing.md
  ...
  22-data_persistence.md
```

---

### Generate Phase 3 (Demo)
```
@claude use skill prprompts-core/phase-generator --phase 3
```

**What happens:**
- Generates 10 deployment & demo files
- Takes 30-60 seconds

**You get:**
```
PRPROMPTS/
  23-demo_preparation.md
  24-user_flows.md
  ...
  32-maintenance_and_updates.md
```

---

## Typical Workflow

### Week 1: Foundation
```bash
# 1. Create PRD
@claude use skill prprompts-core/prd-creator

# 2. Generate Phase 1 (Core)
@claude use skill prprompts-core/phase-generator --phase 1

# 3. Bootstrap Flutter project
@claude use skill automation/flutter-bootstrapper

# 4. Implement core features
# (follow files 01-10)
```

### Week 2-3: Implementation
```bash
# Keep building features using Phase 1 guides
# When ready for quality...
```

### Week 4: Quality & Testing
```bash
# Generate Phase 2 (Quality)
@claude use skill prprompts-core/phase-generator --phase 2

# Implement tests (files 11-14)
# Add security (file 16)
# Optimize performance (file 17)
```

### Week 5: Launch Prep
```bash
# Generate Phase 3 (Demo)
@claude use skill prprompts-core/phase-generator --phase 3

# Prepare demo (file 23)
# Setup CI/CD (file 27)
# Submit to stores (files 28-29)
```

---

## Options

### Custom Output Directory
```
@claude use skill prprompts-core/phase-generator --phase 1 --output_dir guides
```

Files go to `guides/` instead of `PRPROMPTS/`

### Overwrite Existing Files
```
@claude use skill prprompts-core/phase-generator --phase 1 --overwrite true
```

Replaces existing files (useful if you updated your PRD)

---

## What Makes Each File Special?

Every file is **customized to YOUR project** based on your PRD:

### Project Type Customization
- **Healthcare app** → Gets HIPAA compliance patterns
- **Fintech app** → Gets PCI-DSS payment security
- **E-commerce** → Gets payment integration examples

### Platform Customization
- **iOS + Android** → Mobile-specific code
- **Web** → Web-specific considerations
- **All platforms** → Cross-platform patterns

### Example: File 16 (Security)

**If your PRD says:**
```yaml
project_type: "healthcare"
compliance: ["hipaa"]
```

**You get:**
```markdown
# Security & Compliance

## HIPAA Requirements

### PHI Encryption
All patient data must be encrypted:
```dart
class PHIEncryption {
  static String encrypt(String phi) {
    // AES-256-GCM encryption code
  }
}
```
```

**Different PRD:**
```yaml
project_type: "fintech"
compliance: ["pci-dss"]
```

**You get:**
```markdown
# Security & Compliance

## PCI-DSS Requirements

### ❌ NEVER Store Card Numbers
```dart
// Use Stripe tokenization instead
final token = await Stripe.createToken(card);
```
```

---

## Common Questions

### Q: Do I have to generate phases in order?
**A:** No, but recommended! Phase 1 → Phase 2 → Phase 3 makes most sense.

You can do:
```bash
# Skip straight to Phase 2 if you want
@claude use skill phase-generator --phase 2
```

### Q: Can I generate the same phase twice?
**A:** Yes! Use `--overwrite true` to replace files:
```bash
@claude use skill phase-generator --phase 1 --overwrite true
```

Useful if you updated your PRD and want fresh files.

### Q: What if I want all 32 files at once?
**A:** Use the full generator:
```bash
@claude use skill prprompts-core/prprompts-generator
```

That's like running all 3 phases together.

### Q: Can I mix phase-by-phase with full generation?
**A:** Yes! If you already generated Phase 1 with this skill, you can:
- Generate Phase 2 separately, OR
- Run full generator (it will skip Phase 1 files if they exist)

---

## Troubleshooting

### "PRD file not found"
**Problem:** No PRD at docs/PRD.md

**Solution:**
```bash
# Create PRD first
@claude use skill prprompts-core/prd-creator
```

### "Invalid phase number"
**Problem:** You used phase 0, 4, or something else

**Solution:** Only use 1, 2, or 3:
```bash
@claude use skill phase-generator --phase 1  # ✅ Valid
@claude use skill phase-generator --phase 4  # ❌ Invalid
```

### "Files already exist"
**Problem:** Phase 1 files already in PRPROMPTS/

**Solution 1:** Use overwrite flag:
```bash
@claude use skill phase-generator --phase 1 --overwrite true
```

**Solution 2:** Generate different phase:
```bash
@claude use skill phase-generator --phase 2  # Generate Phase 2 instead
```

---

## Performance

| Phase | Files | Typical Time |
|-------|-------|--------------|
| Phase 1 | 10 files | 30-45 seconds |
| Phase 2 | 12 files | 40-55 seconds |
| Phase 3 | 10 files | 30-45 seconds |
| **Total (all 3)** | **32 files** | **~2 minutes** |

**Note:** Full generator (`prprompts-generator`) takes about the same time as running all 3 phases.

---

## Related Skills

**Before this skill:**
- `prd-creator` - Create PRD
- `prd-analyzer` - Validate PRD

**Alternative to this skill:**
- `prprompts-generator` - Generate all 32 files at once

**After this skill:**
- `flutter-bootstrapper` - Setup Flutter project structure
- `single-file-generator` - Regenerate individual files

---

## Pro Tips

### 1. Start with Phase 1, Build, Then Phase 2
Don't generate all phases upfront. Generate Phase 1, start building, then generate Phase 2 when you need it. This helps you focus.

### 2. Update PRD Between Phases
If you realize something after Phase 1, update your PRD, then generate Phase 2 with the new info.

### 3. Use for Learning
Generate phases one at a time to learn Flutter architecture step-by-step. Phase 1 teaches architecture, Phase 2 teaches testing/security, etc.

### 4. Combine with Automation
```bash
# Generate Phase 1
@claude use skill phase-generator --phase 1

# Immediately bootstrap project
@claude use skill automation/flutter-bootstrapper
```

---

**Version:** 1.0.0
**Category:** Core PRPROMPTS
**Difficulty:** Beginner-friendly 🟢
**Time per phase:** 30-60 seconds
