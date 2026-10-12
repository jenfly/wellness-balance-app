/* Well Tended: seed a year of MOCK data for manual testing.
 *
 * For a desktop browser only. It writes into this browser's localStorage under
 * 'well-tended-v1' (the app's one state key). localStorage is per browser profile
 * and per origin, so this cannot touch the data on your phone.
 *
 * How to use (on your computer):
 *   1. In the app folder run:  python3 -m http.server 8000
 *   2. Open http://localhost:8000 in a browser profile you don't use for real data.
 *   3. Open the dev console, paste this whole file, press Enter. The page reloads with the data.
 *
 * Undo / go back:
 *   - Fresh start:       localStorage.removeItem('well-tended-v1'); location.reload();
 *   - If it replaced something it asked about first, a copy was saved: restore with
 *       localStorage.setItem('well-tended-v1', localStorage.getItem('well-tended-v1-before-mock')); location.reload();
 *
 * Do NOT use "Back up to Drive" in this test copy: it would overwrite your real Drive backup with mock data.
 *
 * Reproducible: same seed, same data (change WT_SEED to get a different year).
 */
(function () {
  'use strict';
  var KEY = 'well-tended-v1';
  var BACKUP_KEY = 'well-tended-v1-before-mock';
  var DAYS = 365; // today plus the 364 days before it: exactly what the 1-year window covers
  var DAY = 86400000;

  /* ---------- small helpers ---------- */
  function mulberry32(a) {
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function ds(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addFreq(d, n, unit) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (unit === 'day') x.setDate(x.getDate() + n);
    else if (unit === 'week') x.setDate(x.getDate() + 7 * n);
    else if (unit === 'month') {
      var day = x.getDate(); x.setDate(1); x.setMonth(x.getMonth() + n);
      var last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
      x.setDate(Math.min(day, last));
    } else x.setFullYear(x.getFullYear() + n);
    return ds(x);
  }

  function buildState(nowMs, seed) {
    var rnd = mulberry32(seed == null ? 20261011 : seed);
    function ri(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }       // inclusive int
    function pick(arr) { return arr[Math.floor(rnd() * arr.length)]; }
    function poisson(l) { var L = Math.exp(-l), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1; }
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

    var seq = nowMs;
    function uid(p) { return p + (seq++).toString(36); }

    var now = new Date(nowMs);
    var today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = [];                                  // oldest first
    for (var i = DAYS - 1; i >= 0; i--) { var d0 = new Date(today0); d0.setDate(d0.getDate() - i); days.push(d0); }

    /* ---------- how busy each day is ---------- */
    var weeks = Math.ceil(DAYS / 7) + 1, weekEnergy = [], w;
    for (w = 0; w < weeks; w++) weekEnergy.push(0.8 + rnd() * 0.5);          // some weeks fuller than others
    [ri(8, 20), ri(24, 34), ri(38, 48)].forEach(function (x) { weekEnergy[x] = 0.35; });   // a few low-energy weeks
    weekEnergy[ri(30, 40)] = 0.08;                                          // one away week
    var energy = days.map(function (d, idx) { return weekEnergy[Math.floor(idx / 7)] * (0.75 + rnd() * 0.5); });

    function isWeekend(d) { var g = d.getDay(); return g === 0 || g === 6; }
    function stamp(d, h0, h1) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), ri(h0, h1), ri(0, 59), ri(0, 59)).getTime(); }

    /* ---------- categories ---------- */
    var CATS = [
      { id: 'exercise', name: 'Exercise', color: 'teal', icon: 'dumbbell' },
      { id: 'meals', name: 'Meal Planning', color: 'apricot', icon: 'utensils' },
      { id: 'chores', name: 'Chores', color: 'clay', icon: 'sparkle' },
      { id: 'homeproj', name: 'Home Projects', color: 'sky', icon: 'home' },
      { id: 'errands', name: 'Errands', color: 'sand', icon: 'bag' },
      { id: 'work', name: 'Work', color: 'slate', icon: 'briefcase' },
      { id: 'mind', name: 'Mindfulness', color: 'lilac', icon: 'leaf' },
      { id: 'social', name: 'Social', color: 'rose', icon: 'people' },
      { id: 'admin', name: 'Admin', color: 'plum', icon: 'file' },
      { id: 'leisure', name: 'Leisure', color: 'moss', icon: 'book' }
    ];

    var items = [], log = [], orderOf = {};
    function nextOrder(cat) { orderOf[cat] = (orderOf[cat] == null ? -1 : orderOf[cat]) + 1; return orderOf[cat]; }
    function mkItem(cat, type, text, o) {
      var it = Object.assign({ id: uid('i'), catId: cat, type: type, text: text, desc: '', due: null, freq: null, pinned: false, later: false,
        done: false, doneAt: null, manual: false, tags: [], order: nextOrder(cat) }, o || {});
      items.push(it); return it;
    }
    function addLog(itemId, text, cat, at, rec) { log.push({ id: uid('l'), itemId: itemId, text: text, catId: cat, at: at, rec: rec }); }

    /* ---------- recurring streams ---------- */
    // kind: 'prob' (about every `interval` days), 'weekly' / 'biweekly' (on dow), 'monthly' (around dom), 'every' (every N months, spaced by `gap` days)
    var STREAMS = [
      // Exercise: weekly-ish goals
      { cat: 'exercise', text: 'Walk 30 minutes', kind: 'prob', interval: 2.2, freq: { n: 2, unit: 'day' }, h: [7, 18], tags: ['outdoors'] },
      { cat: 'exercise', text: 'Gym session', kind: 'weekly', dow: 2, freq: { n: 1, unit: 'week' }, h: [17, 19] },
      { cat: 'exercise', text: 'Yoga class', kind: 'prob', interval: 4.5, freq: { n: 3, unit: 'day' }, h: [7, 19] },
      // Meal Planning: roughly weekly
      { cat: 'meals', text: 'Do the meal plan', kind: 'weekly', dow: 0, freq: { n: 1, unit: 'week' }, h: [10, 12] },
      { cat: 'meals', text: 'Batch cook', kind: 'weekly', dow: 0, freq: { n: 1, unit: 'week' }, h: [14, 17] },
      { cat: 'meals', text: 'Order groceries', kind: 'weekly', dow: 4, freq: { n: 1, unit: 'week' }, h: [9, 11] },
      // Chores: short-frequency plus a couple of long ones
      { cat: 'chores', text: 'Laundry', kind: 'prob', interval: 5, freq: { n: 4, unit: 'day' }, h: [8, 19] },
      { cat: 'chores', text: 'Wipe kitchen counters', kind: 'prob', interval: 5, freq: { n: 4, unit: 'day' }, h: [18, 21], tags: ['quick'] },
      { cat: 'chores', text: 'Vacuum', kind: 'weekly', dow: 6, freq: { n: 1, unit: 'week' }, h: [10, 13] },
      { cat: 'chores', text: 'Clean the bathroom', kind: 'weekly', dow: 0, freq: { n: 1, unit: 'week' }, h: [13, 16] },
      { cat: 'chores', text: 'Garbage and recycling out', kind: 'weekly', dow: 3, freq: { n: 1, unit: 'week' }, h: [19, 21], tags: ['quick'] },
      { cat: 'chores', text: 'Water the plants', kind: 'weekly', dow: 5, freq: { n: 1, unit: 'week' }, h: [8, 10], tags: ['quick'] },
      { cat: 'chores', text: 'Change the bed sheets', kind: 'biweekly', dow: 1, freq: { n: 2, unit: 'week' }, h: [9, 11] },
      { cat: 'chores', text: 'Mop the floors', kind: 'biweekly', dow: 6, freq: { n: 2, unit: 'week' }, h: [15, 17] },
      { cat: 'chores', text: 'Clean out the fridge', kind: 'monthly', dom: 15, freq: { n: 1, unit: 'month' }, h: [10, 12] },
      { cat: 'chores', text: 'Replace the furnace filter', kind: 'every', months: 3, gap: 91, freq: { n: 3, unit: 'month' }, h: [10, 12] },
      { cat: 'chores', text: 'Wash the windows', kind: 'every', months: 6, gap: 182, freq: { n: 6, unit: 'month' }, h: [10, 14] },
      { cat: 'chores', text: 'Deep clean the oven', kind: 'every', months: 6, gap: 182, freq: { n: 6, unit: 'month' }, h: [11, 15] },
      // Work: thin
      { cat: 'work', text: 'Weekly work wrap-up note', kind: 'weekly', dow: 5, freq: { n: 1, unit: 'week' }, h: [16, 17] },
      // Mindfulness
      { cat: 'mind', text: 'Meditate 10 minutes', kind: 'prob', interval: 2.6, freq: { n: 1, unit: 'day' }, h: [6, 8], tags: ['morning'] },
      { cat: 'mind', text: 'Gratitude journal', kind: 'prob', interval: 4.5, freq: { n: 3, unit: 'day' }, h: [21, 22], tags: ['evening'] },
      { cat: 'mind', text: 'Mindful walk', kind: 'weekly', dow: 3, freq: { n: 1, unit: 'week' }, h: [8, 9], tags: ['outdoors'] },
      // Social
      { cat: 'social', text: 'Lunch with friends', kind: 'monthly', dom: 12, freq: { n: 1, unit: 'month' }, h: [12, 13] },
      { cat: 'social', text: 'Call family', kind: 'biweekly', dow: 3, freq: { n: 2, unit: 'week' }, h: [16, 19] },
      // Admin
      { cat: 'admin', text: 'Monthly finance review', kind: 'monthly', dom: 28, freq: { n: 1, unit: 'month' }, h: [19, 21] },
      { cat: 'admin', text: 'Pay credit card bill', kind: 'monthly', dom: 5, freq: { n: 1, unit: 'month' }, h: [8, 20] },
      // Leisure
      { cat: 'leisure', text: 'Read for 30 minutes', kind: 'prob', interval: 3, freq: { n: 3, unit: 'day' }, h: [20, 22], tags: ['evening'] }
    ];

    function streamDays(s) {
      var out = [], lastIdx = -99, startShift = ri(5, 60);
      for (var k = 0; k < days.length; k++) {
        var d = days[k], dow = d.getDay(), hit = false, e = energy[k];
        if (s.kind === 'prob') {
          var f = (s.cat === 'chores' && isWeekend(d)) ? 1.4 : 1;
          hit = rnd() < Math.min(0.9, f * e / s.interval);
        } else if (s.kind === 'weekly' || s.kind === 'biweekly') {
          var wk = Math.floor(k / 7);
          if (s.kind === 'biweekly' && wk % 2 !== (s.dow % 2)) hit = false;
          else if (dow === s.dow) hit = rnd() < Math.min(0.97, 0.55 + 0.5 * e);
          else if (dow === (s.dow + 1) % 7 && rnd() < 0.10 && out.length && out[out.length - 1] !== k - 1) hit = rnd() < 0.5; // occasional day-late
        } else if (s.kind === 'monthly') {
          var targetDom = Math.min(28, Math.max(1, s.dom + (k % 5) - 2));
          hit = d.getDate() === targetDom && rnd() < 0.93;
        } else if (s.kind === 'every') {
          hit = (k - startShift) >= 0 && ((k - startShift) % s.gap === 0);
        }
        if (hit && k !== lastIdx) { out.push(k); lastIdx = k; }
      }
      return out;
    }

    // Tags
    var tagsUsed = {};
    function tagNames(a) { (a || []).forEach(function (t) { tagsUsed[t] = true; }); return (a || []).slice(); }

    STREAMS.forEach(function (s) {
      var it = mkItem(s.cat, 'recurring', s.text, { freq: s.freq, tags: tagNames(s.tags) });
      var idxs = streamDays(s), lastDay = null;
      idxs.forEach(function (k) {
        var at = stamp(days[k], s.h[0], s.h[1]);
        if (at > nowMs) return;
        addLog(it.id, s.text, s.cat, at, true);
        lastDay = days[k];
      });
      it.due = lastDay ? addFreq(lastDay, s.freq.n, s.freq.unit) : addFreq(today0, 0, 'day');
    });

    /* ---------- one-off to-dos (finished ones stay on tiles 30 days; older ones live only in Ta-da history) ---------- */
    var ONEOFF = {
      errands: { rate: 0.45, wk: 1.3, h: [10, 17], pool: ['Pick up dry cleaning', 'Return an online order', 'Post office run', 'Grocery pickup', 'Drop off donations', 'Get keys copied', 'Pick up a library hold', 'Buy a birthday card', 'Hardware store run', 'Return library books', 'Pick up the parcel', 'Car wash', 'Refill the propane tank', 'Buy light bulbs', 'Drop off the recycling', 'Pick up flowers', 'Exchange a gift', 'Get stamps', 'Pick up a pharmacy order', 'Buy cat food'] },
      homeproj: { rate: 0.15, wk: 2.2, h: [9, 16], pool: ['Sand the bookshelf', 'Prime the hallway wall', 'Paint the hallway', 'Install curtain rods', 'Assemble the desk', 'Caulk the bathtub', 'Hang shelves in the pantry', 'Replace cabinet handles', 'Patch the drywall holes', 'Organize the garage shelves', 'Fix the squeaky door', 'Declutter the closet', 'Re-seal the deck', 'Mount the TV', 'Replace the showerhead', 'Hang the mirror'] },
      admin: { rate: 0.12, wk: 0.5, h: [19, 21], pool: ['Renew the car registration', 'Update address with the bank', 'File receipts', 'Back up the laptop', 'Cancel an unused subscription', 'Review the insurance policy', 'Organize tax documents', 'Update emergency contacts', 'Call the utility company', 'Scan documents', 'Update the password manager', 'Renew a membership'] },
      social: { rate: 0.06, wk: 2, h: [12, 20], pool: ['Call Mom', 'Text a friend to catch up', 'Pick a birthday gift for a friend', 'RSVP to the party', 'Send a thank-you note', 'Plan a game night'] },
      work: { rate: 0.02, wk: 0.2, h: [9, 16], pool: ['Reply to pending email', 'Update project notes', 'Submit the timesheet'] },
      leisure: { rate: 0.05, wk: 2, h: [19, 22], pool: ['Finish a book', 'Try a new board game', 'Watch a documentary', 'Plan a day trip', 'Update the reading list', 'Pick the next book'] }
    };
    var cutDone = nowMs - 30 * DAY;
    Object.keys(ONEOFF).forEach(function (cat) {
      var o = ONEOFF[cat], order = shuffle(o.pool), n = 0;
      days.forEach(function (d, k) {
        var cnt = poisson(o.rate * (isWeekend(d) ? o.wk : 1) * energy[k] * (cat === 'work' || cat === 'admin' ? (isWeekend(d) ? 0.4 : 1.2) : 1));
        for (var c = 0; c < cnt; c++) {
          var text = order[n++ % order.length], at = stamp(d, o.h[0], o.h[1]);
          if (at > nowMs) continue;
          if (at >= cutDone) {
            var it = mkItem(cat, 'todo', text, { done: true, doneAt: at, tags: tagNames(text === 'Post office run' ? ['outdoors'] : []) });
            addLog(it.id, text, cat, at, false);
          } else {
            addLog(uid('i'), text, cat, at, false);   // item itself aged off the tile long ago
          }
        }
      });
    });

    /* ---------- open to-dos, goals and notes ---------- */
    function dueIn(n) { return ds(new Date(today0.getFullYear(), today0.getMonth(), today0.getDate() + n)); }
    mkItem('exercise', 'goal', 'Walk about 4 times a week', { desc: 'Roughly every other day is fine.' });
    mkItem('mind', 'goal', 'Meditate most days');
    mkItem('leisure', 'goal', 'Read 24 books this year', { pinned: true });
    mkItem('work', 'note', 'Placeholder: most work tasks live elsewhere');
    mkItem('meals', 'note', 'Stock the freezer ahead of busy weeks');
    mkItem('errands', 'todo', 'Grocery pickup', { due: dueIn(1) });
    mkItem('errands', 'todo', 'Return an online order', { due: dueIn(2) });
    mkItem('errands', 'todo', 'Post office run', { due: dueIn(4), tags: tagNames(['outdoors']) });
    mkItem('errands', 'todo', 'Pick up dry cleaning', { due: dueIn(6) });
    mkItem('errands', 'todo', 'Get keys copied');
    mkItem('homeproj', 'todo', 'Assemble the desk', { pinned: true });
    mkItem('homeproj', 'todo', 'Paint the hallway');
    mkItem('homeproj', 'todo', 'Install curtain rods', { due: dueIn(9) });
    mkItem('homeproj', 'todo', 'Caulk the bathtub', { later: true });
    mkItem('admin', 'todo', 'Review the insurance policy', { due: dueIn(12) });
    mkItem('admin', 'todo', 'Organize tax documents', { due: dueIn(20) });
    mkItem('admin', 'todo', 'Update the password manager');
    mkItem('social', 'todo', 'Pick a birthday gift for a friend', { due: dueIn(5) });
    mkItem('social', 'todo', 'Plan a game night', { due: dueIn(10) });
    mkItem('work', 'todo', 'Submit the timesheet', { due: dueIn(3) });
    mkItem('leisure', 'todo', 'Pick the next book');

    log.sort(function (a, b) { return a.at - b.at; });

    /* ---------- weekly check-ins (drawn after everything above, so the activity data is unchanged) ---------- */
    function gauss() { var u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
    // Where each area tends to sit on the 0 (neglected) .. 50 (balanced) .. 100 (over-focused) scale.
    var BASE = { exercise: 45, meals: 50, chores: 58, homeproj: 32, errands: 50, work: 22, mind: 45, social: 30, admin: 40, leisure: 55 };
    var perWeekAvg = {};
    CATS.forEach(function (c) { perWeekAvg[c.id] = Math.max(0.5, log.filter(function (e) { return e.catId === c.id; }).length / (DAYS / 7)); });
    var NOTES = ['Busy week at work, things slid a bit.', 'Good rhythm this week.', 'Felt scattered; too many small errands.',
      'Hard to fit exercise in.', 'Got a lot done around the house.', 'Quiet week. Lots of reading.', 'Social plans filled the weekend.',
      'Admin piled up, need to tackle it.', 'Meal planning really helped.', 'Low energy mid-week.', 'Back on track after last week.',
      'Too much focus on chores, not enough rest.', 'Nice balance overall.', 'Mornings are working well.'];
    var checkinHistory = [], noise = {}, skippedLast = false;
    CATS.forEach(function (c) { noise[c.id] = 0; });
    for (var k = 0; k < days.length; k++) {
      if (days[k].getDay() !== 0) continue;                                   // Sundays are the usual check-in day
      var wkE = weekEnergy[Math.floor(k / 7)];
      var skipP = (skippedLast ? 0.35 : 0.12) + (wkE < 0.2 ? 0.45 : 0);       // gaps tend to cluster; the away week is mostly skipped
      if (rnd() < skipP) { skippedLast = true; continue; }
      skippedLast = false;
      var kk = k + (rnd() < 0.2 ? 1 : (rnd() < 0.1 ? -1 : 0));               // sometimes a day late or early
      if (kk < 0 || kk >= days.length) continue;
      var at = stamp(days[kk], 17, 21);
      if (at > nowMs) continue;
      var ratings = {};
      CATS.forEach(function (c) {
        var cnt = 0, from = at - 7 * DAY;
        for (var j = log.length - 1; j >= 0 && log[j].at > from; j--) { if (log[j].at <= at && log[j].catId === c.id) cnt++; }
        noise[c.id] = 0.5 * noise[c.id] + 7 * gauss();                        // week-to-week mood that carries over a little
        // Low-volume areas (a few items a month) swing less on a single week's count, so they don't pin to 0 or 100.
        var ratio = Math.max(-1, Math.min(1.2, cnt / perWeekAvg[c.id] - 1)) * (perWeekAvg[c.id] < 1.5 ? 0.4 : 1);
        var v = 50 + (BASE[c.id] - 50) * 0.6 + 26 * ratio + noise[c.id];
        ratings[c.id] = Math.max(0, Math.min(100, Math.round(v)));
      });
      checkinHistory.push({ id: uid('h'), at: at, ratings: ratings, notes: rnd() < 0.4 ? pick(NOTES) : '' });
    }
    var lastCi = checkinHistory[checkinHistory.length - 1];

    return {
      version: 1,
      cats: CATS,
      items: items,
      tags: Object.keys(tagsUsed),
      log: log,
      checkin: lastCi ? { ratings: Object.assign({}, lastCi.ratings), at: lastCi.at, notes: lastCi.notes } : { ratings: {}, at: null, notes: '' },
      checkinHistory: checkinHistory,
      notes: { html: '', updatedAt: null },
      settings: {},
      collapse: {}
    };
  }

  /* ---------- browser: write it in ---------- */
  function seed() {
    var existing = null;
    try { existing = localStorage.getItem(KEY); } catch (e) { alert('This browser will not let the page use localStorage.'); return; }
    var hadRealLooking = false;
    if (existing) {
      try { var s = JSON.parse(existing); hadRealLooking = (s.log && s.log.length > 0) || (s.items && s.items.length > 8); } catch (e) { hadRealLooking = true; }
    }
    var host = location.hostname, local = host === 'localhost' || host === '127.0.0.1';
    if (!local && !confirm('This page is ' + location.origin + ', not localhost. Seed MOCK data into THIS browser profile\'s copy of the app? (Your phone is unaffected either way.)')) { console.log('Cancelled. Nothing changed.'); return; }
    if (hadRealLooking) {
      if (!confirm('This browser already has saved Well Tended data. Replace it with mock data?\n\nA copy will be kept under "' + BACKUP_KEY + '".')) { console.log('Cancelled. Nothing changed.'); return; }
      try { localStorage.setItem(BACKUP_KEY, existing); } catch (e) { alert('Could not save a safety copy, so nothing was changed.'); return; }
    }
    var st = buildState(Date.now(), typeof window.WT_SEED === 'number' ? window.WT_SEED : undefined);
    localStorage.setItem(KEY, JSON.stringify(st));
    console.log('Seeded mock data: ' + st.cats.length + ' categories, ' + st.items.length + ' items, ' + st.log.length + ' completions. Reloading...');
    location.reload();
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = buildState;
  else if (typeof localStorage !== 'undefined') seed();
})();
