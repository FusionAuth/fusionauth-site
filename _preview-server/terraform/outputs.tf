output "preview_server_ip" {
  description = "Elastic IP of the preview server — use as the PREVIEW_HOST GitHub secret"
  value       = aws_eip.preview.public_ip
}

output "admin_private_key" {
  description = "Admin SSH private key for post-provisioning access (ubuntu@<ip>). provision.sh reads this automatically."
  value       = tls_private_key.admin.private_key_openssh
  sensitive   = true
}
