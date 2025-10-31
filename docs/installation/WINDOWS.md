# Windows Installation Guide

Quick guide for installing PRPROMPTS Flutter Generator on Windows.

## 🚀 Quick Install (Recommended)

Choose the method that works best for your Windows setup:

### Method 1: PowerShell (One-Line) ⚡

Open **PowerShell** and run:

```powershell
irm https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.ps1 | iex
```

**Note:** If you get an execution policy error, run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Method 2: Command Prompt (One-Line)

Open **Command Prompt (cmd)** and run:

```cmd
curl -o %TEMP%\setup-prprompts.bat https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.bat && %TEMP%\setup-prprompts.bat
```

**Note:** Requires curl (available in Windows 10 1803+ and Windows 11)

### Method 3: Git Bash (If Installed)

Open **Git Bash** and run:

```bash
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.sh | bash
```

## 📦 Manual Installation

If you prefer to install manually or already cloned the repository:

### Step 1: Clone Repository

```cmd
git clone https://github.com/Kandil7/prprompts-flutter-generator.git
cd prprompts-flutter-generator
```

### Step 2: Run Installer

Choose one:

**Batch Script (Easiest):**
```cmd
scripts\install-commands.bat --global
```

**PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-commands.ps1 --global
```

**Git Bash:**
```bash
./scripts/install-commands.sh --global
```

## ✅ Verify Installation

Test that everything works:

```cmd
claude create-prd --help
```

You should see the help message for the PRD creation command.

## 🎯 Quick Start

After installation, use these commands from any directory:

```cmd
REM Navigate to your Flutter project
cd C:\path\to\your\flutter-project

REM Create a PRD interactively
claude create-prd

REM Or auto-generate from description
claude auto-gen-prd

REM Generate all PRPROMPTS files
claude gen-prprompts
```

## 📁 Installation Location

Commands are installed to:
```
%USERPROFILE%\.config\claude\
├── prompts\
│   ├── generate-prd.md
│   ├── auto-generate-prd.md
│   ├── analyze-prd.md
│   └── ... (8 prompt files)
└── config.yml
```

## 🔧 Troubleshooting

### "PowerShell execution policy" error

Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "curl is not recognized" error

- **Windows 10:** Update to version 1803 or later
- **Windows 11:** curl is pre-installed
- **Alternative:** Use PowerShell method or install [Git for Windows](https://git-scm.com)

### "git is not recognized" error

Install [Git for Windows](https://git-scm.com/download/win)

### "claude is not recognized" error

Install Claude Code CLI:
```cmd
npm install -g @anthropic-ai/claude-code
```

If npm is not installed, get [Node.js](https://nodejs.org)

### Commands don't work after installation

1. Close and reopen your terminal
2. Verify installation location exists:
   ```cmd
   dir %USERPROFILE%\.config\claude
   ```
3. Check config file:
   ```cmd
   type %USERPROFILE%\.config\claude\config.yml
   ```

## 🌐 Path Issues

If you're using WSL (Windows Subsystem for Linux):

```bash
# Install in WSL
curl -sSL https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.sh | bash
```

Config will be at: `~/.config/claude/`

## 📖 Next Steps

- [PRD Creation Guide](docs/PRD-GUIDE.md)
- [Auto PRD Guide](docs/AUTO-PRD-GUIDE.md)
- [Usage Guide](docs/USAGE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 💬 Support

Having issues? Create an issue at:
https://github.com/Kandil7/prprompts-flutter-generator/issues

---

**Made with ❤️ for Windows developers**
