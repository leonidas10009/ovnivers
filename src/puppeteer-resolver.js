const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

let puppeteer = null;
let browser = null;
let browserPromise = null;

async function getPuppeteer() {
  if (puppeteer) return puppeteer;
  try { puppeteer = require('puppeteer-core'); return puppeteer; }
  catch (e) { console.error('[pptr] puppeteer-core:', e.message); return null; }
}

async function getChromium() {
  try {
    const mod = await import('@sparticuz/chromium');
    const Cr = mod.default;
    const exePath = await Cr.executablePath();
    const args = Cr.args || [];
    console.log('[pptr] chromium ready:', exePath.substring(0, 60));
    return { executablePath: exePath, args, headless: 'shell' };
  } catch (e) {
    console.error('[pptr] @sparticuz/chromium:', e.message);
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
      browser = await pptr.launch({
        args: chromium.args,
        executablePath: chromium.executablePath,
        headless: true,
        defaultViewport: { width: 1280, height: 720 },
      });
      console.log('[pptr] browser launched');
      browserPromise = null;
      return browser;
    } catch (e) {
      console.error('[pptr] launch:', e.message);
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
      const isVideo = /\.(m3u8|mp4|mkv|ts)(\?|$)/i.test(u) || u.includes('/hls/');
      const isFromHost = videoHosts.some(h => { try { return new URL(u).hostname.includes(h); } catch { return false; } });
      if (isVideo && !isFromHost && !u.includes('google') && !u.includes('analytics') && !u.includes('cdn')) {
        videoUrl = u;
        req.abort();
      } else {
        req.continue();
      }
    });

    page.on('response', async resp => {
      if (videoUrl) return;
      const ct = resp.headers()['content-type'] || '';
      if (ct.includes('mpegurl') || ct.includes('video/mp4')) videoUrl = resp.url();
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
    console.error('[pptr] resolve:', embedUrl.substring(0, 50), e.message);
    return null;
  } finally {
    if (page) try { await page.close(); } catch {}
  }
}

module.exports = { resolveEmbedWithBrowser, closeBrowser };
