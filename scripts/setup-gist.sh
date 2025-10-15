#!/bin/bash
# PRPROMPTS Quick Install Script
# Version: 1.0.0
# Usage: curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.sh | bash

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║   PRPROMPTS Flutter Generator Setup      ║"
echo "║   Quick Install - Claude Code Commands   ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
    CONFIG_DIR="$HOME/.config/claude"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    CONFIG_DIR="$HOME/.config/claude"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    OS="windows"
    CONFIG_DIR="$HOME/.config/claude"
else
    OS="unknown"
    CONFIG_DIR="$HOME/.config/claude"
fi

echo -e "${YELLOW}Detected OS: $OS${NC}"
echo ""

# Check for Claude Code
if ! command -v claude &> /dev/null; then
    echo -e "${YELLOW}⚠️  Claude Code not found. Installing...${NC}"
    if command -v npm &> /dev/null; then
        npm install -g @anthropic-ai/claude-code
    else
        echo -e "${RED}❌ npm not found. Please install Node.js first: https://nodejs.org${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Claude Code found${NC}"
echo ""

# Clone repository
TEMP_DIR="/tmp/prprompts-flutter-generator"
echo -e "${BLUE}📥 Downloading PRPROMPTS...${NC}"

if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

git clone --depth 1 https://github.com/Kandil7/prprompts-flutter-generator.git "$TEMP_DIR" 2>&1 | grep -v "Cloning into" || true

# Create config directory
mkdir -p "$CONFIG_DIR/prompts"

# Copy files
echo -e "${BLUE}📦 Installing commands...${NC}"
cp "$TEMP_DIR/.claude/prompts/"*.md "$CONFIG_DIR/prompts/"
cp "$TEMP_DIR/.claude/config.yml" "$CONFIG_DIR/"

# Make scripts executable
chmod +x "$TEMP_DIR/scripts/"*.sh 2>/dev/null || true

# Optional: Copy scripts to PATH
if [ -d "$HOME/.local/bin" ]; then
    cp "$TEMP_DIR/scripts/auto-gen-prd.sh" "$HOME/.local/bin/auto-prd" 2>/dev/null || true
    chmod +x "$HOME/.local/bin/auto-prd" 2>/dev/null || true
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Available Commands               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}claude create-prd${NC}       Interactive PRD wizard"
echo -e "  ${GREEN}claude auto-gen-prd${NC}     Auto-generate PRD"
echo -e "  ${GREEN}claude analyze-prd${NC}      Validate PRD"
echo -e "  ${GREEN}claude gen-prprompts${NC}    Generate all 32 files"
echo -e "  ${GREEN}claude gen-phase-1${NC}      Generate Phase 1"
echo -e "  ${GREEN}claude gen-phase-2${NC}      Generate Phase 2"
echo -e "  ${GREEN}claude gen-phase-3${NC}      Generate Phase 3"
echo -e "  ${GREEN}claude gen-file${NC}         Generate single file"
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Quick Start                      ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${YELLOW}1.${NC} cd your-flutter-project"
echo -e "  ${YELLOW}2.${NC} claude create-prd"
echo -e "  ${YELLOW}3.${NC} claude gen-prprompts"
echo -e "  ${YELLOW}4.${NC} Start coding!"
echo ""
echo -e "${GREEN}📖 Documentation:${NC}"
echo -e "  https://github.com/Kandil7/prprompts-flutter-generator"
echo ""
echo -e "${GREEN}💬 Support:${NC}"
echo -e "  https://github.com/Kandil7/prprompts-flutter-generator/issues"
echo ""
