import test from 'node:test';
import assert from 'node:assert/strict';

import { prefixSpaces, selectTagged } from './remoteCodeUtils.ts';

test('prefixSpaces counts only leading whitespace', () => {
  assert.equal(prefixSpaces('class Example:'), 0);
  assert.equal(prefixSpaces('  class Example:'), 2);
  assert.equal(prefixSpaces('\tclass Example:'), 1);
});

test('selectTagged does not trim first character when line has internal spaces', () => {
  const source = [
    '# tag::token-verifier',
    'class FusionAuthTokenVerifier(TokenVerifier):',
    '    """Verifies tokens using the FusionAuth JWT validation endpoint."""',
    '',
    '    def __init__(',
    '# end::token-verifier',
  ].join('\n');

  const selected = selectTagged(source, 'token-verifier');

  assert.equal(selected.startsWith('class FusionAuthTokenVerifier(TokenVerifier):'), true);
  assert.equal(selected.includes('\nlass FusionAuthTokenVerifier(TokenVerifier):'), false);
});
