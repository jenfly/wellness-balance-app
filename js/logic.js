/* ---------- Data model & logic (pure, testable) ----------
state = {
  cats:  [{ id, name, color }],            // ordered; Inbox is separate and always last
  items: [{ id, catId, type, text, desc, due, freq, pinned, done, doneAt, manual, tags, order }],
  tags:  [name],                            // custom, cut across categories
  log:   [{ id, itemId, text, catId, at }], // completions, feeds the ta-da list later
  settings: { day, time }
}
type: 'note' | 'goal' | 'todo' | 'recurring'
freq: { n, unit: 'day'|'week'|'month'|'year' }   (recurring only)
due:  'YYYY-MM-DD' or null
manual: true once the item has been moved by hand (then it holds its slot instead of sorting by date)
*/
const SW = ['teal','apricot','sky','clay','sand','slate','lilac','rose','moss','plum','sage'];
const TYPES = { note: 'Note', goal: 'Goal', todo: 'To-do', recurring: 'Recurring' };
const UNIT_DAYS = { day: 1, week: 7, month: 30, year: 365 };
let _seq = Date.now();
function uid(p) { return p + (_seq++).toString(36); }
function pad(n) { return String(n).padStart(2, '0'); }
function ds(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function today() { return ds(new Date()); }
function parseDate(s) { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function addDays(s, n) { const d = parseDate(s); d.setDate(d.getDate() + n); return ds(d); }
function addFreq(s, n, unit) {
  const d = parseDate(s);
  if (unit === 'day') d.setDate(d.getDate() + n);
  else if (unit === 'week') d.setDate(d.getDate() + 7 * n);
  else if (unit === 'month') {
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
  } else d.setFullYear(d.getFullYear() + n);
  return ds(d);
}
function diffDays(s) { return Math.round((parseDate(s) - parseDate(today())) / 86400000); }
function freqDays(f) { return f.n * UNIT_DAYS[f.unit]; }
function freqText(f) { return f.n === 1 ? f.unit : f.n + ' ' + f.unit + 's'; }
// Low-frequency recurring items stay off the collapsed tile.
function isTucked(i) { return i.type === 'recurring' && !!i.freq && freqDays(i.freq) >= 60; }
function fmtDue(s) {
  const n = diffDays(s), d = parseDate(s);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n > 1 && n < 7) return d.toLocaleDateString('en-CA', { weekday: 'short' });
  if (d.getFullYear() !== new Date().getFullYear()) return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

// Dateless and hand-moved items hold their slot; auto-dated items fill the
// remaining slots in soonest-due order.
function slotSort(list) {
  const byOrder = list.slice().sort((a, b) => a.order - b.order);
  const isAuto = (i) => !i.manual && !!i.due;
  const autos = byOrder.filter(isAuto).sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.order - b.order));
  let k = 0;
  return byOrder.map((i) => (isAuto(i) ? autos[k++] : i));
}
function openSorted(state, catId) {
  const open = state.items.filter((i) => i.catId === catId && !i.done);
  return slotSort(open.filter((i) => i.pinned)).concat(slotSort(open.filter((i) => !i.pinned)));
}
function doneItems(state, catId) {
  return state.items.filter((i) => i.catId === catId && i.done).sort((a, b) => b.doneAt - a.doneAt);
}
function nextOrder(state, catId) {
  return state.items.filter((i) => i.catId === catId).reduce((m, i) => Math.max(m, i.order), -1) + 1;
}
function completeItem(state, id, now) {
  now = now || Date.now();
  const it = state.items.find((i) => i.id === id);
  if (!it) return null;
  if (it.type === 'todo') {
    if (!it.done) {
      it.done = true; it.doneAt = now;
      state.log.push({ id: uid('l'), itemId: id, text: it.text, catId: it.catId, at: now, rec: false });
      return { kind: 'done' };
    }
    state.log = state.log.filter((l) => !(l.itemId === id && l.at === it.doneAt));
    it.done = false; it.doneAt = null;
    return { kind: 'undone' };
  }
  if (it.type === 'recurring' && it.freq) {
    it.due = addFreq(ds(new Date(now)), it.freq.n, it.freq.unit);
    state.log.push({ id: uid('l'), itemId: id, text: it.text, catId: it.catId, at: now, rec: true });
    return { kind: 'reset', due: it.due };
  }
  return null;
}
function moveItem(state, id, dir) {
  const it = state.items.find((i) => i.id === id);
  if (!it) return false;
  const pinned = openSorted(state, it.catId).filter((i) => i.pinned);
  const rest = openSorted(state, it.catId).filter((i) => !i.pinned);
  const arr = it.pinned ? pinned : rest;
  // neighbours only count within the same section (regular vs "less frequent")
  const sameSection = (i) => it.pinned || isTucked(i) === isTucked(it);
  const group = arr.filter(sameSection);
  const gi = group.findIndex((i) => i.id === id), gj = gi + dir;
  if (gi < 0 || gj < 0 || gj >= group.length) return false;
  const a = arr.indexOf(group[gi]), b = arr.indexOf(group[gj]);
  const tmp = arr[a]; arr[a] = arr[b]; arr[b] = tmp;
  it.manual = true;
  pinned.concat(rest).forEach((x, n) => { x.order = n; });
  return true;
}

