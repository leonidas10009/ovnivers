# Ovnivers — Stream Provider v1.6.0

Addon para **Stremio / NuvioTV** con catálogo, meta y streams de múltiples fuentes.

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
| **Torrent indexers** (server-side) | GloDLS (movies/TV, ~15 magnets) + Nyaa.si (anime, ~75 magnets) |
| **Embed resolver** (YouTube, JWPlayer) | Fetch automático de páginas → extracción `.m3u8`/`.mp4` directo |
| **Pigamer37** (proxy anime) | AnimeFLV, AnimeAV1, TioAnime, Henaojara — solo para anime detectado |
| **Alfa Providers** (server-side) | 48 providers: peliculas, series, anime, documentales + torrents |
| **Alfa multi-título** | Busca por título EN + ES + JA + slug en paralelo |
| **notWebReady automático** | Streams directos (`.m3u8`/`.mp4`) marcados como reproducibles en ExoPlayer |
| **Config panel** | `/configure` — tipos, calidad, idiomas, scrapers on/off |
| **Separación por categoría** | Pigamer37 solo para anime detectado; Alfa anime para TV animado; Torrent indexers + Backend + Alfa + Hermes para todo |

## Catalogs

19 catálogos TMDB activos + 4 universales + 4 Amatsu anime: popular, trending, top-rated, search para movie/series/anime.
IDs con prefijo `ovn:` para los catálogos propios y `tt:`/`tmdb:` para compatibilidad cross-addon (Torrentio, AnimeFLV, TMDB Community).

## Alfa Providers (77 registrados, 48 activos)

Scraper unificado del addon **Alfa** de Kodi. Corre server-side en Node.js.
Busca con multiples variantes del título (EN/ES/JA/slug) en paralelo.

Tras cada fetch de embed, se ejecuta el resolvedor `tryResolveEmbedToDirect()` que extrae URLs directas (`.m3u8`/`.mp4`) del HTML. Si tiene éxito, el stream se marca `notWebReady: false` (reproducible en ExoPlayer). Si falla, se conserva la URL embed con `notWebReady: true`.

| Categoria | Activos | Providers destacados |
|---|---|---|
| **Películas** | ~29 | CineCalidad, PelisPedia, PoseidonHD, WolfMax4K + iframe providers |
| **Series** | ~21 | DoramasYT, FullSerieHD, PelisPedia, PoseidonHD, WolfMax4K + iframe |
| **Anime** | 11 | AnimeFLV, JKAnime, TioAnime + iframe/jsvar providers |
| **Documentales** | 3 | AreaDocumental, DocumentalesOnline, EliteTorrent |

**Idiomas:** Castellano, Latino, VOSE, English, Japanese, Korean, Hindi, Portuguese.

**Servidores:** streamwish, filemoon, doodstream, streamtape, fembed, okru, mixdrop.

**Estado real (~80 streams por película):**
| Tipo | Funcional | Reproducible en |
|---|---|---|
| Torrent indexer (GloDLS) | ✅ ~15 magnets para movies/TV | NuvioTV ✅ (TorrentService nativo vía infoHash) |
| Torrent indexer (Nyaa.si) | ✅ ~75 magnets para anime | NuvioTV ✅ (TorrentService nativo vía infoHash) |
| Embed directo (YouTube, JWPlayer resuelto) | ✅ ~5-10 streams (según título) | NuvioTV ✅ (URL directa `.m3u8`/`.mp4`) |
| Embed sin resolver (fastream.to, etc.) | ⚠️ no resoluble server-side (JS requerido) | Stremio Desktop ✅ (WebView) / NuvioTV ❌ (ExoPlayer) |
| Backend scrapers (2embed, VidSrc, PoseidonHD) | ❌ APIs bloqueadas/rotas desde Render | Ninguno |
| Hermes scrapers (62 originales) | ❌ Todos rotos (bloqueados, sin resultados) | Ninguno |

## Torrent Indexers (2 activos)

| Indexador | Contenido | Resultados |
|---|---|---|
| **GloDLS** | Movies & TV (multi-idioma) | ~15 magnets con seeds, calidad, tamaño |
| **Nyaa.si** | Anime (subs/dubs) | ~75 magnets con seeds, calidad, tamaño |

Los torrents se entregan como streams con `infoHash` — NuvioTV los reproduce vía su TorrentService nativo (libtorrent4j).

## Embed Resolver (3 patrones)

| Patrón | Funciona | Descripción |
|---|---|---|
| YouTube | ✅ | Extrae `ytInitialPlayerResponse` → streamingData.formats (URL directa Google Video) |
| JWPlayer | ✅ (si setup inline) | Extrae `setup({...})` del script tag → `file` URL |
| fastream.to / genérico | ❌ | JS-render blocking — requiere headless browser |

## Backend Scrapers (4 — todos rotos)

| Scraper | Estado | Nota |
|---|---|---|
| 2embed (Vesy) | ❌ | APIs bloqueadas desde Render |
| 2embed (Vsrc) | ❌ | APIs bloqueadas desde Render |
| VidSrc | ❌ | Fetch fails desde servidores |
| PoseidonHD | ❌ | Next.js no resoluble server-side |

> **EZTV**, **Cuevana2**, **Hermes scrapers (61)**: todos rotos/bloqueados desde Render. Mantenidos por compatibilidad legacy.

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

### v1.5.8 — Torrent indexers + embed resolver + doc update

- **Torrent indexers**: GloDLS (movies/TV, ~15 results) + Nyaa.si (anime, ~75 results) — scraping server-side con cheerio
- **TMDB title fetch**: Torrent indexers buscan usando título real de TMDB (no ID crudo). Soporte para `S01E01` en TV
- **Fix GloDLS scraper**: Selectores corregidos (`t-row` class, columnas: name=col1, seeds=col5, size=col4). Eliminado `cat=0` (rompía búsqueda). Name extraído de `a[title]` (full name, no truncado)
- **Embed resolver (YouTube)**: Nuevo `embed-resolver.js` con per-domain resolvers — YouTube extrae `ytInitialPlayerResponse`, JWPlayer extrae setup inline
- **Integración en server.js**: Torrent indexers ejecutados en pipeline de streams tras Alfa/Hermes section
- **Docs**: README actualizado con estado real de providers, torrent indexers, embed resolver
- **Version**: 1.5.8 (bump patch, center number intacto)

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
  "notWebReady": false
}
```

| Campo | Descripción |
|---|---|
| `url` | URL directa `.mp4`/`.m3u8` o URL de embed HTML |
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
