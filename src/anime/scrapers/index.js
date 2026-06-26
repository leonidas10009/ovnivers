const animeflv = require('./animeflv');
const jkanime = require('./jkanime');
const tioanime = require('./tioanime');
const animeav1 = require('./animeav1');
const animejara = require('./animejara');
const { enhanceStream, filterStreams } = require('../anime-smart');

const animePrefixes = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:', 'jkanime:', 'animejara:'];

async function getStreams(id, season, episode, pigamerGetStreams, searchTitle) {
  const hasAnimePrefix = animePrefixes.some(p => id.startsWith(p));
  if (!hasAnimePrefix) {
    // tmdb: / numeric IDs — query native scrapers by title
    const tasks = [];

    // Query native scrapers by title
    if (searchTitle && searchTitle.length > 2) {
      tasks.push(
        (async () => {
          try { const r = await jkanime.search(searchTitle); const s = r[0]?.slug; if (!s) return []; return (await jkanime.getStreams(s, episode || 1)).map(function(x) { return enhanceStream(x, 'JKAnime'); }); } catch { return []; }
        })(),
        (async () => {
          try { const r = await tioanime.search(searchTitle); const s = r[0]?.slug; if (!s) return []; return (await tioanime.getStreams(s, episode || 1)).map(function(x) { return enhanceStream(x, 'TioAnime'); }); } catch { return []; }
        })(),
        (async () => {
          try { const r = await animeflv.search(searchTitle); const s = r[0]?.slug; if (!s) return []; return (await animeflv.getStreams(s, episode || 1)).map(function(x) { return enhanceStream(x, 'AnimeFLV'); }); } catch { return []; }
        })(),
        (async () => {
          try { const r = await animejara.search(searchTitle); const s = r[0]?.slug; if (!s) return []; return (await animejara.getStreams(s, episode || 1)).map(function(x) { return enhanceStream(x, 'AnimeJara'); }); } catch { return []; }
        })(),
      );
    }

    const results = await Promise.allSettled(tasks);
    const allStreams = [];
    const seenUrls = new Set();
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value?.length) {
        for (const s of r.value) {
          if (s._filtered) continue;
          const url = (s.url || s.file || s.src || '').toLowerCase().replace(/\/+$/, '').split('?')[0];
          if (!url) { allStreams.push(s); continue; }
          if (seenUrls.has(url)) continue;
          seenUrls.add(url);
          allStreams.push(s);
        }
      }
    }
    return { source: 'native', streams: allStreams };
  }

  const slug = extractSlug(id);
  if (!slug || slug.match(/^\d+$/)) {
    return { source: 'error', streams: [] };
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
  if (id.startsWith('animejara:')) {
    promises.push(
      (async () => { try { return { provider: 'AnimeJara', streams: await animejara.getStreams(slug, ep) }; } catch { return { provider: 'AnimeJara', streams: [] }; } })()
    );
  }

  // Query native scrapers directly (all have dedicated scrapers)
  const results = await Promise.allSettled(promises);
  const allStreams = [];
  const seenUrls = new Set();
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value?.streams?.length) {
      for (const s of r.value.streams) {
        const enhanced = enhanceStream(s, r.value.provider || 'Unknown');
        if (enhanced._filtered) continue;

        const url = (s.url || s.file || s.src || '').toLowerCase().replace(/\/+$/, '').split('?')[0];
        if (!url) { allStreams.push(s); continue; }
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);
        allStreams.push(s);
      }
    }
  }
  return { source: 'native', streams: allStreams };
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
