// dedup.js — Stream deduplication pipeline
// v2: Fixed extractServerKey bug (was extracting quality instead of server name)
// v2: Added URL-only dedup pass to catch cross-source duplicates
// v2: Enhanced non-torrent dedup key with quality+languages for precision

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

// ─── URL-only dedup: catches same URL from different sources ──
function dedupeByUrl(streams) {
  const seen = new Set();
  const result = [];
  for (const s of streams) {
    const url = (s.url || s.externalUrl || s.infoHash || '').trim();
    if (!url) { result.push(s); continue; }
    // Normalize URL: lowercase, strip trailing slash+query for comparison
    const normalized = url.toLowerCase().replace(/\/+$/, '').split('?')[0];
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(s);
  }
  return result;
}

function dedupeWithPriority(streams, preferHigherQuality) {
  if (preferHigherQuality === undefined) preferHigherQuality = true;
  const map = new Map();
  const infoHashMap = new Map();

  for (const s of streams) {
    // Torrent dedup: unique by infoHash regardless of source indexer
    if (s.infoHash) {
      const existing = infoHashMap.get(s.infoHash);
      if (!existing) {
        infoHashMap.set(s.infoHash, s);
      } else if (preferHigherQuality) {
        const qTiers = { '4K': 5, '1080p': 4, '720p': 3, '480p': 2, 'HD': 3, 'CAM': 0 };
        const qNew = qTiers[s.quality] || 0;
        const qOld = qTiers[existing.quality] || 0;
        if (qNew > qOld) infoHashMap.set(s.infoHash, s);
        else if (qNew === qOld && (s.seeds || 0) > (existing.seeds || 0)) infoHashMap.set(s.infoHash, s);
      }
      continue;
    }

    // Non-torrent dedup: url + name prefix + quality + languages
    // Include quality and languages to avoid incorrectly merging
    // the same URL with different audio tracks or qualities
    const quality = s.quality || '';
    const langs = Array.isArray(s.languages) ? s.languages.sort().join(',') : '';
    const baseKey = [
      (s.url || s.externalUrl || '').toLowerCase().replace(/\/+$/, '').split('?')[0],
      (s.name || '').toLowerCase().substring(0, 50),
      quality,
      langs,
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
  return [...map.values(), ...infoHashMap.values()];
}

// ─── Extract server name from stream name ──────────────────────
// Name format: "{emoji} {providerLabel}\n{quality} {flags}"
// Example: "📺 Alfa: PelisPanda\n1080p 🇪🇸"
// The server/source is in the FIRST line (providerLabel), not the last
function extractServerKey(s) {
  const nameStr = (s.name || '').toLowerCase();
  const lines = nameStr.split('\n');

  // Extract server from FIRST line (the provider/source label)
  let server = '';
  if (lines.length >= 1) {
    server = lines[0]
      .replace(/^[📺🎬🎥🧲🔗📦⚙️\s]+/, '')  // Strip leading emoji
      .replace(/^(web|alfa):\s*/i, '')              // Strip provider prefix
      .replace(/^backend:\s*/i, '')            // Strip "Backend: " prefix
      .replace(/^pigamer:\s*/i, '')            // Strip "Pigamer: " prefix
      .replace(/^torrent:\s*/i, '')            // Strip "Torrent: " prefix
      .trim();
  }

  // Fallback: if first line is empty, try the quality from last line
  if (!server || server.length < 2) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const cleaned = lines[i]
        .replace(/^[⚙️🔗📦🧲\s]+/, '')
        .replace(/[\u{1F1E6}-\u{1F1FF}]{2,}/ug, '')
        .replace(/\b(4K|UHD|2160p?|1080p?|FHD|720p?|480p?|HD|CAM|TS|TC|SCR)\b/gi, '')
        .trim();
      if (cleaned.length >= 2) {
        server = cleaned;
        break;
      }
    }
  }

  const quality = s.quality || '';
  const langs = Array.isArray(s.languages) ? s.languages.sort().join(',') : '';
  return `${server}|${quality}|${langs}`;
}

function dedupeServerAware(streams) {
  const map = new Map();
  const serverCounts = new Map();

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

module.exports = { buildKey, dedupeStreams, dedupeByUrl, dedupeWithPriority, dedupeServerAware };
