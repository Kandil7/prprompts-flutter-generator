@echo off
REM PRPROMPTS Generator - Validation Test Script for Windows
REM Tests prompt files, config files, and directory structure

echo ==================================================
echo  PRPROMPTS Generator - Validation Tests (Windows)
echo ==================================================
echo.

setlocal enabledelayedexpansion

REM Initialize counters
set FAILED=0
set PASSED=0
set EXPECTED_PROMPTS=9

REM Test 1: Check Claude prompts exist
echo Test 1: Checking Claude prompt files...
set CLAUDE_COUNT=0
for %%f in (.claude\prompts\*.md) do set /a CLAUDE_COUNT+=1

if !CLAUDE_COUNT! EQU !EXPECTED_PROMPTS! (
    echo [PASS] Found !CLAUDE_COUNT!/!EXPECTED_PROMPTS! Claude prompt files
    set /a PASSED+=1
) else (
    echo [FAIL] Expected !EXPECTED_PROMPTS! Claude prompts, found !CLAUDE_COUNT!
    set /a FAILED+=1
)

REM Test 2: Check Qwen prompts exist
echo Test 2: Checking Qwen prompt files...
set QWEN_COUNT=0
for %%f in (.qwen\prompts\*.md) do set /a QWEN_COUNT+=1

if !QWEN_COUNT! EQU !EXPECTED_PROMPTS! (
    echo [PASS] Found !QWEN_COUNT!/!EXPECTED_PROMPTS! Qwen prompt files
    set /a PASSED+=1
) else (
    echo [FAIL] Expected !EXPECTED_PROMPTS! Qwen prompts, found !QWEN_COUNT!
    set /a FAILED+=1
)

REM Test 3: Check Gemini prompts exist
echo Test 3: Checking Gemini prompt files...
set GEMINI_COUNT=0
for %%f in (.gemini\prompts\*.md) do set /a GEMINI_COUNT+=1

if !GEMINI_COUNT! EQU !EXPECTED_PROMPTS! (
    echo [PASS] Found !GEMINI_COUNT!/!EXPECTED_PROMPTS! Gemini prompt files
    set /a PASSED+=1
) else (
    echo [FAIL] Expected !EXPECTED_PROMPTS! Gemini prompts, found !GEMINI_COUNT!
    set /a FAILED+=1
)

REM Test 4: Check automation commands
echo Test 4: Checking automation commands...
set AUTOMATION_COUNT=0
for %%f in (.claude\commands\automation\*.md) do set /a AUTOMATION_COUNT+=1

if !AUTOMATION_COUNT! GEQ 5 (
    echo [PASS] Found !AUTOMATION_COUNT! automation commands
    set /a PASSED+=1
) else (
    echo [FAIL] Expected at least 5 automation commands, found !AUTOMATION_COUNT!
    set /a FAILED+=1
)

REM Test 5: Check config files
echo Test 5: Checking configuration files...
set CONFIG_ERRORS=0

if not exist ".claude\config.yml" (
    echo [FAIL] Missing .claude\config.yml
    set /a CONFIG_ERRORS+=1
) else (
    echo [PASS] Found .claude\config.yml
)

if not exist ".qwen\config.yml" (
    echo [FAIL] Missing .qwen\config.yml
    set /a CONFIG_ERRORS+=1
) else (
    echo [PASS] Found .qwen\config.yml
)

if not exist ".gemini\config.yml" (
    echo [FAIL] Missing .gemini\config.yml
    set /a CONFIG_ERRORS+=1
) else (
    echo [PASS] Found .gemini\config.yml
)

if !CONFIG_ERRORS! EQU 0 (
    set /a PASSED+=1
) else (
    set /a FAILED+=1
)

REM Test 6: Check extension manifests
echo Test 6: Checking extension manifests...
set MANIFEST_ERRORS=0

if not exist "claude-extension.json" (
    echo [FAIL] Missing claude-extension.json
    set /a MANIFEST_ERRORS+=1
) else (
    echo [PASS] Found claude-extension.json
)

