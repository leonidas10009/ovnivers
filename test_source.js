const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

(async () => {
  // Test 2embed.cc for actual stream extraction
  const res = await fetch('https://www.2embed.cc/embed/550', {
    headers: { 'User-Agent': ua, 'Referer': 'https://www.2embed.cc/' },
    signal: AbortSignal.timeout(12000)
  });
  const html = await res.text();
  
  // Find any m3u8 or mp4 URLs
  const m3u8 = html.match(/["']([^"']*m3u8[^"']*)["']/gi);
  const mp4 = html.match(/["']([^"']*\.mp4[^"']*)["']/gi);
  console.log('m3u8:', (m3u8 || []).slice(0, 5));
  console.log('mp4:', (mp4 || []).slice(0, 5));
  
  // Find all server URLs in the HTML
  const allUrls = [...html.matchAll(/https?:\/\/[^\s"'<>]+/g)].map(m => m[0]);
  const streamUrls = allUrls.filter(u => u.includes('m3u8') || u.includes('mp4') || u.includes('embed') || u.includes('play'));
  console.log('Stream URLs:', streamUrls.slice(0, 10));

  // Also test 2embed.skin
  try {
    const r2 = await fetch('https://2embed.skin/api/movie/550.json', {
      headers: { 'User-Agent': ua, 'Referer': 'https://2embed.skin/' },
      signal: AbortSignal.timeout(10000)
    });
    if (r2.ok) {
      const d = await r2.json();
      console.log('2embed.skin API:', JSON.stringify(d).substring(0, 300));
    } else {
      console.log('2embed.skin HTTP:', r2.status);
    }
  } catch(e) {
    console.log('2embed.skin FAIL:', e.message);
  }
})();
