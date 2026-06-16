const QUALITY_TIERS = {
  '4K': 5, '2160p': 5, 'UHD': 5,
  '1080p': 4, 'FHD': 4, 'Full HD': 4,
  '720p': 3, 'HD': 3,
  '480p': 2, 'SD': 2,
  '360p': 1,
  'CAM': 0, 'TS': 0, 'TC': 0, 'SCR': 0,
};

const QUALITY_ORDER = ['4K', '1080p', '720p', '480p', 'HD', 'CAM'];

const LANG_CODES = {
  es: 'Castellano', cast: 'Castellano', castellano: 'Castellano', español: 'Castellano', espanol: 'Castellano',
  lat: 'Latino', latino: 'Latino',
  vose: 'VOSE', subtitulado: 'VOSE',
  en: 'English', english: 'English', eng: 'English',
  ja: 'Japanese', japanese: 'Japanese', jap: 'Japanese', jp: 'Japanese',
  ko: 'Korean', korean: 'Korean',
  hi: 'Hindi', hindi: 'Hindi',
  fr: 'French', french: 'French',
  pt: 'Portuguese', portuguese: 'Portuguese',
  it: 'Italian', italian: 'Italian',
  ar: 'Arabic', arabic: 'Arabic',
  zh: 'Chinese', chinese: 'Chinese',
  de: 'German', german: 'German',
  th: 'Thai', thai: 'Thai',
  ta: 'Tamil', tamil: 'Tamil',
  te: 'Telugu', telugu: 'Telugu',
};

const LANG_FLAGS = {
  es: '🇪🇸', cast: '🇪🇸', lat: '🇲🇽', vose: '🌐',
  en: '🇬🇧', ja: '🇯🇵', ko: '🇰🇷', hi: '🇮🇳',
  fr: '🇫🇷', pt: '🇧🇷', it: '🇮🇹', ar: '🇸🇦',
  zh: '🇨🇳', de: '🇩🇪', th: '🇹🇭', ta: '🇮🇳', te: '🇮🇳',
};

const DEFAULT_LANG_SCORES = {
  es: 3, cast: 3, lat: 2, vose: 1.5,
  en: 1, ja: 0.5, ko: 0.5, hi: 0.3,
  fr: 0.5, pt: 0.5, it: 0.5, ar: 0.3,
  zh: 0.3, de: 0.5, th: 0.3, ta: 0.3, te: 0.3,
};

const CODEC_TIERS = {
  'AV1': 3, 'HEVC': 2, 'x265': 2, 'H.265': 2, 'H265': 2,
  'x264': 1, 'H.264': 1, 'AVC': 1, 'H264': 1,
  'XviD': 0, 'DivX': 0,
};

const SOURCE_TIERS = {
  'Remux': 5, 'BluRay': 4, 'BRRip': 3,
  'WEB-DL': 3, 'WEBRip': 2, 'HDTV': 2,
  'DVD': 1, 'DVDRip': 1, 'DVD5': 1, 'DVD9': 1,
  'CAM': 0, 'TS': 0, 'TC': 0, 'SCR': 0,
};

const TMDB_KEY = process.env.TMDB_KEY || 'd80ba92bc7cefe3359668d30d06f3305';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

module.exports = {
  QUALITY_TIERS, QUALITY_ORDER,
  LANG_CODES, LANG_FLAGS, DEFAULT_LANG_SCORES,
  CODEC_TIERS, SOURCE_TIERS,
  TMDB_KEY, TMDB_BASE, UA,
};
