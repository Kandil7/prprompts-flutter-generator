# PRPROMPTS Gemini CLI Skills Installer (PowerShell)
# Installs all PRPROMPTS skills as global Gemini CLI TOML slash commands

$ErrorActionPreference = "Stop"

Write-Host "🚀 Installing PRPROMPTS Skills for Gemini CLI..." -ForegroundColor Cyan
Write-Host ""

# Gemini directory
$GeminiDir = Join-Path $env:USERPROFILE ".gemini"

# Create skills directory structure
Write-Host "📁 Creating skills directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path (Join-Path $GeminiDir "commands\skills\automation") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $GeminiDir "commands\skills\prprompts-core") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $GeminiDir "commands\skills\development-workflow") | Out-Null

# Get repository directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoDir = Split-Path -Parent $ScriptDir

# Copy all TOML skill files
Write-Host "📦 Installing skill files..." -ForegroundColor Yellow

$TotalSkills = 0

# Automation skills
$AutomationSource = Join-Path $RepoDir ".gemini\commands\skills\automation"
if (Test-Path $AutomationSource) {
    Copy-Item "$AutomationSource\*.toml" -Destination (Join-Path $GeminiDir "commands\skills\automation") -Force
    $AutomationCount = (Get-ChildItem (Join-Path $GeminiDir "commands\skills\automation") -Filter "*.toml").Count
    Write-Host "  ✅ Automation skills: $AutomationCount files" -ForegroundColor Green
    $TotalSkills += $AutomationCount
}

# PRPROMPTS Core skills
$CoreSource = Join-Path $RepoDir ".gemini\commands\skills\prprompts-core"
if (Test-Path $CoreSource) {
    Copy-Item "$CoreSource\*.toml" -Destination (Join-Path $GeminiDir "commands\skills\prprompts-core") -Force
    $CoreCount = (Get-ChildItem (Join-Path $GeminiDir "commands\skills\prprompts-core") -Filter "*.toml").Count
    Write-Host "  ✅ PRPROMPTS Core skills: $CoreCount files" -ForegroundColor Green
    $TotalSkills += $CoreCount
}

# Development Workflow skills
$WorkflowSource = Join-Path $RepoDir ".gemini\commands\skills\development-workflow"
if (Test-Path $WorkflowSource) {
    Copy-Item "$WorkflowSource\*.toml" -Destination (Join-Path $GeminiDir "commands\skills\development-workflow") -Force
    $WorkflowCount = (Get-ChildItem (Join-Path $GeminiDir "commands\skills\development-workflow") -Filter "*.toml").Count
    Write-Host "  ✅ Workflow skills: $WorkflowCount files" -ForegroundColor Green
    $TotalSkills += $WorkflowCount
}

Write-Host ""
Write-Host "✨ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Total skills installed: $TotalSkills"
Write-Host "  Installation path: $GeminiDir\commands\skills\"
Write-Host ""
Write-Host "🎯 Usage Examples:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  # Start Gemini CLI"
Write-Host "  gemini"
Write-Host ""
Write-Host "  # Use skills via slash commands (colon separator):"
Write-Host "  /skills:automation:flutter-bootstrapper"
Write-Host "  /skills:automation:feature-implementer"
Write-Host "  /skills:automation:code-reviewer"
Write-Host "  /skills:automation:qa-auditor"
Write-Host "  /skills:automation:automation-orchestrator"
Write-Host ""
Write-Host "  /skills:prprompts-core:phase-generator"
Write-Host "  /skills:prprompts-core:single-file-generator"
Write-Host ""
Write-Host "  /skills:development-workflow:flutter-flavors"
Write-Host ""
Write-Host "💡 Gemini-specific features:" -ForegroundColor Cyan
Write-Host "  # Inline arguments"
Write-Host "  /skills:automation:code-reviewer security lib/features/auth"
Write-Host ""
Write-Host "  # Leverage 1M token context for entire codebase analysis"
Write-Host "  # Free tier: 60 req/min, 1,000/day"
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "  Full guide: docs\GEMINI-SKILLS-GUIDE.md"
Write-Host "  Gemini setup: GEMINI.md"
Write-Host ""

# Verify installation
Write-Host "🔍 Verifying installation..." -ForegroundColor Yellow
if ($TotalSkills -eq 8) {
    Write-Host "  ✅ All 8 skills installed successfully!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Expected 8 skills, but found $TotalSkills" -ForegroundColor Yellow
}

# Check if Gemini CLI is available
$GeminiCmd = Get-Command gemini -ErrorAction SilentlyContinue
if ($GeminiCmd) {
    Write-Host "  ✅ Gemini CLI is installed and available" -ForegroundColor Green
    Write-Host "  💡 Restart Gemini CLI and run /help to see new skills"
} else {
    Write-Host "  ⚠️  Gemini CLI not found" -ForegroundColor Yellow
    Write-Host "  💡 Install with: npm install -g @google/gemini-cli"
}

Write-Host ""
Write-Host "✅ Installation successful!" -ForegroundColor Green
