/**
 * torrent-providers - Built from src/torrent-providers/
 * Generated: 2026-06-28T16:38:52.000Z
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

// src/torrent-providers/cardigann-engine.js
var require_cardigann_engine = __commonJS({
  "src/torrent-providers/cardigann-engine.js"(exports2, module2) {
    var cheerio2 = require("cheerio");
    var fs = require("fs");
    var path = require("path");
    var UA2 = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0 Safari/537.36";
    function parseDefinition(ymlContent) {
      const def = _parseSimpleYaml(ymlContent);
      if (!def.id || !def.search) return null;
      const config = {
        id: def.id,
        name: def.name || def.id,
        description: def.description || "",
        type: def.type || "public",
        language: def.language || "en-US",
        mirrors: def.links || [],
        categories: _parseCategories(def.caps),
        search: _parseSearch(def.search),
        download: _parseDownload(def.download),
        settings: def.settings || []
      };
      return config;
    }
    function searchCardigann(config, query, mediaType) {
      return __async(this, null, function* () {
        const results = [];
        const mirrors = config.mirrors.slice(0, 3);
        for (const mirror of mirrors) {
          if (results.length > 0) break;
          const searchCfg = config.search;
          if (!searchCfg || !searchCfg.rows) continue;
          const searchUrl = _buildSearchUrl(mirror, searchCfg, query, mediaType);
          if (!searchUrl) continue;
          try {
            const res = yield fetch(searchUrl, {
              headers: { "User-Agent": UA2, "Accept": "text/html,application/xhtml+xml" },
              signal: AbortSignal.timeout(12e3)
            });
            if (!res.ok) continue;
            const html = yield res.text();
            const $ = cheerio2.load(html);
            const rows = $(searchCfg.rows);
            if (!rows.length) continue;
            rows.each((i, row) => {
              if (i > 50) return false;
              const item = _extractFields($, row, searchCfg.fields, config.download);
              if (item && item.title && (item.magnet || item.infoHash || item.downloadUrl)) {
                item.indexer = config.name;
                item.mirror = mirror;
                results.push(item);
              }
            });
          } catch (e) {
            continue;
          }
        }
        return results;
      });
    }
    function _parseSimpleYaml(content) {
      const lines = content.split("\n");
      const root = {};
      const stack = [{ obj: root, indent: -1 }];
      for (const line of lines) {
        if (!line.trim() || line.trim().startsWith("#")) continue;
        const indent = line.search(/\S/);
        const trimmed = line.trim();
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
          stack.pop();
        }
        const current = stack[stack.length - 1].obj;
        const isArray = Array.isArray(current);
        const kvMatch = trimmed.match(/^([\w_-]+)\s*:\s*(.*)/);
        if (kvMatch) {
          const key = kvMatch[1];
          let val = kvMatch[2].trim();
          if (val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'")) {
            val = val.slice(1, -1);
          }
          if (val === "") {
            current[key] = {};
          } else if (val === "[]") {
            current[key] = [];
          } else if (!isNaN(Number(val)) && val !== "") {
            current[key] = Number(val);
          } else if (val === "true") current[key] = true;
          else if (val === "false") current[key] = false;
          else current[key] = val;
          continue;
        }
        const listMatch = trimmed.match(/^-\s*(.*)/);
        if (listMatch) {
          if (!isArray) {
            const parentKey = Object.keys(current).pop();
            if (parentKey && typeof current[parentKey] === "object" && !Array.isArray(current[parentKey])) {
            }
          }
          const itemVal = listMatch[1].trim();
          const itemKv = itemVal.match(/^([\w_-]+)\s*:\s*(.*)/);
          if (itemKv) {
            const itemObj = {};
            let v = itemKv[2].trim();
            if (v.startsWith('"') && v.endsWith('"') || v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
            itemObj[itemKv[1]] = v || "";
            if (isArray) current.push(itemObj);
            else {
              current[lastKey] = current[lastKey] || [];
              current[lastKey].push(itemObj);
            }
          } else if (itemVal) {
            if (isArray) current.push(itemVal);
            else current[lastKey] = (current[lastKey] || []).concat([itemVal]);
          }
        }
      }
      return root;
    }
    function _parseCategories(caps) {
      if (!caps || !caps.categorymappings) return ["movie", "tv"];
      const cats = /* @__PURE__ */ new Set();
      for (const m of caps.categorymappings) {
        const cat = m.cat || "";
        if (cat.includes("Movies")) cats.add("movie");
        if (cat.includes("TV")) cats.add("tv");
        if (cat.includes("Anime")) cats.add("anime");
      }
      return cats.size > 0 ? [...cats] : ["movie", "tv"];
    }
    function _parseSearch(search2) {
      var _a;
      if (!search2) return null;
      const paths = search2.paths || [];
      const searchPath = paths.find((p) => p.path && p.path.includes(".Keywords")) || paths[0];
      const keywordPath = searchPath ? searchPath.path : "/search/{query}/1/";
      return {
        pathTemplate: keywordPath,
        rows: ((_a = search2.rows) == null ? void 0 : _a.selector) || "tr",
        fields: search2.fields || {},
        keywordsfilters: search2.keywordsfilters || []
      };
    }
    function _parseDownload(download) {
      if (!download) return { selectors: [] };
      return {
        selectors: download.selectors || [],
        before: download.before || null
      };
    }
    function _buildSearchUrl(mirror, searchCfg, query, mediaType) {
      let path2 = searchCfg.pathTemplate;
      path2 = path2.replace(/\{\{\s*\.Keywords\s*\}\}/g, encodeURIComponent(query));
      path2 = path2.replace(/\{\{.*?\.Config\.\w+\s*\}\}/g, "");
      path2 = path2.replace(/\{\{.*?\.False\s*\}\}/g, "");
      path2 = path2.replace(/\{\{.*?\.True\s*\}\}/g, "");
      path2 = path2.replace(/\{\{.*?\}\}/g, "");
      path2 = path2.replace(/\/+/g, "/");
      path2 = path2.replace(/^\//, "");
      return `${mirror.replace(/\/+$/, "")}/${path2}`;
    }
    function _extractFields($, row, fields, downloadCfg) {
      var _a, _b, _c, _d;
      const item = {};
      item.title = _getField($, row, fields.title, "text") || _getField($, row, fields.title_default, "text") || "";
      item.detailsUrl = _getField($, row, fields.details, "href") || _getField($, row, fields.download, "href") || "";
      const magnet = _getField($, row, fields.download, "href") || "";
      if (magnet) {
        if (magnet.startsWith("magnet:")) {
          item.magnet = magnet;
          const infoHash = (_b = (_a = magnet.match(/btih:([a-fA-F0-9]{40})/i)) == null ? void 0 : _a[1]) == null ? void 0 : _b.toLowerCase();
          if (infoHash) item.infoHash = infoHash;
        } else if (magnet.startsWith("http")) {
          item.downloadUrl = magnet;
        }
      }
      if (!item.magnet && downloadCfg && downloadCfg.selectors) {
        for (const ds of downloadCfg.selectors) {
          const sel = ds.selector || "";
          const el = sel ? $(row).find(sel).first() : $();
          if (el.length && el.attr("href")) {
            const href = el.attr("href");
            if (href.startsWith("magnet:")) {
              item.magnet = href;
              const ih = (_d = (_c = href.match(/btih:([a-fA-F0-9]{40})/i)) == null ? void 0 : _c[1]) == null ? void 0 : _d.toLowerCase();
              if (ih) item.infoHash = ih;
              break;
            }
          }
        }
      }
      const seedStr = _getField($, row, fields.seeders, "text") || _getField($, row, fields.seeds, "text") || "0";
      item.seeds = parseInt(seedStr.replace(/,/g, "")) || 0;
      const leechStr = _getField($, row, fields.leechers, "text") || _getField($, row, fields.leeches, "text") || "0";
      item.leechers = parseInt(leechStr.replace(/,/g, "")) || 0;
      item.sizeFormatted = _getField($, row, fields.size, "text") || "";
      item.size = _parseSize(item.sizeFormatted);
      item.date = _getField($, row, fields.date, "text") || "";
      item.category = _getField($, row, fields.category, "text") || "";
      return item;
    }
    function _getField($, row, fieldDef, attr) {
      if (!fieldDef) return "";
      const selector = fieldDef.selector;
      if (!selector) {
        const text = fieldDef.text || "";
        if (text && !text.includes("{{")) return text;
        return "";
      }
      const el = $(row).find(selector).first();
      if (!el.length) return "";
      if (attr === "href") return (el.attr("href") || "").trim();
      if (attr === "text") return el.text().trim();
      return el.text().trim() || (el.attr("href") || "").trim();
    }
    function _parseSize(text) {
      if (!text) return 0;
      const t = text.toUpperCase().trim();
      const match = t.match(/([\d.,]+)\s*(GB|MB|TB|KB|B)/);
      if (!match) return 0;
      const num = parseFloat(match[1].replace(/,/g, ""));
      const unit = match[2];
      if (unit === "TB") return num * 1099511627776;
      if (unit === "GB") return num * 1073741824;
      if (unit === "MB") return num * 1048576;
      if (unit === "KB") return num * 1024;
      return num;
    }
    function loadDefinitions(dirPath) {
      const definitions = [];
      if (!fs.existsSync(dirPath)) return definitions;
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".yml"));
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(dirPath, file), "utf-8");
          const config = parseDefinition(content);
          if (config && config.type === "public") {
            definitions.push(config);
          }
        } catch (e) {
        }
      }
      return definitions;
    }
    module2.exports = {
      parseDefinition,
      searchCardigann,
      loadDefinitions
    };
  }
});

