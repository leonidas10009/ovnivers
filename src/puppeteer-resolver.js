const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

let puppeteer = null;
let browserPromise = null;
let browser = null;

async function getPuppeteer() {
  if (puppeteer) return puppeteer;
  try { puppeteer = require('puppeteer'); console.log('[puppeteer] module loaded'); return puppeteer; }
  catch (e) { console.error('[puppeteer] module not available:', e.message); return null; }
}

async function getBrowser() {
  if (browser && browser.isConnected && browser.isConnected()) return browser;
  if (browser && !browser.isConnected) return browser;
  const pptr = await getPuppeteer();
  if (!pptr) return null;
  
  if (!browserPromise) {
    console.log('[puppeteer] launching browser...');
    browserPromise = pptr.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
      ],
    }).then(b => {
      console.log('[puppeteer] browser launched OK');
      browser = b;
      browserPromise = null;
      return b;
    }).catch(e => {
      console.error('[puppeteer] launch FAILED:', e.message);
      if (e.message.includes('chromium') || e.message.includes('executable')) {
        console.error('[puppeteer] Chromium not installed. Try: npx puppeteer browsers install chrome');
      }
      browserPromise = null;
      return null;
    });
  }
  return browserPromise;
}

async function closeBrowser() {
  if (browser) {
    try { await browser.close(); } catch {}
    browser = null;
    browserPromise = null;
  }
}

const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

async function resolveEmbedWithBrowser(embedUrl, referer, timeout = 15000) {
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

    // Intercept requests to catch the video URL
    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      if (videoUrl) { req.abort(); return; }
      const isVideo = /\.(m3u8|mp4|mkv|ts)(\?|$)/i.test(u) || u.includes('/hls/') || u.includes('/video/');
      const isFromVideoHost = videoHosts.some(h => {
        try { return new URL(u).hostname.includes(h); } catch { return false; }
      });
      if (isVideo && !isFromVideoHost && !u.includes('google') && !u.includes('analytics') && !u.includes('cdn')) {
        videoUrl = u;
        req.abort();
      } else {
        req.continue();
      }
    });

    // Block unnecessary resources to speed up
    page.on('response', async resp => {
      if (videoUrl) return;
      const ct = resp.headers()['content-type'] || '';
      if (ct.includes('application/x-mpegurl') || ct.includes('video/mp4') || ct.includes('video/webm')) {
        videoUrl = resp.url();
      }
    });

    const gotoOpts = { waitUntil: 'domcontentloaded', timeout };
    try {
      await page.goto(embedUrl, gotoOpts);
    } catch { /* timeout ok */ }

    // Wait a bit for JS to load video
    await new Promise(r => setTimeout(r, 4000));

    // If no video URL caught yet, check the DOM
    if (!videoUrl) {
      try {
        videoUrl = await page.evaluate(() => {
          const v = document.querySelector('video');
          if (v && v.src && !v.src.startsWith('blob:')) return v.src;
          const src = document.querySelector('video source[src], source');
          if (src && src.getAttribute('src')) return src.getAttribute('src');
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
    console.error('[puppeteer] resolve failed for', embedUrl, ':', e.message);
    return null;
  } finally {
    if (page) {
      try { await page.close(); } catch {}
    }
  }
}

module.exports = { resolveEmbedWithBrowser, closeBrowser };
