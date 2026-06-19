const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

let puppeteer = null;
let browser = null;
let browserPromise = null;

async function getPuppeteer() {
  if (puppeteer) return puppeteer;
  try { puppeteer = require('puppeteer-core'); return puppeteer; }
  catch (e) { console.error('[pptr] puppeteer-core not available:', e.message); return null; }
}

async function getChromium() {
  try {
    const sparticuz = require('@sparticuz/chromium');
    const instance = new (sparticuz.default)();
    return instance;
  } catch (e) {
    console.error('[pptr] @sparticuz/chromium not available:', e.message);
    return null;
  }
}

async function getBrowser() {
  if (browser) {
    try { if (browser.isConnected()) return browser; } catch { browser = null; }
  }
  if (browserPromise) return browserPromise;

  browserPromise = (async () => {
    const pptr = await getPuppeteer();
    if (!pptr) return null;
    const chromium = await getChromium();
    if (!chromium) return null;

    try {
      console.log('[pptr] launching browser...');
      browser = await pptr.launch({
        args: chromium.args || ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        defaultViewport: chromium.defaultViewport || { width: 1280, height: 720 },
        executablePath: await chromium.executablePath(),
        headless: chromium.headless !== false,
      });
      console.log('[pptr] browser launched OK');
      browserPromise = null;
      return browser;
    } catch (e) {
      console.error('[pptr] launch failed:', e.message);
      browserPromise = null;
      return null;
    }
  })();

  return browserPromise;
}

async function closeBrowser() {
  if (browser) { try { await browser.close(); } catch {} browser = null; browserPromise = null; }
}

const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

async function resolveEmbedWithBrowser(embedUrl, timeout = 15000) {
  const ck = embedUrl;
  const cached = cache.get(ck);
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.url;

  const b = await getBrowser();
  if (!b) return null;

  let page = null;
  try {
    page = await b.newPage();
    await page.setUserAgent(UA);

    let videoUrl = null;
    const videoHosts = ['streamwish', 'voe', 'mixdrop', 'vidhide', 'filemoon', 'doodstream', 'streamtape'];

    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      if (videoUrl) { req.abort(); return; }
      const isVideo = /\.(m3u8|mp4|mkv|ts)(\?|$)/i.test(u) || u.includes('/hls/') || u.includes('/video/');
      const isFromVideoHost = videoHosts.some(h => { try { return new URL(u).hostname.includes(h); } catch { return false; } });
      if (isVideo && !isFromVideoHost && !u.includes('google') && !u.includes('analytics') && !u.includes('cdn.jkdesa')) {
        videoUrl = u;
        req.abort();
      } else {
        req.continue();
      }
    });

    page.on('response', async resp => {
      if (videoUrl) return;
      const ct = resp.headers()['content-type'] || '';
      if (ct.includes('application/x-mpegurl') || ct.includes('video/mp4') || ct.includes('video/webm')) {
        videoUrl = resp.url();
      }
    });

    try { await page.goto(embedUrl, { waitUntil: 'domcontentloaded', timeout }); } catch {}
    await new Promise(r => setTimeout(r, 5000));

    if (!videoUrl) {
      try {
        videoUrl = await page.evaluate(() => {
          const v = document.querySelector('video');
          if (v && v.src && !v.src.startsWith('blob:')) return v.src;
          const src = document.querySelector('video source, source');
          if (src) {
            const s = src.getAttribute('src') || src.src;
            if (s && !s.startsWith('blob:')) return s;
          }
          return null;
        });
      } catch {}
    }

    if (videoUrl) {
      cache.set(ck, { url: videoUrl, time: Date.now() });
      if (cache.size > 100) { const first = cache.keys().next().value; cache.delete(first); }
    }
    return videoUrl;
  } catch (e) {
    console.error('[pptr] resolve failed for', embedUrl, ':', e.message);
    return null;
  } finally {
    if (page) try { await page.close(); } catch {}
  }
}

module.exports = { resolveEmbedWithBrowser, closeBrowser };
