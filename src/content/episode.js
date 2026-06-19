// Centralized episode management
// Handles fetching, caching, and parsing episode data from TMDB

const tmdb = require('../media/tmdb');

const episodeCache = new Map();
const seasonListCache = new Map();
const MAX_CACHE = 300;
const CACHE_TTL = 60 * 60 * 1000;

function cacheGet(map, key, ttl = CACHE_TTL) {
  const entry = map.get(key);
  if (entry && Date.now() - entry.time < ttl) return entry.value;
  if (entry) map.delete(key);
  return undefined;
}

function cacheSet(map, key, value, max = MAX_CACHE) {
  if (map.size >= max) {
    const first = map.keys().next().value;
    map.delete(first);
  }
  map.set(key, { value, time: Date.now() });
}

const ANIME_PREFIXES = ['animeflv:', 'anilist:', 'mal:', 'kitsu:', 'anidb:', 'simkl:', 'animeplanet:', 'livechart:', 'animenewsnetwork:', 'anisearch:', 'thetvdb:', 'myanimelist:'];

function parseEpisodeId(id) {
  let contentId = id;
  let season = 1;
  let episode = 1;
  let animePrefix = null;

  // Standard prefijos tmdb:/ovn: (ovn:tmdbId:season:episode)
  if (id.startsWith('tmdb:') || id.startsWith('ovn:')) {
    const parts = id.split(':');
    contentId = parts[1] || id.replace(/^(tmdb:|ovn:)/, '');
    if (parts.length >= 4) {
      season = parseInt(parts[2]) || 1;
      episode = parseInt(parts[3]) || 1;
    }
    return { contentId, season, episode };
  }

  // IMDB con S/E (tt1234567:season:episode)
  const ttMatch = id.match(/^(tt\d+):(\d+):(\d+)$/);
  if (ttMatch) {
    return {
      contentId: ttMatch[1],
      season: parseInt(ttMatch[2]) || 1,
      episode: parseInt(ttMatch[3]) || 1,
    };
  }

  // Anime prefix IDs (animeflv:naruto, animeflv:naruto:1:1, anilist:123, ...)
  for (const prefix of ANIME_PREFIXES) {
    if (id.startsWith(prefix)) {
      animePrefix = prefix;
      const rest = id.slice(prefix.length);
      const parts = rest.split(':');
      contentId = parts[0];
      if (parts.length >= 3) {
        season = parseInt(parts[1]) || 1;
        episode = parseInt(parts[2]) || 1;
      }
      break;
    }
  }

  return { contentId, season, episode, animePrefix };
}

function extractSE(title) {
  if (!title) return null;
  const m = title.match(/[Ss](\d{1,2})\s*[Ee](\d{1,2})/);
  if (!m) return null;
  return { season: parseInt(m[1]), episode: parseInt(m[2]) };
}

function verifySE(title, expectedSeason, expectedEpisode) {
  if (expectedSeason === undefined || expectedEpisode === undefined) {
    return { match: true, score: 0, found: null };
  }
  const se = extractSE(title);
  if (!se) return { match: true, score: 0, found: null };
  if (se.season === expectedSeason && se.episode === expectedEpisode) {
    return { match: true, score: 0.12, found: se };
  }
  if (se.season === expectedSeason) {
    return { match: true, score: 0.03, found: se };
  }
  return { match: false, score: -0.30, found: se };
}

function isEpisodeTitle(title) {
  if (!title) return false;
  return /[Ss]\d{1,2}\s*[Ee]\d{1,2}/i.test(title);
}

function isPack(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  return /\b(complete|season\s*\d+\s*(complete|full|pack)|s\d{1,2}\s*(complete|full|pack)|all\s*episodes|full\s*season|complete\s*series)\b/i.test(t);
}

function isMovieTitle(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  if (/s\d{1,2}\s*e\d{1,2}/i.test(t)) return false;
  if (/\b(season|episode|complete series|s\d{2})\b/i.test(t)) return false;
  return true;
}

