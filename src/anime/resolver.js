const { PIGAMER_BASE, isAnimeSourceId, isAnimeXrefId } = require('./types');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const resolveCache = new Map();
const tmdbCache = new Map();
const MAX_CACHE = 500;
const RESOLVE_TTL = 24 * 60 * 60 * 1000;
const TMDB_TTL = 24 * 60 * 60 * 1000;

function cacheGet(map, key, ttl) {
  const entry = map.get(key);
  if (entry && Date.now() - entry.time < ttl) return entry.value;
  if (entry) map.delete(key);
  return undefined;
}

function cacheSet(map, key, value, max) {
  if (map.size >= max) {
    const first = map.keys().next().value;
    map.delete(first);
  }
  map.set(key, { value, time: Date.now() });
}

async function fetchPigamer(path, timeout = 15000) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    const res = await fetch(`${PIGAMER_BASE}${path}`, {
      headers: { 'User-Agent': UA },
      signal: ctrl.signal
    });
    clearTimeout(timer);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

async function resolveAnimeId(id) {
  if (isAnimeSourceId(id)) return id;
  if (!isAnimeXrefId(id)) return null;

  const cached = cacheGet(resolveCache, id, RESOLVE_TTL);
  if (cached !== undefined) return cached;

  try {
    const meta = await fetchPigamer(`/meta/series/${encodeURIComponent(id)}.json`);
    if (meta?.meta?.id && isAnimeSourceId(meta.meta.id)) {
      cacheSet(resolveCache, id, meta.meta.id, MAX_CACHE);
      return meta.meta.id;
    }
  } catch {}

  cacheSet(resolveCache, id, null, MAX_CACHE);
  return null;
}

async function getAnimeTMDbId(id) {
  const cached = cacheGet(tmdbCache, id, TMDB_TTL);
  if (cached !== undefined) return cached;

  try {
    const meta = await fetchPigamer(`/meta/series/${encodeURIComponent(id)}.json`);
    if (meta?.meta) {
      let tmdbId = null;
      if (Array.isArray(meta.meta.links)) {
        for (const link of meta.meta.links) {
          if (link.category === 'tmdb' || (typeof link.name === 'string' && link.name.toLowerCase().includes('tmdb'))) {
            const match = (link.url || '').match(/\/(\d+)$/);
            if (match) { tmdbId = match[1]; break; }
          }
        }
      }
      if (!tmdbId && meta.meta.tmdb_id) tmdbId = String(meta.meta.tmdb_id);
      if (tmdbId) {
        cacheSet(tmdbCache, id, tmdbId, MAX_CACHE);
        return tmdbId;
      }
    }
  } catch {}

  cacheSet(tmdbCache, id, null, MAX_CACHE);
  return null;
}

async function resolveToTMDbId(rawId, mediaType, isAnime) {
  if (!isAnime) return null;

  if (rawId.match(/^\d+$/)) return rawId;

  const proxyId = await resolveAnimeId(rawId) || rawId;
  const tmdbId = await getAnimeTMDbId(proxyId);
  if (tmdbId) return tmdbId;

  return proxyId;
}

module.exports = { resolveAnimeId, getAnimeTMDbId, resolveToTMDbId };
