const express = require('express');
const router = express.Router();
const checkGrantPermissions = require('../middleware/checkGrantPermissions');

const FUSIONAUTH_URL = process.env.FUSIONAUTH_URL;
const FUSIONAUTH_API_KEY = process.env.FUSIONAUTH_API_KEY;

/* GET users listing. */
router.get('/', checkGrantPermissions(['Admin', 'Viewer']), async function (req, res, next) {



  // This big search query gets all users that have a registration for the FusionAuth Application (don't want cross application / tenant users. )
  var elasticQuery = {
    "bool" : {
      "must" : [ {
        "nested" : {
          "path" : "registrations",
          "query" : {
            "bool" : {
              "must" : [ {
                "match" : {
                  "registrations.applicationId" : "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"
                }
              } ]
            }
          }
        }
      } ]
    }
  };

  elasticQuery = JSON.stringify(elasticQuery);

  var fullSearchQuery = {
    "search": {
      "numberOfResults": 50,
      "query": elasticQuery,
      "sortFields": [
        {
          "missing": "_first",
          "name": "email",
          "order": "asc"
        }
      ],
      "startRow": 0
    }
  };


  const request = await fetch(`${FUSIONAUTH_URL}/api/user/search`, {
    method: 'POST',
    headers: {
      'Authorization': FUSIONAUTH_API_KEY,
      'Content-Type': 'application/json'
    }, 
    body: JSON.stringify(fullSearchQuery)
  });

  const results = await request.json();

  // :snippet-start: getGrantsForAllUsers
  // Get the grants for each user:
  const allPermissions = req.session.selectedGrant.entity.type.permissions
  for (let i = 0; i < results.users.length; i++) {
    const user = results.users[i];
    const grantsResponse = await fetch(`${FUSIONAUTH_URL}/api/entity/grant/search?userId=${user.id}`, {
      headers: {
        'Authorization': FUSIONAUTH_API_KEY
      }
    });
    const grants = await grantsResponse.json();
    // Only include the grants for the selected entity (company)
    const userGrants = grants.grants.find(grant => grant.entity.id === req.session.selectedGrant.entity.id);

    // make a list of all permissions, and mark the ones the user has:
    user.permissions = allPermissions.map(perm => {
      return {
        permission: perm,
        hasPermission: userGrants ? userGrants.permissions.includes(perm.name) : false
      }
    });
  }
  // :snippet-end:


  res.render('users', {
    title: 'Users',
    data: results.users,
    user: req.user.user,
    logoutURL: req.logoutURL,
    selectedGrant: req.session.selectedGrant,
    allPermissions: req.session.selectedGrant.entity.type.permissions,
    company: req.session.selectedGrant.entity.name,
    companyId : req.session.selectedGrant.entity.id
  });

});


/*
  The post request is called when the user clicks the save button on the users page. 
  The request body contains the permissions for all users. 
  The permissions are updated for each user, and then the user is redirected back to the users page. 
  The post object should have the following structure:
  {
    users: [
      {
        id: 'user-id',
        permissions: [
          {
            permissionId: 'permission-id',
            permissionName: "permission-name",
            hasPermission: "true"
          }
        ]
      }
    ]
  }
*/
router.post('/', checkGrantPermissions(['Admin']), async function (req, res, next) {
  console.log(JSON.stringify(req.body));

  // update the grants for all users: 

  req.body.users.forEach(async user => {

    // collect all the names of the perms that are "true" (must be added):
    const permissionsToEnable = user.permissions.filter(perm => perm.hasPermission && perm.hasPermission === "true").map(perm => perm.permissionName);


      const addedGrantsResponse = await fetch(`${FUSIONAUTH_URL}/api/entity/${req.session.selectedGrant.entity.id}/grant`, {
        method: 'POST',
        headers: {
          'Authorization': FUSIONAUTH_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "grant": {
            "permissions": permissionsToEnable,
            "userId": user.userId
          }
        })
      });

      if (!addedGrantsResponse.ok) {
        console.error('Error adding grants for user', user.userId);
      }
  });


  res.redirect('/users');
});

module.exports = router;
