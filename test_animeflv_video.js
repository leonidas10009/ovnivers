const cheerio = require('cheerio');
const UA = 'Mozilla/5.0';

(async () => {
  // Check what video-related content is on the AnimeFLV episode page
  const urls = [
    'https://www3.animeflv.net/ver/705',
    'https://www3.animeflv.net/ver/70142'
  ];
  
  for (const url of urls) {
    console.log('\n=== ' + url + ' ===');
    const ac = new AbortController(); setTimeout(() => ac.abort(), 10000);
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ac.signal });
    const html = await res.text();
    console.log('HTML:', (html.length/1024).toFixed(1), 'KB');
    console.log('Has var videos:', html.includes('var videos'));
    console.log('Has var video:', html.includes('var video'));
    console.log('Has iframe:', html.includes('<iframe'));
    console.log('Has jwplayer:', html.includes('jwplayer'));
    console.log('Has player:', html.includes('player'));
    console.log('Has sources:', html.includes('sources'));
    console.log('Has data-video:', html.includes('data-video'));
    
    // Search for URL patterns
    const urls2 = html.match(/https?:\/\/[^\s"'<>]+\.(mp4|m3u8)[^\s"'<>]*/g) || [];
    console.log('Direct video URLs (mp4/m3u8):', urls2.length);
    urls2.slice(0, 3).forEach(u => console.log('  ' + u.substring(0, 100)));
    
    // Check forms
    console.log('Forms:', $('form').length);
    
    // Search for video container
    const $ = cheerio.load(html);
    $('[id*="video"], [id*="player"], [class*="video"], [class*="player"]').slice(0, 5).each((i, el) => {
      console.log('Video container:', el.name, $(el).attr('class'), $(el).attr('id'));
    });
    
    // Any AJAX/API URLs
    const apiUrls = html.match(/https?:\/\/[^"'\s]*(api|ajax|get|source)[^"'\s]*/g) || [];
    console.log('API-like URLs:', apiUrls.slice(0, 5));
  }
})();
