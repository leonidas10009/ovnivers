const https = require('https');
function get(url) { return new Promise(r => { https.get(url, {headers:{'User-Agent':'Mozilla/5.0'},timeout:15000}, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>r(d)); }).on('error',()=>r('')); }); }

(async () => {
  const url = 'https://voe.sx/e/2q1h5ufnacb3';
  const html = await get(url);
  console.log('Status ok:', html.length > 0);
  
  // Check patterns the resolver uses
  console.log('has sources:', html.includes('sources'));
  console.log('has .mp4:', html.includes('.mp4'));
  console.log('has .m3u8:', html.includes('.m3u8'));
  
  // Find video URLs directly
  const matches = html.match(/https?:\\/\\/[^"'\\s<>]+\.(mp4|m3u8)[^"'\\s<>]*/g) || [];
  console.log('Direct video URLs:', matches.length);
  for (const m of matches) console.log('  ' + m);
  
  // Look for script with video data
  const idx = html.indexOf('sources');
  if (idx >= 0) console.log('Around sources:', html.substring(Math.max(0,idx-50), idx+200));
  
  // Try resolveEmbed properly
})();
