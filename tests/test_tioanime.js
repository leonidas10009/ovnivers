const cheerio = require('cheerio');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

(async () => {
  // 1. Check TioAnime search page
  const res = await fetch('https://tioanime.com/directorio?q=naruto', { 
    headers: { 'User-Agent': UA }, 
    signal: AbortSignal.timeout(15000) 
  });
  const html = await res.text();
  console.log('Search status:', res.status, 'size:', (html.length/1024).toFixed(1) + 'KB');
  
  const $ = cheerio.load(html);
  // Find anime items - check various selectors
  const selectors = ['.anime', '.episode', '.item', 'article', '.card', 'li', '.series'];
  for (const sel of selectors) {
    const items = $(sel);
    if (items.length > 0) {
      console.log('\n' + sel + ':', items.length, 'items');
      // Show first item HTML
      const first = items.first();
      console.log('  First tag:', first.get(0)?.name);
      console.log('  Classes:', first.attr('class'));
      console.log('  First a href:', first.find('a').first().attr('href'));
      console.log('  First title:', first.find('h3, h4, h5, .title').first().text().trim());
      // Show full HTML of first
      if (items.length <= 5) {
        items.each((i, el) => {
          console.log('  [' + i + '] HTML:', $(el).html()?.substring(0, 200));
        });
      }
    }
  }
  
  // 2. Check episode page
  const res2 = await fetch('https://tioanime.com/ver/tensei-shitara-slime-datta-ken-4th-season-11', {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(15000)
  });
  const html2 = await res2.text();
  console.log('\nEpisode status:', res2.status, 'size:', (html2.length/1024).toFixed(1) + 'KB');
  
  const $2 = cheerio.load(html2);
  // Find video players/servers
  $2('script').each((i, el) => {
    const c = $2(el).html() || '';
    if (c.includes('var videos') || c.includes('servers') || c.includes('player') || c.includes('download') || c.includes('.mp4') || c.includes('.m3u8')) {
      console.log('\nScript #' + i + ':');
      console.log(c.substring(0, 1000));
    }
  });
  
  // Find iframes
  $2('iframe').each((i, el) => console.log('Iframe:', $2(el).attr('src')));
  
  // Find nav links for servers
  $2('.nav-item a, [class*=server], [class*=option]').each((i, el) => {
    if (i > 15) return;
    const text = $2(el).text().trim();
    const dataId = $2(el).attr('data-id');
    if (text) console.log('Server button:', text, dataId ? '(data-id=' + dataId + ')' : '');
  });
})();
