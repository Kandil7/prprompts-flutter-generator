# Project Description Examples

## Example 1: Healthcare App (Minimal)

```markdown
# PatientCare App

Mobile app for diabetes patients to track blood sugar, log meals, and communicate with their endocrinologist.

## Users
- Diabetes patients
- Endocrinologists

## Features
1. Blood glucose tracking
2. Meal logging with photos
3. Medication reminders
4. Secure messaging with doctor
5. Report generation

## Requirements
- Must comply with HIPAA
- Needs to work offline (rural patients)
- iOS and Android
```

## Example 2: Fintech App (Brief)

```markdown
# QuickPay

Peer-to-peer payment app for college students. Send money instantly, split bills, and track expenses.

## Target Users
- College students 18-25 years old

## Features
1. Instant money transfers
2. Split bill calculation
3. Request money from friends
4. Transaction history
5. Push notifications

## Requirements
- Must be PCI-DSS compliant
- Real-time balance updates
- Biometric authentication
```

## Example 3: Education App (Medium Detail)

```markdown
# LearnHub

Online learning platform for K-12 students with interactive lessons, quizzes, and progress tracking for parents and teachers.

## Target Users
- Students (ages 6-18)
- Parents
- Teachers
- School administrators

## Key Features
1. Interactive video lessons (math, science, English, history)
2. Practice quizzes and tests
3. Gamification (points, badges, leaderboards)
4. Progress reports for parents
5. Teacher dashboard with class analytics
6. Homework assignment and submission
7. Discussion forums

## Requirements
- Comply with COPPA (children under 13) and FERPA (student records)
- Platforms: iOS, Android, Web
- Offline mode for video lessons
- Parental consent for accounts under 13
- Content filtering and moderation

## Team
Small team (5 people):
- 2 mobile/web developers
- 1 backend developer
- 1 QA engineer
- 1 designer

## Timeline
6 months to launch
```

## Example 4: Logistics App (Brief)

```markdown
# FleetTrack

Real-time fleet management and delivery tracking for logistics companies.

## Users
- Delivery drivers
- Fleet managers
- Customers (tracking their deliveries)

## Features
1. Real-time GPS tracking
2. Route optimization
3. Proof of delivery (photo, signature)
4. Driver performance metrics
5. Customer delivery notifications

## Requirements
- Real-time location updates every 30 seconds
- Works offline (drivers in poor coverage areas)
- iOS and Android
- Must integrate with existing logistics software via API
```

## Example 5: SaaS App (Very Brief)

```markdown
# TaskFlow

Team project management tool with kanban boards, time tracking, and reporting.

## Users
- Project managers
- Team members
- Executives

## Features
1. Kanban boards
2. Time tracking
3. Team collaboration
4. Reports and analytics
5. Integrations (Slack, GitHub, Jira)

## Requirements
- Web, iOS, Android
- Real-time updates
- OAuth2 (Google, Microsoft SSO)
- GDPR compliant
```

---

**How to Use:**
1. Copy an example closest to your project
2. Modify with your details
3. Save as `project_description.md`
4. Run: `claude --prompt .claude/prompts/auto-generate-prd.md`
