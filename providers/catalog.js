/**
 * catalog - Built from src/catalog/
 * Generated: 2026-06-28T16:16:27.696Z
 */
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
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
    var MAX_CACHE2 = 500;
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
    function fetchTMDB2(path, timeout = 8e3) {
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
        const data = yield fetchTMDB2(path);
        if (data) cacheSet(metaCache, ck, data, MAX_CACHE2);
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
        const data = yield fetchTMDB2(path);
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
        cacheSet(altTitleCache, ck, unique, MAX_CACHE2);
        return unique;
      });
    }
    function searchTMDB(query, mediaType, language = "en") {
      return __async(this, null, function* () {
        const path = `/search/${mediaType === "tv" ? "tv" : "movie"}?query=${encodeURIComponent(query)}&language=${language}`;
        return yield fetchTMDB2(path);
      });
    }
    function findByIMDB2(imdbId) {
      return __async(this, null, function* () {
        const path = `/find/${imdbId}?external_source=imdb_id`;
        return yield fetchTMDB2(path);
      });
    }
    function getEpisodes(tmdbId, seasonNumber) {
      return __async(this, null, function* () {
        const path = `/tv/${tmdbId}/season/${seasonNumber}?language=en`;
        return yield fetchTMDB2(path);
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
    function isJapaneseAnime2(data) {
      if (!data) return false;
      const hasGenre16 = (data.genres || []).some((g) => g.id === 16) || (data.genre_ids || []).includes(16);
      const isJP = (data.origin_country || []).includes("JP") || (data.production_countries || []).some((c) => c.iso_3166_1 === "JP") || data.original_language === "ja";
      return hasGenre16 && isJP;
    }
    module2.exports = {
      getMeta,
      getMetaMultiLang,
      getAltTitles,
      searchTMDB,
      findByIMDB: findByIMDB2,
      getEpisodes,
      extractYear,
      extractIMDB,
      isJapaneseAnime: isJapaneseAnime2,
      fetchTMDB: fetchTMDB2
    };
  }
});

// src/anime/types.js
var require_types2 = __commonJS({
  "src/anime/types.js"(exports2, module2) {
    var ANIME_SOURCE_PREFIXES = ["animeflv:", "animeav1:", "henaojara:", "tioanime:", "jkanime:", "animejara:"];
    var ANIME_XREF_PREFIXES = ["anilist:", "kitsu:", "mal:", "anidb:"];
    var ANIME_LOCAL_PREFIXES = ["ovn-anime:"];
    var ANIME_PREFIXES = [...ANIME_SOURCE_PREFIXES, ...ANIME_XREF_PREFIXES, ...ANIME_LOCAL_PREFIXES];
    var ANIME_GENRE_ID = 16;
    var ANIME_ORIGIN_COUNTRY = "JP";
    var PIGAMER_BASE = process.env.PIGAMER_BASE || "https://pigamer37.alwaysdata.net";
    var AMATSU_BASE = "https://amatsu.ruka.pw";
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
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function isAnimeId(id) {
      return ANIME_PREFIXES.some((p) => id.startsWith(p) || id.startsWith(p.replace(":", "|")));
    }
    function isAnimeSourceId(id) {
      return ANIME_SOURCE_PREFIXES.some((p) => id.startsWith(p) || id.startsWith(p.replace(":", "|")));
    }
    function isAnimeXrefId(id) {
      return ANIME_XREF_PREFIXES.some((p) => id.startsWith(p) || id.startsWith(p.replace(":", "|")));
    }
    function extractSlug(id) {
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
      AMATSU_BASE,
      ANIME_PROVIDER_IDS,
      UA,
      isAnimeId,
      isAnimeSourceId,
      isAnimeXrefId,
      extractSlug,
      isAnimeProvider
    };
  }
});

// src/anime/amatsu.js
var require_amatsu = __commonJS({
  "src/anime/amatsu.js"(exports2, module2) {
    var { AMATSU_BASE, UA } = require_types2();
    var metaCache = /* @__PURE__ */ new Map();
    var MAX_CACHE2 = 300;
    var CACHE_TTL2 = 30 * 60 * 1e3;
    function cacheGet(key) {
      const entry = metaCache.get(key);
      if (entry && Date.now() - entry.time < CACHE_TTL2) return entry.value;
      if (entry) metaCache.delete(key);
      return void 0;
    }
    function cacheSet(key, value) {
      if (metaCache.size >= MAX_CACHE2) {
        const first = metaCache.keys().next().value;
        metaCache.delete(first);
      }
      metaCache.set(key, { value, time: Date.now() });
    }
    function fetchAmatsu(path, timeout = 8e3) {
      return __async(this, null, function* () {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), timeout);
          const res = yield fetch(`${AMATSU_BASE}${path}`, {
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
    function getMeta(anilistId) {
      return __async(this, null, function* () {
        var _a, _b;
        const id = anilistId.replace(/^anilist:/, "");
        const ck = `meta:${id}`;
        const cached = cacheGet(ck);
        if (cached) return cached;
        const data = yield fetchAmatsu(`/meta/anime/anilist:${id}.json`);
        if (!(data == null ? void 0 : data.meta)) return null;
        const result = {
          anilistId: `anilist:${id}`,
          malId: data.meta.idMal || null,
          name: data.meta.name,
          englishName: data.meta.englishName,
          altName: data.meta.altName,
          synonyms: data.meta.synonyms || [],
          poster: data.meta.poster || null,
          background: data.meta.background || null,
          description: data.meta.description || null,
          year: data.meta.releaseInfo || null,
          score: data.meta.imdbRating || data.meta.score || null,
          format: ((_a = (data.meta.description || "").match(/Format:\s*(\S+)/)) == null ? void 0 : _a[1]) || null,
          status: ((_b = (data.meta.description || "").match(/Status:\s*(\S+)/)) == null ? void 0 : _b[1]) || null
        };
        cacheSet(ck, result);
        return result;
      });
    }
    function getSynonyms(anilistId) {
      return __async(this, null, function* () {
        const meta = yield getMeta(anilistId);
        if (!meta) return [];
        const synonyms = [];
        if (meta.name) synonyms.push(meta.name);
        if (meta.englishName && meta.englishName !== meta.name) synonyms.push(meta.englishName);
        if (meta.altName && meta.altName !== meta.name) synonyms.push(meta.altName);
        if (Array.isArray(meta.synonyms)) {
          for (const s of meta.synonyms) {
            if (!synonyms.includes(s)) synonyms.push(s);
          }
        }
        return synonyms;
      });
    }
    function getCatalog2(catalogId, page = 1) {
      return __async(this, null, function* () {
        var _a;
        const VALID = ["amatsu_seasonal_series", "amatsu_airing_series", "amatsu_trending_series", "amatsu_top_series"];
        if (!VALID.includes(catalogId)) return { metas: [] };
        const ck = `catalog:${catalogId}:${page}`;
        const cached = cacheGet(ck);
        if (cached) return { metas: cached };
        const data = yield fetchAmatsu(`/catalog/anime/${catalogId}.json`, 1e4);
        if (!((_a = data == null ? void 0 : data.metas) == null ? void 0 : _a.length)) return { metas: [] };
        const metas = data.metas.map((m) => ({
          id: m.id,
          type: "series",
          name: m.name || "Unknown",
          poster: m.poster || null,
          background: m.background || null,
          description: (m.description || "").substring(0, 500),
          releaseInfo: m.releaseInfo || m.year || "",
          imdbRating: m.imdbRating || m.score || null,
          genres: m.genres || []
        }));
        cacheSet(ck, metas);
        return { metas };
      });
    }
    function searchAnilist2(query) {
      return __async(this, null, function* () {
        var _a;
        const q = encodeURIComponent(query);
        const data = yield fetchAmatsu(`/catalog/anime/amatsu_search/search=${q}.json`);
        if (!((_a = data == null ? void 0 : data.metas) == null ? void 0 : _a.length)) return [];
        return data.metas.map((m) => ({
          id: m.id,
          type: "series",
          name: m.name || "Unknown",
          poster: m.poster || null,
          background: m.background || null,
          description: (m.description || "").substring(0, 500),
          releaseInfo: m.releaseInfo || "",
          imdbRating: m.imdbRating || null,
          genres: m.genres || []
        }));
      });
    }
    module2.exports = { getMeta, getSynonyms, getCatalog: getCatalog2, searchAnilist: searchAnilist2 };
  }
});

// src/anime/resolver.js
var require_resolver = __commonJS({
  "src/anime/resolver.js"(exports2, module2) {
    var { PIGAMER_BASE, isAnimeSourceId, isAnimeXrefId } = require_types2();
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    var resolveCache = /* @__PURE__ */ new Map();
    var tmdbCache = /* @__PURE__ */ new Map();
    var MAX_CACHE2 = 500;
    var RESOLVE_TTL = 24 * 60 * 60 * 1e3;
    var TMDB_TTL = 24 * 60 * 60 * 1e3;
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
    function fetchPigamer(path, timeout = 15e3) {
      return __async(this, null, function* () {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), timeout);
          const res = yield fetch(`${PIGAMER_BASE}${path}`, {
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
    function resolveAnimeId(id) {
      return __async(this, null, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (isAnimeSourceId(id)) return id;
        if (!isAnimeXrefId(id)) return null;
        const cached = cacheGet(resolveCache, id, RESOLVE_TTL);
        if (cached !== void 0) return cached;
        try {
          const meta = yield fetchPigamer(`/meta/series/${encodeURIComponent(id)}.json`);
          if (((_a = meta == null ? void 0 : meta.meta) == null ? void 0 : _a.id) && isAnimeSourceId(meta.meta.id)) {
            cacheSet(resolveCache, id, meta.meta.id, MAX_CACHE2);
            return meta.meta.id;
          }
        } catch (e) {
        }
        try {
          const parts = id.split(":");
          if (parts.length === 2) {
            const source = parts[0];
            const numId = parts[1];
            const relCtrl = new AbortController();
            const relTimer = setTimeout(() => relCtrl.abort(), 1e4);
            const relRes = yield fetch(
              `https://relations.yuna.moe/api/v2/ids?source=${source}&id=${numId}`,
              { headers: { "User-Agent": UA }, signal: relCtrl.signal }
            );
            clearTimeout(relTimer);
            if (relRes.ok) {
              const rel = yield relRes.json();
              const tmdbId = (rel == null ? void 0 : rel.themoviedb) || (rel == null ? void 0 : rel.themoviedb_id);
              if (tmdbId) {
                const tmdbStr = `tmdb:${tmdbId}`;
                cacheSet(resolveCache, id, tmdbStr, MAX_CACHE2);
                return tmdbStr;
              }
              const anilistId = rel == null ? void 0 : rel.anilist;
              if (anilistId && source !== "anilist") {
                const anilistStr = `anilist:${anilistId}`;
                const meta2 = yield fetchPigamer(`/meta/series/${encodeURIComponent(anilistStr)}.json`);
                if (((_b = meta2 == null ? void 0 : meta2.meta) == null ? void 0 : _b.id) && isAnimeSourceId(meta2.meta.id)) {
                  cacheSet(resolveCache, id, meta2.meta.id, MAX_CACHE2);
                  return meta2.meta.id;
                }
              }
            }
          }
        } catch (e) {
        }
        if (id.startsWith("kitsu:")) {
          try {
            const kitsuId = id.split(":")[1];
            const kCtrl = new AbortController();
            const kTimer = setTimeout(() => kCtrl.abort(), 8e3);
            const kRes = yield fetch(
              `https://kitsu.io/api/edge/anime/${kitsuId}`,
              { headers: { "Accept": "application/vnd.api+json", "User-Agent": UA }, signal: kCtrl.signal }
            );
            clearTimeout(kTimer);
            if (kRes.ok) {
              const kData = yield kRes.json();
              const attrs = (_c = kData == null ? void 0 : kData.data) == null ? void 0 : _c.attributes;
              const titles = [
                attrs == null ? void 0 : attrs.canonicalTitle,
                (_d = attrs == null ? void 0 : attrs.titles) == null ? void 0 : _d.en,
                (_e = attrs == null ? void 0 : attrs.titles) == null ? void 0 : _e.en_jp,
                (_f = attrs == null ? void 0 : attrs.titles) == null ? void 0 : _f.ja_jp
              ].filter(Boolean);
              for (const title of titles.slice(0, 2)) {
                const aCtrl = new AbortController();
                const aTimer = setTimeout(() => aCtrl.abort(), 8e3);
                const aRes = yield fetch(
                  `https://amatsu.ruka.pw/catalog/anime/amatsu_search/search=${encodeURIComponent(title)}.json`,
                  { headers: { "User-Agent": UA }, signal: aCtrl.signal }
                );
                clearTimeout(aTimer);
                if (aRes.ok) {
                  const aData = yield aRes.json();
                  const match = (_g = aData == null ? void 0 : aData.metas) == null ? void 0 : _g.find((m) => {
                    var _a2;
                    return (_a2 = m.id) == null ? void 0 : _a2.startsWith("anilist:");
                  });
                  if (match) {
                    const meta = yield fetchPigamer(`/meta/series/${encodeURIComponent(match.id)}.json`);
                    if (((_h = meta == null ? void 0 : meta.meta) == null ? void 0 : _h.id) && isAnimeSourceId(meta.meta.id)) {
                      cacheSet(resolveCache, id, meta.meta.id, MAX_CACHE2);
                      return meta.meta.id;
                    }
                  }
                }
              }
            }
          } catch (e) {
          }
        }
        cacheSet(resolveCache, id, null, MAX_CACHE2);
        return null;
      });
    }
    function getAnimeTMDbId(id) {
      return __async(this, null, function* () {
        const cached = cacheGet(tmdbCache, id, TMDB_TTL);
        if (cached !== void 0) return cached;
        try {
          const meta = yield fetchPigamer(`/meta/series/${encodeURIComponent(id)}.json`);
          if (meta == null ? void 0 : meta.meta) {
            let tmdbId = null;
            if (Array.isArray(meta.meta.links)) {
              for (const link of meta.meta.links) {
                if (link.category === "tmdb" || typeof link.name === "string" && link.name.toLowerCase().includes("tmdb")) {
                  const match = (link.url || "").match(/\/(\d+)$/);
                  if (match) {
                    tmdbId = match[1];
                    break;
                  }
                }
              }
            }
            if (!tmdbId && meta.meta.tmdb_id) tmdbId = String(meta.meta.tmdb_id);
            if (tmdbId) {
              cacheSet(tmdbCache, id, tmdbId, MAX_CACHE2);
              return tmdbId;
            }
          }
        } catch (e) {
        }
        cacheSet(tmdbCache, id, null, MAX_CACHE2);
        return null;
      });
    }
    function resolveToTMDbId(rawId, mediaType, isAnime) {
      return __async(this, null, function* () {
        if (!isAnime) return null;
        if (rawId.match(/^\d+$/)) return rawId;
        const proxyId = (yield resolveAnimeId(rawId)) || rawId;
        const tmdbId = yield getAnimeTMDbId(proxyId);
        if (tmdbId) return tmdbId;
        return proxyId;
      });
    }
    module2.exports = { resolveAnimeId, getAnimeTMDbId, resolveToTMDbId };
  }
});

// src/anime/titles.js
var require_titles = __commonJS({
  "src/anime/titles.js"(exports2, module2) {
    var { PIGAMER_BASE, AMATSU_BASE, UA, isAnimeId, isAnimeSourceId, isAnimeXrefId, ANIME_SOURCE_PREFIXES } = require_types2();
    var tmdb = require_tmdb();
    var { resolveAnimeId, getAnimeTMDbId } = require_resolver();
    var titleCache = /* @__PURE__ */ new Map();
    var MAX_CACHE2 = 500;
    var CACHE_TTL2 = 24 * 60 * 60 * 1e3;
    function cacheGet(key) {
      const entry = titleCache.get(key);
      if (entry && Date.now() - entry.time < CACHE_TTL2) return entry.value;
      if (entry) titleCache.delete(key);
      return void 0;
    }
    function cacheSet(key, value) {
      if (titleCache.size >= MAX_CACHE2) {
        const first = titleCache.keys().next().value;
        titleCache.delete(first);
      }
      titleCache.set(key, { value, time: Date.now() });
    }
    function fetchJSON(url, timeout = 8e3) {
      return __async(this, null, function* () {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), timeout);
          const res = yield fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal });
          clearTimeout(timer);
          return res.ok ? res.json() : null;
        } catch (e) {
          return null;
        }
      });
    }
    function fromAmatsu(anilistId) {
      return __async(this, null, function* () {
        const data = yield fetchJSON(`${AMATSU_BASE}/meta/anime/${encodeURIComponent(anilistId)}.json`);
        if (!(data == null ? void 0 : data.meta)) return null;
        const titles = /* @__PURE__ */ new Set();
        const meta = data.meta;
        if (meta.name) titles.add(meta.name);
        if (meta.englishName && meta.englishName !== meta.name) titles.add(meta.englishName);
        if (meta.altName && meta.altName !== meta.name) titles.add(meta.altName);
        if (Array.isArray(meta.synonyms)) {
          for (const s of meta.synonyms) {
            if (s && s.length > 1) titles.add(s);
          }
        }
        return {
          titleEN: meta.englishName || meta.name || "",
          titleJA: meta.name || "",
          altName: meta.altName || "",
          synonyms: [...titles].slice(0, 30),
          poster: meta.poster || null,
          year: meta.releaseInfo || null
        };
      });
    }
    function fromPigamer(animeId) {
      return __async(this, null, function* () {
        const data = yield fetchJSON(`${PIGAMER_BASE}/meta/series/${encodeURIComponent(animeId)}.json`, 15e3);
        if (!(data == null ? void 0 : data.meta)) return null;
        const titles = /* @__PURE__ */ new Set();
        const meta = data.meta;
        if (meta.name) titles.add(meta.name);
        if (meta.englishName && meta.englishName !== meta.name) titles.add(meta.englishName);
        if (meta.altName && meta.altName !== meta.name) titles.add(meta.altName);
        if (Array.isArray(meta.synonyms)) {
          for (const s of meta.synonyms) {
            if (s && s.length > 1) titles.add(s);
          }
        }
        if (Array.isArray(meta.links)) {
          for (const link of meta.links) {
            if (link.name && !titles.has(link.name)) titles.add(link.name);
          }
        }
        return {
          titleEN: meta.englishName || meta.name || "",
          titleJA: meta.name || "",
          altName: meta.altName || "",
          links: meta.links || [],
          synonyms: [...titles].slice(0, 30),
          poster: meta.poster || null,
          year: meta.releaseInfo || null
        };
      });
    }
    function fromTMDB(tmdbId, mediaType = "tv") {
      return __async(this, null, function* () {
        const [en, es, altTitles] = yield Promise.all([
          tmdb.getMeta(tmdbId, mediaType, "en"),
          tmdb.getMeta(tmdbId, mediaType, "es"),
          tmdb.getAltTitles(tmdbId, mediaType)
        ]);
        if (!en) return null;
        const titles = /* @__PURE__ */ new Set();
        const orig = en.original_name || en.original_title || "";
        const name = en.name || en.title || "";
        if (name) titles.add(name);
        if (orig && orig !== name) titles.add(orig);
        if (es) {
          const esName = es.name || es.title || "";
          if (esName && esName !== name) titles.add(esName);
        }
        if (Array.isArray(altTitles)) {
          for (const t of altTitles) {
            if (t && t.length > 1 && !titles.has(t)) titles.add(t);
          }
        }
        return {
          titleEN: name,
          titleES: (es == null ? void 0 : es.name) || (es == null ? void 0 : es.title) || "",
          titleJA: orig,
          synonyms: [...titles].slice(0, 30),
          year: tmdb.extractYear(en)
        };
      });
    }
    function resolveTitles(inputId) {
      return __async(this, null, function* () {
        const cacheKey = `titles:${inputId}`;
        const cached = cacheGet(cacheKey);
        if (cached) return cached;
        let result = null;
        if (inputId.startsWith("anilist:")) {
          result = yield fromAmatsu(inputId);
        }
        if (!result && isAnimeSourceId(inputId)) {
          result = yield fromPigamer(inputId);
        }
        if (result && (!result.titleEN || result.titleEN.length < 2)) {
          const tmdbId = yield getAnimeTMDbId(inputId);
          if (tmdbId) {
            const tmdbResult = yield fromTMDB(tmdbId, "tv");
            if (tmdbResult) {
              result.titleEN = tmdbResult.titleEN || result.titleEN;
              result.titleJA = tmdbResult.titleJA || result.titleJA;
              result.year = tmdbResult.year || result.year;
              const existing = new Set(result.synonyms);
              for (const t of tmdbResult.synonyms) {
                if (!existing.has(t)) result.synonyms.push(t);
              }
            }
          }
        }
        if (!result && isAnimeXrefId(inputId)) {
          const resolved = yield resolveAnimeId(inputId);
          if (resolved) {
            result = yield resolveTitles(resolved);
          }
        }
        if (!result && inputId.match(/^\d+$/)) {
          result = yield fromTMDB(inputId, "tv");
          if (!result) result = yield fromTMDB(inputId, "movie");
        }
        if (!result) {
          cacheSet(cacheKey, null);
          return null;
        }
        const allTitles = [];
        const seen = /* @__PURE__ */ new Set();
        const candidates = [
          result.titleEN,
          result.titleES,
          result.titleJA,
          result.altName,
          ...result.synonyms || []
        ];
        for (const t of candidates) {
          if (!t || t.length < 2) continue;
          const clean = t.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const key = clean.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          allTitles.push(t.trim());
        }
        result.allTitles = allTitles;
        result.searchTitles = [result.titleEN, result.titleJA, result.titleES, ...result.synonyms || []].filter((t) => t && t.length >= 3).slice(0, 10);
        cacheSet(cacheKey, result);
        return result;
      });
    }
    function getSearchTitles(inputId) {
      return __async(this, null, function* () {
        const titles = yield resolveTitles(inputId);
        if (!titles) return [];
        return titles.searchTitles;
      });
    }
    function getEnglishTitle(inputId) {
      return __async(this, null, function* () {
        const titles = yield resolveTitles(inputId);
        if (!titles) return null;
        return titles.titleEN || titles.searchTitles[0] || null;
      });
    }
    module2.exports = {
      resolveTitles,
      getSearchTitles,
      getEnglishTitle,
      fromTMDB,
      fromAmatsu,
      fromPigamer
    };
  }
});

// src/content/profile.js
var require_profile = __commonJS({
  "src/content/profile.js"(exports2, module2) {
    var tmdb = require_tmdb();
    var amatsu = require_amatsu();
    var { resolveAnimeId, getAnimeTMDbId } = require_resolver();
    var animeTitles = require_titles();
    var profileCache = /* @__PURE__ */ new Map();
    var MAX_CACHE2 = 500;
    var CACHE_TTL2 = 60 * 60 * 1e3;
    function cacheGet(key) {
      const entry = profileCache.get(key);
      if (entry && Date.now() - entry.time < CACHE_TTL2) return entry.value;
      if (entry) profileCache.delete(key);
      return void 0;
    }
    function cacheSet(key, value) {
      if (profileCache.size >= MAX_CACHE2) {
        const first = profileCache.keys().next().value;
        profileCache.delete(first);
      }
      profileCache.set(key, { value, time: Date.now() });
    }
    function normalizeMeta(data, mediaType) {
      if (!data) return null;
      return {
        id: String(data.id),
        title: data.title || data.name || data.original_title || data.original_name || "",
        overview: (data.overview || "").substring(0, 2e3),
        poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
        background: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
        year: tmdb.extractYear(data),
        releaseDate: data.release_date || data.first_air_date || "",
        imdbId: tmdb.extractIMDB(data),
        imdbRating: data.vote_average ? String(Math.round(data.vote_average * 10) / 10) : null,
        voteCount: data.vote_count || 0,
        runtime: data.runtime ? `${data.runtime} min` : null,
        genres: (data.genres || []).map((g) => ({ id: g.id, name: g.name })),
        genreIds: (data.genres || []).map((g) => g.id),
        originCountry: data.origin_country || [],
        originalLanguage: data.original_language || "",
        status: data.status || "",
        mediaType
      };
    }
    function normalizeAnimeMeta(data, sourceId) {
      var _a;
      if (!data) return null;
      const isAmatsu = sourceId && sourceId.startsWith("anilist:");
      return {
        id: isAmatsu ? `anilist:${((_a = data.anilistId) == null ? void 0 : _a.replace("anilist:", "")) || ""}` : sourceId || "",
        title: data.name || data.englishName || "",
        overview: (data.description || "").substring(0, 2e3),
        poster: data.poster || null,
        background: data.background || null,
        year: data.year ? parseInt(data.year) : null,
        releaseDate: data.year || "",
        imdbId: null,
        imdbRating: data.score || null,
        voteCount: 0,
        runtime: null,
        genres: [],
        genreIds: [],
        originCountry: ["JP"],
        originalLanguage: "ja",
        status: data.status || "",
        mediaType: "tv",
        synonyms: data.synonyms || [],
        format: data.format || ""
      };
    }
    function resolveByTMDB(tmdbId, mediaType) {
      return __async(this, null, function* () {
        var _a;
        const ck = `tmdb:${mediaType}:${tmdbId}`;
        const cached = cacheGet(ck);
        if (cached) return cached;
        const raw = yield tmdb.getMeta(tmdbId, mediaType, "en");
        if (!raw) return null;
        let altTitles = [];
        try {
          altTitles = yield tmdb.getAltTitles(tmdbId, mediaType);
        } catch (e) {
        }
        let esData = null;
        try {
          esData = yield tmdb.getMeta(tmdbId, mediaType, "es");
        } catch (e) {
        }
        const profile = __spreadProps(__spreadValues({}, normalizeMeta(raw, mediaType)), {
          altTitles,
          titleES: (esData == null ? void 0 : esData.title) || (esData == null ? void 0 : esData.name) || "",
          overviewES: ((esData == null ? void 0 : esData.overview) || "").substring(0, 2e3),
          isAnime: tmdb.isJapaneseAnime(raw),
          seasons: void 0,
          videos: void 0
        });
        if (profile.isAnime) {
          try {
            const titles = yield animeTitles.fromTMDB(tmdbId, mediaType);
            if (titles) {
              profile.searchTitles = titles.searchTitles || [];
              profile.synonyms = titles.synonyms || [];
              profile.titleJA = titles.titleJA || "";
              profile.titleES = titles.titleES || "";
            }
          } catch (e) {
          }
        } else {
          try {
            const altTitles2 = yield tmdb.getAltTitles(tmdbId, mediaType);
            const esData2 = yield tmdb.getMeta(tmdbId, mediaType, "es");
            profile.searchTitles = [profile.title, ...altTitles2 || []].filter((t) => t && t.length >= 3).slice(0, 10);
            profile.titleES = (esData2 == null ? void 0 : esData2.title) || (esData2 == null ? void 0 : esData2.name) || "";
            profile.synonyms = altTitles2 || [];
          } catch (e) {
          }
        }
        if (mediaType === "tv" && ((_a = raw.seasons) == null ? void 0 : _a.length)) {
          profile.seasons = raw.seasons.filter((s) => s.season_number > 0).map((s) => ({
            seasonNumber: s.season_number,
            episodeCount: s.episode_count || 0,
            name: s.name || "",
            overview: (s.overview || "").substring(0, 500),
            poster: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : null,
            airDate: s.air_date || ""
          }));
        }
        cacheSet(ck, profile);
        return profile;
      });
    }
    function resolveByAnimeId(animeId) {
      return __async(this, null, function* () {
        var _a;
        const ck = `anime:${animeId}`;
        const cached = cacheGet(ck);
        if (cached) return cached;
        const titlesResult = yield animeTitles.resolveTitles(animeId);
        if (!titlesResult) return null;
        const profile = {
          id: animeId,
          title: titlesResult.titleEN || titlesResult.titleJA || animeId,
          overview: "",
          poster: titlesResult.poster || null,
          background: null,
          year: titlesResult.year ? parseInt(titlesResult.year) : null,
          releaseDate: titlesResult.year || "",
          imdbId: null,
          imdbRating: null,
          voteCount: 0,
          runtime: null,
          genres: [],
          genreIds: [],
          originCountry: ["JP"],
          originalLanguage: "ja",
          status: "",
          mediaType: "tv",
          isAnime: true,
          searchTitles: titlesResult.searchTitles || [],
          synonyms: titlesResult.synonyms || [],
          titleEN: titlesResult.titleEN || "",
          titleJA: titlesResult.titleJA || "",
          titleES: titlesResult.titleES || "",
          altName: titlesResult.altName || "",
          seasons: void 0,
          videos: void 0
        };
        const tmdbId = yield getAnimeTMDbId(animeId);
        if (tmdbId) {
          try {
            const tmdbProfile = yield resolveByTMDB(tmdbId, "tv");
            if (tmdbProfile) {
              profile.overview = tmdbProfile.overview || profile.overview;
              profile.poster = tmdbProfile.poster || profile.poster;
              profile.background = tmdbProfile.background || profile.background;
              profile.year = tmdbProfile.year || profile.year;
              profile.imdbRating = tmdbProfile.imdbRating || profile.imdbRating;
              profile.genres = tmdbProfile.genres;
              profile.genreIds = tmdbProfile.genreIds;
              profile.seasons = tmdbProfile.seasons;
              profile.runtime = tmdbProfile.runtime;
              profile.status = tmdbProfile.status || profile.status;
              if ((_a = tmdbProfile.searchTitles) == null ? void 0 : _a.length) {
                const existing = new Set(profile.searchTitles.map((t) => t.toLowerCase()));
                for (const t of tmdbProfile.searchTitles) {
                  if (!existing.has(t.toLowerCase())) {
                    profile.searchTitles.push(t);
                    existing.add(t.toLowerCase());
                  }
                }
              }
              if (tmdbProfile.isAnime) profile.isAnime = true;
            }
          } catch (e) {
          }
        }
        cacheSet(ck, profile);
        return profile;
      });
    }
    function resolveByIMDB(imdbId, fallbackMediaType = "movie") {
      return __async(this, null, function* () {
        var _a, _b;
        const data = yield tmdb.findByIMDB(imdbId);
        if (!data) return null;
        const movieResult = (_a = data.movie_results) == null ? void 0 : _a[0];
        const tvResult = (_b = data.tv_results) == null ? void 0 : _b[0];
        if (movieResult && tvResult) {
          const movieProfile = yield resolveByTMDB(String(movieResult.id), "movie");
          const tvProfile = yield resolveByTMDB(String(tvResult.id), "tv");
          return fallbackMediaType === "tv" ? tvProfile || movieProfile : movieProfile || tvProfile;
        }
        if (movieResult) return yield resolveByTMDB(String(movieResult.id), "movie");
        if (tvResult) return yield resolveByTMDB(String(tvResult.id), "tv");
        return null;
      });
    }
    function resolveAny(rawId, mediaType, type) {
      return __async(this, null, function* () {
        if (!rawId) return null;
        if (type === "anime" || rawId.startsWith("animeflv:") || rawId.startsWith("animeav1:") || rawId.startsWith("henaojara:") || rawId.startsWith("tioanime:") || rawId.startsWith("anilist:") || rawId.startsWith("kitsu:") || rawId.startsWith("mal:") || rawId.startsWith("anidb:")) {
          return yield resolveByAnimeId(rawId);
        }
        if (rawId.startsWith("tt")) {
          return yield resolveByIMDB(rawId, mediaType);
        }
        if (rawId.match(/^\d+$/)) {
          return yield resolveByTMDB(rawId, mediaType);
        }
        return null;
      });
    }
    function buildStremioMeta(profile, id) {
      if (!profile) return null;
      return {
        id: id || profile.id,
        type: profile.mediaType === "tv" ? "series" : "movie",
        name: profile.title,
        poster: profile.poster,
        background: profile.background,
        description: profile.overviewES || profile.overview || "",
        releaseInfo: profile.year ? String(profile.year) : profile.releaseDate || "",
        runtime: profile.runtime,
        imdbRating: profile.imdbRating,
        genres: profile.genres.map((g) => g.name),
        videos: profile.videos
      };
    }
    function buildCatalogMeta(item, type, id) {
      return {
        id: id || `ovn:${item.id}`,
        type,
        name: item.title || "Unknown",
        poster: item.poster,
        background: item.background,
        description: (item.overview || "").substring(0, 500),
        releaseInfo: item.year ? String(item.year) : "",
        imdbRating: item.imdbRating,
        genres: item.genres.map((g) => g.name)
      };
    }
    module2.exports = {
      resolveByTMDB,
      resolveByAnimeId,
      resolveByIMDB,
      resolveAny,
      buildStremioMeta,
      buildCatalogMeta,
      normalizeMeta,
      normalizeAnimeMeta
    };
  }
});

