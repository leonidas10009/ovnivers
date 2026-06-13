# Ovnivers — Stream Provider v1.4.17

Addon para **Stremio** con streams de multiples fuentes. Sin catalogos propios — funciona con addons de catalogo externos (ej. TMDB Community Addon).

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

## Alfa Providers (85 registrados, 52 activos)

Scraper unificado del addon **Alfa** de Kodi. Corre server-side en Node.js.
Busca con multiples variantes del título (EN/ES/JA/slug) en paralelo.

| Categoria | Activos | Inactivos | Providers destacados |
|---|---|---|---|
| **Peliculas** | ~29 | ~13 | AllCalidad, PelisPedia, PoseidonHD, HDFull, Gnula, WolfMax4K, CineCalidad, DivXTotal, TubePelis, Cine24H, CineLibreOnline, DeTodoPeliculas, GranTorrent, HomeCine, MiraPeliculas, PelisForte, SeriesKao, TubeOnline, Yandispoiler, eCarteleraTrailers (+9 más) |
| **Series** | ~16 | ~6 | EZTV, DoramasYT, FullSerieHD, SeriesRetro, LaCartoons, PelisPedia, PoseidonHD, DivXTotal, DonTorrent, GranTorrent, HDFull, WolfMax4K (+4 más) |
| **Anime** | 10 | 12 | AnimeFLV, JKAnime, TioAnime, TVAnime (MonosChinos), HenaoJara, EstrenosAnime, SoloLatino, TioDonghua, DoramasQueen, HackTorrent |
| **Documentales** | 3 | 1 | AreaDocumental, DocumentalesOnline, EliteTorrent |

> ⚠️ **Nota:** JKAnime extrae videos server-side (HLS directo vía resolución de `jkplayer/um`). AnimeFLV, TioAnime, HenaoJara y otros encuentran las páginas pero cargan videos dinámicamente (requieren JS en cliente). Ver [Estado por provider](#estado-por-provider) abajo.

### Estado por provider

| Provider | Búsqueda | Episodios | Videos | Notas |
|---|---|---|---|---|
| **JKAnime** | ✅ | ✅ (`{slug}/{episode}/`) | ✅ (HLS directo) | Resuelve `jkplayer/um` → `.m3u8` real |
| **AnimeFLV** | ✅ | 🔄 (`var episodes`) | ❌ dinámico | Encuentra serie, video vía JS |
| **TioAnime** | ✅ | 🔄 (`var episodes`) | ❌ dinámico | Encuentra serie, video vía JS |
| **HenaoJara** | ✅ | ❌ sin config | ❌ dinámico | Encuentra página, video vía JS |
| **EstrenosAnime** | ✅ | ❌ sin config | ❌ dinámico | Encuentra página, video vía JS |
| **SoloLatino** | ✅ | ❌ sin config | ❌ dinámico | Encuentra página, video vía JS |
| **TVAnime (MonosChinos)** | ✅ | ❌ sin config | ❌ dinámico | Nuevo dominio vww.monoschinos2.net |
| **AnimeJL** | ❌ timeout | — | — | No responde — marcado `active: false` |
| **LatAnime** | ❌ timeout | — | — | No responde — marcado `active: false` |
| **PelisPanda** | ❌ React SPA | — | — | Renderizado cliente — marcado `active: false` |
| **HackTorrent** | ❌ React SPA | — | — | Renderizado cliente — marcado `active: false` |
| **PelisPlus** | ❌ dominio cambiado | — | — | Antes tioplus.app — marcado `active: false` |
| **MundoDonghua** | ❌ búsqueda client-side | — | — | Donghua, no anime |
| **TioDonghua** | ✅ | ❌ sin config | ❌ | Donghua (capítulos lectura) |

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

- [ ] **Tests automatizados** — Suite de tests que verifique que cada scraper responde estructura válida
- [ ] **Health check de scrapers** — Script que detecte providers caídos automáticamente
- [ ] **Caché de metadata** — Cache LRU para llamadas a TMDB en meta handler (evitar rate limiting)
- [ ] **Deduplicación de streams** — Agrupar streams duplicados por infoHash o URL
- [ ] **Etiquetado de calidad estandarizado** — Extraer calidad de forma consistente en todos los providers
- [ ] **Paginación real en catálogos** — Exponer páginas de TMDB correctamente en Stremio
- [ ] **Config vía `.env`** — Mover TMDB key, puerto, etc a variables de entorno
- [ ] **Limpiar raíz** — Mover `test_*.js` a `tests/`
- [ ] **Soporte Docker** — Dockerfile + docker-compose.yml para deploy sencillo
- [ ] **Priorizar providers por velocidad** — Ordenar streams: más rápidos primero

## Créditos

- 62 scrapers originales: Yoruix, Phisher98, Wooodyhood, Piratezoro9, Abinanthankv, KennethJYS, Real-Morpheus, Xyr0nX, Yatin-Code, RaymondNoodles, D3adlyRocket
- Anime proxy: [Pigamer37/animeflv-stremio-addon](https://github.com/Pigamer37/animeflv-stremio-addon)
- Alfa providers: [alfa-addon/addon](https://github.com/alfa-addon/addon) (Kodi, GPL-3.0)
