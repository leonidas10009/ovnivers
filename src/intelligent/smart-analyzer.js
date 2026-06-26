// smart-analyzer.js — Semantic AI for URL/element classification
// Ported from sistem-scraper-lite/src/analysis/SmartAnalyzer.ts
// No browser/puppeteer required — pure logic, ~0 dependencies
// Classifies: element intent, URL types, page zones, server names

// ─── Element action patterns ──────────────────────────────────
const ACTION_PATTERNS = {
  'play-video': {
    words: [/play|reproduc|ver|watch|mirar|reproducir|stream|video|pelicula|movie|mirar/i],
    classPatterns: [/player|video|reproduc|stream|watch/i],
    attrPatterns: [/play|video|stream|reproduc|embed/i],
    baseScore: 25,
  },
  'switch-server': {
    words: [/server|servidor|opcion|mirror|fuente|source|cdn|host|altern/i],
    classPatterns: [/server|servidor|mirror|source|option/i],
    attrPatterns: [/server|source|mirror|cdn/i],
    baseScore: 25,
  },
  'change-language': {
    words: [/idioma|language|lang|audio|doblaje|dub|sub|subtit|castellano|latino|español|english|japanese|portuguese/i],
    classPatterns: [/idioma|language|lang|audio|dub/i],
    attrPatterns: [/lang|language|audio|dub/i],
    baseScore: 25,
  },
  'download': {
    words: [/download|descarg|bajar|descarga|guardar/i],
    classPatterns: [/download|descarg|btn-descarg/i],
    attrPatterns: [/download|descarg/i],
    baseScore: 25,
  },
  'navigate-episode': {
    words: [/episodio|episode|capitulo|chapter|cap\.?\s*\d|ep\.?\s*\d|^\d{1,4}$/i],
    classPatterns: [/episod|episode|capitul|chapter/i],
    attrPatterns: [/episod|episode|chapter/i],
    baseScore: 20,
  },
  'search': {
    words: [/buscar|search|busqueda|find|encontrar|filt/i],
    classPatterns: [/search|buscar|filtro|filter|find/i],
    attrPatterns: [/search|buscar|filter/i],
    baseScore: 30,
  },
  'filter': {
    words: [/filtro|filter|categoria|category|genero|genre|año|year|tipo|type|orden/i],
    classPatterns: [/filter|filtro|categor|genero|genre/i],
    attrPatterns: [/filter|categor/i],
    baseScore: 20,
  },
  'login': {
    words: [/login|iniciar|regist|cuenta|account|sign.?in|sign.?up|perfil|profile/i],
    classPatterns: [/login|auth|account|user|sign/i],
    attrPatterns: [/login|auth|account/i],
    baseScore: 20,
  },
  'social': {
    words: [/discord|telegram|facebook|twitter|instagram|whatsapp|reddit|youtube|tiktok/i],
    classPatterns: [/social|share|discord|telegram/i],
    attrPatterns: [/social|share/i],
    baseScore: 20,
  },
  'ad': {
    words: [/publicidad|anuncio|advert|patrocin/i],
    classPatterns: [/ad|ads|banner|publi|advert/i],
    attrPatterns: [/ad|ads/i],
    baseScore: 15,
  },
};

