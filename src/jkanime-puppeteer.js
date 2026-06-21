// Puppeteer-based anime resolver - optimized for Render (512MB)
// Keeps one browser alive, caches server lists and embed resolutions
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const { resolveEmbed, isDirectVideoUrl } = require('./alfa-providers/embed-resolver');

let puppeteer = null;
let chromiumCache = null;
let browser = null;
let browserLastUse = 0;
const BROWSER_IDLE = 5 * 60 * 1000; // close after 5min idle
const serverCache = new Map();     // slug:ep → [{server,url}]
const embedCache = new Map();       // url → directUrl
const MAX_CACHE = 200;
const EMBED_TTL = 60 * 60 * 1000;  // 1h
const SERVER_TTL = 30 * 60 * 1000; // 30min

const RESOLVABLE = ['streamwish', 'sfastwish', 'flaswish', 'mp4upload', 'streamtape', 'vidhide', 'callistanise', 'yourupload', 'pixeldrain', '1fichier', 'zilla-networks'];

const UNRESOLVABLE = ['mega', 'megaup', 'mediafire', 'zippyshare', 'drive.google.com', 'mega.nz', 'terabox', 'uns.bio'];

const BLOCKED_PATTERNS = [
  'cloudflareinsights.com', 'cloudfront.net',
  'googletagmanager', 'google-analytics', 'doubleclick',
  'facebook.com/tr', 'hotjar.com', 'newrelic.com',
];

// ═══ Browser management ═══
async function getPuppeteer() {
  if (puppeteer) return puppeteer;
  try { puppeteer = (await import('puppeteer-core')).default; return puppeteer; }
  catch { return null; }
}

function findSystemChrome() {
  // Windows
  if (process.platform === 'win32') {
    try {
      var fs = require('fs');
      var paths = [
        process.env['PROGRAMFILES'] + '\\Google\\Chrome\\Application\\chrome.exe',
        (process.env['PROGRAMFILES(X86)'] || process.env['ProgramFiles(x86)']) + '\\Google\\Chrome\\Application\\chrome.exe',
        (process.env.LOCALAPPDATA || '') + '\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      ];
      for (var i = 0; i < paths.length; i++) {
        try { if (fs.existsSync(paths[i])) return paths[i]; } catch(e) {}
      }
      // Try 'where chrome' command
      try {
        var result = require('child_process').execSync('where chrome 2>nul', { shell: 'cmd.exe' }).toString().trim().split('\r\n')[0];
        if (result && !result.includes('INFO:') && result.length > 0) return result;
      } catch(e) {}
    } catch(e) {}
  }
  // Linux
  if (process.platform === 'linux') {
    try {
      var paths = ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'];
      var fs = require('fs');
      for (var i = 0; i < paths.length; i++) {
        try { if (fs.existsSync(paths[i])) return paths[i]; } catch(e) {}
      }
      // Try 'which' command
      try {
        var result = require('child_process').execSync('which chromium-browser || which chromium || which google-chrome || which google-chrome-stable', { shell: '/bin/sh' }).toString().trim().split('\n')[0];
        if (result && result.length > 0) return result;
      } catch(e) {}
    } catch(e) {}
  }
  // macOS
  if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }
  return null;
}

async function getChromium() {
  if (chromiumCache) return chromiumCache;
  
  // Try system Chrome first (Windows/Linux/Mac = 0 RAM extra)
  var sysChrome = findSystemChrome();
  if (sysChrome) {
    chromiumCache = { executablePath: sysChrome, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] };
    return chromiumCache;
  }
  
  // Fallback to @sparticuz/chromium (Render/AWS Lambda)
  try {
    const mod = await import('@sparticuz/chromium');
    const Cr = mod.default;
    chromiumCache = { executablePath: await Cr.executablePath(), args: Cr.args || [] };
    return chromiumCache;
  } catch { return null; }
}

async function getBrowser() {
  const now = Date.now();
  if (browser) {
    try { browser.isConnected(); browserLastUse = now; return browser; }
    catch { browser = null; }
  }
  const pptr = await getPuppeteer();
  if (!pptr) return null;
  const c = await getChromium();
  if (!c) return null;

  browser = await pptr.launch({
    args: c.args, executablePath: c.executablePath, headless: true,
    defaultViewport: { width: 1280, height: 720 },
  });
  browserLastUse = now;
  return browser;
}

