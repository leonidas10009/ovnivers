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

function extractServerKey(s) {
  const nameStr = (s.name || '').toLowerCase();
  const lines = nameStr.split('\n');
  let server = '';
  for (let i = lines.length - 1; i >= 0; i--) {
    const cleaned = lines[i]
      .replace(/^[⚙️🔗📦🧲\s]+/, '')
      .replace(/[\u{1F1E6}-\u{1F1FF}]{2,}/ug, '')
      .trim();
    if (cleaned.length >= 2) {
      server = cleaned;
      break;
    }
  }
  const quality = s.quality || '';
  const langs = Array.isArray(s.languages) ? s.languages.sort().join(',') : '';
  return `${server}|${quality}|${langs}`;
}

function dedupeServerAware(streams) {
  const map = new Map();
  const serverCounts = new Map(); // track how many per server key
  
  for (const s of streams) {
    const sk = extractServerKey(s);
    if (!sk || sk.startsWith('|')) {
      map.set(s.url || s.infoHash || Math.random().toString(36), s);
      continue;
    }
    const existing = map.get(sk);
    const count = serverCounts.get(sk) || 0;
    
    if (!existing) {
      map.set(sk, s);
      serverCounts.set(sk, 1);
      continue;
    }
    
    // Keep up to 2 streams per server (different URLs/files)
    const newIsDirect = s.url && s.behaviorHints && !s.behaviorHints.notWebReady;
    const oldIsDirect = existing.url && existing.behaviorHints && !existing.behaviorHints.notWebReady;
    
    if (newIsDirect && !oldIsDirect) {
      map.set(sk, s); // replace embed with direct
    } else if (count < 2) {
      // Keep as additional variant (different URL, same server)
      const variantKey = sk + '|v' + count;
      map.set(variantKey, s);
      serverCounts.set(sk, count + 1);
    } else if (!newIsDirect && !oldIsDirect) {
      const qTiers = { '4K': 5, '1080p': 4, '720p': 3, '480p': 2, 'HD': 3, 'CAM': 0 };
      const qNew = qTiers[s.quality] || 0;
      const qOld = qTiers[existing.quality] || 0;
      if (qNew > qOld) map.set(sk, s);
    }
  }
  return [...map.values()];
}

module.exports = { buildKey, dedupeStreams, dedupeWithPriority, dedupeServerAware };
