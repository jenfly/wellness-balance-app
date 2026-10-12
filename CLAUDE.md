# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Well Tended" — a tile-based PWA that keeps every area of life visible so none gets neglected while another gets all the attention. Vanilla JS, no build step, no dependencies, no package.json. Data lives entirely in the browser (`localStorage`), phone-first (Android-first, with iOS notes below). Hosted on GitHub Pages; all paths are relative so any repo name works.

## Commands

**Run locally** (service workers require localhost or https):
```
python3 -m http.server 8000
```
then open `http://localhost:8000`. If the service worker is active, hard-reload or bump `VERSION` in `sw.js` to see changes.

**Tests** (Node + jsdom, in `tests/`):
```
cd tests
export NODE_PATH=<path to node_modules containing jsdom>   # npm i jsdom
./bundle.sh            # rebuild tests/balance-tiles.html (required after editing index.html/css/js)
node test.js             # pure logic tests (js/logic.js), including syncPlan/canonJSON
node smoke2.js           # ...through smoke11.js — jsdom UI smoke tests
node smoke12.js          # sync.js against a fake in-memory Supabase (no real network/auth)
node empty.js            # needs a static server on the port hardcoded in the file:
                          #   (cd .. && python3 -m http.server 8125)
                          # checks a fresh install starts with 3 starter tiles + Inbox
```
- `bundle.sh` concatenates `css/styles.css`, the `index.html` body, `js/logic.js`, `js/sync.js`, `tests/sample-data.js`, and `js/ui.js` into one file, swapping `emptyState()` for `seed()` so the UI tests have data to work with.
- `tests/sample-data.js` is invented, safe-to-commit test data. Keep real personal data out of the repo.
- Changing UI strings/structure/markup will likely break smoke test selectors — expect to update them alongside the change.
- jsdom's "Not implemented: window.scrollTo" console message is harmless noise.

There is no lint/build command; there are no bundler, transpiler, or type-checker configs.

**Any UI change (markup, styles, layout) must be verified visually and shown to the user as screenshots before the task is considered done** — not just described in text. Render the real page (e.g. headless Chrome against `python3 -m http.server`) and capture the affected view(s).

## Architecture

Script files loaded as classic `<script>` tags (no ES modules) in this order: `js/logic.js`, then `js/sync.js`, then `js/ui.js`.

