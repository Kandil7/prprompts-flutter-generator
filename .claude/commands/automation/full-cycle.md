# EXECUTE: Full-Cycle Automation

**IMPORTANT: This is an EXECUTION command. Immediately start the automation loop without waiting for confirmation.**

Complete end-to-end automation: implements multiple features, runs tests, commits code.

## STEP 1: Ask User

"How many features to implement? (1-10, recommended: 3)"

Wait for user input. Default to 3 if no answer.

## STEP 2: Pre-Flight Check

Verify these exist:
- PRPROMPTS/ (32 files)
- docs/PRD.md
- docs/ARCHITECTURE.md
- docs/IMPLEMENTATION_PLAN.md
- pubspec.yaml

If ANY missing, STOP and show error.

## STEP 3: Implementation Loop

For each feature (1 to N):

### 3.1 Execute `/implement-next`
- Find next TODO task
- Load PRPROMPTS
- Implement with tests
- Validate

### 3.2 Execute `/review-and-commit`
- PRPROMPTS compliance check
- Security validation
- Test coverage check
- Auto-commit

### 3.3 Progress Update
```
✅ Feature [X]/[N] complete
   Task: [Task Name]
   Files: [count]
   Tests: [count]
   Coverage: [X]%
```

## STEP 4: Final Summary

```
╔════════════════════════════════════════╗
║     FULL-CYCLE COMPLETE                ║
╚════════════════════════════════════════╝

✅ Features Implemented: [N]
✅ Total Files: [count]
✅ Total Tests: [count]
✅ Average Coverage: [X]%
✅ All Tests Passing
✅ Security Validated
✅ PRPROMPTS Compliant

📊 Time Saved: ~[X] hours (vs manual)
🚀 Ready for QA!

Next Steps:
1. Run /qa-check for compliance audit
2. Test app manually
3. Deploy to staging
```
