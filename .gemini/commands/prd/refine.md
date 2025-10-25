---
name: Refine PRD
description: Interactively improve PRD quality through AI-guided analysis and refinement
author: PRD Refinement Engine
version: 1.0.0
tags: [prd, refinement, quality, iteration]
---

# Refine Product Requirements Document

## Overview
Analyze the existing PRD and guide the user through an iterative refinement process to improve completeness, clarity, feasibility, and security. This is an interactive loop that identifies weak areas and helps strengthen them through targeted questions and suggestions.

## Input File
Look for: `docs/PRD.md`

## Refinement Process

### Step 1: Initial Quality Assessment

Run comprehensive analysis on current PRD:

**Completeness Analysis (0-100%):**
- Required sections present: 15/15 sections
- YAML frontmatter completeness: All required fields
- Feature detail level: User stories, acceptance criteria, technical requirements
- Compliance documentation: Match compliance array
- Non-functional requirements: Performance, security, accessibility
- **Score Calculation:** (Present sections / Expected sections) × 100

**Clarity Analysis (0-100%):**
- Ambiguous language detection: "maybe", "possibly", "might", "could be"
- Measurable acceptance criteria: Quantified vs vague
- Clear priorities: P0/P1/P2 vs unclear
- Concrete timelines: Specific dates vs "soon", "later"
- Well-defined success metrics: SMART criteria
- **Score Calculation:** (Clear criteria / Total criteria) × 100

**Feasibility Analysis (0-100%):**
- Timeline vs complexity: Story points / available weeks
- Team size vs scope: Features / team members / weeks
- Technology maturity: Proven vs bleeding-edge
- Dependency risks: External APIs, third-party services
- Resource availability: Realistic team composition
- **Score Calculation:** Weighted average of sub-factors

**Security Analysis (0-100%):**
- Compliance coverage: Required vs specified standards
- Auth/AuthZ patterns: Complete implementation plan
- Data protection: Encryption at rest and in transit
- Audit logging: For sensitive data access
- Security testing: Pen testing, security reviews planned
- **Score Calculation:** (Security requirements met / Total requirements) × 100

**Calculate Overall Grade:**
- A (90-100%): Production-ready PRD
- B (80-89%): Strong PRD, minor improvements needed
- C (70-79%): Good foundation, significant improvements needed
- D (60-69%): Major gaps, substantial work required
- F (<60%): Not ready for PRPROMPTS generation

### Step 2: Present Assessment Results

Display results in this format:

```
═══════════════════════════════════════════════════════════
📊 PRD QUALITY ASSESSMENT
═══════════════════════════════════════════════════════════

Project: [project_name]
Type: [project_type]
Date: [today]

┌─────────────────────────────────────────────────────────┐
│ QUALITY SCORES                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Completeness:  [██████████████░░░░░] 70%              │
│  Clarity:       [████████████████░░░░] 85%              │
│  Feasibility:   [████████░░░░░░░░░░░░] 45%  ⚠️          │
│  Security:      [██████████████████░░] 92%              │
│                                                         │
│  ─────────────────────────────────────────────          │
│  OVERALL GRADE: C (73%)                                 │
│  Status: ⚠️  Significant improvements needed            │
└─────────────────────────────────────────────────────────┘

🔴 CRITICAL ISSUES (Must Fix):
  1. [Issue 1 with specific location]
  2. [Issue 2 with specific location]

⚠️  WARNINGS (Should Fix):
  1. [Warning 1]
  2. [Warning 2]
  3. [Warning 3]

💡 RECOMMENDATIONS (Nice to Have):
  1. [Recommendation 1]
  2. [Recommendation 2]

═══════════════════════════════════════════════════════════
```

### Step 3: Prioritized Improvement Areas

Identify top 3-5 areas for improvement, ranked by impact:

**Critical Issues** (blocks PRPROMPTS generation):
- Missing compliance requirements for specified standards
- Ambiguous acceptance criteria (>30% of features)
- Timeline/scope mismatch (>2x realistic estimate)
- Security gaps for sensitive data handling

**High-Impact Improvements:**
- Incomplete user stories (missing "so that" benefit)
- Vague success metrics (not SMART)
- Missing technical architecture details
- Unrealistic performance targets

**Medium-Impact Improvements:**
- Persona depth (demographics but no pain points/goals)
- Risk assessment incomplete
- Integration details missing
- Testing strategy not comprehensive

### Step 4: Interactive Refinement Loop

For each identified issue, guide user through improvement:

**Format:**
```
─────────────────────────────────────────────────────────
🔧 REFINEMENT 1/5: [Issue Name]

Current state:
  [Show problematic section from PRD]

Problem:
  [Explain what's wrong and why it matters]

Suggested improvements:
  Option A: [Specific suggestion with example]
  Option B: [Alternative approach]

Questions to clarify:
  1. [Targeted question to gather missing info]
  2. [Follow-up question]
  3. [Clarifying question]

─────────────────────────────────────────────────────────
```

