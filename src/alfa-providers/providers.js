module.exports = [
  // ═══════════════════════════════════════════
  // MOVIES (Peliculas) — 42 active providers
  // ═══════════════════════════════════════════

  {
    name: 'allcalidad', title: 'AllCalidad', baseUrl: 'https://allcalidad.re',
    categories: ['movie', 'direct'], language: ['lat'], active: true, adult: false,
    search: { url: '/search?s={query}', itemSelector: 'article.movie-item', titleSelector: 'h3.title', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.players', iframeSelector: 'iframe', srcAttr: 'data-src', defaultQuality: 'HD' }
  },
  {
    name: 'allpeliculas', title: 'AllPeliculas', baseUrl: 'https://allpeliculas.se',
    categories: ['movie', 'vos'], language: ['lat'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'ul.cc-list > article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.players', iframeSelector: 'iframe', srcAttr: 'data-src', defaultQuality: 'HD' }
  },
  {
    name: 'asialiveaction', title: 'AsiaLiveAction', baseUrl: 'https://asialiveaction.com',
    categories: ['movie', 'tvshow', 'vos'], language: ['cast', 'lat'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2.entry-title', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'bloghorror', title: 'BlogHorror', baseUrl: 'https://bloghorror.com',
    categories: ['movie', 'vos', 'torrent'], language: ['*'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article.post', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'torrent', linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: 'HD' }
  },
  {
    name: 'cine24h', title: 'Cine24H', baseUrl: 'https://cine24h.online',
    categories: ['movie'], language: ['lat', 'cast', 'vose'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'cinecalidad', title: 'CineCalidad', baseUrl: 'https://www.cinecalidad.vg',
    categories: ['movie', 'direct', 'torrent'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article.movie', titleSelector: 'h3', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.players', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'cinelibreonline', title: 'CineLibreOnline', baseUrl: 'https://www.cinelibreonline.com',
    categories: ['movie', 'direct'], language: ['lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'cinemundo', title: 'StreamGratis', baseUrl: 'https://ww3.cinemundo.online',
    categories: ['movie'], language: ['cast', 'lat', 'vose'], active: false, adult: false,
    search: { url: '/search/{query}', itemSelector: '.movie-card', titleSelector: '.title', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.player-container', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'cuevana2espanol', title: 'Cuevana2Espanol', baseUrl: 'https://www.cuevana2espanol.net',
    categories: ['movie'], language: ['lat', 'cast'], active: false, adult: false,
    search: { url: '/search?q={query}', itemSelector: 'a[href*="/pelicula/"]', titleSelector: 'h2, .title', linkSelector: '&' },
    videos: { type: 'nextjs', dataPath: 'props.pageProps.post.players', defaultQuality: 'HD' }
  },
  {
    name: 'detodopeliculas', title: 'DeTodoPeliculas', baseUrl: 'https://detodopeliculas.nu',
    categories: ['movie'], language: ['lat', 'cast', 'vose'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'divxtotal', title: 'DivXTotal', baseUrl: 'https://divxtotal.foo',
    categories: ['movie', 'tvshow', 'torrent'], language: ['cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'torrent', linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: 'HD' }
  },
  {
    name: 'dontorrent', title: 'DonTorrent', baseUrl: 'https://dontorrent.support',
    categories: ['movie', 'tvshow', 'vos', 'torrent'], language: ['cast'], active: true, adult: false,
    search: { url: '/buscar/{query}', itemSelector: '.movie-card, article', titleSelector: 'h2, h3', linkSelector: 'a' },
    videos: { type: 'torrent', linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: 'HD' }
  },
  {
    name: 'doramasflix', title: 'DoramasFlix', baseUrl: 'https://doramasflix.co',
    categories: ['movie', 'tvshow'], language: ['cast', 'lat', 'vose'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'doramedplay', title: 'DoramedPlay', baseUrl: 'https://doramedplay.net',
    categories: ['movie', 'tvshow'], language: ['lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'entrepeliculasyseries', title: 'EntrePeliculasYSeries', baseUrl: 'https://entrepeliculasyseries.nz',
    categories: ['movie', 'tvshow', 'vos'], language: ['lat', 'cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'estrenoscinesaa', title: 'EstrenosCinesaa', baseUrl: 'https://www.estrenoscinesaa.com',
    categories: ['movie', 'tvshow'], language: ['cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'flizzmovies', title: 'FlizzMovies', baseUrl: 'https://flizzmovies.com',
    categories: ['movie'], language: ['cast', 'lat', 'vose'], active: false, adult: false,
    search: { url: '/search/{query}', itemSelector: '.movie-card', titleSelector: '.title', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.player', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'genteclic', title: 'GenteClic', baseUrl: 'https://www.genteclic.com',
    categories: ['movie', 'direct'], language: ['lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'gnula', title: 'Gnula', baseUrl: 'https://gnulahd.nu',
    categories: ['movie', 'vos'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'grantorrent', title: 'GranTorrent', baseUrl: 'https://grantorrent.zip',
    categories: ['movie', 'tvshow', 'vos', 'torrent'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'torrent', linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: 'HD' }
  },
  {
    name: 'hdfull', title: 'HDFull', baseUrl: 'https://hdfull.today',
    categories: ['movie', 'tvshow', 'vos'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    episodes: { type: 'post', url: null, seasonParam: 'season', episodeParam: 'episode', extraParams: { action: 'season', show: null }, episodeSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.player-container', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'homecine', title: 'HomeCine', baseUrl: 'https://www3.homecine.to',
    categories: ['movie', 'tvshow', 'direct'], language: ['lat', 'cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'legalmentegratis', title: 'LegalmenteGratis', baseUrl: 'https://legalmentegratis.com',
    categories: ['movie', 'vos'], language: ['cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'mirapeliculas', title: 'MiraPeliculas', baseUrl: 'https://ww2.dipelis.com',
    categories: ['movie'], language: ['lat', 'cast', 'vose'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'mitorrent', title: 'MiTorrent', baseUrl: 'https://mitorrent.mx',
    categories: ['movie', 'tvshow', 'torrent'], language: ['lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'torrent', linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: 'HD' }
  },
  {
    name: 'osjonosu', title: 'OsjoNosu', baseUrl: 'https://osjonosu.xyz',
    categories: ['movie', 'tvshow'], language: ['cast'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'pelicinehd', title: 'PeliCineHD', baseUrl: 'https://pelicinehd.com',
    categories: ['movie'], language: ['lat', 'cast', 'vose'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'peliculasflix', title: 'PeliculasFlix', baseUrl: 'https://peliculasflix.co',
    categories: ['movie'], language: ['cast', 'lat', 'vose'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'pelis182', title: 'Pelis182', baseUrl: 'https://pelis182.com',
    categories: ['movie', 'tvshow'], language: ['lat'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'pelisflix', title: 'PelisFlix', baseUrl: 'https://pelisflix2.bond',
    categories: ['movie', 'vos'], language: ['lat', 'cast'], active: false, adult: false,
    search: { url: '/search/{query}', itemSelector: '.movie-card', titleSelector: '.title', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.player', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'pelisforte', title: 'PelisForte', baseUrl: 'https://www1.pelisforte.se',
    categories: ['movie'], language: ['lat', 'cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'pelispedia', title: 'PelisPedia', baseUrl: 'https://pelispedia.is',
    categories: ['movie', 'tvshow', 'vos'], language: ['lat', 'cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    episodes: { type: 'post', url: null, seasonParam: 'season', episodeParam: 'episode', extraParams: { action: 'action_select_season' }, episodeSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.players', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'poseidonhd', title: 'PoseidonHD', baseUrl: 'https://www.poseidonhd2.co',
    categories: ['movie', 'tvshow', 'vos', 'direct'], language: ['lat'], active: true, adult: false,
    search: { url: '/search?q={query}', itemSelector: 'a[href*="/pelicula/"], a[href*="/serie/"]', titleSelector: 'h2, .title', linkSelector: '&' },
    videos: { type: 'nextjs', dataPath: 'props.pageProps.post.players', defaultQuality: 'HD' }
  },
  {
    name: 'retrotv', title: 'RetroTV', baseUrl: 'https://retrotv.org',
    categories: ['movie', 'tvshow'], language: ['lat'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'serieskao', title: 'SeriesKao', baseUrl: 'https://serieskao.top',
    categories: ['movie', 'tvshow', 'vos'], language: ['lat', 'cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'tubeonline', title: 'TubeOnline', baseUrl: 'https://www.tubeonline.net',
    categories: ['movie', 'tvshow'], language: ['lat', 'cast', 'vose'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'tubepelis', title: 'TubePelis', baseUrl: 'https://www.tubepelis.com',
    categories: ['movie'], language: ['lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'wolfmax4k', title: 'WolfMax4K', baseUrl: 'https://wolfmax4k.com',
    categories: ['movie', 'tvshow', 'torrent'], language: ['cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'torrent', linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: '4K' }
  },
  {
    name: 'yandispoiler', title: 'Yandispoiler', baseUrl: 'https://yandispoiler.net',
    categories: ['movie', 'tvshow'], language: ['lat', 'cast', 'vose'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'zonaleros', title: 'ZonaLeros', baseUrl: 'https://www.zona-leros.com',
    categories: ['movie', 'tvshow'], language: ['lat'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'zoowomaniacos', title: 'Zoowomaniacos', baseUrl: 'https://zoowomaniacos.org',
    categories: ['movie', 'vos'], language: ['lat', 'cast'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },

  // ═══════════════════════════════════════════
  // TV SHOWS (Series) — 26 active providers
  // ═══════════════════════════════════════════

  {
    name: 'doramasyt', title: 'DoramasYT', baseUrl: 'https://www.doramasyt.com',
    categories: ['tvshow', 'vos'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    episodes: { type: 'season-list', seasonSelector: '.season-list a', episodeSelector: '.episode-list a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'eztv', title: 'EZTV', baseUrl: 'https://eztvx.to',
    categories: ['tvshow', 'vos', 'torrent'], language: ['*'], active: true, adult: false,
    search: { url: '/search/{query}', itemSelector: 'tr.forum_header_border', titleSelector: 'a.epinfo', linkSelector: 'a.magnet, a[href*=".torrent"]' },
    videos: { type: 'torrent', linkSelector: 'a.magnet, a[href*=".torrent"]', defaultQuality: 'HD' }
  },
  {
    name: 'fullseriehd', title: 'FullSerieHD', baseUrl: 'https://seriesmega.org',
    categories: ['tvshow', 'vos'], language: ['cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    episodes: { type: 'season-list', seasonSelector: '.season-list a', episodeSelector: '.episode-list a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'lacartoons', title: 'LaCartoons', baseUrl: 'https://www.lacartoons.com',
    categories: ['tvshow'], language: ['lat'], active: true, adult: false,
    search: { url: '/search/{query}', itemSelector: '.serie-item', titleSelector: '.title', linkSelector: 'a' },
    episodes: { type: 'season-list', seasonSelector: '.temporadas a', episodeSelector: '.episodios a' },
    videos: { type: 'iframe', containerSelector: '.player', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'seriesretro', title: 'SeriesRetro', baseUrl: 'https://seriesretro.com',
    categories: ['tvshow'], language: ['lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    episodes: { type: 'season-list', seasonSelector: '.season-list a', episodeSelector: '.episode-list a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },

  // ═══════════════════════════════════════════
  // ANIME — 10 active, 12 inactive
  // ═══════════════════════════════════════════

  {
    name: 'animeflv', title: 'AnimeFLV', baseUrl: 'https://www3.animeflv.net',
    categories: ['anime'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/browse?q={query}', itemSelector: 'ul.ListAnimes li', titleSelector: 'h3.Title', linkSelector: 'a' },
    videos: { type: 'jsvar', varPattern: /var videos = (\[.*?\]);/, defaultQuality: 'HD' }
  },
  {
    name: 'animejara', title: 'AnimeJara', baseUrl: 'https://animejara.net',
    categories: ['anime'], language: ['cast', 'lat', 'vose'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'jsvar', varPattern: /var videos = (\[.*?\]);/, defaultQuality: 'HD' }
  },
  {
    name: 'animejl', title: 'AnimeJL', baseUrl: 'https://www.anime-jl.net',
    categories: ['anime'], language: ['cast', 'lat', 'vose'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article.Anime', titleSelector: 'h3.Title', linkSelector: 'a' },
    videos: { type: 'jsvar', varPattern: /var videos = (\[.*?\]);/, defaultQuality: 'HD' }
  },
  {
    name: 'estrenosanime', title: 'EstrenosAnime', baseUrl: 'https://estrenosanime.net',
    categories: ['anime'], language: ['*'], active: true, adult: false,
    search: { url: '/search?keyword={query}', itemSelector: 'a.film-poster-ahref', titleSelector: '&', titleAttr: 'title', linkSelector: '&' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'hacktorrent', title: 'HackTorrent', baseUrl: 'https://hacktorrent.to',
    categories: ['anime', 'vos', 'torrent'], language: ['lat', 'cast'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'torrent', linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: 'HD' }
  },
  {
    name: 'henaojara', title: 'HenaoJara', baseUrl: 'https://henaojara.com',
    categories: ['anime'], language: ['cast', 'lat', 'vose'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article.TPost', titleSelector: 'h3', linkSelector: 'a' },
    videos: { type: 'jsvar', varPattern: /var videos = (\[.*?\]);/, defaultQuality: 'HD' }
  },
  {
    name: 'jkanime', title: 'JKAnime', baseUrl: 'https://jkanime.net',
    categories: ['anime'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/buscar/{query}', itemSelector: '.anime__item', titleSelector: 'h5 a', linkSelector: 'a' },
    episodes: { type: 'url', pattern: '/{slug}/{episode}/' },
    videos: { type: 'jslist', varPattern: /video\[\d+\] = '(.*?)';/g, defaultQuality: 'HD' }
  },
  {
    name: 'lamovie', title: 'LaMovie', baseUrl: 'https://la.movie',
    categories: ['anime'], language: ['lat', 'cast', 'vose'], active: false, adult: false,
    search: { url: '/search/{query}', itemSelector: '.movie-card', titleSelector: '.title', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.player', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'latanime', title: 'LatAnime', baseUrl: 'https://latanime.org',
    categories: ['anime'], language: ['cast', 'lat', 'vose'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'jsvar', varPattern: /var videos = (\[.*?\]);/, defaultQuality: 'HD' }
  },
  {
    name: 'mundodonghua', title: 'MundoDonghua', baseUrl: 'https://www.mundodonghua.com',
    categories: ['anime', 'vos'], language: ['*'], active: false, adult: false,
    search: { url: '/busquedas/?donghua={query}', itemSelector: '.md-card', titleSelector: '.md-card-title', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'pelispanda', title: 'PelisPanda', baseUrl: 'https://pelispanda.org',
    categories: ['anime', 'vos', 'torrent'], language: ['lat'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'torrent', linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: 'HD' }
  },
  {
    name: 'pelisplus', title: 'PelisPlus', baseUrl: 'https://ww3.pelisplus.to',
    categories: ['anime', 'documentary', 'direct'], language: ['lat'], active: false, adult: false,
    search: { url: '/search?q={query}', itemSelector: 'a[href*="/pelicula/"]', titleSelector: '.title', linkSelector: '&' },
    videos: { type: 'nextjs', dataPath: 'props.pageProps.post.players', defaultQuality: 'HD' }
  },
  {
    name: 'repelishd', title: 'RepelisHD', baseUrl: 'https://cinehdplus.gratis',
    categories: ['anime', 'vos'], language: ['lat', 'cast', 'vose'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'sololatino', title: 'SoloLatino', baseUrl: 'https://sololatino.net',
    categories: ['anime', 'vos'], language: ['lat'], active: true, adult: false,
    search: { url: '/buscar?q={query}', itemSelector: '.card', titleSelector: '.card__title', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'tioanime', title: 'TioAnime', baseUrl: 'https://tioanime.com',
    categories: ['anime', 'vos'], language: ['*'], active: true, adult: false,
    search: { url: '/directorio?q={query}', itemSelector: 'article.anime', titleSelector: 'h3.title', linkSelector: 'a' },
    videos: { type: 'jsvar', varPattern: /var episodes = (\[.*?\]);/, defaultQuality: 'HD' }
  },
  {
    name: 'tiodonghua', title: 'TioDonghua', baseUrl: 'https://tiodonghua.com',
    categories: ['anime', 'vos'], language: ['vose'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: '.title a', linkSelector: '.title a' },
    videos: { type: 'jsvar', varPattern: /var videos = (\[.*?\]);/, defaultQuality: 'HD' }
  },
  {
    name: 'tvanime', title: 'TVAnime', baseUrl: 'https://vww.monoschinos2.net',
    categories: ['anime', 'vos'], language: ['lat', 'cast'], active: true, adult: false,
    search: { url: '/animes?buscar={query}', itemSelector: 'a[href*="/anime/"]', titleSelector: 'img', titleAttr: 'alt', linkSelector: '&' },
    videos: { type: 'jsvar', varPattern: /var videos = (\[.*?\]);/, defaultQuality: 'HD' }
  },
  {
    name: 'veranime', title: 'VerAnime', baseUrl: 'https://ww3.animeonline.ninja',
    categories: ['anime'], language: ['cast', 'lat', 'vose'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'jsvar', varPattern: /var videos = (\[.*?\]);/, defaultQuality: 'HD' }
  },
  {
    name: 'veranimeassistant', title: 'VerAnimeAssistant', baseUrl: 'https://veranimeassistant.com',
    categories: ['anime'], language: ['cast', 'lat', 'vose'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'veronline', title: 'VerOnline', baseUrl: 'https://veronline.tv',
    categories: ['anime'], language: ['cast', 'lat', 'vose'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },

  // ═══════════════════════════════════════════
  // DOCUMENTARIES — 5 active providers
  // ═══════════════════════════════════════════

  {
    name: 'areadocumental', title: 'AreaDocumental', baseUrl: 'https://www.area-documental.com',
    categories: ['documentary'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/search/{query}', itemSelector: '.doc-item', titleSelector: '.title', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.player', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'documentalesonline', title: 'DocumentalesOnline', baseUrl: 'https://www.documentales-online.com',
    categories: ['documentary'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'elitetorrent', title: 'EliteTorrent', baseUrl: 'https://elitetorrent.biz',
    categories: ['documentary', 'vos', 'torrent'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'torrent', linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: 'HD' }
  },
  {
    name: 'mejortorrent', title: 'MejorTorrent', baseUrl: 'https://www38.mejortorrent.eu',
    categories: ['documentary', 'torrent'], language: ['cast'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'torrent', linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: 'HD' }
  },

  // ═══════════════════════════════════════════
  // ADDITIONAL ACTIVE PROVIDERS (from report)
  // ═══════════════════════════════════════════

  {
    name: 'ecarteleratrailers', title: 'eCarteleraTrailers', baseUrl: 'https://www.ecartelera.com',
    categories: ['movie'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/buscar/{query}', itemSelector: '.search-result', titleSelector: '.title', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.player', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'hdfulls', title: 'HDFullS', baseUrl: 'https://www.hdfull.it',
    categories: ['movie', 'tvshow'], language: ['cast', 'lat'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'estrenosdoramas', title: 'EstrenoDoramas', baseUrl: 'https://www26.estrenosdoramas.net',
    categories: ['tvshow', 'vos'], language: ['lat', 'vose'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    episodes: { type: 'season-list', seasonSelector: '.season-list a', episodeSelector: '.episode-list a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'doramasqueen', title: 'DoramasQueen', baseUrl: 'https://www.doramasqueen.com',
    categories: ['anime'], language: ['cast', 'lat'], active: true, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'ennovelas', title: 'Ennovelas', baseUrl: 'https://ennovelas.site',
    categories: ['anime', 'vos'], language: ['lat'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  },
  {
    name: 'cuevana2', title: 'Cuevana2', baseUrl: 'https://www.cuevana2.run',
    categories: ['movie', 'tvshow', 'vos'], language: ['*'], active: false, adult: false,
    search: { url: '/search?q={query}', itemSelector: 'a[href*="/pelicula/"]', titleSelector: '.title', linkSelector: '&' },
    videos: { type: 'nextjs', dataPath: 'props.pageProps.post.players', defaultQuality: 'HD' }
  },
  {
    name: 'sinpeli', title: 'SinPeli', baseUrl: 'https://www.sinpeli.com',
    categories: ['movie', 'vos'], language: ['lat', 'cast'], active: false, adult: false,
    search: { url: '/?s={query}', itemSelector: 'article', titleSelector: 'h2', linkSelector: 'a' },
    videos: { type: 'iframe', containerSelector: '.entry-content', iframeSelector: 'iframe', defaultQuality: 'HD' }
  }
];
