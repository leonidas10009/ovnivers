// health.js — Provider health tracking with circuit breaker + bayesian learning
// Enhanced with SessionMemory from src/intelligent for cross-session persistence
// Tracks: success/fail ratio, consecutive failures, avg response time
// Auto-disables providers after 5 consecutive failures, auto-reenables after 5 min
// NEW: Bayesian scoring via SessionMemory for smarter re-enable decisions

const CONSECUTIVE_FAIL_LIMIT = 5;
const COOLDOWN_MS = 5 * 60 * 1000;

const stats = new Map();
let _memory = null;

function _getMemory() {
  if (!_memory) {
    try { _memory = require('../intelligent').getSessionMemory(); }
    catch { _memory = null; }
  }
  return _memory;
}

function init(id) {
  if (!stats.has(id)) {
    stats.set(id, {
      total: 0, ok: 0, fail: 0, failStreak: 0,
      totalMs: 0, lastOk: null, lastFail: null,
      disabledAt: null,
    });
  }
}

function track(id, success, timeMs, metadata) {
  init(id);
  const s = stats.get(id);
  s.total++;
  s.totalMs += timeMs || 0;
  if (success) {
    s.ok++;
    s.failStreak = 0;
    s.lastOk = Date.now();
    s.disabledAt = null;
  } else {
    s.fail++;
    s.failStreak++;
    s.lastFail = Date.now();
    if (s.failStreak >= CONSECUTIVE_FAIL_LIMIT) {
      s.disabledAt = Date.now();
    }
  }

  // Also record to SessionMemory for cross-session bayesian learning
  const mem = _getMemory();
  if (mem && metadata) {
    try {
      const domain = metadata.domain || id;
      mem.setCurrentDomain(domain);
      mem.recordAttempt(
        metadata.selector || id,
        metadata.elementType || 'provider',
        metadata.action || 'scrape',
        success,
        success ? (metadata.urlsFound || 1) : 0,
        metadata.urlTypes || [],
        domain,
      );
    } catch { /* non-critical */ }
  }
}

function isHealthy(id) {
  const s = stats.get(id);
  if (!s) return true;
  if (s.failStreak >= CONSECUTIVE_FAIL_LIMIT) {
    if (s.disabledAt && Date.now() - s.disabledAt > COOLDOWN_MS) {
      s.failStreak = 0;
      s.disabledAt = null;
      return true;
    }
    return false;
  }
  return true;
}

// ─── NEW: Bayesian health score (0-1) using SessionMemory ───
function getBayesianScore(id) {
  const mem = _getMemory();
  if (!mem) return isHealthy(id) ? 0.8 : 0.1;

  const fp = mem.getDomainFingerprint(id);
  if (!fp) return isHealthy(id) ? 0.8 : 0.1;

  let s = 0, f = 0;
  for (const [, v] of fp.successfulClasses) s += v;
  for (const [, v] of fp.failedClasses) f += v;
  const total = s + f;
  if (total === 0) return isHealthy(id) ? 0.8 : 0.1;

  // Bayesian estimate with prior (alpha=1, beta=1)
  return (s + 1) / (total + 2);
}

// ─── NEW: Predict if a provider will succeed ─────────────────
function predictSuccess(id, elementType, elementClass) {
  const mem = _getMemory();
  if (!mem) return { estimatedSuccess: isHealthy(id) ? 0.8 : 0.1, confidence: 0 };

  return mem.predictSuccess(elementType || 'provider', elementClass || '', id);
}

// ─── NEW: Get learned top classes for a domain ───────────────
function getTopClasses(id, limit) {
  const mem = _getMemory();
  if (!mem) return [];
  return mem.getTopClassesForDomain(id, limit || 5);
}

// ─── NEW: Get known container domains ────────────────────────
function isKnownContainerDomain(domain) {
  const mem = _getMemory();
  if (!mem) return false;
  return mem.isKnownContainerDomain(domain);
}

function addContainerDomain(domain) {
  const mem = _getMemory();
  if (mem) mem.addContainerDomain(domain);
}

function getReport() {
  const report = [];
  for (const [id, s] of stats) {
    const total = s.total || 1;
    report.push({
      id,
      total: s.total,
      ok: s.ok,
      fail: s.fail,
      failStreak: s.failStreak,
      successRate: ((s.ok / total) * 100).toFixed(1) + '%',
      bayesianScore: Math.round(getBayesianScore(id) * 100) / 100,
      avgMs: Math.round(s.totalMs / total),
      healthy: isHealthy(id),
      lastOk: s.lastOk ? new Date(s.lastOk).toISOString() : null,
      lastFail: s.lastFail ? new Date(s.lastFail).toISOString() : null,
    });
  }
  report.sort(function(a, b) { return b.total - a.total; });
  return report;
}

function getHealthyIds() {
  const ids = [];
  for (const [id] of stats) {
    if (isHealthy(id)) ids.push(id);
  }
  return ids;
}

function prune(maxAgeMs) {
  const now = Date.now();
  let pruned = 0;
  for (const [id, s] of stats) {
    const lastActivity = Math.max(s.lastOk || 0, s.lastFail || 0);
    if (lastActivity && now - lastActivity > (maxAgeMs || 30 * 60 * 1000) && s.total < 10) {
      stats.delete(id);
      pruned++;
    }
  }
  return pruned;
}

function resetAll() {
  stats.clear();
  const mem = _getMemory();
  if (mem) mem.clear();
}

module.exports = {
  init, track, isHealthy, getReport, getHealthyIds, prune, resetAll,
  CONSECUTIVE_FAIL_LIMIT, COOLDOWN_MS,
  // New bayesian-enhanced API
  getBayesianScore, predictSuccess, getTopClasses,
  isKnownContainerDomain, addContainerDomain,
};
