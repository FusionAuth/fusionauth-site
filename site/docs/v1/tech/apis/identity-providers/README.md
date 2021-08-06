## Developer Notes

### Structure

There are two groups of Identity Providers.  The first group are all very similiar, conform fairly well to a Oauth Redirect login flow and require a `client_id` and `client_secret` (except Steam the only one-off in this group).  The second group are all very different.

- Oauth IdPs: Epic, Google, Sony, Steam, Twitch, Xbox
- Others: Apple, External JWT, Facebook, HYPR, LinkedIn, OpenId, Saml V2

For the Oauth group they each have an "Overview" and then include the following tree (only the first 2 levels are listed, there are other, but you will find them as you go) of `adoc` files:

- _oauth-idp-operations.adoc
  - _oauth-idp-request-body.adoc
  - _oauth-idp-response-body.adoc
  - _identity-provider-login-request-body.adoc
  - _identity-provider-login-response-body.adoc
    
Before including the `_oauth-idp-operations.adoc` all the needed `idp_` attributes are defined and they carry through into all the sub-includes.

For the "others" group the basic structure of the `_oauth-idp-operations.adoc` is defined in the top level `adoc` (e.g. `apple.adoc`) and then IdP specific request and response `adoc` files are included.  For example:
- apple.adoc
  - _apple-request-body.adoc
  - _apple-response-body.adoc
  - _identity-provider-login-request-body.adoc
  - _identity-provider-login-response-body.adoc
    
To remain backwards compatible the `_identity-provider-login-request-body.adoc` file looks at attributes coming from both groups.  The second group of "other" IdPs passes the IdP type in as {loginProvider} if this attribute is not defined then we assume it's included from one of the "oauth" IdPs and will pickup on the `idp_type` or other `ipd_` attributes to adjust the page for those IdPs.

### Available Since

This is the only attribute `idp_since` that is set for every IdP.  Since it is used various places it is set before any includes and unset at the bottom of the `adoc` file.
