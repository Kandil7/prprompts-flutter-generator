# PRPROMPTS Automation Guide

Complete automation from PRD to working code.

## Quick Start

```bash
# 1. Generate PRPROMPTS
cd your-flutter-project
prprompts auto && prprompts generate

# 2. Start AI assistant
claude  # or qwen, or gemini

# 3. Bootstrap project
/bootstrap-from-prprompts

# 4. Auto-implement features
/full-cycle
5

# 5. Run QA audit
/qa-check
```

## Full Workflow

### Step 1: Generate PRPROMPTS (60 seconds)

```bash
cd your-flutter-project
prprompts auto    # Auto-generate PRD
prprompts generate # Generate 32 PRPROMPTS files
```

### Step 2: Bootstrap (2-5 minutes)

Start your AI assistant and run the bootstrap command:

```bash
# Using Claude Code
claude
/bootstrap-from-prprompts

# OR using Qwen Code
qwen
/bootstrap-from-prprompts

# OR using Gemini CLI
gemini
/bootstrap-from-prprompts
```

**What this command does:**
- ✅ Creates Clean Architecture folder structure
- ✅ Generates ARCHITECTURE.md and IMPLEMENTATION_PLAN.md
- ✅ Sets up design system and theme (Material 3)
- ✅ Configures security infrastructure (JWT verification, encryption)
- ✅ Creates test infrastructure
- ✅ Makes initial commit

### Step 3: Automated Implementation (1-2 hours)

Continue in your AI assistant:

```bash
/full-cycle
10  # Number of tasks to implement
```

**Each task automatically:**
1. Reads relevant PRPROMPTS for patterns
2. Implements following best practices
3. Generates comprehensive tests
4. Validates against security checklist
5. Commits with proper message

### Step 4: QA Audit (2 minutes)

```bash
/qa-check
```

**Checks performed:**
- PRPROMPTS compliance (all 32 files)
- Security patterns (JWT, encryption, PCI-DSS, HIPAA)
- Test coverage (>70%)
- Code quality (analyzer, formatting)
- PRD requirements coverage

## Example: Healthcare App

```bash
# 1. Use healthcare template
cp ~/.prprompts/templates/healthcare.md project_description.md

# 2. Generate PRD and PRPROMPTS
prprompts auto && prprompts generate

# 3. Auto-bootstrap with HIPAA compliance
claude
/bootstrap-from-prprompts

# 4. Implement 5 features automatically
/full-cycle
5

# 5. Review generated code
git log --oneline
cat docs/QA_REPORT.md

# 6. Continue development
/full-cycle
10

# 7. Final QA before release
/qa-check
```

## Individual Commands Reference

### `/bootstrap-from-prprompts`

**Purpose:** Initialize project with PRPROMPTS patterns

**Prerequisites:**
- PRPROMPTS/ directory with 32 .md files
- docs/PRD.md exists
- pubspec.yaml exists (Flutter project initialized)

**What it creates:**
- Clean Architecture folder structure
- docs/ARCHITECTURE.md
- docs/IMPLEMENTATION_PLAN.md
- Design system (theme, colors, typography)
- Security infrastructure (JWT service, encryption)
- Test infrastructure
- Initial commit

**Typical duration:** 2-5 minutes

### `/implement-next`

**Purpose:** Implement next task from IMPLEMENTATION_PLAN.md

**What it does:**
1. Finds next TODO task
2. Loads relevant PRPROMPTS file
3. Implements following patterns and examples
4. Generates tests
5. Runs security checks
6. Stages changes

**Typical duration:** 5-30 minutes per task

### `/review-and-commit`

**Purpose:** Validate changes and commit

**Validation gates:**
- PRPROMPTS patterns compliance
- Security checklist (JWT, encryption, etc.)
- Code quality (flutter analyze)
- Test coverage (flutter test)
- Code formatting

**Commit message format:**
```
type(scope): description

- Followed @PRPROMPTS/XX-filename.md
- Key changes
- Tests added
- Refs: IMPLEMENTATION_PLAN.md Task X.Y
```

**Typical duration:** 2-5 minutes

### `/full-cycle`

