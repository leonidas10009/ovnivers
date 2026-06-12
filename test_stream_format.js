/**
 * test_stream_format.js
 * Tests what raw stream data looks like BEFORE and AFTER normalizeStream
 * for ALL provider types: local scrapers, backend, Alfa, Pigamer37
 *
 * Usage: node test_stream_format.js
 */

const path = require('path');
const fs = require('fs');

// ─── Mock normalizeStream (copy from server.js) ───
const LANG_TO_FLAG = {
  'cast': '🇪🇸',   'lat': '🇪🇸',    'es': '🇪🇸',
  'ja': '🇯🇵',     'jp': '🇯🇵',
  'en': '🇬🇧',     'us': '🇺🇸',
  'ko': '🇰🇷',     'kr': '🇰🇷',
  'vose': '🇬🇧🇪🇸', 'vos': '🇬🇧🇪🇸',
  'fr': '🇫🇷',     'pt': '🇧🇷',
  'zh': '🇨🇳',     'cn': '🇨🇳',
  'de': '🇩🇪',     'it': '🇮🇹',
  'th': '🇹🇭',     'ar': '🇸🇦',
  '*': ''
};

function langToFlags(langStr) {
  if (!langStr) return '';
  if (/[\u{1F1E6}-\u{1F1FF}]{2,}/u.test(langStr)) return langStr;
  const set = new Set(langStr.split(/[,;\s]+/).map(l => LANG_TO_FLAG[l.trim().toLowerCase()] || '').filter(Boolean));
  return [...set].join('');
}

const SERVER_MAP = [
  [/\b(?:mega\.nz|mega\.co\.nz)\b/i, 'Mega'],
  [/\bok\.ru\b/i, 'Okru'],
  [/\bmp4upload\.(?:com|to)\b/i, 'Mp4Upload'],
  [/\bstreamtape\b/i, 'Streamtape'],
  [/\bstreamsb\b/i, 'StreamSB'],
  [/\bstreamlare\b/i, 'StreamLare'],
  [/\bdoood?ster\b/i, 'DoodStream'],
  [/\byourupload\b/i, 'YourUpload'],
  [/\bmediafire\b/i, 'MediaFire'],
  [/\bdrive\.google\b/i, 'Google Drive'],
  [/\bgounlimited\b/i, 'GoUnlimited'],
  [/\bfembed\b/i, 'Fembed'],
  [/\bvidstream\b/i, 'VidStream'],
  [/\bnetutv\b/i, 'NetuTV'],
  [/\brapidvideo\b/i, 'RapidVideo'],
  [/\bstreamango\b/i, 'Streamango'],
  [/\bmail\.ru\b/i, 'MailRu'],
  [/\bupstream\b/i, 'Upstream'],
  [/\bvidcache\b/i, 'VidCache'],
  [/\bvideawe\b/i, 'VideaWe'],
  [/\bvudeo\b/i, 'Vudeo'],
  [/\bstreamwire\b/i, 'StreamWire'],
  [/\bclipwatching\b/i, 'ClipWatching'],
  [/\bvidmoly\b/i, 'VidMoly'],
  [/\bstreamvid\b/i, 'StreamVid'],
  [/\bembed(?:\.)?(?:6|7|8|9)\b/i, 'Embed'],
  [/\bpixeldrain\b/i, 'PixelDrain'],
  [/\b1fichier\b/i, '1Fichier'],
  [/\buptobox\b/i, 'UptoBox'],
  [/\bturbobit\b/i, 'TurboBit'],
  [/\bhitfile\b/i, 'HitFile'],
  [/\buploaded\b/i, 'Uploaded'],
  [/\bkatfile\b/i, 'KatFile'],
  [/\bddownload\b/i, 'DDownload'],
  [/\bfiledot?com\b/i, 'FileCom'],
  [/\b321moviesfree\b/i, '321MoviesFree'],
  [/\bvoxzer\b/i, 'Voxzer'],
  [/\bhostingersite\b/i, 'Hostinger'],
  [/\bworkers\.dev\b/i, 'Cloudflare Worker'],
  [/\bnotorrent2?\.workers\.dev\b/i, 'NoTorrent CDN'],
  [/\b(?:www\.)?aqua-vulture/i, 'Hostinger'],
];

