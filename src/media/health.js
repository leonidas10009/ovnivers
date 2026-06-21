const CONSECUTIVE_FAIL_LIMIT = 5;
const COOLDOWN_MS = 5 * 60 * 1000;

const stats = new Map();

function init(id) {
  if (!stats.has(id)) {
    stats.set(id, {
      total: 0, ok: 0, fail: 0, failStreak: 0,
      totalMs: 0, lastOk: null, lastFail: null,
      disabledAt: null,
    });
  }
}

function track(id, success, timeMs = 0) {
  init(id);
  const s = stats.get(id);
  s.total++;
  s.totalMs += timeMs;
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
      avgMs: Math.round(s.totalMs / total),
      healthy: isHealthy(id),
      lastOk: s.lastOk ? new Date(s.lastOk).toISOString() : null,
      lastFail: s.lastFail ? new Date(s.lastFail).toISOString() : null,
    });
  }
  report.sort((a, b) => b.total - a.total);
  return report;
}

function getHealthyIds() {
  const ids = [];
  for (const [id] of stats) {
    if (isHealthy(id)) ids.push(id);
  }
  return ids;
}

function prune(maxAgeMs = 30 * 60 * 1000) {
  const now = Date.now();
  let pruned = 0;
  for (const [id, s] of stats) {
    const lastActivity = Math.max(s.lastOk || 0, s.lastFail || 0);
    if (lastActivity && now - lastActivity > maxAgeMs && s.total < 10) {
      stats.delete(id);
      pruned++;
    }
  }
  return pruned;
}

function resetAll() {
  stats.clear();
}

module.exports = { init, track, isHealthy, getReport, getHealthyIds, prune, resetAll, CONSECUTIVE_FAIL_LIMIT, COOLDOWN_MS };
