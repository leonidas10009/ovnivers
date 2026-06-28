/**
 * Full audit: tests all content providers and server endpoints
 * Run: node tests/test_full_audit.js
 */
const http = require('http');
const { searchProvider, getEpisodeUrl, extractVideos, tryResolveEmbedToDirect } = require('../src/web-providers/engine');
const providers = require('../src/web-providers/providers');

const BASE = 'http://localhost:3000';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';

const PASS = 0, FAIL = 0, TOTAL = { pass: 0, fail: 0, total: 0 };
function ok(msg) { TOTAL.pass++; console.log(`  ✅ ${msg}`); }
function fail(msg) { TOTAL.fail++; console.log(`  ❌ ${msg}`); }
function title(msg) { console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`); }

async function fetchJSON(url, timeout = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch { clearTimeout(t); return null; }
}

async function fetchText(url, timeout = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA } });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch { clearTimeout(t); return null; }
}

// ─────────── 1. SERVER ENDPOINTS ───────────

title('1. SERVER ENDPOINTS');

async function testEndpoints() {
  // Health check
  const health = await fetchJSON(`${BASE}/`);
  if (health?.name === 'Ovnivers Streams') ok(`Health endpoint: ${health.name} v${health.version}`);
  else fail(`Health endpoint returned: ${JSON.stringify(health).substring(0, 100)}`);

  // Manifest
  const manifest = await fetchJSON(`${BASE}/manifest.json`);
  if (manifest?.id === 'com.ovnivers.allinone') {
    ok(`Manifest: ${manifest.name} v${manifest.version}`);
    ok(`  Resources: ${manifest.resources?.map(r => r.name).join(', ')}`);
    ok(`  Catalogs: ${manifest.catalogs?.length} defined`);
    ok(`  Types: ${manifest.types?.join(', ')}`);
  } else fail(`Manifest missing or invalid`);

  // Health detail
  const healthDetail = await fetchJSON(`${BASE}/health`);
  if (healthDetail?.providers) {
    ok(`Health detail: ${healthDetail.providers.healthy}/${healthDetail.providers.total} healthy`);
    for (const p of healthDetail.detail || []) {
      const icon = p.healthy ? '✅' : '❌';
      console.log(`  ${icon} ${p.name}: ${p.total} calls, ${p.ok} ok, ${p.fail} fail, ${p.avgMs}ms avg`);
    }
  } else fail(`Health detail missing`);

  // Catalog
  const catalog = await fetchJSON(`${BASE}/catalog/movie/tmdb-popular-movie.json`);
  if (catalog?.metas?.length > 0) ok(`Catalog tmdb-popular-movie: ${catalog.metas.length} items`);
  else fail(`Catalog returned empty`);

  // Meta
  const meta = await fetchJSON(`${BASE}/meta/movie/ovn:550.json`);
  if (meta?.meta?.name) ok(`Meta ovn:550: "${meta.meta.name}"`);
  else fail(`Meta ovn:550 returned: ${JSON.stringify(meta).substring(0, 100)}`);

  // Configure
  const config = await fetchText(`${BASE}/configure`);
  if (config?.includes('Ovnivers')) ok(`Configure page loads`);
  else fail(`Configure page failed`);
}

// ─────────── 2. STREAM ENDPOINTS ───────────

title('2. STREAM ENDPOINTS (known titles)');

async function testStreams() {
  // The Matrix (movie, tmdb:550)
  const matrix = await fetchJSON(`${BASE}/stream/movie/tmdb:550.json`, 60000);
  if (matrix?.streams) {
    const total = matrix.streams.length;
    const direct = matrix.streams.filter(s => s.behaviorHints?.notWebReady === false).length;
    const embed = matrix.streams.filter(s => s.behaviorHints?.notWebReady !== false).length;
    const withUrl = matrix.streams.filter(s => s.url).length;
    const withInfoHash = matrix.streams.filter(s => s.infoHash).length;
    ok(`The Matrix (tmdb:550): ${total} streams (${direct} direct, ${embed} embed, ${withInfoHash} torrent)`);
    if (total > 0) {
      console.log(`  Sample: ${matrix.streams[0].name?.substring(0, 80)}`);
      if (total < 5) fail(`  Only ${total} streams — most providers returning nothing`);
      else ok(`  ${total} streams is reasonable`);
    } else fail(`  ZERO streams - all providers failing`);
  } else fail(`Stream endpoint returned: ${JSON.stringify(matrix).substring(0, 100)}`);

  // Breaking Bad S01E01 (series, tmdb:1396)
  const bb = await fetchJSON(`${BASE}/stream/series/tmdb:1396:1:1.json`, 60000);
  if (bb?.streams) {
    ok(`Breaking Bad S01E01 (tmdb:1396:1:1): ${bb.streams.length} streams`);
    if (bb.streams.length > 0) console.log(`  Sample: ${bb.streams[0].name?.substring(0, 80)}`);
    else fail(`  ZERO streams for series`);
  } else fail(`Breaking Bad stream endpoint failed`);

  // One Piece episode (anime)
  const op = await fetchJSON(`${BASE}/stream/anime/tmdb:37854:1:1.json`, 60000);
  if (op?.streams) {
    ok(`One Piece S01E01 (tmdb:37854:1:1): ${op.streams.length} streams`);
    if (op.streams.length > 0) console.log(`  Sample: ${op.streams[0].name?.substring(0, 80)}`);
  } else fail(`One Piece stream endpoint failed`);
}

// ─────────── 3. ALFA PROVIDERS AUDIT ───────────

title('3. ALFA PROVIDERS — INDIVIDUAL AUDIT');

async function resolveTitles(id, mediaType) {
  const variants = [];
  const seen = new Set();
  function add(title, year) {
    const t = (title || '').trim();
    if (t && !seen.has(t.toLowerCase())) { variants.push({ title: t, year: year || '' }); seen.add(t.toLowerCase()); }
  }
  try {
    const ac = new AbortController(); setTimeout(() => ac.abort(), 6000);
    const r = await fetch(`https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${id}?api_key=${TMDB_KEY}&language=en`, { headers: { 'User-Agent': UA }, signal: ac.signal });
    if (r.ok) {
      const d = await r.json();
      const year = (d.release_date || d.first_air_date || '').substring(0, 4);
      add(d.title || d.name || '', year);
      if (d.original_title && d.original_title !== (d.title || d.name)) add(d.original_title, year);
    }
    const ac2 = new AbortController(); setTimeout(() => ac2.abort(), 6000);
    const r2 = await fetch(`https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${id}?api_key=${TMDB_KEY}&language=es`, { headers: { 'User-Agent': UA }, signal: ac2.signal });
    if (r2.ok) {
      const d2 = await r2.json();
      add(d2.title || d2.name || '', '');
    }
  } catch {}
  return variants;
}

async function testAlfaProvider(provider, title, year, mediaType, season, episode) {
  const start = Date.now();
  try {
    let pageUrl = await searchProvider(provider, title, year, mediaType);
    if (!pageUrl) return { status: 'no_match', ms: Date.now() - start };

    let targetUrl = pageUrl;
    if (season && episode && provider.episodes) {
      const epUrl = await getEpisodeUrl(provider, pageUrl, season, episode);
      if (epUrl) targetUrl = epUrl;
    }

    const videos = await extractVideos(provider, targetUrl);
    const ms = Date.now() - start;
    if (videos.length === 0) return { status: 'no_videos', ms, url: pageUrl };

    const withDirectUrl = videos.filter(v => /\.(mp4|m3u8|mkv)(\?|$)/i.test(v.url)).length;
    const torrents = videos.filter(v => v.infoHash).length;
    const embeds = videos.length - withDirectUrl - torrents;

    return {
      status: 'ok', ms, url: pageUrl, total: videos.length,
      direct: withDirectUrl, torrent: torrents, embed: embeds,
      sample: videos[0]
    };
  } catch (e) {
    return { status: 'error', ms: Date.now() - start, error: e.message };
  }
}

async function auditAlfaProviders() {
  // Test with The Matrix (movie)
  const movieTitles = await resolveTitles('550', 'movie');
  const movieTitle = movieTitles[0]?.title || 'The Matrix';
  const movieYear = movieTitles[0]?.year || '1999';
  console.log(`Movie title: "${movieTitle}" (${movieYear})`);

  const movieProviders = providers.filter(p => p.active && p.categories.includes('movie') && !p.categories.includes('torrent'));
  console.log(`Testing ${movieProviders.length} movie providers...\n`);

  let movieOk = 0, movieFail = 0;
  for (const p of movieProviders) {
    const result = await testAlfaProvider(p, movieTitle, movieYear, 'movie');
    const icon = result.status === 'ok' ? '✅' : result.status === 'no_match' ? '🔍' : result.status === 'no_videos' ? '📄' : '❌';
    const detail = result.status === 'ok' ? `${result.total} streams (${result.direct} direct, ${result.embed} embed, ${result.torrent} torrent) ${result.ms}ms` : result.status;
    console.log(`  ${icon} ${p.title.padEnd(20)} ${detail}`);
    if (result.status === 'ok') movieOk++; else movieFail++;
  }
  console.log(`\nMovie providers: ${movieOk} OK, ${movieFail} failed`);

  // Test with Breaking Bad (series)
  const seriesTitles = await resolveTitles('1396', 'tv');
  const seriesTitle = seriesTitles[0]?.title || 'Breaking Bad';
  const seriesYear = seriesTitles[0]?.year || '2008';
  console.log(`\nSeries title: "${seriesTitle}" (${seriesYear})`);

  const seriesProviders = providers.filter(p => p.active && p.categories.includes('tvshow') && !p.categories.includes('torrent') && !p.categories.includes('anime'));
  console.log(`Testing ${seriesProviders.length} series providers...\n`);

  let seriesOk = 0, seriesFail = 0;
  for (const p of seriesProviders) {
    const result = await testAlfaProvider(p, seriesTitle, seriesYear, 'tv', 1, 1);
    const icon = result.status === 'ok' ? '✅' : result.status === 'no_match' ? '🔍' : result.status === 'no_videos' ? '📄' : '❌';
    const detail = result.status === 'ok' ? `${result.total} streams ${result.ms}ms` : result.status;
    console.log(`  ${icon} ${p.title.padEnd(22)} ${detail}`);
    if (result.status === 'ok') seriesOk++; else seriesFail++;
  }
  console.log(`\nSeries providers: ${seriesOk} OK, ${seriesFail} failed`);

  // Anime providers with One Piece
  const animeTitles = await resolveTitles('37854', 'tv');
  const animeTitle = animeTitles[0]?.title || 'One Piece';
  console.log(`\nAnime title: "${animeTitle}"`);

  const animeProviders = providers.filter(p => p.active && p.categories.includes('anime') && !p.categories.includes('torrent'));
  console.log(`Testing ${animeProviders.length} anime providers...\n`);

  let animeOk = 0, animeFail = 0;
  for (const p of animeProviders) {
    const result = await testAlfaProvider(p, animeTitle, '', 'tv', 1, 1);
    const icon = result.status === 'ok' ? '✅' : result.status === 'no_match' ? '🔍' : result.status === 'no_videos' ? '📄' : '❌';
    const detail = result.status === 'ok' ? `${result.total} streams ${result.ms}ms` : result.status;
    console.log(`  ${icon} ${p.title.padEnd(22)} ${detail}`);
    if (result.status === 'ok') animeOk++; else animeFail++;
  }
  console.log(`\nAnime providers: ${animeOk} OK, ${animeFail} failed`);

  // Torrent providers
  console.log(`\nTorrent providers...`);
  const torrentProviders = providers.filter(p => p.active && p.categories.includes('torrent'));
  for (const p of torrentProviders) {
    const result = await testAlfaProvider(p, movieTitle, movieYear, 'movie');
    const icon = result.status === 'ok' ? '✅' : '❌';
    const detail = result.status === 'ok' ? `${result.total} torrents ${result.ms}ms` : result.status;
    console.log(`  ${icon} ${p.title.padEnd(20)} ${detail}`);
  }

  // Documental providers
  console.log(`\nDocumentary providers...`);
  const docProviders = providers.filter(p => p.active && p.categories.includes('documentary'));
  for (const p of docProviders) {
    const result = await testAlfaProvider(p, 'Cosmos', '2014', 'tv');
    const icon = result.status === 'ok' ? '✅' : result.status === 'no_match' ? '🔍' : '❌';
    const detail = result.status === 'ok' ? `${result.total} streams ${result.ms}ms` : result.status;
    console.log(`  ${icon} ${p.title.padEnd(22)} ${detail}`);
  }
}

// ─────────── 4. EMBED RESOLVER TEST ───────────

title('4. EMBED RESOLVER TEST');

async function testEmbedResolver() {
  // Test with a known working embed URL (if any exist from the audit)
  const testUrls = [
    'https://streamwish.com/',
    'https://filemoon.sx/',
  ];
  for (const url of testUrls) {
    const result = await tryResolveEmbedToDirect(url, url);
    if (result) ok(`Embed resolver: ${url} → ${result.substring(0, 80)}`);
    else console.log(`  ℹ️  ${url} → not resolved (expected for generic URL)`);
  }
}

// ─────────── 5. DEDUPLICATION & NORMALIZATION ───────────

title('5. DEDUPLICATION TEST');

async function testDedup() {
  const matrix = await fetchJSON(`${BASE}/stream/movie/tmdb:550.json`, 60000);
  if (!matrix?.streams) { fail('No streams to test dedup'); return; }

  const urls = matrix.streams.map(s => s.url).filter(Boolean);
  const uniqueUrls = [...new Set(urls)];
  if (urls.length === uniqueUrls.length) ok(`No duplicate URLs in ${urls.length} streams`);
  else fail(`${urls.length - uniqueUrls.length} duplicate URLs found`);

  const names = matrix.streams.map(s => s.name).filter(Boolean);
  const uniqueNames = [...new Set(names)];
  if (names.length === uniqueNames.length) ok(`No duplicate names in ${names.length} streams`);
  else console.log(`  ℹ️  ${names.length - uniqueNames.length} duplicate names (expected with multi-source)`);

  // Check notWebReady consistency
  const streamsWithUrl = matrix.streams.filter(s => s.url);
  const m3u8Mp4 = streamsWithUrl.filter(s => /\.(m3u8|mp4)(\?|$)/i.test(s.url));
  const notWebReadyDirect = m3u8Mp4.filter(s => s.behaviorHints?.notWebReady !== false);
  if (notWebReadyDirect.length === 0) ok(`All direct URLs correctly marked notWebReady=false`);
  else fail(`${notWebReadyDirect.length} direct URLs incorrectly marked notWebReady=true`);
}

// ─────────── RUN ALL ───────────

(async () => {
  console.log(`\n🚀 Ovnivers Full Audit\nStarted: ${new Date().toISOString()}`);

  await testEndpoints();
  await testStreams();
  await auditAlfaProviders();
  await testEmbedResolver();
  await testDedup();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESULTS: ${TOTAL.pass} passed, ${TOTAL.fail} failed`);
  console.log(`Finished: ${new Date().toISOString()}\n`);
  process.exit(TOTAL.fail > 0 ? 1 : 0);
})();
