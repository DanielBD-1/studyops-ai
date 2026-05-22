# StudyOps AI — run all package tests and frontend build (Windows)
# Does not print environment variables, create .env files, run migrations, or deploy.

$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

function Invoke-PackageStep {
    param(
        [string]$Title,
        [string]$Directory,
        [scriptblock]$Command
    )

    Write-Host ''
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host "Directory: $Directory" -ForegroundColor DarkGray
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host ''

    Push-Location (Join-Path $RepoRoot $Directory)
    try {
        & $Command
        if ($LASTEXITCODE -ne 0) {
            throw "Command failed with exit code $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}

Write-Host 'StudyOps AI — check-all' -ForegroundColor Green
Write-Host "Repository: $RepoRoot" -ForegroundColor DarkGray

Invoke-PackageStep -Title 'Backend — npm run lint' -Directory 'backend' -Command {
    npm.cmd run lint
}

Invoke-PackageStep -Title 'Backend — npm test' -Directory 'backend' -Command {
    npm.cmd test
}

Invoke-PackageStep -Title 'Document service — npm run lint' -Directory 'document-service' -Command {
    npm.cmd run lint
}

Invoke-PackageStep -Title 'Document service — npm test' -Directory 'document-service' -Command {
    npm.cmd test
}

Invoke-PackageStep -Title 'Frontend — npm run lint' -Directory 'frontend' -Command {
    npm.cmd run lint
}

Invoke-PackageStep -Title 'Frontend — npm test' -Directory 'frontend' -Command {
    npm.cmd test
}

Invoke-PackageStep -Title 'Frontend — npm run build' -Directory 'frontend' -Command {
    npm.cmd run build
}

Write-Host ''
Write-Host '========================================' -ForegroundColor Green
Write-Host 'All checks passed.' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host ''
