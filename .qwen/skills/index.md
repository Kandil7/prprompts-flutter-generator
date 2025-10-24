# PRPROMPTS Flutter Generator - Qwen Code Skills

## 🚀 Overview

The PRPROMPTS Flutter Generator is now available as Qwen Code TOML slash commands! 8 specialized skills available globally in every Flutter project via simple `/skills/*` commands.

**Key Benefits:**
- 🌍 **Global availability** - Works in ANY Flutter project
- 🎯 **Smart defaults** - 80% reduction in user input
- ⚡ **Extended context** - Qwen's 256K-1M tokens analyze entire codebases
- 🚀 **Nested commands** - Organized: `/skills/category/name`
- 🔄 **Auto-install** - Installed via npm postinstall

## 📦 Available Skill Categories

### 📝 PRPROMPTS Core Skills (2 implemented)
Essential skills for PRPROMPTS generation.

**Available as TOML slash commands:**
- **`/skills/prprompts-core/phase-generator`** - Generate specific phases (Core, Quality, Demo)
- **`/skills/prprompts-core/single-file-generator`** - Generate or regenerate individual PRPROMPTS files

**Available as traditional commands:**
- `qwen create-prd` - Interactive PRD creation wizard
- `qwen gen-prprompts` - Generate all 32 PRPROMPTS files

### 🤖 Automation Skills (5 implemented)
Automate your Flutter development workflow.

**Available as TOML slash commands:**
- **`/skills/automation/flutter-bootstrapper`** - Bootstrap complete Flutter project with Clean Architecture (2 min)
- **`/skills/automation/feature-implementer`** - Automatically implement features from PRPROMPTS (10-15 min)
- **`/skills/automation/automation-orchestrator`** - Orchestrate 1-10 features with dependency resolution (1-2 hours)
- **`/skills/automation/code-reviewer`** - 7-step review with scoring and auto-fix (3-10 min)
- **`/skills/automation/qa-auditor`** - Comprehensive QA and compliance audit (10-20 min)

### 🎨 Development Workflow Skills (1 implemented)
Multi-environment configuration and tooling.

**Available as TOML slash commands:**
- **`/skills/development-workflow/flutter-flavors`** - Multi-environment setup (dev/staging/production) (1-2 min)

### ✅ Validation Skills (Planned)
Ensure code quality and compliance.

- `architecture-validator` - Validate Clean Architecture compliance (Planned)
- `security-validator` - Check security patterns and vulnerabilities (Planned)
- `compliance-checker` - Verify HIPAA, PCI-DSS, GDPR compliance (Planned)
- `test-validator` - Validate test coverage and quality (Planned)

### 🛠️ Utility Skills (Planned)
Helper utilities for enhanced development experience.

- `api-validator` - Validate and setup API keys (Planned)
- `rate-monitor` - Monitor API rate limits (Planned)
- `progress-tracker` - Track progress with visual indicators (Planned)
- `state-manager` - Manage automation state across sessions (Planned)

## 🎯 Quick Start

### Installation

**Automatic (Recommended):**
```bash
npm install -g prprompts-flutter-generator
# Automatically installs 8 Qwen skills if Qwen Code detected
```

**Manual:**
```bash
bash scripts/install-qwen-skills.sh
# Or Windows PowerShell:
# powershell -ExecutionPolicy Bypass -File scripts/install-qwen-skills.ps1
```

### Basic Usage

```bash
# Start Qwen Code in any Flutter project
cd your-flutter-project
qwen

# Use skills via slash commands
/skills/automation/flutter-bootstrapper
/skills/automation/code-reviewer
/skills/automation/qa-auditor
```

### With Smart Defaults

```bash
# Minimal user input - just press Enter for defaults
/skills/automation/code-reviewer
# > Review type? (full): [Enter]
# > Target path? (lib/): [Enter]
# ✅ Using defaults: review_type='full', target_path='lib/'
```

### Complete Workflows

**Workflow 1: Bootstrap → Implement → Review → Audit**
```bash
qwen
/skills/automation/flutter-bootstrapper
/skills/automation/automation-orchestrator
# > Feature count? 10
/skills/automation/code-reviewer
/skills/automation/qa-auditor
# > Generate cert? y
```

**Workflow 2: HIPAA Compliance**
```bash
qwen
/skills/automation/code-reviewer
# > Review type? security
/skills/automation/qa-auditor
# > Audit type? compliance
# > Standards? HIPAA
# > Generate cert? y
```

## 📚 Skill Documentation

### PRD Creator Skill
**Purpose:** Create a comprehensive Product Requirements Document through an interactive wizard.

**Usage:**
```
@claude use skill prprompts-core/prd-creator
```

