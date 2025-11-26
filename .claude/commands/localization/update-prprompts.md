# Update PRPROMPTS with Localization Examples

Update the PRPROMPTS internationalization file with Arabic-English specific examples and RTL guidance.

## Prerequisites

Check that these exist:
- `PRPROMPTS/09-internationalization_i18n.md`
- `lib/l10n/app_en.arb`
- `lib/l10n/app_ar.arb`

If PRPROMPTS directory doesn't exist:
```
ℹ️  PRPROMPTS not found. Run /gen-prprompts first.
```

## Update Strategy

Read `PRPROMPTS/09-internationalization_i18n.md` and enhance with:

### 1. Add AR-EN Specific Examples

Add after EXAMPLES section with comprehensive ARB files and RTL configuration examples.

### 2. Add RTL Best Practices

Include:
- RTL layout testing checklist
- Common RTL mistakes to avoid
- EdgeInsetsDirectional usage
- Directionality handling

### 3. Add Arabic Typography

Include:
- Font configuration for Arabic
- Line height recommendations
- Diacritic support
- Regional variations (Gulf, Egyptian, Levantine)

### 4. Add to VALIDATION GATES

RTL-specific validation gates:
- Test with Arabic locale
- Verify RTL layout in Flutter Inspector
- Check EdgeInsetsDirectional usage
- Verify ARB keys exist in all languages
- Run flutter gen-l10n without errors

## Implementation

**IMPORTANT**: Don't remove existing content. Only ADD new sections.

Merge strategy:
1. Keep all existing sections
2. Add AR-EN SPECIFIC EXAMPLES as new section
3. Append to BEST PRACTICES
4. Add new items to VALIDATION GATES

## Show Update Summary

After updating:
```
✅ Updated PRPROMPTS/09-internationalization_i18n.md

Added:
- ar-en specific ARB examples
- RTL layout configuration code
- Arabic typography setup
- RTL best practices checklist
- Common RTL mistakes to avoid
- RTL-specific validation gates

📖 Review: PRPROMPTS/09-internationalization_i18n.md
```
