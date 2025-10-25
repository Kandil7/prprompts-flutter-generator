---
name: Auto-Generate PRD from All Project Files
description: Automatically discover and consolidate all markdown files in project into comprehensive PRD
author: Auto PRD Generator
version: 1.0.0
tags: [prd, automation, discovery, consolidation]
---

# Auto-Generate PRD from All Project Markdown Files

## Overview
Automatically discover ALL `.md` files in the project, analyze their content, map to appropriate PRD sections using filename patterns, and generate a comprehensive PRD with fresh YAML frontmatter.

## Instructions

### Step 1: Discover All Markdown Files

Use glob pattern to find ALL `.md` files in project:

```bash
# Find all markdown files (no exclusions)
**/*.md
```

List all discovered files to user:
```
🔍 Discovered Markdown Files:
- README.md
- docs/requirements.md
- docs/features.md
- docs/architecture.md
- features/user-auth.md
- features/dashboard.md
- [... all other .md files]

Total: XX markdown files found

Proceeding to analyze and consolidate...
```

### Step 2: Categorize Files by Pattern

Map each file to PRD section using filename patterns (priority order):

**Pattern Matching Rules:**

1. **README.md** → Executive Summary + Product Vision (highest priority)
2. **requirements*.md** (case-insensitive) → Requirements section
3. **features*.md** or **feature*.md** → Features section
4. **user*.md** or **persona*.md** → Target Users section
5. **architecture*.md** or **tech*.md** or **technical*.md** → Technical Architecture
6. **security*.md** or **compliance*.md** → Security & Compliance section
7. **api*.md** → API Specifications
8. **design*.md** or **ui*.md** or **ux*.md** → Design section
9. **test*.md** or **qa*.md** → Testing Strategy
10. **deploy*.md** or **release*.md** → Deployment section
11. **risk*.md** → Risks & Mitigation
12. **timeline*.md** or **roadmap*.md** or **schedule*.md** → Timeline/Roadmap
13. **metric*.md** or **kpi*.md** or **success*.md** → Success Metrics
14. **glossary*.md** or **terms*.md** → Glossary/Appendices
15. **Others** → Categorized by directory name or Appendices

**Directory-based fallback categorization:**
- Files in `/features/` or `/feature/` → Features
- Files in `/docs/requirements/` → Requirements
- Files in `/architecture/` or `/arch/` → Technical Architecture
- Files in `/api/` → API Specifications
- Files in `/design/` → Design
- Files in `/compliance/` or `/security/` → Security & Compliance
- Unknown → Appendices (preserve as-is)

### Step 3: Read and Parse Each File

For each discovered file:

1. **Read full content**
2. **Extract headers** (H1, H2, H3 for structure)
3. **Identify key information**:
   - Compliance mentions (HIPAA, PCI-DSS, GDPR, SOX, COPPA, FERPA)
   - Platform mentions (iOS, Android, Web, Windows, macOS, Linux)
   - Technology stack (Flutter, React Native, Node.js, PostgreSQL, etc.)
   - Authentication methods (JWT, OAuth2, Firebase, Auth0)
   - Feature lists (bullet points, numbered lists)
   - Team mentions (developers, designers, QA, etc.)
   - Timeline/dates (MVP timeline, launch date, milestones)
   - User personas (target users, user types)
4. **Note source** (file path for traceability)

### Step 4: Analyze Content for YAML Frontmatter

Scan ALL content to extract metadata:

**Project Type Detection:**
Look for keywords to determine `project_type`:
- "patient", "medical", "healthcare", "PHI", "HIPAA" → `healthcare`
- "payment", "transaction", "banking", "fintech", "PCI" → `fintech`
- "student", "education", "learning", "LMS", "COPPA", "FERPA" → `education`
- "delivery", "logistics", "shipping", "tracking", "route" → `logistics`
- "ecommerce", "shopping", "cart", "checkout", "store" → `ecommerce`
- "SaaS", "B2B", "tenant", "subscription", "enterprise" → `saas`
- Default → `generic`

**Compliance Detection:**
Extract from content:
- "HIPAA" → add `"hipaa"` to `compliance` array
- "PCI-DSS", "PCI DSS", "payment card" → add `"pci-dss"`
- "GDPR", "European data", "EU privacy" → add `"gdpr"`
- "SOX", "Sarbanes" → add `"sox"`
- "COPPA", "children under 13" → add `"coppa"`
- "FERPA", "education records" → add `"ferpa"`
- "FDA", "medical device" → add `"fda"`

