const cheerio = require('cheerio');
const UA = 'Mozilla/5.0';

(async () => {
  const ac = new AbortController(); setTimeout(() => ac.abort(), 10000);
  const res = await fetch('https://jkanime.net/one-piece/1/', { headers: { 'User-Agent': UA }, signal: ac.signal });
  const html = await res.text();
  
  // Find all script tags with video content
  const $ = cheerio.load(html);
  $('script').each((i, el) => {
    const c = $(el).html() || '';
    if (c.includes('video') || c.includes('player') || c.includes('iframe') || c.includes('src')) {
      console.log(`Script #${i} (${c.length} chars):`);
      // Show the full content
      console.log(c.substring(0, 1500));
      console.log('...');
    }
  });
  
  // Also check for iframes
  console.log('\nIframes:');
  $('iframe').each((i, el) => {
    console.log(`  [${i}] src: ${$(el).attr('src')}`);
  });
  
  // Search for any URL patterns
  const urlPattern = /https?:\/\/[^\s"'<>]+/g;
  const urls = html.match(urlPattern) || [];
  const videoUrls = urls.filter(u => u.includes('jkplayer') || u.includes('video') || u.includes('stream') || u.includes('embed') || u.includes('player'));
  console.log('\nVideo-related URLs:', videoUrls.slice(0, 5));
})();
