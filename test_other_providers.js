const UA = 'Mozilla/5.0';
async function checkPage(url) {
  console.log('\n=== ' + url + ' ===');
  try {
    const ac = new AbortController(); setTimeout(() => ac.abort(), 10000);
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ac.signal });
    const html = await res.text();
    console.log('Size:', (html.length/1024).toFixed(1), 'KB');
    console.log('Has var videos:', html.includes('var videos'));
    console.log('Has var video:', html.includes('var video'));
    console.log('Has var episodes:', html.includes('var episodes'));
    console.log('Has iframe:', html.includes('<iframe'));
    console.log('Has data-video:', html.includes('data-video'));
    // Check for direct URLs
    const mp4 = html.match(/https?:\/\/[^"'\s]+\.(mp4|m3u8)[^"'\s]*/g);
    console.log('Direct mp4/m3u8:', mp4 ? mp4.length : 0);
    // Check for any URL patterns that look like video embed  
    const embeds = html.match(/https?:\/\/[^"'\s]*(player|embed|stream|video)[^"'\s]*/g);
    if (embeds) console.log('Embed URLs:', embeds.slice(0, 3));
  } catch(e) { console.log('Error:', e.message); }
}

(async () => {
  // Check the episode pages of providers that found pages
  await checkPage('https://henaojara.com/view/one-piece-sub-espanol-hd/');
  await checkPage('https://tioanime.com/anime/one-piece-tv');
  await checkPage('https://estrenosanime.net/anime/one-piece');
  await checkPage('https://sololatino.net/serie/one-piece-2');
  // Also check if tioanime has var episodes like animeflv
})();
