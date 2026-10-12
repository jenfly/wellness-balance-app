// Cloud sync (sync.js) against a fake in-memory Supabase: no real network, no real Google
// sign-in — sessions are seeded straight into localStorage (mirrors signing in on a device),
// and window.fetch is a stand-in for Supabase Auth's /auth/v1/token and PostgREST's
// /rest/v1/app_data. Loads only logic.js + sync.js (not the full app/ui.js).
const {JSDOM} = require('jsdom');
const fs = require('fs');
const assert = require('assert');

const logicSrc = fs.readFileSync('../js/logic.js', 'utf8').split('\n').filter((l) => l.indexOf('if (typeof module') !== 0).join('\n');
const syncSrc = fs.readFileSync('../js/sync.js', 'utf8');
const PAGE = '<!doctype html><html><body><script>' + logicSrc + '</script><script>' + syncSrc + '</script></body></html>';

const SESSION_KEY = 'jenfly-supabase-auth', APP_KEY = 'well-tended-v1';

function boot(setup) {
  return new JSDOM(PAGE, { runScripts: 'dangerously', url: 'https://example.com/', beforeParse(w) { w.scrollTo = () => {}; setup(w); } });
}
function seedSession(win, user, overrides) {
  const s = Object.assign({ access_token: 'tok-' + user.id, refresh_token: 'ref-' + user.id, expires_at: Date.now() + 3600000, user }, overrides || {});
  win.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  return s;
}
function seedMeta(win, meta) { win.localStorage.setItem(APP_KEY + ':sync-meta', JSON.stringify(meta)); }
function readMeta(win) { const v = win.localStorage.getItem(APP_KEY + ':sync-meta'); return v ? JSON.parse(v) : null; }
function readPreSync(win) { const v = win.localStorage.getItem(APP_KEY + ':pre-sync-copy'); return v ? JSON.parse(v) : null; }
function makeCfg(initial) {
  const h = { state: initial, applied: [], pulled: 0, errors: [], statuses: [], busy: false };
  h.cfg = {
    key: APP_KEY,
    getState: () => h.state,
    applyState(doc) { h.state = JSON.parse(JSON.stringify(doc)); h.applied.push(doc); },
    busy: () => h.busy,
    onChange(st) { h.statuses.push(st); },
    onError(msg) { h.errors.push(msg); },
    onPulled() { h.pulled++; }
  };
  return h;
}

