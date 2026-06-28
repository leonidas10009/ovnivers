var cheerio = require('cheerio');

async function test() {
  // Test EliteTorrent search structure
  var res = await fetch('https://www.elitetorrent.com/?s=matrix', {headers:{'User-Agent':'Mozilla/5.0 Chrome/120'}});
  var html = await res.text();
  var $ = cheerio.load(html);
  
  console.log('EliteTorrent (' + (html.length/1024).toFixed(0) + 'KB):');
  console.log('  article:', $('article').length);
  console.log('  .post:', $('.post').length);
  console.log('  h2:', $('h2').length);
  console.log('  h3:', $('h3').length);
  console.log('  a[href*="/pelicula"]:', $('a[href*="/pelicula"]').length);
  console.log('  a[href*="/torrent"]:', $('a[href*="/torrent"]').length);
  console.log('  a[href*="magnet"]:', $('a[href*="magnet"]').length);
  console.log('  a[href$=".torrent"]:', $('a[href$=".torrent"]').length);
  
  // Find content links  
  var found = [];
  $('a[href]').each(function(i, el) {
    var href = ($(el).attr('href')||'').toLowerCase();
    var text = $(el).text().trim();
    if ((href.indexOf('/pelicula') >= 0 || href.indexOf('/torrent') >= 0 || href.indexOf('magnet') >= 0) && text.length > 3) {
      found.push({ text: text.substring(0,50), href: ($(el).attr('href')||'').substring(0,60) });
    }
  });
  console.log('  Content links found:', found.length);
  found.slice(0, 8).forEach(function(f) {
    console.log('    ' + f.text + ' → ' + f.href);
  });

  // Test BlogHorror
  var res2 = await fetch('https://bloghorror.com/?s=matrix', {headers:{'User-Agent':'Mozilla/5.0 Chrome/120'}});
  var html2 = await res2.text();
  var $2 = cheerio.load(html2);
  
  console.log('\nBlogHorror (' + (html2.length/1024).toFixed(0) + 'KB):');
  console.log('  article:', $2('article').length);
  console.log('  li a[href*="/pelicula"]:', $2('li a[href*="/pelicula"]').length);
  console.log('  a[href*="magnet"]:', $2('a[href*="magnet"]').length);
  console.log('  a[href$=".torrent"]:', $2('a[href$=".torrent"]').length);
  
  var found2 = [];
  $2('a[href]').each(function(i, el) {
    var href = ($2(el).attr('href')||'').toLowerCase();
    var text = $2(el).text().trim();
    if ((href.indexOf('/pelicula') >= 0 || href.indexOf('magnet') >= 0 || href.indexOf('.torrent') >= 0) && text.length > 3) {
      found2.push({ text: text.substring(0,50), href: ($2(el).attr('href')||'').substring(0,60) });
    }
  });
  console.log('  Content links found:', found2.length);
  found2.slice(0, 8).forEach(function(f) {
    console.log('    ' + f.text + ' → ' + f.href);
  });
}

test().catch(function(e) { console.error(e); });
