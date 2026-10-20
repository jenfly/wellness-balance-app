// Home tab: long-press a checkbox on a collapsed tile to open the inline "Mark done on" editor
const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('assert');
const html='<!doctype html><html><body>'+fs.readFileSync('balance-tiles.html','utf8').replace(/<link[^>]*>/,'')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const click=s=>d.querySelector(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const clickEl=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ptr=(el,type)=>el.dispatchEvent(new w.MouseEvent(type,{bubbles:true,cancelable:true,clientX:5,clientY:5}));
const st=()=>JSON.parse(w.localStorage.getItem('well-tended-v1'));
(async()=>{
  const chk=()=>d.querySelector('#main .peek .pchk');
  const id=chk().dataset.id;
  ptr(chk(),'pointerdown'); await sleep(600); ptr(chk(),'pointerup'); ptr(chk(),'click');
  assert(d.querySelector('#main li.pk-date'),'inline editor shown on tile');
  assert(!w.localStorage.getItem('well-tended-v1'),'long press must not complete or save anything');
  assert(!d.querySelector('#overlay-root .overlay'),'tile must not open');
  // tapping inside the editor must not open the tile
  clickEl(d.querySelector('#main li.pk-date input'));
  clickEl(d.querySelector('#main li.pk-date .de-label'));
  assert(!d.querySelector('#overlay-root .overlay'),'taps inside editor must not open the tile');
  click('[data-action=date-cancel]');
  assert(!d.querySelector('li.pk-date'));
  // pick a past date and confirm
  ptr(chk(),'pointerdown'); await sleep(600); ptr(chk(),'pointerup');
  const y=new Date(Date.now()-3*86400000), ys=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
  d.querySelector('#main li.pk-date input').value=ys; await sleep(100);
  click('[data-action=date-confirm]');
  const entries=st().log.filter(l=>l.itemId===id).sort((a,b)=>b.at-a.at); const entry=entries.find(l=>new Date(l.at).getDate()===y.getDate()&&new Date(l.at).getMonth()===y.getMonth());
  assert(entry && new Date(entry.at).getDate()===y.getDate(),'log entry dated 3 days ago');
  assert(!d.querySelector('li.pk-date'));
  // plain tap still completes immediately
  const id2=chk().dataset.id;
  ptr(chk(),'pointerdown'); ptr(chk(),'pointerup'); clickEl(chk());
  assert(st().log.some(l=>l.itemId===id2),'tap completes');
  console.log('ok');
})();
