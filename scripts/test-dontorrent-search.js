const cheerio = require('cheerio');

async function test() {
  try {
    const res = await fetch('https://dontorrent.support/buscar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: 'valor=FROM',
      redirect: 'follow'
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log('Status:', res.status);
    console.log('Final URL:', res.url);
    
    const cardText = $('.card').text().trim();
    console.log('Card text (first 500):', cardText.substring(0, 500));
    
    const seriesLinks = $('a[href*="/serie/"]').map((i, el) => ({
      text: $(el).text().trim(),
      href: $(el).attr('href')
    })).get();
    console.log('Series links found:', seriesLinks.length);
    seriesLinks.slice(0, 10).forEach((l, i) => console.log(`  [${i}] ${l.text} - ${l.href}`));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
