// test-anime-servers.js — Verify each anime scraper produces valid video servers
var scrapers = {
  jkanime: require('../src/anime/scrapers/jkanime'),
  tioanime: require('../src/anime/scrapers/tioanime'),
  animejara: require('../src/anime/scrapers/animejara'),
  animeflv: require('../src/anime/scrapers/animeflv'),
  animeav1: require('../src/anime/scrapers/animeav1'),
};

async function testScraper(name, scraper) {
  console.log('\n' + '='.repeat(70));
  console.log('  ' + name.toUpperCase());
  console.log('='.repeat(70));

  // Search
  var start = Date.now();
  var results;
  try {
    results = await scraper.search('naruto');
  } catch(e) {
    console.log('  ✗ Search error: ' + e.message);
    return { name: name, search: false, streams: 0, servers: 0, direct: 0, embed: 0 };
  }

  if (!results || !results.length) {
    console.log('  ✗ No search results');
    return { name: name, search: false, streams: 0, servers: 0, direct: 0, embed: 0 };
  }

  var slug = results[0].slug;
  var title = results[0].title;
  console.log('  ✓ Found: ' + title + ' (' + slug + ')');

  // Get streams for episode 1
  var streams;
  try {
    streams = await scraper.getStreams(slug, 1);
  } catch(e) {
    console.log('  ✗ Stream error: ' + e.message);
    return { name: name, search: true, streams: 0, servers: 0, direct: 0, embed: 0 };
  }

  if (!streams || !streams.length) {
    console.log('  ✗ No streams extracted');
    return { name: name, search: true, streams: 0, servers: 0, direct: 0, embed: 0 };
  }

  var elapsed = Date.now() - start;
  var direct = streams.filter(function(s) { return s.url && (s.url.indexOf('.m3u8') >= 0 || s.url.indexOf('.mp4') >= 0); });
  var embed = streams.filter(function(s) { return !direct.includes(s); });
  var servers = {};
  var hasLang = streams.filter(function(s) { return s.languages && s.languages.length > 0; });

  streams.forEach(function(s) {
    var key = s.server || 'unknown';
    servers[key] = (servers[key] || 0) + 1;
  });

  console.log('  ✓ ' + streams.length + ' streams (' + direct.length + ' direct, ' + embed.length + ' embed) ' + elapsed + 'ms');
  console.log('  Languages tagged: ' + hasLang.length + '/' + streams.length);
  console.log('  Servers:');
  Object.entries(servers).sort(function(a, b) { return b[1] - a[1]; }).forEach(function(e) {
    var sample = streams.find(function(s) { return (s.server || 'unknown') === e[0]; });
    var urlType = sample.url.indexOf('.m3u8') >= 0 ? 'm3u8' : sample.url.indexOf('.mp4') >= 0 ? 'mp4' : 'embed';
    console.log('    ' + e[0].padEnd(25) + ' x' + e[1] + ' [' + urlType + '] ' + (sample.url||'').substring(0, 50));
  });

  return { name: name, search: true, streams: streams.length, servers: Object.keys(servers).length, direct: direct.length, embed: embed.length, elapsed: elapsed };
}

async function main() {
  console.log('ANIME SCRAPERS — Live test with Naruto S01E01\n');

  var total = { streams: 0, servers: 0, direct: 0, embed: 0 };
  var entries = Object.entries(scrapers);

  for (var i = 0; i < entries.length; i++) {
    var name = entries[i][0];
    var scraper = entries[i][1];
    var r = await testScraper(name, scraper);
    total.streams += r.streams;
    total.servers += r.servers;
    total.direct += r.direct;
    total.embed += r.embed;
  }

  console.log('\n' + '='.repeat(70));
  console.log('  TOTAL: ' + total.streams + ' streams from ' + total.servers + ' unique servers');
  console.log('  Direct: ' + total.direct + ' | Embed: ' + total.embed);
  console.log('='.repeat(70));
}

main().catch(function(e) { console.error(e); process.exit(1); });
