# Testing with a year of mock data

How to load a realistic year of invented data into Well Tended on a **desktop browser**, so you can try the Ta-da tab (including the planned collapsible groups) and the Check-in tab's history sparklines at full volume.

## What it is

`seed-mock-year.js` is a script you paste into the browser's developer console. It builds a full app state in the app's own `localStorage` shape (key `well-tended-v1`), writes it in, and reloads the page.

What it generates (all invented, safe to share):

- 10 categories: Exercise, Meal Planning, Chores, Home Projects, Errands, Work, Mindfulness, Social, Admin, Leisure.
- About 1,700 completions in the Ta-da log over the last 365 days (roughly 4-5 a day, varying from day to day, with a few quiet weeks and one "away" week). So all four Ta-da windows (7 days, 30 days, 90 days, 1 year) have meaningful data.
- Matching items: recurring items (including a few long-interval ones that show under "Less frequent"), open to-dos with due dates, goals, notes, a few tags.
- About 47 weekly check-ins over the year with some weeks skipped, ratings for all 10 categories that vary over time, and a live check-in that matches the most recent one.

The same seed gives the same data every time. To get a different year, run `window.WT_SEED = 7;` in the console (any number) before pasting the script.

## Why this can't affect your phone

`localStorage` belongs to one browser profile on one device, and to one origin (address). The script only writes to the browser you run it in. Your phone's data, and the copy of the app you use on it, are completely separate and are never touched.

## The one thing that could cause real damage

> **Do not use "Back up to Drive" in the test copy.** It would overwrite your real `well-tended-backup.json` in Google Drive with the mock data. Likewise don't use "Restore" unless you mean to replace the test data with your real backup.

The simplest protection is not to set up or sign in to Google Drive backup in the test browser at all. On `localhost` it normally isn't usable anyway (the Google OAuth client only allows the origins you registered), but don't rely on that.

## Step by step

### 1. Get the script into the repo folder

Save `seed-mock-year.js` somewhere handy in the app folder, for example `tests/seed-mock-year.js`. It contains only invented data, so it is fine to commit. (If you keep it elsewhere, that's fine too: you only ever copy its contents.)

### 2. Start the local server

In a terminal, from the app's root folder (the one containing `index.html`):

```
python3 -m http.server 8000
```

On Windows you may need `py -m http.server 8000`. Leave it running.

### 3. Open the app in a browser profile you don't use for real data

Pick one:

- **A private/incognito window** (easiest): everything is thrown away when you close the window, so it is self-cleaning. Good for a quick look.
- **A separate browser profile** (e.g. Chrome: profile icon > Add): the mock data stays between sessions, which is better when you're testing over several days.

Go to **`http://localhost:8000`**. Use exactly that address every time: `localhost` and `127.0.0.1` count as different origins and have separate storage.

You should see the three starter tiles (Fitness, Tasks, Ideas) plus the Inbox. If you see anything else, this browser already has data in it; see "Safety behavior" below.

### 4. Open the developer console

- Windows/Linux: `F12`, or `Ctrl+Shift+J` (Chrome) / `Ctrl+Shift+K` (Firefox)
- Mac: `Cmd+Option+J` (Chrome) / `Cmd+Option+K` (Firefox)

Choose the **Console** tab.

### 5. Paste the script and press Enter

Open `seed-mock-year.js`, copy **everything**, paste it into the console and press Enter.

If the browser refuses to paste, it is a safety feature. Chrome and Firefox ask you to type `allow pasting` and press Enter first, then paste again.

The console prints how many categories, items and completions it created, and the page reloads with the data in place. This takes about a second.

### 6. Try things out

Things worth looking at:

- **Ta-da tab:** switch between 7 days, 30 days, 90 days and 1 year, and between By category and By date. Note how long the lists get. (Until the collapsible-groups change from `tada-collapsible-groups.md` is built, every group is fully expanded.)
- **Check-in tab:** scroll to History and switch the range between 1, 3, 6 and 12 months. At 1 month and 3 months each check-in is its own bar. At 12 months the bars overlap into a solid shape, which is a known thing to fix.
- **Home and Upcoming:** a lived-in set of tiles and dated to-dos.

You can also tick things off, add items and delete entries as normal. Changes persist in this browser until you reset.

### 7. When you're done

Close the private window (nothing to clean up), or reset the profile's copy with the one-liner below.

## Safety behavior of the script

- **If the browser already has saved Well Tended data**, the script stops and asks (a confirm dialog) before replacing it. Cancel and nothing changes. If you say OK, it first saves a copy of the existing data under the separate key `well-tended-v1-before-mock`. (A fresh install showing only the starter tiles counts as "nothing to protect" and is replaced without asking.)
- **If the page isn't on `localhost`** (for example you opened a hosted copy), it asks for an extra confirmation, so you don't seed a browser profile you actually use for real data by accident.
- It never touches Google Drive, and never runs by itself: only when you paste it.

### Undo / start over (run these in the console, then it reloads)

Reset to a fresh, empty install:

```js
localStorage.removeItem('well-tended-v1'); location.reload();
```

Restore the data that was there before the script replaced it (only works if the script asked and made a copy):

```js
localStorage.setItem('well-tended-v1', localStorage.getItem('well-tended-v1-before-mock')); location.reload();
```

## Troubleshooting

- **Nothing happens after pasting:** look for a red error in the console. Make sure you copied the whole file, including the first and last lines.
- **Starter tiles still showing after the reload:** you may have opened a different address than the one you seeded (`127.0.0.1` vs `localhost`, or a different port). Seed and test on the same one.
- **Old behaviour after you change app code:** the app caches its files with a service worker. Hard reload (`Ctrl+Shift+R`), or bump `VERSION` in `sw.js`, as noted in `CLAUDE.md`.
- **The data looks stale a day later:** the dates are generated relative to the moment you ran the script. Reset and run it again to re-centre the year on today.
- **The "back up to Drive" banner appears:** that is just the normal 30-day reminder, since the test browser has never backed up. Ignore it, and do not tap it (see the warning above).
