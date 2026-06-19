/**
 * stream-pipeline - Built from src/stream-pipeline/
 * Generated: 2026-06-19T19:19:39.805Z
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
            return yield resolveEmbed2(iframeUrl, embedUrl);
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
    function resolveEmbed2(embedUrl, referer) {
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
    module2.exports = { resolveEmbed: resolveEmbed2, tryResolveJWPlayer, tryResolveGeneric, clearCache };
  }
});

// src/stream-pipeline/index.js
var cheerio = require("cheerio-without-node-native") || require("cheerio");
var { resolveEmbed } = require_embed_resolver();
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
var TMDB_KEY = process.env.TMDB_KEY || "d80ba92bc7cefe3359668d30d06f3305";
var FETCH_TIMEOUT = 15e3;
var CIRCUIT_BREAKER_THRESHOLD = 5;
var CIRCUIT_RESET_MS = 5 * 60 * 1e3;
function fetchAPI(_0) {
  return __async(this, arguments, function* (url, opts = {}, timeout = FETCH_TIMEOUT) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = yield fetch(url, __spreadValues({ headers: __spreadValues({ "User-Agent": UA, "Accept": "*/*" }, opts.headers), signal: ctrl.signal }, opts));
      if (!res.ok) return null;
      const text = yield res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return text;
      }
    } catch (e) {
      return null;
    } finally {
      clearTimeout(t);
    }
  });
}
function parseSources(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.sources)) return data.sources;
  if (Array.isArray(data.streams)) return data.streams;
  if (Array.isArray(data.results)) return data.results;
  return [];
}
var CircuitBreaker = class {
  constructor(name) {
    this.name = name;
    this.failures = 0;
    this.successes = 0;
    this.total = 0;
    this.lastFail = 0;
    this.open = false;
    this.avgMs = 0;
  }
  success(ms) {
    this.total++;
    this.successes++;
    this.failures = 0;
    this.avgMs = (this.avgMs * (this.total - 1) + ms) / this.total;
    this.open = false;
  }
  fail(ms) {
    this.total++;
    this.failures++;
    this.lastFail = Date.now();
    this.avgMs = (this.avgMs * (this.total - 1) + ms) / this.total;
    if (this.failures >= CIRCUIT_BREAKER_THRESHOLD) this.open = true;
  }
  shouldSkip() {
    if (this.open && Date.now() - this.lastFail < CIRCUIT_RESET_MS) return true;
    if (this.open && Date.now() - this.lastFail >= CIRCUIT_RESET_MS) {
      this.open = false;
      this.failures = 0;
    }
    return false;
  }
  stats() {
    return { total: this.total, ok: this.successes, fail: this.total - this.successes, failStreak: this.failures, avgMs: Math.round(this.avgMs), healthy: !this.open };
  }
};
var LANG_TO_FLAG = {
  "cast": "\u{1F1EA}\u{1F1F8}",
  "lat": "\u{1F1EA}\u{1F1F8}",
  "es": "\u{1F1EA}\u{1F1F8}",
  "espanol": "\u{1F1EA}\u{1F1F8}",
  "castellano": "\u{1F1EA}\u{1F1F8}",
  "ja": "\u{1F1EF}\u{1F1F5}",
  "jp": "\u{1F1EF}\u{1F1F5}",
  "jap": "\u{1F1EF}\u{1F1F5}",
  "japones": "\u{1F1EF}\u{1F1F5}",
  "en": "\u{1F1EC}\u{1F1E7}",
  "us": "\u{1F1FA}\u{1F1F8}",
  "ko": "\u{1F1F0}\u{1F1F7}",
  "kr": "\u{1F1F0}\u{1F1F7}",
  "sub": "\u{1F1EF}\u{1F1F5}\u{1F1EA}\u{1F1F8}",
  "vose": "\u{1F1EC}\u{1F1E7}\u{1F1EA}\u{1F1F8}",
  "vos": "\u{1F1EC}\u{1F1E7}\u{1F1EA}\u{1F1F8}",
  "fr": "\u{1F1EB}\u{1F1F7}",
  "pt": "\u{1F1E7}\u{1F1F7}",
  "zh": "\u{1F1E8}\u{1F1F3}",
  "cn": "\u{1F1E8}\u{1F1F3}",
  "de": "\u{1F1E9}\u{1F1EA}",
  "it": "\u{1F1EE}\u{1F1F9}",
  "th": "\u{1F1F9}\u{1F1ED}",
  "ar": "\u{1F1F8}\u{1F1E6}",
  "hi": "\u{1F1EE}\u{1F1F3}",
  "ta": "\u{1F1EE}\u{1F1F3}",
  "te": "\u{1F1EE}\u{1F1F3}",
  "*": ""
};
function langToFlags(langStr) {
  if (!langStr) return "";
  if (/[\u{1F1E6}-\u{1F1FF}]{2,}/u.test(langStr)) return langStr;
  const flags = langStr.split(/[,;\s]+/).map((l) => LANG_TO_FLAG[l.trim().toLowerCase()] || "").filter(Boolean);
  return [...new Set(flags)].join("");
}
function normalizeQuality(text) {
  if (!text) return "HD";
  const t = String(text).trim();
  if (/\b(4K|2160p?|UHD|Ultra\s*HD)\b/i.test(t)) return "4K";
  if (/\b(1080p?|FHD|Full\s*HD)\b/i.test(t)) return "1080p";
  if (/\b(720p?|HD\s*Ready)\b/i.test(t)) return "720p";
  if (/\b(480p?|SD)\b/i.test(t)) return "480p";
  if (/\b(CAM|TS|TC|SCR|R5|CAMRip|Telesync|HDTS|HDTC)\b/i.test(t)) return "CAM";
  return "HD";
}
function languageScore(stream) {
  const allText = `${stream.name || ""}
${stream.title || ""}
${stream.description || ""}`.toLowerCase();
  let score = 0;
  if (/\b(castellano|español|espanol|audio castellano|audio español|españa|castellano latino)\b/i.test(allText)) score += 2;
  if (/\b(latino|audio latino|lat)\b/i.test(allText)) score += 1.5;
  if (/\b(vose|vos|subtitulado)\b/i.test(allText)) score += 1;
  if (/\b(dual|multi).*?(audio|idioma|lang)/i.test(allText)) score += 1.5;
  if (/\b(cast|es)\b/i.test(allText)) score += 0.5;
  return score;
}
var providerIndex = 0;
function normalizeStream(stream, source) {
  var _a, _b, _c;
  if (!stream || typeof stream !== "object") return null;
  const url = stream.url || stream.file || stream.src || stream.link;
  const hasPlayableTarget = url || stream.externalUrl || stream.infoHash;
  if (!hasPlayableTarget) return null;
  const rawName = stream.name || "";
  const rawTitle = stream.title || "";
  const nameLines = rawName.split("\n");
  const titleLines = rawTitle.split("\n");
  const sourceName = nameLines[0] || source;
  const allText = [stream.quality, rawName, rawTitle].filter(Boolean).join(" ");
  const quality = normalizeQuality(((_a = allText.match(/\b(4K|2160p?|UHD|1080p?|FHD|720p?|480p?|CAM|TS|TC|SCR)\b/i)) == null ? void 0 : _a[0]) || stream.quality || "");
  const descFlags = langToFlags(stream.description || "");
  const inlineFlags = ((_b = [...nameLines, ...titleLines].join(" ").match(/[\u{1F1E6}-\u{1F1FF}]{2}/ug)) == null ? void 0 : _b.join("")) || "";
  const flags = descFlags || inlineFlags;
  const isTorrent = !!stream.infoHash || /^magnet:/i.test(url || "");
  const typeEmoji = isTorrent ? "\u{1F9F2}" : "\u{1F4FA}";
  const name = `${typeEmoji} ${source}
${quality}${flags ? " " + flags : ""}`;
  const title = `${typeEmoji} ${quality} | ${source}`;
  const hasInfoHash = !!stream.infoHash;
  const isDirectMedia = url && /\.(mp4|m3u8|mkv|webm|avi)(\?|$)/i.test(url);
  return __spreadProps(__spreadValues(__spreadValues(__spreadValues(__spreadValues({
    name,
    title,
    id: `stream_${providerIndex++}`,
    quality,
    source,
    languageFlags: flags,
    languageScore: languageScore(stream)
  }, url ? { url } : {}), hasInfoHash ? { infoHash: stream.infoHash } : {}), stream.sources ? { sources: stream.sources } : {}), stream.externalUrl ? { externalUrl: stream.externalUrl } : {}), {
    behaviorHints: {
      notWebReady: !hasInfoHash && !isDirectMedia,
      bingeGroup: ((_c = stream.behaviorHints) == null ? void 0 : _c.bingeGroup) || `source|${source}`
    }
  });
}
function resolveTMDBId(rawId, mediaType) {
  return __async(this, null, function* () {
    var _a;
    if (!rawId) return null;
    if (rawId.startsWith("tt")) {
      const data = yield fetchAPI(`https://api.themoviedb.org/3/find/${rawId}?api_key=${TMDB_KEY}&external_source=imdb_id`);
      const results = data == null ? void 0 : data[mediaType === "tv" ? "tv_results" : "movie_results"];
      return ((_a = results == null ? void 0 : results[0]) == null ? void 0 : _a.id) || null;
    }
    if (rawId.match(/^\d+$/)) return rawId;
    return null;
  });
}
var providerRegistry = [];
var circuitBreakers = /* @__PURE__ */ new Map();
function register(provider) {
  providerRegistry.push(provider);
  circuitBreakers.set(provider.name, new CircuitBreaker(provider.name));
}
function getCircuitBreaker(name) {
  return circuitBreakers.get(name);
}
function getAllCircuitBreakers() {
  const result = [];
  for (const [name, cb] of circuitBreakers) {
    result.push(__spreadValues({ name }, cb.stats()));
  }
  return result;
}
var StreamPipeline = class {
  constructor(options = {}) {
    this.cache = /* @__PURE__ */ new Map();
    this.cacheTTL = options.cacheTTL || 10 * 60 * 1e3;
    this.maxCache = options.maxCache || 1e3;
    this.maxResults = options.maxResults || 80;
    this.maxEmbedResolve = options.maxEmbedResolve || 12;
    this.castellanoPriority = options.castellanoPriority !== false;
  }
  execute(_0, _1) {
    return __async(this, arguments, function* (type, id, options = {}) {
      const { season = 1, episode = 1, langPref = [] } = options;
      const mediaType = type === "series" || type === "anime" ? "tv" : type;
      const ck = `${type}:${id}:${season}:${episode}`;
      const cached = this.cache.get(ck);
      if (cached && Date.now() - cached.time < this.cacheTTL) {
        return cached.data;
      }
      const tmdbId = yield resolveTMDBId(id, mediaType);
      const rawStreams = [];
      const activeProviders = providerRegistry.filter((p) => p.enabled !== false);
      const chunks = this._chunk(activeProviders, 8);
      for (const chunk of chunks) {
        const settled = yield Promise.allSettled(
          chunk.map((p) => this._executeProvider(p, id, tmdbId, mediaType, type, season, episode))
        );
        for (const r of settled) {
          if (r.status === "fulfilled" && Array.isArray(r.value)) rawStreams.push(...r.value);
        }
      }
      const seen = /* @__PURE__ */ new Set();
      const deduped = [];
      for (const s of rawStreams) {
        const key = (s.infoHash || s.url || "").toLowerCase() + "|" + (s.name || "").toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(s);
      }
      if (this.castellanoPriority) {
        deduped.sort((a, b) => {
          const la = a.languageScore || 0;
          const lb = b.languageScore || 0;
          if (la !== lb) return lb - la;
          const qOrder = { "4K": 4, "1080p": 3, "720p": 2, "480p": 1, "HD": 2, "CAM": 0 };
          return (qOrder[b.quality] || 0) - (qOrder[a.quality] || 0);
        });
      }
      const result = deduped.slice(0, this.maxResults);
      yield this._resolveEmbeds(result);
      if (this.cache.size >= this.maxCache) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      this.cache.set(ck, { data: result, time: Date.now() });
      return result;
    });
  }
  _resolveEmbeds(streams) {
    return __async(this, null, function* () {
      const unresolved = streams.filter((s) => {
        var _a;
        return s.url && !s.infoHash && ((_a = s.behaviorHints) == null ? void 0 : _a.notWebReady);
      });
      if (!unresolved.length) return;
      const toResolve = unresolved.slice(0, this.maxEmbedResolve);
      const resolved = yield Promise.allSettled(
        toResolve.map((s) => resolveEmbed(s.url, ""))
      );
      let count = 0;
      for (let i = 0; i < toResolve.length; i++) {
        if (resolved[i].status === "fulfilled" && resolved[i].value) {
          const directUrl = resolved[i].value;
          if (/\.(m3u8|mp4)/i.test(directUrl)) {
            toResolve[i].url = directUrl;
            toResolve[i].behaviorHints = __spreadProps(__spreadValues({}, toResolve[i].behaviorHints), { notWebReady: false });
            count++;
          }
        }
      }
    });
  }
  _executeProvider(provider, rawId, tmdbId, mediaType, type, season, episode) {
    return __async(this, null, function* () {
      const cb = getCircuitBreaker(provider.name);
      if (cb && cb.shouldSkip()) return [];
      const start = Date.now();
      try {
        const streams = yield Promise.race([
          provider.execute(rawId, tmdbId, mediaType, type, season, episode),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), provider.timeout || 3e4))
        ]);
        const normalized = (Array.isArray(streams) ? streams : []).map((s) => normalizeStream(s, provider.name)).filter(Boolean);
        cb == null ? void 0 : cb.success(Date.now() - start);
        return normalized;
      } catch (e) {
        cb == null ? void 0 : cb.fail(Date.now() - start);
        return [];
      }
    });
  }
  _chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
  }
};
module.exports = { StreamPipeline, register, getCircuitBreaker, getAllCircuitBreakers, fetchAPI, parseSources, normalizeStream, resolveTMDBId, langToFlags, LANG_TO_FLAG };
