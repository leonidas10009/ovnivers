// discover-animejara.js — Use autonomous scraper to discover AnimeJara structure
// node scripts/discover-animejara.js
const { createBrowser, createPage, AutonomousScraper, setupResourceBlocking, getSessionMemory } = require('../src/intelligent');

(async () => {
  console.log('Descubriendo estructura de AnimeJara...\n');

  const browser = await createBrowser({ headless: true, stealth: true });
  const page = await createPage(browser, { stealth: true });
  await setupResourceBlocking(page);

  const scraper = new AutonomousScraper(page, { maxRequests: 20, maxDepth: 1 });
  const url = 'https://animejara.com/episode/naruto-1x1/';

  console.log('URL: ' + url);
  const result = await scraper.quickExtract(url);

  console.log('\nPagina tipo: ' + (result.pageType || '?') + ' (conf=' + result.pageConfidence + ')');
  console.log('Duracion: ' + (result.durationMs / 1000).toFixed(1) + 's');
  console.log('Pasos: ' + (result.steps || []).length);

  if (result.steps) {
    result.steps.forEach(s => console.log('  [' + s.step + '] ' + s.action + ': ' + s.reasoning.slice(0, 80)));
  }

  console.log('\nURLs encontradas:');
  const f = result.findings;
  console.log('  Servidores/embed: ' + f.serverUrls.length);
  console.log('  Videos directos: ' + f.videoUrls.length);
  console.log('  Descargas: ' + f.downloadUrls.length);

  if (f.serverUrls.length > 0) {
    console.log('\nTop embed URLs:');
    f.serverUrls.slice(0, 10).forEach(u => console.log('  ' + u.slice(0, 100)));
  }
  if (f.videoUrls.length > 0) {
    console.log('\nDirect videos:');
    f.videoUrls.slice(0, 5).forEach(u => console.log('  ' + u.slice(0, 100)));
  }

  if (result.serverCatalog && result.serverCatalog.length > 0) {
    console.log('\nServer catalog:');
    result.serverCatalog.slice(0, 10).forEach(s => {
      console.log('  ' + s.name + ' (' + s.urls.length + '):');
      s.urls.slice(0, 2).forEach(u => console.log('    ' + (u.type || '?').padEnd(14) + u.url.slice(0, 60)));
    });
  }

  // Show what selectors the scraper learned
  const mem = getSessionMemory();
  const fp = mem.getDomainFingerprint('animejara.com');
  if (fp) {
    console.log('\nSelectores aprendidos para animejara.com:');
    console.log('  Exitosos:');
    fp.successfulClasses.forEach((count, cls) => console.log('    .' + cls + ' (x' + count + ')'));
    console.log('  Fallidos:');
    fp.failedClasses.forEach((count, cls) => console.log('    .' + cls + ' (x' + count + ')'));
  }

  mem.forceSave();
  await browser.close();
  console.log('\nMemoria guardada.');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
