# Testing PRPROMPTS Generator Commands

This guide helps you test and verify that all commands work correctly across Claude Code, Qwen Code, and Gemini CLI.

## Prerequisites

Before testing, ensure you have at least one AI assistant installed:

### Option 1: Claude Code
```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

### Option 2: Qwen Code
```bash
# Follow installation instructions at:
# https://github.com/QwenLM/qwen-code
qwen --version
```

### Option 3: Gemini CLI
```bash
# Follow installation instructions at:
# https://developers.google.com/gemini-code-assist/docs/gemini-cli
gemini --version
gemini auth login  # Authenticate if needed
```

---

## Installation

Install commands for your preferred AI assistant:

```bash
# For Claude Code
./scripts/install-commands.sh --global

# For Qwen Code
./scripts/install-qwen-commands.sh --global

# For Gemini CLI
./scripts/install-gemini-commands.sh --global

# Or install all three at once
./scripts/install-all.sh --global
```

**Windows users:**
```cmd
REM For Claude Code
scripts\install-commands.bat --global

REM For Qwen Code
scripts\install-qwen-commands.bat --global

REM For Gemini CLI
scripts\install-gemini-commands.bat --global
```

---

## Verification Tests

### Test 1: Verify Installation

Check if commands are registered:

```bash
# Claude Code
claude create-prd --help
claude gen-prprompts --help

# Qwen Code
qwen create-prd --help
qwen gen-prprompts --help

# Gemini CLI
gemini create-prd --help
gemini gen-prprompts --help
```

**Expected output:** Help text or command description (not "command not found")

---

### Test 2: Check Config Files

Verify configs are in the right location:

```bash
# Claude Code (macOS/Linux)
ls ~/.config/claude/prompts/
cat ~/.config/claude/config.yml

# Claude Code (Windows)
dir %USERPROFILE%\.config\claude\prompts\
type %USERPROFILE%\.config\claude\config.yml

# Qwen Code
ls ~/.config/qwen/prompts/
cat ~/.config/qwen/config.yml

# Gemini CLI
ls ~/.config/gemini/prompts/
cat ~/.config/gemini/config.yml
```

**Expected:** 9 prompt files (`.md`) and 1 config file (`.yml`) for each AI

---

### Test 3: Create Test PRD

Test the auto-generate PRD command:

```bash
# Step 1: Create a test description
cat > test_project_description.md << 'EOF'
# TestApp

A simple todo list app for testing PRPROMPTS generator.

## Users
- Regular users who need to track tasks

## Features
1. Add/edit/delete todos
2. Mark tasks as complete
3. Filter by status
4. Offline support
EOF

# Step 2: Test with Claude Code
cd /tmp/test-prprompts-claude
claude auto-gen-prd

# Step 3: Test with Qwen Code
cd /tmp/test-prprompts-qwen
qwen auto-gen-prd

# Step 4: Test with Gemini CLI
cd /tmp/test-prprompts-gemini
gemini auto-gen-prd
```

**Expected:** Creates `docs/PRD.md` with YAML frontmatter

---

### Test 4: Analyze PRD

Test PRD validation:

```bash
# Claude Code
claude analyze-prd

# Qwen Code
qwen analyze-prd

# Gemini CLI
gemini analyze-prd
```

**Expected output:**
```
✅ YAML frontmatter valid
✅ All required fields present
✅ PRD structure complete
```

---

### Test 5: Generate Single Phase

Test phase-based generation:

```bash
# Claude Code - Phase 1
claude gen-phase-1

# Qwen Code - Phase 1
qwen gen-phase-1

# Gemini CLI - Phase 1
gemini gen-phase-1
```

**Expected:** Creates 10 files in `PRPROMPTS/` directory:
- `01-feature_scaffold.md`
- `02-responsive_layout.md`
- ... through `10-performance_optimization.md`

---

### Test 6: Generate All PRPROMPTS

Full generation test:

```bash
# Claude Code
claude gen-prprompts

# Qwen Code
qwen gen-prprompts