// ─── URL domain knowledge base ────────────────────────────────
const URL_DOMAIN_KB = {
  'streamtape.com': { type: 'embed', isContainer: true },
  'streamtape.net': { type: 'embed', isContainer: true },
  'uqload.com': { type: 'embed', isContainer: true },
  'uqload.co': { type: 'embed', isContainer: true },
  'ok.ru': { type: 'embed', isContainer: true },
  'mega.nz': { type: 'download', isContainer: true },
  'mega.co.nz': { type: 'download', isContainer: true },
  'yourupload.com': { type: 'embed', isContainer: true },
  'swhoi.com': { type: 'embed', isContainer: true },
  'netu.tv': { type: 'embed', isContainer: true },
  'netu.io': { type: 'embed', isContainer: true },
  'filemoon.sx': { type: 'embed', isContainer: true },
  'filemoon.to': { type: 'embed', isContainer: true },
  'streamwish.to': { type: 'embed', isContainer: true },
  'sfastwish.com': { type: 'embed', isContainer: true },
  'flaswish.com': { type: 'embed', isContainer: true },
  'embedwish.com': { type: 'embed', isContainer: true },
  'cdnwish.com': { type: 'cdn', isContainer: false },
  'hgcloud.to': { type: 'embed', isContainer: true },
  'bysekoze.com': { type: 'embed', isContainer: true },
  'hqq.tv': { type: 'embed', isContainer: true },
  'hqq.watch': { type: 'embed', isContainer: true },
  'discord.com': { type: 'social', isContainer: false },
  'discord.gg': { type: 'social', isContainer: false },
  'telegram.me': { type: 'social', isContainer: false },
  't.me': { type: 'social', isContainer: false },
  'facebook.com': { type: 'social', isContainer: false },
  'instagram.com': { type: 'social', isContainer: false },
  'twitter.com': { type: 'social', isContainer: false },
  'x.com': { type: 'social', isContainer: false },
  'youtube.com': { type: 'direct-video', isContainer: false },
  'youtu.be': { type: 'direct-video', isContainer: false },
  'google.com': { type: 'tracking', isContainer: false },
  'googletagmanager.com': { type: 'tracking', isContainer: false },
  'doubleclick.net': { type: 'tracking', isContainer: false },
  'googlesyndication.com': { type: 'tracking', isContainer: false },
  'cloudflare.com': { type: 'cdn', isContainer: false },
  'jsdelivr.net': { type: 'cdn', isContainer: false },
  'cdnjs.com': { type: 'cdn', isContainer: false },
  'unpkg.com': { type: 'cdn', isContainer: false },
  'mp4upload.com': { type: 'embed', isContainer: true },
  'dood.so': { type: 'embed', isContainer: true },
  'dood.ws': { type: 'embed', isContainer: true },
  'dood.wf': { type: 'embed', isContainer: true },
  'dood.re': { type: 'embed', isContainer: true },
  'dood.sh': { type: 'embed', isContainer: true },
  'mixdrop.co': { type: 'embed', isContainer: true },
  'mixdrop.ag': { type: 'embed', isContainer: true },
  'voe.sx': { type: 'embed', isContainer: true },
  'vidhide.com': { type: 'embed', isContainer: true },
  'vidmoly.to': { type: 'embed', isContainer: true },
  'upstream.to': { type: 'embed', isContainer: true },
  'vidoza.net': { type: 'embed', isContainer: true },
  'fembed.com': { type: 'embed', isContainer: true },
  'animejara.com': { type: 'navigation', isContainer: true },
  'henaojara.com': { type: 'navigation', isContainer: true },
  'tioanime.com': { type: 'navigation', isContainer: true },
  'animeflv.net': { type: 'navigation', isContainer: true },
  'jkanime.net': { type: 'navigation', isContainer: true },
  'monoschinos.com': { type: 'navigation', isContainer: true },
  'monoschinos2.net': { type: 'navigation', isContainer: true },
  // Additional embed domains (from test verification)
  'burstcloud.cc': { type: 'embed', isContainer: true },
  'burstcloud.to': { type: 'embed', isContainer: true },
  'hydrax.net': { type: 'embed', isContainer: true },
  'sbplay2.com': { type: 'embed', isContainer: true },
  'sbplay3.com': { type: 'embed', isContainer: true },
  // Anime site domains (for proper classification)
  'animeav1.com': { type: 'navigation', isContainer: true },
  'anime-jl.net': { type: 'navigation', isContainer: true },
  'latanime.org': { type: 'navigation', isContainer: true },
  'tiodonghua.com': { type: 'navigation', isContainer: true },
  'animeonline.ninja': { type: 'navigation', isContainer: true },
  'estrenosanime.net': { type: 'navigation', isContainer: true },
  'mundodonghua.com': { type: 'navigation', isContainer: true },
  // Additional embed/server domains
  'jawcloud.co': { type: 'embed', isContainer: true },
  'vidlox.me': { type: 'embed', isContainer: true },
  'vidfast.co': { type: 'embed', isContainer: true },
  'sendvid.com': { type: 'embed', isContainer: true },
  'zippyshare.com': { type: 'download', isContainer: false },
  'gounlimited.to': { type: 'embed', isContainer: true },
  'vidlox.net': { type: 'embed', isContainer: true },
  'vidlox.tv': { type: 'embed', isContainer: true },
  'wolfmax4k.com': { type: 'embed', isContainer: false },
  'streamlare.com': { type: 'embed', isContainer: true },
  'jaw.cloud': { type: 'embed', isContainer: true },
  'vudeo.net': { type: 'embed', isContainer: true },
  'vidozahd.com': { type: 'embed', isContainer: true },
  'uptobox.com': { type: 'embed', isContainer: true },
  'tapecontent.net': { type: 'embed', isContainer: true },
  'stpete.net': { type: 'embed', isContainer: true },
  // Download/file hosting domains
  'mediafire.com': { type: 'download', isContainer: true },
  'drive.google.com': { type: 'download', isContainer: true },
  'dropbox.com': { type: 'download', isContainer: true },
  '1fichier.com': { type: 'download', isContainer: true },
};

