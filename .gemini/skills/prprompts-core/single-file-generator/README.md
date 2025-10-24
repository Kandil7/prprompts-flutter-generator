# 📄 Single File Generator Skill

## What Does This Do? (For Juniors)

Generates or regenerates **just one** of the 32 PRPROMPTS files. Super useful when you need to update a specific guide without regenerating everything!

### Real-World Analogy

Think of it like editing one chapter of a book instead of rewriting the whole book.

**Scenario:** You added HIPAA compliance to your PRD, but already have 31 files generated. Instead of regenerating all 32 files, just regenerate File 16 (security).

---

## When To Use This

### ✅ Good Uses

1. **Updated PRD after generation**
   - Added compliance requirement → Regenerate File 16 (security)
   - Changed state management → Regenerate File 4 (state management)
   - Updated architecture → Regenerate File 2 (architecture)

2. **Fix a specific file**
   - File 11 has errors → Regenerate it
   - File 23 is outdated → Get fresh version

3. **Generated missing file**
   - Accidentally deleted File 7 → Regenerate it
   - Skipped Phase 2, now need File 16 → Generate it

4. **Learning specific topic**
   - Want to learn testing? → Generate File 11 (testing strategy)
   - Need security guide? → Generate File 16 (security)

### ❌ When NOT to Use

- Generating files for first time → Use `prprompts-generator` or `phase-generator`
- Need multiple files → Use `phase-generator` for whole phases
- Starting fresh → Use `prprompts-generator` for all 32

---

## How To Use

### Basic: Regenerate a File

```
@claude use skill prprompts-core/single-file-generator --file_number 16
```

**What happens:**
- Reads your PRD
- Generates File 16 (security_and_compliance.md)
- Overwrites if exists (default)
- Takes 5-10 seconds

---

### Common File Numbers

**Most Popular:**

```bash
# File 16: Security & Compliance (most customized to PRD!)
@claude use skill single-file-generator --file_number 16

# File 4: State Management
@claude use skill single-file-generator --file_number 4

# File 11: Testing Strategy
@claude use skill single-file-generator --file_number 11

# File 2: Architecture Overview
@claude use skill single-file-generator --file_number 2
```

---

## File Number Quick Reference

Don't remember the number? Here's a quick reference:

### Phase 1: Core (1-10)
```
1  - Project Overview
2  - Architecture Overview  👈 Popular!
3  - Folder Structure
4  - State Management      👈 Popular!
5  - Navigation & Routing
6  - API Integration
7  - Data Models
8  - Dependency Injection
9  - Error Handling
10 - Features Implementation
```

### Phase 2: Quality (11-22)
```
11 - Testing Strategy      👈 Popular!
12 - Unit Testing
13 - Widget Testing
14 - Integration Testing
15 - Code Quality
16 - Security & Compliance 👈 MOST POPULAR!
17 - Performance Optimization
18 - Accessibility
19 - Localization
20 - Logging & Monitoring
21 - Offline Support
22 - Data Persistence
```

### Phase 3: Demo (23-32)
```
23 - Demo Preparation
24 - User Flows
25 - Presentation Mode
26 - Build Configuration
27 - Deployment Pipeline   👈 Popular!
28 - App Store Preparation
29 - Beta Testing
30 - Analytics & Tracking
31 - Documentation
32 - Maintenance & Updates
```

---

## Real Examples

### Example 1: Added HIPAA After Initial Generation

**Situation:**
```
Day 1: Generated all 32 files (no compliance in PRD)
Day 5: Realized you need HIPAA compliance
```

**Solution:**
```bash
# 1. Update PRD
# Add to docs/PRD.md frontmatter:
compliance: ["hipaa", "gdpr"]

# 2. Regenerate security file
@claude use skill single-file-generator --file_number 16

# Result: File 16 now has HIPAA patterns!
```

**Before (no compliance):**
```markdown
## Security Patterns

Basic encryption examples...
```

**After (with HIPAA):**
```markdown
## HIPAA Requirements

### PHI Encryption (Required)
All patient health information must be encrypted at rest using AES-256-GCM...

### Audit Logging (Required)
Log all PHI access with user ID, timestamp, action...

### Session Timeout (Required - 15 minutes)
Implement automatic session timeout after 15 minutes of inactivity...
```

---

### Example 2: Changed State Management

**Situation:**
```
Originally used Provider in PRD
Switched to BLoC after seeing advantages
```

**Solution:**
```bash
# 1. Update PRD
state_management: "bloc"  # was "provider"

# 2. Regenerate state management file
@claude use skill single-file-generator --file_number 4

# Result: File 4 now shows BLoC patterns instead of Provider!
```

---

### Example 3: Need Just One File for Learning

**Situation:**
```
You haven't generated any files yet
You just want to learn about testing
```

**Solution:**
```bash
# Generate just the testing file
@claude use skill single-file-generator --file_number 11

# Now you have testing_strategy.md to learn from!
# No need to generate all 32 files
```

---

## Options

### Don't Overwrite If File Exists

