# WordPress + FusionAuth Quickstart - GUI Replacement Commands

These commands replicate each GUI step in the tutorial for automation testing.
Run from the `quickstart-wordpress-web` directory (where `docker-compose.yml` is).
The `complete-application` directory is ONLY for reference code files.

## Preliminary Setup - Install WordPress

> Browse to http://localhost:3000/wp-admin/install.php
> Choose "English (United States)" and click "Continue"
> Set Site Title to "Change Bank", Username to "admin", Password to "password"
> Enable "Confirm use of weak password", Set Your Email to "admin@example.com"
> Click "Install WordPress"

```console
docker compose exec cli wp core install --url="http://localhost:3000" --title="Change Bank" --admin_user="admin" --admin_password="password" --admin_email="admin@example.com" --skip-email
```

## Create Placeholder Pages - Set Permalinks

> Under Settings -> Permalinks, change "Permalink structure" to "Post name"

```console
docker compose exec cli wp rewrite structure '/%postname%/'
```

## Create Placeholder Pages - Delete Defaults

> Click "Pages", Select the two existing sample pages
> "Bulk Actions" -> "Move to Trash" -> "Apply"

```console
docker compose exec -T cli wp post list --post_type=page --field=ID --format=csv | tail -n +2 | xargs -I {} docker compose exec -T cli wp post delete {} --force
```

## Create Placeholder Pages - Create Pages

> Click "Add New", Under "Add Title" enter "Home"
> Under "Page" -> "Template", select "Blank"
> Click "Publish"
> Repeat for "Account" and "Change" pages

```console
docker compose exec cli wp post create --post_type=page --post_title="Home"    --post_status=publish
docker compose exec cli wp post create --post_type=page --post_title="Account" --post_status=publish
docker compose exec cli wp post create --post_type=page --post_title="Change"  --post_status=publish
```

## Set Homepage

> Under Settings -> Reading, change "Your homepage displays" to "A static page"
> Under "Homepage" select "Home"

```console
HOME_ID=$(docker compose exec cli wp post list --post_type=page --name=home --field=ID)
docker compose exec cli wp option update show_on_front page
docker compose exec cli wp option update page_on_front $HOME_ID
```

## Authentication - Install OIDC Plugin

> Plugins -> Add new, search "OpenID Connect Generic Client"
> Click "Install Now", then "Activate"

```console
docker compose exec cli wp plugin install daggerhart-openid-connect-generic --activate
```

## Authentication - Configure OIDC

> Settings -> Open ID Connect Client, enter settings:
> - Client ID: `E9FDB985-9173-4E01-9D73-AC2D60D1DC8E`
> - Client Secret Key: `super-secret-secret-that-should-be-regenerated-for-production`
> - OpenID Scope: `openid email profile`
> - Login Endpoint URL: `http://localhost:9011/oauth2/authorize`
> - Userinfo Endpoint URL: `http://fusionauth:9011/oauth2/userinfo`
> - Token Validation Endpoint URL: `http://fusionauth:9011/oauth2/token`
> - End Session Endpoint URL: `http://localhost:9011/oauth2/logout`
> - Nickname Key: `sub`
> - Display Name Formatting: `{email}`
> - Enable "Link Existing Users": yes

```console
docker compose exec cli wp option update openid_connect_generic_settings '{"client_id":"E9FDB985-9173-4E01-9D73-AC2D60D1DC8E","client_secret":"super-secret-secret-that-should-be-regenerated-for-production","scope":"openid email profile","endpoint_login":"http://localhost:9011/oauth2/authorize","endpoint_userinfo":"http://fusionauth:9011/oauth2/userinfo","endpoint_token":"http://fusionauth:9011/oauth2/token","endpoint_end_session":"http://localhost:9011/oauth2/logout","identity_key":"sub","nickname_key":"sub","email_key":"email","displayname_format":"{email}","link_existing_users":"yes","redirect_url":"http://localhost:3000/wp-admin/admin-ajax.php?action=openid-connect-authorize","allow_internal_idp":true}' --format=json
```

## Prevent Default Login (Optional)

```console
docker compose cp ./complete-application/wp-login.php wp:/var/www/html/wp-login.php
```