// ─── Server name inference ────────────────────────────────────
const KNOWN_SERVERS = {
  'streamtape.com': 'StreamTape', 'streamtape.net': 'StreamTape',
  'yourupload.com': 'YourUpload',
  'mega.nz': 'MEGA', 'mega.co.nz': 'MEGA',
  'ok.ru': 'OK.ru',
  'uqload.com': 'Uqload', 'uqload.co': 'Uqload',
  'hqq.tv': 'HQQ', 'hqq.watch': 'HQQ',
  'bysekoze.com': 'BySekoze',
  'swhoi.com': 'SWHOI',
  'netu.tv': 'Netu', 'netu.io': 'Netu',
  'filemoon.sx': 'Filemoon', 'filemoon.to': 'Filemoon',
  'streamwish.to': 'StreamWish', 'embedwish.com': 'EmbedWish',
  'cdnwish.com': 'CDNWish',
  'hgcloud.to': 'HGCloud',
  'nyuu.streamhj.top': 'Nyuu',
  'multiplayer.streamhj.top': 'MultiPlayer',
  'descargas.streamhj.top': 'Descargas',
  'descargas.henaojara.com': 'Descargas HenaoJara',
  'animejara.com': 'AnimeJara', 'henaojara.com': 'HenaoJara',
  'youtube.com': 'YouTube', 'youtu.be': 'YouTube',
  'dailymotion.com': 'Dailymotion',
  'vimeo.com': 'Vimeo',
  'drive.google.com': 'Google Drive',
  'dropbox.com': 'Dropbox',
  'mediafire.com': 'MediaFire',
  '1fichier.com': '1Fichier',
  'mixdrop.co': 'MixDrop', 'mixdrop.ag': 'MixDrop',
  'fembed.com': 'Fembed', 'fembed.net': 'Fembed',
  'playhydrax.com': 'Hydrax',
  'cloudvideo.tv': 'CloudVideo',
  'sbembed.com': 'SBEmbed', 'sbembed1.com': 'SBEmbed',
  'sbplay.org': 'SBPlay', 'sbplay1.com': 'SBPlay',
  'mystream.to': 'MyStream',
  'dood.so': 'DoodStream', 'dood.ws': 'DoodStream', 'dood.wf': 'DoodStream',
  'voe.sx': 'VOE',
  'vidhide.com': 'VidHide',
  'vidmoly.to': 'VidMoly',
  'mp4upload.com': 'MP4Upload',
  'upstream.to': 'UpStream',
  'vidoza.net': 'Vidoza',
  'burstcloud.cc': 'BurstCloud', 'burstcloud.to': 'BurstCloud',
  'vidcloud.tv': 'CloudVideo',
  'sbplay2.com': 'SBPlay', 'sbplay3.com': 'SBPlay',
  'hydrax.net': 'Hydrax',
  'jawcloud.co': 'JawCloud', 'jaw.cloud': 'JawCloud',
  'vidlox.me': 'VidLox', 'vidlox.tv': 'VidLox', 'vidlox.net': 'VidLox',
  'vidfast.co': 'VidFast',
  'sendvid.com': 'SendVid',
  'gounlimited.to': 'GoUnlimited',
  'wolfmax4k.com': 'WolfMax4K',
  'streamlare.com': 'StreamLare',
  'vudeo.net': 'Vudeo',
  'uptobox.com': 'UpToBox',
  'tapecontent.net': 'TapeContent',
};

