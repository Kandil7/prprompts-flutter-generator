#!/bin/bash
# Install PRPROMPTS Commands for BOTH Claude Code and Qwen Code
# Usage: ./install-both.sh [--global|--local]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check arguments
if [ "$#" -ne 1 ]; then
    echo -e "${RED}Usage: $0 [--global|--local]${NC}"
    echo ""
    echo "  --global: Install commands globally (available in all projects)"
    echo "  --local:  Install commands in current project only"
    echo ""
    exit 1
fi

if [ "$1" != "--global" ] && [ "$1" != "--local" ]; then
    echo -e "${RED}Error: Invalid argument. Use --global or --local${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}==================================================${NC}"
echo -e "${CYAN} PRPROMPTS Dual Installation${NC}"
echo -e "${CYAN} Installing for Claude Code + Qwen Code${NC}"
echo -e "${CYAN}==================================================${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check which CLIs are installed
CLAUDE_INSTALLED=false
QWEN_INSTALLED=false

if command -v claude &> /dev/null; then
    CLAUDE_INSTALLED=true
    echo -e "${GREEN}✓ Claude Code CLI detected${NC}"
else
    echo -e "${YELLOW}⚠ Claude Code CLI not found${NC}"
    echo -e "${YELLOW}  Install: npm install -g @anthropic-ai/claude-code${NC}"
fi

if command -v qwen &> /dev/null; then
    QWEN_INSTALLED=true
    echo -e "${GREEN}✓ Qwen Code CLI detected${NC}"
else
    echo -e "${YELLOW}⚠ Qwen Code CLI not found${NC}"
    echo -e "${YELLOW}  Install: npm install -g @qwenlm/qwen-code${NC}"
fi

echo ""

# Install Claude Code commands
if [ "$CLAUDE_INSTALLED" = true ] || [ "$1" == "--global" ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Installing Claude Code commands...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    "$SCRIPT_DIR/install-commands.sh" "$1"
    echo ""
fi

# Install Qwen Code commands
if [ "$QWEN_INSTALLED" = true ] || [ "$1" == "--global" ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Installing Qwen Code commands...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    "$SCRIPT_DIR/install-qwen-commands.sh" "$1"
    echo ""
fi

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN} Dual installation complete!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${CYAN}Available commands:${NC}"
echo ""
echo -e "${BLUE}Claude Code:${NC}"
echo "  claude create-prd       - Interactive PRD wizard"
echo "  claude gen-prprompts    - Generate all 32 PRPROMPTS files"
echo ""
echo -e "${BLUE}Qwen Code:${NC}"
echo "  qwen create-prd         - Interactive PRD wizard"
echo "  qwen gen-prprompts      - Generate all 32 PRPROMPTS files"
echo ""
echo -e "${CYAN}Quick test:${NC}"
echo "  claude create-prd --help"
echo "  qwen create-prd --help"
echo ""
echo -e "${CYAN}Documentation:${NC}"
echo "  Claude: https://github.com/Kandil7/prprompts-flutter-generator"
echo "  Qwen:   https://github.com/Kandil7/prprompts-flutter-generator/blob/master/QWEN.md"
echo ""
