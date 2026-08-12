const client = require("@fusionauth/typescript-client");
const { v4: uuidv4 } = require("uuid");

createRandomUser(uuidv4());

async function createRandomUser(
  userUUID,
  applicationId = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e",
  fusionUrl = "http://localhost:9011",
  userPassword = "password"
) {
  try {
    const randomEmail = new Date().getTime() + "@example.com";
    const username = "lambdatestuser" + new Date().getTime();
    const request = {
      registration: {
        applicationId: applicationId,
        username: username,
      },
      sendSetPasswordEmail: false,
      skipRegistrationVerification: true,
      skipVerification: true,
      user: {
        active: true,
        email: randomEmail,
        password: userPassword,
        username: username,
        registrations: [
          {
            applicationId: applicationId,
          },
        ],
      },
    };
    const fusion = new client.FusionAuthClient("lambda_testing_key", fusionUrl);
    const clientResponse = await fusion.register(userUUID, request);
    if (!clientResponse.wasSuccessful) throw Error(clientResponse);
    console.info(`User ${userUUID} created successfully`);
    return randomEmail;
  } catch (e) {
    console.error("Error creating user: ");
    console.dir(e, { depth: null });
    process.exit(1);
  }
}

async function deleteUser(userUUID, fusionUrl) {
  try {
    const fusion = new client.FusionAuthClient("lambda_testing_key", fusionUrl);
    const clientResponse = await fusion.deleteUser(userUUID);
    if (!clientResponse.wasSuccessful) throw Error(clientResponse);
    console.info(`User ${userUUID} deleted successfully`);
  } catch (e) {
    console.error(`Error deleting user ${userUUID}: `);
    console.dir(e, { depth: null });
    process.exit(1);
  }
}

module.exports = {
  createRandomUser,
  deleteUser,
};