// ─── SmartAnalyzer class ──────────────────────────────────────
class SmartAnalyzer {
  constructor() {
    this.urlCache = new Map();
    this.intentCache = new Map();
  }

  // ─── Element intent classification ──────────────────────────
  classifyElementIntent(el) {
    const cacheKey = el.selector + '|' + el.text;
    const cached = this.intentCache.get(cacheKey);
    if (cached) return cached;

    const combined = this._buildSignalText(el);
    const results = [];

    for (const [action, patterns] of Object.entries(ACTION_PATTERNS)) {
      let score = patterns.baseScore;
      const signals = [];

      for (const re of patterns.words) {
        if (re.test(combined.text)) {
          score += 15;
          signals.push('word:' + re.source.slice(1, -2));
        }
      }
      for (const re of patterns.classPatterns) {
        if (re.test(combined.classes)) {
          score += 12;
          signals.push('class:' + re.source.slice(1, -2));
        }
      }
      for (const re of patterns.attrPatterns) {
        if (re.test(combined.attrs)) {
          score += 8;
          signals.push('attr:' + re.source.slice(1, -2));
        }
      }

      if (el.type === 'clickable' || el.type === 'link') score += 5;
      if (el.type === 'text' || el.type === 'container') score -= 10;

      results.push({ action, score: Math.min(100, Math.max(0, score)), signals });
    }

    results.sort(function(a, b) { return b.score - a.score; });
    const best = results[0];

    const intent = best && best.score >= 35
      ? { action: best.action, confidence: best.score, signals: best.signals }
      : { action: 'unknown', confidence: 10, signals: [] };

    this.intentCache.set(cacheKey, intent);
    return intent;
  }

  // ─── Content relevance scoring ──────────────────────────────
  scoreContentRelevance(el, memory) {
    const factors = [];
    let total = 0;

    const intent = this.classifyElementIntent(el);
    const intentScores = {
      'play-video': 30, 'switch-server': 30, 'download': 25,
      'navigate-episode': 20, 'change-language': 18, 'search': 10,
      'filter': 12, 'sort': 5, 'navigate-page': 8,
      'login': -20, 'social': -15, 'ad': -25, 'unknown': 5,
    };
    const intentScore = intentScores[intent.action] || 5;
    total += intentScore;
    factors.push({ factor: 'intent:' + intent.action, contribution: intentScore });

    const typeScores = {
      'clickable': 15, 'link': 15, 'list-item': 12, 'input': 8,
      'select': 8, 'iframe': 25, 'video': 30, 'media': 28,
      'heading': 3, 'text': 0, 'image': 3, 'container': -5,
    };
    const typeScore = typeScores[el.type] || 0;
    total += typeScore;
    factors.push({ factor: 'type:' + el.type, contribution: typeScore });

    const urls = this._extractElementUrls(el);
    if (urls.length > 0) {
      const urlScore = Math.min(urls.length * 10, 30);
      total += urlScore;
      factors.push({ factor: 'has-urls', contribution: urlScore });
    }

    if (el.depth <= 3) {
      total += 8;
      factors.push({ factor: 'shallow-depth', contribution: 8 });
    } else if (el.depth > 10) {
      total -= 5;
      factors.push({ factor: 'deep-depth', contribution: -5 });
    }

    if (el.text.length >= 2 && el.text.length <= 40) {
      total += 5;
      factors.push({ factor: 'good-text-length', contribution: 5 });
    }

    if (/\d+/.test(el.text)) {
      total += 3;
      factors.push({ factor: 'has-numbers', contribution: 3 });
    }

    const dataKeys = Object.keys(el.attr || {}).filter(function(k) { return k.startsWith('data-'); });
    if (dataKeys.length > 0) {
      const dataScore = Math.min(dataKeys.length * 5, 15);
      total += dataScore;
      factors.push({ factor: 'has-data-attrs', contribution: dataScore });
    }

    total += 3;
    factors.push({ factor: 'visible', contribution: 3 });

    if (memory) {
      const typeBoost = memory.getTypeBoost(el.type);
      if (typeBoost > 0) {
        const memContrib = Math.min(typeBoost, 20);
        total += memContrib;
        factors.push({ factor: 'memory:' + el.type, contribution: memContrib });
      }

      const cls = (el.class || '').split(/\s+/)[0];
      if (cls) {
        const classBoost = memory.getClassBoost(cls);
        if (classBoost > 0) {
          const classContrib = Math.min(classBoost, 15);
          total += classContrib;
          factors.push({ factor: 'memory-class:' + cls, contribution: classContrib });
        }
      }

      const pred = memory.predictSuccess(el.type, cls);
      if (pred.confidence > 0.3 && pred.estimatedSuccess > 0.5) {
        const predContrib = Math.round(pred.estimatedSuccess * 15);
        total += predContrib;
        factors.push({ factor: 'predict:' + el.type, contribution: predContrib });
      }
    }

    const clampedScore = Math.min(100, Math.max(0, total));
    let relevance;
    if (clampedScore >= 55) relevance = 'high';
    else if (clampedScore >= 30) relevance = 'medium';
    else if (clampedScore >= 10) relevance = 'low';
    else relevance = 'skip';

    return { score: clampedScore, relevance, factors };
  }

