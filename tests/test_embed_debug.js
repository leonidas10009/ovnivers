/**
 * Debug embed resolver: fetch actual embed pages from working providers
 * and check if tryResolveEmbedToDirect can extract direct URLs.
 * Run: node tests/test_embed_debug.js
 */
const { searchProvider, extractVideos, tryResolveEmbedToDirect } = require('../src/web-providers/engine');
const providers = require('../src/web-providers/providers');

const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

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
    }
  } catch {}
  return variants;
}

async function fetchWithDetails(url, referer) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Referer': referer || url, 'Accept': '*/*' },
      signal: ctrl.signal
    });
    clearTimeout(t);
    const text = await res.text();
    return { ok: res.ok, status: res.status, size: text.length, type: res.headers.get('content-type') || '', text: text.substring(0, 3000), headers: Object.fromEntries(res.headers) };
  } catch (e) {
    clearTimeout(t);
    return { ok: false, error: e.message };
  }
}

(async () => {
  console.log('=== EMBED RESOLVER DEBUG ===\n');

  // Test with movie providers that returned streams
  const titles = await resolveTitles('550', 'movie');
  const title = titles[0]?.title || 'Fight Club';
  const year = titles[0]?.year || '1999';
  console.log(`Title: "${title}" (${year})\n`);

  const workingProviders = providers.filter(p =>
    p.active && p.categories.includes('movie') &&
    ['cinelibreonline', 'homecine', 'pelispedia', 'estrenoscinesaa', 'serieskao', 'tubepelis'].includes(p.name)
  );

  for (const provider of workingProviders) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📦 ${provider.title} (${provider.name})`);
    console.log(`${'─'.repeat(60)}`);

    const pageUrl = await searchProvider(provider, title, year, 'movie');
    if (!pageUrl) { console.log('  ❌ searchProvider: no match'); continue; }
    console.log(`  📍 Detail page: ${pageUrl}`);

    const videos = await extractVideos(provider, pageUrl);
    console.log(`  🎬 extractVideos returned ${videos.length} results`);

    for (let i = 0; i < Math.min(videos.length, 3); i++) {
      const v = videos[i];
      console.log(`\n  [${i}] URL: ${v.url?.substring(0, 120)}`);
      console.log(`      Server: ${v.server}`);
      console.log(`      Quality: ${v.quality}`);

      // Check if it's already a direct URL
      if (/\.(mp4|m3u8|mkv)(\?|$)/i.test(v.url)) {
        console.log(`      ✅ Already direct media!`);
        continue;
      }

      // Try the embed resolver
      console.log(`      🔄 Trying tryResolveEmbedToDirect...`);
      const resolved = await tryResolveEmbedToDirect(v.url, pageUrl);
      if (resolved) {
        console.log(`      ✅ Resolved → ${resolved.substring(0, 120)}`);
      } else {
        console.log(`      ❌ Not resolved`);
        // Debug: fetch the embed page manually
        console.log(`      🔍 Fetching embed page for inspection...`);
        const detail = await fetchWithDetails(v.url, pageUrl);
        if (!detail.ok) {
          console.log(`      ❌ Fetch failed: ${detail.error || `HTTP ${detail.status}`}`);
        } else {
          console.log(`      📄 Status: ${detail.status}, Size: ${(detail.size/1024).toFixed(1)}KB, Type: ${detail.type}`);
          // Check for m3u8/mp4 in HTML
          const hasM3u8 = /\.m3u8/i.test(detail.text);
          const hasMp4 = /\.mp4/i.test(detail.text);
          const hasIframe = /<iframe/i.test(detail.text);
          const hasVideo = /<video/i.test(detail.text);
          const hasSrc = /src=["']https?:\/\/[^"']+\.(m3u8|mp4)/i.test(detail.text);
          console.log(`      🔎 m3u8:${hasM3u8} mp4:${hasMp4} iframe:${hasIframe} video:${hasVideo} src_direct:${hasSrc}`);
          // Check content-type for redirect
          if (detail.type?.includes('video') || detail.type?.includes('octet-stream')) {
            console.log(`      ⚠️  Content-Type is video/binary! URL might be direct but not detected`);
          }
          // Show redirect chain
          console.log(`      📝 HTML preview: ${detail.text.substring(0, 500).replace(/\n/g, ' ')}`);
        }
      }
    }
  }

  // Also test the error.txt scenario: what happens when an embed URL is fed to ExoPlayer
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('🔍 ERROR.TXT ANALYSIS');
  console.log(`${'='.repeat(60)}`);
  console.log(`
The error.txt shows: ExoPlayer tried to play a stream but found no extractor
that could read it. This means:

  Option A: An embed HTML page was passed as the stream URL
            with notWebReady=false (wrongly marked as direct)
  
  Option B: A direct media URL was given but the server returned
            non-media content (redirect, 404, or HTML error page)

The most likely cause is Option A: the embed resolver (tryResolveEmbedToDirect)
is NOT converting embed URLs to direct media URLs, so .m3u8/.mp4 patterns
in the stream URL are not being found. But the stream is still marked as
notWebReady=false by normalizeStream in server.js if the URL happens to
contain those patterns.

Check: what does normalizeStream see?`);
  console.log(`\n✅ Recommendation: ensure embed URLs are never marked as direct.
❌ Current issue: embed pages are being treated as playable content.`);
})();
