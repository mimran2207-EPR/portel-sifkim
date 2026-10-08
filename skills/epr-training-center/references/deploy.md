# Deploy: GitHub → Cloudflare Workers

The site is a Cloudflare **Worker with static assets** that rebuilds on every push.

## One-time setup

1. The user creates an empty GitHub repo (public is fine — but see the privacy rules; private works too).
2. In `wrangler.jsonc` set `"name"` to the new worker name. Keep:
   ```jsonc
   {
     "name": "<worker-name>",
     "compatibility_date": "2026-10-01",
     "build": { "command": "npm run build" },
     "assets": { "directory": "./dist", "not_found_handling": "single-page-application" }
   }
   ```
   The `build` command matters: without it Cloudflare deploys before `dist/` exists and fails.
3. Push `main`. The user (in the Cloudflare dashboard) → Workers & Pages → Create → Import a repository
   → picks the repo → deploy command `npx wrangler deploy` (default). The site appears at
   `https://<worker-name>.<account>.workers.dev`.
4. `.gitattributes` with `* text=auto eol=lf` keeps line endings stable on Windows.

## Every change

```bash
npm test && npm run build      # must pass
git add <specific files>       # never `git add -A` — private files and stray junk files exist
git commit -m "<what changed>"
git push
gh api repos/<owner>/<repo>/commits/HEAD/check-runs --jq '.check_runs[] | .name+" "+.status+" "+(.conclusion//"")'
```
Report "live" only after the "Workers Builds" check-run is `completed success`. If a push doesn't
trigger a build, an empty commit (`git commit --allow-empty -m "ci: rebuild"`) does.
Note: "Retry build" in Cloudflare rebuilds the *old* commit, not the latest one.

Visitors with the site already open need one refresh to load a new version.
