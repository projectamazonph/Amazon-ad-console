# Deployment (Vercel)

## Project

- Vercel project: `amazon-ad-console` (team: `ryandabao1982s-projects`)
- Framework: Next.js, built with Turbopack
- Git integration: GitHub `projectamazonph/Amazon-ad-console`, production tracks the `main` branch
- No custom domain configured — production is served on `*.vercel.app` aliases only

## Branch protection

`main` requires a pull request and a passing `Type-check, test, build` status check.
Direct pushes to `main` (including empty/no-op commits) are rejected by GitHub rules —
all changes, including deploy-trigger commits, must go through a PR.

## Triggering a redeploy

There is no API/CLI action available in this repo's tooling that redeploys an existing
Vercel deployment by ID or deletes a project. To redeploy production:

1. Open https://vercel.com/ryandabao1982s-projects/amazon-ad-console/deployments
2. Find the deployment aliased to production (top of the list, `target: production`)
3. Open its "⋯" menu → **Redeploy**

This re-runs the build for that exact deployment's commit without needing a new push.

To deploy a *different* commit to production instead, merge a PR into `main` — the
GitHub integration builds and promotes it automatically once CI passes.

## Known gotcha: production can drift from `main`

Production is whatever deployment is currently aliased to it — that isn't always
`main`'s latest commit. A deployment can be promoted to production from any branch
(e.g. via a manual "Redeploy" of an older build, or a preview deployment promoted by
hand). Before assuming production matches `main` HEAD, check the deployment's
`meta.githubCommitRef` and `meta.githubCommitSha` against `git log main -1`.
