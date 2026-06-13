const UA = 'Mozilla/5.0';
(async () => {
  // Get TioAnime episodes
  const ac = new AbortController(); setTimeout(() => ac.abort(), 10000);
  const res = await fetch('https://tioanime.com/anime/one-piece-tv', { headers: { 'User-Agent': UA }, signal: ac.signal });
  const html = await res.text();
  
  const match = html.match(/var episodes = (\[.*?\]);/);
  if (match) {
    const eps = JSON.parse(match[1]);
    console.log('Total episodes:', eps.length);
    console.log('First 3:', JSON.stringify(eps.slice(0, 3)));
    // TioAnime episodes might have different format
    if (Array.isArray(eps[0])) {
      console.log('Format: array of arrays');
      const ep1 = eps.find(e => e[0] == 1);
      console.log('Episode 1:', JSON.stringify(ep1));
    } else if (typeof eps[0] === 'object') {
      console.log('Format: array of objects');
      console.log('Keys:', Object.keys(eps[0]));
    } else {
      console.log('First element type:', typeof eps[0]);
    }
    
    // Try episode URL  
    if (eps.length > 0) {
      const ep = eps.find(e => e[0] == 1) || eps[eps.length - 1];
      console.log('Target ep:', JSON.stringify(ep));
      // TioAnime pattern is probably /ver/{id}
      const epUrl = 'https://tioanime.com/ver/' + (ep[1] || ep.id);
      console.log('Episode URL:', epUrl);
      
      const ac2 = new AbortController(); setTimeout(() => ac2.abort(), 10000);
      const res2 = await fetch(epUrl, { headers: { 'User-Agent': UA }, signal: ac2.signal });
      const html2 = await res2.text();
      console.log('Episode page size:', (html2.length/1024).toFixed(1), 'KB');
      console.log('Has var videos:', html2.includes('var videos'));
      console.log('Has iframe:', html2.includes('<iframe'));
      console.log('Has jwplayer:', html2.includes('jwplayer'));
      console.log('Has player:', html2.includes('player'));
    }
  }
})();
