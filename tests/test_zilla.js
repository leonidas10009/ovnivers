const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
(async () => {
  const embedUrl = 'https://player.zilla-networks.com/play/c0fdb63d60b2fc2e666781cde213b155';
  const res = await fetch(embedUrl, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html', 'Referer': 'https://animeav1.com/' },
    signal: AbortSignal.timeout(15000)
  });
  const html = await res.text();
  console.log('Status:', res.status, 'Size:', html.length);
  
  const m3u8s = html.match(/https?:\/\/[^"'\s]*\.m3u8[^"'\s]*/gi) || [];
  const sources = html.match(/<source[^>]+src="([^"]+)"/gi) || [];
  const iframes = html.match(/<iframe[^>]+src="([^"]+)"/gi) || [];
  
  console.log('\nm3u8 URLs:', m3u8s.length);
  for (const u of m3u8s.slice(0,5)) console.log('  ' + u);
  console.log('\nsource tags:', sources.length);
  for (const s of sources.slice(0,5)) console.log('  ' + s);
  console.log('\niframes:', iframes.length);
  for (const i of iframes.slice(0,5)) console.log('  ' + i);
  
  // Show relevant JS data
  const jsMatch = html.match(/(?:window|const|var|let)\s*\w*\s*=\s*['"][^'"]{20,}['"]/g) || [];
  console.log('\nJS assignments:');
  for (const j of jsMatch.slice(0,5)) console.log('  ' + j);
})();
