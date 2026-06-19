// Anime multi-title resolver
// Resolves any anime ID to all known titles (EN, ES, JA, romaji, synonyms)
// Caches results aggressively for 24h

const { PIGAMER_BASE, AMATSU_BASE, UA, isAnimeId, isAnimeSourceId, isAnimeXrefId, ANIME_SOURCE_PREFIXES } = require('./types');
const tmdb = require('../media/tmdb');
const { resolveAnimeId, getAnimeTMDbId } = require('./resolver');

const titleCache = new Map();
const MAX_CACHE = 500;
const CACHE_TTL = 24 * 60 * 60 * 1000;

function cacheGet(key) {
  const entry = titleCache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.value;
  if (entry) titleCache.delete(key);
  return undefined;
}

function cacheSet(key, value) {
  if (titleCache.size >= MAX_CACHE) {
    const first = titleCache.keys().next().value;
    titleCache.delete(first);
  }
  titleCache.set(key, { value, time: Date.now() });
}

async function fetchJSON(url, timeout = 8000) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(timer);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function fromAmatsu(anilistId) {
  const data = await fetchJSON(`${AMATSU_BASE}/meta/anime/${encodeURIComponent(anilistId)}.json`);
  if (!data?.meta) return null;

  const titles = new Set();
  const meta = data.meta;
  if (meta.name) titles.add(meta.name);
  if (meta.englishName && meta.englishName !== meta.name) titles.add(meta.englishName);
  if (meta.altName && meta.altName !== meta.name) titles.add(meta.altName);
  if (Array.isArray(meta.synonyms)) {
    for (const s of meta.synonyms) {
      if (s && s.length > 1) titles.add(s);
    }
  }

  return {
    titleEN: meta.englishName || meta.name || '',
    titleJA: meta.name || '',
    altName: meta.altName || '',
    synonyms: [...titles].slice(0, 30),
    poster: meta.poster || null,
    year: meta.releaseInfo || null,
  };
}

async function fromPigamer(animeId) {
  const data = await fetchJSON(`${PIGAMER_BASE}/meta/series/${encodeURIComponent(animeId)}.json`, 15000);
  if (!data?.meta) return null;

  const titles = new Set();
  const meta = data.meta;
  if (meta.name) titles.add(meta.name);
  if (meta.englishName && meta.englishName !== meta.name) titles.add(meta.englishName);
  if (meta.altName && meta.altName !== meta.name) titles.add(meta.altName);
  if (Array.isArray(meta.synonyms)) {
    for (const s of meta.synonyms) {
      if (s && s.length > 1) titles.add(s);
    }
  }
  if (Array.isArray(meta.links)) {
    for (const link of meta.links) {
      if (link.name && !titles.has(link.name)) titles.add(link.name);
    }
  }

  return {
    titleEN: meta.englishName || meta.name || '',
    titleJA: meta.name || '',
    altName: meta.altName || '',
    links: meta.links || [],
    synonyms: [...titles].slice(0, 30),
    poster: meta.poster || null,
    year: meta.releaseInfo || null,
  };
}

async function fromTMDB(tmdbId, mediaType = 'tv') {
  const [en, es, altTitles] = await Promise.all([
    tmdb.getMeta(tmdbId, mediaType, 'en'),
    tmdb.getMeta(tmdbId, mediaType, 'es'),
    tmdb.getAltTitles(tmdbId, mediaType),
  ]);

  if (!en) return null;

  const titles = new Set();
  const orig = en.original_name || en.original_title || '';
  const name = en.name || en.title || '';

  if (name) titles.add(name);
  if (orig && orig !== name) titles.add(orig);
  if (es) {
    const esName = es.name || es.title || '';
    if (esName && esName !== name) titles.add(esName);
  }
  if (Array.isArray(altTitles)) {
    for (const t of altTitles) {
      if (t && t.length > 1 && !titles.has(t)) titles.add(t);
    }
  }

  return {
    titleEN: name,
    titleES: es?.name || es?.title || '',
    titleJA: orig,
    synonyms: [...titles].slice(0, 30),
    year: tmdb.extractYear(en),
  };
}

async function resolveTitles(inputId) {
  const cacheKey = `titles:${inputId}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  let result = null;

  // Strategy 1: Direct Amatsu lookup for anilist: IDs
  if (inputId.startsWith('anilist:')) {
    result = await fromAmatsu(inputId);
  }

  // Strategy 2: Pigamer37 lookup for anime source IDs (animeflv:, etc.)
  if (!result && isAnimeSourceId(inputId)) {
    result = await fromPigamer(inputId);
  }

  // Strategy 3: If we have a pigamer result but it lacks EN title, try to enhance
  if (result && (!result.titleEN || result.titleEN.length < 2)) {
    const tmdbId = await getAnimeTMDbId(inputId);
    if (tmdbId) {
      const tmdbResult = await fromTMDB(tmdbId, 'tv');
      if (tmdbResult) {
        result.titleEN = tmdbResult.titleEN || result.titleEN;
        result.titleJA = tmdbResult.titleJA || result.titleJA;
        result.year = tmdbResult.year || result.year;
        const existing = new Set(result.synonyms);
        for (const t of tmdbResult.synonyms) {
          if (!existing.has(t)) result.synonyms.push(t);
        }
      }
    }
  }

  // Strategy 4: Resolve cross-reference ID (kitsu:, mal:, anidb:) then try again
  if (!result && isAnimeXrefId(inputId)) {
    const resolved = await resolveAnimeId(inputId);
    if (resolved) {
      result = await resolveTitles(resolved);
    }
  }

  // Strategy 5: Direct TMDB lookup if input is numeric
  if (!result && inputId.match(/^\d+$/)) {
    result = await fromTMDB(inputId, 'tv');
    if (!result) result = await fromTMDB(inputId, 'movie');
  }

  if (!result) {
    cacheSet(cacheKey, null);
    return null;
  }

  // Build search-safe title array (unique, non-empty, meaningful)
  const allTitles = [];
  const seen = new Set();
  const candidates = [
    result.titleEN, result.titleES, result.titleJA, result.altName,
    ...(result.synonyms || []),
  ];
  for (const t of candidates) {
    if (!t || t.length < 2) continue;
    const clean = t.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    allTitles.push(t.trim());
  }

  result.allTitles = allTitles;
  result.searchTitles = [result.titleEN, result.titleJA, result.titleES, ...(result.synonyms || [])]
    .filter(t => t && t.length >= 3)
    .slice(0, 10);

  cacheSet(cacheKey, result);
  return result;
}

// Convenience: get best search title(s) for a given ID
async function getSearchTitles(inputId) {
  const titles = await resolveTitles(inputId);
  if (!titles) return [];
  return titles.searchTitles;
}

// Get the English title (best for torrent search)
async function getEnglishTitle(inputId) {
  const titles = await resolveTitles(inputId);
  if (!titles) return null;
  return titles.titleEN || titles.searchTitles[0] || null;
}

module.exports = {
  resolveTitles,
  getSearchTitles,
  getEnglishTitle,
  fromTMDB,
  fromAmatsu,
  fromPigamer,
};
