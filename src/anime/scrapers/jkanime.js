const cheerio = require('cheerio-without-node-native') || require('cheerio');
const { resolveEmbed, isDirectVideoUrl } = require('../../web-providers/embed-resolver');

const BASE = 'https://jkanime.net';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const CDN = 'https://cdn.jkdesa.com';

let csrfToken = null;
let cookies = '';
let lastCookieRefresh = 0;
const COOKIE_TTL = 10 * 60 * 1000;

async function fetchText(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeout || 15000);
  try {
    const headers = {
      'User-Agent': UA,
      'Accept': opts.json ? 'application/json, text/html' : 'text/html',
      'X-Requested-With': opts.ajax ? 'XMLHttpRequest' : '',
      ...opts.headers,
    };
    if (cookies) headers.Cookie = cookies;
    if (csrfToken && (opts.method === 'POST' || opts.ajax)) {
      headers['X-CSRF-TOKEN'] = csrfToken;
    }
    for (const k of Object.keys(headers)) {
      if (!headers[k]) delete headers[k];
    }
    const res = await fetch(url, {
      method: opts.method || 'GET',
      headers,
      body: opts.body || null,
      signal: ctrl.signal,
    });
    clearTimeout(t);
    const newCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    if (newCookies.length) {
      cookies = newCookies.join('; ');
      lastCookieRefresh = Date.now();
    }
    if (!res.ok) return null;
    const text = await res.text();
    if (opts.json) {
      try { return JSON.parse(text); } catch { return text; }
    }
    return text;
  } catch {
    clearTimeout(t);
    return null;
  }
}

async function ensureCsrf() {
  if (csrfToken && Date.now() - lastCookieRefresh < COOKIE_TTL) return csrfToken;
  const html = await fetchText(BASE + '/');
  if (!html) return null;
  const m = html.match(/<meta name="csrf-token" content="([^"]+)"/);
  if (m) csrfToken = m[1];
  return csrfToken;
}

