# Gemini CLI Commands Reference

Complete reference for PRPROMPTS Generator commands with Gemini CLI.

---

## Quick Reference

| Command | Description | Time |
|---------|-------------|------|
| `gemini create-prd` | Interactive PRD wizard (10 questions) | 5 min |
| `gemini auto-gen-prd` | Auto-generate PRD from description | 1 min |
| `gemini prd-from-files` | Generate PRD from existing files | 2 min |
| `gemini analyze-prd` | Validate and analyze PRD | 10 sec |
| `gemini gen-prprompts` | Generate all 32 PRPROMPTS files | 20 sec |
| `gemini gen-phase-1` | Generate Phase 1 (10 files) | 10 sec |
| `gemini gen-phase-2` | Generate Phase 2 (12 files) | 10 sec |
| `gemini gen-phase-3` | Generate Phase 3 (10 files) | 10 sec |
| `gemini gen-file` | Generate single file by name | 5 sec |

---

## Installation

### Option 1: Global (Recommended)

```bash
# Linux/macOS:
./scripts/install-gemini-commands.sh --global

# Windows:
scripts\install-gemini-commands.bat --global
```

Use from any project directory.

### Option 2: All 3 AI Assistants

```bash
# Install Claude + Qwen + Gemini
./scripts/install-all.sh --global
```

---

## Complete Workflows

### Workflow 1: Free Tier Power User

```bash
# Leverage Gemini's generous free tier
# 60 requests/min, 1,000/day - perfect for automation!

# 1. Auto-generate PRD
gemini auto-gen-prd

# 2. Generate all PRPROMPTS
gemini gen-prprompts

# 3. Regenerate as needed (still within free tier!)
gemini gen-file
gemini analyze-prd

# Done! All FREE
```

### Workflow 2: Large Codebase Analysis

```bash
# Leverage 1M token context

# 1. Process massive PRD (100+ pages)
gemini prd-from-files
# Input: 20+ markdown files

# 2. Analyze entire codebase
gemini analyze-prd
# Processes 200K+ lines at once

# 3. Generate PRPROMPTS
gemini gen-prprompts
```

### Workflow 3: CI/CD Automation

```bash
# 60 requests/minute perfect for builds

# In GitHub Actions workflow:
- name: Generate PRPROMPTS
  run: |
    npm install -g @google/gemini-cli
    gemini gen-prprompts
    git add PRPROMPTS/
    git commit -m "chore: regenerate PRPROMPTS"
```

---

## Gemini-Specific Features

### 1. Extended Context Window (1M Tokens)

Gemini's 1M token context means you can:

```bash
# Process entire monorepo at once
gemini analyze-prd  # Analyzes 400+ pages of documentation

# Generate consistent guidance across huge codebase
gemini gen-prprompts  # Keeps entire context in memory
```

**Comparison**:
- Claude: 200K tokens (~50 pages)
- Qwen: 256K-1M tokens (~400 pages)
- **Gemini: 1M tokens (~400 pages)**

### 2. Free Tier Benefits

**No cost for:**
- 1,000 requests per day
- 60 requests per minute
- 1 million token context
- All PRPROMPTS commands

**Perfect for**:
- Daily development (< 1,000 PRD updates/day)
- CI/CD pipelines (60 req/min = 3,600/hour)
- Team collaboration (shared free tier)

### 3. Agent Mode with ReAct Loop

Gemini's agent mode excels at:

```bash
# Complex multi-step workflows
gemini auto-gen-prd && gemini gen-prprompts && gemini analyze-prd

# The ReAct loop:
# 1. Reason about the task
# 2. Act on the plan
# 3. Observe results
# 4. Repeat until complete
```

---

## Command Details

### create-prd

```bash
gemini create-prd
```

**What it does**: Interactive wizard with 10 questions

**Gemini Advantage**: 1M token context means more detailed answers are processed without truncation

**Output**: `docs/PRD.md`

---

### auto-gen-prd

```bash
gemini auto-gen-prd
```

**What it does**: Auto-generates PRD from `project_description.md`

**Gemini Advantage**: Can infer from very long description files (100+ pages)

**Output**: `docs/PRD.md` with confidence score

---

### prd-from-files

```bash
gemini prd-from-files
```

**What it does**: Generates PRD from existing markdown files

**Gemini Advantage**:
- Can process 20+ files simultaneously
- 1M context = no file truncation
- Better synthesis across multiple sources

