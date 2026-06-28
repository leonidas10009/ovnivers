/**
 * local-scrapers - Built from src/local-scrapers/
 * Generated: 2026-06-28T15:55:19.604Z
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

// src/intelligent/logger.js
var require_logger = __commonJS({
  "src/intelligent/logger.js"(exports2, module2) {
    var LEVELS = { trace: 10, debug: 20, info: 30, warn: 40, error: 50 };
    var currentLevel = LEVELS.info;
    function serialize(v) {
      if (v === null || v === void 0) return "";
      if (typeof v === "string") return v;
      try {
        return JSON.stringify(v);
      } catch (e) {
        return String(v);
      }
    }
    function format(args) {
      if (args.length === 0) return "";
      if (args.length === 1) return serialize(args[0]);
      if (typeof args[0] === "object" && args[0] !== null && typeof args[1] === "string") {
        return args[1] + " " + serialize(args[0]);
      }
      if (typeof args[0] === "string" && typeof args[1] === "string") {
        return args[0] + " " + args[1];
      }
      return serialize(args[0]) + " " + serialize(args[1]);
    }
    var logger = {
      trace: function() {
        if (currentLevel <= LEVELS.trace) console.debug("[trace] " + format(arguments));
      },
      debug: function() {
        if (currentLevel <= LEVELS.debug) console.debug("[debug] " + format(arguments));
      },
      info: function() {
        if (currentLevel <= LEVELS.info) console.log("[info] " + format(arguments));
      },
      warn: function() {
        if (currentLevel <= LEVELS.warn) console.warn("[warn] " + format(arguments));
      },
      error: function() {
        if (currentLevel <= LEVELS.error) console.error("[error] " + format(arguments));
      }
    };
    function getLogger() {
      return logger;
    }
    function setLogLevel(level) {
      if (LEVELS[level] !== void 0) currentLevel = LEVELS[level];
    }
    module2.exports = { getLogger, setLogLevel };
  }
});

// src/intelligent/session-memory.js
var require_session_memory = __commonJS({
  "src/intelligent/session-memory.js"(exports2, module2) {
    var { existsSync, readFileSync, writeFileSync } = require("fs");
    var { join } = require("path");
    var { getLogger } = require_logger();
    function bayesianEstimate(successes, failures) {
      const alpha = successes + 1;
      const beta = failures + 1;
      const total = alpha + beta;
      return { alpha, beta, mean: alpha / total, confidence: Math.min(total / 10, 1) };
    }
    function tokenize(text) {
      return text.toLowerCase().replace(/[^a-záéíóúñ0-9\s]/gi, " ").split(/\s+/).filter(function(t) {
        return t.length > 1;
      });
    }
    function textSimilarity(query, candidate) {
      const qTokens = tokenize(query);
      const cTokens = tokenize(candidate);
      if (qTokens.length === 0 || cTokens.length === 0) return 0;
      const qSet = new Set(qTokens);
      const cSet = new Set(cTokens);
      let intersection = 0;
      for (const t of qSet) {
        if (cSet.has(t)) intersection++;
      }
      const union = qSet.size + cSet.size - intersection;
      const jaccard = intersection / union;
      const dice = 2 * intersection / (qSet.size + cSet.size);
      return Math.round((dice * 0.7 + jaccard * 0.3) * 100) / 100;
    }
    function generalizeClass(cls) {
      const result = [];
      const lower = cls.toLowerCase();
      if (lower.includes("-")) {
        const parts = lower.split("-");
        if (parts.length === 2) {
          result.push("*-" + parts[1]);
          result.push(parts[0] + "-*");
        }
      }
      const keywordPatterns = {
        "*-server*": /server|servidor/i,
        "*-player*": /player|reproductor/i,
        "*-list*": /list|lista/i,
        "*-btn*": /btn|button|boton/i,
        "*-card*": /card|tarjeta|item/i,
        "*-tab*": /tab|pestaña/i,
        "*-lang*": /idioma|language|lang/i,
        "*-download*": /download|descarg/i
      };
      for (const [pattern, regex] of Object.entries(keywordPatterns)) {
        if (regex.test(lower) && !result.includes(pattern)) {
          result.push(pattern);
        }
      }
      return result;
    }
    function extractDomain(url) {
      try {
        return new URL(url).hostname.replace("www.", "");
      } catch (e) {
        return url.slice(0, 40);
      }
    }
    function extractClass(selector) {
      const classMatch = selector.match(/\.([a-zA-Z_][\w-]*)/);
      if (classMatch) return classMatch[1];
      const idMatch = selector.match(/#([a-zA-Z_][\w-]*)/);
      if (idMatch) return idMatch[1];
      const childMatch = selector.match(/>\s*(\w+)/);
      if (childMatch) return childMatch[1];
      return "";
    }
    var SessionMemory = class {
      constructor(persistPath) {
        this.patterns = [];
        this.typeBoosts = /* @__PURE__ */ new Map();
        this.actionBoosts = /* @__PURE__ */ new Map();
        this.classBoosts = /* @__PURE__ */ new Map();
        this.containerDomains = /* @__PURE__ */ new Set();
        this.domainFingerprints = /* @__PURE__ */ new Map();
        this.urlChains = /* @__PURE__ */ new Map();
        this.successCount = 0;
        this.totalAttempts = 0;
        this.lastDomain = "";
        this.persistPath = persistPath || join(process.cwd(), ".scraper-memory.json");
        this._load();
      }
      // ─── Persistence ────────────────────────────────────────────
      _load() {
        try {
          if (!existsSync(this.persistPath)) return;
          const raw = readFileSync(this.persistPath, "utf-8");
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
              lastVisit: fp.lastVisit || 0
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
          for (const d of data.containerDomains || []) {
            this.containerDomains.add(d);
          }
          if (data.version >= 2 && data.urlChains) {
            for (const [key, chains] of Object.entries(data.urlChains)) {
              this.urlChains.set(key, chains);
            }
          }
          this.patterns = (data.patterns || []).slice(-100);
          this.totalAttempts = data.totalAttempts || 0;
          this.successCount = data.successCount || 0;
          getLogger().debug({ path: this.persistPath, domains: this.domainFingerprints.size }, "Memory loaded from disk");
        } catch (err) {
          getLogger().debug({ error: err.message }, "Memory load failed, starting fresh");
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
              lastVisit: fp.lastVisit
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
            successCount: this.successCount
          };
          writeFileSync(this.persistPath, JSON.stringify(data, null, 2));
        } catch (err) {
          getLogger().debug({ error: err.message }, "Memory save failed");
        }
      }
      // ─── Recording ──────────────────────────────────────────────
      recordAttempt(selector, elementType, action, success, urlsFound, urlTypes, domain) {
        this.totalAttempts++;
        const cls = extractClass(selector);
        const dom = domain || this.lastDomain;
        const record = {
          selector,
          selectorClass: cls,
          elementType,
          action,
          urlsFound,
          urlTypes,
          success,
          domain: dom,
          timestamp: Date.now()
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
          signals.push("type:" + elementType + "=" + typeBoost + "/25");
        }
        if (elementClass) {
          const classBoost = this.getClassBoost(elementClass);
          if (classBoost > 0) {
            totalScore += classBoost / 20;
            totalWeight += 1.5;
            signals.push("class:" + elementClass + "=" + classBoost + "/20");
          }
        }
        if (domain && this.domainFingerprints.has(domain)) {
          const fp = this.domainFingerprints.get(domain);
          let domSuccesses = 0, domTotal = 0;
          for (const [, v] of fp.successfulClasses) {
            domSuccesses += v;
            domTotal += v;
          }
          for (const [, v] of fp.failedClasses) {
            domTotal += v;
          }
          if (domTotal > 0) {
            const domRate = domSuccesses / domTotal;
            totalScore += domRate;
            totalWeight += 0.5;
            signals.push("domain:" + domain + "=" + Math.round(domRate * 100) + "%");
          }
        }
        if (elementClass) {
          for (const gCls of generalizeClass(elementClass)) {
            const gBoost = this.getClassBoost(gCls);
            if (gBoost > 5) {
              totalScore += gBoost / 40;
              totalWeight += 0.3;
              signals.push("gen:" + gCls + "=" + gBoost + "/20");
            }
          }
        }
        const estimatedSuccess = totalWeight > 0 ? Math.min(1, totalScore / totalWeight) : 0.5;
        const confidence = Math.min(1, totalWeight / 3);
        return { estimatedSuccess, confidence, signals };
      }
      getPredictions() {
        const elementTypes = [...new Set(this.patterns.map(function(p) {
          return p.elementType;
        }))];
        return elementTypes.map(function(type) {
          const pred = this.predictSuccess(type, "", this.lastDomain);
          return { elementType: type, estimatedSuccess: pred.estimatedSuccess, confidence: pred.confidence };
        }, this).sort(function(a, b) {
          return b.estimatedSuccess - a.estimatedSuccess;
        });
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
        const chainKey = fromDomain + "|" + fromPattern;
        if (!this.urlChains.has(chainKey)) {
          this.urlChains.set(chainKey, []);
        }
        const chains = this.urlChains.get(chainKey);
        const existing = chains.find(function(c) {
          return c.toType === resultType;
        });
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
            sampleTo: toUrl.slice(0, 80)
          });
        }
        this._save();
        getLogger().debug({ from: fromPattern, to: resultType }, "URL chain recorded");
      }
      getChainsForDomain(domain) {
        const results = [];
        for (const [key, chains] of this.urlChains) {
          if (key.startsWith(domain + "|")) {
            results.push(...chains);
          }
        }
        return results.sort(function(a, b) {
          return b.confidence - a.confidence;
        });
      }
      _extractPathPattern(url) {
        try {
          let pattern = new URL(url).pathname;
          pattern = pattern.replace(/\/[^/]+\/\d+$/, "/{num}");
          pattern = pattern.replace(/\d+x\d+/, "{ep}");
          const parts = pattern.split("/").filter(Boolean);
          if (parts.length >= 1) {
            const last = parts[parts.length - 1];
            if (!last.includes("{") && !/^\d+$/.test(last)) {
              parts[parts.length - 1] = "{slug}";
            }
          }
          return "/" + parts.join("/") + "/";
        } catch (e) {
          return "";
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
        return this.patterns.filter(function(p) {
          return p.success && p.urlsFound > 0;
        }).sort(function(a, b) {
          return b.urlsFound - a.urlsFound;
        }).slice(0, limit);
      }
      getTopClassesForDomain(domain, limit) {
        limit = limit || 5;
        const fp = this.domainFingerprints.get(domain);
        if (!fp) return [];
        return [...fp.successfulClasses].sort(function(a, b) {
          return b[1] - a[1];
        }).slice(0, limit).map(function(e) {
          return e[0];
        });
      }
      getBestClass() {
        let best = "";
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
              topClasses: [...fp.successfulClasses].sort(function(a, b) {
                return b[1] - a[1];
              }).slice(0, 5).map(function(e) {
                return e[0];
              }),
              successRate: this.getCurrentDomainSuccessRate()
            };
          }
        }
        return {
          typeBoosts: Object.fromEntries(
            [...this.typeBoosts.keys()].map(function(k) {
              return [k, this.getTypeBoost(k)];
            }, this)
          ),
          actionBoosts: Object.fromEntries(
            [...this.actionBoosts.keys()].map(function(k) {
              return [k, this.getActionBoost(k)];
            }, this)
          ),
          classBoosts,
          containerDomains: [...this.containerDomains],
          topPatterns: this.getTopPatterns(),
          currentFingerprint,
          predictions: this.getPredictions()
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
        this.lastDomain = "";
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
            successfulClasses: /* @__PURE__ */ new Map(),
            successfulTypes: /* @__PURE__ */ new Map(),
            failedClasses: /* @__PURE__ */ new Map(),
            containerUrls: [],
            avgResponseTime: 0,
            visits: 0,
            lastVisit: Date.now()
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
            if (ut.startsWith("http")) {
              try {
                const dom = new URL(ut).hostname.replace("www.", "");
                if (!fp.containerUrls.includes(dom)) {
                  fp.containerUrls.push(dom);
                }
                this.containerDomains.add(dom);
              } catch (e) {
              }
            } else if (ut === "embed" || ut === "download") {
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
    };
    var defaultMemory = null;
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
    module2.exports = {
      SessionMemory,
      textSimilarity,
      getSessionMemory,
      resetSessionMemory
    };
  }
});

