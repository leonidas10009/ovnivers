const cheerio = require('cheerio-without-node-native') || require('cheerio');
const crypto = require('crypto');
const { resolveEmbed } = require('./embed-resolver');
const scrapeless = require('../scrapeless-proxy');

const anubisCookieCache = new Map();

function parseSetCookie(sc) {
  if (!sc) return '';
  const semi = sc.indexOf(';');
  return semi > 0 ? sc.substring(0, semi).trim() : sc.trim();
}

async function solveAnubisPoW(randomData, difficulty) {
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;
  while (true) {
    const hash = crypto.createHash('sha256').update(randomData + nonce).digest('hex');
    if (hash.startsWith(prefix)) return { nonce, hash };
    nonce++;
  }
}

async function bypassAnubisChallenge(html, url, verificationCookie) {
  const chMatch = html.match(/<script id="anubis_challenge"[^>]*>([\s\S]*?)<\/script>/);
  const baseMatch = html.match(/<script id="anubis_base_prefix"[^>]*>([\s\S]*?)<\/script>/);
  if (!chMatch) return null;

  const parsed = JSON.parse(chMatch[1].trim());
  const challenge = parsed.challenge;
  const basePrefix = baseMatch ? JSON.parse(baseMatch[1].trim()) : '';
  const baseUrl = new URL(url).origin;

  const solution = await solveAnubisPoW(challenge.randomData, challenge.difficulty || 5);

  const params = new URLSearchParams({
    id: challenge.id,
    response: solution.hash,
    nonce: String(solution.nonce),
    redir: '/',
    elapsedTime: String(Math.floor(Math.random() * 3000 + 1000))
  });
  const passUrl = `${baseUrl}${basePrefix}/.within.website/x/cmd/anubis/api/pass-challenge?${params}`;

  const passHeaders = { 'User-Agent': UA };
  if (verificationCookie) passHeaders['Cookie'] = parseSetCookie(verificationCookie);

  const passRes = await fetch(passUrl, { headers: passHeaders, redirect: 'manual' });

  const cookies = passRes.headers.getSetCookie ? passRes.headers.getSetCookie() : [passRes.headers.get('set-cookie')].filter(Boolean);
  const authCookie = cookies.find(c => !c.includes('Max-Age=0'));
  if (authCookie) return parseSetCookie(authCookie);
  return null;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';

async function fetchHTML(url, opts = {}) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), opts.timeout || 20000);
    const domain = typeof url === 'string' ? new URL(url).hostname : '';
    const cached = anubisCookieCache.get(domain);
    const headers = { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,*/*', ...opts.headers };
    if (cached) headers['Cookie'] = cached;

    const res = await fetch(url, { headers, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) {
      // Fallback to Scrapeless if direct fetch fails
      if (scrapeless.isEnabled()) {
        const scraped = await scrapeless.scrape(url, { timeout: opts.timeout || 30000 });
        if (scraped) return scraped;
      }
      return null;
    }
    let html = await res.text();

    // Cloudflare challenge detected — fallback to Scrapeless
    if ((html.includes('challenge-platform') || html.includes('turnstile') || html.includes('Just a moment')) && html.length < 10000) {
      if (scrapeless.isEnabled()) {
        console.log(`[engine] Cloudflare detected on ${domain}, trying Scrapeless...`);
        const scraped = await scrapeless.scrape(url, { timeout: opts.timeout || 30000 });
        if (scraped) return scraped;
      }
    }

    if (html.includes('anubis_challenge')) {
      const initialCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
      const verificationCookie = initialCookies.find(c => c.includes('cookie-verification')) || '';
      const authCookie = await bypassAnubisChallenge(html, url, verificationCookie);
      if (authCookie) {
        anubisCookieCache.set(domain, authCookie);
        const ctrl2 = new AbortController();
        const t2 = setTimeout(() => ctrl2.abort(), opts.timeout || 20000);
        const res2 = await fetch(url, {
          headers: { ...headers, 'Cookie': authCookie },
          signal: ctrl2.signal
        });
        clearTimeout(t2);
        if (!res2.ok) return null;
        html = await res2.text();
      }
    }

    return html;
  } catch {
    // Network error — fallback to Scrapeless
    if (scrapeless.isEnabled()) {
      try {
        const scraped = await scrapeless.scrape(url, { timeout: opts.timeout || 30000 });
        if (scraped) return scraped;
      } catch {}
    }
    return null;
  }
}

async function fetchJSON(url, opts = {}) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), opts.timeout || 15000);
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json', ...opts.headers },
      signal: ctrl.signal
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const sa = a.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sb = b.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (sa === sb) return 1;
  if (sa.length < 2 || sb.length < 2) return 0;
  const longer = sa.length > sb.length ? sa : sb;
  const shorter = sa.length > sb.length ? sb : sa;
  if (longer.length === 0) return 1;
  const bigrams = new Map();
  for (let i = 0; i < shorter.length - 1; i++) {
    const bg = shorter.substring(i, i + 2);
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
  }
  let common = 0;
  for (let i = 0; i < longer.length - 1; i++) {
    const bg = longer.substring(i, i + 2);
    const count = bigrams.get(bg) || 0;
    if (count > 0) { common++; bigrams.set(bg, count - 1); }
  }
  return (2.0 * common) / (longer.length + shorter.length - 2);
}

async function resolveTMDB(id, mediaType) {
  try {
    let tmdbId = id;
    if (id.startsWith('tt')) {
      const r = await fetchJSON(`https://api.themoviedb.org/3/find/${id}?api_key=${TMDB_KEY}&external_source=imdb_id`);
      const results = r?.[mediaType === 'tv' ? 'tv_results' : 'movie_results'];
      if (results?.[0]) tmdbId = results[0].id;
      else return null;
    }
    const typeStr = mediaType === 'tv' ? 'tv' : 'movie';
    const data = await fetchJSON(`https://api.themoviedb.org/3/${typeStr}/${tmdbId}?api_key=${TMDB_KEY}&language=en`);
    if (!data) return null;
    return {
      title: data.title || data.name || '',
      year: (data.release_date || data.first_air_date || '').substring(0, 4),
      imdbId: data.imdb_id || '',
      tmdbId: String(data.id)
    };
  } catch { return null; }
}

async function searchProvider(provider, title, year, mediaType) {
  const cfg = provider.search;
  if (!cfg) return null;

  const titleClean = title.replace(/[_-]/g, ' ').replace(/\s+/g, ' ').trim();

  async function trySearch(query) {
    let searchUrl;
    if (typeof cfg.url === 'function') {
      searchUrl = cfg.url(provider.baseUrl, query);
    } else {
      searchUrl = provider.baseUrl + cfg.url.replace('{query}', encodeURIComponent(query));
    }
    if (cfg.method === 'POST') {
      const domain = new URL(searchUrl).hostname;
      const initHtml = await fetchHTML(searchUrl, { timeout: 10000 });
      if (!initHtml) return null;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 12000);
        const res = await fetch(searchUrl, {
          method: 'POST',
          headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded', ...(cfg.headers || {}) },
          body: (cfg.body || 'query={query}').replace('{query}', encodeURIComponent(query)),
          signal: ctrl.signal
        });
        clearTimeout(t);
        if (!res.ok) return null;
        return await res.text();
      } catch { return null; }
    }
    return await fetchHTML(searchUrl, { headers: cfg.headers, timeout: 10000 });
  }

  // Try full title, first 2 words, first 1 word
  let html = await trySearch(titleClean);
  if (!html && titleClean.includes(' ')) {
    const words = titleClean.split(' ');
    const first2 = words.slice(0, 2).join(' ');
    if (first2.length > 3) html = await trySearch(first2);
  }
  if (!html && titleClean.includes(' ')) {
    const first = titleClean.split(' ')[0];
    if (first.length > 3) html = await trySearch(first);
  }
  if (!html) return null;

  const $ = cheerio.load(html);
  const items = $(cfg.itemSelector).toArray();
  if (!items.length) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const item of items) {
    const el = $(item);
    let itemTitle = '';
    let itemLink = '';

    if (cfg.titleSelector) {
      const titleEl = cfg.titleSelector === '&' ? el : el.find(cfg.titleSelector).first();
      itemTitle = cfg.titleAttr ? titleEl.attr(cfg.titleAttr) || '' : titleEl.text().trim();
    }
    if (cfg.linkSelector) {
      const linkEl = cfg.linkSelector === '&' ? el : el.find(cfg.linkSelector).first();
      itemLink = (linkEl.attr('href') || '').trim();
      if (itemLink && !itemLink.startsWith('http')) {
        try { itemLink = new URL(itemLink, provider.baseUrl).href; } catch { continue; }
      }
    }

    if (!itemTitle || !itemLink) continue;

    let score = similarity(itemTitle, title);
    const titleClean2 = titleClean.replace(/[^a-z0-9]/g, '');
    const itemClean = itemTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (itemClean === titleClean2) score = Math.max(score, 0.9);
    // Substring bonus: only if query is >=5 chars or covers >=40% of title
    // Prevents common words ("from", "love", "the") from false-matching unrelated shows
    if (titleClean2.length >= 5 && (itemClean.includes(titleClean2) || titleClean2.includes(itemClean))) {
      score = Math.max(score, 0.75);
    }
    if (year) {
      const itemYear = el.text().match(/\b(19|20)\d{2}\b/);
      if (itemYear && itemYear[0] === year) score += 0.25;
    }

    // Word-level guard (word boundary): at least one query word (≥4 chars) must 
    // match as a complete word (not just substring) in the result title
    let wordMatch = true;
    const queryWords = titleClean.split(' ').filter(w => w.length >= 4);
    if (queryWords.length > 0) {
      const itemLower = ' ' + itemTitle.toLowerCase().replace(/[^a-z0-9]/g, ' ') + ' ';
      wordMatch = queryWords.some(qw => itemLower.includes(' ' + qw.toLowerCase() + ' '));
    }

    if (score > bestScore && score > 0.5 && wordMatch) {
      bestScore = score;
      bestMatch = itemLink;
    }
  }

  // Fallback: no strong match, try exact word containment
  if (!bestMatch && items.length > 0) {
    const queryWords = titleClean.toLowerCase().split(' ').filter(w => w.length >= 3);
    for (const item of items) {
      const el = $(item);
      let itemTitle = '';
      if (cfg.titleSelector) {
        const titleEl = cfg.titleSelector === '&' ? el : el.find(cfg.titleSelector).first();
        itemTitle = cfg.titleAttr ? titleEl.attr(cfg.titleAttr) || '' : titleEl.text().trim();
      }
      let itemLink = '';
      if (cfg.linkSelector) {
        const linkEl = cfg.linkSelector === '&' ? el : el.find(cfg.linkSelector).first();
        itemLink = (linkEl.attr('href') || '').trim();
        if (itemLink && !itemLink.startsWith('http')) {
          try { itemLink = new URL(itemLink, provider.baseUrl).href; } catch { continue; }
        }
      }
      if (!itemTitle || !itemLink) continue;
      const itemLower = itemTitle.toLowerCase();
      const allMatch = queryWords.length > 0 && queryWords.every(qw => itemLower.includes(qw));
      if (allMatch) { bestMatch = itemLink; break; }
    }
  }

  // Last resort: return first result
  if (!bestMatch && items.length > 0) {
    const el = $(items[0]);
    let itemLink = '';
    if (cfg.linkSelector) {
      const linkEl = cfg.linkSelector === '&' ? el : el.find(cfg.linkSelector).first();
      itemLink = (linkEl.attr('href') || '').trim();
      if (itemLink && !itemLink.startsWith('http')) {
        try { itemLink = new URL(itemLink, provider.baseUrl).href; } catch { itemLink = ''; }
      }
    }
    if (itemLink) bestMatch = itemLink;
  }

  return bestMatch;
}

async function getEpisodeUrl(provider, seriesUrl, season, episode) {
  const cfg = provider.episodes;
  if (!cfg) return seriesUrl;

  if (cfg.type === 'url') {
    const slug = seriesUrl.replace(/\/+$/, '').split('/').pop();
    const url = cfg.pattern.replace('{slug}', slug).replace('{episode}', episode);
    try { return new URL(url, provider.baseUrl).href; } catch { return seriesUrl; }
  }

  const html = await fetchHTML(seriesUrl);
  if (!html) return null;
  const $ = cheerio.load(html);

  if (cfg.type === 'post') {
    const fd = new URLSearchParams();
    fd.append(cfg.seasonParam || 'season', String(season));
    fd.append(cfg.episodeParam || 'episode', String(episode));
    if (cfg.extraParams) {
      for (const [k, v] of Object.entries(cfg.extraParams)) {
        fd.append(k, typeof v === 'function' ? v($, html) : v);
      }
    }
    const postUrl = cfg.url || seriesUrl;
    const res = await fetch(postUrl, {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded', ...cfg.headers },
      body: fd.toString(),
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) return null;
    const data = await res.text();
    const $$ = cheerio.load(data);
    const epLink = $$(cfg.episodeSelector).first().attr('href');
    if (epLink) {
      try { return new URL(epLink, provider.baseUrl).href; } catch { return null; }
    }
    return null;
  }

  if (cfg.type === 'season-list') {
    const seasonEls = $(cfg.seasonSelector).toArray();
    for (const sel of seasonEls) {
      const sNum = parseInt($(sel).text().match(/\d+/)?.[0] || '0');
      if (sNum === season) {
        const sUrl = $(sel).attr('href');
        if (sUrl) {
          const sHtml = await fetchHTML(new URL(sUrl, provider.baseUrl).href);
          if (sHtml) {
            const $$ = cheerio.load(sHtml);
            const epEls = $$(cfg.episodeSelector).toArray();
            for (const eel of epEls) {
              const eNum = parseInt($$(eel).text().match(/\d+/)?.[0] || '0');
              if (eNum === episode) {
                const epUrl = $$(eel).attr('href');
                if (epUrl) {
                  try { return new URL(epUrl, provider.baseUrl).href; } catch { return null; }
                }
              }
            }
          }
        }
      }
    }
  }

  if (cfg.type === 'jsvar') {
    const match = html.match(cfg.varPattern);
    if (match) {
      try {
        const episodes = JSON.parse(match[1]);
        const ep = episodes.find(e =>
          (e.season || e.temporada) == season && (e.episode || e.capitulo) == episode
        );
        if (ep?.url || ep?.link) {
          try { return new URL(ep.url || ep.link, provider.baseUrl).href; } catch { return null; }
        }
      } catch {}
    }
  }

  if (cfg.type === 'nextjs') {
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        let obj = data;
        for (const key of cfg.dataPath.split('.')) obj = obj?.[key];
        if (obj?.seasons) {
          for (const s of obj.seasons) {
            if (s.number == season) {
              const ep = s.episodes?.find(e => e.number == episode);
              if (ep?.url) {
                try { return new URL(ep.url, provider.baseUrl).href; } catch { return null; }
              }
            }
          }
        }
      } catch {}
    }
  }

  if (cfg.type === 'dontorrent') {
    const rows = $('table.table tbody tr').toArray();
    for (const row of rows) {
      const cells = $(row).find('td');
      const epText = $(cells[0]).text().trim();
      const epMatch = epText.match(/(\d+)x(\d+)/);
      if (epMatch && parseInt(epMatch[1]) === season && parseInt(epMatch[2]) === episode) {
        const btn = $(cells[1]).find('.protected-download');
        const contentId = btn.attr('data-content-id');
        const tabla = btn.attr('data-tabla');
        if (contentId && tabla) {
          try { return seriesUrl + '?dt_contentId=' + contentId + '&dt_tabla=' + tabla; } catch {}
        }
      }
    }
    // Episode not found — search for show and find correct season
    try {
      const domain = new URL(seriesUrl).hostname;
      const showBase = seriesUrl.split('/').pop().replace(/-\d+-Temporada.*/i, '').replace(/-/g, ' ').trim();
      const searchUrl = provider.baseUrl + '/buscar';
      const init = await fetchHTML(searchUrl, { timeout: 10000 });
      if (!init) return null;
      const cookie = anubisCookieCache.get(domain);
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      const sRes = await fetch(searchUrl, {
        method: 'POST',
        headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded', ...(cookie ? { 'Cookie': cookie } : {}) },
        body: 'valor=' + encodeURIComponent(showBase),
        signal: ctrl.signal
      });
      clearTimeout(t);
      if (!sRes.ok) return null;
      const sHtml = await sRes.text();
      const $$ = cheerio.load(sHtml);
      const seasonLinks = $$('a[href*="/serie/"]').toArray();
      if (!seasonLinks.length) return null;
      for (const sl of seasonLinks) {
        const seasonText = $$(sl).text().trim();
        if (seasonText.includes(season + 'ª Temporada') || seasonText.includes(season + ' Temporada') || new RegExp('\\b' + season + '\\b').test(seasonText)) {
          let seasonUrl = $$(sl).attr('href');
          if (!seasonUrl) continue;
          if (!seasonUrl.startsWith('http')) seasonUrl = provider.baseUrl + seasonUrl;
          const sHtml2 = await fetchHTML(seasonUrl, { timeout: 10000 });
          if (!sHtml2) continue;
          const $$$ = cheerio.load(sHtml2);
          const sRows = $$$('table.table tbody tr').toArray();
          for (const row of sRows) {
            const cells = $$$(row).find('td');
            const epText = $$$(cells[0]).text().trim();
            const epMatch = epText.match(/(\d+)x(\d+)/);
            if (epMatch && parseInt(epMatch[1]) === season && parseInt(epMatch[2]) === episode) {
              const btn = $$$(cells[1]).find('.protected-download');
              const contentId = btn.attr('data-content-id');
              const tabla = btn.attr('data-tabla');
              if (contentId && tabla) {
                try { return seasonUrl + '?dt_contentId=' + contentId + '&dt_tabla=' + tabla; } catch {}
              }
            }
          }
        }
      }
    } catch {}
    return null;
  }

  return seriesUrl;
}

