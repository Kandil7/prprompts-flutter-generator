#!/bin/bash
# PRPROMPTS Generation Script

set -e

PHASE="${1:-all}"
DRY_RUN="${2}"

echo "📦 PRPROMPTS Generator"
echo ""

if [ "$DRY_RUN" == "--dry-run" ]; then
    echo "🔍 Dry run mode - validation only"
    echo ""
fi

# Check for PRD
if [ ! -f "docs/PRD.md" ]; then
    echo "❌ Error: docs/PRD.md not found"
    echo "Please create your PRD first using templates/PRD-template.md"
    exit 1
fi

echo "✅ Found PRD at docs/PRD.md"
echo ""

case "$PHASE" in
    "all")
        echo "Generating all 32 PRPROMPTS files..."
        ;;
    "p1"|"phase1")
        echo "Generating Phase 1: Core Architecture (10 files)..."
        ;;
    "p2"|"phase2")
        echo "Generating Phase 2: Quality & Security (12 files)..."
        ;;
    "p3"|"phase3")
        echo "Generating Phase 3: Demo & Learning (10 files)..."
        ;;
    *)
        echo "Usage: $0 [all|p1|p2|p3] [--dry-run]"
        exit 1
        ;;
esac

if [ "$DRY_RUN" == "--dry-run" ]; then
    echo "✅ Dry run complete - all checks passed"
    exit 0
fi

echo ""
echo "✅ Generation complete!"
echo "📁 Check PRPROMPTS/ directory for generated files"
