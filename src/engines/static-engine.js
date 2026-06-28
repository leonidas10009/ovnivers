// engines/static-engine.js — Cheerio-based scraping (fast, ~15MB RAM)
// Wraps the existing engine.js functions for search + video extraction
// Handles: WordPress sites, PHP-based sites, API JSON endpoints, basic HTML

const engine = require('../web-providers/engine');
const cheerio = require('cheerio');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Static search — uses provider's configured selectors with cheerio
 * @returns {string|null} Page URL of best match, or null
 */
async function search(provider, query) {
  return engine.searchProvider(provider, query, null, _mapCategory(provider));
}

/**
 * Static video extraction — uses provider's configured video type
 * @returns {Array} Array of { url, server, quality, infoHash } objects
 */
async function extractVideos(provider, pageUrl) {
  return engine.extractVideos(provider, pageUrl);
}

/**
 * Static episode URL resolution
 */
async function getEpisodeUrl(provider, seriesUrl, season, episode) {
  return engine.getEpisodeUrl(provider, seriesUrl, season, episode);
}

/**
 * Check if a provider's search page returns valid results with current selectors
 * @returns {object} { ok, items, sampleTitles }
 */
async function validateSearch(provider, query) {
  try {
    const searchUrl = provider.baseUrl + provider.search.url.replace('{query}', encodeURIComponent(query));
    const res = await fetch(searchUrl, { 
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      signal: AbortSignal.timeout(10000) 
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, items: 0 };

    const html = await res.text();
    if (html.length < 500) return { ok: false, error: 'Short response', items: 0 };

    const $ = cheerio.load(html);
    const itemSel = provider.search.itemSelector;
    let items;
    try {
      items = itemSel === '&' ? $(provider.search.linkSelector) : $(itemSel);
    } catch { items = $(); }

    const titles = [];
    const titleSel = provider.search.titleSelector;
    items.slice(0, 5).each((i, el) => {
      let t;
      if (titleSel === '&') t = $(el).text().trim();
      else if (provider.search.titleAttr) t = $(el).find(titleSel).attr(provider.search.titleAttr) || '';
      else t = $(el).find(titleSel).first().text().trim() || $(el).text().trim();
      if (t) titles.push(t.substring(0, 60));
    });

    return {
      ok: items.length > 0 && titles.some(t => t.toLowerCase().includes(query.toLowerCase())),
      items: items.length,
      sampleTitles: titles,
      htmlSize: html.length,
    };
  } catch (e) {
    return { ok: false, error: e.message, items: 0 };
  }
}

function _mapCategory(provider) {
  const cat = provider.categories[0] || 'movie';
  if (cat === 'tvshow') return 'tv';
  if (cat === 'anime') return 'anime';
  if (cat === 'documentary') return 'other';
  return 'movie';
}

module.exports = { search, extractVideos, getEpisodeUrl, validateSearch };
