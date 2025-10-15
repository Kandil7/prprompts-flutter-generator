#!/bin/bash
# PRPROMPTS Shell Aliases
# Add to ~/.bashrc or ~/.zshrc

# Quick shortcuts for PRPROMPTS commands
alias prp-new='claude create-prd'
alias prp-auto='claude auto-gen-prd'
alias prp-check='claude analyze-prd'
alias prp-gen='claude gen-prprompts'
alias prp-p1='claude gen-phase-1'
alias prp-p2='claude gen-phase-2'
alias prp-p3='claude gen-phase-3'
alias prp-file='claude gen-file'

# Workflow shortcuts
alias prp-full='claude auto-gen-prd && claude gen-prprompts'
alias prp-validate='claude analyze-prd && claude gen-prprompts'

# Utility aliases
alias prp-help='cat $HOME/.config/claude/prompts/prprompts-generator.md'
alias prp-list='ls -la PRPROMPTS/'
alias prp-clean='rm -rf PRPROMPTS/'

# Usage:
# prp-new      → Create PRD interactively
# prp-auto     → Auto-generate PRD
# prp-check    → Analyze PRD
# prp-gen      → Generate all PRPROMPTS
# prp-full     → Full automation (auto-gen + generate)
