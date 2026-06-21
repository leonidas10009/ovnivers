// Comprehensive content audit: per-provider server details + dedup analysis
const http = require('http');
const PORT = process.env.PORT || 3000;

function getJSON(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${path}`, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    }).on('error', reject);
  });
}

function serverFromUrl(url) {
  if (!url) return '?';
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const known = {
      'mp4upload.com': 'MP4Upload', 'streamtape.com': 'StreamTape',
      'streamwish.to': 'StreamWish', 'filemoon.sx': 'FileMoon',
      'vidhide.com': 'VidHide', 'doodstream.com': 'DoodStream',
      'ok.ru': 'OkRu', 'mega.nz': 'Mega', 'yourupload.com': 'YourUpload',
      '1fichier.com': '1Fichier', 'pixeldrain.com': 'PixelDrain',
      'player.zilla-networks.com': 'ZillaHLS', 'fastream.to': 'Fastream',
      'hgcloud.to': 'HGCloud', 'hqq.tv': 'HQQ', 'netu.tv': 'NetuTV',
      'embedsb.com': 'StreamSB', 'vidcache.net': 'VidCache',
      'nika.playmudos.com': 'NikaHLS', 'jkanime.net': 'JKPlayer',
      'drive.google.com': 'GDrive', 'mediafire.com': 'MediaFire',
    };
    for (const [domain, name] of Object.entries(known)) {
      if (host.includes(domain)) return name;
    }
    return host.split('.')[0];
  } catch { return '?'; }
}

async function auditStreams(path, label) {
  const result = await getJSON(path);
  if (!result?.streams?.length) {
    console.log(`\n${label}: 0 streams`);
    return;
  }
  
  const streams = result.streams;
  console.log(`\n${'='.repeat(70)}`);
  console.log(`${label}: ${streams.length} streams`);
  console.log(`${'='.repeat(70)}`);
  
  // Group by provider
  const byProvider = {};
  streams.forEach(s => {
    const name = (s.name || '').replace(/\n/g, ' | ');
    const parts = name.split(' | ');
    const provider = parts[0].replace(/[^\w\s]/g, '').trim();
    const quality = parts[1] || '?';
    const isDirect = !s.behaviorHints?.notWebReady;
    const server = s.url ? serverFromUrl(s.url) : (s.infoHash ? 'Torrent' : (s.externalUrl ? 'Browser' : '?'));
    const urlShort = (s.url || s.infoHash || s.externalUrl || '').substring(0, 50);
    
    if (!byProvider[provider]) byProvider[provider] = [];
    byProvider[provider].push({ provider, quality, server, isDirect, url: urlShort, flags: (name.match(/[\u{1F1E6}-\u{1F1FF}]{2,}/ug)||[]).join('') });
  });
  
  // Show per provider
  const provKeys = Object.keys(byProvider).sort();
  let totalDirect = 0, totalEmbed = 0, totalTorrent = 0;
  
  provKeys.forEach(provider => {
    const items = byProvider[provider];
    const servers = [...new Set(items.map(i => i.server))];
    const directCount = items.filter(i => i.isDirect).length;
    const embedCount = items.filter(i => !i.isDirect && !items.find(x => x.server === 'Torrent')).length;
    
    console.log(`\n  ▸ ${provider} (${items.length} streams, ${servers.length} servers)`);
    
    // Group by server within provider
    const byServer = {};
    items.forEach(i => {
      if (!byServer[i.server]) byServer[i.server] = [];
      byServer[i.server].push(i);
    });
    
    Object.entries(byServer).forEach(([server, serverItems]) => {
      const dupCount = serverItems.length;
      const marker = dupCount > 1 ? ` ⚠️ x${dupCount}` : '';
      const dir = serverItems[0].isDirect ? '📺' : (server === 'Torrent' ? '🧲' : '🌐');
      console.log(`    ${dir} ${server.padEnd(14)} ${serverItems[0].quality.padEnd(6)} ${serverItems[0].flags} ${serverItems[0].url.substring(0, 45)}${marker}`);
    });
    
    totalDirect += directCount;
    totalEmbed += embedCount;
  });
  
  console.log(`\n  📊 Direct:${streams.filter(s => !s.behaviorHints?.notWebReady).length} | Embed:${streams.filter(s => s.behaviorHints?.notWebReady && !s.infoHash).length} | Torrent:${streams.filter(s => s.infoHash).length} | Browser:${streams.filter(s => s.externalUrl).length}`);
}

async function main() {
  console.log('🔍 Ovnivers Content Audit\n');
  
  await auditStreams('/stream/movie/tmdb:550.json', '🎬 Fight Club (tmdb:550)');
  await auditStreams('/stream/movie/tt0137523.json', '🎬 Fight Club [Cinemeta] (tt0137523)');
  await auditStreams('/stream/series/tmdb:1396:1:1.json', '📺 Breaking Bad S01E01 (tmdb:1396)');
  await auditStreams('/stream/anime/ovn-anime:46260:1:1.json', '🎌 Naruto S01E01 (ovn-anime:46260)');
  await auditStreams('/stream/series/tt0409591:1:1.json', '🎌 Naruto S01E01 [Cinemeta] (tt0409591)');
  await auditStreams('/stream/series/tmdb:37854:1:1.json', '🎌 One Piece S01E01 (tmdb:37854)');
  await auditStreams('/stream/anime/tmdb:82684:2:1.json', '🎌 Slime S4E01 (tmdb:82684)');
  
  console.log(`\n${'='.repeat(70)}`);
  console.log('✅ Audit complete');
}
main().catch(e => console.error(e.message));
