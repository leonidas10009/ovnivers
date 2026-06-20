/**
 * local-scrapers - Built from src/local-scrapers/
 * Generated: 2026-06-20T14:46:15.356Z
 */
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/local-scrapers/utils.js
var require_utils = __commonJS({
  "src/local-scrapers/utils.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var MAX_CONCURRENT = 3;
    var FETCH_TIMEOUT = 8e3;
    function fetchText(_0) {
      return __async(this, arguments, function* (url, timeout = FETCH_TIMEOUT) {
        try {
          var ctrl = new AbortController();
          var t = setTimeout(function() {
            ctrl.abort();
          }, timeout);
          var headers = { "User-Agent": UA };
          try {
            headers["Referer"] = new URL(url).origin + "/";
          } catch (e) {
          }
          var res = yield fetch(url, { headers, signal: ctrl.signal });
          clearTimeout(t);
          return res.ok || res.status === 404 ? yield res.text() : null;
        } catch (e) {
          return null;
        }
      });
    }
    function stripTags(html) {
      return (html || "").replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
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
      while (m = re.exec(html)) {
        var u = m[1];
        if (u.startsWith("//")) u = "https:" + u;
        else if (u.startsWith("/")) u = baseUrl + u;
        if (u.startsWith("http")) urls.push(u);
      }
      return urls;
    }
    function extractAnchors(html, baseUrl, hrefPattern) {
      var urls = [];
      var re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
      var m;
      while (m = re.exec(html)) {
        var href = m[1];
        var text = stripTags(m[2]);
        if (hrefPattern && !hrefPattern.test(href)) continue;
        if (href.startsWith("//")) href = "https:" + href;
        else if (href.startsWith("/")) href = baseUrl + href;
        if (href.startsWith("http")) urls.push({ url: href, text });
      }
      return urls;
    }
    function extractM3u8Mp4(html) {
      var urls = [];
      var re = /https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4)([^\s"'<>]*)/gi;
      var m;
      while (m = re.exec(html)) {
        var u = m[0].replace(/[;,)"'}$]+$/, "").replace(/\\\//g, "/");
        if (u.indexOf("videoplayback") > -1 || u.match(/\.(m3u8|mp4)/i)) {
          urls.push(u);
        }
      }
      return urls;
    }
    function extractMagnetLinks(html) {
      var urls = [];
      var re = /(magnet:\?xt=urn:btih:[a-zA-Z0-9]+[^"'\s<>]*)/gi;
      var m;
      while (m = re.exec(html)) {
        urls.push(m[1]);
      }
      return urls;
    }
    function extractTorrentLinks(html, baseUrl) {
      var urls = [];
      var re = /<a[^>]+href=["']([^"']+\.torrent[^"']*)["']/gi;
      var m;
      while (m = re.exec(html)) {
        var u = m[1];
        if (u.startsWith("//")) u = "https:" + u;
        else if (u.startsWith("/")) u = baseUrl + u;
        urls.push(u);
      }
      return urls;
    }
    function decodeBase64Url(val) {
      if (!val || val.length < 20) return null;
      if (val.startsWith("http")) return val;
      try {
        var dec = atob(val.replace(/-/g, "+").replace(/_/g, "/"));
        if (dec.startsWith("http://") || dec.startsWith("https://")) return dec;
      } catch (e) {
      }
      return null;
    }
    function cleanTitle(t) {
      return (t || "").toLowerCase().replace(/[áàäâ]/g, "a").replace(/[éèëê]/g, "e").replace(/[íìïî]/g, "i").replace(/[óòöô]/g, "o").replace(/[úùüû]/g, "u").replace(/ñ/g, "n").replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
    }
    var STOP_WORDS = [
      "the",
      "of",
      "from",
      "and",
      "or",
      "in",
      "on",
      "at",
      "to",
      "for",
      "with",
      "a",
      "an",
      "de",
      "el",
      "la",
      "los",
      "las",
      "del",
      "en",
      "un",
      "una",
      "que",
      "es",
      "por",
      "para",
      "con",
      "se",
      "su",
      "no",
      "si",
      "lo",
      "ya",
      "le",
      "me",
      "al",
      "ha",
      "he",
      "we",
      "ni"
    ];
    function splitWords(s) {
      return cleanTitle(s).split(" ").filter(function(w) {
        return w.length > 0;
      });
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
      var qClean = qw.join(" ");
      var tClean = tw.join(" ");
      if (qClean === tClean) return 1;
      if (tClean.indexOf(qClean) !== -1) return 0.85;
      var overlap = wordOverlap(qw, tw);
      var startBonus = 0;
      if (tw.length >= qw.length) {
        var allStart = true;
        for (var i = 0; i < Math.min(qw.length, 3); i++) {
          if (qw[i] !== tw[i]) {
            allStart = false;
            break;
          }
        }
        if (allStart) startBonus = 0.15;
      }
      return Math.min(1, overlap + startBonus);
    }
    function detectServer(url) {
      try {
        var h = new URL(url).hostname.replace("www.", "").replace(/\./g, " ").toLowerCase();
        var servers = {
          streamwish: "StreamWish",
          sfastwish: "StreamWish",
          flaswish: "StreamWish",
          filemoon: "FileMoon",
          doodstream: "DoodStream",
          mixdrop: "MixDrop",
          "voe sx": "VOE",
          vidhide: "VidHide",
          mp4upload: "MP4Upload",
          streamtape: "StreamTape",
          "ok ru": "OK",
          vidnode: "VidNode",
          upstream: "UpStream",
          "netu tv": "WaW",
          "vidmoly": "VidMoly",
          vtube: "VTube",
          "vk com": "VK",
          mega: "Mega",
          "mediafire": "Mediafire",
          "googleapis": "Google",
          "googlevideo": "GoogleVideo",
          cloudflare: "CF",
          "closeload": "CloseLoad",
          "embedo": "Embedo",
          "fembed": "Fembed",
          "gounlimited": "Gounlimited",
          "yourupload": "YourUpload",
          "vidoza": "Vidoza",
          "streamlare": "StreamLare",
          "player ru": "Player",
          "mail ru": "MailRu",
          "my mail": "MailRu"
        };
        for (var key in servers) {
          if (h.indexOf(key) !== -1) return servers[key];
        }
        return h.split(" ")[0] || "CDN";
      } catch (e) {
        return "Unknown";
      }
    }
    function makeStream(url, sourceName, serverName, quality) {
      return {
        url,
        name: (sourceName || "Local") + "\n" + (serverName || "Unknown"),
        title: (sourceName || "") + "\n\u2699\uFE0F " + (serverName || url) + "\n" + (quality || "HD"),
        behaviorHints: { notWebReady: !url.match(/\.(mp4|mp3|webm|ogg|ogv)(\?|$)/i) },
        server: serverName || detectServer(url),
        quality: quality || "HD",
        source: sourceName || "Local"
      };
    }
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
              if (r != null) {
                results.push(r);
              }
              running--;
              next();
            }).catch(function() {
              running--;
              next();
            });
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
      while (m = re.exec(html)) {
        var u = m[1].trim();
        if (u && u.startsWith("http")) urls.push(u);
      }
      return urls;
    }
    function extractOnclickUrls(html) {
      var urls = [];
      var re = /playVideo\s*\(\s*(?:&quot;|")\s*(https?:\/\/.+?)\s*(?:&quot;|")\s*\)/gi;
      var m;
      while (m = re.exec(html)) {
        var u = m[1].trim();
        if (u && u.startsWith("http")) urls.push(u);
      }
      return urls;
    }
    module2.exports = {
      fetchText,
      stripTags,
      matchAll,
      extractIframeSrc,
      extractAnchors,
      extractM3u8Mp4,
      extractMagnetLinks,
      extractTorrentLinks,
      extractServerDivUrls,
      extractOnclickUrls,
      decodeBase64Url,
      cleanTitle,
      scoreMatch,
      detectServer,
      makeStream,
      runPool,
      UA
    };
  }
});

