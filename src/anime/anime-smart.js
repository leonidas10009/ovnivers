// anime-smart.js — SmartAnalyzer + SessionMemory integration for native anime scrapers
// Enhances jkanime, tioanime, animeflv, animeav1 with intelligent URL classification
// Does NOT replace the scrapers — augments them

const { getSmartAnalyzer } = require('../intelligent');
const { getSessionMemory } = require('../intelligent');

function enhanceStream(stream, sourceName) {
  if (!stream || !stream.url) return stream;

  const ai = getSmartAnalyzer();
  const mem = getSessionMemory();

  try {
    // 1. Classify URL type
    const cls = ai.classifyURL(stream.url);
    stream._urlType = cls.type;
    stream._isContainer = cls.isContainer;

    // 2. Auto-detect server name if missing or generic
    if (!stream.server || stream.server === 'Unknown' || stream.server === 'CDN') {
      const domain = ai.extractDomain(stream.url);
      const detected = ai.inferServerName(domain);
      if (detected && detected !== domain) {
        stream.server = detected;
      }
    }

    // 3. Filter tracking/social URLs
    if (cls.type === 'tracking' || cls.type === 'social') {
      stream._filtered = true;
      stream._filterReason = cls.type;
      return stream; // Caller should filter these out
    }

    // 4. Track in session memory
    if (sourceName) {
      const domain = ai.extractDomain(stream.url);
      mem.setCurrentDomain(domain);
      mem.recordAttempt(
        sourceName + ':' + (stream.server || domain),
        cls.type,
        'scrape',
        true,
        1,
        [cls.type, stream.url],
        domain,
      );
    }

    // 5. Determine if embed needs further resolution
    if (cls.type === 'embed' && cls.isContainer) {
      stream._needsResolution = true;
    } else if (cls.type === 'direct-video' || cls.type === 'stream') {
      stream._needsResolution = false;
      if (stream.behaviorHints) stream.behaviorHints.notWebReady = false;
    }
  } catch { /* non-critical */ }

  return stream;
}

function filterStreams(streams) {
  return streams.filter(function(s) {
    return !s._filtered;
  });
}

function getServerStats(sourceName) {
  const mem = getSessionMemory();
  const scores = mem.getAdaptiveScores();
  return {
    totalAttempts: mem.totalAttempts || 0,
    successRate: Math.round(mem.getSuccessRate() * 100),
    topClasses: scores.currentFingerprint ? scores.currentFingerprint.topClasses : [],
    predictions: scores.predictions || [],
  };
}

module.exports = { enhanceStream, filterStreams, getServerStats };
