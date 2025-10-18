# PRPROMPTS Quick Install Script - PowerShell
# Version: 4.0.0
# Usage: irm https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.ps1 | iex

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

Write-Host ""
Write-ColorOutput "╔═══════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║   PRPROMPTS v4.0 Flutter Generator       ║" "Cyan"
Write-ColorOutput "║   Quick Install - Claude Code + v4.0     ║" "Cyan"
Write-ColorOutput "╚═══════════════════════════════════════════╝" "Cyan"
Write-Host ""

# Detect OS
Write-ColorOutput "Detected OS: Windows" "Yellow"
Write-Host ""

# Set config directory
$ConfigDir = Join-Path $env:USERPROFILE ".config\claude"
$TempDir = Join-Path $env:TEMP "prprompts-flutter-generator"

# Check for Claude Code
Write-Host "Checking for Claude Code CLI..." -ForegroundColor Blue
$claudeExists = $null -ne (Get-Command claude -ErrorAction SilentlyContinue)

if (-not $claudeExists) {
    Write-ColorOutput "⚠️  Claude Code not found. Installing..." "Yellow"

    $npmExists = $null -ne (Get-Command npm -ErrorAction SilentlyContinue)
    if ($npmExists) {
        npm install -g @anthropic-ai/claude-code
    } else {
        Write-ColorOutput "❌ npm not found. Please install Node.js first: https://nodejs.org" "Red"
        exit 1
    }
}

Write-ColorOutput "✅ Claude Code found" "Green"
Write-Host ""

# Clone repository
Write-ColorOutput "📥 Downloading PRPROMPTS..." "Blue"

if (Test-Path $TempDir) {
    Remove-Item -Path $TempDir -Recurse -Force
}

try {
    git clone --depth 1 https://github.com/Kandil7/prprompts-flutter-generator.git "$TempDir" 2>&1 | Out-Null
} catch {
    Write-ColorOutput "❌ Git not found or clone failed. Please install Git: https://git-scm.com" "Red"
    exit 1
}

# Create config directories
$PromptsDir = Join-Path $ConfigDir "prompts"
$CommandsDir = Join-Path $ConfigDir "commands"
$AutomationDir = Join-Path $CommandsDir "automation"

if (-not (Test-Path $PromptsDir)) {
    New-Item -ItemType Directory -Path $PromptsDir -Force | Out-Null
}
if (-not (Test-Path $AutomationDir)) {
    New-Item -ItemType Directory -Path $AutomationDir -Force | Out-Null
}

# Copy prompt files
Write-ColorOutput "📦 Installing prompt files..." "Blue"
$SourcePrompts = Join-Path $TempDir ".claude\prompts"
Get-ChildItem -Path $SourcePrompts -Filter "*.md" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $PromptsDir -Force
}
Write-ColorOutput "✓ Installed 9 prompt files" "Green"

# Copy automation commands (v4.0)
Write-ColorOutput "🤖 Installing v4.0 automation commands..." "Blue"
$SourceAutomation = Join-Path $TempDir ".claude\commands\automation"
if (Test-Path $SourceAutomation) {
    Get-ChildItem -Path $SourceAutomation -Filter "*.md" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $AutomationDir -Force
    }
    Write-ColorOutput "✓ Installed 5 automation commands" "Green"
}

# Copy config.yml
Write-ColorOutput "⚙️  Installing config..." "Blue"
$SourceConfig = Join-Path $TempDir ".claude\config.yml"
$DestConfig = Join-Path $ConfigDir "config.yml"
Copy-Item -Path $SourceConfig -Destination $DestConfig -Force
Write-ColorOutput "✓ Config file installed" "Green"

# Cleanup
Remove-Item -Path $TempDir -Recurse -Force

Write-Host ""
Write-ColorOutput "✅ Installation complete!" "Green"
Write-Host ""
Write-ColorOutput "╔═══════════════════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║          Available Commands (14 total)               ║" "Cyan"
Write-ColorOutput "╚═══════════════════════════════════════════════════════╝" "Cyan"
Write-Host ""

