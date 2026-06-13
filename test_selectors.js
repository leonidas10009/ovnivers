const cheerio = require('cheerio');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function exploreHTML(name, url, knownSelectors) {
  console.log(`\n--- ${name} ---`);
  try {
    const ac = new AbortController(); setTimeout(() => ac.abort(), 10000);
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ac.signal });
    if (!res.ok) { console.log(`❌ HTTP ${res.status}`); return; }
    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Try known selectors
    for (const sel of knownSelectors) {
      console.log(`  ${sel}: ${$(sel).length}`);
    }
    
    // Search for items with links that might be anime results
    console.log('  Looking for result patterns...');
    // Find sections that contain anime links
    const animeLinks = $('a[href*="/anime/"], a[href*="/ver/"], a[href*="/watch/"], a[href*="/episodio/"]').slice(0, 3);
    console.log(`  Anime links found: ${animeLinks.length}`);
    animeLinks.each((i, el) => {
      console.log(`    [${i}] ${$(el).text().trim().substring(0, 60)} -> ${$(el).attr('href')}`);
    });
    
    // Show general page structure
    console.log('  Body class:', $('body').attr('class') || 'none');
    console.log('  Main element:', $('main, .main, #main, .content, #content').length > 0 ? 'found' : 'not found');
    
    // Show search result container
    const searchContainers = $('.search-results, .results, .lista, .grid, .items, .entries, .row, .posts, .post-grid');
    console.log(`  Search containers: ${searchContainers.length}`);
    if (searchContainers.length > 0) {
      const first = searchContainers.first();
      console.log(`  First container class: ${first.attr('class')}`);
      console.log(`  Children: ${first.children().length}`);
      const firstChild = first.children().first();
      if (firstChild.length) {
        console.log(`  First child tag: ${firstChild.get(0).tagName}, class: ${firstChild.attr('class') || 'none'}`);
        console.log(`  First child HTML (200): ${$.html(firstChild).substring(0, 200)}`);
      }
    }
    
    // Search for any h2, h3, h4 that contain "One" or "one"
    const headers = $('h2, h3, h4, h5').filter((i, el) => {
      const t = $(el).text().toLowerCase();
      return t.includes('one') || t.includes('piece');
    }).slice(0, 3);
    console.log(`  Matching headers: ${headers.length}`);
    headers.each((i, el) => {
      const tag = el.tagName;
      const text = $(el).text().trim().substring(0, 80);
      const parent = $(el).parent().get(0)?.tagName || '?';
      const parentClass = $(el).parent().attr('class') || '';
      console.log(`    <${tag}> "${text}" parent: <${parent} class="${parentClass}">`);
    });
    
  } catch (e) {
    console.log(`❌ ${e.message}`);
  }
}

(async () => {
  await exploreHTML('EstrenosAnime', 'https://estrenosanime.net/?s=one+piece', ['article', '.item', '.post', '.entry', '.card', '.anime-item', '.Anime']);
  await exploreHTML('MundoDonghua', 'https://www.mundodonghua.com/?s=one+piece', ['article', '.item', '.post', '.entry', '.card', '.donghua-item', '.anime-item']);
  await exploreHTML('SoloLatino', 'https://sololatino.net/?s=one+piece', ['article', '.item', '.post', '.entry', '.card', '.result-item', '.search-item']);
  await exploreHTML('PelisPanda', 'https://pelispanda.com/?s=one+piece', ['article', '.item', '.post', '.entry', '.card', '.result-item', '.search-item']);
  await exploreHTML('HackTorrent', 'https://hacktorrent.to/?s=one+piece', ['article', '.item', '.post', '.entry', '.card', '.result-item']);
  await exploreHTML('PelisPlus', 'https://ww3.pelisplus.to/search?q=one+piece', ['.item', '.post', '.card', '.result-item', 'a[href*="/pelicula/"]']);
  await exploreHTML('AnimeJL', 'https://www.anime-jl.net/?s=one+piece', ['article', '.Anime', '.item', '.post', '.entry', '.card']);
  await exploreHTML('HenaoJara', 'https://henaojara.com/?s=one+piece', ['article', '.TPost', '.item', '.post', '.entry']);
})();