**Platforms Detection:**
- "iOS", "iPhone", "iPad", "Apple" → add `"ios"`
- "Android" → add `"android"`
- "Web", "browser", "webapp" → add `"web"`
- "Windows" → add `"windows"`
- "macOS", "Mac" → add `"macos"`
- "Linux" → add `"linux"`

**Authentication Method:**
- "JWT", "JSON Web Token" → `auth_method: "jwt"`
- "OAuth", "OAuth2", "OpenID" → `auth_method: "oauth2"`
- "Firebase Auth" → `auth_method: "firebase"`
- "Auth0" → `auth_method: "auth0"`
- Default → `auth_method: "jwt"`

**Sensitive Data:**
- "PHI", "Protected Health Information" → add `"phi"`
- "PII", "personally identifiable" → add `"pii"`
- "payment", "credit card" → add `"payment"`
- "financial data" → add `"financial"`
- "biometric" → add `"biometric"`

**Architecture Flags:**
- "offline", "offline-first", "local storage" → `offline_support: true`
- "real-time", "websocket", "live updates" → `real_time: true`
- "BLoC" → `state_management: "bloc"`
- "Riverpod" → `state_management: "riverpod"`
- "Provider" → `state_management: "provider"`
- "GetX" → `state_management: "getx"`
- "Clean Architecture" → `architecture_style: "clean_architecture"`
- "REST", "RESTful" → `backend_type: "rest"`
- "GraphQL" → `backend_type: "graphql"`
- "Firebase" → `backend_type: "firebase"`

**Team Composition:**
Look for team size mentions:
- "X developers", "Y person team" → extract numbers
- "junior developer" → count juniors
- "senior developer" → count seniors
- "QA", "tester" → count QA
- "designer" → count design
- Map to `team_size`: small (1-5), medium (6-15), large (16+)

**Timeline:**
- Look for "X months", "Y weeks", "launch in Z"
- Extract project timeline
- Extract MVP timeline if mentioned separately

**Features Extraction:**
- Parse all feature lists from features*.md files
- Extract feature names from headers
- Determine complexity from keywords:
  - "critical", "complex", "advanced" → `complexity: "critical"`
  - "high priority", "difficult" → `complexity: "high"`
  - "medium", "moderate" → `complexity: "medium"`
  - "simple", "basic", "easy" → `complexity: "low"`
- Determine priority from keywords:
  - "must have", "essential", "required", "P0" → `priority: "p0"`
  - "should have", "important", "P1" → `priority: "p1"`
  - "nice to have", "optional", "P2" → `priority: "p2"`

### Step 5: Generate YAML Frontmatter

Construct complete frontmatter from analyzed data:

```yaml
---
# PROJECT METADATA
project_name: "[Inferred from README or directory name]"
project_version: "1.0.0"
created_date: "[Today's date YYYY-MM-DD]"
last_updated: "[Today's date]"

# CLASSIFICATION
project_type: "[Detected type: healthcare/fintech/education/logistics/ecommerce/saas/generic]"
compliance: [Detected compliance requirements]  # ["hipaa", "gdpr", etc.] or []
platforms: [Detected platforms]  # ["ios", "android", "web"]

# AUTHENTICATION & SECURITY
auth_method: "[Detected: jwt/oauth2/firebase/auth0/custom]"
jwt_config:  # Only if auth_method is jwt
  algorithm: "RS256"  # Default, override if specified
  access_token_expiry: "15m"
  refresh_token_expiry: "7d"
  validate_claims: ["aud", "iss", "exp", "sub"]

oauth2_config:  # Only if auth_method is oauth2
  providers: [Detected providers]  # ["google", "microsoft", etc.]

sensitive_data: [Detected data types]  # ["phi", "pii", "payment", etc.]

encryption_requirements:
  at_rest: "AES-256-GCM"  # Default for sensitive data
  in_transit: "TLS-1.3"
  e2e_required: [true if messaging/chat detected, else false]

# ARCHITECTURE
offline_support: [Detected: true/false]
real_time: [Detected: true/false]
state_management: "[Detected: bloc/riverpod/provider/getx or default to bloc]"
architecture_style: "clean_architecture"  # Default
backend_type: "[Detected: rest/graphql/grpc/firebase]"

# FEATURES (extracted from content)
features:
  - name: "[Feature 1 from features*.md]"
    complexity: "[Detected: low/medium/high/critical]"
    priority: "[Detected: p0/p1/p2]"
    notes: "[Any notes from content]"
  - name: "[Feature 2]"
    complexity: "[Detected]"
    priority: "[Detected]"
  # ... all detected features

# TEAM (inferred from content)
team_size: "[Detected: small/medium/large]"
team_composition:
  mobile:
    size: [Detected count or estimate]
    junior: [Detected count]
    mid: [Estimated]
    senior: [Detected count]
  backend:
    size: [Detected count or estimate]
    tech_stack: [Detected technologies]  # ["node.js", "postgresql", etc.]
  qa:
    size: [Detected count or estimate]
  design:
    size: [Detected count or estimate]

# PERFORMANCE & QUALITY
performance_targets:
  cold_start_time: "2s"  # Default
  frame_rate: "60fps"
  api_response_time: "500ms"  # Override if specified

testing_requirements:
  unit_test_coverage: 85  # Default, override if specified
  widget_test_coverage: 75
  integration_tests_required: true

# DEPLOYMENT
demo_frequency: "[Detected: none/weekly/biweekly/monthly or default to none]"

# BUSINESS
business_context:
  timeline: "[Detected timeline]"
  mvp_timeline: "[Detected MVP timeline or default to half of timeline]"
  target_users: [Detected user count or default to 10000]

# CUSTOMIZATION
prprompts_config:
  generate_all_files: true
  verbosity: "detailed"
  include_junior_explanations: [true if junior devs detected, else false]
  auto_generate_subagents: true
---
```

