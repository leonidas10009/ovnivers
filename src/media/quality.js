const { QUALITY_TIERS, QUALITY_ORDER } = require('./types');

function extractQuality(text) {
  if (!text) return null;
  const t = text.toUpperCase();
  if (/\b(4K|2160P|UHD)\b/.test(t)) return '4K';
  if (/\b1080P\b/.test(t)) return '1080p';
  if (/\b720P\b/.test(t)) return '720p';
  if (/\b480P\b/.test(t)) return '480p';
  if (/\b360P\b/.test(t)) return '360p';
  if (/\b(CAM|TS|TC|SCR)\b/.test(t)) return 'CAM';
  if (/\b(HD|FHD)\b/.test(t)) return 'HD';
  return null;
}

function getTier(quality) {
  if (!quality) return 0;
  const q = quality.toUpperCase();
  for (const [key, tier] of Object.entries(QUALITY_TIERS)) {
    if (q === key.toUpperCase()) return tier;
  }
  return 0;
}

function compareQuality(a, b) {
  return getTier(b) - getTier(a);
}

function matchesFilter(quality, userQuality) {
  if (!userQuality || userQuality === 'all') return true;
  if (!quality) return true;
  const q = quality.toUpperCase();
  const uq = userQuality.toUpperCase();
  if (uq === '4K' || uq === '2160P' || uq === 'UHD') return q === '4K' || q === '2160P' || q === 'UHD';
  if (uq === '1080P') return q === '1080P' || q === 'FHD';
  if (uq === '720P') return q === '720P' || q === 'HD';
  return true;
}

function normalizeQuality(quality) {
  if (!quality) return 'HD';
  const q = quality.toUpperCase();
  if (q === '2160P' || q === 'UHD') return '4K';
  if (q === 'FHD' || q === 'FULL HD') return '1080p';
  if (q === 'SD') return '480p';
  return quality;
}

function sortByQuality(streams) {
  return [...streams].sort((a, b) => {
    const qa = getTier(a.quality || extractQuality(a.name || ''));
    const qb = getTier(b.quality || extractQuality(b.name || ''));
    return qb - qa;
  });
}

module.exports = {
  extractQuality, getTier, compareQuality,
  matchesFilter, normalizeQuality, sortByQuality,
};
