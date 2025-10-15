@echo off
REM Install PRPROMPTS Qwen Code Commands
REM Windows Batch Script

if "%1"=="" (
    echo Usage: %0 [--global^|--local]
    echo.
    echo   --global: Install commands globally ^(available in all projects^)
    echo   --local:  Install commands in current project only
    echo.
    exit /b 1
)

if not "%1"=="--global" if not "%1"=="--local" (
    echo Error: Invalid argument. Use --global or --local
    exit /b 1
)

echo.
echo [94m==================================================[0m
echo [94m PRPROMPTS Qwen Code Commands Installer[0m
echo [94m==================================================[0m
echo.

REM Get script directory
set "SCRIPT_DIR=%~dp0"
set "REPO_DIR=%SCRIPT_DIR%.."

REM Determine install location
if "%1"=="--global" (
    set "CONFIG_DIR=%USERPROFILE%\.config\qwen"
    echo [93mInstalling globally to: %CONFIG_DIR%[0m
) else (
    set "CONFIG_DIR=%CD%\.qwen"
    echo [93mInstalling locally to: %CONFIG_DIR%[0m
)

REM Create directories
if not exist "%CONFIG_DIR%\prompts" mkdir "%CONFIG_DIR%\prompts"

REM Copy prompt files
echo [92m[0m
echo [92mCopying prompt files...[0m
copy /Y "%REPO_DIR%\.qwen\prompts\generate-prd.md" "%CONFIG_DIR%\prompts\" >nul
copy /Y "%REPO_DIR%\.qwen\prompts\auto-generate-prd.md" "%CONFIG_DIR%\prompts\" >nul
copy /Y "%REPO_DIR%\.qwen\prompts\generate-prd-from-files.md" "%CONFIG_DIR%\prompts\" >nul
copy /Y "%REPO_DIR%\.qwen\prompts\analyze-prd.md" "%CONFIG_DIR%\prompts\" >nul
copy /Y "%REPO_DIR%\.qwen\prompts\prprompts-generator.md" "%CONFIG_DIR%\prompts\" >nul
copy /Y "%REPO_DIR%\.qwen\prompts\phase-1-core.md" "%CONFIG_DIR%\prompts\" >nul
copy /Y "%REPO_DIR%\.qwen\prompts\phase-2-quality.md" "%CONFIG_DIR%\prompts\" >nul
copy /Y "%REPO_DIR%\.qwen\prompts\phase-3-demo.md" "%CONFIG_DIR%\prompts\" >nul
copy /Y "%REPO_DIR%\.qwen\prompts\single-file-generator.md" "%CONFIG_DIR%\prompts\" >nul

REM Copy config file
echo [92mCreating config.yml...[0m
copy /Y "%REPO_DIR%\.qwen\config.yml" "%CONFIG_DIR%\" >nul

echo.
echo [92m==================================================[0m
echo [92m Installation complete![0m
echo [92m==================================================[0m
echo.
echo [94mAvailable commands:[0m
echo   qwen create-prd       - Interactive PRD wizard
echo   qwen auto-gen-prd     - Auto-generate PRD from description
echo   qwen prd-from-files   - Generate PRD from existing files
echo   qwen analyze-prd      - Validate and analyze PRD
echo   qwen gen-prprompts    - Generate all 32 PRPROMPTS files
echo   qwen gen-phase-1      - Generate Phase 1 ^(10 files^)
echo   qwen gen-phase-2      - Generate Phase 2 ^(12 files^)
echo   qwen gen-phase-3      - Generate Phase 3 ^(10 files^)
echo   qwen gen-file         - Generate single file
echo.
echo [94mQuick test:[0m
echo   qwen create-prd --help
echo.
echo [94mDocumentation:[0m
echo   https://github.com/Kandil7/prprompts-flutter-generator
echo.
echo [93mNote: Requires Qwen Code CLI installed[0m
echo [93mInstall: npm install -g @qwenlm/qwen-code[0m
echo.
