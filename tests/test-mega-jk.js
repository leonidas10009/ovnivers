const puppeteer = require('puppeteer');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  // Test 1: Mega embed page
  console.log('=== MEGA ===');
  const mpage = await browser.newPage();
  await mpage.setUserAgent(UA);

  const megaUrls = [];
  await mpage.setRequestInterception(true);
  mpage.on('request', req => {
    const u = req.url();
    if (/\.(mp4|mkv|m3u8)(\?|$)/i.test(u)) megaUrls.push(u);
    req.continue();
  });

  await mpage.goto('https://mega.nz/embed/yxwxgIYb%235P12P6JefrE0l89JqmSyOavGB6EV4Z2sJUHWXTyovOg', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 10000));

  // Check for download button or stream URL
  const megaInfo = await mpage.evaluate(() => {
    const result = {};
    // Check for any download links
    const links = document.querySelectorAll('a[href]');
    const downloads = [];
    links.forEach(l => {
      const h = l.href;
      if (h && (h.includes('download') || h.includes('.mp4') || h.includes('.mkv'))) downloads.push(h);
    });
    result.downloadLinks = downloads;

    // Check for any buttons
    const buttons = document.querySelectorAll('button');
    const buttonTexts = [];
    buttons.forEach(b => {
      const t = b.textContent?.trim();
      if (t && t.length < 50) buttonTexts.push(t);
    });
    result.buttons = [...new Set(buttonTexts)].slice(0, 10);

    // Check for blob URLs (Mega's decrypted stream)
    const videos = document.querySelectorAll('video');
    result.videoCount = videos.length;
    result.videoSrc = videos.length > 0 ? (videos[0].src || 'no src') : 'no video';

    return result;
  });

  console.log('Download links:', megaInfo.downloadLinks);
  console.log('Buttons:', megaInfo.buttons);
  console.log('Video:', megaInfo.videoSrc);
  console.log('Network mp4/m3u8:', megaUrls);
  await mpage.close();

  // Test 2: Load JKAnime page directly with Puppeteer
  console.log('\n=== JKANIME PAGE (Puppeteer) ===');
  const jpage = await browser.newPage();
  await jpage.setUserAgent(UA);

  let jkHtml = '';
  jpage.on('response', async resp => {
    if (resp.url().includes('jkanime.net/tensei-shitara') && resp.url().endsWith('/11/')) {
      jkHtml = await resp.text();
    }
  });

  await jpage.goto('https://jkanime.net/tensei-shitara-slime-datta-ken-4th-season/11/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 8000));

  // Try to extract var servers after JS execution
  const jkServers = await jpage.evaluate(() => {
    // Check if global 'servers' variable exists
    if (typeof servers !== 'undefined') return JSON.stringify(servers);
    // Check scripts for var servers
    const scripts = document.querySelectorAll('script');
    for (const s of scripts) {
      const c = s.textContent || '';
      const m = c.match(/var servers\s*=\s*(\[[\s\S]*?\]);/);
      if (m) return m[1];
    }
    return 'NOT FOUND';
  });
  console.log('servers data:', jkServers.substring(0, 500));

  // Extract iframes
  const iframes = await jpage.evaluate(() => {
    const ifs = document.querySelectorAll('iframe');
    return Array.from(ifs).map(f => f.src);
  });
  console.log('Iframes:', iframes);

  // Extract download table
  const dlTable = await jpage.evaluate(() => {
    const rows = document.querySelectorAll('table tbody tr');
    return Array.from(rows).map(r => {
      const tds = r.querySelectorAll('td');
      if (tds.length < 4) return null;
      const server = tds[0]?.textContent?.trim();
      const size = tds[1]?.textContent?.trim();
      const link = tds[3]?.querySelector('a')?.href;
      return server ? { server, size, link } : null;
    }).filter(Boolean);
  });
  console.log('Download table:', dlTable.length, 'entries');
  for (const d of dlTable.slice(0, 5)) console.log('  ', d.server, d.link);

  await jpage.close();
  await browser.close();
  console.log('\nDone');
})();
