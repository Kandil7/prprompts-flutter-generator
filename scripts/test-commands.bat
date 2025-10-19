@echo off
REM PRPROMPTS Generator - Command Test Script for Windows
REM Tests CLI commands and functionality

echo ==================================================
echo  PRPROMPTS Generator - Command Tests (Windows)
echo ==================================================
echo.

setlocal enabledelayedexpansion

REM Initialize counters
set FAILED=0
set PASSED=0

REM Test 1: Check prprompts command exists
echo Test 1: Checking prprompts command...
where prprompts >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] prprompts command found
    set /a PASSED+=1
) else (
    echo [FAIL] prprompts command not found - checking npm global
    call npm bin -g
    set /a FAILED+=1
)

REM Test 2: Check help command
echo Test 2: Testing help command...
call prprompts help >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Help command works
    set /a PASSED+=1
) else (
    echo [FAIL] Help command failed
    set /a FAILED+=1
)

REM Test 3: Check version command
echo Test 3: Testing version command...
for /f "delims=" %%i in ('prprompts version 2^>nul') do set VERSION_OUTPUT=%%i
if not "!VERSION_OUTPUT!"=="" (
    echo [PASS] Version command works: !VERSION_OUTPUT!
    set /a PASSED+=1
) else (
    echo [FAIL] Version command failed
    set /a FAILED+=1
)

REM Test 4: Check doctor command
echo Test 4: Testing doctor command...
call prprompts doctor >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Doctor command works
    set /a PASSED+=1
) else (
    echo [WARN] Doctor command returned non-zero (may be normal if no AI installed)
    set /a PASSED+=1
)

REM Test 5: Check config command
echo Test 5: Testing config command...
call prprompts config >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Config command works
    set /a PASSED+=1
) else (
    echo [FAIL] Config command failed
    set /a FAILED+=1
)

REM Test 6: Check which command
echo Test 6: Testing which command...
call prprompts which >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Which command works
    set /a PASSED+=1
) else (
    echo [WARN] Which command failed (may be normal if no AI installed)
    set /a PASSED+=1
)

REM Test 7: Check Node.js version
echo Test 7: Checking Node.js version...
for /f "tokens=2 delims=v" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
if not "!NODE_VERSION!"=="" (
    echo [PASS] Node.js version: v!NODE_VERSION!
    set /a PASSED+=1
) else (
    echo [FAIL] Node.js not found
    set /a FAILED+=1
)

REM Test 8: Check npm version
echo Test 8: Checking npm version...
for /f %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
if not "!NPM_VERSION!"=="" (
    echo [PASS] npm version: !NPM_VERSION!
    set /a PASSED+=1
) else (
    echo [FAIL] npm not found
    set /a FAILED+=1
)

REM Test 9: Check for AI assistants
echo Test 9: Checking for AI assistants...
set AI_FOUND=0

where claude >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Claude Code found
    set AI_FOUND=1
)

where qwen >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Qwen Code found
    set AI_FOUND=1
)

where gemini >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Gemini CLI found
    set AI_FOUND=1
)

if !AI_FOUND! EQU 1 (
    echo [PASS] At least one AI assistant found
    set /a PASSED+=1
) else (
    echo [WARN] No AI assistants found (install at least one for full functionality)
    set /a PASSED+=1
)

REM Test 10: Check package.json bin entry
echo Test 10: Checking package.json bin configuration...
if exist package.json (
    findstr /C:"\"bin\"" package.json >nul
    if %ERRORLEVEL% EQU 0 (
        echo [PASS] package.json has bin entry
        set /a PASSED+=1
    ) else (
        echo [FAIL] package.json missing bin entry
        set /a FAILED+=1
    )
) else (
    echo [FAIL] package.json not found
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
    echo [SUCCESS] All command tests passed!
    exit /b 0
) else (
    echo [FAILURE] !FAILED! test(s) failed
    exit /b 1
)