async function extractVideos(provider, pageUrl) {
  const cfg = provider.videos;
  if (!cfg) return [];

  const html = await fetchHTML(pageUrl);
  if (!html) return [];
  const $ = cheerio.load(html);
  const results = [];

  function resolveUrl(val) {
    if (!val) return null;
    if (typeof val === 'string' && /^[A-Za-z0-9+/=]{20,}$/.test(val) && !val.startsWith('http')) {
      try {
        const decoded = Buffer.from(val, 'base64').toString('utf-8').trim();
        if (decoded.startsWith('http://') || decoded.startsWith('https://')) return decoded;
      } catch {}
    }
    if (val.startsWith('//')) return 'https:' + val;
    if (val.startsWith('/')) {
      try { return new URL(val, pageUrl).href; } catch { return val; }
    }
    return val;
  }

  if (cfg.type === 'iframe') {
    const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
    const targets = container.find(cfg.iframeSelector || 'iframe').toArray();
    for (const el of targets) {
      const val = $(el).attr(cfg.srcAttr || 'src') || $(el).attr('data-src');
      const url = resolveUrl(val);
      if (url) results.push({ url, server: detectServer(url), quality: cfg.defaultQuality || 'HD' });
    }
    if (!results.length) {
      const attr = cfg.srcAttr || 'data-src';
      const altTargets = container.find('a[' + attr + ']').toArray();
      for (const el of altTargets) {
        const val = $(el).attr(attr);
        const url = resolveUrl(val);
        if (url) results.push({ url, server: detectServer(url), quality: cfg.defaultQuality || 'HD' });
      }
    }
  }

  if (cfg.type === 'iframe-chain') {
    const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
    const iframes = container.find(cfg.iframeSelector || 'iframe').toArray();
    const chainUrls = [];
    for (const iframe of iframes) {
      const src = $(iframe).attr(cfg.srcAttr || 'src') || $(iframe).attr('data-src');
      if (src) chainUrls.push(src.startsWith('//') ? 'https:' + src : src);
    }
    for (const embedUrl of chainUrls) {
      try {
        const body = await fetchHTML(embedUrl, { headers: { Referer: pageUrl }, timeout: 10000 });
        if (!body) continue;
        const $e = cheerio.load(body);
        const realSrc = $e('div.Video iframe, .Video iframe, iframe').first().attr('src');
        if (realSrc) {
          const finalUrl = realSrc.startsWith('//') ? 'https:' + realSrc : realSrc;
          results.push({ url: finalUrl, server: detectServer(finalUrl), quality: cfg.defaultQuality || 'HD' });
        }
      } catch {}
    }
  }

  if (cfg.type === 'nextjs') {
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/)
      || html.match(/<script type="application\/json"[^>]*>(.*?)<\/script>/);
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        let obj = data;
        for (const key of cfg.dataPath.split('.')) obj = obj?.[key];
        if (obj && typeof obj === 'object') {
          for (const [lang, players] of Object.entries(obj)) {
            if (Array.isArray(players)) {
              for (const p of players) {
                const pUrl = p.result || p.url || p.link;
                if (pUrl) results.push({
                  url: pUrl,
                  server: p.cyberlocker || p.server || detectServer(pUrl),
                  quality: p.quality || cfg.defaultQuality || 'HD',
                  lang
                });
              }
            }
          }
        }
      } catch {}
    }
  }

  if (cfg.type === 'jsvar') {
    const match = html.match(cfg.varPattern);
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        const entries = Array.isArray(data) ? data : Object.values(data).flat();
        for (const v of entries) {
          const server = Array.isArray(v) ? v[0] : v.server || v.name;
          const vUrl = Array.isArray(v) ? v[1] : v.url || v.link || v.code;
          if (vUrl) results.push({
            url: vUrl,
            server: server || detectServer(vUrl),
            quality: v.quality || cfg.defaultQuality || 'HD',
            lang: v.lang || v.idioma || v.audio || ''
          });
        }
      } catch {}
    }
  }

  if (cfg.type === 'jslist') {
    const re = cfg.varPattern instanceof RegExp ? cfg.varPattern : new RegExp(cfg.varPattern, 'g');
    let m;
    while ((m = re.exec(html)) !== null) {
      const src = (m[1] || '').match(/src=["']([^"']+)["']/);
      if (src) {
        results.push({ url: src[1], server: detectServer(src[1]), quality: cfg.defaultQuality || 'HD' });
      }
    }
  }

  if (cfg.type === 'jkplayer') {
    const re = cfg.varPattern instanceof RegExp ? cfg.varPattern : new RegExp(cfg.varPattern, 'g');
    let m;
    while ((m = re.exec(html)) !== null) {
      const src = (m[1] || '').match(/src=["']([^"']+)["']/);
      if (src) results.push({ url: src[1], server: detectServer(src[1]), quality: cfg.defaultQuality || 'HD' });
    }
    for (const r of results) {
      if (!r.url || !r.url.includes('/jkplayer/')) continue;
      try {
        const body = await fetchHTML(r.url);
        let vm = body.match(/url:\s*'([^']+\.m3u8[^']*)'/);
        if (!vm) {
          const b64 = body.match(/atob\('([^']+)'\)/);
          if (b64) vm = [null, Buffer.from(b64[1], 'base64').toString()];
        }
        if (vm) {
          r.url = vm[1];
          r.server = detectServer(vm[1]);
        }
      } catch {}
    }
  }

  if (cfg.type === 'api') {
    const apiUrl = typeof cfg.apiUrl === 'function'
      ? cfg.apiUrl(provider.baseUrl, pageUrl, html)
      : provider.baseUrl + cfg.apiUrl;
    const data = await fetchJSON(apiUrl, { headers: cfg.headers });
    if (data) {
      const sources = data.sources || data.data || data;
      for (const s of (Array.isArray(sources) ? sources : [])) {
        const sUrl = s.url || s.file || s.link || s.src;
        if (sUrl) results.push({
          url: sUrl,
          server: s.server || detectServer(sUrl),
          quality: s.quality || s.label || cfg.defaultQuality || 'HD'
        });
      }
    }
  }

  if (cfg.type === 'torrent') {
    const selector = cfg.linkSelector || 'a[href*="magnet:"], a[href$=".torrent"], a[href*="s.php"], a[href*="download_tt.php"], a[class*="torrent"], a[class*="download"], a[class*="descargar"]';
    const links = $(selector).toArray();
    for (const link of links) {
      const href = $(link).attr('href');
      if (!href) continue;
      const label = $(link).text().trim() || '';
      const qualityMatch = label.match(/\b(4K|2160p?|1080p?|720p?|480p?)\b/i);

      // Direct magnet
      if (href.startsWith('magnet:')) {
        const infoHashMatch = href.match(/urn:btih:([a-fA-F0-9]{40})/i);
        const sources = [];
        const trRe = /tr=([^&]+)/g;
        let m;
        while ((m = trRe.exec(href)) !== null) {
          const trackerUrl = decodeURIComponent(m[1]);
          if (trackerUrl.startsWith('udp://') || trackerUrl.startsWith('http://') || trackerUrl.startsWith('https://') || trackerUrl.startsWith('ws://')) {
            sources.push(trackerUrl);
          }
        }
        if (infoHashMatch) sources.push('dht:' + infoHashMatch[1].toLowerCase());
        results.push({
          url: href, server: 'torrent',
          quality: (qualityMatch ? qualityMatch[1] : '') || cfg.defaultQuality || 'HD',
          ...(infoHashMatch ? { infoHash: infoHashMatch[1].toLowerCase() } : {}),
          ...(sources.length ? { sources } : {}),
          ...(label ? { filename: label } : {})
        });
        continue;
      }

      // Direct .torrent link
      if (href.endsWith('.torrent')) {
        results.push({
          url: href, server: 'torrent',
          quality: (qualityMatch ? qualityMatch[1] : '') || cfg.defaultQuality || 'HD',
          ...(label ? { filename: label } : {})
        });
        continue;
      }

      // URL shortener (super-enlace.com, acortalink.net, short-info.link)
      if (/\/s\.php\?i=/.test(href) || /\/s\.php\?u=/.test(href)) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 10000);
          const redirRes = await fetch(href, {
            headers: { 'User-Agent': UA, 'Referer': pageUrl },
            redirect: 'follow',
            signal: ctrl.signal
          });
          clearTimeout(t);
          if (redirRes.ok) {
            const finalUrl = redirRes.url;
            if (finalUrl.endsWith('.torrent')) {
              const buf = Buffer.from(await redirRes.arrayBuffer());
              const infoHash = parseTorrentInfoHash(buf);
              results.push({
                url: finalUrl, server: 'torrent',
                quality: (qualityMatch ? qualityMatch[1] : '') || cfg.defaultQuality || 'HD',
                ...(infoHash ? { infoHash } : {}),
                ...(infoHash ? { sources: ['dht:' + infoHash] } : {}),
                ...(label ? { filename: label } : {})
              });
            }
          }
        } catch {}
        continue;
      }

      // Base64 download link (download_tt.php?u=<base64>)
      const b64Match = href.match(/[?&]u=([A-Za-z0-9+/=]{20,})/);
      if (b64Match) {
        try {
          const decoded = Buffer.from(b64Match[1], 'base64').toString('utf-8').trim();
          if (decoded.startsWith('http') && decoded.endsWith('.torrent')) {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 10000);
            const dlRes = await fetch(decoded, {
              headers: { 'User-Agent': UA, 'Referer': pageUrl },
              signal: ctrl.signal
            });
            clearTimeout(t);
            if (dlRes.ok) {
              const buf = Buffer.from(await dlRes.arrayBuffer());
              const infoHash = parseTorrentInfoHash(buf);
              results.push({
                url: decoded, server: 'torrent',
                quality: (qualityMatch ? qualityMatch[1] : '') || cfg.defaultQuality || 'HD',
                ...(infoHash ? { infoHash } : {}),
                ...(infoHash ? { sources: ['dht:' + infoHash] } : {}),
                ...(label ? { filename: label } : {})
              });
            }
          }
        } catch {}
        continue;
      }
    }
  }

  if (cfg.type === 'dontorrent') {
    let contentId, tabla, episodeLabel;
    try {
      const parsed = new URL(pageUrl);
      contentId = parsed.searchParams.get('dt_contentId');
      tabla = parsed.searchParams.get('dt_tabla');
    } catch {}
    if (contentId && tabla) {
      episodeLabel = $('table.table tbody tr').first().find('td').first().text().trim().match(/x(\d+)/)?.[1];
    }
    if (!contentId || !tabla) {
      const btn = $('.protected-download').first();
      contentId = btn.attr('data-content-id');
      tabla = btn.attr('data-tabla');
      episodeLabel = '';
    }
    if (!contentId || !tabla) return [];
    const torrentInfo = await downloadDontorrentTorrent(provider.baseUrl, contentId, tabla);
    if (!torrentInfo) return [];
    let quality = cfg.defaultQuality || 'HD';
    const fmtMatch = html.match(/Formato:<\/b>\s*([^<]+)/i);
    if (fmtMatch) quality = fmtMatch[1].trim();
    const fnameMatch = torrentInfo.filename.match(/\b(4K|2160p?|1080p?|720p?|480p?|HDTV|HD)\b/i);
    if (fnameMatch) quality = fnameMatch[1];
    results.push({
      url: torrentInfo.url,
      infoHash: torrentInfo.infoHash,
      server: 'torrent',
      quality,
      filename: torrentInfo.filename || (episodeLabel ? 'Episode ' + episodeLabel : ''),
      sources: ['dht:' + torrentInfo.infoHash]
    });
  }

  const embeds = results.filter(r => !r.infoHash && r.url && r.server !== 'direct' && r.server !== 'torrent');
  const resolvedList = await Promise.allSettled(embeds.map(r => tryResolveEmbedToDirect(r.url, pageUrl)));
  for (let i = 0; i < embeds.length; i++) {
    const res = resolvedList[i];
    if (res.status === 'fulfilled' && res.value) {
      embeds[i].url = res.value;
      embeds[i].server = 'direct';
    }
  }

  return results;
}