// src/content/identifier.js
var require_identifier = __commonJS({
  "src/content/identifier.js"(exports2, module2) {
    var tmdb = require_tmdb();
    var { ANIME_PREFIXES, ANIME_GENRE_ID, ANIME_ORIGIN_COUNTRY, isAnimeId, isAnimeSourceId, isAnimeXrefId } = require_types2();
    var detectCache = /* @__PURE__ */ new Map();
    var MAX_CACHE2 = 500;
    var CACHE_TTL2 = 60 * 60 * 1e3;
    function cacheGet(key) {
      const entry = detectCache.get(key);
      if (entry && Date.now() - entry.time < CACHE_TTL2) return entry.value;
      if (entry) detectCache.delete(key);
      return void 0;
    }
    function cacheSet(key, value) {
      if (detectCache.size >= MAX_CACHE2) {
        const first = detectCache.keys().next().value;
        detectCache.delete(first);
      }
      detectCache.set(key, { value, time: Date.now() });
    }
    var CONTENT_ANIME = "anime";
    var CONTENT_MOVIE = "movie";
    var CONTENT_SERIES = "series";
    function classifyByPrefix(id) {
      if (isAnimeId(id)) return CONTENT_ANIME;
      if (id.startsWith("tt")) return CONTENT_MOVIE;
      return null;
    }
    function classifyByType(type) {
      if (type === "anime") return CONTENT_ANIME;
      if (type === "movie") return CONTENT_MOVIE;
      if (type === "series" || type === "tv") return CONTENT_SERIES;
      return null;
    }
    function classifyByTMDB(tmdbId, mediaType) {
      return __async(this, null, function* () {
        var _a;
        const ck = `classify:${mediaType}:${tmdbId}`;
        const cached = cacheGet(ck);
        if (cached) return cached;
        const data = yield tmdb.getMeta(tmdbId, mediaType, "en");
        if (!data) {
          cacheSet(ck, null);
          return null;
        }
        const isAnime = tmdb.isJapaneseAnime(data);
        const isMovie = mediaType === "movie" || !data.seasons;
        const result = {
          contentType: isAnime ? CONTENT_ANIME : isMovie ? CONTENT_MOVIE : CONTENT_SERIES,
          isAnime,
          isMovie: !isAnime && isMovie,
          isSeries: !isAnime && !isMovie,
          title: data.title || data.name || data.original_title || data.original_name || "",
          year: tmdb.extractYear(data),
          genres: (data.genres || []).map((g) => ({ id: g.id, name: g.name })),
          hasSeasons: !!((_a = data.seasons) == null ? void 0 : _a.length),
          episodeCount: data.number_of_episodes || 0,
          seasonCount: data.number_of_seasons || 0,
          originCountry: data.origin_country || [],
          originalLanguage: data.original_language || ""
        };
        cacheSet(ck, result);
        return result;
      });
    }
    function classify(rawId, type, mediaType) {
      return __async(this, null, function* () {
        var _a, _b, _c, _d;
        const byPrefix = classifyByPrefix(rawId);
        if (byPrefix === CONTENT_ANIME) {
          return {
            contentType: CONTENT_ANIME,
            isAnime: true,
            isMovie: false,
            isSeries: true,
            method: "prefix",
            confidence: 1
          };
        }
        const byType = classifyByType(type);
        if (byType === CONTENT_ANIME) {
          return {
            contentType: CONTENT_ANIME,
            isAnime: true,
            isMovie: false,
            isSeries: true,
            method: "type",
            confidence: 0.9
          };
        }
        const ttMatch = rawId.match(/^tt:?(\d{2,})(?::\d+(?::\d+)?)?$/);
        if (ttMatch) {
          const imdbId = `tt${ttMatch[1]}`;
          const imdbData = yield tmdb.findByIMDB(imdbId);
          if (imdbData) {
            const result = ((_a = mediaType === "tv" ? imdbData.tv_results : imdbData.movie_results) == null ? void 0 : _a[0]) || ((_b = imdbData.tv_results) == null ? void 0 : _b[0]) || ((_c = imdbData.movie_results) == null ? void 0 : _c[0]);
            if (result) {
              const isAnime = tmdb.isJapaneseAnime(result);
              const isMovie = result.media_type === "movie" || !result.seasons;
              return {
                contentType: isAnime ? CONTENT_ANIME : isMovie ? CONTENT_MOVIE : CONTENT_SERIES,
                isAnime,
                isMovie: !isAnime && isMovie,
                isSeries: !isAnime && !isMovie,
                method: "imdb-to-tmdb",
                confidence: 0.95,
                tmdbId: result.id,
                title: result.title || result.name || "",
                year: tmdb.extractYear(result),
                genres: (result.genres || []).map((g) => ({ id: g.id, name: g.name })),
                hasSeasons: !!((_d = result.seasons) == null ? void 0 : _d.length),
                episodeCount: result.number_of_episodes || 0,
                seasonCount: result.number_of_seasons || 0,
                originCountry: result.origin_country || [],
                originalLanguage: result.original_language || ""
              };
            }
          }
          return {
            contentType: byType || (mediaType === "tv" ? CONTENT_SERIES : CONTENT_MOVIE),
            isAnime: false,
            isMovie: mediaType !== "tv",
            isSeries: mediaType === "tv",
            method: "imdb-fallback",
            confidence: 0.2
          };
        }
        const cleanId = rawId.replace(/^(ovn:|tmdb:|tt:)/, "");
        if (!cleanId.match(/^\d+$/)) {
          return {
            contentType: byType || CONTENT_MOVIE,
            isAnime: false,
            isMovie: mediaType !== "tv",
            isSeries: mediaType === "tv",
            method: "id-format",
            confidence: 0.5
          };
        }
        const tmdbId = parseInt(cleanId);
        const tmdbResult = yield classifyByTMDB(cleanId, mediaType);
        if (tmdbResult) {
          return {
            contentType: tmdbResult.contentType,
            isAnime: tmdbResult.isAnime,
            isMovie: tmdbResult.isMovie,
            isSeries: tmdbResult.isSeries,
            method: "tmdb",
            confidence: 0.95,
            tmdbId,
            title: tmdbResult.title,
            year: tmdbResult.year,
            genres: tmdbResult.genres,
            hasSeasons: tmdbResult.hasSeasons,
            episodeCount: tmdbResult.episodeCount,
            seasonCount: tmdbResult.seasonCount,
            originCountry: tmdbResult.originCountry,
            originalLanguage: tmdbResult.originalLanguage
          };
        }
        return {
          contentType: byType || (mediaType === "tv" ? CONTENT_SERIES : CONTENT_MOVIE),
          isAnime: false,
          isMovie: mediaType !== "tv",
          isSeries: mediaType === "tv",
          method: "fallback",
          confidence: 0.3
        };
      });
    }
    function isAnimeIdPrefix(id) {
      return isAnimeId(id);
    }
    function isSeriesRequest(type) {
      return type === "series" || type === "tv" || type === "anime";
    }
    function toStremioType(contentType) {
      if (contentType === CONTENT_ANIME) return "series";
      if (contentType === CONTENT_SERIES) return "series";
      if (contentType === CONTENT_MOVIE) return "movie";
      return "series";
    }
    module2.exports = {
      classify,
      classifyByPrefix,
      classifyByType,
      classifyByTMDB,
      isAnimeIdPrefix,
      isSeriesRequest,
      toStremioType,
      CONTENT_ANIME,
      CONTENT_MOVIE,
      CONTENT_SERIES,
      isAnimeId,
      isAnimeSourceId,
      isAnimeXrefId,
      ANIME_PREFIXES,
      ANIME_GENRE_ID,
      ANIME_ORIGIN_COUNTRY
    };
  }
});

// src/content/episode.js
var require_episode = __commonJS({
  "src/content/episode.js"(exports2, module2) {
    var tmdb = require_tmdb();
    var episodeCache = /* @__PURE__ */ new Map();
    var seasonListCache = /* @__PURE__ */ new Map();
    var MAX_CACHE2 = 300;
    var CACHE_TTL2 = 60 * 60 * 1e3;
    function cacheGet(map, key, ttl = CACHE_TTL2) {
      const entry = map.get(key);
      if (entry && Date.now() - entry.time < ttl) return entry.value;
      if (entry) map.delete(key);
      return void 0;
    }
    function cacheSet(map, key, value, max = MAX_CACHE2) {
      if (map.size >= max) {
        const first = map.keys().next().value;
        map.delete(first);
      }
      map.set(key, { value, time: Date.now() });
    }
    var ANIME_PREFIXES = ["animeflv:", "animeav1:", "henaojara:", "tioanime:", "jkanime:", "anilist:", "mal:", "kitsu:", "anidb:", "simkl:", "animeplanet:", "livechart:", "animenewsnetwork:", "anisearch:", "thetvdb:", "myanimelist:", "ovn-anime:"];
    function parseEpisodeId(id) {
      let contentId = id;
      let season = 1;
      let episode = 1;
      let animePrefix = null;
      if (id.startsWith("tmdb:") || id.startsWith("ovn-anime:") || id.startsWith("ovn:")) {
        const parts = id.split(":");
        contentId = parts[1] || id.replace(/^(tmdb:|ovn-anime:|ovn:)/, "");
        if (parts.length >= 4) {
          season = parseInt(parts[2]) || 1;
          episode = parseInt(parts[3]) || 1;
        }
        return { contentId, season, episode };
      }
      const ttMatch = id.match(/^(tt\d+):(\d+):(\d+)$/);
      if (ttMatch) {
        return {
          contentId: ttMatch[1],
          season: parseInt(ttMatch[2]) || 1,
          episode: parseInt(ttMatch[3]) || 1
        };
      }
      for (const prefix of ANIME_PREFIXES) {
        if (id.startsWith(prefix)) {
          animePrefix = prefix;
          const rest = id.slice(prefix.length);
          const parts = rest.split(":");
          contentId = parts[0];
          if (parts.length >= 3) {
            season = parseInt(parts[1]) || 1;
            episode = parseInt(parts[2]) || 1;
          }
          break;
        }
      }
      return { contentId, season, episode, animePrefix };
    }
    function extractSE(title) {
      if (!title) return null;
      const m = title.match(/[Ss](\d{1,2})\s*[Ee](\d{1,2})/);
      if (!m) return null;
      return { season: parseInt(m[1]), episode: parseInt(m[2]) };
    }
    function verifySE(title, expectedSeason, expectedEpisode) {
      if (expectedSeason === void 0 || expectedEpisode === void 0) {
        return { match: true, score: 0, found: null };
      }
      const se = extractSE(title);
      if (!se) return { match: true, score: 0, found: null };
      if (se.season === expectedSeason && se.episode === expectedEpisode) {
        return { match: true, score: 0.12, found: se };
      }
      if (se.season === expectedSeason) {
        return { match: true, score: 0.03, found: se };
      }
      return { match: false, score: -0.3, found: se };
    }
    function isEpisodeTitle(title) {
      if (!title) return false;
      return /[Ss]\d{1,2}\s*[Ee]\d{1,2}/i.test(title);
    }
    function isPack(title) {
      if (!title) return false;
      const t = title.toLowerCase();
      return /\b(complete|season\s*\d+\s*(complete|full|pack)|s\d{1,2}\s*(complete|full|pack)|all\s*episodes|full\s*season|complete\s*series)\b/i.test(t);
    }
    function isMovieTitle(title) {
      if (!title) return false;
      const t = title.toLowerCase();
      if (/s\d{1,2}\s*e\d{1,2}/i.test(t)) return false;
      if (/\b(season|episode|complete series|s\d{2})\b/i.test(t)) return false;
      return true;
    }
    function getSeasons(tmdbId) {
      return __async(this, null, function* () {
        const ck = `seasons:${tmdbId}`;
        const cached = cacheGet(seasonListCache, ck);
        if (cached) return cached;
        const meta = yield tmdb.getMeta(tmdbId, "tv", "en");
        if (!(meta == null ? void 0 : meta.seasons)) return [];
        const seasons = meta.seasons.filter((s) => s.season_number > 0).map((s) => ({
          seasonNumber: s.season_number,
          episodeCount: s.episode_count || 0,
          name: s.name || `Season ${s.season_number}`,
          overview: (s.overview || "").substring(0, 500),
          poster: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : null,
          airDate: s.air_date || ""
        }));
        cacheSet(seasonListCache, ck, seasons);
        return seasons;
      });
    }
    function getSeasonEpisodes(tmdbId, seasonNumber) {
      return __async(this, null, function* () {
        const ck = `episodes:${tmdbId}:${seasonNumber}`;
        const cached = cacheGet(episodeCache, ck);
        if (cached) return cached;
        const data = yield tmdb.getEpisodes(tmdbId, seasonNumber);
        if (!(data == null ? void 0 : data.episodes)) return [];
        const episodes = data.episodes.filter((ep) => ep.episode_number > 0).map((ep) => ({
          id: `ovn:${tmdbId}:${seasonNumber}:${ep.episode_number}`,
          title: ep.name || `Episodio ${ep.episode_number}`,
          season: ep.season_number,
          episode: ep.episode_number,
          overview: (ep.overview || "").substring(0, 500),
          aired: ep.air_date || "",
          thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null,
          runtime: ep.runtime || null,
          voteAverage: ep.vote_average || null
        }));
        cacheSet(episodeCache, ck, episodes);
        return episodes;
      });
    }
    function getAllEpisodes(tmdbId, maxSeasons = 10) {
      return __async(this, null, function* () {
        const seasons = yield getSeasons(tmdbId);
        const seasonNumbers = seasons.slice(0, maxSeasons).map((s) => s.seasonNumber);
        const results = yield Promise.allSettled(
          seasonNumbers.map((sn) => getSeasonEpisodes(tmdbId, sn))
        );
        const allEpisodes = [];
        for (const r of results) {
          if (r.status === "fulfilled") allEpisodes.push(...r.value);
        }
        return allEpisodes;
      });
    }
    function findEpisode(tmdbId, season, episode) {
      return __async(this, null, function* () {
        const episodes = yield getSeasonEpisodes(tmdbId, season);
        return episodes.find((ep) => ep.episode === episode) || null;
      });
    }
    function buildStremioVideos(episodes) {
      return episodes.map((ep) => ({
        id: ep.id,
        title: ep.title,
        season: ep.season,
        episode: ep.episode,
        released: ep.aired,
        thumbnail: ep.thumbnail,
        overview: ep.overview
      }));
    }
    function filterEpisodeStreams(streams, season, episode) {
      return streams.filter((s) => {
        const title = s.title || s.name || "";
        if (isPack(title)) return false;
        if (season !== void 0 && episode !== void 0) {
          const check = verifySE(title, season, episode);
          if (!check.match) return false;
        }
        return true;
      });
    }
    function scoreEpisodeMatch(torrent, expectedSeason, expectedEpisode) {
      let score = 0;
      const title = torrent.title || torrent.name || "";
      const seCheck = verifySE(title, expectedSeason, expectedEpisode);
      score += seCheck.score;
      if (torrent.quality === "4K") score += 0.05;
      else if (torrent.quality === "1080p") score += 0.03;
      if (torrent.source === "BluRay" || torrent.source === "Remux") score += 0.02;
      if (torrent.codec === "HEVC" || torrent.codec === "AV1") score += 0.01;
      if (torrent.verified) score += 0.03;
      return score;
    }
    module2.exports = {
      parseEpisodeId,
      extractSE,
      verifySE,
      isEpisodeTitle,
      isPack,
      isMovieTitle,
      getSeasons,
      getSeasonEpisodes,
      getAllEpisodes,
      findEpisode,
      buildStremioVideos,
      filterEpisodeStreams,
      scoreEpisodeMatch
    };
  }
});

// src/content/index.js
var require_content = __commonJS({
  "src/content/index.js"(exports2, module2) {
    var profile = require_profile();
    var identifier = require_identifier();
    var episode = require_episode();
    module2.exports = __spreadValues({
      profile,
      identifier,
      episode
    }, identifier);
  }
});

// src/anime/detector.js
var require_detector = __commonJS({
  "src/anime/detector.js"(exports2, module2) {
    var { ANIME_PREFIXES, ANIME_GENRE_ID, ANIME_ORIGIN_COUNTRY, isAnimeId } = require_types2();
    var TMDB_KEY = process.env.TMDB_KEY || "d80ba92bc7cefe3359668d30d06f3305";
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    var detectionCache = /* @__PURE__ */ new Map();
    var MAX_CACHE2 = 500;
    var CACHE_TTL2 = 60 * 60 * 1e3;
    function cacheGet(key) {
      const entry = detectionCache.get(key);
      if (entry && Date.now() - entry.time < CACHE_TTL2) return entry.value;
      if (entry) detectionCache.delete(key);
      return void 0;
    }
    function cacheSet(key, value) {
      if (detectionCache.size >= MAX_CACHE2) {
        const first = detectionCache.keys().next().value;
        detectionCache.delete(first);
      }
      detectionCache.set(key, { value, time: Date.now() });
    }
    function fetchTMDB2(path, timeout = 5e3) {
      return __async(this, null, function* () {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), timeout);
          const res = yield fetch(`https://api.themoviedb.org/3${path}?api_key=${TMDB_KEY}&language=en`, {
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
    function detectAnime(id, type, mediaType, config) {
      return __async(this, null, function* () {
        var _a;
        if (!config || !config.enableAnime) return { isAnime: false, confidence: 0, method: "disabled" };
        if (isAnimeId(id)) {
          return { isAnime: true, confidence: 1, method: "prefix" };
        }
        if (type === "anime") {
          return { isAnime: true, confidence: 0.9, method: "type" };
        }
        if (mediaType !== "tv") {
          return { isAnime: false, confidence: 0, method: "not-tv" };
        }
        const rawId = id.replace(/^(ovn:|tmdb:|tt)/, "");
        if (!rawId.match(/^\d+$/)) {
          return { isAnime: false, confidence: 0, method: "non-numeric" };
        }
        const cacheKey = `detect:${rawId}`;
        const cached = cacheGet(cacheKey);
        if (cached !== void 0) return cached;
        const tmdb = yield fetchTMDB2(`/tv/${rawId}`);
        if (!tmdb) {
          const result2 = { isAnime: false, confidence: 0, method: "tmdb-failed" };
          cacheSet(cacheKey, result2);
          return result2;
        }
        const hasGenre16 = !!((_a = tmdb.genres) == null ? void 0 : _a.some((g) => g.id === ANIME_GENRE_ID));
        const isJapanese = (tmdb.origin_country || []).includes(ANIME_ORIGIN_COUNTRY) || (tmdb.production_countries || []).some((c) => c.iso_3166_1 === ANIME_ORIGIN_COUNTRY) || tmdb.original_language === "ja";
        if (hasGenre16 && isJapanese) {
          const result2 = { isAnime: true, confidence: 0.95, method: "tmdb-genre16+jp" };
          cacheSet(cacheKey, result2);
          return result2;
        }
        if (hasGenre16 && !isJapanese) {
          const result2 = { isAnime: false, confidence: 0.3, method: "tmdb-genre16-only" };
          cacheSet(cacheKey, result2);
          return result2;
        }
        const result = { isAnime: false, confidence: 0, method: "tmdb-no-match" };
        cacheSet(cacheKey, result);
        return result;
      });
    }
    module2.exports = { detectAnime };
  }
});

// src/anime/pigamer.js
var require_pigamer = __commonJS({
  "src/anime/pigamer.js"(exports2, module2) {
    var { PIGAMER_BASE, UA } = require_types2();
    function fetchPigamer(path, timeout = 25e3) {
      return __async(this, null, function* () {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), timeout);
          const res = yield fetch(`${PIGAMER_BASE}${path}`, {
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
    function parseSources(data) {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.streams)) return data.streams;
      return [];
    }
    function getStreams(id, season, episode) {
      return __async(this, null, function* () {
        const s = season || 1;
        const ep = episode || 1;
        const fullId = s > 1 || ep > 1 ? `${id}:${s}:${ep}` : id;
        const data = yield fetchPigamer(
          `/stream/series/${encodeURIComponent(fullId)}.json`
        );
        return parseSources(data);
      });
    }
    function getMeta(id, type = "series") {
      return __async(this, null, function* () {
        return yield fetchPigamer(`/meta/${type}/${encodeURIComponent(id)}.json`);
      });
    }
    function pigamerTypeForCatalogId(catalogId) {
      if (catalogId.startsWith("animeflv")) return "AnimeFLV";
      if (catalogId.startsWith("animeav1")) return "AnimeAV1";
      if (catalogId.startsWith("henaojara")) return "Henaojara";
      if (catalogId.startsWith("tioanime")) return "TioAnime";
      return "AnimeFLV";
    }
    function getCatalog2(catalogId, page = 1) {
      return __async(this, null, function* () {
        var _a;
        const type = pigamerTypeForCatalogId(catalogId);
        const data = yield fetchPigamer(`/catalog/${type}/${encodeURIComponent(catalogId)}.json`, 15e3);
        if (!((_a = data == null ? void 0 : data.metas) == null ? void 0 : _a.length)) return { metas: [] };
        return { metas: data.metas };
      });
    }
    module2.exports = { getStreams, getMeta, fetchPigamer, getCatalog: getCatalog2 };
  }
});

// src/anime/providers.js
var require_providers = __commonJS({
  "src/anime/providers.js"(exports2, module2) {
    var { ANIME_PROVIDER_IDS } = require_types2();
    function filterLocalProviders(providers, isAnime, mediaType, type, config) {
      return providers.filter((provider) => {
        if (isAnime && !ANIME_PROVIDER_IDS.has(provider.id)) return false;
        if (!isAnime && ANIME_PROVIDER_IDS.has(provider.id)) return false;
        return true;
      });
    }
    function getAlfaCategory(isAnime, type) {
      if (isAnime) return "anime";
      if (type === "series" || type === "tv") return "tvshow";
      if (type === "movie") return "movie";
      return "movie";
    }
    module2.exports = { filterLocalProviders, getAlfaCategory };
  }
});

// src/anime/scrapers/animeflv.js
var require_animeflv = __commonJS({
  "src/anime/scrapers/animeflv.js"(exports2, module2) {
    var cheerio = require("cheerio-without-node-native") || require("cheerio");
    var BASE = "https://animeflv.ar";
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function fetchText(url, timeout = 15e3) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeout);
        try {
          const res = yield fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal });
          clearTimeout(t);
          if (!res.ok) return null;
          return yield res.text();
        } catch (e) {
          clearTimeout(t);
          return null;
        }
      });
    }
    function search(query) {
      return __async(this, null, function* () {
        const all = [];
        for (const page of [1, 2]) {
          const html = yield fetchText(`${BASE}/browse?q=${encodeURIComponent(query)}&page=${page}`);
          if (!html) continue;
          const $ = cheerio.load(html);
          const items = $("ul.ListAnimes li");
          if (!items.length) break;
          items.each((_, el) => {
            const a = $(el).find("a").first();
            const href = a.attr("href") || "";
            const slug = href.replace("/anime/", "");
            if (!slug) return;
            all.push({
              title: $(el).find("h3.Title").text().trim(),
              slug,
              poster: $(el).find("figure img").attr("src") || "",
              type: ($(el).find("span.Type").text() || "").toLowerCase().includes("pelicula") ? "movie" : "series",
              synopsis: $(el).find("div.Description p").last().text().trim()
            });
          });
          if (all.length >= 24) break;
        }
        return all;
      });
    }
    function getAnime(slug) {
      return __async(this, null, function* () {
        const html = yield fetchText(`${BASE}/anime/${slug}`);
        if (!html) return null;
        const $ = cheerio.load(html);
        const title = $("h1.Title").text().trim();
        const rawType = $("span.Type").text().trim();
        const animeType = rawType.toLowerCase().includes("pelicula") ? "movie" : "series";
        const poster = $("div.AnimeCover figure img").attr("src") || "";
        const synopsis = $("div.Description p").first().text().trim();
        const genres = [];
        $("nav.Nvgnrs a").each((_, el) => {
          genres.push($(el).text().trim());
        });
        let episodes = [];
        $("script").each((_, el) => {
          const text = $(el).html() || "";
          const m = text.match(/var episodes\s*=\s*(\[\[.*?\]\s*\]);/);
          if (m) {
            try {
              const arr = JSON.parse(m[1]);
              episodes = arr.map((ep) => ({
                number: ep[0],
                id: `animeflv:${slug}:${ep[0]}`,
                url: `${BASE}/ver/${slug}-${ep[0]}`
              }));
            } catch (e) {
            }
          }
        });
        return { title, type: animeType, slug, poster, synopsis, genres, episodes };
      });
    }
    function getStreams(slug, episode) {
      return __async(this, null, function* () {
        const html = yield fetchText(`${BASE}/ver/${slug}-${episode}`);
        if (!html) return [];
        const isNewFormat = html.includes("var videos = []") || html.includes("initEpisode");
        let videosStr = null;
        const $ = cheerio.load(html);
        $("script").each((_, el) => {
          const text = $(el).html() || "";
          const m = text.match(/var videos\s*=\s*(\{[^;]+\});/);
          if (m) videosStr = m[1];
        });
        if (!videosStr) {
          if (isNewFormat) console.log("[animeflv] new format detected for " + slug + ", falling back to Pigamer37");
          return [];
        }
        let videos;
        try {
          videos = JSON.parse(videosStr);
        } catch (e) {
          return [];
        }
        const results = [];
        const processServers = (servers2, lang) => {
          if (!Array.isArray(servers2)) return;
          for (const s of servers2) {
            const url = s.code || s.url || "";
            if (!url) continue;
            const serverName = (s.title || "embed").replace(/\s+/g, "");
            results.push({
              url,
              server: serverName,
              name: `AnimeFLV
${serverName}`,
              title: `${slug} Ep. ${episode}
\u2699\uFE0F ${serverName}`,
              description: lang === "ja" ? "SUB" : lang === "lat" ? "LAT" : "DUB",
              behaviorHints: { notWebReady: true, bingeGroup: `animeflv|${serverName}` }
            });
          }
        };
        processServers(videos.SUB, "ja");
        processServers(videos.LAT, "lat");
        processServers(videos.DUB, "cast");
        return results;
      });
    }
    function getOnAir() {
      return __async(this, null, function* () {
        const html = yield fetchText(BASE);
        if (!html) return [];
        const $ = cheerio.load(html);
        const items = [];
        $(".ListSdbr li").each((_, el) => {
          const a = $(el).find("a").first();
          const href = a.attr("href") || "";
          const slug = href.replace("/anime/", "");
          if (!slug) return;
          const rawType = a.find("span.Type").text().trim();
          items.push({
            id: `animeflv:${slug}`,
            type: rawType.toLowerCase().includes("pelicula") ? "movie" : "series",
            name: a.clone().children().remove().end().text().trim()
          });
        });
        return items;
      });
    }
    module2.exports = { search, getAnime, getStreams, getOnAir };
  }
});

// src/intelligent/logger.js
var require_logger = __commonJS({
  "src/intelligent/logger.js"(exports2, module2) {
    var LEVELS = { trace: 10, debug: 20, info: 30, warn: 40, error: 50 };
    var currentLevel = LEVELS.info;
    function serialize(v) {
      if (v === null || v === void 0) return "";
      if (typeof v === "string") return v;
      try {
        return JSON.stringify(v);
      } catch (e) {
        return String(v);
      }
    }
    function format(args) {
      if (args.length === 0) return "";
      if (args.length === 1) return serialize(args[0]);
      if (typeof args[0] === "object" && args[0] !== null && typeof args[1] === "string") {
        return args[1] + " " + serialize(args[0]);
      }
      if (typeof args[0] === "string" && typeof args[1] === "string") {
        return args[0] + " " + args[1];
      }
      return serialize(args[0]) + " " + serialize(args[1]);
    }
    var logger = {
      trace: function() {
        if (currentLevel <= LEVELS.trace) console.debug("[trace] " + format(arguments));
      },
      debug: function() {
        if (currentLevel <= LEVELS.debug) console.debug("[debug] " + format(arguments));
      },
      info: function() {
        if (currentLevel <= LEVELS.info) console.log("[info] " + format(arguments));
      },
      warn: function() {
        if (currentLevel <= LEVELS.warn) console.warn("[warn] " + format(arguments));
      },
      error: function() {
        if (currentLevel <= LEVELS.error) console.error("[error] " + format(arguments));
      }
    };
    function getLogger() {
      return logger;
    }
    function setLogLevel(level) {
      if (LEVELS[level] !== void 0) currentLevel = LEVELS[level];
    }
    module2.exports = { getLogger, setLogLevel };
  }
});

