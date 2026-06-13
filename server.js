/**
 * Ovnivers — Stremio Addon Backend v1.4.18
 * Backend scrapers + server-side providers + Pigamer37 anime proxy
 * Configurable: language filter, quality preference, enable/disable scrapers
 */
try { require('dotenv').config(); } catch {}

const express = require('express');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

const catalog = require('./src/catalog/index');

const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const VERSION = '1.4.18';
const ADDON_ID = 'com.ovnivers.allinone';

const PIGAMER = 'https://pigamer37.alwaysdata.net';
const ANIME_PREFIXES = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:', 'anilist:', 'kitsu:', 'mal:', 'anidb:'];
const ANIME_SOURCE_PREFIXES = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:'];
const ANIME_XREF_PREFIXES = ['anilist:', 'kitsu:', 'mal:', 'anidb:'];

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

const LOCAL_PROVIDER_TIMEOUT = Number(process.env.LOCAL_PROVIDER_TIMEOUT || 12000);
const LOCAL_PROVIDER_CONCURRENCY = Number(process.env.LOCAL_PROVIDER_CONCURRENCY || 8);
const MAX_STREAM_RESULTS = Number(process.env.MAX_STREAM_RESULTS || 80);
let scrapeAlfaProviders = null;
const localProviders = [];

