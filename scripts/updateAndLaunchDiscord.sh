#!/usr/bin/env bash
set -euo pipefail

SKIP_GIT=false
SKIP_INSTALL=false
SKIP_BUILD=false
SKIP_INJECT=false
NO_LAUNCH=false
NO_STOP_DISCORD=false

for arg in "$@"; do
    case "$arg" in
        --skip-git) SKIP_GIT=true ;;
        --skip-install) SKIP_INSTALL=true ;;
        --skip-build) SKIP_BUILD=true ;;
        --skip-inject) SKIP_INJECT=true ;;
        --no-launch) NO_LAUNCH=true ;;
        --no-stop-discord) NO_STOP_DISCORD=true ;;
        *)
            echo "Unknown option: $arg" >&2
            exit 2
            ;;
    esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log_step() {
    echo "==> $1"
}

get_latest_discord_app() {
    local candidates=(
        "/Applications/Discord.app"
        "$HOME/Applications/Discord.app"
        "/Applications/Discord Canary.app"
        "$HOME/Applications/Discord Canary.app"
        "/Applications/Discord PTB.app"
        "$HOME/Applications/Discord PTB.app"
    )

    local app
    for app in "${candidates[@]}"; do
        if [[ -d "$app" ]]; then
            printf '%s\n' "$app"
            return 0
        fi
    done

    return 1
}

test_dev_injection() {
    local expected="require(\"$REPO_ROOT/dist/patcher.js\")"
    local app
    local asar_path

    while IFS= read -r app; do
        asar_path="$app/Contents/Resources/app.asar"
        if [[ ! -f "$asar_path" ]]; then
            continue
        fi

        if grep -aFq "$expected" "$asar_path"; then
            return 0
        fi
    done < <(printf '%s\n' \
        "/Applications/Discord.app" \
        "$HOME/Applications/Discord.app" \
        "/Applications/Discord Canary.app" \
        "$HOME/Applications/Discord Canary.app" \
        "/Applications/Discord PTB.app" \
        "$HOME/Applications/Discord PTB.app")

    return 1
}

cd "$REPO_ROOT"

HEAD_BEFORE=""
HEAD_AFTER=""
NEEDS_INSTALL=false

if [[ ! -d "$REPO_ROOT/node_modules" ]]; then
    NEEDS_INSTALL=true
fi

if [[ "$NO_STOP_DISCORD" != true ]]; then
    log_step "Stopping Discord"
    pkill -x Discord || true
    pkill -x "Discord Canary" || true
    pkill -x "Discord PTB" || true
fi

if [[ "$SKIP_GIT" != true ]]; then
    HEAD_BEFORE="$(git rev-parse HEAD)"
    log_step "Updating from upstream/main"
    git fetch upstream
    git pull --rebase --autostash upstream main
    HEAD_AFTER="$(git rev-parse HEAD)"

    if [[ "$HEAD_BEFORE" != "$HEAD_AFTER" ]]; then
        mapfile -t changed_files < <(git diff --name-only "$HEAD_BEFORE" "$HEAD_AFTER")
        for file in "${changed_files[@]}"; do
            if [[ "$file" == "package.json" || "$file" == "pnpm-lock.yaml" ]]; then
                NEEDS_INSTALL=true
                break
            fi
        done
    fi
fi

if [[ "$SKIP_INSTALL" != true ]]; then
    if [[ "$NEEDS_INSTALL" == true ]]; then
        log_step "Installing dependencies"
        pnpm install
    else
        echo "==> Skipping dependency install (no lockfile/package change)"
    fi
fi

if [[ "$SKIP_BUILD" != true ]]; then
    log_step "Building Vencord"
    pnpm build
fi

if [[ "$SKIP_INJECT" != true ]]; then
    if test_dev_injection; then
        echo "==> Skipping inject (dev install already points at this repo)"
    else
        log_step "Injecting into Discord"
        pnpm inject
    fi
fi

if [[ "$NO_LAUNCH" != true ]]; then
    if discord_app="$(get_latest_discord_app)"; then
        log_step "Launching Discord"
        open -a "$discord_app"
    else
        echo "Discord.app was not found in /Applications or ~/Applications" >&2
    fi
fi
