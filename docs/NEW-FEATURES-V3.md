# PRPROMPTS v3.0 - New Features Guide

## 🚀 What's New in v3.0

Version 3.0 introduces powerful installation improvements and a unified CLI experience that makes PRPROMPTS even easier to use across any project.

---

## ✨ Key Features

### 1. Smart Unified Installer

**One command to rule them all!**

The new smart installer automatically detects your system, checks which AI assistants you have, and offers to install missing ones.

```bash
# Run the smart installer
bash scripts/smart-install.sh

# Or use npm script
npm run smart-install
```

**What it does:**
- ✅ Auto-detects your OS (Windows/Mac/Linux)
- ✅ Checks for Node.js and npm
- ✅ Detects installed AI assistants (Claude/Qwen/Gemini)
- ✅ Offers to install missing AI CLIs
- ✅ Installs PRPROMPTS commands for all available AIs
- ✅ Creates unified configuration
- ✅ Sets up CLI wrapper
- ✅ Shows beautiful summary and quick start

**Benefits:**
- **Zero configuration needed** - It figures everything out
- **No mistakes** - Installs only what you need
- **Time saver** - One command vs multiple manual steps
- **User-friendly** - Clear prompts and colorful output

---

### 2. Standalone CLI Wrapper (`prprompts` command)

**Unified interface for all three AI assistants!**

Instead of remembering `claude create-prd`, `qwen create-prd`, `gemini create-prd`, now use:

```bash
prprompts create        # Uses your default AI
prprompts generate      # Generate all 32 PRPROMPTS
prprompts switch gemini # Switch default AI
prprompts doctor        # Diagnose issues
```

#### Installation

After running smart-install:

```bash
# Add to PATH (one-time setup)
echo 'export PATH="$HOME/.prprompts/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Test it
prprompts --version
```

#### All Commands

**Project Commands:**
```bash
prprompts init              # Initialize PRPROMPTS in current project
prprompts create            # Create PRD interactively
prprompts auto              # Auto-generate PRD from description
prprompts from-files        # Generate PRD from existing docs
prprompts analyze           # Validate and analyze PRD
prprompts generate          # Generate all 32 PRPROMPTS
prprompts gen-phase-1       # Generate Phase 1 only
prprompts gen-phase-2       # Generate Phase 2 only
prprompts gen-phase-3       # Generate Phase 3 only
prprompts gen-file <name>   # Generate single file
```

**Configuration:**
```bash
prprompts config            # Show current configuration
prprompts switch <ai>       # Switch default AI (claude|qwen|gemini)
prprompts which             # Show which AI will be used
prprompts doctor            # Diagnose installation issues
```

**Maintenance:**
```bash
prprompts update            # Update to latest version
prprompts version           # Show version info
prprompts help              # Show help
```

#### Benefits:
- **Shorter commands** - `prprompts create` vs `claude create-prd`
- **AI-agnostic** - Switch between Claude/Qwen/Gemini seamlessly
- **Auto-selection** - Uses best available AI automatically
- **Consistent interface** - Same commands across all AIs

---

### 3. Auto-Update Mechanism

**Stay up-to-date effortlessly!**

```bash
# Check for updates
prprompts update

# Or use npm script
npm run check-updates
```

**Features:**
- ✅ One-command updates from GitHub
- ✅ Automatic backup before update
- ✅ Rollback capability if something goes wrong
- ✅ Version checking
- ✅ Safe update process

```bash
# Rollback to previous version
node lib/updater.js rollback
```

**Update flow:**
1. Checks GitHub for latest version
2. Creates backup of current installation
3. Downloads latest version
4. Runs smart installer
5. Updates CLI wrapper
6. Confirms success

**Rollback flow:**
1. Finds latest backup
2. Restores configuration files
3. Reverts to previous version

---

### 4. Shell Completions

**Tab completion for faster typing!**

Install completions for your shell:

**Bash:**
```bash
# Copy to completion directory
sudo cp completions/prprompts.bash /etc/bash_completion.d/prprompts

# Or source it directly
echo 'source ~/path/to/completions/prprompts.bash' >> ~/.bashrc
source ~/.bashrc
```

**Zsh:**
```bash
# Add to fpath
mkdir -p ~/.zsh/completions
cp completions/prprompts.zsh ~/.zsh/completions/_prprompts

# Add to .zshrc if not already there
echo 'fpath=(~/.zsh/completions $fpath)' >> ~/.zshrc
echo 'autoload -U compinit && compinit' >> ~/.zshrc
source ~/.zshrc
```

**Fish:**
```bash
# Copy to fish completions
cp completions/prprompts.fish ~/.config/fish/completions/
```

**What you get:**
- Tab completion for commands
- Tab completion for AI names (`prprompts switch <TAB>`)
- Tab completion for file names (`prprompts gen-file <TAB>`)
- Helpful descriptions for each command

---

### 5. Project Templates

**Quick start with pre-configured templates!**

New project templates for common use cases:

```bash
# List templates
ls templates/

# Use a template
cat templates/healthcare.md > project_description.md
prprompts auto
```

**Available templates:**

