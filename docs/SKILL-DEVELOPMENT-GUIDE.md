# PRPROMPTS Skills Development Guide

> **Complete guide to creating, testing, and deploying Claude Code skills for PRPROMPTS Flutter Generator**

---

## 📋 Table of Contents

### For Juniors (Start Here!)
1. [What Are Skills?](#what-are-skills-for-juniors)
2. [Your First Skill (Step-by-Step)](#your-first-skill-tutorial)
3. [Common Mistakes & How to Fix Them](#common-mistakes-juniors)
4. [Getting Help](#getting-help)

### For Intermediate Developers
5. [Skill Architecture](#skill-architecture-intermediate)
6. [Testing Your Skills](#testing-skills-intermediate)
7. [CI/CD Integration](#cicd-integration-intermediate)

### For Senior Developers
8. [Advanced Skill Patterns](#advanced-skill-patterns-senior)
9. [Performance Optimization](#performance-optimization-senior)
10. [Multi-AI Compatibility](#multi-ai-compatibility-senior)
11. [Contributing Guidelines](#contributing-guidelines-senior)

---

## 🌱 What Are Skills? (For Juniors)

### The Simple Explanation

**Skills are like apps for Claude Code.** Just like you install apps on your phone, you can give Claude Code "skills" - each one teaches Claude how to do a specific task automatically.

**Example:**
- **prd-analyzer skill** = Checks if your project document is complete
- **security-validator skill** = Scans your code for security problems
- **repo-tester skill** = Runs all your tests automatically

### Real-World Analogy

Think of Claude Code as a new employee at your company:

```
📝 Without Skills:
You: "Claude, check if the project doc is good"
Claude: "I don't know how to do that"

✅ With Skills:
You: "@claude use skill prd-analyzer"
Claude: *reads skill instructions* "I found 3 warnings in your PRD..."
```

**Skills = Instructions that Claude can follow automatically**

---

## 🎓 Your First Skill Tutorial

Let's create a simple skill called "file-counter" that counts files in a directory.

### Step 1: Create the Directory Structure

```bash
# Navigate to your repo
cd prprompts-flutter-generator

# Create skill directories
mkdir -p .claude/skills/utilities/file-counter
```

**What did we just do?**
- `.claude/skills/` = Where all skills live
- `utilities/` = Category (like a folder on your phone)
- `file-counter/` = Your skill's name

### Step 2: Create skill.json (The Basics)

Create `.claude/skills/utilities/file-counter/skill.json`:

```json
{
  "id": "file-counter",
  "name": "File Counter",
  "version": "1.0.0",
  "category": "utilities",
  "description": "Count files in a directory by type",

  "inputs": {
    "required": {
      "directory": {
        "type": "string",
        "description": "Directory to scan"
      }
    }
  },

  "outputs": {
    "total_files": {
      "type": "number",
      "description": "Total number of files"
    }
  },

  "config": {
    "timeout": 30000,
    "retryable": true
  }
}
```

**What does each part mean?**
- `id`: Unique name (must match folder name!)
- `name`: Human-readable name
- `version`: Like app versions (1.0.0, 1.0.1, etc.)
- `category`: Which group it belongs to
- `inputs`: What information the skill needs
- `outputs`: What information the skill returns
- `config`: How long it can run, can it retry, etc.

### Step 3: Create skill.md (The Instructions)

Create `.claude/skills/utilities/file-counter/skill.md`:

```markdown
# File Counter Skill

## Task

Count all files in the specified directory and report by file type.

### Step 1: Read Directory
- Use `ls` or `find` to list all files in {{inputs.directory}}
- Include subdirectories

### Step 2: Count by Type
- Group files by extension (.js, .md, .json, etc.)
- Count files in each group

### Step 3: Return Results
Output JSON:
{
  "total_files": 42,
  "by_type": {
    ".js": 15,
    ".md": 10,
    ".json": 5,
    ".sh": 8,
    "other": 4
  }
}
```

**This is what Claude reads when you run the skill!**

### Step 4: Create README.md (For Other Juniors)

Create `.claude/skills/utilities/file-counter/README.md`:

```markdown
# 📊 File Counter Skill

## What Does This Do?

Counts how many files you have in a folder, sorted by type.

## When To Use

- Before committing: "Do I have too many files?"
- Cleaning up: "Which file types do I have most?"
- Learning: "What types of files are in this project?"

## How To Use

```
@claude use skill utilities/file-counter --directory ./src
```

## What You Get

```
Total Files: 42
- JavaScript: 15 files
- Markdown: 10 files
- JSON: 5 files
```

Takes: 2-3 seconds
```

### Step 5: Test Your Skill

```bash
# Test the skill structure
node scripts/test-skill.js file-counter --verbose

# Expected output:
# ✅ Passed: 5
# ❌ Failed: 0
```

### Step 6: Make It Work for All AIs

```bash
# Copy to Qwen and Gemini
./scripts/sync-skills-across-ais.sh --skill file-counter

# Expected output:
# ✅ Synced to Qwen: utilities/file-counter
# ✅ Synced to Gemini: utilities/file-counter
```

### Step 7: Commit Your Work

```bash
git add .claude/skills/utilities/file-counter
git add .qwen/skills/utilities/file-counter
git add .gemini/skills/utilities/file-counter
git commit -m "feat(skills): add file-counter utility skill"
git push
```

**That's it! You created your first skill! 🎉**

---

## ⚠️ Common Mistakes (Juniors)

### Mistake 1: skill.json ID doesn't match folder name

**Bad:**
```
Folder: .claude/skills/utilities/file-counter/
skill.json: { "id": "fileCounter" }  ❌ Mismatch!
```

**Good:**
```
Folder: .claude/skills/utilities/file-counter/
skill.json: { "id": "file-counter" }  ✅ Match!
```

**Fix:** Always use kebab-case (words-with-dashes) for both.

---

### Mistake 2: Invalid JSON syntax

**Bad:**
```json
{
  "id": "file-counter",
  "name": "File Counter"  ❌ Missing comma!
  "version": "1.0.0"
}
```

**Good:**
```json
{
  "id": "file-counter",
  "name": "File Counter",  ✅ Has comma
  "version": "1.0.0"
}
```

**Fix:** Use a JSON validator: https://jsonlint.com/

---

### Mistake 3: Forgot to create skill.md

**Error:**
```
❌ Missing: skill.md
```

**Fix:** skill.md is REQUIRED. It's the instructions Claude follows.

---

### Mistake 4: Wrong category name

**Bad:**
```json
{
  "category": "utility"  ❌ Wrong! (singular)
}
```

**Good:**
```json
{
  "category": "utilities"  ✅ Correct! (plural)
}
```

**Valid categories:**
- `prprompts-core`
- `automation`
- `validation`
- `utilities`
- `repository-meta`
- `development-workflow`

---

## 🆘 Getting Help

### Run Diagnostics

```bash
# Check if your skill is valid
node scripts/test-skill.js your-skill-name --verbose
```

### Common Errors and Solutions

| Error | Meaning | Fix |
|-------|---------|-----|
| "Skill not found" | Wrong path or name | Check folder exists at `.claude/skills/category/name/` |
| "Invalid JSON" | Syntax error in skill.json | Use jsonlint.com to validate |
| "Missing skill.md" | No instructions file | Create skill.md with task steps |
| "Schema validation failed" | skill.json doesn't follow rules | Compare with examples in this doc |

### Ask for Help

1. Check examples: `.claude/skills/prprompts-core/prd-analyzer/`
2. Read error messages carefully
3. Ask in GitHub Issues: https://github.com/Kandil7/prprompts-flutter-generator/issues

---

## 🏗️ Skill Architecture (Intermediate)

### File Structure Deep Dive

```
.claude/skills/
  {category}/              # prprompts-core, automation, etc.
    {skill-name}/
      ├── skill.json       # Metadata & configuration (REQUIRED)
      ├── skill.md         # Execution instructions (REQUIRED)
      ├── README.md        # Junior-friendly docs (RECOMMENDED)
      ├── examples.md      # Usage examples (OPTIONAL)
      └── test.json        # Test cases for CI/CD (OPTIONAL)
```

### skill.json Advanced Fields

```json
{
  "id": "example-skill",
  "name": "Example Skill",
  "version": "1.0.0",
  "category": "utilities",
  "description": "What this skill does (1-2 sentences max)",
  "author": "PRPROMPTS Team",
  "icon": "🛠️",
  "tags": ["tag1", "tag2"],

  "inputs": {
    "required": {
      "param1": {
        "type": "string",
        "description": "What this parameter is for",
        "validation": "^[a-zA-Z0-9]+$"  // Regex validation (optional)
      }
    },
    "optional": {
      "param2": {
        "type": "boolean",
        "description": "Optional parameter",
        "default": false
      }
    }
  },

  "outputs": {
    "result": {
      "type": "string",
      "description": "What gets returned"
    }
  },

  "config": {
    "interactive": false,        // Does it ask user questions?
    "timeout": 60000,            // Max time (milliseconds)
    "retryable": true,           // Can it retry on failure?
    "maxRetries": 3,             // How many retries?
    "cacheable": false,          // Should results be cached?
    "cacheDuration": 3600        // Cache for how long? (seconds)
  },

  "dependencies": ["other-skill"],  // Must run after these skills

  "requirements": {
    "flutter": false,            // Needs Flutter installed?
    "projectInitialized": false, // Needs Flutter project?
    "prdExists": false,          // Needs PRD file?
    "prpromptsGenerated": false, // Needs PRPROMPTS files?
    "gitRepo": false             // Needs Git repository?
  },

  "examples": [
    {
      "description": "Basic usage",
      "command": "@claude use skill utilities/example-skill",
      "expectedOutput": "What user should see"
    }
  ],

  "cicd": {
    "testable": true,
    "mockInputs": {
      "param1": "test-value"
    },
    "expectedOutputs": {
      "result": "expected-result"
    }
  }
}
```

### skill.md Template

```markdown
# {Skill Name} - Execution Prompt

## Context
You are executing the **{skill-id}** skill. This skill {detailed description}.

## Inputs
- **param1**: {{inputs.param1}}
- **param2**: {{inputs.param2 || default_value}}

## Task
{Step-by-step instructions for Claude}

### Step 1: {Action Name}
- Do this
- Then do that
- Check this condition

### Step 2: {Next Action}
- More instructions
- Be specific!

## Output Format
```json
{
  "result": "value",
  "status": "success"
}
```

## Error Handling
- If X happens → Do Y
- If Z is missing → Return error
```

---

## 🧪 Testing Skills (Intermediate)

### Local Testing

```bash
# Test skill structure
node scripts/test-skill.js skill-name --verbose

# What it checks:
# ✅ skill.json exists and is valid JSON
# ✅ skill.md exists
# ✅ Skill ID matches directory name
# ✅ Category is valid
# ✅ JSON Schema validation passes
# ✅ Multi-AI parity (exists in .qwen and .gemini)
```

### Manual Testing

```bash
# In a test project
cd /tmp/test-project

# Try to use the skill
@claude use skill utilities/your-skill-name --param1 "test"

# Check if it works as expected
```

### Automated Testing (CI/CD)

Your skill is automatically tested when you push to GitHub:

```yaml
# .github/workflows/skills-validation.yml runs:
1. JSON Schema validation
2. File completeness check
3. Multi-AI parity verification
4. Metadata validation
```

---

## 🚀 CI/CD Integration (Intermediate)

### What Happens When You Push?

```
You push → GitHub Actions triggers → 3 workflows run:

1. skills-validation.yml
   ✅ Validates all skill.json files
   ✅ Checks required files exist
   ✅ Verifies multi-AI parity

2. skills-test.yml
   ✅ Tests skills with mock data
   ✅ Runs integration tests
   ✅ Generates coverage report

3. (Future) skills-benchmark.yml
   ✅ Measures execution time
   ✅ Compares performance
```

### Fixing CI Failures

#### Failure: "Schema validation failed"

**Error:**
```
❌ Schema validation failed: .claude/skills/utilities/my-skill/skill.json
   - Missing required property: version
```

**Fix:**
```json
{
  "id": "my-skill",
  "name": "My Skill",
  "version": "1.0.0",  ← Add this!
  "category": "utilities",
  "description": "..."
}
```

#### Failure: "Multi-AI parity check failed"

**Error:**
```
❌ Skill count mismatch: Claude=10, Qwen=9, Gemini=9
```

**Fix:**
```bash
./scripts/sync-skills-across-ais.sh
git add .qwen/ .gemini/
git commit -m "sync: Update skills across AIs"
git push
```

---

## ⚡ Advanced Skill Patterns (Senior)

### Pattern 1: Skill Dependencies

**Use Case:** `prprompts-generator` must run after `prd-analyzer`

```json
{
  "id": "prprompts-generator",
  "dependencies": ["prd-analyzer"],
  ...
}
```

**How it works:**
1. User runs: `@claude use skill prprompts-generator`
2. System checks dependencies
3. Runs `prd-analyzer` first (if not already run)
4. Then runs `prprompts-generator`

### Pattern 2: Conditional Logic in skill.md

```markdown
## Task

### Step 1: Check Input Type

If {{inputs.mode}} == "strict":
  - Enable strict validation
  - Fail on warnings
Else:
  - Normal validation
  - Warnings are non-blocking

### Step 2: Process Based on Type

If {{inputs.project_type}} == "healthcare":
  - Check HIPAA compliance
  - Validate PHI encryption
Else if {{inputs.project_type}} == "fintech":
  - Check PCI-DSS compliance
  - Validate payment security
```

### Pattern 3: Caching Expensive Operations

```json
{
  "config": {
    "cacheable": true,
    "cacheDuration": 3600
  }
}
```

**When to cache:**
- ✅ Analysis results (prd-analyzer)
- ✅ Validation outputs (security-validator)
- ❌ Code generation (prprompts-generator)
- ❌ File modifications (any skill that writes files)

### Pattern 4: Retry Logic

```json
{
  "config": {
    "retryable": true,
    "maxRetries": 3
  }
}
```

**In skill.md, handle retries:**
```markdown
## Error Handling

If API rate limit exceeded:
  - Wait 60 seconds
  - Retry (automatic, up to 3 times)

If file not found:
  - DO NOT retry (not retryable error)
  - Return error immediately
```

---

## 🎯 Performance Optimization (Senior)

### Optimization Targets

| Skill Type | Target Time | Max Time |
|------------|-------------|----------|
| Analysis (prd-analyzer) | < 10s | 30s |
| Generation (prprompts-generator) | < 60s | 90s |
| Validation (security-validator) | < 30s | 60s |
| Utility (file-counter) | < 5s | 15s |

### Optimization Techniques

#### 1. Minimize File I/O

**Bad (reads file 3 times):**
```markdown
Step 1: Read PRD, check if exists
Step 2: Read PRD, parse YAML
Step 3: Read PRD, extract content
```

**Good (reads once):**
```markdown
Step 1: Read PRD file once, store in memory
Step 2: Parse YAML from in-memory content
Step 3: Extract content from in-memory data
```

#### 2. Use Streaming for Large Operations

**For skills that process many files:**
```markdown
Instead of:
  1. Load all 32 PRPROMPTS files into memory
  2. Process all at once

Do:
  1. Process file 1, write output
  2. Process file 2, write output
  3. ...
```

#### 3. Early Exit on Errors

```markdown
Step 1: Check if PRD exists
  If NO → Return error immediately (don't continue)

Step 2: Parse YAML
  If invalid → Return error (don't continue)

Step 3: Validate metadata
  ...
```

---

## 🌐 Multi-AI Compatibility (Senior)

### Design Principles

**1. AI-Agnostic Language**

All skills must work identically on Claude, Qwen, and Gemini.

**Bad (Claude-specific):**
```markdown
Use Claude's document analysis feature to...
```

**Good (AI-agnostic):**
```markdown
Analyze the document by reading and parsing...
```

**2. No AI-Specific APIs**

**Bad:**
```markdown
Call anthropic.messages.create() to...
```

**Good:**
```markdown
Read the file, process content, return results
```

**3. Identical File Structure**

```
.claude/skills/utilities/skill-name/  ← Identical files
.qwen/skills/utilities/skill-name/    ← Identical files
.gemini/skills/utilities/skill-name/  ← Identical files
```

### Testing Multi-AI Compatibility

```bash
# After creating skill
./scripts/sync-skills-across-ais.sh --skill your-skill-name

# Verify
diff -r .claude/skills/utilities/your-skill-name/ \
        .qwen/skills/utilities/your-skill-name/

# Should output: (no differences)
```

---

## 📝 Contributing Guidelines (Senior)

### Before Creating a Pull Request

**1. Run all validations:**
```bash
npm run test
npm run lint
node scripts/test-skill.js your-skill-name --verbose
./scripts/sync-skills-across-ais.sh --dry-run
```

**2. Update documentation:**
- Add README.md (junior docs)
- Add examples.md (usage examples)
- Update `.claude/skills.json` registry
- Update `docs/SKILL-DEVELOPMENT-GUIDE.md` if needed

**3. Write tests:**
Create `test.json` with CI/CD test cases:
```json
{
  "tests": [
    {
      "name": "Test with valid input",
      "inputs": {"param1": "value"},
      "expectedOutputs": {"result": "expected"}
    },
    {
      "name": "Test with invalid input",
      "inputs": {"param1": ""},
      "expectedOutputs": {"error": "param1 is required"}
    }
  ]
}
```

### Pull Request Template

```markdown
## Description
Brief description of the skill

## Skill Details
- **Name:** skill-name
- **Category:** utilities
- **Purpose:** What it does in 1 sentence

## Testing
- [ ] Passed local tests (`node scripts/test-skill.js`)
- [ ] Synced to all AIs
- [ ] Added documentation (README.md, examples.md)
- [ ] CI/CD passes

## Checklist
- [ ] skill.json follows schema
- [ ] skill.md has clear instructions
- [ ] README.md is junior-friendly
- [ ] Examples included
- [ ] Multi-AI compatible
```

---

## 🎓 Summary

### For Juniors
1. Skills = Instructions for Claude
2. Create 3 files: skill.json, skill.md, README.md
3. Test with: `node scripts/test-skill.js skill-name`
4. Sync to all AIs: `./scripts/sync-skills-across-ais.sh`

### For Intermediates
5. Understand skill.json schema fully
6. Write comprehensive skill.md with steps
7. Test locally and in CI/CD
8. Handle errors gracefully

### For Seniors
9. Use advanced patterns (dependencies, caching, retries)
10. Optimize for performance (< target times)
11. Ensure multi-AI compatibility
12. Contribute with full documentation

---

## 📚 Additional Resources

- **JSON Schema:** `schemas/skill-schema.json`
- **Example Skills:** `.claude/skills/prprompts-core/prd-analyzer/`
- **Test Script:** `scripts/test-skill.js`
- **Sync Script:** `scripts/sync-skills-across-ais.sh`
- **CI/CD Workflows:** `.github/workflows/skills-*.yml`

---

**Version:** 1.0.0
**Last Updated:** 2025-10-24
**Maintainers:** PRPROMPTS Team
