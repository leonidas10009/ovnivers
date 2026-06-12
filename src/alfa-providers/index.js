const providers = require('./providers');
const { fetchHTML, fetchJSON, similarity, getTMDBInfo, searchProvider, getEpisodeUrl, extractVideos, detectServer } = require('./engine');

const TMDB_KEY = 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

let titleCache = new Map();

async function resolveTitle(id, mediaType) {
  const cacheKey = `${mediaType}:${id}`;
  if (titleCache.has(cacheKey)) return titleCache.get(cacheKey);

  try {
    let tmdbId = id;
    if (id.startsWith('tt')) {
      const findRes = await fetch(`https://api.themoviedb.org/3/find/${id}?api_key=${TMDB_KEY}&external_source=imdb_id`, {
        headers: { 'User-Agent': UA }
      });
      if (findRes.ok) {
        const data = await findRes.json();
        const results = data?.[mediaType === 'tv' ? 'tv_results' : 'movie_results'];
        if (results?.[0]) tmdbId = results[0].id;
      }
    }

    const res = await fetch(`https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_KEY}&language=en`, {
      headers: { 'User-Agent': UA }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const info = {
      title: data.title || data.name || '',
      year: (data.release_date || data.first_air_date || '').substring(0, 4),
      imdbId: data.imdb_id || ''
    };
    titleCache.set(cacheKey, info);
    return info;
  } catch { return null; }
}

async function scrapeAlfaProviders(type, id, season, episode) {
  const mediaType = type === 'series' || type === 'tv' ? 'tv' : 'movie';
  const info = await resolveTitle(id, mediaType);
  if (!info || !info.title) return [];

  const title = info.title;
  const year = info.year;

  const activeProviders = providers.filter(p => {
    if (!p.active || p.adult) return false;
    if (mediaType === 'tv') return p.categories.includes('tvshow') || p.categories.includes('movie');
    return p.categories.includes('movie') || p.categories.includes('tvshow');
  });

  const results = [];
  const chunks = chunkArray(activeProviders, 4);

  for (const chunk of chunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map(async (provider) => {
        try {
          const pageUrl = await searchProvider(provider, title, year, mediaType);
          if (!pageUrl) return [];

          let targetUrl = pageUrl;
          if (mediaType === 'tv' && season && episode) {
            const epUrl = await getEpisodeUrl(provider, pageUrl, season, episode);
            if (epUrl) targetUrl = epUrl;
          }

          const videos = await extractVideos(provider, targetUrl);
          if (!videos.length) return [];

          return videos.map(v => ({
            name: v.quality || 'HD',
            description: `${provider.title} [${v.server || detectServer(v.url)}]`,
            url: v.url,
            behaviorHints: { notWebReady: true }
          }));
        } catch { return []; }
      })
    );
    for (const r of chunkResults) {
      if (r.status === 'fulfilled') results.push(...r.value);
    }
    if (results.length >= 30) break;
  }

  return results.slice(0, 50);
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

module.exports = scrapeAlfaProviders;
