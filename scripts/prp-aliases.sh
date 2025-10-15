# PRPROMPTS Generation Aliases

# Get script directory
PRPROMPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Quick generation
alias prp-gen="claude --prompt $PRPROMPTS_DIR/.claude/prompts/prprompts-generator.md"
alias prp-analyze="claude --prompt $PRPROMPTS_DIR/.claude/prompts/prd-analyzer.md"
alias prp-p1="claude --prompt $PRPROMPTS_DIR/.claude/prompts/phase-1-core.md"
alias prp-p2="claude --prompt $PRPROMPTS_DIR/.claude/prompts/phase-2-quality.md"
alias prp-p3="claude --prompt $PRPROMPTS_DIR/.claude/prompts/phase-3-demo.md"

# YOLO mode
alias prp-yolo="claude --dangerously-skip-permissions --prompt $PRPROMPTS_DIR/.claude/prompts/prprompts-generator.md"

# Interactive
alias prp-chat="claude --interactive"

# Generate specific file
prp-file() {
    if [ -z "$1" ]; then
        echo "Usage: prp-file <filename>"
        echo "Example: prp-file security_and_compliance"
        return 1
    fi
    claude --prompt "$PRPROMPTS_DIR/.claude/prompts/single-file-generator.md" --arg filename="$1"
}

# Full workflow
prp-full() {
    echo "🔍 Analyzing PRD..."
    prp-analyze

    echo ""
    echo "📦 Generating all PRPROMPTS..."
    prp-gen

    echo ""
    echo "✅ Done! Check PRPROMPTS/ directory"
}
