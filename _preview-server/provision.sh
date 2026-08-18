#!/usr/bin/env bash
# Provisions the preview server end-to-end using Terraform, then runs
# post-provisioning steps (deploy keypair, cron, GitHub secrets).
#
# Prerequisites: terraform, aws CLI (authenticated), gh CLI (authenticated), ssh, jq
#
# Usage:
#   ./provision.sh <admin-email> [--github-repo <owner/repo>]
#
# Example:
#   ./provision.sh ops@example.com --github-repo FusionAuth/fusionauth-site

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/terraform"

ADMIN_EMAIL="${1:?Usage: provision.sh <admin-email> [--github-repo owner/repo]}"
GITHUB_REPO="FusionAuth/fusionauth-site"

shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --github-repo) GITHUB_REPO="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

for cmd in terraform aws gh ssh ssh-keygen jq; do
  command -v "$cmd" >/dev/null || { echo "Missing prerequisite: $cmd" >&2; exit 1; }
done

# ── 1. Terraform apply ─────────────────────────────────────────────────────────
echo "==> Provisioning infrastructure (terraform apply)…"
cd "$TERRAFORM_DIR"
terraform init -upgrade -input=false -reconfigure
terraform apply -auto-approve -var "admin_email=$ADMIN_EMAIL"

PREVIEW_IP=$(terraform output -raw preview_server_ip)
echo "    EC2 Elastic IP: $PREVIEW_IP"

ADMIN_KEY_FILE="/tmp/preview-admin-key-$$.pem"
terraform output -raw admin_private_key > "$ADMIN_KEY_FILE"
chmod 600 "$ADMIN_KEY_FILE"
# shellcheck disable=SC2064
trap "rm -f '$ADMIN_KEY_FILE'" EXIT

# ── 2. Wait for user_data (setup.sh) to finish ────────────────────────────────
# setup.sh writes /opt/preview/.sslip-domain on success; poll for it.
echo "==> Waiting for EC2 setup to finish (~5 min; apt + npm ci + certbot)…"
DEADLINE=$((SECONDS + 720))
while [[ $SECONDS -lt $DEADLINE ]]; do
  if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
         -o BatchMode=yes -i "$ADMIN_KEY_FILE" \
         "ubuntu@$PREVIEW_IP" \
         "test -f /opt/preview/.sslip-domain" 2>/dev/null; then
    echo "    Setup complete."
    break
  fi
  echo "    Not ready yet — retrying in 20s…"
  sleep 20
done
if [[ $SECONDS -ge $DEADLINE ]]; then
  echo "ERROR: Timed out waiting for setup. Check /var/log/cloud-init-output.log on the instance." >&2
  exit 1
fi

# ── 3. Generate deploy SSH keypair ─────────────────────────────────────────────
echo "==> Generating deploy SSH keypair…"
DEPLOY_KEY_FILE="/tmp/preview-deploy-key-$$"
ssh-keygen -t ed25519 -C "preview-deploy@$(date +%Y%m%d)" \
  -f "$DEPLOY_KEY_FILE" -N ""
# shellcheck disable=SC2064
trap "rm -f '$ADMIN_KEY_FILE' '$DEPLOY_KEY_FILE' '${DEPLOY_KEY_FILE}.pub'" EXIT

# ── 4. Install deploy public key on the instance ──────────────────────────────
echo "==> Installing deploy public key…"
PUBKEY=$(cat "${DEPLOY_KEY_FILE}.pub")
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=20 \
    -i "$ADMIN_KEY_FILE" "ubuntu@$PREVIEW_IP" \
    "sudo -u preview bash -c \"
      mkdir -p /home/preview/.ssh
      chmod 700 /home/preview/.ssh
      printf '%s\n' '$PUBKEY' >> /home/preview/.ssh/authorized_keys
      chmod 600 /home/preview/.ssh/authorized_keys
    \""

# ── 5. Add cron job for periodic repo pulls ───────────────────────────────────
echo "==> Adding cron job (git pull every 10 min)…"
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=20 \
    -i "$ADMIN_KEY_FILE" "ubuntu@$PREVIEW_IP" \
    "(sudo -u preview crontab -l 2>/dev/null | grep -vF 'pull --ff-only';
      echo '*/10 * * * * git -C /opt/preview/repo pull --ff-only --quiet') \
    | sudo -u preview crontab -"

# ── 6. Set GitHub secrets ─────────────────────────────────────────────────────
echo "==> Setting GitHub secrets on $GITHUB_REPO…"
gh secret set PREVIEW_HOST    --repo "$GITHUB_REPO" --body "$PREVIEW_IP"
gh secret set PREVIEW_SSH_KEY --repo "$GITHUB_REPO" --body "$(cat "$DEPLOY_KEY_FILE")"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "Preview server is ready."
echo "  Elastic IP:  $PREVIEW_IP"
echo "  URL pattern: https://<4001-4025>.\$(ssh ubuntu@$PREVIEW_IP cat /opt/preview/.sslip-domain)"
echo "  Secrets set: PREVIEW_HOST, PREVIEW_SSH_KEY on $GITHUB_REPO"
echo ""
echo "Open a test PR to verify preview builds are working."