function detectServerName(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const proxiedUrl = parsed.searchParams.get('url');
    if (proxiedUrl) {
      for (const [re, name] of SERVER_MAP) {
        if (re.test(proxiedUrl)) return name;
      }
      const proxyHost = new URL(proxiedUrl).hostname.replace(/^www\./, '');
      return proxyHost.substring(0, 25);
    }
  } catch {}
  for (const [re, name] of SERVER_MAP) {
    if (re.test(url)) return name;
  }
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host.substring(0, 25);
  } catch {
    return url.substring(0, 25);
  }
}

function normalizeStream(stream, providerId, providerName, opts = {}) {
  if (!stream || typeof stream !== 'object') return null;
  const url = stream.url || stream.file || stream.src || stream.link;
  const hasPlayableTarget = url || stream.externalUrl || stream.infoHash;
  if (!hasPlayableTarget) return null;

  const rawName = stream.name || '';
  const rawTitle = stream.title || '';
  let nameLines = rawName.split('\n');
  if (nameLines.length === 1 && nameLines[0].includes(' \u2022 ')) {
    const parts = nameLines[0].split(' \u2022 ');
    nameLines = [parts[0], parts.slice(1).join(' \u2022 ')];
  }
  const titleLines = rawTitle.split('\n');

  const sourceName = nameLines[0] || '';

  // Detect language from audio descriptors
  const AUDIO_LANG_MAP = [
    [/[áa]udio latino/i, 'lat'],
    [/[áa]udio castellano/i, 'cast'],
    [/[áa]udio espa\u00F1ol|[áa]udio espanol/i, 'es'],
    [/[áa]udio ingl[eé]s|[áa]udio ingles/i, 'en'],
    [/[áa]udio japon[eé]s|[áa]udio japones/i, 'ja'],
    [/[áa]udio coreano/i, 'ko'],
    [/[áa]udio portugu[eê]s|[áa]udio portugues/i, 'pt'],
    [/[áa]udio franc[eé]s|[áa]udio frances/i, 'fr'],
    [/t[uü]rk[çc]e ses/i, 'tr'],
  ];
  let audioLang = '';
  for (const [re, lang] of AUDIO_LANG_MAP) {
    if (re.test(rawName + ' ' + rawTitle)) {
      audioLang = lang;
      break;
    }
  }

  const allText = [stream.quality, rawName, rawTitle].filter(Boolean).join(' ');
  const quality = stream.quality
    || allText.match(/\b(4K|2160p?|1080p?|720p?|480p?|HD|FHD|SD)\b/i)?.[0]
    || 'HD';

  const contentFlags = Array.isArray(opts.contentLanguage) ? langToFlags(opts.contentLanguage.join(',')) : '';
  const descriptionFlags = langToFlags(stream.description || '');
  const audioFlags = audioLang ? langToFlags(audioLang) : '';
  const inlineFlagLine = [...nameLines, ...titleLines].find(l => /[\u{1F1E6}-\u{1F1FF}]{2,}/u.test(l)) || '';
  const inlineFlags = inlineFlagLine ? (inlineFlagLine.match(/[\u{1F1E6}-\u{1F1FF}]{2,}/ug) || []).join('') : '';
  const flags = contentFlags || audioFlags || descriptionFlags || inlineFlags;

  const isPigamer = providerId === 'pigamer37';
  const isAlfa = providerId === 'alfa-providers';
  let providerLabel;
  if (isPigamer && sourceName && !sourceName.match(/^\d+$/) && sourceName !== quality && sourceName !== providerName) {
    providerLabel = `Pigamer37: ${sourceName}`;
  } else if (isAlfa && sourceName && !sourceName.match(/^\d+$/) && sourceName !== quality && sourceName !== providerName) {
    providerLabel = `Alfa: ${sourceName}`;
  } else if (sourceName && !sourceName.match(/^\d+$/) && sourceName !== quality && sourceName !== providerName) {
    providerLabel = sourceName;
  } else {
    providerLabel = providerName;
  }

  const name = `${providerLabel}\n${quality}${flags ? ' ' + flags : ''}`;

  const titleParts = [`${quality} | ${providerLabel}`];
  const seen = new Set();
  const addLine = (text) => {
    const t = text.trim();
    if (t && !seen.has(t.toLowerCase()) && t !== providerLabel && t !== sourceName && t !== quality
        && !t.match(/^\s*(HD|4K|2160p?|1080p?|720p?|480p?)\s*$/i)
        && !t.match(/^[\u{1F1E6}-\u{1F1FF}]{2,}$/u)) {
      seen.add(t.toLowerCase());
      titleParts.push(t);
    }
  };

  for (let i = 1; i < nameLines.length; i++) {
    const cleaned = nameLines[i]
      .replace(/\b(4K|2160p?|1080p?|720p?|480p?)\b/gi, '')
      .replace(/[\u{1F1E6}-\u{1F1FF}]{2,}/ug, '')
      .replace(/^[⚙️🔗📦\s]+/, '')
      .replace(/[\s,;]+/g, ' ')
      .trim();
    if (cleaned) addLine(cleaned);
  }

  for (const line of titleLines) {
    let cleaned = line
      .replace(/^[⚙️🔗📦\s]+/, '')
      .replace(/[\s,;]+/g, ' ')
      .trim();
    cleaned = cleaned.replace(/^\s*(HD|4K|2160p?|1080p?|720p?|480p?)\s*[|\-·]\s*/i, '').trim();
    if (cleaned) addLine(cleaned);
  }

  // URL server name detection (always add if found)
  if (url) {
    const serverName = detectServerName(url);
    if (serverName) addLine(serverName);
  }

  if (flags && !titleParts.some(p => p.includes(flags))) {
    titleParts.push(flags);
  }

  const title = titleParts.join('\n');

  return { name, title, ...(url ? { url } : {}) };
}

