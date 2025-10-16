#!/bin/bash
# One-line installer for PRPROMPTS Gemini Code Commands
# Usage: curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gemini-gist.sh | bash

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE} PRPROMPTS Gemini Code Quick Install${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check if gemini is installed
if ! command -v gemini &> /dev/null; then
    echo -e "${YELLOW}Warning: Gemini CLI not found${NC}"
    echo -e "${YELLOW}Install it with: npm install -g @google/gemini-cli${NC}"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create temp directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo -e "${GREEN}Cloning repository...${NC}"
git clone --depth 1 https://github.com/Kandil7/prprompts-flutter-generator.git

echo -e "${GREEN}Installing commands globally...${NC}"
cd prprompts-flutter-generator
chmod +x scripts/install-gemini-commands.sh
./scripts/install-gemini-commands.sh --global

# Cleanup
cd ~
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN} Installation complete!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${BLUE}Try it now:${NC}"
echo "  gemini create-prd"
echo ""
echo -e "${BLUE}Free tier benefits:${NC}"
echo "  • 1M token context"
echo "  • 60 requests/minute"
echo "  • 1,000 requests/day"
echo ""
echo -e "${BLUE}Need help?${NC}"
echo "  https://github.com/Kandil7/prprompts-flutter-generator/blob/master/GEMINI.md"
echo ""
