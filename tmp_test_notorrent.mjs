import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test NoTorrent with a movie, tv, and anime tmdb id
const tests = [
  { label: 'MOVIE 550', type: 'movie', id: '550' },
  { label: 'SERIES 1399', type: 'tv', id: '1399', season: 1, episode: 1 },
  { label: 'ANIME (tv) 1429', type: 'tv', id: '1429', season: 1, episode: 1 },
];

const notorrentPath = path.resolve(__dirname, 'providers/notorrent.js');
const mod = await import('file:///' + notorrentPath.replace(/\\/g, '/'));
const getStreams = mod?.getStreams || mod?.default?.getStreams;

if (!getStreams) {
  console.log('No getStreams found');
  process.exit(1);
}

for (const tc of tests) {
  console.log(`\n─── ${tc.label} ───`);
  try {
    const data = await Promise.resolve(getStreams(tc.id, tc.type, tc.season, tc.episode));
    const streams = Array.isArray(data) ? data : [];
    console.log(`  Streams: ${streams.length}`);
    for (let i = 0; i < Math.min(streams.length, 5); i++) {
      const s = streams[i];
      const keys = Object.keys(s).filter(k => s[k] != null && s[k] !== '');
      console.log(`  [${i}] keys: ${keys.join(', ')}`);
      console.log(`      name: ${JSON.stringify(s.name)}`);
      console.log(`      title: ${JSON.stringify(s.title)}`);
      console.log(`      url: ${(s.url || '').substring(0, 80)}`);
      console.log(`      quality: ${s.quality || '-'}`);
      console.log(`      infoHash: ${s.infoHash || '-'}`);
    }
  } catch(e) {
    console.log(`  ERROR: ${e.message}`);
  }
}
