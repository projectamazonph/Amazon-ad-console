const fs = require('fs');
const vm = require('vm');
const path = require('path');
const htmlPath = path.join(__dirname, 'amazon_ppc_simulator.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (!scriptMatch) throw new Error('Missing script block');
const js = scriptMatch[1];
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
const checks = [];
function pass(name) { checks.push({ name, status: 'passed' }); }

assert(html.includes("const APP_VERSION = '3.4'"), 'APP_VERSION is not 3.4'); pass('version is 3.4');
assert((html.match(/V3\.3 guided navigation drill layer/g) || []).length === 1, 'V3.3 layer should appear exactly once'); pass('single V3.3 layer');
assert(html.includes("navItem('navDrills'"), 'Guided drills sidebar item missing'); pass('sidebar has Guided drills');
assert(html.includes('navigationDrillResults'), 'Navigation drill result state missing'); pass('drill result state exists');
assert(html.includes('wrong-click blocking') || html.includes('Wrong-click'), 'Wrong-click documentation missing'); pass('wrong-click documentation present');
assert(html.includes('nav-sp-search-term-negative') && html.includes('nav-sd-audience-path'), 'Expected drill ids missing'); pass('drill definitions present');

const root = {
  _html: '',
  set innerHTML(v) { this._html = String(v); },
  get innerHTML() { return this._html; },
  addEventListener() {},
  removeEventListener() {},
  querySelector() { return null; },
  querySelectorAll() { return []; },
  classList: { add(){}, remove(){} },
  scrollIntoView() {},
};
const doc = {
  querySelector(sel) { return sel === '#root' ? root : null; },
  querySelectorAll() { return []; },
  createElement() { return { click(){}, set href(v){ this._href = v; }, set download(v){ this._download = v; } }; }
};
const context = {
  document: doc,
  localStorage: { getItem(){ return null; }, setItem(){}, removeItem(){} },
  setTimeout(fn) { return 0; },
  clearTimeout() {},
  URL: { createObjectURL(){ return 'blob:test'; }, revokeObjectURL(){} },
  Blob: function Blob(){},
  navigator: { clipboard: { writeText(){} } },
  console,
  Math,
  Date,
  JSON,
  Number,
  String,
  Array,
  Object,
  Map,
  Set,
  RegExp,
  parseFloat,
  parseInt,
  isNaN,
};
context.window = context;
const vmContext = vm.createContext(context);
vm.runInContext(js, vmContext, { timeout: 3000, filename: 'amazon_ppc_simulator_check.js' });
assert(root.innerHTML.includes('Ads Console Training Simulator'), 'Initial render missing simulator topbar'); pass('initial render works');
assert(root.innerHTML.includes('Guided drills'), 'Initial render missing Guided drills navigation'); pass('initial nav render includes Guided drills');

vm.runInContext("setView('navDrills');", vmContext, { timeout: 1000 });
assert(root.innerHTML.includes('Guided navigation drills'), 'Guided drills page did not render'); pass('guided drills page renders');
assert(root.innerHTML.includes('Find and block waste from Search terms'), 'SP negative drill card missing'); pass('SP negative drill card renders');
assert(root.innerHTML.includes('Find Sponsored Display audience targeting'), 'SD audience drill card missing'); pass('SD audience drill card renders');

vm.runInContext("v33StartNavigationDrill('nav-sp-search-term-negative');", vmContext, { timeout: 1000 });
assert(root.innerHTML.includes('Guided navigation'), 'Active drill rail missing after start'); pass('active drill rail renders');
assert(root.innerHTML.includes('Open Campaign manager'), 'First guided step missing after start'); pass('first drill step renders');

vm.runInContext(`
resetAll();
v33StartNavigationDrill('nav-sp-search-term-negative');
setView('campaigns'); v33EvaluateNavigationDrill(false);
selectCampaign('C-SP-AUTO-001'); v33EvaluateNavigationDrill(false);
setSelectedTab('searchTerms'); v33EvaluateNavigationDrill(false);
addNegative('C-SP-AUTO-001','paper coffee filters bulk','Negative exact'); v33EvaluateNavigationDrill(false);
setSelectedTab('negatives'); v33EvaluateNavigationDrill(false);
`, vmContext, { timeout: 3000 });
assert(root.innerHTML.includes('Navigation drill complete'), 'SP navigation drill did not complete'); pass('SP drill completes through operations');
assert(root.innerHTML.includes('Score 100%'), 'SP drill did not score 100 on clean path'); pass('SP drill scoring works');

vm.runInContext(`
setView('navDrills');
v33StartNavigationDrill('nav-report-request');
v33SkipNavigationStep();
v33SkipNavigationStep();
v33SkipNavigationStep();
`, vmContext, { timeout: 3000 });
assert(root.innerHTML.includes('Navigation drill complete'), 'Skipped report drill did not complete'); pass('skip path completes drill');
assert(root.innerHTML.includes('Skips: 3'), 'Skip count not shown after skipped drill'); pass('skip count shown');

// V3.4 Multi-User Profiles validation tests
assert(root.innerHTML.includes('Trainee:'), 'Topbar rendering is missing user profile section');
pass('profile section in topbar');

vm.runInContext("setView('trainer');", vmContext, { timeout: 1000 });
assert(root.innerHTML.includes('Trainee Profiles Management'), 'Trainer dashboard missing profiles management section');
pass('profiles management section on trainer dashboard');

vm.runInContext("v34CreateProfile('Jane Doe');", vmContext, { timeout: 1000 });
assert(root.innerHTML.includes('Jane Doe'), 'New profile "Jane Doe" is not active after creation');
pass('can create and switch to a new user profile');

// Test state isolation between profiles
vm.runInContext(`
  // Modify campaign budget in current active profile (Jane Doe)
  state.campaigns[0].dailyBudget = 999;
  persistState();
  // Switch back to default profile
  v34SwitchProfile('p-default');
`, vmContext, { timeout: 1000 });

// Default profile budget should remain untouched (original 35)
const defaultBudget = vm.runInContext("state.campaigns[0].dailyBudget", vmContext);
assert(defaultBudget === 35, 'Profile switching failed to isolate state data');
pass('user profiles maintain separate, isolated workspaces');

// Test profile deletion
vm.runInContext(`
  const jane = profilesIndex.find(p => p.name === 'Jane Doe');
  if (jane) {
    v34DeleteProfile(jane.id);
  }
`, vmContext, { timeout: 1000 });
const finalProfilesLength = vm.runInContext("profilesIndex.length", vmContext);
assert(finalProfilesLength === 1, 'Profile deletion failed');
pass('can safely delete user profiles');

vm.runInContext('exportTrainerLog(); exportDocs();', vmContext, { timeout: 3000 });
pass('trainer log and docs export functions run');

const result = {
  status: 'passed',
  version: '3.4',
  passCount: checks.length,
  failureCount: 0,
  checks,
  qaScope: [
    'static version and module checks',
    'JavaScript VM render smoke test',
    'Guided drills page render',
    'Active drill rail render',
    'SP negative drill completion path',
    'Skip/completion path',
    'Trainer log and docs export execution'
  ]
};
const resultsPath = path.join(__dirname, 'amazon_ppc_simulator_v3_4_qa_results.json');
fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
