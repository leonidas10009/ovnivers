const cheerio = require('cheerio');

async function test() {
  // Check 1337x detail page structure
  const res = await fetch('https://1337xx.to/search/matrix/1/', {
    headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120' }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log('1337x search: ' + html.length + ' bytes');
  
  // Check rows
  var rows = $('table.table-list tbody tr');
  console.log('Rows found: ' + rows.length);
  
  rows.slice(0, 3).each(function(i, row) {
    var nameEls = $(row).find('td.name a');
    console.log('Row ' + i + ': ' + nameEls.length + ' name links');
    nameEls.each(function(j, a) {
      console.log('  [' + j + '] href=' + ($(a).attr('href') || '').substring(0, 70));
      console.log('       text=' + $(a).text().trim().substring(0, 50));
    });
  });

  // Check detail page for magnet
  console.log('\nDetail page magnet test:');
  var dRes = await fetch('https://1337xx.to/torrent/6209210/The-Matrix-1999-1080p-BluRay-H264-AAC-RARBG/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  var dHtml = await dRes.text();
  var d$ = cheerio.load(dHtml);
  
  // Look for magnet links
  var magnets = d$('a[href*="magnet"]');
  console.log('Magnet <a> tags: ' + magnets.length);
  magnets.each(function(i, el) {
    console.log('  ' + ($(el).attr('href') || '').substring(0, 80));
  });
  
  // Look for any href with magnet: or btih
  d$('a[href]').each(function(i, el) {
    var h = $(el).attr('href') || '';
    if (h.indexOf('magnet') >= 0 || h.indexOf('btih') >= 0) {
      console.log('  Found: ' + h.substring(0, 80));
    }
  });

  // Check for hash in page text
  var pageText = d$('body').text();
  var hashMatch = pageText.match(/[a-fA-F0-9]{40}/);
  if (hashMatch) console.log('\n  InfoHash in page: ' + hashMatch[0]);
  
  // Check for ul/li list with magnet
  var listItems = d$('ul li a[href]');
  console.log('\n  List item links: ' + listItems.length);
  listItems.each(function(i, el) {
    var h = $(el).attr('href') || '';
    if (h.length > 10) console.log('  ' + h.substring(0, 80));
  });
}

test().catch(function(e) { console.error(e); });
