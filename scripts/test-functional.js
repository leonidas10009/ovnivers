// test-functional.js — Verify search selectors for active providers
const cheerio = require('cheerio');
const providers = require('../src/web-providers/providers');

const FUNCTIONAL = ['cinecalidad','pelispedia','divxtotal','serieskao','animejara','jkanime','repelisplus',
  'tioanime','animeflv','pelispanda','doramasflix','sololatino',
  'animejl','pelisplus','documentalesonline','bloghorror','cine24h',
  'detodopeliculas','dontorrent','elitetorrent','entrepeliculasyseries',
  'fullseriehd','gnula','genteclic','hacktorrent','lacartoons','latanime',
  'legalmentegratis','mejortorrent','mirapeliculas','mundodonghua',
  'pelicinehd','pelisforte','poseidonhd','seriesretro','tiodonghua',
  'tubeonline','tubepelis','tvanime','wolfmax4k','yandispoiler'];

async function testSearch(provider, query) {
  const searchUrl = provider.search.url.replace('{query}', encodeURIComponent(query));
  const url = provider.baseUrl + searchUrl;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' } });
    if (!res.ok) return { status: res.status, items: 0, titles: [] };
    const html = await res.text();
    const $ = cheerio.load(html);
    const itemSel = provider.search.itemSelector;
    const titleSel = provider.search.titleSelector;
    
    let items;
    if (itemSel === '&') {
      items = $(provider.search.linkSelector).filter((i,el) => $(el).attr('href')?.includes(query.toLowerCase()));
    } else {
      items = $(itemSel);
      if (titleSel && titleSel !== '&' && titleSel !== 'h2') {
        items = items.filter((i,el) => $(el).find(titleSel).length > 0);
      }
    }
    
    const titles = [];
    items.slice(0, 5).each((i,el) => {
      let t;
      if (titleSel === '&') t = $(el).text().trim();
      else if (provider.search.titleAttr) t = $(el).find(titleSel).attr(provider.search.titleAttr) || $(el).text().trim();
      else t = $(el).find(titleSel).first().text().trim() || $(el).text().trim();
      if (t) titles.push(t.substring(0, 60));
    });
    
    return { status: res.status, items: items.length, titles, htmlSize: html.length };
  } catch(e) { return { error: e.message, items: 0, titles: [] }; }
}

async function main() {
  console.log('Testing search selectors on functional providers...\n');
  console.log('Provider'.padEnd(22) + ' | Items | Status | Size  | Query');
  console.log('-'.repeat(80));

  for (const name of FUNCTIONAL) {
    const p = providers.find(p => p.name === name);
    if (!p || !p.active) continue;
    const cat = p.categories[0] || 'movie';
    const query = cat === 'anime' ? 'naruto' : 'matrix';
    const r = await testSearch(p, query);
    const ok = r.items > 0;
    const icon = ok ? 'OK' : 'FAIL';
    const status = r.error || r.status || '?';
    const size = r.htmlSize ? (r.htmlSize / 1024).toFixed(0) + 'KB' : '0KB';
    console.log(icon + ' ' + p.title.padEnd(20) + ' | ' + String(r.items).padEnd(5) + ' | ' + String(status).padEnd(6) + ' | ' + size.padEnd(5) + ' | ' + query);
    if (r.titles && r.titles.length > 0) {
      console.log('  → ' + r.titles.join(' | '));
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
