# Ovnivers — Stream Provider v1.5.2

Addon para **Stremio** con catálogo en español y streams de múltiples fuentes.

## Instalacion

1. Abri **Stremio** > **Settings** > **Addons**
2. Ve al panel de configuracion para personalizar:
   ```
   https://ovnivers.onrender.com/configure
   ```
3. Genera la URL e instalala en Stremio
4. Usa un catalogo externo para navegar peliculas/series

## Features

| Funcionalidad | Detalle |
|---|---|---|
| **Backend scrapers** | 2embed (Vesy + Vsrc), VidSrc, PoseidonHD |
| **Pigamer37** (proxy anime) | AnimeFLV, AnimeAV1, TioAnime, Henaojara — siempre activo para series |
| **Alfa Providers** (server) | 80+ canales: peliculas, series, anime, documentales, torrents |
| **Alfa multi-título** | Busca por título EN + ES + JA + slug en paralelo para máximo match |
| **Alfa episodes** | Soporte de URL pattern (`/{slug}/{episode}/`) y asignaciones JS (`video[N] = '...'`) |
| **Local scrapers** | 62 providers Hermes ejecutados server-side |
| **Config panel** | `/configure` — tipos, calidad, idiomas, scrapers on/off |
| **Separación por categoría** | Pigamer37 solo para anime detectado; Alfa anime siempre para TV; Alfa principal + Backend + Hermes para todo |

## Catalogs

> **Nota:** Los catálogos están deshabilitados en el servidor (ruta `/catalog/*` devuelve vacío). El addon funciona como **proveedor de streams puro** — usa addons de catálogo externos (ej. TMDB Community Addon) para navegar contenido. Los catálogos están definidos en `manifest.json` (18) pero el servidor no los sirve.

## Alfa Providers (86 registrados, 53 activos)

Scraper unificado del addon **Alfa** de Kodi. Corre server-side en Node.js.
Busca con multiples variantes del título (EN/ES/JA/slug) en paralelo.

| Categoria | Activos | Inactivos | Providers destacados |
|---|---|---|---|
| **Peliculas** | ~29 | ~13 | AllCalidad, PelisPedia, PoseidonHD, HDFull, Gnula, WolfMax4K, CineCalidad, DivXTotal, TubePelis, Cine24H, CineLibreOnline, DeTodoPeliculas, GranTorrent, HomeCine, MiraPeliculas, PelisForte, SeriesKao, TubeOnline, Yandispoiler, eCarteleraTrailers (+9 más) |
| **Series** | ~17 | ~5 | EZTV, DoramasYT, FullSerieHD, SeriesRetro, LaCartoons, PelisPedia, PoseidonHD, DivXTotal, DonTorrent, GranTorrent, HDFull, WolfMax4K, MejorTorrent (+4 más) |
| **Anime** | 10 | 12 | AnimeFLV, JKAnime, TioAnime, TVAnime (MonosChinos), HenaoJara, EstrenosAnime, SoloLatino, TioDonghua, DoramasQueen, HackTorrent |
| **Documentales** | 3 | 1 | AreaDocumental, DocumentalesOnline, EliteTorrent |

