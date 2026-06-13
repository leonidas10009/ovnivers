const cheerio = require('cheerio-without-node-native') || require('cheerio');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';

async function fetchHTML(url, opts = {}) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), opts.timeout || 12000);
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,*/*', ...opts.headers },
      signal: ctrl.signal
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function fetchJSON(url, opts = {}) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), opts.timeout || 10000);
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
    return await fetchHTML(searchUrl, { headers: cfg.headers, timeout: 10000 });
  }

  // Try full title first, then fallback to first significant word(s)
  let html = await trySearch(titleClean);
  if (!html && titleClean.includes(' ')) {
    const short = titleClean.split(' ').slice(0, 2).join(' ');
    if (short.length > 3) html = await trySearch(short);
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

  return seriesUrl;
}

async function extractVideos(provider, pageUrl) {
  const cfg = provider.videos;
  if (!cfg) return [];

  const html = await fetchHTML(pageUrl);
  if (!html) return [];
  const $ = cheerio.load(html);
  const results = [];

  if (cfg.type === 'iframe') {
    const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
    const iframes = container.find(cfg.iframeSelector || 'iframe').toArray();
    for (const iframe of iframes) {
      const src = $(iframe).attr(cfg.srcAttr || 'src') || $(iframe).attr('data-src');
      if (src) {
        const url = src.startsWith('//') ? 'https:' + src : src;
        results.push({ url, server: detectServer(url), quality: cfg.defaultQuality || 'HD' });
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
        const videos = JSON.parse(match[1]);
        for (const v of videos) {
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
    const links = $(cfg.linkSelector || 'a[href*="magnet:"], a[href$=".torrent"]').toArray();
    for (const link of links) {
      const href = $(link).attr('href');
      if (href && (href.startsWith('magnet:') || href.endsWith('.torrent'))) {
        const label = $(link).text().trim() || '';
        const infoHashMatch = href.match(/urn:btih:([a-fA-F0-9]{40})/i);
        const qualityMatch = label.match(/\b(4K|2160p?|1080p?|720p?|480p?)\b/i);
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
          url: href,
          server: 'torrent',
          quality: (qualityMatch ? qualityMatch[1] : '') || cfg.defaultQuality || 'HD',
          ...(infoHashMatch ? { infoHash: infoHashMatch[1].toLowerCase() } : {}),
          ...(sources.length ? { sources } : {}),
          ...(label ? { filename: label } : {})
        });
      }
    }
  }

  return results;
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
    ['mega', /mega\.nz/i], ['wolfmax', /wolfmax/i], ['youtube', /youtube|youtu\.be/i]
  ];
  for (const [name, re] of patterns) {
    if (re.test(url)) return name;
  }
  return 'embed';
}

module.exports = {
  fetchHTML, fetchJSON, similarity, resolveTMDB,
  searchProvider, getEpisodeUrl, extractVideos, detectServer
};
