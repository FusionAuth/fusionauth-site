const { base64URLToBuffer } = require('./base64url-to-buffer');

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
