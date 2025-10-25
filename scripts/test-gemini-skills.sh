#!/bin/bash
# PRPROMPTS Generator - Gemini CLI Skills Test Script
# Tests Gemini TOML skill files in repository and user installation

set -e

echo "=================================================="
echo " PRPROMPTS - Gemini CLI Skills Tests"
echo "=================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

FAILED=0
WARNINGS=0

# Detect OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  GEMINI_DIR="$USERPROFILE/.gemini"
else
  GEMINI_DIR="$HOME/.gemini"
fi

# Test 1: Check repository TOML files exist
echo "Test 1: Checking repository TOML skill files..."
EXPECTED_TOML=8
REPO_TOML=$(find .gemini/commands/skills -name "*.toml" 2>/dev/null | wc -l)

if [ "$REPO_TOML" -eq "$EXPECTED_TOML" ]; then
    echo -e "${GREEN}✓${NC} Found $REPO_TOML/$EXPECTED_TOML TOML skill files in repository"
else
    echo -e "${RED}✗${NC} Expected $EXPECTED_TOML TOML files, found $REPO_TOML"
    FAILED=$((FAILED + 1))
fi

# Test 2: Check specific skill files exist in repository
echo "Test 2: Checking specific skill files in repository..."
REPO_SKILLS=(
    ".gemini/commands/skills/automation/flutter-bootstrapper.toml"
    ".gemini/commands/skills/automation/feature-implementer.toml"
    ".gemini/commands/skills/automation/automation-orchestrator.toml"
    ".gemini/commands/skills/automation/code-reviewer.toml"
    ".gemini/commands/skills/automation/qa-auditor.toml"
    ".gemini/commands/skills/prprompts-core/phase-generator.toml"
    ".gemini/commands/skills/prprompts-core/single-file-generator.toml"
    ".gemini/commands/skills/development-workflow/flutter-flavors.toml"
)

REPO_SKILLS_FOUND=0
for skill in "${REPO_SKILLS[@]}"; do
    if [ -f "$skill" ]; then
        REPO_SKILLS_FOUND=$((REPO_SKILLS_FOUND + 1))
    else
        echo -e "${RED}✗${NC} Missing: $skill"
        FAILED=$((FAILED + 1))
    fi
done

if [ "$REPO_SKILLS_FOUND" -eq "${#REPO_SKILLS[@]}" ]; then
    echo -e "${GREEN}✓${NC} All $REPO_SKILLS_FOUND skill files present in repository"
fi

# Test 3: Check TOML file sizes (should be substantial, not empty)
echo "Test 3: Checking TOML file sizes..."
MIN_SIZE=1000  # 1KB minimum (skills should have prompts)
SMALL_FILES=0

for skill in "${REPO_SKILLS[@]}"; do
    if [ -f "$skill" ]; then
        SIZE=$(wc -c < "$skill")
        if [ "$SIZE" -lt "$MIN_SIZE" ]; then
            echo -e "${YELLOW}⚠${NC} $skill is suspiciously small ($SIZE bytes)"
            SMALL_FILES=$((SMALL_FILES + 1))
        fi
    fi
done

if [ "$SMALL_FILES" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} All skill files have substantial content"
else
    echo -e "${YELLOW}⚠${NC} Found $SMALL_FILES small files (may be incomplete)"
    WARNINGS=$((WARNINGS + 1))
fi

# Test 4: Check generator script exists
echo "Test 4: Checking generator script..."
GENERATOR="scripts/generate-gemini-toml-skills.js"
if [ -f "$GENERATOR" ]; then
    echo -e "${GREEN}✓${NC} Generator script exists: $GENERATOR"
else
    echo -e "${RED}✗${NC} Generator script missing: $GENERATOR"
    FAILED=$((FAILED + 1))
fi

# Test 5: Check installer scripts exist
echo "Test 5: Checking installer scripts..."
INSTALLER_SCRIPTS=(
    "scripts/install-gemini-skills.sh"
    "scripts/install-gemini-skills.ps1"
    "scripts/install-gemini-skills.bat"
)

INSTALLERS_FOUND=0
for script in "${INSTALLER_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        INSTALLERS_FOUND=$((INSTALLERS_FOUND + 1))
    else
        echo -e "${RED}✗${NC} Missing installer: $script"
        FAILED=$((FAILED + 1))
    fi
done

