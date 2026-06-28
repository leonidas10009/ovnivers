/**
 * revive-providers.js — Analyze inactive Web Providers using the intelligent scraper system
 * 
 * Phase 1 (static): fetch+cheerio — checks domain health, extracts URLs, detects servers
 * Phase 2 (browser): puppeteer — for JS-heavy sites, clicks server buttons, deep extraction
 * 
 * Usage: node scripts/revive-providers.js [--browser] [--provider=name]
 */

const path = require('path');
const {
  StaticScraper, AutonomousScraper, SmartAnalyzer,
  createBrowser, createPage, setupResourceBlocking,
  getLogger, setLogLevel, KNOWN_SERVERS,
} = require('../src/intelligent');

setLogLevel('info');
const log = getLogger();

// ─── Load providers ──────────────────────────
const providers = require('../src/alfa-providers/providers');
const USE_BROWSER = process.argv.includes('--browser');
const TARGET = process.argv.find(a => a.startsWith('--provider='))?.split('=')[1];

async function analyzeProvider(provider) {
  const { name, title, baseUrl, active, categories, search } = provider;
  if (active && !TARGET) return null; // skip active unless targeted

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title} (${name}) — ${baseUrl}`);
  console.log(`  Status: ${active ? 'ACTIVE' : 'INACTIVE'} | Categories: ${categories.join(', ')}`);
  console.log(`${'='.repeat(60)}`);

  // ─── Phase 1: Static check ──────────────────
  console.log(`\n  [Phase 1] Static fetch...`);
  const staticS = new StaticScraper();
  let result;
  try {
    result = await staticS.analyze(baseUrl);
  } catch (e) {
    console.log(`  ✗ Static analysis error: ${e.message}`);
    return { name, title, baseUrl, alive: false, error: e.message };
  }

  console.log(`  Title: "${result.title}"`);
  console.log(`  Goal: ${result.goal} | URLs: ${result.urlsFound} | Time: ${result.durationMs}ms`);

  if (result.urlsFound === 0) {
    console.log(`  ✗ Site unreachable or empty response`);
    return { name, title, baseUrl, alive: false, reason: 'no response / empty' };
  }

  // Server catalog
  console.log(`\n  [Servers found: ${result.serverCatalog.length}]`);
  for (const s of result.serverCatalog.slice(0, 10)) {
    console.log(`    ${s.name.padEnd(18)} | ${s.urls.length} URLs | ${s.urls[0]?.type || '?'}`);
  }

  // Findings summary
  console.log(`\n  [URLs by type]`);
  console.log(`    video:     ${result.findings.videoUrls.length}`);
  console.log(`    embed:     ${result.findings.serverUrls.length}`);
  console.log(`    download:  ${result.findings.downloadUrls.length}`);
  console.log(`    navigation:${result.findings.navigationUrls.length}`);
  console.log(`    other:     ${result.findings.otherUrls.length}`);

  // Show sample video/embed URLs
  const sampleVideo = result.findings.videoUrls.slice(0, 3);
  const sampleEmbed = result.findings.serverUrls.slice(0, 3);
  if (sampleVideo.length) {
    console.log(`\n  [Sample video URLs]`);
    sampleVideo.forEach(u => console.log(`    ${u}`));
  }
  if (sampleEmbed.length) {
    console.log(`\n  [Sample embed URLs]`);
    sampleEmbed.forEach(u => console.log(`    ${u}`));
  }

  // Check if we can find search endpoints from navigation URLs
  const navUrls = result.findings.navigationUrls || [];
  const searchCandidates = navUrls.filter(u =>
    /search|buscar|busqueda|find|query|q=|\?s=/.test(u)
  );
  if (searchCandidates.length) {
    console.log(`\n  [Search URL candidates]`);
    searchCandidates.slice(0, 5).forEach(u => console.log(`    ${u}`));
  }

  // ─── Phase 2: Browser investigation (opt-in) ──────────────────
  let browserResult = null;
  if (USE_BROWSER && result.urlsFound > 0) {
    console.log(`\n  [Phase 2] Browser investigation...`);
    let browser;
    try {
      browser = await createBrowser({ headless: true });
      const page = await createPage(browser);
      await setupResourceBlocking(page);

      const autonomous = new AutonomousScraper(page, {
        maxRequests: 15,
        maxDepth: 1,
      });

      const investigation = await autonomous.investigate(baseUrl);
      console.log(`  Steps: ${investigation.steps?.length || 0} | Duration: ${investigation.durationMs}ms`);
      console.log(`  Browser servers: ${investigation.serverCatalog?.length || 0}`);
      
      for (const s of (investigation.serverCatalog || []).slice(0, 10)) {
        console.log(`    ${s.name.padEnd(18)} | ${s.urls.length} URLs`);
      }

      const bVideos = investigation.findings?.videoUrls || [];
      const bEmbeds = investigation.findings?.serverUrls || [];
      if (bVideos.length) {
        console.log(`\n  [Browser video URLs: ${bVideos.length}]`);
        bVideos.slice(0, 3).forEach(u => console.log(`    ${u}`));
      }
      if (bEmbeds.length) {
        console.log(`\n  [Browser embed URLs: ${bEmbeds.length}]`);
        bEmbeds.slice(0, 3).forEach(u => console.log(`    ${u}`));
      }

      browserResult = investigation;
    } catch (e) {
      console.log(`  ✗ Browser error: ${e.message}`);
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  // ─── Recommendation ──────────────────────────
  const totalServers = result.serverCatalog.length + (browserResult?.serverCatalog?.length || 0);
  const totalVideos = result.findings.videoUrls.length + (browserResult?.findings?.videoUrls?.length || 0);
  const totalEmbeds = result.findings.serverUrls.length + (browserResult?.findings?.serverUrls?.length || 0);

  let recommendation = 'KEEP_INACTIVE';
  if (totalVideos > 0 || totalEmbeds > 0) {
    recommendation = totalServers >= 2 ? 'REACTIVATE_DIRECT' : 'REACTIVATE_WITH_CAVEATS';
  } else if (result.urlsFound > 10 && navUrls.length > 0) {
    recommendation = 'NEEDS_SELECTOR_UPDATE';
  } else if (result.urlsFound > 0) {
    recommendation = 'JS_DEPENDENT_NEEDS_BROWSER';
  }

  console.log(`\n  → Recommendation: ${recommendation}`);
  console.log(`  → Servers: ${totalServers} | Videos: ${totalVideos} | Embeds: ${totalEmbeds}`);

  return {
    name, title, baseUrl,
    alive: true,
    goal: result.goal,
    urlsFound: result.urlsFound,
    staticServers: result.serverCatalog.length,
    videoUrls: totalVideos,
    embedUrls: totalEmbeds,
    searchCandidates: searchCandidates.slice(0, 5),
    recommendation,
  };
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     Web Providers Revival — Intelligent Analysis         ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nTotal providers: ${providers.length}`);
  console.log(`Active: ${providers.filter(p => p.active).length} | Inactive: ${providers.filter(p => !p.active).length}`);
  console.log(`Mode: ${USE_BROWSER ? 'Static + Browser' : 'Static only (use --browser for deep investigation)'}`);
  if (TARGET) console.log(`Target: ${TARGET}`);

  const inactive = TARGET
    ? providers.filter(p => p.name === TARGET || p.title === TARGET)
    : providers.filter(p => !p.active);

  if (inactive.length === 0) {
    console.log('\nNo inactive providers to analyze.');
    return;
  }

  console.log(`\nAnalyzing ${inactive.length} provider(s)...`);

  const results = [];
  for (let i = 0; i < inactive.length; i++) {
    console.log(`\n[${i + 1}/${inactive.length}]`);
    const r = await analyzeProvider(inactive[i]);
    results.push(r);
  }

  // ─── Summary ──────────────────────────────────
  console.log(`\n\n${'═'.repeat(60)}`);
  console.log('  SUMMARY');
  console.log(`${'═'.repeat(60)}`);

  const alive = results.filter(r => r.alive);
  const dead = results.filter(r => !r.alive);
  const reactivatable = alive.filter(r =>
    r.recommendation === 'REACTIVATE_DIRECT' || r.recommendation === 'REACTIVATE_WITH_CAVEATS'
  );
  const needsWork = alive.filter(r =>
    r.recommendation === 'NEEDS_SELECTOR_UPDATE' || r.recommendation === 'JS_DEPENDENT_NEEDS_BROWSER'
  );

  console.log(`\n  Dead/unreachable: ${dead.length}`);
  for (const d of dead) console.log(`    ✗ ${d.title.padEnd(20)} ${d.baseUrl} — ${d.reason || d.error}`);

  console.log(`\n  Reactivatable: ${reactivatable.length}`);
  for (const r of reactivatable) {
    console.log(`    ✓ ${r.title.padEnd(20)} ${r.baseUrl}`);
    console.log(`      Servers: ${r.staticServers} | Videos: ${r.videoUrls} | Embeds: ${r.embedUrls}`);
  }

  console.log(`\n  Needs work: ${needsWork.length}`);
  for (const n of needsWork) {
    console.log(`    ~ ${n.title.padEnd(20)} ${n.baseUrl} — ${n.recommendation}`);
  }

  console.log(`\n  KEEP_INACTIVE: ${alive.filter(r => r.recommendation === 'KEEP_INACTIVE').length}`);
}

main().catch(console.error);
