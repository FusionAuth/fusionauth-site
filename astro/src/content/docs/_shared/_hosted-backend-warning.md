<details><summary>Using FusionAuth Cloud</summary>
When developing against a FusionAuth Cloud instance with a hostname ending in `fusionauth.io`, unless your application shares the same domain of `fusionauth.io` attempts to use these endpoints will fail with a `403` status code. 

These endpoints do not work correctly for cross origin requests. Cross origin requests occur when the application making the request to FusionAuth is using a separate domain. For example, if your application URL is `app.acme.com` and the FusionAuth URL is `acme.fusionauth.io` requests from your application to FusionAuth will be considered cross origin.

If possible, have FusionAuth and your application served by the same domain, using a [proxy if needed](/docs/operate/deploy/proxy-setup). For example, serve your app from `app.acme.com` and FusionAuth from `auth.acme.com`.

If this configuration is not possible, use one of these alternative methods:

* Develop using a local FusionAuth instance, so both your webapp and FusionAuth are running on `localhost`.
* Do not use the FusionAuth hosted backend, and instead write your own backend with a cross origin cookie policy: [here's an example](https://github.com/FusionAuth/fusionauth-javascript-sdk-express/tree/main).
* Configure a [custom domain name for the FusionAuth Cloud instance](/docs/get-started/run-in-the-cloud/cloud#updating-with-existing-custom-domains) (limited to certain plans).

Modifying FusionAuth CORS configuration options does not fix this issue because the cookies that FusionAuth writes will not be accessible cross domain.
</details>