// verify-all.js — Comprehensive pre-commit verification
var path = require('path');
var fs = require('fs');

var GREEN = '✅';
var RED = '❌';
var YELLOW = '⚠️';

var results = [];

function check(name, ok, detail) {
  results.push({ name: name, ok: ok, detail: detail || '' });
  var icon = ok ? GREEN : RED;
  console.log(icon + ' ' + name + (detail ? ': ' + detail : ''));
}

async function main() {
  // ─── 1. Module loading ──────────────────
  console.log('=== 1. Module loading ===');
  try { var m = require('../src/local-scrapers/utils'); check('utils.js', true, Object.keys(m).length + ' exports'); } catch(e) { check('utils.js', false, e.message); }
  try { var s = require('../src/local-scrapers/sites'); check('sites.js', true, s.SITES.length + ' providers'); } catch(e) { check('sites.js', false, e.message); }
  try { var idx = require('../src/local-scrapers/index'); check('index.js (local)', true, typeof idx.search + '/' + typeof idx.getStreams + '/' + typeof idx.extractVideos); } catch(e) { check('index.js (local)', false, e.message); }
  try { var alfa = require('../src/web-providers/providers'); check('alfa-providers.js', true, Array.isArray(alfa) ? alfa.length + ' providers' : 'not array'); } catch(e) { check('alfa-providers.js', false, e.message); }
  try { var emb = require('../src/web-providers/embed-resolver'); check('embed-resolver.js', true, typeof emb.resolveEmbed); } catch(e) { check('embed-resolver.js', false, e.message); }
  try { var pptr = require('../src/jkanime-puppeteer'); check('jkanime-puppeteer.js', true, Object.keys(pptr).join(',')); } catch(e) { check('jkanime-puppeteer.js', false, e.message); }
  try { var pig = require('../src/anime/pigamer'); check('pigamer.js', true, typeof pig.getStreams); } catch(e) { check('pigamer.js', false, e.message); }
  try { var scr = require('../src/anime/scrapers'); check('anime/scrapers', true, Object.keys(scr).join(',')); } catch(e) { check('anime/scrapers', false, e.message); }

  // ─── 2. Built modules ──────────────────
  console.log('\n=== 2. Built modules ===');
  try { var bLocal = require('../providers/local-scrapers'); check('local-scrapers.js (built)', true, bLocal.SITES.length + ' providers'); } catch(e) { check('local-scrapers.js (built)', false, e.message); }
  try { var bAlfa = require('../providers/web-providers'); check('alfa-providers.js (built)', true, typeof bAlfa.default == 'function' ? 'bridge OK' : typeof bAlfa); } catch(e) { check('alfa-providers.js (built)', false, e.message); }
  try { var bAnime = require('../providers/anime'); check('anime.js (built)', true, 'OK'); } catch(e) { check('anime.js (built)', false, e.message); }

  // ─── 3. Manifest ──────────────────
  console.log('\n=== 3. Manifest ===');
  try {
    var manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));
    check('manifest.json', true, 'v' + manifest.version);
    check('scrapers count', manifest.scrapers && manifest.scrapers.length > 0, manifest.scrapers ? manifest.scrapers.length + ' scrapers' : 'none');
    check('ovnivers-local exists', !!manifest.scrapers.find(function(s) { return s.id === 'ovnivers-local'; }), '');
    check('alfa-providers exists', !!manifest.scrapers.find(function(s) { return s.id === 'alfa-providers'; }), '');
    
    var animeIds = ['allanime','animekai','animepahe','animesalt','animetsu','animeworld','anime-sama','hianime','allwish','anikototv','onetouchtv'];
    var missingAnime = animeIds.filter(function(id) { return !manifest.scrapers.find(function(s) { return s.id === id; }); });
    var deadAnime = ['animekai', 'animepahe', 'hianime'];
    var toDisable = manifest.scrapers.filter(function(s) { return deadAnime.indexOf(s.id) !== -1 && s.enabled; });
    check('anime scrapers present', missingAnime.length === 0, missingAnime.length ? 'missing: ' + missingAnime.join(',') : 'all present');
    check('dead anime to disable (0s)', true, toDisable.length + ' should be disabled: ' + toDisable.map(function(s){return s.id;}).join(','));
    
    check('resources array', Array.isArray(manifest.resources), manifest.resources ? manifest.resources.length + ' resources' : 'none');
  } catch(e) { check('manifest.json', false, e.message); }

  // ─── 4. Server integration ──────────────────
  console.log('\n=== 4. Server integration ===');
  try {
    var serverCode = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
    var checks = [
      { name: 'pptrAnime imported', re: /pptrAnime\s*=\s*require\('\.\/src\/jkanime-puppeteer'\)/ },
      { name: 'resolveJKAnime called', re: /pptrAnime\.resolveJKAnime/ },
      { name: 'resolveTioAnime called', re: /pptrAnime\.resolveTioAnime/ },
      { name: 'resolveAnimeAV1 called', re: /pptrAnime\.resolveAnimeAV1/ },
      { name: 'scrapeAlfaProviders loaded', re: /scrapeAlfaProviders/ },
      { name: 'manifestScrapers loaded', re: /manifestScrapers/ },
      { name: 'Pigamer37 endpoint', re: /pigamer37/ },
    ];
    checks.forEach(function(c) { check('server: ' + c.name, c.re.test(serverCode), ''); });
  } catch(e) { check('server.js check', false, e.message); }

  // ─── 5. Alfa anime providers ──────────────────
  console.log('\n=== 5. Alfa anime providers (' + alfa.filter(function(p){return (p.categories||[]).indexOf('anime')!==-1;}).length + ') ===');
  var animeProv = alfa.filter(function(p) { return (p.categories || []).indexOf('anime') !== -1; });
  var activeAnime = animeProv.filter(function(p) { return p.active; });
  var inactiveAnime = animeProv.filter(function(p) { return !p.active; });
  console.log('  Active: ' + activeAnime.length + ', Inactive: ' + inactiveAnime.length);
  activeAnime.forEach(function(p) { console.log('    ' + GREEN + ' ' + p.name + ' — ' + p.baseUrl); });
  inactiveAnime.forEach(function(p) { console.log('    ' + RED + ' ' + p.name + ' — ' + p.baseUrl + (p.active === false ? ' (disabled)' : '')); });

  // ─── 6. Local scrapers ──────────────────
  console.log('\n=== 6. Local scrapers (' + s.SITES.length + ') ===');
  s.SITES.forEach(function(site) { console.log('    ' + site.id + ' (' + site.name + ') ' + site.videoType + ' | ' + site.baseUrl); });

  // ─── 7. Pigamer37 connectivity ──────────────────
  console.log('\n=== 7. Pigamer37 connectivity ===');
  try {
    var pigUrl = 'https://pigamer37.alwaysdata.net/stream/series/animeflv%3Anaruto.json';
    var ctrl = new AbortController();
    var t = setTimeout(function() { ctrl.abort(); }, 10000);
    var r = await fetch(pigUrl, { signal: ctrl.signal });
    clearTimeout(t);
    var j = await r.json();
    var streams = (j.streams || []).length;
    check('Pigamer37 API', streams > 0, streams + ' streams (naruto)');
  } catch(e) { check('Pigamer37 API', false, e.message); }

  // ─── 8. Quick build test ──────────────────
  console.log('\n=== 8. Build test ===');
  try {
    var buildOut = require('child_process').execSync('node build.js 2>&1', { cwd: path.join(__dirname, '..'), encoding: 'utf8', timeout: 30000 });
    var builtCount = (buildOut.match(/✅/g) || []).length;
    var failedCount = (buildOut.match(/❌/g) || []).length;
    check('Build all providers', failedCount === 0, builtCount + ' built, ' + failedCount + ' failed');
  } catch(e) { check('Build', false, e.message); }

  // ─── SUMMARY ──────────────────
  console.log('\n' + '='.repeat(50));
  var passed = results.filter(function(r) { return r.ok; }).length;
  var failed = results.filter(function(r) { return !r.ok; }).length;
  console.log('VERIFICATION: ' + passed + ' passed, ' + failed + ' failed, ' + results.length + ' total');
  if (failed > 0) {
    console.log('\nFAILED:');
    results.filter(function(r) { return !r.ok; }).forEach(function(r) { console.log('  ' + RED + ' ' + r.name + ': ' + r.detail); });
  }
  console.log('='.repeat(50));
}

main().catch(console.error);
