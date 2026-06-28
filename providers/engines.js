/**
 * engines - Built from src/engines/
 * Generated: 2026-06-28T16:42:47.011Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
        const results2 = [];
        for (const [key, chains] of this.urlChains) {
          if (key.startsWith(domain + "|")) {
            results2.push(...chains);
          }
        }
        return results2.sort(function(a, b) {
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
        const results2 = [];
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
          results2.push({ action, score: Math.min(100, Math.max(0, score)), signals });
        }
        results2.sort(function(a, b) {
          return b.score - a.score;
        });
        const best = results2[0];
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
          const $ = cheerio.load(html);
          const elements = this._buildStaticModel($);
          log.info({ elements: elements.length }, "Static DOM model built");
          const allUrls = this._extractUrlsFromStatic($, html);
          log.info({ urls: allUrls.length }, "URLs extracted from static HTML");
          const goal = this._detectGoal(elements);
          log.info({ goal }, "Content goal detected");
          const findings = this._classifyUrls(allUrls);
          const serverCatalog = this._buildCatalog(allUrls);
          const duration = Date.now() - start;
          log.info({ servers: serverCatalog.length, urls: allUrls.length, duration }, "Static analysis complete");
          return {
            url,
            title: $("title").text().trim(),
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
      _buildStaticModel($) {
        const elements = [];
        const self = this;
        $("a, button, input, select, iframe, img, video, audio, li, h1, h2, h3, div, form, span").each(function(i, el) {
          var _a;
          if (i > 300) return false;
          const $el = $(el);
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
      _extractUrlsFromStatic($, html) {
        const seen = /* @__PURE__ */ new Set();
        const add = function(u) {
          if (!u || u.startsWith("#") || u.startsWith("javascript:") || u === "about:blank") return;
          seen.add(u);
        };
        $("iframe").each(function(_, el) {
          add($(el).attr("src") || $(el).attr("data-src") || "");
        });
        $("a[href]").each(function(_, el) {
          const href = $(el).attr("href") || "";
          if (href.startsWith("http") || href.startsWith("/")) add(href);
        });
        $("video, audio, embed, object, source").each(function(_, el) {
          add($(el).attr("src") || $(el).attr("data") || "");
        });
        $("[data-url], [data-src], [data-video], [data-embed], [data-href], [data-link]").each(function(_, el) {
          const dUrl = $(el).attr("data-url") || $(el).attr("data-src") || $(el).attr("data-video") || $(el).attr("data-embed") || $(el).attr("data-href") || $(el).attr("data-link") || "";
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

// src/web-providers/embed-resolver.js
var require_embed_resolver = __commonJS({
  "src/web-providers/embed-resolver.js"(exports2, module2) {
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var EMBED_TIMEOUT = 1e4;
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
    var embedCache = /* @__PURE__ */ new Map();
    function fetchWithTimeout(url, opts) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(function() {
          ctrl.abort();
        }, opts && opts.timeout || EMBED_TIMEOUT);
        try {
          const res = yield fetch(url, {
            headers: Object.assign({ "User-Agent": UA }, opts && opts.headers || {}),
            signal: ctrl.signal,
            redirect: "follow"
          });
          return res;
        } finally {
          clearTimeout(t);
        }
      });
    }
    function htmlText(url, opts) {
      return __async(this, null, function* () {
        try {
          const res = yield fetchWithTimeout(url, {
            headers: Object.assign({ "Accept": "text/html,application/xhtml+xml,*/*" }, opts && opts.headers || {}),
            timeout: opts && opts.timeout || EMBED_TIMEOUT
          });
          if (!res.ok) return null;
          return yield res.text();
        } catch (e) {
          return null;
        }
      });
    }
    function classifyHostname(hostname) {
      const ai = _getAI();
      if (!ai) return null;
      try {
        return ai.classifyURL("https://" + hostname + "/");
      } catch (e) {
        return null;
      }
    }
    function inferServerName(domain) {
      const ai = _getAI();
      if (!ai) return domain;
      try {
        return ai.inferServerName(domain);
      } catch (e) {
        return domain;
      }
    }
    function resolveFilemoon(html, url) {
      return __async(this, null, function* () {
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        const jsMatch = html.match(/"file"\s*:\s*"([^"]+\.(?:m3u8|mp4)[^"]*)"/i);
        if (jsMatch) return jsMatch[1];
        return null;
      });
    }
    function resolveDoodstream(html, url) {
      return __async(this, null, function* () {
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const passMatch = html.match(/\$.get\('([^']+pass_md5[^']*\.d00dmedia[^']*)'/i);
        if (passMatch) {
          const tokenHtml = yield htmlText(passMatch[1].startsWith("http") ? passMatch[1] : new URL(passMatch[1], url).href, {
            headers: { "Referer": url }
          });
          if (tokenHtml) {
            const m = tokenHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (m) return m[0];
            const parts = tokenHtml.split(" ");
            for (const p of parts) {
              if (p.match(/\.(?:m3u8|mp4)/i) && p.includes("http")) return p.replace(/^[^h]*/, "").trim();
            }
          }
        }
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        return null;
      });
    }
    function resolveVoeSx(html, url) {
      return __async(this, null, function* () {
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const evalMatch = html.match(/<script>\s*tm\s*=\s*('(?:\\.|[^'\\])*')/);
        if (evalMatch) {
          try {
            const s = evalMatch[1].slice(1, -1);
            const m = s.match(/https?:\/\/[^"'\\]+\.(?:m3u8|mp4)[^"'\\]*/);
            if (m) return m[0];
          } catch (e) {
          }
        }
        return null;
      });
    }
    function resolveVidHide(html, url) {
      return __async(this, null, function* () {
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        return null;
      });
    }
    function resolveOkRu(html, url) {
      return __async(this, null, function* () {
        const jsMatch = html.match(/data-options="([^"]+)"/);
        if (jsMatch) {
          try {
            const opts = JSON.parse(jsMatch[1].replace(/&quot;/g, '"'));
            const vLink = opts.flashvars && opts.flashvars.metadataUrl || "";
            if (vLink) {
              const vHtml = yield htmlText(vLink, { headers: { "Referer": "https://ok.ru/" } });
              if (vHtml) {
                const js = vHtml.match(/<script>\s*tm\s*=\s*('(?:\\.|[^'\\])*')/);
                if (js) {
                  try {
                    const s = js[1].slice(1, -1);
                    const m = s.match(/https?:\/\/[^"'\\]+\.(?:m3u8|mp4)[^"'\\]*/);
                    if (m) return m[0];
                  } catch (e) {
                  }
                }
                const m3 = vHtml.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
                if (m3) return m3[0];
              }
            }
          } catch (e) {
          }
        }
        return null;
      });
    }
    function resolveMp4Upload(html, url) {
      return __async(this, null, function* () {
        const direct = html.match(/https?:\/\/a\d+\.mp4upload\.com:\d+\/d\/[a-zA-Z0-9\/]+\/video\.mp4/i);
        if (direct) return direct[0];
        const legacy = html.match(/https?:\/\/a\d+\.mp4upload\.com:\d+\/d\/[a-zA-Z0-9]+/i);
        if (legacy) return legacy[0];
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8 && !m3u8[0].includes("videojs") && !m3u8[0].includes("css") && !m3u8[0].includes(".js")) return m3u8[0];
        return null;
      });
    }
    function resolveStreamtapeV2(html, url) {
      return __async(this, null, function* () {
        var ideoDiv = html.match(/id="ideoolink"[^>]*>([^<]+)<\/div>/);
        if (ideoDiv && ideoDiv[1]) {
          var path = ideoDiv[1].trim();
          if (path.startsWith("/")) path = path.substring(1);
          var fullUrl = "https://" + path + "&stream=1";
          var vHtml = yield htmlText(fullUrl, {
            headers: { "Referer": url },
            timeout: EMBED_TIMEOUT
          });
          if (vHtml) {
            var m = vHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (m) return m[0];
            var link = vHtml.match(/"link"\s*:\s*"([^"]+)"/);
            if (link) return link[1].replace(/\\\//g, "/");
          }
          fullUrl = fullUrl.replace("&stream=1", "");
          var vHtml2 = yield htmlText(fullUrl, {
            headers: { "Referer": url },
            timeout: EMBED_TIMEOUT
          });
          if (vHtml2) {
            var m2 = vHtml2.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (m2) return m2[0];
          }
        }
        var botDiv = html.match(/id="botlink"[^>]*>([^<]+)<\/div>/);
        if (botDiv && botDiv[1]) {
          var botPath = botDiv[1].trim();
          if (botPath.startsWith("/")) botPath = botPath.substring(1);
          var botVHtml = yield htmlText("https://" + botPath, { headers: { "Referer": url }, timeout: EMBED_TIMEOUT });
          if (botVHtml) {
            var botVid = botVHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (botVid) return botVid[0];
          }
        }
        return null;
      });
    }
    function resolveStreamwishV2(html, url) {
      return __async(this, null, function* () {
        const dataMatch = html.match(/const\s+_0x[a-f]*\s*=\s*(\{[^}]+\})/);
        if (dataMatch) {
          try {
            const obj = JSON.parse(dataMatch[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":'));
            const keys = Object.values(obj);
            for (const key of keys) {
              if (typeof key === "string" && key.length > 20 && /^[A-Za-z0-9+/=]+$/.test(key) && !key.startsWith("http")) {
                try {
                  const d = Buffer.from(key, "base64").toString();
                  if (d.includes("m3u8") || d.includes("mp4")) return d;
                } catch (e) {
                }
              }
            }
          } catch (e) {
          }
        }
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        return null;
      });
    }
    function resolveMixdropV2(html, url) {
      return __async(this, null, function* () {
        const refMatch = html.match(/MDCore\.ref\s*=\s*["']([^"']+)["']/);
        if (refMatch) {
          const ref = refMatch[1];
          const directUrl = "https://mxcontent.com/e/" + ref;
          const vHtml = yield htmlText(directUrl, { headers: { "Referer": url } });
          if (vHtml) {
            const m = vHtml.match(/https?:\/\/[^"'\s<>]+\.(?:m3u8|mp4)[^"'\s<>]*/i);
            if (m) return m[0];
          }
        }
        const wurlMatch = html.match(/"poster"\s*:\s*"[^"]+","wurl"\s*:\s*"([^"]+)"/);
        if (wurlMatch) return wurlMatch[1].replace(/\\\//g, "/");
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        return null;
      });
    }
    function resolveUpstream(html, url) {
      return __async(this, null, function* () {
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        return null;
      });
    }
    function resolveNetuTv(html, url) {
      return __async(this, null, function* () {
        const evalMatch = html.match(/eval\s*\(([^)]+)\)/);
        if (evalMatch) {
          try {
            const decoded = Buffer.from(evalMatch[1].replace(/['"]/g, ""), "base64").toString();
            const m = decoded.match(/https?:\/\/[^"'\\]+\.(?:m3u8|mp4)[^"'\\]*/);
            if (m) return m[0];
          } catch (e) {
          }
        }
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        return null;
      });
    }
    function resolveVidmoly(html, url) {
      return __async(this, null, function* () {
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4) return mp4[0];
        return null;
      });
    }
    function resolveYourUpload(html, url) {
      return __async(this, null, function* () {
        const direct = html.match(/https?:\/\/[^"'\s<>]+\.yourupload\.com\/[^"'\s<>]+\.(?:mp4|m3u8)[^"'\s<>]*/i);
        if (direct) return direct[0];
        const fileMatch = html.match(/(?:file|src|source)\s*[:=]\s*["']([^"']+\.(?:mp4|m3u8|mkv|webm)[^"']*)["']/i);
        if (fileMatch && fileMatch[1].startsWith("http")) return fileMatch[1];
        const mp4 = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i);
        if (mp4 && !mp4[0].includes("novideo")) return mp4[0];
        const m3u8 = html.match(/https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i);
        if (m3u8) return m3u8[0];
        return null;
      });
    }
    function tryResolveJWPlayer(html, referer) {
      return __async(this, null, function* () {
        const scripts = [];
        const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
        let m;
        while ((m = re.exec(html)) !== null) {
          const text = m[1];
          if (text.length > 10) scripts.push(text);
        }
        for (const script of scripts) {
          if (!script.includes("jwplayer") && !script.includes("sources") && !script.includes("playlist")) continue;
          const fileMatch = script.match(/["']file["']\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
          if (fileMatch) return fileMatch[1];
          const setupMatch = script.match(/jwplayer\s*\(\s*["'][^"']*["']\s*\)\s*\.\s*setup\s*\(\s*(\{[\s\S]*?\})\s*\)\s*;/);
          if (setupMatch) {
            try {
              const config = JSON.parse(
                setupMatch[1].replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3').replace(/'/g, '"')
              );
              if (config.sources && Array.isArray(config.sources)) {
                const sorted = config.sources.filter(function(s) {
                  return s.file;
                }).sort(function(a, b) {
                  const aLabel = (a.label || "").match(/(\d+)/);
                  const bLabel = (b.label || "").match(/(\d+)/);
                  return (parseInt(bLabel && bLabel[1]) || 0) - (parseInt(aLabel && aLabel[1]) || 0);
                });
                if (sorted.length > 0) return sorted[0].file;
              }
              if (config.playlist && Array.isArray(config.playlist)) {
                for (const item of config.playlist) {
                  if (item.sources && Array.isArray(item.sources) && item.sources.length > 0) return item.sources[0].file;
                  if (item.file) return item.file;
                }
              }
              if (config.file) return config.file;
            } catch (e) {
            }
          }
          const playlistMatch = script.match(/playlist\s*:\s*(\[[\s\S]*?\])\s*\}/);
          if (playlistMatch) {
            try {
              const playlist = JSON.parse(playlistMatch[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
              if (Array.isArray(playlist)) {
                for (const item of playlist) {
                  if (item.sources && Array.isArray(item.sources) && item.sources.length > 0) return item.sources[0].file;
                  if (item.file) return item.file;
                }
              }
            } catch (e) {
            }
          }
        }
        return null;
      });
    }
    function tryResolveGeneric(embedUrl, referer) {
      return __async(this, null, function* () {
        const html = yield htmlText(embedUrl, {
          headers: { "Referer": referer || embedUrl }
        });
        if (!html) return null;
        const jwUrl = yield tryResolveJWPlayer(html, referer);
        if (jwUrl) return jwUrl.startsWith("//") ? "https:" + jwUrl : jwUrl;
        const patterns = [
          /https?:\/\/[^"'\s<>]+\.m3u8[^"'\s<>]*/i,
          /https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/i
        ];
        for (const p of patterns) {
          const match = html.match(p);
          if (match) return match[0];
        }
        const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        if (iframeMatch) {
          const iframeUrl = iframeMatch[1].startsWith("//") ? "https:" + iframeMatch[1] : iframeMatch[1];
          if (iframeUrl !== embedUrl && iframeUrl !== referer) {
            return yield resolveEmbed(iframeUrl, embedUrl);
          }
        }
        return null;
      });
    }
    function getHostname(url) {
      try {
        return new URL(url).hostname.toLowerCase();
      } catch (e) {
        return "";
      }
    }
    function resolveEmbed(embedUrl, referer) {
      return __async(this, null, function* () {
        if (!embedUrl) return null;
        if (embedCache.has(embedUrl)) return embedCache.get(embedUrl) || null;
        const host = getHostname(embedUrl);
        let html = null;
        let result = null;
        const hostRules = [
          { pat: /streamwish|wish\.com|swdyu|sfastwish|wishembed|wishy|watchwish/i, fn: resolveStreamwishV2, needHtml: true },
          { pat: /filemoon|filemoon\.sx|kerapoxy|moplay|moon\.sx|moonplayer/i, fn: resolveFilemoon, needHtml: true },
          { pat: /filelions|filelions\.top/i, fn: tryResolveJWPlayer, needHtml: true },
          { pat: /uqload|uqload\.com/i, fn: tryResolveJWPlayer, needHtml: true },
          { pat: /dood\.|doodstream|dood\.la|dood\.to|dood\.ws|dood\.wf|dood\.re|dood\.so|dood\.sh|dood\.pm|dood\.yt|dooood|ds2play/i, fn: resolveDoodstream, needHtml: true },
          { pat: /mixdrop|mixdrop\.co|mixdrop\.ag|mixdrop\.vc|mixdrop\.to|mixdrop\.ch|mixdrop\.gl|mixdrp|mxdrop/i, fn: resolveMixdropV2, needHtml: true },
          { pat: /voe\.sx|voe\.su|vidvodo|voe\.to|voeunblock/i, fn: resolveVoeSx, needHtml: true },
          { pat: /vidhide|vidpro|vidmoly\.to|vidguard|vid2v11/i, fn: resolveVidHide, needHtml: true },
          { pat: /ok\.ru|odnoklassniki/i, fn: resolveOkRu, needHtml: true },
          { pat: /streamtape|strtape|stape\.with|streamta\.to|stpete|tapecontent|streamtape\.com/i, fn: resolveStreamtapeV2, needHtml: true },
          { pat: /mp4upload|mp4upload\.com/i, fn: resolveMp4Upload, needHtml: true },
          { pat: /upstream\.to|uptostream|uptobox|upstreamcdn/i, fn: resolveUpstream, needHtml: true },
          { pat: /netu\.tv|netutv|anavids|waaw\.tv|hqq\.tv|waaw1|netuplayer/i, fn: resolveNetuTv, needHtml: true },
          { pat: /vidmoly|vidmoly\.to|vidmoly\.net|moly\.to/i, fn: resolveVidmoly, needHtml: true },
          { pat: /yourupload|youpload/i, fn: resolveYourUpload, needHtml: true },
          { pat: /hgcloud|hgcloud\.to/i, fn: null, needHtml: false },
          { pat: /krakenfiles|krakenfiles\.com/i, fn: null, needHtml: false },
          { pat: /vidoza|vidoza\.net|vidozahd/i, fn: null, needHtml: false },
          { pat: /vidlox|vidlox\.tv|vidlox\.net/i, fn: null, needHtml: false },
          { pat: /wolfstream|wolfmax|stream\.wolfmax/i, fn: null, needHtml: false },
          { pat: /streamlare|streamlare\.com/i, fn: null, needHtml: false },
          { pat: /jawcloud|jaw\.cloud/i, fn: null, needHtml: false },
          { pat: /vudeo|vudeo\.net/i, fn: null, needHtml: false },
          { pat: /cloudvideo|cloudvideo\.tv|vidcloud/i, fn: null, needHtml: false }
        ];
        for (const rule of hostRules) {
          if (rule.pat.test(host)) {
            if (rule.needHtml) {
              html = html || (yield htmlText(embedUrl, { headers: { "Referer": referer || embedUrl } }));
              if (!html) {
                embedCache.set(embedUrl, null);
                return null;
              }
            }
            if (rule.fn) {
              result = yield rule.fn(html || "", embedUrl);
              if (result) {
                result = result.startsWith("//") ? "https:" + result : result;
                embedCache.set(embedUrl, result);
                return result;
              }
            }
            break;
          }
        }
        html = html || (yield htmlText(embedUrl, { headers: { "Referer": referer || embedUrl } }));
        if (html) {
          result = yield tryResolveGeneric(embedUrl, referer);
          if (!result) {
            const jw = yield tryResolveJWPlayer(html, referer);
            result = jw ? jw.startsWith("//") ? "https:" + jw : jw : null;
          }
        }
        if (result) result = result.startsWith("//") ? "https:" + result : result;
        const mem = _getMemory();
        if (mem && host) {
          try {
            mem.recordAttempt(
              "host:" + host,
              "embed",
              "resolve",
              !!result,
              result ? 1 : 0,
              result ? ["embed", result] : [],
              host
            );
          } catch (e) {
          }
        }
        embedCache.set(embedUrl, result || null);
        return result;
      });
    }
    function isDirectVideoUrl(url) {
      if (!url) return false;
      if (/\.(m3u8|mp4|mkv|webm|avi|ts|mov)(\?|$)/i.test(url)) return true;
      if (/mp4upload\.com:\d+\/d\//i.test(url)) return true;
      if (/\/hls\//i.test(url)) return true;
      if (/streamtape\.com\/get_video/i.test(url)) return true;
      return false;
    }
    function clearCache() {
      embedCache.clear();
    }
    module2.exports = {
      resolveEmbed,
      tryResolveJWPlayer,
      tryResolveGeneric,
      clearCache,
      isDirectVideoUrl,
      classifyHostname,
      inferServerName
    };
  }
});

// src/web-providers/torrent-parser.js
var require_torrent_parser = __commonJS({
  "src/web-providers/torrent-parser.js"(exports2, module2) {
    var crypto = require("crypto");
    function parseTorrentInfoHash(buf) {
      try {
        const str = buf.toString("latin1");
        const infoStart = str.indexOf("4:info");
        if (infoStart < 0) return null;
        let i = infoStart + 5;
        const start = i;
        while (i < buf.length) {
          const c = String.fromCharCode(buf[i]);
          if (c === "d") i++;
          else if (c === "l") i++;
          else if (c === "e") break;
          else if (c === "i") {
            i = buf.indexOf("e".charCodeAt(0), i);
            if (i < 0) return null;
            i++;
          } else if (c >= "0" && c <= "9") {
            const colon = buf.indexOf(":".charCodeAt(0), i);
            if (colon < 0) return null;
            const len = parseInt(buf.toString("ascii", i, colon), 10);
            i = colon + 1 + len;
          } else {
            i++;
          }
        }
        const infoRaw = buf.slice(start, i);
        return crypto.createHash("sha1").update(infoRaw).digest("hex").toLowerCase();
      } catch (e) {
        return null;
      }
    }
    module2.exports = { parseTorrentInfoHash };
  }
});

// src/web-providers/shortener-resolver.js
var require_shortener_resolver = __commonJS({
  "src/web-providers/shortener-resolver.js"(exports2, module2) {
    var { parseTorrentInfoHash } = require_torrent_parser();
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.0";
    var MAX_REDIRECTS = 5;
    function buildTorrentResult(url, label, quality, buf) {
      const infoHash = buf ? parseTorrentInfoHash(buf) : null;
      const result = __spreadValues(__spreadValues(__spreadValues({
        url,
        server: "torrent",
        quality: quality || "HD"
      }, infoHash ? { infoHash } : {}), infoHash ? { sources: ["dht:" + infoHash] } : {}), label ? { filename: label } : {});
      return result;
    }
    function parseMagnet(magnetUrl, label, quality) {
      const infoHashMatch = magnetUrl.match(/urn:btih:([a-fA-F0-9]{40})/i);
      const sources = [];
      const trRe = /tr=([^&]+)/g;
      let m;
      while ((m = trRe.exec(magnetUrl)) !== null) {
        const trackerUrl = decodeURIComponent(m[1]);
        if (/^(udp|http|https|ws):\/\//.test(trackerUrl)) {
          sources.push(trackerUrl);
        }
      }
      if (infoHashMatch) sources.push("dht:" + infoHashMatch[1].toLowerCase());
      return __spreadValues(__spreadValues(__spreadValues({
        url: magnetUrl,
        server: "torrent",
        quality: quality || "HD"
      }, infoHashMatch ? { infoHash: infoHashMatch[1].toLowerCase() } : {}), sources.length ? { sources } : {}), label ? { filename: label } : {});
    }
    function fetchBuffer(url, headers, timeout = 15e3) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeout);
        try {
          const res = yield fetch(url, { headers, signal: ctrl.signal });
          clearTimeout(t);
          if (!res.ok) return null;
          return Buffer.from(yield res.arrayBuffer());
        } catch (e) {
          clearTimeout(t);
          return null;
        }
      });
    }
    function fetchText(url, headers, timeout = 15e3) {
      return __async(this, null, function* () {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeout);
        try {
          const res = yield fetch(url, { headers, signal: ctrl.signal });
          clearTimeout(t);
          if (!res.ok) return null;
          return yield res.text();
        } catch (e) {
          clearTimeout(t);
          return null;
        }
      });
    }
    function extractFinalLink(html, baseUrl) {
      const directRe = /(https?:\/\/[^"'\s<>]+\.torrent|magnet:\?xt=[^"'\s<>]+)/gi;
      const matches = html.match(directRe);
      if (matches && matches.length) {
        const unique = [...new Set(matches.map((u) => u.replace(/[)"'<>]+$/, "")))];
        if (unique[0].startsWith("http")) {
          try {
            return new URL(unique[0], baseUrl).href;
          } catch (e) {
            return unique[0];
          }
        }
        return unique[0];
      }
      const metaMatch = html.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*content=["']?\d+\s*;\s*url=([^"'\s>]+)/i);
      if (metaMatch) {
        try {
          return new URL(metaMatch[1], baseUrl).href;
        } catch (e) {
          return metaMatch[1];
        }
      }
      return null;
    }
    function resolveFormShortener(shortUrl, referer) {
      return __async(this, null, function* () {
        const headers = { "User-Agent": UA, "Referer": referer };
        const html = yield fetchText(shortUrl, headers, 15e3);
        if (!html) return null;
        const formMatch = html.match(/<form[^>]*action=["']([^"']+)["'][^>]*>([\s\S]*?)<\/form>/i);
        if (!formMatch) return null;
        const action = formMatch[1];
        const formBody = formMatch[2];
        const inputs = [];
        const inputRe = /<input[^>]*name=["']([^"']+)["'][^>]*value=["']([^"']*)["'][^>]*>/gi;
        let im;
        while ((im = inputRe.exec(formBody)) !== null) {
          inputs.push({ name: im[1], value: im[2] });
        }
        const linkser = inputs.find((i) => i.name === "linkser");
        if (!linkser) return null;
        const postUrl = action.startsWith("http") ? action : new URL(action, shortUrl).href;
        const body = inputs.map((i) => `${encodeURIComponent(i.name)}=${encodeURIComponent(i.value)}`).join("&");
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15e3);
        try {
          const res = yield fetch(postUrl, {
            method: "POST",
            headers: {
              "User-Agent": UA,
              "Referer": shortUrl,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body,
            redirect: "manual",
            signal: ctrl.signal
          });
          clearTimeout(t);
          const text = yield res.text();
          const final = extractFinalLink(text, postUrl) || res.headers.get("location");
          if (final) {
            if (final.startsWith("http") && final.endsWith(".torrent")) {
              const buf = yield fetchBuffer(final, { "User-Agent": UA, "Referer": postUrl }, 15e3);
              return buildTorrentResult(final, null, null, buf);
            }
            if (final.startsWith("magnet:")) return parseMagnet(final, null, null);
          }
        } catch (e) {
          clearTimeout(t);
        }
        return null;
      });
    }
    function followRedirect(url, referer, depth = 0) {
      return __async(this, null, function* () {
        if (depth >= MAX_REDIRECTS) return null;
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 15e3);
        try {
          const res = yield fetch(url, {
            headers: { "User-Agent": UA, "Referer": referer },
            redirect: "manual",
            signal: ctrl.signal
          });
          clearTimeout(t);
          const location = res.headers.get("location");
          if (location) {
            const next = location.startsWith("http") ? location : new URL(location, url).href;
            if (next.endsWith(".torrent")) {
              const buf = yield fetchBuffer(next, { "User-Agent": UA, "Referer": url }, 15e3);
              return buildTorrentResult(next, null, null, buf);
            }
            if (next.startsWith("magnet:")) return parseMagnet(next, null, null);
            return followRedirect(next, url, depth + 1);
          }
          const text = yield res.text();
          const final = extractFinalLink(text, url);
          if (final) {
            if (final.startsWith("http") && final.endsWith(".torrent")) {
              const buf = yield fetchBuffer(final, { "User-Agent": UA, "Referer": url }, 15e3);
              return buildTorrentResult(final, null, null, buf);
            }
            if (final.startsWith("magnet:")) return parseMagnet(final, null, null);
          }
        } catch (e) {
          clearTimeout(t);
        }
        return null;
      });
    }
    function resolveDownloadTTLink(href, label, quality, referer) {
      return __async(this, null, function* () {
        const uMatch = href.match(/[?&]u=([^&]+)/);
        if (!uMatch) return null;
        try {
          const raw = decodeURIComponent(uMatch[1]).trim();
          let decoded = raw;
          if (/^[A-Za-z0-9+/=]{20,}$/.test(raw)) {
            try {
              const base64Decoded = Buffer.from(raw, "base64").toString("utf-8").trim();
              if (base64Decoded.startsWith("http")) decoded = base64Decoded;
            } catch (e) {
            }
          }
          if (!decoded.startsWith("http") || !decoded.endsWith(".torrent")) return null;
          const buf = yield fetchBuffer(decoded, { "User-Agent": UA, "Referer": referer }, 15e3);
          if (!buf) return null;
          const result = buildTorrentResult(decoded, label, quality, buf);
          result.url = href;
          return result;
        } catch (e) {
          return null;
        }
      });
    }
    function resolveTorrentLink(href, label, quality, referer) {
      return __async(this, null, function* () {
        if (!href) return null;
        if (href.startsWith("magnet:")) {
          return parseMagnet(href, label, quality);
        }
        const downloadTTResult = yield resolveDownloadTTLink(href, label, quality, referer);
        if (downloadTTResult) return downloadTTResult;
        if (href.endsWith(".torrent")) {
          const buf = yield fetchBuffer(href, { "User-Agent": UA, "Referer": referer }, 15e3);
          return buildTorrentResult(href, label, quality, buf);
        }
        if (/\/s\.php\?i=/.test(href) || /\/s\.php\?u=/.test(href)) {
          const formResult = yield resolveFormShortener(href, referer);
          if (formResult) {
            if (label) formResult.filename = label;
            if (quality) formResult.quality = quality;
            return formResult;
          }
          return followRedirect(href, referer);
        }
        return null;
      });
    }
    module2.exports = { resolveTorrentLink };
  }
});

// src/scrapeless-proxy/index.js
var require_scrapeless_proxy = __commonJS({
  "src/scrapeless-proxy/index.js"(exports2, module2) {
    var API_BASE = "https://api.scrapeless.com/api/v2/unlocker/request";
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var apiKey = process.env.SCRAPELESS_API_KEY || "";
    var enabled = !!apiKey;
    function configure(key) {
      if (key) {
        apiKey = key;
        enabled = true;
      }
    }
    function isEnabled() {
      return enabled;
    }
    function scrape(_0) {
      return __async(this, arguments, function* (url, options = {}) {
        if (!enabled) return null;
        const input = {
          url,
          method: options.method || "GET",
          redirect: options.redirect !== false,
          headers: options.headers || {}
        };
        if (!input.headers["User-Agent"]) input.headers["User-Agent"] = UA;
        if (!input.headers["Accept"]) input.headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
        if (!input.headers["Accept-Language"]) input.headers["Accept-Language"] = "es-ES,es;q=0.9,en;q=0.8";
        const body = JSON.stringify({
          actor: "unlocker.webunlocker",
          input,
          proxy: {
            country: options.proxyCountry || "ANY"
          }
        });
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), options.timeout || 3e4);
          const res = yield fetch(API_BASE, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-token": apiKey
            },
            body,
            signal: ctrl.signal
          });
          clearTimeout(t);
          if (!res.ok) {
            console.warn(`[scrapeless] HTTP ${res.status} for ${url}`);
            return null;
          }
          const data = yield res.json();
          if (data.body) return data.body;
          if (data.content) return data.content;
          if (data.html) return data.html;
          if (data.text) return data.text;
          if (typeof data === "string") return data;
          if (data.statusCode && data.body) return data.body;
          console.warn(`[scrapeless] unexpected response format for ${url}`);
          return null;
        } catch (e) {
          console.warn(`[scrapeless] error for ${url}: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = { scrape, configure, isEnabled };
  }
});

// src/web-providers/engine.js
var require_engine = __commonJS({
  "src/web-providers/engine.js"(exports2, module2) {
    var cheerio = require("cheerio-without-node-native") || require("cheerio");
    var crypto = require("crypto");
    var { resolveEmbed } = require_embed_resolver();
    var { resolveTorrentLink } = require_shortener_resolver();
    var { parseTorrentInfoHash } = require_torrent_parser();
    var scrapeless = require_scrapeless_proxy();
    var anubisCookieCache = /* @__PURE__ */ new Map();
    function parseSetCookie(sc) {
      if (!sc) return "";
      const semi = sc.indexOf(";");
      return semi > 0 ? sc.substring(0, semi).trim() : sc.trim();
    }
    function solveAnubisPoW(randomData, difficulty) {
      return __async(this, null, function* () {
        const zeroBytes = Math.floor(difficulty / 2);
        const nibbleCheck = difficulty % 2 !== 0;
        let nonce = 0;
        while (true) {
          const hash = crypto.createHash("sha256").update(randomData + nonce).digest();
          const bytes = new Uint8Array(hash.buffer, hash.byteOffset, hash.byteLength);
          let valid = true;
          for (let i = 0; i < zeroBytes; i++) {
            if (bytes[i] !== 0) {
              valid = false;
              break;
            }
          }
          if (valid && nibbleCheck && (bytes[zeroBytes] & 240) !== 0) valid = false;
          if (valid) {
            const hex = Array.from(new Uint8Array(hash.buffer, hash.byteOffset, hash.byteLength)).map((b) => b.toString(16).padStart(2, "0")).join("");
            return { nonce, hash: hex };
          }
          nonce++;
        }
      });
    }
    function bypassAnubisChallenge(html, url, verificationCookie) {
      return __async(this, null, function* () {
        var _a;
        const chMatch = html.match(/<script id="anubis_challenge"[^>]*>([\s\S]*?)<\/script>/);
        const baseMatch = html.match(/<script id="anubis_base_prefix"[^>]*>([\s\S]*?)<\/script>/);
        if (!chMatch) return null;
        const parsed = JSON.parse(chMatch[1].trim());
        const challenge = parsed.challenge;
        const difficulty = challenge.difficulty || ((_a = parsed.rules) == null ? void 0 : _a.difficulty) || 5;
        const basePrefix = baseMatch ? JSON.parse(baseMatch[1].trim()) : "";
        const baseUrl = new URL(url).origin;
        const startTime = Date.now();
        const solution = yield solveAnubisPoW(challenge.randomData, difficulty);
        const params = new URLSearchParams({
          id: challenge.id,
          response: solution.hash,
          nonce: String(solution.nonce),
          redir: "/",
          elapsedTime: String(Date.now() - startTime)
        });
        const passUrl = `${baseUrl}${basePrefix}/.within.website/x/cmd/anubis/api/pass-challenge?${params}`;
        const passHeaders = { "User-Agent": UA };
        if (verificationCookie) passHeaders["Cookie"] = parseSetCookie(verificationCookie);
        const passRes = yield fetch(passUrl, { headers: passHeaders, redirect: "manual" });
        const cookies = passRes.headers.getSetCookie ? passRes.headers.getSetCookie() : [passRes.headers.get("set-cookie")].filter(Boolean);
        const authCookie = cookies.find((c) => !c.includes("Max-Age=0"));
        if (authCookie) return parseSetCookie(authCookie);
        return null;
      });
    }
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var TMDB_KEY = process.env.TMDB_KEY || "d80ba92bc7cefe3359668d30d06f3305";
    function fetchHTML(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), opts.timeout || 2e4);
          const domain = typeof url === "string" ? new URL(url).hostname : "";
          const cached = anubisCookieCache.get(domain);
          const headers = __spreadValues({ "User-Agent": UA, "Accept": "text/html,application/xhtml+xml,*/*" }, opts.headers);
          if (cached) headers["Cookie"] = cached;
          const res = yield fetch(url, { headers, signal: ctrl.signal });
          clearTimeout(t);
          if (!res.ok) {
            if (scrapeless.isEnabled()) {
              const scraped = yield scrapeless.scrape(url, { timeout: opts.timeout || 3e4 });
              if (scraped) return scraped;
            }
            if ([403, 503, 429, 502].includes(res.status)) {
              try {
                console.log(`[engine] HTTP ${res.status} on ${domain}, trying Puppeteer bypass...`);
                const { fetchWithPuppeteer } = require(require("path").join(__dirname, "..", "src", "puppeteer-fallback"));
                const rendered = yield fetchWithPuppeteer(url, { waitMs: 4e3, timeout: 2e4 });
                if (rendered && rendered.length > 500) return rendered;
              } catch (e) {
                console.warn(`[engine] Puppeteer fallback HTTP ${res.status} failed: ${e.message}`);
              }
            }
            return null;
          }
          let html = yield res.text();
          const isReallyBlocked = html.length < 1e3 || html.includes("Just a moment") && html.length < 5e3 || html.includes("Verifying you are human") && html.length < 5e3;
          const hasCF = html.includes("challenge-platform") || html.includes("turnstile") || html.includes("cf-browser-verify");
          if (hasCF && isReallyBlocked) {
            if (scrapeless.isEnabled()) {
              console.log(`[engine] Cloudflare block on ${domain}, trying Scrapeless...`);
              const scraped = yield scrapeless.scrape(url, { timeout: opts.timeout || 3e4 });
              if (scraped) return scraped;
            }
            try {
              console.log(`[engine] Cloudflare block on ${domain}, trying Puppeteer bypass...`);
              const { fetchWithPuppeteer } = require(require("path").join(__dirname, "..", "src", "puppeteer-fallback"));
              const rendered = yield fetchWithPuppeteer(url, { waitMs: 4e3, timeout: 2e4 });
              if (rendered && rendered.length > 500) return rendered;
            } catch (e) {
              console.warn(`[engine] Puppeteer fallback failed for ${domain}: ${e.message}`);
            }
          }
          if (html.includes("anubis_challenge")) {
            const initialCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
            const verificationCookie = initialCookies.find((c) => c.includes("cookie-verification")) || "";
            const authCookie = yield bypassAnubisChallenge(html, url, verificationCookie);
            if (authCookie) {
              anubisCookieCache.set(domain, authCookie);
              const ctrl2 = new AbortController();
              const t2 = setTimeout(() => ctrl2.abort(), opts.timeout || 2e4);
              const res2 = yield fetch(url, {
                headers: __spreadProps(__spreadValues({}, headers), { "Cookie": authCookie }),
                signal: ctrl2.signal
              });
              clearTimeout(t2);
              if (!res2.ok) return null;
              html = yield res2.text();
            }
          }
          return html;
        } catch (e) {
          if (scrapeless.isEnabled()) {
            try {
              const scraped = yield scrapeless.scrape(url, { timeout: opts.timeout || 3e4 });
              if (scraped) return scraped;
            } catch (e2) {
            }
          }
          try {
            const domain = typeof url === "string" ? new URL(url).hostname : "";
            console.log(`[engine] Network error on ${domain}, trying Puppeteer...`);
            const { fetchWithPuppeteer } = require(require("path").join(__dirname, "..", "src", "puppeteer-fallback"));
            const rendered = yield fetchWithPuppeteer(url, { waitMs: 4e3, timeout: 2e4 });
            if (rendered && rendered.length > 500) return rendered;
          } catch (e2) {
          }
          return null;
        }
      });
    }
    function fetchJSON(_0) {
      return __async(this, arguments, function* (url, opts = {}) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), opts.timeout || 15e3);
          const res = yield fetch(url, {
            headers: __spreadValues({ "User-Agent": UA, "Accept": "application/json" }, opts.headers),
            signal: ctrl.signal
          });
          clearTimeout(t);
          if (!res.ok) return null;
          return yield res.json();
        } catch (e) {
          return null;
        }
      });
    }
    function getNested(obj, path) {
      if (!obj || !path) return "";
      const keys = path.split(".");
      let val = obj;
      for (const k of keys) {
        if (val == null) return "";
        val = val[k];
      }
      return typeof val === "string" ? val : val != null ? String(val) : "";
    }
    function similarity(a, b) {
      const sa = a.toLowerCase().replace(/[^a-z0-9]/g, "");
      const sb = b.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (sa === sb) return 1;
      if (sa.length < 2 || sb.length < 2) return 0;
      const longer = sa.length > sb.length ? sa : sb;
      const shorter = sa.length > sb.length ? sb : sa;
      if (longer.length === 0) return 1;
      const bigrams = /* @__PURE__ */ new Map();
      for (let i = 0; i < shorter.length - 1; i++) {
        const bg = shorter.substring(i, i + 2);
        bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
      }
      let common = 0;
      for (let i = 0; i < longer.length - 1; i++) {
        const bg = longer.substring(i, i + 2);
        const count = bigrams.get(bg) || 0;
        if (count > 0) {
          common++;
          bigrams.set(bg, count - 1);
        }
      }
      return 2 * common / (longer.length + shorter.length - 2);
    }
    function resolveTMDB(id, mediaType) {
      return __async(this, null, function* () {
        try {
          let tmdbId = id;
          if (id.startsWith("tt")) {
            const r = yield fetchJSON(`https://api.themoviedb.org/3/find/${id}?api_key=${TMDB_KEY}&external_source=imdb_id`);
            const results2 = r == null ? void 0 : r[mediaType === "tv" ? "tv_results" : "movie_results"];
            if (results2 == null ? void 0 : results2[0]) tmdbId = results2[0].id;
            else return null;
          }
          const typeStr = mediaType === "tv" ? "tv" : "movie";
          const data = yield fetchJSON(`https://api.themoviedb.org/3/${typeStr}/${tmdbId}?api_key=${TMDB_KEY}&language=en`);
          if (!data) return null;
          return {
            title: data.title || data.name || "",
            year: (data.release_date || data.first_air_date || "").substring(0, 4),
            imdbId: data.imdb_id || "",
            tmdbId: String(data.id)
          };
        } catch (e) {
          return null;
        }
      });
    }
    function searchProvider(provider, title, year, mediaType) {
      return __async(this, null, function* () {
        var _a;
        const cfg = provider.search;
        if (!cfg) return null;
        const titleClean = title.replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
        function trySearch(query) {
          return __async(this, null, function* () {
            let searchUrl;
            if (typeof cfg.url === "function") {
              searchUrl = cfg.url(provider.baseUrl, query);
            } else {
              searchUrl = provider.baseUrl + cfg.url.replace("{query}", encodeURIComponent(query));
            }
            if (cfg.method === "POST") {
              const domain = new URL(searchUrl).hostname;
              const initHtml = yield fetchHTML(searchUrl, { timeout: 1e4 });
              if (!initHtml) return null;
              try {
                const ctrl = new AbortController();
                const t = setTimeout(() => ctrl.abort(), 12e3);
                const cookie = anubisCookieCache.get(domain);
                const res = yield fetch(searchUrl, {
                  method: "POST",
                  headers: __spreadValues(__spreadValues({ "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" }, cfg.headers || {}), cookie ? { "Cookie": cookie } : {}),
                  body: (cfg.body || "query={query}").replace("{query}", encodeURIComponent(query)),
                  signal: ctrl.signal
                });
                clearTimeout(t);
                if (!res.ok) return null;
                return yield res.text();
              } catch (e) {
                return null;
              }
            }
            return yield fetchHTML(searchUrl, { headers: cfg.headers, timeout: 1e4 });
          });
        }
        let html = yield trySearch(titleClean);
        if (!html && titleClean.includes(" ")) {
          const words = titleClean.split(" ");
          const first2 = words.slice(0, 2).join(" ");
          if (first2.length >= 6) html = yield trySearch(first2);
        }
        if (!html && titleClean.includes(" ")) {
          const first = titleClean.split(" ")[0];
          if (first.length >= 6) html = yield trySearch(first);
        }
        if (!html) return null;
        if (cfg.jsonPath) {
          try {
            const data = typeof html === "string" ? JSON.parse(html) : html;
            let items2 = data;
            for (const key of cfg.jsonPath.split(".")) items2 = items2 == null ? void 0 : items2[key];
            if (!Array.isArray(items2) || !items2.length) return null;
            let bestMatch2 = null;
            let bestScore2 = 0;
            const titleField = cfg.titleAttr || "titulo";
            const linkField = cfg.linkAttr || "slug";
            for (const item of items2) {
              const itemTitle = item[titleField] || "";
              const itemSlug = item[linkField] || "";
              if (!itemTitle || !itemSlug) continue;
              const itemLink = `https://animejara.com/anime/${itemSlug}`;
              let score = similarity(itemTitle, title);
              if (score > bestScore2 && score > 0.6) {
                bestScore2 = score;
                bestMatch2 = itemLink;
              }
            }
            return bestMatch2;
          } catch (e) {
          }
        }
        if (cfg.jsonDataPath) {
          try {
            const data = JSON.parse(((_a = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)) == null ? void 0 : _a[1]) || html);
            let items2 = data;
            for (const key of cfg.jsonDataPath.split(".")) items2 = items2 == null ? void 0 : items2[key];
            if (!Array.isArray(items2) || !items2.length) return null;
            let bestMatch2 = null;
            let bestScore2 = 0;
            for (const item of items2) {
              const itemTitle = getNested(item, cfg.titleSelector) || "";
              const itemLinkRaw = getNested(item, cfg.linkSelector) || "";
              if (!itemTitle || !itemLinkRaw) continue;
              const itemLink = itemLinkRaw.startsWith("http") ? itemLinkRaw : itemLinkRaw.startsWith("/") ? new URL(itemLinkRaw, provider.baseUrl).href : `${provider.baseUrl}/${itemLinkRaw}`;
              let score = similarity(itemTitle, title);
              if (score > bestScore2 && score > 0.6) {
                bestScore2 = score;
                bestMatch2 = itemLink;
              }
            }
            return bestMatch2;
          } catch (e) {
          }
        }
        const $ = cheerio.load(html);
        const items = $(cfg.itemSelector).toArray();
        if (!items.length) return null;
        let bestMatch = null;
        let bestScore = 0;
        for (const item of items) {
          const el = $(item);
          let itemTitle = "";
          let itemLink = "";
          if (cfg.titleSelector) {
            const titleEl = cfg.titleSelector === "&" ? el : el.find(cfg.titleSelector).first();
            itemTitle = cfg.titleAttr ? titleEl.attr(cfg.titleAttr) || "" : titleEl.text().trim();
          }
          if (cfg.linkSelector) {
            const linkEl = cfg.linkSelector === "&" ? el : el.find(cfg.linkSelector).first();
            itemLink = (linkEl.attr("href") || "").trim();
            if (itemLink && !itemLink.startsWith("http")) {
              try {
                itemLink = new URL(itemLink, provider.baseUrl).href;
              } catch (e) {
                continue;
              }
            }
          }
          if (!itemTitle || !itemLink) continue;
          let score = similarity(itemTitle, title);
          const titleClean2 = titleClean.replace(/[^a-z0-9]/g, "");
          const itemClean = itemTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (itemClean === titleClean2) score = Math.max(score, 1);
          if (titleClean2.length >= 6 && (itemClean.includes(titleClean2) || titleClean2.includes(itemClean))) {
            const ratio = Math.min(itemClean.length, titleClean2.length) / Math.max(itemClean.length, titleClean2.length);
            score = Math.max(score, ratio >= 0.5 ? 0.85 : 0.75);
          }
          if (year) {
            const itemYear = el.text().match(/\b(19|20)\d{2}\b/);
            if (itemYear && itemYear[0] === year) score += 0.25;
          }
          let wordMatch = true;
          const queryWords = titleClean.split(" ").filter((w) => w.length >= 3);
          if (queryWords.length > 0) {
            const itemLower = " " + itemTitle.toLowerCase().replace(/[^a-z0-9]/g, " ") + " ";
            const matchCount = queryWords.filter((qw) => itemLower.includes(" " + qw.toLowerCase() + " ")).length;
            const minMatches = queryWords.length <= 3 ? queryWords.length : Math.ceil(queryWords.length / 2);
            wordMatch = matchCount >= minMatches;
          } else {
            wordMatch = itemClean.includes(titleClean2) || titleClean2.includes(itemClean);
          }
          if (score > bestScore && score > 0.7 && wordMatch) {
            bestScore = score;
            bestMatch = itemLink;
          }
        }
        if (!bestMatch && items.length > 0) {
          const queryWords = titleClean.toLowerCase().split(" ").filter((w) => w.length >= 3);
          if (queryWords.length > 0) {
            for (const item of items) {
              const el = $(item);
              let itemTitle = "";
              if (cfg.titleSelector) {
                const titleEl = cfg.titleSelector === "&" ? el : el.find(cfg.titleSelector).first();
                itemTitle = cfg.titleAttr ? titleEl.attr(cfg.titleAttr) || "" : titleEl.text().trim();
              }
              let itemLink = "";
              if (cfg.linkSelector) {
                const linkEl = cfg.linkSelector === "&" ? el : el.find(cfg.linkSelector).first();
                itemLink = (linkEl.attr("href") || "").trim();
                if (itemLink && !itemLink.startsWith("http")) {
                  try {
                    itemLink = new URL(itemLink, provider.baseUrl).href;
                  } catch (e) {
                    continue;
                  }
                }
              }
              if (!itemTitle || !itemLink) continue;
              const itemLower = itemTitle.toLowerCase();
              const matchCount = queryWords.filter((qw) => itemLower.includes(qw)).length;
              const minMatches = queryWords.length <= 3 ? queryWords.length : Math.ceil(queryWords.length / 2);
              const allMatch = queryWords.length > 0 && matchCount >= minMatches;
              const itemWords = " " + itemLower.replace(/[^a-z0-9]/g, " ") + " ";
              const hasWholeWord = queryWords.some((qw) => itemWords.includes(" " + qw + " "));
              if (allMatch && hasWholeWord) {
                bestMatch = itemLink;
                break;
              }
            }
          }
        }
        return bestMatch;
      });
    }
    function getEpisodeUrl(provider, seriesUrl, season, episode) {
      return __async(this, null, function* () {
        var _a, _b, _c;
        const cfg = provider.episodes;
        if (!cfg) return seriesUrl;
        if (cfg.type === "url") {
          const slug = seriesUrl.replace(/\/+$/, "").split("/").pop();
          const url = cfg.pattern.replace("{slug}", slug).replace("{episode}", episode);
          try {
            return new URL(url, provider.baseUrl).href;
          } catch (e) {
            return seriesUrl;
          }
        }
        const html = yield fetchHTML(seriesUrl);
        if (!html) return null;
        const $ = cheerio.load(html);
        if (cfg.type === "post") {
          const fd = new URLSearchParams();
          fd.append(cfg.seasonParam || "season", String(season));
          fd.append(cfg.episodeParam || "episode", String(episode));
          if (cfg.extraParams) {
            for (const [k, v] of Object.entries(cfg.extraParams)) {
              fd.append(k, typeof v === "function" ? v($, html) : v);
            }
          }
          const postUrl = cfg.url || seriesUrl;
          const res = yield fetch(postUrl, {
            method: "POST",
            headers: __spreadValues({ "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" }, cfg.headers),
            body: fd.toString(),
            signal: AbortSignal.timeout(12e3)
          });
          if (!res.ok) return null;
          const data = yield res.text();
          const $$ = cheerio.load(data);
          const epLink = $$(cfg.episodeSelector).first().attr("href");
          if (epLink) {
            try {
              return new URL(epLink, provider.baseUrl).href;
            } catch (e) {
              return null;
            }
          }
          return null;
        }
        if (cfg.type === "season-list") {
          const seasonEls = $(cfg.seasonSelector).toArray();
          for (const sel of seasonEls) {
            const sNum = parseInt(((_a = $(sel).text().match(/\d+/)) == null ? void 0 : _a[0]) || "0");
            if (sNum === season) {
              const sUrl = $(sel).attr("href");
              if (sUrl) {
                const sHtml = yield fetchHTML(new URL(sUrl, provider.baseUrl).href);
                if (sHtml) {
                  const $$ = cheerio.load(sHtml);
                  const epEls = $$(cfg.episodeSelector).toArray();
                  for (const eel of epEls) {
                    const eNum = parseInt(((_b = $$(eel).text().match(/\d+/)) == null ? void 0 : _b[0]) || "0");
                    if (eNum === episode) {
                      const epUrl = $$(eel).attr("href");
                      if (epUrl) {
                        try {
                          return new URL(epUrl, provider.baseUrl).href;
                        } catch (e) {
                          return null;
                        }
                      }
                      if (!results.length) {
                        const mediaRe = /https?:\/\/[^"'\s<>]+\.(?:mp4|m3u8|mkv|webm)[^"'\s<>]*/gi;
                        const seen = /* @__PURE__ */ new Set();
                        let m;
                        while ((m = mediaRe.exec(html)) !== null) {
                          const mediaUrl = m[0].replace(/[)"'<>]+$/, "");
                          if (!seen.has(mediaUrl)) {
                            seen.add(mediaUrl);
                            results.push({ url: mediaUrl, server: "direct", quality: cfg.defaultQuality || "HD" });
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (cfg.type === "jsvar") {
          const match = html.match(cfg.varPattern);
          if (match) {
            try {
              const episodes = JSON.parse(match[1]);
              const ep = episodes.find(
                (e) => (e.season || e.temporada) == season && (e.episode || e.capitulo) == episode
              );
              if ((ep == null ? void 0 : ep.url) || (ep == null ? void 0 : ep.link)) {
                try {
                  return new URL(ep.url || ep.link, provider.baseUrl).href;
                } catch (e) {
                  return null;
                }
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "nextjs") {
          const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              let obj = data;
              for (const key of cfg.dataPath.split(".")) obj = obj == null ? void 0 : obj[key];
              if (obj == null ? void 0 : obj.seasons) {
                for (const s of obj.seasons) {
                  if (s.number == season) {
                    const ep = (_c = s.episodes) == null ? void 0 : _c.find((e) => e.number == episode);
                    if (ep == null ? void 0 : ep.url) {
                      try {
                        return new URL(ep.url, provider.baseUrl).href;
                      } catch (e) {
                        return null;
                      }
                    }
                  }
                }
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "dontorrent") {
          const rows = $("table.table tbody tr").toArray();
          for (const row of rows) {
            const cells = $(row).find("td");
            const epText = $(cells[0]).text().trim();
            const epMatch = epText.match(/(\d+)x(\d+)/);
            if (epMatch && parseInt(epMatch[1]) === season && parseInt(epMatch[2]) === episode) {
              const btn = $(cells[1]).find(".protected-download");
              const contentId = btn.attr("data-content-id");
              const tabla = btn.attr("data-tabla");
              if (contentId && tabla) {
                try {
                  return seriesUrl + "?dt_contentId=" + contentId + "&dt_tabla=" + tabla;
                } catch (e) {
                }
              }
            }
          }
          try {
            const domain = new URL(seriesUrl).hostname;
            const showBase = seriesUrl.split("/").pop().replace(/-\d+-Temporada.*/i, "").replace(/-/g, " ").trim();
            const searchUrl = provider.baseUrl + "/buscar";
            const init = yield fetchHTML(searchUrl, { timeout: 1e4 });
            if (!init) return null;
            const cookie = anubisCookieCache.get(domain);
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 12e3);
            const sRes = yield fetch(searchUrl, {
              method: "POST",
              headers: __spreadValues({ "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" }, cookie ? { "Cookie": cookie } : {}),
              body: "valor=" + encodeURIComponent(showBase),
              signal: ctrl.signal
            });
            clearTimeout(t);
            if (!sRes.ok) return null;
            const sHtml = yield sRes.text();
            const $$ = cheerio.load(sHtml);
            const seasonLinks = $$('a[href*="/serie/"]').toArray();
            if (!seasonLinks.length) return null;
            for (const sl of seasonLinks) {
              const seasonText = $$(sl).text().trim();
              if (seasonText.includes(season + "\xAA Temporada") || seasonText.includes(season + " Temporada") || new RegExp("\\b" + season + "\\b").test(seasonText)) {
                let seasonUrl = $$(sl).attr("href");
                if (!seasonUrl) continue;
                if (!seasonUrl.startsWith("http")) seasonUrl = provider.baseUrl + seasonUrl;
                const sHtml2 = yield fetchHTML(seasonUrl, { timeout: 1e4 });
                if (!sHtml2) continue;
                const $$$ = cheerio.load(sHtml2);
                const sRows = $$$("table.table tbody tr").toArray();
                for (const row of sRows) {
                  const cells = $$$(row).find("td");
                  const epText = $$$(cells[0]).text().trim();
                  const epMatch = epText.match(/(\d+)x(\d+)/);
                  if (epMatch && parseInt(epMatch[1]) === season && parseInt(epMatch[2]) === episode) {
                    const btn = $$$(cells[1]).find(".protected-download");
                    const contentId = btn.attr("data-content-id");
                    const tabla = btn.attr("data-tabla");
                    if (contentId && tabla) {
                      try {
                        return seasonUrl + "?dt_contentId=" + contentId + "&dt_tabla=" + tabla;
                      } catch (e) {
                      }
                    }
                  }
                }
              }
            }
          } catch (e) {
          }
        }
        return seriesUrl;
      });
    }
    function extractVideos(provider, pageUrl) {
      return __async(this, null, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const cfg = provider.videos;
        if (!cfg) return [];
        const html = yield fetchHTML(pageUrl);
        if (!html) return [];
        const $ = cheerio.load(html);
        const results2 = [];
        function resolveUrl(val) {
          if (!val) return null;
          if (typeof val === "string" && /^[A-Za-z0-9+/=]{20,}$/.test(val) && !val.startsWith("http")) {
            try {
              const decoded = Buffer.from(val, "base64").toString("utf-8").trim();
              if (decoded.startsWith("http://") || decoded.startsWith("https://")) return decoded;
            } catch (e) {
            }
          }
          if (val.startsWith("//")) return "https:" + val;
          if (val.startsWith("/")) {
            try {
              return new URL(val, pageUrl).href;
            } catch (e) {
              return val;
            }
          }
          return val;
        }
        if (cfg.type === "iframe") {
          const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
          const targets = container.find(cfg.iframeSelector || "iframe").toArray();
          for (const el of targets) {
            const val = $(el).attr(cfg.srcAttr || "src") || $(el).attr("data-src");
            const url = resolveUrl(val);
            if (url) results2.push({ url, server: detectServer(url), quality: cfg.defaultQuality || "HD" });
          }
          if (!results2.length) {
            const attr = cfg.srcAttr || "data-src";
            const altTargets = container.find("a[" + attr + "]").toArray();
            for (const el of altTargets) {
              const val = $(el).attr(attr);
              const url = resolveUrl(val);
              if (url) results2.push({ url, server: detectServer(url), quality: cfg.defaultQuality || "HD" });
            }
          }
        }
        if (cfg.type === "iframe-chain") {
          const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
          const iframes = container.find(cfg.iframeSelector || "iframe").toArray();
          const chainUrls = [];
          for (const iframe of iframes) {
            const src = $(iframe).attr(cfg.srcAttr || "src") || $(iframe).attr("data-src");
            if (src) chainUrls.push(src.startsWith("//") ? "https:" + src : src);
          }
          for (const embedUrl of chainUrls) {
            try {
              const body = yield fetchHTML(embedUrl, { headers: { Referer: pageUrl }, timeout: 1e4 });
              if (!body) continue;
              const $e = cheerio.load(body);
              const realSrc = $e("div.Video iframe, .Video iframe, iframe").first().attr("src");
              if (realSrc) {
                const finalUrl = realSrc.startsWith("//") ? "https:" + realSrc : realSrc;
                results2.push({ url: finalUrl, server: detectServer(finalUrl), quality: cfg.defaultQuality || "HD" });
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "nextjs") {
          const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/) || html.match(/<script type="application\/json"[^>]*>(.*?)<\/script>/);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              let obj = data;
              for (const key of cfg.dataPath.split(".")) obj = obj == null ? void 0 : obj[key];
              if (obj && typeof obj === "object") {
                for (const [lang, players] of Object.entries(obj)) {
                  if (Array.isArray(players)) {
                    for (const p of players) {
                      const pUrl = p.result || p.url || p.link;
                      if (pUrl) results2.push({
                        url: pUrl,
                        server: p.cyberlocker || p.server || detectServer(pUrl),
                        quality: p.quality || cfg.defaultQuality || "HD",
                        lang
                      });
                    }
                  }
                }
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "jsvar") {
          const match = html.match(cfg.varPattern);
          if (match) {
            try {
              const data = JSON.parse(match[1]);
              const entries = Array.isArray(data) ? data : Object.values(data).flat();
              for (const v of entries) {
                const server = Array.isArray(v) ? v[0] : v.server || v.name;
                const vUrl = Array.isArray(v) ? v[1] : v.url || v.link || v.code;
                if (vUrl) results2.push({
                  url: vUrl,
                  server: server || detectServer(vUrl),
                  quality: v.quality || cfg.defaultQuality || "HD",
                  lang: v.lang || v.idioma || v.audio || ""
                });
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "jslist") {
          const re = cfg.varPattern instanceof RegExp ? cfg.varPattern : new RegExp(cfg.varPattern, "g");
          let m;
          while ((m = re.exec(html)) !== null) {
            const src = (m[1] || "").match(/src=["']([^"']+)["']/);
            if (src) {
              results2.push({ url: src[1], server: detectServer(src[1]), quality: cfg.defaultQuality || "HD" });
            }
          }
        }
        if (cfg.type === "onclick") {
          const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
          const items = container.find(cfg.itemSelector || 'li[onclick*="playVideo"]').toArray();
          for (const el of items) {
            const onclick = $(el).attr("onclick") || "";
            const urlMatch = onclick.match(/playVideo\s*\(\s*["']([^"']+)["']\s*\)/);
            if (!urlMatch) continue;
            let url = urlMatch[1].replace(/\\\//g, "/");
            url = resolveUrl(url);
            if (!url) continue;
            const serverEl = cfg.serverSelector ? $(el).find(cfg.serverSelector).first() : $(el).find('.nombre-server, [class*="server"]').first();
            const serverName = serverEl.length ? serverEl.text().trim() : detectServer(url);
            results2.push({ url, server: serverName, quality: cfg.defaultQuality || "HD" });
          }
          if (!results2.length) {
            const re = /playVideo\s*\(\s*["']([^"']+)["']\s*\)/g;
            let m;
            while ((m = re.exec(html)) !== null) {
              let url = m[1].replace(/\\\//g, "/");
              url = resolveUrl(url);
              if (url) results2.push({ url, server: detectServer(url), quality: cfg.defaultQuality || "HD" });
            }
          }
          if (!results2.length) {
            const iframes = $('.reproductor-wrapper iframe, .episodio-reproductor iframe, iframe[src*="player"], iframe[src*="embed"]').toArray();
            for (const el of iframes) {
              const src = $(el).attr("src") || $(el).attr("data-src");
              if (src) {
                const url = resolveUrl(src);
                if (url) results2.push({ url, server: detectServer(url), quality: cfg.defaultQuality || "HD" });
              }
            }
          }
          if (!results2.length && cfg.puppeteerFallback) {
            let pool, instance;
            try {
              const { getSharedPool } = require(require("path").join(__dirname, "..", "src", "intelligent", "browser-pool-singleton"));
              pool = getSharedPool();
              instance = yield pool.acquire();
              const b = instance.browser;
              const page = yield b.newPage();
              yield page.setUserAgent(UA);
              yield page.goto(pageUrl, { waitUntil: "networkidle2", timeout: 2e4 });
              const servers = yield page.evaluate(() => {
                const found = [];
                document.querySelectorAll('[onclick*="playVideo"]').forEach((el) => {
                  var _a2, _b2;
                  const m = (el.getAttribute("onclick") || "").match(/playVideo\s*\(\s*["\']([^"\']+)["\']\s*\)/);
                  if (m) found.push({ url: m[1].replace(/\\\//g, "/"), server: ((_b2 = (_a2 = el.querySelector('.nombre-server, [class*="server"]')) == null ? void 0 : _a2.textContent) == null ? void 0 : _b2.trim()) || "" });
                });
                document.querySelectorAll(".reproductor-wrapper iframe, .episodio-reproductor iframe").forEach((el) => {
                  const src = el.getAttribute("src");
                  if (src) found.push({ url: src, server: "" });
                });
                return found;
              });
              yield page.close();
              for (const s of servers) {
                if (s.url.startsWith("//")) s.url = "https:" + s.url;
                if (s.url.startsWith("http")) {
                  if (!s.server) s.server = detectServer(s.url);
                  results2.push({ url: s.url, server: s.server, quality: cfg.defaultQuality || "HD" });
                }
              }
            } catch (e) {
            } finally {
              if (instance && pool) yield pool.release(instance).catch(() => {
              });
            }
          }
        }
        if (cfg.type === "data-attr") {
          const container = cfg.containerSelector ? $(cfg.containerSelector) : $;
          const items = container.find(cfg.itemSelector || "[data-tr]").toArray();
          for (const el of items) {
            const dataUrl = $(el).attr(cfg.dataAttr || "data-tr");
            if (!dataUrl) continue;
            const serverText = cfg.serverSelector ? $(el).find(cfg.serverSelector).text().trim() : "";
            const serverName = serverText || detectServer(dataUrl);
            try {
              const proxyHtml = yield fetchHTML(dataUrl, { headers: { Referer: pageUrl }, timeout: 8e3 });
              if (!proxyHtml) continue;
              const varMatch = proxyHtml.match(/var\s+url\s*=\s*['"]([^'"]+)['"]/);
              if (varMatch) {
                const realUrl = resolveUrl(varMatch[1]);
                if (realUrl) results2.push({ url: realUrl, server: serverName, quality: cfg.defaultQuality || "HD" });
                continue;
              }
              const embedMatch = proxyHtml.match(/(?:streamwish|filemoon|vidhide|voe\.sx|doodstream|streamtape|mixdrop|upstream|vidmoly)[^"'<>]*/i);
              if (embedMatch) {
                let fallbackUrl = embedMatch[0];
                if (!fallbackUrl.startsWith("http")) fallbackUrl = "https://" + fallbackUrl;
                results2.push({ url: fallbackUrl, server: serverName, quality: cfg.defaultQuality || "HD" });
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "jkplayer") {
          const re = cfg.varPattern instanceof RegExp ? cfg.varPattern : new RegExp(cfg.varPattern, "g");
          let m;
          while ((m = re.exec(html)) !== null) {
            const src = (m[1] || "").match(/src=["']([^"']+)["']/);
            if (src) results2.push({ url: src[1], server: detectServer(src[1]), quality: cfg.defaultQuality || "HD" });
          }
          for (const r of results2) {
            if (!r.url || !r.url.includes("/jkplayer/")) continue;
            try {
              const body = yield fetchHTML(r.url);
              let vm = body.match(/url:\s*'([^']+\.m3u8[^']*)'/);
              if (!vm) {
                const b64 = body.match(/atob\('([^']+)'\)/);
                if (b64) vm = [null, Buffer.from(b64[1], "base64").toString()];
              }
              if (vm) {
                r.url = vm[1];
                r.server = detectServer(vm[1]);
              }
            } catch (e) {
            }
          }
        }
        if (cfg.type === "api") {
          const apiUrl = typeof cfg.apiUrl === "function" ? cfg.apiUrl(provider.baseUrl, pageUrl, html) : provider.baseUrl + cfg.apiUrl;
          const data = yield fetchJSON(apiUrl, { headers: cfg.headers });
          if (data) {
            const sources = data.sources || data.data || data;
            for (const s of Array.isArray(sources) ? sources : []) {
              const sUrl = s.url || s.file || s.link || s.src;
              if (sUrl) results2.push({
                url: sUrl,
                server: s.server || detectServer(sUrl),
                quality: s.quality || s.label || cfg.defaultQuality || "HD"
              });
            }
          }
        }
        if (cfg.type === "torrent") {
          const selector = cfg.linkSelector || 'a[href*="magnet:"], a[href$=".torrent"], a[href*="s.php"], a[href*="download_tt.php"], a[class*="torrent"], a[class*="download"], a[class*="descargar"]';
          const links = $(selector).toArray();
          for (const link of links) {
            const href = $(link).attr("href");
            if (!href) continue;
            const label = $(link).text().trim() || "";
            const qualityMatch = label.match(/\b(4K|2160p?|1080p?|720p?|480p?)\b/i);
            const quality = (qualityMatch ? qualityMatch[1] : "") || cfg.defaultQuality || "HD";
            const resolved = yield resolveTorrentLink(href, label, quality, pageUrl);
            if (resolved) results2.push(resolved);
          }
        }
        if (cfg.type === "dontorrent") {
          let contentId, tabla, episodeLabel;
          try {
            const parsed = new URL(pageUrl);
            contentId = parsed.searchParams.get("dt_contentId");
            tabla = parsed.searchParams.get("dt_tabla");
          } catch (e) {
          }
          if (contentId && tabla) {
            episodeLabel = (_a = $("table.table tbody tr").first().find("td").first().text().trim().match(/x(\d+)/)) == null ? void 0 : _a[1];
          }
          if (!contentId || !tabla) {
            const btn = $(".protected-download").first();
            contentId = btn.attr("data-content-id");
            tabla = btn.attr("data-tabla");
            episodeLabel = "";
          }
          if (!contentId || !tabla) return [];
          const torrentInfo = yield downloadDontorrentTorrent(provider.baseUrl, contentId, tabla);
          if (!torrentInfo) return [];
          let quality = cfg.defaultQuality || "HD";
          const fmtMatch = html.match(/Formato:<\/b>\s*([^<]+)/i);
          if (fmtMatch) quality = fmtMatch[1].trim();
          const fnameMatch = torrentInfo.filename.match(/\b(4K|2160p?|1080p?|720p?|480p?|HDTV|HD)\b/i);
          if (fnameMatch) quality = fnameMatch[1];
          results2.push({
            url: torrentInfo.url,
            infoHash: torrentInfo.infoHash,
            server: "torrent",
            quality,
            filename: torrentInfo.filename || (episodeLabel ? "Episode " + episodeLabel : ""),
            sources: ["dht:" + torrentInfo.infoHash]
          });
        }
        const embeds = results2.filter((r) => !r.infoHash && r.url && r.server !== "direct" && r.server !== "torrent");
        const resolvedList = yield Promise.allSettled(embeds.map((r) => tryResolveEmbedToDirect(r.url, pageUrl)));
        for (let i = 0; i < embeds.length; i++) {
          const res = resolvedList[i];
          if (res.status === "fulfilled" && res.value) {
            embeds[i].url = res.value;
            embeds[i].server = "direct";
          }
        }
        if (results2.length === 0 && ((_b = provider.videos) == null ? void 0 : _b.type) !== "torrent" && ((_c = provider.videos) == null ? void 0 : _c.type) !== "dontorrent") {
          try {
            const { StaticScraper } = require(require("path").join(__dirname, "..", "src", "intelligent"));
            const ss = new StaticScraper();
            const analysis = yield ss.analyze(pageUrl);
            if (analysis && analysis.urlsFound > 0) {
              const seen = /* @__PURE__ */ new Set();
              for (const server of analysis.serverCatalog || []) {
                for (const u of server.urls) {
                  if (u.url && !seen.has(u.url) && (u.type === "embed" || u.type === "direct-video" || u.type === "stream")) {
                    seen.add(u.url);
                    results2.push({
                      url: u.url,
                      server: server.name !== "unknown" ? server.name : detectServer(u.url),
                      quality: ((_d = provider.videos) == null ? void 0 : _d.defaultQuality) || "HD"
                    });
                  }
                }
              }
              for (const url of ((_e = analysis.findings) == null ? void 0 : _e.videoUrls) || []) {
                if (url && !seen.has(url)) {
                  seen.add(url);
                  results2.push({ url, server: detectServer(url), quality: ((_f = provider.videos) == null ? void 0 : _f.defaultQuality) || "HD" });
                }
              }
              for (const url of ((_g = analysis.findings) == null ? void 0 : _g.serverUrls) || []) {
                if (url && !seen.has(url)) {
                  seen.add(url);
                  results2.push({ url, server: detectServer(url), quality: ((_h = provider.videos) == null ? void 0 : _h.defaultQuality) || "HD" });
                }
              }
            }
          } catch (e) {
          }
        }
        return results2;
      });
    }
    function tryResolveEmbedToDirect(embedUrl, referer) {
      return __async(this, null, function* () {
        if (!embedUrl) return null;
        return resolveEmbed(embedUrl, referer);
      });
    }
    function detectServer(url) {
      if (!url) return "direct";
      if (/\.(mp4|m3u8|mkv|webm|avi)(\?|$)/i.test(url)) return "direct";
      if (/magnet:/i.test(url)) return "torrent";
      const patterns = [
        ["streamwish", /streamwish/i],
        ["filemoon", /filemoon/i],
        ["voes", /voes\./i],
        ["doodstream", /dood/i],
        ["streamtape", /streamtape/i],
        ["fembed", /fembed/i],
        ["okru", /ok\.ru|odnoklassniki/i],
        ["mixdrop", /mixdrop/i],
        ["upstream", /upstream/i],
        ["vidhide", /vidhide|vidpro/i],
        ["voe", /voe\.sx/i],
        ["mystream", /mystream/i],
        ["netutv", /netu\.tv/i],
        ["yourupload", /yourupload/i],
        ["jawcloud", /jawcloud/i],
        ["streampe", /streampe/i],
        ["gvideo", /drive\.google|googlevideo/i],
        ["mega", /mega\.nz/i],
        ["wolfmax", /wolfmax/i]
      ];
      for (const [name, re] of patterns) {
        if (re.test(url)) return name;
      }
      return "embed";
    }
    function solveSha256PoW(challenge, difficulty) {
      let nonce = 0;
      const target = "0".repeat(difficulty);
      while (true) {
        const hash = crypto.createHash("sha256").update(challenge + nonce).digest("hex");
        if (hash.startsWith(target)) return nonce;
        nonce++;
      }
    }
    function downloadDontorrentTorrent(baseUrl, contentId, tabla) {
      return __async(this, null, function* () {
        try {
          const origin = new URL(baseUrl).origin;
          const domain = new URL(baseUrl).hostname;
          const cookie = anubisCookieCache.get(domain);
          function powPost(action, body) {
            return __async(this, null, function* () {
              const ctrl = new AbortController();
              const t = setTimeout(() => ctrl.abort(), 15e3);
              const res = yield fetch(origin + "/api_validate_pow.php", {
                method: "POST",
                headers: __spreadValues({ "User-Agent": UA, "Content-Type": "application/json" }, cookie ? { "Cookie": cookie } : {}),
                body: JSON.stringify(body),
                signal: ctrl.signal
              });
              clearTimeout(t);
              if (!res.ok) return null;
              return yield res.json();
            });
          }
          const gen = yield powPost("generate", { action: "generate", content_id: parseInt(contentId), tabla });
          if (!gen || !gen.success || !gen.challenge) return null;
          const nonce = solveSha256PoW(gen.challenge, 3);
          const val = yield powPost("validate", { action: "validate", challenge: gen.challenge, nonce });
          if (!val || !val.success || !val.download_url) return null;
          const dlUrl = val.download_url.startsWith("//") ? "https:" + val.download_url : val.download_url.startsWith("/") ? origin + val.download_url : val.download_url;
          const ctrl3 = new AbortController();
          const t3 = setTimeout(() => ctrl3.abort(), 2e4);
          const dlRes = yield fetch(dlUrl, {
            headers: __spreadValues({ "User-Agent": UA }, cookie ? { "Cookie": cookie } : {}),
            signal: ctrl3.signal
          });
          clearTimeout(t3);
          if (!dlRes.ok) return null;
          const buf = Buffer.from(yield dlRes.arrayBuffer());
          const infoHash = parseTorrentInfoHash(buf);
          if (!infoHash) return null;
          const filename = decodeURIComponent(dlUrl.split("/").pop()).replace(/\.torrent$/i, "");
          return { url: dlUrl, infoHash, filename };
        } catch (e) {
          return null;
        }
      });
    }
    module2.exports = {
      fetchHTML,
      fetchJSON,
      similarity,
      resolveTMDB,
      searchProvider,
      getEpisodeUrl,
      extractVideos,
      detectServer,
      tryResolveEmbedToDirect
    };
  }
});

// src/engines/static-engine.js
var require_static_engine = __commonJS({
  "src/engines/static-engine.js"(exports2, module2) {
    var engine = require_engine();
    var cheerio = require("cheerio");
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function search(provider, query) {
      return __async(this, null, function* () {
        return engine.searchProvider(provider, query, null, _mapCategory(provider));
      });
    }
    function extractVideos(provider, pageUrl) {
      return __async(this, null, function* () {
        return engine.extractVideos(provider, pageUrl);
      });
    }
    function getEpisodeUrl(provider, seriesUrl, season, episode) {
      return __async(this, null, function* () {
        return engine.getEpisodeUrl(provider, seriesUrl, season, episode);
      });
    }
    function validateSearch(provider, query) {
      return __async(this, null, function* () {
        try {
          const searchUrl = provider.baseUrl + provider.search.url.replace("{query}", encodeURIComponent(query));
          const res = yield fetch(searchUrl, {
            headers: { "User-Agent": UA, "Accept": "text/html" },
            signal: AbortSignal.timeout(1e4)
          });
          if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, items: 0 };
          const html = yield res.text();
          if (html.length < 500) return { ok: false, error: "Short response", items: 0 };
          const $ = cheerio.load(html);
          const itemSel = provider.search.itemSelector;
          let items;
          try {
            items = itemSel === "&" ? $(provider.search.linkSelector) : $(itemSel);
          } catch (e) {
            items = $();
          }
          const titles = [];
          const titleSel = provider.search.titleSelector;
          items.slice(0, 5).each((i, el) => {
            let t;
            if (titleSel === "&") t = $(el).text().trim();
            else if (provider.search.titleAttr) t = $(el).find(titleSel).attr(provider.search.titleAttr) || "";
            else t = $(el).find(titleSel).first().text().trim() || $(el).text().trim();
            if (t) titles.push(t.substring(0, 60));
          });
          return {
            ok: items.length > 0 && titles.some((t) => t.toLowerCase().includes(query.toLowerCase())),
            items: items.length,
            sampleTitles: titles,
            htmlSize: html.length
          };
        } catch (e) {
          return { ok: false, error: e.message, items: 0 };
        }
      });
    }
    function _mapCategory(provider) {
      const cat = provider.categories[0] || "movie";
      if (cat === "tvshow") return "tv";
      if (cat === "anime") return "anime";
      if (cat === "documentary") return "other";
      return "movie";
    }
    module2.exports = { search, extractVideos, getEpisodeUrl, validateSearch };
  }
});

// src/intelligent/browser-pool-singleton.js
var require_browser_pool_singleton = __commonJS({
  "src/intelligent/browser-pool-singleton.js"(exports2, module2) {
    var { BrowserPool, createBrowser } = require_intelligent();
    var pool = null;
    function getSharedPool() {
      if (!pool) {
        pool = new BrowserPool(
          () => createBrowser({ headless: true, stealth: true, timeout: 3e4 }),
          {
            min: 0,
            max: 1,
            // Single browser — prevents resource storms
            idleTimeoutMs: 5 * 60 * 1e3
            // 5 min idle → close
          }
        );
        console.log("[browser] Shared pool created (max: 1, idle: 5min)");
      }
      return pool;
    }
    process.on("beforeExit", () => __async(null, null, function* () {
      if (pool) {
        console.log("[browser] Closing shared pool...");
        yield pool.closeAll();
        pool = null;
      }
    }));
    module2.exports = { getSharedPool };
  }
});

// src/engines/dynamic-engine.js
var require_dynamic_engine = __commonJS({
  "src/engines/dynamic-engine.js"(exports2, module2) {
    var {
      AutonomousScraper,
      PageTypeClassifier,
      createPage,
      setupResourceBlocking
    } = require_intelligent();
    var { getSharedPool } = require_browser_pool_singleton();
    var { resolveEmbed, isDirectVideoUrl } = require_embed_resolver();
    var DynamicEngine = class {
      constructor(options = {}) {
        this.maxDepth = options.maxDepth || 2;
        this.maxRequests = options.maxRequests || 30;
        this.timeout = options.timeout || 25e3;
        this.waitMs = options.waitMs || 4e3;
      }
      search(provider, query) {
        return __async(this, null, function* () {
          var _a, _b;
          const searchUrl = provider.baseUrl + provider.search.url.replace("{query}", encodeURIComponent(query));
          const pool = getSharedPool();
          let instance2;
          try {
            instance2 = yield pool.acquire();
            const page = yield createPage(instance2.browser, { stealth: true });
            yield setupResourceBlocking(page);
            const scraper = new AutonomousScraper(page, {
              searchTerm: query,
              maxRequests: this.maxRequests,
              maxDepth: 1,
              contentGoal: "auto"
            });
            const investigation = yield scraper.quickExtract(searchUrl);
            const classifier = new PageTypeClassifier();
            const pageType = classifier.analyze([], searchUrl, investigation.title || "");
            console.log(`[dynamic:search] ${provider.name} \u2192 ${pageType.type} (${pageType.confidence}%)`);
            const candidates = [
              ...((_a = investigation.findings) == null ? void 0 : _a.navigationUrls) || [],
              ...((_b = investigation.findings) == null ? void 0 : _b.serverUrls) || []
            ].filter((u) => {
              const lower = u.toLowerCase();
              const querySlug = query.toLowerCase().replace(/\s+/g, "-");
              return lower.includes(querySlug) || query.toLowerCase().split(/\s+/).every((w) => lower.includes(w));
            });
            yield page.close().catch(() => {
            });
            if (candidates.length > 0) {
              candidates.sort((a, b) => a.length - b.length);
              return candidates[0];
            }
            for (const server of investigation.serverCatalog || []) {
              for (const u of server.urls) {
                if (u.url && u.type === "navigation") return u.url;
              }
            }
            return null;
          } catch (e) {
            console.warn(`[dynamic:search] ${provider.name} failed: ${e.message}`);
            return null;
          } finally {
            if (instance2) yield pool.release(instance2).catch(() => {
            });
          }
        });
      }
      extractVideos(provider, pageUrl) {
        return __async(this, null, function* () {
          var _a, _b, _c, _d, _e, _f, _g;
          const pool = getSharedPool();
          let instance2;
          try {
            instance2 = yield pool.acquire();
            const page = yield createPage(instance2.browser, { stealth: true });
            yield setupResourceBlocking(page);
            const capturedVideos = /* @__PURE__ */ new Set();
            page.on("response", (response) => {
              const ct = response.headers()["content-type"] || "";
              if (ct.includes("video") || ct.includes("mpegurl")) capturedVideos.add(response.url());
            });
            const scraper = new AutonomousScraper(page, {
              maxRequests: this.maxRequests,
              maxDepth: this.maxDepth,
              contentGoal: "video"
            });
            const investigation = yield scraper.investigate(pageUrl);
            yield page.close().catch(() => {
            });
            const results2 = [];
            const seen = /* @__PURE__ */ new Set();
            for (const url of capturedVideos) {
              if (!seen.has(url)) {
                seen.add(url);
                results2.push({ url, server: "direct", quality: ((_a = provider.videos) == null ? void 0 : _a.defaultQuality) || "HD" });
              }
            }
            for (const server of investigation.serverCatalog || []) {
              for (const u of server.urls) {
                if (u.url && !seen.has(u.url) && u.type !== "cdn" && u.type !== "tracking" && u.type !== "social") {
                  seen.add(u.url);
                  results2.push({ url: u.url, server: server.name !== "unknown" ? server.name : _detectServer(u.url), quality: ((_b = provider.videos) == null ? void 0 : _b.defaultQuality) || "HD" });
                }
              }
            }
            for (const url of ((_c = investigation.findings) == null ? void 0 : _c.videoUrls) || []) {
              if (url && !seen.has(url)) {
                seen.add(url);
                results2.push({ url, server: "direct", quality: ((_d = provider.videos) == null ? void 0 : _d.defaultQuality) || "HD" });
              }
            }
            for (const url of ((_e = investigation.findings) == null ? void 0 : _e.serverUrls) || []) {
              if (url && !seen.has(url)) {
                seen.add(url);
                results2.push({ url, server: _detectServer(url), quality: ((_f = provider.videos) == null ? void 0 : _f.defaultQuality) || "HD" });
              }
            }
            for (const r of results2) {
              if (r.server !== "direct" && !r.url.includes(".mp4") && !r.url.includes(".m3u8")) {
                try {
                  const direct = yield resolveEmbed(r.url, pageUrl);
                  if (direct && isDirectVideoUrl(direct)) {
                    r.url = direct;
                    r.server = "direct";
                  }
                } catch (e) {
                }
              }
            }
            console.log(`[dynamic:video] ${provider.name} \u2192 ${results2.length} videos (${((_g = investigation.serverCatalog) == null ? void 0 : _g.length) || 0} servers, ${investigation.durationMs}ms)`);
            return results2;
          } catch (e) {
            console.warn(`[dynamic:video] ${provider.name} failed: ${e.message}`);
            return [];
          } finally {
            if (instance2) yield pool.release(instance2).catch(() => {
            });
          }
        });
      }
      _detectServer(url) {
        if (!url) return "unknown";
        if (/\.(mp4|m3u8|mkv|webm)(\?|$)/i.test(url)) return "direct";
        const servers = ["streamwish", "filemoon", "doodstream", "streamtape", "mixdrop", "upstream", "voe", "okru", "vidhide", "netu", "yourupload", "uqload", "mega"];
        const lower = url.toLowerCase();
        for (const s of servers) if (lower.includes(s)) return s;
        return "embed";
      }
    };
    var instance = null;
    function getDynamicEngine() {
      if (!instance) instance = new DynamicEngine();
      return instance;
    }
    module2.exports = { DynamicEngine, getDynamicEngine, search: (p, q) => getDynamicEngine().search(p, q), extractVideos: (p, u) => getDynamicEngine().extractVideos(p, u) };
  }
});

// src/engines/intelligent-engine.js
var require_intelligent_engine = __commonJS({
  "src/engines/intelligent-engine.js"(exports2, module2) {
    var cheerio = require("cheerio");
    var { StaticScraper, AutonomousScraper, SessionMemory, SmartAnalyzer, createBrowser, createPage, setupResourceBlocking } = require_intelligent();
    var { resolveEmbed, isDirectVideoUrl } = require_embed_resolver();
    function search(provider, query) {
      return __async(this, null, function* () {
        var _a, _b, _c, _d;
        const searchUrl = provider.baseUrl + provider.search.url.replace("{query}", encodeURIComponent(query));
        const ss = new StaticScraper();
        const analysis = yield ss.analyze(searchUrl);
        if (analysis.urlsFound === 0) return null;
        const querySlug = query.toLowerCase().replace(/\s+/g, "-");
        const allUrls = [
          ...((_a = analysis.findings) == null ? void 0 : _a.navigationUrls) || [],
          ...((_b = analysis.findings) == null ? void 0 : _b.serverUrls) || []
        ];
        const candidates = allUrls.filter((u) => {
          const lower = u.toLowerCase();
          return lower.includes(querySlug) || query.toLowerCase().split(/\s+/).every((w) => lower.includes(w));
        });
        if (candidates.length > 0) {
          candidates.sort((a, b) => a.length - b.length);
          return candidates[0];
        }
        try {
          const browser = yield createBrowser({ headless: true, stealth: true, timeout: 2e4 });
          const page = yield createPage(browser);
          yield setupResourceBlocking(page);
          const autonomous = new AutonomousScraper(page, {
            searchTerm: query,
            maxRequests: 20,
            maxDepth: 1
          });
          const investigation = yield autonomous.quickExtract(searchUrl);
          yield browser.close().catch(() => {
          });
          const discoveredUrls = [
            ...((_c = investigation.findings) == null ? void 0 : _c.navigationUrls) || [],
            ...((_d = investigation.findings) == null ? void 0 : _d.serverUrls) || []
          ];
          const matches = discoveredUrls.filter((u) => {
            const lower = u.toLowerCase();
            return lower.includes(querySlug) || query.toLowerCase().split(/\s+/).every((w) => lower.includes(w));
          });
          if (matches.length > 0) {
            matches.sort((a, b) => a.length - b.length);
            return matches[0];
          }
          return null;
        } catch (e) {
          console.warn(`[intelligent] Browser search failed: ${e.message}`);
          return null;
        }
      });
    }
    function extractVideos(provider, pageUrl) {
      return __async(this, null, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const results2 = [];
        const seen = /* @__PURE__ */ new Set();
        const ss = new StaticScraper();
        const analysis = yield ss.analyze(pageUrl);
        if (analysis.urlsFound === 0) return [];
        for (const server of analysis.serverCatalog || []) {
          for (const u of server.urls) {
            if (u.url && !seen.has(u.url) && u.type !== "unknown" && u.type !== "cdn" && u.type !== "tracking") {
              seen.add(u.url);
              results2.push({
                url: u.url,
                server: server.name !== "unknown" ? server.name : _detectServer2(u.url),
                quality: ((_a = provider.videos) == null ? void 0 : _a.defaultQuality) || "HD"
              });
            }
          }
        }
        for (const url of ((_b = analysis.findings) == null ? void 0 : _b.videoUrls) || []) {
          if (url && !seen.has(url)) {
            seen.add(url);
            results2.push({ url, server: _detectServer2(url), quality: ((_c = provider.videos) == null ? void 0 : _c.defaultQuality) || "HD" });
          }
        }
        for (const url of ((_d = analysis.findings) == null ? void 0 : _d.serverUrls) || []) {
          if (url && !seen.has(url)) {
            seen.add(url);
            results2.push({ url, server: _detectServer2(url), quality: ((_e = provider.videos) == null ? void 0 : _e.defaultQuality) || "HD" });
          }
        }
        if (results2.length === 0) {
          try {
            const browser = yield createBrowser({ headless: true, stealth: true, timeout: 2e4 });
            const page = yield createPage(browser);
            yield setupResourceBlocking(page);
            const autonomous = new AutonomousScraper(page, {
              maxRequests: 15,
              maxDepth: 1
            });
            const investigation = yield autonomous.investigate(pageUrl);
            yield browser.close().catch(() => {
            });
            for (const server of investigation.serverCatalog || []) {
              for (const u of server.urls) {
                if (u.url && !seen.has(u.url)) {
                  seen.add(u.url);
                  results2.push({
                    url: u.url,
                    server: server.name !== "unknown" ? server.name : _detectServer2(u.url),
                    quality: ((_f = provider.videos) == null ? void 0 : _f.defaultQuality) || "HD"
                  });
                }
              }
            }
            for (const url of ((_g = investigation.findings) == null ? void 0 : _g.videoUrls) || []) {
              if (url && !seen.has(url)) {
                seen.add(url);
                results2.push({ url, server: _detectServer2(url), quality: ((_h = provider.videos) == null ? void 0 : _h.defaultQuality) || "HD" });
              }
            }
          } catch (e) {
            console.warn(`[intelligent] Browser video extraction failed: ${e.message}`);
          }
        }
        for (const r of results2) {
          if (!r.url.includes(".mp4") && !r.url.includes(".m3u8") && r.url.startsWith("http")) {
            try {
              const direct = yield resolveEmbed(r.url, pageUrl);
              if (direct && isDirectVideoUrl(direct)) {
                r.url = direct;
                r.server = "direct";
              }
            } catch (e) {
            }
          }
        }
        return results2;
      });
    }
    function _detectServer2(url) {
      if (!url) return "unknown";
      if (/\.(mp4|m3u8|mkv|webm)(\?|$)/i.test(url)) return "direct";
      if (/magnet:/i.test(url)) return "torrent";
      const patterns = [
        "streamwish",
        "filemoon",
        "doodstream",
        "streamtape",
        "mixdrop",
        "upstream",
        "voe",
        "okru",
        "vidhide",
        "vidpro",
        "netu",
        "yourupload",
        "uqload",
        "mega",
        "jawcloud",
        "fembed",
        "gvideo"
      ];
      const lower = url.toLowerCase();
      for (const p of patterns) if (lower.includes(p)) return p;
      return "embed";
    }
    module2.exports = { search, extractVideos };
  }
});

// src/engines/router.js
var require_router = __commonJS({
  "src/engines/router.js"(exports2, module2) {
    var { getProviderMemory } = require_provider_memory();
    var StaticEngine;
    var DynamicEngine;
    var IntelligentEngine;
    function _loadEngines() {
      if (!StaticEngine) {
        StaticEngine = require_static_engine();
        DynamicEngine = require_dynamic_engine();
        IntelligentEngine = require_intelligent_engine();
      }
    }
    function execute(_0, _1) {
      return __async(this, arguments, function* (provider, phase, params = {}) {
        _loadEngines();
        const memory = getProviderMemory();
        const providerName = provider.name;
        let engineOrder = memory.getEngineOrder(providerName);
        const stats = memory.getProviderStats(providerName);
        if (!stats || stats.totalAttempts < 3) {
          engineOrder = ["static", "intelligent", "dynamic"];
        }
        console.log(`[router] ${providerName}/${phase} \u2192 order: ${engineOrder.join(" \u2192 ")}`);
        let lastError = null;
        let lastResult = null;
        for (const engine of engineOrder) {
          const start = Date.now();
          let result = null;
          try {
            switch (engine) {
              case "static":
                result = yield _executeStatic(provider, phase, params);
                break;
              case "dynamic":
                result = yield _executeDynamic(provider, phase, params);
                break;
              case "intelligent":
                result = yield _executeIntelligent(provider, phase, params);
                break;
              default:
                continue;
            }
            const duration = Date.now() - start;
            const success = _isResultValid(result, phase);
            memory.recordEngineAttempt(
              providerName,
              engine,
              phase,
              success,
              duration,
              _countResults(result, phase)
            );
            if (success) {
              console.log(`[router] ${providerName}/${phase} \u2713 ${engine} (${duration}ms)`);
              return { result, engine, duration, success: true };
            }
            console.log(`[router] ${providerName}/${phase} \u2717 ${engine} (${duration}ms) \u2192 falling back`);
            lastResult = result;
          } catch (e) {
            lastError = e;
            const duration = Date.now() - start;
            memory.recordEngineAttempt(providerName, engine, phase, false, duration, 0);
            console.log(`[router] ${providerName}/${phase} \u2717 ${engine} error: ${e.message}`);
          }
        }
        memory.recordEngineAttempt(providerName, "all", phase, false, 0, 0);
        return {
          result: lastResult || (phase === "search" ? null : []),
          engine: "none",
          duration: 0,
          success: false
        };
      });
    }
    function _executeStatic(provider, phase, params) {
      return __async(this, null, function* () {
        if (phase === "search") {
          return StaticEngine.search(provider, params.query);
        } else if (phase === "video") {
          return StaticEngine.extractVideos(provider, params.pageUrl);
        }
        return null;
      });
    }
    function _executeDynamic(provider, phase, params) {
      return __async(this, null, function* () {
        if (phase === "search") {
          return DynamicEngine.search(provider, params.query);
        } else if (phase === "video") {
          return DynamicEngine.extractVideos(provider, params.pageUrl);
        }
        return null;
      });
    }
    function _executeIntelligent(provider, phase, params) {
      return __async(this, null, function* () {
        if (phase === "search") {
          return IntelligentEngine.search(provider, params.query);
        } else if (phase === "video") {
          return IntelligentEngine.extractVideos(provider, params.pageUrl);
        }
        return null;
      });
    }
    function _isResultValid(result, phase) {
      if (!result) return false;
      if (phase === "search") {
        return typeof result === "string" && result.length > 10 && result.startsWith("http");
      } else if (phase === "video") {
        return Array.isArray(result) && result.length > 0;
      }
      return false;
    }
    function _countResults(result, phase) {
      if (phase === "search") return result ? 1 : 0;
      if (phase === "video") return Array.isArray(result) ? result.length : 0;
      return 0;
    }
    module2.exports = {
      execute,
      getProviderMemory
      // Expose for health checks
    };
  }
});

// src/engines/index.js
var staticEngine = require_static_engine();
var dynamicEngine = require_dynamic_engine();
var intelligentEngine = require_intelligent_engine();
var router = require_router();
module.exports = {
  // ─── Individual engines ────────────────────────────────────
  static: staticEngine,
  dynamic: dynamicEngine,
  intelligent: intelligentEngine,
  // ─── Smart router (recommended) ────────────────────────────
  execute: router.execute,
  getProviderMemory: router.getProviderMemory,
  // ─── Direct engine access (for testing/specific use) ───────
  searchStatic: staticEngine.search,
  extractStatic: staticEngine.extractVideos,
  searchDynamic: dynamicEngine.search,
  extractDynamic: dynamicEngine.extractVideos,
  searchIntelligent: intelligentEngine.search,
  extractIntelligent: intelligentEngine.extractVideos
};
