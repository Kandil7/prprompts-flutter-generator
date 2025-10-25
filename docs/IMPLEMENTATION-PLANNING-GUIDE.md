# Implementation Planning Guide

**Version 2.0** - Intelligent, Adaptive Implementation Planning with Sprints & Velocity Tracking

Comprehensive guide to using PRPROMPTS implementation planning system for predictable, trackable Flutter development.

---

## Overview

PRPROMPTS v4.1+ includes an intelligent implementation planning system that transforms PRDs into detailed, trackable project plans with:

✅ **Sprint Planning** - 2-week iterations with velocity-based allocation
✅ **Dependency Analysis** - Critical path visualization, task ordering
✅ **Team Allocation** - Skill-based assignment (senior/mid/junior)
✅ **Risk Assessment** - HIPAA/PCI-DSS tasks flagged with security checklists
✅ **Progress Tracking** - TODO/IN_PROGRESS/BLOCKED/DONE states
✅ **Velocity Tracking** - Actual vs estimated time, burndown charts
✅ **Adaptive Re-planning** - Adjust sprints based on actual progress

---

## Quick Start

```bash
# 1. Create PRD
claude create-prd

# 2. (Optional) Run strategic planning
claude analyze-dependencies  # Creates FEATURE_DEPENDENCIES.md
claude estimate-cost         # Creates COST_ESTIMATE.md

# 3. Generate implementation plan
claude generate-implementation-plan

# 4. Review plan
cat docs/IMPLEMENTATION_PLAN.md

# 5. Start development
claude bootstrap-from-prprompts  # Uses the plan automatically
claude implement-next            # Implements Task 1.1
claude implement-next            # Implements Task 1.2
# ... or use full-cycle for automation

# 6. Update plan after each sprint
claude update-plan  # Re-plan based on actual velocity
```

---

## Commands

### 1. `generate-implementation-plan`

**Purpose**: Create intelligent implementation plan from PRD

**Usage**:
```bash
claude generate-implementation-plan
```

**Inputs**:
- `docs/PRD.md` (required)
- `docs/FEATURE_DEPENDENCIES.md` (optional, enhances intelligence)
- `docs/COST_ESTIMATE.md` (optional, improves time estimates)

**Output**: `docs/IMPLEMENTATION_PLAN.md` (850+ lines)

**What It Generates**:
- Metadata (team, velocity, timeline)
- Progress dashboard with burndown data
- Critical path visualization
- Team allocation by skill level
- Risk register for compliance tasks
- Sprint breakdown (2-week iterations)
- Detailed tasks with:
  - Code snippets
  - Test scenarios
  - Security checklists
  - Acceptance criteria
  - Dependencies and blockers

**Example**:
```markdown
## Sprint 1: Foundation (Week 1-2) - 32 SP

### Task 1.1: Clean Architecture Setup [TODO]
**Owner**: Bob (Senior) | **Story Points**: 3 | **Risk**: LOW
**Estimated**: 2 hours
**PRPROMPTS**: @PRPROMPTS/01-feature_scaffold.md
**Dependencies**: None

**Code Snippet - errors/failures.dart**:
```dart
abstract class Failure extends Equatable {
  final String message;
  const Failure(this.message);
  // ...
}
```
```

---

### 2. `update-plan`

**Purpose**: Re-plan based on actual progress and velocity

**Usage**:
```bash
claude update-plan
```

**When to Run**:
- After each sprint completes (every 2 weeks)
- When major blocker resolved
- When significant delay detected
- When team composition changes

**What It Does**:
1. Calculates actual velocity from completed sprints
2. Identifies blockers and delays
3. Re-allocates tasks to sprints
4. Updates timeline forecast
5. Adds recommendations (scope reduction, resource addition)

**Example Output**:
```
✅ Implementation Plan Updated

📊 Progress: 128/320 SP (40%)
📈 Velocity: 29 SP/sprint (actual) vs 44 (planned)
⏱️  Timeline: 22 weeks (revised) vs 16 weeks (original)
🚨 Delay: 6 weeks

💡 Recommendations:
1. Reduce scope (cut 2 P2 features) → 20 weeks
2. Add 1 senior dev → 18 weeks
3. Accept 22-week timeline
```

---

## Planning Workflow

### Step 1: Create PRD

Start with a comprehensive PRD:

```bash
# Option 1: Interactive wizard with templates
claude create-prd

# Option 2: Auto from description
echo "Healthcare app with HIPAA compliance..." > project_description.md
claude auto-gen-prd

# Option 3: From existing docs
claude prd-from-files
```

**Tip**: Include all features, even P2/P3. The plan will prioritize P0/P1.

---

### Step 2: Strategic Planning (Optional but Recommended)

Enhance plan intelligence with dependency and cost analysis:

```bash
# Analyze feature dependencies
claude analyze-dependencies
# Creates: docs/FEATURE_DEPENDENCIES.md
# Contains: dependency graph, critical path, implementation phases

# Estimate costs
claude estimate-cost
# Creates: docs/COST_ESTIMATE.md
# Contains: time estimates, team breakdown, risk buffers
```

