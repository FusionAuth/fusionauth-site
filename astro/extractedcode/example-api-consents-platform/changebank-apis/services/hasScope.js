const jose = require('jose');

// :snippet-start: hasScope
function hasScope(scope) {
  return (req, res, next) => {
    const decodedToken = jose.decodeJwt(req.verifiedToken);
    let scopes = []
    if (decodedToken.scope) {
      // need to check array, not string, to avoid partial matches
      scopes = decodedToken.scope.split(" ");
    }
    if (scopes.includes(scope)) return next();
    res.status(403);
    res.send({ error: `You do not have permissions to do this.` });
  }
}
// :snippet-end:

module.exports = hasScope;
