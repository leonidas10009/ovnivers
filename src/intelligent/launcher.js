// launcher.js — Chrome/Chromium auto-detection for Puppeteer
// Ported from sistem-scraper-lite/src/browser/launcher.ts
// Priority: System Chrome → @sparticuz/chromium → bundled puppeteer Chromium

const { existsSync } = require('fs');
const { getLogger } = require('./logger');

const KNOWN_CHROME_PATHS = {
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    (process.env.LOCALAPPDATA || '') + '\\Google\\Chrome\\Application\\chrome.exe',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
  linux: [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
  ],
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

async function findSparticuzChromium() {
  try {
    const Chromium = require('@sparticuz/chromium');
    if (Chromium && typeof Chromium.executablePath === 'function') {
      const path = await Chromium.executablePath();
      if (path) {
        const args = Chromium.args || [];
        return { path, args };
      }
    }
  } catch { /* not installed */ }
  return null;
}

async function createBrowser(config) {
  const log = getLogger();
  config = config || {};

  let puppeteer;
  try { puppeteer = require('puppeteer-core'); }
  catch { puppeteer = require('puppeteer'); }

  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--single-process',
    '--disable-zygote',
    '--no-zygote',
    '--memory-pressure-off',
    '--disable-features=TranslateUI',
    '--disable-extensions',
    '--disable-component-extensions-with-background-pages',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-default-apps',
    '--disable-breakpad',
    '--window-size=1280,720',
  ];

  if (config.stealth !== false) {
    launchArgs.push('--disable-blink-features=AutomationControlled');
  }

  const launchOptions = {
    headless: config.headless !== false,
    args: launchArgs,
    timeout: (config.timeout || 30000),
  };

  const systemChrome = findSystemChrome();
  if (systemChrome) {
    launchOptions.executablePath = systemChrome;
    log.info({ chromePath: systemChrome }, 'Browser: system Chrome');
  } else {
    const sparticuz = await findSparticuzChromium();
    if (sparticuz) {
      launchOptions.executablePath = sparticuz.path;
      if (sparticuz.args.length > 0) {
        launchOptions.args = [...sparticuz.args, ...launchArgs];
      }
      log.info({ path: sparticuz.path }, 'Browser: @sparticuz/chromium');
    } else {
      log.info('Browser: bundled Chromium (puppeteer)');
    }
  }

  const browser = await puppeteer.launch(launchOptions);
  log.info('Browser launched');
  return browser;
}

async function createPage(browser, config) {
  config = config || {};
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 720 });
  await page.setDefaultTimeout((config.timeout || 30000));

  if (config.stealth !== false) {
    await page.evaluateOnNewDocument(function() {
      Object.defineProperty(navigator, 'webdriver', { get: function() { return false; } });
      Object.defineProperty(navigator, 'plugins', { get: function() { return [1, 2, 3, 4, 5]; } });
      Object.defineProperty(navigator, 'languages', { get: function() { return ['es-ES', 'es', 'en-US', 'en']; } });
      window.chrome = { runtime: {} };
    });
  }

  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');

  return page;
}

module.exports = { createBrowser, createPage, findSystemChrome, findSparticuzChromium };
