const cheerio = require('cheerio');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function checkSearch(name, url, selectors) {
  console.log(`\n${'='.repeat(60)}\n🔍 ${name}\n${'='.repeat(60)}`);
  console.log(`URL: ${url}`);
  try {
    const ac = new AbortController(); setTimeout(() => ac.abort(), 15000);
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ac.signal });
    if (!res.ok) { console.log(`❌ HTTP ${res.status}`); return; }
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log(`HTML: ${(html.length/1024).toFixed(1)} KB`);
    
    for (const { sel, desc } of selectors) {
      const items = $(sel).toArray();
      console.log(`\n  ${desc} (${sel}): ${items.length}`);
      if (items.length > 0) {
        const first = $(items[0]);
        const text = first.text().trim().substring(0, 80) || '(empty)';
        const htmlSnippet = $.html(first).substring(0, 300);
        console.log(`  First text: "${text}"`);
        console.log(`  First HTML: ${htmlSnippet}`);
        // Find links
        const link = first.find('a').first().attr('href') || first.closest('a').attr('href') || '';
        console.log(`  Link: ${link}`);
      }
    }
  } catch (e) {
    console.log(`❌ ${e.message}`);
  }
}

(async () => {
  // Test MonosChinos search
  await checkSearch('MonosChinos search', 'https://vww.monoschinos2.net/animes?buscar=one+piece', [
    { sel: '.card-item, .item-card, .col-item, .anime-item, .item', desc: 'Generic items' },
    { sel: '.tarjeta, .card', desc: 'Card items' },
    { sel: 'a[href*="/anime/"]', desc: 'Anime links' },
  ]);

  // Also check if MundoDonghua supports other search params
  await checkSearch('MundoDonghua ?s=', 'https://www.mundodonghua.com/?s=one+piece', [
    { sel: '.md-card', desc: 'MD Cards' },
  ]);
  
  // Check if there's a search API endpoint
  await checkSearch('MundoDonghua /busquedas/ without query', 'https://www.mundodonghua.com/busquedas/', [
    { sel: '.md-card', desc: 'MD Cards' },
    { sel: 'body', desc: 'Body text' },
  ]);
})();
