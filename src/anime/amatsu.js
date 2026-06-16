const { AMATSU_BASE, UA } = require('./types');

const metaCache = new Map();
const MAX_CACHE = 300;
const CACHE_TTL = 30 * 60 * 1000;

function cacheGet(key) {
  const entry = metaCache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.value;
  if (entry) metaCache.delete(key);
  return undefined;
}

function cacheSet(key, value) {
  if (metaCache.size >= MAX_CACHE) {
    const first = metaCache.keys().next().value;
    metaCache.delete(first);
  }
  metaCache.set(key, { value, time: Date.now() });
}

async function fetchAmatsu(path, timeout = 8000) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    const res = await fetch(`${AMATSU_BASE}${path}`, {
      headers: { 'User-Agent': UA },
      signal: ctrl.signal
    });
    clearTimeout(timer);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function getMeta(anilistId) {
  const id = anilistId.replace(/^anilist:/, '');
  const ck = `meta:${id}`;
  const cached = cacheGet(ck);
  if (cached) return cached;

  const data = await fetchAmatsu(`/meta/anime/anilist:${id}.json`);
  if (!data?.meta) return null;

  const result = {
    anilistId: `anilist:${id}`,
    malId: data.meta.idMal || null,
    name: data.meta.name,
    englishName: data.meta.englishName,
    altName: data.meta.altName,
    synonyms: data.meta.synonyms || [],
    poster: data.meta.poster || null,
    background: data.meta.background || null,
    description: data.meta.description || null,
    year: data.meta.releaseInfo || null,
    score: data.meta.imdbRating || data.meta.score || null,
    format: (data.meta.description || '').match(/Format:\s*(\S+)/)?.[1] || null,
    status: (data.meta.description || '').match(/Status:\s*(\S+)/)?.[1] || null,
  };

  cacheSet(ck, result);
  return result;
}

async function getSynonyms(anilistId) {
  const meta = await getMeta(anilistId);
  if (!meta) return [];
  const synonyms = [];
  if (meta.name) synonyms.push(meta.name);
  if (meta.englishName && meta.englishName !== meta.name) synonyms.push(meta.englishName);
  if (meta.altName && meta.altName !== meta.name) synonyms.push(meta.altName);
  if (Array.isArray(meta.synonyms)) {
    for (const s of meta.synonyms) {
      if (!synonyms.includes(s)) synonyms.push(s);
    }
  }
  return synonyms;
}

async function getCatalog(catalogId, page = 1) {
  const VALID = ['amatsu_seasonal_series', 'amatsu_airing_series', 'amatsu_trending_series', 'amatsu_top_series'];
  if (!VALID.includes(catalogId)) return { metas: [] };

  const ck = `catalog:${catalogId}:${page}`;
  const cached = cacheGet(ck);
  if (cached) return { metas: cached };

  const data = await fetchAmatsu(`/catalog/anime/${catalogId}.json`, 10000);
  if (!data?.metas?.length) return { metas: [] };

  const metas = data.metas.map(m => ({
    id: m.id,
    type: 'series',
    name: m.name || 'Unknown',
    poster: m.poster || null,
    background: m.background || null,
    description: (m.description || '').substring(0, 500),
    releaseInfo: m.releaseInfo || m.year || '',
    imdbRating: m.imdbRating || m.score || null,
    genres: m.genres || [],
  }));

  cacheSet(ck, metas);
  return { metas };
}

async function searchAnilist(query) {
  const q = encodeURIComponent(query);
  const data = await fetchAmatsu(`/catalog/anime/amatsu_search/search=${q}.json`);
  if (!data?.metas?.length) return [];

  return data.metas.map(m => ({
    id: m.id,
    type: 'series',
    name: m.name || 'Unknown',
    poster: m.poster || null,
    background: m.background || null,
    description: (m.description || '').substring(0, 500),
    releaseInfo: m.releaseInfo || '',
    imdbRating: m.imdbRating || null,
    genres: m.genres || [],
  }));
}

module.exports = { getMeta, getSynonyms, getCatalog, searchAnilist };
