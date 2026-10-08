const msalConfig = {
    auth: {
        clientId: process.env.GRAPH_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.TENANT_NAME}.onmicrosoft.com`,
        clientSecret: process.env.GRAPH_CLIENT_SECRET,
   } 
};

// With client credentials flows permissions need to be granted in the portal by a tenant administrator. 
// The scope is always in the format '<resource>/.default'.
const tokenRequest = {
    scopes: [ 'https://graph.microsoft.com/.default' ],
};

module.exports = {
    msalConfig: msalConfig,
    tokenRequest: tokenRequest
};
