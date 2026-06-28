const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

let puppeteer = null;
let browser = null;
let browserPromise = null;

async function getPuppeteer() {
  if (puppeteer) return puppeteer;
  try { 
    puppeteer = (await import('puppeteer-core')).default || puppeteer;
    if (puppeteer) return puppeteer;
    throw new Error('no default export');
  }
  catch (e) { console.error('[pptr] puppeteer-core:', e.message); return null; }
}

async function getChromium() {
  // Use intelligent/launcher.js which has proper fallback: system → sparticuz → bundled
  try {
    const { findSystemChrome, findSparticuzChromium } = require('./intelligent/launcher');
    
    // Try system Chrome first (Windows/Linux/macOS)
    const sysChrome = findSystemChrome();
    if (sysChrome) {
      console.log('[pptr] using system Chrome:', sysChrome.substring(0, 60));
      return { executablePath: sysChrome, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'], headless: 'shell' };
    }
    
    // Fallback to @sparticuz/chromium
    const sparticuz = await findSparticuzChromium();
    if (sparticuz && sparticuz.path) {
      console.log('[pptr] using @sparticuz/chromium:', sparticuz.path.substring(0, 60));
      return { executablePath: sparticuz.path, args: sparticuz.args || [], headless: 'shell' };
    }
    
    console.warn('[pptr] no browser found (system Chrome not found, @sparticuz not available)');
    return null;
  } catch (e) {
    console.error('[pptr] browser resolution error:', e.message);
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

  let browserInstance = null;
  let page = null;
  try {
    const pptr = await getPuppeteer();
    if (!pptr) return null;
    const chromium = await getChromium();
    if (!chromium) return null;

    // Launch a fresh browser for this request, close it after
    browserInstance = await pptr.launch({
      args: chromium.args,
      executablePath: chromium.executablePath,
      headless: true,
      defaultViewport: { width: 1280, height: 720 },
    });
    console.log('[pptr] browser launched for', embedUrl.substring(0, 40));

    page = await browserInstance.newPage();
    await page.setUserAgent(UA);

    let videoUrl = null;
    const blockedPatterns = ['test-videos.co.uk', 'bigbuckbunny', 'google.com', 'analytics', 'cdn.jkdesa', '.css', '.js', 'videojs'];

    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      if (videoUrl) { req.abort(); return; }
      const isVideo = /\.(m3u8|mp4|mkv|ts|webm)(\?|$)/i.test(u) || u.includes('/hls/');
      const isBlocked = blockedPatterns.some(p => u.includes(p));
      if (isVideo && !isBlocked) {
        videoUrl = u;
        req.abort();
      } else {
        req.continue();
      }
    });

    page.on('response', async resp => {
      if (videoUrl) return;
      const ct = resp.headers()['content-type'] || '';
      if ((ct.includes('mpegurl') || ct.includes('video/mp4')) && !blockedPatterns.some(p => resp.url().includes(p))) {
        videoUrl = resp.url();
      }
    });

    try { await page.goto(embedUrl, { waitUntil: 'networkidle2', timeout }); } catch {}
    await new Promise(r => setTimeout(r, 8000));

    // DOM-based detection (catches JS-generated players)
    if (!videoUrl) {
      try {
        videoUrl = await page.evaluate(() => {
          // Strategy 1: direct video tag
          const v = document.querySelector('video');
          if (v && v.src && !v.src.startsWith('blob:')) return v.src;
          const sources = document.querySelectorAll('source[src]');
          for (const s of sources) {
            const src = s.getAttribute('src');
            if (src && !src.startsWith('blob:') && (src.includes('.m3u8') || src.includes('.mp4'))) return src;
          }
          // Strategy 2: JWPlayer setup
          const scripts = document.querySelectorAll('script');
          for (const s of scripts) {
            const c = s.textContent || '';
            const m = c.match(/file\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/);
            if (m) return m[1];
          }
          // Strategy 3: any m3u8/mp4 in scripts
          for (const s of scripts) {
            const c = s.textContent || '';
            const m = c.match(/["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)["']/);
            if (m && !m[1].includes('test-videos') && !m[1].includes('bigbuckbunny')) return m[1];
          }
          return null;
        });
      } catch {}
    }

    if (videoUrl && !blockedPatterns.some(p => videoUrl.includes(p))) {
      cache.set(ck, { url: videoUrl, time: Date.now() });
      if (cache.size > 50) { const first = cache.keys().next().value; cache.delete(first); }
    }
    return videoUrl;
  } catch (e) {
    console.error('[pptr] resolve error:', e.message);
    return null;
  } finally {
    if (page) try { await page.close(); } catch {}
    if (browserInstance) try { await browserInstance.close(); } catch {}
  }
}

module.exports = { resolveEmbedWithBrowser, closeBrowser };
