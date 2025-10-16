---
name: Generate Phase 3
description: Generate Phase 3 Demo & Learning files (10 files)
author: Phase 3 Generator
version: 1.0.0
tags: [prprompts, phase-3, demo, learning]
---

# Generate Phase 3: Demo & Learning

## Overview
Generate the 10 demo and learning PRPROMPTS files plus README.

## Input
Read: `docs/PRD.md`

## Output

**IMPORTANT**: All files MUST go inside the `PRPROMPTS/` folder.

### Generation Steps

1. **Ensure Folder Exists**: The `PRPROMPTS/` directory should already exist from Phases 1-2
2. **Generate Files**: Create 10 numbered files (23-32) inside `PRPROMPTS/`:
   - `PRPROMPTS/23-ai_pair_programming_guide.md` - Claude/Copilot
   - `PRPROMPTS/24-dashboard_and_analytics.md` - Metrics, monitoring
   - `PRPROMPTS/25-tech_debt_and_refactor_strategy.md` - Debt tracking
   - `PRPROMPTS/26-demo_environment_setup.md` - ⭐ PRD-scenario based
   - `PRPROMPTS/27-demo_progress_tracker.md` - Client dashboard
   - `PRPROMPTS/28-demo_branding_and_visuals.md` - Demo UI
   - `PRPROMPTS/29-demo_deployment_automation.md` - Demo CI/CD
   - `PRPROMPTS/30-client_demo_report_template.md` - Weekly reports
   - `PRPROMPTS/31-project_role_adaptation.md` - ⭐ PRD-driven roles
   - `PRPROMPTS/32-lessons_learned_engine.md` - Retrospectives
3. **Generate README**: Create `PRPROMPTS/README.md` as the index/usage guide

### Final Folder Structure

```
PRPROMPTS/
├── 01-10 (from Phase 1)
├── 11-22 (from Phase 2)
├── 23-ai_pair_programming_guide.md
├── 24-dashboard_and_analytics.md
├── 25-tech_debt_and_refactor_strategy.md
├── 26-demo_environment_setup.md  ⭐
├── 27-demo_progress_tracker.md
├── 28-demo_branding_and_visuals.md
├── 29-demo_deployment_automation.md
├── 30-client_demo_report_template.md
├── 31-project_role_adaptation.md  ⭐
├── 32-lessons_learned_engine.md
└── README.md  ← Index file
```

**Total**: 33 files (32 guides + 1 README), all inside `PRPROMPTS/`

## Customization
Files 26 and 31 heavily customized based on PRD demo_frequency and team composition.

## Success Message
```
✅ Generated Phase 3: Demo & Learning (10 files + README)

All 32 PRPROMPTS files complete!

Start coding: cat PRPROMPTS/01-feature_scaffold.md
```
