# Qwen Commands Test Guide

Use this file to test your Qwen Code installation.

## Quick Test Commands

### 1. Basic Commands (should work immediately)
```bash
# In Qwen REPL, type:
/create-prd
/gen-prprompts
/analyze-prd
```

### 2. Automation Commands (v4.0)
```bash
# Test automation:
/bootstrap-from-prprompts
/implement-next
/full-cycle
```

## Expected Behavior

### ✅ Working Correctly:
- Command starts executing immediately
- Shows progress messages
- Performs actions without asking "what should I do?"

### ❌ Not Working:
- Shows: "✦ Okay, I have received and understood the context..."
- Asks: "What would you like me to do?"
- Only acknowledges but doesn't execute

## Troubleshooting

If commands don't work:

### Option 1: Check config.yml
```bash
cat ~/.config/qwen/config.yml
```
Should show all 14 commands mapped.

### Option 2: Reload Qwen
```bash
# Exit Qwen and restart
qwen
```

### Option 3: Test with full path
```bash
# In Qwen REPL:
/create-prd --help
```

## Test in Real Project

Best test: Create a Flutter project and run full workflow:

```bash
# 1. Create test project
cd ~/test-project
flutter create my_test_app
cd my_test_app

# 2. Run Qwen
qwen

# 3. In Qwen REPL:
/create-prd

# 4. Answer questions, then:
/gen-prprompts

# 5. Test automation:
/bootstrap-from-prprompts
```

## Expected Results

After `/bootstrap-from-prprompts`:
- Creates `docs/ARCHITECTURE.md`
- Creates `docs/IMPLEMENTATION_PLAN.md`
- Sets up folder structure
- Installs dependencies
- Creates initial files
- Shows success summary

## Report Issues

If commands don't execute:
1. Check which step failed
2. Share error messages
3. Check ~/.config/qwen/ files exist
