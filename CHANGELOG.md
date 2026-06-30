# Changelog

## v1.14.9 — Coolify migration cleanup + permanent URL

- **Eliminados** `render.yaml` y `railway.json` (legacy deploy configs)
- **server.js**: sin `RENDER_EXTERNAL_URL`, startup log con rutas relativas
- **Dockerfile**: Node 18→20 LTS, HEALTHCHECK `node -e`→`curl`
- **.node-version**: 18→20
- **package.json**: keywords añadidos `stremio`, `coolify`, `docker`
- **build.js**: "nuvio-providers"→"Ovnivers providers"
- **Cloudflare Worker frontend**: reverse proxy via KV para URL permanente
- **URL permanente**: `https://ovnivers-frontend.calipo10009.workers.dev`
- **Script**: `scripts/update-tunnel-url.js` para sincronizar KV con tunnel URL
- **Docs**: 50/50 hallazgos de auditoría resueltos, todas las referencias a Render eliminadas

## v1.14.8 — Coolify migration + memory watchdog fix

- **Migración a Coolify**: Dockerfile con Node 18 + Chromium + curl. Contenedor 1.5GB RAM, 1 vCPU.
- **Cloudflare Tunnel**: túnel dedicado para el addon (`cloudflared`), separado de Coolify (ngrok).
- **Memory watchdog corregido**: compara `heapUsed` contra el límite real de 768MB (`--max-old-space-size`), no contra `heapTotal`.
- **BrowserPool**: aumentado a 2 browsers (antes 1) para paralelizar Puppeteer.
- **BASE_URL dinámica**: detecta el host de la petición entrante en vez de hardcodear `localhost:3000`.
- **Puerto 3000**: expuesto al host para que los túneles puedan alcanzar el contenedor.
- **TMDB_KEY**: eliminada variable inválida de Coolify. El addon usa fallback hardcodeado.

## v1.14.6 — Multi-engine system + Torrent providers unification + Cardigann engine

**Sistema Multi-Engine (`src/engines/`):**
- **Static Engine** — cheerio + selectores (~15MB, 200ms). Para WordPress, PHP, APIs JSON.
- **Dynamic Engine** — Puppeteer + BrowserPool + AutonomousScraper (~200MB, 3-8s). SPAs, Cloudflare bypass.
- **Intelligent Engine** — StaticScraper + AutonomousScraper. Auto-descubre selectores y servidores.
- **Router** — `ProviderMemory` con aprendizaje bayesiano cross-sesión.
- **ProviderMemory** — tracking por provider+engine+phase, persiste a `.provider-memory.json`.

**Web Providers (74 total, 43 activos):**
- Renombrado: "Alfa Providers" → "Web Providers"
- + RepelisPlus, reactivados AllCalidad, PelisPanda, WolfMax4K, EliteTorrent, HackTorrent, AnimeJL, DocumentalesOnline
- Desactivados: AnimeJara, JKAnime, TioAnime, AnimeFLV (redundantes con scrapers nativos)
- Corregido: DonTorrent search, AnimeFLV dominio, BlogHorror selectores

**Torrent Providers (8 scrapers + Cardigann engine):**
- Integrados: DivXTotal, DonTorrent, EliteTorrent como scrapers nativos
- Cardigann Engine — parser YML sin dependencias, compatible con 522+ definiciones de Prowlarr/Jackett
- Resultado para "Matrix": 39 torrents con infoHash de 5 fuentes

**Cloudflare Bypass (gratuito):**
- Puppeteer Fallback con stealth, auto-detección de Chrome o `@sparticuz/chromium`
- Se activa en: HTTP 403/503/429, Cloudflare markers, errores de red

**Memoria:** 71 MB idle, ~270 MB con Puppeteer activo. Cabe en 1.5GB (Coolify/Docker).

## v1.14.5 — Stream-only mode consolidado

- **AnimeJara reactivado**: search por `/catalogo/?q=`, triple fallback: cheerio → iframe → Puppeteer
- **DonTorrent**: dominio actualizado, Anubis v1.25.0 PoW solver
- **Puppeteer hybrid**: `onclick` + `puppeteerFallback` en engine
- **Memory**: force restart a 90% heap
- **jsonPath search**: engine soporta búsqueda por API JSON

## v1.14.2 — Alfa anime providers fix + dedup + dead scraper cleanup

