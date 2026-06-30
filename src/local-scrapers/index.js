// index.js - Ovnivers Local Scrapers for Hermes (Android/Android TV)
// Optimized: regex extraction, concurrency pool, max 5 results/provider
// Sites that work from residential IP but are blocked on VPS
//
// Hermes runtime provides: 'cheerio-without-node-native' (external, shared memory)

var utils = require('./utils');
var sites = require('./sites');

var $ = null;
try { $ = require('cheerio-without-node-native'); } catch (e) {}
if (!$) try { $ = require('cheerio'); } catch (e2) {}

// ═══ Per-provider search + video extraction ═══

function makeAbsolute(url, baseUrl) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  try { return new URL(url, baseUrl).href; } catch (e) { return baseUrl + '/' + url.replace(/^\//, ''); }
}

async function searchOne(site, query, type) {
  var searchUrl = site.baseUrl + (site.searchUrl || '/?s={query}').replace('{query}', encodeURIComponent(query));
  var html = await utils.fetchText(searchUrl);
  if (!html) return { site: site.name, items: [] };

  var items = [];

  // Strategy 1: Cheerio-based (precise, shared library from Hermes runtime)
  if ($) {
    try {
      var doc = $.load(html);
      var found = doc(site.itemSelector || 'article').toArray();
      for (var i = 0; i < found.length; i++) {
        var el = doc(found[i]);
        var titleEl = el.find(site.titleSelector || 'h2').first();
        var linkEl = el.find(site.linkSelector || 'a[href]').first();
        var title = titleEl.text().trim();
        var href = linkEl.attr('href') || '';
        if (title && href) {
          href = makeAbsolute(href, site.baseUrl);
          items.push({ title: title, url: href, score: utils.scoreMatch(query, title) });
        }
      }
    } catch (e) {}
  }

  // Strategy 2: Regex-based fallback
  if (!items.length) {
    try {
      var anch = utils.extractAnchors(html, site.baseUrl);
      for (var j = 0; j < anch.length; j++) {
        var score = utils.scoreMatch(query, anch[j].text);
        if (score > 0.3) {
          items.push({ title: anch[j].text, url: anch[j].url, score: score });
        }
      }
    } catch (e2) {}
  }

  // Sort by score, return top 5
  items.sort(function(a, b) { return b.score - a.score; });
  return { site: site.name, items: items.slice(0, 5) };
}

async function extractVideos(site, pageUrl) {
  var html = await utils.fetchText(pageUrl);
  if (!html) return [];

  var streams = [];
  var baseUrl = site.baseUrl;

  if (site.videoType === 'iframe') {
    // Strategy 1: Cheerio extraction
    if ($) {
      try {
        var doc = $.load(html);
        var container = site.videoContainer ? doc(site.videoContainer) : doc;
        var iframes = container.find('iframe').toArray();
        for (var i = 0; i < iframes.length; i++) {
          var src = doc(iframes[i]).attr('src') || doc(iframes[i]).attr('data-src');
          if (src) {
            var resolved = utils.decodeBase64Url(src) || makeAbsolute(src, baseUrl);
            if (resolved && resolved.startsWith('http')) {
              streams.push(utils.makeStream(resolved, site.name, utils.detectServer(resolved), 'HD'));
            }
          }
        }
        // data-src anchors (lazy load)
        if (!streams.length) {
          var anchors = container.find('a[data-src]').toArray();
          for (var k = 0; k < anchors.length; k++) {
            var dsrc = doc(anchors[k]).attr('data-src');
            var dresolved = utils.decodeBase64Url(dsrc) || makeAbsolute(dsrc, baseUrl);
            if (dresolved && dresolved.startsWith('http')) {
              streams.push(utils.makeStream(dresolved, site.name, utils.detectServer(dresolved), 'HD'));
            }
          }
        }
      } catch (e) {}
    }

    // Strategy 2: Regex fallback
    if (!streams.length) {
      var iframeUrls = utils.extractIframeSrc(html, baseUrl);
      for (var m = 0; m < iframeUrls.length; m++) {
        var u = utils.decodeBase64Url(iframeUrls[m]) || iframeUrls[m];
        if (u && u.startsWith('http')) {
          streams.push(utils.makeStream(u, site.name, utils.detectServer(u), 'HD'));
        }
      }
    }
  }

  if (site.videoType === 'torrent') {
    var magnets = utils.extractMagnetLinks(html);
    for (var p = 0; p < magnets.length && streams.length < 3; p++) {
      streams.push({
        url: magnets[p], name: site.name + '\n\uD83E\uDDF2 Magnet',
        title: site.name + '\n\u2699\uFE0F Magnet', infoHash: '',
        behaviorHints: { notWebReady: true }
      });
    }
    var torrents = utils.extractTorrentLinks(html, baseUrl);
    for (var q = 0; q < torrents.length && streams.length < 3; q++) {
      streams.push({
        url: torrents[q], name: site.name + '\n\uD83D\uDD17 .torrent',
        title: site.name + '\n\u2699\uFE0F Torrent', infoHash: '',
        behaviorHints: { notWebReady: true }
      });
    }
  }

  if (site.videoType === 'serverDiv') {
    var srvUrls = utils.extractServerDivUrls(html);
    for (var t = 0; t < srvUrls.length && streams.length < 5; t++) {
      var u = utils.decodeBase64Url(srvUrls[t]) || srvUrls[t];
      if (u && u.startsWith('http')) {
        streams.push(utils.makeStream(u, site.name, utils.detectServer(u), 'HD'));
      }
    }
  }

  if (site.videoType === 'episodePage') {
    var epUrl = pageUrl;
    // If URL is not already an episode page, construct episode URL from anime slug
    if (pageUrl.indexOf(site.episodePattern || '/episode/') === -1) {
      var parts = pageUrl.replace(/#.*$/, '').replace(/\/+$/, '').split('/');
      var slug = parts[parts.length - 1];
      if (slug && slug.length > 2) {
        // Try S01E01 format
        epUrl = site.baseUrl + '/' + (site.episodePattern || 'episode').replace(/^\//, '').replace(/\/$/, '') + '/' + slug + '-1x1/';
        epUrl = epUrl.replace(/([^:])\/{2,}/g, '$1/');
        epHtml = await utils.fetchText(epUrl);
        // Fallback: try finding links on the anime page
        if (!epHtml && $) {
          var doc = $.load(html);
          var epLinks = doc('a[href*="' + (site.episodePattern || '/episode/').replace(/\/$/, '') + '"]').toArray();
          for (var n = 0; n < epLinks.length && !epHtml; n++) {
            var epHref = doc(epLinks[n]).attr('href');
            if (epHref) {
              epUrl = makeAbsolute(epHref, site.baseUrl);
              epHtml = await utils.fetchText(epUrl);
            }
          }
        }
      }
    }
    if (epHtml) {
      var epStreams = utils.extractIframeSrc(epHtml, site.baseUrl);
      for (var m = 0; m < epStreams.length && streams.length < 5; m++) {
        streams.push(utils.makeStream(epStreams[m], site.name, utils.detectServer(epStreams[m]), 'HD'));
      }
      // Also extract const enlaces = [...] array and resolve embed pages
      if (streams.length < 3) {
        var enlacesMatch = epHtml.match(/const\s+enlaces\s*=\s*(\[[\s\S]*?\]);/);
        if (enlacesMatch) {
          try {
            var arr = JSON.parse(enlacesMatch[1]);
            for (var e = 0; e < arr.length && streams.length < 15; e++) {
              var embedHtml = await utils.fetchText(arr[e]);
              if (embedHtml) {
                var onclickUrls = utils.extractOnclickUrls(embedHtml);
                for (var o = 0; o < onclickUrls.length && streams.length < 15; o++) {
                  var serverName = utils.detectServer(onclickUrls[o]);
                  streams.push(utils.makeStream(onclickUrls[o], site.name, serverName, 'HD'));
                }
              }
            }
          } catch(e2) {}
        }
      }
    }
  }

  if (site.videoType === 'jsvar') {
    // Try to extract from JS variables/assignments
    var jsMatch = html.match(/var\s+videos?\s*=\s*(\[[\s\S]*?\]);/);
    if (jsMatch) {
      try {
        var vids = JSON.parse(jsMatch[1]);
        for (var r = 0; r < vids.length && r < 3; r++) {
          var vUrl = Array.isArray(vids[r]) ? vids[r][1] || vids[r][0] : vids[r].url || vids[r].code;
          var vServer = Array.isArray(vids[r]) ? vids[r][0] : vids[r].server || '';
          if (vUrl && vUrl.startsWith('http')) {
            streams.push(utils.makeStream(vUrl, site.name, vServer || utils.detectServer(vUrl), 'HD'));
          }
        }
      } catch (e) {}
    }
    // Also try regex for m3u8/mp4 in the HTML
    if (!streams.length) {
      var directUrls = utils.extractM3u8Mp4(html);
      for (var s = 0; s < directUrls.length && s < 3; s++) {
        streams.push(utils.makeStream(directUrls[s], site.name, utils.detectServer(directUrls[s]), 'HD'));
      }
    }
  }

  return streams.slice(0, 15);
}

// ═══ Public API (called by Hermes runtime) ═══

async function search(query, type) {
  if (!query) return [];
  var siteList = sites.SITES.filter(function(s) {
    if (type === 'movie') return s.categories.indexOf('movie') !== -1;
    if (type === 'tv') return s.categories.indexOf('tvshow') !== -1 || s.categories.indexOf('anime') !== -1;
    return true;
  });
  if (!siteList.length) siteList = sites.SITES;

  var tasks = siteList.map(function(s) {
    return function() { return searchOne(s, query, type); };
  });

  var results = await utils.runPool(tasks);
  return results.filter(function(r) { return r && r.items && r.items.length > 0; });
}

// ═══ getStreams — Unified interface for both server-side and NuvioTV device-side ═══
// server.js calls: getStreams(tmdbId, mediaType, season, episode)
// NuvioTV Hermes: getStreams(itemUrl, siteId)

async function getStreams(tmdbIdOrUrl, mediaTypeOrSiteId, season, episode) {
  // Detect call signature: if 2nd arg is 'movie' or 'tv' → server-side, return empty
  // (these 20+ providers need residential IP, Render/VPS is blocked)
  if (mediaTypeOrSiteId === 'movie' || mediaTypeOrSiteId === 'tv' || mediaTypeOrSiteId === 'series') {
    return [];
  }

  // Client-side call: getStreams(itemUrl, siteId)
  var itemUrl = tmdbIdOrUrl;
  var siteId = mediaTypeOrSiteId;
  return await extractVideosByUrl(itemUrl, siteId);
}

async function extractVideosByUrl(itemUrl, siteId) {
  var site = null;
  for (var i = 0; i < sites.SITES.length; i++) {
    if (sites.SITES[i].id === siteId || sites.SITES[i].name === siteId) {
      site = sites.SITES[i]; break;
    }
  }
  if (!site) return [];
  return await extractVideos(site, itemUrl);
}

// ═══ Module export ═══

module.exports = { search: search, getStreams: getStreams, extractVideos: extractVideos, SITES: sites.SITES, utils: utils };
