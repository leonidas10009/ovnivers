// intelligent/browser-pool-singleton.js — UNIFIED browser pool for the entire app
// Replaces 5 independent browser management systems with ONE shared pool
// All modules acquire/release from this single instance
// Config: max 2 browsers, 5min idle timeout (1GB container, ~200MB per Chromium)

const { BrowserPool, createBrowser } = require('./index');

let pool = null;

function getSharedPool() {
  if (!pool) {
    pool = new BrowserPool(
      () => createBrowser({ headless: true, stealth: true, timeout: 30000 }),
      {
        min: 0,
        max: 2,           // 2 browsers — parallel Puppeteer for Cloudflare bypass + anime resolvers
        idleTimeoutMs: 5 * 60 * 1000, // 5 min idle → close
      }
    );
    console.log('[browser] Shared pool created (max: 2, idle: 5min)');
  }
  return pool;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (pool) {
    console.log('[browser] Closing shared pool...');
    await pool.closeAll();
    pool = null;
  }
});

module.exports = { getSharedPool };
