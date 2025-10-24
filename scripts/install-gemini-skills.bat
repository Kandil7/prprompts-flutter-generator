@echo off
REM PRPROMPTS Gemini CLI Skills Installer (Batch)
REM Installs all PRPROMPTS skills as global Gemini CLI TOML slash commands

echo.
echo Installing PRPROMPTS Skills for Gemini CLI...
echo.

REM Set Gemini directory
set "GEMINI_DIR=%USERPROFILE%\.gemini"

REM Create skills directory structure
echo Creating skills directory structure...
if not exist "%GEMINI_DIR%\commands\skills\automation" mkdir "%GEMINI_DIR%\commands\skills\automation"
if not exist "%GEMINI_DIR%\commands\skills\prprompts-core" mkdir "%GEMINI_DIR%\commands\skills\prprompts-core"
if not exist "%GEMINI_DIR%\commands\skills\development-workflow" mkdir "%GEMINI_DIR%\commands\skills\development-workflow"

REM Get repository directory
set "REPO_DIR=%~dp0.."

REM Copy TOML skill files
echo Installing skill files...

REM Automation skills
if exist "%REPO_DIR%\.gemini\commands\skills\automation\*.toml" (
    copy /Y "%REPO_DIR%\.gemini\commands\skills\automation\*.toml" "%GEMINI_DIR%\commands\skills\automation\" >nul 2>&1
    echo   - Automation skills installed
)

REM PRPROMPTS Core skills
if exist "%REPO_DIR%\.gemini\commands\skills\prprompts-core\*.toml" (
    copy /Y "%REPO_DIR%\.gemini\commands\skills\prprompts-core\*.toml" "%GEMINI_DIR%\commands\skills\prprompts-core\" >nul 2>&1
    echo   - PRPROMPTS Core skills installed
)

REM Development Workflow skills
if exist "%REPO_DIR%\.gemini\commands\skills\development-workflow\*.toml" (
    copy /Y "%REPO_DIR%\.gemini\commands\skills\development-workflow\*.toml" "%GEMINI_DIR%\commands\skills\development-workflow\" >nul 2>&1
    echo   - Workflow skills installed
)

echo.
echo Installation complete!
echo.
echo Installation path: %GEMINI_DIR%\commands\skills\
echo.
echo Usage Examples:
echo   gemini
echo   /skills:automation:flutter-bootstrapper
echo   /skills:automation:code-reviewer
echo   /skills:automation:qa-auditor
echo.
echo Gemini-specific features:
echo   # Inline arguments
echo   /skills:automation:code-reviewer security lib/features/auth
echo.
echo   # 1M token context + Free tier (60 req/min, 1K/day)
echo.
echo Documentation: docs\GEMINI-SKILLS-GUIDE.md
echo.
echo Installation successful!
pause
