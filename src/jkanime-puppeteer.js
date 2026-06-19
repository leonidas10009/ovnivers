const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
let puppeteer = null;
let chromiumCache = null;

async function getPuppeteer() {
  if (puppeteer) return puppeteer;
  try { puppeteer = (await import('puppeteer-core')).default; return puppeteer; }
  catch { return null; }
}

async function getChromium() {
  if (chromiumCache) return chromiumCache;
  try {
    const mod = await import('@sparticuz/chromium');
    const Cr = mod.default;
    const exePath = await Cr.executablePath();
    chromiumCache = { executablePath: exePath, args: Cr.args || [] };
    return chromiumCache;
  } catch { return null; }
}

// Resolvable embed domains (proven working in Puppeteer)
const RESOLVABLE = ['streamwish', 'sfastwish', 'flaswish', 'mp4upload', 'streamtape', 'vidhide', 'callistanise'];

async function resolveEmbedUrl(browser, embedUrl, waitMs = 8000) {
  const page = await browser.newPage();
  await page.setUserAgent(UA);
  let videoUrl = null;

  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (videoUrl) { req.abort(); return; }
    const isVideo = /\.(m3u8|mp4|mkv|ts|webm)(\?|$)/i.test(u)
      && !u.includes('.css') && !u.includes('.js') && !u.includes('videojs')
      && !u.includes('test-videos') && !u.includes('novideo');
    if (isVideo) { videoUrl = u; req.abort(); }
    else req.continue();
  });

  try { await page.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 20000 }); } catch {}
  await new Promise(r => setTimeout(r, waitMs));

  if (!videoUrl) {
    try {
      videoUrl = await page.evaluate(() => {
        const v = document.querySelector('video');
        if (v && v.src && !v.src.startsWith('blob:')) return v.src;
        const src = document.querySelector('source[src]');
        if (src) { const s = src.getAttribute('src'); if (s && !s.startsWith('blob:')) return s; }
        return null;
      });
    } catch {}
  }

  await page.close();
  return videoUrl && videoUrl.startsWith('http') && !videoUrl.includes('novideo') ? videoUrl : null;
}

function isResolvable(url) {
  try { return RESOLVABLE.some(h => new URL(url).hostname.includes(h)); } catch { return false; }
}

async function resolveEmbedList(browser, servers, slug, episode, baseUrl) {
  const results = [];
  for (const s of servers) {
    const url = s.url;
    if (!url || !url.startsWith('http')) continue;

    if (isResolvable(url)) {
      const direct = await resolveEmbedUrl(browser, url, 8000);
      if (direct) {
        results.push({
          url: direct,
          server: s.server,
          name: `${baseUrl}\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
          behaviorHints: { notWebReady: false, bingeGroup: `${baseUrl}|${s.server}`.toLowerCase() },
        });
        continue;
      }
    }
    // Fallback: embed URL
    results.push({
      url,
      server: s.server,
      name: `${baseUrl}\n${s.server}`,
      title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (${s.size || ''})`,
      behaviorHints: { notWebReady: true, bingeGroup: `${baseUrl}|${s.server}`.toLowerCase() },
    });
  }
  return results;
}

// ═══ JKAnime ═══
async function resolveJKAnime(slug, episode) {
  const pptr = await getPuppeteer();
  if (!pptr) return [];
  const chromium = await getChromium();
  if (!chromium) return [];

  const jkUrl = `https://jkanime.net/${slug}/${episode}/`;
  let browser = null;

  try {
    browser = await pptr.launch({
      args: chromium.args,
      executablePath: chromium.executablePath,
      headless: true,
      defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.goto(jkUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 8000));

    // Extract iframes (Desu + Magi)
    let streams = [];
    const iframes = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('iframe')).map(f => f.src).filter(s => s && s.startsWith('http'));
    });

    for (const frameUrl of iframes) {
      const serverName = frameUrl.includes('/um?') ? 'Desu' : frameUrl.includes('/umv?') ? 'Magi' : null;
      if (!serverName) continue;
      const m3u8Url = await resolveEmbedUrl(browser, frameUrl, 5000);
      if (m3u8Url) {
        streams.push({
          url: m3u8Url, server: serverName,
          name: `JKAnime\n${serverName}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${serverName} (m3u8)`,
          behaviorHints: { notWebReady: false, bingeGroup: `jkanime|${serverName.toLowerCase()}` },
        });
      }
    }

    // Extract servers from JS-rendered page
    try {
      const serverData = await page.evaluate(() => {
        if (typeof servers !== 'undefined' && Array.isArray(servers)) return JSON.stringify(servers);
        return null;
      });
      if (serverData) {
        const decoded = JSON.parse(serverData).map(s => ({
          server: s.server,
          size: s.size || '',
          lang: s.lang === 1 ? 'SUB' : s.lang === 2 ? 'LAT' : '',
          url: Buffer.from(s.remote, 'base64').toString('utf-8').trim(),
        })).filter(s => s.url);
        const resolved = await resolveEmbedList(browser, decoded, slug, episode, 'JKAnime');
        streams.push(...resolved);
      }
    } catch {}

    await page.close();

    // Deduplicate by URL
    const seen = new Set();
    return streams.filter(s => { const k = s.url + s.server; if (seen.has(k)) return false; seen.add(k); return true; });
  } catch (e) { console.error('[jk-pptr] error:', e.message); return []; }
  finally { if (browser) try { await browser.close(); } catch {} }
}

