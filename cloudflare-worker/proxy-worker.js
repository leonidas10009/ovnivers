// Cloudflare Worker — Proxy para Ovnivers
// Desplegar gratis en https://workers.cloudflare.com
// Luego en Render: PROXY_URL=https://tu-worker.tu-usuario.workers.dev

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get('url');
    if (!target) return new Response('Missing ?url=', { status: 400 });

    try {
      const resp = await fetch(target, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': '*/*',
          'Origin': new URL(target).origin,
          'Referer': new URL(target).origin + '/',
        },
      });

      const body = await resp.arrayBuffer();
      return new Response(body, {
        status: resp.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': resp.headers.get('Content-Type') || 'application/octet-stream',
        },
      });
    } catch (e) {
      return new Response(e.message, { status: 502 });
    }
  },
};
