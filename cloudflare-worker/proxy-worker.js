// Cloudflare Worker — Smart Proxy for Ovnivers v2
// Features: header forwarding, per-domain cookie jar, retry with backoff
// Deploy: npx wrangler deploy cloudflare-worker/proxy-worker.js
// Then set PROXY_URL=https://<your-worker>.<subdomain>.workers.dev in Coolify env vars

const MAX_RETRIES = 2;
const RETRY_BACKOFF_MS = [1000, 3000];
const COOKIE_TTL = 10 * 60 * 1000; // 10 min cookie persistence

// In-memory cookie store (per domain)
// Note: Workers KV would be better for production but adds latency
const cookieStore = new Map();

function getCookiesForDomain(domain) {
  const entry = cookieStore.get(domain);
  if (!entry) return '';
  if (Date.now() - entry.time > COOKIE_TTL) {
    cookieStore.delete(domain);
    return '';
  }
  return entry.cookies;
}

function setCookiesForDomain(domain, setCookieHeaders) {
  if (!setCookieHeaders || !setCookieHeaders.length) return;
  const existing = cookieStore.get(domain);
  const jar = new Map();
  if (existing) {
    for (const c of existing.cookies.split('; ')) {
      const [name] = c.split('=');
      if (name) jar.set(name.trim(), c);
    }
  }
  for (const sc of setCookieHeaders) {
    const semi = sc.indexOf(';');
    const pair = semi > 0 ? sc.substring(0, semi).trim() : sc.trim();
    const eq = pair.indexOf('=');
    if (eq > 0) {
      const name = pair.substring(0, eq).trim();
      if (!sc.includes('Max-Age=0') && !sc.includes('expires=Thu, 01 Jan 1970')) {
        jar.set(name, pair);
      } else {
        jar.delete(name);
      }
    }
  }
  const merged = [...jar.values()].join('; ');
  if (merged) {
    cookieStore.set(domain, { cookies: merged, time: Date.now() });
  } else {
    cookieStore.delete(domain);
  }
}

function extractDomain(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}

async function proxyRequest(targetUrl, originalRequest) {
  const domain = extractDomain(targetUrl);
  const method = originalRequest.method || 'GET';

  // Build headers: forward all client headers + stored cookies
  const reqHeaders = new Headers();

  // Forward original headers (except host, cf-*, cookie)
  for (const [key, value] of originalRequest.headers) {
    const lk = key.toLowerCase();
    if (lk === 'host' || lk.startsWith('cf-') || lk === 'cookie') continue;
    reqHeaders.set(key, value);
  }

  // Ensure browser-like headers
  if (!reqHeaders.has('user-agent')) {
    reqHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  }
  if (!reqHeaders.has('accept')) {
    reqHeaders.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
  }
  if (!reqHeaders.has('accept-language')) {
    reqHeaders.set('Accept-Language', 'es-ES,es;q=0.9,en;q=0.8');
  }

  // Inject stored cookies for this domain
  const storedCookies = getCookiesForDomain(domain);
  if (storedCookies) {
    const existingCookie = reqHeaders.get('Cookie') || '';
    reqHeaders.set('Cookie', existingCookie ? existingCookie + '; ' + storedCookies : storedCookies);
  }

  // Build fetch init
  const fetchInit = {
    method,
    headers: reqHeaders,
    redirect: 'follow',
  };

  // Forward body for POST/PUT
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    const contentType = reqHeaders.get('content-type') || '';
    if (originalRequest.body) {
      fetchInit.body = originalRequest.body;
    }
  }

  // Retry loop with backoff
  let lastError = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, RETRY_BACKOFF_MS[attempt - 1] || 2000));
      }

      const resp = await fetch(targetUrl, fetchInit);

      // Store cookies from response
      const setCookieHeaders = resp.headers.getSetCookie ? resp.headers.getSetCookie() : [];
      if (setCookieHeaders.length) {
        setCookiesForDomain(domain, setCookieHeaders);
      }

      // Build response: forward status, headers, body
      const respHeaders = new Headers();
      for (const [key, value] of resp.headers) {
        const lk = key.toLowerCase();
        // Skip transfer-encoding (may cause issues), forward everything else
        if (lk === 'transfer-encoding' || lk === 'content-encoding') continue;
        respHeaders.set(key, value);
      }
      respHeaders.set('Access-Control-Allow-Origin', '*');
      respHeaders.set('X-Proxy-Attempt', String(attempt + 1));

      const body = await resp.arrayBuffer();
      return new Response(body, {
        status: resp.status,
        headers: respHeaders,
      });
    } catch (e) {
      lastError = e;
      // Only retry on network errors, not HTTP errors
      if (attempt < MAX_RETRIES) continue;
    }
  }

  return new Response(`Proxy error after ${MAX_RETRIES + 1} attempts: ${lastError?.message || 'unknown'}`, { status: 502 });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get('url');

    if (!target) {
      // Health check
      const domains = [...cookieStore.keys()];
      return new Response(JSON.stringify({
        status: 'ok',
        version: '2.0.0',
        cachedDomains: domains.length,
        domains: domains.slice(0, 10),
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Validate target URL
    let targetUrl;
    try {
      targetUrl = decodeURIComponent(target);
      new URL(targetUrl); // validate
    } catch {
      return new Response('Invalid target URL', { status: 400 });
    }

    return proxyRequest(targetUrl, request);
  },
};
