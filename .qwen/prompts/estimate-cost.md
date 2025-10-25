---
name: Estimate Project Cost
description: Generate detailed cost estimates from PRD metadata
author: Cost Estimation Engine
version: 1.0.0
tags: [prd, cost, estimation, planning, budget]
---

# Project Cost Estimation from PRD

## Overview
Analyze PRD metadata and generate comprehensive cost estimates including development hours, team costs, infrastructure, and third-party services.

## Instructions

### Step 1: Locate and Read PRD

```bash
# Expected location
docs/PRD.md
```

If not found, ask user for PRD location.

### Step 2: Extract Key Metadata

Parse YAML frontmatter and extract:

**Team Composition:**
- `team_size` (small/medium/large)
- `team_composition.mobile.size`, `.junior`, `.mid`, `.senior`
- `team_composition.backend.size`
- `team_composition.qa.size`
- `team_composition.design.size`
- `team_composition.security` (if present)

**Timeline:**
- `business_context.timeline` (total project duration)
- `business_context.mvp_timeline` (MVP duration)

**Features:**
- `features` array with complexity levels (low/medium/high/critical)
- Count features by complexity

**Technical Stack:**
- `platforms` (iOS, Android, Web, etc.)
- `backend_type` (REST, GraphQL, Firebase)
- `auth_method` (JWT, OAuth2, Firebase)
- `offline_support` (true/false)
- `real_time` (true/false)

**Compliance:**
- `compliance` array (HIPAA, PCI-DSS, GDPR, SOX, etc.)

### Step 3: Calculate Development Hours

Use these baseline estimates per feature:

**Feature Complexity Hours (per platform):**
- `low`: 40-80 hours
- `medium`: 80-160 hours
- `high`: 160-320 hours
- `critical`: 320-640 hours

**Platform Multipliers:**
- iOS only: 1.0x
- Android only: 1.0x
- iOS + Android: 1.8x (code sharing via Flutter)
- iOS + Android + Web: 2.3x
- All platforms (6): 3.0x

**Complexity Multipliers:**
- Offline support: +30% hours
- Real-time features: +25% hours
- GraphQL backend: +15% hours
- Clean Architecture: +20% hours (upfront, saves 40% in maintenance)

**Compliance Multipliers:**
- HIPAA: +40% (audit logs, encryption, BAA documentation)
- PCI-DSS: +35% (tokenization, security audits, SAQ compliance)
- SOX: +30% (financial controls, audit trails)
- GDPR: +20% (data deletion, consent flows, privacy policy)
- COPPA: +25% (parental consent, age gates)
- FERPA: +20% (education data protections)

**Formula:**
```
Base Hours = Σ(Feature Hours × Platform Multiplier)
Technical Additions = Base Hours × (Offline% + RealTime% + Backend%)
Compliance Additions = Base Hours × (Max Compliance%)
Total Dev Hours = Base Hours + Technical Additions + Compliance Additions
```

### Step 4: Calculate Team Costs

**Hourly Rate Assumptions (US Market, 2025):**
- Junior Developer: $50-75/hr (avg $62.50)
- Mid-Level Developer: $75-125/hr (avg $100)
- Senior Developer: $125-200/hr (avg $162.50)
- QA Engineer: $60-100/hr (avg $80)
- Designer (UI/UX): $80-150/hr (avg $115)
- Security Consultant: $150-300/hr (avg $225)
- DevOps Engineer: $100-175/hr (avg $137.50)

**Burn Rate Calculation:**
```
Weekly Team Cost = Σ(Team Member Count × Hourly Rate × 40 hours)
Total Timeline Weeks = Parse timeline ("9 months" → 36 weeks)
Total Labor Cost = Weekly Team Cost × Timeline Weeks
```

**Note:** If team composition not fully specified, estimate based on team_size:
- Small (1-5): 2 mobile, 2 backend, 1 QA
- Medium (6-15): 4 mobile, 3 backend, 2 QA, 1 design
- Large (16+): From PRD or 8 mobile, 5 backend, 3 QA, 2 design, 1 security

### Step 5: Calculate Infrastructure Costs

**Backend Infrastructure (Monthly):**
- Firebase: $200-2,000 (based on target_users)
  - < 10K users: $200/mo
  - 10K-50K: $500/mo
  - 50K-200K: $1,500/mo
  - 200K+: $3,000/mo
- AWS/GCP/Azure: $300-5,000 (based on complexity + users)
  - Small: $300/mo
  - Medium: $1,000/mo
  - Large: $3,000/mo

**Third-Party Services (Monthly):**
- Auth0: $0-1,400 (free tier, then $240-1,400/mo)
- Stripe: 2.9% + $0.30 per transaction (estimate based on GMV)
- Twilio (SMS): $0.0075/SMS (estimate volume)
- SendGrid (Email): $15-90/mo
- Google Maps API: $200-2,000/mo (based on requests)
- Analytics (Mixpanel/Amplitude): $0-2,000/mo
- Error Tracking (Sentry): $26-440/mo
- CI/CD (GitHub Actions): $0-50/mo

