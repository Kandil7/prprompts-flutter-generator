#!/bin/bash
# PRPROMPTS Smart Installer
# Intelligent installation with auto-detection and powerful features
# Version: 3.0.0

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
VERSION="3.0.0"
REPO_URL="https://github.com/Kandil7/prprompts-flutter-generator.git"
CONFIG_BASE="$HOME/.prprompts"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# Banner
echo ""
echo -e "${MAGENTA}${BOLD}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}${BOLD}║                                                    ║${NC}"
echo -e "${MAGENTA}${BOLD}║     PRPROMPTS Smart Installer v${VERSION}           ║${NC}"
echo -e "${MAGENTA}${BOLD}║     Intelligent Multi-AI Setup System             ║${NC}"
echo -e "${MAGENTA}${BOLD}║                                                    ║${NC}"
echo -e "${MAGENTA}${BOLD}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Detect OS
detect_os() {
    case "$OSTYPE" in
        darwin*)  OS="macos" ;;
        linux*)   OS="linux" ;;
        msys*|win32|cygwin) OS="windows" ;;
        *)        OS="unknown" ;;
    esac
    echo -e "${CYAN}🖥️  Detected OS:${NC} $OS"
}

# Check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check Node.js and npm
check_nodejs() {
    echo ""
    echo -e "${BLUE}Checking prerequisites...${NC}"

    if ! command_exists node; then
        echo -e "${RED}✗ Node.js not found${NC}"
        echo -e "${YELLOW}  Install from: https://nodejs.org${NC}"
        return 1
    fi

    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js:${NC} $NODE_VERSION"

    if ! command_exists npm; then
        echo -e "${RED}✗ npm not found${NC}"
        return 1
    fi

    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm:${NC} $NPM_VERSION"

    return 0
}

# Check Git
check_git() {
    if ! command_exists git; then
        echo -e "${YELLOW}⚠ Git not found (optional for updates)${NC}"
        return 1
    fi

    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo -e "${GREEN}✓ Git:${NC} $GIT_VERSION"
    return 0
}

# Detect AI assistants
detect_ais() {
    echo ""
    echo -e "${BLUE}Detecting AI assistants...${NC}"

    CLAUDE_INSTALLED=false
    QWEN_INSTALLED=false
    GEMINI_INSTALLED=false

    if command_exists claude; then
        CLAUDE_INSTALLED=true
        CLAUDE_VERSION=$(claude --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✓ Claude Code:${NC} $CLAUDE_VERSION"
    else
        echo -e "${YELLOW}○ Claude Code:${NC} Not installed"
    fi

    if command_exists qwen; then
        QWEN_INSTALLED=true
        QWEN_VERSION=$(qwen --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✓ Qwen Code:${NC} $QWEN_VERSION"
    else
        echo -e "${YELLOW}○ Qwen Code:${NC} Not installed"
    fi

    if command_exists gemini; then
        GEMINI_INSTALLED=true
        GEMINI_VERSION=$(gemini --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✓ Gemini CLI:${NC} $GEMINI_VERSION"
    else
        echo -e "${YELLOW}○ Gemini CLI:${NC} Not installed"
    fi

    # Count installed AIs
    AI_COUNT=0
    [[ "$CLAUDE_INSTALLED" == true ]] && ((AI_COUNT++))
    [[ "$QWEN_INSTALLED" == true ]] && ((AI_COUNT++))
    [[ "$GEMINI_INSTALLED" == true ]] && ((AI_COUNT++))

    echo ""
    echo -e "${CYAN}Found ${AI_COUNT}/3 AI assistants installed${NC}"
}

# Offer to install missing AIs
offer_install_ais() {
    if [[ $AI_COUNT -eq 3 ]]; then
        echo -e "${GREEN}✅ All AI assistants already installed!${NC}"
        return
    fi

    echo ""
    echo -e "${YELLOW}Would you like to install missing AI assistants?${NC}"
    echo -e "${CYAN}Options:${NC}"
    echo "  1) Yes, install all missing AIs"
    echo "  2) Let me choose which ones"
    echo "  3) No, skip AI installation"
    echo ""
    read -p "Enter choice [1-3]: " choice

    case $choice in
        1)
            [[ "$CLAUDE_INSTALLED" == false ]] && install_claude
            [[ "$QWEN_INSTALLED" == false ]] && install_qwen
            [[ "$GEMINI_INSTALLED" == false ]] && install_gemini
            ;;
        2)
            [[ "$CLAUDE_INSTALLED" == false ]] && ask_install_claude
            [[ "$QWEN_INSTALLED" == false ]] && ask_install_qwen
            [[ "$GEMINI_INSTALLED" == false ]] && ask_install_gemini
            ;;
        3)
            echo -e "${CYAN}Skipping AI installation${NC}"
            ;;
        *)
            echo -e "${RED}Invalid choice, skipping${NC}"
            ;;
    esac
}

