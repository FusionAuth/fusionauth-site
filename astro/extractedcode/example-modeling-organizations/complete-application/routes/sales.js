const express = require('express');
const router = express.Router();
const checkGrantPermissions = require('../middleware/checkGrantPermissions');
const fs = require('fs');

const salesData = require('../data/sales.json');

router.get('/', checkGrantPermissions(['Admin', 'Sales', 'Viewer']), function (req, res, next) {

    const companyName = req.session.selectedGrant.entity.name;
    const companyId = req.session.selectedGrant.entity.id;
    
    // you would load this from a database probably, and most likely with an ID instead of name. 
    const data = salesData[companyId];

    res.render('sales', {
        title: companyName + ' - Sales',
        data: data, 
        user: req.user.user,
        company: companyName,
        companyId: companyId,
        logoutURL: req.logoutURL,
        selectedGrant: req.session.selectedGrant
    });
});


router.post('/', checkGrantPermissions(['Admin', 'Sales']), function (req, res, next) {
    // Get the data from the request body, and add the new row to the data file
    const companyId = req.session.selectedGrant.entity.id;

    req.body.total = req.body.price * req.body.quantity;
    salesData[companyId].push(req.body);
    // Save the data to the file
    fs.writeFileSync('data/sales.json', JSON.stringify(salesData, null, 2));
    res.redirect('/sales');
});


module.exports = router;