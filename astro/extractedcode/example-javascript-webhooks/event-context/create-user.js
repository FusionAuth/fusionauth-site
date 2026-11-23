const crypto = require('crypto');

const fusionAuthURL = process.env.FUSIONAUTH_URL || 'http://localhost:9011';
const apiKey = process.env.FUSIONAUTH_API_KEY || '33052c8a-c283-4e96-9d2a-eb1215c69f8f';

async function createUser() {
  const traceId = crypto.randomUUID();
  // :snippet-start: sendcontext
  const response = await fetch(`${fusionAuthURL}/api/user`, {
    method: 'POST',
    headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: { email: `user-${traceId}@example.com`, password: 'password' },
      eventInfo: {
        data: { traceId, requestedBy: 'billing-service' }
      }
    })
  });
  // :snippet-end:
  if (!response.ok) {
    throw new Error(`user create failed with status ${response.status}: ${await response.text()}`);
  }
  console.log(`created user with traceId ${traceId}`);
}

createUser().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
