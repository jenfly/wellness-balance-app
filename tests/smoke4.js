const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('assert');
const html='<!doctype html><html><body>'+fs.readFileSync('balance-tiles.html','utf8').replace(/<link[^>]*>/,'')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const click=s=>d.querySelector(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
click('.tile[data-id=shopping]');assert(!d.querySelector('.add-btn'));
// FAB inside a tile defaults to that category
click('[data-action=fab]');assert.strictEqual(d.querySelector('#sheet-root #f-cat').value,'shopping');click('[data-action=close-sheet]');
click('[data-action=close-overlay]');
click('[data-action=settings]');
assert(d.querySelector('#s-dotdays'));
console.log('ok');
