const jkanime = require('../src/anime/scrapers/jkanime');

(async () => {
  console.log('=== JKAnime Scraper Test ===\n');
  
  // Test 1: Search
  console.log('1. Search "naruto":');
  const results = await jkanime.search('naruto');
  console.log('   Found:', results.length, 'results');
  for (const r of results.slice(0, 3)) {
    console.log('   -', r.title, '| slug:', r.slug);
  }
  
  // Test 2: Get anime ID
  console.log('\n2. Get anime ID for naruto:');
  const animeId = await jkanime.getAnimeId('naruto');
  console.log('   ID:', animeId);
  
  // Test 3: Get episodes
  if (animeId) {
    console.log('\n3. Get episodes:');
    const epData = await jkanime.getEpisodes(animeId, 1);
    console.log('   Total:', epData.total, '| Page 1:', epData.episodes.length);
    console.log('   First:', epData.episodes[0]?.title);
    console.log('   Last:', epData.episodes[epData.episodes.length - 1]?.title);
  }
  
  // Test 4: Get video streams
  console.log('\n4. Get streams for naruto ep 1:');
  const streams = await jkanime.getStreams('naruto', 1);
  console.log('   Streams:', streams.length);
  for (const s of streams.slice(0, 3)) {
    console.log('   -', s.name?.replace(/\n/g, ' | '), '| url:', (s.url || '').substring(0, 80));
  }
  
  // Test 5: Get on-air
  console.log('\n5. Get on-air catalog:');
  const items = await jkanime.getOnAir();
  console.log('   Items:', items.length);
  for (const item of items.slice(0, 5)) {
    console.log('   -', item.name, '|', item.id);
  }
})();
