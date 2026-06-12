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

async function resolveTitles(id, mediaType) {
  const cacheKey = `titles:${mediaType}:${id}`;
  if (titleCache.has(cacheKey)) return titleCache.get(cacheKey);

  const variants = [];
  const seen = new Set();

  function addVariant(title, year) {
    const t = (title || '').trim();
    if (t && !seen.has(t.toLowerCase())) {
      variants.push({ title: t, year: year || '' });
      seen.add(t.toLowerCase());
    }
  }

  if (isAnimeId(id)) {
    const slug = extractSlug(id);
    addVariant(slug.replace(/-/g, ' '), '');
    if (slug.includes('-')) addVariant(slug, '');
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
        if (results?.[0]) tmdbId = String(results[0].id);
      }
    }

    if (!tmdbId.match(/^\d+$/)) {
      cacheSet(cacheKey, variants);
      return variants;
    }

    const langs = ['en', 'es', 'ja'];
    const results = await Promise.allSettled(
      langs.map(lang =>
        fetch(`https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_KEY}&language=${lang}`, {
          headers: { 'User-Agent': UA }
        }).then(r => r.ok ? r.json() : null)
      )
    );

    let firstYear = '';
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const data = result.value;
        const title = data.title || data.name || '';
        const year = (data.release_date || data.first_air_date || '').substring(0, 4);
        if (!firstYear) firstYear = year;
        addVariant(title, year);
        if (data.original_title && data.original_title !== title && data.original_language === 'ja') {
          addVariant(data.original_title, year);
        }
      }
    }

    if (firstYear && variants.length > 0) {
      for (const v of variants) {
        if (!v.year) v.year = firstYear;
      }
    }
  } catch {}

  if (variants.length === 0) {
    variants.push({ title: id, year: '' });
  }

  cacheSet(cacheKey, variants);
  return variants;
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

  const titleVariants = await resolveTitles(id, mediaType);
  if (!titleVariants.length || !titleVariants[0].title) return [];

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
          let pageUrl = null;
          for (const tv of titleVariants) {
            if (!tv.title) continue;
            pageUrl = await searchProvider(provider, tv.title, tv.year, mediaType);
            if (pageUrl) break;
          }
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
            description: v.lang || (category === 'anime' && !(Array.isArray(provider.language) && provider.language.includes('*'))
              ? [...new Set([...(Array.isArray(provider.language) ? provider.language : []), 'ja'])].join(',')
              : (Array.isArray(provider.language) ? provider.language.join(',') : '')),
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