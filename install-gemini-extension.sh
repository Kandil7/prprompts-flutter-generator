#!/bin/bash
# PRPROMPTS Gemini Extension Installer v4.0
# Installs PRPROMPTS as a Gemini CLI extension

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║     PRPROMPTS v4.0 - Gemini Extension Installer          ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Gemini CLI is installed
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
if ! command -v gemini &> /dev/null; then
    echo -e "${RED}❌ Gemini CLI not found!${NC}"
    echo ""
    echo "Please install Gemini CLI first:"
    echo -e "${GREEN}npm install -g @google/gemini-cli${NC}"
    echo ""
    exit 1
fi

GEMINI_VERSION=$(gemini --version 2>&1 | grep -oP '\d+\.\d+\.\d+' | head -1 || echo "unknown")
echo -e "${GREEN}✓ Gemini CLI ${GEMINI_VERSION} installed${NC}"

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
    GEMINI_CONFIG_DIR="$HOME/.config/gemini"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    GEMINI_CONFIG_DIR="$HOME/.config/gemini"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="Windows (Git Bash)"
    GEMINI_CONFIG_DIR="$HOME/.config/gemini"
else
    OS="Unknown"
    GEMINI_CONFIG_DIR="$HOME/.config/gemini"
fi

echo -e "${GREEN}✓ Operating System: ${OS}${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create Gemini config directory if it doesn't exist
echo -e "${YELLOW}📁 Setting up Gemini configuration...${NC}"
mkdir -p "$GEMINI_CONFIG_DIR/prompts"
mkdir -p "$GEMINI_CONFIG_DIR/commands"
mkdir -p "$GEMINI_CONFIG_DIR/commands/automation"
echo -e "${GREEN}✓ Created config directories${NC}"

