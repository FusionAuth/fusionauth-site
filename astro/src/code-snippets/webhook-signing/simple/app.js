const bodyParser = require('body-parser');
const express = require("express");

// configure these
const port = 3030;
const webhookListenerPath = '/webhook';

const router = express();
router.use(bodyParser.json())

// tag::simplewebhook[]
router.route('/fusionauth-webhook').post((req, res) => {
  const authorization = req.header('Authorization');
  if (authorization !== 'API-KEY') {
    res.status(401).send({
      'errors': [{
        'code': '[notAuthorized]'
      }]
    });
    return;
  }

  const request = req.body;
  // Note: potential event handling code not implemented
  if (request.event.type === 'user.delete') {
    todo.deleteAll(request.event.user.id)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(function(err) {
        _handleDatabaseError(res, err);
      });
  } else {
    res.sendStatus(200);
  }
});
// end::simplewebhook[]

router.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});
