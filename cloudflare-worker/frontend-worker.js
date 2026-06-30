// Ovnivers Frontend Worker — Permanent URL via KV-stored tunnel URL
// Deploy: npx wrangler deploy cloudflare-worker/frontend-worker.js
// Permanent URL: https://ovnivers-frontend.<subdomain>.workers.dev

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname + url.search;

    // Read current tunnel URL from KV
    const tunnelUrl = await env.TUNNEL_STORE.get('tunnel_url');
    if (!tunnelUrl) {
      return new Response(JSON.stringify({
        error: 'No tunnel URL configured',
        hint: 'Run scripts/update-tunnel-url.sh on the server to set the tunnel URL'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const targetUrl = tunnelUrl.replace(/\/$/, '') + path;

    try {
      const method = request.method;
      const headers = new Headers(request.headers);
      headers.delete('host');
      headers.delete('cf-connecting-ip');
      headers.delete('cf-ipcountry');
      headers.delete('cf-ray');
      headers.delete('cf-visitor');
      headers.delete('x-forwarded-proto');
      headers.delete('x-real-ip');

      const fetchInit = {
        method,
        headers,
        redirect: 'follow',
      };

      if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        fetchInit.body = request.body;
      }

      const resp = await fetch(targetUrl, fetchInit);

      const respHeaders = new Headers(resp.headers);
      respHeaders.set('Access-Control-Allow-Origin', '*');
      respHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      respHeaders.set('Access-Control-Allow-Headers', '*');
      respHeaders.set('X-Proxy-By', 'ovnivers-frontend-worker');

      return new Response(resp.body, {
        status: resp.status,
        headers: respHeaders,
      });
    } catch (e) {
      return new Response(JSON.stringify({
        error: 'Tunnel unreachable',
        tunnel: tunnelUrl,
        detail: e.message
      }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  },
};
