const animeflv = require('./animeflv');
const jkanime = require('./jkanime');
const tioanime = require('./tioanime');
const animeav1 = require('./animeav1');

const animePrefixes = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:', 'jkanime:'];

async function getStreams(id, season, episode, pigamerGetStreams) {
  const hasAnimePrefix = animePrefixes.some(p => id.startsWith(p));
  if (!hasAnimePrefix) {
    // tmdb: / numeric IDs → Pigamer37
    try {
      const streams = await pigamerGetStreams(id, season, episode);
      return { source: 'pigamer', streams: streams || [] };
    } catch { return { source: 'error', streams: [] }; }
  }

  const slug = extractSlug(id);
  if (!slug || slug.match(/^\d+$/)) {
    try {
      const streams = await pigamerGetStreams(id, season, episode);
      return { source: 'pigamer', streams: streams || [] };
    } catch { return { source: 'error', streams: [] }; }
  }

  const ep = episode || 1;
  const promises = [];

  if (id.startsWith('jkanime:')) {
    promises.push(
      (async () => { try { return { provider: 'JKAnime', streams: await jkanime.getStreams(slug, ep) }; } catch { return { provider: 'JKAnime', streams: [] }; } })()
    );
  }
  if (id.startsWith('tioanime:')) {
    promises.push(
      (async () => { try { return { provider: 'TioAnime', streams: await tioanime.getStreams(slug, ep) }; } catch { return { provider: 'TioAnime', streams: [] }; } })()
    );
  }
  if (id.startsWith('animeflv:')) {
    promises.push(
      (async () => { try { return { provider: 'AnimeFLV', streams: await animeflv.getStreams(slug, ep) }; } catch { return { provider: 'AnimeFLV', streams: [] }; } })()
    );
  }
  if (id.startsWith('animeav1:')) {
    promises.push(
      (async () => { try { return { provider: 'AnimeAV1', streams: await animeav1.getStreams(slug, ep) }; } catch { return { provider: 'AnimeAV1', streams: [] }; } })()
    );
  }

  // Also query Pigamer37 for comparison/deduplication
  if (!id.startsWith('jkanime:')) {
    const pigamerProviders = [
      { prefix: 'animeflv:', label: 'AnimeFLV' },
      { prefix: 'animeav1:', label: 'AnimeAV1' },
      { prefix: 'henaojara:', label: 'Henaojara' },
      { prefix: 'tioanime:', label: 'TioAnime' },
    ];
    for (const { prefix, label } of pigamerProviders) {
      if (id.startsWith(prefix)) continue;
      promises.push(
        (async () => {
          try {
            const streams = await pigamerGetStreams(`${prefix}${slug}`, season, episode);
            return { provider: label, streams };
          } catch { return { provider: label, streams: [] }; }
        })()
      );
    }
  }

  const results = await Promise.allSettled(promises);
  const allStreams = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value?.streams?.length) {
      allStreams.push(...r.value.streams);
    }
  }
  return { source: 'parallel', streams: allStreams };
}

function extractSlug(id) {
  const parts = id.split(':');
  if (parts.length >= 2) return parts[1].split(':')[0];
  return id;
}

async function getOnAirCatalog(providerId) {
  if (providerId === 'animeflv|onair') {
    const items = await animeflv.getOnAir();
    return { metas: items };
  }
  return { metas: [] };
}

async function searchCatalog(providerId, query) {
  if (providerId === 'jkanime|search') {
    const results = await jkanime.search(query);
    return { metas: results.map(r => ({ id: `jkanime:${r.slug}`, type: 'series', name: r.title, poster: r.poster })) };
  }
  if (providerId === 'tioanime|search') {
    const results = await tioanime.search(query);
    return { metas: results.map(r => ({ id: `tioanime:${r.slug}`, type: 'series', name: r.title, poster: r.poster })) };
  }
  return { metas: [] };
}

module.exports = { getStreams, getOnAirCatalog, searchCatalog, animeflv, jkanime, tioanime, animeav1 };
