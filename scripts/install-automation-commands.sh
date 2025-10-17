#!/bin/bash
#
# Install automation commands for Claude Code, Qwen Code, and Gemini CLI
# Usage: ./scripts/install-automation-commands.sh [--global]
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

GLOBAL_FLAG="$1"

echo "🤖 Installing PRPROMPTS Automation Commands..."
echo ""

if [[ "$GLOBAL_FLAG" == "--global" ]]; then
    echo "📦 Installing globally..."

    # Install for Claude Code
    if command -v claude &> /dev/null; then
        CLAUDE_DIR="$HOME/.config/claude/commands/prprompts-automation"
        mkdir -p "$CLAUDE_DIR"
        cp -r "$PROJECT_ROOT/.claude/commands/automation/"* "$CLAUDE_DIR/"
        echo "✅ Claude Code automation commands installed"
    else
        echo "⚠️  Claude Code not found - skipping"
    fi

    # Install for Qwen Code
    if command -v qwen &> /dev/null; then
        QWEN_DIR="$HOME/.config/qwen/commands/prprompts-automation"
        mkdir -p "$QWEN_DIR"
        cp -r "$PROJECT_ROOT/.qwen/commands/automation/"* "$QWEN_DIR/"
        echo "✅ Qwen Code automation commands installed"
    else
        echo "⚠️  Qwen Code not found - skipping"
    fi

    # Install for Gemini CLI
    if command -v gemini &> /dev/null; then
        GEMINI_DIR="$HOME/.config/gemini/commands/prprompts-automation"
        mkdir -p "$GEMINI_DIR"
        cp -r "$PROJECT_ROOT/.gemini/commands/automation/"* "$GEMINI_DIR/"
        echo "✅ Gemini CLI automation commands installed"
    else
        echo "⚠️  Gemini CLI not found - skipping"
    fi

    echo ""
    echo "📍 Commands installed globally"
else
    echo "✅ Automation commands available in project directories:"
    echo "   .claude/commands/automation/"
    echo "   .qwen/commands/automation/"
    echo "   .gemini/commands/automation/"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  AUTOMATION COMMANDS INSTALLED                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Available Commands:"
echo ""
echo "   /bootstrap-from-prprompts"
echo "   Full project setup from PRPROMPTS (2-5 min)"
echo "   Creates architecture, design system, security, tests"
echo ""
echo "   /implement-next"
echo "   Auto-implement next task with tests"
echo "   Follows PRPROMPTS patterns and validation gates"
echo ""
echo "   /review-and-commit"
echo "   Validate and commit with PRPROMPTS checks"
echo "   Security validation, code quality gates"
echo ""
echo "   /full-cycle"
echo "   Auto-implement multiple tasks (1-2 hours)"
echo "   Complete automation loop with validation"
echo ""
echo "   /qa-check"
echo "   PRPROMPTS compliance audit (2 min)"
echo "   Security, architecture, testing validation"
echo ""
echo "🚀 Complete Workflow:"
echo ""
echo "   # 1. Generate PRPROMPTS"
echo "   prprompts auto && prprompts generate"
echo ""
echo "   # 2. Start Claude Code"
echo "   claude"
echo ""
echo "   # 3. Bootstrap project"
echo "   /bootstrap-from-prprompts"
echo ""
echo "   # 4. Auto-implement features"
echo "   /full-cycle"
echo "   5"
echo ""
echo "   # 5. Run QA audit"
echo "   /qa-check"
echo ""
echo "📖 Full Guide: docs/AUTOMATION-GUIDE.md"
echo ""
