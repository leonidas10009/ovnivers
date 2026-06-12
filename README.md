# Ovnivers — All-in-One Nuvio Addon v1.5.0

Addon para **Nuvio 0.7.5** con 62 scrapers locales (61 originales + 80+ providers de Alfa Kodi) + 6 backend scrapers + anime via Pigamer37.

## Instalacion

1. Abri **Nuvio** > **Settings** > **Addons**
2. Agrega esta URL:
   ```
   https://ovnivers.onrender.com/manifest.json
   ```
3. Para personalizar, usa el panel:
   ```
   https://ovnivers.onrender.com/configure
   ```

## Features

| Funcionalidad | Detalle |
|---|---|
| **Movies & TV** (backend) | 2embed (Vesy + Vsrc), VidSrc, EZTV, Cuevana2Espanol, PoseidonHD |
| **Anime** (proxy) | AnimeFLV, AnimeAV1, TioAnime, Henaojara via Pigamer37 |
| **Alfa Providers** (local) | 80+ canales de Alfa Kodi: peliculas, series, anime, documentales, torrents |
| **Original scrapers** (local) | 61 providers de All-in-One-Nuvio (EN, HI, FR, JA, KO, ZH) |
| **Catalogs** | 18 catalogs: Popular, Trending, Top Rated, By Genre, By Year + Anime On Air/Search |
| **Metadata** | TMDb + anime providers |
| **Config panel** | `/configure` — UI moderna: tipos, calidad, idiomas, scrapers on/off |

## Catalogs (18)

| Tipo | Catalogs |
|---|---|
| **Movies** | Popular, Trending, Top Rated, By Genre, By Year |
| **Series** | Popular, Trending, Top Rated, By Genre, By Year |
| **Anime** | AnimeFLV/AnimeAV1/TioAnime/Henaojara On Air + Search |

## Alfa Providers (80+ canales)

Scraper unificado del addon **Alfa** de Kodi. Corre localmente en el dispositivo.

| Categoria | Count | Providers |
|---|---|---|
| **Peliculas** | 42 | AllCalidad, Cuevana2Espanol, PelisPedia, PoseidonHD, HDFull, Gnula, WolfMax4K, CineCalidad, DivXTotal, PelisFlix, TubePelis, ZonaLeros, AllPeliculas, BlogHorror, Cine24H, CineLibreOnline, DeTodoPeliculas, DoramasFlix, DoramedPlay, EntrePeliculasYSeries, EstrenosCinesaa, FlizzMovies, GenteClic, GranTorrent, HomeCine, LegalmenteGratis, MiraPeliculas, MiTorrent, OsjoNosu, PeliCineHD, PeliculasFlix, Pelis182, PelisForte, RetroTV, SeriesKao, TubeOnline, Yandispoiler, Zoowomaniacos, eCarteleraTrailers, HDFullS, Cuevana2, SinPeli |
| **Series** | 26 | EZTV, DoramasYT, FullSerieHD, SeriesRetro, LaCartoons, DoramasFlix, EntrePeliculasYSeries, SeriesKao, Asialiveaction, DivXTotal, DonTorrent, DoramedPlay, EstrenosCinesaa, EstrenosDoramas, GranTorrent, HDFull, HDFullS, HomeCine, MiTorrent, OsjoNosu, Pelis182, PelisPedia, PoseidonHD, RetroTV, TubeOnline, WolfMax4K, Yandispoiler, ZonaLeros |
| **Anime** | 20 | AnimeFLV, JKAnime, TioAnime, MonosChinos (TVAnime), VerAnime, LatAnime, HenaoJara, MundoDonghua, EstrenosAnime, AnimeJara, AnimeJL, HackTorrent, LaMovie, PelisPanda, PelisPlus, RepelisHD, SoloLatino, TioDonghua, VerAnimeAssistant, VerOnline, DoramasQueen, Ennovelas |
| **Documentales** | 5 | AreaDocumental, DocumentalesOnline, EliteTorrent, MejorTorrent, PelisPlus |
| **Torrents** | 12 | DonTorrent, GranTorrent, WolfMax4K, EZTV, HackTorrent, MiTorrent, EliteTorrent, MejorTorrent, BlogHorror, CineCalidad, DivXTotal, PelisPanda |

**Idiomas:** Castellano, Latino, VOSE, English, Japanese, Korean, Hindi, Portuguese.

**Servidores:** streamwish, filemoon, doodstream, streamtape, fembed, okru, mixdrop, upstream, vidhide, voe, mystream, netutv, yourupload, jawcloud, streampe, gvideo, torrent/magnet.

## Backend Scrapers (6)

| Scraper | Fuente | Tipo |
|---|---|---|
| 2embed (Vesy) | streamsrcs.2embed.cc | API JSON |
| 2embed (Vsrc) | streamsrcs.2embed.cc | API JSON |
| VidSrc | vidsrc.rip | API JSON |
| EZTV | eztvx.to | Torrent/Magnet |
| Cuevana2 | cuevana2espanol.net | Next.js JSON |
| PoseidonHD | poseidonhd2.co | Next.js JSON |

## Endpoints

| Endpoint | Descripcion |
|---|---|
| `/manifest.json` | Stremio manifest (respeta `?configured=`) |
| `/stream/:type/:id.json` | Streams (backend + anime proxy) |
| `/catalog/:type/:id.json` | 18 catalogs (TMDb + anime) |
| `/meta/:type/:id.json` | Metadata (TMDb + anime) |
| `/configure` | Panel de configuracion (UI moderna) |
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

## Creditos

- 61 scrapers originales: Yoruix, Phisher98, Wooodyhood, Piratezoro9, Abinanthankv, KennethJYS, Real-Morpheus, Xyr0nX, Yatin-Code, RaymondNoodles, D3adlyRocket
- Anime proxy: [Pigamer37/animeflv-stremio-addon](https://github.com/Pigamer37/animeflv-stremio-addon)
- Alfa providers: [alfa-addon/addon](https://github.com/alfa-addon/addon) (Kodi, GPL-3.0)