try {
  scrapeAlfaProviders = require('./providers/alfa-providers').default;
  console.log('Loaded Alfa provider bridge');
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
const CONSECUTIVE_FAIL_LIMIT = 5;
const providerStats = new Map();

function initProviderStats(provider) {
  const id = provider.id || provider.name || 'unknown';
  if (!providerStats.has(id)) {
    providerStats.set(id, { name: provider.name || id, total: 0, ok: 0, fail: 0, failStreak: 0, totalMs: 0, lastOk: 0, lastFail: 0 });
  }
  return providerStats.get(id);
}

function trackProviderResult(providerId, success, timeMs) {
  const stat = providerStats.get(providerId);
  if (!stat) return;
  stat.total++;
  stat.totalMs += timeMs;
  if (success) {
    stat.ok++;
    stat.failStreak = 0;
    stat.lastOk = Date.now();
  } else {
    stat.fail++;
    stat.failStreak++;
    stat.lastFail = Date.now();
  }
}

function isProviderHealthy(providerId) {
  const stat = providerStats.get(providerId);
  if (!stat) return true;
  return stat.failStreak < CONSECUTIVE_FAIL_LIMIT;
}

function getProviderReport() {
  const report = [];
  for (const [id, stat] of providerStats) {
    report.push({
      id, name: stat.name,
      total: stat.total, ok: stat.ok, fail: stat.fail,
      failStreak: stat.failStreak,
      avgMs: stat.total > 0 ? Math.round(stat.totalMs / stat.total) : 0,
      healthy: stat.failStreak < CONSECUTIVE_FAIL_LIMIT,
      lastOk: stat.lastOk ? new Date(stat.lastOk).toISOString() : null,
      lastFail: stat.lastFail ? new Date(stat.lastFail).toISOString() : null,
    });
  }
  return report;
}

localProviders.forEach(p => initProviderStats(p));
initProviderStats({ id: 'alfa-providers', name: 'Alfa Providers' });
initProviderStats({ id: 'backend-scrapers', name: 'Backend (2embed/VidSrc/Poseidon)' });
initProviderStats({ id: 'pigamer37', name: 'Pigamer37 (Anime Proxy)' });

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

function parse2embedHTML(html) {
  if (!html || typeof html !== 'string') return [];
  const streams = [];
  const seen = new Set();

  const m3u8Re = /https?:\/\/[^"'\s<>(){}[\]]+\.m3u8[^"'\s<>(){}[\]]*/gi;
  const mp4Re = /https?:\/\/[^"'\s<>(){}[\]]+\.mp4[^"'\s<>(){}[\]]*/gi;
  const iframeRe = /<iframe[^>]+src=["']([^"']+)["']/gi;
  const jsUrlRe = /(?:file|src|url|source|videoSrc|streamUrl)\s*[:=]\s*["']([^"']+)["']/gi;
  const dataSrcRe = /data-(?:src|file|url|video)=["']([^"']+)["']/gi;
  const jsonBlockRe = /"((?:https?:)?\/\/[^"]+(?:m3u8|mp4|mkv|embed|hls)[^"]*)"/gi;

  let m;
  while ((m = m3u8Re.exec(html)) !== null) {
    if (!seen.has(m[0])) { seen.add(m[0]); streams.push({ name: 'Adaptive', description: '2embed', url: m[0], behaviorHints: { notWebReady: true } }); }
  }
  while ((m = mp4Re.exec(html)) !== null) {
    if (!seen.has(m[0])) { seen.add(m[0]); streams.push({ name: 'HD', description: '2embed', url: m[0], behaviorHints: { notWebReady: true } }); }
  }
  while ((m = iframeRe.exec(html)) !== null) {
    const src = m[1];
    if (src && !seen.has(src) && (src.includes('m3u8') || src.includes('mp4') || src.includes('embed') || src.includes('player') || src.includes('stream'))) {
      seen.add(src); streams.push({ name: 'HD', description: '2embed', url: src, behaviorHints: { notWebReady: true } });
    }
  }
  while ((m = jsUrlRe.exec(html)) !== null) {
    const url = m[1];
    if (url && url.startsWith('http') && !seen.has(url)) {
      seen.add(url); streams.push({ name: 'HD', description: '2embed', url: url, behaviorHints: { notWebReady: true } });
    }
  }
  while ((m = dataSrcRe.exec(html)) !== null) {
    const url = m[1];
    if (url && url.startsWith('http') && !seen.has(url)) {
      seen.add(url); streams.push({ name: 'HD', description: '2embed', url: url, behaviorHints: { notWebReady: true } });
    }
  }
  while ((m = jsonBlockRe.exec(html)) !== null) {
    const url = m[1];
    const fullUrl = url.startsWith('//') ? 'https:' + url : url;
    if (!seen.has(fullUrl)) {
      seen.add(fullUrl); streams.push({ name: 'HD', description: '2embed', url: fullUrl, behaviorHints: { notWebReady: true } });
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
  return DEFAULT_CONFIG;
}

function matchesQuality(streamName, qualityPref) {
  if (qualityPref === 'all') return true;
  const name = (streamName || '').toLowerCase();
  const isLowQuality = /\b(cam|ts|tc|scr|r5|camrip|hdts|hdtc)\b/.test(name);
  if (qualityPref === '4k') return (name.includes('4k') || name.includes('2160') || name.includes('uhd')) && !isLowQuality;
  if (qualityPref === '1080p') return (name.includes('1080') || name.includes('fhd')) && !isLowQuality;
  if (qualityPref === '720p') return (name.includes('720') || name.includes('1080') || name.includes('4k') || name.includes('2160')) && !isLowQuality;
  return true;
}

// ─── TMDB Helpers ─────────────────────────

async function getIMDbId(tmdbId, mediaType) {
  const path = mediaType === 'tv' ? `tv/${tmdbId}/external_ids` : `movie/${tmdbId}`;
  const url = `https://api.themoviedb.org/3/${path}?api_key=${TMDB_KEY}&language=en`;
  const data = await fetchAPI(url);
  return data?.imdb_id || null;
}

async function getTMDbId(imdbId, mediaType) {
  const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id`;
  const data = await fetchAPI(url);
  const results = data?.[mediaType === 'tv' ? 'tv_results' : 'movie_results'];
  return results?.[0]?.id || null;
}

async function getTMDbMeta(tmdbId, mediaType) {
  const url = `https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_KEY}&language=es`;
  return await fetchAPI(url);
}

async function getTMDbEpisodes(tmdbId, seasons) {
  if (!seasons?.length) return [];
  const seasonNumbers = seasons
    .filter(s => s.season_number > 0 && s.episode_count > 0)
    .map(s => s.season_number)
    .slice(0, 10);
  const results = await Promise.allSettled(seasonNumbers.map(async sn => {
    const url = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${sn}?api_key=${TMDB_KEY}&language=es`;
    const data = await fetchAPI(url);
    return data?.episodes || [];
  }));
  const videos = [];
  for (const item of results) {
    if (item.status === 'fulfilled') {
      for (const ep of item.value) {
        if (ep.episode_number > 0) {
          videos.push({
            id: `ovn:${tmdbId}:${ep.season_number}:${ep.episode_number}`,
            title: ep.name || `Episodio ${ep.episode_number}`,
            season: ep.season_number,
            episode: ep.episode_number,
            released: ep.air_date || '',
            thumbnail: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null,
            overview: (ep.overview || '').substring(0, 500),
          });
        }
      }
    }
  }
  return videos;
}

// ─── Backend Scrapers ─────────────────────

async function scrape2embedVesy(rawId, mediaType, season, episode) {
  try {
    let tmdbId = rawId;
    if (rawId.startsWith('tt')) {
      tmdbId = await getTMDbId(rawId, mediaType);
      if (!tmdbId) return [];
    }
    let url = `https://streamsrcs.2embed.cc/vesy?tmdb=${tmdbId}`;
    if (mediaType === 'tv') url += `&s=${season}&e=${episode}`;
    const data = await fetchAPI(url, {}, 12000);
    if (typeof data === 'string') return parse2embedHTML(data);
    return parseSources(data).map(s => ({
      name: s.quality || s.label || s.resolution || 'HD',
      description: '2embed',
      url: s.url || s.link || s.file || s.src || s.stream || '',
      behaviorHints: { notWebReady: true }
    })).filter(s => s.url);
  } catch { return []; }
}

async function scrape2embedVsrc(rawId, mediaType, season, episode) {
  try {
    let imdbId = rawId;
    if (!rawId.startsWith('tt')) {
      imdbId = await getIMDbId(rawId, mediaType);
      if (!imdbId) return [];
    }
    let url = `https://streamsrcs.2embed.cc/vsrc?imdb=${imdbId}`;
    if (mediaType === 'tv') url += `&s=${season}&e=${episode}`;
    const data = await fetchAPI(url, {}, 12000);
    if (typeof data === 'string') return parse2embedHTML(data);
    return parseSources(data).map(s => ({
      name: s.quality || s.label || s.resolution || 'HD',
      description: '2embed (IMDb)',
      url: s.url || s.link || s.file || s.src || s.stream || '',
      behaviorHints: { notWebReady: true }
    })).filter(s => s.url);
  } catch { return []; }
}

async function scrapeVidSrcRip(tmdbId, mediaType, season, episode) {
  try {
    const epPath = mediaType === 'tv'
      ? `/tv/${tmdbId}/${season}/${episode}` : `/movie/${tmdbId}`;
    const data = await fetchAPI(`https://vidsrc.rip/api${epPath}`);
    if (!data || !data.sources) return [];
    return (Array.isArray(data.sources) ? data.sources : []).map(s => ({
      name: s.quality || 'HD', description: 'VidSrc',
      url: s.url || s.file || '', behaviorHints: { notWebReady: true }
    })).filter(s => s.url);
  } catch { return []; }
}

async function scrapePoseidonHD(rawId, mediaType, season, episode) {
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
    const searchUrl = `https://www.poseidonhd2.co/search?q=${encodeURIComponent(title)}`;
    const html = await fetchAPI(searchUrl, {}, 12000);
    if (!html || typeof html !== 'string') return [];
    const linkMatch = html.match(/href="(\/[^"]*pelicula[^"]*)"[^>]*>([^<]*)<\/a>/gi);
    if (!linkMatch) return [];
    let bestUrl = null, bestScore = 0;
    for (const m of linkMatch) {
      const href = m.match(/href="([^"]+)"/)?.[1];
      const txt = m.match(/>([^<]+)</)?.[1]?.trim();
      if (!href || !txt) continue;
      let s = txt.toLowerCase().includes(title.toLowerCase().substring(0, 5)) ? 1 : 0;
      if (year && txt.includes(year)) s += 0.2;
      if (s > bestScore) { bestScore = s; bestUrl = `https://www.poseidonhd2.co${href}`; }
    }
    if (!bestUrl) return [];
    const pageHtml = await fetchAPI(bestUrl, {}, 12000);
    if (!pageHtml || typeof pageHtml !== 'string') return [];
    const nextMatch = pageHtml.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
    if (!nextMatch) return [];
    const data = JSON.parse(nextMatch[1]);
    const players = data?.props?.pageProps?.post?.players;
    if (!players) return [];
    const streams = [];
    for (const [lang, arr] of Object.entries(players)) {
      if (Array.isArray(arr)) {
        for (const p of arr) {
          if (p.result) streams.push({
            name: p.quality || 'HD',
            description: `PoseidonHD [${lang}]`,
            url: p.result,
            behaviorHints: { notWebReady: true }
          });
        }
      }
    }
    return streams;
  } catch { return []; }
}

