#!/bin/bash

##
# PRPROMPTS Gemini CLI Skills Installer
# Installs all PRPROMPTS skills as global Gemini CLI TOML slash commands
##

set -e

echo "🚀 Installing PRPROMPTS Skills for Gemini CLI..."
echo ""

# Detect OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  GEMINI_DIR="$USERPROFILE/.gemini"
else
  GEMINI_DIR="$HOME/.gemini"
fi

# Create skills directory structure
echo "📁 Creating skills directory structure..."
mkdir -p "$GEMINI_DIR/commands/skills/automation"
mkdir -p "$GEMINI_DIR/commands/skills/prprompts-core"
mkdir -p "$GEMINI_DIR/commands/skills/development-workflow"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Copy all TOML skill files
echo "📦 Installing skill files..."

# Automation skills (5)
if [ -d "$REPO_DIR/.gemini/commands/skills/automation" ]; then
  cp -r "$REPO_DIR/.gemini/commands/skills/automation/"*.toml "$GEMINI_DIR/commands/skills/automation/" 2>/dev/null || true
  AUTOMATION_COUNT=$(ls -1 "$GEMINI_DIR/commands/skills/automation/"*.toml 2>/dev/null | wc -l)
  echo "  ✅ Automation skills: $AUTOMATION_COUNT files"
fi

# PRPROMPTS Core skills (2)
if [ -d "$REPO_DIR/.gemini/commands/skills/prprompts-core" ]; then
  cp -r "$REPO_DIR/.gemini/commands/skills/prprompts-core/"*.toml "$GEMINI_DIR/commands/skills/prprompts-core/" 2>/dev/null || true
  CORE_COUNT=$(ls -1 "$GEMINI_DIR/commands/skills/prprompts-core/"*.toml 2>/dev/null | wc -l)
  echo "  ✅ PRPROMPTS Core skills: $CORE_COUNT files"
fi

# Development Workflow skills (1)
if [ -d "$REPO_DIR/.gemini/commands/skills/development-workflow" ]; then
  cp -r "$REPO_DIR/.gemini/commands/skills/development-workflow/"*.toml "$GEMINI_DIR/commands/skills/development-workflow/" 2>/dev/null || true
  WORKFLOW_COUNT=$(ls -1 "$GEMINI_DIR/commands/skills/development-workflow/"*.toml 2>/dev/null | wc -l)
  echo "  ✅ Workflow skills: $WORKFLOW_COUNT files"
fi

# Count total skills installed
TOTAL_SKILLS=$(find "$GEMINI_DIR/commands/skills" -name "*.toml" 2>/dev/null | wc -l)

echo ""
echo "✨ Installation complete!"
echo ""
echo "📊 Summary:"
echo "  Total skills installed: $TOTAL_SKILLS"
echo "  Installation path: $GEMINI_DIR/commands/skills/"
echo ""
echo "🎯 Usage Examples:"
echo ""
echo "  # Start Gemini CLI"
echo "  gemini"
echo ""
echo "  # Use skills via slash commands (colon separator):"
echo "  /skills:automation:flutter-bootstrapper"
echo "  /skills:automation:feature-implementer"
echo "  /skills:automation:code-reviewer"
echo "  /skills:automation:qa-auditor"
echo "  /skills:automation:automation-orchestrator"
echo ""
echo "  /skills:prprompts-core:phase-generator"
echo "  /skills:prprompts-core:single-file-generator"
echo ""
echo "  /skills:development-workflow:flutter-flavors"
echo ""
echo "💡 Gemini-specific features:"
echo "  # Inline arguments"
echo "  /skills:automation:code-reviewer security lib/features/auth"
echo ""
echo "  # Leverage 1M token context for entire codebase analysis"
echo "  # Free tier: 60 req/min, 1,000/day"
echo ""
echo "📖 Documentation:"
echo "  Full guide: docs/GEMINI-SKILLS-GUIDE.md"
echo "  Gemini setup: GEMINI.md"
echo ""
echo "✅ Installation successful!"
