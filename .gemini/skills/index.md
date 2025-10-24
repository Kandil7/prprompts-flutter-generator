# PRPROMPTS Flutter Generator - Claude Skills

## 🚀 Overview

The PRPROMPTS Flutter Generator is now available as native Claude skills! No npm installation required - just activate the skills and start building Flutter apps 40-60x faster.

## 📦 Available Skill Categories

### 📝 Core PRPROMPTS Skills
Essential skills for PRD creation and PRPROMPTS generation.

- **`prd-creator`** - Interactive PRD creation wizard with 10 guided questions
- **`prd-analyzer`** - Analyze and validate your PRD for completeness
- **`prprompts-generator`** - Generate all 32 PRPROMPTS files from your PRD
- **`phase-generator`** - Generate specific phases (Core, Quality, Demo)
- **`single-file-generator`** - Generate or regenerate individual PRPROMPTS files

### 🤖 Automation Skills
Automate your Flutter development workflow.

- **`flutter-bootstrapper`** - Bootstrap complete Flutter project with Clean Architecture
- **`feature-implementer`** - Automatically implement features from PRPROMPTS
- **`automation-orchestrator`** - Orchestrate full development cycles
- **`code-reviewer`** - Review code for PRPROMPTS compliance
- **`qa-auditor`** - Comprehensive QA and compliance audit

### ✅ Validation Skills
Ensure code quality and compliance.

- **`architecture-validator`** - Validate Clean Architecture compliance
- **`security-validator`** - Check security patterns and vulnerabilities
- **`compliance-checker`** - Verify HIPAA, PCI-DSS, GDPR compliance
- **`test-validator`** - Validate test coverage and quality

### 🛠️ Utility Skills
Helper utilities for enhanced development experience.

- **`api-validator`** - Validate and setup API keys
- **`rate-monitor`** - Monitor API rate limits
- **`progress-tracker`** - Track progress with visual indicators
- **`state-manager`** - Manage automation state across sessions

## 🎯 Quick Start

### Basic Usage
```
@claude use skill prprompts-core/prd-creator
@claude use skill prprompts-core/prprompts-generator
```

### Using Workflows
```
@claude use workflow quick-start
@claude use workflow full-automation
@claude use workflow enterprise
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