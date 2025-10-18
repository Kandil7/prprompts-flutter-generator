# PRPROMPTS Troubleshooting Guide

This guide helps you diagnose and fix common issues with PRPROMPTS v4.0.

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [PRD Creation Problems](#prd-creation-problems)
- [PRPROMPTS Generation Issues](#prprompts-generation-issues)
- [Extension Installation Problems](#extension-installation-problems)
- [Automation Command Issues](#automation-command-issues)
- [Performance Problems](#performance-problems)
- [Platform-Specific Issues](#platform-specific-issues)
- [Getting Help](#getting-help)

---

## Installation Issues

### Issue: `npm install -g prprompts-flutter-generator` fails

**Symptoms:**
```
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules
npm ERR! Error: EACCES: permission denied
```

**Solutions:**

**Option 1 (Recommended): Use nvm (Node Version Manager)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js
nvm install 20
nvm use 20

# Install PRPROMPTS
npm install -g prprompts-flutter-generator
```

**Option 2: Use sudo (not recommended)**
```bash
sudo npm install -g prprompts-flutter-generator
```

**Option 3: Change npm global directory**
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

npm install -g prprompts-flutter-generator
```

---

### Issue: Wrong Node.js version

**Symptoms:**
```
Error: The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check current version
node --version

# Install Node.js 18 or 20
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x

# Reinstall PRPROMPTS
npm install -g prprompts-flutter-generator
```

---

### Issue: Command not found after installation

**Symptoms:**
```bash
prprompts --version
# zsh: command not found: prprompts
```

**Solution:**

**Check installation location:**
```bash
npm list -g --depth=0 | grep prprompts
```

**If installed, add to PATH:**
```bash
# For bash
echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.bashrc
source ~/.bashrc

# For zsh
echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
which prprompts
prprompts --version
```

---

## PRD Creation Problems

### Issue: Interactive wizard hangs or freezes

**Symptoms:**
- `prprompts create` starts but doesn't show prompts
- Cursor blinks but nothing happens

**Solutions:**

**1. Check terminal compatibility:**
```bash
# Try with basic input
echo "test" | prprompts create
```

**2. Use auto mode instead:**
```bash
prprompts auto
```

**3. Create PRD manually:**
```bash
mkdir -p docs
prprompts manual
```

**4. Update terminal:**
```bash
# macOS: Update Terminal.app or use iTerm2
# Windows: Use Windows Terminal instead of CMD
# Linux: Update your terminal emulator
```

---

### Issue: PRD file not created

**Symptoms:**
```
✓ PRD created successfully
# But docs/PRD.md doesn't exist
```

**Solution:**

**Check current directory:**
```bash
pwd
ls -la

# PRD should be in current directory
ls docs/PRD.md
```

**If missing, check permissions:**
```bash
# Check write permissions
ls -ld .
mkdir -p docs
touch docs/test.txt
```

**Create manually if needed:**
```bash
mkdir -p docs
nano docs/PRD.md
# Or use prprompts manual
```

---

## PRPROMPTS Generation Issues

### Issue: `prprompts generate` fails with "PRD not found"

**Symptoms:**
```
Error: PRD file not found at docs/PRD.md
```

**Solutions:**

**1. Verify PRD location:**
```bash
# Check if PRD exists
ls -la docs/PRD.md

# If not, create one
prprompts create
```

**2. Specify custom PRD location:**
```bash
prprompts generate --prd-path ./custom/path/PRD.md
```

**3. Use example PRD:**
```bash
# Copy example PRD
cp node_modules/prprompts-flutter-generator/examples/healthcare-prd.md docs/PRD.md

# Generate
prprompts generate
```

---

### Issue: Only some PRPROMPTS files are generated

**Symptoms:**
```
✓ Generated 15/32 PRPROMPTS
✗ 17 files failed to generate
```

**Solutions:**

**1. Check disk space:**
```bash
df -h .
```

**2. Check file permissions:**
```bash
ls -la .claude/prompts/
chmod -R u+w .claude/
```

**3. Regenerate with verbose output:**
```bash
DEBUG=true prprompts generate
```

**4. Clear and regenerate:**
```bash
rm -rf .claude/prompts/prprompts/
prprompts generate
```

---

## Extension Installation Problems

### Issue: Extension not found by AI assistant

**Symptoms:**
- Commands like `/prp-bootstrap` not recognized
- AI says "I don't have access to that command"

**Solutions:**

**For Claude Code:**
```bash
# Check if extension installed
ls ~/.config/claude/prompts/prprompts/
ls ~/.config/claude/commands/

# If missing, reinstall
bash install-claude-extension.sh

# Verify
ls ~/.config/claude/commands/ | grep prp
```

**For Qwen Code:**
```bash
# Check installation
ls ~/.qwen/prompts/prprompts/

# Reinstall if needed
bash install-qwen-extension.sh
```

**For Gemini CLI:**
```bash
# Check installation
ls ~/.gemini/prompts/prprompts/

# Reinstall if needed
bash install-gemini-extension.sh
```

---

### Issue: Permission denied during extension installation

**Symptoms:**
```
bash: ./install-claude-extension.sh: Permission denied
```

**Solution:**
```bash
# Make executable
chmod +x install-claude-extension.sh
chmod +x install-qwen-extension.sh
chmod +x install-gemini-extension.sh

# Run
bash install-claude-extension.sh
```

---

### Issue: Extension installed but commands still not working

**Symptoms:**
- Extension files exist
- Commands still not recognized

**Solutions:**

**1. Restart AI assistant:**
- Close and reopen Claude Code/Qwen Code/Gemini CLI

**2. Check command format:**
```
# Correct
/prp-bootstrap-from-prprompts

# Incorrect
prp-bootstrap  (missing /)
/prp bootstrap  (extra space)
```

**3. Verify prompt files:**
```bash
# Check content of prompt files
cat ~/.config/claude/prompts/prprompts/automation/bootstrap-from-prprompts.md
```

**4. Manual command registration:**
```bash
# For Claude Code, check commands.json
cat ~/.config/claude/commands/prp-bootstrap.json
```

---

## Automation Command Issues

### Issue: `/prp-bootstrap` creates incomplete project

**Symptoms:**
- Some folders missing
- Dependencies not added
- Tests not created

**Solutions:**

**1. Check PRD quality:**
```bash
# Make sure PRD has all required sections
cat docs/PRD.md

# Should include:
# - Project Overview
# - Features
# - Technical Requirements
# - Compliance needs
```

**2. Re-run with explicit instructions:**
```
/prp-bootstrap-from-prprompts

Create complete Flutter project with:
- Clean Architecture
- BLoC state management
- All 32 PRPROMPTS implemented
- Test infrastructure
- [Your specific requirements]
```

**3. Run generate again:**
```bash
# Ensure all PRPROMPTS are present
prprompts validate
prprompts generate
```

---

### Issue: `/prp-full-cycle` produces errors

**Symptoms:**
```
Error: Feature implementation failed
Dependency conflicts
Test failures
```

**Solutions:**

**1. Check existing code:**
- Make sure base architecture exists
- Verify dependencies are installed
- Check for naming conflicts

**2. Be more specific:**
```
# Too vague
/prp-full-cycle Add user authentication

# Better
/prp-full-cycle Create user authentication feature with:
- Email/password login
- OAuth (Google, Apple)
- JWT token management
- Secure storage
- BLoC state management
- Unit + widget + integration tests
```

**3. Run in stages:**
```
# Stage 1: Models and repositories
/prp-implement-next Focus on domain and data layers for authentication

# Stage 2: Business logic
/prp-implement-next Add BLoC for authentication

# Stage 3: UI
/prp-implement-next Create authentication UI screens

# Stage 4: Tests
/prp-implement-next Add comprehensive tests
```

---

## Performance Problems

### Issue: Slow PRD creation

**Solution:**
```bash
# Use faster creation methods

# Option 1: Auto mode (AI-generated)
prprompts auto  # Faster than interactive

# Option 2: From existing docs
prprompts from-files --dir ./requirements/

# Option 3: Manual (instant)
prprompts manual
```

---

### Issue: Slow PRPROMPTS generation

**Symptoms:**
- `prprompts generate` takes >30 seconds

**Solutions:**

**1. Check disk I/O:**
```bash
# Monitor disk usage
iostat 1

# Check for slow disk
sudo smartctl -a /dev/sda
```

**2. Use SSD if available:**
```bash
# Move project to SSD
mv project /path/to/ssd/
```

**3. Disable antivirus temporarily:**
- Some antivirus software slows file creation

---

### Issue: AI automation commands are slow

**Symptoms:**
- `/prp-bootstrap` takes >20 minutes
- `/prp-full-cycle` times out

**Solutions:**

**1. Use faster AI model:**
- Gemini CLI (fastest for prototyping)
- Qwen Code (balanced)
- Claude Code (highest quality but slower)

**2. Break down large features:**
```
# Instead of one large command
/prp-full-cycle Build complete e-commerce platform

# Use multiple smaller commands
/prp-full-cycle Build product catalog
/prp-full-cycle Build shopping cart
/prp-full-cycle Build checkout
```

**3. Check internet connection:**
- AI commands require internet
- Slow connection = slow responses

---

## Platform-Specific Issues

### Windows Issues

#### Issue: Scripts not working on Windows

**Symptoms:**
```
'bash' is not recognized as an internal or external command
```

**Solutions:**

**Option 1: Use Windows equivalents**
```cmd
REM Instead of bash scripts
scripts\test-commands.bat
scripts\test-integration.bat
```

**Option 2: Install Git Bash**
```bash
# Download from https://git-scm.com/download/win
# Then use Git Bash terminal

bash scripts/test-commands.sh
```

**Option 3: Use WSL (Windows Subsystem for Linux)**
```bash
wsl --install
# Then use Linux commands normally
```

---

#### Issue: Path issues on Windows

**Symptoms:**
```
Error: Cannot find path '.claude\prompts\'
```

**Solution:**
```javascript
// PRPROMPTS handles this automatically, but if you see issues:

// Use platform-agnostic paths
const path = require('path');
const promptPath = path.join(process.env.HOME, '.claude', 'prompts');

// Or specify Windows path explicitly
const windowsPath = 'C:\\Users\\YourName\\.claude\\prompts';
```

---

### macOS Issues

#### Issue: Permission errors on macOS Catalina+

**Symptoms:**
```
Operation not permitted
```

**Solution:**
```bash
# Grant Full Disk Access to Terminal
# System Preferences → Security & Privacy → Privacy → Full Disk Access
# Add Terminal.app or iTerm2

# Or use specific permissions
chmod +x install-claude-extension.sh
sudo chmod +x /usr/local/bin/prprompts
```

---

### Linux Issues

#### Issue: Different shell configurations

**Symptoms:**
- Commands work in bash but not zsh
- PATH not set correctly

**Solution:**
```bash
# Add to both .bashrc and .zshrc
echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.bashrc
echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.zshrc

# Reload
source ~/.bashrc
source ~/.zshrc
```

---

## Common Error Messages

### Error: "ENOENT: no such file or directory"

**Cause:** Missing file or directory

**Solution:**
```bash
# Check what file is missing
ls -la

# Create missing directories
mkdir -p docs .claude/prompts/prprompts

# Verify structure
tree -L 2
```

---

### Error: "Module not found"

**Cause:** Missing npm dependencies

**Solution:**
```bash
# Reinstall dependencies
npm install -g prprompts-flutter-generator

# Or install locally
cd /path/to/prprompts-flutter-generator
npm install
npm link
```

---

### Error: "Command failed with exit code 1"

**Cause:** General command failure

**Solution:**
```bash
# Run with debug output
DEBUG=true prprompts create
DEBUG=true prprompts generate

# Check logs
cat ~/.prprompts/logs/error.log
```

---

## Debugging Tips

### Enable Debug Mode

```bash
# Set debug environment variable
export DEBUG=true

# Run commands
prprompts create
prprompts generate

# Check verbose output
```

### Check Logs

```bash
# PRPROMPTS logs (if available)
cat ~/.prprompts/logs/prprompts.log

# npm logs
cat ~/.npm/_logs/*.log

# System logs
# macOS
log show --predicate 'process == "node"' --last 1h

# Linux
journalctl -u node --since "1 hour ago"
```

### Verify Installation

```bash
# Check PRPROMPTS version
prprompts --version

# Check Node.js version
node --version  # Should be 18 or 20

# Check npm version
npm --version  # Should be 9+

# Check global packages
npm list -g --depth=0 | grep prprompts

# Check where installed
which prprompts
ls -la $(which prprompts)
```

### Test Commands

```bash
# Test basic commands
prprompts --help
prprompts --version

# Test PRD creation
mkdir test-prprompts
cd test-prprompts
prprompts create

# Test generation
prprompts generate

# Validate
prprompts validate
```

---

## Getting Help

### Before Asking for Help

1. **Check this guide** - Most issues are covered here
2. **Search existing issues** - Someone may have had the same problem
3. **Update to latest version** - Bug may be fixed
4. **Try with clean install** - Eliminate local issues

### Where to Get Help

#### GitHub Issues
**Best for:** Bug reports, feature requests
**URL:** https://github.com/Kandil7/prprompts-flutter-generator/issues

**Template:**
```markdown
**Description:**
Clear description of the problem

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- OS: [Windows 11/macOS 14/Ubuntu 22.04]
- Node.js version: [v20.10.0]
- PRPROMPTS version: [4.0.0]
- AI Assistant: [Claude Code/Qwen Code/Gemini CLI]

**Error Output:**
```
Paste error messages here
```

**Additional Context:**
Any other relevant information
```

#### GitHub Discussions
**Best for:** Questions, ideas, general discussion
**URL:** https://github.com/Kandil7/prprompts-flutter-generator/discussions

#### Documentation
**Best for:** Learning how to use PRPROMPTS
**Files:** README.md, DEVELOPMENT.md, ARCHITECTURE.md

---

## Quick Fixes Checklist

If you're having issues, try this checklist:

- [ ] Node.js version 18 or 20?
- [ ] npm version 9 or higher?
- [ ] Latest PRPROMPTS version installed?
- [ ] In correct directory?
- [ ] PRD file exists at docs/PRD.md?
- [ ] Permissions correct?
- [ ] Extensions installed?
- [ ] AI assistant restarted?
- [ ] Internet connection working?
- [ ] Sufficient disk space?
- [ ] No antivirus blocking?
- [ ] Tried with debug mode?
- [ ] Read error messages carefully?

---

## Advanced Troubleshooting

### Clean Reinstall

```bash
# 1. Uninstall
npm uninstall -g prprompts-flutter-generator

# 2. Clear npm cache
npm cache clean --force

# 3. Clear global modules
rm -rf ~/.npm

# 4. Reinstall
npm install -g prprompts-flutter-generator

# 5. Verify
prprompts --version
npm run doctor  # Run health check
```

### Reset Extensions

```bash
# Backup first
cp -r ~/.config/claude ~/.config/claude.backup

# Remove old extensions
rm -rf ~/.config/claude/prompts/prprompts
rm -rf ~/.config/claude/commands/prp-*

# Reinstall
bash install-claude-extension.sh

# Restart Claude Code
```

### Doctor Command

```bash
# Run health check
npm run doctor

# This checks:
# - Node.js version
# - npm version
# - Installation integrity
# - Extension status
# - File permissions
# - Configuration validity
```

---

## Still Having Issues?

If you've tried everything and still have problems:

1. **Create minimal reproduction:**
   ```bash
   mkdir prprompts-test
   cd prprompts-test
   prprompts create
   # Document each step where it fails
   ```

2. **Collect information:**
   ```bash
   prprompts --version > debug-info.txt
   node --version >> debug-info.txt
   npm --version >> debug-info.txt
   uname -a >> debug-info.txt  # Or: ver (Windows)
   ```

3. **Open GitHub issue** with:
   - Clear problem description
   - Steps to reproduce
   - Error messages
   - debug-info.txt contents
   - What you've tried

We're here to help! 🚀

---

**Last Updated:** 2025-01-18
**PRPROMPTS Version:** 4.0.0
