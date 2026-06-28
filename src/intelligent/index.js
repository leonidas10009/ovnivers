// intelligent/index.js — Barrel export for the intelligent scraping system
// Ported from sistem-scraper-lite core analysis + browser modules
// Zero new dependencies — uses existing cheerio + puppeteer-core + @sparticuz/chromium

const { SessionMemory, textSimilarity, getSessionMemory, resetSessionMemory } = require('./session-memory');
const { SmartAnalyzer, getSmartAnalyzer, resetSmartAnalyzer, KNOWN_SERVERS, URL_DOMAIN_KB } = require('./smart-analyzer');
const { SkeletonDetector } = require('./skeleton-detector');
const { StaticScraper } = require('./static-scraper');
const { getLogger, setLogLevel } = require('./logger');
const { createBrowser, createPage, findSystemChrome, findSparticuzChromium } = require('./launcher');
const { setupResourceBlocking, blockResourcesOnly } = require('./resource-blocker');
const { BrowserPool } = require('./browser-pool');
const { DynamicPageHandler } = require('./dynamic-handler');
const { PageTypeClassifier } = require('./page-type-classifier');
const { AutonomousScraper } = require('./autonomous-scraper');

module.exports = {
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
    const { getProviderMemory } = require('./provider-memory');
    return getProviderMemory();
  },
  resetProviderMemory: () => {
    const { resetProviderMemory } = require('./provider-memory');
    return resetProviderMemory();
  },
};
