# Installation Guide

## ⚡ Quick Install (Recommended)

**Copy and paste this one command:**

```bash
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.sh | bash
```

This will:
- ✅ Install Claude Code (if needed)
- ✅ Download all prompt files
- ✅ Configure commands globally
- ✅ Setup complete in 30 seconds

**Verification:**
```bash
claude create-prd --help
```

---

## 🔧 Alternative Installation Methods

### Method 1: Clone and Install

```bash
# 1. Clone repository
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator

# 2. Install globally
./scripts/install-commands.sh --global

# 3. Verify
claude create-prd --help
```

### Method 2: Local (Project-Specific)

```bash
# 1. In your Flutter project
cd your-flutter-project

# 2. Copy .claude directory
cp -r /path/to/prprompts-flutter-generator/.claude .

# 3. Now use commands in this project only
claude create-prd
```

### Method 3: Manual Configuration

```bash
# 1. Create config directory
mkdir -p ~/.config/claude/prompts

# 2. Download prompt files
cd ~/.config/claude/prompts
curl -O https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/.claude/prompts/generate-prd.md
curl -O https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/.claude/prompts/auto-generate-prd.md
curl -O https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/.claude/prompts/analyze-prd.md
curl -O https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/.claude/prompts/prprompts-generator.md
curl -O https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/.claude/prompts/phase-1-core.md
curl -O https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/.claude/prompts/phase-2-quality.md
curl -O https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/.claude/prompts/phase-3-demo.md
curl -O https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/.claude/prompts/single-file-generator.md

# 3. Download config
cd ~/.config/claude
curl -O https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/.claude/config.yml
```

---

## 🧪 Testing Installation

```bash
# Test each command
claude create-prd --help
claude auto-gen-prd --help
claude analyze-prd --help
claude gen-prprompts --help

# Quick test run
cd /tmp
mkdir test-project && cd test-project

# Create simple description
cat > project_description.md << 'EOF'
# TestApp
Healthcare app with HIPAA.
Features: tracking, messaging
EOF

# Auto-generate PRD
claude auto-gen-prd

# Verify PRD created
cat docs/PRD.md
```

---

## 🐛 Troubleshooting

### Command not found: claude

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Verify
claude --version
```

### curl command fails

```bash
# Download script manually
wget https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.sh
chmod +x setup-gist.sh
./setup-gist.sh
```

### Permissions denied

```bash
# On Linux/Mac
chmod +x ~/.local/bin/*

# Or run with sudo (if needed)
sudo ./scripts/install-commands.sh --global
```

### Commands not working after install

```bash
# Reload shell config
source ~/.bashrc  # or ~/.zshrc

# Or restart terminal
```

---

## 🔄 Updating

```bash
# Re-run quick install
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.sh | bash

# This will overwrite old files with latest version
```

---

## 🗑️ Uninstalling

```bash
# Remove config directory
rm -rf ~/.config/claude

# Remove from PATH (if applicable)
rm ~/.local/bin/auto-prd

# Uninstall Claude Code (optional)
npm uninstall -g @anthropic-ai/claude-code
```

---

## 📦 What Gets Installed

**Configuration:**
- `~/.config/claude/config.yml` - Command definitions
- `~/.config/claude/prompts/*.md` - 8 prompt files

**Optional:**
- `~/.local/bin/auto-prd` - Shortcut script

**Total size:** ~200KB

---

## 🆘 Support

- 📖 [Documentation](https://github.com/Kandil7/prprompts-flutter-generator)
- 🐛 [Report Issue](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- 💬 [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)
