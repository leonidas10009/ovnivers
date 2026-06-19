/**
 * media - Built from src/media/
 * Generated: 2026-06-19T18:15:51.559Z
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
    function getMeta(tmdbId, mediaType, language2 = "en") {
      return __async(this, null, function* () {
        const ck = `meta:${mediaType}:${tmdbId}:${language2}`;
        const cached = cacheGet(metaCache, ck, META_TTL);
        if (cached) return cached;
        const path = `/${mediaType === "tv" ? "tv" : "movie"}/${tmdbId}?language=${language2}`;
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
    function searchTMDB(query, mediaType, language2 = "en") {
      return __async(this, null, function* () {
        const path = `/search/${mediaType === "tv" ? "tv" : "movie"}?query=${encodeURIComponent(query)}&language=${language2}`;
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

// src/media/language.js
var require_language = __commonJS({
  "src/media/language.js"(exports2, module2) {
    var { LANG_CODES, LANG_FLAGS, DEFAULT_LANG_SCORES } = require_types();
    var LANG_ALIASES = {
      cast: "es",
      castellano: "es",
      espanol: "es"
    };
    function detectLanguages(text) {
      if (!text) return [];
      const t = text.toLowerCase();
      const found = /* @__PURE__ */ new Set();
      if (/\b(castellano|español|espanol|castellano latino|audio castellano)\b/i.test(t)) found.add("cast");
      if (/\b(latino|audio latino|lat)\b/i.test(t) && !found.has("cast")) found.add("lat");
      if (/\b(vose|subtitulado|sub\b)\b/i.test(t)) found.add("vose");
      if (/\b(dual|multi).*?(audio|idioma|lang)/i.test(t)) {
        found.add("cast");
        found.add("lat");
      }
      if (/\b(english|eng|inglés|ingles)\b/i.test(t)) found.add("en");
      if (/\b(japanese|japonés|japones|jap|jp)\b/i.test(t)) found.add("ja");
      if (/\b(korean|coreano|ko)\b/i.test(t)) found.add("ko");
      if (/\b(hindi|hind|hindi audio)\b/i.test(t)) found.add("hi");
      if (/\b(french|francés|frances|français|vf|vostfr)\b/i.test(t)) found.add("fr");
      if (/\b(portuguese|portugués|portugues|dublado)\b/i.test(t)) found.add("pt");
      if (/\b(italian|italiano|ita)\b/i.test(t)) found.add("it");
      if (/\b(arabic|árabe|arabe)\b/i.test(t)) found.add("ar");
      if (/\b(chinese|chino|mandarín|mandarin|cantonese|cantonés)\b/i.test(t)) found.add("zh");
      if (/\b(german|alemán|aleman|deutsch)\b/i.test(t)) found.add("de");
      if (/\b(thai|tailandés|tailandes)\b/i.test(t)) found.add("th");
      if (/\b(tamil)\b/i.test(t)) found.add("ta");
      if (/\b(telugu)\b/i.test(t)) found.add("te");
      if (found.size === 0) {
        if (/🇪🇸/u.test(text)) found.add("cast");
        if (/🇲🇽/u.test(text)) found.add("lat");
        if (/🇯🇵/u.test(text)) found.add("ja");
        if (/🇬🇧/u.test(text)) found.add("en");
        if (/🇰🇷/u.test(text)) found.add("ko");
        if (/🇮🇳/u.test(text)) found.add("hi");
        if (/🇫🇷/u.test(text)) found.add("fr");
        if (/🇧🇷/u.test(text)) found.add("pt");
        if (/🇮🇹/u.test(text)) found.add("it");
        if (/🇸🇦/u.test(text)) found.add("ar");
        if (/🇨🇳/u.test(text)) found.add("zh");
        if (/🇩🇪/u.test(text)) found.add("de");
      }
      return [...found];
    }
    function detectFromStream(stream) {
      const text = [stream.name, stream.title, stream.description, stream.audioLang].filter(Boolean).join("\n");
      return detectLanguages(text);
    }
    function normalizeCodes(codes) {
      return codes.map((c) => LANG_ALIASES[c] || c);
    }
    function computeScore(languages, userLangs) {
      if (!languages.length) return 0;
      const normalized = normalizeCodes(languages);
      if (!userLangs || !userLangs.length) {
        return normalized.reduce((sum, lang) => sum + (DEFAULT_LANG_SCORES[lang] || 0), 0);
      }
      let score = 0;
      for (const lang of normalized) {
        const idx = userLangs.indexOf(lang);
        if (idx >= 0) {
          score += Math.max(0, userLangs.length - idx);
        } else {
          score += DEFAULT_LANG_SCORES[lang] || 0;
        }
      }
      return score;
    }
    function matchesFilter(languages, userLangs) {
      if (!userLangs || !userLangs.length) return true;
      if (!languages.length) return true;
      const normalized = normalizeCodes(languages);
      return normalized.some((l) => userLangs.includes(l));
    }
    function formatFlags(languages) {
      if (!languages.length) return "";
      return languages.map((l) => LANG_FLAGS[l] || "").filter(Boolean).join("");
    }
    function formatNames(languages) {
      if (!languages.length) return "";
      return languages.map((l) => LANG_CODES[l] || l).join(", ");
    }
    module2.exports = {
      detectLanguages,
      detectFromStream,
      computeScore,
      matchesFilter,
      formatFlags,
      formatNames
    };
  }
});

