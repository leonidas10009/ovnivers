const { verifySE, isEpisodeTitle, isPack, scoreEpisodeMatch } = require('./detector');
const tmdb = require('../media/tmdb');

async function resolveSeriesMeta(rawId) {
  let tmdbId = rawId;
  if (rawId.startsWith('tt')) {
    const data = await tmdb.findByIMDB(rawId);
    if (data) {
      const result = data.tv_results?.[0];
      if (result) tmdbId = String(result.id);
    }
  }
  if (!tmdbId.match(/^\d+$/)) return null;

  const meta = await tmdb.getMeta(tmdbId, 'tv', 'en');
  if (!meta) return null;

  return {
    tmdbId: String(meta.id),
    title: meta.name || meta.original_name || '',
    year: tmdb.extractYear(meta),
    imdbId: tmdb.extractIMDB(meta),
    seasons: (meta.seasons || []).length,
    genres: (meta.genres || []).map(g => g.id),
    isAnime: tmdb.isJapaneseAnime(meta),
  };
}

async function getSearchTitle(rawId) {
  const meta = await resolveSeriesMeta(rawId);
  if (!meta) return null;
  return {
    title: meta.title,
    year: meta.year,
    imdbId: meta.imdbId,
  };
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

module.exports = {
  resolveSeriesMeta,
  getSearchTitle,
  filterEpisodeStreams,
  verifySE,
  isEpisodeTitle,
  isPack,
  scoreEpisodeMatch,
};
