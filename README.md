# Well Tended

A tile-based app that keeps every life area in view. Vanilla JS PWA, no build step. Data lives in the browser (localStorage).

## Files
- `index.html`: markup and script tags
- `css/styles.css`: all styling and theme tokens
- `js/logic.js`: pure logic (sorting, dates, check-in math); testable in Node
- `js/ui.js`: rendering, events, drag and drop
- `sw.js`: offline cache. **Bump `VERSION` whenever any app file changes.**
- `manifest.webmanifest`, `icons/`: install metadata and the sprout icon

## Run locally
`python3 -m http.server 8000`, then open http://localhost:8000 (service workers need http://localhost or https).

## Deploy (GitHub Pages)
Push to a repo, then Settings > Pages > Deploy from branch `main`, folder `/ (root)`. All paths are relative, so any repo name works.

## Install on Android
Open the site in Chrome, menu > Install app (or Add to Home screen).

## Not built yet
Google Drive backup/restore and real weekly notifications (settings has placeholders).
