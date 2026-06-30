// :snippet-start: buffer-to-base64url
function bufferToBase64URL(buffer) {
  const bytes = new Uint8Array(buffer);
  let string = '';
  bytes.forEach(b => string += String.fromCharCode(b));

  const base64 = btoa(string);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
// :snippet-end:

module.exports = { bufferToBase64URL }; // :remove:
