# Automation Orchestrator - Complete Guide

> **Orchestrate implementation of 1-10 Flutter features in 50-100 minutes**
>
> Automates multi-feature implementation with dependency management, error recovery, and atomic commits.

---

## Quick Start

### Prerequisites

1. **Flutter Bootstrapper** completed
2. **IMPLEMENTATION_PLAN.md** with multiple features
3. **Git repository** clean (no uncommitted changes)

### Basic Usage

```bash
# Implement all features (auto mode)
@claude use skill automation/automation-orchestrator

# When prompted:
# - feature_count: 10 (or press Enter for all)
# - auto_commit: true (yes to auto-commit each feature)
```

### What Gets Created

For a plan with 5 features:

```
50-100 minutes later...

✅ Feature 1: Authentication (25 files, 82% coverage) - Committed
✅ Feature 2: User Profile (20 files, 78% coverage) - Committed
✅ Feature 3: Product Catalog (28 files, 75% coverage) - Committed
✅ Feature 4: Shopping Cart (22 files, 80% coverage) - Committed
✅ Feature 5: Order History (24 files, 77% coverage) - Committed

Total: 119 files, 5 commits, 78.4% average coverage
```

---

## For Junior Developers - ELI5

### What Does This Skill Do?

Think of this skill like a **construction project manager** building an entire neighborhood (your app):

**Without Orchestrator:**
- You build one house (feature) at a time
- You manually check "Did I finish the plumbing before installing toilets?"
- You forget which houses are done
- Takes weeks of careful tracking

**With Orchestrator:**
- Manager reads the blueprint (IMPLEMENTATION_PLAN.md)
- Figures out build order: "Foundation before walls, walls before roof"
- Builds all houses automatically in the right order
- Takes 50-100 minutes, fully automated

### Real Example

**Your IMPLEMENTATION_PLAN.md says:**

```markdown
### Feature 1: User Login
Dependencies: None

### Feature 2: User Profile
Dependencies: User Login (need to be logged in to see profile)

### Feature 3: Settings
Dependencies: None
```

**Orchestrator thinks:**
```
Feature 1 (Login) has no dependencies → Build first
Feature 3 (Settings) has no dependencies → Can build anytime
Feature 2 (Profile) needs Login → Build after Feature 1

Execution Order:
1. Feature 1: Login
2. Feature 3: Settings (while waiting for Login, but runs after)
3. Feature 2: Profile (after Login complete)
```

**Result:** All 3 features implemented correctly in dependency order!

### Key Concepts

#### 1. Dependency Graph

**What it is:** A map showing which features need other features

**Analogy:** Making a sandwich
- You can't add toppings before bread (bread = dependency)
- You can toast bread while cutting vegetables (parallel work)
- You must finish all steps before eating (final validation)

**In Flutter:**
```
Authentication (Feature 1)
├── User Profile (Feature 2) - needs Authentication
└── Shopping Cart (Feature 4) - needs Authentication

Product Catalog (Feature 3)
└── Shopping Cart (Feature 4) - also needs Catalog

Settings (Feature 5)
```

**Orchestrator order:**
1. Authentication (no dependencies)
2. Product Catalog (no dependencies)
3. Settings (no dependencies)
4. User Profile (Auth ready)
5. Shopping Cart (Auth + Catalog ready)

#### 2. Circular Dependencies (The Problem)

**Bad example:**
```
Feature A depends on Feature B
Feature B depends on Feature A
```

**Why it's impossible:**
- Can't build A until B is done
- Can't build B until A is done
- Infinite loop! 🔄

**Orchestrator will detect this and tell you:**
```
❌ Circular dependency detected:
Feature A → Feature B → Feature A

Fix: Remove one dependency
```

#### 3. Auto-Commit

**What it is:** Automatically save (commit) each feature after it's done

**Why it's useful:**
- If Feature 5 fails, Features 1-4 are already saved
- Easy to see progress: 1 commit = 1 feature
- Can roll back individual features if needed

