// audit-all.js — Full audit: search + video extraction on ALL active providers
const { searchProvider, getEpisodeUrl, extractVideos, fetchHTML } = require('../src/alfa-providers/engine');
const { StaticScraper } = require('../src/intelligent');
const providers = require('../src/alfa-providers/providers');

const QUERIES = { movie: 'matrix', tvshow: 'breaking bad', anime: 'naruto', documentary: 'matrix', torrent: 'matrix' };

function extractServerKey(url) {
  try { return new URL(url).hostname.replace(/^(www\d*\.|embed\.|v\.)/, '').split('.')[0]; }
  catch { return (url || '').substring(0, 15); }
}

async function auditProvider(p) {
  const cat = p.categories[0] || 'movie';
  const query = QUERIES[cat] || 'matrix';
  const result = {
    name: p.name, title: p.title, baseUrl: p.baseUrl, cat,
    search: { ok: false, items: 0, url: null, error: null },
    video: { ok: false, count: 0, servers: [], errors: [] },
    static: { alive: false, goal: null, serversFound: 0 },
  };

  // Phase 1: Static health check
  try {
    const ss = new StaticScraper();
    const sr = await ss.analyze(p.baseUrl);
    result.static.alive = sr.urlsFound > 0;
    result.static.goal = sr.goal;
    result.static.serversFound = sr.serverCatalog.length;
  } catch(e) { result.static.error = e.message; }

  if (!result.static.alive) return result;

  // Phase 2: Search test
  try {
    const searchUrl = await searchProvider(p, query, null, cat === 'tvshow' ? 'tv' : 'movie');
    if (searchUrl) {
      result.search.ok = true;
      result.search.url = searchUrl;
    }
  } catch(e) { result.search.error = e.message; }

  // Phase 3: Video extraction
  if (result.search.ok) {
    let vUrl = result.search.url;
    // Try episode for anime/tvshow
    if ((cat === 'anime' || cat === 'tvshow') && p.episodes) {
      try {
        const ep = await getEpisodeUrl(p, vUrl, 1, 1);
        if (ep) vUrl = ep;
      } catch(e) {}
    }
    try {
      const videos = await extractVideos(p, vUrl);
      if (videos?.length) {
        result.video.ok = true;
        result.video.count = videos.length;
        result.video.servers = [...new Set(videos.map(v => v.server || extractServerKey(v.url||'')))];
      }
    } catch(e) { result.video.errors.push(e.message); }
  }

  return result;
}

async function main() {
  const active = providers.filter(p => p.active);
  console.log(`Auditing ${active.length} active providers...\n`);
  
  const results = [];
  for (let i = 0; i < active.length; i++) {
    const p = active[i];
    process.stdout.write(`[${String(i+1).padStart(2)}/${active.length}] ${p.title.padEnd(22)} `);
    const r = await auditProvider(p);
    results.push(r);
    
    const icons = [
      r.static.alive ? '🟢' : '🔴',
      r.search.ok ? '🔍' : '  ',
      r.video.ok ? '🎬' : '  ',
    ];
    console.log(`${icons.join('')} | search:${r.search.ok ? 'OK' : 'FAIL'} | video:${r.video.count || 0}v`);
    if (r.search.error) console.log(`       error: ${r.search.error}`);
  }

  // Summary
  console.log('\n' + '='.repeat(90));
  console.log('SUMMARY');
  console.log('='.repeat(90));

  const categories = {
    fullWork: [],    // search + video work
    searchOnly: [],  // search works, video fails
    dead: [],        // site unreachable
    noSearch: [],    // site alive but search fails
  };

  for (const r of results) {
    if (!r.static.alive) categories.dead.push(r);
    else if (r.video.ok) categories.fullWork.push(r);
    else if (r.search.ok) categories.searchOnly.push(r);
    else categories.noSearch.push(r);
  }

  console.log(`\n✓ FULL PIPELINE (search + video): ${categories.fullWork.length}`);
  for (const r of categories.fullWork) {
    const servers = r.video.servers.slice(0, 6).join(', ');
    console.log(`  ${r.title.padEnd(22)} ${r.video.count}v [${servers}]`);
  }

  console.log(`\n⚠ SEARCH OK / VIDEO FAILS: ${categories.searchOnly.length}`);
  for (const r of categories.searchOnly) {
    console.log(`  ${r.title.padEnd(22)} ${r.search.url?.substring(0,60) || ''}`);
  }

  console.log(`\n✗ SITE ALIVE / SEARCH FAILS: ${categories.noSearch.length}`);
  for (const r of categories.noSearch) {
    console.log(`  ${r.title.padEnd(22)} ${r.baseUrl} — ${r.static.goal || '?'}`);
  }

  console.log(`\n💀 DEAD: ${categories.dead.length}`);
  for (const r of categories.dead) {
    console.log(`  ${r.title.padEnd(22)} ${r.baseUrl}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
