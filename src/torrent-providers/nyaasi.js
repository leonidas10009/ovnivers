const cheerio = require('cheerio-without-node-native') || require('cheerio');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const BASE = 'https://nyaa.si';
const CATEGORIES = {
  anime: '1_0',
  movie: '0_0',
  all: '0_0'
};

async function search(query, category = 'anime', page = 1) {
  const cat = CATEGORIES[category] || CATEGORIES.all;
  const url = `${BASE}/?q=${encodeURIComponent(query)}&f=0&c=${cat}&p=${page}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];

    $('table.torrent-list > tbody > tr').each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length < 5) return;

      const nameEl = $(cols[1]).find('a:last-child');
      const name = nameEl.text().trim();

      const magnetEl = $(cols[2]).find('a[href^="magnet:"]');
      const magnet = magnetEl.attr('href');
      if (!magnet) return;

      const infoHash = magnet.match(/btih:([a-fA-F0-9]{40})/i)?.[1]?.toLowerCase();
      if (!infoHash) return;

      const size = $(cols[3]).text().trim();
      const seedStr = $(cols[5]).text().trim();
      const seeds = parseInt(seedStr) || 0;
      const leechStr = $(cols[6]).text().trim();
      const leechers = parseInt(leechStr) || 0;

      let quality = 'HD';
      const qMatch = name.match(/\b(4K|2160p|1080p|720p|480p|360p)\b/i);
      if (qMatch) quality = qMatch[1];

      results.push({ name, infoHash, magnet, seeds, leechers, size, quality });
    });

    results.sort((a, b) => b.seeds - a.seeds);
    return results;
  } catch {
    return [];
  }
}

function getInfoHash(magnet) {
  const m = magnet.match(/btih:([a-fA-F0-9]{40})/i);
  return m ? m[1].toLowerCase() : null;
}

module.exports = { search, getInfoHash };
