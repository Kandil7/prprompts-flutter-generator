---
name: Generate PRPROMPTS
description: Generate all 32 PRPROMPTS files from PRD
author: PRPROMPTS Generator
version: 1.0.0
tags: [prprompts, generator, flutter]
---

# Generate All PRPROMPTS Files

## Overview
Generate all 32 customized PRPROMPTS files based on the PRD metadata in `docs/PRD.md`.

## Input
Read and parse: `docs/PRD.md`

## Output Directory
Create: `PRPROMPTS/` (32 markdown files + README.md)

## Generation Process

### Step 1: Read PRD YAML Frontmatter
Extract all metadata to customize generation

### Step 2: Generate Phase 1 Files (10 files)
1. 01-feature_scaffold.md
2. 02-responsive_layout.md
3. 03-bloc_implementation.md
4. 04-api_integration.md
5. 05-testing_strategy.md
6. 06-design_system_usage.md
7. 07-onboarding_junior.md
8. 08-accessibility_a11y.md
9. 09-internationalization_i18n.md
10. 10-performance_optimization.md

### Step 3: Generate Phase 2 Files (12 files)
11. 11-git_branching_strategy.md
12. 12-progress_tracking_workflow.md
13. 13-multi_team_coordination.md
14. 14-security_audit_checklist.md
15. 15-release_management.md
16. 16-security_and_compliance.md ⭐ PRD-sensitive
17. 17-performance_optimization_detailed.md
18. 18-quality_gates_and_code_metrics.md
19. 19-localization_and_accessibility.md
20. 20-versioning_and_release_notes.md
21. 21-team_culture_and_communication.md
22. 22-autodoc_integration.md

### Step 4: Generate Phase 3 Files (10 files)
23. 23-ai_pair_programming_guide.md
24. 24-dashboard_and_analytics.md
25. 25-tech_debt_and_refactor_strategy.md
26. 26-demo_environment_setup.md ⭐ PRD-scenario based
27. 27-demo_progress_tracker.md
28. 28-demo_branding_and_visuals.md
29. 29-demo_deployment_automation.md
30. 30-client_demo_report_template.md
31. 31-project_role_adaptation.md ⭐ PRD-driven
32. 32-lessons_learned_engine.md

### Step 5: Generate README.md
Create PRPROMPTS/README.md with usage instructions

## Customization Rules
Apply based on PRD metadata - see docs/CUSTOMIZATION.md for full rules

## Success Message
```
✅ Generated 32 PRPROMPTS files in PRPROMPTS/

Customizations applied:
- [List customizations based on PRD]

Next steps:
1. Review: ls PRPROMPTS/
2. Start coding: cat PRPROMPTS/01-feature_scaffold.md
3. Reference as needed during development
```
