# Preview Builds

This folder contains setup scripts for a server that automatically builds and serves the site when someone opens a PR. Use this to validate that the rendered result of a change is indeed what you expect (it's not always possible to tell just from the Markdown!).

All preview builds run on a single machine using 25 numbered slots. Each slot symlinks `node_modules` and `.content-cache` to reduce setup time for each slot. If a PR changes a dependency, `npm ci` runs. The preview server always assigns new PR builds to the oldest slot, and refreshes existing slots when new commits arrive in their respective PRs. We use nginx to serve the static build output on each port, to simulate something kinda sorta like our dev and prod deploy processes.

## Configure Previews

1. Launch an EC2 instance with the following configuration:

   - AMI: Ubuntu 24.04 LTS
   - Instance type: m6i.2xlarge (8 vCPU, 32 GB RAM) (same as github actions runner)
   - Storage: 100 GB gp3
   - Security group inbound rules:
     - Port 22 (SSH) from 0.0.0.0/0
     - Ports 4001–4025 from 0.0.0.0/0 (builds are public)

1. SCP the scripts to the instance first:

   ```shell-session
   scp -r _preview-server ubuntu@<ec2-ip>:/tmp/preview-setup
   ```

1. SSH into machine and run setup (note that we use HTTPS clone to avoid setting up any SSH keys for github):

   ```shell-session
   ssh ubuntu@<ec2-ip>
   sudo bash /tmp/preview-setup/setup.sh \
     https://github.com/FusionAuth/fusionauth-site.git \
     preview.fusionauth.io
   ```

1. Create the deploy SSH keypair:

   ```shell-session
   sudo -u preview ssh-keygen -t ed25519 -C 'preview-deploy' \
     -f /home/preview/.ssh/preview-deploy -N ''
   ```

1. Authorize keypair for the preview user:

   ```shell-session
   sudo -u preview bash -c \
     'cat /home/preview/.ssh/preview-deploy.pub >> /home/preview/.ssh/authorized_keys'
   ```

1. Print private key and add output to the repo as the `PREVIEW_SSH_KEY` GitHub secret:

   ```shell-session
   sudo cat /home/preview/.ssh/preview-deploy
   ```

1. Add `PREVIEW_HOST` GitHub secret to the repo, set value to the EC2 instance's public IP address.

1. Keep the master clone warm with cron job:

   ```cron
   # On EC2 — add to preview user's crontab: crontab -u preview -e
   # Pulls main every 10 min so slots start from a nearly-fresh clone
   */10 * * * * git -C /opt/preview/repo pull --ff-only --quiet
   ```

1. Open a test PR. Within ~30 seconds you should see the "Building preview…" comment appear, followed by the "Preview ready" update with the table of changed pages ~1–2 minutes later.
