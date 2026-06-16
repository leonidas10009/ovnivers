const types = require('./types');
const { detectAnime } = require('./detector');
const { resolveAnimeId, getAnimeTMDbId, resolveToTMDbId } = require('./resolver');
const pigamer = require('./pigamer');
const amatsu = require('./amatsu');
const { filterLocalProviders, getAlfaCategory } = require('./providers');

module.exports = {
  ...types,
  detectAnime,
  resolveAnimeId,
  getAnimeTMDbId,
  resolveToTMDbId,
  pigamer,
  amatsu,
  filterLocalProviders,
  getAlfaCategory,
};
