// Test JKAnime page rendering with Puppeteer on Docker/Coolify
const https = require('https');

function g(url) { return new Promise(r => {
  https.get(url, {timeout:180000}, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try{r(JSON.parse(d))}catch{r({raw:d.substring(0,200)})} }); }).on('error',()=>r(null));
}); }

(async () => {
  // Test 1: Can Puppeteer load the JKAnime page and extract servers?
  console.log('Test: Puppeteer loads jkanime page...');
  const BASE = process.env.OVNIVERS_URL || 'http://localhost:3000';
  const r1 = await g(BASE + '/resolve-embed?url=' + encodeURIComponent('https://jkanime.net/tensei-shitara-slime-datta-ken-4th-season/11/'));
  console.log('JKAnime page:', JSON.stringify(r1).substring(0, 200));
})();
