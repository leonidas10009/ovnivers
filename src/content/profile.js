const tmdb = require('../media/tmdb');
const amatsu = require('../anime/amatsu');
const { resolveAnimeId, getAnimeTMDbId } = require('../anime/resolver');
const animeTitles = require('../anime/titles');

const profileCache = new Map();
const MAX_CACHE = 500;
const CACHE_TTL = 60 * 60 * 1000;

function cacheGet(key) {
  const entry = profileCache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.value;
  if (entry) profileCache.delete(key);
  return undefined;
}

function cacheSet(key, value) {
  if (profileCache.size >= MAX_CACHE) {
    const first = profileCache.keys().next().value;
    profileCache.delete(first);
  }
  profileCache.set(key, { value, time: Date.now() });
}

function normalizeMeta(data, mediaType) {
  if (!data) return null;
  return {
    id: String(data.id),
    title: data.title || data.name || data.original_title || data.original_name || '',
    overview: (data.overview || '').substring(0, 2000),
    poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
    background: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
    year: tmdb.extractYear(data),
    releaseDate: data.release_date || data.first_air_date || '',
    imdbId: tmdb.extractIMDB(data),
    imdbRating: data.vote_average ? String(Math.round(data.vote_average * 10) / 10) : null,
    voteCount: data.vote_count || 0,
    runtime: data.runtime ? `${data.runtime} min` : null,
    genres: (data.genres || []).map(g => ({ id: g.id, name: g.name })),
    genreIds: (data.genres || []).map(g => g.id),
    originCountry: data.origin_country || [],
    originalLanguage: data.original_language || '',
    status: data.status || '',
    mediaType,
  };
}

function normalizeAnimeMeta(data, sourceId) {
  if (!data) return null;
  const isAmatsu = sourceId && sourceId.startsWith('anilist:');
  return {
    id: isAmatsu ? `anilist:${data.anilistId?.replace('anilist:', '') || ''}` : (sourceId || ''),
    title: data.name || data.englishName || '',
    overview: (data.description || '').substring(0, 2000),
    poster: data.poster || null,
    background: data.background || null,
    year: data.year ? parseInt(data.year) : null,
    releaseDate: data.year || '',
    imdbId: null,
    imdbRating: data.score || null,
    voteCount: 0,
    runtime: null,
    genres: [],
    genreIds: [],
    originCountry: ['JP'],
    originalLanguage: 'ja',
    status: data.status || '',
    mediaType: 'tv',
    synonyms: data.synonyms || [],
    format: data.format || '',
  };
}

async function resolveByTMDB(tmdbId, mediaType) {
  const ck = `tmdb:${mediaType}:${tmdbId}`;
  const cached = cacheGet(ck);
  if (cached) return cached;

  const raw = await tmdb.getMeta(tmdbId, mediaType, 'en');
  if (!raw) return null;

  let altTitles = [];
  try { altTitles = await tmdb.getAltTitles(tmdbId, mediaType); } catch {}

  let esData = null;
  try { esData = await tmdb.getMeta(tmdbId, mediaType, 'es'); } catch {}

  const profile = {
    ...normalizeMeta(raw, mediaType),
    altTitles,
    titleES: esData?.title || esData?.name || '',
    overviewES: (esData?.overview || '').substring(0, 2000),
    isAnime: tmdb.isJapaneseAnime(raw),
    seasons: undefined,
    videos: undefined,
  };

  if (profile.isAnime) {
    try {
      const titles = await animeTitles.fromTMDB(tmdbId, mediaType);
      if (titles) {
        profile.searchTitles = titles.searchTitles || [];
        profile.synonyms = titles.synonyms || [];
        profile.titleJA = titles.titleJA || '';
        profile.titleES = titles.titleES || '';
      }
    } catch {}
  } else {
    try {
      const altTitles = await tmdb.getAltTitles(tmdbId, mediaType);
      const esData = await tmdb.getMeta(tmdbId, mediaType, 'es');
      profile.searchTitles = [profile.title, ...(altTitles || [])].filter(t => t && t.length >= 3).slice(0, 10);
      profile.titleES = esData?.title || esData?.name || '';
      profile.synonyms = altTitles || [];
    } catch {}
  }

  if (mediaType === 'tv' && raw.seasons?.length) {
    profile.seasons = raw.seasons
      .filter(s => s.season_number > 0)
      .map(s => ({
        seasonNumber: s.season_number,
        episodeCount: s.episode_count || 0,
        name: s.name || '',
        overview: (s.overview || '').substring(0, 500),
        poster: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : null,
        airDate: s.air_date || '',
      }));
  }

  cacheSet(ck, profile);
  return profile;
}

