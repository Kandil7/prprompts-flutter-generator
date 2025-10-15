# Changelog

All notable changes to the PRPROMPTS Flutter Generator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