1. **healthcare.md** - HIPAA-compliant medical apps
   - Patient portals, secure messaging, PHI handling
   - Includes all HIPAA requirements

2. **fintech.md** - PCI-DSS compliant financial apps
   - Payments, banking, investments
   - Includes PCI-DSS tokenization patterns

3. **ecommerce.md** - Shopping and marketplace apps
   - Cart, checkout, order management
   - Payment integration best practices

4. **generic.md** - General purpose apps
   - Basic authentication and features
   - Good starting point for any app

**Each template includes:**
- Project description
- Target users
- Core features
- Compliance requirements
- Security requirements
- Technical stack recommendations
- Team recommendations
- Integration points
- Testing requirements
- Deployment considerations

---

### 6. Configuration System

**Powerful, flexible configuration!**

All configuration stored in `~/.prprompts/config.json`:

```json
{
  "version": "3.0.0",
  "default_ai": "claude",
  "ais": {
    "claude": { "enabled": true, "config_path": "~/.config/claude" },
    "qwen": { "enabled": false },
    "gemini": { "enabled": true, "config_path": "~/.config/gemini" }
  },
  "features": {
    "auto_update": true,
    "telemetry": false,
    "verbose": true
  }
}
```

**Configuration commands:**
```bash
prprompts config        # Show current config
prprompts switch claude # Change default AI
vim ~/.prprompts/config.json  # Manual edit
```

---

### 7. Doctor Command

**Diagnose installation issues instantly!**

```bash
prprompts doctor
```

**Checks:**
- ✅ Node.js and npm versions
- ✅ Git installation
- ✅ AI assistant installations (Claude/Qwen/Gemini)
- ✅ Configuration files
- ✅ Prompt files
- ✅ Path setup

**Example output:**
```
🔍 PRPROMPTS Installation Diagnostics

Node.js:
  ✓ v20.10.0
npm:
  ✓ 10.2.3
Git:
  ✓ git version 2.43.0

AI Assistants:
  ✓ claude: 1.5.2
    ✓ Config: /Users/you/.config/claude
  ✗ qwen: not installed
  ✓ gemini: 2.1.0
    ✓ Config: /Users/you/.config/gemini

PRPROMPTS Configuration:
  ✓ Config file: /Users/you/.prprompts/config.json
  ✓ Default AI: claude
```

---

## 📦 Installation Comparison

### Before v3.0 (Old way):
```bash
# Multiple manual steps
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator
./scripts/install-commands.sh --global
./scripts/install-qwen-commands.sh --global
./scripts/install-gemini-commands.sh --global

# Check if it worked
claude create-prd --help
qwen create-prd --help
gemini create-prd --help
```

### v3.0 (New way):
```bash
# One command
bash scripts/smart-install.sh

# Or even simpler
npm run smart-install

# Use unified CLI
prprompts create
```

---

## 🎯 Quick Start with v3.0

### For New Users:

```bash
# 1. Clone repository
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator

# 2. Run smart installer
bash scripts/smart-install.sh

# 3. Add prprompts to PATH (if not already)
echo 'export PATH="$HOME/.prprompts/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# 4. Create your first project
cd ~/my-flutter-project
prprompts create
prprompts generate
```

### For Existing Users (Upgrading):

```bash
cd prprompts-flutter-generator
git pull origin master
bash scripts/smart-install.sh
```

---

## 🔄 Migration Guide (v2.2 → v3.0)

**Good news:** v3.0 is fully backward compatible!

Your existing commands still work:
- `claude create-prd` → Still works
- `qwen gen-prprompts` → Still works
- `gemini analyze-prd` → Still works

**New commands available:**
- `prprompts create` → Same as `claude create-prd` (uses default AI)
- `prprompts generate` → Same as `claude gen-prprompts`
- `prprompts doctor` → New diagnostic tool

**No breaking changes!**

---

## 🆘 Troubleshooting

### prprompts command not found

```bash
# Add to PATH
echo 'export PATH="$HOME/.prprompts/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
which prprompts
prprompts --version
```

### Doctor command shows issues

```bash
prprompts doctor

# Follow the recommendations shown
# Usually: Install missing AI or fix config paths
```

### Update fails

```bash
# Rollback to previous version
node lib/updater.js rollback

# Try manual update
cd prprompts-flutter-generator
git pull
bash scripts/smart-install.sh
```

---

## 📚 Additional Resources

- **README**: Project overview and features
- **USAGE.md**: Detailed usage guide
- **TESTING.md**: Testing guide for all AIs
- **API.md**: Complete command reference
- **TROUBLESHOOTING.md**: Common issues and solutions

---

## 🎉 What's Next?

Planned for future releases:
- **v3.1**: VS Code extension integration
- **v3.2**: Docker support
- **v3.3**: GitHub Actions templates
- **v4.0**: Web UI for PRD creation

---

## 💬 Feedback

Love the new features? Have suggestions?

- **GitHub Issues**: https://github.com/Kandil7/prprompts-flutter-generator/issues
- **Discussions**: https://github.com/Kandil7/prprompts-flutter-generator/discussions

---

**Happy coding with PRPROMPTS v3.0!** 🚀
