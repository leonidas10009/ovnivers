/** 
 * Deep probe of fastream.to embed pages to understand their structure
 * Run: node tests/test_deep_fastream.js
 */
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function probe(url, referer) {
  console.log(`\n=== Probing: ${url}`);
  
  // 1. First request - get the page
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Referer': referer || url, 'Accept': 'text/html,*/*' },
    redirect: 'manual'
  });
  console.log(`Status: ${res.status}, Redirected: ${res.redirected}`);
  
  const html = await res.text();
  console.log(`HTML size: ${(html.length/1024).toFixed(1)}KB`);
  console.log(`Content-Type: ${res.headers.get('content-type')}`);
  
  // Check for key patterns
  console.log(`\nPattern checks:`);
  console.log(`  iframe: ${html.includes('<iframe')}`);
  console.log(`  video: ${html.includes('<video')}`);
  console.log(`  .m3u8: ${/\.m3u8/i.test(html)}`);
  console.log(`  .mp4:  ${/\.mp4/i.test(html)}`);
  console.log(`  eval:  ${html.includes('eval(')}`);
  console.log(`  fetch: ${html.includes('fetch(')}`);
  console.log(`  XMLHttpRequest: ${/XMLHttpRequest|\.ajax/i.test(html)}`);
  console.log(`  atob:  ${html.includes('atob(')}`);
  
  // Extract all script sources
  const scriptSrc = html.match(/<script[^>]*src=["']([^"']+)["']/g) || [];
  console.log(`\nScripts (${scriptSrc.length}):`);
  for (const s of scriptSrc.slice(0, 5)) console.log(`  ${s.substring(0, 120)}`);
  
  // Extract all iframes
  const iframes = html.match(/<iframe[^>]*>/gi) || [];
  console.log(`\nIframes (${iframes.length}):`);
  for (const f of iframes.slice(0, 3)) console.log(`  ${f.substring(0, 200)}`);

  // Extract all links with href
  const links = html.match(/<a[^>]+href=["']([^"']+)["']/gi) || [];
  console.log(`\nLinks with href (${links.length}):`);
  for (const l of links.slice(0, 3)) console.log(`  ${l.substring(0, 200)}`);

  // Look for JS object assignments with URLs
  const jsUrls = html.match(/["'](?:file|src|url|link|video)["']\s*[:=]\s*["']([^"']+)["']/gi) || [];
  console.log(`\nJS URL assignments (${jsUrls.length}):`);
  for (const j of jsUrls.slice(0, 5)) console.log(`  ${j.substring(0, 150)}`);

  // Check cookies set by the page
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) console.log(`\nSet-Cookie: ${setCookie.substring(0, 200)}`);

  // Try fetching with the cookies
  if (setCookie) {
    console.log(`\n--- Retrying with cookies ---`);
    const res2 = await fetch(url, {
      headers: { 'User-Agent': UA, 'Cookie': setCookie.split(';')[0], 'Referer': referer || url },
      redirect: 'manual'
    });
    const html2 = await res2.text();
    console.log(`Retry HTML: ${(html2.length/1024).toFixed(1)}KB`);
    console.log(`  .m3u8: ${/\.m3u8/i.test(html2)}`);
    console.log(`  .mp4:  ${/\.mp4/i.test(html2)}`);
    console.log(`  iframe: ${html2.includes('<iframe')}`);
    if (/\.m3u8|\.mp4/i.test(html2)) {
      const m3u8 = html2.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
      const mp4 = html2.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
      if (m3u8) console.log(`  🎯 m3u8 found: ${m3u8[0].substring(0, 150)}`);
      if (mp4) console.log(`  🎯 mp4 found: ${mp4[0].substring(0, 150)}`);
    }
  }
}

(async () => {
  console.log('FASTREAM.TO DEEP PROBE\n');
  
  // Test with a known fastream embed
  await probe(
    'https://fastream.to/embed-573nwplkvd5y.html',
    'https://www3.homecine.to/el-club-de-la-lucha'
  );

  // Also probe YouTube embed
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('YOUTUBE EMBED PROBE\n');
  await probe(
    'https://www.youtube.com/embed/GfgKZ8VLS_A',
    'https://www.cinelibreonline.com/'
  );

  // Probe serieskao internal player
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('SERIESKAO PLAYER PROBE\n');
  await probe(
    'https://serieskao.top/vidurl/tt39403976-1x07/',
    'https://serieskao.top/anime/needy-girl-overdose-LOlUAM/temporada/1/capitulo/7'
  );
})();