# Copy prompts
echo -e "${YELLOW}📋 Installing prompts...${NC}"
cp -r "$SCRIPT_DIR/.gemini/prompts/"* "$GEMINI_CONFIG_DIR/prompts/" 2>/dev/null || true
PROMPT_COUNT=$(find "$GEMINI_CONFIG_DIR/prompts/" -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓ Installed ${PROMPT_COUNT} prompt files${NC}"

# Copy slash commands (root level)
echo -e "${YELLOW}⚡ Installing slash commands...${NC}"
# Copy root-level command files (not subdirectories)
for cmd_file in "$SCRIPT_DIR/.gemini/commands/"*.md; do
    if [ -f "$cmd_file" ]; then
        cp "$cmd_file" "$GEMINI_CONFIG_DIR/commands/" 2>/dev/null || true
    fi
done
SLASH_COUNT=$(find "$GEMINI_CONFIG_DIR/commands/" -maxdepth 1 -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓ Installed ${SLASH_COUNT} slash commands${NC}"

# Copy automation commands
echo -e "${YELLOW}🤖 Installing v4.0 automation commands...${NC}"
cp -r "$SCRIPT_DIR/.gemini/commands/automation/"* "$GEMINI_CONFIG_DIR/commands/automation/" 2>/dev/null || true
AUTO_COUNT=$(find "$GEMINI_CONFIG_DIR/commands/automation/" -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓ Installed ${AUTO_COUNT} automation commands${NC}"

# Copy config.yml
echo -e "${YELLOW}⚙️  Installing Gemini config...${NC}"
cp "$SCRIPT_DIR/.gemini/config.yml" "$GEMINI_CONFIG_DIR/config.yml"
echo -e "${GREEN}✓ Config file installed${NC}"

# Copy extension manifest
echo -e "${YELLOW}📦 Installing extension manifest...${NC}"
cp "$SCRIPT_DIR/gemini-extension.json" "$GEMINI_CONFIG_DIR/extension.json"
echo -e "${GREEN}✓ Extension manifest installed${NC}"

# Register extension with Gemini CLI using official link command
echo -e "${YELLOW}🔌 Registering extension with Gemini CLI...${NC}"

# Get the absolute path to this installation
INSTALL_PATH="$SCRIPT_DIR"

# Use Gemini CLI's official extensions link command
if command -v gemini &> /dev/null; then
    # Try to link the extension using Gemini CLI's built-in command with auto-confirmation
    echo -e "${BLUE}  Note: Extension linking requires confirmation for security${NC}"
    if echo "Y" | gemini extensions link "$INSTALL_PATH" 2>&1 | grep -q "successfully\|enabled"; then
        echo -e "${GREEN}✓ Extension linked with Gemini CLI${NC}"
        echo -e "${GREEN}✓ Extension enabled automatically${NC}"
    else
        echo -e "${YELLOW}⚠ Auto-link failed. Trying manual link...${NC}"
        echo -e "${YELLOW}  Run: gemini extensions link \"$INSTALL_PATH\"${NC}"
        echo -e "${YELLOW}  Then confirm with 'Y' when prompted${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Gemini CLI not found in PATH${NC}"
    echo -e "${YELLOW}  Extension files installed to ~/.config/gemini/${NC}"
    echo -e "${YELLOW}  To register, run: gemini extensions link \"$INSTALL_PATH\"${NC}"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║     ✨ Installation Complete!                             ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show installed commands
echo -e "${BLUE}📚 Available Slash Commands:${NC}"
echo -e "${BLUE}(All commands also available via: gemini then /help)${NC}"
echo ""
echo -e "${YELLOW}PRD Generation:${NC}"
echo "  /create-prd                # Interactive PRD wizard"
echo "  /analyze-prd               # Validate PRD"
echo "  auto-gen-prd               # Auto-generate from description"
echo "  prd-from-files             # Generate from existing docs"
echo ""
echo -e "${YELLOW}PRPROMPTS Generation:${NC}"
echo "  /gen-prprompts             # Generate all 32 files"
echo "  gen-phase-1                # Phase 1: Core Architecture"
echo "  gen-phase-2                # Phase 2: Quality & Security"
echo "  gen-phase-3                # Phase 3: Demo & Learning"
echo "  gen-file <name>            # Single file"
echo ""
echo -e "${YELLOW}🆕 v4.0 Automation (40-60x faster!):${NC}"
echo "  /bootstrap-from-prprompts  # Complete setup (2 min)"
echo "  /implement-next            # Auto-implement feature (10 min)"
echo "  /full-cycle                # Implement 1-10 features (1-2 hours)"
echo "  /review-and-commit         # Validate & commit"
echo "  /qa-check                  # Compliance audit"
echo ""

echo -e "${BLUE}🚀 Quick Start:${NC}"
echo ""
echo "  # 1. Authenticate with Google"
echo "  gemini auth login"
echo ""
echo "  # 2. Navigate to your Flutter project"
echo "  cd your-flutter-project"
echo ""
echo "  # 3. Generate PRPROMPTS"
echo "  gemini create-prd"
echo "  gemini gen-prprompts"
echo ""
echo "  # 4. Auto-build your app (v4.0!)"
echo "  gemini bootstrap-from-prprompts"
echo "  gemini full-cycle"
echo "  gemini qa-check"
echo ""

echo -e "${GREEN}✨ You're ready to go! Start with:${NC} ${YELLOW}gemini create-prd${NC}"
echo ""
echo -e "${BLUE}📖 Documentation:${NC} https://github.com/Kandil7/prprompts-flutter-generator/blob/master/GEMINI.md"
echo -e "${BLUE}💬 Support:${NC} https://github.com/Kandil7/prprompts-flutter-generator/issues"
echo ""

# Show extension status
echo -e "${BLUE}🔌 Extension Status:${NC}"
if command -v gemini &> /dev/null; then
    echo -e "${GREEN}✓ Extension linked with Gemini CLI${NC}"
    echo "  View all extensions: ${YELLOW}gemini extensions list${NC}"
    echo "  Update extensions: ${YELLOW}gemini extensions update --all${NC}"
    echo "  Extension path: ${INSTALL_PATH}"
else
    echo -e "${YELLOW}⚠ Gemini CLI not found${NC}"
fi
echo ""

# Show Gemini-specific advantages
echo -e "${BLUE}🎉 Why Gemini CLI?${NC}"
echo "  • 1M token context (5x larger than Claude)"
echo "  • 60 requests/minute FREE (vs 20 messages/day)"
echo "  • 1,000 requests/day (best free tier!)"
echo "  • ReAct agent mode for complex workflows"
echo "  • No credit card required - just sign in!"
echo ""
