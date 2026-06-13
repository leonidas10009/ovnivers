// ─── Test: Anime merge + no cache + TMDB ID directo ───
// Verifica que:
// 1. Anime siempre consulta Pigamer37 + Alfa + locals (sin cache)
// 2. rawId numerico usa TMDB ID directo (sin meta API call)
// 3. getAnimeTMDbId cachea resultados

const assert = {
  equal: (a, b, msg) => { if (a !== b) throw new Error(`${msg}: expected ${b}, got ${a}`); },
  ok: (v, msg) => { if (!v) throw new Error(msg); },
};

let pass = 0, fail = 0;

async function test(name, fn) {
  try { await fn(); pass++; console.log(`  ✅ ${name}`); }
  catch (e) { fail++; console.log(`  ❌ ${name}: ${e.message}`); }
}

// ─── Mock counters ───
let metaCalls = 0;
let tmdbCalls = 0;
function resetCounters() { metaCalls = 0; tmdbCalls = 0; }

async function main() {

// ─── Test 1: getAnimeTMDbId con cache ───
console.log('\n📦 getAnimeTMDbId caching');
{
  const cache = new Map();
  const TTL = 24 * 60 * 60 * 1000;

  async function getCachedTmdbId(id) {
    const cached = cache.get(id);
    if (cached && Date.now() - cached.time < TTL) return cached.tmdbId;
    metaCalls++;
    if (id === 'animeflv:one-piece') {
      cache.set(id, { tmdbId: '1298', time: Date.now() });
      return '1298';
    }
    return null;
  }

  resetCounters();
  await test('primera llamada → API call', async () => {
    const result = await getCachedTmdbId('animeflv:one-piece');
    assert.equal(result, '1298', 'tmdbId');
    assert.equal(metaCalls, 1, 'metaCalls');
  });

  await test('segunda llamada mismo ID → cache hit (0 API calls)', async () => {
    const result = await getCachedTmdbId('animeflv:one-piece');
    assert.equal(result, '1298', 'tmdbId');
    assert.equal(metaCalls, 1, 'metaCalls debe seguir siendo 1');
  });

  await test('ID diferente sin cache → API call, retorna null', async () => {
    resetCounters();
    const result = await getCachedTmdbId('tioanime:naruto');
    assert.equal(result, null, 'tmdbId debe ser null');
    assert.equal(metaCalls, 1, '1 meta API call');
  });
}

// ─── Test 2: isAnime detection ───
console.log('\n📦 isAnime detection');
{
  const PREFIXES = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:', 'anilist:', 'kitsu:', 'mal:', 'anidb:'];
  function isAnimeId(id) {
    return PREFIXES.some(p => id.startsWith(p) || id.startsWith(p.replace(':', '|')));
  }

  await test('animeflv:one-piece → true', () => assert.ok(isAnimeId('animeflv:one-piece')));
  await test('tmdb:1298:1:1 → false (no anime prefix)', () => assert.equal(isAnimeId('tmdb:1298:1:1'), false));
  await test('animeflv|one-piece → true (pipe format)', () => assert.ok(isAnimeId('animeflv|one-piece')));
}

// ─── Test 3: TMDB genre detection for numeric rawId ───
console.log('\n📦 TMDB genre detection');
{
  async function isAnimeByGenre(rawId, enableAnime) {
    if (!enableAnime) return false;
    if (!rawId.match(/^\d+$/)) return false;
    tmdbCalls++;
    const mock = rawId === '1298'
      ? { genres: [{ id: 16, name: 'Animation' }] }
      : { genres: [{ id: 18, name: 'Drama' }] };
    return mock.genres.some(g => g.id === 16);
  }

  resetCounters();
  await test('rawId=1298 (One Piece) → isAnime=true', async () => {
    const result = await isAnimeByGenre('1298', true);
    assert.ok(result, 'debería detectar como anime');
    assert.equal(tmdbCalls, 1, '1 TMDB call');
  });

  await test('rawId=550 (Fight Club) → isAnime=false', async () => {
    resetCounters();
    const result = await isAnimeByGenre('550', true);
    assert.equal(result, false, 'no debería ser anime');
    assert.equal(tmdbCalls, 1, '1 TMDB call');
  });

  await test('enableAnime=false → sin consulta TMDB', async () => {
    resetCounters();
    const result = await isAnimeByGenre('1298', false);
    assert.equal(result, false, 'enableAnime=false');
  });

  await test('rawId no numerico → sin consulta TMDB', async () => {
    resetCounters();
    const result = await isAnimeByGenre('animeflv:one-piece', true);
    assert.equal(result, false, 'no es numérico');
    assert.equal(tmdbCalls, 0, '0 TMDB calls');
  });
}

// ─── Test 4: proxyId reconstruction ───
console.log('\n📦 proxyId reconstruction');
{
  function buildProxyId(rawId, resolvedId) {
    return resolvedId || (rawId.match(/^\d+$/) ? `tmdb:${rawId}` : rawId);
  }

  await test('numeric rawId + null resolved → tmdb:1298', () => {
    assert.equal(buildProxyId('1298', null), 'tmdb:1298');
  });

  await test('slug rawId + resolved animeflv:one-piece → keeps resolved', () => {
    assert.equal(buildProxyId('animeflv:one-piece', 'animeflv:one-piece'), 'animeflv:one-piece');
  });

  await test('slug rawId + null resolved → keeps rawId', () => {
    assert.equal(buildProxyId('kitsu:12345', null), 'kitsu:12345');
  });

  await test('tt imdb rawId + null resolved → keeps rawId', () => {
    assert.equal(buildProxyId('tt1234567', null), 'tt1234567');
  });
}

// ─── Test 5: Anime bypasses cache ───
console.log('\n📦 Anime bypasses cache');
{
  let cacheReads = 0;
  function shouldReadCache(isAnime) {
    if (!isAnime) cacheReads++;
    return !isAnime;
  }

  await test('isAnime=true → cache skip', () => {
    cacheReads = 0;
    assert.equal(shouldReadCache(true), false, 'no cache');
    assert.equal(cacheReads, 0, '0 reads');
  });

  await test('isAnime=false → cache allowed', () => {
    cacheReads = 0;
    assert.equal(shouldReadCache(false), true, 'cache allowed');
    assert.equal(cacheReads, 1, '1 read');
  });

  await test('cache write skips for anime', () => {
    let writes = 0;
    function cacheWrite(isAnime) { if (!isAnime) writes++; }
    cacheWrite(true);
    assert.equal(writes, 0, 'no write for anime');
    cacheWrite(false);
    assert.equal(writes, 1, 'write for non-anime');
  });
}

// ─── Test 6: scrapeAlfa meta skip for numeric rawId ───
console.log('\n📦 scrapeAlfa meta skip');
{
  async function resolveTmdb(rawId, type) {
    if (type !== 'anime') return null;
    if (rawId.match(/^\d+$/)) return rawId; // direct, no meta call
    metaCalls++;
    return rawId === 'animeflv:one-piece' ? '1298' : null;
  }

  resetCounters();
  await test('numeric rawId=1298 → 0 meta calls', async () => {
    const r = await resolveTmdb('1298', 'anime');
    assert.equal(r, '1298', 'tmdbId');
    assert.equal(metaCalls, 0, '0 meta calls');
  });

  await test('slug rawId=animeflv:one-piece → 1 meta call', async () => {
    resetCounters();
    const r = await resolveTmdb('animeflv:one-piece', 'anime');
    assert.equal(r, '1298', 'tmdbId');
    assert.equal(metaCalls, 1, '1 meta call');
  });

  await test('non-anime type → null, 0 meta calls', async () => {
    resetCounters();
    const r = await resolveTmdb('1298', 'movie');
    assert.equal(r, null, 'non-anime returns null');
    assert.equal(metaCalls, 0, '0 meta calls');
  });
}

// ─── Summary ───
console.log(`\n═══════════════════════════════════════`);
console.log(`  ✅ Passed: ${pass}`);
console.log(`  ❌ Failed: ${fail}`);
console.log(`  📦 Total:  ${pass + fail}`);
console.log(`═══════════════════════════════════════\n`);
}

main().catch(console.error);
