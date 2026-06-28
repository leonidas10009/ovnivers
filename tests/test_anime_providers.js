/**
 * Test específico para proveedores Alfa de anime
 * Verifica por qué JKAnime y otros no aparecen en resultados
 */
const path = require('path');

// Cargar Alfa providers
const scrapeAlfaProviders = require('./providers/web-providers');

// Probar con un anime conocido desde diferentes IDs
async function run() {
  const tests = [
    { desc: 'TMDB ID numérico (One Piece)', id: '37854', type: 'anime', season: 1, episode: 1 },
    { desc: 'Slug animeflv (One Piece)', id: 'animeflv:one-piece', type: 'anime', season: 1, episode: 1 },
    { desc: 'TMDB ID (Shingeki)', id: '1429', type: 'anime', season: 1, episode: 1 },
    { desc: 'Slug animeflv (Shingeki)', id: 'animeflv:shingeki-no-kyojin', type: 'anime', season: 1, episode: 1 },
  ];

  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 ${test.desc}`);
    console.log(`   ID: ${test.id}, type: ${test.type}, s${test.season}e${test.episode}`);
    console.log('='.repeat(60));

    try {
      const start = Date.now();
      const streams = await scrapeAlfaProviders(test.type, test.id, test.season, test.episode);
      const elapsed = Date.now() - start;

      console.log(`   ⏱ ${elapsed}ms`);
      console.log(`   📊 ${streams.length} streams`);

      // Agrupar por provider
      const byProvider = {};
      for (const s of streams) {
        const provider = s.name?.split('\n')[0] || 'unknown';
        if (!byProvider[provider]) byProvider[provider] = [];
        byProvider[provider].push(s);
      }

      for (const [provider, ss] of Object.entries(byProvider)) {
        console.log(`   ✅ ${provider}: ${ss.length} streams`);
      }

      if (streams.length === 0) {
        console.log('   ❌ Sin resultados — ningún proveedor encontró el contenido');
      }
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
  }
}

run().catch(console.error);
