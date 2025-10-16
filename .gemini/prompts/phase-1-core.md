---
name: Generate Phase 1
description: Generate Phase 1 Core Architecture files (10 files)
author: Phase 1 Generator
version: 1.0.0
tags: [prprompts, phase-1, architecture]
---

# Generate Phase 1: Core Architecture

## Overview
Generate the 10 core architecture PRPROMPTS files.

## Input
Read: `docs/PRD.md`

## Output

**IMPORTANT**: All files MUST go inside the `PRPROMPTS/` folder.

### Generation Steps

1. **Create Folder**: Ensure `PRPROMPTS/` directory exists (create if needed)
2. **Generate Files**: Create 10 numbered files inside `PRPROMPTS/`:
   - `PRPROMPTS/01-feature_scaffold.md` - Clean Architecture patterns
   - `PRPROMPTS/02-responsive_layout.md` - Adaptive UI
   - `PRPROMPTS/03-bloc_implementation.md` - BLoC vs Cubit
   - `PRPROMPTS/04-api_integration.md` - Auth, error handling
   - `PRPROMPTS/05-testing_strategy.md` - Unit/Widget/Integration tests
   - `PRPROMPTS/06-design_system_usage.md` - Theme, components
   - `PRPROMPTS/07-onboarding_junior.md` - Junior developer guide
   - `PRPROMPTS/08-accessibility_a11y.md` - WCAG 2.1 compliance
   - `PRPROMPTS/09-internationalization_i18n.md` - Multi-language
   - `PRPROMPTS/10-performance_optimization.md` - Build times, FPS

### Folder Structure

```
PRPROMPTS/
├── 01-feature_scaffold.md
├── 02-responsive_layout.md
├── 03-bloc_implementation.md
├── 04-api_integration.md
├── 05-testing_strategy.md
├── 06-design_system_usage.md
├── 07-onboarding_junior.md
├── 08-accessibility_a11y.md
├── 09-internationalization_i18n.md
└── 10-performance_optimization.md
```

## Customization
Apply PRD-based customizations for compliance, offline, real-time, etc.

## Success Message
```
✅ Generated Phase 1: Core Architecture (10 files)

Files created in PRPROMPTS/:
- 01-feature_scaffold.md
- 02-responsive_layout.md
- ... (8 more files)

Next: claude gen-phase-2
```