- Alfa anime fix: `resolveTitles()` extrae IDs `tmdb:` / `ovn:`
- Torrent dedup: infoHash deduplicado ignorando nombre del indexer
- Dead scrapers: 7 Hermes anime deshabilitados
- URL filter: URLs placeholder filtradas
- PoseidonHD: tipo `data-attr` para resolver proxy
- Word guard: ≤3 palabras → todas deben coincidir, >3 → mayoría
- Language filter: `?l=cast,es,lat` funciona sin `&c=1`

## v1.14.1 — Search precision + timing + anime detection + language filter + AnimeAV1

- Alfa engine: thresholds subidos, word guard estricto, torrents MIN_SCORE 0.25→0.40
- Timing: scrapeAlfa timeout 10s→30s, concurrencia 6→8, global 30s→45s
- Anime detection fix: `tmdb:` fuera de ANIME_XREF_PREFIXES
- Language filter: `?l=cast,es,lat` funciona sin `&c=1`
- Cinemeta compat: IMDb→TMDB resuelve correctamente
- AnimeAV1 fix: más servidores en RESOLVABLE

## v1.14.0 — Stream-only mode: catálogos eliminados

- Catálogos propios eliminados del manifest y server.js
- Rutas `/catalog/*` eliminadas del backend
- Menos memoria: `src/catalog/` ya no se carga, `MAX_CACHE` 500

## v1.13.13 — Memory stability fixes

- Health stats pruning: `health.prune()` limpia entradas inactivas >15 min
- Heap limit explícito: `--max-old-space-size=768` en Dockerfile
- Cache reducido: `MAX_CACHE` 1000 → 500

## v1.7.7 — Kitsu cross-reference + catálogos simplificados + fixes Alfa

- Kitsu como fuente anime, reemplaza Amatsu
- Catálogos simplificados: 26 total
- Fixes Alfa providers: selectores corregidos, YouTube/rotos desactivados
- Engine: `jsonDataPath` para búsqueda en JSON, fix cookie Anubis

## v1.7.6 — Anime streams fix + modular shortener resolver + catálogos nativos

- Fix crítico anime streams: season/episode en path ID
- Catálogos anime nativos: 4 catálogos on-air con scraper local
- Multi-provider en paralelo: 4 proveedores anime simultáneos
- Catálogos TMDB anime: type 'series' → 'anime', IDs `ovn-anime:`
- Nuevo módulo `shortener-resolver.js` para links torrent
- DivXTotal funcional con `download_tt.php?u=`

## v1.7.4 — Fix notWebReady + proxyHeaders + timeout + health tracking

- Fix crítico `notWebReady`: spread primero, override después
- Fix crítico `proxyHeaders`: eliminados para compatibilidad NuvioTV
- Timeout global: 18s → 30s
- Health tracking para pigamer37, backend-scrapers, torrent-indexers
- Fix meta ID rewriting: `kitsu:`, `mal:`, `anidb:` ya no se corrompen

## v1.7.2 — Fix Pigamer37 streams para TMDB anime

- Bug 1: Pigamer37 ignoraba TMDB numérico anime
- Bug 2: Alfa/Local providers ignoraban TMDB numérico anime
- Bug 3: Torrents sin multi-título para TMDB anime
- Refactor: centralizada lógica de provider ID en `animeProviderId`

## v1.7.1 — Anime torrent fix + Content profiles + Process safety

- Anime → torrent fix: 5 estrategias de fallback para títulos EN/ES/JA
- Multi-título anime: `resolveTitles()` devuelve hasta 10 títulos
- Content profiles: `profile.js`, `identifier.js`, `episode.js`
- Process safety: unhandledRejection, uncaughtException, memory watchdog
- `/health` reporta memory y cache

## v1.7.0 — Módulos unificados: anime + media + movies + series

- Módulo anime (`src/anime/`): 7 archivos, detección robusta, pipeline unificado
- Módulos media/movies/series: infraestructura compartida
- server.js: -210 líneas de código reemplazadas por módulos
- Fix: alias `cast` → `es` en language module

## v1.6.8 — Precision scoring para torrents

- wordMatch estricto: normalización de acentos, stop words, scoring granular
- titleStartBonus: +0.18 si título empieza con query
- Verificación S/E exacta: +0.12 match, -0.30 temporada incorrecta
- Penalización año: -0.40 por año distinto
- Filtro de puntuación mínima: < 0.25 descartado
- Detección de packs: rechaza season packs en búsquedas de episodio

## v1.6.0 — Pipeline unificado + 6 torrent indexers + prioridad castellano

