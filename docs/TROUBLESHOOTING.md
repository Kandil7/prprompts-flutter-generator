# PRPROMPTS Generator - Troubleshooting Guide

Common issues and solutions for the PRD-to-PRPROMPTS Generator.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Command Not Found Errors](#command-not-found-errors)
- [PRD Generation Problems](#prd-generation-problems)
- [PRPROMPTS Generation Issues](#prprompts-generation-issues)
- [Platform-Specific Issues](#platform-specific-issues)
- [Performance Issues](#performance-issues)
- [AI Assistant Issues](#ai-assistant-issues)
- [Common Error Messages](#common-error-messages)

---

## Installation Issues

### Issue: Claude Code not installed

**Error:**
```
bash: claude: command not found
```

**Solution:**

```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

**Alternative (if npm install fails):**

```bash
# macOS/Linux - Install Node.js first
brew install node  # macOS
# or
sudo apt install nodejs npm  # Ubuntu/Debian

# Windows - Download Node.js from https://nodejs.org

# Then install Claude Code
npm install -g @anthropic-ai/claude-code
```

---

### Issue: Commands not found after installation

**Error:**
```
claude create-prd: command not found
```

**Diagnosis:**

```bash
# Check if config directory exists
ls ~/.config/claude/prompts/  # macOS/Linux
dir %USERPROFILE%\.config\claude\prompts\  # Windows

# Check config file
cat ~/.config/claude/config.yml  # macOS/Linux
type %USERPROFILE%\.config\claude\config.yml  # Windows
```

**Solution:**

```bash
# Re-run installer
cd prprompts-flutter-generator

# Linux/macOS
./scripts/install-commands.sh --global

# Windows (Batch)
scripts\install-commands.bat --global

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File .\scripts\install-commands.ps1 --global

# Verify files were copied
ls ~/.config/claude/prompts/  # Should show all .md files
```

---

### Issue: Permission denied

**Error:**
```
mkdir: cannot create directory '~/.config/claude': Permission denied
```

**Solution:**

```bash
# Check directory ownership
ls -la ~/.config/

# Fix permissions
sudo chown -R $USER:$USER ~/.config/claude

# Or use sudo for installation (not recommended)
sudo ./scripts/install-commands.sh --global
```

---

## Command Not Found Errors

### Issue: `claude` command not in PATH

**Error:**
```
zsh: command not found: claude
```

**Solution:**

```bash
# Find npm global bin directory
npm bin -g

# Add to PATH in ~/.bashrc or ~/.zshrc
echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.bashrc
source ~/.bashrc

# Or for zsh
echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

### Issue: Aliases not working

**Error:**
```
bash: prp-gen: command not found
```

**Solution:**

```bash
# Check if aliases are loaded
type prp-gen

# Load aliases manually
source scripts/prp-aliases.sh

# Or add to ~/.bashrc permanently
echo "source $(pwd)/scripts/prp-aliases.sh" >> ~/.bashrc
source ~/.bashrc

# Verify
alias | grep prp
```

---

## PRD Generation Problems

### Issue: Auto-generate PRD fails with "No description found"

**Error:**
```
Error: Could not find project_description.md
```

**Solution:**

```bash
# Check if file exists
ls project_description.md

# If missing, create it
cat > project_description.md << 'EOF'
# My Project

Brief description of the project.

## Features
1. Feature 1
2. Feature 2
EOF

# Re-run
claude auto-gen-prd
```

---

### Issue: PRD validation fails

**Error:**
```
Error: PRD missing required YAML frontmatter
```

**Solution:**

```bash
# Check PRD structure
head -20 docs/PRD.md

# Ensure YAML frontmatter exists
cat > docs/PRD.md << 'EOF'
---
project_name: "MyApp"
project_type: "healthcare"
platforms: ["ios", "android"]
compliance: ["hipaa"]
---

# MyApp PRD
...
EOF
```

**Required YAML Fields:**
- `project_name`
- `project_type`
- `platforms`
- `compliance` (can be empty array)

---

### Issue: Interactive PRD creation stuck

**Symptoms:**
- Prompt hangs after question
- No response after entering text

**Solution:**

```bash
# Check Claude Code connection
claude --version

# Restart Claude Code
# (Usually press Ctrl+C and retry)

# If persistent, use alternative method
./scripts/auto-gen-prd.sh
```

---

### Issue: PRD from files doesn't read my files

**Error:**
```
Error: Could not read file: docs/requirements.md
```

**Diagnosis:**

```bash
# Check file exists and is readable
ls -la docs/requirements.md

# Check file encoding (should be UTF-8)
file docs/requirements.md
```

**Solution:**

```bash
# Convert to UTF-8 if needed
iconv -f ISO-8859-1 -t UTF-8 docs/requirements.md > docs/requirements-utf8.md

# Use absolute paths if relative paths fail
claude prd-from-files
# Then enter: /full/path/to/docs/requirements.md

# Or check permissions
chmod 644 docs/requirements.md
```

---

## PRPROMPTS Generation Issues

### Issue: PRPROMPTS generation fails with "PRD not found"

**Error:**
```
Error: docs/PRD.md not found. Please create a PRD first.
```

**Solution:**

```bash
# Check if PRD exists
ls docs/PRD.md

# If missing, create one
claude create-prd
# or
claude auto-gen-prd

# Verify PRD is valid
cat docs/PRD.md
```

---

### Issue: Generated files have missing content

**Symptoms:**
- Files generated but very short
- Missing EXAMPLES or CONSTRAINTS sections

**Diagnosis:**

```bash
# Check file sizes
ls -lh PRPROMPTS/

# Files should be 500-600 words (~3-5 KB each)
# If files are < 1 KB, something went wrong
```

**Solution:**

```bash
# Regenerate with verbose mode
claude gen-prprompts --verbose

# Or regenerate specific files
claude gen-file security_and_compliance

# Check PRD has all required fields
grep -A 10 "^---" docs/PRD.md
```

---

### Issue: Files not customized for my PRD

**Symptoms:**
- Generic examples instead of project-specific
- No compliance-specific content despite YAML field

**Solution:**

```bash
# Verify PRD YAML frontmatter
head -30 docs/PRD.md

# Ensure compliance field is set
# WRONG:
compliance: ""

# CORRECT:
compliance: ["hipaa", "gdpr"]

# Regenerate after fixing PRD
claude gen-prprompts
```

---

### Issue: Generation hangs or times out

**Symptoms:**
- Command runs but never completes
- "Generating..." message for > 5 minutes

**Solution:**

```bash
# Check Claude Code status
claude --version

# Try generating by phase instead
claude gen-phase-1  # Should take ~30 seconds
claude gen-phase-2
claude gen-phase-3

# Check rate limits (if using API)
# Wait 60 seconds and retry

# Or use Qwen/Gemini as fallback
qwen gen-prprompts
```

---

## Platform-Specific Issues

### Windows-Specific

#### Issue: Batch script doesn't run

**Error:**
```
'scripts\install-commands.bat' is not recognized as an internal or external command
```

**Solution:**

```cmd
REM Use full path
cd K:\tools\cli-tools\prprompts-flutter-generator
scripts\install-commands.bat --global

REM Or use PowerShell
powershell -ExecutionPolicy Bypass -File .\scripts\install-commands.ps1 --global

REM Or use Git Bash
bash ./scripts/install-commands.sh --global
```

---

#### Issue: PowerShell execution policy blocked

**Error:**
```
File cannot be loaded because running scripts is disabled on this system
```

**Solution:**

```powershell
# Bypass execution policy for this session
powershell -ExecutionPolicy Bypass -File .\scripts\install-commands.ps1 --global

# Or change policy (requires admin)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

#### Issue: Path with spaces

**Error:**
```
The system cannot find the path specified.
```

**Solution:**

```cmd
REM Use quotes around paths
cd "C:\Users\My Name\projects\prprompts-flutter-generator"
scripts\install-commands.bat --global

REM Or use short path
cd C:\Users\MYNAME~1\projects\PRPROM~1
```

---

### macOS-Specific

#### Issue: Permission denied on scripts

**Error:**
```
zsh: permission denied: ./scripts/install-commands.sh
```

**Solution:**

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Or run with bash
bash ./scripts/install-commands.sh --global
```

---

#### Issue: macOS blocks unsigned script

**Error:**
```
"install-commands.sh" cannot be opened because it is from an unidentified developer
```

**Solution:**

```bash
# Remove quarantine attribute
xattr -d com.apple.quarantine scripts/install-commands.sh

# Or allow in System Preferences
# System Preferences > Security & Privacy > General > "Allow anyway"
```

---

### Linux-Specific

#### Issue: Missing dependencies

**Error:**
```
bash: curl: command not found
```

**Solution:**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install curl git nodejs npm

# Fedora/RHEL
sudo dnf install curl git nodejs npm

# Arch
sudo pacman -S curl git nodejs npm
```

---

## Performance Issues

### Issue: Generation takes too long (> 5 minutes)

**Causes:**
- Slow network connection
- API rate limiting
- Large PRD file

**Solution:**

```bash
# 1. Generate by phase to identify bottleneck
time claude gen-phase-1  # Should be ~30 seconds
time claude gen-phase-2
time claude gen-phase-3

# 2. Use faster AI model
gemini gen-prprompts  # Gemini is faster, free tier

# 3. Check network
ping claude.ai

# 4. Simplify PRD if it's very long (> 10 pages)
```

---

### Issue: High memory usage

**Symptoms:**
- System slowdown during generation
- Out of memory errors

**Solution:**

```bash
# Generate files one by one
for file in feature_scaffold responsive_layout bloc_implementation; do
  claude gen-file $file
done

# Or use lighter AI model
qwen gen-prprompts  # Uses less memory

# Close other applications
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
claude gen-prprompts
```

---

## AI Assistant Issues

### Claude Code Issues

#### Issue: Rate limit exceeded

**Error:**
```
Error: Rate limit exceeded. Please try again in 60 seconds.
```

**Solution:**

```bash
# Wait 60 seconds
sleep 60

# Or use Qwen/Gemini as alternative
qwen gen-prprompts
gemini gen-prprompts

# Or upgrade Claude plan for higher limits
```

---

#### Issue: Context limit exceeded

**Error:**
```
Error: Input too long. Please reduce PRD size.
```

**Solution:**

```bash
# Check PRD size
wc -l docs/PRD.md

# If > 1000 lines, split into phases
claude gen-phase-1
# Review and approve
claude gen-phase-2
# Review and approve
claude gen-phase-3
```

---

### Qwen Code Issues

#### Issue: Qwen commands not found

**Error:**
```
qwen: command not found
```

**Solution:**

```bash
# Install Qwen Code first
# See QWEN.md for installation

# Or install commands
./scripts/install-qwen-commands.sh --global
```

---

### Gemini CLI Issues

#### Issue: Gemini authentication fails

**Error:**
```
Error: Not authenticated. Please run 'gemini auth login'
```

**Solution:**

```bash
# Authenticate Gemini CLI
gemini auth login

# Follow browser prompt to authenticate

# Verify
gemini auth status

# Then retry
gemini gen-prprompts
```

---

## Common Error Messages

### Error: "YAML parsing failed"

**Cause:** Invalid YAML syntax in PRD frontmatter

**Solution:**

```bash
# Check YAML syntax
head -30 docs/PRD.md

# Common issues:
# 1. Missing quotes around strings with special chars
project_name: MyApp: The Best  # ❌ WRONG
project_name: "MyApp: The Best"  # ✅ CORRECT

# 2. Wrong array syntax
platforms: ios, android  # ❌ WRONG
platforms: ["ios", "android"]  # ✅ CORRECT

# 3. Inconsistent indentation
compliance:
  - hipaa  # ❌ WRONG (mixed spaces/tabs)
compliance:
  - hipaa  # ✅ CORRECT (2 spaces)
```

---

### Error: "Command not registered in config.yml"

**Cause:** Prompt file not registered in Claude Code config

**Solution:**

```bash
# Check config.yml
cat ~/.config/claude/config.yml

# Should contain:
prompts:
  create-prd:
    file: "prompts/generate-prd.md"
    description: "Interactive PRD creation wizard"

# Re-run installer to fix
./scripts/install-commands.sh --global
```

---

### Error: "File already exists"

**Cause:** PRPROMPTS directory already exists

**Solution:**

```bash
# Option 1: Backup and regenerate
mv PRPROMPTS PRPROMPTS.backup
claude gen-prprompts

# Option 2: Force overwrite (if supported)
claude gen-prprompts --force

# Option 3: Manually delete
rm -rf PRPROMPTS
claude gen-prprompts
```

---

### Error: "Network error"

**Cause:** Cannot connect to Claude AI API

**Solution:**

```bash
# Check internet connection
ping claude.ai

# Check Claude Code status
claude --version

# Try with different network
# (switch from WiFi to mobile hotspot)

# Or use offline mode with local model (if available)
qwen gen-prprompts  # If running Qwen locally
```

---

## Getting More Help

### Collect Diagnostic Information

```bash
# System info
uname -a  # macOS/Linux
systeminfo  # Windows

# Node.js version
node --version
npm --version

# Claude Code version
claude --version

# Check installation
ls ~/.config/claude/prompts/
cat ~/.config/claude/config.yml

# Check PRD
cat docs/PRD.md

# Check error logs (if available)
cat ~/.claude/logs/error.log
```

---

### Enable Verbose Mode

```bash
# Run with verbose output
claude gen-prprompts --verbose

# Or with debug
export DEBUG=claude:*
claude gen-prprompts
```

---

### Report an Issue

If you've tried the solutions above and still have issues:

1. **GitHub Issues:** [github.com/Kandil7/prprompts-flutter-generator/issues](https://github.com/Kandil7/prprompts-flutter-generator/issues)

2. **Include in your report:**
   - Operating system and version
   - Node.js version (`node --version`)
   - Claude Code version (`claude --version`)
   - Command you ran
   - Full error message
   - PRD.md (if relevant)
   - Output of diagnostic commands above

3. **Template:**

```markdown
## Environment
- OS: macOS 13.2
- Node.js: v18.16.0
- Claude Code: v1.5.0

## Command
```bash
claude gen-prprompts
```

## Error
```
Error: YAML parsing failed
Line 5: unexpected token
```

## PRD.md (first 30 lines)
```yaml
---
project_name: MyApp
...
```

## What I've tried
- Reinstalled Claude Code
- Checked YAML syntax
- ...
```

---

## Quick Troubleshooting Checklist

```bash
# 1. Verify installation
claude --version  # Should show version number
ls ~/.config/claude/prompts/  # Should show .md files

# 2. Verify PRD
ls docs/PRD.md  # Should exist
head -30 docs/PRD.md  # Should have YAML frontmatter

# 3. Test simple command
claude create-prd --help  # Should show help text

# 4. Regenerate config
./scripts/install-commands.sh --global

# 5. Try alternative
qwen gen-prprompts  # Or gemini gen-prprompts

# 6. Check logs
cat ~/.claude/logs/error.log  # If exists
```

---

## Related Documentation

- [Usage Guide](USAGE.md) - How to use the generator
- [Customization Guide](CUSTOMIZATION.md) - Customize for your needs
- [API Reference](API.md) - Command reference
- [Windows Guide](../WINDOWS.md) - Windows-specific instructions
- [Qwen Guide](../QWEN.md) - Qwen Code setup
- [Gemini Guide](../GEMINI.md) - Gemini CLI setup

---

## FAQ

**Q: Can I use this without Claude Code?**

A: Yes! You can use Qwen Code or Gemini CLI. See [QWEN.md](../QWEN.md) and [GEMINI.md](../GEMINI.md).

**Q: Can I run this offline?**

A: Partially. You can use locally-hosted Qwen Code for offline generation. Claude Code requires internet connection.

**Q: Does this work with Flutter 2.x?**

A: Generator is designed for Flutter 3.24+, but you can manually edit templates for Flutter 2.x compatibility.

**Q: Can I use this for React Native/SwiftUI/Jetpack Compose?**

A: Not directly. The generator is Flutter-specific, but you can fork and customize for other frameworks.

**Q: How do I update to latest version?**

```bash
cd prprompts-flutter-generator
git pull origin master
./scripts/install-commands.sh --global
```

---

**Still stuck? [Open an issue](https://github.com/Kandil7/prprompts-flutter-generator/issues) with details!**
