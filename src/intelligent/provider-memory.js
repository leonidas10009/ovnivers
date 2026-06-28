// provider-memory.js — Provider-level strategy tracking on top of SessionMemory
// Tracks which engine (static/dynamic/intelligent) works best per provider
// Persists engine success rates, selector effectiveness, and optimal engine order

const { SessionMemory, getSessionMemory } = require('./session-memory');

class ProviderMemory {
  constructor() {
    this.session = getSessionMemory();
    this.providers = new Map(); // providerName → { engines: {}, selectors: {}, lastSuccess, totalAttempts, successCount }
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

    // Cross-feed to session memory for domain-level learning
    if (success && resultsCount > 0) {
      this.session.recordAttempt(engine, 'provider', phase, success, resultsCount, [], providerName);
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
      // No data yet — return default order: static → intelligent → dynamic
      return ['static', 'intelligent', 'dynamic'];
    }

    const scored = Object.entries(p.engines).map(([name, stats]) => {
      const total = stats.successes + stats.failures;
      const rate = total > 0 ? stats.successes / total : 0;
      const confidence = Math.min(total / 5, 1); // Need 5+ attempts for full confidence
      return {
        engine: name,
        successRate: rate,
        confidence,
        score: rate * confidence,
        successes: stats.successes,
        failures: stats.failures,
        avgDuration: stats.avgDuration,
      };
    });

    // Sort: prefer engines with high success rate AND high confidence
    // Penalize slow engines slightly (dynamic/intelligent are slower)
    scored.sort((a, b) => {
      const scoreA = a.score - (a.engine !== 'static' ? 0.05 : 0);
      const scoreB = b.score - (b.engine !== 'static' ? 0.05 : 0);
      return scoreB - scoreA;
    });

    return scored.map(s => s.engine);
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
        phases: e.phases,
      };
    }

    return {
      name: providerName,
      totalAttempts: p.totalAttempts,
      successRate: p.totalAttempts > 0 ? Math.round(p.successCount / p.totalAttempts * 100) : 0,
      lastDuration: p.lastDuration,
      recommendedOrder: this.getEngineOrder(providerName),
      engines,
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
    return Object.entries(p.selectors)
      .map(([sel, s]) => ({
        selector: sel,
        successRate: (s.successes + s.failures) > 0 ? s.successes / (s.successes + s.failures) : 0,
        attempts: s.successes + s.failures,
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);
  }

  // ─── Persistence ─────────────────────────────────────────────
  _autoSave() {
    // Save every 10th provider attempt
    let total = 0;
    for (const p of this.providers.values()) total += p.totalAttempts;
    if (total % 10 === 0) {
      this.session.forceSave();
      this._saveProviderData();
    }
  }

  _saveProviderData() {
    try {
      const { writeFileSync } = require('fs');
      const { join } = require('path');
      const data = {};
      for (const [name, p] of this.providers) {
        data[name] = {
          totalAttempts: p.totalAttempts,
          successCount: p.successCount,
          lastDuration: p.lastDuration,
          engines: p.engines,
          selectors: p.selectors,
        };
      }
      writeFileSync(
        join(process.cwd(), '.provider-memory.json'),
        JSON.stringify(data, null, 2)
      );
    } catch { /* silent */ }
  }

  _loadProviderData() {
    try {
      const { existsSync, readFileSync } = require('fs');
      const { join } = require('path');
      const path = join(process.cwd(), '.provider-memory.json');
      if (!existsSync(path)) return;
      const raw = readFileSync(path, 'utf-8');
      const data = JSON.parse(raw);
      for (const [name, p] of Object.entries(data)) {
        this.providers.set(name, {
          totalAttempts: p.totalAttempts || 0,
          successCount: p.successCount || 0,
          lastDuration: p.lastDuration || 0,
          engines: p.engines || {},
          selectors: p.selectors || {},
        });
      }
    } catch { /* silent */ }
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
    return this.getAllStats().filter(s => s.totalAttempts >= minAttempts);
  }

  getFailingProviders(minAttempts = 3) {
    return this.getAllStats().filter(s => s.totalAttempts >= minAttempts && s.successRate < 30);
  }

  _emptyProvider() {
    return {
      engines: {},
      selectors: {},
      lastDuration: 0,
      totalAttempts: 0,
      successCount: 0,
    };
  }
}

// Singleton
let instance = null;

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

module.exports = { ProviderMemory, getProviderMemory, resetProviderMemory };
