// Test ALL anime scrapers locally with and without Puppeteer resolution
const puppeteer = require('puppeteer');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function resolveEmbed(page, embedUrl, waitMs = 8000) {
  await page.setUserAgent(UA);
  let videoUrl = null;

  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (videoUrl) { req.abort(); return; }
    if (/\.(m3u8|mp4|mkv|ts|webm)(\?|$)/i.test(u) && !u.includes('.css') && !u.includes('.js') && !u.includes('videojs') && !u.includes('test-videos')) {
      videoUrl = u;
      req.abort();
    } else {
      req.continue();
    }
  });

  try { await page.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 20000 }); } catch {}
  await new Promise(r => setTimeout(r, waitMs));

  if (!videoUrl) {
    try {
      videoUrl = await page.evaluate(() => {
        const v = document.querySelector('video');
        if (v && v.src && !v.src.startsWith('blob:')) return v.src;
        const src = document.querySelector('source[src]');
        if (src) return src.getAttribute('src');
        return null;
      });
    } catch {}
  }
  return videoUrl;
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  // ===== JKAnime =====
  console.log('=== JKAnime (Puppeteer full page) ===');
  const jkPage = await browser.newPage();
  const jkStart = Date.now();

  // Extract servers from JS-rendered page
  await jkPage.goto('https://jkanime.net/naruto/1/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 8000));

  const jkServers = await jkPage.evaluate(() => {
    if (typeof servers !== 'undefined') return servers;
    return [];
  });
  console.log(`  ${jkServers.length} servers found (${Date.now() - jkStart}ms)`);

  // Resolve each server
  let jkResolved = 0;
  for (const s of jkServers) {
    const url = Buffer.from(s.remote, 'base64').toString('utf-8').trim();
    if (!url.startsWith('http')) continue;
    const p = await browser.newPage();
    const resolved = await resolveEmbed(p, url, 6000);
    await p.close();
    if (resolved) {
      console.log(`    ${s.server}: OK ${resolved.substring(0, 60)}`);
      jkResolved++;
    }
  }
  console.log(`  ${jkResolved}/${jkServers.length} resolved`);
  await jkPage.close();

  // ===== TioAnime =====
  console.log('\n=== TioAnime ===');
  const tioRes = await fetch('https://tioanime.com/ver/naruto-1', { headers: { 'User-Agent': UA } });
  const tioHtml = await tioRes.text();
  const tioVideosMatch = tioHtml.match(/var videos\s*=\s*(\[[\s\S]*?\]);/);
  const tioVideos = tioVideosMatch ? JSON.parse(tioVideosMatch[1]) : [];
  console.log(`  ${tioVideos.length} servers`);

  let tioResolved = 0;
  for (const v of tioVideos) {
    const url = (v[1] || '').replace(/\\\//g, '/');
    if (!url.startsWith('http')) continue;
    const p = await browser.newPage();
    const resolved = await resolveEmbed(p, url, 6000);
    await p.close();
    if (resolved) {
      console.log(`    ${v[0]}: OK ${resolved.substring(0, 60)}`);
      tioResolved++;
    }
  }
  console.log(`  ${tioResolved}/${tioVideos.length} resolved`);

  // ===== AnimeAV1 =====
  console.log('\n=== AnimeAV1 ===');
  const av1Res = await fetch('https://animeav1.com/media/tensei-shitara-slime-datta-ken-4th-season/1/__data.json', {
    headers: { 'User-Agent': UA, 'Accept': 'application/json' }
  });
  const av1Data = await av1Res.json();

  // Extract embeds from devalue format
  const av1Servers = [];
  for (const node of (av1Data.nodes || [])) {
    if (node?.type !== 'data' || !Array.isArray(node.data)) continue;
    for (let i = 0; i < node.data.length; i++) {
      const val = node.data[i];
      if (val && val.server && val.url) {
        const srv = typeof val.server === 'number' ? node.data[val.server] : val.server;
        const u = typeof val.url === 'number' ? node.data[val.url] : val.url;
        if (typeof srv === 'string' && typeof u === 'string' && u.startsWith('http')) {
          av1Servers.push({ server: srv, url: u });
        }
      }
    }
  }
  console.log(`  ${av1Servers.length} servers`);

  let av1Resolved = 0;
  for (const s of av1Servers) {
    const p = await browser.newPage();
    const resolved = await resolveEmbed(p, s.url, 6000);
    await p.close();
    if (resolved) {
      console.log(`    ${s.server}: OK ${resolved.substring(0, 60)}`);
      av1Resolved++;
    }
  }
  console.log(`  ${av1Resolved}/${av1Servers.length} resolved`);

  // ===== Pigamer37 =====
  console.log('\n=== Pigamer37 ===');
  const pigRes = await fetch('https://pigamer37.alwaysdata.net/stream/series/' + encodeURIComponent('tmdb:46260') + '.json');
  const pigStreams = (await pigRes.json()).streams || [];
  console.log(`  ${pigStreams.length} streams (direct from API)`);
  const pigMp4 = pigStreams.filter(s => s.url?.includes('.mp4')).length;
  console.log(`  ${pigMp4} mp4 directos (ExoPlayer)`);

  await browser.close();

  // ===== Summary =====
  console.log('\n=== RESUMEN ===');
  console.log(`JKAnime:  ${jkServers.length} servers, ${jkResolved} resolubles a directo`);
  console.log(`TioAnime: ${tioVideos.length} servers, ${tioResolved} resolubles`);
  console.log(`AnimeAV1: ${av1Servers.length} servers, ${av1Resolved} resolubles`);
  console.log(`Pigamer37:${pigStreams.length} streams, ${pigMp4} ExoPlayer`);

})();
