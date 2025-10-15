---
name: Generate Phase 2
description: Generate Phase 2 Quality & Security files (12 files)
author: Phase 2 Generator
version: 1.0.0
tags: [prprompts, phase-2, quality, security]
---

# Generate Phase 2: Quality & Security

## Overview
Generate the 12 quality and security PRPROMPTS files.

## Input
Read: `docs/PRD.md`

## Output

**IMPORTANT**: All files MUST go inside the `PRPROMPTS/` folder.

### Generation Steps

1. **Ensure Folder Exists**: The `PRPROMPTS/` directory should already exist from Phase 1
2. **Generate Files**: Create 12 numbered files (11-22) inside `PRPROMPTS/`:
   - `PRPROMPTS/11-git_branching_strategy.md` - Git workflows
   - `PRPROMPTS/12-progress_tracking_workflow.md` - Sprint planning
   - `PRPROMPTS/13-multi_team_coordination.md` - Cross-team collab
   - `PRPROMPTS/14-security_audit_checklist.md` - Pre-release validation
   - `PRPROMPTS/15-release_management.md` - App Store process
   - `PRPROMPTS/16-security_and_compliance.md` - ⭐ PRD-sensitive
   - `PRPROMPTS/17-performance_optimization_detailed.md` - Advanced profiling
   - `PRPROMPTS/18-quality_gates_and_code_metrics.md` - Coverage, complexity
   - `PRPROMPTS/19-localization_and_accessibility.md` - Combined L10n+A11y
   - `PRPROMPTS/20-versioning_and_release_notes.md` - Semantic versioning
   - `PRPROMPTS/21-team_culture_and_communication.md` - Async-first
   - `PRPROMPTS/22-autodoc_integration.md` - Auto-documentation

### Folder Structure

```
PRPROMPTS/
├── ... (files 01-10 from Phase 1)
├── 11-git_branching_strategy.md
├── 12-progress_tracking_workflow.md
├── 13-multi_team_coordination.md
├── 14-security_audit_checklist.md
├── 15-release_management.md
├── 16-security_and_compliance.md  ⭐
├── 17-performance_optimization_detailed.md
├── 18-quality_gates_and_code_metrics.md
├── 19-localization_and_accessibility.md
├── 20-versioning_and_release_notes.md
├── 21-team_culture_and_communication.md
└── 22-autodoc_integration.md
```

## Customization
File 16 (security_and_compliance) heavily customized based on PRD compliance requirements.

## Success Message
```
✅ Generated Phase 2: Quality & Security (12 files)

Special customizations:
- 16-security_and_compliance.md tailored for [compliance list]

Next: claude gen-phase-3
```
