#!/bin/bash
# PRPROMPTS Claude Extension Installer v4.0
# Installs PRPROMPTS as a Claude Code extension

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}║     PRPROMPTS v4.0 - Claude Extension Installer          ║${NC}"
echo -e "${BLUE}║                                                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Claude Code is installed
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
if ! command -v claude &> /dev/null; then
    echo -e "${RED}❌ Claude Code not found!${NC}"
    echo ""
    echo "Please install Claude Code first:"
    echo -e "${GREEN}npm install -g @anthropic-ai/claude-code${NC}"
    echo ""
    echo "Or visit: https://claude.ai/code"
    echo ""
    exit 1
fi

CLAUDE_VERSION=$(claude --version 2>&1 | grep -oP '\d+\.\d+\.\d+' | head -1 || echo "unknown")
echo -e "${GREEN}✓ Claude Code ${CLAUDE_VERSION} installed${NC}"

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
    CLAUDE_CONFIG_DIR="$HOME/.config/claude"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
    CLAUDE_CONFIG_DIR="$HOME/.config/claude"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="Windows (Git Bash)"
    CLAUDE_CONFIG_DIR="$HOME/.config/claude"
else
    OS="Unknown"
    CLAUDE_CONFIG_DIR="$HOME/.config/claude"
fi

echo -e "${GREEN}✓ Operating System: ${OS}${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create Claude config directory if it doesn't exist
echo -e "${YELLOW}📁 Setting up Claude configuration...${NC}"
mkdir -p "$CLAUDE_CONFIG_DIR/prompts"
mkdir -p "$CLAUDE_CONFIG_DIR/commands/automation"
echo -e "${GREEN}✓ Created config directories${NC}"

# Copy prompts
echo -e "${YELLOW}📋 Installing prompts...${NC}"
cp -r "$SCRIPT_DIR/.claude/prompts/"* "$CLAUDE_CONFIG_DIR/prompts/" 2>/dev/null || true
PROMPT_COUNT=$(find "$CLAUDE_CONFIG_DIR/prompts/" -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓ Installed ${PROMPT_COUNT} prompt files${NC}"

# Copy automation commands
echo -e "${YELLOW}🤖 Installing v4.0 automation commands...${NC}"
cp -r "$SCRIPT_DIR/.claude/commands/automation/"* "$CLAUDE_CONFIG_DIR/commands/automation/" 2>/dev/null || true
AUTO_COUNT=$(find "$CLAUDE_CONFIG_DIR/commands/automation/" -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓ Installed ${AUTO_COUNT} automation commands${NC}"

# Copy config.yml
echo -e "${YELLOW}⚙️  Installing Claude config...${NC}"
cp "$SCRIPT_DIR/.claude/config.yml" "$CLAUDE_CONFIG_DIR/config.yml"
echo -e "${GREEN}✓ Config file installed${NC}"

# Copy extension manifest
echo -e "${YELLOW}📦 Installing extension manifest...${NC}"
cp "$SCRIPT_DIR/claude-extension.json" "$CLAUDE_CONFIG_DIR/extension.json"
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
echo "  claude create-prd          # Interactive PRD wizard"
echo "  claude auto-gen-prd        # Auto-generate from description"
echo "  claude prd-from-files      # Generate from existing docs"
echo "  claude analyze-prd         # Validate PRD"
echo ""
echo -e "${YELLOW}PRPROMPTS Generation:${NC}"
echo "  claude gen-prprompts       # Generate all 32 files"
echo "  claude gen-phase-1         # Phase 1: Core Architecture"
echo "  claude gen-phase-2         # Phase 2: Quality & Security"
echo "  claude gen-phase-3         # Phase 3: Demo & Learning"
echo "  claude gen-file <name>     # Single file"
echo ""
echo -e "${YELLOW}🆕 v4.0 Automation (40-60x faster!):${NC}"
echo "  claude bootstrap-from-prprompts  # Complete setup (2 min)"
echo "  claude implement-next            # Auto-implement feature (10 min)"
echo "  claude full-cycle                # Implement 1-10 features (1-2 hours)"
echo "  claude review-and-commit         # Validate & commit"
echo "  claude qa-check                  # Compliance audit"
echo ""

echo -e "${BLUE}🚀 Quick Start:${NC}"
echo ""
echo "  # 1. Navigate to your Flutter project"
echo "  cd your-flutter-project"
echo ""
echo "  # 2. Generate PRPROMPTS"
echo "  claude create-prd"
echo "  claude gen-prprompts"
echo ""
echo "  # 3. Auto-build your app (v4.0!)"
echo "  claude bootstrap-from-prprompts"
echo "  claude full-cycle"
echo "  claude qa-check"
echo ""

echo -e "${GREEN}✨ You're ready to go! Start with:${NC} ${YELLOW}claude create-prd${NC}"
echo ""
echo -e "${BLUE}📖 Documentation:${NC} https://github.com/Kandil7/prprompts-flutter-generator/blob/master/CLAUDE.md"
echo -e "${BLUE}💬 Support:${NC} https://github.com/Kandil7/prprompts-flutter-generator/issues"
echo -e "${BLUE}🔗 Claude Code:${NC} https://claude.ai/code"
echo ""

# Show Claude-specific advantages
echo -e "${BLUE}🏆 Why Claude Code?${NC}"
echo "  • Best accuracy (9.5/10) - industry-leading code quality"
echo "  • Production-ready reliability"
echo "  • Official Anthropic support & updates"
echo "  • Best for high-stakes & mission-critical apps"
echo "  • Strong security & safety focus"
echo "  • Excellent reasoning capabilities"
echo ""

echo -e "${YELLOW}💡 Pro Tip:${NC} Upgrade to Claude Pro (\$20/month) for unlimited messages!"
echo ""
