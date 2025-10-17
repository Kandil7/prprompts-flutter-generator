#!/bin/bash
# PRPROMPTS Qwen Extension Installer v4.0
# Installs PRPROMPTS as a Qwen Code extension

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║     PRPROMPTS v4.0 - Qwen Extension Installer            ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Qwen Code is installed
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
if ! command -v qwen &> /dev/null; then
    echo -e "${RED}❌ Qwen Code not found!${NC}"
    echo ""
    echo "Please install Qwen Code first:"
    echo -e "${GREEN}npm install -g @qwenlm/qwen-code${NC}"
    echo ""
    exit 1
fi

QWEN_VERSION=$(qwen --version 2>&1 | grep -oP '\d+\.\d+\.\d+' | head -1 || echo "unknown")
echo -e "${GREEN}✓ Qwen Code ${QWEN_VERSION} installed${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo "Please install Node.js 14+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION} installed${NC}"

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
    QWEN_CONFIG_DIR="$HOME/.config/qwen"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    QWEN_CONFIG_DIR="$HOME/.config/qwen"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="Windows (Git Bash)"
    QWEN_CONFIG_DIR="$HOME/.config/qwen"
else
    OS="Unknown"
    QWEN_CONFIG_DIR="$HOME/.config/qwen"
fi

echo -e "${GREEN}✓ Operating System: ${OS}${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create Qwen config directory if it doesn't exist
echo -e "${YELLOW}📁 Setting up Qwen configuration...${NC}"
mkdir -p "$QWEN_CONFIG_DIR/prompts"
mkdir -p "$QWEN_CONFIG_DIR/commands/automation"
echo -e "${GREEN}✓ Created config directories${NC}"

# Copy prompts
echo -e "${YELLOW}📋 Installing prompts...${NC}"
cp -r "$SCRIPT_DIR/.qwen/prompts/"* "$QWEN_CONFIG_DIR/prompts/" 2>/dev/null || true
PROMPT_COUNT=$(find "$QWEN_CONFIG_DIR/prompts/" -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓ Installed ${PROMPT_COUNT} prompt files${NC}"

# Copy automation commands
echo -e "${YELLOW}🤖 Installing v4.0 automation commands...${NC}"
cp -r "$SCRIPT_DIR/.qwen/commands/automation/"* "$QWEN_CONFIG_DIR/commands/automation/" 2>/dev/null || true
AUTO_COUNT=$(find "$QWEN_CONFIG_DIR/commands/automation/" -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓ Installed ${AUTO_COUNT} automation commands${NC}"

# Copy config.yml
echo -e "${YELLOW}⚙️  Installing Qwen config...${NC}"
cp "$SCRIPT_DIR/.qwen/config.yml" "$QWEN_CONFIG_DIR/config.yml"
echo -e "${GREEN}✓ Config file installed${NC}"

# Copy extension manifest
echo -e "${YELLOW}📦 Installing extension manifest...${NC}"
cp "$SCRIPT_DIR/qwen-extension.json" "$QWEN_CONFIG_DIR/extension.json"
echo -e "${GREEN}✓ Extension manifest installed${NC}"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║     ✨ Installation Complete!                             ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show installed commands
echo -e "${BLUE}📚 Available Commands:${NC}"
echo ""
echo -e "${YELLOW}PRD Generation:${NC}"
echo "  qwen create-prd          # Interactive PRD wizard"
echo "  qwen auto-gen-prd        # Auto-generate from description"
echo "  qwen prd-from-files      # Generate from existing docs"
echo "  qwen analyze-prd         # Validate PRD"
echo ""
echo -e "${YELLOW}PRPROMPTS Generation:${NC}"
echo "  qwen gen-prprompts       # Generate all 32 files"
echo "  qwen gen-phase-1         # Phase 1: Core Architecture"
echo "  qwen gen-phase-2         # Phase 2: Quality & Security"
echo "  qwen gen-phase-3         # Phase 3: Demo & Learning"
echo "  qwen gen-file <name>     # Single file"
echo ""
echo -e "${YELLOW}🆕 v4.0 Automation (40-60x faster!):${NC}"
echo "  qwen bootstrap-from-prprompts  # Complete setup (2 min)"
echo "  qwen implement-next            # Auto-implement feature (10 min)"
echo "  qwen full-cycle                # Implement 1-10 features (1-2 hours)"
echo "  qwen review-and-commit         # Validate & commit"
echo "  qwen qa-check                  # Compliance audit"
echo ""

echo -e "${BLUE}🚀 Quick Start:${NC}"
echo ""
echo "  # 1. Navigate to your Flutter project"
echo "  cd your-flutter-project"
echo ""
echo "  # 2. Generate PRPROMPTS"
echo "  qwen create-prd"
echo "  qwen gen-prprompts"
echo ""
echo "  # 3. Auto-build your app (v4.0!)"
echo "  qwen bootstrap-from-prprompts"
echo "  qwen full-cycle"
echo "  qwen qa-check"
echo ""

echo -e "${GREEN}✨ You're ready to go! Start with:${NC} ${YELLOW}qwen create-prd${NC}"
echo ""
echo -e "${BLUE}📖 Documentation:${NC} https://github.com/Kandil7/prprompts-flutter-generator/blob/master/QWEN.md"
echo -e "${BLUE}💬 Support:${NC} https://github.com/Kandil7/prprompts-flutter-generator/issues"
echo ""

# Show Qwen-specific advantages
echo -e "${BLUE}🚀 Why Qwen Code?${NC}"
echo "  • 256K-1M token context (4x-16x longer than Claude)"
echo "  • Deep codebase analysis - entire monorepos at once"
echo "  • State-of-the-art agentic coding (comparable to Claude Sonnet 4)"
echo "  • Cost-effective - free tier + lower API costs"
echo "  • Open source & self-hosting options"
echo ""
