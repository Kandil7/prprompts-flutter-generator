#compdef prprompts
# Zsh completion for prprompts CLI
# Install: Copy to ~/.zsh/completions/ or add to $fpath

_prprompts() {
    local -a commands

    commands=(
        'init:Initialize PRPROMPTS in current project'
        'create:Create PRD interactively'
        'auto:Auto-generate PRD from description'
        'from-files:Generate PRD from existing markdown files'
        'analyze:Validate and analyze PRD'
        'generate:Generate all 32 PRPROMPTS files'
        'gen:Generate all 32 PRPROMPTS files (alias)'
        'gen-phase-1:Generate Phase 1: Core Architecture'
        'gen-phase-2:Generate Phase 2: Quality & Security'
        'gen-phase-3:Generate Phase 3: Demo & Learning'
        'gen-file:Generate single PRPROMPTS file'
        'config:Show current configuration'
        'switch:Switch default AI (claude|qwen|gemini)'
        'which:Show which AI will be used'
        'doctor:Diagnose installation issues'
        'update:Update PRPROMPTS to latest version'
        'version:Show version information'
        'help:Show help message'
    )

    _arguments -C \
        '1: :->command' \
        '*::arg:->args'

    case $state in
        command)
            _describe 'prprompts commands' commands
            ;;
        args)
            case $words[1] in
                switch)
                    _values 'AI assistant' \
                        'claude[Claude Code]' \
                        'qwen[Qwen Code]' \
                        'gemini[Gemini CLI]'
                    ;;
                gen-file)
                    local -a files
                    files=(
                        'feature_scaffold:01 - Feature Scaffold'
                        'responsive_layout:02 - Responsive Layout'
                        'bloc_implementation:03 - BLoC Implementation'
                        'api_integration:04 - API Integration'
                        'testing_strategy:05 - Testing Strategy'
                        'design_system:06 - Design System'
                        'junior_onboarding:07 - Junior Onboarding'
                        'accessibility:08 - Accessibility'
                        'internationalization:09 - Internationalization'
                        'performance:10 - Performance Optimization'
                        'git_branching:11 - Git Branching Strategy'
                        'progress_tracking:12 - Progress Tracking'
                        'multi_team_coordination:13 - Multi-Team Coordination'
                        'security_audit:14 - Security Audit Checklist'
                        'release_management:15 - Release Management'
                        'security_and_compliance:16 - Security & Compliance'
                        'quality_gates:18 - Quality Gates'
                        'localization_accessibility:19 - Localization & Accessibility'
                        'versioning:20 - Versioning Strategy'
                        'team_culture:21 - Team Culture'
                        'auto_documentation:22 - Auto-Documentation'
                        'ai_pair_programming:23 - AI Pair Programming'
                        'dashboard_analytics:24 - Dashboard & Analytics'
                        'tech_debt:25 - Tech Debt Management'
                        'demo_environment:26 - Demo Environment'
                        'demo_progress:27 - Demo Progress Dashboard'
                        'demo_branding:28 - Demo Branding'
                        'demo_deployment:29 - Demo Deployment'
                        'client_reports:30 - Client Reports'
                        'role_adaptation:31 - Role Adaptation'
                        'lessons_learned_engine:32 - Lessons Learned Engine'
                    )
                    _describe 'PRPROMPTS files' files
                    ;;
            esac
            ;;
    esac
}

_prprompts "$@"