// ---------- fake Supabase ----------
function makeDb() { return { row: null, clock: 0, refreshCalls: 0, tokenSeq: 0, failAuthOnce: false, failRefresh: false, offlineOnce: false, deferPatch: false, user: null }; }
function nextTs(db) { db.clock++; return new Date(Date.UTC(2026, 0, 1, 0, 0, db.clock)).toISOString(); }
function resp(status, body) {
  return Promise.resolve({
    ok: status >= 200 && status < 300, status,
    json: () => Promise.resolve(body === undefined ? null : body),
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body))
  });
}
function query(url) {
  const q = {}, qi = url.indexOf('?');
  if (qi < 0) return q;
  url.slice(qi + 1).split('&').forEach((p) => { const kv = p.split('='); q[kv[0]] = kv[1] !== undefined ? decodeURIComponent(kv[1]) : ''; });
  return q;
}
function makeFetch(db) {
  return function (url, init) {
    init = init || {};
    const method = init.method || 'GET';
    // sync.js checks `e instanceof TypeError` using ITS OWN realm's TypeError, so the
    // rejection must be constructed with that same realm's constructor, not Node's.
    if (db.offlineOnce) { db.offlineOnce = false; var Err = db.TypeError || TypeError; return Promise.reject(new Err('Failed to fetch')); }
    if (url.indexOf('/auth/v1/token') >= 0) {
      const q = query(url);
      db.refreshCalls++;
      if (q.grant_type === 'refresh_token') {
        if (db.failRefresh) return resp(400, { error: 'invalid_grant' });
        db.tokenSeq++;
        return resp(200, { access_token: 'access-' + db.tokenSeq, refresh_token: 'refresh-' + db.tokenSeq, expires_in: 3600, user: db.user });
      }
      return resp(400, { error: 'unsupported_grant_type' });
    }
    if (url.indexOf('/rest/v1/app_data') >= 0) {
      if (db.failAuthOnce) { db.failAuthOnce = false; return resp(401, { message: 'JWT expired' }); }
      if (method === 'GET') return resp(200, db.row ? [{ doc: db.row.doc, updated_at: db.row.updated_at }] : []);
      if (method === 'POST') {
        if (db.row) return resp(409, { message: 'duplicate key value violates unique constraint' });
        const body1 = JSON.parse(init.body);
        db.row = { doc: body1.doc, updated_at: nextTs(db) };
        return resp(201, [{ doc: db.row.doc, updated_at: db.row.updated_at }]);
      }
      if (method === 'PATCH') {
        const q2 = query(url), expected = q2.updated_at ? q2.updated_at.replace(/^eq\./, '') : null;
        const body2 = JSON.parse(init.body);
        const settle = () => {
          if (!db.row || db.row.updated_at !== expected) return resp(200, []);
          db.row = { doc: body2.doc, updated_at: nextTs(db) };
          return resp(200, [{ doc: db.row.doc, updated_at: db.row.updated_at }]);
        };
        if (db.deferPatch) {
          return new Promise((resolveFetch) => {
            db._resolvePatch = () => { settle().then(resolveFetch); };
            if (db.onPatchStarted) db.onPatchStarted();
          });
        }
        return settle();
      }
    }
    return resp(404, { message: 'not found' });
  };
}

// ---------- scenarios ----------
async function scenarioA() {
  const db = makeDb(); db.user = { id: 'u1', email: 'a@example.com' };
  const dom = boot((w) => { w.fetch = makeFetch(db); seedSession(w, db.user); });
  const win = dom.window;
  const h = makeCfg({ cats: [{ id: 'c1', name: 'Fitness' }], items: [{ id: 'i1' }], v: 1 });
  await win.Sync.init(h.cfg);
  assert(db.row, 'push-new should have created the cloud row');
  assert.deepStrictEqual(db.row.doc, h.state);
  const meta = readMeta(win);
  assert.strictEqual(meta.dirty, false);
  assert.strictEqual(meta.remoteAt, db.row.updated_at);
  assert.strictEqual(win.Sync.status().phase, 'idle');
  win.close();
  console.log('scenario A (first push, no cloud copy yet) ok');
}

async function scenarioB() {
  const db = makeDb(); db.user = { id: 'u1', email: 'b@example.com' };
  const doc0 = { cats: [{ id: 'c1' }], items: [{ id: 'i1' }], v: 1 };
  db.row = { doc: JSON.parse(JSON.stringify(doc0)), updated_at: nextTs(db) };
  const dom = boot((w) => { w.fetch = makeFetch(db); seedSession(w, db.user); });
  const win = dom.window;
  const h = makeCfg(JSON.parse(JSON.stringify(doc0)));
  await win.Sync.init(h.cfg);
  const meta1 = readMeta(win);
  assert.strictEqual(meta1.dirty, false);
  assert.strictEqual(meta1.remoteAt, db.row.updated_at, 'adopt should record the cloud version');
  assert.strictEqual(h.applied.length, 0, 'adopt must not call applyState');
  h.state = Object.assign({}, h.state, { v: 2 });
  win.Sync.noteLocalChange();
  await win.Sync.syncNow();
  assert.deepStrictEqual(db.row.doc, h.state, 'the edit should have been pushed');
  assert.strictEqual(readMeta(win).dirty, false);
  win.close();
  console.log('scenario B (adopt, then push after a local edit) ok');
}

