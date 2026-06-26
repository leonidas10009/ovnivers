// resource-blocker.js — Block images, media, fonts, stylesheets for faster scraping
// Ported from sistem-scraper-lite/src/browser/ResourceBlocker.ts
// Saves bandwidth and speeds up page loads by 2-3x

const BLOCKED_TYPES = ['image', 'media', 'font', 'stylesheet', 'ping'];

async function setupResourceBlocking(page) {
  await page.setRequestInterception(true);

  page.on('request', function(request) {
    const type = request.resourceType();
    if (BLOCKED_TYPES.includes(type)) {
      request.abort();
    } else {
      request.continue();
    }
  });
}

function blockResourcesOnly(req) {
  const type = req.resourceType();
  if (BLOCKED_TYPES.includes(type)) {
    req.abort();
  } else {
    req.continue();
  }
}

module.exports = { setupResourceBlocking, blockResourcesOnly, BLOCKED_TYPES };