// src/torrent-providers/index.js
var cheerio = require("cheerio-without-node-native") || require("cheerio");
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var FETCH_TIMEOUT = 12e3;
var TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.tracker.club:1337/announce",
  "udp://open.demonii.com:1337/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.moeking.me:6969/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.bitsearch.to:1337/announce",
  "udp://explodie.org:6969/announce",
  "udp://tracker1.bt.moack.co.kr:80/announce",
  "udp://tracker.ololosh.space:6969/announce",
  "http://tracker.openbittorrent.com:80/announce",
  "http://tracker.files.fm:6969/announce",
  "https://tracker.gbitt.info:443/announce"
];
function fetchHTML(url) {
  return __async(this, null, function* () {
    try {
      const res = yield fetch(url, {
        headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml,*/*" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT)
      });
      if (!res.ok) return null;
      return yield res.text();
    } catch (e) {
      return null;
    }
  });
}
function fetchJSON(url) {
  return __async(this, null, function* () {
    try {
      const res = yield fetch(url, {
        headers: { "User-Agent": UA, "Accept": "application/json" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT)
      });
      if (!res.ok) return null;
      return yield res.json();
    } catch (e) {
      return null;
    }
  });
}
function parseSizeToBytes(text) {
  if (!text) return 0;
  const t = text.trim().toUpperCase();
  const match = t.match(/([\d.,]+)\s*(GB|MB|TB|KB|B)/);
  if (!match) return 0;
  const num = parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2];
  if (unit === "TB") return num * 1099511627776;
  if (unit === "GB") return num * 1073741824;
  if (unit === "MB") return num * 1048576;
  if (unit === "KB") return num * 1024;
  return num;
}
function formatSize(bytes) {
  if (!bytes || bytes < 1) return "";
  const gb = bytes / 1073741824;
  if (gb >= 1) return gb >= 100 ? Math.round(gb) + " GB" : gb.toFixed(2) + " GB";
  const mb = bytes / 1048576;
  if (mb >= 1) return mb >= 100 ? Math.round(mb) + " MB" : mb.toFixed(1) + " MB";
  return Math.round(bytes / 1024) + " KB";
}
var STOP_WORDS = /* @__PURE__ */ new Set(["the", "a", "an", "de", "el", "la", "los", "las", "del", "en", "un", "una", "y", "e", "o", "of", "in", "on", "at", "to", "for", "is", "and", "or", "le", "des", "et", "und", "der", "die", "das"]);
function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, " ");
}
function wordMatch(query, title) {
  if (!query || !title) return 0;
  const rawQw = normalizeText(query).split(" ").filter((w) => w.length >= 2);
  const tw = normalizeText(title).split(" ").filter((w) => w.length >= 2);
  if (!rawQw.length) return 0;
  const qw = rawQw.filter((w) => !STOP_WORDS.has(w));
  if (!qw.length) {
    const short = rawQw.filter((w) => w.length <= 3);
    if (short.length) {
      const exact = short.filter((q) => tw.some((t) => t === q)).length;
      return exact / short.length;
    }
    return 0;
  }
  let score = 0;
  for (const q of qw) {
    if (tw.some((t) => t === q)) score += 1;
    else if (q.length >= 4 && tw.some((t) => t.startsWith(q) || t.endsWith(q))) score += 0.5;
    else if (q.length >= 4 && tw.some((t) => t.includes(q))) score += 0.25;
    else score -= 0.5;
  }
  return Math.max(0, score / qw.length);
}
function extractSE(title) {
  const m = (title || "").match(/[Ss](\d{1,2})\s*[Ee](\d{1,2})/);
  if (!m) return null;
  return { season: parseInt(m[1]), episode: parseInt(m[2]) };
}
function parseYear(title) {
  const m = title.match(/\b(19[5-9]\d|20[0-3]\d)\b/);
  return m ? parseInt(m[1]) : null;
}
function parseQuality(title) {
  const t = title.toUpperCase();
  if (/\b(4K|2160P|UHD)\b/.test(t)) return "4K";
  if (/\b1080P\b/.test(t)) return "1080p";
  if (/\b720P\b/.test(t)) return "720p";
  if (/\b480P\b/.test(t)) return "480p";
  return null;
}
function parseCodec(title) {
  const t = title.toUpperCase();
  if (/\b(HEVC|X265|H\.?265)\b/.test(t)) return "HEVC";
  if (/\b(X264|H\.?264|AVC)\b/.test(t)) return "x264";
  if (/\bAV1\b/.test(t)) return "AV1";
  if (/\bXVID\b/.test(t)) return "XviD";
  return null;
}
function parseSource(title) {
  const t = title.toUpperCase();
  if (/\bBLU\-?RAY\b/.test(t)) return "BluRay";
  if (/\bWEB\-?DL\b/.test(t)) return "WEB-DL";
  if (/\bWEBRIP\b/.test(t)) return "WEBRip";
  if (/\bHDTV\b/.test(t)) return "HDTV";
  if (/\bDVD[R59]?\b/.test(t)) return "DVD";
  if (/\b(CAM|TS|TC|SCR)\b/.test(t)) return "CAM";
  if (/\bREMUX\b/.test(t)) return "Remux";
  if (/\bBRRIP\b/.test(t)) return "BRRip";
  return null;
}
function parseAudio(title) {
  const t = title.toUpperCase();
  const audio = [];
  if (/\b(DTS|DD5|DD\.?5|AC3|EAC3|E\-?AC\-?3|DDP|TRUEHD|ATMOS|FLAC)\b/.test(t)) {
    const m = t.match(/\b(DTS[\s\-]?(?:HD|X)?|DD\d?(?:\.\d)?|E?AC3|E\-?AC\-?3|ATMOS|TRUEHD|FLAC|DDP5?\.?\d?)['"]?\b/);
    if (m) audio.push(m[1]);
  }
  if (/\b(5\.1|7\.1|2\.0|ATMOS)\b/.test(t)) {
    const m = t.match(/\b(5\.1|7\.1|2\.0|ATMOS)\b/);
    if (m) audio.push(m[1]);
  }
  return audio.length ? [...new Set(audio)].join(" ") : null;
}
function parseLanguage(title) {
  const t = title.toUpperCase();
  const langs = [];
  if (/\b(SPANISH|ESPANOL|CASTELLANO|LATINO|ESPAÑOL|DUAL|MULTI)\b/i.test(t)) langs.push("es");
  if (/\b(ENGLISH|ENG)\b/i.test(t)) langs.push("en");
  if (/\b(JAPANESE|JAPONES|JAP|JP)\b/i.test(t)) langs.push("ja");
  if (/\b(HINDI|HIN)\b/i.test(t)) langs.push("hi");
  if (/\b(DUAL AUDIO)\b/i.test(t)) langs.push("es", "en");
  if (/\b(VOSE|SUBTITULADO)\b/i.test(t)) langs.push("vose");
  return langs.length ? [...new Set(langs)] : [];
}
function enrichMagnet(magnet) {
  if (!magnet || magnet.includes("&tr=")) return magnet;
  const tr = TRACKERS.slice(0, 6).map((t) => "&tr=" + encodeURIComponent(t)).join("");
  return magnet + tr;
}
function titleStartBonus(query, title) {
  const qNorm = normalizeText(query).replace(/\s+/g, " ").trim();
  const tNorm = normalizeText(title).replace(/\s+/g, " ").trim();
  if (tNorm.startsWith(qNorm)) return 0.18;
  const qWords = qNorm.split(" ");
  const tWords = tNorm.split(" ");
  if (qWords.length >= 2 && qWords.every((w, i) => tWords[i] === w)) return 0.14;
  if (qWords.length === 1 && tWords[0] === qWords[0]) return 0.18;
  return 0;
}
function scoreTorrent(torrent, query, year, season, episode) {
  let score = 0;
  const title = (torrent.title || torrent.name || "").toLowerCase();
  const rel = wordMatch(query, title);
  score += rel * 0.45;
  score += titleStartBonus(query, torrent.title || torrent.name || "");
  if (torrent.seeds !== void 0) {
    score += Math.min((torrent.seeds || 0) / 500, 1) * 0.12;
  }
  const ratio = (torrent.seeds || 0) / Math.max(torrent.leechers || 1, 1);
  score += Math.min(ratio, 3) / 3 * 0.02;
  const q = torrent.quality || parseQuality(torrent.title || torrent.name);
  if (q === "4K") score += 0.05;
  else if (q === "1080p") score += 0.03;
  else if (q === "720p") score += 0.01;
  const ty = torrent.year || parseYear(torrent.title || torrent.name);
  if (ty && year) {
    if (ty === year) score += 0.1;
    else if (Math.abs(ty - year) <= 1) score += 0.02;
    else score -= 0.4;
  }
  if (season !== void 0 && episode !== void 0) {
    const se = extractSE(title);
    if (se) {
      if (se.season === season && se.episode === episode) score += 0.12;
      else if (se.season === season) score += 0.03;
      else score -= 0.3;
    }
  }
  if (torrent.verified) score += 0.03;
  if (torrent.source === "BluRay" || torrent.source === "Remux") score += 0.02;
  if (torrent.codec === "HEVC" || torrent.codec === "AV1") score += 0.01;
  return score;
}
function normalizeTorrent(raw, indexer) {
  const title = raw.title || raw.name || "";
  const infoHash = raw.infoHash || raw.infohash || "";
  const magnet = enrichMagnet(raw.magnet || "");
  return {
    title,
    infoHash: infoHash.toLowerCase(),
    magnet,
    seeds: raw.seeds || raw.seeders || 0,
    leechers: raw.leechers || 0,
    size: raw.size || 0,
    sizeFormatted: formatSize(raw.size || raw.sizeBytes || 0),
    quality: raw.quality || parseQuality(title),
    codec: raw.codec || parseCodec(title),
    audio: raw.audio || parseAudio(title),
    source: raw.source || parseSource(title),
    resolution: raw.resolution || raw.quality || parseQuality(title),
    year: raw.year || parseYear(title),
    language: raw.language || raw.languages || parseLanguage(title),
    isHDR: raw.isHDR || /\b(HDR|HDR10|HDR10\+|DV)\b/i.test(title),
    isDV: raw.isDV || /\bDV\b/i.test(title),
    isRemux: raw.isRemux || /\bREMUX\b/i.test(title),
    isDualAudio: raw.isDualAudio || /\b(DUAL|MULTI)\b/i.test(title),
    indexer,
    verified: raw.verified || false,
    trackerCount: (magnet.match(/&tr=/g) || []).length
  };
}
function scrapeGloDLS(query) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchHTML(`https://glodls.to/search_results.php?search=${encodeURIComponent(query)}`);
      if (!html) return [];
      const $ = cheerio.load(html);
      const results = [];
      $("table.ttable_headinner tr.t-row").each((i, row) => {
        var _a, _b;
        const cols = $(row).find("td");
        if (cols.length < 6) return;
        const nameEl = $(cols[1]).find("a[title]").first();
        const name = nameEl.attr("title") || nameEl.text().trim();
        const magnet = $(row).find('a[href^="magnet:"]').attr("href");
        if (!name || !magnet) return;
        const infoHash = (_b = (_a = magnet.match(/btih:([a-fA-F0-9]{40})/i)) == null ? void 0 : _a[1]) == null ? void 0 : _b.toLowerCase();
        if (!infoHash) return;
        const sizeText = $(cols[4]).text().trim();
        const seedStr = $(cols[5]).text().trim();
        const sizeMatch = sizeText.match(/([\d.,]+\s*(?:GB|MB|TB|KB))/i);
        results.push({
          name,
          infoHash,
          magnet,
          seeds: parseInt(seedStr) || 0,
          size: parseSizeToBytes(sizeText),
          sizeFormatted: sizeMatch ? sizeMatch[1] : sizeText,
          isHDR: name.includes("HDR") || name.includes("HDR10"),
          isDualAudio: /Dual|AC3|DTS/i.test(name),
          verified: $(row).find(".vip, .verified").length > 0
        });
      });
      return results;
    } catch (e) {
      return [];
    }
  });
}
function scrapeNyaaSi(query, isAnime = false) {
  return __async(this, null, function* () {
    try {
      const cat = isAnime ? "1_0" : "0_0";
      const html = yield fetchHTML(`https://nyaa.si/?q=${encodeURIComponent(query)}&f=0&c=${cat}`);
      if (!html) return [];
      const $ = cheerio.load(html);
      const results = [];
      $("table.torrent-list > tbody > tr").each((i, row) => {
        var _a, _b;
        const cols = $(row).find("td");
        if (cols.length < 7) return;
        const nameEl = $(cols[1]).find("a:last-child");
        const name = nameEl.text().trim();
        const magnetEl = $(cols[2]).find('a[href^="magnet:"]');
        const magnet = magnetEl.attr("href");
        if (!magnet) return;
        const infoHash = (_b = (_a = magnet.match(/btih:([a-fA-F0-9]{40})/i)) == null ? void 0 : _a[1]) == null ? void 0 : _b.toLowerCase();
        if (!infoHash) return;
        const sizeText = $(cols[3]).text().trim();
        results.push({
          name,
          infoHash,
          magnet,
          seeds: parseInt($(cols[5]).text().trim()) || 0,
          leechers: parseInt($(cols[6]).text().trim()) || 0,
          size: parseSizeToBytes(sizeText),
          sizeFormatted: sizeText,
          verified: $(row).find(".trusted, .remake").length > 0
        });
      });
      return results;
    } catch (e) {
      return [];
    }
  });
}
function scrapeSolidTorrents(query) {
  return __async(this, null, function* () {
    try {
      const data = yield fetchJSON(`https://solidtorrents.to/api/v1/search?q=${encodeURIComponent(query)}`);
      if (!(data == null ? void 0 : data.results)) return [];
      return data.results.slice(0, 30).map((r) => ({
        name: r.title,
        infoHash: r.infohash,
        magnet: `magnet:?xt=urn:btih:${r.infohash.toLowerCase()}`,
        seeds: r.seeders || 0,
        leechers: r.leechers || 0,
        size: r.size || 0,
        sizeFormatted: formatSize(r.size),
        verified: r.verified || false
      }));
    } catch (e) {
      return [];
    }
  });
}
function resolveDetailMagnet(detailUrl) {
  return __async(this, null, function* () {
    var _a, _b;
    try {
      const html = yield fetchHTML(detailUrl);
      if (!html) return null;
      const $ = cheerio.load(html);
      const magnet = $('a[href^="magnet:"]').first().attr("href");
      if (magnet) {
        const infoHash = (_b = (_a = magnet.match(/btih:([a-fA-F0-9]{40})/i)) == null ? void 0 : _a[1]) == null ? void 0 : _b.toLowerCase();
        return { magnet, infoHash: infoHash || "" };
      }
      const torrentLink = $('a[href$=".torrent"]').first().attr("href");
      if (torrentLink) {
        return { magnet: "", infoHash: "", torrentUrl: torrentLink.startsWith("http") ? torrentLink : new URL(torrentLink, detailUrl).href };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}
function scrapeLimeTorrents(query) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchHTML(`https://limetorrents.lol/search/all/${encodeURIComponent(query)}/`);
      if (!html) return [];
      const $ = cheerio.load(html);
      const results = [];
      $("table.table2 tr").each((i, row) => {
        const cols = $(row).find("td");
        if (cols.length < 5) return;
        const nameEl = $(cols[0]).find("a").last();
        const name = nameEl.text().trim();
        if (!name) return;
        const link = $(cols[0]).find("a").last().attr("href") || "";
        const sizeText = $(cols[2]).text().trim();
        results.push({
          name,
          infoHash: "",
          magnet: "",
          detailUrl: link.startsWith("http") ? link : `https://limetorrents.lol${link}`,
          seeds: parseInt($(cols[3]).text().trim()) || 0,
          leechers: parseInt($(cols[4]).text().trim()) || 0,
          size: parseSizeToBytes(sizeText),
          sizeFormatted: sizeText
        });
      });
      const toResolve = results.slice(0, 5).filter((r) => r.detailUrl && !r.magnet);
      if (toResolve.length) {
        const resolved = yield Promise.allSettled(toResolve.map((r) => resolveDetailMagnet(r.detailUrl)));
        for (let i = 0; i < toResolve.length; i++) {
          if (resolved[i].status === "fulfilled" && resolved[i].value) {
            toResolve[i].magnet = resolved[i].value.magnet || "";
            toResolve[i].infoHash = resolved[i].value.infoHash || "";
          }
        }
      }
      return results;
    } catch (e) {
      return [];
    }
  });
}
var x1337MIRRORS = [
  "https://1337xx.to",
  "https://x1337x.ws",
  "https://x1337x.eu",
  "https://x1337x.se",
  "https://www.1377x.to"
];
function scrape1337x(query) {
  return __async(this, null, function* () {
    for (const base of x1337MIRRORS) {
      try {
        const html = yield fetchHTML(`${base}/search/${encodeURIComponent(query)}/1/`);
        if (!html) continue;
        const $ = cheerio.load(html);
        const results = [];
        $("table.table-list tbody tr").each((i, row) => {
          const cols = $(row).find("td");
          if (cols.length < 5) return;
          const nameEl = $(row).find("td.name a").eq(1);
          const name = nameEl.text().trim();
          if (!name) return;
          const detailUrl = nameEl.attr("href") || "";
          const sizes = $(row).find("td.size").text().replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          const seedStr = $(row).find("td.seeds").text().trim();
          const leechStr = $(row).find("td.leeches").text().trim();
          const sizeMatch = sizes.match(/([\d.,]+\s*(?:GB|MB|TB|KB))/i);
          results.push({
            name,
            infoHash: "",
            magnet: "",
            detailUrl: detailUrl.startsWith("http") ? detailUrl : `${base}${detailUrl}`,
            seeds: parseInt(seedStr) || 0,
            leechers: parseInt(leechStr) || 0,
            size: parseSizeToBytes(sizes),
            sizeFormatted: sizeMatch ? sizeMatch[1] : sizes,
            verified: $(row).find(".vip, .trusted").length > 0
          });
        });
        if (results.length) {
          const toResolve = results.slice(0, 5).filter((r) => r.detailUrl && !r.magnet);
          if (toResolve.length) {
            const resolved = yield Promise.allSettled(toResolve.map((r) => resolveDetailMagnet(r.detailUrl)));
            for (let i = 0; i < toResolve.length; i++) {
              if (resolved[i].status === "fulfilled" && resolved[i].value) {
                toResolve[i].magnet = resolved[i].value.magnet || "";
                toResolve[i].infoHash = resolved[i].value.infoHash || "";
              }
            }
          }
          return results;
        }
      } catch (e) {
      }
    }
    return [];
  });
}
function scrapeEZTV(imdbId) {
  return __async(this, null, function* () {
    if (!imdbId) return [];
    try {
      const data = yield fetchJSON(`https://eztv.re/api/get-torrents?imdb_id=${imdbId}`);
      if (!(data == null ? void 0 : data.torrents)) return [];
      return data.torrents.map((r) => ({
        name: r.title || r.filename,
        infoHash: r.hash || "",
        magnet: r.magnet_url || `magnet:?xt=urn:btih:${r.hash}`,
        seeds: parseInt(r.seeds) || 0,
        leechers: parseInt(r.peers) || 0,
        size: parseInt(r.size_bytes) || 0,
        sizeFormatted: formatSize(parseInt(r.size_bytes) || 0),
        season: r.season,
        episode: r.episode,
        verified: false
      }));
    } catch (e) {
      return [];
    }
  });
}
function scrapeDivXTotal(query) {
  return __async(this, null, function* () {
    try {
      const html = yield fetchHTML(`https://divxtotal.foo/?s=${encodeURIComponent(query)}`);
      if (!html) return [];
      const $ = cheerio.load(html);
      const results = [];
      $('table tr:has(td a[href*="/peliculas"])').each((i, row) => {
        const cols = $(row).find("td");
        if (cols.length < 2) return;
        const name = $(row).find('td a[href*="/peliculas"]').first().text().trim();
        if (!name) return;
        const detailUrl = $(row).find('td a[href*="/peliculas"]').first().attr("href") || "";
        results.push({
          name,
          infoHash: "",
          magnet: "",
          seeds: parseInt($(cols.eq(3)).text().trim()) || 0,
          leechers: 0,
          size: parseSizeToBytes($(cols.eq(4)).text().trim()),
          sizeFormatted: $(cols.eq(4)).text().trim(),
          detailUrl: detailUrl.startsWith("http") ? detailUrl : `https://divxtotal.foo${detailUrl}`,
          verified: false
        });
      });
      const toResolve = results.slice(0, 5).filter((r) => r.detailUrl);
      if (toResolve.length) {
        const resolved = yield Promise.allSettled(toResolve.map((r) => resolveDivXTotalMagnet(r.detailUrl)));
        for (let i = 0; i < toResolve.length; i++) {
          if (resolved[i].status === "fulfilled" && resolved[i].value) {
            toResolve[i].magnet = resolved[i].value.magnet || "";
            toResolve[i].infoHash = resolved[i].value.infoHash || "";
          }
        }
      }
      return results.filter((r) => r.infoHash);
    } catch (e) {
      return [];
    }
  });
}
function resolveDivXTotalMagnet(detailUrl) {
  return __async(this, null, function* () {
    var _a, _b;
    try {
      const html = yield fetchHTML(detailUrl);
      if (!html) return null;
      const $ = cheerio.load(html);
      const dlLinks = $('a[href*="download_tt.php"]');
      for (let i = 0; i < dlLinks.length; i++) {
        const href = $(dlLinks[i]).attr("href") || "";
        const uMatch = href.match(/u=([^&]+)/);
        if (uMatch) {
          try {
            const decoded = Buffer.from(uMatch[1], "base64").toString("utf-8");
            if (decoded.endsWith(".torrent") && decoded.startsWith("http")) {
              const tr = yield fetch(decoded, {
                headers: { "User-Agent": UA },
                signal: AbortSignal.timeout(1e4)
              });
              if (tr.ok) {
                const torrentBuf = Buffer.from(yield tr.arrayBuffer());
                const infoHash = extractInfoHashFromBuffer(torrentBuf);
                if (infoHash) {
                  return { magnet: `magnet:?xt=urn:btih:${infoHash}`, infoHash };
                }
              }
            }
          } catch (e) {
          }
        }
      }
      const magnetEl = $('a[href^="magnet:"]').first();
      if (magnetEl.length) {
        const magnet = magnetEl.attr("href") || "";
        const infoHash = (_b = (_a = magnet.match(/btih:([a-fA-F0-9]{40})/i)) == null ? void 0 : _a[1]) == null ? void 0 : _b.toLowerCase();
        if (infoHash) return { magnet, infoHash };
      }
      return null;
    } catch (e) {
      return null;
    }
  });
}
function scrapeDonTorrent(query) {
  return __async(this, null, function* () {
    try {
      const baseUrl = "https://dontorrent.review";
      const res = yield fetch(`${baseUrl}/buscar`, {
        method: "POST",
        headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
        body: "valor=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(12e3)
      });
      if (!res.ok) return [];
      const html = yield res.text();
      if (html.length < 500) return [];
      const $ = cheerio.load(html);
      const results = [];
      $('a[href*="/pelicula/"], a[href*="/serie/"]').each((i, el) => {
        const href = $(el).attr("href") || "";
        const text = $(el).text().trim();
        if (!href || !text || text.length < 2) return;
        if (/^(Inicio|Películas|Series|Animes|Documentales)$/i.test(text)) return;
        results.push({
          name: text,
          infoHash: "",
          magnet: "",
          seeds: 0,
          leechers: 0,
          size: 0,
          sizeFormatted: "?",
          detailUrl: href.startsWith("http") ? href : `${baseUrl}${href}`,
          verified: false
        });
      });
      return results.slice(0, 5);
    } catch (e) {
      return [];
    }
  });
}
function scrapeEliteTorrent(query) {
  return __async(this, null, function* () {
    try {
      const baseUrl = "https://www.elitetorrent.com";
      const html = yield fetchHTML(`${baseUrl}/?s=${encodeURIComponent(query)}`);
      if (!html) return [];
      const $ = cheerio.load(html);
      const results = [];
      $('a[href*="/pelicula"]').each((i, el) => {
        const href = $(el).attr("href") || "";
        const text = $(el).text().trim();
        if (!href || !text || text.length < 3) return;
        if (/\/peliculas-?\d*\/?$/i.test(href)) return;
        if (/\/pelicula-de-la-television/i.test(href)) return;
        if (text === "Pel\xEDculas" || text === "Peliculas" || text === "Series") return;
        results.push({
          name: text,
          infoHash: "",
          magnet: "",
          seeds: 0,
          leechers: 0,
          size: 0,
          sizeFormatted: "?",
          detailUrl: href.startsWith("http") ? href : `${baseUrl}${href}`,
          verified: false
        });
      });
      const toResolve = results.slice(0, 5).filter((r) => r.detailUrl);
      if (toResolve.length) {
        const resolved = yield Promise.allSettled(toResolve.map((r) => resolveDetailMagnet(r.detailUrl)));
        for (let i = 0; i < toResolve.length; i++) {
          if (resolved[i].status === "fulfilled" && resolved[i].value) {
            toResolve[i].magnet = resolved[i].value.magnet || "";
            toResolve[i].infoHash = resolved[i].value.infoHash || "";
          }
        }
      }
      return results.filter((r) => r.infoHash);
    } catch (e) {
      return [];
    }
  });
}
function extractInfoHashFromBuffer(buf) {
  try {
    const str = buf.toString("latin1");
    const infoMatch = str.match(/4:infod/);
    if (!infoMatch) return null;
    const infoStart = infoMatch.index + 6;
    let depth = 1, infoEnd = infoStart + 1;
    while (depth > 0 && infoEnd < str.length) {
      if (str[infoEnd] === "d") depth++;
      else if (str[infoEnd] === "e") depth--;
      infoEnd++;
    }
    if (depth > 0) return null;
    const infoBuf = buf.slice(infoStart, infoEnd);
    const crypto = require("crypto");
    return crypto.createHash("sha1").update(infoBuf).digest("hex");
  } catch (e) {
    return null;
  }
}
var MIN_SCORE_THRESHOLD = 0.4;
function isPack(title) {
  const t = title.toLowerCase();
  return /\b(complete|season\s*\d+\s*(complete|pack)|s\d{1,2}\s*(complete|pack)|all\s*episodes|full\s*season)\b/i.test(t);
}
function titleNoisePenalty(query, title) {
  const qw = query.toLowerCase().replace(/[^a-z0-9]/g, " ").split(" ").filter((w) => w.length >= 2);
  const tw = title.toLowerCase().replace(/[^a-z0-9]/g, " ").split(" ").filter((w) => w.length >= 2);
  const extra = tw.length - qw.length;
  if (extra > 8) return -0.1;
  if (extra > 4) return -0.05;
  return 0;
}
function search(query, mediaType, imdbId, year, season, episode, isAnime = false) {
  return __async(this, null, function* () {
    if (!query || query.length < 2) return [];
    const searchStr = mediaType === "tv" && season !== void 0 && episode !== void 0 ? `${query} S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}` : query;
    const tasks = [
      { name: "GloDLS", fn: () => scrapeGloDLS(searchStr) },
      { name: "Nyaa.si", fn: () => scrapeNyaaSi(searchStr, isAnime) },
      { name: "SolidTorrents", fn: () => scrapeSolidTorrents(searchStr) },
      { name: "LimeTorrents", fn: () => scrapeLimeTorrents(searchStr) },
      { name: "1337x", fn: () => scrape1337x(searchStr) },
      { name: "DivXTotal", fn: () => scrapeDivXTotal(query) },
      { name: "DonTorrent", fn: () => scrapeDonTorrent(query) },
      { name: "EliteTorrent", fn: () => scrapeEliteTorrent(query) }
    ];
    try {
      const { loadDefinitions, searchCardigann } = require_cardigann_engine();
      const defsDir = require("path").join(__dirname, "definitions");
      const cardigannDefs = loadDefinitions(defsDir);
      if (cardigannDefs.length > 0) {
        const topTrackers = cardigannDefs.filter((d) => d.type === "public").slice(0, 10);
        for (const def of topTrackers) {
          tasks.push({
            name: def.name,
            fn: () => searchCardigann(def, query, mediaType)
          });
        }
      }
    } catch (e) {
    }
    if (mediaType === "tv" && imdbId) {
      tasks.push({ name: "EZTV", fn: () => scrapeEZTV(imdbId) });
    }
    const settled = yield Promise.allSettled(tasks.map((t) => __async(null, null, function* () {
      try {
        const raw = yield t.fn();
        if (!raw.length) return [];
        return raw.map((r) => normalizeTorrent(r, t.name));
      } catch (e) {
        return [];
      }
    })));
    const all = [];
    for (const r of settled) {
      if (r.status === "fulfilled") all.push(...r.value);
    }
    if (!all.length) return [];
    const isTV = season !== void 0 && episode !== void 0;
    const scored = all.map((t) => {
      const s = scoreTorrent(t, query, year, season, episode);
      const noise = titleNoisePenalty(query, t.title || t.name);
      return __spreadProps(__spreadValues({}, t), { score: s + noise });
    });
    const seen = /* @__PURE__ */ new Set();
    const deduped = [];
    for (const t of scored.sort((a, b) => b.score - a.score)) {
      if (t.score < MIN_SCORE_THRESHOLD) continue;
      if (isTV && isPack(t.title || t.name)) continue;
      const key = t.infoHash;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      deduped.push(t);
    }
    deduped.sort((a, b) => b.score - a.score || b.seeds - a.seeds);
    return deduped;
  });
}
module.exports = { search, TRACKERS, enrichMagnet };
