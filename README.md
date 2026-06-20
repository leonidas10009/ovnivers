# Ovnivers — Stream Provider v1.13.8

Addon para **Stremio / NuvioTV** con catálogo, meta y streams de múltiples fuentes.

> **v1.13.1:** Puppeteer multi-plataforma (system Chrome Windows/Linux + @sparticuz/chromium Render). Embed-resolver mejorado (MP4Upload directo, Streamtape V2, MixDrop V2). AnimeJara reactivado (15 streams, 8 servidores). Local scrapers Android-optimizados (7 providers). 8/11 Hermes anime funcionales. Auditoría completa 75 providers.

## Instalacion

1. Abri **Stremio** (Desktop o NuvioTV) > **Settings** > **Addons**
2. Ve al panel de configuracion: [https://ovnivers.onrender.com/configure](https://ovnivers.onrender.com/configure)
3. Configura preferencias (idiomas, calidad, scrapers) → **Generate Install URL**
4. Click **Copy URL** y pégalo en Stremio (Install from URL); o usa el botón **Open in Stremio**
5. Navega películas/series desde cualquier catálogo (TMDB Community, Torrentio, o los catálogos propios del addon)
6. Los streams aparecen en **Streaming sources** al abrir el detalle de un título

## Features

| Funcionalidad | Detalle |
|---|---|
| **Torrent indexers** (6 fuentes) | GloDLS, Nyaa.si, SolidTorrents, LimeTorrents, 1337x, EZTV — ~70+ magnets por búsqueda |
| **Scrapers anime (Puppeteer)** | JKAnime (10 streams → 5 ExoPlayer), TioAnime (12 streams), AnimeAV1. Browser multi-plataforma: system Chrome en Windows/Linux, @sparticuz/chromium en Render. Cache 30min |
| **Pigamer37** (proxy anime) | AnimeFLV, AnimeAV1, TioAnime, Henaojara — 6-7 mp4 directos por fuente |
| **Alfa Providers** | 74 providers (42 activos). 6 funcionales: CineCalidad, CineLibreOnline, PelisPedia, DivXTotal, AnimeJara, JKAnime |
| **Hermes scrapers** | 58 scrapers en manifest (39 activos, 19 deshabilitados). 8 anime funcionales: animetsu, allwish, anikototv, anime-sama, allanime, animesalt, animeworld, onetouchtv. 3 deshabilitados por 0 streams |
| **Local scrapers** | 7 providers Android-optimizados (fetch + regex, pool 3 conexiones, max 15 streams). MiraPeliculas, AnimeJara, AnimeJL, HDFull, PelisForte, Zoowomaniacos, EstrenosDoramas |
| **Embed resolver** | 15+ dominios con resolvers específicos. MP4Upload (URL directa), Streamtape V2, MixDrop V2, Filelions, Uqload, Streamwish, OkRu, JWPlayer y genérico. Sin dependencia de Puppeteer |
| **notWebReady automático** | m3u8/mp4/torrent → ExoPlayer directo, resto → browser |
| **Config panel** | `/configure` — tipos, calidad, idiomas, scrapers on/off |
| **Proxy inteligente** | Cloudflare Worker v2 con cookie jar, bypass list para dominios Anubis |

## Catalogs

**28 catálogos**: 16 películas + 4 series + 8 anime (TMDB, Kitsu, búsquedas locales).

| Tipo | Cantidad | Ejemplos |
|------|----------|----------|
| Películas | 16 | Populares, Mejor Valoradas, Tendencia, Acción, Comedia, Drama, Terror, Ciencia Ficción, Suspenso, Romance, Animación, Anime Movies, Universal |
| Series | 4 | Populares, Mejor Valoradas, Tendencia, Universal |
| Anime | 8 | TMDB (Popular/Top/Tendencia/Películas), Kitsu Trending, AnimeFLV OnAir, JKAnime (buscar), TioAnime (buscar) |
| Búsqueda | 1 | TMDB Search |
| Anime | 6 | Popular, Mejor Valorado, Tendencia (TMDB), **Anime Kitsu**, Anime en Emisión, Universal |
| Búsqueda | 1 | Búsqueda global (TMDB + Kitsu) |

IDs: `ovn:`, `ovn-anime:`, `kitsu:`, `tt:`, `tmdb:` para compatibilidad cross-addon.

## Alfa Providers (74 registrados, 42 activos)

Scraper unificado del addon **Alfa** de Kodi. Corre server-side en Node.js.
Busca con multiples variantes del titulo (EN/ES/JA/slug) en paralelo.

Tras cada fetch de embed, se ejecuta el resolvedor `tryResolveEmbedToDirect()` que extrae URLs directas (`.m3u8`/`.mp4`) del HTML. Si tiene exito, el stream se marca `notWebReady: false` (reproducible en ExoPlayer). Si falla, se conserva la URL embed con `notWebReady: true`.

### Estado real (audit 2026-06-15)

| Categoria | Count | Detalle |
|---|---|---|
| **Funcionando** | 4 | CineCalidad (5 videos), PelisPedia (3), DivXTotal (1 torrent), SeriesKao (1, anime). DonTorrent requiere fix de cookie Anubis. |
| **Cloudflare Turnstile** | 8 | detodopeliculas, doramasflix, doramedplay, pelicinehd, doramasyt, henaojara, sololatino, tiodonghua |
| **Anubis PoW** | 1 | DonTorrent — bypass SHA256 directo |
| **Deshabilitados shortener** | 2 | GranTorrent, MiTorrent (anti-bot super-enlace.com / acortalink.net) |
| **Deshabilitados SPA/JS** | 2 | AllCalidad (React SPA), Yandispoiler (JS dinámico) |
| **Deshabilitados YouTube** | 2 | CineLibreOnline, DocumentalesOnline |
| **Deshabilitados caídos** | 6 | cine24h, gnula, pelisforte, animeflv, repelishd, lacartoons (404), entrepeliculasyseries (Cloudflare) |
| **Deshabilitados bloqueados** | 3 | mirapeliculas, tubeonline, tubepelis |
| **0 videos extraidos** | 6 | bloghorror, genteclic, gnula, legalmentegratis, poseidonhd, tubeonline, tubepelis, yandispoiler, fullseriehd, seriesretro |
| **Sin resultados** | 4 | hacktorrent, pelispanda, areadocumental, mejortorrent |

### Causas raiz

1. **Cloudflare Turnstile (12 providers):** CAPTCHA que requiere JavaScript en navegador real. Sin solucion server-side.
2. **URL shorteners con anti-bot (2 providers):** GranTorrent y MiTorrent usan `super-enlace.com` y `acortalink.net` con formularios POST protegidos que redirigen a Google cuando se accede desde cualquier cliente automatizado (incluido navegador headless con stealth). No son resolubles localmente sin servicio de scraping remoto.
3. **URL shortener funcional (1 provider):** DivXTotal expone tanto `short-info.link` como `download_tt.php?u=<base64>`. El link base64 se decodifica y descarga directamente, devolviendo infoHash real.
4. **SPA React (1 provider):** AllCalidad carga resultados completamente en cliente. Su API REST solo devuelve el post por defecto de WordPress. Desactivado.

## Hermes Scrapers (61 registrados: 42 activos, 19 deshabilitados)

> **Descubrimiento de auditoría:** `manifest.json` tiene **62** entradas en `scrapers`, pero una de ellas es el bridge `alfa-providers` (que agrupa 74 providers reales). Los **61** restantes son los scrapers Hermes legacy: **42 activos** + **19 deshabilitados**. El conteo "43 activos" que aparecía antes incluía erróneamente el bridge `alfa-providers`.

Scrapers legacy del ecosistema Nuvio/Hermes. Mayormente ofuscados (`_0x` obfuscation).

### Estado real (audit 2026-06-15)

| Categoria | Count | Detalle |
|---|---|---|
| **Funcionando** | 9 | MovieBlast, Movix VF, PlayIMDb, StreamFlix, TopCartoons, Torrentio, MultiVid, VidLink, CorsaroViola |
| **Completan pero 0 streams** | 15 | 4KHDHub-NEW, CineFreak, Dahmermovies, FibWatch, HindMoviez, MoviesDrive, MoviesMod, NetMirror, Peachify, VidFast, XPass, HDMovie2, ZinkMovies, OneTouchTV, VidEasy — ofuscados, no editables |
| **Deshabilitados (dominio muerto)** | 19 | allmovieland, castle, cineby, cinemacity, cinetv, goatapi, hdhub4u, isaidub, lamovie, moviebox, movies4u, onlykdrama, kisskh, purstream, showbox, toflix, uhdmovies, vegamovies, vidsrc, vixsrc |
| **Anime-only (sin probar)** | 10 | AllAnime, AllWish, AnimeKai, AnikotoTV, AnimePahe, AnimeSalt, Animetsu, AnimeWorld, AnimeSama, HiAnime |
| **DooFlix** | 1 | Re-activado (dominio `dooflix.com` vivo) |

**Idiomas:** Castellano, Latino, VOSE, English, Japanese, Korean, Hindi, Portuguese.

**Servidores:** streamwish, filemoon, doodstream, streamtape, fembed, okru, mixdrop, upstream, netutv, vidmoly.

**Estado real (~80 streams por pelicula):**
| Tipo | Funcional | Reproducible en |
|---|---|---|
| Torrent indexers (6 fuentes) | ✅ ~70+ magnets | NuvioTV ✅ (TorrentService nativo via infoHash) |
| Embed directo (11+ dominios resueltos) | ✅ ~10-20 streams | NuvioTV ✅ (URL directa `.m3u8`/`.mp4`) |
| Embed sin resolver | ⚠️ requiere JS client-side | Stremio Desktop ✅ (WebView) / NuvioTV ❌ |
| Backend scrapers (2 scrapers / 8 mirrors) | ⚠️ variable (bloqueo segun mirror) | NuvioTV ✅ (si se resuelve) |
| Hermes scrapers (9/42 funcionales) | ⚠️ 9 devuelven streams, 33 sin resultados | Variable |

## Torrent Indexers (6 fuentes)

| Indexador | Contenido | Resultados | Nota |
|---|---|---|---|
| **SolidTorrents** | Movies, TV, Anime | ~30 resultados vía API JSON | API pública, sin scraping |
| **GloDLS** | Movies & TV (multi-idioma) | ~15 torrents | Scraping cheerio |
| **Nyaa.si** | Anime (subs/dubs) | ~20 torrents | Scraping cheerio |
| **1337x** | Movies, TV, Anime | ~15 torrents (5 mirrors) | Rotación automática de mirrors |
| **LimeTorrents** | Movies, TV | ~10 torrents | Scraping cheerio |
| **EZTV** | TV series (por IMDb ID) | Resultados exactos por S/E | API JSON |

**Scoring:** wordMatch estricto (exacto=1.0, prefijo/sufijo=0.5, contiene=0.25, falta=-0.5) + titleStartBonus (+0.18 si titulo empieza con query) + seeds 12% + calidad 5% + año 10% (penalizacion -40% por año distinto) + S/E exacto (+12% match, -30% temporada incorrecta) + source/codec 3% + verified 3%. Stop words filtrados. Min score threshold 0.25. Packs de temporada rechazados en busquedas TV.
**Trackers:** 13 trackers UDP/HTTP/HTTPS inyectados en cada magnet. Dedup por infoHash.

## Embed Resolver (11+ dominios)

| Dominio | Estado | Método |
|---|---|---|
| streamwish | ✅ | Base64 decode → m3u8/mp4 |
| filemoon | ✅ | JS file extraction + m3u8/mp4 regex |
| doodstream | ✅ | pass_md5 token → direct URL |
| mixdrop | ✅ | wurl JSON extraction |
| voe.sx | ✅ | eval decode → m3u8/mp4 |
| vidhide/vidpro | ✅ | m3u8/mp4 regex |
| ok.ru | ✅ | data-options → metadataUrl → m3u8 |
| streamtape | ✅ | robotlink token → get_video API |
| upstream | ✅ | m3u8/mp4 regex |
| netu.tv | ✅ | eval decode → m3u8 |
| vidmoly | ✅ | m3u8/mp4 regex |
| JWPlayer | ✅ | setup({sources}) / file key |
| Genérico (fallback) | ✅ | m3u8/mp4 regex + iframe follow |

## Backend Scrapers (2 scrapers / 8 mirrors rotativos)

> **Descubrimiento de auditoría:** `server.js` registra solo **2 backend scrapers**: `2embed+Mirrors` y `PoseidonHD`. Los "8 mirrors" son sub-rutas internas del scraper `2embed+Mirrors`; no son scrapers independientes. La documentación anterior los contaba como 8 backend scrapers separados.

| Mirror | Key | Nota |
|---|---|---|
| 2embed vesy | tmdb | streamsrcs.2embed.cc/vesy |
| 2embed vsrc | imdb | streamsrcs.2embed.cc/vsrc |
| 2embed skin | tmdb | www.2embed.skin JSON API |
| 2embed cc | tmdb | vidsrc.cc embed HTML |
| VidSrc pro | tmdb | vidsrc.pro embed HTML |
| VidSrc icu | tmdb | vidsrc.icu embed |
| VidSrc xyz | tmdb | vidsrc.xyz embed |
| SuperEmbed | tmdb | multiembed.mov direct |

> Se rotan en orden. El primer mirror que devuelva streams para el pipeline. PoseidonHD rota 3 dominios.

## Catálogos Amatsu

> **Descubrimiento de auditoría:** los 4 catálogos de anime adicionales no son servidos por Pigamer37, sino por el proxy **Amatsu** (`amatsu.ruka.pw`). Pigamer37 se usa para resolver streams/meta de AnimeFLV, AnimeAV1, TioAnime y Henaojara, no para estos catálogos.

4 catálogos de anime adicionales servidos por el proxy Amatsu: `amatsu_seasonal_series`, `amatsu_airing_series`, `amatsu_trending_series`, `amatsu_top_series`.

## Endpoints

| Endpoint | Descripcion |
|---|---|
| `/manifest.json` | Stremio manifest (respeta `?l=es,lat,ja` y otros params de config) |
| `/stream/:type/:id.json` | Streams (backend + anime proxy + alfa + locals) |
| `/meta/:type/:id.json` | Metadata (TMDb + anime) |
| `/catalog/:type/:id.json` | Catálogos TMDB (popular, trending, top-rated, search) |
| `/health` | Estado de todos los providers (stats, fallos, salud) |
| `/configure` | Panel de configuracion |
| `/` | Health check |

## Desarrollo local

```bash
npm install
npm start        # Servidor en http://localhost:3000
node build.js    # Build de scrapers desde src/
```

## Deploy

- **Render.com** — auto-deploy desde `main`
- **URL:** https://ovnivers.onrender.com

## Changelog

### v1.7.7 — Kitsu cross-reference + catálogos simplificados + fixes Alfa

- **Kitsu como fuente anime**: reemplaza Amatsu. Catálogo `Anime Kitsu` con 20 items. IDs `kitsu:` se resuelven con 3 estrategias (Pigamer37 → yuna.moe → Kitsu API). Búsqueda global incluye Kitsu.
- **Catálogos simplificados**: 26 total (16 movie + 4 series + 6 anime). Eliminados duplicados `tt-*`. Amatsu reemplazado por Kitsu. 4 on-air unificados en 1.
- **Fixes Alfa providers**: selectores corregidos (SeriesRetro, DocumentalesOnline, PoseidonHD jsonDataPath). YouTube/rotos desactivados (CineLibreOnline, DocumentalesOnline, LaCartoons, etc). SeriesKao cambiado a solo anime.
- **Engine**: añadido `jsonDataPath` para búsqueda en JSON (NextJS). Fix cookie Anubis en POST search.
- **Docs**: README y `.memory.md` sincronizados.

### v1.7.6 — Anime streams fix + modular shortener resolver + catálogos nativos Pigamer37

- **Fix crítico anime streams**: season/episode ahora se pasan en el path ID (`tmdb:ID:S:E`), no en query string (Pigamer37 ignoraba `?season=`). Los episodios de temporadas >1 ahora son correctos.
- **Catálogos anime nativos**: añadidos 4 catálogos `En Emisión (AnimeFLV|AnimeAV1|Henaojara|TioAnime)` con scraper local (53 items on-air). Los items usan IDs nativos `animeflv:slug` detectados como anime por prefijo, sin depender de TMDB.
- **Multi-provider en paralelo**: las queries de streams ahora llaman a los 4 proveedores anime en paralelo (AnimeFLV, AnimeAV1, Henaojara, TioAnime) replicando el comportamiento del addon original.
- **Catálogos TMDB anime**: cambiado `type: 'series'` → `type: 'anime'` e IDs `ovn:` → `ovn-anime:`. Stremio/NuvioTV ahora piden `/stream/anime/...` y el addon detecta anime por tipo sin consultar TMDB.
- **Nuevo módulo `src/alfa-providers/shortener-resolver.js`**: resolución dedicada para links torrent (magnet, `.torrent`, `download_tt.php` base64/directo, shorteners `s.php`). Extrae `parseTorrentInfoHash` a `torrent-parser.js` compartido.
- **Refactor `engine.js`**: el bloque `type: 'torrent'` reducido de ~100 líneas a delegación en `resolveTorrentLink()`.
- **DivXTotal**: funcional con `download_tt.php?u=`. Devuelve `.torrent` con infoHash real.
- **Desactivados**: GranTorrent y MiTorrent (shorteners `super-enlace.com` / `acortalink.net` con POST anti-bot). AllCalidad (SPA React sin SSR).
- **Documentación**: README y `.memory.md` sincronizados al estado real. Alfa providers: 45 activos, 4 funcionales.

### v1.7.5 — Fix catálogos anime type + ovn-anime prefix + Pigamer37 catalogs

### v1.7.4 — Fix notWebReady + proxyHeaders + timeout + health tracking

- **Fix critico `notWebReady`**: El spread de `behaviorHints` sobrescribia `notWebReady: false` (calculado para URLs .mp4 directas) con el `true` original de Pigamer37. Fix: spread primero, override despues
- **Fix critico `proxyHeaders`**: Pigamer37 incluye `proxyHeaders` en sus streams, pero NuvioTV no soporta este campo y filtra los streams del listado. Ahora se eliminan en `normalizeStream`
- **Timeout global**: 18s → 30s para cubrir Pigamer37 en cold starts de Render (promediaba ~20s)
- **Timeout Pigamer37**: 20s → 25s individual
- **Health tracking**: Agregado para pigamer37, backend-scrapers, torrent-indexers
- **Fix meta ID rewriting**: `kitsu:`, `mal:`, `anidb:`, `henaojara:`, `tioanime:` ya no se corrompen a `ovn:kitsu:12`. Usa `isAnimeId()`
- **Fix pagina de configuracion**: Botones `type="button"`, removido Unicode em-dash, simplificadas expresiones complejas

### v1.7.2 — Fix Pigamer37 streams para TMDB anime (ovn: prefix)

- **Bug 1 — Pigamer37 ignoraba TMDB numerico anime**: `ovn:46260` (Naruto) enviaba `'46260'` pelado a Pigamer37, que no lo reconocia. Ahora usa `tmdb:46260` (con prefijo estandar)
- **Bug 2 — Alfa/Local providers ignoraban TMDB numerico anime**: Mismo problema — recibian ID numerico sin prefijo. Ahora usan `animeProviderId` centralizado
- **Bug 3 — Torrents sin multi-titulo para TMDB anime**: La condicion `!rawId.match(/^\d+$/)` excluia IDs numericos del resolvedor multi-titulo. Ahora `isAnime && !rawId.startsWith('tt')` los incluye
- **Cleanup**: Eliminado bloque muerto de enhancement anime secundario (lineas 1238-1244) que quedo inaccesible tras corregir Bug 3
- **Refactor**: Centralizada logica de resolucion de provider ID en `animeProviderId`

### v1.7.1 — Anime torrent fix + Content profiles + Process safety

**Anime → torrent fix (CRITICAL):**
- Anime prefix IDs (`animeflv:one-piece`, `anilist:123`) ya NO saltan la búsqueda de torrents. El resolvedor usa 5 estrategias de fallback para obtener títulos EN/ES/JA: Amatsu → Pigamer37 → TMDB enhance → cross-ref → direct TMDB
- Multi-título anime: `anime.titles.resolveTitles()` devuelve hasta 10 títulos alternativos. `server.js` busca con cada uno y combina resultados (sin modificar el módulo torrent)

**Nuevo módulo:** `src/anime/titles.js` — resolvedor multi-título con cache 24h (max 500). Exporta `resolveTitles()`, `getSearchTitles()`, `getEnglishTitle()`, `fromTMDB()`, `fromAmatsu()`, `fromPigamer()`

**Content profiles (`src/content/`):**
- `profile.js`: perfiles de contenido normalizados con `resolveAny()`, `resolveByTMDB()`, `resolveByAnimeId()`, `buildStremioMeta()`, `buildCatalogMeta()`. Perfiles anime incluyen `searchTitles`, `synonyms`, `titleEN/ES/JA`
- `identifier.js`: clasificador de contenido (`CONTENT_ANIME`, `CONTENT_MOVIE`, `CONTENT_SERIES`) con `classify()`, `classifyByPrefix()`, `isAnimeIdPrefix()`
- `episode.js`: gestor de episodios con soporte para IDs anime prefix, `parseEpisodeId()`, `extractSE()`, `verifySE()`, `isPack()`, `isMovieTitle()`

**Process safety (Render stability):**
- `process.on('unhandledRejection')` — previene crash por promesas sin manejar (Node 15+ default behavior)
- `process.on('uncaughtException')` — previene crash por excepciones no capturadas
- Memory watchdog cada 5 min: limpia caches (stream + meta) si heap supera 70%. Reporta en log antes de limpiar
- `/health` ahora reporta `memory` (heapUsed, heapTotal, rss, heapPercent) y `cache` (streamCache, metaCache sizes)
- Nueva dependencia `undici` como fallback de fetch

### v1.7.0 — Modulos unificados: anime + media + movies + series

**Modulo anime (`src/anime/`):**
- 7 archivos que consolidan toda la logica de anime dispersa en server.js, catalog y alfa-providers
- `detector.js`: deteccion robusta con 3 metodos — prefix (1.0), TMDB genre 16 + origin_country JP (0.95), type=anime (0.9). The Simpsons ya NO se detecta como anime (antes si, por genre 16 solo)
- `resolver.js`: pipeline unificado de resolucion de IDs — xref→source→tmdb, con cache 24h
- `pigamer.js`: cliente dedicado para Pigamer37 (streams + meta)
- `amatsu.js`: cliente dedicado para Amatsu (synonyms, catalogs, search, meta)
- `providers.js`: registro centralizado de providers anime-only (11 IDs), reemplaza la lista hardcodeada en server.js
- `types.js`: constantes compartidas (prefixes, bases, provider IDs)
- Nyaa.si anime: torrent search ahora usa categoria `1_0` (anime) cuando `isAnime=true`, en vez de `0_0` (todas)
- Eliminado codigo muerto: `fixPigamerId` (no-op), `proxyPigamer`, `animeTMDbCache` duplicado, `ANIME_PREFIXES`/`ANIME_SOURCE_PREFIXES`/`ANIME_XREF_PREFIXES` duplicados en server.js
- Eliminada llamada duplicada a scrapeAlfa: antes se llamaba 2 veces para anime (type original + type='anime'), ahora 1 sola con categoria correcta
- server.js: -94 lineas de codigo anime disperso, reemplazadas por `const anime = require('./src/anime/index')`

**Modulos media/movies/series (`src/media/`, `src/movies/`, `src/series/`):**
- `src/media/`: infraestructura compartida — `types.js` (constantes), `tmdb.js` (API TMDB), `language.js` (deteccion + scoring + filtro de idiomas), `quality.js` (normalizacion + comparacion + filtro), `dedup.js` (deduplicacion con prioridad por calidad), `health.js` (health tracking con cooldown 5min), `index.js` (API unificada)
- `src/movies/`: resolucion de metadatos y filtrado de streams por year para peliculas
- `src/series/`: extraccion S/E, verificacion, deteccion de packs, filtrado por episodio
- server.js: -116 lineas de funciones inline reemplazadas por llamadas a modulos:
  - `providerStats`/`trackProviderResult`/`isProviderHealthy`/`getProviderReport` → `media.health`
  - `matchesQuality`/`filterStreams`/`computeLangScore` → `media.language.matchesFilter`/`computeScore` + `media.quality.matchesFilter`/`compareQuality`
  - Dedup inline → `media.dedup.dedupeWithPriority`
  - Eliminadas funciones: `matchesQuality`, `computeLangScore`, `filterStreams`
  - Nuevos campos estructurados en streams: `quality` (string normalizado) y `languages` (array de codigos)
- Fix: alias `cast` → `es` en language module para que idioma detectado como `cast` coincida con preferencia de usuario `es`

### v1.6.8 — Precision scoring para torrents

- **wordMatch estricto**: normalizacion de acentos, filtro de stop words (the, of, from, de, el...), scoring granular (exacto=1.0, prefijo/sufijo=0.5, contiene=0.25, falta=-0.5)
- **titleStartBonus**: +0.18 si el titulo empieza exactamente con la query — elimina falsos positivos en busquedas de una palabra (ej. "From" ya no devuelve "Stranger Things Tales from 85")
- **Verificacion S/E exacta**: +0.12 si SxxExx coincide, -0.30 si temporada incorrecta
- **Penalizacion año**: -0.40 por año distinto (antes -0.25)
- **Filtro de puntuacion minima**: descarta resultados < 0.25
- **Deteccion de packs**: rechaza season packs en busquedas de episodio individual
- **Penalizacion por ruido**: titulos con muchas palabras extra reciben penalty
- **Docs**: README, manifest.json y .memory.md sincronizados al estado real del codigo

### v1.6.1 — Documentación actualizada

- **Docs**: README sincronizado al estado real del proyecto: 6 indexers de torrent, 11+ dominios embed resolver, 8 mirrors backend, 27/61 Hermes funcionales, pipeline unificado con prioridad castellano

### v1.6.0 — Pipeline unificado + 6 torrent indexers + prioridad castellano

- **Stream pipeline unificado**: `src/stream-pipeline/index.js` — orquestador central con `StreamPipeline`, `CircuitBreaker` (5 fallos = 5 min off), dedup por infoHash, post-resolver de embeds
- **Torrent system v2**: 6 fuentes (GloDLS, Nyaa.si, SolidTorrents API, LimeTorrents, 1337x con 5 mirrors, EZTV API). Sistema de scoring: word match 50% + seeds 20% + calidad 7% + año 10% + source/codec 5% + penalización año distinto -25%
- **Embed resolver ampliado**: 11+ dominios (streamwish, filemoon, doodstream, mixdrop, voe.sx, vidhide, ok.ru, streamtape, upstream, netu.tv, vidmoly) + JWPlayer + genérico. Sin YouTube
- **Prioridad castellano**: `computeLangScore()` detecta español/latino/vose/dual y ordena al frente
- **Backend scrapers unificados**: 8 mirrors rotativos (2embed vesy/vsrc/skin/cc, VidSrc pro/icu/xyz, SuperEmbed) + PoseidonHD 3 dominios
- **Fix Hermes providers**: Inyección de globales `cheerio` + `CryptoJS` para compatibilidad Node.js → 27/61 funcionales
- **Fix torrents**: Búsqueda con título EN inglés de TMDB (no español) para mejores resultados
- **Providers eliminados**: `estrenoscinesaa` y `homecine` removidos del proyecto
- **Post-pipeline embed resolution**: 12 streams embed sin resolver se intentan convertir a `.m3u8`/`.mp4` directo antes de responder
- **Metadata enriquecida en torrents**: seeds, peers, tamaño (GB/MB), calidad (4K/1080p/720p), codec (HEVC/x264/AV1), source (BluRay/WEB-DL/Remux), audio (DTS/AC3/EAC3), HDR/DV
- **13 trackers** UDP/HTTP/HTTPS inyectados en cada magnet link
- **Version**: 1.6.0

### v1.5.7 — Fix stremio URL + documentación

- **Fix `stremio://` URL**: `stremio://https://...` → `stremio://host/...` (doble protocolo rompía "Open in Stremio")
- **Docs**: README actualizado con estado real de providers y compatibilidad

### v1.5.5 — Manifest fix + notWebReady + embed resolver

- **Manifest**: `catalog` añadido a resources, `anime` añadido a types
- **notWebReady**: streams con URL directa (`.m3u8`/`.mp4`) ya no se marcan como `notWebReady` — reproducibles por ExoPlayer
- **Embed resolver**: timeouts reducidos a 3s, resolución en paralelo con `Promise.allSettled`
- **Torrent priority**: providers torrent se ejecutan primero (aunque ya no producen infoHash)
- **Fix ReferenceError**: `catalogDefs` usado antes de definirse — causaba 503 hibernate-wake-error
- **Cache-Control**: Manifest con `no-cache, no-store, must-revalidate` para que version updates se propaguen inmediatamente

### v1.5.4 — Embed resolver + build fix

- **Embed-to-direct resolver**: Nueva `tryResolveEmbedToDirect(url)` en engine.js que fetchea páginas HTML embed y extrae URLs directas (`.m3u8`/`.mp4`) mediante patrones genéricos (src/file keys, video sources, regex). Cache de resultados por URL.
- **Post-processing en extractVideos**: Todos los streams no-torrent se resuelven automáticamente. Si el embed contiene una URL directa, se usa; si no, se conserva la URL embed con `notWebReady: true`.
- **Fix build**: `crypto` añadido a `EXTERNAL_MODULES` en `build.js` — el bundle ya no incluye polyfill de crypto (50KB menos, 85KB total).
- **Bundle**: `alfa-providers.js` regenerado con esbuild (incluye embed resolver).
- **Docs**: README actualizado con tabla de proveedores y notas de compatibilidad.
- **Version**: 1.5.4

### v1.5.2 — DonTorrent reactivado + PoW solver + universal catalogs

- **DonTorrent reactivado**: Supera Cloudflare Anubis (PoW SHA256) + PoW interno (`/api_validate_pow.php`). Descarga .torrent real y extrae infoHash. 3 proveedores torrent más (DonTorrent, MejorTorrent, PelisPanda reactivados) = **11 activos**.
- **Nuevo `type: 'dontorrent'` en engine.js**: Flujo completo — POST a generar challenge → resolver SHA256 PoW (dificultad 3) → validar y obtener download_url → descargar .torrent → parsear infoHash. Cacheo de cookie Anubis por dominio.
- **POST search en `searchProvider`**: Soporte para `method: 'POST'` en config de búsqueda (DonTorrent usa POST, no GET).
- **Season fallback en `getEpisodeUrl`**: Si el episodio no está en la temporada actual, busca automáticamente la temporada correcta vía POST search y navega a ella.
- **MejorTorrent reactivado**: Dominio `www43.mejortorrent.eu`, categorías `movie/tvshow/torrent`.
- **PelisPanda reactivado**: Dominio `pelispanda.org`, streams torrent funcionales.
- **HackTorrent**: Marcado `active: true` (WordPress funcional, torrents con infoHash).
- **Catálogos universales**: 4 nuevos catálogos (`tt-popular-movie`, `tt-popular-series`, `tt-popular-anime`, `tt-popular-anime-movie`) con IDs `tt:<imdb_id>` para compatibilidad cross-addon (Torrentio, AnimeFLV). IDs `ovn:<tmdb_id>` originales intactos.
- **Bundle**: `alfa-providers.js` regenerado con esbuild.
- **Docs**: Versiones sincronizadas a 1.5.2.

### v1.5.0 — Alfa providers fix: Español, Anime y torrents funcionales en producción

- **Fix crítico**: `require('./providers/alfa-providers')` devolvía función directa, pero `server.js` hacía `.default` → siempre `undefined`. Fix: `alfaModule.default || alfaModule`.
- **Selectores actualizados**: CineCalidad (`div.grid`→`article`, `a[href]`→`h2`), AllCalidad (`/search?s=`→`/?s=`, `article.movie-item`→`article`).
- **Base64 data-src**: Nueva `resolveUrl()` que decodifica base64 en atributos `data-src` (CineCalidad usa esto para URLs de video).
- **Fallback `<a data-src>`**: Si no hay iframes, busca `<a data-src="base64">` y decodifica.
- **AnimeFLV**: `var videos` ahora es objeto `{"SUB":[...],"LAT":[...]}` (no array). Engine.js maneja ambos formatos. + URL pattern para episodios.
- **TioAnime**: Selectores `ul.animes li`, `h3.title`. `var episodes` → `var videos`. + URL pattern para episodios.
- **HenaoJara**: Selectores `article`, `h3.Title` (antes `li`, `a[href]` que daban title vacío).
- **Search fallback**: Prueba title completo → primeras 2 palabras → primera palabra. Último recurso: primer resultado si nada pasa threshold.
- **Timeout**: `LOCAL_PROVIDER_TIMEOUT` 12s→60s, fetchHTML 12s→20s, fetchJSON 10s→15s (Render free tier).
- **Fix torrents**: `notWebReady: !hasInfoHash` → `true` — Stremio ya no intenta reproducir magnets directo, evita "error de descarga".
- **Resultado local**: The Matrix → 23 streams 🇪🇸 (antes 0). Naruto ep 1 → 33 streams 🇯🇵 (antes 0).
- **Bundle**: `alfa-providers.js` regenerado con esbuild.
- **Docs**: Versiones sincronizadas a 1.5.0.

### v1.4.14 — JKAnime HLS resolution nativa

- **JKAnime**: Nuevo tipo `jkplayer` en engine.js — resuelve iframes `jkplayer/um?e=` a URLs HLS reales (`.m3u8`)
- **JKAnime**: Streams ahora reproducen directamente en Stremio via `nika.playmudos.com/*.m3u8` (token firmado)
- **JKAnime**: Fallback `atob()` para URLs embed en segundo DPlayer config
- **Engine**: Handler aislado (`type: 'jkplayer'`) — riesgo cero a otros providers
- **Bundle**: `alfa-providers.js` regenerado con esbuild
- **Docs**: Versiones sincronizadas a 1.4.14

### v1.4.15 — Fix meta handler type fallback + search threshold

- **Meta handler**: Fallback de tipo TMDB — si falla con movie/tv, reintenta con el alternativo
- **Meta handler**: El type devuelto refleja el contenido real (no el solicitado)
- **Engine**: Threshold de búsqueda 0.35→0.5 + verificación de palabra clave (≥3 chars)
- **Bundle**: `alfa-providers.js` regenerado con esbuild
- **Docs**: Versiones sincronizadas a 1.4.15

### v1.4.19 — Alfa providers fix: selectores actualizados + iframe-chain engine

- **Fix crítico**: `require('./providers/alfa-providers')` devolvía `{__esModule, default: fn}` pero se esperaba la función directa — Alfa providers (80+ scrapers ES) nunca se ejecutaban desde el manifiesto.
- **Selectores actualizados**: 35 providers ahora funcionales (vs 0). Patrón principal: sitios WordPress cambiaron de `<article>` a `<li>` en resultados de búsqueda.
- **Nuevo tipo `iframe-chain`**: Resolución en 2 pasos para sitios con iframes anidados — extrae `data-src` → fetch embed page → iframe src real (ej. PelisPedia → fastream.to).
- **Torrentio**: Añadido al manifiesto como scraper Hermes (en, hi). Disponible vía local providers si el usuario activa exposeLocalScrapers.
- **Bundle**: `alfa-providers.js` regenerado con esbuild.
- **Docs**: Versiones sincronizadas a 1.4.19

### v1.4.18 — Paginación real, .env, calidad estandarizada, health check

- **Paginación real**: `skip` → página correcta (antes `skip=100` era página 100, ahora página 6). Campo `next` en respuesta. `{page}` añadido a trending movie/series
- **Config vía `.env`**: `dotenv` añadido, `TMDB_KEY` y `PORT` desde variables de entorno. `.env.example` creado
- **Etiquetado de calidad**: `normalizeQuality()` mapea 20+ variantes a 6 estándar (`4K`, `1080p`, `720p`, `480p`, `CAM`, `HD`). Captura `UHD`, `FHD`, `CAM`, `TS`, `TC`, `SCR`, etc. `matchesQuality()` filtra CAM/TS automáticamente
- **Health check**: Stats por provider (total, ok, fail, failStreak, avgMs). Auto-deshabilitado tras 5 fallos consecutivos. Endpoint `GET /health` con detalle
- **Meta handler**: `getTMDbMeta()` ahora usa `language=es` para títulos en español
- **Raíz**: `test_*.js` movidos a `tests/`. `.env` añadido a `.gitignore`
- **Bundle**: `alfa-providers.js` regenerado con esbuild
- **Docs**: Versiones sincronizadas a 1.4.18

### v1.4.17 — Prefijo propio 'ovn:' para catálogo (sin competencia de otros addons)

- **Catálogo**: IDs cambiados de `tmdb:{id}` a `ovn:{id}` — prefijo único que solo Ovnivers maneja
- **Meta handler**: Devuelve `id: ovn:{id}` en la respuesta; siempre activo sin depender de `enableBackend`
- **Stream handler**: Reconoce `ovn:` prefix en `extractId()` y `parseStreamId()` — extrae el TMDB ID interno correctamente
- **Manifest**: `idPrefixes` incluye `"ovn"` en stream, catalog y meta — Stremio nunca pide ficha a otro addon
- **Docs**: Versiones sincronizadas a 1.4.17

### v1.4.16 — Fix fichas incorrectas: meta siempre activo para tmdb: IDs

- **Meta handler**: Eliminado guard `enableBackend` — la ficha siempre se sirve para IDs TMDB, independiente de la config de scrapers
- **Manifest**: `metaPrefixes` ahora siempre incluye `'tmdb'` — Stremio siempre pide la ficha a Ovnivers primero
- **Engine**: Substring bonus solo si query ≥5 chars; word-level guard con word boundary y mínimo 4 chars
- **Docs**: Versiones sincronizadas a 1.4.16

### v1.4.13 — HackTorrent reactivado, PelisPanda dominio actualizado

- **Anime**: HackTorrent reactivado (`active: true`) — WordPress funcional vía `/?s=`
- **Anime**: PelisPanda baseUrl actualizado a `pelispanda.org` (`.com` caído)
- **Anime**: 10/22 providers activos (+1 vs v1.4.12)
- **Bundle**: `alfa-providers.js` regenerado
- **Docs**: Versiones sincronizadas a 1.4.13

### v1.4.12 — Catálogos deshabilitados, documentación sincronizada
- **Catálogos**: Ruta `/catalog/*` ahora devuelve `{ metas: [] }` (addon como stream provider puro)
- **Docs**: Versiones sincronizadas a 1.4.12 en todos los archivos
- **Docs**: Conteo de scrapers corregido (61→62)
- **Docs**: Conteo de Alfa providers actualizado al estado real (51/85 activos)
- **Anime**: `resolveTitles()` ahora obtiene título japonés desde TMDB + corrige bug `firstYear` + añade `original_name`
- **Anime**: Buscador multi-idioma mejorado (EN, ES, JA, título original, romaji)
- **Anime**: 5 providers marcados `active: false` por no responder (AnimeJL, LatAnime, PelisPanda, HackTorrent, PelisPlus)
- **Engine**: Timeout aumentado 8s→12s en fetchHTML; searchProvider con retry parcial

### v1.4.10 — Provider fixes & anime restoration
- **JKAnime**: Fixed selectors (`.anime-item` → `.anime__item`, `.title` → `h5 a`)
- **JKAnime**: Added `episodes.type: 'url'` support in engine (`/{slug}/{episode}/`)
- **JKAnime**: Added `videos.type: 'jslist'` para extraer `video[N] = '<iframe>'`
- **HenaoJara**: Fixed selectors (`article` → `article.TPost`, `h2` → `h3`)
- **AnimeJL**: Fixed selectors (`article` → `article.Anime`, `h2` → `h3.Title`)
- **EstrenosAnime**: Fixed URL (`/?s=` → `/search?keyword=`), selector (`a.film-poster-ahref` con `titleAttr`)
- **SoloLatino**: Fixed URL (`/?s=` → `/buscar?q=`), selector (`.card` / `.card__title`)
- **TVAnime (MonosChinos)**: New domain `vww.monoschinos2.net`, fixed URL + selectors
- **TioAnime**: Selectors verified working (no changes needed)
- **MundoDonghua**: Set inactive — búsqueda solo client-side
- **Result**: JKAnime returns 5 streams for One Piece, 2 for Shingeki no Kyojin

## Stream Format

```json
{
  "name": "ProviderName\n1080p 🇯🇵🇪🇸",
  "title": "1080p | ProviderName\nServerName\nDetalle",
  "url": "https://.../video.m3u8",
  "quality": "1080p",
  "languages": ["cast", "en"],
  "notWebReady": false
}
```

| Campo | Descripción |
|---|---|
| `url` | URL directa `.mp4`/`.m3u8` o URL de embed HTML |
| `quality` | Calidad normalizada (`4K`, `1080p`, `720p`, `480p`, `HD`, `CAM`) |
| `languages` | Array de códigos de idioma detectados (`cast`, `lat`, `en`, `ja`, `vose`, ...) |
| `notWebReady` | `false` = directo (ExoPlayer). `true` = embed (solo Chromium WebView) |
| `name` | Provider + calidad + flags de idioma |
| `title` | Provider + servidor + detalle (episodio, HDR, dual audio) |

## TODO / Próximas mejoras

- [x] **Health check de scrapers** — Stats en tiempo real + auto-disable + `GET /health`
- [x] **Caché de metadata** — `metaCache` con TTL 1h + `MAX_CACHE=1000`
- [x] **Deduplicación de streams** — `dedupeStreams()` por infoHash/url/name/title
- [x] **Etiquetado de calidad estandarizado** — `normalizeQuality()` con 20+ variantes → 6 estándar
- [x] **Paginación real en catálogos** — `skip`→ página, campo `next` en respuesta
- [x] **Config vía `.env`** — `dotenv` + `.env.example` + `TMDB_KEY`/`PORT` desde entorno
- [x] **Limpiar raíz** — `test_*.js` movidos a `tests/`
- [x] **Embed resolver** — `tryResolveEmbedToDirect()` con fetch y extracción de `.m3u8`/`.mp4`
- [x] **notWebReady automático** — streams directos marcados como ExoPlayer-compatibles
- [ ] **Tests automatizados** — Suite de tests que verifique que cada scraper responde estructura válida
- [ ] **Proxy endpoint** — Endpoint propio como WebStreamrMBG para servir streams embed resueltos sin depender de URLs externas
- [ ] **Reemplazar providers torrent** — Buscar fuentes funcionales (infoHash real) o eliminarlos del manifiesto
- [ ] **Priorizar providers por velocidad** — Ordenar streams: más rápidos primero

## Créditos

- 62 scrapers originales: Yoruix, Phisher98, Wooodyhood, Piratezoro9, Abinanthankv, KennethJYS, Real-Morpheus, Xyr0nX, Yatin-Code, RaymondNoodles, D3adlyRocket
- Anime proxy: [Pigamer37/animeflv-stremio-addon](https://github.com/Pigamer37/animeflv-stremio-addon)
- Alfa providers: [alfa-addon/addon](https://github.com/alfa-addon/addon) (Kodi, GPL-3.0)
