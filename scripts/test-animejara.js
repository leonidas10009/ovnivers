// test-animejara.js — quick test
const animejara = require('../src/anime/scrapers/animejara');
const https = require('https');

(async () => {
  console.log('=== AnimeJara nativo — Naruto S01E01 ===\n');

  const t0 = Date.now();
  const results = await animejara.search('Naruto');
  console.log('Search: ' + results.length + ' resultados (' + (Date.now()-t0) + 'ms)');
  results.forEach(r => console.log('  ' + r.slug.padEnd(35) + r.title));

  const t1 = Date.now();
  const streams = await animejara.getStreams('naruto', 1);
  console.log('\nStreams naruto Ep.1: ' + streams.length + ' (' + (Date.now()-t1) + 'ms)');
  console.log('iframe count: ' + streams.filter(s => s.behaviorHints?.notWebReady === false).length + ' directos');

  if (streams.length === 0) {
    console.log('\nDebug: fetching episode page...');
    const html = await new Promise((resolve) => {
      https.get('https://animejara.com/episode/naruto-1x1/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
      }).on('error', () => resolve(''));
    });
    console.log('HTTP Size: ' + html.length);
    console.log('#lista-server: ' + /lista-server/.test(html));
    console.log('iframes: ' + (html.match(/<iframe/gi) || []).length);
    const onclickCount = (html.match(/onclick/gi) || []).length;
    console.log('onclick handlers: ' + onclickCount);
    // Show onclick samples
    const onclickSamples = html.match(/onclick="[^"]{20,150}"/gi) || [];
    onclickSamples.slice(0, 3).forEach(m => console.log('  ' + m.slice(0, 120)));
    // Check for embed/player URLs
    const embedUrls = (html.match(/https?:\/\/[^"'\s<>]{10,200}/g) || [])
      .filter(u => /embed|player|stream|video|m3u8|mp4|server/i.test(u));
    console.log('embed/player URLs: ' + embedUrls.length);
    embedUrls.slice(0, 3).forEach(u => console.log('  ' + u.slice(0, 100)));
  }
})();
