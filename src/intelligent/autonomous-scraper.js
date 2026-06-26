// autonomous-scraper.js — Intelligent autonomous scraper with session memory
// Ported from sistem-scraper-lite/src/analysis/AutonomousScraper.ts
// Adapted for ovnivers: runs as scheduled maintenance, not in real-time requests
// Discovers working selectors, clicks server buttons, captures URLs, learns across sessions

const { SmartAnalyzer } = require('./smart-analyzer');
const { SessionMemory, textSimilarity } = require('./session-memory');
const { DynamicPageHandler } = require('./dynamic-handler');
const { PageTypeClassifier } = require('./page-type-classifier');
const { SkeletonDetector } = require('./skeleton-detector');
const { getLogger } = require('./logger');

const AD_DOMAINS = /analytics|track|pixel|beacon|adexchange|cookielaw|cookiepedia|onetrust|doubleclick|googlesyndication|googletagmanager/i;

class AutonomousScraper {
  constructor(page, options) {
    this.page = page;
    this.visited = new Set();
    this.urlCollector = [];
    this.steps = [];
    this.stepCount = 0;
    this.requestCount = 0;
    this.maxRequests = (options && options.maxRequests) || 50;
    this.searchTerm = (options && options.searchTerm) || '';
    this.contentGoal = (options && options.contentGoal) || 'auto';
    this.ai = new SmartAnalyzer();
    this.memory = new SessionMemory();
    this.dynamic = new DynamicPageHandler(page);
    this.consecutiveFails = 0;
    this.seenGroupPatterns = new Set();
    this.skipClasses = new Set();
    this.lastModelUrl = '';
    this.cachedModel = null;
    this.pageClassifier = new PageTypeClassifier();
    this.skeletonDetector = new SkeletonDetector();
    this.MAX_TIME = 90000;
    this.MAX_DEPTH = (options && options.maxDepth) || 2;
  }

