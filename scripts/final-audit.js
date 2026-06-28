// final-audit.js — Audit ALL active providers: search + real video URLs + valid servers
const { searchProvider, getEpisodeUrl, extractVideos } = require('../src/web-providers/engine');
const providers = require('../src/web-providers/providers');

const QUERIES = { movie: 'matrix', tvshow: 'breaking bad', anime: 'naruto', documentary: 'matrix', torrent: 'matrix' };

function validURL(url) {
  if (!url) return false;
  if (url === '#' || url === '/' || url === 'about:blank') return false;
  if (url.includes('novideo.mp4') || url.includes('placeholder')) return false;
  return url.startsWith('http') || url.startsWith('magnet:');
}

async function audit(p) {
  const cat = p.categories[0] || 'movie';
  const query = QUERIES[cat] || 'matrix';
  const r = { name: p.name, title: p.title, cat, search: null, videos: 0, validURLs: 0, servers: [], errors: [] };

  try {
    r.search = await searchProvider(p, query, null, cat === 'tvshow' ? 'tv' : 'movie');
  } catch(e) { r.errors.push('search: ' + e.message); return r; }
  if (!r.search) { r.errors.push('no search results'); return r; }

  let vUrl = r.search;
  if ((cat === 'anime' || cat === 'tvshow') && p.episodes) {
    try { const ep = await getEpisodeUrl(p, vUrl, 1, 1); if (ep) vUrl = ep; } catch(e) {}
  }

  try {
    const videos = await extractVideos(p, vUrl);
    if (videos?.length) {
      r.videos = videos.length;
      r.validURLs = videos.filter(v => validURL(v.url || v.infoHash)).length;
      r.servers = [...new Set(videos.map(v => v.server || 'unknown'))];
    }
  } catch(e) { r.errors.push('extract: ' + e.message); }

  return r;
}

async function main() {
  const active = providers.filter(p => p.active);
  console.log(`Auditing ${active.length} active providers for REAL content...\n`);

  const results = [];
  for (let i = 0; i < active.length; i++) {
    const p = active[i];
    process.stdout.write(`[${String(i+1).padStart(2)}/${active.length}] ${p.title.padEnd(22)} `);
    const r = await audit(p);
    results.push(r);

    if (r.videos > 0 && r.validURLs > 0) {
      console.log(`✓ ${r.videos}v (${r.validURLs} valid) [${r.servers.slice(0,5).join(', ')}]`);
    } else if (r.search) {
      console.log(`✗ search OK, 0 videos — ${r.errors.join('; ') || 'extraction failed'}`);
    } else {
      console.log(`✗ ${r.errors.join('; ')}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  const working = results.filter(r => r.videos > 0 && r.validURLs > 0);
  const noVideo = results.filter(r => r.search && r.videos === 0);
  const noSearch = results.filter(r => !r.search);

  console.log(`\nPRODUCE CONTENIDO REAL (videos + URLs válidas): ${working.length}`);
  for (const r of working) {
    const allServers = r.servers.join(', ');
    console.log(`  ${r.title.padEnd(22)} ${r.videos}v [${allServers}]`);
  }

  console.log(`\nSEARCH OK / 0 VIDEOS: ${noVideo.length}`);
  for (const r of noVideo) {
    console.log(`  ${r.title.padEnd(22)} ${r.errors.join('; ')}`);
  }

  console.log(`\nNO ENCUENTRA CONTENIDO: ${noSearch.length}`);
  for (const r of noSearch) {
    console.log(`  ${r.title.padEnd(22)} ${r.errors.join('; ')}`);
  }

  // Per-category breakdown
  console.log('\n' + '='.repeat(80));
  console.log('BY CATEGORY:');
  const cats = {};
  for (const r of working) {
    const c = r.cat;
    if (!cats[c]) cats[c] = [];
    cats[c].push(r);
  }
  for (const [cat, list] of Object.entries(cats)) {
    const totalV = list.reduce((s, r) => s + r.videos, 0);
    console.log(`  ${cat}: ${list.length} providers, ${totalV} total videos`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
