When developing against a FusionAuth Cloud instance using an apex domain of `fusionauth.io` address, unless your application shares the same domain of `fusionauth.io` attempts to use these endpoints will fail with a `403` status code. 

These endpoints will not work correctly for cross origin requests. Cross origin requests occur when the application making the request to FusionAuth is using a separate domain. For example, if your application URL is `app.acme.com` and the FusionAuth URL is `acme.fusionauth.io` requests from your application to FusionAuth will be considered cross origin.

If at all possible you should plan to access FusionAuth and your application in the same domain. If this is not possible, you may use one of these alternative methods:

* Develop using a local FusionAuth instance, so both your webapp and FusionAuth are running on `localhost`.
* Use a proxy to rewrite the requests to utilize the same domain. 
* Do not use the the FusionAuth hosted backend, and instead write your own backend with a cross origin cookie policy: [here's an example](https://github.com/FusionAuth/fusionauth-example-react-sdk/tree/main/server).
* Configure a [custom domain name for the FusionAuth Cloud instance](/docs/get-started/run-in-the-cloud/cloud#updating-with-existing-custom-domains) (limited to certain plans).

Modifying FusionAuth CORS configuration options will not fix this issue because the cookies that FusionAuth writes will not be accessible cross domain.
