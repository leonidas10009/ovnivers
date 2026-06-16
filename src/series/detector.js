function extractSE(title) {
  if (!title) return null;
  const m = title.match(/[Ss](\d{1,2})\s*[Ee](\d{1,2})/);
  if (!m) return null;
  return { season: parseInt(m[1]), episode: parseInt(m[2]) };
}

function verifySE(title, expectedSeason, expectedEpisode) {
  if (expectedSeason === undefined || expectedEpisode === undefined) {
    return { match: true, score: 0, found: null };
  }
  const se = extractSE(title);
  if (!se) return { match: true, score: 0, found: null };
  if (se.season === expectedSeason && se.episode === expectedEpisode) {
    return { match: true, score: 0.12, found: se };
  }
  if (se.season === expectedSeason) {
    return { match: true, score: 0.03, found: se };
  }
  return { match: false, score: -0.30, found: se };
}

function isEpisodeTitle(title) {
  if (!title) return false;
  return /[Ss]\d{1,2}\s*[Ee]\d{1,2}/i.test(title);
}

function isPack(title) {
  if (!title) return false;
  const t = title.toLowerCase();
  return /\b(complete|season\s*\d+\s*(complete|pack)|s\d{1,2}\s*(complete|pack)|all\s*episodes|full\s*season)\b/i.test(t);
}

function scoreEpisodeMatch(torrent, query, expectedYear, expectedSeason, expectedEpisode) {
  let score = 0;
  const title = (torrent.title || torrent.name || '');

  const seCheck = verifySE(title, expectedSeason, expectedEpisode);
  score += seCheck.score;

  if (torrent.quality === '4K') score += 0.05;
  else if (torrent.quality === '1080p') score += 0.03;

  if (torrent.source === 'BluRay' || torrent.source === 'Remux') score += 0.02;
  if (torrent.codec === 'HEVC' || torrent.codec === 'AV1') score += 0.01;
  if (torrent.verified) score += 0.03;

  return score;
}

module.exports = { extractSE, verifySE, isEpisodeTitle, isPack, scoreEpisodeMatch };
