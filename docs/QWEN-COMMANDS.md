# Qwen Code Commands Reference

Complete reference for PRPROMPTS Generator commands with Qwen3-Coder.

---

## Quick Reference

| Command | Description | Time |
|---------|-------------|------|
| `qwen create-prd` | Interactive PRD wizard (10 questions) | 5 min |
| `qwen auto-gen-prd` | Auto-generate PRD from description | 1 min |
| `qwen prd-from-files` | Generate PRD from existing files | 2 min |
| `qwen analyze-prd` | Validate and analyze PRD | 10 sec |
| `qwen gen-prprompts` | Generate all 32 PRPROMPTS files | 30 sec |
| `qwen gen-phase-1` | Generate Phase 1 (10 files) | 15 sec |
| `qwen gen-phase-2` | Generate Phase 2 (12 files) | 15 sec |
| `qwen gen-phase-3` | Generate Phase 3 (10 files) | 15 sec |
| `qwen gen-file` | Generate single file by name | 5 sec |

---

## Installation

### Option 1: Global (Recommended)

```bash
# Linux/macOS:
./scripts/install-qwen-commands.sh --global

# Windows:
scripts\install-qwen-commands.bat --global
```

Use from any project directory.

### Option 2: Per-Project

```bash
cd your-flutter-project
/path/to/prprompts-flutter-generator/scripts/install-qwen-commands.sh --local
```

Only available in this project.

---

## Complete Workflows

### Workflow 1: Auto-Generate Everything (1 minute)

```bash
# 1. Create description
cat > project_description.md << 'EOF'
# MyApp
Healthcare app with HIPAA compliance.
Features: tracking, messaging, reports
EOF

# 2. Auto-generate PRD (leveraging Qwen's extended context)
qwen auto-gen-prd

# 3. Generate PRPROMPTS
qwen gen-prprompts

# Done!
```

### Workflow 2: From Existing Files (2 minutes)

```bash
# 1. Collect existing markdown files
qwen prd-from-files
# Input: docs/requirements.md, specs/features.md, etc.

# 2. Generate PRPROMPTS
qwen gen-prprompts
```

### Workflow 3: Interactive with Validation (6 minutes)

```bash
# 1. Create PRD interactively
qwen create-prd

# 2. Analyze before generating
qwen analyze-prd

# 3. Generate all files
qwen gen-prprompts
```

### Workflow 4: Incremental Generation

```bash
# 1. Create PRD
qwen create-prd

# 2. Generate Phase 1 only
qwen gen-phase-1

# 3. Start coding with Phase 1
cat PRPROMPTS/01-feature_scaffold.md

# 4. Later, generate Phase 2
qwen gen-phase-2

# 5. Finally, generate Phase 3
qwen gen-phase-3
```

### Workflow 5: Regenerate Single File

```bash
# Update PRD
vim docs/PRD.md

# Regenerate just security file
qwen gen-file
# Choose: security_and_compliance

# Check updates
cat PRPROMPTS/16-security_and_compliance.md
```

---

## Command Details

### create-prd
**Interactive PRD creation wizard**

```bash
qwen create-prd
```

Asks 10 questions:
1. Project name
2. Project type (healthcare/fintech/education/etc.)
3. Platforms (iOS/Android/Web)
4. Compliance (HIPAA/PCI-DSS/GDPR)
5. Authentication method
6. Offline support
7. Real-time requirements
8. Sensitive data types
9. Team size
10. Demo frequency

**Output**: `docs/PRD.md` with YAML frontmatter

**Qwen Advantage**: Extended context allows deeper analysis of your answers and better inference of implicit requirements.

---

### auto-gen-prd
**Auto-generate PRD from description**

```bash
qwen auto-gen-prd
```

Looks for: `project_description.md`

AI infers:
- Project type
- Compliance requirements
- Platforms
- Authentication method
- All other fields

**Output**: `docs/PRD.md` with confidence score

**Qwen Advantage**: 256K-1M token context can process multiple description files simultaneously for more accurate inference.

---

### prd-from-files
**Generate PRD from existing markdown files**

```bash
qwen prd-from-files
```

Prompts for file paths, then:
- Reads all provided markdown files
- Extracts project info, features, requirements
- Auto-detects compliance needs
- Infers technical stack
- Only asks clarifying questions if needed

**Output**: `docs/PRD.md`

**Qwen Advantage**: Can process 10x more documentation files at once compared to Claude Code.

---

### analyze-prd
**Validate and analyze PRD**

```bash
qwen analyze-prd
```

Checks:
- YAML syntax
- Required fields
- Compliance consistency
- Timeline realism

Shows:
- Customizations to apply
- Subagents to generate
- Warnings/recommendations

**Qwen Advantage**: Deep codebase analysis can cross-reference PRD with existing project structure.

---

### gen-prprompts
**Generate all 32 PRPROMPTS files**

```bash
qwen gen-prprompts
```

Generates complete PRPROMPTS/ directory:
- Phase 1: 10 files (architecture)
- Phase 2: 12 files (quality/security)
- Phase 3: 10 files (demo/learning)
- README.md (usage guide)

**Total**: 33 files

**Qwen Advantage**: Extended context ensures consistency across all 32 files by keeping entire PRD + all generated files in context.

---

### gen-phase-1/2/3
**Generate specific phase**

```bash
qwen gen-phase-1  # Core architecture
qwen gen-phase-2  # Quality & security
qwen gen-phase-3  # Demo & learning
```

Useful for incremental development.

