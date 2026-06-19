/**
 * anime - Built from src/anime/
 * Generated: 2026-06-19T18:33:13.593Z
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

// src/anime/detector.js
var require_detector = __commonJS({
  "src/anime/detector.js"(exports2, module2) {
    var { ANIME_PREFIXES, ANIME_GENRE_ID, ANIME_ORIGIN_COUNTRY, isAnimeId } = require_types();
    var TMDB_KEY = process.env.TMDB_KEY || "d80ba92bc7cefe3359668d30d06f3305";
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    var detectionCache = /* @__PURE__ */ new Map();
    var MAX_CACHE = 500;
    var CACHE_TTL = 60 * 60 * 1e3;
    function cacheGet(key) {
      const entry = detectionCache.get(key);
      if (entry && Date.now() - entry.time < CACHE_TTL) return entry.value;
      if (entry) detectionCache.delete(key);
      return void 0;
    }
    function cacheSet(key, value) {
      if (detectionCache.size >= MAX_CACHE) {
        const first = detectionCache.keys().next().value;
        detectionCache.delete(first);
      }
      detectionCache.set(key, { value, time: Date.now() });
    }
    function fetchTMDB(path, timeout = 5e3) {
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
    function detectAnime2(id, type, mediaType, config) {
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
        const tmdb = yield fetchTMDB(`/tv/${rawId}`);
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
    module2.exports = { detectAnime: detectAnime2 };
  }
});

// src/anime/resolver.js
var require_resolver = __commonJS({
  "src/anime/resolver.js"(exports2, module2) {
    var { PIGAMER_BASE, isAnimeSourceId, isAnimeXrefId } = require_types();
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    var resolveCache = /* @__PURE__ */ new Map();
    var tmdbCache = /* @__PURE__ */ new Map();
    var MAX_CACHE = 500;
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
    function resolveAnimeId2(id) {
      return __async(this, null, function* () {
        var _a;
        if (isAnimeSourceId(id)) return id;
        if (!isAnimeXrefId(id)) return null;
        const cached = cacheGet(resolveCache, id, RESOLVE_TTL);
        if (cached !== void 0) return cached;
        try {
          const meta = yield fetchPigamer(`/meta/series/${encodeURIComponent(id)}.json`);
          if (((_a = meta == null ? void 0 : meta.meta) == null ? void 0 : _a.id) && isAnimeSourceId(meta.meta.id)) {
            cacheSet(resolveCache, id, meta.meta.id, MAX_CACHE);
            return meta.meta.id;
          }
        } catch (e) {
        }
        cacheSet(resolveCache, id, null, MAX_CACHE);
        return null;
      });
    }
    function getAnimeTMDbId2(id) {
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
              cacheSet(tmdbCache, id, tmdbId, MAX_CACHE);
              return tmdbId;
            }
          }
        } catch (e) {
        }
        cacheSet(tmdbCache, id, null, MAX_CACHE);
        return null;
      });
    }
    function resolveToTMDbId2(rawId, mediaType, isAnime) {
      return __async(this, null, function* () {
        if (!isAnime) return null;
        if (rawId.match(/^\d+$/)) return rawId;
        const proxyId = (yield resolveAnimeId2(rawId)) || rawId;
        const tmdbId = yield getAnimeTMDbId2(proxyId);
        if (tmdbId) return tmdbId;
        return proxyId;
      });
    }
    module2.exports = { resolveAnimeId: resolveAnimeId2, getAnimeTMDbId: getAnimeTMDbId2, resolveToTMDbId: resolveToTMDbId2 };
  }
});

// src/anime/pigamer.js
var require_pigamer = __commonJS({
  "src/anime/pigamer.js"(exports2, module2) {
    var { PIGAMER_BASE, UA } = require_types();
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
    function getCatalog(catalogId, page = 1) {
      return __async(this, null, function* () {
        var _a;
        const type = pigamerTypeForCatalogId(catalogId);
        const data = yield fetchPigamer(`/catalog/${type}/${encodeURIComponent(catalogId)}.json`, 15e3);
        if (!((_a = data == null ? void 0 : data.metas) == null ? void 0 : _a.length)) return { metas: [] };
        return { metas: data.metas };
      });
    }
    module2.exports = { getStreams, getMeta, fetchPigamer, getCatalog };
  }
});

