# PRPROMPTS Troubleshooting Guide

> **Comprehensive solutions to common issues and errors - v4.0**

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [AI Configuration Problems](#ai-configuration-problems)
3. [API Key Errors](#api-key-errors)
4. [Command Execution Errors](#command-execution-errors)
5. [File and Permission Issues](#file-and-permission-issues)
6. [Network and Timeout Problems](#network-and-timeout-problems)
7. [Windows-Specific Issues](#windows-specific-issues)
8. [Rate Limiting and Quotas](#rate-limiting-and-quotas)
9. [Configuration Problems](#configuration-problems)
10. [Diagnostic Tools](#diagnostic-tools)

---

## Installation Issues

### npm install fails

**Problem:** `npm install -g prprompts-flutter-generator` fails with permission errors.

**Solution:**

**Linux/macOS:**
```bash
# Option 1: Use npm prefix (Recommended)
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
npm install -g prprompts-flutter-generator

# Option 2: Use nvm (Best practice)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install node
npm install -g prprompts-flutter-generator

# Option 3: Use sudo (Not recommended)
sudo npm install -g prprompts-flutter-generator
```

**Windows:**
```powershell
# Run PowerShell as Administrator
npm install -g prprompts-flutter-generator

# Or set npm prefix
npm config set prefix "%APPDATA%\npm"
npm install -g prprompts-flutter-generator
```

### Postinstall script fails

**Problem:** Installation succeeds but postinstall script fails.

**Solution:**
```bash
# Skip postinstall and run manually
SKIP_POSTINSTALL=1 npm install -g prprompts-flutter-generator

# Then run setup manually
prprompts doctor
node ~/.npm-global/lib/node_modules/prprompts-flutter-generator/scripts/postinstall.js
```

### Command not found after installation

**Problem:** `prprompts: command not found` after successful installation.

**Solution:**
```bash
# Check npm bin directory
npm bin -g

# Add to PATH (Linux/macOS)
export PATH=$(npm bin -g):$PATH
echo 'export PATH=$(npm bin -g):$PATH' >> ~/.bashrc
source ~/.bashrc

# Windows: Add to PATH via System Properties
# Path: %AppData%\npm
```

---

## AI Configuration Problems

### No AI assistants detected

**Problem:** `✗ No AI assistants found!`

**Solution:**

Install at least one AI assistant:

```bash
# Claude Code (Anthropic)
npm install -g @anthropic-ai/claude-code
export ANTHROPIC_API_KEY="your-api-key"

# Qwen Code (Alibaba)
npm install -g @qwenlm/qwen-code
export DASHSCOPE_API_KEY="your-api-key"

# Gemini CLI (Google)
npm install -g @google/gemini-cli
export GOOGLE_API_KEY="your-api-key"
```

### AI command not recognized

**Problem:** `Command 'create-prd' not recognized by claude`

**Solution:**
```bash
# Reinstall extensions
prprompts doctor

# Manual reinstall for specific AI
bash install-claude-extension.sh
bash install-qwen-extension.sh
bash install-gemini-extension.sh

# Check AI config directory
ls ~/.config/claude/prompts/
ls ~/.config/qwen/prompts/
ls ~/.config/gemini/prompts/
```

### Wrong AI being used

**Problem:** Commands run with wrong AI assistant.

**Solution:**
```bash
# Check current default
prprompts which

# Switch default AI
prprompts switch claude
prprompts switch qwen
prprompts switch gemini

# Use environment variable
export PRPROMPTS_DEFAULT_AI=claude
```

---

## API Key Errors

### API key not configured

**Problem:** `✗ Error: API key issue detected`

**Solution for each AI:**

**Claude Code:**
```bash
# Get key from: https://console.anthropic.com/settings/keys
export ANTHROPIC_API_KEY="sk-ant-..."

# Or add to ~/.bashrc or ~/.zshrc
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.bashrc
source ~/.bashrc
```

**Qwen Code:**
```bash
# Get key from: https://dashscope.aliyun.com/
export DASHSCOPE_API_KEY="sk-..."

# Or add to profile
echo 'export DASHSCOPE_API_KEY="sk-..."' >> ~/.bashrc
source ~/.bashrc
```

**Gemini CLI:**
```bash
# Get key from: https://aistudio.google.com/app/apikey
export GOOGLE_API_KEY="AIza..."

# Or add to profile
echo 'export GOOGLE_API_KEY="AIza..."' >> ~/.bashrc
source ~/.bashrc
```

**Windows PowerShell:**
```powershell
# Set environment variables permanently
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-...", "User")
[Environment]::SetEnvironmentVariable("DASHSCOPE_API_KEY", "sk-...", "User")
[Environment]::SetEnvironmentVariable("GOOGLE_API_KEY", "AIza...", "User")

# Restart PowerShell after setting
```

### Invalid API key

**Problem:** Authentication fails with valid-looking key.

**Solution:**
```bash
# Test API key directly
curl -H "x-api-key: $ANTHROPIC_API_KEY" \
  https://api.anthropic.com/v1/messages \
  -H "anthropic-version: 2023-06-01"

# Check for extra spaces or quotes
echo "$ANTHROPIC_API_KEY" | cat -A

# Regenerate key if needed
# Visit respective console to regenerate
```

---

## Command Execution Errors

### Command times out

**Problem:** `✗ Error: Command timed out after 120 seconds`

**Solution:**
```bash
# Increase timeout via environment variable
export PRPROMPTS_TIMEOUT=300000  # 5 minutes in milliseconds

# Or configure retries
export PRPROMPTS_RETRY_COUNT=5

# For specific command
PRPROMPTS_TIMEOUT=600000 prprompts generate
```

### Command fails with exit code 127

**Problem:** `✗ Error: Command 'gen-prprompts' not recognized`

**Solution:**
```bash
# Check available commands
prprompts help

# Use correct command name
prprompts generate    # not gen-prprompts
prprompts create      # not create-prd

# If commands missing, reinstall
npm uninstall -g prprompts-flutter-generator
npm install -g prprompts-flutter-generator
```

### Retry attempts keep failing

**Problem:** All retry attempts fail consistently.

**Solution:**
```bash
# Disable retries for debugging
export PRPROMPTS_RETRY_COUNT=1

# Run with verbose mode
export PRPROMPTS_VERBOSE=true
prprompts create

# Check network/firewall
ping api.anthropic.com
ping aistudio.googleapis.com
```

---

## File and Permission Issues

### Cannot write to config directory

**Problem:** `Error: EACCES: permission denied`

**Solution:**
```bash
# Fix permissions (Linux/macOS)
mkdir -p ~/.prprompts ~/.config/claude ~/.config/qwen ~/.config/gemini
chmod 755 ~/.prprompts ~/.config/claude ~/.config/qwen ~/.config/gemini

# Windows: Run as Administrator or fix permissions
icacls "%USERPROFILE%\.prprompts" /grant "%USERNAME%:F"
icacls "%USERPROFILE%\.config" /grant "%USERNAME%:F"
```

### PRD.md not found

**Problem:** `Missing required files: docs/PRD.md`

**Solution:**
```bash
# Create PRD first
prprompts create

# Or create manually
mkdir -p docs
cp templates/PRD-full-template.md docs/PRD.md
# Edit docs/PRD.md with your project details

# Or use auto-generation
prprompts auto
```

### PRPROMPTS directory missing

**Problem:** `PRPROMPTS/ directory not found`

**Solution:**
```bash
# Generate PRPROMPTS files
prprompts generate

# Or check if in correct directory
ls PRPROMPTS/
pwd  # Should be in Flutter project root

# Ensure PRD exists first
ls docs/PRD.md
```

---

## Network and Timeout Problems

### Connection timeout to AI services

**Problem:** Network timeouts when calling AI APIs.

**Solution:**
```bash
# Check connectivity
ping api.anthropic.com
curl -I https://api.anthropic.com

# Use proxy if needed
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# Increase timeout
export PRPROMPTS_TIMEOUT=300000  # 5 minutes
```

### SSL certificate errors

**Problem:** `unable to verify the first certificate`

**Solution:**
```bash
# Temporary (not recommended for production)
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Better: Update certificates
npm config set cafile /path/to/ca-bundle.crt

# Or update Node.js/npm
npm install -g npm@latest
nvm install node --latest
```

---

## Windows-Specific Issues

### Scripts disabled on Windows

**Problem:** `cannot be loaded because running scripts is disabled`

**Solution:**
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or for current session only
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Path separators causing issues

**Problem:** Commands fail with path errors on Windows.

**Solution:**
```powershell
# Use forward slashes or escaped backslashes
prprompts generate --path "C:/Users/name/project"
# or
prprompts generate --path "C:\\Users\\name\\project"

# Use relative paths when possible
cd C:\Users\name\project
prprompts generate
```

### Git Bash compatibility

**Problem:** Commands fail in Git Bash on Windows.

**Solution:**
```bash
# Use winpty for interactive commands
winpty prprompts create

# Or use PowerShell/CMD instead
powershell -Command "prprompts create"

# Or use WSL (Windows Subsystem for Linux)
wsl prprompts create
```

---

## Rate Limiting and Quotas

### Rate limit exceeded

**Problem:** `429 Too Many Requests` or rate limit errors.

**Solution:**

**For Claude:**
```bash
# Check your plan limits at:
# https://console.anthropic.com/settings/limits

# Add delays between requests
export PRPROMPTS_RATE_DELAY=1000  # 1 second between requests

# Upgrade to higher tier if needed
```

**For Gemini (Free tier):**
```bash
# Free tier: 60 requests/minute, 1M tokens/day
# Add automatic rate limiting
export PRPROMPTS_RATE_LIMIT=50  # Stay under limit

# Or use Gemini Pro for higher limits
```

**For Qwen:**
```bash
# Check limits at: https://dashscope.aliyun.com/
# Default: 100 requests/minute
# Upgrade plan if needed
```

### Context length exceeded

**Problem:** `Context length (X tokens) exceeds maximum`

**Solution:**
```bash
# Reduce file sizes or split generation
prprompts gen-phase-1
prprompts gen-phase-2
prprompts gen-phase-3

# Or use AI with larger context
prprompts switch gemini  # 1M tokens
prprompts switch qwen    # 256K-1M tokens

# Or generate fewer files at once
prprompts gen-file 01-feature_scaffold
```

---

## Configuration Problems

### Invalid configuration file

**Problem:** `Error loading config: Unexpected token`

**Solution:**
```bash
# Backup and reset config
mv ~/.prprompts/config.json ~/.prprompts/config.backup.json

# Regenerate config
prprompts doctor

# Or fix JSON manually
cat ~/.prprompts/config.json | python -m json.tool
# Fix any JSON syntax errors

# Or reset completely
rm -rf ~/.prprompts
prprompts init
```

### Config not persisting

**Problem:** Settings reset after each run.

**Solution:**
```bash
# Check file permissions
ls -la ~/.prprompts/config.json

# Fix permissions
chmod 644 ~/.prprompts/config.json

# Ensure directory exists
mkdir -p ~/.prprompts

# Check if being overwritten
cat ~/.prprompts/config.json
```

### Configuration warnings on startup

**Problem:** `⚠ Configuration warnings: Invalid version format`

**Solution:**
```bash
# Update config version
prprompts config

# Edit manually
nano ~/.prprompts/config.json
# Set version to "4.0.0"

# Suppress warnings
export PRPROMPTS_VERBOSE=false
```

---

## Diagnostic Tools

### Run comprehensive diagnostics

```bash
# Built-in doctor command
prprompts doctor

# Manual checks
echo "=== System Information ==="
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo "OS: $(uname -a)"
echo ""

echo "=== AI Assistants ==="
echo "Claude: $(which claude || echo 'Not installed')"
echo "Qwen: $(which qwen || echo 'Not installed')"
echo "Gemini: $(which gemini || echo 'Not installed')"
echo ""

echo "=== Environment Variables ==="
env | grep -E "(ANTHROPIC|DASHSCOPE|GOOGLE|PRPROMPTS)" || echo "None set"
echo ""

echo "=== Config Files ==="
ls -la ~/.prprompts/ 2>/dev/null || echo "~/.prprompts not found"
ls -la ~/.config/claude/prompts/ 2>/dev/null | head -5 || echo "Claude prompts not found"
ls -la ~/.config/qwen/prompts/ 2>/dev/null | head -5 || echo "Qwen prompts not found"
ls -la ~/.config/gemini/prompts/ 2>/dev/null | head -5 || echo "Gemini prompts not found"
```

### Enable debug mode

```bash
# Verbose output
export PRPROMPTS_VERBOSE=true
export DEBUG=true

# Log to file
prprompts create 2>&1 | tee prprompts-debug.log

# With timestamps
prprompts generate 2>&1 | ts '[%Y-%m-%d %H:%M:%S]' | tee debug.log
```

### Test individual components

```bash
# Test CLI wrapper
node $(npm root -g)/prprompts-flutter-generator/bin/prprompts help

# Test AI commands directly
claude create-prd
qwen gen-prprompts
gemini analyze-prd

# Test postinstall
node $(npm root -g)/prprompts-flutter-generator/scripts/postinstall.js

# Run tests
cd $(npm root -g)/prprompts-flutter-generator
npm test
```

---

## Automation Issues

### Bootstrap command fails

**Problem:** `/bootstrap-from-prprompts` fails

**Solution:**
```bash
# Ensure PRPROMPTS exist first
ls PRPROMPTS/*.md | wc -l  # Should be 32

# Regenerate if needed
prprompts generate

# Check Flutter project
flutter doctor
flutter pub get

# Run bootstrap
claude
/bootstrap-from-prprompts
```

### Full-cycle automation stuck

**Problem:** `/full-cycle` command hangs

**Solution:**
```bash
# Reduce number of features
/full-cycle
3  # Start with fewer features

# Check IMPLEMENTATION_PLAN.md exists
ls docs/IMPLEMENTATION_PLAN.md

# Monitor progress
tail -f *.log
```

---

## Getting Help

### Community Support

1. **GitHub Issues:** [Report bugs](https://github.com/Kandil7/prprompts-flutter-generator/issues)
2. **Discussions:** [Ask questions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)
3. **Stack Overflow:** Tag with `prprompts`

### Reporting Bugs

When reporting issues, include:

```bash
# Generate diagnostic report
prprompts doctor > diagnostic.txt
node --version >> diagnostic.txt
npm --version >> diagnostic.txt
echo "OS: $(uname -a)" >> diagnostic.txt

# Include:
# - Complete error messages
# - Steps to reproduce
# - Expected vs actual behavior
# - diagnostic.txt file
```

### Quick Fix Script

Create `fix-prprompts.sh`:

```bash
#!/bin/bash
echo "PRPROMPTS Quick Fix Script v4.0"
echo "================================"

# Backup current config
if [ -d ~/.prprompts ]; then
  cp -r ~/.prprompts ~/.prprompts.backup.$(date +%Y%m%d)
  echo "✓ Config backed up"
fi

# Reinstall
npm uninstall -g prprompts-flutter-generator
npm cache clean --force
npm install -g prprompts-flutter-generator
echo "✓ Package reinstalled"

# Reset configuration
rm -rf ~/.prprompts
mkdir -p ~/.prprompts

# Clear AI configs
for ai in claude qwen gemini; do
  if [ -d ~/.config/$ai ]; then
    rm -rf ~/.config/$ai/prompts
    rm -rf ~/.config/$ai/commands
    echo "✓ Cleared $ai config"
  fi
done

# Run postinstall
node $(npm root -g)/prprompts-flutter-generator/scripts/postinstall.js
echo "✓ Postinstall complete"

# Diagnostic
prprompts doctor

echo ""
echo "Fix complete! Try: prprompts create"
```

Make executable and run:
```bash
chmod +x fix-prprompts.sh
./fix-prprompts.sh
```

---

## Environment Variables Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PRPROMPTS_DEFAULT_AI` | Default AI assistant | claude | `export PRPROMPTS_DEFAULT_AI=gemini` |
| `PRPROMPTS_VERBOSE` | Verbose output | true | `export PRPROMPTS_VERBOSE=false` |
| `PRPROMPTS_TIMEOUT` | Command timeout (ms) | 120000 | `export PRPROMPTS_TIMEOUT=300000` |
| `PRPROMPTS_RETRY_COUNT` | Number of retries | 3 | `export PRPROMPTS_RETRY_COUNT=5` |
| `PRPROMPTS_AUTO_UPDATE` | Auto-update enabled | true | `export PRPROMPTS_AUTO_UPDATE=false` |
| `PRPROMPTS_TELEMETRY` | Telemetry enabled | false | `export PRPROMPTS_TELEMETRY=true` |
| `PRPROMPTS_RATE_DELAY` | Delay between API calls (ms) | 0 | `export PRPROMPTS_RATE_DELAY=1000` |
| `PRPROMPTS_RATE_LIMIT` | Max requests per minute | unlimited | `export PRPROMPTS_RATE_LIMIT=50` |
| `SKIP_POSTINSTALL` | Skip postinstall script | false | `export SKIP_POSTINSTALL=1` |
| `CI` | CI environment detection | false | `export CI=true` |
| `ANTHROPIC_API_KEY` | Claude API key | - | `export ANTHROPIC_API_KEY="sk-ant-..."` |
| `DASHSCOPE_API_KEY` | Qwen API key | - | `export DASHSCOPE_API_KEY="sk-..."` |
| `GOOGLE_API_KEY` | Gemini API key | - | `export GOOGLE_API_KEY="AIza..."` |

---

## FAQ

**Q: Can I use multiple AI assistants?**
A: Yes! Install all three and switch between them with `prprompts switch <ai>`.

**Q: How do I update to the latest version?**
A: Run `npm update -g prprompts-flutter-generator`.

**Q: Can I customize the prompts?**
A: Yes, edit files in `~/.config/{ai}/prompts/` and `~/.config/{ai}/commands/`.

**Q: Is my API key secure?**
A: API keys are stored as environment variables and never saved to disk by PRPROMPTS.

**Q: Can I use this offline?**
A: No, AI assistants require internet connection to their APIs.

**Q: Why do I get "command not found"?**
A: Ensure npm's global bin directory is in your PATH. Run `npm bin -g` to find it.

**Q: Can I use with existing Flutter projects?**
A: Yes! Run `prprompts init` in any Flutter project directory.

**Q: How much do the AI services cost?**
A: Claude (~$3/million tokens), Gemini (free tier available), Qwen (~$1/million tokens).

---

*Last updated: v4.0.0*
*For latest updates, visit: https://github.com/Kandil7/prprompts-flutter-generator*