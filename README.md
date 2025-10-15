# PRD-to-PRPROMPTS Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude-Code-blue)](https://claude.ai/code)
[![Flutter](https://img.shields.io/badge/Flutter-3.24+-blue)](https://flutter.dev)

**Automatically generate 32 customized PRPROMPTS files for Flutter projects based on your Product Requirements Document (PRD).**

## 🎯 What is This?

Transform your PRD into a complete set of development guides that adapt to your project's specific needs:

- ✅ **Healthcare app with HIPAA?** → Auto-generates PHI encryption guides, audit logging, compliance checkers
- ✅ **Fintech with payments?** → Auto-generates PCI-DSS checklists, tokenization patterns
- ✅ **Offline-first app?** → Auto-generates sync strategies, conflict resolution, local database patterns
- ✅ **Team with juniors?** → Auto-generates onboarding docs with "why" explanations

## 🌟 Key Features

- **PRD-Driven**: Every output is traceable to your PRD
- **Compliance-Aware**: HIPAA, PCI-DSS, GDPR, SOC2, COPPA, FERPA
- **Architecture-Specific**: Clean Architecture, BLoC/Cubit, offline-first, real-time
- **Team-Adaptive**: Scales from 5 to 50+ developers, adjusts for junior/senior mix
- **Tool-Integrated**: Structurizr (C4), Serena MCP, GitHub CLI
- **Production-Ready**: Includes tests, CI/CD, security scans, audit logging

## 📦 Installation

### Prerequisites

- [Claude Code CLI](https://docs.claude.ai/code)
- Node.js 18+ (for Claude Code)
- Flutter 3.24+ (for your project)
- Git

### Quick Install

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

### Quick Start: Interactive Wizard

The easiest way to create a PRD is using our interactive generator:

```bash
claude --prompt .claude/prompts/generate-prd.md
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

## 📖 Documentation

- [Usage Guide](docs/USAGE.md) - Detailed usage instructions
- [Customization](docs/CUSTOMIZATION.md) - How to customize prompts
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [API Reference](docs/API.md) - CLI commands and options

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

### Phase 1: Core Architecture (10 files)
1. feature_scaffold.md - Clean Architecture patterns
2. responsive_layout.md - Adaptive UI
3. bloc_implementation.md - BLoC vs Cubit
4. api_integration.md - Auth, error handling
5. testing_strategy.md - Unit/Widget/Integration tests
6. design_system_usage.md - Theme, components
7. onboarding_junior.md - Junior developer guide
8. accessibility_a11y.md - WCAG 2.1 compliance
9. internationalization_i18n.md - Multi-language
10. performance_optimization.md - Build times, FPS

### Phase 2: Quality & Security (12 files)
11. git_branching_strategy.md - Git workflows
12. progress_tracking_workflow.md - Sprint planning
13. multi_team_coordination.md - Cross-team collab
14. security_audit_checklist.md - Pre-release validation
15. release_management.md - App Store process
16. security_and_compliance.md - ⭐ PRD-sensitive
17. performance_optimization_detailed.md - Advanced profiling
18. quality_gates_and_code_metrics.md - Coverage, complexity
19. localization_and_accessibility.md - Combined L10n+A11y
20. versioning_and_release_notes.md - Semantic versioning
21. team_culture_and_communication.md - Async-first
22. autodoc_integration.md - Auto-documentation

### Phase 3: Demo & Learning (10 files + README)
23. ai_pair_programming_guide.md - Claude/Copilot
24. dashboard_and_analytics.md - Metrics, monitoring
25. tech_debt_and_refactor_strategy.md - Debt tracking
26. demo_environment_setup.md - ⭐ PRD-scenario based
27. demo_progress_tracker.md - Client dashboard
28. demo_branding_and_visuals.md - Demo UI
29. demo_deployment_automation.md - Demo CI/CD
30. client_demo_report_template.md - Weekly reports
31. project_role_adaptation.md - ⭐ PRD-driven roles
32. lessons_learned_engine.md - Retrospectives
+ PRPROMPTS/README.md - Usage guide

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

```bash
# Basic commands
prp-analyze           # Analyze PRD
prp-gen              # Generate all files
prp-p1               # Generate Phase 1
prp-p2               # Generate Phase 2
prp-p3               # Generate Phase 3

# Generate specific file
prp-file security_and_compliance

# Full workflow
prp-full             # Analyze + Generate + Validate

# YOLO mode (auto-approve)
prp-yolo

# Interactive mode
prp-chat
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

- [ ] VS Code extension
- [ ] Web UI for PRD creation
- [ ] More compliance standards (ISO 27001, NIST)
- [ ] Multi-language support (Spanish, French, German)
- [ ] Integration with Jira/Linear/Asana
- [ ] AI-powered PRD generation from natural language

## ⭐ Star Us!

If this project helps you, please give it a ⭐ on GitHub!

---

**Made with ❤️ for Flutter developers**