  // ─── URL classification ─────────────────────────────────────
  classifyURL(url, context) {
    const cached = this.urlCache.get(url);
    if (cached) return cached;

    const signals = [];
    let type = 'unknown';
    let confidence = 20;
    let isContainer = false;

    const lowerUrl = url.toLowerCase();
    const domain = this.extractDomain(url);
    const path = this._extractPath(url);
    const ext = this._extractExtension(url);

    // Signal 1: Domain knowledge base (try exact + base domain)
    const known = URL_DOMAIN_KB[domain] || URL_DOMAIN_KB[this._getBaseDomain(domain)];
    if (known) {
      type = known.type;
      isContainer = known.isContainer;
      confidence = 85;
      signals.push('kb:' + domain);
    }

    // Signal 2: File extension
    if (/\.(mp4|mkv|avi|webm|mov|flv|wmv)($|\?)/i.test(lowerUrl)) {
      type = 'direct-video';
      confidence = Math.max(confidence, 95);
      signals.push('ext:' + ext);
    } else if (/\.(m3u8|mpd|hls)($|\?)/i.test(lowerUrl)) {
      type = 'stream';
      confidence = Math.max(confidence, 90);
      signals.push('ext:' + ext);
    } else if (/\.(zip|rar|7z|tar|gz)($|\?)/i.test(lowerUrl)) {
      type = 'download';
      confidence = Math.max(confidence, 80);
      signals.push('ext:' + ext);
    }

    // Signal 3: Path patterns
    if (/\/embed\/|\/player\/|\/reproductor\/|embed\.php|player\.php|reproductor/i.test(path)) {
      if (type === 'unknown') type = 'embed';
      isContainer = true;
      confidence = Math.max(confidence, 75);
      signals.push('path:embed');
    }
    if (/\/download\/|\/descargar\/|\/d\/|\/descarga\/|download\.php|descargar\.php/i.test(path)) {
      if (type === 'unknown') type = 'download';
      confidence = Math.max(confidence, 70);
      signals.push('path:download');
    }
    if (/\/video\/|\/v\/|\/stream\/|\.mp4|\.m3u8/i.test(path)) {
      if (type === 'unknown') type = 'direct-video';
      confidence = Math.max(confidence, 65);
      signals.push('path:video');
    }
    if (/\/e\/|\/episodio\/|\/episode\/|\/capitulo\/|\/chapter\/|\/ver\//i.test(path)) {
      if (type === 'unknown') type = 'navigation';
      isContainer = true;
      confidence = Math.max(confidence, 60);
      signals.push('path:episode');
    }

    // Signal 4: Context (button/link text)
    if (context) {
      const ctx = context.toLowerCase();
      if (/server|servidor|mirror|opcion/i.test(ctx)) {
        if (type === 'unknown') type = 'embed';
        isContainer = true;
        confidence = Math.max(confidence, 65);
        signals.push('ctx:server');
      }
      if (/download|descarg/i.test(ctx)) {
        if (type === 'unknown') type = 'download';
        confidence = Math.max(confidence, 65);
        signals.push('ctx:download');
      }
      if (/play|reproduc|ver|watch/i.test(ctx)) {
        if (type === 'unknown') type = 'embed';
        isContainer = true;
        confidence = Math.max(confidence, 60);
        signals.push('ctx:play');
      }
      if (/episodio|episode|capitulo|chapter/i.test(ctx)) {
        if (type === 'unknown') type = 'navigation';
        confidence = Math.max(confidence, 55);
        signals.push('ctx:episode');
      }
      if (/idioma|language|lang/i.test(ctx)) {
        confidence = Math.max(confidence, 50);
        signals.push('ctx:language');
      }
    }

    // Signal 5: Query params
    if (/[?&](token|auth|key|api|session|sid)=/i.test(lowerUrl)) {
      isContainer = false;
      signals.push('query:auth');
    }
    if (/[?&](redirect|url|goto|return|next)=/i.test(lowerUrl)) {
      isContainer = true;
      signals.push('query:redirect');
    }

    // Signal 6: Tracking/ad domains
    if (/analytics|track|pixel|beacon|stats|metric|collect/i.test(domain)) {
      type = 'tracking';
      confidence = 80;
      signals.push('domain:tracking');
    }

    const result = {
      type,
      confidence: Math.min(100, confidence),
      isContainer,
      signals,
    };

    this.urlCache.set(url, result);
    return result;
  }

