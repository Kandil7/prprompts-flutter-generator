#!/bin/bash
# Setup script for PRPROMPTS Generator

set -e

echo "🚀 Setting up PRPROMPTS Generator..."

# Check Claude Code
if ! command -v claude &> /dev/null; then
    echo "📦 Installing Claude Code..."
    npm install -g @anthropic-ai/claude-code
fi

# Make scripts executable
chmod +x scripts/*.sh

# Setup aliases
ALIAS_FILE="scripts/prp-aliases.sh"
SHELL_RC="${HOME}/.bashrc"

if [[ "$SHELL" == */zsh ]]; then
    SHELL_RC="${HOME}/.zshrc"
fi

if ! grep -q "prp-aliases.sh" "$SHELL_RC"; then
    echo "🔗 Adding aliases to $SHELL_RC..."
    echo "source $(pwd)/$ALIAS_FILE" >> "$SHELL_RC"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. source $SHELL_RC"
echo "  2. cd your-flutter-project"
echo "  3. cp $(pwd)/templates/PRD-template.md docs/PRD.md"
echo "  4. Edit docs/PRD.md"
echo "  5. prp-gen"
