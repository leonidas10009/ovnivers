# Ovnivers — All-in-One Nuvio Addon v1.4.0

Addon para **Nuvio 0.7.5** con 61 scrapers locales + backend + anime via AnimeFLV/AnimeAV1/TioAnime/Henaojara.

## Instalacion

1. Abri **Nuvio** > **Settings** > **Addons**
2. Agrega esta URL:
   ```
   https://ovnivers.onrender.com/manifest.json
   ```
3. Para personalizar idioma/calidad/tipos, usa el panel de configuracion:
   ```
   https://ovnivers.onrender.com/configure
   ```
   Elige tus ajustes, click **"Generate Install URL"** y pega el link generado en Nuvio.

## Features

| Funcionalidad | Fuente |
|---|---|
| **Movies & TV** (backend) | 2embed (Vesy + Vsrc), VidSrc |
| **Anime** (proxy) | AnimeFLV, AnimeAV1, TioAnime, Henaojara via Pigamer37 |
| **Local scrapers** (61) | Ejecutados en el dispositivo (Hermes engine) |
| **Catalogs** | TMDb Popular + Anime On Air + Search |
| **Metadata** | TMDb + anime providers |
| **Config panel** | `/configure` — idioma, calidad, tipos, on/off |

## Providers locales incluidos (61)

### English / Multi-language

| Provider | Contenido | Idioma |
|---|---|---|
| 4KHDHub / 4KHDHub-NEW | Movies & TV | EN |
| AllMovieLand | Movies & TV | EN / HI / TA / TE |
| All-Wish | Movies & TV | EN / JA |
| Castle | Movies & TV | EN |
| Cineby | Movies & TV (4K) | AR / EN |
| CineFreak | Movies & TV | EN / HI |
| CinemaCity | Movies & TV | EN / HI / AR |
| CineMM | Movies & TV | EN |
| CineTV | Movies & TV | EN / HI |
| CorsaroViola | Movies & TV | EN / IT |
| Dahmermovies / Dahmermovies-TV | Movies & TV | EN |
| DooFlix | Movies & TV | EN / ES |
| FibWatch | Movies & TV | EN / HI |
| GoatAPI | Movies | EN |
| HDHub4u | Movies & TV | EN |
| HDMovie2 | Bollywood Movies | HI / EN |
| HindMoviez | Movies & TV | EN / HI |
| LA.Movie | Movies & TV | EN / ES |
| Lordflix | Movies & TV | EN |
| MovieBlast | Movies & TV | EN / HI / TA / TE |
| MovieBox | Movies & TV | EN / HI / TA / TE |
| Movies4u | Movies | EN / HI / TA |
| MoviesDrive | Movies & TV | EN / HI |
| MoviesMod | Movies & TV | EN |
| MultiVid | Movies & TV | EN |
| NetMirror | Movies & TV | EN / HI / TA / TE |
| NoTorrent | Movies & TV | EN / ES |
| Peachify | Movies & TV | EN / HI / TE / TA / PT |
| PlayIMDb | Movies & TV | EN / HI |
| ShowBox | Movies & TV | EN |
| StreamFlix | Movies & TV | EN / HI / TA |
| TopCartoons | Cartoons | EN |
| UHDMovies | Movies & TV | EN |
| VegaMovies | Movies & TV | EN / HI |
| VidEasy | Movies & TV | EN |
| VidFast | Movies & TV | EN |
| VidLink | Movies & TV | EN |
| VidSrc | Movies & TV | EN |
| VixSrc | Movies & TV | EN / IT |
| XPass | Movies & TV | EN / HI |
| ZinkMovies | Movies & TV | EN / HI / TA / TE |

### Spanish

| Provider | Contenido | Idioma |
|---|---|---|
| DooFlix | Movies & TV | ES / EN |
| LA.Movie | Movies & TV | ES / EN |
| NoTorrent | Movies & TV | ES / EN |

### French

| Provider | Contenido | Idioma |
|---|---|---|
| Anime-Sama | Anime | FR |
| Movix VF | Movies & TV | EN / FR |
| Nakios | Movies & TV (4K) | FR / EN |
| Purstream | Movies & TV | EN / FR |
| ToFlix | Movies & TV | EN / FR |

### Japanese / Anime (subtitled)

| Provider | Contenido | Idioma |
|---|---|---|
| AllAnime | Anime & Manga | EN / JA |
| AnikotoTV | Anime | EN / JA |
| AnimeKai | Anime | EN |
| AnimePahe | Anime | EN / JA |
| AnimeSalt | Anime | HI / EN / JA |
| Animetsu | Anime | EN / JA |
| AnimeWorld | Anime | HI / EN / JA |
| HiAnime | Anime (multi-server) | JA / EN |
| OneTouchTV | Asian Drama & Anime | EN / KO / JA / ZH |
| Torrentio | Movies & TV | EN / HI |

### Hindi / Tamil / Telugu

| Provider | Contenido | Idioma |
|---|---|---|
| HDMovie2 | Bollywood Movies | HI / EN |
| Isaidub | Tamil Movies | TA |
| MovieBox | Movies & TV | HI / TA / TE / EN |

### Korean / Chinese / Thai

| Provider | Contenido | Idioma |
|---|---|---|
| Kisskh | Asian Dramas | KO / ZH / JA / TH |
| OnlyKDrama | Asian Drama | KO |
| OneTouchTV | Asian Drama & Anime | KO / ZH |

## Endpoints

| Endpoint | Descripcion |
|---|---|
| `/manifest.json` | Stremio manifest |
| `/stream/:type/:id.json` | Streams (backend + anime proxy) |
| `/catalog/:type/:id.json` | TMDb Popular / Anime on air / search |
| `/meta/:type/:id.json` | Metadata (TMDb / anime) |
| `/configure` | Panel de configuracion |
| `/` | Health check |

## Desarrollo local

```bash
npm install
npm start        # Servidor en http://localhost:3000
```

En Nuvio agregas `http://TU_IP:3000/manifest.json`.

## Deploy

- **Render.com** — auto-deploy desde `main`
- **URL:** https://ovnivers.onrender.com

## Creditos

Scrapers originales: Yoruix, Phisher98, Wooodyhood, Piratezoro9 (Kabir), Abinanthankv, KennethJYS, Real-Morpheus, Xyr0nX, Yatin-Code, RaymondNoodles, D3adlyRocket.
Anime proxy: [Pigamer37/animeflv-stremio-addon](https://github.com/Pigamer37/animeflv-stremio-addon).