  // ─── Prioritize elements for exploration ────────────────────
  prioritizeElements(elements, memory) {
    const self = this;
    const scored = elements.map(function(el) {
      return {
        el: el,
        score: self.scoreContentRelevance(el, memory),
        intent: self.classifyElementIntent(el),
      };
    });

    scored.sort(function(a, b) {
      if (a.score.relevance === 'skip' && b.score.relevance !== 'skip') return 1;
      if (b.score.relevance === 'skip' && a.score.relevance !== 'skip') return -1;
      if (a.score.score !== b.score.score) return b.score.score - a.score.score;
      return a.el.depth - b.el.depth;
    });

    return scored
      .filter(function(s) {
        if (s.intent.action === 'ad' || s.intent.action === 'social' || s.intent.action === 'login') return false;
        return true;
      })
      .map(function(s) { return s.el; });
  }

  // ─── Full page analysis ─────────────────────────────────────
  analyze(elements) {
    const elementIntents = new Map();
    const contentScores = new Map();
    const urlClassifications = new Map();

    const serverElements = [];
    const videoElements = [];
    const downloadElements = [];
    const navigationElements = [];
    let highRelevanceCount = 0;
    let contentElementCount = 0;

    for (const el of elements) {
      const intent = this.classifyElementIntent(el);
      const score = this.scoreContentRelevance(el);
      const urls = this._extractElementUrls(el);

      elementIntents.set(el.selector, intent);
      contentScores.set(el.selector, score);

      for (const url of urls) {
        if (!urlClassifications.has(url)) {
          urlClassifications.set(url, this.classifyURL(url, el.text));
        }
      }

      if (score.relevance === 'high') highRelevanceCount++;
      if (score.relevance !== 'skip') contentElementCount++;

      switch (intent.action) {
        case 'switch-server': serverElements.push(el); break;
        case 'play-video': videoElements.push(el); break;
        case 'download': downloadElements.push(el); break;
        case 'navigate-episode': navigationElements.push(el); break;
      }
    }

    return {
      elementIntents, contentScores, urlClassifications,
      summary: {
        contentElementCount, highRelevanceCount,
        serverElements, videoElements, downloadElements, navigationElements,
      },
    };
  }

  // ─── Server name inference ──────────────────────────────────
  inferServerName(domain) {
    if (KNOWN_SERVERS[domain]) return KNOWN_SERVERS[domain];

    const parts = domain.replace(/^www\.|^embed\.|^player\.|^cdn\.|^api\.|^static\./i, '').split('.');
    const main = parts.length > 1 ? parts[parts.length - 2] : parts[0];
    return main.charAt(0).toUpperCase() + main.slice(1).slice(0, 24);
  }

