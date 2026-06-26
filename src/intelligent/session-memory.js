// session-memory.js — Persistent bayesian learning for scraper selectors
// Ported from sistem-scraper-lite/src/analysis/SessionMemory.ts
// Stores success/failure stats per CSS class, element type, and domain
// Persists to .scraper-memory.json for cross-session learning

const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { getLogger } = require('./logger');

// ─── Bayesian estimate helper ──────────────────────────────────
function bayesianEstimate(successes, failures) {
  const alpha = successes + 1;
  const beta = failures + 1;
  const total = alpha + beta;
  return { alpha, beta, mean: alpha / total, confidence: Math.min(total / 10, 1) };
}

// ─── Text similarity (Jaccard + Dice) ──────────────────────────
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúñ0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(function(t) { return t.length > 1; });
}

function textSimilarity(query, candidate) {
  const qTokens = tokenize(query);
  const cTokens = tokenize(candidate);
  if (qTokens.length === 0 || cTokens.length === 0) return 0;

  const qSet = new Set(qTokens);
  const cSet = new Set(cTokens);
  let intersection = 0;
  for (const t of qSet) { if (cSet.has(t)) intersection++; }
  const union = qSet.size + cSet.size - intersection;

  const jaccard = intersection / union;
  const dice = (2 * intersection) / (qSet.size + cSet.size);
  return Math.round((dice * 0.7 + jaccard * 0.3) * 100) / 100;
}

// ─── Class generalization ──────────────────────────────────────
function generalizeClass(cls) {
  const result = [];
  const lower = cls.toLowerCase();

  if (lower.includes('-')) {
    const parts = lower.split('-');
    if (parts.length === 2) {
      result.push('*-' + parts[1]);
      result.push(parts[0] + '-*');
    }
  }

  const keywordPatterns = {
    '*-server*': /server|servidor/i,
    '*-player*': /player|reproductor/i,
    '*-list*': /list|lista/i,
    '*-btn*': /btn|button|boton/i,
    '*-card*': /card|tarjeta|item/i,
    '*-tab*': /tab|pestaña/i,
    '*-lang*': /idioma|language|lang/i,
    '*-download*': /download|descarg/i,
  };

  for (const [pattern, regex] of Object.entries(keywordPatterns)) {
    if (regex.test(lower) && !result.includes(pattern)) {
      result.push(pattern);
    }
  }

  return result;
}

function extractDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url.slice(0, 40); }
}

