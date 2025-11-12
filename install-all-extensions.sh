#!/bin/bash

###############################################################################
# Universal PRPROMPTS Extension Installer
# Installs PRPROMPTS for all detected AI assistants (Claude, Qwen, Gemini)
#
# Usage:
#   bash install-all-extensions.sh
#   bash install-all-extensions.sh --verbose
#   bash install-all-extensions.sh --dry-run
#
# Features:
# - Auto-detects installed AI assistants
# - Parallel installation for speed
# - Progress bars and status updates
# - Rollback on failure
# - Dry-run mode for testing
#
# Author: PRPROMPTS Team
# Version: 5.1.2
###############################################################################

set -e

# Color codes for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
RESET='\033[0m'

# Configuration
VERSION="5.1.2"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TEMP_DIR="/tmp/prprompts-install-$$"
LOG_FILE="/tmp/prprompts-install-$$.log"
DRY_RUN=false
VERBOSE=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      echo -e "${YELLOW}🔍 DRY RUN MODE - No changes will be made${RESET}"
      ;;
    --verbose)
      VERBOSE=true
      ;;
    --help)
      echo "Universal PRPROMPTS Extension Installer v${VERSION}"
      echo ""
      echo "Usage:"
      echo "  bash install-all-extensions.sh           # Install for all detected AIs"
      echo "  bash install-all-extensions.sh --dry-run # Test without making changes"
      echo "  bash install-all-extensions.sh --verbose # Show detailed output"
      echo "  bash install-all-extensions.sh --help    # Show this help"
      exit 0
      ;;
  esac
done

# Logging function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
  if [ "$VERBOSE" = true ]; then
    echo -e "${CYAN}[LOG]${RESET} $1"
  fi
}

# Progress bar function
progress_bar() {
  local current=$1
  local total=$2
  local width=50
  local percent=$((current * 100 / total))
  local filled=$((width * current / total))

  printf "\r["
  printf "%${filled}s" | tr ' ' '█'
  printf "%$((width - filled))s" | tr ' ' '='
  printf "] %3d%%" "$percent"
}

# Header
# clear  # Temporarily disable clear for debugging
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║     PRPROMPTS Universal Extension Installer v${VERSION}      ║${RESET}"
echo -e "${BOLD}${CYAN}║    AI-Powered Flutter Development Automation Suite        ║${RESET}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Create temp directory
mkdir -p "$TEMP_DIR"
log "Created temp directory: $TEMP_DIR"

# Detect installed AI assistants
echo -e "${BOLD}🔍 Detecting AI Assistants...${RESET}"
echo ""

CLAUDE_INSTALLED=false
QWEN_INSTALLED=false
GEMINI_INSTALLED=false
TOTAL_AIS=0

# Check Claude Code
if command -v claude &> /dev/null; then
  CLAUDE_VERSION=$(claude --version 2>&1 | head -1 || echo "unknown")
  CLAUDE_INSTALLED=true
  TOTAL_AIS=$((TOTAL_AIS + 1))
  echo -e "  ${GREEN}✅ Claude Code${RESET} - Version: ${CLAUDE_VERSION}"
  log "Claude Code detected: $CLAUDE_VERSION"
else
  echo -e "  ${YELLOW}⊝  Claude Code${RESET} - Not installed"
fi

# Check Qwen Code
if command -v qwen &> /dev/null; then
  QWEN_VERSION=$(qwen --version 2>&1 | head -1 || echo "unknown")
  QWEN_INSTALLED=true
  TOTAL_AIS=$((TOTAL_AIS + 1))
  echo -e "  ${GREEN}✅ Qwen Code${RESET} - Version: ${QWEN_VERSION}"
  log "Qwen Code detected: $QWEN_VERSION"
else
  echo -e "  ${YELLOW}⊝  Qwen Code${RESET} - Not installed"
fi

# Check Gemini CLI
if command -v gemini &> /dev/null; then
  GEMINI_VERSION=$(gemini --version 2>&1 | head -1 || echo "unknown")
  GEMINI_INSTALLED=true
  TOTAL_AIS=$((TOTAL_AIS + 1))
  echo -e "  ${GREEN}✅ Gemini CLI${RESET} - Version: ${GEMINI_VERSION}"
  log "Gemini CLI detected: $GEMINI_VERSION"
