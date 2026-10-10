/* Test-only sample data (personal-style). Not shipped in the app's code path. */
function seed() {
  var H = typeof module !== 'undefined' ? require('../js/logic.js') : { today: today, addDays: addDays, uid: uid };
  return (function (today, addDays, uid) {
  const t = today();
  const cats = [
    ['fitness', 'Fitness', 'teal'], ['cooking', 'Cooking', 'apricot'], ['housework', 'Housework', 'sky'],
    ['garden', 'Garden', 'clay'], ['shopping', 'Shopping', 'sand'], ['career', 'Career', 'slate'],
    ['calm', 'Calm', 'lilac'], ['friends', 'Friends', 'rose'], ['paperwork', 'Paperwork', 'moss'],
    ['hobbies', 'Hobbies', 'plum']
  ].map((c) => ({ id: c[0], name: c[1], color: c[2], icon: ({fitness:'dumbbell',cooking:'utensils',housework:'sparkle',garden:'leaf',shopping:'bag',career:'briefcase',calm:'moon',friends:'people',paperwork:'file',hobbies:'book'})[c[0]] }));
  let n = 0;
  const it = (catId, type, text, o) => Object.assign({
    id: uid('i'), catId, type, text, desc: '', due: null, freq: null, pinned: false, later: false,
    done: false, doneAt: null, manual: false, tags: [], order: n++
  }, o || {});
  const wk = (k) => ({ n: k, unit: 'week' });
  const items = [
    it('fitness', 'goal', 'Run twice a week'),
    it('fitness', 'goal', 'Swim once a week'),
    it('fitness', 'goal', 'Cycle 3 times a week', { tags: ['active'] }),
    it('fitness', 'note', 'Do 10 squats at each break', { tags: ['active', 'quick'] }),
    it('cooking', 'goal', 'Try one new recipe a week'),
    it('cooking', 'goal', 'Prep lunches on Sunday'),
    it('housework', 'recurring', 'Mop kitchen floor', { due: addDays(t, 2), freq: wk(1), tags: ['active'] }),
    it('housework', 'recurring', 'Wash windows', { due: addDays(t, 5), freq: wk(2), tags: ['active'] }),
    it('housework', 'recurring', 'Take out recycling', { due: addDays(t, 1), freq: wk(1), tags: ['quick'] }),
    it('housework', 'recurring', 'Clean the oven', { due: addDays(t, 70), freq: { n: 6, unit: 'month' } }),
    it('garden', 'todo', 'Sort the garage so the contractor can start the deck', { due: addDays(t, 10), desc: 'Clear the walls first.' }),
    it('garden', 'todo', 'Ask the contractor for a deck quote'),
    it('shopping', 'todo', 'Book bike tune-up', { due: addDays(t, 6) }),
    it('shopping', 'todo', 'Pick up printer paper', { tags: ['quick'] }),
    it('shopping', 'todo', 'Return the borrowed ladder', { done: true, doneAt: Date.now() - 86400000 }),
    it('career', 'note', 'Team standup: Thursday mornings', { pinned: true }),
    it('calm', 'goal', 'Practice breathing most mornings'),
    it('calm', 'goal', 'Journal before bed', { tags: ['quick'] }),
    it('calm', 'todo', 'Reread the saved articles'),
    it('friends', 'recurring', 'Monthly board game night', { due: addDays(t, 12), freq: { n: 1, unit: 'month' } }),
    it('paperwork', 'recurring', 'Monthly budget check', { due: addDays(t, 4), freq: { n: 1, unit: 'month' } }),
    it('paperwork', 'todo', "Renew library card", { due: addDays(t, 25) }),
    it('hobbies', 'goal', 'Sketch most days'),
    it('inbox', 'todo', 'Look up kayak rentals', { tags: [] }),
    it('inbox', 'note', 'Idea: plan a day trip')
  ];
  const done = items.find((i) => i.done);
  const ago = (n) => Date.now() - n * 86400000;
  const entry = (text, catId, n, rec, itemId) => ({ id: uid('l'), itemId: itemId || '', text, catId, at: ago(n), rec });
  const idOf = (t) => (items.find((i) => i.text === t) || {}).id;
  const log = [
    { id: uid('l'), itemId: done.id, text: done.text, catId: done.catId, at: done.doneAt, rec: false },
    entry('Mop kitchen floor', 'housework', 3, true, idOf('Mop kitchen floor')),
    entry('Take out recycling', 'housework', 5, true, idOf('Take out recycling')),
    entry('Book eye exam', 'shopping', 9, false),
    entry('Weed the front bed', 'garden', 14, false),
    entry('Monthly board game night', 'friends', 20, true, idOf('Monthly board game night')),
    entry('Monthly budget check', 'paperwork', 26, true, idOf('Monthly budget check')),
    entry('Renew bus pass', 'paperwork', 45, false),
    entry('Clean the oven', 'housework', 120, true, idOf('Clean the oven')),
    entry('Replace porch light bulb', 'garden', 200, false)
  ];
  const checkin = {
    ratings: { fitness: 22, cooking: 62, housework: 40, garden: 28, shopping: 45, career: 85, calm: 35, friends: 50, paperwork: 55, hobbies: 30 },
    at: Date.now() - 9 * 86400000,
    notes: ''
  };
  const h = (daysAgo, ratings, notes) => ({ id: uid('h'), at: ago(daysAgo), ratings, notes });
  const checkinHistory = [
    h(118, { fitness: 30, cooking: 55, housework: 48, garden: 40, shopping: 50, career: 60, calm: 45, friends: 55, paperwork: 50, hobbies: 35 }, 'Settling into a new routine.'),
    h(90, { fitness: 25, cooking: 58, housework: 45, garden: 35, shopping: 48, career: 68, calm: 40, friends: 52, paperwork: 52, hobbies: 32 }, ''),
    h(63, { fitness: 20, cooking: 60, housework: 42, garden: 30, shopping: 46, career: 75, calm: 38, friends: 50, paperwork: 53, hobbies: 30 }, 'Work has been a lot.'),
    h(42, { fitness: 18, cooking: 61, housework: 41, garden: 29, shopping: 46, career: 80, calm: 36, friends: 49, paperwork: 54, hobbies: 29 }, ''),
    h(23, { fitness: 20, cooking: 62, housework: 40, garden: 28, shopping: 45, career: 83, calm: 35, friends: 50, paperwork: 55, hobbies: 30 }, 'Trying to carve out more rest time.'),
    h(9, checkin.ratings, checkin.notes)
  ];
  return {
    cats, items,
    tags: ['quick', 'active'],
    log,
    checkin,
    checkinHistory,
    notes: { html: '', updatedAt: null },
    settings: {}
  };
  })(H.today, H.addDays, H.uid);
}
if (typeof module !== 'undefined') module.exports = { seed };
