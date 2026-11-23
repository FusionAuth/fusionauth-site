const crypto = require('crypto');
const express = require('express');

const port = process.env.PORT || 3030;
// must match the Authorization header configured on the FusionAuth webhook
const webhookSecret = process.env.WEBHOOK_SECRET || 'a3c1f0e2b9d84c7e8f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c';

const app = express();
app.use(express.json());

// :snippet-start: readcontext
function isFromFusionAuth(req) {
  const received = Buffer.from(req.header('Authorization') || '');
  const expected = Buffer.from(webhookSecret);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

app.post('/webhook', (req, res) => {
  // reject requests without the shared secret, so no one else can send fake events
  if (!isFromFusionAuth(req)) {
    res.sendStatus(401);
    return;
  }
  const event = req.body.event;
  // eventInfo.data from the API request arrives as event.info.data
  const context = event.info?.data || {};
  console.log(`received ${event.type} with traceId ${context.traceId} from ${context.requestedBy}`);
  res.sendStatus(200);
});
// :snippet-end:

app.listen(port, () => {
  console.log(`webhook listener running on port ${port}`);
});
