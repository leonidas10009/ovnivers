const cheerio = require('cheerio');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const BASE = 'https://glodls.to';

async function search(query, page = 1) {
  const url = `${BASE}/search_results.php?search=${encodeURIComponent(query)}${page > 1 ? `&page=${page}` : ''}`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];

    $('table.ttable_headinner tr.t-row').each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length < 6) return;

      const nameEl = $(cols[1]).find('a[title]').first();
      const name = nameEl.attr('title') || nameEl.text().trim();
      if (!name) return;

      const magnet = $(row).find('a[href^="magnet:"]').attr('href');
      if (!magnet) return;

      const infoHash = magnet.match(/btih:([a-fA-F0-9]{40})/i)?.[1]?.toLowerCase();
      if (!infoHash) return;

      const size = $(cols[4]).text().trim();
      const seedStr = $(cols[5]).text().trim();
      const seeds = parseInt(seedStr) || 0;

      let quality = 'HD';
      const qMatch = name.match(/\b(4K|2160p|1080p|720p|480p)\b/i);
      if (qMatch) quality = qMatch[1];

      const isHDR = name.includes('HDR') || name.includes('HDR10') ? true : false;
      const isDual = /Dual|AC3|DTS/i.test(name);

      results.push({ name, infoHash, magnet, seeds, size, quality, isHDR, isDual });
    });

    results.sort((a, b) => b.seeds - a.seeds);
    return results;
  } catch {
    return [];
  }
}

module.exports = { search };
