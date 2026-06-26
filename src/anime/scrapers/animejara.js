const cheerio = require('cheerio-without-node-native') || require('cheerio');
const { getSessionMemory } = require('../../intelligent');

const BASE = 'https://animejara.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

const mem = getSessionMemory();
mem.setCurrentDomain('animejara.com');
if (!mem.getDomainFingerprint('animejara.com')) {
  mem.recordAttempt('button.tab-btn', 'clickable', 'click', true, 3, ['embed', 'download', 'navigation'], 'animejara.com');
  mem.recordAttempt('button.tab-btn', 'clickable', 'click', false, 0, [], 'animejara.com');
  mem.recordAttempt('a.btn-dl', 'clickable', 'click', true, 1, ['embed'], 'animejara.com');
  mem.recordAttempt('a.btn-dl', 'clickable', 'click', false, 0, [], 'animejara.com');
  mem.recordAttempt('a.btn-dl', 'clickable', 'click', false, 0, [], 'animejara.com');
}

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

async function resolveStreamHJ(url) {
  // PHP endpoints redirect to actual content. Follow redirect to get the real URL.
  try {
    const ctrl = new AbortController();
    const t = setTimeout(function() { ctrl.abort(); }, 10000);
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Referer': BASE + '/' },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    clearTimeout(t);
    const finalUrl = res.url;
    // If it redirected to a different domain, that's the real content
    if (finalUrl !== url && finalUrl.startsWith('http')) {
      const html = await res.text();
      // Check for direct download links in the final page
      const megaRe = /https?:\/\/mega\.nz\/[^"'\s<>]+/gi;
      const mediafireRe = /https?:\/\/mediafire\.com\/[^"'\s<>]+/gi;
      const directRe = /https?:\/\/[^"'\s<>]+\.(?:mp4|mkv|zip|rar|7z)[^"'\s<>]*/gi;
      const allMatches = [...(html.match(megaRe) || []), ...(html.match(mediafireRe) || []), ...(html.match(directRe) || [])];
      if (allMatches.length > 0) return allMatches[0];
      return finalUrl;
    }
    return finalUrl !== url ? finalUrl : null;
  } catch { return null; }
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

  const results = [];
  const ep = episode || 1;

  // Extract the correct anime ID from the page to filter URLs
  const idMatch = html.match(/idanime[=:]\s*(\d+)/);
  const animeId = idMatch ? idMatch[1] : null;

  // Extract streamhj URLs, filter to only current anime ID
  const streamhjRe = /https?:\/\/(?:multiplayer|descargas)\.streamhj\.top\/[^"'\s<>]+/gi;
  const streamhjMatches = html.match(streamhjRe) || [];

  // Resolve each URL to get real content
  for (const u of streamhjMatches) {
    const clean = u.replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/#$/, '');

    // Filter: only include URLs for THIS anime
    if (animeId) {
      const urlIdMatch = clean.match(/idanime[=:]\s*(\d+)/);
      if (urlIdMatch && urlIdMatch[1] !== animeId) continue;
    }

    const isEmbed = clean.includes('embed.php');
    const label = isEmbed ? 'MultiPlayer' : 'Descargas';

    // Try to resolve PHP endpoint to real content URL
    let resolvedUrl = clean;
    if (!isEmbed) {
      const realUrl = await resolveStreamHJ(clean);
      if (realUrl) resolvedUrl = realUrl;
    }

    if (!results.some(function(r) { return r.url === clean; })) {
      results.push({
        url: resolvedUrl,
        server: label,
        name: 'AnimeJara\n' + label,
        title: slug + ' Ep.' + ep + '\n' + label,
        description: isEmbed ? '' : 'Download',
        behaviorHints: { notWebReady: isEmbed, bingeGroup: 'animejara|' + label.toLowerCase() },
      });
    }
  }

  // Fallback: Puppeteer for full server list
  if (results.length <= 1) {
    try {
      const pptrResolver = require('../../jkanime-puppeteer');
      const pptrStreams = await pptrResolver.resolveAnimeJara(slug, ep);
      results.push(...pptrStreams);
    } catch { /* use what we have */ }
  }

  return results;
}

module.exports = { search, getStreams, BASE };
