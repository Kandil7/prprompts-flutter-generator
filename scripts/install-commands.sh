#!/bin/bash
# Install PRPROMPTS Claude Code Commands
# Version: 1.0.0

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 PRPROMPTS Claude Code Commands Installer${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# Determine install location
if [ "$1" == "--global" ]; then
    INSTALL_TYPE="global"
    CONFIG_DIR="$HOME/.config/claude"
    echo -e "${YELLOW}Installing globally to: $CONFIG_DIR${NC}"
elif [ "$1" == "--local" ]; then
    INSTALL_TYPE="local"
    CONFIG_DIR="$(pwd)/.claude"
    echo -e "${YELLOW}Installing locally to: $CONFIG_DIR${NC}"
else
    echo "Usage: $0 [--global|--local]"
    echo ""
    echo "  --global: Install commands globally (available in all projects)"
    echo "  --local:  Install commands in current project only"
    echo ""
    exit 1
fi

# Create directories
mkdir -p "$CONFIG_DIR/prompts"

# Copy prompt files
echo -e "${GREEN}📄 Copying prompt files...${NC}"
cp "$REPO_DIR/.claude/prompts/generate-prd.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.claude/prompts/auto-generate-prd.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.claude/prompts/generate-prd-from-files.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.claude/prompts/analyze-prd.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.claude/prompts/prprompts-generator.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.claude/prompts/phase-1-core.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.claude/prompts/phase-2-quality.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.claude/prompts/phase-3-demo.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.claude/prompts/single-file-generator.md" "$CONFIG_DIR/prompts/"

# Copy config file
echo -e "${GREEN}⚙️  Creating config.yml...${NC}"
cp "$REPO_DIR/.claude/config.yml" "$CONFIG_DIR/"

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${BLUE}Available commands:${NC}"
echo "  claude create-prd       - Interactive PRD wizard"
echo "  claude auto-gen-prd     - Auto-generate PRD from description"
echo "  claude analyze-prd      - Validate and analyze PRD"
echo "  claude gen-prprompts    - Generate all 32 PRPROMPTS files"
echo "  claude gen-phase-1      - Generate Phase 1 (10 files)"
echo "  claude gen-phase-2      - Generate Phase 2 (12 files)"
echo "  claude gen-phase-3      - Generate Phase 3 (10 files)"
echo "  claude gen-file         - Generate single file"
echo ""
echo -e "${BLUE}Quick test:${NC}"
echo "  claude create-prd --help"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  https://github.com/Kandil7/prprompts-flutter-generator"
echo ""
