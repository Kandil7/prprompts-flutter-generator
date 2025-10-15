@echo off
REM PRPROMPTS Quick Install Script - Windows Batch
REM Version: 1.0.0
REM This file should be downloaded and run locally on Windows

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════╗
echo ║   PRPROMPTS Flutter Generator Setup      ║
echo ║   Quick Install - Claude Code Commands   ║
echo ╚═══════════════════════════════════════════╝
echo.

echo [93mDetected OS: Windows[0m
echo.

REM Set directories
set "CONFIG_DIR=%USERPROFILE%\.config\claude"
set "TEMP_DIR=%TEMP%\prprompts-flutter-generator"

REM Check for Claude Code
echo [94mChecking for Claude Code CLI...[0m
where claude >nul 2>&1
if %errorlevel% neq 0 (
    echo [93m⚠️  Claude Code not found. Installing...[0m
    where npm >nul 2>&1
    if %errorlevel% neq 0 (
        echo [91m❌ npm not found. Please install Node.js first: https://nodejs.org[0m
        exit /b 1
    )
    npm install -g @anthropic-ai/claude-code
)

echo [92m✅ Claude Code found[0m
echo.

REM Clone repository
echo [94m📥 Downloading PRPROMPTS...[0m

if exist "%TEMP_DIR%" (
    rmdir /s /q "%TEMP_DIR%"
)

git clone --depth 1 https://github.com/Kandil7/prprompts-flutter-generator.git "%TEMP_DIR%" >nul 2>&1
if %errorlevel% neq 0 (
    echo [91m❌ Git not found or clone failed. Please install Git: https://git-scm.com[0m
    exit /b 1
)

REM Create config directory
echo [94m📦 Installing commands...[0m
if not exist "%CONFIG_DIR%\prompts" mkdir "%CONFIG_DIR%\prompts"

REM Copy files
copy /Y "%TEMP_DIR%\.claude\prompts\*.md" "%CONFIG_DIR%\prompts\" >nul
copy /Y "%TEMP_DIR%\.claude\config.yml" "%CONFIG_DIR%\" >nul

REM Cleanup
rmdir /s /q "%TEMP_DIR%"

echo.
echo [92m✅ Installation complete![0m
echo.
echo [96m╔═══════════════════════════════════════════╗[0m
echo [96m║          Available Commands               ║[0m
echo [96m╚═══════════════════════════════════════════╝[0m
echo.
echo   [92mclaude create-prd[0m       Interactive PRD wizard
echo   [92mclaude auto-gen-prd[0m     Auto-generate PRD
echo   [92mclaude prd-from-files[0m   Generate PRD from markdown files
echo   [92mclaude analyze-prd[0m      Validate PRD
echo   [92mclaude gen-prprompts[0m    Generate all 32 files
echo   [92mclaude gen-phase-1[0m      Generate Phase 1
echo   [92mclaude gen-phase-2[0m      Generate Phase 2
echo   [92mclaude gen-phase-3[0m      Generate Phase 3
echo   [92mclaude gen-file[0m         Generate single file
echo.
echo [96m╔═══════════════════════════════════════════╗[0m
echo [96m║          Quick Start                      ║[0m
echo [96m╚═══════════════════════════════════════════╝[0m
echo.
echo   [93m1.[0m cd your-flutter-project
echo   [93m2.[0m claude create-prd
echo   [93m3.[0m claude gen-prprompts
echo   [93m4.[0m Start coding!
echo.
echo [92m📖 Documentation:[0m
echo   https://github.com/Kandil7/prprompts-flutter-generator
echo.
echo [92m💬 Support:[0m
echo   https://github.com/Kandil7/prprompts-flutter-generator/issues
echo.

endlocal