// ─── Simulated stream data ───
// These are the RAW stream formats from each provider type
// that normalizeStream needs to handle correctly

const SIMULATED_STREAMS = {

  // ── PIGAMER37 (AnimeFLV, TioAnime, etc.) ──
  pigamer37_animeflv: {
    raw: { name: "AnimeFLV\nMega\n1080p🇯🇵🇪🇸", title: "1080p\n⚙️ Mega\n🔗 AnimeFLV\n🇯🇵🇪🇸\nNaruto Shippuden 220", url: "https://mega.nz/file/example" },
    providerId: 'pigamer37', opts: {},
    expect: {
      name_contains: ["Pigamer37: AnimeFLV", "1080p", "🇯🇵🇪🇸"],
      title_contains: ["1080p | Pigamer37: AnimeFLV", "Mega", "Naruto Shippuden 220", "🇯🇵🇪🇸"]
    }
  },

  pigamer37_tioanime: {
    raw: { name: "TioAnime\nStreamtape\n720p🇪🇸", title: "720p\n⚙️ Streamtape\n🔗 TioAnime\n🇪🇸\nOne Piece 1070", url: "https://streamtape.com/v/example" },
    providerId: 'pigamer37', opts: {},
    expect: {
      name_contains: ["Pigamer37: TioAnime", "720p", "🇪🇸"],
      title_contains: ["720p | Pigamer37: TioAnime", "Streamtape", "One Piece 1070", "🇪🇸"]
    }
  },

  pigamer37_animeav1: {
    raw: { name: "AnimeAV1\nMp4Upload\n1080p🇯🇵🇪🇸", title: "1080p\n⚙️ Mp4Upload\n🔗 AnimeAV1\n🇯🇵🇪🇸\nJujutsu Kaisen 24", url: "https://www.mp4upload.com/example" },
    providerId: 'pigamer37', opts: {},
    expect: {
      name_contains: ["Pigamer37: AnimeAV1", "1080p", "🇯🇵🇪🇸"],
      title_contains: ["1080p | Pigamer37: AnimeAV1", "Mp4Upload", "Jujutsu Kaisen 24"]
    }
  },

  // ── LOCAL PROVIDER (NoTorrent, etc.) ──
  local_notorrent: {
    raw: {
      name: "NoTorrent\n1080p",
      url: "https://example.com/stream.mp4"
    },
    opts: { contentLanguage: ['en', 'es'] },
    expect: {
      name_contains: ["NoTorrent", "1080p", "🇬🇧🇪🇸"],
      title_contains: ["1080p | NoTorrent"]
    }
  },

  local_notorrent_with_title: {
    raw: {
      name: "NoTorrent\n1080p",
      title: "1080p | Notorrent Server\nHDR\nDual Audio",
      url: "https://example.com/stream.mp4"
    },
    opts: { contentLanguage: ['en', 'es'] },
    expect: {
      name_contains: ["NoTorrent", "1080p", "🇬🇧🇪🇸"],
      title_contains: ["1080p | NoTorrent", "Notorrent Server", "HDR", "Dual Audio"]
    }
  },

  local_generic: {
    raw: {
      name: "ProviderName\n720p",
      url: "https://cdn.example.com/hls/playlist.m3u8"
    },
    opts: { contentLanguage: ['en'] },
    expect: {
      name_contains: ["ProviderName", "720p", "🇬🇧"],
      title_contains: ["720p | ProviderName"]
    }
  },

  local_with_quality_in_name: {
    raw: {
      name: "MovieBlast",
      url: "https://movieblast.example/stream"
    },
    opts: { contentLanguage: ['es'] },
    expect: {
      name_contains: ["MovieBlast", "HD", "🇪🇸"],
      title_contains: ["HD | MovieBlast"]
    }
  },

  // ── ALFA PROVIDER ──
  alfa_animeflv: {
    raw: {
      name: "AnimeFLV\nServer1",
      title: "1080p\n⚙️ Server1\n🔗 AnimeFLV",
      description: "lat,cast",
      url: "https://server1.example.com/stream.m3u8"
    },
    opts: {},
    expect: {
      name_contains: ["AnimeFLV", "1080p", "🇪🇸"],
      title_contains: ["1080p | AnimeFLV", "Server1", "🇪🇸"]
    }
  },

  alfa_tioanime: {
    raw: {
      name: "TioAnime\nServer2",
      title: "720p\n⚙️ Server2\n🔗 TioAnime\n🇯🇵🇪🇸",
      url: "https://server2.example.com/stream.m3u8"
    },
    opts: {},
    expect: {
      name_contains: ["TioAnime", "720p", "🇯🇵🇪🇸"],
      title_contains: ["720p | TioAnime", "Server2", "🇯🇵🇪🇸"]
    }
  },

  // ── BACKEND SCRAPER ──
  backend_2embed: {
    raw: { name: "2embed\n1080p", url: "https://2embed.example/stream.m3u8" },
    providerId: 'backend', opts: {},
    expect: {
      name_contains: ["2embed", "1080p"],
      title_contains: ["1080p | 2embed"]
    }
  },

  // ── PIGAMER37 with external URL (torrent) ──
  pigamer37_torrent: {
    raw: { name: "AnimeFLV\nTorrent\n1080p🇯🇵🇪🇸", title: "1080p\n🔗 Torrent\n🔗 AnimeFLV\n🇯🇵🇪🇸", infoHash: "abcdef1234567890abcdef1234567890abcdef12", url: "d14:announce...le" },
    providerId: 'pigamer37', opts: {},
    expect: {
      name_contains: ["Pigamer37: AnimeFLV", "1080p", "🇯🇵🇪🇸"],
      title_contains: ["1080p | Pigamer37: AnimeFLV", "Torrent", "🇯🇵🇪🇸"]
    }
  },

  // ── PIGAMER37 with no title ──
  pigamer37_notitle: {
    raw: { name: "Henaojara\nOkru\n480p🇪🇸", url: "https://ok.ru/video/example" },
    providerId: 'pigamer37', opts: {},
    expect: {
      name_contains: ["Pigamer37: Henaojara", "480p", "🇪🇸"],
      title_contains: ["480p | Pigamer37: Henaojara", "Okru"]
    }
  },

  // ── EDGE CASE: name has quality line with icons ──
  alfa_generic: {
    raw: {
      name: "ProviderTitle\n📦 ServerX\n1080p🇪🇸",
      title: "1080p\n📦 ServerX\n🔗 ProviderTitle",
      url: "https://serverx.com/video"
    },
    opts: {},
    expect: {
      name_contains: ["ProviderTitle", "1080p", "🇪🇸"],
      title_contains: ["1080p | ProviderTitle", "ServerX", "🇪🇸"]
    }
  },

  // ── MOVIE/TV: VidSrc type stream ──
  vidsrc_movie: {
    raw: {
      name: "VidSrc\n1080p",
      url: "https://vidsrc.example/embed/movie/550"
    },
    providerId: 'vidsrc', opts: { contentLanguage: ['en'] },
    expect: {
      name_contains: ["VidSrc", "1080p", "🇬🇧"],
      title_contains: ["1080p | VidSrc"]
    }
  },

  // ── MOVIE/TV: goes through Alfa provider with no language flags ──
  alfa_movie_generic: {
    raw: {
      name: "MovieSource\nServerX",
      title: "1080p\n⚙️ ServerX\n🔗 MovieSource\nen",
      url: "https://example.com/stream"
    },
    opts: { contentLanguage: ['en'] },
    expect: {
      name_contains: ["MovieSource", "1080p", "🇬🇧"],
      title_contains: ["1080p | MovieSource", "ServerX", "🇬🇧"]
    }
  },

  // ── MOVIE/TV: NoTorrent with known server URL ──
  notorrent_mega: {
    raw: {
      name: "NoTorrent\n1080p",
      url: "https://mega.nz/file/abc123"
    },
    providerId: 'notorrent', opts: { contentLanguage: ['en'] },
    expect: {
      name_contains: ["NoTorrent", "1080p", "🇬🇧"],
      title_contains: ["1080p | NoTorrent", "Mega", "🇬🇧"]
    }
  },

  // ── MOVIE/TV: 4K quality ──
  movie_4k_quality: {
    raw: {
      name: "StreamFlix\n4K",
      url: "https://streamflix.example/play"
    },
    providerId: 'streamflix', opts: { contentLanguage: ['en'] },
    expect: {
      name_contains: ["StreamFlix", "4K", "🇬🇧"],
      title_contains: ["4K | StreamFlix"]
    }
  },

  // ── Alfa from provider with language in contentLanguage ──
  alfa_series_with_lang: {
    raw: {
      name: "Cineby\nS1",
      title: "720p\n⚙️ S1\n🔗 Cineby",
      url: "https://s1.example.com/video"
    },
    opts: { contentLanguage: ['es'] },
    expect: {
      name_contains: ["Cineby", "720p", "🇪🇸"],
      title_contains: ["720p | Cineby", "S1", "🇪🇸"]
    }
  },

  // ── NoTorrent bullet separator format ──
  notorrent_bullet: {
    raw: {
      name: "NoTorrent • Audio latino",
      title: "1080p",
      quality: "1080p",
      url: "https://lat.notorrent2.workers.dev/?url=https://ww20.321moviesfree.com/detail/movie"
    },
    opts: { contentLanguage: [] },
    expect: {
      name_contains: ["NoTorrent", "1080p", "🇪🇸"],
      title_contains: ["1080p | NoTorrent", "Audio latino", "321MoviesFree", "🇪🇸"]
    }
  },

  // ── NoTorrent with original audio (no flag) ──
  notorrent_original: {
    raw: {
      name: "NoTorrent • Original audio",
      title: "1080p",
      quality: "1080p",
      url: "https://en.notorrent2.workers.dev/?url=https://ww20.321moviesfree.com/es/detail/serie"
    },
    opts: { contentLanguage: [] },
    expect: {
      name_contains: ["NoTorrent", "1080p"],
      title_contains: ["1080p | NoTorrent", "Original audio", "321MoviesFree"]
    }
  },

  // ── NoTorrent with Portuguese audio ──
  notorrent_portuguese: {
    raw: {
      name: "NoTorrent • Áudio português",
      title: "720p",
      quality: "720p",
      url: "https://pt.notorrent2.workers.dev/?url=https://ww20.321moviesfree.com/es/detail/movie"
    },
    opts: { contentLanguage: [] },
    expect: {
      name_contains: ["NoTorrent", "720p", "🇧🇷"],
      title_contains: ["720p | NoTorrent", "Áudio português", "321MoviesFree", "🇧🇷"]
    }
  },
};

