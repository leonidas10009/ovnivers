const cheerio = require('cheerio-without-node-native') || require('cheerio');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const EMBED_TIMEOUT = 8000;

const embedCache = new Map();

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeout || EMBED_TIMEOUT);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, ...opts.headers },
      signal: ctrl.signal,
      redirect: 'follow'
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function tryResolveYouTube(ytId) {
  if (!ytId) return null;
  try {
    const res = await fetchWithTimeout(`https://www.youtube.com/watch?v=${encodeURIComponent(ytId)}`, {
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/ytInitialPlayerResponse\s*=\s*({.*?});/);
    if (!match) return null;
    const data = JSON.parse(match[1]);
    const sd = data.streamingData;
    if (!sd) return null;

    const candidates = [];
    if (sd.formats) {
      for (const f of sd.formats) {
        if (f.url) candidates.push({ url: f.url, quality: f.qualityLabel || f.quality, bitrate: f.bitrate });
      }
    }
    if (sd.adaptiveFormats) {
      for (const f of sd.adaptiveFormats) {
        if (f.url && f.mimeType && f.mimeType.startsWith('video')) {
          candidates.push({ url: f.url, quality: f.qualityLabel || f.quality, bitrate: f.bitrate });
        }
      }
    }
    if (candidates.length === 0) return null;
    candidates.sort((a, b) => (parseInt(b.bitrate) || 0) - (parseInt(a.bitrate) || 0));
    return candidates[0].url;
  } catch { return null; }
}

async function tryResolveJWPlayer(html, referer) {
  const $ = cheerio.load(html);
  const scripts = [];
  $('script').each((i, el) => {
    const text = $(el).html() || '';
    if (text.length > 10) scripts.push(text);
  });

  for (const script of scripts) {
    if (!script.includes('jwplayer') && !script.includes('sources') && !script.includes('playlist')) continue;

    const sourcesMatch = script.match(/sources\s*:\s*(\[[\s\S]*?\])\s*\};/);
    if (sourcesMatch) {
      try {
        const sources = JSON.parse(sourcesMatch[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
        if (Array.isArray(sources)) {
          const sorted = sources.filter(s => s.file).sort((a, b) => {
            const aLabel = (a.label || '').match(/(\d+)/);
            const bLabel = (b.label || '').match(/(\d+)/);
            return (parseInt(bLabel?.[1]) || 0) - (parseInt(aLabel?.[1]) || 0);
          });
          if (sorted.length > 0) return sorted[0].file;
        }
      } catch {}
    }

    const fileMatch = script.match(/["']file["']\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
    if (fileMatch) return fileMatch[1];

    const setupMatch = script.match(/jwplayer\s*\(\s*["'][^"']*["']\s*\)\s*\.\s*setup\s*\(\s*(\{[\s\S]*?\})\s*\)\s*;/);
    if (setupMatch) {
      try {
        const config = JSON.parse(
          setupMatch[1]
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
            .replace(/'/g, '"')
        );
        if (config.sources && Array.isArray(config.sources)) {
          const sorted = config.sources.filter(s => s.file).sort((a, b) => {
            const aLabel = (a.label || '').match(/(\d+)/);
            const bLabel = (b.label || '').match(/(\d+)/);
            return (parseInt(bLabel?.[1]) || 0) - (parseInt(aLabel?.[1]) || 0);
          });
          if (sorted.length > 0) return sorted[0].file;
        }
        if (config.playlist && Array.isArray(config.playlist)) {
          for (const item of config.playlist) {
            if (item.sources && Array.isArray(item.sources) && item.sources.length > 0) {
              return item.sources[0].file;
            }
            if (item.file) return item.file;
          }
        }
        if (config.file) return config.file;
      } catch {}
    }

    const playlistMatch = script.match(/playlist\s*:\s*(\[[\s\S]*?\])\s*\}/);
    if (playlistMatch) {
      try {
        const playlist = JSON.parse(playlistMatch[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
        if (Array.isArray(playlist)) {
          for (const item of playlist) {
            if (item.sources && Array.isArray(item.sources) && item.sources.length > 0) {
              return item.sources[0].file;
            }
            if (item.file) return item.file;
          }
        }
      } catch {}
    }
  }

  return null;
}

async function tryResolveFastream(embedUrl, referer) {
  try {
    const res = await fetchWithTimeout(embedUrl, {
      headers: {
        'User-Agent': UA,
        'Referer': referer || embedUrl,
        'Accept': 'text/html,application/xhtml+xml,*/*'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();

    const jwUrl = await tryResolveJWPlayer(html, referer);
    if (jwUrl) return jwUrl.startsWith('//') ? 'https:' + jwUrl : jwUrl;

    const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
    if (m3u8) return m3u8[0];

    const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
    if (mp4) return mp4[0];

    const vidSrc = html.match(/<source[^>]+src=["']([^"']+)["']/i);
    if (vidSrc) return vidSrc[1];

    const regexSrc = html.match(/["'](?:src|file|url)["']\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
    if (regexSrc) return regexSrc[1];

    return null;
  } catch {
    return null;
  }
}

async function tryResolveGeneric(embedUrl, referer) {
  try {
    const res = await fetchWithTimeout(embedUrl, {
      headers: {
        'User-Agent': UA,
        'Referer': referer || embedUrl,
        'Accept': 'text/html,application/xhtml+xml,*/*'
      }
    });
    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('video') || contentType.includes('octet-stream') || contentType.includes('mpegurl')) {
      return embedUrl;
    }

    const html = await res.text();

    const jwUrl = await tryResolveJWPlayer(html, referer);
    if (jwUrl) return jwUrl.startsWith('//') ? 'https:' + jwUrl : jwUrl;

    const directPatterns = [
      /https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i,
      /https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i,
      /["'](?:src|file|url)["']\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i,
      /<source[^>]+src=["']([^"']+)["']/i,
      /<iframe[^>]+src=["']([^"']+)["']/i
    ];

    for (const pattern of directPatterns) {
      const match = html.match(pattern);
      if (match) {
        let url = match[1] || match[0];
        if (url.startsWith('//')) url = 'https:' + url;
        if (/\.(m3u8|mp4)/i.test(url)) return url;
      }
    }

    const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch) {
      const iframeUrl = iframeMatch[1].startsWith('//') ? 'https:' + iframeMatch[1] : iframeMatch[1];
      if (iframeUrl !== embedUrl) {
        return await tryResolveGeneric(iframeUrl, embedUrl);
      }
    }

    return null;
  } catch {
    return null;
  }
}

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com|youtu\.be)\/(?:embed\/|watch\?v=|v\/|)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

async function resolveEmbed(embedUrl, referer) {
  if (!embedUrl || embedCache.has(embedUrl)) return embedCache.get(embedUrl) || null;

  const ytId = extractYouTubeId(embedUrl);
  if (ytId) {
    const ytUrl = await tryResolveYouTube(ytId);
    if (ytUrl) {
      embedCache.set(embedUrl, ytUrl);
      return ytUrl;
    }
  }

  const hostname = (() => { try { return new URL(embedUrl).hostname; } catch { return ''; } })();

  let result = null;
  if (hostname.includes('fastream') || hostname.includes('fastream')) {
    result = await tryResolveFastream(embedUrl, referer);
  }

  if (!result) {
    result = await tryResolveGeneric(embedUrl, referer);
  }

  if (result && result.startsWith('//')) result = 'https:' + result;

  embedCache.set(embedUrl, result || null);
  return result;
}

function clearCache() {
  embedCache.clear();
}

module.exports = { resolveEmbed, tryResolveYouTube, tryResolveJWPlayer, tryResolveFastream, tryResolveGeneric, clearCache };