**Example**:
```bash
gemini prd-from-files
# Input files:
# docs/requirements.md (50 pages)
# specs/features.md (30 pages)
# architecture/design.md (40 pages)
# notes/meetings/*.md (20 files)
# Total: 120+ pages - no problem!
```

---

### analyze-prd

```bash
gemini analyze-prd
```

**What it does**: Validates PRD, shows customizations

**Gemini Advantage**:
- Analyzes PRD + entire codebase at once
- Cross-references with existing files
- Detects inconsistencies across large projects

---

### gen-prprompts

```bash
gemini gen-prprompts
```

**What it does**: Generates all 32 PRPROMPTS files

**Gemini Advantage**:
- Faster generation (agent mode)
- Keeps all 32 files in context for consistency
- Free tier = regenerate unlimited times

**Output**: `PRPROMPTS/` directory with 33 files

---

### gen-phase-1/2/3

```bash
gemini gen-phase-1  # Core architecture (10 files)
gemini gen-phase-2  # Quality & security (12 files)
gemini gen-phase-3  # Demo & learning (10 files)
```

**Gemini Advantage**: Free tier = try different approaches without cost

---

### gen-file

```bash
gemini gen-file
# Choose: security_and_compliance
```

**Gemini Advantage**: Quick regeneration within free tier

---

## Comparison with Claude & Qwen

| Feature | Claude Code | Qwen Code | Gemini CLI |
|---------|-------------|-----------|------------|
| **Context** | 200K | 256K-1M | **1M** |
| **Free Tier** | 20/day | Self-host | **60/min, 1K/day** |
| **Speed** | Fast | Very Fast | Fast |
| **Best For** | Production | Large codebases | **Free tier, MVPs** |

**Commands are identical**:
```bash
claude create-prd    # Uses Claude
qwen create-prd      # Uses Qwen
gemini create-prd    # Uses Gemini
```

**When to use Gemini**:
- ✅ Want free tier with high limits
- ✅ Building MVP or prototype
- ✅ CI/CD automation (60 req/min)
- ✅ Large codebase analysis (1M context)
- ✅ Student or open-source project

---

## Advanced Usage

### Custom Context Management

```bash
# Gemini can handle massive context
export GEMINI_CONTEXT_SIZE=1000000  # 1M tokens

gemini gen-prprompts  # Uses full 1M context
```

### Batch Processing

```bash
# Generate PRDs for multiple projects (free tier!)
for dir in project1 project2 project3; do
  cd $dir
  gemini auto-gen-prd
  gemini gen-prprompts
  cd ..
done
```

### CI/CD Integration

```yaml
# .github/workflows/prprompts.yml
name: Generate PRPROMPTS
on: [push]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Authenticate
        env:
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
        run: gemini auth login

      - name: Generate PRPROMPTS
        run: gemini gen-prprompts

      - name: Commit changes
        run: |
          git add PRPROMPTS/
          git commit -m "chore: regenerate PRPROMPTS"
          git push
```

---

## Troubleshooting

### Rate Limit Errors

**Free tier limits**:
- 60 requests/minute
- 1,000 requests/day

**Solutions**:
```bash
# Check current usage
gemini usage status

# Wait 1 minute if hitting per-minute limit
sleep 60 && gemini gen-prprompts

# Spread requests across day if hitting daily limit
```

### Context Too Large

Even with 1M tokens, very large codebases might exceed limits:

```bash
# Solution: Use phased generation
gemini gen-phase-1  # Focuses on core only
gemini gen-phase-2  # Separate context
gemini gen-phase-3  # Separate context
```

---

## Support

- 📖 [Gemini Installation Guide](../GEMINI.md)
- 🆚 [AI Comparison (3-way)](AI-COMPARISON.md)
- 🐛 [Report Issue](https://github.com/Kandil7/prprompts-flutter-generator/issues)
- 🔧 [Gemini CLI Docs](https://developers.google.com/gemini-code-assist/docs/gemini-cli)

---

<div align="center">

**Powered by** [Gemini CLI](https://developers.google.com/gemini-code-assist/docs/gemini-cli) | **Built for** [Flutter](https://flutter.dev)

[🚀 Quick Start](../GEMINI.md#quick-start) •
[📦 Install](../GEMINI.md#installation-methods) •
[📝 Commands](#quick-reference) •
[💬 Support](https://github.com/Kandil7/prprompts-flutter-generator/issues)

</div>
