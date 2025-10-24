# Automation Orchestrator Examples - Real-World Scenarios

> **5 complete examples showing how to orchestrate multi-feature implementation**
>
> Each example includes IMPLEMENTATION_PLAN.md, execution command, dependency graph, and expected output.

---

## Table of Contents

1. [E-Commerce App (10 Features)](#1-e-commerce-app-10-features)
2. [Healthcare App with Dependencies (6 Features, HIPAA)](#2-healthcare-app-with-dependencies-6-features-hipaa)
3. [SaaS Platform (8 Features, Complex Dependencies)](#3-saas-platform-8-features-complex-dependencies)
4. [Social Media App (7 Features, Real-time)](#4-social-media-app-7-features-real-time)
5. [Resume After Failure (Recovery Scenario)](#5-resume-after-failure-recovery-scenario)

---

## 1. E-Commerce App (10 Features)

### Scenario

Building a complete e-commerce Flutter app with authentication, catalog, cart, checkout, and order management.

### IMPLEMENTATION_PLAN.md

```markdown
# Implementation Plan - E-Commerce App

## Phase 1: Authentication & User Management

### Feature 1: Authentication
**Priority:** HIGH
**Estimated Time:** 6-8 hours
**Dependencies:** None

**Requirements:**
- Email/password login and registration
- JWT token management
- Session persistence
- Password reset

### Feature 2: User Profile
**Priority:** HIGH
**Estimated Time:** 4-6 hours
**Dependencies:** Authentication

**Requirements:**
- View user profile
- Edit profile information
- Upload profile photo
- Shipping address management

## Phase 2: Product Management

### Feature 3: Product Catalog
**Priority:** HIGH
**Estimated Time:** 8-10 hours
**Dependencies:** None

**Requirements:**
- Browse products by category
- Search products
- Filter by price, brand, rating
- View product details

### Feature 4: Product Reviews
**Priority:** MEDIUM
**Estimated Time:** 4-6 hours
**Dependencies:** Product Catalog, Authentication

**Requirements:**
- View product reviews
- Write review (authenticated users)
- Rate products (1-5 stars)
- Upload review photos

## Phase 3: Shopping & Checkout

### Feature 5: Shopping Cart
**Priority:** HIGH
**Estimated Time:** 6-8 hours
**Dependencies:** Product Catalog, Authentication

**Requirements:**
- Add/remove items from cart
- Update quantities
- View cart total
- Persist cart across sessions

### Feature 6: Wishlist
**Priority:** LOW
**Estimated Time:** 3-4 hours
**Dependencies:** Product Catalog, Authentication

**Requirements:**
- Add products to wishlist
- Remove from wishlist
- View wishlist
- Move to cart

### Feature 7: Checkout
**Priority:** HIGH
**Estimated Time:** 10-12 hours
**Dependencies:** Shopping Cart, User Profile
**Compliance:** PCI-DSS

**Requirements:**
- Shipping address selection
- Payment method selection (Stripe)
- Order summary
- Place order

## Phase 4: Order Management

### Feature 8: Order History
**Priority:** HIGH
**Estimated Time:** 6-8 hours
**Dependencies:** Checkout

**Requirements:**
- View past orders
- Order details
- Track order status
- Reorder functionality

### Feature 9: Order Tracking
**Priority:** MEDIUM
**Estimated Time:** 6-8 hours
**Dependencies:** Order History

**Requirements:**
- Real-time order status
- Delivery tracking
- Estimated delivery time
- Delivery notifications

## Phase 5: Additional Features

### Feature 10: Notifications
**Priority:** LOW
**Estimated Time:** 4-6 hours
**Dependencies:** Authentication

**Requirements:**
- Push notifications
- Order status updates
- Promotional notifications
- Notification preferences
```

### Dependency Graph

```
Authentication (1)
├── User Profile (2)
│   └── Checkout (7)
│       ├── Order History (8)
│       │   └── Order Tracking (9)
├── Product Reviews (4)
├── Shopping Cart (5)
│   └── Checkout (7)
├── Wishlist (6)
└── Notifications (10)

Product Catalog (3)
├── Product Reviews (4)
├── Shopping Cart (5)
└── Wishlist (6)
```

### Execution

```bash
@claude use skill automation/automation-orchestrator

# Input:
# - feature_count: 10 (all features)
# - auto_commit: true
# - stop_on_failure: false
# - test_coverage_target: 75
```

### Expected Output

```
# Orchestration Started

## Execution Order (Topological Sort)

Round 1 (Independent Features):
  - Feature 1: Authentication
  - Feature 3: Product Catalog

Round 2 (Depends on Round 1):
  - Feature 2: User Profile (depends on: Authentication)
  - Feature 4: Product Reviews (depends on: Product Catalog, Authentication)
  - Feature 5: Shopping Cart (depends on: Product Catalog, Authentication)
  - Feature 6: Wishlist (depends on: Product Catalog, Authentication)
  - Feature 10: Notifications (depends on: Authentication)

Round 3 (Depends on Round 2):
  - Feature 7: Checkout (depends on: Shopping Cart, User Profile)

Round 4 (Depends on Round 3):
  - Feature 8: Order History (depends on: Checkout)

Round 5 (Depends on Round 4):
  - Feature 9: Order Tracking (depends on: Order History)

Total Rounds: 5
Estimated Time: 70-90 minutes

---

[10 minutes later]

✅ Feature 1: Authentication (25 files, 82% coverage) - Committed (3f2d8a1)

[8 minutes later]

✅ Feature 3: Product Catalog (28 files, 76% coverage) - Committed (8b4c2e9)

[6 minutes later]

✅ Feature 2: User Profile (20 files, 79% coverage) - Committed (1a9d3f4)

[7 minutes later]

✅ Feature 4: Product Reviews (18 files, 74% coverage) - Committed (5e8b1a2)
✅ Feature 5: Shopping Cart (22 files, 80% coverage) - Committed (9c2f5d8)
✅ Feature 6: Wishlist (15 files, 77% coverage) - Committed (4d7e2b1)
✅ Feature 10: Notifications (17 files, 75% coverage) - Committed (2b9e6f3)

[12 minutes later]

✅ Feature 7: Checkout (30 files, 85% coverage, PCI-DSS) - Committed (7f1c4d9)

[8 minutes later]

✅ Feature 8: Order History (24 files, 78% coverage) - Committed (3e8b2a6)

[9 minutes later]

✅ Feature 9: Order Tracking (26 files, 76% coverage) - Committed (6d4f8c1)

---

# 🎉 Orchestration Complete!

## Summary

**Total Time:** 85 minutes
**Features:** 10/10 successful (100%)
**Files Created:** 225 files
**Tests:** 112 test files
**Coverage:** 78.2% average
**Commits:** 10

## Git Log

```
6d4f8c1 feat(order-tracking): implement order tracking feature
3e8b2a6 feat(order-history): implement order history feature
7f1c4d9 feat(checkout): implement checkout feature (PCI-DSS compliant)
2b9e6f3 feat(notifications): implement notifications feature
4d7e2b1 feat(wishlist): implement wishlist feature
9c2f5d8 feat(shopping-cart): implement shopping cart feature
5e8b1a2 feat(product-reviews): implement product reviews feature
1a9d3f4 feat(user-profile): implement user profile feature
8b4c2e9 feat(product-catalog): implement product catalog feature
3f2d8a1 feat(authentication): implement authentication feature
```

## Next Steps

1. Run full test suite: `flutter test --coverage`
2. Review code: `git diff HEAD~10`
3. Push to remote: `git push origin master`
4. Create PR
5. Optional: Run QA audit: `@claude use skill automation/qa-auditor`

---

📝 Full Report: docs/ORCHESTRATION_REPORT_2025-10-24-14-30.md
```

---

## 2. Healthcare App with Dependencies (6 Features, HIPAA)

### Scenario

Building a healthcare app with strict dependencies due to HIPAA compliance requirements.

### IMPLEMENTATION_PLAN.md

```markdown
# Implementation Plan - Healthcare App

### Feature 1: User Authentication (Healthcare Provider)
**Priority:** CRITICAL
**Dependencies:** None
**Compliance:** HIPAA
**Requirements:**
- Provider login with MFA
- Role-based access control (Doctor, Nurse, Admin)
- Session timeout (15 minutes)

### Feature 2: Patient Records
**Priority:** CRITICAL
**Dependencies:** User Authentication
**Compliance:** HIPAA
**Requirements:**
- View patient demographics
- View medical history
- PHI encryption (AES-256-GCM)
- Audit logging

### Feature 3: Visit Notes
**Priority:** HIGH
**Dependencies:** Patient Records, User Authentication
**Compliance:** HIPAA
**Requirements:**
- Create visit notes
- View visit history
- Doctor signatures
- Audit trail

### Feature 4: Prescription Management
**Priority:** HIGH
**Dependencies:** Visit Notes, Patient Records
**Compliance:** HIPAA, DEA
**Requirements:**
- E-prescribe medications
- View prescription history
- Drug interaction warnings
- Controlled substance tracking

### Feature 5: Lab Results
**Priority:** MEDIUM
**Dependencies:** Patient Records
**Compliance:** HIPAA
**Requirements:**
- Upload lab results
- View lab history
- Critical value alerts
- Result annotations

### Feature 6: Telemedicine
**Priority:** LOW
**Dependencies:** User Authentication, Patient Records, Visit Notes
**Requirements:**
- Video consultations
- Chat during consultation
- Post-visit notes
- Billing integration
```

### Dependency Graph

```
User Authentication (1)
├── Patient Records (2)
│   ├── Visit Notes (3)
│   │   ├── Prescription Management (4)
│   │   └── Telemedicine (6)
│   └── Lab Results (5)
└── Telemedicine (6)
```

### Execution

```bash
@claude use skill automation/automation-orchestrator

# Input:
# - feature_count: 6
# - auto_commit: true
# - stop_on_failure: true  # STOP if any HIPAA feature fails
# - test_coverage_target: 90  # Higher for healthcare
```

### Expected Output

```
# Orchestration Started

## Execution Order

Round 1: Feature 1 (User Authentication)
Round 2: Feature 2 (Patient Records), Feature 5 (Lab Results)
Round 3: Feature 3 (Visit Notes)
Round 4: Feature 4 (Prescription Management), Feature 6 (Telemedicine)

Estimated Time: 50-65 minutes

---

[12 minutes later]

✅ Feature 1: User Authentication (30 files, 92% coverage, HIPAA) - Committed

Security Checks:
  ✅ MFA implemented
  ✅ Session timeout (15 min)
  ✅ Audit logging enabled
  ✅ Role-based access control

[15 minutes later]

✅ Feature 2: Patient Records (35 files, 91% coverage, HIPAA) - Committed

Security Checks:
  ✅ PHI encrypted (AES-256-GCM)
  ✅ Audit log for all access
  ✅ No PHI in logs
  ✅ Session timeout respected

[10 minutes later]

✅ Feature 5: Lab Results (25 files, 88% coverage, HIPAA) - Committed

[12 minutes later]

✅ Feature 3: Visit Notes (28 files, 90% coverage, HIPAA) - Committed

[14 minutes later]

✅ Feature 4: Prescription Management (32 files, 93% coverage, HIPAA+DEA) - Committed

Security Checks:
  ✅ Controlled substance tracking
  ✅ DEA number validation
  ✅ Drug interaction checks

[11 minutes later]

✅ Feature 6: Telemedicine (29 files, 89% coverage) - Committed

---

# 🎉 Orchestration Complete!

## Summary

**Total Time:** 74 minutes
**Features:** 6/6 successful (100%)
**Files Created:** 179 files
**Coverage:** 90.5% average
**HIPAA Compliance:** ✅ All features validated

## Compliance Report

✅ **HIPAA Requirements Met:**
  - PHI encryption at rest: ✅
  - Audit logging: ✅ (all 6 features)
  - Session timeout: ✅
  - Access control: ✅
  - No PHI in logs: ✅

✅ **DEA Requirements Met:**
  - Controlled substance tracking: ✅
  - DEA number validation: ✅

## Next Steps

1. **Mandatory:** Manual security audit
2. **Mandatory:** Penetration testing
3. **Mandatory:** HIPAA compliance review
4. Run QA audit: `@claude use skill automation/qa-auditor`

---

📝 Full Report: docs/ORCHESTRATION_REPORT_2025-10-24-15-45.md
```

---

## 3. SaaS Platform (8 Features, Complex Dependencies)

### Scenario

Building a team collaboration SaaS platform with complex inter-feature dependencies.

### IMPLEMENTATION_PLAN.md

```markdown
### Feature 1: Authentication & Authorization
**Dependencies:** None

### Feature 2: Organization Management
**Dependencies:** Authentication

### Feature 3: Team Management
**Dependencies:** Organization Management

### Feature 4: Project Management
**Dependencies:** Team Management

### Feature 5: Task Management
**Dependencies:** Project Management

### Feature 6: File Storage
**Dependencies:** Organization Management

### Feature 7: Real-time Chat
**Dependencies:** Team Management

### Feature 8: Activity Feed
**Dependencies:** All (Authentication, Team, Project, Task, File, Chat)
```

### Dependency Graph (Complex)

```
Authentication (1)
└── Organization Management (2)
    ├── Team Management (3)
    │   ├── Project Management (4)
    │   │   └── Task Management (5)
    │   ├── Real-time Chat (7)
    │   └── Activity Feed (8)
    ├── File Storage (6)
    │   └── Activity Feed (8)
    └── Activity Feed (8)

Activity Feed (8) depends on:
  - Authentication (1)
  - Team Management (3)
  - Project Management (4)
  - Task Management (5)
  - File Storage (6)
  - Real-time Chat (7)
```

### Execution Order

```
Round 1: Authentication (1)
Round 2: Organization Management (2)
Round 3: Team Management (3), File Storage (6)
Round 4: Project Management (4), Real-time Chat (7)
Round 5: Task Management (5)
Round 6: Activity Feed (8)
```

### Execution

```bash
@claude use skill automation/automation-orchestrator

# Input:
# - feature_count: 8
# - auto_commit: true
# - stop_on_failure: false
# - test_coverage_target: 80
```

### Expected Output

```
# 🎉 Orchestration Complete!

**Total Time:** 95 minutes
**Features:** 8/8 successful (100%)
**Rounds:** 6 (due to complex dependencies)
**Coverage:** 82.1% average

## Dependency Resolution

✅ All dependencies resolved correctly
✅ No circular dependencies detected
✅ Optimal execution order determined

## Activity Feed Dependencies

Feature 8 (Activity Feed) successfully implemented after ALL dependencies:
  ✅ Authentication (Round 1)
  ✅ Organization (Round 2)
  ✅ Team (Round 3)
  ✅ Project (Round 4)
  ✅ Task (Round 5)
  ✅ File Storage (Round 3)
  ✅ Chat (Round 4)
```

---

## 4. Social Media App (7 Features, Real-time)

### Scenario

Building a social media app with real-time features and WebSocket dependencies.

### IMPLEMENTATION_PLAN.md

```markdown
### Feature 1: Authentication
### Feature 2: User Profile
### Feature 3: User Feed (WebSocket)
### Feature 4: Post Creation
### Feature 5: Comments (WebSocket)
### Feature 6: Likes & Reactions
### Feature 7: Notifications (WebSocket)
```

### Execution

```bash
@claude use skill automation/automation-orchestrator

# Input: feature_count: 7
```

### Expected Output

```
✅ Feature 3: User Feed
  - WebSocket connection established
  - Real-time updates implemented

✅ Feature 5: Comments
  - WebSocket for real-time comments
  - Optimistic updates

✅ Feature 7: Notifications
  - WebSocket for push notifications
  - Foreground/background handling

**Total Time:** 68 minutes
**WebSocket Features:** 3/7 (auto-detected and implemented)
```

---

## 5. Resume After Failure (Recovery Scenario)

### Scenario

Orchestration fails at Feature 5, need to fix and resume.

### Initial Execution

```bash
@claude use skill automation/automation-orchestrator

# Input: feature_count: 10
```

### Result (Failure)

```
✅ Feature 1: Authentication
✅ Feature 2: User Profile
✅ Feature 3: Product Catalog
✅ Feature 4: Shopping Cart
❌ Feature 5: Checkout (FAILED)
   Error: Missing Stripe API key in IMPLEMENTATION_PLAN.md

⏭️  Feature 6: Order History (SKIPPED - depends on Checkout)
⏭️  Feature 7: Order Tracking (SKIPPED - depends on Order History)
✅ Feature 8: Notifications (no dependencies)
✅ Feature 9: Settings (no dependencies)
✅ Feature 10: Wishlist (no dependencies)

---

# ⚠️  Partial Orchestration Complete

**Successful:** 7/10 features (70%)
**Failed:** 1 feature (Checkout)
**Skipped:** 2 features (Order History, Order Tracking)

**Next Steps:**

1. Fix IMPLEMENTATION_PLAN.md:
   - Add Stripe API key to Feature 5

2. Resume orchestration:
   ```bash
   @claude use skill automation/automation-orchestrator
   # Input: start_from_index: 4, feature_count: 3
   ```
```

### Fix IMPLEMENTATION_PLAN.md

```markdown
### Feature 5: Checkout
**API Endpoints:**
- Stripe API: pk_live_xxxxx  ← ADDED!
- Backend: /api/checkout
```

### Resume Orchestration

```bash
@claude use skill automation/automation-orchestrator

# Input:
# - start_from_index: 4  # Start from Feature 5 (Checkout)
# - feature_count: 3     # Features 5, 6, 7
# - auto_commit: true
```

### Result (Success)

```
# Resuming Orchestration from Feature 5

✅ Feature 5: Checkout (30 files, 85% coverage, PCI-DSS) - Committed
   Fixed: Stripe API key now present

✅ Feature 6: Order History (24 files, 78% coverage) - Committed
   Dependencies met: Checkout now available

✅ Feature 7: Order Tracking (26 files, 76% coverage) - Committed
   Dependencies met: Order History now available

---

# 🎉 Resume Complete!

**Features Implemented:** 3/3 (100%)
**Total Project Status:** 10/10 features (100%)

**Final Git Log:**
```
f8a2d1c feat(order-tracking): implement order tracking feature
3b9e4c7 feat(order-history): implement order history feature
7c1f5d8 feat(checkout): implement checkout feature [FIXED]
... (previous 7 commits)
```

**Project Complete!** All 10 features implemented successfully.
```

---

## Summary of Examples

| Example | Features | Time | Key Challenge | Success Rate |
|---------|----------|------|---------------|--------------|
| E-Commerce | 10 | 85 min | Complex dependencies (5 rounds) | 100% |
| Healthcare | 6 | 74 min | HIPAA compliance, high coverage | 100% |
| SaaS Platform | 8 | 95 min | Very complex dependencies (6 rounds) | 100% |
| Social Media | 7 | 68 min | Real-time WebSocket features | 100% |
| Resume After Failure | 10 (3 resumed) | 45 min (resume) | Error recovery and resume | 100% |

### Key Takeaways

1. **Dependency Resolution:** Orchestrator automatically determines correct execution order
2. **Compliance Support:** HIPAA, PCI-DSS validation built-in
3. **Error Recovery:** Easy to resume from failures
4. **Real-time Features:** WebSocket features auto-detected and implemented
5. **Atomic Commits:** One commit per feature for easy rollback

### Performance Metrics

- **Average Time per Feature:** 7-10 minutes
- **Success Rate:** 100% when dependencies are correct
- **Manual Equivalent:** 3-5 days per feature
- **Time Savings:** 95%+ compared to manual implementation

---

**Last Updated:** 2025-10-24
**Version:** 1.0.0
