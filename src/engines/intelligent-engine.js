// engines/intelligent-engine.js — Autonomous discovery via StaticScraper + AutonomousScraper
// Auto-discovers selectors, servers, and video URLs without manual configuration
// Uses SessionMemory for cross-session learning

const cheerio = require('cheerio');
const { StaticScraper, AutonomousScraper, SessionMemory, SmartAnalyzer, createBrowser, createPage, setupResourceBlocking } = require('../intelligent');
const { resolveEmbed, isDirectVideoUrl } = require('../alfa-providers/embed-resolver');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0 Safari/537.36';

/**
 * Intelligent search — auto-discovers content on a site without predefined selectors
 * Uses StaticScraper first (fast), then AutonomousScraper if needed
 * @returns {string|null} Best matching page URL
 */
async function search(provider, query) {
  const searchUrl = provider.baseUrl + provider.search.url.replace('{query}', encodeURIComponent(query));

  // Phase 1: Static analysis
  const ss = new StaticScraper();
  const analysis = await ss.analyze(searchUrl);

  if (analysis.urlsFound === 0) return null;

  // Look for content URLs that match the query
  const querySlug = query.toLowerCase().replace(/\s+/g, '-');
  const allUrls = [
    ...(analysis.findings?.navigationUrls || []),
    ...(analysis.findings?.serverUrls || []),
  ];

  // Find URLs containing the query slug
  const candidates = allUrls.filter(u => {
    const lower = u.toLowerCase();
    return lower.includes(querySlug) || 
           query.toLowerCase().split(/\s+/).every(w => lower.includes(w));
  });

  // If static analysis found matching URLs, return the best one
  if (candidates.length > 0) {
    // Prefer shorter URLs (closer to the content)
    candidates.sort((a, b) => a.length - b.length);
    return candidates[0];
  }

  // Phase 2: If no candidates, try browser-based auto-discovery
  try {
    const browser = await createBrowser({ headless: true, stealth: true, timeout: 20000 });
    const page = await createPage(browser);
    await setupResourceBlocking(page);

    const autonomous = new AutonomousScraper(page, {
      searchTerm: query,
      maxRequests: 20,
      maxDepth: 1,
    });

    const investigation = await autonomous.quickExtract(searchUrl);
    await browser.close().catch(() => {});

    // Check if we found any content URLs
    const discoveredUrls = [
      ...(investigation.findings?.navigationUrls || []),
      ...(investigation.findings?.serverUrls || []),
    ];

    const matches = discoveredUrls.filter(u => {
      const lower = u.toLowerCase();
      return lower.includes(querySlug) || 
             query.toLowerCase().split(/\s+/).every(w => lower.includes(w));
    });

    if (matches.length > 0) {
      matches.sort((a, b) => a.length - b.length);
      return matches[0];
    }

    // If still nothing, return the investigation pageType info
    return null;
  } catch (e) {
    console.warn(`[intelligent] Browser search failed: ${e.message}`);
    return null;
  }
}

/**
 * Intelligent video extraction — uses StaticScraper + AutonomousScraper to find all video sources
 * Auto-discovers embed URLs, direct videos, downloads, etc.
 * @returns {Array} Array of { url, server, quality } objects
 */
async function extractVideos(provider, pageUrl) {
  const results = [];
  const seen = new Set();

  // Phase 1: Static analysis (fast, ~15MB)
  const ss = new StaticScraper();
  const analysis = await ss.analyze(pageUrl);

  if (analysis.urlsFound === 0) return [];

  // Collect from server catalog
  for (const server of (analysis.serverCatalog || [])) {
    for (const u of server.urls) {
      if (u.url && !seen.has(u.url) && u.type !== 'unknown' && u.type !== 'cdn' && u.type !== 'tracking') {
        seen.add(u.url);
        results.push({
          url: u.url,
          server: server.name !== 'unknown' ? server.name : _detectServer(u.url),
          quality: provider.videos?.defaultQuality || 'HD',
        });
      }
    }
  }

  // Collect direct video URLs
  for (const url of (analysis.findings?.videoUrls || [])) {
    if (url && !seen.has(url)) {
      seen.add(url);
      results.push({ url, server: _detectServer(url), quality: provider.videos?.defaultQuality || 'HD' });
    }
  }

  // Collect server/embed URLs
  for (const url of (analysis.findings?.serverUrls || [])) {
    if (url && !seen.has(url)) {
      seen.add(url);
      results.push({ url, server: _detectServer(url), quality: provider.videos?.defaultQuality || 'HD' });
    }
  }

  // Phase 2: If static found nothing useful, use browser
  if (results.length === 0) {
    try {
      const browser = await createBrowser({ headless: true, stealth: true, timeout: 20000 });
      const page = await createPage(browser);
      await setupResourceBlocking(page);

      const autonomous = new AutonomousScraper(page, {
        maxRequests: 15,
        maxDepth: 1,
      });

      const investigation = await autonomous.investigate(pageUrl);
      await browser.close().catch(() => {});

      // Collect from browser-discovered servers
      for (const server of (investigation.serverCatalog || [])) {
        for (const u of server.urls) {
          if (u.url && !seen.has(u.url)) {
            seen.add(u.url);
            results.push({
              url: u.url,
              server: server.name !== 'unknown' ? server.name : _detectServer(u.url),
              quality: provider.videos?.defaultQuality || 'HD',
            });
          }
        }
      }

      // Browser-discovered video URLs
      for (const url of (investigation.findings?.videoUrls || [])) {
        if (url && !seen.has(url)) {
          seen.add(url);
          results.push({ url, server: _detectServer(url), quality: provider.videos?.defaultQuality || 'HD' });
        }
      }
    } catch (e) {
      console.warn(`[intelligent] Browser video extraction failed: ${e.message}`);
    }
  }

  // Resolve embeds to direct URLs
  for (const r of results) {
    if (!r.url.includes('.mp4') && !r.url.includes('.m3u8') && r.url.startsWith('http')) {
      try {
        const direct = await resolveEmbed(r.url, pageUrl);
        if (direct && isDirectVideoUrl(direct)) {
          r.url = direct;
          r.server = 'direct';
        }
      } catch {}
    }
  }

  return results;
}

function _detectServer(url) {
  if (!url) return 'unknown';
  if (/\.(mp4|m3u8|mkv|webm)(\?|$)/i.test(url)) return 'direct';
  if (/magnet:/i.test(url)) return 'torrent';
  const patterns = [
    'streamwish', 'filemoon', 'doodstream', 'streamtape', 'mixdrop',
    'upstream', 'voe', 'okru', 'vidhide', 'vidpro', 'netu', 'yourupload',
    'uqload', 'mega', 'jawcloud', 'fembed', 'gvideo',
  ];
  const lower = url.toLowerCase();
  for (const p of patterns) if (lower.includes(p)) return p;
  return 'embed';
}

module.exports = { search, extractVideos };