## Restrict Pages - Install Plugin

> Plugins -> Add New, search "simple page access restriction"
> Install and activate the one by "Plugins & Snippets"

```console
docker compose exec cli wp plugin install simple-page-access-restriction --activate
```

## Restrict Pages - Configure Plugin

> "Login Redirect Type": `URL`
> "Login Redirect URL": `http://localhost:3000/wp-login.php`
> Click "Save Changes"

```console
docker compose exec cli wp option update spr_settings '{"login_redirect_type":"url","login_redirect_url":"http://localhost:3000/wp-login.php"}' --format=json
```

## Restrict Pages - Restrict Account Page

> Pages -> Edit "account" page
> Enable "For Logged-In Users Only"
> Click "Update"

```console
ACCOUNT_ID=$(docker compose exec cli wp post list --post_type=page --name=account --field=ID)
docker compose exec cli wp post meta update $ACCOUNT_ID _spr_restricted "yes"
```

## Restrict Pages - Restrict Change Page

> Edit "change" page, enable "For Logged-In Users Only"

```console
CHANGE_ID=$(docker compose exec cli wp post list --post_type=page --name=change --field=ID)
docker compose exec cli wp post meta update $CHANGE_ID _spr_restricted "yes"
```

## Send User To Account After Log In - Install Plugin

> Search for and install "Remove Dashboard Access" by TrustedLogin

```console
docker compose exec cli wp plugin install remove-dashboard-access-for-non-admins --activate
```

## Send User To Account After Log In - Configure Plugin

> Settings -> Dashboard Access
> Change "Redirect URL" to `http://localhost:3000/account`
> Click "Save Changes"

```console
docker compose exec cli wp option update rda_settings '{"redirect_url":"http://localhost:3000/account"}' --format=json
```

## Customization - Install Shortcoder

> Search for and add the plugin "Shortcoder" by vaakash

```console
docker compose exec cli wp plugin install shortcoder --activate
```

## Customization - Install Snippet Shortcodes

> Add the plugin "Snippet Shortcodes" by Ali Colville

```console
docker compose exec cli wp plugin install shortcode-variables --activate
```

## Add An Image - Upload money.jpg

> Media -> Add New, select `money.jpg` from `complete-application` directory
> Copy the "File URL" from output for use in home.html

```console
docker compose cp ./complete-application/money.jpg wp:/var/www/html/money.jpg
docker compose exec cli wp media import /var/www/html/money.jpg --title="Money"
```

## Add Custom Page Shortcodes - Create Shortcodes

> Create shortcodes using Shortcoder (stores as custom post type `shortcoder`).
> The shortcode syntax is `[sc name="name"]`.
> Combine HTML + CSS + JS into single shortcode content.

```console
docker compose exec cli wp post create --post_type=shortcoder --post_name="home" --post_title="home" --post_content="<style>$(cat complete-application/changebank.css)</style>$(cat complete-application/home.html)" --post_status=publish

docker compose exec cli wp post create --post_type=shortcoder --post_name="account" --post_title="account" --post_content="<style>$(cat complete-application/changebank.css)</style>$(cat complete-application/account.html)" --post_status=publish

docker compose exec cli wp post create --post_type=shortcoder --post_name="change" --post_title="change" --post_content="<style>$(cat complete-application/changebank.css)</style>$(cat complete-application/change.html)<script>$(cat complete-application/change.js)</script>" --post_status=publish
```

## Add Shortcodes To Pages

> Update pages with Shortcoder shortcodes:

```console
docker compose exec cli wp post update $HOME_ID --post_content='[sc name="home"]'
docker compose exec cli wp post update $ACCOUNT_ID --post_content='[sc name="account"]'
docker compose exec cli wp post update $CHANGE_ID --post_content='[sc name="change"]'
docker compose exec cli wp rewrite flush
```

## Done

- Test: http://localhost:3000 (home page)
- Test: http://localhost:3000/account (requires login)
- Test: http://localhost:3000/change (requires login)
- Login: `richard@example.com` / `password` (non-admin user)
- Admin: `admin@example.com` / `password`
