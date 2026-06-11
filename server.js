/**
 * Ovnivers — Stremio Addon Backend
 * Scrapes multiple streaming sources and serves content to Nuvio 0.7.5
 */
const express = require('express');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

const TMDB_KEY = 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const streamCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 min

async function fetchAPI(url, opts = {}, timeout = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': '*/*', ...opts.headers },
      signal: ctrl.signal,
      ...opts
    });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    return ct.includes('json') ? await res.json().catch(() => null) : await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── TMDB Helpers ──────────────────────────

async function getIMDbId(tmdbId, mediaType) {
  const url = `https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_KEY}`;
  const data = await fetchAPI(url);
  return data?.imdb_id || null;
}

async function getTMDbId(imdbId, mediaType) {
  const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${TMDB_KEY}&external_source=imdb_id`;
  const data = await fetchAPI(url);
  return data?.[mediaType === 'tv' ? 'tv_results' : 'movie_results']?.[0]?.id || null;
}

// ─── Scrapers ───────────────────────────────

async function scrapeVidSrcRip(tmdbId, mediaType, season, episode) {
  try {
    const path = mediaType === 'tv' ? `/tv/${tmdbId}/${season}/${episode}` : `/movie/${tmdbId}`;
    const data = await fetchAPI(`https://vidsrc.rip/api${path}`);
    if (!data || !data.sources) return [];

    return data.sources.map(s => ({
      name: 'VidSrc',
      title: `${data.name || data.title || 'Stream'} (${s.quality || 'HD'})`,
      url: s.url || s.file || '',
      quality: s.quality || '1080p'
    })).filter(s => s.url);
  } catch { return []; }
}

async function scrapeShowbox(tmdbId, mediaType, season, episode) {
  try {
    const imdbId = await getIMDbId(tmdbId, mediaType);
    if (!imdbId) return [];

    const servers = await fetchAPI(`https://api.showbox.media/api/media/${imdbId}/servers`);
    if (!Array.isArray(servers)) return [];

    return servers.map(s => ({
      name: 'ShowBox',
      title: `${s.name || 'Stream'} (${s.quality || 'HD'})`,
      url: s.url || s.stream || s.file || '',
      quality: s.quality || '1080p',
      headers: { 'User-Agent': UA }
    })).filter(s => s.url);
  } catch { return []; }
}

async function scrapeCineby(tmdbId, mediaType, season, episode) {
  try {
    let url;
    if (mediaType === 'tv') {
      url = `http://145.241.158.129:3113/api/series/${tmdbId}/${season}/${episode}`;
    } else {
      url = `http://145.241.158.129:3113/api/movie/${tmdbId}`;
    }
    const data = await fetchAPI(url);
    if (!data || typeof data !== 'object') return [];

    const sources = data.sources || data.streams || data.servers || [];
    const arr = Array.isArray(sources) ? sources : [];

    return arr.map(s => ({
      name: 'Cineby',
      title: `${data.name || s.name || 'Stream'} (${s.quality || 'HD'})`,
      url: s.url || s.stream || s.file || '',
      quality: s.quality || '1080p'
    })).filter(s => s.url);
  } catch { return []; }
}

async function scrapeVidlink(tmdbId, mediaType, season, episode) {
  try {
    const data = await fetchAPI(
      `https://vidlink.pro/api/${mediaType}/${tmdbId}`,
      { headers: { 'Referer': 'https://vidlink.pro/' } }
    );
    if (!data || !data.sources) return [];

    return data.sources.map(s => ({
      name: 'VidLink',
      title: `${data.name || data.title || 'Stream'} (${s.quality || 'HD'})`,
      url: s.url || s.file || '',
      quality: s.quality || '1080p',
      headers: { 'Referer': 'https://vidlink.pro/' }
    })).filter(s => s.url);
  } catch { return []; }
}

async function scrapeStreamingCommunity(tmdbId, mediaType, season, episode) {
  try {
    const imdbId = await getIMDbId(tmdbId, mediaType);
    if (!imdbId && !tmdbId) return [];
    const id = imdbId || tmdbId;

    const searchUrl = `https://streamingcommunity.bot/api/search?q=${encodeURIComponent(id)}`;
    const searchData = await fetchAPI(searchUrl, {
      headers: { 'Origin': 'https://streamingcommunity.bot', 'Referer': 'https://streamingcommunity.bot/' }
    });

    if (!searchData || !searchData.data || !Array.isArray(searchData.data) || !searchData.data.length) return [];

    const title = searchData.data[0];
    const titleId = title.id || title.slug;
    if (!titleId) return [];

    let streamUrl;
    if (mediaType === 'tv') {
      streamUrl = `https://streamingcommunity.bot/api/series/${titleId}/${season}/${episode}`;
    } else {
      streamUrl = `https://streamingcommunity.bot/api/movie/${titleId}`;
    }

    const streamData = await fetchAPI(streamUrl, {
      headers: { 'Origin': 'https://streamingcommunity.bot', 'Referer': 'https://streamingcommunity.bot/' }
    });

    if (!streamData || !streamData.sources) return [];

    return streamData.sources.map(s => ({
      name: 'StreamingCommunity',
      title: `${title.name || 'Stream'} (${s.quality || 'HD'}) [IT]`,
      url: s.url || '',
      quality: s.quality || '1080p',
      headers: { 'Origin': 'https://streamingcommunity.bot', 'Referer': 'https://streamingcommunity.bot/' }
    })).filter(s => s.url);
  } catch { return []; }
}

// All active scrapers
const SCRAPERS = [
  { name: 'VidSrc', fn: scrapeVidSrcRip },
  { name: 'ShowBox', fn: scrapeShowbox },
  { name: 'Cineby', fn: scrapeCineby },
  { name: 'VidLink', fn: scrapeVidlink },
  { name: 'StreamingCommunity', fn: scrapeStreamingCommunity },
];

// ─── Endpoints ──────────────────────────────

function mapType(type) {
  if (type === 'series') return 'tv';
  if (type === 'movie') return 'movie';
  if (type === 'anime') return 'movie'; // Fallback to movie search
  return type;
}

function extractId(rawId) {
  let id = rawId;
  if (id.startsWith('tmdb:')) id = id.substring(5);
  return id;
}

function cacheKey(type, id, season, episode) {
  return `${type}:${id}:${season || 0}:${episode || 0}`;
}

app.get('/manifest.json', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json({
    id: 'com.ovnivers.allinone',
    version: '1.1.1',
    name: 'Ovnivers All-in-One',
    description: `Multi-source streaming — ${SCRAPERS.map(s => s.name).join(', ')}. Movies, TV & anime, up to 4K.`,
    logo: `${BASE_URL}/logo.png`,
    catalogs: [],
    resources: ['stream'],
    types: ['movie', 'series', 'anime'],
    idPrefixes: ['tt', 'tmdb'],
    behaviorHints: {
      configurable: false,
      configurationRequired: false,
      adult: false
    }
  });
});

app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  const mediaType = mapType(type);
  const tmdbId = extractId(id);
  const season = parseInt(req.query.season) || 1;
  const episode = parseInt(req.query.episode) || 1;

  const ck = cacheKey(type, id, season, episode);
  const cached = streamCache.get(ck);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    console.log(`[cache] ${type}/${id}`);
    return res.json({ streams: cached.data });
  }

  console.log(`[stream] ${type}/${id} media=${mediaType} tmdb=${tmdbId} s${season}e${episode}`);

  const streams = [];
  const promises = SCRAPERS.map(async (scraper) => {
    const start = Date.now();
    try {
      const results = await scraper.fn(tmdbId, mediaType, season, episode);
      const elapsed = Date.now() - start;
      if (results.length > 0) {
        console.log(`  [${scraper.name}] ${results.length} streams (${elapsed}ms)`);
        streams.push(...results);
      }
    } catch (e) {
      // silent
    }
  });

  await Promise.allSettled(promises);

  // Also try IMDB id if TMDb didn't find anything
  if (streams.length === 0 && !id.startsWith('tt')) {
    const imdbId = await getIMDbId(tmdbId, mediaType);
    if (imdbId && imdbId !== tmdbId) {
      console.log(`[stream] retrying with IMDB: ${imdbId}`);
      for (const scraper of SCRAPERS) {
        try {
          const results = await scraper.fn(imdbId, mediaType, season, episode);
          if (results.length > 0) streams.push(...results);
        } catch {}
      }
    }
  }

  console.log(`[stream] ${type}/${id} → ${streams.length} total results`);

  streamCache.set(ck, { data: streams, time: Date.now() });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ streams });
});

app.get('/configure', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ovnivers — Configure</title>
<body style="font-family:system-ui;background:#0d1117;color:#c9d1d9;padding:30px;text-align:center">
<h1 style="color:#e94560;font-size:2em;margin-bottom:10px">Ovnivers</h1>
<p style="font-size:1.1em;margin-bottom:30px">All-in-One streaming addon for Nuvio 0.7.5</p>
<div style="background:#161b22;border:1px solid #30363d;border-radius:12px;padding:20px;max-width:500px;margin:0 auto">
<h3 style="color:#e94560">Active Providers</h3>
<div style="text-align:left;margin:15px 0">
${SCRAPERS.map(s => `<p style="padding:8px;border-bottom:1px solid #21262d;margin:0">${s.name}</p>`).join('')}
</div>
<p style="font-size:12px;color:#8b949e">All providers are queried automatically. No configuration required.</p>
</div>
<p style="margin-top:20px;font-size:12px;color:#8b949e">Backend: <code>${BASE_URL}</code></p>
<button onclick="window.open('${BASE_URL}/manifest.json')" style="background:#e94560;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;cursor:pointer;margin-top:15px">View Manifest JSON</button>
`);
});

app.get('/', (req, res) => {
  res.json({
    name: 'Ovnivers All-in-One',
    version: '1.1.1',
    addon: 'com.ovnivers.allinone',
    scrapers: SCRAPERS.map(s => s.name),
    uptime: Math.floor(process.uptime()),
    endpoints: {
      manifest: `${BASE_URL}/manifest.json`,
      configure: `${BASE_URL}/configure`,
      stream: `${BASE_URL}/stream/:type/:id.json`
    }
  });
});

app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\nOvnivers v1.1.1 ready`);
  console.log(`Scrapers: ${SCRAPERS.map(s => s.name).join(', ')}`);
  console.log(`Manifest:  ${BASE_URL}/manifest.json`);
  console.log(`Configure: ${BASE_URL}/configure\n`);
});
