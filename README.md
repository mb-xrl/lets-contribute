# Let's Contribute

A glassmorphic community board for open source — **share contribution opportunities, post ideas,
and discuss projects** until they ship. Sign in with GitHub, pick something small, and get unstuck
in public.

Built as a monorepo: **NestJS** API + **Next.js** app + **Neon Postgres**, deployed on **Vercel**.

![stack](https://img.shields.io/badge/NestJS-11-ea2845) ![stack](https://img.shields.io/badge/Next.js-15-000000) ![stack](https://img.shields.io/badge/Neon-Postgres-00e599) ![stack](https://img.shields.io/badge/Vercel-deployed-000000)

---

## What's inside

| Area | What you get |
| --- | --- |
| **Feed** | One board with three post types (opportunity / idea / discussion), tag + full-text search, sorting by newest / top voted / most discussed, pagination |
| **Opportunities** | Scoped work with difficulty, skills, repository link, and the project it belongs to |
| **Ideas** | Half-formed thoughts with upvotes and threaded replies |
| **Projects** | A permanent home per repository: its opportunities, its threads, its people |
| **Discussions** | Markdown-lite bodies, replies, author-only delete, live vote toggling |
| **Profiles** | Contribution record per member: posts, ideas, discussions, replies, upvotes earned, editable bio |
| **GitHub** | OAuth sign-in (signed, http-only session cookie) + live repository import that reads stars, language, topics and open good-first-issues from the GitHub API |
| **Design** | Glassmorphism design system: layered aurora background, translucent surfaces, `prefers-reduced-transparency` fallback, and **one icon registry** — no inline `<svg>`, no icon fonts, no emoji standing in for glyphs |

### Demo mode (so it always runs)

The app is designed to boot with **zero configuration**:

- No `DATABASE_URL` → the API uses an in-memory store seeded with realistic content (12 members plus a demo
  account, 14 posts, 5 projects, 20 replies). Data resets on restart.
- No `GITHUB_CLIENT_ID` → a clearly labelled **demo sign-in** is offered instead of the OAuth button.
- Set both, and the same build runs against Neon Postgres with real GitHub sign-in.

Nothing is faked silently: the health endpoint, the login screen and the header badge all tell you
which store and which auth mode are active.

---

## Quick start

```bash
git clone <this repo> && cd lets-contribute
npm install
cp .env.example .env        # optional: fill in DATABASE_URL / GitHub OAuth
npm run dev
```

- Web: <http://localhost:3000>
- API: <http://localhost:3001/api> (health check at `/api/health`)

`npm run dev` runs both apps. `apps/web` proxies `/api/*` to the API server-side, so the browser only
ever talks to one origin and the session cookie stays first-party.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | API (`nest start --watch`) + web (`next dev`) together |
| `npm run build` | Build API then web |
| `npm run typecheck` | Type-check both workspaces |
| `npm run db:setup` | Apply `schema.sql` to Neon and seed demo content |
| `npm run dev:api` / `npm run dev:web` | Run one side only |

---

## Configuration

One `.env` at the repo root feeds both apps (Vercel project settings always take precedence).

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | no | Neon **pooled** connection string. Without it the API runs in-memory |
| `SESSION_SECRET` | recommended | HS256 key for session + OAuth state JWTs (`openssl rand -base64 32`) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | no | Enables GitHub OAuth |
| `GITHUB_CALLBACK_URL` | no | Defaults to `${WEB_ORIGIN}/api/auth/github/callback` |
| `GITHUB_TOKEN` | no | Raises GitHub API limits for repo import (60 → 5000 req/h) |
| `WEB_ORIGIN` | yes in prod | Public web origin (redirects, CORS, metadata base) |
| `API_URL` | yes in prod | Where Next proxies `/api/*` — the deployed API URL |
| `DEMO_AUTH` | no | `auto` (default) \| `on` \| `off` |
| `PORT` | no | Local API port (default `3001`) |

### Neon

1. Create a project at [neon.tech](https://neon.tech) and copy the **pooled** connection string
   (the host contains `-pooler`).
2. Put it in `.env` as `DATABASE_URL`.
3. `npm run db:setup` — applies the DDL in `apps/api/src/db/schema.sql` and seeds demo content.
4. Restart the API. `/api/health` now reports `"store": "postgres"`.

The schema mirrors the Drizzle definitions in `apps/api/src/db/schema.ts`; keep the two files in
sync when you add columns.

### GitHub OAuth app

Create one at **GitHub → Settings → Developer settings → OAuth Apps → New**:

- **Homepage URL**: `http://localhost:3000` (or your Vercel URL)
- **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`

Scope requested: `read:user user:email` — public profile only. No repository access, no write
permissions. Sessions are HS256 JWTs in an http-only, `SameSite=Lax` cookie (30 days, `Secure` in
production). The OAuth `state` is itself a short-lived signed JWT, and the post-login redirect only
accepts same-site paths (no open redirects).

---

## Deploying to Vercel

The monorepo deploys as **two Vercel projects** that share one repository. This is the standard
shape for NestJS + Next.js: the Next project owns the public origin and proxies `/api/*` to the Nest
project, which runs as one serverless function.

### 1. API project (`apps/api`)

| Setting | Value |
| --- | --- |
| Root Directory | `apps/api` |
| Framework Preset | Other |
| Build Command | `npm run build` (default from `apps/api/vercel.json`) |
| Environment | `DATABASE_URL`, `SESSION_SECRET`, `WEB_ORIGIN` (the web deployment URL), `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, optional `GITHUB_TOKEN` |

`apps/api/vercel.json` rewrites every path to `api/index.js`, which lazily requires the **compiled**
Nest app from `dist/` (compiled by `nest build` during the Vercel build, so TypeScript decorator
metadata is intact) and reuses one Express instance across invocations.

### 2. Web project (`apps/web`)

| Setting | Value |
| --- | --- |
| Root Directory | `apps/web` |
| Framework Preset | Next.js |
| Environment | `API_URL` = the API project URL (e.g. `https://lets-contribute-api.vercel.app`), `WEB_ORIGIN` = this project's URL |

Set `API_URL` for **Production and Preview** — `next.config.ts` reads it when building the rewrite
table. Then update the GitHub OAuth callback URL to `https://<web>.vercel.app/api/auth/github/callback`
(or keep `GITHUB_CALLBACK_URL` as the single source of truth).

Because the browser only calls the web origin, cookies remain first-party and CORS never comes into
play in the browser.

### Local production check

```bash
npm run build
npm run start:api        # API on :3001
npm run start:web        # Next on :3000 (needs API_URL, default 127.0.0.1:3001)
```

---

## Architecture

```
browser ──▶ Next.js (App Router, RSC)  ──rewrite /api/*──▶  NestJS (Express)  ──▶ Neon Postgres
              │                                              │
              └── same-origin fetch, first-party cookie ◀────┘ signed session JWT
```

```
lets-contribute/
├── apps/
│   ├── api/                       NestJS service
│   │   ├── api/index.js           Vercel serverless entry (requires compiled dist/)
│   │   ├── src/
│   │   │   ├── auth/              GitHub OAuth, session JWTs, guards, @CurrentUser()
│   │   │   ├── posts/             posts, votes, comments (DTOs + service + controller)
│   │   │   ├── projects/          project CRUD
│   │   │   ├── users/  meta/      profiles, stats, tags, GitHub repo preview
│   │   │   ├── db/                Drizzle schema, PgStore (Neon), MemoryStore, setup script
│   │   │   └── domain/            Store interface, seed data, ids
│   │   └── vercel.json
│   └── web/                       Next.js app
│       ├── app/                   routes: /, /feed, /p/[id], /projects, /projects/[slug],
│       │                          /new, /login, /u/[login], not-found, icon
│       ├── components/            header/footer, post card, composer, comments, filters…
│       │   └── ui/                Glass primitives + the icon registry
│       └── lib/                   server API client, browser client, formatting, cn
└── packages/shared/               the wire contract imported by both apps
```

**Layering.** Controllers validate (class-validator DTOs) → services own the rules → the `Store<`
interface owns persistence. `MemoryStore` and `PgStore` implement the same contract, which is why
demo mode is not a mock: it is the real app on a different backend.

**Reads vs writes in Postgres.** Aggregates (vote counts, reply counts, "have you voted") are single
SQL statements with correlated subqueries — one round trip per feed page. Writes use Drizzle's typed
insert/update/delete.

### API surface

| Method | Route | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | store + auth mode |
| `GET` | `/api/auth/config` | `{ github, demo, store }` |
| `GET` | `/api/auth/github` → `/api/auth/github/callback` | OAuth flow |
| `POST` | `/api/auth/demo` | demo session (when enabled) |
| `GET`/`PATCH` | `/api/auth/me` | session, profile update |
| `POST` | `/api/auth/logout` | clears the cookie |
| `GET` | `/api/posts` | `?type=&tag=&q=&author=&project=&sort=&page=&pageSize=` |
| `POST` | `/api/posts` | auth required |
| `GET`/`DELETE` | `/api/posts/:id` | delete = author only |
| `POST` | `/api/posts/:id/vote` | toggles, returns `{ votes, voted }` |
| `GET`/`POST` | `/api/posts/:id/comments` | |
| `DELETE` | `/api/comments/:id` | author only |
| `GET`/`POST` | `/api/projects` | `GET /api/projects/:slug` for one |
| `GET` | `/api/users/:login` | profile + contribution counts |
| `GET` | `/api/meta/stats` · `/tags` · `/contributors` | sidebar data |
| `GET` | `/api/meta/repo-preview?input=` | live GitHub metadata |

---

## Design system

Glassmorphism with restraint, and **no hardcoded icons**:

- **One registry.** `apps/web/components/ui/icon.tsx` maps semantic names (`sparkles`,
  `gitPullRequest`, `sprout`, …) to [Lucide](https://lucide.dev) components. Tags get a *stable*
  icon from a hash — the same tag always renders the same glyph. Post types and difficulties map
  through the same table, so changing an icon is a one-line data edit, never a markup edit.
- **Zero inline SVG.** Grep for `<svg` anywhere in `apps/web` and you will only find Lucide's
  internals. The favicon is generated at build time from layout primitives (`app/icon.tsx`).
- **Surfaces.** `.glass`, `.glass-soft`, `.glass-strong` and `.glass-hover` live in `globals.css`:
  a 160° white gradient, 22px backdrop blur with saturation, a 1px inset highlight and a deep
  ambient shadow. Interactive cards lift 2px on hover.
- **Aurora.** Four radial gradients and a masked 76px grid, fixed behind everything.
- **Graceful degradation.** `@media (prefers-reduced-transparency: reduce)` swaps blur for a solid
  surface at the same contrast; `prefers-reduced-motion` disables the entrance animations.
- **Type & colour.** System font stack (no network fonts, so builds work offline), mint → sky →
  violet gradient for primary actions, deep `#05060f` ink, and text that never drops below 4.5:1
  against the glass.

## Contributing to this repo

Issues and PRs are welcome. Run `npm run typecheck` and `npm run build` before opening one. Keep the
`Store` contract in mind: new persistence features need both `MemoryStore` and `PgStore`
implementations, plus DDL in `schema.sql`.

## Troubleshooting

- **"The API isn't answering" banner** — the web app cannot reach `API_URL`. Run `npm run dev:api`
  or check the env var.
- **Empty feed with Neon** — run `npm run db:setup`; the API seeds only when the database is empty.
- **`UNABLE_TO_VERIFY_LEAF_SIGNATURE` on GitHub calls** — you are behind a TLS-intercepting proxy;
  set `NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.crt` for the API process.
- **OAuth 404 on callback** — the callback URL in GitHub must match `GITHUB_CALLBACK_URL`
  (or `${WEB_ORIGIN}/api/auth/github/callback`) exactly.

## License

MIT.
