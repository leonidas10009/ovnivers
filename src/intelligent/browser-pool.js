// browser-pool.js — Conservative browser connection pool for 512MB RAM
// Ported from sistem-scraper-lite/src/browser/BrowserPool.ts
// Config: min=0, max=1, idleTimeoutMs=30000 — optimized for Render free tier

const { randomUUID } = require('crypto');
const { getLogger } = require('./logger');

class BrowserPool {
  constructor(launchFn, options) {
    this.instances = [];
    this.waiting = [];
    this.launchFn = launchFn;
    this.options = Object.assign({ min: 0, max: 1, idleTimeoutMs: 30000 }, options);
    this.closed = false;
    this.cleanupTimer = null;
    this._startCleanup();
  }

  async acquire() {
    if (this.closed) throw new Error('BrowserPool is closed');

    const free = this.instances.find(function(inst) {
      return !inst.inUse && inst.browser.isConnected();
    });
    if (free) {
      free.inUse = true;
      free.lastUsedAt = Date.now();
      free.usageCount++;
      getLogger().debug({ id: free.id, usageCount: free.usageCount }, 'Browser acquired from pool');
      return free;
    }

    if (this.instances.length < this.options.max) {
      const instance = await this._createInstance();
      instance.inUse = true;
      return instance;
    }

    return new Promise(function(resolve) {
      this.waiting.push(resolve);
    }.bind(this));
  }

  async release(instance) {
    instance.inUse = false;
    instance.lastUsedAt = Date.now();
    getLogger().debug({ id: instance.id }, 'Browser released to pool');

    const next = this.waiting.shift();
    if (next) {
      instance.inUse = true;
      instance.usageCount++;
      next(instance);
    }
  }

  async destroyInstance(instance) {
    const idx = this.instances.indexOf(instance);
    if (idx !== -1) {
      this.instances.splice(idx, 1);
    }
    try {
      await instance.browser.close();
      getLogger().debug({ id: instance.id }, 'Browser instance destroyed');
    } catch { /* already closed */ }
  }

  async closeAll() {
    this.closed = true;
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    const log = getLogger();
    log.info({ count: this.instances.length }, 'Closing all browser instances');
    await Promise.allSettled(this.instances.map(function(inst) { return inst.browser.close(); }));
    this.instances = [];
    this.waiting = [];
  }

  getStats() {
    return {
      total: this.instances.length,
      inUse: this.instances.filter(function(i) { return i.inUse; }).length,
      free: this.instances.filter(function(i) { return !i.inUse && i.browser.isConnected(); }).length,
      waiting: this.waiting.length,
    };
  }

  async _createInstance() {
    const log = getLogger();
    log.info('Launching new browser instance');
    const browser = await this.launchFn();

    const instance = {
      id: randomUUID().slice(0, 8),
      browser: browser,
      inUse: false,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      usageCount: 0,
    };

    this.instances.push(instance);
    log.info({ id: instance.id, total: this.instances.length }, 'Browser instance created');
    return instance;
  }

  _startCleanup() {
    const self = this;
    this.cleanupTimer = setInterval(function() {
      self._cleanupIdle();
    }, 30000);

    if (this.cleanupTimer && typeof this.cleanupTimer.unref === 'function') {
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
      getLogger().debug({ id: inst.id, idleMs: now - inst.lastUsedAt }, 'Removing idle browser');
      this.destroyInstance(inst);
    }
  }
}

module.exports = { BrowserPool };
