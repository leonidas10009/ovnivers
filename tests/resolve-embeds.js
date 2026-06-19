/**
 * Local embed-to-direct resolver using Puppeteer (headless Chrome).
 * 
 * Usage:
 *   1. npm install puppeteer
 *   2. node tests/resolve-embeds.js
 *
 * This script takes embed URLs (Mega, Streamwish, VOE, etc.) and extracts
 * direct m3u8/mp4 URLs by rendering the page JavaScript in a real browser.
 * 
 * Why local-only: Puppeteer needs ~200MB RAM, Render free tier has 512MB total.
 * Use this for testing before integrating scrapers that need JS rendering.
 */

const { resolveEmbed } = require('../src/alfa-providers/embed-resolver');

const TEST_CASES = [
  // JKAnime servers
  { url: 'https://sfastwish.com/e/0ky0tsum7i06', label: 'Streamwish' },
  { url: 'https://voe.sx/e/2q1h5ufnacb3', label: 'VOE' },
  { url: 'https://mixdrop.top/e/1n9rzzl9aj0rvx', label: 'Mixdrop' },
  { url: 'https://bysekoze.com/e/vb9x1bm0teag/', label: 'Filemoon' },
  { url: 'https://dsvplay.com/e/fa48borpa4k4', label: 'Doodstream' },
  { url: 'https://streamtape.com/e/WPdPzm104wFpDr/teeennseiishitaraaslimedattaak', label: 'Streamtape' },
  { url: 'https://vidhidevip.com/embed/', label: 'Vidhide' },
];

(async () => {
  console.log('=== Server-side embed resolver (no JS) ===');
  for (const { url, label } of TEST_CASES) {
    const result = await resolveEmbed(url);
    const ok = result ? 'RESOLVED: ' + result.substring(0, 70) : 'FAILED';
    console.log(`  ${label.padEnd(15)} → ${ok}`);
  }

  // Try Puppeteer if installed
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch { console.log('\nPuppeteer not installed. Run: npm install puppeteer'); return; }

  console.log('\n=== Puppeteer resolver (with JS execution) ===');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  for (const { url, label } of TEST_CASES) {
    try {
      const page = await browser.newPage();
      await page.setRequestInterception(true);

      let videoUrl = null;
      page.on('request', req => {
        const u = req.url();
        if (/\.(m3u8|mp4|mkv|ts)(\?|$)/i.test(u) && !u.includes('analytics') && !u.includes('google')) {
          videoUrl = u;
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      await page.waitForTimeout(3000);

      if (videoUrl) {
        console.log(`  ${label.padEnd(15)} → RESOLVED: ${videoUrl.substring(0, 70)}`);
      } else {
        // Check page content for video sources
        const sources = await page.evaluate(() => {
          const srcs = [];
          document.querySelectorAll('video source, video[src]').forEach(el => {
            const s = el.getAttribute('src') || el.src;
            if (s) srcs.push(s);
          });
          return srcs;
        });
        console.log(`  ${label.padEnd(15)} → ${sources.length ? sources[0].substring(0, 70) : 'NOT FOUND'}`);
      }
      await page.close();
    } catch (e) {
      console.log(`  ${label.padEnd(15)} → ERROR: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\nDone. Install puppeteer for local testing before deploying.');
})();
