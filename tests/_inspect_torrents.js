const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const cheerio = require('cheerio');

(async () => {
  // --- 1337x ---
  try {
    const r = await fetch('https://1337xx.to/search/fight+club/1/', {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(12000)
    });
    const html = await r.text();
    const $ = cheerio.load(html);
    const rows = $('table.table-list tbody tr');
    console.log('=== 1337x (' + rows.length + ' rows) ===');
    const f = rows.first();
    console.log('  Full first row TD count:', f.find('td').length);
    f.find('td').each((i, el) => console.log('  td[' + i + ']:', $(el).text().trim().substring(0, 80)));
    const nameEl = f.find('td.name a').eq(1);
    console.log('  Name href:', nameEl.attr('href'));
    console.log('  Name text:', nameEl.text().trim());
    const magUrl = f.find('a[href^="magnet:"]').length > 0 ? 'inline' : f.find('td a[href*="magnet"]').length > 0 ? 'need-follow' : 'NOT-FOUND';
    console.log('  Magnet:', magUrl);
  } catch (e) { console.log('1337x ERROR:', e.message); }

  // --- EZTV ---
  try {
    const r = await fetch('https://eztv.re/search/fight-club', {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(12000)
    });
    const html = await r.text();
    const $ = cheerio.load(html);
    const rows = $('table.forum_header_border tr.forum_header_border');
    console.log('\n=== EZTV (' + rows.length + ' rows) ===');
    if (rows.length > 0) {
      const f = rows.first();
      console.log('  TD count:', f.find('td').length);
      f.find('td').each((i, el) => console.log('  td[' + i + ']:', $(el).text().trim().substring(0, 80)));
    }
  } catch (e) { console.log('EZTV ERROR:', e.message); }

  // --- TPB ---
  try {
    const r = await fetch('https://thepiratebay.org/search.php?q=fight+club&cat=0', {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(12000)
    });
    const html = await r.text();
    console.log('\n=== TPB (HTML len=' + html.length + ') ===');
    console.log('  First 300 chars:', html.substring(0, 300));
  } catch (e) { console.log('TPB ERROR:', e.message); }

  // --- SolidTorrents ---
  try {
    const r = await fetch('https://solidtorrents.to/api/v1/search?q=fight+club', {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(12000)
    });
    const data = await r.json();
    console.log('\n=== SolidTorrents ===');
    console.log('  Results:', data.results?.length || data.total || '?');
    if (data.results?.[0]) {
      const f = data.results[0];
      console.log('  Keys:', Object.keys(f).join(', '));
      console.log('  First:', JSON.stringify(f).substring(0, 300));
    }
  } catch (e) { console.log('SolidTorrents ERROR:', e.message); }

  // --- LimeTorrents ---
  try {
    const r = await fetch('https://limetorrents.lol/search/all/fight+club/', {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(12000)
    });
    const html = await r.text();
    const $ = cheerio.load(html);
    const rows = $('table.table2 tr');
    console.log('\n=== LimeTorrents (' + rows.length + ' rows) ===');
    if (rows.length > 0) {
      const f = rows.eq(1); // skip header
      console.log('  TD count:', f.find('td').length);
      f.find('td').each((i, el) => console.log('  td[' + i + ']:', $(el).text().trim().substring(0, 80)));
    }
  } catch (e) { console.log('LimeTorrents ERROR:', e.message); }

  process.exit(0);
})();
