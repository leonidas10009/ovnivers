const cheerio = require('cheerio');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

(async () => {
  const res = await fetch('https://jkanime.net/', { 
    headers: { 'User-Agent': UA }, 
    signal: AbortSignal.timeout(10000) 
  });
  const html = await res.text();
  console.log('Homepage size:', (html.length/1024).toFixed(1) + 'KB');
  
  const $ = cheerio.load(html);
  
  // Find sections with anime items
  console.log('\n=== Finding anime items ===');
  const selectors = [
    '.anime__item',
    '.owl-carousel .anime__item',
    '.anime__item__pic',
    '.last-episodes .anime__item',
    '.recent .anime__item',
    '[class*=anime]',
    '.episode-item',
    '.last-ep',
    '.chapter',
  ];
  
  for (const sel of selectors) {
    const count = $(sel).length;
    if (count > 0) {
      console.log(sel + ':', count);
      if (count > 0 && count <= 5) {
        // Show first item HTML
        const html = $(sel).first().html();
        if (html) console.log('  HTML:', html.substring(0, 300));
      }
    }
  }
  
  // Look for latest episodes section
  const headings = $('h2, h3, h4, .section-title, .title-section');
  console.log('\n=== Section headings ===');
  headings.each((i, el) => {
    if (i > 10) return;
    console.log('  ', $(el).text().trim());
  });
})();
