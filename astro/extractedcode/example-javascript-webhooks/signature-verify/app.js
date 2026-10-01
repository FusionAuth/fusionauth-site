const bodyParser = require('body-parser');
const express = require("express");
const crypto = require("crypto");
const jose = require("jose");

// configure these
const port = 3030;
const webhookListenerPath = '/webhook';
const fusionauthJwksEndpoint = 'https://local.fusionauth.io/.well-known/jwks.json'

const signatureHeader = 'X-FusionAuth-Signature-JWT'

const app = express();
app.use(bodyParser.json({
  type:'*/*',
  limit: '50mb',
  verify: function(req, res, buf) {
    req.rawBody = buf;
  }
 })
);

const cachedRemoteJWKS = jose.createRemoteJWKSet(new URL(fusionauthJwksEndpoint))

app.post(webhookListenerPath, async function (req, res) {
  console.log("\n req.headers: " + JSON.stringify(req.headers));

  const hashPayload = req.rawBody;
  console.log("\n req.rawBody: " + hashPayload);

  const jwt = Buffer.from(req.get(signatureHeader) || '', 'utf8');

  try {
    const { payload, protectedHeader } = await jose.jwtVerify(jwt, cachedRemoteJWKS);

    const body_sha256 = crypto.createHash('sha256').update(hashPayload).digest('base64');

    // Compare digest signature with signature sent by provider
    if (payload.request_body_sha256 === body_sha256) {
      console.log("Valid signature");
      // Do your webhook event processing here
      res.json({ message: "Success" });
    } else {
      console.log("Invalid signature");
      // skip this event
      res.status(401).send('Unauthorized');
    }
  } catch (err) {
    console.log("Invalid JWT header");
    res.status(401).send('Unauthorized');
  }
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});