// ─── Run tests ───
let passed = 0;
let failed = 0;
const failures = [];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║        normalizeStream — Raw Stream Format Test              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

for (const [name, test] of Object.entries(SIMULATED_STREAMS)) {
  process.stdout.write(`\n📦 ${name}\n`);
  process.stdout.write(`   RAW name:    ${JSON.stringify(test.raw.name)}\n`);
  process.stdout.write(`   RAW title:   ${JSON.stringify(test.raw.title)}\n`);

  const result = normalizeStream(test.raw, test.providerId || 'test-provider', 'TestProvider', test.opts);

  process.stdout.write(`   NORM name:   ${JSON.stringify(result.name)}\n`);
  process.stdout.write(`   NORM title:  ${JSON.stringify(result.title)}\n`);

  let ok = true;
  const errors = [];

  if (test.expect.name_contains) {
    for (const exp of test.expect.name_contains) {
      if (!result.name.includes(exp)) {
        ok = false;
        errors.push(`name missing: ${JSON.stringify(exp)}`);
      }
    }
  }

  if (test.expect.title_contains) {
    for (const exp of test.expect.title_contains) {
      if (!result.title.includes(exp)) {
        ok = false;
        errors.push(`title missing: ${JSON.stringify(exp)}`);
      }
    }
  }

  // Check no duplicate flags in name
  const flagTest = result.name.match(/[\u{1F1E6}-\u{1F1FF}]{2,}/ug);
  if (flagTest && flagTest.length > 2) {
    ok = false;
    errors.push(`duplicate flags in name: ${flagTest.join('')}`);
  }

  if (ok) {
    process.stdout.write(`   ✅ PASS\n`);
    passed++;
  } else {
    process.stdout.write(`   ❌ FAIL — ${errors.join('; ')}\n`);
    failed++;
    failures.push({ name, errors, raw: test.raw, result });
  }
}

