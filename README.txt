# GitHub Actions workflow

Copy the `.github` folder into the root of a repository you are authorized to publish.

This workflow runs on pushes and pull requests to `main` or `master`. It installs Node.js 22, Python 3, and Yarn 1.22.22, then runs the repository's `check`, `typecheck`, and `python:check` scripts.

It installs dependencies for CI; it does not publish a package to GitHub Packages or deploy/run the Discord bot.

Do not add `.env`, bot tokens, database passwords, or other secrets to the repository. Store any required secrets in GitHub Actions Secrets and reference them only if a workflow genuinely needs them.