const BACKEND_SCRAPERS = [
  { name: '2embed (Vesy)', fn: scrape2embedVesy },
  { name: '2embed (Vsrc)', fn: scrape2embedVsrc },
  { name: 'VidSrc', fn: scrapeVidSrcRip },
  { name: 'PoseidonHD', fn: scrapePoseidonHD },
];

// ─── Pigamer37 Proxy ────────────────────

function isAnimeId(id) {
  return ANIME_PREFIXES.some(p => id.startsWith(p) || id.startsWith(p.replace(':', '|')));
}

function isAnimeSourceId(id) {
  return ANIME_SOURCE_PREFIXES.some(p => id.startsWith(p) || id.startsWith(p.replace(':', '|')));
}

function isAnimeXrefId(id) {
  return ANIME_XREF_PREFIXES.some(p => id.startsWith(p) || id.startsWith(p.replace(':', '|')));
}

async function resolveAnimeId(id) {
  if (isAnimeSourceId(id)) return id;
  if (!isAnimeXrefId(id)) return null;
  try {
    const meta = await proxyPigamer(`/meta/series/${encodeURIComponent(fixPigamerId(id))}.json`);
    if (meta?.meta?.id && isAnimeSourceId(meta.meta.id)) {
      console.log(`[anime] resolved ${id} → ${meta.meta.id}`);
      return meta.meta.id;
    }
  } catch {}
  return null;
}

