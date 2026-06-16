const { verifyYear, isMovieTitle, scoreMovieMatch } = require('./detector');
const tmdb = require('../media/tmdb');
const { extractQuality } = require('../media/quality');
const { detectLanguages } = require('../media/language');

async function resolveMovieMeta(rawId) {
  let tmdbId = rawId;
  if (rawId.startsWith('tt')) {
    const data = await tmdb.findByIMDB(rawId);
    if (data) {
      const result = data.movie_results?.[0];
      if (result) tmdbId = String(result.id);
    }
  }
  if (!tmdbId.match(/^\d+$/)) return null;

  const meta = await tmdb.getMeta(tmdbId, 'movie', 'en');
  if (!meta) return null;

  return {
    tmdbId: String(meta.id),
    title: meta.title || meta.original_title || '',
    year: tmdb.extractYear(meta),
    imdbId: tmdb.extractIMDB(meta),
    genres: (meta.genres || []).map(g => g.id),
    isAnime: tmdb.isJapaneseAnime(meta),
  };
}

async function getSearchTitle(rawId) {
  const meta = await resolveMovieMeta(rawId);
  if (!meta) return null;
  return {
    title: meta.title,
    year: meta.year,
    imdbId: meta.imdbId,
  };
}

function filterMovieStreams(streams, expectedYear) {
  return streams.filter(s => {
    const title = s.title || s.name || '';
    if (!isMovieTitle(title)) return false;
    const check = verifyYear(title, expectedYear);
    return check.match;
  });
}

module.exports = {
  resolveMovieMeta,
  getSearchTitle,
  filterMovieStreams,
  verifyYear,
  isMovieTitle,
  scoreMovieMatch,
};
