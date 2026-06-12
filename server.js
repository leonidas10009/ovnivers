/**
 * Ovnivers — Stremio Addon Backend v1.4.0
 * Backend scrapers + Pigamer37 (AnimeFLV/AnimeAV1/Henaojara/TioAnime) proxy
 * Configurable: language filter, quality preference, enable/disable scrapers
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const VERSION = '1.5.0';
const ADDON_ID = 'com.ovnivers.allinone';

const PIGAMER = 'https://pigamer37.alwaysdata.net';
const ANIME_PREFIXES = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:', 'anilist:', 'kitsu:', 'mal:', 'anidb:'];

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
  enableLocal: true
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
    const ct = res.headers.get('content-type') || '';
    return ct.includes('json') ? await res.json().catch(() => null) : await res.text();
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
  const url = `https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_KEY}&language=en`;
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

async function scrapeEZTV(rawId, mediaType, season, episode) {
  try {
    let imdbId = rawId;
    if (!rawId.startsWith('tt')) {
      imdbId = await getIMDbId(rawId, mediaType);
      if (!imdbId) return [];
    }
    const searchUrl = `https://eztvx.to/search/${imdbId}`;
    const html = await fetchAPI(searchUrl, {}, 12000);
    if (!html || typeof html !== 'string') return [];
    const magnetMatch = html.match(/href="(magnet:\?[^"]+)"/g);
    if (!magnetMatch) return [];
    return magnetMatch.slice(0, 5).map(m => {
      const url = m.match(/href="([^"]+)"/)[1];
      return { name: 'HD', description: 'EZTV', url, behaviorHints: { notWebReady: true } };
    });
  } catch { return []; }
}

async function getTitle(rawId, mediaType) {
  try {
    let tmdbId = rawId;
    if (rawId.startsWith('tt')) {
      const r = await fetchAPI(`https://api.themoviedb.org/3/find/${rawId}?api_key=${TMDB_KEY}&external_source=imdb_id`);
      const results = r?.[mediaType === 'tv' ? 'tv_results' : 'movie_results'];
      if (results?.[0]) tmdbId = results[0].id;
      else return null;
    }
    const typeStr = mediaType === 'tv' ? 'tv' : 'movie';
    const data = await fetchAPI(`https://api.themoviedb.org/3/${typeStr}/${tmdbId}?api_key=${TMDB_KEY}&language=en`);
    return data ? { title: data.title || data.name || '', year: (data.release_date || data.first_air_date || '').substring(0, 4) } : null;
  } catch { return null; }
}

async function scrapeCuevana2Espanol(rawId, mediaType, season, episode) {
  try {
    const info = await getTitle(rawId, mediaType);
    if (!info?.title) return [];
    const searchUrl = `https://www.cuevana2espanol.net/search?q=${encodeURIComponent(info.title)}`;
    const html = await fetchAPI(searchUrl, {}, 12000);
    if (!html || typeof html !== 'string') return [];
    const linkMatch = html.match(/href="(\/[^"]*pelicula[^"]*)"[^>]*>([^<]*)<\/a>/gi);
    if (!linkMatch) return [];
    let bestUrl = null, bestScore = 0;
    for (const m of linkMatch) {
      const href = m.match(/href="([^"]+)"/)?.[1];
      const txt = m.match(/>([^<]+)</)?.[1]?.trim();
      if (!href || !txt) continue;
      const s = txt.toLowerCase().includes(info.title.toLowerCase().substring(0, 5)) ? 1 : 0;
      if (info.year && txt.includes(info.year)) s += 0.2;
      if (s > bestScore) { bestScore = s; bestUrl = `https://www.cuevana2espanol.net${href}`; }
    }
    if (!bestUrl) return [];
    const pageHtml = await fetchAPI(bestUrl, {}, 12000);
    if (!pageHtml || typeof pageHtml !== 'string') return [];
    const jsonMatch = pageHtml.match(/<script type="application\/json"[^>]*>(.*?)<\/script>/);
    if (!jsonMatch) return [];
    const data = JSON.parse(jsonMatch[1]);
    const players = data?.props?.pageProps?.post?.players;
    if (!players) return [];
    const streams = [];
    for (const [lang, arr] of Object.entries(players)) {
      if (Array.isArray(arr)) {
        for (const p of arr) {
          if (p.result) streams.push({
            name: p.quality || 'HD',
            description: `Cuevana2 [${lang}]`,
            url: p.result,
            behaviorHints: { notWebReady: true }
          });
        }
      }
    }
    return streams;
  } catch { return []; }
}

async function scrapePoseidonHD(rawId, mediaType, season, episode) {
  try {
    const info = await getTitle(rawId, mediaType);
    if (!info?.title) return [];
    const searchUrl = `https://www.poseidonhd2.co/search?q=${encodeURIComponent(info.title)}`;
    const html = await fetchAPI(searchUrl, {}, 12000);
    if (!html || typeof html !== 'string') return [];
    const linkMatch = html.match(/href="(\/[^"]*pelicula[^"]*)"[^>]*>([^<]*)<\/a>/gi);
    if (!linkMatch) return [];
    let bestUrl = null, bestScore = 0;
    for (const m of linkMatch) {
      const href = m.match(/href="([^"]+)"/)?.[1];
      const txt = m.match(/>([^<]+)</)?.[1]?.trim();
      if (!href || !txt) continue;
      const s = txt.toLowerCase().includes(info.title.toLowerCase().substring(0, 5)) ? 1 : 0;
      if (info.year && txt.includes(info.year)) s += 0.2;
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
  { name: 'EZTV', fn: scrapeEZTV },
  { name: 'Cuevana2', fn: scrapeCuevana2Espanol },
  { name: 'PoseidonHD', fn: scrapePoseidonHD },
];

// ─── Pigamer37 Proxy ────────────────────

function isAnimeId(id) {
  // detect both colon and pipe variants
  return ANIME_PREFIXES.some(p => id.startsWith(p) || id.startsWith(p.replace(':', '|')));
}

function fixPigamerId(id) {
  return id.replace(/:/g, '%7C');
}

function fixPigamerType(type) {
  return 'series';
}

async function proxyPigamer(pathSuffix, timeout = 20000) {
  return await fetchAPI(`${PIGAMER}${pathSuffix}`, {}, timeout);
}

// ─── Route helpers ────────────────────────

function mapType(type) {
  if (type === 'series') return 'tv';
  if (type === 'movie') return 'movie';
  if (type === 'anime') return 'series';
  return type;
}

function extractId(rawId) {
  return rawId.startsWith('tmdb:') ? rawId.substring(5) : rawId;
}

function cacheKey(type, id, extra) {
  return `${type}:${id}:${extra || ''}`;
}

// ─── Manifest ─────────────────────────────

app.get('/manifest.json', (req, res) => {
  const config = parseConfig(req);
  const enabledCatalogs = [];

  if (config.enableMovies) {
    enabledCatalogs.push(
      { type: 'movie', id: 'tmdb-popular', name: 'Popular Movies' },
      { type: 'movie', id: 'tmdb-trending', name: 'Trending Movies' },
      { type: 'movie', id: 'tmdb-top', name: 'Top Rated Movies' },
      { type: 'movie', id: 'tmdb-genres', name: 'Movies by Genre', extra: [{ name: 'genre', isRequired: false, optionsLimit: 1 }] },
      { type: 'movie', id: 'tmdb-year', name: 'Movies by Year', extra: [{ name: 'search', isRequired: false }] }
    );
  }
  if (config.enableSeries) {
    enabledCatalogs.push(
      { type: 'series', id: 'tmdb-popular', name: 'Popular Series' },
      { type: 'series', id: 'tmdb-trending', name: 'Trending Series' },
      { type: 'series', id: 'tmdb-top', name: 'Top Rated Series' },
      { type: 'series', id: 'tmdb-genres', name: 'Series by Genre', extra: [{ name: 'genre', isRequired: false, optionsLimit: 1 }] },
      { type: 'series', id: 'tmdb-year', name: 'Series by Year', extra: [{ name: 'search', isRequired: false }] }
    );
  }
  if (config.enableAnime) {
    enabledCatalogs.push(
      { type: 'anime', id: 'animeflv|onair', name: 'AnimeFLV On Air' },
      { type: 'anime', id: 'animeav1|onair', name: 'AnimeAV1 On Air' },
      { type: 'anime', id: 'tioanime|onair', name: 'TioAnime On Air' },
      { type: 'anime', id: 'henaojara|onair', name: 'Henaojara On Air' },
      { type: 'anime', id: 'animeflv|search', name: 'AnimeFLV Search', extra: [{ name: 'search', isRequired: true }, { name: 'skip', isRequired: false }] },
      { type: 'anime', id: 'animeav1|search', name: 'AnimeAV1 Search', extra: [{ name: 'search', isRequired: true }, { name: 'skip', isRequired: false }] },
      { type: 'anime', id: 'tioanime|search', name: 'TioAnime Search', extra: [{ name: 'search', isRequired: true }, { name: 'skip', isRequired: false }] },
      { type: 'anime', id: 'henaojara|search', name: 'Henaojara Search', extra: [{ name: 'search', isRequired: true }, { name: 'skip', isRequired: false }] }
    );
  }

  const enabledTypes = [];
  if (config.enableMovies) enabledTypes.push('movie');
  if (config.enableSeries) enabledTypes.push('series');
  if (config.enableAnime) enabledTypes.push('anime');

    const allPrefixes = [];
    if (config.enableBackend) allPrefixes.push('tt', 'tmdb', 'tmdb-genre:');
    if (config.enableAnime) allPrefixes.push(...ANIME_PREFIXES);

    const resources = [
      { name: 'stream', types: enabledTypes, idPrefixes: allPrefixes },
      { name: 'catalog', types: enabledTypes, idPrefixes: allPrefixes },
      { name: 'meta', types: enabledTypes, idPrefixes: allPrefixes }
    ];

  const manifest = {
    id: ADDON_ID,
    version: VERSION,
    name: 'Ovnivers All-in-One',
    description: `${manifestScrapers.length} scrapers + ${BACKEND_SCRAPERS.length} backend + AnimeFLV/AnimeAV1/TioAnime/Henaojara. Movies, TV & anime.`,
    logo: `${BASE_URL}/logo.png`,
    catalogs: enabledCatalogs,
    resources,
    types: enabledTypes,
    idPrefixes: allPrefixes,
    behaviorHints: {
      adult: false,
      configurable: true,
      configurationRequired: false
    }
  };
  if (config.enableLocal) manifest.scrapers = manifestScrapers;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(manifest);
});

// ─── Stream ───────────────────────────────

app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  const config = parseConfig(req);
  const season = parseInt(req.query.season) || 1;
  const episode = parseInt(req.query.episode) || 1;

  // Check if type is enabled
  if ((type === 'movie' && !config.enableMovies) ||
      (type === 'series' && !config.enableSeries) ||
      (type === 'anime' && !config.enableAnime)) {
    return res.json({ streams: [] });
  }

  // Anime → proxy pigamer37
  if (isAnimeId(id)) {
    if (!config.enableAnime) return res.json({ streams: [] });
    const proxyType = 'series';
    const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const data = await proxyPigamer(`/stream/${proxyType}/${encodeURIComponent(fixPigamerId(id))}.json${qs}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL / 1000}`);
    return res.json(data || { streams: [] });
  }

  if (!config.enableBackend) return res.json({ streams: [] });

  const mediaType = mapType(type);
  const rawId = extractId(id);

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
  await Promise.allSettled(BACKEND_SCRAPERS.map(async (scraper) => {
    const start = Date.now();
    try {
      const results = await scraper.fn(rawId, mediaType, season, episode);
      if (results.length > 0) {
        console.log(`  [${scraper.name}] ${results.length} streams (${Date.now() - start}ms)`);
        streams.push(...results);
      }
    } catch {}
  }));

  if (streams.length === 0) {
    const altId = !rawId.startsWith('tt')
      ? await getIMDbId(rawId, mediaType)
      : await getTMDbId(rawId, mediaType);
    if (altId) {
      console.log(`[stream] retry with alt ID: ${altId}`);
      await Promise.allSettled(BACKEND_SCRAPERS.map(async (scraper) => {
        try {
          const results = await scraper.fn(altId, mediaType, season, episode);
          if (results.length > 0) streams.push(...results);
        } catch {}
      }));
    }
  }

  console.log(`[stream] ${type}/${id} → ${streams.length} total`);
  cacheSet(streamCache, ck, { data: streams, time: Date.now() }, MAX_CACHE);

  const filtered = filterStreams(streams, config);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL / 1000}`);
  res.json({ streams: filtered });
});

function filterStreams(streams, config) {
  return streams.filter(s => matchesQuality(s.name, config.quality));
}

// ─── Catalog ──────────────────────────────

app.get('/catalog/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  const config = parseConfig(req);

  if ((type === 'movie' && !config.enableMovies) ||
      (type === 'series' && !config.enableSeries) ||
      (type === 'anime' && !config.enableAnime)) {
    return res.json({ metas: [] });
  }

  // Anime catalogs → proxy pigamer37
  const cleanId = id.replace('|onair', '').replace('|search', '').replace('%7C', '|');
  if (isAnimeId(cleanId)) {
    if (!config.enableAnime) return res.json({ metas: [] });
    const proxyType = 'series';
    const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const data = await proxyPigamer(`/catalog/${proxyType}/${encodeURIComponent(fixPigamerId(id))}.json${qs}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', `public, max-age=${META_TTL / 1000}`);
    return res.json(data || { metas: [] });
  }

  if (!config.enableBackend) return res.json({ metas: [] });

  const genre = req.query.genre;
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
});

// ─── Meta ─────────────────────────────────

app.get('/meta/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  const config = parseConfig(req);

  if ((type === 'movie' && !config.enableMovies) ||
      (type === 'series' && !config.enableSeries) ||
      (type === 'anime' && !config.enableAnime)) {
    return res.json({ meta: null });
  }

  // Anime meta → proxy pigamer37
  if (isAnimeId(id)) {
    if (!config.enableAnime) return res.json({ meta: null });
    const proxyType = 'series';
    const data = await proxyPigamer(`/meta/${proxyType}/${encodeURIComponent(fixPigamerId(id))}.json`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', `public, max-age=${META_TTL / 1000}`);
    return res.json(data || { meta: null });
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
});

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
      <div><div class="label">Backend scrapers</div><div class="hint">6 server-side sources (2embed, EZTV, Cuevana2, PoseidonHD)</div></div>
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
