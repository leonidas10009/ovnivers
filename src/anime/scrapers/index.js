const animeflv = require('./animeflv');

/**
 * Route an anime stream request to the correct source.
 * - For provider-prefixed IDs (animeflv:, animeav1:, etc.): query all 4 providers in parallel
 *   by extracting the slug and passing it to Pigamer37 for each provider.
 * - For tmdb: / numeric IDs: let Pigamer37 handle it directly (it resolves to providers internally).
 */
async function getStreams(id, season, episode, pigamerGetStreams) {
  const animePrefixes = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:'];
  const hasAnimePrefix = animePrefixes.some(p => id.startsWith(p));

  if (hasAnimePrefix) {
    // Extract the slug (e.g. "one-piece-tv" from "animeflv:one-piece-tv")
    const slug = extractSlug(id);
    if (!slug || slug.match(/^\d+$/)) {
      // If slug is numeric or empty, fall through to Pigamer37 direct
    } else {
      const promises = [];

      // Try local scraper for animeflv
      if (id.startsWith('animeflv:')) {
        promises.push(
          (async () => {
            try {
              const streams = await animeflv.getStreams(slug, episode || 1);
              return { provider: 'AnimeFLV', streams };
            } catch { return { provider: 'AnimeFLV', streams: [] }; }
          })()
        );
      }

      // Query all 4 providers via Pigamer37 with correct slugs
      const providers = [
        { prefix: 'animeflv:', label: 'AnimeFLV' },
        { prefix: 'animeav1:', label: 'AnimeAV1' },
        { prefix: 'henaojara:', label: 'Henaojara' },
        { prefix: 'tioanime:', label: 'TioAnime' },
      ];

      for (const { prefix, label } of providers) {
        if (id.startsWith(prefix)) continue; // already handled by local scraper
        const providerId = `${prefix}${slug}`;
        promises.push(
          (async () => {
            try {
              const streams = await pigamerGetStreams(providerId, season, episode);
              return { provider: label, streams };
            } catch { return { provider: label, streams: [] }; }
          })()
        );
      }

      const results = await Promise.allSettled(promises);
      const allStreams = [];
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value?.streams?.length) {
          allStreams.push(...r.value.streams);
        }
      }
      if (allStreams.length) return { source: 'parallel', streams: allStreams };
    }
  }

  // Fallback / tmdb: / numeric IDs: let Pigamer37 handle everything
  // Pigamer37 internally resolves tmdb: → correct provider slugs → scrapes → returns streams
  try {
    const streams = await pigamerGetStreams(id, season, episode);
    return { source: 'pigamer', streams };
  } catch { return { source: 'error', streams: [] }; }
}

function extractSlug(id) {
  const parts = id.split(':');
  if (parts.length >= 2) return parts[1].split(':')[0];
  return id;
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