### Step 6: Organize Content into PRD Sections

Build complete PRD markdown body:

#### Section 1: Executive Summary
- Source: README.md primary content
- Fallback: Synthesize from all content
- 2-3 paragraphs covering:
  - What the app does
  - Target users (from user*.md files)
  - Core value proposition
  - Key differentiators

#### Section 2: Product Vision
- Source: README.md, vision*.md
- Include:
  - Problem being solved
  - Long-term vision (3-5 years)
  - Success metrics (from metric*.md)

#### Section 3: Target Users
- Source: user*.md, persona*.md
- Format:
  - **Primary Users:** [List personas from files]
  - **Secondary Users:** [List if present]

#### Section 4: Core Features (Detailed)
- Source: features*.md, feature*.md files
- For each feature detected:
  - **4.X [Feature Name]**
  - **Description:** [From file content]
  - **User Stories:** [Extract if present, else generate]
  - **Acceptance Criteria:** [Extract if present]
  - **Technical Requirements:** [From technical*.md]
  - **Compliance Considerations:** [If compliance detected]

#### Section 5: Non-Functional Requirements
- Source: requirements*.md (non-feature requirements)
- Include: Performance, Security, Scalability, Availability

#### Section 6: Compliance & Regulatory Requirements
- Source: compliance*.md, security*.md
- Detail each compliance requirement from frontmatter

#### Section 7: User Flows
- Source: flow*.md, journey*.md
- Include diagrams if present (as code blocks)

#### Section 8: Data Model
- Source: data*.md, model*.md, schema*.md
- Include entity descriptions

#### Section 9: API Specifications
- Source: api*.md
- Include endpoints, request/response formats

#### Section 10: Design Guidelines
- Source: design*.md, ui*.md, ux*.md
- Include style guides, component specs

#### Section 11: Technical Architecture
- Source: architecture*.md, tech*.md, technical*.md
- Include system diagrams, tech stack details

#### Section 12: Testing Strategy
- Source: test*.md, qa*.md
- Include test types, coverage requirements

#### Section 13: Deployment & DevOps
- Source: deploy*.md, devops*.md, release*.md
- Include CI/CD, environments

#### Section 14: Project Timeline & Milestones
- Source: timeline*.md, roadmap*.md, schedule*.md
- Include phases, milestones, deadlines

#### Section 15: Risks & Mitigation
- Source: risk*.md
- Include identified risks and mitigation strategies

#### Section 16: Success Metrics & KPIs
- Source: metric*.md, kpi*.md, success*.md
- Include measurable success criteria

#### Section 17: Glossary & Appendices
- Source: glossary*.md, terms*.md
- Include all other uncategorized files
- Maintain source file references

### Step 7: Handle Duplicate Content

If same information appears in multiple files:
1. **Consolidate**: Merge into single section
2. **Preserve unique details**: Keep all non-duplicate information
3. **Flag conflicts**: Note when files contradict each other
4. **Cite sources**: Add comment `<!-- Source: path/to/file.md -->`