// src/local-scrapers/sites.js
var require_sites = __commonJS({
  "src/local-scrapers/sites.js"(exports2, module2) {
    var SITES = [
      {
        id: "animejara",
        name: "AnimeJara",
        baseUrl: "https://animejara.com",
        searchUrl: "/?s={query}",
        categories: ["anime"],
        lang: ["lat", "cast", "ja"],
        itemSelector: "a.anime-card",
        titleSelector: ".card-title",
        linkSelector: "&",
        videoType: "episodePage",
        videoContainer: ".episodio-reproductor",
        episodePattern: "/episode/"
      },
      {
        id: "mirapeliculas",
        name: "MiraPeliculas",
        baseUrl: "https://ww2.dipelis.com",
        searchUrl: "/?s={query}",
        categories: ["movie"],
        lang: ["lat", "cast"],
        itemSelector: "article.movie-card",
        titleSelector: "h3.movie-title-top, h3.movie-title-top a",
        linkSelector: "a.movie-link",
        videoType: "serverDiv",
        videoContainer: ".player-section"
      },
      {
        id: "animejl",
        name: "AnimeJL",
        baseUrl: "https://www.anime-jl.net",
        searchUrl: "/?s={query}",
        categories: ["anime"],
        lang: ["lat", "cast", "ja"],
        itemSelector: "article.Anime",
        titleSelector: "h3.Title",
        linkSelector: "a[href]",
        videoType: "jsvar",
        videoContainer: "body"
      },
      {
        id: "hdfull",
        name: "HDFull",
        baseUrl: "https://hdfull.today",
        searchUrl: "/?s={query}",
        categories: ["movie", "tvshow"],
        lang: ["lat", "cast", "vose"],
        itemSelector: "article",
        titleSelector: "h2, h3",
        linkSelector: "a[href]",
        videoType: "iframe",
        videoContainer: ".entry-content"
      },
      {
        id: "pelisforte",
        name: "PelisForte",
        baseUrl: "https://www1.pelisforte.se",
        searchUrl: "/?s={query}",
        categories: ["movie"],
        lang: ["lat", "cast"],
        itemSelector: "article",
        titleSelector: "h2, h3",
        linkSelector: "a[href]",
        videoType: "iframe",
        videoContainer: ".entry-content"
      },
      {
        id: "zoowomaniacos",
        name: "Zoowomaniacos",
        baseUrl: "https://zoowomaniacos.org",
        searchUrl: "/?s={query}",
        categories: ["movie"],
        lang: ["lat", "cast", "vose"],
        itemSelector: "article",
        titleSelector: "h2",
        linkSelector: "a[href]",
        videoType: "iframe",
        videoContainer: ".entry-content"
      },
      {
        id: "estrenosdoramas",
        name: "EstrenosDoramas",
        baseUrl: "https://estrenosdoramas.net",
        searchUrl: "/?s={query}",
        categories: ["tvshow"],
        lang: ["lat", "cast", "vose"],
        itemSelector: "article",
        titleSelector: "h2",
        linkSelector: "a[href]",
        videoType: "iframe",
        videoContainer: ".entry-content"
      }
    ];
    var seen = {};
    var DEDUPED = [];
    for (i = 0; i < SITES.length; i++) {
      if (!seen[SITES[i].id]) {
        seen[SITES[i].id] = true;
        DEDUPED.push(SITES[i]);
      }
    }
    var i;
    module2.exports = { SITES: DEDUPED };
  }
});

