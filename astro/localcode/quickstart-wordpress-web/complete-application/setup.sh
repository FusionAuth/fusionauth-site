#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Install WordPress
docker compose exec cli wp core install --url="http://localhost:3000" --title="Change Bank" --admin_user="admin" --admin_password="password" --admin_email="admin@example.com" --skip-email

# Set permalinks
docker compose exec cli wp rewrite structure '/%postname%/'

# Delete default pages
docker compose exec -T cli wp post list --post_type=page --field=ID --format=csv | tail -n +2 | xargs -I {} docker compose exec -T cli wp post delete {} --force

# Create placeholder pages
docker compose exec cli wp post create --post_type=page --post_title="Home"    --post_status=publish
docker compose exec cli wp post create --post_type=page --post_title="Account" --post_status=publish
docker compose exec cli wp post create --post_type=page --post_title="Change"  --post_status=publish

# Create blank template and assign to pages
docker compose exec wp bash -c 'cat > /var/www/html/wp-content/themes/twentytwentyfive/templates/page-blank.html << EOF
<!-- wp:post-content {"layout":{"type":"constrained"}} /-->
EOF'
HOME_ID=$(docker compose exec cli wp post list --post_type=page --name=home --field=ID)
ACCOUNT_ID=$(docker compose exec cli wp post list --post_type=page --name=account --field=ID)
CHANGE_ID=$(docker compose exec cli wp post list --post_type=page --name=change --field=ID)
docker compose exec cli wp post meta update $HOME_ID _wp_page_template "page-blank"
docker compose exec cli wp post meta update $ACCOUNT_ID _wp_page_template "page-blank"
docker compose exec cli wp post meta update $CHANGE_ID _wp_page_template "page-blank"

# Set homepage
HOME_ID=$(docker compose exec cli wp post list --post_type=page --name=home --field=ID)
docker compose exec cli wp option update show_on_front page
docker compose exec cli wp option update page_on_front $HOME_ID

# Install and configure OIDC plugin
docker compose exec cli wp plugin install daggerhart-openid-connect-generic --activate
docker compose exec cli wp option update openid_connect_generic_settings '{"client_id":"e9fdb985-9173-4e01-9d73-ac2d60d1dc8e","client_secret":"super-secret-secret-that-should-be-regenerated-for-production","scope":"openid email profile","endpoint_login":"http://localhost:9011/oauth2/authorize","endpoint_userinfo":"http://fusionauth:9011/oauth2/userinfo","endpoint_token":"http://fusionauth:9011/oauth2/token","endpoint_end_session":"http://localhost:9011/oauth2/logout","endpoint_jwks":"http://fusionauth:9011/.well-known/jwks.json","identity_key":"sub","nickname_key":"sub","email_key":"email","displayname_format":"{email}","link_existing_users":"yes","allow_internal_idp":true,"redirect_to_back_to_login":"yes"}' --format=json

# Prevent default login (optional)
docker compose cp ./complete-application/wp-login.php wp:/var/www/html/wp-login.php

# Install and configure page restriction plugin
docker compose exec cli wp plugin install simple-page-access-restriction --activate
docker compose exec cli wp option update ps_simple_par_settings '{"redirect_type":"url","redirect_url":"http://localhost:3000/wp-login.php","redirect_parameter":"redirect_to","login_page":"","remove_data":"","restrict_new_posts":"","post_types":["page"],"taxonomies":[]}' --format=json

# Restrict account and change pages
ACCOUNT_ID=$(docker compose exec cli wp post list --post_type=page --name=account --field=ID)
docker compose exec cli wp post meta update $ACCOUNT_ID page_access_restricted 1
CHANGE_ID=$(docker compose exec cli wp post list --post_type=page --name=change --field=ID)
docker compose exec cli wp post meta update $CHANGE_ID page_access_restricted 1

# Install and configure dashboard redirect plugin
docker compose exec cli wp plugin install remove-dashboard-access-for-non-admins --activate
docker compose exec cli wp option update rda_redirect_url "http://localhost:3000/account"

# Install hide admin bar plugin
docker compose exec cli wp plugin install hide-admin-bar-from-non-admins --activate

# Install shortcoder and shortcode-variables plugins
docker compose exec cli wp plugin install shortcoder --activate
docker compose exec cli wp plugin install shortcode-variables --activate

# Upload money image
docker compose cp ./complete-application/money.jpg wp:/var/www/html/money.jpg
docker compose exec cli wp media import /var/www/html/money.jpg --title="Money"

# Create shortcodes (replaces money.jpg URL with actual upload path)
MONEY_URL=$(docker compose exec cli wp post list --post_type=attachment --name=money --field=guid)
docker compose exec cli wp post create --post_type=shortcoder --post_name="home" --post_title="home" --post_content="<style>$(cat complete-application/changebank.css)</style>$(sed "s|http://localhost:3000/wp-content/uploads/2023/09/money-scaled.jpg|$MONEY_URL|" complete-application/home.html)" --post_status=publish
docker compose exec cli wp post create --post_type=shortcoder --post_name="account" --post_title="account" --post_content="<style>$(cat complete-application/changebank.css)</style>$(cat complete-application/account.html)" --post_status=publish
docker compose exec cli wp post create --post_type=shortcoder --post_name="change" --post_title="change" --post_content="<style>$(cat complete-application/changebank.css)</style>$(cat complete-application/change.html)<script>$(cat complete-application/change.js)</script>" --post_status=publish

# Add shortcodes to pages and flush rewrites
docker compose exec cli wp post update $HOME_ID --post_content='[sc name="home"]'
docker compose exec cli wp post update $ACCOUNT_ID --post_content='[sc name="account"]'
docker compose exec cli wp post update $CHANGE_ID --post_content='[sc name="change"]'
docker compose exec cli wp rewrite flush
