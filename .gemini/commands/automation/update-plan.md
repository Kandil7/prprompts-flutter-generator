# EXECUTE: Update Implementation Plan

**IMPORTANT: This is an EXECUTION command. Immediately perform all steps below without waiting for confirmation.**

Re-plan based on actual progress, calculate velocity, identify blockers, and adjust sprint allocations.

---

## STEP 1: Prerequisites Check

First, check if IMPLEMENTATION_PLAN.md exists:

```bash
ls docs/IMPLEMENTATION_PLAN.md
```

If missing:
```
❌ Error: docs/IMPLEMENTATION_PLAN.md not found

Please run:
  claude generate-implementation-plan

Then try update-plan again.
```

---

## STEP 2: Read Current Plan

Read `docs/IMPLEMENTATION_PLAN.md` and extract:

### Metadata:
- **Team Size**: How many developers
- **Sprint Duration**: 2 weeks (standard)
- **Initial Velocity**: Planned SP/sprint
- **Actual Velocity**: Average from completed sprints
- **Total Tasks**: Total count
- **Total Story Points**: Sum of all tasks

### Current Progress:
For each task, extract:
- **Task ID**: e.g., "Task 1.2"
- **Status**: TODO | IN_PROGRESS | BLOCKED | DONE | SKIPPED
- **Estimated**: Hours planned
- **Actual**: Hours spent (if DONE or IN_PROGRESS)
- **Owner**: Team member assigned
- **Sprint**: Which sprint it's in

### Completed Sprints:
For each sprint marked [COMPLETED] or [IN_PROGRESS]:
- **Sprint Number**: 1, 2, 3...
- **Planned SP**: Story points allocated
- **Completed SP**: Story points actually done
- **Velocity %**: (Completed / Planned) × 100%

---

## STEP 3: Calculate Actual Velocity

### Velocity Formula:

```
Actual Velocity = Average(Completed SP per sprint)
```

**Example**:
```
Sprint 1: 32 planned, 32 completed → 100%
Sprint 2: 32 planned, 26 completed → 81%
Sprint 3: 32 planned, 10 completed → 31% (Week 1 only, not counted)

Average velocity = (32 + 26) / 2 = 29 SP/sprint
```

**Velocity Trend**:
- **Increasing**: Team getting faster (learning curve)
- **Stable**: Consistent delivery
- **Decreasing**: Technical debt, blockers, team issues

### Compare to Planned Velocity:

```
Planned Velocity: 44 SP/sprint (team capacity)
Actual Velocity: 29 SP/sprint
Velocity Ratio: 29 / 44 = 66% (delivering 66% of capacity)
```

---

## STEP 4: Identify Blockers

### Scan for BLOCKED Tasks:

```markdown
### Task 2.3: API Foundation [BLOCKED]
**Blockers**: Waiting for backend team to deploy staging API
```

### Analyze Blocker Impact:

For each blocker:
1. **What tasks depend on this?** (check "Blocks" field)
2. **Critical path impact?** (is this on critical path?)
3. **Sprint impact?** (will current sprint be delayed?)
4. **Workaround available?** (can we mock/stub?)

**Example**:
```
Blocker: Task 2.3 API Foundation (2 weeks)
Blocks: Task 2.4, Task 2.5, Task 3.1 (3 tasks, 26 SP)
Critical Path: YES (on critical path)
Sprint Impact: Sprint 2 delayed by 1 week
Workaround: Use mock API for UI development (partial mitigation)
```

---

## STEP 5: Identify Risks and Delays

### Tasks Behind Schedule:

Tasks marked IN_PROGRESS with:
- **Actual > Estimated**: Taking longer than expected
- **Status = IN_PROGRESS for >1 week**: Potentially stuck

**Example**:
```
Task 2.2: Dashboard - Data Layer [IN_PROGRESS]
Estimated: 6 hours
Actual: 10 hours (67% over estimate)
Status: IN_PROGRESS for 5 days
Risk: HIGH (team member may need help)
```

### Sprint Health:

For current sprint:
- **On track**: >80% velocity
- **At risk**: 60-80% velocity
- **Behind**: <60% velocity

---

## STEP 6: Recalculate Sprint Allocations

### Algorithm:

