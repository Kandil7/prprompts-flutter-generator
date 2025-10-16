#!/bin/bash
# PRPROMPTS Generator - Command Testing Script
# Tests all commands across available AI assistants

set -e

echo "=================================================="
echo " PRPROMPTS Generator - Command Testing"
echo "=================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect which AIs are installed
CLAUDE_AVAILABLE=false
QWEN_AVAILABLE=false
GEMINI_AVAILABLE=false

if command -v claude &> /dev/null; then
    CLAUDE_AVAILABLE=true
    echo -e "${GREEN}✓${NC} Claude Code detected"
fi

if command -v qwen &> /dev/null; then
    QWEN_AVAILABLE=true
    echo -e "${GREEN}✓${NC} Qwen Code detected"
fi

if command -v gemini &> /dev/null; then
    GEMINI_AVAILABLE=true
    echo -e "${GREEN}✓${NC} Gemini CLI detected"
fi

if ! $CLAUDE_AVAILABLE && ! $QWEN_AVAILABLE && ! $GEMINI_AVAILABLE; then
    echo -e "${RED}✗${NC} No AI assistants detected!"
    echo ""
    echo "Please install at least one:"
    echo "  - Claude Code: npm install -g @anthropic-ai/claude-code"
    echo "  - Qwen Code: See https://github.com/QwenLM/qwen-code"
    echo "  - Gemini CLI: See https://developers.google.com/gemini-code-assist/docs/gemini-cli"
    exit 1
fi

echo ""

# Function to test command availability
test_command() {
    local ai_name=$1
    local command=$2
    local description=$3

    if $command --help &> /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $ai_name: $description"
        return 0
    else
        echo -e "${RED}✗${NC} $ai_name: $description (command not found)"
        return 1
    fi
}

# Test Claude Code commands
if $CLAUDE_AVAILABLE; then
    echo -e "${BLUE}Testing Claude Code commands...${NC}"

    test_command "Claude" "claude create-prd" "create-prd"
    test_command "Claude" "claude auto-gen-prd" "auto-gen-prd"
    test_command "Claude" "claude prd-from-files" "prd-from-files"
    test_command "Claude" "claude analyze-prd" "analyze-prd"
    test_command "Claude" "claude gen-prprompts" "gen-prprompts"
    test_command "Claude" "claude gen-phase-1" "gen-phase-1"
    test_command "Claude" "claude gen-phase-2" "gen-phase-2"
    test_command "Claude" "claude gen-phase-3" "gen-phase-3"
    test_command "Claude" "claude gen-file" "gen-file"

    echo ""
fi

# Test Qwen Code commands
if $QWEN_AVAILABLE; then
    echo -e "${BLUE}Testing Qwen Code commands...${NC}"

    test_command "Qwen" "qwen create-prd" "create-prd"
    test_command "Qwen" "qwen auto-gen-prd" "auto-gen-prd"
    test_command "Qwen" "qwen prd-from-files" "prd-from-files"
    test_command "Qwen" "qwen analyze-prd" "analyze-prd"
    test_command "Qwen" "qwen gen-prprompts" "gen-prprompts"
    test_command "Qwen" "qwen gen-phase-1" "gen-phase-1"
    test_command "Qwen" "qwen gen-phase-2" "gen-phase-2"
    test_command "Qwen" "qwen gen-phase-3" "gen-phase-3"
    test_command "Qwen" "qwen gen-file" "gen-file"

    echo ""
fi

# Test Gemini CLI commands
if $GEMINI_AVAILABLE; then
    echo -e "${BLUE}Testing Gemini CLI commands...${NC}"

    test_command "Gemini" "gemini create-prd" "create-prd"
    test_command "Gemini" "gemini auto-gen-prd" "auto-gen-prd"
    test_command "Gemini" "gemini prd-from-files" "prd-from-files"
    test_command "Gemini" "gemini analyze-prd" "analyze-prd"
    test_command "Gemini" "gemini gen-prprompts" "gen-prprompts"
    test_command "Gemini" "gemini gen-phase-1" "gen-phase-1"
    test_command "Gemini" "gemini gen-phase-2" "gen-phase-2"
    test_command "Gemini" "gemini gen-phase-3" "gen-phase-3"
    test_command "Gemini" "gemini gen-file" "gen-file"

    echo ""
fi

# Check config files
echo -e "${BLUE}Checking configuration files...${NC}"

check_config() {
    local ai_name=$1
    local config_path=$2

    if [ -f "$config_path" ]; then
        echo -e "${GREEN}✓${NC} $ai_name config: $config_path"
    else
        echo -e "${YELLOW}⚠${NC} $ai_name config not found: $config_path"
    fi
}

if $CLAUDE_AVAILABLE; then
    if [ -d "$HOME/.config/claude" ]; then
        check_config "Claude" "$HOME/.config/claude/config.yml"
    else
        echo -e "${YELLOW}⚠${NC} Claude config directory not found. Run: ./scripts/install-commands.sh --global"
    fi
fi

if $QWEN_AVAILABLE; then
    if [ -d "$HOME/.config/qwen" ]; then
        check_config "Qwen" "$HOME/.config/qwen/config.yml"
    else
        echo -e "${YELLOW}⚠${NC} Qwen config directory not found. Run: ./scripts/install-qwen-commands.sh --global"
    fi
fi

if $GEMINI_AVAILABLE; then
    if [ -d "$HOME/.config/gemini" ]; then
        check_config "Gemini" "$HOME/.config/gemini/config.yml"
    else
        echo -e "${YELLOW}⚠${NC} Gemini config directory not found. Run: ./scripts/install-gemini-commands.sh --global"
    fi
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ Command testing complete!${NC}"
echo "=================================================="
echo ""
echo "Next steps:"
echo "  1. If any commands failed, run the appropriate installer:"
echo "     - Claude: ./scripts/install-commands.sh --global"
echo "     - Qwen: ./scripts/install-qwen-commands.sh --global"
echo "     - Gemini: ./scripts/install-gemini-commands.sh --global"
echo ""
echo "  2. Create a test PRD:"
echo "     claude auto-gen-prd  # or qwen/gemini"
echo ""
echo "  3. Generate PRPROMPTS:"
echo "     claude gen-prprompts  # or qwen/gemini"
echo ""
echo "For detailed testing: See TESTING.md"
