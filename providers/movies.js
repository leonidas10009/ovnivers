/**
 * movies - Built from src/movies/
 * Generated: 2026-06-19T19:09:04.542Z
 */
var __getOwnPropNames = Object.getOwnPropertyNames;
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

// src/media/types.js
var require_types = __commonJS({
  "src/media/types.js"(exports2, module2) {
    var QUALITY_TIERS = {
      "4K": 5,
      "2160p": 5,
      "UHD": 5,
      "1080p": 4,
      "FHD": 4,
      "Full HD": 4,
      "720p": 3,
      "HD": 3,
      "480p": 2,
      "SD": 2,
      "360p": 1,
      "CAM": 0,
      "TS": 0,
      "TC": 0,
      "SCR": 0
    };
    var QUALITY_ORDER = ["4K", "1080p", "720p", "480p", "HD", "CAM"];
    var LANG_CODES = {
      es: "Castellano",
      cast: "Castellano",
      castellano: "Castellano",
      espa\u00F1ol: "Castellano",
      espanol: "Castellano",
      lat: "Latino",
      latino: "Latino",
      vose: "VOSE",
      subtitulado: "VOSE",
      en: "English",
      english: "English",
      eng: "English",
      ja: "Japanese",
      japanese: "Japanese",
      jap: "Japanese",
      jp: "Japanese",
      ko: "Korean",
      korean: "Korean",
      hi: "Hindi",
      hindi: "Hindi",
      fr: "French",
      french: "French",
      pt: "Portuguese",
      portuguese: "Portuguese",
      it: "Italian",
      italian: "Italian",
      ar: "Arabic",
      arabic: "Arabic",
      zh: "Chinese",
      chinese: "Chinese",
      de: "German",
      german: "German",
      th: "Thai",
      thai: "Thai",
      ta: "Tamil",
      tamil: "Tamil",
      te: "Telugu",
      telugu: "Telugu"
    };
    var LANG_FLAGS = {
      es: "\u{1F1EA}\u{1F1F8}",
      cast: "\u{1F1EA}\u{1F1F8}",
      lat: "\u{1F1F2}\u{1F1FD}",
      vose: "\u{1F310}",
      en: "\u{1F1EC}\u{1F1E7}",
      ja: "\u{1F1EF}\u{1F1F5}",
      ko: "\u{1F1F0}\u{1F1F7}",
      hi: "\u{1F1EE}\u{1F1F3}",
      fr: "\u{1F1EB}\u{1F1F7}",
      pt: "\u{1F1E7}\u{1F1F7}",
      it: "\u{1F1EE}\u{1F1F9}",
      ar: "\u{1F1F8}\u{1F1E6}",
      zh: "\u{1F1E8}\u{1F1F3}",
      de: "\u{1F1E9}\u{1F1EA}",
      th: "\u{1F1F9}\u{1F1ED}",
      ta: "\u{1F1EE}\u{1F1F3}",
      te: "\u{1F1EE}\u{1F1F3}"
    };
    var DEFAULT_LANG_SCORES = {
      es: 3,
      cast: 3,
      lat: 2,
      vose: 1.5,
      en: 1,
      ja: 0.5,
      ko: 0.5,
      hi: 0.3,
      fr: 0.5,
      pt: 0.5,
      it: 0.5,
      ar: 0.3,
      zh: 0.3,
      de: 0.5,
      th: 0.3,
      ta: 0.3,
      te: 0.3
    };
    var CODEC_TIERS = {
      "AV1": 3,
      "HEVC": 2,
      "x265": 2,
      "H.265": 2,
      "H265": 2,
      "x264": 1,
      "H.264": 1,
      "AVC": 1,
      "H264": 1,
      "XviD": 0,
      "DivX": 0
    };
    var SOURCE_TIERS = {
      "Remux": 5,
      "BluRay": 4,
      "BRRip": 3,
      "WEB-DL": 3,
      "WEBRip": 2,
      "HDTV": 2,
      "DVD": 1,
      "DVDRip": 1,
      "DVD5": 1,
      "DVD9": 1,
      "CAM": 0,
      "TS": 0,
      "TC": 0,
      "SCR": 0
    };
    var TMDB_KEY = process.env.TMDB_KEY || "d80ba92bc7cefe3359668d30d06f3305";
    var TMDB_BASE = "https://api.themoviedb.org/3";
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    module2.exports = {
      QUALITY_TIERS,
      QUALITY_ORDER,
      LANG_CODES,
      LANG_FLAGS,
      DEFAULT_LANG_SCORES,
      CODEC_TIERS,
      SOURCE_TIERS,
      TMDB_KEY,
      TMDB_BASE,
      UA
    };
  }
});

