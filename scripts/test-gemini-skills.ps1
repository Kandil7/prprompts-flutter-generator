# PRPROMPTS Generator - Gemini CLI Skills Test Script (PowerShell)
# Tests Gemini TOML skill files in repository and user installation

$ErrorActionPreference = "Continue"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " PRPROMPTS - Gemini CLI Skills Tests" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$Failed = 0
$Warnings = 0

# Gemini directory
$GeminiDir = Join-Path $env:USERPROFILE ".gemini"

# Test 1: Check repository TOML files exist
Write-Host "Test 1: Checking repository TOML skill files..." -ForegroundColor Yellow
$ExpectedToml = 8
$RepoToml = (Get-ChildItem -Path ".gemini\commands\skills" -Filter "*.toml" -Recurse -ErrorAction SilentlyContinue).Count

if ($RepoToml -eq $ExpectedToml) {
    Write-Host "  ✓ Found $RepoToml/$ExpectedToml TOML skill files in repository" -ForegroundColor Green
} else {
    Write-Host "  ✗ Expected $ExpectedToml TOML files, found $RepoToml" -ForegroundColor Red
    $Failed++
}

# Test 2: Check specific skill files exist in repository
Write-Host "Test 2: Checking specific skill files in repository..." -ForegroundColor Yellow
$RepoSkills = @(
    ".gemini\commands\skills\automation\flutter-bootstrapper.toml"
    ".gemini\commands\skills\automation\feature-implementer.toml"
    ".gemini\commands\skills\automation\automation-orchestrator.toml"
    ".gemini\commands\skills\automation\code-reviewer.toml"
    ".gemini\commands\skills\automation\qa-auditor.toml"
    ".gemini\commands\skills\prprompts-core\phase-generator.toml"
    ".gemini\commands\skills\prprompts-core\single-file-generator.toml"
    ".gemini\commands\skills\development-workflow\flutter-flavors.toml"
)

$RepoSkillsFound = 0
foreach ($skill in $RepoSkills) {
    if (Test-Path $skill) {
        $RepoSkillsFound++
    } else {
        Write-Host "  ✗ Missing: $skill" -ForegroundColor Red
        $Failed++
    }
}

if ($RepoSkillsFound -eq $RepoSkills.Count) {
    Write-Host "  ✓ All $RepoSkillsFound skill files present in repository" -ForegroundColor Green
}

# Test 3: Check TOML file sizes
Write-Host "Test 3: Checking TOML file sizes..." -ForegroundColor Yellow
$MinSize = 1000  # 1KB minimum
$SmallFiles = 0

foreach ($skill in $RepoSkills) {
    if (Test-Path $skill) {
        $Size = (Get-Item $skill).Length
        if ($Size -lt $MinSize) {
            Write-Host "  ⚠ $skill is suspiciously small ($Size bytes)" -ForegroundColor Yellow
            $SmallFiles++
        }
    }
}

if ($SmallFiles -eq 0) {
    Write-Host "  ✓ All skill files have substantial content" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Found $SmallFiles small files (may be incomplete)" -ForegroundColor Yellow
    $Warnings++
}

# Test 4: Check generator script exists
Write-Host "Test 4: Checking generator script..." -ForegroundColor Yellow
$Generator = "scripts\generate-gemini-toml-skills.js"
if (Test-Path $Generator) {
    Write-Host "  ✓ Generator script exists: $Generator" -ForegroundColor Green
} else {
    Write-Host "  ✗ Generator script missing: $Generator" -ForegroundColor Red
    $Failed++
}

# Test 5: Check installer scripts exist
Write-Host "Test 5: Checking installer scripts..." -ForegroundColor Yellow
$InstallerScripts = @(
    "scripts\install-gemini-skills.sh"
    "scripts\install-gemini-skills.ps1"
    "scripts\install-gemini-skills.bat"
)

$InstallersFound = 0
foreach ($script in $InstallerScripts) {
    if (Test-Path $script) {
        $InstallersFound++
    } else {
        Write-Host "  ✗ Missing installer: $script" -ForegroundColor Red
        $Failed++
    }
}

if ($InstallersFound -eq $InstallerScripts.Count) {
    Write-Host "  ✓ All $InstallersFound installer scripts present" -ForegroundColor Green
}