async function resolveByAnimeId(animeId) {
  const ck = `anime:${animeId}`;
  const cached = cacheGet(ck);
  if (cached) return cached;

  const titlesResult = await animeTitles.resolveTitles(animeId);
  if (!titlesResult) return null;

  const profile = {
    id: animeId,
    title: titlesResult.titleEN || titlesResult.titleJA || animeId,
    overview: '',
    poster: titlesResult.poster || null,
    background: null,
    year: titlesResult.year ? parseInt(titlesResult.year) : null,
    releaseDate: titlesResult.year || '',
    imdbId: null,
    imdbRating: null,
    voteCount: 0,
    runtime: null,
    genres: [],
    genreIds: [],
    originCountry: ['JP'],
    originalLanguage: 'ja',
    status: '',
    mediaType: 'tv',
    isAnime: true,
    searchTitles: titlesResult.searchTitles || [],
    synonyms: titlesResult.synonyms || [],
    titleEN: titlesResult.titleEN || '',
    titleJA: titlesResult.titleJA || '',
    titleES: titlesResult.titleES || '',
    altName: titlesResult.altName || '',
    seasons: undefined,
    videos: undefined,
  };

  // Enhance with TMDB data when available
  const tmdbId = await getAnimeTMDbId(animeId);
  if (tmdbId) {
    try {
      const tmdbProfile = await resolveByTMDB(tmdbId, 'tv');
      if (tmdbProfile) {
        profile.overview = tmdbProfile.overview || profile.overview;
        profile.poster = tmdbProfile.poster || profile.poster;
        profile.background = tmdbProfile.background || profile.background;
        profile.year = tmdbProfile.year || profile.year;
        profile.imdbRating = tmdbProfile.imdbRating || profile.imdbRating;
        profile.genres = tmdbProfile.genres;
        profile.genreIds = tmdbProfile.genreIds;
        profile.seasons = tmdbProfile.seasons;
        profile.runtime = tmdbProfile.runtime;
        profile.status = tmdbProfile.status || profile.status;
        if (tmdbProfile.searchTitles?.length) {
          const existing = new Set(profile.searchTitles.map(t => t.toLowerCase()));
          for (const t of tmdbProfile.searchTitles) {
            if (!existing.has(t.toLowerCase())) {
              profile.searchTitles.push(t);
              existing.add(t.toLowerCase());
            }
          }
        }
        if (tmdbProfile.isAnime) profile.isAnime = true;
      }
    } catch {}
  }

  cacheSet(ck, profile);
  return profile;
}

async function resolveByIMDB(imdbId, fallbackMediaType = 'movie') {
  const data = await tmdb.findByIMDB(imdbId);
  if (!data) return null;

  const movieResult = data.movie_results?.[0];
  const tvResult = data.tv_results?.[0];

  if (movieResult && tvResult) {
    const movieProfile = await resolveByTMDB(String(movieResult.id), 'movie');
    const tvProfile = await resolveByTMDB(String(tvResult.id), 'tv');
    return fallbackMediaType === 'tv' ? (tvProfile || movieProfile) : (movieProfile || tvProfile);
  }
  if (movieResult) return await resolveByTMDB(String(movieResult.id), 'movie');
  if (tvResult) return await resolveByTMDB(String(tvResult.id), 'tv');
  return null;
}

async function resolveAny(rawId, mediaType, type) {
  if (!rawId) return null;

  if (type === 'anime' || rawId.startsWith('animeflv:') || rawId.startsWith('animeav1:') ||
      rawId.startsWith('henaojara:') || rawId.startsWith('tioanime:') ||
      rawId.startsWith('anilist:') || rawId.startsWith('kitsu:') ||
      rawId.startsWith('mal:') || rawId.startsWith('anidb:')) {
    return await resolveByAnimeId(rawId);
  }

  if (rawId.startsWith('tt')) {
    return await resolveByIMDB(rawId, mediaType);
  }

  if (rawId.match(/^\d+$/)) {
    return await resolveByTMDB(rawId, mediaType);
  }

  return null;
}

function buildStremioMeta(profile, id) {
  if (!profile) return null;
  return {
    id: id || profile.id,
    type: profile.mediaType === 'tv' ? 'series' : 'movie',
    name: profile.title,
    poster: profile.poster,
    background: profile.background,
    description: profile.overviewES || profile.overview || '',
    releaseInfo: profile.year ? String(profile.year) : (profile.releaseDate || ''),
    runtime: profile.runtime,
    imdbRating: profile.imdbRating,
    genres: profile.genres.map(g => g.name),
    videos: profile.videos,
  };
}

function buildCatalogMeta(item, type, id) {
  return {
    id: id || `ovn:${item.id}`,
    type,
    name: item.title || 'Unknown',
    poster: item.poster,
    background: item.background,
    description: (item.overview || '').substring(0, 500),
    releaseInfo: item.year ? String(item.year) : '',
    imdbRating: item.imdbRating,
    genres: item.genres.map(g => g.name),
  };
}

module.exports = {
  resolveByTMDB,
  resolveByAnimeId,
  resolveByIMDB,
  resolveAny,
  buildStremioMeta,
  buildCatalogMeta,
  normalizeMeta,
  normalizeAnimeMeta,
};
