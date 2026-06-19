const cheerio = require('cheerio');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

(async () => {
  // 1. Check AnimeAV1 episode page
  const res = await fetch('https://animeav1.com/media/tensei-shitara-slime-datta-ken-4th-season/11', {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(15000)
  });
  const html = await res.text();
  console.log('Episode status:', res.status, 'size:', (html.length/1024).toFixed(1) + 'KB');
  
  const $ = cheerio.load(html);
  
  // Find all server buttons and their data
  console.log('\n=== Server buttons ===');
  $('button.btn').each((i, el) => {
    const text = $(el).text().trim();
    const cls = $(el).attr('class') || '';
    const onClick = $(el).attr('@click') || $(el).attr('onclick') || $(el).attr('x-on:click') || $(el).attr('data-url') || '';
    console.log('  [' + i + '] ' + text + ' | class: ' + cls + ' | action: ' + onClick?.substring(0, 80));
  });
  
  // Find sections
  console.log('\n=== Language sections ===');
  $('.ic-sub, .ic-dub, .ic-lat, [class*=lang]').each((i, el) => {
    const text = $(el).text().trim();
    const cls = $(el).attr('class') || '';
    console.log('  ' + cls + ': ' + text);
  });
  
  // Find script data
  console.log('\n=== Script data ===');
  $('script').each((i, el) => {
    const c = $(el).html() || '';
    if (c.includes('server') && c.includes('video') || c.includes('url') && c.includes('episode')) {
      console.log('Script #' + i + ': ' + c.substring(0, 800));
    }
    if (c.includes('window.__') || c.includes('alpine') || c.includes('x-data')) {
      console.log('Data script #' + i + ': ' + c.substring(0, 500));
    }
  });
  
  // Find any JSON data
  const jsonMatch = html.match(/(?:window\.__INITIAL_STATE__|window\.__DATA__|data-server|servers)\s*[:=]\s*(\[[\s\S]*?\]|\{[\s\S]*?\})/g);
  if (jsonMatch) {
    console.log('\n=== JSON data found ===');
    for (const m of jsonMatch) console.log(m.substring(0, 800));
  }
  
  // Check for XHR/fetch API calls in the page
  console.log('\n=== API endpoints ===');
  const apiMatches = html.match(/['"]([^'"]*\/(?:api|ajax|data|stream|video|media|episode)[^'"]*)['"]/gi) || [];
  for (const m of [...new Set(apiMatches)].slice(0, 10)) {
    console.log('  ' + m.replace(/['"]/g, ''));
  }
})();