  // ─── URL candidate inference ────────────────────────────────
  inferCandidateUrls(knownUrls, searchTerm, baseUrl) {
    const candidates = [];
    const term = searchTerm.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (term.length < 2) return [];

    const pathPatterns = new Map();
    for (const url of knownUrls) {
      try {
        const u = new URL(url);
        const path = u.pathname;
        const segments = path.split('/').filter(Boolean);

        for (let i = 0; i < segments.length; i++) {
          const template = segments.map(function(s, idx) {
            if (idx === i) return '{slug}';
            if (/^\d+$/.test(s) || /\d+x\d+/.test(s)) return '{num}';
            return s;
          });
          const pattern = '/' + template.join('/') + '/';
          pathPatterns.set(pattern, (pathPatterns.get(pattern) || 0) + 1);
        }
      } catch { /* ignore */ }
    }

    const sortedPatterns = [...pathPatterns.entries()]
      .filter(function([, count]) { return count >= 2; })
      .sort(function(a, b) { return b[1] - a[1]; });

    for (const [pattern, count] of sortedPatterns) {
      const candidatePath = pattern.replace('{slug}', term).replace(/\{num\}/g, '');
      try {
        const base = new URL(baseUrl);
        const candidateUrl = base.origin + candidatePath;
        if (!knownUrls.includes(candidateUrl)) {
          candidates.push({ url: candidateUrl, confidence: Math.min(100, count * 25), pattern });
        }
      } catch { /* ignore */ }
    }

    return candidates
      .sort(function(a, b) { return b.confidence - a.confidence; })
      .slice(0, 4)
      .map(function(c) { return c.url; });
  }

  // ─── Utilities ──────────────────────────────────────────────
  _buildSignalText(el) {
    const text = (el.text || '').toLowerCase();
    const classes = (el.class || '').toLowerCase();
    const attrs = Object.values(el.attr || {}).join(' ').toLowerCase() +
      ' ' + Object.keys(el.attr || {}).join(' ').toLowerCase();
    return { text, classes, attrs };
  }

  _extractElementUrls(el) {
    const urls = [];
    const attr = el.attr || {};
    const src = attr.src || attr.href || '';
    if (src && !src.startsWith('#') && !src.startsWith('javascript:') && src !== 'about:blank') {
      urls.push(src);
    }
    for (const key of Object.keys(attr)) {
      if (key.startsWith('data-') && /url|src|href|link|video|embed/i.test(key)) {
        const val = attr[key];
        if (val && val.startsWith('http')) urls.push(val);
      }
    }
    const onclick = attr.onclick || '';
    const matches = onclick.match(/https?:\/\/[^'")\s]+/g);
    if (matches) urls.push(...matches);
    return urls;
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\d*\./, '');
    } catch {
      return url.replace(/https?:\/\//, '').split(/[/?#]/)[0] || url.slice(0, 40);
    }
  }

  _extractPath(url) {
    try { return new URL(url).pathname; }
    catch { return url; }
  }

  _extractExtension(url) {
    try {
      const path = new URL(url).pathname;
      const match = path.match(/\.([a-z0-9]{2,5})($|\?)/i);
      return match ? match[1] : '';
    } catch { return ''; }
  }

  _getBaseDomain(domain) {
    // Strip common subdomains: ww2., ww3., www1., vww., etc.
    const stripped = domain.replace(/^(?:ww[0-9]+|vww|www[0-9]*)\./, '');
    return stripped;
  }

  clearCache() {
    this.urlCache.clear();
    this.intentCache.clear();
  }
}

// ─── Singleton ─────────────────────────────────────────────────
let defaultInstance = null;

function getSmartAnalyzer() {
  if (!defaultInstance) {
    defaultInstance = new SmartAnalyzer();
  }
  return defaultInstance;
}

function resetSmartAnalyzer() {
  if (defaultInstance) defaultInstance.clearCache();
  defaultInstance = null;
}

module.exports = {
  SmartAnalyzer,
  getSmartAnalyzer,
  resetSmartAnalyzer,
  KNOWN_SERVERS,
  URL_DOMAIN_KB,
};
