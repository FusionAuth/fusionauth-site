const express = require('express');
const router = express.Router();
const checkGrantPermissions = require('../middleware/checkGrantPermissions');
const fs = require('fs');

const billingData = require('../data/billing.json');

router.get('/', checkGrantPermissions(['Admin', 'Billing', 'Viewer']), function (req, res, next) {

    const companyName = req.session.selectedGrant.entity.name;
    const companyId = req.session.selectedGrant.entity.id;
    
    // you would load this from a database probably, and most likely with an ID instead of name. 
    const data = billingData[companyId];

    res.render('billing', {
        title: companyName + ' - Billing',
        data: data, 
        user: req.user.user,
        company: req.session.selectedGrant.entity.name,
        companyId: req.session.selectedGrant.entity.id,
        logoutURL: req.logoutURL,
        selectedGrant: req.session.selectedGrant
    });
});



// :snippet-start: billingPost
router.post('/', checkGrantPermissions(['Admin', 'Billing']), function (req, res, next) {
    const companyId = req.session.selectedGrant.entity.id;
    billingData[companyId].push(req.body);
    fs.writeFileSync('data/billing.json', JSON.stringify(billingData, null, 2));
    res.redirect('/billing');
});
// :snippet-end:


module.exports = router;