const crypto = require('crypto');

/**
 * Parse the info hash from a .torrent file buffer.
 * The info hash is the SHA-1 of the bencoded 'info' dictionary.
 */
function parseTorrentInfoHash(buf) {
  try {
    const str = buf.toString('latin1');
    const infoStart = str.indexOf('4:info');
    if (infoStart < 0) return null;
    let i = infoStart + 5;
    const start = i;
    while (i < buf.length) {
      const c = String.fromCharCode(buf[i]);
      if (c === 'd') i++;
      else if (c === 'l') i++;
      else if (c === 'e') break;
      else if (c === 'i') {
        i = buf.indexOf('e'.charCodeAt(0), i);
        if (i < 0) return null;
        i++;
      } else if (c >= '0' && c <= '9') {
        const colon = buf.indexOf(':'.charCodeAt(0), i);
        if (colon < 0) return null;
        const len = parseInt(buf.toString('ascii', i, colon), 10);
        i = colon + 1 + len;
      } else {
        i++;
      }
    }
    const infoRaw = buf.slice(start, i);
    return crypto.createHash('sha1').update(infoRaw).digest('hex').toLowerCase();
  } catch {
    return null;
  }
}

module.exports = { parseTorrentInfoHash };
