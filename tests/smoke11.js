// Meal Planner link: ?log=<meal> opens a "Log a batch" prompt; Log it adds a finished to-do; Cancel adds nothing;
// the destination category is a setting stored by id; a missing category falls back to Inbox; outside saves aren't overwritten.
const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('assert');
const page='<!doctype html><html><body>'+fs.readFileSync('balance-tiles.html','utf8').replace(/<link[^>]*>/,'')+'</body></html>';
const KEY='well-tended-v1';
function boot(url,stored){
  const dom=new JSDOM(page,{runScripts:'dangerously',pretendToBeVisual:true,url,beforeParse(win){win.scrollTo=()=>{};if(stored)win.localStorage.setItem(KEY,stored);}});
  const w=dom.window,d=w.document;
  const click=s=>d.querySelector(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const chg=(sel,val)=>{const el=d.querySelector(sel);el.value=val;el.dispatchEvent(new w.Event('change',{bubbles:true}))};
  const saved=()=>JSON.parse(w.localStorage.getItem(KEY));
  return {w,d,click,chg,saved};
}

// 1. Prompt appears, URL is cleaned, nothing is saved yet.
let a=boot('https://example.com/?log=Banana%20oat%20bars');
assert.strictEqual(a.d.querySelector('.sheet .log-text').textContent,'Make banana oat bars');
assert.strictEqual(a.w.location.search,'');
assert.strictEqual(a.d.querySelector('#log-cat').value,'inbox'); // no category chosen yet -> Inbox
assert(!a.d.querySelector('.sheet .hint').textContent.includes('no longer exists'));

// 2. Picking a category in the prompt is remembered (by id) as the setting.
a.chg('#log-cat','cooking');
assert.strictEqual(a.saved().settings.logCat,'cooking');

// 3. Log it: finished to-do in that category, plus a Ta-da log entry.
const before=a.saved().items.length;
a.click('[data-action=log-confirm]');
assert(!a.d.querySelector('.sheet'));
let s=a.saved();
assert.strictEqual(s.items.length,before+1);
const it=s.items.find(i=>i.text==='Make banana oat bars');
assert(it&&it.type==='todo'&&it.done===true&&it.catId==='cooking'&&it.doneAt);
assert(s.log.some(l=>l.itemId===it.id&&l.text==='Make banana oat bars'&&l.catId==='cooking'));
assert(a.d.querySelector('#toast').textContent.includes('Cooking'));

// 4. Next time the saved category is preselected, with no "missing" hint.
const stored=a.w.localStorage.getItem(KEY);
let b=boot('https://example.com/?log=Chili',stored);
assert.strictEqual(b.d.querySelector('#log-cat').value,'cooking');
assert.strictEqual(b.d.querySelector('.log-text').textContent,'Make chili');

// 5. Cancel adds nothing.
const n0=JSON.parse(stored).items.length;
b.click('[data-action=close-sheet]');
assert(!b.d.querySelector('.sheet'));
assert.strictEqual(b.saved().items.length,n0);

// 6. First letter is lowercased ("Banana oat bars" -> "Make banana oat bars"), acronyms keep their capitals; blank/absent names open nothing.
assert.strictEqual(boot('https://example.com/?log=BBQ%20tofu').d.querySelector('.log-text').textContent,'Make BBQ tofu');
let e=boot('https://example.com/?log=%20%20');
assert(!e.d.querySelector('.sheet')); assert.strictEqual(e.w.location.search,'');
assert(!boot('https://example.com/').d.querySelector('.sheet'));

// 7. Settings has the category dropdown, stored by id.
let c=boot('https://example.com/',stored);
c.click('[data-action=settings]');
assert.strictEqual(c.d.querySelector('#s-logcat').value,'cooking');
c.chg('#s-logcat','garden');
assert.strictEqual(c.saved().settings.logCat,'garden');

// 8. Renaming the category doesn't matter; deleting it falls back to Inbox with an explanation.
const renamed=JSON.parse(stored); renamed.cats.find(x=>x.id==='cooking').name='Meal Planning';
let r=boot('https://example.com/?log=Soup',JSON.stringify(renamed));
assert.strictEqual(r.d.querySelector('#log-cat').value,'cooking');
assert(r.d.querySelector('#log-cat option[value=cooking]').textContent==='Meal Planning');
const gone=JSON.parse(stored); gone.cats=gone.cats.filter(x=>x.id!=='cooking'); gone.items.forEach(i=>{if(i.catId==='cooking')i.catId='inbox';});
let g=boot('https://example.com/?log=Soup',JSON.stringify(gone));
assert.strictEqual(g.d.querySelector('#log-cat').value,'inbox');
assert(g.d.querySelector('.sheet .hint').textContent.includes('no longer exists'));
g.click('[data-action=log-confirm]');
assert(g.saved().items.some(i=>i.text==='Make soup'&&i.catId==='inbox'&&i.done));

// 9. A change saved by another window of the app isn't overwritten by this one's next save.
let o=boot('https://example.com/',stored);
const other=JSON.parse(stored);
other.items.push({id:'ix',catId:'cooking',type:'todo',text:'Make from other window',desc:'',due:null,freq:null,pinned:false,later:false,tags:[],done:true,doneAt:Date.now(),manual:false,tags:[],order:99});
o.w.localStorage.setItem(KEY,JSON.stringify(other));
o.w.dispatchEvent(new o.w.StorageEvent('storage',{key:KEY}));
o.click('[data-action=settings]');
o.chg('#s-dotdays','14'); // any save from this window
assert(o.saved().items.some(i=>i.id==='ix'),'other window\'s item was overwritten');

console.log('smoke11 ok');
