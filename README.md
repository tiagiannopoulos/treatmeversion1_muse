# treatme.

yuka for your face. scan your skin, get a clear report, get a treatment plan built around you.

## stack

- tanstack start (react 19) + typescript + tailwind css v4
- supabase (auth + postgres) for accounts, scan history, daily limits
- anthropic claude vision for the skin analysis engine
- nitro build, vercel preset for deployment
- structured for a later capacitor wrap for ios

## quick start

```bash
npm install
cp .env.example .env   # then fill in your keys
npm run dev            # http://localhost:3000
```

## environment

| variable | where | what |
|---|---|---|
| `VITE_SUPABASE_URL` | client | supabase project url |
| `VITE_SUPABASE_ANON_KEY` | client | supabase anon key |
| `SUPABASE_URL` | server | supabase project url |
| `SUPABASE_SERVICE_ROLE_KEY` | server | service role key (secret) |
| `ANTHROPIC_API_KEY` | server | enables POST /api/analyze (secret) |
| `ANTHROPIC_MODEL` | server | vision model, default `claude-sonnet-4-5` |

without `ANTHROPIC_API_KEY`, `POST /api/analyze` returns `503 analysis unavailable`. it never returns fake scores.

## database

run `supabase/schema.sql` in the supabase sql editor. it creates:

- `profiles` (id, email, is_premium) with a trigger that creates a row on signup
- `scans` (user_id, scores, explanations, top_priorities, summary, fitzpatrick, email)
- row level security so users only see their own rows

## api

- `POST /api/analyze` — multipart form-data: `front`, `left`, `right` (jpeg/png/webp, max 5mb each), `ageRange`, `concerns` (json array), `email`. header: `Authorization: Bearer <supabase access token>`. returns `{ scan_id, result }`. enforces 5 free scans/day (premium = unlimited).
- `GET /api/health` — `{ ok, analysis_configured, db_configured }`.

## deploy to vercel

verified 2026-09-22 with `npm run build:vercel` producing a valid `.vercel/output` bundle.

1. push this repo to github.
2. import it in vercel.
3. build command: `npm run build:vercel`. leave the output directory empty, vercel picks up `.vercel/output` automatically.
4. add the env vars from `.env.example` in vercel project settings (supabase + anthropic).
5. point `treatmeapp.com` at the vercel project.

`npm run build` alone does a plain vite build (client + ssr bundles in `dist/`, useful for local checks). only the `build:vercel` script packages the server as vercel serverless functions via the nitro vite plugin.

## project layout

```
src/routes/            # pages + api routes (file based)
  index.tsx            # landing
  scan.tsx             # guided photo capture
  analyzing.tsx        # progress + tap cards + email gate
  report.$scanId.tsx   # skin report with face map
  treatments.tsx       # matched treatments + filters
  history.tsx          # saved scans + 30 day rescan compare
  signin.tsx           # supabase magic link
  api/analyze.ts       # vision analysis endpoint
  api/health.ts        # config check
src/lib/
  concerns.ts          # 16 concern taxonomy, bands, zod schemas
  treatments.ts        # starter treatment library + matching
  scan-store.tsx       # scan flow state
  supabase.ts          # browser client
  supabase.server.ts   # server-only helpers (never bundled for client)
src/components/        # topbar, score bars, face map
supabase/schema.sql    # db schema
docs/DECISIONS.md      # locked product decisions
```

## notes

- all user-facing copy is lowercase, no em-dashes. brand: black, white, hot pink (#ff2e88).
- scores are 0-100, higher = better. bands: great / good / average / "focus here". never "poor", no skin age.
- booking is external links only in v1 (concierge model).