# Test 6: Check user installation
Write-Host "Test 6: Checking user installation..." -ForegroundColor Yellow
if (Test-Path "$GeminiDir\commands\skills") {
    $UserToml = (Get-ChildItem -Path "$GeminiDir\commands\skills" -Filter "*.toml" -Recurse -ErrorAction SilentlyContinue).Count

    if ($UserToml -eq $ExpectedToml) {
        Write-Host "  ✓ Found $UserToml/$ExpectedToml skills installed in $GeminiDir" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Expected $ExpectedToml skills in user directory, found $UserToml" -ForegroundColor Yellow
        Write-Host "    Hint: Run 'npm install -g prprompts-flutter-generator' to install" -ForegroundColor Cyan
        $Warnings++
    }
} else {
    Write-Host "  ⚠ Skills not installed in user directory: $GeminiDir\commands\skills" -ForegroundColor Yellow
    Write-Host "    Hint: Run 'npm install -g prprompts-flutter-generator' to install" -ForegroundColor Cyan
    $Warnings++
}

# Test 7: Check if Gemini CLI is installed
Write-Host "Test 7: Checking Gemini CLI installation..." -ForegroundColor Yellow
$GeminiInstalled = Get-Command gemini -ErrorAction SilentlyContinue
if ($GeminiInstalled) {
    try {
        $GeminiVersion = & gemini --version 2>&1
        Write-Host "  ✓ Gemini CLI installed: $GeminiVersion" -ForegroundColor Green
    } catch {
        Write-Host "  ✓ Gemini CLI installed (version unknown)" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠ Gemini CLI not installed" -ForegroundColor Yellow
    Write-Host "    Hint: Run 'npm install -g @google/gemini-cli' to install" -ForegroundColor Cyan
    $Warnings++
}

# Test 8: Check documentation exists
Write-Host "Test 8: Checking Gemini skills documentation..." -ForegroundColor Yellow
$Docs = @(
    "docs\GEMINI-SKILLS-GUIDE.md"
    "GEMINI.md"
    ".gemini\skills\index.md"
)

$DocsFound = 0
foreach ($doc in $Docs) {
    if (Test-Path $doc) {
        $DocsFound++
    } else {
        Write-Host "  ✗ Missing documentation: $doc" -ForegroundColor Red
        $Failed++
    }
}

if ($DocsFound -eq $Docs.Count) {
    Write-Host "  ✓ All $DocsFound documentation files present" -ForegroundColor Green
}

# Test 9: Validate TOML syntax
Write-Host "Test 9: Validating TOML file syntax..." -ForegroundColor Yellow
$NodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if ($NodeInstalled) {
    $InvalidToml = 0
    foreach ($skill in $RepoSkills) {
        if (Test-Path $skill) {
            $Content = Get-Content $skill -Raw
            if (($Content -match 'description = ') -and ($Content -match 'prompt = ')) {
                # Valid
            } else {
                Write-Host "  ⚠ $skill may have invalid TOML structure" -ForegroundColor Yellow
                $InvalidToml++
            }
        }
    }

    if ($InvalidToml -eq 0) {
        Write-Host "  ✓ All TOML files have valid structure" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Found $InvalidToml files with potentially invalid TOML" -ForegroundColor Yellow
        $Warnings++
    }
} else {
    Write-Host "  ⚠ Node.js not installed, skipping TOML validation" -ForegroundColor Yellow
}

# Test 10: Check skills guide comprehensiveness
Write-Host "Test 10: Checking skills guide comprehensiveness..." -ForegroundColor Yellow
$SkillsGuide = "docs\GEMINI-SKILLS-GUIDE.md"
if (Test-Path $SkillsGuide) {
    $Lines = (Get-Content $SkillsGuide).Count
    if ($Lines -gt 800) {
        Write-Host "  ✓ Skills guide is comprehensive ($Lines lines)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Skills guide seems short ($Lines lines, expected 900+)" -ForegroundColor Yellow
        $Warnings++
    }
} else {
    Write-Host "  ✗ Skills guide missing" -ForegroundColor Red
    $Failed++
}

# Summary
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
if ($Failed -eq 0) {
    if ($Warnings -eq 0) {
        Write-Host "✅ All Gemini skills tests passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Tests passed with $Warnings warning(s)" -ForegroundColor Yellow
    }
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Install skills: npm install -g prprompts-flutter-generator"
    Write-Host "  2. Verify: gemini"
    Write-Host "  3. Use: /skills:automation:flutter-bootstrapper"
    Write-Host ""
    exit 0
} else {
    Write-Host "❌ $Failed test(s) failed, $Warnings warning(s)" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Cyan
    exit 1
}
