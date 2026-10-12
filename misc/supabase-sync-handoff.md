# Supabase sync: handoff to Claude Code

Status: in progress (Oct 11, 2026). Pilot app is Well Tended (this repo). Once it works, the same layer gets ported to `meal-planner` and `journal-app`. Read `misc/future-sync-backup-options.md` first for the original reasoning; this file records what was decided and built since.

## Goal
Replace manual Google Drive backup with automatic cross-device sync through ONE shared Supabase project used by all three apps (free tier allows only 2 projects, and there are 3 apps). Keep `localStorage` as the always-used local copy so the apps stay offline-first and instant; a background layer pushes and pulls.

## Decisions already made (do not reopen without asking)
- One shared Supabase project, one table `app_data`, one JSON document per user per app (`doc jsonb`), `app` in (`wellness`, `meal-planner`, `journal`).
- Conflict rule: whole-document last write wins, guarded by compare-and-swap on the server `updated_at`. First link of a device to an account that already has a different cloud copy: ask the user which to keep. The replaced copy is saved once in `localStorage` at `<KEY>:pre-sync-copy`.
- Sign-in: Supabase Auth with Google, PKCE flow, session stored under the shared key `jenfly-supabase-auth` (all three apps share the `https://jenfly.github.io` origin, so one sign-in covers all of them).
- No dependencies and no build step (this repo's rule): `js/sync.js` uses `fetch` against Supabase Auth and PostgREST directly. Do not add supabase-js or a CDN script without asking.
- meal-planner: switch to a single state blob like this app, including the current `week` plan (the old Drive backup skipped `week` only because backups were manual). journal-app: currently has NO local copy (entries live only in one Drive file `journal-entries.json`), so it first needs a `localStorage` cache, then the same sync layer. `localStorage` (not IndexedDB) for all three.
- Keep the existing Drive backup as a safety net during the transition.
- Pilot first: this app. Free-tier limits were just re-verified by the user.

## Security: Google sign-in must stay restricted to the owner

The Google OAuth client used by Supabase Auth (see below) **must stay in Google
Cloud Console's "Testing" publishing status** (APIs & Services > OAuth consent
screen), with only the owner's own Google account added under **Test users**.

Why this matters: the GitHub Pages site is public. Supabase row-level security
keeps everyone's `app_data` rows isolated from each other, so a stranger
signing in wouldn't see anyone else's data — but without this restriction,
any random visitor could still sign in with their own Google account and get
a legitimate row in `app_data`, i.e. use this free Supabase project as their
own free backend. "Testing" status caps sign-in to the explicit test-user
list regardless of row-level security.

**Do not move this OAuth consent screen to "In production" / verified status**
— that lifts the test-user cap and opens sign-in to anyone. If broader access
is ever genuinely wanted, that's a deliberate decision to revisit with the
user first, not a default to drift into (e.g. while doing unrelated OAuth
consent screen cleanup).

If setup instructions for this sync layer are ever added to the README, this
restriction must be included as a required step, not an optional hardening
note.

