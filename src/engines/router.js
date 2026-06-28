// engines/router.js — Multi-engine routing with strategy learning
// Decides which engine to use per provider based on ProviderMemory success rates
// Engine order: best-performing first, fallback chain on failure

const { getProviderMemory } = require('../intelligent/provider-memory');

// Engine imports (lazy to avoid circular deps)
let StaticEngine, DynamicEngine, IntelligentEngine;

function _loadEngines() {
  if (!StaticEngine) {
    StaticEngine = require('./static-engine');
    DynamicEngine = require('./dynamic-engine');
    IntelligentEngine = require('./intelligent-engine');
  }
}

/**
 * Multi-engine provider executor
 * Tries engines in order of past success, falls back to next on failure
 * 
 * @param {object} provider - Provider config from providers.js
 * @param {string} phase - 'search' | 'video'
 * @param {object} params - Phase-specific params
 * @param {string} params.query - Search query (for search phase)
 * @param {string} params.pageUrl - Page URL (for video phase)
 * @param {number} params.season - Season number
 * @param {number} params.episode - Episode number
 * @returns {object} { result, engine, duration, success }
 */
async function execute(provider, phase, params = {}) {
  _loadEngines();
  const memory = getProviderMemory();
  const providerName = provider.name;

  // Get recommended engine order based on past performance
  let engineOrder = memory.getEngineOrder(providerName);

  // For providers with NO history, ensure dynamic comes last (heaviest)
  const stats = memory.getProviderStats(providerName);
  if (!stats || stats.totalAttempts < 3) {
    // Default: static first (fast), intelligent second (auto-discover), dynamic last (heavy)
    engineOrder = ['static', 'intelligent', 'dynamic'];
  }

  console.log(`[router] ${providerName}/${phase} → order: ${engineOrder.join(' → ')}`);

  let lastError = null;
  let lastResult = null;

  for (const engine of engineOrder) {
    const start = Date.now();
    let result = null;

    try {
      switch (engine) {
        case 'static':
          result = await _executeStatic(provider, phase, params);
          break;
        case 'dynamic':
          result = await _executeDynamic(provider, phase, params);
          break;
        case 'intelligent':
          result = await _executeIntelligent(provider, phase, params);
          break;
        default:
          continue;
      }

      const duration = Date.now() - start;
      const success = _isResultValid(result, phase);

      // Record attempt for learning
      memory.recordEngineAttempt(
        providerName, engine, phase,
        success, duration,
        _countResults(result, phase)
      );

      if (success) {
        console.log(`[router] ${providerName}/${phase} ✓ ${engine} (${duration}ms)`);
        return { result, engine, duration, success: true };
      }

      console.log(`[router] ${providerName}/${phase} ✗ ${engine} (${duration}ms) → falling back`);
      lastResult = result;
    } catch (e) {
      lastError = e;
      const duration = Date.now() - start;
      memory.recordEngineAttempt(providerName, engine, phase, false, duration, 0);
      console.log(`[router] ${providerName}/${phase} ✗ ${engine} error: ${e.message}`);
    }
  }

  // All engines failed — return last result or empty
  memory.recordEngineAttempt(providerName, 'all', phase, false, 0, 0);
  return {
    result: lastResult || (phase === 'search' ? null : []),
    engine: 'none',
    duration: 0,
    success: false,
  };
}

// ─── Engine execution helpers ─────────────────────────────────

async function _executeStatic(provider, phase, params) {
  if (phase === 'search') {
    return StaticEngine.search(provider, params.query);
  } else if (phase === 'video') {
    return StaticEngine.extractVideos(provider, params.pageUrl);
  }
  return null;
}

async function _executeDynamic(provider, phase, params) {
  if (phase === 'search') {
    return DynamicEngine.search(provider, params.query);
  } else if (phase === 'video') {
    return DynamicEngine.extractVideos(provider, params.pageUrl);
  }
  return null;
}

async function _executeIntelligent(provider, phase, params) {
  if (phase === 'search') {
    return IntelligentEngine.search(provider, params.query);
  } else if (phase === 'video') {
    return IntelligentEngine.extractVideos(provider, params.pageUrl);
  }
  return null;
}

// ─── Result validation ────────────────────────────────────────

function _isResultValid(result, phase) {
  if (!result) return false;
  if (phase === 'search') {
    // Search: result should be a URL string
    return typeof result === 'string' && result.length > 10 && result.startsWith('http');
  } else if (phase === 'video') {
    // Video: result should be a non-empty array
    return Array.isArray(result) && result.length > 0;
  }
  return false;
}

function _countResults(result, phase) {
  if (phase === 'search') return result ? 1 : 0;
  if (phase === 'video') return Array.isArray(result) ? result.length : 0;
  return 0;
}

// ─── Public API ───────────────────────────────────────────────

module.exports = {
  execute,
  getProviderMemory, // Expose for health checks
};
