# Gemini CLI Installation Guide

Complete guide for using PRPROMPTS Generator with Google's Gemini CLI.

---

## What is Gemini CLI?

**Gemini CLI** is Google's open-source AI agent that brings Gemini 2.5 Pro directly into your terminal. It provides:

- ✅ **1M Token Context**: Massive context window (5x larger than Claude)
- ✅ **Free Tier**: 60 requests/minute, 1,000/day (no credit card required!)
- ✅ **Agent Mode**: ReAct loop for complex multi-step tasks
- ✅ **Open Source**: Community-driven, highly extensible
- ✅ **Google Integration**: Works with Google Cloud, Vertex AI, Firebase

**Performance**: Gemini 2.5 Pro offers excellent code understanding and generation, with industry-leading free tier limits.

---

## Prerequisites

### 1. Install Node.js

Gemini CLI requires Node.js 20 or higher:

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

### 2. Install Gemini CLI

```bash
npm install -g @google/gemini-cli
```

**Verify installation**:
```bash
gemini --version
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
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gemini-gist.sh | bash
```

**That's it!** Now run `gemini create-prd` from any directory.

---

### 📦 Method 2: Standard Install (Clone Repo)

```bash
# Clone repository
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator

# Run Gemini-specific installer
# Linux/macOS:
./scripts/install-gemini-commands.sh --global

# Windows (Batch):
scripts\install-gemini-commands.bat --global

# Windows (PowerShell):
powershell -ExecutionPolicy Bypass -File scripts\install-gemini-commands.ps1 --global
```

---

### 🛠️ Method 3: Manual Install

```bash
# 1. Install Gemini CLI (if not already)
npm install -g @google/gemini-cli

# 2. Clone repository
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator

# 3. Copy configuration files
mkdir -p ~/.config/gemini/prompts
cp .gemini/prompts/*.md ~/.config/gemini/prompts/
cp .gemini/config.yml ~/.config/gemini/
```

---

## Triple Installation (All 3 AI Assistants!)

Want to use **Claude + Qwen + Gemini**?

```bash
# Linux/macOS:
./scripts/install-all.sh --global

# Windows (Batch):
scripts\install-all.bat --global
```

This installs commands for all 3 AI assistants side-by-side:
- `claude create-prd` - Uses Claude Code
- `qwen create-prd` - Uses Qwen Code
- `gemini create-prd` - Uses Gemini CLI

---

## Available Commands

All commands work identically to Claude/Qwen versions:

```bash
gemini create-prd          # Interactive PRD wizard (10 questions)
gemini auto-gen-prd        # Auto-generate PRD from description
gemini prd-from-files      # Generate PRD from existing markdown
gemini analyze-prd         # Validate and analyze PRD
gemini gen-prprompts       # Generate all 32 PRPROMPTS files
gemini gen-phase-1         # Generate Phase 1 (10 files)
gemini gen-phase-2         # Generate Phase 2 (12 files)
gemini gen-phase-3         # Generate Phase 3 (10 files)
gemini gen-file            # Generate single file by name
```

---

## Quick Start

### 1. Authenticate with Google

```bash
gemini auth login
```

Follow the prompts to sign in with your Google account (free!).

### 2. Create Your PRD

```bash
cd your-flutter-project
gemini create-prd
```

Answer 10 simple questions to generate `docs/PRD.md`.

### 3. Generate PRPROMPTS

```bash
gemini gen-prprompts
```

Generates 32 customized development guides in `PRPROMPTS/` folder.

### 4. Start Coding

```bash
cat PRPROMPTS/01-feature_scaffold.md
cat PRPROMPTS/16-security_and_compliance.md
```

---

## Verify Installation

Test your setup:

```bash
# Check if commands are available
gemini create-prd --help

# Verify config files exist
# Windows:
dir %USERPROFILE%\.config\gemini\

# macOS/Linux:
ls -la ~/.config/gemini/
```

---

## Gemini-Specific Advantages

### 1. Massive Free Tier

**Industry-leading free limits:**
- 🎉 **1M token context** - Analyze entire large codebases
- 🎉 **60 requests/minute** - Perfect for CI/CD automation
- 🎉 **1,000 requests/day** - More than enough for most teams
- 🎉 **No credit card required** - Just sign in with Google

**Comparison:**
| AI | Free Tier |
|----|-----------|
| Claude Code | 20 messages/day |
| Qwen Code | Self-host only |
| **Gemini CLI** | **60 req/min, 1K/day** |

### 2. Extended Context (1M Tokens)