function extractClass(selector) {
  const classMatch = selector.match(/\.([a-zA-Z_][\w-]*)/);
  if (classMatch) return classMatch[1];
  const idMatch = selector.match(/#([a-zA-Z_][\w-]*)/);
  if (idMatch) return idMatch[1];
  const childMatch = selector.match(/>\s*(\w+)/);
  if (childMatch) return childMatch[1];
  return '';
}

// ─── SessionMemory ────────────────────────────────────────────
class SessionMemory {
  constructor(persistPath) {
    this.patterns = [];
    this.typeBoosts = new Map();       // type → {s, f}
    this.actionBoosts = new Map();     // action → {s, f}
    this.classBoosts = new Map();      // class → {s, f}
    this.containerDomains = new Set();
    this.domainFingerprints = new Map();
    this.urlChains = new Map();
    this.successCount = 0;
    this.totalAttempts = 0;
    this.lastDomain = '';
    this.persistPath = persistPath || join(process.cwd(), '.scraper-memory.json');
    this._load();
  }

  // ─── Persistence ────────────────────────────────────────────
  _load() {
    try {
      if (!existsSync(this.persistPath)) return;
      const raw = readFileSync(this.persistPath, 'utf-8');
      const data = JSON.parse(raw);
      if (data.version < 1) return;

      for (const [domain, fp] of Object.entries(data.domains || {})) {
        this.domainFingerprints.set(domain, {
          domain,
          successfulClasses: new Map(Object.entries(fp.successfulClasses || {})),
          successfulTypes: new Map(Object.entries(fp.successfulTypes || {})),
          failedClasses: new Map(Object.entries(fp.failedClasses || {})),
          containerUrls: fp.containerUrls || [],
          avgResponseTime: fp.avgResponseTime || 0,
          visits: fp.visits || 0,
          lastVisit: fp.lastVisit || 0,
        });
      }

      for (const [, fp] of this.domainFingerprints) {
        for (const [cls, count] of fp.successfulClasses) {
          const stats = this.classBoosts.get(cls) || { s: 0, f: 0 };
          stats.s += count;
          this.classBoosts.set(cls, stats);
        }
        for (const [cls, count] of fp.failedClasses) {
          const stats = this.classBoosts.get(cls) || { s: 0, f: 0 };
          stats.f += count;
          this.classBoosts.set(cls, stats);
        }
        for (const [type, count] of fp.successfulTypes) {
          const stats = this.typeBoosts.get(type) || { s: 0, f: 0 };
          stats.s += count;
          this.typeBoosts.set(type, stats);
        }
      }

      for (const d of data.containerDomains || []) { this.containerDomains.add(d); }

      if (data.version >= 2 && data.urlChains) {
        for (const [key, chains] of Object.entries(data.urlChains)) {
          this.urlChains.set(key, chains);
        }
      }

      this.patterns = (data.patterns || []).slice(-100);
      this.totalAttempts = data.totalAttempts || 0;
      this.successCount = data.successCount || 0;

      getLogger().debug({ path: this.persistPath, domains: this.domainFingerprints.size }, 'Memory loaded from disk');
    } catch (err) {
      getLogger().debug({ error: err.message }, 'Memory load failed, starting fresh');
    }
  }

  _save() {
    try {
      const domains = {};
      for (const [domain, fp] of this.domainFingerprints) {
        domains[domain] = {
          domain: fp.domain,
          successfulClasses: Object.fromEntries(fp.successfulClasses),
          successfulTypes: Object.fromEntries(fp.successfulTypes),
          failedClasses: Object.fromEntries(fp.failedClasses),
          containerUrls: fp.containerUrls,
          avgResponseTime: fp.avgResponseTime,
          visits: fp.visits,
          lastVisit: fp.lastVisit,
        };
      }

      const urlChains = {};
      for (const [key, chains] of this.urlChains) {
        urlChains[key] = chains;
      }

      const data = {
        version: 2,
        domains,
        patterns: this.patterns.slice(-200),
        containerDomains: [...this.containerDomains],
        urlChains,
        totalAttempts: this.totalAttempts,
        successCount: this.successCount,
      };

      writeFileSync(this.persistPath, JSON.stringify(data, null, 2));
    } catch (err) {
      getLogger().debug({ error: err.message }, 'Memory save failed');
    }
  }

  // ─── Recording ──────────────────────────────────────────────
  recordAttempt(selector, elementType, action, success, urlsFound, urlTypes, domain) {
    this.totalAttempts++;
    const cls = extractClass(selector);
    const dom = domain || this.lastDomain;

    const record = {
      selector, selectorClass: cls, elementType, action,
      urlsFound, urlTypes, success, domain: dom,
      timestamp: Date.now(),
    };
    this.patterns.push(record);

    const tKey = elementType;
    const aKey = action;

    if (!this.typeBoosts.has(tKey)) this.typeBoosts.set(tKey, { s: 0, f: 0 });
    if (!this.actionBoosts.has(aKey)) this.actionBoosts.set(aKey, { s: 0, f: 0 });

    if (cls) {
      if (!this.classBoosts.has(cls)) this.classBoosts.set(cls, { s: 0, f: 0 });
      for (const gCls of generalizeClass(cls)) {
        if (!this.classBoosts.has(gCls)) this.classBoosts.set(gCls, { s: 0, f: 0 });
      }
    }

    if (success && urlsFound > 0) {
      this.successCount++;
      this.typeBoosts.get(tKey).s += urlsFound;
      this.actionBoosts.get(aKey).s += 1;
      if (cls) {
        this.classBoosts.get(cls).s += urlsFound;
        for (const gCls of generalizeClass(cls)) {
          this.classBoosts.get(gCls).s += urlsFound * 0.5;
        }
      }
      this._updateDomainFingerprint(dom, cls, elementType, true, urlsFound, urlTypes);
    } else {
      this.typeBoosts.get(tKey).f += 1;
      this.actionBoosts.get(aKey).f += 1;
      if (cls) {
        this.classBoosts.get(cls).f += 1;
        for (const gCls of generalizeClass(cls)) {
          this.classBoosts.get(gCls).f += 1;
        }
      }
      this._updateDomainFingerprint(dom, cls, elementType, false, 0, []);
    }

    if (this.totalAttempts % 10 === 0) {
      this._save();
    }
  }

  // ─── Scoring ────────────────────────────────────────────────
  getTypeBoost(elementType) {
    const stats = this.typeBoosts.get(elementType);
    if (!stats) return 0;
    const est = bayesianEstimate(stats.s, stats.f);
    return Math.round(Math.min(est.mean * 25, 25));
  }

  getActionBoost(action) {
    const stats = this.actionBoosts.get(action);
    if (!stats) return 0;
    const est = bayesianEstimate(stats.s, stats.f);
    return Math.round(Math.min(est.mean * 15, 15));
  }

  getClassBoost(cls) {
    const stats = this.classBoosts.get(cls);
    if (!stats) return 0;
    const est = bayesianEstimate(stats.s, stats.f);
    return Math.round(Math.min(est.mean * 20, 20));
  }

  predictSuccess(elementType, elementClass, domain) {
    const signals = [];
    let totalScore = 0;
    let totalWeight = 0;

    const typeBoost = this.getTypeBoost(elementType);
    if (typeBoost > 0) {
      totalScore += typeBoost / 25;
      totalWeight += 1;
      signals.push('type:' + elementType + '=' + typeBoost + '/25');
    }

    if (elementClass) {
      const classBoost = this.getClassBoost(elementClass);
      if (classBoost > 0) {
        totalScore += classBoost / 20;
        totalWeight += 1.5;
        signals.push('class:' + elementClass + '=' + classBoost + '/20');
      }
    }

    if (domain && this.domainFingerprints.has(domain)) {
      const fp = this.domainFingerprints.get(domain);
      let domSuccesses = 0, domTotal = 0;
      for (const [, v] of fp.successfulClasses) { domSuccesses += v; domTotal += v; }
      for (const [, v] of fp.failedClasses) { domTotal += v; }
      if (domTotal > 0) {
        const domRate = domSuccesses / domTotal;
        totalScore += domRate;
        totalWeight += 0.5;
        signals.push('domain:' + domain + '=' + Math.round(domRate * 100) + '%');
      }
    }

    if (elementClass) {
      for (const gCls of generalizeClass(elementClass)) {
        const gBoost = this.getClassBoost(gCls);
        if (gBoost > 5) {
          totalScore += gBoost / 40;
          totalWeight += 0.3;
          signals.push('gen:' + gCls + '=' + gBoost + '/20');
        }
      }
    }

    const estimatedSuccess = totalWeight > 0 ? Math.min(1, totalScore / totalWeight) : 0.5;
    const confidence = Math.min(1, totalWeight / 3);
    return { estimatedSuccess, confidence, signals };
  }

  getPredictions() {
    const elementTypes = [...new Set(this.patterns.map(function(p) { return p.elementType; }))];
    return elementTypes.map(function(type) {
      const pred = this.predictSuccess(type, '', this.lastDomain);
      return { elementType: type, estimatedSuccess: pred.estimatedSuccess, confidence: pred.confidence };
    }, this).sort(function(a, b) { return b.estimatedSuccess - a.estimatedSuccess; });
  }

  // ─── Container domains ──────────────────────────────────────
  isKnownContainerDomain(domain) {
    if (this.containerDomains.has(domain)) return true;
    const fp = this.domainFingerprints.get(domain);
    return fp ? fp.containerUrls.length > 0 : false;
  }

  addContainerDomain(domain) {
    if (!this.containerDomains.has(domain)) {
      this.containerDomains.add(domain);
      this._save();
    }
  }

  // ─── URL Chain learning ─────────────────────────────────────
  recordChain(fromUrl, toUrl, resultType) {
    const fromDomain = extractDomain(fromUrl);
    const fromPattern = this._extractPathPattern(fromUrl);
    if (!fromPattern || fromPattern.length < 3) return;

    const chainKey = fromDomain + '|' + fromPattern;
    if (!this.urlChains.has(chainKey)) {
      this.urlChains.set(chainKey, []);
    }

    const chains = this.urlChains.get(chainKey);
    const existing = chains.find(function(c) { return c.toType === resultType; });

    if (existing) {
      existing.confidence = Math.min(100, existing.confidence + 20);
      existing.lastSuccess = Date.now();
    } else {
      chains.push({
        fromPattern,
        toType: resultType,
        confidence: 60,
        lastSuccess: Date.now(),
        sampleFrom: fromUrl.slice(0, 80),
        sampleTo: toUrl.slice(0, 80),
      });
    }

    this._save();
    getLogger().debug({ from: fromPattern, to: resultType }, 'URL chain recorded');
  }

  getChainsForDomain(domain) {
    const results = [];
    for (const [key, chains] of this.urlChains) {
      if (key.startsWith(domain + '|')) {
        results.push(...chains);
      }
    }
    return results.sort(function(a, b) { return b.confidence - a.confidence; });
  }

  _extractPathPattern(url) {
    try {
      let pattern = new URL(url).pathname;
      pattern = pattern.replace(/\/[^/]+\/\d+$/, '/{num}');
      pattern = pattern.replace(/\d+x\d+/, '{ep}');
      const parts = pattern.split('/').filter(Boolean);
      if (parts.length >= 1) {
        const last = parts[parts.length - 1];
        if (!last.includes('{') && !/^\d+$/.test(last)) {
          parts[parts.length - 1] = '{slug}';
        }
      }
      return '/' + parts.join('/') + '/';
    } catch {
      return '';
    }
  }

  // ─── Current domain ─────────────────────────────────────────
  setCurrentDomain(domain) {
    this.lastDomain = domain;
    if (this.domainFingerprints.has(domain)) {
      this.domainFingerprints.get(domain).lastVisit = Date.now();
    }
  }

  getDomainFingerprint(domain) {
    return this.domainFingerprints.get(domain);
  }

  getCurrentDomainSuccessRate() {
    const fp = this.domainFingerprints.get(this.lastDomain);
    if (!fp) return 1;
    let s = 0, f = 0;
    for (const [, v] of fp.successfulClasses) s += v;
    for (const [, v] of fp.failedClasses) f += v;
    if (s + f === 0) return 1;
    return s / (s + f);
  }

  getSuccessRate() {
    if (this.totalAttempts === 0) return 1;
    return this.successCount / this.totalAttempts;
  }

  // ─── Patterns ───────────────────────────────────────────────
  getTopPatterns(limit) {
    limit = limit || 5;
    return this.patterns
      .filter(function(p) { return p.success && p.urlsFound > 0; })
      .sort(function(a, b) { return b.urlsFound - a.urlsFound; })
      .slice(0, limit);
  }

  getTopClassesForDomain(domain, limit) {
    limit = limit || 5;
    const fp = this.domainFingerprints.get(domain);
    if (!fp) return [];
    return [...fp.successfulClasses]
      .sort(function(a, b) { return b[1] - a[1]; })
      .slice(0, limit)
      .map(function(e) { return e[0]; });
  }

  getBestClass() {
    let best = '';
    let bestScore = 0;
    for (const [cls, stats] of this.classBoosts) {
      const est = bayesianEstimate(stats.s, stats.f);
      if (est.mean > bestScore && est.confidence > 1) {
        bestScore = est.mean;
        best = cls;
      }
    }
    return best || null;
  }

  // ─── Report ─────────────────────────────────────────────────
  getAdaptiveScores() {
    const classBoosts = {};
    for (const [cls] of this.classBoosts) {
      classBoosts[cls] = this.getClassBoost(cls);
    }

    let currentFingerprint = null;
    if (this.lastDomain) {
      const fp = this.domainFingerprints.get(this.lastDomain);
      if (fp) {
        currentFingerprint = {
          domain: this.lastDomain,
          topClasses: [...fp.successfulClasses]
            .sort(function(a, b) { return b[1] - a[1]; })
            .slice(0, 5)
            .map(function(e) { return e[0]; }),
          successRate: this.getCurrentDomainSuccessRate(),
        };
      }
    }

    return {
      typeBoosts: Object.fromEntries(
        [...this.typeBoosts.keys()].map(function(k) { return [k, this.getTypeBoost(k)]; }, this),
      ),
      actionBoosts: Object.fromEntries(
        [...this.actionBoosts.keys()].map(function(k) { return [k, this.getActionBoost(k)]; }, this),
      ),
      classBoosts,
      containerDomains: [...this.containerDomains],
      topPatterns: this.getTopPatterns(),
      currentFingerprint,
      predictions: this.getPredictions(),
    };
  }

  // ─── Maintenance ────────────────────────────────────────────
  clear() {
    this.patterns = [];
    this.typeBoosts.clear();
    this.actionBoosts.clear();
    this.classBoosts.clear();
    this.containerDomains.clear();
    this.domainFingerprints.clear();
    this.successCount = 0;
    this.totalAttempts = 0;
    this.lastDomain = '';
    this._save();
  }

  forceSave() {
    this._save();
  }

  // ─── Internal ───────────────────────────────────────────────
  _updateDomainFingerprint(domain, cls, elementType, success, urlsFound, urlTypes) {
    if (!domain) return;

    if (!this.domainFingerprints.has(domain)) {
      this.domainFingerprints.set(domain, {
        domain,
        successfulClasses: new Map(),
        successfulTypes: new Map(),
        failedClasses: new Map(),
        containerUrls: [],
        avgResponseTime: 0,
        visits: 0,
        lastVisit: Date.now(),
      });
    }

    const fp = this.domainFingerprints.get(domain);
    fp.visits++;
    fp.lastVisit = Date.now();

    if (success && urlsFound > 0) {
      if (cls) {
        fp.successfulClasses.set(cls, (fp.successfulClasses.get(cls) || 0) + urlsFound);
      }
      fp.successfulTypes.set(elementType, (fp.successfulTypes.get(elementType) || 0) + urlsFound);

      for (const ut of urlTypes) {
        if (ut.startsWith('http')) {
          try {
            const dom = new URL(ut).hostname.replace('www.', '');
            if (!fp.containerUrls.includes(dom)) {
              fp.containerUrls.push(dom);
            }
            this.containerDomains.add(dom);
          } catch { /* ignore */ }
        } else if (ut === 'embed' || ut === 'download') {
          if (!fp.containerUrls.includes(domain)) {
            fp.containerUrls.push(domain);
          }
          this.containerDomains.add(domain);
        }
      }
    } else {
      if (cls) {
        fp.failedClasses.set(cls, (fp.failedClasses.get(cls) || 0) + 1);
      }
    }
  }
}

// ─── Singleton ─────────────────────────────────────────────────
let defaultMemory = null;

function getSessionMemory() {
  if (!defaultMemory) {
    defaultMemory = new SessionMemory();
  }
  return defaultMemory;
}

function resetSessionMemory() {
  if (defaultMemory) defaultMemory.forceSave();
  if (defaultMemory) defaultMemory.clear();
  defaultMemory = null;
}

module.exports = {
  SessionMemory,
  textSimilarity,
  getSessionMemory,
  resetSessionMemory,
};
