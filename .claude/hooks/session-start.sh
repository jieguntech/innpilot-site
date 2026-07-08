#!/bin/bash
# SessionStart hook: make the repo ready to build and test.
# Installs dependencies so `pnpm build` / tests work immediately in a session.
# Idempotent and non-interactive. Runs synchronously (deps guaranteed ready
# before the session starts). Switch to async mode if faster startup matters.
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# Enable the pnpm version pinned in package.json ("packageManager": "pnpm@...").
corepack enable >/dev/null 2>&1 || true

# `install` (not `--frozen-lockfile`) is friendlier to the cached container
# layer and to lockfile changes made during a session.
pnpm install

echo "session-start: dependencies installed."
