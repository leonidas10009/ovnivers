const { ANIME_PROVIDER_IDS } = require('./types');

function filterLocalProviders(providers, isAnime, mediaType, type, config) {
  return providers.filter(provider => {
    if (isAnime && !ANIME_PROVIDER_IDS.has(provider.id)) return false;
    if (!isAnime && ANIME_PROVIDER_IDS.has(provider.id)) return false;
    return true;
  });
}

function getAlfaCategory(isAnime, type) {
  if (isAnime) return 'anime';
  if (type === 'series' || type === 'tv') return 'tvshow';
  if (type === 'movie') return 'movie';
  return 'movie';
}

module.exports = { filterLocalProviders, getAlfaCategory };