**Ask user:**
1. Should I apply suggested improvements automatically?
2. Or would you like to answer clarifying questions first?
3. Or skip this refinement?

### Step 5: Apply Improvements

Based on user responses, update PRD sections:

**For automatic improvements:**
- Show before/after diff
- Explain rationale for changes
- Update affected sections

**For user-provided answers:**
- Synthesize answers into PRD updates
- Maintain consistency with existing content
- Add cross-references where needed

### Step 6: Re-assess Quality

After applying improvements, re-run quality assessment:

```
─────────────────────────────────────────────────────────
📈 IMPROVEMENT SUMMARY

         Before    After    Change
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Completeness:   70%  →   85%     +15%  ✅
Clarity:        85%  →   92%     +7%   ✅
Feasibility:    45%  →   78%     +33%  ✅✅
Security:       92%  →   95%     +3%   ✅

OVERALL:        C    →   B       73% → 88%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: ✅ Ready for PRPROMPTS generation

Refinements applied: 5
Issues resolved: 8
Warnings remaining: 2 (non-blocking)
─────────────────────────────────────────────────────────
```

### Step 7: Offer Next Actions

```
✅ PRD Refinement Complete

Your refined PRD is now at Grade B (88%).

Next steps:
1. Review changes: git diff docs/PRD.md
2. Further refinement: claude refine-prd (run again)
3. Validate readiness: claude analyze-prd
4. Generate PRPROMPTS: claude gen-prprompts

Would you like to:
  A) Review the changes in detail
  B) Run another refinement iteration
  C) Proceed to PRPROMPTS generation
  D) Save and exit
```

## Specific Refinement Strategies

### For Completeness Issues

**Missing User Stories:**
```
Current:
  Feature: User Authentication
  Description: Users can log in and register

Improved:
  Feature: User Authentication
  Description: Secure user authentication with multiple sign-in options

  User Stories:
  - As a new user, I want to register with email/password so that I can create an account quickly
  - As a returning user, I want to log in with biometrics so that I can access my account securely and conveniently
  - As a user concerned about security, I want 2FA so that my account is protected from unauthorized access

  Acceptance Criteria:
  - [ ] User can register with email/password in <30 seconds
  - [ ] User can enable biometric auth (Face ID/Touch ID/Fingerprint)
  - [ ] System enforces strong password policy (min 12 chars, mixed case, symbols)
  - [ ] 2FA is required for accounts with sensitive data access
  - [ ] Session expires after 15 minutes of inactivity
```

**Missing Compliance Sections:**
- Detect compliance array has ["hipaa", "pci-dss"] but PRD lacks Section 6
- Generate complete compliance section with specific requirements
- Add audit logging, encryption, access control details

### For Clarity Issues

**Ambiguous Acceptance Criteria:**
```
Vague:
  - [ ] App should be fast
  - [ ] Users should like the interface

Specific:
  - [ ] App cold start time <2 seconds on mid-range devices (iPhone 12, Pixel 5)
  - [ ] Frame rate maintains 60fps during scrolling
  - [ ] User satisfaction score ≥4.5/5 in beta testing (n≥50 users)
```

**Unmeasurable Success Metrics:**
```
Vague:
  - Improve user engagement
  - Reduce churn

SMART:
  - Increase daily active users (DAU) from baseline 10k to 15k (+50%) by Q2 2025
  - Reduce 30-day churn from 25% to <15% by end of beta
  - Achieve 10-minute average session duration (currently 6 minutes)
```

### For Feasibility Issues

**Timeline/Scope Mismatch:**
```
Problem detected:
  - Features: 12 (estimated 180 story points)
  - Team: 5 developers
  - Timeline: 3 months (12 weeks)
  - Capacity: 60 story points (5 devs × 12 weeks × 1 SP/dev/week)
  - Gap: 180 - 60 = 120 story points short (3x over-scoped)

Refinement options:
  Option A: Extend timeline to 9 months
  Option B: Increase team to 15 developers
  Option C: Reduce scope to 4 P0 features (60 story points)
  Option D: Hybrid - 6 months + 8 developers + 8 features

Recommendation: Option C (MVP approach)
  - Focus on P0 features for 3-month MVP
  - Plan P1/P2 features for subsequent releases
```

**Technology Risk:**
```
Detected:
  - Using bleeding-edge tech: "Flutter 3.28 (beta)", "New experimental state management"

Refinement:
  - Recommend stable versions: Flutter 3.24.0 (stable)
  - Suggest proven state management: BLoC (battle-tested)
  - Note: Bleeding-edge tech increases risk 2-3x
```

