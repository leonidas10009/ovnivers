# Ovnivers — Stream Provider v2.0.0

Addon **stream-only** para **Stremio / NuvioTV**. Provee streams de peliculas, series y anime desde multiples fuentes. Usalo junto con cualquier addon de catalogo (Torrentio, TMDB Community, Kitsu, etc.).

## URL publica

| Recurso | URL |
|----------|-----|
| **Manifest** | `https://ovnivers-frontend.calipo10009.workers.dev/manifest.json` |
| **Configurador** | `https://ovnivers-frontend.calipo10009.workers.dev/configure` |
| **Health** | `https://ovnivers-frontend.calipo10009.workers.dev/health` |

> Un Cloudflare Worker actua como reverse proxy via KV, manteniendo una URL permanente aunque el tunnel de Cloudflare cambie.

## Instalacion

1. Abri **Stremio** (Desktop o NuvioTV) > **Settings** > **Addons**
2. Anda al [configurador](https://ovnivers-frontend.calipo10009.workers.dev/configure)
3. Configura preferencias (idiomas, calidad, scrapers) > **Generate Install URL**
4. Copia la URL y pegala en Stremio (Install from URL)

## Arquitectura

```
Stremio Request
  |
  +-- src/anime/           -> 5 scrapers nativos (Puppeteer + cheerio)
  +-- src/torrent-providers/ -> 6 indexers (API + cheerio)
  +-- src/web-providers/   -> 74 scrapers con router multi-engine
        |
        +-- Static Engine   (cheerio, ~15MB, 200ms)
        +-- Intelligent Eng (auto-descubrimiento)
        +-- Dynamic Engine  (Puppeteer, ~200MB, 3-8s)
              |
        +-- Router (ProviderMemory: aprendizaje bayesiano)
```

| Engine | Uso | RAM | Velocidad |
|--------|-----|-----|-----------|
| **Static** | WordPress, PHP, APIs JSON | ~15MB | 200-900ms |
| **Intelligent** | Auto-descubrir selectores | ~15MB / ~200MB | 1-10s |
| **Dynamic** | Cloudflare, JS-heavy, SPA | ~200MB | 3-8s |

## Features

| Funcionalidad | Detalle |
|---|---|
| **Sistema Multi-Engine** | 3 motores de scraping con router inteligente y aprendizaje cross-sesion |
| **Torrent indexers** (6) | GloDLS, Nyaa.si, SolidTorrents, LimeTorrents, 1337x, EZTV |
| **Scrapers anime nativos** (5) | JKAnime, TioAnime, AnimeJara, AnimeAV1, AnimeFLV |
| **Web Providers** (74) | 41 activos con multi-engine: static -> intelligent -> dynamic |
| **Embed resolver** | 15+ dominios: streamwish, filemoon, doodstream, mixdrop, ok.ru, streamtape... |
| **notWebReady automatico** | m3u8/mp4/torrent -> ExoPlayer directo, resto -> browser |
| **Config panel** | `/configure` — tipos, calidad, idiomas, scrapers on/off |
| **Proxy inteligente** | Cloudflare Worker v2 con cookie jar y bypass |
| **ProviderMemory** | Aprendizaje bayesiano: recuerda que engine funciona mejor por provider |

## Torrent Indexers

| Indexador | Contenido | Resultados |
|---|---|---|
| **SolidTorrents** | Movies, TV, Anime | ~30 via API JSON |
| **GloDLS** | Movies & TV | ~15 via cheerio |
| **Nyaa.si** | Anime | ~20 via cheerio |
| **1337x** | Movies, TV, Anime | ~15 (5 mirrors) |
| **LimeTorrents** | Movies, TV | ~10 via cheerio |
| **EZTV** | TV series | Exactos por S/E via API |

**Scoring:** wordMatch estricto + seeds 12% + calidad 5% + ano 10% + S/E exacto + source/codec 3%. 13 trackers inyectados por magnet. Dedup por infoHash.

## Embed Resolver

| Dominio | Metodo |
|---|---|
| streamwish | Base64 decode -> m3u8/mp4 |
| filemoon | JS file extraction |
| doodstream | pass_md5 token |
| mixdrop | wurl JSON |
| voe.sx | eval decode |
| ok.ru | data-options -> metadataUrl |
| streamtape | robotlink token -> get_video API |
| upstream, netu.tv, vidmoly | m3u8/mp4 regex |
| JWPlayer | setup({sources}) / file key |
| Generico (fallback) | m3u8/mp4 regex + iframe follow |

## Backend Scrapers

| Scraper | Mirrors |
|---|---|
| **2embed+Mirrors** | vesy, vsrc, skin, cc, VidSrc pro/icu/xyz, SuperEmbed (8 mirrors rotativos) |
| **PoseidonHD** | 3 dominios rotativos |

## Web Providers (74 registrados, 41 activos)

### Estado real

| Categoria | Count | Detalle |
|---|---|---|
| **Funcionando** | 4 | CineCalidad, PelisPedia, DivXTotal, SeriesKao |
| **Cloudflare Turnstile** | 8 | detodopeliculas, doramasflix, pelicinehd, henaojara... |
| **Anubis PoW** | 1 | DonTorrent |
| **Deshabilitados** | 13 | shorteners, SPA/JS, YouTube, caidos, bloqueados |
| **0 videos** | 6 | bloghorror, gnula, poseidonhd, fullseriehd, seriesretro... |
| **Sin resultados** | 4 | hacktorrent, pelispanda, areadocumental, mejortorrent |

## Hermes Scrapers (61 registrados)

Scrapers legacy del ecosistema Nuvio/Hermes. 9 funcionales, 15 completan sin streams, 19 deshabilitados (dominio muerto), 10 anime-only.

## Stream Format

```json
{
  "name": "ProviderName\n1080p 🇯🇵🇪🇸",
  "title": "1080p | ProviderName\nServerName",
  "url": "https://.../video.m3u8",
  "quality": "1080p",
  "languages": ["cast", "en"],
  "notWebReady": false
}
```

| Campo | Descripcion |
|---|---|
| `url` | URL directa .mp4/.m3u8 o URL de embed HTML |
| `quality` | Normalizada: `4K`, `1080p`, `720p`, `480p`, `HD`, `CAM` |
| `languages` | Array de codigos: `cast`, `lat`, `en`, `ja`, `vose`... |
| `notWebReady` | `false` = directo (ExoPlayer). `true` = embed (WebView) |

## Deploy

- **Plataforma:** Coolify (self-hosted) — Docker + Cloudflare Tunnel
- **Container:** 1.5GB RAM, 1 vCPU, Node 20, Chromium
- **Build:** `Dockerfile` (node:20-slim + Chromium + curl)
- **Start:** `node --max-old-space-size=768 server.js`
- **Port:** 3000
- **Auto-deploy:** desde `main` en GitHub

## Desarrollo local

```bash
npm install
npm start        # http://localhost:3000
node build.js    # Build de scrapers
```

## Roadmap

- [ ] **AnimeFLV** — Actualizar scraper nativo al nuevo formato AJAX
- [ ] **RepelisPlus** — Extraer `var jaljz` JSON para streams
- [ ] **Cardigann** — Copiar YMLs de Prowlarr/Jackett para +500 trackers
- [ ] **Multi-engine en produccion** — Verificar Puppeteer + Chromium en Coolify/Docker
- [ ] **12 providers Cloudflare** — Activar dynamic engine
- [ ] **8 providers video fail** — Auto-descubrir selectores con intelligent engine
- [ ] **Nuvio compatibilidad** — Investigar por que NuvioTV no instala el addon
- [ ] **Tests automatizados** — Suite E2E por provider
- [ ] **Cache inteligente** — Pre-cachear streams de contenido popular

## Creditos

- 62 scrapers originales: Yoruix, Phisher98, Wooodyhood, Piratezoro9, Abinanthankv, KennethJYS, Real-Morpheus, Xyr0nX, Yatin-Code, RaymondNoodles, D3adlyRocket
- Sistema intelligent: [sistem-scraper-lite](https://github.com/)
- Anime scrapers: JKAnime, TioAnime, AnimeJara, AnimeAV1, AnimeFLV
- Cardigann engine: compatible con [Prowlarr](https://github.com/Prowlarr/Indexers) y [Jackett](https://github.com/Jackett/Jackett)
- Web Providers: basados en [alfa-addon/addon](https://github.com/alfa-addon/addon) (GPL-3.0)

---

[Changelog historico](CHANGELOG.md)
