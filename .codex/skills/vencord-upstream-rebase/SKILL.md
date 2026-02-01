---
name: vencord-upstream-rebase
description: Automate rebasing a forked Vencord repo onto its upstream remote with autostash and conflict handling. Use when asked to sync a fork with upstream, run a safe rebase from upstream/main, or handle rebase conflicts in this repo.
---

# Vencord Upstream Rebase

## Overview

Rebase the current branch on top of `upstream/main` (or another upstream branch) with autostash and optional automatic conflict resolution. Prefer the bundled script for repeatability and consistent behavior.

## Workflow

1) Confirm remotes and target branch  
- Ensure `upstream` remote exists and points to the original Vencord repo.  
- Default target is `upstream/main`, but accept other branch names when requested.

2) Run the rebase script  
- Use `scripts/upstream-rebase.sh` for consistent autostash + conflict handling.  
- If the user wants manual conflict resolution, pass `--strategy manual`.

3) Report results and next steps  
- If conflicts were auto-resolved, mention the chosen strategy.  
- If manual resolution is needed, explain how to resolve and continue (`git rebase --continue`).

## Conflict Strategy Guidance

Use `--strategy theirs` to prefer upstream changes (default). Use `--strategy ours` to keep local changes when conflicts occur. For non-trivial conflicts or when correctness matters, use `--strategy manual` and resolve carefully.

## Commands

Default rebase onto upstream/main with autostash and auto-resolve in favor of upstream:

```bash
skills/vencord-upstream-rebase/scripts/upstream-rebase.sh
```

Prefer local changes during conflicts:

```bash
skills/vencord-upstream-rebase/scripts/upstream-rebase.sh --strategy ours
```

Manual conflict resolution:

```bash
skills/vencord-upstream-rebase/scripts/upstream-rebase.sh --strategy manual
```

Target a different remote/branch:

```bash
skills/vencord-upstream-rebase/scripts/upstream-rebase.sh --remote upstream --branch dev
```
