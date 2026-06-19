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

  // Strategy 1: Pigamer37 /meta resolution
  try {
    const meta = await fetchPigamer(`/meta/series/${encodeURIComponent(id)}.json`);
    if (meta?.meta?.id && isAnimeSourceId(meta.meta.id)) {
      cacheSet(resolveCache, id, meta.meta.id, MAX_CACHE);
      return meta.meta.id;
    }
  } catch {}

  // Strategy 2: Direct relations.yuna.moe → tmdb: → Pigamer37
  try {
    const parts = id.split(':');
    if (parts.length === 2) {
      const source = parts[0]; // e.g. kitsu, anilist, mal, anidb
      const numId = parts[1];
      const relCtrl = new AbortController();
      const relTimer = setTimeout(() => relCtrl.abort(), 10000);
      const relRes = await fetch(
        `https://relations.yuna.moe/api/v2/ids?source=${source}&id=${numId}`,
        { headers: { 'User-Agent': UA }, signal: relCtrl.signal }
      );
      clearTimeout(relTimer);
      if (relRes.ok) {
        const rel = await relRes.json();
        const tmdbId = rel?.themoviedb || rel?.themoviedb_id;
        if (tmdbId) {
          const tmdbStr = `tmdb:${tmdbId}`;
          cacheSet(resolveCache, id, tmdbStr, MAX_CACHE);
          return tmdbStr;
        }
        const anilistId = rel?.anilist;
        if (anilistId && source !== 'anilist') {
          const anilistStr = `anilist:${anilistId}`;
          const meta2 = await fetchPigamer(`/meta/series/${encodeURIComponent(anilistStr)}.json`);
          if (meta2?.meta?.id && isAnimeSourceId(meta2.meta.id)) {
            cacheSet(resolveCache, id, meta2.meta.id, MAX_CACHE);
            return meta2.meta.id;
          }
        }
      }
    }
  } catch {}

  // Strategy 3: Kitsu API → get title → search AniList/Amatsu → Pigamer37
  if (id.startsWith('kitsu:')) {
    try {
      const kitsuId = id.split(':')[1];
      const kCtrl = new AbortController();
      const kTimer = setTimeout(() => kCtrl.abort(), 8000);
      const kRes = await fetch(
        `https://kitsu.io/api/edge/anime/${kitsuId}`,
        { headers: { 'Accept': 'application/vnd.api+json', 'User-Agent': UA }, signal: kCtrl.signal }
      );
      clearTimeout(kTimer);
      if (kRes.ok) {
        const kData = await kRes.json();
        const attrs = kData?.data?.attributes;
        const titles = [
          attrs?.canonicalTitle,
          attrs?.titles?.en,
          attrs?.titles?.en_jp,
          attrs?.titles?.ja_jp,
        ].filter(Boolean);
        // Search Amatsu by title to get anilist ID
        for (const title of titles.slice(0, 2)) {
          const aCtrl = new AbortController();
          const aTimer = setTimeout(() => aCtrl.abort(), 8000);
          const aRes = await fetch(
            `https://amatsu.ruka.pw/catalog/anime/amatsu_search/search=${encodeURIComponent(title)}.json`,
            { headers: { 'User-Agent': UA }, signal: aCtrl.signal }
          );
          clearTimeout(aTimer);
          if (aRes.ok) {
            const aData = await aRes.json();
            const match = aData?.metas?.find(m => m.id?.startsWith('anilist:'));
            if (match) {
              const meta = await fetchPigamer(`/meta/series/${encodeURIComponent(match.id)}.json`);
              if (meta?.meta?.id && isAnimeSourceId(meta.meta.id)) {
                cacheSet(resolveCache, id, meta.meta.id, MAX_CACHE);
                return meta.meta.id;
              }
            }
          }
        }
      }
    } catch {}
  }

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
