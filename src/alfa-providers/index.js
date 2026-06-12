const providers = require('./providers');
const { searchContent, getEpisodes, extractVideos, resolveVideoUrl } = require('./engine');

async function scrapeAlfaProviders(type, id, season, episode) {
  const results = [];
  const mediaType = type === 'series' ? 'tvshow' : type;
  const activeProviders = providers.filter(p =>
    p.active && p.categories.includes(mediaType) && !p.adult
  );

  const chunks = chunkArray(activeProviders, 5);
  for (const chunk of chunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map(async (provider) => {
        try {
          const contentUrl = await searchContent(provider, id, mediaType, season, episode);
          if (!contentUrl) return [];

          let videoUrls;
          if (mediaType === 'tvshow' && season && episode) {
            const epUrl = await getEpisodes(provider, contentUrl, season, episode);
            if (!epUrl) return [];
            videoUrls = await extractVideos(provider, epUrl);
          } else {
            videoUrls = await extractVideos(provider, contentUrl);
          }

          const streams = [];
          for (const v of videoUrls) {
            const resolved = await resolveVideoUrl(v.url, v.server);
            if (resolved) {
              streams.push({
                name: v.quality || 'HD',
                description: `${provider.title} [${v.server || 'direct'}]`,
                url: resolved,
                behaviorHints: { notWebReady: true }
              });
            }
          }
          return streams;
        } catch { return []; }
      })
    );
    for (const r of chunkResults) {
      if (r.status === 'fulfilled') results.push(...r.value);
    }
  }

  return results.slice(0, 50);
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

module.exports = scrapeAlfaProviders;
