/**
 * Ovnivers — Stremio Addon Backend v1.13.1
 * Backend scrapers + server-side providers + Pigamer37 anime proxy
 * Configurable: language filter, quality preference, enable/disable scrapers
 */
try { require('dotenv').config(); } catch {}

// Polyfill browser APIs missing in Node 18 (Render uses Node 18.20.8)
if (typeof File === 'undefined') {
  try { global.File = require('node:buffer').File; } catch { global.File = class File extends Blob { constructor(chunks, name, opts = {}) { super(chunks, opts); this.name = name; this.lastModified = opts.lastModified || Date.now(); } }; }
}

// Polyfill fetch for older Node versions (Render free tier may use Node 16/18)
if (typeof fetch === 'undefined') {
  try { global.fetch = require('node-fetch'); } catch (e) {
    console.error('CRITICAL: No fetch implementation available. Install node-fetch or undici.');
  }
}

// ─── Process safety handlers ────────────────
// Prevent crash on unhandled promise rejections (Node 15+ default)
process.on('unhandledRejection', (reason) => {
  console.error(`[process] unhandledRejection: ${reason?.message || reason}`);
});
process.on('uncaughtException', (err) => {
  console.error(`[process] uncaughtException: ${err.message}`);
  // Don't exit — let Render restart if needed
});

// Memory-aware cache eviction — runs every 5 min
const MEMORY_HIGH_WATERMARK = 0.7; // 70% of heap
setInterval(() => {
  const mem = process.memoryUsage();
  const heapUsed = mem.heapUsed / mem.heapTotal;
  if (heapUsed > MEMORY_HIGH_WATERMARK) {
    const streamSize = streamCache?.size || 0;
    const metaSize = metaCache?.size || 0;
    const healthSize = health?.getReport()?.length || 0;
    console.warn(`[memory] High heap: ${(heapUsed * 100).toFixed(0)}% — clearing caches (stream:${streamSize}, meta:${metaSize}, health:${healthSize})`);
    if (streamCache) streamCache.clear();
    if (metaCache) metaCache.clear();
    global.gc && global.gc();
  }
}, 300_000).unref();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

// Inyectar globals para scrapers Hermes (disenados para motor Hermes de NuvioTV)
// Hermes inyecta cheerio y CryptoJS como variables globales en el motor JS
global.cheerio = cheerio;
global['cheerio-without-node-native'] = cheerio;
global['react-native-cheerio'] = cheerio;
try { global.CryptoJS = require('crypto-js'); } catch {}

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

const catalog = require('./src/catalog/index');
const torrentIndex = require('./src/torrent-providers/index');
const { resolveEmbed } = require('./src/alfa-providers/embed-resolver');
const puppeteerResolver = require('./src/puppeteer-resolver');
const pptrAnime = require('./src/jkanime-puppeteer');
const { StreamPipeline } = require('./src/stream-pipeline/index');
const scrapeless = require('./src/scrapeless-proxy');
const anime = require('./src/anime/index');
const media = require('./src/media/index');
const movies = require('./src/movies/index');
const series = require('./src/series/index');
const content = require('./src/content/index');

// Configure Scrapeless if API key is set
if (process.env.SCRAPELESS_API_KEY) {
  scrapeless.configure(process.env.SCRAPELESS_API_KEY);
  console.log('[scrapeless] Universal Scraping API enabled');
}

const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const VERSION = '1.13.1';
const ADDON_ID = 'com.ovnivers.allinone';

// Available languages for filtering
const ALL_LANGS = {
  en: 'English', es: 'Castellano', lat: 'Latino', fr: 'French', ja: 'Japanese',
  ko: 'Korean', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
  it: 'Italian', pt: 'Portuguese', ar: 'Arabic', zh: 'Chinese',
  de: 'German', th: 'Thai'
};

// Default config
const DEFAULT_CONFIG = {
  langs: Object.keys(ALL_LANGS),        // all enabled
  quality: 'all',                        // 'all' | '4k' | '1080p' | '720p'
  enableMovies: true,
  enableSeries: true,
  enableAnime: true,
  enableBackend: true,
  enableLocal: true,                     // run bundled providers server-side
  exposeLocalScrapers: false             // legacy Nuvio local scraper manifest field
};

let manifestScrapers = [];
try {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf-8'));
  if (Array.isArray(raw.scrapers)) {
    manifestScrapers = raw.scrapers;
    console.log(`Loaded ${manifestScrapers.length} scrapers from manifest.json`);
  }
} catch (e) {
  console.warn('Could not load scrapers from manifest.json:', e.message);
}

// ─── Proxy setup: route ALL fetch() calls through proxy ──────
const PROXY_URL = process.env.PROXY_URL || '';
let HttpsProxyAgent;
if (PROXY_URL) {
  try { HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent; } catch {}
}
// Domains that use Anubis PoW — route DIRECT (bypass proxy)
// The Anubis solver in engine.js works with direct access but the proxy
// breaks the cookie chain (Worker receives challenge, backend solves it,
// but auth cookie stays in backend, not in Worker)
const PROXY_BYPASS_DOMAINS = new Set(
  (process.env.PROXY_BYPASS_DOMAINS || 'dontorrent.support,dontorrent.fit,www43.mejortorrent.eu,grantorrent.zip,divxtotal.foo,wolfmax4k.com,pelispanda.org,elitetorrent.biz,mitorrent.mx,hacktorrent.to,bloghorror.com,jkanime.net,tioanime.com,animeav1.com,nika.playmudos.com')
    .split(',')
    .map(d => d.trim().toLowerCase())
    .filter(Boolean)
);

function shouldBypassProxy(urlStr) {
  try {
    const hostname = new URL(urlStr).hostname.toLowerCase();
    if (PROXY_BYPASS_DOMAINS.has(hostname)) return true;
    for (const d of PROXY_BYPASS_DOMAINS) {
      if (hostname.endsWith('.' + d)) return true;
    }
  } catch {}
  return false;
}

if (PROXY_URL) {
  const origFetch = global.fetch;
  const isWorkerProxy = PROXY_URL.includes('workers.dev') || PROXY_URL.includes('worker');
  const proxyBase = PROXY_URL.replace(/\/+$/, '');
  if (isWorkerProxy) {
    global.fetch = async (input, init = {}) => {
      let urlStr;
      if (typeof input === 'string') urlStr = input;
      else if (input instanceof URL) urlStr = input.href;
      else if (input && typeof input.url === 'string') urlStr = input.url;
      else urlStr = String(input);
      if (urlStr.startsWith('http:') || urlStr.startsWith('https:')) {
        if (shouldBypassProxy(urlStr)) return origFetch(urlStr, init);
        return origFetch(`${proxyBase}/?url=${encodeURIComponent(urlStr)}`, init);
      }
      return origFetch(input, init);
    };
  } else if (HttpsProxyAgent) {
    global.fetch = async (input, init = {}) => {
      let urlStr;
      if (typeof input === 'string') urlStr = input;
      else if (input instanceof URL) urlStr = input.href;
      else if (input && typeof input.url === 'string') urlStr = input.url;
      else urlStr = String(input);
      if (shouldBypassProxy(urlStr)) return origFetch(input, init);
      if (!init.agent) init.agent = new HttpsProxyAgent(PROXY_URL);
      return origFetch(input, init);
    };
  }
  const mode = isWorkerProxy ? 'Cloudflare Worker' : 'HTTP proxy';
  const bypassCount = PROXY_BYPASS_DOMAINS.size;
  console.log(`[proxy] All fetch() routed through ${mode}: ${PROXY_URL} (${bypassCount} domains bypassed)`);
}

const LOCAL_PROVIDER_TIMEOUT = Number(process.env.LOCAL_PROVIDER_TIMEOUT || 10000);
const LOCAL_PROVIDER_CONCURRENCY = Number(process.env.LOCAL_PROVIDER_CONCURRENCY || 6);
const STREAM_GLOBAL_TIMEOUT = Number(process.env.STREAM_GLOBAL_TIMEOUT || 30000);
const MAX_STREAM_RESULTS = Number(process.env.MAX_STREAM_RESULTS || 80);
let scrapeAlfaProviders = null;
const localProviders = [];

try {
  const alfaModule = require('./providers/alfa-providers');
  scrapeAlfaProviders = alfaModule.default || alfaModule;
  if (typeof scrapeAlfaProviders === 'function') {
    console.log('Loaded Alfa provider bridge');
  } else {
    scrapeAlfaProviders = null;
    console.warn('Alfa provider bridge loaded but is not a function');
  }
} catch (e) {
  console.warn('Could not load Alfa provider bridge:', e.message);
}

for (const scraper of manifestScrapers) {
  if (!scraper?.enabled || !scraper.filename) continue;
  if (scraper.filename.replace(/\\/g, '/').endsWith('/alfa-providers.js')) continue;
  try {
    const filename = path.normalize(scraper.filename);
    const fullPath = path.resolve(__dirname, filename);
    if (!fullPath.startsWith(path.resolve(__dirname))) continue;
    const mod = require(fullPath);
    const getStreams = mod?.getStreams || mod?.default?.getStreams;
    if (typeof getStreams !== 'function') continue;
    localProviders.push({
      id: scraper.id || path.basename(filename, '.js'),
      name: scraper.name || scraper.id || path.basename(filename, '.js'),
      supportedTypes: scraper.supportedTypes || ['movie', 'tv'],
      contentLanguage: scraper.contentLanguage || [],
      getStreams
    });
  } catch (e) {
    console.warn(`[provider] skipped ${scraper.id || scraper.filename}: ${e.message}`);
  }
}
console.log(`Loaded ${localProviders.length} local provider modules`);

// ─── Health Check / Provider Stats ─────────
const health = media.health;

localProviders.forEach(p => health.init(p.id));
health.init('alfa-providers');
health.init('backend-scrapers');
health.init('pigamer37');
health.init('torrent-indexers');

const streamCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;
const MAX_CACHE = 1000;
const metaCache = new Map();
const META_TTL = 60 * 60 * 1000;

function cacheSet(cache, key, value, max) {
  if (cache.size >= max) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}

// ─── Helpers ──────────────────────────────

