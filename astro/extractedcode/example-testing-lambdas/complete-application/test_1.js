const test = require("tape");
const { login } = require("./userLogin.js");

const applicationId = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e";
const fusionUrl = "http://localhost:9011";

test("the access token has the claims from the uploaded lambda", async function (t) {
  const claims = await login("richard@example.com", "password", applicationId, fusionUrl);
  t.equal(claims.message, "Goodbye World!");
  t.deepEqual(claims.permissions, ["read", "write"]);
});
