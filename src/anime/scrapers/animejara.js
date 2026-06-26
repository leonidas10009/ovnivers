const cheerio = require('cheerio-without-node-native') || require('cheerio');
const { getSessionMemory } = require('../../intelligent');

const BASE = 'https://animejara.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

// Pre-seed memory with known-good selectors from sistem-scraper-lite tests
const mem = getSessionMemory();
mem.setCurrentDomain('animejara.com');
if (!mem.getDomainFingerprint('animejara.com')) {
  mem.recordAttempt('button.tab-btn', 'clickable', 'click', true, 3, [
    'embed', 'download', 'navigation',
  ], 'animejara.com');
  mem.recordAttempt('button.tab-btn', 'clickable', 'click', false, 0, [], 'animejara.com');
  mem.recordAttempt('a.btn-dl', 'clickable', 'click', true, 1, ['embed'], 'animejara.com');
  mem.recordAttempt('a.btn-dl', 'clickable', 'click', false, 0, [], 'animejara.com');
  mem.recordAttempt('a.btn-dl', 'clickable', 'click', false, 0, [], 'animejara.com');
  mem.recordChain(
    'https://animejara.com/anime/isekai-nonbiri-nouka/',
    'https://multiplayer.streamhj.top/player/multiplayer/embed.php',
    'servers',
  );
  mem.recordChain(
    'https://animejara.com/anime/isekai-nonbiri-nouka/',
    'https://descargas.streamhj.top/player/multiplayer/download.php',
    'download',
  );
}

async function fetchText(url, timeout) {
  const ctrl = new AbortController();
  const t = setTimeout(function() { ctrl.abort(); }, timeout || 15000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(t);
    // AnimeJara returns 404 for valid pages with content
    const html = await res.text();
    if (html && html.length > 1000) return html;
    return res.ok ? html : null;
  } catch { clearTimeout(t); return null; }
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

  // Fast path: extract known embed/download URLs from static HTML
  // Discovered by AutonomousScraper + confirmed in sistem-scraper-lite tests
  const streamhjRe = /https?:\/\/(?:multiplayer|descargas)\.streamhj\.top\/[^"'\s<>]+/gi;
  const streamhjMatches = html.match(streamhjRe) || [];
  streamhjMatches.forEach(function(u) {
    const clean = u.replace(/&amp;/g, '&').replace(/&#038;/g, '&').replace(/#$/, '');
    const isEmbed = clean.includes('embed.php');
    const label = isEmbed ? 'MultiPlayer' : 'Descargas';
    if (!results.some(function(r) { return r.url === clean; })) {
      results.push({
        url: clean,
        server: label,
        name: 'AnimeJara\n' + label,
        title: slug + ' Ep.' + ep + '\n' + label,
        description: isEmbed ? '' : 'Download',
        behaviorHints: { notWebReady: true, bingeGroup: 'animejara|' + label.toLowerCase() },
      });
    }
  });

  // If no streamhj URLs, try Puppeteer via the native resolver
  if (results.length === 0) {
    try {
      const pptrResolver = require('../../jkanime-puppeteer');
      const pptrStreams = await pptrResolver.resolveAnimeJara(slug, ep);
      results.push(...pptrStreams);
    } catch { /* fallback below */ }
  }

  // Fallback: generic iframe + m3u8/mp4 extraction
  if (results.length === 0) {
    const iframeRe = /<iframe[^>]+src="([^"]+)"/gi;
    let m;
    while ((m = iframeRe.exec(html)) !== null) {
      const src = m[1].replace(/&amp;/g, '&');
      if (src.startsWith('http') && src !== 'about:blank' && !/google|facebook|discord/i.test(src)) {
        results.push({
          url: src, server: 'Embed', name: 'AnimeJara\nEmbed',
          title: slug + ' Ep.' + ep + '\nEmbed',
          behaviorHints: { notWebReady: true, bingeGroup: 'animejara|embed' },
        });
      }
    }
  }

  return results;
}

module.exports = { search, getStreams, BASE };