async function fetchAPI(url, opts = {}, timeout = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': '*/*', ...opts.headers },
      signal: ctrl.signal, ...opts
    });
    if (!res.ok) return null;
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  } catch { return null; }
  finally { clearTimeout(timer); }
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

function isValidEmbedUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url.startsWith('//') ? 'https:' + url : url);
    const host = u.hostname;
    const path = u.pathname + u.search;

    if (/api\.|\.api\b/.test(host) || /\/api\b/.test(path)) return false;
    if (/google\.|facebook\.|twitter\.|cloudflare|sharethis|amung\.us|googletagmanager/i.test(host)) return false;
    if (/\b(search|trending|similar)\b/i.test(path)) return false;
    if (path === '/' || path === '' || /^\/\w{0,3}$/.test(path)) return false;
    if (/\.(css|js|svg|png|jpg|webp|woff|ttf)\b/i.test(path)) return false;
    return true;
  } catch {
    return false;
  }
}

function parse2embedHTML(html, mirrorName) {
  if (!html || typeof html !== 'string') return [];
  const streams = [];
  const seen = new Set();
  const label = mirrorName || '2embed';

  const isVideoExt = (u) => /\.(m3u8|mp4|mkv|webm|avi)(\?|$)/i.test(u);
  const isEmbedPage = (u) => /\/(embed|e|player|play|watch)\b/i.test(u);

  const urlRe = /https?:\/\/[^"'\s<>(){}[\]]+/gi;
  const iframeRe = /<iframe[^>]+src=["']([^"']+)["']/gi;
  const jsUrlRe = /(?:file|src|url|source|videoSrc|streamUrl|playlist)\s*[:=]\s*["']([^"']+)["']/gi;
  const dataSrcRe = /data-(?:src|file|url|video)=["']([^"']+)["']/gi;
  const jsonBlockRe = /"((?:https?:)?\/\/[^"]+(?:m3u8|mp4|mkv|embed|hls)[^"]*)"/gi;

  let m;
  while ((m = urlRe.exec(html)) !== null) {
    const url = m[0].replace(/[)'"}>[\]]+$/, '');
    if (!url || seen.has(url) || !isValidEmbedUrl(url)) continue;
    const keep = isVideoExt(url) || (isEmbedPage(url) && !url.includes('.js'));
    if (!keep) continue;
    seen.add(url);
    const quality = isVideoExt(url) ? (url.includes('m3u8') ? 'Adaptive' : 'HD') : 'Embed';
    streams.push({ name: `${label}\n${quality}`, url, behaviorHints: { notWebReady: !isVideoExt(url) } });
  }
  while ((m = iframeRe.exec(html)) !== null) {
    const src = m[1];
    if (src && !seen.has(src) && isValidEmbedUrl(src) && (src.includes('embed') || src.includes('player') || src.includes('stream') || isVideoExt(src))) {
      seen.add(src);
      streams.push({ name: `${label} (iframe)\nEmbed`, url: src, behaviorHints: { notWebReady: true } });
    }
  }
  while ((m = jsUrlRe.exec(html)) !== null) {
    const url = m[1];
    if (url && !seen.has(url) && isValidEmbedUrl(url) && !url.includes('.js') && isVideoExt(url)) {
      seen.add(url);
      const quality = url.includes('m3u8') ? 'Adaptive' : 'HD';
      streams.push({ name: `${label}\n${quality}`, url, behaviorHints: { notWebReady: true } });
    }
  }
  while ((m = dataSrcRe.exec(html)) !== null) {
    const url = m[1];
    if (url && !seen.has(url) && isValidEmbedUrl(url)) {
      seen.add(url);
      streams.push({ name: `${label}\nHD`, url, behaviorHints: { notWebReady: true } });
    }
  }
  while ((m = jsonBlockRe.exec(html)) !== null) {
    const val = m[1];
    const fullUrl = val.startsWith('//') ? 'https:' + val : val;
    if (fullUrl && !seen.has(fullUrl) && isValidEmbedUrl(fullUrl)) {
      const isVideo = isVideoExt(fullUrl);
      if (isVideo || fullUrl.includes('embed') || fullUrl.includes('player')) {
        seen.add(fullUrl);
        const quality = isVideo ? (fullUrl.includes('m3u8') ? 'Adaptive' : 'HD') : 'Embed';
        streams.push({ name: `${label}\n${quality}`, url: fullUrl, behaviorHints: { notWebReady: !isVideo } });
      }
    }
  }

  return streams;
}

function parseConfig(req) {
  try {
    const b64 = req.query.configured;
    if (b64) {
      const json = Buffer.from(b64, 'base64').toString('utf-8');
      const cfg = JSON.parse(json);
      return { ...DEFAULT_CONFIG, ...cfg };
    }
  } catch {}
  const q = req.query;
  if (q.m !== undefined) { q.c = '1'; }
  if (q.c === '1' || q.c === 'true') {
    const cfg = {};
    if (q.m !== undefined) cfg.enableMovies = q.m === '1' || q.m === 'true';
    if (q.s !== undefined) cfg.enableSeries = q.s === '1' || q.s === 'true';
    if (q.a !== undefined) cfg.enableAnime = q.a === '1' || q.a === 'true';
    if (q.q !== undefined) cfg.quality = q.q;
    if (q.l !== undefined) cfg.langs = q.l.split(',').filter(Boolean);
    if (q.b !== undefined) cfg.enableBackend = q.b === '1' || q.b === 'true';
    if (q.L !== undefined) cfg.enableLocal = q.L === '1' || q.L === 'true';
    return { ...DEFAULT_CONFIG, ...cfg };
  }
  return DEFAULT_CONFIG;
}

// ─── TMDB Helpers ─────────────────────────

async function getIMDbId(tmdbId, mediaType) {
  try {
    const meta = await content.profile.resolveByTMDB(tmdbId, mediaType);
    return meta?.imdbId || null;
  } catch { return null; }
}

async function getTMDbId(imdbId, mediaType) {
  try {
    const profile = await content.profile.resolveByIMDB(imdbId, mediaType);
    return profile?.id || null;
  } catch { return null; }
}

async function getTMDbMeta(tmdbId, mediaType) {
  try {
    const profile = await content.profile.resolveByTMDB(tmdbId, mediaType);
    return profile || null;
  } catch { return null; }
}

async function getTMDbEpisodes(tmdbId, seasons) {
  if (!seasons?.length) return [];
  try {
    const allEpisodes = await content.episode.getAllEpisodes(tmdbId, 10);
    return content.episode.buildStremioVideos(allEpisodes);
  } catch { return []; }
}

// ─── Backend Scrapers ─────────────────────

async function scrape2embed(rawId, mediaType, season, episode) {
  const mirrors = [
    { name: '2embed (vesy)', url: (id) => `https://streamsrcs.2embed.cc/vesy?tmdb=${id}${mediaType==='tv'?`&s=${season}&e=${episode}`:''}`, key: 'tmdb' },
    { name: '2embed (vsrc)', url: (id) => `https://streamsrcs.2embed.cc/vsrc?imdb=${id}${mediaType==='tv'?`&s=${season}&e=${episode}`:''}`, key: 'tt' },
    { name: '2embed (skin)',  url: (id) => `https://www.2embed.skin/api/${mediaType==='tv'?'tv':'movie'}/${id}.json`, key: 'tmdb' },
    { name: '2embed (cc)',    url: (id) => `https://vidsrc.cc/v2/embed/${mediaType==='tv'?'tv':'movie'}/${id}${mediaType==='tv'?`/${season}/${episode}`:''}`, key: 'tmdb' },
    { name: 'VidSrc (pro)',   url: (id) => `https://vidsrc.pro/v2/embed/${mediaType==='tv'?'tv':'movie'}/${id}${mediaType==='tv'?`/${season}/${episode}`:''}`, key: 'tmdb' },
    { name: 'VidSrc (icu)',   url: (id) => `https://vidsrc.icu/embed/${mediaType==='tv'?'tv':'movie'}/${id}${mediaType==='tv'?`/${season}/${episode}`:''}`, key: 'tmdb' },
    { name: 'VidSrc (xyz)',   url: (id) => `https://vidsrc.xyz/embed/${mediaType==='tv'?'tv':'movie'}/${id}${mediaType==='tv'?`/${season}/${episode}`:''}`, key: 'tmdb' },
    { name: 'SuperEmbed',     url: (id) => `https://multiembed.mov/direct?tmdb=${id}${mediaType==='tv'?`&season=${season}&episode=${episode}`:''}`, key: 'tmdb' },
  ];

  let tmdbId = rawId;
  let imdbId = rawId;
  if (rawId.startsWith('tt')) imdbId = rawId;
  else imdbId = await getIMDbId(rawId, mediaType);

  const results = [];
  for (const mirror of mirrors) {
    try {
      const id = mirror.key === 'tt' ? imdbId : tmdbId;
      if (!id) continue;
      const data = await fetchAPI(mirror.url(id), {}, 10000);
      if (!data) continue;

      // Parse JSON response
      if (typeof data === 'object') {
        const sources = parseSources(data);
        for (const s of sources) {
          const streamUrl = s.url || s.file || s.link || s.src || s.stream || '';
          if (streamUrl && isValidEmbedUrl(streamUrl)) {
            const q = s.quality || s.label || s.resolution || 'HD';
            results.push({
              name: `${mirror.name}\n${q}${s.lang ? ' ' + s.lang : ''}`,
              url: streamUrl,
              ...(s.lang ? { description: s.lang } : {}),
              behaviorHints: { notWebReady: true }
            });
          }
        }
        if (sources.length) break; // got results, stop trying mirrors
      }

      // Parse HTML response
      if (typeof data === 'string' && data.length > 500) {
        const htmlStreams = parse2embedHTML(data, mirror.name);
        if (htmlStreams.length) {
          results.push(...htmlStreams);
          break;
        }
      }
    } catch {}
  }
  return results;
}

async function scrapePoseidonHD(rawId, mediaType) {
  try {
    let tmdbId = rawId;
    if (rawId.startsWith('tt')) {
      tmdbId = await getTMDbId(rawId, mediaType);
      if (!tmdbId) return [];
    }
    const meta = await getTMDbMeta(tmdbId, mediaType);
    if (!meta) return [];
    const title = meta.title || meta.name || '';
    const year = (meta.release_date || meta.first_air_date || '').substring(0, 4);
    if (!title) return [];

    const domains = ['poseidonhd2.co', 'poseidonhd3.co', 'poseidonhd.lat'];
    for (const domain of domains) {
      try {
        const searchUrl = `https://www.${domain}/search?q=${encodeURIComponent(title)}`;
        const html = await fetchAPI(searchUrl, {}, 10000);
        if (!html || typeof html !== 'string') continue;
        const linkMatch = html.match(/href="(\/[^"]*pelicula[^"]*)"[^>]*>([^<]*)<\/a>/gi);
        if (!linkMatch) continue;
        let bestUrl = null, bestScore = 0;
        for (const m of linkMatch) {
          const href = m.match(/href="([^"]+)"/)?.[1];
          const txt = m.match(/>([^<]+)</)?.[1]?.trim();
          if (!href || !txt) continue;
          let s = txt.toLowerCase().includes(title.toLowerCase().substring(0, 5)) ? 1 : 0;
          if (year && txt.includes(year)) s += 0.2;
          if (s > bestScore) { bestScore = s; bestUrl = `https://www.${domain}${href}`; }
        }
        if (!bestUrl) continue;
        const pageHtml = await fetchAPI(bestUrl, {}, 10000);
        if (!pageHtml || typeof pageHtml !== 'string') continue;
        const nextMatch = pageHtml.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
        if (!nextMatch) continue;
        const data = JSON.parse(nextMatch[1]);
        const players = data?.props?.pageProps?.post?.players;
        if (!players) continue;
        const streams = [];
        for (const [lang, arr] of Object.entries(players)) {
          if (Array.isArray(arr)) {
            for (const p of arr) {
              if (p.result) streams.push({
                name: `PoseidonHD\n${p.quality || 'HD'}${lang ? ' ' + lang : ''}`,
                description: lang, url: p.result,
                behaviorHints: { notWebReady: true }
              });
            }
          }
        }
        if (streams.length) return streams;
      } catch {}
    }
    return [];
  } catch { return []; }
}

const BACKEND_SCRAPERS = [
  { name: '2embed+Mirrors', fn: scrape2embed },
  { name: 'PoseidonHD', fn: scrapePoseidonHD },
];

// ─── Anime (unified module) ──────────────

function parsePathExtras(extraStr) {
  const params = {};
  if (!extraStr) return params;
  const pairs = extraStr.split('&');
  for (const pair of pairs) {
    const eq = pair.indexOf('=');
    if (eq > 0) params[pair.substring(0, eq)] = pair.substring(eq + 1);
    else if (pair) params[pair] = '';
  }
  return params;
}

// ─── Route helpers ────────────────────────

function mapType(type) {
  if (type === 'series') return 'tv';
  if (type === 'movie') return 'movie';
  if (type === 'anime') return 'tv';
  return type;
}

function extractId(rawId) {
  if (rawId.startsWith('tmdb:')) return rawId.substring(5);
  if (rawId.startsWith('ovn-anime:')) return rawId.substring(10);
  if (rawId.startsWith('ovn:')) return rawId.substring(4);
  return rawId;
}

function cacheKey(type, id, extra) {
  return `${type}:${id}:${extra || ''}`;
}

function isSeriesType(type) {
  return type === 'series' || type === 'tv' || type === 'anime';
}

function parseStreamId(id, fallbackSeason = 1, fallbackEpisode = 1) {
  const parsed = content.episode.parseEpisodeId(id);
  return {
    contentId: parsed.contentId,
    animePrefix: parsed.animePrefix || null,
    season: parsed.season || fallbackSeason,
    episode: parsed.episode || fallbackEpisode,
  };
}

function isTypeEnabled(type, config) {
  if (type === 'movie') return config.enableMovies;
  if (isSeriesType(type)) return config.enableSeries || config.enableAnime;
  return true;
}

function providerSupportsType(provider, mediaType, type) {
  const supported = (provider.supportedTypes || []).map(t => String(t).toLowerCase());
  if (!supported.length) return true;
  if (mediaType === 'movie') return supported.includes('movie');
  if (mediaType === 'tv') {
    return supported.includes('tv') || supported.includes('series') || supported.includes('anime');
  }
  return supported.includes(type);
}

function providerMatchesLang(provider, config) {
  const langs = (provider.contentLanguage || []).map(l => String(l).toLowerCase());
  if (!langs.length || langs.includes('*')) return true;
  const enabled = new Set((config.langs || []).map(l => String(l).toLowerCase()));
  return langs.some(lang => enabled.has(lang));
}

function withTimeout(promise, timeoutMs) {
  let timer;
  return Promise.race([
    promise,
    new Promise(resolve => {
      timer = setTimeout(() => resolve([]), timeoutMs);
    })
  ]).finally(() => clearTimeout(timer));
}

const LANG_TO_FLAG = {
  'cast': '🇪🇸',   'lat': '🇪🇸',    'es': '🇪🇸',
  'espanol': '🇪🇸', 'castellano': '🇪🇸',
  'ja': '🇯🇵',     'jp': '🇯🇵',    'jap': '🇯🇵',
  'japones': '🇯🇵',
  'en': '🇬🇧',     'us': '🇺🇸',
  'ko': '🇰🇷',     'kr': '🇰🇷',
  'sub': '🇯🇵🇪🇸', 'vose': '🇬🇧🇪🇸', 'vos': '🇬🇧🇪🇸',
  'fr': '🇫🇷',     'pt': '🇧🇷',
  'zh': '🇨🇳',     'cn': '🇨🇳',
  'de': '🇩🇪',     'it': '🇮🇹',
  'th': '🇹🇭',     'ar': '🇸🇦',
  '*': ''
};

function langToFlags(langStr) {
  if (!langStr) return '';
  if (/[\u{1F1E6}-\u{1F1FF}]{2,}/u.test(langStr)) return langStr;
  const flags = langStr.split(/[,;\s]+/).map(l => LANG_TO_FLAG[l.trim().toLowerCase()] || '').filter(Boolean);
  return [...new Set(flags)].join('');
}

const SERVER_MAP = [
  [/\b(?:mega\.nz|mega\.co\.nz)\b/i, 'Mega'],
  [/\bok\.ru\b/i, 'Okru'],
  [/\bmp4upload\.(?:com|to)\b/i, 'Mp4Upload'],
  [/\bstreamtape\b/i, 'Streamtape'],
  [/\bstreamsb\b/i, 'StreamSB'],
  [/\bstreamlare\b/i, 'StreamLare'],
  [/\bdoood?ster\b/i, 'DoodStream'],
  [/\byourupload\b/i, 'YourUpload'],
  [/\bmediafire\b/i, 'MediaFire'],
  [/\bdrive\.google\b/i, 'Google Drive'],
  [/\bgounlimited\b/i, 'GoUnlimited'],
  [/\bfembed\b/i, 'Fembed'],
  [/\bvidstream\b/i, 'VidStream'],
  [/\bnetutv\b/i, 'NetuTV'],
  [/\brapidvideo\b/i, 'RapidVideo'],
  [/\bstreamango\b/i, 'Streamango'],
  [/\bmail\.ru\b/i, 'MailRu'],
  [/\bupstream\b/i, 'Upstream'],
  [/\bvidcache\b/i, 'VidCache'],
  [/\bvideawe\b/i, 'VideaWe'],
  [/\bvudeo\b/i, 'Vudeo'],
  [/\bstreamwire\b/i, 'StreamWire'],
  [/\bclipwatching\b/i, 'ClipWatching'],
  [/\bvidmoly\b/i, 'VidMoly'],
  [/\bstreamvid\b/i, 'StreamVid'],
  [/\bembed(?:\.)?(?:6|7|8|9)\b/i, 'Embed'],
  [/\bpixeldrain\b/i, 'PixelDrain'],
  [/\b1fichier\b/i, '1Fichier'],
  [/\buptobox\b/i, 'UptoBox'],
  [/\bturbobit\b/i, 'TurboBit'],
  [/\bhitfile\b/i, 'HitFile'],
  [/\buploaded\b/i, 'Uploaded'],
  [/\bkatfile\b/i, 'KatFile'],
  [/\bddownload\b/i, 'DDownload'],
  [/\bfiledot?com\b/i, 'FileCom'],
  [/\b321moviesfree\b/i, '321MoviesFree'],
  [/\bvoxzer\b/i, 'Voxzer'],
  [/\bhostingersite\b/i, 'Hostinger'],
  [/\bworkers\.dev\b/i, 'Cloudflare Worker'],
  [/\bnotorrent2?\.workers\.dev\b/i, 'NoTorrent CDN'],
  [/\b(?:www\.)?aqua-vulture/i, 'Hostinger'],
  [/\bvoxzer\b/i, 'Voxzer'],
  [/\bpkcdn\b/i, 'PKCDN'],
  [/\bnotorrent2?\.workers\.dev\b/i, 'NoTorrent CDN'],
];

function detectServerName(url) {
  if (!url) return '';
  if (/^magnet:/i.test(url)) return 'Torrent';
  // Try extracting real URL from proxy query params (?url=...)
  try {
    const parsed = new URL(url);
    const proxiedUrl = parsed.searchParams.get('url');
    if (proxiedUrl) {
      for (const [re, name] of SERVER_MAP) {
        if (re.test(proxiedUrl)) return name;
      }
      const proxyHost = new URL(proxiedUrl).hostname.replace(/^www\./, '');
      return proxyHost.substring(0, 25);
    }
  } catch {}
  for (const [re, name] of SERVER_MAP) {
    if (re.test(url)) return name;
  }
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host.substring(0, 25);
  } catch {
    return url.substring(0, 25);
  }
}

function normalizeQuality(text) {
  if (!text) return 'HD';
  const t = String(text).trim();
  if (/\b(4K|2160p?|UHD|Ultra\s*HD)\b/i.test(t)) return '4K';
  if (/\b(1080p?|FHD|Full\s*HD)\b/i.test(t)) return '1080p';
  if (/\b(720p?|HD\s*Ready)\b/i.test(t)) return '720p';
  if (/\b(480p?|SD)\b/i.test(t)) return '480p';
  if (/\b(CAM|TS|TC|SCR|R5|CAMRip|Telesync|HDTS|HDTC)\b/i.test(t)) return 'CAM';
  return 'HD';
}

function normalizeStream(stream, providerId, providerName, opts = {}) {
  if (!stream || typeof stream !== 'object') return null;
  const url = stream.url || stream.file || stream.src || stream.link;
  const hasPlayableTarget = url || stream.externalUrl || stream.infoHash;
  if (!hasPlayableTarget) return null;
  if (url && /youtube\.com|youtu\.be/i.test(url)) return null;

  const rawName = stream.name || '';
  const rawTitle = stream.title || '';
  let nameLines = rawName.split('\n');
  // Handle "Source • Server" format (NoTorrent: "NoTorrent • Audio latino")
  if (nameLines.length === 1 && nameLines[0].includes(' • ')) {
    const parts = nameLines[0].split(' • ');
    nameLines = [parts[0], parts.slice(1).join(' • ')];
  }
  const titleLines = rawTitle.split('\n');

  const sourceName = nameLines[0] || '';

  // If sourceName is generic (same as provider or a proxy name), use the real server/page name from URL
  let effectiveSource = sourceName;
  if (effectiveSource && url && (effectiveSource === providerName || effectiveSource === 'NoTorrent')) {
    try {
      const parsedUrl = new URL(url);
      const rawHost = parsedUrl.hostname.replace(/^www\./, '');
      const detectedServer = detectServerName(url);
      // Only use detected server if it's different from raw hostname (meaning it matched SERVER_MAP)
      // or if the proxied URL has a real source in query params
      if (detectedServer && detectedServer !== rawHost.substring(0, 25)) {
        effectiveSource = detectedServer;
      } else {
        // Check if URL has a ?url= parameter with a real source
        const proxiedUrl = parsedUrl.searchParams.get('url');
        if (proxiedUrl) {
          const proxyHost = new URL(proxiedUrl).hostname.replace(/^www\./, '').split('.')[0];
          if (proxyHost && proxyHost.length > 3) {
            effectiveSource = proxyHost.charAt(0).toUpperCase() + proxyHost.slice(1);
          }
        }
      }
    } catch {}
  }
  const serverName = nameLines.length > 1 ? nameLines.slice(1).join('\n') : '';

  // Detect language from audio descriptors in name/title
  const AUDIO_LANG_MAP = [
    [/[áa]udio latino/i, 'lat'],
    [/[áa]udio castellano/i, 'cast'],
    [/[áa]udio espa\u00F1ol|[áa]udio espanol/i, 'es'],
    [/[áa]udio ingl[eé]s|[áa]udio ingles/i, 'en'],
    [/[áa]udio japon[eé]s|[áa]udio japones/i, 'ja'],
    [/[áa]udio coreano/i, 'ko'],
    [/[áa]udio portugu[eê]s|[áa]udio portugues/i, 'pt'],
    [/[áa]udio franc[eé]s|[áa]udio frances/i, 'fr'],
    [/t[uü]rk[çc]e ses/i, 'tr'],
  ];
  let audioLang = '';
  for (const [re, lang] of AUDIO_LANG_MAP) {
    if (re.test(rawName + ' ' + rawTitle)) {
      audioLang = lang;
      break;
    }
  }

  // Extract and normalize quality from ANYWHERE in stream data
  const allText = [stream.quality, rawName, rawTitle].filter(Boolean).join(' ');
  const rawQuality = stream.quality
    || allText.match(/\b(4K|2160p?|UHD|Ultra\s*HD|1080p?|FHD|Full\s*HD|720p?|HD\s*Ready|480p?|SD|CAM|TS|TC|SCR|R5|CAMRip|Telesync|HDTS|HDTC)\b/i)?.[0]
    || '';
  const quality = normalizeQuality(rawQuality);

  // Language flags: from contentLanguage (authoritative), description (Alfa),
  // audio descriptor, or inline emoji in name/title
  const contentFlags = Array.isArray(opts.contentLanguage) ? langToFlags(opts.contentLanguage.join(',')) : '';
  const descriptionFlags = langToFlags(stream.description || '');
  const audioFlags = audioLang ? langToFlags(audioLang) : '';
  const inlineFlagLine = [...nameLines, ...titleLines].find(l => /[\u{1F1E6}-\u{1F1FF}]{2,}/u.test(l)) || '';
  const inlineFlags = inlineFlagLine ? (inlineFlagLine.match(/[\u{1F1E6}-\u{1F1FF}]{2,}/ug) || []).join('') : '';
  const flags = contentFlags || audioFlags || descriptionFlags || inlineFlags;

  // Type emoji
  const isTorrent = stream.infoHash || (serverName === 'torrent') || (url && /^magnet:/i.test(url));
  const isTorrentFile = !isTorrent && url && /\.torrent$/i.test(url);
  const typeEmoji = isTorrent ? '\u{1F9F2}' : isTorrentFile ? '\u{1F517}' : '\u{1F4FA}';

  // Provider label
  const isPigamer = providerId === 'pigamer37';
  const isAlfa = providerId === 'alfa-providers';
  let providerLabel;
  if (isPigamer && sourceName && !sourceName.match(/^\d+$/) && sourceName !== quality && sourceName !== providerName) {
    providerLabel = sourceName;
  } else if (isAlfa && sourceName && !sourceName.match(/^\d+$/) && sourceName !== quality && sourceName !== providerName) {
    providerLabel = `Alfa: ${sourceName}`;
  } else if (effectiveSource && !effectiveSource.match(/^\d+$/) && effectiveSource !== quality && effectiveSource !== providerName) {
    providerLabel = effectiveSource;
  } else if (sourceName && !sourceName.match(/^\d+$/) && sourceName !== quality && sourceName !== providerName) {
    providerLabel = sourceName;
  } else {
    providerLabel = providerName;
  }

  // Unified name (short, 2 lines)
  const name = `${typeEmoji} ${providerLabel}\n${quality}${flags ? ' ' + flags : ''}`;

  // ── Title (detailed) ──
  // Line 1: unified header
  const titleParts = [`${typeEmoji} ${quality} | ${providerLabel}`];

  // Collect all meaningful content from original name (lines 2+) and title
  const seen = new Set();
  const addLine = (text) => {
    const t = text.trim();
    if (t && !seen.has(t.toLowerCase()) && t !== providerLabel && t !== sourceName && t !== quality
        && !t.match(/^\s*(4K|UHD|2160p?|1080p?|FHD|720p?|480p?|HD|CAM|TS|TC|SCR|SD)\s*$/i)
        && !t.match(/^[\u{1F1E6}-\u{1F1FF}]{2,}$/u)) {
      seen.add(t.toLowerCase());
      titleParts.push(t);
    }
  };

  // From nameLines[1+] (strip quality and flags but keep server info)
  for (let i = 1; i < nameLines.length; i++) {
    const cleaned = nameLines[i]
      .replace(/\b(4K|2160p?|UHD|1080p?|FHD|720p?|480p?|CAM|TS|TC|SCR)\b/gi, '')
      .replace(/[\u{1F1E6}-\u{1F1FF}]{2,}/ug, '')
      .replace(/^[⚙️🔗📦\s]+/, '')
      .replace(/[\s,;]+/g, ' ')
      .trim();
    if (cleaned) addLine(cleaned);
  }

  // From titleLines (preserve original content like anime name, episode)
  for (const line of titleLines) {
    let cleaned = line
      .replace(/^[⚙️🔗📦\s]+/, '')
      .replace(/[\s,;]+/g, ' ')
      .trim();
    // Strip quality+separator prefix (e.g., "1080p | Notorrent Server" → "Notorrent Server")
    cleaned = cleaned.replace(/^\s*(4K|UHD|2160p?|1080p?|FHD|720p?|480p?|HD|CAM|TS|TC|SCR)\s*[|\-·]\s*/i, '').trim();
    if (cleaned) addLine(cleaned);
  }

  // URL server name detection (always add if found)
  if (url) {
    const serverName = detectServerName(url);
    if (serverName) addLine(serverName);
  }

  const hasInfoHash = !!stream.infoHash;

  // Torrent metadata enrichment
  if (hasInfoHash) {
    const metaParts = [];
    if (stream.source) metaParts.push(stream.source);
    if (stream.codec) metaParts.push(stream.codec);
    if (stream.audio) metaParts.push(stream.audio);
    if (stream.isHDR) metaParts.push('HDR');
    if (stream.isDV) metaParts.push('DV');
    if (stream.isRemux) metaParts.push('Remux');
    if (stream.isDualAudio) metaParts.push('Dual Audio');
    if (stream.verified) metaParts.push('Verified');
    if (metaParts.length) addLine(metaParts.join(' · '));
    const statsLine = `Seeds: ${stream.seeds || 0} · Size: ${stream.sizeFormatted || '?'}`;
    if (stream.seeds || stream.sizeFormatted) addLine(statsLine);
  }

  const title = titleParts.join('\n');

  const isDirectMedia = !hasInfoHash && url && /\.(mp4|m3u8|mkv|webm|avi)(\?|$)/i.test(url);
  const languages = media.language.detectFromStream({ name, title, description: stream.description, audioLang });
  const normalizedQuality = media.quality.normalizeQuality(quality);

  const originalHints = { ...(stream.behaviorHints || {}) };
  // Keep proxyHeaders for CDN auth (Stremio), only strip for NuvioTV compat
  if (process.env.STRIP_PROXY_HEADERS === 'true') {
    delete originalHints.proxyHeaders;
  }

  return {
    name,
    title,
    quality: normalizedQuality,
    languages,
    ...(url ? { url } : {}),
    ...(hasInfoHash ? { infoHash: stream.infoHash } : {}),
    ...(stream.fileIdx !== undefined ? { fileIdx: stream.fileIdx } : {}),
    ...(stream.sources ? { sources: stream.sources } : {}),
    ...(stream.externalUrl ? { externalUrl: stream.externalUrl } : {}),
    ...(stream.file ? { file: stream.file } : {}),
    ...(stream.seeds !== undefined ? { seeds: stream.seeds } : {}),
    ...(stream.sizeFormatted ? { sizeFormatted: stream.sizeFormatted } : {}),
    ...(stream.codec ? { codec: stream.codec } : {}),
    ...(stream.audio ? { audio: stream.audio } : {}),
    ...(stream.source ? { source: stream.source } : {}),
    ...(stream.isHDR ? { isHDR: true } : {}),
    ...(stream.isDV ? { isDV: true } : {}),
    ...(stream.isRemux ? { isRemux: true } : {}),
    ...(stream.isDualAudio ? { isDualAudio: true } : {}),
    ...(stream.verified ? { verified: true } : {}),
    behaviorHints: {
      ...originalHints,
      notWebReady: !hasInfoHash && !isDirectMedia,
      bingeGroup: stream.behaviorHints?.bingeGroup || `provider|${providerId}`,
    }
  };
}

