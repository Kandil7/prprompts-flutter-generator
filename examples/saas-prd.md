---
project_name: "TaskMaster Pro"
project_version: "1.0.0"
created_date: "2025-01-15"
last_updated: "2025-01-15"

project_type: "saas"
compliance: ["gdpr"]
platforms: ["ios", "android", "web", "macos", "windows"]

auth_method: "oauth2"
sensitive_data: ["pii"]

encryption_requirements:
  at_rest: "AES-256-GCM"
  in_transit: "TLS-1.3"
  e2e_required: false

offline_support: true
real_time: true
state_management: "riverpod"
architecture_style: "clean_architecture"
backend_type: "graphql"

features:
  - name: "Task Management"
    complexity: "medium"
    requires: ["offline_sync", "collaboration"]
    priority: "p0"
  - name: "Team Collaboration"
    complexity: "high"
    requires: ["real_time_updates", "comments", "mentions"]
    priority: "p0"
  - name: "Project Timeline"
    complexity: "medium"
    requires: ["gantt_charts", "dependencies"]
    priority: "p1"
  - name: "Time Tracking"
    complexity: "medium"
    requires: ["timer", "reporting"]
    priority: "p1"

team_size: "medium"
team_composition:
  mobile:
    size: 5
    junior: 1
    mid: 2
    senior: 2

performance_targets:
  cold_start_time: "1.5s"
  frame_rate: "60fps"
  api_response_time: "300ms"

testing_requirements:
  unit_test_coverage: 85
  widget_test_coverage: 75
  integration_tests_required: true

demo_frequency: "weekly"
business_context:
  timeline: "8 months"
  mvp_timeline: "4 months"
  target_users: 20000

prprompts_config:
  generate_all_files: true
  verbosity: "detailed"
  include_junior_explanations: true
  auto_generate_subagents: true
---

# TaskMaster Pro - Product Requirements Document

## 1. Executive Summary

TaskMaster Pro is a GDPR-compliant project management platform for teams of 5-500 people. With offline-first architecture and real-time collaboration, teams stay productive anywhere.

## 2. Product Vision

### 2.1 Problem Statement
Existing project management tools are either too complex (enterprise) or too simple (consumer). Teams need a balance: powerful features with simple UX, that works offline.

### 2.2 Vision
TaskMaster Pro will serve 500,000 users by 2028, expanding into resource planning, budget tracking, and AI-powered project insights.

## 3. Core Features

### 3.1 Task Management

**Description:**
Create, assign, and track tasks with offline support. Changes sync automatically when online.

**User Stories:**
- As a team member, I want to create tasks offline so that I can work anywhere
- As a project manager, I want to assign tasks so that work is distributed
- As a user, I want real-time updates so that I see changes immediately

**Acceptance Criteria:**
- [ ] Tasks created offline sync when online
- [ ] Conflict resolution: last-write-wins
- [ ] Real-time updates via WebSocket
- [ ] Support subtasks, tags, due dates
- [ ] Drag-and-drop reordering

**Priority:** P0 (Must-have for MVP)

[Continue with other features...]

## 4. GDPR Compliance

**User Rights:**
- Right to access: Export all data as JSON
- Right to erasure: Delete account within 24 hours
- Right to portability: CSV/JSON export

**Implementation:**
- EU data residency (AWS eu-west-1)
- Cookie consent banner (web)
- Privacy policy in EU languages

## 5. Success Metrics

**User Acquisition:**
- 20,000 users by month 8
- 2,000 paying teams

**Engagement:**
- 70% daily active users
- 25+ tasks created per user per month
- 80% team retention rate

---

*This PRD is a living document for TaskMaster Pro.*