async function scenarioC() {
  const db = makeDb(); db.user = { id: 'u1', email: 'c@example.com' };
  const doc0 = { cats: [{ id: 'c1' }], items: [{ id: 'i1' }], v: 1 };
  db.row = { doc: JSON.parse(JSON.stringify(doc0)), updated_at: nextTs(db) };
  const dom = boot((w) => { w.fetch = makeFetch(db); seedSession(w, db.user); });
  const win = dom.window;
  const h = makeCfg(JSON.parse(JSON.stringify(doc0)));
  await win.Sync.init(h.cfg); // adopt
  const doc1 = { cats: [{ id: 'c1' }, { id: 'c2' }], items: [{ id: 'i1' }], v: 2 };
  db.row = { doc: doc1, updated_at: nextTs(db) }; // another device changed the cloud copy
  h.busy = true;
  await win.Sync.syncNow();
  assert.strictEqual(h.applied.length, 0, 'a pull must be deferred while the UI is mid-edit');
  h.busy = false;
  await win.Sync.syncNow();
  assert.strictEqual(h.applied.length, 1);
  assert.deepStrictEqual(h.state, doc1, 'the pull should go through once no longer busy');
  assert.strictEqual(h.pulled, 1);
  win.close();
  console.log('scenario C (pull from another device, deferred while busy) ok');
}

async function scenarioD1() {
  const db = makeDb(); db.user = { id: 'u1', email: 'd1@example.com' };
  const doc0 = { cats: [{ id: 'c1' }], items: [], v: 1 };
  db.row = { doc: JSON.parse(JSON.stringify(doc0)), updated_at: nextTs(db) };
  const dom = boot((w) => { w.fetch = makeFetch(db); seedSession(w, db.user); });
  const win = dom.window;
  const h = makeCfg(JSON.parse(JSON.stringify(doc0)));
  await win.Sync.init(h.cfg); // adopt
  h.state = Object.assign({}, h.state, { v: 2 });
  win.Sync.noteLocalChange(); // editedAt = now
  const past = new Date(Date.now() - 100000).toISOString();
  db.row = { doc: Object.assign({}, doc0, { v: 'other-device' }), updated_at: past };
  await win.Sync.syncNow();
  assert.deepStrictEqual(db.row.doc, h.state, 'local (newer) edit should win: overwrite');
  assert.strictEqual(readPreSync(win).which, 'cloud', 'the replaced cloud copy is saved once, locally');
  win.close();
  console.log('scenario D1 (conflict: local edit is newer -> overwrite) ok');
}

async function scenarioD2() {
  const db = makeDb(); db.user = { id: 'u1', email: 'd2@example.com' };
  const doc0 = { cats: [{ id: 'c1' }], items: [], v: 1 };
  db.row = { doc: JSON.parse(JSON.stringify(doc0)), updated_at: nextTs(db) };
  const dom = boot((w) => { w.fetch = makeFetch(db); seedSession(w, db.user); });
  const win = dom.window;
  const h = makeCfg(JSON.parse(JSON.stringify(doc0)));
  await win.Sync.init(h.cfg); // adopt
  h.state = Object.assign({}, h.state, { v: 'local-edit' });
  const m = readMeta(win); m.dirty = true; m.editedAt = Date.now() - 100000; // backdate this device's edit
  win.localStorage.setItem(APP_KEY + ':sync-meta', JSON.stringify(m));
  const cloudDoc = Object.assign({}, doc0, { v: 'other-device' });
  db.row = { doc: cloudDoc, updated_at: new Date(Date.now() + 5000).toISOString() }; // cloud edit is newer
  await win.Sync.syncNow();
  assert.deepStrictEqual(h.state, cloudDoc, 'the newer cloud copy should win: pull');
  assert.strictEqual(readPreSync(win).which, 'device', 'the discarded local edit is saved once, locally');
  win.close();
  console.log('scenario D2 (conflict: cloud copy is newer -> pull) ok');
}

