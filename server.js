const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
const allScrapers = manifest.scrapers || [];

const allLanguages = [...new Set(allScrapers.flatMap(s => s.contentLanguage || []))].sort();
const allTypes = [...new Set(allScrapers.flatMap(s => s.supportedTypes || []))].sort();

function getConfig(req) {
  const cfg = {};
  if (req.query.config) {
    try {
      const decoded = Buffer.from(req.query.config, 'base64').toString('utf-8');
      Object.assign(cfg, JSON.parse(decoded));
    } catch (_) {}
  }
  return {
    languages: Array.isArray(cfg.languages) ? cfg.languages : [],
    types: Array.isArray(cfg.types) ? cfg.types : [],
    enabledProviders: Array.isArray(cfg.enabledProviders) ? cfg.enabledProviders : [],
    disabledProviders: Array.isArray(cfg.disabledProviders) ? cfg.disabledProviders : []
  };
}

function getFilteredScrapers(config) {
  return allScrapers.filter(s => {
    if (config.enabledProviders.length > 0) return config.enabledProviders.includes(s.id);
    if (config.disabledProviders.length > 0 && config.disabledProviders.includes(s.id)) return false;
    if (config.languages.length > 0) {
      const match = (s.contentLanguage || []).some(l => config.languages.includes(l));
      if (!match) return false;
    }
    if (config.types.length > 0) {
      const match = (s.supportedTypes || []).some(t => config.types.includes(t));
      if (!match) return false;
    }
    return true;
  });
}

app.get('/manifest.json', (req, res) => {
  const config = getConfig(req);
  const scrapers = getFilteredScrapers(config);

  const output = {
    id: manifest.id,
    version: manifest.version,
    name: manifest.name,
    description: manifest.description + (config.languages.length || config.types.length || config.enabledProviders.length
      ? ` [Filtered: ${scrapers.length} providers]`
      : ` [${allScrapers.length} providers]`),
    logo: manifest.logo,
    resources: manifest.resources,
    types: manifest.types,
    idPrefixes: manifest.idPrefixes,
    behaviorHints: manifest.behaviorHints,
    catalogs: manifest.catalogs || [],
    scrapers: scrapers
  };

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(output);
});

