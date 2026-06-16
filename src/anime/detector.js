const { ANIME_PREFIXES, ANIME_GENRE_ID, ANIME_ORIGIN_COUNTRY, isAnimeId } = require('./types');

const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const detectionCache = new Map();
const MAX_CACHE = 500;
const CACHE_TTL = 60 * 60 * 1000;

function cacheGet(key) {
  const entry = detectionCache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.value;
  if (entry) detectionCache.delete(key);
  return undefined;
}

function cacheSet(key, value) {
  if (detectionCache.size >= MAX_CACHE) {
    const first = detectionCache.keys().next().value;
    detectionCache.delete(first);
  }
  detectionCache.set(key, { value, time: Date.now() });
}

async function fetchTMDB(path, timeout = 5000) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    const res = await fetch(`https://api.themoviedb.org/3${path}?api_key=${TMDB_KEY}&language=en`, {
      headers: { 'User-Agent': UA },
      signal: ctrl.signal
    });
    clearTimeout(timer);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function detectAnime(id, type, mediaType, config) {
  if (!config || !config.enableAnime) return { isAnime: false, confidence: 0, method: 'disabled' };

  if (isAnimeId(id)) {
    return { isAnime: true, confidence: 1.0, method: 'prefix' };
  }

  if (type === 'anime') {
    return { isAnime: true, confidence: 0.9, method: 'type' };
  }

  if (mediaType !== 'tv') {
    return { isAnime: false, confidence: 0, method: 'not-tv' };
  }

  const rawId = id.replace(/^(ovn:|tmdb:|tt)/, '');
  if (!rawId.match(/^\d+$/)) {
    return { isAnime: false, confidence: 0, method: 'non-numeric' };
  }

  const cacheKey = `detect:${rawId}`;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  const tmdb = await fetchTMDB(`/tv/${rawId}`);
  if (!tmdb) {
    const result = { isAnime: false, confidence: 0, method: 'tmdb-failed' };
    cacheSet(cacheKey, result);
    return result;
  }

  const hasGenre16 = !!tmdb.genres?.some(g => g.id === ANIME_GENRE_ID);
  const isJapanese = (tmdb.origin_country || []).includes(ANIME_ORIGIN_COUNTRY) ||
    (tmdb.production_countries || []).some(c => c.iso_3166_1 === ANIME_ORIGIN_COUNTRY) ||
    (tmdb.original_language === 'ja');

  if (hasGenre16 && isJapanese) {
    const result = { isAnime: true, confidence: 0.95, method: 'tmdb-genre16+jp' };
    cacheSet(cacheKey, result);
    return result;
  }

  if (hasGenre16 && !isJapanese) {
    const result = { isAnime: false, confidence: 0.3, method: 'tmdb-genre16-only' };
    cacheSet(cacheKey, result);
    return result;
  }

  const result = { isAnime: false, confidence: 0, method: 'tmdb-no-match' };
  cacheSet(cacheKey, result);
  return result;
}

module.exports = { detectAnime };
