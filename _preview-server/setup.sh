#!/usr/bin/env bash
# Run once on a fresh EC2 instance (Ubuntu 24.04 LTS recommended).
# Tested on m6i.2xlarge (8 vCPU / 32 GB RAM).
#
# Usage:
#   sudo bash setup.sh <github-repo-ssh-url> <admin-email>
#
# Example:
#   sudo bash setup.sh git@github.com:fusionauth/fusionauth-site.git ops@example.com

set -euo pipefail

REPO_URL="${1:?Usage: setup.sh <repo-ssh-url> <admin-email>}"
ADMIN_EMAIL="${2:?Usage: setup.sh <repo-ssh-url> <admin-email>}"
NUM_SLOTS=25
BASE_PORT=4000
PREVIEW_DIR=/opt/preview
PREVIEW_USER=preview

# ── System packages ────────────────────────────────────────────────────────────
apt-get update -qq
apt-get install -y -qq nginx git curl jq certbot

# ── Node.js 22 (matches CI) ────────────────────────────────────────────────────
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y -qq nodejs

# ── preview OS user ─────────────────────────────────────────────────────────────
id -u "$PREVIEW_USER" &>/dev/null || useradd -m -s /bin/bash "$PREVIEW_USER"

# ── Directory structure ─────────────────────────────────────────────────────────
mkdir -p "$PREVIEW_DIR"/{repo,scripts}
mkdir -p /var/www/certbot
for i in $(seq 1 $NUM_SLOTS); do
  p=$(printf "%02d" "$i")
  mkdir -p "$PREVIEW_DIR/slots/$p"
  mkdir -p "$PREVIEW_DIR/builds/$p"
done

chown -R "$PREVIEW_USER:$PREVIEW_USER" "$PREVIEW_DIR"

# ── Clone master repo and install deps ─────────────────────────────────────────
sudo -u "$PREVIEW_USER" bash -c "
  ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null
  git config --global --add safe.directory '$PREVIEW_DIR/repo'
  if [ ! -d '$PREVIEW_DIR/repo/.git' ]; then
    git clone '$REPO_URL' '$PREVIEW_DIR/repo'
  else
    git -C '$PREVIEW_DIR/repo' pull --ff-only
  fi
  cd '$PREVIEW_DIR/repo/astro'
  npm ci --silent
"

# ── Copy scripts ────────────────────────────────────────────────────────────────
cp "$(dirname "$0")/scripts/build-preview.sh"  "$PREVIEW_DIR/scripts/"
cp "$(dirname "$0")/scripts/release-slot.sh"   "$PREVIEW_DIR/scripts/"
chmod +x "$PREVIEW_DIR/scripts/"*.sh
chown "$PREVIEW_USER:$PREVIEW_USER" "$PREVIEW_DIR/scripts/"*.sh

# ── Detect public IP and derive sslip.io domain ────────────────────────────────
# sslip.io is a free wildcard DNS: 4001.18-118-165-255.sslip.io → 18.118.165.255
# It is on the Public Suffix List, so Let's Encrypt rate limits apply per IP.
_imds_token=$(curl -sf --connect-timeout 2 -X PUT \
  "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)
PUBLIC_IP=$(curl -sf --connect-timeout 2 \
  -H "X-aws-ec2-metadata-token: ${_imds_token}" \
  "http://169.254.169.254/latest/meta-data/public-ipv4" 2>/dev/null \
  || curl -sf --connect-timeout 5 https://checkip.amazonaws.com | tr -d '[:space:]')
SSLIP_DOMAIN=$(echo "$PUBLIC_IP" | tr '.' '-').sslip.io

echo "Public IP: $PUBLIC_IP"
echo "sslip.io domain: $SSLIP_DOMAIN"
echo "Preview URL pattern: https://<port>.$SSLIP_DOMAIN"

# ── Initial nginx: port 80 only, for ACME webroot challenge ────────────────────
cat > /etc/nginx/sites-available/preview <<'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/certbot;
    location /.well-known/acme-challenge/ { }
    location / { return 444; }
}
EOF

ln -sf /etc/nginx/sites-available/preview /etc/nginx/sites-enabled/preview
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

# ── Get Let's Encrypt certificate (25 SANs, one cert) ──────────────────────────
CERTBOT_DOMAINS=""
for i in $(seq 1 $NUM_SLOTS); do
  PORT=$((BASE_PORT + i))
  CERTBOT_DOMAINS="$CERTBOT_DOMAINS -d ${PORT}.${SSLIP_DOMAIN}"
done

# shellcheck disable=SC2086
certbot certonly --webroot -w /var/www/certbot \
  --cert-name preview \
  $CERTBOT_DOMAINS \
  --non-interactive --agree-tos \
  -m "$ADMIN_EMAIL"

# ── Final nginx: HTTPS with SNI routing, one server block per slot ─────────────
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

# ── UFW: open 80+443, remove old slot ports ────────────────────────────────────
if ufw status | grep -q "Status: active"; then
  ufw allow 80/tcp  > /dev/null
  ufw allow 443/tcp > /dev/null
  for i in $(seq 1 $NUM_SLOTS); do
    ufw delete allow "$((BASE_PORT + i))/tcp" > /dev/null 2>&1 || true
  done
  ufw reload
fi

echo ""
echo "Setup complete."
echo "  Preview slots : $NUM_SLOTS"
echo "  Base domain   : $SSLIP_DOMAIN"
echo "  URL pattern   : https://<port>.$SSLIP_DOMAIN"
echo ""
echo "Next steps:"
echo "  1. Update EC2 security group: open ports 80 and 443 inbound; close 4001-4025."
echo "  2. If the instance IP changes (no Elastic IP), re-run setup to get a new cert."
echo "  3. Add repo secrets: PREVIEW_HOST=$PUBLIC_IP, PREVIEW_SSH_KEY=<preview user's private key>."
echo "  4. To generate a deploy keypair:"
echo "       ssh-keygen -t ed25519 -C 'preview-deploy' -f /tmp/preview-key -N ''"
echo "       # Add /tmp/preview-key.pub to ~/.ssh/authorized_keys for the preview user"
echo "       # Store /tmp/preview-key contents as the PREVIEW_SSH_KEY GitHub secret"
