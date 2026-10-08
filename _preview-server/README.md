# Preview Builds

This folder contains the setup scripts for a server that automatically builds and serves the site when someone opens a PR. Use this to validate that the rendered result of a change is indeed what you expect.

All preview builds run on a single EC2 instance using 25 numbered slots. Main's dependencies get installed once per distinct `package.json` and lockfile into `/opt/preview/node_modules/<hash>`. Slots whose packages match main symlink that tree. If a PR changes a dependency, the slot copies main's tree and runs `npm install` for the difference only. Each slot also uses a per-slot `.content-cache` to reduce build time. Only one build runs per slot at a time: a new push kills the previous build for that PR on the server, since cancelling the Actions job does not stop it. The preview server assigns new PRs to the oldest free slot and refreshes existing slots when new commits arrive.

Nginx serves the static build output on HTTPS via [sslip.io](https://sslip.io) wildcard DNS — no separate DNS record needed.

## How it works

1. Developer pushes to a PR.
2. GitHub Actions posts a "⏳ Building preview…" comment and creates a **GitHub Deployment** for `preview-pr-<N>` (shows a yellow indicator in the PR header).
3. Actions SCPs the scripts to EC2, then SSHes to run `build-preview.sh`.
4. `build-preview.sh` fetches the PR ref, sets up a git worktree, builds with `npm run build`, and emits `PAGE:` lines for the changed-pages table.
5. Actions updates the comment with the preview URL + changed-pages table, and sets the deployment to ✅ green.
6. When the PR closes, the slot is released and the deployment is marked inactive.

## Quick setup (Terraform)

Prerequisites: `terraform`, `aws` CLI (authenticated), `ssh`, `jq`.

```shell-session
cd _preview-server
./provision.sh ops@example.com --github-repo FusionAuth/fusionauth-site
```

`provision.sh` does everything end-to-end:
1. `terraform apply` — creates EC2 instance (c8g.2xlarge, Ubuntu 26.04 LTS arm64, 500 GB gp3), security group (80/443/22), and Elastic IP.
2. Waits for `user_data` to finish running `setup.sh` on the instance (~5 min).
3. Generates a deploy SSH keypair and installs the public key on the instance.
4. Adds a cron job to keep the repo clone warm (`git pull` every 10 min).
5. Prints the values for the `PREVIEW_HOST` and `PREVIEW_SSH_KEY` GitHub secrets and saves the deploy key to `~/preview-deploy-key-<timestamp>`. Paste them in at Settings > Secrets and variables > Actions, then delete the key file.

To tear down: `cd terraform && terraform destroy`.

## Manual setup

If you prefer not to use Terraform:

1. Launch an EC2 instance:
   - AMI: Ubuntu 26.04 LTS, 64-bit (Arm)
   - Instance type: c8g.2xlarge (Graviton4, 8 vCPU, 16 GB RAM); any Graviton C or M type works, not T types
   - Storage: 500 GB gp3
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

1. Set GitHub secrets at Settings > Secrets and variables > Actions:
   - `PREVIEW_HOST`: the Elastic IP
   - `PREVIEW_SSH_KEY`: the full contents of `/tmp/preview-key`, then delete that file

1. Add the cron job (keeps the master clone warm so builds start from a fresh tree):

   ```bash
   # Add to preview user's crontab: sudo -u preview crontab -e
   */10 * * * * git -C /opt/preview/repo pull --ff-only --quiet
   ```

1. Open a test PR and watch for the "⏳ Building preview…" comment and the deployment indicator.

## Re-deploying script changes

The workflow SCPs `build-preview.sh` and `release-slot.sh` to the server before every build, so script changes go live automatically on the next PR push — no manual server access needed.

## Replacing a server (new IP)

If the instance IP changes (e.g. you terminate and re-create it without an Elastic IP), re-run `setup.sh` to get a new Let's Encrypt cert for the new sslip.io domain, then update `PREVIEW_HOST` in GitHub secrets. With an Elastic IP, the IP never changes and this is never needed.
