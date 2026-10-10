const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('assert');
const html='<!doctype html><html><body>'+fs.readFileSync('balance-tiles.html','utf8').replace(/<link[^>]*>/,'')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const click=s=>d.querySelector(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const chg=(sel,fn)=>{const el=d.querySelector(sel);fn(el);el.dispatchEvent(new w.Event('change',{bubbles:true}))};

click('[data-tab=checkin]');
assert(d.querySelector('.ci-history-divider'));
assert(d.querySelectorAll('.ci-sparklines .ci-row').length===10);
assert(d.querySelectorAll('.ci-sparklines .ci-spark').length===10);
chg('input[name=ci-history-days][value="90"]',e=>{e.checked=true;}); // default range, re-selecting just to force an initial save()
const state0=JSON.parse(w.localStorage.getItem('well-tended-v1'));
const older=state0.checkinHistory.find(e=>e.notes==='Work has been a lot.'); // 63 days ago, fitness rated lower than the live snapshot
assert(older);
const pickBefore=d.querySelectorAll('#ci-history-pick option').length;
assert(pickBefore>1); // placeholder + entries within the default 90-day range

// narrow range to 1 month: fewer selectable snapshots
chg('input[name=ci-history-days][value="30"]',e=>{e.checked=true;});
const pickAfter=d.querySelectorAll('#ci-history-pick option').length;
assert(pickAfter<pickBefore);
assert(!d.querySelector('#ci-history-pick option[value="'+older.id+'"]')); // 63 days ago is out of a 30-day range

// widen back out, then select a past snapshot and verify the read-only viewer
chg('input[name=ci-history-days][value="90"]',e=>{e.checked=true;});
assert(d.querySelector('#ci-history-pick option[value="'+older.id+'"]'));
assert(!d.querySelector('.ci-snapshot'));
chg('#ci-history-pick',e=>{e.value=older.id;});
assert(d.querySelector('.ci-snapshot'));
assert.strictEqual(d.querySelectorAll('.ci-snapshot .ci-row').length,10);
assert.notStrictEqual(older.ratings.fitness,state0.checkin.ratings.fitness);
assert(d.querySelector('.ci-snapshot .ci-track').getAttribute('style').includes('--v:'+older.ratings.fitness));
assert(d.querySelector('.ci-snapshot-notes').textContent.includes(older.notes));

// changing the range clears a selection that falls outside it
chg('input[name=ci-history-days][value="30"]',e=>{e.checked=true;});
assert(!d.querySelector('.ci-snapshot'));

// ci-edit -> ci-finish cycle appends a history entry and keeps notes
chg('input[name=ci-history-days][value="90"]',e=>{e.checked=true;});
const before=JSON.parse(w.localStorage.getItem('well-tended-v1')).checkinHistory.length;
click('[data-action=ci-edit]');
click('[data-action=ci-finish]');
const after=JSON.parse(w.localStorage.getItem('well-tended-v1')).checkinHistory.length;
assert.strictEqual(after,before+1);
const state2=JSON.parse(w.localStorage.getItem('well-tended-v1'));
assert.strictEqual(state2.checkinHistory[state2.checkinHistory.length-1].notes,state2.checkin.notes);

console.log('smoke10 ok');
