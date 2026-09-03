<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cloud Agent / local bootstrap

- Node `>=22.5.0`. On this private worker, activate via nvm: `. "$HOME/.nvm/nvm.sh" && nvm use 22`.
- Install: `npm ci`. Dev server: `npm run dev -- --hostname 127.0.0.1 --port 3000`.
- Required runtime secret for chat: `YSZ_UPSTREAM_API_KEY` (or `LITELLM_MASTER_KEY`). Optional: `YSZ_UPSTREAM_BASE_URL` (default `https://api.yszmai.com/v1`).
- Do not commit `.env*`. SQLite team data lives under `data/` (gitignored); use `YSZ_DATA_DIR` for an isolated DB.
- Useful checks: `npx eslint "src/**/*.{ts,tsx}"`, `npx tsc --noEmit`, `npm run build`.
- `api/` is the separate LiteLLM gateway deploy tree; the Next.js app is the primary local product surface.
