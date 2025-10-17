# Bash completion for prprompts CLI
# Install: source this file or copy to /etc/bash_completion.d/

_prprompts() {
    local cur prev opts
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    # Main commands
    opts="init create auto from-files analyze generate gen gen-phase-1 gen-phase-2 gen-phase-3 gen-file config switch which doctor update version help"

    # Command-specific completions
    case "${prev}" in
        switch)
            COMPREPLY=( $(compgen -W "claude qwen gemini" -- ${cur}) )
            return 0
            ;;
        gen-file)
            # Suggest common PRPROMPTS file names
            local files="feature_scaffold responsive_layout bloc_implementation api_integration testing_strategy design_system junior_onboarding accessibility internationalization performance git_branching progress_tracking multi_team_coordination security_audit release_management security_and_compliance quality_gates localization_accessibility versioning team_culture auto_documentation ai_pair_programming dashboard_analytics tech_debt demo_environment demo_progress demo_branding demo_deployment client_reports role_adaptation lessons_learned_engine"
            COMPREPLY=( $(compgen -W "${files}" -- ${cur}) )
            return 0
            ;;
        prprompts)
            COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
            return 0
            ;;
    esac

    # Default: suggest main commands
    COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
    return 0
}

complete -F _prprompts prprompts