// Dated, open to-dos (and recurring items when asked) across every category, soonest first.
function upcomingItems(state, opts) {
  const rec = !!(opts && opts.recurring);
  return state.items
    .filter((i) => !i.done && i.due && (i.type === 'todo' || (i.type === 'recurring' && rec)))
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.order - b.order));
}
function dateBucket(due) {
  const n = diffDays(due), d = parseDate(due), now = parseDate(today());
  if (n < 0) return { key: 'earlier', label: 'Earlier' };
  if (n === 0) return { key: 'today', label: 'Today' };
  if (n === 1) return { key: 'tomorrow', label: 'Tomorrow' };
  if (n <= 7) return { key: 'week', label: 'Next 7 days' };
  const sameYear = d.getFullYear() === now.getFullYear();
  const sameMonth = sameYear && d.getMonth() === now.getMonth();
  const m = d.toLocaleDateString('en-CA', { month: 'long' });
  return { key: 'm' + d.getFullYear() + '-' + pad(d.getMonth() + 1), label: sameMonth ? 'Later in ' + m : sameYear ? m : m + ' ' + d.getFullYear() };
}

// ---------- Ta-da history and housekeeping ----------
function entryIsRecurring(state, e) {
  if (e.rec !== undefined) return !!e.rec;
  const it = state.items.find((i) => i.id === e.itemId);
  return !!(it && it.type === 'recurring');
}
// Completions inside the last `days` calendar days (today counts as day one), newest first.
function tadaEntries(state, opts) {
  const days = opts.days, rec = opts.recurring !== false;
  return state.log
    .filter((e) => diffDays(ds(new Date(e.at))) >= -(days - 1) && (rec || !entryIsRecurring(state, e)))
    .sort((a, b) => b.at - a.at);
}
function fmtPast(s) {
  const n = -diffDays(s), d = parseDate(s);
  if (n <= 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n > 1 && n < 7) return d.toLocaleDateString('en-CA', { weekday: 'short' });
  if (d.getFullYear() !== new Date().getFullYear()) return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}
function pastBucket(s) {
  const n = -diffDays(s), d = parseDate(s), now = parseDate(today());
  if (n <= 0) return { key: 'today', label: 'Today' };
  if (n === 1) return { key: 'yesterday', label: 'Yesterday' };
  if (n <= 7) return { key: 'week', label: 'Past week' };
  const sameYear = d.getFullYear() === now.getFullYear();
  const sameMonth = sameYear && d.getMonth() === now.getMonth();
  const m = d.toLocaleDateString('en-CA', { month: 'long' });
  return { key: 'm' + d.getFullYear() + '-' + pad(d.getMonth() + 1), label: sameMonth ? 'Earlier in ' + m : sameYear ? m : m + ' ' + d.getFullYear() };
}
// Done to-dos leave the tiles after doneDays; log entries leave after logDays. 0 means never.
function purgeOld(state, now, doneDays, logDays) {
  let items = 0, logs = 0;
  if (doneDays > 0) {
    const cut = now - doneDays * 86400000;
    const keep = state.items.filter((i) => !(i.done && i.doneAt && i.doneAt < cut));
    items = state.items.length - keep.length; state.items = keep;
  }
  if (logDays > 0) {
    const cut = now - logDays * 86400000;
    const keep = state.log.filter((l) => l.at >= cut);
    logs = state.log.length - keep.length; state.log = keep;
  }
  return { items, logs };
}
function clearDone(state, catId) {
  const keep = state.items.filter((i) => !(i.catId === catId && i.done));
  const n = state.items.length - keep.length;
  state.items = keep;
  return n;
}

