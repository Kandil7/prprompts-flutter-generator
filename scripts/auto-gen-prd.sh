#!/bin/bash
# Auto-generate PRD from project description file

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🤖 Auto PRD Generator${NC}"
echo ""

# Find description file
DESC_FILE=""

if [ -n "$1" ]; then
    # File specified by user
    if [ -f "$1" ]; then
        DESC_FILE="$1"
    else
        echo -e "${RED}❌ File not found: $1${NC}"
        exit 1
    fi
else
    # Auto-detect
    LOCATIONS=(
        "project_description.md"
        "docs/project_description.md"
        "PROJECT_DESCRIPTION.md"
        ".github/project_description.md"
        "README.md"
    )

    for loc in "${LOCATIONS[@]}"; do
        if [ -f "$loc" ]; then
            DESC_FILE="$loc"
            break
        fi
    done
fi

if [ -z "$DESC_FILE" ]; then
    echo -e "${RED}❌ No project description file found${NC}"
    echo ""
    echo "Searched locations:"
    echo "  - project_description.md"
    echo "  - docs/project_description.md"
    echo "  - PROJECT_DESCRIPTION.md"
    echo ""
    echo "Create a description file or specify: $0 path/to/description.md"
    echo ""
    echo "Template: templates/project_description.md"
    echo "Examples: templates/project_description_examples.md"
    exit 1
fi

echo -e "${GREEN}📄 Found description: $DESC_FILE${NC}"
echo ""

# Check Claude Code installed
if ! command -v claude &> /dev/null; then
    echo -e "${RED}❌ Claude Code not installed${NC}"
    echo "Install: npm install -g @anthropic-ai/claude-code"
    exit 1
fi

# Generate PRD
echo -e "${YELLOW}🔄 Generating PRD...${NC}"
claude --prompt .claude/prompts/auto-generate-prd.md --file "$DESC_FILE"

# Check if PRD created
if [ -f "docs/PRD.md" ]; then
    echo ""
    echo -e "${GREEN}✅ PRD generated: docs/PRD.md${NC}"
    echo ""

    # Ask to generate PRPROMPTS
    read -p "Generate PRPROMPTS now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        prp-gen
    fi
else
    echo -e "${RED}❌ PRD generation failed${NC}"
    exit 1
fi
