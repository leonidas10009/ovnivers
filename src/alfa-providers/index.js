const providers = require('./providers');
const { fetchHTML, fetchJSON, similarity, searchProvider, getEpisodeUrl, extractVideos, detectServer } = require('./engine');

const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const ANIME_PREFIXES = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:', 'anilist:', 'kitsu:', 'mal:', 'anidb:'];

const titleCache = new Map();
const MAX_CACHE = 500;

function cacheSet(key, value) {
  if (titleCache.size >= MAX_CACHE) {
    const firstKey = titleCache.keys().next().value;
    titleCache.delete(firstKey);
  }
  titleCache.set(key, value);
}

function isAnimeId(id) {
  return ANIME_PREFIXES.some(p => id.startsWith(p));
}

function extractSlug(id) {
  const parts = id.split(':');
  return parts.length >= 2 ? parts[1] : id;
}

async function resolveTitle(id, mediaType) {
  const cacheKey = `${mediaType}:${id}`;
  if (titleCache.has(cacheKey)) return titleCache.get(cacheKey);

  if (isAnimeId(id)) {
    const slug = extractSlug(id);
    const info = { title: slug.replace(/-/g, ' '), year: '', imdbId: '', slug };
    cacheSet(cacheKey, info);
    return info;
  }

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
    cacheSet(cacheKey, info);
    return info;
  } catch { return null; }
}

function mapTypeToCategory(type) {
  if (type === 'movie') return 'movie';
  if (type === 'series' || type === 'tv') return 'tvshow';
  if (type === 'anime') return 'anime';
  return 'movie';
}

function mapTypeToTMDB(type) {
  if (type === 'series' || type === 'tv' || type === 'anime') return 'tv';
  return 'movie';
}

async function scrapeAlfaProviders(type, id, season, episode) {
  const category = mapTypeToCategory(type);
  const mediaType = mapTypeToTMDB(type);

  const info = await resolveTitle(id, mediaType);
  if (!info || !info.title) return [];

  const title = info.title;
  const year = info.year;

  const activeProviders = providers.filter(p => {
    if (!p.active || p.adult) return false;
    return p.categories.includes(category);
  });

  if (!activeProviders.length) return [];

  const results = [];
  const chunks = chunkArray(activeProviders, 4);

  for (const chunk of chunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map(async (provider) => {
        try {
          const pageUrl = await searchProvider(provider, title, year, mediaType);
          if (!pageUrl) return [];

          let targetUrl = pageUrl;
          if ((category === 'tvshow' || category === 'anime') && season && episode) {
            const epUrl = await getEpisodeUrl(provider, pageUrl, season, episode);
            if (epUrl) targetUrl = epUrl;
          }

          const videos = await extractVideos(provider, targetUrl);
          if (!videos.length) return [];

          return videos.map(v => ({
            name: `${provider.title}\n${v.server || detectServer(v.url)}`,
            title: `${v.quality || 'HD'}\n⚙️ ${v.server || detectServer(v.url)}\n🔗 ${provider.title}`,
            description: v.lang || (Array.isArray(provider.language) ? provider.language.join(',') : ''),
            url: v.url,
            behaviorHints: {
              notWebReady: true,
              bingeGroup: `alfa|${provider.name}|${v.server || detectServer(v.url)}`
            }
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
