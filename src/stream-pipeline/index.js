const cheerio = require('cheerio-without-node-native') || require('cheerio');
const { resolveEmbed } = require('../alfa-providers/embed-resolver');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';
const FETCH_TIMEOUT = 15000;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_RESET_MS = 5 * 60 * 1000;

// ─── Helpers ──────────────────────────────

async function fetchAPI(url, opts = {}, timeout = FETCH_TIMEOUT) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': '*/*', ...opts.headers }, signal: ctrl.signal, ...opts });
    if (!res.ok) return null;
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  } catch { return null; } finally { clearTimeout(t); }
}

function parseSources(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.sources)) return data.sources;
  if (Array.isArray(data.streams)) return data.streams;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

// ─── Circuit Breaker ──────────────────────

class CircuitBreaker {
  constructor(name) {
    this.name = name;
    this.failures = 0;
    this.successes = 0;
    this.total = 0;
    this.lastFail = 0;
    this.open = false;
    this.avgMs = 0;
  }
  success(ms) {
    this.total++; this.successes++;
    this.failures = 0;
    this.avgMs = (this.avgMs * (this.total - 1) + ms) / this.total;
    this.open = false;
  }
  fail(ms) {
    this.total++; this.failures++;
    this.lastFail = Date.now();
    this.avgMs = (this.avgMs * (this.total - 1) + ms) / this.total;
    if (this.failures >= CIRCUIT_BREAKER_THRESHOLD) this.open = true;
  }
  shouldSkip() {
    if (this.open && Date.now() - this.lastFail < CIRCUIT_RESET_MS) return true;
    if (this.open && Date.now() - this.lastFail >= CIRCUIT_RESET_MS) { this.open = false; this.failures = 0; }
    return false;
  }
  stats() {
    return { total: this.total, ok: this.successes, fail: this.total - this.successes, failStreak: this.failures, avgMs: Math.round(this.avgMs), healthy: !this.open };
  }
}

// ─── Stream Normalizer ────────────────────

const LANG_TO_FLAG = {
  'cast': '🇪🇸', 'lat': '🇪🇸', 'es': '🇪🇸', 'espanol': '🇪🇸', 'castellano': '🇪🇸',
  'ja': '🇯🇵', 'jp': '🇯🇵', 'jap': '🇯🇵', 'japones': '🇯🇵',
  'en': '🇬🇧', 'us': '🇺🇸',
  'ko': '🇰🇷', 'kr': '🇰🇷',
  'sub': '🇯🇵🇪🇸', 'vose': '🇬🇧🇪🇸', 'vos': '🇬🇧🇪🇸',
  'fr': '🇫🇷', 'pt': '🇧🇷', 'zh': '🇨🇳', 'cn': '🇨🇳', 'de': '🇩🇪', 'it': '🇮🇹',
  'th': '🇹🇭', 'ar': '🇸🇦', 'hi': '🇮🇳', 'ta': '🇮🇳', 'te': '🇮🇳', '*': ''
};

function langToFlags(langStr) {
  if (!langStr) return '';
  if (/[\u{1F1E6}-\u{1F1FF}]{2,}/u.test(langStr)) return langStr;
  const flags = langStr.split(/[,;\s]+/).map(l => LANG_TO_FLAG[l.trim().toLowerCase()] || '').filter(Boolean);
  return [...new Set(flags)].join('');
}

function normalizeQuality(text) {
  if (!text) return 'HD';
  const t = String(text).trim();
  if (/\b(4K|2160p?|UHD|Ultra\s*HD)\b/i.test(t)) return '4K';
  if (/\b(1080p?|FHD|Full\s*HD)\b/i.test(t)) return '1080p';
  if (/\b(720p?|HD\s*Ready)\b/i.test(t)) return '720p';
  if (/\b(480p?|SD)\b/i.test(t)) return '480p';
  if (/\b(CAM|TS|TC|SCR|R5|CAMRip|Telesync|HDTS|HDTC)\b/i.test(t)) return 'CAM';
  return 'HD';
}

function languageScore(stream) {
  const allText = `${stream.name || ''}\n${stream.title || ''}\n${stream.description || ''}`.toLowerCase();
  let score = 0;
  if (/\b(castellano|español|espanol|audio castellano|audio español|españa|castellano latino)\b/i.test(allText)) score += 2;
  if (/\b(latino|audio latino|lat)\b/i.test(allText)) score += 1.5;
  if (/\b(vose|vos|subtitulado)\b/i.test(allText)) score += 1;
  if (/\b(dual|multi).*?(audio|idioma|lang)/i.test(allText)) score += 1.5;
  if (/\b(cast|es)\b/i.test(allText)) score += 0.5;
  return score;
}

let providerIndex = 0;
function normalizeStream(stream, source) {
  if (!stream || typeof stream !== 'object') return null;
  const url = stream.url || stream.file || stream.src || stream.link;
  const hasPlayableTarget = url || stream.externalUrl || stream.infoHash;
  if (!hasPlayableTarget) return null;

  const rawName = stream.name || '';
  const rawTitle = stream.title || '';
  const nameLines = rawName.split('\n');
  const titleLines = rawTitle.split('\n');
  const sourceName = nameLines[0] || source;

  // Quality
  const allText = [stream.quality, rawName, rawTitle].filter(Boolean).join(' ');
  const quality = normalizeQuality(allText.match(/\b(4K|2160p?|UHD|1080p?|FHD|720p?|480p?|CAM|TS|TC|SCR)\b/i)?.[0] || stream.quality || '');

  // Language flags
  const descFlags = langToFlags(stream.description || '');
  const inlineFlags = [...nameLines, ...titleLines].join(' ').match(/[\u{1F1E6}-\u{1F1FF}]{2}/ug)?.join('') || '';
  const flags = descFlags || inlineFlags;

  // Type emoji
  const isTorrent = !!stream.infoHash || /^magnet:/i.test(url || '');
  const typeEmoji = isTorrent ? '\u{1F9F2}' : '\u{1F4FA}';

  const name = `${typeEmoji} ${source}\n${quality}${flags ? ' ' + flags : ''}`;
  const title = `${typeEmoji} ${quality} | ${source}`;

  const hasInfoHash = !!stream.infoHash;
  const isDirectMedia = url && /\.(mp4|m3u8|mkv|webm|avi)(\?|$)/i.test(url);

  return {
    name, title,
    id: `stream_${providerIndex++}`,
    quality,
    source,
    languageFlags: flags,
    languageScore: languageScore(stream),
    ...(url ? { url } : {}),
    ...(hasInfoHash ? { infoHash: stream.infoHash } : {}),
    ...(stream.sources ? { sources: stream.sources } : {}),
    ...(stream.externalUrl ? { externalUrl: stream.externalUrl } : {}),
    behaviorHints: {
      notWebReady: !hasInfoHash && !isDirectMedia,
      bingeGroup: stream.behaviorHints?.bingeGroup || `source|${source}`,
    }
  };
}

// ─── TMDB Resolver ────────────────────────

async function resolveTMDBId(rawId, mediaType) {
  if (!rawId) return null;
  if (rawId.startsWith('tt')) {
    const data = await fetchAPI(`https://api.themoviedb.org/3/find/${rawId}?api_key=${TMDB_KEY}&external_source=imdb_id`);
    const results = data?.[mediaType === 'tv' ? 'tv_results' : 'movie_results'];
    return results?.[0]?.id || null;
  }
  if (rawId.match(/^\d+$/)) return rawId;
  return null;
}

// ─── Provider Registry ────────────────────

const providerRegistry = [];
const circuitBreakers = new Map();

function register(provider) {
  providerRegistry.push(provider);
  circuitBreakers.set(provider.name, new CircuitBreaker(provider.name));
}

function getCircuitBreaker(name) {
  return circuitBreakers.get(name);
}

function getAllCircuitBreakers() {
  const result = [];
  for (const [name, cb] of circuitBreakers) {
    result.push({ name, ...cb.stats() });
  }
  return result;
}

// ─── Stream Pipeline ──────────────────────

class StreamPipeline {
  constructor(options = {}) {
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 10 * 60 * 1000;
    this.maxCache = options.maxCache || 1000;
    this.maxResults = options.maxResults || 80;
    this.maxEmbedResolve = options.maxEmbedResolve || 12;
    this.castellanoPriority = options.castellanoPriority !== false;
  }

  async execute(type, id, options = {}) {
    const { season = 1, episode = 1, langPref = [] } = options;
    const mediaType = type === 'series' || type === 'anime' ? 'tv' : type;

    // Cache check
    const ck = `${type}:${id}:${season}:${episode}`;
    const cached = this.cache.get(ck);
    if (cached && Date.now() - cached.time < this.cacheTTL) {
      return cached.data;
    }

    const tmdbId = await resolveTMDBId(id, mediaType);

    // Collect from all providers
    const rawStreams = [];
    const activeProviders = providerRegistry.filter(p => p.enabled !== false);

    const chunks = this._chunk(activeProviders, 8);
    for (const chunk of chunks) {
      const settled = await Promise.allSettled(
        chunk.map(p => this._executeProvider(p, id, tmdbId, mediaType, type, season, episode))
      );
      for (const r of settled) {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) rawStreams.push(...r.value);
      }
    }

    // Deduplicate
    const seen = new Set();
    const deduped = [];
    for (const s of rawStreams) {
      const key = (s.infoHash || s.url || '').toLowerCase() + '|' + (s.name || '').toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(s);
    }

    // Sort: castellano first, then quality, then resolution
    if (this.castellanoPriority) {
      deduped.sort((a, b) => {
        const la = a.languageScore || 0;
        const lb = b.languageScore || 0;
        if (la !== lb) return lb - la;
        const qOrder = { '4K': 4, '1080p': 3, '720p': 2, '480p': 1, 'HD': 2, 'CAM': 0 };
        return (qOrder[b.quality] || 0) - (qOrder[a.quality] || 0);
      });
    }

    const result = deduped.slice(0, this.maxResults);

    // Post-pipeline embed resolution
    await this._resolveEmbeds(result);

    // Cache
    if (this.cache.size >= this.maxCache) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(ck, { data: result, time: Date.now() });

    return result;
  }

  async _resolveEmbeds(streams) {
    const unresolved = streams.filter(s => s.url && !s.infoHash && s.behaviorHints?.notWebReady);
    if (!unresolved.length) return;

    const toResolve = unresolved.slice(0, this.maxEmbedResolve);
    const resolved = await Promise.allSettled(
      toResolve.map(s => resolveEmbed(s.url, ''))
    );

    let count = 0;
    for (let i = 0; i < toResolve.length; i++) {
      if (resolved[i].status === 'fulfilled' && resolved[i].value) {
        const directUrl = resolved[i].value;
        if (/\.(m3u8|mp4)/i.test(directUrl)) {
          toResolve[i].url = directUrl;
          toResolve[i].behaviorHints = { ...toResolve[i].behaviorHints, notWebReady: false };
          count++;
        }
      }
    }
  }

  async _executeProvider(provider, rawId, tmdbId, mediaType, type, season, episode) {
    const cb = getCircuitBreaker(provider.name);
    if (cb && cb.shouldSkip()) return [];

    const start = Date.now();
    try {
      const streams = await Promise.race([
        provider.execute(rawId, tmdbId, mediaType, type, season, episode),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), provider.timeout || 30000))
      ]);

      const normalized = (Array.isArray(streams) ? streams : [])
        .map(s => normalizeStream(s, provider.name))
        .filter(Boolean);

      cb?.success(Date.now() - start);
      return normalized;
    } catch (e) {
      cb?.fail(Date.now() - start);
      return [];
    }
  }

  _chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
    return chunks;
  }
}

// ─── Export ──────────────────────────────

module.exports = { StreamPipeline, register, getCircuitBreaker, getAllCircuitBreakers, fetchAPI, parseSources, normalizeStream, resolveTMDBId, langToFlags, LANG_TO_FLAG };