**Phase 1** (10 files):
- 01-feature_scaffold.md
- 02-responsive_layout.md
- 03-bloc_implementation.md
- 04-api_integration.md
- 05-testing_strategy.md
- 06-design_system_usage.md
- 07-onboarding_junior.md
- 08-accessibility_a11y.md
- 09-internationalization_i18n.md
- 10-performance_optimization.md

**Phase 2** (12 files):
- 11-git_branching_strategy.md
- 12-progress_tracking_workflow.md
- 13-multi_team_coordination.md
- 14-security_audit_checklist.md
- 15-release_management.md
- 16-security_and_compliance.md (⭐ PRD-sensitive)
- 17-performance_optimization_detailed.md
- 18-quality_gates_and_code_metrics.md
- 19-localization_and_accessibility.md
- 20-versioning_and_release_notes.md
- 21-team_culture_and_communication.md
- 22-autodoc_integration.md

**Phase 3** (10 files + README):
- 23-ai_pair_programming_guide.md
- 24-dashboard_and_analytics.md
- 25-tech_debt_and_refactor_strategy.md
- 26-demo_environment_setup.md (⭐ PRD-scenario based)
- 27-demo_progress_tracker.md
- 28-demo_branding_and_visuals.md
- 29-demo_deployment_automation.md
- 30-client_demo_report_template.md
- 31-project_role_adaptation.md (⭐ PRD-driven roles)
- 32-lessons_learned_engine.md
- README.md (usage guide)

---

### gen-file
**Generate single PRPROMPTS file**

```bash
qwen gen-file
```

Prompts for filename, then generates that specific file.

Example files:
- security_and_compliance
- api_integration
- testing_strategy
- onboarding_junior
- bloc_implementation
- performance_optimization

**Qwen Advantage**: Can reference entire codebase when generating file-specific guidance.

---

## Qwen-Specific Features

### 1. Extended Context Window

Qwen3-Coder supports 256K-1M tokens (vs Claude's ~200K):

```bash
# Process massive PRDs with extensive requirements
qwen create-prd  # Can handle 10x more detail

# Analyze entire codebase at once
qwen analyze-prd  # Detects patterns across all files
```

### 2. Agentic Workflow Automation

Qwen excels at multi-step tasks:

```bash
# Chain commands for fully automated workflow
qwen auto-gen-prd && qwen gen-prprompts
```

### 3. Deep Code Understanding

Optimized parser for code analysis:

```bash
# Analyze PRD + existing codebase + dependencies
qwen analyze-prd  # Suggests customizations based on actual code
```

---

## Troubleshooting

### Command not found

```bash
# Check installation
qwen --version

# Reinstall
./scripts/install-qwen-commands.sh --global
```

### PRD not found

```bash
# Check location
ls docs/PRD.md

# Create PRD first
qwen create-prd
```

### Customizations not applied

```bash
# Validate PRD
qwen analyze-prd

# Check warnings
# Fix PRD
vim docs/PRD.md

# Regenerate
qwen gen-prprompts
```

### Slow performance

```bash
# Qwen Code may need model download on first run
# Check ~/.qwen/models/

# Use smaller model variant for faster generation
qwen create-prd --model qwen3-coder-7b
```

---

## Comparison with Claude Code

| Feature | Claude Code | Qwen Code |
|---------|-------------|-----------|
| **Context Length** | 200K tokens | 256K-1M tokens |
| **Command Speed** | Fast | Very fast |
| **Accuracy** | Excellent | Excellent (SOTA on coding) |
| **Cost** | $15-60/month | Free tier + lower costs |
| **Best For** | Production apps | Large codebases, cost-conscious |

**Commands are identical**:
- `claude create-prd` = `qwen create-prd`
- `claude gen-prprompts` = `qwen gen-prprompts`

**Switch anytime**: PRD format is the same, so you can start with Qwen and switch to Claude (or vice versa) without any changes.

---

## Advanced Usage

### Custom Model Selection

```bash
# Use specific Qwen model variant
qwen create-prd --model qwen3-coder-480b-instruct  # Largest, best accuracy
qwen create-prd --model qwen3-coder-32b-instruct   # Balanced
qwen create-prd --model qwen3-coder-7b-instruct    # Fastest
```

### Batch Processing

```bash
# Generate PRDs for multiple projects
for dir in project1 project2 project3; do
  cd $dir
  qwen auto-gen-prd
  qwen gen-prprompts
  cd ..
done
```

### CI/CD Integration

```bash
# Add to GitHub Actions workflow
- name: Generate PRPROMPTS
  run: |
    npm install -g @qwenlm/qwen-code
    qwen gen-prprompts
    git add PRPROMPTS/
    git commit -m "chore: regenerate PRPROMPTS"
```

---

## Support

- 📖 [Qwen Installation Guide](../QWEN.md)
- 🆚 [Claude vs Qwen Comparison](CLAUDE-VS-QWEN.md)
- 🐛 [Report Issue](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- 💬 [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)
- 🔧 [Qwen Code Docs](https://github.com/QwenLM/qwen-code)

---

<div align="center">

**Powered by** [Qwen3-Coder](https://github.com/QwenLM/Qwen3-Coder) | **Built for** [Flutter](https://flutter.dev)

[🚀 Quick Start](../QWEN.md#quick-start) •
[📦 Install](../QWEN.md#installation-methods) •
[📝 Commands](#quick-reference) •
[💬 Support](https://github.com/Kandil7/prprompts-flutter-generator/issues)

</div>
