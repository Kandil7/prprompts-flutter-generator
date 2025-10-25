# Gemini CLI Extension for PRPROMPTS v4.0

Complete guide for using PRPROMPTS Generator with Google's Gemini CLI - now with full automation!

---

## 🆕 v4.0: Full Automation

**Go from PRD to production Flutter app in 2-3 hours (40-60x faster!)** with 6 automation commands:

- 🚀 `/bootstrap-from-prprompts` - Complete project setup with intelligent planning (2 min)
- ✨ `/implement-next` - Auto-implement features with state tracking (10 min each)
- 🤖 `/full-cycle` - Implement 1-10 features automatically (1-2 hours)
- ✅ `/review-and-commit` - Validate & commit
- 🔍 `/qa-check` - Comprehensive compliance audit
- 📊 `/update-plan` - Adaptive re-planning with velocity tracking (30 sec) **NEW v4.1 Phase 3**

**Result:** Production-ready app with 85%+ test coverage, HIPAA/PCI-DSS compliant, zero security vulnerabilities.

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

### 3. Get Your Google API Key (Free!)

Gemini CLI requires a Google API key, which is **completely free** with generous limits.

**Get your API key:**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account (or create one - it's free!)
3. Click "Create API Key"
4. Copy your API key

**Free Tier Limits:**
- ✅ **60 requests/minute** - Perfect for development
- ✅ **1,000 requests/day** - More than enough for most teams
- ✅ **1M token context** - Analyze entire large codebases
- ✅ **No credit card required** - Completely free forever

**API Key Management:**
Gemini CLI will automatically prompt you to configure your API key on first use, or you can set it manually:

```bash
# Option 1: Interactive setup (recommended)
gemini auth login

# Option 2: Set environment variable
export GOOGLE_API_KEY="your-api-key-here"

# Option 3: Add to your shell profile
echo 'export GOOGLE_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

**Security Note:**
- Never commit API keys to git repositories
- Use environment variables for API key storage
- API keys are stored securely by Gemini CLI

---

## Version Compatibility

**Tested Versions:**
- **Gemini CLI:** >= 1.0.0 (tested with 1.0.x, 1.1.x)
- **Node.js:** >= 20.0.0 (LTS recommended)
- **PRPROMPTS:** >= 4.0.0

**Compatibility Notes:**
- Gemini CLI is actively developed; breaking changes may occur in major versions
- Always check [Gemini CLI Changelog](https://github.com/google/gemini-cli/releases) before upgrading
- PRPROMPTS skills are forward-compatible with Gemini CLI minor version updates
- If you encounter issues after a Gemini CLI update, reinstall PRPROMPTS:
  ```bash
  npm install -g prprompts-flutter-generator@latest
  ```

**Known Issues:**
- **Gemini CLI < 1.0.0:** Not supported (TOML slash commands not available)
- **Node.js < 20.0.0:** May cause compatibility issues with Gemini CLI

**Version Check:**
```bash
# Check installed versions
gemini --version
node --version
npm list -g prprompts-flutter-generator
```

---

## Installation Methods

Choose your preferred method:

| Method | Time | Best For |
|--------|------|----------|
| **npm Install** | 30 sec | Easiest! Works everywhere |
| **Extension Script** | 30 sec | Gemini-specific setup |
| **One-line** | 30 sec | Quick setup |
| **Standard (Clone repo)** | 2 min | Development, customization |
| **Manual** | 5 min | Full control |

---

### ⚡ Method 1: npm Install (Easiest!) 🆕

**Install from npm registry (recommended):**

```bash
# Install Gemini CLI if not already installed
npm install -g @google/gemini-cli

# Install PRPROMPTS
npm install -g prprompts-flutter-generator

# Verify installation
prprompts doctor
```

The postinstall script automatically:
- ✅ Detects Gemini CLI
- ✅ Configures all commands including v4.0 automation
- ✅ Sets up prompts and templates
- ✅ Creates unified configuration

**Then use:**
```bash
gemini create-prd
gemini gen-prprompts
gemini bootstrap-from-prprompts  # v4.0 automation!
gemini full-cycle                # Auto-implement features!
```

---

### ⚡ Method 2: Gemini Extension Script

**Install PRPROMPTS as a Gemini extension:**

```bash
# Clone repository
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator

# Run Gemini extension installer
bash install-gemini-extension.sh
```

This installs PRPROMPTS as a proper Gemini CLI extension with:
- Extension manifest (`extension.json`)
- All commands registered in Gemini config
- v4.0 automation commands included
- Optimized for Gemini's 1M token context

---

### ⚡ Method 3: One-Line Install

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

### PRD Commands
```bash
gemini create-prd          # Interactive PRD wizard (10 questions)
gemini auto-gen-prd        # Auto-generate PRD from description
gemini prd-from-files      # Generate PRD from existing markdown
gemini analyze-prd         # Validate and analyze PRD
```

### PRPROMPTS Generation
```bash
gemini gen-prprompts       # Generate all 32 PRPROMPTS files
gemini gen-phase-1         # Generate Phase 1 (10 files)
gemini gen-phase-2         # Generate Phase 2 (12 files)
gemini gen-phase-3         # Generate Phase 3 (10 files)
gemini gen-file            # Generate single file by name
```

### 🆕 v4.0 Automation Commands (40-60x Faster!)
```bash
gemini bootstrap-from-prprompts  # Complete project setup with intelligent planning (2 min)
gemini implement-next            # Auto-implement with state tracking (10 min)
gemini full-cycle                # Auto-implement 1-10 features (1-2 hours)
gemini review-and-commit         # Validate and commit changes
gemini qa-check                  # Comprehensive compliance audit
gemini update-plan               # Adaptive re-planning (30 sec) - NEW v4.1 Phase 3
```

---


### 🆕 v4.1 Phase 3: Implementation Planning Commands

**NEW intelligent project management commands:**

```bash
gemini generate-implementation-plan  # Create sprint-based plan (90 sec)
gemini update-plan                   # Re-plan based on progress (30 sec)
```

**`generate-implementation-plan`** - Intelligent implementation planning with:
- 📅 Sprint-based task breakdown (2-week iterations)
- 👥 Team allocation by skill level (senior/mid/junior)
- ⚡ Velocity-based sprint allocation
- 📝 Code snippets and test scenarios per task
- 🔗 Critical path visualization
- ⚠️  Risk register (HIPAA/PCI-DSS tasks flagged)
- 📊 Progress tracking (TODO/IN_PROGRESS/BLOCKED/DONE)
- 🔄 Integrates with FEATURE_DEPENDENCIES.md and COST_ESTIMATE.md
- 📄 Output: `docs/IMPLEMENTATION_PLAN.md` (850+ lines)

**`update-plan`** - Adaptive re-planning with:
- 📈 Calculates actual velocity from completed sprints
- 🚧 Identifies blockers and delays with impact analysis
- 🔄 Re-allocates remaining tasks to sprints
- 📅 Updates timeline forecasts
- 💡 Recommends scope/resource adjustments
- ⏰ Run after each sprint (every 2 weeks)
- 🎯 Maintains plan accuracy (±10% after 2-3 sprints)

**Enhanced automation commands:**
- `bootstrap-from-prprompts` now uses `generate-implementation-plan` for intelligent setup
- `implement-next` now supports state tracking (TODO/IN_PROGRESS/BLOCKED/DONE) and velocity monitoring

**Typical workflow with planning:**
```bash
# 1. Create PRD
gemini create-prd

# 2. Strategic planning (optional but recommended)
gemini estimate-cost
gemini analyze-dependencies

# 3. Generate implementation plan (NEW)
gemini generate-implementation-plan

# 4. Start development (uses plan)
gemini bootstrap-from-prprompts
gemini implement-next

# 5. After each sprint (NEW)
gemini update-plan
```

**Learn more:** See `docs/IMPLEMENTATION-PLANNING-GUIDE.md` for comprehensive guide.

---

## 🎯 Gemini CLI Skills (NEW!)

**PRPROMPTS now includes 8 specialized automation skills as global TOML slash commands for Gemini CLI.**

### Available Skills

**Automation (5 skills):**
- `/skills:automation:flutter-bootstrapper` - Complete project setup with Clean Architecture, security, tests
- `/skills:automation:feature-implementer` - Auto-implement features from implementation plan
- `/skills:automation:automation-orchestrator` - Orchestrate multi-feature implementation (1-10 features)
- `/skills:automation:code-reviewer` - Review code against PRPROMPTS patterns + security audit
- `/skills:automation:qa-auditor` - Comprehensive compliance audit (HIPAA, PCI-DSS, GDPR)

**PRPROMPTS Core (2 skills):**
- `/skills:prprompts-core:phase-generator` - Generate PRPROMPTS files by phase (1=Core, 2=Quality, 3=Demo)
- `/skills:prprompts-core:single-file-generator` - Regenerate single PRPROMPTS file (1-32)

**Development Workflow (1 skill):**
- `/skills:development-workflow:flutter-flavors` - Configure environment flavors (dev, staging, production)

### Gemini-Specific Features

**1. Colon Separator Syntax:**
```bash
gemini

# Gemini uses colon separators (not slashes like Qwen)
/skills:automation:code-reviewer
/skills:prprompts-core:phase-generator
```

**2. Inline Arguments with {{args}}:**
```bash
# Traditional interactive mode
/skills:automation:code-reviewer
# > Review type? security
# > Target path? lib/features/auth

# Gemini inline arguments (faster!)
/skills:automation:code-reviewer security lib/features/auth
# No prompts - arguments parsed automatically!
```

**3. 1M Token Context Utilization:**
```bash
# Gemini can load entire codebase in single pass
/skills:automation:code-reviewer full lib/

# Loads:
# - All files in lib/ (~150 files)
# - All 32 PRPROMPTS files
# - docs/PRD.md
# - IMPLEMENTATION_PLAN.md
# Total: ~800KB (fits in 1M context!)
```

**4. ReAct Agent Mode:**
```bash
# Gemini autonomously reasons and acts
/skills:automation:automation-orchestrator 10

# ReAct Loop:
# 1. Reason: "Need to implement auth first"
# 2. Act: Implement authentication feature
# 3. Validate: Run tests → 3 failures detected
# 4. Reason: "Missing mock factory"
# 5. Act: Generate mock factory
# 6. Validate: Run tests → All pass ✅
# [Continues autonomously for all 10 features]
```

**5. Free Tier Optimization:**
- **60 requests/minute** (4x more than Claude)
- **1,000 requests/day** (10x more than Claude)
- **No credit card required**

```bash
# Batch operations to maximize free tier
/skills:automation:automation-orchestrator 10
# Instead of 10 separate calls
```

### Smart Defaults

Skills use intelligent defaults to minimize user input:

```bash
/skills:automation:flutter-bootstrapper

# Only asks for critical inputs:
# > Project path? (press Enter for .):
# [Press Enter]
# > Compliance standards? (press Enter for none):
# hipaa,pci-dss

# All other inputs use smart defaults:
# ✅ enable_state_management: true (BLoC)
# ✅ enable_security: true
# ✅ enable_testing: true (80% coverage target)
# ✅ enable_ci_cd: true
```

**Result:** 80% reduction in required inputs!

### Quick Example Workflow

**From PRD to Production App (30 minutes):**

```bash
# 1. Start Gemini CLI
gemini

# 2. Bootstrap complete project
/skills:automation:flutter-bootstrapper . true true true true hipaa
# Result (60 sec): 30 files, Clean Architecture, security, tests

# 3. Implement all features
/skills:automation:automation-orchestrator 10
# Result (25 min): 150 files, 15K LOC, 10 features, 80% coverage

# 4. Final QA audit
/skills:automation:qa-auditor . hipaa,pci-dss true true QA_REPORT.md 85
# Result (90 sec): Score 87/100 ✅ PASS

# Total: 27 minutes
# vs. Manual: 3-5 days (40-60x faster!)
```

### Key Capabilities

**flutter-bootstrapper:**
- Complete Clean Architecture setup
- JWT verification (RS256 with public key)
- AES-256-GCM encryption
- Secure storage configuration
- BLoC state management
- Unit + widget test infrastructure
- GitHub Actions CI/CD
- Execution time: 60 seconds
- Output: 30 files (~5,000 lines)

**feature-implementer:**
- Reads `IMPLEMENTATION_PLAN.md`
- Generates domain/data/presentation layers
- Creates unit + widget tests (80% coverage)
- Follows PRPROMPTS patterns
- Security-first implementation
- Execution time: 2-3 minutes per feature
- Output: 15 files per feature (~2,000 lines)

**automation-orchestrator:**
- Implements 1-10 features automatically
- Progress tracking with ETA
- Validation gates (architecture, security, tests)
- Generates QA reports
- Optional checkpoints
- Execution time: 2-3 min per feature
- Output: Full application with tests

**code-reviewer:**
- Architecture review (Clean Architecture compliance)
- Security review (JWT, encryption, compliance)
- Testing review (coverage, quality)
- Style review (flutter analyze)
- Output formats: markdown, JSON, console
- Execution time: 30-45 seconds (leverages 1M context)

**qa-auditor:**
- Architecture audit (25 points)
- Security audit (30 points) - HIPAA, PCI-DSS, GDPR
- Testing audit (25 points)
- Code quality audit (10 points)
- Performance audit (5 points)
- Accessibility audit (5 points)
- Generates comprehensive `QA_REPORT.md`
- Execution time: 60-90 seconds

### Documentation

**Complete Skills Guide:**
- [docs/GEMINI-SKILLS-GUIDE.md](docs/GEMINI-SKILLS-GUIDE.md) - 900+ line comprehensive guide
  - All 8 skills with detailed examples
  - 4 complete workflow examples
  - Smart defaults deep dive
  - Gemini-specific features ({{args}}, 1M context, ReAct)
  - Troubleshooting guide
  - Performance benchmarks

### Installation

Skills are automatically installed when you install PRPROMPTS:

```bash
# Install PRPROMPTS globally
npm install -g prprompts-flutter-generator

# Skills are auto-installed to ~/.gemini/commands/skills/
# Verify:
gemini
/help
# You should see all 8 skills listed
```

**Manual Installation (if needed):**

```bash
# Linux/macOS:
bash scripts/install-gemini-skills.sh

# Windows (PowerShell):
powershell -ExecutionPolicy Bypass -File scripts\install-gemini-skills.ps1

# Windows (Batch):
scripts\install-gemini-skills.bat
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

**Manual coding:**
```bash
cat PRPROMPTS/01-feature_scaffold.md
cat PRPROMPTS/16-security_and_compliance.md
```

**🆕 OR use v4.0 automation (recommended!):**
```bash
# Complete project setup (2 min)
gemini bootstrap-from-prprompts

# Auto-implement 10 features (1-2 hours)
gemini full-cycle
# Enter: 10

# Run compliance audit
gemini qa-check

# Result: Production-ready app with tests!
```

---

## Verify Installation

Test your setup with platform-specific commands:

### Check Commands Are Available

```bash
# All platforms (bash, PowerShell, CMD)
gemini --version
gemini create-prd --help
```

### Verify Config Files Exist

**Windows CMD:**
```cmd
dir %USERPROFILE%\.config\gemini\
dir %USERPROFILE%\.config\gemini\prompts\
```

**Windows PowerShell:**
```powershell
Get-ChildItem $env:USERPROFILE\.config\gemini\
Get-ChildItem $env:USERPROFILE\.config\gemini\prompts\
```

**macOS/Linux (bash/zsh):**
```bash
ls -la ~/.config/gemini/
ls -la ~/.config/gemini/prompts/
```

**Expected output:**
- `config.yml` file present
- `prompts/` directory with 9 `.md` files
- All files should be readable (check permissions)

### Verify Gemini Skills (TOML Slash Commands)

**Windows CMD:**
```cmd
dir %USERPROFILE%\.gemini\commands\skills\
```

**Windows PowerShell:**
```powershell
Get-ChildItem -Recurse $env:USERPROFILE\.gemini\commands\skills\ -Filter *.toml
```

**macOS/Linux (bash/zsh):**
```bash
find ~/.gemini/commands/skills/ -name "*.toml"
```

**Expected:** 8 TOML files (5 automation + 2 core + 1 workflow)

### Test a Command

```bash
# Try creating a test PRD (will open interactive wizard)
gemini create-prd

# Or test non-interactive command
gemini --help

# Test Gemini skills (slash commands with colon separator)
gemini
# Then type: /help
```

**If commands not found:**
- Check PATH configuration (see Troubleshooting section below)
- Restart your terminal/shell
- Run `prprompts doctor` for diagnostics

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