function dedupeStreams(streams) {
  const seen = new Set();
  const out = [];
  for (const stream of streams) {
    const key = [
      stream.infoHash || '',
      stream.url || stream.externalUrl || '',
      stream.name || '',
      stream.title || ''
    ].join('|').toLowerCase();
    if (!key.trim() || seen.has(key)) continue;
    seen.add(key);
    out.push(stream);
  }
  return out;
}

async function runInChunks(items, size, worker, stopWhen) {
  const results = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    const settled = await Promise.allSettled(chunk.map(worker));
    for (const item of settled) {
      if (item.status === 'fulfilled' && Array.isArray(item.value)) {
        results.push(...item.value);
      }
    }
    if (stopWhen?.(results)) break;
  }
  return results;
}

async function resolveTMDbIdForProviders(rawId, mediaType) {
  if (!rawId) return null;
  if (!rawId.startsWith('tt')) return rawId;
  return await getTMDbId(rawId, mediaType);
}

async function scrapeLocalProviders(rawId, mediaType, type, season, episode, config, isAnime) {
  if (!config.enableLocal) return [];
  let tmdbId;
  const isIdAnime = type === 'anime' || anime.isAnimeId(rawId);
  if (isIdAnime) {
    tmdbId = await anime.resolveToTMDbId(rawId, mediaType, true);
  } else {
    tmdbId = await resolveTMDbIdForProviders(rawId, mediaType);
  }
  if (!tmdbId) return [];

  const providers = localProviders.filter(provider => {
    if (isAnime && !anime.isAnimeProvider(provider.id)) return false;
    if (!isAnime && anime.isAnimeProvider(provider.id)) return false;
    return providerSupportsType(provider, mediaType, type) && providerMatchesLang(provider, config) && health.isHealthy(provider.id);
  });
  if (!providers.length) return [];

  const streams = await runInChunks(
    providers,
    LOCAL_PROVIDER_CONCURRENCY,
    async (provider) => {
      const start = Date.now();
      try {
        const data = await withTimeout(
          Promise.resolve(provider.getStreams(String(tmdbId), mediaType, season, episode)),
          LOCAL_PROVIDER_TIMEOUT
        );
        const normalized = (Array.isArray(data) ? data : [])
          .map(stream => normalizeStream(stream, provider.id, provider.name, { contentLanguage: provider.contentLanguage }))
          .filter(Boolean);
        const elapsed = Date.now() - start;
        health.track(provider.id, normalized.length > 0, elapsed);
        if (normalized.length) {
          console.log(`  [${provider.name}] ${normalized.length} streams (${elapsed}ms)`);
        } else if (normalized.length === 0) {
          console.log(`  [${provider.name}] 0 streams (${elapsed}ms)`);
        }
        return normalized;
      } catch (e) {
        health.track(provider.id, false, Date.now() - start);
        console.warn(`  [${provider.name}] ${e.message}`);
        return [];
      }
    },
    results => results.length >= MAX_STREAM_RESULTS
  );

  return streams;
}

