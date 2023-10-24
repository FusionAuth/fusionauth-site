// At some point we will need to migrate to JS SDK v3.
// Here are some notes, even though I couldn't get it working
// because I barely know anything about javascript.
//
// const { S3 } = require('@aws-sdk/client-s3');
// const s3 = new S3({region: 'us-east-1'});
// const response = await s3.getObject(bucketParams);
// redirectRules = await response.Body.transformToString();

const AWS = require('aws-sdk');
const S3 = new AWS.S3({signatureVersion: 'v4'});

const rulesBucket = 'fusionauth-dev-us-east-1-artifacts';
const rulesFile = 'lambda-at-edge/cloudfront-redirects/redirects.json';

// const redirectRules = "load this from file";
let redirectRules = null;
let lastUpdatedTime = 0;
let intervalBetweenUpdates = 60;

exports.handler = (event, context, callback) => {
  var req = event.Records[0].cf.request;
  var uri = req.uri;
  var result = req;

  syncRedirectRules(rulesBucket, rulesFile)
    .then(() => {
      if (!redirectRules) {
        console.log("No redirection rule exists: %s", result);
        callback(null, result);
        return;
      }

      if (uri.endsWith('.html')) {
        // there shouldn't be links to .html files out there
        result = redir(uri.substring(0, uri.length - 5));
      } else if (uri.endsWith('/') && removeSlash(uri)) {
        // if this seems to be a reference to a file but with a trailing slash, remove it
        result = redir(uri.substring(0, uri.length - 1));
      } else if (!uri.endsWith('/') && redirectRules.indexPaths[uri + '/'] === true) {
        // if this is a reference to an index page that is missing its slash, add it
        result = redir(uri + '/');
      } else {
        var redirect = calculateRedirect(uri);
        if (redirect !== null) {
          result = redir(redirect);
        } else {
          req.uri = calculateURI(uri);
        }
      }
      callback(null, result);
    })
    .catch(err => {
      console.log("Error in OriginRequestFunction: %s", err);
      callback(null, result);
    });
};

function syncRedirectRules(ruleHost,ruleFile) {
  return new Promise((resolve, reject) => {
    let currentTime = new Date().getTime();
    if (lastUpdatedTime && (currentTime - lastUpdatedTime) < (intervalBetweenUpdates * 1000)) {
      resolve(redirectRules);
      return;
    }

    S3.getObject({ Bucket: ruleHost, Key: ruleFile }).promise()
    .then(data => {
      redirectRules = JSON.parse(data.Body);
      intervalBetweenUpdates = redirectRules.refreshTime;
      lastUpdatedTime = currentTime;
      resolve(redirectRules);
    })
    .catch(err => {
      console.log("Error while fetching the rules file: %s", err);
      redirectRules = null;
      lastUpdatedTime = currentTime;
      resolve(null);
    });
  });
}


// returns true if this seems to be a link to a page with a trailing slash that should just be removed
function removeSlash(uri) {
  return redirectRules.indexPaths[uri] !== true &&
         (!uri.startsWith('/blog') || (uri.match('^/blog/[\\w\\d-]*/$') && !uri.match('^/blog/latest/$'))) &&
         redirectRules.redirectsByPrefix.find(e => uri.startsWith(e[0])) === undefined;
}

function calculateRedirect(uri) {
  var result = redirectRules.redirects.hasOwnProperty(uri) ? redirectRules.redirects[uri] : null;

  if (result === null) {
    var prefix_replacement = redirectRules.redirectsByPrefix.find(e => uri.startsWith(e[0]));

    if (prefix_replacement !== undefined) {
      result = uri.replace(prefix_replacement[0], prefix_replacement[1]);
    }
  }

  if (result === null) {
    redirectRules.redirectsByRegex.forEach(function (regexValueArray) {
      var regex = new RegExp(regexValueArray[0], "g");
      var value = regexValueArray[1];
      if (regex.test(uri)) {
        result = uri.replace(regex, value);
      }
    });
  }

  return result;
}

function appendHTML(uri) {
  var slashIndex = uri.lastIndexOf('/');
  var dotIndex = uri.indexOf('.', slashIndex);
  if (slashIndex < uri.length - 1 && dotIndex < 0) {
    uri = uri + '.html';
  }
  return uri;
}

function calculateURI(uri) {
  var i;
  for (i = 0; i < redirectRules.s3Prefixes.length; i++) {
    if (uri.startsWith(redirectRules.s3Prefixes[i])) {
      return uri.endsWith('/') ? uri + 'index.html' : appendHTML(uri);
    }
  }

  for (i = 0; i < redirectRules.s3Paths.length; i++) {
    if (uri === redirectRules.s3Paths[i]) {
      return appendHTML(uri);
    }
  }

  return uri;
}

function redir(loc) {
  return {status:301,statusDescription:'Moved',headers:{'location':[{key: 'Location', value: loc}]}}
}
