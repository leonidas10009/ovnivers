// test-all-anime.js — Prueba completa de todos los sitios de anime contra el sistema inteligente
// node scripts/test-all-anime.js
// Categoriza: accesibilidad, tipo de pagina, URLs extraibles, velocidad

const { createBrowser, createPage, setupResourceBlocking, SmartAnalyzer, StaticScraper, getSessionMemory } = require('../src/intelligent');

// ─── Sitios de anime que ovnivers scrapea ────────────────────
const ANIME_SITES = [
  // Native scrapers (src/anime/scrapers/)
  { name: 'JKAnime',     base: 'https://jkanime.net',           epFormat: '/{slug}/{ep}/',         method: 'cheerio+csrf+puppeteer' },
  { name: 'TioAnime',    base: 'https://tioanime.com',          epFormat: '/ver/{slug}-{ep}',     method: 'cheerio' },
  { name: 'AnimeFLV',    base: 'https://www3.animeflv.net',     epFormat: '/ver/{slug}-{ep}',     method: 'cheerio+pigamer37' },
  { name: 'AnimeAV1',    base: 'https://animeav1.com',          epFormat: '/media/{slug}/{ep}',   method: 'sveltekit-json' },
  // Local scrapers (src/local-scrapers/sites.js)
  { name: 'AnimeJara',   base: 'https://animejara.com',         epFormat: '/episode/{slug}-1x{ep}/', method: 'cheerio-episodePage' },
  { name: 'AnimeJL',     base: 'https://www.anime-jl.net',      epFormat: 'N/A',                method: 'cheerio-jsvar' },
  // Pigamer proxy (no direct scraping)
  { name: 'HenaoJara',   base: 'https://henaojara.com',         epFormat: '(via pigamer37)',    method: 'pigamer37-proxy' },
  // Alfa providers (anime-related)
  { name: 'MonoChinos',  base: 'https://vww.monoschinos2.net',  epFormat: 'N/A',                method: 'alfa-jsvar' },
  { name: 'LatAnime',    base: 'https://latanime.org',           epFormat: 'N/A',                method: 'alfa-jsvar' },
  { name: 'TioDonghua',  base: 'https://tiodonghua.com',         epFormat: 'N/A',                method: 'alfa-jsvar' },
  { name: 'VerAnime',    base: 'https://ww3.animeonline.ninja',  epFormat: 'N/A',                method: 'alfa-jsvar' },
  { name: 'EstrenosAnime', base: 'https://estrenosanime.net',    epFormat: 'N/A',                method: 'alfa-iframe' },
  { name: 'MundoDonghua',  base: 'https://www.mundodonghua.com', epFormat: 'N/A',                method: 'alfa-iframe' },
];

// ─── Embed/stream domains conocidos ──────────────────────────
const EMBED_DOMAINS = [
  'streamwish.to', 'filemoon.sx', 'filemoon.to', 'dood.ws', 'dood.so', 'dood.wf',
  'mixdrop.co', 'mixdrop.ag', 'voe.sx', 'uqload.com', 'uqload.co', 'ok.ru',
  'mp4upload.com', 'streamtape.com', 'netu.tv', 'netu.io', 'hqq.tv', 'hqq.watch',
  'yourupload.com', 'upstream.to', 'vidmoly.to', 'vidhide.com', 'vidoza.net',
  'fembed.com', 'swhoi.com', 'bysekoze.com', 'hgcloud.to', 'burstcloud.cc',
  'cloudvideo.tv', 'sbembed.com', 'sbplay.org', 'mystream.to', 'playhydrax.com',
];

// ─── Test 1: Clasificacion de dominios embed (sin navegador) ─
function testEmbedClassification() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 1: Clasificacion de dominios embed conocidos');
  console.log('='.repeat(70));

  const ai = new SmartAnalyzer();
  let correct = 0, wrong = 0;
  const results = [];

  EMBED_DOMAINS.forEach(function(d) {
    const url = 'https://' + d + '/e/test';
    const cls = ai.classifyURL(url);
    const server = ai.inferServerName(d);
    const ok = cls.type === 'embed' || cls.type === 'download' || cls.type === 'cdn';
    if (ok) correct++; else wrong++;
    results.push({ domain: d, type: cls.type, server: server, ok: ok });
  });

  results.forEach(function(r) {
    const mark = r.ok ? '✓' : '✗';
    console.log('  ' + mark + ' ' + r.type.padEnd(14) + ' ' + r.server.padEnd(14) + r.domain);
  });
  console.log('\n  Correctos: ' + correct + '/' + EMBED_DOMAINS.length + '  Errores: ' + wrong);
  return { correct, wrong, total: EMBED_DOMAINS.length };
}

