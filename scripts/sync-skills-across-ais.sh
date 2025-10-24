#!/bin/bash

#############################################################################
# PRPROMPTS Multi-AI Skill Syncer
#
# Synchronizes skills across .claude/, .qwen/, and .gemini/ directories
# to maintain feature parity across all AI assistants
#
# Usage:
#   ./scripts/sync-skills-across-ais.sh [options]
#
# Options:
#   --dry-run       Show what would be synced without making changes
#   --force         Overwrite existing files without confirmation
#   --skill <id>    Sync only specific skill
#   --verbose       Show detailed output
#
# Examples:
#   ./scripts/sync-skills-across-ais.sh                    # Sync all skills
#   ./scripts/sync-skills-across-ais.sh --dry-run          # Preview changes
#   ./scripts/sync-skills-across-ais.sh --skill prd-creator  # Sync one skill
#############################################################################

set -e

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
SYNCED_COUNT=0
SKIPPED_COUNT=0
ERROR_COUNT=0

# Options
DRY_RUN=false
FORCE=false
SPECIFIC_SKILL=""
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --skill)
            SPECIFIC_SKILL="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            grep "^#" "$0" | sed 's/^# \?//'
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Logging functions
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ERROR_COUNT=$((ERROR_COUNT + 1))
}

log_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}   $1${NC}"
    fi
}

# Banner
echo ""
echo "========================================="
echo "  PRPROMPTS Multi-AI Skill Syncer"
echo "========================================="
echo ""

if [ "$DRY_RUN" = true ]; then
    log_warning "Running in DRY-RUN mode (no changes will be made)"
    echo ""
fi

# Check if .claude/skills exists
if [ ! -d ".claude/skills" ]; then
    log_error ".claude/skills directory not found!"
    echo "Please run this script from the repository root."
    exit 1
fi

# Function to sync a single skill
sync_skill() {
    local skill_path=$1
    local skill_name=$(basename "$skill_path")
    local category=$(basename "$(dirname "$skill_path")")

    log_info "Syncing skill: ${category}/${skill_name}"

    # Create target directories
    local qwen_dir=".qwen/skills/${category}/${skill_name}"
    local gemini_dir=".gemini/skills/${category}/${skill_name}"

    # Ensure parent directories exist
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$(dirname "$qwen_dir")"
        mkdir -p "$(dirname "$gemini_dir")"
    fi

    # Sync to Qwen
    if [ -d "$qwen_dir" ] && [ "$FORCE" = false ]; then
        log_verbose "Qwen skill exists, checking for differences..."
        if diff -rq "$skill_path" "$qwen_dir" > /dev/null 2>&1; then
            log_verbose "Qwen skill is identical, skipping"
        else
            log_warning "Qwen skill differs, use --force to overwrite"
            SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        fi
    else
        if [ "$DRY_RUN" = false ]; then
            cp -r "$skill_path" "$qwen_dir"
            log_success "Synced to Qwen: ${category}/${skill_name}"
        else
            log_verbose "Would sync to: $qwen_dir"
        fi
        SYNCED_COUNT=$((SYNCED_COUNT + 1))
    fi

    # Sync to Gemini
    if [ -d "$gemini_dir" ] && [ "$FORCE" = false ]; then
        log_verbose "Gemini skill exists, checking for differences..."
        if diff -rq "$skill_path" "$gemini_dir" > /dev/null 2>&1; then
            log_verbose "Gemini skill is identical, skipping"
        else
            log_warning "Gemini skill differs, use --force to overwrite"
            SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
        fi
    else
        if [ "$DRY_RUN" = false ]; then
            cp -r "$skill_path" "$gemini_dir"
            log_success "Synced to Gemini: ${category}/${skill_name}"
        else
            log_verbose "Would sync to: $gemini_dir"
        fi
        SYNCED_COUNT=$((SYNCED_COUNT + 1))
    fi
}

