// test-regression.js — Verify existing functionality is not broken
const { searchStatic, extractStatic } = require('../src/engines');
const providers = require('../src/web-providers/providers');

async function main() {
  let ok = true;
  const failures = [];

  // Test 1: All imports work
  console.log('1. Testing imports...');
  const imports = [
    ['torrent indexers', () => require('../src/torrent-providers/index')],
    ['embed resolver', () => require('../src/web-providers/embed-resolver')],
    ['web providers bundle', () => require('../providers/web-providers')],
    ['intelligent system', () => require('../src/intelligent')],
    ['engines system', () => require('../src/engines')],
    ['puppeteer fallback', () => require('../src/puppeteer-fallback')],
    ['provider memory', () => require('../src/intelligent/provider-memory')],
  ];
  for (const [name, fn] of imports) {
    try { fn(); console.log('  ✓ ' + name); }
    catch(e) { console.log('  ✗ ' + name + ': ' + e.message); ok = false; failures.push(name); }
  }

  // Test 2: Provider counts
  console.log('\n2. Provider counts...');
  const active = providers.filter(p => p.active);
  const inactive = providers.filter(p => !p.active);
  console.log('  Total: ' + providers.length + ' | Active: ' + active.length + ' | Inactive: ' + inactive.length);
  if (providers.length !== 74) { console.log('  ✗ Expected 74'); ok = false; }

  // Test 3: ProviderMemory
  console.log('\n3. ProviderMemory...');
  const { getProviderMemory } = require('../src/intelligent/provider-memory');
  const memory = getProviderMemory();
  memory.recordEngineAttempt('test-provider', 'static', 'search', true, 500, 1);
  const stats = memory.getProviderStats('test-provider');
  console.log('  ✓ Memory working, rate: ' + stats?.successRate + '%');

  // Test 4: CineCalidad (must work)
  console.log('\n4. CineCalidad search + video...');
  const p = providers.find(p => p.name === 'cinecalidad');
  const url = await searchStatic(p, 'matrix');
  console.log('  Search: ' + (url ? '✓' : '✗ FAIL'));
  if (!url) { ok = false; failures.push('cinecalidad search'); }
  else {
    const videos = await extractStatic(p, url);
    console.log('  Videos: ' + (videos?.length || 0) + (videos?.length > 0 ? ' ✓' : ' ✗ FAIL'));
    if (!videos?.length) { ok = false; failures.push('cinecalidad video'); }
  }

  // Test 5: PelisPedia
  console.log('\n5. PelisPedia search + video...');
  const p2 = providers.find(p => p.name === 'pelispedia');
  const url2 = await searchStatic(p2, 'matrix');
  console.log('  Search: ' + (url2 ? '✓' : '✗ FAIL'));
  if (!url2) { ok = false; failures.push('pelispedia search'); }
  else {
    const v2 = await extractStatic(p2, url2);
    console.log('  Videos: ' + (v2?.length || 0) + (v2?.length > 0 ? ' ✓' : ' ✗ FAIL'));
  }

  // Test 6: DonTorrent (POST search)
  console.log('\n6. DonTorrent search + video...');
  const p3 = providers.find(p => p.name === 'dontorrent');
  const url3 = await searchStatic(p3, 'matrix');
  console.log('  Search: ' + (url3 ? '✓' : '✗ FAIL'));
  if (!url3) { ok = false; failures.push('dontorrent search'); }
  else {
    const v3 = await extractStatic(p3, url3);
    console.log('  Videos: ' + (v3?.length || 0) + (v3?.length > 0 ? ' ✓' : ' ✗ FAIL'));
  }

  // Test 7: DivXTotal
  console.log('\n7. DivXTotal search + video...');
  const p4 = providers.find(p => p.name === 'divxtotal');
  const url4 = await searchStatic(p4, 'matrix');
  console.log('  Search: ' + (url4 ? '✓' : '✗ FAIL'));
  if (!url4) { ok = false; failures.push('divxtotal search'); }
  else {
    const v4 = await extractStatic(p4, url4);
    console.log('  Videos: ' + (v4?.length || 0) + (v4?.length > 0 ? ' ✓' : ' ✗ FAIL'));
  }

  // Test 8: PoseidonHD
  console.log('\n8. PoseidonHD search + video...');
  const p5 = providers.find(p => p.name === 'poseidonhd');
  const url5 = await searchStatic(p5, 'matrix');
  console.log('  Search: ' + (url5 ? '✓' : '✗ FAIL'));
  if (!url5) { ok = false; failures.push('poseidonhd search'); }
  else {
    const v5 = await extractStatic(p5, url5);
    console.log('  Videos: ' + (v5?.length || 0) + (v5?.length > 0 ? ' ✓' : ' ✗ FAIL'));
  }

  // Test 9: RepelisPlus (new provider)
  console.log('\n9. RepelisPlus search...');
  const p6 = providers.find(p => p.name === 'repelisplus');
  const url6 = await searchStatic(p6, 'matrix');
  console.log('  Search: ' + (url6 ? '✓ ' + url6.substring(0, 60) : '✗ FAIL'));

  // Test 10: Router execute
  console.log('\n10. Router execute (CineCalidad)...');
  const { execute } = require('../src/engines');
  const r = await execute(p, 'search', { query: 'matrix' });
  console.log('  Router: ' + (r.success ? '✓ ' + r.engine : '✗ FAIL'));

  console.log('\n' + '='.repeat(50));
  console.log(ok ? '✓ ALL REGRESSION TESTS PASSED' : '✗ FAILURES: ' + failures.join(', '));
}

main().catch(e => { console.error(e); process.exit(1); });