console.log('\n═══════════════════════════════════════════════════');
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  📦 Total:  ${Object.keys(SIMULATED_STREAMS).length}`);
console.log('═══════════════════════════════════════════════════');

if (failures.length > 0) {
  console.log('\n❌ FAILURES:');
  for (const f of failures) {
    console.log(`\n  --- ${f.name} ---`);
    console.log(`  Raw:    ${JSON.stringify(f.raw)}`);
    console.log(`  Result: ${JSON.stringify(f.result)}`);
    console.log(`  Errors: ${f.errors.join(', ')}`);
  }
}

console.log('\n=== DONE ===');

// ─── Now try loading actual local providers and testing their stream output ───
console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
console.log('║     Live Provider Test — Call getStreams() on real modules    ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const manifestPath = path.join(__dirname, 'manifest.json');
let manifestScrapers = [];
try {
  manifestScrapers = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')).scrapers || [];
} catch (e) {
  console.log(`⚠️  Could not load manifest.json: ${e.message}`);
}

(async () => {
  // ── Test configurations ──
  const testCases = [
    { label: 'MOVIE (550 - Fight Club)', type: 'movie',  id: '550', season: 1, episode: 1, filter: s => s.supportedTypes?.includes('movie') },
    { label: 'SERIES (1399 - GoT)',       type: 'tv',     id: '1399', season: 1, episode: 1, filter: s => s.supportedTypes?.includes('tv') },
    { label: 'ANIME (1429 - SnK)',         type: 'tv',     id: '1429', season: 1, episode: 1, filter: s => s.supportedTypes?.includes('tv') },
  ];

  for (const tc of testCases) {
    console.log(`\n─── ${tc.label} ───\n`);
    const providers = manifestScrapers.filter(s =>
      s?.enabled && s.filename && tc.filter(s) &&
      !s.filename.includes('alfa-providers')
    );

    console.log(`  Found ${providers.length} providers\n`);

    let loaded = 0;
    let hadStreams = 0;

    for (const scraper of providers.slice(0, 25)) { // Test up to 25 per category
      const filename = path.normalize(scraper.filename);
      const fullPath = path.resolve(__dirname, filename);
      if (!fullPath.startsWith(path.resolve(__dirname))) continue;

      try {
        const mod = require(fullPath);
        const getStreams = mod?.getStreams || mod?.default?.getStreams;
        if (typeof getStreams !== 'function') continue;

        loaded++;
        const data = await Promise.resolve(getStreams(tc.id, tc.type, tc.season, tc.episode)).catch(() => []);
        const streams = Array.isArray(data) ? data : [];

        if (streams.length === 0) continue;
        hadStreams++;

        const raw = streams[0];
        const norm = normalizeStream(raw, scraper.id, scraper.name || scraper.id, {
          contentLanguage: scraper.contentLanguage
        });

        console.log(`  📦 ${(scraper.name || scraper.id).padEnd(18)} (${streams.length})`);
        console.log(`      RAW  name: ${JSON.stringify(raw.name || '')}`);
        console.log(`      RAW  title:${JSON.stringify(raw.title || '')}`);
        console.log(`      RAW  q:${raw.quality || '-'}  desc:${raw.description ? raw.description.substring(0,30) : '-'}  infoHash:${!!raw.infoHash}  file:${!!raw.file}`);
        console.log(`      NORM name: ${norm.name.replace(/\n/g, ' │ ')}`);
        if (norm.title.includes('\n')) {
          const tlines = norm.title.split('\n');
          console.log(`      NORM title:${tlines[0]}`);
          for (let i = 1; i < tlines.length; i++) {
            console.log(`                  ${tlines[i]}`);
          }
        } else {
          console.log(`      NORM title:${norm.title}`);
        }
        console.log('');
      } catch (e) {
        // silently skip load errors
      }
    }

    console.log(`  → ${hadStreams}/${loaded} providers returned streams\n`);
  }

  console.log('--- Live provider test complete ---');
})();
