// dynamic-handler.js — SPA-aware page navigation, lazy loading, network interception
// Ported from sistem-scraper-lite/src/analysis/DynamicPageHandler.ts
// Simplified for ovnivers: no infinite scroll, no shadow DOM piercing
// Core: navigate, waitForContent, triggerLazyElements, clickAndCaptureUrls

const { getLogger } = require('./logger');

class DynamicPageHandler {
  constructor(page) {
    this.page = page;
    this.adaptiveWaitMs = 2000;
  }

  async navigate(url, options) {
    const log = getLogger();
    const timeout = (options && options.timeout) || 15000;

    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeout });
      await new Promise(function(r) { setTimeout(r, 1500); });
    } catch (err) {
      log.debug({ url: url, error: err.message }, 'Navigation failed');
    }
  }

  async waitForContent(options) {
    options = options || {};
    const timeout = options.timeout || 10000;
    const waitForSelectors = options.waitForSelectors || [];
    const minDomStability = options.minDomStability || 300;
    const checkInterval = options.checkInterval || 250;

    const log = getLogger();
    const start = Date.now();
    let lastNodeCount = 0;
    let stableSince = 0;

    while (Date.now() - start < timeout) {
      await new Promise(function(r) { setTimeout(r, checkInterval); });

      const nodeCount = await this.getDomCount();
      const urlChanged = options.waitForUrlChange
        ? await this.page.evaluate(function() {
            return (window.__scraper_initial_url !== window.location.href);
          }).catch(function() { return false; })
        : false;

      if (nodeCount === lastNodeCount) {
        stableSince += checkInterval;
      } else {
        stableSince = 0;
        lastNodeCount = nodeCount;
        this.adaptiveWaitMs = Math.min(this.adaptiveWaitMs + 200, 5000);
      }

      let selectorsReady = true;
      for (let i = 0; i < waitForSelectors.length; i++) {
        const sel = waitForSelectors[i];
        const exists = await this.page.$(sel).then(function(el) { return !!el; }).catch(function() { return false; });
        if (!exists) { selectorsReady = false; break; }
      }

      const domStable = stableSince >= minDomStability;
      const selOk = waitForSelectors.length === 0 || selectorsReady;
      const urlOk = !options.waitForUrlChange || urlChanged;

      if (domStable && selOk && urlOk) {
        log.debug({ elapsed: Date.now() - start, stableMs: stableSince, nodes: nodeCount }, 'Content ready');
        return;
      }
    }

    const remaining = timeout - (Date.now() - start);
    if (waitForSelectors.length > 0 && remaining > 0) {
      for (let i = 0; i < waitForSelectors.length; i++) {
        try {
          await this.page.waitForSelector(waitForSelectors[i], { timeout: remaining });
        } catch { /* continue */ }
      }
    }

    const elapsed = Date.now() - start;
    if (elapsed < this.adaptiveWaitMs) {
      await new Promise(function(r) { setTimeout(r, this.adaptiveWaitMs - elapsed); }.bind(this));
    }
  }

  async triggerLazyElements() {
    const result = await this.page.evaluate(function() {
      let triggered = 0;

      const lazyImgs = document.querySelectorAll('img[loading="lazy"], img[data-src], img[data-lazy], img[data-original]');
      lazyImgs.forEach(function(img) {
        const src = img.getAttribute('data-src') || img.getAttribute('data-lazy') || img.getAttribute('data-original');
        if (src && !img.src) { img.src = src; triggered++; }
        if (img.loading === 'lazy') { img.loading = 'eager'; triggered++; }
      });

      const lazyIframes = document.querySelectorAll('iframe[loading="lazy"], iframe[data-src]');
      lazyIframes.forEach(function(f) {
        const src = f.getAttribute('data-src');
        if (src && !f.src) { f.src = src; triggered++; }
      });

      const hiddenDivs = document.querySelectorAll('[data-loaded="false"], .lazy-hidden, .lazyload');
      hiddenDivs.forEach(function(el) {
        el.style.display = el.style.display || 'block';
        el.classList.remove('lazy-hidden', 'lazyload');
        triggered++;
      });

      return triggered;
    });

    if (result > 0) {
      getLogger().debug({ triggered: result }, 'Lazy elements triggered');
    }

    return result;
  }

  async clickAndCaptureUrls(clickSelector, timeout) {
    timeout = timeout || 6000;
    const capturedUrls = new Set();

    const handler = function(response) {
      try {
        const url = response.url();
        if (url && url.startsWith('http') && !url.includes('google') && !url.includes('analytics')) {
          capturedUrls.add(url);
        }
      } catch { /* ignore */ }
    };

    try {
      this.page.on('response', handler);
      await this.page.waitForSelector(clickSelector, { timeout: 3000 });
      await this.page.click(clickSelector);
      await new Promise(function(r) { setTimeout(r, timeout); });
      this.page.off('response', handler);

      const iframeUrls = await this.page.evaluate(function() {
        const iframes = document.querySelectorAll('iframe');
        const urls = [];
        iframes.forEach(function(f) {
          if (f.src && f.src !== 'about:blank') urls.push(f.src);
        });
        return urls;
      });
      iframeUrls.forEach(function(u) { capturedUrls.add(u); });

      return [...capturedUrls];
    } catch (err) {
      this.page.off('response', handler);
      getLogger().debug({ error: err.message }, 'clickAndCapture failed');
      return [];
    }
  }

  async getDomCount() {
    return this.page.evaluate(function() {
      return document.querySelectorAll('*').length;
    });
  }

  getAdaptiveWaitMs() { return this.adaptiveWaitMs; }
  resetAdaptiveWait() { this.adaptiveWaitMs = 2000; }
}

module.exports = { DynamicPageHandler };