// ═══ TioAnime ═══
async function resolveTioAnime(slug, episode) {
  const pptr = await getPuppeteer();
  if (!pptr) return [];
  const chromium = await getChromium();
  if (!chromium) return [];

  // Get servers from static HTML (no Puppeteer needed for extraction)
  try {
    const res = await fetch(`https://tioanime.com/ver/${slug}-${episode}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const html = await res.text();
    const m = html.match(/var videos\s*=\s*(\[[\s\S]*?\]);/);
    if (!m) return [];
    const videos = JSON.parse(m[1]);
    if (!Array.isArray(videos)) return [];

    const servers = videos.map(v => ({ server: v[0] || '?', url: (v[1] || '').replace(/\\\//g, '/') })).filter(s => s.url.startsWith('http'));

    const browser = await pptr.launch({ args: chromium.args, executablePath: chromium.executablePath, headless: true, defaultViewport: { width: 1280, height: 720 } });
    const results = await resolveEmbedList(browser, servers, slug, episode, 'TioAnime');
    await browser.close();
    return results;
  } catch (e) { console.error('[tio-pptr] error:', e.message); return []; }
}

// ═══ AnimeAV1 ═══
async function resolveAnimeAV1(slug, episode) {
  const pptr = await getPuppeteer();
  if (!pptr) return [];
  const chromium = await getChromium();
  if (!chromium) return [];

  try {
    const res = await fetch(`https://animeav1.com/media/${slug}/${episode}/__data.json`, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();

    const servers = [];
    for (const node of (data.nodes || [])) {
      if (node?.type !== 'data' || !Array.isArray(node.data)) continue;
      for (let i = 0; i < node.data.length; i++) {
        const val = node.data[i];
        if (val && val.server && val.url) {
          const srv = typeof val.server === 'number' ? node.data[val.server] : val.server;
          const u = typeof val.url === 'number' ? node.data[val.url] : val.url;
          if (typeof srv === 'string' && typeof u === 'string' && u.startsWith('http'))
            servers.push({ server: srv, url: u });
        }
      }
    }

    if (!servers.length) return [];
    const browser = await pptr.launch({ args: chromium.args, executablePath: chromium.executablePath, headless: true, defaultViewport: { width: 1280, height: 720 } });
    const results = await resolveEmbedList(browser, servers, slug, episode, 'AnimeAV1');
    await browser.close();
    return results;
  } catch (e) { console.error('[av1-pptr] error:', e.message); return []; }
}

module.exports = { resolveJKAnime, resolveTioAnime, resolveAnimeAV1 };
