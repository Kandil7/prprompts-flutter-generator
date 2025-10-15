# PRPROMPTS Quick Install Script - PowerShell
# Version: 1.0.0
# Usage: irm https://raw.githubusercontent.com/Kandil7/prprompts-flutter-generator/master/scripts/setup-gist.ps1 | iex

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

Write-Host ""
Write-ColorOutput "╔═══════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║   PRPROMPTS Flutter Generator Setup      ║" "Cyan"
Write-ColorOutput "║   Quick Install - Claude Code Commands   ║" "Cyan"
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

# Create config directory
$PromptsDir = Join-Path $ConfigDir "prompts"
if (-not (Test-Path $PromptsDir)) {
    New-Item -ItemType Directory -Path $PromptsDir -Force | Out-Null
}

# Copy files
Write-ColorOutput "📦 Installing commands..." "Blue"
$SourcePrompts = Join-Path $TempDir ".claude\prompts"
Get-ChildItem -Path $SourcePrompts -Filter "*.md" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $PromptsDir -Force
}

$SourceConfig = Join-Path $TempDir ".claude\config.yml"
$DestConfig = Join-Path $ConfigDir "config.yml"
Copy-Item -Path $SourceConfig -Destination $DestConfig -Force

# Cleanup
Remove-Item -Path $TempDir -Recurse -Force

Write-Host ""
Write-ColorOutput "✅ Installation complete!" "Green"
Write-Host ""
Write-ColorOutput "╔═══════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║          Available Commands               ║" "Cyan"
Write-ColorOutput "╚═══════════════════════════════════════════╝" "Cyan"
Write-Host ""
Write-Host "  " -NoNewline
Write-ColorOutput "claude create-prd" "Green" -NoNewline
Write-Host "       Interactive PRD wizard"
Write-Host "  " -NoNewline
Write-ColorOutput "claude auto-gen-prd" "Green" -NoNewline
Write-Host "     Auto-generate PRD"
Write-Host "  " -NoNewline
Write-ColorOutput "claude prd-from-files" "Green" -NoNewline
Write-Host "   Generate PRD from markdown files"
Write-Host "  " -NoNewline
Write-ColorOutput "claude analyze-prd" "Green" -NoNewline
Write-Host "      Validate PRD"
Write-Host "  " -NoNewline
Write-ColorOutput "claude gen-prprompts" "Green" -NoNewline
Write-Host "    Generate all 32 files"
Write-Host "  " -NoNewline
Write-ColorOutput "claude gen-phase-1" "Green" -NoNewline
Write-Host "      Generate Phase 1"
Write-Host "  " -NoNewline
Write-ColorOutput "claude gen-phase-2" "Green" -NoNewline
Write-Host "      Generate Phase 2"
Write-Host "  " -NoNewline
Write-ColorOutput "claude gen-phase-3" "Green" -NoNewline
Write-Host "      Generate Phase 3"
Write-Host "  " -NoNewline
Write-ColorOutput "claude gen-file" "Green" -NoNewline
Write-Host "         Generate single file"
Write-Host ""
Write-ColorOutput "╔═══════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║          Quick Start                      ║" "Cyan"
Write-ColorOutput "╚═══════════════════════════════════════════╝" "Cyan"
Write-Host ""
Write-Host "  " -NoNewline
Write-ColorOutput "1." "Yellow" -NoNewline
Write-Host " cd your-flutter-project"
Write-Host "  " -NoNewline
Write-ColorOutput "2." "Yellow" -NoNewline
Write-Host " claude create-prd"
Write-Host "  " -NoNewline
Write-ColorOutput "3." "Yellow" -NoNewline
Write-Host " claude gen-prprompts"
Write-Host "  " -NoNewline
Write-ColorOutput "4." "Yellow" -NoNewline
Write-Host " Start coding!"
Write-Host ""
Write-ColorOutput "📖 Documentation:" "Green"
Write-Host "  https://github.com/Kandil7/prprompts-flutter-generator"
Write-Host ""
Write-ColorOutput "💬 Support:" "Green"
Write-Host "  https://github.com/Kandil7/prprompts-flutter-generator/issues"
Write-Host ""