// src/media/tmdb.js
var require_tmdb = __commonJS({
  "src/media/tmdb.js"(exports2, module2) {
    var { TMDB_KEY, TMDB_BASE, UA } = require_types();
    var metaCache = /* @__PURE__ */ new Map();
    var altTitleCache = /* @__PURE__ */ new Map();
    var MAX_CACHE = 500;
    var META_TTL = 5 * 60 * 1e3;
    var ALT_TTL = 24 * 60 * 60 * 1e3;
    function cacheGet(map, key, ttl) {
      const entry = map.get(key);
      if (entry && Date.now() - entry.time < ttl) return entry.value;
      if (entry) map.delete(key);
      return void 0;
    }
    function cacheSet(map, key, value, max) {
      if (map.size >= max) {
        const first = map.keys().next().value;
        map.delete(first);
      }
      map.set(key, { value, time: Date.now() });
    }
    function fetchTMDB(path, timeout = 8e3) {
      return __async(this, null, function* () {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), timeout);
          const sep = path.includes("?") ? "&" : "?";
          const res = yield fetch(`${TMDB_BASE}${path}${sep}api_key=${TMDB_KEY}`, {
            headers: { "User-Agent": UA },
            signal: ctrl.signal
          });
          clearTimeout(timer);
          return res.ok ? res.json() : null;
        } catch (e) {
          return null;
        }
      });
    }
    function getMeta(tmdbId, mediaType, language = "en") {
      return __async(this, null, function* () {
        const ck = `meta:${mediaType}:${tmdbId}:${language}`;
        const cached = cacheGet(metaCache, ck, META_TTL);
        if (cached) return cached;
        const path = `/${mediaType === "tv" ? "tv" : "movie"}/${tmdbId}?language=${language}`;
        const data = yield fetchTMDB(path);
        if (data) cacheSet(metaCache, ck, data, MAX_CACHE);
        return data;
      });
    }
    function getMetaMultiLang(tmdbId, mediaType) {
      return __async(this, null, function* () {
        const [enData, esData] = yield Promise.all([
          getMeta(tmdbId, mediaType, "en"),
          getMeta(tmdbId, mediaType, "es")
        ]);
        return { en: enData, es: esData };
      });
    }
    function getAltTitles(tmdbId, mediaType) {
      return __async(this, null, function* () {
        const ck = `alt:${mediaType}:${tmdbId}`;
        const cached = cacheGet(altTitleCache, ck, ALT_TTL);
        if (cached) return cached;
        const path = `/${mediaType === "tv" ? "tv" : "movie"}/${tmdbId}/alternative_titles`;
        const data = yield fetchTMDB(path);
        if (!data) return [];
        const titles = [];
        if (data.titles) {
          for (const t of data.titles) {
            if (t.title && t.title.length > 1) titles.push(t.title);
          }
        }
        if (data.results) {
          for (const t of data.results) {
            if (t.title && t.title.length > 1) titles.push(t.title);
          }
        }
        const unique = [...new Set(titles)];
        cacheSet(altTitleCache, ck, unique, MAX_CACHE);
        return unique;
      });
    }
    function searchTMDB(query, mediaType, language = "en") {
      return __async(this, null, function* () {
        const path = `/search/${mediaType === "tv" ? "tv" : "movie"}?query=${encodeURIComponent(query)}&language=${language}`;
        return yield fetchTMDB(path);
      });
    }
    function findByIMDB(imdbId) {
      return __async(this, null, function* () {
        const path = `/find/${imdbId}?external_source=imdb_id`;
        return yield fetchTMDB(path);
      });
    }
    function getEpisodes(tmdbId, seasonNumber) {
      return __async(this, null, function* () {
        const path = `/tv/${tmdbId}/season/${seasonNumber}?language=en`;
        return yield fetchTMDB(path);
      });
    }
    function extractYear(data) {
      if (!data) return null;
      const date = data.release_date || data.first_air_date || "";
      const year = parseInt(date.substring(0, 4));
      return year || null;
    }
    function extractIMDB(data) {
      var _a;
      return (data == null ? void 0 : data.imdb_id) || ((_a = data == null ? void 0 : data.external_ids) == null ? void 0 : _a.imdb_id) || null;
    }
    function isJapaneseAnime(data) {
      if (!data) return false;
      const hasGenre16 = (data.genres || []).some((g) => g.id === 16);
      const isJP = (data.origin_country || []).includes("JP") || (data.production_countries || []).some((c) => c.iso_3166_1 === "JP") || data.original_language === "ja";
      return hasGenre16 && isJP;
    }
    module2.exports = {
      getMeta,
      getMetaMultiLang,
      getAltTitles,
      searchTMDB,
      findByIMDB,
      getEpisodes,
      extractYear,
      extractIMDB,
      isJapaneseAnime,
      fetchTMDB
    };
  }
});

