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
mkdir -p "$CLAUDE_CONFIG_DIR/commands/prd"
mkdir -p "$CLAUDE_CONFIG_DIR/commands/planning"
mkdir -p "$CLAUDE_CONFIG_DIR/commands/prprompts"
mkdir -p "$CLAUDE_CONFIG_DIR/commands/automation"
echo -e "${GREEN}✓ Created config directories${NC}"

# Copy prompts
echo -e "${YELLOW}📋 Installing prompts...${NC}"
cp -r "$SCRIPT_DIR/.claude/prompts/"* "$CLAUDE_CONFIG_DIR/prompts/" 2>/dev/null || true
PROMPT_COUNT=$(find "$CLAUDE_CONFIG_DIR/prompts/" -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓ Installed ${PROMPT_COUNT} prompt files${NC}"

# Copy all command categories (v4.4.3 - 21 commands total)
echo -e "${YELLOW}🤖 Installing all command categories...${NC}"

# PRD commands (6 commands)
cp -r "$SCRIPT_DIR/.claude/commands/prd/"* "$CLAUDE_CONFIG_DIR/commands/prd/" 2>/dev/null || true

# Planning commands (4 commands)
cp -r "$SCRIPT_DIR/.claude/commands/planning/"* "$CLAUDE_CONFIG_DIR/commands/planning/" 2>/dev/null || true

# PRPROMPTS commands (5 commands)
cp -r "$SCRIPT_DIR/.claude/commands/prprompts/"* "$CLAUDE_CONFIG_DIR/commands/prprompts/" 2>/dev/null || true

# Automation commands (6 commands)
cp -r "$SCRIPT_DIR/.claude/commands/automation/"* "$CLAUDE_CONFIG_DIR/commands/automation/" 2>/dev/null || true

CMD_COUNT=$(find "$CLAUDE_CONFIG_DIR/commands/" -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓ Installed ${CMD_COUNT} slash commands (21 total)${NC}"

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
echo -e "${BLUE}📚 All 21 Slash Commands Installed! (v4.4.3)${NC}"
echo ""
echo -e "${YELLOW}📝 PRD Commands (6):${NC}"
echo "  /prd:create              # Interactive PRD wizard"
echo "  /prd:auto-generate       # Auto-generate from description"
echo "  /prd:auto-from-project   # Auto-discover project files"
echo "  /prd:from-files          # Generate from existing docs"
echo "  /prd:analyze             # Validate PRD quality"
echo "  /prd:refine              # Interactive quality improvement"
echo ""
echo -e "${YELLOW}📊 Planning Commands (4):${NC}"
echo "  /planning:estimate-cost         # Cost breakdown analysis"
echo "  /planning:analyze-dependencies  # Feature dependency mapping"
echo "  /planning:stakeholder-review    # Review checklists"
echo "  /planning:implementation-plan   # Sprint-based planning"
echo ""
echo -e "${YELLOW}📚 PRPROMPTS Commands (5):${NC}"
echo "  /prprompts:generate-all  # Generate all 32 files"
echo "  /prprompts:phase-1       # Phase 1: Core Architecture"
echo "  /prprompts:phase-2       # Phase 2: Quality & Security"
echo "  /prprompts:phase-3       # Phase 3: Demo & Learning"
echo "  /prprompts:single-file   # Generate single file"
echo ""
echo -e "${YELLOW}🤖 Automation Commands (6):${NC}"
echo "  /automation:bootstrap      # Complete setup (2 min)"
echo "  /automation:implement-next # Auto-implement feature (10 min)"
echo "  /automation:full-cycle     # Implement 1-10 features (1-2 hours)"
echo "  /automation:update-plan    # Re-plan based on progress"
echo "  /automation:review-commit  # Validate & commit"
echo "  /automation:qa-check       # Compliance audit"
echo ""

echo -e "${BLUE}🚀 Quick Start (In Claude Code Chat):${NC}"
echo ""
echo "  # 1. Open Claude Code in your Flutter project"
echo "  cd your-flutter-project && claude"
echo ""
echo "  # 2. Use slash commands in chat:"
echo "  /prd:create"
echo "  /prprompts:generate-all"
echo "  /automation:bootstrap"
echo "  /automation:full-cycle"
echo ""

echo -e "${GREEN}✨ All 21 commands ready! Type${NC} ${YELLOW}/help${NC} ${GREEN}in Claude Code to see them.${NC}"
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
