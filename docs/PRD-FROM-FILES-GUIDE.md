# Generate PRD from Existing Files - Guide

**Convert your existing markdown documentation into a structured PRD with YAML frontmatter.**

## 🎯 Overview

The `prd-from-files` command analyzes your existing markdown files and generates a complete PRD with:
- YAML frontmatter (for automation)
- Structured sections
- Auto-detected compliance requirements
- Inferred technical stack
- Minimal questions (only when necessary)

## 🚀 Quick Start

```bash
# Run the command
claude prd-from-files

# Provide file paths when prompted
docs/requirements.md
specs/features.md
notes/architecture.md

# Press Enter when done
# Answer 1-3 questions if asked
# Done! Check docs/PRD.md
```

## 📝 What Files Can You Provide?

### Supported File Types
- Requirements documents
- Feature specifications
- Technical design docs
- Architecture diagrams (markdown)
- Meeting notes
- Project proposals
- Existing PRDs (to restructure)
- User stories
- API specifications

### File Format
- Must be markdown (`.md`)
- Can be in any directory
- Can be any number of files
- Order doesn't matter

## 🧠 Smart Inference

The tool automatically detects:

### Project Type
| Keywords Found | Detected Type |
|----------------|---------------|
| "patient", "health", "medical", "diagnosis" | Healthcare |
| "payment", "transaction", "bank", "wallet" | Fintech |
| "student", "course", "learning", "grade" | Education |
| "shop", "cart", "checkout", "product" | E-commerce |

### Compliance Requirements
| Keywords Found | Compliance Added |
|----------------|------------------|
| "HIPAA", "PHI", "patient data" | HIPAA + GDPR |
| "PCI", "credit card", "payment" | PCI-DSS + GDPR |
| "student records", "FERPA" | FERPA + COPPA |
| "EU users", "GDPR" | GDPR |

### Technical Stack
| Keywords Found | Inferred Technology |
|----------------|---------------------|
| "BLoC pattern", "Cubit" | state_management: "bloc" |
| "offline mode", "sync" | offline_support: true |
| "real-time", "WebSocket", "chat" | real_time: true |
| "Firebase Auth" | auth_method: "firebase" |
| "JWT token" | auth_method: "jwt" |

## 📋 Example Scenarios

### Scenario 1: Single Requirements Doc

**You have:** `docs/requirements.md`

```markdown
# HealthTrack Pro

Mobile app for diabetes patients to track blood glucose levels
and communicate with their doctors.

## Features
- Blood glucose logging
- Medication reminders
- Secure messaging with doctor
- Health reports and trends

## Compliance
Must comply with HIPAA regulations.

## Technical
- Mobile app (iOS and Android)
- Offline support required
- JWT authentication
```

**Command:**
```bash
claude prd-from-files
# Enter: docs/requirements.md
# Press Enter
```

**Result:**
- Auto-detects: healthcare, HIPAA, offline, JWT
- Asks 2-3 questions: team size, timeline
- Generates complete PRD

---

### Scenario 2: Multiple Documents

**You have:**
- `docs/overview.md` - Project vision
- `docs/features.md` - Feature list
- `docs/tech-stack.md` - Architecture decisions

**Command:**
```bash
claude prd-from-files
# Enter paths one by one:
docs/overview.md
docs/features.md
docs/tech-stack.md
# Press Enter
```

**Result:**
- Synthesizes information across all files
- Creates unified PRD
- Minimal questions asked

---

### Scenario 3: Legacy Documentation

**You have:** Old project docs that need restructuring

**Command:**
```bash
claude prd-from-files
# Provide old docs
# Get new structured PRD with YAML frontmatter
```

**Benefit:** Modernize old docs into automation-ready format

## 🔍 What Gets Generated

### 1. YAML Frontmatter

```yaml
---
project_name: "HealthTrack Pro"
project_type: "healthcare"
platforms: ["ios", "android"]
auth_method: "jwt"
offline_support: true
compliance: ["hipaa", "gdpr"]
sensitive_data: ["phi", "pii"]
team_size: "5-10"
timeline_months: 6
---
```

### 2. Structured Sections

1. **Executive Summary** - Vision, target users, value proposition
2. **Features & User Stories** - Organized by epic with acceptance criteria
3. **Technical Architecture** - Clean Architecture, state management, APIs
4. **Compliance Requirements** - Detailed HIPAA/PCI-DSS/GDPR sections
5. **Non-Functional Requirements** - Performance, security, accessibility
6. **Testing Strategy** - Unit, widget, integration, E2E tests
7. **Timeline & Milestones** - Sprint structure and deliverables
8. **Success Metrics** - KPIs and measurement tools

## 💡 Tips for Best Results

### ✅ DO

- **Provide multiple files** if you have them (better inference)
- **Include technical details** in your docs (architecture, tech stack)
- **Mention compliance** needs explicitly
- **List all features** clearly
- **Specify platforms** if known

### ❌ DON'T

- Don't worry about formatting - the tool handles it
- Don't remove "rough" notes - they contain useful info
- Don't consolidate files beforehand - provide them separately
- Don't skip files - more context = better PRD

## 🔄 Comparison with Other Methods

| Method | Input | Questions Asked | Best For |
|--------|-------|-----------------|----------|
| **Auto** | Simple description | 0 | Quick prototypes |
| **From Files** | Existing markdown | 1-3 | Legacy projects, existing docs |
| **Interactive** | None | 10 | New projects, high stakes |
| **Manual** | Template | N/A | Full control needed |

## 🎓 Advanced Usage

### Skip Interactive Mode

If no files provided, falls back to interactive mode:

```bash
claude prd-from-files
# Press Enter immediately (no files)
# Falls back to 10-question wizard
```

### Combine with Auto-Gen

```bash
# Generate initial PRD from description
claude auto-gen-prd

# Then enhance with existing docs
claude prd-from-files
# Merges information
```

### Incremental Updates

```bash
# Update PRD with new requirements doc
claude prd-from-files
# Provide: docs/new-requirements.md
# Updates existing PRD
```

## 🐛 Troubleshooting

### "File not found"
- Use absolute paths: `/home/user/project/docs/requirements.md`
- Or relative from current directory: `./docs/requirements.md`

### "Not enough information"
- Provide more files
- Be more specific in your documentation
- Include technical details

### "Too many questions"
- Add more details to your files
- Explicitly mention: platforms, compliance, tech stack
- Include architecture decisions

## 📚 Examples

See the `examples/` directory for sample input files and generated PRDs:

- `examples/from-files/healthcare/` - Healthcare app example
- `examples/from-files/fintech/` - Fintech app example
- `examples/from-files/education/` - Education app example

## 🔗 Related Commands

```bash
# Create PRD interactively
claude create-prd

# Auto-generate from simple description
claude auto-gen-prd

# Validate generated PRD
claude analyze-prd

# Generate PRPROMPTS from PRD
claude gen-prprompts
```

## 💬 Support

- 📖 [Main README](../README.md)
- 🐛 [Report Issues](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- 💬 [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)

---

**Made with ❤️ for developers who document**