**Total Infrastructure:**
```
Monthly Infra Cost = Backend + ΣThird-Party Services
Total Infra Cost = Monthly × Timeline Months
```

### Step 6: Additional Costs

**App Store Costs:**
- Apple Developer: $99/year
- Google Play: $25 one-time
- Total: $124 + $99/year ongoing

**Testing & QA:**
- Device Testing (BrowserStack): $129/mo
- Penetration Testing: $5,000-25,000 (one-time)
- Compliance Audits:
  - HIPAA: $15,000-50,000
  - PCI-DSS: $10,000-30,000
  - SOX: $20,000-100,000

**Legal & Compliance:**
- Privacy Policy: $1,000-5,000
- Terms of Service: $1,000-5,000
- BAA (HIPAA): $0-2,000
- DPA (GDPR): $0-3,000

**Contingency:**
- 15-25% of total development cost (for unknowns, pivots)

### Step 7: Generate Cost Report

Create `docs/COST_ESTIMATE.md` with this structure:

```markdown
# Project Cost Estimate: [Project Name]

**Generated:** [Date]
**Source:** docs/PRD.md
**Timeline:** [Timeline from PRD]

---

## Executive Summary

| Category | Cost | % of Total |
|----------|------|-----------|
| 💰 Labor | $XXX,XXX | XX% |
| 🖥️ Infrastructure | $XX,XXX | X% |
| 🔒 Compliance & Legal | $XX,XXX | X% |
| 🧪 Testing & QA | $XX,XXX | X% |
| 🛡️ Contingency (20%) | $XX,XXX | XX% |
| **TOTAL** | **$XXX,XXX** | **100%** |

**Cost Range:** $XXX,XXX - $XXX,XXX (±20% confidence)

---

## 1. Development Hours Breakdown

### Features by Complexity

| Complexity | Count | Hours/Feature | Total Hours |
|------------|-------|---------------|-------------|
| 🔴 Critical | X | XXX-XXX | XXX |
| 🟠 High | X | XXX-XXX | XXX |
| 🟡 Medium | X | XX-XX | XXX |
| 🟢 Low | X | XX-XX | XX |
| **TOTAL** | **X** | | **X,XXX** |

### Platform & Technical Multipliers

- Base Hours: X,XXX
- Platform Multiplier (X platforms): +XX% → X,XXX hours
- Offline Support: +30% → +XXX hours
- Real-time Features: +25% → +XXX hours
- [Compliance] (HIPAA): +40% → +XXX hours

**Total Adjusted Hours:** X,XXX hours

---

## 2. Labor Costs

### Team Composition

| Role | Count | Rate/hr | Weekly Cost | Total Cost |
|------|-------|---------|-------------|-----------|
| Senior Mobile | X | $XXX | $X,XXX | $XXX,XXX |
| Mid Mobile | X | $XXX | $X,XXX | $XXX,XXX |
| Junior Mobile | X | $XXX | $X,XXX | $XXX,XXX |
| Backend | X | $XXX | $X,XXX | $XXX,XXX |
| QA | X | $XXX | $X,XXX | $XXX,XXX |
| Design | X | $XXX | $X,XXX | $XXX,XXX |
| Security | X | $XXX | $X,XXX | $XXX,XXX |

**Weekly Burn Rate:** $XX,XXX
**Timeline:** XX weeks ([Timeline from PRD])
**Total Labor Cost:** $XXX,XXX

---

## 3. Infrastructure Costs

### Backend & Hosting

- **[Backend Type]:** $X,XXX/mo × XX months = $XX,XXX
- **CDN (CloudFlare):** $200/mo × XX months = $X,XXX
- **Database (PostgreSQL):** Included in hosting
- **Redis Cache:** $50/mo × XX months = $X,XXX

**Subtotal:** $XX,XXX

### Third-Party Services

- **Auth ([Auth Method]):** $XXX/mo × XX months = $X,XXX
- **Payment (Stripe):** 2.9% + $0.30/txn (estimate $X,XXX)
- **Maps (Google):** $XXX/mo × XX months = $X,XXX
- **Analytics:** $XXX/mo × XX months = $X,XXX
- **Error Tracking:** $XXX/mo × XX months = $X,XXX
- **CI/CD:** $XX/mo × XX months = $XXX

**Subtotal:** $XX,XXX

**Total Infrastructure:** $XX,XXX

---

## 4. Compliance & Legal

- **[Compliance 1] Audit:** $XX,XXX
- **[Compliance 2] Certification:** $XX,XXX
- **Privacy Policy + ToS:** $X,XXX
- **Legal Review:** $X,XXX

**Total Compliance:** $XX,XXX

---

## 5. Testing & QA

- **Device Testing (BrowserStack):** $129/mo × XX months = $X,XXX
- **Penetration Testing:** $XX,XXX (one-time)
- **Security Audit:** $X,XXX

**Total Testing:** $XX,XXX

---

## 6. Additional Costs

- **App Store Fees:** $124 + $99/year = $XXX
- **Contingency (20%):** $XX,XXX

**Total Additional:** $XX,XXX

---

## 7. Cost Optimization Opportunities

1. **MVP First Approach:**
   - Focus on [X] P0 features only
   - Defer [X] P1/P2 features to v2
   - **Potential Savings:** $XX,XXX (XX%)

2. **Open Source Alternatives:**
   - Replace [Service] with [Open Source]
   - Self-host [Service]
   - **Potential Savings:** $X,XXX/year

3. **Outsource Non-Core:**
   - Outsource [Component] to offshore team ($XX/hr vs $XXX/hr)
   - **Potential Savings:** $XX,XXX

4. **Use Industry Template:**
   - Started with [Type] PRD template
   - Pre-configured compliance saved XX hours
   - **Actual Savings:** $X,XXX

---

## 8. Payment Schedule Suggestion

| Milestone | Deliverables | % | Amount |
|-----------|--------------|---|--------|
| Kickoff | Signed contract, PRD finalized | 20% | $XX,XXX |
| MVP Complete | Core features, basic testing | 30% | $XX,XXX |
| Beta Launch | Full features, security audit | 30% | $XX,XXX |
| Production | App store launch, compliance | 20% | $XX,XXX |

---

## 9. Risk Factors

⚠️ **Factors that may increase costs:**

1. **Scope Creep:** Each additional medium feature = +$X,XXX
2. **Compliance Delays:** Failed audits can add 2-4 weeks = $XX,XXX
3. **Third-Party API Changes:** Integrations may require rework
4. **Platform Updates:** iOS/Android major versions = +$X,XXX

💡 **Mitigation:** Include 20% contingency, lock scope after PRD approval

---

## 10. Comparison to Industry Benchmarks

| Metric | This Project | Industry Avg | Delta |
|--------|--------------|--------------|-------|
| Cost per Feature | $XX,XXX | $XX,XXX | ±XX% |
| Cost per User (1st year) | $XX | $XX | ±XX% |
| Monthly Burn Rate | $XX,XXX | $XX,XXX | ±XX% |
| Team Size | XX | XX | Standard |

---

## Assumptions

1. **Labor Rates:** US market averages, 2025
2. **Timeline:** As specified in PRD ([Timeline])
3. **Scope:** All features in PRD, no scope creep
4. **Team Availability:** Full-time team members
5. **Infrastructure:** [Backend Type] with [User Count] target users
6. **Compliance:** [List compliance] fully implemented
7. **Contingency:** 20% for unknowns

**Confidence Level:** ±20% (Medium - based on PRD completeness)

---

## Next Steps

1. **Review & Validate:** Verify assumptions with stakeholders
2. **Refine Estimates:** Get quotes for third-party services
3. **Prioritize Features:** Use feature dependency analysis to sequence work
4. **Secure Budget:** Present to finance/leadership
5. **Track Actuals:** Compare estimates to actual costs weekly

**Questions?** Run `claude analyze-prd` for PRD quality check first.

---

*Generated by PRD Cost Estimator v1.0.0*
*Source: [PRD Path]*
*Estimation Methodology: Industry benchmarks + PRD metadata analysis*
```

