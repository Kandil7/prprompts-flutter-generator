# Contributing to PRD-to-PRPROMPTS Generator

Thank you for your interest in contributing!

## How to Contribute

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/prprompts-flutter-generator.git
cd prprompts-flutter-generator
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Changes

- Add new prompts to `.claude/prompts/`
- Update documentation in `docs/`
- Add examples to `examples/`
- Create tests for new features

### 5. Test Your Changes

```bash
# Test PRD validation
./scripts/generate-prprompts.sh all --dry-run

# Test with example PRDs
cp examples/healthcare-prd.md test-project/docs/PRD.md
cd test-project
prp-gen
```

### 6. Commit

```bash
git add .
git commit -m "feat: add new compliance standard support"
```

Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `chore:` Maintenance

### 7. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style

- Use shellcheck for bash scripts
- Format markdown with prettier
- Keep prompt files under 2000 lines
- Add examples for new features

## Adding New Compliance Standards

1. Add standard to `templates/PRD-template.md`
2. Create customization rules in `.claude/prompts/prprompts-generator.md`
3. Add example PRD in `examples/`
4. Update README.md

## Questions?

Open an issue or discussion on GitHub!
