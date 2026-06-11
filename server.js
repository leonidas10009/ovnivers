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

const TMDB_KEY = 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const VERSION = '1.4.0';
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
const metaCache = new Map();
const META_TTL = 60 * 60 * 1000;

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

const BACKEND_SCRAPERS = [
  { name: '2embed (Vesy)', fn: scrape2embedVesy },
  { name: '2embed (Vsrc)', fn: scrape2embedVsrc },
  { name: 'VidSrc', fn: scrapeVidSrcRip },
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
    enabledCatalogs.push({ type: 'movie', id: 'tmdb-popular', name: 'Popular Movies' });
  }
  if (config.enableSeries) {
    enabledCatalogs.push({ type: 'series', id: 'tmdb-popular', name: 'Popular Series' });
  }
  if (config.enableAnime) {
    enabledCatalogs.push(
      { type: 'series', id: 'animeflv|onair', name: 'AnimeFLV On Air' },
      { type: 'series', id: 'animeav1|onair', name: 'AnimeAV1 On Air' },
      { type: 'series', id: 'tioanime|onair', name: 'TioAnime On Air' },
      { type: 'series', id: 'henaojara|onair', name: 'Henaojara On Air' },
      { type: 'series', id: 'animeflv|search', name: 'AnimeFLV', extra: [{ name: 'search', isRequired: true }, { name: 'genre', optionsLimit: 1, isRequired: false }, { name: 'skip', isRequired: false }] },
      { type: 'series', id: 'animeav1|search', name: 'AnimeAV1', extra: [{ name: 'search', isRequired: true }, { name: 'genre', optionsLimit: 1, isRequired: false }, { name: 'skip', isRequired: false }] },
      { type: 'series', id: 'tioanime|search', name: 'TioAnime', extra: [{ name: 'search', isRequired: true }, { name: 'genre', optionsLimit: 1, isRequired: false }, { name: 'skip', isRequired: false }] },
      { type: 'series', id: 'henaojara|search', name: 'Henaojara', extra: [{ name: 'search', isRequired: true }, { name: 'genre', optionsLimit: 1, isRequired: false }, { name: 'skip', isRequired: false }] }
    );
  }

  const enabledTypes = [];
  if (config.enableMovies) enabledTypes.push('movie');
  if (config.enableSeries) enabledTypes.push('series');
  if (config.enableAnime) enabledTypes.push('anime');

    const allPrefixes = [];
    if (config.enableBackend) allPrefixes.push('tt', 'tmdb');
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
  if (isAnimeId(id) || type === 'anime') {
    if (!config.enableAnime) return res.json({ streams: [] });
    const proxyType = (type === 'anime') ? 'series' : type;
    const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const data = await proxyPigamer(`/stream/${proxyType}/${encodeURIComponent(id)}.json${qs}`);
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
  streamCache.set(ck, { data: streams, time: Date.now() });

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
  if (isAnimeId(id.replace('|onair', '').replace('|search', '').replace('%7C', '|')) || type === 'anime') {
    if (!config.enableAnime) return res.json({ metas: [] });
    const proxyType = 'series';
    const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const data = await proxyPigamer(`/catalog/${proxyType}/${encodeURIComponent(id)}.json${qs}`);
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
    if (id === 'tmdb-popular') {
      tmdbUrl = `https://api.themoviedb.org/3/${mediaType}/popular?api_key=${TMDB_KEY}&language=en&page=1`;
    } else if (id === 'tmdb-trending') {
      tmdbUrl = `https://api.themoviedb.org/3/trending/${mediaType}/week?api_key=${TMDB_KEY}&language=en`;
    } else if (id === 'tmdb-top') {
      tmdbUrl = `https://api.themoviedb.org/3/${mediaType}/top_rated?api_key=${TMDB_KEY}&language=en&page=1`;
    } else {
      return res.json({ metas: [] });
    }
    if (genre) tmdbUrl += `&with_genres=${genre}`;

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

    metaCache.set(ck, { data: metas, time: Date.now() });
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
  if (isAnimeId(id) || type === 'anime') {
    if (!config.enableAnime) return res.json({ meta: null });
    const proxyType = 'series';
    const data = await proxyPigamer(`/meta/${proxyType}/${encodeURIComponent(id)}.json`);
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
    metaCache.set(ck, { data: meta, time: Date.now() });
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
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ovnivers — Configure</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui;background:#0d1117;color:#c9d1d9;padding:20px;max-width:600px;margin:0 auto}
h1{color:#e94560;font-size:1.8em;text-align:center;margin-bottom:5px}
.sub{text-align:center;font-size:13px;color:#8b949e;margin-bottom:25px}
.section{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:16px;margin-bottom:14px}
.section h3{color:#e94560;font-size:14px;margin-bottom:12px}
.row{display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #21262d;font-size:13px}
.row:last-child{border-bottom:none}
.row label{flex:1}
.toggle{position:relative;display:inline-block;width:36px;height:20px;flex-shrink:0}
.toggle input{opacity:0;width:0;height:0}
.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#30363d;border-radius:20px;transition:.2s}
.slider:before{position:absolute;content:"";height:14px;width:14px;left:3px;bottom:3px;background:#c9d1d9;border-radius:50%;transition:.2s}
input:checked+.slider{background:#2ea043}
input:checked+.slider:before{transform:translateX(16px)}
.lang-grid{display:flex;flex-wrap:wrap;gap:6px}
.lang-chip{position:relative;cursor:pointer}
.lang-chip input{position:absolute;opacity:0}
.lang-chip span{display:inline-block;padding:4px 10px;border-radius:14px;font-size:12px;background:#21262d;color:#8b949e;border:1px solid #30363d;transition:.15s}
.lang-chip input:checked+span{background:#1f6feb22;color:#58a6ff;border-color:#1f6feb}
select{background:#21262d;color:#c9d1d9;border:1px solid #30363d;border-radius:6px;padding:6px 10px;font-size:13px;width:120px}
.actions{display:flex;gap:10px;margin-top:20px;justify-content:center}
.btn{padding:10px 22px;border-radius:8px;font-size:14px;cursor:pointer;border:none;font-weight:600}
.btn-save{background:#2ea043;color:#fff}
.btn-save:hover{background:#3fb950}
.btn-reset{background:#30363d;color:#c9d1d9}
.btn-reset:hover{background:#484f58}
.status{text-align:center;font-size:13px;margin-top:12px;min-height:20px}
.success{color:#2ea043}
.error{color:#e94560}
</style>

<h1>Ovnivers</h1>
<p class="sub">Configure your streaming preferences</p>

<form id="cfgForm" onsubmit="return false">
  <div class="section">
    <h3>Content Types</h3>
    <div class="row"><label>Movies</label><label class="toggle"><input type="checkbox" name="enableMovies"${currentConfig.enableMovies ? ' checked' : ''}><span class="slider"></span></label></div>
    <div class="row"><label>TV Series</label><label class="toggle"><input type="checkbox" name="enableSeries"${currentConfig.enableSeries ? ' checked' : ''}><span class="slider"></span></label></div>
    <div class="row"><label>Anime</label><label class="toggle"><input type="checkbox" name="enableAnime"${currentConfig.enableAnime ? ' checked' : ''}><span class="slider"></span></label></div>
  </div>

  <div class="section">
    <h3>Stream Quality</h3>
    <div class="row">
      <label>Preferred quality</label>
      <select name="quality">
        <option value="all"${currentConfig.quality === 'all' ? ' selected' : ''}>All</option>
        <option value="4k"${currentConfig.quality === '4k' ? ' selected' : ''}>4K only</option>
        <option value="1080p"${currentConfig.quality === '1080p' ? ' selected' : ''}>1080p+</option>
        <option value="720p"${currentConfig.quality === '720p' ? ' selected' : ''}>720p+</option>
      </select>
    </div>
  </div>

  <div class="section">
    <h3>Languages (preferred)</h3>
    <div class="lang-grid">
      ${Object.entries(ALL_LANGS).map(([code, name]) => `<label class="lang-chip"><input type="checkbox" name="lang_${code}"${currentConfig.langs.includes(code) ? ' checked' : ''}><span>${name}</span></label>`).join('')}
    </div>
  </div>

  <div class="section">
    <h3>Backend Scrapers (server-side)</h3>
    <div class="row"><label>Enable backend streaming</label><label class="toggle"><input type="checkbox" name="enableBackend"${currentConfig.enableBackend ? ' checked' : ''}><span class="slider"></span></label></div>
  </div>

  <div class="section">
    <h3>Local Scrapers (device-side, 61 providers)</h3>
    <div class="row"><label>Enable local scrapers</label><label class="toggle"><input type="checkbox" name="enableLocal"${currentConfig.enableLocal ? ' checked' : ''}><span class="slider"></span></label></div>
  </div>

  <div class="actions">
    <button class="btn btn-save" onclick="generateUrl()">Generate Install URL</button>
    <button class="btn btn-reset" onclick="resetConfig()">Reset Defaults</button>
  </div>
  <div class="status" id="status"></div>
  <div class="url-box" id="urlBox" style="display:none"></div>
</form>

<style>
.url-box{margin-top:12px;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:10px;word-break:break-all}
.url-box code{font-size:11px;color:#58a6ff}
.url-box .url-hint{font-size:11px;color:#8b949e;margin-top:6px}
.copy-btn{background:#1f6feb;color:#fff;border:none;padding:4px 12px;border-radius:4px;font-size:11px;cursor:pointer;margin-top:8px}
.copy-btn:hover{background:#388bfd}
</style>

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

  const s = document.getElementById('status');
  s.className = 'success';
  s.textContent = 'Install URL generated!';

  const box = document.getElementById('urlBox');
  box.style.display = 'block';
  box.innerHTML = '<code>' + url + '</code>' +
    '<div class="url-hint">Copy this URL into Nuvio Settings > Addons to install with your preferences.</div>' +
    '<button class="copy-btn" onclick="copyUrl()">Copy URL</button>' +
    ' <button class="copy-btn" onclick="installStremio()">Install in Stremio</button>';

  window.__installUrl = url;
  window.__stremioUrl = stremioUrl;

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: 'configure', version: '${VERSION}', configured: b64 }, '*');
  }
}

function copyUrl() {
  navigator.clipboard.writeText(window.__installUrl).then(() => {
    const s = document.getElementById('status');
    s.textContent = 'URL copied to clipboard!';
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
  // reset all language checkboxes
  ${JSON.stringify(Object.keys(ALL_LANGS))}.forEach(code => {
    const cb = f['lang_' + code];
    if (cb) cb.checked = true;
  });
  const s = document.getElementById('status');
  s.className = 'success';
  s.textContent = 'Reset to defaults. Click "Generate Install URL" to apply.';
  const box = document.getElementById('urlBox');
  if (box) box.style.display = 'none';
}

function setDefaults() {
  const cfg = ${JSON.stringify(currentConfig)};
  const f = document.getElementById('cfgForm');
  Object.keys(cfg).forEach(k => {
    if (k === 'quality') { f.quality.value = cfg[k]; return; }
    if (f[k]) f[k].checked = cfg[k];
  });
}
</script>`);
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
