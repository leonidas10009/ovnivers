// torrent-providers/cardigann-engine.js — Parse Cardigann YML definitions
// Converts Prowlarr/Jackett indexer definitions to our torrent scraper format
// Source: https://github.com/Prowlarr/Indexers (522+ tracker definitions)
// 
// Cardigann YML format: https://wiki.servarr.com/en/prowlarr/cardigann-yml-definition

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0.0.0 Safari/537.36';

/**
 * Parse a Cardigann YML definition into a runnable scraper config
 * Handles: search paths, row selectors, field selectors, download selectors, mirrors
 */
function parseDefinition(ymlContent) {
  // Simple YAML-like parser (avoids js-yaml dependency)
  const def = _parseSimpleYaml(ymlContent);
  if (!def.id || !def.search) return null;

  const config = {
    id: def.id,
    name: def.name || def.id,
    description: def.description || '',
    type: def.type || 'public',
    language: def.language || 'en-US',
    mirrors: def.links || [],
    categories: _parseCategories(def.caps),
    search: _parseSearch(def.search),
    download: _parseDownload(def.download),
    settings: def.settings || [],
  };

  return config;
}

/**
 * Execute a search using a Cardigann definition
 */
async function searchCardigann(config, query, mediaType) {
  const results = [];
  const mirrors = config.mirrors.slice(0, 3); // Try up to 3 mirrors

  for (const mirror of mirrors) {
    if (results.length > 0) break; // Got results, stop trying mirrors

    const searchCfg = config.search;
    if (!searchCfg || !searchCfg.rows) continue;

    // Build search URL
    const searchUrl = _buildSearchUrl(mirror, searchCfg, query, mediaType);
    if (!searchUrl) continue;

    try {
      const res = await fetch(searchUrl, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml' },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $ = cheerio.load(html);

      // Find result rows
      const rows = $(searchCfg.rows);
      if (!rows.length) continue;

      rows.each((i, row) => {
        if (i > 50) return false; // Max 50 results

        const item = _extractFields($, row, searchCfg.fields, config.download);
        if (item && item.title && (item.magnet || item.infoHash || item.downloadUrl)) {
          item.indexer = config.name;
          item.mirror = mirror;
          results.push(item);
        }
      });

    } catch { continue; }
  }

  return results;
}

// ─── YAML Parser (minimal, no dependencies) ──────────────────

function _parseSimpleYaml(content) {
  const lines = content.split('\n');
  const root = {};
  const stack = [{ obj: root, indent: -1 }];

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S/);
    const trimmed = line.trim();

    // Pop stack to proper indent level
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const current = stack[stack.length - 1].obj;
    const isArray = Array.isArray(current);

    // Key: value
    const kvMatch = trimmed.match(/^([\w_-]+)\s*:\s*(.*)/);
    if (kvMatch) {
      const key = kvMatch[1];
      let val = kvMatch[2].trim();

      // Remove quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }

      if (val === '') {
        // Empty value → new object or array coming
        current[key] = {};
      } else if (val === '[]') {
        current[key] = [];
      } else if (!isNaN(Number(val)) && val !== '') {
        current[key] = Number(val);
      } else if (val === 'true') current[key] = true;
      else if (val === 'false') current[key] = false;
      else current[key] = val;
      continue;
    }

    // List item: - value or - key: value
    const listMatch = trimmed.match(/^-\s*(.*)/);
    if (listMatch) {
      if (!isArray) {
        // Convert to array if needed
        const parentKey = Object.keys(current).pop();
        if (parentKey && typeof current[parentKey] === 'object' && !Array.isArray(current[parentKey])) {
          // Key with object that should be array
        }
      }
      const itemVal = listMatch[1].trim();
      const itemKv = itemVal.match(/^([\w_-]+)\s*:\s*(.*)/);
      if (itemKv) {
        const itemObj = {};
        let v = itemKv[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        itemObj[itemKv[1]] = v || '';
        if (isArray) current.push(itemObj);
        else {
          current[lastKey] = current[lastKey] || [];
          current[lastKey].push(itemObj);
        }
      } else if (itemVal) {
        if (isArray) current.push(itemVal);
        else current[lastKey] = (current[lastKey] || []).concat([itemVal]);
      }
    }
  }

  return root;
}

// ─── Config parsers ──────────────────────────────────────────

function _parseCategories(caps) {
  if (!caps || !caps.categorymappings) return ['movie', 'tv'];
  const cats = new Set();
  for (const m of caps.categorymappings) {
    const cat = m.cat || '';
    if (cat.includes('Movies')) cats.add('movie');
    if (cat.includes('TV')) cats.add('tv');
    if (cat.includes('Anime')) cats.add('anime');
  }
  return cats.size > 0 ? [...cats] : ['movie', 'tv'];
}

function _parseSearch(search) {
  if (!search) return null;

  const paths = search.paths || [];
  const searchPath = paths.find(p => p.path && p.path.includes('.Keywords')) || paths[0];
  const keywordPath = searchPath ? searchPath.path : '/search/{query}/1/';

  return {
    pathTemplate: keywordPath,
    rows: search.rows?.selector || 'tr',
    fields: search.fields || {},
    keywordsfilters: search.keywordsfilters || [],
  };
}

