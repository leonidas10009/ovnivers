const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
let puppeteer = null;
let chromiumCache = null;

async function getPuppeteer() {
  if (puppeteer) return puppeteer;
  try { puppeteer = (await import('puppeteer-core')).default; return puppeteer; }
  catch { return null; }
}

async function getChromium() {
  if (chromiumCache) return chromiumCache;
  try {
    const mod = await import('@sparticuz/chromium');
    const Cr = mod.default;
    const exePath = await Cr.executablePath();
    chromiumCache = { executablePath: exePath, args: Cr.args || [] };
    return chromiumCache;
  } catch { return null; }
}

async function resolveJKAnime(slug, episode) {
  const pptr = await getPuppeteer();
  if (!pptr) return [];
  const chromium = await getChromium();
  if (!chromium) return [];

  const jkUrl = `https://jkanime.net/${slug}/${episode}/`;
  let browser = null;
  const streams = [];

  try {
    browser = await pptr.launch({
      args: chromium.args,
      executablePath: chromium.executablePath,
      headless: true,
      defaultViewport: { width: 1280, height: 720 },
    });

    const page = await browser.newPage();
    await page.setUserAgent(UA);

    // Collect all m3u8/mp4 URLs from network
    const videoUrls = [];
    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      const isVideo = /\.(m3u8|mp4|mkv|ts|webm)(\?|$)/i.test(u)
        && !u.includes('.css') && !u.includes('.js') && !u.includes('videojs')
        && !u.includes('google') && !u.includes('analytics') && !u.includes('cdn.jkdesa')
        && !u.includes('test-videos');
      if (isVideo) {
        videoUrls.push(u);
        req.abort();
      } else {
        req.continue();
      }
    });

    page.on('response', resp => {
      const ct = resp.headers()['content-type'] || '';
      if (ct.includes('mpegurl') || ct.includes('video/mp4')) {
        videoUrls.push(resp.url());
      }
    });

    await page.goto(jkUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 8000));

    // 1. Extract m3u8 from iframes (Desu + Magi)
    const iframes = await page.evaluate(() => {
      const ifs = document.querySelectorAll('iframe');
      return Array.from(ifs).map(f => f.src).filter(s => s && s.startsWith('http'));
    });

    // Load each iframe to get m3u8
    for (const frameUrl of iframes) {
      const serverName = frameUrl.includes('/um?') ? 'Desu' : frameUrl.includes('/umv?') ? 'Magi' : 'JKPlayer';
      try {
        const framePage = await browser.newPage();
        await framePage.setUserAgent(UA);
        let frameVideo = null;

        framePage.on('response', resp => {
          if (frameVideo) return;
          const ct = resp.headers()['content-type'] || '';
          if (ct.includes('mpegurl')) frameVideo = resp.url();
        });

        await framePage.goto(frameUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await new Promise(r => setTimeout(r, 5000));

        if (!frameVideo) {
          try {
            frameVideo = await framePage.evaluate(() => {
              const s = document.querySelector('video source, source[src]');
              if (s) return s.getAttribute('src') || s.src;
              return null;
            });
          } catch {}
        }

        if (frameVideo && frameVideo.startsWith('http')) {
          streams.push({
            url: frameVideo,
            server: serverName,
            name: `JKAnime\n${serverName}`,
            title: `${slug} Ep. ${episode}\n⚙️ ${serverName} (m3u8)`,
            behaviorHints: { notWebReady: false, bingeGroup: `jkanime|${serverName.toLowerCase()}` },
          });
        }
        await framePage.close();
      } catch {}
    }

    // 2. Extract servers from var servers (JS-rendered)
    try {
      const serverData = await page.evaluate(() => {
        if (typeof servers !== 'undefined' && Array.isArray(servers)) return JSON.stringify(servers);
        return null;
      });

      if (serverData) {
        const servers = JSON.parse(serverData);
        for (const s of servers) {
          try {
            const embedUrl = Buffer.from(s.remote, 'base64').toString('utf-8').trim();
            if (!embedUrl || !embedUrl.startsWith('http')) continue;

            // Only try to resolve Streamwish and Mp4upload (proven working)
            const host = new URL(embedUrl).hostname;
            const shouldResolve = host.includes('streamwish') || host.includes('sfastwish')
              || host.includes('mp4upload') || host.includes('flaswish');

            if (shouldResolve) {
              const serverPage = await browser.newPage();
              await serverPage.setUserAgent(UA);
              let serverVideo = null;

              serverPage.on('request', req => {
                const u = req.url();
                if (serverVideo) { req.abort(); return; }
                if (/\.(m3u8|mp4|mkv|ts)(\?|$)/i.test(u) && !u.includes('.css') && !u.includes('.js') && !u.includes('videojs')) {
                  serverVideo = u;
                  req.abort();
                } else { req.continue(); }
              });

              try { await serverPage.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 20000 }); } catch {}
              await new Promise(r => setTimeout(r, 8000));

              if (!serverVideo) {
                try {
                  serverVideo = await serverPage.evaluate(() => {
                    const v = document.querySelector('video');
                    if (v && v.src && !v.src.startsWith('blob:')) return v.src;
                    const src = document.querySelector('source[src]');
                    if (src) return src.getAttribute('src');
                    return null;
                  });
                } catch {}
              }

              await serverPage.close();

              if (serverVideo && serverVideo.startsWith('http')) {
                streams.push({
                  url: serverVideo,
                  server: s.server,
                  name: `JKAnime\n${s.server}`,
                  title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (directo)`,
                  behaviorHints: { notWebReady: false, bingeGroup: `jkanime|${s.server.toLowerCase()}` },
                });
              } else {
                streams.push({
                  url: embedUrl,
                  server: s.server,
                  name: `JKAnime\n${s.server}`,
                  title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (${s.size || ''})`,
                  behaviorHints: { notWebReady: true, bingeGroup: `jkanime|${s.server.toLowerCase()}` },
                });
              }
            } else {
              // Don't resolve, just return embed URL
              streams.push({
                url: embedUrl,
                server: s.server,
                name: `JKAnime\n${s.server}`,
                title: `${slug} Ep. ${episode}\n⚙️ ${s.server} (${s.size || ''})`,
                behaviorHints: { notWebReady: true, bingeGroup: `jkanime|${s.server.toLowerCase()}` },
              });
            }
          } catch {}
        }
      }
    } catch {}

    // Filter duplicates by URL
    const seen = new Set();
    return streams.filter(s => {
      const k = (s.url || '') + s.server;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

  } catch (e) {
    console.error('[jk-pptr] error:', e.message);
    return [];
  } finally {
    if (browser) { try { await browser.close(); } catch {} }
  }
}

module.exports = { resolveJKAnime };
