const cheerio = require('cheerio');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function testProvider(name, url, selector, titleSel, linkSel) {
  console.log(`\n--- ${name} ---`);
  console.log(`URL: ${url}`);
  try {
    const ac = new AbortController(); setTimeout(() => ac.abort(), 10000);
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ac.signal });
    console.log(`Status: ${res.status}`);
    if (!res.ok) { console.log(`❌ HTTP ${res.status}`); return; }
    const html = await res.text();
    console.log(`HTML: ${(html.length / 1024).toFixed(1)} KB`);
    const $ = cheerio.load(html);
    const items = $(selector).toArray();
    console.log(`Items (${selector}): ${items.length}`);
    if (items.length > 0) {
      const first = $(items[0]);
      const t = titleSel === '&' ? first : first.find(titleSel).first();
      console.log(`Title: "${t.text().trim().substring(0, 100)}"`);
      const l = linkSel === '&' ? first : first.find(linkSel).first();
      console.log(`Link: ${l.attr('href') || ''}`);
    } else {
      // Find any links/items that look like search results
      console.log('Searching for any links containing "one piece":');
      $('a[href*="one-piece"]').each((i, el) => {
        if (i > 4) return;
        console.log(`  ${$(el).text().trim().substring(0, 60)} -> ${$(el).attr('href')}`);
      });
      // Show first 1000 chars of body
      console.log('Body start:', html.substring(0, 1000));
    }
  } catch (e) {
    console.log(`❌ ${e.message}`);
  }
}

(async () => {
  // JKAnime - debug HTML structure
  await testProvider('JKAnime', 'https://jkanime.net/buscar/one%20piece', '.anime-item', '.title', 'a');

  // AnimeFLV with the actual encoded URL the addon would use  
  await testProvider('AnimeFLV (encoded)', 'https://www3.animeflv.net/browse?q=One%20Piece', 'ul.ListAnimes li', 'h3.Title', 'a');

  // Also test the ?s= ones to see actual HTML structure
  await testProvider('AnimeJL (debug)', 'https://www.anime-jl.net/?s=one+piece', 'article', 'h2', 'a');
  await testProvider('HenaoJara (debug)', 'https://henaojara.com/?s=one+piece', 'article', 'h2', 'a');
})();
