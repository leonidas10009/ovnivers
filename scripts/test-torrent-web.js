// test-torrent-web.js — Test all web providers that handle torrents
const { searchProvider, extractVideos } = require('../src/web-providers/engine');
const providers = require('../src/web-providers/providers');

// Filter torrent-type providers
var torrentProviders = providers.filter(function(p) {
  return p.categories && p.categories.indexOf('torrent') >= 0;
});

async function testProvider(p) {
  var cat = p.categories[0] || 'movie';
  var query = cat === 'anime' ? 'naruto' : 'matrix';
  
  var result = { name: p.name, title: p.title, active: p.active, type: p.videos ? p.videos.type : '?', search: null, videos: 0, infoHash: false, errors: [] };
  
  try {
    result.search = await searchProvider(p, query, null, 'movie');
  } catch(e) { result.errors.push('search: ' + e.message); return result; }
  
  if (!result.search) { result.errors.push('no search results'); return result; }
  
  try {
    var videos = await extractVideos(p, result.search);
    if (videos && videos.length) {
      result.videos = videos.length;
      result.infoHash = videos.some(function(v) { return v.infoHash; });
      result.servers = videos.map(function(v) { return v.server || '?'; }).filter(function(v,i,a) { return a.indexOf(v) === i; });
    }
  } catch(e) { result.errors.push('extract: ' + e.message); }
  
  return result;
}

async function main() {
  console.log('Torrent Web Providers (' + torrentProviders.length + ' total)\n');
  console.log('Status'.padEnd(10) + 'Provider'.padEnd(22) + 'Type'.padEnd(15) + 'Search'.padEnd(8) + 'Videos'.padEnd(8) + 'InfoHash'.padEnd(10) + 'Details');
  console.log('-'.repeat(100));

  for (var i = 0; i < torrentProviders.length; i++) {
    var p = torrentProviders[i];
    var icon = p.active ? 'ACTIVE' : 'INACTIVE';
    if (!p.active) {
      console.log(icon.padEnd(10) + p.title.padEnd(22) + (p.videos?p.videos.type:'?').padEnd(15) + 'SKIP'.padEnd(8) + '-'.padEnd(8) + '-'.padEnd(10) + 'inactive');
      continue;
    }
    
    process.stdout.write(icon.padEnd(10) + p.title.padEnd(22) + (p.videos?p.videos.type:'?').padEnd(15));
    var r = await testProvider(p);
    
    var searchOk = r.search ? 'OK' : 'FAIL';
    var videoOk = r.videos > 0 ? r.videos + 'v' : '0v';
    var hashOk = r.infoHash ? 'YES' : 'no';
    var details = r.videos > 0 ? (r.servers||[]).slice(0,4).join(', ') : (r.errors[0] || '');
    
    console.log(searchOk.padEnd(8) + videoOk.padEnd(8) + hashOk.padEnd(10) + details);
  }
}

main().catch(function(e) { console.error(e); process.exit(1); });