async function getSeasons(tmdbId) {
  const ck = `seasons:${tmdbId}`;
  const cached = cacheGet(seasonListCache, ck);
  if (cached) return cached;

  const meta = await tmdb.getMeta(tmdbId, 'tv', 'en');
  if (!meta?.seasons) return [];

  const seasons = meta.seasons
    .filter(s => s.season_number > 0)
    .map(s => ({
      seasonNumber: s.season_number,
      episodeCount: s.episode_count || 0,
      name: s.name || `Season ${s.season_number}`,
      overview: (s.overview || '').substring(0, 500),
      poster: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : null,
      airDate: s.air_date || '',
    }));

  cacheSet(seasonListCache, ck, seasons);
  return seasons;
}

async function getSeasonEpisodes(tmdbId, seasonNumber) {
  const ck = `episodes:${tmdbId}:${seasonNumber}`;
  const cached = cacheGet(episodeCache, ck);
  if (cached) return cached;

  const data = await tmdb.getEpisodes(tmdbId, seasonNumber);
  if (!data?.episodes) return [];

  const episodes = data.episodes
    .filter(ep => ep.episode_number > 0)
    .map(ep => ({
      id: `ovn:${tmdbId}:${seasonNumber}:${ep.episode_number}`,
      title: ep.name || `Episodio ${ep.episode_number}`,
      season: ep.season_number,
      episode: ep.episode_number,
      overview: (ep.overview || '').substring(0, 500),
      aired: ep.air_date || '',
      thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null,
      runtime: ep.runtime || null,
      voteAverage: ep.vote_average || null,
    }));

  cacheSet(episodeCache, ck, episodes);
  return episodes;
}

async function getAllEpisodes(tmdbId, maxSeasons = 10) {
  const seasons = await getSeasons(tmdbId);
  const seasonNumbers = seasons
    .slice(0, maxSeasons)
    .map(s => s.seasonNumber);

  const results = await Promise.allSettled(
    seasonNumbers.map(sn => getSeasonEpisodes(tmdbId, sn))
  );

  const allEpisodes = [];
  for (const r of results) {
    if (r.status === 'fulfilled') allEpisodes.push(...r.value);
  }
  return allEpisodes;
}

async function findEpisode(tmdbId, season, episode) {
  const episodes = await getSeasonEpisodes(tmdbId, season);
  return episodes.find(ep => ep.episode === episode) || null;
}

function buildStremioVideos(episodes) {
  return episodes.map(ep => ({
    id: ep.id,
    title: ep.title,
    season: ep.season,
    episode: ep.episode,
    released: ep.aired,
    thumbnail: ep.thumbnail,
    overview: ep.overview,
  }));
}

function filterEpisodeStreams(streams, season, episode) {
  return streams.filter(s => {
    const title = s.title || s.name || '';
    if (isPack(title)) return false;
    if (season !== undefined && episode !== undefined) {
      const check = verifySE(title, season, episode);
      if (!check.match) return false;
    }
    return true;
  });
}

function scoreEpisodeMatch(torrent, expectedSeason, expectedEpisode) {
  let score = 0;
  const title = (torrent.title || torrent.name || '');
  const seCheck = verifySE(title, expectedSeason, expectedEpisode);
  score += seCheck.score;

  if (torrent.quality === '4K') score += 0.05;
  else if (torrent.quality === '1080p') score += 0.03;

  if (torrent.source === 'BluRay' || torrent.source === 'Remux') score += 0.02;
  if (torrent.codec === 'HEVC' || torrent.codec === 'AV1') score += 0.01;
  if (torrent.verified) score += 0.03;

  return score;
}

module.exports = {
  parseEpisodeId,
  extractSE,
  verifySE,
  isEpisodeTitle,
  isPack,
  isMovieTitle,
  getSeasons,
  getSeasonEpisodes,
  getAllEpisodes,
  findEpisode,
  buildStremioVideos,
  filterEpisodeStreams,
  scoreEpisodeMatch,
};
