/**
 * anime - Built from src/anime/
 * Generated: 2026-06-20T14:53:14.855Z
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

// src/anime/types.js
var require_types = __commonJS({
  "src/anime/types.js"(exports2, module2) {
    var ANIME_SOURCE_PREFIXES = ["animeflv:", "animeav1:", "henaojara:", "tioanime:", "jkanime:"];
    var ANIME_XREF_PREFIXES = ["anilist:", "kitsu:", "mal:", "anidb:", "tmdb:"];
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
              const titles2 = [
                attrs == null ? void 0 : attrs.canonicalTitle,
                (_d = attrs == null ? void 0 : attrs.titles) == null ? void 0 : _d.en,
                (_e = attrs == null ? void 0 : attrs.titles) == null ? void 0 : _e.en_jp,
                (_f = attrs == null ? void 0 : attrs.titles) == null ? void 0 : _f.ja_jp
              ].filter(Boolean);
              for (const title of titles2.slice(0, 2)) {
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
    var BASE = "https://www4.animeflv.net";
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

// src/puppeteer-resolver.js
var require_puppeteer_resolver = __commonJS({
  "src/puppeteer-resolver.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    var puppeteer = null;
    var browser = null;
    var browserPromise = null;
    function getPuppeteer() {
      return __async(this, null, function* () {
        if (puppeteer) return puppeteer;
        try {
          puppeteer = (yield import("puppeteer-core")).default || puppeteer;
          if (puppeteer) return puppeteer;
          throw new Error("no default export");
        } catch (e) {
          console.error("[pptr] puppeteer-core:", e.message);
          return null;
        }
      });
    }
    function getChromium() {
      return __async(this, null, function* () {
        try {
          const mod = yield import("@sparticuz/chromium");
          const Cr = mod.default;
          const exePath = yield Cr.executablePath();
          const args = Cr.args || [];
          console.log("[pptr] chromium ready:", exePath.substring(0, 60));
          return { executablePath: exePath, args, headless: "shell" };
        } catch (e) {
          console.error("[pptr] @sparticuz/chromium:", e.message);
          return null;
        }
      });
    }
    function closeBrowser() {
      return __async(this, null, function* () {
        if (browser) {
          try {
            yield browser.close();
          } catch (e) {
          }
          browser = null;
          browserPromise = null;
        }
      });
    }
    var cache = /* @__PURE__ */ new Map();
    var CACHE_TTL = 30 * 60 * 1e3;
    function resolveEmbedWithBrowser(embedUrl, timeout = 15e3) {
      return __async(this, null, function* () {
        const ck = embedUrl;
        const cached = cache.get(ck);
        if (cached && Date.now() - cached.time < CACHE_TTL) return cached.url;
        let browserInstance = null;
        let page = null;
        try {
          const pptr = yield getPuppeteer();
          if (!pptr) return null;
          const chromium = yield getChromium();
          if (!chromium) return null;
          browserInstance = yield pptr.launch({
            args: chromium.args,
            executablePath: chromium.executablePath,
            headless: true,
            defaultViewport: { width: 1280, height: 720 }
          });
          console.log("[pptr] browser launched for", embedUrl.substring(0, 40));
          page = yield browserInstance.newPage();
          yield page.setUserAgent(UA);
          let videoUrl = null;
          const blockedPatterns = ["test-videos.co.uk", "bigbuckbunny", "google.com", "analytics", "cdn.jkdesa", ".css", ".js", "videojs"];
          yield page.setRequestInterception(true);
          page.on("request", (req) => {
            const u = req.url();
            if (videoUrl) {
              req.abort();
              return;
            }
            const isVideo = /\.(m3u8|mp4|mkv|ts|webm)(\?|$)/i.test(u) || u.includes("/hls/");
            const isBlocked = blockedPatterns.some((p) => u.includes(p));
            if (isVideo && !isBlocked) {
              videoUrl = u;
              req.abort();
            } else {
              req.continue();
            }
          });
          page.on("response", (resp) => __async(null, null, function* () {
            if (videoUrl) return;
            const ct = resp.headers()["content-type"] || "";
            if ((ct.includes("mpegurl") || ct.includes("video/mp4")) && !blockedPatterns.some((p) => resp.url().includes(p))) {
              videoUrl = resp.url();
            }
          }));
          try {
            yield page.goto(embedUrl, { waitUntil: "networkidle2", timeout });
          } catch (e) {
          }
          yield new Promise((r) => setTimeout(r, 8e3));
          if (!videoUrl) {
            try {
              videoUrl = yield page.evaluate(() => {
                const v = document.querySelector("video");
                if (v && v.src && !v.src.startsWith("blob:")) return v.src;
                const sources = document.querySelectorAll("source[src]");
                for (const s of sources) {
                  const src = s.getAttribute("src");
                  if (src && !src.startsWith("blob:") && (src.includes(".m3u8") || src.includes(".mp4"))) return src;
                }
                const scripts = document.querySelectorAll("script");
                for (const s of scripts) {
                  const c = s.textContent || "";
                  const m = c.match(/file\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/);
                  if (m) return m[1];
                }
                for (const s of scripts) {
                  const c = s.textContent || "";
                  const m = c.match(/["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)["']/);
                  if (m && !m[1].includes("test-videos") && !m[1].includes("bigbuckbunny")) return m[1];
                }
                return null;
              });
            } catch (e) {
            }
          }
          if (videoUrl && !blockedPatterns.some((p) => videoUrl.includes(p))) {
            cache.set(ck, { url: videoUrl, time: Date.now() });
            if (cache.size > 50) {
              const first = cache.keys().next().value;
              cache.delete(first);
            }
          }
          return videoUrl;
        } catch (e) {
          console.error("[pptr] resolve error:", e.message);
          return null;
        } finally {
          if (page) try {
            yield page.close();
          } catch (e) {
          }
          if (browserInstance) try {
            yield browserInstance.close();
          } catch (e) {
          }
        }
      });
    }
    module2.exports = { resolveEmbedWithBrowser, closeBrowser };
  }
});

