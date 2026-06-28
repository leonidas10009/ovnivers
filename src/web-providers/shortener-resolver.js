const { parseTorrentInfoHash } = require('./torrent-parser');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.0';
const MAX_REDIRECTS = 5;

function buildTorrentResult(url, label, quality, buf) {
  const infoHash = buf ? parseTorrentInfoHash(buf) : null;
  const result = {
    url,
    server: 'torrent',
    quality: quality || 'HD',
    ...(infoHash ? { infoHash } : {}),
    ...(infoHash ? { sources: ['dht:' + infoHash] } : {}),
    ...(label ? { filename: label } : {})
  };
  return result;
}

function parseMagnet(magnetUrl, label, quality) {
  const infoHashMatch = magnetUrl.match(/urn:btih:([a-fA-F0-9]{40})/i);
  const sources = [];
  const trRe = /tr=([^&]+)/g;
  let m;
  while ((m = trRe.exec(magnetUrl)) !== null) {
    const trackerUrl = decodeURIComponent(m[1]);
    if (/^(udp|http|https|ws):\/\//.test(trackerUrl)) {
      sources.push(trackerUrl);
    }
  }
  if (infoHashMatch) sources.push('dht:' + infoHashMatch[1].toLowerCase());
  return {
    url: magnetUrl,
    server: 'torrent',
    quality: quality || 'HD',
    ...(infoHashMatch ? { infoHash: infoHashMatch[1].toLowerCase() } : {}),
    ...(sources.length ? { sources } : {}),
    ...(label ? { filename: label } : {})
  };
}

async function fetchBuffer(url, headers, timeout = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    clearTimeout(t);
    return null;
  }
}

async function fetchText(url, headers, timeout = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    clearTimeout(t);
    return null;
  }
}

