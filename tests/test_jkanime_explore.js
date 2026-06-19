const https = require('https');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function request(opts, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, cookies: res.headers['set-cookie'] || [], body: data }));
    });
    req.on('error', e => resolve({ error: e.message }));
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  // Fix episode API test
  const r1 = await request({
    hostname: 'jkanime.net',
    path: '/',
    headers: { 'User-Agent': UA }
  });
  const cookieHeader = (r1.cookies || []).join('; ');
  const csrfMatch = r1.body.match(/<meta name="csrf-token" content="([^"]+)"/);
  const csrfToken = csrfMatch ? csrfMatch[1] : '';
  
  console.log('CSRF:', csrfToken ? 'OK' + csrfToken.substring(0, 20) : 'MISSING');
  console.log('Cookies:', cookieHeader.substring(0, 100));
  
  // Try page 1
  const r2 = await request({
    hostname: 'jkanime.net',
    path: '/ajax/episodes/123/',
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': csrfToken,
      'Accept': 'application/json',
      'Referer': 'https://jkanime.net/naruto/',
      'Cookie': cookieHeader
    }
  });
  
  console.log('Page 1 status:', r2.status);
  const data = JSON.parse(r2.body);
  console.log('Total:', data.total, 'Per page:', data.per_page, 'Last:', data.last_page);
  console.log('Data count:', data.data?.length);
  if (data.data?.length) {
    console.log('First:', JSON.stringify(data.data[0]));
    console.log('Second:', JSON.stringify(data.data[1]));
  }
  
  // Check if page param name is different
  // Also try with no body at all
  const r3 = await request({
    hostname: 'jkanime.net',
    path: '/ajax/episodes/123/',
    method: 'POST',
    headers: {
      'User-Agent': UA,
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': csrfToken,
      'Accept': 'application/json',
      'Referer': 'https://jkanime.net/naruto/',
      'Cookie': cookieHeader
    }
  });
  
  console.log('\nNo body (GET-like POST):', r3.status);
  if (r3.status === 200) {
    const d2 = JSON.parse(r3.body);
    console.log('Total:', d2.total, 'Count:', d2.data?.length);
  }
})();
