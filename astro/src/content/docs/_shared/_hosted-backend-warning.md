When developing against a FusionAuth Cloud instance with a hostname ending in `fusionauth.io`, requests from applications outside the `fusionauth.io` domain fail with a `403` status code.

These endpoints do not work correctly for cross-site requests. A cross-site request comes from an application on a different registrable domain than FusionAuth. For example, requests from `app.acme.com` to `acme.fusionauth.io` are cross-site.

If possible, have FusionAuth and your application served by the same domain, using a [proxy if needed](/docs/deploy/production/proxy-setup). For example, serve your app from `app.acme.com` and FusionAuth from `auth.acme.com`.

If this configuration is not possible, use one of these alternative methods:

* Develop using a local FusionAuth instance, so both your webapp and FusionAuth are running on `localhost`.
* Do not use the FusionAuth hosted backend. Write your own backend with a cross-origin cookie policy. See the [Express SDK example](https://github.com/FusionAuth/fusionauth-javascript-sdk-express/tree/main).
* Configure a [custom domain name for the FusionAuth Cloud instance](/docs/cloud/operate/custom-domains).

Modifying FusionAuth CORS configuration options does not fix this issue because the cookies that FusionAuth writes will not be accessible cross domain.
