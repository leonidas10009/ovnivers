// test-torrent-live.js — Live test ALL torrent providers with multi-engine
const { searchStatic, extractStatic } = require('../src/engines');
const { getDynamicEngine } = require('../src/engines/dynamic-engine');
const { getProviderMemory } = require('../src/intelligent/provider-memory');
const torrentIndex = require('../src/torrent-providers/index');
const webProviders = require('../src/alfa-providers/providers');

const QUERY = 'matrix';
const memory = getProviderMemory();

// All torrent sources to test
const TORRENT_SOURCES = [
  // Dedicated indexers
  { type: 'indexer', name: 'GloDLS', test: () => torrentIndex.search(QUERY, 'movie', 'tt0133093', 1999).then(r => ({ name: 'GloDLS', results: (r||[]).filter(t => t.infoHash) })) },
  { type: 'indexer', name: 'SolidTorrents', test: () => torrentIndex.search(QUERY, 'movie', 'tt0133093', 1999).then(r => ({ name: 'SolidTorrents', results: (r||[]).filter(t => t.infoHash) })) },
  { type: 'indexer', name: 'LimeTorrents', test: () => torrentIndex.search(QUERY, 'movie', 'tt0133093', 1999).then(r => ({ name: 'LimeTorrents', results: (r||[]).filter(t => t.infoHash) })) },
  { type: 'indexer', name: 'Nyaa.si', test: () => torrentIndex.search(QUERY, 'movie', 'tt0133093', 1999).then(r => ({ name: 'Nyaa.si', results: (r||[]).filter(t => t.infoHash) })) },
  { type: 'indexer', name: '1337x', test: () => torrentIndex.search(QUERY, 'movie', 'tt0133093', 1999).then(r => ({ name: '1337x', results: (r||[]).filter(t => t.infoHash) })) },
  // Web providers with torrent capability
  { type: 'web', name: 'divxtotal', test: () => testWebProvider('divxtotal', QUERY) },
  { type: 'web', name: 'dontorrent', test: () => testWebProvider('dontorrent', QUERY) },
  { type: 'web', name: 'bloghorror', test: () => testWebProvider('bloghorror', QUERY) },
  { type: 'web', name: 'elitetorrent', test: () => testWebProvider('elitetorrent', QUERY) },
  { type: 'web', name: 'hacktorrent', test: () => testWebProvider('hacktorrent', 'naruto') },
];

async function testWebProvider(name, query) {
  var p = webProviders.find(function(x) { return x.name === name; });
  if (!p) return { name: name, results: [], error: 'not found' };
  
  var url = await searchStatic(p, query);
  if (!url) return { name: name, results: [], error: 'no search' };
  
  var videos = await extractStatic(p, url);
  var torrents = (videos || []).filter(function(v) { return v.infoHash || (v.url && v.url.indexOf('magnet') >= 0); });
  
  return {
    name: name,
    title: p.title,
    results: torrents.map(function(v) {
      return {
        name: v.filename || v.server || p.title,
        infoHash: v.infoHash || '',
        magnet: v.url || '',
        seeds: 0,
        sizeFormatted: '?',
        quality: v.quality || 'HD',
      };
    }),
  };
}

async function main() {
  console.log('=== TORRENT PROVIDERS LIVE TEST ===\n');
  
  var results = [];
  for (var i = 0; i < TORRENT_SOURCES.length; i++) {
    var s = TORRENT_SOURCES[i];
    process.stdout.write('[' + (i+1) + '/' + TORRENT_SOURCES.length + '] ' + s.name.padEnd(20) + '... ');
    try {
      var r = await s.test();
      var count = (r.results || []).length;
      var hasInfoHash = (r.results || []).filter(function(t) { return t.infoHash; }).length;
      console.log(count + ' torrents (' + hasInfoHash + ' infoHash)' + (r.error ? ' ' + r.error : ''));
      results.push({ name: s.name, type: s.type, count: count, infoHash: hasInfoHash, error: r.error, sample: (r.results||[])[0] });
    } catch(e) {
      console.log('ERROR: ' + e.message);
      results.push({ name: s.name, type: s.type, count: 0, error: e.message });
    }
  }

  // Summary
  console.log('\n=== SUMMARY ===\n');
  var working = results.filter(function(r) { return r.count > 0; });
  var withInfoHash = results.filter(function(r) { return r.infoHash > 0; });
  
  console.log('Produce torrents: ' + working.length + '/' + results.length);
  working.forEach(function(r) {
    console.log('  ' + (r.infoHash > 0 ? '✓' : '⚠') + ' ' + r.name.padEnd(20) + ' ' + r.count + ' torrents' + (r.infoHash > 0 ? ' (infoHash OK)' : ' (no infoHash)'));
  });
  
  console.log('\nFailing:');
  results.filter(function(r) { return r.count === 0; }).forEach(function(r) {
    console.log('  ✗ ' + r.name.padEnd(20) + (r.error || 'no results'));
  });
}

main().catch(function(e) { console.error(e); process.exit(1); });
