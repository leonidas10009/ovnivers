// test-servers.js — Full pipeline test: search → extract videos → verify servers
const cheerio = require('cheerio');
const providers = require('../src/web-providers/providers');
const { fetchHTML, searchProvider, getEpisodeUrl, extractVideos } = require('../src/web-providers/engine');
const { resolveEmbed } = require('../src/web-providers/embed-resolver');

const TEST = [
  { name: 'cinecalidad', query: 'matrix' },
  { name: 'pelispedia', query: 'matrix' },
  { name: 'divxtotal', query: 'matrix' },
  { name: 'serieskao', query: 'naruto', season: 1, episode: 1 },
  { name: 'animejara', query: 'naruto', season: 1, episode: 1 },
  { name: 'jkanime', query: 'naruto', season: 1, episode: 1 },
  { name: 'repelisplus', query: 'matrix' },
  { name: 'tioanime', query: 'naruto', season: 1, episode: 1 },
  { name: 'animeflv', query: 'naruto', season: 1, episode: 1 },
  { name: 'pelispanda', query: 'naruto' },
  { name: 'animejl', query: 'naruto', season: 1, episode: 1 },
  { name: 'pelisplus', query: 'naruto' },
];

async function testProvider(provider, query, season, episode) {
  const start = Date.now();
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${provider.title} (${provider.name}) — search "${query}" s${season||1}e${episode||1}`);
  
  // Step 1: Search
  let pageUrl;
  try {
    const resolved = await fetchHTML(provider.baseUrl, { timeout: 15000 });
    if (!resolved) { console.log('  ✗ Site unreachable'); return; }
    pageUrl = await searchProvider(provider, query, null, 'movie');
  } catch(e) { console.log(`  ✗ Search error: ${e.message}`); return; }
  
  if (!pageUrl) { console.log('  ✗ No search results found'); return; }
  console.log(`  ✓ Search OK → ${pageUrl}`);

  // Step 2: Episode (if TV)
  if (season && episode && provider.categories.includes('tvshow') || provider.categories.includes('anime')) {
    try {
      const epUrl = await getEpisodeUrl(provider, pageUrl, season, episode);
      if (epUrl) { pageUrl = epUrl; console.log(`  ✓ Episode → ${pageUrl}`); }
    } catch(e) { /* keep original pageUrl */ }
  }

  // Step 3: Extract videos
  let videos;
  try {
    videos = await extractVideos(provider, pageUrl);
  } catch(e) { console.log(`  ✗ Video extraction error: ${e.message}`); return; }
  
  if (!videos || videos.length === 0) {
    console.log('  ✗ No videos extracted');
    return;
  }

  console.log(`  ✓ Videos: ${videos.length} | Time: ${Date.now() - start}ms`);

  // Step 4: Show servers
  const serverCounts = {};
  for (const v of videos) {
    const server = v.server || v.name || 'unknown';
    serverCounts[server] = (serverCounts[server] || 0) + 1;
  }

  console.log('  Servers:');
  for (const [server, count] of Object.entries(serverCounts)) {
    const sample = videos.find(v => (v.server || v.name) === server);
    const urlType = sample?.url?.includes('.m3u8') ? 'm3u8' :
                     sample?.url?.includes('.mp4') ? 'mp4' :
                     sample?.url?.includes('magnet') ? 'magnet' :
                     sample?.url?.includes('.torrent') ? 'torrent' :
                     sample?.infoHash ? 'infoHash' : 'embed';
    const urlSample = (sample?.url || sample?.infoHash || '').substring(0, 70);
    console.log(`    ${server.padEnd(16)} x${count} [${urlType}] ${urlSample}`);
  }
}

async function main() {
  console.log('Full pipeline test — search + video extraction + server detection\n');
  
  for (const t of TEST) {
    const p = providers.find(p => p.name === t.name);
    if (!p || !p.active) { console.log(`\n${t.name}: SKIPPED (inactive/not found)`); continue; }
    await testProvider(p, t.query, t.season, t.episode);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