async function scenarioE1() {
  const db = makeDb(); db.user = { id: 'u1', email: 'e1@example.com' };
  const cloudDoc = { cats: [{ id: 'cX' }], items: [{ id: 'iX' }], v: 'cloud-version' };
  db.row = { doc: cloudDoc, updated_at: nextTs(db) };
  const dom = boot((w) => { w.fetch = makeFetch(db); seedSession(w, db.user); });
  const win = dom.window;
  const localDoc = { cats: [{ id: 'c1' }, { id: 'c2' }], items: [{ id: 'i1' }], v: 'device-version' };
  const h = makeCfg(JSON.parse(JSON.stringify(localDoc)));
  await win.Sync.init(h.cfg); // first link, copies differ -> choose
  const st = win.Sync.status();
  assert.strictEqual(st.phase, 'choose');
  // st.choice is a plain object literal from inside sync.js's own realm, so compare fields
  // individually rather than via deepStrictEqual (which also checks prototype identity).
  assert.strictEqual(st.choice.cats, cloudDoc.cats.length);
  assert.strictEqual(st.choice.items, cloudDoc.items.length);
  await win.Sync.resolveChoice('cloud');
  assert.deepStrictEqual(h.state, cloudDoc, 'choosing cloud should adopt it locally');
  assert.strictEqual(h.pulled, 1);
  assert.strictEqual(readPreSync(win).which, 'device', 'the replaced local copy is saved once');
  assert.strictEqual(win.Sync.status().phase, 'idle');
  win.close();
  console.log('scenario E1 (first-link choose: use cloud copy) ok');
}

async function scenarioE2() {
  const db = makeDb(); db.user = { id: 'u1', email: 'e2@example.com' };
  const cloudDoc = { cats: [{ id: 'cX' }], items: [{ id: 'iX' }], v: 'cloud-version' };
  db.row = { doc: cloudDoc, updated_at: nextTs(db) };
  const dom = boot((w) => { w.fetch = makeFetch(db); seedSession(w, db.user); });
  const win = dom.window;
  const localDoc = { cats: [{ id: 'c1' }, { id: 'c2' }], items: [{ id: 'i1' }], v: 'device-version' };
  const h = makeCfg(JSON.parse(JSON.stringify(localDoc)));
  await win.Sync.init(h.cfg);
  assert.strictEqual(win.Sync.status().phase, 'choose');
  await win.Sync.resolveChoice('device');
  assert.deepStrictEqual(db.row.doc, localDoc, 'choosing this device should push it, overwriting the cloud');
  assert.strictEqual(h.applied.length, 0, 'local state itself is untouched');
  assert.strictEqual(readPreSync(win).which, 'cloud', 'the replaced cloud copy is saved once');
  win.close();
  console.log('scenario E2 (first-link choose: keep this device\'s copy) ok');
}

async function scenarioF() {
  const db = makeDb(); db.user = { id: 'u1', email: 'f@example.com' };
  const doc0 = { cats: [{ id: 'c1' }], items: [], v: 1 };
  db.row = { doc: JSON.parse(JSON.stringify(doc0)), updated_at: nextTs(db) };
  db.failAuthOnce = true; // the very first REST call looks expired even though the session says otherwise
  const dom = boot((w) => { w.fetch = makeFetch(db); seedSession(w, db.user); });
  const win = dom.window;
  const h = makeCfg(JSON.parse(JSON.stringify(doc0)));
  await win.Sync.init(h.cfg);
  assert.strictEqual(db.refreshCalls, 1, 'a 401 should trigger exactly one token refresh');
  const sess = JSON.parse(win.localStorage.getItem(SESSION_KEY));
  assert.strictEqual(sess.access_token, 'access-1', 'the refreshed token should now be stored');
  assert.strictEqual(win.Sync.status().phase, 'idle', 'the retried request should have gone through');
  assert.strictEqual(readMeta(win).dirty, false);
  win.close();
  console.log('scenario F (401 on a stale token, then refresh and retry) ok');
}

