import {test} from "node:test";
import assert from "node:assert/strict";
import handler from '../src/fusionauth-website-lambda-request-handler.js';

const testPath = (path) => {
  return handler(makeRequest(path));
}
const makeRequest = (path) => {
  return {request: {headers: [], uri: path}};
}

const makeRedirect = (path) => {
  return {statusCode: 301, statusDescription: 'Moved', headers: {'location': {value: path}}};
};

const makePassThroughRequest = (path) => {
  return {headers: [], uri: path};
};

test('html suffix', (t) => {
  assert.deepEqual(handler(makeRequest('/something.html')), makeRedirect('/something'));
});

test('docs home', (t) => {
  assert.deepStrictEqual(handler(makeRequest('/docs')), makeRedirect('/docs/'));
  assert.deepStrictEqual(handler(makeRequest('/docs/')), makePassThroughRequest('/docs/index.html'));
});

test('docs redirects', (t) => {
  assert.deepStrictEqual(handler(makeRequest('/cognito/')), makeRedirect('/cognito'));
  assert.deepStrictEqual(handler(makeRequest('/cognito')), makeRedirect('/docs/lifecycle/migrate-users/bulk/cognito'));
  assert.deepStrictEqual(handler(makeRequest('/docs/v1/tech/installation-guide/configuration-management')), makeRedirect('/docs/operate/deploy/configuration-management'));
  assert.deepStrictEqual(handler(makeRequest('/features/advanced-registration-forms')), makeRedirect('/platform/registration-forms'));

  assert.deepStrictEqual(handler(makeRequest('/docs/v1/tech/common-errors')), makeRedirect('/docs/operate/troubleshooting/troubleshooting'));
  assert.deepStrictEqual(handler(makeRequest('/docs/v1/tech/admin-guide/troubleshooting')), makeRedirect('/docs/operate/troubleshooting/troubleshooting'));
  assert.deepStrictEqual(handler(makeRequest('/docs/v1/tech/reactor/')), makeRedirect('/docs/v1/tech/reactor'));
});

test('blog', (t) => {
  assert.deepStrictEqual(testPath('/blog'), makeRedirect('/blog/'));
  assert.deepStrictEqual(testPath('/blog/category/tutorial'), makeRedirect('/blog/category/tutorial/'));
  assert.deepStrictEqual(testPath('/blog/category/tutorial/'), makePassThroughRequest('/blog/category/tutorial/index.html'));
  assert.deepStrictEqual(testPath('/blog/author/'), makeRedirect('/blog/author'));
  assert.deepStrictEqual(testPath('/blog/author/dean-rodman'), makeRedirect('/blog/author/dean-rodman/'));
  assert.deepStrictEqual(testPath('/blog/author/dean-rodman/'), makePassThroughRequest('/blog/author/dean-rodman/index.html'));
  assert.deepStrictEqual(testPath('/blog/tag/wordpress'), makeRedirect('/blog/tag/wordpress/'));
  assert.deepStrictEqual(testPath('/blog/tag/wordpress/'), makePassThroughRequest('/blog/tag/wordpress/index.html'));
  assert.deepStrictEqual(testPath('/blog/digitalocean-oneclick-installation/'), makeRedirect('/blog/digitalocean-oneclick-installation'));
  assert.deepStrictEqual(testPath('/blog/digitalocean-oneclick-installation'), makePassThroughRequest('/blog/digitalocean-oneclick-installation.html'));
});

test('articles', (t) => {
  assert.deepStrictEqual(testPath('/learn/expert-advice/'), makeRedirect('/articles/'));
  assert.deepStrictEqual(testPath('/learn/expert-advice/tokens/jwt-authentication-token-components-explained'), makeRedirect('/articles/tokens/jwt-components-explained'));
  assert.deepStrictEqual(testPath('/products/identity-user-management/ciam-vs-iam'), makeRedirect('/articles/ciam/ciam-vs-iam'));
});

test('dev-tools', (t) => {

  assert.deepStrictEqual(testPath('/dev-tools/jwt-debugger'), makeRedirect('/dev-tools/jwt-decoder'));
  assert.deepStrictEqual(testPath('/learn/expert-advice/dev-tools/this/should-be-a-prefix-replacement'), makeRedirect('/dev-tools/this/should-be-a-prefix-replacement'));
});