async function scrapeAlfa(rawId, mediaType, type, season, episode, config, isAnime) {
  if (!config.enableLocal || typeof scrapeAlfaProviders !== 'function') return [];
  if (!rawId) return [];
  let tmdbId;
  if (isAnime) {
    tmdbId = await anime.resolveToTMDbId(rawId, mediaType, true);
  } else {
    tmdbId = await resolveTMDbIdForProviders(rawId, mediaType);
  }
  if (!tmdbId) return [];
  const alfaType = anime.getAlfaCategory(isAnime, type);
  const start = Date.now();
  try {
    const data = await withTimeout(
      Promise.resolve(scrapeAlfaProviders(alfaType, String(tmdbId), season, episode)),
      LOCAL_PROVIDER_TIMEOUT
    );
    const streams = (Array.isArray(data) ? data : [])
      .map(stream => normalizeStream(stream, 'alfa-providers', 'Alfa Providers'))
      .filter(Boolean);
    health.track('alfa-providers', streams.length > 0, Date.now() - start);
    return streams;
  } catch (e) {
    health.track('alfa-providers', false, Date.now() - start);
    console.warn(`[alfa] ${e.message}`);
    return [];
  }
}



app.get('/health', (req, res) => {
  const report = health.getReport();
  const healthy = report.filter(p => p.healthy).length;
  const total = report.length;
  const mem = process.memoryUsage();
  res.json({
    status: healthy === total ? 'ok' : 'degraded',
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(mem.rss / 1024 / 1024) + 'MB',
      heapPercent: ((mem.heapUsed / mem.heapTotal) * 100).toFixed(0) + '%',
    },
    cache: {
      streamCache: streamCache.size,
      metaCache: metaCache.size,
    },
    providers: { total, healthy, failed: total - healthy },
    detail: report.sort((a, b) => a.failStreak - b.failStreak)
  });
});

