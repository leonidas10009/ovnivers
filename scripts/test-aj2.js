const aj = require('../src/anime/scrapers/animejara');
(async () => {
  const s = await fetch('https://animejara.com/episode/naruto-1x1/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const h = await s.text();
  console.log('fetch OK, size:', h.length);
  const matches = h.match(/https?:\/\/[^"'\\s<>]{10,300}/g) || [];
  console.log('regex matches:', matches.length);
  matches.filter(u => /streamhj/.test(u)).forEach(u => console.log(' ', u.slice(0, 100)));

  // Now call the actual getStreams
  console.log('\nCalling getStreams...');
  const streams = await aj.getStreams('naruto', 1);
  console.log('getStreams result:', streams.length);
})();
