const L=require('../js/logic.js');L.seed=require('./sample-data.js').seed;const assert=require('assert');
const s=L.seed();
const names=(c)=>L.openSorted(s,c).map(i=>i.text);
// dated items sort by soonest due
assert.deepStrictEqual(names('housework'),['Take out recycling','Mop kitchen floor','Wash windows','Clean the oven']);
// dateless keep their slots; pinned on top
assert.deepStrictEqual(names('fitness')[0],'Run twice a week');
assert.strictEqual(names('career')[0],'Team standup: Thursday mornings');
// shopping: dated first? dateless holds slot 1 (order), dated fills slot 0
console.log('shopping',names('shopping'));
// done todos excluded from open list
assert(!names('shopping').includes('Return the borrowed ladder'));
// tucked
const deep=s.items.find(i=>i.text.startsWith('Clean the oven'));assert(L.isTucked(deep));
assert(!L.isTucked(s.items.find(i=>i.text.startsWith('Mop'))));
assert(!L.isTucked(s.items.find(i=>i.text.startsWith('Monthly board game'))));
// recurring reset
const vac=s.items.find(i=>i.text.startsWith('Mop'));
const r=L.completeItem(s,vac.id);assert.strictEqual(r.kind,'reset');assert.strictEqual(vac.due,L.addDays(L.today(),7));assert(!vac.done);
assert.deepStrictEqual(names('housework')[0],'Take out recycling');
// month clamp
assert.strictEqual(L.addFreq('2026-01-31',1,'month'),'2026-02-28');
assert.strictEqual(L.addFreq('2026-10-08',6,'month'),'2027-04-08');
// todo complete + undo
const todo=s.items.find(i=>i.text.startsWith('Book bike'));
assert.strictEqual(L.completeItem(s,todo.id).kind,'done');assert(todo.done);assert(!names('shopping').includes(todo.text));
const logLen=s.log.length;assert.strictEqual(L.completeItem(s,todo.id).kind,'undone');assert.strictEqual(s.log.length,logLen-1);
// move: move 'Wash windows' up; it becomes manual and holds slot
const before=names('housework');const dust=s.items.find(i=>i.text==='Wash windows');
assert(L.moveItem(s,dust.id,-1));const after=names('housework');
console.log(before,'->',after);assert.strictEqual(after.indexOf('Wash windows'),before.indexOf('Wash windows')-1);
assert(!L.moveItem(s,s.items.find(i=>i.text==='Team standup: Thursday mornings').id,-1));
// pinned group stays on top when moving
const e=L.openSorted(s,'fitness');assert(!L.moveItem(s,e[0].id,-1));
console.log('ok');
// upcoming
const s2=L.seed();
const up=L.upcomingItems(s2,{recurring:false});
assert(up.every(i=>i.type==='todo'&&i.due&&!i.done));
assert.deepStrictEqual(up.map(i=>i.text),['Book bike tune-up','Sort the garage so the contractor can start the deck',"Renew library card"]);
const upr=L.upcomingItems(s2,{recurring:true});assert.strictEqual(upr[0].text,'Take out recycling');assert(upr.length>up.length);
assert.strictEqual(L.dateBucket(L.addDays(L.today(),-3)).label,'Earlier');
assert.strictEqual(L.dateBucket(L.today()).label,'Today');assert.strictEqual(L.dateBucket(L.addDays(L.today(),1)).label,'Tomorrow');
assert.strictEqual(L.dateBucket(L.addDays(L.today(),5)).label,'Next 7 days');
console.log(L.dateBucket(L.addDays(L.today(),10)).label,'|',L.dateBucket(L.addDays(L.today(),25)).label);
console.log('upcoming ok');
// ta-da
const s3=L.seed();
const cnt=(d,r)=>L.tadaEntries(s3,{days:d,recurring:r}).length;
assert.deepStrictEqual([7,30,90,365].map(d=>cnt(d,true)),[3,7,8,10]);
assert.deepStrictEqual([7,30,90,365].map(d=>cnt(d,false)),[1,3,4,5]);
const te=L.tadaEntries(s3,{days:365,recurring:true});assert(te.every((e,i)=>i===0||te[i-1].at>=e.at));
assert.strictEqual(L.fmtPast(L.today()),'Today');assert.strictEqual(L.fmtPast(L.addDays(L.today(),-1)),'Yesterday');
console.log(L.fmtPast(L.addDays(L.today(),-3)),L.fmtPast(L.addDays(L.today(),-20)),L.fmtPast(L.addDays(L.today(),-300)),'|',L.pastBucket(L.addDays(L.today(),-5)).label,L.pastBucket(L.addDays(L.today(),-9)).label,L.pastBucket(L.addDays(L.today(),-40)).label,L.pastBucket(L.addDays(L.today(),-300)).label);
// completing logs rec flag
const s4=L.seed();const vac4=s4.items.find(i=>i.text.startsWith("Mop"));L.completeItem(s4,vac4.id);assert.strictEqual(s4.log[s4.log.length-1].rec,true);
// purge
const s5=L.seed();const tt=s5.items.find(i=>i.type==='todo'&&!i.done);L.completeItem(s5,tt.id,Date.now()-40*86400000);
let rp=L.purgeOld(s5,Date.now(),30,365);assert.strictEqual(rp.items,1);assert.strictEqual(rp.logs,0);
assert(s5.items.find(i=>i.id===tt.id)===undefined);assert(s5.log.some(e=>e.itemId===tt.id),'history survives');
rp=L.purgeOld(s5,Date.now(),0,100);assert(rp.logs>=2);
assert.strictEqual(L.purgeOld(L.seed(),Date.now(),0,0).items,0);
const s6=L.seed();assert.strictEqual(L.clearDone(s6,'shopping'),1);assert.strictEqual(L.clearDone(s6,'shopping'),0);
console.log('tada ok');
// check-in
const c1=L.seed();
assert.strictEqual(L.daysSince(c1.checkin.at),9);
assert(L.checkinDue(c1,7));assert(!L.checkinDue(c1,14));
c1.checkin.at=null;assert(L.checkinDue(c1,30));
c1.checkin.at=Date.now();assert.strictEqual(L.daysSince(c1.checkin.at),0);assert(!L.checkinDue(c1,7));
assert.deepStrictEqual([0,25,26,40,41,60,61,75,76,100].map(L.ratingLabel),['Neglected','Neglected','Leaning low','Leaning low','Balanced','Balanced','Leaning high','Leaning high','Over-focused','Over-focused']);
assert.strictEqual(L.ratingLabel(undefined),'Not set');
const gg=L.ratingGroups(L.seed());assert.deepStrictEqual(gg.low.map(c=>c.id),['fitness','housework','garden','calm','hobbies']);assert.deepStrictEqual(gg.high.map(c=>c.id),['cooking','career']);
console.log('checkin ok');
