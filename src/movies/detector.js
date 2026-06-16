const { extractYear } = require('../media/tmdb');

function verifyYear(title, expectedYear, tolerance = 0) {
  if (!expectedYear) return { match: true, score: 0, foundYear: null };
  const found = extractYearFromTitle(title);
  if (!found) return { match: true, score: 0, foundYear: null };
  const diff = Math.abs(found - expectedYear);
  if (diff <= tolerance) return { match: true, score: diff === 0 ? 0.10 : 0.03, foundYear: found };
  return { match: false, score: -0.40, foundYear: found };
}

function extractYearFromTitle(title) {
  if (!title) return null;
  const m = title.match(/\b(19[5-9]\d|20[0-3]\d)\b/);
  return m ? parseInt(m[1]) : null;
}

function isMovieTitle(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  if (/s\d{1,2}\s*e\d{1,2}/i.test(t)) return false;
  if (/\b(season|episode|complete series|s\d{2})\b/i.test(t)) return false;
  return true;
}

function scoreMovieMatch(torrent, query, expectedYear) {
  let score = 0;
  const title = (torrent.title || torrent.name || '');

  const yearCheck = verifyYear(title, expectedYear);
  score += yearCheck.score;

  if (torrent.quality === '4K') score += 0.05;
  else if (torrent.quality === '1080p') score += 0.03;

  if (torrent.source === 'BluRay' || torrent.source === 'Remux') score += 0.03;
  if (torrent.codec === 'HEVC' || torrent.codec === 'AV1') score += 0.02;
  if (torrent.verified) score += 0.03;

  return score;
}

module.exports = { verifyYear, extractYearFromTitle, isMovieTitle, scoreMovieMatch };
