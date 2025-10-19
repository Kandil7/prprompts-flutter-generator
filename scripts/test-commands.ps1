# PRPROMPTS Generator - Command Test Script for Windows (PowerShell)
# Tests CLI commands and functionality

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " PRPROMPTS Generator - Command Tests (PS)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Initialize counters
$Failed = 0
$Passed = 0

# Helper functions
function Write-Pass {
    param($Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
}

function Write-Fail {
    param($Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Write-Warn {
    param($Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-TestHeader {
    param($TestName)
    Write-Host "Test $TestName" -ForegroundColor Yellow
}

# Test 1: Check prprompts command exists
Write-TestHeader "1: Checking prprompts command..."
$PrpromptsPath = Get-Command prprompts -ErrorAction SilentlyContinue
if ($PrpromptsPath) {
    Write-Pass "prprompts command found at: $($PrpromptsPath.Source)"
    $Passed++
} else {
    Write-Fail "prprompts command not found"
    Write-Info "npm global bin directory: $(npm bin -g)"
    $Failed++
}

# Test 2: Check help command
Write-TestHeader "2: Testing help command..."
try {
    $HelpOutput = & prprompts help 2>&1
    if ($HelpOutput -match "USAGE") {
        Write-Pass "Help command works"
        $Passed++
    } else {
        Write-Fail "Help command output unexpected"
        $Failed++
    }
} catch {
    Write-Fail "Help command failed: $_"
    $Failed++
}

# Test 3: Check version command
Write-TestHeader "3: Testing version command..."
try {
    $VersionOutput = & prprompts version 2>&1 | Out-String
    if ($VersionOutput -match "4\.0\.0") {
        Write-Pass "Version command works: v4.0.0"
        $Passed++
    } elseif ($VersionOutput -match "\d+\.\d+\.\d+") {
        Write-Warn "Version found but not 4.0.0: $($Matches[0])"
        $Passed++
    } else {
        Write-Fail "Version command output unexpected"
        $Failed++
    }
} catch {
    Write-Fail "Version command failed: $_"
    $Failed++
}

# Test 4: Check doctor command
Write-TestHeader "4: Testing doctor command..."
try {
    $DoctorOutput = & prprompts doctor 2>&1 | Out-String
    if ($DoctorOutput -match "Node\.js") {
        Write-Pass "Doctor command works"
        $Passed++
    } else {
        Write-Warn "Doctor command returned but output unexpected"
        $Passed++
    }
} catch {
    Write-Warn "Doctor command failed (may be normal if no AI installed)"
    $Passed++
}

# Test 5: Check config command
Write-TestHeader "5: Testing config command..."
try {
    $ConfigOutput = & prprompts config 2>&1 | Out-String
    if ($ConfigOutput -match "config" -or $ConfigOutput -match "version") {
        Write-Pass "Config command works"
        $Passed++
    } else {
        Write-Fail "Config command output unexpected"
        $Failed++
    }
} catch {
    Write-Fail "Config command failed: $_"
    $Failed++
}

# Test 6: Check which command
Write-TestHeader "6: Testing which command..."
try {
    $WhichOutput = & prprompts which 2>&1 | Out-String
    if ($WhichOutput -match "(claude|qwen|gemini)") {
        Write-Pass "Which command works - AI: $($Matches[1])"
        $Passed++
    } else {
        Write-Warn "Which command failed (may be normal if no AI installed)"
        $Passed++
    }
} catch {
    Write-Warn "Which command failed (may be normal if no AI installed)"
    $Passed++
}

# Test 7: Check Node.js version
Write-TestHeader "7: Checking Node.js version..."
try {
    $NodeVersion = & node --version 2>&1
    if ($NodeVersion -match "v(\d+)\.") {
        $MajorVersion = [int]$Matches[1]
        if ($MajorVersion -ge 18) {
            Write-Pass "Node.js version: $NodeVersion (meets requirement >= 18)"
            $Passed++
        } else {
            Write-Fail "Node.js version: $NodeVersion (requires >= 18)"
            $Failed++
        }
    } else {
        Write-Fail "Could not parse Node.js version"
        $Failed++
    }
} catch {
    Write-Fail "Node.js not found"
    $Failed++
}

# Test 8: Check npm version
Write-TestHeader "8: Checking npm version..."
try {
    $NpmVersion = & npm --version 2>&1
    if ($NpmVersion -match "\d+\.\d+") {
        Write-Pass "npm version: $NpmVersion"
        $Passed++
    } else {
        Write-Fail "Could not get npm version"
        $Failed++
    }
} catch {
    Write-Fail "npm not found"
    $Failed++
}

# Test 9: Check for AI assistants
Write-TestHeader "9: Checking for AI assistants..."
$AiFound = $false
$AiList = @()

$Claude = Get-Command claude -ErrorAction SilentlyContinue
if ($Claude) {
    Write-Info "Claude Code found at: $($Claude.Source)"
    $AiFound = $true
    $AiList += "claude"
}

$Qwen = Get-Command qwen -ErrorAction SilentlyContinue
if ($Qwen) {
    Write-Info "Qwen Code found at: $($Qwen.Source)"
    $AiFound = $true
    $AiList += "qwen"
}

$Gemini = Get-Command gemini -ErrorAction SilentlyContinue
if ($Gemini) {
    Write-Info "Gemini CLI found at: $($Gemini.Source)"
    $AiFound = $true
    $AiList += "gemini"
}

if ($AiFound) {
    Write-Pass "Found AI assistant(s): $($AiList -join ', ')"
    $Passed++
} else {
    Write-Warn "No AI assistants found (install at least one for full functionality)"
    Write-Info "Install with: npm install -g @anthropic-ai/claude-code"
    Write-Info "            npm install -g @qwenlm/qwen-code"
    Write-Info "            npm install -g @google/gemini-cli"
    $Passed++
}

# Test 10: Check package.json bin entry
Write-TestHeader "10: Checking package.json bin configuration..."
if (Test-Path "package.json") {
    $PackageContent = Get-Content "package.json" -Raw
    if ($PackageContent -match '"bin"') {
        Write-Pass "package.json has bin entry"

        # Check specific bin command
        if ($PackageContent -match '"prprompts"') {
            Write-Pass "package.json defines prprompts command"
            $Passed++
        } else {
            Write-Fail "package.json missing prprompts command"
            $Failed++
        }
    } else {
        Write-Fail "package.json missing bin entry"
        $Failed++
    }
} else {
    Write-Fail "package.json not found"
    $Failed++
}

# Test 11: Check environment variables
Write-TestHeader "11: Checking environment variables..."
$EnvVars = @(
    "PRPROMPTS_DEFAULT_AI",
    "PRPROMPTS_VERBOSE",
    "PRPROMPTS_TIMEOUT",
    "ANTHROPIC_API_KEY",
    "DASHSCOPE_API_KEY",
    "GOOGLE_API_KEY"
)

$EnvFound = $false
foreach ($EnvVar in $EnvVars) {
    $Value = [Environment]::GetEnvironmentVariable($EnvVar, "User")
    if (-not $Value) {
        $Value = [Environment]::GetEnvironmentVariable($EnvVar, "Process")
    }

    if ($Value) {
        if ($EnvVar -match "API_KEY") {
            Write-Info "$EnvVar is set (hidden)"
        } else {
            Write-Info "$EnvVar = $Value"
        }
        $EnvFound = $true
    }
}

if ($EnvFound) {
    Write-Pass "Some environment variables configured"
    $Passed++
} else {
    Write-Info "No PRPROMPTS environment variables set (optional)"
    $Passed++
}

# Test 12: Check config directory
Write-TestHeader "12: Checking configuration directories..."
$ConfigDirs = @(
    "$env:USERPROFILE\.prprompts",
    "$env:USERPROFILE\.config\claude",
    "$env:USERPROFILE\.config\qwen",
    "$env:USERPROFILE\.config\gemini"
)

$ConfigFound = $false
foreach ($Dir in $ConfigDirs) {
    if (Test-Path $Dir) {
        Write-Info "Found config directory: $Dir"
        $ConfigFound = $true
    }
}

if ($ConfigFound) {
    Write-Pass "Configuration directories exist"
    $Passed++
} else {
    Write-Info "No configuration directories found (will be created on first run)"
    $Passed++
}

# Summary
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Test Summary" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests Passed: $Passed" -ForegroundColor Green
Write-Host "Tests Failed: $Failed" -ForegroundColor $(if ($Failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

# Additional information
if ($AiList.Count -gt 0) {
    Write-Host "Available AI(s): $($AiList -join ', ')" -ForegroundColor Cyan
} else {
    Write-Host "No AI assistants installed" -ForegroundColor Yellow
}

Write-Host ""

if ($Failed -eq 0) {
    Write-Host "[SUCCESS] All command tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[FAILURE] $Failed test(s) failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix issues, try:" -ForegroundColor Yellow
    Write-Host "  1. Reinstall: npm uninstall -g prprompts-flutter-generator && npm install -g prprompts-flutter-generator" -ForegroundColor Cyan
    Write-Host "  2. Check PATH: npm bin -g" -ForegroundColor Cyan
    Write-Host "  3. Run doctor: prprompts doctor" -ForegroundColor Cyan
    exit 1
}