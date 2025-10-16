# PRPROMPTS Generator - Customization Guide

Learn how to customize PRD templates, PRPROMPTS files, and generator behavior for your specific needs.

## Table of Contents

- [Customizing PRD Templates](#customizing-prd-templates)
- [Customizing PRPROMPTS Files](#customizing-prprompts-files)
- [Customizing Generator Behavior](#customizing-generator-behavior)
- [Adding Custom Compliance Standards](#adding-custom-compliance-standards)
- [Creating Custom Prompts](#creating-custom-prompts)
- [Team-Specific Customizations](#team-specific-customizations)
- [Advanced Customization](#advanced-customization)

---

## Customizing PRD Templates

### Modifying Existing Templates

```bash
# Copy template to customize
cp templates/PRD-full-template.md templates/PRD-custom.md

# Edit template
vim templates/PRD-custom.md
```

### Adding Custom YAML Fields

Add your own metadata fields to PRD frontmatter:

```yaml
---
# Standard fields
project_name: "MyApp"
project_type: "healthcare"
compliance: ["hipaa"]

# Custom fields
custom_field_1: "value"
design_system: "Material 3"
deployment_platform: "Firebase"
analytics_provider: "Mixpanel"
crash_reporting: "Sentry"
---
```

**How to Use Custom Fields in PRPROMPTS:**

Edit `.claude/prompts/prprompts-generator.md`:

```markdown
## Reading Custom PRD Fields

Extract custom fields from PRD:
- design_system: {{design_system}}
- deployment_platform: {{deployment_platform}}

Use these in generated files:
- If deployment_platform == "Firebase", include Firebase-specific CI/CD
- If analytics_provider == "Mixpanel", add Mixpanel integration guide
```

---

### Creating Industry-Specific Templates

```bash
# Create templates/PRD-retail.md for retail apps
cat > templates/PRD-retail.md << 'EOF'
---
project_type: "retail"
compliance: ["pci-dss", "gdpr"]
features:
  - product_catalog
  - shopping_cart
  - payment_processing
  - inventory_sync
  - loyalty_programs
---

# Retail App PRD Template

## Executive Summary
[Retail-specific sections...]

## E-commerce Features
### Product Catalog
- Search and filtering
- Image galleries
- Product variants (size, color)

### Shopping Cart
- Guest checkout
- Saved carts
- Wishlist

...
EOF
```

---

## Customizing PRPROMPTS Files

### Post-Generation Customization

```bash
# Generate baseline files
claude gen-prprompts

# Customize for your project
vim PRPROMPTS/01-feature_scaffold.md
```

**Safe Customizations:**

1. **Add Project-Specific Examples:**

```markdown
## EXAMPLES

### Standard Example (Generated)
lib/features/auth/presentation/login_screen.dart

### Your Project-Specific Examples
lib/modules/authentication/ui/screens/login_page.dart
lib/modules/authentication/ui/widgets/login_form.dart
lib/modules/authentication/controllers/auth_controller.dart
```

2. **Add Team Conventions:**

```markdown
## CONSTRAINTS

✅ DO: Use Clean Architecture layers
✅ DO: Follow our team naming convention (use_snake_case_for_files)
✅ DO: Add JSDoc-style comments for all public methods

❌ DON'T: Use StatefulWidget (prefer BLoC/Cubit)
❌ DON'T: Commit directly to main (use feature branches)
```

3. **Customize Validation Gates:**

```markdown
## VALIDATION GATES

### Pre-commit Checklist:
- [ ] Unit tests pass (flutter test)
- [ ] Code coverage ≥ 80% (flutter test --coverage)
- [ ] No business logic in widgets
- [ ] Linter passes (flutter analyze --no-fatal-infos)
- [ ] **Custom: Design review approved** ← Added
- [ ] **Custom: Accessibility audit passed** ← Added

### CI/CD Automation:
```yaml
# .github/workflows/validate.yml
- name: Custom validation
  run: |
    flutter test --coverage
    flutter analyze
    # Add your custom checks here
    ./scripts/custom-validation.sh
```
```

4. **Add Internal References:**

```markdown
## REFERENCES

### Official Docs
- Flutter Clean Architecture: https://...
- BLoC pattern: https://bloclibrary.dev

### Internal Docs (Custom)
- Team Wiki: https://wiki.yourcompany.com/flutter
- ADR-001: Clean Architecture Decision
- Style Guide: https://docs.yourcompany.com/flutter-style
- Code Review Checklist: https://...
```

---

### Creating Custom PRPROMPTS Files

Add new files beyond the 32 standard ones:

```bash
# Create custom file
cat > PRPROMPTS/33-custom_analytics.md << 'EOF'
# 33. Analytics Implementation Guide

## FEATURE
Track user behavior and app performance with Mixpanel analytics.

## EXAMPLES

### Track Screen View
```dart
// lib/core/analytics/analytics_service.dart
class AnalyticsService {
  final Mixpanel _mixpanel;

  void trackScreenView(String screenName) {
    _mixpanel.track('Screen View', properties: {
      'screen_name': screenName,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }
}
```

## CONSTRAINTS
✅ DO: Track user flows, not personal data
✅ DO: Get user consent before tracking

❌ DON'T: Track PHI or PII without encryption
❌ DON'T: Send analytics in debug builds

## VALIDATION GATES
- [ ] Consent banner shown before tracking
- [ ] Analytics disabled in debug mode
- [ ] No PHI/PII sent to analytics

## BEST PRACTICES

### Why track user flows?
Understanding how users navigate helps improve UX and
identify bottlenecks.

### Why disable analytics in debug?
Debug sessions generate false data and inflate metrics.

## REFERENCES
- Mixpanel Docs: https://developer.mixpanel.com
- GDPR Analytics: https://...
EOF
```

Update `PRPROMPTS/README.md` to include your custom files.

---

## Customizing Generator Behavior

### Modifying the Main Generator Prompt

Edit `.claude/prompts/prprompts-generator.md`:

```markdown
## CUSTOMIZATION RULES (Line 850+)

### Custom Rule Example

**Rule 7: Custom Design System Integration**

IF PRD contains `design_system: "Material 3"`:
- Add Material 3 theme setup in 06-design_system_usage.md
- Include M3 component examples
- Reference Material You color schemes

IF PRD contains `design_system: "Custom"`:
- Add design tokens documentation
- Include Figma integration guide
- Add custom component catalog
```

---

### Adding Custom Validation Rules

```bash
# Edit .claude/prompts/prprompts-generator.md
vim .claude/prompts/prprompts-generator.md
```

Add to VALIDATION GATES section:

```markdown
### Custom Validation: API Response Caching

IF PRD specifies `offline_support: true`:

VALIDATION GATES for 04-api_integration.md must include:

Pre-commit:
- [ ] API responses cached in local database
- [ ] Cache expiry logic implemented
- [ ] Offline error handling tested

CI/CD:
```bash
# Test offline mode
flutter drive --target=test_driver/offline_test.dart
```
```

---

## Adding Custom Compliance Standards

### Example: Adding ISO 27001 Support

1. **Update PRD Template:**

```yaml
# templates/PRD-custom.md
---
compliance: ["iso27001", "hipaa"]
---
```

2. **Add to Generator Prompt:**

Edit `.claude/prompts/prprompts-generator.md`:

```markdown
### ISO 27001 Compliance (Custom)

IF PRD contains `compliance: ["iso27001"]`:

In `16-security_and_compliance.md`, add:

**ISO 27001 Requirements:**

1. **Access Control (A.9)**
   - Role-based access control (RBAC)
   - Multi-factor authentication
   - Session timeout (15 minutes max)

2. **Cryptography (A.10)**
   - TLS 1.3 for all network traffic
   - AES-256-GCM for data at rest
   - Secure key storage (Keychain/Keystore)

3. **Audit Logging (A.12.4)**
   ```dart
   // Log all security events
   await auditLogger.log(
     event: 'user_login',
     userId: user.id,
     timestamp: DateTime.now(),
     ipAddress: request.ip,
   );
   ```

VALIDATION GATES:
- [ ] All network calls use TLS 1.3
- [ ] Audit logs include user, timestamp, action
- [ ] RBAC implemented for all features
```

3. **Create Compliance Checklist:**

```bash
# Create templates/checklists/ISO27001-checklist.md
cat > templates/checklists/ISO27001-checklist.md << 'EOF'
# ISO 27001 Compliance Checklist

## A.9 Access Control
- [ ] RBAC implemented
- [ ] MFA enabled for admin users
- [ ] Session timeout configured (15 min)

## A.10 Cryptography
- [ ] TLS 1.3 enforced
- [ ] AES-256-GCM for local data
- [ ] Keys stored in secure enclave

## A.12 Operations Security
- [ ] Audit logging implemented
- [ ] Log retention policy (1 year minimum)
- [ ] Automated security scanning in CI/CD
EOF
```

---

## Creating Custom Prompts

### Adding New Claude Code Commands

1. **Create Prompt File:**

```bash
cat > .claude/prompts/custom-analytics-setup.md << 'EOF'
# Custom Analytics Setup

You are tasked with setting up Mixpanel analytics for a Flutter app.

## Task

1. Read the PRD from `docs/PRD.md`
2. Add Mixpanel dependency to `pubspec.yaml`
3. Create `lib/core/analytics/analytics_service.dart`
4. Implement screen view tracking
5. Add consent banner if GDPR compliance required

## Constraints

- DO NOT track PHI or PII without user consent
- DO disable analytics in debug builds
- DO add analytics events to PRPROMPTS/33-custom_analytics.md

## Output

Provide:
1. Updated pubspec.yaml
2. AnalyticsService implementation
3. Example usage in a screen
4. GDPR consent banner (if needed)
EOF
```

2. **Register in config.yml:**

```yaml
# .claude/config.yml
prompts:
  setup-analytics:
    file: "prompts/custom-analytics-setup.md"
    description: "Set up Mixpanel analytics with GDPR support"
```

3. **Use New Command:**

```bash
claude setup-analytics
```

---

### Creating Multi-Step Workflows

```bash
cat > .claude/prompts/custom-full-setup.md << 'EOF'
# Full Project Setup Workflow

## Task

Set up a new Flutter project with our company standards.

## Steps

1. **PRD Creation**
   - Read `project_description.md`
   - Generate PRD using auto-gen-prd workflow
   - Save to `docs/PRD.md`

2. **PRPROMPTS Generation**
   - Generate all 32 PRPROMPTS files
   - Add custom file: 33-analytics.md
   - Add custom file: 34-error-tracking.md

3. **Project Structure**
   - Create folder structure:
     ```
     lib/
       core/
       features/
       shared/
     ```
   - Add barrel files (index.dart)

4. **Dependencies**
   - Add standard packages:
     - flutter_bloc
     - dio
     - get_it
     - mixpanel_flutter
     - sentry_flutter

5. **CI/CD**
   - Copy `.github/workflows/` from template
   - Configure Sentry DSN
   - Configure Mixpanel token

## Constraints

- Follow Clean Architecture
- Use BLoC for state management
- 80%+ test coverage required

## Output

Provide summary of:
- Generated files
- Dependencies added
- CI/CD status
- Next steps for developer
EOF
```

---

## Team-Specific Customizations

### Creating Team Templates

```bash
# Create templates/team-config.yml
cat > templates/team-config.yml << 'EOF'
team:
  name: "Mobile Team"
  size: 12
  timezone: "PST"

code_review:
  min_approvals: 2
  required_reviewers: ["@senior-dev"]

testing:
  min_coverage: 85
  required_tests: ["unit", "widget", "integration"]

tools:
  design: "Figma"
  analytics: "Mixpanel"
  crash_reporting: "Sentry"
  ci_cd: "GitHub Actions"

conventions:
  file_naming: "snake_case"
  class_naming: "PascalCase"
  max_file_length: 300
  max_function_length: 50
EOF
```

### Using Team Config in Generator

Edit `.claude/prompts/prprompts-generator.md`:

```markdown
## Team Configuration Support

IF `templates/team-config.yml` exists:
1. Read team configuration
2. Apply team-specific rules:
   - Code review requirements from `code_review`
   - Testing standards from `testing`
   - Tool integrations from `tools`
   - Naming conventions from `conventions`

EXAMPLE: If team.tools.analytics == "Mixpanel":
- Add Mixpanel integration to 24-dashboard_and_analytics.md
- Include Mixpanel setup in onboarding guide
```

---

## Advanced Customization

### Custom File Name Patterns

```bash
# Edit scripts/generate-prprompts.sh
vim scripts/generate-prprompts.sh
```

Change numbering scheme:

```bash
# Instead of: 01-feature_scaffold.md
# Use: P1-01-feature_scaffold.md (with phase prefix)

# Or use categories:
# ARCH-01-feature_scaffold.md
# TEST-05-testing_strategy.md
# SEC-16-security_and_compliance.md
```

---

### Conditional File Generation

Edit generator prompt to skip files:

```markdown
## Conditional Generation

SKIP files based on PRD:

IF PRD `offline_support: false`:
  - SKIP sync-related sections in files
  - Remove offline examples

IF PRD `real_time: false`:
  - SKIP WebSocket examples
  - Remove real-time sections

IF PRD `compliance` is empty:
  - Generate simplified 16-security_and_compliance.md
  - Skip compliance-specific checklists
```

---

### Multi-Language Support

```bash
# Create language-specific prompts
mkdir -p .claude/prompts/lang/{es,fr,de}

# Spanish version
cp .claude/prompts/prprompts-generator.md \
   .claude/prompts/lang/es/prprompts-generator-es.md

# Translate headers and documentation
vim .claude/prompts/lang/es/prprompts-generator-es.md
```

Update config.yml:

```yaml
prompts:
  gen-prprompts-es:
    file: "prompts/lang/es/prprompts-generator-es.md"
    description: "Generar PRPROMPTS en español"
```

---

### Custom Output Formats

Generate in different formats:

```bash
# Create .claude/prompts/prprompts-json-generator.md
# Output JSON instead of markdown

cat > .claude/prompts/export-to-notion.md << 'EOF'
# Export PRPROMPTS to Notion

## Task

Convert PRPROMPTS markdown files to Notion pages.

1. Read all PRPROMPTS/*.md files
2. Convert markdown to Notion blocks format
3. Use Notion API to create pages
4. Organize in Notion database

## Output

JSON array of Notion page objects.
EOF
```

---

## Best Practices for Customization

### 1. Version Control Your Customizations

```bash
git add .claude/ templates/ PRPROMPTS/
git commit -m "feat: customize PRPROMPTS for team conventions"
git tag -a v1.0-custom -m "Customized baseline"
```

### 2. Document Your Changes

```bash
# Create CUSTOMIZATIONS.md in your project
cat > CUSTOMIZATIONS.md << 'EOF'
# Project Customizations

## PRPROMPTS Customizations

### Added Files
- 33-custom_analytics.md - Mixpanel integration guide
- 34-error_tracking.md - Sentry setup and usage

### Modified Files
- 01-feature_scaffold.md - Added company folder structure
- 16-security_and_compliance.md - Added ISO 27001 checklist

### Custom Prompts
- setup-analytics - Automated Mixpanel setup
- setup-sentry - Automated Sentry configuration

## Team Conventions
- Use snake_case for file names
- Minimum 85% test coverage
- 2 required approvals for PRs
EOF
```

### 3. Share Across Projects

```bash
# Create shared template repository
git clone https://github.com/your-org/prprompts-company-template.git

# Copy customizations
cp -r .claude/ ~/prprompts-company-template/
cp -r templates/ ~/prprompts-company-template/
cp PRPROMPTS/33-*.md ~/prprompts-company-template/custom-files/

# Push to shared repo
cd ~/prprompts-company-template
git add .
git commit -m "feat: add company-wide customizations"
git push
```

### 4. Test Customizations

```bash
# Test custom prompt
claude setup-analytics --dry-run

# Test custom generator
claude gen-prprompts
git diff PRPROMPTS/  # Review changes
```

---

## Example: Complete Customization Workflow

```bash
# 1. Clone generator
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator

# 2. Create custom branch
git checkout -b company-custom

# 3. Customize PRD template
cp templates/PRD-full-template.md templates/PRD-company.md
vim templates/PRD-company.md  # Add company fields

# 4. Customize generator
vim .claude/prompts/prprompts-generator.md  # Add company rules

# 5. Add custom files
cat > .claude/prompts/setup-company-tools.md << 'EOF'
# Setup Company Tools
- Add Mixpanel
- Add Sentry
- Configure CI/CD
EOF

# 6. Update config
vim .claude/config.yml  # Register new prompts

# 7. Test
cd ../test-project
claude create-prd  # Use customized workflow
claude gen-prprompts  # Generate with custom rules

# 8. Commit customizations
git add .
git commit -m "feat: company-specific customizations"
git push origin company-custom

# 9. Share with team
# Team members clone your custom branch
```

---

## Need Help?

- [Usage Guide](USAGE.md) - How to use the generator
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues
- [API Reference](API.md) - Command reference
- [GitHub Issues](https://github.com/Kandil7/prprompts-flutter-generator/issues)

---

## Quick Reference

```bash
# Customize PRD template
cp templates/PRD-full-template.md templates/PRD-custom.md

# Customize generated PRPROMPTS
vim PRPROMPTS/01-feature_scaffold.md

# Create custom prompt
vim .claude/prompts/custom-prompt.md

# Register custom command
# Edit .claude/config.yml

# Test customization
claude custom-command --dry-run

# Version control
git add .claude/ templates/ PRPROMPTS/
git commit -m "feat: custom team conventions"
```
