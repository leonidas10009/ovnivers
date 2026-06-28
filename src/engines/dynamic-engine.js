// engines/dynamic-engine.js — Professional Puppeteer-based scraping
// Leverages the full intelligent system (AutonomousScraper, BrowserPool, DynamicPageHandler)
// Does NOT reimplement — configures and orchestrates existing production-grade modules
//
// Strategy per page type (from PageTypeClassifier):
//   listing   → extract links, follow best match
//   detail    → find episodes/seasons, navigate to episode
//   content   → click servers, capture network, extract embeds
//   search    → parse results, score matches
//   unknown   → full investigation (AutonomousScraper.investigate)

const {
  AutonomousScraper,
  BrowserPool,
  StaticScraper,
  SmartAnalyzer,
  PageTypeClassifier,
  createBrowser,
  createPage,
  setupResourceBlocking,
  getSessionMemory,
} = require('../intelligent');

const { resolveEmbed, isDirectVideoUrl } = require('../alfa-providers/embed-resolver');

// ─── Professional browser pool (shared with intelligent engine) ───
let pool = null;

function getPool() {
  if (!pool) {
    pool = new BrowserPool(
      () => createBrowser({ headless: true, stealth: true, timeout: 30000 }),
      { min: 0, max: 1, idleTimeoutMs: 5 * 60 * 1000 }
    );
  }
  return pool;
}

// ─── DynamicEngine class ──────────────────────────────────────

class DynamicEngine {
  constructor(options = {}) {
    this.maxDepth = options.maxDepth || 2;
    this.maxRequests = options.maxRequests || 30;
    this.timeout = options.timeout || 25000;
    this.waitMs = options.waitMs || 4000;
    this.memory = getSessionMemory();
  }

  /**
   * Search a provider's site for content matching the query
   * Uses AutonomousScraper to handle JS rendering, SPA navigation, Cloudflare
   * 
   * @param {object} provider - Provider config
   * @param {string} query - Search query
   * @returns {Promise<string|null>} Best matching page URL
   */
  async search(provider, query) {
    const searchUrl = provider.baseUrl + provider.search.url.replace('{query}', encodeURIComponent(query));
    const pool = getPool();
    const instance = await pool.acquire();
    
    try {
      const page = await createPage(instance.browser, { stealth: true });
      await setupResourceBlocking(page);

      const scraper = new AutonomousScraper(page, {
        searchTerm: query,
        maxRequests: this.maxRequests,
        maxDepth: 1,
        contentGoal: 'auto',
      });

      // Use quickExtract for search pages (faster than investigate)
      const investigation = await scraper.quickExtract(searchUrl);

      // Classify page type
      const classifier = new PageTypeClassifier();
      const pageType = classifier.analyze([], searchUrl, investigation.title || '');

      console.log(`[dynamic:search] ${provider.name} → ${pageType.type} (${pageType.confidence}%)`);

      // Find content URLs matching the query
      const candidates = [
        ...(investigation.findings?.navigationUrls || []),
        ...(investigation.findings?.serverUrls || []),
      ].filter(u => {
        const lower = u.toLowerCase();
        const querySlug = query.toLowerCase().replace(/\s+/g, '-');
        return lower.includes(querySlug) ||
               query.toLowerCase().split(/\s+/).every(w => lower.includes(w));
      });

      await page.close().catch(() => {});
      await pool.release(instance);

      if (candidates.length > 0) {
        candidates.sort((a, b) => a.length - b.length);
        return candidates[0];
      }

      // If no candidates, try server catalog URLs as fallback
      for (const server of (investigation.serverCatalog || [])) {
        for (const u of server.urls) {
          if (u.url && u.type === 'navigation') {
            return u.url;
          }
        }
      }

      return null;

    } catch (e) {
      console.warn(`[dynamic:search] ${provider.name} failed: ${e.message}`);
      try { await pool.release(instance); } catch {}
      return null;
    }
  }