// src/media/quality.js
var require_quality = __commonJS({
  "src/media/quality.js"(exports2, module2) {
    var { QUALITY_TIERS, QUALITY_ORDER } = require_types();
    function extractQuality(text) {
      if (!text) return null;
      const t = text.toUpperCase();
      if (/\b(4K|2160P|UHD)\b/.test(t)) return "4K";
      if (/\b1080P\b/.test(t)) return "1080p";
      if (/\b720P\b/.test(t)) return "720p";
      if (/\b480P\b/.test(t)) return "480p";
      if (/\b360P\b/.test(t)) return "360p";
      if (/\b(CAM|TS|TC|SCR)\b/.test(t)) return "CAM";
      if (/\b(HD|FHD)\b/.test(t)) return "HD";
      return null;
    }
    function getTier(quality2) {
      if (!quality2) return 0;
      const q = quality2.toUpperCase();
      for (const [key, tier] of Object.entries(QUALITY_TIERS)) {
        if (q === key.toUpperCase()) return tier;
      }
      return 0;
    }
    function compareQuality(a, b) {
      return getTier(b) - getTier(a);
    }
    function matchesFilter(quality2, userQuality) {
      if (!userQuality || userQuality === "all") return true;
      if (!quality2) return true;
      const q = quality2.toUpperCase();
      const uq = userQuality.toUpperCase();
      if (uq === "4K" || uq === "2160P" || uq === "UHD") return q === "4K" || q === "2160P" || q === "UHD";
      if (uq === "1080P") return q === "1080P" || q === "FHD";
      if (uq === "720P") return q === "720P" || q === "HD";
      return true;
    }
    function normalizeQuality(quality2) {
      if (!quality2) return "HD";
      const q = quality2.toUpperCase();
      if (q === "2160P" || q === "UHD") return "4K";
      if (q === "FHD" || q === "FULL HD") return "1080p";
      if (q === "SD") return "480p";
      return quality2;
    }
    function sortByQuality(streams) {
      return [...streams].sort((a, b) => {
        const qa = getTier(a.quality || extractQuality(a.name || ""));
        const qb = getTier(b.quality || extractQuality(b.name || ""));
        return qb - qa;
      });
    }
    module2.exports = {
      extractQuality,
      getTier,
      compareQuality,
      matchesFilter,
      normalizeQuality,
      sortByQuality
    };
  }
});