// src/movies/detector.js
var require_detector = __commonJS({
  "src/movies/detector.js"(exports2, module2) {
    var { extractYear } = require_tmdb();
    function verifyYear2(title, expectedYear, tolerance = 0) {
      if (!expectedYear) return { match: true, score: 0, foundYear: null };
      const found = extractYearFromTitle(title);
      if (!found) return { match: true, score: 0, foundYear: null };
      const diff = Math.abs(found - expectedYear);
      if (diff <= tolerance) return { match: true, score: diff === 0 ? 0.1 : 0.03, foundYear: found };
      return { match: false, score: -0.4, foundYear: found };
    }
    function extractYearFromTitle(title) {
      if (!title) return null;
      const m = title.match(/\b(19[5-9]\d|20[0-3]\d)\b/);
      return m ? parseInt(m[1]) : null;
    }
    function isMovieTitle2(title) {
      if (!title) return false;
      const t = title.toLowerCase();
      if (/s\d{1,2}\s*e\d{1,2}/i.test(t)) return false;
      if (/\b(season|episode|complete series|s\d{2})\b/i.test(t)) return false;
      return true;
    }
    function scoreMovieMatch2(torrent, query, expectedYear) {
      let score = 0;
      const title = torrent.title || torrent.name || "";
      const yearCheck = verifyYear2(title, expectedYear);
      score += yearCheck.score;
      if (torrent.quality === "4K") score += 0.05;
      else if (torrent.quality === "1080p") score += 0.03;
      if (torrent.source === "BluRay" || torrent.source === "Remux") score += 0.03;
      if (torrent.codec === "HEVC" || torrent.codec === "AV1") score += 0.02;
      if (torrent.verified) score += 0.03;
      return score;
    }
    module2.exports = { verifyYear: verifyYear2, extractYearFromTitle, isMovieTitle: isMovieTitle2, scoreMovieMatch: scoreMovieMatch2 };
  }
});

// src/movies/index.js
var { verifyYear, isMovieTitle, scoreMovieMatch } = require_detector();
var tmdb = require_tmdb();
function resolveMovieMeta(rawId) {
  return __async(this, null, function* () {
    var _a;
    let tmdbId = rawId;
    if (rawId.startsWith("tt")) {
      const data = yield tmdb.findByIMDB(rawId);
      if (data) {
        const result = (_a = data.movie_results) == null ? void 0 : _a[0];
        if (result) tmdbId = String(result.id);
      }
    }
    if (!tmdbId || !String(tmdbId).match(/^\d+$/)) return null;
    const meta = yield tmdb.getMeta(tmdbId, "movie", "en");
    if (!meta) return null;
    return {
      tmdbId: String(meta.id),
      title: meta.title || meta.original_title || "",
      year: tmdb.extractYear(meta),
      imdbId: tmdb.extractIMDB(meta),
      genres: (meta.genres || []).map((g) => g.id),
      isAnime: tmdb.isJapaneseAnime(meta)
    };
  });
}
function resolveMovieTitles(rawId) {
  return __async(this, null, function* () {
    var _a;
    let tmdbId = rawId;
    let imdbId = null;
    if (String(rawId).startsWith("tt")) {
      const data = yield tmdb.findByIMDB(rawId);
      if (data) {
        const result = (_a = data.movie_results) == null ? void 0 : _a[0];
        if (result) {
          tmdbId = String(result.id);
          imdbId = rawId;
        }
      }
    }
    if (!tmdbId || !String(tmdbId).match(/^\d+$/)) return null;
    const [enMeta, esMeta] = yield Promise.all([
      tmdb.getMeta(tmdbId, "movie", "en"),
      tmdb.getMeta(tmdbId, "movie", "es")
    ]);
    if (!enMeta) return null;
    const titleEN = enMeta.title || enMeta.original_title || "";
    const titleES = (esMeta == null ? void 0 : esMeta.title) || "";
    const origTitle = enMeta.original_title || "";
    const searchTitles = [titleEN, titleES, origTitle].filter((t) => t && t.length >= 3).filter((t, i, a) => a.indexOf(t) === i);
    return {
      searchTitle: titleEN,
      searchTitles,
      year: tmdb.extractYear(enMeta),
      imdbId: imdbId || tmdb.extractIMDB(enMeta),
      contentId: tmdbId,
      genres: (enMeta.genres || []).map((g) => g.id),
      isAnime: tmdb.isJapaneseAnime(enMeta)
    };
  });
}
function getSearchTitle(rawId) {
  return __async(this, null, function* () {
    const meta = yield resolveMovieMeta(rawId);
    if (!meta) return null;
    return {
      title: meta.title,
      year: meta.year,
      imdbId: meta.imdbId
    };
  });
}
function filterMovieStreams(streams, expectedYear) {
  return streams.filter((s) => {
    const title = s.title || s.name || "";
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
  scoreMovieMatch
};