### For Security Issues

**Compliance Gaps:**
```
Project has compliance: ["hipaa"] but missing:
  - PHI encryption specification
  - Audit logging requirements
  - Access control details
  - Data retention policies
  - Breach notification procedures

Auto-add Section 6.1:
  ### 6.1 HIPAA Compliance

  **Security Rule Requirements:**
  - PHI Encryption: AES-256-GCM at rest, TLS 1.3 in transit
  - Access Controls: Role-based with MFA
  - Audit Logs: All PHI access logged with user, timestamp, action
  - Session Management: 15-minute timeout, re-authentication for sensitive operations

  **Privacy Rule Requirements:**
  - Minimum Necessary: Only required PHI fields accessed
  - Patient Rights: Access, amendment, accounting of disclosures
  - Business Associate Agreements: Required for all vendors

  **Breach Notification Rule:**
  - Detection: Real-time monitoring, alerting
  - Response: 60-day notification requirement
  - Documentation: Incident response plan, breach log
```

## Output

### Updated PRD File
Save improvements to: `docs/PRD.md`

### Refinement Report
Generate detailed report: `docs/PRD_REFINEMENT_REPORT.md`

**Report Contents:**
```markdown
# PRD Refinement Report

**Date:** [timestamp]
**Project:** [project_name]
**Iterations:** [count]

## Quality Improvement

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Completeness | 70% | 85% | +15% ✅ |
| Clarity | 85% | 92% | +7% ✅ |
| Feasibility | 45% | 78% | +33% ✅✅ |
| Security | 92% | 95% | +3% ✅ |
| **Overall** | **C (73%)** | **B (88%)** | **+15%** |

## Changes Applied

### 1. User Stories Enhancement
- **Section:** 4.1 User Authentication
- **Before:** 50 words, no acceptance criteria
- **After:** 250 words, 5 user stories, 8 acceptance criteria
- **Impact:** Clarity +15%

### 2. Timeline Adjustment
- **Section:** 9. Timeline & Milestones
- **Before:** 3 months for 180 SP
- **After:** 9 months phased approach (MVP → Beta → Full)
- **Impact:** Feasibility +35%

[... continue for all changes ...]

## Remaining Recommendations

1. **Medium Priority:** Add detailed API specifications
2. **Low Priority:** Expand persona pain points

## Next Steps

1. ✅ Ready for PRPROMPTS generation
2. Review refinement report
3. Run: claude gen-prprompts
```

## Exit Criteria

**Ready for PRPROMPTS Generation (all must be true):**
- ✅ Overall Grade ≥ C (70%)
- ✅ No critical security issues
- ✅ All compliance requirements documented
- ✅ Features have acceptance criteria
- ✅ Timeline is realistic (within 20% of capacity)

**Recommend Another Iteration If:**
- Overall Grade < B (80%)
- User wants to improve specific sections
- Warnings exist that impact project success

## Examples

### Example 1: Healthcare App Refinement

**Initial Assessment:**
- Completeness: 60% (missing HIPAA section)
- Clarity: 75% (vague acceptance criteria)
- Feasibility: 85% (realistic timeline)
- Security: 40% (no encryption specs)
- **Grade: D (65%)**

**After Refinement:**
- Added Section 6.1: HIPAA Compliance (2000 words)
- Converted 12 vague criteria to SMART criteria
- Added PHI encryption specifications
- Added audit logging requirements
- **Grade: B (85%)**

**Improvements:** 3 iterations, 45 minutes

---

### Example 2: Fintech App Scope Reduction

**Initial Assessment:**
- Completeness: 90%
- Clarity: 85%
- Feasibility: 30% (6 months, 20 features, 3-person team = impossible)
- Security: 95%
- **Grade: D (68%)**

**After Refinement:**
- Reduced scope: 20 features → 6 P0 features (MVP)
- Added Phase 2/3 roadmap for remaining features
- Recalculated timeline: 6 months realistic for MVP
- **Grade: B (88%)**

**Key Insight:** Prioritization > trying to build everything

---

## Tips for Effective Refinement

1. **Start with critical issues** - Security and compliance first
2. **Be specific** - Replace "fast" with "< 2 seconds cold start"
3. **Prioritize ruthlessly** - Not everything is P0
4. **Validate feasibility** - Math should work (story points ÷ team ÷ weeks)
5. **Iterate** - Run refinement multiple times for excellence
6. **Don't over-engineer** - B grade (80%+) is usually sufficient

## Success Metrics

**PRD Refinement is successful when:**
- ✅ Overall grade ≥ B (80%)
- ✅ Zero critical issues
- ✅ User understands trade-offs made
- ✅ PRPROMPTS generation will produce high-quality output
- ✅ Development team can implement from this PRD
