# Quickstart: Drupal app with FusionAuth

> [!WARNING]
> This repository is generated from content that lives at [github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site/tree/main/astro/extractedcode/quickstart-php-drupal-web). Changes to files here _will be overwritten by that automation_. File an issue or pull request with [fusionauth-site](https://github.com/FusionAuth/fusionauth-site) instead.

This repository contains a Drupal app that uses [FusionAuth](https://fusionauth.io/), as the authentication provider.

## Setup

### Prerequisites

- [PHP](https://www.php.net/downloads.php) 8.1.0+
- [Composer](https://getcomposer.org/)
- [GD extension](https://www.php.net/manual/en/book.image.php)
- [Docker](https://www.docker.com): The quickest way to stand up FusionAuth. (There are [other ways](/docs/v1/tech/installation-guide/))

> NOTE: Drupal 10 requires `PHP 8.1.0 or higher` and `MariaDB 10.3.7+` or `MySQL/Percona 5.7.8+` in order to run.

### Installation

Clone this repository to your local machine and then enter the `fusionauth-quickstart-php-drupal-web` directory.

Open a bash terminal in the root of this directory and run the following command to pull the necessary Docker images:

```bash
docker compose pull
```

Next, run the following command to start the Drupal and FusionAuth containers:

```bash
docker compose up -d
```

If all is well, you should see the following running containers:

- `fusionauth-quickstart-php-drupal-web-web-1`: The Drupal container.
- `fusionauth-quickstart-php-drupal-web-db-1`: FusionAuth's PostrgreSQL database.
- `fusionauth-quickstart-php-drupal-web-db2-1`: Drupal's MySQL database.
- `fusionauth-quickstart-php-drupal-web-fusionauth-1`: The FusionAuth container.
- `fusionauth-quickstart-php-drupal-web-search-1`: The Opensearch container.

If one of the containers fails to start, or you wish to reset the system, run the following commands to stop and remove all containers and volumes:

```bash
docker compose kill
docker compose rm -fv
docker compose down -v
```

`docker compose kill` stops all running containers, `docker compose rm -fv` removes them and then `docker compose down -v` removes the volumes.

You'll then need to re-run `docker compose up -d` to start the containers again.


The FusionAuth configuration files make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run. 

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker-compose as we explained above by executing `docker compose down -v`. 

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

### Drupal complete-application

The `complete-application` directory contains the Drupal app configured to authenticate with locally running FusionAuth.

The repository holds only what's specific to this app: the custom `changebank` module and theme, the exported site configuration in `complete-application/config/sync`, and `composer.json` and `composer.lock`. Drupal core, contributed modules and their dependencies aren't committed. Composer downloads them.

#### Install Drupal

With the containers running, run the install script inside the Drupal container:

```bash
docker compose exec web sh install.sh
```

The script:

1. Downloads Drupal and its modules with `composer install`, at the versions in `composer.lock`.
2. Installs the site from the exported configuration with `drush site:install --existing-config`.
3. Creates the site's content, like the home page and menu links, with `default-content/create-content.php`.

Installing replaces any existing Drupal site in the database. To start over, run `docker compose down -v`, then `docker compose up -d`, then the install script again.

### Accessing the Drupal App

You can now access the Drupal app by opening a browser and navigating to http://localhost.

To login to the application with FusionAuth, click the Login button and then on the user login page located at http://localhost/user/login you can click on the button labeled `Log in with FusionAuth`.

That will redirect you to the FusionAuth login page where you can login with the following credentials:

* Username: `admin@example.com`
* Password: `password`

OR

* Username: `richard@example.com`
* Password: `password`

Once you login, you will be redirected back to the Drupal app's account page (http://localhost/account) where you will see your username in the top right hand corner along with the logout button.

In the main navigation menu, you will see a link to the makechange page (http://localhost/makechange) where you can navigate to and "make change" with the form located there and the account page will keep track of the last value you entered.

You're currently logged in as a user with the role of `authenticated user` which means you can only access the `account`, `makechange` and `home` pages.

If you want to explore the application with more depth as an admin user, you can do so by logging out and then entering the following credentials at the user login page:

* Username: `admin`
* Password: `admin`

If for whatever reason you want to change the credentials for the Drupal application's MySQL database, make sure to update the `settings.php` file located at `./complete-application/web/sites/default/settings.php` with the new credentials.

By default they are:

```php
$databases['default']['default'] = array (
  'database' => 'drupaldb',
  'username' => 'drupal',
  'password' => 'verybadpassword',
  'prefix' => '',
  'host' => 'db2',
  'port' => '3307',
  'isolation_level' => 'READ COMMITTED',
  'namespace' => 'Drupal\\mysql\\Driver\\Database\\mysql',
  'driver' => 'mysql',
  'autoload' => 'core/modules/mysql/src/Driver/Database/mysql/',
);
```

### Drush

The command-line tool, Drush, is installed in the Drupal container and you can make use of it to perform various tasks.

One such task is to import or export config for the database. To do so, open a bash terminal in the root of the `fusionauth-quickstart-php-drupal-web` directory and run the following command to enter the Drupal container:

```bash
docker compose exec web bash
```

Once inside the container, you can run the following command to export the config:

```bash
vendor/bin/drush cex
```

Or to import config:
  
```bash
vendor/bin/drush cim
```

> **NOTE**: This site's config directory is `complete-application/config/sync`, set by `config_sync_directory` in `settings.php`. Export with `drush cex` after changing configuration in the admin UI, so the change is kept when the site is reinstalled.
> 
> You can do manual imports by copying the code in a particular .yml file the `config/sync` directory, visiting the import page at http://localhost/admin/config/development/configuration/single/import, selecting the corresponding config type and pasting the code into the text area.

Other popular commands include:

- `vendor/bin/drush cr`: Clears the cache,
- `vendor/bin/drush pm-enable <module name>`: Enables a module,
- `vendor/bin/drush updb`: Updates the database,
- `vendor/bin/drush uli`: Generates a one-time login link for a user,
- and many more.

For a full list of commands, visit https://www.drush.org/12.2.0/commands/all/.


### Further Information

Visit https://fusionauth.io/quickstarts/quickstart-php-drupal-web for a step by step guide on how to build the Drupal integration with FusionAuth manually.

### Troubleshooting

* I get `This site can’t be reached  localhost refused to connect.` when I click the Login button

Ensure FusionAuth is running in the Docker container.  You should be able to login as the admin user, `admin@example.com` with the password of `password` at http://localhost:9011/admin.

* I get an error `/usr/bin/env: 'php\r': No such file or directory` when trying to run drush commands.

Incorrect line endings are known to cause this issue. To fix the issue, you need to convert the line endings of the file from Windows to Unix. this can be done by use of the `dos2unix` command. You can install `dos2unix` by running the following command inside the Drupal container:

```bash
apt-get update && apt-get install -y dos2unix
```

Once installed, you can convert the line endings of the file by running the following command inside the Drupal container:

```bash
dos2unix /opt/drupal/vendor/bin/drush
```

