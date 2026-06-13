const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const TMDB_KEY = 'd80ba92bc7cefe3359668d30d06f3305';

async function fetchTest(url, opts = {}) {
  const start = Date.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), opts.timeout || 10000);
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': '*/*', ...opts.headers },
      signal: ctrl.signal
    });
    clearTimeout(t);
    const ms = Date.now() - start;
    const text = await res.text().catch(() => '');
    return { ok: res.ok, status: res.status, ms, size: text.length, text: text.substring(0, 500) };
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - start, error: e.message };
  }
}

async function fetchJSON(url, opts = {}) {
  const r = await fetchTest(url, opts);
  if (!r.ok) return null;
  try { return JSON.parse(r.text); } catch { return null; }
}

const BACKEND_SCRAPERS = [
  { name: '2embed Vesy', url: 'https://streamsrcs.2embed.cc/vesy?tmdb=550' },
  { name: '2embed Vsrc', url: 'https://streamsrcs.2embed.cc/vsrc?imdb=tt0137523' },
  { name: 'VidSrc', url: 'https://vidsrc.rip/api/movie/550' },
  { name: 'EZTV', url: 'https://eztvx.to/search/tt0137523' },
  { name: 'Cuevana2', url: 'https://www.cuevana2espanol.net/search?q=fight+club' },
  { name: 'PoseidonHD', url: 'https://www.poseidonhd2.co/search?q=fight+club' },
];

const ALFA_PROVIDERS = [
  // Movies
  { name: 'AllCalidad', url: 'https://allcalidad.re' },
  { name: 'AllPeliculas', url: 'https://allpeliculas.se' },
  { name: 'AsiaLiveAction', url: 'https://asialiveaction.com' },
  { name: 'BlogHorror', url: 'https://bloghorror.com' },
  { name: 'Cine24H', url: 'https://cine24h.online' },
  { name: 'CineCalidad', url: 'https://www.cinecalidad.vg' },
  { name: 'CineLibreOnline', url: 'https://www.cinelibreonline.com' },
  { name: 'Cuevana2Espanol', url: 'https://www.cuevana2espanol.net' },
  { name: 'DeTodoPeliculas', url: 'https://detodopeliculas.nu' },
  { name: 'DivXTotal', url: 'https://divxtotal.foo' },
  { name: 'DonTorrent', url: 'https://dontorrent.support' },
  { name: 'DoramasFlix', url: 'https://doramasflix.co' },
  { name: 'DoramedPlay', url: 'https://doramedplay.net' },
  { name: 'EntrePeliculasYSeries', url: 'https://entrepeliculasyseries.nz' },
  { name: 'EstrenosCinesaa', url: 'https://www.estrenoscinesaa.com' },
  { name: 'FlizzMovies', url: 'https://flizzmovies.com' },
  { name: 'GenteClic', url: 'https://www.genteclic.com' },
  { name: 'Gnula', url: 'https://gnulahd.nu' },
  { name: 'GranTorrent', url: 'https://grantorrent.zip' },
  { name: 'HDFull', url: 'https://hdfull.today' },
  { name: 'HomeCine', url: 'https://www3.homecine.to' },
  { name: 'LegalmenteGratis', url: 'https://legalmentegratis.com' },
  { name: 'MiraPeliculas', url: 'https://ww2.dipelis.com' },
  { name: 'MiTorrent', url: 'https://mitorrent.mx' },
  { name: 'OsjoNosu', url: 'https://osjonosu.xyz' },
  { name: 'PeliCineHD', url: 'https://pelicinehd.com' },
  { name: 'PeliculasFlix', url: 'https://peliculasflix.co' },
  { name: 'Pelis182', url: 'https://pelis182.com' },
  { name: 'PelisForte', url: 'https://www1.pelisforte.se' },
  { name: 'PelisPedia', url: 'https://pelispedia.is' },
  { name: 'PoseidonHD', url: 'https://www.poseidonhd2.co' },
  { name: 'RetroTV', url: 'https://retrotv.org' },
  { name: 'SeriesKao', url: 'https://serieskao.top' },
  { name: 'TubeOnline', url: 'https://www.tubeonline.net' },
  { name: 'TubePelis', url: 'https://www.tubepelis.com' },
  { name: 'WolfMax4K', url: 'https://wolfmax4k.com' },
  { name: 'Yandispoiler', url: 'https://yandispoiler.net' },
  { name: 'ZonaLeros', url: 'https://www.zona-leros.com' },
  { name: 'Zoowomaniacos', url: 'https://zoowomaniacos.org' },
  { name: 'eCarteleraTrailers', url: 'https://www.ecartelera.com' },
  { name: 'HDFullS', url: 'https://www.hdfull.it' },
  { name: 'Cuevana2', url: 'https://www.cuevana2.run' },
  { name: 'SinPeli', url: 'https://www.sinpeli.com' },
  { name: 'PelisFlix', url: 'https://pelisflix2.bond' },
  { name: 'Cinemundo', url: 'https://ww3.cinemundo.online' },

  // Series
  { name: 'DoramasYT', url: 'https://www.doramasyt.com' },
  { name: 'EZTV', url: 'https://eztvx.to' },
  { name: 'FullSerieHD', url: 'https://seriesmega.org' },
  { name: 'LaCartoons', url: 'https://www.lacartoons.com' },
  { name: 'SeriesRetro', url: 'https://seriesretro.com' },
  { name: 'EstrenosDoramas', url: 'https://www26.estrenosdoramas.net' },

  // Anime
  { name: 'AnimeFLV', url: 'https://www3.animeflv.net' },
  { name: 'AnimeJara', url: 'https://animejara.net' },
  { name: 'AnimeJL', url: 'https://www.anime-jl.net' },
  { name: 'EstrenosAnime', url: 'https://estrenosanime.net' },
  { name: 'HackTorrent', url: 'https://hacktorrent.to' },
  { name: 'HenaoJara', url: 'https://henaojara.com' },
  { name: 'JKAnime', url: 'https://jkanime.net' },
  { name: 'LaMovie', url: 'https://la.movie' },
  { name: 'LatAnime', url: 'https://latanime.org' },
  { name: 'MundoDonghua', url: 'https://www.mundodonghua.com' },
  { name: 'PelisPanda', url: 'https://pelispanda.com' },
  { name: 'PelisPlus', url: 'https://ww3.pelisplus.to' },
  { name: 'RepelisHD', url: 'https://cinehdplus.gratis' },
  { name: 'SoloLatino', url: 'https://sololatino.net' },
  { name: 'TioAnime', url: 'https://tioanime.com' },
  { name: 'TioDonghua', url: 'https://tiodonghua.com' },
  { name: 'TVAnime', url: 'https://ww3.monoschinos3.com' },
  { name: 'VerAnime', url: 'https://ww3.animeonline.ninja' },
  { name: 'VerAnimeAssistant', url: 'https://veranimeassistant.com' },
  { name: 'VerOnline', url: 'https://veronline.tv' },
  { name: 'DoramasQueen', url: 'https://www.doramasqueen.com' },
  { name: 'Ennovelas', url: 'https://ennovelas.site' },

  // Documentaries
  { name: 'AreaDocumental', url: 'https://www.area-documental.com' },
  { name: 'DocumentalesOnline', url: 'https://www.documentales-online.com' },
  { name: 'EliteTorrent', url: 'https://elitetorrent.biz' },
  { name: 'MejorTorrent', url: 'https://www38.mejortorrent.eu' },
];

const OTHER_SERVICES = [
  { name: 'Pigamer37 (proxy)', url: 'https://pigamer37.alwaysdata.net/' },
  { name: 'TMDB API', url: 'https://api.themoviedb.org/3/movie/550?api_key=' + TMDB_KEY },
];

(async () => {
console.log('╔══════════════════════════════════════════════════════╗');
console.log('║     Ovnivers v1.2.7 — Complete Provider Test         ║');
console.log('╚══════════════════════════════════════════════════════╝\n');

  // ─── Backend Scrapers ───
  console.log('─── BACKEND SCRAPERS (6) ───\n');
  for (const s of BACKEND_SCRAPERS) {
    const r = await fetchTest(s.url);
    const icon = r.ok ? '✅' : '❌';
    const detail = r.ok ? `HTTP ${r.status} | ${r.size}B | ${r.ms}ms` : `ERROR: ${r.error || 'status ' + r.status}`;
    console.log(`${icon} ${s.name.padEnd(18)} ${detail}`);
  }

  // ─── Alfa Providers ───
  console.log(`\n─── ALFA PROVIDERS (${ALFA_PROVIDERS.length}) ───\n`);
  const results = { ok: [], fail: [], slow: [] };
  const BATCH = 8;

  for (let i = 0; i < ALFA_PROVIDERS.length; i += BATCH) {
    const batch = ALFA_PROVIDERS.slice(i, i + BATCH);
    const batchResults = await Promise.allSettled(
      batch.map(async (p) => {
        const r = await fetchTest(p.url, { timeout: 8000 });
        return { ...p, ...r };
      })
    );
    for (const br of batchResults) {
      if (br.status !== 'fulfilled') continue;
      const r = br.value;
      const icon = r.ok ? '✅' : '❌';
      const detail = r.ok
        ? `HTTP ${r.status} | ${r.ms}ms`
        : `ERROR: ${r.error || 'HTTP ' + r.status}`;
      console.log(`${icon} ${r.name.padEnd(22)} ${detail}`);
      if (r.ok) {
        if (r.ms > 5000) results.slow.push(r.name);
        else results.ok.push(r.name);
      } else {
        results.fail.push(r.name);
      }
    }
  }

  // ─── Other Services ───
  console.log('\n─── OTHER SERVICES ───\n');
  for (const s of OTHER_SERVICES) {
    const r = await fetchTest(s.url);
    const icon = r.ok ? '✅' : '❌';
    const detail = r.ok ? `HTTP ${r.status} | ${r.ms}ms` : `ERROR: ${r.error || 'status ' + r.status}`;
    console.log(`${icon} ${s.name.padEnd(22)} ${detail}`);
  }

  // ─── Summary ───
  console.log('\n═══════════════════════════════════════════════');
  console.log('                 SUMMARY');
  console.log('═══════════════════════════════════════════════');
  console.log(`  ✅ Accessible:  ${results.ok.length}`);
  console.log(`  🐢 Slow (>5s):  ${results.slow.length}`);
  console.log(`  ❌ Blocked:     ${results.fail.length}`);
  console.log(`  📦 Total:       ${ALFA_PROVIDERS.length}`);
  console.log('═══════════════════════════════════════════════');

  if (results.fail.length > 0) {
    console.log('\n❌ BLOCKED/DEAD PROVIDERS:');
    results.fail.forEach(n => console.log(`   - ${n}`));
  }
  if (results.slow.length > 0) {
    console.log('\n🐢 SLOW PROVIDERS (>5s):');
    results.slow.forEach(n => console.log(`   - ${n}`));
  }

  console.log('\n=== TEST COMPLETE ===');
})();