- Stream pipeline unificado: `StreamPipeline`, `CircuitBreaker`, dedup por infoHash
- Torrent system v2: 6 fuentes con scoring (word match 50% + seeds 20% + calidad 7% + año 10%)
- Embed resolver ampliado: 11+ dominios + JWPlayer + genérico
- Prioridad castellano: `computeLangScore()` ordena español al frente
- Backend scrapers unificados: 8 mirrors rotativos + PoseidonHD
- Fix Hermes providers: inyección de globales cheerio + CryptoJS
- 13 trackers UDP/HTTP/HTTPS inyectados en cada magnet

## v1.5.7 — Fix stremio URL + documentación

- Fix `stremio://` URL: doble protocolo corregido
- Docs: README actualizado con estado real

## v1.5.5 — Manifest fix + notWebReady + embed resolver

- Manifest: `catalog` añadido a resources, `anime` a types
- notWebReady: streams con URL directa ya no se marcan como notWebReady
- Embed resolver: timeouts reducidos a 3s, resolución en paralelo
- Cache-Control: Manifest con `no-cache, no-store, must-revalidate`

## v1.5.4 — Embed resolver + build fix

- Embed-to-direct resolver: fetch HTML embed → extraer URLs directas
- Post-processing en extractVideos: todos los streams no-torrent se resuelven
- Fix build: `crypto` añadido a EXTERNAL_MODULES

## v1.5.2 — DonTorrent reactivado + PoW solver + universal catalogs

- DonTorrent reactivado: supera Cloudflare Anubis + PoW interno
- Nuevo `type: 'dontorrent'` en engine.js
- POST search en `searchProvider`
- MejorTorrent, PelisPanda, HackTorrent reactivados
- Catálogos universales: 4 nuevos con IDs `tt:<imdb_id>`

## v1.5.0 — Alfa providers fix: Español, Anime y torrents funcionales

- Fix crítico: `alfaModule.default || alfaModule`
- Selectores actualizados: CineCalidad, AllCalidad
- Base64 data-src: decodifica base64 en atributos
- AnimeFLV, TioAnime, HenaoJara: selectores y formatos corregidos
- Resultado: The Matrix → 23 streams, Naruto → 33 streams

## v1.4.19 — Alfa providers fix: selectores actualizados + iframe-chain engine

- Fix crítico: `__esModule` → función directa
- 35 providers funcionales (vs 0)
- Nuevo tipo `iframe-chain`: resolución en 2 pasos
- Torrentio añadido al manifiesto

## v1.4.18 — Paginación real, .env, calidad estandarizada, health check

- Paginación real: `skip` → página correcta
- Config vía `.env`: `dotenv`, `TMDB_KEY`, `PORT`
- Etiquetado de calidad: `normalizeQuality()` mapea 20+ variantes a 6 estándar
- Health check: stats por provider, auto-deshabilitado tras 5 fallos

## v1.4.17 — Prefijo propio 'ovn:' para catálogo

- IDs cambiados de `tmdb:{id}` a `ovn:{id}`
- Meta handler: siempre activo sin depender de `enableBackend`
- Manifest: `idPrefixes` incluye `"ovn"`

## v1.4.16 — Fix fichas incorrectas

- Meta handler: eliminado guard `enableBackend`
- Manifest: `metaPrefixes` siempre incluye `'tmdb'`
- Engine: substring bonus solo si query ≥5 chars

## v1.4.15 — Fix meta handler type fallback + search threshold

- Meta handler: fallback de tipo TMDB
- Engine: threshold 0.35→0.5 + verificación de palabra clave

## v1.4.14 — JKAnime HLS resolution nativa

- JKAnime: nuevo tipo `jkplayer` en engine.js
- Streams reproducen directamente en Stremio via `nika.playmudos.com/*.m3u8`

## v1.4.13 — HackTorrent reactivado, PelisPanda dominio actualizado

- HackTorrent reactivado, PelisPanda baseUrl actualizado
- 10/22 providers activos

## v1.4.12 — Catálogos deshabilitados, documentación sincronizada

- Catálogos: ruta `/catalog/*` devuelve `{ metas: [] }`
- Anime: `resolveTitles()` obtiene título japonés desde TMDB
- Buscador multi-idioma mejorado

## v1.4.10 — Provider fixes & anime restoration

- JKAnime, HenaoJara, AnimeJL, EstrenosAnime, SoloLatino, TVAnime: selectores corregidos
- TioAnime: selectores verificados
- MundoDonghua: desactivado
