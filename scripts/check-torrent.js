const cheerio = require('cheerio');

async function test() {
  // Check 1337x HTML structure
  const res = await fetch('https://1337xx.to/search/matrix/1/', {
    headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log('1337x HTML structure (' + (html.length/1024).toFixed(0) + 'KB):');
  console.log('  table.table-list tbody tr:', $('table.table-list tbody tr').length);
  console.log('  table tr:', $('table tr').length);
  console.log('  tbody tr:', $('tbody tr').length);
  console.log('  td.name:', $('td.name').length);
  console.log('  a[href*="torrent"]:', $('a[href*="torrent"]').length);
  
  // Show first few rows
  console.log('\n  Sample rows:');
  $('table tr, tbody tr, tr').slice(0, 3).each(function(i, el) {
    console.log('  [' + i + '] ' + $(el).text().trim().substring(0, 120));
  });

  // Check EZTV API
  console.log('\nEZTV API:');
  const ezRes = await fetch('https://eztv.re/api/get-torrents?imdb_id=tt0903747', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const data = await ezRes.json();
  console.log('  Total torrents:', data.torrents ? data.torrents.length : 0);
  if (data.torrents) {
    data.torrents.slice(0, 3).forEach(function(t) {
      console.log('  [' + (t.season||'?') + 'x' + (t.episode||'?') + '] ' + (t.seeds||0) + ' seeds | ' + (t.title||'').substring(0, 60));
    });
  }
}

test().catch(function(e) { console.error(e); });
