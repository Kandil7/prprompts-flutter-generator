#!/bin/bash
# Install PRPROMPTS Gemini Code Commands
# Usage: ./install-gemini-commands.sh [--global|--local]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine install mode (default to --global if no argument)
MODE="${1:---global}"

if [ "$MODE" != "--global" ] && [ "$MODE" != "--local" ]; then
    echo -e "${RED}Error: Invalid argument. Use --global or --local${NC}"
    echo -e "${RED}Usage: $0 [--global|--local]${NC}"
    echo ""
    echo "  --global: Install commands globally (available in all projects) [default]"
    echo "  --local:  Install commands in current project only"
    echo ""
    exit 1
fi

echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE} PRPROMPTS Gemini Code Commands Installer${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Determine install location
if [ "$MODE" == "--global" ]; then
    CONFIG_DIR="$HOME/.config/gemini"
    echo -e "${YELLOW}Installing globally to: $CONFIG_DIR${NC}"
else
    CONFIG_DIR="$PWD/.gemini"
    echo -e "${YELLOW}Installing locally to: $CONFIG_DIR${NC}"
fi

# Create directories
mkdir -p "$CONFIG_DIR/prompts"

# Copy prompt files
echo -e "${GREEN}"
echo "Copying prompt files..."
echo -e "${NC}"
cp "$REPO_DIR/.gemini/prompts/generate-prd.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.gemini/prompts/auto-generate-prd.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.gemini/prompts/generate-prd-from-files.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.gemini/prompts/analyze-prd.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.gemini/prompts/prprompts-generator.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.gemini/prompts/phase-1-core.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.gemini/prompts/phase-2-quality.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.gemini/prompts/phase-3-demo.md" "$CONFIG_DIR/prompts/"
cp "$REPO_DIR/.gemini/prompts/single-file-generator.md" "$CONFIG_DIR/prompts/"

# Copy config file
echo -e "${GREEN}Creating config.yml...${NC}"
cp "$REPO_DIR/.gemini/config.yml" "$CONFIG_DIR/"

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN} Installation complete!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${BLUE}Available commands:${NC}"
echo "  gemini create-prd       - Interactive PRD wizard"
echo "  gemini auto-gen-prd     - Auto-generate PRD from description"
echo "  gemini prd-from-files   - Generate PRD from existing files"
echo "  gemini analyze-prd      - Validate and analyze PRD"
echo "  gemini gen-prprompts    - Generate all 32 PRPROMPTS files"
echo "  gemini gen-phase-1      - Generate Phase 1 (10 files)"
echo "  gemini gen-phase-2      - Generate Phase 2 (12 files)"
echo "  gemini gen-phase-3      - Generate Phase 3 (10 files)"
echo "  gemini gen-file         - Generate single file"
echo ""
echo -e "${BLUE}Quick test:${NC}"
echo "  gemini create-prd --help"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  https://github.com/Kandil7/prprompts-flutter-generator"
echo ""
echo -e "${YELLOW}Note: Requires Gemini CLI installed${NC}"
echo -e "${YELLOW}Install: npm install -g @google/gemini-cli${NC}"
echo ""
echo -e "${BLUE}Free Tier Benefits:${NC}"
echo "  • 1 million token context window"
echo "  • 60 requests per minute"
echo "  • 1,000 requests per day"
echo "  • No credit card required"
echo ""
