// test-anime-naruto.js — Prueba completa del pipeline anime para Naruto S01E01
// node scripts/test-anime-naruto.js

const https = require('https');
const http = require('http');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36';

function fetchJSON(url) {
  return new Promise(function(resolve, reject) {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': UA } }, function(res) {
      let data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data: data.slice(0, 500) }); }
      });
    }).on('error', function(e) { reject(e); });
  });
}

async function fetchHTML(url) {
  return new Promise(function(resolve, reject) {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html' } }, function(res) {
      let data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() {
        resolve({ status: res.statusCode, data: data.slice(0, 2000) });
      });
    }).on('error', function(e) { reject(e); });
  });
}

async function testPigamer37() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 1: Pigamer37 API — tmdb:46260 (Naruto S01E01)');
  console.log('='.repeat(70));

  const urls = [
    { label: 'tmdb:46260',    url: 'https://pigamer37.alwaysdata.net/stream/series/tmdb%3A46260.json' },
    { label: 'tmdb:46260:1:1', url: 'https://pigamer37.alwaysdata.net/stream/series/tmdb%3A46260:1:1.json' },
    { label: 'animeflv:naruto', url: 'https://pigamer37.alwaysdata.net/stream/series/animeflv%3Anaruto.json' },
    { label: 'tioanime:naruto', url: 'https://pigamer37.alwaysdata.net/stream/series/tioanime%3Anaruto.json' },
    { label: 'henaojara:naruto', url: 'https://pigamer37.alwaysdata.net/stream/series/henaojara%3Anaruto.json' },
  ];

  for (const u of urls) {
    try {
      const r = await fetchJSON(u.url);
      const streams = Array.isArray(r.data) ? r.data : (r.data && r.data.streams) || [];
      console.log('  ' + u.label.padEnd(22) + ' status=' + r.status + '  streams=' + streams.length);
      if (streams.length > 0) {
        const s = streams[0];
        console.log('    → url=' + (s.url || s.externalUrl || '').slice(0, 60));
        console.log('    → server=' + (s.server || s.name || '?'));
      }
    } catch (e) {
      console.log('  ' + u.label.padEnd(22) + ' ERROR: ' + e.message);
    }
  }
}

async function testDirectScrapers() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 2: Scrapers directos — verificar accesibilidad');
  console.log('='.repeat(70));

  const pages = [
    { name: 'AnimeFLV',    url: 'https://www4.animeflv.net/ver/naruto-1' },
    { name: 'JKAnime',     url: 'https://jkanime.net/naruto/1/' },
    { name: 'AnimeAV1',    url: 'https://animeav1.com/media/naruto/1/__data.json' },
    { name: 'AnimeJara',   url: 'https://animejara.com/anime/naruto' },
  ];

  for (const p of pages) {
    try {
      const isJSON = p.url.includes('__data.json');
      const r = isJSON ? await fetchJSON(p.url) : await fetchHTML(p.url);
      const size = typeof r.data === 'string' ? r.data.length : JSON.stringify(r.data).length;
      const hasVideo = typeof r.data === 'string' && /iframe|video|player|embed|server|m3u8|mp4/i.test(r.data.slice(0, 5000));
      const is404 = typeof r.data === 'string' && (/404|not found|no encontrado/i.test(r.data.slice(0, 500)));
      const status = is404 ? '404' : hasVideo ? 'has-content' : 'empty?';
      console.log('  ' + p.name.padEnd(14) + ' HTTP ' + r.status + '  ' + status + '  size=' + size + 'b');
      if (hasVideo && typeof r.data === 'string') {
        const matches = r.data.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/gi) || [];
        if (matches.length) console.log('    m3u8/mp4: ' + matches.length);
      }
    } catch (e) {
      console.log('  ' + p.name.padEnd(14) + ' ERROR: ' + e.message.slice(0, 60));
    }
  }
}