function extractFinalLink(html, baseUrl) {
  // Look for direct .torrent or magnet links
  const directRe = /(https?:\/\/[^"'\s<>]+\.torrent|magnet:\?xt=[^"'\s<>]+)/gi;
  const matches = html.match(directRe);
  if (matches && matches.length) {
    const unique = [...new Set(matches.map(u => u.replace(/[)"'<>]+$/, '')))];
    if (unique[0].startsWith('http')) {
      try { return new URL(unique[0], baseUrl).href; } catch { return unique[0]; }
    }
    return unique[0];
  }

  // Look for meta refresh
  const metaMatch = html.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*content=["']?\d+\s*;\s*url=([^"'\s>]+)/i);
  if (metaMatch) {
    try { return new URL(metaMatch[1], baseUrl).href; } catch { return metaMatch[1]; }
  }

  return null;
}

async function resolveFormShortener(shortUrl, referer) {
  const headers = { 'User-Agent': UA, 'Referer': referer };
  const html = await fetchText(shortUrl, headers, 15000);
  if (!html) return null;

  // Extract form POST parameters
  const formMatch = html.match(/<form[^>]*action=["']([^"']+)["'][^>]*>([\s\S]*?)<\/form>/i);
  if (!formMatch) return null;

  const action = formMatch[1];
  const formBody = formMatch[2];
  const inputs = [];
  const inputRe = /<input[^>]*name=["']([^"']+)["'][^>]*value=["']([^"']*)["'][^>]*>/gi;
  let im;
  while ((im = inputRe.exec(formBody)) !== null) {
    inputs.push({ name: im[1], value: im[2] });
  }

  const linkser = inputs.find(i => i.name === 'linkser');
  if (!linkser) return null;

  const postUrl = action.startsWith('http') ? action : new URL(action, shortUrl).href;
  const body = inputs.map(i => `${encodeURIComponent(i.name)}=${encodeURIComponent(i.value)}`).join('&');

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Referer': shortUrl,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body,
      redirect: 'manual',
      signal: ctrl.signal
    });
    clearTimeout(t);
    const text = await res.text();
    const final = extractFinalLink(text, postUrl) || res.headers.get('location');
    if (final) {
      if (final.startsWith('http') && final.endsWith('.torrent')) {
        const buf = await fetchBuffer(final, { 'User-Agent': UA, 'Referer': postUrl }, 15000);
        return buildTorrentResult(final, null, null, buf);
      }
      if (final.startsWith('magnet:')) return parseMagnet(final, null, null);
    }
  } catch {
    clearTimeout(t);
  }
  return null;
}

async function followRedirect(url, referer, depth = 0) {
  if (depth >= MAX_REDIRECTS) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Referer': referer },
      redirect: 'manual',
      signal: ctrl.signal
    });
    clearTimeout(t);

    const location = res.headers.get('location');
    if (location) {
      const next = location.startsWith('http') ? location : new URL(location, url).href;
      if (next.endsWith('.torrent')) {
        const buf = await fetchBuffer(next, { 'User-Agent': UA, 'Referer': url }, 15000);
        return buildTorrentResult(next, null, null, buf);
      }
      if (next.startsWith('magnet:')) return parseMagnet(next, null, null);
      return followRedirect(next, url, depth + 1);
    }

    const text = await res.text();
    const final = extractFinalLink(text, url);
    if (final) {
      if (final.startsWith('http') && final.endsWith('.torrent')) {
        const buf = await fetchBuffer(final, { 'User-Agent': UA, 'Referer': url }, 15000);
        return buildTorrentResult(final, null, null, buf);
      }
      if (final.startsWith('magnet:')) return parseMagnet(final, null, null);
    }
  } catch {
    clearTimeout(t);
  }
  return null;
}

async function resolveDownloadTTLink(href, label, quality, referer) {
  const uMatch = href.match(/[?&]u=([^&]+)/);
  if (!uMatch) return null;
  try {
    const raw = decodeURIComponent(uMatch[1]).trim();
    let decoded = raw;
    // Some DivXTotal links encode the target URL in base64; others pass it directly.
    if (/^[A-Za-z0-9+/=]{20,}$/.test(raw)) {
      try {
        const base64Decoded = Buffer.from(raw, 'base64').toString('utf-8').trim();
        if (base64Decoded.startsWith('http')) decoded = base64Decoded;
      } catch {}
    }
    if (!decoded.startsWith('http') || !decoded.endsWith('.torrent')) return null;
    const buf = await fetchBuffer(decoded, { 'User-Agent': UA, 'Referer': referer }, 15000);
    if (!buf) return null;
    const result = buildTorrentResult(decoded, label, quality, buf);
    // Keep the original download_tt.php facade URL so callers see the provider link,
    // but the resolved torrent file was parsed for infoHash.
    result.url = href;
    return result;
  } catch {
    return null;
  }
}

/**
 * Try to resolve a torrent link/shortener into a concrete torrent result.
 * Returns a result object compatible with engine.js extractVideos, or null.
 */
async function resolveTorrentLink(href, label, quality, referer) {
  if (!href) return null;

  // Direct magnet
  if (href.startsWith('magnet:')) {
    return parseMagnet(href, label, quality);
  }

  // download_tt.php link (DivXTotal): u may be base64 or a direct torrent URL.
  // Must be checked before generic .torrent suffix because these URLs end in .torrent
  // but are a PHP facade, not the actual torrent file.
  const downloadTTResult = await resolveDownloadTTLink(href, label, quality, referer);
  if (downloadTTResult) return downloadTTResult;

  // Direct .torrent link
  if (href.endsWith('.torrent')) {
    const buf = await fetchBuffer(href, { 'User-Agent': UA, 'Referer': referer }, 15000);
    return buildTorrentResult(href, label, quality, buf);
  }

  // URL shortener form (super-enlace.com, acortalink.net)
  if (/\/s\.php\?i=/.test(href) || /\/s\.php\?u=/.test(href)) {
    const formResult = await resolveFormShortener(href, referer);
    if (formResult) {
      if (label) formResult.filename = label;
      if (quality) formResult.quality = quality;
      return formResult;
    }
    // Fallback to simple redirect follow (some shorteners still use plain redirects)
    return followRedirect(href, referer);
  }

  return null;
}

module.exports = { resolveTorrentLink };
