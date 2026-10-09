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
node test.js             # pure logic tests (js/logic.js)
node smoke2.js           # ...through smoke8.js — jsdom UI smoke tests
node empty.js            # needs a static server on the port hardcoded in the file:
                          #   (cd .. && python3 -m http.server 8125)
                          # checks a fresh install starts with 3 starter tiles + Inbox
```
- `bundle.sh` concatenates `css/styles.css`, the `index.html` body, `js/logic.js`, `tests/sample-data.js`, and `js/ui.js` into one file, swapping `emptyState()` for `seed()` so the UI tests have data to work with.
- `tests/sample-data.js` is invented, safe-to-commit test data. Keep real personal data out of the repo.
- Changing UI strings/structure/markup will likely break smoke test selectors — expect to update them alongside the change.
- jsdom's "Not implemented: window.scrollTo" console message is harmless noise.

There is no lint/build command; there are no bundler, transpiler, or type-checker configs.

**Any UI change (markup, styles, layout) must be verified visually and shown to the user as screenshots before the task is considered done** — not just described in text. Render the real page (e.g. headless Chrome against `python3 -m http.server`) and capture the affected view(s).

## Architecture

Three script files loaded as classic `<script>` tags (no ES modules) in this order: `js/logic.js` then `js/ui.js`.

- **`js/logic.js`** — pure functions only (dates, sorting, check-in math, state defaults/migrations). No DOM access. Exported via `module.exports` when `typeof module !== 'undefined'`, which is how `tests/test.js` consumes it directly in Node.
- **`js/ui.js`** — a single IIFE. Renders by building HTML strings (no templating library, no virtual DOM) and re-rendering wholesale into `#main`/`#overlay-root`/`#sheet-root`. All interactivity goes through one delegated `click`/`change`/`submit` handler keyed off `data-action` attributes on elements — there are no per-element listeners. Drag-and-drop (mouse and touch) is hand-rolled via `pointerdown`/`pointermove`/`pointerup` (long-press 500ms to start on touch; grips start immediately).
- **`css/styles.css`** — all styling, including theme tokens. Light tokens live on `:root`; dark tokens are defined twice — once under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]` — so both the OS-default and the explicit in-app theme toggle work. **Any new color must be added as a token in all three places.** Low-saturation per-category swatches (teal, apricot, sky, clay, sand, slate, lilac, rose, moss, plum, sage) keep categories visually distinct but calm.
- **`sw.js`** — offline-cache service worker. Same-origin requests: cache-first, refreshed in the background. Google Fonts (Figtree body / Newsreader display) requests: cached after first load. **`VERSION` must be bumped whenever any cached app file changes**, and any new file must be added to the `SHELL` array, or installed phones keep serving stale copies.
- **`index.html`** — markup shell plus the three `<script>` tags; registers the service worker on load.

### State

Single JSON blob in `localStorage` under key `well-tended-v1`, written by `save()` / read by `load()` in `js/ui.js`.

```
{
  cats:   [{ id, name, color, icon|null }],         // ordered; Inbox is virtual (see below)
  items:  [{ id, catId, type, text, desc, due, freq, pinned, done, doneAt, manual, tags[], order }],
  tags:   [string],                                   // free-form, created as you go
  log:    [{ id, itemId, text, catId, at, rec }],     // completion history for the Ta-da tab
  checkin:{ ratings: { [catId]: 0..100 }, at: ms|null, notes: string },
  settings:{ tadaDays, tadaRecurring, tadaGroup, upRecurring, upGroup,
             doneKeepDays, logKeepDays, checkinDotDays }
}
```
- `type`: `note` | `goal` | `todo` | `recurring`. Every category can hold any mix.
- `due`: `YYYY-MM-DD` or null. `freq`: `{ n, unit: 'day'|'week'|'month'|'year' }` for recurring items.
- Inbox is a virtual category: `INBOX` constant in `ui.js` (`id: 'inbox'`), always last, not draggable, not in `state.cats`. Items with `catId: 'inbox'` are uncategorized quick-adds.
- All settings keys are read with fallbacks, not defaulted in `load()`. Defaults: ta-da window 7 days, group by category, done items kept 30 days on tiles, log kept 365 days, check-in dot after 7 days.
- Category ids in `emptyState()` are plain strings (`fitness`, `tasks`, `notes`); new ones use `uid('c')`.
- Persisted data from older shapes is migrated inside `load()` (e.g. missing `icon` becomes `null`). Add new migrations there rather than assuming a fresh shape. Consider a `version` field before any backup/export format ships.
- Fresh install starts with three generic starter categories (Fitness, Tasks, Notes) plus the virtual Inbox, seeded with sample items that double as a tutorial (`emptyState()` in `js/logic.js`).

## Behavior spec (decisions already made — ask before changing)

**Tiles (Home)**
- Collapsed tile shows the first 2–3 items in that category's order, plus "+N more". Pinned items always on top.
- Sort (`slotSort`): dateless/manual items hold their slot; auto-dated items (due date, recurring) fill remaining slots soonest-due first. Dragging an item sets `manual` and overrides the default ordering.
- Recurring items with frequency ≥ 60 days are "tucked": hidden from the tile, shown in a "Less frequent" section at the bottom of the expanded view (unless pinned).
- Goal and note items show plain text only — no progress marks, counts, or overdue styling.
- To-dos show a square checkbox (also on collapsed tiles). Completing a plain to-do moves it to the bottom (Done section). Completing a recurring item does not move it: it logs a completion and resets `due` from the completion date plus its frequency.
- Tags are a filter layer only. Each item lives in exactly one category; tagged items show small dots; a chip row filters by tag.
- Tiles are drag-reorderable; edit mode on the tile itself (rename, icon picker, color swatches, delete with "move items to..." confirmation). No separate manage-categories screen.
- The FAB (bottom right, all tabs) is the only way to add items; inside an open tile it defaults to that tile's category, otherwise Inbox.
- Dates: "Today", "Tomorrow", weekday if under 7 days out, otherwise "Mar 4"; year shown only when not the current year.
- No nagging: no overdue badges, no automatic neglect alerts, nothing guilt-inducing. Keep it that way.

**Upcoming** — dated items across categories. Toggle: show recurring (off by default). Toggle: sort by date or group by category.

**Ta-da** — completed items from `log`. Windows: 7 / 30 / 90 / 365 days. Show/hide recurring. Group by category or by date. Display-only by decision — no edit or un-complete.

**Check-in**
- Subjective weekly snapshot, one compact row per category: name + small diverging slider (0 neglected, 50 balanced, 100 over-focused). Not timestamped per category; only `checkin.at` is stored.
- Read mode shows meters; sliders only move in edit mode (pencil to enter, check mark to finish and set `at = now`, X to cancel and restore). This prevents accidental drags.
- Summary card lists "On the low side" and "On the high side". A reflection card has rotating prompts (including a "shrink this task" prompt) and a notes textarea.
- Check-in tab shows a dot once days since the last check-in reaches `settings.checkinDotDays` (default 7, configurable). The view shows how long since the last one.
- No per-item friction field, by decision — friction stays a reflective prompt only. No mid-week save: ratings save with the check mark only.

**Housekeeping**: `purgeOld` removes done items from tiles after `doneKeepDays` and old log entries after `logKeepDays`; Ta-da history outlives the tile copies.

## Other decisions to keep
- No per-category "type" setting. No progress or streak indicators. No automatic nudges.
- Single category per item; tags only filter, never a second category.
- Inbox is a tile, always last, no triage nudges.

## Not yet built (placeholders exist in the UI — don't assume these work)
1. **Google Drive backup/restore.** Settings sheet has a "Backup and restore" section and a "Copy data as JSON" button, both placeholder/partial. Intended design if picked back up: manual backup/restore triggered from settings (not continuous sync), Google Identity Services token flow scoped to `drive.file` only, single backup file (e.g. `well-tended-backup.json`) via Drive REST v3, file id cached in localStorage, restore via inline two-tap confirmation (the app never uses `confirm()`), decide the JSON format (with `version` + `exportedAt`) before building since that's the hardest thing to change later. The service worker must keep ignoring non-same-origin hosts other than Google Fonts.
2. **Device verification.** Nothing has been verified on a real phone yet: install, offline mode, service-worker update path, touch drag-and-drop, safe-area insets with the bottom tab bar/FAB on Android gesture nav.

Weekly check-in push notifications were considered and deliberately dropped: there's no server, so reliable timed web push would need new infrastructure (a subscription + a sender) this project doesn't have. The settings toggle/day/time were removed; the Check-in tab's in-app dot (after `checkinDotDays` days since the last check-in) is the permanent reminder mechanism.

## Conventions worth preserving
- Keep `js/logic.js` free of DOM access so it stays testable from plain Node.
- No build step by design — don't introduce bundlers, npm dependencies, or ES modules without discussing it first; it changes the GitHub Pages deploy story.
