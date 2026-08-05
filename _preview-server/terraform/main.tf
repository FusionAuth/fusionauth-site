terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# ── Admin SSH key pair ─────────────────────────────────────────────────────────
# Used only for the post-provisioning steps in provision.sh (adding the deploy
# key, setting up cron).  Not needed afterward — provision.sh deletes it locally.
resource "tls_private_key" "admin" {
  algorithm = "ED25519"
}

resource "aws_key_pair" "preview_admin" {
  key_name   = "preview-server-admin"
  public_key = tls_private_key.admin.public_key_openssh
}

# ── Security group ─────────────────────────────────────────────────────────────
resource "aws_security_group" "preview" {
  name        = "preview-server"
  description = "PR preview build server"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP (ACME redirect + Let's Encrypt webroot challenge)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS (preview builds via sslip.io)"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "preview-server" }
}

# ── Latest Ubuntu 24.04 LTS (Noble) AMI ───────────────────────────────────────
data "aws_ami" "ubuntu_24_04" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ── EC2 instance ───────────────────────────────────────────────────────────────
resource "aws_instance" "preview" {
  ami                    = data.aws_ami.ubuntu_24_04.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.preview_admin.key_name
  vpc_security_group_ids = [aws_security_group.preview.id]

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 100
    delete_on_termination = true
  }

  # user_data runs setup.sh on first boot; setup takes ~5 min (npm ci, certbot).
  # provision.sh polls for /opt/preview/.sslip-domain (written by setup.sh on
  # success) before continuing with the post-provisioning steps.
  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    repo_url    = var.github_repo_url
    admin_email = var.admin_email
  })

  tags = { Name = "preview-server" }
}

# ── Elastic IP ─────────────────────────────────────────────────────────────────
# Keeps the same IP across reboots so the sslip.io cert and GitHub secret stay
# valid without re-running setup.
resource "aws_eip" "preview" {
  instance = aws_instance.preview.id
  domain   = "vpc"

  tags = { Name = "preview-server" }
}
