// test-autonomous.js — Prueba del sistema inteligente contra sitios de anime reales
// node scripts/test-autonomous.js
// Prueba: quickExtract (sin exploracion recursiva, 2-15s)
// Prueba: clasificacion de URLs y deteccion de servidores

const { createBrowser, createPage, AutonomousScraper, setupResourceBlocking, getSessionMemory, SmartAnalyzer } = require('../src/intelligent');

async function testQuickExtract(name, url) {
  console.log('\n' + '='.repeat(60));
  console.log('[' + name + '] ' + url);

  let browser;
  try {
    browser = await createBrowser({ headless: true, stealth: true });
    const page = await createPage(browser, { stealth: true });
    await setupResourceBlocking(page);

    const scraper = new AutonomousScraper(page, { maxRequests: 15 });

    const start = Date.now();
    const result = await scraper.quickExtract(url);
    const duration = Date.now() - start;

    const f = result.findings;
    console.log('  PageType: ' + (result.pageType || '?').padEnd(12) + 'Duracion: ' + (duration / 1000).toFixed(1) + 's');
    console.log('  Servers/embed: ' + f.serverUrls.length + '  Videos: ' + f.videoUrls.length + '  Downloads: ' + f.downloadUrls.length);

    if (f.serverUrls.length > 0) {
      console.log('  Top embed URLs:');
      f.serverUrls.slice(0, 5).forEach(function(u) { console.log('    ' + u.slice(0, 90)); });
    }
    if (f.videoUrls.length > 0) {
      console.log('  Direct videos:');
      f.videoUrls.slice(0, 3).forEach(function(u) { console.log('    ' + u.slice(0, 90)); });
    }

    if (result.serverCatalog && result.serverCatalog.length > 0) {
      console.log('  Server catalog:');
      result.serverCatalog.slice(0, 5).forEach(function(s) {
        console.log('    ' + s.name.padEnd(14) + s.urls.length + ' URLs');
      });
    }

    return { name, url, ok: true, duration, servers: f.serverUrls.length, videos: f.videoUrls.length };
  } catch (err) {
    console.log('  ERROR: ' + err.message);
    return { name, url, ok: false, duration: 0, error: err.message };
  } finally {
    if (browser) { try { await browser.close(); } catch {} }
  }
}

async function testClassify() {
  console.log('\n' + '='.repeat(60));
  console.log('Clasificacion de URLs conocidas (SmartAnalyzer)');

  const ai = new SmartAnalyzer();
  const tests = [
    'https://streamwish.to/e/abc123',
    'https://uqload.com/embed-xyz.html',
    'https://dood.ws/e/abc123',
    'https://mixdrop.co/e/abc',
    'https://mega.nz/file/xyz',
    'https://ok.ru/video/1234',
    'https://animejara.com/ver/naruto-1',
    'https://tioanime.com/ver/naruto-1',
    'https://discord.gg/invite',
    'https://video.mp4',
    'https://cdn.playlist.m3u8',
  ];

  tests.forEach(function(u) {
    const c = ai.classifyURL(u);
    const server = ai.inferServerName(ai.extractDomain(u));
    console.log('  ' + c.type.padEnd(14) + ' container=' + String(c.isContainer).padEnd(6) + ' conf=' + String(c.confidence).padEnd(4) + ' ' + server.padEnd(14) + u.slice(0, 50));
  });
}

async function testServerCache() {
  console.log('\n' + '='.repeat(60));
  console.log('Cache de servidores (SessionMemory)');

  const mem = getSessionMemory();
  const domains = ['streamwish.to', 'animejara.com', 'uqload.com', 'unknown.xyz', 'tioanime.com'];
  domains.forEach(function(d) {
    console.log('  ' + d.padEnd(20) + ' known=' + String(mem.isKnownContainerDomain(d)).padEnd(6) + ' topClasses=' + (mem.getTopClassesForDomain(d, 3).join(', ') || 'none'));
  });
  console.log('  Total attempts: ' + mem.totalAttempts + '  Success rate: ' + Math.round(mem.getSuccessRate() * 100) + '%');
}

async function main() {
  console.log('Sistema de Scraping Inteligente — Pruebas\n');

  // Test 1: SmartAnalyzer classification (no browser needed)
  await testClassify();

  // Test 2: quickExtract on real anime sites
  // Using URLs that match ovnivers scraper patterns
  const sites = [
    { name: 'AnimeFLV', url: 'https://www3.animeflv.net' },
    { name: 'AnimeJara', url: 'https://animejara.com' },
  ];

  const results = [];
  for (const s of sites) {
    const r = await testQuickExtract(s.name, s.url);
    results.push(r);
  }

  // Test 3: SessionMemory state
  await testServerCache();

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('RESUMEN');
  console.log('='.repeat(60));
  results.forEach(function(r) {
    if (r.ok) {
      console.log('  ' + r.name.padEnd(14) + (r.duration / 1000).toFixed(1) + 's  servers=' + r.servers + '  videos=' + r.videos);
    } else {
      console.log('  ' + r.name.padEnd(14) + 'ERROR: ' + r.error);
    }
  });

  getSessionMemory().forceSave();
  console.log('\nOK — Memoria guardada en .scraper-memory.json');
  process.exit(0);
}

main().catch(function(err) {
  console.error('Fatal: ' + err.message);
  process.exit(1);
});
