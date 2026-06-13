const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const catCache = new Map();
const genreCache = { map: {}, loaded: false };
const MAX_CACHE = 300;
const CACHE_TTL = 30 * 60 * 1000;

const CATEGORIES = [
  // ── Movies ──
  { id: 'tmdb-popular-movie',  name: 'Películas Populares',        type: 'movie', tmdb: '/movie/popular?language=es&page={page}' },
  { id: 'tmdb-top-movie',      name: 'Películas Mejor Valoradas',   type: 'movie', tmdb: '/movie/top_rated?language=es&page={page}' },
  { id: 'tmdb-trending-movie', name: 'Películas en Tendencia',      type: 'movie', tmdb: '/trending/movie/week?language=es' },
  { id: 'tmdb-action-movie',   name: 'Acción',                      type: 'movie', tmdb: '/discover/movie?with_genres=28&language=es&sort_by=popularity.desc&page={page}' },
  { id: 'tmdb-comedy-movie',   name: 'Comedia',                     type: 'movie', tmdb: '/discover/movie?with_genres=35&language=es&sort_by=popularity.desc&page={page}' },
  { id: 'tmdb-drama-movie',    name: 'Drama',                       type: 'movie', tmdb: '/discover/movie?with_genres=18&language=es&sort_by=popularity.desc&page={page}' },
  { id: 'tmdb-horror-movie',   name: 'Terror',                      type: 'movie', tmdb: '/discover/movie?with_genres=27&language=es&sort_by=popularity.desc&page={page}' },
  { id: 'tmdb-scifi-movie',    name: 'Ciencia Ficción',             type: 'movie', tmdb: '/discover/movie?with_genres=878&language=es&sort_by=popularity.desc&page={page}' },
  { id: 'tmdb-thriller-movie', name: 'Suspenso',                    type: 'movie', tmdb: '/discover/movie?with_genres=53&language=es&sort_by=popularity.desc&page={page}' },
  { id: 'tmdb-romance-movie',  name: 'Romance',                     type: 'movie', tmdb: '/discover/movie?with_genres=10749&language=es&sort_by=popularity.desc&page={page}' },
  { id: 'tmdb-animation-movie',name: 'Animación',                   type: 'movie', tmdb: '/discover/movie?with_genres=16&language=es&sort_by=popularity.desc&page={page}' },

  // ── Series ──
  { id: 'tmdb-popular-series', name: 'Series Populares',            type: 'series', tmdb: '/tv/popular?language=es&page={page}' },
  { id: 'tmdb-top-series',     name: 'Series Mejor Valoradas',      type: 'series', tmdb: '/tv/top_rated?language=es&page={page}' },
  { id: 'tmdb-trending-series',name: 'Series en Tendencia',         type: 'series', tmdb: '/trending/tv/week?language=es' },

  // ── Anime (filtrado por país JP para excluir animación occidental) ──
  { id: 'tmdb-popular-anime',  name: 'Anime Popular',               type: 'series', tmdb: '/discover/tv?with_genres=16&with_origin_country=JP&language=es&sort_by=popularity.desc&vote_count.gte=50&page={page}' },
  { id: 'tmdb-top-anime',      name: 'Anime Mejor Valorado',        type: 'series', tmdb: '/discover/tv?with_genres=16&with_origin_country=JP&language=es&sort_by=vote_average.desc&vote_count.gte=200&page={page}' },
  { id: 'tmdb-trending-anime', name: 'Anime en Tendencia',          type: 'series', tmdb: '/discover/tv?with_genres=16&with_origin_country=JP&language=es&sort_by=popularity.desc&page={page}' },

  // ── Anime Movies ──
  { id: 'tmdb-popular-anime-movie', name: 'Películas Anime Populares', type: 'movie', tmdb: '/discover/movie?with_genres=16&with_origin_country=JP&language=es&sort_by=popularity.desc&vote_count.gte=20&page={page}' },
  { id: 'tmdb-top-anime-movie',     name: 'Películas Anime Mejor Valoradas', type: 'movie', tmdb: '/discover/movie?with_genres=16&with_origin_country=JP&language=es&sort_by=vote_average.desc&vote_count.gte=100&page={page}' },
];