**Git log after orchestration:**
```
feat(order-history): implement order history feature
feat(shopping-cart): implement shopping cart feature
feat(product-catalog): implement product catalog feature
feat(user-profile): implement user profile feature
feat(authentication): implement authentication feature
```

Clean! One commit per feature.

#### 4. Error Recovery

**What happens if Feature 3 fails?**

**Without orchestrator:**
- You manually debug Feature 3
- Forget where you were
- Have to restart from Feature 1

**With orchestrator:**
```
✅ Feature 1: Success
✅ Feature 2: Success
❌ Feature 3: Failed (error: missing API endpoint)
⏭️  Feature 4: Skipped (depends on Feature 3)
✅ Feature 5: Success (no dependencies)

Report saved. Fix Feature 3 and resume:
@claude use skill automation/automation-orchestrator
Input: start_from_index: 2
```

**Resume where you left off!**

### Step-by-Step Usage

**Step 1: Create IMPLEMENTATION_PLAN.md**

```markdown
# Implementation Plan

### Feature 1: User Login
**Priority:** HIGH
**Dependencies:** None
**Requirements:**
- Email/password login
- JWT tokens
...

### Feature 2: User Profile
**Priority:** HIGH
**Dependencies:** User Login
**Requirements:**
- View profile
- Edit profile
...
```

**Step 2: Run orchestrator**

```bash
@claude use skill automation/automation-orchestrator
```

**Step 3: Answer questions**

```
How many features? (default: all 10)
→ Type: 5 (or press Enter for all)

Auto-commit each feature? (default: yes)
→ Type: yes (or press Enter)

Stop on first failure? (default: no)
→ Type: no (keep going even if one fails)
```

**Step 4: Wait (50-100 minutes)**

```
[██████████------------------] 50% complete
Implementing Feature 3 of 5...
```

**Step 5: Review report**

```bash
cat docs/ORCHESTRATION_REPORT_2025-10-24.md
```

**Step 6: Push to GitHub**

```bash
git push origin master
```

Done! All features implemented, tested, and committed.

### Common Mistakes

#### 1. Running before bootstrapper

```bash
# ❌ WRONG
@claude use skill automation/automation-orchestrator
ERROR: lib/core/ directory not found

# ✅ CORRECT
@claude use skill automation/flutter-bootstrapper  # First!
@claude use skill automation/automation-orchestrator  # Then!
```

#### 2. Uncommitted changes

```bash
# ❌ WRONG
# You have uncommitted files
@claude use skill automation/automation-orchestrator
ERROR: Git repository not clean

# ✅ CORRECT
git add .
git commit -m "WIP: save progress"
@claude use skill automation/automation-orchestrator
```

#### 3. Missing dependencies in IMPLEMENTATION_PLAN.md

```markdown
# ❌ WRONG
### Feature 2: User Profile
Dependencies: None  ← WRONG! Needs Authentication

# ✅ CORRECT
### Feature 2: User Profile
Dependencies: User Login
```

**Why it matters:** Orchestrator will implement Profile before Login, causing errors.

---

## For Intermediate Developers

### Architecture

#### Execution Flow

```
1. Parse IMPLEMENTATION_PLAN.md
   ↓
2. Extract all features + dependencies
   ↓
3. Build dependency graph
   ↓
4. Topological sort (execution order)
   ↓
5. For each feature:
   ├─ Check dependencies met
   ├─ Invoke feature-implementer
   ├─ Validate (analyze, test, security)
   ├─ Create git commit
   └─ Update progress
   ↓
6. Generate orchestration report
   ↓
7. Post-validation (full test suite)
```

#### Dependency Resolution Algorithm