**Why?**
- **Dependencies**: Ensures tasks ordered correctly (no blocked work)
- **Cost Estimates**: More accurate time allocations per task
- **Result**: 30-40% more accurate planning

---

### Step 3: Generate Implementation Plan

Create the master plan:

```bash
claude generate-implementation-plan
```

**What Happens**:
1. Reads PRD features
2. Loads FEATURE_DEPENDENCIES (if exists) for critical path
3. Loads COST_ESTIMATE (if exists) for time estimates
4. Calculates team velocity from PRD team_composition
5. Allocates features to 2-week sprints
6. Generates detailed tasks with code snippets
7. Creates progress tracking metadata

**Output**: `docs/IMPLEMENTATION_PLAN.md`

---

### Step 4: Review & Adjust Plan

Open the generated plan:

```bash
cat docs/IMPLEMENTATION_PLAN.md
# Or in your editor
code docs/IMPLEMENTATION_PLAN.md
```

**Review Checklist**:
- [ ] Sprint allocations realistic?
- [ ] Team assignments match skills?
- [ ] High-risk tasks have security checklists?
- [ ] Critical path makes sense?
- [ ] Timeline acceptable?

**Adjustments**:
- Manual edits allowed (plan is yours!)
- Re-run `generate-implementation-plan` to regenerate
- Use `update-plan` later for adaptive changes

---

### Step 5: Start Development

Use the plan with automation:

```bash
# Bootstrap project (uses plan automatically)
claude bootstrap-from-prprompts

# Implement tasks one by one
claude implement-next  # Task 1.1
claude implement-next  # Task 1.2

# OR auto-implement multiple tasks
claude full-cycle 10  # Implements 10 tasks automatically
```

**`implement-next` Features**:
- Marks task [IN_PROGRESS] before starting
- Checks dependencies (skips if blocked)
- Tracks actual time vs estimated
- Updates sprint progress in real-time
- Handles blockers automatically
- Shows velocity comparison

---

### Step 6: Track Progress

As tasks complete, the plan updates automatically:

**Task States**:
- `[TODO]` - Not started
- `[IN_PROGRESS]` - Currently working (prevents conflicts)
- `[BLOCKED]` - Waiting on dependency
- `[DONE]` - Completed, validated, committed

**Progress Dashboard** (auto-updated):
```markdown
Sprint 1: ██████████ 100% (32/32 SP) ✅
Sprint 2: ████████░░ 81% (26/32 SP) ⏳
Overall: ████░░░░░░ 40% (128/320 SP)
```

**Velocity Tracking** (auto-updated):
```markdown
| Sprint | Planned | Completed | Velocity |
|--------|---------|-----------|----------|
| Sprint 1 | 32 | 32 | 100% |
| Sprint 2 | 32 | 26 | 81% |
Average: 29 SP/sprint
```

---

### Step 7: Re-plan After Each Sprint

Every 2 weeks, update the plan:

```bash
claude update-plan
```

**Updates**:
- Recalculates velocity from completed sprints
- Adjusts remaining sprint allocations
- Updates timeline forecast
- Identifies at-risk sprints
- Recommends scope/resource changes

---

## Advanced Features

### Sprint Planning

**2-Week Iterations**:
- Sprint 1: Foundation (setup, architecture)
- Sprint 2: Core Features (P0 features)
- Sprint 3-N: Feature Implementation
- Final Sprint: Polish & Launch

**Velocity-Based Allocation**:
```
Team: 2 senior, 4 mid, 1 junior
Velocity: 44 SP/sprint (capacity)

Sprint allocation:
- Fill with critical path tasks first
- Add parallel tasks to remaining capacity
- Leave 20% buffer for unknowns
```

---

### Team Allocation

Tasks assigned by skill level:

**Senior Developers**:
- Authentication, security
- Payment integration
- Complex algorithms
- Architecture decisions

**Mid-Level Developers**:
- Feature scaffolding
- BLoC implementation
- API integration
- UI development

**Junior Developers**:
- Testing
- Documentation
- Bug fixes
- Code review support

---

### Risk Assessment

High-risk tasks flagged:

**HIPAA Compliance** (HIGH risk):
- Security checklist enforced
- Encryption requirements
- Audit logging
- Code review mandatory

**PCI-DSS Compliance** (CRITICAL risk):
- NO card storage
- Tokenization required
- Security audit before launch

**New Technology** (MEDIUM risk):
- Spike recommended
- Extra buffer time (+ 20%)

---

### Dependency Management

**Critical Path**:
Longest sequence of dependent tasks:
```
User Auth (2 weeks) →
Database (1 week) →
API Foundation (2 weeks) →
Payment (2 weeks) →
Checkout (2 weeks)

Total: 9 weeks (longest path)
```

**Parallel Work**:
Tasks with no dependencies can run concurrently:
```
Stream 1: Auth → Profile → Settings
Stream 2: Design System → Components → Polish
Stream 3: Analytics → Error Tracking
```

---

