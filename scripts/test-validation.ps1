# PRPROMPTS Generator - Validation Test Script for Windows (PowerShell)
# Tests prompt files, config files, and directory structure

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " PRPROMPTS Generator - Validation Tests (PS)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Initialize counters
$Failed = 0
$Passed = 0
$ExpectedPrompts = 9

# Helper function for colored output
function Write-Pass {
    param($Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
}

function Write-Fail {
    param($Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Write-TestHeader {
    param($TestName)
    Write-Host "Test $TestName" -ForegroundColor Yellow
}

# Test 1: Check Claude prompts exist
Write-TestHeader "1: Checking Claude prompt files..."
$ClaudeFiles = Get-ChildItem -Path ".claude\prompts\*.md" -ErrorAction SilentlyContinue
$ClaudeCount = if ($ClaudeFiles) { $ClaudeFiles.Count } else { 0 }

if ($ClaudeCount -eq $ExpectedPrompts) {
    Write-Pass "Found $ClaudeCount/$ExpectedPrompts Claude prompt files"
    $Passed++
} else {
    Write-Fail "Expected $ExpectedPrompts Claude prompts, found $ClaudeCount"
    $Failed++
}

# Test 2: Check Qwen prompts exist
Write-TestHeader "2: Checking Qwen prompt files..."
$QwenFiles = Get-ChildItem -Path ".qwen\prompts\*.md" -ErrorAction SilentlyContinue
$QwenCount = if ($QwenFiles) { $QwenFiles.Count } else { 0 }

if ($QwenCount -eq $ExpectedPrompts) {
    Write-Pass "Found $QwenCount/$ExpectedPrompts Qwen prompt files"
    $Passed++
} else {
    Write-Fail "Expected $ExpectedPrompts Qwen prompts, found $QwenCount"
    $Failed++
}

# Test 3: Check Gemini prompts exist
Write-TestHeader "3: Checking Gemini prompt files..."
$GeminiFiles = Get-ChildItem -Path ".gemini\prompts\*.md" -ErrorAction SilentlyContinue
$GeminiCount = if ($GeminiFiles) { $GeminiFiles.Count } else { 0 }

if ($GeminiCount -eq $ExpectedPrompts) {
    Write-Pass "Found $GeminiCount/$ExpectedPrompts Gemini prompt files"
    $Passed++
} else {
    Write-Fail "Expected $ExpectedPrompts Gemini prompts, found $GeminiCount"
    $Failed++
}

# Test 4: Check automation commands
Write-TestHeader "4: Checking automation commands..."
$AutomationFiles = Get-ChildItem -Path ".claude\commands\automation\*.md" -ErrorAction SilentlyContinue
$AutomationCount = if ($AutomationFiles) { $AutomationFiles.Count } else { 0 }

if ($AutomationCount -ge 5) {
    Write-Pass "Found $AutomationCount automation commands"
    $Passed++
} else {
    Write-Fail "Expected at least 5 automation commands, found $AutomationCount"
    $Failed++
}

# Test 5: Check config files
Write-TestHeader "5: Checking configuration files..."
$ConfigErrors = 0

$ConfigFiles = @(
    ".claude\config.yml",
    ".qwen\config.yml",
    ".gemini\config.yml"
)

foreach ($ConfigFile in $ConfigFiles) {
    if (Test-Path $ConfigFile) {
        Write-Pass "Found $ConfigFile"
    } else {
        Write-Fail "Missing $ConfigFile"
        $ConfigErrors++
    }
}

if ($ConfigErrors -eq 0) {
    $Passed++
} else {
    $Failed++
}

# Test 6: Check extension manifests
Write-TestHeader "6: Checking extension manifests..."
$ManifestErrors = 0

$Manifests = @(
    "claude-extension.json",
    "qwen-extension.json",
    "gemini-extension.json"
)

foreach ($Manifest in $Manifests) {
    if (Test-Path $Manifest) {
        Write-Pass "Found $Manifest"

        # Validate JSON
        try {
            $null = Get-Content $Manifest | ConvertFrom-Json
            Write-Pass "$Manifest is valid JSON"
        } catch {
            Write-Fail "$Manifest has invalid JSON"
            $ManifestErrors++
        }
    } else {
        Write-Fail "Missing $Manifest"
        $ManifestErrors++
    }
}

if ($ManifestErrors -eq 0) {
    $Passed++
} else {
    $Failed++
}

# Test 7: Check installation scripts
Write-TestHeader "7: Checking installation scripts..."
$InstallErrors = 0

$InstallScripts = @(
    "install-claude-extension.sh",
    "install-qwen-extension.sh",
    "install-gemini-extension.sh",
    "scripts\install-commands.bat",
    "scripts\install-commands.ps1"
)

foreach ($Script in $InstallScripts) {
    if (Test-Path $Script) {
        Write-Pass "Found $Script"
    } else {
        # Not all scripts are required, so just note missing
        Write-Host "[INFO] Optional script not found: $Script" -ForegroundColor Yellow
    }
}

if ($InstallErrors -eq 0) {
    $Passed++
} else {
    $Failed++
}

# Test 8: Check templates
Write-TestHeader "8: Checking template files..."
$TemplateErrors = 0

$Templates = @(
    "templates\PRD-full-template.md",
    "templates\project_description.md",
    "templates\healthcare.md",
    "templates\fintech.md",
    "templates\ecommerce.md"
)

$RequiredTemplates = 2  # First two are required
$FoundTemplates = 0

for ($i = 0; $i -lt $Templates.Count; $i++) {
    if (Test-Path $Templates[$i]) {
        Write-Pass "Found $($Templates[$i])"
        $FoundTemplates++
    } else {
        if ($i -lt $RequiredTemplates) {
            Write-Fail "Missing required template: $($Templates[$i])"
            $TemplateErrors++
        } else {
            Write-Host "[INFO] Optional template not found: $($Templates[$i])" -ForegroundColor Yellow
        }
    }
}

if ($TemplateErrors -eq 0) {
    $Passed++
} else {
    $Failed++
}

# Test 9: Check documentation
Write-TestHeader "9: Checking documentation files..."
$DocErrors = 0

$RequiredDocs = @(
    "README.md",
    "ARCHITECTURE.md",
    "DEVELOPMENT.md",
    "CHANGELOG.md",
    "LICENSE"
)

foreach ($Doc in $RequiredDocs) {
    if (Test-Path $Doc) {
        Write-Pass "Found $Doc"
    } else {
        Write-Fail "Missing $Doc"
        $DocErrors++
    }
}

# Check docs directory
$DocsDir = Get-ChildItem -Path "docs\*.md" -ErrorAction SilentlyContinue
if ($DocsDir -and $DocsDir.Count -ge 10) {
    Write-Pass "Found $($DocsDir.Count) documentation files in docs/"
} else {
    Write-Fail "Expected at least 10 files in docs/, found $($DocsDir.Count)"
    $DocErrors++
}

if ($DocErrors -eq 0) {
    $Passed++
} else {
    $Failed++
}

# Test 10: Check package files
Write-TestHeader "10: Checking package files..."
$PackageErrors = 0

if (Test-Path "package.json") {
    Write-Pass "Found package.json"

    # Validate package.json
    try {
        $PackageContent = Get-Content "package.json" | ConvertFrom-Json

        # Check version
        if ($PackageContent.version -eq "4.0.0") {
            Write-Pass "Package version is 4.0.0"
        } else {
            Write-Fail "Package version is $($PackageContent.version), expected 4.0.0"
            $PackageErrors++
        }

        # Check name
        if ($PackageContent.name -eq "prprompts-flutter-generator") {
            Write-Pass "Package name is correct"
        } else {
            Write-Fail "Package name is incorrect"
            $PackageErrors++
        }

    } catch {
        Write-Fail "Invalid package.json"
        $PackageErrors++
    }
} else {
    Write-Fail "Missing package.json"
    $PackageErrors++
}

if (Test-Path "bin\prprompts") {
    Write-Pass "Found bin\prprompts"
} else {
    Write-Fail "Missing bin\prprompts"
    $PackageErrors++
}

if ($PackageErrors -eq 0) {
    $Passed++
} else {
    $Failed++
}

# Test 11: Check test files
Write-TestHeader "11: Checking test files..."
$TestErrors = 0

$TestFiles = Get-ChildItem -Path "tests\*.test.js" -ErrorAction SilentlyContinue
if ($TestFiles -and $TestFiles.Count -ge 3) {
    Write-Pass "Found $($TestFiles.Count) test files"
    $Passed++
} else {
    Write-Fail "Expected at least 3 test files, found $($TestFiles.Count)"
    $Failed++
}

# Test 12: Check Jest configuration
Write-TestHeader "12: Checking Jest configuration..."
if (Test-Path "jest.config.js") {
    Write-Pass "Found jest.config.js"
    $Passed++
} else {
    Write-Fail "Missing jest.config.js"
    $Failed++
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

if ($Failed -eq 0) {
    Write-Host "[SUCCESS] All validation tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[FAILURE] $Failed test(s) failed" -ForegroundColor Red
    exit 1
}