// creates an email address from the sub claim when the identity provider sends no email
function reconcile(user, registration, jwt, id_token, tokens, context) {
  var email = jwt.email || (id_token && id_token.email);
  if (!email) {
    // use a domain you control
    user.email = jwt.sub + '@no-email-present.example.com';
  }
}
