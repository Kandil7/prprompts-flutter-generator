# EXECUTE: Implement Next Feature

**IMPORTANT: This is an EXECUTION command. Immediately start implementing without waiting for confirmation.**

Auto-implement the next pending task from IMPLEMENTATION_PLAN.md with tests, validation, and progress tracking.

---

## STEP 1: Find Next Task

Read `docs/IMPLEMENTATION_PLAN.md` and find the first task marked `[TODO]`.

**Priority order**:
1. Tasks on **critical path** (check "Critical Path" section)
2. Tasks with no dependencies
3. First [TODO] task in current sprint

If no TODO tasks found:
```
✅ All tasks complete!

Run:
  /update-plan     # Update velocity metrics
  /qa-check        # Final compliance audit
```

---

## STEP 2: Check Dependencies

For the selected task, check its **Dependencies** field:

```markdown
**Dependencies**: Task 1.1 (DONE), Task 1.2 (IN_PROGRESS)
```

**If any dependency is [TODO] or [BLOCKED]**:
```
⚠️  Cannot start Task X.Y: Dependencies not ready

Blocked by:
- Task 1.2: [IN_PROGRESS] (expected completion: 2 hours)

Skipping to next available task...
```

Find next task with all dependencies [DONE].

---

## STEP 3: Mark Task IN_PROGRESS

**BEFORE implementing**, update the task status:

Change:
```markdown
### Task 2.1: Dashboard - Domain Layer [TODO]
```

To:
```markdown
### Task 2.1: Dashboard - Domain Layer [IN_PROGRESS]
**Started**: 2025-02-05 10:30 AM
```

Also update subtasks:
```markdown
**Subtasks**:
- [ ] 2.1.1 Create User entity
- [ ] 2.1.2 Create UserRepository interface
```

This signals to other developers that this task is being worked on.

---

## STEP 4: Load Relevant PRPROMPTS

Based on the task's **PRPROMPTS** field, read referenced files:

```markdown
**PRPROMPTS**: @PRPROMPTS/01-feature_scaffold.md, @PRPROMPTS/16-security_and_compliance.md
```

Read:
- @PRPROMPTS/01-feature_scaffold.md
- @PRPROMPTS/16-security_and_compliance.md
- @PRPROMPTS/03-bloc_implementation.md (if presentation layer)
- @PRPROMPTS/04-api_integration.md (if API involved)
- @PRPROMPTS/05-testing_strategy.md (always)

---

## STEP 5: Implement Feature

**Record start time**: Note current time for velocity tracking.

NOW create the files following PRPROMPTS patterns:

### For Domain Layer:
1. **Entities** (lib/features/[feature]/domain/entities/)
2. **Repository Interfaces** (lib/features/[feature]/domain/repositories/)
3. **Usecases** (lib/features/[feature]/domain/usecases/)

### For Data Layer:
1. **Models** (lib/features/[feature]/data/models/)
2. **Repository Implementations** (lib/features/[feature]/data/repositories/)
3. **Datasources** (lib/features/[feature]/data/datasources/)

### For Presentation Layer:
1. **BLoC/Cubit** (lib/features/[feature]/presentation/bloc/)
2. **Pages** (lib/features/[feature]/presentation/pages/)
3. **Widgets** (lib/features/[feature]/presentation/widgets/)

**As you create each file**, mark subtasks complete:
```markdown
**Subtasks**:
- [x] 2.1.1 Create User entity ✅ (10:35 AM)
- [x] 2.1.2 Create UserRepository interface ✅ (10:40 AM)
- [ ] 2.1.3 Create LoginUsecase
```

---

## STEP 6: Generate Tests

Create comprehensive tests for ALL code:

### Unit Tests (required):
- Entity tests (equality, props)
- Usecase tests (success, failure, edge cases)
- Repository tests (mocked datasources)

### Widget Tests (if UI):
- Widget rendering
- User interactions
- BLoC integration

### Integration Tests (if complex):
- Full feature flows
- API integration
- Database operations

**Target**: 70%+ coverage (run `flutter test --coverage`)

---

## STEP 7: Validate

Run validation commands:

```bash
# Code analysis
flutter analyze

# Format code
dart format lib/ test/

# Run tests
flutter test

# Check coverage
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html  # View coverage report
```

