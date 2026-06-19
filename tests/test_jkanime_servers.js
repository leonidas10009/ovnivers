const https = require('https');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function request(opts) {
  return new Promise(resolve => {
    https.request(opts, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, cookies: res.headers['set-cookie'] || [], body: d }));
    }).on('error', e => resolve({ error: e.message })).end();
  });
}

(async () => {
  const r1 = await request({ hostname: 'jkanime.net', path: '/', headers: { 'User-Agent': UA } });
  const cookies = r1.cookies.join('; ');
  
  const r2 = await request({
    hostname: 'jkanime.net',
    path: '/tensei-shitara-slime-datta-ken-4th-season/11/',
    headers: { 'User-Agent': UA, 'Cookie': cookies }
  });
  
  const html = r2.body;
  
  // Extract servers JSON
  const serverMatch = html.match(/var servers\s*=\s*(\[[\s\S]*?\]);/);
  if (!serverMatch) { console.log('No servers found'); return; }
  
  const servers = JSON.parse(serverMatch[1]);
  console.log('Total servers:', servers.length);
  
  const decoded = servers.map(s => {
    try {
      const url = Buffer.from(s.remote, 'base64').toString('utf-8');
      return { server: s.server, lang: s.lang === 1 ? 'SUB' : s.lang === 2 ? 'LAT' : '?', size: s.size, url, slug: s.slug };
    } catch { return { server: s.server, error: 'decode failed', raw: s.remote?.substring(0, 30) }; }
  });
  
  for (const s of decoded) {
    console.log(`  ${s.server} [${s.lang}] ${s.size}: ${s.url?.substring(0, 80) || s.error}`);
  }
  
  // Now get the iframes (they use jkplayer URLs with encrypted params)
  console.log('\n=== JKPlayer iframes ===');
  const iframeMatches = html.match(/<iframe[^>]+src="([^"]+jkplayer[^"]+)"/gi) || [];
  for (const m of iframeMatches) {
    const srcMatch = m.match(/src="([^"]+)"/);
    if (srcMatch) console.log('  ', srcMatch[1]);
  }
  
  // Also check for the video player that uses these servers
  console.log('\n=== Video loading scripts ===');
  const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
  for (const s of scriptMatches) {
    if (s.includes('servers') && s.includes('function') && s.includes('jkplayer')) {
      console.log('  Found player script, length:', s.length);
      // Find the function that loads a server
      const funcMatch = s.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{50,500}/g);
      if (funcMatch) {
        for (const f of funcMatch.slice(0, 3)) {
          console.log('  ', f.substring(0, 400));
        }
      }
    }
  }
})();
