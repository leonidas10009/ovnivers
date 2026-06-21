/**
 * content - Built from src/content/
 * Generated: 2026-06-21T13:05:52.859Z
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
      const hasGenre16 = (data.genres || []).some((g) => g.id === 16) || (data.genre_ids || []).includes(16);
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

// src/anime/resolver.js
var require_resolver = __commonJS({
  "src/anime/resolver.js"(exports2, module2) {
    var { PIGAMER_BASE, isAnimeSourceId, isAnimeXrefId } = require_types2();
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
            cacheSet(resolveCache, id, meta.meta.id, MAX_CACHE);
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
                cacheSet(resolveCache, id, tmdbStr, MAX_CACHE);
                return tmdbStr;
              }
              const anilistId = rel == null ? void 0 : rel.anilist;
              if (anilistId && source !== "anilist") {
                const anilistStr = `anilist:${anilistId}`;
                const meta2 = yield fetchPigamer(`/meta/series/${encodeURIComponent(anilistStr)}.json`);
                if (((_b = meta2 == null ? void 0 : meta2.meta) == null ? void 0 : _b.id) && isAnimeSourceId(meta2.meta.id)) {
                  cacheSet(resolveCache, id, meta2.meta.id, MAX_CACHE);
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
                      cacheSet(resolveCache, id, meta.meta.id, MAX_CACHE);
                      return meta.meta.id;
                    }
                  }
                }
              }
            }
          } catch (e) {
          }
        }
        cacheSet(resolveCache, id, null, MAX_CACHE);
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
    var MAX_CACHE = 500;
    var CACHE_TTL = 60 * 60 * 1e3;
    function cacheGet(key) {
      const entry = profileCache.get(key);
      if (entry && Date.now() - entry.time < CACHE_TTL) return entry.value;
      if (entry) profileCache.delete(key);
      return void 0;
    }
    function cacheSet(key, value) {
      if (profileCache.size >= MAX_CACHE) {
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
        const profile2 = __spreadProps(__spreadValues({}, normalizeMeta(raw, mediaType)), {
          altTitles,
          titleES: (esData == null ? void 0 : esData.title) || (esData == null ? void 0 : esData.name) || "",
          overviewES: ((esData == null ? void 0 : esData.overview) || "").substring(0, 2e3),
          isAnime: tmdb.isJapaneseAnime(raw),
          seasons: void 0,
          videos: void 0
        });
        if (profile2.isAnime) {
          try {
            const titles = yield animeTitles.fromTMDB(tmdbId, mediaType);
            if (titles) {
              profile2.searchTitles = titles.searchTitles || [];
              profile2.synonyms = titles.synonyms || [];
              profile2.titleJA = titles.titleJA || "";
              profile2.titleES = titles.titleES || "";
            }
          } catch (e) {
          }
        } else {
          try {
            const altTitles2 = yield tmdb.getAltTitles(tmdbId, mediaType);
            const esData2 = yield tmdb.getMeta(tmdbId, mediaType, "es");
            profile2.searchTitles = [profile2.title, ...altTitles2 || []].filter((t) => t && t.length >= 3).slice(0, 10);
            profile2.titleES = (esData2 == null ? void 0 : esData2.title) || (esData2 == null ? void 0 : esData2.name) || "";
            profile2.synonyms = altTitles2 || [];
          } catch (e) {
          }
        }
        if (mediaType === "tv" && ((_a = raw.seasons) == null ? void 0 : _a.length)) {
          profile2.seasons = raw.seasons.filter((s) => s.season_number > 0).map((s) => ({
            seasonNumber: s.season_number,
            episodeCount: s.episode_count || 0,
            name: s.name || "",
            overview: (s.overview || "").substring(0, 500),
            poster: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : null,
            airDate: s.air_date || ""
          }));
        }
        cacheSet(ck, profile2);
        return profile2;
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
        const profile2 = {
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
              profile2.overview = tmdbProfile.overview || profile2.overview;
              profile2.poster = tmdbProfile.poster || profile2.poster;
              profile2.background = tmdbProfile.background || profile2.background;
              profile2.year = tmdbProfile.year || profile2.year;
              profile2.imdbRating = tmdbProfile.imdbRating || profile2.imdbRating;
              profile2.genres = tmdbProfile.genres;
              profile2.genreIds = tmdbProfile.genreIds;
              profile2.seasons = tmdbProfile.seasons;
              profile2.runtime = tmdbProfile.runtime;
              profile2.status = tmdbProfile.status || profile2.status;
              if ((_a = tmdbProfile.searchTitles) == null ? void 0 : _a.length) {
                const existing = new Set(profile2.searchTitles.map((t) => t.toLowerCase()));
                for (const t of tmdbProfile.searchTitles) {
                  if (!existing.has(t.toLowerCase())) {
                    profile2.searchTitles.push(t);
                    existing.add(t.toLowerCase());
                  }
                }
              }
              if (tmdbProfile.isAnime) profile2.isAnime = true;
            }
          } catch (e) {
          }
        }
        cacheSet(ck, profile2);
        return profile2;
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
    function buildStremioMeta(profile2, id) {
      if (!profile2) return null;
      return {
        id: id || profile2.id,
        type: profile2.mediaType === "tv" ? "series" : "movie",
        name: profile2.title,
        poster: profile2.poster,
        background: profile2.background,
        description: profile2.overviewES || profile2.overview || "",
        releaseInfo: profile2.year ? String(profile2.year) : profile2.releaseDate || "",
        runtime: profile2.runtime,
        imdbRating: profile2.imdbRating,
        genres: profile2.genres.map((g) => g.name),
        videos: profile2.videos
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
    var MAX_CACHE = 500;
    var CACHE_TTL = 60 * 60 * 1e3;
    function cacheGet(key) {
      const entry = detectCache.get(key);
      if (entry && Date.now() - entry.time < CACHE_TTL) return entry.value;
      if (entry) detectCache.delete(key);
      return void 0;
    }
    function cacheSet(key, value) {
      if (detectCache.size >= MAX_CACHE) {
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
    var MAX_CACHE = 300;
    var CACHE_TTL = 60 * 60 * 1e3;
    function cacheGet(map, key, ttl = CACHE_TTL) {
      const entry = map.get(key);
      if (entry && Date.now() - entry.time < ttl) return entry.value;
      if (entry) map.delete(key);
      return void 0;
    }
    function cacheSet(map, key, value, max = MAX_CACHE) {
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
      let episode2 = 1;
      let animePrefix = null;
      if (id.startsWith("tmdb:") || id.startsWith("ovn-anime:") || id.startsWith("ovn:")) {
        const parts = id.split(":");
        contentId = parts[1] || id.replace(/^(tmdb:|ovn-anime:|ovn:)/, "");
        if (parts.length >= 4) {
          season = parseInt(parts[2]) || 1;
          episode2 = parseInt(parts[3]) || 1;
        }
        return { contentId, season, episode: episode2 };
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
            episode2 = parseInt(parts[2]) || 1;
          }
          break;
        }
      }
      return { contentId, season, episode: episode2, animePrefix };
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
    function findEpisode(tmdbId, season, episode2) {
      return __async(this, null, function* () {
        const episodes = yield getSeasonEpisodes(tmdbId, season);
        return episodes.find((ep) => ep.episode === episode2) || null;
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
    function filterEpisodeStreams(streams, season, episode2) {
      return streams.filter((s) => {
        const title = s.title || s.name || "";
        if (isPack(title)) return false;
        if (season !== void 0 && episode2 !== void 0) {
          const check = verifySE(title, season, episode2);
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
var profile = require_profile();
var identifier = require_identifier();
var episode = require_episode();
module.exports = __spreadValues({
  profile,
  identifier,
  episode
}, identifier);