# Install Claude Code
install_claude() {
    echo ""
    echo -e "${BLUE}Installing Claude Code...${NC}"
    npm install -g @anthropic-ai/claude-code && \
        echo -e "${GREEN}✓ Claude Code installed${NC}" || \
        echo -e "${RED}✗ Failed to install Claude Code${NC}"
}

ask_install_claude() {
    read -p "Install Claude Code? (y/n): " answer
    [[ "$answer" =~ ^[Yy]$ ]] && install_claude
}

# Install Qwen Code
install_qwen() {
    echo ""
    echo -e "${BLUE}Installing Qwen Code...${NC}"
    echo -e "${YELLOW}Note: Qwen requires manual setup${NC}"
    echo -e "${CYAN}Visit: https://github.com/QwenLM/qwen-code${NC}"
}

ask_install_qwen() {
    read -p "Install Qwen Code? (y/n): " answer
    [[ "$answer" =~ ^[Yy]$ ]] && install_qwen
}

# Install Gemini CLI
install_gemini() {
    echo ""
    echo -e "${BLUE}Installing Gemini CLI...${NC}"
    npm install -g @google/gemini-cli && \
        echo -e "${GREEN}✓ Gemini CLI installed${NC}" || \
        echo -e "${RED}✗ Failed to install Gemini CLI${NC}"
}

ask_install_gemini() {
    read -p "Install Gemini CLI? (y/n): " answer
    [[ "$answer" =~ ^[Yy]$ ]] && install_gemini
}

# Install PRPROMPTS commands
install_commands() {
    echo ""
    echo -e "${BLUE}${BOLD}Installing PRPROMPTS commands...${NC}"
    echo ""

    INSTALLED_COUNT=0

    # Re-detect after potential installations
    detect_ais > /dev/null 2>&1

    if [[ "$CLAUDE_INSTALLED" == true ]]; then
        echo -e "${CYAN}→ Installing Claude Code commands...${NC}"
        bash "$SCRIPT_DIR/install-commands.sh" --global && \
            echo -e "${GREEN}✓ Claude commands installed${NC}" && \
            ((INSTALLED_COUNT++))
    fi

    if [[ "$QWEN_INSTALLED" == true ]]; then
        echo -e "${CYAN}→ Installing Qwen Code commands...${NC}"
        bash "$SCRIPT_DIR/install-qwen-commands.sh" --global && \
            echo -e "${GREEN}✓ Qwen commands installed${NC}" && \
            ((INSTALLED_COUNT++))
    fi

    if [[ "$GEMINI_INSTALLED" == true ]]; then
        echo -e "${CYAN}→ Installing Gemini CLI commands...${NC}"
        bash "$SCRIPT_DIR/install-gemini-commands.sh" --global && \
            echo -e "${GREEN}✓ Gemini commands installed${NC}" && \
            ((INSTALLED_COUNT++))
    fi

    echo ""
    echo -e "${GREEN}${BOLD}✅ Installed commands for ${INSTALLED_COUNT} AI assistant(s)${NC}"
}

# Create global config
create_global_config() {
    echo ""
    echo -e "${BLUE}Creating global configuration...${NC}"

    mkdir -p "$CONFIG_BASE"

    # Determine default AI
    DEFAULT_AI="none"
    [[ "$CLAUDE_INSTALLED" == true ]] && DEFAULT_AI="claude"
    [[ "$GEMINI_INSTALLED" == true ]] && DEFAULT_AI="gemini"
    [[ "$QWEN_INSTALLED" == true ]] && DEFAULT_AI="qwen"

    cat > "$CONFIG_BASE/config.json" <<EOF
{
  "version": "$VERSION",
  "installed_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "default_ai": "$DEFAULT_AI",
  "ais": {
    "claude": {
      "enabled": $CLAUDE_INSTALLED,
      "config_path": "$HOME/.config/claude"
    },
    "qwen": {
      "enabled": $QWEN_INSTALLED,
      "config_path": "$HOME/.config/qwen"
    },
    "gemini": {
      "enabled": $GEMINI_INSTALLED,
      "config_path": "$HOME/.config/gemini"
    }
  },
  "features": {
    "auto_update": true,
    "telemetry": false,
    "verbose": true
  },
  "repository": "$REPO_URL"
}
EOF

    echo -e "${GREEN}✓ Config created:${NC} $CONFIG_BASE/config.json"
    echo -e "${CYAN}  Default AI:${NC} $DEFAULT_AI"
}

