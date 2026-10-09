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
assert(heads().includes('Yesterday')&&heads().includes('Past week'));
assert(d.querySelector('.catlabel'));
// persists across tab switches
click('[data-tab=upcoming]');click('[data-tab=tada]');assert(d.querySelector('input[name=tada-days][value="365"]').checked);
// clear done in a tile
click('[data-tab=tiles]');click('.tile[data-id=shopping]');assert(d.querySelector('.done-bar'));
click('[data-action=clear-done]');assert(!d.querySelector('.done-bar'));
click('[data-action=undo]');assert(d.querySelector('.done-bar'));
click('[data-action=clear-done]');click('[data-action=close-overlay]');
// history survives clearing
click('[data-tab=tada]');assert([...d.querySelectorAll('.row-text')].some(x=>x.textContent==='Return the borrowed ladder'));
// settings housekeeping
click('[data-action=settings]');assert(d.querySelector('#s-donekeep').value==='30'&&d.querySelector('#s-logkeep').value==='365');
chg('#s-logkeep',e=>e.value='0');
console.log('ok');
