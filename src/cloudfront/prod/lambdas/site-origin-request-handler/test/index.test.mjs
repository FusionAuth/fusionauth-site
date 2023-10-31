import assert from 'node:assert/strict';
import { handler } from '../src/index.mjs';

let result;

// Mock a lambda event that we can pass to the handler.
const mockEvent = (path) => {
  return { 'Records': [{ 'cf': { 'request': { 'headers': {}, 'uri': path }}}]};
};

// Build the expected response for a 301 redirect.
const makeRedirect = (path) => {
  return { 'status': 301, 'statusDescription': 'Moved', 'headers': {'location': [{ 'key': "Location", 'value': path }]}};
};

// Build the expected response for a passthrough.
const makePassThroughRequest = (path) => {
  return { headers: {}, uri: path };
};


// All the tests follow a similar format. We pass the mock event to the
// handler which contains the path we're testing. The handler's real
// response is asserted to be equal to the expected response.
const runTest = (path, expected) => {
  it(path, async function() {
    result = await handler(mockEvent(path), null);
    assert.deepEqual(result, expected);
  });
};

describe('site root', function() {
  runTest('', makeRedirect('/'));
  runTest('/', makePassThroughRequest('/'));
});

describe('html extension', function() {
  runTest('/something.html', makeRedirect('/something'));
});

describe('docs root', function() {
  runTest('/docs', makeRedirect('/docs/'));
  runTest('/docs/', makePassThroughRequest('/docs/index.html'));
});

describe('docs redirects', function() {
  runTest('/cognito/', makeRedirect('/cognito'));
  runTest('/cognito', makeRedirect('/docs/lifecycle/migrate-users/bulk/cognito'));
  runTest('/docs/v1/tech/installation-guide/configuration-management', makeRedirect('/docs/operate/deploy/configuration-management'));
  runTest('/features/advanced-registration-forms', makeRedirect('/platform/registration-forms'));
  runTest('/landing/the-praetorians', makePassThroughRequest('/landing/the-praetorians.html'));
  runTest('/docs/v1/tech/common-errors', makeRedirect('/docs/operate/troubleshooting/troubleshooting'));
  runTest('/docs/v1/tech/admin-guide/troubleshooting', makeRedirect('/docs/operate/troubleshooting/troubleshooting'));
  runTest('/docs/v1/tech/reactor/', makeRedirect('/docs/v1/tech/reactor'));
  runTest('/docs/v1/tech/identity-providers/', makeRedirect('/docs/lifecycle/authenticate-users/identity-providers/'));
});

describe('blog', function() {
  runTest('/blog', makeRedirect('/blog/'));
  runTest('/blog/category/tutorial', makeRedirect('/blog/category/tutorial/'));
  runTest('/blog/category/tutorial/', makePassThroughRequest('/blog/category/tutorial/index.html'));
  runTest('/blog/author/', makeRedirect('/blog/author'));
  runTest('/blog/author/dean-rodman', makeRedirect('/blog/author/dean-rodman/'));
  runTest('/blog/author/dean-rodman/', makePassThroughRequest('/blog/author/dean-rodman/index.html'));
  runTest('/blog/tag/wordpress', makeRedirect('/blog/tag/wordpress/'));
  runTest('/blog/tag/wordpress/', makePassThroughRequest('/blog/tag/wordpress/index.html'));
  runTest('/blog/digitalocean-oneclick-installation/', makeRedirect('/blog/digitalocean-oneclick-installation'));
  runTest('/blog/digitalocean-oneclick-installation', makePassThroughRequest('/blog/digitalocean-oneclick-installation.html'));
});

describe('articles', function() {
  runTest('/learn/expert-advice/', makeRedirect('/articles/'));
  runTest('/learn/expert-advice/tokens/jwt-authentication-token-components-explained', makeRedirect('/articles/tokens/jwt-components-explained'));
  runTest('/products/identity-user-management/ciam-vs-iam', makeRedirect('/articles/ciam/ciam-vs-iam'));
});

describe('dev-tools', function() {
  runTest('/dev-tools/jwt-debugger', makeRedirect('/dev-tools/jwt-decoder'));
  runTest('/learn/expert-advice/dev-tools/this/should-be-a-prefix-replacement', makeRedirect('/dev-tools/this/should-be-a-prefix-replacement'));
});
