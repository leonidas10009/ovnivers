// deep-search.js — Diagnose WHY search fails for each provider
const cheerio = require('cheerio');
const providers = require('../src/web-providers/providers');

const FAILING = [
  'bloghorror','detodopeliculas','doramasflix','doramedplay','entrepeliculasyseries',
  'legalmentegratis','mirapeliculas','pelisforte','tubeonline','tubepelis',
  'wolfmax4k','yandispoiler','doramasyt','eztv','lacartoons',
  'animeflv','animejl','estrenosanime','hacktorrent','latanime',
  'mundodonghua','repelishd','tiodonghua','tvanime','areadocumental','elitetorrent'
];

// Also check the search-OK-but-video-fails providers for video extraction issues
const VIDEO_FAIL = ['cine24h','genteclic','gnula','serieskao','fullseriehd','seriesretro','animejara','sololatino','repelisplus'];

async function diagnoseSearch(p) {
  const cat = p.categories[0] || 'movie';
  const query = cat === 'anime' ? 'naruto' : 'matrix';
  const searchUrl = p.search.url.replace('{query}', encodeURIComponent(query));
  const url = p.baseUrl + searchUrl;
  
  const result = { name: p.name, title: p.title, url, method: p.search.method || 'GET' };
  
  try {
    const opts = { signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' } };
    let res;
    if (p.search.method === 'POST') {
      const body = (p.search.body || 'query={query}').replace('{query}', encodeURIComponent(query));
      res = await fetch(url, { ...opts, method: 'POST', headers: { ...opts.headers, 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    } else {
      res = await fetch(url, opts);
    }
    result.status = res.status;
    const html = await res.text();
    result.size = html.length;
    
    if (html.length < 1000) {
      result.issue = 'BLOCKED/EMPTY';
      result.sample = html.substring(0, 200);
      return result;
    }
    
    // Check for Cloudflare/Turnstile
    if (html.includes('challenge-platform') || html.includes('turnstile') || html.includes('cf-browser-verify')) {
      result.issue = 'CLOUDFLARE_BLOCKED';
      return result;
    }
    
    // Check for Anubis
    if (html.includes('anubis_challenge')) {
      result.issue = 'ANUBIS_BLOCKED';
      return result;
    }
    
    // Try cheerio with current selectors
    const $ = cheerio.load(html);
    const itemSel = p.search.itemSelector;
    let items;
    if (itemSel === '&') {
      items = $(p.search.linkSelector);
    } else {
      try { items = $(itemSel); } catch(e) { items = $(); }
    }
    result.cheerioItems = items.length;
    
    if (items.length === 0) {
      // Try to find what selectors WOULD work
      // Look for common patterns
      const articles = $('article').length;
      const cards = $('[class*="card"], [class*="item"], [class*="movie"], [class*="post"]').length;
      const links = $('a[href]').length;
      const lis = $('li').length;
      result.domHints = `articles:${articles} cards:${cards} links:${links} lis:${lis}`;
      
      // Try to find search form or alternative search URL
      const searchForm = $('form[action*="search"], form[action*="buscar"], input[name="s"], input[name="q"], input[name="search"]').length;
      result.searchFormFound = searchForm > 0;
      
      result.issue = 'SELECTOR_MISMATCH';
    } else {
      result.issue = 'OK';
      // Show first few titles found
      const titleSel = p.search.titleSelector;
      const titles = [];
      items.slice(0, 5).each((i,el) => {
        let t;
        if (titleSel === '&') t = $(el).text().trim();
        else t = $(el).find(titleSel).first().text().trim() || $(el).text().trim();
        if (t) titles.push(t.substring(0, 50));
      });
      result.titles = titles;
    }
    
  } catch(e) {
    result.status = 'error';
    result.issue = 'FETCH_ERROR';
    result.error = e.message;
  }
  
  return result;
}

async function main() {
  console.log('DEEP SEARCH DIAGNOSIS\n');
  
  // Part 1: Search-failing providers
  console.log('=== SEARCH FAILS (26) ===\n');
  console.log('Provider'.padEnd(22) + 'Status'.padEnd(8) + 'Size'.padEnd(8) + 'Issue'.padEnd(22) + 'DOM hints');
  console.log('-'.repeat(100));
  
  for (const name of FAILING) {
    const p = providers.find(p => p.name === name);
    if (!p || !p.active) continue;
    const r = await diagnoseSearch(p);
    const size = r.size ? (r.size/1024).toFixed(0)+'KB' : '?';
    console.log(
      r.title.padEnd(22) +
      String(r.status||'?').padEnd(8) +
      size.padEnd(8) +
      (r.issue||'?').padEnd(22) +
      (r.domHints || r.sample || '')
    );
    if (r.titles) console.log('  → ' + r.titles.join(' | '));
  }
  
  // Part 2: Video-failing providers  
  console.log('\n=== SEARCH OK / VIDEO FAILS (9) ===\n');
  console.log('Provider'.padEnd(22) + 'Search URL');
  console.log('-'.repeat(80));
  
  for (const name of VIDEO_FAIL) {
    const p = providers.find(p => p.name === name);
    if (!p || !p.active) continue;
    const r = await diagnoseSearch(p);
    const status = r.issue === 'OK' ? '✓ search works' : '✗ ' + r.issue;
    console.log(r.title.padEnd(22) + status);
    if (r.titles) console.log('  → ' + r.titles.join(' | '));
    if (r.domHints) console.log('  DOM: ' + r.domHints);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
