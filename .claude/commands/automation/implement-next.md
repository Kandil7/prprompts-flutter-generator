# EXECUTE: Implement Next Feature

**IMPORTANT: This is an EXECUTION command. Immediately start implementing without waiting for confirmation.**

Auto-implement the next pending task from IMPLEMENTATION_PLAN.md with tests and validation.

## STEP 1: Find Next Task

Read `docs/IMPLEMENTATION_PLAN.md` and find the first task marked `[TODO]`.

If no TODO tasks found:
```
✅ All tasks complete!

Run /qa-check for final compliance audit.
```

## STEP 2: Load Relevant PRPROMPTS

Based on the task, read these PRPROMPTS files:
- @PRPROMPTS/01-feature_scaffold.md
- @PRPROMPTS/03-bloc_implementation.md
- @PRPROMPTS/04-api_integration.md
- @PRPROMPTS/16-security_and_compliance.md
- @[task-specific PRPROMPTS]

## STEP 3: Implement Feature

NOW create the files following PRPROMPTS patterns:

1. **Domain Layer** (entities, repositories, usecases)
2. **Data Layer** (models, repositories, datasources)
3. **Presentation Layer** (BLoC, pages, widgets)

## STEP 4: Generate Tests

Create comprehensive tests:
- Unit tests (70%+ coverage)
- Widget tests
- BLoC tests
- Integration tests if needed

## STEP 5: Validate

Run validation:
```bash
flutter analyze
dart format lib/ test/
flutter test
```

## STEP 6: Update Implementation Plan

Mark task as `[DONE]` in IMPLEMENTATION_PLAN.md.

## STEP 7: Show Summary

```
✅ Feature Implemented: [Feature Name]

Files Created: [count]
Tests Created: [count]
Test Coverage: [X]%

Next: Run /implement-next for next feature or /review-and-commit to commit changes.
```
