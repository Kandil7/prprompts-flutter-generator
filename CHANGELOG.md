# Changelog

All notable changes to the PRPROMPTS Flutter Generator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🚀 NEW - Gemini CLI Support (v2.2)

Added Google Gemini CLI as the **third AI assistant** option! Users can now choose between Claude Code, Qwen Code, OR Gemini CLI - or use all three together!

#### ✨ Added - Gemini CLI Integration

**Gemini Configuration** (`.gemini/`):
- `config.yml` - Gemini CLI configuration (optimized for 1M token context)
- `prompts/` - All 9 prompt files (shared with Claude/Qwen)
- Gemini-specific settings (agent mode with ReAct loop, 1M context)

**Installation Scripts (6 files)**:
- `scripts/install-gemini-commands.sh` - Linux/macOS installer
- `scripts/install-gemini-commands.bat` - Windows batch installer
- `scripts/install-gemini-commands.ps1` - Windows PowerShell installer
- `scripts/setup-gemini-gist.sh` - One-line curl installer
- `scripts/install-all.sh` - **NEW**: Triple installer (Claude + Qwen + Gemini)
- `scripts/install-all.bat` - **NEW**: Windows triple installer

**Documentation (3 comprehensive guides)**:
- `GEMINI.md` - Complete Gemini CLI installation guide (~300 lines)
  - Gemini CLI overview (Google's 1M context AI)
  - Three installation methods
  - Free tier benefits (60 req/min, 1,000/day)
  - Agent mode with ReAct loop
  - Troubleshooting section
- `docs/GEMINI-COMMANDS.md` - Gemini command reference (~350 lines)
  - All 9 commands detailed
  - Gemini-specific workflows
  - Free tier usage strategies
  - CI/CD integration examples
- `docs/AI-COMPARISON.md` - **3-way comparison** (~500 lines)
  - Claude vs Qwen vs Gemini feature table
  - Real-world scenario recommendations (5 scenarios)
  - Performance benchmarks (all three)
  - Cost analysis (free tier vs paid)
  - Quick decision matrix

**Package Updates**:
- Updated `package.json` to v2.2.0
- Added Gemini CLI keywords: gemini-cli, gemini-code-assist, google-gemini
- Added npm scripts: `install-gemini`, `install-all`
- Added optional dependency: `@google/gemini-cli`

**README Enhancements**:
- Updated "Choose Your AI Assistant" to 3-way comparison
- Added Gemini CLI badge in header (green)
- Updated version badge to v2.2
- Added Gemini to AI Assistant Guides section
- Updated comparison link to AI-COMPARISON.md
- Updated footer with Gemini CLI link
- Added Gemini Quick Link

#### 🎯 Key Benefits

**Massive Free Tier**:
- 60 requests per minute (perfect for CI/CD)
- 1,000 requests per day
- 1M token context window
- No credit card required

**Extended Context**:
- 1M tokens (equal to Qwen, 5x larger than Claude)
- Process entire large codebases at once
- Handle 400+ page PRDs

**Google Integration**:
- Works with Google Cloud, Vertex AI, Firebase
- Agent mode with ReAct loop
- Open-source CLI tool

**Same Workflow**:
- Commands identical: `gemini create-prd` = `claude create-prd`
- PRD format unchanged
- Switch between any of 3 AIs anytime

#### 🔄 Compatibility

- **Triple Support**: All prompts work with Claude, Qwen, AND Gemini
- **Cross-Platform**: Windows, macOS, Linux support
- **No Conflicts**: All three can be installed side-by-side
- **Seamless Switching**: Use best AI for each task

---

### 🚀 NEW - Qwen Code Support (v2.1)

Added full support for Alibaba's Qwen3-Coder AI assistant alongside Claude Code. Users can now choose between two world-class AI assistants or use both!

#### ✨ Added - Qwen Code Integration

**Qwen Configuration** (`.qwen/`):
- `config.yml` - Qwen Code command configuration (optimized for 256K-1M token context)
- `prompts/` - All 9 prompt files (identical to Claude version)
- Qwen-specific settings for extended context and agentic features

**Installation Scripts**:
- `scripts/install-qwen-commands.sh` - Linux/macOS installer
- `scripts/install-qwen-commands.bat` - Windows batch installer
- `scripts/install-qwen-commands.ps1` - Windows PowerShell installer
- `scripts/setup-qwen-gist.sh` - One-line curl installer
- `scripts/install-both.sh` - Dual installer (Claude + Qwen)
- `scripts/install-both.bat` - Windows dual installer

**Documentation**:
- `QWEN.md` - Complete Qwen Code installation guide
  - Qwen3-Coder overview and benefits
  - Three installation methods
  - Qwen-specific optimizations
  - Extended context (256K-1M tokens) examples
  - Troubleshooting section
- `docs/QWEN-COMMANDS.md` - Qwen command reference
  - All 9 commands detailed
  - Workflows and examples
  - Performance comparison with Claude
  - Advanced usage tips
- `docs/CLAUDE-VS-QWEN.md` - Comprehensive comparison guide
  - Feature comparison table
  - Real-world scenario recommendations
  - Performance benchmarks
  - Cost analysis
  - Security & privacy comparison
  - Quick decision matrix

**Package Updates**:
- Updated `package.json` to v2.0.0
- Added Qwen Code keywords
- Added npm scripts: `install-qwen`, `install-both`
- Added optional dependency: `@qwenlm/qwen-code`

**README Enhancements**:
- Added "Choose Your AI Assistant" section
- Qwen Code badge in header
- Updated table of contents
- Added Qwen to documentation section
- Updated footer with Qwen Code link
- Added Qwen Quick Link

#### 🎯 Key Benefits

**Extended Context**:
- Qwen supports 256K-1M tokens (vs Claude's 200K)
- Can process entire large codebases at once
- Better for microservices and monorepos

**Cost-Effective**:
- Free tier available (self-hosted)
- 50-80% lower costs than Claude API
- Perfect for budget-conscious teams

**Open Source**:
- Self-hostable for maximum data privacy
- Audit security yourself
- No data leaves your infrastructure

**Same Workflow**:
- Commands are identical: `qwen create-prd` = `claude create-prd`
- PRD format is the same
- Switch between AIs anytime without changes

#### 🔄 Compatibility

- **Dual Support**: All prompts work with both Claude and Qwen
- **Cross-Platform**: Windows, macOS, Linux support for Qwen
- **Seamless Switching**: Use Claude for some tasks, Qwen for others
- **No Conflicts**: Both can be installed side-by-side

---

### 🎯 Enhanced - PRPROMPTS Generator v2.0

Major upgrade to PRPROMPTS generation with comprehensive security patterns and strict PRP structure.

#### ✨ Added

**PRPROMPTS Generator v2.0** (`.claude/prompts/prprompts-generator.md`):
- **Strict PRP Pattern** - Mandatory 6-section structure (FEATURE, EXAMPLES, CONSTRAINTS, VALIDATION GATES, BEST PRACTICES, REFERENCES)
- **Critical Security Corrections**:
  - JWT: NEVER sign in Flutter, only verify with public key (RS256)
  - PCI-DSS: NEVER store full credit cards, use tokenization
  - HIPAA: Always encrypt PHI at rest (AES-256-GCM)
- **Integrated Tools**:
  - Structurizr for C4 diagrams
  - Serena MCP for semantic analysis
  - GitHub CLI for AI commands
- **Comprehensive Customization Rules**:
  - Compliance-based (HIPAA/PCI-DSS/GDPR)
  - Auth method (JWT/OAuth2/Firebase)
  - Offline support patterns
  - Team size adaptation
  - State management (BLoC/Riverpod)
- **Quality Requirements**:
  - 500-600 words per file (strict)
  - Real Flutter file paths (no placeholders)
  - Junior-friendly "why" explanations
  - Validation gates for every rule

**Documentation**:
- `docs/PRPROMPTS-SPECIFICATION.md` - Complete v2.0 specification
  - PRP pattern definition
  - JWT security best practices (with examples)
  - Clean Architecture layers explained
  - All 32 files detailed specifications
  - Common mistakes to avoid
  - Customization rules matrix
  - Tool integration guide

#### 🔧 Changed

- Updated README badges and version to 2.0
- Enhanced CHANGELOG with detailed PRPROMPTS v2.0 changes

## [1.0.0] - 2025-10-16

### 🎉 Major Release

First stable release with full cross-platform support and multiple PRD generation methods.

### ✨ Added

#### PRD Generation Methods
- **Generate from Files** (`claude prd-from-files`) - NEW! Convert existing markdown files to structured PRD
  - Smart inference of project type, compliance needs, and tech stack
  - Reads multiple files and synthesizes information
  - Minimal questions (1-3 only for missing critical info)
  - Auto-detects: HIPAA, PCI-DSS, GDPR, BLoC, offline mode, real-time features

- **Auto-Generate** (`claude auto-gen-prd`) - Zero-interaction PRD from simple description
- **Interactive Wizard** (`claude create-prd`) - 10-question guided PRD creation
- **Manual Templates** - Full control with examples for healthcare, fintech, education

#### Windows Support
- **Native Batch Installer** (`scripts/install-commands.bat`)
  - Windows Command Prompt compatible
  - Color-coded output
  - Proper error handling

- **PowerShell Installer** (`scripts/install-commands.ps1`)
  - Modern PowerShell syntax
  - Better error messages
  - Cross-PowerShell version compatible

- **One-Line Installers**
  - PowerShell: `irm https://raw.githubusercontent.com/.../setup-gist.ps1 | iex`
  - Command Prompt: `curl -o %TEMP%\setup-prprompts.bat ... && %TEMP%\setup-prprompts.bat`
  - Git Bash: `curl -sSL https://raw.githubusercontent.com/.../setup-gist.sh | bash`

- **Windows Documentation** (`WINDOWS.md`)
  - Complete installation guide for Windows
  - Troubleshooting section
  - All three installation methods documented

#### Documentation
- **PRD from Files Guide** (`docs/PRD-FROM-FILES-GUIDE.md`)
  - Complete guide with examples
  - Smart inference rules explained
  - Comparison with other methods

- **Enhanced README**
  - "What's New" section
  - Quick Start comparison table
  - Table of contents
  - Platform badges (Windows, macOS, Linux)
  - Reorganized roadmap with completed items
  - Footer with quick links
  - Installation verification section

- **CHANGELOG.md** - This file!

### 🔧 Changed

- Updated all installation scripts to include new prompt file
  - `scripts/install-commands.sh`
  - `scripts/install-commands.ps1`
  - `scripts/install-commands.bat`
  - `scripts/setup-gist.sh`
  - `scripts/setup-gist.ps1`
  - `scripts/setup-gist.bat`

- Enhanced `.claude/config.yml` with new `prd-from-files` command

- Updated README.md structure:
  - Added badges for Windows support and PRD methods
  - Added Quick Start comparison table
  - Reorganized Key Features section
  - Added All Available Commands summary
  - Enhanced Complete Workflow examples
  - Updated Roadmap with v1.0, v1.1, v2.0+ sections

### 📝 Files Added

- `.claude/prompts/generate-prd-from-files.md` - Main prompt for file-based PRD generation
- `scripts/install-commands.bat` - Windows batch installer
- `scripts/install-commands.ps1` - Windows PowerShell installer
- `scripts/setup-gist.bat` - One-line batch installer
- `scripts/setup-gist.ps1` - One-line PowerShell installer
- `WINDOWS.md` - Windows-specific installation guide
- `docs/PRD-FROM-FILES-GUIDE.md` - Comprehensive guide for file-based PRD generation
- `CHANGELOG.md` - This changelog

### 🐛 Fixed

- Installation scripts now properly handle Windows paths
- Color output works correctly on Windows terminals
- Config files correctly copied to `%USERPROFILE%\.config\claude\`

## [0.9.0] - 2025-10-15

### Initial Features

- Interactive PRD creation wizard (10 questions)
- Auto-generate PRD from simple description
- Generate 32 customized PRPROMPTS files
- Phase-based generation (3 phases)
- Single file generation
- PRD analysis and validation
- Linux/macOS support with bash installers
- Git Bash support for Windows

---

## Upcoming

See [Roadmap in README](README.md#-roadmap) for planned features.

### v1.1 (Coming Soon)
- VS Code extension
- GitHub Actions workflow generator
- Docker examples
- More compliance standards (ISO 27001, NIST, FedRAMP)

### v2.0+ (Future)
- Web UI for PRD creation
- Multi-language support
- Jira/Linear/Asana integration
- AI-powered PRD refinement
- Team collaboration features

---

[1.0.0]: https://github.com/Kandil7/prprompts-flutter-generator/releases/tag/v1.0.0
[0.9.0]: https://github.com/Kandil7/prprompts-flutter-generator/releases/tag/v0.9.0
