const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const EMBED_TIMEOUT = 10000;

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

async function htmlText(url, opts = {}) {
  try {
    const res = await fetchWithTimeout(url, {
      headers: { 'Accept': 'text/html,application/xhtml+xml,*/*', ...opts.headers },
      timeout: opts.timeout || EMBED_TIMEOUT
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

// ─── Domain-specific resolvers ──────────────

async function resolveStreamwish(html, url) {
  const dataMatch = html.match(/const\s+_0xa\w*\s*=\s*(\{[^}]+\})/);
  if (dataMatch) {
    try {
      const obj = JSON.parse(dataMatch[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":'));
      const keys = Object.values(obj);
      for (const key of keys) {
        if (typeof key === 'string' && key.length > 20 && /^[A-Za-z0-9+/=]+$/.test(key) && !key.startsWith('http')) {
          try { const d = Buffer.from(key, 'base64').toString(); if (d.includes('m3u8') || d.includes('mp4')) return d; } catch {}
        }
      }
    } catch {}
  }

  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];

  const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
  if (mp4) return mp4[0];

  const evalMatch = html.match(/eval\s*\(([^)]+)\)/);
  if (evalMatch) {
    try {
      const decoded = Buffer.from(evalMatch[1].replace(/['"]/g, ''), 'base64').toString();
      const m = decoded.match(/https?:\/\/[^"'\\]+\.m3u8[^"'\\]*/);
      if (m) return m[0];
    } catch {}
  }

  return null;
}

async function resolveFilemoon(html, url) {
  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];
  const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
  if (mp4) return mp4[0];

  const jsMatch = html.match(/"file"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/i);
  if (jsMatch) return jsMatch[1];

  return null;
}

async function resolveDoodstream(html, url) {
  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];

  const passMatch = html.match(/\$.get\('([^']+pass_md5[^']*\.d00dmedia[^']*)'/i);
  if (passMatch) {
    const tokenHtml = await htmlText(passMatch[1].startsWith('http') ? passMatch[1] : new URL(passMatch[1], url).href, {
      headers: { 'Referer': url }
    });
    if (tokenHtml) {
      const m = tokenHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
      if (m) return m[0];
      const parts = tokenHtml.split(' ');
      for (const p of parts) {
        if (p.match(/\.(?:m3u8|mp4)/i) && p.includes('http')) return p.replace(/^[^h]*/, '').trim();
      }
    }
  }

  const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
  if (mp4) return mp4[0];

  return null;
}

async function resolveMixdrop(html, url) {
  const mdMatch = html.match(/"poster"\s*:\s*"[^"]+","wurl"\s*:\s*"([^"]+)"/);
  if (mdMatch) return mdMatch[1].replace(/\\\//g, '/');

  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];

  return null;
}

async function resolveVoeSx(html, url) {
  const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
  if (mp4) return mp4[0];

  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];

  const evalMatch = html.match(/<script>\s*tm\s*=\s*('(?:\\.|[^'\\])*')/);
  if (evalMatch) {
    try { const s = evalMatch[1].slice(1, -1); const m = s.match(/https?:\/\/[^"'\\]+\.(?:m3u8|mp4)[^"'\\]*/); if (m) return m[0]; } catch {}
  }

  return null;
}

async function resolveVidHide(html, url) {
  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];

  const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
  if (mp4) return mp4[0];

  return null;
}

async function resolveOkRu(html, url) {
  const jsMatch = html.match(/data-options="([^"]+)"/);
  if (jsMatch) {
    try {
      const opts = JSON.parse(jsMatch[1].replace(/&quot;/g, '"'));
      const vLink = opts.flashvars?.metadataUrl || '';
      if (vLink) {
        const vHtml = await htmlText(vLink, { headers: { 'Referer': 'https://ok.ru/' } });
        if (vHtml) {
          const js = vHtml.match(/<script>\s*tm\s*=\s*('(?:\\.|[^'\\])*')/);
          if (js) {
            try { const s = js[1].slice(1, -1); const m = s.match(/https?:\/\/[^"'\\]+\.(?:m3u8|mp4)[^"'\\]*/); if (m) return m[0]; } catch {}
          }
          const m3 = vHtml.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
          if (m3) return m3[0];
        }
      }
    } catch {}
  }
  return null;
}

async function resolveMp4Upload(html, url) {
  // Direct mp4 URL: https://a4.mp4upload.com:183/d/xxxxx
  const direct = html.match(/https?:\/\/a\d+\.mp4upload\.com:\d+\/d\/[a-zA-Z0-9]+/i);
  if (direct) return direct[0];

  // Fallback: generic m3u8/mp4 (filter out js/css)
  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8 && !m3u8[0].includes('videojs') && !m3u8[0].includes('css') && !m3u8[0].includes('.js')) return m3u8[0];

  return null;
}

async function resolveStreamtapeV2(html, url) {
  // Format 1: ideoolink div with direct URL (fetch with session)
  var ideoDiv = html.match(/id="ideoolink"[^>]*>([^<]+)<\/div>/);
  if (ideoDiv && ideoDiv[1]) {
    var path = ideoDiv[1].trim();
    if (path.startsWith('/')) path = path.substring(1);
    var fullUrl = 'https://' + path + '&stream=1';
    var vHtml = await htmlText(fullUrl, {
      headers: { 'Referer': url },
      timeout: EMBED_TIMEOUT
    });
    if (vHtml) {
      var m = vHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
      if (m) return m[0];
      var link = vHtml.match(/"link"\s*:\s*"([^"]+)"/);
      if (link) return link[1].replace(/\\\//g, '/');
    }
    // Fallback: try without stream=1
    fullUrl = fullUrl.replace('&stream=1', '');
    var vHtml2 = await htmlText(fullUrl, {
      headers: { 'Referer': url },
      timeout: EMBED_TIMEOUT
    });
    if (vHtml2) {
      var m2 = vHtml2.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
      if (m2) return m2[0];
    }
  }

  // Format 2: botlink div
  var botDiv = html.match(/id="botlink"[^>]*>([^<]+)<\/div>/);
  if (botDiv && botDiv[1]) {
    var botPath = botDiv[1].trim();
    if (botPath.startsWith('/')) botPath = botPath.substring(1);
    var botVHtml = await htmlText('https://' + botPath, { headers: { 'Referer': url }, timeout: EMBED_TIMEOUT });
    if (botVHtml) {
      var botVid = botVHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
      if (botVid) return botVid[0];
    }
  }

  return null;
}

async function resolveStreamwishV2(html, url) {
  // Try extracting data object with encoded URLs
  const dataMatch = html.match(/const\s+_0x\w*\s*=\s*(\{[^}]+\})/);
  if (dataMatch) {
    try {
      const obj = JSON.parse(dataMatch[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":'));
      const keys = Object.values(obj);
      for (const key of keys) {
        if (typeof key === 'string' && key.length > 20 && /^[A-Za-z0-9+/=]+$/.test(key) && !key.startsWith('http')) {
          try { const d = Buffer.from(key, 'base64').toString(); if (d.includes('m3u8') || d.includes('mp4')) return d; } catch {}
        }
      }
    } catch {}
  }

  // Try eval unpacking
  const packMatch = html.match(/eval\s*\(\s*function\s*\([^)]*\)\s*\{[^}]*return p\s*\}\([^)]+\)\)/);
  if (packMatch) {
    const js = packs ? packs.unpack(packMatch[0]) : null;
    if (js) {
      const m = js.match(/https?:\/\/[^"'\\]+\.(?:m3u8|mp4)[^"'\\]*/);
      if (m) return m[0];
    }
  }

  // Direct m3u8/mp4
  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];

  const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
  if (mp4) return mp4[0];

  return null;
}

// New MixDrop V2 handler with MDCore refs
async function resolveMixdropV2(html, url) {
  // MDCore.ref pattern (new format)
  const refMatch = html.match(/MDCore\.ref\s*=\s*["']([^"']+)["']/);
  if (refMatch) {
    const ref = refMatch[1];
    // Construct direct URL
    const directUrl = 'https://mxcontent.com/e/' + ref;
    const vHtml = await htmlText(directUrl, { headers: { 'Referer': url } });
    if (vHtml) {
      const m = vHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
      if (m) return m[0];
    }
  }

  // Old wurl format
  const wurlMatch = html.match(/"poster"\s*:\s*"[^"]+","wurl"\s*:\s*"([^"]+)"/);
  if (wurlMatch) return wurlMatch[1].replace(/\\\//g, '/');

  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];

  return null;
}

async function resolveUpstream(html, url) {
  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];

  const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
  if (mp4) return mp4[0];

  return null;
}

async function resolveNetuTv(html, url) {
  const evalMatch = html.match(/eval\s*\(([^)]+)\)/);
  if (evalMatch) {
    try {
      const decoded = Buffer.from(evalMatch[1].replace(/['"]/g, ''), 'base64').toString();
      const m = decoded.match(/https?:\/\/[^"'\\]+\.(?:m3u8|mp4)[^"'\\]*/);
      if (m) return m[0];
    } catch {}
  }

  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];

  return null;
}

async function resolveVidmoly(html, url) {
  const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
  if (m3u8) return m3u8[0];

  const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
  if (mp4) return mp4[0];

  return null;
}

// ─── JWPlayer ────────────────────────────────

async function tryResolveJWPlayer(html, referer) {
  const scripts = [];
  const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const text = m[1];
    if (text.length > 10) scripts.push(text);
  }

  for (const script of scripts) {
    if (!script.includes('jwplayer') && !script.includes('sources') && !script.includes('playlist')) continue;

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
            if (item.sources && Array.isArray(item.sources) && item.sources.length > 0) return item.sources[0].file;
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
            if (item.sources && Array.isArray(item.sources) && item.sources.length > 0) return item.sources[0].file;
            if (item.file) return item.file;
          }
        }
      } catch {}
    }
  }

  return null;
}

// ─── Generic fallback ────────────────────────

async function tryResolveGeneric(embedUrl, referer) {
  const html = await htmlText(embedUrl, {
    headers: { 'Referer': referer || embedUrl }
  });
  if (!html) return null;

  const jwUrl = await tryResolveJWPlayer(html, referer);
  if (jwUrl) return jwUrl.startsWith('//') ? 'https:' + jwUrl : jwUrl;

  const patterns = [
    /https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i,
    /https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i,
  ];
  for (const p of patterns) {
    const match = html.match(p);
    if (match) return match[0];
  }

  const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeMatch) {
    const iframeUrl = iframeMatch[1].startsWith('//') ? 'https:' + iframeMatch[1] : iframeMatch[1];
    if (iframeUrl !== embedUrl && iframeUrl !== referer) {
      return await resolveEmbed(iframeUrl, embedUrl);
    }
  }

  return null;
}

// ─── Main resolver ───────────────────────────

function getHostname(url) {
  try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
}

async function resolveEmbed(embedUrl, referer) {
  if (!embedUrl) return null;
  if (embedCache.has(embedUrl)) return embedCache.get(embedUrl) || null;

  const host = getHostname(embedUrl);
  let html = null;
  let result = null;

  const hostRules = [
    { pat: /streamwish|wish\.com|swdyu|sfastwish|wishembed|wishy|watchwish/i, fn: resolveStreamwishV2, needHtml: true },
    { pat: /filemoon|filemoon\.sx|kerapoxy|moplay|moon\.sx|moonplayer/i, fn: resolveFilemoon, needHtml: true },
    { pat: /filelions|filelions\.top/i, fn: tryResolveJWPlayer, needHtml: true },
    { pat: /uqload|uqload\.com/i, fn: tryResolveJWPlayer, needHtml: true },
    { pat: /dood\.|doodstream|dood\.la|dood\.to|dood\.ws|dood\.wf|dood\.re|dood\.so|dood\.sh|dood\.pm|dood\.yt|dooood|ds2play/i, fn: resolveDoodstream, needHtml: true },
    { pat: /mixdrop|mixdrop\.co|mixdrop\.ag|mixdrop\.vc|mixdrop\.to|mixdrop\.ch|mixdrop\.gl|mixdrp|mxdrop/i, fn: resolveMixdropV2, needHtml: true },
    { pat: /voe\.sx|voe\.su|vidvodo|voe\.to|voeunblock/i, fn: resolveVoeSx, needHtml: true },
    { pat: /vidhide|vidpro|vidmoly\.to|vidguard|vid2v11/i, fn: resolveVidHide, needHtml: true },
    { pat: /ok\.ru|odnoklassniki/i, fn: resolveOkRu, needHtml: true },
    { pat: /streamtape|strtape|stape\.with|streamta\.to|stpete|tapecontent|streamtape\.com/i, fn: resolveStreamtapeV2, needHtml: true },
    { pat: /mp4upload|mp4upload\.com/i, fn: resolveMp4Upload, needHtml: true },
    { pat: /upstream\.to|uptostream|uptobox|upstreamcdn/i, fn: resolveUpstream, needHtml: true },
    { pat: /netu\.tv|netutv|anavids|waaw\.tv|hqq\.tv|waaw1|netuplayer/i, fn: resolveNetuTv, needHtml: true },
    { pat: /vidmoly|vidmoly\.to|vidmoly\.net|moly\.to/i, fn: resolveVidmoly, needHtml: true },
    { pat: /hgcloud|hgcloud\.to/i, fn: null, needHtml: false },
    { pat: /krakenfiles|krakenfiles\.com/i, fn: null, needHtml: false },
    { pat: /vidoza|vidoza\.net|vidozahd/i, fn: null, needHtml: false },
    { pat: /vidlox|vidlox\.tv|vidlox\.net/i, fn: null, needHtml: false },
    { pat: /wolfstream|wolfmax|stream\.wolfmax/i, fn: null, needHtml: false },
    { pat: /streamlare|streamlare\.com/i, fn: null, needHtml: false },
    { pat: /jawcloud|jaw\.cloud/i, fn: null, needHtml: false },
    { pat: /vudeo|vudeo\.net/i, fn: null, needHtml: false },
    { pat: /cloudvideo|cloudvideo\.tv|vidcloud/i, fn: null, needHtml: false },
  ];

  for (const rule of hostRules) {
    if (rule.pat.test(host)) {
      if (rule.needHtml) {
        html = html || await htmlText(embedUrl, { headers: { 'Referer': referer || embedUrl } });
        if (!html) { embedCache.set(embedUrl, null); return null; }
      }
      if (rule.fn) {
        result = await rule.fn(html || '', embedUrl);
        if (result) { result = result.startsWith('//') ? 'https:' + result : result; embedCache.set(embedUrl, result); return result; }
      }
      break;
    }
  }

  html = html || await htmlText(embedUrl, { headers: { 'Referer': referer || embedUrl } });
  if (html) {
    result = await tryResolveGeneric(embedUrl, referer);
    if (!result) {
      const jw = await tryResolveJWPlayer(html, referer);
      result = jw ? (jw.startsWith('//') ? 'https:' + jw : jw) : null;
    }
  }

  if (result) result = result.startsWith('//') ? 'https:' + result : result;
  embedCache.set(embedUrl, result || null);
  return result;
}

function isDirectVideoUrl(url) {
  if (!url) return false;
  if (/\.(m3u8|mp4|mkv|webm|avi|ts|mov)(\?|$)/i.test(url)) return true;
  if (/mp4upload\.com:\d+\/d\//i.test(url)) return true;
  if (/\/hls\//i.test(url)) return true;
  if (/streamtape\.com\/get_video/i.test(url)) return true;
  return false;
}

function clearCache() {
  embedCache.clear();
}

module.exports = { resolveEmbed, tryResolveJWPlayer, tryResolveGeneric, clearCache, isDirectVideoUrl };
