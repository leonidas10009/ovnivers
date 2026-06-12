const cheerio = require('cheerio');
const CryptoJS = require('crypto-js');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const TMDB_KEY = 'd80ba92bc7cefe3359668d30d06f3305';

async function fetchHTML(url, opts = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*', ...opts.headers },
      signal: AbortSignal.timeout(opts.timeout || 15000),
      ...opts
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function fetchJSON(url, opts = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json', ...opts.headers },
      signal: AbortSignal.timeout(opts.timeout || 15000),
      ...opts
    });
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
  const longerLen = longer.length;
  if (longerLen === 0) return 1;
  const bigrams = new Map();
  for (let i = 0; i < shorter.length - 1; i++) {
    const bigram = shorter.substring(i, i + 2);
    bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
  }
  let common = 0;
  for (let i = 0; i < longer.length - 1; i++) {
    const bigram = longer.substring(i, i + 2);
    const count = bigrams.get(bigram) || 0;
    if (count > 0) { common++; bigrams.set(bigram, count - 1); }
  }
  return (2.0 * common) / (longerLen + shorter.length - 2);
}

async function getTMDBInfo(tmdbId, mediaType) {
  const type = mediaType === 'tv' || mediaType === 'tvshow' ? 'tv' : 'movie';
  const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en`;
  const data = await fetchJSON(url);
  if (!data) return null;
  return {
    title: data.title || data.name || '',
    year: (data.release_date || data.first_air_date || '').substring(0, 4),
    imdbId: data.imdb_id || ''
  };
}

async function searchProvider(provider, title, year, mediaType) {
  const cfg = provider.search;
  if (!cfg) return null;

  let searchUrl;
  if (typeof cfg.url === 'function') {
    searchUrl = cfg.url(provider.baseUrl, title);
  } else {
    searchUrl = provider.baseUrl + cfg.url.replace('{query}', encodeURIComponent(title));
  }

  const html = await fetchHTML(searchUrl, { headers: cfg.headers });
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
      const titleEl = el.find(cfg.titleSelector).first();
      itemTitle = cfg.titleAttr ? titleEl.attr(cfg.titleAttr) || '' : titleEl.text().trim();
    }
    if (cfg.linkSelector) {
      const linkEl = el.find(cfg.linkSelector).first();
      itemLink = (linkEl.attr('href') || '').trim();
      if (itemLink && !itemLink.startsWith('http')) {
        itemLink = new URL(itemLink, provider.baseUrl).href;
      }
    }

    if (!itemTitle || !itemLink) continue;

    let score = similarity(itemTitle, title);
    if (year) {
      const itemYear = el.text().match(/\b(19|20)\d{2}\b/);
      if (itemYear && itemYear[0] === year) score += 0.2;
    }

    if (score > bestScore && score > 0.4) {
      bestScore = score;
      bestMatch = itemLink;
    }
  }

  return bestMatch;
}

async function getEpisodeUrl(provider, seriesUrl, season, episode) {
  const cfg = provider.episodes;
  if (!cfg) return seriesUrl;

  const html = await fetchHTML(seriesUrl);
  if (!html) return null;
  const $ = cheerio.load(html);

  if (cfg.type === 'post') {
    const formData = new URLSearchParams();
    formData.append(cfg.seasonParam || 'season', season);
    formData.append(cfg.episodeParam || 'episode', episode);
    if (cfg.extraParams) {
      for (const [k, v] of Object.entries(cfg.extraParams)) {
        formData.append(k, typeof v === 'function' ? v($, html) : v);
      }
    }
    const res = await fetch(cfg.url || seriesUrl, {
      method: 'POST',
      headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded', ...cfg.headers },
      body: formData.toString(),
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return null;
    const data = await res.text();
    const $$ = cheerio.load(data);
    const epLink = $$(cfg.episodeSelector).first().attr('href');
    return epLink ? new URL(epLink, provider.baseUrl).href : null;
  }

  if (cfg.type === 'season-list') {
    const seasonEls = $(cfg.seasonSelector).toArray();
    for (const sel of seasonEls) {
      const sNum = parseInt($(sel).text().match(/\d+/)?.[0] || '0');
      if (sNum === season) {
        const seasonUrl = $(sel).attr('href');
        if (seasonUrl) {
          const sHtml = await fetchHTML(new URL(seasonUrl, provider.baseUrl).href);
          if (sHtml) {
            const $$ = cheerio.load(sHtml);
            const epEls = $$(cfg.episodeSelector).toArray();
            for (const eel of epEls) {
              const eNum = parseInt($$(eel).text().match(/\d+/)?.[0] || '0');
              if (eNum === episode) {
                const epUrl = $$(eel).attr('href');
                return epUrl ? new URL(epUrl, provider.baseUrl).href : null;
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
        if (ep) return new URL(ep.url || ep.link, provider.baseUrl).href;
      } catch {}
    }
  }

  if (cfg.type === 'nextjs') {
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        let obj = data;
        for (const key of cfg.dataPath.split('.')) {
          obj = obj?.[key];
        }
        if (obj?.seasons) {
          for (const s of obj.seasons) {
            if (s.number == season) {
              const ep = s.episodes?.find(e => e.number == episode);
              if (ep?.url) return new URL(ep.url, provider.baseUrl).href;
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
      const src = $(iframe).attr(cfg.srcAttr || 'src');
      if (src) {
        const url = src.startsWith('//') ? 'https:' + src : src;
        results.push({ url, server: detectServer(url), quality: cfg.defaultQuality || 'HD' });
      }
    }
  }

  if (cfg.type === 'nextjs') {
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
    if (!match) {
      const match2 = html.match(/<script type="application\/json"[^>]*>(.*?)<\/script>/);
      if (match2) {
        try {
          const data = JSON.parse(match2[1]);
          let obj = data;
          for (const key of cfg.dataPath.split('.')) obj = obj?.[key];
          if (obj) {
            for (const [lang, players] of Object.entries(obj)) {
              if (Array.isArray(players)) {
                for (const p of players) {
                  results.push({
                    url: p.result || p.url || p.link,
                    server: p.cyberlocker || p.server || detectServer(p.result || p.url),
                    quality: p.quality || cfg.defaultQuality || 'HD',
                    lang
                  });
                }
              }
            }
          }
        } catch {}
      }
    } else {
      try {
        const data = JSON.parse(match[1]);
        let obj = data;
        for (const key of cfg.dataPath.split('.')) obj = obj?.[key];
        if (obj) {
          for (const [lang, players] of Object.entries(obj)) {
            if (Array.isArray(players)) {
              for (const p of players) {
                results.push({
                  url: p.result || p.url || p.link,
                  server: p.cyberlocker || p.server || detectServer(p.result || p.url),
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
          const url = Array.isArray(v) ? v[1] : v.url || v.link || v.code;
          if (url) {
            results.push({
              url,
              server: server || detectServer(url),
              quality: v.quality || cfg.defaultQuality || 'HD'
            });
          }
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
        results.push({
          url: s.url || s.file || s.link || s.src,
          server: s.server || detectServer(s.url || s.file),
          quality: s.quality || s.label || cfg.defaultQuality || 'HD'
        });
      }
    }
  }

  if (cfg.type === 'torrent') {
    const links = $(cfg.linkSelector || 'a[href*="magnet"], a[href*=".torrent"]').toArray();
    for (const link of links) {
      const href = $(link).attr('href');
      if (href && (href.startsWith('magnet:') || href.endsWith('.torrent'))) {
        const title = $(link).text().trim() || cfg.defaultQuality || 'HD';
        results.push({
          url: href,
          server: 'torrent',
          quality: title
        });
      }
    }
  }

  return results;
}

function detectServer(url) {
  if (!url) return 'direct';
  const patterns = {
    'streamwish': /streamwish\./i,
    'filemoon': /filemoon\./i,
    'voes': /voes\./i,
    'doodstream': /dood\.|doodstream\./i,
    'streamtape': /streamtape\./i,
    'fembed': /fembed\.|fembeds\./i,
    'okru': /ok\.ru|odnoklassniki/i,
    'mixdrop': /mixdrop\./i,
    'upstream': /upstream\./i,
    'vidhide': /vidhide|vidpro/i,
    'voe': /voe\.sx|voe\./i,
    'wolfmax': /wolfmax\./i,
    'mega': /mega\.nz/i,
    'gvideo': /drive\.google\.|googlevideo/i,
    'youtube': /youtube\.|youtu\.be/i,
    'mystream': /mystream\./i,
    'netutv': /netu\.tv|netutv/i,
    'yourupload': /yourupload\./i,
    'jawcloud': /jawcloud\./i,
    'streampe': /streampe\./i,
    'directo': /\.mp4|\.m3u8|\.mkv|\.webm|\.avi/i,
    'torrent': /magnet:|\btorrent\b/i
  };
  for (const [name, pattern] of Object.entries(patterns)) {
    if (pattern.test(url)) return name;
  }
  return 'unknown';
}

async function resolveVideoUrl(url, server) {
  if (!url) return null;
  if (/\.(mp4|m3u8|mkv|webm|avi)(\?|$)/i.test(url)) return url;
  if (url.startsWith('magnet:')) return url;

  const resolvers = {
    'streamwish': resolveStreamwish,
    'filemoon': resolveFilemoon,
    'voes': resolveVoes,
    'doodstream': resolveDoodstream,
    'streamtape': resolveStreamtape,
    'fembed': resolveFembed,
    'okru': resolveOkru,
    'mixdrop': resolveMixdrop,
    'upstream': resolveUpstream,
    'vidhide': resolveVidhide,
    'voe': resolveVoe,
    'mystream': resolveMystream,
    'netutv': resolveNetuTV,
    'yourupload': resolveYourUpload,
    'jawcloud': resolveJawcloud,
    'streampe': resolveStreampe,
    'gvideo': resolveGvideo,
    'directo': url => url
  };

  const resolver = resolvers[server] || resolvers[detectServer(url)] || resolveGeneric;
  try {
    return await resolver(url);
  } catch { return null; }
}

async function resolveStreamwish(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/file:\s*"([^"]+)"/) || html.match(/src:\s*"([^"]+)"/);
  return match?.[1] || null;
}

async function resolveFilemoon(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/file:\s*"([^"]+)"/) || html.match(/src:\s*"([^"]+)"/);
  return match?.[1] || null;
}

async function resolveVoes(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveDoodstream(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/\$\.get\('([^']+)'/);
  if (match) {
    const passUrl = new URL(match[1], url).href;
    const data = await fetchHTML(passUrl);
    if (data) return data.trim();
  }
  const directMatch = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return directMatch?.[1] || null;
}

async function resolveStreamtape(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/robotlink'\s*\.\s*innerHTML\s*=\s*'([^']+)'/);
  if (match) {
    const token = match[1].replace(/&amp;/g, '&');
    const fullUrl = 'https:/' + token;
    const data = await fetchHTML(fullUrl);
    if (data) {
      const vidMatch = data.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || data.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
      return vidMatch?.[1] || null;
    }
  }
  return null;
}

async function resolveFembed(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveOkru(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveMixdrop(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveUpstream(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveVidhide(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/file:\s*"([^"]+)"/) || html.match(/src:\s*"([^"]+)"/);
  return match?.[1] || null;
}

async function resolveVoe(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveMystream(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveNetuTV(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveYourUpload(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveJawcloud(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveStreampe(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.m3u8[^"]*)"/) || html.match(/src:\s*"([^"]+\.mp4[^"]*)"/);
  return match?.[1] || null;
}

async function resolveGvideo(url) {
  const match = url.match(/\/d\/([^/]+)/);
  if (match) {
    const confirm = await fetchHTML(`https://drive.google.com/uc?export=download&id=${match[1]}`);
    if (confirm) {
      const dlMatch = confirm.match(/href="(\/uc\?export=download[^"]+)"/);
      if (dlMatch) return `https://drive.google.com${dlMatch[1].replace(/&amp;/g, '&')}`;
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return url;
}

async function resolveGeneric(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const match = html.match(/src:\s*"([^"]+\.(?:m3u8|mp4|mkv|webm)[^"]*)"/)
    || html.match(/file:\s*"([^"]+)"/)
    || html.match(/source\s+src="([^"]+)"/)
    || html.match(/videoSrc\s*=\s*"([^"]+)"/);
  return match?.[1] || null;
}

module.exports = {
  fetchHTML, fetchJSON, similarity, getTMDBInfo,
  searchProvider, getEpisodeUrl, extractVideos, resolveVideoUrl, detectServer
};
