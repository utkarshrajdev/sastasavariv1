---
description: Branch (if on main), commit staged work, push, and open a PR against main
argument-hint: [short description of the change]
---

# Ship: branch → commit → push → PR

Take the current uncommitted work and get it onto a new branch with an open PR
against `main`. `$ARGUMENTS` (optional) is a short description of the change — use
it for the branch name and PR title; if empty, infer both from the diff.

Do this:

1. **Inspect.** Run `git status` and `git diff` (plus `git diff --staged`). If the
   working tree is clean and nothing is staged, stop and say so.
2. **Branch.** If the current branch is `main`, create and switch to a new branch
   `hotfix/<kebab-slug>` (slug from `$ARGUMENTS`, else from the diff). If already
   on a non-`main` branch, stay on it.
3. **Stage deliberately.** Add only the files that belong to this change. Do **not**
   blind `git add -A` — leave unrelated untracked files (editor/tooling cruft)
   alone. If it's ambiguous which files belong, ask before staging.
4. **Commit.** One clear message: a concise summary line, then a short body if the
   change isn't obvious. End the message with the attribution trailer this
   session requires (the `Co-Authored-By:` line, and the `Claude-Session:` line
   if one was given).
5. **Push.** `git push -u origin HEAD`.
6. **PR.** `gh pr create --base main --head <branch> --title "<title>" --body "<body>"`.
   Body: what changed and why, a test/lint note (`npm run lint` — expect the 31
   pre-existing errors, no new ones), and end with:
   `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
7. **Report** the branch name and the PR URL.

Notes:
- This repo deploys from `main` on push (GitHub Pages, no CI), so never push to
  `main` directly — the PR is the gate.
- Requires `gh` to be authenticated (`gh auth login`). If `gh` fails, stop after
  the push and give the user the compare URL to open the PR manually.
