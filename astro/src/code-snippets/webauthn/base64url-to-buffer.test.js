// :snippet-start: base64url-to-buffer
// :state-start: published
function base64URLToBuffer(base64URL) {
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  return Uint8Array.from(atob(base64.padEnd(base64.length + padLen, '=')), c => c.charCodeAt(0));
}
// :state-end:
// :snippet-end:

// :remove-start:
describe('base64URLToBuffer', () => {
  test('decodes a base64url string to the correct bytes', () => {
    // "Hello World" in base64url is SGVsbG8gV29ybGQ
    const result = base64URLToBuffer('SGVsbG8gV29ybGQ');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
  });

  test('handles single-byte input', () => {
    // "a" is 0x61 = 97; base64url of [97] is "YQ"
    const result = base64URLToBuffer('YQ');
    expect(Array.from(result)).toEqual([97]);
  });

});
// :remove-end:
