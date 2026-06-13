const cheerio = require('cheerio');
const UA = 'Mozilla/5.0';

(async () => {
  const ac = new AbortController(); setTimeout(() => ac.abort(), 10000);
  const res = await fetch('https://jkanime.net/one-piece/', { headers: { 'User-Agent': UA }, signal: ac.signal });
  const html = await res.text();
  console.log('HTML:', (html.length/1024).toFixed(1), 'KB');
  const $ = cheerio.load(html);
  
  // Capítulos container
  console.log('\nCapítulos section:');
  $('div.capitulos').each((i, el) => {
    console.log('  Class:', $(el).attr('class'));
    console.log('  Children count:', $(el).children().length);
    // Show first child
    const first = $(el).children().first();
    console.log('  First child tag:', first.get(0) ? first.get(0).name : 'none');
    console.log('  First child class:', first.attr('class'));
    // Show HTML
    console.log('  HTML (300):', $(el).html().substring(0, 300));
  });

  // Try direct episode URL
  console.log('\n--- Try direct episode URL ---');
  const epUrl = 'https://jkanime.net/one-piece/1/';
  try {
    const ac2 = new AbortController(); setTimeout(() => ac2.abort(), 10000);
    const res2 = await fetch(epUrl, { headers: { 'User-Agent': UA }, signal: ac2.signal });
    console.log('Status:', res2.status);
    const html2 = await res2.text();
    console.log('HTML:', (html2.length/1024).toFixed(1), 'KB');
    const $2 = cheerio.load(html2);
    console.log('Has var videos:', html2.includes('var videos'));
    console.log('Has player:', html2.includes('player'));
    // Show video-related script
    $2('script').each((i, el) => {
      const c = $(el).html() || '';
      if (c.includes('var videos') || c.includes('sources') || c.includes('player')) {
        console.log('Script with video data, first 300 chars:', c.substring(0, 300));
      }
    });
    // Check for iframes
    $2('iframe').each((i, el) => {
      console.log('Iframe:', $(el).attr('src'));
    });
  } catch(e) {
    console.log('Error:', e.message);
  }
})();
