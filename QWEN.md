# Qwen Code Installation Guide

Complete guide for using PRPROMPTS Generator with Qwen3-Coder.

---

## What is Qwen Code?

**Qwen Code** is Alibaba's command-line AI workflow tool, optimized for **Qwen3-Coder** models. It provides:

- ✅ **Extended Context**: 256K-1M tokens (4x-16x longer than Claude)
- ✅ **Agentic Coding**: Automated workflows for complex coding tasks
- ✅ **Code Understanding**: Deep codebase analysis and editing
- ✅ **Open Source**: Community-driven, highly extensible
- ✅ **Cost-Effective**: Free tier available, lower costs than proprietary models

**Performance**: Qwen3-Coder-480B-A35B-Instruct achieves state-of-the-art results on Agentic Coding benchmarks, comparable to Claude Sonnet 4.

---

## Prerequisites

### 1. Install Node.js

Qwen Code requires Node.js 20 or higher:

**Windows**:
```cmd
winget install OpenJS.NodeJS
```

**macOS**:
```bash
brew install node@20
```

**Linux**:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install Qwen Code CLI

```bash
npm install -g @qwenlm/qwen-code
```

**Verify installation**:
```bash
qwen --version
```

---

## Installation Methods

Choose your preferred method:

| Method | Time | Best For |
|--------|------|----------|
| **One-line (Recommended)** | 30 sec | Quick setup |
| **Standard (Clone repo)** | 2 min | Development, customization |
| **Manual** | 5 min | Full control |

---

### ⚡ Method 1: One-Line Install (Recommended)

**Copy and paste one command:**

#### Linux / macOS / Git Bash

```bash
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-qwen-gist.sh | bash
```

#### Windows PowerShell

```powershell
# Note: Replace URL with Qwen-specific installer when ready
irm https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-qwen-gist.ps1 | iex
```

**That's it!** Now run `qwen create-prd` from any directory.

---

### 📦 Method 2: Standard Install (Clone Repo)

```bash
# Clone repository
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator

# Run Qwen-specific installer
# Linux/macOS:
./scripts/install-qwen-commands.sh --global

# Windows (Batch):
scripts\install-qwen-commands.bat --global

# Windows (PowerShell):
powershell -ExecutionPolicy Bypass -File scripts\install-qwen-commands.ps1 --global
```

---

### 🛠️ Method 3: Manual Install

```bash
# 1. Install Qwen Code (if not already)
npm install -g @qwenlm/qwen-code

# 2. Clone repository
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator

# 3. Copy configuration files
mkdir -p ~/.config/qwen/prompts
cp .qwen/prompts/*.md ~/.config/qwen/prompts/
cp .qwen/config.yml ~/.config/qwen/
```

---

## Dual Installation (Claude + Qwen)

Want to use **both** Claude Code and Qwen Code?

```bash
# Linux/macOS:
./scripts/install-both.sh --global

# Windows (Batch):
scripts\install-both.bat --global
```

This installs commands for both AIs side-by-side:
- `claude create-prd` - Uses Claude Code
- `qwen create-prd` - Uses Qwen Code

---

## Available Commands

All commands work identically to Claude Code versions:

```bash
qwen create-prd          # Interactive PRD wizard (10 questions)
qwen auto-gen-prd        # Auto-generate PRD from description
qwen prd-from-files      # Generate PRD from existing markdown
qwen analyze-prd         # Validate and analyze PRD
qwen gen-prprompts       # Generate all 32 PRPROMPTS files
qwen gen-phase-1         # Generate Phase 1 (10 files)
qwen gen-phase-2         # Generate Phase 2 (12 files)
qwen gen-phase-3         # Generate Phase 3 (10 files)
qwen gen-file            # Generate single file by name
```

---

## Quick Start

### 1. Create Your PRD

```bash
cd your-flutter-project
qwen create-prd
```

Answer 10 simple questions to generate `docs/PRD.md`.

### 2. Generate PRPROMPTS

```bash
qwen gen-prprompts
```

Generates 32 customized development guides in `PRPROMPTS/` folder.

