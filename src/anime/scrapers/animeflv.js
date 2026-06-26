const cheerio = require('cheerio-without-node-native') || require('cheerio');

const BASE = 'https://animeflv.ar';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchText(url, timeout = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    clearTimeout(t);
    return null;
  }
}

/**
 * Search AnimeFLV by query. Returns up to 24 results.
 */
async function search(query) {
  const all = [];
  for (const page of [1, 2]) {
    const html = await fetchText(`${BASE}/browse?q=${encodeURIComponent(query)}&page=${page}`);
    if (!html) continue;
    const $ = cheerio.load(html);
    const items = $('ul.ListAnimes li');
    if (!items.length) break;
    items.each((_, el) => {
      const a = $(el).find('a').first();
      const href = a.attr('href') || '';
      const slug = href.replace('/anime/', '');
      if (!slug) return;
      all.push({
        title: $(el).find('h3.Title').text().trim(),
        slug,
        poster: $(el).find('figure img').attr('src') || '',
        type: ($(el).find('span.Type').text() || '').toLowerCase().includes('pelicula') ? 'movie' : 'series',
        synopsis: $(el).find('div.Description p').last().text().trim(),
      });
    });
    if (all.length >= 24) break;
  }
  return all;
}

/**
 * Get full anime metadata + episodes.
 */
async function getAnime(slug) {
  const html = await fetchText(`${BASE}/anime/${slug}`);
  if (!html) return null;
  const $ = cheerio.load(html);

  const title = $('h1.Title').text().trim();
  const rawType = $('span.Type').text().trim();
  const animeType = rawType.toLowerCase().includes('pelicula') ? 'movie' : 'series';
  const poster = $('div.AnimeCover figure img').attr('src') || '';
  const synopsis = $('div.Description p').first().text().trim();
  const genres = [];
  $('nav.Nvgnrs a').each((_, el) => { genres.push($(el).text().trim()); });

  let episodes = [];
  $('script').each((_, el) => {
    const text = $(el).html() || '';
    const m = text.match(/var episodes\s*=\s*(\[\[.*?\]\s*\]);/);
    if (m) {
      try {
        const arr = JSON.parse(m[1]);
        episodes = arr.map(ep => ({
          number: ep[0],
          id: `animeflv:${slug}:${ep[0]}`,
          url: `${BASE}/ver/${slug}-${ep[0]}`,
        }));
      } catch {}
    }
  });

  return { title, type: animeType, slug, poster, synopsis, genres, episodes };
}

/**
 * Get video streams for a specific episode.
 * Parses var videos = {SUB:[...], LAT:[...]} (old format) or detects new JS-based format.
 * New format (2026): animeflv.net loads videos via external trustedpromise.com script.
 *   HTML has "var videos = []" and initEpisode() loads data dynamically.
 *   The scraper falls back to empty results; Pigamer37 proxy handles the actual scraping.
 */
async function getStreams(slug, episode) {
  const html = await fetchText(`${BASE}/ver/${slug}-${episode}`);
  if (!html) return [];

  // Detect new format (empty videos array + initEpisode JS)
  const isNewFormat = html.includes('var videos = []') || html.includes('initEpisode');

  let videosStr = null;
  const $ = cheerio.load(html);
  $('script').each((_, el) => {
    const text = $(el).html() || '';
    const m = text.match(/var videos\s*=\s*(\{[^;]+\});/);
    if (m) videosStr = m[1];
  });

  if (!videosStr) {
    // New format: videos loaded by external JS, Pigamer37 will handle it
    if (isNewFormat) console.log('[animeflv] new format detected for ' + slug + ', falling back to Pigamer37');
    return [];
  }

  let videos;
  try { videos = JSON.parse(videosStr); } catch { return []; }

  const results = [];
  const processServers = (servers, lang) => {
    if (!Array.isArray(servers)) return;
    for (const s of servers) {
      const url = s.code || s.url || '';
      if (!url) continue;
      const serverName = (s.title || 'embed').replace(/\s+/g, '');
      results.push({
        url,
        server: serverName,
        name: `AnimeFLV\n${serverName}`,
        title: `${slug} Ep. ${episode}\n⚙️ ${serverName}`,
        description: lang === 'ja' ? 'SUB' : (lang === 'lat' ? 'LAT' : 'DUB'),
        behaviorHints: { notWebReady: true, bingeGroup: `animeflv|${serverName}` },
      });
    }
  };

  processServers(videos.SUB, 'ja');
  processServers(videos.LAT, 'lat');
  processServers(videos.DUB, 'cast');

  return results;
}

/**
 * Get on-air anime list from sidebar.
 */
async function getOnAir() {
  const html = await fetchText(BASE);
  if (!html) return [];
  const $ = cheerio.load(html);
  const items = [];
  $('.ListSdbr li').each((_, el) => {
    const a = $(el).find('a').first();
    const href = a.attr('href') || '';
    const slug = href.replace('/anime/', '');
    if (!slug) return;
    const rawType = a.find('span.Type').text().trim();
    items.push({
      id: `animeflv:${slug}`,
      type: rawType.toLowerCase().includes('pelicula') ? 'movie' : 'series',
      name: a.clone().children().remove().end().text().trim(),
    });
  });
  return items;
}

module.exports = { search, getAnime, getStreams, getOnAir };
