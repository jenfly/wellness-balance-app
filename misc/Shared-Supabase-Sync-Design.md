# Shared Supabase Sync Design — Wellness, Meal Planner, Journal

Oct 11, 2026

## Context and problem

All three apps — wellness-balance-app, meal-planner and journal-app — are static PWAs on GitHub Pages, sharing the `jenfly.github.io` origin. Wellness and meal-planner store state in `localStorage`; journal-app stores entries only in a single Google Drive JSON file, with no local copy. All three back up via per-app Google OAuth, which is manual (wellness, meal-planner) or the only storage path (journal-app).

Two recurring annoyances drive this: re-login friction from short-lived browser-only OAuth tokens, and backups only happening if remembered — more important, since data loss risk grows as data accumulates. `localStorage` is also per-device, so phone and computer never share data.

Moving all three to a shared Supabase backend solves this once: real cross-device sync, one login shared across apps (same origin), and no more manual backup step. Full prior discussion: `misc/future-sync-backup-options.md` in the wellness-balance-app repo.

## Supabase project and app\_data table

One shared Supabase project across all three apps — the free tier caps at 2 active projects, and there are 3 apps, so one project with per-app separation is the only free-tier-compatible option.

A single table, `app_data`:

| Column | Type | Purpose |
| --- | --- | --- |
| `user_id` | uuid | Supabase auth user id (foreign key to `auth.users`) |
| `app` | text | App tag: `wellness`, `meal-planner`, or `journal` |
| `doc` | jsonb | Whole app state as one JSON document |
| `updated_at` | timestamptz | Last write time, used for conflict resolution |

Primary key is `(user_id, app)` — one row per user per app. Row-level security restricts each row to its own `user_id`, matched against the authenticated session, so users can only read and write their own data.

Each app stores exactly what it already keeps locally (or in Drive, for journal-app) as one JSON blob in `doc` — matching the single-document design the original writeup favored over normalizing into separate tables. No schema changes needed as app state evolves; new fields just live inside the `jsonb` blob.

## Auth: Google sign-in via Supabase

Supabase Auth with Google as the provider, replacing each app's separate Google Identity Services OAuth flow. Since all three apps share the `jenfly.github.io` origin and one Supabase project, signing in once in any app signs the user into all three — a bonus over today's per-app sign-in.

## Offline-first sync layer

The local copy stays authoritative. Each app keeps reading and writing `localStorage` exactly as today — the app works offline and feels instant, unchanged. A thin layer on top:

- After every local save, push the updated `doc` blob to Supabase in the background.
- On load, pull the remote row and reconcile against the local copy.

journal-app is the exception: it has no local copy today (Drive is the only store), so this app also needs a local cache built, not just a sync layer added on top.

## Conflict handling

Last-write-wins on the whole document, using `updated_at` to decide which copy is newer. Coarse — editing one item on the phone could overwrite a different edit made minutes earlier on the laptop if the sync hasn't caught up — but far simpler than per-field merging. For personal single-user apps like these, real conflicts (two devices edited while both offline, in the same window) should be rare.

## Free-tier auto-pause and keep-alive

Free Supabase projects pause after about a week of inactivity; the first request after that wakes the database but can be slow or fail. Mitigation: a scheduled keep-alive ping — a GitHub Actions workflow running daily that issues a trivial query against the database. Cheap, free, and should be set up at project creation rather than as an afterthought.

## Migration path

On first sign-in after the update ships, each app checks whether a remote row already exists for that user and app. If not, it seeds Supabase with the current local copy (or, for journal-app, the current Drive file) as the starting document. After that, the normal sync-every-save flow takes over.

Keep the existing Google Drive backup in place as a safety net during the transition, in case the new sync layer has problems early on.

## Per-app notes

- **wellness-balance-app**: closest fit to the design as-is. State is already one JSON blob (`well-tended-v1`) in `localStorage`, matching the `doc` jsonb column directly.
- **meal-planner** state is spread across roughly eight separate `mealRotation.*` localStorage keys (`meals`, `week`, `shopExtras`, `shopChecked`, `shopOrder`, `shopNotes`, `batchOrder`, `batchChecked`) inside one `index.html`. Decision: combine all of these into a single `doc` blob, same single-document design as wellness-balance-app. The existing Drive backup excludes `week` and merges on restore only because manual, occasional backups made syncing the current week pointless (it would always be stale by the next backup) — with continuous sync that reasoning no longer applies, so the full state, including `week`, gets saved.
- **journal-app**: no local copy today — entries live only in a single Drive JSON file, read/written whole-file, requiring network. This app needs a local cache added first, before a sync layer can be layered on top, unlike the other two which already have one. Decision: use localStorage, matching wellness-balance-app and meal-planner, rather than IndexedDB — total data across all three apps is estimated at a few hundred kilobytes up to a few megabytes (per the original writeup), comfortably under localStorage's \~5 MB cap, so IndexedDB's extra capacity and complexity aren't needed.

## Open decisions and next steps

- Decided: pilot with wellness-balance-app first (cleanest fit — already one JSON blob).
- Supabase project does not exist yet — needs to be created.
- Confirmed: current free-tier limits and pricing match the figures above (checked October 2026).
- `Build the migration/combine logic for meal-planner's eight localStorage keys into one doc blob (decided: full state including week, same shape as wellness-balance-app`).
- Build the localStorage cache layer for journal-app (decided: localStorage, matching the other two apps) before building its sync layer.
- Set up the GitHub Actions keep-alive ping at project creation.