// ─── Embed Resolver (Puppeteer) ────────────

app.get('/resolve-embed', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'missing url param' });
  // Try embed-resolver first, but only if it returns actual video URL
  const direct = await resolveEmbed(url);
  if (direct && /\.(m3u8|mp4|mkv|webm)($|\?)/i.test(direct) && !direct.includes('.css') && !direct.includes('.js')) {
    return res.json({ url: direct, method: 'embed-resolver' });
  }
  // Fall through to Puppeteer for proper JS resolution
  const start = Date.now();
  const puppeteerUrl = await puppeteerResolver.resolveEmbedWithBrowser(url);
  if (puppeteerUrl) return res.json({ url: puppeteerUrl, method: 'puppeteer', ms: Date.now() - start });
  res.json({ url: null, method: 'none', ms: Date.now() - start });
});

app.get('/pptr-test', async (req, res) => {
  // Test jkanime scraper directly
  const page = await (async () => {
    try {
      const jk = require('./src/anime/scrapers/jkanime');
      const html = await jk.fetchText ? null : null;
      // Test if page fetch works
      const url = 'https://jkanime.net/tensei-shitara-slime-datta-ken-4th-season/11/';
      const pptr = require('./src/puppeteer-resolver');
      const r = await pptr.resolveEmbedWithBrowser('https://sfastwish.com/e/0ky0tsum7i06', 15000);
      return { jkanime_ok: !!html, puppeteer_ok: !!r };
    } catch(e) { return { error: e.message }; }
  })();
  res.json(page);
});

// ─── JKAnime via Puppeteer ──────────────────

app.get('/stream/jkanime-pptr/:slug/:episode.json', async (req, res) => {
  const { slug, episode } = req.params;
  const streams = await pptrAnime.resolveJKAnime(slug, parseInt(episode) || 1);
  res.json({ streams: streams.map(s => normalizeStream(s, 'jkanime-pptr', 'JKAnime')).filter(Boolean) });
});

app.get('/stream/tioanime-pptr/:slug/:episode.json', async (req, res) => {
  const { slug, episode } = req.params;
  const streams = await pptrAnime.resolveTioAnime(slug, parseInt(episode) || 1);
  res.json({ streams: streams.map(s => normalizeStream(s, 'tioanime-pptr', 'TioAnime')).filter(Boolean) });
});

app.get('/stream/animeav1-pptr/:slug/:episode.json', async (req, res) => {
  const { slug, episode } = req.params;
  const streams = await pptrAnime.resolveAnimeAV1(slug, parseInt(episode) || 1);
  res.json({ streams: streams.map(s => normalizeStream(s, 'animeav1-pptr', 'AnimeAV1')).filter(Boolean) });
});

// ─── Manifest ─────────────────────────────

app.get('/manifest.json', async (req, res) => {
  const config = parseConfig(req);

  const enabledTypes = [];
  if (config.enableMovies) enabledTypes.push('movie');
  if (config.enableSeries || config.enableAnime) enabledTypes.push('series');
  if (config.enableAnime) enabledTypes.push('anime');
  if (!enabledTypes.includes('other')) enabledTypes.push('other');

  const streamPrefixes = ['ovn', 'tt'];
  if (config.enableBackend) streamPrefixes.push('tmdb');
  if (config.enableAnime) streamPrefixes.push(...anime.ANIME_PREFIXES);

  const metaPrefixes = ['ovn', 'tmdb', 'tt'];
  if (config.enableAnime) metaPrefixes.push(...anime.ANIME_PREFIXES);

  const allPrefixes = [...new Set([...streamPrefixes, ...metaPrefixes])];

  const catalogDefs = catalog.CATEGORIES
    .filter(c => !c.id.startsWith('tt-popular-')) // added later by getUniversalCatalogDefs
    .map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    extra: [{ name: 'search', isRequired: false }]
  }));
  if (config.enableAnime) {
    // Kitsu anime catalog (replaces Amatsu)
    catalogDefs.push(
      { id: 'kitsu-trending', name: 'Anime Kitsu', type: 'anime', extra: [{ name: 'search', isRequired: false }] },
    );
    // Local scraper catalogs (on-air)
    catalogDefs.push(
      { id: 'animeflv|onair', name: 'AnimeFLV En Emision', type: 'anime' },
    );
    // Search-based catalogs (require search query)
    catalogDefs.push(
      { id: 'jkanime|search', name: 'JKAnime (buscar)', type: 'anime', extra: [{ name: 'search', isRequired: true }] },
      { id: 'tioanime|search', name: 'TioAnime (buscar)', type: 'anime', extra: [{ name: 'search', isRequired: true }] },
    );
  }
  const universalDefs = catalog.getUniversalCatalogDefs(config);
  catalogDefs.push(...universalDefs);
  catalogDefs.push({
    id: 'tmdb-search',
    name: 'Búsqueda',
    type: 'movie',
    extra: [{ name: 'search', isRequired: true }]
  });

  const catalogTypes = [...new Set(catalogDefs.map(c => c.type))];
  const resources = [
    { name: 'stream', types: enabledTypes, idPrefixes: streamPrefixes },
    { name: 'meta', types: enabledTypes, idPrefixes: metaPrefixes },
    { name: 'catalog', types: catalogTypes, idPrefixes: ['ovn', 'tmdb', 'tt', 'tmdb-genre:', ...anime.ANIME_PREFIXES] }
  ];

  const manifest = {
    id: ADDON_ID,
    version: VERSION,
    name: 'Ovnivers Streams',
    description: `Stream provider: ${localProviders.length} local + Alfa + ${BACKEND_SCRAPERS.length} backend + Pigamer37 anime. Catálogo en español vía TMDB.`,
    logo: `${BASE_URL}/logo.png`,
    catalogs: catalogDefs,
    resources,
    types: enabledTypes,
    idPrefixes: allPrefixes,
    behaviorHints: {
      adult: false,
      configurable: true,
      configurationRequired: false
    }
  };
  if (config.exposeLocalScrapers) manifest.scrapers = manifestScrapers;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json(manifest);
});

// ─── Stream ───────────────────────────────

app.get('/stream/:type/:id/:extra(*).json', async (req, res) => {
  const { type, id } = req.params;
  const extraStr = req.params.extra || '';
  const extraParams = parsePathExtras(extraStr);
  req.query = { ...req.query, ...extraParams };
  handleStream(req, res, type, id);
});

app.get('/stream/:type/:id.json', async (req, res) => {
  handleStream(req, res, req.params.type, req.params.id);
});

