const jose = require('jose');

function hasRole(roles) {
  return (req, res, next) => {
    const decodedToken = jose.decodeJwt(req.verifiedToken);
    if (roles.some((role) => decodedToken.roles.includes(role))) return next();
    res.status(403);
    res.send({ error: `You do not have a role with permissions to do this.` });
  }
}

module.exports = hasRole;