async function tryResolveEmbedToDirect(embedUrl, referer) {
  if (!embedUrl) return null;
  return resolveEmbed(embedUrl, referer);
}

function detectServer(url) {
  if (!url) return 'direct';
  if (/\.(mp4|m3u8|mkv|webm|avi)(\?|$)/i.test(url)) return 'direct';
  if (/magnet:/i.test(url)) return 'torrent';
  const patterns = [
    ['streamwish', /streamwish/i], ['filemoon', /filemoon/i], ['voes', /voes\./i],
    ['doodstream', /dood/i], ['streamtape', /streamtape/i], ['fembed', /fembed/i],
    ['okru', /ok\.ru|odnoklassniki/i], ['mixdrop', /mixdrop/i], ['upstream', /upstream/i],
    ['vidhide', /vidhide|vidpro/i], ['voe', /voe\.sx/i], ['mystream', /mystream/i],
    ['netutv', /netu\.tv/i], ['yourupload', /yourupload/i], ['jawcloud', /jawcloud/i],
    ['streampe', /streampe/i], ['gvideo', /drive\.google|googlevideo/i],
    ['mega', /mega\.nz/i], ['wolfmax', /wolfmax/i]
  ];
  for (const [name, re] of patterns) {
    if (re.test(url)) return name;
  }
  return 'embed';
}

