const test = require("tape");
const { FusionAuthClient } = require("@fusionauth/typescript-client");

test("test lambda rejects returns permissions based on role", async function (t) {
  t.plan(3);
  const lambda = await getLambda();
  eval(lambda); // creates a function called populate()

  const jwt1 = {};
  await populate(jwt1, { registrations: [{ roles: ["admin", "viewer"] }] }, {});
  t.true(
    jwt1.permissions.includes("all"),
    "Check admin and viewer has all permissions"
  );

  const jwt2 = {};
  await populate(jwt2, { registrations: [{ roles: ["editor"] }] }, {});
  t.true(
    jwt2.permissions.includes("write"),
    "Check editor has write permission"
  );
  t.true(jwt2.permissions.includes("read"), "Check editor has read permission");

  t.end();
});

async function getLambda() {
  const lambdaId = "f3b3b547-7754-452d-8729-21b50d111505";
  const apiKey = "lambda_testing_key";
  const host = "http://localhost:9011";
  const fusionAuthClient = new FusionAuthClient(apiKey, host);
  const clientResponse = await fusionAuthClient.retrieveLambda(lambdaId);
  return clientResponse.response.lambda.body;
}
