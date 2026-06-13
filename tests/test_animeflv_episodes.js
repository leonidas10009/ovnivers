const cheerio = require('cheerio');
const UA = 'Mozilla/5.0';

(async () => {
  const ac = new AbortController(); setTimeout(() => ac.abort(), 10000);
  const res = await fetch('https://www3.animeflv.net/anime/one-piece-tv', { headers: { 'User-Agent': UA }, signal: ac.signal });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Find var episodes
  const match = html.match(/var episodes = (\[.*?\]);/);
  if (match) {
    const eps = JSON.parse(match[1]);
    console.log('Total episodes:', eps.length);
    console.log('First 3:', JSON.stringify(eps.slice(0, 3)));
    // Episode 1 is probably at the end (descending order)
    const ep1 = eps.find(e => e[0] === 1);
    console.log('Episode 1:', ep1 ? JSON.stringify(ep1) : 'not found');
    // Try the last entry (oldest episode)
    const last = eps[eps.length - 1];
    console.log('Last:', JSON.stringify(last));
    
    // Try episode URL
    const epId = last ? last[1] : eps[eps.length - 1][1];
    const epUrl = 'https://www3.animeflv.net/ver/' + epId;
    console.log('\nTrying episode URL:', epUrl);
    
    const ac2 = new AbortController(); setTimeout(() => ac2.abort(), 10000);
    const res2 = await fetch(epUrl, { headers: { 'User-Agent': UA }, signal: ac2.signal });
    const html2 = await res2.text();
    console.log('Episode page has var videos:', html2.includes('var videos'));
    const vm = html2.match(/var videos = (\[.*?\]);/);
    if (vm) console.log('Videos:', vm[1].substring(0, 200));
    
    // Check for episode 1165 (latest) too
    const first = eps[0];
    const epUrl2 = 'https://www3.animeflv.net/ver/' + first[1];
    console.log('\nLatest episode URL:', epUrl2);
    const ac3 = new AbortController(); setTimeout(() => ac3.abort(), 10000);
    const res3 = await fetch(epUrl2, { headers: { 'User-Agent': UA }, signal: ac3.signal });
    const html3 = await res3.text();
    console.log('Latest episode has var videos:', html3.includes('var videos'));
  }
})();
