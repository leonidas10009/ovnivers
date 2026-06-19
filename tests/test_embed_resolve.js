// Test embed resolution for all JKAnime servers
const { resolveEmbed } = require('../src/alfa-providers/embed-resolver');

const TESTS = [
  'https://sfastwish.com/e/0ky0tsum7i06',
  'https://voe.sx/e/2q1h5ufnacb3',
  'https://mixdrop.top/e/1n9rzzl9aj0rvx',
  'https://bysekoze.com/e/vb9x1bm0teag/',
  'https://dsvplay.com/e/fa48borpa4k4',
  'https://streamtape.com/e/WPdPzm104wFpDr/',
];

(async () => {
  console.log('Testing embed resolution (no browser)...\n');
  for (const url of TESTS) {
    const host = new URL(url).hostname;
    const start = Date.now();
    const result = await resolveEmbed(url);
    const ms = Date.now() - start;
    const ok = result && result.startsWith('http');
    console.log((ok ? 'OK ' : 'FAIL') + ' ' + host.padEnd(30) + ' ' + ms + 'ms');
    if (result) console.log('  -> ' + result.substring(0, 100));
  }
})();