function fixPigamerId(id) {
  return id;
}

const animeTMDbCache = new Map();
const ANIME_TMDB_CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

async function getAnimeTMDbId(id) {
  const cached = animeTMDbCache.get(id);
  if (cached && Date.now() - cached.time < ANIME_TMDB_CACHE_TTL) return cached.tmdbId;
  try {
    const meta = await proxyPigamer(`/meta/series/${encodeURIComponent(id)}.json`);
    if (meta?.meta) {
      let tmdbId = null;
      if (Array.isArray(meta.meta.links)) {
        for (const link of meta.meta.links) {
          if (link.category === 'tmdb' || (typeof link.name === 'string' && link.name.toLowerCase().includes('tmdb'))) {
            const url = link.url || '';
            const match = url.match(/\/(\d+)$/);
            if (match) { tmdbId = match[1]; break; }
          }
        }
      }
      if (!tmdbId && meta.meta.tmdb_id) tmdbId = String(meta.meta.tmdb_id);
      if (tmdbId) {
        animeTMDbCache.set(id, { tmdbId, time: Date.now() });
        return tmdbId;
      }
    }
  } catch {}
  return null;
}

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

async function proxyPigamer(pathSuffix, timeout = 20000) {
  return await fetchAPI(`${PIGAMER}${pathSuffix}`, {}, timeout);
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
  let contentId = id;
  let season = fallbackSeason;
  let episode = fallbackEpisode;

  if (id.startsWith('tmdb:') || id.startsWith('ovn:')) {
    const prefix = id.startsWith('tmdb:') ? 'tmdb:' : 'ovn:';
    const parts = id.split(':');
    contentId = parts.length > 1 ? parts[1] : id.substring(prefix.length);
    if (parts.length >= 4) {
      season = parseInt(parts[2]) || season;
      episode = parseInt(parts[3]) || episode;
    }
  } else {
    const match = id.match(/^(tt\d+):(\d+):(\d+)$/);
    if (match) {
      contentId = match[1];
      season = parseInt(match[2]) || season;
      episode = parseInt(match[3]) || episode;
    }
  }

  return { contentId, season, episode };
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
  const name = `${providerLabel}\n${quality}${flags ? ' ' + flags : ''}`;

  // ── Title (detailed) ──
  // Line 1: unified header
  const titleParts = [`${quality} | ${providerLabel}`];

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

  const title = titleParts.join('\n');

  const hasInfoHash = !!stream.infoHash;
  return {
    name,
    title,
    ...(!hasInfoHash && url ? { url } : {}),
    ...(hasInfoHash ? { infoHash: stream.infoHash } : {}),
    ...(stream.fileIdx !== undefined ? { fileIdx: stream.fileIdx } : {}),
    ...(stream.sources ? { sources: stream.sources } : {}),
    ...(stream.externalUrl ? { externalUrl: stream.externalUrl } : {}),
    ...(stream.file ? { file: stream.file } : {}),
    behaviorHints: {
      notWebReady: !hasInfoHash,
      bingeGroup: `provider|${providerId}`,
      ...(stream.behaviorHints || {})
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

async function scrapeLocalProviders(rawId, mediaType, type, season, episode, config) {
  if (!config.enableLocal) return [];
  let tmdbId;
  const isIdAnime = type === 'anime' || ANIME_PREFIXES.some(p => rawId.startsWith(p.replace(':', '|')) || rawId.startsWith(p));
  if (isIdAnime) {
    if (rawId.match(/^\d+$/)) {
      tmdbId = rawId;
    } else {
      const proxyId = await resolveAnimeId(rawId) || rawId;
      tmdbId = await getAnimeTMDbId(proxyId);
    }
  } else {
    tmdbId = await resolveTMDbIdForProviders(rawId, mediaType);
  }
  if (!tmdbId) return [];

  const providers = localProviders.filter(provider =>
    providerSupportsType(provider, mediaType, type) && providerMatchesLang(provider, config) && isProviderHealthy(provider.id)
  );
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
        trackProviderResult(provider.id, normalized.length > 0, elapsed);
        if (normalized.length) {
          console.log(`  [${provider.name}] ${normalized.length} streams (${elapsed}ms)`);
        } else if (normalized.length === 0) {
          console.log(`  [${provider.name}] 0 streams (${elapsed}ms)`);
        }
        return normalized;
      } catch (e) {
        trackProviderResult(provider.id, false, Date.now() - start);
        console.warn(`  [${provider.name}] ${e.message}`);
        return [];
      }
    },
    results => results.length >= MAX_STREAM_RESULTS
  );

  return streams;
}

