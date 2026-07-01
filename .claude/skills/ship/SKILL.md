---
description: Stage, commit, and push all changes to GitHub (origin/main)
---

# ship

Commits any uncommitted changes and pushes to `origin/main`.

## Steps

1. Run `git status` and `git diff` to see what has changed.

2. Stage all modified and new files that belong to the project (skip `.DS_Store`, `*.log`, and other junk files):
   ```bash
   git add -A
   git reset HEAD -- "*.DS_Store" "**/.DS_Store" "*.log" 2>/dev/null; true
   ```

3. If there is nothing staged, tell the user there is nothing to ship and stop.

4. Write a concise commit message that summarises the changes (1–2 sentences, present tense). Use the diff to inform the message — do not just say "update files".

5. Commit:
   ```bash
   git commit -m "<your message>\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
   ```

6. Push:
   ```bash
   git push origin main
   ```

7. Report the commit SHA and confirm the push succeeded.