async function scenarioG() {
  const db = makeDb(); db.user = { id: 'u1', email: 'g@example.com' };
  const doc0 = { cats: [{ id: 'c1' }], items: [], v: 1 };
  db.row = { doc: JSON.parse(JSON.stringify(doc0)), updated_at: nextTs(db) };
  db.offlineOnce = true;
  const dom = boot((w) => { w.fetch = makeFetch(db); db.TypeError = w.TypeError; seedSession(w, db.user); });
  const win = dom.window;
  const h = makeCfg(JSON.parse(JSON.stringify(doc0)));
  await win.Sync.init(h.cfg);
  assert.strictEqual(win.Sync.status().phase, 'offline', 'a network TypeError should read as offline, not an error');
  await win.Sync.syncNow(); // connectivity recovers
  assert.strictEqual(win.Sync.status().phase, 'idle');
  assert.strictEqual(readMeta(win).dirty, false);
  win.close();
  console.log('scenario G (offline, then recovers) ok');
}

async function scenarioH() {
  const db = makeDb(); db.user = { id: 'u1', email: 'h@example.com' };
  const doc0 = { cats: [{ id: 'c1' }], items: [], v: 1 };
  db.row = { doc: JSON.parse(JSON.stringify(doc0)), updated_at: nextTs(db) };
  const dom = boot((w) => { w.fetch = makeFetch(db); seedSession(w, db.user); });
  const win = dom.window;
  const h = makeCfg(JSON.parse(JSON.stringify(doc0)));
  await win.Sync.init(h.cfg); // adopt

  h.state = Object.assign({}, h.state, { v: 'edit1' });
  win.Sync.noteLocalChange();
  db.deferPatch = true;
  const patchStarted = new Promise((res) => { db.onPatchStarted = res; });
  const p = win.Sync.syncNow();
  await patchStarted; // the push for edit1 is now in flight, held open

  h.state = Object.assign({}, h.state, { v: 'edit2' }); // edit2 lands mid-request
  win.Sync.noteLocalChange();

  db.deferPatch = false;
  db._resolvePatch();
  await p;

  assert.deepStrictEqual(db.row.doc, { cats: [{ id: 'c1' }], items: [], v: 'edit1' }, 'the push should only have carried edit1 (the snapshot taken before edit2)');
  assert.strictEqual(readMeta(win).dirty, true, 'edit2 happened after the snapshot, so it must still be marked unsynced');

  await win.Sync.syncNow(); // the next pass picks up edit2
  assert.deepStrictEqual(db.row.doc, h.state);
  assert.strictEqual(readMeta(win).dirty, false);
  win.close();
  console.log('scenario H (a local edit lands while a push is in flight) ok');
}

async function scenarioI() {
  const db = makeDb(); db.user = { id: 'u_new', email: 'new@example.com' };
  const dom = boot((w) => {
    w.fetch = makeFetch(db);
    seedSession(w, db.user);
    seedMeta(w, { userId: 'u_old', remoteAt: '2026-01-01T00:00:00.000Z', dirty: false, editedAt: null, syncedAt: Date.now() });
  });
  const win = dom.window;
  const h = makeCfg({ cats: [{ id: 'c1' }], items: [], v: 'device-data-for-new-user' });
  await win.Sync.init(h.cfg);
  const meta = readMeta(win);
  assert.strictEqual(meta.userId, 'u_new', 'meta should rebind to the newly signed-in user');
  assert.strictEqual(meta.dirty, false);
  assert(db.row, 'with no stale remoteAt carried over, this pushes fresh as a brand-new row');
  assert.deepStrictEqual(db.row.doc, h.state);
  assert.strictEqual(meta.remoteAt, db.row.updated_at);
  win.close();
  console.log('scenario I (a different user signs in: meta rebinds, no stale remoteAt) ok');
}

(async function () {
  await scenarioA();
  await scenarioB();
  await scenarioC();
  await scenarioD1();
  await scenarioD2();
  await scenarioE1();
  await scenarioE2();
  await scenarioF();
  await scenarioG();
  await scenarioH();
  await scenarioI();
  console.log('smoke12 ok');
})().catch((e) => { console.error(e); process.exit(1); });