async function testStaticScraper() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 3: StaticScraper en paginas de anime (fetch+cheerio)');
  console.log('='.repeat(70));

  const { StaticScraper } = require('../src/intelligent');
  const scraper = new StaticScraper();
  const urls = [
    'https://www4.animeflv.net/ver/naruto-1',
    'https://jkanime.net/naruto/1/',
    'https://animejara.com/anime/naruto',
  ];

  for (const url of urls) {
    try {
      const r = await scraper.analyze(url);
      const embedUrls = r.findings.serverUrls.filter(function(u) {
        return /streamwish|filemoon|uqload|dood|mixdrop|voe|mp4upload|streamtape|yourupload|player|embed/i.test(u);
      });
      console.log('  ' + url.slice(0, 40).padEnd(42) + ' goal=' + r.goal.padEnd(12) + ' urls=' + r.urlsFound + '  embeds=' + embedUrls.length + '  time=' + r.durationMs + 'ms');
      if (embedUrls.length > 0) {
        embedUrls.slice(0, 3).forEach(function(u) { console.log('    ' + u.slice(0, 80)); });
      }
    } catch (e) {
      console.log('  ' + url.slice(0, 40).padEnd(42) + ' ERROR: ' + e.message.slice(0, 60));
    }
  }
}

async function testQuickExtract() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 4: quickExtract (Puppeteer) en pagina con video');
  console.log('='.repeat(70));

  const { createBrowser, createPage, AutonomousScraper, setupResourceBlocking } = require('../src/intelligent');

  let browser;
  try {
    browser = await createBrowser({ headless: true, stealth: true });
    const page = await createPage(browser, { stealth: true });
    await setupResourceBlocking(page);

    const scraper = new AutonomousScraper(page, { maxRequests: 15 });
    const urls = [
      'https://www4.animeflv.net/ver/naruto-1',
      'https://jkanime.net/naruto/1/',
    ];

    for (const url of urls) {
      try {
        const start = Date.now();
        const r = await scraper.quickExtract(url);
        const duration = Date.now() - start;
        const f = r.findings;
        console.log('  ' + url.slice(0, 40).padEnd(42) + (duration / 1000).toFixed(1) + 's  type=' + (r.pageType || '?'));
        console.log('    servers=' + f.serverUrls.length + '  videos=' + f.videoUrls.length + '  downloads=' + f.downloadUrls.length);
        if (f.serverUrls.length > 0) f.serverUrls.slice(0, 3).forEach(function(u) { console.log('    ' + u.slice(0, 80)); });
        if (f.videoUrls.length > 0) f.videoUrls.slice(0, 2).forEach(function(u) { console.log('    VIDEO: ' + u.slice(0, 80)); });
      } catch (e) {
        console.log('  ERROR: ' + e.message.slice(0, 80));
      }
    }
  } finally {
    if (browser) try { await browser.close(); } catch {}
  }
}

async function testServerEndpoint() {
  console.log('\n' + '='.repeat(70));
  console.log('TEST 5: Server /stream endpoint (si esta corriendo)');
  console.log('='.repeat(70));

  try {
    const r = await fetchJSON('http://localhost:10000/stream/series/ovn%3A46260.json?season=1&episode=1');
    console.log('  status=' + r.status + '  streams=' + ((r.data && r.data.streams) || []).length);
    if (r.data && r.data.streams) {
      const streamUrls = r.data.streams.slice(0, 5).map(function(s) { return (s.url || '').slice(0, 60); });
      streamUrls.forEach(function(u) { console.log('    ' + u); });
    }
  } catch (e) {
    console.log('  Server no esta corriendo en :10000 — saltando');
  }
}

async function main() {
  console.log('OVNIVERS ANIME PIPELINE TEST — Naruto S01E01');
  console.log('Fecha: ' + new Date().toISOString().slice(0, 19) + '\n');

  // Test 1: Pigamer37 API (externo)
  await testPigamer37();

  // Test 2: Accesibilidad de scrapers directos
  await testDirectScrapers();

  // Test 3: StaticScraper (fetch+cheerio, sin Puppeteer)
  await testStaticScraper();

  // Test 4: quickExtract con Puppeteer (lento, solo 2 URLs)
  await testQuickExtract();

  // Test 5: Server endpoint local
  await testServerEndpoint();

  console.log('\n\nOK — Tests completados');
  process.exit(0);
}

main().catch(function(err) {
  console.error('Fatal: ' + err.message + '\n' + err.stack);
  process.exit(1);
});