function solveSha256PoW(challenge, difficulty) {
  let nonce = 0;
  const target = '0'.repeat(difficulty);
  while (true) {
    const hash = crypto.createHash('sha256').update(challenge + nonce).digest('hex');
    if (hash.startsWith(target)) return nonce;
    nonce++;
  }
}

function parseTorrentInfoHash(buf) {
  try {
    const str = buf.toString('latin1');
    const infoStart = str.indexOf('4:info');
    if (infoStart < 0) return null;
    let i = infoStart + 5;
    const start = i;
    while (i < buf.length) {
      const c = String.fromCharCode(buf[i]);
      if (c === 'd') i++;
      else if (c === 'l') i++;
      else if (c === 'e') break;
      else if (c === 'i') { i = buf.indexOf('e'.charCodeAt(0), i); if (i < 0) return null; i++; }
      else if (c >= '0' && c <= '9') {
        const colon = buf.indexOf(':'.charCodeAt(0), i);
        if (colon < 0) return null;
        const len = parseInt(buf.toString('ascii', i, colon), 10);
        i = colon + 1 + len;
      } else i++;
    }
    const infoRaw = buf.slice(start, i);
    return crypto.createHash('sha1').update(infoRaw).digest('hex').toLowerCase();
  } catch { return null; }
}

