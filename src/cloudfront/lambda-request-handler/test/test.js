//import {test} from "node:test";
//import assert from "node:assert/strict";
//import handler from '../src/fusionauth-website-lambda-request-handler.js';
const { test} = require("node:test");
const assert = require("node:assert/strict");
const { handler } = require('../src/fusionauth-website-lambda-request-handler.js');

// fix this hack
let callbackResult;

const mockCallback = (unknown, result) => { callbackResult = result; }

const runTest = (pathToTest, expectedResult) => {
  handler(makeRequest(pathToTest), null, mockCallback);

  assert.deepStrictEqual(callbackResult, expectedResult);
}

const testPath = (path) => {
  return handler(makeRequest(path));
}

const makeRequest = (path) => {
  return { Records: [ { cf: { request: {headers: [], uri: path}}}]};
}

const makeRedirect = (path) => {
  return {status: 301, statusDescription: 'Moved', headers: {'location': [{key: "Location", value: path}]}};
};

const makePassThroughRequest = (path) => {
  return {headers: [], uri: path};
};

test('html suffix', (t) => {
  runTest('/something.html', makeRedirect('/something'));
});

test('docs home', (t) => {
  runTest('/docs', makeRedirect('/docs/'));
  runTest('/docs/', makePassThroughRequest('/docs/index.html'));
});

test('docs redirects', (t) => {
  runTest('/cognito/', makeRedirect('/cognito'));
  runTest('/cognito', makeRedirect('/docs/lifecycle/migrate-users/bulk/cognito'));
  runTest('/docs/v1/tech/installation-guide/configuration-management', makeRedirect('/docs/operate/deploy/configuration-management'));
  runTest('/features/advanced-registration-forms', makeRedirect('/platform/registration-forms'));

  runTest('/docs/v1/tech/common-errors', makeRedirect('/docs/operate/troubleshooting/troubleshooting'));
  runTest('/docs/v1/tech/admin-guide/troubleshooting', makeRedirect('/docs/operate/troubleshooting/troubleshooting'));
  runTest('/docs/v1/tech/reactor/', makeRedirect('/docs/v1/tech/reactor'));
  runTest('/docs/v1/tech/identity-providers/', makeRedirect('/docs/lifecycle/authenticate-users/identity-providers/'));
});

test('blog', (t) => {
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

test('articles', (t) => {
  runTest('/learn/expert-advice/', makeRedirect('/articles/'));
  runTest('/learn/expert-advice/tokens/jwt-authentication-token-components-explained', makeRedirect('/articles/tokens/jwt-components-explained'));
  runTest('/products/identity-user-management/ciam-vs-iam', makeRedirect('/articles/ciam/ciam-vs-iam'));
});

test('dev-tools', (t) => {

  runTest('/dev-tools/jwt-debugger', makeRedirect('/dev-tools/jwt-decoder'));
  runTest('/learn/expert-advice/dev-tools/this/should-be-a-prefix-replacement', makeRedirect('/dev-tools/this/should-be-a-prefix-replacement'));
});
