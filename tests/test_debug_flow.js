const { searchProvider, getEpisodeUrl, extractVideos } = require('./src/alfa-providers/engine');
const providers = require('./src/alfa-providers/providers');

const TMDB_KEY = 'd80ba92bc7cefe3359668d30d06f3305';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function resolveTitlesManually(id, mediaType) {
  const variants = [];
  const seen = new Set();
  function addVariant(title, year) {
    const t = (title || '').trim();
    if (t && !seen.has(t.toLowerCase())) { variants.push({ title: t, year: year || '' }); seen.add(t.toLowerCase()); }
  }
  
  // Handle anime prefix
  const ANIME_PREFIXES = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:', 'anilist:', 'kitsu:', 'mal:', 'anidb:'];
  const isAnimeId = ANIME_PREFIXES.some(p => id.startsWith(p));
  if (isAnimeId) {
    const slug = id.split(':').slice(1).join(':');
    addVariant(slug.replace(/-/g, ' '), '');
    if (slug.includes('-')) addVariant(slug, '');
  }
  
  // TMDB
  let tmdbId = id;
  if (tmdbId.match(/^\d+$/)) {
    try {
      const ac = new AbortController(); setTimeout(() => ac.abort(), 6000);
      const r = await fetch(`https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_KEY}&language=en`, { headers: { 'User-Agent': UA }, signal: ac.signal });
      if (r.ok) {
        const d = await r.json();
        const year = (d.release_date || d.first_air_date || '').substring(0, 4);
        addVariant(d.title || d.name || '', year);
        if (d.original_title && d.original_title !== (d.title || d.name)) addVariant(d.original_title, year);
      }
    } catch {}
    try {
      const ac = new AbortController(); setTimeout(() => ac.abort(), 6000);
      const r = await fetch(`https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}?api_key=${TMDB_KEY}&language=es`, { headers: { 'User-Agent': UA }, signal: ac.signal });
      if (r.ok) {
        const d = await r.json();
        addVariant(d.title || d.name || '', '');
      }
    } catch {}
  }
  
  return variants;
}

async function testProvider(provider, title, year) {
  console.log(`\n--- ${provider.title} (${provider.name}) ---`);
  console.log(`Search config:`, JSON.stringify(provider.search));
  
  const pageUrl = await searchProvider(provider, title, year, 'tv');
  if (!pageUrl) { console.log(`  ❌ searchProvider: no match`); return; }
  console.log(`  ✅ pageUrl: ${pageUrl}`);
  
  // Try getEpisodeUrl
  let targetUrl = pageUrl;
  if (provider.episodes) {
    console.log(`  Episodes config:`, JSON.stringify(provider.episodes));
    const epUrl = await getEpisodeUrl(provider, pageUrl, 1, 1);
    if (epUrl) {
      console.log(`  ✅ getEpisodeUrl: ${epUrl}`);
      targetUrl = epUrl;
    } else {
      console.log(`  ❌ getEpisodeUrl failed`);
    }
  } else {
    console.log(`  ℹ️ No episodes config, using series URL`);
  }
  
  const videos = await extractVideos(provider, targetUrl);
  console.log(`  📊 Videos: ${videos.length}`);
  if (videos.length > 0) {
    console.log(`  First: ${JSON.stringify(videos[0]).substring(0, 120)}`);
  } else {
    // Debug: fetch the page and check for video data
    console.log(`  ❌ No videos found - checking page...`);
  }
}

(async () => {
  // Test with One Piece
  const titles = await resolveTitlesManually('37854', 'tv');
  console.log('Resolved titles:', JSON.stringify(titles));
  const firstTitle = titles[0];
  
  const animeProviders = providers.filter(p => p.active && p.categories.includes('anime'));
  console.log(`\nActive anime providers: ${animeProviders.map(p => p.name).join(', ')}`);
  
  for (const p of animeProviders) {
    await testProvider(p, firstTitle.title, firstTitle.year);
  }
})();
