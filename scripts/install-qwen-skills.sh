#!/bin/bash

##
# PRPROMPTS Qwen Code Skills Installer
# Installs all PRPROMPTS skills as global Qwen Code TOML slash commands
##

set -e

echo "🚀 Installing PRPROMPTS Skills for Qwen Code..."
echo ""

# Detect OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  QWEN_DIR="$USERPROFILE/.qwen"
else
  QWEN_DIR="$HOME/.qwen"
fi

# Create skills directory structure
echo "📁 Creating skills directory structure..."
mkdir -p "$QWEN_DIR/commands/skills/automation"
mkdir -p "$QWEN_DIR/commands/skills/prprompts-core"
mkdir -p "$QWEN_DIR/commands/skills/development-workflow"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Copy all TOML skill files
echo "📦 Installing skill files..."

# Automation skills (5)
if [ -d "$REPO_DIR/.qwen/commands/skills/automation" ]; then
  cp -r "$REPO_DIR/.qwen/commands/skills/automation/"*.toml "$QWEN_DIR/commands/skills/automation/" 2>/dev/null || true
  AUTOMATION_COUNT=$(ls -1 "$QWEN_DIR/commands/skills/automation/"*.toml 2>/dev/null | wc -l)
  echo "  ✅ Automation skills: $AUTOMATION_COUNT files"
fi

# PRPROMPTS Core skills (4)
if [ -d "$REPO_DIR/.qwen/commands/skills/prprompts-core" ]; then
  cp -r "$REPO_DIR/.qwen/commands/skills/prprompts-core/"*.toml "$QWEN_DIR/commands/skills/prprompts-core/" 2>/dev/null || true
  CORE_COUNT=$(ls -1 "$QWEN_DIR/commands/skills/prprompts-core/"*.toml 2>/dev/null | wc -l)
  echo "  ✅ PRPROMPTS Core skills: $CORE_COUNT files"
fi

# Development Workflow skills (1)
if [ -d "$REPO_DIR/.qwen/commands/skills/development-workflow" ]; then
  cp -r "$REPO_DIR/.qwen/commands/skills/development-workflow/"*.toml "$QWEN_DIR/commands/skills/development-workflow/" 2>/dev/null || true
  WORKFLOW_COUNT=$(ls -1 "$QWEN_DIR/commands/skills/development-workflow/"*.toml 2>/dev/null | wc -l)
  echo "  ✅ Workflow skills: $WORKFLOW_COUNT files"
fi

# Count total skills installed
TOTAL_SKILLS=$(find "$QWEN_DIR/commands/skills" -name "*.toml" 2>/dev/null | wc -l)

echo ""
echo "✨ Installation complete!"
echo ""
echo "📊 Summary:"
echo "  Total skills installed: $TOTAL_SKILLS"
echo "  Installation path: $QWEN_DIR/commands/skills/"
echo ""
echo "🎯 Usage Examples:"
echo ""
echo "  # Start Qwen Code"
echo "  qwen"
echo ""
echo "  # Use skills via slash commands:"
echo "  /skills/automation/flutter-bootstrapper"
echo "  /skills/automation/feature-implementer"
echo "  /skills/automation/code-reviewer"
echo "  /skills/automation/qa-auditor"
echo "  /skills/automation/automation-orchestrator"
echo ""
echo "  /skills/prprompts-core/phase-generator"
echo "  /skills/prprompts-core/single-file-generator"
echo ""
echo "  /skills/development-workflow/flutter-flavors"
echo ""
echo "📖 Documentation:"
echo "  Full guide: docs/QWEN-SKILLS-GUIDE.md"
echo "  Qwen setup: QWEN.md"
echo ""
echo "✅ Installation successful!"
