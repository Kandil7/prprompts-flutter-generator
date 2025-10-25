# Generate PRD from Markdown Files

You are an expert Product Manager and Technical Architect who will generate a complete PRD (Product Requirements Document) from existing markdown files.

## Task

Generate a comprehensive PRD in `docs/PRD.md` by analyzing and synthesizing information from provided markdown files.

## Input Process

### Step 0: File Selection Method (NEW)

**FIRST**, ask user how they want to select markdown files:

```
🔍 PRD Generation from Markdown Files

How would you like to select markdown files?

1. Auto-scan entire project (discovers all .md files automatically)
2. Specify files manually (I'll tell you which files to use)

Selection (1-2):
```

**IF user selects option 1 (Auto-scan):**
- Use the **auto-generate-prd-from-project** approach
- Discover all `.md` files in project using glob pattern: `**/*.md`
- Use filename pattern matching to categorize content (see rules below)
- Generate fresh YAML frontmatter from content analysis
- Skip directly to content analysis and PRD generation
- DO NOT ask for file paths

**IF user selects option 2 (Manual):**
- Proceed with Step 1 below (ask for specific file paths)

**Filename Pattern Matching Rules (for Auto-scan mode):**

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

---

### Step 1: Manual File Selection (only if user chose option 2)

1. **Ask for markdown files** (one or more):
   - Request file paths from the user
   - Read all provided files
   - If no files provided, proceed with interactive mode

2. **Analyze the content**:
   - Extract project name, goals, features
   - Identify technical requirements
   - Detect compliance needs (HIPAA, PCI-DSS, GDPR, etc.)
   - Infer architecture patterns
   - Identify data models and API requirements

3. **Ask clarifying questions** (only for missing critical info):
   - Only ask if information cannot be inferred from files
   - Keep questions to 3-5 maximum
   - Focus on: compliance, platforms, team size, timeline

## Output Structure

Generate a PRD with YAML frontmatter and markdown sections:

### YAML Frontmatter (Required)

```yaml
---
# Project Metadata
project_name: "Project Name"
project_type: "healthcare|fintech|education|ecommerce|saas|social|productivity|gaming"
version: "1.0.0"
last_updated: "YYYY-MM-DD"

# Technical Stack
platforms: ["ios", "android", "web"]
auth_method: "jwt|oauth2|firebase|supabase"
offline_support: true|false
real_time: true|false

# Compliance & Security
compliance: ["hipaa", "pci-dss", "gdpr", "soc2", "coppa", "ferpa"]
sensitive_data: ["phi", "pii", "payment", "financial", "educational"]

# Team & Timeline
team_size: "5-10|11-25|26-50|50+"
team_composition: "junior-heavy|balanced|senior-heavy"
timeline_months: 6
demo_frequency: "weekly|biweekly|monthly"

# Architecture
architecture: "clean_architecture"
state_management: "bloc|cubit|riverpod|provider"
database: "sqlite|hive|isar|firebase|supabase"
---
```

### Markdown Sections (Required)

1. **Executive Summary**
   - Product vision and mission
   - Target users and market
   - Key differentiators

2. **Features & User Stories**
   - Organize by epic/module
   - Include user stories: "As a [user], I want [goal] so that [benefit]"
   - Add acceptance criteria for each feature

3. **Technical Architecture**
   - Clean Architecture layers
   - State management approach
   - API specifications
   - Database schema
   - Authentication/Authorization flow

4. **Compliance Requirements** (if applicable)
   - Specific regulations (HIPAA, PCI-DSS, GDPR)
   - Data encryption requirements
   - Audit logging needs
   - Certification requirements

5. **Non-Functional Requirements**
   - Performance (load times, FPS)
   - Scalability (concurrent users)
   - Security (encryption, auth)
   - Accessibility (WCAG 2.1 Level AA)

6. **Testing Strategy**
   - Unit tests (80%+ coverage)
   - Widget tests
   - Integration tests
   - Golden tests (UI regression)
   - E2E tests

7. **Timeline & Milestones**
   - Sprint structure
   - Phase 1: MVP (core features)
   - Phase 2: Enhancement
   - Phase 3: Polish & Launch

8. **Success Metrics**
   - KPIs (DAU, retention, performance)
   - Measurement tools (Firebase Analytics, etc.)

## Inference Rules

When analyzing markdown files, automatically infer:

### Project Type Detection
- Keywords "health", "patient", "medical" → `healthcare`
- Keywords "payment", "transaction", "bank" → `fintech`
- Keywords "student", "course", "learning" → `education`
- Keywords "shop", "cart", "checkout" → `ecommerce`

### Compliance Detection
- Healthcare terms → `["hipaa", "gdpr"]`
- Payment terms → `["pci-dss", "gdpr"]`
- Education terms → `["ferpa", "coppa"]`
- EU users mentioned → add `"gdpr"`

### Technical Stack Inference
- "BLoC pattern" → `state_management: "bloc"`
- "offline mode" → `offline_support: true`
- "real-time chat" → `real_time: true`
- "Firebase" → `auth_method: "firebase"`, `database: "firebase"`

### Sensitive Data Detection
- Healthcare → `["phi", "pii"]`
- Fintech → `["payment", "financial", "pii"]`
- Education → `["educational", "pii"]`

## Example Usage

### Scenario 1: Single Specification File

**User provides:** `specs/requirements.md`

**Your process:**
1. Read `specs/requirements.md`
2. Extract all project information
3. Ask 2-3 clarifying questions (platforms, team size)
4. Generate complete PRD with YAML + markdown

### Scenario 2: Multiple Documents

**User provides:**
- `docs/overview.md`
- `docs/features.md`
- `docs/tech-stack.md`

**Your process:**
1. Read all three files
2. Synthesize information across files
3. Ask 1-2 questions only if critical info missing
4. Generate unified PRD

### Scenario 3: No Files Provided

**User provides:** Nothing

**Your process:**
1. Fall back to interactive mode
2. Ask 10 standard PRD questions
3. Generate PRD from answers

## Output Format

1. **Create/overwrite** `docs/PRD.md`
2. Include YAML frontmatter at the top
3. Follow markdown structure above
4. Use tables for data models, API endpoints
5. Use checklists for acceptance criteria

## Quality Checklist

Before outputting the PRD, verify:

- ✅ YAML frontmatter is valid and complete
- ✅ All mandatory sections present
- ✅ User stories follow "As a... I want... So that..." format
- ✅ Compliance sections included if applicable
- ✅ Technical architecture is detailed
- ✅ Timeline is realistic
- ✅ Success metrics are measurable

## Best Practices

1. **Be thorough**: Extract every detail from input files
2. **Be smart**: Infer missing information when possible
3. **Be concise**: Only ask questions when truly necessary
4. **Be structured**: Follow the exact format above
5. **Be compliance-aware**: Auto-detect regulatory requirements

## Validation

After generating the PRD:
1. Show a summary of what was generated
2. Highlight any sections that need user input
3. Suggest running `claude analyze-prd` for validation

---

## Start Process

Begin by asking the user:

> **Generate PRD from Markdown Files**
>
> Please provide paths to your markdown files (one per line), or press Enter to skip and use interactive mode:
>
> Examples:
> - `docs/requirements.md`
> - `specs/features.md`
> - `notes/project-overview.md`
>
> (Press Enter when done)

Then proceed based on their input.
