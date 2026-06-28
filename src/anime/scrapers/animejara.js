const cheerio = require('cheerio-without-node-native') || require('cheerio');
const { getSessionMemory, getSmartAnalyzer } = require('../../intelligent');

const BASE = 'https://animejara.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

const mem = getSessionMemory();
mem.setCurrentDomain('animejara.com');
if (!mem.getDomainFingerprint('animejara.com')) {
  mem.recordAttempt('button.tab-btn', 'clickable', 'click', true, 3, ['embed', 'download'], 'animejara.com');
  mem.recordAttempt('button.tab-btn', 'clickable', 'click', false, 0, [], 'animejara.com');
  mem.recordAttempt('a.btn-dl', 'clickable', 'click', true, 1, ['embed'], 'animejara.com');
  mem.recordAttempt('a.btn-dl', 'clickable', 'click', false, 0, [], 'animejara.com');
  mem.recordAttempt('a.btn-dl', 'clickable', 'click', false, 0, [], 'animejara.com');
}

const ai = getSmartAnalyzer();

async function fetchText(url, timeout) {
  const ctrl = new AbortController();
  const t = setTimeout(function() { ctrl.abort(); }, timeout || 15000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(t);
    const html = await res.text();
    if (html && html.length > 1000) return html;
    return res.ok ? html : null;
  } catch { clearTimeout(t); return null; }
}

// ─── Scrape streamhj container page to extract individual server URLs ───
async function scrapeServerContainer(containerUrl, slug, ep) {
  const html = await fetchText(containerUrl, 10000);
  if (!html) return [];

  const results = [];

  // Extract iframe sources (each server tab loads a different iframe)
  const iframeRe = /<iframe[^>]+src="([^"]+)"/gi;
  let m;
  while ((m = iframeRe.exec(html)) !== null) {
    let src = m[1].replace(/&amp;/g, '&').replace(/&#038;/g, '&');
    src = src.replace(/&quot;.*$/, '').replace(/['\s)]+$/, '');
    if (!src.startsWith('http') || src === 'about:blank') continue;
    if (/google|facebook|discord|analytics/i.test(src)) continue;

    const serverName = ai.inferServerName(ai.extractDomain(src));
    if (!results.some(function(r) { return r.url === src; })) {
      results.push({
        url: src, server: serverName,
        name: 'AnimeJara\n' + serverName,
        title: slug + ' Ep.' + ep + '\n' + serverName,
        description: '',
        languages: ['ja'],
        behaviorHints: { notWebReady: true, bingeGroup: 'animejara|' + serverName.toLowerCase() },
      });
    }
  }

  // Extract onclick handler URLs — they use &quot; encoding like:
  // playVideo(&quot;https://hqq.tv/player/...&quot;)
  const onclickRe = /playVideo\(&quot;(https?:\/\/[^&]+)&quot;/gi;
  while ((m = onclickRe.exec(html)) !== null) {
    const url = m[1].replace(/&amp;/g, '&').replace(/&#038;/g, '&');
    if (!url.startsWith('http')) continue;
    if (results.some(function(r) { return r.url === url; })) continue;

    const serverName = ai.inferServerName(ai.extractDomain(url));
    results.push({
      url: url, server: serverName,
      name: 'AnimeJara\n' + serverName,
      title: slug + ' Ep.' + ep + '\n' + serverName,
      behaviorHints: { notWebReady: true, bingeGroup: 'animejara|' + serverName.toLowerCase() },
    });
  }

  // Extract embed/server URL patterns from text content
  const urlRe = /https?:\/\/[^"'\s<>]{10,200}/g;
  const allUrls = html.match(urlRe) || [];
  const embedDomains = /streamwish|filemoon|uqload|dood|mixdrop|voe|mp4upload|streamtape|yourupload|ok\.ru|mega|mediafire|hqq|netu|swhoi|burstcloud|sbembed|sbplay|fembed|upstream|vidhide|vidmoly|vidoza|cloudvideo|playhydrax|bysekoze|nyuu/i;
  allUrls.forEach(function(u) {
    let clean = u.replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/\\\//g, '/');
    clean = clean.replace(/&quot;.*$/, '').replace(/['\s)]+$/, '');
    if (!embedDomains.test(clean)) return;
    if (clean.includes('streamhj.top')) return;
    if (results.some(function(r) { return r.url === clean; })) return;

    const serverName = ai.inferServerName(ai.extractDomain(clean));
    results.push({
      url: clean, server: serverName,
      name: 'AnimeJara\n' + serverName,
      title: slug + ' Ep.' + ep + '\n' + serverName,
      behaviorHints: { notWebReady: true, bingeGroup: 'animejara|' + serverName.toLowerCase() },
    });
  });

  return results;
}

async function search(query) {
  const html = await fetchText(BASE + '/catalogo/?q=' + encodeURIComponent(query));
  if (!html) return [];
  const $ = cheerio.load(html);
  const results = [];
  $('.anime-card').each(function(_, el) {
    const title = $(el).find('.card-title').text().trim();
    const href = $(el).attr('href') || $(el).find('a').attr('href') || '';
    const slug = href.replace(/^https?:\/\/[^/]+\/(?:anime|movie)\//, '').replace(/^\/(?:anime|movie)\//, '').replace(/\/+$/, '');
    if (title && slug && slug.length < 100) {
      results.push({ title, slug, poster: $(el).find('img').attr('src') || '' });
    }
  });
  return results;
}

async function getStreams(slug, episode) {
  const epUrl = BASE + '/episode/' + slug + '-1x' + (episode || 1) + '/';
  const html = await fetchText(epUrl);
  if (!html) return [];

  const ep = episode || 1;
  const results = [];

  // Step 1: Extract iframe src from the episode page
  const iframeMatch = html.match(/<iframe[^>]+src="(https?:\/\/multiplayer\.streamhj\.top\/[^"]+)"/i);
  if (!iframeMatch) {
    // Fallback: Puppeteer
    try {
      const pptr = require('../../jkanime-puppeteer');
      return await pptr.resolveAnimeJara(slug, ep);
    } catch { return []; }
  }

  const containerUrl = iframeMatch[1].replace(/&amp;/g, '&').replace(/&#038;/g, '&');

  // Step 2: Scrape the container page to extract individual server URLs
  const servers = await scrapeServerContainer(containerUrl, slug, ep);

  // Step 3: Add download link if present
  const downloadMatch = html.match(/https?:\/\/descargas\.streamhj\.top\/[^"'\s<>]+/i);
  if (downloadMatch) {
    const dlUrl = downloadMatch[0].replace(/&amp;/g, '&').replace(/&#038;/g, '&');
    if (!results.some(function(r) { return r.url === dlUrl; })) {
      results.push({
        url: dlUrl, server: 'Descargas',
        name: 'AnimeJara\nDescargas',
        title: slug + ' Ep.' + ep + '\nDescargas',
        languages: ['ja'],
        behaviorHints: { notWebReady: true, bingeGroup: 'animejara|descargas' },
      });
    }
  }

  results.push(...servers);

  // Final dedup: normalize URLs to catch near-duplicates (with/without &quot;)
  const seen = new Set();
  return results.filter(function(s) {
    const key = (s.url || '').toLowerCase().replace(/\/+$/, '').replace(/&quot;.*$/, '').replace(/['\s)]+$/, '').split('?')[0];
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { search, getStreams, BASE };
