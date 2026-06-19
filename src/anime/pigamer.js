const { PIGAMER_BASE, UA } = require('./types');

async function fetchPigamer(path, timeout = 25000) {
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

function parseSources(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.streams)) return data.streams;
  return [];
}

async function getStreams(id, season, episode) {
  const data = await fetchPigamer(
    `/stream/series/${encodeURIComponent(id)}.json?season=${season || 1}&episode=${episode || 1}`
  );
  return parseSources(data);
}

async function getMeta(id, type = 'series') {
  return await fetchPigamer(`/meta/${type}/${encodeURIComponent(id)}.json`);
}

function pigamerTypeForCatalogId(catalogId) {
  if (catalogId.startsWith('animeflv')) return 'AnimeFLV';
  if (catalogId.startsWith('animeav1')) return 'AnimeAV1';
  if (catalogId.startsWith('henaojara')) return 'Henaojara';
  if (catalogId.startsWith('tioanime')) return 'TioAnime';
  return 'AnimeFLV';
}

async function getCatalog(catalogId, page = 1) {
  const type = pigamerTypeForCatalogId(catalogId);
  const data = await fetchPigamer(`/catalog/${type}/${encodeURIComponent(catalogId)}.json`, 15000);
  if (!data?.metas?.length) return { metas: [] };
  return { metas: data.metas };
}

module.exports = { getStreams, getMeta, fetchPigamer, getCatalog };
