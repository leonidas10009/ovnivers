// Scrapeless Universal Scraping API proxy
// Bypasses Cloudflare Turnstile, JS rendering, and IP blocks
// Docs: https://docs.scrapeless.com/en/universal-scraping-api/quickstart/getting-started/
// API: POST https://api.scrapeless.com/api/v2/unlocker/request
// Pricing: per successful request, free trial available

const API_BASE = 'https://api.scrapeless.com/api/v2/unlocker/request';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let apiKey = process.env.SCRAPELESS_API_KEY || '';
let enabled = !!apiKey;

function configure(key) {
  if (key) {
    apiKey = key;
    enabled = true;
  }
}

function isEnabled() {
  return enabled;
}

async function scrape(url, options = {}) {
  if (!enabled) return null;

  const input = {
    url,
    method: options.method || 'GET',
    redirect: options.redirect !== false,
    headers: options.headers || {},
  };

  // Ensure browser-like headers
  if (!input.headers['User-Agent']) input.headers['User-Agent'] = UA;
  if (!input.headers['Accept']) input.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
  if (!input.headers['Accept-Language']) input.headers['Accept-Language'] = 'es-ES,es;q=0.9,en;q=0.8';

  const body = JSON.stringify({
    actor: 'unlocker.webunlocker',
    input,
    proxy: {
      country: options.proxyCountry || 'ANY',
    },
  });

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), options.timeout || 30000);

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': apiKey,
      },
      body,
      signal: ctrl.signal,
    });

    clearTimeout(t);

    if (!res.ok) {
      console.warn(`[scrapeless] HTTP ${res.status} for ${url}`);
      return null;
    }

    const data = await res.json();

    // Scrapeless returns the page content in various formats
    if (data.body) return data.body;
    if (data.content) return data.content;
    if (data.html) return data.html;
    if (data.text) return data.text;
    if (typeof data === 'string') return data;

    // If the response has a statusCode and body
    if (data.statusCode && data.body) return data.body;

    console.warn(`[scrapeless] unexpected response format for ${url}`);
    return null;
  } catch (e) {
    console.warn(`[scrapeless] error for ${url}: ${e.message}`);
    return null;
  }
}

module.exports = { scrape, configure, isEnabled };
