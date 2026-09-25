const AWS = require('aws-sdk');

const clientId = "1r4gcuhj4f127iuhoiov9234tm"
const region = "us-east-2"
const fusionAuthApplicationId = "85a03867-dccf-4882-adde-1a79aeec50df"
const authorizationHeaderValue = "2687EE95-AF19-4CE6-A8BD-963139DED32E" // make this a random value

const cognito = new AWS.CognitoIdentityServiceProvider(region);

function processOneAttribute(attributes, name) {
    console.log("processing: " + name)
    if (attributes && attributes.filter(obj => obj.Name == name).length > 0) {
        return attributes.filter(obj => obj.Name == name)[0].Value
    }
    return null
}

function processUserJSON(json) {
    // map the json returned by cognito to FusionAuth compatible json
    // see https://fusionauth.io/docs/lifecycle/migrate-users/connectors/generic-connector for more
    // example Cognito JSON: {"Username":"06744664-df6e-48cc-9421-3d56a9732172","UserAttributes":[{"Name":"sub","Value":"06744664-df6e-48cc-9421-3d56a9732172"},{"Name":"website","Value":"http://example.com"},{"Name":"given_name","Value":"Test"},{"Name":"middle_name","Value":"T"},{"Name":"family_name","Value":"Testerson"},{"Name":"email","Value":"test@example.com"}],"testValue":"foo"}
    // console.log(json)

    const userJSON = {}
    userJSON.user = {}

    userJSON.user.data = {}

    // add migration metadata for future queries
    userJSON.user.data.migratedDate = new Date()
    userJSON.user.data.migratedFrom = "cognito"

    // map cognito attributes if present to FusionAuth attributes
    const attributes = json.UserAttributes
    const website = processOneAttribute(attributes, "website")
    if (website != null) {
        userJSON.user.data.website = website
    }

    userJSON.user.username = json.Username // use the same username if desired

    const email = processOneAttribute(attributes, "email")
    if (email != null) {
        userJSON.user.email = email
    }

    userJSON.user.id = json.Username // prefer the sub claim as the id, but fall back to this
    const sub = processOneAttribute(attributes, "sub")
    if (sub != null) {
        userJSON.user.id = sub
    }

    const firstName = processOneAttribute(attributes, "given_name")
    if (firstName != null) {
        userJSON.user.firstName = firstName
    }
    const lastName = processOneAttribute(attributes, "family_name")
    if (lastName != null) {
        userJSON.user.lastName = lastName
    }

    const emailVerified = processOneAttribute(attributes, "email_verified")
    if (emailVerified != null) {
        userJSON.user.verified = (emailVerified == "true")
    }

    // default values

    userJSON.user.active = true

    // register for certain FusionAuth applications
    userJSON.user.registrations = []
    userJSON.user.registrations[0] = {
        applicationId: fusionAuthApplicationId 
    }

    return userJSON
}

// ***********
// you shouldn't need to modify anything below this
// ***********

exports.handler = async function(event, context) {
    try {
        const headers = event.headers
        if (headers["Authorization"] !== authorizationHeaderValue) {
            return {
                statusCode: 401,
                headers: {},
                body: ""
            };
        }

        const method = event.httpMethod;
        // Get name, if present
        if (method === "POST") {

            if (event.path === "/") {
                const incomingBody = JSON.parse(event.body)
                if (incomingBody.loginId && incomingBody.password) {
                
                    //https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#initiateAuth-property
                                    
                    var params = {
                        AuthFlow: 'USER_PASSWORD_AUTH',
                        ClientId: clientId,
                        AuthParameters: {
                            USERNAME: incomingBody.loginId,
                            PASSWORD: incomingBody.password
                        }
                    };

                    const res = await cognito.initiateAuth(params).promise()
                    var jsonResponse = {}
                    if (res.AuthenticationResult && res.AuthenticationResult.AccessToken) {
                        const res2 = await cognito.getUser({
                            AccessToken: res.AuthenticationResult.AccessToken
                        }).promise();
                        jsonResponse = processUserJSON(res2)

                        return {
                            statusCode: 200,
                            headers: {},
                            body: JSON.stringify(jsonResponse)
                        };
                    } else if (res.ChallengeName) {
                        console.log("Unable to log user in. Got response: " + res.ChallengeName + " and am unsure how to handle.")
                    }
                }
            }
        }

        return {
            statusCode: 400,
            headers: {},
            body: "Invalid request"
        };
    } catch (error) {
        var body = error.stack || JSON.stringify(error, null, 2);
        console.log("Error in authenticating")
        console.log(body)
        return {
            statusCode: 404,
            headers: {},
            body: ""
        }
    }
}