# Gemini CLI
gemini gen-prprompts
```

**Expected:** Creates 33 files in `PRPROMPTS/`:
- 32 numbered guides (`01-*.md` through `32-*.md`)
- 1 README (`README.md`)

**Verification:**
```bash
ls PRPROMPTS/*.md | wc -l  # Should output: 33
```

---

### Test 7: Interactive PRD Creation

Test interactive wizard:

```bash
# Claude Code
claude create-prd

# Answer the 10 questions when prompted:
# 1. Project name: TestApp
# 2. Project type: productivity
# 3. Platforms: ios, android
# 4. Compliance: none
# 5. Authentication: jwt
# 6. Offline support: yes
# 7. Real-time updates: no
# 8. Sensitive data: none
# 9. Team size: small
# 10. Demo frequency: weekly

# Qwen Code
qwen create-prd
# (same questions)

# Gemini CLI
gemini create-prd
# (same questions)
```

**Expected:** Creates `docs/PRD.md` with your answers in YAML frontmatter

---

### Test 8: Generate from Files

Test PRD generation from existing docs:

```bash
# Create test files
mkdir -p test-docs
cat > test-docs/requirements.md << 'EOF'
# Requirements

## User Stories
- As a user, I want to track my daily tasks
- As a user, I want to sync across devices

## Technical Requirements
- Offline-first architecture
- End-to-end encryption
EOF

cat > test-docs/features.md << 'EOF'
# Features

1. Task Management
2. Categories
3. Reminders
4. Cloud Sync
EOF

# Test with Claude Code
claude prd-from-files
# When prompted, enter:
# test-docs/requirements.md
# test-docs/features.md
# (press Enter twice)

# Test with Qwen Code
qwen prd-from-files
# (same input)

# Test with Gemini CLI
gemini prd-from-files
# (same input)
```

**Expected:** Creates `docs/PRD.md` by combining information from both files

---

### Test 9: Generate Single File

Test single file generation:

```bash
# Claude Code
claude gen-file security_and_compliance

# Qwen Code
qwen gen-file security_and_compliance

# Gemini CLI
gemini gen-file security_and_compliance
```

**Expected:** Creates `PRPROMPTS/16-security_and_compliance.md`

---

## Cross-AI Compatibility Test

Test the same PRD across all three AIs:

```bash
# 1. Create PRD with Claude
cd /tmp/cross-ai-test
claude auto-gen-prd

# 2. Generate PRPROMPTS with each AI
cp -r . /tmp/test-claude && cd /tmp/test-claude
claude gen-prprompts

cp -r /tmp/cross-ai-test /tmp/test-qwen && cd /tmp/test-qwen
qwen gen-prprompts

cp -r /tmp/cross-ai-test /tmp/test-gemini && cd /tmp/test-gemini
gemini gen-prprompts

# 3. Compare outputs
diff -r /tmp/test-claude/PRPROMPTS /tmp/test-qwen/PRPROMPTS
diff -r /tmp/test-claude/PRPROMPTS /tmp/test-gemini/PRPROMPTS
```

**Expected:** Outputs should be similar (minor variations are acceptable)

---

## Performance Comparison

Test generation speed across AIs:

```bash
# Claude Code
time claude gen-prprompts  # Expect: 60-90 seconds

# Qwen Code (faster due to local model)
time qwen gen-prprompts    # Expect: 30-60 seconds

# Gemini CLI (fastest on free tier)
time gemini gen-prprompts  # Expect: 20-40 seconds
```

---

## Troubleshooting

### Command not found

**Problem:** `claude create-prd: command not found`

**Solution:**
```bash
# Re-run installer
./scripts/install-commands.sh --global

# Verify config location
ls ~/.config/claude/config.yml

# Check if prompts directory exists
ls ~/.config/claude/prompts/
```

---

### Config file not found

**Problem:** Commands run but can't find prompts

**Solution:**
```bash
# Check config file location
# macOS/Linux: ~/.config/claude/config.yml
# Windows: %USERPROFILE%\.config\claude\config.yml

# Verify prompt paths in config
cat ~/.config/claude/config.yml
```

---

### AI not installed

**Problem:** `claude: command not found`

**Solution:**
```bash
# Install the AI assistant first
npm install -g @anthropic-ai/claude-code

# Then install commands
./scripts/install-commands.sh --global
```

---

### PRD not found

**Problem:** `Error: docs/PRD.md not found`

**Solution:**
```bash
# Generate PRD first
claude auto-gen-prd
# OR
claude create-prd

# Then generate PRPROMPTS
claude gen-prprompts
```

---

### Permission denied (macOS/Linux)

**Problem:** `Permission denied: ./scripts/install-commands.sh`

**Solution:**
```bash
# Make script executable
chmod +x scripts/install-commands.sh

# Or run with bash
bash ./scripts/install-commands.sh --global
```

---

### Gemini authentication

**Problem:** `Error: Not authenticated`

**Solution:**
```bash
# Authenticate Gemini CLI
gemini auth login

# Follow browser prompts
# Then retry command
gemini gen-prprompts
```

---

## Automated Test Suite

Run all validation tests:

```bash
# Full validation
npm test

# Quick check
npm run test:quick
```

**Expected output:**
```
==================================================
 PRPROMPTS Generator - Validation Tests
==================================================

Test 1: Checking Claude prompt files...
✓ Found 9/9 Claude prompt files
Test 2: Checking Qwen prompt files...
✓ Found 9/9 Qwen prompt files
Test 3: Checking Gemini prompt files...
✓ Found 9/9 Gemini prompt files
...
==================================================
✅ All validation tests passed!
==================================================
```

---

## Success Criteria

All tests should pass with:

✅ Commands registered and callable
✅ Config files in correct locations
✅ PRD generated with YAML frontmatter
✅ All 33 PRPROMPTS files created
✅ Files follow v2.0 PRP pattern (6 sections)
✅ Real code examples (not placeholders)
✅ 500-600 words per file
✅ PRD-driven customizations applied

---

## Support

If tests fail:
1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Verify installation: `npm test`
3. Review AI-specific docs:
   - [CLAUDE-COMMANDS.md](docs/CLAUDE-COMMANDS.md)
   - [QWEN-COMMANDS.md](docs/QWEN-COMMANDS.md)
   - [GEMINI-COMMANDS.md](docs/GEMINI-COMMANDS.md)
4. [Open an issue](https://github.com/Kandil7/prprompts-flutter-generator/issues)

---

## Next Steps

Once all tests pass:

1. **Read Usage Guide:** [docs/USAGE.md](docs/USAGE.md)
2. **Customize for your team:** [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md)
3. **Start your project:**
   ```bash
   cd your-flutter-project
   claude create-prd
   claude gen-prprompts
   cat PRPROMPTS/README.md
   ```

Happy coding! 🚀
