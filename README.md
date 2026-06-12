# Ovnivers — Stream Provider v1.4.9

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
| **Local scrapers** | 62 providers Hermes ejecutados server-side |
| **Config panel** | `/configure` — tipos, calidad, idiomas, scrapers on/off |
| **Separación por categoría** | Pigamer37 solo para anime detectado; Alfa anime siempre para TV; Alfa principal + Backend + Hermes para todo |

## Catalogs (18)

| Tipo | Catalogs |
|---|---|
| **Movies** | Popular, Trending, Top Rated, By Genre, By Year |
| **Series** | Popular, Trending, Top Rated, By Genre, By Year |
| **Anime** | AnimeFLV/AnimeAV1/TioAnime/Henaojara On Air + Search |

## Alfa Providers (80+ canales)

Scraper unificado del addon **Alfa** de Kodi. Corre server-side en Render (Node.js). Busca con multiples variantes del título (EN/ES/JA/slug) en paralelo.

| Categoria | Count | Providers |
|---|---|---|
| **Peliculas** | 42 | AllCalidad, Cuevana2Espanol, PelisPedia, PoseidonHD, HDFull, Gnula, WolfMax4K, CineCalidad, DivXTotal, PelisFlix, TubePelis, ZonaLeros, AllPeliculas, BlogHorror, Cine24H, CineLibreOnline, DeTodoPeliculas, DoramasFlix, DoramedPlay, EntrePeliculasYSeries, EstrenosCinesaa, FlizzMovies, GenteClic, GranTorrent, HomeCine, LegalmenteGratis, MiraPeliculas, MiTorrent, OsjoNosu, PeliCineHD, PeliculasFlix, Pelis182, PelisForte, RetroTV, SeriesKao, TubeOnline, Yandispoiler, Zoowomaniacos, eCarteleraTrailers, HDFullS, Cuevana2, SinPeli |
| **Series** | 26 | EZTV, DoramasYT, FullSerieHD, SeriesRetro, LaCartoons, DoramasFlix, EntrePeliculasYSeries, SeriesKao, Asialiveaction, DivXTotal, DonTorrent, DoramedPlay, EstrenosCinesaa, EstrenosDoramas, GranTorrent, HDFull, HDFullS, HomeCine, MiTorrent, OsjoNosu, Pelis182, PelisPedia, PoseidonHD, RetroTV, TubeOnline, WolfMax4K, Yandispoiler, ZonaLeros |
| **Anime** | 22 | AnimeFLV, JKAnime, TioAnime, MonosChinos (TVAnime), VerAnime, LatAnime, HenaoJara, MundoDonghua, EstrenosAnime, AnimeJara, AnimeJL, HackTorrent, LaMovie, PelisPanda, PelisPlus, RepelisHD, SoloLatino, TioDonghua, VerAnimeAssistant, VerOnline, DoramasQueen, Ennovelas |
| **Documentales** | 5 | AreaDocumental, DocumentalesOnline, EliteTorrent, MejorTorrent, PelisPlus |
| **Torrents** | 12 | DonTorrent, GranTorrent, WolfMax4K, EZTV, HackTorrent, MiTorrent, EliteTorrent, MejorTorrent, BlogHorror, CineCalidad, DivXTotal, PelisPanda |

**Idiomas:** Castellano, Latino, VOSE, English, Japanese, Korean, Hindi, Portuguese.

**Servidores:** streamwish, filemoon, doodstream, streamtape, fembed, okru, mixdrop, upstream, vidhide, voe, mystream, netutv, yourupload, jawcloud, streampe, gvideo, torrent/magnet.

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

## Creditos

- 61 scrapers originales: Yoruix, Phisher98, Wooodyhood, Piratezoro9, Abinanthankv, KennethJYS, Real-Morpheus, Xyr0nX, Yatin-Code, RaymondNoodles, D3adlyRocket
- Anime proxy: [Pigamer37/animeflv-stremio-addon](https://github.com/Pigamer37/animeflv-stremio-addon)
- Alfa providers: [alfa-addon/addon](https://github.com/alfa-addon/addon) (Kodi, GPL-3.0)
