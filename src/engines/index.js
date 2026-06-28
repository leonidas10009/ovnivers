// engines/index.js — Barrel export for the multi-engine scraping system
// Static (cheerio) → Dynamic (Puppeteer) → Intelligent (auto-discover)
// With strategy learning via ProviderMemory

const staticEngine = require('./static-engine');
const dynamicEngine = require('./dynamic-engine');
const intelligentEngine = require('./intelligent-engine');
const router = require('./router');

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
  extractIntelligent: intelligentEngine.extractVideos,
};
