const test = require("tape");
const { v4: uuidv4 } = require("uuid");
const {createRandomUser, deleteUser} = require("./userCreator.js");
const {login} = require("./userLogin");

const applicationId = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e";
const fusionUrl = "http://localhost:9011";
const userPassword = "password";

test('test login returns JWT with "Goodbye World"', async function (t) {
  t.plan(1);
  const userId = uuidv4();
  const email = await createRandomUser(userId, applicationId, fusionUrl, userPassword);
  try {
    const result = await login(email, applicationId, fusionUrl, userPassword);
    t.ok(result.toLowerCase().includes("goodbye world"));
    t.end();
  } finally {
    await deleteUser(userId, fusionUrl);
  }
});