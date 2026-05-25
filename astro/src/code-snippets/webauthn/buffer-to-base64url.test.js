// :snippet-start: buffer-to-base64url
// :state-start: published
function bufferToBase64URL(buffer) {
  const bytes = new Uint8Array(buffer);
  let string = '';
  bytes.forEach(b => string += String.fromCharCode(b));

  const base64 = btoa(string);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
// :state-end:
// :snippet-end:

// :remove-start:
function base64URLToBuffer(base64URL) {
  const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (base64.length % 4)) % 4;
  return Uint8Array.from(atob(base64.padEnd(base64.length + padLen, '=')), c => c.charCodeAt(0));
}

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
    // Find input that produces + or / in standard base64
    // 0xFB = 251 produces + in standard base64 (0xFB >> 2 = 0x3E = 62 = '+')
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
// :remove-end:
