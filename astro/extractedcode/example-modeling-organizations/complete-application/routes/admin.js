const express = require('express');
const router = express.Router();
const checkGrantPermissions = require('../middleware/checkGrantPermissions');

const FUSIONAUTH_URL = process.env.FUSIONAUTH_URL;
const FUSIONAUTH_API_KEY = process.env.FUSIONAUTH_API_KEY;



router.get('/', checkGrantPermissions(['Admin']), async function (req, res, next) {

    const companyName = req.session.selectedGrant.entity.name;
    const entityId = req.session.selectedGrant.entity.id;

    // Get the latest info for the company from FusionAuth
    const entityData = await fetch(`${FUSIONAUTH_URL}/api/entity/${entityId}`, {
        method: 'GET',
        headers: {
            'Authorization': FUSIONAUTH_API_KEY,
            'Content-Type': 'application/json'
        }
    });
    const entity = await entityData.json();

    res.render('admin', {
        title: companyName + ' - Admin',
        user: req.user.user,
        company: req.session.selectedGrant.entity.name,
        companyId: req.session.selectedGrant.entity.id,
        logoutURL: req.logoutURL,
        selectedGrant: req.session.selectedGrant,
        data: entity.entity
    });
});


router.post('/', checkGrantPermissions(['Admin']), async function (req, res, next) {
    const entityId = req.session.selectedGrant.entity.id;

    // Update the entity with the new data

    
    const updates = {
        entity: req.body
    }

    // :snippet-start: updateEntity
    const response = await fetch(`${FUSIONAUTH_URL}/api/entity/${entityId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': FUSIONAUTH_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    });
    const entity = await response.json();
    req.session.selectedGrant.entity = entity.entity;
    // :snippet-end:

    if (!response.ok) {
        res.status(500).send('Error updating entity');
    } else {
        res.redirect('/admin');
    }

});



module.exports = router;