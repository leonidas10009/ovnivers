const { verifyYear, isMovieTitle, scoreMovieMatch } = require('./detector');
const tmdb = require('../media/tmdb');

async function resolveMovieMeta(rawId) {
  let tmdbId = rawId;
  if (rawId.startsWith('tt')) {
    const data = await tmdb.findByIMDB(rawId);
    if (data) {
      const result = data.movie_results?.[0];
      if (result) tmdbId = String(result.id);
    }
  }
  if (!tmdbId || !String(tmdbId).match(/^\d+$/)) return null;

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

async function resolveMovieTitles(rawId) {
  let tmdbId = rawId;
  let imdbId = null;

  // Resolve IMDB → TMDB
  if (String(rawId).startsWith('tt')) {
    const data = await tmdb.findByIMDB(rawId);
    if (data) {
      const result = data.movie_results?.[0];
      if (result) {
        tmdbId = String(result.id);
        imdbId = rawId;
      }
    }
  }

  if (!tmdbId || !String(tmdbId).match(/^\d+$/)) return null;

  // Metadata multi-idioma para mejor cobertura de búsqueda
  const [enMeta, esMeta] = await Promise.all([
    tmdb.getMeta(tmdbId, 'movie', 'en'),
    tmdb.getMeta(tmdbId, 'movie', 'es'),
  ]);
  if (!enMeta) return null;

  const titleEN = enMeta.title || enMeta.original_title || '';
  const titleES = esMeta?.title || '';
  const origTitle = enMeta.original_title || '';

  // Títulos de búsqueda únicos y no vacíos
  const searchTitles = [titleEN, titleES, origTitle]
    .filter(t => t && t.length >= 3)
    .filter((t, i, a) => a.indexOf(t) === i);

  return {
    searchTitle: titleEN,
    searchTitles,
    year: tmdb.extractYear(enMeta),
    imdbId: imdbId || tmdb.extractIMDB(enMeta),
    contentId: tmdbId,
    genres: (enMeta.genres || []).map(g => g.id),
    isAnime: tmdb.isJapaneseAnime(enMeta),
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
  resolveMovieTitles,
  getSearchTitle,
  filterMovieStreams,
  verifyYear,
  isMovieTitle,
  scoreMovieMatch,
};
