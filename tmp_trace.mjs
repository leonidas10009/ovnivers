import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Monkey-patch fetch to trace NoTorrent requests
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  console.log(`[FETCH] ${url.substring(0, 150)}`);
  return originalFetch(url, opts);
};

const ntPath = path.resolve(__dirname, 'providers/notorrent.js');
const mod = await import('file:///' + ntPath.replace(/\\/g, '/'));
const get = mod?.getStreams || mod?.default?.getStreams;

console.log('Exported keys:', Object.keys(mod || {}));
console.log('Has getStreams:', typeof get);

const data = await Promise.resolve(get('550', 'movie', 1, 1));
console.log('\nStreams:', data?.length);
if (data?.[0]) {
  console.log('First stream keys:', Object.keys(data[0]));
  console.log('Full first stream:', JSON.stringify(data[0], null, 2));
}