// src/media/dedup.js
var require_dedup = __commonJS({
  "src/media/dedup.js"(exports2, module2) {
    function buildKey(stream) {
      const parts = [
        stream.infoHash || "",
        stream.url || stream.externalUrl || ""
      ];
      const name = (stream.name || "").toLowerCase();
      const quality2 = stream.quality || "";
      const langs = Array.isArray(stream.languages) ? stream.languages.sort().join(",") : "";
      if (quality2) parts.push(quality2);
      if (langs) parts.push(langs);
      const namePrefix = name.substring(0, 50);
      parts.push(namePrefix);
      return parts.join("|");
    }
    function dedupeStreams(streams) {
      const seen = /* @__PURE__ */ new Set();
      const out = [];
      for (const s of streams) {
        const key = buildKey(s);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(s);
      }
      return out;
    }
    function dedupeWithPriority(streams, preferHigherQuality = true) {
      const map = /* @__PURE__ */ new Map();
      for (const s of streams) {
        const baseKey = [
          s.infoHash || "",
          s.url || s.externalUrl || "",
          (s.name || "").toLowerCase().substring(0, 50)
        ].join("|");
        const existing = map.get(baseKey);
        if (!existing) {
          map.set(baseKey, s);
          continue;
        }
        if (preferHigherQuality) {
          const qTiers = { "4K": 5, "1080p": 4, "720p": 3, "480p": 2, "HD": 3, "CAM": 0 };
          const qNew = qTiers[s.quality] || 0;
          const qOld = qTiers[existing.quality] || 0;
          if (qNew > qOld) map.set(baseKey, s);
        }
      }
      return [...map.values()];
    }
    module2.exports = { buildKey, dedupeStreams, dedupeWithPriority };
  }
});

// src/media/health.js
var require_health = __commonJS({
  "src/media/health.js"(exports2, module2) {
    var CONSECUTIVE_FAIL_LIMIT = 5;
    var COOLDOWN_MS = 5 * 60 * 1e3;
    var stats = /* @__PURE__ */ new Map();
    function init(id) {
      if (!stats.has(id)) {
        stats.set(id, {
          total: 0,
          ok: 0,
          fail: 0,
          failStreak: 0,
          totalMs: 0,
          lastOk: null,
          lastFail: null,
          disabledAt: null
        });
      }
    }
    function track(id, success, timeMs = 0) {
      init(id);
      const s = stats.get(id);
      s.total++;
      s.totalMs += timeMs;
      if (success) {
        s.ok++;
        s.failStreak = 0;
        s.lastOk = Date.now();
        s.disabledAt = null;
      } else {
        s.fail++;
        s.failStreak++;
        s.lastFail = Date.now();
        if (s.failStreak >= CONSECUTIVE_FAIL_LIMIT) {
          s.disabledAt = Date.now();
        }
      }
    }
    function isHealthy(id) {
      const s = stats.get(id);
      if (!s) return true;
      if (s.failStreak >= CONSECUTIVE_FAIL_LIMIT) {
        if (s.disabledAt && Date.now() - s.disabledAt > COOLDOWN_MS) {
          s.failStreak = 0;
          s.disabledAt = null;
          return true;
        }
        return false;
      }
      return true;
    }
    function getReport() {
      const report = [];
      for (const [id, s] of stats) {
        const total = s.total || 1;
        report.push({
          id,
          total: s.total,
          ok: s.ok,
          fail: s.fail,
          failStreak: s.failStreak,
          successRate: (s.ok / total * 100).toFixed(1) + "%",
          avgMs: Math.round(s.totalMs / total),
          healthy: isHealthy(id),
          lastOk: s.lastOk ? new Date(s.lastOk).toISOString() : null,
          lastFail: s.lastFail ? new Date(s.lastFail).toISOString() : null
        });
      }
      report.sort((a, b) => b.total - a.total);
      return report;
    }
    function getHealthyIds() {
      const ids = [];
      for (const [id] of stats) {
        if (isHealthy(id)) ids.push(id);
      }
      return ids;
    }
    module2.exports = { init, track, isHealthy, getReport, getHealthyIds, CONSECUTIVE_FAIL_LIMIT, COOLDOWN_MS };
  }
});

// src/media/index.js
var types = require_types();
var tmdb = require_tmdb();
var language = require_language();
var quality = require_quality();
var dedup = require_dedup();
var health = require_health();
module.exports = {
  types,
  tmdb,
  language,
  quality,
  dedup,
  health
};