// src/local-scrapers/index.js
var utils = require_utils();
var sites = require_sites();
var $ = null;
try {
  $ = require("cheerio-without-node-native");
} catch (e) {
}
if (!$) try {
  $ = require("cheerio");
} catch (e2) {
}
function makeAbsolute(url, baseUrl) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return "https:" + url;
  try {
    return new URL(url, baseUrl).href;
  } catch (e) {
    return baseUrl + "/" + url.replace(/^\//, "");
  }
}
function searchOne(site, query, type) {
  return __async(this, null, function* () {
    var searchUrl = site.baseUrl + (site.searchUrl || "/?s={query}").replace("{query}", encodeURIComponent(query));
    var html = yield utils.fetchText(searchUrl);
    if (!html) return { site: site.name, items: [] };
    var items = [];
    if ($) {
      try {
        var doc = $.load(html);
        var found = doc(site.itemSelector || "article").toArray();
        for (var i = 0; i < found.length; i++) {
          var el = doc(found[i]);
          var titleEl = el.find(site.titleSelector || "h2").first();
          var linkEl = el.find(site.linkSelector || "a[href]").first();
          var title = titleEl.text().trim();
          var href = linkEl.attr("href") || "";
          if (title && href) {
            href = makeAbsolute(href, site.baseUrl);
            items.push({ title, url: href, score: utils.scoreMatch(query, title) });
          }
        }
      } catch (e) {
      }
    }
    if (!items.length) {
      try {
        var anch = utils.extractAnchors(html, site.baseUrl);
        for (var j = 0; j < anch.length; j++) {
          var score = utils.scoreMatch(query, anch[j].text);
          if (score > 0.3) {
            items.push({ title: anch[j].text, url: anch[j].url, score });
          }
        }
      } catch (e2) {
      }
    }
    items.sort(function(a, b) {
      return b.score - a.score;
    });
    return { site: site.name, items: items.slice(0, 5) };
  });
}
function extractVideos(site, pageUrl) {
  return __async(this, null, function* () {
    var html = yield utils.fetchText(pageUrl);
    if (!html) return [];
    var streams = [];
    var baseUrl = site.baseUrl;
    if (site.videoType === "iframe") {
      if ($) {
        try {
          var doc = $.load(html);
          var container = site.videoContainer ? doc(site.videoContainer) : doc;
          var iframes = container.find("iframe").toArray();
          for (var i = 0; i < iframes.length; i++) {
            var src = doc(iframes[i]).attr("src") || doc(iframes[i]).attr("data-src");
            if (src) {
              var resolved = utils.decodeBase64Url(src) || makeAbsolute(src, baseUrl);
              if (resolved && resolved.startsWith("http")) {
                streams.push(utils.makeStream(resolved, site.name, utils.detectServer(resolved), "HD"));
              }
            }
          }
          if (!streams.length) {
            var anchors = container.find("a[data-src]").toArray();
            for (var k = 0; k < anchors.length; k++) {
              var dsrc = doc(anchors[k]).attr("data-src");
              var dresolved = utils.decodeBase64Url(dsrc) || makeAbsolute(dsrc, baseUrl);
              if (dresolved && dresolved.startsWith("http")) {
                streams.push(utils.makeStream(dresolved, site.name, utils.detectServer(dresolved), "HD"));
              }
            }
          }
        } catch (e2) {
        }
      }
      if (!streams.length) {
        var iframeUrls = utils.extractIframeSrc(html, baseUrl);
        for (var m = 0; m < iframeUrls.length; m++) {
          var u = utils.decodeBase64Url(iframeUrls[m]) || iframeUrls[m];
          if (u && u.startsWith("http")) {
            streams.push(utils.makeStream(u, site.name, utils.detectServer(u), "HD"));
          }
        }
      }
    }
    if (site.videoType === "torrent") {
      var magnets = utils.extractMagnetLinks(html);
      for (var p = 0; p < magnets.length && streams.length < 3; p++) {
        streams.push({
          url: magnets[p],
          name: site.name + "\n\u{1F9F2} Magnet",
          title: site.name + "\n\u2699\uFE0F Magnet",
          infoHash: "",
          behaviorHints: { notWebReady: true }
        });
      }
      var torrents = utils.extractTorrentLinks(html, baseUrl);
      for (var q = 0; q < torrents.length && streams.length < 3; q++) {
        streams.push({
          url: torrents[q],
          name: site.name + "\n\u{1F517} .torrent",
          title: site.name + "\n\u2699\uFE0F Torrent",
          infoHash: "",
          behaviorHints: { notWebReady: true }
        });
      }
    }
    if (site.videoType === "serverDiv") {
      var srvUrls = utils.extractServerDivUrls(html);
      for (var t = 0; t < srvUrls.length && streams.length < 5; t++) {
        var u = utils.decodeBase64Url(srvUrls[t]) || srvUrls[t];
        if (u && u.startsWith("http")) {
          streams.push(utils.makeStream(u, site.name, utils.detectServer(u), "HD"));
        }
      }
    }
    if (site.videoType === "episodePage") {
      var epUrl = pageUrl;
      if (pageUrl.indexOf(site.episodePattern || "/episode/") === -1) {
        var parts = pageUrl.replace(/#.*$/, "").replace(/\/+$/, "").split("/");
        var slug = parts[parts.length - 1];
        if (slug && slug.length > 2) {
          epUrl = site.baseUrl + "/" + (site.episodePattern || "episode").replace(/^\//, "").replace(/\/$/, "") + "/" + slug + "-1x1/";
          epUrl = epUrl.replace(/([^:])\/{2,}/g, "$1/");
          epHtml = yield utils.fetchText(epUrl);
          if (!epHtml && $) {
            var doc = $.load(html);
            var epLinks = doc('a[href*="' + (site.episodePattern || "/episode/").replace(/\/$/, "") + '"]').toArray();
            for (var n = 0; n < epLinks.length && !epHtml; n++) {
              var epHref = doc(epLinks[n]).attr("href");
              if (epHref) {
                epUrl = makeAbsolute(epHref, site.baseUrl);
                epHtml = yield utils.fetchText(epUrl);
              }
            }
          }
        }
      }
      if (epHtml) {
        var epStreams = utils.extractIframeSrc(epHtml, site.baseUrl);
        for (var m = 0; m < epStreams.length && streams.length < 5; m++) {
          streams.push(utils.makeStream(epStreams[m], site.name, utils.detectServer(epStreams[m]), "HD"));
        }
        if (streams.length < 3) {
          var enlacesMatch = epHtml.match(/const\s+enlaces\s*=\s*(\[[\s\S]*?\]);/);
          if (enlacesMatch) {
            try {
              var arr = JSON.parse(enlacesMatch[1]);
              for (var e = 0; e < arr.length && streams.length < 15; e++) {
                var embedHtml = yield utils.fetchText(arr[e]);
                if (embedHtml) {
                  var onclickUrls = utils.extractOnclickUrls(embedHtml);
                  for (var o = 0; o < onclickUrls.length && streams.length < 15; o++) {
                    var serverName = utils.detectServer(onclickUrls[o]);
                    streams.push(utils.makeStream(onclickUrls[o], site.name, serverName, "HD"));
                  }
                }
              }
            } catch (e2) {
            }
          }
        }
      }
    }
    if (site.videoType === "jsvar") {
      var jsMatch = html.match(/var\s+videos?\s*=\s*(\[[\s\S]*?\]);/);
      if (jsMatch) {
        try {
          var vids = JSON.parse(jsMatch[1]);
          for (var r = 0; r < vids.length && r < 3; r++) {
            var vUrl = Array.isArray(vids[r]) ? vids[r][1] || vids[r][0] : vids[r].url || vids[r].code;
            var vServer = Array.isArray(vids[r]) ? vids[r][0] : vids[r].server || "";
            if (vUrl && vUrl.startsWith("http")) {
              streams.push(utils.makeStream(vUrl, site.name, vServer || utils.detectServer(vUrl), "HD"));
            }
          }
        } catch (e2) {
        }
      }
      if (!streams.length) {
        var directUrls = utils.extractM3u8Mp4(html);
        for (var s = 0; s < directUrls.length && s < 3; s++) {
          streams.push(utils.makeStream(directUrls[s], site.name, utils.detectServer(directUrls[s]), "HD"));
        }
      }
    }
    return streams.slice(0, 15);
  });
}
function search(query, type) {
  return __async(this, null, function* () {
    if (!query) return [];
    var siteList = sites.SITES.filter(function(s) {
      if (type === "movie") return s.categories.indexOf("movie") !== -1;
      if (type === "tv") return s.categories.indexOf("tvshow") !== -1 || s.categories.indexOf("anime") !== -1;
      return true;
    });
    if (!siteList.length) siteList = sites.SITES;
    var tasks = siteList.map(function(s) {
      return function() {
        return searchOne(s, query, type);
      };
    });
    var results = yield utils.runPool(tasks);
    return results.filter(function(r) {
      return r && r.items && r.items.length > 0;
    });
  });
}
function getStreams(tmdbIdOrUrl, mediaTypeOrSiteId, season, episode) {
  return __async(this, null, function* () {
    if (mediaTypeOrSiteId === "movie" || mediaTypeOrSiteId === "tv" || mediaTypeOrSiteId === "series") {
      return [];
    }
    var itemUrl = tmdbIdOrUrl;
    var siteId = mediaTypeOrSiteId;
    return yield extractVideosByUrl(itemUrl, siteId);
  });
}
function extractVideosByUrl(itemUrl, siteId) {
  return __async(this, null, function* () {
    var site = null;
    for (var i = 0; i < sites.SITES.length; i++) {
      if (sites.SITES[i].id === siteId || sites.SITES[i].name === siteId) {
        site = sites.SITES[i];
        break;
      }
    }
    if (!site) return [];
    return yield extractVideos(site, itemUrl);
  });
}
module.exports = { search, getStreams, extractVideos, SITES: sites.SITES, utils };
