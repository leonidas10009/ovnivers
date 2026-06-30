var BASE = process.env.OVNIVERS_URL || 'http://localhost:3000';

async function test(name, url, timeout) {
  process.stdout.write(name + '... ');
  var t0 = Date.now();
  try {
    var ctrl = new AbortController();
    setTimeout(function() { ctrl.abort(); }, timeout);
    var r = await fetch(url, { signal: ctrl.signal });
    var j = await r.json();
    var t = Date.now() - t0;
    var s = j.streams || [];
    var d = s.filter(function(x) { return (x.url || '').match(/\.(mp4|m3u8|ts)/i); });
    console.log((t/1000).toFixed(1) + 's: ' + s.length + ' streams, ' + d.length + ' ExoPlayer');
    s.slice(0, 3).forEach(function(x) { console.log('  ' + (x.url || '').substring(0, 100)); });
    return { name: name, streams: s.length, direct: d.length, time: t };
  } catch(e) {
    var t = Date.now() - t0;
    console.log((t/1000).toFixed(1) + 's: ERROR - ' + (e.name || '') + ' ' + (e.message || '').substring(0, 60));
    return null;
  }
}

async function main() {
  console.log('Puppeteer endpoints en Render\n');
  
  var r1 = await test('JKAnime  ', BASE + '/stream/jkanime-pptr/naruto/1.json', 120000);
  var r2 = await test('TioAnime ', BASE + '/stream/tioanime-pptr/naruto/1.json', 120000);
  var r3 = await test('AnimeAV1 ', BASE + '/stream/animeav1-pptr/naruto/1.json', 120000);
  
  console.log('\n---');
  var total = (r1?r1.direct:0) + (r2?r2.direct:0) + (r3?r3.direct:0);
  console.log('TOTAL ExoPlayer: ' + total);
}

main().catch(console.error);