// src/intelligent/session-memory.js
var require_session_memory = __commonJS({
  "src/intelligent/session-memory.js"(exports2, module2) {
    var { existsSync, readFileSync, writeFileSync } = require("fs");
    var { join } = require("path");
    var { getLogger } = require_logger();
    function bayesianEstimate(successes, failures) {
      const alpha = successes + 1;
      const beta = failures + 1;
      const total = alpha + beta;
      return { alpha, beta, mean: alpha / total, confidence: Math.min(total / 10, 1) };
    }
    function tokenize(text) {
      return text.toLowerCase().replace(/[^a-záéíóúñ0-9\s]/gi, " ").split(/\s+/).filter(function(t) {
        return t.length > 1;
      });
    }
    function textSimilarity(query, candidate) {
      const qTokens = tokenize(query);
      const cTokens = tokenize(candidate);
      if (qTokens.length === 0 || cTokens.length === 0) return 0;
      const qSet = new Set(qTokens);
      const cSet = new Set(cTokens);
      let intersection = 0;
      for (const t of qSet) {
        if (cSet.has(t)) intersection++;
      }
      const union = qSet.size + cSet.size - intersection;
      const jaccard = intersection / union;
      const dice = 2 * intersection / (qSet.size + cSet.size);
      return Math.round((dice * 0.7 + jaccard * 0.3) * 100) / 100;
    }
    function generalizeClass(cls) {
      const result = [];
      const lower = cls.toLowerCase();
      if (lower.includes("-")) {
        const parts = lower.split("-");
        if (parts.length === 2) {
          result.push("*-" + parts[1]);
          result.push(parts[0] + "-*");
        }
      }
      const keywordPatterns = {
        "*-server*": /server|servidor/i,
        "*-player*": /player|reproductor/i,
        "*-list*": /list|lista/i,
        "*-btn*": /btn|button|boton/i,
        "*-card*": /card|tarjeta|item/i,
        "*-tab*": /tab|pestaña/i,
        "*-lang*": /idioma|language|lang/i,
        "*-download*": /download|descarg/i
      };
      for (const [pattern, regex] of Object.entries(keywordPatterns)) {
        if (regex.test(lower) && !result.includes(pattern)) {
          result.push(pattern);
        }
      }
      return result;
    }
    function extractDomain(url) {
      try {
        return new URL(url).hostname.replace("www.", "");
      } catch (e) {
        return url.slice(0, 40);
      }
    }
    function extractClass(selector) {
      const classMatch = selector.match(/\.([a-zA-Z_][\w-]*)/);
      if (classMatch) return classMatch[1];
      const idMatch = selector.match(/#([a-zA-Z_][\w-]*)/);
      if (idMatch) return idMatch[1];
      const childMatch = selector.match(/>\s*(\w+)/);
      if (childMatch) return childMatch[1];
      return "";
    }
    var SessionMemory = class {
      constructor(persistPath) {
        this.patterns = [];
        this.typeBoosts = /* @__PURE__ */ new Map();
        this.actionBoosts = /* @__PURE__ */ new Map();
        this.classBoosts = /* @__PURE__ */ new Map();
        this.containerDomains = /* @__PURE__ */ new Set();
        this.domainFingerprints = /* @__PURE__ */ new Map();
        this.urlChains = /* @__PURE__ */ new Map();
        this.successCount = 0;
        this.totalAttempts = 0;
        this.lastDomain = "";
        this.persistPath = persistPath || join(process.cwd(), ".scraper-memory.json");
        this._load();
      }
      // ─── Persistence ────────────────────────────────────────────
      _load() {
        try {
          if (!existsSync(this.persistPath)) return;
          const raw = readFileSync(this.persistPath, "utf-8");
          const data = JSON.parse(raw);
          if (data.version < 1) return;
          for (const [domain, fp] of Object.entries(data.domains || {})) {
            this.domainFingerprints.set(domain, {
              domain,
              successfulClasses: new Map(Object.entries(fp.successfulClasses || {})),
              successfulTypes: new Map(Object.entries(fp.successfulTypes || {})),
              failedClasses: new Map(Object.entries(fp.failedClasses || {})),
              containerUrls: fp.containerUrls || [],
              avgResponseTime: fp.avgResponseTime || 0,
              visits: fp.visits || 0,
              lastVisit: fp.lastVisit || 0
            });
          }
          for (const [, fp] of this.domainFingerprints) {
            for (const [cls, count] of fp.successfulClasses) {
              const stats = this.classBoosts.get(cls) || { s: 0, f: 0 };
              stats.s += count;
              this.classBoosts.set(cls, stats);
            }
            for (const [cls, count] of fp.failedClasses) {
              const stats = this.classBoosts.get(cls) || { s: 0, f: 0 };
              stats.f += count;
              this.classBoosts.set(cls, stats);
            }
            for (const [type, count] of fp.successfulTypes) {
              const stats = this.typeBoosts.get(type) || { s: 0, f: 0 };
              stats.s += count;
              this.typeBoosts.set(type, stats);
            }
          }
          for (const d of data.containerDomains || []) {
            this.containerDomains.add(d);
          }
          if (data.version >= 2 && data.urlChains) {
            for (const [key, chains] of Object.entries(data.urlChains)) {
              this.urlChains.set(key, chains);
            }
          }
          this.patterns = (data.patterns || []).slice(-100);
          this.totalAttempts = data.totalAttempts || 0;
          this.successCount = data.successCount || 0;
          getLogger().debug({ path: this.persistPath, domains: this.domainFingerprints.size }, "Memory loaded from disk");
        } catch (err) {
          getLogger().debug({ error: err.message }, "Memory load failed, starting fresh");
        }
      }
      _save() {
        try {
          const domains = {};
          for (const [domain, fp] of this.domainFingerprints) {
            domains[domain] = {
              domain: fp.domain,
              successfulClasses: Object.fromEntries(fp.successfulClasses),
              successfulTypes: Object.fromEntries(fp.successfulTypes),
              failedClasses: Object.fromEntries(fp.failedClasses),
              containerUrls: fp.containerUrls,
              avgResponseTime: fp.avgResponseTime,
              visits: fp.visits,
              lastVisit: fp.lastVisit
            };
          }
          const urlChains = {};
          for (const [key, chains] of this.urlChains) {
            urlChains[key] = chains;
          }
          const data = {
            version: 2,
            domains,
            patterns: this.patterns.slice(-200),
            containerDomains: [...this.containerDomains],
            urlChains,
            totalAttempts: this.totalAttempts,
            successCount: this.successCount
          };
          writeFileSync(this.persistPath, JSON.stringify(data, null, 2));
        } catch (err) {
          getLogger().debug({ error: err.message }, "Memory save failed");
        }
      }
      // ─── Recording ──────────────────────────────────────────────
      recordAttempt(selector, elementType, action, success, urlsFound, urlTypes, domain) {
        this.totalAttempts++;
        const cls = extractClass(selector);
        const dom = domain || this.lastDomain;
        const record = {
          selector,
          selectorClass: cls,
          elementType,
          action,
          urlsFound,
          urlTypes,
          success,
          domain: dom,
          timestamp: Date.now()
        };
        this.patterns.push(record);
        const tKey = elementType;
        const aKey = action;
        if (!this.typeBoosts.has(tKey)) this.typeBoosts.set(tKey, { s: 0, f: 0 });
        if (!this.actionBoosts.has(aKey)) this.actionBoosts.set(aKey, { s: 0, f: 0 });
        if (cls) {
          if (!this.classBoosts.has(cls)) this.classBoosts.set(cls, { s: 0, f: 0 });
          for (const gCls of generalizeClass(cls)) {
            if (!this.classBoosts.has(gCls)) this.classBoosts.set(gCls, { s: 0, f: 0 });
          }
        }
        if (success && urlsFound > 0) {
          this.successCount++;
          this.typeBoosts.get(tKey).s += urlsFound;
          this.actionBoosts.get(aKey).s += 1;
          if (cls) {
            this.classBoosts.get(cls).s += urlsFound;
            for (const gCls of generalizeClass(cls)) {
              this.classBoosts.get(gCls).s += urlsFound * 0.5;
            }
          }
          this._updateDomainFingerprint(dom, cls, elementType, true, urlsFound, urlTypes);
        } else {
          this.typeBoosts.get(tKey).f += 1;
          this.actionBoosts.get(aKey).f += 1;
          if (cls) {
            this.classBoosts.get(cls).f += 1;
            for (const gCls of generalizeClass(cls)) {
              this.classBoosts.get(gCls).f += 1;
            }
          }
          this._updateDomainFingerprint(dom, cls, elementType, false, 0, []);
        }
        if (this.totalAttempts % 10 === 0) {
          this._save();
        }
      }
      // ─── Scoring ────────────────────────────────────────────────
      getTypeBoost(elementType) {
        const stats = this.typeBoosts.get(elementType);
        if (!stats) return 0;
        const est = bayesianEstimate(stats.s, stats.f);
        return Math.round(Math.min(est.mean * 25, 25));
      }
      getActionBoost(action) {
        const stats = this.actionBoosts.get(action);
        if (!stats) return 0;
        const est = bayesianEstimate(stats.s, stats.f);
        return Math.round(Math.min(est.mean * 15, 15));
      }
      getClassBoost(cls) {
        const stats = this.classBoosts.get(cls);
        if (!stats) return 0;
        const est = bayesianEstimate(stats.s, stats.f);
        return Math.round(Math.min(est.mean * 20, 20));
      }
      predictSuccess(elementType, elementClass, domain) {
        const signals = [];
        let totalScore = 0;
        let totalWeight = 0;
        const typeBoost = this.getTypeBoost(elementType);
        if (typeBoost > 0) {
          totalScore += typeBoost / 25;
          totalWeight += 1;
          signals.push("type:" + elementType + "=" + typeBoost + "/25");
        }
        if (elementClass) {
          const classBoost = this.getClassBoost(elementClass);
          if (classBoost > 0) {
            totalScore += classBoost / 20;
            totalWeight += 1.5;
            signals.push("class:" + elementClass + "=" + classBoost + "/20");
          }
        }
        if (domain && this.domainFingerprints.has(domain)) {
          const fp = this.domainFingerprints.get(domain);
          let domSuccesses = 0, domTotal = 0;
          for (const [, v] of fp.successfulClasses) {
            domSuccesses += v;
            domTotal += v;
          }
          for (const [, v] of fp.failedClasses) {
            domTotal += v;
          }
          if (domTotal > 0) {
            const domRate = domSuccesses / domTotal;
            totalScore += domRate;
            totalWeight += 0.5;
            signals.push("domain:" + domain + "=" + Math.round(domRate * 100) + "%");
          }
        }
        if (elementClass) {
          for (const gCls of generalizeClass(elementClass)) {
            const gBoost = this.getClassBoost(gCls);
            if (gBoost > 5) {
              totalScore += gBoost / 40;
              totalWeight += 0.3;
              signals.push("gen:" + gCls + "=" + gBoost + "/20");
            }
          }
        }
        const estimatedSuccess = totalWeight > 0 ? Math.min(1, totalScore / totalWeight) : 0.5;
        const confidence = Math.min(1, totalWeight / 3);
        return { estimatedSuccess, confidence, signals };
      }
      getPredictions() {
        const elementTypes = [...new Set(this.patterns.map(function(p) {
          return p.elementType;
        }))];
        return elementTypes.map(function(type) {
          const pred = this.predictSuccess(type, "", this.lastDomain);
          return { elementType: type, estimatedSuccess: pred.estimatedSuccess, confidence: pred.confidence };
        }, this).sort(function(a, b) {
          return b.estimatedSuccess - a.estimatedSuccess;
        });
      }
      // ─── Container domains ──────────────────────────────────────
      isKnownContainerDomain(domain) {
        if (this.containerDomains.has(domain)) return true;
        const fp = this.domainFingerprints.get(domain);
        return fp ? fp.containerUrls.length > 0 : false;
      }
      addContainerDomain(domain) {
        if (!this.containerDomains.has(domain)) {
          this.containerDomains.add(domain);
          this._save();
        }
      }
      // ─── URL Chain learning ─────────────────────────────────────
      recordChain(fromUrl, toUrl, resultType) {
        const fromDomain = extractDomain(fromUrl);
        const fromPattern = this._extractPathPattern(fromUrl);
        if (!fromPattern || fromPattern.length < 3) return;
        const chainKey = fromDomain + "|" + fromPattern;
        if (!this.urlChains.has(chainKey)) {
          this.urlChains.set(chainKey, []);
        }
        const chains = this.urlChains.get(chainKey);
        const existing = chains.find(function(c) {
          return c.toType === resultType;
        });
        if (existing) {
          existing.confidence = Math.min(100, existing.confidence + 20);
          existing.lastSuccess = Date.now();
        } else {
          chains.push({
            fromPattern,
            toType: resultType,
            confidence: 60,
            lastSuccess: Date.now(),
            sampleFrom: fromUrl.slice(0, 80),
            sampleTo: toUrl.slice(0, 80)
          });
        }
        this._save();
        getLogger().debug({ from: fromPattern, to: resultType }, "URL chain recorded");
      }
      getChainsForDomain(domain) {
        const results = [];
        for (const [key, chains] of this.urlChains) {
          if (key.startsWith(domain + "|")) {
            results.push(...chains);
          }
        }
        return results.sort(function(a, b) {
          return b.confidence - a.confidence;
        });
      }
      _extractPathPattern(url) {
        try {
          let pattern = new URL(url).pathname;
          pattern = pattern.replace(/\/[^/]+\/\d+$/, "/{num}");
          pattern = pattern.replace(/\d+x\d+/, "{ep}");
          const parts = pattern.split("/").filter(Boolean);
          if (parts.length >= 1) {
            const last = parts[parts.length - 1];
            if (!last.includes("{") && !/^\d+$/.test(last)) {
              parts[parts.length - 1] = "{slug}";
            }
          }
          return "/" + parts.join("/") + "/";
        } catch (e) {
          return "";
        }
      }
      // ─── Current domain ─────────────────────────────────────────
      setCurrentDomain(domain) {
        this.lastDomain = domain;
        if (this.domainFingerprints.has(domain)) {
          this.domainFingerprints.get(domain).lastVisit = Date.now();
        }
      }
      getDomainFingerprint(domain) {
        return this.domainFingerprints.get(domain);
      }
      getCurrentDomainSuccessRate() {
        const fp = this.domainFingerprints.get(this.lastDomain);
        if (!fp) return 1;
        let s = 0, f = 0;
        for (const [, v] of fp.successfulClasses) s += v;
        for (const [, v] of fp.failedClasses) f += v;
        if (s + f === 0) return 1;
        return s / (s + f);
      }
      getSuccessRate() {
        if (this.totalAttempts === 0) return 1;
        return this.successCount / this.totalAttempts;
      }
      // ─── Patterns ───────────────────────────────────────────────
      getTopPatterns(limit) {
        limit = limit || 5;
        return this.patterns.filter(function(p) {
          return p.success && p.urlsFound > 0;
        }).sort(function(a, b) {
          return b.urlsFound - a.urlsFound;
        }).slice(0, limit);
      }
      getTopClassesForDomain(domain, limit) {
        limit = limit || 5;
        const fp = this.domainFingerprints.get(domain);
        if (!fp) return [];
        return [...fp.successfulClasses].sort(function(a, b) {
          return b[1] - a[1];
        }).slice(0, limit).map(function(e) {
          return e[0];
        });
      }
      getBestClass() {
        let best = "";
        let bestScore = 0;
        for (const [cls, stats] of this.classBoosts) {
          const est = bayesianEstimate(stats.s, stats.f);
          if (est.mean > bestScore && est.confidence > 1) {
            bestScore = est.mean;
            best = cls;
          }
        }
        return best || null;
      }
      // ─── Report ─────────────────────────────────────────────────
      getAdaptiveScores() {
        const classBoosts = {};
        for (const [cls] of this.classBoosts) {
          classBoosts[cls] = this.getClassBoost(cls);
        }
        let currentFingerprint = null;
        if (this.lastDomain) {
          const fp = this.domainFingerprints.get(this.lastDomain);
          if (fp) {
            currentFingerprint = {
              domain: this.lastDomain,
              topClasses: [...fp.successfulClasses].sort(function(a, b) {
                return b[1] - a[1];
              }).slice(0, 5).map(function(e) {
                return e[0];
              }),
              successRate: this.getCurrentDomainSuccessRate()
            };
          }
        }
        return {
          typeBoosts: Object.fromEntries(
            [...this.typeBoosts.keys()].map(function(k) {
              return [k, this.getTypeBoost(k)];
            }, this)
          ),
          actionBoosts: Object.fromEntries(
            [...this.actionBoosts.keys()].map(function(k) {
              return [k, this.getActionBoost(k)];
            }, this)
          ),
          classBoosts,
          containerDomains: [...this.containerDomains],
          topPatterns: this.getTopPatterns(),
          currentFingerprint,
          predictions: this.getPredictions()
        };
      }
      // ─── Maintenance ────────────────────────────────────────────
      clear() {
        this.patterns = [];
        this.typeBoosts.clear();
        this.actionBoosts.clear();
        this.classBoosts.clear();
        this.containerDomains.clear();
        this.domainFingerprints.clear();
        this.successCount = 0;
        this.totalAttempts = 0;
        this.lastDomain = "";
        this._save();
      }
      forceSave() {
        this._save();
      }
      // ─── Internal ───────────────────────────────────────────────
      _updateDomainFingerprint(domain, cls, elementType, success, urlsFound, urlTypes) {
        if (!domain) return;
        if (!this.domainFingerprints.has(domain)) {
          this.domainFingerprints.set(domain, {
            domain,
            successfulClasses: /* @__PURE__ */ new Map(),
            successfulTypes: /* @__PURE__ */ new Map(),
            failedClasses: /* @__PURE__ */ new Map(),
            containerUrls: [],
            avgResponseTime: 0,
            visits: 0,
            lastVisit: Date.now()
          });
        }
        const fp = this.domainFingerprints.get(domain);
        fp.visits++;
        fp.lastVisit = Date.now();
        if (success && urlsFound > 0) {
          if (cls) {
            fp.successfulClasses.set(cls, (fp.successfulClasses.get(cls) || 0) + urlsFound);
          }
          fp.successfulTypes.set(elementType, (fp.successfulTypes.get(elementType) || 0) + urlsFound);
          for (const ut of urlTypes) {
            if (ut.startsWith("http")) {
              try {
                const dom = new URL(ut).hostname.replace("www.", "");
                if (!fp.containerUrls.includes(dom)) {
                  fp.containerUrls.push(dom);
                }
                this.containerDomains.add(dom);
              } catch (e) {
              }
            } else if (ut === "embed" || ut === "download") {
              if (!fp.containerUrls.includes(domain)) {
                fp.containerUrls.push(domain);
              }
              this.containerDomains.add(domain);
            }
          }
        } else {
          if (cls) {
            fp.failedClasses.set(cls, (fp.failedClasses.get(cls) || 0) + 1);
          }
        }
      }
    };
    var defaultMemory = null;
    function getSessionMemory() {
      if (!defaultMemory) {
        defaultMemory = new SessionMemory();
      }
      return defaultMemory;
    }
    function resetSessionMemory() {
      if (defaultMemory) defaultMemory.forceSave();
      if (defaultMemory) defaultMemory.clear();
      defaultMemory = null;
    }
    module2.exports = {
      SessionMemory,
      textSimilarity,
      getSessionMemory,
      resetSessionMemory
    };
  }
});

// src/intelligent/smart-analyzer.js
var require_smart_analyzer = __commonJS({
  "src/intelligent/smart-analyzer.js"(exports2, module2) {
    var ACTION_PATTERNS = {
      "play-video": {
        words: [/play|reproduc|ver|watch|mirar|reproducir|stream|video|pelicula|movie|mirar/i],
        classPatterns: [/player|video|reproduc|stream|watch/i],
        attrPatterns: [/play|video|stream|reproduc|embed/i],
        baseScore: 25
      },
      "switch-server": {
        words: [/server|servidor|opcion|mirror|fuente|source|cdn|host|altern/i],
        classPatterns: [/server|servidor|mirror|source|option/i],
        attrPatterns: [/server|source|mirror|cdn/i],
        baseScore: 25
      },
      "change-language": {
        words: [/idioma|language|lang|audio|doblaje|dub|sub|subtit|castellano|latino|español|english|japanese|portuguese/i],
        classPatterns: [/idioma|language|lang|audio|dub/i],
        attrPatterns: [/lang|language|audio|dub/i],
        baseScore: 25
      },
      "download": {
        words: [/download|descarg|bajar|descarga|guardar/i],
        classPatterns: [/download|descarg|btn-descarg/i],
        attrPatterns: [/download|descarg/i],
        baseScore: 25
      },
      "navigate-episode": {
        words: [/episodio|episode|capitulo|chapter|cap\.?\s*\d|ep\.?\s*\d|^\d{1,4}$/i],
        classPatterns: [/episod|episode|capitul|chapter/i],
        attrPatterns: [/episod|episode|chapter/i],
        baseScore: 20
      },
      "search": {
        words: [/buscar|search|busqueda|find|encontrar|filt/i],
        classPatterns: [/search|buscar|filtro|filter|find/i],
        attrPatterns: [/search|buscar|filter/i],
        baseScore: 30
      },
      "filter": {
        words: [/filtro|filter|categoria|category|genero|genre|año|year|tipo|type|orden/i],
        classPatterns: [/filter|filtro|categor|genero|genre/i],
        attrPatterns: [/filter|categor/i],
        baseScore: 20
      },
      "login": {
        words: [/login|iniciar|regist|cuenta|account|sign.?in|sign.?up|perfil|profile/i],
        classPatterns: [/login|auth|account|user|sign/i],
        attrPatterns: [/login|auth|account/i],
        baseScore: 20
      },
      "social": {
        words: [/discord|telegram|facebook|twitter|instagram|whatsapp|reddit|youtube|tiktok/i],
        classPatterns: [/social|share|discord|telegram/i],
        attrPatterns: [/social|share/i],
        baseScore: 20
      },
      "ad": {
        words: [/publicidad|anuncio|advert|patrocin/i],
        classPatterns: [/ad|ads|banner|publi|advert/i],
        attrPatterns: [/ad|ads/i],
        baseScore: 15
      }
    };
    var URL_DOMAIN_KB = {
      "streamtape.com": { type: "embed", isContainer: true },
      "streamtape.net": { type: "embed", isContainer: true },
      "uqload.com": { type: "embed", isContainer: true },
      "uqload.co": { type: "embed", isContainer: true },
      "ok.ru": { type: "embed", isContainer: true },
      "mega.nz": { type: "download", isContainer: true },
      "mega.co.nz": { type: "download", isContainer: true },
      "yourupload.com": { type: "embed", isContainer: true },
      "swhoi.com": { type: "embed", isContainer: true },
      "netu.tv": { type: "embed", isContainer: true },
      "netu.io": { type: "embed", isContainer: true },
      "filemoon.sx": { type: "embed", isContainer: true },
      "filemoon.to": { type: "embed", isContainer: true },
      "streamwish.to": { type: "embed", isContainer: true },
      "sfastwish.com": { type: "embed", isContainer: true },
      "flaswish.com": { type: "embed", isContainer: true },
      "embedwish.com": { type: "embed", isContainer: true },
      "cdnwish.com": { type: "cdn", isContainer: false },
      "hgcloud.to": { type: "embed", isContainer: true },
      "bysekoze.com": { type: "embed", isContainer: true },
      "hqq.tv": { type: "embed", isContainer: true },
      "hqq.watch": { type: "embed", isContainer: true },
      "discord.com": { type: "social", isContainer: false },
      "discord.gg": { type: "social", isContainer: false },
      "telegram.me": { type: "social", isContainer: false },
      "t.me": { type: "social", isContainer: false },
      "facebook.com": { type: "social", isContainer: false },
      "instagram.com": { type: "social", isContainer: false },
      "twitter.com": { type: "social", isContainer: false },
      "x.com": { type: "social", isContainer: false },
      "youtube.com": { type: "direct-video", isContainer: false },
      "youtu.be": { type: "direct-video", isContainer: false },
      "google.com": { type: "tracking", isContainer: false },
      "googletagmanager.com": { type: "tracking", isContainer: false },
      "doubleclick.net": { type: "tracking", isContainer: false },
      "googlesyndication.com": { type: "tracking", isContainer: false },
      "cloudflare.com": { type: "cdn", isContainer: false },
      "jsdelivr.net": { type: "cdn", isContainer: false },
      "cdnjs.com": { type: "cdn", isContainer: false },
      "unpkg.com": { type: "cdn", isContainer: false },
      "mp4upload.com": { type: "embed", isContainer: true },
      "dood.so": { type: "embed", isContainer: true },
      "dood.ws": { type: "embed", isContainer: true },
      "dood.wf": { type: "embed", isContainer: true },
      "dood.re": { type: "embed", isContainer: true },
      "dood.sh": { type: "embed", isContainer: true },
      "mixdrop.co": { type: "embed", isContainer: true },
      "mixdrop.ag": { type: "embed", isContainer: true },
      "voe.sx": { type: "embed", isContainer: true },
      "vidhide.com": { type: "embed", isContainer: true },
      "vidmoly.to": { type: "embed", isContainer: true },
      "upstream.to": { type: "embed", isContainer: true },
      "vidoza.net": { type: "embed", isContainer: true },
      "fembed.com": { type: "embed", isContainer: true },
      "animejara.com": { type: "navigation", isContainer: true },
      "henaojara.com": { type: "navigation", isContainer: true },
      "tioanime.com": { type: "navigation", isContainer: true },
      "animeflv.net": { type: "navigation", isContainer: true },
      "jkanime.net": { type: "navigation", isContainer: true },
      "monoschinos.com": { type: "navigation", isContainer: true },
      "monoschinos2.net": { type: "navigation", isContainer: true },
      // Additional embed domains (from test verification)
      "burstcloud.cc": { type: "embed", isContainer: true },
      "burstcloud.to": { type: "embed", isContainer: true },
      "hydrax.net": { type: "embed", isContainer: true },
      "sbplay2.com": { type: "embed", isContainer: true },
      "sbplay3.com": { type: "embed", isContainer: true },
      // Anime site domains (for proper classification)
      "animeav1.com": { type: "navigation", isContainer: true },
      "anime-jl.net": { type: "navigation", isContainer: true },
      "latanime.org": { type: "navigation", isContainer: true },
      "tiodonghua.com": { type: "navigation", isContainer: true },
      "animeonline.ninja": { type: "navigation", isContainer: true },
      "estrenosanime.net": { type: "navigation", isContainer: true },
      "mundodonghua.com": { type: "navigation", isContainer: true },
      // Additional embed/server domains
      "jawcloud.co": { type: "embed", isContainer: true },
      "vidlox.me": { type: "embed", isContainer: true },
      "vidfast.co": { type: "embed", isContainer: true },
      "sendvid.com": { type: "embed", isContainer: true },
      "zippyshare.com": { type: "download", isContainer: false },
      "gounlimited.to": { type: "embed", isContainer: true },
      "vidlox.net": { type: "embed", isContainer: true },
      "vidlox.tv": { type: "embed", isContainer: true },
      "wolfmax4k.com": { type: "embed", isContainer: false },
      "streamlare.com": { type: "embed", isContainer: true },
      "jaw.cloud": { type: "embed", isContainer: true },
      "vudeo.net": { type: "embed", isContainer: true },
      "vidozahd.com": { type: "embed", isContainer: true },
      "uptobox.com": { type: "embed", isContainer: true },
      "tapecontent.net": { type: "embed", isContainer: true },
      "stpete.net": { type: "embed", isContainer: true },
      // Download/file hosting domains
      "mediafire.com": { type: "download", isContainer: true },
      "drive.google.com": { type: "download", isContainer: true },
      "dropbox.com": { type: "download", isContainer: true },
      "1fichier.com": { type: "download", isContainer: true }
    };
    var KNOWN_SERVERS = {
      "streamtape.com": "StreamTape",
      "streamtape.net": "StreamTape",
      "yourupload.com": "YourUpload",
      "mega.nz": "MEGA",
      "mega.co.nz": "MEGA",
      "ok.ru": "OK.ru",
      "uqload.com": "Uqload",
      "uqload.co": "Uqload",
      "hqq.tv": "HQQ",
      "hqq.watch": "HQQ",
      "bysekoze.com": "BySekoze",
      "swhoi.com": "SWHOI",
      "netu.tv": "Netu",
      "netu.io": "Netu",
      "filemoon.sx": "Filemoon",
      "filemoon.to": "Filemoon",
      "streamwish.to": "StreamWish",
      "embedwish.com": "EmbedWish",
      "cdnwish.com": "CDNWish",
      "hgcloud.to": "HGCloud",
      "nyuu.streamhj.top": "Nyuu",
      "multiplayer.streamhj.top": "MultiPlayer",
      "descargas.streamhj.top": "Descargas",
      "descargas.henaojara.com": "Descargas HenaoJara",
      "animejara.com": "AnimeJara",
      "henaojara.com": "HenaoJara",
      "youtube.com": "YouTube",
      "youtu.be": "YouTube",
      "dailymotion.com": "Dailymotion",
      "vimeo.com": "Vimeo",
      "drive.google.com": "Google Drive",
      "dropbox.com": "Dropbox",
      "mediafire.com": "MediaFire",
      "1fichier.com": "1Fichier",
      "mixdrop.co": "MixDrop",
      "mixdrop.ag": "MixDrop",
      "fembed.com": "Fembed",
      "fembed.net": "Fembed",
      "playhydrax.com": "Hydrax",
      "cloudvideo.tv": "CloudVideo",
      "sbembed.com": "SBEmbed",
      "sbembed1.com": "SBEmbed",
      "sbplay.org": "SBPlay",
      "sbplay1.com": "SBPlay",
      "mystream.to": "MyStream",
      "dood.so": "DoodStream",
      "dood.ws": "DoodStream",
      "dood.wf": "DoodStream",
      "voe.sx": "VOE",
      "vidhide.com": "VidHide",
      "vidmoly.to": "VidMoly",
      "mp4upload.com": "MP4Upload",
      "upstream.to": "UpStream",
      "vidoza.net": "Vidoza",
      "burstcloud.cc": "BurstCloud",
      "burstcloud.to": "BurstCloud",
      "vidcloud.tv": "CloudVideo",
      "sbplay2.com": "SBPlay",
      "sbplay3.com": "SBPlay",
      "hydrax.net": "Hydrax",
      "jawcloud.co": "JawCloud",
      "jaw.cloud": "JawCloud",
      "vidlox.me": "VidLox",
      "vidlox.tv": "VidLox",
      "vidlox.net": "VidLox",
      "vidfast.co": "VidFast",
      "sendvid.com": "SendVid",
      "gounlimited.to": "GoUnlimited",
      "wolfmax4k.com": "WolfMax4K",
      "streamlare.com": "StreamLare",
      "vudeo.net": "Vudeo",
      "uptobox.com": "UpToBox",
      "tapecontent.net": "TapeContent"
    };
    var SmartAnalyzer = class {
      constructor() {
        this.urlCache = /* @__PURE__ */ new Map();
        this.intentCache = /* @__PURE__ */ new Map();
      }
      // ─── Element intent classification ──────────────────────────
      classifyElementIntent(el) {
        const cacheKey = el.selector + "|" + el.text;
        const cached = this.intentCache.get(cacheKey);
        if (cached) return cached;
        const combined = this._buildSignalText(el);
        const results = [];
        for (const [action, patterns] of Object.entries(ACTION_PATTERNS)) {
          let score = patterns.baseScore;
          const signals = [];
          for (const re of patterns.words) {
            if (re.test(combined.text)) {
              score += 15;
              signals.push("word:" + re.source.slice(1, -2));
            }
          }
          for (const re of patterns.classPatterns) {
            if (re.test(combined.classes)) {
              score += 12;
              signals.push("class:" + re.source.slice(1, -2));
            }
          }
          for (const re of patterns.attrPatterns) {
            if (re.test(combined.attrs)) {
              score += 8;
              signals.push("attr:" + re.source.slice(1, -2));
            }
          }
          if (el.type === "clickable" || el.type === "link") score += 5;
          if (el.type === "text" || el.type === "container") score -= 10;
          results.push({ action, score: Math.min(100, Math.max(0, score)), signals });
        }
        results.sort(function(a, b) {
          return b.score - a.score;
        });
        const best = results[0];
        const intent = best && best.score >= 35 ? { action: best.action, confidence: best.score, signals: best.signals } : { action: "unknown", confidence: 10, signals: [] };
        this.intentCache.set(cacheKey, intent);
        return intent;
      }
      // ─── Content relevance scoring ──────────────────────────────
      scoreContentRelevance(el, memory) {
        const factors = [];
        let total = 0;
        const intent = this.classifyElementIntent(el);
        const intentScores = {
          "play-video": 30,
          "switch-server": 30,
          "download": 25,
          "navigate-episode": 20,
          "change-language": 18,
          "search": 10,
          "filter": 12,
          "sort": 5,
          "navigate-page": 8,
          "login": -20,
          "social": -15,
          "ad": -25,
          "unknown": 5
        };
        const intentScore = intentScores[intent.action] || 5;
        total += intentScore;
        factors.push({ factor: "intent:" + intent.action, contribution: intentScore });
        const typeScores = {
          "clickable": 15,
          "link": 15,
          "list-item": 12,
          "input": 8,
          "select": 8,
          "iframe": 25,
          "video": 30,
          "media": 28,
          "heading": 3,
          "text": 0,
          "image": 3,
          "container": -5
        };
        const typeScore = typeScores[el.type] || 0;
        total += typeScore;
        factors.push({ factor: "type:" + el.type, contribution: typeScore });
        const urls = this._extractElementUrls(el);
        if (urls.length > 0) {
          const urlScore = Math.min(urls.length * 10, 30);
          total += urlScore;
          factors.push({ factor: "has-urls", contribution: urlScore });
        }
        if (el.depth <= 3) {
          total += 8;
          factors.push({ factor: "shallow-depth", contribution: 8 });
        } else if (el.depth > 10) {
          total -= 5;
          factors.push({ factor: "deep-depth", contribution: -5 });
        }
        if (el.text.length >= 2 && el.text.length <= 40) {
          total += 5;
          factors.push({ factor: "good-text-length", contribution: 5 });
        }
        if (/\d+/.test(el.text)) {
          total += 3;
          factors.push({ factor: "has-numbers", contribution: 3 });
        }
        const dataKeys = Object.keys(el.attr || {}).filter(function(k) {
          return k.startsWith("data-");
        });
        if (dataKeys.length > 0) {
          const dataScore = Math.min(dataKeys.length * 5, 15);
          total += dataScore;
          factors.push({ factor: "has-data-attrs", contribution: dataScore });
        }
        total += 3;
        factors.push({ factor: "visible", contribution: 3 });
        if (memory) {
          const typeBoost = memory.getTypeBoost(el.type);
          if (typeBoost > 0) {
            const memContrib = Math.min(typeBoost, 20);
            total += memContrib;
            factors.push({ factor: "memory:" + el.type, contribution: memContrib });
          }
          const cls = (el.class || "").split(/\s+/)[0];
          if (cls) {
            const classBoost = memory.getClassBoost(cls);
            if (classBoost > 0) {
              const classContrib = Math.min(classBoost, 15);
              total += classContrib;
              factors.push({ factor: "memory-class:" + cls, contribution: classContrib });
            }
          }
          const pred = memory.predictSuccess(el.type, cls);
          if (pred.confidence > 0.3 && pred.estimatedSuccess > 0.5) {
            const predContrib = Math.round(pred.estimatedSuccess * 15);
            total += predContrib;
            factors.push({ factor: "predict:" + el.type, contribution: predContrib });
          }
        }
        const clampedScore = Math.min(100, Math.max(0, total));
        let relevance;
        if (clampedScore >= 55) relevance = "high";
        else if (clampedScore >= 30) relevance = "medium";
        else if (clampedScore >= 10) relevance = "low";
        else relevance = "skip";
        return { score: clampedScore, relevance, factors };
      }
      // ─── URL classification ─────────────────────────────────────
      classifyURL(url, context) {
        const cached = this.urlCache.get(url);
        if (cached) return cached;
        const signals = [];
        let type = "unknown";
        let confidence = 20;
        let isContainer = false;
        const lowerUrl = url.toLowerCase();
        const domain = this.extractDomain(url);
        const path = this._extractPath(url);
        const ext = this._extractExtension(url);
        const known = URL_DOMAIN_KB[domain] || URL_DOMAIN_KB[this._getBaseDomain(domain)];
        if (known) {
          type = known.type;
          isContainer = known.isContainer;
          confidence = 85;
          signals.push("kb:" + domain);
        }
        if (/\.(mp4|mkv|avi|webm|mov|flv|wmv)($|\?)/i.test(lowerUrl)) {
          type = "direct-video";
          confidence = Math.max(confidence, 95);
          signals.push("ext:" + ext);
        } else if (/\.(m3u8|mpd|hls)($|\?)/i.test(lowerUrl)) {
          type = "stream";
          confidence = Math.max(confidence, 90);
          signals.push("ext:" + ext);
        } else if (/\.(zip|rar|7z|tar|gz)($|\?)/i.test(lowerUrl)) {
          type = "download";
          confidence = Math.max(confidence, 80);
          signals.push("ext:" + ext);
        }
        if (/\/embed\/|\/player\/|\/reproductor\/|embed\.php|player\.php|reproductor/i.test(path)) {
          if (type === "unknown") type = "embed";
          isContainer = true;
          confidence = Math.max(confidence, 75);
          signals.push("path:embed");
        }
        if (/\/download\/|\/descargar\/|\/d\/|\/descarga\/|download\.php|descargar\.php/i.test(path)) {
          if (type === "unknown") type = "download";
          confidence = Math.max(confidence, 70);
          signals.push("path:download");
        }
        if (/\/video\/|\/v\/|\/stream\/|\.mp4|\.m3u8/i.test(path)) {
          if (type === "unknown") type = "direct-video";
          confidence = Math.max(confidence, 65);
          signals.push("path:video");
        }
        if (/\/e\/|\/episodio\/|\/episode\/|\/capitulo\/|\/chapter\/|\/ver\//i.test(path)) {
          if (type === "unknown") type = "navigation";
          isContainer = true;
          confidence = Math.max(confidence, 60);
          signals.push("path:episode");
        }
        if (context) {
          const ctx = context.toLowerCase();
          if (/server|servidor|mirror|opcion/i.test(ctx)) {
            if (type === "unknown") type = "embed";
            isContainer = true;
            confidence = Math.max(confidence, 65);
            signals.push("ctx:server");
          }
          if (/download|descarg/i.test(ctx)) {
            if (type === "unknown") type = "download";
            confidence = Math.max(confidence, 65);
            signals.push("ctx:download");
          }
          if (/play|reproduc|ver|watch/i.test(ctx)) {
            if (type === "unknown") type = "embed";
            isContainer = true;
            confidence = Math.max(confidence, 60);
            signals.push("ctx:play");
          }
          if (/episodio|episode|capitulo|chapter/i.test(ctx)) {
            if (type === "unknown") type = "navigation";
            confidence = Math.max(confidence, 55);
            signals.push("ctx:episode");
          }
          if (/idioma|language|lang/i.test(ctx)) {
            confidence = Math.max(confidence, 50);
            signals.push("ctx:language");
          }
        }
        if (/[?&](token|auth|key|api|session|sid)=/i.test(lowerUrl)) {
          isContainer = false;
          signals.push("query:auth");
        }
        if (/[?&](redirect|url|goto|return|next)=/i.test(lowerUrl)) {
          isContainer = true;
          signals.push("query:redirect");
        }
        if (/analytics|track|pixel|beacon|stats|metric|collect/i.test(domain)) {
          type = "tracking";
          confidence = 80;
          signals.push("domain:tracking");
        }
        const result = {
          type,
          confidence: Math.min(100, confidence),
          isContainer,
          signals
        };
        this.urlCache.set(url, result);
        return result;
      }
      // ─── Prioritize elements for exploration ────────────────────
      prioritizeElements(elements, memory) {
        const self = this;
        const scored = elements.map(function(el) {
          return {
            el,
            score: self.scoreContentRelevance(el, memory),
            intent: self.classifyElementIntent(el)
          };
        });
        scored.sort(function(a, b) {
          if (a.score.relevance === "skip" && b.score.relevance !== "skip") return 1;
          if (b.score.relevance === "skip" && a.score.relevance !== "skip") return -1;
          if (a.score.score !== b.score.score) return b.score.score - a.score.score;
          return a.el.depth - b.el.depth;
        });
        return scored.filter(function(s) {
          if (s.intent.action === "ad" || s.intent.action === "social" || s.intent.action === "login") return false;
          return true;
        }).map(function(s) {
          return s.el;
        });
      }
      // ─── Full page analysis ─────────────────────────────────────
      analyze(elements) {
        const elementIntents = /* @__PURE__ */ new Map();
        const contentScores = /* @__PURE__ */ new Map();
        const urlClassifications = /* @__PURE__ */ new Map();
        const serverElements = [];
        const videoElements = [];
        const downloadElements = [];
        const navigationElements = [];
        let highRelevanceCount = 0;
        let contentElementCount = 0;
        for (const el of elements) {
          const intent = this.classifyElementIntent(el);
          const score = this.scoreContentRelevance(el);
          const urls = this._extractElementUrls(el);
          elementIntents.set(el.selector, intent);
          contentScores.set(el.selector, score);
          for (const url of urls) {
            if (!urlClassifications.has(url)) {
              urlClassifications.set(url, this.classifyURL(url, el.text));
            }
          }
          if (score.relevance === "high") highRelevanceCount++;
          if (score.relevance !== "skip") contentElementCount++;
          switch (intent.action) {
            case "switch-server":
              serverElements.push(el);
              break;
            case "play-video":
              videoElements.push(el);
              break;
            case "download":
              downloadElements.push(el);
              break;
            case "navigate-episode":
              navigationElements.push(el);
              break;
          }
        }
        return {
          elementIntents,
          contentScores,
          urlClassifications,
          summary: {
            contentElementCount,
            highRelevanceCount,
            serverElements,
            videoElements,
            downloadElements,
            navigationElements
          }
        };
      }
      // ─── Server name inference ──────────────────────────────────
      inferServerName(domain) {
        if (KNOWN_SERVERS[domain]) return KNOWN_SERVERS[domain];
        const parts = domain.replace(/^www\.|^embed\.|^player\.|^cdn\.|^api\.|^static\./i, "").split(".");
        const main = parts.length > 1 ? parts[parts.length - 2] : parts[0];
        return main.charAt(0).toUpperCase() + main.slice(1).slice(0, 24);
      }
      // ─── URL candidate inference ────────────────────────────────
      inferCandidateUrls(knownUrls, searchTerm, baseUrl) {
        const candidates = [];
        const term = searchTerm.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        if (term.length < 2) return [];
        const pathPatterns = /* @__PURE__ */ new Map();
        for (const url of knownUrls) {
          try {
            const u = new URL(url);
            const path = u.pathname;
            const segments = path.split("/").filter(Boolean);
            for (let i = 0; i < segments.length; i++) {
              const template = segments.map(function(s, idx) {
                if (idx === i) return "{slug}";
                if (/^\d+$/.test(s) || /\d+x\d+/.test(s)) return "{num}";
                return s;
              });
              const pattern = "/" + template.join("/") + "/";
              pathPatterns.set(pattern, (pathPatterns.get(pattern) || 0) + 1);
            }
          } catch (e) {
          }
        }
        const sortedPatterns = [...pathPatterns.entries()].filter(function([, count]) {
          return count >= 2;
        }).sort(function(a, b) {
          return b[1] - a[1];
        });
        for (const [pattern, count] of sortedPatterns) {
          const candidatePath = pattern.replace("{slug}", term).replace(/\{num\}/g, "");
          try {
            const base = new URL(baseUrl);
            const candidateUrl = base.origin + candidatePath;
            if (!knownUrls.includes(candidateUrl)) {
              candidates.push({ url: candidateUrl, confidence: Math.min(100, count * 25), pattern });
            }
          } catch (e) {
          }
        }
        return candidates.sort(function(a, b) {
          return b.confidence - a.confidence;
        }).slice(0, 4).map(function(c) {
          return c.url;
        });
      }
      // ─── Utilities ──────────────────────────────────────────────
      _buildSignalText(el) {
        const text = (el.text || "").toLowerCase();
        const classes = (el.class || "").toLowerCase();
        const attrs = Object.values(el.attr || {}).join(" ").toLowerCase() + " " + Object.keys(el.attr || {}).join(" ").toLowerCase();
        return { text, classes, attrs };
      }
      _extractElementUrls(el) {
        const urls = [];
        const attr = el.attr || {};
        const src = attr.src || attr.href || "";
        if (src && !src.startsWith("#") && !src.startsWith("javascript:") && src !== "about:blank") {
          urls.push(src);
        }
        for (const key of Object.keys(attr)) {
          if (key.startsWith("data-") && /url|src|href|link|video|embed/i.test(key)) {
            const val = attr[key];
            if (val && val.startsWith("http")) urls.push(val);
          }
        }
        const onclick = attr.onclick || "";
        const matches = onclick.match(/https?:\/\/[^'")\s]+/g);
        if (matches) urls.push(...matches);
        return urls;
      }
      extractDomain(url) {
        try {
          return new URL(url).hostname.replace(/^www\d*\./, "");
        } catch (e) {
          return url.replace(/https?:\/\//, "").split(/[/?#]/)[0] || url.slice(0, 40);
        }
      }
      _extractPath(url) {
        try {
          return new URL(url).pathname;
        } catch (e) {
          return url;
        }
      }
      _extractExtension(url) {
        try {
          const path = new URL(url).pathname;
          const match = path.match(/\.([a-z0-9]{2,5})($|\?)/i);
          return match ? match[1] : "";
        } catch (e) {
          return "";
        }
      }
      _getBaseDomain(domain) {
        const stripped = domain.replace(/^(?:ww[0-9]+|vww|www[0-9]*)\./, "");
        return stripped;
      }
      clearCache() {
        this.urlCache.clear();
        this.intentCache.clear();
      }
    };
    var defaultInstance = null;
    function getSmartAnalyzer() {
      if (!defaultInstance) {
        defaultInstance = new SmartAnalyzer();
      }
      return defaultInstance;
    }
    function resetSmartAnalyzer() {
      if (defaultInstance) defaultInstance.clearCache();
      defaultInstance = null;
    }
    module2.exports = {
      SmartAnalyzer,
      getSmartAnalyzer,
      resetSmartAnalyzer,
      KNOWN_SERVERS,
      URL_DOMAIN_KB
    };
  }
});

// src/intelligent/skeleton-detector.js
var require_skeleton_detector = __commonJS({
  "src/intelligent/skeleton-detector.js"(exports2, module2) {
    var { getLogger } = require_logger();
    var SkeletonDetector = class {
      constructor() {
        this.fingerprints = /* @__PURE__ */ new Map();
        this.skeletonSelectors = /* @__PURE__ */ new Map();
        this.skeletonTexts = /* @__PURE__ */ new Map();
      }
      addPageFingerprint(domain, url, selectors, texts, classes) {
        if (!this.fingerprints.has(domain)) {
          this.fingerprints.set(domain, []);
        }
        const fp = {
          url,
          selectors: new Set(selectors),
          texts: new Set(texts),
          classes: new Set(classes)
        };
        const domainFps = this.fingerprints.get(domain);
        domainFps.push(fp);
        if (domainFps.length >= 2) {
          this._detectSkeleton(domain, domainFps);
        }
      }
      isSkeleton(domain, selector, text) {
        const domainSelectors = this.skeletonSelectors.get(domain);
        const domainTexts = this.skeletonTexts.get(domain);
        if (domainSelectors && domainSelectors.has(selector)) return true;
        if (domainTexts && domainTexts.has((text || "").toLowerCase().trim())) return true;
        if (this._isUniversalSkeleton(selector, text)) return true;
        return false;
      }
      _detectSkeleton(domain, fps) {
        if (fps.length < 2) return;
        const selectors = /* @__PURE__ */ new Set();
        const texts = /* @__PURE__ */ new Set();
        const first = fps[0];
        const second = fps[1];
        for (const sel of first.selectors) {
          if (second.selectors.has(sel) && fps.every(function(f) {
            return f.selectors.has(sel);
          })) {
            selectors.add(sel);
          }
        }
        for (const text of first.texts) {
          if (second.texts.has(text) && fps.every(function(f) {
            return f.texts.has(text);
          })) {
            if (text.length >= 2 && text.length <= 40) {
              texts.add(text);
            }
          }
        }
        if (selectors.size > 0 || texts.size > 0) {
          this.skeletonSelectors.set(domain, selectors);
          this.skeletonTexts.set(domain, texts);
          getLogger().info({
            domain,
            skeletonSelectors: selectors.size,
            skeletonTexts: texts.size,
            samples: [...texts].slice(0, 8).join(", ")
          }, "Skeleton detected on domain");
        }
      }
      _isUniversalSkeleton(selector, text) {
        const sel = (selector || "").toLowerCase();
        const txt = (text || "").toLowerCase().trim();
        if (/login|sign.?in|sign.?up|register|regist|iniciar\s*sesi|cerrar\s*sesi|logout|cuenta|account|perfil|profile|contrase|password|olvid|forgot/i.test(txt)) return true;
        if (/nav|menu|header|footer|sidebar|breadcrumb/i.test(sel)) return true;
        if (/discord|telegram|facebook|twitter|instagram|whatsapp|reddit|tiktok|youtube/i.test(txt)) return true;
        if (/cookie|privac|dmca|terms|tos|condiciones|aceptar|rechazar/i.test(txt)) return true;
        if (/language|idioma|lang|currency|moneda|region|pais/i.test(sel + txt)) return true;
        if (sel.startsWith("footer") || sel.includes(".footer")) return true;
        return false;
      }
      clear() {
        this.fingerprints.clear();
        this.skeletonSelectors.clear();
        this.skeletonTexts.clear();
      }
    };
    module2.exports = { SkeletonDetector };
  }
});

// src/intelligent/static-scraper.js
var require_static_scraper = __commonJS({
  "src/intelligent/static-scraper.js"(exports2, module2) {
    var cheerio = require("cheerio");
    var { SmartAnalyzer } = require_smart_analyzer();
    var { SessionMemory, textSimilarity } = require_session_memory();
    var { getLogger } = require_logger();
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36";
    var StaticScraper = class {
      constructor() {
        this.ai = new SmartAnalyzer();
        this.memory = new SessionMemory();
      }
      analyze(url) {
        return __async(this, null, function* () {
          const log = getLogger();
          const start = Date.now();
          log.info({ url }, "Static analysis started (no browser)");
          const html = yield this._fetchHtml(url);
          if (!html) {
            return this._emptyResult(url, start);
          }
          const $ = cheerio.load(html);
          const elements = this._buildStaticModel($);
          log.info({ elements: elements.length }, "Static DOM model built");
          const allUrls = this._extractUrlsFromStatic($, html);
          log.info({ urls: allUrls.length }, "URLs extracted from static HTML");
          const goal = this._detectGoal(elements);
          log.info({ goal }, "Content goal detected");
          const findings = this._classifyUrls(allUrls);
          const serverCatalog = this._buildCatalog(allUrls);
          const duration = Date.now() - start;
          log.info({ servers: serverCatalog.length, urls: allUrls.length, duration }, "Static analysis complete");
          return {
            url,
            title: $("title").text().trim(),
            urlsFound: allUrls.length,
            serverCatalog,
            findings,
            goal,
            durationMs: duration
          };
        });
      }
      // ─── Fetch (lightweight, no browser) ────────────────────────
      _fetchHtml(url) {
        return __async(this, null, function* () {
          const log = getLogger();
          try {
            const response = yield fetch(url, {
              headers: {
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
              },
              signal: AbortSignal.timeout(12e3)
            });
            if (!response.ok) {
              log.warn({ status: response.status, url }, "Fetch failed");
              return null;
            }
            const html = yield response.text();
            log.debug({ bytes: html.length }, "HTML fetched");
            return html;
          } catch (err) {
            log.warn({ url, error: err.message }, "Fetch error");
            return null;
          }
        });
      }
      // ─── Static DOM model (cheerio → RawElement[]) ──────────────
      _buildStaticModel($) {
        const elements = [];
        const self = this;
        $("a, button, input, select, iframe, img, video, audio, li, h1, h2, h3, div, form, span").each(function(i, el) {
          var _a;
          if (i > 300) return false;
          const $el = $(el);
          const tag = (el.tagName || "div").toLowerCase();
          const text = $el.text().trim().replace(/\s+/g, " ").slice(0, 60);
          if (["div", "span"].includes(tag) && text.length === 0 && $el.children().length === 0) return;
          const attrs = {};
          const attrNames = [
            "id",
            "class",
            "href",
            "src",
            "onclick",
            "placeholder",
            "type",
            "alt",
            "title",
            "data-url",
            "data-src",
            "data-anime",
            "data-value"
          ];
          for (const name of attrNames) {
            const val = $el.attr(name);
            if (val) attrs[name] = val.slice(0, 200);
          }
          let type = "container";
          if (tag === "a" || attrs["href"]) type = "link";
          else if (tag === "button" || attrs["onclick"]) type = "clickable";
          else if (tag === "input" || tag === "textarea") type = "input";
          else if (tag === "select") type = "select";
          else if (tag === "img") type = "image";
          else if (tag === "iframe") type = "iframe";
          else if (tag === "video" || tag === "audio") type = "media";
          else if (/^h[1-6]$/.test(tag)) type = "heading";
          else if (tag === "li") type = "list-item";
          const cls = (attrs["class"] || "").split(/\s+/)[0] || "";
          const parent = $el.parent().attr("id") || $el.parent().attr("class") || ((_a = $el.parent().get(0)) == null ? void 0 : _a.tagName) || "";
          elements.push({
            tag,
            text,
            type,
            cls,
            selector: attrs["id"] ? "#" + attrs["id"] : tag + (cls ? "." + cls : ""),
            id: attrs["id"] || "",
            class: (attrs["class"] || "").slice(0, 80),
            attr: attrs,
            children: [],
            parent: (parent || "").toLowerCase(),
            depth: 0
          });
        });
        return elements;
      }
      // ─── URL extraction from static HTML ────────────────────────
      _extractUrlsFromStatic($, html) {
        const seen = /* @__PURE__ */ new Set();
        const add = function(u) {
          if (!u || u.startsWith("#") || u.startsWith("javascript:") || u === "about:blank") return;
          seen.add(u);
        };
        $("iframe").each(function(_, el) {
          add($(el).attr("src") || $(el).attr("data-src") || "");
        });
        $("a[href]").each(function(_, el) {
          const href = $(el).attr("href") || "";
          if (href.startsWith("http") || href.startsWith("/")) add(href);
        });
        $("video, audio, embed, object, source").each(function(_, el) {
          add($(el).attr("src") || $(el).attr("data") || "");
        });
        $("[data-url], [data-src], [data-video], [data-embed], [data-href], [data-link]").each(function(_, el) {
          const dUrl = $(el).attr("data-url") || $(el).attr("data-src") || $(el).attr("data-video") || $(el).attr("data-embed") || $(el).attr("data-href") || $(el).attr("data-link") || "";
          add(dUrl);
        });
        const onclickRegex = /https?:\/\/[^'")\s]+/g;
        const onclickMatches = html.match(onclickRegex);
        if (onclickMatches) onclickMatches.forEach(add);
        const scriptRegex = /https?:\/\/[^"'\s<>]{10,300}/g;
        const scriptMatches = html.match(scriptRegex);
        if (scriptMatches) {
          scriptMatches.filter(function(u) {
            return /player|embed|stream|video|download|descarg|mp4|m3u8|hls|server|cdn/i.test(u);
          }).forEach(add);
        }
        return [...seen];
      }
      // ─── Utilities ──────────────────────────────────────────────
      _detectGoal(elements) {
        const texts = elements.map(function(e) {
          return e.text + " " + e.class;
        }).join(" ").toLowerCase();
        if (/manga|manhwa|cap[ií]tulo|chapter/i.test(texts)) return "manga";
        if (/anime|episodio|pelicula|serie/i.test(texts)) return "video";
        if (/descarg|download|zip|rar/i.test(texts)) return "download";
        if (/galer[ií]a|wallpaper|fanart/i.test(texts)) return "image";
        const hasIframes = elements.some(function(e) {
          return e.type === "iframe";
        });
        return hasIframes ? "video" : "navigation";
      }
      _classifyUrls(urls) {
        const result = {
          videoUrls: [],
          downloadUrls: [],
          serverUrls: [],
          navigationUrls: [],
          otherUrls: []
        };
        const seen = /* @__PURE__ */ new Set();
        for (const url of urls) {
          if (seen.has(url)) continue;
          seen.add(url);
          const cls = this.ai.classifyURL(url);
          switch (cls.type) {
            case "direct-video":
            case "stream":
              result.videoUrls.push(url);
              break;
            case "download":
              result.downloadUrls.push(url);
              break;
            case "embed":
              result.serverUrls.push(url);
              break;
            case "navigation":
              result.navigationUrls.push(url);
              break;
            default:
              result.otherUrls.push(url);
          }
        }
        return result;
      }
      _buildCatalog(urls) {
        const servers2 = /* @__PURE__ */ new Map();
        const self = this;
        for (const url of urls) {
          const domain = this.ai.extractDomain(url);
          const name = this.ai.inferServerName(domain);
          const cls = this.ai.classifyURL(url);
          if (cls.type === "tracking" || cls.type === "social") continue;
          if (!servers2.has(name)) servers2.set(name, []);
          servers2.get(name).push({
            url,
            type: cls.type,
            label: domain.slice(0, 40)
          });
        }
        return [...servers2.entries()].map(function([name, urls2]) {
          var _a;
          return { name, domain: self.ai.extractDomain(((_a = urls2[0]) == null ? void 0 : _a.url) || ""), urls: urls2.slice(0, 8) };
        }).sort(function(a, b) {
          return b.urls.length - a.urls.length;
        });
      }
      _emptyResult(url, start) {
        return {
          url,
          title: "",
          urlsFound: 0,
          serverCatalog: [],
          findings: { videoUrls: [], downloadUrls: [], serverUrls: [], navigationUrls: [], otherUrls: [] },
          goal: "unknown",
          durationMs: Date.now() - start
        };
      }
    };
    module2.exports = { StaticScraper };
  }
});

// src/intelligent/launcher.js
var require_launcher = __commonJS({
  "src/intelligent/launcher.js"(exports2, module2) {
    var { existsSync } = require("fs");
    var { getLogger } = require_logger();
    var KNOWN_CHROME_PATHS = {
      win32: [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        (process.env.LOCALAPPDATA || "") + "\\Google\\Chrome\\Application\\chrome.exe"
      ],
      darwin: [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium"
      ],
      linux: [
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium-browser"
      ]
    };
    function findSystemChrome() {
      const envPath = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
      if (envPath && existsSync(envPath)) return envPath;
      const platform = process.platform;
      const paths = KNOWN_CHROME_PATHS[platform] || [];
      for (const p of paths) {
        if (p && existsSync(p)) return p;
      }
      return null;
    }
    function findSparticuzChromium() {
      return __async(this, null, function* () {
        try {
          const Chromium = require("@sparticuz/chromium");
          if (Chromium && typeof Chromium.executablePath === "function") {
            const path = yield Chromium.executablePath();
            if (path) {
              const args = Chromium.args || [];
              return { path, args };
            }
          }
        } catch (e) {
        }
        return null;
      });
    }
    function createBrowser(config) {
      return __async(this, null, function* () {
        const log = getLogger();
        config = config || {};
        let puppeteer;
        try {
          puppeteer = require("puppeteer-core");
        } catch (e) {
          puppeteer = require("puppeteer");
        }
        const launchArgs = [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--single-process",
          "--disable-zygote",
          "--no-zygote",
          "--memory-pressure-off",
          "--disable-features=TranslateUI",
          "--disable-extensions",
          "--disable-component-extensions-with-background-pages",
          "--disable-background-networking",
          "--disable-sync",
          "--disable-default-apps",
          "--disable-breakpad",
          "--window-size=1280,720"
        ];
        if (config.stealth !== false) {
          launchArgs.push("--disable-blink-features=AutomationControlled");
        }
        const launchOptions = {
          headless: config.headless !== false,
          args: launchArgs,
          timeout: config.timeout || 3e4
        };
        const systemChrome = findSystemChrome();
        if (systemChrome) {
          launchOptions.executablePath = systemChrome;
          log.info({ chromePath: systemChrome }, "Browser: system Chrome");
        } else {
          const sparticuz = yield findSparticuzChromium();
          if (sparticuz) {
            launchOptions.executablePath = sparticuz.path;
            if (sparticuz.args.length > 0) {
              launchOptions.args = [...sparticuz.args, ...launchArgs];
            }
            log.info({ path: sparticuz.path }, "Browser: @sparticuz/chromium");
          } else {
            log.info("Browser: bundled Chromium (puppeteer)");
          }
        }
        const browser = yield puppeteer.launch(launchOptions);
        log.info("Browser launched");
        return browser;
      });
    }
    function createPage(browser, config) {
      return __async(this, null, function* () {
        config = config || {};
        const page = yield browser.newPage();
        yield page.setViewport({ width: 1280, height: 720 });
        yield page.setDefaultTimeout(config.timeout || 3e4);
        if (config.stealth !== false) {
          yield page.evaluateOnNewDocument(function() {
            Object.defineProperty(navigator, "webdriver", { get: function() {
              return false;
            } });
            Object.defineProperty(navigator, "plugins", { get: function() {
              return [1, 2, 3, 4, 5];
            } });
            Object.defineProperty(navigator, "languages", { get: function() {
              return ["es-ES", "es", "en-US", "en"];
            } });
            window.chrome = { runtime: {} };
          });
        }
        yield page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36");
        return page;
      });
    }
    module2.exports = { createBrowser, createPage, findSystemChrome, findSparticuzChromium };
  }
});

// src/intelligent/resource-blocker.js
var require_resource_blocker = __commonJS({
  "src/intelligent/resource-blocker.js"(exports2, module2) {
    var BLOCKED_TYPES = ["image", "media", "font", "stylesheet", "ping"];
    function setupResourceBlocking(page) {
      return __async(this, null, function* () {
        yield page.setRequestInterception(true);
        page.on("request", function(request) {
          const type = request.resourceType();
          if (BLOCKED_TYPES.includes(type)) {
            request.abort();
          } else {
            request.continue();
          }
        });
      });
    }
    function blockResourcesOnly(req) {
      const type = req.resourceType();
      if (BLOCKED_TYPES.includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    }
    module2.exports = { setupResourceBlocking, blockResourcesOnly, BLOCKED_TYPES };
  }
});

// src/intelligent/browser-pool.js
var require_browser_pool = __commonJS({
  "src/intelligent/browser-pool.js"(exports2, module2) {
    var { randomUUID } = require("crypto");
    var { getLogger } = require_logger();
    var BrowserPool = class {
      constructor(launchFn, options) {
        this.instances = [];
        this.waiting = [];
        this.launchFn = launchFn;
        this.options = Object.assign({ min: 0, max: 1, idleTimeoutMs: 3e4 }, options);
        this.closed = false;
        this.cleanupTimer = null;
        this._startCleanup();
      }
      acquire() {
        return __async(this, null, function* () {
          if (this.closed) throw new Error("BrowserPool is closed");
          const free = this.instances.find(function(inst) {
            return !inst.inUse && inst.browser.isConnected();
          });
          if (free) {
            free.inUse = true;
            free.lastUsedAt = Date.now();
            free.usageCount++;
            getLogger().debug({ id: free.id, usageCount: free.usageCount }, "Browser acquired from pool");
            return free;
          }
          if (this.instances.length < this.options.max) {
            const instance = yield this._createInstance();
            instance.inUse = true;
            return instance;
          }
          return new Promise(function(resolve) {
            this.waiting.push(resolve);
          }.bind(this));
        });
      }
      release(instance) {
        return __async(this, null, function* () {
          instance.inUse = false;
          instance.lastUsedAt = Date.now();
          getLogger().debug({ id: instance.id }, "Browser released to pool");
          const next = this.waiting.shift();
          if (next) {
            instance.inUse = true;
            instance.usageCount++;
            next(instance);
          }
        });
      }
      destroyInstance(instance) {
        return __async(this, null, function* () {
          const idx = this.instances.indexOf(instance);
          if (idx !== -1) {
            this.instances.splice(idx, 1);
          }
          try {
            yield instance.browser.close();
            getLogger().debug({ id: instance.id }, "Browser instance destroyed");
          } catch (e) {
          }
        });
      }
      closeAll() {
        return __async(this, null, function* () {
          this.closed = true;
          if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
          }
          const log = getLogger();
          log.info({ count: this.instances.length }, "Closing all browser instances");
          yield Promise.allSettled(this.instances.map(function(inst) {
            return inst.browser.close();
          }));
          this.instances = [];
          this.waiting = [];
        });
      }
      getStats() {
        return {
          total: this.instances.length,
          inUse: this.instances.filter(function(i) {
            return i.inUse;
          }).length,
          free: this.instances.filter(function(i) {
            return !i.inUse && i.browser.isConnected();
          }).length,
          waiting: this.waiting.length
        };
      }
      _createInstance() {
        return __async(this, null, function* () {
          const log = getLogger();
          log.info("Launching new browser instance");
          const browser = yield this.launchFn();
          const instance = {
            id: randomUUID().slice(0, 8),
            browser,
            inUse: false,
            createdAt: Date.now(),
            lastUsedAt: Date.now(),
            usageCount: 0
          };
          this.instances.push(instance);
          log.info({ id: instance.id, total: this.instances.length }, "Browser instance created");
          return instance;
        });
      }
      _startCleanup() {
        const self = this;
        this.cleanupTimer = setInterval(function() {
          self._cleanupIdle();
        }, 3e4);
        if (this.cleanupTimer && typeof this.cleanupTimer.unref === "function") {
          this.cleanupTimer.unref();
        }
      }
      _cleanupIdle() {
        const now = Date.now();
        const toKeep = Math.max(this.options.min, 0);
        const self = this;
        const idle = this.instances.filter(function(inst) {
          return !inst.inUse && now - inst.lastUsedAt > self.options.idleTimeoutMs;
        });
        const toRemove = idle.slice(0, Math.max(0, this.instances.length - toKeep));
        for (const inst of toRemove) {
          getLogger().debug({ id: inst.id, idleMs: now - inst.lastUsedAt }, "Removing idle browser");
          this.destroyInstance(inst);
        }
      }
    };
    module2.exports = { BrowserPool };
  }
});

// src/intelligent/dynamic-handler.js
var require_dynamic_handler = __commonJS({
  "src/intelligent/dynamic-handler.js"(exports2, module2) {
    var { getLogger } = require_logger();
    var DynamicPageHandler = class {
      constructor(page) {
        this.page = page;
        this.adaptiveWaitMs = 2e3;
      }
      navigate(url, options) {
        return __async(this, null, function* () {
          const log = getLogger();
          const timeout = options && options.timeout || 15e3;
          try {
            yield this.page.goto(url, { waitUntil: "domcontentloaded", timeout });
            yield new Promise(function(r) {
              setTimeout(r, 1500);
            });
          } catch (err) {
            log.debug({ url, error: err.message }, "Navigation failed");
          }
        });
      }
      waitForContent(options) {
        return __async(this, null, function* () {
          options = options || {};
          const timeout = options.timeout || 1e4;
          const waitForSelectors = options.waitForSelectors || [];
          const minDomStability = options.minDomStability || 300;
          const checkInterval = options.checkInterval || 250;
          const log = getLogger();
          const start = Date.now();
          let lastNodeCount = 0;
          let stableSince = 0;
          while (Date.now() - start < timeout) {
            yield new Promise(function(r) {
              setTimeout(r, checkInterval);
            });
            const nodeCount = yield this.getDomCount();
            const urlChanged = options.waitForUrlChange ? yield this.page.evaluate(function() {
              return window.__scraper_initial_url !== window.location.href;
            }).catch(function() {
              return false;
            }) : false;
            if (nodeCount === lastNodeCount) {
              stableSince += checkInterval;
            } else {
              stableSince = 0;
              lastNodeCount = nodeCount;
              this.adaptiveWaitMs = Math.min(this.adaptiveWaitMs + 200, 5e3);
            }
            let selectorsReady = true;
            for (let i = 0; i < waitForSelectors.length; i++) {
              const sel = waitForSelectors[i];
              const exists = yield this.page.$(sel).then(function(el) {
                return !!el;
              }).catch(function() {
                return false;
              });
              if (!exists) {
                selectorsReady = false;
                break;
              }
            }
            const domStable = stableSince >= minDomStability;
            const selOk = waitForSelectors.length === 0 || selectorsReady;
            const urlOk = !options.waitForUrlChange || urlChanged;
            if (domStable && selOk && urlOk) {
              log.debug({ elapsed: Date.now() - start, stableMs: stableSince, nodes: nodeCount }, "Content ready");
              return;
            }
          }
          const remaining = timeout - (Date.now() - start);
          if (waitForSelectors.length > 0 && remaining > 0) {
            for (let i = 0; i < waitForSelectors.length; i++) {
              try {
                yield this.page.waitForSelector(waitForSelectors[i], { timeout: remaining });
              } catch (e) {
              }
            }
          }
          const elapsed = Date.now() - start;
          if (elapsed < this.adaptiveWaitMs) {
            yield new Promise(function(r) {
              setTimeout(r, this.adaptiveWaitMs - elapsed);
            }.bind(this));
          }
        });
      }
      triggerLazyElements() {
        return __async(this, null, function* () {
          const result = yield this.page.evaluate(function() {
            let triggered = 0;
            const lazyImgs = document.querySelectorAll('img[loading="lazy"], img[data-src], img[data-lazy], img[data-original]');
            lazyImgs.forEach(function(img) {
              const src = img.getAttribute("data-src") || img.getAttribute("data-lazy") || img.getAttribute("data-original");
              if (src && !img.src) {
                img.src = src;
                triggered++;
              }
              if (img.loading === "lazy") {
                img.loading = "eager";
                triggered++;
              }
            });
            const lazyIframes = document.querySelectorAll('iframe[loading="lazy"], iframe[data-src]');
            lazyIframes.forEach(function(f) {
              const src = f.getAttribute("data-src");
              if (src && !f.src) {
                f.src = src;
                triggered++;
              }
            });
            const hiddenDivs = document.querySelectorAll('[data-loaded="false"], .lazy-hidden, .lazyload');
            hiddenDivs.forEach(function(el) {
              el.style.display = el.style.display || "block";
              el.classList.remove("lazy-hidden", "lazyload");
              triggered++;
            });
            return triggered;
          });
          if (result > 0) {
            getLogger().debug({ triggered: result }, "Lazy elements triggered");
          }
          return result;
        });
      }
      clickAndCaptureUrls(clickSelector, timeout) {
        return __async(this, null, function* () {
          timeout = timeout || 6e3;
          const capturedUrls = /* @__PURE__ */ new Set();
          const handler = function(response) {
            try {
              const url = response.url();
              if (url && url.startsWith("http") && !url.includes("google") && !url.includes("analytics")) {
                capturedUrls.add(url);
              }
            } catch (e) {
            }
          };
          try {
            this.page.on("response", handler);
            yield this.page.waitForSelector(clickSelector, { timeout: 3e3 });
            yield this.page.click(clickSelector);
            yield new Promise(function(r) {
              setTimeout(r, timeout);
            });
            this.page.off("response", handler);
            const iframeUrls = yield this.page.evaluate(function() {
              const iframes = document.querySelectorAll("iframe");
              const urls = [];
              iframes.forEach(function(f) {
                if (f.src && f.src !== "about:blank") urls.push(f.src);
              });
              return urls;
            });
            iframeUrls.forEach(function(u) {
              capturedUrls.add(u);
            });
            return [...capturedUrls];
          } catch (err) {
            this.page.off("response", handler);
            getLogger().debug({ error: err.message }, "clickAndCapture failed");
            return [];
          }
        });
      }
      getDomCount() {
        return __async(this, null, function* () {
          return this.page.evaluate(function() {
            return document.querySelectorAll("*").length;
          });
        });
      }
      getAdaptiveWaitMs() {
        return this.adaptiveWaitMs;
      }
      resetAdaptiveWait() {
        this.adaptiveWaitMs = 2e3;
      }
    };
    module2.exports = { DynamicPageHandler };
  }
});

// src/intelligent/page-type-classifier.js
var require_page_type_classifier = __commonJS({
  "src/intelligent/page-type-classifier.js"(exports2, module2) {
    var PageTypeClassifier = class {
      analyze(elements, pageUrl, pageTitle) {
        const signals = [];
        const keyElements = [];
        const links = elements.filter(function(e) {
          return e.type === "link" && e.attr.href && !e.attr.href.startsWith("#");
        });
        const clickables = elements.filter(function(e) {
          return e.type === "clickable";
        });
        const iframes = elements.filter(function(e) {
          return e.type === "iframe";
        });
        const inputs = elements.filter(function(e) {
          return e.type === "input";
        });
        const listItems = elements.filter(function(e) {
          return e.type === "list-item";
        });
        const images = elements.filter(function(e) {
          return e.type === "image";
        });
        let listingScore = 0;
        const cardClasses = this._findRepeatingClasses(elements, 4);
        if (cardClasses.length > 0) {
          listingScore += 30;
          signals.push("cards:" + cardClasses[0]);
          keyElements.push({ type: "card-grid", selector: "." + cardClasses[0], label: cardClasses[0], count: this._countByClass(elements, cardClasses[0]) });
        }
        if (links.length > 20) {
          listingScore += 15;
          signals.push("many-links");
        }
        const hasPagination = elements.some(function(e) {
          return /pagin|page|naveg/i.test(e.class + e.text);
        });
        if (hasPagination) {
          listingScore += 15;
          signals.push("pagination");
        }
        if (inputs.length > 0) {
          listingScore += 10;
          signals.push("search-input");
        }
        if (/catalogo|directory|browse|list|home|index|inicio/i.test(pageUrl.toLowerCase())) {
          listingScore += 15;
          signals.push("url:catalog");
        }
        let detailScore = 0;
        const episodePattern = listItems.filter(function(e) {
          return /\d+/.test(e.text) && /episod|capitul|chapter|season|temporada|ep\.?\s*\d|cap\.?\s*\d/i.test(e.text + e.class);
        });
        if (episodePattern.length >= 3) {
          detailScore += 40;
          signals.push("episodes:" + episodePattern.length);
          keyElements.push({ type: "episode-list", selector: episodePattern[0].parent || "ul", label: "Episodes", count: episodePattern.length });
        }
        const longTexts = elements.filter(function(e) {
          return e.type === "text" && e.text.length > 80;
        });
        if (longTexts.length >= 1) {
          detailScore += 10;
          signals.push("synopsis");
        }
        const genreTags = elements.filter(function(e) {
          return /accion|comedia|drama|romance|fantasia|terror|aventura|action|comedy|drama|romance|fantasy|horror|adventure|shounen|shoujo|seinen/i.test(e.text) && e.text.length < 20;
        });
        if (genreTags.length >= 2) {
          detailScore += 15;
          signals.push("genres:" + genreTags.length);
        }
        const seasonTabs = elements.filter(function(e) {
          return /season|temporada|temp\.?\s*\d/i.test(e.text + e.class);
        });
        if (seasonTabs.length >= 1) {
          detailScore += 15;
          signals.push("season-tabs");
        }
        let contentScore = 0;
        if (iframes.length > 0) {
          contentScore += 35;
          signals.push("iframes:" + iframes.length);
          keyElements.push({ type: "player", selector: "iframe", label: "Video Player", count: iframes.length });
        }
        const serverButtons = clickables.filter(function(e) {
          return /server|servidor|opcion|mirror|source|fuente|calidad|quality|HD|SD|720|1080/i.test(e.text + e.class);
        });
        if (serverButtons.length >= 2) {
          contentScore += 30;
          signals.push("servers:" + serverButtons.length);
          keyElements.push({ type: "server-buttons", selector: serverButtons[0].selector, label: "Servers", count: serverButtons.length });
        }
        const downloadBtn = clickables.filter(function(e) {
          return /download|descarg/i.test(e.text + e.class);
        });
        if (downloadBtn.length > 0) {
          contentScore += 10;
          signals.push("download-btn");
        }
        const langSelectors = elements.filter(function(e) {
          return /idioma|language|lang|audio|dub|sub|latino|castellano/i.test(e.text + e.class);
        });
        if (langSelectors.length >= 1) {
          contentScore += 10;
          signals.push("language-selector");
        }
        if (/episode|episodio|capitulo|chapter|ver\//i.test(pageUrl.toLowerCase())) {
          contentScore += 15;
          signals.push("url:episode");
        }
        let searchScore = 0;
        if (inputs.length > 0 && /search|buscar|busqueda/i.test((pageTitle || "") + " " + inputs.map(function(e) {
          return e.attr && e.attr.placeholder || "";
        }).join(" "))) {
          searchScore += 30;
          signals.push("search-active");
        }
        if (/search|buscar|busqueda|find|query|q=/i.test(pageUrl.toLowerCase())) {
          searchScore += 30;
          signals.push("url:search");
        }
        const scores = [
          { type: "listing", score: listingScore },
          { type: "detail", score: detailScore },
          { type: "content", score: contentScore },
          { type: "search", score: searchScore }
        ];
        scores.sort(function(a, b) {
          return b.score - a.score;
        });
        const best = scores[0];
        let type = "unknown", confidence = 0, suggestedStrategy = "explore";
        if (best.score >= 40) {
          type = best.type;
          confidence = Math.min(100, best.score);
          switch (type) {
            case "listing":
              suggestedStrategy = "extract-links";
              break;
            case "detail":
              suggestedStrategy = "find-episodes";
              break;
            case "content":
              suggestedStrategy = "click-servers";
              break;
            case "search":
              suggestedStrategy = "search-results";
              break;
          }
        } else if (best.score >= 20) {
          type = best.type;
          confidence = best.score;
          suggestedStrategy = "explore";
        }
        return { type, confidence, signals, suggestedStrategy, keyElements };
      }
      _findRepeatingClasses(elements, minRepeats) {
        const classCounts = /* @__PURE__ */ new Map();
        for (const el of elements) {
          const cls = (el.class || "").split(/\s+/)[0];
          if (cls && cls.length > 2 && cls.length < 40) {
            classCounts.set(cls, (classCounts.get(cls) || 0) + 1);
          }
        }
        return [...classCounts.entries()].filter(function(e) {
          return e[1] >= minRepeats;
        }).sort(function(a, b) {
          return b[1] - a[1];
        }).slice(0, 5).map(function(e) {
          return e[0];
        });
      }
      _countByClass(elements, cls) {
        return elements.filter(function(e) {
          return (e.class || "").includes(cls);
        }).length;
      }
    };
    module2.exports = { PageTypeClassifier };
  }
});

// src/intelligent/autonomous-scraper.js
var require_autonomous_scraper = __commonJS({
  "src/intelligent/autonomous-scraper.js"(exports2, module2) {
    var { SmartAnalyzer } = require_smart_analyzer();
    var { SessionMemory, textSimilarity } = require_session_memory();
    var { DynamicPageHandler } = require_dynamic_handler();
    var { PageTypeClassifier } = require_page_type_classifier();
    var { SkeletonDetector } = require_skeleton_detector();
    var { getLogger } = require_logger();
    var AD_DOMAINS = /analytics|track|pixel|beacon|adexchange|cookielaw|cookiepedia|onetrust|doubleclick|googlesyndication|googletagmanager/i;
    var AutonomousScraper = class {
      constructor(page, options) {
        this.page = page;
        this.visited = /* @__PURE__ */ new Set();
        this.urlCollector = [];
        this.steps = [];
        this.stepCount = 0;
        this.requestCount = 0;
        this.maxRequests = options && options.maxRequests || 50;
        this.searchTerm = options && options.searchTerm || "";
        this.contentGoal = options && options.contentGoal || "auto";
        this.ai = new SmartAnalyzer();
        this.memory = new SessionMemory();
        this.dynamic = new DynamicPageHandler(page);
        this.consecutiveFails = 0;
        this.seenGroupPatterns = /* @__PURE__ */ new Set();
        this.skipClasses = /* @__PURE__ */ new Set();
        this.lastModelUrl = "";
        this.cachedModel = null;
        this.pageClassifier = new PageTypeClassifier();
        this.skeletonDetector = new SkeletonDetector();
        this.MAX_TIME = 9e4;
        this.MAX_DEPTH = options && options.maxDepth || 2;
      }
      _extractDomain(url) {
        try {
          return new URL(url).hostname.replace("www.", "");
        } catch (e) {
          return url.slice(0, 40);
        }
      }
      _throttle() {
        return __async(this, null, function* () {
          this.requestCount++;
          if (this.requestCount > this.maxRequests) {
            getLogger().warn({ max: this.maxRequests }, "Request limit reached");
            return false;
          }
          const delay = 400 + Math.random() * 800;
          yield new Promise(function(r) {
            setTimeout(r, delay);
          });
          return true;
        });
      }
      investigate(url) {
        return __async(this, null, function* () {
          const log = getLogger();
          const start = Date.now();
          this.urlCollector = [];
          this.steps = [];
          this.stepCount = 0;
          this.consecutiveFails = 0;
          this.seenGroupPatterns.clear();
          this.skipClasses.clear();
          const domains = [this._extractDomain(url)];
          for (let d = 0; d < domains.length; d++) {
            const fp = this.memory.getDomainFingerprint(domains[d]);
            if (fp) {
              fp.failedClasses.forEach(function(fails, cls) {
                const succs = fp.successfulClasses.get(cls) || 0;
                if (fails >= 3 && succs === 0) {
                  this.skipClasses.add(cls);
                }
              }.bind(this));
            }
          }
          this.cachedModel = null;
          this.lastModelUrl = "";
          log.info({ skipClasses: this.skipClasses.size }, "Loaded skip classes from memory");
          const knownUrls = /* @__PURE__ */ new Set();
          const visitedPages = /* @__PURE__ */ new Set();
          const self = this;
          const diffAndCollect = function(urls, source, domain) {
            const fresh = [];
            for (let i = 0; i < urls.length; i++) {
              const u = urls[i];
              if (!u || u === "about:blank" || knownUrls.has(u)) continue;
              if (AD_DOMAINS.test(u)) continue;
              if (AD_DOMAINS.test(self._extractDomain(u))) continue;
              knownUrls.add(u);
              fresh.push(u);
              self.urlCollector.push({ url: u, category: "unknown", source: source + " | " + domain });
            }
            return fresh;
          };
          const explorePage = function(pageUrl, depth) {
            return __async(this, null, function* () {
              depth = depth || 0;
              if (Date.now() - start > self.MAX_TIME) return;
              const serverCount = self.urlCollector.filter(function(u) {
                const c = self.ai.classifyURL(u.url, u.source);
                return c.type === "embed" || c.type === "direct-video" || c.type === "stream";
              }).length;
              const effectiveMaxDepth = serverCount >= 3 ? Math.min(self.MAX_DEPTH, depth + 1) : self.MAX_DEPTH;
              if (depth > effectiveMaxDepth) return;
              let fp = pageUrl.split("?")[0].replace(/\/+$/, "");
              fp = fp.replace(/\/\d+$/, "/X");
              if (visitedPages.has(fp)) return;
              visitedPages.add(fp);
              log.debug({ url: pageUrl, depth }, "Exploring");
              yield self.dynamic.navigate(pageUrl, { timeout: 15e3 });
              yield self.dynamic.triggerLazyElements();
              const domain = self._extractDomain(pageUrl);
              self.memory.setCurrentDomain(domain);
              const model2 = yield self._buildModel();
              const skeletonSelectors = self.skeletonDetector.skeletonSelectors && self.skeletonDetector.skeletonSelectors.get(domain);
              if (skeletonSelectors && skeletonSelectors.size > 10 && depth > 0) {
                const totalEls = model2.elements.length;
                let skeletonEls = 0;
                for (let i = 0; i < model2.elements.length; i++) {
                  if (self.skeletonDetector.isSkeleton(domain, model2.elements[i].selector, model2.elements[i].text)) skeletonEls++;
                }
                if (totalEls > 0 && skeletonEls / totalEls > 0.7) {
                  log.debug({ url: pageUrl, skelPct: Math.round(skeletonEls / totalEls * 100) }, "Mostly skeleton, scan-only");
                  const quickUrls = yield self._extractAllUrls();
                  diffAndCollect(quickUrls, "skeleton-scan", pageUrl);
                  return;
                }
              }
              const pageUrls = yield self._extractAllUrls();
              self.skeletonDetector.addPageFingerprint(
                domain,
                pageUrl,
                model2.elements.map(function(e) {
                  return e.selector;
                }),
                model2.elements.map(function(e) {
                  return e.text;
                }),
                model2.elements.map(function(e) {
                  return e.class;
                })
              );
              const pageAnalysis = self.pageClassifier.analyze(model2.elements, pageUrl, model2.title);
              log.info({ type: pageAnalysis.type, conf: pageAnalysis.confidence, signals: pageAnalysis.signals.slice(0, 3).join(", ") }, "Page classified");
              if (pageAnalysis.type === "content") {
                const contentGroups = self._detectGroups(model2.elements);
                for (let g = 0; g < contentGroups.length; g++) {
                  const cg = contentGroups[g];
                  const isServer = /server|servidor|opcion|download|descarg|video|player|reproduct/i.test(cg.label + cg.labels.join(" "));
                  if (!isServer) continue;
                  yield self._logStep("content-servers", cg.label, "Servers: " + cg.labels.slice(0, 5).join(", "));
                  for (let i = 0; i < Math.min(cg.items.length, 6); i++) {
                    if (Date.now() - start > self.MAX_TIME) break;
                    const item = cg.items[i];
                    const captured = yield self.dynamic.clickAndCaptureUrls(item.selector, 5e3);
                    diffAndCollect(captured, item.label, domain);
                    self.memory.recordAttempt(item.selector, "clickable", "click", captured.length > 0, captured.length, captured, domain);
                  }
                }
                const finalContentUrls = yield self._extractAllUrls();
                diffAndCollect(finalContentUrls, "content-final", pageUrl);
                return;
              }
              const groups = self._detectGroups(model2.elements);
              let groupFails = 0;
              for (let g = 0; g < groups.length; g++) {
                if (Date.now() - start > self.MAX_TIME) break;
                if (groupFails >= 2) break;
                const group = groups[g];
                const isNavMenu = /nav|menu|header|footer/i.test(group.label + group.selector);
                if (isNavMenu) continue;
                if (self._shouldSkipElement(group.selector, "group", group.labels.join(","))) continue;
                yield self._logStep("group", group.selector, "Group: " + group.labels.slice(0, 5).join(", "));
                const isServerGroup = /server|servidor|opcion|mirror|source|video|player|netu|yourupload|mega|okru|streamtape|filemoon|uqload|hqq|swhoi|burstcloud|streamwish|logo|download|descarg|idioma|language/i.test(group.label + group.labels.join(" "));
                let groupHadSuccess = false;
                for (let i = 0; i < group.items.length; i++) {
                  if (Date.now() - start > self.MAX_TIME) break;
                  const item = group.items[i];
                  if (visitedPages.has(item.selector)) continue;
                  visitedPages.add(item.selector);
                  if (self._shouldSkipElement(item.selector, "click", item.label)) continue;
                  const href = item.attr && item.attr.href;
                  if (href && !isServerGroup && (href.startsWith("http") || href.startsWith("/")) && !href.startsWith("#") && !href.startsWith("javascript:")) {
                    yield self._logStep("navigate", item.selector, 'Following: "' + item.label + '"');
                    try {
                      yield explorePage(href, depth + 1);
                      visitedPages.add(href.split("?")[0].replace(/\/\d+$/, "/X"));
                      yield self.dynamic.navigate(pageUrl, { timeout: 1e4 });
                      yield self._buildModel();
                      groupHadSuccess = true;
                    } catch (e) {
                      continue;
                    }
                    continue;
                  }
                  if (isServerGroup) {
                    const captured = yield self.dynamic.clickAndCaptureUrls(item.selector, 4e3);
                    const fresh = diffAndCollect(captured, item.label, domain);
                    self.memory.recordAttempt(item.selector, "clickable", "click", fresh.length > 0, fresh.length, fresh, domain);
                    if (fresh.length > 0) groupHadSuccess = true;
                  } else if (i < 2) {
                    yield self._safeClick(item.selector);
                    const after = yield self._extractAllUrls();
                    const fresh = diffAndCollect(after, item.label, domain);
                    self.memory.recordAttempt(item.selector, "clickable", "click", fresh.length > 0, fresh.length, fresh, domain);
                    if (fresh.length > 0) groupHadSuccess = true;
                  }
                }
                if (groupHadSuccess) groupFails = 0;
                else groupFails++;
              }
              const finalUrls = yield self._extractAllUrls();
              diffAndCollect(finalUrls, "final", pageUrl);
              if (depth < self.MAX_DEPTH && pageUrls.length > 0) {
                const containers = pageUrls.filter(function(u) {
                  const cls = self.ai.classifyURL(u, u);
                  if (AD_DOMAINS.test(u)) return false;
                  const d = self._extractDomain(u);
                  if (d === domain && /^\/(login|emision|catalogo|comunidad|peticiones|inicio|registro|profile|cuenta)/i.test(new URL(u).pathname)) return false;
                  return cls.isContainer && (cls.type === "embed" || cls.type === "navigation") || self.memory.isKnownContainerDomain(d);
                }).sort(function(a, b) {
                  const aEmb = /embed|player|reproductor|stream|video/i.test(a) ? 0 : 1;
                  const bEmb = /embed|player|reproductor|stream|video/i.test(b) ? 0 : 1;
                  return aEmb - bEmb;
                }).slice(0, 1);
                for (let c = 0; c < containers.length; c++) {
                  if (Date.now() - start > self.MAX_TIME) break;
                  if (visitedPages.has(containers[c])) continue;
                  yield self._logStep("dive", self._extractDomain(containers[c]), "Deep: " + containers[c].slice(0, 50));
                  try {
                    yield explorePage(containers[c], depth + 1);
                    visitedPages.add(containers[c].split("?")[0].replace(/\/\d+$/, "/X"));
                    yield self.dynamic.navigate(pageUrl, { timeout: 1e4 });
                    yield self._buildModel();
                  } catch (e) {
                    continue;
                  }
                }
              }
            });
          };
          const title = yield this.page.title();
          yield explorePage(url, 0);
          this._categorizeUrls();
          const serverCatalog = this._buildServerCatalog();
          for (let i = 0; i < this.urlCollector.length; i++) {
            const entry = this.urlCollector[i];
            const cls = this.ai.classifyURL(entry.url, entry.source);
            if (cls.type === "embed" || cls.type === "download") {
              const sourceDomain = entry.source.split("|")[1] ? entry.source.split("|")[1].trim() : "";
              if (sourceDomain) {
                this.memory.recordChain(url, entry.url, cls.type === "embed" ? "servers" : "download");
              }
            }
          }
          const duration = Date.now() - start;
          log.info({ steps: this.steps.length, servers: serverCatalog.length, duration }, "Investigation complete");
          this.memory.forceSave();
          const model = this.cachedModel || (yield this._buildModel());
          return {
            url,
            title,
            steps: this.steps,
            serverCatalog,
            findings: this._categorizeUrls(),
            model: { roles: [...new Set(model.elements.map(function(e) {
              return e.type;
            }))], totalElements: model.elements.length, interactions: this.stepCount },
            durationMs: duration
          };
        });
      }
      // ─── Build semantic page model ─────────────────────────────
      _buildModel() {
        return __async(this, null, function* () {
          const currentUrl = this.page.url();
          if (this.cachedModel && this.lastModelUrl === currentUrl) {
            return this.cachedModel;
          }
          const title = yield this.page.title();
          const raw = yield this.page.evaluate(function() {
            function buildSelector(el2) {
              if (el2.id) return "#" + CSS.escape(el2.id);
              var tag = el2.tagName.toLowerCase();
              if (el2.className && typeof el2.className === "string") {
                var classes = el2.className.toString().trim().split(/\s+/);
                var cls = "";
                for (var i2 = 0; i2 < classes.length; i2++) {
                  if (classes[i2].length > 2 && classes[i2].length < 40) {
                    cls = classes[i2];
                    break;
                  }
                }
                if (cls) {
                  var allSame = document.querySelectorAll(tag + "." + CSS.escape(cls));
                  if (allSame.length > 1) {
                    var idx = Array.from(allSame).indexOf(el2) + 1;
                    return tag + "." + CSS.escape(cls) + ":nth-of-type(" + idx + ")";
                  }
                  return tag + "." + CSS.escape(cls);
                }
              }
              var parent = el2.parentElement;
              if (parent) {
                var pidx = Array.from(parent.children).indexOf(el2) + 1;
                return buildSelector(parent) + " > " + tag + ":nth-child(" + pidx + ")";
              }
              return tag;
            }
            function getAttributes(el2) {
              var attrs = {};
              var names = ["id", "class", "href", "src", "onclick", "placeholder", "type", "alt", "title", "data-url", "data-src", "data-anime", "data-value", "aria-label", "role"];
              for (var i2 = 0; i2 < names.length; i2++) {
                var val = el2.getAttribute(names[i2]);
                if (val) attrs[names[i2]] = val.slice(0, 200);
              }
              return attrs;
            }
            function isVisible(el2) {
              if (!el2.offsetParent && el2.tagName !== "BODY" && el2.tagName !== "HTML") return false;
              var style = getComputedStyle(el2);
              return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
            }
            function classify(el2) {
              var tag = el2.tagName.toLowerCase();
              var text = (el2.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
              var attrs = getAttributes(el2);
              if (tag === "input" || tag === "textarea") return "input";
              if (tag === "select") return "select";
              if (tag === "a" || attrs.href) return "link";
              if (tag === "button" || attrs.onclick || attrs.role === "button" || attrs.role === "tab") return "clickable";
              if (tag === "img") return "image";
              if (tag === "iframe") return "iframe";
              if (tag === "video" || tag === "audio") return "media";
              if (/h[1-6]/i.test(tag)) return "heading";
              if (tag === "li") return "list-item";
              if (text.length > 0 && el2.children.length === 0) return "text";
              return "container";
            }
            var elements2 = [];
            var all = document.querySelectorAll("*");
            for (var i = 0; i < all.length; i++) {
              var el = all[i];
              if (!isVisible(el)) continue;
              var type = classify(el);
              if (type === "container" && el.children.length < 2) continue;
              if (type === "container" && el.children.length > 50) continue;
              elements2.push({
                tag: el.tagName,
                selector: buildSelector(el),
                id: el.id || "",
                class: el.className && typeof el.className === "string" ? el.className.toString().trim().slice(0, 80) : "",
                text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
                type,
                attr: getAttributes(el),
                children: [],
                parent: el.parentElement ? el.parentElement.id || (el.parentElement.className && typeof el.parentElement.className === "string" ? el.parentElement.className.toString().split(/\s+/)[0] : "") || el.parentElement.tagName : "",
                depth: 0
              });
            }
            return elements2.slice(0, 300);
          });
          const elements = raw;
          const model = { title, elements, semanticTree: [] };
          this.cachedModel = model;
          this.lastModelUrl = currentUrl;
          return model;
        });
      }
      // ─── Detect button groups ──────────────────────────────────
      _detectGroups(elements) {
        const groups = [];
        const clickables = elements.filter(function(e) {
          return (e.type === "clickable" || e.type === "link") && e.text.length > 1;
        });
        const byParent = /* @__PURE__ */ new Map();
        for (let i = 0; i < clickables.length; i++) {
          const el = clickables[i];
          const parentKey = el.parent || "root";
          if (!byParent.has(parentKey)) byParent.set(parentKey, []);
          byParent.get(parentKey).push(el);
        }
        byParent.forEach(function(siblings) {
          if (siblings.length < 2) return;
          const classes = siblings.map(function(s) {
            return (s.class || "").split(/\s+/)[0];
          }).filter(Boolean);
          const uniqueClasses = [...new Set(classes)];
          if (uniqueClasses.length <= 3 && siblings.length >= 2 && siblings.length <= 20) {
            const skipWords = /login|iniciar|regist|cuenta|discord|telegram|facebook|instagram|chat|cookie|privac|dmca/i;
            const validItems = siblings.filter(function(s) {
              return !skipWords.test(s.text);
            });
            if (validItems.length < 2) return;
            groups.push({
              selector: validItems[0].parent || "body",
              label: validItems[0].parent || "options",
              count: validItems.length,
              labels: validItems.map(function(s) {
                return s.text.slice(0, 30);
              }),
              items: validItems.map(function(s) {
                return { selector: s.selector, label: s.text.slice(0, 30), attr: s.attr };
              })
            });
          }
        });
        return groups;
      }
      // ─── URL extraction ───────────────────────────────────────
      _extractAllUrls() {
        return __async(this, null, function* () {
          const result = yield this.page.evaluate(function() {
            var urls = [];
            var seen = {};
            function add(u) {
              if (!u || seen[u]) return;
              if (u.startsWith("#") || u.startsWith("javascript:") || u.startsWith("data:")) return;
              if (u === "about:blank") return;
              seen[u] = true;
              urls.push(u);
            }
            var iframes = document.querySelectorAll("iframe");
            for (var i = 0; i < iframes.length; i++) {
              add(iframes[i].src || iframes[i].getAttribute("src") || iframes[i].getAttribute("data-src"));
            }
            var mediaEls = document.querySelectorAll("video, video source, audio, audio source, embed, object");
            for (var j = 0; j < mediaEls.length; j++) {
              add(mediaEls[j].src || mediaEls[j].getAttribute("src"));
            }
            var allLinks = document.querySelectorAll("a[href]");
            for (var k = 0; k < Math.min(allLinks.length, 300); k++) {
              add(allLinks[k].href || allLinks[k].getAttribute("href"));
            }
            var clickables = document.querySelectorAll("[onclick]");
            for (var m = 0; m < clickables.length; m++) {
              var oc = clickables[m].getAttribute("onclick") || "";
              var matches = oc.match(/https?:\/\/[^'")\s]+/g);
              if (matches) {
                for (var n = 0; n < matches.length; n++) add(matches[n]);
              }
            }
            var dataEls = document.querySelectorAll("[data-url], [data-src], [data-video], [data-embed], [data-href]");
            for (var q = 0; q < dataEls.length; q++) {
              add(dataEls[q].getAttribute("data-url") || dataEls[q].getAttribute("data-src") || dataEls[q].getAttribute("data-video") || dataEls[q].getAttribute("data-embed") || dataEls[q].getAttribute("data-href"));
            }
            var scripts = document.querySelectorAll("script");
            for (var r = 0; r < scripts.length; r++) {
              var txt = scripts[r].textContent || "";
              if (txt.length < 30 || txt.length > 2e4) continue;
              var urlPatterns = txt.match(/https?:\/\/[^"'\s<>]{10,300}/g);
              if (urlPatterns) {
                for (var s = 0; s < Math.min(urlPatterns.length, 20); s++) {
                  if (/player|embed|stream|video|download|descarg|mp4|m3u8|hls|source|server|cdn/i.test(urlPatterns[s])) {
                    add(urlPatterns[s]);
                  }
                }
              }
            }
            return urls;
          });
          return result || [];
        });
      }
      // ─── Should skip element ───────────────────────────────────
      _shouldSkipElement(selector, elementType, label) {
        const domain = this._extractDomain(this.page.url());
        if (this.skeletonDetector.isSkeleton(domain, selector, label)) return true;
        const match = selector.match(/\.([\w-]+)/) || selector.match(/#([\w-]+)/);
        const cls = match ? match[1] : "";
        if (cls && this.skipClasses.has(cls)) return true;
        const classBoost = this.memory.getClassBoost(cls);
        if (classBoost > 0 && classBoost <= 5) {
          const fp = this.memory.getDomainFingerprint(domain);
          if (fp) {
            const fails = fp.failedClasses.get(cls) || 0;
            const succs = fp.successfulClasses.get(cls) || 0;
            if (fails >= 3 && succs === 0) {
              this.skipClasses.add(cls);
              return true;
            }
            if (fails > succs * 3 && fails >= 5) {
              this.skipClasses.add(cls);
              getLogger().debug({ class: cls, fails, succs }, "Skipping known-failure class");
              return true;
            }
          }
        }
        const groupKey = elementType + "|" + label.slice(0, 30);
        if (this.seenGroupPatterns.has(groupKey)) return true;
        return false;
      }
      // ─── Safe click ────────────────────────────────────────────
      _safeClick(selector) {
        return __async(this, null, function* () {
          try {
            yield this.page.waitForSelector(selector, { timeout: 3e3 });
            yield this.page.click(selector);
            yield new Promise(function(r) {
              setTimeout(r, 1e3);
            });
            return true;
          } catch (err) {
            getLogger().debug({ selector, error: err.message }, "safeClick failed");
            return false;
          }
        });
      }
      // ─── Log step ──────────────────────────────────────────────
      _logStep(action, target, reasoning) {
        return __async(this, null, function* () {
          this.stepCount++;
          getLogger().info({ step: this.stepCount, action, target }, reasoning);
          this.steps.push({
            step: this.stepCount,
            action,
            target,
            reasoning,
            result: { action, target, success: true, changes: 0, newUrls: [] }
          });
        });
      }
      // ─── Categorize URLs ───────────────────────────────────────
      _categorizeUrls() {
        const result = { videoUrls: [], downloadUrls: [], serverUrls: [], navigationUrls: [], otherUrls: [] };
        const seen = /* @__PURE__ */ new Set();
        for (let i = 0; i < this.urlCollector.length; i++) {
          const entry = this.urlCollector[i];
          if (seen.has(entry.url)) continue;
          seen.add(entry.url);
          const cls = this.ai.classifyURL(entry.url, entry.source);
          switch (cls.type) {
            case "direct-video":
            case "stream":
              entry.category = cls.type;
              result.videoUrls.push(entry.url);
              break;
            case "download":
              entry.category = "download";
              result.downloadUrls.push(entry.url);
              break;
            case "embed":
              entry.category = "embed";
              result.serverUrls.push(entry.url);
              break;
            case "navigation":
              entry.category = "navigation";
              result.navigationUrls.push(entry.url);
              break;
            default:
              entry.category = cls.type;
              result.otherUrls.push(entry.url);
          }
        }
        result.videoUrls = [...new Set(result.videoUrls)];
        result.downloadUrls = [...new Set(result.downloadUrls)];
        result.serverUrls = [...new Set(result.serverUrls)];
        result.navigationUrls = [...new Set(result.navigationUrls)];
        result.otherUrls = [...new Set(result.otherUrls)];
        return result;
      }
      // ─── Build server catalog ──────────────────────────────────
      _buildServerCatalog() {
        const servers2 = /* @__PURE__ */ new Map();
        const self = this;
        for (let i = 0; i < this.urlCollector.length; i++) {
          const entry = this.urlCollector[i];
          const domain = this.ai.extractDomain(entry.url);
          const serverName = this.ai.inferServerName(domain);
          if (!servers2.has(serverName)) {
            servers2.set(serverName, []);
          }
          const list = servers2.get(serverName);
          const cls = this.ai.classifyURL(entry.url, entry.source);
          const type = cls.type === "unknown" ? "other" : cls.type;
          list.push({ url: entry.url, type, label: entry.source.split("|")[0].trim().slice(0, 40) });
        }
        const catalog = [];
        servers2.forEach(function(urls, name) {
          const unique = self._deduplicateUrls(urls);
          catalog.push({ name, domain: name, urls: unique });
        });
        return catalog.sort(function(a, b) {
          return b.urls.length - a.urls.length;
        });
      }
      _deduplicateUrls(urls) {
        const seen = /* @__PURE__ */ new Set();
        const result = [];
        const self = this;
        for (let i = 0; i < urls.length; i++) {
          const item = urls[i];
          const fingerprint = self._urlFingerprint(item.url);
          if (seen.has(fingerprint)) continue;
          const existing = result.find(function(r) {
            return self._urlFingerprint(r.url).slice(0, 30) === fingerprint.slice(0, 30);
          });
          if (!existing) {
            seen.add(fingerprint);
            result.push(item);
          }
        }
        return result.slice(0, 8);
      }
      _urlFingerprint(url) {
        try {
          const u = new URL(url);
          const params = new URLSearchParams(u.search);
          const sorted = [...params.entries()].sort().map(function(e) {
            return e[0] + "=" + e[1];
          }).join("&");
          return u.hostname.replace("www.", "") + u.pathname + "?" + sorted;
        } catch (e) {
          return url.replace(/https?:\/\//, "").split("?")[0].slice(0, 60);
        }
      }
      // ─── QUICK EXTRACT: Fast path for content pages (8-15s) ────
      // No recursive exploration — just extract streams from the current page
      quickExtract(url) {
        return __async(this, null, function* () {
          const log = getLogger();
          const start = Date.now();
          this.urlCollector = [];
          this.steps = [];
          this.stepCount = 0;
          log.info("QuickExtract: " + url);
          yield this.dynamic.navigate(url, { timeout: 15e3 });
          yield this.dynamic.triggerLazyElements();
          const domain = this._extractDomain(url);
          this.memory.setCurrentDomain(domain);
          const model = yield this._buildModel();
          const pageAnalysis = this.pageClassifier.analyze(model.elements, url, model.title);
          log.info("Page: " + pageAnalysis.type + " conf=" + pageAnalysis.confidence + " " + pageAnalysis.signals.slice(0, 3).join(", "));
          if (pageAnalysis.type === "content") {
            const iframeUrls = yield this._extractAllUrls();
            for (let i = 0; i < iframeUrls.length; i++) {
              const u = iframeUrls[i];
              if (u && u.startsWith("http") && !AD_DOMAINS.test(u)) {
                this.urlCollector.push({ url: u, category: "unknown", source: "iframe | " + domain });
              }
            }
            const groups = this._detectGroups(model.elements);
            for (let g = 0; g < groups.length; g++) {
              const cg = groups[g];
              const isServer = /server|servidor|opcion|download|descarg|video|player|reproduct|mirror|source|calidad/i.test(cg.label + cg.labels.join(" "));
              if (!isServer) continue;
              log.info("Server group: " + cg.labels.slice(0, 5).join(", "));
              yield this._logStep("click-servers", cg.label, "Clicking: " + cg.labels.slice(0, 5).join(", "));
              for (let i = 0; i < Math.min(cg.items.length, 8); i++) {
                if (Date.now() - start > 3e4) break;
                const item = cg.items[i];
                if (this._shouldSkipElement(item.selector, "click", item.label)) {
                  log.debug("Skip: " + item.label);
                  continue;
                }
                const captured = yield this.dynamic.clickAndCaptureUrls(item.selector, 4e3);
                this.memory.recordAttempt(item.selector, "clickable", "click", captured.length > 0, captured.length, captured, domain);
                if (captured.length > 0) {
                  log.info("Captured " + captured.length + " URLs from: " + item.label);
                  for (let j = 0; j < captured.length; j++) {
                    if (!AD_DOMAINS.test(captured[j])) {
                      this.urlCollector.push({ url: captured[j], category: "unknown", source: item.label + " | " + domain });
                    }
                  }
                }
              }
            }
            const finalUrls = yield this._extractAllUrls();
            for (let i = 0; i < finalUrls.length; i++) {
              if (finalUrls[i] && finalUrls[i].startsWith("http") && !AD_DOMAINS.test(finalUrls[i])) {
                const exists = this.urlCollector.some(function(u) {
                  return u.url === finalUrls[i];
                });
                if (!exists) {
                  this.urlCollector.push({ url: finalUrls[i], category: "unknown", source: "final | " + domain });
                }
              }
            }
          } else {
            log.info("Non-content page (" + pageAnalysis.type + "), extracting visible URLs only");
            const allUrls = yield this._extractAllUrls();
            for (let i = 0; i < allUrls.length; i++) {
              if (allUrls[i] && allUrls[i].startsWith("http") && !AD_DOMAINS.test(allUrls[i])) {
                this.urlCollector.push({ url: allUrls[i], category: "unknown", source: "static | " + domain });
              }
            }
          }
          this._categorizeUrls();
          const serverCatalog = this._buildServerCatalog();
          const duration = Date.now() - start;
          for (let i = 0; i < this.urlCollector.length; i++) {
            const entry = this.urlCollector[i];
            const cls = this.ai.classifyURL(entry.url, entry.source);
            if (cls.type === "embed" || cls.type === "download") {
              this.memory.recordChain(url, entry.url, cls.type === "embed" ? "servers" : "download");
            }
          }
          this.memory.forceSave();
          log.info("QuickExtract done: " + serverCatalog.length + " servers, " + duration + "ms");
          return {
            url,
            title: model.title,
            steps: this.steps,
            serverCatalog,
            findings: this._categorizeUrls(),
            durationMs: duration,
            pageType: pageAnalysis.type,
            pageConfidence: pageAnalysis.confidence
          };
        });
      }
    };
    module2.exports = { AutonomousScraper };
  }
});

// src/intelligent/provider-memory.js
var require_provider_memory = __commonJS({
  "src/intelligent/provider-memory.js"(exports2, module2) {
    var { SessionMemory, getSessionMemory } = require_session_memory();
    var ProviderMemory = class {
      constructor() {
        this.session = getSessionMemory();
        this.providers = /* @__PURE__ */ new Map();
      }
      // ─── Engine tracking ────────────────────────────────────────
      /**
       * Record an engine attempt for a provider
       * @param {string} providerName 
       * @param {string} engine - 'static' | 'dynamic' | 'intelligent'
       * @param {string} phase - 'search' | 'video' | 'episode'
       * @param {boolean} success 
       * @param {number} durationMs 
       * @param {number} resultsCount 
       */
      recordEngineAttempt(providerName, engine, phase, success, durationMs, resultsCount) {
        if (!this.providers.has(providerName)) {
          this.providers.set(providerName, this._emptyProvider());
        }
        const p = this.providers.get(providerName);
        p.totalAttempts++;
        if (success) p.successCount++;
        if (durationMs) p.lastDuration = durationMs;
        if (!p.engines[engine]) {
          p.engines[engine] = { successes: 0, failures: 0, totalDuration: 0, avgDuration: 0, phases: {} };
        }
        const e = p.engines[engine];
        if (success) e.successes++;
        else e.failures++;
        e.totalDuration += durationMs || 0;
        e.avgDuration = Math.round(e.totalDuration / (e.successes + e.failures));
        if (!e.phases[phase]) {
          e.phases[phase] = { successes: 0, failures: 0 };
        }
        if (success) e.phases[phase].successes++;
        else e.phases[phase].failures++;
        if (success && resultsCount > 0) {
          this.session.recordAttempt(engine, "provider", phase, success, resultsCount, [], providerName);
        }
        this._autoSave();
      }
      // ─── Strategy recommendation ─────────────────────────────────
      /**
       * Get the recommended engine order for a provider
       * Returns engines sorted by success rate (best first)
       */
      getEngineOrder(providerName) {
        const p = this.providers.get(providerName);
        if (!p || Object.keys(p.engines).length === 0) {
          return ["static", "intelligent", "dynamic"];
        }
        const scored = Object.entries(p.engines).map(([name, stats]) => {
          const total = stats.successes + stats.failures;
          const rate = total > 0 ? stats.successes / total : 0;
          const confidence = Math.min(total / 5, 1);
          return {
            engine: name,
            successRate: rate,
            confidence,
            score: rate * confidence,
            successes: stats.successes,
            failures: stats.failures,
            avgDuration: stats.avgDuration
          };
        });
        scored.sort((a, b) => {
          const scoreA = a.score - (a.engine !== "static" ? 0.05 : 0);
          const scoreB = b.score - (b.engine !== "static" ? 0.05 : 0);
          return scoreB - scoreA;
        });
        return scored.map((s) => s.engine);
      }
      // ─── Provider health ─────────────────────────────────────────
      getProviderStats(providerName) {
        const p = this.providers.get(providerName);
        if (!p) return null;
        const engines = {};
        for (const [name, e] of Object.entries(p.engines)) {
          const total = e.successes + e.failures;
          engines[name] = {
            successRate: total > 0 ? Math.round(e.successes / total * 100) : 0,
            successes: e.successes,
            failures: e.failures,
            avgDuration: e.avgDuration,
            phases: e.phases
          };
        }
        return {
          name: providerName,
          totalAttempts: p.totalAttempts,
          successRate: p.totalAttempts > 0 ? Math.round(p.successCount / p.totalAttempts * 100) : 0,
          lastDuration: p.lastDuration,
          recommendedOrder: this.getEngineOrder(providerName),
          engines
        };
      }
      // ─── Selector tracking ───────────────────────────────────────
      recordSelectorAttempt(providerName, selector, phase, success) {
        if (!this.providers.has(providerName)) {
          this.providers.set(providerName, this._emptyProvider());
        }
        const p = this.providers.get(providerName);
        if (!p.selectors[selector]) {
          p.selectors[selector] = { successes: 0, failures: 0 };
        }
        if (success) p.selectors[selector].successes++;
        else p.selectors[selector].failures++;
      }
      getBestSelectors(providerName) {
        const p = this.providers.get(providerName);
        if (!p) return [];
        return Object.entries(p.selectors).map(([sel, s]) => ({
          selector: sel,
          successRate: s.successes + s.failures > 0 ? s.successes / (s.successes + s.failures) : 0,
          attempts: s.successes + s.failures
        })).sort((a, b) => b.successRate - a.successRate).slice(0, 10);
      }
      // ─── Persistence ─────────────────────────────────────────────
      _autoSave() {
        let total = 0;
        for (const p of this.providers.values()) total += p.totalAttempts;
        if (total % 10 === 0) {
          this.session.forceSave();
          this._saveProviderData();
        }
      }
      _saveProviderData() {
        try {
          const { writeFileSync } = require("fs");
          const { join } = require("path");
          const data = {};
          for (const [name, p] of this.providers) {
            data[name] = {
              totalAttempts: p.totalAttempts,
              successCount: p.successCount,
              lastDuration: p.lastDuration,
              engines: p.engines,
              selectors: p.selectors
            };
          }
          writeFileSync(
            join(process.cwd(), ".provider-memory.json"),
            JSON.stringify(data, null, 2)
          );
        } catch (e) {
        }
      }
      _loadProviderData() {
        try {
          const { existsSync, readFileSync } = require("fs");
          const { join } = require("path");
          const path = join(process.cwd(), ".provider-memory.json");
          if (!existsSync(path)) return;
          const raw = readFileSync(path, "utf-8");
          const data = JSON.parse(raw);
          for (const [name, p] of Object.entries(data)) {
            this.providers.set(name, {
              totalAttempts: p.totalAttempts || 0,
              successCount: p.successCount || 0,
              lastDuration: p.lastDuration || 0,
              engines: p.engines || {},
              selectors: p.selectors || {}
            });
          }
        } catch (e) {
        }
      }
      // ─── Bulk operations ─────────────────────────────────────────
      getAllStats() {
        const stats = [];
        for (const [name] of this.providers) {
          stats.push(this.getProviderStats(name));
        }
        return stats.sort((a, b) => b.successRate - a.successRate);
      }
      getTopProviders(minAttempts = 3) {
        return this.getAllStats().filter((s) => s.totalAttempts >= minAttempts);
      }
      getFailingProviders(minAttempts = 3) {
        return this.getAllStats().filter((s) => s.totalAttempts >= minAttempts && s.successRate < 30);
      }
      _emptyProvider() {
        return {
          engines: {},
          selectors: {},
          lastDuration: 0,
          totalAttempts: 0,
          successCount: 0
        };
      }
    };
    var instance = null;
    function getProviderMemory() {
      if (!instance) {
        instance = new ProviderMemory();
        instance._loadProviderData();
      }
      return instance;
    }
    function resetProviderMemory() {
      if (instance) {
        instance._saveProviderData();
        instance = null;
      }
    }
    module2.exports = { ProviderMemory, getProviderMemory, resetProviderMemory };
  }
});

// src/intelligent/index.js
var require_intelligent = __commonJS({
  "src/intelligent/index.js"(exports2, module2) {
    var { SessionMemory, textSimilarity, getSessionMemory, resetSessionMemory } = require_session_memory();
    var { SmartAnalyzer, getSmartAnalyzer, resetSmartAnalyzer, KNOWN_SERVERS, URL_DOMAIN_KB } = require_smart_analyzer();
    var { SkeletonDetector } = require_skeleton_detector();
    var { StaticScraper } = require_static_scraper();
    var { getLogger, setLogLevel } = require_logger();
    var { createBrowser, createPage, findSystemChrome, findSparticuzChromium } = require_launcher();
    var { setupResourceBlocking, blockResourcesOnly } = require_resource_blocker();
    var { BrowserPool } = require_browser_pool();
    var { DynamicPageHandler } = require_dynamic_handler();
    var { PageTypeClassifier } = require_page_type_classifier();
    var { AutonomousScraper } = require_autonomous_scraper();
    module2.exports = {
      // ─── Analysis modules (no browser needed) ────────────────────
      SessionMemory,
      SmartAnalyzer,
      SkeletonDetector,
      StaticScraper,
      PageTypeClassifier,
      // ─── Browser modules (need puppeteer-core) ──────────────────
      createBrowser,
      createPage,
      findSystemChrome,
      findSparticuzChromium,
      setupResourceBlocking,
      blockResourcesOnly,
      BrowserPool,
      DynamicPageHandler,
      AutonomousScraper,
      // ─── Singletons ─────────────────────────────────────────────
      getSessionMemory,
      resetSessionMemory,
      getSmartAnalyzer,
      resetSmartAnalyzer,
      // ─── Utilities ──────────────────────────────────────────────
      textSimilarity,
      getLogger,
      setLogLevel,
      // ─── Knowledge bases ────────────────────────────────────────
      KNOWN_SERVERS,
      URL_DOMAIN_KB,
      // ─── Provider strategy memory ───────────────────────────────
      getProviderMemory: () => {
        const { getProviderMemory } = require_provider_memory();
        return getProviderMemory();
      },
      resetProviderMemory: () => {
        const { resetProviderMemory } = require_provider_memory();
        return resetProviderMemory();
      }
    };
  }
});

// src/web-providers/embed-resolver.js
var require_embed_resolver = __commonJS({
  "src/web-providers/embed-resolver.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var EMBED_TIMEOUT = 1e4;
    var _ai = null;
    function _getAI() {
      if (!_ai) {
        try {
          _ai = require_intelligent().getSmartAnalyzer();
        } catch (e) {
          _ai = null;
        }
      }
      return _ai;
    }
    var _memory = null;
    function _getMemory() {
      if (!_memory) {
        try {
          _memory = require_intelligent().getSessionMemory();
        } catch (e) {
          _memory = null;
        }
      }
      return _memory;
    }
    var embedCache = /* @__PURE__ */ new Map();
    function fetchWithTimeout(url, opts) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(function() {
          ctrl.abort();
        }, opts && opts.timeout || EMBED_TIMEOUT);
        try {
          const res = yield fetch(url, {
            headers: Object.assign({ "User-Agent": UA }, opts && opts.headers || {}),
            signal: ctrl.signal,
            redirect: "follow"
          });
          return res;
        } finally {
          clearTimeout(t);
        }
      });
    }
    function htmlText(url, opts) {
      return __async(this, null, function* () {
        try {
          const res = yield fetchWithTimeout(url, {
            headers: Object.assign({ "Accept": "text/html,application/xhtml+xml,*/*" }, opts && opts.headers || {}),
            timeout: opts && opts.timeout || EMBED_TIMEOUT
          });
          if (!res.ok) return null;
          return yield res.text();
        } catch (e) {
          return null;
        }
      });
    }
    function classifyHostname(hostname) {
      const ai = _getAI();
      if (!ai) return null;
      try {
        return ai.classifyURL("https://" + hostname + "/");
      } catch (e) {
        return null;
      }
    }
    function inferServerName(domain) {
      const ai = _getAI();
      if (!ai) return domain;
      try {
        return ai.inferServerName(domain);
      } catch (e) {
        return domain;
      }
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
        const jsMatch = html.match(/data-options="([^"]+)"/);
        if (jsMatch) {
          try {
            const opts = JSON.parse(jsMatch[1].replace(/&quot;/g, '"'));
            const vLink = opts.flashvars && opts.flashvars.metadataUrl || "";
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
    function resolveMp4Upload(html, url) {
      return __async(this, null, function* () {
        const direct = html.match(/https?:\/\/a\d+\.mp4upload\.com:\d+\/d\/[a-zA-Z0-9\/]+\/video\.mp4/i);
        if (direct) return direct[0];
        const legacy = html.match(/https?:\/\/a\d+\.mp4upload\.com:\d+\/d\/[a-zA-Z0-9]+/i);
        if (legacy) return legacy[0];
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8 && !m3u8[0].includes("videojs") && !m3u8[0].includes("css") && !m3u8[0].includes(".js")) return m3u8[0];
        return null;
      });
    }
    function resolveStreamtapeV2(html, url) {
      return __async(this, null, function* () {
        var ideoDiv = html.match(/id="ideoolink"[^>]*>([^<]+)<\/div>/);
        if (ideoDiv && ideoDiv[1]) {
          var path = ideoDiv[1].trim();
          if (path.startsWith("/")) path = path.substring(1);
          var fullUrl = "https://" + path + "&stream=1";
          var vHtml = yield htmlText(fullUrl, {
            headers: { "Referer": url },
            timeout: EMBED_TIMEOUT
          });
          if (vHtml) {
            var m = vHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (m) return m[0];
            var link = vHtml.match(/"link"\s*:\s*"([^"]+)"/);
            if (link) return link[1].replace(/\\\//g, "/");
          }
          fullUrl = fullUrl.replace("&stream=1", "");
          var vHtml2 = yield htmlText(fullUrl, {
            headers: { "Referer": url },
            timeout: EMBED_TIMEOUT
          });
          if (vHtml2) {
            var m2 = vHtml2.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (m2) return m2[0];
          }
        }
        var botDiv = html.match(/id="botlink"[^>]*>([^<]+)<\/div>/);
        if (botDiv && botDiv[1]) {
          var botPath = botDiv[1].trim();
          if (botPath.startsWith("/")) botPath = botPath.substring(1);
          var botVHtml = yield htmlText("https://" + botPath, { headers: { "Referer": url }, timeout: EMBED_TIMEOUT });
          if (botVHtml) {
            var botVid = botVHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (botVid) return botVid[0];
          }
        }
        return null;
      });
    }
    function resolveStreamwishV2(html, url) {
      return __async(this, null, function* () {
        const dataMatch = html.match(/const\s+_0x[a-f]*\s*=\s*(\{[^}]+\})/);
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
        return null;
      });
    }
    function resolveMixdropV2(html, url) {
      return __async(this, null, function* () {
        const refMatch = html.match(/MDCore\.ref\s*=\s*["']([^"']+)["']/);
        if (refMatch) {
          const ref = refMatch[1];
          const directUrl = "https://mxcontent.com/e/" + ref;
          const vHtml = yield htmlText(directUrl, { headers: { "Referer": url } });
          if (vHtml) {
            const m = vHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (m) return m[0];
          }
        }
        const wurlMatch = html.match(/"poster"\s*:\s*"[^"]+","wurl"\s*:\s*"([^"]+)"/);
        if (wurlMatch) return wurlMatch[1].replace(/\\\//g, "/");
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
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
    function resolveYourUpload(html, url) {
      return __async(this, null, function* () {
        const direct = html.match(/https?:\/\/[^"'\s<>]+\.yourupload\.com\/[^"'\s<>]+\.(?:mp4|m3u8)[^"'\s<>]*/i);
        if (direct) return direct[0];
        const fileMatch = html.match(/(?:file|src|source)\s*[:=]\s*["']([^"']+\.(?:mp4|m3u8|mkv|webm)[^"']*)["']/i);
        if (fileMatch && fileMatch[1].startsWith("http")) return fileMatch[1];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4 && !mp4[0].includes("novideo")) return mp4[0];
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
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
                const sorted = config.sources.filter(function(s) {
                  return s.file;
                }).sort(function(a, b) {
                  const aLabel = (a.label || "").match(/(\d+)/);
                  const bLabel = (b.label || "").match(/(\d+)/);
                  return (parseInt(bLabel && bLabel[1]) || 0) - (parseInt(aLabel && aLabel[1]) || 0);
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
          { pat: /streamwish|wish\.com|swdyu|sfastwish|wishembed|wishy|watchwish/i, fn: resolveStreamwishV2, needHtml: true },
          { pat: /filemoon|filemoon\.sx|kerapoxy|moplay|moon\.sx|moonplayer/i, fn: resolveFilemoon, needHtml: true },
          { pat: /filelions|filelions\.top/i, fn: tryResolveJWPlayer, needHtml: true },
          { pat: /uqload|uqload\.com/i, fn: tryResolveJWPlayer, needHtml: true },
          { pat: /dood\.|doodstream|dood\.la|dood\.to|dood\.ws|dood\.wf|dood\.re|dood\.so|dood\.sh|dood\.pm|dood\.yt|dooood|ds2play/i, fn: resolveDoodstream, needHtml: true },
          { pat: /mixdrop|mixdrop\.co|mixdrop\.ag|mixdrop\.vc|mixdrop\.to|mixdrop\.ch|mixdrop\.gl|mixdrp|mxdrop/i, fn: resolveMixdropV2, needHtml: true },
          { pat: /voe\.sx|voe\.su|vidvodo|voe\.to|voeunblock/i, fn: resolveVoeSx, needHtml: true },
          { pat: /vidhide|vidpro|vidmoly\.to|vidguard|vid2v11/i, fn: resolveVidHide, needHtml: true },
          { pat: /ok\.ru|odnoklassniki/i, fn: resolveOkRu, needHtml: true },
          { pat: /streamtape|strtape|stape\.with|streamta\.to|stpete|tapecontent|streamtape\.com/i, fn: resolveStreamtapeV2, needHtml: true },
          { pat: /mp4upload|mp4upload\.com/i, fn: resolveMp4Upload, needHtml: true },
          { pat: /upstream\.to|uptostream|uptobox|upstreamcdn/i, fn: resolveUpstream, needHtml: true },
          { pat: /netu\.tv|netutv|anavids|waaw\.tv|hqq\.tv|waaw1|netuplayer/i, fn: resolveNetuTv, needHtml: true },
          { pat: /vidmoly|vidmoly\.to|vidmoly\.net|moly\.to/i, fn: resolveVidmoly, needHtml: true },
          { pat: /yourupload|youpload/i, fn: resolveYourUpload, needHtml: true },
          { pat: /hgcloud|hgcloud\.to/i, fn: null, needHtml: false },
          { pat: /krakenfiles|krakenfiles\.com/i, fn: null, needHtml: false },
          { pat: /vidoza|vidoza\.net|vidozahd/i, fn: null, needHtml: false },
          { pat: /vidlox|vidlox\.tv|vidlox\.net/i, fn: null, needHtml: false },
          { pat: /wolfstream|wolfmax|stream\.wolfmax/i, fn: null, needHtml: false },
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
        const mem = _getMemory();
        if (mem && host) {
          try {
            mem.recordAttempt(
              "host:" + host,
              "embed",
              "resolve",
              !!result,
              result ? 1 : 0,
              result ? ["embed", result] : [],
              host
            );
          } catch (e) {
          }
        }
        embedCache.set(embedUrl, result || null);
        return result;
      });
    }
    function isDirectVideoUrl(url) {
      if (!url) return false;
      if (/\.(m3u8|mp4|mkv|webm|avi|ts|mov)(\?|$)/i.test(url)) return true;
      if (/mp4upload\.com:\d+\/d\//i.test(url)) return true;
      if (/\/hls\//i.test(url)) return true;
      if (/streamtape\.com\/get_video/i.test(url)) return true;
      return false;
    }
    function clearCache() {
      embedCache.clear();
    }
    module2.exports = {
      resolveEmbed,
      tryResolveJWPlayer,
      tryResolveGeneric,
      clearCache,
      isDirectVideoUrl,
      classifyHostname,
      inferServerName
    };
  }
});

// src/anime/scrapers/jkanime.js
var require_jkanime = __commonJS({
  "src/anime/scrapers/jkanime.js"(exports2, module2) {
    var cheerio = require("cheerio-without-node-native") || require("cheerio");
    var { resolveEmbed, isDirectVideoUrl } = require_embed_resolver();
    var BASE = "https://jkanime.net";
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var csrfToken = null;
    var cookies = "";
    var lastCookieRefresh = 0;
    var COOKIE_TTL = 10 * 60 * 1e3;
    function fetchText(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), opts.timeout || 15e3);
        try {
          const headers = __spreadValues({
            "User-Agent": UA,
            "Accept": opts.json ? "application/json, text/html" : "text/html",
            "X-Requested-With": opts.ajax ? "XMLHttpRequest" : ""
          }, opts.headers);
          if (cookies) headers.Cookie = cookies;
          if (csrfToken && (opts.method === "POST" || opts.ajax)) {
            headers["X-CSRF-TOKEN"] = csrfToken;
          }
          for (const k of Object.keys(headers)) {
            if (!headers[k]) delete headers[k];
          }
          const res = yield fetch(url, {
            method: opts.method || "GET",
            headers,
            body: opts.body || null,
            signal: ctrl.signal
          });
          clearTimeout(t);
          const newCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
          if (newCookies.length) {
            cookies = newCookies.join("; ");
            lastCookieRefresh = Date.now();
          }
          if (!res.ok) return null;
          const text = yield res.text();
          if (opts.json) {
            try {
              return JSON.parse(text);
            } catch (e) {
              return text;
            }
          }
          return text;
        } catch (e) {
          clearTimeout(t);
          return null;
        }
      });
    }
    function ensureCsrf() {
      return __async(this, null, function* () {
        if (csrfToken && Date.now() - lastCookieRefresh < COOKIE_TTL) return csrfToken;
        const html = yield fetchText(BASE + "/");
        if (!html) return null;
        const m = html.match(/<meta name="csrf-token" content="([^"]+)"/);
        if (m) csrfToken = m[1];
        return csrfToken;
      });
    }
    function search(query) {
      return __async(this, null, function* () {
        const url = `${BASE}/buscar/${encodeURIComponent(query)}/`;
        const html = yield fetchText(url);
        if (!html) return [];
        const $ = cheerio.load(html);
        const results = [];
        $(".anime__item").each((_, el) => {
          var _a;
          const a = $(el).find("a").first();
          const href = a.attr("href") || "";
          const slug = href.replace(/^\/|\/$/g, "").split("/").pop();
          const img = $(el).find(".anime__item__pic");
          const poster = img.attr("data-setbg") || ((_a = img.css("background-image")) == null ? void 0 : _a.replace(/^url\(["']?|["']?\)$/g, "")) || "";
          const titleEl = $(el).find(".anime__item__text h5, .anime__item__text a, h5 a").first();
          const title = titleEl.text().trim() || $(el).find("h5").text().trim();
          if (!slug || !title) return;
          results.push({ title, slug, href, poster });
        });
        return results;
      });
    }
    function getAnimeId(slug) {
      return __async(this, null, function* () {
        const html = yield fetchText(`${BASE}/${slug}/`);
        if (!html) return null;
        const m = html.match(/data-anime="(\d+)"/);
        return m ? parseInt(m[1]) : null;
      });
    }
    function getEpisodes(animeId, page = 1) {
      return __async(this, null, function* () {
        yield ensureCsrf();
        const formData = new URLSearchParams();
        formData.append("pagina", String(page));
        const data = yield fetchText(`${BASE}/ajax/episodes/${animeId}/`, {
          method: "POST",
          body: formData.toString(),
          ajax: true,
          json: true,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 15e3
        });
        if (!data || !data.data || !Array.isArray(data.data)) return { episodes: [], total: 0, lastPage: 1 };
        return {
          episodes: data.data.map((e) => ({
            id: e.id,
            number: e.number,
            title: e.title || `Episodio ${e.number}`
          })),
          total: data.total || 0,
          lastPage: data.last_page || 1
        };
      });
    }
    function getEpisodePage(slug, episodeNumber) {
      return __async(this, null, function* () {
        const url = `${BASE}/${slug}/${episodeNumber}/`;
        const html = yield fetchText(url);
        if (!html) return null;
        return html;
      });
    }
    function extractIframes(html) {
      const results = [];
      const iframeRe = /<iframe[^>]+src="([^"]+)"/gi;
      let m;
      while ((m = iframeRe.exec(html)) !== null) {
        const src = m[1];
        if (src.includes("jkplayer") || src.includes("embed") || src.includes("stream")) {
          results.push(src.startsWith("http") ? src : BASE + src);
        }
      }
      return results;
    }
    function extractServers(html) {
      const serverMatch = html.match(/var servers\s*=\s*(\[[\s\S]*?\]);/);
      if (serverMatch) {
        try {
          const servers2 = JSON.parse(serverMatch[1]);
          const results2 = [];
          for (const s of servers2) {
            try {
              const url = Buffer.from(s.remote, "base64").toString("utf-8").trim();
              if (url && url.startsWith("http")) {
                results2.push({
                  server: s.server,
                  lang: s.lang === 1 ? "SUB" : s.lang === 2 ? "LAT" : s.lang === 3 ? "DUB" : "",
                  size: s.size || "",
                  url
                });
              }
            } catch (e) {
            }
          }
          return results2;
        } catch (e) {
        }
      }
      const $ = cheerio.load(html);
      const results = [];
      $("table tbody tr").each((_, el) => {
        const tds = $(el).find("td");
        if (tds.length < 4) return;
        const server = $(tds[0]).text().trim();
        const size = $(tds[1]).text().trim();
        const a = $(tds[3]).find("a").first();
        const href = a.attr("href") || "";
        if (!server || !href) return;
        results.push({ server, size, url: href });
      });
      return results;
    }
    function extractM3U8(html) {
      const m3u8Re = /(https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*)/gi;
      const matches = [];
      let m;
      while ((m = m3u8Re.exec(html)) !== null) {
        matches.push(m[1]);
      }
      return [...new Set(matches)];
    }
    function extractMP4(html) {
      const mp4Re = /(https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*)/gi;
      const matches = [];
      let m;
      while ((m = mp4Re.exec(html)) !== null) {
        const url = m[1];
        if (!url.includes("cdn.jkdesa.com") && !url.includes("google")) {
          matches.push(url);
        }
      }
      return [...new Set(matches)];
    }
    function getStreams(slug, episode) {
      return __async(this, null, function* () {
        const page = yield getEpisodePage(slug, episode);
        if (!page) return [];
        const iframes = extractIframes(page);
        const servers2 = extractServers(page);
        const results = [];
        const playerNames = ["Desu", "Magi"];
        for (let idx = 0; idx < iframes.length && idx < 2; idx++) {
          const iframeUrl = iframes[idx];
          try {
            const iframeHtml = yield fetchText(iframeUrl, { timeout: 1e4 });
            if (!iframeHtml) continue;
            const m3u8s = extractM3U8(iframeHtml);
            const mp4s = extractMP4(iframeHtml);
            const label = playerNames[idx] || "JKPlayer";
            for (const url of [.../* @__PURE__ */ new Set([...m3u8s, ...mp4s])]) {
              const host = new URL(url).hostname;
              results.push({
                url,
                server: `${label} (${host})`,
                name: `JKAnime
${label}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${label} \xB7 ${host}`,
                description: "M3U8 Directo",
                behaviorHints: { notWebReady: false, bingeGroup: `jkanime|${label.toLowerCase()}` }
              });
            }
          } catch (e) {
          }
        }
        for (const s of servers2) {
          const label = s.server + (s.lang ? " " + s.lang : "") + (s.size ? " " + s.size : "");
          let finalUrl = s.url;
          let isResolved = false;
          if (s.url.includes("c1.jkplayers.com") || s.url.includes("jkplayers.com/d/")) {
            try {
              const res = yield fetch(s.url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(8e3) });
              if (res.ok) {
                const realUrl = res.url;
                if (realUrl !== s.url && realUrl.startsWith("http")) finalUrl = realUrl;
              }
            } catch (e) {
            }
          }
          if (!/\.(mp4|mkv|m3u8)($|\?)/i.test(finalUrl) && finalUrl.startsWith("http")) {
            try {
              const direct = yield resolveEmbed(finalUrl);
              if (direct && isDirectVideoUrl(direct)) {
                finalUrl = direct;
                isResolved = true;
              }
            } catch (e) {
            }
          }
          const isDirect = isResolved || /\.(mp4|mkv|m3u8)($|\?)/i.test(finalUrl);
          results.push({
            url: finalUrl,
            server: s.server,
            name: `JKAnime
${s.server}`,
            title: `${slug} Ep. ${episode}
\u2699\uFE0F ${label}${isResolved ? " (directo)" : ""}`,
            description: s.lang || "",
            behaviorHints: { notWebReady: !isDirect, bingeGroup: `jkanime|${s.server}` }
          });
        }
        return results;
      });
    }
    function getOnAir() {
      return __async(this, null, function* () {
        return [];
      });
    }
    module2.exports = { search, getEpisodes, getStreams, getAnimeId, getOnAir, BASE, ensureCsrf };
  }
});

// src/anime/scrapers/tioanime.js
var require_tioanime = __commonJS({
  "src/anime/scrapers/tioanime.js"(exports2, module2) {
    var cheerio = require("cheerio-without-node-native") || require("cheerio");
    var BASE = "https://tioanime.com";
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function fetchText(url, timeout = 15e3) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeout);
        try {
          const res = yield fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal });
          clearTimeout(t);
          if (!res.ok) return null;
          return yield res.text();
        } catch (e) {
          clearTimeout(t);
          return null;
        }
      });
    }
    function search(query) {
      return __async(this, null, function* () {
        const html = yield fetchText(`${BASE}/directorio?q=${encodeURIComponent(query)}`);
        if (!html) return [];
        const $ = cheerio.load(html);
        const results = [];
        $("article.anime").each((_, el) => {
          const a = $(el).find("a").first();
          const href = a.attr("href") || "";
          const slug = href.replace("/anime/", "").replace(/\/$/, "");
          const title = $(el).find("h3.title, h4, h5").first().text().trim();
          const poster = $(el).find("img").attr("src") || "";
          if (!slug || !title) return;
          results.push({ title, slug, href, poster });
        });
        return results;
      });
    }
    function getStreams(slug, episode) {
      return __async(this, null, function* () {
        const html = yield fetchText(`${BASE}/ver/${slug}-${episode}`);
        if (!html) return [];
        let videosStr = null;
        const $ = cheerio.load(html);
        $("script").each((_, el) => {
          const text = $(el).html() || "";
          const m = text.match(/var videos\s*=\s*(\[[\s\S]*?\]);/);
          if (m) videosStr = m[1];
        });
        if (!videosStr) return [];
        let videos;
        try {
          videos = JSON.parse(videosStr);
        } catch (e) {
          return [];
        }
        if (!Array.isArray(videos)) return [];
        const results = [];
        for (const v of videos) {
          const server = v[0] || "?";
          const url = (v[1] || "").replace(/\\\//g, "/");
          if (!url || !url.startsWith("http")) continue;
          const isDirect = /\.(mp4|mkv|m3u8)($|\?)/i.test(url);
          const isEmbed = /\/embed\/|embed|e\//.test(url);
          results.push({
            url,
            server,
            name: `TioAnime
${server}`,
            title: `${slug} Ep. ${episode}
\u2699\uFE0F ${server}`,
            description: "",
            behaviorHints: {
              notWebReady: !isDirect,
              bingeGroup: `tioanime|${server}`
            }
          });
        }
        return results;
      });
    }
    function getOnAir() {
      return __async(this, null, function* () {
        const html = yield fetchText(BASE);
        if (!html) return [];
        const $ = cheerio.load(html);
        const items = [];
        $("article.anime").each((_, el) => {
          const a = $(el).find("a").first();
          const href = a.attr("href") || "";
          const slug = href.replace("/anime/", "").replace(/\/$/, "");
          if (!slug) return;
          const title = $(el).find("h3.title, h4, h5").first().text().trim();
          if (!title) return;
          items.push({
            id: `tioanime:${slug}`,
            type: "series",
            name: title,
            poster: $(el).find("img").attr("src") || ""
          });
        });
        return items;
      });
    }
    module2.exports = { search, getStreams, getOnAir };
  }
});

// src/anime/scrapers/animeav1.js
var require_animeav1 = __commonJS({
  "src/anime/scrapers/animeav1.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    function fetchText(url, timeout = 15e3) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeout);
        try {
          const res = yield fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal });
          clearTimeout(t);
          if (!res.ok) return null;
          return yield res.text();
        } catch (e) {
          clearTimeout(t);
          return null;
        }
      });
    }
    function fetchJson(url, timeout = 15e3) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeout);
        try {
          const res = yield fetch(url, {
            headers: { "User-Agent": UA, "Accept": "application/json" },
            signal: ctrl.signal
          });
          clearTimeout(t);
          if (!res.ok) return null;
          return yield res.json();
        } catch (e) {
          clearTimeout(t);
          return null;
        }
      });
    }
    function resolveDevalue(flatData) {
      function resolve(val) {
        if (typeof val === "number") return flatData[val];
        if (Array.isArray(val)) return val.map(resolve);
        if (val && typeof val === "object") {
          const out = {};
          for (const [k, v] of Object.entries(val)) {
            out[k] = resolve(v);
          }
          return out;
        }
        return val;
      }
      function findServers(data) {
        const results = { embeds: {}, downloads: {} };
        if (typeof data !== "object" || !data) return results;
        for (const [key, val] of Object.entries(data)) {
          if (typeof key === "string" && ["SUB", "DUB", "LAT"].includes(key) && typeof val === "number") {
            const arr = flatData[val];
            if (Array.isArray(arr)) {
              for (const ref of arr) {
                if (typeof ref !== "number") continue;
                const obj = flatData[ref];
                if (obj && typeof obj === "object" && obj.server && obj.url) {
                  const server = typeof obj.server === "number" ? flatData[obj.server] : obj.server;
                  const url = typeof obj.url === "number" ? flatData[obj.url] : obj.url;
                  if (typeof server === "string" && typeof url === "string" && url.startsWith("http")) {
                    if (!results.embeds[key]) results.embeds[key] = [];
                    results.embeds[key].push({ server, url });
                  }
                }
              }
            }
          }
        }
        return results;
      }
      const allValues = {};
      const resolved = flatData.map((v, i) => {
        const r = resolve(v);
        allValues[i] = r;
        return r;
      });
      const servers2 = { embeds: {}, downloads: {} };
      for (let i = 0; i < resolved.length; i++) {
        const val = resolved[i];
        if (val && typeof val === "object" && !Array.isArray(val)) {
          for (const [lang, ref] of Object.entries(val)) {
            if (["SUB", "DUB", "LAT"].includes(lang) && typeof ref === "number") {
              const serverIds = flatData[ref];
              if (Array.isArray(serverIds)) {
                for (const id of serverIds) {
                  if (typeof id !== "number") continue;
                  const serverObj = flatData[id];
                  if (serverObj && serverObj.server && serverObj.url) {
                    const srv = typeof serverObj.server === "number" ? flatData[serverObj.server] : serverObj.server;
                    const u = typeof serverObj.url === "number" ? flatData[serverObj.url] : serverObj.url;
                    if (typeof srv === "string" && typeof u === "string" && u.startsWith("http")) {
                      servers2.embeds[lang] = servers2.embeds[lang] || [];
                      servers2.embeds[lang].push({ server: srv, url: u });
                    }
                  }
                }
              }
            }
          }
        }
      }
      return servers2;
    }
    function search(query) {
      return __async(this, null, function* () {
        try {
          const html = yield fetchText(`https://animeav1.com/search?q=${encodeURIComponent(query)}`);
          if (!html) return [];
          const cheerio = require("cheerio-without-node-native") || require("cheerio");
          const $ = cheerio.load(html);
          const results = [];
          $('a[href*="/anime/"], a[href*="/media/"]').each((_, el) => {
            const href = $(el).attr("href") || "";
            const match = href.match(/^\/(?:anime|media)\/([^/]+)\/?$/);
            if (!match) return;
            const slug = match[1];
            const title = $(el).find("h2, h3, [class*=title]").first().text().trim() || $(el).attr("title") || $(el).text().trim();
            if (!title || title.length < 2) return;
            results.push({ title, slug, href, poster: "" });
          });
          return [...new Map(results.map((r) => [r.slug, r])).values()];
        } catch (e) {
          return [];
        }
      });
    }
    function getStreams(slug, episode) {
      return __async(this, null, function* () {
        try {
          const data = yield fetchJson(`https://animeav1.com/media/${slug}/${episode}/__data.json`);
          if (!(data == null ? void 0 : data.nodes)) return [];
          for (const node of data.nodes) {
            if ((node == null ? void 0 : node.type) !== "data" || !Array.isArray(node.data)) continue;
            const servers2 = resolveDevalue(node.data);
            const results = [];
            for (const [lang, serverList] of Object.entries(servers2.embeds)) {
              for (const { server, url } of serverList) {
                const isDirect = /\.(mp4|mkv|m3u8)($|\?)/i.test(url);
                let finalUrl = url;
                if (server === "HLS" && url.includes("zilla-networks.com")) {
                  try {
                    const playerHtml = yield fetchText(url, 1e4);
                    if (playerHtml) {
                      const m3u8Match = playerHtml.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/i);
                      if (m3u8Match) finalUrl = m3u8Match[0];
                    }
                  } catch (e) {
                  }
                }
                results.push({
                  url: finalUrl,
                  server,
                  name: `AnimeAV1
${server}`,
                  title: `${slug} Ep. ${episode}
\u2699\uFE0F ${server} [${lang}]`,
                  description: lang,
                  behaviorHints: {
                    notWebReady: !isDirect,
                    bingeGroup: `animeav1|${server}`
                  }
                });
              }
            }
            return results;
          }
          return [];
        } catch (e) {
          return [];
        }
      });
    }
    module2.exports = { search, getStreams };
  }
});