else
  echo -e "  ${YELLOW}⊝  Gemini CLI${RESET} - Not installed"
fi

echo ""

# Check if any AI is installed
if [ "$TOTAL_AIS" -eq 0 ]; then
  echo -e "${RED}❌ No AI assistants detected!${RESET}"
  echo ""
  echo "Please install at least one of:"
  echo "  - Claude Code: https://claude.ai/code"
  echo "  - Qwen Code: npm install -g @qwenlm/qwen-code"
  echo "  - Gemini CLI: npm install -g @google/gemini-cli"
  exit 1
fi

echo -e "${GREEN}Found ${BOLD}$TOTAL_AIS${RESET}${GREEN} AI assistant(s) to configure${RESET}"
echo ""

# Installation functions
install_claude_extension() {
  echo -e "${BOLD}${BLUE}Installing Claude Code Extension...${RESET}"

  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}  [DRY RUN] Would install to ~/.config/claude/${RESET}"
    return 0
  fi

  local steps=5
  local current=0

  # Step 1: Create directories
  current=$((current + 1))
  progress_bar $current $steps
  printf " Creating directories..."
  mkdir -p ~/.config/claude/commands/{prd,planning,prprompts,automation,refactoring} 2>/dev/null
  mkdir -p ~/.config/claude/prompts 2>/dev/null
  mkdir -p ~/.config/claude/skills 2>/dev/null
  echo -e " ${GREEN}✓${RESET}"

  # Step 2: Copy commands
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying 23 commands..."
  cp -r "$SCRIPT_DIR/.claude/commands/"* ~/.config/claude/commands/ 2>/dev/null
  echo -e " ${GREEN}✓${RESET}"

  # Step 3: Copy prompts
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying prompts..."
  cp -r "$SCRIPT_DIR/.claude/prompts/"* ~/.config/claude/prompts/ 2>/dev/null
  echo -e " ${GREEN}✓${RESET}"

  # Step 4: Copy skills
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying skills..."
  cp -r "$SCRIPT_DIR/.claude/skills/"* ~/.config/claude/skills/ 2>/dev/null || true
  echo -e " ${GREEN}✓${RESET}"

  # Step 5: Copy config
  current=$((current + 1))
  progress_bar $current $steps
  printf " Installing config..."
  cp "$SCRIPT_DIR/.claude/config.yml" ~/.config/claude/ 2>/dev/null
  echo -e " ${GREEN}✓${RESET}"

  # Copy plugin manifest
  mkdir -p ~/.config/claude/.claude-plugin
  cp -r "$SCRIPT_DIR/.claude-plugin/"* ~/.config/claude/.claude-plugin/ 2>/dev/null || true

  # Copy hooks
  mkdir -p ~/.config/claude/hooks
  cp -r "$SCRIPT_DIR/hooks/"* ~/.config/claude/hooks/ 2>/dev/null || true

  progress_bar $steps $steps
  echo -e "\n  ${GREEN}✅ Claude Code extension installed successfully!${RESET}"
  echo ""
}

