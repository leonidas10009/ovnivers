const { LANG_CODES, LANG_FLAGS, DEFAULT_LANG_SCORES } = require('./types');

const LANG_ALIASES = {
  cast: 'es', castellano: 'es', espanol: 'es',
};

function detectLanguages(text) {
  if (!text) return [];
  const t = text.toLowerCase();
  const found = new Set();

  if (/\b(castellano|español|espanol|castellano latino|audio castellano)\b/i.test(t)) found.add('cast');
  if (/\b(latino|audio latino|lat)\b/i.test(t) && !found.has('cast')) found.add('lat');
  if (/\b(vose|subtitulado|sub\b)\b/i.test(t)) found.add('vose');
  if (/\b(dual|multi).*?(audio|idioma|lang)/i.test(t)) { found.add('cast'); found.add('lat'); }
  if (/\b(english|eng|inglés|ingles)\b/i.test(t)) found.add('en');
  if (/\b(japanese|japonés|japones|jap|jp)\b/i.test(t)) found.add('ja');
  if (/\b(korean|coreano|ko)\b/i.test(t)) found.add('ko');
  if (/\b(hindi|hind|hindi audio)\b/i.test(t)) found.add('hi');
  if (/\b(french|francés|frances|français|vf|vostfr)\b/i.test(t)) found.add('fr');
  if (/\b(portuguese|portugués|portugues|dublado)\b/i.test(t)) found.add('pt');
  if (/\b(italian|italiano|ita)\b/i.test(t)) found.add('it');
  if (/\b(arabic|árabe|arabe)\b/i.test(t)) found.add('ar');
  if (/\b(chinese|chino|mandarín|mandarin|cantonese|cantonés)\b/i.test(t)) found.add('zh');
  if (/\b(german|alemán|aleman|deutsch)\b/i.test(t)) found.add('de');
  if (/\b(thai|tailandés|tailandes)\b/i.test(t)) found.add('th');
  if (/\b(tamil)\b/i.test(t)) found.add('ta');
  if (/\b(telugu)\b/i.test(t)) found.add('te');

  if (found.size === 0) {
    if (/🇪🇸/u.test(text)) found.add('cast');
    if (/🇲🇽/u.test(text)) found.add('lat');
    if (/🇯🇵/u.test(text)) found.add('ja');
    if (/🇬🇧/u.test(text)) found.add('en');
    if (/🇰🇷/u.test(text)) found.add('ko');
    if (/🇮🇳/u.test(text)) found.add('hi');
    if (/🇫🇷/u.test(text)) found.add('fr');
    if (/🇧🇷/u.test(text)) found.add('pt');
    if (/🇮🇹/u.test(text)) found.add('it');
    if (/🇸🇦/u.test(text)) found.add('ar');
    if (/🇨🇳/u.test(text)) found.add('zh');
    if (/🇩🇪/u.test(text)) found.add('de');
  }

  return [...found];
}

function detectFromStream(stream) {
  const text = [stream.name, stream.title, stream.description, stream.audioLang]
    .filter(Boolean).join('\n');
  return detectLanguages(text);
}

function normalizeCodes(codes) {
  return codes.map(c => LANG_ALIASES[c] || c);
}

function computeScore(languages, userLangs) {
  if (!languages.length) return 0;
  const normalized = normalizeCodes(languages);
  if (!userLangs || !userLangs.length) {
    return normalized.reduce((sum, lang) => sum + (DEFAULT_LANG_SCORES[lang] || 0), 0);
  }

  let score = 0;
  for (const lang of normalized) {
    const idx = userLangs.indexOf(lang);
    if (idx >= 0) {
      score += Math.max(0, userLangs.length - idx);
    } else {
      score += DEFAULT_LANG_SCORES[lang] || 0;
    }
  }
  return score;
}

function matchesFilter(languages, userLangs) {
  if (!userLangs || !userLangs.length) return true;
  if (!languages.length) return true;
  const normalized = normalizeCodes(languages);
  return normalized.some(l => userLangs.includes(l));
}

function formatFlags(languages) {
  if (!languages.length) return '';
  return languages.map(l => LANG_FLAGS[l] || '').filter(Boolean).join('');
}

function formatNames(languages) {
  if (!languages.length) return '';
  return languages.map(l => LANG_CODES[l] || l).join(', ');
}

module.exports = {
  detectLanguages, detectFromStream,
  computeScore, matchesFilter, formatFlags, formatNames,
};