  /**
   * Extract video streams from a content page
   * Uses AutonomousScraper.investigate for full exploration:
   *   - Clicks server buttons
   *   - Captures network responses (video/mp4/m3u8)
   *   - Extracts iframe sources
   *   - Discovers embed links
   *   - Resolves embeds to direct URLs
   * 
   * @param {object} provider - Provider config
   * @param {string} pageUrl - Content page URL
   * @returns {Promise<Array>} Array of { url, server, quality } objects
   */
  async extractVideos(provider, pageUrl) {
    const pool = getPool();
    const instance = await pool.acquire();
    
    try {
      const page = await createPage(instance.browser, { stealth: true });
      await setupResourceBlocking(page);

      // Network capture for direct video URLs
      const capturedVideos = new Set();
      
      page.on('response', (response) => {
        const ct = response.headers()['content-type'] || '';
        if (ct.includes('video') || ct.includes('mpegurl')) {
          capturedVideos.add(response.url());
        }
      });

      // Full autonomous investigation — clicks servers, follows embeds
      const scraper = new AutonomousScraper(page, {
        maxRequests: this.maxRequests,
        maxDepth: this.maxDepth,
        contentGoal: 'video',
      });

      const investigation = await scraper.investigate(pageUrl);

      await page.close().catch(() => {});
      await pool.release(instance);

      // ── Build results from investigation ───────────────────
      const results = [];
      const seen = new Set();

      // 1. Direct video URLs from network capture
      for (const url of capturedVideos) {
        if (!seen.has(url)) {
          seen.add(url);
          results.push({ url, server: 'direct', quality: provider.videos?.defaultQuality || 'HD' });
        }
      }

      // 2. Server catalog from investigation (clicked servers, classified by SmartAnalyzer)
      for (const server of (investigation.serverCatalog || [])) {
        for (const u of server.urls) {
          if (u.url && !seen.has(u.url) && u.type !== 'cdn' && u.type !== 'tracking' && u.type !== 'social') {
            seen.add(u.url);
            results.push({
              url: u.url,
              server: server.name !== 'unknown' ? server.name : this._detectServer(u.url),
              quality: provider.videos?.defaultQuality || 'HD',
            });
          }
        }
      }

      // 3. Video URLs from findings
      for (const url of (investigation.findings?.videoUrls || [])) {
        if (url && !seen.has(url)) {
          seen.add(url);
          results.push({ url, server: 'direct', quality: provider.videos?.defaultQuality || 'HD' });
        }
      }

      // 4. Server/embed URLs from findings
      for (const url of (investigation.findings?.serverUrls || [])) {
        if (url && !seen.has(url)) {
          seen.add(url);
          results.push({ url, server: this._detectServer(url), quality: provider.videos?.defaultQuality || 'HD' });
        }
      }

      // ── Resolve embeds to direct URLs ──────────────────────
      for (const r of results) {
        if (r.server !== 'direct' && !r.url.includes('.mp4') && !r.url.includes('.m3u8')) {
          try {
            const direct = await resolveEmbed(r.url, pageUrl);
            if (direct && isDirectVideoUrl(direct)) {
              r.url = direct;
              r.server = 'direct';
            }
          } catch {}
        }
      }

      console.log(`[dynamic:video] ${provider.name} → ${results.length} videos from ${investigation.serverCatalog?.length || 0} servers (${investigation.steps?.length || 0} steps, ${investigation.durationMs}ms)`);

      return results;

    } catch (e) {
      console.warn(`[dynamic:video] ${provider.name} failed: ${e.message}`);
      try { await pool.release(instance); } catch {}
      return [];
    }
  }

  /**
   * Validate if a provider's site is accessible via dynamic engine
   */
  async validate(provider) {
    try {
      const url = await this.search(provider, 'test');
      return { accessible: !!url, url };
    } catch {
      return { accessible: false };
    }
  }

  _detectServer(url) {
    if (!url) return 'unknown';
    if (/\.(mp4|m3u8|mkv|webm)(\?|$)/i.test(url)) return 'direct';
    if (/magnet:/i.test(url)) return 'torrent';
    const servers = ['streamwish','filemoon','doodstream','streamtape','mixdrop',
      'upstream','voe','okru','vidhide','vidpro','netu','yourupload',
      'uqload','mega','jawcloud','fembed','gvideo','goodstream','vimeos','fastream'];
    const lower = url.toLowerCase();
    for (const s of servers) if (lower.includes(s)) return s;
    return 'embed';
  }
}

// Singleton
let instance = null;

function getDynamicEngine() {
  if (!instance) instance = new DynamicEngine();
  return instance;
}

module.exports = {
  DynamicEngine,
  getDynamicEngine,
  // Shorthand for router compatibility
  search: (provider, query) => getDynamicEngine().search(provider, query),
  extractVideos: (provider, pageUrl) => getDynamicEngine().extractVideos(provider, pageUrl),
};