  _extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url.slice(0, 40);
    }
  }

  async _throttle() {
    this.requestCount++;
    if (this.requestCount > this.maxRequests) {
      getLogger().warn({ max: this.maxRequests }, 'Request limit reached');
      return false;
    }
    const delay = 400 + Math.random() * 800;
    await new Promise(function(r) { setTimeout(r, delay); });
    return true;
  }

  async investigate(url) {
    const log = getLogger();
    const start = Date.now();
    this.urlCollector = [];
    this.steps = [];
    this.stepCount = 0;
    this.consecutiveFails = 0;
    this.seenGroupPatterns.clear();

    // Load skip classes from persistent memory
    this.skipClasses.clear();
    const domains = [this._extractDomain(url)];
    for (let d = 0; d < domains.length; d++) {
      const fp = this.memory.getDomainFingerprint(domains[d]);
      if (fp) {
        fp.failedClasses.forEach(function(fails, cls) {
          const succs = fp.successfulClasses.get(cls) || 0;
          if (fails >= 3 && succs === 0) {
            this.skipClasses.add(cls);
          }
        }.bind(this));
      }
    }
    this.cachedModel = null;
    this.lastModelUrl = '';

    log.info({ skipClasses: this.skipClasses.size }, 'Loaded skip classes from memory');

    const knownUrls = new Set();
    const visitedPages = new Set();
    const self = this;

    const diffAndCollect = function(urls, source, domain) {
      const fresh = [];
      for (let i = 0; i < urls.length; i++) {
        const u = urls[i];
        if (!u || u === 'about:blank' || knownUrls.has(u)) continue;
        if (AD_DOMAINS.test(u)) continue;
        if (AD_DOMAINS.test(self._extractDomain(u))) continue;
        knownUrls.add(u);
        fresh.push(u);
        self.urlCollector.push({ url: u, category: 'unknown', source: source + ' | ' + domain });
      }
      return fresh;
    };

    const explorePage = async function(pageUrl, depth) {
      depth = depth || 0;
      if (Date.now() - start > self.MAX_TIME) return;

      // Early exit if we already found enough servers
      const serverCount = self.urlCollector.filter(function(u) {
        const c = self.ai.classifyURL(u.url, u.source);
        return c.type === 'embed' || c.type === 'direct-video' || c.type === 'stream';
      }).length;
      const effectiveMaxDepth = serverCount >= 3 ? Math.min(self.MAX_DEPTH, depth + 1) : self.MAX_DEPTH;
      if (depth > effectiveMaxDepth) return;

      let fp = pageUrl.split('?')[0].replace(/\/+$/, '');
      fp = fp.replace(/\/\d+$/, '/X');
      if (visitedPages.has(fp)) return;
      visitedPages.add(fp);

      log.debug({ url: pageUrl, depth: depth }, 'Exploring');

      await self.dynamic.navigate(pageUrl, { timeout: 15000 });
      await self.dynamic.triggerLazyElements();
      const domain = self._extractDomain(pageUrl);
      self.memory.setCurrentDomain(domain);

      const model = await self._buildModel();

      // Skeleton check
      const skeletonSelectors = self.skeletonDetector.skeletonSelectors && self.skeletonDetector.skeletonSelectors.get(domain);
      if (skeletonSelectors && skeletonSelectors.size > 10 && depth > 0) {
        const totalEls = model.elements.length;
        let skeletonEls = 0;
        for (let i = 0; i < model.elements.length; i++) {
          if (self.skeletonDetector.isSkeleton(domain, model.elements[i].selector, model.elements[i].text)) skeletonEls++;
        }
        if (totalEls > 0 && skeletonEls / totalEls > 0.7) {
          log.debug({ url: pageUrl, skelPct: Math.round(skeletonEls / totalEls * 100) }, 'Mostly skeleton, scan-only');
          const quickUrls = await self._extractAllUrls();
          diffAndCollect(quickUrls, 'skeleton-scan', pageUrl);
          return;
        }
      }

      const pageUrls = await self._extractAllUrls();

      // Feed skeleton detector
      self.skeletonDetector.addPageFingerprint(
        domain, pageUrl,
        model.elements.map(function(e) { return e.selector; }),
        model.elements.map(function(e) { return e.text; }),
        model.elements.map(function(e) { return e.class; }),
      );

      // Classify page type
      const pageAnalysis = self.pageClassifier.analyze(model.elements, pageUrl, model.title);
      log.info({ type: pageAnalysis.type, conf: pageAnalysis.confidence, signals: pageAnalysis.signals.slice(0, 3).join(', ') }, 'Page classified');

      // ─── Content page strategy: click server buttons ───
      if (pageAnalysis.type === 'content') {
        const contentGroups = self._detectGroups(model.elements);
        for (let g = 0; g < contentGroups.length; g++) {
          const cg = contentGroups[g];
          const isServer = /server|servidor|opcion|download|descarg|video|player|reproduct/i.test(cg.label + cg.labels.join(' '));
          if (!isServer) continue;
          await self._logStep('content-servers', cg.label, 'Servers: ' + cg.labels.slice(0, 5).join(', '));
          for (let i = 0; i < Math.min(cg.items.length, 6); i++) {
            if (Date.now() - start > self.MAX_TIME) break;
            const item = cg.items[i];
            const captured = await self.dynamic.clickAndCaptureUrls(item.selector, 5000);
            diffAndCollect(captured, item.label, domain);
            self.memory.recordAttempt(item.selector, 'clickable', 'click', captured.length > 0, captured.length, captured, domain);
          }
        }
        const finalContentUrls = await self._extractAllUrls();
        diffAndCollect(finalContentUrls, 'content-final', pageUrl);
        return;
      }

      // ─── Detail/listing: find groups, click navigate ───
      const groups = self._detectGroups(model.elements);
      let groupFails = 0;

      for (let g = 0; g < groups.length; g++) {
        if (Date.now() - start > self.MAX_TIME) break;
        if (groupFails >= 2) break;

        const group = groups[g];
        const isNavMenu = /nav|menu|header|footer/i.test(group.label + group.selector);
        if (isNavMenu) continue;
        if (self._shouldSkipElement(group.selector, 'group', group.labels.join(','))) continue;

        await self._logStep('group', group.selector, 'Group: ' + group.labels.slice(0, 5).join(', '));

        const isServerGroup = /server|servidor|opcion|mirror|source|video|player|netu|yourupload|mega|okru|streamtape|filemoon|uqload|hqq|swhoi|burstcloud|streamwish|logo|download|descarg|idioma|language/i.test(group.label + group.labels.join(' '));
        let groupHadSuccess = false;

        for (let i = 0; i < group.items.length; i++) {
          if (Date.now() - start > self.MAX_TIME) break;
          const item = group.items[i];
          if (visitedPages.has(item.selector)) continue;
          visitedPages.add(item.selector);
          if (self._shouldSkipElement(item.selector, 'click', item.label)) continue;

          const href = item.attr && item.attr.href;
          if (href && !isServerGroup && (href.startsWith('http') || href.startsWith('/')) && !href.startsWith('#') && !href.startsWith('javascript:')) {
            await self._logStep('navigate', item.selector, 'Following: "' + item.label + '"');
            try {
              await explorePage(href, depth + 1);
              visitedPages.add(href.split('?')[0].replace(/\/\d+$/, '/X'));
              await self.dynamic.navigate(pageUrl, { timeout: 10000 });
              await self._buildModel();
              groupHadSuccess = true;
            } catch { continue; }
            continue;
          }

          if (isServerGroup) {
            const captured = await self.dynamic.clickAndCaptureUrls(item.selector, 4000);
            const fresh = diffAndCollect(captured, item.label, domain);
            self.memory.recordAttempt(item.selector, 'clickable', 'click', fresh.length > 0, fresh.length, fresh, domain);
            if (fresh.length > 0) groupHadSuccess = true;
          } else if (i < 2) {
            // Only click first 2 non-server items
            await self._safeClick(item.selector);
            const after = await self._extractAllUrls();
            const fresh = diffAndCollect(after, item.label, domain);
            self.memory.recordAttempt(item.selector, 'clickable', 'click', fresh.length > 0, fresh.length, fresh, domain);
            if (fresh.length > 0) groupHadSuccess = true;
          }
        }

        if (groupHadSuccess) groupFails = 0; else groupFails++;
      }

      const finalUrls = await self._extractAllUrls();
      diffAndCollect(finalUrls, 'final', pageUrl);

      // Deep dive into containers
      if (depth < self.MAX_DEPTH && pageUrls.length > 0) {
        const containers = pageUrls
          .filter(function(u) {
            const cls = self.ai.classifyURL(u, u);
            if (AD_DOMAINS.test(u)) return false;
            const d = self._extractDomain(u);
            if (d === domain && /^\/(login|emision|catalogo|comunidad|peticiones|inicio|registro|profile|cuenta)/i.test(new URL(u).pathname)) return false;
            return (cls.isContainer && (cls.type === 'embed' || cls.type === 'navigation'))
              || self.memory.isKnownContainerDomain(d);
          })
          .sort(function(a, b) {
            const aEmb = /embed|player|reproductor|stream|video/i.test(a) ? 0 : 1;
            const bEmb = /embed|player|reproductor|stream|video/i.test(b) ? 0 : 1;
            return aEmb - bEmb;
          })
          .slice(0, 1);

        for (let c = 0; c < containers.length; c++) {
          if (Date.now() - start > self.MAX_TIME) break;
          if (visitedPages.has(containers[c])) continue;
          await self._logStep('dive', self._extractDomain(containers[c]), 'Deep: ' + containers[c].slice(0, 50));
          try {
            await explorePage(containers[c], depth + 1);
            visitedPages.add(containers[c].split('?')[0].replace(/\/\d+$/, '/X'));
            await self.dynamic.navigate(pageUrl, { timeout: 10000 });
            await self._buildModel();
          } catch { continue; }
        }
      }
    };

    const title = await this.page.title();
    await explorePage(url, 0);

    this._categorizeUrls();
    const serverCatalog = this._buildServerCatalog();

    // Learn URL chains
    for (let i = 0; i < this.urlCollector.length; i++) {
      const entry = this.urlCollector[i];
      const cls = this.ai.classifyURL(entry.url, entry.source);
      if (cls.type === 'embed' || cls.type === 'download') {
        const sourceDomain = entry.source.split('|')[1] ? entry.source.split('|')[1].trim() : '';
        if (sourceDomain) {
          this.memory.recordChain(url, entry.url, cls.type === 'embed' ? 'servers' : 'download');
        }
      }
    }

    const duration = Date.now() - start;
    log.info({ steps: this.steps.length, servers: serverCatalog.length, duration: duration }, 'Investigation complete');
    this.memory.forceSave();

    const model = this.cachedModel || await this._buildModel();
    return {
      url: url,
      title: title,
      steps: this.steps,
      serverCatalog: serverCatalog,
      findings: this._categorizeUrls(),
      model: { roles: [...new Set(model.elements.map(function(e) { return e.type; }))], totalElements: model.elements.length, interactions: this.stepCount },
      durationMs: duration,
    };
  }

  // ─── Build semantic page model ─────────────────────────────
  async _buildModel() {
    const currentUrl = this.page.url();
    if (this.cachedModel && this.lastModelUrl === currentUrl) {
      return this.cachedModel;
    }

    const title = await this.page.title();

    const raw = await this.page.evaluate(function() {
      function buildSelector(el) {
        if (el.id) return '#' + CSS.escape(el.id);
        var tag = el.tagName.toLowerCase();
        if (el.className && typeof el.className === 'string') {
          var classes = el.className.toString().trim().split(/\s+/);
          var cls = '';
          for (var i = 0; i < classes.length; i++) {
            if (classes[i].length > 2 && classes[i].length < 40) { cls = classes[i]; break; }
          }
          if (cls) {
            var allSame = document.querySelectorAll(tag + '.' + CSS.escape(cls));
            if (allSame.length > 1) {
              var idx = Array.from(allSame).indexOf(el) + 1;
              return tag + '.' + CSS.escape(cls) + ':nth-of-type(' + idx + ')';
            }
            return tag + '.' + CSS.escape(cls);
          }
        }
        var parent = el.parentElement;
        if (parent) {
          var pidx = Array.from(parent.children).indexOf(el) + 1;
          return buildSelector(parent) + ' > ' + tag + ':nth-child(' + pidx + ')';
        }
        return tag;
      }

      function getAttributes(el) {
        var attrs = {};
        var names = ['id', 'class', 'href', 'src', 'onclick', 'placeholder', 'type', 'alt', 'title', 'data-url', 'data-src', 'data-anime', 'data-value', 'aria-label', 'role'];
        for (var i = 0; i < names.length; i++) {
          var val = el.getAttribute(names[i]);
          if (val) attrs[names[i]] = val.slice(0, 200);
        }
        return attrs;
      }

      function isVisible(el) {
        if (!el.offsetParent && el.tagName !== 'BODY' && el.tagName !== 'HTML') return false;
        var style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }

      function classify(el) {
        var tag = el.tagName.toLowerCase();
        var text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
        var attrs = getAttributes(el);
        if (tag === 'input' || tag === 'textarea') return 'input';
        if (tag === 'select') return 'select';
        if (tag === 'a' || attrs.href) return 'link';
        if (tag === 'button' || attrs.onclick || attrs.role === 'button' || attrs.role === 'tab') return 'clickable';
        if (tag === 'img') return 'image';
        if (tag === 'iframe') return 'iframe';
        if (tag === 'video' || tag === 'audio') return 'media';
        if (/h[1-6]/i.test(tag)) return 'heading';
        if (tag === 'li') return 'list-item';
        if (text.length > 0 && el.children.length === 0) return 'text';
        return 'container';
      }

      var elements = [];
      var all = document.querySelectorAll('*');
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (!isVisible(el)) continue;
        var type = classify(el);
        if (type === 'container' && el.children.length < 2) continue;
        if (type === 'container' && el.children.length > 50) continue;
        elements.push({
          tag: el.tagName,
          selector: buildSelector(el),
          id: el.id || '',
          class: (el.className && typeof el.className === 'string') ? el.className.toString().trim().slice(0, 80) : '',
          text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
          type: type,
          attr: getAttributes(el),
          children: [],
          parent: el.parentElement ? (el.parentElement.id || (el.parentElement.className && typeof el.parentElement.className === 'string' ? el.parentElement.className.toString().split(/\s+/)[0] : '') || el.parentElement.tagName) : '',
          depth: 0
        });
      }
      return elements.slice(0, 300);
    });

    const elements = raw;
    const model = { title: title, elements: elements, semanticTree: [] };
    this.cachedModel = model;
    this.lastModelUrl = currentUrl;
    return model;
  }

  // ─── Detect button groups ──────────────────────────────────
  _detectGroups(elements) {
    const groups = [];
    const clickables = elements.filter(function(e) {
      return (e.type === 'clickable' || e.type === 'link') && e.text.length > 1;
    });

    const byParent = new Map();
    for (let i = 0; i < clickables.length; i++) {
      const el = clickables[i];
      const parentKey = el.parent || 'root';
      if (!byParent.has(parentKey)) byParent.set(parentKey, []);
      byParent.get(parentKey).push(el);
    }

    byParent.forEach(function(siblings) {
      if (siblings.length < 2) return;
      const classes = siblings.map(function(s) { return (s.class || '').split(/\s+/)[0]; }).filter(Boolean);
      const uniqueClasses = [...new Set(classes)];
      if (uniqueClasses.length <= 3 && siblings.length >= 2 && siblings.length <= 20) {
        const skipWords = /login|iniciar|regist|cuenta|discord|telegram|facebook|instagram|chat|cookie|privac|dmca/i;
        const validItems = siblings.filter(function(s) { return !skipWords.test(s.text); });
        if (validItems.length < 2) return;
        groups.push({
          selector: validItems[0].parent || 'body',
          label: validItems[0].parent || 'options',
          count: validItems.length,
          labels: validItems.map(function(s) { return s.text.slice(0, 30); }),
          items: validItems.map(function(s) { return { selector: s.selector, label: s.text.slice(0, 30), attr: s.attr }; }),
        });
      }
    });

    return groups;
  }

  // ─── URL extraction ───────────────────────────────────────
  async _extractAllUrls() {
    const result = await this.page.evaluate(function() {
      var urls = [];
      var seen = {};

      function add(u) {
        if (!u || seen[u]) return;
        if (u.startsWith('#') || u.startsWith('javascript:') || u.startsWith('data:')) return;
        if (u === 'about:blank') return;
        seen[u] = true;
        urls.push(u);
      }

      var iframes = document.querySelectorAll('iframe');
      for (var i = 0; i < iframes.length; i++) {
        add(iframes[i].src || iframes[i].getAttribute('src') || iframes[i].getAttribute('data-src'));
      }

      var mediaEls = document.querySelectorAll('video, video source, audio, audio source, embed, object');
      for (var j = 0; j < mediaEls.length; j++) {
        add(mediaEls[j].src || mediaEls[j].getAttribute('src'));
      }

      var allLinks = document.querySelectorAll('a[href]');
      for (var k = 0; k < Math.min(allLinks.length, 300); k++) {
        add(allLinks[k].href || allLinks[k].getAttribute('href'));
      }

      var clickables = document.querySelectorAll('[onclick]');
      for (var m = 0; m < clickables.length; m++) {
        var oc = clickables[m].getAttribute('onclick') || '';
        var matches = oc.match(/https?:\/\/[^'")\s]+/g);
        if (matches) { for (var n = 0; n < matches.length; n++) add(matches[n]); }
      }

      var dataEls = document.querySelectorAll('[data-url], [data-src], [data-video], [data-embed], [data-href]');
      for (var q = 0; q < dataEls.length; q++) {
        add(dataEls[q].getAttribute('data-url') || dataEls[q].getAttribute('data-src') || dataEls[q].getAttribute('data-video') || dataEls[q].getAttribute('data-embed') || dataEls[q].getAttribute('data-href'));
      }

      var scripts = document.querySelectorAll('script');
      for (var r = 0; r < scripts.length; r++) {
        var txt = scripts[r].textContent || '';
        if (txt.length < 30 || txt.length > 20000) continue;
        var urlPatterns = txt.match(/https?:\/\/[^"'\s<>]{10,300}/g);
        if (urlPatterns) {
          for (var s = 0; s < Math.min(urlPatterns.length, 20); s++) {
            if (/player|embed|stream|video|download|descarg|mp4|m3u8|hls|source|server|cdn/i.test(urlPatterns[s])) {
              add(urlPatterns[s]);
            }
          }
        }
      }

      return urls;
    });
    return result || [];
  }

  // ─── Should skip element ───────────────────────────────────
  _shouldSkipElement(selector, elementType, label) {
    const domain = this._extractDomain(this.page.url());
    if (this.skeletonDetector.isSkeleton(domain, selector, label)) return true;

    const match = selector.match(/\.([\w-]+)/) || selector.match(/#([\w-]+)/);
    const cls = match ? match[1] : '';
    if (cls && this.skipClasses.has(cls)) return true;

    const classBoost = this.memory.getClassBoost(cls);
    if (classBoost > 0 && classBoost <= 5) {
      const fp = this.memory.getDomainFingerprint(domain);
      if (fp) {
        const fails = fp.failedClasses.get(cls) || 0;
        const succs = fp.successfulClasses.get(cls) || 0;
        if (fails >= 3 && succs === 0) {
          this.skipClasses.add(cls);
          return true;
        }
        if (fails > succs * 3 && fails >= 5) {
          this.skipClasses.add(cls);
          getLogger().debug({ class: cls, fails: fails, succs: succs }, 'Skipping known-failure class');
          return true;
        }
      }
    }

    const groupKey = elementType + '|' + label.slice(0, 30);
    if (this.seenGroupPatterns.has(groupKey)) return true;
    return false;
  }

  // ─── Safe click ────────────────────────────────────────────
  async _safeClick(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 3000 });
      await this.page.click(selector);
      await new Promise(function(r) { setTimeout(r, 1000); });
      return true;
    } catch (err) {
      getLogger().debug({ selector: selector, error: err.message }, 'safeClick failed');
      return false;
    }
  }

  // ─── Log step ──────────────────────────────────────────────
  async _logStep(action, target, reasoning) {
    this.stepCount++;
    getLogger().info({ step: this.stepCount, action: action, target: target }, reasoning);
    this.steps.push({
      step: this.stepCount, action: action, target: target, reasoning: reasoning,
      result: { action: action, target: target, success: true, changes: 0, newUrls: [] },
    });
  }

  // ─── Categorize URLs ───────────────────────────────────────
  _categorizeUrls() {
    const result = { videoUrls: [], downloadUrls: [], serverUrls: [], navigationUrls: [], otherUrls: [] };
    const seen = new Set();

    for (let i = 0; i < this.urlCollector.length; i++) {
      const entry = this.urlCollector[i];
      if (seen.has(entry.url)) continue;
      seen.add(entry.url);

      const cls = this.ai.classifyURL(entry.url, entry.source);
      switch (cls.type) {
        case 'direct-video': case 'stream': entry.category = cls.type; result.videoUrls.push(entry.url); break;
        case 'download': entry.category = 'download'; result.downloadUrls.push(entry.url); break;
        case 'embed': entry.category = 'embed'; result.serverUrls.push(entry.url); break;
        case 'navigation': entry.category = 'navigation'; result.navigationUrls.push(entry.url); break;
        default: entry.category = cls.type; result.otherUrls.push(entry.url);
      }
    }

    result.videoUrls = [...new Set(result.videoUrls)];
    result.downloadUrls = [...new Set(result.downloadUrls)];
    result.serverUrls = [...new Set(result.serverUrls)];
    result.navigationUrls = [...new Set(result.navigationUrls)];
    result.otherUrls = [...new Set(result.otherUrls)];
    return result;
  }

  // ─── Build server catalog ──────────────────────────────────
  _buildServerCatalog() {
    const servers = new Map();
    const self = this;

    for (let i = 0; i < this.urlCollector.length; i++) {
      const entry = this.urlCollector[i];
      const domain = this.ai.extractDomain(entry.url);
      const serverName = this.ai.inferServerName(domain);

      if (!servers.has(serverName)) {
        servers.set(serverName, []);
      }

      const list = servers.get(serverName);
      const cls = this.ai.classifyURL(entry.url, entry.source);
      const type = cls.type === 'unknown' ? 'other' : cls.type;

      list.push({ url: entry.url, type: type, label: entry.source.split('|')[0].trim().slice(0, 40) });
    }

    const catalog = [];
    servers.forEach(function(urls, name) {
      const unique = self._deduplicateUrls(urls);
      catalog.push({ name: name, domain: name, urls: unique });
    });

    return catalog.sort(function(a, b) { return b.urls.length - a.urls.length; });
  }

  _deduplicateUrls(urls) {
    const seen = new Set();
    const result = [];
    const self = this;

    for (let i = 0; i < urls.length; i++) {
      const item = urls[i];
      const fingerprint = self._urlFingerprint(item.url);
      if (seen.has(fingerprint)) continue;

      const existing = result.find(function(r) {
        return self._urlFingerprint(r.url).slice(0, 30) === fingerprint.slice(0, 30);
      });

      if (!existing) {
        seen.add(fingerprint);
        result.push(item);
      }
    }

    return result.slice(0, 8);
  }

  _urlFingerprint(url) {
    try {
      const u = new URL(url);
      const params = new URLSearchParams(u.search);
      const sorted = [...params.entries()].sort().map(function(e) { return e[0] + '=' + e[1]; }).join('&');
      return u.hostname.replace('www.', '') + u.pathname + '?' + sorted;
    } catch {
      return url.replace(/https?:\/\//, '').split('?')[0].slice(0, 60);
    }
  }

  // ─── QUICK EXTRACT: Fast path for content pages (8-15s) ────
  // No recursive exploration — just extract streams from the current page
  async quickExtract(url) {
    const log = getLogger();
    const start = Date.now();
    this.urlCollector = [];
    this.steps = [];
    this.stepCount = 0;

    log.info('QuickExtract: ' + url);

    await this.dynamic.navigate(url, { timeout: 15000 });
    await this.dynamic.triggerLazyElements();
    const domain = this._extractDomain(url);
    this.memory.setCurrentDomain(domain);

    const model = await this._buildModel();

    // Classify page
    const pageAnalysis = this.pageClassifier.analyze(model.elements, url, model.title);
    log.info('Page: ' + pageAnalysis.type + ' conf=' + pageAnalysis.confidence + ' ' + pageAnalysis.signals.slice(0, 3).join(', '));

    // Strategy: if content page, click server buttons
    if (pageAnalysis.type === 'content') {
      // First, grab all visible iframe srcs
      const iframeUrls = await this._extractAllUrls();
      for (let i = 0; i < iframeUrls.length; i++) {
        const u = iframeUrls[i];
        if (u && u.startsWith('http') && !AD_DOMAINS.test(u)) {
          this.urlCollector.push({ url: u, category: 'unknown', source: 'iframe | ' + domain });
        }
      }

      // Find server button groups
      const groups = this._detectGroups(model.elements);
      for (let g = 0; g < groups.length; g++) {
        const cg = groups[g];
        const isServer = /server|servidor|opcion|download|descarg|video|player|reproduct|mirror|source|calidad/i.test(cg.label + cg.labels.join(' '));
        if (!isServer) continue;

        log.info('Server group: ' + cg.labels.slice(0, 5).join(', '));
        await this._logStep('click-servers', cg.label, 'Clicking: ' + cg.labels.slice(0, 5).join(', '));

        for (let i = 0; i < Math.min(cg.items.length, 8); i++) {
          if (Date.now() - start > 30000) break;
          const item = cg.items[i];
          if (this._shouldSkipElement(item.selector, 'click', item.label)) {
            log.debug('Skip: ' + item.label);
            continue;
          }

          const captured = await this.dynamic.clickAndCaptureUrls(item.selector, 4000);
          this.memory.recordAttempt(item.selector, 'clickable', 'click', captured.length > 0, captured.length, captured, domain);

          if (captured.length > 0) {
            log.info('Captured ' + captured.length + ' URLs from: ' + item.label);
            for (let j = 0; j < captured.length; j++) {
              if (!AD_DOMAINS.test(captured[j])) {
                this.urlCollector.push({ url: captured[j], category: 'unknown', source: item.label + ' | ' + domain });
              }
            }
          }
        }
      }

      // Final extraction after all clicks
      const finalUrls = await this._extractAllUrls();
      for (let i = 0; i < finalUrls.length; i++) {
        if (finalUrls[i] && finalUrls[i].startsWith('http') && !AD_DOMAINS.test(finalUrls[i])) {
          const exists = this.urlCollector.some(function(u) { return u.url === finalUrls[i]; });
          if (!exists) {
            this.urlCollector.push({ url: finalUrls[i], category: 'unknown', source: 'final | ' + domain });
          }
        }
      }
    } else {
      // Non-content page: just extract all visible URLs
      log.info('Non-content page (' + pageAnalysis.type + '), extracting visible URLs only');
      const allUrls = await this._extractAllUrls();
      for (let i = 0; i < allUrls.length; i++) {
        if (allUrls[i] && allUrls[i].startsWith('http') && !AD_DOMAINS.test(allUrls[i])) {
          this.urlCollector.push({ url: allUrls[i], category: 'unknown', source: 'static | ' + domain });
        }
      }
    }

    this._categorizeUrls();
    const serverCatalog = this._buildServerCatalog();
    const duration = Date.now() - start;

    // Learn URL chains
    for (let i = 0; i < this.urlCollector.length; i++) {
      const entry = this.urlCollector[i];
      const cls = this.ai.classifyURL(entry.url, entry.source);
      if (cls.type === 'embed' || cls.type === 'download') {
        this.memory.recordChain(url, entry.url, cls.type === 'embed' ? 'servers' : 'download');
      }
    }

    this.memory.forceSave();
    log.info('QuickExtract done: ' + serverCatalog.length + ' servers, ' + duration + 'ms');

    return {
      url: url,
      title: model.title,
      steps: this.steps,
      serverCatalog: serverCatalog,
      findings: this._categorizeUrls(),
      durationMs: duration,
      pageType: pageAnalysis.type,
      pageConfidence: pageAnalysis.confidence,
    };
  }
}

module.exports = { AutonomousScraper };
