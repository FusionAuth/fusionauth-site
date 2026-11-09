const client = require("@fusionauth/typescript-client");
const jwt = require("jsonwebtoken");

async function login(loginId, password, applicationId, fusionUrl) {
  const fusion = new client.FusionAuthClient("lambda_testing_key", fusionUrl);
  // the client library rejects with the response when the login fails
  const clientResponse = await fusion.login({ applicationId, loginId, password });
  return jwt.decode(clientResponse.response.token);
}

module.exports = {
  login,
};
