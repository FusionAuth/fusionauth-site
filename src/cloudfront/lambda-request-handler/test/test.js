import { test } from "node:test";
import assert from "node:assert/strict";
import handler from '../src/fusionauth-website-lambda-request-handler.js';

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
  // /blog
  // /blog/category/tutorial
  // /blog/category/tutorial/
  // /blog/digitalocean-oneclick-installation
  // /blog/author/dean-rodman
  // /blog/author/dean-rodman/
  // /blog/tag/wordpress
  // /blog/tag/wordpress/
});

test('articles', (t) => {
});

test('dev-tools', (t) => {
});