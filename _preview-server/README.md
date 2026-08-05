# Preview Builds

This folder contains the setup scripts for a server that automatically builds and serves the site when someone opens a PR. Use this to validate that the rendered result of a change is indeed what you expect.

All preview builds run on a single EC2 instance using 25 numbered slots. Each slot symlinks `node_modules` and uses a per-slot `.content-cache` to reduce build time. If a PR changes a dependency, `npm ci` runs. The preview server assigns new PRs to the oldest free slot and refreshes existing slots when new commits arrive.

Nginx serves the static build output on HTTPS via [sslip.io](https://sslip.io) wildcard DNS — no separate DNS record needed.

## How it works

1. Developer pushes to a PR.
2. GitHub Actions posts a "⏳ Building preview…" comment and creates a **GitHub Deployment** for `preview-pr-<N>` (shows a yellow indicator in the PR header).
3. Actions SCPs the scripts to EC2, then SSHes to run `build-preview.sh`.
4. `build-preview.sh` fetches the PR ref, sets up a git worktree, builds with `npm run build`, and emits `PAGE:` lines for the changed-pages table.
5. Actions updates the comment with the preview URL + changed-pages table, and sets the deployment to ✅ green.
6. When the PR closes, the slot is released and the deployment is marked inactive.

## Quick setup (Terraform)

Prerequisites: `terraform`, `aws` CLI (authenticated), `gh` CLI (authenticated), `ssh`, `jq`.

```shell-session
cd _preview-server
./provision.sh ops@example.com --github-repo FusionAuth/fusionauth-site
```

`provision.sh` does everything end-to-end:
1. `terraform apply` — creates EC2 instance (m6i.2xlarge, Ubuntu 24.04 LTS), security group (80/443/22), and Elastic IP.
2. Waits for `user_data` to finish running `setup.sh` on the instance (~5 min).
3. Generates a deploy SSH keypair and installs the public key on the instance.
4. Adds a cron job to keep the repo clone warm (`git pull` every 10 min).
5. Sets `PREVIEW_HOST` and `PREVIEW_SSH_KEY` as GitHub secrets on the repo.

To tear down: `cd terraform && terraform destroy`.

## Manual setup

If you prefer not to use Terraform:

1. Launch an EC2 instance:
   - AMI: Ubuntu 24.04 LTS
   - Instance type: m6i.2xlarge (8 vCPU, 32 GB RAM)
   - Storage: 100 GB gp3
   - Security group inbound: port 22, 80, 443 from `0.0.0.0/0`
   - Allocate an Elastic IP and associate it (so the IP stays stable across reboots)

1. Copy the setup files and run setup:

   ```shell-session
   scp -r _preview-server ubuntu@<ec2-ip>:/tmp/preview-setup
   ssh ubuntu@<ec2-ip>
   sudo bash /tmp/preview-setup/setup.sh \
     https://github.com/FusionAuth/fusionauth-site.git \
     ops@example.com
   ```

1. Generate the deploy SSH keypair:

   ```shell-session
   ssh-keygen -t ed25519 -C 'preview-deploy' -f /tmp/preview-key -N ''
   ssh ubuntu@<ec2-ip> \
     "sudo -u preview bash -c 'cat >> /home/preview/.ssh/authorized_keys'" \
     < /tmp/preview-key.pub
   ```

1. Set GitHub secrets:

   ```shell-session
   gh secret set PREVIEW_HOST    --repo FusionAuth/fusionauth-site --body "<ec2-ip>"
   gh secret set PREVIEW_SSH_KEY --repo FusionAuth/fusionauth-site --body "$(cat /tmp/preview-key)"
   ```

1. Add the cron job (keeps the master clone warm so builds start from a fresh tree):

   ```cron
   # Add to preview user's crontab: sudo -u preview crontab -e
   */10 * * * * git -C /opt/preview/repo pull --ff-only --quiet
   ```

1. Open a test PR and watch for the "⏳ Building preview…" comment and the deployment indicator.

## Re-deploying script changes

The workflow SCPs `build-preview.sh` and `release-slot.sh` to the server before every build, so script changes go live automatically on the next PR push — no manual server access needed.

## Replacing a server (new IP)

If the instance IP changes (e.g. you terminate and re-create it without an Elastic IP), re-run `setup.sh` to get a new Let's Encrypt cert for the new sslip.io domain, then update `PREVIEW_HOST` in GitHub secrets. With an Elastic IP, the IP never changes and this is never needed.
