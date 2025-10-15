# Install PRPROMPTS Claude Code Commands
# Version: 1.0.0
# PowerShell script for Windows

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("--global", "--local")]
    [string]$InstallType
)

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "🚀 PRPROMPTS Claude Code Commands Installer" "Cyan"
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoDir = Split-Path -Parent $ScriptDir

# Determine install location
if ($InstallType -eq "--global") {
    $ConfigDir = Join-Path $env:USERPROFILE ".config\claude"
    Write-ColorOutput "Installing globally to: $ConfigDir" "Yellow"
} elseif ($InstallType -eq "--local") {
    $ConfigDir = Join-Path (Get-Location) ".claude"
    Write-ColorOutput "Installing locally to: $ConfigDir" "Yellow"
}

# Create directories
$PromptsDir = Join-Path $ConfigDir "prompts"
if (-not (Test-Path $PromptsDir)) {
    New-Item -ItemType Directory -Path $PromptsDir -Force | Out-Null
}

# Copy prompt files
Write-ColorOutput "📄 Copying prompt files..." "Green"
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

foreach ($File in $PromptFiles) {
    $SourcePath = Join-Path $RepoDir ".claude\prompts\$File"
    $DestPath = Join-Path $PromptsDir $File
    Copy-Item -Path $SourcePath -Destination $DestPath -Force
}

# Copy config file
Write-ColorOutput "⚙️  Creating config.yml..." "Green"
$ConfigSource = Join-Path $RepoDir ".claude\config.yml"
$ConfigDest = Join-Path $ConfigDir "config.yml"
Copy-Item -Path $ConfigSource -Destination $ConfigDest -Force

Write-Host ""
Write-ColorOutput "✅ Installation complete!" "Green"
Write-Host ""
Write-ColorOutput "Available commands:" "Cyan"
Write-Host "  claude create-prd       - Interactive PRD wizard"
Write-Host "  claude auto-gen-prd     - Auto-generate PRD from description"
Write-Host "  claude analyze-prd      - Validate and analyze PRD"
Write-Host "  claude gen-prprompts    - Generate all 32 PRPROMPTS files"
Write-Host "  claude gen-phase-1      - Generate Phase 1 (10 files)"
Write-Host "  claude gen-phase-2      - Generate Phase 2 (12 files)"
Write-Host "  claude gen-phase-3      - Generate Phase 3 (10 files)"
Write-Host "  claude gen-file         - Generate single file"
Write-Host ""
Write-ColorOutput "Quick test:" "Cyan"
Write-Host "  claude create-prd --help"
Write-Host ""
Write-ColorOutput "Documentation:" "Cyan"
Write-Host "  https://github.com/Kandil7/prprompts-flutter-generator"
Write-Host ""
