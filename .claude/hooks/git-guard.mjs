#!/usr/bin/env node
// PreToolUse hook: enforce the team contract's protected-branch rule.
//
// Blocks Bash commands that would commit or push directly to main/master.
// Everything must land through an `issue-<n>` branch and a reviewed PR.
//
// Contract: exit 0 = allow; exit 2 = block (stderr is shown to the agent).
// The guard only ever blocks clear violations; anything else passes through.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PROTECTED = /^(main|master)$/;

// Read the hook payload synchronously from stdin (fd 0).
let payload = {};
try {
  payload = JSON.parse(readFileSync(0, "utf8") || "{}");
} catch {
  process.exit(0); // can't parse input → don't get in the way
}

if (payload.tool_name !== "Bash") process.exit(0);

const cmd = String(payload.tool_input?.command ?? "");
if (!/\bgit\b/.test(cmd)) process.exit(0);

const isCommit = /\bgit\b[^\n]*\bcommit\b/.test(cmd);
const isPush = /\bgit\b[^\n]*\bpush\b/.test(cmd);
if (!isCommit && !isPush) process.exit(0);

let branch = "";
try {
  // symbolic-ref resolves the branch even on an unborn branch (no commits yet),
  // where `rev-parse --abbrev-ref HEAD` would just print "HEAD".
  branch = execSync("git symbolic-ref --short HEAD", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {
  branch = "";
}

const onProtected = PROTECTED.test(branch);
// A push that names main/master as a refspec, e.g. `git push origin main`.
const pushesProtectedRef = isPush && /\bpush\b[^\n]*\b(main|master)\b/.test(cmd);

function block(reason) {
  process.stderr.write(
    `\n[git-guard] Blocked: ${reason}\n\n` +
      `The team contract (CLAUDE.md) protects 'main': no direct commits or ` +
      `pushes.\nCreate an 'issue-<n>' branch, push it, and open a reviewed PR:\n` +
      `  git switch -c issue-<n>\n` +
      `  git push -u origin issue-<n>\n`
  );
  process.exit(2);
}

if (isCommit && onProtected) {
  block(`committing while on protected branch '${branch}'.`);
}
if (pushesProtectedRef) {
  block(`this push targets a protected branch (main/master).`);
}
if (isPush && onProtected && !/\bpush\b[^\n]*\borigin\s+\S/.test(cmd)) {
  // `git push` with no explicit ref while on main pushes main by default.
  block(`pushing the current protected branch '${branch}'.`);
}

process.exit(0);