async function handleStream(req, res, type, id) {
  const config = parseConfig(req);
  const parsed = parseStreamId(id, parseInt(req.query.season) || 1, parseInt(req.query.episode) || 1);
  const season = parsed.season;
  const episode = parsed.episode;

  if (!isTypeEnabled(type, config)) return res.json({ streams: [] });

  const mediaType = mapType(type);
  const rawId = extractId(parsed.contentId);

  // Reconstruir ID completo de anime si aplica (animeflv:naruto, no solo naruto)
  const animeFullId = (parsed.animePrefix && content.identifier.classifyByPrefix(parsed.animePrefix + parsed.contentId))
    ? parsed.animePrefix + parsed.contentId
    : null;

  const detection = await content.identifier.classify(id, type, mediaType);
  const isAnime = detection.isAnime;
  if (detection.method !== 'prefix' && detection.method !== 'id-format') {
    console.log(`[content:identify] ${id} → ${detection.contentType} (${detection.method}, confidence=${detection.confidence})`);
  }

  const configKey = `${config.quality}|${(config.langs||[]).join(',')}|${config.enableBackend}|${config.enableLocal}`;
  const ck = cacheKey(type, id, `${season}:${episode}_${configKey}`);
  if (!isAnime) {
    const cached = streamCache.get(ck);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json({ streams: cached.data.filter(s =>
        media.language.matchesFilter(s.languages, config.langs) &&
        media.quality.matchesFilter(s.quality, config.quality)
      ) });
    }
  }

  console.log(`[stream] ${type}/${id} media=${mediaType} rawId=${rawId} isAnime=${isAnime} s${season}e${episode}`);

  const streamTasks = [];

  // Para anime TMDB numerico (ovn:46260 / ovn-anime:46260), construir ID que los providers entiendan
  let animeProviderId = null;
  let animeTmdbId = detection.tmdbId || null;
  if (isAnime) {
    if (animeFullId && animeFullId.startsWith('ovn-anime:')) {
      animeProviderId = `tmdb:${animeFullId.substring(10)}`;
      animeTmdbId = parseInt(animeFullId.substring(10)) || null;
    } else if (animeFullId) {
      animeProviderId = animeFullId;
    } else if (animeTmdbId) {
      // IMDb-sourced anime (tt1234567) or TMDB-sourced with known TMDB ID
      animeProviderId = `tmdb:${animeTmdbId}`;
    } else if (rawId.match(/^\d+$/)) {
      animeProviderId = `tmdb:${rawId}`;
      animeTmdbId = parseInt(rawId) || null;
    } else {
      animeProviderId = rawId;
    }
  }

  if (isAnime && config.enableAnime) {
    // Use Puppeteer-powered resolvers for supported prefixes (slower but gets JS-rendered data)
    if (animeFullId) {
      if (animeFullId.startsWith('jkanime:')) {
        const slug = animeFullId.substring(8);
        streamTasks.push((async () => {
          const start = Date.now();
          try {
            const streams = await pptrAnime.resolveJKAnime(slug, episode || 1);
            const normalized = streams.map(s => normalizeStream(s, 'jkanime-pptr', 'JKAnime')).filter(Boolean);
            health.track('jkanime-pptr', normalized.length > 0, Date.now() - start);
            return normalized;
          } catch { health.track('jkanime-pptr', false, Date.now() - start); return []; }
        })());
      } else if (animeFullId.startsWith('tioanime:')) {
        const slug = animeFullId.substring(9);
        streamTasks.push((async () => {
          const start = Date.now();
          try {
            const streams = await pptrAnime.resolveTioAnime(slug, episode || 1);
            const normalized = streams.map(s => normalizeStream(s, 'tioanime-pptr', 'TioAnime')).filter(Boolean);
            health.track('tioanime-pptr', normalized.length > 0, Date.now() - start);
            return normalized;
          } catch { health.track('tioanime-pptr', false, Date.now() - start); return []; }
        })());
      } else if (animeFullId.startsWith('animeav1:')) {
        const slug = animeFullId.substring(9);
        streamTasks.push((async () => {
          const start = Date.now();
          try {
            const streams = await pptrAnime.resolveAnimeAV1(slug, episode || 1);
            const normalized = streams.map(s => normalizeStream(s, 'animeav1-pptr', 'AnimeAV1')).filter(Boolean);
            health.track('animeav1-pptr', normalized.length > 0, Date.now() - start);
            return normalized;
          } catch { health.track('animeav1-pptr', false, Date.now() - start); return []; }
        })());
      } else {
        // Fallback to Pigamer37 for other prefixes
        streamTasks.push((async () => {
          const start = Date.now();
          try {
            let finalId = animeProviderId;
            const resolvedId = await anime.resolveAnimeId(animeProviderId);
            if (resolvedId) finalId = resolvedId;
            const result = await anime.scrapers.getStreams(finalId, season, episode, (id, s, ep) => anime.pigamer.getStreams(id, s, ep));
            const normalized = result.streams.map(s => normalizeStream(s, 'pigamer37', 'Pigamer37')).filter(Boolean);
            health.track('pigamer37', normalized.length > 0, Date.now() - start);
            return normalized;
          } catch { health.track('pigamer37', false, Date.now() - start); return []; }
        })());
      }
    } else {
      // No anime prefix → Pigamer37
      streamTasks.push((async () => {
        const start = Date.now();
        try {
          const result = await anime.scrapers.getStreams(animeProviderId, season, episode, (id, s, ep) => anime.pigamer.getStreams(id, s, ep));
          const normalized = result.streams.map(s => normalizeStream(s, 'pigamer37', 'Pigamer37')).filter(Boolean);
          health.track('pigamer37', normalized.length > 0, Date.now() - start);
          return normalized;
        } catch { health.track('pigamer37', false, Date.now() - start); return []; }
      })());
    }
  }

  if (config.enableBackend) {
    streamTasks.push(...BACKEND_SCRAPERS.map(async (scraper) => {
      const start = Date.now();
      try {
        const results = await scraper.fn(rawId, mediaType, season, episode);
        const normalized = results.map(s => normalizeStream(s, scraper.name, scraper.name)).filter(Boolean);
        health.track(scraper.name, normalized.length > 0, Date.now() - start);
        return normalized;
      } catch { health.track(scraper.name, false, Date.now() - start); return []; }
    }));
  }

  if (config.enableLocal) {
    streamTasks.push(scrapeAlfa(animeProviderId || rawId, mediaType, type, season, episode, config, isAnime));
    streamTasks.push(scrapeLocalProviders(animeProviderId || rawId, mediaType, type, season, episode, config, isAnime));
  }

  streamTasks.push((async () => {
    const startTorrent = Date.now();
    const results = [];
    let searchTitle = ''; let imdbId = null; let year = null;
    let searchTitles = [];
    try {
      if (mediaType === 'movie' && (rawId.match(/^\d+$/) || rawId.startsWith('tt'))) {
        const movieTitles = await movies.resolveMovieTitles(rawId);
        if (movieTitles) {
          searchTitle = movieTitles.searchTitle || '';
          searchTitles = movieTitles.searchTitles || [];
          year = movieTitles.year || null;
          imdbId = movieTitles.imdbId || null;
        }
      } else if (isAnime) {
        const titlesId = animeTmdbId ? String(animeTmdbId) : (rawId.match(/^\d+$/) ? rawId : (animeProviderId || rawId));
        const anifeTitles = await anime.titles.resolveTitles(titlesId);
        if (anifeTitles) {
          searchTitles = anifeTitles.searchTitles || [];
          searchTitle = searchTitles[0] || '';
          year = anifeTitles.year ? (typeof anifeTitles.year === 'string' ? parseInt(anifeTitles.year) : anifeTitles.year) : null;
          if (!searchTitle && anifeTitles.titleEN) searchTitle = anifeTitles.titleEN;
          if (!searchTitle && anifeTitles.titleJA) searchTitle = anifeTitles.titleJA;
          console.log(`[torrent] anime titles for ${titlesId}: ${searchTitles.slice(0, 5).join(', ')}`);
        }
      } else if (rawId.match(/^\d+$/)) {
        const metaEN = await withTimeout(
          fetchAPI(`https://api.themoviedb.org/3/${mediaType==='tv'?'tv':'movie'}/${rawId}?api_key=${TMDB_KEY}&language=en`),
          4000
        );
        if (metaEN) {
          searchTitle = metaEN.title || metaEN.name || '';
          year = parseInt((metaEN.release_date || metaEN.first_air_date || '').substring(0, 4)) || null;
          imdbId = metaEN.imdb_id || null;
        }
      } else if (rawId.startsWith('tt')) {
        imdbId = rawId;
        const metaEN = await withTimeout(
          fetchAPI(`https://api.themoviedb.org/3/find/${rawId}?api_key=${TMDB_KEY}&external_source=imdb_id`),
          4000
        );
        if (metaEN) {
          const result = metaEN[mediaType === 'tv' ? 'tv_results' : 'movie_results']?.[0];
          if (result) {
            searchTitle = result.title || result.name || '';
            year = parseInt((result.release_date || result.first_air_date || '').substring(0, 4)) || null;
          }
        }
      }
    } catch {}
    if (searchTitle.length < 2) return results;
    try {
      let torrents = await torrentIndex.search(searchTitle, mediaType, imdbId, year, season, episode, isAnime);
      // For anime, try additional titles and merge results without touching torrent module
      if (isAnime && searchTitles.length > 1) {
        const seenHashes = new Set((torrents || []).map(t => t.infoHash).filter(Boolean));
        for (const altTitle of searchTitles.slice(1)) {
          if (altTitle.length < 3 || altTitle.toLowerCase() === searchTitle.toLowerCase()) continue;
          const altResults = await torrentIndex.search(altTitle, mediaType, imdbId, year, season, episode, isAnime);
          if (altResults?.length) {
            for (const t of altResults) {
              if (!seenHashes.has(t.infoHash)) {
                seenHashes.add(t.infoHash);
                torrents.push(t);
              }
            }
          }
        }
        // Re-sort merged results
        torrents.sort((a, b) => (b.score || b.seeds || 0) - (a.score || a.seeds || 0));
      }
      for (const t of (torrents || []).slice(0, 15)) {
        const metaParts = [];
        if (t.source) metaParts.push(t.source);
        if (t.codec) metaParts.push(t.codec);
        if (t.audio) metaParts.push(t.audio);
        if (t.isHDR) metaParts.push('HDR');
        if (t.isDV) metaParts.push('DV');
        if (t.isRemux) metaParts.push('Remux');
        if (t.isDualAudio) metaParts.push('Dual Audio');
        if (t.verified) metaParts.push('✓ Verified');
        const metaLine = metaParts.join(' · ');
        const statsLine = `👥 ${t.seeds || 0} seeds · 📦 ${t.sizeFormatted || '?'}`;
        const qualityLine = `${t.quality || 'HD'}${t.isHDR ? ' HDR' : ''} · 👥${t.seeds || 0} · 📦${t.sizeFormatted || '?'}`;
        const s = normalizeStream({
          url: t.magnet, infoHash: t.infoHash,
          name: `${t.indexer}\n${qualityLine}`,
          title: [t.title, metaLine, statsLine].filter(Boolean).join('\n'),
          quality: t.quality || 'HD',
          seeds: t.seeds || 0,
          sizeFormatted: t.sizeFormatted || '',
          codec: t.codec || '',
          audio: t.audio || '',
          source: t.source || '',
          isHDR: t.isHDR || false,
          isDV: t.isDV || false,
          isRemux: t.isRemux || false,
          isDualAudio: t.isDualAudio || false,
          verified: t.verified || false,
          sources: ['dht:' + t.infoHash],
          behaviorHints: { notWebReady: false },
        }, t.indexer.toLowerCase().replace(/[^a-z0-9]/g, ''), t.indexer);
        if (s) results.push(s);
      }
    } catch {}
    health.track('torrent-indexers', results.length > 0, Date.now() - startTorrent);
    return results;
  })());

  const rawStreams = [];
  const collectPromises = streamTasks.map(t =>
    t.then(r => { if (Array.isArray(r)) rawStreams.push(...r); }).catch(() => {})
  );
  await Promise.race([
    Promise.allSettled(collectPromises),
    new Promise(r => setTimeout(() => {
      console.log(`[stream] ${type}/${id} global timeout (${STREAM_GLOBAL_TIMEOUT}ms), collected ${rawStreams.length} partial results`);
      r();
    }, STREAM_GLOBAL_TIMEOUT))
  ]);

  let unique = media.dedup.dedupeWithPriority(rawStreams, true);

  const unresolved = unique.filter(s => s.url && !s.infoHash && s.behaviorHints?.notWebReady);
  if (unresolved.length > 0) {
    const toResolve = unresolved.slice(0, 8);
    const resolved = await Promise.race([
      Promise.allSettled(toResolve.map(s => resolveEmbed(s.url, BASE_URL))),
      new Promise(r => setTimeout(() => r('__EMBED_TIMEOUT__'), 6000))
    ]);
    let count = 0;
    if (resolved !== '__EMBED_TIMEOUT__' && Array.isArray(resolved)) {
      for (let i = 0; i < toResolve.length; i++) {
        if (resolved[i]?.status === 'fulfilled' && resolved[i].value && /\.(m3u8|mp4)/i.test(resolved[i].value)) {
          toResolve[i].url = resolved[i].value;
          toResolve[i].behaviorHints = { ...toResolve[i].behaviorHints, notWebReady: false };
          count++;
        }
      }
    }
    if (count > 0) console.log(`[stream] resolved ${count} embeds → ExoPlayer`);
    else if (resolved === '__EMBED_TIMEOUT__') console.log(`[stream] embed resolution timed out`);
  }

  unique = unique.slice(0, MAX_STREAM_RESULTS);
  console.log(`[stream] ${type}/${id} → ${unique.length} unique (${rawStreams.length} raw)`);

  if (!isAnime && unique.length > 0) cacheSet(streamCache, ck, { data: unique, time: Date.now() }, MAX_CACHE);

  const filtered = unique.filter(s =>
    media.language.matchesFilter(s.languages, config.langs) &&
    media.quality.matchesFilter(s.quality, config.quality)
  );

  filtered.sort((a, b) => {
    const la = media.language.computeScore(a.languages, config.langs);
    const lb = media.language.computeScore(b.languages, config.langs);
    if (la !== lb) return lb - la;
    return media.quality.compareQuality(a.quality, b.quality);
  });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL / 1000}`);
  res.json({ streams: filtered });
}

// ─── Catalog (TMDB en español) ────────────

app.get('/catalog/:type/:id/:extra(*).json', async (req, res) => {
  const { type, id } = req.params;
  const extraStr = req.params.extra || '';
  const extraParams = parsePathExtras(extraStr);
  req.query = { ...req.query, ...extraParams };
  handleCatalog(req, res, type, id);
});

app.get('/catalog/:type/:id.json', async (req, res) => {
  handleCatalog(req, res, req.params.type, req.params.id);
});

async function handleCatalog(req, res, type, id) {
  const config = parseConfig(req);
  if (!isTypeEnabled(type, config)) return res.json({ metas: [] });

  const search = req.query.search || '';
  const rawSkip = parseInt(req.query.skip) || 0;
  const ITEMS_PER_PAGE = 20;
  const page = parseInt(req.query.page) || (Math.floor(rawSkip / ITEMS_PER_PAGE) + 1);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  try {
    if (search) {
      const [tmdbResult, kitsuMetas] = await Promise.all([
        catalog.searchCatalog(search, page),
        catalog.searchKitsu(search).catch(() => [])
      ]);
      const allMetas = [...tmdbResult.metas, ...kitsuMetas];
      const seen = new Set();
      const deduped = [];
      for (const m of allMetas) {
        const key = m.id + '|' + m.name;
        if (!seen.has(key)) { seen.add(key); deduped.push(m); }
      }
      const result = { metas: deduped.slice(0, 50) };
      if (deduped.length >= 50) result.next = `/catalog/${type}/${id}/search=${encodeURIComponent(search)}/skip=${rawSkip + 50}.json`;
      return res.json(result);
    }
    if (id === 'tmdb-search') {
      return res.json({ metas: [] });
    }
    if (/^(animeflv|animeav1|henaojara|tioanime|jkanime)\|/.test(id)) {
      // Try local scrapers first for on-air catalogs
      const localResult = await anime.scrapers.getOnAirCatalog(id);
      if (localResult.metas.length) {
        return res.json(localResult);
      }
      // Try search-based catalogs
      if (id.endsWith('|search') && search) {
        const searchResult = await anime.scrapers.searchCatalog(id, search);
        return res.json(searchResult);
      }
      // Fallback to Pigamer37
      const result = await catalog.getPigamerCatalog(id, page);
      return res.json(result);
    }
    if (id === 'kitsu-trending') {
      if (search) {
        const kitsuMetas = await catalog.searchKitsu(search);
        const result = { metas: kitsuMetas.slice(0, 50) };
        return res.json(result);
      }
      const result = await catalog.getKitsuCatalog(id, page);
      return res.json(result);
    }
    if (id.startsWith('tt-popular-')) {
      const result = await catalog.getUniversalCatalog(id, page);
      if (result.next) result.next = `/catalog/${type}/${id}/skip=${rawSkip + ITEMS_PER_PAGE}.json`;
      return res.json(result);
    }
    const result = await catalog.getCatalog(id, page);
    if (result.next) {
      result.next = `/catalog/${type}/${id}/skip=${rawSkip + ITEMS_PER_PAGE}.json`;
    }
    res.json(result);
  } catch (e) {
    console.error('[catalog]', e.message);
    res.json({ metas: [] });
  }
}

// ─── Meta ─────────────────────────────────

app.get('/meta/:type/:id/:extra(*).json', async (req, res) => {
  const { type, id } = req.params;
  const extraStr = req.params.extra || '';
  const extraParams = parsePathExtras(extraStr);
  req.query = { ...req.query, ...extraParams };
  handleMeta(req, res, type, id);
});

app.get('/meta/:type/:id.json', async (req, res) => {
  handleMeta(req, res, req.params.type, req.params.id);
});

async function handleMeta(req, res, type, id) {
  const config = parseConfig(req);

  if (!isTypeEnabled(type, config)) return res.json({ meta: null });

  const mediaType = (type === 'series' || type === 'anime') ? 'tv' : 'movie';
  const rawId = extractId(id);

  const ck = cacheKey(type, id, 'meta');
  const cached = metaCache.get(ck);
  if (cached && Date.now() - cached.time < META_TTL) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json({ meta: cached.data });
  }

  try {
    const profile = await content.profile.resolveAny(rawId, mediaType, type);
    if (!profile) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json({ meta: null });
    }

    const stremioId = id.startsWith('tt') ? id :
      (id.startsWith('ovn:') ? id :
        (content.identifier.isAnimeId(id) ? id : `ovn:${profile.id}`));

    let meta = content.profile.buildStremioMeta(profile, stremioId);

    if (profile.mediaType === 'tv' && profile.seasons?.length) {
      try {
        const episodes = await content.episode.getAllEpisodes(profile.id, 10);
        if (episodes.length) meta.videos = content.episode.buildStremioVideos(episodes);
      } catch {}
    }

    cacheSet(metaCache, ck, { data: meta, time: Date.now() }, MAX_CACHE);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', `public, max-age=${META_TTL / 1000}`);
    res.json({ meta });
  } catch (e) {
    console.error('[meta]', e.message);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ meta: null });
  }
}

// ─── Configure (functional) ───────────────

app.get('/configure', (req, res) => {
  const currentConfig = parseConfig(req);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ovnivers — Configure</title>
<style>
:root {
  --bg: #0a0a0f;
  --surface: #13131a;
  --surface2: #1a1a24;
  --border: #252536;
  --text: #e4e4ed;
  --text2: #8888a0;
  --accent: #6c5ce7;
  --accent2: #a29bfe;
  --green: #00b894;
  --red: #e17055;
  --radius: 12px;
  --radius-sm: 8px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.container{width:100%;max-width:640px}
header{text-align:center;margin-bottom:28px}
header .logo{width:64px;height:64px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;overflow:hidden}header .logo img{width:100%;height:100%;object-fit:cover}
header h1{font-size:24px;font-weight:700;color:var(--text)}
header p{font-size:13px;color:var(--text2);margin-top:4px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:14px}
.card-header{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.card-header .icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px}
.card-header .icon.types{background:#6c5ce722;color:var(--accent2)}
.card-header .icon.quality{background:#00b89422;color:var(--green)}
.card-header .icon.lang{background:#fdcb6e22;color:#fdcb6e}
.card-header .icon.scrapers{background:#e1705522;color:var(--red)}
.card-header h3{font-size:14px;font-weight:600}
.toggle-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)}
.toggle-row:last-child{border-bottom:none}
.toggle-row .label{font-size:13px;color:var(--text)}
.toggle-row .hint{font-size:11px;color:var(--text2)}
.toggle{position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0}
.toggle input{opacity:0;width:0;height:0}
.toggle .track{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:var(--border);border-radius:24px;transition:.2s}
.toggle .track::before{position:absolute;content:"";height:18px;width:18px;left:3px;bottom:3px;background:var(--text2);border-radius:50%;transition:.2s}
.toggle input:checked+.track{background:var(--accent)}
.toggle input:checked+.track::before{transform:translateX(20px);background:#fff}
select{background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 12px;font-size:13px;width:140px;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238888a0' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;cursor:pointer}
.lang-grid{display:flex;flex-wrap:wrap;gap:6px}
.lang-chip{position:relative;cursor:pointer}
.lang-chip input{position:absolute;opacity:0}
.lang-chip span{display:inline-block;padding:6px 12px;border-radius:20px;font-size:12px;background:var(--surface2);color:var(--text2);border:1px solid var(--border);transition:.15s;user-select:none}
.lang-chip input:checked+span{background:var(--accent);color:#fff;border-color:var(--accent)}
.lang-chip:hover span{border-color:var(--accent2)}
.actions{display:flex;gap:10px;margin-top:24px}
.btn{padding:12px 24px;border-radius:var(--radius-sm);font-size:14px;font-weight:600;cursor:pointer;border:none;transition:.15s;flex:1;text-align:center}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:#7c6ff7;transform:translateY(-1px)}
.btn-secondary{background:var(--surface2);color:var(--text);border:1px solid var(--border)}
.btn-secondary:hover{background:var(--border)}
.result{margin-top:16px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;display:none}
.result.show{display:block}
.result .url{font-size:12px;color:var(--accent2);word-break:break-all;font-family:'SF Mono',monospace;background:var(--bg);padding:10px;border-radius:6px;margin-bottom:10px}
.result .hint{font-size:11px;color:var(--text2);margin-bottom:10px}
.result .copy-btn{background:var(--accent);color:#fff;border:none;padding:6px 14px;border-radius:6px;font-size:12px;cursor:pointer;margin-right:6px}
.result .copy-btn:hover{background:#7c6ff7}
.status{text-align:center;font-size:13px;margin-top:10px;min-height:20px}
.status.ok{color:var(--green)}
.status.err{color:var(--red)}
footer{text-align:center;margin-top:20px;font-size:11px;color:var(--text2)}
footer a{color:var(--accent2);text-decoration:none}
</style>
</head>
<body>
<div class="container">
<header>
  <div class="logo"><img src="/logo.png" alt="Ovnivers"></div>
  <h1>Ovnivers</h1>
  <p>Stream provider for external catalogs</p>
</header>

<form id="cfgForm" onsubmit="return false">

  <div class="card">
    <div class="card-header">
      <div class="icon types">&#9654;</div>
      <h3>Content Types</h3>
    </div>
    <div class="toggle-row">
      <div><div class="label">Movies</div><div class="hint">Hollywood, Bollywood, international films</div></div>
      <label class="toggle"><input type="checkbox" name="enableMovies"${currentConfig.enableMovies ? ' checked' : ''}><span class="track"></span></label>
    </div>
    <div class="toggle-row">
      <div><div class="label">TV Series</div><div class="hint">Shows, dramas, cartoons, documentaries</div></div>
      <label class="toggle"><input type="checkbox" name="enableSeries"${currentConfig.enableSeries ? ' checked' : ''}><span class="track"></span></label>
    </div>
    <div class="toggle-row">
      <div><div class="label">Anime</div><div class="hint">Japanese, Chinese (donghua), subtitled</div></div>
      <label class="toggle"><input type="checkbox" name="enableAnime"${currentConfig.enableAnime ? ' checked' : ''}><span class="track"></span></label>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="icon quality">&#9733;</div>
      <h3>Stream Quality</h3>
    </div>
    <div class="toggle-row">
      <div class="label">Preferred quality</div>
      <select name="quality">
        <option value="all"${currentConfig.quality === 'all' ? ' selected' : ''}>All qualities</option>
        <option value="4k"${currentConfig.quality === '4k' ? ' selected' : ''}>4K only</option>
        <option value="1080p"${currentConfig.quality === '1080p' ? ' selected' : ''}>1080p+</option>
        <option value="720p"${currentConfig.quality === '720p' ? ' selected' : ''}>720p+</option>
      </select>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="icon lang">&#127760;</div>
      <h3>Languages</h3>
    </div>
    <div class="lang-grid">
      ${Object.entries(ALL_LANGS).map(([code, name]) => `<label class="lang-chip"><input type="checkbox" name="lang_${code}"${currentConfig.langs.includes(code) ? ' checked' : ''}><span>${name}</span></label>`).join('')}
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="icon scrapers">&#9881;</div>
      <h3>Scrapers</h3>
    </div>
    <div class="toggle-row">
      <div><div class="label">Backend scrapers</div><div class="hint">2 server-side sources (2embed+Mirrors: 8 mirrors, PoseidonHD)</div></div>
      <label class="toggle"><input type="checkbox" name="enableBackend"${currentConfig.enableBackend ? ' checked' : ''}><span class="track"></span></label>
    </div>
    <div class="toggle-row">
      <div><div class="label">Local scrapers</div><div class="hint">Alfa providers + device-side scrapers</div></div>
      <label class="toggle"><input type="checkbox" name="enableLocal"${currentConfig.enableLocal ? ' checked' : ''}><span class="track"></span></label>
    </div>
  </div>

  <div class="actions">
    <button type="button" class="btn btn-primary" onclick="generateUrl()">Generate Install URL</button>
    <button type="button" class="btn btn-secondary" onclick="resetConfig()">Reset</button>
  </div>

  <div class="status" id="status"></div>
  <div class="result" id="result">
    <div class="url" id="urlText"></div>
    <div class="hint">Copy this URL into Nuvio Settings &rarr; Addons to install with your preferences.</div>
    <button type="button" class="copy-btn" onclick="copyUrl()">Copy URL</button>
    <button type="button" class="copy-btn" onclick="installStremio()">Open in Stremio</button>
  </div>
</form>

<footer>
  Ovnivers v${VERSION} &middot; <a href="https://github.com/leonidas10009/ovnivers" target="_blank">GitHub</a>
</footer>
</div>

<script>
(function() {
  var ALL_LANGS = ${JSON.stringify(Object.keys(ALL_LANGS))};
  var BASE_URL = '${BASE_URL}';
  var VERSION = '${VERSION}';

  function gid(id) { return document.getElementById(id); }

  function showStatus(msg, isError) {
    var s = gid('status');
    if (s) { s.className = 'status ' + (isError ? 'err' : 'ok'); s.textContent = msg; }
  }

  function getConfig() {
    var f = gid('cfgForm');
    if (!f) throw new Error('Form not found');
    var langs = [];
    ALL_LANGS.forEach(function(code) {
      var cb = f['lang_' + code];
      if (cb && cb.checked) langs.push(code);
    });
    return {
      enableMovies: !!f.enableMovies && !!f.enableMovies.checked,
      enableSeries: !!f.enableSeries && !!f.enableSeries.checked,
      enableAnime: !!f.enableAnime && !!f.enableAnime.checked,
      quality: (f.quality && f.quality.value) || 'all',
      langs: langs,
      enableBackend: !!f.enableBackend && !!f.enableBackend.checked,
      enableLocal: !!f.enableLocal && !!f.enableLocal.checked
    };
  }

  function params(cfg) {
    var p = [];
    if (cfg.enableMovies !== true) p.push('m=' + (cfg.enableMovies ? '1' : '0'));
    if (cfg.enableSeries !== true) p.push('s=' + (cfg.enableSeries ? '1' : '0'));
    if (cfg.enableAnime !== true) p.push('a=' + (cfg.enableAnime ? '1' : '0'));
    if (cfg.quality !== 'all') p.push('q=' + cfg.quality);
    var enabledLangs = cfg.langs.filter(function(l) { return ALL_LANGS.indexOf(l) !== -1; });
    if (enabledLangs.length < ALL_LANGS.length) p.push('l=' + enabledLangs.join(','));
    if (cfg.enableBackend !== true) p.push('b=' + (cfg.enableBackend ? '1' : '0'));
    if (cfg.enableLocal !== true) p.push('L=' + (cfg.enableLocal ? '1' : '0'));
    if (!p.length) return '';
    return 'c=1&' + p.join('&');
  }

  window.generateUrl = function() {
    try {
      var status = gid('status');
      var urlText = gid('urlText');
      var result = gid('result');
      if (!status || !urlText || !result) throw new Error('DOM missing');

      var cfg = getConfig();
      var qs = params(cfg);
      var url = BASE_URL + '/manifest.json' + (qs ? '?' + qs : '');
      var baseHost = BASE_URL.replace('https://', '').replace('http://', '');
      var stremioUrl = 'stremio://' + baseHost + '/manifest.json' + (qs ? '?' + qs : '');

      status.className = 'status ok';
      status.textContent = 'Install URL ready!';
      urlText.textContent = url;
      result.classList.add('show');

      window.__installUrl = url;
      window.__stremioUrl = stremioUrl;

      if (window.parent && window.parent !== window) {
        try {
          var b64 = btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));
          window.parent.postMessage({ type: 'configure', version: VERSION, configured: b64 }, '*');
        } catch(e) {}
      }
    } catch(e) {
      var s = gid('status');
      if (s) { s.className = 'status err'; s.textContent = 'Error: ' + e.message; }
      console.error('generateUrl error:', e);
    }
  };

  window.copyUrl = function() {
    var u = window.__installUrl;
    if (!u) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(u).catch(function() {
        showStatus('Select and copy the URL above');
      });
    } else {
      showStatus('Clipboard not available. Please copy the URL manually.');
    }
  };

  window.installStremio = function() {
    var u = window.__stremioUrl;
    if (u) window.open(u, '_blank');
  };

  window.resetConfig = function() {
    var f = gid('cfgForm');
    if (!f) return;
    if (f.enableMovies) f.enableMovies.checked = true;
    if (f.enableSeries) f.enableSeries.checked = true;
    if (f.enableAnime) f.enableAnime.checked = true;
    if (f.quality) f.quality.value = 'all';
    if (f.enableBackend) f.enableBackend.checked = true;
    if (f.enableLocal) f.enableLocal.checked = true;
    ALL_LANGS.forEach(function(code) {
      var cb = f['lang_' + code];
      if (cb) cb.checked = true;
    });
    showStatus('Reset to defaults. Generate URL to apply.');
    var r = gid('result');
    if (r) r.classList.remove('show');
  };

  showStatus('Ready - configure and click Generate Install URL');
})();
</script>
</body>
</html>`);
});

