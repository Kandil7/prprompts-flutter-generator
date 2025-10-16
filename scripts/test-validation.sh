#!/bin/bash
# PRPROMPTS Generator - Validation Test Script
# Tests prompt files, config files, and directory structure

set -e

echo "=================================================="
echo " PRPROMPTS Generator - Validation Tests"
echo "=================================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# Test 1: Check Claude prompts exist
echo "Test 1: Checking Claude prompt files..."
EXPECTED_PROMPTS=9
CLAUDE_PROMPTS=$(ls .claude/prompts/*.md 2>/dev/null | wc -l)

if [ "$CLAUDE_PROMPTS" -eq "$EXPECTED_PROMPTS" ]; then
    echo -e "${GREEN}✓${NC} Found $CLAUDE_PROMPTS/$EXPECTED_PROMPTS Claude prompt files"
else
    echo -e "${RED}✗${NC} Expected $EXPECTED_PROMPTS Claude prompts, found $CLAUDE_PROMPTS"
    FAILED=$((FAILED + 1))
fi

# Test 2: Check Qwen prompts exist
echo "Test 2: Checking Qwen prompt files..."
QWEN_PROMPTS=$(ls .qwen/prompts/*.md 2>/dev/null | wc -l)

if [ "$QWEN_PROMPTS" -eq "$EXPECTED_PROMPTS" ]; then
    echo -e "${GREEN}✓${NC} Found $QWEN_PROMPTS/$EXPECTED_PROMPTS Qwen prompt files"
else
    echo -e "${RED}✗${NC} Expected $EXPECTED_PROMPTS Qwen prompts, found $QWEN_PROMPTS"
    FAILED=$((FAILED + 1))
fi

# Test 3: Check Gemini prompts exist
echo "Test 3: Checking Gemini prompt files..."
GEMINI_PROMPTS=$(ls .gemini/prompts/*.md 2>/dev/null | wc -l)

if [ "$GEMINI_PROMPTS" -eq "$EXPECTED_PROMPTS" ]; then
    echo -e "${GREEN}✓${NC} Found $GEMINI_PROMPTS/$EXPECTED_PROMPTS Gemini prompt files"
else
    echo -e "${RED}✗${NC} Expected $EXPECTED_PROMPTS Gemini prompts, found $GEMINI_PROMPTS"
    FAILED=$((FAILED + 1))
fi

# Test 4: Check config files exist
echo "Test 4: Checking configuration files..."
CONFIG_FILES=(".claude/config.yml" ".qwen/config.yml" ".gemini/config.yml")
for config in "${CONFIG_FILES[@]}"; do
    if [ -f "$config" ]; then
        echo -e "${GREEN}✓${NC} $config exists"
    else
        echo -e "${RED}✗${NC} $config missing"
        FAILED=$((FAILED + 1))
    fi
done

# Test 5: Check template files
echo "Test 5: Checking template files..."
TEMPLATES=("templates/PRD-full-template.md" "templates/project_description.md")
for template in "${TEMPLATES[@]}"; do
    if [ -f "$template" ]; then
        echo -e "${GREEN}✓${NC} $template exists"
    else
        echo -e "${RED}✗${NC} $template missing"
        FAILED=$((FAILED + 1))
    fi
done

# Test 6: Check example files
echo "Test 6: Checking example files..."
EXAMPLES=$(ls examples/*.md 2>/dev/null | wc -l)
EXPECTED_EXAMPLES=5

if [ "$EXAMPLES" -ge "$EXPECTED_EXAMPLES" ]; then
    echo -e "${GREEN}✓${NC} Found $EXAMPLES example files"
else
    echo -e "${YELLOW}⚠${NC} Expected at least $EXPECTED_EXAMPLES examples, found $EXAMPLES"
fi

# Test 7: Check documentation files
echo "Test 7: Checking documentation files..."
DOCS=(
    "README.md"
    "CHANGELOG.md"
    "CONTRIBUTING.md"
    "LICENSE"
    "docs/PRPROMPTS-SPECIFICATION.md"
    "docs/PRD-GUIDE.md"
    "docs/AUTO-PRD-GUIDE.md"
    "docs/PRD-FROM-FILES-GUIDE.md"
    "docs/CLAUDE-COMMANDS.md"
    "docs/QWEN-COMMANDS.md"
    "docs/GEMINI-COMMANDS.md"
    "docs/AI-COMPARISON.md"
    "docs/USAGE.md"
    "docs/CUSTOMIZATION.md"
    "docs/TROUBLESHOOTING.md"
    "docs/API.md"
)

DOCS_FOUND=0
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        DOCS_FOUND=$((DOCS_FOUND + 1))
    else
        echo -e "${YELLOW}⚠${NC} $doc missing"
    fi
done

echo -e "${GREEN}✓${NC} Found $DOCS_FOUND/${#DOCS[@]} documentation files"

# Test 8: Check installation scripts
echo "Test 8: Checking installation scripts..."
INSTALL_SCRIPTS=(
    "scripts/install-commands.sh"
    "scripts/install-commands.bat"
    "scripts/install-commands.ps1"
    "scripts/install-qwen-commands.sh"
    "scripts/install-qwen-commands.bat"
    "scripts/install-qwen-commands.ps1"
    "scripts/install-gemini-commands.sh"
    "scripts/install-gemini-commands.bat"
    "scripts/install-gemini-commands.ps1"
)

SCRIPTS_FOUND=0
for script in "${INSTALL_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        SCRIPTS_FOUND=$((SCRIPTS_FOUND + 1))
    fi
done

if [ "$SCRIPTS_FOUND" -eq "${#INSTALL_SCRIPTS[@]}" ]; then
    echo -e "${GREEN}✓${NC} All $SCRIPTS_FOUND installation scripts present"
else
    echo -e "${YELLOW}⚠${NC} Found $SCRIPTS_FOUND/${#INSTALL_SCRIPTS[@]} installation scripts"
fi

# Test 9: Validate YAML syntax (if yq is available)
echo "Test 9: Validating YAML syntax..."
if command -v yq &> /dev/null; then
    for config in "${CONFIG_FILES[@]}"; do
        if yq eval '.' "$config" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $config has valid YAML"
        else
            echo -e "${RED}✗${NC} $config has invalid YAML"
            FAILED=$((FAILED + 1))
        fi
    done
else
    echo -e "${YELLOW}⚠${NC} yq not installed, skipping YAML validation"
fi

# Test 10: Check main generator prompt is comprehensive
echo "Test 10: Checking main generator prompt..."
MAIN_PROMPT=".claude/prompts/prprompts-generator.md"
if [ -f "$MAIN_PROMPT" ]; then
    LINES=$(wc -l < "$MAIN_PROMPT")
    if [ "$LINES" -gt 500 ]; then
        echo -e "${GREEN}✓${NC} Main generator prompt is comprehensive ($LINES lines)"
    else
        echo -e "${YELLOW}⚠${NC} Main generator prompt seems short ($LINES lines)"
    fi
else
    echo -e "${RED}✗${NC} Main generator prompt missing"
    FAILED=$((FAILED + 1))
fi

# Summary
echo ""
echo "=================================================="
if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✅ All validation tests passed!${NC}"
    echo "=================================================="
    exit 0
else
    echo -e "${RED}❌ $FAILED test(s) failed${NC}"
    echo "=================================================="
    exit 1
fi
