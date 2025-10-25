# macOS Quick Start Guide

## 🚀 Super Fast Installation (3 Methods)

### ⚡ Method 1: npm Install (Easiest & Fastest!)

**🆕 v4.0 - Works on Intel & Apple Silicon Macs!**

1. **Install via npm:**
   ```bash
   npm install -g prprompts-flutter-generator
   ```

2. **Done!** The installer will automatically:
   - Detect your installed AI assistants (Claude/Qwen/Gemini)
   - Configure all commands
   - Set up the unified CLI

3. **Start using:**
   ```bash
   prprompts create
   prprompts generate
   ```

**Prerequisites:** You need Node.js (v20+). See installation options below.

**Don't have Claude Code yet?** Install it first:
```bash
npm install -g @anthropic-ai/claude-code
npm install -g prprompts-flutter-generator
```

---

### ⚡ Method 2: Homebrew + npm

**Recommended for macOS developers:**

1. **Install Homebrew** (if not installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Node.js:**
   ```bash
   brew install node
   ```

3. **Install PRPROMPTS:**
   ```bash
   npm install -g prprompts-flutter-generator
   ```

4. **Start using:**
   ```bash
   prprompts create
   ```

---

### 🔧 Method 3: Clone & Install

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kandil7/prprompts-flutter-generator.git
   cd prprompts-flutter-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Link globally:**
   ```bash
   npm link
   ```

4. **Done!** Start using:
   ```bash
   claude create-prd
   ```

---

## ✅ Verify Installation

```bash
# Check Claude Code is installed
claude --version

# Check PRPROMPTS commands are available
claude create-prd --help

# Or use the unified CLI
prprompts doctor
```

You should see help text and version information.

---

## 🎯 Quick Start

```bash
# Navigate to your Flutter project
cd ~/Projects/your-flutter-project

# Create PRD interactively
prprompts create

# Or use Claude directly
claude create-prd

# Generate all 32 PRPROMPTS files
prprompts generate

# Or use Claude directly
claude gen-prprompts

# Start coding with automation
claude bootstrap-from-prprompts
```

---

## ⚠️ Prerequisites

### Required

- ✅ **Node.js 20+** (choose one):
  - **Homebrew:** `brew install node`
  - **nvm:** `nvm install 20 && nvm use 20`
  - **Official:** [Download from nodejs.org](https://nodejs.org)

- ✅ **npm** (included with Node.js)

### Recommended

- ✅ **Homebrew:** [brew.sh](https://brew.sh) - Package manager for macOS
- ✅ **Git:** `brew install git` (usually pre-installed)

### Optional AI Assistants

Choose one or more:

- **Claude Code (Anthropic):**
  ```bash
  npm install -g @anthropic-ai/claude-code
  ```

- **Qwen Code (Alibaba):**
  ```bash
  npm install -g @qwen/qwen-code
  ```

- **Gemini CLI (Google):**
  ```bash
  npm install -g @google/gemini-cli
  ```

---

## 🐛 Troubleshooting

### "command not found: npm"

Install Node.js first:

```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
open https://nodejs.org
```

### "command not found: claude"

Install Claude Code:

```bash
npm install -g @anthropic-ai/claude-code
```

Verify installation:
```bash
which claude
claude --version
```

### "permission denied" or "EACCES" errors

Don't use `sudo` with npm! Fix npm permissions:

```bash
# Method 1: Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc  # or ~/.bash_profile for bash
nvm install 20
nvm use 20

# Method 2: Change npm's default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Then install without sudo
npm install -g prprompts-flutter-generator
```

### Claude commands not found after installation

Check your PATH:

```bash
# See where npm global packages are installed
npm root -g

# Add to PATH if needed (add to ~/.zshrc or ~/.bash_profile)
export PATH="$(npm root -g)/bin:$PATH"

# Reload shell configuration
source ~/.zshrc  # or source ~/.bash_profile
```

### Apple Silicon (M1/M2/M3) compatibility

PRPROMPTS works natively on Apple Silicon. Ensure you're using ARM-compatible Node.js:

```bash
# Check your Node.js architecture
node -p "process.arch"
# Should show: arm64

# If it shows x64, reinstall Node.js for Apple Silicon:
brew uninstall node
brew install node

# Verify
node -p "process.arch"  # Should now show: arm64
```

### Homebrew installation path issues

If Claude commands aren't found after installation:

```bash
# Homebrew on Apple Silicon installs to /opt/homebrew
# Homebrew on Intel installs to /usr/local

# Check your Homebrew prefix
brew --prefix

# Add Homebrew's npm to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="$(brew --prefix)/bin:$PATH"

# Reload
source ~/.zshrc
```

### "zsh: permission denied" when running scripts

Make scripts executable:

```bash
chmod +x scripts/*.sh
chmod +x scripts/*.ps1
```

### Commands work in terminal but not in IDE

Add to your shell profile (`~/.zshrc` or `~/.bash_profile`):

```bash
# Node.js and npm
export PATH="$(npm root -g)/bin:$PATH"

# Homebrew (Apple Silicon)
export PATH="/opt/homebrew/bin:$PATH"

# Homebrew (Intel)
export PATH="/usr/local/bin:$PATH"
```

Restart your IDE after updating the profile.

---

## 🔍 Verify Your Setup

Run the built-in diagnostic tool:

```bash
prprompts doctor
```

This will check:
- ✅ Node.js version (20+)
- ✅ npm installation
- ✅ Available AI assistants (Claude, Qwen, Gemini)
- ✅ PRPROMPTS commands are configured
- ✅ Configuration files are in place

---

## 🎓 Multiple AI Assistants

PRPROMPTS supports Claude Code, Qwen Code, and Gemini CLI. You can use them interchangeably:

```bash
# Using Claude Code
claude create-prd
claude gen-prprompts

# Using Qwen Code
qwen create-prd
qwen gen-prprompts

# Using Gemini CLI
gemini create-prd
gemini gen-prprompts

# Or use the unified CLI (auto-detects available AI)
prprompts create
prprompts generate
```

**Automation Features** (v4.0):

```bash
# Claude Code automation commands
claude bootstrap-from-prprompts    # Complete project setup
claude implement-next              # Auto-implement next feature
claude full-cycle                  # 1-10 feature implementations
```

**Qwen & Gemini TOML Skills** (v4.0):

```bash
# Qwen Code (8 slash commands)
qwen
/skills/automation/flutter-bootstrapper
/skills/automation/code-reviewer

# Gemini CLI (8 slash commands with colon separator)
gemini
/skills:automation:flutter-bootstrapper
/skills:automation:code-reviewer
```

---

## 📖 Full Documentation

- [README](README.md) - Complete project documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design (1046 lines)
- [DEVELOPMENT.md](DEVELOPMENT.md) - Contributing guide (778 lines)
- [docs/CLAUDE-USER-GUIDE.md](docs/CLAUDE-USER-GUIDE.md) - Extension guide
- [QWEN.md](QWEN.md) - Qwen Code setup & TOML skills
- [GEMINI.md](GEMINI.md) - Gemini CLI setup & TOML skills
- [docs/AUTOMATION-GUIDE.md](docs/AUTOMATION-GUIDE.md) - v4.0 automation workflows

---

## 💬 Need Help?

- **Issues:** [GitHub Issues](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)
- **Documentation:** [Full Docs](https://github.com/Kandil7/prprompts-flutter-generator#readme)

---

## 🍎 macOS-Specific Tips

### Using Different Node.js Managers

**nvm (Node Version Manager) - Recommended:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Install PRPROMPTS
npm install -g prprompts-flutter-generator
```

**Homebrew:**
```bash
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Shell Configuration

**For zsh users** (default on macOS Catalina+):
```bash
# Edit ~/.zshrc
code ~/.zshrc  # or nano ~/.zshrc

# Add these lines:
export PATH="$(npm root -g)/bin:$PATH"
export PATH="$(brew --prefix)/bin:$PATH"

# Save and reload
source ~/.zshrc
```

**For bash users**:
```bash
# Edit ~/.bash_profile
code ~/.bash_profile  # or nano ~/.bash_profile

# Add the same PATH exports
# Save and reload
source ~/.bash_profile
```

### Rosetta 2 (Intel Apps on Apple Silicon)

PRPROMPTS runs natively on Apple Silicon, but if you need to use Rosetta:

```bash
# Install Rosetta 2 (one-time)
softwareupdate --install-rosetta --agree-to-license

# Run terminal in Rosetta mode:
# Right-click Terminal.app → Get Info → Check "Open using Rosetta"

# Then install Node.js (x64 version will be used)
brew install node
```

**Not recommended** - use ARM-native Node.js instead for better performance.

---

**Made for macOS developers ❤️**