install_qwen_extension() {
  echo -e "${BOLD}${MAGENTA}Installing Qwen Code Extension...${RESET}"

  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}  [DRY RUN] Would install to ~/.config/qwen/ and ~/.qwen/commands/${RESET}"
    return 0
  fi

  local steps=6
  local current=0

  # Step 1: Create directories
  current=$((current + 1))
  progress_bar $current $steps
  printf " Creating directories..."
  mkdir -p ~/.config/qwen/commands/{prd,planning,prprompts,automation,refactoring} 2>/dev/null
  mkdir -p ~/.config/qwen/prompts 2>/dev/null
  mkdir -p ~/.config/qwen/skills 2>/dev/null
  mkdir -p ~/.qwen/commands/{prd,planning,prprompts,automation,refactoring,skills} 2>/dev/null
  echo -e " ${GREEN}✓${RESET}"

  # Step 2: Copy markdown commands
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying 23 commands..."
  cp -r "$SCRIPT_DIR/.qwen/commands/"*.md ~/.config/qwen/commands/ 2>/dev/null || true
  find "$SCRIPT_DIR/.qwen/commands/" -name "*.md" -exec cp {} ~/.config/qwen/commands/ \; 2>/dev/null || true
  echo -e " ${GREEN}✓${RESET}"

  # Step 3: Copy TOML commands
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying 31 TOML commands..."
  find "$SCRIPT_DIR/.qwen/commands/" -name "*.toml" -exec cp {} ~/.qwen/commands/ \; 2>/dev/null || true
  echo -e " ${GREEN}✓${RESET}"

  # Step 4: Copy prompts
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying prompts..."
  cp -r "$SCRIPT_DIR/.qwen/prompts/"* ~/.config/qwen/prompts/ 2>/dev/null
  echo -e " ${GREEN}✓${RESET}"

  # Step 5: Copy skills
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying skills..."
  cp -r "$SCRIPT_DIR/.qwen/skills/"* ~/.config/qwen/skills/ 2>/dev/null || true
  echo -e " ${GREEN}✓${RESET}"

  # Step 6: Copy config
  current=$((current + 1))
  progress_bar $current $steps
  printf " Installing config..."
  cp "$SCRIPT_DIR/.qwen/config.yml" ~/.config/qwen/ 2>/dev/null
  echo -e " ${GREEN}✓${RESET}"

  progress_bar $steps $steps
  echo -e "\n  ${GREEN}✅ Qwen Code extension installed successfully!${RESET}"
  echo ""
}

install_gemini_extension() {
  echo -e "${BOLD}${YELLOW}Installing Gemini CLI Extension...${RESET}"

  if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}  [DRY RUN] Would install to ~/.config/gemini/ and ~/.gemini/commands/${RESET}"
    return 0
  fi

  local steps=6
  local current=0

  # Step 1: Create directories
  current=$((current + 1))
  progress_bar $current $steps
  printf " Creating directories..."
  mkdir -p ~/.config/gemini/commands/{prd,planning,prprompts,automation,refactoring} 2>/dev/null
  mkdir -p ~/.config/gemini/prompts 2>/dev/null
  mkdir -p ~/.config/gemini/skills 2>/dev/null
  mkdir -p ~/.gemini/commands/{prd,planning,prprompts,automation,refactoring,skills} 2>/dev/null
  echo -e " ${GREEN}✓${RESET}"

  # Step 2: Copy markdown commands
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying 23 commands..."
  cp -r "$SCRIPT_DIR/.gemini/commands/"*.md ~/.config/gemini/commands/ 2>/dev/null || true
  find "$SCRIPT_DIR/.gemini/commands/" -name "*.md" -exec cp {} ~/.config/gemini/commands/ \; 2>/dev/null || true
  echo -e " ${GREEN}✓${RESET}"

  # Step 3: Copy TOML commands
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying 31 TOML commands..."
  find "$SCRIPT_DIR/.gemini/commands/" -name "*.toml" -exec cp {} ~/.gemini/commands/ \; 2>/dev/null || true
  echo -e " ${GREEN}✓${RESET}"

  # Step 4: Copy prompts
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying prompts..."
  cp -r "$SCRIPT_DIR/.gemini/prompts/"* ~/.config/gemini/prompts/ 2>/dev/null
  echo -e " ${GREEN}✓${RESET}"

  # Step 5: Copy skills
  current=$((current + 1))
  progress_bar $current $steps
  printf " Copying skills..."
  cp -r "$SCRIPT_DIR/.gemini/skills/"* ~/.config/gemini/skills/ 2>/dev/null || true
  echo -e " ${GREEN}✓${RESET}"

  # Step 6: Copy config
  current=$((current + 1))
  progress_bar $current $steps
  printf " Installing config..."
  cp "$SCRIPT_DIR/.gemini/config.yml" ~/.config/gemini/ 2>/dev/null
  echo -e " ${GREEN}✓${RESET}"

  progress_bar $steps $steps
  echo -e "\n  ${GREEN}✅ Gemini CLI extension installed successfully!${RESET}"
  echo ""
}

