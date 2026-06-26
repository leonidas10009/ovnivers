// skeleton-detector.js — Cross-page deduplication of site chrome
// Ported from sistem-scraper-lite/src/analysis/SkeletonDetector.ts
// Detects headers, footers, nav menus, auth prompts that repeat across pages
// Prevents scraping the same navigation chrome on every page visit

const { getLogger } = require('./logger');

class SkeletonDetector {
  constructor() {
    this.fingerprints = new Map();       // domain → PageFingerprint[]
    this.skeletonSelectors = new Map();  // domain → Set<selector>
    this.skeletonTexts = new Map();      // domain → Set<text>
  }

  addPageFingerprint(domain, url, selectors, texts, classes) {
    if (!this.fingerprints.has(domain)) {
      this.fingerprints.set(domain, []);
    }

    const fp = {
      url,
      selectors: new Set(selectors),
      texts: new Set(texts),
      classes: new Set(classes),
    };

    const domainFps = this.fingerprints.get(domain);
    domainFps.push(fp);

    if (domainFps.length >= 2) {
      this._detectSkeleton(domain, domainFps);
    }
  }

  isSkeleton(domain, selector, text) {
    const domainSelectors = this.skeletonSelectors.get(domain);
    const domainTexts = this.skeletonTexts.get(domain);

    if (domainSelectors && domainSelectors.has(selector)) return true;
    if (domainTexts && domainTexts.has((text || '').toLowerCase().trim())) return true;
    if (this._isUniversalSkeleton(selector, text)) return true;

    return false;
  }

  _detectSkeleton(domain, fps) {
    if (fps.length < 2) return;

    const selectors = new Set();
    const texts = new Set();

    const first = fps[0];
    const second = fps[1];

    for (const sel of first.selectors) {
      if (second.selectors.has(sel) && fps.every(function(f) { return f.selectors.has(sel); })) {
        selectors.add(sel);
      }
    }

    for (const text of first.texts) {
      if (second.texts.has(text) && fps.every(function(f) { return f.texts.has(text); })) {
        if (text.length >= 2 && text.length <= 40) {
          texts.add(text);
        }
      }
    }

    if (selectors.size > 0 || texts.size > 0) {
      this.skeletonSelectors.set(domain, selectors);
      this.skeletonTexts.set(domain, texts);
      getLogger().info({
        domain,
        skeletonSelectors: selectors.size,
        skeletonTexts: texts.size,
        samples: [...texts].slice(0, 8).join(', '),
      }, 'Skeleton detected on domain');
    }
  }

  _isUniversalSkeleton(selector, text) {
    const sel = (selector || '').toLowerCase();
    const txt = (text || '').toLowerCase().trim();

    // Auth patterns
    if (/login|sign.?in|sign.?up|register|regist|iniciar\s*sesi|cerrar\s*sesi|logout|cuenta|account|perfil|profile|contrase|password|olvid|forgot/i.test(txt)) return true;

    // Universal navigation
    if (/nav|menu|header|footer|sidebar|breadcrumb/i.test(sel)) return true;

    // Social links
    if (/discord|telegram|facebook|twitter|instagram|whatsapp|reddit|tiktok|youtube/i.test(txt)) return true;

    // Cookie/privacy buttons
    if (/cookie|privac|dmca|terms|tos|condiciones|aceptar|rechazar/i.test(txt)) return true;

    // Language/currency selectors
    if (/language|idioma|lang|currency|moneda|region|pais/i.test(sel + txt)) return true;

    // Footer elements
    if (sel.startsWith('footer') || sel.includes('.footer')) return true;

    return false;
  }

  clear() {
    this.fingerprints.clear();
    this.skeletonSelectors.clear();
    this.skeletonTexts.clear();
  }
}

module.exports = { SkeletonDetector };
