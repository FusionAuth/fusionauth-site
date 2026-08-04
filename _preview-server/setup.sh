#!/usr/bin/env bash
# Run once on a fresh EC2 instance (Ubuntu 24.04 LTS recommended).
# Tested on m6i.2xlarge (8 vCPU / 32 GB RAM).
#
# Usage:
#   sudo bash setup.sh <github-repo-ssh-url> <preview-hostname>
#
# Example:
#   sudo bash setup.sh git@github.com:fusionauth/fusionauth-site.git preview.fusionauth.io

set -euo pipefail

REPO_URL="${1:?Usage: setup.sh <repo-ssh-url> <preview-hostname>}"
PREVIEW_HOST="${2:?Usage: setup.sh <repo-ssh-url> <preview-hostname>}"
NUM_SLOTS=25
BASE_PORT=4000
PREVIEW_DIR=/opt/preview
PREVIEW_USER=preview

# ── System packages ────────────────────────────────────────────────────────────
apt-get update -qq
apt-get install -y -qq nginx git curl jq

# ── Node.js 22 (matches CI) ────────────────────────────────────────────────────
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y -qq nodejs

# ── preview OS user ─────────────────────────────────────────────────────────────
id -u "$PREVIEW_USER" &>/dev/null || useradd -m -s /bin/bash "$PREVIEW_USER"

# ── Directory structure ─────────────────────────────────────────────────────────
mkdir -p "$PREVIEW_DIR"/{repo,scripts}
for i in $(seq 1 $NUM_SLOTS); do
  p=$(printf "%02d" "$i")
  mkdir -p "$PREVIEW_DIR/slots/$p"
  mkdir -p "$PREVIEW_DIR/builds/$p"
done

chown -R "$PREVIEW_USER:$PREVIEW_USER" "$PREVIEW_DIR"

# ── Clone master repo and install deps ─────────────────────────────────────────
# The GitHub Actions deploy key needs read access; add it to the preview user's
# SSH known_hosts first so the clone doesn't prompt.
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

# ── Nginx config (one server block per slot) ────────────────────────────────────
python3 - "$NUM_SLOTS" "$BASE_PORT" "$PREVIEW_DIR" > /etc/nginx/sites-available/preview <<'PYEOF'
import sys
num, base, root = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
for i in range(1, num + 1):
    p = str(i).zfill(2)
    port = base + i
    print(f"""server {{
    listen {port};
    server_name _;
    root {root}/builds/{p};
    index index.html;
    location / {{
        try_files $uri $uri/ $uri.html =404;
        add_header Cache-Control "no-store";
    }}
}}""")
PYEOF

ln -sf /etc/nginx/sites-available/preview /etc/nginx/sites-enabled/preview
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# ── Open ports in UFW (if active) ───────────────────────────────────────────────
if ufw status | grep -q "Status: active"; then
  for i in $(seq 1 $NUM_SLOTS); do
    ufw allow "$((BASE_PORT + i))/tcp" > /dev/null
  done
  ufw reload
fi

echo ""
echo "Setup complete."
echo "  Preview slots: $NUM_SLOTS"
echo "  Ports: $((BASE_PORT + 1))–$((BASE_PORT + NUM_SLOTS))"
echo "  Preview URL pattern: http://$PREVIEW_HOST:<port>"
echo ""
echo "Next steps:"
echo "  1. Open ports $((BASE_PORT + 1))–$((BASE_PORT + NUM_SLOTS)) in the EC2 security group."
echo "  2. Add an A record: $PREVIEW_HOST → this instance's public IP."
echo "  3. Add repo secrets: PREVIEW_HOST=$PREVIEW_HOST, PREVIEW_SSH_KEY=<preview user's private key>."
echo "  4. To generate a deploy keypair:"
echo "       ssh-keygen -t ed25519 -C 'preview-deploy' -f /tmp/preview-key -N ''"
echo "       # Add /tmp/preview-key.pub to ~/.ssh/authorized_keys for the preview user"
echo "       # Store /tmp/preview-key contents as the PREVIEW_SSH_KEY GitHub secret"