// src/anime/amatsu.js
var require_amatsu = __commonJS({
  "src/anime/amatsu.js"(exports2, module2) {
    var { AMATSU_BASE, UA } = require_types();
    var metaCache = /* @__PURE__ */ new Map();
    var MAX_CACHE = 300;
    var CACHE_TTL = 30 * 60 * 1e3;
    function cacheGet(key) {
      const entry = metaCache.get(key);
      if (entry && Date.now() - entry.time < CACHE_TTL) return entry.value;
      if (entry) metaCache.delete(key);
      return void 0;
    }
    function cacheSet(key, value) {
      if (metaCache.size >= MAX_CACHE) {
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
    function getCatalog(catalogId, page = 1) {
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
    function searchAnilist(query) {
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
    module2.exports = { getMeta, getSynonyms, getCatalog, searchAnilist };
  }
});

// src/anime/providers.js
var require_providers = __commonJS({
  "src/anime/providers.js"(exports2, module2) {
    var { ANIME_PROVIDER_IDS } = require_types();
    function filterLocalProviders2(providers, isAnime, mediaType, type, config) {
      return providers.filter((provider) => {
        if (isAnime && !ANIME_PROVIDER_IDS.has(provider.id)) return false;
        if (!isAnime && ANIME_PROVIDER_IDS.has(provider.id)) return false;
        return true;
      });
    }
    function getAlfaCategory2(isAnime, type) {
      if (isAnime) return "anime";
      if (type === "series" || type === "tv") return "tvshow";
      if (type === "movie") return "movie";
      return "movie";
    }
    module2.exports = { filterLocalProviders: filterLocalProviders2, getAlfaCategory: getAlfaCategory2 };
  }
});

// src/media/types.js
var require_types2 = __commonJS({
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
    var { TMDB_KEY, TMDB_BASE, UA } = require_types2();
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
        const titles2 = [];
        if (data.titles) {
          for (const t of data.titles) {
            if (t.title && t.title.length > 1) titles2.push(t.title);
          }
        }
        if (data.results) {
          for (const t of data.results) {
            if (t.title && t.title.length > 1) titles2.push(t.title);
          }
        }
        const unique = [...new Set(titles2)];
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

// src/anime/titles.js
var require_titles = __commonJS({
  "src/anime/titles.js"(exports2, module2) {
    var { PIGAMER_BASE, AMATSU_BASE, UA, isAnimeId, isAnimeSourceId, isAnimeXrefId, ANIME_SOURCE_PREFIXES } = require_types();
    var tmdb = require_tmdb();
    var { resolveAnimeId: resolveAnimeId2, getAnimeTMDbId: getAnimeTMDbId2 } = require_resolver();
    var titleCache = /* @__PURE__ */ new Map();
    var MAX_CACHE = 500;
    var CACHE_TTL = 24 * 60 * 60 * 1e3;
    function cacheGet(key) {
      const entry = titleCache.get(key);
      if (entry && Date.now() - entry.time < CACHE_TTL) return entry.value;
      if (entry) titleCache.delete(key);
      return void 0;
    }
    function cacheSet(key, value) {
      if (titleCache.size >= MAX_CACHE) {
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
        const titles2 = /* @__PURE__ */ new Set();
        const meta = data.meta;
        if (meta.name) titles2.add(meta.name);
        if (meta.englishName && meta.englishName !== meta.name) titles2.add(meta.englishName);
        if (meta.altName && meta.altName !== meta.name) titles2.add(meta.altName);
        if (Array.isArray(meta.synonyms)) {
          for (const s of meta.synonyms) {
            if (s && s.length > 1) titles2.add(s);
          }
        }
        return {
          titleEN: meta.englishName || meta.name || "",
          titleJA: meta.name || "",
          altName: meta.altName || "",
          synonyms: [...titles2].slice(0, 30),
          poster: meta.poster || null,
          year: meta.releaseInfo || null
        };
      });
    }
    function fromPigamer(animeId) {
      return __async(this, null, function* () {
        const data = yield fetchJSON(`${PIGAMER_BASE}/meta/series/${encodeURIComponent(animeId)}.json`, 15e3);
        if (!(data == null ? void 0 : data.meta)) return null;
        const titles2 = /* @__PURE__ */ new Set();
        const meta = data.meta;
        if (meta.name) titles2.add(meta.name);
        if (meta.englishName && meta.englishName !== meta.name) titles2.add(meta.englishName);
        if (meta.altName && meta.altName !== meta.name) titles2.add(meta.altName);
        if (Array.isArray(meta.synonyms)) {
          for (const s of meta.synonyms) {
            if (s && s.length > 1) titles2.add(s);
          }
        }
        if (Array.isArray(meta.links)) {
          for (const link of meta.links) {
            if (link.name && !titles2.has(link.name)) titles2.add(link.name);
          }
        }
        return {
          titleEN: meta.englishName || meta.name || "",
          titleJA: meta.name || "",
          altName: meta.altName || "",
          links: meta.links || [],
          synonyms: [...titles2].slice(0, 30),
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
        const titles2 = /* @__PURE__ */ new Set();
        const orig = en.original_name || en.original_title || "";
        const name = en.name || en.title || "";
        if (name) titles2.add(name);
        if (orig && orig !== name) titles2.add(orig);
        if (es) {
          const esName = es.name || es.title || "";
          if (esName && esName !== name) titles2.add(esName);
        }
        if (Array.isArray(altTitles)) {
          for (const t of altTitles) {
            if (t && t.length > 1 && !titles2.has(t)) titles2.add(t);
          }
        }
        return {
          titleEN: name,
          titleES: (es == null ? void 0 : es.name) || (es == null ? void 0 : es.title) || "",
          titleJA: orig,
          synonyms: [...titles2].slice(0, 30),
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
          const tmdbId = yield getAnimeTMDbId2(inputId);
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
          const resolved = yield resolveAnimeId2(inputId);
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
        const titles2 = yield resolveTitles(inputId);
        if (!titles2) return [];
        return titles2.searchTitles;
      });
    }
    function getEnglishTitle(inputId) {
      return __async(this, null, function* () {
        const titles2 = yield resolveTitles(inputId);
        if (!titles2) return null;
        return titles2.titleEN || titles2.searchTitles[0] || null;
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

// src/anime/scrapers/animeflv.js
var require_animeflv = __commonJS({
  "src/anime/scrapers/animeflv.js"(exports2, module2) {
    var cheerio = require("cheerio-without-node-native") || require("cheerio");
    var BASE = "https://www3.animeflv.net";
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
        let videosStr = null;
        const $ = cheerio.load(html);
        $("script").each((_, el) => {
          const text = $(el).html() || "";
          const m = text.match(/var videos\s*=\s*(\{[^;]+\});/);
          if (m) videosStr = m[1];
        });
        if (!videosStr) return [];
        let videos;
        try {
          videos = JSON.parse(videosStr);
        } catch (e) {
          return [];
        }
        const results = [];
        const processServers = (servers, lang) => {
          if (!Array.isArray(servers)) return;
          for (const s of servers) {
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

// src/anime/scrapers/index.js
var require_scrapers = __commonJS({
  "src/anime/scrapers/index.js"(exports2, module2) {
    var animeflv = require_animeflv();
    function getStreams(id, season, episode, pigamerGetStreams) {
      return __async(this, null, function* () {
        var _a, _b;
        const animePrefixes = ["animeflv:", "animeav1:", "henaojara:", "tioanime:"];
        const hasAnimePrefix = animePrefixes.some((p) => id.startsWith(p));
        if (hasAnimePrefix) {
          const slug = extractSlug(id);
          if (!slug || slug.match(/^\d+$/)) {
          } else {
            const promises = [];
            if (id.startsWith("animeflv:")) {
              promises.push(
                (() => __async(null, null, function* () {
                  try {
                    const streams = yield animeflv.getStreams(slug, episode || 1);
                    return { provider: "AnimeFLV", streams };
                  } catch (e) {
                    return { provider: "AnimeFLV", streams: [] };
                  }
                }))()
              );
            }
            const providers = [
              { prefix: "animeflv:", label: "AnimeFLV" },
              { prefix: "animeav1:", label: "AnimeAV1" },
              { prefix: "henaojara:", label: "Henaojara" },
              { prefix: "tioanime:", label: "TioAnime" }
            ];
            for (const { prefix, label } of providers) {
              if (id.startsWith(prefix)) continue;
              const providerId = `${prefix}${slug}`;
              promises.push(
                (() => __async(null, null, function* () {
                  try {
                    const streams = yield pigamerGetStreams(providerId, season, episode);
                    return { provider: label, streams };
                  } catch (e) {
                    return { provider: label, streams: [] };
                  }
                }))()
              );
            }
            const results = yield Promise.allSettled(promises);
            const allStreams = [];
            for (const r of results) {
              if (r.status === "fulfilled" && ((_b = (_a = r.value) == null ? void 0 : _a.streams) == null ? void 0 : _b.length)) {
                allStreams.push(...r.value.streams);
              }
            }
            if (allStreams.length) return { source: "parallel", streams: allStreams };
          }
        }
        try {
          const streams = yield pigamerGetStreams(id, season, episode);
          return { source: "pigamer", streams };
        } catch (e) {
          return { source: "error", streams: [] };
        }
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
    module2.exports = { getStreams, getOnAirCatalog, animeflv };
  }
});

// src/anime/index.js
var types = require_types();
var { detectAnime } = require_detector();
var { resolveAnimeId, getAnimeTMDbId, resolveToTMDbId } = require_resolver();
var pigamer = require_pigamer();
var amatsu = require_amatsu();
var { filterLocalProviders, getAlfaCategory } = require_providers();
var titles = require_titles();
var scrapers = require_scrapers();
module.exports = __spreadProps(__spreadValues({}, types), {
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
