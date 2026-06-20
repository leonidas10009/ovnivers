// utils.js - Shared utilities for local Hermes scrapers
// Optimized for Android: NO cheerio dependency, regex-only extraction
// Saves ~100KB+ RAM vs cheerio-based scrapers

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MAX_CONCURRENT = 3;
const FETCH_TIMEOUT = 8000;

async function fetchText(url, timeout = FETCH_TIMEOUT) {
  try {
    var ctrl = new AbortController();
    var t = setTimeout(function() { ctrl.abort(); }, timeout);
    var headers = { 'User-Agent': UA };
    try { headers['Referer'] = new URL(url).origin + '/'; } catch(e) {}
    var res = await fetch(url, { headers: headers, signal: ctrl.signal });
    clearTimeout(t);
    return res.ok || res.status === 404 ? await res.text() : null;
  } catch (e) { return null; }
}

function stripTags(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function matchAll(re, str) {
  var results = [];
  var m;
  while ((m = re.exec(str)) !== null) {
    results.push(m);
  }
  return results;
}

function extractIframeSrc(html, baseUrl) {
  var urls = [];
  var re = /<iframe[^>]+(?:src|data-src)=["']([^"']+)["']/gi;
  var m;
  while ((m = re.exec(html))) {
    var u = m[1];
    if (u.startsWith('//')) u = 'https:' + u;
    else if (u.startsWith('/')) u = baseUrl + u;
    if (u.startsWith('http')) urls.push(u);
  }
  return urls;
}

function extractAnchors(html, baseUrl, hrefPattern) {
  var urls = [];
  var re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  var m;
  while ((m = re.exec(html))) {
    var href = m[1];
    var text = stripTags(m[2]);
    if (hrefPattern && !hrefPattern.test(href)) continue;
    if (href.startsWith('//')) href = 'https:' + href;
    else if (href.startsWith('/')) href = baseUrl + href;
    if (href.startsWith('http')) urls.push({ url: href, text: text });
  }
  return urls;
}

function extractM3u8Mp4(html) {
  var urls = [];
  var re = /https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4)([^\s"'<>]*)/gi;
  var m;
  while ((m = re.exec(html))) {
    var u = m[0].replace(/[;,)"'}$]+$/, '').replace(/\\\//g, '/');
    if (u.indexOf('videoplayback') > -1 || u.match(/\.(m3u8|mp4)/i)) {
      urls.push(u);
    }
  }
  return urls;
}

function extractMagnetLinks(html) {
  var urls = [];
  var re = /(magnet:\?xt=urn:btih:[a-zA-Z0-9]+[^"'\s<>]*)/gi;
  var m;
  while ((m = re.exec(html))) {
    urls.push(m[1]);
  }
  return urls;
}

function extractTorrentLinks(html, baseUrl) {
  var urls = [];
  var re = /<a[^>]+href=["']([^"']+\.torrent[^"']*)["']/gi;
  var m;
  while ((m = re.exec(html))) {
    var u = m[1];
    if (u.startsWith('//')) u = 'https:' + u;
    else if (u.startsWith('/')) u = baseUrl + u;
    urls.push(u);
  }
  return urls;
}

function decodeBase64Url(val) {
  if (!val || val.length < 20) return null;
  if (val.startsWith('http')) return val;
  try {
    var dec = atob(val.replace(/-/g, '+').replace(/_/g, '/'));
    if (dec.startsWith('http://') || dec.startsWith('https://')) return dec;
  } catch (e) {}
  return null;
}

function cleanTitle(t) {
  return (t || '').toLowerCase()
    .replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

var STOP_WORDS = ['the', 'of', 'from', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'a', 'an',
  'de', 'el', 'la', 'los', 'las', 'del', 'en', 'un', 'una', 'que', 'es', 'por', 'para', 'con', 'se', 'su',
  'no', 'si', 'lo', 'ya', 'le', 'me', 'al', 'ha', 'he', 'we', 'ni'];

function splitWords(s) {
  return cleanTitle(s).split(' ').filter(function(w) { return w.length > 0; });
}

function wordOverlap(queryWords, titleWords) {
  var qSet = {};
  for (var i = 0; i < queryWords.length; i++) {
    var w = queryWords[i];
    if (STOP_WORDS.indexOf(w) === -1 && w.length >= 2) qSet[w] = true;
  }
  var tSet = {};
  for (var j = 0; j < titleWords.length; j++) {
    var tw = titleWords[j];
    if (STOP_WORDS.indexOf(tw) === -1 && tw.length >= 2) tSet[tw] = true;
  }
  var qKeys = Object.keys(qSet);
  var matched = 0;
  for (var k = 0; k < qKeys.length; k++) {
    if (tSet[qKeys[k]]) matched++;
  }
  return qKeys.length > 0 ? matched / qKeys.length : 0;
}

function scoreMatch(query, title) {
  var qw = splitWords(query);
  var tw = splitWords(title);
  if (qw.length === 0 || tw.length === 0) return 0;

  // Exact clean match
  var qClean = qw.join(' ');
  var tClean = tw.join(' ');
  if (qClean === tClean) return 1.0;
  if (tClean.indexOf(qClean) !== -1) return 0.85;

  // Word overlap score
  var overlap = wordOverlap(qw, tw);

  // Title start bonus
  var startBonus = 0;
  if (tw.length >= qw.length) {
    var allStart = true;
    for (var i = 0; i < Math.min(qw.length, 3); i++) {
      if (qw[i] !== tw[i]) { allStart = false; break; }
    }
    if (allStart) startBonus = 0.15;
  }

  return Math.min(1, overlap + startBonus);
}

function detectServer(url) {
  try {
    var h = (new URL(url)).hostname.replace('www.', '').replace(/\./g, ' ').toLowerCase();
    var servers = { streamwish: 'StreamWish', sfastwish: 'StreamWish', flaswish: 'StreamWish',
      filemoon: 'FileMoon', doodstream: 'DoodStream', mixdrop: 'MixDrop', 'voe sx': 'VOE',
      vidhide: 'VidHide', mp4upload: 'MP4Upload', streamtape: 'StreamTape', 'ok ru': 'OK',
      vidnode: 'VidNode', upstream: 'UpStream', 'netu tv': 'WaW', 'vidmoly': 'VidMoly',
      vtube: 'VTube', 'vk com': 'VK', mega: 'Mega', 'mediafire': 'Mediafire',
      'googleapis': 'Google', 'googlevideo': 'GoogleVideo', cloudflare: 'CF',
      'closeload': 'CloseLoad', 'embedo': 'Embedo', 'fembed': 'Fembed', 'gounlimited': 'Gounlimited',
      'yourupload': 'YourUpload', 'vidoza': 'Vidoza', 'streamlare': 'StreamLare',
      'player ru': 'Player', 'mail ru': 'MailRu', 'my mail': 'MailRu',
    };
    for (var key in servers) {
      if (h.indexOf(key) !== -1) return servers[key];
    }
    return h.split(' ')[0] || 'CDN';
  } catch (e) { return 'Unknown'; }
}

function makeStream(url, sourceName, serverName, quality) {
  return {
    url: url,
    name: (sourceName || 'Local') + '\n' + (serverName || 'Unknown'),
    title: (sourceName || '') + '\n\u2699\uFE0F ' + (serverName || url) + '\n' + (quality || 'HD'),
    behaviorHints: { notWebReady: !url.match(/\.(mp4|mp3|webm|ogg|ogv)(\?|$)/i) },
    server: serverName || detectServer(url),
    quality: quality || 'HD',
    source: sourceName || 'Local'
  };
}

// Concurrency pool for Android: max 3 parallel fetches
function runPool(asyncFns) {
  var results = [];
  var queue = asyncFns.slice();
  var running = 0;
  return new Promise(function(resolve) {
    function next() {
      while (running < MAX_CONCURRENT && queue.length > 0) {
        var fn = queue.shift();
        running++;
        fn().then(function(r) {
          if (r != null) { results.push(r); }
          running--;
          next();
        }).catch(function() { running--; next(); });
      }
      if (running === 0 && queue.length === 0) resolve(results);
    }
    next();
    if (queue.length === 0 && running === 0) resolve(results);
  });
}

function extractServerDivUrls(html) {
  var urls = [];
  var re = /<div[^>]*class="[^"]*server[^"]*"[^>]*>([^<]+)<\/div>/gi;
  var m;
  while ((m = re.exec(html))) {
    var u = m[1].trim();
    if (u && u.startsWith('http')) urls.push(u);
  }
  return urls;
}

function extractOnclickUrls(html) {
  var urls = [];
  // Match playVideo("url") or playVideo(&quot;url&quot;) — URL may contain & but ends at " or &quot;
  var re = /playVideo\s*\(\s*(?:&quot;|")\s*(https?:\/\/.+?)\s*(?:&quot;|")\s*\)/gi;
  var m;
  while ((m = re.exec(html))) {
    var u = m[1].trim();
    if (u && u.startsWith('http')) urls.push(u);
  }
  return urls;
}

module.exports = { fetchText, stripTags, matchAll, extractIframeSrc, extractAnchors,
  extractM3u8Mp4, extractMagnetLinks, extractTorrentLinks, extractServerDivUrls,
  extractOnclickUrls, decodeBase64Url, cleanTitle, scoreMatch, detectServer, makeStream, runPool, UA };
