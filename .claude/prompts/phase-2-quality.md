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
Create in `PRPROMPTS/`:

11. **11-git_branching_strategy.md** - Git workflows
12. **12-progress_tracking_workflow.md** - Sprint planning
13. **13-multi_team_coordination.md** - Cross-team collab
14. **14-security_audit_checklist.md** - Pre-release validation
15. **15-release_management.md** - App Store process
16. **16-security_and_compliance.md** ⭐ PRD-sensitive
17. **17-performance_optimization_detailed.md** - Advanced profiling
18. **18-quality_gates_and_code_metrics.md** - Coverage, complexity
19. **19-localization_and_accessibility.md** - Combined L10n+A11y
20. **20-versioning_and_release_notes.md** - Semantic versioning
21. **21-team_culture_and_communication.md** - Async-first
22. **22-autodoc_integration.md** - Auto-documentation

## Customization
File 16 (security_and_compliance) heavily customized based on PRD compliance requirements.

## Success Message
```
✅ Generated Phase 2: Quality & Security (12 files)

Special customizations:
- 16-security_and_compliance.md tailored for [compliance list]

Next: claude gen-phase-3
```
