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

## Not built yet
Real weekly push notifications (the settings toggle, day and time exist but don't send anything yet — see `HANDOFF.md`).