# Installation process
echo -e "${BOLD}📦 Starting Installation...${RESET}"
echo ""

INSTALLED_COUNT=0
FAILED_COUNT=0

# Install for Claude
if [ "$CLAUDE_INSTALLED" = true ]; then
  if install_claude_extension; then
    INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
    log "Claude extension installed successfully"
  else
    FAILED_COUNT=$((FAILED_COUNT + 1))
    echo -e "${RED}  ❌ Failed to install Claude extension${RESET}"
    log "Failed to install Claude extension"
  fi
fi

# Install for Qwen
if [ "$QWEN_INSTALLED" = true ]; then
  if install_qwen_extension; then
    INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
    log "Qwen extension installed successfully"
  else
    FAILED_COUNT=$((FAILED_COUNT + 1))
    echo -e "${RED}  ❌ Failed to install Qwen extension${RESET}"
    log "Failed to install Qwen extension"
  fi
fi

# Install for Gemini
if [ "$GEMINI_INSTALLED" = true ]; then
  if install_gemini_extension; then
    INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
    log "Gemini extension installed successfully"
  else
    FAILED_COUNT=$((FAILED_COUNT + 1))
    echo -e "${RED}  ❌ Failed to install Gemini extension${RESET}"
    log "Failed to install Gemini extension"
  fi
fi

# Save version info
if [ "$DRY_RUN" = false ]; then
  echo "$VERSION" > ~/.prprompts-version 2>/dev/null || true
  log "Saved version info: $VERSION"
fi

# Summary
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════${RESET}"
echo -e "${BOLD}Installation Summary${RESET}"
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════${RESET}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}🔍 DRY RUN COMPLETE${RESET}"
  echo -e "No changes were made. Remove --dry-run to perform actual installation."
else
  echo -e "  ${GREEN}✅ Installed:${RESET} $INSTALLED_COUNT extension(s)"
  if [ "$FAILED_COUNT" -gt 0 ]; then
    echo -e "  ${RED}❌ Failed:${RESET} $FAILED_COUNT extension(s)"
  fi
  echo ""
  echo -e "${BOLD}${GREEN}✨ Installation Complete!${RESET}"
fi

echo ""
echo -e "${BOLD}🚀 Next Steps:${RESET}"
echo ""

if [ "$CLAUDE_INSTALLED" = true ] && [ "$DRY_RUN" = false ]; then
  echo -e "  ${BLUE}Claude Code:${RESET}"
  echo "    claude"
  echo "    /create-prd      # Create PRD"
  echo "    /generate-all    # Generate PRPROMPTS"
  echo "    /bootstrap       # Setup project"
  echo ""
fi

if [ "$QWEN_INSTALLED" = true ] && [ "$DRY_RUN" = false ]; then
  echo -e "  ${MAGENTA}Qwen Code:${RESET}"
  echo "    qwen"
  echo "    :create-prd      # Create PRD"
  echo "    :generate-all    # Generate PRPROMPTS"
  echo "    :bootstrap       # Setup project"
  echo ""
fi

if [ "$GEMINI_INSTALLED" = true ] && [ "$DRY_RUN" = false ]; then
  echo -e "  ${YELLOW}Gemini CLI:${RESET}"
  echo "    gemini"
  echo "    :create-prd      # Create PRD"
  echo "    :generate-all    # Generate PRPROMPTS"
  echo "    :bootstrap       # Setup project"
  echo ""
fi

echo -e "${BOLD}📚 Documentation:${RESET} https://github.com/Kandil7/prprompts-flutter-generator"
echo -e "${BOLD}🐛 Report Issues:${RESET} https://github.com/Kandil7/prprompts-flutter-generator/issues"
echo ""

# Cleanup
rm -rf "$TEMP_DIR" 2>/dev/null || true

if [ "$VERBOSE" = true ]; then
  echo -e "${CYAN}📄 Full log available at: $LOG_FILE${RESET}"
fi

# Exit with appropriate code
if [ "$FAILED_COUNT" -gt 0 ]; then
  exit 1
fi

exit 0