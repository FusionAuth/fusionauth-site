const { base64URLToBuffer } = require('./base64url-to-buffer');
const { bufferToBase64URL } = require('./buffer-to-base64url');

describe('bufferToBase64URL', () => {
  test('encodes bytes to a base64url string', () => {
    // "Hello World" = [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]
    const input = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
    expect(bufferToBase64URL(input)).toBe('SGVsbG8gV29ybGQ');
  });

  test('produces no padding characters', () => {
    const result = bufferToBase64URL(new Uint8Array([1, 2, 3]));
    expect(result).not.toMatch(/=/);
  });

  test('replaces + with - and / with _', () => {
    const result = bufferToBase64URL(new Uint8Array([0xfb, 0xff]));
    expect(result).not.toMatch(/[+/]/);
  });

  test('round-trips with base64URLToBuffer', () => {
    const original = new Uint8Array([1, 2, 3, 255, 0, 128]);
    const encoded = bufferToBase64URL(original);
    const decoded = base64URLToBuffer(encoded);
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });
});