**Topological Sort (Kahn's Algorithm):**

```python
def topological_sort(features):
    # 1. Calculate in-degree for each feature
    in_degree = {}
    for feature in features:
        in_degree[feature] = len(feature.dependencies)

    # 2. Find features with no dependencies
    queue = [f for f in features if in_degree[f] == 0]
    result = []

    # 3. Process features in dependency order
    while queue:
        feature = queue.pop(0)
        result.append(feature)

        # Reduce in-degree for dependents
        for dependent in get_dependents(feature):
            in_degree[dependent] -= 1
            if in_degree[dependent] == 0:
                queue.append(dependent)

    # 4. Check for cycles
    if len(result) != len(features):
        raise CircularDependencyError()

    return result
```

**Example:**

```
Input Features:
- A: depends on []
- B: depends on [A]
- C: depends on [A]
- D: depends on [B, C]

Step 1: in_degree = {A: 0, B: 1, C: 1, D: 2}
Step 2: queue = [A] (only A has in_degree 0)
Step 3:
  - Process A → result = [A]
  - Reduce in_degree for B, C → {B: 0, C: 0, D: 2}
  - queue = [B, C]
  - Process B → result = [A, B]
  - Reduce in_degree for D → {D: 1}
  - Process C → result = [A, B, C]
  - Reduce in_degree for D → {D: 0}
  - queue = [D]
  - Process D → result = [A, B, C, D]

Output: [A, B, C, D]
```

#### Commit Strategy

**Atomic Commits:**

Each feature gets exactly 1 commit:

```bash
# Feature 1 commit
git add lib/features/auth test/features/auth
git commit -m "feat(auth): implement authentication feature"

# Feature 2 commit
git add lib/features/profile test/features/profile
git commit -m "feat(profile): implement user profile feature"
```

**Advantages:**
- Easy rollback: `git revert <commit-hash>`
- Clear history: 1 commit = 1 feature
- Bisect-friendly: Find bugs by feature
- PR-ready: Each commit is reviewable

**Commit Message Format:**

```
feat({{feature_slug}}): implement {{feature_name}} feature

- {{requirement_1}}
- {{requirement_2}}

Files created: {{count}}
Tests: {{test_count}} ({{coverage}}% coverage)
Dependencies: {{dependencies || "None"}}

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

#### Error Handling

**Failure Recovery:**

```typescript
enum FeatureStatus {
  PENDING,
  IN_PROGRESS,
  SUCCESS,
  FAILED,
  SKIPPED
}

interface FeatureResult {
  feature: Feature;
  status: FeatureStatus;
  error?: Error;
  filesCreated: number;
  testCount: number;
  coverage: number;
  commitHash?: string;
}

async function implementFeature(feature: Feature): Promise<FeatureResult> {
  try {
    // 1. Check dependencies
    if (!allDependenciesMet(feature)) {
      return { status: FeatureStatus.SKIPPED, ... };
    }

    // 2. Invoke feature-implementer
    const result = await featureImplementer.execute(feature);

    // 3. Validate
    const validation = await validate(result);
    if (!validation.passed) {
      throw new ValidationError(validation.errors);
    }

    // 4. Commit
    const commitHash = await git.commit(...);

    return { status: FeatureStatus.SUCCESS, commitHash, ... };

  } catch (error) {
    // Auto-fix attempts
    const fixAttempts = await attemptAutoFix(error);

    if (fixAttempts.success) {
      return { status: FeatureStatus.SUCCESS, ... };
    }

    // Retry logic
    if (error.isRetryable && retryCount < maxRetries) {
      return await implementFeature(feature); // Recursive retry
    }

    return { status: FeatureStatus.FAILED, error, ... };
  }
}
```

#### Progress Tracking

**Real-time Progress Updates:**

```typescript
class ProgressTracker {
  private features: Feature[];
  private results: FeatureResult[] = [];
  private startTime: Date;

  updateProgress(result: FeatureResult) {
    this.results.push(result);

    const completed = this.results.length;
    const total = this.features.length;
    const percentage = (completed / total) * 100;

    const elapsed = Date.now() - this.startTime;
    const avgTimePerFeature = elapsed / completed;
    const remaining = (total - completed) * avgTimePerFeature;

    console.log(`
      Progress: ${completed}/${total} (${percentage}%)
      Time elapsed: ${formatDuration(elapsed)}
      Estimated remaining: ${formatDuration(remaining)}

      Latest: ${result.feature.name} (${result.status})
    `);
  }

  generateReport(): OrchestrationReport {
    const successful = this.results.filter(r => r.status === FeatureStatus.SUCCESS);
    const failed = this.results.filter(r => r.status === FeatureStatus.FAILED);

    return {
      totalFeatures: this.features.length,
      successful: successful.length,
      failed: failed.length,
      totalFiles: sum(successful.map(r => r.filesCreated)),
      avgCoverage: avg(successful.map(r => r.coverage)),
      totalTime: Date.now() - this.startTime,
      commits: successful.map(r => r.commitHash),
    };
  }
}
```

### Advanced Usage

#### Scenario 1: Large Project (20+ Features)

**Problem:** 20 features = 3-4 hours of orchestration

**Solution:** Batch execution

```bash
# Day 1: Implement Phase 1 (Features 1-5)
@claude use skill automation/automation-orchestrator
Input:
  - start_from_index: 0
  - feature_count: 5

# Day 2: Implement Phase 2 (Features 6-10)
@claude use skill automation/automation-orchestrator
Input:
  - start_from_index: 5
  - feature_count: 5

# Day 3: Implement Phase 3 (Features 11-15)
@claude use skill automation/automation-orchestrator
Input:
  - start_from_index: 10
  - feature_count: 5
```

#### Scenario 2: Complex Dependencies

**IMPLEMENTATION_PLAN.md:**

```markdown
### Feature 1: Authentication
Dependencies: None

### Feature 2: User Profile
Dependencies: Authentication

### Feature 3: User Settings
Dependencies: Authentication, User Profile

### Feature 4: Notifications
Dependencies: Authentication

### Feature 5: In-App Messaging
Dependencies: Authentication, Notifications
```

**Dependency Graph:**

```
Authentication (1)
├── User Profile (2)
│   └── User Settings (3)
├── Notifications (4)
│   └── In-App Messaging (5)
```

**Execution Order:**

```
Round 1: Feature 1 (Authentication)
Round 2: Features 2 (Profile) & 4 (Notifications) - parallel candidates
Round 3: Feature 3 (Settings)
Round 4: Feature 5 (Messaging)
```

**Note:** Although Features 2 & 4 could run in parallel, orchestrator runs sequentially for safety.

#### Scenario 3: Failure Recovery

**Failure at Feature 3:**

```bash
# First run
@claude use skill automation/automation-orchestrator
Input: feature_count: 5

Result:
✅ Feature 1: Authentication
✅ Feature 2: User Profile
❌ Feature 3: Product Catalog (failed: missing API endpoint)
⏭️  Feature 4: Shopping Cart (skipped: depends on Product Catalog)
✅ Feature 5: Settings

# Fix API endpoint in IMPLEMENTATION_PLAN.md

# Resume from Feature 3
@claude use skill automation/automation-orchestrator
Input:
  - start_from_index: 2 (Feature 3)
  - feature_count: 2 (Features 3-4)

Result:
✅ Feature 3: Product Catalog (fixed!)
✅ Feature 4: Shopping Cart (dependencies met)
```

---

## For Senior Developers

### Orchestration Patterns

#### Pattern 1: Microservices-Style Features

**When:** Each feature is independent (e.g., microservices monorepo)

**IMPLEMENTATION_PLAN.md:**

```markdown
### Feature 1: User Service
Dependencies: None
Package: packages/user_service

### Feature 2: Product Service
Dependencies: None
Package: packages/product_service

### Feature 3: Order Service
Dependencies: User Service, Product Service
Package: packages/order_service
```

**Benefit:** Features 1 & 2 have no inter-dependencies, only Feature 3 needs coordination.

#### Pattern 2: Layer-First Development

**When:** You want to implement all data layers first, then presentation

**IMPLEMENTATION_PLAN.md:**

```markdown
### Feature 1: Auth Data Layer
Dependencies: None

### Feature 2: Profile Data Layer
Dependencies: Auth Data Layer

### Feature 3: Auth Presentation Layer
Dependencies: Auth Data Layer

### Feature 4: Profile Presentation Layer
Dependencies: Profile Data Layer, Auth Presentation Layer
```

**Benefit:** Data contracts stabilize before UI development begins.

### Performance Optimization

#### Optimization 1: Parallel Execution (Future Enhancement)

**Current:** Sequential execution
**Future:** Parallel execution for independent features

```typescript
// Pseudocode for parallel orchestration
async function orchestrateParallel(features: Feature[]) {
  const rounds = topologicalRounds(features); // Group by dependency level

  for (const round of rounds) {
    // All features in this round have no inter-dependencies
    await Promise.all(round.map(feature => implementFeature(feature)));
  }
}

// Example:
// Round 1: [Auth, Catalog, Settings] → Run in parallel (3x speedup)
// Round 2: [Profile, Cart] → Run in parallel (2x speedup)
// Round 3: [Order History] → Run alone
```

**Estimated Speedup:** 2-3x faster for projects with many independent features

#### Optimization 2: Incremental Compilation

**Problem:** Running `flutter analyze` after each feature is slow

**Solution:** Analyze only changed files

```bash
# Traditional
flutter analyze  # Analyzes entire project (~30s)

# Optimized
flutter analyze lib/features/{{feature_name}}  # Only new files (~5s)
```

**Savings:** 25s × 10 features = 4 minutes saved

#### Optimization 3: Test Sharding

**Problem:** Running full test suite after each feature

**Solution:** Run only new tests, full suite at end

```bash
# Per feature
flutter test test/features/{{feature_name}}  # ~30s

# Final validation
flutter test --coverage  # ~5 minutes (all tests)
```

**Savings:** 4.5 minutes × 9 features = 40 minutes saved

### CI/CD Integration

#### GitHub Actions Workflow

```yaml
name: Orchestrated Implementation

on:
  workflow_dispatch:
    inputs:
      feature_count:
        description: 'Number of features to implement'
        required: true
        default: '10'

jobs:
  orchestrate:
    runs-on: ubuntu-latest
    timeout-minutes: 180  # 3 hours max

    steps:
      - uses: actions/checkout@v3

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'

      - name: Install dependencies
        run: flutter pub get

      - name: Run orchestrator
        run: |
          claude use skill automation/automation-orchestrator <<EOF
          feature_count: ${{ github.event.inputs.feature_count }}
          auto_commit: true
          stop_on_failure: false
          EOF

      - name: Run tests
        run: flutter test --coverage

      - name: Upload orchestration report
        uses: actions/upload-artifact@v3
        with:
          name: orchestration-report
          path: docs/ORCHESTRATION_REPORT_*.md

      - name: Push commits
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git push origin ${{ github.ref }}
```

#### Monitoring & Alerting

**Datadog Integration:**

```typescript
import { datadogLogs } from '@datadog/browser-logs';

class OrchestrationMonitor {
  logFeatureStart(feature: Feature) {
    datadogLogs.logger.info('Feature implementation started', {
      feature_name: feature.name,
      feature_index: feature.index,
      dependencies: feature.dependencies,
    });
  }

  logFeatureComplete(result: FeatureResult) {
    datadogLogs.logger.info('Feature implementation completed', {
      feature_name: result.feature.name,
      status: result.status,
      files_created: result.filesCreated,
      coverage: result.coverage,
      duration_ms: result.duration,
    });
  }

  logFeatureFailure(result: FeatureResult) {
    datadogLogs.logger.error('Feature implementation failed', {
      feature_name: result.feature.name,
      error: result.error.message,
      stack_trace: result.error.stack,
    });

    // Trigger PagerDuty alert
    if (result.feature.priority === 'CRITICAL') {
      pagerDuty.trigger({
        severity: 'critical',
        summary: `Feature ${result.feature.name} failed`,
      });
    }
  }
}
```

### Security Considerations

#### Secret Management

**Problem:** API keys in IMPLEMENTATION_PLAN.md

**Solution:** Use environment variables

```markdown
### Feature 3: Payment Processing
**API Endpoints:**
- Stripe API: ${STRIPE_PUBLIC_KEY}
- Backend: ${API_BASE_URL}/payments
```

**In orchestrator:**

```typescript
function resolveSecrets(text: string): string {
  return text.replace(/\$\{(\w+)\}/g, (match, key) => {
    return process.env[key] || match;
  });
}
```

#### Sensitive Data in Commits

**Problem:** Accidentally committing secrets

**Solution:** Pre-commit hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for secrets
if git diff --cached | grep -i "api[_-]key\|secret\|password\|token" | grep -v "token_example"; then
  echo "❌ Potential secret detected in commit!"
  exit 1
fi
```

---

## Troubleshooting

### Issue 1: Orchestration Stops Unexpectedly

**Symptoms:**
- Orchestration stops after Feature 3
- No error message
- Last log: "Implementing Feature 3..."

**Causes:**
- Timeout (default: 1 hour per feature)
- Out of memory
- Network interruption

**Solution:**
```bash
# Check git log for last commit
git log --oneline -1

# Resume from next feature
@claude use skill automation/automation-orchestrator
Input:
  - start_from_index: 3 (next after last successful)
```

### Issue 2: Circular Dependency Not Detected

**Symptoms:**
- Orchestrator says "No circular dependencies"
- But features depend on each other
- Implementation fails

**Cause:** Typo in dependency name

```markdown
# IMPLEMENTATION_PLAN.md
### Feature 1: Authentication
### Feature 2: User Profile
Dependencies: Authentcation  ← Typo! Should be "Authentication"
```

**Solution:** Orchestrator sees "Authentcation" as different feature, no cycle detected. Fix typo.

### Issue 3: All Features Skipped

**Symptoms:**
```
⏭️  Feature 1: Skipped (missing dependency: Feature 0)
⏭️  Feature 2: Skipped (missing dependency: Feature 1)
...
```

**Cause:** `start_from_index` too high

```bash
# You have 10 features (indices 0-9)
# But you set:
start_from_index: 10  # Out of range!
```

**Solution:**
```bash
start_from_index: 0  # Start from beginning
```

---

## FAQ

**Q: Can I pause orchestration and resume later?**

A: Yes! Each feature is committed separately. Check last commit, then resume:

```bash
git log --oneline -1  # See last completed feature
@claude use skill automation/automation-orchestrator
Input: start_from_index: {{next_index}}
```

**Q: What happens if my computer crashes during orchestration?**

A: All completed features are committed. Resume from last commit:

```bash
git log  # Check completed features
@claude use skill automation/automation-orchestrator
Input: start_from_index: {{next_uncompleted}}
```

**Q: Can I run orchestrator on multiple branches simultaneously?**

A: Yes, but use different terminals:

```bash
# Terminal 1: Branch feature/auth
git checkout -b feature/auth
@claude use skill automation/automation-orchestrator
Input: start_from_index: 0, feature_count: 3

# Terminal 2: Branch feature/catalog
git checkout -b feature/catalog
@claude use skill automation/automation-orchestrator
Input: start_from_index: 5, feature_count: 3

# Merge later
git checkout main
git merge feature/auth
git merge feature/catalog
```

**Q: How do I handle feature updates (not new features)?**

A: Orchestrator is for NEW features. For updates, use `feature-implementer` directly:

```bash
@claude use skill automation/feature-implementer
Input: feature_name: "Authentication" (existing feature)
# It will overwrite old files
```

**Q: Can I customize commit messages?**

A: Not directly via input, but you can amend after:

```bash
# Orchestrator creates commit
git log -1 --format=%B  # View message

# Amend if needed
git commit --amend -m "feat(auth): custom message here"
```

---

## Additional Resources

- **PRPROMPTS Methodology:** See `docs/PRPROMPTS-SPECIFICATION.md`
- **Dependency Management:** See `docs/ARCHITECTURE.md`
- **feature-implementer Skill:** See `.claude/skills/automation/feature-implementer/README.md`
- **Error Recovery Guide:** See `docs/TROUBLESHOOTING.md`

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
**Skill Status:** ✅ Implemented
