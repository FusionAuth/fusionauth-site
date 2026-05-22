// :remove-start:
/* eslint-disable no-unused-vars */
// :remove-end:
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
