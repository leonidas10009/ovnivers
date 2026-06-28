// puppeteer-fallback.js — Cloudflare Turnstile / JS-rendering bypass via Puppeteer
// When cheerio fetch fails due to Cloudflare, launch headless Chrome to get the real HTML
// Uses existing puppeteer-core + @sparticuz/chromium (already in package.json)
// ~200MB RAM usage, only triggered as last resort

const { createBrowser, createPage, setupResourceBlocking } = require('./intelligent');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

let browserInstance = null;
let browserLastUsed = 0;
const BROWSER_IDLE_TIMEOUT = 5 * 60 * 1000; // 5 min idle → close
let pageCount = 0;
const MAX_PAGES_BEFORE_RESTART = 20;

async function getBrowser() {
  const now = Date.now();
  if (browserInstance) {
    // Check if browser is still alive
    try {
      await browserInstance.version();
      browserLastUsed = now;
      return browserInstance;
    } catch {
      // Browser crashed, will recreate
      try { await browserInstance.close(); } catch {}
      browserInstance = null;
    }
  }

  console.log('[puppeteer-fallback] Launching headless Chrome...');
  browserInstance = await createBrowser({
    headless: true,
    stealth: true,
    timeout: 30000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1366,768',
    ],
  });
  browserLastUsed = now;
  pageCount = 0;
  console.log('[puppeteer-fallback] Browser ready');
  return browserInstance;
}

// Periodic cleanup
setInterval(async () => {
  if (browserInstance && Date.now() - browserLastUsed > BROWSER_IDLE_TIMEOUT) {
    console.log('[puppeteer-fallback] Closing idle browser');
    try { await browserInstance.close(); } catch {}
    browserInstance = null;
  }
}, 60000).unref();

/**
 * Fetch a page via Puppeteer — bypasses Cloudflare Turnstile, renders JS
 * @param {string} url - Target URL
 * @param {object} options
 * @param {number} options.waitMs - Wait time after page load for JS to render (default 3000)
 * @param {number} options.timeout - Navigation timeout (default 20000)
 * @returns {Promise<string|null>} HTML content or null on failure
 */
async function fetchWithPuppeteer(url, options = {}) {
  const waitMs = options.waitMs || 3000;
  const timeout = options.timeout || 20000;

  try {
    const browser = await getBrowser();
    pageCount++;

    // Restart browser periodically to avoid memory leaks
    if (pageCount > MAX_PAGES_BEFORE_RESTART) {
      console.log('[puppeteer-fallback] Restarting browser (page limit)');
      try { await browser.close(); } catch {}
      browserInstance = null;
      return fetchWithPuppeteer(url, options);
    }

    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({ width: 1366, height: 768 });

    // Block unnecessary resources for speed
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (['image', 'media', 'font', 'stylesheet'].includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate and wait for network to settle
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout,
    });

    // Extra wait for Cloudflare Turnstile / JS rendering
    // Turnstile typically resolves in 1-3 seconds in a real browser
    await new Promise(r => setTimeout(r, waitMs));

    // Check if page is still blocked (unlikely with real browser)
    const html = await page.content();
    const bodyText = await page.evaluate(() => document.body?.innerText || '');

    // Save any cookies set during this session
    // (Not persisting across browser restarts, but helps within same session)

    await page.close().catch(() => {});
    browserLastUsed = Date.now();

    // Check if we got real content
    if (html.length < 500 || bodyText.length < 50) {
      console.warn(`[puppeteer-fallback] Got short response (${html.length}B) for ${url}`);
      // Still return it — might be enough for cheerio
    }

    console.log(`[puppeteer-fallback] ✓ ${url} (${(html.length/1024).toFixed(0)}KB, ${bodyText.length} chars)`);
    return html;
  } catch (e) {
    console.warn(`[puppeteer-fallback] Failed for ${url}: ${e.message}`);
    // If browser crashed, reset
    if (e.message?.includes('Target closed') || e.message?.includes('Session closed')) {
      browserInstance = null;
    }
    return null;
  }
}

/**
 * Check if HTML looks like a Cloudflare/Turnstile block page
 */
function isCloudflareBlock(html) {
  if (!html) return false;
  if (html.length < 1000) return true; // Very short response = likely block
  const markers = [
    'challenge-platform',
    'turnstile',
    'cf-browser-verify',
    'cf-challenge',
    'cf_captcha',
    'Just a moment',
    'Checking your browser',
    'Verifying you are human',
    'Please enable JavaScript',
    'attention required',
    'cloudflare',
  ];
  const lower = html.substring(0, 2000).toLowerCase();
  return markers.some(m => lower.includes(m.toLowerCase()));
}

module.exports = { fetchWithPuppeteer, isCloudflareBlock, getBrowser };
