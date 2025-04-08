## Developer Notes

### Structure

There are two groups of Identity Providers.  The first group are all very similar, conform fairly well to a OAuth Redirect login flow and require a `client_id` and `client_secret` (except Steam, the only one-off in this group).  The second group are all very different from the first group and each other.

- OAuth IdPs: Epic, Google, Sony, Steam, Twitch, Xbox
- Others: Apple, External JWT, Facebook, HYPR, LinkedIn, OpenId, SAML V2

For the OAuth group they each have an "Overview" and then include the following tree (only the first 2 levels are listed, there are other, but you will find them as you go) of `adoc` files:

- _oauth-idp-operations.mdx
  - _oauth-idp-request-body.mdx
  - _oauth-idp-response-body.mdx
  - _identity-provider-login-request-body.mdx
  - _identity-provider-login-response-body.mdx
    
Before including the `_oauth-idp-operations.mdx` all the needed `idp_` attributes are defined and they carry through into all the sub-includes.

For the "others" group the basic structure of the `_oauth-idp-operations.mdx` is defined in the top level `mdx` (e.g. `apple.mdx`) and then IdP specific request and response `mdx` files are included.

For example:
- apple.mdx
  - _apple-request-body.mdx
  - _apple-response-body.mdx
  - _identity-provider-login-request-body.mdx
  - _identity-provider-login-response-body.mdx

However, you must define `idp_display_name` for these providers.
    
### Available Since

This is the only attribute `idp_since` that is set for every IdP.  Since it is used various places it is set before any includes and unset at the bottom of the `mdx` file.

### Token Storage

Each Identity Provider stores a token at the end of the authentication process. This is often a refresh token, but may vary. See `_token-storage-note.mdx` for more details about this.