// ─── Test 2: StaticScraper en homepages (sin navegador, rapido) ─
async function testStaticScraper(site) {
  console.log('\n  [' + site.name + '] ' + site.base + '  (' + site.method + ')');
  const scraper = new StaticScraper();
  try {
    const start = Date.now();
    const result = await scraper.analyze(site.base);
    const duration = Date.now() - start;

    const icons = result.serverCatalog.length > 0 ? '✓' : '○';
    console.log('    ' + icons + ' Static: ' + duration + 'ms  goal=' + result.goal + '  urls=' + result.urlsFound + '  servers=' + result.serverCatalog.length);

    if (result.serverCatalog.length > 0) {
      result.serverCatalog.slice(0, 3).forEach(function(s) {
        console.log('      ' + s.name + ': ' + s.urls.length + ' URLs');
      });
    }
    return { name: site.name, method: 'static', ok: true, duration: duration, goal: result.goal, urls: result.urlsFound, servers: result.serverCatalog.length };
  } catch (err) {
    console.log('    ✗ Static ERROR: ' + err.message.slice(0, 80));
    return { name: site.name, method: 'static', ok: false, error: err.message };
  }
}

// ─── Test 3: Clasificacion de URL con SmartAnalyzer ──────────
function testUrlClassification(site) {
  const ai = new SmartAnalyzer();
  const cls = ai.classifyURL(site.base);
  const domain = ai.extractDomain(site.base);
  const server = ai.inferServerName(domain);
  return { name: site.name, url: site.base, type: cls.type, isContainer: cls.isContainer, server: server, signals: cls.signals.slice(0, 3) };
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('SISTEMA DE SCRAPING INTELIGENTE — Prueba completa de sitios de anime');
  console.log('Fecha: ' + new Date().toISOString().slice(0, 19));
  console.log('Sitios a probar: ' + ANIME_SITES.length + '  (13 anime + clasificacion de embeds)');

  // Test 1: Embed classification (instantaneo)
  const embedResults = testEmbedClassification();

  // Test 2: URL classification (instantaneo)
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: Clasificacion de URLs de sitios anime');
  console.log('='.repeat(70));
  console.log('  ' + 'Sitio'.padEnd(16) + 'Tipo'.padEnd(16) + 'Container  Server');
  console.log('  ' + '-'.repeat(60));

  const urlResults = ANIME_SITES.map(function(s) {
    const r = testUrlClassification(s);
    console.log('  ' + r.name.padEnd(16) + r.type.padEnd(16) + String(r.isContainer).padEnd(11) + r.server);
    return r;
  });

  // Test 3: StaticScraper (fetch+cheerio, rapido, sin navegador)
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: StaticScraper en homepages (sin Puppeteer, ~15MB RAM)');
  console.log('='.repeat(70));

  const staticResults = [];
  for (const site of ANIME_SITES) {
    const r = await testStaticScraper(site);
    staticResults.push(r);
  }

  // Resumen final
  console.log('\n\n' + '='.repeat(70));
  console.log('RESUMEN FINAL');
  console.log('='.repeat(70));
  console.log('');
  console.log('Embed classification: ' + embedResults.correct + '/' + embedResults.total + ' correctos');

  console.log('\nURL classification (navigation=OK para sitios anime):');
  urlResults.forEach(function(r) {
    const ok = r.type === 'navigation' || r.type === 'embed';
    console.log('  ' + (ok ? '✓' : '✗') + ' ' + r.name.padEnd(16) + r.type.padEnd(16) + r.server);
  });

  console.log('\nStaticScraper (fetch+cheerio):');
  const okStatic = staticResults.filter(function(r) { return r.ok; });
  const withServers = staticResults.filter(function(r) { return r.servers > 0; });
  console.log('  Accesibles: ' + okStatic.length + '/' + ANIME_SITES.length);
  console.log('  Con servidores/embeds detectados: ' + withServers.length);
  console.log('');
  staticResults.forEach(function(r) {
    if (r.ok) {
      console.log('  ' + r.name.padEnd(16) + (r.duration + 'ms').padEnd(10) + 'goal=' + r.goal.padEnd(12) + 'urls=' + String(r.urls).padEnd(6) + 'servers=' + r.servers);
    } else {
      console.log('  ' + r.name.padEnd(16) + 'ERROR: ' + (r.error || '').slice(0, 50));
    }
  });

  // Recomendaciones
  console.log('\n\nRECOMENDACIONES:');
  console.log('  - Sitios con goal=video: usar quickExtract con Puppeteer para extraer streams');
  console.log('  - Sitios con goal=navigation: scrapear paginas hijas con episode links');
  console.log('  - Sitios inaccesibles: verificar Cloudflare/DDoS protection o cambio de dominio');
  console.log('  - Embed domains no clasificados: agregar a URL_DOMAIN_KB en smart-analyzer.js');

  getSessionMemory().forceSave();
  console.log('\nMemoria guardada en .scraper-memory.json');
  process.exit(0);
}

main().catch(function(err) {
  console.error('Fatal: ' + err.message + '\n' + err.stack);
  process.exit(1);
});
