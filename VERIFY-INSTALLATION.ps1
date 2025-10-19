# Verify PRPROMPTS Installation on Windows

Write-Host "`n=== PRPROMPTS Installation Verification ===`n" -ForegroundColor Cyan

$ConfigDir = "$env:USERPROFILE\.config\claude"

# Check directories
Write-Host "Checking directories..." -ForegroundColor Yellow
$Dirs = @(
    "$ConfigDir\prompts",
    "$ConfigDir\commands\automation"
)

foreach ($Dir in $Dirs) {
    if (Test-Path $Dir) {
        $Count = (Get-ChildItem $Dir -Filter "*.md").Count
        Write-Host "  ✓ $Dir ($Count files)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $Dir (missing!)" -ForegroundColor Red
    }
}

# Check config.yml
Write-Host "`nChecking config.yml..." -ForegroundColor Yellow
if (Test-Path "$ConfigDir\config.yml") {
    Write-Host "  ✓ config.yml exists" -ForegroundColor Green
    $CommandCount = (Select-String -Path "$ConfigDir\config.yml" -Pattern "^\s+\w+-" -AllMatches).Matches.Count
    Write-Host "  ✓ Found $CommandCount commands registered" -ForegroundColor Green
} else {
    Write-Host "  ✗ config.yml missing!" -ForegroundColor Red
}

# Test Claude Code
Write-Host "`nChecking Claude Code..." -ForegroundColor Yellow
try {
    $ClaudeVersion = (claude --version 2>&1 | Out-String).Trim()
    Write-Host "  ✓ Claude Code installed: $ClaudeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Claude Code not found!" -ForegroundColor Red
}

Write-Host "`n=== Verification Complete ===`n" -ForegroundColor Cyan
Write-Host "To test, run: " -NoNewline
Write-Host "claude create-prd" -ForegroundColor Green