**Process:**
1. Answer 10 guided questions about your project
2. Skill generates complete PRD with metadata
3. PRD is saved to `docs/PRD.md`

**Outputs:**
- `docs/PRD.md` - Complete PRD with YAML frontmatter
- Project metadata for PRPROMPTS generation

### PRPROMPTS Generator Skill
**Purpose:** Generate 32 customized PRPROMPTS files from your PRD.

**Usage:**
```
@claude use skill prprompts-core/prprompts-generator
```

**Prerequisites:**
- Valid PRD at `docs/PRD.md`

**Outputs:**
- `PRPROMPTS/` directory with 32 specialized guide files
- Each file customized based on PRD metadata

### Flutter Bootstrapper Skill
**Purpose:** Bootstrap a complete Flutter project with Clean Architecture.

**Usage:**
```
@claude use skill automation/flutter-bootstrapper
```

**Prerequisites:**
- Flutter project initialized
- PRPROMPTS files generated

**Outputs:**
- Complete Clean Architecture folder structure
- `docs/ARCHITECTURE.md` - Architecture documentation
- `docs/IMPLEMENTATION_PLAN.md` - Development roadmap
- Security infrastructure setup
- Test framework configuration

## 🔄 Workflows

### Quick Start Workflow
Perfect for getting started quickly.

**Skills Used:**
1. `prd-creator`
2. `prprompts-generator`

**Time:** 5 minutes

### Full Automation Workflow
Complete PRD to working Flutter app.

**Skills Used:**
1. `prd-creator`
2. `prprompts-generator`
3. `flutter-bootstrapper`
4. `automation-orchestrator`
5. `qa-auditor`

**Time:** 2-3 hours

### Enterprise Workflow
Production-ready app with compliance.

**Skills Used:**
1. `prd-creator`
2. `prd-analyzer`
3. `prprompts-generator`
4. `flutter-bootstrapper`
5. `compliance-checker`
6. `security-validator`
7. `feature-implementer`
8. `qa-auditor`

**Time:** 3-4 hours

## 🔧 Configuration

### Enable Skills
```json
{
  "skills": {
    "prprompts": {
      "enabled": true,
      "autoLoad": true,
      "version": "1.0.0"
    }
  }
}
```

### Skill Settings
- **Timeout:** 5 minutes per skill
- **Cache:** Results cached for 1 hour
- **Progress:** Visual progress enabled
- **Verbose:** Detailed output disabled by default

## 🎨 Customization

### Custom Workflows
Create your own workflow combinations:

```json
{
  "myWorkflow": {
    "name": "My Custom Workflow",
    "skills": ["prd-creator", "flutter-bootstrapper"]
  }
}
```

### Skill Parameters
Pass parameters to skills:

```
@claude use skill prprompts-core/prprompts-generator --phases 1,2 --compliance hipaa
```

## 📊 Skill Dependencies

Some skills depend on others:
- `prprompts-generator` requires `prd-analyzer`
- `feature-implementer` requires `flutter-bootstrapper`
- `qa-auditor` requires validation skills

Dependencies are automatically resolved.

## 🚀 Advanced Usage

### Chaining Skills
```
@claude chain skills prd-creator > prprompts-generator > flutter-bootstrapper
```

### Parallel Execution
```
@claude parallel skills security-validator, architecture-validator, test-validator
```

### Conditional Execution
```
@claude if prd-analyzer.valid then prprompts-generator
```

## 📈 Performance

| Skill | Execution Time | Cache Duration |
|-------|---------------|----------------|
| prd-creator | 2-3 min | Not cached |
| prprompts-generator | 30-60 sec | 1 hour |
| flutter-bootstrapper | 1-2 min | 30 min |
| feature-implementer | 5-10 min | Not cached |
| qa-auditor | 2-3 min | 15 min |

## 🆘 Troubleshooting

### Skill Not Found
```
Error: Skill 'xyz' not found
Solution: Check available skills with @claude list skills
```

### Dependency Error
```
Error: Required skill 'prd-analyzer' not executed
Solution: Run dependency first or use workflow
```

### Timeout Error
```
Error: Skill execution timeout
Solution: Increase timeout or break into smaller tasks
```

## 📝 Creating Custom Skills

See [SKILL-DEVELOPMENT.md](../../docs/SKILL-DEVELOPMENT.md) for creating your own skills.

## 🔗 Links

- [PRPROMPTS Specification](../../docs/PRPROMPTS-SPECIFICATION.md)
- [Skill API Reference](../../docs/SKILL-API.md)
- [Claude Skills Guide](../../docs/CLAUDE-SKILLS-GUIDE.md)

---

*Version 1.0.0 | PRPROMPTS Flutter Generator Skills*