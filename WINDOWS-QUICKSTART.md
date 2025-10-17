# Windows Quick Start Guide

## 🚀 Super Fast Installation (3 Methods)

### ⚡ Method 1: One-Click Installer (Easiest!)

1. **Download** the repository:
   ```cmd
   git clone https://github.com/Kandil7/prprompts-flutter-generator.git
   cd prprompts-flutter-generator
   ```

2. **Double-click** `INSTALL-WINDOWS.bat`

3. **Done!** Start using:
   ```cmd
   claude create-prd
   ```

---

### 💻 Method 2: PowerShell One-Liner

Open **PowerShell** and run:

```powershell
irm https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.ps1 | iex
```

**If you get an error:**
```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Try again:
irm https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.ps1 | iex
```

---

### 🔧 Method 3: Command Prompt

Open **Command Prompt (cmd)** and run:

```cmd
curl -o %TEMP%\setup-prprompts.bat https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.bat && %TEMP%\setup-prprompts.bat
```

---

## ✅ Verify Installation

```cmd
claude --version
claude create-prd --help
```

You should see help text.

---

## 🎯 Quick Start

```cmd
REM Navigate to your Flutter project
cd C:\path\to\your\flutter-project

REM Create PRD
claude create-prd

REM Generate all PRPROMPTS
claude gen-prprompts

REM Start coding!
```

---

## ⚠️ Prerequisites

Make sure you have:

- ✅ **Node.js** (v14+): https://nodejs.org
- ✅ **Git** (optional but recommended): https://git-scm.com

That's it!

---

## 🐛 Troubleshooting

### "bash is not recognized"

You're trying to use Linux commands in PowerShell. Use Method 1 or 2 above instead.

### "claude is not recognized"

Install Claude Code:
```cmd
npm install -g @anthropic-ai/claude-code
```

### "npm is not recognized"

Install Node.js from: https://nodejs.org

### "Execution Policy" error

Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📖 Full Documentation

- [Windows Installation Guide](WINDOWS.md) - Complete guide
- [README](README.md) - Full documentation
- [Usage Guide](docs/USAGE.md) - How to use PRPROMPTS

---

## 💬 Need Help?

Create an issue: https://github.com/Kandil7/prprompts-flutter-generator/issues

---

**Made for Windows developers ❤️**