- **`js/logic.js`** — pure functions only (dates, sorting, check-in math, state defaults/migrations, the cloud-sync decision table). No DOM access. Exported via `module.exports` when `typeof module !== 'undefined'`, which is how `tests/test.js` consumes it directly in Node.
- **`js/sync.js`** — optional cloud sync against a shared Supabase project (`window.Sync`). No DOM access beyond `localStorage`/`document.activeElement` via its `cfg.busy()` caller; see "Cloud sync (Supabase)" below for the full design. Self-contained: if `js/ui.js` never called `Sync.init()`, the file would just sit there inert.
- **`js/ui.js`** — a single IIFE. Renders by building HTML strings (no templating library, no virtual DOM) and re-rendering wholesale into `#main`/`#overlay-root`/`#sheet-root`. All interactivity goes through one delegated `click`/`change`/`submit` handler keyed off `data-action` attributes on elements — there are no per-element listeners. Drag-and-drop (mouse and touch) is hand-rolled via `pointerdown`/`pointermove`/`pointerup` (long-press 500ms to start on touch; grips start immediately). The phone/gesture back button is wired to `history.pushState`/`popstate` (`navLayers()`/`closeNavLayersTo()`/`syncNavHistory()`): being away from the Home tab, having a tile overlay open, an inline item-edit form open, or a sheet (settings/add-item, including the sync "choose" prompt, which reuses the settings sheet) open each count as one "layer," so back unwinds one layer at a time instead of exiting the app. New modal-like UI should be added to `navLayers()`/`closeNavLayersTo()` to stay back-button-aware.
- **`css/styles.css`** — all styling, including theme tokens. Light tokens live on `:root`; dark tokens are defined twice — once under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]` — so both the OS-default and the explicit in-app theme toggle work. **Any new color must be added as a token in all three places.** Low-saturation per-category swatches (teal, apricot, sky, clay, sand, slate, lilac, rose, moss, plum, sage) keep categories visually distinct but calm.
- **`sw.js`** — offline-cache service worker. Same-origin requests: cache-first, refreshed in the background. Google Fonts (Figtree body / Newsreader display) requests: cached after first load. Cross-origin Supabase (`*.supabase.co`) requests bypass the cache entirely, same as Google Drive/Identity Services. **`VERSION` must be bumped whenever any cached app file changes**, and any new file must be added to the `SHELL` array, or installed phones keep serving stale copies.
- **`index.html`** — markup shell plus the three `<script>` tags; registers the service worker on load.

### State

Single JSON blob in `localStorage` under key `well-tended-v1`, written by `save()` / read by `load()` in `js/ui.js`.

```
{
  cats:   [{ id, name, color, icon|null }],         // ordered; Inbox is virtual (see below)
  items:  [{ id, catId, type, text, desc, due, freq, pinned, later, done, doneAt, manual, tags[], order }],
  tags:   [string],                                   // free-form, created as you go
  log:    [{ id, itemId, text, catId, at, rec }],     // completion history for the Ta-da tab
  checkin:{ ratings: { [catId]: 0..100 }, at: ms|null, notes: string },
  checkinHistory: [{ id, at, ratings, notes }],       // frozen snapshots saved on each check-in, newest-last, never purged
  notes:  { html: string, updatedAt: ms|null },       // Home tab scratchpad, see below
  settings:{ tadaDays, tadaRecurring, tadaGroup, upRecurring, upGroup,
             doneKeepDays, logKeepDays, checkinDotDays, ciHistoryDays }
}
```
- `type`: `note` | `goal` | `todo` | `recurring`. Every category can hold any mix.
- `due`: `YYYY-MM-DD` or null. `freq`: `{ n, unit: 'day'|'week'|'month'|'year' }` for recurring items.
- `pinned` and `later` are mutually exclusive (setting one clears the other) — see "For later" below.
- Inbox is a virtual category: `INBOX` constant in `ui.js` (`id: 'inbox'`), always last, not draggable, not in `state.cats`. Items with `catId: 'inbox'` are uncategorized quick-adds.
- All settings keys are read with fallbacks, not defaulted in `load()`. Defaults: ta-da window 7 days, group by category, done items kept 30 days on tiles, log kept 365 days, check-in dot after 7 days.
- Category ids in `emptyState()` are plain strings (`fitness`, `tasks`, `notes`); new ones use `uid('c')`.
- Persisted data from older shapes is migrated inside `load()`/`normalize()` (e.g. missing `icon` becomes `null`, missing `later` becomes `false`). Add new migrations there rather than assuming a fresh shape. `normalize()` also stamps `state.version = 1` (not yet branched on for in-app migrations).
- Fresh install starts with three generic starter categories (Fitness, Tasks, Notes) plus the virtual Inbox, seeded with sample items that double as a tutorial (`emptyState()` in `js/logic.js`).
- Cloud sync keeps a few more `localStorage` keys alongside the main one, all owned by `js/sync.js`: `jenfly-supabase-auth` (the Supabase Auth session — this exact key is shared across all three sibling apps on `jenfly.github.io`, so signing in or out in one signs out of all of them), `well-tended-v1:sync-meta` (this device's view of where it last stood with the cloud: `{ userId, remoteAt, dirty, editedAt, syncedAt }`), and `well-tended-v1:pre-sync-copy` (the one-time safety copy of whatever side of a conflict just got replaced — see "Cloud sync (Supabase)" below).

## Behavior spec (decisions already made — ask before changing)

**Tiles (Home)**
- Collapsed tile shows the first 2–3 eligible items in that category's order, plus "+N more" — the count is *every* remaining item in the category (including tucked and "for later" ones, which are themselves never shown on the collapsed tile), not just overflow of what's visible-eligible. Pinned items always on top.
- Sort (`slotSort`): dateless/manual items hold their slot; auto-dated items (due date, recurring) fill remaining slots soonest-due first. Dragging an item sets `manual` and overrides the default ordering.
- Recurring items with frequency ≥ 60 days are "tucked": hidden from the tile, shown in a "Less frequent" section at the bottom of the expanded view (unless pinned).
- Items can be tucked to a "For later" section at the very bottom of the expanded view instead — via the "For later" checkbox in the item form, or the quick-toggle clock icon on each row (`item.later`). Hidden from the collapsed tile like tucked items. Pinning an item clears `later` and vice versa.
- Goal and note items show plain text only — no progress marks, counts, or overdue styling.
- To-dos show a square checkbox (also on collapsed tiles). Completing a plain to-do moves it to the bottom (Done section). Completing a recurring item does not move it: it logs a completion and resets `due` from the completion date plus its frequency.
- Tags are a filter layer only. Each item lives in exactly one category; tagged items show small dots; a chip row filters by tag.
- Tiles are drag-reorderable; edit mode on the tile itself (rename, icon picker, color swatches, delete with "move items to..." confirmation). No separate manage-categories screen.
- The FAB (bottom right, all tabs) is the only way to add items; inside an open tile it defaults to that tile's category, otherwise Inbox.
- Dates: "Today", "Tomorrow", weekday if under 7 days out, otherwise "Mar 4"; year shown only when not the current year.
- No nagging: no overdue badges, no automatic neglect alerts, nothing guilt-inducing. Keep it that way.

**Notes (Home)** — a full-width scratchpad card below the tile grid, always visible, backed by `state.notes.html`. Plain `contenteditable` with a small toolbar (bold, italic, bullet list, indent/outdent via `document.execCommand`); saves automatically on every edit (`syncNotes()`), no separate save button or draft state.

**Upcoming** — dated items across categories. Toggle: show recurring (off by default). Toggle: sort by date or group by category.

**Ta-da** — completed items from `log`. Windows: 7 / 30 / 90 / 365 days. Show/hide recurring. Group by category or by date. Display-only in the sense that there's no editing or un-completing — but an entry can be deleted outright (removed from `log` with an undo toast), which is the one exception to "display-only."
- Groups (by-date buckets — Today / Yesterday / each of the 5 preceding days individually, labeled "Friday, October 9" (weekday plus date) / calendar months — or by-category, one per category) are collapsible: every group header is a toggle button (`aria-expanded`, chevron, ≥44px tap target) showing the group's name and item count whether expanded or collapsed. The Today/Yesterday/individual-day split only applies at the 7- and 30-day windows; at 90 and 365 days everything, including the current week, rolls straight into calendar-month buckets (`pastBucket(s, days)` takes the selected window so it knows which to produce). At the 7-day window all groups default open; at 30/90/365 days groups default collapsed, except: at 30 days, by-date "Today"/"Yesterday"/individual-day groups always default open; at 90/365 days (no individual-day split there), the current calendar-month bucket takes over as the always-open "recent" one instead. A manual toggle always overrides the default and is remembered per window (`settings.tadaCollapse = { [days]: { [groupKey]: collapsed? } }`, groupKey being `pastBucket()`'s key or the category id) — collapsing in the 365-day view doesn't affect the 30-day view. An expanded group showing more than 20 items caps at its 20 most recent and offers "Show N more"; that reveal is transient view state, not persisted, and resets whenever the Ta-da tab is left and reopened.

**Check-in**
- Subjective weekly snapshot, one compact row per category: name + small diverging slider (0 neglected, 50 balanced, 100 over-focused). Not timestamped per category; only `checkin.at` is stored.
- Read mode shows meters; sliders only move in edit mode (pencil to enter, check mark to finish and set `at = now`, X to cancel and restore). This prevents accidental drags.
- Summary card lists "On the low side" and "On the high side". A reflection card holds just a notes textarea (no prompts).
- Check-in tab shows a dot once days since the last check-in reaches `settings.checkinDotDays` (default 7, configurable). The view shows how long since the last one.
- No per-item friction field, by decision — friction stays a reflective prompt only. No mid-week save: ratings save with the check mark only.
- Finishing a check-in (the check mark) also appends a frozen snapshot `{ id, at, ratings, notes }` to `checkinHistory` via `saveCheckin()` — the live `checkin.ratings`/`checkin.notes` are never cleared by this, so the next check-in starts from what was last saved, by decision. Maximum one entry per calendar day: if the most recent history entry (`todayCheckinEntry()`) falls on today, `saveCheckin()` overwrites it in place (same `id`, new `at`/ratings/notes) instead of appending a second one. A "History" section below the current check-in (divider + heading, never a separate tab or sheet) shows: a date-range toggle (`settings.ciHistoryDays`, 1/3/6/12 months, default 1 month), a per-category sparkline over that range (x-axis is actual calendar time, not a check-in index — gaps and irregular spacing show as-is), and a picker to select and review (read-only) any past snapshot's ratings and notes. History is never purged and isn't cleaned up when a category is deleted — old entries just stop rendering a row for it.
- The reflection notes field is optional and never gates the sliders' checkmark. Because the checkmark can fire before notes are written, editing notes after today's check-in is already saved doesn't retroactively change it — instead, if today's saved entry's notes differ from the live `checkin.notes`, a hint + "Save notes to today's check-in" button appears under the textarea (`ci-save-notes` action → `updateTodayCheckinNotes()`), which amends only that entry's `notes`, leaving its `ratings`/`at` untouched. No button appears if there's no check-in yet today — those notes simply ride along whenever the sliders are next confirmed.

**Housekeeping**: `purgeOld` removes done items from tiles after `doneKeepDays` and old log entries after `logKeepDays`; Ta-da history outlives the tile copies.

## Other decisions to keep
- No per-category "type" setting. No progress or streak indicators. No automatic nudges.
- Single category per item; tags only filter, never a second category.
- Inbox is a tile, always last, no triage nudges.

## Resolved questions (don't assume these are still open)

**Google Drive backup — built**, not a placeholder, but deliberately manual-only now. Lives in the settings sheet's "Data" section, alongside "Save data as JSON" (downloads `state` as a `well-tended-YYYY-MM-DD.json` file via a Blob URL) and nothing else — no restore, no "remind me after N days" reminder banner/pill, no erase-all-data button; all three were removed once Cloud sync (below) took over continuous cross-device safety, leaving this as a quiet, occasional, one-way safety net. Google Identity Services token flow (`google.accounts.oauth2.initTokenClient`) scoped to `drive.file` only (access limited to the single file this app creates), single backup file `well-tended-backup.json` via Drive REST v3 multipart upload, file id cached in `localStorage`. Backup JSON is `{ version: 1, exportedAt, state }`; there's no in-app reader for it — if it's ever needed back, it's restored by hand from Drive.
- Needs a one-time setup per deployment: a Google Cloud OAuth client ID pasted into the `GOOGLE_CLIENT_ID` constant in `js/ui.js` (see README.md "Setting up Google Drive backup" for the exact steps). `driveConfigured()` gates this — if it's unset, tapping "Back up to Drive" shows a plain-language toast instead of failing silently.
- The service worker must keep ignoring non-same-origin hosts other than Google Fonts (Drive/GIS/Supabase requests go straight to the network, uncached).

**Cloud sync (Supabase) — built**, pilot app for a layer shared with two sibling apps (`meal-planner`, `journal-app`); see `misc/supabase-sync-handoff.md` and `misc/future-sync-backup-options.md` for the full design history. Settings sheet's "Sync across devices" section (first in the sheet): optional, works exactly as before until signed in. One shared Supabase project/table (`app_data`, one `doc jsonb` row per user per app), Supabase Auth with Google via PKCE (`js/sync.js`), `localStorage` stays the always-used local copy so the app is still offline-first and instant — sync only pushes/pulls in the background. Conflict rule is whole-document last-write-wins by server `updated_at`, decided by the pure `syncPlan()` in `js/logic.js` (`push-new` / `adopt` / `choose` / `noop` / `push` / `pull` / `overwrite`); first link of a device to an account with a different existing cloud copy asks the user which to keep (`status().choice`, `resolveChoice('cloud'|'device')`), and whichever copy gets replaced is saved once in `localStorage` at `well-tended-v1:pre-sync-copy`. `js/ui.js` wires this up via `Sync.init({ key, getState, applyState, busy, onChange, onError, onPulled })`: `save()` calls `Sync.noteLocalChange()`; `applyState()` normalizes and renders an incoming remote doc with a plain "Updated from another device" toast (no undo — the pre-sync copy is the recovery path); `busy()` blocks a pull while a form/sheet/check-in edit/the notes editor has focus, so it never clobbers in-progress input.
- Google Drive backup (Data section, above) stays in place as a safety net and is unrelated to this — a user can have one, both, or neither configured.
- No dependencies, no build step: `js/sync.js` talks to Supabase Auth and PostgREST with plain `fetch`, no `supabase-js` or CDN script. Don't add one without asking.
- Signing in or out is shared with Meal Planner and the journal app (same `jenfly-supabase-auth` localStorage key, same origin) — say so in the sign-in/sign-out hints rather than letting it surprise someone switching apps.

**Device verification** (install, offline mode, service-worker update path, touch drag-and-drop, safe-area insets with the bottom tab bar/FAB on Android gesture nav) has since been confirmed working on a real phone.

**Weekly check-in push notifications** were considered and deliberately dropped: there's no server, so reliable timed web push would need new infrastructure (a subscription + a sender) this project doesn't have. The settings toggle/day/time were removed; the Check-in tab's in-app dot (after `checkinDotDays` days since the last check-in) is the permanent reminder mechanism.

## Conventions worth preserving
- Keep `js/logic.js` free of DOM access so it stays testable from plain Node.
- No build step by design — don't introduce bundlers, npm dependencies, or ES modules without discussing it first; it changes the GitHub Pages deploy story.