async function scrapeAlfa(rawId, mediaType, type, season, episode, config) {
  if (!config.enableLocal || typeof scrapeAlfaProviders !== 'function') return [];
  if (!rawId) return [];
  let tmdbId;
  if (type === 'anime') {
    // If rawId is already a numeric TMDB ID, use it directly (no Pigamer37 meta needed)
    if (rawId.match(/^\d+$/)) {
      tmdbId = rawId;
    } else {
      const proxyId = await resolveAnimeId(rawId) || rawId;
      tmdbId = await getAnimeTMDbId(proxyId);
      // Fallback: pass anime slug directly to Alfa (resolveTitle handles it natively)
      if (!tmdbId) tmdbId = proxyId;
    }
  } else {
    tmdbId = await resolveTMDbIdForProviders(rawId, mediaType);
  }
  if (!tmdbId) return [];
  const start = Date.now();
  try {
    const data = await withTimeout(
      Promise.resolve(scrapeAlfaProviders(type === 'anime' ? 'anime' : (isSeriesType(type) ? 'series' : type), String(tmdbId), season, episode)),
      LOCAL_PROVIDER_TIMEOUT
    );
    const streams = (Array.isArray(data) ? data : [])
      .map(stream => normalizeStream(stream, 'alfa-providers', 'Alfa Providers'))
      .filter(Boolean);
    trackProviderResult('alfa-providers', streams.length > 0, Date.now() - start);
    return streams;
  } catch (e) {
    trackProviderResult('alfa-providers', false, Date.now() - start);
    console.warn(`[alfa] ${e.message}`);
    return [];
  }
}



app.get('/health', (req, res) => {
  const report = getProviderReport();
  const healthy = report.filter(p => p.healthy).length;
  const total = report.length;
  res.json({
    status: healthy === total ? 'ok' : 'degraded',
    uptime: process.uptime(),
    providers: { total, healthy, failed: total - healthy },
    detail: report.sort((a, b) => a.failStreak - b.failStreak)
  });
});

// ─── Manifest ─────────────────────────────