### Velocity Tracking

**Formula**:
```
Velocity = Average(Completed SP per sprint)
```

**Example**:
```
Sprint 1: 32/32 SP (100%)
Sprint 2: 26/32 SP (81%)
Sprint 3: 30/32 SP (94%)

Average Velocity: (32+26+30)/3 = 29 SP/sprint
```

**Trend Analysis**:
- **Increasing**: Team learning, getting faster
- **Stable**: Consistent delivery (good!)
- **Decreasing**: Technical debt, blockers, investigate

---

## Best Practices

### 1. Run Strategic Planning First

```bash
claude analyze-dependencies  # Before generate-implementation-plan
claude estimate-cost        # Before generate-implementation-plan
```

**Result**: 30-40% more accurate plans

---

### 2. Update Plan After Each Sprint

```bash
# Every 2 weeks
claude update-plan
```

**Result**: Timeline stays accurate, proactive scope adjustments

---

### 3. Mark Tasks IN_PROGRESS

Prevents team conflicts:
```bash
claude implement-next  # Auto-marks IN_PROGRESS
```

Team sees: "Carol is working on Task 2.1"

---

### 4. Track Actual Time

Improves future estimates:
```markdown
Task 2.1:
Estimated: 6 hours
Actual: 4 hours (33% faster)
→ Future similar tasks: adjust to 4 hours
```

---

### 5. Handle Blockers Immediately

Don't wait:
```bash
# Task blocked? Work on parallel task instead
claude implement-next  # Auto-skips to next available task
```

Document blocker:
```markdown
### Task 2.3 [BLOCKED]
Blocker: Backend API /users not deployed
Expected: 2025-02-06
Workaround: Using mock API for UI work
```

---

## Troubleshooting

### Plan Too Long

**Problem**: Timeline is 24 weeks, but need 16 weeks

**Solutions**:
1. **Reduce scope**: Cut P2/P3 features
   ```bash
   # Edit PRD.md, remove low-priority features
   claude generate-implementation-plan  # Regenerate
   ```

2. **Increase team**: Add developers
   ```bash
   # Edit PRD.md: team_size: "11-25" (was "5-10")
   claude generate-implementation-plan
   ```

3. **Adjust estimates**: If over-estimated
   ```bash
   claude update-plan  # Will adjust based on actual velocity
   ```

---

### Velocity Lower Than Expected

**Problem**: Planned 44 SP/sprint, delivering 29 SP/sprint

**Causes**:
- Junior-heavy team (need more training)
- Complexity underestimated
- Blockers (backend delays)
- Technical debt

**Solutions**:
1. **Pairing**: Senior + Junior on complex tasks
2. **Refine estimates**: Use actual data
3. **Remove blockers**: Prioritize unblocking work
4. **Reduce scope**: Match velocity reality

---

### Tasks Frequently Blocked

**Problem**: 30% of tasks blocked on backend

**Solutions**:
1. **Parallel UI work**: Use mocks
2. **Backend prioritization**: Request API focus
3. **Reorder tasks**: Do independent tasks first
4. **Document blockers**: Track in Risk Register

```bash
claude update-plan  # Will suggest task reordering
```

---

## FAQs

### Q: Can I edit the generated plan manually?

**A**: Yes! The plan is yours to modify. But:
- Re-running `generate-implementation-plan` overwrites
- Use `update-plan` for adaptive changes (preserves manual edits to tasks)

---

### Q: How accurate are the estimates?

**A**:
- **Without strategic planning**: ±40% accuracy
- **With FEATURE_DEPENDENCIES + COST_ESTIMATE**: ±20% accuracy
- **After 2-3 sprints + update-plan**: ±10% accuracy (velocity-based)

---

### Q: What if my team changes mid-project?

**A**:
```bash
# Edit PRD.md: team_size, team_composition
claude update-plan  # Re-calculates velocity and sprint allocations
```

---

### Q: Can I use this for non-Flutter projects?

**A**: Partially. The planning logic works for any project, but:
- PRPROMPTS references are Flutter-specific
- Code snippets are Dart/Flutter
- Use for planning, adapt implementation details

---

## Summary

**Workflow**:
1. Create PRD → `claude create-prd`
2. (Optional) Strategic planning → `claude analyze-dependencies`, `claude estimate-cost`
3. Generate plan → `claude generate-implementation-plan`
4. Review plan → `cat docs/IMPLEMENTATION_PLAN.md`
5. Start development → `claude bootstrap-from-prprompts`, `claude implement-next`
6. Update every 2 weeks → `claude update-plan`

**Key Benefits**:
- ✅ Predictable timelines (±10% after 2-3 sprints)
- ✅ Trackable progress (real-time burndown)
- ✅ Risk awareness (HIPAA/PCI-DSS flagged)
- ✅ Team coordination (clear ownership)
- ✅ Adaptive planning (adjust to reality)

**Learn More**:
- `CLAUDE.md` - Developer guide
- `docs/AUTOMATION-GUIDE.md` - Full automation workflow
- `README.md` - Project overview
