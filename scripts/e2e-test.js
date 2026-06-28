// e2e-test.js — End-to-end verification of running server
var http = require('http');

function get(path) {
  return new Promise(function(resolve, reject) {
    http.get('http://localhost:3000' + path, function(res) {
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() {
        try { resolve(JSON.parse(data)); } catch(e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

async function main() {
  var ok = true;
  var start = Date.now();

  // Test 1: Root health
  console.log('1. GET /');
  var root = await get('/');
  console.log('   v' + root.version + ' | ' + root.localScrapers + ' scrapers | uptime ' + root.uptime + 's');
  if (root.version !== '1.14.6') { console.log('   ✗ Wrong version'); ok = false; }

  // Test 2: Manifest
  console.log('\n2. GET /manifest.json');
  var manifest = await get('/manifest.json');
  console.log('   ' + manifest.name + ' v' + manifest.version + ' | ' + manifest.types.length + ' types | ' + manifest.resources.length + ' resources');
  if (!manifest.resources) { console.log('   ✗ No resources'); ok = false; }

  // Test 3: Stream - Movie (The Matrix)
  console.log('\n3. GET /stream/movie/tt0133093.json');
  var movie = await get('/stream/movie/tt0133093.json');
  var streams = movie.streams || [];
  var torrents = streams.filter(function(s) { return s.infoHash; });
  var direct = streams.filter(function(s) { return s.url && (s.url.indexOf('.m3u8') >= 0 || s.url.indexOf('.mp4') >= 0); });
  console.log('   ' + streams.length + ' streams (' + torrents.length + ' torrent, ' + direct.length + ' direct)');
  if (streams.length === 0) { console.log('   ✗ No streams for Matrix'); ok = false; }
  else {
    streams.slice(0, 3).forEach(function(s) {
      var name = (s.name || '').split('\n')[0] || s.title || '';
      console.log('   [' + (s.quality||'HD') + '] ' + name.substring(0, 50));
    });
  }

  // Test 4: Stream - TV (Breaking Bad)
  console.log('\n4. GET /stream/series/tt0903747:1:1.json');
  var tv = await get('/stream/series/tt0903747:1:1.json');
  var tvStreams = tv.streams || [];
  console.log('   ' + tvStreams.length + ' streams');
  if (tvStreams.length === 0) { console.log('   ✗ No streams for Breaking Bad'); ok = false; }

  // Test 5: Stream - Anime (Naruto)
  console.log('\n5. GET /stream/series/ovn-anime:46260.json');
  var anime = await get('/stream/series/ovn-anime:46260.json');
  var animeStreams = anime.streams || [];
  console.log('   ' + animeStreams.length + ' streams');
  
  // Test 6: Meta
  console.log('\n6. GET /meta/movie/tt0133093.json');
  var meta = await get('/meta/movie/tt0133093.json');
  console.log('   ' + (meta.meta ? meta.meta.name : 'no meta'));

  // Test 7: Health
  console.log('\n7. GET /health');
  var health = await get('/health');
  console.log('   ' + (typeof health === 'object' ? 'OK (JSON)' : 'FAIL'));

  var elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log('\n' + '='.repeat(50));
  console.log((ok ? '✓ ALL E2E TESTS PASSED' : '✗ SOME TESTS FAILED') + ' (' + elapsed + 's)');
  process.exit(ok ? 0 : 1);
}

main().catch(function(e) { console.error('Server not running? ' + e.message); process.exit(1); });