**Purpose:** Auto-implement multiple tasks in a loop

**Parameters:** Number of tasks (1-10, default: 3)

**Process:**
1. Pre-flight checks
2. For each task:
   - Execute /implement-next
   - Execute /review-and-commit
   - Log progress
3. Show cycle summary
4. Run quality gate

**Typical duration:** 10-30 minutes per task

### `/qa-check`

**Purpose:** Comprehensive PRPROMPTS compliance audit

**What it checks:**

#### Architecture Compliance
- Clean Architecture layers (from File 01)
- BLoC pattern usage (from File 03)
- Design system consistency (from File 06)

#### Security Compliance
From File 16 (security_and_compliance.md):

```bash
# JWT Verification
grep -r "JWT.*sign" lib/  # Should be EMPTY
grep -r "HS256" lib/       # Should be EMPTY

# PII/PHI Encryption
grep -r "SharedPreferences.*ssn|creditCard|password" lib/
# Should be EMPTY

# PCI-DSS
grep -r "cardNumber|creditCard.*[0-9]" lib/
# Should only show tokenized references
```

#### Testing Compliance
```bash
flutter test --coverage
# Coverage should be > 70%
```

#### Static Analysis
```bash
flutter analyze --fatal-infos
# Should have zero issues
```

**Output:** docs/QA_REPORT.md with compliance score

**Typical duration:** 2-3 minutes

## Security Validation

The automation enforces PRPROMPTS security patterns automatically.

### JWT Verification

**✅ Auto-generated (correct):**
```dart
final jwt = JWT.verify(
  token,
  RSAPublicKey(publicKey), // Public key only!
  issuer: 'api.example.com',
);
```

**❌ Will be rejected by QA:**
```dart
final token = JWT.sign({'user': 'john'}, SecretKey('secret'));
```

### PII Encryption

**✅ Auto-generated (correct):**
```dart
final encrypted = await _encryptor.encrypt(
  sensitiveData,
  key: await _secureStorage.read(key: 'encryption_key'),
);
```

**❌ Will be rejected by QA:**
```dart
await prefs.setString('ssn', patient.ssn);
```

### PCI-DSS Compliance

**✅ Auto-generated (correct):**
```dart
final token = await stripe.createToken(cardNumber);
await db.insert('cards', {
  'last4': cardNumber.substring(cardNumber.length - 4),
  'token': token,  // Only store token
});
```

**❌ Will be rejected by QA:**
```dart
await db.insert('cards', {'number': '4242424242424242'});
```

## Customization

You can customize the automation by editing generated files:

### Adjust Architecture
Edit `docs/ARCHITECTURE.md` to modify:
- Folder structure
- State management approach
- Security patterns
- API integration patterns

### Modify Implementation Plan
Edit `docs/IMPLEMENTATION_PLAN.md` to:
- Reorder tasks
- Add custom validation gates
- Adjust time estimates
- Add team-specific requirements

### Update Automation Logic
Edit `.claude/commands/automation/` files to:
- Modify validation criteria
- Change commit message format
- Add custom checks
- Integrate with team tools

Then continue with automation commands.

## Multi-AI Support

All commands work identically across Claude, Qwen, and Gemini:

### Using Claude Code
```bash
claude
/bootstrap-from-prprompts
/full-cycle
5
```

### Using Qwen Code
```bash
qwen
/bootstrap-from-prprompts
/full-cycle
5
```

### Using Gemini CLI
```bash
gemini
/bootstrap-from-prprompts
/full-cycle
5
```

Choose based on your needs:
- **Claude Code**: Best accuracy (production apps)
- **Qwen Code**: Best for large codebases
- **Gemini CLI**: Best free tier (60 req/min)

## Troubleshooting

### "PRPROMPTS not found"

**Solution:**
```bash
# Generate PRPROMPTS first
prprompts generate
```

### "PRD not found"

**Solution:**
```bash
# Create PRD
prprompts auto
# OR
prprompts create
```

### "Task unclear in IMPLEMENTATION_PLAN.md"

**Solution:**
1. Edit `docs/IMPLEMENTATION_PLAN.md`
2. Add more detail to the task description
3. Continue with `/implement-next`

