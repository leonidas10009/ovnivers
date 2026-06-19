// Local embed resolver test with Puppeteer - thorough analysis
// Usage: node tests/resolve-all-local.js
const puppeteer = require('puppeteer');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const SERVERS = [
  { url: 'https://sfastwish.com/e/0ky0tsum7i06', label: 'Streamwish' },
  { url: 'https://mixdrop.top/e/1n9rzzl9aj0rvx', label: 'Mixdrop' },
  { url: 'https://streamtape.com/e/WPdPzm104wFpDr/', label: 'Streamtape' },
  { url: 'https://voe.sx/e/2q1h5ufnacb3', label: 'VOE' },
  { url: 'https://bysekoze.com/e/vb9x1bm0teag/', label: 'Filemoon' },
  { url: 'https://dsvplay.com/e/fa48borpa4k4', label: 'Doodstream' },
  { url: 'https://www.mp4upload.com/embed-hgu1jteh77lv.html', label: 'Mp4upload' },
];

function decodePacker(code) {
  // Dean Edwards packer: eval(function(p,a,c,k,e,d){...}(...))
  const m = code.match(/(?:eval|return)\s*\(\s*function\s*\(\s*p\s*,\s*a\s*,\s*c\s*,\s*k\s*,\s*e\s*,\s*d\s*\)/);
  if (!m) return null;
  // Try to find the arguments list
  const argsMatch = code.match(/}\s*\(\s*'([^']*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([^']*)'/);
  if (!argsMatch) return null;
  return { hasPacker: true, size: code.length };
}

async function findVideo(page, label) {
  const strategies = [];

  // Strategy 1: Check video element
  try {
    const src = await page.evaluate(() => {
      const v = document.querySelector('video');
      if (v && v.src && !v.src.startsWith('blob:')) return v.src;
      const sources = document.querySelectorAll('source[src]');
      for (const s of sources) {
        const src = s.getAttribute('src');
        if (src && !src.startsWith('blob:')) return src;
      }
      return null;
    });
    if (src) { strategies.push({ method: 'video-tag', url: src }); return strategies; }
  } catch {}

  // Strategy 2: Check for JWPlayer setup
  try {
    const jwSetup = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      for (const s of scripts) {
        const c = s.textContent || '';
        const fileMatch = c.match(/file\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/);
        if (fileMatch) return fileMatch[1];
        const srcMatch = c.match(/src\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/);
        if (srcMatch) return srcMatch[1];
      }
      return null;
    });
    if (jwSetup) { strategies.push({ method: 'jwplayer-setup', url: jwSetup }); return strategies; }
  } catch {}

  // Strategy 3: Check for unpacked eval
  try {
    const evalUrls = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script');
      for (const s of scripts) {
        const c = s.textContent || '';
        // Look for m3u8/mp4 after the page has fully loaded (JS unpacked)
        const m = c.match(/["'](https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)["']/);
        if (m) return m[1];
      }
      return null;
    });
    if (evalUrls) { strategies.push({ method: 'eval-script', url: evalUrls }); return strategies; }
  } catch {}

  // Strategy 4: Check all script content for any video URL
  try {
    const allScripts = await page.evaluate(() => {
      const urls = [];
      document.querySelectorAll('script').forEach(s => {
        const c = s.textContent || '';
        const matches = c.match(/https?:\/\/[^\s"']+\.(m3u8|mp4)[^\s"']*/g);
        if (matches) urls.push(...matches);
      });
      return [...new Set(urls)];
    });
    if (allScripts.length) { strategies.push({ method: 'script-content', urls: allScripts }); return strategies; }
  } catch {}

  // Strategy 5: Check iframes
  try {
    const iframeVideo = await page.evaluate(() => {
      const iframes = document.querySelectorAll('iframe');
      for (const iframe of iframes) {
        const src = iframe.src;
        if (src && (src.includes('.m3u8') || src.includes('.mp4'))) return src;
      }
      return null;
    });
    if (iframeVideo) { strategies.push({ method: 'iframe', url: iframeVideo }); return strategies; }
  } catch {}

  return strategies;
}

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 },
  });

  const results = [];

  for (const { url, label } of SERVERS) {
    console.log(`\n=== ${label} ===`);
    console.log('Loading:', url);
    const page = await browser.newPage();
    await page.setUserAgent(UA);

    let videoUrl = null;
    const networkUrls = [];

    // Intercept network requests
    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      const isVideo = /\.(m3u8|mp4|mkv|ts|webm)(\?|$)/i.test(u) && !u.includes('.css') && !u.includes('.js') && !u.includes('videojs') && !u.includes('google') && !u.includes('analytics') && !u.includes('cdn.jkdesa');
      if (isVideo) {
        networkUrls.push({ type: 'request', url: u });
        if (!videoUrl) videoUrl = u;
      }
      req.continue();
    });

    page.on('response', resp => {
      const ct = resp.headers()['content-type'] || '';
      if (ct.includes('mpegurl') || ct.includes('video/mp4') || ct.includes('video/webm')) {
        networkUrls.push({ type: 'response', url: resp.url(), contentType: ct });
        if (!videoUrl) videoUrl = resp.url();
      }
    });

    // Load the page
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch(e) {
      console.log('  Page load:', e.message);
    }

    // Wait for JS to execute
    console.log('  Waiting 8s for JS...');
    await new Promise(r => setTimeout(r, 8000));

    // Try DOM-based detection
    const domResults = await findVideo(page, label);

    // Analyze page for packer
    let hasPacker = false;
    try {
      hasPacker = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script');
        for (const s of scripts) {
          const c = s.textContent || '';
          if (c.includes("eval(function(p,a,c,k,e,d)")) return true;
          if (c.includes("var _0x") && c.length > 500) return true;
        }
        return false;
      });
    } catch {}

    // Check if blocked
    let isBlocked = false;
    try {
      isBlocked = await page.evaluate(() => {
        const t = document.title || '';
        const b = document.body?.textContent || '';
        return t.includes('Just a moment') || t.includes('Attention Required') || b.includes('Cloudflare') || b.includes('DDOS');
      });
    } catch {}

    const found = videoUrl || domResults.length > 0 || networkUrls.length > 0;

    if (videoUrl) {
      console.log('  OK - Network capture:', videoUrl.substring(0, 100));
    }
    if (domResults.length > 0) {
      for (const r of domResults) {
        console.log('  OK - DOM:', r.method, r.url?.substring(0, 100) || (r.urls?.length + ' urls'));
      }
    }
    if (networkUrls.length > 0 && !videoUrl) {
      console.log('  Network URLs found:', networkUrls.length);
      for (const n of networkUrls.slice(0, 3)) {
        console.log('    ', n.type, n.contentType || '', n.url.substring(0, 80));
      }
    }
    console.log('  Packer JS:', hasPacker);
    console.log('  Blocked:', isBlocked);

    results.push({
      label,
      resolved: !!videoUrl,
      networkUrls: networkUrls.length,
      domResults: domResults.length,
      hasPacker,
      isBlocked,
      videoUrl: videoUrl?.substring(0, 100) || null,
    });

    await page.close();
    // Small delay between tests
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log('\n\n=== SUMMARY ===');
  for (const r of results) {
    const icon = r.resolved ? 'OK' : (r.isBlocked ? 'BLOCKED' : (r.hasPacker ? 'PACKER' : 'FAIL'));
    console.log(`${icon.padEnd(8)} ${r.label.padEnd(15)} | video:${r.resolved} | net:${r.networkUrls} | dom:${r.domResults} | packer:${r.hasPacker} | blocked:${r.isBlocked}`);
    if (r.videoUrl) console.log(`         -> ${r.videoUrl}`);
  }

  await browser.close();
  console.log('\nDone.');
})();
