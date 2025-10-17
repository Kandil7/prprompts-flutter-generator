@echo off
REM PRPROMPTS One-Click Installer for Windows
REM Version: 3.0
REM Just double-click this file to install!

echo.
echo ======================================================
echo   PRPROMPTS Flutter Generator - Windows Installer
echo   Version 3.0
echo ======================================================
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js first:
    echo https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version

REM Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found!
    echo.
    echo Please install Node.js first:
    echo https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [OK] npm found
npm --version
echo.

REM Check for Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Git not found!
    echo.
    echo Git is recommended but not required.
    echo Download from: https://git-scm.com
    echo.
    echo Continuing installation...
    echo.
)

REM Check for Claude Code
where claude >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Claude Code not installed
    echo.
    set /p INSTALL_CLAUDE="Install Claude Code? (Y/N): "
    if /i "%INSTALL_CLAUDE%"=="Y" (
        echo.
        echo Installing Claude Code...
        npm install -g @anthropic-ai/claude-code
        echo.
    )
) else (
    echo [OK] Claude Code found
    claude --version
)

echo.
echo ======================================================
echo  Installing PRPROMPTS Commands...
echo ======================================================
echo.

REM Create config directory
if not exist "%USERPROFILE%\.config\claude" (
    mkdir "%USERPROFILE%\.config\claude"
)

if not exist "%USERPROFILE%\.config\claude\prompts" (
    mkdir "%USERPROFILE%\.config\claude\prompts"
)

REM Copy prompt files
echo Copying prompt files...
xcopy /Y /Q ".claude\prompts\*.md" "%USERPROFILE%\.config\claude\prompts\" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to copy prompt files
    echo Make sure you're running this from the prprompts-flutter-generator directory
    pause
    exit /b 1
)

REM Copy config file
echo Copying config file...
copy /Y ".claude\config.yml" "%USERPROFILE%\.config\claude\config.yml" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to copy config file
    pause
    exit /b 1
)

echo.
echo ======================================================
echo  Installation Complete!
echo ======================================================
echo.
echo Available commands:
echo   claude create-prd       - Interactive PRD wizard
echo   claude auto-gen-prd     - Auto-generate PRD
echo   claude gen-prprompts    - Generate all 32 files
echo   claude gen-phase-1      - Generate Phase 1
echo   claude gen-phase-2      - Generate Phase 2
echo   claude gen-phase-3      - Generate Phase 3
echo   claude analyze-prd      - Validate PRD
echo   claude gen-file         - Generate single file
echo.
echo Quick Start:
echo   1. cd your-flutter-project
echo   2. claude create-prd
echo   3. claude gen-prprompts
echo   4. Start coding!
echo.
echo Documentation:
echo   https://github.com/Kandil7/prprompts-flutter-generator
echo.
echo.
pause
