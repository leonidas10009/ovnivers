// sites.js - Verified working provider configs for local Hermes scrapers
// These sites respond with static HTML from residential IP

var SITES = [
  {
    id: 'animejara',
    name: 'AnimeJara',
    baseUrl: 'https://animejara.com',
    searchUrl: '/?s={query}',
    categories: ['anime'],
    lang: ['lat', 'cast', 'ja'],
    itemSelector: 'a.anime-card',
    titleSelector: '.card-title',
    linkSelector: '&',
    videoType: 'episodePage',
    videoContainer: '.episodio-reproductor',
    episodePattern: '/episode/'
  },
  {
    id: 'mirapeliculas',
    name: 'MiraPeliculas',
    baseUrl: 'https://ww2.dipelis.com',
    searchUrl: '/?s={query}',
    categories: ['movie'],
    lang: ['lat', 'cast'],
    itemSelector: 'article.movie-card',
    titleSelector: 'h3.movie-title-top, h3.movie-title-top a',
    linkSelector: 'a.movie-link',
    videoType: 'serverDiv',
    videoContainer: '.player-section'
  },
  {
    id: 'animejl',
    name: 'AnimeJL',
    baseUrl: 'https://www.anime-jl.net',
    searchUrl: '/?s={query}',
    categories: ['anime'],
    lang: ['lat', 'cast', 'ja'],
    itemSelector: 'article.Anime',
    titleSelector: 'h3.Title',
    linkSelector: 'a[href]',
    videoType: 'jsvar',
    videoContainer: 'body'
  },
  {
    id: 'hdfull',
    name: 'HDFull',
    baseUrl: 'https://hdfull.today',
    searchUrl: '/?s={query}',
    categories: ['movie', 'tvshow'],
    lang: ['lat', 'cast', 'vose'],
    itemSelector: 'article',
    titleSelector: 'h2, h3',
    linkSelector: 'a[href]',
    videoType: 'iframe',
    videoContainer: '.entry-content'
  },
  {
    id: 'pelisforte',
    name: 'PelisForte',
    baseUrl: 'https://www1.pelisforte.se',
    searchUrl: '/?s={query}',
    categories: ['movie'],
    lang: ['lat', 'cast'],
    itemSelector: 'article',
    titleSelector: 'h2, h3',
    linkSelector: 'a[href]',
    videoType: 'iframe',
    videoContainer: '.entry-content'
  },
  {
    id: 'zoowomaniacos',
    name: 'Zoowomaniacos',
    baseUrl: 'https://zoowomaniacos.org',
    searchUrl: '/?s={query}',
    categories: ['movie'],
    lang: ['lat', 'cast', 'vose'],
    itemSelector: 'article',
    titleSelector: 'h2',
    linkSelector: 'a[href]',
    videoType: 'iframe',
    videoContainer: '.entry-content'
  },
  {
    id: 'estrenosdoramas',
    name: 'EstrenosDoramas',
    baseUrl: 'https://estrenosdoramas.net',
    searchUrl: '/?s={query}',
    categories: ['tvshow'],
    lang: ['lat', 'cast', 'vose'],
    itemSelector: 'article',
    titleSelector: 'h2',
    linkSelector: 'a[href]',
    videoType: 'iframe',
    videoContainer: '.entry-content'
  }
];

var seen = {};
var DEDUPED = [];
for (var i = 0; i < SITES.length; i++) {
  if (!seen[SITES[i].id]) { seen[SITES[i].id] = true; DEDUPED.push(SITES[i]); }
}

module.exports = { SITES: DEDUPED };
