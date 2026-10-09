const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('assert');
const html='<!doctype html><html><body>'+fs.readFileSync('balance-tiles.html','utf8').replace(/<link[^>]*>/,'')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const errs=[];w.addEventListener('error',e=>errs.push(e.message));
const click=(sel)=>d.querySelector(sel).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const ptr=(type,el,x,y)=>{const e=new w.MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0});Object.defineProperty(e,'pointerId',{value:1});Object.defineProperty(e,'pointerType',{value:'mouse'});el.dispatchEvent(e)};
// peek: to-dos and recurring have checkboxes, goals don't
const ch=d.querySelector('.tile[data-id=housework]');assert(ch.querySelectorAll('.pchk').length===3);
assert(d.querySelector('.tile[data-id=fitness] .pchk')===null);
assert(d.querySelector('.tile[data-id=shopping] .pchk'));
// peek checkbox completes the item without opening the tile
const first=d.querySelector('.tile[data-id=shopping] .pchk');click('.tile[data-id=shopping] .pchk');
assert(!d.querySelector('.overlay'));assert(!d.querySelector('.tile[data-id=shopping]').textContent.includes('Book bike'));
click('[data-action=undo]');assert(d.querySelector('.tile[data-id=shopping]').textContent.includes('Book bike'));
// tile drag by mouse movement (normal mode)
const order=()=>[...d.querySelectorAll('.grid .tile[data-sort]')].map(t=>t.dataset.id);
assert.strictEqual(order()[0],'fitness');
const src=d.querySelector('.tile[data-id=fitness]'),tgt=d.querySelector('.tile[data-id=housework]');
let n1=0;d.elementFromPoint=()=>(n1++?src:tgt);
ptr('pointerdown',src,10,10);ptr('pointermove',src,40,40);ptr('pointermove',src,60,60);ptr('pointermove',src,70,70);
assert(d.querySelector('.ghost'));ptr('pointerup',src,70,70);
console.log(order().slice(0,4));assert.deepStrictEqual(order().slice(0,3),['cooking','housework','fitness']);
assert(!d.querySelector('.overlay'),'drag must not open the tile');
// edit mode: only grips drag
(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));await wait(450);
click('[data-action=toggle-edit]');assert(d.querySelectorAll('.grip[data-grip=tile]').length===10);
const g=d.querySelector('.grip[data-id=fitness]');const t2=d.querySelector('.tile[data-id=cooking]');let n2=0;d.elementFromPoint=()=>(n2++?g:d.querySelector('.tile[data-id=cooking]'));
ptr('pointerdown',g,5,5);assert(d.querySelector('.ghost'));ptr('pointermove',g,6,6);ptr('pointerup',g,6,6);
console.log(order().slice(0,4));
await wait(450);click('[data-action=toggle-edit]');
// items: drag via grip inside expanded tile
await wait(450);click('.tile[data-id=housework]');
const rows=()=>[...d.querySelectorAll('li.row[data-sort=item] .row-text')].map(x=>x.textContent);
const before=rows();console.log(before);
const lastGrip=d.querySelectorAll('li.row[data-sort=item] .grip')[2];
const firstRow=d.querySelector('li.row[data-sort=item]');let n3=0;d.elementFromPoint=()=>(n3++?lastGrip:d.querySelector('li.row[data-sort=item]'));
ptr('pointerdown',lastGrip,5,5);ptr('pointermove',lastGrip,6,6);ptr('pointerup',lastGrip,6,6);
const after=rows();console.log(after);assert.strictEqual(after[0],before[2]);
// keyboard
const gp=d.querySelectorAll('li.row[data-sort=item] .grip')[1];
gp.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true}));
console.log(rows());
// square checkbox css
assert(fs.readFileSync('balance-tiles.html','utf8').includes('.chk::before{content:"";grid-area:1/1;width:22px;height:22px;border-radius:6px'));
console.log('smoke2 ok',errs);
})().catch(e=>{console.error(e);process.exit(1)});