if [ "$INSTALLERS_FOUND" -eq "${#INSTALLER_SCRIPTS[@]}" ]; then
    echo -e "${GREEN}✓${NC} All $INSTALLERS_FOUND installer scripts present"
fi

# Test 6: Check user installation (if exists)
echo "Test 6: Checking user installation..."
if [ -d "$GEMINI_DIR/commands/skills" ]; then
    USER_TOML=$(find "$GEMINI_DIR/commands/skills" -name "*.toml" 2>/dev/null | wc -l)

    if [ "$USER_TOML" -eq "$EXPECTED_TOML" ]; then
        echo -e "${GREEN}✓${NC} Found $USER_TOML/$EXPECTED_TOML skills installed in $GEMINI_DIR"
    else
        echo -e "${YELLOW}⚠${NC} Expected $EXPECTED_TOML skills in user directory, found $USER_TOML"
        echo -e "${CYAN}  Hint: Run 'npm install -g prprompts-flutter-generator' to install${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} Skills not installed in user directory: $GEMINI_DIR/commands/skills"
    echo -e "${CYAN}  Hint: Run 'npm install -g prprompts-flutter-generator' to install${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Test 7: Check if Gemini CLI is installed
echo "Test 7: Checking Gemini CLI installation..."
if command -v gemini &> /dev/null; then
    GEMINI_VERSION=$(gemini --version 2>&1 || echo "unknown")
    echo -e "${GREEN}✓${NC} Gemini CLI installed: $GEMINI_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Gemini CLI not installed"
    echo -e "${CYAN}  Hint: Run 'npm install -g @google/gemini-cli' to install${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Test 8: Check documentation exists
echo "Test 8: Checking Gemini skills documentation..."
DOCS=(
    "docs/GEMINI-SKILLS-GUIDE.md"
    "GEMINI.md"
    ".gemini/skills/index.md"
)

DOCS_FOUND=0
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        DOCS_FOUND=$((DOCS_FOUND + 1))
    else
        echo -e "${RED}✗${NC} Missing documentation: $doc"
        FAILED=$((FAILED + 1))
    fi
done

if [ "$DOCS_FOUND" -eq "${#DOCS[@]}" ]; then
    echo -e "${GREEN}✓${NC} All $DOCS_FOUND documentation files present"
fi

# Test 9: Validate TOML syntax (if nodejs is available)
echo "Test 9: Validating TOML file syntax..."
if command -v node &> /dev/null; then
    # Simple check: ensure files are not empty and have basic TOML structure
    INVALID_TOML=0
    for skill in "${REPO_SKILLS[@]}"; do
        if [ -f "$skill" ]; then
            # Check for basic TOML structure (description and prompt fields)
            if grep -q 'description = ' "$skill" && grep -q 'prompt = ' "$skill"; then
                : # Valid
            else
                echo -e "${YELLOW}⚠${NC} $skill may have invalid TOML structure"
                INVALID_TOML=$((INVALID_TOML + 1))
            fi
        fi
    done

    if [ "$INVALID_TOML" -eq 0 ]; then
        echo -e "${GREEN}✓${NC} All TOML files have valid structure"
    else
        echo -e "${YELLOW}⚠${NC} Found $INVALID_TOML files with potentially invalid TOML"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} Node.js not installed, skipping TOML validation"
fi

# Test 10: Check skills guide comprehensiveness
echo "Test 10: Checking skills guide comprehensiveness..."
SKILLS_GUIDE="docs/GEMINI-SKILLS-GUIDE.md"
if [ -f "$SKILLS_GUIDE" ]; then
    LINES=$(wc -l < "$SKILLS_GUIDE")
    if [ "$LINES" -gt 800 ]; then
        echo -e "${GREEN}✓${NC} Skills guide is comprehensive ($LINES lines)"
    else
        echo -e "${YELLOW}⚠${NC} Skills guide seems short ($LINES lines, expected 900+)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}✗${NC} Skills guide missing"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "=================================================="
if [ "$FAILED" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}✅ All Gemini skills tests passed!${NC}"
    else
        echo -e "${YELLOW}⚠️  Tests passed with $WARNINGS warning(s)${NC}"
    fi
    echo "=================================================="
    echo ""
    echo "Next steps:"
    echo "  1. Install skills: npm install -g prprompts-flutter-generator"
    echo "  2. Verify: gemini"
    echo "  3. Use: /skills:automation:flutter-bootstrapper"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $FAILED test(s) failed, $WARNINGS warning(s)${NC}"
    echo "=================================================="
    exit 1
fi