async function downloadDontorrentTorrent(baseUrl, contentId, tabla) {
  try {
    const origin = new URL(baseUrl).origin;
    const domain = new URL(baseUrl).hostname;
    const cookie = anubisCookieCache.get(domain);
    async function powPost(action, body) {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(origin + '/api_validate_pow.php', {
        method: 'POST',
        headers: { 'User-Agent': UA, 'Content-Type': 'application/json', ...(cookie ? { 'Cookie': cookie } : {}) },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      clearTimeout(t);
      if (!res.ok) return null;
      return await res.json();
    }
    const gen = await powPost('generate', { action: 'generate', content_id: parseInt(contentId), tabla });
    if (!gen || !gen.success || !gen.challenge) return null;
    const nonce = solveSha256PoW(gen.challenge, 3);
    const val = await powPost('validate', { action: 'validate', challenge: gen.challenge, nonce });
    if (!val || !val.success || !val.download_url) return null;
    const dlUrl = val.download_url.startsWith('//') ? 'https:' + val.download_url
      : val.download_url.startsWith('/') ? origin + val.download_url
      : val.download_url;
    const ctrl3 = new AbortController();
    const t3 = setTimeout(() => ctrl3.abort(), 20000);
    const dlRes = await fetch(dlUrl, {
      headers: { 'User-Agent': UA, ...(cookie ? { 'Cookie': cookie } : {}) },
      signal: ctrl3.signal
    });
    clearTimeout(t3);
    if (!dlRes.ok) return null;
    const buf = Buffer.from(await dlRes.arrayBuffer());
    const infoHash = parseTorrentInfoHash(buf);
    if (!infoHash) return null;
    const filename = decodeURIComponent(dlUrl.split('/').pop()).replace(/\.torrent$/i, '');
    return { url: dlUrl, infoHash, filename };
  } catch { return null; }
}

module.exports = {
  fetchHTML, fetchJSON, similarity, resolveTMDB,
  searchProvider, getEpisodeUrl, extractVideos, detectServer,
  tryResolveEmbedToDirect
};