async function loadGenres() {
  if (genreCache.loaded) return;
  try {
    const [movies, series] = await Promise.all([
      tmdbFetch('/genre/movie/list?language=es'),
      tmdbFetch('/genre/tv/list?language=es')
    ]);
    if (movies?.genres) for (const g of movies.genres) genreCache.map[g.id] = g.name;
    if (series?.genres) for (const g of series.genres) genreCache.map[g.id] = g.name;
    genreCache.loaded = true;
  } catch {}
}

function catDef(id) { return CATEGORIES.find(c => c.id === id); }

async function tmdbFetch(path) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `https://api.themoviedb.org/3${path}${sep}api_key=${TMDB_KEY}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
  finally { clearTimeout(timer); }
}

function itemGenres(item) {
  if (item.genres) return item.genres.map(g => g.name);
  if (item.genre_ids && genreCache.loaded) return item.genre_ids.map(id => genreCache.map[id]).filter(Boolean);
  return [];
}

function toMetaItem(item, type) {
  return {
    id: `tmdb:${item.id}`,
    type,
    name: item.title || item.name || 'Unknown',
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
    background: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
    description: (item.overview || '').substring(0, 500),
    releaseInfo: (item.release_date || item.first_air_date || '').substring(0, 4),
    imdbRating: item.vote_average ? String(Math.round(item.vote_average * 10) / 10) : null,
    genres: itemGenres(item),
  };
}

async function getCatalog(catalogId, page = 1) {
  const cat = catDef(catalogId);
  if (!cat) return { metas: [] };

  const ck = `cat:${catalogId}:${page}`;
  const cached = catCache.get(ck);
  if (cached && Date.now() - cached.time < CACHE_TTL) return { metas: cached.data };

  await loadGenres();
  const path = cat.tmdb.replace('{page}', page);
  const data = await tmdbFetch(path);
  if (!data?.results?.length) return { metas: [] };

  const metas = data.results.map(r => toMetaItem(r, cat.type));
  catCache.set(ck, { data: metas, time: Date.now() });
  if (catCache.size > MAX_CACHE) {
    const first = catCache.keys().next().value;
    catCache.delete(first);
  }
  return { metas };
}

async function searchCatalog(query, page = 1) {
  const q = encodeURIComponent(query);
  const data = await tmdbFetch(`/search/multi?query=${q}&language=es&page=${page}`);
  if (!data?.results?.length) return { metas: [] };

  await loadGenres();
  const metas = data.results
    .filter(r => r.media_type === 'movie' || r.media_type === 'tv')
    .map(r => toMetaItem(r, r.media_type === 'movie' ? 'movie' : 'series'));

  return { metas };
}

async function getFilmaffinityMeta(imdbId) {
  try {
    const url = `https://www.filmaffinity.com/es/search.php?stext=${imdbId}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      signal: ctrl.signal
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();
    const cheerio = require('cheerio-without-node-native') || require('cheerio');
    const $ = cheerio.load(html);
    const first = $('.se-last a, .movie-poster-list a').first();
    const faUrl = first.attr('href');
    if (!faUrl) return null;
    const faId = faUrl.match(/film(\d+)\.html/)?.[1];
    if (!faId) return null;
    const detailUrl = `https://www.filmaffinity.com/es/film${faId}.html`;
    const dRes = await fetch(detailUrl, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      signal: AbortSignal.timeout(6000)
    });
    if (!dRes.ok) return null;
    const dHtml = await dRes.text();
    const $$ = cheerio.load(dHtml);
    const title = $$('h1#main-title').text().trim() || $$('.movie-title').text().trim() || null;
    const year = $$('.movie-year').text().trim() || $$('[itemprop="datePublished"]').text().trim() || null;
    const rating = $$('.avg-rating').text().trim() || $$('[itemprop="ratingValue"]').text().trim() || null;
    const synopsis = $$('.movie-synopsis').text().trim() || $$('[itemprop="description"]').text().trim() || null;
    const genres = [];
    $$('.movie-genres a, [itemprop="genre"]').each((_, el) => {
      const g = $$(el).text().trim();
      if (g) genres.push(g);
    });
    const poster = $$('.movie-poster img').attr('src') || $$('[property="og:image"]').attr('content') || null;
    const bg = $$('[property="og:image"]').attr('content') || null;
    return { title, year, rating, synopsis, genres, poster, background: bg, faId, url: detailUrl };
  } catch { return null; }
}

module.exports = { CATEGORIES, catDef, getCatalog, searchCatalog, getFilmaffinityMeta };
