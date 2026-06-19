/**
 * scrapeless-proxy - Built from src/scrapeless-proxy/
 * Generated: 2026-06-19T18:45:14.474Z
 */
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

// src/scrapeless-proxy/index.js
var API_BASE = "https://api.scrapeless.com/api/v2/unlocker/request";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
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
    if (!input.headers["User-Agent"]) input.headers["User-Agent"] = UA;
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
module.exports = { scrape, configure, isEnabled };
