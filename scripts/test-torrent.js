// test-torrent.js — Audit torrent providers with content quality check
const torrentIndex = require('../src/torrent-providers/index');

async function test() {
  console.log('=== Torrent Providers Audit ===\n');

  // Test 1: Movie search
  console.log('1. Movie: The Matrix');
  const movieResults = await torrentIndex.search('The Matrix', 'movie', 'tt0133093', 1999);
  console.log('   Results: ' + (movieResults ? movieResults.length : 0));
  if (movieResults && movieResults.length) {
    const bySource = {};
    movieResults.forEach(function(r) {
      var src = r.indexer || 'unknown';
      if (!bySource[src]) bySource[src] = [];
      bySource[src].push(r);
    });
    for (var src in bySource) {
      var items = bySource[src];
      console.log('   ' + src.padEnd(18) + ': ' + items.length + ' torrents');
      items.slice(0, 2).forEach(function(r) {
        console.log('     [' + (r.quality||'HD').padEnd(6) + '] ' + (r.seeds||0) + ' seeds | ' + (r.sizeFormatted||'?') + ' | ' + (r.title||'').substring(0,50));
      });
    }
  }

  // Test 2: Series search  
  console.log('\n2. TV: Breaking Bad S01E01');
  var tvResults = await torrentIndex.search('Breaking Bad', 'tv', null, 2008, 1, 1);
  console.log('   Results: ' + (tvResults ? tvResults.length : 0));
  if (tvResults && tvResults.length) {
    var bySource2 = {};
    tvResults.forEach(function(r) {
      var src = r.indexer || 'unknown';
      if (!bySource2[src]) bySource2[src] = [];
      bySource2[src].push(r);
    });
    for (var src2 in bySource2) {
      var items2 = bySource2[src2];
      console.log('   ' + src2.padEnd(18) + ': ' + items2.length + ' torrents');
      items2.slice(0, 2).forEach(function(r) {
        console.log('     [' + (r.quality||'HD').padEnd(6) + '] ' + (r.seeds||0) + ' seeds | ' + (r.sizeFormatted||'?') + ' | ' + (r.title||'').substring(0,50));
      });
    }
  }

  // Test 3: Anime search
  console.log('\n3. Anime: Naruto');
  var animeResults = await torrentIndex.search('Naruto', 'tv', null, 2002, 1, 1, true);
  console.log('   Results: ' + (animeResults ? animeResults.length : 0));
  if (animeResults && animeResults.length) {
    var bySource3 = {};
    animeResults.forEach(function(r) {
      var src = r.indexer || 'unknown';
      if (!bySource3[src]) bySource3[src] = [];
      bySource3[src].push(r);
    });
    for (var src3 in bySource3) {
      var items3 = bySource3[src3];
      console.log('   ' + src3.padEnd(18) + ': ' + items3.length + ' torrents');
      items3.slice(0, 2).forEach(function(r) {
        console.log('     [' + (r.quality||'HD').padEnd(6) + '] ' + (r.seeds||0) + ' seeds | ' + (r.sizeFormatted||'?') + ' | ' + (r.title||'').substring(0,50));
      });
    }
  }

  // Quality check: verify results look correct
  console.log('\n4. Quality check:');
  var allResults = (movieResults || []).concat(tvResults || []).concat(animeResults || []);
  var issues = [];
  
  var garbagePatterns = [/^$/, /^Search/, /^\d+$/, /xxx/i];
  allResults.forEach(function(r) {
    if (!r.infoHash) issues.push('Missing infoHash: ' + (r.title||'?'));
    if (!r.magnet) issues.push('Missing magnet: ' + (r.title||'?'));
    if (typeof r.seeds !== 'number' || isNaN(r.seeds)) issues.push('Bad seeds: ' + r.seeds);
    for (var i = 0; i < garbagePatterns.length; i++) {
      if (garbagePatterns[i].test(r.title || '')) {
        issues.push('Garbage title: "' + r.title + '" from ' + r.indexer);
        break;
      }
    }
  });

  console.log('   Total torrents: ' + allResults.length);
  console.log('   Issues: ' + issues.length);
  issues.slice(0, 10).forEach(function(i) { console.log('   - ' + i); });
}

test().catch(function(e) { console.error(e); process.exit(1); });
