var express = require('express');
var router = express.Router();
const { ensureLoggedIn } = require('connect-ensure-login');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/login');
  }
  else {

    // Make a list of companies the user has access to, with id and name
    const user = req.user;
    const companies = user.grants.map(grant => {
      return {id: grant.id, name: grant.entity.name};
    });

    res.render('index', { 
      title: 'AwesomeCRM - Companies', 
      user: user.user, 
      companies: companies, 
      company: req.session.selectedGrant.entity.name,
      companyId: req.session.selectedGrant.entity.id,
      logoutURL: req.logoutURL,
      selectedGrant: req.session.selectedGrant
    });
  }
});


// :snippet-start: companyPost
router.post('/company', ensureLoggedIn('/login'), function(req, res, next) {
  const grantId = req.body.grantId;
  // find the corresponding grant: 
  let selectedGrant = req.user.grants.find(grant=> grant.id === grantId)
  req.session.selectedGrant = selectedGrant; 
  console.log(`Selected company: ${grantId} - ${selectedGrant.entity.name}`);
  return res.redirect('/');
});
// :snippet-end:


module.exports = router;
