Once the FusionAuth service is started, open a browser and access [http://localhost:9011/](http://localhost:9011/),
where you'll be taken to a "Maintenance Mode" screen:

{% include _image.liquid src="/assets/img/blogs/includes/fusionauth/maintenance-mode-database.png" alt="FusionAuth
maintenance mode screen." class="img-fluid" figure=true %}

{% include _callout-tip.liquid
content="`localhost` above and in other sections of this article can be replaced with your machine's hostname or IP
address if you're running this project on a remote machine."
%}

Fill in the fields:

```Settings
Database type: postgresql
Host: postgres (if running using docker)
Port: 5432
Database: fusionauth

Superuser credentials
Username: postgres
Password: postgres

FusionAuth credentials
Username: fusionauth
Password: (the default value is fine)
```

Once the setup is complete, you'll be automatically redirected to the "FusionAuth Setup Wizard", as seen here:

{% include _image.liquid src="/assets/img/blogs/includes/fusionauth/setup-wizard.png" alt="FusionAuth setup wizard."
class="img-fluid" figure=true %}

Fill in the admin user account details and accept the license agreement; then click "Submit".

Learn more about [setup wizard](https://fusionauth.io/docs/v1/tech/tutorials/setup-wizard).

After submitting, you'll be taken to a login screen where you need to fill in the credentials you specified during the
setup wizard and sign in to the FusionAuth administrative user interface. Later, you'll use the same admin account for
testing the SSO of the application.
