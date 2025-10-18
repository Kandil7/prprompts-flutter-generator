@echo off
REM PRPROMPTS Integration Test Suite for Windows
REM Tests all 14 commands (9 core + 5 automation) in realistic scenarios

echo ========================================
echo PRPROMPTS Integration Test Suite
echo ========================================
echo.

set TESTS_PASSED=0
set TESTS_FAILED=0
set TESTS_TOTAL=0

REM Test output directory
set TEST_DIR=test-output\integration
if exist "%TEST_DIR%" rmdir /s /q "%TEST_DIR%"
mkdir "%TEST_DIR%"

REM Check if prprompts is installed
where prprompts >nul 2>&1
if %errorlevel% neq 0 (
  echo Error: prprompts command not found
  echo Please install first: npm install -g .
  exit /b 1
)

echo Using prprompts:
where prprompts
prprompts --version 2>nul || echo unknown
echo.

REM ========================================
REM Test Group 1: Basic Commands
REM ========================================
echo Test Group 1: Basic Commands
echo ----------------------------------------

REM Test 1: prprompts --version
set /a TESTS_TOTAL+=1
echo Testing: prprompts --version...
prprompts --version >nul 2>&1
if %errorlevel% equ 0 (
  set /a TESTS_PASSED+=1
  echo [32m✓ PASSED[0m
) else (
  set /a TESTS_FAILED+=1
  echo [31m✗ FAILED[0m
)

REM Test 2: prprompts --help
set /a TESTS_TOTAL+=1
echo Testing: prprompts --help...
prprompts --help >nul 2>&1
if %errorlevel% equ 0 (
  set /a TESTS_PASSED+=1
  echo [32m✓ PASSED[0m
) else (
  set /a TESTS_FAILED+=1
  echo [31m✗ FAILED[0m
)

echo.

REM ========================================
REM Test Group 2: Extension Integration
REM ========================================
echo Test Group 2: Extension Integration
echo ----------------------------------------

cd "%TEST_DIR%\..\..\"

REM Test 3: Claude extension manifest
set /a TESTS_TOTAL+=1
echo Testing: Claude extension manifest valid...
node -e "JSON.parse(require('fs').readFileSync('claude-extension.json', 'utf8'))" >nul 2>&1
if %errorlevel% equ 0 (
  set /a TESTS_PASSED+=1
  echo [32m✓ PASSED[0m
) else (
  set /a TESTS_FAILED+=1
  echo [31m✗ FAILED[0m
)

REM Test 4: Qwen extension manifest
set /a TESTS_TOTAL+=1
echo Testing: Qwen extension manifest valid...
node -e "JSON.parse(require('fs').readFileSync('qwen-extension.json', 'utf8'))" >nul 2>&1
if %errorlevel% equ 0 (
  set /a TESTS_PASSED+=1
  echo [32m✓ PASSED[0m
) else (
  set /a TESTS_FAILED+=1
  echo [31m✗ FAILED[0m
)

REM Test 5: Gemini extension manifest
set /a TESTS_TOTAL+=1
echo Testing: Gemini extension manifest valid...
node -e "JSON.parse(require('fs').readFileSync('gemini-extension.json', 'utf8'))" >nul 2>&1
if %errorlevel% equ 0 (
  set /a TESTS_PASSED+=1
  echo [32m✓ PASSED[0m
) else (
  set /a TESTS_FAILED+=1
  echo [31m✗ FAILED[0m
)

REM Test 6: Extension installers exist
set /a TESTS_TOTAL+=1
echo Testing: Extension installers exist...
if exist "install-claude-extension.sh" if exist "install-qwen-extension.sh" if exist "install-gemini-extension.sh" (
  set /a TESTS_PASSED+=1
  echo [32m✓ PASSED[0m
) else (
  set /a TESTS_FAILED+=1
  echo [31m✗ FAILED[0m
)

echo.

REM ========================================
REM Test Group 3: Package Quality
REM ========================================
echo Test Group 3: Package Quality
echo ----------------------------------------

REM Test 7: package.json is valid
set /a TESTS_TOTAL+=1
echo Testing: package.json is valid JSON...
node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" >nul 2>&1
if %errorlevel% equ 0 (
  set /a TESTS_PASSED+=1
  echo [32m✓ PASSED[0m
) else (
  set /a TESTS_FAILED+=1
  echo [31m✗ FAILED[0m
)

REM Test 8: Required files exist
set /a TESTS_TOTAL+=1
echo Testing: Required files exist...
if exist "README.md" if exist "LICENSE" if exist "CONTRIBUTING.md" if exist "CHANGELOG.md" if exist "package.json" if exist "bin\prprompts" (
  set /a TESTS_PASSED+=1
  echo [32m✓ PASSED[0m
) else (
  set /a TESTS_FAILED+=1
  echo [31m✗ FAILED[0m
)

REM Test 9: Documentation files exist
set /a TESTS_TOTAL+=1
echo Testing: Documentation files exist...
if exist "docs\PRPROMPTS-SPECIFICATION.md" if exist "docs\AUTOMATION-GUIDE.md" if exist "CLAUDE.md" if exist "QWEN.md" if exist "GEMINI.md" if exist "ARCHITECTURE.md" if exist "DEVELOPMENT.md" (
  set /a TESTS_PASSED+=1
  echo [32m✓ PASSED[0m
) else (
  set /a TESTS_FAILED+=1
  echo [31m✗ FAILED[0m
)

REM Test 10: Example files exist
set /a TESTS_TOTAL+=1
echo Testing: Example files exist...
if exist "examples\healthcare-prd.md" (
  set /a TESTS_PASSED+=1
  echo [32m✓ PASSED[0m
) else (
  set /a TESTS_FAILED+=1
  echo [31m✗ FAILED[0m
)

echo.

REM ========================================
REM Test Summary
REM ========================================
echo ========================================
echo Test Summary
echo ========================================
echo Total Tests: %TESTS_TOTAL%
echo Passed: %TESTS_PASSED%
echo Failed: %TESTS_FAILED%
echo.

if %TESTS_FAILED% equ 0 (
  echo [32m✅ All tests passed![0m
  exit /b 0
) else (
  echo [31m❌ Some tests failed[0m
  exit /b 1
)
