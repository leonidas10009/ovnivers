const animeflv = require('./animeflv');

/**
 * Route an anime stream request to all providers in parallel,
 * just like the original Pigamer37 addon does.
 */
async function getStreams(id, season, episode, pigamerGetStreams) {
  const slug = extractSlug(id);
  const promises = [];

  if (id.startsWith('animeflv:')) {
    // Try local scraper first
    promises.push(
      (async () => {
        try {
          const streams = await animeflv.getStreams(slug, episode || 1);
          return { provider: 'AnimeFLV', streams };
        } catch { return { provider: 'AnimeFLV', streams: [] }; }
      })()
    );
  }

  // Query all 4 providers via Pigamer37 in parallel (original addon behavior)
  const providers = [
    { prefix: 'animeflv:', label: 'AnimeFLV' },
    { prefix: 'animeav1:', label: 'AnimeAV1' },
    { prefix: 'henaojara:', label: 'Henaojara' },
    { prefix: 'tioanime:', label: 'TioAnime' },
  ];

  for (const { prefix, label } of providers) {
    // Don't duplicate if local scraper already handled this
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

  return { source: 'combined', streams: allStreams };
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
