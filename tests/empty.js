const {JSDOM}=require('jsdom');const assert=require('assert');
JSDOM.fromURL('http://localhost:8125/index.html',{runScripts:'dangerously',resources:'usable',pretendToBeVisual:true}).then(dom=>{
 setTimeout(()=>{const d=dom.window.document;
  assert(d.querySelectorAll('.tile').length===4);
  console.log('tiles',d.querySelectorAll('.tile').length,'h1',d.querySelector('h1').textContent,[...d.querySelectorAll('.tile h2')].map(h=>h.textContent).join('|'),'peek rows',d.querySelectorAll('.peek li').length);
  process.exit(0)},500);});
