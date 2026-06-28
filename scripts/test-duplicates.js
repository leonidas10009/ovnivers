// test-duplicates.js — Check for duplicate servers within same provider/page
const { fetchHTML, searchProvider, getEpisodeUrl, extractVideos } = require('../src/web-providers/engine');
const providers = require('../src/web-providers/providers');

const TEST = [
  { name: 'cinecalidad', query: 'matrix' },
  { name: 'pelispedia', query: 'matrix' },
  { name: 'jkanime', query: 'naruto', season: 1, episode: 1 },
  { name: 'tioanime', query: 'naruto', season: 1, episode: 1 },
  { name: 'animejara', query: 'naruto', season: 1, episode: 1 },
  { name: 'serieskao', query: 'naruto', season: 1, episode: 1 },
  { name: 'animeflv', query: 'naruto', season: 1, episode: 1 },
  { name: 'repelisplus', query: 'matrix' },
  { name: 'divxtotal', query: 'matrix' },
  { name: 'sololatino', query: 'naruto' },
  { name: 'doramasflix', query: 'matrix' },
  { name: 'fullseriehd', query: 'matrix' },
];

function extractServerKey(url) {
  try {
    const host = new URL(url).hostname.replace(/^(www\d*\.|embed\.|v\.|ww\d\.)/, '');
    return host.split('.')[0];
  } catch { 
    if (!url) return 'empty';
    return url.substring(0, 20).replace(/[^a-z0-9]/g, ''); 
  }
}

function urlFingerprint(url) {
  if (!url) return 'no-url';
  try {
    const u = new URL(url);
    // Normalize: remove protocol, trailing slash, query string
    let fp = u.hostname + u.pathname.replace(/\/$/, '');
    // For CDN/content URLs, keep a content ID if present
    const idMatch = fp.match(/\/([a-zA-Z0-9_-]{10,40})(?:\/|\.|$)/);
    if (idMatch) return u.hostname.split('.')[0] + ':' + idMatch[1].substring(0, 20);
    return fp.split('?')[0].substring(0, 60);
  } catch { return url.substring(0, 40); }
}

async function testProvider(provider, query, season, episode) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${provider.title} (${provider.name})`);
  
  // Search
  let pageUrl;
  try {
    pageUrl = await searchProvider(provider, query, null, 'movie');
  } catch(e) { console.log(`  ✗ Search: ${e.message}`); return; }
  if (!pageUrl) { console.log('  ✗ No search results'); return; }
  
  // Episode
  if (season && episode) {
    try {
      const ep = await getEpisodeUrl(provider, pageUrl, season, episode);
      if (ep) pageUrl = ep;
    } catch(e) {}
  }
  
  // Extract
  let videos;
  try {
    videos = await extractVideos(provider, pageUrl);
  } catch(e) { console.log(`  ✗ Extract: ${e.message}`); return; }
  
  if (!videos?.length) { console.log('  ✗ No videos'); return; }
  
  // Analyze duplicates
  const byUrl = new Map();    // exact URL match
  const byDomain = new Map(); // domain match
  const byFingerprint = new Map();
  
  for (const v of videos) {
    const url = v.url || v.infoHash || '';
    const server = v.server || extractServerKey(url);
    const fp = urlFingerprint(url);
    
    if (!byUrl.has(url)) byUrl.set(url, []);
    byUrl.get(url).push(server);
    
    if (!byFingerprint.has(fp)) byFingerprint.set(fp, []);
    byFingerprint.get(fp).push({ url: url.substring(0, 60), server });
  }
  
  // Count duplicates
  const dupUrls = [...byUrl.entries()].filter(([,s]) => s.length > 1);
  const dupFps = [...byFingerprint.entries()].filter(([,s]) => s.length > 1);
  
  console.log(`  Total videos: ${videos.length}`);
  console.log(`  Unique URLs: ${byUrl.size}`);
  
  if (dupUrls.length > 0) {
    console.log(`  ⚠️  DUPLICATE exact URLs: ${dupUrls.length}`);
    for (const [url, servers] of dupUrls) {
      console.log(`     "${url.substring(0,80)}"`);
      console.log(`     → appears ${servers.length}x as servers: ${[...new Set(servers)].join(', ')}`);
    }
  }
  
  if (dupFps.length > 0) {
    console.log(`  ⚠️  SIMILAR URLs (same content): ${dupFps.length}`);
    for (const [fp, entries] of dupFps) {
      console.log(`     FP: ${fp} (${entries.length}x)`);
      for (const e of entries) console.log(`       [${e.server}] ${e.url}`);
    }
  }
  
  if (dupUrls.length === 0 && dupFps.length === 0) {
    console.log(`  ✓ No duplicates`);
  }
  
  // Server breakdown
  console.log(`  Servers:`);
  const serverCounts = {};
  for (const v of videos) {
    const s = v.server || extractServerKey(v.url || '');
    serverCounts[s] = (serverCounts[s] || 0) + 1;
  }
  for (const [s, c] of Object.entries(serverCounts).sort()) {
    const dup = c > 1 ? ` (${c}x — DUPLICADO!)` : '';
    console.log(`    ${s.padEnd(18)} ${c}${dup}`);
  }
}

async function main() {
  console.log('Duplicate server check — within same provider/page\n');
  
  for (const t of TEST) {
    const p = providers.find(p => p.name === t.name);
    if (!p || !p.active) continue;
    await testProvider(p, t.query, t.season, t.episode);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
