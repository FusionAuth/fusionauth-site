## Developer Notes

### Structure

There are two groups of Identity Providers.  The first group are all very similar, conform fairly well to a OAuth Redirect login flow, and require a `client_id` and `client_secret` (except Steam, the only one-off in this group). The second group are all distinct.

- OAuth IdPs: Epic, Google, Sony, Steam, Twitch, Xbox
- Others: Apple, External JWT, Facebook, HYPR, LinkedIn, OpenId, SAML V2

Every IdP page holds its own headings and operations (Create, Retrieve, Update, Delete, and Complete Login), and includes partials for the request and response bodies. Partials don't contain headings.

The OAuth group pages (for example, `steam.mdx`) include:

- _oauth-idp-request-body.mdx
- _oauth-idp-response-body.mdx
- _identity-provider-login-request-body.mdx
- _identity-provider-login-response-codes.mdx
- _identity-provider-login-response-cookies.mdx

The "others" group pages include IdP-specific partials instead. For example, `apple.mdx` includes:

- _apple-request-body.mdx
- _apple-response-body.mdx
- _identity-provider-login-request-body.mdx
- _identity-provider-login-response-codes.mdx
- _identity-provider-login-response-cookies.mdx

However, you must define `idp_display_name` for these providers.
    
### Available Since

This is the only attribute `idp_since` that is set for every IdP.  Since it is used various places it is set before any includes and unset at the bottom of the `mdx` file.

### Token Storage

Each Identity Provider stores a token at the end of the authentication process. This is often a refresh token, but may vary. See `_token-storage-note.mdx` for more details about this.
