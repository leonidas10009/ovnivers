function buildKey(stream) {
  const parts = [
    stream.infoHash || '',
    stream.url || stream.externalUrl || '',
  ];
  const name = (stream.name || '').toLowerCase();
  const quality = stream.quality || '';
  const langs = Array.isArray(stream.languages) ? stream.languages.sort().join(',') : '';

  if (quality) parts.push(quality);
  if (langs) parts.push(langs);

  const namePrefix = name.substring(0, 50);
  parts.push(namePrefix);

  return parts.join('|');
}

function dedupeStreams(streams) {
  const seen = new Set();
  const out = [];
  for (const s of streams) {
    const key = buildKey(s);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function dedupeWithPriority(streams, preferHigherQuality = true) {
  const map = new Map();
  for (const s of streams) {
    const baseKey = [
      s.infoHash || '',
      s.url || s.externalUrl || '',
      (s.name || '').toLowerCase().substring(0, 50),
    ].join('|');

    const existing = map.get(baseKey);
    if (!existing) {
      map.set(baseKey, s);
      continue;
    }

    if (preferHigherQuality) {
      const qTiers = { '4K': 5, '1080p': 4, '720p': 3, '480p': 2, 'HD': 3, 'CAM': 0 };
      const qNew = qTiers[s.quality] || 0;
      const qOld = qTiers[existing.quality] || 0;
      if (qNew > qOld) map.set(baseKey, s);
    }
  }
  return [...map.values()];
}

module.exports = { buildKey, dedupeStreams, dedupeWithPriority };
