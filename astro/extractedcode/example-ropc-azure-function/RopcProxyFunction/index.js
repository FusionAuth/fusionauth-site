const graph = require("./graph");
require("isomorphic-fetch");
const querystring = require("querystring");
const jwt = require("jsonwebtoken");

module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");
  const tenantName = process.env.TENANT_NAME;
  const tenantId = process.env.TENANT_ID;
  const ropcFlow = process.env.ROPC_FLOW_NAME;

  const tokenUrl = `https://${tenantName}.b2clogin.com/${tenantName}.onmicrosoft.com/${ropcFlow}/oauth2/v2.0/token`;
  const tokenRequest = {
    username: req.body.loginId,
    password: req.body.password,
    grant_type: "password",
    scope: `openid ${process.env.ROPC_CLIENT_ID}`,
    client_id: process.env.ROPC_CLIENT_ID,
    response_type: "token",
  };

  let tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    body: querystring.stringify(tokenRequest),
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
  });

  if (tokenResponse.ok) {
    let body = await tokenResponse.json();
    const decodedToken = jwt.decode(body.access_token);
    let user = await graph.getUser(decodedToken.oid);
    let fusionUser = transformToFusionUserObject(user);
    context.res = {
      status: 200,
      body: {user: fusionUser},
    };
  } else {
    // Something not great with username
    context.res = {
      status: 404,
      body: await tokenResponse.text(),
    };
  }

  context.log(JSON.stringify(context.res));
};

function transformToFusionUserObject(azureUser) {
  let localIdentity = azureUser.identities.find(i=>i.signInType==="emailAddress"); //{|i|i["signInType"]==="emailAddress"}
  let epochTime = new Date(azureUser.createdDateTime);
  epochTime = epochTime.getTime()/1000;
  let fusionUser = {
    id: azureUser.id,
    active: azureUser.accountEnabled,
    firstName: azureUser.givenName,
    fullName: azureUser.displayName,
    lastName: azureUser.surname,
    username: azureUser.userPrincipalName,
    email: localIdentity.issuerAssignedId,
    verified: true,
    insertInstant: epochTime,
    data :{
        azure:{
            identities: azureUser.identities
        }
    }
  }
  return fusionUser;
}
