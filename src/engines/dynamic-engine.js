// engines/dynamic-engine.js — Professional Puppeteer-based scraping
// Uses the SHARED BrowserPool via browser-pool-singleton.js
// Coordinates with puppeteer-fallback, puppeteer-resolver, jkanime-puppeteer

const {
  AutonomousScraper, PageTypeClassifier,
  createPage, setupResourceBlocking,
} = require('../intelligent');
const { getSharedPool } = require('../intelligent/browser-pool-singleton');
const { resolveEmbed, isDirectVideoUrl } = require('../alfa-providers/embed-resolver');

class DynamicEngine {
  constructor(options = {}) {
    this.maxDepth = options.maxDepth || 2;
    this.maxRequests = options.maxRequests || 30;
    this.timeout = options.timeout || 25000;
    this.waitMs = options.waitMs || 4000;
  }

  async search(provider, query) {
    const searchUrl = provider.baseUrl + provider.search.url.replace('{query}', encodeURIComponent(query));
    const pool = getSharedPool();
    let instance;

    try {
      instance = await pool.acquire();
      const page = await createPage(instance.browser, { stealth: true });
      await setupResourceBlocking(page);

      const scraper = new AutonomousScraper(page, {
        searchTerm: query, maxRequests: this.maxRequests, maxDepth: 1, contentGoal: 'auto',
      });

      const investigation = await scraper.quickExtract(searchUrl);
      const classifier = new PageTypeClassifier();
      const pageType = classifier.analyze([], searchUrl, investigation.title || '');
      console.log(`[dynamic:search] ${provider.name} → ${pageType.type} (${pageType.confidence}%)`);

      const candidates = [
        ...(investigation.findings?.navigationUrls || []),
        ...(investigation.findings?.serverUrls || []),
      ].filter(u => {
        const lower = u.toLowerCase();
        const querySlug = query.toLowerCase().replace(/\s+/g, '-');
        return lower.includes(querySlug) || query.toLowerCase().split(/\s+/).every(w => lower.includes(w));
      });

      await page.close().catch(() => {});

      if (candidates.length > 0) { candidates.sort((a, b) => a.length - b.length); return candidates[0]; }
      for (const server of (investigation.serverCatalog || [])) {
        for (const u of server.urls) { if (u.url && u.type === 'navigation') return u.url; }
      }
      return null;
    } catch (e) {
      console.warn(`[dynamic:search] ${provider.name} failed: ${e.message}`);
      return null;
    } finally {
      if (instance) await pool.release(instance).catch(() => {});
    }
  }

  async extractVideos(provider, pageUrl) {
    const pool = getSharedPool();
    let instance;
    try {
      instance = await pool.acquire();
      const page = await createPage(instance.browser, { stealth: true });
      await setupResourceBlocking(page);

      const capturedVideos = new Set();
      page.on('response', (response) => {
        const ct = response.headers()['content-type'] || '';
        if (ct.includes('video') || ct.includes('mpegurl')) capturedVideos.add(response.url());
      });

      const scraper = new AutonomousScraper(page, {
        maxRequests: this.maxRequests, maxDepth: this.maxDepth, contentGoal: 'video',
      });
      const investigation = await scraper.investigate(pageUrl);
      await page.close().catch(() => {});

      const results = [];
      const seen = new Set();
      for (const url of capturedVideos) { if (!seen.has(url)) { seen.add(url); results.push({ url, server: 'direct', quality: provider.videos?.defaultQuality || 'HD' }); } }
      for (const server of (investigation.serverCatalog || [])) {
        for (const u of server.urls) {
          if (u.url && !seen.has(u.url) && u.type !== 'cdn' && u.type !== 'tracking' && u.type !== 'social') {
            seen.add(u.url);
            results.push({ url: u.url, server: server.name !== 'unknown' ? server.name : _detectServer(u.url), quality: provider.videos?.defaultQuality || 'HD' });
          }
        }
      }
      for (const url of (investigation.findings?.videoUrls || [])) { if (url && !seen.has(url)) { seen.add(url); results.push({ url, server: 'direct', quality: provider.videos?.defaultQuality || 'HD' }); } }
      for (const url of (investigation.findings?.serverUrls || [])) { if (url && !seen.has(url)) { seen.add(url); results.push({ url, server: _detectServer(url), quality: provider.videos?.defaultQuality || 'HD' }); } }

      for (const r of results) {
        if (r.server !== 'direct' && !r.url.includes('.mp4') && !r.url.includes('.m3u8')) {
          try { const direct = await resolveEmbed(r.url, pageUrl); if (direct && isDirectVideoUrl(direct)) { r.url = direct; r.server = 'direct'; } } catch {}
        }
      }
      console.log(`[dynamic:video] ${provider.name} → ${results.length} videos (${investigation.serverCatalog?.length || 0} servers, ${investigation.durationMs}ms)`);
      return results;
    } catch (e) { console.warn(`[dynamic:video] ${provider.name} failed: ${e.message}`); return []; }
    finally { if (instance) await pool.release(instance).catch(() => {}); }
  }

  _detectServer(url) {
    if (!url) return 'unknown';
    if (/\.(mp4|m3u8|mkv|webm)(\?|$)/i.test(url)) return 'direct';
    const servers = ['streamwish','filemoon','doodstream','streamtape','mixdrop','upstream','voe','okru','vidhide','netu','yourupload','uqload','mega'];
    const lower = url.toLowerCase();
    for (const s of servers) if (lower.includes(s)) return s;
    return 'embed';
  }
}

let instance = null;
function getDynamicEngine() { if (!instance) instance = new DynamicEngine(); return instance; }

module.exports = { DynamicEngine, getDynamicEngine, search: (p, q) => getDynamicEngine().search(p, q), extractVideos: (p, u) => getDynamicEngine().extractVideos(p, u) };
