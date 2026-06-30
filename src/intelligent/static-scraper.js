// static-scraper.js — Browser-less scraping via fetch + cheerio
// Ported from sistem-scraper-lite/src/analysis/StaticScraper.ts
// ~15MB RAM, no Puppeteer needed — ideal for server-side scraping
// Uses SmartAnalyzer for URL classification + SessionMemory for learning

const cheerio = require('cheerio');
const { SmartAnalyzer } = require('./smart-analyzer');
const { SessionMemory, textSimilarity } = require('./session-memory');
const { getLogger } = require('./logger');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36';

class StaticScraper {
  constructor() {
    this.ai = new SmartAnalyzer();
    this.memory = new SessionMemory();
  }

  async analyze(url) {
    const log = getLogger();
    const start = Date.now();
    log.info({ url }, 'Static analysis started (no browser)');

    const html = await this._fetchHtml(url);
    if (!html) {
      return this._emptyResult(url, start);
    }

    const $ = cheerio.load(html);
    const elements = this._buildStaticModel($);
    log.info({ elements: elements.length }, 'Static DOM model built');

    const allUrls = this._extractUrlsFromStatic($, html);
    log.info({ urls: allUrls.length }, 'URLs extracted from static HTML');

    const goal = this._detectGoal(elements);
    log.info({ goal }, 'Content goal detected');

    const findings = this._classifyUrls(allUrls);
    const serverCatalog = this._buildCatalog(allUrls);

    const duration = Date.now() - start;
    log.info({ servers: serverCatalog.length, urls: allUrls.length, duration }, 'Static analysis complete');

    return {
      url,
      title: $('title').text().trim(),
      urlsFound: allUrls.length,
      serverCatalog,
      findings,
      goal,
      durationMs: duration,
    };
  }

  // ─── Fetch (lightweight, no browser) ────────────────────────
  async _fetchHtml(url) {
    const log = getLogger();
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        log.warn({ status: response.status, url }, 'Fetch failed');
        return null;
      }

