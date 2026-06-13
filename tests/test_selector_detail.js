const cheerio = require('cheerio');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function checkItemHTML(name, url, itemSel) {
  console.log(`\n--- ${name} ---`);
  try {
    const ac = new AbortController(); setTimeout(() => ac.abort(), 15000);
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ac.signal });
    if (!res.ok) { console.log(`❌ HTTP ${res.status}`); return; }
    const html = await res.text();
    const $ = cheerio.load(html);
    const items = $(itemSel).toArray();
    console.log(`Items: ${items.length}`);
    if (items.length > 0) {
      console.log(`First ${itemSel} HTML:\n${$.html(items[0]).substring(0, 800)}`);
    } else {
      console.log(`Preview (600 chars): ${html.substring(0, 600)}`);
    }
  } catch (e) {
    console.log(`❌ ${e.message}`);
  }
}

(async () => {
  // Check article structure for the ones with empty h2
  await checkItemHTML('AnimeJL', 'https://www.anime-jl.net/?s=one+piece', 'article.Anime');
  await checkItemHTML('EstrenosAnime', 'https://estrenosanime.net/buscar?q=one+piece', '.item');
  // Try different URL patterns for EstrenosAnime
  await checkItemHTML('EstrenosAnime (search)', 'https://estrenosanime.net/?s=one+piece', '.item');
  // Check MundoDonghua structure
  await checkItemHTML('MundoDonghua', 'https://www.mundodonghua.com/?s=one+piece', '.md-card, .post, a[href*="/ver/"]');
  // Check SoloLatino  
  await checkItemHTML('SoloLatino', 'https://sololatino.net/?s=one+piece', '.card, a[href*="/anime/"]');
  // Check TioDonghua article children
  await checkItemHTML('TioDonghua', 'https://tiodonghua.com/?s=one+piece', 'article');
  // Check PelisPanda
  await checkItemHTML('PelisPanda', 'https://pelispanda.com/?s=one+piece', 'body');
  // Check HackTorrent
  await checkItemHTML('HackTorrent', 'https://hacktorrent.to/?s=one+piece', 'body');
  // Check PelisPlus
  await checkItemHTML('PelisPlus', 'https://ww3.pelisplus.to/search?q=one+piece', 'body');
})();
