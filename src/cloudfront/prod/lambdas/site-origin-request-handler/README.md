# site-origin-request-handler

This is a Lambda@Edge function that handles redirects for fusionauth.io.

## Localdev

You'll need Node 18 or later installed.

From this directory, install the dependencies.
```
npm install
```

Run the tests with AWS credentials that have permissions to read from the `fusionauth-prod-us-east-1-artifacts` bucket.
```
AWS_PROFILE=fusionauth-prod npm test
```
