# PRD-to-PRPROMPTS Generator

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-3.1-success)](docs/NEW-FEATURES-V3.md)
[![PRD Methods](https://img.shields.io/badge/PRD%20Methods-4-brightgreen)](#creating-your-prd)
[![PRPROMPTS](https://img.shields.io/badge/PRPROMPTS-32%20Files-orange)](#what-gets-generated)
[![Security](https://img.shields.io/badge/Security-HIPAA%20%7C%20PCI--DSS%20%7C%20GDPR-red)](#security--compliance)
[![New](https://img.shields.io/badge/NEW-Smart%20Installer-blue)](#v30-new-features)

[![Claude Code](https://img.shields.io/badge/Claude-Code-blue)](https://claude.ai/code)
[![Qwen Code](https://img.shields.io/badge/Qwen-Code-orange)](QWEN.md)
[![Gemini CLI](https://img.shields.io/badge/Gemini-CLI-green)](GEMINI.md)
[![Flutter](https://img.shields.io/badge/Flutter-3.24+-blue)](https://flutter.dev)

[![Windows](https://img.shields.io/badge/Windows-Supported-0078D6?logo=windows)](WINDOWS.md)
[![macOS](https://img.shields.io/badge/macOS-Supported-000000?logo=apple)](#)
[![Linux](https://img.shields.io/badge/Linux-Supported-FCC624?logo=linux&logoColor=black)](#)

</div>

---

<div align="center">

## **Transform Your PRD into 32 Secure, Production-Ready Development Guides**

**Automatically generate customized PRPROMPTS files for Flutter projects with strict security patterns, Clean Architecture, and compliance-aware guidance.**

**⏱️ Total Setup Time: 30 seconds** • **🎯 npm Install Available** • **🔒 Security Audited** • **✨ NEW v3.1: npm Support**

</div>

<div align="center">

### **🚀 One Command. Complete Setup.**

**🆕 v3.1 - All Platforms (Easiest!):**
```bash
# Install via npm (works on Windows/macOS/Linux)
npm install -g prprompts-flutter-generator

# Then use anywhere:
prprompts create       # Create PRD
prprompts generate     # Generate all 32 files
```

**Alternative Methods:**

**Windows PowerShell:**
```powershell
irm https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.ps1 | iex
```

**Linux / macOS / Git Bash:**
```bash
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/smart-install.sh | bash
```

[📦 Quick Install](#installation) • [🪟 Windows Guide](WINDOWS-QUICKSTART.md) • [✨ v3.0 Features](#v30-new-features) • [📖 Docs](docs/PRPROMPTS-SPECIFICATION.md)

</div>

---

## ✨ v3.0 New Features

<div align="center">

**🎉 Major update with powerful installation improvements!**

</div>

<table>
<tr>
<td width="50%">

### 🤖 Smart Unified Installer
**One command to install everything**
- Auto-detects your OS and AI assistants
- Offers to install missing AIs
- Installs commands for all detected AIs
- Creates unified configuration
- Beautiful interactive prompts

</td>
<td width="50%">

### 🔧 Unified CLI (`prprompts` command)
**Single interface for all AIs**
```bash
prprompts create     # Instead of claude/qwen/gemini
prprompts generate   # Uses your preferred AI
prprompts switch ai  # Change default AI
prprompts doctor     # Diagnose issues
```

</td>
</tr>
<tr>
<td width="50%">

### 🔄 Auto-Update System
**Stay current effortlessly**
- One-command updates from GitHub
- Automatic backup before update
- Rollback capability
- Version checking

```bash
prprompts update     # Update to latest
```

</td>
<td width="50%">

### 📦 Project Templates
**Quick start for common projects**
- Healthcare (HIPAA-compliant)
- Fintech (PCI-DSS compliant)
- E-Commerce
- Generic apps

Pre-configured with best practices!

</td>
</tr>
<tr>
<td width="50%">

### 🐚 Shell Completions
**Tab completion for faster workflow**
- Bash, Zsh, Fish support
- Command completion
- AI name completion
- File name completion

</td>
<td width="50%">

### 🩺 Doctor Command
**Instant diagnostics**
```bash
prprompts doctor
```
Checks Node.js, npm, Git, AIs, configs, and more!

</td>
</tr>
</table>

<div align="center">

**[📖 Read Full v3.0 Feature Guide](docs/NEW-FEATURES-V3.md)**

</div>

---

## 📊 At a Glance

<table>
<tr>
<td width="33%" align="center">

### 32 Files Generated
Complete development guides<br/>covering all aspects

</td>
<td width="33%" align="center">

### 3 AI Assistants
Claude • Qwen • Gemini<br/>Choose your favorite

</td>
<td width="33%" align="center">

### 6 Compliance Standards
HIPAA • PCI-DSS • GDPR<br/>SOC2 • COPPA • FERPA

</td>
</tr>
<tr>
<td width="33%" align="center">

### 4 PRD Methods
Auto • From Files • Interactive<br/>Manual Templates

</td>
<td width="33%" align="center">

### 500-600 Words/File
Comprehensive guides<br/>Junior-friendly

</td>
<td width="33%" align="center">

### 3 Platforms
Windows • macOS • Linux<br/>Native installers

</td>
</tr>
</table>

---

## 🎯 How It Works

```mermaid
graph LR
    A[📝 Your PRD] --> B{Generator}
    B --> C[🏗️ Phase 1: Architecture<br/>10 files]
    B --> D[🔒 Phase 2: Quality & Security<br/>12 files]
    B --> E[📊 Phase 3: Demo & Learning<br/>10 files]
    C --> F[✨ 32 Custom Guides]
    D --> F
    E --> F
    F --> G[🚀 Start Building]
```

**The Process:**
1. **Create PRD** (1-5 min) - Auto-generate, use wizard, or convert existing docs
2. **Generate PRPROMPTS** (60 sec) - AI creates 32 customized development guides
3. **Start Coding** - Reference guides during development with confidence

---

## 🤖 Choose Your AI Assistant

<table>
<tr>
<th>Feature</th>
<th>🔵 Claude Code</th>
<th>🟠 Qwen Code</th>
<th>🟢 Gemini CLI</th>
</tr>
<tr>
<td><strong>Context Window</strong></td>
<td>200K tokens</td>
<td>256K-1M tokens</td>
<td>✨ <strong>1M tokens</strong></td>
</tr>
<tr>
<td><strong>Free Tier</strong></td>
<td>20 messages/day</td>
<td>Self-host</td>
<td>✨ <strong>60 req/min<br/>1,000/day</strong></td>
</tr>
<tr>
<td><strong>API Cost</strong></td>
<td>$3-15/1M tokens</td>
<td>$0.60-3/1M tokens</td>
<td>✨ <strong>FREE</strong> (preview)</td>
</tr>
<tr>
<td><strong>Accuracy</strong></td>
<td>⭐⭐⭐⭐⭐ 9.5/10</td>
<td>⭐⭐⭐⭐ 9.0/10</td>
<td>⭐⭐⭐⭐ 8.5/10</td>
</tr>
<tr>
<td><strong>Best For</strong></td>
<td>Production apps</td>
<td>Large codebases</td>
<td>MVPs, Free tier</td>
</tr>
<tr>
<td><strong>Commands</strong></td>
<td colspan="3" align="center"><strong>Identical across all 3!</strong> Just replace <code>claude</code> with <code>qwen</code> or <code>gemini</code></td>
</tr>
</table>

**Installation:**
```bash
# Install one or all
./scripts/install-commands.sh --global     # Claude Code
./scripts/install-qwen-commands.sh --global    # Qwen Code
./scripts/install-gemini-commands.sh --global  # Gemini CLI
./scripts/install-all.sh --global              # All 3 at once 🚀
```

📖 **Detailed Comparison:** [Claude vs Qwen vs Gemini](docs/AI-COMPARISON.md)

---

## 💡 Why Use This?

### ❌ The Problem

Most Flutter projects face these challenges:

| Challenge | Impact | Cost |
|-----------|--------|------|
| **No security guidelines** | Critical vulnerabilities (JWT signing in Flutter, storing credit cards) | High risk |
| **Inconsistent patterns** | Every developer does things differently | Slow onboarding |
| **Missing compliance docs** | HIPAA/PCI-DSS violations discovered late | Project delays |
| **Junior developer confusion** | No explanation of "why" behind decisions | Low productivity |
| **Scattered best practices** | Hours wasted searching StackOverflow | Wasted time |

### ✅ The Solution

**PRPROMPTS Generator** creates 32 customized, security-audited guides that:

<table>
<tr>
<td width="50%">

**🛡️ Security First**
- ✅ Correct JWT verification (public key only)
- ✅ PCI-DSS tokenization (never store cards)
- ✅ HIPAA encryption (AES-256-GCM for PHI)
- ✅ Compliance-aware (6 standards supported)

</td>
<td width="50%">

**🎓 Team-Friendly**
- ✅ Explains "why" behind every rule
- ✅ Real Flutter code examples
- ✅ Validation gates (checklists + CI)
- ✅ Adapts to team size (1-50+ devs)

</td>
</tr>
<tr>
<td width="50%">

**⚡ Time-Saving**
- ✅ 60-second generation
- ✅ PRD-driven customization
- ✅ 500-600 words per guide
- ✅ Pre-merge checklists included

</td>
<td width="50%">

**🔧 Tool-Integrated**
- ✅ Structurizr (C4 diagrams)
- ✅ GitHub CLI integration
- ✅ Serena MCP support
- ✅ CI/CD templates

</td>
</tr>
</table>

---

## 🔐 Security & Compliance Highlights

### ⚠️ Common Mistakes We Prevent

<details>
<summary><strong>JWT Authentication</strong> - Most Common Vulnerability</summary>

**❌ WRONG** (Security Vulnerability):
```dart
// NEVER do this - exposes private key!
final token = JWT({'user': 'john'}).sign(SecretKey('my-secret'));
```

**✅ CORRECT** (Secure Pattern):
```dart
// Flutter only verifies tokens (public key only!)
Future<bool> verifyToken(String token) async {
  final jwt = JWT.verify(
    token,
    RSAPublicKey(publicKey),  // Public key only!
    audience: Audience(['my-app']),
    issuer: 'api.example.com',
  );
  return jwt.payload['exp'] > DateTime.now().millisecondsSinceEpoch / 1000;
}
```

**Why?** Backend signs with private key (RS256), Flutter verifies with public key. This prevents token forgery.

</details>

<details>
<summary><strong>PCI-DSS Compliance</strong> - Payment Security</summary>

**❌ WRONG** (PCI-DSS Violation):
```dart
// NEVER store full card numbers!
await db.insert('cards', {'number': '4242424242424242'});
```

**✅ CORRECT** (PCI-DSS Compliant):
```dart
// Use tokenization (Stripe, PayPal, etc.)
final token = await stripe.createToken(cardNumber);
await db.insert('cards', {
  'last4': cardNumber.substring(cardNumber.length - 4),
  'token': token,  // Only store token
});
```

**Why?** Storing full card numbers requires PCI-DSS Level 1 certification. Tokenization reduces your scope.

</details>

<details>
<summary><strong>HIPAA Compliance</strong> - Healthcare Data Protection</summary>

**❌ WRONG** (HIPAA Violation):
```dart
// NEVER log PHI!
print('Patient SSN: ${patient.ssn}');
```

**✅ CORRECT** (HIPAA Compliant):
```dart
// Encrypt PHI at rest (AES-256-GCM)
final encrypted = await _encryptor.encrypt(
  patientData,
  key: await _secureStorage.read(key: 'encryption_key'),
);
await db.insert('patients', {'encrypted_data': encrypted});

// Safe logging (no PHI)
print('Patient record updated: ${patient.id}');
```

**Why?** HIPAA §164.312(a)(2)(iv) requires encryption of ePHI at rest.

</details>

### Compliance Standards Supported

| Standard | What Gets Generated | Use Case |
|----------|---------------------|----------|
| **HIPAA** | PHI encryption, audit logging, HTTPS-only | Healthcare apps |
| **PCI-DSS** | Payment tokenization, TLS 1.2+, SAQ checklist | E-commerce, Fintech |
| **GDPR** | Consent management, right to erasure, data portability | EU users |
| **SOC2** | Access controls, encryption, audit trails | Enterprise SaaS |
| **COPPA** | Parental consent, age verification | Apps for children |
| **FERPA** | Student records protection | Education apps |

---

## 📦 Installation

### ⚡ Super Quick Install - npm (Easiest!)

**🆕 v3.1 - One command for all platforms!**

```bash
npm install -g prprompts-flutter-generator
```

**That's it!** The postinstall script will:
- ✅ Auto-detect installed AI assistants (Claude/Qwen/Gemini)
- ✅ Configure commands for all detected AIs
- ✅ Create unified configuration
- ✅ Set up the `prprompts` CLI

**Then use anywhere:**
```bash
prprompts create      # Create PRD
prprompts generate    # Generate all 32 files
claude create-prd     # Or use AI-specific commands
```

**Don't have an AI assistant?** Install one first:
```bash
# Install Claude Code (Recommended)
npm install -g @anthropic-ai/claude-code

# Then install PRPROMPTS
npm install -g prprompts-flutter-generator
```

---

### 🚀 Alternative Install Methods

**🆕 v3.0 Smart Installer - Auto-detects everything:**

<table>
<tr>
<th>Platform</th>
<th>Command</th>
<th>Notes</th>
</tr>
<tr>
<td><strong>🪟 Windows PowerShell</strong></td>
<td>

```powershell
irm https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.ps1 | iex
```

</td>
<td><strong><a href="WINDOWS-QUICKSTART.md">📖 Full Windows Guide</a></strong></td>
</tr>
<tr>
<td><strong>🪟 Windows (Alternative)</strong></td>
<td>

```cmd
# Download and double-click
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator
INSTALL-WINDOWS.bat
```

</td>
<td>One-click installer included!</td>
</tr>
<tr>
<td><strong>🐧 Linux / 🍎 macOS</strong></td>
<td>

```bash
# Smart installer (v3.0) - Recommended!
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/smart-install.sh | bash
```

</td>
<td>Auto-detects OS & AIs</td>
</tr>
<tr>
<td><strong>Git Bash (Windows)</strong></td>
<td>

```bash
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/smart-install.sh | bash
```

</td>
<td>If you have Git Bash</td>
</tr>
</table>

**⚠️ Windows Users:** Don't use `bash` commands in PowerShell! Use the PowerShell method above. [See Windows Guide](WINDOWS-QUICKSTART.md)

**That's it!** Now run `prprompts create` or `claude create-prd` from any directory.

**🆕 v3.0 Unified CLI:**
```bash
# Add to PATH (one-time)
echo 'export PATH="$HOME/.prprompts/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Use unified commands
prprompts create      # Create PRD with your default AI
prprompts generate    # Generate all 32 PRPROMPTS
prprompts doctor      # Diagnose any issues
```

### 🔧 Manual Install (For Advanced Users)

<details>
<summary>Click to expand manual installation steps</summary>

```bash
# 1. Clone repository
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator

# 2. Install commands globally
./scripts/install-commands.sh --global

# 3. Verify installation
claude create-prd --help
```

**Windows users:** See [WINDOWS.md](WINDOWS.md) for detailed Windows installation.

</details>

### ✅ Verify Installation

```bash
# Test commands
claude create-prd --help
qwen gen-prprompts --help
gemini analyze-prd --help

# Run test suite
npm test
npm run test:commands
```

---

## 🚀 Quick Start

### 🎯 Choose Your Path

<table>
<tr>
<th>I have...</th>
<th>Command</th>
<th>Time</th>
<th>Accuracy</th>
</tr>
<tr>
<td>📝 <strong>Existing docs</strong></td>
<td><code>claude prd-from-files</code></td>
<td>2 min</td>
<td>90%</td>
</tr>
<tr>
<td>💭 <strong>Simple idea</strong></td>
<td><code>claude auto-gen-prd</code></td>
<td>1 min</td>
<td>85%</td>
</tr>
<tr>
<td>🎯 <strong>10 minutes</strong></td>
<td><code>claude create-prd</code></td>
<td>5 min</td>
<td>95%</td>
</tr>
<tr>
<td>✍️ <strong>Full control</strong></td>
<td>Copy template</td>
<td>30 min</td>
<td>100%</td>
</tr>
</table>

### 💨 Fastest Path (90 seconds total)

```bash
# 1. Create project description (30 sec)
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

# 2. Auto-generate PRD (10 sec)
claude auto-gen-prd

# 3. Generate all 32 PRPROMPTS (50 sec)
claude gen-prprompts

# Done! Start coding
cat PRPROMPTS/README.md
```

**What gets auto-inferred:**
- ✅ Project type (healthcare)
- ✅ Compliance (HIPAA, GDPR)
- ✅ Platforms (iOS, Android)
- ✅ Auth method (JWT)
- ✅ Offline support (yes)
- ✅ Team size (medium)

📖 **Full Guides:**
- [Auto PRD Guide](docs/AUTO-PRD-GUIDE.md)
- [PRD from Files](docs/PRD-FROM-FILES-GUIDE.md)
- [Interactive Wizard](docs/PRD-GUIDE.md)
- [Usage Guide](docs/USAGE.md)

---

## 📚 What Gets Generated

### 📂 Output Structure

```
your-flutter-project/
├── lib/
├── test/
├── docs/
│   └── PRD.md              ← Your requirements
└── PRPROMPTS/              ← 33 generated files
    ├── 01-feature_scaffold.md
    ├── 02-responsive_layout.md
    ├── 03-bloc_implementation.md
    ├── 04-api_integration.md
    ├── ...
    ├── 32-lessons_learned_engine.md
    └── README.md           ← Index & usage guide
```

### 🏗️ The 32 Files (3 Phases)

<details>
<summary><strong>Phase 1: Core Architecture (10 files)</strong> - Essential development patterns</summary>

1. **Feature Scaffold** - Clean Architecture structure
2. **Responsive Layout** - Mobile/tablet/desktop UI
3. **BLoC Implementation** - State management patterns
4. **API Integration** - Auth, JWT verification, error handling
5. **Testing Strategy** - Unit/widget/integration tests
6. **Design System** - Theme, components, Material 3
7. **Junior Onboarding** - Step-by-step guide for new devs
8. **Accessibility** - WCAG 2.1 Level AA compliance
9. **Internationalization** - Multi-language support
10. **Performance** - Build times, FPS optimization

</details>

<details>
<summary><strong>Phase 2: Quality & Security (12 files)</strong> - Production readiness</summary>

11. **Git Branching** - Feature branches, PR workflows
12. **Progress Tracking** - Sprint planning, velocity
13. **Multi-Team Coordination** - API contracts, dependencies
14. **Security Audit** - Pre-release checklist, OWASP
15. **Release Management** - App Store process, versioning
16. **Security & Compliance** ⭐ - HIPAA/PCI-DSS/GDPR patterns
17. **Performance (Detailed)** - DevTools, profiling
18. **Quality Gates** - Coverage, complexity metrics
19. **Localization & A11y** - Combined L10n + accessibility
20. **Versioning** - Semantic versioning, changelogs
21. **Team Culture** - Async communication, RFCs
22. **Auto-Documentation** - dartdoc, JSDoc integration

</details>

<details>
<summary><strong>Phase 3: Demo & Learning (10 files + README)</strong> - Client success</summary>

23. **AI Pair Programming** - Claude/Copilot integration
24. **Dashboard & Analytics** - Firebase, Crashlytics
25. **Tech Debt** - Tracking and refactor strategy
26. **Demo Environment** ⭐ - PRD-specific demo data
27. **Demo Progress** - Client-facing dashboard
28. **Demo Branding** - Client-specific theming
29. **Demo Deployment** - CI/CD for demo builds
30. **Client Reports** - Weekly status templates
31. **Role Adaptation** ⭐ - Team-size specific roles
32. **Lessons Learned** - Retrospective templates
+ **README.md** - Index and usage guide

</details>

### 🎯 The PRP Pattern

Every file follows this 6-section structure:

```markdown
## FEATURE
What this guide helps you accomplish

## EXAMPLES
Real code with actual Flutter file paths

## CONSTRAINTS
✅ DO / ❌ DON'T rules

## VALIDATION GATES
Pre-commit checklist + CI/CD automation

## BEST PRACTICES
Junior-friendly "Why?" explanations

## REFERENCES
Official docs, compliance guides, ADRs
```

---

## 🎓 Examples

### Healthcare App (HIPAA)

```yaml
# docs/PRD.md
---
project_type: "healthcare"
compliance: ["hipaa", "gdpr"]
auth_method: "jwt"
sensitive_data: ["phi", "pii"]
offline_support: true
---
```

**Generated files include:**
- PHI encryption patterns (AES-256-GCM)
- HIPAA audit logging requirements
- JWT RS256 verification (public key only!)
- Offline-first sync with encryption
- Compliance checklist in File 16

📄 [See full example →](examples/healthcare-prd.md)

### Fintech App (PCI-DSS)

```yaml
# docs/PRD.md
---
project_type: "fintech"
compliance: ["pci-dss", "gdpr"]
auth_method: "oauth2"
sensitive_data: ["payment", "pii"]
real_time: true
---
```

**Generated files include:**
- Payment tokenization (Stripe/PayPal)
- PCI-DSS SAQ checklist
- TLS 1.2+ requirements
- Real-time WebSocket security
- 2+ senior approvals for payment code

📄 [See full example →](examples/fintech-prd.md)

---

## 🔧 Commands Reference

### PRD Creation

```bash
claude create-prd          # Interactive wizard (10 questions)
claude auto-gen-prd        # Auto from description file
claude prd-from-files      # From existing markdown docs
claude analyze-prd         # Validate PRD structure
```

### PRPROMPTS Generation

```bash
claude gen-prprompts       # All 32 files (60 sec)
claude gen-phase-1         # Phase 1 only (20 sec)
claude gen-phase-2         # Phase 2 only (25 sec)
claude gen-phase-3         # Phase 3 only (20 sec)
claude gen-file <name>     # Single file
```

### Complete Workflows

```bash
# From existing docs → PRPROMPTS (2 min)
claude prd-from-files && claude gen-prprompts

# From idea → PRPROMPTS (1 min)
claude auto-gen-prd && claude gen-prprompts

# Interactive → PRPROMPTS (5 min)
claude create-prd && claude gen-prprompts
```

Replace `claude` with `qwen` or `gemini` to use different AI assistants!

📖 **Full Command Reference:** [docs/API.md](docs/API.md)

---

## 💼 Practical Workflow Examples

###  **Scenario 1: Brand New Healthcare App**

```bash
# Day 1: Setup (2 minutes)
cd ~/projects
mkdir healthtrack-pro && cd healthtrack-pro

# Initialize Flutter project
flutter create .

# Use healthcare template
cat > project_description.md < templates/healthcare.md

# Generate PRD with unified CLI
prprompts auto

# Generate all guides
prprompts generate

# Result: Ready to start coding with 32 security-audited guides!
```

### **Scenario 2: Adding PRPROMPTS to Existing Project**

```bash
# Navigate to your existing Flutter project
cd ~/projects/my-existing-app

# Create PRD from existing documentation
prprompts from-files
# Enter your existing docs when prompted:
#   docs/requirements.md
#   docs/architecture.md
#   docs/api-spec.md

# Review the generated PRD
cat docs/PRD.md

# Generate PRPROMPTS for existing codebase
prprompts generate

# Now you have comprehensive guides for your team!
```

### **Scenario 3: Switching Between AI Assistants**

```bash
# Check current AI
prprompts which
# Output: Current AI: claude

# Try Gemini for faster free generation
prprompts switch gemini
# Output: ✓ Default AI set to: gemini

# Generate with Gemini
prprompts generate

# Switch back to Claude for production
prprompts switch claude

# Regenerate specific file with Claude
prprompts gen-file security_and_compliance
```

### **Scenario 4: Team Onboarding**

```bash
# New developer joins the team

# 1. Quick diagnosis
prprompts doctor
# Checks: Node.js ✓, npm ✓, Claude ✓, Qwen ✗, Gemini ✓

# 2. View project guides
cd PRPROMPTS
cat README.md

# 3. Read junior onboarding guide
cat 07-junior_onboarding.md

# 4. Check security requirements
cat 16-security_and_compliance.md

# Team member is now productive in < 30 minutes!
```

### **Scenario 5: Compliance Requirement Change**

```bash
# Client now requires PCI-DSS compliance

# 1. Update PRD
vim docs/PRD.md
# Add: compliance: ["hipaa", "pci-dss", "gdpr"]

# 2. Regenerate affected files
prprompts gen-file security_and_compliance
prprompts gen-file api_integration
prprompts gen-file security_audit

# 3. Review changes
git diff PRPROMPTS/

# Now you have PCI-DSS patterns integrated!
```

### **Scenario 6: Multi-Platform Expansion**

```bash
# Originally mobile-only, now adding Web

# 1. Update PRD platforms
vim docs/PRD.md
# Change: platforms: ["ios", "android", "web"]

# 2. Regenerate responsive layout guide
prprompts gen-file responsive_layout

# 3. Regenerate design system
prprompts gen-file design_system

# 4. Check web-specific considerations
cat PRPROMPTS/02-responsive_layout.md | grep -i "web"
```

### **Scenario 7: Pre-Release Security Audit**

```bash
# Before releasing to production

# 1. Run security audit checklist
cat PRPROMPTS/14-security_audit_checklist.md

# 2. Verify compliance
cat PRPROMPTS/16-security_and_compliance.md

# 3. Check JWT implementation
grep -r "JWT" lib/ --include="*.dart"

# 4. Validate against PRPROMPTS patterns
# Review: Are we verifying tokens with public key only?
# Review: Are we using RS256, not HS256?

# Ship with confidence!
```

###  **Scenario 8: Quick Template-Based Start**

```bash
# Starting a fintech app

# Use pre-configured template
cp templates/fintech.md project_description.md

# Customize for your needs
vim project_description.md

# Auto-generate PRD
prprompts auto

# Generate PRPROMPTS
prprompts generate

# You now have PCI-DSS compliant guides ready!
```

---

## 📋 Quick Reference Card

### 🆕 Unified CLI Commands (v3.0)

<table>
<tr>
<th>Command</th>
<th>Description</th>
<th>Example</th>
</tr>
<tr>
<td><code>prprompts init</code></td>
<td>Initialize PRPROMPTS in project</td>
<td><code>prprompts init</code></td>
</tr>
<tr>
<td><code>prprompts create</code></td>
<td>Interactive PRD wizard</td>
<td><code>prprompts create</code></td>
</tr>
<tr>
<td><code>prprompts auto</code></td>
<td>Auto-generate from description</td>
<td><code>prprompts auto</code></td>
</tr>
<tr>
<td><code>prprompts from-files</code></td>
<td>Generate from existing docs</td>
<td><code>prprompts from-files</code></td>
</tr>
<tr>
<td><code>prprompts analyze</code></td>
<td>Validate PRD structure</td>
<td><code>prprompts analyze</code></td>
</tr>
<tr>
<td><code>prprompts generate</code></td>
<td>Generate all 32 files</td>
<td><code>prprompts generate</code></td>
</tr>
<tr>
<td><code>prprompts gen-phase-1</code></td>
<td>Generate Phase 1 only</td>
<td><code>prprompts gen-phase-1</code></td>
</tr>
<tr>
<td><code>prprompts gen-file</code></td>
<td>Generate single file</td>
<td><code>prprompts gen-file bloc_implementation</code></td>
</tr>
<tr>
<td><code>prprompts config</code></td>
<td>Show configuration</td>
<td><code>prprompts config</code></td>
</tr>
<tr>
<td><code>prprompts switch</code></td>
<td>Change default AI</td>
<td><code>prprompts switch gemini</code></td>
</tr>
<tr>
<td><code>prprompts which</code></td>
<td>Show current AI</td>
<td><code>prprompts which</code></td>
</tr>
<tr>
<td><code>prprompts doctor</code></td>
<td>Diagnose issues</td>
<td><code>prprompts doctor</code></td>
</tr>
<tr>
<td><code>prprompts update</code></td>
<td>Update to latest version</td>
<td><code>prprompts update</code></td>
</tr>
<tr>
<td><code>prprompts version</code></td>
<td>Show version info</td>
<td><code>prprompts version</code></td>
</tr>
<tr>
<td><code>prprompts help</code></td>
<td>Show help</td>
<td><code>prprompts help</code></td>
</tr>
</table>

### 📝 Common Workflows

**Complete Setup (60 seconds):**
```bash
prprompts auto && prprompts generate
```

**Healthcare App:**
```bash
cp templates/healthcare.md project_description.md
prprompts auto && prprompts generate
```

**Fintech App:**
```bash
cp templates/fintech.md project_description.md
prprompts auto && prprompts generate
```

**From Existing Docs:**
```bash
prprompts from-files && prprompts generate
```

**Regenerate Security File:**
```bash
prprompts gen-file security_and_compliance
```

**Switch to Gemini (Free Tier):**
```bash
prprompts switch gemini && prprompts generate
```

**Check Installation:**
```bash
prprompts doctor
```

### 🔄 Upgrade from v2.2 to v3.0

```bash
# Pull latest
cd prprompts-flutter-generator
git pull origin master

# Run smart installer
bash scripts/smart-install.sh

# Add to PATH
echo 'export PATH="$HOME/.prprompts/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Test unified CLI
prprompts --version
prprompts doctor
```

### 💡 Pro Tips

1. **Tab Completion**: Install shell completions for faster typing
   ```bash
   sudo cp completions/prprompts.bash /etc/bash_completion.d/
   ```

2. **Quick Template**: Use templates for common project types
   ```bash
   ls templates/  # See all available templates
   ```

3. **Selective Regeneration**: Only regenerate files that changed
   ```bash
   prprompts gen-file security_and_compliance
   prprompts gen-file api_integration
   ```

4. **Multiple AIs**: Install all 3 AIs and switch based on task
   ```bash
   prprompts switch gemini  # For free tier
   prprompts switch claude  # For production quality
   prprompts switch qwen    # For large codebases
   ```

5. **Diagnose Issues**: Use doctor command first
   ```bash
   prprompts doctor  # Shows what's installed and configured
   ```

---

## ❓ FAQ

<details>
<summary><strong>Q: Do I need all 3 AI assistants?</strong></summary>

**A:** No! Pick one:
- **Claude Code** - Best accuracy, production apps
- **Qwen Code** - Best for large codebases, self-host
- **Gemini CLI** - Best free tier (1,000 req/day!)

Commands are identical across all 3.

</details>

<details>
<summary><strong>Q: Can I use this for existing projects?</strong></summary>

**A:** Yes! Use `claude prd-from-files` to convert existing documentation into a PRD, then generate PRPROMPTS. Works great for legacy projects needing standardization.

</details>

<details>
<summary><strong>Q: How do I customize generated files?</strong></summary>

**A:** Edit the generated PRPROMPTS files directly. Add team-specific examples, internal wiki links, or custom validation gates. See [Customization Guide](docs/CUSTOMIZATION.md).

</details>

<details>
<summary><strong>Q: Is this only for Flutter?</strong></summary>

**A:** Currently yes. The generator is optimized for Flutter with Clean Architecture + BLoC. You can fork and customize for React Native, SwiftUI, etc.

</details>

<details>
<summary><strong>Q: How often should I regenerate?</strong></summary>

**A:** Regenerate when:
- Compliance requirements change (adding HIPAA)
- Authentication method changes (JWT → OAuth2)
- New platform added (adding Web support)
- Team size changes significantly

</details>

<details>
<summary><strong>Q: Can I use this offline?</strong></summary>

**A:** Partially. Qwen Code can run locally (offline). Claude Code and Gemini CLI require internet. All generated files work offline once created.

</details>

<details>
<summary><strong>Q: What if I find a security issue?</strong></summary>

**A:** Please report security issues privately to the maintainers. See [CONTRIBUTING.md](CONTRIBUTING.md) for contact info.

</details>

---

## 📖 Documentation

### Core Guides
- **[PRPROMPTS Specification v2.0](docs/PRPROMPTS-SPECIFICATION.md)** - Complete technical guide
- [Usage Guide](docs/USAGE.md) - Detailed usage with workflows
- [API Reference](docs/API.md) - All commands and options
- [Testing Guide](TESTING.md) - Test all AI assistants

### PRD Creation
- [Auto PRD Guide](docs/AUTO-PRD-GUIDE.md) - Zero-interaction generation
- [PRD from Files](docs/PRD-FROM-FILES-GUIDE.md) - Convert existing docs
- [Interactive Wizard](docs/PRD-GUIDE.md) - 10-question wizard

### AI Assistant Setup
- [Claude Code Commands](docs/CLAUDE-COMMANDS.md)
- [Qwen Code Setup](QWEN.md) + [Commands](docs/QWEN-COMMANDS.md)
- [Gemini CLI Setup](GEMINI.md) + [Commands](docs/GEMINI-COMMANDS.md)
- [AI Comparison](docs/AI-COMPARISON.md) - Claude vs Qwen vs Gemini

### Platform Support
- [Windows Installation](WINDOWS.md) - Native batch, PowerShell, Git Bash
- [Customization Guide](docs/CUSTOMIZATION.md) - Team-specific modifications
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator
npm install
./scripts/setup.sh

# Run tests
npm test                  # Full validation
npm run test:commands     # Command availability
```

---

## 🗺️ Roadmap

### ✅ v3.0 (Current) - Smart Installation & Unified CLI
- [x] Smart unified installer with auto-detection
- [x] Unified CLI wrapper (`prprompts` command)
- [x] Auto-update system with backup/rollback
- [x] Shell completions (Bash/Zsh/Fish)
- [x] Project templates (Healthcare, Fintech, E-Commerce, Generic)
- [x] Doctor command for diagnostics
- [x] Enhanced configuration system

### ✅ v2.2 - Multi-AI Support
- [x] Claude Code, Qwen Code, Gemini CLI support
- [x] Strict PRP pattern (6 sections)
- [x] Critical security corrections (JWT, PCI-DSS, HIPAA)
- [x] 500-600 words per file
- [x] Comprehensive documentation
- [x] Cross-platform installers
- [x] Testing framework

### 🚀 v3.1 (Next) - Enhanced Tooling
- [ ] VS Code snippets for common patterns
- [ ] GitHub Actions workflow templates
- [ ] Interactive demo environment
- [ ] Example PRPROMPTS (complete healthcare & fintech samples)
- [ ] Docker support for CI/CD

### 🎯 v3.2 (Future) - IDE Integration
- [ ] VS Code Extension - Generate from IDE
- [ ] IntelliJ/Android Studio plugin
- [ ] Web UI - Browser-based PRD creation
- [ ] Git hooks integration
- [ ] Automated validation on PR

### 🌟 v4.0 (Future) - Advanced Features
- [ ] More compliance (ISO 27001, NIST, FedRAMP, CCPA)
- [ ] Multi-language (Spanish, French, German)
- [ ] Jira/Linear integration
- [ ] AI-powered PRD refinement
- [ ] Team collaboration features
- [ ] Analytics and insights dashboard

---

## 📞 Support & Community

<table>
<tr>
<td width="33%" align="center">

### 📖 Documentation
[Read the docs](docs/)

</td>
<td width="33%" align="center">

### 🐛 Issues
[Report bugs](https://github.com/Kandil7/prprompts-flutter-generator/issues)

</td>
<td width="33%" align="center">

### 💬 Discussions
[Ask questions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)

</td>
</tr>
</table>

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code) by Anthropic
- Inspired by Clean Architecture by Robert C. Martin
- Flutter framework by Google
- Community contributors and testers

---

<div align="center">

## ⭐ Star Us!

**If this project saves you time or helps your team, please give it a ⭐ on GitHub!**

[![Star History Chart](https://api.star-history.com/svg?repos=Kandil7/prprompts-flutter-generator&type=Date)](https://star-history.com/#Kandil7/prprompts-flutter-generator&Date)

</div>

---

<div align="center">

**Made with ❤️ for Flutter developers**

### Quick Links

[🚀 Quick Start](#quick-start) •
[📦 Install](#installation) •
[📖 Docs](docs/) •
[🧪 Test](TESTING.md) •
[🤖 AI Guides](docs/AI-COMPARISON.md) •
[💬 Support](https://github.com/Kandil7/prprompts-flutter-generator/issues)

### Platforms

![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)
![macOS](https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)

**Powered by** [Claude Code](https://claude.ai/code) • [Qwen Code](https://github.com/QwenLM/qwen-code) • [Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli)

**Built for** [Flutter](https://flutter.dev) with ❤️

</div>
