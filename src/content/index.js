const profile = require('./profile');
const identifier = require('./identifier');
const episode = require('./episode');

module.exports = {
  profile,
  identifier,
  episode,
  ...identifier,
};