function _parseDownload(download) {
  if (!download) return { selectors: [] };
  return {
    selectors: download.selectors || [],
    before: download.before || null,
  };
}

// ─── Search URL builder ───────────────────────────────────────

function _buildSearchUrl(mirror, searchCfg, query, mediaType) {
  let path = searchCfg.pathTemplate;

  // Simple template substitution (not full Go template)
  path = path.replace(/\{\{\s*\.Keywords\s*\}\}/g, encodeURIComponent(query));
  path = path.replace(/\{\{.*?\.Config\.\w+\s*\}\}/g, '');
  path = path.replace(/\{\{.*?\.False\s*\}\}/g, '');
  path = path.replace(/\{\{.*?\.True\s*\}\}/g, '');
  path = path.replace(/\{\{.*?\}\}/g, ''); // Remove any remaining templates
  path = path.replace(/\/+/g, '/'); // Clean double slashes
  path = path.replace(/^\//, ''); // Remove leading slash if mirror ends with /

  return `${mirror.replace(/\/+$/, '')}/${path}`;
}

// ─── Field extractor ──────────────────────────────────────────

function _extractFields($, row, fields, downloadCfg) {
  const item = {};

  // Title
  item.title = _getField($, row, fields.title, 'text') ||
               _getField($, row, fields.title_default, 'text') || '';

  // Details URL
  item.detailsUrl = _getField($, row, fields.details, 'href') ||
                    _getField($, row, fields.download, 'href') || '';

  // Download/Magnet
  const magnet = _getField($, row, fields.download, 'href') || '';
  if (magnet) {
    if (magnet.startsWith('magnet:')) {
      item.magnet = magnet;
      const infoHash = magnet.match(/btih:([a-fA-F0-9]{40})/i)?.[1]?.toLowerCase();
      if (infoHash) item.infoHash = infoHash;
    } else if (magnet.startsWith('http')) {
      item.downloadUrl = magnet;
    }
  }

  // If no direct magnet, check download selectors
  if (!item.magnet && downloadCfg && downloadCfg.selectors) {
    for (const ds of downloadCfg.selectors) {
      const sel = ds.selector || '';
      const el = sel ? $(row).find(sel).first() : $();
      if (el.length && el.attr('href')) {
        const href = el.attr('href');
        if (href.startsWith('magnet:')) {
          item.magnet = href;
          const ih = href.match(/btih:([a-fA-F0-9]{40})/i)?.[1]?.toLowerCase();
          if (ih) item.infoHash = ih;
          break;
        }
      }
    }
  }

  // Seeds
  const seedStr = _getField($, row, fields.seeders, 'text') ||
                  _getField($, row, fields.seeds, 'text') || '0';
  item.seeds = parseInt(seedStr.replace(/,/g, '')) || 0;

  // Leechers
  const leechStr = _getField($, row, fields.leechers, 'text') ||
                   _getField($, row, fields.leeches, 'text') || '0';
  item.leechers = parseInt(leechStr.replace(/,/g, '')) || 0;

  // Size
  item.sizeFormatted = _getField($, row, fields.size, 'text') || '';
  item.size = _parseSize(item.sizeFormatted);

  // Date
  item.date = _getField($, row, fields.date, 'text') || '';

  // Category
  item.category = _getField($, row, fields.category, 'text') || '';

  return item;
}

function _getField($, row, fieldDef, attr) {
  if (!fieldDef) return '';
  const selector = fieldDef.selector;
  if (!selector) {
    // text field with template
    const text = fieldDef.text || '';
    if (text && !text.includes('{{')) return text;
    return '';
  }

  const el = $(row).find(selector).first();
  if (!el.length) return '';

  if (attr === 'href') return (el.attr('href') || '').trim();
  if (attr === 'text') return el.text().trim();
  return el.text().trim() || (el.attr('href') || '').trim();
}

function _parseSize(text) {
  if (!text) return 0;
  const t = text.toUpperCase().trim();
  const match = t.match(/([\d.,]+)\s*(GB|MB|TB|KB|B)/);
  if (!match) return 0;
  const num = parseFloat(match[1].replace(/,/g, ''));
  const unit = match[2];
  if (unit === 'TB') return num * 1099511627776;
  if (unit === 'GB') return num * 1073741824;
  if (unit === 'MB') return num * 1048576;
  if (unit === 'KB') return num * 1024;
  return num;
}

// ─── Batch loader ─────────────────────────────────────────────

function loadDefinitions(dirPath) {
  const definitions = [];
  if (!fs.existsSync(dirPath)) return definitions;

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.yml'));
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      const config = parseDefinition(content);
      if (config && config.type === 'public') {
        definitions.push(config);
      }
    } catch { /* skip invalid files */ }
  }
  return definitions;
}

module.exports = {
  parseDefinition,
  searchCardigann,
  loadDefinitions,
};
