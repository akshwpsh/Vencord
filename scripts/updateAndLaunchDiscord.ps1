param(
    [switch]$SkipGit,
    [switch]$SkipInstall,
    [switch]$SkipBuild,
    [switch]$SkipInject,
    [switch]$NoLaunch,
    [switch]$NoStopDiscord
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$discordRoot = Join-Path $env:LOCALAPPDATA "Discord"

function Invoke-Step {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [scriptblock]$Action
    )

    Write-Host "==> $Name"
    & $Action
}

function Get-LatestDiscordExe {
    if (-not (Test-Path $discordRoot)) {
        return $null
    }

    $appDir = Get-ChildItem $discordRoot -Directory -Filter "app-*" |
        Sort-Object Name -Descending |
        Select-Object -First 1

    if (-not $appDir) {
        return $null
    }

    $exePath = Join-Path $appDir.FullName "Discord.exe"
    if (Test-Path $exePath) {
        return $exePath
    }

    return $null
}

function Test-DevInjection {
    if (-not (Test-Path $discordRoot)) {
        return $false
    }

    $expected = "require(""$repoRoot\dist\patcher.js"")"
    $appDirs = Get-ChildItem $discordRoot -Directory -Filter "app-*"

    foreach ($appDir in $appDirs) {
        $asarPath = Join-Path $appDir.FullName "resources\app.asar"
        if (-not (Test-Path $asarPath)) {
            continue
        }

        try {
            $content = [System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes($asarPath))
            if ($content.Contains($expected)) {
                return $true
            }
        } catch {
            Write-Warning "Failed to inspect $asarPath"
        }
    }

    return $false
}

Push-Location $repoRoot

try {
    $headBefore = ""
    $headAfter = ""
    $needsInstall = -not (Test-Path (Join-Path $repoRoot "node_modules"))

    if (-not $NoStopDiscord) {
        Invoke-Step "Stopping Discord" {
            Get-Process -ErrorAction SilentlyContinue |
                Where-Object { $_.ProcessName -like "Discord*" } |
                Stop-Process -Force -ErrorAction SilentlyContinue
        }
    }

    if (-not $SkipGit) {
        $headBefore = (git rev-parse HEAD).Trim()
        Invoke-Step "Updating from upstream/main" {
            git fetch upstream
            if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

            git pull --rebase --autostash upstream main
            if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        }
        $headAfter = (git rev-parse HEAD).Trim()

        if ($headBefore -ne $headAfter) {
            $changedFiles = @(git diff --name-only $headBefore $headAfter)
            if ($changedFiles -contains "package.json" -or $changedFiles -contains "pnpm-lock.yaml") {
                $needsInstall = $true
            }
        }
    }

    if (-not $SkipInstall) {
        if ($needsInstall) {
            Invoke-Step "Installing dependencies" {
                pnpm install
                if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
            }
        } else {
            Write-Host "==> Skipping dependency install (no lockfile/package change)"
        }
    }

    if (-not $SkipBuild) {
        Invoke-Step "Building Vencord" {
            pnpm build
            if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        }
    }

    if (-not $SkipInject) {
        if (Test-DevInjection) {
            Write-Host "==> Skipping inject (dev install already points at this repo)"
        } else {
            Invoke-Step "Injecting into Discord" {
                pnpm inject
                if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
            }
        }
    }

    if (-not $NoLaunch) {
        $discordExe = Get-LatestDiscordExe
        if ($discordExe) {
            Invoke-Step "Launching Discord" {
                Start-Process -FilePath $discordExe | Out-Null
            }
        } else {
            Write-Warning "Discord.exe was not found under $discordRoot"
        }
    }
} finally {
    Pop-Location
}