## Supabase project (already created and configured by the user)
- URL: `https://rrremrggallytwfyfjpa.supabase.co`
- Publishable key (public by design, already in `js/sync.js`): `sb_publishable_TYvABVg0SSAn4YarBCFSQw_sPXF6jEo`
- Never put the secret / service_role key or the Google client secret in any repo.
- Google provider enabled in Supabase using a NEW dedicated Google OAuth "Web application" client (separate from each app's existing Drive-backup client). Redirect URI is `https://rrremrggallytwfyfjpa.supabase.co/auth/v1/callback`.
- Supabase Auth URL config: Site URL `https://jenfly.github.io`; redirect URLs `https://jenfly.github.io/**` and `http://localhost:8000/**`.
- The SQL below has been run in the Supabase SQL editor:

```sql
create table public.app_data (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  app text not null check (app in ('wellness', 'meal-planner', 'journal')),
  doc jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, app)
);
alter table public.app_data enable row level security;
-- four policies (select/insert/update/delete), each: to authenticated, (select auth.uid()) = user_id
-- trigger app_data_updated_at: before update, sets new.updated_at = now() (server time, not device clocks)
```

## What is done in this branch (`supabase-sync`)
- `js/logic.js`: pure `syncPlan(meta, remote, same)` (returns push-new / adopt / choose / noop / push / pull / overwrite) and `canonJSON` (key-order-independent compare, because jsonb reorders keys). Exported for Node tests.
- `js/sync.js` (new, NOT yet loaded anywhere and NOT yet tested): `window.Sync` with `init`, `noteLocalChange`, `signIn`, `signOut`, `syncNow`, `resolveChoice`, `status`. Handles PKCE sign-in redirect (captures `?code=` synchronously at script load and strips it from the URL before `ui.js` runs, because `ui.js` rewrites the URL for the Meal Planner `?log=` link), token refresh, debounced push (2.5 s after a save), pull on startup / tab visible / back online, retry after 60 s, compare-and-swap push, edits made mid-request stay marked dirty.

## What is left for this app
1. `index.html`: add `<script src="js/sync.js"></script>` between `logic.js` and `ui.js`.
2. `sw.js`: add `js/sync.js` to `SHELL` and bump `VERSION` (currently v49). Cross-origin supabase.co requests already bypass the SW (it only handles same-origin and Google Fonts), which is what we want.
3. `js/ui.js` wiring:
   - `save()` should also call `Sync.noteLocalChange()` (guard for `window.Sync`).
   - After `state` is defined, call `Sync.init({ key: KEY, getState: () => state, applyState, busy, onChange, onError, onPulled })`.
   - `applyState(doc)`: `state = normalize(copy of doc)`; fix `ui.openCat` / `ui.tag` if they no longer exist; `save()`; `renderAll()`; plain toast "Updated from another device" with NO undo (the existing `takeSnapshot`/undo only covers some fields; the pre-sync copy is the recovery path).
   - `busy()`: true while `ui.formFor`, `ui.dateFor`, `ui.ciEdit`, any sheet other than settings is open, or a contenteditable (the notes scratchpad) has focus, so a pull never clobbers in-progress input.
   - `onChange(status)`: re-render the settings sheet if open; when `status.phase === 'choose'` and no sheet is open, open the settings sheet (and call `syncNavHistory()`).
   - Settings sheet: new "Sync across devices" section above "Backup and restore". Signed out: short hint plus "Sign in with Google". Signed in: email, status text (syncing / synced N min ago / offline, will sync when back online / error), buttons "Sync now" and "Sign out". Choose state: show cloud vs this-device counts (`status.choice`) with "Use cloud copy" / "Keep this device's copy" and a line saying the other one is replaced. Use data-action handlers like the rest of the file (`sync-signin`, `sync-signout`, `sync-now`, `sync-use-cloud`, `sync-use-device`). `resolveChoice` takes `'cloud'` or `'device'`.
   - Sign-out signs the user out of all three apps (shared session); say so in the hint.
4. Tests: add `syncPlan` / `canonJSON` cases to `tests/test.js`. Add a jsdom test that loads `logic.js` + `sync.js` with a fake in-memory Supabase (mock `window.fetch` for `/auth/v1/token` and `/rest/v1/app_data` incl. PATCH with the `updated_at=eq.` filter returning `[]` on mismatch, 409 on duplicate POST) covering: first push, push after edit, pull from another device, conflict where local is newer vs older, first-link choose (both options), 401 then refresh, offline then recover, edit during an in-flight push, different user signing in.
5. Docs: README ("Cloud sync" section), CLAUDE.md (architecture + state notes: new file, shared session key, `:sync-meta` and `:pre-sync-copy` keys, no-supabase-js rule).
6. Visual check: this repo's CLAUDE.md requires screenshots of any UI change (settings sheet in signed-out, signed-in, syncing/offline, and choose states).
7. Real-device test (sync.js has only been desk-checked; it was never run against the real Supabase): sign in on the phone, confirm a row appears in Table Editor > `app_data`, edit on a second browser, confirm it arrives. Watch for: PKCE `code_challenge_method=s256` being accepted, `redirect_to` matching the allow-list, the token response shape, PostgREST accepting the `updated_at=eq.<timestamptz>` filter with microseconds and `+00:00` (URL-encoded).

## After the pilot
- Daily keep-alive: **done** — `.github/workflows/supabase-keepalive.yml` runs a daily `GET /rest/v1/app_data?select=app&limit=1` against Supabase with the publishable key (plus `workflow_dispatch` for a manual run), so the free project never auto-pauses after a week idle.
- Port to `meal-planner` (single blob first: its state is ~8 `mealRotation.*` localStorage keys in one 94 KB `index.html`) and `journal-app` (add a localStorage cache of the entries array first; Drive remains the existing source until migrated). One-time "claim my data" flow = the `push-new` / `choose` paths already in `syncPlan`.
- Meal Planner and Well Tended already talk via `?log=<meal name>`; keep that working.

## Repo conventions that apply
Vanilla JS, classic script tags, no modules/bundler/npm deps. Bump `sw.js` `VERSION` and add new files to `SHELL` on any app-file change. New colors need tokens in all three theme places. Tests: `cd tests && ./bundle.sh && node test.js && node smoke2.js ...` with jsdom on `NODE_PATH`.

## Other
The design doc made in Claude (Docs) is at https://claude.ai/code/artifact/9325d610-7bfa-4bc7-bd13-5bb6d9d208b7 (may not be readable from Claude Code; everything needed is in this file).