async function search(query) {
  const url = `${BASE}/buscar/${encodeURIComponent(query)}/`;
  const html = await fetchText(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const results = [];
  $('.anime__item').each((_, el) => {
    const a = $(el).find('a').first();
    const href = a.attr('href') || '';
    const slug = href.replace(/^\/|\/$/g, '').split('/').pop();
    const img = $(el).find('.anime__item__pic');
    const poster = img.attr('data-setbg') || img.css('background-image')?.replace(/^url\(["']?|["']?\)$/g, '') || '';
    const titleEl = $(el).find('.anime__item__text h5, .anime__item__text a, h5 a').first();
    const title = titleEl.text().trim() || $(el).find('h5').text().trim();
    if (!slug || !title) return;
    results.push({ title, slug, href, poster });
  });
  return results;
}

async function getAnimeId(slug) {
  const html = await fetchText(`${BASE}/${slug}/`);
  if (!html) return null;
  const m = html.match(/data-anime="(\d+)"/);
  return m ? parseInt(m[1]) : null;
}

async function getEpisodes(animeId, page = 1) {
  await ensureCsrf();
  const formData = new URLSearchParams();
  formData.append('pagina', String(page));

  const data = await fetchText(`${BASE}/ajax/episodes/${animeId}/`, {
    method: 'POST',
    body: formData.toString(),
    ajax: true,
    json: true,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000,
  });
  if (!data || !data.data || !Array.isArray(data.data)) return { episodes: [], total: 0, lastPage: 1 };
  return {
    episodes: data.data.map(e => ({
      id: e.id,
      number: e.number,
      title: e.title || `Episodio ${e.number}`,
    })),
    total: data.total || 0,
    lastPage: data.last_page || 1,
  };
}

async function getEpisodePage(slug, episodeNumber) {
  const url = `${BASE}/${slug}/${episodeNumber}/`;
  const html = await fetchText(url);
  if (!html) return null;
  return html;
}

function extractIframes(html) {
  const results = [];
  const iframeRe = /<iframe[^>]+src="([^"]+)"/gi;
  let m;
  while ((m = iframeRe.exec(html)) !== null) {
    const src = m[1];
    if (src.includes('jkplayer') || src.includes('embed') || src.includes('stream')) {
      results.push(src.startsWith('http') ? src : BASE + src);
    }
  }
  return results;
}

function extractServers(html) {
  const serverMatch = html.match(/var servers\s*=\s*(\[[\s\S]*?\]);/);
  if (serverMatch) {
    try {
      const servers = JSON.parse(serverMatch[1]);
      const results = [];
      for (const s of servers) {
        try {
          const url = Buffer.from(s.remote, 'base64').toString('utf-8').trim();
          if (url && url.startsWith('http')) {
            results.push({
              server: s.server,
              lang: s.lang === 1 ? 'SUB' : s.lang === 2 ? 'LAT' : s.lang === 3 ? 'DUB' : '',
              size: s.size || '',
              url,
            });
          }
        } catch { /* skip malformed */ }
      }
      return results;
    } catch { /* fall through */ }
  }

  // Fallback: parse download table (static HTML, always present)
  const $ = cheerio.load(html);
  const results = [];
  $('table tbody tr').each((_, el) => {
    const tds = $(el).find('td');
    if (tds.length < 4) return;
    const server = $(tds[0]).text().trim();
    const size = $(tds[1]).text().trim();
    const a = $(tds[3]).find('a').first();
    const href = a.attr('href') || '';
    if (!server || !href) return;
    results.push({ server, size, url: href });
  });
  return results;
}

function extractM3U8(html) {
  const m3u8Re = /(https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*)/gi;
  const matches = [];
  let m;
  while ((m = m3u8Re.exec(html)) !== null) {
    matches.push(m[1]);
  }
  return [...new Set(matches)];
}

function extractMP4(html) {
  const mp4Re = /(https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*)/gi;
  const matches = [];
  let m;
  while ((m = mp4Re.exec(html)) !== null) {
    const url = m[1];
    if (!url.includes('cdn.jkdesa.com') && !url.includes('google')) {
      matches.push(url);
    }
  }
  return [...new Set(matches)];
}

async function getStreams(slug, episode) {
  const page = await getEpisodePage(slug, episode);
  if (!page) return [];

  const iframes = extractIframes(page);
  const servers = extractServers(page);
  const results = [];
  const seenUrls = new Set();

  // 1. Extract m3u8/mp4 from JKPlayer iframes (um=Desu + umv=Magi)
  const playerNames = ['Desu', 'Magi'];
  for (let idx = 0; idx < iframes.length && idx < 2; idx++) {
    const iframeUrl = iframes[idx];
    try {
      const iframeHtml = await fetchText(iframeUrl, { timeout: 10000 });
      if (!iframeHtml) continue;

      const m3u8s = extractM3U8(iframeHtml);
      const mp4s = extractMP4(iframeHtml);
      const label = playerNames[idx] || 'JKPlayer';

      for (const url of [...new Set([...m3u8s, ...mp4s])]) {
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);
        const host = new URL(url).hostname;
        results.push({
          url,
          server: `${label} (${host})`,
          name: `JKAnime\n${label}`,
          title: `${slug} Ep. ${episode}\n⚙️ ${label} · ${host}`,
          description: 'M3U8 Directo',
          languages: ['ja'],
          behaviorHints: { notWebReady: false, bingeGroup: `jkanime|${label.toLowerCase()}` },
        });
      }
    } catch { /* continue */ }
  }

  // 2. Add all server embed/download URLs, resolve to direct when possible
  for (const s of servers) {
    const label = s.server + (s.lang ? ' ' + s.lang : '') + (s.size ? ' ' + s.size : '');
    let finalUrl = s.url;
    let isResolved = false;

    // Follow c1.jkplayers.com redirects to get real embed URL
    if (s.url.includes('c1.jkplayers.com') || s.url.includes('jkplayers.com/d/')) {
      try {
        const res = await fetch(s.url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const realUrl = res.url;
          if (realUrl !== s.url && realUrl.startsWith('http')) finalUrl = realUrl;
        }
      } catch {}
    }

    // Try lightweight embed resolver on non-direct URLs
    if (!/\.(mp4|mkv|m3u8)($|\?)/i.test(finalUrl) && finalUrl.startsWith('http')) {
      try {
        const direct = await resolveEmbed(finalUrl);
        if (direct && isDirectVideoUrl(direct)) { finalUrl = direct; isResolved = true; }
      } catch {}
    }

    const isDirect = isResolved || /\.(mp4|mkv|m3u8)($|\?)/i.test(finalUrl);
    results.push({
      url: finalUrl,
      server: s.server,
      name: `JKAnime\n${s.server}`,
      title: `${slug} Ep. ${episode}\n⚙️ ${label}${isResolved ? ' (directo)' : ''}`,
      description: s.lang || '',
        languages: ['ja'],
        behaviorHints: { notWebReady: !isDirect, bingeGroup: `jkanime|${s.server}` },
    });
  }

  return results;
}

async function getOnAir() {
  // JKAnime homepage loads content dynamically via JavaScript.
  // On-air catalog is not available via static scraping.
  // Use search or episode-by-episode streaming instead.
  return [];
}

module.exports = { search, getEpisodes, getStreams, getAnimeId, getOnAir, BASE, ensureCsrf };