> ⚠️ **Nota:** JKAnime extrae videos server-side (HLS directo vía resolución de `jkplayer/um`). AnimeFLV y TioAnime ahora extraen videos server-side vía `var videos` (objeto/array). HenaoJara carga videos dinámicamente (requieren JS en cliente). Ver [Estado por provider](#estado-por-provider) abajo.

### Estado por provider

| Provider | Búsqueda | Episodios | Videos | Notas |
|---|---|---|---|---|---|
| **CineCalidad** | ✅ | — | ✅ (iframe) | 5 streams directos (vimeos, goodstream, hlswish, voe, filemoon) |
| **PelisPedia** | ✅ | ✅ (POST) | ✅ (iframe-chain) | 2 streams reales vía fastream.to |
| **HomeCine** | ✅ | — | ✅ (iframe) | 2 streams reales vía fastream.to |
| **JKAnime** | ✅ | ✅ (`{slug}/{episode}/`) | ✅ (HLS directo) | Resuelve `jkplayer/um` → `.m3u8` real |
| **AnimeFLV** | ✅ | ✅ (URL pattern) | ✅ (jsvar) | 15 streams por episodio: SW, Mega, YourUpload, Okru, Streamtape |
| **TioAnime** | ✅ | ✅ (URL pattern) | ✅ (jsvar) | 12 streams por episodio: Mega, YourUpload, Okru, HQQ, StreamSB |
| **HenaoJara** | ✅ | ❌ sin config | ❌ dinámico | Encuentra página, video vía JS |
| **EstrenosAnime** | ✅ | ❌ sin config | ❌ dinámico | Encuentra página, video vía JS |
| **SoloLatino** | ✅ | ❌ sin config | ❌ dinámico | Encuentra página, video vía JS |
| **TVAnime (MonosChinos)** | ✅ | ❌ sin config | ❌ dinámico | Nuevo dominio vww.monoschinos2.net |
| **AnimeJL** | ❌ timeout | — | — | No responde — marcado `active: false` |
| **LatAnime** | ❌ timeout | — | — | No responde — marcado `active: false` |
| **PelisPanda** | ❌ React SPA | — | — | Renderizado cliente — marcado `active: false` |
| **HackTorrent** | ✅ | — | ✅ (torrent) | WordPress reactivado, streams torrent con infoHash |
| **PelisPlus** | ❌ dominio cambiado | — | — | Antes tioplus.app — marcado `active: false` |
| **MundoDonghua** | ❌ búsqueda client-side | — | — | Donghua, no anime |
| **TioDonghua** | ✅ | ❌ sin config | ❌ | Donghua (capítulos lectura) |
| **DonTorrent** | ✅ | ✅ (dontorrent) | ✅ (PoW torrent) | Anubis + PoW interno resuelto server-side. Pelis y series con infoHash |
| **MejorTorrent** | ✅ | — | ✅ (torrent) | Dominio www43 reactivado, categorías movie/tvshow/torrent |
| **PelisPanda** | ✅ | — | ✅ (torrent) | Dominio pelispanda.org reactivado, streams torrent con infoHash |

**Idiomas:** Castellano, Latino, VOSE, English, Japanese, Korean, Hindi, Portuguese.

**Servidores:** streamwish, filemoon, doodstream, streamtape, fembed, okru, mixdrop, upstream, vidhide, voe, mystream, netutv, yourupload, jawcloud, streampe, gvideo, torrent/magnet, jkplayer.

## Backend Scrapers (4 activos)

| Scraper | Fuente | Datos | Nota |
|---|---|---|---|
| 2embed (Vesy) | streamsrcs.2embed.cc | HTML parsed | Regex m3u8/mp4/iframe |
| 2embed (Vsrc) | streamsrcs.2embed.cc | HTML parsed | Regex m3u8/mp4/iframe |
| VidSrc | vidsrc.rip | API/HTML | Fetch con fallbacks |
| PoseidonHD | poseidonhd2.co | Next.js JSON | |

> **EZTV** y **Cuevana2** removidos en v1.2.0 — bloqueados desde Render (403/fetch failed).

## Endpoints

| Endpoint | Descripcion |
|---|---|
| `/manifest.json` | Stremio manifest (respeta `?configured=`) |
| `/stream/:type/:id.json` | Streams (backend + anime proxy + alfa + locals) |
| `/meta/:type/:id.json` | Metadata (TMDb + anime) |
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
- **Torrentio**: Añadido `es`, `cast`, `lat` a contentLanguage. Disponible para usuarios español.
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

## Stream Format (v1.3+)

Todos los streams se normalizan al mismo formato:

```
name:  "ProviderName\n1080p 🇯🇵🇪🇸"
title: "1080p | ProviderName\nServerName\nSerieEpisodio"
```

- **ProviderName** — etiqueta del provider (ej. `AnimeFLV`, `Alfa: Cuevana2`, `2embed`, `321MoviesFree`, `Mega`)
- **ServerName** — nombre detectado desde la URL (Mega, Streamtape, Mp4Upload, Okru, StreamSB...)
- **Línea extra** — episodio, HDR, Dual Audio, etc. (preservado del title original)
- **Flags** — banderas de idioma en `name` junto a la calidad (no se repiten en `title`)

## TODO / Próximas mejoras

- [x] **Health check de scrapers** — Stats en tiempo real + auto-disable + `GET /health`
- [x] **Caché de metadata** — `metaCache` con TTL 1h + `MAX_CACHE=1000`
- [x] **Deduplicación de streams** — `dedupeStreams()` por infoHash/url/name/title
- [x] **Etiquetado de calidad estandarizado** — `normalizeQuality()` con 20+ variantes → 6 estándar
- [x] **Paginación real en catálogos** — `skip`→ página, campo `next` en respuesta
- [x] **Config vía `.env`** — `dotenv` + `.env.example` + `TMDB_KEY`/`PORT` desde entorno
- [x] **Limpiar raíz** — `test_*.js` movidos a `tests/`
- [ ] **Tests automatizados** — Suite de tests que verifique que cada scraper responde estructura válida
- [ ] **Soporte Docker** — Dockerfile + docker-compose.yml para deploy sencillo
- [ ] **Priorizar providers por velocidad** — Ordenar streams: más rápidos primero
- [ ] **Idioma configurable en TMDB** — Opción en el panel de configuración para elegir idioma del catálogo/meta

## Créditos

- 62 scrapers originales: Yoruix, Phisher98, Wooodyhood, Piratezoro9, Abinanthankv, KennethJYS, Real-Morpheus, Xyr0nX, Yatin-Code, RaymondNoodles, D3adlyRocket
- Anime proxy: [Pigamer37/animeflv-stremio-addon](https://github.com/Pigamer37/animeflv-stremio-addon)
- Alfa providers: [alfa-addon/addon](https://github.com/alfa-addon/addon) (Kodi, GPL-3.0)
