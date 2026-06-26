// animejara.js — Native AnimeJara scraper
// Search: cheerio from /catalogo/
// Streams: Puppeteer (JS-rendered server list)

const cheerio = require('cheerio-without-node-native') || require('cheerio');

const BASE = 'https://animejara.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';

async function fetchText(url, timeout) {
  const ctrl = new AbortController();
  const t = setTimeout(function() { ctrl.abort(); }, timeout || 15000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch { clearTimeout(t); return null; }
}

async function search(query) {
  const html = await fetchText(BASE + '/catalogo/?q=' + encodeURIComponent(query));
  if (!html) return [];
  const $ = cheerio.load(html);
  const results = [];
  $('.anime-card').each(function(_, el) {
    const title = $(el).find('.card-title').text().trim();
    const href = $(el).attr('href') || $(el).find('a').attr('href') || '';
    const slug = href.replace(/^https?:\/\/[^/]+\/(?:anime|movie)\//, '').replace(/^\/(?:anime|movie)\//, '').replace(/\/+$/, '');
    if (title && slug && slug.length < 100) {
      results.push({ title, slug, poster: $(el).find('img').attr('src') || '' });
    }
  });
  return results;
}

async function getStreams(slug, episode) {
  const pptrResolver = require('../../jkanime-puppeteer');
  try {
    return await pptrResolver.resolveAnimeJara(slug, episode || 1);
  } catch (e) {
    return [];
  }
}

module.exports = { search, getStreams, BASE };
