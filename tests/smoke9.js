const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('assert');
const html='<!doctype html><html><body>'+fs.readFileSync('balance-tiles.html','utf8').replace(/<link[^>]*>/,'')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const click=s=>d.querySelector(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
click('[data-action=settings]');
assert.strictEqual(d.querySelectorAll('.tag-pill').length,2);
assert(d.querySelector('[data-action=tag-delete][data-tag=quick]'));
click('[data-action=tag-delete][data-tag=quick]');
// removed from the settings list and from state
assert.strictEqual(d.querySelectorAll('.tag-pill').length,1);
const state=JSON.parse(w.localStorage.getItem('well-tended-v1'));
assert.strictEqual(state.tags.indexOf('quick'),-1);
const paper=state.items.find(i=>i.text==='Pick up printer paper');
assert.deepStrictEqual(paper.tags,[]);
// the filter chip row on tiles drops it too
click('[data-action=close-sheet]');
assert(!d.querySelector('[data-action=filter][data-tag=quick]'));
assert(d.querySelector('[data-action=filter][data-tag=active]'));
// undo restores the tag and the item's tag
click('[data-action=undo]');
const restored=JSON.parse(w.localStorage.getItem('well-tended-v1'));
assert(restored.tags.indexOf('quick')>=0);
assert.deepStrictEqual(restored.items.find(i=>i.text==='Pick up printer paper').tags,['quick']);
console.log('ok');