### Step 8: Generate Complete PRD File

Write to `docs/PRD.md`:

```markdown
[YAML Frontmatter from Step 5]
---

# [Project Name] - Product Requirements Document

**Version:** 1.0.0
**Last Updated:** [Date]
**Generated From:** [X] markdown files across project

---

## Document Change Log

| Version | Date | Changes | Source Files |
|---------|------|---------|--------------|
| 1.0.0 | [Date] | Initial PRD auto-generated from project files | [Count] .md files |

---

## File Sources

This PRD was automatically generated by consolidating the following markdown files:

[Bulleted list of all source files with paths]

---

[Section 1: Executive Summary]
[Section 2: Product Vision]
[... All 17 sections ...]

---

## Source File References

Detailed mapping of PRD sections to source files:

- Executive Summary: `README.md`
- Features: `docs/features.md`, `features/user-auth.md`, [...]
- Technical Architecture: `docs/architecture.md`
- [... complete mapping]

---

*This PRD was automatically generated from project markdown files.*
*Review and customize as needed before generating PRPROMPTS.*
```

### Step 9: Validation & Output

After generating PRD:

1. **Validate YAML**: Ensure frontmatter is valid YAML syntax
2. **Check completeness**: Verify all 17 sections have content
3. **Flag missing info**: Warn about any critical missing data
4. **Output message**:

```
✅ Auto-generated PRD at docs/PRD.md

📊 Generation Summary:
- Source files processed: XX markdown files
- Project type detected: [Type]
- Compliance detected: [List]
- Platforms detected: [List]
- Features extracted: XX
- Sections populated: 17/17

📁 File Mapping:
- Executive Summary ← README.md
- Features ← docs/features.md, features/*.md (X files)
- Architecture ← docs/architecture.md
- [... top 5 mappings]

⚠️ Review Needed:
[List any missing critical information or conflicts]

💡 Next Steps:
1. Review generated PRD: cat docs/PRD.md
2. Customize/refine as needed
3. Analyze quality: claude analyze-prd
4. Improve if needed: claude refine-prd
5. Generate PRPROMPTS: claude gen-prprompts

The generated PRD includes source file references for traceability.
Want to analyze the PRD quality now? (y/n)
```

3. **If user says "y"**: Automatically run `analyze-prd` command

## Content Analysis Guidelines

**When analyzing content:**

1. **Be comprehensive**: Read ALL discovered files completely
2. **Preserve detail**: Don't lose important information during consolidation
3. **Intelligent inference**: Make reasonable assumptions when data is implicit
4. **Flag ambiguity**: Note when content is unclear or contradictory
5. **Maintain traceability**: Always cite source files
6. **Respect structure**: Use existing headers and organization where clear

**Quality indicators:**

- ✅ **High confidence**: Multiple files confirm same information
- ⚠️ **Medium confidence**: Information from single file, seems reasonable
- ❌ **Low confidence**: Conflicting information or heavy inference needed

## Error Handling

**If no .md files found:**
```
❌ No markdown files found in project.

Suggestions:
1. Ensure you're in the project root directory
2. Create initial docs (README.md, requirements.md, features.md)
3. Or use: claude create-prd (interactive wizard)
```

**If only README.md found:**
```
⚠️ Only README.md found. PRD will be basic.

Recommendation:
- Use claude create-prd for comprehensive PRD creation
- Or add more documentation files (requirements.md, features.md, etc.)

Proceed with README.md only? (y/n)
```

**If critical frontmatter data missing:**
```
⚠️ Could not detect:
- Project type (defaulted to 'generic')
- Timeline (please add manually)
- Team size (defaulted to 'medium')

PRD generated but needs manual review.
```

## Notes

- **No exclusions**: Scans ALL directories (AI filters irrelevant content)
- **Fresh frontmatter**: Always generates new YAML from content analysis
- **Filename patterns**: Primary categorization method
- **Directory fallback**: Used when filename doesn't match patterns
- **Traceability**: Source files referenced for audit trail
- **Idempotent**: Can re-run safely, overwrites docs/PRD.md

## Limitations

- Cannot read non-markdown files (images, PDFs, code files)
- Inference may miss implicit requirements
- May over-consolidate closely related but distinct concepts
- YAML generation is best-effort, may need manual adjustment
- Pattern matching is case-insensitive but requires English filenames
