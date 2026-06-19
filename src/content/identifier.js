// Content type identifier — unified anime/movie/series detection
// Works at both the ID level (prefix-based) and metadata level (TMDB-based)

const tmdb = require('../media/tmdb');
const { ANIME_PREFIXES, ANIME_GENRE_ID, ANIME_ORIGIN_COUNTRY, isAnimeId, isAnimeSourceId, isAnimeXrefId } = require('../anime/types');

const detectCache = new Map();
const MAX_CACHE = 500;
const CACHE_TTL = 60 * 60 * 1000;

function cacheGet(key) {
  const entry = detectCache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.value;
  if (entry) detectCache.delete(key);
  return undefined;
}

function cacheSet(key, value) {
  if (detectCache.size >= MAX_CACHE) {
    const first = detectCache.keys().next().value;
    detectCache.delete(first);
  }
  detectCache.set(key, { value, time: Date.now() });
}

const CONTENT_ANIME = 'anime';
const CONTENT_MOVIE = 'movie';
const CONTENT_SERIES = 'series';

function classifyByPrefix(id) {
  if (isAnimeId(id)) return CONTENT_ANIME;
  if (id.startsWith('tt')) return CONTENT_MOVIE;
  return null;
}

function classifyByType(type) {
  if (type === 'anime') return CONTENT_ANIME;
  if (type === 'movie') return CONTENT_MOVIE;
  if (type === 'series' || type === 'tv') return CONTENT_SERIES;
  return null;
}

async function classifyByTMDB(tmdbId, mediaType) {
  const ck = `classify:${mediaType}:${tmdbId}`;
  const cached = cacheGet(ck);
  if (cached) return cached;

  const data = await tmdb.getMeta(tmdbId, mediaType, 'en');
  if (!data) {
    cacheSet(ck, null);
    return null;
  }

  const isAnime = tmdb.isJapaneseAnime(data);
  const isMovie = mediaType === 'movie' || !data.seasons;
  const result = {
    contentType: isAnime ? CONTENT_ANIME : (isMovie ? CONTENT_MOVIE : CONTENT_SERIES),
    isAnime,
    isMovie: !isAnime && isMovie,
    isSeries: !isAnime && !isMovie,
    title: data.title || data.name || data.original_title || data.original_name || '',
    year: tmdb.extractYear(data),
    genres: (data.genres || []).map(g => ({ id: g.id, name: g.name })),
    hasSeasons: !!data.seasons?.length,
    episodeCount: data.number_of_episodes || 0,
    seasonCount: data.number_of_seasons || 0,
    originCountry: data.origin_country || [],
    originalLanguage: data.original_language || '',
  };

  cacheSet(ck, result);
  return result;
}

async function classify(rawId, type, mediaType) {
  const byPrefix = classifyByPrefix(rawId);
  if (byPrefix === CONTENT_ANIME) {
    return {
      contentType: CONTENT_ANIME,
      isAnime: true,
      isMovie: false,
      isSeries: true,
      method: 'prefix',
      confidence: 1.0,
    };
  }

  const byType = classifyByType(type);
  if (byType === CONTENT_ANIME) {
    return {
      contentType: CONTENT_ANIME,
      isAnime: true,
      isMovie: false,
      isSeries: true,
      method: 'type',
      confidence: 0.9,
    };
  }

  const cleanId = rawId.replace(/^(ovn:|tmdb:|tt)/, '');
  if (!cleanId.match(/^\d+$/)) {
    return {
      contentType: byType || CONTENT_MOVIE,
      isAnime: false,
      isMovie: mediaType !== 'tv',
      isSeries: mediaType === 'tv',
      method: 'id-format',
      confidence: 0.5,
    };
  }

  const tmdbResult = await classifyByTMDB(cleanId, mediaType);
  if (tmdbResult) {
    return {
      contentType: tmdbResult.contentType,
      isAnime: tmdbResult.isAnime,
      isMovie: tmdbResult.isMovie,
      isSeries: tmdbResult.isSeries,
      method: 'tmdb',
      confidence: 0.95,
      title: tmdbResult.title,
      year: tmdbResult.year,
      genres: tmdbResult.genres,
      hasSeasons: tmdbResult.hasSeasons,
      episodeCount: tmdbResult.episodeCount,
      seasonCount: tmdbResult.seasonCount,
    };
  }

  return {
    contentType: byType || (mediaType === 'tv' ? CONTENT_SERIES : CONTENT_MOVIE),
    isAnime: false,
    isMovie: mediaType !== 'tv',
    isSeries: mediaType === 'tv',
    method: 'fallback',
    confidence: 0.3,
  };
}

function isAnimeIdPrefix(id) {
  return isAnimeId(id);
}

function isSeriesRequest(type) {
  return type === 'series' || type === 'tv' || type === 'anime';
}

function toStremioType(contentType) {
  if (contentType === CONTENT_ANIME) return 'series';
  if (contentType === CONTENT_SERIES) return 'series';
  if (contentType === CONTENT_MOVIE) return 'movie';
  return 'series';
}

module.exports = {
  classify,
  classifyByPrefix,
  classifyByType,
  classifyByTMDB,
  isAnimeIdPrefix,
  isSeriesRequest,
  toStremioType,
  CONTENT_ANIME,
  CONTENT_MOVIE,
  CONTENT_SERIES,
  isAnimeId,
  isAnimeSourceId,
  isAnimeXrefId,
  ANIME_PREFIXES,
  ANIME_GENRE_ID,
  ANIME_ORIGIN_COUNTRY,
};
