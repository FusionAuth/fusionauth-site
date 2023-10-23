import { test } from "node:test";
import assert from "node:assert/strict";
import handler from '../src/fusionauth-website-lambda-request-handler.js';

const testPath = (path) => {
  return handler(makeRequest(path));
}
const makeRequest = (path) => {
  return { request: { headers: [], uri: path}};
}

const makeRedirect = (path) => {
  return { statusCode: 301, statusDescription: 'Moved', headers: { 'location': { value: path}}};
};

const makePassThroughRequest = (path) => {
  return { headers: [], uri: path };
};

test('html suffix', (t) => {
  assert.deepEqual(handler(makeRequest('/something.html')), makeRedirect('/something'));
});

test('docs home', (t) => {
  assert.deepStrictEqual(handler(makeRequest('/docs')), makeRedirect('/docs/'));
  assert.deepStrictEqual(handler(makeRequest('/docs/')), makePassThroughRequest('/docs/index.html'));
});

test('docs redirects', (t) => {
});

test('blog', (t) => {
 assert.deepStrictEqual(testPath('/blog'), makeRedirect('/blog/'));
  // /blog/category -> not found
  assert.deepStrictEqual(testPath('/blog/category/tutorial'), makeRedirect('/blog/category/tutorial/'));
  assert.deepStrictEqual(testPath('/blog/category/tutorial/'), makePassThroughRequest('/blog/category/tutorial/index.html'));
  assert.deepStrictEqual(testPath('/blog/digitalocean-oneclick-installation/'), makeRedirect('/blog/digitalocean-oneclick-installation'));
  assert.deepStrictEqual(testPath('/blog/digitalocean-oneclick-installation'), makePassThroughRequest('/blog/digitalocean-oneclick-installation.html'));
  assert.deepStrictEqual(testPath('/blog/author/'), makeRedirect('/blog/author'));
  // /blog/author -> not found
  assert.deepStrictEqual(testPath('/blog/author/dean-rodman'), makeRedirect('/blog/author/dean-rodman/'));
  assert.deepStrictEqual(testPath('/blog/author/dean-rodman/'), makePassThroughRequest('/blog/author/dean-rodman/index.html'));
  // /blog/tag/wordpress
  // /blog/tag/wordpress
  // /blog/tag/wordpress/
});

test('articles', (t) => {
});

test('dev-tools', (t) => {
});