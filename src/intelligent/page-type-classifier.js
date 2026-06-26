// page-type-classifier.js — Classifies pages as listing/detail/content/search
// Ported from sistem-scraper-lite/src/analysis/PageTypeClassifier.ts
// Helps AutonomousScraper decide strategy per page type

class PageTypeClassifier {
  analyze(elements, pageUrl, pageTitle) {
    const signals = [];
    const keyElements = [];

    const links = elements.filter(function(e) { return e.type === 'link' && e.attr.href && !e.attr.href.startsWith('#'); });
    const clickables = elements.filter(function(e) { return e.type === 'clickable'; });
    const iframes = elements.filter(function(e) { return e.type === 'iframe'; });
    const inputs = elements.filter(function(e) { return e.type === 'input'; });
    const listItems = elements.filter(function(e) { return e.type === 'list-item'; });
    const images = elements.filter(function(e) { return e.type === 'image'; });

    // ─── Listing (home/catalog) detection ────────────────
    let listingScore = 0;
    const cardClasses = this._findRepeatingClasses(elements, 4);
    if (cardClasses.length > 0) {
      listingScore += 30;
      signals.push('cards:' + cardClasses[0]);
      keyElements.push({ type: 'card-grid', selector: '.' + cardClasses[0], label: cardClasses[0], count: this._countByClass(elements, cardClasses[0]) });
    }
    if (links.length > 20) { listingScore += 15; signals.push('many-links'); }
    const hasPagination = elements.some(function(e) { return /pagin|page|naveg/i.test(e.class + e.text); });
    if (hasPagination) { listingScore += 15; signals.push('pagination'); }
    if (inputs.length > 0) { listingScore += 10; signals.push('search-input'); }
    if (/catalogo|directory|browse|list|home|index|inicio/i.test(pageUrl.toLowerCase())) { listingScore += 15; signals.push('url:catalog'); }

    // ─── Detail (anime info, episode list) detection ─────
    let detailScore = 0;
    const episodePattern = listItems.filter(function(e) {
      return /\d+/.test(e.text) && /episod|capitul|chapter|season|temporada|ep\.?\s*\d|cap\.?\s*\d/i.test(e.text + e.class);
    });
    if (episodePattern.length >= 3) {
      detailScore += 40;
      signals.push('episodes:' + episodePattern.length);
      keyElements.push({ type: 'episode-list', selector: episodePattern[0].parent || 'ul', label: 'Episodes', count: episodePattern.length });
    }
    const longTexts = elements.filter(function(e) { return e.type === 'text' && e.text.length > 80; });
    if (longTexts.length >= 1) { detailScore += 10; signals.push('synopsis'); }
    const genreTags = elements.filter(function(e) {
      return /accion|comedia|drama|romance|fantasia|terror|aventura|action|comedy|drama|romance|fantasy|horror|adventure|shounen|shoujo|seinen/i.test(e.text) && e.text.length < 20;
    });
    if (genreTags.length >= 2) { detailScore += 15; signals.push('genres:' + genreTags.length); }
    const seasonTabs = elements.filter(function(e) { return /season|temporada|temp\.?\s*\d/i.test(e.text + e.class); });
    if (seasonTabs.length >= 1) { detailScore += 15; signals.push('season-tabs'); }

    // ─── Content (episode with player) detection ─────────
    let contentScore = 0;
    if (iframes.length > 0) {
      contentScore += 35;
      signals.push('iframes:' + iframes.length);
      keyElements.push({ type: 'player', selector: 'iframe', label: 'Video Player', count: iframes.length });
    }
    const serverButtons = clickables.filter(function(e) {
      return /server|servidor|opcion|mirror|source|fuente|calidad|quality|HD|SD|720|1080/i.test(e.text + e.class);
    });
    if (serverButtons.length >= 2) {
      contentScore += 30;
      signals.push('servers:' + serverButtons.length);
      keyElements.push({ type: 'server-buttons', selector: serverButtons[0].selector, label: 'Servers', count: serverButtons.length });
    }
    const downloadBtn = clickables.filter(function(e) { return /download|descarg/i.test(e.text + e.class); });
    if (downloadBtn.length > 0) { contentScore += 10; signals.push('download-btn'); }
    const langSelectors = elements.filter(function(e) { return /idioma|language|lang|audio|dub|sub|latino|castellano/i.test(e.text + e.class); });
    if (langSelectors.length >= 1) { contentScore += 10; signals.push('language-selector'); }
    if (/episode|episodio|capitulo|chapter|ver\//i.test(pageUrl.toLowerCase())) {
      contentScore += 15; signals.push('url:episode');
    }

    // ─── Search detection ────────────────────────────────
    let searchScore = 0;
    if (inputs.length > 0 && /search|buscar|busqueda/i.test((pageTitle || '') + ' ' + inputs.map(function(e) { return (e.attr && e.attr.placeholder) || ''; }).join(' '))) {
      searchScore += 30; signals.push('search-active');
    }
    if (/search|buscar|busqueda|find|query|q=/i.test(pageUrl.toLowerCase())) {
      searchScore += 30; signals.push('url:search');
    }

    // ─── Decide ──────────────────────────────────────────
    const scores = [
      { type: 'listing', score: listingScore },
      { type: 'detail', score: detailScore },
      { type: 'content', score: contentScore },
      { type: 'search', score: searchScore },
    ];
    scores.sort(function(a, b) { return b.score - a.score; });
    const best = scores[0];

    let type = 'unknown', confidence = 0, suggestedStrategy = 'explore';
    if (best.score >= 40) {
      type = best.type;
      confidence = Math.min(100, best.score);
      switch (type) {
        case 'listing': suggestedStrategy = 'extract-links'; break;
        case 'detail': suggestedStrategy = 'find-episodes'; break;
        case 'content': suggestedStrategy = 'click-servers'; break;
        case 'search': suggestedStrategy = 'search-results'; break;
      }
    } else if (best.score >= 20) {
      type = best.type;
      confidence = best.score;
      suggestedStrategy = 'explore';
    }

    return { type, confidence, signals, suggestedStrategy, keyElements };
  }

  _findRepeatingClasses(elements, minRepeats) {
    const classCounts = new Map();
    for (const el of elements) {
      const cls = (el.class || '').split(/\s+/)[0];
      if (cls && cls.length > 2 && cls.length < 40) {
        classCounts.set(cls, (classCounts.get(cls) || 0) + 1);
      }
    }
    return [...classCounts.entries()]
      .filter(function(e) { return e[1] >= minRepeats; })
      .sort(function(a, b) { return b[1] - a[1]; })
      .slice(0, 5)
      .map(function(e) { return e[0]; });
  }

  _countByClass(elements, cls) {
    return elements.filter(function(e) { return (e.class || '').includes(cls); }).length;
  }
}

module.exports = { PageTypeClassifier };