```
@claude use skill single-file-generator --file_number 16 --overwrite false
```

**Default is true** (overwrites), set to false to skip if exists.

### Custom Output Directory

```
@claude use skill single-file-generator --file_number 16 --output_dir guides
```

Outputs to `guides/` instead of `PRPROMPTS/`

---

## What Makes This Skill Smart?

### 1. Reads Your PRD Every Time

Every time you run this skill, it reads your latest PRD. So if you:
- Added compliance requirements
- Changed state management
- Updated project type
- Modified platforms

**The generated file reflects your changes!**

### 2. Heavily Customizes File 16 (Security)

File 16 is special - it's customized based on:
- **project_type**: healthcare → HIPAA, fintech → PCI-DSS
- **compliance**: Array of requirements
- **auth_method**: JWT verification patterns (never signing!)
- **platforms**: Platform-specific security

### 3. Matches Your State Management

File 4 uses your chosen state management:
- BLoC → Full BLoC examples
- Riverpod → Riverpod patterns
- Provider → Provider examples
- GetX → GetX patterns

---

## Common Questions

### Q: Can I generate a file that doesn't exist yet?
**A:** Yes! This skill works for both:
- Creating new files (if they don't exist)
- Regenerating existing files

### Q: Will it overwrite my edits?
**A:** Yes, by default it overwrites. If you edited a file manually and don't want to lose changes:
```bash
# Option 1: Don't overwrite
--overwrite false

# Option 2: Commit your edits first
git add PRPROMPTS/16-security_and_compliance.md
git commit -m "My custom changes"
# Then regenerate (you can merge later if needed)
```

### Q: How do I know which file number I need?
**A:** See the "File Number Quick Reference" section above, or:
```bash
# List all PRPROMPTS files
ls PRPROMPTS/

# Shows:
# 01-project_overview.md
# 02-architecture_overview.md
# ...
```

The number is in the filename!

### Q: Does this work with phase-generator?
**A:** Yes, perfectly! You can:
```bash
# Generate Phase 1 with phase-generator
@claude use skill phase-generator --phase 1

# Later, regenerate specific file from Phase 1
@claude use skill single-file-generator --file_number 4
```

---

## Troubleshooting

### "File number out of range"

**Problem:** Used number < 1 or > 32

**Solution:**
```bash
# ✅ Valid
--file_number 16

# ❌ Invalid
--file_number 0   # Too low!
--file_number 50  # Too high!
```

### "PRD file not found"

**Problem:** No PRD at docs/PRD.md

**Solution:**
```bash
# Create PRD first
@claude use skill prprompts-core/prd-creator
```

### File Generated But Doesn't Match My PRD

**Problem:** Generated file doesn't have your new compliance patterns

**Possible Causes:**
1. PRD not saved (check file timestamp)
2. Wrong prd_path specified
3. PRD YAML has syntax errors

**Solution:**
```bash
# 1. Verify PRD exists and is correct
cat docs/PRD.md

# 2. Check YAML syntax (should be valid)
# 3. Try again
@claude use skill single-file-generator --file_number 16
```

---

## Pro Tips

### 1. Regenerate After Major PRD Changes

When you change:
- Compliance requirements → Regenerate File 16
- State management → Regenerate File 4
- Architecture pattern → Regenerate File 2
- Test strategy → Regenerate Files 11-14

### 2. Generate Files On-Demand

Don't generate all 32 files upfront. Generate as you need:
```bash
# Week 1: Just need architecture
--file_number 2

# Week 2: Starting features
--file_number 10

# Week 3: Adding tests
--file_number 11

# Week 4: Security review
--file_number 16
```

### 3. Use for Learning Flutter Patterns

Want to learn a specific topic? Generate just that file:
```bash
# Learn state management
--file_number 4

# Learn testing
--file_number 11

# Learn security
--file_number 16
```

### 4. Compare Before/After PRD Changes

```bash
# 1. Copy old file
cp PRPROMPTS/16-security_and_compliance.md PRPROMPTS/16-old.md

# 2. Update PRD

# 3. Regenerate
@claude use skill single-file-generator --file_number 16

# 4. Compare
diff PRPROMPTS/16-old.md PRPROMPTS/16-security_and_compliance.md
```

---

## Performance

**Speed:** 5-10 seconds per file

**Factors:**
- File 16 (security) is slowest (most complex) - ~10s
- Simple files (1-3) are fastest - ~5s
- PRD size affects speed slightly

**Much faster than regenerating all 32 files!** (which takes 60-90s)

---

## Related Skills

**Before this skill:**
- `prd-creator` - Create PRD
- `prd-analyzer` - Validate PRD

**Alternatives:**
- `prprompts-generator` - Generate all 32 files
- `phase-generator` - Generate full phases (10-12 files)

**After this skill:**
- `flutter-bootstrapper` - Setup Flutter project
- `security-validator` - Validate security implementation

---

**Version:** 1.0.0
**Category:** Core PRPROMPTS
**Difficulty:** Beginner-friendly 🟢
**Speed:** 5-10 seconds per file
