# Fish shell completion for prprompts CLI
# Install: Copy to ~/.config/fish/completions/

# Main commands
complete -c prprompts -f -n "__fish_use_subcommand" -a "init" -d "Initialize PRPROMPTS in current project"
complete -c prprompts -f -n "__fish_use_subcommand" -a "create" -d "Create PRD interactively"
complete -c prprompts -f -n "__fish_use_subcommand" -a "auto" -d "Auto-generate PRD from description"
complete -c prprompts -f -n "__fish_use_subcommand" -a "from-files" -d "Generate PRD from existing markdown files"
complete -c prprompts -f -n "__fish_use_subcommand" -a "analyze" -d "Validate and analyze PRD"
complete -c prprompts -f -n "__fish_use_subcommand" -a "generate" -d "Generate all 32 PRPROMPTS files"
complete -c prprompts -f -n "__fish_use_subcommand" -a "gen" -d "Generate all 32 PRPROMPTS files (alias)"
complete -c prprompts -f -n "__fish_use_subcommand" -a "gen-phase-1" -d "Generate Phase 1: Core Architecture"
complete -c prprompts -f -n "__fish_use_subcommand" -a "gen-phase-2" -d "Generate Phase 2: Quality & Security"
complete -c prprompts -f -n "__fish_use_subcommand" -a "gen-phase-3" -d "Generate Phase 3: Demo & Learning"
complete -c prprompts -f -n "__fish_use_subcommand" -a "gen-file" -d "Generate single PRPROMPTS file"
complete -c prprompts -f -n "__fish_use_subcommand" -a "config" -d "Show current configuration"
complete -c prprompts -f -n "__fish_use_subcommand" -a "switch" -d "Switch default AI"
complete -c prprompts -f -n "__fish_use_subcommand" -a "which" -d "Show which AI will be used"
complete -c prprompts -f -n "__fish_use_subcommand" -a "doctor" -d "Diagnose installation issues"
complete -c prprompts -f -n "__fish_use_subcommand" -a "update" -d "Update PRPROMPTS to latest version"
complete -c prprompts -f -n "__fish_use_subcommand" -a "version" -d "Show version information"
complete -c prprompts -f -n "__fish_use_subcommand" -a "help" -d "Show help message"

# Switch command: AI options
complete -c prprompts -f -n "__fish_seen_subcommand_from switch" -a "claude" -d "Claude Code"
complete -c prprompts -f -n "__fish_seen_subcommand_from switch" -a "qwen" -d "Qwen Code"
complete -c prprompts -f -n "__fish_seen_subcommand_from switch" -a "gemini" -d "Gemini CLI"

# gen-file command: file names
complete -c prprompts -f -n "__fish_seen_subcommand_from gen-file" -a "feature_scaffold" -d "01 - Feature Scaffold"
complete -c prprompts -f -n "__fish_seen_subcommand_from gen-file" -a "responsive_layout" -d "02 - Responsive Layout"
complete -c prprompts -f -n "__fish_seen_subcommand_from gen-file" -a "bloc_implementation" -d "03 - BLoC Implementation"
complete -c prprompts -f -n "__fish_seen_subcommand_from gen-file" -a "api_integration" -d "04 - API Integration"
complete -c prprompts -f -n "__fish_seen_subcommand_from gen-file" -a "testing_strategy" -d "05 - Testing Strategy"
complete -c prprompts -f -n "__fish_seen_subcommand_from gen-file" -a "design_system" -d "06 - Design System"
complete -c prprompts -f -n "__fish_seen_subcommand_from gen-file" -a "security_and_compliance" -d "16 - Security & Compliance"
complete -c prprompts -f -n "__fish_seen_subcommand_from gen-file" -a "demo_environment" -d "26 - Demo Environment"
