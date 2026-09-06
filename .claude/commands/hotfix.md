---
description: Create a hotfix branch, reproduce with a failing test, fix, and open a PR
argument-hint: <issue-number> "<one-line summary>"
---

# Hotfix branch

Given an issue number (`$1`) and a one-line summary (`$2`):
1. Create branch `hotfix/$1`
2. Reproduce the bug with a failing test first
3. Fix, confirm the test passes, run the full suite
4. Open a PR titled "$2 (fixes #$1)"
