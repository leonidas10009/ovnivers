const cheerio = require('cheerio');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function fetchText(url, referer = '') {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Referer': referer || new URL(url).origin + '/', 'Accept': '*/*' },
      signal: ctrl.signal
    });
    clearTimeout(t);
    return res.ok ? await res.text() : null;
  } catch(e) { return null; }
}

async function fetchJSON(url, referer = '') {
  const text = await fetchText(url, referer);
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

(async () => {
  console.log('=== Providers que funcionan (devuelven JSON con streams) ===\n');

  // Test 2embed.skin API (JSON, no CloudFlare)
  const skin = await fetchJSON('https://www.2embed.skin/api/movie/550.json', 'https://www.2embed.skin/');
  console.log('2embed.skin API:', skin ? JSON.stringify(skin).substring(0, 300) : 'NULL');

  // Test 2embed.skin for TV
  const skinTV = await fetchJSON('https://www.2embed.skin/api/tv/1399.json?season=1&episode=1', 'https://www.2embed.skin/');
  console.log('2embed.skin TV:', skinTV ? JSON.stringify(skinTV).substring(0, 300) : 'NULL');

  // Try extracting 2embed embed page for video URLs
  console.log('\n=== Extrayendo video URL de 2embed embed ===');
  const embed = await fetchText('https://www.2embed.cc/embed/550', 'https://www.2embed.cc/');
  if (embed) {
    const $ = cheerio.load(embed);
    // Find iframe src
    const iframes = [];
    $('iframe').each((i, el) => { const s = $(el).attr('src'); if (s) iframes.push(s); });
    console.log('iframes:', iframes);

    // Find video src
    const videos = [];
    $('video source, video').each((i, el) => { const s = $(el).attr('src'); if (s) videos.push(s); });
    console.log('video sources:', videos);

    // Find script data
    const scripts = [];
    $('script').each((i, el) => {
      const text = $(el).html() || '';
      if (text.includes('m3u8') || text.includes('player') || text.includes('source')) {
        scripts.push(text.substring(0, 200));
      }
    });
    console.log('relevant scripts:', scripts.length);
    scripts.slice(0, 3).forEach(s => console.log('  ', s));

    // Extract all URLs
    const urls = [...new Set((embed.match(/https?:\/\/[^\s"'<>]+/g) || []))];
    const mediaUrls = urls.filter(u => /\.(mp4|m3u8|mkv|webm|ts)($|\?)/.test(u));
    const cdnUrls = urls.filter(u => u.includes('cdn') || u.includes('stream') || u.includes('video') || u.includes('play'));
    console.log('media URLs:', mediaUrls.slice(0, 5));
    console.log('CDN/stream URLs:', cdnUrls.slice(0, 10));
  }

  // Test TMBDb for getting content details
  console.log('\n=== TMDb movie 550 ===');
  const tmdb = await fetchJSON('https://api.themoviedb.org/3/movie/550?api_key=d80ba92bc7cefe3359668d30d06f3305');
  console.log('title:', tmdb?.title, '| imdb:', tmdb?.imdb_id);

  console.log('\n=== DONE ===');
})();
