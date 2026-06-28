var anime = require('../src/anime/index');
var fs = require('fs');

async function test() {
  console.log('Testing anime scrapers (cheerio, no Puppeteer)...\n');
  var scrapers = ['jkanime', 'tioanime', 'animejara', 'animeflv'];
  for (var i = 0; i < scrapers.length; i++) {
    var name = scrapers[i];
    try {
      var s = require('../src/anime/scrapers/' + name);
      var results = await s.search('naruto');
      var slug = results && results[0] ? results[0].slug : null;
      console.log(name.padEnd(12) + ' search: ' + (slug || 'FAIL'));
      if (slug) {
        var streams = await s.getStreams(slug, 1);
        var count = streams ? streams.length : 0;
        if (streams && streams.length > 0) {
          var servers = streams.map(function(x) { return x.server || '?'; });
          var unique = servers.filter(function(v, i, a) { return a.indexOf(v) === i; });
          console.log('            streams: ' + count + ' [' + unique.slice(0,5).join(', ') + ']');
        } else {
          console.log('            streams: 0');
        }
      }
    } catch(e) { console.log(name.padEnd(12) + ' ERROR: ' + e.message); }
  }
  
  console.log('\nFull pipeline: getStreams(tmdb:46260, 1, 1)...');
  var result = await anime.scrapers.getStreams('tmdb:46260', 1, 1);
  console.log('  streams: ' + (result.streams ? result.streams.length : 0));
  if (result.streams && result.streams.length > 0) {
    result.streams.slice(0, 3).forEach(function(s) {
      console.log('  [' + (s.server||'?') + '] ' + (s.url||'').substring(0,60));
    });
  }
}
test().catch(function(e) { console.error(e); });
