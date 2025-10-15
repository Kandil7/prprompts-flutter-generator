@echo off
REM Install PRPROMPTS Commands for BOTH Claude Code and Qwen Code
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
echo [96m==================================================[0m
echo [96m PRPROMPTS Dual Installation[0m
echo [96m Installing for Claude Code + Qwen Code[0m
echo [96m==================================================[0m
echo.

REM Check which CLIs are installed
set "CLAUDE_INSTALLED=false"
set "QWEN_INSTALLED=false"

where claude >nul 2>&1
if %ERRORLEVEL% == 0 (
    set "CLAUDE_INSTALLED=true"
    echo [92m[32mClaude Code CLI detected[0m
) else (
    echo [93m[33mClaude Code CLI not found[0m
    echo [93m  Install: npm install -g @anthropic-ai/claude-code[0m
)

where qwen >nul 2>&1
if %ERRORLEVEL% == 0 (
    set "QWEN_INSTALLED=true"
    echo [92m[32mQwen Code CLI detected[0m
) else (
    echo [93m[33mQwen Code CLI not found[0m
    echo [93m  Install: npm install -g @qwenlm/qwen-code[0m
)

echo.

REM Get script directory
set "SCRIPT_DIR=%~dp0"

REM Install Claude Code commands
echo [94m[0m
echo [94mInstalling Claude Code commands...[0m
echo [94m[0m
call "%SCRIPT_DIR%install-commands.bat" %1
echo.

REM Install Qwen Code commands
echo [94m[0m
echo [94mInstalling Qwen Code commands...[0m
echo [94m[0m
call "%SCRIPT_DIR%install-qwen-commands.bat" %1
echo.

echo.
echo [92m==================================================[0m
echo [92m Dual installation complete![0m
echo [92m==================================================[0m
echo.
echo [96mAvailable commands:[0m
echo.
echo [94mClaude Code:[0m
echo   claude create-prd       - Interactive PRD wizard
echo   claude gen-prprompts    - Generate all 32 PRPROMPTS files
echo.
echo [94mQwen Code:[0m
echo   qwen create-prd         - Interactive PRD wizard
echo   qwen gen-prprompts      - Generate all 32 PRPROMPTS files
echo.
echo [96mQuick test:[0m
echo   claude create-prd --help
echo   qwen create-prd --help
echo.
echo [96mDocumentation:[0m
echo   Claude: https://github.com/Kandil7/prprompts-flutter-generator
echo   Qwen:   https://github.com/Kandil7/prprompts-flutter-generator/blob/master/QWEN.md
echo.