1. **Use actual velocity** for remaining sprints (not planned)
2. **Respect dependencies** (don't move tasks before their dependencies)
3. **Balance workload** across team members
4. **Add buffer** (20% for unknowns)

**Example**:
```
Remaining work: 192 SP
Actual velocity: 29 SP/sprint
Sprints needed: 192 / 29 = 6.6 → 7 sprints
```

### Re-allocate Tasks:

For each remaining sprint:
1. Start with tasks on **critical path**
2. Fill remaining capacity with **parallel tasks**
3. Ensure each owner has balanced workload
4. Mark dependencies as blockers if not ready

**Example**:
```
Sprint 4 (revised):
  - Task 3.1: API Consumer (13 SP) - Carol [was blocked, now unblocked]
  - Task 3.2: Dashboard Widgets (8 SP) - Dave
  - Task 3.3: Notifications (5 SP) - Eve
  - Buffer: 3 SP (20%)
  Total: 29 SP (matches actual velocity)
```

---

## STEP 7: Adjust Timeline Forecast

### Original Forecast:
```
8 sprints (16 weeks) at 44 SP/sprint
Total: 320 SP
```

### Revised Forecast:
```
11 sprints (22 weeks) at 29 SP/sprint
Total: 320 SP
Delay: 6 weeks
```

### Delay Analysis:

```
Original Timeline: 16 weeks
Revised Timeline: 22 weeks
Delay: 6 weeks (38% increase)

Causes:
1. Lower than expected velocity (29 vs 44 SP)
2. Backend API blocker (1 week delay)
3. Task 2.2 complexity underestimated (4 hours over)
```

### Recommendation:

If delay unacceptable:
1. **Reduce scope**: Cut P2/P3 features (save 40 SP → 10 sprints)
2. **Increase team**: Add 1 senior dev (velocity +8 SP → 9 sprints)
3. **Work overtime**: 10% capacity increase (velocity +3 SP → 10 sprints)
4. **Defer polish**: Move non-critical tasks post-launch

---

## STEP 8: Update Progress Dashboard

### Update Metadata:

```markdown
## Metadata
- **Generated**: 2025-01-15
- **Last Updated**: 2025-02-05 (updated after Sprint 2)
- **Team Size**: 7 developers (2 senior, 4 mid, 1 junior)
- **Sprint Duration**: 2 weeks
- **Planned Velocity**: 44 story points/sprint (team capacity)
- **Actual Velocity**: 29 SP/sprint (average last 2 sprints)
- **Total Tasks**: 87
- **Total Story Points**: 320
- **Original Duration**: 8 sprints (16 weeks)
- **Revised Duration**: 11 sprints (22 weeks)
- **Delay**: 6 weeks (38% behind schedule)
```

### Update Progress Bars:

```markdown
## Progress Dashboard
Sprint 1: ██████████ 100% (32/32 SP) ✅
Sprint 2: ████████░░ 81% (26/32 SP) ✅ (completed)
Sprint 3: ███░░░░░░░ 30% (10/32 SP) ⏳ (Week 1, in progress)
Sprint 4: ░░░░░░░░░░ 0% (0/29 SP) - REVISED allocation
Sprint 5-11: ░░░░░░░░░░ 0% - REVISED timeline

Overall: ████░░░░░░ 40% (128/320 SP completed)
```

### Update Burndown:

```markdown
## Burndown Chart Data
| Sprint | Planned | Completed | Remaining | Trend |
|--------|---------|-----------|-----------|-------|
| Sprint 1 | 32 | 32 | 288 | ✅ On track |
| Sprint 2 | 32 | 26 | 262 | ⚠️ Slight delay |
| Sprint 3 | 32 | 10 | 252 (Week 1) | 🚨 Behind |
| Sprint 4 | 29 (revised) | 0 | 252 | - |
| Sprint 5 | 29 (revised) | 0 | 223 (forecast) | - |

**Trend**: 🚨 Behind schedule (6 weeks delay projected)
**Original Forecast**: 8 sprints (16 weeks)
**Revised Forecast**: 11 sprints (22 weeks)
**Velocity**: 29 SP/sprint (actual) vs 44 SP/sprint (planned)
```

---

## STEP 9: Update Risk Register

Add new risks discovered during this sprint:

```markdown
## Risk Register

| Task ID | Risk Level | Risk Description | Mitigation | Status |
|---------|------------|------------------|------------|--------|
| 2.3 | HIGH | Backend API delay (1 week) | Use mock API for UI dev | MITIGATED |
| 2.2 | MEDIUM | Complexity underestimated | Pair programming with Bob | IN_PROGRESS |
| NEW | HIGH | Velocity lower than planned (66%) | Reduce scope or extend timeline | OPEN |
```

---

## STEP 10: Add Recommendations Section

Based on analysis, add recommendations:

```markdown
## Recommendations (Generated 2025-02-05)

### 🚨 Critical Issues:
1. **Velocity Gap**: Delivering 29 SP/sprint vs 44 planned (66% capacity)
   - **Cause**: Junior dev learning curve, complexity underestimated
   - **Action**: Increase pairing, refine estimates in next sprint planning

2. **Backend Blocker**: API Foundation delayed 1 week
   - **Impact**: 3 tasks blocked (26 SP), critical path affected
   - **Action**: Switch to mock API for UI work, request backend prioritization

### ⚠️ Timeline Impact:
- **Original**: 16 weeks (8 sprints)
- **Revised**: 22 weeks (11 sprints)
- **Delay**: 6 weeks (38% increase)

### Options to Recover:
1. **Reduce Scope** (Recommended)
   - Cut 2 P2 features (40 SP)
   - New timeline: 10 sprints (20 weeks)
   - Delay reduced to 4 weeks

2. **Add Resources**
   - Hire 1 senior developer
   - Velocity increases to 37 SP/sprint
   - New timeline: 9 sprints (18 weeks)

3. **Extend Timeline**
   - Accept 11-sprint timeline
   - Communicate delay to stakeholders
   - No scope reduction

### Next Steps:
1. Discuss options with Product Manager
2. Review Sprint 3 velocity (Week 2) to confirm trend
3. Update stakeholder review with revised timeline
4. Run `claude update-plan` again after Sprint 3 completes
```

---

## STEP 11: Update Sprint Sections

For each sprint, update:
- SP allocations (use actual velocity)
- Task assignments (rebalance based on progress)
- Status markers ([COMPLETED], [IN_PROGRESS], [TODO])

**Example**:
```markdown
## Sprint 4: Advanced Features (Week 7-8) - 29 SP [TODO] - REVISED

### Task 3.1: API Consumer - Dashboard Data [TODO]
**Owner**: Carol (Mid) | **Story Points**: 13 | **Risk**: MEDIUM
**Was**: BLOCKED (waiting for API)
**Now**: UNBLOCKED (API deployed 2025-02-01)
**Estimated**: 10 hours
**PRPROMPTS**: @PRPROMPTS/04-api_integration.md
**Dependencies**: Task 2.3 (DONE - unblocked 2025-02-01)

[Full task detail remains...]

### Task 3.2: Dashboard Widgets [TODO]
**Owner**: Dave (Mid) | **Story Points**: 8 | **Risk**: LOW
**Moved from**: Sprint 3 (capacity available)
**Estimated**: 6 hours

[Full task detail...]
```

---

## STEP 12: Save Updated Plan

Overwrite `docs/IMPLEMENTATION_PLAN.md` with updated content.

**Ensure**:
- All metadata updated
- Progress bars reflect actual status
- Burndown chart has new data
- Recommendations section added
- Sprint allocations revised
- Task statuses current

---

## STEP 13: Show Summary

Display update summary:

```
✅ Implementation Plan Updated

📄 File: docs/IMPLEMENTATION_PLAN.md
🔄 Updated: 2025-02-05 (after Sprint 2 complete)

📊 Progress:
   Completed: 58 / 320 SP (18%)
   Sprints Done: 2 / 11 (revised from 8)
   Velocity: 29 SP/sprint (actual) vs 44 (planned)

📈 Velocity Analysis:
   Sprint 1: 32 SP (100%)
   Sprint 2: 26 SP (81%)
   Average: 29 SP/sprint
   Trend: Decreasing (team learning curve)

🚨 Blockers:
   Task 2.3: API Foundation (RESOLVED 2025-02-01)
   Affected Tasks: 3 tasks (26 SP) now unblocked

⏱️  Timeline:
   Original: 16 weeks (8 sprints)
   Revised: 22 weeks (11 sprints)
   Delay: 6 weeks (38% behind)

💡 Recommendations:
   1. Reduce scope (cut 2 P2 features) → 20 weeks
   2. Add 1 senior dev → 18 weeks
   3. Accept 22-week timeline

🔮 Forecast:
   At current velocity (29 SP/sprint):
   - Sprint 3-11: 9 sprints remaining
   - Completion: Week 22 (2025-06-30)

🚀 Next Actions:
   1. Review with Product Manager (timeline discussion)
   2. Complete Sprint 3 (Week 5-6)
   3. Run /update-plan again after Sprint 3
   4. Consider scope reduction or resource addition
```

---

## Example: Before vs After

### Before (Initial Plan):
```
Total SP: 320
Planned Velocity: 44 SP/sprint
Sprints: 8 (16 weeks)
Completion: 2025-05-15
```

### After (Updated Plan):
```
Total SP: 320
Actual Velocity: 29 SP/sprint
Sprints: 11 (22 weeks)
Completion: 2025-06-30
Delay: 6 weeks
Reason: Lower velocity (66% capacity) + 1 week blocker
```

---

## Frequency

Run this command:
- **After each sprint completes** (every 2 weeks)
- **When major blocker resolved** (e.g., API deployed)
- **When significant delay detected** (task >2x estimate)
- **When team composition changes** (member added/removed)

---

## Notes

- This command is **read-heavy** (analyzes current state)
- It **recalculates** based on actual data, not assumptions
- Use `/generate-implementation-plan` for fresh plan, `/update-plan` for revision
- Velocity trends become reliable after 2-3 sprints
- Always discuss timeline changes with stakeholders before committing