async function closeIfIdle() {
  if (browser && Date.now() - browserLastUse > BROWSER_IDLE) {
    try { await browser.close(); } catch {} browser = null;
  }
}

// Cleanup idle browser every 5 min
setInterval(closeIfIdle, BROWSER_IDLE).unref();

// ═══ Cache helpers ═══
function cacheGet(map, key, ttl) {
  const e = map.get(key);
  if (e && Date.now() - e.time < ttl) return e.value;
  if (e) map.delete(key);
  return undefined;
}
function cacheSet(map, key, value, max) {
  if (map.size >= max) { const first = map.keys().next().value; map.delete(first); }
  map.set(key, { value, time: Date.now() });
}

function getProxyUrl() {
  return process.env.PROXY_URL || '';
}

async function fetchViaProxy(url) {
  const proxy = getProxyUrl();
  if (!proxy) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(`${proxy}/?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': UA },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

// ═══ Core resolver ═══
async function resolveEmbedUrl(b, embedUrl, waitMs = 8000) {
  const cached = cacheGet(embedCache, embedUrl, EMBED_TTL);
  if (cached !== undefined) return cached || null;

  const page = await b.newPage();
  await page.setUserAgent(UA);
  let videoUrl = null;

  try {
    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      if (videoUrl) { req.abort(); return; }
      if (BLOCKED_PATTERNS.some(p => u.includes(p))) { req.abort(); return; }
      if ((/\.(m3u8|mp4|mkv|ts|webm)(\?|$)/i.test(u)
        || /mp4upload\.com:\d+\/d\//i.test(u)
        || /\/hls\//i.test(u))
        && !u.includes('.css') && !u.includes('.js') && !u.includes('videojs')
        && !u.includes('test-videos') && !u.includes('novideo')) {
        videoUrl = u; req.abort();
      } else req.continue();
    });

    page.on('response', resp => {
      if (videoUrl) return;
      const ct = resp.headers()['content-type'] || '';
      if ((ct.includes('mpegurl') || ct.includes('video/mp4') || ct.includes('video/webm'))) {
        const u = resp.url();
        if (!u.includes('.css') && !u.includes('.js') && !u.includes('novideo')) {
          videoUrl = u;
        }
      }
    });

    const htmlViaProxy = await fetchViaProxy(embedUrl);
    if (htmlViaProxy) {
      const baseOrigin = new URL(embedUrl).origin;
      const htmlWithBase = htmlViaProxy.includes('<base ')
        ? htmlViaProxy
        : htmlViaProxy.replace(/<head[^>]*>/i, `$&<base href="${baseOrigin}/">`);
      try { await page.setContent(htmlWithBase, { waitUntil: 'networkidle2', timeout: 15000 }); } catch {}
    } else {
      try { await page.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 15000 }); } catch {}
    }
    await new Promise(r => setTimeout(r, waitMs));

    if (!videoUrl) {
      try {
        videoUrl = await page.evaluate(() => {
          const v = document.querySelector('video');
          if (v?.src && !v.src.startsWith('blob:')) return v.src;
          const s = document.querySelector('source[src]');
          if (s) { const src = s.getAttribute('src'); if (src && !src.startsWith('blob:')) return src; }
          return null;
        });
      } catch {}
    }
  } catch {} finally { await page.close(); }

  const result = (videoUrl && videoUrl.startsWith('http') && !videoUrl.includes('novideo')) ? videoUrl : null;
  cacheSet(embedCache, embedUrl, result, MAX_CACHE);
  return result;
}

function isResolvable(url) {
  try { return RESOLVABLE.some(h => new URL(url).hostname.includes(h)); } catch { return false; }
}

function isUnresolvable(url) {
  try { return UNRESOLVABLE.some(h => new URL(url).hostname.includes(h)); } catch { return true; }
}

// ═══ JKAnime ═══
async function resolveJKAnime(slug, episode) {
  const ck = `${slug}:${episode}`;
  const cached = cacheGet(serverCache, ck, SERVER_TTL);
  let serverList = cached;

  const b = await getBrowser();
  if (!b) return [];

  // Step 1: Get server list (with cache)
  if (!serverList) {
    try {
      const page = await b.newPage();
      await page.setUserAgent(UA);
      await page.goto(`https://jkanime.net/${slug}/${episode}/`, { waitUntil: 'networkidle2', timeout: 25000 });

      // Verify page loaded correctly — must still be on the expected slug page
      const currentUrl = page.url();
      if (!currentUrl.includes(`/${slug}/`) && !currentUrl.includes(`/${slug}-`)) {
        console.warn(`[jk-pptr] page redirected away from ${slug}, got ${currentUrl} — skipping`);
        await page.close();
        return [];
      }

      await new Promise(r => setTimeout(r, 7000));

      serverList = { iframes: [], servers: [] };

      // Extract iframes (Desu + Magi)
      serverList.iframes = await page.evaluate(() =>
        Array.from(document.querySelectorAll('iframe')).map(f => f.src).filter(s => s && s.startsWith('http') && s.includes('jkplayer'))
      );

      // Extract var servers
      try {
        const raw = await page.evaluate(() => {
          if (typeof servers !== 'undefined') return JSON.stringify(servers);
          return null;
        });
        if (raw) {
          serverList.servers = JSON.parse(raw).map(s => ({
            server: s.server,
            size: s.size || '',
            lang: s.lang === 1 ? 'SUB' : s.lang === 2 ? 'LAT' : '',
            url: Buffer.from(s.remote, 'base64').toString('utf-8').trim(),
          })).filter(s => s.url);
        }
      } catch {}

      await page.close();
      cacheSet(serverCache, ck, serverList, MAX_CACHE);
    } catch (e) { console.error('[jk-pptr] page error:', e.message); }
  }

  if (!serverList) return [];

  // Step 2: Resolve streams
  const streams = [];

  // Iframes → m3u8
  for (const frameUrl of (serverList.iframes || [])) {
    const name = frameUrl.includes('/um?') ? 'Desu' : frameUrl.includes('/umv?') ? 'Magi' : null;
    if (!name) continue;
    let m3u8Url = await resolveEmbedUrl(b, frameUrl, 5000);
    if ((!m3u8Url || !m3u8Url.startsWith('http')) && frameUrl.startsWith('http')) m3u8Url = await resolveEmbed(frameUrl);
    if (m3u8Url && m3u8Url.startsWith('http')) {
      streams.push({
        url: m3u8Url, server: name,
        name: `JKAnime\n${name}`,
        title: `${slug} Ep. ${episode}\n⚙️ ${name} (m3u8)`,
        behaviorHints: { notWebReady: false, bingeGroup: `jkanime|${name.toLowerCase()}` },
      });
    }
  }

  // Servers → resolve embed
  for (const s of (serverList.servers || [])) {
    if (!s.url || !s.url.startsWith('http')) continue;
    if (isUnresolvable(s.url)) {
      streams.push({
        externalUrl: s.url, server: s.server,
        name: `JKAnime\n${s.server}`,
        title: `${slug} Ep. ${episode}\n⚙️ ${s.server}\n🔗 Abrir en navegador`,
        behaviorHints: { notWebReady: true, bingeGroup: 'jkanime|' + s.server.toLowerCase() },
      });
      continue;
    }
    const label = s.server + (s.lang ? ' ' + s.lang : '') + (s.size ? ' ' + s.size : '');

    if (isResolvable(s.url)) {
      let direct = await resolveEmbedUrl(b, s.url, 6000);
      if (!direct) direct = await resolveEmbed(s.url);
      if (direct && isDirectVideoUrl(direct)) {
        streams.push({
          url: direct, server: s.server,
          name: `JKAnime\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
          behaviorHints: { notWebReady: false, bingeGroup: 'jkanime|' + s.server.toLowerCase() },
        });
        continue;
      }
    }
    streams.push({
      url: s.url, server: s.server,
      name: `JKAnime\n${s.server}`,
      title: `${slug} Ep. ${episode}\n⚙️ ${label}`,
      behaviorHints: { notWebReady: true, bingeGroup: 'jkanime|' + s.server.toLowerCase() },
    });
  }

  // Dedup by URL
  const seen = new Set();
  return streams.filter(s => { const k = s.url + s.server; if (seen.has(k)) return false; seen.add(k); return true; });
}

// ═══ TioAnime (embeds from static HTML + Puppeteer resolve) ═══
async function resolveTioAnime(slug, episode) {
  const ck = `tio:${slug}:${episode}`;
  const cached = cacheGet(serverCache, ck, SERVER_TTL);
  let serverList = cached;

  if (!serverList) {
    try {
      const res = await fetch(`https://tioanime.com/ver/${slug}-${episode}`, { headers: { 'User-Agent': UA } });
      if (!res.ok) return [];
      const html = await res.text();
      const m = html.match(/var videos\s*=\s*(\[[\s\S]*?\]);/);
      if (!m) return [];
      const videos = JSON.parse(m[1]);
      serverList = {
        servers: videos.map(v => ({ server: v[0] || '?', url: (v[1] || '').replace(/\\\//g, '/') })).filter(s => s.url.startsWith('http')),
      };
      if (!serverList.servers.length) return [];
      cacheSet(serverCache, ck, serverList, MAX_CACHE);
    } catch { return []; }
  }

  const b = await getBrowser();
  if (!b) {
    // No browser — try fetch-based resolution, fallback to embed URLs
    const results = [];
    for (const s of serverList.servers) {
      if (isUnresolvable(s.url)) {
        results.push({
          externalUrl: s.url, server: s.server,
          name: `TioAnime\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server}\n🔗 Abrir en navegador`,
          behaviorHints: { notWebReady: true, bingeGroup: 'tioanime|' + s.server.toLowerCase() },
        });
        continue;
      }
      if (isDirectVideoUrl(s.url)) {
        results.push({
          url: s.url, server: s.server, name: `TioAnime\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
          behaviorHints: { notWebReady: false, bingeGroup: 'tioanime|' + s.server.toLowerCase() },
        });
        continue;
      }
      let direct = null;
      try { direct = await resolveEmbed(s.url); } catch {}
      if (direct && isDirectVideoUrl(direct)) {
        results.push({
          url: direct, server: s.server, name: `TioAnime\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
          behaviorHints: { notWebReady: false, bingeGroup: 'tioanime|' + s.server.toLowerCase() },
        });
      } else {
        results.push({
          url: s.url, server: s.server, name: `TioAnime\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server}`,
          behaviorHints: { notWebReady: true, bingeGroup: 'tioanime|' + s.server.toLowerCase() },
        });
      }
    }
    return results;
  }

  const streams = [];
  for (const s of serverList.servers) {
    if (isUnresolvable(s.url)) {
      streams.push({
        externalUrl: s.url, server: s.server,
        name: `TioAnime\n${s.server}`,
        title: `${slug} Ep. ${episode}\n⚙️ ${s.server}\n🔗 Abrir en navegador`,
        behaviorHints: { notWebReady: true, bingeGroup: 'tioanime|' + s.server.toLowerCase() },
      });
      continue;
    }
    if (isResolvable(s.url)) {
      let direct = await resolveEmbedUrl(b, s.url, 6000);
      if (!direct) direct = await resolveEmbed(s.url);
      if (direct && isDirectVideoUrl(direct)) {
        streams.push({
          url: direct, server: s.server, name: `TioAnime\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
          behaviorHints: { notWebReady: false, bingeGroup: 'tioanime|' + s.server.toLowerCase() },
        });
        continue;
      }
    }
    streams.push({
      url: s.url, server: s.server, name: `TioAnime\n${s.server}`,
      title: `${slug} Ep. ${episode}\n⚙️ ${s.server}`,
      behaviorHints: { notWebReady: true, bingeGroup: 'tioanime|' + s.server.toLowerCase() },
    });
  }
  const seen = new Set();
  return streams.filter(s => { const k = s.url + s.server; if (seen.has(k)) return false; seen.add(k); return true; });
}

// ═══ AnimeAV1 ═══
async function resolveAnimeAV1(slug, episode) {
  const ck = `av1:${slug}:${episode}`;
  const cached = cacheGet(serverCache, ck, SERVER_TTL);
  let serverList = cached;

  if (!serverList) {
    try {
      const res = await fetch(`https://animeav1.com/media/${slug}/${episode}/__data.json`, {
        headers: { 'User-Agent': UA, 'Accept': 'application/json' },
      });
      if (!res.ok) return [];
      const data = await res.json();
      const servers = [];
      
      // Find the episode node and extract embeds + downloads
      for (const node of (data.nodes || [])) {
        if (node?.type !== 'data' || !Array.isArray(node.data)) continue;
        
        // Episode node: data[0] has {episode:X, embeds:Y, downloads:Z}
        const first = node.data[0];
        if (!first || typeof first !== 'object') continue;
        
        // Extract embeds (streaming servers, organized by SUB/DUB variant)
        if (first.embeds !== undefined) {
          const embedsRef = node.data[first.embeds];
          if (embedsRef && typeof embedsRef === 'object') {
            for (const [variant, serversIdx] of Object.entries(embedsRef)) {
              const variantServers = node.data[serversIdx];
              if (!Array.isArray(variantServers)) continue;
              for (const entry of variantServers) {
                // Handle both object-entry and index-reference formats
                let srvObj = entry;
                if (typeof entry === 'number') srvObj = node.data[entry];
                if (!srvObj || typeof srvObj !== 'object') continue;
                
                const srv = typeof srvObj.server === 'number' ? node.data[srvObj.server] : srvObj.server;
                const u = typeof srvObj.url === 'number' ? node.data[srvObj.url] : srvObj.url;
                if (typeof srv === 'string' && typeof u === 'string' && u.startsWith('http'))
                  servers.push({ server: srv + (variant !== 'SUB' ? ' ' + variant : ''), url: u, variant });
              }
            }
          }
        }
        
        // Extract downloads (DDL links, may have quality/size metadata)
        if (first.downloads !== undefined) {
          const dlRoot = node.data[first.downloads];
          // Downloads can be flat array or organized by SUB/DUB
          const dlArrays = Array.isArray(dlRoot) ? { '': dlRoot } :
            (dlRoot && typeof dlRoot === 'object' ? dlRoot : {});
          for (const [variant, dlIdxOrArr] of Object.entries(dlArrays)) {
            const dlArr = typeof dlIdxOrArr === 'number' ? node.data[dlIdxOrArr] : dlIdxOrArr;
            if (!Array.isArray(dlArr)) continue;
            for (const entry of dlArr) {
              let dlObj = entry;
              if (typeof entry === 'number') dlObj = node.data[entry];
              if (!dlObj || typeof dlObj !== 'object') continue;
              
              const srv = typeof dlObj.server === 'number' ? node.data[dlObj.server] : (dlObj.server || 'DDL');
              const u = typeof dlObj.url === 'number' ? node.data[dlObj.url] : (dlObj.url || '');
              const quality = dlObj.quality ? (typeof dlObj.quality === 'number' ? node.data[dlObj.quality] : dlObj.quality) : '';
              const label = srv + (quality ? ' ' + quality : '') + (variant && variant !== 'SUB' ? ' ' + variant : '');
              if (typeof srv === 'string' && typeof u === 'string' && u.startsWith('http'))
                servers.push({ server: label, url: u });
            }
          }
        }
      }
      
      // Fallback: if structured extraction found nothing, try flat scan (old method)
      if (!servers.length) {
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
      }
      
      serverList = { servers };
      if (!servers.length) return [];
      cacheSet(serverCache, ck, serverList, MAX_CACHE);
    } catch { return []; }
  }

  const b = await getBrowser();
  if (!b) {
    // No browser — try fetch-based resolution, fallback to embed URLs
    const results = [];
    for (const s of serverList.servers) {
      if (isUnresolvable(s.url)) {
        results.push({
          externalUrl: s.url, server: s.server,
          name: `AnimeAV1\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server}\n🔗 Abrir en navegador`,
          behaviorHints: { notWebReady: true, bingeGroup: 'animeav1|' + s.server.toLowerCase() },
        });
        continue;
      }
      // Check if already a direct video URL (m3u8/mp4 straight from server)
      if (isDirectVideoUrl(s.url)) {
        results.push({
          url: s.url, server: s.server, name: `AnimeAV1\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
          behaviorHints: { notWebReady: false, bingeGroup: 'animeav1|' + s.server.toLowerCase() },
        });
        continue;
      }
      // Try to resolve embed → direct URL
      let direct = null;
      try { direct = await resolveEmbed(s.url); } catch {}
      if (direct && isDirectVideoUrl(direct)) {
        results.push({
          url: direct, server: s.server, name: `AnimeAV1\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
          behaviorHints: { notWebReady: false, bingeGroup: 'animeav1|' + s.server.toLowerCase() },
        });
      } else {
        // Cannot resolve to direct URL — return embed URL for browser playback
        results.push({
          url: s.url, server: s.server, name: `AnimeAV1\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server}`,
          behaviorHints: { notWebReady: true, bingeGroup: 'animeav1|' + s.server.toLowerCase() },
        });
      }
    }
    return results;
  }

  const streams = [];
  for (const s of serverList.servers) {
    if (isUnresolvable(s.url)) {
      streams.push({
        externalUrl: s.url, server: s.server,
        name: `AnimeAV1\n${s.server}`,
        title: `${slug} Ep. ${episode}\n⚙️ ${s.server}\n🔗 Abrir en navegador`,
        behaviorHints: { notWebReady: true, bingeGroup: 'animeav1|' + s.server.toLowerCase() },
      });
      continue;
    }
    if (isResolvable(s.url)) {
      let direct = await resolveEmbedUrl(b, s.url, 6000);
      if (!direct) direct = await resolveEmbed(s.url);
      if (direct && isDirectVideoUrl(direct)) {
        streams.push({
          url: direct, server: s.server, name: `AnimeAV1\n${s.server}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
          behaviorHints: { notWebReady: false, bingeGroup: 'animeav1|' + s.server.toLowerCase() },
        });
        continue;
      }
    }
    streams.push({
      url: s.url, server: s.server, name: `AnimeAV1\n${s.server}`,
      title: `${slug} Ep. ${episode}\n⚙️ ${s.server}`,
      behaviorHints: { notWebReady: true, bingeGroup: 'animeav1|' + s.server.toLowerCase() },
    });
  }
  const seen = new Set();
  return streams.filter(s => { const k = s.url + s.server; if (seen.has(k)) return false; seen.add(k); return true; });
}

module.exports = { resolveJKAnime, resolveTioAnime, resolveAnimeAV1, resolveAnimeJara, getBrowser };

// ═══ AnimeJara ═══
async function resolveAnimeJara(slug, episode) {
  const ck = `aj:${slug}:${episode}`;
  const cached = cacheGet(serverCache, ck, SERVER_TTL);
  let serverList = cached;

  const b = await getBrowser();
  
  // Step 1: Get server list from episode page
  if (!serverList) {
    if (!b) {
      // No browser — try fetching HTML statically for onclick servers
      try {
        const res = await fetch(`https://animejara.com/episode/${slug}-1x${episode}/`, {
          headers: { 'User-Agent': UA }
        });
        if (!res.ok) return [];
        const html = await res.text();
        const servers = [];
        // Extract onclick="playVideo('...')" URLs
        const re = /playVideo\s*\(\s*["']([^"']+)["']\s*\)/g;
        let m;
        while ((m = re.exec(html)) !== null) {
          let url = m[1].replace(/\\\//g, '/');
          if (url.startsWith('//')) url = 'https:' + url;
          if (url.startsWith('http')) {
            try { servers.push({ server: new URL(url).hostname.replace('www.','').split('.')[0], url }); }
            catch { servers.push({ server: 'embed', url }); }
          }
        }
        // Also check for iframes
        const iframeRe = /<iframe[^>]+src=["']([^"']+)["']/gi;
        while ((m = iframeRe.exec(html)) !== null) {
          let url = m[1];
          if (url.startsWith('//')) url = 'https:' + url;
          if (url.startsWith('http')) {
            try { servers.push({ server: new URL(url).hostname.replace('www.','').split('.')[0], url }); }
            catch { servers.push({ server: 'embed', url }); }
          }
        }
        serverList = { servers };
        if (!servers.length) return [];
        cacheSet(serverCache, ck, serverList, MAX_CACHE);
      } catch { return []; }
    } else {
      try {
        const page = await b.newPage();
        await page.setUserAgent(UA);
        await page.goto(`https://animejara.com/episode/${slug}-1x${episode}/`, {
          waitUntil: 'networkidle2', timeout: 25000
        });

        // Verify we're on the right page
        const currentUrl = page.url();
        if (!currentUrl.includes(`/${slug}-`)) {
          console.warn(`[animejara] page redirected away from ${slug}, got ${currentUrl}`);
          await page.close();
          return [];
        }

        const servers = await page.evaluate(() => {
          const results = [];
          
          // Template 1: #lista-server with onclick playVideo
          const listaItems = document.querySelectorAll('#lista-server li[onclick]');
          listaItems.forEach(li => {
            const onclick = li.getAttribute('onclick') || '';
            const urlMatch = onclick.match(/playVideo\s*\(\s*["']([^"']+)["']\s*\)/);
            if (urlMatch) {
              const url = urlMatch[1].replace(/\\\//g, '/');
              const nameEl = li.querySelector('.nombre-server, [class*="server"]');
              const name = nameEl ? nameEl.textContent.trim() : '';
              if (url.startsWith('http') || url.startsWith('//'))
                results.push({ server: name, url: url.startsWith('//') ? 'https:' + url : url });
            }
          });
          
          // Template 2: .episodio-reproductor iframe
          const iframes = document.querySelectorAll('.reproductor-wrapper iframe, .episodio-reproductor iframe');
          iframes.forEach(iframe => {
            const src = iframe.getAttribute('src') || '';
            if (src.startsWith('http') || src.startsWith('//'))
              results.push({ server: '', url: src.startsWith('//') ? 'https:' + src : src });
          });
          
          // Template 3: data-tr from Poseidon-style players
          const dataItems = document.querySelectorAll('[data-tr]');
          dataItems.forEach(el => {
            const url = el.getAttribute('data-tr') || '';
            const text = el.textContent.trim().substring(0, 30);
            if (url.startsWith('http'))
              results.push({ server: text, url });
          });
          
          return results;
        });

        await page.close();
        
        if (!servers.length) return [];
        
        // Detect server names from URLs for unnamed servers
        for (const s of servers) {
          if (!s.server) {
            try { s.server = new URL(s.url).hostname.replace('www.','').split('.')[0]; }
            catch { s.server = 'embed'; }
          }
        }
        
        serverList = { servers };
        cacheSet(serverCache, ck, serverList, MAX_CACHE);
      } catch (e) {
        console.error('[animejara] page error:', e.message);
        return [];
      }
    }
  }

  if (!serverList) return [];

  // Step 2: Resolve streams
  const streams = [];
  for (const s of serverList.servers) {
    if (!s.url || !s.url.startsWith('http')) continue;
    
    if (isUnresolvable(s.url)) {
      streams.push({
        externalUrl: s.url, server: s.server,
        name: `AnimeJara\n${s.server}`,
        title: `${slug} Ep. ${episode}\n⚙️ ${s.server}\n🔗 Abrir en navegador`,
        behaviorHints: { notWebReady: true, bingeGroup: 'animejara|' + s.server.toLowerCase() },
      });
      continue;
    }
    
    // Already direct video URL
    if (isDirectVideoUrl(s.url)) {
      streams.push({
        url: s.url, server: s.server, name: `AnimeJara\n${s.server}`,
        title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
        behaviorHints: { notWebReady: false, bingeGroup: 'animejara|' + s.server.toLowerCase() },
      });
      continue;
    }
    
    // Try to resolve
    let direct = null;
    if (b) {
      try { direct = await resolveEmbedUrl(b, s.url, 6000); } catch {}
    }
    if (!direct) {
      try { direct = await resolveEmbed(s.url); } catch {}
    }
    
    if (direct && isDirectVideoUrl(direct)) {
      streams.push({
        url: direct, server: s.server, name: `AnimeJara\n${s.server}`,
        title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
        behaviorHints: { notWebReady: false, bingeGroup: 'animejara|' + s.server.toLowerCase() },
      });
    } else {
      streams.push({
        url: s.url, server: s.server, name: `AnimeJara\n${s.server}`,
        title: `${slug} Ep. ${episode}\n⚙️ ${s.server}`,
        behaviorHints: { notWebReady: true, bingeGroup: 'animejara|' + s.server.toLowerCase() },
      });
    }
  }

  const seen = new Set();
  return streams.filter(s => { const k = s.url + s.server; if (seen.has(k)) return false; seen.add(k); return true; });
}
