const animeflv = require('./animeflv');
const jkanime = require('./jkanime');

/**
 * Route an anime stream request to the correct source.
 * - For provider-prefixed IDs (jkanime:, animeflv:, etc.): query matching local scraper + Pigamer37
 * - For tmdb: / numeric IDs: try JKAnime slug resolution + Pigamer37
 */
async function getStreams(id, season, episode, pigamerGetStreams) {
  const animePrefixes = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:', 'jkanime:'];
  const hasAnimePrefix = animePrefixes.some(p => id.startsWith(p));

  if (hasAnimePrefix) {
    const slug = extractSlug(id);
    if (!slug || slug.match(/^\d+$/)) {
      // If slug is numeric or empty, fall through to Pigamer37 direct
    } else {
      const promises = [];

      if (id.startsWith('jkanime:')) {
        promises.push(
          (async () => {
            try {
              const streams = await jkanime.getStreams(slug, episode || 1);
              return { provider: 'JKAnime', streams };
            } catch { return { provider: 'JKAnime', streams: [] }; }
          })()
        );
      }

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

      // Query Pigamer37 for remaining providers
      const pigamerProviders = [
        { prefix: 'animeflv:', label: 'AnimeFLV' },
        { prefix: 'animeav1:', label: 'AnimeAV1' },
        { prefix: 'henaojara:', label: 'Henaojara' },
        { prefix: 'tioanime:', label: 'TioAnime' },
      ];

      for (const { prefix, label } of pigamerProviders) {
        if (id.startsWith(prefix)) continue;
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

  // TMDB / numeric IDs: try JKAnime by resolving slug from Pigamer37 title info, then Pigamer37
  let streams = [];
  try {
    // Try JKAnime with a slug deduced from Pigamer37 metadata
    // This is a best-effort: search JKAnime by the series name
    const pigamerStreams = await pigamerGetStreams(id, season, episode);
    if (pigamerStreams && pigamerStreams.length) {
      streams.push(...pigamerStreams);
    }
  } catch {}

  return { source: streams.length ? 'merged' : 'empty', streams };
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
  if (providerId === 'jkanime|onair' || providerId === 'jkanime:latest') {
    const items = await jkanime.getOnAir();
    return { metas: items };
  }
  return { metas: [] };
}

module.exports = { getStreams, getOnAirCatalog, animeflv, jkanime };