app.get('/manifest.json', async (req, res) => {
  const config = parseConfig(req);

  const enabledTypes = [];
  if (config.enableMovies) enabledTypes.push('movie');
  if (config.enableSeries || config.enableAnime) enabledTypes.push('series');
  if (!enabledTypes.includes('other')) enabledTypes.push('other');

  const streamPrefixes = ['ovn'];
  if (config.enableBackend) streamPrefixes.push('tt', 'tmdb');
  if (config.enableAnime) streamPrefixes.push(...ANIME_PREFIXES);

  const metaPrefixes = ['ovn', 'tmdb'];
  if (config.enableBackend) metaPrefixes.push('tt');
  if (config.enableAnime) metaPrefixes.push(...ANIME_PREFIXES);

  const allPrefixes = [...new Set([...streamPrefixes, ...metaPrefixes])];

  const resources = [
    { name: 'stream', types: enabledTypes, idPrefixes: streamPrefixes },
    { name: 'meta', types: enabledTypes, idPrefixes: metaPrefixes }
  ];

  const catalogDefs = catalog.CATEGORIES.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    extra: [{ name: 'search', isRequired: false }]
  }));
  if (config.enableAnime) {
    catalogDefs.push(
      { id: 'amatsu_seasonal_series', name: 'Anime de Temporada (Amatsu)', type: 'anime', extra: [{ name: 'search', isRequired: false }] },
      { id: 'amatsu_airing_series', name: 'Anime Emitiéndose (Amatsu)', type: 'anime', extra: [{ name: 'search', isRequired: false }] },
      { id: 'amatsu_trending_series', name: 'Anime Tendencias (Amatsu)', type: 'anime', extra: [{ name: 'search', isRequired: false }] },
      { id: 'amatsu_top_series', name: 'Anime Mejor Valorado (Amatsu)', type: 'anime', extra: [{ name: 'search', isRequired: false }] }
    );
  }
  catalogDefs.push({
    id: 'tmdb-search',
    name: 'Búsqueda',
    type: 'movie',
    extra: [{ name: 'search', isRequired: true }]
  });

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
  res.setHeader('Cache-Control', 'public, max-age=3600');
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

  // Detect anime: ID prefix or TMDB genre 16 (Animation)
  let isAnime = isAnimeId(id);
  if (!isAnime && config.enableAnime && mediaType === 'tv' && rawId.match(/^\d+$/)) {
    try {
      const tmdb = await withTimeout(fetchAPI(
        `https://api.themoviedb.org/3/tv/${rawId}?api_key=${TMDB_KEY}&language=en`
      ), 5000);
      isAnime = !!tmdb?.genres?.some(g => g.id === 16);
      if (isAnime) console.log(`  [anime] detected from TMDB genre (id=${rawId})`);
    } catch {}
  }

  const ck = cacheKey(type, id, `${season}:${episode}`);
  if (!isAnime) {
    const cached = streamCache.get(ck);
    if (cached && Date.now() - cached.time < CACHE_TTL) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json({ streams: filterStreams(cached.data, config) });
    }
  }

  console.log(`[stream] ${type}/${id} media=${mediaType} rawId=${rawId} isAnime=${isAnime} s${season}e${episode}`);

  const streams = [];
  const streamTasks = [];

  // ── Pigamer37: solo para anime (FLV/AV1/TioAnime/Henaojara) ──
  if (isAnime && config.enableAnime) {
    streamTasks.push((async () => {
      const start = Date.now();
      try {
        const resolvedId = await resolveAnimeId(id);
        const proxyId = resolvedId || (rawId.match(/^\d+$/) ? `tmdb:${rawId}` : rawId);
        const data = await proxyPigamer(`/stream/series/${encodeURIComponent(proxyId)}.json?season=${season}&episode=${episode}`);
        const pigStreams = parseSources(data);
        trackProviderResult('pigamer37', pigStreams.length > 0, Date.now() - start);
        if (pigStreams.length) console.log(`  [Pigamer37] ${pigStreams.length} streams (s${season}e${episode})`);
        return pigStreams.map(s => normalizeStream(s, 'pigamer37', 'Pigamer37')).filter(Boolean);
      } catch (e) {
        trackProviderResult('pigamer37', false, Date.now() - start);
        console.warn(`  [Pigamer37] ${e.message}`);
        return [];
      }
    })());
  }

  // ── Backend scrapers: para todo contenido ──
  if (config.enableBackend) {
    streamTasks.push(...BACKEND_SCRAPERS.map(async (scraper) => {
      const start = Date.now();
      try {
        const results = await scraper.fn(rawId, mediaType, season, episode);
        trackProviderResult('backend-scrapers', results.length > 0, Date.now() - start);
        if (results.length > 0) console.log(`  [${scraper.name}] ${results.length} streams (${Date.now() - start}ms)`);
        return results.map(s => normalizeStream(s, scraper.name, scraper.name)).filter(Boolean);
      } catch {
        trackProviderResult('backend-scrapers', false, Date.now() - start);
        return [];
      }
    }));
  }

  // ── Local providers: Alfa (categoría principal) + Hermes ──
  if (config.enableLocal) {
    streamTasks.push(scrapeAlfa(rawId, mediaType, type, season, episode, config));
    streamTasks.push(scrapeLocalProviders(rawId, mediaType, type, season, episode, config));
    // Alfa anime: siempre para TV (scraper, no contamina si no encuentra)
    if (config.enableAnime && mediaType === 'tv') {
      streamTasks.push(scrapeAlfa(rawId, 'tv', 'anime', season, episode, config));
    }
  }

  const settled = await Promise.allSettled(streamTasks);
  for (const item of settled) {
    if (item.status === 'fulfilled' && Array.isArray(item.value)) streams.push(...item.value);
  }

  // Retry backend with alt ID if empty
  if (streams.length === 0 && config.enableBackend) {
    const altId = !rawId.startsWith('tt') ? await getIMDbId(rawId, mediaType) : await getTMDbId(rawId, mediaType);
    if (altId) {
      console.log(`[stream] retry with alt ID: ${altId}`);
      await Promise.allSettled(BACKEND_SCRAPERS.map(async (scraper) => {
        try {
          const results = await scraper.fn(altId, mediaType, season, episode);
          if (results.length > 0) streams.push(...results.map(s => normalizeStream(s, scraper.name, scraper.name)).filter(Boolean));
        } catch {}
      }));
    }
  }

  const uniqueStreams = dedupeStreams(streams).slice(0, MAX_STREAM_RESULTS);
  console.log(`[stream] ${type}/${id} → ${uniqueStreams.length} unique (${streams.length} raw)`);
  if (!isAnime) cacheSet(streamCache, ck, { data: uniqueStreams, time: Date.now() }, MAX_CACHE);

  const filtered = filterStreams(uniqueStreams, config);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL / 1000}`);
  res.json({ streams: filtered });
}

function filterStreams(streams, config) {
  const enabledLangs = new Set((config.langs || []).map(l => l.toLowerCase()));
  return streams.filter(s => {
    if (!matchesQuality(s.name, config.quality)) return false;
    if (enabledLangs.size === 0 || enabledLangs.has('*')) return true;
    // Extract flags from stream name (e.g. "1080p 🇯🇵🇪🇸") and match against enabled languages
    const nameFlags = (s.name || '').match(/[\u{1F1E6}-\u{1F1FF}]{2}/ug) || [];
    return nameFlags.length === 0 || nameFlags.some(f => {
      for (const [code, flag] of Object.entries(LANG_TO_FLAG)) {
        if (flag === f && enabledLangs.has(code.replace(/['"]/g, ''))) return true;
      }
      return false;
    });
  });
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
      const [tmdbResult, anilistMetas] = await Promise.all([
        catalog.searchCatalog(search, page),
        catalog.searchAnilist(search)
      ]);
      const allMetas = [...tmdbResult.metas, ...anilistMetas];
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
    if (id.startsWith('amatsu_')) {
      const result = await catalog.getAmatsuCatalog(id, page);
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

  // Anime meta → Amatsu (para anilist:) o Pigamer37 (para otros)
  if (isAnimeId(id)) {
    if (!config.enableAnime) return res.json({ meta: null });
    try {
      // Para anilist: IDs, intentar Amatsu primero (datos más ricos con synonyms)
      if (id.startsWith('anilist:')) {
        const amatsu = await catalog.getAmatsuMeta(id);
        if (amatsu) {
          const meta = {
            id: `anilist:${amatsu.anilistId.replace('anilist:', '')}`,
            type: 'series',
            name: amatsu.name || amatsu.englishName || 'Unknown',
            poster: amatsu.poster || null,
            background: amatsu.background || null,
            description: (amatsu.description || '').substring(0, 2000),
            releaseInfo: amatsu.year || '',
            imdbRating: amatsu.score || null,
            genres: [],
          };
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', `public, max-age=${META_TTL / 1000}`);
          return res.json({ meta });
        }
      }
      const proxyType = 'series';
      const data = await proxyPigamer(`/meta/${proxyType}/${encodeURIComponent(id)}.json`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', `public, max-age=${META_TTL / 1000}`);
      return res.json(data || { meta: null });
    } catch (e) {
      console.error('[meta:anime]', e.message);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json({ meta: null });
    }
  }

  // Meta: siempre disponible para TMDB IDs, independiente de enableBackend
  // (el catálogo ya tiene los datos correctos, solo necesitamos enriquecer la ficha)

  let contentId = extractId(id);
  let mediaType = type === 'series' ? 'tv' : 'movie';

  const ck = cacheKey(type, id, 'meta');
  const cached = metaCache.get(ck);
  if (cached && Date.now() - cached.time < META_TTL) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json({ meta: cached.data });
  }

  try {
    if (id.startsWith('tt')) {
      const converted = await getTMDbId(id, mediaType);
      if (converted) contentId = converted;
    }
    let data = await getTMDbMeta(contentId, mediaType);
    // Fallback: TMDB IDs overlap between movie and TV.
    // If the requested type returns no data, try the alternative type.
    if (!data) {
      mediaType = mediaType === 'tv' ? 'movie' : 'tv';
      data = await getTMDbMeta(contentId, mediaType);
    }
    if (!data) { res.setHeader('Access-Control-Allow-Origin', '*'); return res.json({ meta: null }); }
    const metaIdPrefix = id.startsWith('ovn:') ? 'ovn:' : 'tmdb:';
    const meta = {
      id: `${metaIdPrefix}${data.id}`, type: mediaType === 'tv' ? 'series' : 'movie',
      name: data.title || data.name || 'Unknown',
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      background: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      description: data.overview || '',
      releaseInfo: (data.release_date || data.first_air_date || '').substring(0, 4),
      runtime: data.runtime ? `${data.runtime} min` : null,
      imdbRating: data.vote_average ? String(data.vote_average) : null,
      genres: (data.genres || []).map(g => g.name),
    };
    if (mediaType === 'tv' && data.seasons?.length) {
      const episodes = await getTMDbEpisodes(data.id, data.seasons);
      if (episodes.length) meta.videos = episodes;
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
header .logo{width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,var(--accent),#e84393);display:inline-flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;margin-bottom:12px}
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
  <div class="logo">O</div>
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
      <div><div class="label">Backend scrapers</div><div class="hint">4 server-side sources (2embed Vesy, 2embed Vsrc, VidSrc, PoseidonHD)</div></div>
      <label class="toggle"><input type="checkbox" name="enableBackend"${currentConfig.enableBackend ? ' checked' : ''}><span class="track"></span></label>
    </div>
    <div class="toggle-row">
      <div><div class="label">Local scrapers</div><div class="hint">Alfa providers + device-side scrapers</div></div>
      <label class="toggle"><input type="checkbox" name="enableLocal"${currentConfig.enableLocal ? ' checked' : ''}><span class="track"></span></label>
    </div>
  </div>

  <div class="actions">
    <button class="btn btn-primary" onclick="generateUrl()">Generate Install URL</button>
    <button class="btn btn-secondary" onclick="resetConfig()">Reset</button>
  </div>

  <div class="status" id="status"></div>
  <div class="result" id="result">
    <div class="url" id="urlText"></div>
    <div class="hint">Copy this URL into Nuvio Settings &rarr; Addons to install with your preferences.</div>
    <button class="copy-btn" onclick="copyUrl()">Copy URL</button>
    <button class="copy-btn" onclick="installStremio()">Open in Stremio</button>
  </div>
</form>

<footer>
  Ovnivers v${VERSION} &middot; <a href="https://github.com/leonidas10009/ovnivers" target="_blank">GitHub</a>
</footer>
</div>

<script>
function getConfig() {
  const f = document.getElementById('cfgForm');
  const langs = [];
  ${JSON.stringify(Object.keys(ALL_LANGS))}.forEach(code => {
    const cb = f['lang_' + code];
    if (cb && cb.checked) langs.push(code);
  });
  return {
    enableMovies: f.enableMovies.checked,
    enableSeries: f.enableSeries.checked,
    enableAnime: f.enableAnime.checked,
    quality: f.quality.value,
    langs: langs,
    enableBackend: f.enableBackend.checked,
    enableLocal: f.enableLocal.checked
  };
}

function generateUrl() {
  const cfg = getConfig();
  const json = JSON.stringify(cfg);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  const url = '${BASE_URL}/manifest.json?configured=' + b64;
  const stremioUrl = 'stremio://${BASE_URL}/manifest.json?configured=' + b64;

  document.getElementById('status').className = 'status ok';
  document.getElementById('status').textContent = 'Install URL ready!';
  document.getElementById('urlText').textContent = url;
  document.getElementById('result').classList.add('show');

  window.__installUrl = url;
  window.__stremioUrl = stremioUrl;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'configure', version: '${VERSION}', configured: b64 }, '*');
  }
}

function copyUrl() {
  navigator.clipboard.writeText(window.__installUrl).then(() => {
    document.getElementById('status').textContent = 'Copied to clipboard!';
  }).catch(() => {
    document.getElementById('status').textContent = 'Select and copy the URL above';
  });
}

function installStremio() {
  window.open(window.__stremioUrl, '_blank');
}

function resetConfig() {
  const f = document.getElementById('cfgForm');
  f.enableMovies.checked = true;
  f.enableSeries.checked = true;
  f.enableAnime.checked = true;
  f.quality.value = 'all';
  f.enableBackend.checked = true;
  f.enableLocal.checked = true;
  ${JSON.stringify(Object.keys(ALL_LANGS))}.forEach(code => {
    const cb = f['lang_' + code];
    if (cb) cb.checked = true;
  });
  document.getElementById('status').className = 'status ok';
  document.getElementById('status').textContent = 'Reset to defaults. Generate URL to apply.';
  document.getElementById('result').classList.remove('show');
}
</script>
</body>
</html>`);
});

// ─── Health ───────────────────────────────

app.get('/', (req, res) => {
  const config = parseConfig(req);
  const report = getProviderReport();
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
