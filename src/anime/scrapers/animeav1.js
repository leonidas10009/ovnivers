const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

async function fetchText(url, timeout = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch { clearTimeout(t); return null; }
}

async function fetchJson(url, timeout = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
      signal: ctrl.signal
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch { clearTimeout(t); return null; }
}

function resolveDevalue(flatData) {
  // flatData is the data array from __data.json nodes[3].data
  // It contains values where objects have numeric references to other indices
  function resolve(val) {
    if (typeof val === 'number') return flatData[val];
    if (Array.isArray(val)) return val.map(resolve);
    if (val && typeof val === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(val)) {
        out[k] = resolve(v);
      }
      return out;
    }
    return val;
  }

  // Find server lists: look for { "LANG": number } where number points to an array of server objects
  function findServers(data) {
    const results = { embeds: {}, downloads: {} };
    if (typeof data !== 'object' || !data) return results;
    
    for (const [key, val] of Object.entries(data)) {
      if (typeof key === 'string' && ['SUB', 'DUB', 'LAT'].includes(key) && typeof val === 'number') {
        const arr = flatData[val];
        if (Array.isArray(arr)) {
          for (const ref of arr) {
            if (typeof ref !== 'number') continue;
            const obj = flatData[ref];
            if (obj && typeof obj === 'object' && obj.server && obj.url) {
              const server = typeof obj.server === 'number' ? flatData[obj.server] : obj.server;
              const url = typeof obj.url === 'number' ? flatData[obj.url] : obj.url;
              if (typeof server === 'string' && typeof url === 'string' && url.startsWith('http')) {
                if (!results.embeds[key]) results.embeds[key] = [];
                results.embeds[key].push({ server, url });
              }
            }
          }
        }
      }
    }
    return results;
  }

  // Flatten the data array
  const allValues = {};
  const resolved = flatData.map((v, i) => {
    const r = resolve(v);
    allValues[i] = r;
    return r;
  });

  // Look through ALL values for server objects
  const servers = { embeds: {}, downloads: {} };
  for (let i = 0; i < resolved.length; i++) {
    const val = resolved[i];
    if (!val || typeof val !== 'object' || Array.isArray(val)) continue;

    // First: check if this object has 'embeds' or 'downloads' wrapper
    // After resolve(), embeds/downloads are resolved to objects { SUB: [...], DUB: [...] }
    // If NOT resolved (shouldn't happen), fall back to raw flatData number reference
    for (const wrapper of ['embeds', 'downloads']) {
      let wrapperObj = val[wrapper];
      if (typeof wrapperObj === 'number') {
        wrapperObj = flatData[wrapperObj];
      }
      if (wrapperObj && typeof wrapperObj === 'object' && !Array.isArray(wrapperObj)) {
        for (const [lang, refOrArr] of Object.entries(wrapperObj)) {
          if (!['SUB', 'DUB', 'LAT'].includes(lang)) continue;
          let serverIds;
          if (typeof refOrArr === 'number') {
            serverIds = flatData[refOrArr];
          } else if (Array.isArray(refOrArr)) {
            serverIds = refOrArr;
          }
          if (Array.isArray(serverIds)) {
            for (const id of serverIds) {
              _extractServer(flatData, id, lang, servers, wrapper);
            }
          }
        }
      }
    }

    // Second: check for direct language keys (old format)
    for (const [lang, ref] of Object.entries(val)) {
      if (['SUB', 'DUB', 'LAT'].includes(lang) && typeof ref === 'number') {
        const serverIds = flatData[ref];
        if (Array.isArray(serverIds)) {
          for (const id of serverIds) {
            _extractServer(flatData, id, lang, servers, 'embeds');
          }
        }
      }
    }
  }

  return servers;
}

function _extractServer(flatData, id, lang, servers, group) {
  if (typeof id !== 'number') return;
  const serverObj = flatData[id];
  if (!serverObj || !serverObj.server || !serverObj.url) return;
  const srv = typeof serverObj.server === 'number' ? flatData[serverObj.server] : serverObj.server;
  const u = typeof serverObj.url === 'number' ? flatData[serverObj.url] : serverObj.url;
  if (typeof srv === 'string' && typeof u === 'string' && u.startsWith('http')) {
    const target = group === 'downloads' ? servers.downloads : servers.embeds;
    target[lang] = target[lang] || [];
    target[lang].push({ server: srv, url: u });
  }
}

async function search(query) {
  try {
    const html = await fetchText(`https://animeav1.com/catalogo?search=${encodeURIComponent(query)}`);
    if (!html) return [];
    // SvelteKit SSR - search results are rendered server-side
    // Extract links from __data or from HTML
    const cheerio = require('cheerio-without-node-native') || require('cheerio');
    const $ = cheerio.load(html);
    const results = [];
    $('a[href*="/anime/"], a[href*="/media/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/^\/(?:anime|media)\/([^/]+)\/?$/);
      if (!match) return;
      const slug = match[1];
      const title = $(el).find('h2, h3, [class*=title]').first().text().trim() || $(el).attr('title') || $(el).text().trim();
      if (!title || title.length < 2) return;
      results.push({ title, slug, href, poster: '' });
    });
    return [...new Map(results.map(r => [r.slug, r])).values()];
  } catch { return []; }
}

async function getStreams(slug, episode) {
  try {
    const data = await fetchJson(`https://animeav1.com/media/${slug}/${episode}/__data.json`);
    if (!data?.nodes) return [];

    const allResults = [];
    for (const node of data.nodes) {
      if (!node || node?.type !== 'data' || !Array.isArray(node.data)) continue;
      const servers = resolveDevalue(node.data);
      if (!servers.embeds || Object.keys(servers.embeds).length === 0) continue;

      for (const [lang, serverList] of Object.entries(servers.embeds)) {
        for (const { server, url } of serverList) {
          const isDirect = /\.(mp4|mkv|m3u8)($|\?)/i.test(url);
          let finalUrl = url;
          
          // Resolve HLS embeds to actual m3u8 if possible
          if (server === 'HLS' && url.includes('zilla-networks.com')) {
            try {
              const playerHtml = await fetchText(url, 10000);
              if (playerHtml) {
                const m3u8Match = playerHtml.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/i);
                if (m3u8Match) finalUrl = m3u8Match[0];
              }
            } catch {}
          }

          allResults.push({
            url: finalUrl,
            server,
            name: `AnimeAV1\n${server}`,
            title: `${slug} Ep. ${episode}\n⚙️ ${server} [${lang}]`,
            description: lang,
            languages: ['ja'],
            behaviorHints: {
              notWebReady: !isDirect,
              bingeGroup: `animeav1|${server}`,
            },
          });
        }
      }
    }
    return allResults;
    return [];
  } catch { return []; }
}

module.exports = { search, getStreams };