// src/jkanime-puppeteer.js
var require_jkanime_puppeteer = __commonJS({
  "src/jkanime-puppeteer.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    var { resolveEmbed, isDirectVideoUrl } = require_embed_resolver();
    var puppeteer = null;
    var chromiumCache = null;
    var browser = null;
    var browserLastUse = 0;
    var BROWSER_IDLE = 5 * 60 * 1e3;
    var serverCache = /* @__PURE__ */ new Map();
    var embedCache = /* @__PURE__ */ new Map();
    var MAX_CACHE2 = 200;
    var EMBED_TTL = 60 * 60 * 1e3;
    var SERVER_TTL = 30 * 60 * 1e3;
    var RESOLVABLE = ["streamwish", "sfastwish", "flaswish", "mp4upload", "streamtape", "vidhide", "callistanise", "yourupload", "pixeldrain", "1fichier", "zilla-networks"];
    var UNRESOLVABLE = ["mega", "megaup", "mediafire", "zippyshare", "drive.google.com", "mega.nz", "terabox", "uns.bio"];
    var BLOCKED_PATTERNS = [
      "cloudflareinsights.com",
      "cloudfront.net",
      "googletagmanager",
      "google-analytics",
      "doubleclick",
      "facebook.com/tr",
      "hotjar.com",
      "newrelic.com"
    ];
    function getPuppeteer() {
      return __async(this, null, function* () {
        if (puppeteer) return puppeteer;
        try {
          puppeteer = (yield import("puppeteer-core")).default;
          return puppeteer;
        } catch (e) {
          return null;
        }
      });
    }
    function findSystemChrome() {
      if (process.platform === "win32") {
        try {
          var fs = require("fs");
          var paths = [
            process.env["PROGRAMFILES"] + "\\Google\\Chrome\\Application\\chrome.exe",
            (process.env["PROGRAMFILES(X86)"] || process.env["ProgramFiles(x86)"]) + "\\Google\\Chrome\\Application\\chrome.exe",
            (process.env.LOCALAPPDATA || "") + "\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
          ];
          for (var i = 0; i < paths.length; i++) {
            try {
              if (fs.existsSync(paths[i])) return paths[i];
            } catch (e) {
            }
          }
          try {
            var result = require("child_process").execSync("where chrome 2>nul", { shell: "cmd.exe" }).toString().trim().split("\r\n")[0];
            if (result && !result.includes("INFO:") && result.length > 0) return result;
          } catch (e) {
          }
        } catch (e) {
        }
      }
      if (process.platform === "linux") {
        try {
          var paths = ["/usr/bin/chromium-browser", "/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"];
          var fs = require("fs");
          for (var i = 0; i < paths.length; i++) {
            try {
              if (fs.existsSync(paths[i])) return paths[i];
            } catch (e) {
            }
          }
          try {
            var result = require("child_process").execSync("which chromium-browser || which chromium || which google-chrome || which google-chrome-stable", { shell: "/bin/sh" }).toString().trim().split("\n")[0];
            if (result && result.length > 0) return result;
          } catch (e) {
          }
        } catch (e) {
        }
      }
      if (process.platform === "darwin") {
        return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      }
      return null;
    }
    function getChromium() {
      return __async(this, null, function* () {
        if (chromiumCache) return chromiumCache;
        var sysChrome = findSystemChrome();
        if (sysChrome) {
          chromiumCache = { executablePath: sysChrome, args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"] };
          return chromiumCache;
        }
        try {
          const mod = yield import("@sparticuz/chromium");
          const Cr = mod.default;
          chromiumCache = { executablePath: yield Cr.executablePath(), args: Cr.args || [] };
          return chromiumCache;
        } catch (e) {
          return null;
        }
      });
    }
    function getBrowser() {
      return __async(this, null, function* () {
        const now = Date.now();
        if (browser) {
          try {
            browser.isConnected();
            browserLastUse = now;
            return browser;
          } catch (e) {
            browser = null;
          }
        }
        const pptr = yield getPuppeteer();
        if (!pptr) return null;
        const c = yield getChromium();
        if (!c) return null;
        browser = yield pptr.launch({
          args: c.args,
          executablePath: c.executablePath,
          headless: true,
          defaultViewport: { width: 1280, height: 720 }
        });
        browserLastUse = now;
        return browser;
      });
    }
    function closeIfIdle() {
      return __async(this, null, function* () {
        if (browser && Date.now() - browserLastUse > BROWSER_IDLE) {
          try {
            yield browser.close();
          } catch (e) {
          }
          browser = null;
        }
      });
    }
    setInterval(closeIfIdle, BROWSER_IDLE).unref();
    function cacheGet(map, key, ttl) {
      const e = map.get(key);
      if (e && Date.now() - e.time < ttl) return e.value;
      if (e) map.delete(key);
      return void 0;
    }
    function cacheSet(map, key, value, max) {
      if (map.size >= max) {
        const first = map.keys().next().value;
        map.delete(first);
      }
      map.set(key, { value, time: Date.now() });
    }
    function getProxyUrl() {
      return process.env.PROXY_URL || "";
    }
    function fetchViaProxy(url) {
      return __async(this, null, function* () {
        const proxy = getProxyUrl();
        if (!proxy) return null;
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 1e4);
          const res = yield fetch(`${proxy}/?url=${encodeURIComponent(url)}`, {
            headers: { "User-Agent": UA },
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
    function resolveEmbedUrl(b, embedUrl, waitMs = 8e3) {
      return __async(this, null, function* () {
        const cached = cacheGet(embedCache, embedUrl, EMBED_TTL);
        if (cached !== void 0) return cached || null;
        const page = yield b.newPage();
        yield page.setUserAgent(UA);
        let videoUrl = null;
        try {
          yield page.setRequestInterception(true);
          page.on("request", (req) => {
            const u = req.url();
            if (videoUrl) {
              req.abort();
              return;
            }
            if (BLOCKED_PATTERNS.some((p) => u.includes(p))) {
              req.abort();
              return;
            }
            if ((/\.(m3u8|mp4|mkv|ts|webm)(\?|$)/i.test(u) || /mp4upload\.com:\d+\/d\//i.test(u) || /\/hls\//i.test(u)) && !u.includes(".css") && !u.includes(".js") && !u.includes("videojs") && !u.includes("test-videos") && !u.includes("novideo")) {
              videoUrl = u;
              req.abort();
            } else req.continue();
          });
          page.on("response", (resp) => {
            if (videoUrl) return;
            const ct = resp.headers()["content-type"] || "";
            if (ct.includes("mpegurl") || ct.includes("video/mp4") || ct.includes("video/webm")) {
              const u = resp.url();
              if (!u.includes(".css") && !u.includes(".js") && !u.includes("novideo")) {
                videoUrl = u;
              }
            }
          });
          const htmlViaProxy = yield fetchViaProxy(embedUrl);
          if (htmlViaProxy) {
            const baseOrigin = new URL(embedUrl).origin;
            const htmlWithBase = htmlViaProxy.includes("<base ") ? htmlViaProxy : htmlViaProxy.replace(/<head[^>]*>/i, `$&<base href="${baseOrigin}/">`);
            try {
              yield page.setContent(htmlWithBase, { waitUntil: "networkidle2", timeout: 15e3 });
            } catch (e) {
            }
          } else {
            try {
              yield page.goto(embedUrl, { waitUntil: "networkidle2", timeout: 15e3 });
            } catch (e) {
            }
          }
          yield new Promise((r) => setTimeout(r, waitMs));
          if (!videoUrl) {
            try {
              videoUrl = yield page.evaluate(() => {
                const v = document.querySelector("video");
                if ((v == null ? void 0 : v.src) && !v.src.startsWith("blob:")) return v.src;
                const s = document.querySelector("source[src]");
                if (s) {
                  const src = s.getAttribute("src");
                  if (src && !src.startsWith("blob:")) return src;
                }
                return null;
              });
            } catch (e) {
            }
          }
        } catch (e) {
        } finally {
          yield page.close();
        }
        const result = videoUrl && videoUrl.startsWith("http") && !videoUrl.includes("novideo") ? videoUrl : null;
        cacheSet(embedCache, embedUrl, result, MAX_CACHE2);
        return result;
      });
    }
    function isResolvable(url) {
      try {
        return RESOLVABLE.some((h) => new URL(url).hostname.includes(h));
      } catch (e) {
        return false;
      }
    }
    function isUnresolvable(url) {
      try {
        return UNRESOLVABLE.some((h) => new URL(url).hostname.includes(h));
      } catch (e) {
        return true;
      }
    }
    function resolveJKAnime(slug, episode) {
      return __async(this, null, function* () {
        const ck = `${slug}:${episode}`;
        const cached = cacheGet(serverCache, ck, SERVER_TTL);
        let serverList = cached;
        const b = yield getBrowser();
        if (!b) return [];
        if (!serverList) {
          try {
            const page = yield b.newPage();
            yield page.setUserAgent(UA);
            yield page.goto(`https://jkanime.net/${slug}/${episode}/`, { waitUntil: "networkidle2", timeout: 25e3 });
            const currentUrl = page.url();
            if (!currentUrl.includes(`/${slug}/`) && !currentUrl.includes(`/${slug}-`)) {
              console.warn(`[jk-pptr] page redirected away from ${slug}, got ${currentUrl} \u2014 skipping`);
              yield page.close();
              return [];
            }
            yield new Promise((r) => setTimeout(r, 7e3));
            serverList = { iframes: [], servers: [] };
            serverList.iframes = yield page.evaluate(
              () => Array.from(document.querySelectorAll("iframe")).map((f) => f.src).filter((s) => s && s.startsWith("http") && s.includes("jkplayer"))
            );
            try {
              const raw = yield page.evaluate(() => {
                if (typeof servers !== "undefined") return JSON.stringify(servers);
                return null;
              });
              if (raw) {
                serverList.servers = JSON.parse(raw).map((s) => ({
                  server: s.server,
                  size: s.size || "",
                  lang: s.lang === 1 ? "SUB" : s.lang === 2 ? "LAT" : "",
                  url: Buffer.from(s.remote, "base64").toString("utf-8").trim()
                })).filter((s) => s.url);
              }
            } catch (e) {
            }
            yield page.close();
            cacheSet(serverCache, ck, serverList, MAX_CACHE2);
          } catch (e) {
            console.error("[jk-pptr] page error:", e.message);
          }
        }
        if (!serverList) return [];
        const streams = [];
        for (const frameUrl of serverList.iframes || []) {
          const name = frameUrl.includes("/um?") ? "Desu" : frameUrl.includes("/umv?") ? "Magi" : null;
          if (!name) continue;
          let m3u8Url = yield resolveEmbedUrl(b, frameUrl, 5e3);
          if ((!m3u8Url || !m3u8Url.startsWith("http")) && frameUrl.startsWith("http")) m3u8Url = yield resolveEmbed(frameUrl);
          if (m3u8Url && m3u8Url.startsWith("http")) {
            streams.push({
              url: m3u8Url,
              server: name,
              name: `JKAnime
${name}`,
              title: `${slug} Ep. ${episode}
\u2699\uFE0F ${name} (m3u8)`,
              behaviorHints: { notWebReady: false, bingeGroup: `jkanime|${name.toLowerCase()}` }
            });
          }
        }
        for (const s of serverList.servers || []) {
          if (!s.url || !s.url.startsWith("http")) continue;
          if (isUnresolvable(s.url)) {
            streams.push({
              externalUrl: s.url,
              server: s.server,
              name: `JKAnime
${s.server}`,
              title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}
\u{1F517} Abrir en navegador`,
              behaviorHints: { notWebReady: true, bingeGroup: "jkanime|" + s.server.toLowerCase() }
            });
            continue;
          }
          const label = s.server + (s.lang ? " " + s.lang : "") + (s.size ? " " + s.size : "");
          if (isResolvable(s.url)) {
            let direct = yield resolveEmbedUrl(b, s.url, 6e3);
            if (!direct) direct = yield resolveEmbed(s.url);
            if (direct && isDirectVideoUrl(direct)) {
              streams.push({
                url: direct,
                server: s.server,
                name: `JKAnime
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server} (directo)`,
                behaviorHints: { notWebReady: false, bingeGroup: "jkanime|" + s.server.toLowerCase() }
              });
              continue;
            }
          }
          streams.push({
            url: s.url,
            server: s.server,
            name: `JKAnime
${s.server}`,
            title: `${slug} Ep. ${episode}
\u2699\uFE0F ${label}`,
            behaviorHints: { notWebReady: true, bingeGroup: "jkanime|" + s.server.toLowerCase() }
          });
        }
        const seen = /* @__PURE__ */ new Set();
        return streams.filter((s) => {
          const k = s.url + s.server;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      });
    }
    function resolveTioAnime(slug, episode) {
      return __async(this, null, function* () {
        const ck = `tio:${slug}:${episode}`;
        const cached = cacheGet(serverCache, ck, SERVER_TTL);
        let serverList = cached;
        if (!serverList) {
          try {
            const res = yield fetch(`https://tioanime.com/ver/${slug}-${episode}`, { headers: { "User-Agent": UA } });
            if (!res.ok) return [];
            const html = yield res.text();
            const m = html.match(/var videos\s*=\s*(\[[\s\S]*?\]);/);
            if (!m) return [];
            const videos = JSON.parse(m[1]);
            serverList = {
              servers: videos.map((v) => ({ server: v[0] || "?", url: (v[1] || "").replace(/\\\//g, "/") })).filter((s) => s.url.startsWith("http"))
            };
            if (!serverList.servers.length) return [];
            cacheSet(serverCache, ck, serverList, MAX_CACHE2);
          } catch (e) {
            return [];
          }
        }
        const b = yield getBrowser();
        if (!b) {
          const results = [];
          for (const s of serverList.servers) {
            if (isUnresolvable(s.url)) {
              results.push({
                externalUrl: s.url,
                server: s.server,
                name: `TioAnime
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}
\u{1F517} Abrir en navegador`,
                behaviorHints: { notWebReady: true, bingeGroup: "tioanime|" + s.server.toLowerCase() }
              });
              continue;
            }
            if (isDirectVideoUrl(s.url)) {
              results.push({
                url: s.url,
                server: s.server,
                name: `TioAnime
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server} (directo)`,
                behaviorHints: { notWebReady: false, bingeGroup: "tioanime|" + s.server.toLowerCase() }
              });
              continue;
            }
            let direct = null;
            try {
              direct = yield resolveEmbed(s.url);
            } catch (e) {
            }
            if (direct && isDirectVideoUrl(direct)) {
              results.push({
                url: direct,
                server: s.server,
                name: `TioAnime
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server} (directo)`,
                behaviorHints: { notWebReady: false, bingeGroup: "tioanime|" + s.server.toLowerCase() }
              });
            } else {
              results.push({
                url: s.url,
                server: s.server,
                name: `TioAnime
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}`,
                behaviorHints: { notWebReady: true, bingeGroup: "tioanime|" + s.server.toLowerCase() }
              });
            }
          }
          return results;
        }
        const streams = [];
        for (const s of serverList.servers) {
          if (isUnresolvable(s.url)) {
            streams.push({
              externalUrl: s.url,
              server: s.server,
              name: `TioAnime
${s.server}`,
              title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}
\u{1F517} Abrir en navegador`,
              behaviorHints: { notWebReady: true, bingeGroup: "tioanime|" + s.server.toLowerCase() }
            });
            continue;
          }
          if (isResolvable(s.url)) {
            let direct = yield resolveEmbedUrl(b, s.url, 6e3);
            if (!direct) direct = yield resolveEmbed(s.url);
            if (direct && isDirectVideoUrl(direct)) {
              streams.push({
                url: direct,
                server: s.server,
                name: `TioAnime
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server} (directo)`,
                behaviorHints: { notWebReady: false, bingeGroup: "tioanime|" + s.server.toLowerCase() }
              });
              continue;
            }
          }
          streams.push({
            url: s.url,
            server: s.server,
            name: `TioAnime
${s.server}`,
            title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}`,
            behaviorHints: { notWebReady: true, bingeGroup: "tioanime|" + s.server.toLowerCase() }
          });
        }
        const seen = /* @__PURE__ */ new Set();
        return streams.filter((s) => {
          const k = s.url + s.server;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      });
    }
    function resolveAnimeAV1(slug, episode) {
      return __async(this, null, function* () {
        const ck = `av1:${slug}:${episode}`;
        const cached = cacheGet(serverCache, ck, SERVER_TTL);
        let serverList = cached;
        if (!serverList) {
          try {
            const res = yield fetch(`https://animeav1.com/media/${slug}/${episode}/__data.json`, {
              headers: { "User-Agent": UA, "Accept": "application/json" }
            });
            if (!res.ok) return [];
            const data = yield res.json();
            const servers2 = [];
            for (const node of data.nodes || []) {
              if ((node == null ? void 0 : node.type) !== "data" || !Array.isArray(node.data)) continue;
              const first = node.data[0];
              if (!first || typeof first !== "object") continue;
              if (first.embeds !== void 0) {
                const embedsRef = node.data[first.embeds];
                if (embedsRef && typeof embedsRef === "object") {
                  for (const [variant, serversIdx] of Object.entries(embedsRef)) {
                    const variantServers = node.data[serversIdx];
                    if (!Array.isArray(variantServers)) continue;
                    for (const entry of variantServers) {
                      let srvObj = entry;
                      if (typeof entry === "number") srvObj = node.data[entry];
                      if (!srvObj || typeof srvObj !== "object") continue;
                      const srv = typeof srvObj.server === "number" ? node.data[srvObj.server] : srvObj.server;
                      const u = typeof srvObj.url === "number" ? node.data[srvObj.url] : srvObj.url;
                      if (typeof srv === "string" && typeof u === "string" && u.startsWith("http"))
                        servers2.push({ server: srv + (variant !== "SUB" ? " " + variant : ""), url: u, variant });
                    }
                  }
                }
              }
              if (first.downloads !== void 0) {
                const dlRoot = node.data[first.downloads];
                const dlArrays = Array.isArray(dlRoot) ? { "": dlRoot } : dlRoot && typeof dlRoot === "object" ? dlRoot : {};
                for (const [variant, dlIdxOrArr] of Object.entries(dlArrays)) {
                  const dlArr = typeof dlIdxOrArr === "number" ? node.data[dlIdxOrArr] : dlIdxOrArr;
                  if (!Array.isArray(dlArr)) continue;
                  for (const entry of dlArr) {
                    let dlObj = entry;
                    if (typeof entry === "number") dlObj = node.data[entry];
                    if (!dlObj || typeof dlObj !== "object") continue;
                    const srv = typeof dlObj.server === "number" ? node.data[dlObj.server] : dlObj.server || "DDL";
                    const u = typeof dlObj.url === "number" ? node.data[dlObj.url] : dlObj.url || "";
                    const quality = dlObj.quality ? typeof dlObj.quality === "number" ? node.data[dlObj.quality] : dlObj.quality : "";
                    const label = srv + (quality ? " " + quality : "") + (variant && variant !== "SUB" ? " " + variant : "");
                    if (typeof srv === "string" && typeof u === "string" && u.startsWith("http"))
                      servers2.push({ server: label, url: u });
                  }
                }
              }
            }
            if (!servers2.length) {
              for (const node of data.nodes || []) {
                if ((node == null ? void 0 : node.type) !== "data" || !Array.isArray(node.data)) continue;
                for (let i = 0; i < node.data.length; i++) {
                  const val = node.data[i];
                  if (val && val.server && val.url) {
                    const srv = typeof val.server === "number" ? node.data[val.server] : val.server;
                    const u = typeof val.url === "number" ? node.data[val.url] : val.url;
                    if (typeof srv === "string" && typeof u === "string" && u.startsWith("http"))
                      servers2.push({ server: srv, url: u });
                  }
                }
              }
            }
            serverList = { servers: servers2 };
            if (!servers2.length) return [];
            cacheSet(serverCache, ck, serverList, MAX_CACHE2);
          } catch (e) {
            return [];
          }
        }
        const b = yield getBrowser();
        if (!b) {
          const results = [];
          for (const s of serverList.servers) {
            if (isUnresolvable(s.url)) {
              results.push({
                externalUrl: s.url,
                server: s.server,
                name: `AnimeAV1
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}
\u{1F517} Abrir en navegador`,
                behaviorHints: { notWebReady: true, bingeGroup: "animeav1|" + s.server.toLowerCase() }
              });
              continue;
            }
            if (isDirectVideoUrl(s.url)) {
              results.push({
                url: s.url,
                server: s.server,
                name: `AnimeAV1
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server} (directo)`,
                behaviorHints: { notWebReady: false, bingeGroup: "animeav1|" + s.server.toLowerCase() }
              });
              continue;
            }
            let direct = null;
            try {
              direct = yield resolveEmbed(s.url);
            } catch (e) {
            }
            if (direct && isDirectVideoUrl(direct)) {
              results.push({
                url: direct,
                server: s.server,
                name: `AnimeAV1
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server} (directo)`,
                behaviorHints: { notWebReady: false, bingeGroup: "animeav1|" + s.server.toLowerCase() }
              });
            } else {
              results.push({
                url: s.url,
                server: s.server,
                name: `AnimeAV1
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}`,
                behaviorHints: { notWebReady: true, bingeGroup: "animeav1|" + s.server.toLowerCase() }
              });
            }
          }
          return results;
        }
        const streams = [];
        for (const s of serverList.servers) {
          if (isUnresolvable(s.url)) {
            streams.push({
              externalUrl: s.url,
              server: s.server,
              name: `AnimeAV1
${s.server}`,
              title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}
\u{1F517} Abrir en navegador`,
              behaviorHints: { notWebReady: true, bingeGroup: "animeav1|" + s.server.toLowerCase() }
            });
            continue;
          }
          if (isResolvable(s.url)) {
            let direct = yield resolveEmbedUrl(b, s.url, 6e3);
            if (!direct) direct = yield resolveEmbed(s.url);
            if (direct && isDirectVideoUrl(direct)) {
              streams.push({
                url: direct,
                server: s.server,
                name: `AnimeAV1
${s.server}`,
                title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server} (directo)`,
                behaviorHints: { notWebReady: false, bingeGroup: "animeav1|" + s.server.toLowerCase() }
              });
              continue;
            }
          }
          streams.push({
            url: s.url,
            server: s.server,
            name: `AnimeAV1
${s.server}`,
            title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}`,
            behaviorHints: { notWebReady: true, bingeGroup: "animeav1|" + s.server.toLowerCase() }
          });
        }
        const seen = /* @__PURE__ */ new Set();
        return streams.filter((s) => {
          const k = s.url + s.server;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      });
    }
    module2.exports = { resolveJKAnime, resolveTioAnime, resolveAnimeAV1, resolveAnimeJara, getBrowser };
    function resolveAnimeJara(slug, episode) {
      return __async(this, null, function* () {
        const ck = `aj:${slug}:${episode}`;
        const cached = cacheGet(serverCache, ck, SERVER_TTL);
        let serverList = cached;
        const b = yield getBrowser();
        if (!serverList) {
          if (!b) {
            try {
              const res = yield fetch(`https://animejara.com/episode/${slug}-1x${episode}/`, {
                headers: { "User-Agent": UA }
              });
              if (!res.ok) return [];
              const html = yield res.text();
              const servers2 = [];
              const re = /playVideo\s*\(\s*["']([^"']+)["']\s*\)/g;
              let m;
              while ((m = re.exec(html)) !== null) {
                let url = m[1].replace(/\\\//g, "/");
                if (url.startsWith("//")) url = "https:" + url;
                if (url.startsWith("http")) {
                  try {
                    servers2.push({ server: new URL(url).hostname.replace("www.", "").split(".")[0], url });
                  } catch (e) {
                    servers2.push({ server: "embed", url });
                  }
                }
              }
              const iframeRe = /<iframe[^>]+src=["']([^"']+)["']/gi;
              while ((m = iframeRe.exec(html)) !== null) {
                let url = m[1];
                if (url.startsWith("//")) url = "https:" + url;
                if (url.startsWith("http")) {
                  try {
                    servers2.push({ server: new URL(url).hostname.replace("www.", "").split(".")[0], url });
                  } catch (e) {
                    servers2.push({ server: "embed", url });
                  }
                }
              }
              serverList = { servers: servers2 };
              if (!servers2.length) return [];
              cacheSet(serverCache, ck, serverList, MAX_CACHE2);
            } catch (e) {
              return [];
            }
          } else {
            try {
              const page = yield b.newPage();
              yield page.setUserAgent(UA);
              yield page.goto(`https://animejara.com/episode/${slug}-1x${episode}/`, {
                waitUntil: "networkidle2",
                timeout: 25e3
              });
              const currentUrl = page.url();
              if (!currentUrl.includes(`/${slug}-`)) {
                console.warn(`[animejara] page redirected away from ${slug}, got ${currentUrl}`);
                yield page.close();
                return [];
              }
              const servers2 = yield page.evaluate(() => {
                const results = [];
                const listaItems = document.querySelectorAll("#lista-server li[onclick]");
                listaItems.forEach((li) => {
                  const onclick = li.getAttribute("onclick") || "";
                  const urlMatch = onclick.match(/playVideo\s*\(\s*["']([^"']+)["']\s*\)/);
                  if (urlMatch) {
                    const url = urlMatch[1].replace(/\\\//g, "/");
                    const nameEl = li.querySelector('.nombre-server, [class*="server"]');
                    const name = nameEl ? nameEl.textContent.trim() : "";
                    if (url.startsWith("http") || url.startsWith("//"))
                      results.push({ server: name, url: url.startsWith("//") ? "https:" + url : url });
                  }
                });
                const iframes = document.querySelectorAll(".reproductor-wrapper iframe, .episodio-reproductor iframe");
                iframes.forEach((iframe) => {
                  const src = iframe.getAttribute("src") || "";
                  if (src.startsWith("http") || src.startsWith("//"))
                    results.push({ server: "", url: src.startsWith("//") ? "https:" + src : src });
                });
                const dataItems = document.querySelectorAll("[data-tr]");
                dataItems.forEach((el) => {
                  const url = el.getAttribute("data-tr") || "";
                  const text = el.textContent.trim().substring(0, 30);
                  if (url.startsWith("http"))
                    results.push({ server: text, url });
                });
                return results;
              });
              yield page.close();
              if (!servers2.length) return [];
              for (const s of servers2) {
                if (!s.server) {
                  try {
                    s.server = new URL(s.url).hostname.replace("www.", "").split(".")[0];
                  } catch (e) {
                    s.server = "embed";
                  }
                }
              }
              serverList = { servers: servers2 };
              cacheSet(serverCache, ck, serverList, MAX_CACHE2);
            } catch (e) {
              console.error("[animejara] page error:", e.message);
              return [];
            }
          }
        }
        if (!serverList) return [];
        const streams = [];
        for (const s of serverList.servers) {
          if (!s.url || !s.url.startsWith("http")) continue;
          if (isUnresolvable(s.url)) {
            streams.push({
              externalUrl: s.url,
              server: s.server,
              name: `AnimeJara
${s.server}`,
              title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}
\u{1F517} Abrir en navegador`,
              behaviorHints: { notWebReady: true, bingeGroup: "animejara|" + s.server.toLowerCase() }
            });
            continue;
          }
          if (isDirectVideoUrl(s.url)) {
            streams.push({
              url: s.url,
              server: s.server,
              name: `AnimeJara
${s.server}`,
              title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server} (directo)`,
              behaviorHints: { notWebReady: false, bingeGroup: "animejara|" + s.server.toLowerCase() }
            });
            continue;
          }
          let direct = null;
          if (b) {
            try {
              direct = yield resolveEmbedUrl(b, s.url, 6e3);
            } catch (e) {
            }
          }
          if (!direct) {
            try {
              direct = yield resolveEmbed(s.url);
            } catch (e) {
            }
          }
          if (direct && isDirectVideoUrl(direct)) {
            streams.push({
              url: direct,
              server: s.server,
              name: `AnimeJara
${s.server}`,
              title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server} (directo)`,
              behaviorHints: { notWebReady: false, bingeGroup: "animejara|" + s.server.toLowerCase() }
            });
          } else {
            streams.push({
              url: s.url,
              server: s.server,
              name: `AnimeJara
${s.server}`,
              title: `${slug} Ep. ${episode}
\u2699\uFE0F ${s.server}`,
              behaviorHints: { notWebReady: true, bingeGroup: "animejara|" + s.server.toLowerCase() }
            });
          }
        }
        const seen = /* @__PURE__ */ new Set();
        return streams.filter((s) => {
          const k = s.url + s.server;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      });
    }
  }
});

// src/anime/scrapers/animejara.js
var require_animejara = __commonJS({
  "src/anime/scrapers/animejara.js"(exports2, module2) {
    var cheerio = require("cheerio-without-node-native") || require("cheerio");
    var { getSessionMemory, getSmartAnalyzer } = require_intelligent();
    var BASE = "https://animejara.com";
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
    var mem = getSessionMemory();
    mem.setCurrentDomain("animejara.com");
    if (!mem.getDomainFingerprint("animejara.com")) {
      mem.recordAttempt("button.tab-btn", "clickable", "click", true, 3, ["embed", "download"], "animejara.com");
      mem.recordAttempt("button.tab-btn", "clickable", "click", false, 0, [], "animejara.com");
      mem.recordAttempt("a.btn-dl", "clickable", "click", true, 1, ["embed"], "animejara.com");
      mem.recordAttempt("a.btn-dl", "clickable", "click", false, 0, [], "animejara.com");
      mem.recordAttempt("a.btn-dl", "clickable", "click", false, 0, [], "animejara.com");
    }
    var ai = getSmartAnalyzer();
    function fetchText(url, timeout) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(function() {
          ctrl.abort();
        }, timeout || 15e3);
        try {
          const res = yield fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal });
          clearTimeout(t);
          const html = yield res.text();
          if (html && html.length > 1e3) return html;
          return res.ok ? html : null;
        } catch (e) {
          clearTimeout(t);
          return null;
        }
      });
    }
    function scrapeServerContainer(containerUrl, slug, ep) {
      return __async(this, null, function* () {
        const html = yield fetchText(containerUrl, 1e4);
        if (!html) return [];
        const results = [];
        const iframeRe = /<iframe[^>]+src="([^"]+)"/gi;
        let m;
        while ((m = iframeRe.exec(html)) !== null) {
          let src = m[1].replace(/&amp;/g, "&").replace(/&#038;/g, "&");
          src = src.replace(/&quot;.*$/, "").replace(/['\s)]+$/, "");
          if (!src.startsWith("http") || src === "about:blank") continue;
          if (/google|facebook|discord|analytics/i.test(src)) continue;
          const serverName = ai.inferServerName(ai.extractDomain(src));
          if (!results.some(function(r) {
            return r.url === src;
          })) {
            results.push({
              url: src,
              server: serverName,
              name: "AnimeJara\n" + serverName,
              title: slug + " Ep." + ep + "\n" + serverName,
              description: "",
              behaviorHints: { notWebReady: true, bingeGroup: "animejara|" + serverName.toLowerCase() }
            });
          }
        }
        const onclickRe = /playVideo\(&quot;(https?:\/\/[^&]+)&quot;/gi;
        while ((m = onclickRe.exec(html)) !== null) {
          const url = m[1].replace(/&amp;/g, "&").replace(/&#038;/g, "&");
          if (!url.startsWith("http")) continue;
          if (results.some(function(r) {
            return r.url === url;
          })) continue;
          const serverName = ai.inferServerName(ai.extractDomain(url));
          results.push({
            url,
            server: serverName,
            name: "AnimeJara\n" + serverName,
            title: slug + " Ep." + ep + "\n" + serverName,
            behaviorHints: { notWebReady: true, bingeGroup: "animejara|" + serverName.toLowerCase() }
          });
        }
        const urlRe = /https?:\/\/[^"'\s<>]{10,200}/g;
        const allUrls = html.match(urlRe) || [];
        const embedDomains = /streamwish|filemoon|uqload|dood|mixdrop|voe|mp4upload|streamtape|yourupload|ok\.ru|mega|mediafire|hqq|netu|swhoi|burstcloud|sbembed|sbplay|fembed|upstream|vidhide|vidmoly|vidoza|cloudvideo|playhydrax|bysekoze|nyuu/i;
        allUrls.forEach(function(u) {
          let clean = u.replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/\\\//g, "/");
          clean = clean.replace(/&quot;.*$/, "").replace(/['\s)]+$/, "");
          if (!embedDomains.test(clean)) return;
          if (clean.includes("streamhj.top")) return;
          if (results.some(function(r) {
            return r.url === clean;
          })) return;
          const serverName = ai.inferServerName(ai.extractDomain(clean));
          results.push({
            url: clean,
            server: serverName,
            name: "AnimeJara\n" + serverName,
            title: slug + " Ep." + ep + "\n" + serverName,
            behaviorHints: { notWebReady: true, bingeGroup: "animejara|" + serverName.toLowerCase() }
          });
        });
        return results;
      });
    }
    function search(query) {
      return __async(this, null, function* () {
        const html = yield fetchText(BASE + "/catalogo/?q=" + encodeURIComponent(query));
        if (!html) return [];
        const $ = cheerio.load(html);
        const results = [];
        $(".anime-card").each(function(_, el) {
          const title = $(el).find(".card-title").text().trim();
          const href = $(el).attr("href") || $(el).find("a").attr("href") || "";
          const slug = href.replace(/^https?:\/\/[^/]+\/(?:anime|movie)\//, "").replace(/^\/(?:anime|movie)\//, "").replace(/\/+$/, "");
          if (title && slug && slug.length < 100) {
            results.push({ title, slug, poster: $(el).find("img").attr("src") || "" });
          }
        });
        return results;
      });
    }
    function getStreams(slug, episode) {
      return __async(this, null, function* () {
        const epUrl = BASE + "/episode/" + slug + "-1x" + (episode || 1) + "/";
        const html = yield fetchText(epUrl);
        if (!html) return [];
        const ep = episode || 1;
        const results = [];
        const iframeMatch = html.match(/<iframe[^>]+src="(https?:\/\/multiplayer\.streamhj\.top\/[^"]+)"/i);
        if (!iframeMatch) {
          try {
            const pptr = require_jkanime_puppeteer();
            return yield pptr.resolveAnimeJara(slug, ep);
          } catch (e) {
            return [];
          }
        }
        const containerUrl = iframeMatch[1].replace(/&amp;/g, "&").replace(/&#038;/g, "&");
        const servers2 = yield scrapeServerContainer(containerUrl, slug, ep);
        const downloadMatch = html.match(/https?:\/\/descargas\.streamhj\.top\/[^"'\s<>]+/i);
        if (downloadMatch) {
          const dlUrl = downloadMatch[0].replace(/&amp;/g, "&").replace(/&#038;/g, "&");
          if (!results.some(function(r) {
            return r.url === dlUrl;
          })) {
            results.push({
              url: dlUrl,
              server: "Descargas",
              name: "AnimeJara\nDescargas",
              title: slug + " Ep." + ep + "\nDescargas",
              behaviorHints: { notWebReady: true, bingeGroup: "animejara|descargas" }
            });
          }
        }
        results.push(...servers2);
        const seen = /* @__PURE__ */ new Set();
        return results.filter(function(s) {
          const key = (s.url || "").toLowerCase().replace(/\/+$/, "").replace(/&quot;.*$/, "").replace(/['\s)]+$/, "").split("?")[0];
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
    }
    module2.exports = { search, getStreams, BASE };
  }
});

// src/anime/anime-smart.js
var require_anime_smart = __commonJS({
  "src/anime/anime-smart.js"(exports2, module2) {
    var { getSmartAnalyzer } = require_intelligent();
    var { getSessionMemory } = require_intelligent();
    function enhanceStream(stream, sourceName) {
      if (!stream || !stream.url) return stream;
      const ai = getSmartAnalyzer();
      const mem = getSessionMemory();
      try {
        const cls = ai.classifyURL(stream.url);
        stream._urlType = cls.type;
        stream._isContainer = cls.isContainer;
        if (!stream.server || stream.server === "Unknown" || stream.server === "CDN") {
          const domain = ai.extractDomain(stream.url);
          const detected = ai.inferServerName(domain);
          if (detected && detected !== domain) {
            stream.server = detected;
          }
        }
        if (cls.type === "tracking" || cls.type === "social") {
          stream._filtered = true;
          stream._filterReason = cls.type;
          return stream;
        }
        if (sourceName) {
          const domain = ai.extractDomain(stream.url);
          mem.setCurrentDomain(domain);
          mem.recordAttempt(
            sourceName + ":" + (stream.server || domain),
            cls.type,
            "scrape",
            true,
            1,
            [cls.type, stream.url],
            domain
          );
        }
        if (cls.type === "embed" && cls.isContainer) {
          stream._needsResolution = true;
        } else if (cls.type === "direct-video" || cls.type === "stream") {
          stream._needsResolution = false;
          if (stream.behaviorHints) stream.behaviorHints.notWebReady = false;
        }
      } catch (e) {
      }
      return stream;
    }
    function filterStreams(streams) {
      return streams.filter(function(s) {
        return !s._filtered;
      });
    }
    function getServerStats(sourceName) {
      const mem = getSessionMemory();
      const scores = mem.getAdaptiveScores();
      return {
        totalAttempts: mem.totalAttempts || 0,
        successRate: Math.round(mem.getSuccessRate() * 100),
        topClasses: scores.currentFingerprint ? scores.currentFingerprint.topClasses : [],
        predictions: scores.predictions || []
      };
    }
    module2.exports = { enhanceStream, filterStreams, getServerStats };
  }
});

// src/anime/scrapers/index.js
var require_scrapers = __commonJS({
  "src/anime/scrapers/index.js"(exports2, module2) {
    var animeflv = require_animeflv();
    var jkanime = require_jkanime();
    var tioanime = require_tioanime();
    var animeav1 = require_animeav1();
    var animejara = require_animejara();
    var { enhanceStream, filterStreams } = require_anime_smart();
    var animePrefixes = ["animeflv:", "animeav1:", "henaojara:", "tioanime:", "jkanime:", "animejara:"];
    function getStreams(id, season, episode, pigamerGetStreams, searchTitle) {
      return __async(this, null, function* () {
        var _a, _b, _c;
        const hasAnimePrefix = animePrefixes.some((p) => id.startsWith(p));
        if (!hasAnimePrefix) {
          const tasks = [];
          if (searchTitle && searchTitle.length > 2) {
            tasks.push(
              (() => __async(null, null, function* () {
                var _a2;
                try {
                  const r = yield jkanime.search(searchTitle);
                  const s = (_a2 = r[0]) == null ? void 0 : _a2.slug;
                  if (!s) return [];
                  return (yield jkanime.getStreams(s, episode || 1)).map(function(x) {
                    return enhanceStream(x, "JKAnime");
                  });
                } catch (e) {
                  return [];
                }
              }))(),
              (() => __async(null, null, function* () {
                var _a2;
                try {
                  const r = yield tioanime.search(searchTitle);
                  const s = (_a2 = r[0]) == null ? void 0 : _a2.slug;
                  if (!s) return [];
                  return (yield tioanime.getStreams(s, episode || 1)).map(function(x) {
                    return enhanceStream(x, "TioAnime");
                  });
                } catch (e) {
                  return [];
                }
              }))(),
              (() => __async(null, null, function* () {
                var _a2;
                try {
                  const r = yield animeflv.search(searchTitle);
                  const s = (_a2 = r[0]) == null ? void 0 : _a2.slug;
                  if (!s) return [];
                  return (yield animeflv.getStreams(s, episode || 1)).map(function(x) {
                    return enhanceStream(x, "AnimeFLV");
                  });
                } catch (e) {
                  return [];
                }
              }))(),
              (() => __async(null, null, function* () {
                var _a2;
                try {
                  const r = yield animejara.search(searchTitle);
                  const s = (_a2 = r[0]) == null ? void 0 : _a2.slug;
                  if (!s) return [];
                  return (yield animejara.getStreams(s, episode || 1)).map(function(x) {
                    return enhanceStream(x, "AnimeJara");
                  });
                } catch (e) {
                  return [];
                }
              }))()
            );
          }
          const results2 = yield Promise.allSettled(tasks);
          const allStreams2 = [];
          const seenUrls2 = /* @__PURE__ */ new Set();
          for (const r of results2) {
            if (r.status === "fulfilled" && ((_a = r.value) == null ? void 0 : _a.length)) {
              for (const s of r.value) {
                if (s._filtered) continue;
                const url = (s.url || s.file || s.src || "").toLowerCase().replace(/\/+$/, "").split("?")[0];
                if (!url) {
                  allStreams2.push(s);
                  continue;
                }
                if (seenUrls2.has(url)) continue;
                seenUrls2.add(url);
                allStreams2.push(s);
              }
            }
          }
          return { source: "native", streams: allStreams2 };
        }
        const slug = extractSlug(id);
        if (!slug || slug.match(/^\d+$/)) {
          return { source: "error", streams: [] };
        }
        const ep = episode || 1;
        const promises = [];
        if (id.startsWith("jkanime:")) {
          promises.push(
            (() => __async(null, null, function* () {
              try {
                return { provider: "JKAnime", streams: yield jkanime.getStreams(slug, ep) };
              } catch (e) {
                return { provider: "JKAnime", streams: [] };
              }
            }))()
          );
        }
        if (id.startsWith("tioanime:")) {
          promises.push(
            (() => __async(null, null, function* () {
              try {
                return { provider: "TioAnime", streams: yield tioanime.getStreams(slug, ep) };
              } catch (e) {
                return { provider: "TioAnime", streams: [] };
              }
            }))()
          );
        }
        if (id.startsWith("animeflv:")) {
          promises.push(
            (() => __async(null, null, function* () {
              try {
                return { provider: "AnimeFLV", streams: yield animeflv.getStreams(slug, ep) };
              } catch (e) {
                return { provider: "AnimeFLV", streams: [] };
              }
            }))()
          );
        }
        if (id.startsWith("animeav1:")) {
          promises.push(
            (() => __async(null, null, function* () {
              try {
                return { provider: "AnimeAV1", streams: yield animeav1.getStreams(slug, ep) };
              } catch (e) {
                return { provider: "AnimeAV1", streams: [] };
              }
            }))()
          );
        }
        if (id.startsWith("animejara:")) {
          promises.push(
            (() => __async(null, null, function* () {
              try {
                return { provider: "AnimeJara", streams: yield animejara.getStreams(slug, ep) };
              } catch (e) {
                return { provider: "AnimeJara", streams: [] };
              }
            }))()
          );
        }
        const results = yield Promise.allSettled(promises);
        const allStreams = [];
        const seenUrls = /* @__PURE__ */ new Set();
        for (const r of results) {
          if (r.status === "fulfilled" && ((_c = (_b = r.value) == null ? void 0 : _b.streams) == null ? void 0 : _c.length)) {
            for (const s of r.value.streams) {
              const enhanced = enhanceStream(s, r.value.provider || "Unknown");
              if (enhanced._filtered) continue;
              const url = (s.url || s.file || s.src || "").toLowerCase().replace(/\/+$/, "").split("?")[0];
              if (!url) {
                allStreams.push(s);
                continue;
              }
              if (seenUrls.has(url)) continue;
              seenUrls.add(url);
              allStreams.push(s);
            }
          }
        }
        return { source: "native", streams: allStreams };
      });
    }
    function extractSlug(id) {
      const parts = id.split(":");
      if (parts.length >= 2) return parts[1].split(":")[0];
      return id;
    }
    function getOnAirCatalog(providerId) {
      return __async(this, null, function* () {
        if (providerId === "animeflv|onair") {
          const items = yield animeflv.getOnAir();
          return { metas: items };
        }
        return { metas: [] };
      });
    }
    function searchCatalog2(providerId, query) {
      return __async(this, null, function* () {
        if (providerId === "jkanime|search") {
          const results = yield jkanime.search(query);
          return { metas: results.map((r) => ({ id: `jkanime:${r.slug}`, type: "series", name: r.title, poster: r.poster })) };
        }
        if (providerId === "tioanime|search") {
          const results = yield tioanime.search(query);
          return { metas: results.map((r) => ({ id: `tioanime:${r.slug}`, type: "series", name: r.title, poster: r.poster })) };
        }
        return { metas: [] };
      });
    }
    module2.exports = { getStreams, getOnAirCatalog, searchCatalog: searchCatalog2, animeflv, jkanime, tioanime, animeav1 };
  }
});

// src/anime/index.js
var require_anime = __commonJS({
  "src/anime/index.js"(exports2, module2) {
    var types = require_types2();
    var { detectAnime } = require_detector();
    var { resolveAnimeId, getAnimeTMDbId, resolveToTMDbId } = require_resolver();
    var pigamer = require_pigamer();
    var amatsu = require_amatsu();
    var { filterLocalProviders, getAlfaCategory } = require_providers();
    var titles = require_titles();
    var scrapers = require_scrapers();
    module2.exports = __spreadProps(__spreadValues({}, types), {
      detectAnime,
      resolveAnimeId,
      getAnimeTMDbId,
      resolveToTMDbId,
      pigamer,
      amatsu,
      filterLocalProviders,
      getAlfaCategory,
      titles,
      scrapers
    });
  }
});

// src/catalog/index.js
var { isJapaneseAnime, findByIMDB, fetchTMDB } = require_tmdb();
var content = require_content();
var anime = require_anime();
var catCache = /* @__PURE__ */ new Map();
var genreCache = { map: {}, loaded: false };
var MAX_CACHE = 300;
var CACHE_TTL = 30 * 60 * 1e3;
var CATEGORIES = [
  // ── Movies ──
  { id: "tmdb-popular-movie", name: "Pel\xEDculas Populares", type: "movie", tmdb: "/movie/popular?language=es&page={page}" },
  { id: "tmdb-top-movie", name: "Pel\xEDculas Mejor Valoradas", type: "movie", tmdb: "/movie/top_rated?language=es&page={page}" },
  { id: "tmdb-trending-movie", name: "Pel\xEDculas en Tendencia", type: "movie", tmdb: "/trending/movie/week?language=es&page={page}" },
  { id: "tmdb-action-movie", name: "Acci\xF3n", type: "movie", tmdb: "/discover/movie?with_genres=28&language=es&sort_by=popularity.desc&page={page}" },
  { id: "tmdb-comedy-movie", name: "Comedia", type: "movie", tmdb: "/discover/movie?with_genres=35&language=es&sort_by=popularity.desc&page={page}" },
  { id: "tmdb-drama-movie", name: "Drama", type: "movie", tmdb: "/discover/movie?with_genres=18&language=es&sort_by=popularity.desc&page={page}" },
  { id: "tmdb-horror-movie", name: "Terror", type: "movie", tmdb: "/discover/movie?with_genres=27&language=es&sort_by=popularity.desc&page={page}" },
  { id: "tmdb-scifi-movie", name: "Ciencia Ficci\xF3n", type: "movie", tmdb: "/discover/movie?with_genres=878&language=es&sort_by=popularity.desc&page={page}" },
  { id: "tmdb-thriller-movie", name: "Suspenso", type: "movie", tmdb: "/discover/movie?with_genres=53&language=es&sort_by=popularity.desc&page={page}" },
  { id: "tmdb-romance-movie", name: "Romance", type: "movie", tmdb: "/discover/movie?with_genres=10749&language=es&sort_by=popularity.desc&page={page}" },
  { id: "tmdb-animation-movie", name: "Animaci\xF3n", type: "movie", tmdb: "/discover/movie?with_genres=16&language=es&sort_by=popularity.desc&page={page}" },
  // ── Series ──
  { id: "tmdb-popular-series", name: "Series Populares", type: "series", tmdb: "/tv/popular?language=es&page={page}" },
  { id: "tmdb-top-series", name: "Series Mejor Valoradas", type: "series", tmdb: "/tv/top_rated?language=es&page={page}" },
  { id: "tmdb-trending-series", name: "Series en Tendencia", type: "series", tmdb: "/trending/tv/week?language=es&page={page}" },
  // ── Anime (filtrado por país JP para excluir animación occidental) ──
  // type: 'anime' so Stremio/NuvioTV requests /stream/anime/ovn:ID, letting
  // classifyByType detect anime instantly without relying on a TMDB lookup.
  { id: "tmdb-popular-anime", name: "Anime Popular", type: "anime", tmdb: "/discover/tv?with_genres=16&with_origin_country=JP&language=es&sort_by=popularity.desc&vote_count.gte=50&page={page}" },
  { id: "tmdb-top-anime", name: "Anime Mejor Valorado", type: "anime", tmdb: "/discover/tv?with_genres=16&with_origin_country=JP&language=es&sort_by=vote_average.desc&vote_count.gte=200&page={page}" },
  { id: "tmdb-trending-anime", name: "Anime en Tendencia", type: "anime", tmdb: "/discover/tv?with_genres=16&with_origin_country=JP&language=es&sort_by=popularity.desc&page={page}" },
  // ── Anime Movies ──
  { id: "tmdb-popular-anime-movie", name: "Pel\xEDculas Anime Populares", type: "movie", tmdb: "/discover/movie?with_genres=16&with_origin_country=JP&language=es&sort_by=popularity.desc&vote_count.gte=20&page={page}" },
  { id: "tmdb-top-anime-movie", name: "Pel\xEDculas Anime Mejor Valoradas", type: "movie", tmdb: "/discover/movie?with_genres=16&with_origin_country=JP&language=es&sort_by=vote_average.desc&vote_count.gte=100&page={page}" },
  // ── Universal (IDs tt<imdb> para compatibilidad con otros addons) ──
  { id: "tt-popular-movie", name: "Todas las Pel\xEDculas", type: "movie", tmdb: "/movie/popular?language=es&page={page}" },
  { id: "tt-popular-series", name: "Todas las Series", type: "series", tmdb: "/tv/popular?language=es&page={page}" },
  { id: "tt-popular-anime", name: "Todo Anime", type: "anime", tmdb: "/discover/tv?with_genres=16&with_origin_country=JP&language=es&sort_by=popularity.desc&vote_count.gte=50&page={page}" },
  { id: "tt-popular-anime-movie", name: "Pel\xEDculas Anime (Universal)", type: "movie", tmdb: "/discover/movie?with_genres=16&with_origin_country=JP&language=es&sort_by=popularity.desc&vote_count.gte=20&page={page}" }
];
function loadGenres() {
  return __async(this, null, function* () {
    if (genreCache.loaded) return;
    try {
      const [movies, series] = yield Promise.all([
        tmdbFetch("/genre/movie/list?language=es"),
        tmdbFetch("/genre/tv/list?language=es")
      ]);
      if (movies == null ? void 0 : movies.genres) for (const g of movies.genres) genreCache.map[g.id] = g.name;
      if (series == null ? void 0 : series.genres) for (const g of series.genres) genreCache.map[g.id] = g.name;
      genreCache.loaded = true;
    } catch (e) {
    }
  });
}
function catDef(id) {
  return CATEGORIES.find((c) => c.id === id);
}
function tmdbFetch(path) {
  return __async(this, null, function* () {
    return fetchTMDB(path);
  });
}
function itemGenres(item) {
  if (item.genres) return item.genres.map((g) => g.name);
  if (item.genre_ids && genreCache.loaded) return item.genre_ids.map((id) => genreCache.map[id]).filter(Boolean);
  return [];
}
function toMetaItem(item, type) {
  var _a;
  const isAnime = type === "anime" || item.genre_ids && item.genre_ids.includes(16) && ((_a = item.origin_country) == null ? void 0 : _a.includes("JP"));
  const effectiveType = isAnime ? "series" : type;
  const idPrefix = isAnime ? "ovn-anime" : "ovn";
  return {
    id: `${idPrefix}:${item.id}`,
    type: effectiveType,
    name: item.title || item.name || "Unknown",
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
    background: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
    description: (item.overview || "").substring(0, 500),
    releaseInfo: (item.release_date || item.first_air_date || "").substring(0, 4),
    imdbRating: item.vote_average ? String(Math.round(item.vote_average * 10) / 10) : null,
    genres: itemGenres(item)
  };
}
function getCatalog(catalogId, page = 1) {
  return __async(this, null, function* () {
    var _a;
    const cat = catDef(catalogId);
    if (!cat) return { metas: [] };
    const ck = `cat:${catalogId}:${page}`;
    const cached = catCache.get(ck);
    if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;
    yield loadGenres();
    const path = cat.tmdb.replace("{page}", page);
    const data = yield tmdbFetch(path);
    if (!((_a = data == null ? void 0 : data.results) == null ? void 0 : _a.length)) return { metas: [] };
    const metas = data.results.map((r) => toMetaItem(r, cat.type));
    const totalPages = data.total_pages || 1;
    const result = { metas };
    if (page < totalPages && page < 500) {
      result.next = page + 1;
    }
    catCache.set(ck, { data: result, time: Date.now() });
    if (catCache.size > MAX_CACHE) {
      const first = catCache.keys().next().value;
      catCache.delete(first);
    }
    return result;
  });
}
function searchCatalog(query, page = 1) {
  return __async(this, null, function* () {
    var _a;
    const q = encodeURIComponent(query);
    const data = yield tmdbFetch(`/search/multi?query=${q}&language=es&page=${page}`);
    if (!((_a = data == null ? void 0 : data.results) == null ? void 0 : _a.length)) return { metas: [] };
    yield loadGenres();
    const metas = data.results.filter((r) => r.media_type === "movie" || r.media_type === "tv").map((r) => toMetaItem(r, r.media_type === "movie" ? "movie" : "series"));
    return { metas };
  });
}
function getFilmaffinityMeta(imdbId) {
  return __async(this, null, function* () {
    var _a;
    try {
      const url = `https://www.filmaffinity.com/es/search.php?stext=${imdbId}`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6e3);
      const res = yield fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", "Accept": "text/html" },
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (!res.ok) return null;
      const html = yield res.text();
      const cheerio = require("cheerio-without-node-native") || require("cheerio");
      const $ = cheerio.load(html);
      const first = $(".se-last a, .movie-poster-list a").first();
      const faUrl = first.attr("href");
      if (!faUrl) return null;
      const faId = (_a = faUrl.match(/film(\d+)\.html/)) == null ? void 0 : _a[1];
      if (!faId) return null;
      const detailUrl = `https://www.filmaffinity.com/es/film${faId}.html`;
      const dRes = yield fetch(detailUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Accept": "text/html" },
        signal: AbortSignal.timeout(6e3)
      });
      if (!dRes.ok) return null;
      const dHtml = yield dRes.text();
      const $$ = cheerio.load(dHtml);
      const title = $$("h1#main-title").text().trim() || $$(".movie-title").text().trim() || null;
      const year = $$(".movie-year").text().trim() || $$('[itemprop="datePublished"]').text().trim() || null;
      const rating = $$(".avg-rating").text().trim() || $$('[itemprop="ratingValue"]').text().trim() || null;
      const synopsis = $$(".movie-synopsis").text().trim() || $$('[itemprop="description"]').text().trim() || null;
      const genres = [];
      $$('.movie-genres a, [itemprop="genre"]').each((_, el) => {
        const g = $$(el).text().trim();
        if (g) genres.push(g);
      });
      const poster = $$(".movie-poster img").attr("src") || $$('[property="og:image"]').attr("content") || null;
      const bg = $$('[property="og:image"]').attr("content") || null;
      return { title, year, rating, synopsis, genres, poster, background: bg, faId, url: detailUrl };
    } catch (e) {
      return null;
    }
  });
}
function getAmatsuMeta(anilistId) {
  return __async(this, null, function* () {
    return yield content.profile.resolveByAnimeId(anilistId);
  });
}
function getAmatsuCatalog(catalogId, page = 1) {
  return __async(this, null, function* () {
    return yield anime.amatsu.getCatalog(catalogId, page);
  });
}
function getPigamerCatalog(catalogId, page = 1) {
  return __async(this, null, function* () {
    return yield anime.pigamer.getCatalog(catalogId, page);
  });
}
function searchAnilist(query) {
  return __async(this, null, function* () {
    return yield anime.amatsu.searchAnilist(query);
  });
}
function fetchIMDbId(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      if (mediaType === "tv") {
        const data2 = yield tmdbFetch(`/tv/${tmdbId}/external_ids`);
        return (data2 == null ? void 0 : data2.imdb_id) || null;
      }
      const data = yield tmdbFetch(`/movie/${tmdbId}?language=en`);
      return (data == null ? void 0 : data.imdb_id) || null;
    } catch (e) {
      return null;
    }
  });
}
function getUniversalCatalog(catalogId, page = 1) {
  return __async(this, null, function* () {
    var _a;
    const cat = catDef(catalogId);
    if (!cat) return { metas: [] };
    const ck = `univ:${catalogId}:${page}`;
    const cached = catCache.get(ck);
    if (cached && Date.now() - cached.time < CACHE_TTL) return cached.data;
    yield loadGenres();
    const path = cat.tmdb.replace("{page}", page);
    const data = yield tmdbFetch(path);
    if (!((_a = data == null ? void 0 : data.results) == null ? void 0 : _a.length)) return { metas: [] };
    const mediaType = cat.type === "movie" ? "movie" : "tv";
    const imdbIds = yield Promise.all(data.results.map((r) => fetchIMDbId(r.id, mediaType)));
    const metas = data.results.map((r, idx) => {
      const base = toMetaItem(r, cat.type);
      const imdbId = imdbIds[idx];
      return __spreadProps(__spreadValues({}, base), { id: imdbId || base.id });
    });
    const totalPages = data.total_pages || 1;
    const result = { metas };
    if (page < totalPages && page < 500) {
      result.next = page + 1;
    }
    catCache.set(ck, { data: result, time: Date.now() });
    if (catCache.size > MAX_CACHE) {
      const first = catCache.keys().next().value;
      catCache.delete(first);
    }
    return result;
  });
}
function getAmatsuCatalogDefs() {
  return [
    { id: "amatsu_seasonal_series", name: "Anime de Temporada (Amatsu)", type: "anime", extra: [{ name: "search", isRequired: false }] },
    { id: "amatsu_airing_series", name: "Anime Emiti\xE9ndose (Amatsu)", type: "anime", extra: [{ name: "search", isRequired: false }] },
    { id: "amatsu_trending_series", name: "Anime Tendencias (Amatsu)", type: "anime", extra: [{ name: "search", isRequired: false }] },
    { id: "amatsu_top_series", name: "Anime Mejor Valorado (Amatsu)", type: "anime", extra: [{ name: "search", isRequired: false }] }
  ];
}
function getUniversalCatalogDefs(config) {
  const defs = [
    { id: "tt-popular-movie", name: "Todas las Pel\xEDculas (Universal)", type: "movie", extra: [{ name: "search", isRequired: false }] },
    { id: "tt-popular-series", name: "Todas las Series (Universal)", type: "series", extra: [{ name: "search", isRequired: false }] }
  ];
  if (config == null ? void 0 : config.enableAnime) {
    defs.push(
      { id: "tt-popular-anime", name: "Todo Anime (Universal)", type: "anime", extra: [{ name: "search", isRequired: false }] },
      { id: "tt-popular-anime-movie", name: "Pel\xEDculas Anime (Universal)", type: "movie", extra: [{ name: "search", isRequired: false }] }
    );
  }
  return defs;
}
function getAnimeCatalogDefs() {
  return __async(this, null, function* () {
    return [
      { id: "tmdb-popular-anime", name: "Anime Popular", type: "anime" },
      { id: "tmdb-top-anime", name: "Anime Mejor Valorado", type: "anime" },
      { id: "tmdb-trending-anime", name: "Anime en Tendencia", type: "anime" },
      { id: "tmdb-popular-anime-movie", name: "Pel\xEDculas Anime Populares", type: "anime" },
      { id: "tmdb-top-anime-movie", name: "Pel\xEDculas Anime Mejor Valoradas", type: "anime" }
    ];
  });
}
function getKitsuCatalog(catalogId, page = 1) {
  return __async(this, null, function* () {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1e4);
      const res = yield fetch(
        `https://kitsu.io/api/edge/anime?sort=-user_count&page[limit]=20&page[offset]=${(page - 1) * 20}`,
        { headers: { "Accept": "application/vnd.api+json", "User-Agent": "Mozilla/5.0" }, signal: ctrl.signal }
      );
      clearTimeout(t);
      if (!res.ok) return { metas: [] };
      const data = yield res.json();
      const metas = (data.data || []).map((item) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
        return {
          id: `kitsu:${item.id}`,
          type: ((_a = item.attributes) == null ? void 0 : _a.subtype) === "movie" ? "movie" : "series",
          name: ((_b = item.attributes) == null ? void 0 : _b.canonicalTitle) || ((_d = (_c = item.attributes) == null ? void 0 : _c.titles) == null ? void 0 : _d.en) || ((_f = (_e = item.attributes) == null ? void 0 : _e.titles) == null ? void 0 : _f.en_jp) || "Unknown",
          poster: ((_h = (_g = item.attributes) == null ? void 0 : _g.posterImage) == null ? void 0 : _h.medium) || null,
          description: (((_i = item.attributes) == null ? void 0 : _i.synopsis) || "").substring(0, 500),
          releaseInfo: ((_k = (_j = item.attributes) == null ? void 0 : _j.startDate) == null ? void 0 : _k.substring(0, 4)) || "",
          imdbRating: ((_l = item.attributes) == null ? void 0 : _l.averageRating) || null
        };
      });
      return { metas };
    } catch (e) {
      return { metas: [] };
    }
  });
}
function searchKitsu(query) {
  return __async(this, null, function* () {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1e4);
      const res = yield fetch(
        `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=20`,
        { headers: { "Accept": "application/vnd.api+json", "User-Agent": "Mozilla/5.0" }, signal: ctrl.signal }
      );
      clearTimeout(t);
      if (!res.ok) return [];
      const data = yield res.json();
      return (data.data || []).map((item) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
        return {
          id: `kitsu:${item.id}`,
          type: ((_a = item.attributes) == null ? void 0 : _a.subtype) === "movie" ? "movie" : "series",
          name: ((_b = item.attributes) == null ? void 0 : _b.canonicalTitle) || ((_d = (_c = item.attributes) == null ? void 0 : _c.titles) == null ? void 0 : _d.en) || ((_f = (_e = item.attributes) == null ? void 0 : _e.titles) == null ? void 0 : _f.en_jp) || "Unknown",
          poster: ((_h = (_g = item.attributes) == null ? void 0 : _g.posterImage) == null ? void 0 : _h.medium) || null,
          description: (((_i = item.attributes) == null ? void 0 : _i.synopsis) || "").substring(0, 500),
          releaseInfo: ((_k = (_j = item.attributes) == null ? void 0 : _j.startDate) == null ? void 0 : _k.substring(0, 4)) || "",
          imdbRating: ((_l = item.attributes) == null ? void 0 : _l.averageRating) || null
        };
      });
    } catch (e) {
      return [];
    }
  });
}
module.exports = {
  CATEGORIES,
  catDef,
  getCatalog,
  searchCatalog,
  getFilmaffinityMeta,
  getUniversalCatalog,
  getAmatsuMeta,
  getAmatsuCatalog,
  searchAnilist,
  getAmatsuCatalogDefs,
  getUniversalCatalogDefs,
  getAnimeCatalogDefs,
  getPigamerCatalog,
  getKitsuCatalog,
  searchKitsu
};