### 3. Start Coding

```bash
cat PRPROMPTS/01-feature_scaffold.md
cat PRPROMPTS/16-security_and_compliance.md
```

---

## Verify Installation

Test your setup:

```bash
# Check if commands are available
qwen create-prd --help

# Verify config files exist
# Windows:
dir %USERPROFILE%\.config\qwen\

# macOS/Linux:
ls -la ~/.config/qwen/
```

---

## Qwen-Specific Optimizations

The PRPROMPTS generator leverages Qwen3-Coder's unique strengths:

### 1. Extended Context (256K-1M tokens)

Qwen can process entire codebases at once:

```bash
# Claude Code: Limited to ~200K tokens
# Qwen Code: Supports up to 1M tokens

qwen gen-prprompts  # Analyzes full PRD + all dependencies
```

### 2. Agentic Workflow Automation

Qwen excels at multi-step coding tasks:

```bash
# Auto-generate PRD + PRPROMPTS + initial scaffold
qwen auto-gen-prd && qwen gen-prprompts
```

### 3. Deep Codebase Understanding

Qwen's parser is optimized for code analysis:

```bash
qwen analyze-prd  # Detects compliance issues, security patterns
```

---

## Troubleshooting

### Command not found

```bash
# Check if Qwen Code is installed
qwen --version

# Reinstall if needed
npm install -g @qwenlm/qwen-code

# Reinstall PRPROMPTS commands
./scripts/install-qwen-commands.sh --global
```

### Config not found

```bash
# Windows:
dir %USERPROFILE%\.config\qwen\

# macOS/Linux:
ls -la ~/.config/qwen/

# Reinstall if missing
./scripts/install-qwen-commands.sh --global
```

### PRD generation fails

```bash
# Ensure PRD template exists
ls docs/PRD.md

# Create PRD first
qwen create-prd

# Then generate PRPROMPTS
qwen gen-prprompts
```

---

## Comparison: Claude vs Qwen

See detailed comparison: [docs/CLAUDE-VS-QWEN.md](docs/CLAUDE-VS-QWEN.md)

**Quick summary**:

| Feature | Claude Code | Qwen Code |
|---------|-------------|-----------|
| **Context Length** | 200K tokens | 256K-1M tokens |
| **Cost** | $15-60/month | Free tier + lower costs |
| **Speed** | Fast | Very fast |
| **Accuracy** | Excellent | Excellent (comparable to Claude Sonnet 4) |
| **Best For** | Production apps, high-stakes | Large codebases, cost-conscious |

---

## Documentation

- **[Command Reference](docs/QWEN-COMMANDS.md)** - Full command list
- **[Claude vs Qwen](docs/CLAUDE-VS-QWEN.md)** - Feature comparison
- **[PRD Guide](docs/PRD-GUIDE.md)** - How to create PRDs
- **[PRPROMPTS Spec](docs/PRPROMPTS-SPECIFICATION.md)** - v2.0 specification

---

## Support

- 🐛 [Report Issue](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- 💬 [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)
- 📖 [Full README](README.md)
- 🔧 [Qwen Code Docs](https://github.com/QwenLM/qwen-code)

---

## Why Use Qwen Code?

✅ **4x-16x Longer Context** - Analyze entire codebases at once
✅ **Cost-Effective** - Free tier + lower costs than proprietary models
✅ **Open Source** - Community-driven, extensible
✅ **State-of-the-Art** - Comparable to Claude Sonnet 4 on coding tasks
✅ **Same Workflow** - Drop-in replacement for Claude Code

---

<div align="center">

**Made with ❤️ for Flutter developers**

[🚀 Quick Start](#quick-start) •
[📦 Install](#installation-methods) •
[📝 Create PRD](#quick-start) •
[🔧 Commands](docs/QWEN-COMMANDS.md) •
[💬 Support](https://github.com/Kandil7/prprompts-flutter-generator/issues)

**Powered by** [Qwen3-Coder](https://github.com/QwenLM/Qwen3-Coder) | **Built for** [Flutter](https://flutter.dev)

</div>
