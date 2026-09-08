const client = require("@fusionauth/typescript-client");
const jwt = require("jsonwebtoken");

async function login(userEmail, applicationId, fusionUrl, userPassword) {
  try {
    const request = {
      applicationId: applicationId,
      loginId: userEmail,
      password: userPassword,
    };
    const fusion = new client.FusionAuthClient("lambda_testing_key", fusionUrl);
    const clientResponse = await fusion.login(request);
    if (!clientResponse.wasSuccessful) throw Error(clientResponse);
    const jwtToken = clientResponse.response.token;
    const decodedToken = jwt.decode(jwtToken);
    const message = decodedToken.message;
    return message;
  } catch (e) {
    console.error("Error: ");
    console.dir(e, { depth: null });
    process.exit(1);
  }
}

module.exports = {
  login,
};