app.get('/configure', (req, res) => {
  const currentConfig = getConfig(req);

  const langCheckboxes = allLanguages.map(l =>
    `<label class="chip"><input type="checkbox" name="lang" value="${l}" ${currentConfig.languages.includes(l) ? 'checked' : ''}> ${l.toUpperCase()}</label>`
  ).join('\n');

  const typeCheckboxes = allTypes.map(t =>
    `<label class="chip"><input type="checkbox" name="type" value="${t}" ${currentConfig.types.includes(t) ? 'checked' : ''}> ${t}</label>`
  ).join('\n');

  const providerCheckboxes = allScrapers.map(s => {
    const enabled = currentConfig.enabledProviders.length === 0 || currentConfig.enabledProviders.includes(s.id);
    const langs = (s.contentLanguage || []).map(l => l.toUpperCase()).join('/');
    return `<label class="provider-row">
      <input type="checkbox" name="provider" value="${s.id}" ${enabled ? 'checked' : ''}>
      <span class="prov-name">${s.name}</span>
      <span class="prov-lang">${langs}</span>
      <span class="prov-type">${(s.supportedTypes || []).join(', ')}</span>
    </label>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ovnivers — Configure</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0d1117;color:#c9d1d9;padding:16px}
  h1{font-size:20px;color:#e94560;margin-bottom:20px;text-align:center}
  .card{background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;margin-bottom:12px}
  .card h3{font-size:14px;color:#e94560;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px}
  .chips{display:flex;flex-wrap:wrap;gap:6px}
  .chip{display:inline-block;padding:4px 10px;background:#21262d;border:1px solid #30363d;border-radius:20px;font-size:12px;cursor:pointer;user-select:none;white-space:nowrap}
  .chip:hover{background:#30363d}
  .chip input{display:none}
  .chip:has(input:checked){background:#e94560;color:#fff;border-color:#e94560}
  .providers{max-height:420px;overflow-y:auto}
  .provider-row{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #21262d;font-size:12px}
  .provider-row input{accent-color:#e94560}
  .prov-name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .prov-lang{color:#8b949e;min-width:70px;text-align:center}
  .prov-type{color:#58a6ff;min-width:80px;text-align:right}
  button{border:none;padding:10px 20px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:600}
  .btn-primary{background:#e94560;color:#fff;width:100%}
  .btn-primary:hover{background:#c23152}
  .btn-outline{background:transparent;color:#c9d1d9;border:1px solid #30363d}
  .btn-outline:hover{background:#21262d}
  .actions{display:flex;gap:8px;margin:16px 0}
  .actions button{flex:1}
  #result{display:none;background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;margin-top:12px}
  #result p{font-size:12px;margin-bottom:8px;color:#8b949e}
  #result input{width:100%;padding:10px;background:#0d1117;color:#58a6ff;border:1px solid #30363d;border-radius:6px;font-size:11px;font-family:monospace}
  .count{font-size:11px;color:#8b949e;margin-left:4px}
  .stremio-btn{display:none}
</style>
<h1>Ovnivers Configuration</h1>
<div class="card">
  <h3>Languages <span class="count">(${allLanguages.length})</span></h3>
  <div class="chips">${langCheckboxes}</div>
</div>
<div class="card">
  <h3>Content Type <span class="count">(${allTypes.length})</span></h3>
  <div class="chips">${typeCheckboxes}</div>
</div>
<div class="card">
  <h3>Providers <span class="count" id="provCount">${allScrapers.length}</span></h3>
  <div class="providers">${providerCheckboxes}</div>
</div>
<div class="actions">
  <button class="btn-outline" onclick="selectAll()">Select All</button>
  <button class="btn-outline" onclick="deselectAll()">Deselect All</button>
</div>
<button class="btn-primary" onclick="generate()">Generate & Install</button>
<button class="stremio-btn" id="stremioBtn" onclick="installStremio()">Open in Nuvio</button>
<div id="result">
  <p>Copy this URL and add it to Nuvio Settings > Addons:</p>
  <input id="url" readonly onclick="this.select();navigator.clipboard.writeText(this.value)">
</div>
<script>
const BASE = '${BASE_URL}';
function selectAll(){document.querySelectorAll('input[name=provider]').forEach(c=>c.checked=true);updateCount()}
function deselectAll(){document.querySelectorAll('input[name=provider]').forEach(c=>c.checked=false);updateCount()}
function updateCount(){
  const n = document.querySelectorAll('input[name=provider]:checked').length;
  document.getElementById('provCount').textContent = n + ' / ${allScrapers.length}';
  document.querySelectorAll('input[name=provider]').forEach(c=>c.parentElement.style.opacity=c.checked?'1':'0.4');
}
document.querySelectorAll('input[name=provider]').forEach(c=>c.addEventListener('change',updateCount));
function generate(){
  const langs = [...document.querySelectorAll('input[name=lang]:checked')].map(c=>c.value);
  const types = [...document.querySelectorAll('input[name=type]:checked')].map(c=>c.value);
  const providers = [...document.querySelectorAll('input[name=provider]:checked')].map(c=>c.value);
  const allChecked = providers.length === ${allScrapers.length};
  const configObj = {};
  if(langs.length) configObj.languages = langs;
  if(types.length) configObj.types = types;
  if(!allChecked) configObj.enabledProviders = providers;
  const config = btoa(JSON.stringify(configObj));
  const url = BASE + '/manifest.json?config=' + config;
  document.getElementById('url').value = url;
  document.getElementById('result').style.display = 'block';
  document.getElementById('stremioBtn').style.display = 'inline-block';
  // Try to open directly in Nuvio/Stremio
  setTimeout(() => {
    window.location.href = 'stremio://addon?url=' + encodeURIComponent(url);
  }, 300);
}
function installStremio(){
  const url = document.getElementById('url').value;
  window.location.href = 'stremio://addon?url=' + encodeURIComponent(url);
}
</script>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Stremio stream endpoint (placeholder for now - streams come from local scrapers)
app.get('/stream/:type/:id.json', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ streams: [] });
});

// Health check
app.get('/', (req, res) => {
  res.json({ name: 'Ovnivers Addon', version: manifest.version, scrapers: allScrapers.length });
});

// Serve static files (logo, providers, etc.)
app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ovnivers addon: http://localhost:${PORT}`);
  console.log(`Configure:      http://localhost:${PORT}/configure`);
  console.log(`Manifest:       http://localhost:${PORT}/manifest.json`);
});
