// puppeteer-fallback.js — Cloudflare Turnstile / JS-rendering bypass via Puppeteer
// Uses the SHARED BrowserPool — coordinates with all other browser users
// ~200MB RAM when active, released back to pool when idle

const { getSharedPool } = require('./intelligent/browser-pool-singleton');
const { createPage, setupResourceBlocking } = require('./intelligent');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

/**
 * Fetch a page via Puppeteer — bypasses Cloudflare Turnstile, renders JS
 * Uses the shared browser pool to avoid resource storms
 */
async function fetchWithPuppeteer(url, options = {}) {
  const waitMs = options.waitMs || 4000;
  const timeout = options.timeout || 20000;
  const pool = getSharedPool();
  let instance;

  try {
    instance = await pool.acquire();
    const page = await createPage(instance.browser, { stealth: true });
    await setupResourceBlocking(page);

    await page.goto(url, { waitUntil: 'networkidle2', timeout });
    await new Promise(r => setTimeout(r, waitMs));

    const html = await page.content();
    await page.close().catch(() => {});

    console.log(`[puppeteer-fallback] ✓ ${url} (${(html.length/1024).toFixed(0)}KB)`);
    return html;
  } catch (e) {
    console.warn(`[puppeteer-fallback] Failed for ${url}: ${e.message}`);
    return null;
  } finally {
    if (instance) await pool.release(instance).catch(() => {});
  }
}

function isCloudflareBlock(html) {
  if (!html) return false;
  if (html.length < 1000) return true;
  const markers = ['challenge-platform', 'turnstile', 'cf-browser-verify', 'cf-challenge', 'Just a moment', 'Checking your browser'];
  const lower = html.substring(0, 2000).toLowerCase();
  return markers.some(m => lower.includes(m.toLowerCase()));
}

module.exports = { fetchWithPuppeteer, isCloudflareBlock };

