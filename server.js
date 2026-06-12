/**
 * Ovnivers — Stremio Addon Backend v1.2.5
 * Backend scrapers + server-side providers + Pigamer37 anime proxy
 * Configurable: language filter, quality preference, enable/disable scrapers
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const VERSION = '1.3.4';
const ADDON_ID = 'com.ovnivers.allinone';

const PIGAMER = 'https://pigamer37.alwaysdata.net';
const ANIME_PREFIXES = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:', 'anilist:', 'kitsu:', 'mal:', 'anidb:'];
const ANIME_SOURCE_PREFIXES = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:'];
const ANIME_XREF_PREFIXES = ['anilist:', 'kitsu:', 'mal:', 'anidb:'];

// Available languages for filtering
const ALL_LANGS = {
  en: 'English', es: 'Spanish', fr: 'French', ja: 'Japanese',
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
  enableCatalogs: true,                  // expose this addon's TMDb/anime catalogs
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
  scrapeAlfaProviders = require('./providers/alfa-providers');
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

const streamCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;
const MAX_CACHE = 1000;
const metaCache = new Map();
const META_TTL = 60 * 60 * 1000;
const genreCache = { movie: null, tv: null, loadedAt: 0 };
const GENRE_TTL = 24 * 60 * 60 * 1000;

async function loadGenres() {
  const now = Date.now();
  if (genreCache.loadedAt && (now - genreCache.loadedAt) < GENRE_TTL) return;
  try {
    const [movieGenres, tvGenres] = await Promise.all([
      fetchAPI(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_KEY}&language=en`),
      fetchAPI(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_KEY}&language=en`)
    ]);
    genreCache.movie = (movieGenres?.genres || []).map(g => ({ id: String(g.id), name: g.name }));
    genreCache.tv = (tvGenres?.genres || []).map(g => ({ id: String(g.id), name: g.name }));
    genreCache.loadedAt = now;
    console.log(`Loaded ${genreCache.movie.length} movie genres, ${genreCache.tv.length} TV genres`);
  } catch (e) {
    console.warn('Failed to load genres:', e.message);
  }
}

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
  if (qualityPref === '4k') return name.includes('4k') || name.includes('2160');
  if (qualityPref === '1080p') return name.includes('1080') || name.includes('fhd');
  if (qualityPref === '720p') return name.includes('720') || name.includes('hd');
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
  const url = `https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_KEY}&language=en`;
  return await fetchAPI(url);
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

async function getAnimeTMDbId(id) {
  try {
    const meta = await proxyPigamer(`/meta/series/${encodeURIComponent(id)}.json`);
    if (meta?.meta) {
      if (Array.isArray(meta.meta.links)) {
        for (const link of meta.meta.links) {
          if (link.category === 'tmdb' || (typeof link.name === 'string' && link.name.toLowerCase().includes('tmdb'))) {
            const url = link.url || '';
            const match = url.match(/\/(\d+)$/);
            if (match) return match[1];
          }
        }
      }
      if (meta.meta.tmdb_id) return String(meta.meta.tmdb_id);
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
  return rawId.startsWith('tmdb:') ? rawId.substring(5) : rawId;
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

  if (id.startsWith('tmdb:')) {
    const parts = id.split(':');
    contentId = parts.length > 1 ? parts[1] : id.substring(5);
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

function parseGenreId(value) {
  if (!value) return '';
  const decoded = decodeURIComponent(String(value));
  const match = decoded.match(/^(\d+)(?::|%3A|\s+-\s+|\s)/);
  return match ? match[1] : decoded;
}

function genreOptions(genres) {
  return (genres || []).map(g => `${g.id}: ${g.name}`);
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
  'ja': '🇯🇵',     'jp': '🇯🇵',
  'en': '🇬🇧',     'us': '🇺🇸',
  'ko': '🇰🇷',     'kr': '🇰🇷',
  'vose': '🇬🇧🇪🇸', 'vos': '🇬🇧🇪🇸',
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

  // Extract quality from ANYWHERE in stream data
  const allText = [stream.quality, rawName, rawTitle].filter(Boolean).join(' ');
  const quality = stream.quality
    || allText.match(/\b(4K|2160p?|1080p?|720p?|480p?|HD|FHD|SD)\b/i)?.[0]
    || 'HD';

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
    providerLabel = `Pigamer37: ${sourceName}`;
  } else if (isAlfa && sourceName && !sourceName.match(/^\d+$/) && sourceName !== quality && sourceName !== providerName) {
    providerLabel = `Alfa: ${sourceName}`;
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
        && !t.match(/^\s*(HD|4K|2160p?|1080p?|720p?|480p?)\s*$/i)
        && !t.match(/^[\u{1F1E6}-\u{1F1FF}]{2,}$/u)) {
      seen.add(t.toLowerCase());
      titleParts.push(t);
    }
  };

  // From nameLines[1+] (strip quality and flags but keep server info)
  for (let i = 1; i < nameLines.length; i++) {
    const cleaned = nameLines[i]
      .replace(/\b(4K|2160p?|1080p?|720p?|480p?)\b/gi, '')
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
    cleaned = cleaned.replace(/^\s*(HD|4K|2160p?|1080p?|720p?|480p?)\s*[|\-·]\s*/i, '').trim();
    if (cleaned) addLine(cleaned);
  }

  // URL server name detection (always add if found)
  if (url) {
    const serverName = detectServerName(url);
    if (serverName) addLine(serverName);
  }

  // Add flags as last line if not already present
  if (flags && !titleParts.some(p => p.includes(flags))) {
    titleParts.push(flags);
  }

  const title = titleParts.join('\n');

  return {
    name,
    title,
    ...(url ? { url } : {}),
    ...(stream.infoHash ? { infoHash: stream.infoHash } : {}),
    ...(stream.externalUrl ? { externalUrl: stream.externalUrl } : {}),
    ...(stream.file ? { file: stream.file } : {}),
    behaviorHints: {
      notWebReady: true,
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
  const tmdbId = await resolveTMDbIdForProviders(rawId, mediaType);
  if (!tmdbId) return [];

  const providers = localProviders.filter(provider =>
    providerSupportsType(provider, mediaType, type) && providerMatchesLang(provider, config)
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
        if (normalized.length) {
          console.log(`  [${provider.name}] ${normalized.length} streams (${Date.now() - start}ms)`);
        }
        return normalized;
      } catch (e) {
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
    const proxyId = await resolveAnimeId(rawId) || rawId;
    tmdbId = await getAnimeTMDbId(proxyId);
  } else {
    tmdbId = await resolveTMDbIdForProviders(rawId, mediaType);
  }
  if (!tmdbId) return [];
  try {
    const data = await withTimeout(
      Promise.resolve(scrapeAlfaProviders(isSeriesType(type) ? 'series' : type, String(tmdbId), season, episode)),
      LOCAL_PROVIDER_TIMEOUT
    );
    return (Array.isArray(data) ? data : [])
      .map(stream => normalizeStream(stream, 'alfa-providers', 'Alfa Providers'))
      .filter(Boolean);
  } catch (e) {
    console.warn(`[alfa] ${e.message}`);
    return [];
  }
}

async function searchAlfaAnime(query) {
  let providers;
  try {
    providers = require('./src/alfa-providers/providers.js');
  } catch { return []; }

  const animeProviders = providers.filter(p =>
    p.active && !p.adult && p.categories.includes('anime') && p.search
  );

  const results = [];
  const seen = new Set();

  await Promise.allSettled(animeProviders.map(async (p) => {
    try {
      const searchUrl = p.baseUrl.replace(/\/+$/, '') + '/' + p.search.url.replace(/^\//, '').replace('{query}', encodeURIComponent(query));
      const html = await fetchAPI(searchUrl, {}, 10000);
      if (!html || typeof html !== 'string') return;

      const $ = cheerio.load(html);
      const items = $(p.search.itemSelector).toArray().slice(0, 5);

      for (const item of items) {
        const el = $(item);
        let title = '';
        let link = '';

        if (p.search.titleSelector === '&') {
          title = el.text().trim();
        } else if (p.search.titleAttr) {
          title = el.find(p.search.titleSelector).attr(p.search.titleAttr) || el.text().trim();
        } else {
          title = el.find(p.search.titleSelector).first().text().trim();
        }

        if (p.search.linkSelector === '&') {
          link = el.attr('href') || '';
        } else {
          link = el.find(p.search.linkSelector).first().attr('href') || '';
        }

        if (!title || title.length < 2 || !link) continue;
        if (link && !link.startsWith('http')) {
          try { link = new URL(link, p.baseUrl).href; } catch { continue; }
        }

        const key = title.toLowerCase().trim();
        if (seen.has(key)) continue;
        seen.add(key);

        results.push({
          id: `${p.name}:${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
          type: 'series',
          name: title,
          poster: null,
          posterShape: 'poster',
          description: `From ${p.title} (Alfa provider)`
        });
      }
    } catch {}
  }));

  return results;
}

// ─── Manifest ─────────────────────────────

app.get('/manifest.json', async (req, res) => {
  const config = parseConfig(req);
  const enabledCatalogs = [];

  await loadGenres();

  if (config.enableCatalogs && config.enableMovies) {
    enabledCatalogs.push(
      { type: 'movie', id: 'tmdb-popular', name: 'Popular Movies' },
      { type: 'movie', id: 'tmdb-trending', name: 'Trending Movies' },
      { type: 'movie', id: 'tmdb-top', name: 'Top Rated Movies' },
      { type: 'movie', id: 'tmdb-genres', name: 'Movies by Genre', extra: [{ name: 'genre', options: genreOptions(genreCache.movie), optionsLimit: 1 }] },
      { type: 'movie', id: 'tmdb-year', name: 'Movies by Year', extra: [{ name: 'search', isRequired: true }] }
    );
  }
  if (config.enableCatalogs && config.enableSeries) {
    enabledCatalogs.push(
      { type: 'series', id: 'tmdb-popular', name: 'Popular Series' },
      { type: 'series', id: 'tmdb-trending', name: 'Trending Series' },
      { type: 'series', id: 'tmdb-top', name: 'Top Rated Series' },
      { type: 'series', id: 'tmdb-genres', name: 'Series by Genre', extra: [{ name: 'genre', options: genreOptions(genreCache.tv), optionsLimit: 1 }] },
      { type: 'series', id: 'tmdb-year', name: 'Series by Year', extra: [{ name: 'search', isRequired: true }] }
    );
  }
  if (config.enableCatalogs && config.enableAnime) {
    enabledCatalogs.push(
      { type: 'series', id: 'animeflv|onair', name: 'AnimeFLV On Air' },
      { type: 'series', id: 'animeav1|onair', name: 'AnimeAV1 On Air' },
      { type: 'series', id: 'tioanime|onair', name: 'TioAnime On Air' },
      { type: 'series', id: 'henaojara|onair', name: 'Henaojara On Air' },
      { type: 'series', id: 'animeflv|search', name: 'AnimeFLV Search', extra: [{ name: 'search', isRequired: true }, { name: 'skip', isRequired: false }] },
      { type: 'series', id: 'animeav1|search', name: 'AnimeAV1 Search', extra: [{ name: 'search', isRequired: true }, { name: 'skip', isRequired: false }] },
      { type: 'series', id: 'tioanime|search', name: 'TioAnime Search', extra: [{ name: 'search', isRequired: true }, { name: 'skip', isRequired: false }] },
      { type: 'series', id: 'henaojara|search', name: 'Henaojara Search', extra: [{ name: 'search', isRequired: true }, { name: 'skip', isRequired: false }] },
      { type: 'series', id: 'all-search', name: 'All Sources Search', extra: [{ name: 'search', isRequired: true }, { name: 'skip', isRequired: false }] }
    );
  }

  const enabledTypes = [];
  if (config.enableMovies) enabledTypes.push('movie');
  if (config.enableSeries || config.enableAnime) enabledTypes.push('series');
  if (!enabledTypes.includes('other')) enabledTypes.push('other');

  const streamPrefixes = [];
  if (config.enableBackend) streamPrefixes.push('tt', 'tmdb');
  if (config.enableAnime) streamPrefixes.push(...ANIME_PREFIXES);

  const catalogPrefixes = [];
  if (config.enableBackend) catalogPrefixes.push('tmdb', 'tmdb-genre:');
  if (config.enableAnime) catalogPrefixes.push(...ANIME_PREFIXES);

  const metaPrefixes = [];
  if (config.enableBackend) metaPrefixes.push('tt', 'tmdb');
  if (config.enableAnime) metaPrefixes.push(...ANIME_PREFIXES);

  const allPrefixes = [...new Set([...streamPrefixes, ...catalogPrefixes, ...metaPrefixes])];

  const resources = [
    { name: 'stream', types: enabledTypes, idPrefixes: streamPrefixes },
    { name: 'catalog', types: enabledTypes, idPrefixes: catalogPrefixes },
    { name: 'meta', types: enabledTypes, idPrefixes: metaPrefixes }
  ];

  const manifest = {
    id: ADDON_ID,
    version: VERSION,
    name: 'Ovnivers All-in-One',
    description: `${localProviders.length} server-side providers + Alfa + ${BACKEND_SCRAPERS.length} backend + AnimeFLV/AnimeAV1/TioAnime/Henaojara. Works with external catalogs.`,
    logo: `${BASE_URL}/logo.png`,
    catalogs: enabledCatalogs,
    resources,
    types: enabledTypes,
    idPrefixes: allPrefixes,
    behaviorHints: {
      adult: false,
      configurable: true,
      configurationRequired: false,
      newEpisodeNotifications: true
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

  const ck = cacheKey(type, id, `${season}:${episode}`);
  const cached = streamCache.get(ck);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json({
      streams: filterStreams(cached.data, config)
    });
  }

  console.log(`[stream] ${type}/${id} media=${mediaType} rawId=${rawId} s${season}e${episode}`);

  const streams = [];
  const streamTasks = [];

  // Anime → proxy pigamer37 (no early return, merge with other providers)
  if (isAnimeId(id) && config.enableAnime) {
    streamTasks.push((async () => {
      try {
        const resolvedId = await resolveAnimeId(id);
        const proxyId = resolvedId || id;
        const proxyType = 'series';
        const qs = `?season=${season}&episode=${episode}`;
        const data = await proxyPigamer(`/stream/${proxyType}/${encodeURIComponent(proxyId)}.json${qs}`);
        const pigStreams = parseSources(data);
        console.log(`  [Pigamer37] ${pigStreams.length} streams (s${season}e${episode})`);
        return pigStreams.map(s => normalizeStream(s, 'pigamer37', 'Pigamer37')).filter(Boolean);
      } catch (e) {
        console.warn(`  [Pigamer37] ${e.message}`);
        return [];
      }
    })());
  }

  if (config.enableBackend && !isAnimeId(id)) {
    streamTasks.push(...BACKEND_SCRAPERS.map(async (scraper) => {
      const start = Date.now();
      try {
        const results = await scraper.fn(rawId, mediaType, season, episode);
        if (results.length > 0) {
          console.log(`  [${scraper.name}] ${results.length} streams (${Date.now() - start}ms)`);
          return results.map(s => normalizeStream(s, scraper.name, scraper.name)).filter(Boolean);
        }
      } catch {}
      return [];
    }));
  }

  if (config.enableLocal) {
    if (isAnimeId(id)) {
      // Anime: usar categoría 'anime' para alfa, resolver TMDB ID para locales
      streamTasks.push(scrapeAlfa(rawId, 'tv', 'anime', season, episode, config));
      streamTasks.push((async () => {
        try {
          const proxyId = await resolveAnimeId(id) || id;
          const tmdbId = await getAnimeTMDbId(proxyId);
          if (!tmdbId) return [];
          return await scrapeLocalProviders(tmdbId, 'tv', 'anime', season, episode, config);
        } catch { return []; }
      })());
    } else {
      streamTasks.push(
        scrapeAlfa(rawId, mediaType, type, season, episode, config),
        scrapeLocalProviders(rawId, mediaType, type, season, episode, config)
      );
    }
  }

  const settled = await Promise.allSettled(streamTasks);
  for (const item of settled) {
    if (item.status === 'fulfilled' && Array.isArray(item.value)) streams.push(...item.value);
  }

  if (streams.length === 0 && config.enableBackend && !isAnimeId(id)) {
    const altId = !rawId.startsWith('tt')
      ? await getIMDbId(rawId, mediaType)
      : await getTMDbId(rawId, mediaType);
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
  cacheSet(streamCache, ck, { data: uniqueStreams, time: Date.now() }, MAX_CACHE);

  const filtered = filterStreams(uniqueStreams, config);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL / 1000}`);
  res.json({ streams: filtered });
}

function filterStreams(streams, config) {
  return streams.filter(s => matchesQuality(s.name, config.quality));
}

// ─── Catalog ──────────────────────────────

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

  // Combined search → TMDB + all anime sources
  if (id === 'all-search') {
    const search = req.query.search;
    if (!search) return res.json({ metas: [] });
    if (!config.enableBackend && !config.enableAnime) return res.json({ metas: [] });

    try {
      const tasks = [];

      if (config.enableBackend) {
        const mediaType = type === 'series' ? 'tv' : 'movie';
        const tmdbUrl = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${TMDB_KEY}&language=en&query=${encodeURIComponent(search)}&page=1`;
        tasks.push(fetchAPI(tmdbUrl).then(data => {
          if (!data?.results) return [];
          return data.results.slice(0, 10).map(item => ({
            id: `tmdb:${item.id}`, type,
            name: item.title || item.name || 'Unknown',
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            posterShape: 'poster',
            description: item.overview || '',
            releaseInfo: (item.release_date || item.first_air_date || '').substring(0, 4),
            imdbRating: item.vote_average ? String(item.vote_average) : null
          }));
        }));
      }

      if (config.enableAnime) {
        for (const source of ['animeflv', 'animeav1', 'tioanime', 'henaojara']) {
          const sid = `${source}|search`;
          const qs = `?search=${encodeURIComponent(search)}`;
          tasks.push(
            proxyPigamer(`/catalog/series/${encodeURIComponent(sid)}.json${qs}`).then(data => {
              if (!data?.metas) return [];
              return data.metas.slice(0, 10).map(m => ({ ...m, type }));
            })
          );
        }
      }

      if (config.enableLocal) {
        tasks.push(searchAlfaAnime(search));
      }

      const settled = await Promise.allSettled(tasks);
      const metas = [];
      for (const r of settled) {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) metas.push(...r.value);
      }

      const seen = new Set();
      const unique = metas.filter(m => {
        const key = (m.name || '').toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', `public, max-age=${META_TTL / 1000}`);
      return res.json({ metas: unique.slice(0, 50) });
    } catch (e) {
      console.error('[catalog:all-search]', e.message);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json({ metas: [] });
    }
  }

  // Anime catalogs → proxy pigamer37
  const cleanId = id.replace('|onair', '').replace('|search', '').replace('%7C', '|');
  if (isAnimeId(cleanId + ':')) {
    if (!config.enableAnime) return res.json({ metas: [] });
    try {
      const proxyType = 'series';
      const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      const data = await proxyPigamer(`/catalog/${proxyType}/${encodeURIComponent(id)}.json${qs}`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', `public, max-age=${META_TTL / 1000}`);
      return res.json(data || { metas: [] });
    } catch (e) {
      console.error('[catalog:anime]', e.message);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json({ metas: [] });
    }
  }

  if (!config.enableBackend) return res.json({ metas: [] });

  const genre = parseGenreId(req.query.genre);
  const skip = parseInt(req.query.skip) || 0;
  const ck = cacheKey(type, id, `${skip}:${genre || ''}`);

  const cached = metaCache.get(ck);
  if (cached && Date.now() - cached.time < META_TTL) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json({ metas: cached.data });
  }

  try {
    const mediaType = type === 'series' ? 'tv' : 'movie';
    let tmdbUrl;
    let page = Math.floor(skip / 20) + 1;

    if (id === 'tmdb-popular') {
      tmdbUrl = `https://api.themoviedb.org/3/${mediaType}/popular?api_key=${TMDB_KEY}&language=en&page=${page}`;
    } else if (id === 'tmdb-trending') {
      tmdbUrl = `https://api.themoviedb.org/3/trending/${mediaType}/week?api_key=${TMDB_KEY}&language=en&page=${page}`;
    } else if (id === 'tmdb-top') {
      tmdbUrl = `https://api.themoviedb.org/3/${mediaType}/top_rated?api_key=${TMDB_KEY}&language=en&page=${page}`;
    } else if (id === 'tmdb-genres') {
      if (!genre) {
        const genreList = await fetchAPI(`https://api.themoviedb.org/3/genre/${mediaType}/list?api_key=${TMDB_KEY}&language=en`);
        const metas = (genreList?.genres || []).map(g => ({
          id: `tmdb-genre:${g.id}`, type,
          name: g.name,
          poster: null,
          posterShape: 'square'
        }));
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.json({ metas });
      }
      tmdbUrl = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${TMDB_KEY}&language=en&with_genres=${genre}&page=${page}&sort_by=popularity.desc`;
    } else if (id === 'tmdb-year') {
      const year = req.query.search || new Date().getFullYear();
      tmdbUrl = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${TMDB_KEY}&language=en&primary_release_year=${year}&page=${page}&sort_by=popularity.desc`;
    } else {
      return res.json({ metas: [] });
    }
    if (genre && id !== 'tmdb-genres') tmdbUrl += `&with_genres=${genre}`;

    const data = await fetchAPI(tmdbUrl);
    if (!data || !data.results) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json({ metas: [] });
    }

    const metas = data.results.slice(0, 50).map(item => ({
      id: `tmdb:${item.id}`, type,
      name: item.title || item.name || 'Unknown',
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      posterShape: 'poster',
      description: item.overview || '',
      releaseInfo: (item.release_date || item.first_air_date || '').substring(0, 4),
      imdbRating: item.vote_average ? String(item.vote_average) : null
    }));

    cacheSet(metaCache, ck, { data: metas, time: Date.now() }, MAX_CACHE);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', `public, max-age=${META_TTL / 1000}`);
    res.json({ metas });
  } catch (e) {
    console.error('[catalog]', e.message);
    res.setHeader('Access-Control-Allow-Origin', '*');
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

  // Anime meta → proxy pigamer37
  if (isAnimeId(id)) {
    if (!config.enableAnime) return res.json({ meta: null });
    try {
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

  if (!config.enableBackend) return res.json({ meta: null });

  let contentId = extractId(id);
  const mediaType = type === 'series' ? 'tv' : 'movie';

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
    const data = await getTMDbMeta(contentId, mediaType);
    if (!data) { res.setHeader('Access-Control-Allow-Origin', '*'); return res.json({ meta: null }); }
    const meta = {
      id: `tmdb:${data.id}`, type,
      name: data.title || data.name || 'Unknown',
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      background: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      description: data.overview || '',
      releaseInfo: (data.release_date || data.first_air_date || '').substring(0, 4),
      runtime: data.runtime ? `${data.runtime} min` : null,
      imdbRating: data.vote_average ? String(data.vote_average) : null,
      genres: (data.genres || []).map(g => g.name)
    };
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
  <p>Configure your streaming experience</p>
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
      <div><div class="label">Local scrapers</div><div class="hint">62 device-side providers (80+ Alfa channels + 61 original)</div></div>
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
  res.json({
    name: 'Ovnivers All-in-One',
    version: VERSION,
    addon: ADDON_ID,
    config: config,
    backendScrapers: BACKEND_SCRAPERS.map(s => s.name),
    animeProxy: 'Pigamer37 (AnimeFLV, AnimeAV1, TioAnime, Henaojara)',
    localScrapers: manifestScrapers.length,
    uptime: Math.floor(process.uptime()),
    endpoints: {
      manifest: `${BASE_URL}/manifest.json`,
      configure: `${BASE_URL}/configure`,
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
