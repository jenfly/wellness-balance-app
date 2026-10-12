# Future options: automatic backup and sync

Status: parked. Nothing here is being built. This records a design discussion so it can be picked up later without re-deriving it. Free-tier figures below came from a web search at the time of writing (October 2026) and may have changed, so re-check them before deciding.

## Context

Well Tended keeps all of its data in the browser's `localStorage` (one JSON blob under the key `well-tended-v1`). Backup is manual: Settings > "Backup and restore" writes a single file (`well-tended-backup.json`) to Google Drive using the Google Identity Services token flow with the `drive.file` scope, and restore reads it back. There is no continuous sync, by design. If it has been 30 or more days since the last backup, a banner nudges you to run one.

The same pattern (static site on GitHub Pages, `localStorage`, manual Drive backup) is used by two sibling apps in separate repos: the journal app and the Meal Planner. Whatever is decided here would ideally be done once and applied to all three, so this note applies to them too.

## The problem

Two related annoyances, both small but recurring:

1. **Re-login friction.** The Google access token from the browser-only token flow is short-lived. With no backend to refresh it silently, the user is periodically sent back through the Google sign-in when they tap backup.
2. **Backup is manual.** Backups only happen if the user remembers to tap the button. As the data grows (a year of completions, years of check-ins) the cost of forgetting goes up. This turned out to be the more important of the two: fixing the login prompt alone does not fix it.

Related: `localStorage` is per browser and per device, so the phone and a computer never share data. That is not the complaint here, but real sync would also solve it.

## Why the app is built this way

A static site with no backend, no build step and no login on open was chosen for consistency with the author's other apps. The pieces come as a bundle: no server to run or secure, no hosting cost beyond GitHub Pages, works fully offline, and nothing to maintain. The price is exactly the problem above: anything that must outlive one browser needs either a server or a login flow. It is a trade-off, not a mistake, and it can be revisited.

## Options considered

### 1. Cloudflare Worker as a token-refresh proxy: rejected

A small serverless function holds a Google refresh token server-side and mints fresh short-lived access tokens on request, so the apps stop prompting for re-login.

- Effort: small (one script, roughly an afternoon), low maintenance afterwards.
- Cost: the free tier (about 100,000 requests/day) is far more than three personal apps need.
- Why it was rejected: data would still live in `localStorage` and backup would still be a button the user has to remember to tap. It removes the login prompt but not the forgetting.
- A lighter variant worth remembering: a worker running on a schedule that pushes a backup itself, with no button click. That solves "forgot to back up" without moving to a hosted database. It does, however, require the app's data to reach the worker somehow (it cannot read the browser's `localStorage`), which pushes towards some form of server-side copy anyway, so it is less of a shortcut than it first sounds.

### 2. Supabase (or similar backend-as-a-service, e.g. Firebase): the only option that solves the real problem

A hosted Postgres database with built-in authentication becomes the source of truth. Phone and computer both read and write the same central copy, which gives genuine automatic sync and removes the manual backup step.

- Free tier (at time of writing): about 500 MB of database storage and 2 active projects. Far more than the data across all three apps needs (a year of completions plus check-ins is on the order of a few hundred kilobytes to a few megabytes of JSON).
- Caveat: free projects auto-pause after about a week of inactivity, so the first request after a dormant period may be slow or fail while the database wakes. The app would need to handle that gracefully rather than look broken. A tiny scheduled ping is a common workaround.
- Offline: Supabase on its own is not offline-capable. Losing connectivity would break writes or queue them awkwardly. Today the app works with no internet at all, and that is worth keeping, so the realistic design is: keep `localStorage` or IndexedDB as the fast local copy the app always reads and writes, and add a background sync layer that pushes changes to Supabase and pulls changes from other devices. That sync layer (conflict handling, "last write wins" or merging, retry when back online) is most of the real work.
- What would be involved, per app: a Supabase project and table design, sign-in so data is per user, rewriting the save and load paths, and building the offline cache and sync layer. Roughly a multi-day project per app, much of it reusable across the three if designed once.
- A single-document design (store the whole app state as one JSON row per user, as the app already does in `localStorage`) would be much simpler than normalizing items, categories and log entries into separate tables, at the cost of coarse conflict handling (whole-document last write wins).

### Smaller alternatives mentioned in passing

- **Keep Drive, make the manual path painless.** Tighten the existing 30-day nudge (a shorter threshold, or a more prominent reminder). No new infrastructure.
- **File System Access API.** Let the app write the backup file into a local folder that a desktop sync client (Google Drive, OneDrive) already syncs, so the OS handles the cloud part and there is no OAuth. Limitation: Chromium desktop browsers only, so it does not help on a phone, which is where most of the data lives.

## Conclusion so far

Supabase-style sync is the only listed option that addresses what is actually bothering the author, but it is a substantial rewrite rather than a quick fix, so it is set aside as a possible future initiative while work on the Ta-da and check-in views continues. The worker-based refresh proxy was judged not worth doing on its own.

## If this is revisited

- Decide whether to solve it for one app first or design the sync layer once for all three (the author's stated preference is a single solution for all three).
- Decide the data model: one JSON document per user (simple, matches today) versus real tables (queries and finer-grained merging, much more work).
- Decide the conflict rule when two devices edit while apart.
- Check how the free tier's pause behavior feels in practice for apps that may sit unopened for days.
- Keep the offline-first behavior: local read/write first, sync in the background.
- Plan a one-time migration of existing `localStorage` data, and keep the current Drive backup as a safety net during the transition.
- Re-verify current free-tier limits and pricing before committing.