**If validation fails**:
1. Fix errors
2. Re-run validation
3. DO NOT proceed until all checks pass

**If blocked** (e.g., missing API endpoint):
- Mark task as [BLOCKED]
- Add blocker description
- Skip to Step 10 (Update Plan with Blocked status)

---

## STEP 8: Track Actual Time

**Record end time**: Note current time.

Calculate:
```
Actual Time = End Time - Start Time
```

**Example**:
```
Started: 10:30 AM
Completed: 12:15 PM
Actual Time: 1 hour 45 minutes (1.75 hours)
```

---

## STEP 9: Update Implementation Plan

### Update Task Status:

Change:
```markdown
### Task 2.1: Dashboard - Domain Layer [IN_PROGRESS]
**Started**: 2025-02-05 10:30 AM
**Estimated**: 6 hours
```

To:
```markdown
### Task 2.1: Dashboard - Domain Layer [DONE]
**Estimated**: 6 hours | **Actual**: 1.75 hours
**Completed**: 2025-02-05 12:15 PM
```

### Mark All Subtasks Complete:
```markdown
**Subtasks**:
- [x] 2.1.1 Create User entity
- [x] 2.1.2 Create UserRepository interface
- [x] 2.1.3 Create LoginUsecase
- [x] 2.1.4 Write unit tests (coverage: 85%)
```

### Update Acceptance Criteria:
```markdown
**Acceptance Criteria**:
- ✅ All 4 domain layer files created
- ✅ All 4 test files created with 85% coverage
- ✅ Follows PRPROMPTS/01 Clean Architecture patterns
- ✅ No analyzer warnings
```

### Update Sprint Progress:

Find current sprint section:
```markdown
## Sprint 2: Core Features (Week 3-4) - 32 SP [50% COMPLETE]
```

Recalculate:
```
Previous: 16 SP complete
This task: 13 SP
New total: 29 SP complete
Progress: 29 / 32 = 91%
```

Update:
```markdown
## Sprint 2: Core Features (Week 3-4) - 32 SP [91% COMPLETE]
```

### Update Progress Dashboard:

```markdown
Sprint 2: █████████░ 91% (29/32 SP) ⏳
Overall: ████████░░ 75% (240/320 SP completed)
```

### Update Velocity Tracking:

Add row to Velocity Tracking table:
```markdown
| Sprint | Planned SP | Completed SP | Velocity | Trend |
|--------|-----------|--------------|----------|-------|
| Sprint 1 | 32 | 32 | 100% | ✅ On track |
| Sprint 2 | 32 | 29 (in progress) | 91% | ✅ On track |
```

Calculate actual vs estimated:
```
Task 2.1:
Estimated: 6 hours
Actual: 1.75 hours
Variance: -71% (faster than estimated!)
```

---

## STEP 10: Handle Blocked Tasks (If Applicable)

**If task became blocked during implementation**:

### Update Status:
```markdown
### Task 2.3: API Integration [BLOCKED]
**Estimated**: 8 hours | **Actual**: 2 hours (partial)
**Blocked Since**: 2025-02-05 11:30 AM

**Blockers**:
- Backend API endpoint /api/users not deployed
- Expected availability: 2025-02-06 (1 day delay)

**Workaround**:
- Created mock API for UI development
- Can proceed with Task 2.4 (UI) using mocks
```

### Add to Risk Register:
```markdown
| Task ID | Risk Level | Risk Description | Mitigation |
|---------|------------|------------------|------------|
| 2.3 | MEDIUM | Backend API not ready | Use mocks, parallel UI work |
```

### Find Alternative Task:
Skip to next task with dependencies met.

---

## STEP 11: Show Summary

Display implementation summary:

