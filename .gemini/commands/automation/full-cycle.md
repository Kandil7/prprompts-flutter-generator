# Full Implementation Cycle (PRPROMPTS-Driven)

Execute multiple tasks automatically with PRPROMPTS validation.

## 1. Parameters
Ask user: "How many tasks to implement? (1-10, default: 3)"
Set MAX_TASKS

## 2. Pre-Flight Check
- [ ] PRPROMPTS/ directory exists (32 files)
- [ ] docs/PRD.md exists
- [ ] docs/ARCHITECTURE.md exists
- [ ] docs/IMPLEMENTATION_PLAN.md exists
- [ ] Flutter project initialized

## 3. Implementation Loop
For i = 1 to MAX_TASKS:

### a. Execute /implement-next
- Find next task
- Load relevant PRPROMPTS
- Implement following patterns
- Generate tests
- Validate

### b. Execute /review-and-commit
- Run PRPROMPTS validation gates
- Security checks
- Code quality gates
- Commit with proper message

### c. Progress Log
```
[Task i/MAX_TASKS] ✓ [Task name]
PRPROMPTS: [File used]
Time: [elapsed]
```

### d. Continue/Stop Logic
- If no more tasks → Report completion
- If MAX_TASKS reached → Ask to continue
- If error → Stop and report issue
- Otherwise → Next task

## 4. Cycle Summary
```
═══════════════════════════════════
   CYCLE COMPLETE
═══════════════════════════════════

Tasks Completed: [X]
PRPROMPTS Used: [List of files]
Tests Added: [Count]
Coverage: [Percentage]

Phase Progress:
Phase 1: ████████░░ 80%
Phase 2: ██░░░░░░░░ 20%
Phase 3: ░░░░░░░░░░  0%

Next Up: [Next task description]
```

## 5. Quality Gate
Run comprehensive check:
```bash
flutter analyze
flutter test --coverage
```

Report any issues found with PRPROMPTS references for fixing.
