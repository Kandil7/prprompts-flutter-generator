# Install PRPROMPTS Qwen Code Commands
# Windows PowerShell Script
# Usage: powershell -ExecutionPolicy Bypass -File install-qwen-commands.ps1 [--global|--local]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("--global", "--local")]
    [string]$Mode = "--global"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Blue
Write-Host " PRPROMPTS Qwen Code Commands Installer" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoDir = Split-Path -Parent $ScriptDir

# Determine install location
if ($Mode -eq "--global") {
    $ConfigDir = Join-Path $env:USERPROFILE ".config\qwen"
    Write-Host "Installing globally to: $ConfigDir" -ForegroundColor Yellow
} else {
    $ConfigDir = Join-Path $PWD ".qwen"
    Write-Host "Installing locally to: $ConfigDir" -ForegroundColor Yellow
}

# Create directories
$PromptsDir = Join-Path $ConfigDir "prompts"
if (!(Test-Path $PromptsDir)) {
    New-Item -ItemType Directory -Path $PromptsDir -Force | Out-Null
}

# Prompt files to copy
$PromptFiles = @(
    "generate-prd.md",
    "auto-generate-prd.md",
    "generate-prd-from-files.md",
    "analyze-prd.md",
    "prprompts-generator.md",
    "phase-1-core.md",
    "phase-2-quality.md",
    "phase-3-demo.md",
    "single-file-generator.md"
)

# Copy prompt files
Write-Host ""
Write-Host "Copying prompt files..." -ForegroundColor Green
foreach ($file in $PromptFiles) {
    $SourcePath = Join-Path $RepoDir ".qwen\prompts\$file"
    $DestPath = Join-Path $PromptsDir $file
    Copy-Item -Path $SourcePath -Destination $DestPath -Force
}

# Copy config file
Write-Host "Creating config.yml..." -ForegroundColor Green
$ConfigSource = Join-Path $RepoDir ".qwen\config.yml"
$ConfigDest = Join-Path $ConfigDir "config.yml"
Copy-Item -Path $ConfigSource -Destination $ConfigDest -Force

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host " Installation complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Blue
Write-Host "  qwen create-prd       - Interactive PRD wizard"
Write-Host "  qwen auto-gen-prd     - Auto-generate PRD from description"
Write-Host "  qwen prd-from-files   - Generate PRD from existing files"
Write-Host "  qwen analyze-prd      - Validate and analyze PRD"
Write-Host "  qwen gen-prprompts    - Generate all 32 PRPROMPTS files"
Write-Host "  qwen gen-phase-1      - Generate Phase 1 (10 files)"
Write-Host "  qwen gen-phase-2      - Generate Phase 2 (12 files)"
Write-Host "  qwen gen-phase-3      - Generate Phase 3 (10 files)"
Write-Host "  qwen gen-file         - Generate single file"
Write-Host ""
Write-Host "Quick test:" -ForegroundColor Blue
Write-Host "  qwen create-prd --help"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Blue
Write-Host "  https://github.com/Kandil7/prprompts-flutter-generator"
Write-Host ""
Write-Host "Note: Requires Qwen Code CLI installed" -ForegroundColor Yellow
Write-Host "Install: npm install -g @qwenlm/qwen-code" -ForegroundColor Yellow
Write-Host ""
