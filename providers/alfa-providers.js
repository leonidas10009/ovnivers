/**
 * alfa-providers - Built from src/alfa-providers/
 * Generated: 2026-06-12T09:14:47.196Z
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
      // ANIME — 20 active providers
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
        active: true,
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
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
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
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
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
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
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
        search: { url: "/buscar/{query}", itemSelector: ".anime-item", titleSelector: ".title", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "lamovie",
        title: "LaMovie",
        baseUrl: "https://la.movie",
        categories: ["anime"],
        language: ["lat", "cast", "vose"],
        active: true,
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
        active: true,
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
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "pelispanda",
        title: "PelisPanda",
        baseUrl: "https://pelispanda.com",
        categories: ["anime", "vos", "torrent"],
        language: ["lat"],
        active: true,
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
        active: true,
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
        active: true,
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
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
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
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "tvanime",
        title: "TVAnime",
        baseUrl: "https://ww3.monoschinos3.com",
        categories: ["anime", "vos"],
        language: ["lat", "cast"],
        active: true,
        adult: false,
        search: { url: "/buscar?q={query}", itemSelector: ".anime-card", titleSelector: ".title", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var videos = (\[.*?\]);/, defaultQuality: "HD" }
      },
      {
        name: "veranime",
        title: "VerAnime",
        baseUrl: "https://ww3.animeonline.ninja",
        categories: ["anime"],
        language: ["cast", "lat", "vose"],
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
        active: true,
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
    var cheerio = require("cheerio");
    var CryptoJS = require("crypto-js");
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var TMDB_KEY = "d80ba92bc7cefe3359668d30d06f3305";
    function fetchHTML(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        try {
          const res = yield fetch(url, __spreadValues({
            headers: __spreadValues({ "User-Agent": UA, "Accept": "text/html,*/*" }, opts.headers),
            signal: AbortSignal.timeout(opts.timeout || 15e3)
          }, opts));
          if (!res.ok) return null;
          return yield res.text();
        } catch (e) {
          return null;
        }
      });
    }
    function fetchJSON(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        try {
          const res = yield fetch(url, __spreadValues({
            headers: __spreadValues({ "User-Agent": UA, "Accept": "application/json" }, opts.headers),
            signal: AbortSignal.timeout(opts.timeout || 15e3)
          }, opts));
          if (!res.ok) return null;
          return yield res.json();
        } catch (e) {
          return null;
        }
      });
    }
    function similarity(a, b) {
      if (!a || !b) return 0;
      const sa = a.toLowerCase().replace(/[^a-z0-9]/g, "");
      const sb = b.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (sa === sb) return 1;
      if (sa.length < 2 || sb.length < 2) return 0;
      const longer = sa.length > sb.length ? sa : sb;
      const shorter = sa.length > sb.length ? sb : sa;
      const longerLen = longer.length;
      if (longerLen === 0) return 1;
      const bigrams = /* @__PURE__ */ new Map();
      for (let i = 0; i < shorter.length - 1; i++) {
        const bigram = shorter.substring(i, i + 2);
        bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
      }
      let common = 0;
      for (let i = 0; i < longer.length - 1; i++) {
        const bigram = longer.substring(i, i + 2);
        const count = bigrams.get(bigram) || 0;
        if (count > 0) {
          common++;
          bigrams.set(bigram, count - 1);
        }
      }
      return 2 * common / (longerLen + shorter.length - 2);
    }
    function getTMDBInfo(tmdbId, mediaType) {
      return __async(this, null, function* () {
        const type = mediaType === "tv" || mediaType === "tvshow" ? "tv" : "movie";
        const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en`;
        const data = yield fetchJSON(url);
        if (!data) return null;
        return {
          title: data.title || data.name || "",
          year: (data.release_date || data.first_air_date || "").substring(0, 4),
          imdbId: data.imdb_id || ""
        };
      });
    }
    function searchProvider(provider, title, year, mediaType) {
      return __async(this, null, function* () {
        const cfg = provider.search;
        if (!cfg) return null;
        let searchUrl;
        if (typeof cfg.url === "function") {
          searchUrl = cfg.url(provider.baseUrl, title);
        } else {
          searchUrl = provider.baseUrl + cfg.url.replace("{query}", encodeURIComponent(title));
        }
        const html = yield fetchHTML(searchUrl, { headers: cfg.headers });
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
            const titleEl = el.find(cfg.titleSelector).first();
            itemTitle = cfg.titleAttr ? titleEl.attr(cfg.titleAttr) || "" : titleEl.text().trim();
          }
          if (cfg.linkSelector) {
            const linkEl = el.find(cfg.linkSelector).first();
            itemLink = (linkEl.attr("href") || "").trim();
            if (itemLink && !itemLink.startsWith("http")) {
              itemLink = new URL(itemLink, provider.baseUrl).href;
            }
          }
          if (!itemTitle || !itemLink) continue;
          let score = similarity(itemTitle, title);
          if (year) {
            const itemYear = el.text().match(/\b(19|20)\d{2}\b/);
            if (itemYear && itemYear[0] === year) score += 0.2;
          }
          if (score > bestScore && score > 0.4) {
            bestScore = score;
            bestMatch = itemLink;
          }
        }
        return bestMatch;
      });
    }
    function getEpisodeUrl(provider, seriesUrl, season, episode) {
      return __async(this, null, function* () {
        var _a, _b, _c;
        const cfg = provider.episodes;
        if (!cfg) return seriesUrl;
        const html = yield fetchHTML(seriesUrl);
        if (!html) return null;
        const $ = cheerio.load(html);
        if (cfg.type === "post") {
          const formData = new URLSearchParams();
          formData.append(cfg.seasonParam || "season", season);
          formData.append(cfg.episodeParam || "episode", episode);
          if (cfg.extraParams) {
            for (const [k, v] of Object.entries(cfg.extraParams)) {
              formData.append(k, typeof v === "function" ? v($, html) : v);
            }
          }
          const res = yield fetch(cfg.url || seriesUrl, {
            method: "POST",
            headers: __spreadValues({ "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" }, cfg.headers),
            body: formData.toString(),
            signal: AbortSignal.timeout(15e3)
          });
          if (!res.ok) return null;
          const data = yield res.text();
          const $$ = cheerio.load(data);
          const epLink = $$(cfg.episodeSelector).first().attr("href");
          return epLink ? new URL(epLink, provider.baseUrl).href : null;
        }
        if (cfg.type === "season-list") {
          const seasonEls = $(cfg.seasonSelector).toArray();
          for (const sel of seasonEls) {
            const sNum = parseInt(((_a = $(sel).text().match(/\d+/)) == null ? void 0 : _a[0]) || "0");
            if (sNum === season) {
              const seasonUrl = $(sel).attr("href");
              if (seasonUrl) {
                const sHtml = yield fetchHTML(new URL(seasonUrl, provider.baseUrl).href);
                if (sHtml) {
                  const $$ = cheerio.load(sHtml);
                  const epEls = $$(cfg.episodeSelector).toArray();
                  for (const eel of epEls) {
                    const eNum = parseInt(((_b = $$(eel).text().match(/\d+/)) == null ? void 0 : _b[0]) || "0");
                    if (eNum === episode) {
                      const epUrl = $$(eel).attr("href");
                      return epUrl ? new URL(epUrl, provider.baseUrl).href : null;
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
              if (ep) return new URL(ep.url || ep.link, provider.baseUrl).href;
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
              for (const key of cfg.dataPath.split(".")) {
                obj = obj == null ? void 0 : obj[key];
              }
              if (obj == null ? void 0 : obj.seasons) {
                for (const s of obj.seasons) {
                  if (s.number == season) {
                    const ep = (_c = s.episodes) == null ? void 0 : _c.find((e) => e.number == episode);
                    if (ep == null ? void 0 : ep.url) return new URL(ep.url, provider.baseUrl).href;
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
        const html = yield fetchHTML(pageUrl);
        if (!html) return [];
        const $ = cheerio.load(html);
        const results = [];
        if (cfg.type === "iframe") {
          const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
          const iframes = container.find(cfg.iframeSelector || "iframe").toArray();
          for (const iframe of iframes) {
            const src = $(iframe).attr(cfg.srcAttr || "src");
            if (src) {
              const url = src.startsWith("//") ? "https:" + src : src;
              results.push({ url, server: detectServer(url), quality: cfg.defaultQuality || "HD" });
            }
          }
        }
        if (cfg.type === "nextjs") {
          const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
          if (!match) {
            const match2 = html.match(/<script type="application\/json"[^>]*>(.*?)<\/script>/);
            if (match2) {
              try {
                const data = JSON.parse(match2[1]);
                let obj = data;
                for (const key of cfg.dataPath.split(".")) obj = obj == null ? void 0 : obj[key];
                if (obj) {
                  for (const [lang, players] of Object.entries(obj)) {
                    if (Array.isArray(players)) {
                      for (const p of players) {
                        results.push({
                          url: p.result || p.url || p.link,
                          server: p.cyberlocker || p.server || detectServer(p.result || p.url),
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
          } else {
            try {
              const data = JSON.parse(match[1]);
              let obj = data;
              for (const key of cfg.dataPath.split(".")) obj = obj == null ? void 0 : obj[key];
              if (obj) {
                for (const [lang, players] of Object.entries(obj)) {
                  if (Array.isArray(players)) {
                    for (const p of players) {
                      results.push({
                        url: p.result || p.url || p.link,
                        server: p.cyberlocker || p.server || detectServer(p.result || p.url),
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
                const url = Array.isArray(v) ? v[1] : v.url || v.link || v.code;
                if (url) {
                  results.push({
                    url,
                    server: server || detectServer(url),
                    quality: v.quality || cfg.defaultQuality || "HD"
                  });
                }
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "api") {
          const apiUrl = typeof cfg.apiUrl === "function" ? cfg.apiUrl(provider.baseUrl, pageUrl, html) : provider.baseUrl + cfg.apiUrl;
          const data = yield fetchJSON(apiUrl, { headers: cfg.headers });
          if (data) {
            const sources = data.sources || data.data || data;
            for (const s of Array.isArray(sources) ? sources : []) {
              results.push({
                url: s.url || s.file || s.link || s.src,
                server: s.server || detectServer(s.url || s.file),
                quality: s.quality || s.label || cfg.defaultQuality || "HD"
              });
            }
          }
        }
        if (cfg.type === "torrent") {
          const links = $(cfg.linkSelector || 'a[href*="magnet"], a[href*=".torrent"]').toArray();
          for (const link of links) {
            const href = $(link).attr("href");
            if (href && (href.startsWith("magnet:") || href.endsWith(".torrent"))) {
              const title = $(link).text().trim() || cfg.defaultQuality || "HD";
              results.push({
                url: href,
                server: "torrent",
                quality: title
              });
            }
          }
        }
        return results;
      });
    }
    function detectServer(url) {
      if (!url) return "direct";
      const patterns = {
        "streamwish": /streamwish\./i,
        "filemoon": /filemoon\./i,
        "voes": /voes\./i,
        "doodstream": /dood\.|doodstream\./i,
        "streamtape": /streamtape\./i,
        "fembed": /fembed\.|fembeds\./i,
        "okru": /ok\.ru|odnoklassniki/i,
        "mixdrop": /mixdrop\./i,
        "upstream": /upstream\./i,
        "vidhide": /vidhide|vidpro/i,
        "voe": /voe\.sx|voe\./i,
        "wolfmax": /wolfmax\./i,
        "mega": /mega\.nz/i,
        "gvideo": /drive\.google\.|googlevideo/i,
        "youtube": /youtube\.|youtu\.be/i,
        "mystream": /mystream\./i,
        "netutv": /netu\.tv|netutv/i,
        "yourupload": /yourupload\./i,
        "jawcloud": /jawcloud\./i,
        "streampe": /streampe\./i,
        "directo": /\.mp4|\.m3u8|\.mkv|\.webm|\.avi/i,
        "torrent": /magnet:|\btorrent\b/i
      };
      for (const [name, pattern] of Object.entries(patterns)) {
        if (pattern.test(url)) return name;
      }
      return "unknown";
    }
    function resolveVideoUrl2(url, server) {
      return __async(this, null, function* () {
        if (!url) return null;
        if (/\.(mp4|m3u8|mkv|webm|avi)(\?|$)/i.test(url)) return url;
        if (url.startsWith("magnet:")) return url;
        const resolvers = {
          "streamwish": resolveStreamwish,
          "filemoon": resolveFilemoon,
          "voes": resolveVoes,
          "doodstream": resolveDoodstream,
          "streamtape": resolveStreamtape,
          "fembed": resolveFembed,
          "okru": resolveOkru,
          "mixdrop": resolveMixdrop,
          "upstream": resolveUpstream,
          "vidhide": resolveVidhide,
          "voe": resolveVoe,
          "mystream": resolveMystream,
          "netutv": resolveNetuTV,
          "yourupload": resolveYourUpload,
          "jawcloud": resolveJawcloud,
          "streampe": resolveStreampe,
          "gvideo": resolveGvideo,
          "directo": (url2) => url2
        };
        const resolver = resolvers[server] || resolvers[detectServer(url)] || resolveGeneric;
        try {
          return yield resolver(url);
        } catch (e) {
          return null;
        }
      });
    }
    function resolveStreamwish(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/file:\s*"([^"]+)"/) || html.match(/src:\s*"([^"]+)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveFilemoon(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/file:\s*"([^"]+)"/) || html.match(/src:\s*"([^"]+)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveVoes(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveDoodstream(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/\$\.get\('([^']+)'/);
        if (match) {
          const passUrl = new URL(match[1], url).href;
          const data = yield fetchHTML(passUrl);
          if (data) return data.trim();
        }
        const directMatch = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (directMatch == null ? void 0 : directMatch[1]) || null;
      });
    }
    function resolveStreamtape(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/robotlink'\s*\.\s*innerHTML\s*=\s*'([^']+)'/);
        if (match) {
          const token = match[1].replace(/&amp;/g, "&");
          const fullUrl = "https:/" + token;
          const data = yield fetchHTML(fullUrl);
          if (data) {
            const vidMatch = data.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || data.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
            return (vidMatch == null ? void 0 : vidMatch[1]) || null;
          }
        }
        return null;
      });
    }
    function resolveFembed(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveOkru(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveMixdrop(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveUpstream(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveVidhide(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/file:\s*"([^"]+)"/) || html.match(/src:\s*"([^"]+)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveVoe(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveMystream(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveNetuTV(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveYourUpload(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveJawcloud(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveStreampe(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    function resolveGvideo(url) {
      return __async(this, null, function* () {
        const match = url.match(/\/d\/([^/]+)/);
        if (match) {
          const confirm = yield fetchHTML(`https://drive.google.com/uc?export=download&id=${match[1]}`);
          if (confirm) {
            const dlMatch = confirm.match(/href="(\/uc\?export=download[^"]+)"/);
            if (dlMatch) return `https://drive.google.com${dlMatch[1].replace(/&amp;/g, "&")}`;
            return `https://drive.google.com/uc?export=download&id=${match[1]}`;
          }
        }
        return url;
      });
    }
    function resolveGeneric(url) {
      return __async(this, null, function* () {
        const html = yield fetchHTML(url);
        if (!html) return null;
        const match = html.match(/src:\s*"([^"]+\.(?:m3u8|mp4|mkv|webm)[^"]*)"/) || html.match(/file:\s*"([^"]+)"/) || html.match(/source\s+src="([^"]+)"/) || html.match(/videoSrc\s*=\s*"([^"]+)"/);
        return (match == null ? void 0 : match[1]) || null;
      });
    }
    module2.exports = {
      fetchHTML,
      fetchJSON,
      similarity,
      getTMDBInfo,
      searchProvider,
      getEpisodeUrl,
      extractVideos: extractVideos2,
      resolveVideoUrl: resolveVideoUrl2,
      detectServer
    };
  }
});