Write-ColorOutput "PRD Generation:" "Yellow"
Write-Host "  " -NoNewline
Write-ColorOutput "claude create-prd" "Green" -NoNewline
Write-Host "          Interactive PRD wizard"
Write-Host "  " -NoNewline
Write-ColorOutput "claude auto-gen-prd" "Green" -NoNewline
Write-Host "        Auto-generate from description"
Write-Host "  " -NoNewline
Write-ColorOutput "claude prd-from-files" "Green" -NoNewline
Write-Host "      Generate from existing docs"
Write-Host "  " -NoNewline
Write-ColorOutput "claude analyze-prd" "Green" -NoNewline
Write-Host "         Validate PRD"
Write-Host ""

Write-ColorOutput "PRPROMPTS Generation:" "Yellow"
Write-Host "  " -NoNewline
Write-ColorOutput "claude gen-prprompts" "Green" -NoNewline
Write-Host "       Generate all 32 files"
Write-Host "  " -NoNewline
Write-ColorOutput "claude gen-phase-1" "Green" -NoNewline
Write-Host "         Phase 1: Core Architecture"
Write-Host "  " -NoNewline
Write-ColorOutput "claude gen-phase-2" "Green" -NoNewline
Write-Host "         Phase 2: Quality & Security"
Write-Host "  " -NoNewline
Write-ColorOutput "claude gen-phase-3" "Green" -NoNewline
Write-Host "         Phase 3: Demo & Learning"
Write-Host "  " -NoNewline
Write-ColorOutput "claude gen-file" "Green" -NoNewline
Write-Host "            Generate single file"
Write-Host ""

Write-ColorOutput "🆕 v4.0 Automation (40-60x faster!):" "Yellow"
Write-Host "  " -NoNewline
Write-ColorOutput "claude bootstrap-from-prprompts" "Green" -NoNewline
Write-Host "  Complete setup (2 min)"
Write-Host "  " -NoNewline
Write-ColorOutput "claude implement-next" "Green" -NoNewline
Write-Host "         Auto-implement feature (10 min)"
Write-Host "  " -NoNewline
Write-ColorOutput "claude full-cycle" "Green" -NoNewline
Write-Host "             Implement 1-10 features (1-2 hours)"
Write-Host "  " -NoNewline
Write-ColorOutput "claude review-and-commit" "Green" -NoNewline
Write-Host "      Validate & commit"
Write-Host "  " -NoNewline
Write-ColorOutput "claude qa-check" "Green" -NoNewline
Write-Host "                Compliance audit"
Write-Host ""
Write-ColorOutput "╔═══════════════════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║          Quick Start                                  ║" "Cyan"
Write-ColorOutput "╚═══════════════════════════════════════════════════════╝" "Cyan"
Write-Host ""

Write-ColorOutput "Manual Workflow:" "Yellow"
Write-Host "  " -NoNewline
Write-ColorOutput "1." "Cyan" -NoNewline
Write-Host " cd your-flutter-project"
Write-Host "  " -NoNewline
Write-ColorOutput "2." "Cyan" -NoNewline
Write-Host " claude create-prd"
Write-Host "  " -NoNewline
Write-ColorOutput "3." "Cyan" -NoNewline
Write-Host " claude gen-prprompts"
Write-Host "  " -NoNewline
Write-ColorOutput "4." "Cyan" -NoNewline
Write-Host " Start coding with PRPROMPTS guides!"
Write-Host ""

Write-ColorOutput "🆕 v4.0 Automated Workflow (Recommended!):" "Yellow"
Write-Host "  " -NoNewline
Write-ColorOutput "1." "Cyan" -NoNewline
Write-Host " cd your-flutter-project"
Write-Host "  " -NoNewline
Write-ColorOutput "2." "Cyan" -NoNewline
Write-Host " claude create-prd && claude gen-prprompts"
Write-Host "  " -NoNewline
Write-ColorOutput "3." "Cyan" -NoNewline
Write-Host " claude bootstrap-from-prprompts"
Write-Host "  " -NoNewline
Write-ColorOutput "4." "Cyan" -NoNewline
Write-Host " claude full-cycle"
Write-Host "  " -NoNewline
Write-ColorOutput "5." "Cyan" -NoNewline
Write-Host " claude qa-check"
Write-Host ""
Write-ColorOutput "Result: Production app in 2-3 hours! 🚀" "Green"
Write-Host ""
Write-ColorOutput "📖 Documentation:" "Green"
Write-Host "  https://github.com/Kandil7/prprompts-flutter-generator"
Write-Host ""
Write-ColorOutput "💬 Support:" "Green"
Write-Host "  https://github.com/Kandil7/prprompts-flutter-generator/issues"
Write-Host ""
