const { TMDB_KEY, TMDB_BASE, UA } = require('./types');

const metaCache = new Map();
const altTitleCache = new Map();
const MAX_CACHE = 500;
const META_TTL = 5 * 60 * 1000;
const ALT_TTL = 24 * 60 * 60 * 1000;

function cacheGet(map, key, ttl) {
  const entry = map.get(key);
  if (entry && Date.now() - entry.time < ttl) return entry.value;
  if (entry) map.delete(key);
  return undefined;
}

function cacheSet(map, key, value, max) {
  if (map.size >= max) {
    const first = map.keys().next().value;
    map.delete(first);
  }
  map.set(key, { value, time: Date.now() });
}

async function fetchTMDB(path, timeout = 8000) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    const sep = path.includes('?') ? '&' : '?';
    const res = await fetch(`${TMDB_BASE}${path}${sep}api_key=${TMDB_KEY}`, {
      headers: { 'User-Agent': UA },
      signal: ctrl.signal
    });
    clearTimeout(timer);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function getMeta(tmdbId, mediaType, language = 'en') {
  const ck = `meta:${mediaType}:${tmdbId}:${language}`;
  const cached = cacheGet(metaCache, ck, META_TTL);
  if (cached) return cached;

  const path = `/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}?language=${language}`;
  const data = await fetchTMDB(path);
  if (data) cacheSet(metaCache, ck, data, MAX_CACHE);
  return data;
}

async function getMetaMultiLang(tmdbId, mediaType) {
  const [enData, esData] = await Promise.all([
    getMeta(tmdbId, mediaType, 'en'),
    getMeta(tmdbId, mediaType, 'es')
  ]);
  return { en: enData, es: esData };
}

async function getAltTitles(tmdbId, mediaType) {
  const ck = `alt:${mediaType}:${tmdbId}`;
  const cached = cacheGet(altTitleCache, ck, ALT_TTL);
  if (cached) return cached;

  const path = `/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}/alternative_titles`;
  const data = await fetchTMDB(path);
  if (!data) return [];

  const titles = [];
  if (data.titles) {
    for (const t of data.titles) {
      if (t.title && t.title.length > 1) titles.push(t.title);
    }
  }
  if (data.results) {
    for (const t of data.results) {
      if (t.title && t.title.length > 1) titles.push(t.title);
    }
  }

  const unique = [...new Set(titles)];
  cacheSet(altTitleCache, ck, unique, MAX_CACHE);
  return unique;
}

async function searchTMDB(query, mediaType, language = 'en') {
  const path = `/search/${mediaType === 'tv' ? 'tv' : 'movie'}?query=${encodeURIComponent(query)}&language=${language}`;
  return await fetchTMDB(path);
}

async function findByIMDB(imdbId) {
  const path = `/find/${imdbId}?external_source=imdb_id`;
  return await fetchTMDB(path);
}

async function getEpisodes(tmdbId, seasonNumber) {
  const path = `/tv/${tmdbId}/season/${seasonNumber}?language=en`;
  return await fetchTMDB(path);
}

function extractYear(data) {
  if (!data) return null;
  const date = data.release_date || data.first_air_date || '';
  const year = parseInt(date.substring(0, 4));
  return year || null;
}

function extractIMDB(data) {
  return data?.imdb_id || data?.external_ids?.imdb_id || null;
}

function isJapaneseAnime(data) {
  if (!data) return false;
  const hasGenre16 = (data.genres || []).some(g => g.id === 16) ||
    (data.genre_ids || []).includes(16);
  const isJP = (data.origin_country || []).includes('JP') ||
    (data.production_countries || []).some(c => c.iso_3166_1 === 'JP') ||
    data.original_language === 'ja';
  return hasGenre16 && isJP;
}

module.exports = {
  getMeta, getMetaMultiLang, getAltTitles,
  searchTMDB, findByIMDB, getEpisodes,
  extractYear, extractIMDB, isJapaneseAnime,
  fetchTMDB,
};