// src/alfa-providers/index.js
var providers = require_providers();
var { searchContent, getEpisodes, extractVideos, resolveVideoUrl } = require_engine();
function scrapeAlfaProviders(type, id, season, episode) {
  return __async(this, null, function* () {
    const results = [];
    const mediaType = type === "series" ? "tvshow" : type;
    const activeProviders = providers.filter(
      (p) => p.active && p.categories.includes(mediaType) && !p.adult
    );
    const chunks = chunkArray(activeProviders, 5);
    for (const chunk of chunks) {
      const chunkResults = yield Promise.allSettled(
        chunk.map((provider) => __async(null, null, function* () {
          try {
            const contentUrl = yield searchContent(provider, id, mediaType, season, episode);
            if (!contentUrl) return [];
            let videoUrls;
            if (mediaType === "tvshow" && season && episode) {
              const epUrl = yield getEpisodes(provider, contentUrl, season, episode);
              if (!epUrl) return [];
              videoUrls = yield extractVideos(provider, epUrl);
            } else {
              videoUrls = yield extractVideos(provider, contentUrl);
            }
            const streams = [];
            for (const v of videoUrls) {
              const resolved = yield resolveVideoUrl(v.url, v.server);
              if (resolved) {
                streams.push({
                  name: v.quality || "HD",
                  description: `${provider.title} [${v.server || "direct"}]`,
                  url: resolved,
                  behaviorHints: { notWebReady: true }
                });
              }
            }
            return streams;
          } catch (e) {
            return [];
          }
        }))
      );
      for (const r of chunkResults) {
        if (r.status === "fulfilled") results.push(...r.value);
      }
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
