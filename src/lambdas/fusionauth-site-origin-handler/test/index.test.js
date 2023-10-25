import assert from 'node:assert/strict';
import { handler } from '../src/index.js';

let event, result;

const mockEvent = (path) => {
  return { Records: [{ cf: { request: { headers: {}, uri: path }}}]}
}

const makeRedirect = (path) => {
  return { status: 301, statusDescription: 'Moved', headers: {'location': [{ key: "Location", value: path }]}};
}
const makePassThroughRequest = (path) => {
  return { headers: {}, uri: path };
};

describe('html extension', function() {
  it('/something.html', async function() {
    result = await handler(mockEvent('/something.html'), null)
    assert.deepEqual(result, makeRedirect('/something'));
  });
});

describe('docs root', function() {
  it('/docs', async function() {
    result = await handler(mockEvent('/docs'), null)
    assert.deepEqual(result, makeRedirect('/docs/'))
  });
  it('/docs/', async function() {
    result = await handler(mockEvent('/docs/'), null)
    assert.deepEqual(result, makePassThroughRequest('/docs/index.html'))
  });
});

describe('docs redirects', function() {
  it('/cognito', async function() {
    result = await handler(mockEvent('/cognito/'), null)
    assert.deepEqual(result, makeRedirect('/cognito'))
  });
  it('/cognito', async function() {
    result = await handler(mockEvent('/cognito'), null)
    assert.deepEqual(result, makeRedirect('/docs/lifecycle/migrate-users/bulk/cognito'))
  });

  it('/docs/v1/tech/installation-guide/configuration-management', async function() {
    result = await handler(mockEvent('/docs/v1/tech/installation-guide/configuration-management'), null)
    assert.deepEqual(result, makeRedirect('/docs/operate/deploy/configuration-management'))
  });
  it('/features/advanced-registration-forms', async function() {
    result = await handler(mockEvent('/features/advanced-registration-forms'), null)
    assert.deepEqual(result, makeRedirect('/platform/registration-forms'))
  });
  it('/docs/v1/tech/common-errors', async function() {
    result = await handler(mockEvent('/docs/v1/tech/common-errors'), null)
    assert.deepEqual(result, makeRedirect('/docs/operate/troubleshooting/troubleshooting'))
  });
  it('/docs/v1/tech/admin-guide/troubleshooting', async function() {
    result = await handler(mockEvent('/docs/v1/tech/admin-guide/troubleshooting'), null)
    assert.deepEqual(result, makeRedirect('/docs/operate/troubleshooting/troubleshooting'))
  });
  it('/docs/v1/tech/reactor/', async function() {
    result = await handler(mockEvent('/docs/v1/tech/reactor/'), null)
    assert.deepEqual(result, makeRedirect('/docs/v1/tech/reactor'))
  });
})

describe('blog', function() {
  it('/blog', async function() {
    result = await handler(mockEvent('/blog'), null)
    assert.deepEqual(result, makeRedirect('/blog/'))
  });
  it('/blog/category/tutorial', async function() {
    result = await handler(mockEvent('/blog/category/tutorial'), null)
    assert.deepEqual(result, makeRedirect('/blog/category/tutorial/'))
  });
  it('/blog/category/tutorial/', async function() {
    result = await handler(mockEvent('/blog/category/tutorial/'), null)
    assert.deepEqual(result, makePassThroughRequest('/blog/category/tutorial/index.html'))
  });
  it('/blog/author/', async function() {
    result = await handler(mockEvent('/blog/author/'), null)
    assert.deepEqual(result, makeRedirect('/blog/author'))
  });
  it('/blog/author/dean-rodman', async function() {
    result = await handler(mockEvent('/blog/author/dean-rodman'), null)
    assert.deepEqual(result, makeRedirect('/blog/author/dean-rodman/'))
  });
  it('/blog/author/dean-rodman/', async function() {
    result = await handler(mockEvent('/blog/author/dean-rodman/'), null)
    assert.deepEqual(result, makePassThroughRequest('/blog/author/dean-rodman/index.html'))
  });
  it('/blog/tag/wordpress', async function() {
    result = await handler(mockEvent('/blog/tag/wordpress'), null)
    assert.deepEqual(result, makeRedirect('/blog/tag/wordpress/'))
  });
  it('/blog/tag/wordpress/', async function() {
    result = await handler(mockEvent('/blog/tag/wordpress/'), null)
    assert.deepEqual(result, makePassThroughRequest('/blog/tag/wordpress/index.html'))
  });
  it('/blog/digitalocean-oneclick-installation/', async function() {
    result = await handler(mockEvent('/blog/digitalocean-oneclick-installation/'), null)
    assert.deepEqual(result, makeRedirect('/blog/digitalocean-oneclick-installation'))
  });
  it('/blog/digitalocean-oneclick-installation', async function() {
    result = await handler(mockEvent('/blog/digitalocean-oneclick-installation'), null)
    assert.deepEqual(result, makePassThroughRequest('/blog/digitalocean-oneclick-installation.html'))
  });
});


describe('articles', function() {
  it('/learn/expert-advice/', async function() {
    result = await handler(mockEvent('/learn/expert-advice/'), null)
    assert.deepEqual(result, makeRedirect('/articles/'))
  });
  it('/learn/expert-advice/tokens/jwt-authentication-token-components-explained', async function() {
    result = await handler(mockEvent('/learn/expert-advice/tokens/jwt-authentication-token-components-explained'), null)
    assert.deepEqual(result, makeRedirect('/articles/tokens/jwt-components-explained'))
  });
  it('/products/identity-user-management/ciam-vs-iam', async function() {
    result = await handler(mockEvent('/products/identity-user-management/ciam-vs-iam'), null)
    assert.deepEqual(result, makeRedirect('/articles/ciam/ciam-vs-iam'))
  });
});

describe('dev-tools', function() {
  it('/dev-tools/jwt-debugger', async function() {
    result = await handler(mockEvent('/dev-tools/jwt-debugger'), null)
    assert.deepEqual(result, makeRedirect('/dev-tools/jwt-decoder'))
  });
  it('/learn/expert-advice/dev-tools/this/should-be-a-prefix-replacement', async function() {
    result = await handler(mockEvent('/learn/expert-advice/dev-tools/this/should-be-a-prefix-replacement'), null)
    assert.deepEqual(result, makeRedirect('/dev-tools/this/should-be-a-prefix-replacement'))
  });
});
