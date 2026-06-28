// puppeteer-resolver.js — Browser-based embed → direct URL resolution
// Uses the SHARED BrowserPool — coordinates with all other browser users

const { getSharedPool } = require('./intelligent/browser-pool-singleton');
const { createPage, setupResourceBlocking } = require('./intelligent');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

async function resolveEmbedWithBrowser(embedUrl, timeout = 15000) {
  const ck = embedUrl;
  const cached = cache.get(ck);
  if (cached && Date.now() - cached.time < CACHE_TTL) return cached.url;

  const pool = getSharedPool();
  let instance;
  let page = null;

  try {
    instance = await pool.acquire();
    page = await createPage(instance.browser, { stealth: true });
    await setupResourceBlocking(page);

    let videoUrl = null;
    const blockedPatterns = ['test-videos.co.uk', 'bigbuckbunny', 'google.com', 'analytics', 'cdn.jkdesa', '.css', '.js', 'videojs'];

    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      if (videoUrl) { req.abort(); return; }
      const isVideo = /\.(m3u8|mp4|mkv|ts|webm)(\?|$)/i.test(u) || u.includes('/hls/');
      const isBlocked = blockedPatterns.some(p => u.includes(p));
      if (isVideo && !isBlocked) { videoUrl = u; req.abort(); }
      else { req.continue(); }
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

    if (!videoUrl) {
      try {
        videoUrl = await page.evaluate(() => {
          const v = document.querySelector('video');
          if (v && v.src && !v.src.startsWith('blob:')) return v.src;
          const sources = document.querySelectorAll('source[src]');
          for (const s of sources) { const src = s.getAttribute('src'); if (src && !src.startsWith('blob:') && (src.includes('.m3u8') || src.includes('.mp4'))) return src; }
          const scripts = document.querySelectorAll('script');
          for (const s of scripts) {
            const c = s.textContent || '';
            const m = c.match(/file\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/);
            if (m) return m[1];
          }
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
    if (instance) await pool.release(instance).catch(() => {});
  }
}

async function closeBrowser() {
  const pool = getSharedPool();
  await pool.closeAll();
}

module.exports = { resolveEmbedWithBrowser, closeBrowser };
