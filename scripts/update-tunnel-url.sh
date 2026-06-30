#!/bin/bash
# update-tunnel-url.sh — Updates KV with current Cloudflare Tunnel URL
# Run on the Coolify server. Requires: curl, jq, cloudflared
# Usage: ./scripts/update-tunnel-url.sh
# Cron: */5 * * * * /path/to/scripts/update-tunnel-url.sh

set -e

# ─── Config ──────────────────────────────────────
# Create an API token at: https://dash.cloudflare.com/profile/api-tokens
# Permissions needed: Account > Workers KV Storage > Edit
# Then set it as env var or replace below:
CF_API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
CF_ACCOUNT_ID="53a0341e72f51d17159b05743a978079"
KV_NAMESPACE_ID="670762ef09b04e66bb9d9e38ba17bf60"
KV_KEY="tunnel_url"

if [ -z "$CF_API_TOKEN" ]; then
  echo "ERROR: Set CLOUDFLARE_API_TOKEN env var"
  echo "Create token at: https://dash.cloudflare.com/profile/api-tokens"
  echo "Permissions: Account > Workers KV Storage > Edit"
  exit 1
fi

# ─── Get current tunnel URL ──────────────────────
# Method 1: Parse from cloudflared systemd journal (last 5 min)
TUNNEL_URL=$(journalctl -u cloudflared-ovnivers --since "5 min ago" --no-pager 2>/dev/null | \
  grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -1)

# Method 2: If journalctl failed, try parsing from log file
if [ -z "$TUNNEL_URL" ] && [ -f /var/log/cloudflared-ovnivers.log ]; then
  TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /var/log/cloudflared-ovnivers.log | tail -1)
fi

# Method 3: Try cloudflared metrics endpoint
if [ -z "$TUNNEL_URL" ]; then
  TUNNEL_URL=$(curl -s http://localhost:36666/metrics 2>/dev/null | \
    grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' | head -1) || true
fi

if [ -z "$TUNNEL_URL" ]; then
  echo "ERROR: Could not detect tunnel URL"
  exit 1
fi

echo "Detected tunnel URL: $TUNNEL_URL"

# ─── Check if KV already has this URL ────────────
CURRENT=$(curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$KV_NAMESPACE_ID/values/$KV_KEY")

if [ "$CURRENT" = "$TUNNEL_URL" ]; then
  echo "KV already up to date. Skipping."
  exit 0
fi

# ─── Update KV ────────────────────────────────────
RESP=$(curl -s -X PUT \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: text/plain" \
  --data "$TUNNEL_URL" \
  "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/storage/kv/namespaces/$KV_NAMESPACE_ID/values/$KV_KEY")

SUCCESS=$(echo "$RESP" | jq -r '.success // false')
if [ "$SUCCESS" = "true" ]; then
  echo "KV updated: $TUNNEL_URL"
  echo "Addon URL: https://ovnivers-frontend.calipo10009.workers.dev/manifest.json"
else
  echo "ERROR updating KV: $RESP"
  exit 1
fi
