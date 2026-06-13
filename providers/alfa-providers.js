/**
 * alfa-providers - Built from src/alfa-providers/
 * Generated: 2026-06-13T05:59:49.168Z
 */
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/alfa-providers/providers.js
var require_providers = __commonJS({
  "src/alfa-providers/providers.js"(exports2, module2) {
    module2.exports = [
      // ═══════════════════════════════════════════
      // MOVIES (Peliculas) — 42 active providers
      // ═══════════════════════════════════════════
      {
        name: "allcalidad",
        title: "AllCalidad",
        baseUrl: "https://allcalidad.re",
        categories: ["movie", "direct"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/search?s={query}", itemSelector: "article.movie-item", titleSelector: "h3.title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".players", iframeSelector: "iframe", srcAttr: "data-src", defaultQuality: "HD" }
      },
      {
        name: "allpeliculas",
        title: "AllPeliculas",
        baseUrl: "https://allpeliculas.se",
        categories: ["movie", "vos"],
        language: ["lat"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "ul.cc-list > article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".players", iframeSelector: "iframe", srcAttr: "data-src", defaultQuality: "HD" }
      },
      {
        name: "asialiveaction",
        title: "AsiaLiveAction",
        baseUrl: "https://asialiveaction.com",
        categories: ["movie", "tvshow", "vos"],
        language: ["cast", "lat"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2.entry-title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "bloghorror",
        title: "BlogHorror",
        baseUrl: "https://bloghorror.com",
        categories: ["movie", "vos", "torrent"],
        language: ["*"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article.post", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "HD" }
      },
      {
        name: "cine24h",
        title: "Cine24H",
        baseUrl: "https://cine24h.online",
        categories: ["movie"],
        language: ["lat", "cast", "vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "cinecalidad",
        title: "CineCalidad",
        baseUrl: "https://www.cinecalidad.vg",
        categories: ["movie", "direct", "torrent"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article.movie", titleSelector: "h3", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".players", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "cinelibreonline",
        title: "CineLibreOnline",
        baseUrl: "https://www.cinelibreonline.com",
        categories: ["movie", "direct"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "cinemundo",
        title: "StreamGratis",
        baseUrl: "https://ww3.cinemundo.online",
        categories: ["movie"],
        language: ["cast", "lat", "vose"],
        active: false,
        adult: false,
        search: { url: "/search/{query}", itemSelector: ".movie-card", titleSelector: ".title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".player-container", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "cuevana2espanol",
        title: "Cuevana2Espanol",
        baseUrl: "https://www.cuevana2espanol.net",
        categories: ["movie"],
        language: ["lat", "cast"],
        active: false,
        adult: false,
        search: { url: "/search?q={query}", itemSelector: 'a[href*="/pelicula/"]', titleSelector: "h2, .title", linkSelector: "&" },
        videos: { type: "nextjs", dataPath: "props.pageProps.post.players", defaultQuality: "HD" }
      },
      {
        name: "detodopeliculas",
        title: "DeTodoPeliculas",
        baseUrl: "https://detodopeliculas.nu",
        categories: ["movie"],
        language: ["lat", "cast", "vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "divxtotal",
        title: "DivXTotal",
        baseUrl: "https://divxtotal.foo",
        categories: ["movie", "tvshow", "torrent"],
        language: ["cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "HD" }
      },
      {
        name: "dontorrent",
        title: "DonTorrent",
        baseUrl: "https://dontorrent.support",
        categories: ["movie", "tvshow", "vos", "torrent"],
        language: ["cast"],
        active: true,
        adult: false,
        search: { url: "/buscar/{query}", itemSelector: ".movie-card, article", titleSelector: "h2, h3", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "HD" }
      },
      {
        name: "doramasflix",
        title: "DoramasFlix",
        baseUrl: "https://doramasflix.co",
        categories: ["movie", "tvshow"],
        language: ["cast", "lat", "vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "doramedplay",
        title: "DoramedPlay",
        baseUrl: "https://doramedplay.net",
        categories: ["movie", "tvshow"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "entrepeliculasyseries",
        title: "EntrePeliculasYSeries",
        baseUrl: "https://entrepeliculasyseries.nz",
        categories: ["movie", "tvshow", "vos"],
        language: ["lat", "cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "estrenoscinesaa",
        title: "EstrenosCinesaa",
        baseUrl: "https://www.estrenoscinesaa.com",
        categories: ["movie", "tvshow"],
        language: ["cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "flizzmovies",
        title: "FlizzMovies",
        baseUrl: "https://flizzmovies.com",
        categories: ["movie"],
        language: ["cast", "lat", "vose"],
        active: false,
        adult: false,
        search: { url: "/search/{query}", itemSelector: ".movie-card", titleSelector: ".title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".player", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "genteclic",
        title: "GenteClic",
        baseUrl: "https://www.genteclic.com",
        categories: ["movie", "direct"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "gnula",
        title: "Gnula",
        baseUrl: "https://gnulahd.nu",
        categories: ["movie", "vos"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "grantorrent",
        title: "GranTorrent",
        baseUrl: "https://grantorrent.zip",
        categories: ["movie", "tvshow", "vos", "torrent"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "HD" }
      },
      {
        name: "hdfull",
        title: "HDFull",
        baseUrl: "https://hdfull.today",
        categories: ["movie", "tvshow", "vos"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        episodes: { type: "post", url: null, seasonParam: "season", episodeParam: "episode", extraParams: { action: "season", show: null }, episodeSelector: "a" },
        videos: { type: "iframe", containerSelector: ".player-container", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "homecine",
        title: "HomeCine",
        baseUrl: "https://www3.homecine.to",
        categories: ["movie", "tvshow", "direct"],
        language: ["lat", "cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "legalmentegratis",
        title: "LegalmenteGratis",
        baseUrl: "https://legalmentegratis.com",
        categories: ["movie", "vos"],
        language: ["cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "mirapeliculas",
        title: "MiraPeliculas",
        baseUrl: "https://ww2.dipelis.com",
        categories: ["movie"],
        language: ["lat", "cast", "vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "mitorrent",
        title: "MiTorrent",
        baseUrl: "https://mitorrent.mx",
        categories: ["movie", "tvshow", "torrent"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "HD" }
      },
      {
        name: "osjonosu",
        title: "OsjoNosu",
        baseUrl: "https://osjonosu.xyz",
        categories: ["movie", "tvshow"],
        language: ["cast"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "pelicinehd",
        title: "PeliCineHD",
        baseUrl: "https://pelicinehd.com",
        categories: ["movie"],
        language: ["lat", "cast", "vose"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "peliculasflix",
        title: "PeliculasFlix",
        baseUrl: "https://peliculasflix.co",
        categories: ["movie"],
        language: ["cast", "lat", "vose"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "pelis182",
        title: "Pelis182",
        baseUrl: "https://pelis182.com",
        categories: ["movie", "tvshow"],
        language: ["lat"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "pelisflix",
        title: "PelisFlix",
        baseUrl: "https://pelisflix2.bond",
        categories: ["movie", "vos"],
        language: ["lat", "cast"],
        active: false,
        adult: false,
        search: { url: "/search/{query}", itemSelector: ".movie-card", titleSelector: ".title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".player", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "pelisforte",
        title: "PelisForte",
        baseUrl: "https://www1.pelisforte.se",
        categories: ["movie"],
        language: ["lat", "cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "pelispedia",
        title: "PelisPedia",
        baseUrl: "https://pelispedia.is",
        categories: ["movie", "tvshow", "vos"],
        language: ["lat", "cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        episodes: { type: "post", url: null, seasonParam: "season", episodeParam: "episode", extraParams: { action: "action_select_season" }, episodeSelector: "a" },
        videos: { type: "iframe", containerSelector: ".players", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "poseidonhd",
        title: "PoseidonHD",
        baseUrl: "https://www.poseidonhd2.co",
        categories: ["movie", "tvshow", "vos", "direct"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/search?q={query}", itemSelector: 'a[href*="/pelicula/"], a[href*="/serie/"]', titleSelector: "h2, .title", linkSelector: "&" },
        videos: { type: "nextjs", dataPath: "props.pageProps.post.players", defaultQuality: "HD" }
      },
      {
        name: "retrotv",
        title: "RetroTV",
        baseUrl: "https://retrotv.org",
        categories: ["movie", "tvshow"],
        language: ["lat"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "serieskao",
        title: "SeriesKao",
        baseUrl: "https://serieskao.top",
        categories: ["movie", "tvshow", "vos"],
        language: ["lat", "cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "tubeonline",
        title: "TubeOnline",
        baseUrl: "https://www.tubeonline.net",
        categories: ["movie", "tvshow"],
        language: ["lat", "cast", "vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "tubepelis",
        title: "TubePelis",
        baseUrl: "https://www.tubepelis.com",
        categories: ["movie"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "wolfmax4k",
        title: "WolfMax4K",
        baseUrl: "https://wolfmax4k.com",
        categories: ["movie", "tvshow", "torrent"],
        language: ["cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "4K" }
      },
      {
        name: "yandispoiler",
        title: "Yandispoiler",
        baseUrl: "https://yandispoiler.net",
        categories: ["movie", "tvshow"],
        language: ["lat", "cast", "vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "zonaleros",
        title: "ZonaLeros",
        baseUrl: "https://www.zona-leros.com",
        categories: ["movie", "tvshow"],
        language: ["lat"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "zoowomaniacos",
        title: "Zoowomaniacos",
        baseUrl: "https://zoowomaniacos.org",
        categories: ["movie", "vos"],
        language: ["lat", "cast"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      // ═══════════════════════════════════════════
      // TV SHOWS (Series) — 26 active providers
      // ═══════════════════════════════════════════
      {
        name: "doramasyt",
        title: "DoramasYT",
        baseUrl: "https://www.doramasyt.com",
        categories: ["tvshow", "vos"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        episodes: { type: "season-list", seasonSelector: ".season-list a", episodeSelector: ".episode-list a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "eztv",
        title: "EZTV",
        baseUrl: "https://eztvx.to",
        categories: ["tvshow", "vos", "torrent"],
        language: ["*"],
        active: true,
        adult: false,
        search: { url: "/search/{query}", itemSelector: "tr.forum_header_border", titleSelector: "a.epinfo", linkSelector: 'a.magnet, a[href*=".torrent"]' },
        videos: { type: "torrent", linkSelector: 'a.magnet, a[href*=".torrent"]', defaultQuality: "HD" }
      },
      {
        name: "fullseriehd",
        title: "FullSerieHD",
        baseUrl: "https://seriesmega.org",
        categories: ["tvshow", "vos"],
        language: ["cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        episodes: { type: "season-list", seasonSelector: ".season-list a", episodeSelector: ".episode-list a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "lacartoons",
        title: "LaCartoons",
        baseUrl: "https://www.lacartoons.com",
        categories: ["tvshow"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/search/{query}", itemSelector: ".serie-item", titleSelector: ".title", linkSelector: "a" },
        episodes: { type: "season-list", seasonSelector: ".temporadas a", episodeSelector: ".episodios a" },
        videos: { type: "iframe", containerSelector: ".player", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "seriesretro",
        title: "SeriesRetro",
        baseUrl: "https://seriesretro.com",
        categories: ["tvshow"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        episodes: { type: "season-list", seasonSelector: ".season-list a", episodeSelector: ".episode-list a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      // ═══════════════════════════════════════════
      // ANIME — 10 active, 12 inactive
      // ═══════════════════════════════════════════
      {
        name: "animeflv",
        title: "AnimeFLV",
        baseUrl: "https://www3.animeflv.net",
        categories: ["anime"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/browse?q={query}", itemSelector: "ul.ListAnimes li", titleSelector: "h3.Title", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "animejara",
        title: "AnimeJara",
        baseUrl: "https://animejara.net",
        categories: ["anime"],
        language: ["cast", "lat", "vose"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "animejl",
        title: "AnimeJL",
        baseUrl: "https://www.anime-jl.net",
        categories: ["anime"],
        language: ["cast", "lat", "vose"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article.Anime", titleSelector: "h3.Title", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "estrenosanime",
        title: "EstrenosAnime",
        baseUrl: "https://estrenosanime.net",
        categories: ["anime"],
        language: ["*"],
        active: true,
        adult: false,
        search: { url: "/search?keyword={query}", itemSelector: "a.film-poster-ahref", titleSelector: "&", titleAttr: "title", linkSelector: "&" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "hacktorrent",
        title: "HackTorrent",
        baseUrl: "https://hacktorrent.to",
        categories: ["anime", "vos", "torrent"],
        language: ["lat", "cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "HD" }
      },
      {
        name: "henaojara",
        title: "HenaoJara",
        baseUrl: "https://henaojara.com",
        categories: ["anime"],
        language: ["cast", "lat", "vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article.TPost", titleSelector: "h3", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "jkanime",
        title: "JKAnime",
        baseUrl: "https://jkanime.net",
        categories: ["anime"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/buscar/{query}", itemSelector: ".anime__item", titleSelector: "h5 a", linkSelector: "a" },
        episodes: { type: "url", pattern: "/{slug}/{episode}/" },
        videos: { type: "jslist", varPattern: /video\[\d+\] = '(.*?)';/g, defaultQuality: "HD" }
      },
      {
        name: "lamovie",
        title: "LaMovie",
        baseUrl: "https://la.movie",
        categories: ["anime"],
        language: ["lat", "cast", "vose"],
        active: false,
        adult: false,
        search: { url: "/search/{query}", itemSelector: ".movie-card", titleSelector: ".title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".player", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "latanime",
        title: "LatAnime",
        baseUrl: "https://latanime.org",
        categories: ["anime"],
        language: ["cast", "lat", "vose"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "mundodonghua",
        title: "MundoDonghua",
        baseUrl: "https://www.mundodonghua.com",
        categories: ["anime", "vos"],
        language: ["*"],
        active: false,
        adult: false,
        search: { url: "/busquedas/?donghua={query}", itemSelector: ".md-card", titleSelector: ".md-card-title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "pelispanda",
        title: "PelisPanda",
        baseUrl: "https://pelispanda.org",
        categories: ["anime", "vos", "torrent"],
        language: ["lat"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "HD" }
      },
      {
        name: "pelisplus",
        title: "PelisPlus",
        baseUrl: "https://ww3.pelisplus.to",
        categories: ["anime", "documentary", "direct"],
        language: ["lat"],
        active: false,
        adult: false,
        search: { url: "/search?q={query}", itemSelector: 'a[href*="/pelicula/"]', titleSelector: ".title", linkSelector: "&" },
        videos: { type: "nextjs", dataPath: "props.pageProps.post.players", defaultQuality: "HD" }
      },
      {
        name: "repelishd",
        title: "RepelisHD",
        baseUrl: "https://cinehdplus.gratis",
        categories: ["anime", "vos"],
        language: ["lat", "cast", "vose"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "sololatino",
        title: "SoloLatino",
        baseUrl: "https://sololatino.net",
        categories: ["anime", "vos"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/buscar?q={query}", itemSelector: ".card", titleSelector: ".card__title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "tioanime",
        title: "TioAnime",
        baseUrl: "https://tioanime.com",
        categories: ["anime", "vos"],
        language: ["*"],
        active: true,
        adult: false,
        search: { url: "/directorio?q={query}", itemSelector: "article.anime", titleSelector: "h3.title", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var episodes = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "tiodonghua",
        title: "TioDonghua",
        baseUrl: "https://tiodonghua.com",
        categories: ["anime", "vos"],
        language: ["vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: ".title a", linkSelector: ".title a" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "tvanime",
        title: "TVAnime",
        baseUrl: "https://vww.monoschinos2.net",
        categories: ["anime", "vos"],
        language: ["lat", "cast"],
        active: true,
        adult: false,
        search: { url: "/animes?buscar={query}", itemSelector: 'a[href*="/anime/"]', titleSelector: "img", titleAttr: "alt", linkSelector: "&" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "veranime",
        title: "VerAnime",
        baseUrl: "https://ww3.animeonline.ninja",
        categories: ["anime"],
        language: ["cast", "lat", "vose"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "veranimeassistant",
        title: "VerAnimeAssistant",
        baseUrl: "https://veranimeassistant.com",
        categories: ["anime"],
        language: ["cast", "lat", "vose"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "veronline",
        title: "VerOnline",
        baseUrl: "https://veronline.tv",
        categories: ["anime"],
        language: ["cast", "lat", "vose"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      // ═══════════════════════════════════════════
      // DOCUMENTARIES — 5 active providers
      // ═══════════════════════════════════════════
      {
        name: "areadocumental",
        title: "AreaDocumental",
        baseUrl: "https://www.area-documental.com",
        categories: ["documentary"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/search/{query}", itemSelector: ".doc-item", titleSelector: ".title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".player", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "documentalesonline",
        title: "DocumentalesOnline",
        baseUrl: "https://www.documentales-online.com",
        categories: ["documentary"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "elitetorrent",
        title: "EliteTorrent",
        baseUrl: "https://elitetorrent.biz",
        categories: ["documentary", "vos", "torrent"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "HD" }
      },
      {
        name: "mejortorrent",
        title: "MejorTorrent",
        baseUrl: "https://www38.mejortorrent.eu",
        categories: ["documentary", "torrent"],
        language: ["cast"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "HD" }
      },
      // ═══════════════════════════════════════════
      // ADDITIONAL ACTIVE PROVIDERS (from report)
      // ═══════════════════════════════════════════
      {
        name: "ecarteleratrailers",
        title: "eCarteleraTrailers",
        baseUrl: "https://www.ecartelera.com",
        categories: ["movie"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/buscar/{query}", itemSelector: ".search-result", titleSelector: ".title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".player", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "hdfulls",
        title: "HDFullS",
        baseUrl: "https://www.hdfull.it",
        categories: ["movie", "tvshow"],
        language: ["cast", "lat"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "estrenosdoramas",
        title: "EstrenoDoramas",
        baseUrl: "https://www26.estrenosdoramas.net",
        categories: ["tvshow", "vos"],
        language: ["lat", "vose"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        episodes: { type: "season-list", seasonSelector: ".season-list a", episodeSelector: ".episode-list a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "doramasqueen",
        title: "DoramasQueen",
        baseUrl: "https://www.doramasqueen.com",
        categories: ["anime"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "ennovelas",
        title: "Ennovelas",
        baseUrl: "https://ennovelas.site",
        categories: ["anime", "vos"],
        language: ["lat"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "cuevana2",
        title: "Cuevana2",
        baseUrl: "https://www.cuevana2.run",
        categories: ["movie", "tvshow", "vos"],
        language: ["*"],
        active: false,
        adult: false,
        search: { url: "/search?q={query}", itemSelector: 'a[href*="/pelicula/"]', titleSelector: ".title", linkSelector: "&" },
        videos: { type: "nextjs", dataPath: "props.pageProps.post.players", defaultQuality: "HD" }
      },
      {
        name: "sinpeli",
        title: "SinPeli",
        baseUrl: "https://www.sinpeli.com",
        categories: ["movie", "vos"],
        language: ["lat", "cast"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      }
    ];
  }
});

// src/alfa-providers/engine.js
var require_engine = __commonJS({
  "src/alfa-providers/engine.js"(exports2, module2) {
    var cheerio = require("cheerio-without-node-native") || require("cheerio");
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var TMDB_KEY2 = "d80ba92bc7cefe3359668d30d06f3305";
    function fetchHTML2(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), opts.timeout || 12e3);
          const res = yield fetch(url, {
            headers: __spreadValues({ "User-Agent": UA2, "Accept": "text/html,application/xhtml+xml,*/*" }, opts.headers),
            signal: ctrl.signal
          });
          clearTimeout(t);
          if (!res.ok) return null;
          return yield res.text();
        } catch (e) {
          return null;
        }
      });
    }
    function fetchJSON2(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), opts.timeout || 1e4);
          const res = yield fetch(url, {
            headers: __spreadValues({ "User-Agent": UA2, "Accept": "application/json" }, opts.headers),
            signal: ctrl.signal
          });
          clearTimeout(t);
          if (!res.ok) return null;
          return yield res.json();
        } catch (e) {
          return null;
        }
      });
    }
    function similarity2(a, b) {
      if (!a || !b) return 0;
      const sa = a.toLowerCase().replace(/[^a-z0-9]/g, "");
      const sb = b.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (sa === sb) return 1;
      if (sa.length < 2 || sb.length < 2) return 0;
      const longer = sa.length > sb.length ? sa : sb;
      const shorter = sa.length > sb.length ? sb : sa;
      if (longer.length === 0) return 1;
      const bigrams = /* @__PURE__ */ new Map();
      for (let i = 0; i < shorter.length - 1; i++) {
        const bg = shorter.substring(i, i + 2);
        bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
      }
      let common = 0;
      for (let i = 0; i < longer.length - 1; i++) {
        const bg = longer.substring(i, i + 2);
        const count = bigrams.get(bg) || 0;
        if (count > 0) {
          common++;
          bigrams.set(bg, count - 1);
        }
      }
      return 2 * common / (longer.length + shorter.length - 2);
    }
    function resolveTMDB(id, mediaType) {
      return __async(this, null, function* () {
        try {
          let tmdbId = id;
          if (id.startsWith("tt")) {
            const r = yield fetchJSON2(`https://api.themoviedb.org/3/find/${id}?api_key=${TMDB_KEY2}&external_source=imdb_id`);
            const results = r == null ? void 0 : r[mediaType === "tv" ? "tv_results" : "movie_results"];
            if (results == null ? void 0 : results[0]) tmdbId = results[0].id;
            else return null;
          }
          const typeStr = mediaType === "tv" ? "tv" : "movie";
          const data = yield fetchJSON2(`https://api.themoviedb.org/3/${typeStr}/${tmdbId}?api_key=${TMDB_KEY2}&language=en`);
          if (!data) return null;
          return {
            title: data.title || data.name || "",
            year: (data.release_date || data.first_air_date || "").substring(0, 4),
            imdbId: data.imdb_id || "",
            tmdbId: String(data.id)
          };
        } catch (e) {
          return null;
        }
      });
    }
    function searchProvider2(provider, title, year, mediaType) {
      return __async(this, null, function* () {
        const cfg = provider.search;
        if (!cfg) return null;
        const titleClean = title.replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
        function trySearch(query) {
          return __async(this, null, function* () {
            let searchUrl;
            if (typeof cfg.url === "function") {
              searchUrl = cfg.url(provider.baseUrl, query);
            } else {
              searchUrl = provider.baseUrl + cfg.url.replace("{query}", encodeURIComponent(query));
            }
            return yield fetchHTML2(searchUrl, { headers: cfg.headers, timeout: 1e4 });
          });
        }
        let html = yield trySearch(titleClean);
        if (!html && titleClean.includes(" ")) {
          const short = titleClean.split(" ").slice(0, 2).join(" ");
          if (short.length > 3) html = yield trySearch(short);
        }
        if (!html) return null;
        const $ = cheerio.load(html);
        const items = $(cfg.itemSelector).toArray();
        if (!items.length) return null;
        let bestMatch = null;
        let bestScore = 0;
        for (const item of items) {
          const el = $(item);
          let itemTitle = "";
          let itemLink = "";
          if (cfg.titleSelector) {
            const titleEl = cfg.titleSelector === "&" ? el : el.find(cfg.titleSelector).first();
            itemTitle = cfg.titleAttr ? titleEl.attr(cfg.titleAttr) || "" : titleEl.text().trim();
          }
          if (cfg.linkSelector) {
            const linkEl = cfg.linkSelector === "&" ? el : el.find(cfg.linkSelector).first();
            itemLink = (linkEl.attr("href") || "").trim();
            if (itemLink && !itemLink.startsWith("http")) {
              try {
                itemLink = new URL(itemLink, provider.baseUrl).href;
              } catch (e) {
                continue;
              }
            }
          }
          if (!itemTitle || !itemLink) continue;
          let score = similarity2(itemTitle, title);
          const titleClean2 = titleClean.replace(/[^a-z0-9]/g, "");
          const itemClean = itemTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (itemClean === titleClean2) score = Math.max(score, 0.9);
          if (itemClean.includes(titleClean2) || titleClean2.includes(itemClean)) {
            score = Math.max(score, 0.75);
          }
          if (year) {
            const itemYear = el.text().match(/\b(19|20)\d{2}\b/);
            if (itemYear && itemYear[0] === year) score += 0.2;
          }
          if (score > bestScore && score > 0.35) {
            bestScore = score;
            bestMatch = itemLink;
          }
        }
        return bestMatch;
      });
    }
    function getEpisodeUrl2(provider, seriesUrl, season, episode) {
      return __async(this, null, function* () {
        var _a, _b, _c;
        const cfg = provider.episodes;
        if (!cfg) return seriesUrl;
        if (cfg.type === "url") {
          const slug = seriesUrl.replace(/\/+$/, "").split("/").pop();
          const url = cfg.pattern.replace("{slug}", slug).replace("{episode}", episode);
          try {
            return new URL(url, provider.baseUrl).href;
          } catch (e) {
            return seriesUrl;
          }
        }
        const html = yield fetchHTML2(seriesUrl);
        if (!html) return null;
        const $ = cheerio.load(html);
        if (cfg.type === "post") {
          const fd = new URLSearchParams();
          fd.append(cfg.seasonParam || "season", String(season));
          fd.append(cfg.episodeParam || "episode", String(episode));
          if (cfg.extraParams) {
            for (const [k, v] of Object.entries(cfg.extraParams)) {
              fd.append(k, typeof v === "function" ? v($, html) : v);
            }
          }
          const postUrl = cfg.url || seriesUrl;
          const res = yield fetch(postUrl, {
            method: "POST",
            headers: __spreadValues({ "User-Agent": UA2, "Content-Type": "application/x-www-form-urlencoded" }, cfg.headers),
            body: fd.toString(),
            signal: AbortSignal.timeout(12e3)
          });
          if (!res.ok) return null;
          const data = yield res.text();
          const $$ = cheerio.load(data);
          const epLink = $$(cfg.episodeSelector).first().attr("href");
          if (epLink) {
            try {
              return new URL(epLink, provider.baseUrl).href;
            } catch (e) {
              return null;
            }
          }
          return null;
        }
        if (cfg.type === "season-list") {
          const seasonEls = $(cfg.seasonSelector).toArray();
          for (const sel of seasonEls) {
            const sNum = parseInt(((_a = $(sel).text().match(/\d+/)) == null ? void 0 : _a[0]) || "0");
            if (sNum === season) {
              const sUrl = $(sel).attr("href");
              if (sUrl) {
                const sHtml = yield fetchHTML2(new URL(sUrl, provider.baseUrl).href);
                if (sHtml) {
                  const $$ = cheerio.load(sHtml);
                  const epEls = $$(cfg.episodeSelector).toArray();
                  for (const eel of epEls) {
                    const eNum = parseInt(((_b = $$(eel).text().match(/\d+/)) == null ? void 0 : _b[0]) || "0");
                    if (eNum === episode) {
                      const epUrl = $$(eel).attr("href");
                      if (epUrl) {
                        try {
                          return new URL(epUrl, provider.baseUrl).href;
                        } catch (e) {
                          return null;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (cfg.type === "jsvar") {
          const match = html.match(cfg.varPattern);
          if (match) {
            try {
              const episodes = JSON.parse(match[1]);
              const ep = episodes.find(
                (e) => (e.season || e.temporada) == season && (e.episode || e.capitulo) == episode
              );
              if ((ep == null ? void 0 : ep.url) || (ep == null ? void 0 : ep.link)) {
                try {
                  return new URL(ep.url || ep.link, provider.baseUrl).href;
                } catch (e) {
                  return null;
                }
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "nextjs") {
          const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              let obj = data;
              for (const key of cfg.dataPath.split(".")) obj = obj == null ? void 0 : obj[key];
              if (obj == null ? void 0 : obj.seasons) {
                for (const s of obj.seasons) {
                  if (s.number == season) {
                    const ep = (_c = s.episodes) == null ? void 0 : _c.find((e) => e.number == episode);
                    if (ep == null ? void 0 : ep.url) {
                      try {
                        return new URL(ep.url, provider.baseUrl).href;
                      } catch (e) {
                        return null;
                      }
                    }
                  }
                }
              }
            } catch (e) {
            }
          }
        }
        return seriesUrl;
      });
    }
    function extractVideos2(provider, pageUrl) {
      return __async(this, null, function* () {
        const cfg = provider.videos;
        if (!cfg) return [];
        const html = yield fetchHTML2(pageUrl);
        if (!html) return [];
        const $ = cheerio.load(html);
        const results = [];
        if (cfg.type === "iframe") {
          const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
          const iframes = container.find(cfg.iframeSelector || "iframe").toArray();
          for (const iframe of iframes) {
            const src = $(iframe).attr(cfg.srcAttr || "src") || $(iframe).attr("data-src");
            if (src) {
              const url = src.startsWith("//") ? "https:" + src : src;
              results.push({ url, server: detectServer2(url), quality: cfg.defaultQuality || "HD" });
            }
          }
        }
        if (cfg.type === "nextjs") {
          const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/) || html.match(/<script type="application\/json"[^>]*>(.*?)<\/script>/);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              let obj = data;
              for (const key of cfg.dataPath.split(".")) obj = obj == null ? void 0 : obj[key];
              if (obj && typeof obj === "object") {
                for (const [lang, players] of Object.entries(obj)) {
                  if (Array.isArray(players)) {
                    for (const p of players) {
                      const pUrl = p.result || p.url || p.link;
                      if (pUrl) results.push({
                        url: pUrl,
                        server: p.cyberlocker || p.server || detectServer2(pUrl),
                        quality: p.quality || cfg.defaultQuality || "HD",
                        lang
                      });
                    }
                  }
                }
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "jsvar") {
          const match = html.match(cfg.varPattern);
          if (match) {
            try {
              const videos = JSON.parse(match[1]);
              for (const v of videos) {
                const server = Array.isArray(v) ? v[0] : v.server || v.name;
                const vUrl = Array.isArray(v) ? v[1] : v.url || v.link || v.code;
                if (vUrl) results.push({
                  url: vUrl,
                  server: server || detectServer2(vUrl),
                  quality: v.quality || cfg.defaultQuality || "HD",
                  lang: v.lang || v.idioma || v.audio || ""
                });
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "jslist") {
          const re = cfg.varPattern instanceof RegExp ? cfg.varPattern : new RegExp(cfg.varPattern, "g");
          let m;
          while ((m = re.exec(html)) !== null) {
            const src = (m[1] || "").match(/src=["']([^"']+)["']/);
            if (src) {
              results.push({ url: src[1], server: detectServer2(src[1]), quality: cfg.defaultQuality || "HD" });
            }
          }
        }
        if (cfg.type === "api") {
          const apiUrl = typeof cfg.apiUrl === "function" ? cfg.apiUrl(provider.baseUrl, pageUrl, html) : provider.baseUrl + cfg.apiUrl;
          const data = yield fetchJSON2(apiUrl, { headers: cfg.headers });
          if (data) {
            const sources = data.sources || data.data || data;
            for (const s of Array.isArray(sources) ? sources : []) {
              const sUrl = s.url || s.file || s.link || s.src;
              if (sUrl) results.push({
                url: sUrl,
                server: s.server || detectServer2(sUrl),
                quality: s.quality || s.label || cfg.defaultQuality || "HD"
              });
            }
          }
        }
        if (cfg.type === "torrent") {
          const links = $(cfg.linkSelector || 'a[href*="magnet:"], a[href$=".torrent"]').toArray();
          for (const link of links) {
            const href = $(link).attr("href");
            if (href && (href.startsWith("magnet:") || href.endsWith(".torrent"))) {
              const label = $(link).text().trim() || cfg.defaultQuality || "HD";
              results.push({ url: href, server: "torrent", quality: label });
            }
          }
        }
        return results;
      });
    }
    function detectServer2(url) {
      if (!url) return "direct";
      if (/\.(mp4|m3u8|mkv|webm|avi)(\?|$)/i.test(url)) return "direct";
      if (/magnet:/i.test(url)) return "torrent";
      const patterns = [
        ["streamwish", /streamwish/i],
        ["filemoon", /filemoon/i],
        ["voes", /voes\./i],
        ["doodstream", /dood/i],
        ["streamtape", /streamtape/i],
        ["fembed", /fembed/i],
        ["okru", /ok\.ru|odnoklassniki/i],
        ["mixdrop", /mixdrop/i],
        ["upstream", /upstream/i],
        ["vidhide", /vidhide|vidpro/i],
        ["voe", /voe\.sx/i],
        ["mystream", /mystream/i],
        ["netutv", /netu\.tv/i],
        ["yourupload", /yourupload/i],
        ["jawcloud", /jawcloud/i],
        ["streampe", /streampe/i],
        ["gvideo", /drive\.google|googlevideo/i],
        ["mega", /mega\.nz/i],
        ["wolfmax", /wolfmax/i],
        ["youtube", /youtube|youtu\.be/i]
      ];
      for (const [name, re] of patterns) {
        if (re.test(url)) return name;
      }
      return "embed";
    }
    module2.exports = {
      fetchHTML: fetchHTML2,
      fetchJSON: fetchJSON2,
      similarity: similarity2,
      resolveTMDB,
      searchProvider: searchProvider2,
      getEpisodeUrl: getEpisodeUrl2,
      extractVideos: extractVideos2,
      detectServer: detectServer2
    };
  }
});

// src/alfa-providers/index.js
var providers = require_providers();
var { fetchHTML, fetchJSON, similarity, searchProvider, getEpisodeUrl, extractVideos, detectServer } = require_engine();
var TMDB_KEY = process.env.TMDB_KEY || "d80ba92bc7cefe3359668d30d06f3305";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
var ANIME_PREFIXES = ["animeflv:", "animeav1:", "henaojara:", "tioanime:", "anilist:", "kitsu:", "mal:", "anidb:"];
var titleCache = /* @__PURE__ */ new Map();
var MAX_CACHE = 500;
function cacheSet(key, value) {
  if (titleCache.size >= MAX_CACHE) {
    const firstKey = titleCache.keys().next().value;
    titleCache.delete(firstKey);
  }
  titleCache.set(key, value);
}
function isAnimeId(id) {
  return ANIME_PREFIXES.some((p) => id.startsWith(p));
}
function extractSlug(id) {
  const parts = id.split(":");
  return parts.length >= 2 ? parts[1] : id;
}
function resolveTitles(id, mediaType) {
  return __async(this, null, function* () {
    const cacheKey = `titles:${mediaType}:${id}`;
    if (titleCache.has(cacheKey)) return titleCache.get(cacheKey);
    const variants = [];
    const seen = /* @__PURE__ */ new Set();
    function addVariant(title, year) {
      const t = (title || "").trim();
      if (t && !seen.has(t.toLowerCase())) {
        variants.push({ title: t, year: year || "" });
        seen.add(t.toLowerCase());
      }
    }
    if (isAnimeId(id)) {
      const slug = extractSlug(id);
      addVariant(slug.replace(/-/g, " "), "");
      if (slug.includes("-")) addVariant(slug, "");
    }
    try {
      let tmdbId = id;
      if (id.startsWith("tt")) {
        const findRes = yield fetch(`https://api.themoviedb.org/3/find/${id}?api_key=${TMDB_KEY}&external_source=imdb_id`, {
          headers: { "User-Agent": UA }
        });
        if (findRes.ok) {
          const data = yield findRes.json();
          const results = data == null ? void 0 : data[mediaType === "tv" ? "tv_results" : "movie_results"];
          if (results == null ? void 0 : results[0]) tmdbId = String(results[0].id);
        }
      }
      if (!tmdbId.match(/^\d+$/)) {
        cacheSet(cacheKey, variants);
        return variants;
      }
      function tmdbFetch(lang) {
        return __async(this, null, function* () {
          try {
            const ac = new AbortController();
            setTimeout(() => ac.abort(), 6e3);
            const r = yield fetch(`https://api.themoviedb.org/3/${mediaType === "tv" ? "tv" : "movie"}/${tmdbId}?api_key=${TMDB_KEY}&language=${lang}`, { headers: { "User-Agent": UA }, signal: ac.signal });
            return r.ok ? r.json() : null;
          } catch (e) {
            return null;
          }
        });
      }
      const [enData, esData, jaData] = yield Promise.all([tmdbFetch("en"), tmdbFetch("es"), tmdbFetch("ja")]);
      let firstYear = "";
      if (enData) {
        firstYear = (enData.release_date || enData.first_air_date || "").substring(0, 4);
        addVariant(enData.title || enData.name || "", firstYear);
        if (enData.original_title && enData.original_title !== (enData.title || enData.name)) {
          addVariant(enData.original_title, firstYear);
        }
        if (enData.original_name && enData.original_name !== (enData.name || enData.title)) {
          addVariant(enData.original_name, firstYear);
        }
      }
      if (esData) {
        addVariant(esData.title || esData.name || "", firstYear);
      }
      if (jaData) {
        const jaTitle = jaData.title || jaData.name || "";
        if (jaTitle && !seen.has(jaTitle.toLowerCase())) {
          addVariant(jaTitle, firstYear);
        }
      }
      if (firstYear) {
        for (const v of variants) {
          if (!v.year) v.year = firstYear;
        }
      }
    } catch (e) {
    }
    if (variants.length === 0 && !id.match(/^\d+$/)) {
      variants.push({ title: id, year: "" });
    }
    cacheSet(cacheKey, variants);
    return variants;
  });
}
function mapTypeToCategory(type) {
  if (type === "movie") return "movie";
  if (type === "series" || type === "tv") return "tvshow";
  if (type === "anime") return "anime";
  return "movie";
}
function mapTypeToTMDB(type) {
  if (type === "series" || type === "tv" || type === "anime") return "tv";
  return "movie";
}
function scrapeAlfaProviders(type, id, season, episode) {
  return __async(this, null, function* () {
    const category = mapTypeToCategory(type);
    const mediaType = mapTypeToTMDB(type);
    const titleVariants = yield resolveTitles(id, mediaType);
    if (!titleVariants.length || !titleVariants[0].title) return [];
    const activeProviders = providers.filter((p) => {
      if (!p.active || p.adult) return false;
      return p.categories.includes(category);
    });
    if (!activeProviders.length) return [];
    const results = [];
    const chunks = chunkArray(activeProviders, 4);
    for (const chunk of chunks) {
      const chunkResults = yield Promise.allSettled(
        chunk.map((provider) => __async(null, null, function* () {
          try {
            let pageUrl = null;
            const validVariants = titleVariants.filter((tv) => tv.title);
            if (validVariants.length === 1) {
              pageUrl = yield searchProvider(provider, validVariants[0].title, validVariants[0].year, mediaType);
            } else if (validVariants.length > 1) {
              const searchResults = yield Promise.allSettled(
                validVariants.map((tv) => searchProvider(provider, tv.title, tv.year, mediaType))
              );
              for (const r of searchResults) {
                if (r.status === "fulfilled" && r.value) {
                  pageUrl = r.value;
                  break;
                }
              }
            }
            if (!pageUrl) return [];
            let targetUrl = pageUrl;
            if ((category === "tvshow" || category === "anime") && season && episode) {
              const epUrl = yield getEpisodeUrl(provider, pageUrl, season, episode);
              if (epUrl) targetUrl = epUrl;
            }
            const videos = yield extractVideos(provider, targetUrl);
            if (!videos.length) return [];
            return videos.map((v) => ({
              name: `${provider.title}
${v.server || detectServer(v.url)}`,
              title: `${v.quality || "HD"}
\u2699\uFE0F ${v.server || detectServer(v.url)}
\u{1F517} ${provider.title}`,
              description: v.lang || (category === "anime" && !(Array.isArray(provider.language) && provider.language.includes("*")) ? [.../* @__PURE__ */ new Set([...Array.isArray(provider.language) ? provider.language : [], "ja"])].join(",") : Array.isArray(provider.language) ? provider.language.join(",") : ""),
              url: v.url,
              behaviorHints: {
                notWebReady: true,
                bingeGroup: `alfa|${provider.name}|${v.server || detectServer(v.url)}`
              }
            }));
          } catch (e) {
            return [];
          }
        }))
      );
      for (const r of chunkResults) {
        if (r.status === "fulfilled") results.push(...r.value);
      }
      if (results.length >= 30) break;
    }
    return results.slice(0, 50);
  });
}
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}
module.exports = scrapeAlfaProviders;
