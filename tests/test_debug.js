/**
 * Test con debug para entender dónde falla el flujo
 */
const cheerio = require('cheerio');
const providers = require('./src/alfa-providers/providers');
const { fetchHTML, similarity, searchProvider } = require('./src/alfa-providers/engine');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function debugSearch() {
  // Test 1: Simular resolveTitles manualmente para One Piece
  const title = 'One Piece';
  const year = '1999';
  
  console.log('=== DEBUG: AnimeFLV search for "One Piece" ===');
  
  const animeflv = providers.find(p => p.name === 'animeflv');
  console.log('AnimeFLV config:', JSON.stringify(animeflv.search, null, 2));
  
  // Search URL
  const searchUrl = animeflv.baseUrl + animeflv.search.url.replace('{query}', encodeURIComponent(title));
  console.log('Search URL:', searchUrl);
  
  const html = await fetchHTML(searchUrl);
  if (!html) { console.log('❌ fetchHTML returned null'); return; }
  console.log(`HTML: ${(html.length/1024).toFixed(1)} KB`);
  
  const $ = cheerio.load(html);
  const items = $(animeflv.search.itemSelector).toArray();
  console.log(`Items (${animeflv.search.itemSelector}): ${items.length}`);
  
  if (items.length > 0) {
    const first = $(items[0]);
    const titleEl = animeflv.search.titleSelector === '&' ? first : first.find(animeflv.search.titleSelector).first();
    const itemTitle = animeflv.search.titleAttr ? titleEl.attr(animeflv.search.titleAttr) || '' : titleEl.text().trim();
    const linkEl = animeflv.search.linkSelector === '&' ? first : first.find(animeflv.search.linkSelector).first();
    const itemLink = linkEl.attr('href') || '';
    
    console.log(`First item title: "${itemTitle}"`);
    console.log(`First item link: ${itemLink}`);
    
    // Check similarity
    const sim = similarity(itemTitle, title);
    console.log(`Similarity("${itemTitle}", "${title}"): ${sim}`);
    
    // Check year
    const itemYear = first.text().match(/\b(19|20)\d{2}\b/);
    console.log(`Year in text: ${itemYear ? itemYear[0] : 'none'}`);
    
    // Show top 5 items
    console.log('\nTop 5 items:');
    for (let i = 0; i < Math.min(5, items.length); i++) {
      const el = $(items[i]);
      const t = animeflv.search.titleSelector === '&' ? el : el.find(animeflv.search.titleSelector).first();
      const ti = animeflv.search.titleAttr ? t.attr(animeflv.search.titleAttr) || '' : t.text().trim();
      const l = animeflv.search.linkSelector === '&' ? el : el.find(animeflv.search.linkSelector).first();
      const li = l.attr('href') || '';
      const sim2 = similarity(ti, title);
      console.log(`  [${i}] "${ti}" sim=${sim2.toFixed(3)} link=${li.substring(0, 60)}`);
    }
  }
  
  // Test 2: JKAnime
  console.log('\n=== DEBUG: JKAnime search for "One Piece" ===');
  const jkanime = providers.find(p => p.name === 'jkanime');
  console.log('JKAnime config:', JSON.stringify(jkanime.search, null, 2));
  
  const searchUrl2 = jkanime.baseUrl + jkanime.search.url.replace('{query}', encodeURIComponent(title));
  console.log('Search URL:', searchUrl2);
  
  const html2 = await fetchHTML(searchUrl2);
  if (!html2) { console.log('❌ fetchHTML returned null'); return; }
  console.log(`HTML: ${(html2.length/1024).toFixed(1)} KB`);
  
  const $2 = cheerio.load(html2);
  const items2 = $2(jkanime.search.itemSelector).toArray();
  console.log(`Items (${jkanime.search.itemSelector}): ${items2.length}`);
  
  if (items2.length > 0) {
    const first = $2(items2[0]);
    const titleEl = jkanime.search.titleSelector === '&' ? first : first.find(jkanime.search.titleSelector).first();
    const itemTitle = jkanime.search.titleAttr ? titleEl.attr(jkanime.search.titleAttr) || '' : titleEl.text().trim();
    const linkEl = jkanime.search.linkSelector === '&' ? first : first.find(jkanime.search.linkSelector).first();
    const itemLink = linkEl.attr('href') || '';
    
    console.log(`First item title: "${itemTitle}"`);
    console.log(`First item link: ${itemLink}`);
    console.log(`Similarity: ${similarity(itemTitle, title)}`);
  } else {
    // Debug: show first 3 a[href*="/one-piece/"] links
    console.log('No items - looking for links:');
    $2('a[href*="/one-piece/"]').slice(0, 3).each((i, el) => {
      console.log(`  [${i}] href=${$2(el).attr('href')} text="${$2(el).text().trim().substring(0, 50)}"`);
    });
  }
}

debugSearch().catch(console.error);
