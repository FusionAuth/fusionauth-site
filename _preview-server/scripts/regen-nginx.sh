#!/usr/bin/env bash
# Regenerate the nginx site config and reload nginx.
# Run as root (or with sudo) on the preview EC2 instance when nginx config changes
# have been made to setup.sh.
#
# Usage:
#   sudo bash regen-nginx.sh

set -euo pipefail

NUM_SLOTS=25
BASE_PORT=4000
PREVIEW_DIR=/opt/preview

_imds_token=$(curl -sf --connect-timeout 2 -X PUT \
  "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)
PUBLIC_IP=$(curl -sf --connect-timeout 2 \
  -H "X-aws-ec2-metadata-token: ${_imds_token}" \
  "http://169.254.169.254/latest/meta-data/public-ipv4" 2>/dev/null \
  || curl -sf --connect-timeout 5 https://checkip.amazonaws.com | tr -d '[:space:]')
SSLIP_DOMAIN=$(echo "$PUBLIC_IP" | tr '.' '-').sslip.io

echo "Regenerating nginx config for $SSLIP_DOMAIN …"

python3 - "$NUM_SLOTS" "$BASE_PORT" "$PREVIEW_DIR" "$SSLIP_DOMAIN" \
  > /etc/nginx/sites-available/preview <<'PYEOF'
import sys
num, base, root, sslip = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], sys.argv[4]

# Port 80: serve ACME challenges, redirect everything else to HTTPS
print("""server {
    listen 80;
    server_name _;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 301 https://$host$request_uri;
    }
}
""")

# Port 443: one server block per slot, routed by SNI subdomain
for i in range(1, num + 1):
    p = str(i).zfill(2)
    port = base + i
    print(f"""server {{
    listen 443 ssl;
    server_name {port}.{sslip};
    ssl_certificate /etc/letsencrypt/live/preview/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/preview/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    root {root}/builds/{p};
    index index.html;
    location ~* \\.md$ {{
        types {{ }}
        default_type text/plain;
        add_header Cache-Control "no-store";
        add_header X-Content-Type-Options nosniff;
        try_files $uri =404;
    }}
    location / {{
        try_files $uri $uri/ $uri.html =404;
        add_header Cache-Control "no-store";
    }}
}}
""")
PYEOF

nginx -t
systemctl reload nginx
echo "Done."