```
✅ Feature Implemented: Dashboard - Domain Layer

📊 Task Details:
   Task ID: 2.1
   Owner: Carol (Mid)
   Story Points: 13 SP
   Estimated: 6 hours
   Actual: 1.75 hours (71% faster!)

📁 Files Created: 8
   Domain:
   ├── entities/user.dart
   ├── entities/dashboard_stats.dart
   ├── repositories/dashboard_repository.dart
   └── usecases/get_dashboard_stats_usecase.dart

   Tests:
   ├── entities/user_test.dart
   ├── entities/dashboard_stats_test.dart
   ├── usecases/get_dashboard_stats_usecase_test.dart
   └── helpers/mock_dashboard_repository.dart

🧪 Tests Created: 4
   Test Coverage: 85% (target: 70%)
   All tests passing ✅

✅ Validation:
   flutter analyze: 0 issues
   dart format: ✅ Formatted
   flutter test: All 24 tests passing

📈 Sprint Progress:
   Sprint 2: 91% complete (29/32 SP)
   3 SP remaining in Sprint 2

🎯 Velocity:
   Task completed 71% faster than estimated
   Sprint 2 velocity: 91% (on track)

🚀 Next Steps:
   1. Run /implement-next (for Task 2.2)
   2. Run /review-and-commit (commit this feature)
   3. Run /update-plan (after sprint completes)

💡 Pro Tip: You completed this task faster than estimated!
   This improves team velocity. Keep it up! 🎉
```

---

## STEP 12: Optional - Auto-commit

**If user preference is auto-commit** (check config):

```bash
git add lib/features/dashboard/domain test/features/dashboard/domain
git commit -m "feat(dashboard): implement domain layer

- Add User and DashboardStats entities
- Add DashboardRepository interface
- Add GetDashboardStatsUsecase
- Add unit tests (85% coverage)

Task 2.1 complete (13 SP, 1.75 hours)
Sprint 2: 91% complete

Reference: PRPROMPTS/01-feature_scaffold.md

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## State Transition Diagram

```
TODO
  ↓
  Check dependencies
  ↓
IN_PROGRESS (mark before starting)
  ↓
  Implement + Test
  ↓
  Validate
  ↓
  ├─ Success → DONE (update actual time)
  ├─ Blocked → BLOCKED (describe blocker)
  └─ Failed → IN_PROGRESS (fix and retry)
```

---

## Example: Full Task Lifecycle

### Before:
```markdown
### Task 2.1: Dashboard - Domain Layer [TODO]
**Owner**: Carol (Mid) | **Story Points**: 13 | **Risk**: LOW
**Estimated**: 6 hours
**Dependencies**: Task 1.1 (DONE)
```

### During (Step 3):
```markdown
### Task 2.1: Dashboard - Domain Layer [IN_PROGRESS]
**Owner**: Carol (Mid) | **Story Points**: 13 | **Risk**: LOW
**Estimated**: 6 hours
**Started**: 2025-02-05 10:30 AM

**Subtasks**:
- [x] 2.1.1 Create User entity ✅
- [x] 2.1.2 Create DashboardStats entity ✅
- [ ] 2.1.3 Create DashboardRepository interface
- [ ] 2.1.4 Create GetDashboardStatsUsecase
```

### After (Step 9):
```markdown
### Task 2.1: Dashboard - Domain Layer [DONE]
**Owner**: Carol (Mid) | **Story Points**: 13 | **Risk**: LOW
**Estimated**: 6 hours | **Actual**: 1.75 hours (71% faster!)
**Started**: 2025-02-05 10:30 AM
**Completed**: 2025-02-05 12:15 PM

**Subtasks**:
- [x] 2.1.1 Create User entity ✅
- [x] 2.1.2 Create DashboardStats entity ✅
- [x] 2.1.3 Create DashboardRepository interface ✅
- [x] 2.1.4 Create GetDashboardStatsUsecase ✅
- [x] 2.1.5 Write unit tests (coverage: 85%) ✅

**Acceptance Criteria**:
- ✅ All 4 domain layer files created
- ✅ All 4 test files created with 85% coverage
- ✅ Follows PRPROMPTS/01 Clean Architecture patterns
- ✅ No analyzer warnings
- ✅ Committed to repo
```

---

## Notes

- **Always** mark task IN_PROGRESS before starting (prevents conflicts)
- **Always** check dependencies (prevents blocked work)
- **Always** track actual time (improves velocity estimates)
- **Always** update sprint progress (keeps team informed)
- Run `/update-plan` after each sprint to recalculate velocity
- Use `/implement-next` repeatedly to auto-implement full sprint
- Use `/full-cycle X` to auto-implement X tasks without manual intervention
