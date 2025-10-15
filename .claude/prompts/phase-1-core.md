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
Create in `PRPROMPTS/`:

1. **01-feature_scaffold.md** - Clean Architecture patterns
2. **02-responsive_layout.md** - Adaptive UI
3. **03-bloc_implementation.md** - BLoC vs Cubit
4. **04-api_integration.md** - Auth, error handling
5. **05-testing_strategy.md** - Unit/Widget/Integration tests
6. **06-design_system_usage.md** - Theme, components
7. **07-onboarding_junior.md** - Junior developer guide
8. **08-accessibility_a11y.md** - WCAG 2.1 compliance
9. **09-internationalization_i18n.md** - Multi-language
10. **10-performance_optimization.md** - Build times, FPS

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
