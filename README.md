# PRD-to-PRPROMPTS Generator

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude-Code-blue)](https://claude.ai/code)
[![Qwen Code](https://img.shields.io/badge/Qwen-Code-orange)](QWEN.md)
[![Gemini CLI](https://img.shields.io/badge/Gemini-CLI-green)](GEMINI.md)
[![Flutter](https://img.shields.io/badge/Flutter-3.24+-blue)](https://flutter.dev)
[![Version](https://img.shields.io/badge/Version-2.2-success)](CHANGELOG.md)

[![Windows](https://img.shields.io/badge/Windows-Supported-0078D6?logo=windows)](WINDOWS.md)
[![macOS](https://img.shields.io/badge/macOS-Supported-000000?logo=apple)](README.md)
[![Linux](https://img.shields.io/badge/Linux-Supported-FCC624?logo=linux&logoColor=black)](README.md)

[![PRD Methods](https://img.shields.io/badge/PRD%20Methods-4-brightgreen)](#-creating-your-prd)
[![PRPROMPTS Files](https://img.shields.io/badge/PRPROMPTS-32%20Files-orange)](#-what-gets-generated)
[![Security](https://img.shields.io/badge/Security-HIPAA%20%7C%20PCI--DSS%20%7C%20GDPR-red)](#-security--compliance)

</div>

---

<div align="center">

### **Transform your PRD into 32 secure, production-ready development guides**

**Automatically generate customized PRPROMPTS files for Flutter projects with strict security patterns, Clean Architecture, and compliance-aware guidance.**

[🚀 Quick Start](#-quick-start---choose-your-path) • [📖 Docs](docs/PRPROMPTS-SPECIFICATION.md) • [💻 Install](#-installation) • [⭐ Examples](#-examples)

</div>

---

## 📑 Table of Contents

- [What's New](#-whats-new)
- [Choose Your AI Assistant](#-choose-your-ai-assistant)
- [Why Choose This](#-why-choose-this)
- [Security & Compliance](#-security--compliance)
- [Quick Start](#-quick-start---choose-your-path)
- [Installation](#-installation)
- [What Gets Generated](#-what-gets-generated)
- [Creating Your PRD](#-creating-your-prd)
- [Commands Reference](#-all-available-commands)
- [Documentation](#-documentation)
- [Examples](#-examples)

## ✨ What's New

### v2.0 - PRPROMPTS Generator Upgrade 🎯
- **Strict PRP Pattern** - 6-section structure (FEATURE, EXAMPLES, CONSTRAINTS, VALIDATION GATES, BEST PRACTICES, REFERENCES)
- **Critical Security Patterns** - Correct JWT verification, PCI-DSS tokenization, HIPAA encryption
- **Tool Integration** - Structurizr C4, Serena MCP, GitHub CLI
- **500-600 Words/File** - Consistent, comprehensive guides
- **Junior-Friendly** - Explains "why" behind every rule

### v1.0 - Multi-Platform & PRD Generation
- 🪟 **Full Windows Support** - Native batch & PowerShell installers
- 📄 **Generate PRD from Files** - Convert existing markdown docs to structured PRDs
- ⚡ **One-Line Install** - Works on Windows, macOS, and Linux
- 🧠 **Smart Inference** - Auto-detects compliance, tech stack, and architecture

---

## 🤖 Choose Your AI Assistant (3 Options!)

PRPROMPTS Generator works with **Claude Code**, **Qwen Code**, AND **Gemini CLI**:

| Feature | Claude Code | Qwen Code | Gemini CLI |
|---------|-------------|-----------|------------|
| **Context** | 200K tokens | 256K-1M | **1M tokens** |
| **Free Tier** | 20 msgs/day | Self-host | **60 req/min, 1K/day** ✨ |
| **Cost (API)** | $3-15/1M | $0.60-3/1M | **FREE** (preview) |
| **Accuracy** | 9.5/10 | 9.0/10 | 8.5/10 |
| **Best For** | Production | Large codebases | **Free tier, MVPs** |

**Installation**:
- **Claude Code**: Follow [Installation](#-installation) below
- **Qwen Code**: See [QWEN.md](QWEN.md)
- **Gemini CLI**: See [GEMINI.md](GEMINI.md)
- **All 3**: Run `./scripts/install-all.sh --global` 🚀

**Commands are identical**:
```bash
claude create-prd    # Claude Code
qwen create-prd      # Qwen Code
gemini create-prd    # Gemini CLI (same workflow!)
```

📖 **Full Comparison**: [Claude vs Qwen vs Gemini](docs/AI-COMPARISON.md)

---

## 🎯 Why Choose This?

### The Problem
Most Flutter projects lack **consistent, security-aware development guides**. Developers either:
- ❌ Waste time searching for best practices
- ❌ Make critical security mistakes (JWT signing in Flutter, storing credit cards, logging PHI)
- ❌ Lack compliance-specific guidance (HIPAA, PCI-DSS, GDPR)
- ❌ Struggle to onboard junior developers effectively

### The Solution
**PRPROMPTS Generator v2.0** creates 32 customized, security-audited guides that:
- ✅ **Prevent Common Mistakes** - Correct JWT verification, PCI-DSS tokenization, HIPAA encryption
- ✅ **Explain the "Why"** - Junior-friendly explanations behind every rule
- ✅ **Adapt to Your Stack** - Customized for your compliance needs, auth method, team size
- ✅ **Save Development Time** - 500-600 word guides covering all major aspects
- ✅ **Enforce Best Practices** - Validation gates for every rule

### What Makes It Unique?

| Feature | Generic Templates | PRPROMPTS Generator v2.0 |
|---------|-------------------|--------------------------|
| **Security Patterns** | Generic or incorrect | ✅ Audited (JWT, PCI-DSS, HIPAA) |
| **Customization** | One-size-fits-all | ✅ PRD-driven (compliance, team, stack) |
| **Junior-Friendly** | Assumes knowledge | ✅ Explains "why" behind every rule |
| **Validation Gates** | No enforcement | ✅ Pre-merge checklists + CI checks |
| **Tool Integration** | Manual setup | ✅ Structurizr, Serena MCP, GitHub CLI |
| **Real Examples** | Placeholder code | ✅ Real Flutter paths + working code |

---

## 🔐 Security & Compliance

### Critical Security Patterns (v2.0)

#### JWT Authentication ⚠️ **Most Common Mistake**

**❌ WRONG (Security Vulnerability)**:
```dart
// NEVER do this - exposes private key!
final token = JWT({'user': 'john'}).sign(SecretKey('my-secret'));
```

**✅ CORRECT (Secure Pattern)**:
```dart
// Flutter only verifies tokens (public key)
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

Future<bool> verifyToken(String token) async {
  try {
    final jwt = JWT.verify(
      token,
      RSAPublicKey(publicKey), // Public key only!
      audience: Audience(['my-app']),
      issuer: 'api.example.com',
    );
    return jwt.payload['exp'] > DateTime.now().millisecondsSinceEpoch / 1000;
  } catch (e) {
    return false;
  }
}
```

**Why?** Backend signs with private key (RS256), Flutter verifies with public key. This prevents token forgery.

---

#### PCI-DSS Compliance 💳

**❌ WRONG (PCI-DSS Violation)**:
```dart
// NEVER store full card numbers!
await db.insert('cards', {'number': '4242424242424242'});
```

**✅ CORRECT (PCI-DSS Compliant)**:
```dart
// Use tokenization (Stripe, PayPal, etc.)
final token = await stripe.createToken(cardNumber);
await db.insert('cards', {
  'last4': cardNumber.substring(cardNumber.length - 4),
  'token': token, // Only store token
  'brand': 'Visa',
});
```

**Why?** Storing full card numbers requires PCI-DSS Level 1 certification. Tokenization reduces your scope.

---

#### HIPAA Compliance 🏥

**❌ WRONG (HIPAA Violation)**:
```dart
// NEVER log PHI (Protected Health Information)!
print('Patient SSN: ${patient.ssn}');
```

**✅ CORRECT (HIPAA Compliant)**:
```dart
// Encrypt PHI at rest (AES-256-GCM)
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final encrypted = await _encryptor.encrypt(
  patientData,
  key: await _secureStorage.read(key: 'encryption_key'),
);
await db.insert('patients', {'encrypted_data': encrypted});

// Safe logging (no PHI)
print('Patient record updated: ${patient.id}');
```

**Why?** HIPAA §164.312(a)(2)(iv) requires encryption of ePHI at rest. Logging PHI is an audit violation.

---

### Compliance Support

PRPROMPTS automatically adapts based on your PRD's `compliance` field:

| Compliance | What Gets Generated |
|------------|---------------------|
| **HIPAA** | PHI encryption, audit logging, HTTPS-only, consent forms |
| **PCI-DSS** | Payment tokenization, TLS 1.2+, SAQ checklist, secure transmission |
| **GDPR** | Consent management, right to erasure, data portability, cookie consent |
| **SOC2** | Access controls, encryption, audit trails, incident response |
| **COPPA** | Parental consent, age verification, data minimization |
| **FERPA** | Student records protection, authorized access only |

---

## 🎯 What is This?

Transform your PRD into a complete set of development guides that adapt to your project's specific needs:

- ✅ **Healthcare app with HIPAA?** → Auto-generates PHI encryption guides, audit logging, compliance checkers
- ✅ **Fintech with payments?** → Auto-generates PCI-DSS checklists, tokenization patterns
- ✅ **Offline-first app?** → Auto-generates sync strategies, conflict resolution, local database patterns
- ✅ **Team with juniors?** → Auto-generates onboarding docs with "why" explanations

### 🚀 Quick Start - Choose Your Path

| I have... | Use this command | Time | Docs |
|-----------|------------------|------|------|
| 📝 **Existing markdown files** | `claude prd-from-files` | 2 min | [Guide](docs/PRD-FROM-FILES-GUIDE.md) |
| 💭 **A simple project idea** | `claude auto-gen-prd` | 1 min | [Guide](docs/AUTO-PRD-GUIDE.md) |
| 🎯 **Time to answer 10 questions** | `claude create-prd` | 5 min | [Guide](docs/PRD-GUIDE.md) |
| ✍️ **Full control needed** | Copy template | 30 min | [Template](templates/) |

## 🌟 Key Features

### PRD Generation (4 Methods)
- 📄 **From Existing Files** - Convert markdown docs to structured PRD (NEW!)
- 🤖 **Auto-Generate** - Zero-interaction from simple description
- 💬 **Interactive Wizard** - 10 questions for complete PRD
- ✍️ **Manual Templates** - Full control with examples

### Smart & Adaptive
- **PRD-Driven**: Every output is traceable to your PRD
- **Compliance-Aware**: HIPAA, PCI-DSS, GDPR, SOC2, COPPA, FERPA (auto-detected)
- **Architecture-Specific**: Clean Architecture, BLoC/Cubit, offline-first, real-time
- **Team-Adaptive**: Scales from 5 to 50+ developers, adjusts for junior/senior mix

### Cross-Platform & Production-Ready
- 🪟 **Windows Support** - Native batch, PowerShell, Git Bash
- 🍎 **macOS/Linux** - One-line curl install
- 🔧 **Tool-Integrated**: Structurizr (C4), Serena MCP, GitHub CLI
- 🚀 **Production-Ready**: Tests, CI/CD, security scans, audit logging

## 📦 Installation

### Prerequisites

- [Claude Code CLI](https://docs.claude.ai/code)
- Node.js 18+ (for Claude Code)
- Flutter 3.24+ (for your project)
- Git

**Windows Users:** See [WINDOWS.md](WINDOWS.md) for detailed Windows installation guide.

### ⚡ Quick Install (Copy & Paste)

**One command - installs everything:**

#### Linux / macOS / Git Bash

```bash
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.sh | bash
```

#### Windows PowerShell

```powershell
irm https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.ps1 | iex
```

#### Windows Command Prompt

```cmd
curl -o %TEMP%\setup-prprompts.bat https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.bat && %TEMP%\setup-prprompts.bat
```

**That's it!** Now run `claude create-prd` from any directory.

---

### Standard Install

```bash
# Clone repository
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator

# Run setup
./scripts/setup.sh
```

### Manual Install

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Copy to your Flutter project
cp -r .claude your-flutter-project/
cp -r scripts your-flutter-project/
cp templates/PRD-template.md your-flutter-project/docs/PRD.md

# Setup aliases
echo "source $(pwd)/scripts/prp-aliases.sh" >> ~/.bashrc
source ~/.bashrc
```

## ⚙️ Claude Code Commands (One-Line Install)

**NEW!** Use simple commands like `claude create-prd` instead of full paths.

### ⚡ Super Quick Install

**Copy and paste one command:**

**Linux / macOS / Git Bash:**
```bash
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.sh | bash
```

**Windows PowerShell:**
```powershell
irm https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.ps1 | iex
```

**Windows Command Prompt:**
```cmd
curl -o %TEMP%\setup-prprompts.bat https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.bat && %TEMP%\setup-prprompts.bat
```

Installs commands globally - works everywhere!

### Alternative Install Methods

#### Linux / macOS / Git Bash

```bash
# If you already cloned the repo:
cd prprompts-flutter-generator
./scripts/install-commands.sh --global  # Global
./scripts/install-commands.sh --local   # Local only
```

#### Windows (Native)

**Option 1: Batch Script (Recommended)**
```cmd
cd prprompts-flutter-generator
scripts\install-commands.bat --global
```

**Option 2: PowerShell**
```powershell
cd prprompts-flutter-generator
powershell -ExecutionPolicy Bypass -File .\scripts\install-commands.ps1 --global
```

**Option 3: Git Bash (if installed)**
```bash
cd prprompts-flutter-generator
./scripts/install-commands.sh --global
```

**Now you can use:

```bash
claude create-prd      # Interactive PRD wizard
claude auto-gen-prd    # Auto-generate from description
claude prd-from-files  # Generate PRD from markdown files
claude analyze-prd     # Validate PRD
claude gen-prprompts   # Generate all 32 files
claude gen-phase-1     # Generate Phase 1
claude gen-file        # Generate single file
```

### ✅ Verify Installation

Test your installation:
```bash
# Check if commands are available
claude create-prd --help
claude prd-from-files --help
claude gen-prprompts --help

# Verify config files exist
# Windows: %USERPROFILE%\.config\claude\
# macOS/Linux: ~/.config/claude/
```

📖 **Full Command Reference:** [docs/CLAUDE-COMMANDS.md](docs/CLAUDE-COMMANDS.md)

---

## ⚙️ Manual Configuration (Optional)

If you prefer manual setup, here are alternative methods:

### Option 1: Project-Level Configuration (Recommended)

Copy `.claude` directory to your Flutter project:

```bash
cd your-flutter-project
cp -r /path/to/prprompts-flutter-generator/.claude .
```

Now you can run:
```bash
claude create-prd      # Interactive PRD wizard
claude auto-gen-prd    # Auto-generate from description
```

### Option 2: Global Configuration

Add to your global Claude Code config (`~/.config/claude/config.yml` or `~/.claude/config.yml`):

```yaml
# ~/.config/claude/config.yml
prompts:
  create-prd:
    file: "/path/to/prprompts-flutter-generator/.claude/prompts/generate-prd.md"
    description: "Interactive PRD creation wizard"

  auto-gen-prd:
    file: "/path/to/prprompts-flutter-generator/.claude/prompts/auto-generate-prd.md"
    description: "Auto-generate PRD from description (no questions)"

commands:
  prp-gen:
    script: "/path/to/prprompts-flutter-generator/scripts/generate-prprompts.sh all"
    description: "Generate all PRPROMPTS files"

  prp-auto:
    script: "/path/to/prprompts-flutter-generator/scripts/auto-gen-prd.sh"
    description: "Auto-generate PRD and PRPROMPTS"
```

Then use anywhere:
```bash
claude create-prd      # From any project directory
claude auto-gen-prd    # From any project directory
claude prp-gen         # Generate PRPROMPTS
claude prp-auto        # Full auto workflow
```

### Option 3: Shell Aliases (Fastest)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# PRD Generator Aliases
export PRPROMPTS_DIR="/path/to/prprompts-flutter-generator"

alias create-prd="claude --prompt $PRPROMPTS_DIR/.claude/prompts/generate-prd.md"
alias auto-prd="$PRPROMPTS_DIR/scripts/auto-gen-prd.sh"
alias gen-prprompts="$PRPROMPTS_DIR/scripts/generate-prprompts.sh all"

# Reload shell
source ~/.bashrc  # or source ~/.zshrc
```

Then use:
```bash
create-prd         # Interactive wizard
auto-prd           # Auto-generate
gen-prprompts      # Generate PRPROMPTS
```

### Verify Installation

Test your setup:
```bash
# Test interactive PRD creation
claude create-prd --help

# Test auto PRD generation
claude auto-gen-prd --help

# Or with aliases
create-prd --help
auto-prd --help
```

## 🚀 Quick Start

### 1. Create Your PRD

```bash
cd your-flutter-project
mkdir -p docs
cp templates/PRD-template.md docs/PRD.md
# Edit docs/PRD.md with your project details
```

### 2. Generate PRPROMPTS

```bash
# Analyze your PRD
prp-analyze

# Generate all 32 files
prp-gen

# Or generate by phase
prp-p1    # Phase 1: Core Architecture (10 files)
prp-p2    # Phase 2: Quality & Security (12 files)
prp-p3    # Phase 3: Demo & Learning (10 files + README)
```

### 3. Use in Development

```bash
# Reference guides during development
cat PRPROMPTS/01-feature_scaffold.md
cat PRPROMPTS/16-security_and_compliance.md

# Regenerate after PRD changes
prp-gen
```

## 📝 Creating Your PRD

### 🤖 Auto-Generate (Zero Interaction) - NEW!

**Fastest way!** Generate complete PRD from a simple description file - no questions asked!

```bash
# Step 1: Create description (30 seconds)
cat > project_description.md << 'EOF'
# HealthTrack Pro

Diabetes tracking app for patients to log blood glucose and
message their doctor. Must comply with HIPAA and work offline.

## Users
- Diabetes patients
- Endocrinologists

## Features
1. Blood glucose tracking
2. Medication reminders
3. Secure messaging
4. Health reports
EOF

# Step 2: Auto-generate PRD (10 seconds)
claude auto-gen-prd
# Or: ./scripts/auto-gen-prd.sh

# Step 3: Generate PRPROMPTS (30 seconds)
claude prp-gen
# Or: prp-gen

# Done! Start coding
```

**What Gets Auto-Inferred:**
✅ Project type (healthcare/fintech/education/etc.)
✅ Compliance requirements (HIPAA/PCI-DSS/GDPR)
✅ Platforms (iOS/Android/Web)
✅ Authentication method (JWT/OAuth2/Firebase)
✅ Offline support & Real-time requirements
✅ Team size & Timeline estimates

📖 **Full Guide:** [docs/AUTO-PRD-GUIDE.md](docs/AUTO-PRD-GUIDE.md)

---

### 💬 Interactive Wizard

Interactive generator with 10 questions:

```bash
claude create-prd
# Or: claude --prompt .claude/prompts/generate-prd.md
```

Answer 10 simple questions and get a complete PRD with YAML frontmatter!

### Questions You'll Be Asked:

1. **Project name?** → "HealthTrack Pro"
2. **Project type?** → Healthcare, Fintech, Education, etc.
3. **Platforms?** → iOS, Android, Web
4. **Compliance?** → HIPAA, PCI-DSS, GDPR, etc.
5. **Authentication?** → JWT, OAuth2, Firebase
6. **Offline support?** → Yes/No
7. **Real-time updates?** → Yes/No
8. **Sensitive data?** → PHI, PII, Payment, etc.
9. **Team size?** → Small, Medium, Large
10. **Demo frequency?** → Weekly, Biweekly, Monthly

### What You Get

✅ **YAML Frontmatter** - Structured metadata for automation
✅ **Executive Summary** - Product overview and vision
✅ **Feature Specifications** - Detailed user stories and acceptance criteria
✅ **Compliance Sections** - HIPAA, PCI-DSS, GDPR requirements
✅ **Technical Architecture** - Clean Architecture, BLoC, API specs
✅ **Testing Strategy** - Unit, widget, integration, golden tests
✅ **Timeline & Milestones** - Sprint plans and deliverables
✅ **Success Metrics** - KPIs and measurement tools

### 📄 Generate from Existing Files - NEW!

**Have existing documentation?** Convert your markdown files into a structured PRD!

```bash
# Step 1: Run the command
claude prd-from-files

# Step 2: Provide file paths (one per line)
docs/requirements.md
specs/features.md
notes/tech-stack.md

# Step 3: Answer 2-3 clarifying questions (if needed)
# Step 4: Get complete PRD with YAML frontmatter!
```

**What it does:**
- ✅ Reads your existing markdown files
- ✅ Extracts project info, features, and requirements
- ✅ Auto-detects compliance needs (HIPAA, PCI-DSS, etc.)
- ✅ Infers technical stack and architecture
- ✅ Only asks questions for missing critical info
- ✅ Generates complete PRD in `docs/PRD.md`

**Example files you can provide:**
- Requirements documents
- Feature specifications
- Technical architecture docs
- Meeting notes
- Project proposals
- Existing PRDs (to restructure)

**Smart inference:**
- "patient" + "health" → Healthcare app with HIPAA
- "payment" + "checkout" → Fintech app with PCI-DSS
- "real-time chat" → WebSocket + real_time: true
- "offline mode" → SQLite + offline_support: true

---

### Alternative Methods

**Copy Template:**
```bash
cp templates/PRD-full-template.md docs/PRD.md
vim docs/PRD.md  # Customize
```

**Copy Example:**
```bash
# Healthcare
cp examples/healthcare-prd.md docs/PRD.md

# Fintech
cp examples/fintech-prd.md docs/PRD.md

# Education
cp examples/education-prd.md docs/PRD.md

# SaaS
cp examples/saas-prd.md docs/PRD.md
```

### Next Steps

```bash
# Start development with your PRD
cat docs/PRD.md

# Generate PRPROMPTS based on PRD
prp-gen
```

📖 **Full Guide:** See [docs/PRD-GUIDE.md](docs/PRD-GUIDE.md)

---

### 🔄 Method Comparison

| Method | Time | Accuracy | Best For |
|--------|------|----------|----------|
| **🤖 Auto** | 1 min | 85% | Quick prototypes, standard projects |
| **📄 From Files** | 2 min | 90% | Existing docs, legacy projects |
| **💬 Interactive** | 5 min | 95% | Production projects, high stakes |
| **✍️ Manual** | 30 min | 100% | Complex projects, unique requirements |

**Recommendation:**
- Have existing docs? Use **From Files**
- Starting fresh? Use **Auto** or **Interactive**
- Need full control? Go **Manual**

## 📖 Documentation

### PRPROMPTS Generation
- **[PRPROMPTS Specification v2.0](docs/PRPROMPTS-SPECIFICATION.md)** - Complete guide (PRP pattern, security, customization)

### PRD Creation
- [Auto PRD Guide](docs/AUTO-PRD-GUIDE.md) - Zero-interaction PRD generation
- [PRD from Files Guide](docs/PRD-FROM-FILES-GUIDE.md) - Generate PRD from existing markdown
- [PRD Creation Guide](docs/PRD-GUIDE.md) - Interactive PRD creation

### AI Assistant Guides
- **[Gemini CLI Installation](GEMINI.md)** - Complete guide for Gemini CLI ✨ NEW!
- **[Qwen Code Installation](QWEN.md)** - Complete guide for Qwen3-Coder
- **[AI Comparison (3-way)](docs/AI-COMPARISON.md)** - Claude vs Qwen vs Gemini
- [Gemini Commands Reference](docs/GEMINI-COMMANDS.md) - Gemini command list
- [Qwen Commands Reference](docs/QWEN-COMMANDS.md) - Qwen command list
- [Claude Commands Reference](docs/CLAUDE-COMMANDS.md) - Claude command list
- [Windows Installation](WINDOWS.md) - Windows-specific guide

### Configuration & Usage
- [Usage Guide](docs/USAGE.md) - Detailed usage instructions
- [Customization](docs/CUSTOMIZATION.md) - How to customize prompts
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [API Reference](docs/API.md) - CLI commands and options
- [Testing Guide](TESTING.md) - Test commands across all AI assistants

## 🎓 Examples

### Healthcare App with HIPAA

```yaml
# docs/PRD.md frontmatter
project_type: "healthcare"
compliance: ["hipaa", "gdpr"]
auth_method: "jwt"
sensitive_data: ["phi", "pii"]
offline_support: true
```

**Generated files include:**
- PHI encryption patterns (AES-256-GCM)
- HIPAA audit logging
- JWT RS256 verification
- Offline-first sync with encryption
- `hipaa-compliance-checker` subagent

[See full example →](examples/healthcare-prd.md)

### Fintech Payment App

```yaml
project_type: "fintech"
compliance: ["pci-dss", "gdpr"]
auth_method: "oauth2"
sensitive_data: ["payment", "pii"]
real_time: true
```

**Generated files include:**
- PCI-DSS compliance checklist
- Payment tokenization patterns
- 2+ senior approvals for payment code
- Real-time WebSocket security
- `fintech-security-reviewer` subagent

[See full example →](examples/fintech-prd.md)

## 🏗️ What Gets Generated

**All files are created inside the `PRPROMPTS/` folder** for organized, easy-to-navigate structure.

### 📂 Folder Structure

```
your-flutter-project/
├── lib/
├── test/
├── docs/
│   └── PRD.md
└── PRPROMPTS/                  ← All generated files here
    ├── 01-feature_scaffold.md
    ├── 02-responsive_layout.md
    ├── 03-bloc_implementation.md
    ├── ... (29 more files)
    ├── 32-lessons_learned_engine.md
    └── README.md               ← Index & usage guide
```

**Total**: 33 files (32 guides + 1 README), all in `PRPROMPTS/`

---

### Phase 1: Core Architecture (10 files)

**Location**: `PRPROMPTS/01-*.md` through `PRPROMPTS/10-*.md`

1. **01-feature_scaffold.md** - Clean Architecture patterns
2. **02-responsive_layout.md** - Adaptive UI
3. **03-bloc_implementation.md** - BLoC vs Cubit
4. **04-api_integration.md** - Auth, error handling, JWT verification
5. **05-testing_strategy.md** - Unit/Widget/Integration tests
6. **06-design_system_usage.md** - Theme, components
7. **07-onboarding_junior.md** - Junior developer guide
8. **08-accessibility_a11y.md** - WCAG 2.1 compliance
9. **09-internationalization_i18n.md** - Multi-language
10. **10-performance_optimization.md** - Build times, FPS

### Phase 2: Quality & Security (12 files)

**Location**: `PRPROMPTS/11-*.md` through `PRPROMPTS/22-*.md`

11. **11-git_branching_strategy.md** - Git workflows
12. **12-progress_tracking_workflow.md** - Sprint planning
13. **13-multi_team_coordination.md** - Cross-team collab
14. **14-security_audit_checklist.md** - Pre-release validation
15. **15-release_management.md** - App Store process
16. **16-security_and_compliance.md** - ⭐ PRD-sensitive (HIPAA/PCI-DSS/GDPR)
17. **17-performance_optimization_detailed.md** - Advanced profiling
18. **18-quality_gates_and_code_metrics.md** - Coverage, complexity
19. **19-localization_and_accessibility.md** - Combined L10n+A11y
20. **20-versioning_and_release_notes.md** - Semantic versioning
21. **21-team_culture_and_communication.md** - Async-first
22. **22-autodoc_integration.md** - Auto-documentation

### Phase 3: Demo & Learning (10 files + README)

**Location**: `PRPROMPTS/23-*.md` through `PRPROMPTS/32-*.md` + `PRPROMPTS/README.md`

23. **23-ai_pair_programming_guide.md** - Claude/Copilot
24. **24-dashboard_and_analytics.md** - Metrics, monitoring
25. **25-tech_debt_and_refactor_strategy.md** - Debt tracking
26. **26-demo_environment_setup.md** - ⭐ PRD-scenario based
27. **27-demo_progress_tracker.md** - Client dashboard
28. **28-demo_branding_and_visuals.md** - Demo UI
29. **29-demo_deployment_automation.md** - Demo CI/CD
30. **30-client_demo_report_template.md** - Weekly reports
31. **31-project_role_adaptation.md** - ⭐ PRD-driven roles
32. **32-lessons_learned_engine.md** - Retrospectives
+ **README.md** - Usage guide & index

## 🎯 PRP Framework

Every file follows the **Prompt Reference Pattern**:

```markdown
## FEATURE
What this guide helps you accomplish

## EXAMPLES
Real code with actual file paths

## CONSTRAINTS
✅ DO / ❌ DON'T rules

## VALIDATION GATES
Manual checklist + automated CI checks

## BEST PRACTICES
Junior-friendly explanations with "Why?" sections

## REFERENCES
Official docs, compliance guides, internal ADRs
```

## 🔧 CLI Commands

### PRD Creation Commands

```bash
# Auto-generate PRD (zero interaction)
claude auto-gen-prd

# Generate from existing markdown files
claude prd-from-files

# Interactive PRD wizard (10 questions)
claude create-prd

# Or use full paths
./scripts/auto-gen-prd.sh
claude --prompt .claude/prompts/generate-prd.md
claude --prompt .claude/prompts/generate-prd-from-files.md
```

### PRPROMPTS Generation Commands

```bash
# Generate all PRPROMPTS
claude prp-gen       # If configured
prp-gen             # Using aliases

# Generate by phase
prp-p1              # Phase 1: Core Architecture (10 files)
prp-p2              # Phase 2: Quality & Security (12 files)
prp-p3              # Phase 3: Demo & Learning (10 files + README)

# Generate specific file
prp-file security_and_compliance

# Full workflow
prp-full            # Analyze + Generate + Validate

# YOLO mode (auto-approve)
prp-yolo

# Interactive mode
prp-chat
```

### Complete Workflow

```bash
# Method 1: From existing docs (2 min)
claude prd-from-files && claude gen-prprompts

# Method 2: Auto-generate (1 min)
claude auto-gen-prd && claude gen-prprompts

# Method 3: Interactive (5 min)
claude create-prd && claude gen-prprompts

# Or with aliases (if configured)
auto-prd && gen-prprompts
```

### 📋 All Available Commands

**PRD Creation:**
```bash
claude create-prd          # Interactive wizard (10 questions)
claude auto-gen-prd        # Auto from description file
claude prd-from-files      # From existing markdown files
claude analyze-prd         # Validate and analyze PRD
```

**PRPROMPTS Generation:**
```bash
claude gen-prprompts       # All 32 files
claude gen-phase-1         # Phase 1: Core (10 files)
claude gen-phase-2         # Phase 2: Quality (12 files)
claude gen-phase-3         # Phase 3: Demo (10 files)
claude gen-file            # Single file by name
```

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator
npm install
./scripts/setup.sh
```

### Running Tests

```bash
# Test PRD validation
npm test

# Test generation
./scripts/generate-prprompts.sh all --dry-run
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code) by Anthropic
- Inspired by Clean Architecture by Robert C. Martin
- Flutter framework by Google

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- 💬 [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)

## 🗺️ Roadmap

### ✅ Completed

**v2.0 - PRPROMPTS Generator Upgrade** (Current)
- [x] Strict PRP pattern (6 mandatory sections)
- [x] Critical security corrections (JWT, PCI-DSS, HIPAA)
- [x] Tool integration (Structurizr, Serena MCP, GitHub CLI)
- [x] Comprehensive customization rules
- [x] 500-600 words per file (enforced)
- [x] Junior-friendly "why" explanations

**v1.0 - Multi-Platform & PRD Generation**
- [x] Full Windows support (batch, PowerShell, Git Bash)
- [x] Generate PRD from existing markdown files
- [x] One-line installers for all platforms
- [x] Smart compliance and tech stack inference
- [x] Auto-generate PRD from simple description
- [x] 4 PRD generation methods

### 🚀 Coming Soon (v2.1)
- [ ] **Phase prompt enhancements** - Update phase-1, phase-2, phase-3 prompts to v2.0 spec
- [ ] **Example PRPROMPTS** - Generated samples for healthcare, fintech, education
- [ ] **VS Code snippets** - Code snippets for common patterns
- [ ] **GitHub Actions workflows** - CI/CD templates

### 🎯 Future (v3.0+)
- [ ] **VS Code Extension** - Generate PRPROMPTS directly from VSCode
- [ ] **Web UI** - Browser-based PRD creation
- [ ] **More Compliance** - ISO 27001, NIST, FedRAMP, CCPA
- [ ] **Multi-language** - Spanish, French, German PRPROMPTS
- [ ] **Jira/Linear Integration** - Sync with project management tools
- [ ] **AI-Powered Refinement** - Suggest improvements to existing PRDs
- [ ] **Team Collaboration** - Shared PRD editing and commenting

## ⭐ Star Us!

If this project helps you, please give it a ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ for Flutter developers**

### Quick Links

[🚀 Quick Start](#-quick-start---choose-your-path) •
[📦 Install](#-installation) •
[📝 Create PRD](#-creating-your-prd) •
[📖 Docs](docs/) •
[🤖 Gemini Guide](GEMINI.md) •
[🤖 Qwen Guide](QWEN.md) •
[🪟 Windows Guide](WINDOWS.md) •
[💬 Support](https://github.com/Kandil7/prprompts-flutter-generator/issues)

### Supported Platforms

![Windows](https://img.shields.io/badge/Windows-0078D6?style=flat&logo=windows&logoColor=white)
![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black)

**Powered by** [Claude Code](https://claude.ai/code) • [Qwen Code](https://github.com/QwenLM/qwen-code) • [Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli) | **Built for** [Flutter](https://flutter.dev)

</div>
