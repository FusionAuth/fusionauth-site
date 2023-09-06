When developing against a FusionAuth Cloud instance with a `.fusionauth.io` address, unless your application also lives at a `.fusionauth.io` address, you'll receive a `403` response code. The hosted backend does not work across origins. This occurs whenever FusionAuth is hosted on a different domain from the application accessing the hosted backend.

To work around this, you can:

* develop using a local FusionAuth instance, so both your webapp and FusionAuth are running on `localhost`.
* set up a lightweight proxy to ensure both servers are the same domain.
* stand up a barebones backend with a more liberal cookie policy: [here's an example](https://github.com/FusionAuth/fusionauth-example-react-sdk/tree/main/server).
* set up a [custom domain name for the FusionAuth Cloud instance](/docs/v1/tech/installation-guide/cloud#updating-with-existing-custom-domains) (limited to certain plans).

Modifying FusionAuth CORS configuration options will not fix this issue.