// src/intelligent/smart-analyzer.js
var require_smart_analyzer = __commonJS({
  "src/intelligent/smart-analyzer.js"(exports2, module2) {
    var ACTION_PATTERNS = {
      "play-video": {
        words: [/play|reproduc|ver|watch|mirar|reproducir|stream|video|pelicula|movie|mirar/i],
        classPatterns: [/player|video|reproduc|stream|watch/i],
        attrPatterns: [/play|video|stream|reproduc|embed/i],
        baseScore: 25
      },
      "switch-server": {
        words: [/server|servidor|opcion|mirror|fuente|source|cdn|host|altern/i],
        classPatterns: [/server|servidor|mirror|source|option/i],
        attrPatterns: [/server|source|mirror|cdn/i],
        baseScore: 25
      },
      "change-language": {
        words: [/idioma|language|lang|audio|doblaje|dub|sub|subtit|castellano|latino|español|english|japanese|portuguese/i],
        classPatterns: [/idioma|language|lang|audio|dub/i],
        attrPatterns: [/lang|language|audio|dub/i],
        baseScore: 25
      },
      "download": {
        words: [/download|descarg|bajar|descarga|guardar/i],
        classPatterns: [/download|descarg|btn-descarg/i],
        attrPatterns: [/download|descarg/i],
        baseScore: 25
      },
      "navigate-episode": {
        words: [/episodio|episode|capitulo|chapter|cap\.?\s*\d|ep\.?\s*\d|^\d{1,4}$/i],
        classPatterns: [/episod|episode|capitul|chapter/i],
        attrPatterns: [/episod|episode|chapter/i],
        baseScore: 20
      },
      "search": {
        words: [/buscar|search|busqueda|find|encontrar|filt/i],
        classPatterns: [/search|buscar|filtro|filter|find/i],
        attrPatterns: [/search|buscar|filter/i],
        baseScore: 30
      },
      "filter": {
        words: [/filtro|filter|categoria|category|genero|genre|año|year|tipo|type|orden/i],
        classPatterns: [/filter|filtro|categor|genero|genre/i],
        attrPatterns: [/filter|categor/i],
        baseScore: 20
      },
      "login": {
        words: [/login|iniciar|regist|cuenta|account|sign.?in|sign.?up|perfil|profile/i],
        classPatterns: [/login|auth|account|user|sign/i],
        attrPatterns: [/login|auth|account/i],
        baseScore: 20
      },
      "social": {
        words: [/discord|telegram|facebook|twitter|instagram|whatsapp|reddit|youtube|tiktok/i],
        classPatterns: [/social|share|discord|telegram/i],
        attrPatterns: [/social|share/i],
        baseScore: 20
      },
      "ad": {
        words: [/publicidad|anuncio|advert|patrocin/i],
        classPatterns: [/ad|ads|banner|publi|advert/i],
        attrPatterns: [/ad|ads/i],
        baseScore: 15
      }
    };
    var URL_DOMAIN_KB = {
      "streamtape.com": { type: "embed", isContainer: true },
      "streamtape.net": { type: "embed", isContainer: true },
      "uqload.com": { type: "embed", isContainer: true },
      "uqload.co": { type: "embed", isContainer: true },
      "ok.ru": { type: "embed", isContainer: true },
      "mega.nz": { type: "download", isContainer: true },
      "mega.co.nz": { type: "download", isContainer: true },
      "yourupload.com": { type: "embed", isContainer: true },
      "swhoi.com": { type: "embed", isContainer: true },
      "netu.tv": { type: "embed", isContainer: true },
      "netu.io": { type: "embed", isContainer: true },
      "filemoon.sx": { type: "embed", isContainer: true },
      "filemoon.to": { type: "embed", isContainer: true },
      "streamwish.to": { type: "embed", isContainer: true },
      "sfastwish.com": { type: "embed", isContainer: true },
      "flaswish.com": { type: "embed", isContainer: true },
      "embedwish.com": { type: "embed", isContainer: true },
      "cdnwish.com": { type: "cdn", isContainer: false },
      "hgcloud.to": { type: "embed", isContainer: true },
      "bysekoze.com": { type: "embed", isContainer: true },
      "hqq.tv": { type: "embed", isContainer: true },
      "hqq.watch": { type: "embed", isContainer: true },
      "discord.com": { type: "social", isContainer: false },
      "discord.gg": { type: "social", isContainer: false },
      "telegram.me": { type: "social", isContainer: false },
      "t.me": { type: "social", isContainer: false },
      "facebook.com": { type: "social", isContainer: false },
      "instagram.com": { type: "social", isContainer: false },
      "twitter.com": { type: "social", isContainer: false },
      "x.com": { type: "social", isContainer: false },
      "youtube.com": { type: "direct-video", isContainer: false },
      "youtu.be": { type: "direct-video", isContainer: false },
      "google.com": { type: "tracking", isContainer: false },
      "googletagmanager.com": { type: "tracking", isContainer: false },
      "doubleclick.net": { type: "tracking", isContainer: false },
      "googlesyndication.com": { type: "tracking", isContainer: false },
      "cloudflare.com": { type: "cdn", isContainer: false },
      "jsdelivr.net": { type: "cdn", isContainer: false },
      "cdnjs.com": { type: "cdn", isContainer: false },
      "unpkg.com": { type: "cdn", isContainer: false },
      "mp4upload.com": { type: "embed", isContainer: true },
      "dood.so": { type: "embed", isContainer: true },
      "dood.ws": { type: "embed", isContainer: true },
      "dood.wf": { type: "embed", isContainer: true },
      "dood.re": { type: "embed", isContainer: true },
      "dood.sh": { type: "embed", isContainer: true },
      "mixdrop.co": { type: "embed", isContainer: true },
      "mixdrop.ag": { type: "embed", isContainer: true },
      "voe.sx": { type: "embed", isContainer: true },
      "vidhide.com": { type: "embed", isContainer: true },
      "vidmoly.to": { type: "embed", isContainer: true },
      "upstream.to": { type: "embed", isContainer: true },
      "vidoza.net": { type: "embed", isContainer: true },
      "fembed.com": { type: "embed", isContainer: true },
      "animejara.com": { type: "navigation", isContainer: true },
      "henaojara.com": { type: "navigation", isContainer: true },
      "tioanime.com": { type: "navigation", isContainer: true },
      "animeflv.net": { type: "navigation", isContainer: true },
      "jkanime.net": { type: "navigation", isContainer: true },
      "monoschinos.com": { type: "navigation", isContainer: true },
      "monoschinos2.net": { type: "navigation", isContainer: true },
      // Additional embed domains (from test verification)
      "burstcloud.cc": { type: "embed", isContainer: true },
      "burstcloud.to": { type: "embed", isContainer: true },
      "hydrax.net": { type: "embed", isContainer: true },
      "sbplay2.com": { type: "embed", isContainer: true },
      "sbplay3.com": { type: "embed", isContainer: true },
      // Anime site domains (for proper classification)
      "animeav1.com": { type: "navigation", isContainer: true },
      "anime-jl.net": { type: "navigation", isContainer: true },
      "latanime.org": { type: "navigation", isContainer: true },
      "tiodonghua.com": { type: "navigation", isContainer: true },
      "animeonline.ninja": { type: "navigation", isContainer: true },
      "estrenosanime.net": { type: "navigation", isContainer: true },
      "mundodonghua.com": { type: "navigation", isContainer: true },
      // Additional embed/server domains
      "jawcloud.co": { type: "embed", isContainer: true },
      "vidlox.me": { type: "embed", isContainer: true },
      "vidfast.co": { type: "embed", isContainer: true },
      "sendvid.com": { type: "embed", isContainer: true },
      "zippyshare.com": { type: "download", isContainer: false },
      "gounlimited.to": { type: "embed", isContainer: true },
      "vidlox.net": { type: "embed", isContainer: true },
      "vidlox.tv": { type: "embed", isContainer: true },
      "wolfmax4k.com": { type: "embed", isContainer: false },
      "streamlare.com": { type: "embed", isContainer: true },
      "jaw.cloud": { type: "embed", isContainer: true },
      "vudeo.net": { type: "embed", isContainer: true },
      "vidozahd.com": { type: "embed", isContainer: true },
      "uptobox.com": { type: "embed", isContainer: true },
      "tapecontent.net": { type: "embed", isContainer: true },
      "stpete.net": { type: "embed", isContainer: true },
      // Download/file hosting domains
      "mediafire.com": { type: "download", isContainer: true },
      "drive.google.com": { type: "download", isContainer: true },
      "dropbox.com": { type: "download", isContainer: true },
      "1fichier.com": { type: "download", isContainer: true }
    };
    var KNOWN_SERVERS = {
      "streamtape.com": "StreamTape",
      "streamtape.net": "StreamTape",
      "yourupload.com": "YourUpload",
      "mega.nz": "MEGA",
      "mega.co.nz": "MEGA",
      "ok.ru": "OK.ru",
      "uqload.com": "Uqload",
      "uqload.co": "Uqload",
      "hqq.tv": "HQQ",
      "hqq.watch": "HQQ",
      "bysekoze.com": "BySekoze",
      "swhoi.com": "SWHOI",
      "netu.tv": "Netu",
      "netu.io": "Netu",
      "filemoon.sx": "Filemoon",
      "filemoon.to": "Filemoon",
      "streamwish.to": "StreamWish",
      "embedwish.com": "EmbedWish",
      "cdnwish.com": "CDNWish",
      "hgcloud.to": "HGCloud",
      "nyuu.streamhj.top": "Nyuu",
      "multiplayer.streamhj.top": "MultiPlayer",
      "descargas.streamhj.top": "Descargas",
      "descargas.henaojara.com": "Descargas HenaoJara",
      "animejara.com": "AnimeJara",
      "henaojara.com": "HenaoJara",
      "youtube.com": "YouTube",
      "youtu.be": "YouTube",
      "dailymotion.com": "Dailymotion",
      "vimeo.com": "Vimeo",
      "drive.google.com": "Google Drive",
      "dropbox.com": "Dropbox",
      "mediafire.com": "MediaFire",
      "1fichier.com": "1Fichier",
      "mixdrop.co": "MixDrop",
      "mixdrop.ag": "MixDrop",
      "fembed.com": "Fembed",
      "fembed.net": "Fembed",
      "playhydrax.com": "Hydrax",
      "cloudvideo.tv": "CloudVideo",
      "sbembed.com": "SBEmbed",
      "sbembed1.com": "SBEmbed",
      "sbplay.org": "SBPlay",
      "sbplay1.com": "SBPlay",
      "mystream.to": "MyStream",
      "dood.so": "DoodStream",
      "dood.ws": "DoodStream",
      "dood.wf": "DoodStream",
      "voe.sx": "VOE",
      "vidhide.com": "VidHide",
      "vidmoly.to": "VidMoly",
      "mp4upload.com": "MP4Upload",
      "upstream.to": "UpStream",
      "vidoza.net": "Vidoza",
      "burstcloud.cc": "BurstCloud",
      "burstcloud.to": "BurstCloud",
      "vidcloud.tv": "CloudVideo",
      "sbplay2.com": "SBPlay",
      "sbplay3.com": "SBPlay",
      "hydrax.net": "Hydrax",
      "jawcloud.co": "JawCloud",
      "jaw.cloud": "JawCloud",
      "vidlox.me": "VidLox",
      "vidlox.tv": "VidLox",
      "vidlox.net": "VidLox",
      "vidfast.co": "VidFast",
      "sendvid.com": "SendVid",
      "gounlimited.to": "GoUnlimited",
      "wolfmax4k.com": "WolfMax4K",
      "streamlare.com": "StreamLare",
      "vudeo.net": "Vudeo",
      "uptobox.com": "UpToBox",
      "tapecontent.net": "TapeContent"
    };
    var SmartAnalyzer = class {
      constructor() {
        this.urlCache = /* @__PURE__ */ new Map();
        this.intentCache = /* @__PURE__ */ new Map();
      }
      // ─── Element intent classification ──────────────────────────
      classifyElementIntent(el) {
        const cacheKey = el.selector + "|" + el.text;
        const cached = this.intentCache.get(cacheKey);
        if (cached) return cached;
        const combined = this._buildSignalText(el);
        const results = [];
        for (const [action, patterns] of Object.entries(ACTION_PATTERNS)) {
          let score = patterns.baseScore;
          const signals = [];
          for (const re of patterns.words) {
            if (re.test(combined.text)) {
              score += 15;
              signals.push("word:" + re.source.slice(1, -2));
            }
          }
          for (const re of patterns.classPatterns) {
            if (re.test(combined.classes)) {
              score += 12;
              signals.push("class:" + re.source.slice(1, -2));
            }
          }
          for (const re of patterns.attrPatterns) {
            if (re.test(combined.attrs)) {
              score += 8;
              signals.push("attr:" + re.source.slice(1, -2));
            }
          }
          if (el.type === "clickable" || el.type === "link") score += 5;
          if (el.type === "text" || el.type === "container") score -= 10;
          results.push({ action, score: Math.min(100, Math.max(0, score)), signals });
        }
        results.sort(function(a, b) {
          return b.score - a.score;
        });
        const best = results[0];
        const intent = best && best.score >= 35 ? { action: best.action, confidence: best.score, signals: best.signals } : { action: "unknown", confidence: 10, signals: [] };
        this.intentCache.set(cacheKey, intent);
        return intent;
      }
      // ─── Content relevance scoring ──────────────────────────────
      scoreContentRelevance(el, memory) {
        const factors = [];
        let total = 0;
        const intent = this.classifyElementIntent(el);
        const intentScores = {
          "play-video": 30,
          "switch-server": 30,
          "download": 25,
          "navigate-episode": 20,
          "change-language": 18,
          "search": 10,
          "filter": 12,
          "sort": 5,
          "navigate-page": 8,
          "login": -20,
          "social": -15,
          "ad": -25,
          "unknown": 5
        };
        const intentScore = intentScores[intent.action] || 5;
        total += intentScore;
        factors.push({ factor: "intent:" + intent.action, contribution: intentScore });
        const typeScores = {
          "clickable": 15,
          "link": 15,
          "list-item": 12,
          "input": 8,
          "select": 8,
          "iframe": 25,
          "video": 30,
          "media": 28,
          "heading": 3,
          "text": 0,
          "image": 3,
          "container": -5
        };
        const typeScore = typeScores[el.type] || 0;
        total += typeScore;
        factors.push({ factor: "type:" + el.type, contribution: typeScore });
        const urls = this._extractElementUrls(el);
        if (urls.length > 0) {
          const urlScore = Math.min(urls.length * 10, 30);
          total += urlScore;
          factors.push({ factor: "has-urls", contribution: urlScore });
        }
        if (el.depth <= 3) {
          total += 8;
          factors.push({ factor: "shallow-depth", contribution: 8 });
        } else if (el.depth > 10) {
          total -= 5;
          factors.push({ factor: "deep-depth", contribution: -5 });
        }
        if (el.text.length >= 2 && el.text.length <= 40) {
          total += 5;
          factors.push({ factor: "good-text-length", contribution: 5 });
        }
        if (/\d+/.test(el.text)) {
          total += 3;
          factors.push({ factor: "has-numbers", contribution: 3 });
        }
        const dataKeys = Object.keys(el.attr || {}).filter(function(k) {
          return k.startsWith("data-");
        });
        if (dataKeys.length > 0) {
          const dataScore = Math.min(dataKeys.length * 5, 15);
          total += dataScore;
          factors.push({ factor: "has-data-attrs", contribution: dataScore });
        }
        total += 3;
        factors.push({ factor: "visible", contribution: 3 });
        if (memory) {
          const typeBoost = memory.getTypeBoost(el.type);
          if (typeBoost > 0) {
            const memContrib = Math.min(typeBoost, 20);
            total += memContrib;
            factors.push({ factor: "memory:" + el.type, contribution: memContrib });
          }
          const cls = (el.class || "").split(/\s+/)[0];
          if (cls) {
            const classBoost = memory.getClassBoost(cls);
            if (classBoost > 0) {
              const classContrib = Math.min(classBoost, 15);
              total += classContrib;
              factors.push({ factor: "memory-class:" + cls, contribution: classContrib });
            }
          }
          const pred = memory.predictSuccess(el.type, cls);
          if (pred.confidence > 0.3 && pred.estimatedSuccess > 0.5) {
            const predContrib = Math.round(pred.estimatedSuccess * 15);
            total += predContrib;
            factors.push({ factor: "predict:" + el.type, contribution: predContrib });
          }
        }
        const clampedScore = Math.min(100, Math.max(0, total));
        let relevance;
        if (clampedScore >= 55) relevance = "high";
        else if (clampedScore >= 30) relevance = "medium";
        else if (clampedScore >= 10) relevance = "low";
        else relevance = "skip";
        return { score: clampedScore, relevance, factors };
      }
      // ─── URL classification ─────────────────────────────────────
      classifyURL(url, context) {
        const cached = this.urlCache.get(url);
        if (cached) return cached;
        const signals = [];
        let type = "unknown";
        let confidence = 20;
        let isContainer = false;
        const lowerUrl = url.toLowerCase();
        const domain = this.extractDomain(url);
        const path = this._extractPath(url);
        const ext = this._extractExtension(url);
        const known = URL_DOMAIN_KB[domain] || URL_DOMAIN_KB[this._getBaseDomain(domain)];
        if (known) {
          type = known.type;
          isContainer = known.isContainer;
          confidence = 85;
          signals.push("kb:" + domain);
        }
        if (/\.(mp4|mkv|avi|webm|mov|flv|wmv)($|\?)/i.test(lowerUrl)) {
          type = "direct-video";
          confidence = Math.max(confidence, 95);
          signals.push("ext:" + ext);
        } else if (/\.(m3u8|mpd|hls)($|\?)/i.test(lowerUrl)) {
          type = "stream";
          confidence = Math.max(confidence, 90);
          signals.push("ext:" + ext);
        } else if (/\.(zip|rar|7z|tar|gz)($|\?)/i.test(lowerUrl)) {
          type = "download";
          confidence = Math.max(confidence, 80);
          signals.push("ext:" + ext);
        }
        if (/\/embed\/|\/player\/|\/reproductor\/|embed\.php|player\.php|reproductor/i.test(path)) {
          if (type === "unknown") type = "embed";
          isContainer = true;
          confidence = Math.max(confidence, 75);
          signals.push("path:embed");
        }
        if (/\/download\/|\/descargar\/|\/d\/|\/descarga\/|download\.php|descargar\.php/i.test(path)) {
          if (type === "unknown") type = "download";
          confidence = Math.max(confidence, 70);
          signals.push("path:download");
        }
        if (/\/video\/|\/v\/|\/stream\/|\.mp4|\.m3u8/i.test(path)) {
          if (type === "unknown") type = "direct-video";
          confidence = Math.max(confidence, 65);
          signals.push("path:video");
        }
        if (/\/e\/|\/episodio\/|\/episode\/|\/capitulo\/|\/chapter\/|\/ver\//i.test(path)) {
          if (type === "unknown") type = "navigation";
          isContainer = true;
          confidence = Math.max(confidence, 60);
          signals.push("path:episode");
        }
        if (context) {
          const ctx = context.toLowerCase();
          if (/server|servidor|mirror|opcion/i.test(ctx)) {
            if (type === "unknown") type = "embed";
            isContainer = true;
            confidence = Math.max(confidence, 65);
            signals.push("ctx:server");
          }
          if (/download|descarg/i.test(ctx)) {
            if (type === "unknown") type = "download";
            confidence = Math.max(confidence, 65);
            signals.push("ctx:download");
          }
          if (/play|reproduc|ver|watch/i.test(ctx)) {
            if (type === "unknown") type = "embed";
            isContainer = true;
            confidence = Math.max(confidence, 60);
            signals.push("ctx:play");
          }
          if (/episodio|episode|capitulo|chapter/i.test(ctx)) {
            if (type === "unknown") type = "navigation";
            confidence = Math.max(confidence, 55);
            signals.push("ctx:episode");
          }
          if (/idioma|language|lang/i.test(ctx)) {
            confidence = Math.max(confidence, 50);
            signals.push("ctx:language");
          }
        }
        if (/[?&](token|auth|key|api|session|sid)=/i.test(lowerUrl)) {
          isContainer = false;
          signals.push("query:auth");
        }
        if (/[?&](redirect|url|goto|return|next)=/i.test(lowerUrl)) {
          isContainer = true;
          signals.push("query:redirect");
        }
        if (/analytics|track|pixel|beacon|stats|metric|collect/i.test(domain)) {
          type = "tracking";
          confidence = 80;
          signals.push("domain:tracking");
        }
        const result = {
          type,
          confidence: Math.min(100, confidence),
          isContainer,
          signals
        };
        this.urlCache.set(url, result);
        return result;
      }
      // ─── Prioritize elements for exploration ────────────────────
      prioritizeElements(elements, memory) {
        const self = this;
        const scored = elements.map(function(el) {
          return {
            el,
            score: self.scoreContentRelevance(el, memory),
            intent: self.classifyElementIntent(el)
          };
        });
        scored.sort(function(a, b) {
          if (a.score.relevance === "skip" && b.score.relevance !== "skip") return 1;
          if (b.score.relevance === "skip" && a.score.relevance !== "skip") return -1;
          if (a.score.score !== b.score.score) return b.score.score - a.score.score;
          return a.el.depth - b.el.depth;
        });
        return scored.filter(function(s) {
          if (s.intent.action === "ad" || s.intent.action === "social" || s.intent.action === "login") return false;
          return true;
        }).map(function(s) {
          return s.el;
        });
      }
      // ─── Full page analysis ─────────────────────────────────────
      analyze(elements) {
        const elementIntents = /* @__PURE__ */ new Map();
        const contentScores = /* @__PURE__ */ new Map();
        const urlClassifications = /* @__PURE__ */ new Map();
        const serverElements = [];
        const videoElements = [];
        const downloadElements = [];
        const navigationElements = [];
        let highRelevanceCount = 0;
        let contentElementCount = 0;
        for (const el of elements) {
          const intent = this.classifyElementIntent(el);
          const score = this.scoreContentRelevance(el);
          const urls = this._extractElementUrls(el);
          elementIntents.set(el.selector, intent);
          contentScores.set(el.selector, score);
          for (const url of urls) {
            if (!urlClassifications.has(url)) {
              urlClassifications.set(url, this.classifyURL(url, el.text));
            }
          }
          if (score.relevance === "high") highRelevanceCount++;
          if (score.relevance !== "skip") contentElementCount++;
          switch (intent.action) {
            case "switch-server":
              serverElements.push(el);
              break;
            case "play-video":
              videoElements.push(el);
              break;
            case "download":
              downloadElements.push(el);
              break;
            case "navigate-episode":
              navigationElements.push(el);
              break;
          }
        }
        return {
          elementIntents,
          contentScores,
          urlClassifications,
          summary: {
            contentElementCount,
            highRelevanceCount,
            serverElements,
            videoElements,
            downloadElements,
            navigationElements
          }
        };
      }
      // ─── Server name inference ──────────────────────────────────
      inferServerName(domain) {
        if (KNOWN_SERVERS[domain]) return KNOWN_SERVERS[domain];
        const parts = domain.replace(/^www\.|^embed\.|^player\.|^cdn\.|^api\.|^static\./i, "").split(".");
        const main = parts.length > 1 ? parts[parts.length - 2] : parts[0];
        return main.charAt(0).toUpperCase() + main.slice(1).slice(0, 24);
      }
      // ─── URL candidate inference ────────────────────────────────
      inferCandidateUrls(knownUrls, searchTerm, baseUrl) {
        const candidates = [];
        const term = searchTerm.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        if (term.length < 2) return [];
        const pathPatterns = /* @__PURE__ */ new Map();
        for (const url of knownUrls) {
          try {
            const u = new URL(url);
            const path = u.pathname;
            const segments = path.split("/").filter(Boolean);
            for (let i = 0; i < segments.length; i++) {
              const template = segments.map(function(s, idx) {
                if (idx === i) return "{slug}";
                if (/^\d+$/.test(s) || /\d+x\d+/.test(s)) return "{num}";
                return s;
              });
              const pattern = "/" + template.join("/") + "/";
              pathPatterns.set(pattern, (pathPatterns.get(pattern) || 0) + 1);
            }
          } catch (e) {
          }
        }
        const sortedPatterns = [...pathPatterns.entries()].filter(function([, count]) {
          return count >= 2;
        }).sort(function(a, b) {
          return b[1] - a[1];
        });
        for (const [pattern, count] of sortedPatterns) {
          const candidatePath = pattern.replace("{slug}", term).replace(/\{num\}/g, "");
          try {
            const base = new URL(baseUrl);
            const candidateUrl = base.origin + candidatePath;
            if (!knownUrls.includes(candidateUrl)) {
              candidates.push({ url: candidateUrl, confidence: Math.min(100, count * 25), pattern });
            }
          } catch (e) {
          }
        }
        return candidates.sort(function(a, b) {
          return b.confidence - a.confidence;
        }).slice(0, 4).map(function(c) {
          return c.url;
        });
      }
      // ─── Utilities ──────────────────────────────────────────────
      _buildSignalText(el) {
        const text = (el.text || "").toLowerCase();
        const classes = (el.class || "").toLowerCase();
        const attrs = Object.values(el.attr || {}).join(" ").toLowerCase() + " " + Object.keys(el.attr || {}).join(" ").toLowerCase();
        return { text, classes, attrs };
      }
      _extractElementUrls(el) {
        const urls = [];
        const attr = el.attr || {};
        const src = attr.src || attr.href || "";
        if (src && !src.startsWith("#") && !src.startsWith("javascript:") && src !== "about:blank") {
          urls.push(src);
        }
        for (const key of Object.keys(attr)) {
          if (key.startsWith("data-") && /url|src|href|link|video|embed/i.test(key)) {
            const val = attr[key];
            if (val && val.startsWith("http")) urls.push(val);
          }
        }
        const onclick = attr.onclick || "";
        const matches = onclick.match(/https?:\/\/[^'")\s]+/g);
        if (matches) urls.push(...matches);
        return urls;
      }
      extractDomain(url) {
        try {
          return new URL(url).hostname.replace(/^www\d*\./, "");
        } catch (e) {
          return url.replace(/https?:\/\//, "").split(/[/?#]/)[0] || url.slice(0, 40);
        }
      }
      _extractPath(url) {
        try {
          return new URL(url).pathname;
        } catch (e) {
          return url;
        }
      }
      _extractExtension(url) {
        try {
          const path = new URL(url).pathname;
          const match = path.match(/\.([a-z0-9]{2,5})($|\?)/i);
          return match ? match[1] : "";
        } catch (e) {
          return "";
        }
      }
      _getBaseDomain(domain) {
        const stripped = domain.replace(/^(?:ww[0-9]+|vww|www[0-9]*)\./, "");
        return stripped;
      }
      clearCache() {
        this.urlCache.clear();
        this.intentCache.clear();
      }
    };
    var defaultInstance = null;
    function getSmartAnalyzer() {
      if (!defaultInstance) {
        defaultInstance = new SmartAnalyzer();
      }
      return defaultInstance;
    }
    function resetSmartAnalyzer() {
      if (defaultInstance) defaultInstance.clearCache();
      defaultInstance = null;
    }
    module2.exports = {
      SmartAnalyzer,
      getSmartAnalyzer,
      resetSmartAnalyzer,
      KNOWN_SERVERS,
      URL_DOMAIN_KB
    };
  }
});

// src/intelligent/skeleton-detector.js
var require_skeleton_detector = __commonJS({
  "src/intelligent/skeleton-detector.js"(exports2, module2) {
    var { getLogger } = require_logger();
    var SkeletonDetector = class {
      constructor() {
        this.fingerprints = /* @__PURE__ */ new Map();
        this.skeletonSelectors = /* @__PURE__ */ new Map();
        this.skeletonTexts = /* @__PURE__ */ new Map();
      }
      addPageFingerprint(domain, url, selectors, texts, classes) {
        if (!this.fingerprints.has(domain)) {
          this.fingerprints.set(domain, []);
        }
        const fp = {
          url,
          selectors: new Set(selectors),
          texts: new Set(texts),
          classes: new Set(classes)
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
        if (domainTexts && domainTexts.has((text || "").toLowerCase().trim())) return true;
        if (this._isUniversalSkeleton(selector, text)) return true;
        return false;
      }
      _detectSkeleton(domain, fps) {
        if (fps.length < 2) return;
        const selectors = /* @__PURE__ */ new Set();
        const texts = /* @__PURE__ */ new Set();
        const first = fps[0];
        const second = fps[1];
        for (const sel of first.selectors) {
          if (second.selectors.has(sel) && fps.every(function(f) {
            return f.selectors.has(sel);
          })) {
            selectors.add(sel);
          }
        }
        for (const text of first.texts) {
          if (second.texts.has(text) && fps.every(function(f) {
            return f.texts.has(text);
          })) {
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
            samples: [...texts].slice(0, 8).join(", ")
          }, "Skeleton detected on domain");
        }
      }
      _isUniversalSkeleton(selector, text) {
        const sel = (selector || "").toLowerCase();
        const txt = (text || "").toLowerCase().trim();
        if (/login|sign.?in|sign.?up|register|regist|iniciar\s*sesi|cerrar\s*sesi|logout|cuenta|account|perfil|profile|contrase|password|olvid|forgot/i.test(txt)) return true;
        if (/nav|menu|header|footer|sidebar|breadcrumb/i.test(sel)) return true;
        if (/discord|telegram|facebook|twitter|instagram|whatsapp|reddit|tiktok|youtube/i.test(txt)) return true;
        if (/cookie|privac|dmca|terms|tos|condiciones|aceptar|rechazar/i.test(txt)) return true;
        if (/language|idioma|lang|currency|moneda|region|pais/i.test(sel + txt)) return true;
        if (sel.startsWith("footer") || sel.includes(".footer")) return true;
        return false;
      }
      clear() {
        this.fingerprints.clear();
        this.skeletonSelectors.clear();
        this.skeletonTexts.clear();
      }
    };
    module2.exports = { SkeletonDetector };
  }
});

// src/intelligent/static-scraper.js
var require_static_scraper = __commonJS({
  "src/intelligent/static-scraper.js"(exports2, module2) {
    var cheerio = require("cheerio");
    var { SmartAnalyzer } = require_smart_analyzer();
    var { SessionMemory, textSimilarity } = require_session_memory();
    var { getLogger } = require_logger();
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36";
    var StaticScraper = class {
      constructor() {
        this.ai = new SmartAnalyzer();
        this.memory = new SessionMemory();
      }
      analyze(url) {
        return __async(this, null, function* () {
          const log = getLogger();
          const start = Date.now();
          log.info({ url }, "Static analysis started (no browser)");
          const html = yield this._fetchHtml(url);
          if (!html) {
            return this._emptyResult(url, start);
          }
          const $2 = cheerio.load(html);
          const elements = this._buildStaticModel($2);
          log.info({ elements: elements.length }, "Static DOM model built");
          const allUrls = this._extractUrlsFromStatic($2, html);
          log.info({ urls: allUrls.length }, "URLs extracted from static HTML");
          const goal = this._detectGoal(elements);
          log.info({ goal }, "Content goal detected");
          const findings = this._classifyUrls(allUrls);
          const serverCatalog = this._buildCatalog(allUrls);
          const duration = Date.now() - start;
          log.info({ servers: serverCatalog.length, urls: allUrls.length, duration }, "Static analysis complete");
          return {
            url,
            title: $2("title").text().trim(),
            urlsFound: allUrls.length,
            serverCatalog,
            findings,
            goal,
            durationMs: duration
          };
        });
      }
      // ─── Fetch (lightweight, no browser) ────────────────────────
      _fetchHtml(url) {
        return __async(this, null, function* () {
          const log = getLogger();
          try {
            const response = yield fetch(url, {
              headers: {
                "User-Agent": UA,
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
              },
              signal: AbortSignal.timeout(12e3)
            });
            if (!response.ok) {
              log.warn({ status: response.status, url }, "Fetch failed");
              return null;
            }
            const html = yield response.text();
            log.debug({ bytes: html.length }, "HTML fetched");
            return html;
          } catch (err) {
            log.warn({ url, error: err.message }, "Fetch error");
            return null;
          }
        });
      }
      // ─── Static DOM model (cheerio → RawElement[]) ──────────────
      _buildStaticModel($2) {
        const elements = [];
        const self = this;
        $2("a, button, input, select, iframe, img, video, audio, li, h1, h2, h3, div, form, span").each(function(i, el) {
          var _a;
          if (i > 300) return false;
          const $el = $2(el);
          const tag = (el.tagName || "div").toLowerCase();
          const text = $el.text().trim().replace(/\s+/g, " ").slice(0, 60);
          if (["div", "span"].includes(tag) && text.length === 0 && $el.children().length === 0) return;
          const attrs = {};
          const attrNames = [
            "id",
            "class",
            "href",
            "src",
            "onclick",
            "placeholder",
            "type",
            "alt",
            "title",
            "data-url",
            "data-src",
            "data-anime",
            "data-value"
          ];
          for (const name of attrNames) {
            const val = $el.attr(name);
            if (val) attrs[name] = val.slice(0, 200);
          }
          let type = "container";
          if (tag === "a" || attrs["href"]) type = "link";
          else if (tag === "button" || attrs["onclick"]) type = "clickable";
          else if (tag === "input" || tag === "textarea") type = "input";
          else if (tag === "select") type = "select";
          else if (tag === "img") type = "image";
          else if (tag === "iframe") type = "iframe";
          else if (tag === "video" || tag === "audio") type = "media";
          else if (/^h[1-6]$/.test(tag)) type = "heading";
          else if (tag === "li") type = "list-item";
          const cls = (attrs["class"] || "").split(/\s+/)[0] || "";
          const parent = $el.parent().attr("id") || $el.parent().attr("class") || ((_a = $el.parent().get(0)) == null ? void 0 : _a.tagName) || "";
          elements.push({
            tag,
            text,
            type,
            cls,
            selector: attrs["id"] ? "#" + attrs["id"] : tag + (cls ? "." + cls : ""),
            id: attrs["id"] || "",
            class: (attrs["class"] || "").slice(0, 80),
            attr: attrs,
            children: [],
            parent: (parent || "").toLowerCase(),
            depth: 0
          });
        });
        return elements;
      }
      // ─── URL extraction from static HTML ────────────────────────
      _extractUrlsFromStatic($2, html) {
        const seen = /* @__PURE__ */ new Set();
        const add = function(u) {
          if (!u || u.startsWith("#") || u.startsWith("javascript:") || u === "about:blank") return;
          seen.add(u);
        };
        $2("iframe").each(function(_, el) {
          add($2(el).attr("src") || $2(el).attr("data-src") || "");
        });
        $2("a[href]").each(function(_, el) {
          const href = $2(el).attr("href") || "";
          if (href.startsWith("http") || href.startsWith("/")) add(href);
        });
        $2("video, audio, embed, object, source").each(function(_, el) {
          add($2(el).attr("src") || $2(el).attr("data") || "");
        });
        $2("[data-url], [data-src], [data-video], [data-embed], [data-href], [data-link]").each(function(_, el) {
          const dUrl = $2(el).attr("data-url") || $2(el).attr("data-src") || $2(el).attr("data-video") || $2(el).attr("data-embed") || $2(el).attr("data-href") || $2(el).attr("data-link") || "";
          add(dUrl);
        });
        const onclickRegex = /https?:\/\/[^'")\s]+/g;
        const onclickMatches = html.match(onclickRegex);
        if (onclickMatches) onclickMatches.forEach(add);
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
        const texts = elements.map(function(e) {
          return e.text + " " + e.class;
        }).join(" ").toLowerCase();
        if (/manga|manhwa|cap[ií]tulo|chapter/i.test(texts)) return "manga";
        if (/anime|episodio|pelicula|serie/i.test(texts)) return "video";
        if (/descarg|download|zip|rar/i.test(texts)) return "download";
        if (/galer[ií]a|wallpaper|fanart/i.test(texts)) return "image";
        const hasIframes = elements.some(function(e) {
          return e.type === "iframe";
        });
        return hasIframes ? "video" : "navigation";
      }
      _classifyUrls(urls) {
        const result = {
          videoUrls: [],
          downloadUrls: [],
          serverUrls: [],
          navigationUrls: [],
          otherUrls: []
        };
        const seen = /* @__PURE__ */ new Set();
        for (const url of urls) {
          if (seen.has(url)) continue;
          seen.add(url);
          const cls = this.ai.classifyURL(url);
          switch (cls.type) {
            case "direct-video":
            case "stream":
              result.videoUrls.push(url);
              break;
            case "download":
              result.downloadUrls.push(url);
              break;
            case "embed":
              result.serverUrls.push(url);
              break;
            case "navigation":
              result.navigationUrls.push(url);
              break;
            default:
              result.otherUrls.push(url);
          }
        }
        return result;
      }
      _buildCatalog(urls) {
        const servers = /* @__PURE__ */ new Map();
        const self = this;
        for (const url of urls) {
          const domain = this.ai.extractDomain(url);
          const name = this.ai.inferServerName(domain);
          const cls = this.ai.classifyURL(url);
          if (cls.type === "tracking" || cls.type === "social") continue;
          if (!servers.has(name)) servers.set(name, []);
          servers.get(name).push({
            url,
            type: cls.type,
            label: domain.slice(0, 40)
          });
        }
        return [...servers.entries()].map(function([name, urls2]) {
          var _a;
          return { name, domain: self.ai.extractDomain(((_a = urls2[0]) == null ? void 0 : _a.url) || ""), urls: urls2.slice(0, 8) };
        }).sort(function(a, b) {
          return b.urls.length - a.urls.length;
        });
      }
      _emptyResult(url, start) {
        return {
          url,
          title: "",
          urlsFound: 0,
          serverCatalog: [],
          findings: { videoUrls: [], downloadUrls: [], serverUrls: [], navigationUrls: [], otherUrls: [] },
          goal: "unknown",
          durationMs: Date.now() - start
        };
      }
    };
    module2.exports = { StaticScraper };
  }
});

// src/intelligent/launcher.js
var require_launcher = __commonJS({
  "src/intelligent/launcher.js"(exports2, module2) {
    var { existsSync } = require("fs");
    var { getLogger } = require_logger();
    var KNOWN_CHROME_PATHS = {
      win32: [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        (process.env.LOCALAPPDATA || "") + "\\Google\\Chrome\\Application\\chrome.exe"
      ],
      darwin: [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium"
      ],
      linux: [
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium-browser"
      ]
    };
    function findSystemChrome() {
      const envPath = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
      if (envPath && existsSync(envPath)) return envPath;
      const platform = process.platform;
      const paths = KNOWN_CHROME_PATHS[platform] || [];
      for (const p of paths) {
        if (p && existsSync(p)) return p;
      }
      return null;
    }
    function findSparticuzChromium() {
      return __async(this, null, function* () {
        try {
          const Chromium = require("@sparticuz/chromium");
          if (Chromium && typeof Chromium.executablePath === "function") {
            const path = yield Chromium.executablePath();
            if (path) {
              const args = Chromium.args || [];
              return { path, args };
            }
          }
        } catch (e) {
        }
        return null;
      });
    }
    function createBrowser(config) {
      return __async(this, null, function* () {
        const log = getLogger();
        config = config || {};
        let puppeteer;
        try {
          puppeteer = require("puppeteer-core");
        } catch (e) {
          puppeteer = require("puppeteer");
        }
        const launchArgs = [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--single-process",
          "--disable-zygote",
          "--no-zygote",
          "--memory-pressure-off",
          "--disable-features=TranslateUI",
          "--disable-extensions",
          "--disable-component-extensions-with-background-pages",
          "--disable-background-networking",
          "--disable-sync",
          "--disable-default-apps",
          "--disable-breakpad",
          "--window-size=1280,720"
        ];
        if (config.stealth !== false) {
          launchArgs.push("--disable-blink-features=AutomationControlled");
        }
        const launchOptions = {
          headless: config.headless !== false,
          args: launchArgs,
          timeout: config.timeout || 3e4
        };
        const systemChrome = findSystemChrome();
        if (systemChrome) {
          launchOptions.executablePath = systemChrome;
          log.info({ chromePath: systemChrome }, "Browser: system Chrome");
        } else {
          const sparticuz = yield findSparticuzChromium();
          if (sparticuz) {
            launchOptions.executablePath = sparticuz.path;
            if (sparticuz.args.length > 0) {
              launchOptions.args = [...sparticuz.args, ...launchArgs];
            }
            log.info({ path: sparticuz.path }, "Browser: @sparticuz/chromium");
          } else {
            log.info("Browser: bundled Chromium (puppeteer)");
          }
        }
        const browser = yield puppeteer.launch(launchOptions);
        log.info("Browser launched");
        return browser;
      });
    }
    function createPage(browser, config) {
      return __async(this, null, function* () {
        config = config || {};
        const page = yield browser.newPage();
        yield page.setViewport({ width: 1280, height: 720 });
        yield page.setDefaultTimeout(config.timeout || 3e4);
        if (config.stealth !== false) {
          yield page.evaluateOnNewDocument(function() {
            Object.defineProperty(navigator, "webdriver", { get: function() {
              return false;
            } });
            Object.defineProperty(navigator, "plugins", { get: function() {
              return [1, 2, 3, 4, 5];
            } });
            Object.defineProperty(navigator, "languages", { get: function() {
              return ["es-ES", "es", "en-US", "en"];
            } });
            window.chrome = { runtime: {} };
          });
        }
        yield page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36");
        return page;
      });
    }
    module2.exports = { createBrowser, createPage, findSystemChrome, findSparticuzChromium };
  }
});

// src/intelligent/resource-blocker.js
var require_resource_blocker = __commonJS({
  "src/intelligent/resource-blocker.js"(exports2, module2) {
    var BLOCKED_TYPES = ["image", "media", "font", "stylesheet", "ping"];
    function setupResourceBlocking(page) {
      return __async(this, null, function* () {
        yield page.setRequestInterception(true);
        page.on("request", function(request) {
          const type = request.resourceType();
          if (BLOCKED_TYPES.includes(type)) {
            request.abort();
          } else {
            request.continue();
          }
        });
      });
    }
    function blockResourcesOnly(req) {
      const type = req.resourceType();
      if (BLOCKED_TYPES.includes(type)) {
        req.abort();
      } else {
        req.continue();
      }
    }
    module2.exports = { setupResourceBlocking, blockResourcesOnly, BLOCKED_TYPES };
  }
});

// src/intelligent/browser-pool.js
var require_browser_pool = __commonJS({
  "src/intelligent/browser-pool.js"(exports2, module2) {
    var { randomUUID } = require("crypto");
    var { getLogger } = require_logger();
    var BrowserPool = class {
      constructor(launchFn, options) {
        this.instances = [];
        this.waiting = [];
        this.launchFn = launchFn;
        this.options = Object.assign({ min: 0, max: 1, idleTimeoutMs: 3e4 }, options);
        this.closed = false;
        this.cleanupTimer = null;
        this._startCleanup();
      }
      acquire() {
        return __async(this, null, function* () {
          if (this.closed) throw new Error("BrowserPool is closed");
          const free = this.instances.find(function(inst) {
            return !inst.inUse && inst.browser.isConnected();
          });
          if (free) {
            free.inUse = true;
            free.lastUsedAt = Date.now();
            free.usageCount++;
            getLogger().debug({ id: free.id, usageCount: free.usageCount }, "Browser acquired from pool");
            return free;
          }
          if (this.instances.length < this.options.max) {
            const instance = yield this._createInstance();
            instance.inUse = true;
            return instance;
          }
          return new Promise(function(resolve) {
            this.waiting.push(resolve);
          }.bind(this));
        });
      }
      release(instance) {
        return __async(this, null, function* () {
          instance.inUse = false;
          instance.lastUsedAt = Date.now();
          getLogger().debug({ id: instance.id }, "Browser released to pool");
          const next = this.waiting.shift();
          if (next) {
            instance.inUse = true;
            instance.usageCount++;
            next(instance);
          }
        });
      }
      destroyInstance(instance) {
        return __async(this, null, function* () {
          const idx = this.instances.indexOf(instance);
          if (idx !== -1) {
            this.instances.splice(idx, 1);
          }
          try {
            yield instance.browser.close();
            getLogger().debug({ id: instance.id }, "Browser instance destroyed");
          } catch (e) {
          }
        });
      }
      closeAll() {
        return __async(this, null, function* () {
          this.closed = true;
          if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
          }
          const log = getLogger();
          log.info({ count: this.instances.length }, "Closing all browser instances");
          yield Promise.allSettled(this.instances.map(function(inst) {
            return inst.browser.close();
          }));
          this.instances = [];
          this.waiting = [];
        });
      }
      getStats() {
        return {
          total: this.instances.length,
          inUse: this.instances.filter(function(i) {
            return i.inUse;
          }).length,
          free: this.instances.filter(function(i) {
            return !i.inUse && i.browser.isConnected();
          }).length,
          waiting: this.waiting.length
        };
      }
      _createInstance() {
        return __async(this, null, function* () {
          const log = getLogger();
          log.info("Launching new browser instance");
          const browser = yield this.launchFn();
          const instance = {
            id: randomUUID().slice(0, 8),
            browser,
            inUse: false,
            createdAt: Date.now(),
            lastUsedAt: Date.now(),
            usageCount: 0
          };
          this.instances.push(instance);
          log.info({ id: instance.id, total: this.instances.length }, "Browser instance created");
          return instance;
        });
      }
      _startCleanup() {
        const self = this;
        this.cleanupTimer = setInterval(function() {
          self._cleanupIdle();
        }, 3e4);
        if (this.cleanupTimer && typeof this.cleanupTimer.unref === "function") {
          this.cleanupTimer.unref();
        }
      }
      _cleanupIdle() {
        const now = Date.now();
        const toKeep = Math.max(this.options.min, 0);
        const self = this;
        const idle = this.instances.filter(function(inst) {
          return !inst.inUse && now - inst.lastUsedAt > self.options.idleTimeoutMs;
        });
        const toRemove = idle.slice(0, Math.max(0, this.instances.length - toKeep));
        for (const inst of toRemove) {
          getLogger().debug({ id: inst.id, idleMs: now - inst.lastUsedAt }, "Removing idle browser");
          this.destroyInstance(inst);
        }
      }
    };
    module2.exports = { BrowserPool };
  }
});

// src/intelligent/dynamic-handler.js
var require_dynamic_handler = __commonJS({
  "src/intelligent/dynamic-handler.js"(exports2, module2) {
    var { getLogger } = require_logger();
    var DynamicPageHandler = class {
      constructor(page) {
        this.page = page;
        this.adaptiveWaitMs = 2e3;
      }
      navigate(url, options) {
        return __async(this, null, function* () {
          const log = getLogger();
          const timeout = options && options.timeout || 15e3;
          try {
            yield this.page.goto(url, { waitUntil: "domcontentloaded", timeout });
            yield new Promise(function(r) {
              setTimeout(r, 1500);
            });
          } catch (err) {
            log.debug({ url, error: err.message }, "Navigation failed");
          }
        });
      }
      waitForContent(options) {
        return __async(this, null, function* () {
          options = options || {};
          const timeout = options.timeout || 1e4;
          const waitForSelectors = options.waitForSelectors || [];
          const minDomStability = options.minDomStability || 300;
          const checkInterval = options.checkInterval || 250;
          const log = getLogger();
          const start = Date.now();
          let lastNodeCount = 0;
          let stableSince = 0;
          while (Date.now() - start < timeout) {
            yield new Promise(function(r) {
              setTimeout(r, checkInterval);
            });
            const nodeCount = yield this.getDomCount();
            const urlChanged = options.waitForUrlChange ? yield this.page.evaluate(function() {
              return window.__scraper_initial_url !== window.location.href;
            }).catch(function() {
              return false;
            }) : false;
            if (nodeCount === lastNodeCount) {
              stableSince += checkInterval;
            } else {
              stableSince = 0;
              lastNodeCount = nodeCount;
              this.adaptiveWaitMs = Math.min(this.adaptiveWaitMs + 200, 5e3);
            }
            let selectorsReady = true;
            for (let i = 0; i < waitForSelectors.length; i++) {
              const sel = waitForSelectors[i];
              const exists = yield this.page.$(sel).then(function(el) {
                return !!el;
              }).catch(function() {
                return false;
              });
              if (!exists) {
                selectorsReady = false;
                break;
              }
            }
            const domStable = stableSince >= minDomStability;
            const selOk = waitForSelectors.length === 0 || selectorsReady;
            const urlOk = !options.waitForUrlChange || urlChanged;
            if (domStable && selOk && urlOk) {
              log.debug({ elapsed: Date.now() - start, stableMs: stableSince, nodes: nodeCount }, "Content ready");
              return;
            }
          }
          const remaining = timeout - (Date.now() - start);
          if (waitForSelectors.length > 0 && remaining > 0) {
            for (let i = 0; i < waitForSelectors.length; i++) {
              try {
                yield this.page.waitForSelector(waitForSelectors[i], { timeout: remaining });
              } catch (e) {
              }
            }
          }
          const elapsed = Date.now() - start;
          if (elapsed < this.adaptiveWaitMs) {
            yield new Promise(function(r) {
              setTimeout(r, this.adaptiveWaitMs - elapsed);
            }.bind(this));
          }
        });
      }
      triggerLazyElements() {
        return __async(this, null, function* () {
          const result = yield this.page.evaluate(function() {
            let triggered = 0;
            const lazyImgs = document.querySelectorAll('img[loading="lazy"], img[data-src], img[data-lazy], img[data-original]');
            lazyImgs.forEach(function(img) {
              const src = img.getAttribute("data-src") || img.getAttribute("data-lazy") || img.getAttribute("data-original");
              if (src && !img.src) {
                img.src = src;
                triggered++;
              }
              if (img.loading === "lazy") {
                img.loading = "eager";
                triggered++;
              }
            });
            const lazyIframes = document.querySelectorAll('iframe[loading="lazy"], iframe[data-src]');
            lazyIframes.forEach(function(f) {
              const src = f.getAttribute("data-src");
              if (src && !f.src) {
                f.src = src;
                triggered++;
              }
            });
            const hiddenDivs = document.querySelectorAll('[data-loaded="false"], .lazy-hidden, .lazyload');
            hiddenDivs.forEach(function(el) {
              el.style.display = el.style.display || "block";
              el.classList.remove("lazy-hidden", "lazyload");
              triggered++;
            });
            return triggered;
          });
          if (result > 0) {
            getLogger().debug({ triggered: result }, "Lazy elements triggered");
          }
          return result;
        });
      }
      clickAndCaptureUrls(clickSelector, timeout) {
        return __async(this, null, function* () {
          timeout = timeout || 6e3;
          const capturedUrls = /* @__PURE__ */ new Set();
          const handler = function(response) {
            try {
              const url = response.url();
              if (url && url.startsWith("http") && !url.includes("google") && !url.includes("analytics")) {
                capturedUrls.add(url);
              }
            } catch (e) {
            }
          };
          try {
            this.page.on("response", handler);
            yield this.page.waitForSelector(clickSelector, { timeout: 3e3 });
            yield this.page.click(clickSelector);
            yield new Promise(function(r) {
              setTimeout(r, timeout);
            });
            this.page.off("response", handler);
            const iframeUrls = yield this.page.evaluate(function() {
              const iframes = document.querySelectorAll("iframe");
              const urls = [];
              iframes.forEach(function(f) {
                if (f.src && f.src !== "about:blank") urls.push(f.src);
              });
              return urls;
            });
            iframeUrls.forEach(function(u) {
              capturedUrls.add(u);
            });
            return [...capturedUrls];
          } catch (err) {
            this.page.off("response", handler);
            getLogger().debug({ error: err.message }, "clickAndCapture failed");
            return [];
          }
        });
      }
      getDomCount() {
        return __async(this, null, function* () {
          return this.page.evaluate(function() {
            return document.querySelectorAll("*").length;
          });
        });
      }
      getAdaptiveWaitMs() {
        return this.adaptiveWaitMs;
      }
      resetAdaptiveWait() {
        this.adaptiveWaitMs = 2e3;
      }
    };
    module2.exports = { DynamicPageHandler };
  }
});

// src/intelligent/page-type-classifier.js
var require_page_type_classifier = __commonJS({
  "src/intelligent/page-type-classifier.js"(exports2, module2) {
    var PageTypeClassifier = class {
      analyze(elements, pageUrl, pageTitle) {
        const signals = [];
        const keyElements = [];
        const links = elements.filter(function(e) {
          return e.type === "link" && e.attr.href && !e.attr.href.startsWith("#");
        });
        const clickables = elements.filter(function(e) {
          return e.type === "clickable";
        });
        const iframes = elements.filter(function(e) {
          return e.type === "iframe";
        });
        const inputs = elements.filter(function(e) {
          return e.type === "input";
        });
        const listItems = elements.filter(function(e) {
          return e.type === "list-item";
        });
        const images = elements.filter(function(e) {
          return e.type === "image";
        });
        let listingScore = 0;
        const cardClasses = this._findRepeatingClasses(elements, 4);
        if (cardClasses.length > 0) {
          listingScore += 30;
          signals.push("cards:" + cardClasses[0]);
          keyElements.push({ type: "card-grid", selector: "." + cardClasses[0], label: cardClasses[0], count: this._countByClass(elements, cardClasses[0]) });
        }
        if (links.length > 20) {
          listingScore += 15;
          signals.push("many-links");
        }
        const hasPagination = elements.some(function(e) {
          return /pagin|page|naveg/i.test(e.class + e.text);
        });
        if (hasPagination) {
          listingScore += 15;
          signals.push("pagination");
        }
        if (inputs.length > 0) {
          listingScore += 10;
          signals.push("search-input");
        }
        if (/catalogo|directory|browse|list|home|index|inicio/i.test(pageUrl.toLowerCase())) {
          listingScore += 15;
          signals.push("url:catalog");
        }
        let detailScore = 0;
        const episodePattern = listItems.filter(function(e) {
          return /\d+/.test(e.text) && /episod|capitul|chapter|season|temporada|ep\.?\s*\d|cap\.?\s*\d/i.test(e.text + e.class);
        });
        if (episodePattern.length >= 3) {
          detailScore += 40;
          signals.push("episodes:" + episodePattern.length);
          keyElements.push({ type: "episode-list", selector: episodePattern[0].parent || "ul", label: "Episodes", count: episodePattern.length });
        }
        const longTexts = elements.filter(function(e) {
          return e.type === "text" && e.text.length > 80;
        });
        if (longTexts.length >= 1) {
          detailScore += 10;
          signals.push("synopsis");
        }
        const genreTags = elements.filter(function(e) {
          return /accion|comedia|drama|romance|fantasia|terror|aventura|action|comedy|drama|romance|fantasy|horror|adventure|shounen|shoujo|seinen/i.test(e.text) && e.text.length < 20;
        });
        if (genreTags.length >= 2) {
          detailScore += 15;
          signals.push("genres:" + genreTags.length);
        }
        const seasonTabs = elements.filter(function(e) {
          return /season|temporada|temp\.?\s*\d/i.test(e.text + e.class);
        });
        if (seasonTabs.length >= 1) {
          detailScore += 15;
          signals.push("season-tabs");
        }
        let contentScore = 0;
        if (iframes.length > 0) {
          contentScore += 35;
          signals.push("iframes:" + iframes.length);
          keyElements.push({ type: "player", selector: "iframe", label: "Video Player", count: iframes.length });
        }
        const serverButtons = clickables.filter(function(e) {
          return /server|servidor|opcion|mirror|source|fuente|calidad|quality|HD|SD|720|1080/i.test(e.text + e.class);
        });
        if (serverButtons.length >= 2) {
          contentScore += 30;
          signals.push("servers:" + serverButtons.length);
          keyElements.push({ type: "server-buttons", selector: serverButtons[0].selector, label: "Servers", count: serverButtons.length });
        }
        const downloadBtn = clickables.filter(function(e) {
          return /download|descarg/i.test(e.text + e.class);
        });
        if (downloadBtn.length > 0) {
          contentScore += 10;
          signals.push("download-btn");
        }
        const langSelectors = elements.filter(function(e) {
          return /idioma|language|lang|audio|dub|sub|latino|castellano/i.test(e.text + e.class);
        });
        if (langSelectors.length >= 1) {
          contentScore += 10;
          signals.push("language-selector");
        }
        if (/episode|episodio|capitulo|chapter|ver\//i.test(pageUrl.toLowerCase())) {
          contentScore += 15;
          signals.push("url:episode");
        }
        let searchScore = 0;
        if (inputs.length > 0 && /search|buscar|busqueda/i.test((pageTitle || "") + " " + inputs.map(function(e) {
          return e.attr && e.attr.placeholder || "";
        }).join(" "))) {
          searchScore += 30;
          signals.push("search-active");
        }
        if (/search|buscar|busqueda|find|query|q=/i.test(pageUrl.toLowerCase())) {
          searchScore += 30;
          signals.push("url:search");
        }
        const scores = [
          { type: "listing", score: listingScore },
          { type: "detail", score: detailScore },
          { type: "content", score: contentScore },
          { type: "search", score: searchScore }
        ];
        scores.sort(function(a, b) {
          return b.score - a.score;
        });
        const best = scores[0];
        let type = "unknown", confidence = 0, suggestedStrategy = "explore";
        if (best.score >= 40) {
          type = best.type;
          confidence = Math.min(100, best.score);
          switch (type) {
            case "listing":
              suggestedStrategy = "extract-links";
              break;
            case "detail":
              suggestedStrategy = "find-episodes";
              break;
            case "content":
              suggestedStrategy = "click-servers";
              break;
            case "search":
              suggestedStrategy = "search-results";
              break;
          }
        } else if (best.score >= 20) {
          type = best.type;
          confidence = best.score;
          suggestedStrategy = "explore";
        }
        return { type, confidence, signals, suggestedStrategy, keyElements };
      }
      _findRepeatingClasses(elements, minRepeats) {
        const classCounts = /* @__PURE__ */ new Map();
        for (const el of elements) {
          const cls = (el.class || "").split(/\s+/)[0];
          if (cls && cls.length > 2 && cls.length < 40) {
            classCounts.set(cls, (classCounts.get(cls) || 0) + 1);
          }
        }
        return [...classCounts.entries()].filter(function(e) {
          return e[1] >= minRepeats;
        }).sort(function(a, b) {
          return b[1] - a[1];
        }).slice(0, 5).map(function(e) {
          return e[0];
        });
      }
      _countByClass(elements, cls) {
        return elements.filter(function(e) {
          return (e.class || "").includes(cls);
        }).length;
      }
    };
    module2.exports = { PageTypeClassifier };
  }
});

// src/intelligent/autonomous-scraper.js
var require_autonomous_scraper = __commonJS({
  "src/intelligent/autonomous-scraper.js"(exports2, module2) {
    var { SmartAnalyzer } = require_smart_analyzer();
    var { SessionMemory, textSimilarity } = require_session_memory();
    var { DynamicPageHandler } = require_dynamic_handler();
    var { PageTypeClassifier } = require_page_type_classifier();
    var { SkeletonDetector } = require_skeleton_detector();
    var { getLogger } = require_logger();
    var AD_DOMAINS = /analytics|track|pixel|beacon|adexchange|cookielaw|cookiepedia|onetrust|doubleclick|googlesyndication|googletagmanager/i;
    var AutonomousScraper = class {
      constructor(page, options) {
        this.page = page;
        this.visited = /* @__PURE__ */ new Set();
        this.urlCollector = [];
        this.steps = [];
        this.stepCount = 0;
        this.requestCount = 0;
        this.maxRequests = options && options.maxRequests || 50;
        this.searchTerm = options && options.searchTerm || "";
        this.contentGoal = options && options.contentGoal || "auto";
        this.ai = new SmartAnalyzer();
        this.memory = new SessionMemory();
        this.dynamic = new DynamicPageHandler(page);
        this.consecutiveFails = 0;
        this.seenGroupPatterns = /* @__PURE__ */ new Set();
        this.skipClasses = /* @__PURE__ */ new Set();
        this.lastModelUrl = "";
        this.cachedModel = null;
        this.pageClassifier = new PageTypeClassifier();
        this.skeletonDetector = new SkeletonDetector();
        this.MAX_TIME = 9e4;
        this.MAX_DEPTH = options && options.maxDepth || 2;
      }
      _extractDomain(url) {
        try {
          return new URL(url).hostname.replace("www.", "");
        } catch (e) {
          return url.slice(0, 40);
        }
      }
      _throttle() {
        return __async(this, null, function* () {
          this.requestCount++;
          if (this.requestCount > this.maxRequests) {
            getLogger().warn({ max: this.maxRequests }, "Request limit reached");
            return false;
          }
          const delay = 400 + Math.random() * 800;
          yield new Promise(function(r) {
            setTimeout(r, delay);
          });
          return true;
        });
      }
      investigate(url) {
        return __async(this, null, function* () {
          const log = getLogger();
          const start = Date.now();
          this.urlCollector = [];
          this.steps = [];
          this.stepCount = 0;
          this.consecutiveFails = 0;
          this.seenGroupPatterns.clear();
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
          this.lastModelUrl = "";
          log.info({ skipClasses: this.skipClasses.size }, "Loaded skip classes from memory");
          const knownUrls = /* @__PURE__ */ new Set();
          const visitedPages = /* @__PURE__ */ new Set();
          const self = this;
          const diffAndCollect = function(urls, source, domain) {
            const fresh = [];
            for (let i = 0; i < urls.length; i++) {
              const u = urls[i];
              if (!u || u === "about:blank" || knownUrls.has(u)) continue;
              if (AD_DOMAINS.test(u)) continue;
              if (AD_DOMAINS.test(self._extractDomain(u))) continue;
              knownUrls.add(u);
              fresh.push(u);
              self.urlCollector.push({ url: u, category: "unknown", source: source + " | " + domain });
            }
            return fresh;
          };
          const explorePage = function(pageUrl, depth) {
            return __async(this, null, function* () {
              depth = depth || 0;
              if (Date.now() - start > self.MAX_TIME) return;
              const serverCount = self.urlCollector.filter(function(u) {
                const c = self.ai.classifyURL(u.url, u.source);
                return c.type === "embed" || c.type === "direct-video" || c.type === "stream";
              }).length;
              const effectiveMaxDepth = serverCount >= 3 ? Math.min(self.MAX_DEPTH, depth + 1) : self.MAX_DEPTH;
              if (depth > effectiveMaxDepth) return;
              let fp = pageUrl.split("?")[0].replace(/\/+$/, "");
              fp = fp.replace(/\/\d+$/, "/X");
              if (visitedPages.has(fp)) return;
              visitedPages.add(fp);
              log.debug({ url: pageUrl, depth }, "Exploring");
              yield self.dynamic.navigate(pageUrl, { timeout: 15e3 });
              yield self.dynamic.triggerLazyElements();
              const domain = self._extractDomain(pageUrl);
              self.memory.setCurrentDomain(domain);
              const model2 = yield self._buildModel();
              const skeletonSelectors = self.skeletonDetector.skeletonSelectors && self.skeletonDetector.skeletonSelectors.get(domain);
              if (skeletonSelectors && skeletonSelectors.size > 10 && depth > 0) {
                const totalEls = model2.elements.length;
                let skeletonEls = 0;
                for (let i = 0; i < model2.elements.length; i++) {
                  if (self.skeletonDetector.isSkeleton(domain, model2.elements[i].selector, model2.elements[i].text)) skeletonEls++;
                }
                if (totalEls > 0 && skeletonEls / totalEls > 0.7) {
                  log.debug({ url: pageUrl, skelPct: Math.round(skeletonEls / totalEls * 100) }, "Mostly skeleton, scan-only");
                  const quickUrls = yield self._extractAllUrls();
                  diffAndCollect(quickUrls, "skeleton-scan", pageUrl);
                  return;
                }
              }
              const pageUrls = yield self._extractAllUrls();
              self.skeletonDetector.addPageFingerprint(
                domain,
                pageUrl,
                model2.elements.map(function(e) {
                  return e.selector;
                }),
                model2.elements.map(function(e) {
                  return e.text;
                }),
                model2.elements.map(function(e) {
                  return e.class;
                })
              );
              const pageAnalysis = self.pageClassifier.analyze(model2.elements, pageUrl, model2.title);
              log.info({ type: pageAnalysis.type, conf: pageAnalysis.confidence, signals: pageAnalysis.signals.slice(0, 3).join(", ") }, "Page classified");
              if (pageAnalysis.type === "content") {
                const contentGroups = self._detectGroups(model2.elements);
                for (let g = 0; g < contentGroups.length; g++) {
                  const cg = contentGroups[g];
                  const isServer = /server|servidor|opcion|download|descarg|video|player|reproduct/i.test(cg.label + cg.labels.join(" "));
                  if (!isServer) continue;
                  yield self._logStep("content-servers", cg.label, "Servers: " + cg.labels.slice(0, 5).join(", "));
                  for (let i = 0; i < Math.min(cg.items.length, 6); i++) {
                    if (Date.now() - start > self.MAX_TIME) break;
                    const item = cg.items[i];
                    const captured = yield self.dynamic.clickAndCaptureUrls(item.selector, 5e3);
                    diffAndCollect(captured, item.label, domain);
                    self.memory.recordAttempt(item.selector, "clickable", "click", captured.length > 0, captured.length, captured, domain);
                  }
                }
                const finalContentUrls = yield self._extractAllUrls();
                diffAndCollect(finalContentUrls, "content-final", pageUrl);
                return;
              }
              const groups = self._detectGroups(model2.elements);
              let groupFails = 0;
              for (let g = 0; g < groups.length; g++) {
                if (Date.now() - start > self.MAX_TIME) break;
                if (groupFails >= 2) break;
                const group = groups[g];
                const isNavMenu = /nav|menu|header|footer/i.test(group.label + group.selector);
                if (isNavMenu) continue;
                if (self._shouldSkipElement(group.selector, "group", group.labels.join(","))) continue;
                yield self._logStep("group", group.selector, "Group: " + group.labels.slice(0, 5).join(", "));
                const isServerGroup = /server|servidor|opcion|mirror|source|video|player|netu|yourupload|mega|okru|streamtape|filemoon|uqload|hqq|swhoi|burstcloud|streamwish|logo|download|descarg|idioma|language/i.test(group.label + group.labels.join(" "));
                let groupHadSuccess = false;
                for (let i = 0; i < group.items.length; i++) {
                  if (Date.now() - start > self.MAX_TIME) break;
                  const item = group.items[i];
                  if (visitedPages.has(item.selector)) continue;
                  visitedPages.add(item.selector);
                  if (self._shouldSkipElement(item.selector, "click", item.label)) continue;
                  const href = item.attr && item.attr.href;
                  if (href && !isServerGroup && (href.startsWith("http") || href.startsWith("/")) && !href.startsWith("#") && !href.startsWith("javascript:")) {
                    yield self._logStep("navigate", item.selector, 'Following: "' + item.label + '"');
                    try {
                      yield explorePage(href, depth + 1);
                      visitedPages.add(href.split("?")[0].replace(/\/\d+$/, "/X"));
                      yield self.dynamic.navigate(pageUrl, { timeout: 1e4 });
                      yield self._buildModel();
                      groupHadSuccess = true;
                    } catch (e) {
                      continue;
                    }
                    continue;
                  }
                  if (isServerGroup) {
                    const captured = yield self.dynamic.clickAndCaptureUrls(item.selector, 4e3);
                    const fresh = diffAndCollect(captured, item.label, domain);
                    self.memory.recordAttempt(item.selector, "clickable", "click", fresh.length > 0, fresh.length, fresh, domain);
                    if (fresh.length > 0) groupHadSuccess = true;
                  } else if (i < 2) {
                    yield self._safeClick(item.selector);
                    const after = yield self._extractAllUrls();
                    const fresh = diffAndCollect(after, item.label, domain);
                    self.memory.recordAttempt(item.selector, "clickable", "click", fresh.length > 0, fresh.length, fresh, domain);
                    if (fresh.length > 0) groupHadSuccess = true;
                  }
                }
                if (groupHadSuccess) groupFails = 0;
                else groupFails++;
              }
              const finalUrls = yield self._extractAllUrls();
              diffAndCollect(finalUrls, "final", pageUrl);
              if (depth < self.MAX_DEPTH && pageUrls.length > 0) {
                const containers = pageUrls.filter(function(u) {
                  const cls = self.ai.classifyURL(u, u);
                  if (AD_DOMAINS.test(u)) return false;
                  const d = self._extractDomain(u);
                  if (d === domain && /^\/(login|emision|catalogo|comunidad|peticiones|inicio|registro|profile|cuenta)/i.test(new URL(u).pathname)) return false;
                  return cls.isContainer && (cls.type === "embed" || cls.type === "navigation") || self.memory.isKnownContainerDomain(d);
                }).sort(function(a, b) {
                  const aEmb = /embed|player|reproductor|stream|video/i.test(a) ? 0 : 1;
                  const bEmb = /embed|player|reproductor|stream|video/i.test(b) ? 0 : 1;
                  return aEmb - bEmb;
                }).slice(0, 1);
                for (let c = 0; c < containers.length; c++) {
                  if (Date.now() - start > self.MAX_TIME) break;
                  if (visitedPages.has(containers[c])) continue;
                  yield self._logStep("dive", self._extractDomain(containers[c]), "Deep: " + containers[c].slice(0, 50));
                  try {
                    yield explorePage(containers[c], depth + 1);
                    visitedPages.add(containers[c].split("?")[0].replace(/\/\d+$/, "/X"));
                    yield self.dynamic.navigate(pageUrl, { timeout: 1e4 });
                    yield self._buildModel();
                  } catch (e) {
                    continue;
                  }
                }
              }
            });
          };
          const title = yield this.page.title();
          yield explorePage(url, 0);
          this._categorizeUrls();
          const serverCatalog = this._buildServerCatalog();
          for (let i = 0; i < this.urlCollector.length; i++) {
            const entry = this.urlCollector[i];
            const cls = this.ai.classifyURL(entry.url, entry.source);
            if (cls.type === "embed" || cls.type === "download") {
              const sourceDomain = entry.source.split("|")[1] ? entry.source.split("|")[1].trim() : "";
              if (sourceDomain) {
                this.memory.recordChain(url, entry.url, cls.type === "embed" ? "servers" : "download");
              }
            }
          }
          const duration = Date.now() - start;
          log.info({ steps: this.steps.length, servers: serverCatalog.length, duration }, "Investigation complete");
          this.memory.forceSave();
          const model = this.cachedModel || (yield this._buildModel());
          return {
            url,
            title,
            steps: this.steps,
            serverCatalog,
            findings: this._categorizeUrls(),
            model: { roles: [...new Set(model.elements.map(function(e) {
              return e.type;
            }))], totalElements: model.elements.length, interactions: this.stepCount },
            durationMs: duration
          };
        });
      }
      // ─── Build semantic page model ─────────────────────────────
      _buildModel() {
        return __async(this, null, function* () {
          const currentUrl = this.page.url();
          if (this.cachedModel && this.lastModelUrl === currentUrl) {
            return this.cachedModel;
          }
          const title = yield this.page.title();
          const raw = yield this.page.evaluate(function() {
            function buildSelector(el2) {
              if (el2.id) return "#" + CSS.escape(el2.id);
              var tag = el2.tagName.toLowerCase();
              if (el2.className && typeof el2.className === "string") {
                var classes = el2.className.toString().trim().split(/\s+/);
                var cls = "";
                for (var i2 = 0; i2 < classes.length; i2++) {
                  if (classes[i2].length > 2 && classes[i2].length < 40) {
                    cls = classes[i2];
                    break;
                  }
                }
                if (cls) {
                  var allSame = document.querySelectorAll(tag + "." + CSS.escape(cls));
                  if (allSame.length > 1) {
                    var idx = Array.from(allSame).indexOf(el2) + 1;
                    return tag + "." + CSS.escape(cls) + ":nth-of-type(" + idx + ")";
                  }
                  return tag + "." + CSS.escape(cls);
                }
              }
              var parent = el2.parentElement;
              if (parent) {
                var pidx = Array.from(parent.children).indexOf(el2) + 1;
                return buildSelector(parent) + " > " + tag + ":nth-child(" + pidx + ")";
              }
              return tag;
            }
            function getAttributes(el2) {
              var attrs = {};
              var names = ["id", "class", "href", "src", "onclick", "placeholder", "type", "alt", "title", "data-url", "data-src", "data-anime", "data-value", "aria-label", "role"];
              for (var i2 = 0; i2 < names.length; i2++) {
                var val = el2.getAttribute(names[i2]);
                if (val) attrs[names[i2]] = val.slice(0, 200);
              }
              return attrs;
            }
            function isVisible(el2) {
              if (!el2.offsetParent && el2.tagName !== "BODY" && el2.tagName !== "HTML") return false;
              var style = getComputedStyle(el2);
              return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
            }
            function classify(el2) {
              var tag = el2.tagName.toLowerCase();
              var text = (el2.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60);
              var attrs = getAttributes(el2);
              if (tag === "input" || tag === "textarea") return "input";
              if (tag === "select") return "select";
              if (tag === "a" || attrs.href) return "link";
              if (tag === "button" || attrs.onclick || attrs.role === "button" || attrs.role === "tab") return "clickable";
              if (tag === "img") return "image";
              if (tag === "iframe") return "iframe";
              if (tag === "video" || tag === "audio") return "media";
              if (/h[1-6]/i.test(tag)) return "heading";
              if (tag === "li") return "list-item";
              if (text.length > 0 && el2.children.length === 0) return "text";
              return "container";
            }
            var elements2 = [];
            var all = document.querySelectorAll("*");
            for (var i = 0; i < all.length; i++) {
              var el = all[i];
              if (!isVisible(el)) continue;
              var type = classify(el);
              if (type === "container" && el.children.length < 2) continue;
              if (type === "container" && el.children.length > 50) continue;
              elements2.push({
                tag: el.tagName,
                selector: buildSelector(el),
                id: el.id || "",
                class: el.className && typeof el.className === "string" ? el.className.toString().trim().slice(0, 80) : "",
                text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 60),
                type,
                attr: getAttributes(el),
                children: [],
                parent: el.parentElement ? el.parentElement.id || (el.parentElement.className && typeof el.parentElement.className === "string" ? el.parentElement.className.toString().split(/\s+/)[0] : "") || el.parentElement.tagName : "",
                depth: 0
              });
            }
            return elements2.slice(0, 300);
          });
          const elements = raw;
          const model = { title, elements, semanticTree: [] };
          this.cachedModel = model;
          this.lastModelUrl = currentUrl;
          return model;
        });
      }
      // ─── Detect button groups ──────────────────────────────────
      _detectGroups(elements) {
        const groups = [];
        const clickables = elements.filter(function(e) {
          return (e.type === "clickable" || e.type === "link") && e.text.length > 1;
        });
        const byParent = /* @__PURE__ */ new Map();
        for (let i = 0; i < clickables.length; i++) {
          const el = clickables[i];
          const parentKey = el.parent || "root";
          if (!byParent.has(parentKey)) byParent.set(parentKey, []);
          byParent.get(parentKey).push(el);
        }
        byParent.forEach(function(siblings) {
          if (siblings.length < 2) return;
          const classes = siblings.map(function(s) {
            return (s.class || "").split(/\s+/)[0];
          }).filter(Boolean);
          const uniqueClasses = [...new Set(classes)];
          if (uniqueClasses.length <= 3 && siblings.length >= 2 && siblings.length <= 20) {
            const skipWords = /login|iniciar|regist|cuenta|discord|telegram|facebook|instagram|chat|cookie|privac|dmca/i;
            const validItems = siblings.filter(function(s) {
              return !skipWords.test(s.text);
            });
            if (validItems.length < 2) return;
            groups.push({
              selector: validItems[0].parent || "body",
              label: validItems[0].parent || "options",
              count: validItems.length,
              labels: validItems.map(function(s) {
                return s.text.slice(0, 30);
              }),
              items: validItems.map(function(s) {
                return { selector: s.selector, label: s.text.slice(0, 30), attr: s.attr };
              })
            });
          }
        });
        return groups;
      }
      // ─── URL extraction ───────────────────────────────────────
      _extractAllUrls() {
        return __async(this, null, function* () {
          const result = yield this.page.evaluate(function() {
            var urls = [];
            var seen = {};
            function add(u) {
              if (!u || seen[u]) return;
              if (u.startsWith("#") || u.startsWith("javascript:") || u.startsWith("data:")) return;
              if (u === "about:blank") return;
              seen[u] = true;
              urls.push(u);
            }
            var iframes = document.querySelectorAll("iframe");
            for (var i = 0; i < iframes.length; i++) {
              add(iframes[i].src || iframes[i].getAttribute("src") || iframes[i].getAttribute("data-src"));
            }
            var mediaEls = document.querySelectorAll("video, video source, audio, audio source, embed, object");
            for (var j = 0; j < mediaEls.length; j++) {
              add(mediaEls[j].src || mediaEls[j].getAttribute("src"));
            }
            var allLinks = document.querySelectorAll("a[href]");
            for (var k = 0; k < Math.min(allLinks.length, 300); k++) {
              add(allLinks[k].href || allLinks[k].getAttribute("href"));
            }
            var clickables = document.querySelectorAll("[onclick]");
            for (var m = 0; m < clickables.length; m++) {
              var oc = clickables[m].getAttribute("onclick") || "";
              var matches = oc.match(/https?:\/\/[^'")\s]+/g);
              if (matches) {
                for (var n = 0; n < matches.length; n++) add(matches[n]);
              }
            }
            var dataEls = document.querySelectorAll("[data-url], [data-src], [data-video], [data-embed], [data-href]");
            for (var q = 0; q < dataEls.length; q++) {
              add(dataEls[q].getAttribute("data-url") || dataEls[q].getAttribute("data-src") || dataEls[q].getAttribute("data-video") || dataEls[q].getAttribute("data-embed") || dataEls[q].getAttribute("data-href"));
            }
            var scripts = document.querySelectorAll("script");
            for (var r = 0; r < scripts.length; r++) {
              var txt = scripts[r].textContent || "";
              if (txt.length < 30 || txt.length > 2e4) continue;
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
        });
      }
      // ─── Should skip element ───────────────────────────────────
      _shouldSkipElement(selector, elementType, label) {
        const domain = this._extractDomain(this.page.url());
        if (this.skeletonDetector.isSkeleton(domain, selector, label)) return true;
        const match = selector.match(/\.([\w-]+)/) || selector.match(/#([\w-]+)/);
        const cls = match ? match[1] : "";
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
              getLogger().debug({ class: cls, fails, succs }, "Skipping known-failure class");
              return true;
            }
          }
        }
        const groupKey = elementType + "|" + label.slice(0, 30);
        if (this.seenGroupPatterns.has(groupKey)) return true;
        return false;
      }
      // ─── Safe click ────────────────────────────────────────────
      _safeClick(selector) {
        return __async(this, null, function* () {
          try {
            yield this.page.waitForSelector(selector, { timeout: 3e3 });
            yield this.page.click(selector);
            yield new Promise(function(r) {
              setTimeout(r, 1e3);
            });
            return true;
          } catch (err) {
            getLogger().debug({ selector, error: err.message }, "safeClick failed");
            return false;
          }
        });
      }
      // ─── Log step ──────────────────────────────────────────────
      _logStep(action, target, reasoning) {
        return __async(this, null, function* () {
          this.stepCount++;
          getLogger().info({ step: this.stepCount, action, target }, reasoning);
          this.steps.push({
            step: this.stepCount,
            action,
            target,
            reasoning,
            result: { action, target, success: true, changes: 0, newUrls: [] }
          });
        });
      }
      // ─── Categorize URLs ───────────────────────────────────────
      _categorizeUrls() {
        const result = { videoUrls: [], downloadUrls: [], serverUrls: [], navigationUrls: [], otherUrls: [] };
        const seen = /* @__PURE__ */ new Set();
        for (let i = 0; i < this.urlCollector.length; i++) {
          const entry = this.urlCollector[i];
          if (seen.has(entry.url)) continue;
          seen.add(entry.url);
          const cls = this.ai.classifyURL(entry.url, entry.source);
          switch (cls.type) {
            case "direct-video":
            case "stream":
              entry.category = cls.type;
              result.videoUrls.push(entry.url);
              break;
            case "download":
              entry.category = "download";
              result.downloadUrls.push(entry.url);
              break;
            case "embed":
              entry.category = "embed";
              result.serverUrls.push(entry.url);
              break;
            case "navigation":
              entry.category = "navigation";
              result.navigationUrls.push(entry.url);
              break;
            default:
              entry.category = cls.type;
              result.otherUrls.push(entry.url);
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
        const servers = /* @__PURE__ */ new Map();
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
          const type = cls.type === "unknown" ? "other" : cls.type;
          list.push({ url: entry.url, type, label: entry.source.split("|")[0].trim().slice(0, 40) });
        }
        const catalog = [];
        servers.forEach(function(urls, name) {
          const unique = self._deduplicateUrls(urls);
          catalog.push({ name, domain: name, urls: unique });
        });
        return catalog.sort(function(a, b) {
          return b.urls.length - a.urls.length;
        });
      }
      _deduplicateUrls(urls) {
        const seen = /* @__PURE__ */ new Set();
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
          const sorted = [...params.entries()].sort().map(function(e) {
            return e[0] + "=" + e[1];
          }).join("&");
          return u.hostname.replace("www.", "") + u.pathname + "?" + sorted;
        } catch (e) {
          return url.replace(/https?:\/\//, "").split("?")[0].slice(0, 60);
        }
      }
      // ─── QUICK EXTRACT: Fast path for content pages (8-15s) ────
      // No recursive exploration — just extract streams from the current page
      quickExtract(url) {
        return __async(this, null, function* () {
          const log = getLogger();
          const start = Date.now();
          this.urlCollector = [];
          this.steps = [];
          this.stepCount = 0;
          log.info("QuickExtract: " + url);
          yield this.dynamic.navigate(url, { timeout: 15e3 });
          yield this.dynamic.triggerLazyElements();
          const domain = this._extractDomain(url);
          this.memory.setCurrentDomain(domain);
          const model = yield this._buildModel();
          const pageAnalysis = this.pageClassifier.analyze(model.elements, url, model.title);
          log.info("Page: " + pageAnalysis.type + " conf=" + pageAnalysis.confidence + " " + pageAnalysis.signals.slice(0, 3).join(", "));
          if (pageAnalysis.type === "content") {
            const iframeUrls = yield this._extractAllUrls();
            for (let i = 0; i < iframeUrls.length; i++) {
              const u = iframeUrls[i];
              if (u && u.startsWith("http") && !AD_DOMAINS.test(u)) {
                this.urlCollector.push({ url: u, category: "unknown", source: "iframe | " + domain });
              }
            }
            const groups = this._detectGroups(model.elements);
            for (let g = 0; g < groups.length; g++) {
              const cg = groups[g];
              const isServer = /server|servidor|opcion|download|descarg|video|player|reproduct|mirror|source|calidad/i.test(cg.label + cg.labels.join(" "));
              if (!isServer) continue;
              log.info("Server group: " + cg.labels.slice(0, 5).join(", "));
              yield this._logStep("click-servers", cg.label, "Clicking: " + cg.labels.slice(0, 5).join(", "));
              for (let i = 0; i < Math.min(cg.items.length, 8); i++) {
                if (Date.now() - start > 3e4) break;
                const item = cg.items[i];
                if (this._shouldSkipElement(item.selector, "click", item.label)) {
                  log.debug("Skip: " + item.label);
                  continue;
                }
                const captured = yield this.dynamic.clickAndCaptureUrls(item.selector, 4e3);
                this.memory.recordAttempt(item.selector, "clickable", "click", captured.length > 0, captured.length, captured, domain);
                if (captured.length > 0) {
                  log.info("Captured " + captured.length + " URLs from: " + item.label);
                  for (let j = 0; j < captured.length; j++) {
                    if (!AD_DOMAINS.test(captured[j])) {
                      this.urlCollector.push({ url: captured[j], category: "unknown", source: item.label + " | " + domain });
                    }
                  }
                }
              }
            }
            const finalUrls = yield this._extractAllUrls();
            for (let i = 0; i < finalUrls.length; i++) {
              if (finalUrls[i] && finalUrls[i].startsWith("http") && !AD_DOMAINS.test(finalUrls[i])) {
                const exists = this.urlCollector.some(function(u) {
                  return u.url === finalUrls[i];
                });
                if (!exists) {
                  this.urlCollector.push({ url: finalUrls[i], category: "unknown", source: "final | " + domain });
                }
              }
            }
          } else {
            log.info("Non-content page (" + pageAnalysis.type + "), extracting visible URLs only");
            const allUrls = yield this._extractAllUrls();
            for (let i = 0; i < allUrls.length; i++) {
              if (allUrls[i] && allUrls[i].startsWith("http") && !AD_DOMAINS.test(allUrls[i])) {
                this.urlCollector.push({ url: allUrls[i], category: "unknown", source: "static | " + domain });
              }
            }
          }
          this._categorizeUrls();
          const serverCatalog = this._buildServerCatalog();
          const duration = Date.now() - start;
          for (let i = 0; i < this.urlCollector.length; i++) {
            const entry = this.urlCollector[i];
            const cls = this.ai.classifyURL(entry.url, entry.source);
            if (cls.type === "embed" || cls.type === "download") {
              this.memory.recordChain(url, entry.url, cls.type === "embed" ? "servers" : "download");
            }
          }
          this.memory.forceSave();
          log.info("QuickExtract done: " + serverCatalog.length + " servers, " + duration + "ms");
          return {
            url,
            title: model.title,
            steps: this.steps,
            serverCatalog,
            findings: this._categorizeUrls(),
            durationMs: duration,
            pageType: pageAnalysis.type,
            pageConfidence: pageAnalysis.confidence
          };
        });
      }
    };
    module2.exports = { AutonomousScraper };
  }
});

// src/intelligent/provider-memory.js
var require_provider_memory = __commonJS({
  "src/intelligent/provider-memory.js"(exports2, module2) {
    var { SessionMemory, getSessionMemory } = require_session_memory();
    var ProviderMemory = class {
      constructor() {
        this.session = getSessionMemory();
        this.providers = /* @__PURE__ */ new Map();
      }
      // ─── Engine tracking ────────────────────────────────────────
      /**
       * Record an engine attempt for a provider
       * @param {string} providerName 
       * @param {string} engine - 'static' | 'dynamic' | 'intelligent'
       * @param {string} phase - 'search' | 'video' | 'episode'
       * @param {boolean} success 
       * @param {number} durationMs 
       * @param {number} resultsCount 
       */
      recordEngineAttempt(providerName, engine, phase, success, durationMs, resultsCount) {
        if (!this.providers.has(providerName)) {
          this.providers.set(providerName, this._emptyProvider());
        }
        const p = this.providers.get(providerName);
        p.totalAttempts++;
        if (success) p.successCount++;
        if (durationMs) p.lastDuration = durationMs;
        if (!p.engines[engine]) {
          p.engines[engine] = { successes: 0, failures: 0, totalDuration: 0, avgDuration: 0, phases: {} };
        }
        const e = p.engines[engine];
        if (success) e.successes++;
        else e.failures++;
        e.totalDuration += durationMs || 0;
        e.avgDuration = Math.round(e.totalDuration / (e.successes + e.failures));
        if (!e.phases[phase]) {
          e.phases[phase] = { successes: 0, failures: 0 };
        }
        if (success) e.phases[phase].successes++;
        else e.phases[phase].failures++;
        if (success && resultsCount > 0) {
          this.session.recordAttempt(engine, "provider", phase, success, resultsCount, [], providerName);
        }
        this._autoSave();
      }
      // ─── Strategy recommendation ─────────────────────────────────
      /**
       * Get the recommended engine order for a provider
       * Returns engines sorted by success rate (best first)
       */
      getEngineOrder(providerName) {
        const p = this.providers.get(providerName);
        if (!p || Object.keys(p.engines).length === 0) {
          return ["static", "intelligent", "dynamic"];
        }
        const scored = Object.entries(p.engines).map(([name, stats]) => {
          const total = stats.successes + stats.failures;
          const rate = total > 0 ? stats.successes / total : 0;
          const confidence = Math.min(total / 5, 1);
          return {
            engine: name,
            successRate: rate,
            confidence,
            score: rate * confidence,
            successes: stats.successes,
            failures: stats.failures,
            avgDuration: stats.avgDuration
          };
        });
        scored.sort((a, b) => {
          const scoreA = a.score - (a.engine !== "static" ? 0.05 : 0);
          const scoreB = b.score - (b.engine !== "static" ? 0.05 : 0);
          return scoreB - scoreA;
        });
        return scored.map((s) => s.engine);
      }
      // ─── Provider health ─────────────────────────────────────────
      getProviderStats(providerName) {
        const p = this.providers.get(providerName);
        if (!p) return null;
        const engines = {};
        for (const [name, e] of Object.entries(p.engines)) {
          const total = e.successes + e.failures;
          engines[name] = {
            successRate: total > 0 ? Math.round(e.successes / total * 100) : 0,
            successes: e.successes,
            failures: e.failures,
            avgDuration: e.avgDuration,
            phases: e.phases
          };
        }
        return {
          name: providerName,
          totalAttempts: p.totalAttempts,
          successRate: p.totalAttempts > 0 ? Math.round(p.successCount / p.totalAttempts * 100) : 0,
          lastDuration: p.lastDuration,
          recommendedOrder: this.getEngineOrder(providerName),
          engines
        };
      }
      // ─── Selector tracking ───────────────────────────────────────
      recordSelectorAttempt(providerName, selector, phase, success) {
        if (!this.providers.has(providerName)) {
          this.providers.set(providerName, this._emptyProvider());
        }
        const p = this.providers.get(providerName);
        if (!p.selectors[selector]) {
          p.selectors[selector] = { successes: 0, failures: 0 };
        }
        if (success) p.selectors[selector].successes++;
        else p.selectors[selector].failures++;
      }
      getBestSelectors(providerName) {
        const p = this.providers.get(providerName);
        if (!p) return [];
        return Object.entries(p.selectors).map(([sel, s]) => ({
          selector: sel,
          successRate: s.successes + s.failures > 0 ? s.successes / (s.successes + s.failures) : 0,
          attempts: s.successes + s.failures
        })).sort((a, b) => b.successRate - a.successRate).slice(0, 10);
      }
      // ─── Persistence ─────────────────────────────────────────────
      _autoSave() {
        let total = 0;
        for (const p of this.providers.values()) total += p.totalAttempts;
        if (total % 10 === 0) {
          this.session.forceSave();
          this._saveProviderData();
        }
      }
      _saveProviderData() {
        try {
          const { writeFileSync } = require("fs");
          const { join } = require("path");
          const data = {};
          for (const [name, p] of this.providers) {
            data[name] = {
              totalAttempts: p.totalAttempts,
              successCount: p.successCount,
              lastDuration: p.lastDuration,
              engines: p.engines,
              selectors: p.selectors
            };
          }
          writeFileSync(
            join(process.cwd(), ".provider-memory.json"),
            JSON.stringify(data, null, 2)
          );
        } catch (e) {
        }
      }
      _loadProviderData() {
        try {
          const { existsSync, readFileSync } = require("fs");
          const { join } = require("path");
          const path = join(process.cwd(), ".provider-memory.json");
          if (!existsSync(path)) return;
          const raw = readFileSync(path, "utf-8");
          const data = JSON.parse(raw);
          for (const [name, p] of Object.entries(data)) {
            this.providers.set(name, {
              totalAttempts: p.totalAttempts || 0,
              successCount: p.successCount || 0,
              lastDuration: p.lastDuration || 0,
              engines: p.engines || {},
              selectors: p.selectors || {}
            });
          }
        } catch (e) {
        }
      }
      // ─── Bulk operations ─────────────────────────────────────────
      getAllStats() {
        const stats = [];
        for (const [name] of this.providers) {
          stats.push(this.getProviderStats(name));
        }
        return stats.sort((a, b) => b.successRate - a.successRate);
      }
      getTopProviders(minAttempts = 3) {
        return this.getAllStats().filter((s) => s.totalAttempts >= minAttempts);
      }
      getFailingProviders(minAttempts = 3) {
        return this.getAllStats().filter((s) => s.totalAttempts >= minAttempts && s.successRate < 30);
      }
      _emptyProvider() {
        return {
          engines: {},
          selectors: {},
          lastDuration: 0,
          totalAttempts: 0,
          successCount: 0
        };
      }
    };
    var instance = null;
    function getProviderMemory() {
      if (!instance) {
        instance = new ProviderMemory();
        instance._loadProviderData();
      }
      return instance;
    }
    function resetProviderMemory() {
      if (instance) {
        instance._saveProviderData();
        instance = null;
      }
    }
    module2.exports = { ProviderMemory, getProviderMemory, resetProviderMemory };
  }
});

// src/intelligent/index.js
var require_intelligent = __commonJS({
  "src/intelligent/index.js"(exports2, module2) {
    var { SessionMemory, textSimilarity, getSessionMemory, resetSessionMemory } = require_session_memory();
    var { SmartAnalyzer, getSmartAnalyzer, resetSmartAnalyzer, KNOWN_SERVERS, URL_DOMAIN_KB } = require_smart_analyzer();
    var { SkeletonDetector } = require_skeleton_detector();
    var { StaticScraper } = require_static_scraper();
    var { getLogger, setLogLevel } = require_logger();
    var { createBrowser, createPage, findSystemChrome, findSparticuzChromium } = require_launcher();
    var { setupResourceBlocking, blockResourcesOnly } = require_resource_blocker();
    var { BrowserPool } = require_browser_pool();
    var { DynamicPageHandler } = require_dynamic_handler();
    var { PageTypeClassifier } = require_page_type_classifier();
    var { AutonomousScraper } = require_autonomous_scraper();
    module2.exports = {
      // ─── Analysis modules (no browser needed) ────────────────────
      SessionMemory,
      SmartAnalyzer,
      SkeletonDetector,
      StaticScraper,
      PageTypeClassifier,
      // ─── Browser modules (need puppeteer-core) ──────────────────
      createBrowser,
      createPage,
      findSystemChrome,
      findSparticuzChromium,
      setupResourceBlocking,
      blockResourcesOnly,
      BrowserPool,
      DynamicPageHandler,
      AutonomousScraper,
      // ─── Singletons ─────────────────────────────────────────────
      getSessionMemory,
      resetSessionMemory,
      getSmartAnalyzer,
      resetSmartAnalyzer,
      // ─── Utilities ──────────────────────────────────────────────
      textSimilarity,
      getLogger,
      setLogLevel,
      // ─── Knowledge bases ────────────────────────────────────────
      KNOWN_SERVERS,
      URL_DOMAIN_KB,
      // ─── Provider strategy memory ───────────────────────────────
      getProviderMemory: () => {
        const { getProviderMemory } = require_provider_memory();
        return getProviderMemory();
      },
      resetProviderMemory: () => {
        const { resetProviderMemory } = require_provider_memory();
        return resetProviderMemory();
      }
    };
  }
});

// src/local-scrapers/utils.js
var require_utils = __commonJS({
  "src/local-scrapers/utils.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var MAX_CONCURRENT = 3;
    var FETCH_TIMEOUT = 8e3;
    var _ai = null;
    function _getAI() {
      if (!_ai) {
        try {
          _ai = require_intelligent().getSmartAnalyzer();
        } catch (e) {
          _ai = null;
        }
      }
      return _ai;
    }
    var _memory = null;
    function _getMemory() {
      if (!_memory) {
        try {
          _memory = require_intelligent().getSessionMemory();
        } catch (e) {
          _memory = null;
        }
      }
      return _memory;
    }
    function fetchText(url, timeout) {
      return __async(this, null, function* () {
        try {
          var ctrl = new AbortController();
          var t = setTimeout(function() {
            ctrl.abort();
          }, timeout || FETCH_TIMEOUT);
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
        var ai = _getAI();
        if (ai) {
          try {
            var domain = new URL(url).hostname.replace("www.", "");
            var serverName = ai.inferServerName(domain);
            if (serverName && serverName !== domain) return serverName;
          } catch (e) {
          }
        }
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
    function classifyStreamUrl(url) {
      var ai = _getAI();
      if (!ai) return { type: "unknown", confidence: 20, isContainer: false };
      try {
        return ai.classifyURL(url);
      } catch (e) {
        return { type: "unknown", confidence: 20, isContainer: false };
      }
    }
    function isEmbedUrl(url) {
      var cls = classifyStreamUrl(url);
      return cls.type === "embed" || cls.isContainer;
    }
    function isDirectVideo(url) {
      var cls = classifyStreamUrl(url);
      return cls.type === "direct-video" || cls.type === "stream";
    }
    function isDownloadUrl(url) {
      var cls = classifyStreamUrl(url);
      return cls.type === "download";
    }
    function isSocialUrl(url) {
      var cls = classifyStreamUrl(url);
      return cls.type === "social" || cls.type === "tracking";
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
    function normalizeStream(streamUrl, metadata) {
      if (!streamUrl) return null;
      var serverName = metadata && metadata.serverName || detectServer(streamUrl);
      var quality = metadata && metadata.quality || "HD";
      var sourceName = metadata && metadata.sourceName || "Intelligent";
      var classification = classifyStreamUrl(streamUrl);
      if (classification.type === "social" || classification.type === "tracking" || classification.type === "unknown") {
        return null;
      }
      var needsResolution = classification.type === "embed" && classification.isContainer;
      return {
        url: streamUrl,
        name: sourceName + "\n" + serverName,
        title: sourceName + "\n\u2699\uFE0F " + serverName + "\n" + quality,
        behaviorHints: { notWebReady: needsResolution || !streamUrl.match(/\.(mp4|mp3|webm|ogg|ogv)(\?|$)/i) },
        server: serverName,
        quality,
        source: sourceName,
        classification
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
      UA,
      // New intelligent functions
      classifyStreamUrl,
      isEmbedUrl,
      isDirectVideo,
      isDownloadUrl,
      isSocialUrl,
      normalizeStream,
      _getAI,
      _getMemory
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
