In this article, you are going to learn how to integrate a {{page.technology}} API with FusionAuth. This presupposes you've built an application that is going to retrieve an access token from FusionAuth via one of the OAuth grants. The grant will typically be the Authorization Code grant for users or the Client Credentials grant for programmatic access.

The token provided by FusionAuth can be stored by the client in a number of locations. For server side applications, it can be stored in a database or on the file system. In mobile applications, store them securely as files accessible only to your app. For a browser application like a SPA, use a [cookie if possible and server-side sessions if not](/learn/expert-advice/oauth/oauth-token-storage).

Here’s a typical API request flow before integrating FusionAuth with your {{page.technology}} API.

{% plantuml source: _diagrams/docs/api-before.plantuml, alt: "API access before FusionAuth." %}

Here’s the same API request flow when FusionAuth is introduced.

{% plantuml source: _diagrams/docs/api-after.plantuml, alt: "API access with FusionAuth." %}

This document will walk through the use case where a {{page.technology}} API validates the token. You can also use an API gateway to verify claims and signatures. For more information on doing that with FusionAuth, visit the [API gateway documentation](/docs/v1/tech/developer-guide/api-gateways/).
