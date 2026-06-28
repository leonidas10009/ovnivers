const cheerio = require('cheerio-without-node-native') || require('cheerio');

const BASE = 'https://tioanime.com';
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

async function search(query) {
  const html = await fetchText(`${BASE}/directorio?q=${encodeURIComponent(query)}`);
  if (!html) return [];
  const $ = cheerio.load(html);
  const results = [];
  $('article.anime').each((_, el) => {
    const a = $(el).find('a').first();
    const href = a.attr('href') || '';
    const slug = href.replace('/anime/', '').replace(/\/$/, '');
    const title = $(el).find('h3.title, h4, h5').first().text().trim();
    const poster = $(el).find('img').attr('src') || '';
    if (!slug || !title) return;
    results.push({ title, slug, href, poster });
  });
  return results;
}

async function getStreams(slug, episode) {
  const html = await fetchText(`${BASE}/ver/${slug}-${episode}`);
  if (!html) return [];

  let videosStr = null;
  const $ = cheerio.load(html);
  $('script').each((_, el) => {
    const text = $(el).html() || '';
    const m = text.match(/var videos\s*=\s*(\[[\s\S]*?\]);/);
    if (m) videosStr = m[1];
  });
  if (!videosStr) return [];

  let videos;
  try { videos = JSON.parse(videosStr); } catch { return []; }
  if (!Array.isArray(videos)) return [];

  const results = [];
  for (const v of videos) {
    const server = v[0] || '?';
    const url = (v[1] || '').replace(/\\\//g, '/');
    if (!url || !url.startsWith('http')) continue;
    const isDirect = /\.(mp4|mkv|m3u8)($|\?)/i.test(url);
    const isEmbed = /\/embed\/|embed|e\//.test(url);
    results.push({
      url,
      server,
      name: `TioAnime\n${server}`,
      title: `${slug} Ep. ${episode}\n⚙️ ${server}`,
      description: '',
      languages: ['ja'],
      behaviorHints: {
        notWebReady: !isDirect,
        bingeGroup: `tioanime|${server}`,
      },
    });
  }
  return results;
}

async function getOnAir() {
  const html = await fetchText(BASE);
  if (!html) return [];
  const $ = cheerio.load(html);
  const items = [];
  $('article.anime').each((_, el) => {
    const a = $(el).find('a').first();
    const href = a.attr('href') || '';
    const slug = href.replace('/anime/', '').replace(/\/$/, '');
    if (!slug) return;
    const title = $(el).find('h3.title, h4, h5').first().text().trim();
    if (!title) return;
    items.push({
      id: `tioanime:${slug}`,
      type: 'series',
      name: title,
      poster: $(el).find('img').attr('src') || '',
    });
  });
  return items;
}

module.exports = { search, getStreams, getOnAir };
