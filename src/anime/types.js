const ANIME_SOURCE_PREFIXES = ['animeflv:', 'animeav1:', 'henaojara:', 'tioanime:', 'jkanime:'];
const ANIME_XREF_PREFIXES = ['anilist:', 'kitsu:', 'mal:', 'anidb:', 'tmdb:'];
const ANIME_LOCAL_PREFIXES = ['ovn-anime:'];
const ANIME_PREFIXES = [...ANIME_SOURCE_PREFIXES, ...ANIME_XREF_PREFIXES, ...ANIME_LOCAL_PREFIXES];

const ANIME_GENRE_ID = 16;
const ANIME_ORIGIN_COUNTRY = 'JP';

const PIGAMER_BASE = process.env.PIGAMER_BASE || 'https://pigamer37.alwaysdata.net';
const AMATSU_BASE = 'https://amatsu.ruka.pw';

const ANIME_PROVIDER_IDS = new Set([
  'allanime', 'animekai', 'animepahe', 'animesalt', 'animetsu',
  'animeworld', 'anime-sama', 'hianime', 'allwish', 'anikototv',
  'onetouchtv'
]);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function isAnimeId(id) {
  return ANIME_PREFIXES.some(p => id.startsWith(p) || id.startsWith(p.replace(':', '|')));
}

function isAnimeSourceId(id) {
  return ANIME_SOURCE_PREFIXES.some(p => id.startsWith(p) || id.startsWith(p.replace(':', '|')));
}

function isAnimeXrefId(id) {
  return ANIME_XREF_PREFIXES.some(p => id.startsWith(p) || id.startsWith(p.replace(':', '|')));
}

function extractSlug(id) {
  const parts = id.split(':');
  return parts.length >= 2 ? parts[1] : id;
}

function isAnimeProvider(providerId) {
  return ANIME_PROVIDER_IDS.has(providerId);
}

module.exports = {
  ANIME_SOURCE_PREFIXES, ANIME_XREF_PREFIXES, ANIME_PREFIXES,
  ANIME_GENRE_ID, ANIME_ORIGIN_COUNTRY,
  PIGAMER_BASE, AMATSU_BASE, ANIME_PROVIDER_IDS, UA,
  isAnimeId, isAnimeSourceId, isAnimeXrefId, extractSlug, isAnimeProvider
};
