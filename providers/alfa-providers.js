/**
 * alfa-providers - Built from src/alfa-providers/
 * Generated: 2026-06-19T19:09:04.482Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
      {
        name: "allcalidad",
        title: "AllCalidad",
        baseUrl: "https://allcalidad.re",
        categories: ["movie", "direct"],
        language: ["lat"],
        active: false,
        // JS-dependent SPA: search results render client-side, no items in static HTML
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: "body", iframeSelector: "iframe", srcAttr: "data-src", defaultQuality: "HD" }
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
        search: { url: "/?s={query}", itemSelector: "li", titleSelector: "a[href]", linkSelector: "a" },
        // <-- fixed
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
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: "body", iframeSelector: "iframe", srcAttr: "data-src", defaultQuality: "HD" }
      },
      {
        name: "cinelibreonline",
        title: "CineLibreOnline",
        baseUrl: "https://www.cinelibreonline.com",
        categories: ["movie", "direct"],
        language: ["lat"],
        active: false,
        // YouTube embeds only + Blogspot format not scrapeable
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2.entry-title a", linkSelector: "h2.entry-title a" },
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
        search: { url: "/?s={query}", itemSelector: "li", titleSelector: "a[href]", linkSelector: "a" },
        // <-- fixed
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
        search: { url: "/?s={query}", itemSelector: 'table tr:has(td a[href*="/peliculas"])', titleSelector: 'td a[href*="/peliculas"]', linkSelector: 'td a[href*="/peliculas"]' },
        videos: { type: "torrent", linkSelector: 'a[href*="download_tt.php"], a[href*="s.php"], a[class*="linktorrent"], a[class*="opcion"]', defaultQuality: "HD" }
      },
      {
        name: "dontorrent",
        title: "DonTorrent",
        baseUrl: "https://dontorrent.support",
        categories: ["movie", "tvshow", "vos", "torrent"],
        language: ["cast"],
        active: true,
        adult: false,
        search: { method: "POST", url: "/buscar", body: "valor={query}", contentType: "application/x-www-form-urlencoded", itemSelector: 'a[href*="/pelicula/"], a[href*="/serie/"]', titleSelector: "&", linkSelector: "&" },
        episodes: { type: "dontorrent" },
        videos: { type: "dontorrent", defaultQuality: "HD" }
      },
      {
        name: "doramasflix",
        title: "DoramasFlix",
        baseUrl: "https://doramasflix.co",
        categories: ["movie", "tvshow"],
        language: ["cast", "lat", "vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "div.embla__slide_carousel", titleSelector: "img[alt]", linkSelector: "a", titleAttr: "alt" },
        // <-- fixed
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
        search: { url: "/?s={query}", itemSelector: "li", titleSelector: "h2", linkSelector: "a" },
        // <-- fixed
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
        search: { url: "/?s={query}", itemSelector: "div.jeg_content", titleSelector: "img[alt]", linkSelector: "a", titleAttr: "alt" },
        // <-- fixed
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
        active: false,
        // disabled: download links route through super-enlace.com which uses anti-bot POST shortener
        adult: false,
        search: { url: "/?s={query}", itemSelector: 'div.relative a[href*="/"][href*="-"]:not([href*="categoria"]):not([href*="genero"])', titleSelector: "img", titleAttr: "alt", linkSelector: "&" },
        videos: { type: "torrent", linkSelector: 'a[href*="s.php"], a[class*="linktorrent"], a[class*="descargar"]', defaultQuality: "HD" }
      },
      {
        name: "hdfull",
        title: "HDFull",
        baseUrl: "https://hdfull.today",
        categories: ["movie", "tvshow", "vos"],
        language: ["cast", "lat"],
        active: false,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        episodes: { type: "post", url: null, seasonParam: "season", episodeParam: "episode", extraParams: { action: "season", show: null }, episodeSelector: "a" },
        videos: { type: "iframe", containerSelector: ".player-container", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "legalmentegratis",
        title: "LegalmenteGratis",
        baseUrl: "https://legalmentegratis.com",
        categories: ["movie", "vos"],
        language: ["cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2.entry-title a", linkSelector: "h2.entry-title a" },
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
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "a[title]", linkSelector: "a", titleAttr: "title" },
        // <-- fixed
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "mitorrent",
        title: "MiTorrent",
        baseUrl: "https://mitorrent.mx",
        categories: ["movie", "tvshow", "torrent"],
        language: ["lat"],
        active: false,
        // disabled: download links route through acortalink.net which uses anti-bot POST shortener
        adult: false,
        search: { url: "/?s={query}", itemSelector: "div.browse-movie-wrap", titleSelector: "div.browse-movie-bottom a", linkSelector: "div.browse-movie-bottom a" },
        videos: { type: "torrent", linkSelector: 'a[href*="s.php"], a[class*="torrent-modal-download"], a[class*="quality-download"]', defaultQuality: "HD" }
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
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: "body", iframeSelector: "iframe", srcAttr: "data-src", defaultQuality: "HD" }
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
        videos: { type: "iframe-chain", containerSelector: "section.player", iframeSelector: "iframe[data-src]", srcAttr: "data-src", defaultQuality: "HD" }
      },
      {
        name: "poseidonhd",
        title: "PoseidonHD",
        baseUrl: "https://www.poseidonhd2.co",
        categories: ["movie", "tvshow", "vos", "direct"],
        language: ["lat"],
        active: true,
        adult: false,
        search: { url: "/search?q={query}", itemSelector: "__NEXT_DATA__", jsonDataPath: "props.pageProps.movies", titleSelector: "titles.name", linkSelector: "url.slug" },
        videos: { type: "nextjs", dataPath: "props.pageProps.movieData.players", defaultQuality: "HD" }
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
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h3", linkSelector: "a" },
        // <-- fixed
        videos: { type: "iframe", containerSelector: "body", iframeSelector: "iframe", defaultQuality: "HD", srcAttr: "src" }
        // <-- fixed
      },
      {
        name: "tubeonline",
        title: "TubeOnline",
        baseUrl: "https://www.tubeonline.net",
        categories: ["movie", "tvshow"],
        language: ["lat", "cast", "vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "li", titleSelector: "a[href]", linkSelector: "a" },
        // <-- fixed
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
        search: { url: "/?s={query}", itemSelector: "li.peli_bx", titleSelector: "h2", linkSelector: "a" },
        // <-- fixed
        videos: { type: "iframe", containerSelector: "body", iframeSelector: "iframe", defaultQuality: "HD", srcAttr: "data-src" }
        // <-- fixed
      },
      {
        name: "wolfmax4k",
        title: "WolfMax4K",
        baseUrl: "https://wolfmax4k.com",
        categories: ["movie", "tvshow", "torrent"],
        language: ["cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "div.mb-4", titleSelector: "h3", linkSelector: "a" },
        // <-- fixed
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
        search: { url: "/?s={query}", itemSelector: "li", titleSelector: "a[href]", linkSelector: "a" },
        // <-- fixed
        videos: { type: "iframe", containerSelector: "body", iframeSelector: "iframe", defaultQuality: "HD", srcAttr: "src" }
        // <-- fixed
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
      {
        name: "doramasyt",
        title: "DoramasYT",
        baseUrl: "https://www.doramasyt.com",
        categories: ["tvshow", "vos"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h3", linkSelector: "a" },
        // <-- fixed
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
        active: false,
        // 404 - site moved or changed URL
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
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h3.Title", linkSelector: "a" },
        episodes: { type: "season-list", seasonSelector: ".season-list a", episodeSelector: ".episode-list a" },
        videos: { type: "iframe", containerSelector: "body", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "animeflv",
        title: "AnimeFLV",
        baseUrl: "https://www3.animeflv.net",
        categories: ["anime"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        episodes: { type: "url", pattern: "/ver/{slug}-{episode}" },
        search: { url: "/browse?q={query}", itemSelector: "ul.ListAnimes li", titleSelector: "h3.Title", linkSelector: "a" },
        videos: { type: "jsvar", varPattern: /var videos = ([^;]+);/, defaultQuality: "HD" }
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
        search: { url: "/search?keyword={query}", itemSelector: "a.film-poster-ahref", titleSelector: "a[title]", titleAttr: "title", linkSelector: "&" },
        // <-- fixed
        videos: { type: "iframe", containerSelector: "body", iframeSelector: "iframe", defaultQuality: "HD", srcAttr: "src" }
        // <-- fixed
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
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h3.Title", linkSelector: "a" },
        // <-- fixed
        videos: { type: "iframe", containerSelector: "body", iframeSelector: "iframe", defaultQuality: "HD" }
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
        videos: { type: "jkplayer", varPattern: /video\[\d+\] = '(.*?)';/g, defaultQuality: "HD" }
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
        search: { url: "/busquedas/?donghua={query}", itemSelector: '.md-card:has(a[href*="/donghua/"])', titleSelector: ".md-card-title", linkSelector: "a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "pelispanda",
        title: "PelisPanda",
        baseUrl: "https://pelispanda.org",
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
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: ".card", titleSelector: "h2", linkSelector: "a" },
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
        videos: { type: "iframe", containerSelector: "body", iframeSelector: "iframe", defaultQuality: "HD", srcAttr: "src" }
        // <-- fixed
      },
      {
        name: "tioanime",
        title: "TioAnime",
        baseUrl: "https://tioanime.com",
        categories: ["anime", "vos"],
        language: ["*"],
        active: true,
        adult: false,
        search: { url: "/directorio?q={query}", itemSelector: "ul.animes li", titleSelector: "h3.title", linkSelector: "a" },
        // <-- fixed
        episodes: { type: "url", pattern: "/ver/{slug}-{episode}" },
        videos: { type: "jsvar", varPattern: /var videos = ([^;]+);/, defaultQuality: "HD" }
      },
      {
        name: "tiodonghua",
        title: "TioDonghua",
        baseUrl: "https://tiodonghua.com",
        categories: ["anime", "vos"],
        language: ["vose"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h3", linkSelector: "a" },
        // <-- fixed
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
        search: { url: "/animes?buscar={query}", itemSelector: "div.accordion-item", titleSelector: "h2", titleAttr: "alt", linkSelector: "a" },
        // <-- fixed
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
      {
        name: "areadocumental",
        title: "AreaDocumental",
        baseUrl: "https://www.area-documental.com",
        categories: ["documentary"],
        language: ["cast", "lat"],
        active: true,
        adult: false,
        search: { url: "/search/{query}", itemSelector: 'div.col-md-2:has(a[href*="player.php"])', titleSelector: 'a[href*="player.php"]', linkSelector: 'a[href*="player.php"]' },
        videos: { type: "iframe", containerSelector: ".player", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "documentalesonline",
        title: "DocumentalesOnline",
        baseUrl: "https://www.documentales-online.com",
        categories: ["documentary"],
        language: ["cast", "lat"],
        active: false,
        // mostly YouTube embeds + ad iframes, not useful
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2 a", linkSelector: "h2 a" },
        videos: { type: "iframe", containerSelector: ".entry-content", iframeSelector: "iframe", defaultQuality: "HD" }
      },
      {
        name: "elitetorrent",
        title: "EliteTorrent",
        baseUrl: "https://elitetorrent.com",
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
        baseUrl: "https://www.mejortorrent.net",
        categories: ["movie", "tvshow", "torrent"],
        language: ["cast"],
        active: true,
        adult: false,
        search: { url: "/?s={query}", itemSelector: "article", titleSelector: "h2", linkSelector: "a" },
        videos: { type: "torrent", linkSelector: 'a[href*="magnet"], a[href*=".torrent"]', defaultQuality: "HD" }
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
        active: false,
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

// src/alfa-providers/embed-resolver.js
var require_embed_resolver = __commonJS({
  "src/alfa-providers/embed-resolver.js"(exports2, module2) {
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var EMBED_TIMEOUT = 1e4;
    var embedCache = /* @__PURE__ */ new Map();
    function fetchWithTimeout(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), opts.timeout || EMBED_TIMEOUT);
        try {
          const res = yield fetch(url, {
            headers: __spreadValues({ "User-Agent": UA2 }, opts.headers),
            signal: ctrl.signal,
            redirect: "follow"
          });
          return res;
        } finally {
          clearTimeout(t);
        }
      });
    }
    function htmlText(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        try {
          const res = yield fetchWithTimeout(url, {
            headers: __spreadValues({ "Accept": "text/html,application/xhtml+xml,*/*" }, opts.headers),
            timeout: opts.timeout || EMBED_TIMEOUT
          });
          if (!res.ok) return null;
          return yield res.text();
        } catch (e) {
          return null;
        }
      });
    }
    function resolveStreamwish(html, url) {
      return __async(this, null, function* () {
        const dataMatch = html.match(/const\s+_0xa\w*\s*=\s*(\{[^}]+\})/);
        if (dataMatch) {
          try {
            const obj = JSON.parse(dataMatch[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":'));
            const keys = Object.values(obj);
            for (const key of keys) {
              if (typeof key === "string" && key.length > 20 && /^[A-Za-z0-9+/=]+$/.test(key) && !key.startsWith("http")) {
                try {
                  const d = Buffer.from(key, "base64").toString();
                  if (d.includes("m3u8") || d.includes("mp4")) return d;
                } catch (e) {
                }
              }
            }
          } catch (e) {
          }
        }
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        const evalMatch = html.match(/eval\s*\(([^)]+)\)/);
        if (evalMatch) {
          try {
            const decoded = Buffer.from(evalMatch[1].replace(/['"]/g, ""), "base64").toString();
            const m = decoded.match(/https?:\/\/[^"'\\]+\.m3u8[^"'\\]*/);
            if (m) return m[0];
          } catch (e) {
          }
        }
        return null;
      });
    }
    function resolveFilemoon(html, url) {
      return __async(this, null, function* () {
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        const jsMatch = html.match(/"file"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/i);
        if (jsMatch) return jsMatch[1];
        return null;
      });
    }
    function resolveDoodstream(html, url) {
      return __async(this, null, function* () {
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const passMatch = html.match(/\$.get\('([^']+pass_md5[^']*\.d00dmedia[^']*)'/i);
        if (passMatch) {
          const tokenHtml = yield htmlText(passMatch[1].startsWith("http") ? passMatch[1] : new URL(passMatch[1], url).href, {
            headers: { "Referer": url }
          });
          if (tokenHtml) {
            const m = tokenHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (m) return m[0];
            const parts = tokenHtml.split(" ");
            for (const p of parts) {
              if (p.match(/\.(?:m3u8|mp4)/i) && p.includes("http")) return p.replace(/^[^h]*/, "").trim();
            }
          }
        }
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        return null;
      });
    }
    function resolveMixdrop(html, url) {
      return __async(this, null, function* () {
        const mdMatch = html.match(/"poster"\s*:\s*"[^"]+","wurl"\s*:\s*"([^"]+)"/);
        if (mdMatch) return mdMatch[1].replace(/\\\//g, "/");
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        return null;
      });
    }
    function resolveVoeSx(html, url) {
      return __async(this, null, function* () {
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const evalMatch = html.match(/<script>\s*tm\s*=\s*('(?:\\.|[^'\\])*')/);
        if (evalMatch) {
          try {
            const s = evalMatch[1].slice(1, -1);
            const m = s.match(/https?:\/\/[^"'\\]+\.(?:m3u8|mp4)[^"'\\]*/);
            if (m) return m[0];
          } catch (e) {
          }
        }
        return null;
      });
    }
    function resolveVidHide(html, url) {
      return __async(this, null, function* () {
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        return null;
      });
    }
    function resolveOkRu(html, url) {
      return __async(this, null, function* () {
        var _a;
        const jsMatch = html.match(/data-options="([^"]+)"/);
        if (jsMatch) {
          try {
            const opts = JSON.parse(jsMatch[1].replace(/&quot;/g, '"'));
            const vLink = ((_a = opts.flashvars) == null ? void 0 : _a.metadataUrl) || "";
            if (vLink) {
              const vHtml = yield htmlText(vLink, { headers: { "Referer": "https://ok.ru/" } });
              if (vHtml) {
                const js = vHtml.match(/<script>\s*tm\s*=\s*('(?:\\.|[^'\\])*')/);
                if (js) {
                  try {
                    const s = js[1].slice(1, -1);
                    const m = s.match(/https?:\/\/[^"'\\]+\.(?:m3u8|mp4)[^"'\\]*/);
                    if (m) return m[0];
                  } catch (e) {
                  }
                }
                const m3 = vHtml.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
                if (m3) return m3[0];
              }
            }
          } catch (e) {
          }
        }
        return null;
      });
    }
    function resolveStreamtape(html, url) {
      return __async(this, null, function* () {
        const linkMatch = html.match(/"id="([^"]+robotlink[^"]*)"/i);
        if (linkMatch) {
          const linkId = linkMatch[1];
          const normUrl = linkId.includes("get_video") ? "https://streamtape.com/" + linkId + "&stream=1" : "https://streamtape.com/" + linkId;
          const vHtml = yield htmlText(normUrl, { headers: { "Referer": url } });
          if (vHtml) {
            const m = vHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (m) return m[0];
            const link = vHtml.match(/"link"\s*:\s*"([^"]+)"/);
            if (link) return link[1].replace(/\\\//g, "/");
          }
        }
        const token = html.match(/document\.getElementById\('norobotlink'\)\.innerHTML\s*=\s*["']([^"']+)["']/);
        if (token) {
          const vHtml = yield htmlText("https://streamtape.com/get_video?id=" + token + "&stream=1", { headers: { "Referer": url } });
          if (vHtml) {
            const m = vHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (m) return m[0];
          }
        }
        return null;
      });
    }
    function resolveUpstream(html, url) {
      return __async(this, null, function* () {
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        return null;
      });
    }
    function resolveNetuTv(html, url) {
      return __async(this, null, function* () {
        const evalMatch = html.match(/eval\s*\(([^)]+)\)/);
        if (evalMatch) {
          try {
            const decoded = Buffer.from(evalMatch[1].replace(/['"]/g, ""), "base64").toString();
            const m = decoded.match(/https?:\/\/[^"'\\]+\.(?:m3u8|mp4)[^"'\\]*/);
            if (m) return m[0];
          } catch (e) {
          }
        }
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        return null;
      });
    }
    function resolveVidmoly(html, url) {
      return __async(this, null, function* () {
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        return null;
      });
    }
    function tryResolveJWPlayer(html, referer) {
      return __async(this, null, function* () {
        const scripts = [];
        const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        let m;
        while ((m = re.exec(html)) !== null) {
          const text = m[1];
          if (text.length > 10) scripts.push(text);
        }
        for (const script of scripts) {
          if (!script.includes("jwplayer") && !script.includes("sources") && !script.includes("playlist")) continue;
          const fileMatch = script.match(/["']file["']\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
          if (fileMatch) return fileMatch[1];
          const setupMatch = script.match(/jwplayer\s*\(\s*["'][^"']*["']\s*\)\s*\.\s*setup\s*\(\s*(\{[\s\S]*?\})\s*\)\s*;/);
          if (setupMatch) {
            try {
              const config = JSON.parse(
                setupMatch[1].replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3').replace(/'/g, '"')
              );
              if (config.sources && Array.isArray(config.sources)) {
                const sorted = config.sources.filter((s) => s.file).sort((a, b) => {
                  const aLabel = (a.label || "").match(/(\d+)/);
                  const bLabel = (b.label || "").match(/(\d+)/);
                  return (parseInt(bLabel == null ? void 0 : bLabel[1]) || 0) - (parseInt(aLabel == null ? void 0 : aLabel[1]) || 0);
                });
                if (sorted.length > 0) return sorted[0].file;
              }
              if (config.playlist && Array.isArray(config.playlist)) {
                for (const item of config.playlist) {
                  if (item.sources && Array.isArray(item.sources) && item.sources.length > 0) return item.sources[0].file;
                  if (item.file) return item.file;
                }
              }
              if (config.file) return config.file;
            } catch (e) {
            }
          }
          const playlistMatch = script.match(/playlist\s*:\s*(\[[\s\S]*?\])\s*\}/);
          if (playlistMatch) {
            try {
              const playlist = JSON.parse(playlistMatch[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
              if (Array.isArray(playlist)) {
                for (const item of playlist) {
                  if (item.sources && Array.isArray(item.sources) && item.sources.length > 0) return item.sources[0].file;
                  if (item.file) return item.file;
                }
              }
            } catch (e) {
            }
          }
        }
        return null;
      });
    }
    function tryResolveGeneric(embedUrl, referer) {
      return __async(this, null, function* () {
        const html = yield htmlText(embedUrl, {
          headers: { "Referer": referer || embedUrl }
        });
        if (!html) return null;
        const jwUrl = yield tryResolveJWPlayer(html, referer);
        if (jwUrl) return jwUrl.startsWith("//") ? "https:" + jwUrl : jwUrl;
        const patterns = [
          /https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i,
          /https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i
        ];
        for (const p of patterns) {
          const match = html.match(p);
          if (match) return match[0];
        }
        const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        if (iframeMatch) {
          const iframeUrl = iframeMatch[1].startsWith("//") ? "https:" + iframeMatch[1] : iframeMatch[1];
          if (iframeUrl !== embedUrl && iframeUrl !== referer) {
            return yield resolveEmbed(iframeUrl, embedUrl);
          }
        }
        return null;
      });
    }
    function getHostname(url) {
      try {
        return new URL(url).hostname.toLowerCase();
      } catch (e) {
        return "";
      }
    }
    function resolveEmbed(embedUrl, referer) {
      return __async(this, null, function* () {
        if (!embedUrl) return null;
        if (embedCache.has(embedUrl)) return embedCache.get(embedUrl) || null;
        const host = getHostname(embedUrl);
        let html = null;
        let result = null;
        const hostRules = [
          { pat: /streamwish|wish\.com|swdyu|sfastwish|wishembed|wishy|watchwish/i, fn: resolveStreamwish, needHtml: true },
          { pat: /filemoon|filemoon\.sx|kerapoxy|moplay|moon\.sx|moonplayer/i, fn: resolveFilemoon, needHtml: true },
          { pat: /dood\.|doodstream|dood\.la|dood\.to|dood\.ws|dood\.wf|dood\.re|dood\.so|dood\.sh|dood\.pm|dood\.yt|dooood|ds2play/i, fn: resolveDoodstream, needHtml: true },
          { pat: /mixdrop|mixdrop\.co|mixdrop\.ag|mixdrop\.vc|mixdrop\.to|mixdrop\.ch|mixdrop\.gl|mixdrp/i, fn: resolveMixdrop, needHtml: true },
          { pat: /voe\.sx|voe\.su|vidvodo|voe\.to|voeunblock/i, fn: resolveVoeSx, needHtml: true },
          { pat: /vidhide|vidpro|vidmoly\.to|vidguard|vid2v11/i, fn: resolveVidHide, needHtml: true },
          { pat: /ok\.ru|odnoklassniki/i, fn: resolveOkRu, needHtml: true },
          { pat: /streamtape|strtape|stape\.with|streamta\.to|stpete|tapecontent|streamtape\.com/i, fn: resolveStreamtape, needHtml: true },
          { pat: /upstream\.to|uptostream|uptobox|upstreamcdn/i, fn: resolveUpstream, needHtml: true },
          { pat: /netu\.tv|netutv|anavids|waaw\.tv|hqq\.tv|waaw1|netuplayer/i, fn: resolveNetuTv, needHtml: true },
          { pat: /vidmoly|vidmoly\.to|vidmoly\.net|moly\.to/i, fn: resolveVidmoly, needHtml: true },
          { pat: /vidoza|vidoza\.net|vidozahd/i, fn: null, needHtml: false },
          { pat: /vidlox|vidlox\.tv|vidlox\.net/i, fn: null, needHtml: false },
          { pat: /wolfstream|wolfmax|stream\.wolfmax/i, fn: null, needHtml: false },
          { pat: /mp4upload|mp4upload\.com/i, fn: null, needHtml: false },
          { pat: /streamlare|streamlare\.com/i, fn: null, needHtml: false },
          { pat: /jawcloud|jaw\.cloud/i, fn: null, needHtml: false },
          { pat: /vudeo|vudeo\.net/i, fn: null, needHtml: false },
          { pat: /cloudvideo|cloudvideo\.tv|vidcloud/i, fn: null, needHtml: false }
        ];
        for (const rule of hostRules) {
          if (rule.pat.test(host)) {
            if (rule.needHtml) {
              html = html || (yield htmlText(embedUrl, { headers: { "Referer": referer || embedUrl } }));
              if (!html) {
                embedCache.set(embedUrl, null);
                return null;
              }
            }
            if (rule.fn) {
              result = yield rule.fn(html || "", embedUrl);
              if (result) {
                result = result.startsWith("//") ? "https:" + result : result;
                embedCache.set(embedUrl, result);
                return result;
              }
            }
            break;
          }
        }
        html = html || (yield htmlText(embedUrl, { headers: { "Referer": referer || embedUrl } }));
        if (html) {
          result = yield tryResolveGeneric(embedUrl, referer);
          if (!result) {
            const jw = yield tryResolveJWPlayer(html, referer);
            result = jw ? jw.startsWith("//") ? "https:" + jw : jw : null;
          }
        }
        if (result) result = result.startsWith("//") ? "https:" + result : result;
        embedCache.set(embedUrl, result || null);
        return result;
      });
    }
    function clearCache() {
      embedCache.clear();
    }
    module2.exports = { resolveEmbed, tryResolveJWPlayer, tryResolveGeneric, clearCache };
  }
});

// src/alfa-providers/torrent-parser.js
var require_torrent_parser = __commonJS({
  "src/alfa-providers/torrent-parser.js"(exports2, module2) {
    var crypto = require("crypto");
    function parseTorrentInfoHash(buf) {
      try {
        const str = buf.toString("latin1");
        const infoStart = str.indexOf("4:info");
        if (infoStart < 0) return null;
        let i = infoStart + 5;
        const start = i;
        while (i < buf.length) {
          const c = String.fromCharCode(buf[i]);
          if (c === "d") i++;
          else if (c === "l") i++;
          else if (c === "e") break;
          else if (c === "i") {
            i = buf.indexOf("e".charCodeAt(0), i);
            if (i < 0) return null;
            i++;
          } else if (c >= "0" && c <= "9") {
            const colon = buf.indexOf(":".charCodeAt(0), i);
            if (colon < 0) return null;
            const len = parseInt(buf.toString("ascii", i, colon), 10);
            i = colon + 1 + len;
          } else {
            i++;
          }
        }
        const infoRaw = buf.slice(start, i);
        return crypto.createHash("sha1").update(infoRaw).digest("hex").toLowerCase();
      } catch (e) {
        return null;
      }
    }
    module2.exports = { parseTorrentInfoHash };
  }
});

// src/alfa-providers/shortener-resolver.js
var require_shortener_resolver = __commonJS({
  "src/alfa-providers/shortener-resolver.js"(exports2, module2) {
    var { parseTorrentInfoHash } = require_torrent_parser();
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.0";
    var MAX_REDIRECTS = 5;
    function buildTorrentResult(url, label, quality, buf) {
      const infoHash = buf ? parseTorrentInfoHash(buf) : null;
      const result = __spreadValues(__spreadValues(__spreadValues({
        url,
        server: "torrent",
        quality: quality || "HD"
      }, infoHash ? { infoHash } : {}), infoHash ? { sources: ["dht:" + infoHash] } : {}), label ? { filename: label } : {});
      return result;
    }
    function parseMagnet(magnetUrl, label, quality) {
      const infoHashMatch = magnetUrl.match(/urn:btih:([a-fA-F0-9]{40})/i);
      const sources = [];
      const trRe = /tr=([^&]+)/g;
      let m;
      while ((m = trRe.exec(magnetUrl)) !== null) {
        const trackerUrl = decodeURIComponent(m[1]);
        if (/^(udp|http|https|ws):\/\//.test(trackerUrl)) {
          sources.push(trackerUrl);
        }
      }
      if (infoHashMatch) sources.push("dht:" + infoHashMatch[1].toLowerCase());
      return __spreadValues(__spreadValues(__spreadValues({
        url: magnetUrl,
        server: "torrent",
        quality: quality || "HD"
      }, infoHashMatch ? { infoHash: infoHashMatch[1].toLowerCase() } : {}), sources.length ? { sources } : {}), label ? { filename: label } : {});
    }
    function fetchBuffer(url, headers, timeout = 15e3) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeout);
        try {
          const res = yield fetch(url, { headers, signal: ctrl.signal });
          clearTimeout(t);
          if (!res.ok) return null;
          return Buffer.from(yield res.arrayBuffer());
        } catch (e) {
          clearTimeout(t);
          return null;
        }
      });
    }
    function fetchText(url, headers, timeout = 15e3) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeout);
        try {
          const res = yield fetch(url, { headers, signal: ctrl.signal });
          clearTimeout(t);
          if (!res.ok) return null;
          return yield res.text();
        } catch (e) {
          clearTimeout(t);
          return null;
        }
      });
    }
    function extractFinalLink(html, baseUrl) {
      const directRe = /(https?:\/\/[^"'\s<>]+\.torrent|magnet:\?xt=[^"'\s<>]+)/gi;
      const matches = html.match(directRe);
      if (matches && matches.length) {
        const unique = [...new Set(matches.map((u) => u.replace(/[)"'<>]+$/, "")))];
        if (unique[0].startsWith("http")) {
          try {
            return new URL(unique[0], baseUrl).href;
          } catch (e) {
            return unique[0];
          }
        }
        return unique[0];
      }
      const metaMatch = html.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*content=["']?\d+\s*;\s*url=([^"'\s>]+)/i);
      if (metaMatch) {
        try {
          return new URL(metaMatch[1], baseUrl).href;
        } catch (e) {
          return metaMatch[1];
        }
      }
      return null;
    }
    function resolveFormShortener(shortUrl, referer) {
      return __async(this, null, function* () {
        const headers = { "User-Agent": UA2, "Referer": referer };
        const html = yield fetchText(shortUrl, headers, 15e3);
        if (!html) return null;
        const formMatch = html.match(/<form[^>]*action=["']([^"']+)["'][^>]*>([\s\S]*?)<\/form>/i);
        if (!formMatch) return null;
        const action = formMatch[1];
        const formBody = formMatch[2];
        const inputs = [];
        const inputRe = /<input[^>]*name=["']([^"']+)["'][^>]*value=["']([^"']*)["'][^>]*>/gi;
        let im;
        while ((im = inputRe.exec(formBody)) !== null) {
          inputs.push({ name: im[1], value: im[2] });
        }
        const linkser = inputs.find((i) => i.name === "linkser");
        if (!linkser) return null;
        const postUrl = action.startsWith("http") ? action : new URL(action, shortUrl).href;
        const body = inputs.map((i) => `${encodeURIComponent(i.name)}=${encodeURIComponent(i.value)}`).join("&");
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15e3);
        try {
          const res = yield fetch(postUrl, {
            method: "POST",
            headers: {
              "User-Agent": UA2,
              "Referer": shortUrl,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body,
            redirect: "manual",
            signal: ctrl.signal
          });
          clearTimeout(t);
          const text = yield res.text();
          const final = extractFinalLink(text, postUrl) || res.headers.get("location");
          if (final) {
            if (final.startsWith("http") && final.endsWith(".torrent")) {
              const buf = yield fetchBuffer(final, { "User-Agent": UA2, "Referer": postUrl }, 15e3);
              return buildTorrentResult(final, null, null, buf);
            }
            if (final.startsWith("magnet:")) return parseMagnet(final, null, null);
          }
        } catch (e) {
          clearTimeout(t);
        }
        return null;
      });
    }
    function followRedirect(url, referer, depth = 0) {
      return __async(this, null, function* () {
        if (depth >= MAX_REDIRECTS) return null;
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15e3);
        try {
          const res = yield fetch(url, {
            headers: { "User-Agent": UA2, "Referer": referer },
            redirect: "manual",
            signal: ctrl.signal
          });
          clearTimeout(t);
          const location = res.headers.get("location");
          if (location) {
            const next = location.startsWith("http") ? location : new URL(location, url).href;
            if (next.endsWith(".torrent")) {
              const buf = yield fetchBuffer(next, { "User-Agent": UA2, "Referer": url }, 15e3);
              return buildTorrentResult(next, null, null, buf);
            }
            if (next.startsWith("magnet:")) return parseMagnet(next, null, null);
            return followRedirect(next, url, depth + 1);
          }
          const text = yield res.text();
          const final = extractFinalLink(text, url);
          if (final) {
            if (final.startsWith("http") && final.endsWith(".torrent")) {
              const buf = yield fetchBuffer(final, { "User-Agent": UA2, "Referer": url }, 15e3);
              return buildTorrentResult(final, null, null, buf);
            }
            if (final.startsWith("magnet:")) return parseMagnet(final, null, null);
          }
        } catch (e) {
          clearTimeout(t);
        }
        return null;
      });
    }
    function resolveDownloadTTLink(href, label, quality, referer) {
      return __async(this, null, function* () {
        const uMatch = href.match(/[?&]u=([^&]+)/);
        if (!uMatch) return null;
        try {
          const raw = decodeURIComponent(uMatch[1]).trim();
          let decoded = raw;
          if (/^[A-Za-z0-9+/=]{20,}$/.test(raw)) {
            try {
              const base64Decoded = Buffer.from(raw, "base64").toString("utf-8").trim();
              if (base64Decoded.startsWith("http")) decoded = base64Decoded;
            } catch (e) {
            }
          }
          if (!decoded.startsWith("http") || !decoded.endsWith(".torrent")) return null;
          const buf = yield fetchBuffer(decoded, { "User-Agent": UA2, "Referer": referer }, 15e3);
          if (!buf) return null;
          const result = buildTorrentResult(decoded, label, quality, buf);
          result.url = href;
          return result;
        } catch (e) {
          return null;
        }
      });
    }
    function resolveTorrentLink(href, label, quality, referer) {
      return __async(this, null, function* () {
        if (!href) return null;
        if (href.startsWith("magnet:")) {
          return parseMagnet(href, label, quality);
        }
        const downloadTTResult = yield resolveDownloadTTLink(href, label, quality, referer);
        if (downloadTTResult) return downloadTTResult;
        if (href.endsWith(".torrent")) {
          const buf = yield fetchBuffer(href, { "User-Agent": UA2, "Referer": referer }, 15e3);
          return buildTorrentResult(href, label, quality, buf);
        }
        if (/\/s\.php\?i=/.test(href) || /\/s\.php\?u=/.test(href)) {
          const formResult = yield resolveFormShortener(href, referer);
          if (formResult) {
            if (label) formResult.filename = label;
            if (quality) formResult.quality = quality;
            return formResult;
          }
          return followRedirect(href, referer);
        }
        return null;
      });
    }
    module2.exports = { resolveTorrentLink };
  }
});

// src/scrapeless-proxy/index.js
var require_scrapeless_proxy = __commonJS({
  "src/scrapeless-proxy/index.js"(exports2, module2) {
    var API_BASE = "https://api.scrapeless.com/api/v2/unlocker/request";
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var apiKey = process.env.SCRAPELESS_API_KEY || "";
    var enabled = !!apiKey;
    function configure(key) {
      if (key) {
        apiKey = key;
        enabled = true;
      }
    }
    function isEnabled() {
      return enabled;
    }
    function scrape(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        if (!enabled) return null;
        const input = {
          url,
          method: options.method || "GET",
          redirect: options.redirect !== false,
          headers: options.headers || {}
        };
        if (!input.headers["User-Agent"]) input.headers["User-Agent"] = UA2;
        if (!input.headers["Accept"]) input.headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
        if (!input.headers["Accept-Language"]) input.headers["Accept-Language"] = "es-ES,es;q=0.9,en;q=0.8";
        const body = JSON.stringify({
          actor: "unlocker.webunlocker",
          input,
          proxy: {
            country: options.proxyCountry || "ANY"
          }
        });
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), options.timeout || 3e4);
          const res = yield fetch(API_BASE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-token": apiKey
            },
            body,
            signal: ctrl.signal
          });
          clearTimeout(t);
          if (!res.ok) {
            console.warn(`[scrapeless] HTTP ${res.status} for ${url}`);
            return null;
          }
          const data = yield res.json();
          if (data.body) return data.body;
          if (data.content) return data.content;
          if (data.html) return data.html;
          if (data.text) return data.text;
          if (typeof data === "string") return data;
          if (data.statusCode && data.body) return data.body;
          console.warn(`[scrapeless] unexpected response format for ${url}`);
          return null;
        } catch (e) {
          console.warn(`[scrapeless] error for ${url}: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { scrape, configure, isEnabled };
  }
});

// src/alfa-providers/engine.js
var require_engine = __commonJS({
  "src/alfa-providers/engine.js"(exports2, module2) {
    var cheerio = require("cheerio-without-node-native") || require("cheerio");
    var crypto = require("crypto");
    var { resolveEmbed } = require_embed_resolver();
    var { resolveTorrentLink } = require_shortener_resolver();
    var { parseTorrentInfoHash } = require_torrent_parser();
    var scrapeless = require_scrapeless_proxy();
    var anubisCookieCache = /* @__PURE__ */ new Map();
    function parseSetCookie(sc) {
      if (!sc) return "";
      const semi = sc.indexOf(";");
      return semi > 0 ? sc.substring(0, semi).trim() : sc.trim();
    }
    function solveAnubisPoW(randomData, difficulty) {
      return __async(this, null, function* () {
        const prefix = "0".repeat(difficulty);
        let nonce = 0;
        while (true) {
          const hash = crypto.createHash("sha256").update(randomData + nonce).digest("hex");
          if (hash.startsWith(prefix)) return { nonce, hash };
          nonce++;
        }
      });
    }
    function bypassAnubisChallenge(html, url, verificationCookie) {
      return __async(this, null, function* () {
        const chMatch = html.match(/<script id="anubis_challenge"[^>]*>([\s\S]*?)<\/script>/);
        const baseMatch = html.match(/<script id="anubis_base_prefix"[^>]*>([\s\S]*?)<\/script>/);
        if (!chMatch) return null;
        const parsed = JSON.parse(chMatch[1].trim());
        const challenge = parsed.challenge;
        const basePrefix = baseMatch ? JSON.parse(baseMatch[1].trim()) : "";
        const baseUrl = new URL(url).origin;
        const solution = yield solveAnubisPoW(challenge.randomData, challenge.difficulty || 5);
        const params = new URLSearchParams({
          id: challenge.id,
          response: solution.hash,
          nonce: String(solution.nonce),
          redir: "/",
          elapsedTime: String(Math.floor(Math.random() * 3e3 + 1e3))
        });
        const passUrl = `${baseUrl}${basePrefix}/.within.website/x/cmd/anubis/api/pass-challenge?${params}`;
        const passHeaders = { "User-Agent": UA2 };
        if (verificationCookie) passHeaders["Cookie"] = parseSetCookie(verificationCookie);
        const passRes = yield fetch(passUrl, { headers: passHeaders, redirect: "manual" });
        const cookies = passRes.headers.getSetCookie ? passRes.headers.getSetCookie() : [passRes.headers.get("set-cookie")].filter(Boolean);
        const authCookie = cookies.find((c) => !c.includes("Max-Age=0"));
        if (authCookie) return parseSetCookie(authCookie);
        return null;
      });
    }
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var TMDB_KEY2 = process.env.TMDB_KEY || "d80ba92bc7cefe3359668d30d06f3305";
    function fetchHTML2(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), opts.timeout || 2e4);
          const domain = typeof url === "string" ? new URL(url).hostname : "";
          const cached = anubisCookieCache.get(domain);
          const headers = __spreadValues({ "User-Agent": UA2, "Accept": "text/html,application/xhtml+xml,*/*" }, opts.headers);
          if (cached) headers["Cookie"] = cached;
          const res = yield fetch(url, { headers, signal: ctrl.signal });
          clearTimeout(t);
          if (!res.ok) {
            if (scrapeless.isEnabled()) {
              const scraped = yield scrapeless.scrape(url, { timeout: opts.timeout || 3e4 });
              if (scraped) return scraped;
            }
            return null;
          }
          let html = yield res.text();
          if ((html.includes("challenge-platform") || html.includes("turnstile") || html.includes("Just a moment")) && html.length < 1e4) {
            if (scrapeless.isEnabled()) {
              console.log(`[engine] Cloudflare detected on ${domain}, trying Scrapeless...`);
              const scraped = yield scrapeless.scrape(url, { timeout: opts.timeout || 3e4 });
              if (scraped) return scraped;
            }
          }
          if (html.includes("anubis_challenge")) {
            const initialCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
            const verificationCookie = initialCookies.find((c) => c.includes("cookie-verification")) || "";
            const authCookie = yield bypassAnubisChallenge(html, url, verificationCookie);
            if (authCookie) {
              anubisCookieCache.set(domain, authCookie);
              const ctrl2 = new AbortController();
              const t2 = setTimeout(() => ctrl2.abort(), opts.timeout || 2e4);
              const res2 = yield fetch(url, {
                headers: __spreadProps(__spreadValues({}, headers), { "Cookie": authCookie }),
                signal: ctrl2.signal
              });
              clearTimeout(t2);
              if (!res2.ok) return null;
              html = yield res2.text();
            }
          }
          return html;
        } catch (e) {
          if (scrapeless.isEnabled()) {
            try {
              const scraped = yield scrapeless.scrape(url, { timeout: opts.timeout || 3e4 });
              if (scraped) return scraped;
            } catch (e2) {
            }
          }
          return null;
        }
      });
    }
    function fetchJSON2(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), opts.timeout || 15e3);
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
    function getNested(obj, path) {
      if (!obj || !path) return "";
      const keys = path.split(".");
      let val = obj;
      for (const k of keys) {
        if (val == null) return "";
        val = val[k];
      }
      return typeof val === "string" ? val : val != null ? String(val) : "";
    }
    function similarity2(a, b) {
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
            const results2 = r == null ? void 0 : r[mediaType === "tv" ? "tv_results" : "movie_results"];
            if (results2 == null ? void 0 : results2[0]) tmdbId = results2[0].id;
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
        var _a;
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
            if (cfg.method === "POST") {
              const domain = new URL(searchUrl).hostname;
              const initHtml = yield fetchHTML2(searchUrl, { timeout: 1e4 });
              if (!initHtml) return null;
              try {
                const ctrl = new AbortController();
                const t = setTimeout(() => ctrl.abort(), 12e3);
                const res = yield fetch(searchUrl, {
                  method: "POST",
                  headers: __spreadValues({ "User-Agent": UA2, "Content-Type": "application/x-www-form-urlencoded" }, cfg.headers || {}),
                  body: (cfg.body || "query={query}").replace("{query}", encodeURIComponent(query)),
                  signal: ctrl.signal
                });
                clearTimeout(t);
                if (!res.ok) return null;
                return yield res.text();
              } catch (e) {
                return null;
              }
            }
            return yield fetchHTML2(searchUrl, { headers: cfg.headers, timeout: 1e4 });
          });
        }
        let html = yield trySearch(titleClean);
        if (!html && titleClean.includes(" ")) {
          const words = titleClean.split(" ");
          const first2 = words.slice(0, 2).join(" ");
          if (first2.length > 3) html = yield trySearch(first2);
        }
        if (!html && titleClean.includes(" ")) {
          const first = titleClean.split(" ")[0];
          if (first.length > 3) html = yield trySearch(first);
        }
        if (!html) return null;
        if (cfg.jsonDataPath) {
          try {
            const data = JSON.parse(((_a = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)) == null ? void 0 : _a[1]) || html);
            let items2 = data;
            for (const key of cfg.jsonDataPath.split(".")) items2 = items2 == null ? void 0 : items2[key];
            if (!Array.isArray(items2) || !items2.length) return null;
            let bestMatch2 = null;
            let bestScore2 = 0;
            for (const item of items2) {
              const itemTitle = getNested(item, cfg.titleSelector) || "";
              const itemLinkRaw = getNested(item, cfg.linkSelector) || "";
              if (!itemTitle || !itemLinkRaw) continue;
              const itemLink = itemLinkRaw.startsWith("http") ? itemLinkRaw : itemLinkRaw.startsWith("/") ? new URL(itemLinkRaw, provider.baseUrl).href : `${provider.baseUrl}/${itemLinkRaw}`;
              let score = similarity2(itemTitle, title);
              if (score > bestScore2 && score > 0.4) {
                bestScore2 = score;
                bestMatch2 = itemLink;
              }
            }
            return bestMatch2;
          } catch (e) {
          }
        }
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
          if (titleClean2.length >= 5 && (itemClean.includes(titleClean2) || titleClean2.includes(itemClean))) {
            score = Math.max(score, 0.75);
          }
          if (year) {
            const itemYear = el.text().match(/\b(19|20)\d{2}\b/);
            if (itemYear && itemYear[0] === year) score += 0.25;
          }
          let wordMatch = true;
          const queryWords = titleClean.split(" ").filter((w) => w.length >= 4);
          if (queryWords.length > 0) {
            const itemLower = " " + itemTitle.toLowerCase().replace(/[^a-z0-9]/g, " ") + " ";
            wordMatch = queryWords.some((qw) => itemLower.includes(" " + qw.toLowerCase() + " "));
          }
          if (score > bestScore && score > 0.5 && wordMatch) {
            bestScore = score;
            bestMatch = itemLink;
          }
        }
        if (!bestMatch && items.length > 0) {
          const queryWords = titleClean.toLowerCase().split(" ").filter((w) => w.length >= 3);
          for (const item of items) {
            const el = $(item);
            let itemTitle = "";
            if (cfg.titleSelector) {
              const titleEl = cfg.titleSelector === "&" ? el : el.find(cfg.titleSelector).first();
              itemTitle = cfg.titleAttr ? titleEl.attr(cfg.titleAttr) || "" : titleEl.text().trim();
            }
            let itemLink = "";
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
            const itemLower = itemTitle.toLowerCase();
            const allMatch = queryWords.length > 0 && queryWords.every((qw) => itemLower.includes(qw));
            if (allMatch) {
              bestMatch = itemLink;
              break;
            }
          }
        }
        if (!bestMatch && items.length > 0) {
          const el = $(items[0]);
          let itemLink = "";
          if (cfg.linkSelector) {
            const linkEl = cfg.linkSelector === "&" ? el : el.find(cfg.linkSelector).first();
            itemLink = (linkEl.attr("href") || "").trim();
            if (itemLink && !itemLink.startsWith("http")) {
              try {
                itemLink = new URL(itemLink, provider.baseUrl).href;
              } catch (e) {
                itemLink = "";
              }
            }
          }
          if (itemLink) bestMatch = itemLink;
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
                      if (!results.length) {
                        const mediaRe = /https?:\/\/[^"'\s<>]+\.(?:mp4|m3u8|mkv|webm)[^"'\s<>]*/gi;
                        const seen = /* @__PURE__ */ new Set();
                        let m;
                        while ((m = mediaRe.exec(html)) !== null) {
                          const mediaUrl = m[0].replace(/[)"'<>]+$/, "");
                          if (!seen.has(mediaUrl)) {
                            seen.add(mediaUrl);
                            results.push({ url: mediaUrl, server: "direct", quality: cfg.defaultQuality || "HD" });
                          }
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
        if (cfg.type === "dontorrent") {
          const rows = $("table.table tbody tr").toArray();
          for (const row of rows) {
            const cells = $(row).find("td");
            const epText = $(cells[0]).text().trim();
            const epMatch = epText.match(/(\d+)x(\d+)/);
            if (epMatch && parseInt(epMatch[1]) === season && parseInt(epMatch[2]) === episode) {
              const btn = $(cells[1]).find(".protected-download");
              const contentId = btn.attr("data-content-id");
              const tabla = btn.attr("data-tabla");
              if (contentId && tabla) {
                try {
                  return seriesUrl + "?dt_contentId=" + contentId + "&dt_tabla=" + tabla;
                } catch (e) {
                }
              }
            }
          }
          try {
            const domain = new URL(seriesUrl).hostname;
            const showBase = seriesUrl.split("/").pop().replace(/-\d+-Temporada.*/i, "").replace(/-/g, " ").trim();
            const searchUrl = provider.baseUrl + "/buscar";
            const init = yield fetchHTML2(searchUrl, { timeout: 1e4 });
            if (!init) return null;
            const cookie = anubisCookieCache.get(domain);
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 12e3);
            const sRes = yield fetch(searchUrl, {
              method: "POST",
              headers: __spreadValues({ "User-Agent": UA2, "Content-Type": "application/x-www-form-urlencoded" }, cookie ? { "Cookie": cookie } : {}),
              body: "valor=" + encodeURIComponent(showBase),
              signal: ctrl.signal
            });
            clearTimeout(t);
            if (!sRes.ok) return null;
            const sHtml = yield sRes.text();
            const $$ = cheerio.load(sHtml);
            const seasonLinks = $$('a[href*="/serie/"]').toArray();
            if (!seasonLinks.length) return null;
            for (const sl of seasonLinks) {
              const seasonText = $$(sl).text().trim();
              if (seasonText.includes(season + "\xAA Temporada") || seasonText.includes(season + " Temporada") || new RegExp("\\b" + season + "\\b").test(seasonText)) {
                let seasonUrl = $$(sl).attr("href");
                if (!seasonUrl) continue;
                if (!seasonUrl.startsWith("http")) seasonUrl = provider.baseUrl + seasonUrl;
                const sHtml2 = yield fetchHTML2(seasonUrl, { timeout: 1e4 });
                if (!sHtml2) continue;
                const $$$ = cheerio.load(sHtml2);
                const sRows = $$$("table.table tbody tr").toArray();
                for (const row of sRows) {
                  const cells = $$$(row).find("td");
                  const epText = $$$(cells[0]).text().trim();
                  const epMatch = epText.match(/(\d+)x(\d+)/);
                  if (epMatch && parseInt(epMatch[1]) === season && parseInt(epMatch[2]) === episode) {
                    const btn = $$$(cells[1]).find(".protected-download");
                    const contentId = btn.attr("data-content-id");
                    const tabla = btn.attr("data-tabla");
                    if (contentId && tabla) {
                      try {
                        return seasonUrl + "?dt_contentId=" + contentId + "&dt_tabla=" + tabla;
                      } catch (e) {
                      }
                    }
                  }
                }
              }
            }
          } catch (e) {
          }
          return null;
        }
        return seriesUrl;
      });
    }
    function extractVideos2(provider, pageUrl) {
      return __async(this, null, function* () {
        var _a;
        const cfg = provider.videos;
        if (!cfg) return [];
        const html = yield fetchHTML2(pageUrl);
        if (!html) return [];
        const $ = cheerio.load(html);
        const results2 = [];
        function resolveUrl(val) {
          if (!val) return null;
          if (typeof val === "string" && /^[A-Za-z0-9+/=]{20,}$/.test(val) && !val.startsWith("http")) {
            try {
              const decoded = Buffer.from(val, "base64").toString("utf-8").trim();
              if (decoded.startsWith("http://") || decoded.startsWith("https://")) return decoded;
            } catch (e) {
            }
          }
          if (val.startsWith("//")) return "https:" + val;
          if (val.startsWith("/")) {
            try {
              return new URL(val, pageUrl).href;
            } catch (e) {
              return val;
            }
          }
          return val;
        }
        if (cfg.type === "iframe") {
          const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
          const targets = container.find(cfg.iframeSelector || "iframe").toArray();
          for (const el of targets) {
            const val = $(el).attr(cfg.srcAttr || "src") || $(el).attr("data-src");
            const url = resolveUrl(val);
            if (url) results2.push({ url, server: detectServer2(url), quality: cfg.defaultQuality || "HD" });
          }
          if (!results2.length) {
            const attr = cfg.srcAttr || "data-src";
            const altTargets = container.find("a[" + attr + "]").toArray();
            for (const el of altTargets) {
              const val = $(el).attr(attr);
              const url = resolveUrl(val);
              if (url) results2.push({ url, server: detectServer2(url), quality: cfg.defaultQuality || "HD" });
            }
          }
        }
        if (cfg.type === "iframe-chain") {
          const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
          const iframes = container.find(cfg.iframeSelector || "iframe").toArray();
          const chainUrls = [];
          for (const iframe of iframes) {
            const src = $(iframe).attr(cfg.srcAttr || "src") || $(iframe).attr("data-src");
            if (src) chainUrls.push(src.startsWith("//") ? "https:" + src : src);
          }
          for (const embedUrl of chainUrls) {
            try {
              const body = yield fetchHTML2(embedUrl, { headers: { Referer: pageUrl }, timeout: 1e4 });
              if (!body) continue;
              const $e = cheerio.load(body);
              const realSrc = $e("div.Video iframe, .Video iframe, iframe").first().attr("src");
              if (realSrc) {
                const finalUrl = realSrc.startsWith("//") ? "https:" + realSrc : realSrc;
                results2.push({ url: finalUrl, server: detectServer2(finalUrl), quality: cfg.defaultQuality || "HD" });
              }
            } catch (e) {
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
                      if (pUrl) results2.push({
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
              const data = JSON.parse(match[1]);
              const entries = Array.isArray(data) ? data : Object.values(data).flat();
              for (const v of entries) {
                const server = Array.isArray(v) ? v[0] : v.server || v.name;
                const vUrl = Array.isArray(v) ? v[1] : v.url || v.link || v.code;
                if (vUrl) results2.push({
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
              results2.push({ url: src[1], server: detectServer2(src[1]), quality: cfg.defaultQuality || "HD" });
            }
          }
        }
        if (cfg.type === "jkplayer") {
          const re = cfg.varPattern instanceof RegExp ? cfg.varPattern : new RegExp(cfg.varPattern, "g");
          let m;
          while ((m = re.exec(html)) !== null) {
            const src = (m[1] || "").match(/src=["']([^"']+)["']/);
            if (src) results2.push({ url: src[1], server: detectServer2(src[1]), quality: cfg.defaultQuality || "HD" });
          }
          for (const r of results2) {
            if (!r.url || !r.url.includes("/jkplayer/")) continue;
            try {
              const body = yield fetchHTML2(r.url);
              let vm = body.match(/url:\s*'([^']+\.m3u8[^']*)'/);
              if (!vm) {
                const b64 = body.match(/atob\('([^']+)'\)/);
                if (b64) vm = [null, Buffer.from(b64[1], "base64").toString()];
              }
              if (vm) {
                r.url = vm[1];
                r.server = detectServer2(vm[1]);
              }
            } catch (e) {
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
              if (sUrl) results2.push({
                url: sUrl,
                server: s.server || detectServer2(sUrl),
                quality: s.quality || s.label || cfg.defaultQuality || "HD"
              });
            }
          }
        }
        if (cfg.type === "torrent") {
          const selector = cfg.linkSelector || 'a[href*="magnet:"], a[href$=".torrent"], a[href*="s.php"], a[href*="download_tt.php"], a[class*="torrent"], a[class*="download"], a[class*="descargar"]';
          const links = $(selector).toArray();
          for (const link of links) {
            const href = $(link).attr("href");
            if (!href) continue;
            const label = $(link).text().trim() || "";
            const qualityMatch = label.match(/\b(4K|2160p?|1080p?|720p?|480p?)\b/i);
            const quality = (qualityMatch ? qualityMatch[1] : "") || cfg.defaultQuality || "HD";
            const resolved = yield resolveTorrentLink(href, label, quality, pageUrl);
            if (resolved) results2.push(resolved);
          }
        }
        if (cfg.type === "dontorrent") {
          let contentId, tabla, episodeLabel;
          try {
            const parsed = new URL(pageUrl);
            contentId = parsed.searchParams.get("dt_contentId");
            tabla = parsed.searchParams.get("dt_tabla");
          } catch (e) {
          }
          if (contentId && tabla) {
            episodeLabel = (_a = $("table.table tbody tr").first().find("td").first().text().trim().match(/x(\d+)/)) == null ? void 0 : _a[1];
          }
          if (!contentId || !tabla) {
            const btn = $(".protected-download").first();
            contentId = btn.attr("data-content-id");
            tabla = btn.attr("data-tabla");
            episodeLabel = "";
          }
          if (!contentId || !tabla) return [];
          const torrentInfo = yield downloadDontorrentTorrent(provider.baseUrl, contentId, tabla);
          if (!torrentInfo) return [];
          let quality = cfg.defaultQuality || "HD";
          const fmtMatch = html.match(/Formato:<\/b>\s*([^<]+)/i);
          if (fmtMatch) quality = fmtMatch[1].trim();
          const fnameMatch = torrentInfo.filename.match(/\b(4K|2160p?|1080p?|720p?|480p?|HDTV|HD)\b/i);
          if (fnameMatch) quality = fnameMatch[1];
          results2.push({
            url: torrentInfo.url,
            infoHash: torrentInfo.infoHash,
            server: "torrent",
            quality,
            filename: torrentInfo.filename || (episodeLabel ? "Episode " + episodeLabel : ""),
            sources: ["dht:" + torrentInfo.infoHash]
          });
        }
        const embeds = results2.filter((r) => !r.infoHash && r.url && r.server !== "direct" && r.server !== "torrent");
        const resolvedList = yield Promise.allSettled(embeds.map((r) => tryResolveEmbedToDirect(r.url, pageUrl)));
        for (let i = 0; i < embeds.length; i++) {
          const res = resolvedList[i];
          if (res.status === "fulfilled" && res.value) {
            embeds[i].url = res.value;
            embeds[i].server = "direct";
          }
        }
        return results2;
      });
    }
    function tryResolveEmbedToDirect(embedUrl, referer) {
      return __async(this, null, function* () {
        if (!embedUrl) return null;
        return resolveEmbed(embedUrl, referer);
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
        ["wolfmax", /wolfmax/i]
      ];
      for (const [name, re] of patterns) {
        if (re.test(url)) return name;
      }
      return "embed";
    }
    function solveSha256PoW(challenge, difficulty) {
      let nonce = 0;
      const target = "0".repeat(difficulty);
      while (true) {
        const hash = crypto.createHash("sha256").update(challenge + nonce).digest("hex");
        if (hash.startsWith(target)) return nonce;
        nonce++;
      }
    }
    function downloadDontorrentTorrent(baseUrl, contentId, tabla) {
      return __async(this, null, function* () {
        try {
          const origin = new URL(baseUrl).origin;
          const domain = new URL(baseUrl).hostname;
          const cookie = anubisCookieCache.get(domain);
          function powPost(action, body) {
            return __async(this, null, function* () {
              const ctrl = new AbortController();
              const t = setTimeout(() => ctrl.abort(), 15e3);
              const res = yield fetch(origin + "/api_validate_pow.php", {
                method: "POST",
                headers: __spreadValues({ "User-Agent": UA2, "Content-Type": "application/json" }, cookie ? { "Cookie": cookie } : {}),
                body: JSON.stringify(body),
                signal: ctrl.signal
              });
              clearTimeout(t);
              if (!res.ok) return null;
              return yield res.json();
            });
          }
          const gen = yield powPost("generate", { action: "generate", content_id: parseInt(contentId), tabla });
          if (!gen || !gen.success || !gen.challenge) return null;
          const nonce = solveSha256PoW(gen.challenge, 3);
          const val = yield powPost("validate", { action: "validate", challenge: gen.challenge, nonce });
          if (!val || !val.success || !val.download_url) return null;
          const dlUrl = val.download_url.startsWith("//") ? "https:" + val.download_url : val.download_url.startsWith("/") ? origin + val.download_url : val.download_url;
          const ctrl3 = new AbortController();
          const t3 = setTimeout(() => ctrl3.abort(), 2e4);
          const dlRes = yield fetch(dlUrl, {
            headers: __spreadValues({ "User-Agent": UA2 }, cookie ? { "Cookie": cookie } : {}),
            signal: ctrl3.signal
          });
          clearTimeout(t3);
          if (!dlRes.ok) return null;
          const buf = Buffer.from(yield dlRes.arrayBuffer());
          const infoHash = parseTorrentInfoHash(buf);
          if (!infoHash) return null;
          const filename = decodeURIComponent(dlUrl.split("/").pop()).replace(/\.torrent$/i, "");
          return { url: dlUrl, infoHash, filename };
        } catch (e) {
          return null;
        }
      });
    }
    module2.exports = {
      fetchHTML: fetchHTML2,
      fetchJSON: fetchJSON2,
      similarity: similarity2,
      resolveTMDB,
      searchProvider: searchProvider2,
      getEpisodeUrl: getEpisodeUrl2,
      extractVideos: extractVideos2,
      detectServer: detectServer2,
      tryResolveEmbedToDirect
    };
  }
});

// src/anime/types.js
var require_types = __commonJS({
  "src/anime/types.js"(exports2, module2) {
    var ANIME_SOURCE_PREFIXES = ["animeflv:", "animeav1:", "henaojara:", "tioanime:"];
    var ANIME_XREF_PREFIXES = ["anilist:", "kitsu:", "mal:", "anidb:"];
    var ANIME_LOCAL_PREFIXES = ["ovn-anime:"];
    var ANIME_PREFIXES = [...ANIME_SOURCE_PREFIXES, ...ANIME_XREF_PREFIXES, ...ANIME_LOCAL_PREFIXES];
    var ANIME_GENRE_ID = 16;
    var ANIME_ORIGIN_COUNTRY = "JP";
    var PIGAMER_BASE = process.env.PIGAMER_BASE || "https://pigamer37.alwaysdata.net";
    var AMATSU_BASE2 = "https://amatsu.ruka.pw";
    var ANIME_PROVIDER_IDS = /* @__PURE__ */ new Set([
      "allanime",
      "animekai",
      "animepahe",
      "animesalt",
      "animetsu",
      "animeworld",
      "anime-sama",
      "hianime",
      "allwish",
      "anikototv",
      "onetouchtv"
    ]);
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function isAnimeId2(id) {
      return ANIME_PREFIXES.some((p) => id.startsWith(p) || id.startsWith(p.replace(":", "|")));
    }
    function isAnimeSourceId(id) {
      return ANIME_SOURCE_PREFIXES.some((p) => id.startsWith(p) || id.startsWith(p.replace(":", "|")));
    }
    function isAnimeXrefId(id) {
      return ANIME_XREF_PREFIXES.some((p) => id.startsWith(p) || id.startsWith(p.replace(":", "|")));
    }
    function extractSlug2(id) {
      const parts = id.split(":");
      return parts.length >= 2 ? parts[1] : id;
    }
    function isAnimeProvider(providerId) {
      return ANIME_PROVIDER_IDS.has(providerId);
    }
    module2.exports = {
      ANIME_SOURCE_PREFIXES,
      ANIME_XREF_PREFIXES,
      ANIME_PREFIXES,
      ANIME_GENRE_ID,
      ANIME_ORIGIN_COUNTRY,
      PIGAMER_BASE,
      AMATSU_BASE: AMATSU_BASE2,
      ANIME_PROVIDER_IDS,
      UA: UA2,
      isAnimeId: isAnimeId2,
      isAnimeSourceId,
      isAnimeXrefId,
      extractSlug: extractSlug2,
      isAnimeProvider
    };
  }
});

// src/alfa-providers/index.js
var providers = require_providers();
var { fetchHTML, fetchJSON, similarity, searchProvider, getEpisodeUrl, extractVideos, detectServer } = require_engine();
var { isAnimeId, extractSlug, AMATSU_BASE, UA: ANIME_UA } = require_types();
var TMDB_KEY = process.env.TMDB_KEY || "d80ba92bc7cefe3359668d30d06f3305";
var UA = ANIME_UA;
var titleCache = /* @__PURE__ */ new Map();
var MAX_CACHE = 500;
function cacheSet(key, value) {
  if (titleCache.size >= MAX_CACHE) {
    const firstKey = titleCache.keys().next().value;
    titleCache.delete(firstKey);
  }
  titleCache.set(key, value);
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
      if (id.startsWith("anilist:")) {
        try {
          const ac = new AbortController();
          setTimeout(() => ac.abort(), 4e3);
          const r = yield fetch(`${AMATSU_BASE}/meta/anime/${id}.json`, { headers: { "User-Agent": UA }, signal: ac.signal });
          if (r.ok) {
            const data = yield r.json();
            if (data == null ? void 0 : data.meta) {
              if (data.meta.name) addVariant(data.meta.name, "");
              if (data.meta.englishName && data.meta.englishName !== data.meta.name) addVariant(data.meta.englishName, "");
              if (data.meta.altName && data.meta.altName !== data.meta.name) addVariant(data.meta.altName, "");
              if (Array.isArray(data.meta.synonyms)) {
                for (const syn of data.meta.synonyms) addVariant(syn, "");
              }
            }
          }
        } catch (e) {
        }
      }
    }
    try {
      let tmdbId = id;
      if (id.startsWith("tt")) {
        const findRes = yield fetch(`https://api.themoviedb.org/3/find/${id}?api_key=${TMDB_KEY}&external_source=imdb_id`, {
          headers: { "User-Agent": UA }
        });
        if (findRes.ok) {
          const data = yield findRes.json();
          const results2 = data == null ? void 0 : data[mediaType === "tv" ? "tv_results" : "movie_results"];
          if (results2 == null ? void 0 : results2[0]) tmdbId = String(results2[0].id);
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
    }).sort((a, b) => {
      const ta = a.videos.type === "torrent" || a.videos.type === "dontorrent";
      const tb = b.videos.type === "torrent" || b.videos.type === "dontorrent";
      if (ta && !tb) return -1;
      if (!ta && tb) return 1;
      return 0;
    });
    if (!activeProviders.length) return [];
    const results2 = [];
    const chunks = chunkArray(activeProviders, 4);
    const PER_PROVIDER_TIMEOUT = 1e4;
    for (const chunk of chunks) {
      const chunkResults = yield Promise.allSettled(
        chunk.map((provider) => __async(null, null, function* () {
          const providerTimer = new Promise(
            (_, reject) => setTimeout(() => reject(new Error("provider timeout")), PER_PROVIDER_TIMEOUT)
          );
          try {
            const result = yield Promise.race([
              (() => __async(null, null, function* () {
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
                return videos.map((v) => __spreadProps(__spreadValues(__spreadValues(__spreadValues({
                  name: `${provider.title}
${v.server || detectServer(v.url)}`,
                  title: `${v.quality || "HD"}
\u2699\uFE0F ${v.server || detectServer(v.url)}
\u{1F517} ${provider.title}`,
                  description: v.lang || (category === "anime" && !(Array.isArray(provider.language) && provider.language.includes("*")) ? [.../* @__PURE__ */ new Set([...Array.isArray(provider.language) ? provider.language : [], "ja"])].join(",") : Array.isArray(provider.language) ? provider.language.join(",") : "")
                }, v.url && !v.infoHash ? { url: v.url } : {}), v.infoHash ? { infoHash: v.infoHash } : {}), v.sources ? { sources: v.sources } : {}), {
                  behaviorHints: __spreadValues({
                    notWebReady: !v.infoHash && v.server !== "direct",
                    bingeGroup: `alfa|${provider.name}|${v.server || detectServer(v.url)}`
                  }, v.filename ? { filename: v.filename } : {})
                }));
              }))(),
              providerTimer
            ]);
            return result;
          } catch (e) {
            return [];
          }
        }))
      );
      for (const r of chunkResults) {
        if (r.status === "fulfilled") results2.push(...r.value);
      }
    }
    return results2.slice(0, 60);
  });
}
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}
module.exports = scrapeAlfaProviders;
