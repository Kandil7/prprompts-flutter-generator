# Implement Next Task (PRPROMPTS-Guided)

Automatically implement the next task following PRPROMPTS best practices.

## 1. Find Current Task
- Read @docs/IMPLEMENTATION_PLAN.md
- Find task marked "CURRENT" or first "TODO"
- Exit if no tasks remain

## 2. Load Context
- Read @docs/PRD.md for feature requirements
- Read @docs/ARCHITECTURE.md for patterns
- Identify relevant PRPROMPTS file from task reference
- Read the specific PRPROMPTS file for guidance

Example:
- Task references @PRPROMPTS/03-bloc_implementation.md
- Load that file for BLoC patterns, examples, constraints

## 3. Implement Following PRPROMPTS
Using the referenced PRPROMPTS file:
- Follow EXAMPLES section for code patterns
- Respect CONSTRAINTS (DO/DON'T rules)
- Implement validation gates from file
- Apply best practices explained

## 4. Generate Tests
Based on @PRPROMPTS/05-testing_strategy.md:
- Create unit tests for business logic
- Create widget tests for UI
- Follow testing patterns from PRPROMPTS

## 5. Run Tests
```bash
flutter test
```
If failures: Fix and re-run until passing

## 6. Security Check
If task involves:
- Authentication → verify against @PRPROMPTS/16-security_and_compliance.md
- Data storage → check encryption requirements
- API calls → verify JWT patterns (RS256, public key only)
- Payment → verify PCI-DSS compliance

## 7. Code Quality
Run analyzer:
```bash
flutter analyze
```
Fix all errors and warnings

## 8. Update Documentation
- Mark current task DONE ✓ in IMPLEMENTATION_PLAN.md
- Mark next task as CURRENT
- Add code comments referencing PRPROMPTS sections

## 9. Stage Changes
```bash
git add [files related to this task]
```

## 10. Report
Print:
```
✓ Task completed: [Task name]
✓ PRPROMPTS followed: [File name]
✓ Tests: X passing
✓ Files changed: [list]
✓ Next task: [Task name]

Ready to commit? Say 'commit' to proceed.
```
