# Well Tended

A tile-based app that keeps every life area in view. Vanilla JS PWA, no build step. Data lives in the browser (localStorage).

## Files
- `index.html`: markup and script tags
- `css/styles.css`: all styling and theme tokens
- `js/logic.js`: pure logic (sorting, dates, check-in math, the sync conflict decision); testable in Node
- `js/sync.js`: optional cloud sync against Supabase — see "Cloud sync" below
- `js/ui.js`: rendering, events, drag and drop
- `sw.js`: offline cache. **Bump `VERSION` whenever any app file changes.**
- `manifest.webmanifest`, `icons/`: install metadata and the sprout icon
- `tests/`: Node + jsdom test suite — see `CLAUDE.md` for how to run it

## Run locally
`python3 -m http.server 8000`, then open http://localhost:8000 (service workers need http://localhost or https).

## Deploy (GitHub Pages)
Push to a repo, then Settings > Pages > Deploy from branch `main`, folder `/ (root)`. All paths are relative, so any repo name works.

## Install on Android
Open the site in Chrome, menu > Install app (or Add to Home screen).

## Setting up Google Drive backup

Settings > "Backup and restore" saves your whole app state to a single file in your Google Drive, and can restore it later. It needs a one-time setup before it will work:

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a project (or use an existing one).
3. Enable the **Google Drive API** for that project (APIs & Services > Library > search "Google Drive API" > Enable).
4. Go to APIs & Services > Credentials > **Create Credentials > OAuth client ID**.
   - Application type: **Web application**
   - Under **Authorized JavaScript origins**, add the exact origin your app is deployed at — scheme and host only, no path, no trailing slash (e.g. `https://jenfly.github.io`, not `https://jenfly.github.io/wellness-balance-app/`). Add `http://localhost:8000` too if you want to test backup locally.
5. Copy the generated **Client ID** (looks like `123456789-abc123.apps.googleusercontent.com`).
6. Open `js/ui.js`, find this line in the "Google Drive backup" section:
   ```js
   var GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   ```
   and replace it with your own client ID.
7. Bump `VERSION` in `sw.js` and redeploy.

Notes:
- The app requests the `drive.file` scope, which only ever grants access to the single backup file it creates (`well-tended-backup.json`) — never the rest of your Drive.
- If you skip this setup, tapping "Back up to Drive" or "Restore" just explains it isn't configured yet, rather than failing silently.
- Restoring replaces the entire app state on this device (after showing what's in the backup and asking you to confirm) — it doesn't merge. Right after restoring, an "Undo" option briefly appears if you want the previous state back.

## Cloud sync

Settings > "Sync across devices" keeps your data in sync automatically across every device you sign in on, through a shared Supabase project. Until you sign in, nothing changes — the app works exactly as it always has, local-only. Once signed in:

- Edits push to the cloud a couple of seconds after you make them, and pull in automatically on load, when the tab becomes visible again, and when you come back online.
- `localStorage` stays the copy the app actually reads and writes, so it's still instant and fully offline-capable — sync just runs in the background on top.
- If two devices both change things while apart, the newer edit wins (by server time); the copy it replaces is saved once on the device that loses, so it's recoverable if you needed it.
- The very first time a device signs in and its local data doesn't match what's already in the cloud, it asks which one to keep rather than guessing.
- Signing in or out is shared with Meal Planner and the journal app (same browser, same origin) — one sign-in covers all three.

This is pre-configured against a Supabase project that already exists for these three apps; there's no per-deployment setup like the Drive backup below. If you fork this repo and want your own sync backend, you'd need your own Supabase project (a Postgres table, Google sign-in via Supabase Auth, row-level security) and to change the `SUPABASE_URL`/`SUPABASE_KEY`/`APP` constants near the top of `js/sync.js` — see `misc/supabase-sync-handoff.md` for the schema and setup this project used.

Keeping the Google Drive backup below configured too is fine and recommended while this is still new — they don't conflict.

## Meal Planner link
Meal Planner (a separate app on the same site) can hand a finished batch-cook item to Well Tended. Checking it off there opens this app at `?log=<meal name>`, which shows a "Log a batch" prompt for "Make <meal>". **Log it** adds it as a finished to-do (so it appears in Ta-da); **Cancel** adds nothing, for when it's the same batch showing up again.

Choose where these land under Settings > "Meal Planner link". It's stored by category ID, so renaming the category is safe; if the category is deleted the prompt falls back to Inbox and says so. The page re-reads saved data whenever it regains focus, so a copy opened from Meal Planner can't be overwritten by an older background copy.

## Not built yet
Device verification (install, offline mode, service-worker updates, touch drag-and-drop, safe-area insets) has been confirmed working on a real phone. (Real weekly push notifications were considered and dropped: no server means no reliable way to send them. The Check-in tab's in-app dot is the permanent reminder.)

Cloud sync (above) is built and covered by the jsdom test suite against a fake Supabase, but hasn't yet been run against the real Supabase project from an actual device — that device/real-backend verification is still outstanding.