### Step 8: Validation & Output

After generating report:

1. **Sanity Checks:**
   - Total cost reasonable for project type? (Healthcare $500K+, Simple app $50K+)
   - Labor % = 60-80% of total? (If not, investigate)
   - Infrastructure < 15%? (If higher, check third-party costs)
   - Contingency 15-25%? (Adjust if needed)

2. **Output Message:**

```
✅ Generated cost estimate at docs/COST_ESTIMATE.md

💰 Cost Summary:
- Total Estimate: $XXX,XXX (±20%)
- Labor: $XXX,XXX (XX%)
- Infrastructure: $XX,XXX (X%)
- Timeline: [Timeline from PRD]
- Weekly Burn: $XX,XXX

🎯 Key Insights:
- [Feature Type] features dominate cost (XX%)
- [Compliance] adds $XX,XXX (XX%)
- MVP could reduce cost to $XXX,XXX (save XX%)

Next steps:
1. Review assumptions in Section 10
2. Get third-party service quotes
3. Consider cost optimizations (Section 7)
4. Run: claude feature-dependencies (coming soon)

Want to explore cost scenarios? (y/n)
```

3. **If user says "y":** Offer to regenerate with different scenarios:
   - MVP-only cost
   - Offshore team cost
   - Different timeline (faster = more expensive)
   - Alternative tech stack

## Notes

- **Labor rates vary by region:** US rates shown, adjust for offshore/nearshore
- **Third-party costs are estimates:** Always get actual quotes
- **Compliance costs are one-time:** Factor into project budget, not monthly burn
- **Contingency is critical:** 20% minimum for complex projects, 15% for simple
- **Update estimates weekly:** Track actuals vs estimates during development

## Limitations

- Cannot estimate opportunity cost
- Does not include post-launch marketing costs
- Assumes no major pivots during development
- User acquisition costs not included
- Post-launch maintenance costs separate (estimate 15-20% of dev cost annually)
