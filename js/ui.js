(function () {
  'use strict';
  var KEY = 'well-tended-v1';
  var INBOX = { id: 'inbox', name: 'Inbox', color: 'sage', icon: 'tray' };
  var ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    left: '<path d="M14 6l-6 6 6 6"/>',
    right: '<path d="M10 6l6 6-6 6"/>',
    up: '<path d="M6 14l6-6 6 6"/>',
    down: '<path d="M6 10l6 6 6-6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>',
    grip: '<g fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></g>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    pin: '<path d="M9 4h6l-1 6 3 3H7l3-3-1-6zM12 13v7"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4.5c1-.7 2.3-1 4-1 2.7 0 3.8 1.5 6.5 1.5 1.6 0 2.8-.3 3.5-.8v8c-.7.5-1.9.8-3.5.8-2.7 0-3.8-1.5-6.5-1.5-1.7 0-3 .3-4 1z"/>',
    repeat: '<path d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    tada: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.5"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    sliders: '<path d="M6 4v16M12 4v16M18 4v16"/><circle cx="6" cy="9" r="2.2"/><circle cx="12" cy="15" r="2.2"/><circle cx="18" cy="8" r="2.2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>',
    trash: '<path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7M6 7l1 13a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8l1-13M10 11v6M14 11v6"/>',
    list: '<g fill="currentColor" stroke="none"><circle cx="4" cy="6" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="4" cy="18" r="1.5"/></g><path d="M9 6h11M9 12h11M9 18h11"/>',
    indent: '<path d="M10 6h11M10 12h11M10 18h11M3 9l4 3-4 3"/>',
    outdent: '<path d="M10 6h11M10 12h11M10 18h11M7 9l-4 3 4 3"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3.5 2"/>'
  };
  var CAT_ICONS = {
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
    utensils: '<path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 21V3c-2.2 1.5-3 4-3 7v3h3"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18.5 16.5v4M16.5 18.5h4"/>',
    home: '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-5h4v5"/>',
    bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    briefcase: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3.5 13h17"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14zM5 19l7-7"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M16 5.5a3 3 0 0 1 0 5.5M17.5 14.3c2 .6 3 2.3 3 4.7"/>',
    file: '<path d="M7 3.5h7l4 4V20.5H7zM14 3.5v4h4M9.5 12h6M9.5 16h6"/>',
    book: '<path d="M12 6c-1.5-1.5-4-2-7-2v14c3 0 5.5.5 7 2 1.5-1.5 4-2 7-2V4c-3 0-5.5.5-7 2zM12 6v14"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/>',
    coffee: '<path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2M12 3.5v2"/>',
    plane: '<path d="M21 4L3 11l6 2.5L11.5 20l2.5-5 4 1zM9 13.5L21 4"/>',
    bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-8h5l3 8M10 8l3 8M9 6h2"/>',
    paw: '<circle cx="7" cy="10" r="1.6"/><circle cx="11" cy="6.5" r="1.6"/><circle cx="16" cy="7.5" r="1.6"/><circle cx="19" cy="12" r="1.6"/><path d="M8 17c0-3 2.5-5 5-5s5 2 5 4.5c0 2-1.5 3-3.5 2.5-1.5-.4-2-.5-3-.5s-1.5.1-2.5.5C9 19.5 8 19 8 17z"/>',
    wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3M4 7.5V17a2 2 0 0 0 2 2h13V8H6.5A2.5 2.5 0 0 1 4 7.5zM16 13.5h.01"/>',
    tray: '<path d="M4 13l2.5-8h11L20 13M4 13v6h16v-6M4 13h5l1 2h4l1-2h5"/>'
  };
  var PICK_ICONS = Object.keys(CAT_ICONS).filter(function (k) { return k !== 'tray'; });
  Object.keys(CAT_ICONS).forEach(function (k) { ICONS[k] = CAT_ICONS[k]; });
  function catIcon(c, cls) { return c && c.icon && ICONS[c.icon] ? '<span class="' + (cls || 'cicon') + '">' + icon(c.icon) + '</span>' : ''; }
  function icon(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s) { return document.querySelector(s); }

  function normalize(s) {
    s.version = 1;
    s.tags = s.tags || []; s.checkin = Object.assign({ ratings: {}, at: null, notes: '' }, s.checkin || {}); s.log = s.log || []; s.settings = s.settings || {};
    s.notes = (s.notes && typeof s.notes.html === 'string') ? s.notes : { html: '', updatedAt: null };
    s.collapse = s.collapse || {};
    s.checkinHistory = Array.isArray(s.checkinHistory) ? s.checkinHistory : [];
    delete s.settings.notify; delete s.settings.day; delete s.settings.time;
    s.cats.forEach(function (c) { if (c.icon === undefined) c.icon = null; });
    s.items.forEach(function (i) { if (i.later === undefined) i.later = false; });
    return s;
  }
  function load() {
    try {
      var r = localStorage.getItem(KEY);
      if (r) {
        var s = JSON.parse(r);
        if (s && Array.isArray(s.cats) && Array.isArray(s.items)) return normalize(s);
      }
    } catch (e) { /* storage unavailable */ }
    return emptyState();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

  var state = load();
  var ui = { tab: 'tiles', openCat: null, tag: null, editTiles: false, delAsk: null, formFor: null, dateFor: null, reorder: false, showDone: false, sheet: null, resetAsk: false, showJson: false, driveBusy: false, driveStatus: null, restoreOffer: null };
  var snapshot = null, toastTimer = null;

  function catOf(id) { return id === 'inbox' ? INBOX : state.cats.find(function (c) { return c.id === id; }); }
  function allCats() { return state.cats.concat([INBOX]); }
  function tagColor(name) { var i = state.tags.indexOf(name); return SW[(Math.max(i, 0) * 3 + 1) % SW.length]; }
  function tagBadge(name) { return '<span class="tag"><i style="background:var(--' + tagColor(name) + '-dot)"></i>' + esc(name) + '</span>'; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  /* ---------- Tiles view ---------- */
  function peekRow(i) {
    var meta = '';
    if (i.pinned) meta += '<span class="pin" aria-label="Pinned">' + icon('pin') + '</span>';
    if (i.type === 'recurring') meta += '<span class="rep" aria-label="Repeats">' + icon('repeat') + '</span>';
    if (i.due) meta += '<span class="due">' + esc(fmtDue(i.due)) + '</span>';
    var lead = (i.type === 'todo' || i.type === 'recurring')
      ? '<button class="pchk" data-action="item-toggle" data-id="' + i.id + '" aria-label="Mark done: ' + esc(i.text) + '"></button>'
      : (i.type === 'goal' ? '<span class="bul" aria-label="Goal">' + icon('flag') + '</span>' : '<span class="bul"></span>');
    return '<li class="pk">' + lead + '<div class="pk-body"><span class="pk-t">' + esc(i.text) + '</span>' + (meta ? '<span class="pk-m">' + meta + '</span>' : '') + '</div></li>';
  }
  function tile(c, wide) {
    var all = openSorted(state, c.id), list;
    if (ui.tag) list = all.filter(function (i) { return i.tags.indexOf(ui.tag) >= 0; });
    else list = all.filter(function (i) { return !i.later && (!isTucked(i) || i.pinned); });
    var shown = list.slice(0, 3), more = (ui.tag ? list.length : all.length) - shown.length, inner;
    if (shown.length) inner = '<ul class="peek">' + shown.map(peekRow).join('') + '</ul>' + (more > 0 ? '<p class="more">+' + more + ' more</p>' : '');
    else inner = '<p class="empty">' + (ui.tag ? 'Nothing with this tag' : all.length ? 'Nothing due soon' : 'Tap to add something') + '</p>';
    var faded = ui.tag && !shown.length;
    return '<div class="tile sw-' + c.color + (wide ? ' wide' : '') + (faded ? ' tag-empty' : '') + '"' + (c.id !== 'inbox' ? ' data-sort="tile"' : '') + ' role="button" tabindex="0" data-action="open-cat" data-id="' + c.id + '" aria-label="Open ' + esc(c.name) + '"><h2>' + catIcon(c) + '<span>' + esc(c.name) + '</span></h2>' + inner + '</div>';
  }
  function notesSectionHTML() {
    return '<div class="card notes-card"><div class="notes-head"><h2>Notes</h2><div class="notes-toolbar">' +
      '<button type="button" class="text-btn" data-action="note-bold" aria-label="Bold"><b>B</b></button>' +
      '<button type="button" class="text-btn" data-action="note-italic" aria-label="Italic"><i>I</i></button>' +
      '<button type="button" class="text-btn" data-action="note-list" aria-label="Bullet list">' + icon('list') + '</button>' +
      '<button type="button" class="text-btn" data-action="note-outdent" aria-label="Decrease indent">' + icon('outdent') + '</button>' +
      '<button type="button" class="text-btn" data-action="note-indent" aria-label="Increase indent">' + icon('indent') + '</button>' +
      '</div></div><div id="notes-editor" class="notes-editor" contenteditable="true" data-placeholder="Jot something down…">' + state.notes.html + '</div></div>';
  }
  function iconGrid(c) {
    return '<div class="icon-grid" role="group" aria-label="Icons"><button class="ig' + (!c.icon ? ' on' : '') + '" data-action="cat-icon" data-id="' + c.id + '" data-icon="" aria-pressed="' + !c.icon + '" aria-label="No icon">' + icon('x') + '</button>' +
      PICK_ICONS.map(function (k) { return '<button class="ig' + (c.icon === k ? ' on' : '') + '" data-action="cat-icon" data-id="' + c.id + '" data-icon="' + k + '" aria-pressed="' + (c.icon === k) + '" aria-label="' + k + '">' + icon(k) + '</button>'; }).join('') + '</div>';
  }
  function editTile(c) {
    var count = state.items.filter(function (i) { return i.catId === c.id; }).length;
    var tools;
    if (ui.delAsk === c.id) {
      var opts = '<option value="inbox">Inbox</option>' + state.cats.filter(function (x) { return x.id !== c.id; }).map(function (x) { return '<option value="' + x.id + '">' + esc(x.name) + '</option>'; }).join('');
      tools = '<div class="del-confirm">' + (count ? '<label for="del-dest">Move ' + plural(count, 'item') + ' to</label><select id="del-dest">' + opts + '</select>' : '<span>Delete this category?</span>') +
        '<div class="form-actions"><button class="btn flat" data-action="cat-del-cancel">Cancel</button><button class="btn danger" data-action="cat-del-confirm" data-id="' + c.id + '">Delete</button></div></div>';
    } else {
      tools = '<div class="tile-tools"><button class="text-btn danger" data-action="cat-del-ask" data-id="' + c.id + '">Delete</button></div>';
    }
    var sw = SW.map(function (k) { return '<button class="swatch sw-' + k + '" data-action="cat-color" data-id="' + c.id + '" data-color="' + k + '" aria-label="Color ' + k + '" aria-pressed="' + (k === c.color) + '"></button>'; }).join('');
    return '<div class="tile edit sw-' + c.color + '" data-sort="tile" data-id="' + c.id + '"><div class="edit-top"><button class="icon-pick-btn" data-action="cat-icon-toggle" data-id="' + c.id + '" aria-expanded="' + (ui.iconPick === c.id) + '" aria-label="Choose icon for ' + esc(c.name) + '">' + (c.icon && ICONS[c.icon] ? icon(c.icon) : '<span class="ip-none">+</span>') + '</button><input class="name-input" data-cat-name="' + c.id + '" value="' + esc(c.name) + '" aria-label="Category name" maxlength="40">' +
      '<button class="grip" data-grip="tile" data-id="' + c.id + '" aria-label="Reorder ' + esc(c.name) + '. Drag, or use the arrow keys.">' + icon('grip') + '</button></div>' + (ui.iconPick === c.id ? iconGrid(c) : '') + '<div class="swatches">' + sw + '</div>' + tools + '</div>';
  }
  function tagChipsHTML() {
    if (!state.tags.length) return '';
    return '<div class="filters" role="group" aria-label="Filter by tag"><button class="chip' + (!ui.tag ? ' on' : '') + '" data-action="filter" data-tag="">All</button>' +
      state.tags.map(function (t) { return '<button class="chip' + (ui.tag === t ? ' on' : '') + '" data-action="filter" data-tag="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div>';
  }
  function tilesView() {
    var chips = tagChipsHTML();
    var tiles = state.cats.map(function (c, i) { return ui.editTiles ? editTile(c) : tile(c, false); }).join('');
    if (ui.editTiles) tiles += '<button class="tile add-tile" data-action="cat-add">' + icon('plus') + ' Add category</button>';
    tiles += tile(INBOX, true);
    return '<div class="toolbar">' + (chips || '<span></span>') + '<button class="text-btn" data-action="toggle-edit">' + (ui.editTiles ? 'Done' : 'Edit tiles') + '</button></div>' +
      '<div class="grid">' + tiles + '</div>' + (ui.editTiles ? '<p class="note">Drag the handle to reorder. Rename, recolor or delete here. The Inbox always stays last.</p>' : '') +
      notesSectionHTML();
  }
  /* ---------- Upcoming view ---------- */
  function upRow(i, mode, bucketKey) {
    var c = catOf(i.catId) || INBOX, meta = '';
    if (i.type === 'recurring' && i.freq) meta += '<span class="kind">' + icon('repeat') + 'every ' + esc(freqText(i.freq)) + '</span>';
    if (mode === 'category' || (bucketKey !== 'today' && bucketKey !== 'tomorrow' && bucketKey.indexOf('d') !== 0)) meta += '<span class="due">' + esc(fmtDue(i.due)) + '</span>';
    if (mode === 'date') meta += '<span class="catlabel"><i></i>' + esc(c.name) + '</span>';
    meta += i.tags.map(tagBadge).join('');
    return '<li class="row sw-' + c.color + '"><button class="chk" data-action="item-toggle" data-id="' + i.id + '" aria-label="Mark done: ' + esc(i.text) + '"></button>' +
      '<button class="row-main" data-action="up-open" data-id="' + i.id + '"><span class="row-text">' + esc(i.text) + '</span>' + (meta ? '<span class="row-meta">' + meta + '</span>' : '') + '</button></li>';
  }
  function upcomingView() {
    var rec = !!state.settings.upRecurring, mode = state.settings.upGroup === 'category' ? 'category' : 'date';
    var list = upcomingItems(state, { recurring: rec });
    var hidden = rec ? 0 : state.items.filter(function (i) { return !i.done && i.due && i.type === 'recurring'; }).length;
    var controls = '<div class="up-controls"><div class="seg two" role="radiogroup" aria-label="Sort upcoming items">' +
      '<label><input type="radio" name="up-group" value="date"' + (mode === 'date' ? ' checked' : '') + '><span>By date</span></label>' +
      '<label><input type="radio" name="up-group" value="category"' + (mode === 'category' ? ' checked' : '') + '><span>By category</span></label></div>' +
      '<label class="switch-row"><span>Show recurring</span><span class="switch"><input type="checkbox" id="up-rec" role="switch"' + (rec ? ' checked' : '') + '><span class="track"></span></span></label>' +
      (hidden ? '<p class="hint">' + plural(hidden, 'recurring item') + ' hidden.</p>' : '') + '</div>';
    var body = '';
    if (!list.length) {
      body = '<div class="placeholder"><h2>Nothing dated yet</h2><p>Give a to-do a due date and it shows up here.</p></div>';
    } else if (mode === 'date') {
      var groups = [], idx = {};
      list.forEach(function (i) {
        var b = dateBucket(i.due);
        if (!(b.key in idx)) { idx[b.key] = groups.length; groups.push({ key: b.key, label: b.label, items: [] }); }
        groups[idx[b.key]].items.push(i);
      });
      body = groups.map(function (g) {
        return '<section class="up-group"><h3 class="up-h">' + esc(g.label) + '</h3><ul class="items">' + g.items.map(function (i) { return upRow(i, 'date', g.key); }).join('') + '</ul></section>';
      }).join('');
    } else {
      body = allCats().map(function (c) { return { c: c, items: list.filter(function (i) { return i.catId === c.id; }) }; })
        .filter(function (g) { return g.items.length; })
        .map(function (g) {
          return '<section class="up-group"><h3 class="up-h cat sw-' + g.c.color + '">' + catIcon(g.c, 'cicon sm') + esc(g.c.name) + '</h3><ul class="items">' + g.items.map(function (i) { return upRow(i, 'category', ''); }).join('') + '</ul></section>';
        }).join('');
    }
    return controls + body;
  }
  /* ---------- Ta-da view ---------- */
  var TADA_WINDOWS = [[7, '7 days'], [30, '30 days'], [90, '90 days'], [365, '1 year']];
  function tadaRow(e, mode, bucketKey) {
    var c = catOf(e.catId) || INBOX, day = ds(new Date(e.at)), meta = '';
    if (entryIsRecurring(state, e)) meta += '<span class="kind">' + icon('repeat') + 'Recurring</span>';
    if (mode === 'category' || (bucketKey !== 'today' && bucketKey !== 'yesterday')) meta += '<span class="due">' + esc(fmtPast(day)) + '</span>';
    if (mode === 'date') meta += '<span class="catlabel"><i></i>' + esc(c.name) + '</span>';
    return '<li class="row tada-row sw-' + c.color + '"><div class="row-track"><div class="row-content"><span class="done-mark">' + icon('check') + '</span><div class="row-main static"><span class="row-text">' + esc(e.text) + '</span>' + (meta ? '<span class="row-meta">' + meta + '</span>' : '') + '</div></div>' +
      '<button class="row-delete" data-action="tada-delete" data-id="' + e.id + '" aria-label="Remove: ' + esc(e.text) + '">' + icon('trash') + '</button></div></li>';
  }
  function tadaView() {
    var days = state.settings.tadaDays || 7, rec = state.settings.tadaRecurring !== false, mode = state.settings.tadaGroup === 'date' ? 'date' : 'category';
    var list = tadaEntries(state, { days: days, recurring: rec });
    var label = days === 365 ? 'the past year' : 'the last ' + days + ' days';
    var win = TADA_WINDOWS.map(function (w) { return '<label><input type="radio" name="tada-days" value="' + w[0] + '"' + (w[0] === days ? ' checked' : '') + '><span>' + w[1] + '</span></label>'; }).join('');
    var controls = '<div class="up-controls"><p class="summary">' + (list.length ? '<strong>' + list.length + '</strong> done in ' + label : 'Nothing checked off in ' + label + ' yet') + '</p>' +
      '<div class="seg" role="radiogroup" aria-label="Time frame">' + win + '</div>' +
      '<div class="seg two" role="radiogroup" aria-label="Group completed items">' +
      '<label><input type="radio" name="tada-group" value="category"' + (mode === 'category' ? ' checked' : '') + '><span>By category</span></label>' +
      '<label><input type="radio" name="tada-group" value="date"' + (mode === 'date' ? ' checked' : '') + '><span>By date</span></label></div>' +
      '<label class="switch-row"><span>Show recurring</span><span class="switch"><input type="checkbox" id="tada-rec" role="switch"' + (rec ? ' checked' : '') + '><span class="track"></span></span></label></div>';
    var body = '';
    if (!list.length) {
      body = '<div class="placeholder"><h2>Nothing here yet</h2><p>Items you check off show up here, so you can see what you have been getting done.</p></div>';
    } else if (mode === 'date') {
      var groups = [], idx = {};
      list.forEach(function (e) {
        var b = pastBucket(ds(new Date(e.at)));
        if (!(b.key in idx)) { idx[b.key] = groups.length; groups.push({ key: b.key, label: b.label, items: [] }); }
        groups[idx[b.key]].items.push(e);
      });
      body = groups.map(function (g) {
        return '<section class="up-group"><h3 class="up-h">' + esc(g.label) + '</h3><ul class="items">' + g.items.map(function (e) { return tadaRow(e, 'date', g.key); }).join('') + '</ul></section>';
      }).join('');
    } else {
      body = allCats().map(function (c) { return { c: c, items: list.filter(function (e) { return e.catId === c.id; }) }; })
        .filter(function (g) { return g.items.length; })
        .map(function (g) {
          return '<section class="up-group"><h3 class="up-h cat sw-' + g.c.color + '">' + catIcon(g.c, 'cicon sm') + esc(g.c.name) + '<span class="count">' + g.items.length + '</span></h3><ul class="items">' + g.items.map(function (e) { return tadaRow(e, 'category', ''); }).join('') + '</ul></section>';
        }).join('');
    }
    return controls + body;
  }
  function keepDays(k, d) { var v = state.settings[k]; return v === undefined ? d : v; }
  function selOpts(list, cur) { return list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === cur ? ' selected' : '') + '>' + o[1] + '</option>'; }).join(''); }
  function housekeeping() {
    var r = purgeOld(state, Date.now(), keepDays('doneKeepDays', 30), keepDays('logKeepDays', 365));
    if (r.items || r.logs) { save(); return r; }
    return null;
  }
  /* ---------- Check-in view ---------- */
  var CI_HISTORY_WINDOWS = [[30, '1 month'], [90, '3 months'], [180, '6 months'], [365, '1 year']];
  function ciSummaryInner() {
    var g = ratingGroups(state), r = state.checkin.ratings;
    var rated = state.cats.filter(function (c) { return r[c.id] != null; }).length;
    function names(a) { return a.map(function (c) { return esc(c.name); }).join(', '); }
    var out = '';
    if (g.low.length) out += '<p><strong>On the low side</strong> ' + names(g.low) + '</p>';
    if (g.high.length) out += '<p><strong>On the high side</strong> ' + names(g.high) + '</p>';
    if (!out) out = '<p class="hint">' + (rated ? 'Everything feels close to balanced.' : 'Move the sliders to build your snapshot.') + '</p>';
    return out;
  }
  function ciRow(c, editing, ratings) {
    ratings = ratings || state.checkin.ratings;
    var v = ratings[c.id], set = v != null, lab = ratingLabel(v), body;
    if (editing) {
      body = '<div class="ci-track" style="--v:' + (set ? v : 50) + '"><input class="ci-range" type="range" min="0" max="100" step="1" value="' + (set ? v : 50) + '" data-ci="' + c.id + '" aria-label="' + esc(c.name) + ', from neglected to over-focused" aria-valuetext="' + lab + '"></div>';
    } else {
      body = '<div class="ci-track" role="img" aria-label="' + esc(c.name) + ': ' + lab + '" style="--v:' + (set ? v : 50) + '">' + (set ? '<span class="pip"></span>' : '<span class="ci-unset">not set</span>') + '</div>';
    }
    return '<div class="ci-row sw-' + c.color + (set ? '' : ' unset') + '"><span class="ci-name" title="' + esc(c.name) + '">' + (c.icon && ICONS[c.icon] ? catIcon(c, 'ci-ic') : '<i></i>') + '<span class="nm">' + esc(c.name) + '</span></span>' + body + '</div>';
  }
  function ciSparkSVG(pts, days, now) {
    var W = 120, H = 40, PAD = 3, BAR = 4, from = now - days * 86400000;
    function x(at) { return PAD + ((at - from) / (days * 86400000)) * (W - PAD * 2); }
    function y(v) { return PAD + (1 - v / 100) * (H - PAD * 2); }
    var mid = y(50);
    var ref = '<line x1="0" y1="' + mid.toFixed(1) + '" x2="' + W + '" y2="' + mid.toFixed(1) + '" class="ci-spark-ref"/>';
    var svgOpen = '<svg class="ci-spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="';
    if (!pts.length) return svgOpen + 'No check-ins in range">' + ref + '</svg>';
    var last = pts[pts.length - 1];
    var marks = pts.map(function (p) {
      var py = y(p.v), top = Math.min(py, mid), h = Math.max(Math.abs(py - mid), 1);
      // The bar alone is nearly invisible for a value close to the baseline, so a dot at the actual point always marks it.
      return '<rect class="ci-spark-bar" x="' + (x(p.at) - BAR / 2).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + BAR + '" height="' + h.toFixed(1) + '" rx="1"/>' +
        '<circle class="ci-spark-dot" cx="' + x(p.at).toFixed(1) + '" cy="' + py.toFixed(1) + '" r="1.8"/>';
    }).join('');
    return svgOpen + 'trend, most recently ' + ratingLabel(last.v) + '">' + ref + marks + '</svg>';
  }
  function ciSparkRow(c, inRange, days, now) {
    var pts = inRange.filter(function (e) { return e.ratings[c.id] != null; }).map(function (e) { return { at: e.at, v: e.ratings[c.id] }; });
    return '<div class="ci-row sw-' + c.color + '"><span class="ci-name" title="' + esc(c.name) + '">' + (c.icon && ICONS[c.icon] ? catIcon(c, 'ci-ic') : '<i></i>') + '<span class="nm">' + esc(c.name) + '</span></span>' + ciSparkSVG(pts, days, now) + '</div>';
  }
  function ciHistoryPicker(inRange) {
    var opts = '<option value="">Select a past check-in…</option>' + inRange.slice().reverse().map(function (e) {
      return '<option value="' + e.id + '"' + (e.id === ui.ciHistorySel ? ' selected' : '') + '>' + esc(fmtPast(ds(new Date(e.at)))) + '</option>';
    }).join('');
    return '<label class="fld ci-history-pick"><span>Review a past check-in</span><select id="ci-history-pick">' + opts + '</select></label>';
  }
  function ciHistoryViewer(entry) {
    if (!entry) return '';
    return '<div class="ci-list ci-snapshot">' + state.cats.map(function (c) { return ciRow(c, false, entry.ratings); }).join('') + '</div>' +
      (entry.notes ? '<div class="card ci-snapshot-notes"><h3 class="up-h" style="margin-top:0">Notes</h3><p>' + esc(entry.notes).replace(/\n/g, '<br>') + '</p></div>' : '');
  }
  function checkinHistorySection() {
    var history = state.checkinHistory || [];
    if (!history.length) {
      return '<hr class="ci-history-divider"><h2 class="up-h" style="margin-top:0">History</h2><p class="hint">Save a check-in to start building your history.</p>';
    }
    var days = state.settings.ciHistoryDays || 90, now = Date.now();
    var inRange = checkinHistoryInRange(history, days, now);
    var win = CI_HISTORY_WINDOWS.map(function (w) { return '<label><input type="radio" name="ci-history-days" value="' + w[0] + '"' + (w[0] === days ? ' checked' : '') + '><span>' + w[1] + '</span></label>'; }).join('');
    var entry = inRange.find(function (e) { return e.id === ui.ciHistorySel; }) || null;
    return '<hr class="ci-history-divider"><h2 class="up-h" style="margin-top:0">History</h2>' +
      '<div class="seg" role="radiogroup" aria-label="History range">' + win + '</div>' +
      '<div class="ci-list ci-sparklines">' + state.cats.map(function (c) { return ciSparkRow(c, inRange, days, now); }).join('') + '</div>' +
      ciHistoryPicker(inRange) + ciHistoryViewer(entry);
  }
  function checkinView() {
    var ci = state.checkin, d = daysSince(ci.at), edit = !!ui.ciEdit, last;
    var todayEntry = todayCheckinEntry(state);
    var notesChanged = !!todayEntry && (todayEntry.notes || '') !== (ci.notes || '');
    if (d === null) last = 'No check-in yet';
    else last = 'Last check-in <strong>' + (d === 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago') + '</strong>';
    var actions = edit
      ? '<button class="icon-btn" data-action="ci-cancel" aria-label="Cancel changes">' + icon('x') + '</button><button class="icon-btn ci-save" data-action="ci-finish" aria-label="Save check-in">' + icon('check') + '</button>'
      : '<button class="btn" data-action="ci-edit">' + icon('pencil') + ' Edit</button>';
    return '<div class="ci-head"><p class="summary">' + last + '</p><div class="ci-actions">' + actions + '</div></div>' +
      (edit ? '<p class="hint ci-hint">Drag the sliders, then tap the check mark to save.</p>' : '') +
      '<div class="ci-legend" aria-hidden="true"><span></span><div><span>Neglected</span><span>Balanced</span><span>Over-<br>focused</span></div></div>' +
      '<div id="ci-current" class="ci-list' + (edit ? ' editing' : '') + '">' + state.cats.map(function (c) { return ciRow(c, edit); }).join('') + '</div>' +
      '<div id="ci-summary" class="card ci-summary">' + ciSummaryInner() + '</div>' +
      '<div class="card reflect"><h3 class="up-h" style="margin-top:0">Reflect</h3>' +
      '<label class="fld"><span>Notes</span><textarea id="ci-notes" rows="3" placeholder="Jot down anything that comes up.">' + esc(ci.notes || '') + '</textarea></label>' +
      (notesChanged ? '<p class="hint">Notes have changed since today&rsquo;s check-in.</p><button class="btn" data-action="ci-save-notes">Save notes to today&rsquo;s check-in</button>' : '') +
      '</div>' +
      checkinHistorySection();
  }
  function updateTabDot() {
    var due = checkinDue(state, keepDays('checkinDotDays', 7));
    var dot = document.querySelector('#tabbar .tabdot');
    if (dot) dot.hidden = !due;
    var btn = document.querySelector('#tabbar [data-tab="checkin"]');
    if (btn) { if (due) btn.setAttribute('aria-label', 'Check-in, due'); else btn.removeAttribute('aria-label'); }
  }
  var PLACEHOLDERS = {
    tada: ['Ta-da list', 'Recently completed items, grouped by category, with a 7 or 30 day window. Completions are already being logged as you check things off.'],
    upcoming: ['Upcoming', 'Every dated item across all categories, with a toggle for recurring items and a switch between date order and category groups.'],
    checkin: ['Weekly check-in', 'A slider per category (neglected, balanced, over-focused) plus the reflective prompts.']
  };
  function backupBannerHTML() {
    if (!driveConfigured()) return '';
    var last = lastBackupAt();
    if (!last || daysSince(last) <= 30) return '';
    return '<div class="banner"><p>It&rsquo;s been ' + daysSince(last) + ' days since your last backup.</p><button class="btn flat" data-action="settings">Back up now</button></div>';
  }
  function renderMain() {
    var y = window.scrollY;
    var d = new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
    var body;
    if (ui.tab === 'tiles') body = tilesView();
    else if (ui.tab === 'upcoming') body = upcomingView();
    else if (ui.tab === 'tada') body = tadaView();
    else if (ui.tab === 'checkin') body = checkinView();
    else body = '<div class="placeholder"><h2>' + PLACEHOLDERS[ui.tab][0] + '</h2><p>' + PLACEHOLDERS[ui.tab][1] + '</p><p style="margin-top:10px">Next up in the build.</p></div>';
    $('#main').innerHTML = backupBannerHTML() + '<header class="top"><div><h1>Well Tended</h1><p class="date">' + esc(d) + '</p></div><button class="icon-btn" data-action="settings" aria-label="Settings">' + icon('gear') + '</button></header>' + body;
    window.scrollTo(0, y);
    var tabs = $('#tabbar').children;
    for (var k = 0; k < tabs.length; k++) { if (tabs[k].dataset.tab === ui.tab) tabs[k].setAttribute('aria-current', 'page'); else tabs[k].removeAttribute('aria-current'); }
    updateTabDot();
  }

  /* ---------- Item form (shared by inline edit/add and quick-add) ---------- */
  function formHTML(item, defCat) {
    var it = item || { type: 'todo', text: '', desc: '', due: '', freq: { n: 1, unit: 'week' }, pinned: false, later: false, tags: [], catId: defCat };
    var f = it.freq || { n: 1, unit: 'week' };
    var typeSeg = Object.keys(TYPES).map(function (k) { return '<label><input type="radio" name="f-type" value="' + k + '"' + (k === it.type ? ' checked' : '') + '><span>' + TYPES[k] + '</span></label>'; }).join('');
    var cats = allCats().map(function (c) { return '<option value="' + c.id + '"' + (c.id === it.catId ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('');
    var units = ['day', 'week', 'month', 'year'].map(function (u) { return '<option value="' + u + '"' + (u === f.unit ? ' selected' : '') + '>' + u + '(s)</option>'; }).join('');
    var tagChips = state.tags.map(function (t) { return '<label class="tagchip"><input type="checkbox" name="f-tag" value="' + esc(t) + '"' + (it.tags.indexOf(t) >= 0 ? ' checked' : '') + '><span>' + esc(t) + '</span></label>'; }).join('');
    return '<form class="form" data-form="' + (item ? item.id : 'new') + '" autocomplete="off">' +
      '<div class="seg" role="radiogroup" aria-label="Item type">' + typeSeg + '</div>' +
      '<label class="fld"><span>What</span><input id="f-text" type="text" required maxlength="200" value="' + esc(it.text) + '"></label>' +
      '<label class="fld"><span>Details (optional)</span><textarea id="f-desc" rows="2">' + esc(it.desc) + '</textarea></label>' +
      '<label class="fld" data-for="todo recurring"><span>Due date</span><div class="due-row"><input id="f-due" type="date" value="' + esc(it.due || '') + '"><button type="button" class="btn flat" data-action="due-clear">Clear</button></div><small data-for="recurring">Leave blank to start the clock from today.</small></label>' +
      '<div class="fld" data-for="recurring"><span>Repeats every</span><div class="inline"><input id="f-n" type="number" min="1" max="99" value="' + f.n + '" aria-label="Repeat interval"><select id="f-unit" aria-label="Repeat unit">' + units + '</select></div></div>' +
      '<label class="fld"><span>Category</span><select id="f-cat">' + cats + '</select></label>' +
      '<div class="fld"><span>Tags</span><div class="chips">' + tagChips + '</div><input id="f-newtag" type="text" placeholder="New tag (comma separated)" maxlength="60"></div>' +
      '<div class="check-row">' +
      '<label class="check"><input type="checkbox" id="f-pin"' + (it.pinned ? ' checked' : '') + '> Pin to top</label>' +
      '<label class="check"><input type="checkbox" id="f-later"' + (it.later ? ' checked' : '') + '> For later</label>' +
      '</div>' +
      '<div class="form-actions"><button type="submit" class="btn primary">' + (item ? 'Save' : 'Add') + '</button><button type="button" class="btn flat" data-action="form-cancel">Cancel</button>' +
      (item ? '<button type="button" class="btn flat danger push" data-action="item-delete" data-id="' + item.id + '">Delete</button>' : '') + '</div></form>';
  }
  function applyType(form) {
    var chosen = form.querySelector('input[name="f-type"]:checked');
    var type = chosen ? chosen.value : 'todo';
    form.querySelectorAll('[data-for]').forEach(function (el) { el.hidden = el.dataset['for'].split(' ').indexOf(type) < 0; });
  }
  function readForm(form) {
    var g = function (id) { return form.querySelector('#' + id); };
    var type = form.querySelector('input[name="f-type"]:checked').value;
    var text = g('f-text').value.trim();
    if (!text) { g('f-text').focus(); return null; }
    var tags = [];
    form.querySelectorAll('input[name="f-tag"]:checked').forEach(function (c) { tags.push(c.value); });
    g('f-newtag').value.split(',').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean).forEach(function (t) {
      if (state.tags.indexOf(t) < 0) state.tags.push(t);
      if (tags.indexOf(t) < 0) tags.push(t);
    });
    var due = (type === 'todo' || type === 'recurring') ? (g('f-due').value || null) : null;
    var freq = null;
    if (type === 'recurring') {
      var n = Math.max(1, parseInt(g('f-n').value, 10) || 1);
      freq = { n: n, unit: g('f-unit').value };
      if (!due) due = addFreq(today(), n, freq.unit);
    }
    return { type: type, text: text, desc: g('f-desc').value.trim(), due: due, freq: freq, pinned: g('f-pin').checked, later: g('f-later').checked, tags: tags, catId: g('f-cat').value };
  }
  function saveForm(form) {
    var v = readForm(form);
    if (!v) return;
    var id = form.dataset.form, name = catOf(v.catId).name;
    takeSnapshot();
    if (id === 'new') {
      state.items.push(Object.assign({ id: uid('i'), done: false, doneAt: null, manual: false, order: nextOrder(state, v.catId) }, v));
      toast('Added to ' + name, true);
    } else {
      var it = state.items.find(function (i) { return i.id === id; });
      if (!it) return;
      var moved = it.catId !== v.catId;
      Object.assign(it, v);
      if (v.type !== 'todo') { it.done = false; it.doneAt = null; }
      if (moved) { it.order = nextOrder(state, v.catId); it.manual = false; state.log.forEach(function (l) { if (l.itemId === it.id) l.catId = v.catId; }); toast('Moved to ' + name, true); } else toast('Saved', false);
    }
    ui.formFor = null;
    if (form.closest('.sheet')) ui.sheet = null;
    save(); renderAll();
  }

  /* ---------- Expanded tile ---------- */
  function dateRowHTML(i) {
    var editing = i.done, cur = editing ? ds(new Date(i.doneAt)) : today();
    return '<li class="row date-edit"><div class="row-content"><div class="de-main"><span class="row-text">' + esc(i.text) + '</span>' +
      '<span class="de-label">' + (editing ? 'Completed on' : 'Mark done on') + '</span></div>' +
      '<input type="date" id="de-' + i.id + '" value="' + cur + '" max="' + today() + '" aria-label="' + (editing ? 'Completed on' : 'Mark done on') + '">' +
      '<button type="button" class="icon-btn" data-action="date-cancel" data-id="' + i.id + '" aria-label="Cancel">' + icon('x') + '</button>' +
      '<button type="button" class="icon-btn de-save" data-action="date-confirm" data-id="' + i.id + '" aria-label="' + (editing ? 'Save' : 'Mark done') + '">' + icon('check') + '</button></div></li>';
  }
  function rowHTML(i) {
    if (ui.formFor === i.id) return '<li class="row editing">' + formHTML(i, i.catId) + '</li>';
    if (ui.dateFor === i.id) return dateRowHTML(i);
    var hasCheck = i.type === 'todo' || i.type === 'recurring';
    var lead = hasCheck
      ? '<button class="chk' + (i.done ? ' on' : '') + '" data-action="item-toggle" data-id="' + i.id + '" aria-label="' + (i.done ? 'Mark not done' : 'Mark done') + ': ' + esc(i.text) + '">' + (i.done ? icon('check') : '') + '</button>'
      : (i.type === 'goal' ? '<span class="lead-dot flag" aria-label="Goal">' + icon('flag') + '</span>' : '<span class="lead-dot"></span>');
    var meta = '';
    if (i.type === 'recurring' && i.freq) meta += '<span class="kind">' + icon('repeat') + 'every ' + esc(freqText(i.freq)) + '</span>';
    if (i.due && !i.done) meta += '<span class="due">' + esc(fmtDue(i.due)) + '</span>';
    meta += i.tags.map(tagBadge).join('');
    var title = '<button class="row-title" data-action="item-edit" data-id="' + i.id + '"><span class="row-text">' + esc(i.text) + '</span></button>';
    var body = (i.desc || meta) ? '<button class="row-body" data-action="item-edit" data-id="' + i.id + '">' + (i.desc ? '<span class="row-desc">' + esc(i.desc) + '</span>' : '') + (meta ? '<span class="row-meta">' + meta + '</span>' : '') + '</button>' : '';
    var ctl = '';
    if (!i.done) ctl = '<button class="icon-btn" data-action="item-pin" data-id="' + i.id + '" aria-pressed="' + i.pinned + '" aria-label="' + (i.pinned ? 'Unpin' : 'Pin') + '">' + icon('pin') + '</button>' +
      '<button class="icon-btn" data-action="item-later" data-id="' + i.id + '" aria-pressed="' + i.later + '" aria-label="' + (i.later ? 'Remove from For later' : 'Move to For later') + '">' + icon('clock') + '</button>' +
      '<button class="grip" data-grip="item" data-id="' + i.id + '" aria-label="Reorder. Drag, or use the arrow keys.">' + icon('grip') + '</button>';
    else if (i.type === 'todo' && i.doneAt) ctl = '<button type="button" class="text-btn done-date" data-action="date-edit" data-id="' + i.id + '">' + esc(fmtPast(ds(new Date(i.doneAt)))) + '</button>';
    var top = '<div class="row-top">' + lead + title + '<span class="row-ctl">' + ctl + '</span></div>';
    return '<li class="row' + (i.done ? ' done' : '') + '"' + (i.done ? '' : ' data-sort="item" data-id="' + i.id + '" data-group="' + (i.pinned ? 'p' : 'u') + '"') + '><div class="row-track"><div class="row-content">' + top + body + '</div>' +
      '<button class="row-delete" data-action="item-delete" data-id="' + i.id + '" aria-label="Delete: ' + esc(i.text) + '">' + icon('trash') + '</button></div></li>';
  }
  function collapsibleSectionHTML(sec, title, hint, items, open) {
    return '<h3 class="sec-title"><button type="button" class="sec-toggle" data-action="toggle-sec" data-sec="' + sec + '" aria-expanded="' + open + '">' +
      '<span>' + esc(title) + ' (' + items.length + ')</span>' + icon(open ? 'up' : 'down') + '</button></h3>' +
      (hint ? '<p class="sec-hint">' + hint + '</p>' : '') +
      (open ? '<ul class="items">' + items.map(rowHTML).join('') + '</ul>' : '');
  }
  function renderOverlay() {
    var root = $('#overlay-root');
    swipeOpen = null; swp = null;
    if (!ui.openCat) { root.innerHTML = ''; document.body.classList.remove('lock'); return; }
    var c = catOf(ui.openCat);
    if (!c) { ui.openCat = null; renderOverlay(); return; }
    var prev = root.querySelector('.overlay'), st = prev ? prev.scrollTop : 0;
    var tagged = function (i) { return !ui.tag || i.tags.indexOf(ui.tag) >= 0; };
    var open = openSorted(state, c.id).filter(tagged), done = doneItems(state, c.id).filter(tagged);
    var main = open.filter(function (i) { return !i.later && (!isTucked(i) || i.pinned); });
    var less = open.filter(function (i) { return !i.later && isTucked(i) && !i.pinned; });
    var later = open.filter(function (i) { return i.later; });
    var cs = (state.collapse && state.collapse[c.id]) || {};
    var top = '';
    var html = '<div class="overlay sw-' + c.color + '" role="dialog" aria-modal="true" aria-label="' + esc(c.name) + '">' +
      '<div class="ov-head"><div class="in"><button class="icon-btn" data-action="close-overlay" aria-label="Back to tiles">' + icon('left') + '</button><h2>' + catIcon(c) + '<span>' + esc(c.name) + '</span></h2>' +
      '</div>' + (state.tags.length ? '<div class="in">' + tagChipsHTML() + '</div>' : '') + '</div>' +
      '<div class="ov-body">' + top + (main.length ? '<h3 class="sec-title">Current</h3><ul class="items">' + main.map(rowHTML).join('') + '</ul>' : '') +
      (less.length ? collapsibleSectionHTML('less', 'Less frequent', 'Repeats every 2 months or less often.', less, !!cs.less) : '') +
      (later.length ? collapsibleSectionHTML('later', 'For later', null, later, !!cs.later) : '') +
      (!open.length ? '<p class="hint">' + (ui.tag ? 'Nothing with this tag' : 'Nothing open here. Tap + to add something.') + '</p>' : '') +
      (done.length ? '<div class="done-bar"><button class="done-toggle" data-action="toggle-done" aria-expanded="' + ui.showDone + '">Done (' + done.length + ') ' + (ui.showDone ? 'hide' : 'show') + '</button><button class="text-btn" data-action="clear-done">Clear</button></div>' + (ui.showDone ? '<ul class="items">' + done.map(rowHTML).join('') + '</ul>' : '') : '') +
      '</div></div>';
    root.innerHTML = html;
    root.querySelector('.overlay').scrollTop = st;
    root.querySelectorAll('form[data-form]').forEach(applyType);
    document.body.classList.add('lock');
  }

  /* ---------- Sheets ---------- */
  function backupSectionHTML() {
    if (!driveConfigured()) {
      return '<section><h4>Backup and restore</h4><p class="hint">Back up to Google Drive and restore from it. Needs a one-time setup first &mdash; see README &ldquo;Setting up Google Drive backup&rdquo;.</p></section>';
    }
    if (ui.restoreOffer) {
      var r = ui.restoreOffer, when = new Date(r.exportedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
      var catN = r.state.cats.length, itemN = r.state.items.length;
      var counts = catN + (catN === 1 ? ' category' : ' categories') + ', ' + itemN + (itemN === 1 ? ' item' : ' items');
      return '<section><h4>Backup and restore</h4><p class="hint">Backup from ' + esc(when) + ' &mdash; ' + counts + '. Restoring replaces everything currently on this device.</p>' +
        '<div class="form-actions"><button class="btn primary" data-action="restore-confirm">Restore</button><button class="btn" data-action="restore-cancel">Cancel</button></div></section>';
    }
    var last = lastBackupAt(), status = last ? 'Last backed up ' + agoText(last) + '.' : 'Never backed up.';
    return '<section><h4>Backup and restore</h4><p class="hint">' + esc(status) + '</p>' +
      '<div class="form-actions"><button class="btn" data-action="backup-drive"' + (ui.driveBusy ? ' disabled' : '') + '>Back up to Drive</button><button class="btn" data-action="restore-drive"' + (ui.driveBusy ? ' disabled' : '') + '>Restore</button></div>' +
      (ui.driveStatus ? '<p class="hint">' + esc(ui.driveStatus) + '</p>' : '') + '</section>';
  }
  function tagsSectionHTML() {
    var body = state.tags.length
      ? '<div class="tag-manage">' + state.tags.map(function (t) {
          return '<span class="tag-pill">' + esc(t) + '<button type="button" data-action="tag-delete" data-tag="' + esc(t) + '" aria-label="Delete tag ' + esc(t) + '">' + icon('x') + '</button></span>';
        }).join('') + '</div>'
      : '<p class="hint">No tags yet &mdash; add one from an item&rsquo;s edit form.</p>';
    return '<section><h4>Tags</h4>' + body + '</section>';
  }
  function settingsHTML() {
    return backupSectionHTML() +
      tagsSectionHTML() +
      '<section><h4>Check-in reminder</h4><p class="hint">Well Tended shows a dot on the Check-in tab when it&rsquo;s been a while &mdash; no push notifications.</p>' +
      '<label class="fld"><span>Show a dot on the Check-in tab after</span><select id="s-dotdays">' + selOpts([[7, '7 days'], [10, '10 days'], [14, '14 days'], [21, '21 days'], [30, '30 days']], keepDays('checkinDotDays', 7)) + '</select></label></section>' +
      '<section><h4>Housekeeping</h4><label class="fld"><span>Remove done items from tiles after</span><select id="s-donekeep">' + selOpts([[7, '7 days'], [30, '30 days'], [90, '90 days'], [0, 'Never']], keepDays('doneKeepDays', 30)) + '</select></label>' +
      '<label class="fld"><span>Keep Ta-da history for</span><select id="s-logkeep">' + selOpts([[365, '1 year'], [730, '2 years'], [0, 'Forever']], keepDays('logKeepDays', 365)) + '</select></label>' +
      '<p class="hint">Items removed from tiles stay in your Ta-da history. Changes apply right away.</p></section>' +
      '<section><h4>Data</h4><div class="form-actions"><button class="btn" data-action="copy-json">Copy data as JSON</button><button class="btn' + (ui.resetAsk ? ' primary' : '') + '" data-action="reset-data">' + (ui.resetAsk ? 'Tap again to erase everything' : 'Erase all data') + '</button></div>' +
      (ui.showJson ? '<textarea id="json-out" readonly aria-label="Data as JSON">' + esc(JSON.stringify(state, null, 2)) + '</textarea>' : '') + '</section>';
  }
  function renderSheet() {
    var root = $('#sheet-root');
    if (!ui.sheet) { root.innerHTML = ''; return; }
    var isAdd = ui.sheet.kind === 'add';
    root.innerHTML = '<div class="backdrop" data-action="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="' + (isAdd ? 'Quick add' : 'Settings') + '"><div class="sheet-head"><h3>' + (isAdd ? 'Quick add' : 'Settings') + '</h3><button class="icon-btn" data-action="close-sheet" aria-label="Close">' + icon('x') + '</button></div>' +
      (isAdd ? formHTML(null, ui.sheet.catId) : settingsHTML()) + '</div>';
    root.querySelectorAll('form[data-form]').forEach(applyType);
    if (ui.showJson) { var t = $('#json-out'); if (t) { t.focus(); t.select(); } }
  }
  function renderAll() { renderMain(); renderOverlay(); renderSheet(); }

  /* ---------- Back-button navigation ----------
     Push one history entry per open overlay/form/sheet layer, and one more
     for being away from the Home tab, so the phone's hardware/gesture back
     button unwinds one step at a time instead of exiting the app. Switching
     directly between two non-Home tabs doesn't add a step of its own (there's
     only one "away from Home" level) — back from any tab returns to Home,
     matching the usual Android bottom-nav convention. closeNavLayersTo() is
     idempotent so it's safe to run after both a real popstate (hardware back)
     and our own history.go() (an in-app close/tab switch). */
  function navLayers() { return (ui.tab !== 'tiles' ? 1 : 0) + (ui.openCat ? 1 : 0) + (ui.formFor ? 1 : 0) + (ui.sheet ? 1 : 0); }
  function closeNavLayersTo(target) {
    while (navLayers() > target) {
      if (ui.sheet) { ui.sheet = null; ui.restoreOffer = null; ui.driveStatus = null; }
      else if (ui.formFor) { ui.formFor = null; }
      else if (ui.openCat) { ui.openCat = null; ui.dateFor = null; }
      else if (ui.tab !== 'tiles') { ui.tab = 'tiles'; }
      else break;
    }
  }
  function syncNavHistory() {
    var want = navLayers(), have = (history.state && history.state.wtDepth) || 0;
    if (want > have) { for (var i = have; i < want; i++) history.pushState({ wtDepth: i + 1 }, ''); }
    else if (want < have) { history.go(want - have); }
  }
  window.addEventListener('popstate', function (e) {
    var before = navLayers(), beforeTab = ui.tab;
    closeNavLayersTo((e.state && e.state.wtDepth) || 0);
    if (navLayers() !== before) { renderAll(); if (ui.tab !== beforeTab) window.scrollTo(0, 0); }
  });

  /* ---------- Toast and undo ---------- */
  function takeSnapshot() { snapshot = JSON.stringify({ cats: state.cats, items: state.items, tags: state.tags, log: state.log, checkin: state.checkin, settings: state.settings }); }
  function toast(msg, withUndo) {
    var el = $('#toast');
    el.innerHTML = '<span>' + esc(msg) + '</span>' + (withUndo ? '<button data-action="undo">Undo</button>' : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 5000);
  }

  /* ---------- Google Drive backup ----------
     One-time setup: see README "Setting up Google Drive backup". Uses the
     drive.file scope, which only ever grants access to the single backup
     file this app creates, never the rest of the user's Drive. */
  var GOOGLE_CLIENT_ID = '987428503881-rdrpgllfpqnr5gnviqpmrihmmkuqt2o7.apps.googleusercontent.com';
  var DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
  var BACKUP_FILENAME = 'well-tended-backup.json';
  var FILEID_KEY = KEY + ':drive-file-id';
  var LASTBACKUP_KEY = KEY + ':last-backup';

  var gisReady = false, tokenClient = null, cachedToken = null, cachedTokenExpiresAt = 0;

  function driveConfigured() { return GOOGLE_CLIENT_ID.indexOf('YOUR_CLIENT_ID') !== 0; }
  function lastBackupAt() { try { var v = localStorage.getItem(LASTBACKUP_KEY); return v ? Number(v) : null; } catch (e) { return null; } }
  function setLastBackupAt(ms) { try { localStorage.setItem(LASTBACKUP_KEY, String(ms)); } catch (e) { /* ignore */ } }
  function driveFileId() { try { return localStorage.getItem(FILEID_KEY); } catch (e) { return null; } }
  function setDriveFileId(id) { try { localStorage.setItem(FILEID_KEY, id); } catch (e) { /* ignore */ } }
  function agoText(ms) { var d = daysSince(ms); return d === 0 ? 'today' : d === 1 ? 'yesterday' : d + ' days ago'; }

  function loadGis() {
    return new Promise(function (resolve, reject) {
      if (gisReady && window.google && window.google.accounts) { resolve(); return; }
      var s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = function () { gisReady = true; resolve(); };
      s.onerror = function () { reject(new Error('gis-load-failed')); };
      document.head.appendChild(s);
    });
  }

  // Reuses the in-memory token while valid, then tries a silent (prompt-less)
  // renewal before falling back to the full consent screen.
  function getAccessToken(forceConsent) {
    return new Promise(function (resolve, reject) {
      if (!forceConsent && cachedToken && Date.now() < cachedTokenExpiresAt) { resolve(cachedToken); return; }
      if (!tokenClient) {
        tokenClient = google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CLIENT_ID, scope: DRIVE_SCOPE, callback: function () {} });
      }
      tokenClient.callback = function (resp) {
        if (resp.error) {
          if (!forceConsent) { getAccessToken(true).then(resolve, reject); } else { reject(resp); }
          return;
        }
        cachedToken = resp.access_token;
        cachedTokenExpiresAt = Date.now() + (Number(resp.expires_in) || 3600) * 1000 - 60000;
        resolve(resp.access_token);
      };
      tokenClient.requestAccessToken({ prompt: forceConsent ? 'consent' : '' });
    });
  }

  function findBackupFileId(token) {
    var q = encodeURIComponent("name='" + BACKUP_FILENAME + "' and trashed=false");
    return fetch('https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=files(id,name)', { headers: { Authorization: 'Bearer ' + token } })
      .then(function (res) { if (!res.ok) throw new Error('find-failed'); return res.json(); })
      .then(function (data) {
        var id = (data.files && data.files[0]) ? data.files[0].id : null;
        if (id) setDriveFileId(id);
        return id;
      });
  }

  function downloadBackup(token, fileId) {
    return fetch('https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media', { headers: { Authorization: 'Bearer ' + token } })
      .then(function (res) { if (!res.ok) throw new Error('download-failed'); return res.text(); });
  }

  function uploadBackup(token, jsonContent) {
    function withId(fileId) {
      if (fileId) {
        return fetch('https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media', {
          method: 'PATCH', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: jsonContent
        }).then(function (res) { if (!res.ok) throw new Error('upload-failed'); setDriveFileId(fileId); });
      }
      var boundary = 'welltendedbackup';
      var metadata = { name: BACKUP_FILENAME, mimeType: 'application/json' };
      var body = '--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) + '\r\n' +
        '--' + boundary + '\r\nContent-Type: application/json\r\n\r\n' + jsonContent + '\r\n--' + boundary + '--';
      return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/related; boundary=' + boundary }, body: body
      }).then(function (res) { if (!res.ok) throw new Error('upload-failed'); return res.json(); })
        .then(function (data) { if (data && data.id) setDriveFileId(data.id); });
    }
    var cached = driveFileId();
    return cached ? withId(cached) : findBackupFileId(token).then(withId);
  }

  function doBackup() {
    if (!driveConfigured()) { toast('Backup not set up yet — see README "Setting up Google Drive backup".', false); return; }
    ui.driveBusy = true; ui.driveStatus = 'Connecting to Google…'; renderSheet();
    loadGis()
      .then(function () { return getAccessToken(); })
      .then(function (token) {
        ui.driveStatus = 'Backing up…'; renderSheet();
        var content = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state: state });
        return uploadBackup(token, content);
      })
      .then(function () {
        setLastBackupAt(Date.now());
        ui.driveBusy = false; ui.driveStatus = null; renderSheet();
        toast('Backed up to Google Drive.', false);
      })
      .catch(function () {
        ui.driveBusy = false; ui.driveStatus = null; renderSheet();
        toast('Backup to Google Drive failed — try again.', false);
      });
  }

  // Downloads and validates the backup first, then offers it for confirmation
  // in the sheet rather than asking the user to commit to a restore blind.
  function doRestoreCheck() {
    if (!driveConfigured()) { toast('Backup not set up yet — see README "Setting up Google Drive backup".', false); return; }
    ui.driveBusy = true; ui.driveStatus = 'Connecting to Google…'; renderSheet();
    loadGis()
      .then(function () { return getAccessToken(); })
      .then(function (token) {
        ui.driveStatus = 'Looking for a backup…'; renderSheet();
        return findBackupFileId(token).then(function (fileId) {
          if (!fileId) throw new Error('no-backup');
          return downloadBackup(token, fileId);
        });
      })
      .then(function (content) {
        var data = JSON.parse(content);
        if (!data || data.version !== 1 || !data.state || !Array.isArray(data.state.cats) || !Array.isArray(data.state.items)) {
          throw new Error('invalid-backup');
        }
        ui.driveBusy = false; ui.driveStatus = null; ui.restoreOffer = data; renderSheet();
      })
      .catch(function (err) {
        ui.driveBusy = false; ui.driveStatus = null; renderSheet();
        var msg = err && err.message === 'no-backup' ? 'No backup found on Google Drive.'
          : err && err.message === 'invalid-backup' ? 'That backup file could not be read.'
          : 'Restore from Google Drive failed — try again.';
        toast(msg, false);
      });
  }

  function doRestoreConfirm() {
    if (!ui.restoreOffer) return;
    takeSnapshot();
    state = normalize(ui.restoreOffer.state);
    ui.restoreOffer = null; ui.sheet = null; ui.openCat = null; ui.tag = null;
    save(); renderAll();
    toast('Restored from Google Drive.', true);
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t) return;
    var a = t.dataset.action, id = t.dataset.id, it;
    switch (a) {
      case 'tab': ui.tab = t.dataset.tab; ui.editTiles = false; ui.delAsk = null; if (ui.tab !== 'checkin') { ui.ciEdit = false; ui.ciDraft = null; ui.ciHistorySel = null; } renderMain(); window.scrollTo(0, 0); break;
      case 'open-cat': ui.openCat = id; ui.formFor = null; ui.dateFor = null; ui.reorder = false; ui.showDone = false; renderOverlay(); break;
      case 'close-overlay': ui.openCat = null; ui.formFor = null; ui.dateFor = null; renderAll(); break;
      case 'filter': ui.tag = t.dataset.tag || null; renderMain(); renderOverlay(); break;
      case 'toggle-edit': ui.editTiles = !ui.editTiles; ui.delAsk = null; ui.iconPick = null; renderMain(); break;
      case 'note-bold': document.execCommand('bold'); syncNotes(); break;
      case 'note-italic': document.execCommand('italic'); syncNotes(); break;
      case 'note-list': document.execCommand('insertUnorderedList'); syncNotes(); break;
      case 'note-indent': document.execCommand('indent'); syncNotes(); break;
      case 'note-outdent': document.execCommand('outdent'); syncNotes(); break;
      case 'cat-move': {
        var i = state.cats.findIndex(function (c) { return c.id === id; }), j = i + Number(t.dataset.dir);
        if (i >= 0 && j >= 0 && j < state.cats.length) { var tmp = state.cats[i]; state.cats[i] = state.cats[j]; state.cats[j] = tmp; save(); renderMain(); }
        break;
      }
      case 'cat-icon-toggle': ui.iconPick = ui.iconPick === id ? null : id; renderMain(); break;
      case 'cat-icon': catOf(id).icon = t.dataset.icon || null; ui.iconPick = null; save(); renderMain(); break;
      case 'cat-color': catOf(id).color = t.dataset.color; save(); renderMain(); break;
      case 'cat-add': {
        var used = state.cats.map(function (c) { return c.color; });
        var free = SW.filter(function (k) { return used.indexOf(k) < 0; });
        state.cats.push({ id: uid('c'), name: 'New category', color: (free[0] || SW[0]), icon: null });
        save(); renderMain(); break;
      }
      case 'cat-del-ask': ui.delAsk = id; renderMain(); break;
      case 'cat-del-cancel': ui.delAsk = null; renderMain(); break;
      case 'cat-del-confirm': {
        var sel = $('#del-dest'), dest = sel ? sel.value : 'inbox';
        takeSnapshot();
        state.items.filter(function (x) { return x.catId === id; }).forEach(function (x) { x.catId = dest; x.order = nextOrder(state, dest); x.manual = false; });
        state.log.forEach(function (l) { if (l.catId === id) l.catId = dest; });
        delete state.checkin.ratings[id];
        delete state.collapse[id];
        state.cats = state.cats.filter(function (c) { return c.id !== id; });
        ui.delAsk = null; save(); renderMain(); toast('Category deleted', true); break;
      }
      case 'item-toggle': {
        takeSnapshot();
        var r = completeItem(state, id);
        if (r) { save(); renderAll(); if (r.kind === 'done') toast('Done. Added to your ta-da list.', true); else if (r.kind === 'reset') toast('Done. Next due ' + fmtDue(r.due) + '.', true); }
        break;
      }
      case 'date-edit': ui.dateFor = id; renderOverlay(); break;
      case 'date-cancel': ui.dateFor = null; renderOverlay(); break;
      case 'date-confirm': {
        var dIn = $('#overlay-root #de-' + id), dVal = dIn && dIn.value;
        it = state.items.find(function (x) { return x.id === id; });
        if (!it || !dVal) break;
        var ms = Math.min(parseDate(dVal).getTime(), Date.now());
        takeSnapshot();
        if (it.done) {
          var oldAt = it.doneAt;
          it.doneAt = ms;
          var log = state.log.find(function (l) { return l.itemId === id && l.at === oldAt; });
          if (log) log.at = ms;
          ui.dateFor = null; save(); renderOverlay(); toast('Completion date updated', true);
        } else {
          var r2 = completeItem(state, id, ms);
          ui.dateFor = null;
          if (r2) { save(); renderAll(); if (r2.kind === 'done') toast('Done. Added to your ta-da list.', true); else if (r2.kind === 'reset') toast('Done. Next due ' + fmtDue(r2.due) + '.', true); }
        }
        break;
      }
      case 'item-pin': it = state.items.find(function (x) { return x.id === id; }); if (it) { it.pinned = !it.pinned; if (it.pinned) it.later = false; save(); renderAll(); } break;
      case 'item-later': it = state.items.find(function (x) { return x.id === id; }); if (it) { it.later = !it.later; if (it.later) it.pinned = false; save(); renderAll(); } break;
      case 'item-up': if (moveItem(state, id, -1)) { save(); renderAll(); } break;
      case 'item-down': if (moveItem(state, id, 1)) { save(); renderAll(); } break;
      case 'up-open':
        it = state.items.find(function (x) { return x.id === id; });
        if (it) { ui.openCat = it.catId; ui.formFor = it.id; ui.reorder = false; ui.showDone = false; renderAll(); var f4 = $('#overlay-root #f-text'); if (f4) f4.focus(); }
        break;
      case 'item-edit': ui.formFor = id; ui.dateFor = null; renderOverlay(); var f1 = $('#overlay-root #f-text'); if (f1) f1.focus(); break;
      case 'item-add': ui.formFor = 'new'; ui.dateFor = null; renderOverlay(); var f2 = $('#overlay-root #f-text'); if (f2) f2.focus(); break;
      case 'item-delete': takeSnapshot(); state.items = state.items.filter(function (x) { return x.id !== id; }); ui.formFor = null; save(); renderAll(); toast('Deleted', true); break;
      case 'tada-delete': takeSnapshot(); state.log = state.log.filter(function (x) { return x.id !== id; }); save(); renderMain(); toast('Removed from Ta-da', true); break;
      case 'due-clear': { var dueInput = t.closest('form').querySelector('#f-due'); dueInput.value = ''; dueInput.focus(); break; }
      case 'form-cancel': if (t.closest('.sheet')) ui.sheet = null; else ui.formFor = null; renderAll(); break;
      case 'toggle-reorder': ui.reorder = !ui.reorder; renderOverlay(); break;
      case 'clear-done': {
        takeSnapshot();
        var cleared = clearDone(state, ui.openCat);
        if (cleared) { save(); renderAll(); toast('Cleared ' + plural(cleared, 'done item') + '. They stay in your Ta-da history.', true); }
        break;
      }
      case 'ci-edit': ui.ciEdit = true; ui.ciDraft = JSON.stringify(state.checkin.ratings); renderMain(); break;
      case 'ci-cancel': if (ui.ciDraft) state.checkin.ratings = JSON.parse(ui.ciDraft); ui.ciEdit = false; ui.ciDraft = null; save(); renderMain(); break;
      case 'ci-finish': saveCheckin(state); ui.ciEdit = false; ui.ciDraft = null; save(); renderMain(); toast('Check-in saved', false); break;
      case 'ci-save-notes': updateTodayCheckinNotes(state, state.checkin.notes); save(); renderMain(); toast('Notes saved to today’s check-in', false); break;
      case 'toggle-done': ui.showDone = !ui.showDone; renderOverlay(); break;
      case 'toggle-sec': {
        var sec = t.dataset.sec; state.collapse = state.collapse || {};
        var cc = state.collapse[ui.openCat] = state.collapse[ui.openCat] || {};
        cc[sec] = !cc[sec]; save(); renderOverlay(); break;
      }
      case 'fab': ui.formFor = null; ui.sheet = { kind: 'add', catId: ui.openCat || 'inbox' }; renderAll(); var f3 = $('#sheet-root #f-text'); if (f3) f3.focus(); break;
      case 'settings': ui.sheet = { kind: 'settings' }; ui.resetAsk = false; ui.showJson = false; ui.restoreOffer = null; ui.driveStatus = null; renderSheet(); break;
      case 'close-sheet': ui.sheet = null; ui.restoreOffer = null; ui.driveStatus = null; renderSheet(); break;
      case 'tag-delete': {
        var tg = t.dataset.tag;
        takeSnapshot();
        state.tags = state.tags.filter(function (x) { return x !== tg; });
        state.items.forEach(function (x) { var ix = x.tags.indexOf(tg); if (ix >= 0) x.tags.splice(ix, 1); });
        if (ui.tag === tg) ui.tag = null;
        save(); renderAll();
        toast('Deleted tag “' + tg + '”.', true);
        break;
      }
      case 'undo':
        if (snapshot) { var s = JSON.parse(snapshot); state.cats = s.cats; state.items = s.items; state.tags = s.tags; state.log = s.log; state.checkin = s.checkin; state.settings = s.settings; snapshot = null; save(); renderAll(); }
        $('#toast').hidden = true; break;
      case 'reset-data':
        if (!ui.resetAsk) { ui.resetAsk = true; renderSheet(); }
        else { state = emptyState(); ui.resetAsk = false; ui.sheet = null; ui.openCat = null; ui.tag = null; save(); renderAll(); toast('All data erased', false); }
        break;
      case 'copy-json':
        (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(JSON.stringify(state, null, 2)) : Promise.reject()).then(function () { toast('Copied', false); }).catch(function () { ui.showJson = true; renderSheet(); });
        break;
      case 'backup-drive': doBackup(); break;
      case 'restore-drive': doRestoreCheck(); break;
      case 'restore-confirm': doRestoreConfirm(); break;
      case 'restore-cancel': ui.restoreOffer = null; renderSheet(); break;
    }
    syncNavHistory();
  });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('.tile[role="button"]')) {
      e.preventDefault(); ui.openCat = e.target.dataset.id; ui.formFor = null; ui.reorder = false; ui.showDone = false; renderOverlay();
    } else if (e.key === 'Escape') {
      if (ui.sheet) { ui.sheet = null; renderSheet(); }
      else if (ui.formFor) { ui.formFor = null; renderOverlay(); }
      else if (ui.openCat) { ui.openCat = null; renderAll(); }
    } else return;
    syncNavHistory();
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'f-type') applyType(t.closest('form'));
    else if (t.id === 'f-pin' && t.checked) { var fp = t.closest('form').querySelector('#f-later'); if (fp) fp.checked = false; }
    else if (t.id === 'f-later' && t.checked) { var fl = t.closest('form').querySelector('#f-pin'); if (fl) fl.checked = false; }
    else if (t.matches && t.matches('[data-cat-name]')) {
      var c = catOf(t.dataset.catName), v = t.value.trim();
      if (c && v) { c.name = v; save(); } else if (c) t.value = c.name;
    } else if (t.dataset && t.dataset.ci) { save();
    } else if (t.id === 'ci-notes') { state.checkin.notes = t.value; save(); renderMain();
    } else if (t.name === 'ci-history-days') { state.settings.ciHistoryDays = Number(t.value); ui.ciHistorySel = null; save(); renderMain();
    } else if (t.id === 'ci-history-pick') { ui.ciHistorySel = t.value || null; renderMain();
    } else if (t.id === 's-dotdays') { state.settings.checkinDotDays = Number(t.value); save(); updateTabDot();
    } else if (t.id === 'tada-rec') { state.settings.tadaRecurring = t.checked; save(); renderMain();
    } else if (t.name === 'tada-days') { state.settings.tadaDays = Number(t.value); save(); renderMain();
    } else if (t.name === 'tada-group') { state.settings.tadaGroup = t.value; save(); renderMain();
    } else if (t.id === 's-donekeep' || t.id === 's-logkeep') {
      state.settings[t.id === 's-donekeep' ? 'doneKeepDays' : 'logKeepDays'] = Number(t.value);
      save();
      var hk = housekeeping();
      if (hk) { renderAll(); toast('Removed ' + plural(hk.items, 'done item') + (hk.logs ? ' and ' + plural(hk.logs, 'history entry').replace('entrys', 'entries') : ''), false); }
    } else if (t.id === 'up-rec') { state.settings.upRecurring = t.checked; save(); renderMain();
    } else if (t.name === 'up-group') { state.settings.upGroup = t.value; save(); renderMain();
    }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('form[data-form]');
    if (f) { e.preventDefault(); saveForm(f); }
  });

  /* ---------- Drag and drop (tiles and items) ----------
     Grip handles drag immediately. Elsewhere: mouse drags after a small move,
     touch drags after a half-second press. Arrow keys on a focused grip also reorder. */
  var drag = null, justDragged = false;
  function sortCtx(target) {
    if (!target.closest || ui.sheet || ui.formFor) return null;
    if (target.closest('input,select,textarea,[data-action="item-toggle"]')) return null;
    var grip = !!target.closest('[data-grip]');
    if (!ui.openCat) {
      if (ui.tab !== 'tiles') return null;
      var tl = target.closest('.tile[data-sort="tile"]');
      if (!tl || (ui.editTiles && !grip)) return null;
      return { el: tl, sel: '.tile[data-sort="tile"]', grip: grip, group: false, scroller: function () { return window; }, drop: dropTiles };
    }
    var row = target.closest('li.row[data-sort="item"]');
    if (!row) return null;
    return { el: row, sel: 'li.row[data-sort="item"]', grip: grip, group: true, scroller: function () { return document.querySelector('.overlay'); }, drop: dropItems };
  }
  function dropTiles(ids) {
    var map = {};
    state.cats.forEach(function (c) { map[c.id] = c; });
    var next = ids.map(function (i) { return map[i]; }).filter(Boolean);
    state.cats.forEach(function (c) { if (next.indexOf(c) < 0) next.push(c); });
    state.cats = next;
  }
  function dropItems(ids, movedId) {
    var its = ids.map(function (id) { return state.items.find(function (x) { return x.id === id; }); }).filter(Boolean);
    var slots = its.map(function (x) { return x.order; }).sort(function (a, b) { return a - b; });
    its.forEach(function (x, n) { x.order = slots[n]; }); // reuse the section's own order slots so other sections are untouched
    var m = state.items.find(function (x) { return x.id === movedId; });
    if (m) m.manual = true;
  }
  function dragIds(d) {
    return Array.prototype.filter.call(d.el.parentElement.children, function (k) { return k.matches(d.ctx.sel); }).map(function (k) { return k.dataset.id; });
  }
  function moveGhost() { drag.ghost.style.left = (drag.x - drag.ox) + 'px'; drag.ghost.style.top = (drag.y - drag.oy) + 'px'; }
  function activate() {
    var d = drag;
    d.active = true;
    d.before = dragIds(d);
    var r = d.el.getBoundingClientRect();
    d.ox = d.x - r.left; d.oy = d.y - r.top;
    var g = d.el.cloneNode(true);
    g.classList.add('ghost');
    g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    var cs = getComputedStyle(d.el);
    ['--t-bg', '--t-fg', '--t-dot'].forEach(function (p) { g.style.setProperty(p, cs.getPropertyValue(p)); });
    document.body.appendChild(g);
    d.ghost = g;
    d.el.classList.add('drag-src');
    document.body.classList.add('dragging');
    try { document.body.setPointerCapture(d.pid); } catch (e) { /* not supported */ }
    moveGhost();
    d.raf = requestAnimationFrame(tick);
    if (navigator.vibrate) { try { navigator.vibrate(10); } catch (e) { /* ignore */ } }
  }
  function reorder() {
    var d = drag, under = document.elementFromPoint(d.x, d.y);
    if (!under) return;
    var t = under.closest(d.ctx.sel);
    if (!t || t === d.el || t.parentElement !== d.el.parentElement) return;
    if (d.ctx.group && t.dataset.group !== d.el.dataset.group) return;
    if (d.lt === t && Math.hypot(d.x - d.lx, d.y - d.ly) < 14) return; // avoid flip-flopping over the same neighbour
    var kids = Array.prototype.slice.call(d.el.parentElement.children);
    if (kids.indexOf(d.el) < kids.indexOf(t)) t.after(d.el); else t.before(d.el);
    d.lt = t; d.lx = d.x; d.ly = d.y;
  }
  function tick() {
    if (!drag || !drag.active) return;
    var y = drag.y, h = window.innerHeight, sp = 0;
    if (y < 90) sp = -Math.ceil((90 - y) / 6); else if (y > h - 90) sp = Math.ceil((y - (h - 90)) / 6);
    if (sp) {
      var sc = drag.ctx.scroller();
      if (sc === window) window.scrollBy(0, sp); else if (sc) sc.scrollTop += sp;
      moveGhost(); reorder();
    }
    drag.raf = requestAnimationFrame(tick);
  }
  function endDrag(cancel) {
    var d = drag;
    if (!d) return;
    clearTimeout(d.timer);
    cancelAnimationFrame(d.raf);
    drag = null;
    if (!d.active) return;
    try { document.body.releasePointerCapture(d.pid); } catch (e) { /* ignore */ }
    var list = dragIds(d);
    d.ghost.remove();
    d.el.classList.remove('drag-src');
    document.body.classList.remove('dragging');
    justDragged = true;
    setTimeout(function () { justDragged = false; }, 400);
    if (!cancel && list.join() !== d.before.join()) { d.ctx.drop(list, d.el.dataset.id); save(); }
    renderAll();
  }
  document.addEventListener('pointerdown', function (e) {
    if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
    var ctx = sortCtx(e.target);
    if (!ctx) return;
    drag = { ctx: ctx, el: ctx.el, pid: e.pointerId, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, active: false, touch: e.pointerType !== 'mouse', timer: null };
    if (ctx.grip) activate();
    else if (drag.touch) drag.timer = setTimeout(function () { if (drag && !drag.active) activate(); }, 500);
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.pid) return;
    drag.x = e.clientX; drag.y = e.clientY;
    if (!drag.active) {
      var dist = Math.hypot(drag.x - drag.sx, drag.y - drag.sy);
      if (drag.touch) { if (dist > 10) { clearTimeout(drag.timer); drag = null; } }
      else if (dist > 6) activate();
      return;
    }
    e.preventDefault();
    moveGhost(); reorder();
  });
  document.addEventListener('pointerup', function (e) { if (drag && e.pointerId === drag.pid) endDrag(false); });
  document.addEventListener('pointercancel', function (e) { if (drag && e.pointerId === drag.pid) endDrag(true); });
  document.addEventListener('touchmove', function (e) { if (((drag && drag.active) || (swp && swp.committed)) && e.cancelable) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', function (e) { if (drag) e.preventDefault(); });
  document.addEventListener('click', function (e) { if (justDragged) { e.stopPropagation(); e.preventDefault(); } }, true);

  /* ---------- Swipe to delete (expanded tile view and Ta-da) ----------
     A horizontal drag on a row slides it left to reveal a delete button; vertical
     movement is left alone so it falls through to scrolling or the item's own
     long-press reorder drag above. Runs in the capture phase so it can cancel a
     pending reorder before that listener sees the same pointermove. */
  var SWIPE_W = 72, swipeOpen = null, swp = null;
  function swipeHit(target) {
    if (!(ui.openCat || ui.tab === 'tada') || ui.formFor || !target.closest) return null;
    if (target.closest('input,select,textarea,[data-grip],[data-action="item-toggle"]')) return null;
    var row = target.closest('li.row');
    if (!row) return null;
    var track = row.querySelector('.row-track');
    return track ? { row: row, track: track } : null;
  }
  function closeSwipeOpen(suppressClick) {
    if (!swipeOpen) return;
    swipeOpen.classList.remove('swipe-open');
    swipeOpen = null;
    if (suppressClick) { justDragged = true; setTimeout(function () { justDragged = false; }, 300); }
  }
  function endSwipe(cancel) {
    if (!swp) return;
    var row = swp.row, track = swp.track, committed = swp.committed, tx = swp.tx;
    swp = null;
    if (!committed) return;
    row.classList.remove('swiping');
    track.style.transform = '';
    if (!cancel && tx < -SWIPE_W / 2) { row.classList.add('swipe-open'); swipeOpen = row; }
    else { row.classList.remove('swipe-open'); if (swipeOpen === row) swipeOpen = null; }
    justDragged = true; setTimeout(function () { justDragged = false; }, 300);
  }
  document.addEventListener('pointerdown', function (e) {
    var hit = swipeHit(e.target);
    if (swipeOpen && (!hit || hit.row !== swipeOpen)) closeSwipeOpen(true);
    if (!hit || swp) return;
    swp = { row: hit.row, track: hit.track, pid: e.pointerId, sx: e.clientX, sy: e.clientY, startTx: hit.row.classList.contains('swipe-open') ? -SWIPE_W : 0, committed: false, tx: 0 };
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (!swp || e.pointerId !== swp.pid) return;
    var dx = e.clientX - swp.sx, dy = e.clientY - swp.sy;
    if (!swp.committed) {
      if (Math.hypot(dx, dy) < 6) return;
      if (Math.abs(dy) >= Math.abs(dx)) { swp = null; return; } // vertical/ambiguous: leave it to scroll or reorder
      swp.committed = true;
      if (drag && drag.pid === e.pointerId) { clearTimeout(drag.timer); drag = null; }
      swp.row.classList.add('swiping');
    }
    e.preventDefault();
    swp.tx = Math.min(0, Math.max(-SWIPE_W - 20, swp.startTx + dx));
    swp.track.style.transform = 'translateX(' + swp.tx + 'px)';
  }, true);
  document.addEventListener('pointerup', function (e) { if (swp && e.pointerId === swp.pid) endSwipe(false); }, true);
  document.addEventListener('pointercancel', function (e) { if (swp && e.pointerId === swp.pid) endSwipe(true); }, true);

  /* ---------- Long-press a checkbox to mark done on a past date ----------
     Opening the date editor replaces the checkbox with new controls before
     the triggering touch/click finishes, so only the brief synthetic click
     that follows needs swallowing — not a long window, which would also eat
     a fast, deliberate tap on the Confirm button that just appeared. */
  var press = null, suppressToggleClick = false;
  function clearPress() { if (press) clearTimeout(press.timer); press = null; }
  document.addEventListener('pointerdown', function (e) {
    var btn = e.target.closest('#overlay-root [data-action="item-toggle"]');
    if (!btn || drag || swp) return;
    var id = btn.dataset.id, it = state.items.find(function (x) { return x.id === id; });
    if (!it || it.done) return;
    press = { pid: e.pointerId, sx: e.clientX, sy: e.clientY, timer: setTimeout(function () {
      press = null;
      ui.dateFor = id; renderOverlay();
      suppressToggleClick = true;
      setTimeout(function () { suppressToggleClick = false; }, 80);
    }, 500) };
  });
  document.addEventListener('pointermove', function (e) {
    if (!press || e.pointerId !== press.pid) return;
    if (Math.hypot(e.clientX - press.sx, e.clientY - press.sy) > 10) clearPress();
  });
  document.addEventListener('pointerup', function (e) { if (press && e.pointerId === press.pid) clearPress(); });
  document.addEventListener('pointercancel', function (e) { if (press && e.pointerId === press.pid) clearPress(); });
  document.addEventListener('click', function (e) { if (suppressToggleClick) { e.stopPropagation(); e.preventDefault(); suppressToggleClick = false; } }, true);
  document.addEventListener('keydown', function (e) {
    var g = e.target.closest && e.target.closest('[data-grip]');
    if (!g) return;
    var dir = (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : 0;
    if (!dir) return;
    e.preventDefault();
    var id = g.dataset.id, ok = false;
    if (g.dataset.grip === 'tile') {
      var i = state.cats.findIndex(function (c) { return c.id === id; }), j = i + dir;
      if (i >= 0 && j >= 0 && j < state.cats.length) { var tmp = state.cats[i]; state.cats[i] = state.cats[j]; state.cats[j] = tmp; ok = true; }
    } else ok = moveItem(state, id, dir);
    if (ok) { save(); renderAll(); var ng = document.querySelector('[data-grip][data-id="' + id + '"]'); if (ng) ng.focus(); }
  });

  function setRating(t) {
    var v = Number(t.value), row = t.closest('.ci-row');
    state.checkin.ratings[t.dataset.ci] = v;
    row.classList.remove('unset');
    t.parentElement.style.setProperty('--v', v);
    t.setAttribute('aria-valuetext', ratingLabel(v));
    var sm = $('#ci-summary'); if (sm) sm.innerHTML = ciSummaryInner();
  }
  function syncNotes() { var n = $('#notes-editor'); if (n) { state.notes.html = n.innerHTML; state.notes.updatedAt = Date.now(); save(); } }
  document.addEventListener('input', function (e) {
    if (e.target.dataset && e.target.dataset.ci) setRating(e.target);
    else if (e.target.id === 'notes-editor') syncNotes();
  });
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.ci && t.closest('.ci-row').classList.contains('unset')) { setRating(t); save(); } // a tap without moving counts as "balanced"
  });
  document.addEventListener('mousedown', function (e) { if (e.target.closest('[data-action^="note-"]')) e.preventDefault(); });
  document.addEventListener('paste', function (e) {
    if (e.target.closest && e.target.closest('#notes-editor')) {
      e.preventDefault();
      document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
    }
  });

  var tabs = [['tiles', 'Home', 'grid'], ['upcoming', 'Upcoming', 'cal'], ['tada', 'Ta-da', 'tada'], ['checkin', 'Check-in', 'sliders']];
  $('#tabbar').innerHTML = tabs.map(function (t) { return '<button class="tab" data-action="tab" data-tab="' + t[0] + '">' + '<span class="tabicon">' + icon(t[2]) + (t[0] === 'checkin' ? '<span class="tabdot" hidden></span>' : '') + '</span><span>' + t[1] + '</span></button>'; }).join('');
  $('#fab').innerHTML = icon('plus');
  housekeeping();
  document.addEventListener('visibilitychange', function () { if (!document.hidden && housekeeping()) renderAll(); });
  renderAll();
})();