### "QA check failing"

**Solution:**
1. Review `docs/QA_REPORT.md` for specific issues
2. Each issue references a PRPROMPTS file
3. Fix issues following PRPROMPTS guidance
4. Run `/qa-check` again

### "Tests failing after implementation"

**Solution:**
1. Check test output for errors
2. Review @PRPROMPTS/05-testing_strategy.md
3. Fix tests following PRPROMPTS patterns
4. Run `flutter test` manually to verify

### "Security validation errors"

**Solution:**
1. Review @PRPROMPTS/16-security_and_compliance.md
2. Check specific patterns:
   - JWT: Only verify, never sign
   - Encryption: Use AES-256-GCM
   - PCI-DSS: Use tokenization
3. Fix security issues
4. Run `/qa-check` again

## Performance Tips

### Faster Bootstrap
- Use templates for common project types
- Have Flutter project initialized first
- Review PRD before starting

### Efficient Implementation
- Start with small batches (3-5 tasks)
- Review each batch before continuing
- Fix issues immediately

### Better Quality
- Run `/qa-check` frequently
- Keep PRPROMPTS guides open for reference
- Review generated code
- Add team-specific validation gates

## Integration with Team Workflow

### Git Workflow
Automation creates proper commits:
```bash
# Commits follow conventional format
feat(auth): implement JWT verification
fix(payment): tokenize credit cards
test(user): add widget tests for profile
```

### CI/CD Integration
QA checks can run in CI:
```bash
# In your CI pipeline
flutter test --coverage
flutter analyze --fatal-infos
# Check coverage >= 70%
```

### Code Review
Use QA report for reviews:
```bash
# Generate before creating PR
/qa-check
# Share docs/QA_REPORT.md with team
```

### Team Onboarding
New developers:
1. Read generated ARCHITECTURE.md
2. Review IMPLEMENTATION_PLAN.md
3. Read @PRPROMPTS/07-junior_onboarding.md
4. Run `/implement-next` for first task

## Advanced Usage

### Selective Implementation
```bash
# Implement only specific phase
/full-cycle
# When prompted, specify phase 1 tasks only
```

### Custom Validation
Edit `.claude/commands/automation/review-and-commit.md`:
```markdown
## Team-Specific Checks
- [ ] Jira ticket referenced
- [ ] Design approved
- [ ] API contract verified
```

### Integration with Tools
```bash
# After each commit, run custom checks
git commit -m "..."
./scripts/run-team-checks.sh
```

## Complete Example: Fintech App

```bash
# Day 1: Setup (5 minutes)
cd ~/projects/fintech-app
flutter create .
cp ~/.prprompts/templates/fintech.md project_description.md

# Generate everything
prprompts auto && prprompts generate

# Bootstrap with PCI-DSS compliance
claude
/bootstrap-from-prprompts

# Day 1-2: Core features (2-4 hours)
/full-cycle
10

# Review progress
git log --oneline
cat docs/IMPLEMENTATION_PLAN.md

# Day 2-3: Remaining features (4-6 hours)
/full-cycle
15

# Pre-launch: QA audit
/qa-check

# Result: docs/QA_REPORT.md shows compliance
# - PCI-DSS: ✓
# - Security: 40/40
# - Tests: 85% coverage
# - Ready for launch!
```

## Learn More

- [PRPROMPTS Specification](./PRPROMPTS-SPECIFICATION.md)
- [Claude Code Commands](./CLAUDE-COMMANDS.md)
- [Qwen Code Commands](./QWEN-COMMANDS.md)
- [Gemini CLI Commands](./GEMINI-COMMANDS.md)
- [Security Guide](../PRPROMPTS/16-security_and_compliance.md)
- [AI Comparison](./AI-COMPARISON.md)

## Support

For issues with automation:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [GitHub Issues](https://github.com/Kandil7/prprompts-flutter-generator/issues)
3. Create new issue with:
   - Command used
   - Error message
   - docs/QA_REPORT.md (if generated)

---

**Made with ❤️ for Flutter developers**

The automation workflow turns your PRD into production-ready code following all PRPROMPTS best practices automatically.
