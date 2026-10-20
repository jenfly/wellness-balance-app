// Upcoming tab: long-press a checkbox to open the inline "Mark done on" editor (same as the expanded tile)
const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('assert');
const html='<!doctype html><html><body>'+fs.readFileSync('balance-tiles.html','utf8').replace(/<link[^>]*>/,'')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const click=s=>d.querySelector(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ptr=(el,type)=>el.dispatchEvent(new w.MouseEvent(type,{bubbles:true,cancelable:true,clientX:5,clientY:5}));
(async()=>{
  click('[data-action=tab][data-tab=upcoming]');
  const chk=()=>d.querySelector('#main .up-group .chk');
  assert(chk(),'upcoming has a checkbox');
  const id=chk().dataset.id, title=chk().closest('li').querySelector('.row-text').textContent;
  const st=()=>JSON.parse(w.localStorage.getItem('well-tended-v1'));
  // quick tap still completes immediately (no regression)
  // long press opens the editor instead of completing
  ptr(chk(),'pointerdown'); await sleep(600); ptr(chk(),'pointerup'); ptr(chk(),'click');
  assert(d.querySelector('#main li.date-edit'),'inline date editor shown in Upcoming');
  assert(!st().items.find(i=>i.id===id).done,'long press must not complete the item');
  // cancel closes it
  click('[data-action=date-cancel]');
  assert(!d.querySelector('li.date-edit'));
  // long press again, pick yesterday, confirm
  ptr(chk(),'pointerdown'); await sleep(600); ptr(chk(),'pointerup');
  const inp=d.querySelector('#main li.date-edit input[type=date]');
  const y=new Date(Date.now()-86400000), ys=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
  inp.value=ys; await sleep(100);
  click('[data-action=date-confirm]');
  const it=st().items.find(i=>i.id===id);
  const entry=st().log.find(l=>l.itemId===id);
  const done=it.done||it.type==='recurring';
  assert(done,'item completed');
  assert(entry && new Date(entry.at).getDate()===y.getDate(),'log entry dated yesterday');
  assert(!d.querySelector('li.date-edit'));
  // plain tap completes right away
  const id2=chk().dataset.id;
  ptr(chk(),'pointerdown'); ptr(chk(),'pointerup'); click('#main .up-group .chk');
  assert(st().log.some(l=>l.itemId===id2),'tap completes');
  console.log('ok');
})();