Gemini can process massive PRDs and entire codebases:

```bash
# Process huge PRD with 100+ pages of requirements
gemini create-prd  # Handles up to 400 pages

# Analyze entire codebase at once (200K+ lines)
gemini analyze-prd  # Detects patterns across all files
```

### 3. Agent Mode with ReAct Loop

Gemini excels at complex multi-step tasks:

```bash
# Auto-generate PRD + PRPROMPTS + initial scaffold
gemini auto-gen-prd && gemini gen-prprompts
```

The ReAct (Reason and Act) loop enables:
- Multi-file operations
- Complex workflows
- Automated refactoring
- Bug fixing across multiple files

### 4. Google Ecosystem Integration

- **Google Cloud**: Seamless Vertex AI integration
- **Firebase**: Direct Firebase support
- **Cloud Functions**: Automated deployments
- **BigQuery**: Data analysis integration

---

## Troubleshooting

### Command not found

```bash
# Check if Gemini CLI is installed
gemini --version

# Reinstall if needed
npm install -g @google/gemini-cli

# Reinstall PRPROMPTS commands
./scripts/install-gemini-commands.sh --global
```

### Authentication issues

```bash
# Re-authenticate
gemini auth logout
gemini auth login

# Check authentication status
gemini auth status
```

### Config not found

```bash
# Windows:
dir %USERPROFILE%\.config\gemini\

# macOS/Linux:
ls -la ~/.config/gemini/

# Reinstall if missing
./scripts/install-gemini-commands.sh --global
```

### PRD generation fails

```bash
# Ensure PRD template exists
ls docs/PRD.md

# Create PRD first
gemini create-prd

# Then generate PRPROMPTS
gemini gen-prprompts
```

### Rate limit errors

If you hit the free tier limit:
- Wait 1 minute (60 req/min limit)
- Or wait until next day (1,000 req/day limit)
- Or upgrade to paid tier for higher limits

---

## Comparison: Claude vs Qwen vs Gemini

| Feature | Claude Code | Qwen Code | Gemini CLI |
|---------|-------------|-----------|------------|
| **Context** | 200K tokens | 256K-1M | **1M tokens** |
| **Free Tier** | 20 msgs/day | Self-host | **60 req/min, 1K/day** |
| **Cost (API)** | $3-15/1M | $0.60-3/1M | **FREE** (preview) |
| **Speed** | Fast | Very Fast | Fast |
| **Accuracy** | 9.5/10 | 9.0/10 | 8.5/10 |
| **Agent Mode** | Good | Excellent | **Excellent (ReAct)** |
| **Best For** | Production | Large codebases | **Free tier, MVPs** |

**Full Comparison**: See [docs/AI-COMPARISON.md](docs/AI-COMPARISON.md)

---

## Documentation

- **[Command Reference](docs/GEMINI-COMMANDS.md)** - Full command list
- **[AI Comparison](docs/AI-COMPARISON.md)** - 3-way comparison (Claude/Qwen/Gemini)
- **[PRD Guide](docs/PRD-GUIDE.md)** - How to create PRDs
- **[PRPROMPTS Spec](docs/PRPROMPTS-SPECIFICATION.md)** - v2.0 specification

---

## Support

- 🐛 [Report Issue](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- 💬 [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)
- 📖 [Full README](README.md)
- 🔧 [Gemini CLI Docs](https://developers.google.com/gemini-code-assist/docs/gemini-cli)

---

## Why Use Gemini CLI?

✅ **Best Free Tier** - 60 req/min, 1,000/day (no card required)
✅ **Massive Context** - 1M tokens (equal to Qwen)
✅ **Google Integration** - Firebase, Cloud Functions, Vertex AI
✅ **Agent Mode** - ReAct loop for complex workflows
✅ **Same Commands** - `gemini create-prd` = `claude create-prd`

Perfect for:
- 🚀 **Startups & MVPs** - Free tier is more than enough
- 🎓 **Students & Learning** - No cost barrier
- 🏢 **CI/CD Automation** - 60 req/min perfect for builds
- 📦 **Open Source Projects** - Free forever tier

---

<div align="center">

**Made with ❤️ for Flutter developers**

[🚀 Quick Start](#quick-start) •
[📦 Install](#installation-methods) •
[📝 Create PRD](#quick-start) •
[🔧 Commands](docs/GEMINI-COMMANDS.md) •
[💬 Support](https://github.com/Kandil7/prprompts-flutter-generator/issues)

**Powered by** [Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli) | **Built for** [Flutter](https://flutter.dev)

</div>