if not exist "qwen-extension.json" (
    echo [FAIL] Missing qwen-extension.json
    set /a MANIFEST_ERRORS+=1
) else (
    echo [PASS] Found qwen-extension.json
)

if not exist "gemini-extension.json" (
    echo [FAIL] Missing gemini-extension.json
    set /a MANIFEST_ERRORS+=1
) else (
    echo [PASS] Found gemini-extension.json
)

if !MANIFEST_ERRORS! EQU 0 (
    set /a PASSED+=1
) else (
    set /a FAILED+=1
)

REM Test 7: Check installation scripts
echo Test 7: Checking installation scripts...
set INSTALL_ERRORS=0

if not exist "install-claude-extension.sh" (
    echo [FAIL] Missing install-claude-extension.sh
    set /a INSTALL_ERRORS+=1
) else (
    echo [PASS] Found install-claude-extension.sh
)

if not exist "install-qwen-extension.sh" (
    echo [FAIL] Missing install-qwen-extension.sh
    set /a INSTALL_ERRORS+=1
) else (
    echo [PASS] Found install-qwen-extension.sh
)

if not exist "install-gemini-extension.sh" (
    echo [FAIL] Missing install-gemini-extension.sh
    set /a INSTALL_ERRORS+=1
) else (
    echo [PASS] Found install-gemini-extension.sh
)

if !INSTALL_ERRORS! EQU 0 (
    set /a PASSED+=1
) else (
    set /a FAILED+=1
)

REM Test 8: Check templates
echo Test 8: Checking template files...
set TEMPLATE_ERRORS=0

if not exist "templates\PRD-full-template.md" (
    echo [FAIL] Missing templates\PRD-full-template.md
    set /a TEMPLATE_ERRORS+=1
) else (
    echo [PASS] Found templates\PRD-full-template.md
)

if not exist "templates\project_description.md" (
    echo [FAIL] Missing templates\project_description.md
    set /a TEMPLATE_ERRORS+=1
) else (
    echo [PASS] Found templates\project_description.md
)

if !TEMPLATE_ERRORS! EQU 0 (
    set /a PASSED+=1
) else (
    set /a FAILED+=1
)

REM Test 9: Check documentation
echo Test 9: Checking documentation files...
set DOC_ERRORS=0

if not exist "README.md" (
    echo [FAIL] Missing README.md
    set /a DOC_ERRORS+=1
)

if not exist "ARCHITECTURE.md" (
    echo [FAIL] Missing ARCHITECTURE.md
    set /a DOC_ERRORS+=1
)

if not exist "DEVELOPMENT.md" (
    echo [FAIL] Missing DEVELOPMENT.md
    set /a DOC_ERRORS+=1
)

if !DOC_ERRORS! EQU 0 (
    echo [PASS] All main documentation files exist
    set /a PASSED+=1
) else (
    echo [FAIL] Missing !DOC_ERRORS! documentation files
    set /a FAILED+=1
)

REM Test 10: Check package files
echo Test 10: Checking package files...
set PACKAGE_ERRORS=0

if not exist "package.json" (
    echo [FAIL] Missing package.json
    set /a PACKAGE_ERRORS+=1
) else (
    echo [PASS] Found package.json
)

if not exist "bin\prprompts" (
    echo [FAIL] Missing bin\prprompts
    set /a PACKAGE_ERRORS+=1
) else (
    echo [PASS] Found bin\prprompts
)

if !PACKAGE_ERRORS! EQU 0 (
    set /a PASSED+=1
) else (
    set /a FAILED+=1
)

echo.
echo ==================================================
echo  Test Summary
echo ==================================================
echo.
echo Tests Passed: !PASSED!
echo Tests Failed: !FAILED!
echo.

if !FAILED! EQU 0 (
    echo [SUCCESS] All validation tests passed!
    exit /b 0
) else (
    echo [FAILURE] !FAILED! test(s) failed
    exit /b 1
)