// ---------- Weekly check-in ----------
// state.checkin = { ratings: { [catId]: 0..100 }, at: timestamp | null, notes: '' }
// 0 = neglected, 50 = balanced, 100 = over-focused. Ratings are a snapshot; only the overall check-in has a date.
function daysSince(ts) { if (!ts) return null; return Math.max(0, -diffDays(ds(new Date(ts)))); }
function checkinDue(state, thresholdDays) {
  const d = daysSince(state.checkin && state.checkin.at);
  return d === null || d >= thresholdDays;
}
function ratingLabel(v) {
  if (v == null) return 'Not set';
  if (v <= 25) return 'Neglected';
  if (v <= 40) return 'Leaning low';
  if (v <= 60) return 'Balanced';
  if (v <= 75) return 'Leaning high';
  return 'Over-focused';
}
function ratingGroups(state) {
  const r = (state.checkin && state.checkin.ratings) || {};
  const low = [], high = [];
  state.cats.forEach((c) => {
    const v = r[c.id];
    if (v == null) return;
    if (v <= 25) low.push(c); else if (v >= 76) high.push(c);
  });
  return { low, high };
}

function emptyState() {
  const t = today();
  let n = 0;
  const it = (catId, type, text, o) => Object.assign({
    id: uid('i'), catId, type, text, desc: '', due: null, freq: null, pinned: false,
    done: false, doneAt: null, manual: false, tags: [], order: n++
  }, o || {});
  return {
    version: 1,
    cats: [
      { id: 'fitness', name: 'Fitness', color: 'teal', icon: 'dumbbell' },
      { id: 'tasks', name: 'Tasks', color: 'apricot', icon: 'bag' },
      { id: 'ideas', name: 'Ideas', color: 'lilac', icon: 'book' }
    ],
    items: [
      it('fitness', 'goal', 'Walk 3 times a week', { desc: 'A goal: plain text with no due date. Good for habits you want to keep in view.' }),
      it('fitness', 'recurring', 'Stretch for 10 minutes', { due: addDays(t, 2), freq: { n: 1, unit: 'week' }, desc: 'Recurring: check it off and it comes back after the interval you set.' }),
      it('tasks', 'todo', 'Try checking this off'),
      it('tasks', 'todo', 'Book an appointment', { due: addDays(t, 5), desc: 'A to-do with a due date. Items due soonest show first on the tile.' }),
      it('tasks', 'recurring', 'Water the plants', { due: addDays(t, 1), freq: { n: 1, unit: 'week' } }),
      it('ideas', 'note', 'Tap the pencil on the Home tab to rename, recolor or reorder these tiles', { pinned: true, desc: 'Pinned items always show first. Tap the + button to add your own items.' })
    ],
    tags: [], log: [],
    checkin: { ratings: {}, at: null, notes: '' },
    notes: { html: '', updatedAt: null },
    settings: {}
  };
}
if (typeof module !== 'undefined') module.exports = { emptyState, today, addDays, uid, daysSince, checkinDue, ratingLabel, ratingGroups, entryIsRecurring, tadaEntries, fmtPast, pastBucket, purgeOld, clearDone, upcomingItems, dateBucket, openSorted, moveItem, completeItem, addFreq, isTucked, slotSort, doneItems, fmtDue, nextOrder, diffDays };
