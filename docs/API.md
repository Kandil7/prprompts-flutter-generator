# PRPROMPTS Generator - API Reference

Complete reference for all CLI commands, options, and configuration.

## Table of Contents

- [CLI Commands](#cli-commands)
- [Command Options](#command-options)
- [Configuration Files](#configuration-files)
- [Environment Variables](#environment-variables)
- [Exit Codes](#exit-codes)
- [Programmatic API](#programmatic-api)

---

## CLI Commands

### PRD Creation Commands

#### `claude create-prd`

Interactive wizard for creating a PRD through 10 questions.

**Syntax:**
```bash
claude create-prd [OPTIONS]
```

**Options:**
- `--help` - Show help message
- `--output <path>` - Output path (default: `docs/PRD.md`)
- `--template <path>` - Use custom template

**Examples:**
```bash
# Standard usage
claude create-prd

# Custom output location
claude create-prd --output my-prd.md

# Use custom template
claude create-prd --template templates/PRD-custom.md
```

**Interactive Questions:**
1. Project name
2. Project type (healthcare/fintech/education/etc.)
3. Target platforms (iOS/Android/Web)
4. Compliance requirements (HIPAA/PCI-DSS/GDPR/etc.)
5. Authentication method (JWT/OAuth2/Firebase)
6. Offline support (yes/no)
7. Real-time updates (yes/no)
8. Sensitive data types (PHI/PII/Payment)
9. Team size (small/medium/large)
10. Demo frequency (weekly/biweekly/monthly)

**Output:**
- Creates `docs/PRD.md` with YAML frontmatter
- Includes all sections: Executive Summary, Features, Architecture, etc.

**Exit Codes:**
- `0` - Success
- `1` - User cancelled
- `2` - Invalid input
- `3` - File write error

---

#### `claude auto-gen-prd`

Auto-generate PRD from a simple description file (zero interaction).

**Syntax:**
```bash
claude auto-gen-prd [OPTIONS]
```

**Options:**
- `--help` - Show help message
- `--input <path>` - Input description file (default: `project_description.md`)
- `--output <path>` - Output PRD path (default: `docs/PRD.md`)
- `--force` - Overwrite existing PRD without confirmation

**Examples:**
```bash
# Standard usage (reads project_description.md)
claude auto-gen-prd

# Custom input file
claude auto-gen-prd --input my-idea.md

# Force overwrite
claude auto-gen-prd --force --output docs/PRD.md
```

**Input File Format:**
```markdown
# Project Name

Short description of the project.

## Users
- User persona 1
- User persona 2

## Features
1. Feature 1
2. Feature 2
3. Feature 3
```

**Auto-Inferred Fields:**
- Project type (from keywords)
- Platforms (defaults to iOS + Android)
- Compliance (from healthcare/finance/education keywords)
- Authentication (JWT default, OAuth2 if mentioned)
- Offline support (if "offline" mentioned)
- Real-time (if "real-time" or "chat" mentioned)

**Exit Codes:**
- `0` - Success
- `1` - Input file not found
- `2` - Invalid input format
- `3` - Output file write error

---

#### `claude prd-from-files`

Generate PRD from existing markdown documentation files.

**Syntax:**
```bash
claude prd-from-files [OPTIONS]
```

**Options:**
- `--help` - Show help message
- `--output <path>` - Output PRD path (default: `docs/PRD.md`)
- `--interactive` - Ask clarifying questions (default: true)
- `--no-interactive` - Skip all questions, infer everything
- `--files <paths>` - Comma-separated file paths (alternative to stdin)

**Examples:**
```bash
# Interactive mode (prompts for file paths)
claude prd-from-files

# Provide files as arguments
claude prd-from-files --files docs/requirements.md,specs/features.md

# Non-interactive (infer everything)
claude prd-from-files --no-interactive --files docs/*.md
```

**Input (Interactive Mode):**
```bash
$ claude prd-from-files
Enter file paths (one per line, press Enter twice when done):
docs/requirements.md
docs/architecture.md
README.md
<Enter>
<Enter>
```

**Supported File Types:**
- Markdown (`.md`)
- Text (`.txt`)
- Any UTF-8 encoded file

**Smart Inference:**
- Detects project type from keywords
- Extracts features from lists and headings
- Identifies compliance needs from content
- Infers tech stack from code examples
- Only asks for missing critical information

**Exit Codes:**
- `0` - Success
- `1` - No files provided
- `2` - File read error
- `3` - PRD generation failed

---

#### `claude analyze-prd`

Validate and analyze existing PRD.

**Syntax:**
```bash
claude analyze-prd [OPTIONS]
```

**Options:**
- `--help` - Show help message
- `--prd <path>` - PRD file path (default: `docs/PRD.md`)
- `--verbose` - Show detailed analysis

**Examples:**
```bash
# Analyze default PRD
claude analyze-prd

# Analyze specific file
claude analyze-prd --prd my-prd.md

# Verbose output
claude analyze-prd --verbose
```

**Output:**
```
✅ YAML frontmatter valid
✅ All required fields present
✅ Compliance requirements recognized
⚠️  Warning: Team size not specified (defaulting to medium)
✅ PRD structure complete

Summary:
- Project: HealthTrack Pro
- Type: Healthcare
- Compliance: HIPAA, GDPR
- Platforms: iOS, Android
- Features: 12 listed
```

**Exit Codes:**
- `0` - PRD valid
- `1` - PRD not found
- `2` - YAML parsing error
- `3` - Missing required fields

---

### PRPROMPTS Generation Commands

#### `claude gen-prprompts`

Generate all 32 PRPROMPTS files plus README.

**Syntax:**
```bash
claude gen-prprompts [OPTIONS]
```

**Options:**
- `--help` - Show help message
- `--prd <path>` - PRD file path (default: `docs/PRD.md`)
- `--output <dir>` - Output directory (default: `PRPROMPTS/`)
- `--force` - Overwrite existing files
- `--dry-run` - Preview what would be generated without creating files
- `--verbose` - Show detailed progress

**Examples:**
```bash
# Standard usage
claude gen-prprompts

# Custom PRD location
claude gen-prprompts --prd my-docs/PRD.md

# Dry run (preview only)
claude gen-prprompts --dry-run

# Force overwrite
claude gen-prprompts --force

# Verbose output
claude gen-prprompts --verbose
```

**Output:**
```
Generating PRPROMPTS from docs/PRD.md...

Phase 1: Core Architecture (10 files)
✅ 01-feature_scaffold.md (545 words)
✅ 02-responsive_layout.md (532 words)
...

Phase 2: Quality & Security (12 files)
✅ 11-git_branching_strategy.md (498 words)
...

Phase 3: Demo & Learning (10 files)
✅ 23-ai_pair_programming_guide.md (571 words)
...

✅ README.md (312 words)

Generated 33 files in PRPROMPTS/
Total: 60 seconds
```

**Exit Codes:**
- `0` - Success
- `1` - PRD not found
- `2` - PRD validation failed
- `3` - Generation error
- `4` - File write error

---

#### `claude gen-phase-1`

Generate Phase 1 files only (Core Architecture - 10 files).

**Syntax:**
```bash
claude gen-phase-1 [OPTIONS]
```

**Options:**
Same as `gen-prprompts`

**Generated Files:**
1. `01-feature_scaffold.md`
2. `02-responsive_layout.md`
3. `03-bloc_implementation.md`
4. `04-api_integration.md`
5. `05-testing_strategy.md`
6. `06-design_system_usage.md`
7. `07-onboarding_junior.md`
8. `08-accessibility_a11y.md`
9. `09-internationalization_i18n.md`
10. `10-performance_optimization.md`

**Example:**
```bash
claude gen-phase-1 --verbose
```

---

#### `claude gen-phase-2`

Generate Phase 2 files only (Quality & Security - 12 files).

**Syntax:**
```bash
claude gen-phase-2 [OPTIONS]
```

**Options:**
Same as `gen-prprompts`

**Generated Files:**
11-22 (Git branching, security audit, compliance, release management, etc.)

---

#### `claude gen-phase-3`

Generate Phase 3 files only (Demo & Learning - 10 files + README).

**Syntax:**
```bash
claude gen-phase-3 [OPTIONS]
```

**Options:**
Same as `gen-prprompts`

**Generated Files:**
23-32 + README.md (AI pair programming, analytics, tech debt, demo setup, etc.)

---

#### `claude gen-file`

Generate a single PRPROMPTS file.

**Syntax:**
```bash
claude gen-file [OPTIONS] [FILENAME]
```

**Options:**
- `--help` - Show help message
- `--prd <path>` - PRD file path (default: `docs/PRD.md`)
- `--output <path>` - Output file path (default: `PRPROMPTS/<filename>.md`)

**Arguments:**
- `FILENAME` - File name without number prefix (e.g., `security_and_compliance`)

**Examples:**
```bash
# Interactive (prompts for filename)
claude gen-file

# Specify filename
claude gen-file security_and_compliance

# Custom output
claude gen-file testing_strategy --output my-docs/testing.md
```

**Available Filenames:**
```
feature_scaffold
responsive_layout
bloc_implementation
api_integration
testing_strategy
design_system_usage
onboarding_junior
accessibility_a11y
internationalization_i18n
performance_optimization
git_branching_strategy
progress_tracking_workflow
multi_team_coordination
security_audit_checklist
release_management
security_and_compliance
performance_optimization_detailed
quality_gates_and_code_metrics
localization_and_accessibility
versioning_and_release_notes
team_culture_and_communication
autodoc_integration
ai_pair_programming_guide
dashboard_and_analytics
tech_debt_and_refactor_strategy
demo_environment_setup
demo_progress_tracker
demo_branding_and_visuals
demo_deployment_automation
client_demo_report_template
project_role_adaptation
lessons_learned_engine
```

---

### Qwen Code Commands

Same commands with `qwen` prefix instead of `claude`:

```bash
qwen create-prd
qwen auto-gen-prd
qwen prd-from-files
qwen analyze-prd
qwen gen-prprompts
qwen gen-phase-1
qwen gen-phase-2
qwen gen-phase-3
qwen gen-file
```

**Installation:**
```bash
./scripts/install-qwen-commands.sh --global
```

See [QWEN.md](../QWEN.md) for details.

---

### Gemini CLI Commands

Same commands with `gemini` prefix instead of `claude`:

```bash
gemini create-prd
gemini auto-gen-prd
gemini prd-from-files
gemini analyze-prd
gemini gen-prprompts
gemini gen-phase-1
gemini gen-phase-2
gemini gen-phase-3
gemini gen-file
```

**Installation:**
```bash
./scripts/install-gemini-commands.sh --global
```

See [GEMINI.md](../GEMINI.md) for details.

---

## Command Options

### Global Options

Available for all commands:

```bash
--help               Show help message
--version            Show version number
--verbose            Enable verbose output
--quiet              Suppress non-error output
--no-color           Disable colored output
```

### PRD Options

Available for PRD creation commands:

```bash
--output <path>      Output file path (default: docs/PRD.md)
--force              Overwrite without confirmation
--template <path>    Use custom template
```

### Generation Options

Available for PRPROMPTS generation commands:

```bash
--prd <path>         PRD file path (default: docs/PRD.md)
--output <dir>       Output directory (default: PRPROMPTS/)
--force              Overwrite existing files
--dry-run            Preview without creating files
```

---

## Configuration Files

### `.claude/config.yml`

Claude Code configuration file.

**Location:**
- Global: `~/.config/claude/config.yml` (macOS/Linux) or `%USERPROFILE%\.config\claude\config.yml` (Windows)
- Project: `<project>/.claude/config.yml`

**Format:**

```yaml
version: "2.2.0"

prompts:
  create-prd:
    file: "prompts/generate-prd.md"
    description: "Interactive PRD creation wizard"

  auto-gen-prd:
    file: "prompts/auto-generate-prd.md"
    description: "Auto-generate PRD from description (no questions)"

  prd-from-files:
    file: "prompts/generate-prd-from-files.md"
    description: "Generate PRD from existing markdown files"

  analyze-prd:
    file: "prompts/analyze-prd.md"
    description: "Validate and analyze PRD"

  gen-prprompts:
    file: "prompts/prprompts-generator.md"
    description: "Generate all 32 PRPROMPTS files"

  gen-phase-1:
    file: "prompts/phase-1-core.md"
    description: "Generate Phase 1: Core Architecture (10 files)"

  gen-phase-2:
    file: "prompts/phase-2-quality.md"
    description: "Generate Phase 2: Quality & Security (12 files)"

  gen-phase-3:
    file: "prompts/phase-3-demo.md"
    description: "Generate Phase 3: Demo & Learning (10 files)"

  gen-file:
    file: "prompts/single-file-generator.md"
    description: "Generate single PRPROMPTS file"
```

---

### `docs/PRD.md`

Product Requirements Document with YAML frontmatter.

**Required YAML Fields:**

```yaml
---
project_name: "MyApp"              # Required
project_type: "healthcare"         # Required: healthcare, fintech, education, etc.
platforms: ["ios", "android"]      # Required: ios, android, web
compliance: ["hipaa"]              # Optional: hipaa, pci-dss, gdpr, soc2, coppa, ferpa
---
```

**Optional YAML Fields:**

```yaml
auth_method: "jwt"                 # jwt, oauth2, firebase, custom
offline_support: true              # true, false
real_time: false                   # true, false
sensitive_data: ["phi", "pii"]     # phi, pii, payment, none
team_size: "medium"                # small (1-5), medium (5-15), large (15+)
demo_frequency: "weekly"           # weekly, biweekly, monthly
```

---

### `project_description.md`

Simple description file for auto-generation.

**Format:**

```markdown
# Project Name

Brief description of the project.

## Users
- User type 1
- User type 2

## Features
1. Feature 1
2. Feature 2
3. Feature 3

## Notes (Optional)
Additional context or requirements.
```

---

## Environment Variables

### `PRPROMPTS_DIR`

Path to PRPROMPTS generator installation.

```bash
export PRPROMPTS_DIR="/path/to/prprompts-flutter-generator"
```

Used by shell aliases and scripts.

---

### `CLAUDE_CONFIG_DIR`

Override Claude Code config directory.

```bash
export CLAUDE_CONFIG_DIR="$HOME/.config/claude"
```

Default: `~/.config/claude` (macOS/Linux) or `%USERPROFILE%\.config\claude` (Windows)

---

### `CLAUDE_API_KEY`

Claude AI API key (if using API directly).

```bash
export CLAUDE_API_KEY="your-api-key"
```

---

### `DEBUG`

Enable debug output.

```bash
export DEBUG=claude:*
claude gen-prprompts
```

---

## Exit Codes

### Standard Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid input
- `3` - File I/O error
- `4` - Network error
- `5` - Authentication error
- `6` - Rate limit exceeded
- `130` - User cancelled (Ctrl+C)

---

## Programmatic API

### Node.js API

**Installation:**

```bash
npm install --save prprompts-flutter-generator
```

**Usage:**

```javascript
const { generatePRD, generatePRPROMPTS } = require('prprompts-flutter-generator');

// Generate PRD from description
const prd = await generatePRD({
  input: 'project_description.md',
  output: 'docs/PRD.md',
  interactive: false
});

// Generate PRPROMPTS
const result = await generatePRPROMPTS({
  prd: 'docs/PRD.md',
  output: 'PRPROMPTS/',
  phase: 'all' // or '1', '2', '3'
});

console.log(`Generated ${result.filesCreated} files`);
```

---

### Python API

**Installation:**

```bash
pip install prprompts-generator
```

**Usage:**

```python
from prprompts import generate_prd, generate_prprompts

# Generate PRD
prd = generate_prd(
    input_file='project_description.md',
    output_file='docs/PRD.md',
    interactive=False
)

# Generate PRPROMPTS
result = generate_prprompts(
    prd_file='docs/PRD.md',
    output_dir='PRPROMPTS/',
    phase='all'
)

print(f"Generated {result.files_created} files")
```

---

## Shell Aliases

### Bash/Zsh Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# PRD creation
alias create-prd='claude create-prd'
alias auto-prd='claude auto-gen-prd'
alias prd-files='claude prd-from-files'

# PRPROMPTS generation
alias prp-gen='claude gen-prprompts'
alias prp-p1='claude gen-phase-1'
alias prp-p2='claude gen-phase-2'
alias prp-p3='claude gen-phase-3'
alias prp-file='claude gen-file'

# Utilities
alias prp-analyze='claude analyze-prd'
alias prp='cat PRPROMPTS/README.md'
```

**Installation:**

```bash
source scripts/prp-aliases.sh

# Or add permanently
echo "source $(pwd)/scripts/prp-aliases.sh" >> ~/.bashrc
```

---

## Quick Reference Card

```bash
# PRD Creation
claude create-prd           # Interactive wizard (10 questions)
claude auto-gen-prd         # Auto from description file
claude prd-from-files       # From existing docs
claude analyze-prd          # Validate PRD

# PRPROMPTS Generation
claude gen-prprompts        # All 32 files + README
claude gen-phase-1          # Phase 1 (10 files)
claude gen-phase-2          # Phase 2 (12 files)
claude gen-phase-3          # Phase 3 (10 files)
claude gen-file <name>      # Single file

# Options
--help                      # Show help
--verbose                   # Detailed output
--dry-run                   # Preview only
--force                     # Overwrite files

# AI Alternatives
qwen <command>              # Use Qwen Code
gemini <command>            # Use Gemini CLI
```

---

## Related Documentation

- [Usage Guide](USAGE.md) - How to use the generator
- [Customization Guide](CUSTOMIZATION.md) - Customize for your needs
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues
- [Qwen Guide](../QWEN.md) - Qwen Code setup
- [Gemini Guide](../GEMINI.md) - Gemini CLI setup

---

## Version History

- **v2.2** - Added Gemini CLI support (documentation phase)
- **v2.1** - Added Qwen Code support
- **v2.0** - PRPROMPTS v2.0 spec (strict PRP pattern, security corrections)
- **v1.0** - Initial release (multi-platform, PRD generation)

For complete changelog, see [CHANGELOG.md](../CHANGELOG.md).
