# Team Contract — jieguntech

This file is the working contract for this repository. Any agent (including
Claude) and any collaborator working here is expected to follow it. Some parts
are **org-wide** (the same across every jieguntech repo); the
[This repository](#this-repository) section holds the project-specific overrides.

Guardrails marked **(enforced)** are backed by a hook in `.claude/` and will be
blocked automatically — see [Automated guardrails](#automated-guardrails).

---

## Development workflow

We are issue-driven. Every change traces back to an issue and reaches `main`
only through a reviewed pull request.

1. **Open an issue** from a template in `.github/ISSUE_TEMPLATE/` so every
   ticket has a consistent shape and the right label — see
   [Issue types & labels](#issue-types--labels).
2. **Claim the issue** (assign yourself) before starting, so we don't collide.
3. **Branch and build.** Everyone is a collaborator, so clone this repo directly
   (no fork needed) and cut a branch off the latest `main`:
   - Feature/bugfix tied to an issue → `issue-<n>` (e.g. `issue-8`).
   - Urgent production fix → `hotfix-<n>`.
   Develop, commit, and `push` the branch.
4. **Open a PR into `main`** and request a reviewer. The PR title references the
   issue number (e.g. `issue-8: add issue templates`).
5. **Reviewer merges.** Only the reviewer merges the PR into `main`. Do **not**
   self-merge and **never** push straight to `main` **(enforced)**.
6. **CI deploys.** Merging to `main` triggers
   `.github/workflows/deploy.yml`, which builds and deploys to Cloudflare.

### Issue types & labels

Every issue is opened from one of the templates in `.github/ISSUE_TEMPLATE/`
(added in #8/#9). Pick the type that matches the work, fill every section, and
let the template apply the label:

| Template  | Label       | Use for / must capture                                                                                  |
| --------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| Bug 🐞    | `bug`       | Something broken. Overview, Steps to Reproduce, Actual vs Expected result.                               |
| Feature ⭐ | `feature`   | A new feature or planned work. Overview, Implementation sketch, References, and **Acceptance Criteria** in Given/When/Then. |
| Epic 🏗️   | `epic`      | Large work split into smaller tickets. Scope + Stakeholders; set the epic as the **parent** of its child features. |
| Spike 🔍  | `spike`     | A time-boxed investigation. State the Goal up front; record the **Investigation Outcome** (findings, decision, follow-ups) before closing. |

Docs-only changes use the `documentation` label. Keep an epic's child features
linked back to it, and close a spike only once its outcome is written down.

### Branch naming

| Purpose            | Pattern       | Example     |
| ------------------ | ------------- | ----------- |
| Issue work         | `issue-<n>`   | `issue-12`  |
| Hotfix             | `hotfix-<n>`  | `hotfix-2`  |

Branch off the latest `main`. Keep one branch per issue.

### Commits & PRs

- Write clear, imperative commit messages. Reference the issue when useful
  (e.g. `fix: remove incorrect content #6`).
- Keep PRs small and focused on a single issue.
- Always request at least one reviewer. The author never merges their own PR.
- `main` is protected: no direct commits, no direct pushes. Everything lands via
  a reviewed PR **(enforced)**.

---

## Tech stack (org-wide default)

We keep the stack **uniform across projects** and bias toward
**simple / easy-to-build / low-maintenance** choices. Only reach for something
heavier when a project genuinely needs it.

- **Language:** TypeScript everywhere.
- **Frontend:** Next.js + shadcn/ui + Tailwind CSS. Bundle with Turborepo or Vite.
- **Backend:** Hono + Zod + Drizzle. Bundle with Vite.
- **Repo layout:** monorepo per project, front + back managed with **pnpm**
  workspaces. If shared code emerges later across repos, we refactor and
  consolidate then — not preemptively.
- **Testing:** Vitest — unit tests plus E2E. See [Testing](#testing).
- **Database:** one shared **production** database for now. No staging DB in the
  early phase; revisit when the risk warrants it.
- **Deploy:** GitHub Actions → Cloudflare on merge to `main`.

> This repo (`innpilot-site`) predates that template and is a static Astro
> landing page. Its actual stack is in [This repository](#this-repository); use
> the template above only for **new** app repos.

---

## Testing

- Framework: **Vitest**.
- **Unit tests** for logic; **E2E tests** for critical user flows.
- Run tests locally before opening a PR; CI is the backstop, not the first check.

> `innpilot-site` currently has no test suite. If you add non-trivial logic,
> add Vitest and a `test` script rather than shipping untested code.

---

## This repository

`innpilot-site` is the landing page for <https://www.innpilot.ai>.

- **Stack:** Astro + TypeScript + Tailwind CSS, output as a static site.
- **Deploy target:** Cloudflare Workers (static asset bundle) via Wrangler.
- **Package manager:** pnpm (`pnpm@9.15.4`, pinned in `package.json`).

### Commands

```sh
pnpm install     # install dependencies
pnpm dev         # local dev server
pnpm build       # astro check (typecheck) + astro build → dist/
pnpm preview     # preview the built site
pnpm deploy      # build + wrangler deploy (normally CI does this)
```

`pnpm build` runs `astro check` first, so **build is also the typecheck/lint
gate** — run it before pushing.

### CI / deploy

`.github/workflows/deploy.yml` runs on PRs to `main` (build only) and on push to
`main` / manual dispatch (build **and** deploy). Required repo secrets:
`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`.

---

## Automated guardrails

Hooks in `.claude/` enforce parts of this contract so they can't be forgotten:

- **`SessionStart`** (`.claude/hooks/session-start.sh`) — installs dependencies
  (`pnpm install`) at the start of a web session so `pnpm build` and tests work
  immediately.
- **`PreToolUse` git guard** (`.claude/hooks/git-guard.mjs`) — blocks
  `git commit` and `git push` that would write directly to `main` / `master`.
  Land changes through an `issue-<n>` branch and a reviewed PR instead.

If a guard blocks you, it is pointing at a rule above — fix the workflow, don't
work around the guard.