# Install CLI wrapper
install_cli_wrapper() {
    echo ""
    echo -e "${BLUE}Installing 'prprompts' CLI wrapper...${NC}"

    # Create bin directory
    mkdir -p "$CONFIG_BASE/bin"

    # Copy CLI wrapper (will be created in next step)
    if [[ -f "$REPO_DIR/bin/prprompts" ]]; then
        cp "$REPO_DIR/bin/prprompts" "$CONFIG_BASE/bin/prprompts"
        chmod +x "$CONFIG_BASE/bin/prprompts"
        echo -e "${GREEN}✓ CLI wrapper installed${NC}"
    else
        echo -e "${YELLOW}⚠ CLI wrapper not found (will be available in next version)${NC}"
    fi

    # Add to PATH instructions
    if [[ ":$PATH:" != *":$CONFIG_BASE/bin:"* ]]; then
        echo ""
        echo -e "${YELLOW}To use 'prprompts' command globally, add to your PATH:${NC}"
        echo ""
        if [[ "$OS" == "macos" ]] || [[ "$OS" == "linux" ]]; then
            echo -e "  ${CYAN}echo 'export PATH=\"\$HOME/.prprompts/bin:\$PATH\"' >> ~/.bashrc${NC}"
            echo -e "  ${CYAN}source ~/.bashrc${NC}"
        else
            echo -e "  ${CYAN}Add %USERPROFILE%\\.prprompts\\bin to your PATH${NC}"
        fi
    fi
}

# Summary
show_summary() {
    echo ""
    echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║                                                    ║${NC}"
    echo -e "${GREEN}${BOLD}║           Installation Complete! 🎉                ║${NC}"
    echo -e "${GREEN}${BOLD}║                                                    ║${NC}"
    echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${CYAN}${BOLD}Installed Components:${NC}"
    [[ "$CLAUDE_INSTALLED" == true ]] && echo -e "  ${GREEN}✓${NC} Claude Code commands"
    [[ "$QWEN_INSTALLED" == true ]] && echo -e "  ${GREEN}✓${NC} Qwen Code commands"
    [[ "$GEMINI_INSTALLED" == true ]] && echo -e "  ${GREEN}✓${NC} Gemini CLI commands"
    echo -e "  ${GREEN}✓${NC} Global configuration"
    echo ""

    echo -e "${CYAN}${BOLD}Available Commands:${NC}"
    echo ""
    if [[ "$CLAUDE_INSTALLED" == true ]]; then
        echo -e "${BLUE}Claude Code:${NC}"
        echo "  claude create-prd       # Interactive PRD wizard"
        echo "  claude auto-gen-prd     # Auto-generate PRD"
        echo "  claude gen-prprompts    # Generate all 32 files"
        echo ""
    fi

    if [[ "$QWEN_INSTALLED" == true ]]; then
        echo -e "${BLUE}Qwen Code:${NC}"
        echo "  qwen create-prd         # Interactive PRD wizard"
        echo "  qwen gen-prprompts      # Generate all 32 files"
        echo ""
    fi

    if [[ "$GEMINI_INSTALLED" == true ]]; then
        echo -e "${BLUE}Gemini CLI:${NC}"
        echo "  gemini create-prd       # Interactive PRD wizard"
        echo "  gemini gen-prprompts    # Generate all 32 files"
        echo ""
    fi

    echo -e "${CYAN}${BOLD}Quick Start:${NC}"
    echo "  1. cd your-flutter-project"
    echo "  2. $DEFAULT_AI create-prd"
    echo "  3. $DEFAULT_AI gen-prprompts"
    echo "  4. Start coding!"
    echo ""

    echo -e "${CYAN}${BOLD}Configuration:${NC}"
    echo "  Config file: $CONFIG_BASE/config.json"
    echo "  Edit with:   vim $CONFIG_BASE/config.json"
    echo ""

    echo -e "${CYAN}${BOLD}Documentation:${NC}"
    echo "  https://github.com/Kandil7/prprompts-flutter-generator"
    echo ""

    echo -e "${CYAN}${BOLD}Support:${NC}"
    echo "  https://github.com/Kandil7/prprompts-flutter-generator/issues"
    echo ""

    echo -e "${GREEN}Happy coding! 🚀${NC}"
    echo ""
}

# Main installation flow
main() {
    detect_os

    if ! check_nodejs; then
        echo ""
        echo -e "${RED}Installation cannot continue without Node.js${NC}"
        exit 1
    fi

    check_git
    detect_ais

    # Only offer to install if some AIs are missing
    if [[ $AI_COUNT -lt 3 ]]; then
        offer_install_ais
    fi

    install_commands
    create_global_config
    install_cli_wrapper
    show_summary
}

# Run main installation
main
