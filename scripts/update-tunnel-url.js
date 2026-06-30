// update-tunnel-url.js — Updates Cloudflare KV with current tunnel URL
// Run on the Coolify server: node scripts/update-tunnel-url.js
// Or with cron: */5 * * * * node /app/scripts/update-tunnel-url.js

const { execSync } = require('child_process');
const https = require('https');

const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT_ID = '53a0341e72f51d17159b05743a978079';
const KV_NAMESPACE_ID = '670762ef09b04e66bb9d9e38ba17bf60';
const KV_KEY = 'tunnel_url';

if (!CF_API_TOKEN) {
  console.error('ERROR: Set CLOUDFLARE_API_TOKEN env var');
  console.error('Create token at: https://dash.cloudflare.com/profile/api-tokens');
  console.error('Permissions: Account > Workers KV Storage > Edit');
  process.exit(1);
}

function cfApi(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}${path}`,
      method,
      headers: {
        'Authorization': `Bearer ${CF_API_TOKEN}`,
        'Content-Type': body != null ? 'text/plain' : undefined,
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body != null) req.write(body);
    req.end();
  });
}

async function getTunnelUrl() {
  const methods = [
    // Method 1: journalctl
    () => {
      try {
        const out = execSync('journalctl -u cloudflared-ovnivers --since "5 min ago" --no-pager 2>/dev/null', { encoding: 'utf-8', timeout: 5000 });
        const m = out.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/g);
        return m ? m[m.length - 1] : null;
      } catch { return null; }
    },
    // Method 2: log file
    () => {
      try {
        const out = execSync('grep -oP "https://[a-z0-9-]+\\.trycloudflare\\.com" /var/log/cloudflared-ovnivers.log 2>/dev/null | tail -1', { encoding: 'utf-8', timeout: 5000 });
        return out.trim() || null;
      } catch { return null; }
    },
    // Method 3: cloudflared metrics
    () => {
      try {
        const out = execSync('curl -s http://localhost:36666/metrics 2>/dev/null', { encoding: 'utf-8', timeout: 5000 });
        const m = out.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        return m ? m[0] : null;
      } catch { return null; }
    },
  ];

  for (const fn of methods) {
    const url = fn();
    if (url) return url;
  }
  return null;
}

(async () => {
  const tunnelUrl = await getTunnelUrl();
  if (!tunnelUrl) {
    console.error('ERROR: Could not detect tunnel URL');
    process.exit(1);
  }
  console.log('Detected tunnel URL:', tunnelUrl);

  // Check current KV value
  const current = await cfApi('GET', `/values/${KV_KEY}`);
  if (current === tunnelUrl) {
    console.log('KV already up to date. Skipping.');
    process.exit(0);
  }

  // Update KV
  const resp = await cfApi('PUT', `/values/${KV_KEY}`, tunnelUrl);
  if (resp.success) {
    console.log('KV updated:', tunnelUrl);
    console.log('Addon URL: https://ovnivers-frontend.calipo10009.workers.dev/manifest.json');
  } else {
    console.error('ERROR updating KV:', JSON.stringify(resp));
    process.exit(1);
  }
})();