// src/anime/scrapers/jkanime.js
var require_jkanime = __commonJS({
  "src/anime/scrapers/jkanime.js"(exports2, module2) {
    var cheerio = require("cheerio-without-node-native") || require("cheerio");
    var puppeteerResolver = require_puppeteer_resolver();
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
          const servers = JSON.parse(serverMatch[1]);
          const results2 = [];
          for (const s of servers) {
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
        const servers = extractServers(page);
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
        for (const s of servers) {
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
              const direct = yield puppeteerResolver.resolveEmbedWithBrowser(finalUrl, 12e3);
              if (direct && direct.startsWith("http")) {
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
      const servers = { embeds: {}, downloads: {} };
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
                      servers.embeds[lang] = servers.embeds[lang] || [];
                      servers.embeds[lang].push({ server: srv, url: u });
                    }
                  }
                }
              }
            }
          }
        }
      }
      return servers;
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
            const servers = resolveDevalue(node.data);
            const results = [];
            for (const [lang, serverList] of Object.entries(servers.embeds)) {
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

// src/anime/scrapers/index.js
var require_scrapers = __commonJS({
  "src/anime/scrapers/index.js"(exports2, module2) {
    var animeflv = require_animeflv();
    var jkanime = require_jkanime();
    var tioanime = require_tioanime();
    var animeav1 = require_animeav1();
    var animePrefixes = ["animeflv:", "animeav1:", "henaojara:", "tioanime:", "jkanime:"];
    function getStreams(id, season, episode, pigamerGetStreams) {
      return __async(this, null, function* () {
        var _a, _b;
        const hasAnimePrefix = animePrefixes.some((p) => id.startsWith(p));
        if (!hasAnimePrefix) {
          try {
            const streams = yield pigamerGetStreams(id, season, episode);
            return { source: "pigamer", streams: streams || [] };
          } catch (e) {
            return { source: "error", streams: [] };
          }
        }
        const slug = extractSlug(id);
        if (!slug || slug.match(/^\d+$/)) {
          try {
            const streams = yield pigamerGetStreams(id, season, episode);
            return { source: "pigamer", streams: streams || [] };
          } catch (e) {
            return { source: "error", streams: [] };
          }
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
        if (!id.startsWith("jkanime:")) {
          const pigamerProviders = [
            { prefix: "animeflv:", label: "AnimeFLV" },
            { prefix: "animeav1:", label: "AnimeAV1" },
            { prefix: "henaojara:", label: "Henaojara" },
            { prefix: "tioanime:", label: "TioAnime" }
          ];
          for (const { prefix, label } of pigamerProviders) {
            if (id.startsWith(prefix)) continue;
            promises.push(
              (() => __async(null, null, function* () {
                try {
                  const streams = yield pigamerGetStreams(`${prefix}${slug}`, season, episode);
                  return { provider: label, streams };
                } catch (e) {
                  return { provider: label, streams: [] };
                }
              }))()
            );
          }
        }
        const results = yield Promise.allSettled(promises);
        const allStreams = [];
        for (const r of results) {
          if (r.status === "fulfilled" && ((_b = (_a = r.value) == null ? void 0 : _a.streams) == null ? void 0 : _b.length)) {
            allStreams.push(...r.value.streams);
          }
        }
        return { source: "parallel", streams: allStreams };
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
    function searchCatalog(providerId, query) {
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
    module2.exports = { getStreams, getOnAirCatalog, searchCatalog, animeflv, jkanime, tioanime, animeav1 };
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
