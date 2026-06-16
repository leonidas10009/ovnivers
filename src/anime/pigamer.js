const { PIGAMER_BASE, UA } = require('./types');

async function fetchPigamer(path, timeout = 20000) {
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

module.exports = { getStreams, getMeta, fetchPigamer };
