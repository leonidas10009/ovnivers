// Final comprehensive test of ALL embed resolver handlers
delete require.cache[require.resolve('../src/alfa-providers/embed-resolver')];
var { resolveEmbed, clearCache } = require('../src/alfa-providers/embed-resolver');
clearCache();

var TESTS = [
  { name: 'MP4Upload', url: 'https://www.mp4upload.com/embed-526x1zi78bnr.html' },
  { name: 'MP4Upload v2', url: 'https://www.mp4upload.com/embed-rjtb37hizk69.html' },
  { name: 'Streamtape', url: 'https://streamtape.com/e/DjB9vRo0B2HkM1d' },
  { name: 'Streamtape v2', url: 'https://streamtape.com/e/AlGKZbGK4JCwpR' },
  { name: 'MixDrop', url: 'https://mxdrop.to/e/4dv3g0w4hx3p7o' },
  { name: 'OkRu', url: 'https://ok.ru/videoembed/11131994049170' },
  { name: 'Filelions', url: 'https://filelions.top/v/g1n85seovo2s' },
  { name: 'Uqload', url: 'https://uqload.com/embed-sqrmhf6twdf1.html' },
  { name: 'Streamwish', url: 'https://sfastwish.com/e/1npq6bsoq3wb' },
];

async function main() {
  console.log('='.repeat(65));
  console.log('EMBED RESOLVER — Test Final');
  console.log('='.repeat(65) + '\n');
  
  var resolved = 0;
  var total = 0;
  
  for (var i = 0; i < TESTS.length; i++) {
    var t = TESTS[i];
    var t0 = Date.now();
    var result = null;
    
    try {
      result = await resolveEmbed(t.url, 'https://example.com/');
    } catch(e) { result = null; }
    
    var elapsed = Date.now() - t0;
    total++;
    
    var type = 'FAIL';
    if (result) {
      if (result.match(/\.(m3u8|mp4|ts)(\?|$)/i)) type = 'DIRECT';
      else if (result.match(/\.(html|php|css|js)/i)) type = 'OTHER';
      else if (result.includes('/d/') && result.includes('mp4upload')) type = 'DIRECT';
      else type = 'URL';
    }
    
    if (type === 'DIRECT') resolved++;
    
    var icon = type === 'DIRECT' ? '✅' : '❌';
    console.log(icon + ' ' + (t.name + '                ').substring(0, 18) + ' ' + type + ' (' + elapsed + 'ms)');
    if (result) console.log('   ' + result.substring(0, 100));
  }
  
  console.log('\n' + '='.repeat(65));
  console.log('Directos: ' + resolved + '/' + total);
  console.log('='.repeat(65));
}

main().catch(console.error);
