# PRPROMPTS Generator - Gemini Wrapper Script
# Allows running gen-prprompts directly from PowerShell

param(
    [string]$ProjectPath = (Get-Location)
)

Write-Host "🚀 PRPROMPTS Generator (Gemini CLI)" -ForegroundColor Cyan
Write-Host "Project: $ProjectPath" -ForegroundColor Gray
Write-Host ""

# Change to project directory
Push-Location $ProjectPath

# Run gemini with the gen-prprompts command in interactive mode
# Using echo to pipe the command to gemini
"gen-prprompts" | gemini -i

Pop-Location
