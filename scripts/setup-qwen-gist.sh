#!/bin/bash
# One-line installer for PRPROMPTS Qwen Code Commands
# Usage: curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-qwen-gist.sh | bash

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE} PRPROMPTS Qwen Code Quick Install${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check if qwen is installed
if ! command -v qwen &> /dev/null; then
    echo -e "${YELLOW}Warning: Qwen Code CLI not found${NC}"
    echo -e "${YELLOW}Install it with: npm install -g @qwenlm/qwen-code${NC}"
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
chmod +x scripts/install-qwen-commands.sh
./scripts/install-qwen-commands.sh --global

# Cleanup
cd ~
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN} Installation complete!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${BLUE}Try it now:${NC}"
echo "  qwen create-prd"
echo ""
echo -e "${BLUE}Need help?${NC}"
echo "  https://github.com/Kandil7/prprompts-flutter-generator/blob/master/QWEN.md"
echo ""
