const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('assert');
const html='<!doctype html><html><body>'+fs.readFileSync('balance-tiles.html','utf8').replace(/<link[^>]*>/,'')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const click=s=>d.querySelector(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const chg=(sel,fn)=>{const el=d.querySelector(sel);fn(el);el.dispatchEvent(new w.Event('change',{bubbles:true}))};
const heads=()=>[...d.querySelectorAll('.up-h')].map(x=>x.textContent);
click('[data-tab=tada]');
assert.strictEqual(d.querySelector('.tab[aria-current=page]').textContent.trim(),'Ta-da');
assert(d.querySelector('.summary').textContent.includes('3 done in the last 7 days'));
console.log(heads());assert(heads()[0].startsWith('Housework'));
// 30, 90, 1 year
const win=v=>chg('input[name=tada-days][value="'+v+'"]',e=>e.checked=true);
win(30);assert(d.querySelector('.summary').textContent.includes('7 done in the last 30 days'));
win(90);assert(d.querySelector('.summary').textContent.includes('8 done'));
win(365);assert(d.querySelector('.summary').textContent.includes('10 done in the past year'));
// hide recurring
chg('#tada-rec',e=>e.checked=false);assert(d.querySelector('.summary').textContent.includes('5 done'));
assert(![...d.querySelectorAll('.up-group .row-text')].some(x=>x.textContent.includes('Mop')));
chg('#tada-rec',e=>e.checked=true);
// by date
chg('input[name=tada-group][value=date]',e=>e.checked=true);console.log(heads());
const day3=w.pastBucket(w.addDays(w.today(),-3)).label, day5=w.pastBucket(w.addDays(w.today(),-5)).label;
assert(heads().some(x=>x.startsWith('Yesterday'))&&heads().some(x=>x.startsWith(day3))&&heads().some(x=>x.startsWith(day5)));
assert(!heads().some(x=>x.startsWith('Past week')));
assert(d.querySelector('.catlabel'));
// collapsible groups: Today/Yesterday/individual preceding days default open even at 365 days, older month groups default collapsed
{
  const grp=h=>[...d.querySelectorAll('.up-group')].find(g=>g.querySelector('.up-h').textContent.startsWith(h));
  assert.strictEqual(grp('Yesterday').querySelector('.sec-toggle').getAttribute('aria-expanded'),'true');
  assert(grp('Yesterday').querySelector('.items'));
  const sept=grp('September');
  assert.strictEqual(sept.querySelector('.sec-toggle').getAttribute('aria-expanded'),'false');
  assert(!sept.querySelector('.items'));
  // expand it: toggle is remembered for this window (365) only
  sept.querySelector('.sec-toggle').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.strictEqual(d.querySelector('input[name=tada-days][value="365"]').checked,true);
  const sept2=grp('September');
  assert.strictEqual(sept2.querySelector('.sec-toggle').getAttribute('aria-expanded'),'true');
  assert(sept2.querySelector('.items'));
  // switching window doesn't inherit the toggle; switching back to 365 remembers it
  win(90);
  const sept90=grp('September');
  if(sept90) assert.strictEqual(sept90.querySelector('.sec-toggle').getAttribute('aria-expanded'),'false');
  win(365);
  assert.strictEqual(grp('September').querySelector('.sec-toggle').getAttribute('aria-expanded'),'true');
  // collapse it back for the assertions below
  grp('September').querySelector('.sec-toggle').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
}
// persists across tab switches
click('[data-tab=upcoming]');click('[data-tab=tada]');assert(d.querySelector('input[name=tada-days][value="365"]').checked);
// clear done in a tile
click('[data-tab=tiles]');click('.tile[data-id=shopping]');assert(d.querySelector('.done-bar'));
click('[data-action=clear-done]');assert(!d.querySelector('.done-bar'));
click('[data-action=undo]');assert(d.querySelector('.done-bar'));
click('[data-action=clear-done]');click('[data-action=close-overlay]');
// history survives clearing
click('[data-tab=tada]');assert([...d.querySelectorAll('.row-text')].some(x=>x.textContent==='Return the borrowed ladder'));
// delete a Ta-da entry, with undo
{
  const before=d.querySelectorAll('.tada-row').length;
  const row=[...d.querySelectorAll('.tada-row')].find(r=>r.querySelector('.row-text').textContent==='Return the borrowed ladder');
  row.querySelector('[data-action=tada-delete]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.strictEqual(d.querySelectorAll('.tada-row').length,before-1);
  assert(![...d.querySelectorAll('.row-text')].some(x=>x.textContent==='Return the borrowed ladder'));
  click('[data-action=undo]');
  assert.strictEqual(d.querySelectorAll('.tada-row').length,before);
  assert([...d.querySelectorAll('.row-text')].some(x=>x.textContent==='Return the borrowed ladder'));
}
// settings housekeeping
click('[data-action=settings]');assert(d.querySelector('#s-donekeep').value==='30'&&d.querySelector('#s-logkeep').value==='365');
chg('#s-logkeep',e=>e.value='0');
console.log('ok');
