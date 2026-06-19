const animeflv = require('./animeflv');

/**
 * Route an anime stream request to the correct scraper based on ID prefix.
 * Falls back to external Pigamer37 proxy if no local scraper matches.
 */
async function getStreams(id, season, episode, pigamerGetStreams) {
  if (id.startsWith('animeflv:')) {
    const slug = id.replace('animeflv:', '').split(':')[0];
    try {
      const streams = await animeflv.getStreams(slug, episode || 1);
      if (streams.length) return { source: 'local', streams };
    } catch {}
  }
  // Fallback to Pigamer37 proxy for other IDs or if local scraper fails
  try {
    const streams = await pigamerGetStreams(id, season, episode);
    return { source: 'pigamer', streams };
  } catch { return { source: 'error', streams: [] }; }
}

/**
 * Get on-air catalog from local scrapers.
 */
async function getOnAirCatalog(providerId) {
  if (providerId === 'animeflv|onair') {
    const items = await animeflv.getOnAir();
    return { metas: items };
  }
  return { metas: [] };
}

module.exports = { getStreams, getOnAirCatalog, animeflv };
