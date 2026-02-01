#!/usr/bin/env bash
set -euo pipefail

REMOTE="upstream"
BRANCH="main"
STRATEGY="theirs"
AUTOSTASH="true"

print_usage() {
  cat <<'USAGE'
Usage: upstream-rebase.sh [--remote <name>] [--branch <name>] [--strategy theirs|ours|manual] [--no-autostash]

Defaults:
  --remote upstream
  --branch main
  --strategy theirs

Notes:
  - "theirs" prefers upstream changes during conflicts
  - "ours" keeps local changes during conflicts
  - "manual" stops on conflicts for hand resolution
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --remote)
      REMOTE="$2"
      shift 2
      ;;
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    --strategy)
      STRATEGY="$2"
      shift 2
      ;;
    --no-autostash)
      AUTOSTASH="false"
      shift
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      print_usage >&2
      exit 2
      ;;
  esac
done

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repository." >&2
  exit 1
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "Remote '$REMOTE' not found. Add it with: git remote add $REMOTE <url>" >&2
  exit 1
fi

git fetch "$REMOTE"

REBASE_CMD=(git)
if [[ "$AUTOSTASH" == "true" ]]; then
  REBASE_CMD+=(-c rebase.autoStash=true)
fi
REBASE_CMD+=(rebase)

set +e
${REBASE_CMD[@]} "$REMOTE/$BRANCH"
REBASE_EXIT=$?
set -e

if [[ $REBASE_EXIT -eq 0 ]]; then
  exit 0
fi

if [[ "$STRATEGY" == "manual" ]]; then
  echo "Rebase stopped due to conflicts. Resolve them, then run: git rebase --continue" >&2
  exit $REBASE_EXIT
fi

case "$STRATEGY" in
  theirs|ours) ;;
  *)
    echo "Invalid strategy: $STRATEGY (use theirs|ours|manual)" >&2
    exit 2
    ;;
esac

MAX_STEPS=100
STEP=0

while [[ -d .git/rebase-apply || -d .git/rebase-merge ]]; do
  STEP=$((STEP + 1))
  if [[ $STEP -gt $MAX_STEPS ]]; then
    echo "Aborting: too many rebase steps. Resolve manually." >&2
    exit 1
  fi

  CONFLICT_FILES="$(git diff --name-only --diff-filter=U || true)"
  if [[ -z "$CONFLICT_FILES" ]]; then
    set +e
    GIT_EDITOR=true git rebase --continue
    CONTINUE_EXIT=$?
    set -e
    if [[ $CONTINUE_EXIT -eq 0 ]]; then
      continue
    fi
    echo "Rebase could not continue. Resolve conflicts manually." >&2
    exit $CONTINUE_EXIT
  fi

  while IFS= read -r file; do
    if [[ -n "$file" ]]; then
      git checkout "--$STRATEGY" -- "$file"
      git add "$file"
    fi
  done <<< "$CONFLICT_FILES"

  set +e
  GIT_EDITOR=true git rebase --continue
  CONTINUE_EXIT=$?
  set -e
  if [[ $CONTINUE_EXIT -ne 0 ]]; then
    echo "Rebase stopped again. Resolve conflicts manually if needed." >&2
    exit $CONTINUE_EXIT
  fi
done
