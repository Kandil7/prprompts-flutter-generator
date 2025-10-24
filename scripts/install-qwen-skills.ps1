# PRPROMPTS Qwen Code Skills Installer (PowerShell)
# Installs all PRPROMPTS skills as global Qwen Code TOML slash commands

$ErrorActionPreference = "Stop"

Write-Host "🚀 Installing PRPROMPTS Skills for Qwen Code..." -ForegroundColor Cyan
Write-Host ""

# Qwen directory
$QwenDir = Join-Path $env:USERPROFILE ".qwen"

# Create skills directory structure
Write-Host "📁 Creating skills directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path (Join-Path $QwenDir "commands\skills\automation") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $QwenDir "commands\skills\prprompts-core") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $QwenDir "commands\skills\development-workflow") | Out-Null

# Get repository directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoDir = Split-Path -Parent $ScriptDir

# Copy all TOML skill files
Write-Host "📦 Installing skill files..." -ForegroundColor Yellow

$TotalSkills = 0

# Automation skills
$AutomationSource = Join-Path $RepoDir ".qwen\commands\skills\automation"
if (Test-Path $AutomationSource) {
    Copy-Item "$AutomationSource\*.toml" -Destination (Join-Path $QwenDir "commands\skills\automation") -Force
    $AutomationCount = (Get-ChildItem (Join-Path $QwenDir "commands\skills\automation") -Filter "*.toml").Count
    Write-Host "  ✅ Automation skills: $AutomationCount files" -ForegroundColor Green
    $TotalSkills += $AutomationCount
}

# PRPROMPTS Core skills
$CoreSource = Join-Path $RepoDir ".qwen\commands\skills\prprompts-core"
if (Test-Path $CoreSource) {
    Copy-Item "$CoreSource\*.toml" -Destination (Join-Path $QwenDir "commands\skills\prprompts-core") -Force
    $CoreCount = (Get-ChildItem (Join-Path $QwenDir "commands\skills\prprompts-core") -Filter "*.toml").Count
    Write-Host "  ✅ PRPROMPTS Core skills: $CoreCount files" -ForegroundColor Green
    $TotalSkills += $CoreCount
}

# Development Workflow skills
$WorkflowSource = Join-Path $RepoDir ".qwen\commands\skills\development-workflow"
if (Test-Path $WorkflowSource) {
    Copy-Item "$WorkflowSource\*.toml" -Destination (Join-Path $QwenDir "commands\skills\development-workflow") -Force
    $WorkflowCount = (Get-ChildItem (Join-Path $QwenDir "commands\skills\development-workflow") -Filter "*.toml").Count
    Write-Host "  ✅ Workflow skills: $WorkflowCount files" -ForegroundColor Green
    $TotalSkills += $WorkflowCount
}

Write-Host ""
Write-Host "✨ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Total skills installed: $TotalSkills"
Write-Host "  Installation path: $QwenDir\commands\skills\"
Write-Host ""
Write-Host "🎯 Usage Examples:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  # Start Qwen Code"
Write-Host "  qwen"
Write-Host ""
Write-Host "  # Use skills via slash commands:"
Write-Host "  /skills/automation/flutter-bootstrapper"
Write-Host "  /skills/automation/feature-implementer"
Write-Host "  /skills/automation/code-reviewer"
Write-Host "  /skills/automation/qa-auditor"
Write-Host "  /skills/automation/automation-orchestrator"
Write-Host ""
Write-Host "  /skills/prprompts-core/phase-generator"
Write-Host "  /skills/prprompts-core/single-file-generator"
Write-Host ""
Write-Host "  /skills/development-workflow/flutter-flavors"
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "  Full guide: docs\QWEN-SKILLS-GUIDE.md"
Write-Host "  Qwen setup: QWEN.md"
Write-Host ""
Write-Host "✅ Installation successful!" -ForegroundColor Green