      const html = await response.text();
      log.debug({ bytes: html.length }, 'HTML fetched');
      return html;
    } catch (err) {
      log.warn({ url, error: err.message }, 'Fetch error');
      return null;
    }
  }

  // ─── Static DOM model (cheerio → RawElement[]) ──────────────
  _buildStaticModel($) {
    const elements = [];
    const self = this;

    $('a, button, input, select, iframe, img, video, audio, li, h1, h2, h3, div, form, span').each(function(i, el) {
      if (i > 300) return false;

      const $el = $(el);
      const tag = (el.tagName || 'div').toLowerCase();
      const text = $el.text().trim().replace(/\s+/g, ' ').slice(0, 60);

      if (['div', 'span'].includes(tag) && text.length === 0 && $el.children().length === 0) return;

      const attrs = {};
      const attrNames = ['id', 'class', 'href', 'src', 'onclick', 'placeholder', 'type', 'alt', 'title',
        'data-url', 'data-src', 'data-anime', 'data-value'];
      for (const name of attrNames) {
        const val = $el.attr(name);
        if (val) attrs[name] = val.slice(0, 200);
      }

      let type = 'container';
      if (tag === 'a' || attrs['href']) type = 'link';
      else if (tag === 'button' || attrs['onclick']) type = 'clickable';
      else if (tag === 'input' || tag === 'textarea') type = 'input';
      else if (tag === 'select') type = 'select';
      else if (tag === 'img') type = 'image';
      else if (tag === 'iframe') type = 'iframe';
      else if (tag === 'video' || tag === 'audio') type = 'media';
      else if (/^h[1-6]$/.test(tag)) type = 'heading';
      else if (tag === 'li') type = 'list-item';

      const cls = (attrs['class'] || '').split(/\s+/)[0] || '';
      const parent = $el.parent().attr('id') || $el.parent().attr('class') || $el.parent().get(0)?.tagName || '';

      elements.push({
        tag, text, type, cls,
        selector: attrs['id'] ? '#' + attrs['id'] : tag + (cls ? '.' + cls : ''),
        id: attrs['id'] || '',
        class: (attrs['class'] || '').slice(0, 80),
        attr: attrs,
        children: [],
        parent: (parent || '').toLowerCase(),
        depth: 0,
      });
    });

    return elements;
  }

  // ─── URL extraction from static HTML ────────────────────────
  _extractUrlsFromStatic($, html) {
    const seen = new Set();
    const add = function(u) {
      if (!u || u.startsWith('#') || u.startsWith('javascript:') || u === 'about:blank') return;
      seen.add(u);
    };

    // iframes
    $('iframe').each(function(_, el) {
      add($(el).attr('src') || $(el).attr('data-src') || '');
    });

    // links
    $('a[href]').each(function(_, el) {
      const href = $(el).attr('href') || '';
      if (href.startsWith('http') || href.startsWith('/')) add(href);
    });

    // media
    $('video, audio, embed, object, source').each(function(_, el) {
      add($(el).attr('src') || $(el).attr('data') || '');
    });

    // data-* attributes
    $('[data-url], [data-src], [data-video], [data-embed], [data-href], [data-link]').each(function(_, el) {
      const dUrl = $(el).attr('data-url') || $(el).attr('data-src') || $(el).attr('data-video')
        || $(el).attr('data-embed') || $(el).attr('data-href') || $(el).attr('data-link') || '';
      add(dUrl);
    });

    // onclick URLs
    const onclickRegex = /https?:\/\/[^'")\s]+/g;
    const onclickMatches = html.match(onclickRegex);
    if (onclickMatches) onclickMatches.forEach(add);

    // Script URLs
    const scriptRegex = /https?:\/\/[^"'\s<>]{10,300}/g;
    const scriptMatches = html.match(scriptRegex);
    if (scriptMatches) {
      scriptMatches.filter(function(u) {
        return /player|embed|stream|video|download|descarg|mp4|m3u8|hls|server|cdn/i.test(u);
      }).forEach(add);
    }

    return [...seen];
  }

  // ─── Utilities ──────────────────────────────────────────────
  _detectGoal(elements) {
    const texts = elements.map(function(e) { return e.text + ' ' + e.class; }).join(' ').toLowerCase();
    if (/manga|manhwa|cap[ií]tulo|chapter/i.test(texts)) return 'manga';
    if (/anime|episodio|pelicula|serie/i.test(texts)) return 'video';
    if (/descarg|download|zip|rar/i.test(texts)) return 'download';
    if (/galer[ií]a|wallpaper|fanart/i.test(texts)) return 'image';
    const hasIframes = elements.some(function(e) { return e.type === 'iframe'; });
    return hasIframes ? 'video' : 'navigation';
  }

  _classifyUrls(urls) {
    const result = {
      videoUrls: [],
      downloadUrls: [],
      serverUrls: [],
      navigationUrls: [],
      otherUrls: [],
    };
    const seen = new Set();

    for (const url of urls) {
      if (seen.has(url)) continue;
      seen.add(url);

      const cls = this.ai.classifyURL(url);
      switch (cls.type) {
        case 'direct-video': case 'stream': result.videoUrls.push(url); break;
        case 'download': result.downloadUrls.push(url); break;
        case 'embed': result.serverUrls.push(url); break;
        case 'navigation': result.navigationUrls.push(url); break;
        default: result.otherUrls.push(url);
      }
    }

    return result;
  }

  _buildCatalog(urls) {
    const servers = new Map();
    const self = this;

    for (const url of urls) {
      const domain = this.ai.extractDomain(url);
      const name = this.ai.inferServerName(domain);
      const cls = this.ai.classifyURL(url);

      if (cls.type === 'tracking' || cls.type === 'social') continue;

      if (!servers.has(name)) servers.set(name, []);
      servers.get(name).push({
        url: url,
        type: cls.type,
        label: domain.slice(0, 40),
      });
    }

    return [...servers.entries()]
      .map(function([name, urls]) {
        return { name, domain: self.ai.extractDomain(urls[0]?.url || ''), urls: urls.slice(0, 8) };
      })
      .sort(function(a, b) { return b.urls.length - a.urls.length; });
  }

  _emptyResult(url, start) {
    return {
      url, title: '', urlsFound: 0, serverCatalog: [],
      findings: { videoUrls: [], downloadUrls: [], serverUrls: [], navigationUrls: [], otherUrls: [] },
      goal: 'unknown', durationMs: Date.now() - start,
    };
  }
}

module.exports = { StaticScraper };
