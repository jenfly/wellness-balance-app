const {JSDOM}=require('jsdom');const fs=require('fs');const assert=require('assert');
const html='<!doctype html><html><body>'+fs.readFileSync('balance-tiles.html','utf8').replace(/<link[^>]*>/,'')+'</body></html>';
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'});
const w=dom.window,d=w.document;w.scrollTo=()=>{};
const click=s=>d.querySelector(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const chg=(sel,fn)=>{const el=d.querySelector(sel);fn(el);el.dispatchEvent(new w.Event('change',{bubbles:true}))};
const dot=()=>!d.querySelector('#tabbar .tabdot').hidden;
assert(dot());
click('[data-tab=checkin]');
// read mode: compact meters, no sliders
assert.strictEqual(d.querySelectorAll('.ci-range').length,0);
assert.strictEqual(d.querySelectorAll('#ci-current .ci-row').length,10);
assert.strictEqual(d.querySelectorAll('.ci-row .pip').length,10);
assert(d.querySelector('.ci-row').getAttribute('style')===null&&d.querySelector('.ci-track').getAttribute('style').includes('--v:22'));
assert(d.querySelector('.summary').textContent.includes('9 days ago'));
assert(d.querySelector('[data-action=ci-edit]'));assert(!d.querySelector('[data-action=ci-finish]'));
// edit mode
click('[data-action=ci-edit]');
assert.strictEqual(d.querySelectorAll('.ci-range').length,10);assert(d.querySelector('.ci-list.editing'));
assert(d.querySelector('[data-action=ci-cancel]')&&d.querySelector('[data-action=ci-finish]'));
const sl=d.querySelector('.ci-range[data-ci=career]');sl.value='50';sl.dispatchEvent(new w.Event('input',{bubbles:true}));sl.dispatchEvent(new w.Event('change',{bubbles:true}));
assert.strictEqual(sl.parentElement.style.getPropertyValue('--v'),'50');
assert(!d.querySelector('#ci-summary').textContent.includes('Career'));
// cancel reverts
click('[data-action=ci-cancel]');
assert.strictEqual(d.querySelectorAll('.ci-range').length,0);
assert(d.querySelector('.summary').textContent.includes('9 days ago'));
assert(d.querySelector('#ci-summary').textContent.includes('Career'),'work is back on the high side');
// edit + confirm saves and records check-in
click('[data-action=ci-edit]');
const s2=d.querySelector('.ci-range[data-ci=fitness]');s2.value='48';s2.dispatchEvent(new w.Event('input',{bubbles:true}));s2.dispatchEvent(new w.Event('change',{bubbles:true}));
click('[data-action=ci-finish]');
assert.strictEqual(d.querySelectorAll('.ci-range').length,0);
assert(d.querySelector('.summary').textContent.includes('today'));assert(!dot());
assert(d.querySelector('.ci-row .ci-track').getAttribute('style').includes('--v:48'));
// leaving the tab mid-edit exits edit mode, keeps the ratings
click('[data-action=ci-edit]');click('[data-tab=upcoming]');click('[data-tab=checkin]');
assert.strictEqual(d.querySelectorAll('.ci-range').length,0);
// prompts + notes
const p0=d.querySelector('.prompt').textContent;click('[data-action=ci-prompt]');assert.notStrictEqual(d.querySelector('.prompt').textContent,p0);
chg('#ci-notes',e=>e.value='walk first');click('[data-action=ci-prompt]');assert.strictEqual(d.querySelector('#ci-notes').value,'walk first');
// new category shows as not set; tapping it in edit mode sets balanced
click('[data-tab=tiles]');click('[data-action=toggle-edit]');click('[data-action=cat-add]');click('[data-action=toggle-edit]');
click('[data-tab=checkin]');let rows=d.querySelectorAll('#ci-current .ci-row');assert(rows[rows.length-1].querySelector('.ci-unset'));
click('[data-action=ci-edit]');rows=d.querySelectorAll('#ci-current .ci-row');const last=rows[rows.length-1];
last.querySelector('.ci-range').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert(!last.classList.contains('unset'));
// settings dot threshold still works
click('[data-action=settings]');chg('#s-dotdays',e=>e.value='14');assert.strictEqual(d.querySelector('#s-dotdays').value,'14');
console.log('ok');
