# Claude Code Commands Reference

## Quick Reference

| Command | Description | Time |
|---------|-------------|------|
| `claude create-prd` | Interactive PRD wizard (10 questions) | 5 min |
| `claude auto-gen-prd` | Auto-generate PRD from description | 1 min |
| `claude analyze-prd` | Validate and analyze PRD | 10 sec |
| `claude gen-prprompts` | Generate all 32 PRPROMPTS files | 30 sec |
| `claude gen-phase-1` | Generate Phase 1 (10 files) | 15 sec |
| `claude gen-phase-2` | Generate Phase 2 (12 files) | 15 sec |
| `claude gen-phase-3` | Generate Phase 3 (10 files) | 15 sec |
| `claude gen-file` | Generate single file by name | 5 sec |

## Installation

### Option 1: Global (Recommended)

```bash
./scripts/install-commands.sh --global
```

Use from any project directory.

### Option 2: Per-Project

```bash
cd your-flutter-project
/path/to/prprompts-flutter-generator/scripts/install-commands.sh --local
```

Only available in this project.

## Complete Workflows

### Workflow 1: Auto-Generate Everything (1 minute)

```bash
# 1. Create description
cat > project_description.md << 'EOF'
# MyApp
Healthcare app with HIPAA compliance.
Features: tracking, messaging, reports
EOF

# 2. Auto-generate PRD
claude auto-gen-prd

# 3. Generate PRPROMPTS
claude gen-prprompts

# Done!
```

### Workflow 2: Interactive with Validation (6 minutes)

```bash
# 1. Create PRD interactively
claude create-prd

# 2. Analyze before generating
claude analyze-prd

# 3. Generate all files
claude gen-prprompts

# Done!
```

### Workflow 3: Incremental Generation

```bash
# 1. Create PRD
claude create-prd

# 2. Generate Phase 1 only
claude gen-phase-1

# 3. Start coding with Phase 1
cat PRPROMPTS/01-feature_scaffold.md

# 4. Later, generate Phase 2
claude gen-phase-2

# 5. Finally, generate Phase 3
claude gen-phase-3
```

### Workflow 4: Regenerate Single File

```bash
# Update PRD
vim docs/PRD.md

# Regenerate just security file
claude gen-file
# Choose: security_and_compliance

# Check updates
cat PRPROMPTS/16-security_and_compliance.md
```

## Command Details

### create-prd
**Interactive PRD creation wizard**

```bash
claude create-prd
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

**Output:** `docs/PRD.md` with YAML frontmatter

### auto-gen-prd
**Auto-generate PRD from description**

```bash
claude auto-gen-prd
```

Looks for: `project_description.md`

AI infers:
- Project type
- Compliance requirements
- Platforms
- Authentication method
- All other fields

**Output:** `docs/PRD.md` with confidence score

### analyze-prd
**Validate and analyze PRD**

```bash
claude analyze-prd
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

### gen-prprompts
**Generate all 32 PRPROMPTS files**

```bash
claude gen-prprompts
```

Generates complete PRPROMPTS/ directory:
- Phase 1: 10 files (architecture)
- Phase 2: 12 files (quality/security)
- Phase 3: 10 files (demo/learning)
- README.md (usage guide)

### gen-phase-1/2/3
**Generate specific phase**

```bash
claude gen-phase-1  # Core architecture
claude gen-phase-2  # Quality & security
claude gen-phase-3  # Demo & learning
```

Useful for incremental development.

### gen-file
**Generate single PRPROMPTS file**

```bash
claude gen-file
```

Prompts for filename, then generates that specific file.

Example files:
- security_and_compliance
- api_integration
- testing_strategy
- onboarding_junior

## Troubleshooting

### Command not found

```bash
# Check installation
claude --version

# Reinstall
./scripts/install-commands.sh --global
```

### PRD not found

```bash
# Check location
ls docs/PRD.md

# Create PRD first
claude create-prd
```

### Customizations not applied

```bash
# Validate PRD
claude analyze-prd

# Check warnings
# Fix PRD
vim docs/PRD.md

# Regenerate
claude gen-prprompts
```

## Support

- 📖 [Full Documentation](../README.md)
- 🐛 [Report Issue](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- 💬 [Discussions](https://github.com/Kandil7/prprompts-flutter-generator/discussions)
