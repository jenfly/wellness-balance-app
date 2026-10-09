const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('assert');
const html='<!doctype html><html><body>'+fs.readFileSync('balance-tiles.html','utf8').replace(/<link[^>]*>/,'')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const click=s=>d.querySelector(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
assert.strictEqual(d.querySelector('h1').textContent,'Well Tended');
click('[data-tab=upcoming]');
assert(d.querySelector('.tab[aria-current=page]').textContent.trim()==='Upcoming');
const heads=()=>[...d.querySelectorAll('.up-h')].map(x=>x.textContent);
console.log(heads());
assert(!d.querySelector('.up-group').textContent.includes('Mop'));
assert(d.querySelector('.up-controls .hint').textContent.includes('hidden'));
// show recurring
let sw=d.querySelector('#up-rec');sw.checked=true;sw.dispatchEvent(new w.Event('change',{bubbles:true}));
assert(d.querySelector('.up-controls').textContent.includes('Show recurring')&&[...d.querySelectorAll('.row-text')].some(x=>x.textContent.includes('Mop')));
console.log(heads());
// category grouping
let r=d.querySelector('input[name=up-group][value=category]');r.checked=true;r.dispatchEvent(new w.Event('change',{bubbles:true}));
console.log(heads());assert(heads().includes('Housework'));
// complete from upcoming
const n0=d.querySelectorAll('.up-group .row').length;
click('.up-group .chk');assert(d.querySelectorAll('.up-group .row').length<=n0);
// open an item for editing -> overlay with form
click('.up-group .row-main');assert(d.querySelector('.overlay form'));
click('[data-action=close-overlay]');assert(!d.querySelector('.overlay')&&d.querySelector('.up-group'));
console.log('ok');
