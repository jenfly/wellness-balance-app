---
name: run
description: How to run Well Tended locally, run its full test suite, and take verified light/dark screenshots. Use whenever starting the dev server, running tests, or capturing screenshots of a UI change for the user.
---

This project has no build step and no `package.json`, so none of this is a single
command — it's a few small, easy-to-forget steps. Use this instead of re-deriving them.

## Local dev server

```
python3 -m http.server 8000
```
Open `http://localhost:8000`. The service worker caches same-origin files
aggressively — if a change doesn't show up, hard-reload, or bump `VERSION` in
`sw.js` (required anyway whenever a cached app file changes, per CLAUDE.md).

## Full test suite

Run from `tests/`:

```
cd tests
export NODE_PATH=<path to a node_modules containing jsdom>   # npm i jsdom if missing
./bundle.sh        # rebuilds balance-tiles.html from css/styles.css + index.html body +
                    # js/logic.js + tests/sample-data.js + js/ui.js — REQUIRED after any
                    # edit to index.html/css/js, or the other tests run against a stale bundle
node test.js        # pure logic (js/logic.js) — no DOM
node smoke2.js       # jsdom UI smoke tests, run each file individually:
node smoke3.js
node smoke4.js
node smoke5.js
node smoke6.js
node smoke7.js
node smoke8.js
node smoke9.js
node smoke10.js
```

`empty.js` is separate — it checks a fresh install seeds 3 starter tiles + Inbox, and it
loads over HTTP rather than from the bundle, so it needs its own static server on the
port hardcoded in the file (8125):
```
(cd .. && python3 -m http.server 8125 &)
node empty.js
```

Editing UI strings/markup will likely break smoke-test selectors — expect to update
tests alongside such a change, not treat a failure as unrelated.

`jsdom`'s "Not implemented: window.scrollTo" console message is harmless noise, not a
failure.

## Screenshots (required for any UI change before calling it done)

No puppeteer/playwright in this repo (consistent with the no-dependencies philosophy) —
use the system `google-chrome` binary's built-in headless screenshot flag directly
against the local server. Verified working invocation:

```
python3 -m http.server 8000 &          # from repo root

# light mode, phone viewport
google-chrome --headless --disable-gpu --no-sandbox --window-size=412,915 \
  --screenshot=/path/to/out-light.png http://localhost:8000/index.html

# dark mode (forces prefers-color-scheme: dark, which is what sw.js/styles.css key off)
google-chrome --headless --disable-gpu --no-sandbox --window-size=412,915 \
  --force-dark-mode --enable-features=WebContentsForceDark \
  --screenshot=/path/to/out-dark.png http://localhost:8000/index.html
```

Notes:
- `412x915` is a representative Android phone viewport (this app is Android-first);
  resize if the change under review is specifically about a different breakpoint.
- Each headless run uses a fresh temp Chrome profile, so there's no stale
  localStorage/service-worker state to worry about between screenshots — you'll see
  the seeded starter data (Fitness/Tasks/Ideas/Inbox tiles), not a blank page or error.
- This only covers the OS-level `prefers-color-scheme` dark tokens. CLAUDE.md also
  describes dark tokens applying via an explicit in-app `data-theme="dark"` toggle, but
  as of writing there's no such toggle wired up in `js/ui.js` to trigger from the CLI —
  if one gets added, drive it by seeding `localStorage` before load or by navigating the
  toggle, not by a flag.
- To capture a specific app state (an open tile, a sheet, scrolled check-in history,
  etc.) rather than the fresh-install default, a one-off headless-Chrome screenshot
  can't click through the UI first — use a short Node+jsdom or Puppeteer-style driver
  only if truly needed; for most visual-diff purposes the fresh-install screenshot of
  the changed view is sufficient.
- Read the resulting PNG back (e.g. with the Read tool) to confirm it actually rendered
  the app and not a blank/error page before presenting it as done.