// ─── Health ───────────────────────────────

app.get('/', (req, res) => {
  const config = parseConfig(req);
  const report = health.getReport();
  const healthy = report.filter(p => p.healthy).length;
  res.json({
    name: 'Ovnivers Streams',
    version: VERSION,
    addon: ADDON_ID,
    config: { ...config, enableCatalogs: undefined },
    backendScrapers: BACKEND_SCRAPERS.map(s => s.name),
    animeProxy: 'Pigamer37 (AnimeFLV, AnimeAV1, TioAnime, Henaojara)',
    localScrapers: manifestScrapers.length,
    health: {
      endpoint: `${BASE_URL}/health`,
      providers: `${healthy}/${report.length} healthy (${report.filter(p => !p.healthy).length} degraded)`
    },
    uptime: Math.floor(process.uptime()),
    endpoints: {
      manifest: `${BASE_URL}/manifest.json`,
      configure: `${BASE_URL}/configure`,
      health: `${BASE_URL}/health`,
      stream: `${BASE_URL}/stream/:type/:id.json`,
      catalog: `${BASE_URL}/catalog/:type/:id.json`,
      meta: `${BASE_URL}/meta/:type/:id.json`
    }
  });
});

app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nOvnivers v${VERSION} ready`);
  console.log(`Backend:  ${BACKEND_SCRAPERS.map(s => s.name).join(', ')}`);
  console.log(`Anime:    Pigamer37 (AnimeFLV/AnimeAV1/TioAnime/Henaojara)`);
  console.log(`Local:    ${manifestScrapers.length} scrapers`);
  console.log(`Manifest: ${BASE_URL}/manifest.json`);
  console.log(`Health:   ${BASE_URL}/\n`);
});