# Function to sync skills.json
sync_skills_json() {
    log_info "Syncing skills.json registry..."

    local claude_json=".claude/skills.json"
    local qwen_json=".qwen/skills.json"
    local gemini_json=".gemini/skills.json"

    if [ ! -f "$claude_json" ]; then
        log_error "Claude skills.json not found!"
        return
    fi

    # Sync to Qwen
    if [ "$DRY_RUN" = false ]; then
        cp "$claude_json" "$qwen_json"
        log_success "Synced skills.json to Qwen"
    else
        log_verbose "Would sync skills.json to: $qwen_json"
    fi

    # Sync to Gemini
    if [ "$DRY_RUN" = false ]; then
        cp "$claude_json" "$gemini_json"
        log_success "Synced skills.json to Gemini"
    else
        log_verbose "Would sync skills.json to: $gemini_json"
    fi
}

# Function to sync index.md
sync_index_md() {
    log_info "Syncing index.md documentation..."

    local claude_index=".claude/skills/index.md"
    local qwen_index=".qwen/skills/index.md"
    local gemini_index=".gemini/skills/index.md"

    if [ ! -f "$claude_index" ]; then
        log_warning "Claude index.md not found, skipping"
        return
    fi

    # Sync to Qwen
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$(dirname "$qwen_index")"
        cp "$claude_index" "$qwen_index"
        log_success "Synced index.md to Qwen"
    else
        log_verbose "Would sync index.md to: $qwen_index"
    fi

    # Sync to Gemini
    if [ "$DRY_RUN" = false ]; then
        mkdir -p "$(dirname "$gemini_index")"
        cp "$claude_index" "$gemini_index"
        log_success "Synced index.md to Gemini"
    else
        log_verbose "Would sync index.md to: $gemini_index"
    fi
}

# Main sync logic
if [ -n "$SPECIFIC_SKILL" ]; then
    # Sync specific skill only
    log_info "Looking for skill: $SPECIFIC_SKILL"

    FOUND=false
    for category in .claude/skills/*/; do
        for skill_path in "${category}"*/; do
            skill_name=$(basename "$skill_path")
            if [ "$skill_name" = "$SPECIFIC_SKILL" ]; then
                sync_skill "$skill_path"
                FOUND=true
                break 2
            fi
        done
    done

    if [ "$FOUND" = false ]; then
        log_error "Skill not found: $SPECIFIC_SKILL"
        exit 1
    fi
else
    # Sync all skills
    log_info "Scanning for skills in .claude/skills/..."

    TOTAL_SKILLS=0
    for category in .claude/skills/*/; do
        if [ ! -d "$category" ]; then
            continue
        fi

        category_name=$(basename "$category")

        # Skip non-category directories
        if [ "$category_name" = "." ] || [ "$category_name" = ".." ]; then
            continue
        fi

        log_verbose "Scanning category: $category_name"

        for skill_path in "${category}"*/; do
            if [ ! -d "$skill_path" ]; then
                continue
            fi

            skill_name=$(basename "$skill_path")

            # Skip if no skill.json
            if [ ! -f "${skill_path}skill.json" ]; then
                log_warning "Skipping ${category_name}/${skill_name} (no skill.json)"
                continue
            fi

            TOTAL_SKILLS=$((TOTAL_SKILLS + 1))
            sync_skill "$skill_path"
        done
    done

    # Sync registry and documentation
    sync_skills_json
    sync_index_md

    log_info "Total skills processed: $TOTAL_SKILLS"
fi

# Report
echo ""
echo "========================================="
echo "  Sync Summary"
echo "========================================="
echo -e "${GREEN}✅ Synced: $SYNCED_COUNT${NC}"
echo -e "${YELLOW}⏭️  Skipped: $SKIPPED_COUNT${NC}"
echo -e "${RED}❌ Errors: $ERROR_COUNT${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    log_info "This was a dry-run. Re-run without --dry-run to apply changes."
elif [ $ERROR_COUNT -eq 0 ]; then
    log_success "All skills synced successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Run tests: npm run test:skills"
    echo "  2. Commit changes: git add .qwen/ .gemini/ && git commit -m 'sync: Update skills across AIs'"
else
    log_error "Sync completed with errors"
    exit 1
fi

echo ""
