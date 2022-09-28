---
layout: advice
title: WebAuthn explained
description: What is WebAuthn
author: Dan Moore
image: advice/vendor-lockin/expert-advice-avoiding-authentication-system-lock-in-header-image.png
category: Authentication
date: 2021-07-12
dateModified: 2021-07-12
---

Webauthn is a new way to authenticate your users using biometric, secure authentication methods. WebAuthn requires something called an authenticator.

But what is an authenticator? An authenticator is a hardware or software device that is used to authenticate a user, via biometric or other methods.

## WebAuthn Overview

WebAuthn has the concept of ceremonies, which are flows of data and interaction. There are three main ones:

1) Registration, where the user associates an authenticator with their account
2) Authentication, where the user logs in using WebAuthn
3) Attestation, where the authenticator is tied back to a known source, such as an operating system vendor

For an authentication ceremony, what does Webauthn look like? In general, the flow of interaction is:

1) The user tries to login to a website
2) The website prompts the user for an authenticator
3) The user authenticates against their authenticator
4) The authenticator signs and passes a response back to the website through the browser
4) The website verifies the authenticator response
5) The user is logged in

There are two types of authenticators:

1) Hardware authenticators, such as Yubikeys
2) Software authenticators, built into the OS, such as Touch ID

Authenticators have a public/private keypair. The purpose of an authenticator is to hold, create, and expose a public/private key pair. It can also be used to access the public key and allow data to be signed by the private key.

## A brief digression on signing

Suppose we have a user, Alice, who wants to send a message to a user, Bob. We want to make sure that Bob knows that Alice sent the message and that the message hasn't been changed. The user Charlie wants to interfere with the communication channel between Alice and Bob.

One way to do this is for Alice to generate two keys: a public key and a private key. The public key is indicated by the blue key and the private key is indicated by the red key. These keys are related.

TODO DIAGRAM

Alice sends the public key over to Bob. Alice doesn't just create the message M, she creates a signature as well which is based on mathematical operation with the private key that'll get over to Bob.

Bob can use the public key and verify the signature matches in such a way that only the holder of the private key could have created it. 

If Charlie gets in the middle and tries to modify the message, he can't change the signature correctly because only the holder of the private key can create that signature. 

When Bob checks the signature with the modified message, it won't check out and he'll know that the message has been tampered with.

This is a brief overview of public/private key signatures. And the fact a signature ensures the validity of the message is what makes WebAuthn and the associated standards possible.

## Standards

Taking a step back, FIDO is an organization that's been around for years. It stands for Fast Identity Online and it creates standards focused on passwordless authentication.

FIDO2 is the second version of the standard and WebAuthn is part of FIDO2. It was standardized starting in 2015 and fully baked in 2019.

WebAuthn is about the browser interaction with a passwordless protocol. CTAP2 is a complementary standard which handles the browser to authenticator communication.

TODODIAGRAM

Assume you have a website that lets a user login with an authenticator. CTAP2 is handling the portion between the authenticator and the browser. It's worth noting that you can use CTAP2 without WebAuthn. But you would always want to get to the authenticator so you can have that passwordless authentication event, so CTAP2 would be in the picture if you were using FIDO2 with a native app.

## Selling Clownwear

Assume you have a website that you want to use to sell clownwear. You know, big shoes and red noses and the like? You will call it... Cosmo's Clown Store.

TODOpicture

In order to sell things in our store, people will need to be able to log in to perform typical tasks like checking their order status, adding things to their cart, and placing orders. Logging in will tie the user's identity to other data like their mailing address and credit card.

If you want to let folks log in securely, what are your options?

### Passwords

Passwords are a solid choice, but can be forgotten, stolen or re-used. In fact, over 11B username/password pairs are publicly available on the site haveibeenpwned.com. User's aren't really fans either, and re-use them across different systems.

This means that accounts on your system don't simply depend on your security posture, but on the posture of other sites that the user has registered for with the same password. Doh!

### Password Managers

The user experience can be tough when dealing with password managers.

If you're using a password manager that integrates into the browser, any non-standard login form UX can be really tough for it to handle.

If a password manager is centralized, that means that it is a high-value target. If it is not, then users can't login to accounts from more than one device.

### MFA

For example, if you add an additional factor of authentication (i.e. text the user a code, send them an email with a code, or require them to enter some code based on some algorithm using something like google authenticator), these are what are called additional features of the authentication. They do add additional assurance on who the user is. However, the user experience can be tough.

It can be a hassle to force someone to go to a different device to get a code. And depending on the method, it can also be insecure. For example, SMS can be phished.

### Single Sign-on

Single sign on is another option which doesn't have these same security risks, or rather, it centralizes them to a set of larger players. Which makes some sense; I pay more attention to my Google account than to the many random accounts I've created on other sites.

However, it does have the business risk of depending on a third party for accessing your website.

### WebAuthn

An alternative is to use WebAuthn.

It's important to note that with FIDO2, the server only stores public keys. The reason for this is because public keys are designed to be public. The private keys, which are the other half of the credential, are stored in a distributed manner across authenticators held by each user. This gives the user a much better experience than something like MFA or a password manager. 

WebAuthn is built into all browsers and is phishing-resistant because it's tied to a specific piece of hardware or software. The user not only has to have access to that hardware or software, but also can't share that access with anyone else.

Examples of authentication that happens with WebAuthn:

* facial recognition
* pin entry
* fingerprint recognition

However, the authentication method is entirely decided by the authenticator; the browser has minimal input into it. WebAuthn is only available on HTTPS sites, and therefore has built in spoof protection against domain name mismatches.

WebAuthn is available on all modern browsers except for IE and Opera Mini. (Sorry IE and Opera Mini users!)

TODO picture

When a user wants to log in with WebAuthn, the flow goes as follows:

1. The user enters their username and password into the login form.
2. The web browser sends a request to the browser.
3. The browser makes a request of the authenticator.
4. The authenticator asks the user for their permission.
5. The user grants permission, and the authenticator generates a signature and a result and sends them back to the web browser.
6. The web browser sends the data back to the server.
7. The server verifies the the data with the previously registered public key. If it checks out, the user is logged in.

A ‘relying party’ is the website that the user is trying to log in to. The authenticator is what handles the actual authentication. 
The browser, driven by the user, sends a request to the website to log in. The website then passes back a challenge, a website identifier, and some other data. The challenge is used to prevent replay attacks and is a randomly generated string of characters.

As mentioned above, the authentication is tied to domain names and only allowed on HTTPS URLs, which are enforced by the browser. For instance, you can't sent a request for the site `example.com` if the user is currently on the site `cosmosclownstore.com`. If these check out, the browser then passes the information to the authenticator. The authenticator then interacts with the user to authenticate them.

The user needs to authenticate to access their account at the clown store. The user can choose not to authenticate, in which case the authenticator would send back an error message. If the user does authenticate, the authenticator creates a signed assertion and passes it back to the browser.

The browser passes the assertion back to Cosmo's Clown Store.

Cosmos Clown Store can verify the assertion with the public key that is stored and associated with that user. If the assertion checks out, the user is logged in and can buy all the clownwear they want.

## Some WebAuthn code

The core of the web authentication workflow is using the credentials API.

```javascript
navigator.credentials.get(options)
  .then(function (assertionResponse) {
    // Send authentication status to server
  }).catch(function (err) {
    // No acceptable authenticator or user refused.
  });
```

You pass it an `options` object and get a response back. Here's what the options object looks like:

```javascript
options = {
  publicKey: {
    rpId: "cosmosclownstore.com",
    challenge: "....",
    userVerification: "preferred",
    //...
  }
}
```

The options object has a few key properties:
- the `publicKey` top-level key: this indicates we're using WebAuthn
- the `rpId`: this tells the authenticator who this request is for
- a `challenge`: a random string to prevent replay attacks

There are other options as well, including whether you want the user to be fully verified and authenticated or just prove presence. That'll be discussed more below.

After you call get with the options that we previously created, you get a response back as a promise. Here's an example response.

```javascript
{
  authenticatorData: {
    rpIdHash : ..., // hash of the requesting party Id
    flags : ..., // bit array including authentication results
    // other info
  },
  clientDataJSON: {
    type: "webauthn.get",
    challenge: ... // should match initial challenge
  }
}
```

If the response is successful, the response data will have an `authenticatorData` key, which has a `flags` sub-key. This `flags` sub-key is a bit array indicating whether the user authenticated or not, as well as what assurance you have. 

You also have a `clientDataJSON` object, which has the `challenge` and some other information. In order to prevent replay attacks verify that the challenge you receive is the same as the challenge you sent.

## Authenticators, Revisited

There are two main types of authenticators: cross-platform authenticators and platform authenticators. 

* Cross-platform authenticators are hardware devices that can be used between different devices, like a Yubikey.
* Platform authenticators are built into the operating system and exist in all major operating systems, both desktop and mobile. 

The browsers all leverage CTAP2 to talk to the authenticators. While WebAuthn handles communication between the browser and the website.

Part of this communication includes "ceremonies" which are a way of extending a network protocol to include things in the real world, such as physical hardware or human beings. There are three ceremonies that you need to be concerned with when thinking about WebAuthn: authentication, which you've already seen, and then , registration and attestation.

## The Registration Ceremony

Let’s say a user wants to register for a website that uses Cosmos Clown source. The website will generate a challenge and send it to the user. That is passed on to the authenticator, along with some other data.

The authenticator then asks the user if they want to register. If the answer is yes, then the following occur:

-A public/private keypair is generated
-The public key and similar data is sent up to the browser
-The private key is kept on the authenticator
-The public key is then passed up to the website's server

This allows the website's server to store the public key and associate it with the user.

When an authentication ceremony happens, the website will have the user's public key ready to go. 

Registration is tied to each website. So if you use the same authenticator on multiple websites, each website will have its own corresponding key pair.

TODO DIAGRAM

Let's look at the code flow for the registration ceremony using the WebAuthn API. The options are a little more complicated than for authentication. 

```javascript
options =  {
  publicKey: {
    rp: { id: "cosmosclownstore.com", 
            name: "Cosmo’s Clown Store" },
    user: { id: "1234", 
                name: "krusty", 
                displayName: "krusty The Clown" },
    challenge: "...",
    pubKeyCredParams: [ { type: "public-key", alg: -7 }]
    //...
  }
}
```

We again have the public key as the top level key, indicating that we're using web authentication. 

Then we have the RP (Relying Party), which has information about the website that is requesting the registration operation. This includes the name, which is going to be displayed to the end user by the authenticator.

We have user information that is going to be used to tie the user to the public key.
To create the key, we need to specify the algorithm we want to use.
We can do this by passing in an options object with the name of the algorithm as a key and the value as `-7`. This is an item in the [IANA COSE Algorithms registry](https://www.iana.org/assignments/cose/cose.xhtml).

After we've created the options object, we'll call the create method on the credentials and if it succeeds, the user will be registered with our website.

```javascript
navigator.credentials.create(options)
  .then(function (newCredentialInfo) {
    // Send credential info to server 
  }).catch(function (err) {
    // No acceptable authenticator or user refused consent. 
  });
```

Credentials are created by the user during registration and then sent up to the server to be stored. The credential object contains information about the user, the challenge, and the attestation object.

```javascript
{
  response: {
    clientDataJSON: { 
      type: “webauthn.create”,
      challenge: ... // should match initial challenge
      origin: ... //
    },
    attestationObject: {
      authData: {
        attestedCredentialData: {
          credentialId: ..., 
          credentialPublicKey: ...,
        }
      }, // other stuff about attestation 
    }
  }
}
```

The `attestationObject` is where the things we're interested in are: 

- the credential Id 
- the public key 

We need to store the `credentialId` to identify the user and the public key to verify the assertions generated by the other ceremonies. but you also have to cerivy the `challenge` and `type` in the `clientDataJSON` object.

At registration, the user passes down their user information. This implies that we know who the user is. Typically, you are going to require another form of authentication first (i.e. user and password) and then they will associate with a WebAuth credential to make their future authentication easier. 

As the relying party (website), you can specify what kind of authenticators you want to support. You can’t get too granular, but you can specify if you only want to support platform authenticators or cross platform authenticators. 

## The Attestation Ceremony

Attestation is the third major ceremony and the question it really answers is: How do I know this authenticator the user is using is legitimate? 

For attestation, each type of authenticator has a shared private key, totally separate from the private keys used for the authentication and registration ceremonies. The corresponding public key is stored in a public metadata registry. Here's the [FIDO alliance metadata service](https://fidoalliance.org/metadata/).

With attestation, you ask the authenticator to sign something with that common private key, and then verify it with the public key from the registry.

This way, you can verify that only the holder of the private key could have created the correct signature, and you know that the authenticator is of a certain type.

The spec alludes to some privacy concerns and you don't really know whether authenticators can provide this proof of lineage method, so this is more of an enterprise use case.

The registry has more than the public keys that can inform you about attestation. There's more information, such as the capabilities each authenticator supports and whether or not a authenticator might be deprecated because of security issues.

Here is one example of a registry entry.

```json
   {
      "aaguid": "08987058-cadc-4b81-b6e1-30de50dcbe96",
      "metadataStatement": {
        "legalHeader": "https://fidoalliance.org/metadata/metadata-statement-legal-header/",
        "aaguid": "08987058-cadc-4b81-b6e1-30de50dcbe96",
        "description": "Windows Hello Hardware Authenticator",
        "authenticatorVersion": 1,
        "protocolFamily": "fido2",
        "schema": 3,
        "upv": [
          {
            "major": 1,
            "minor": 0
          }
        ],
        "authenticationAlgorithms": [
          "rsa_emsa_pkcs1_sha256_raw"
        ],
        "publicKeyAlgAndEncodings": [
          "cose"
        ],
        "attestationTypes": [
          "attca"
        ],
        "userVerificationDetails": [
          [
            {
              "userVerificationMethod": "eyeprint_internal"
            }
          ],
          [
            {
              "userVerificationMethod": "passcode_internal"
            }
          ],
          [
            {
              "userVerificationMethod": "fingerprint_internal"
            }
          ],
          [
            {
              "userVerificationMethod": "faceprint_internal"
            }
          ]
        ],
        "keyProtection": [
          "hardware"
        ],
        "isKeyRestricted": false,
        "matcherProtection": [
          "software"
        ],
        "attachmentHint": [
          "internal"
        ],
        "tcDisplay": [],
        "attestationRootCertificates": [
          "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"
        ],
        "icon": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAACkUlEQVR42uyai3GDMAyGQyegGzACnaCMkBHoBhkhnSAj0A2SDaAT0E6QbEA3cOXW6XEpBtnImMv9utOllxjF/qKHLTdRSm0gdnkAAgACIAACIAACIAACIAgAARAAARAAARAAARBEAFCSJINKkpLuSTtSZbQz76W25zhKkpFWPbtaz6Q75vPuoluuPmqxlZK2yi76s9RznjlpN2K7CrFWaUAHNS0HT0Atw3YpDSjxbdoPuaziG3uk579cvIdeWsbQD7L7NAYoWpKmLy8chueO5reB7KKKrQnQJdDYn9AJZHc5QBT7enINY2hjxrqItsvJWSdxFxKuYlOlWJmE6zPPcsJuN7WFiF7me5DOAws4OyZyG6TOsr/KQziDaJm/mcy2V1V0+T0JeXxqqlrWC9mGGy3O6wwFaI0SdR+EMg9AEAACIAByqViZb+/prgFdN6qb306j3lTWs0BJ76Qjw0ktO+3ad60PQhMrfM9YwqK7lUPe4j+/OR40cDaqJeJ+xo80JsWih1WTBAcb8ysKrb+TfowQKy3v55wbBkk49FJbQusqr4snadL9hEtXC3nO1G1HG6UfxIj5oDnJlHPOVVAerWGmvYQxwc70hiTh7Bidy3/3ZFE6isxf8epNhUCl4n5ftYqWKzMP3IIquaFnquXO0sZ1yn/RWq69SuK6GdPXORfSz4HPnk1bNXO0+UZze5HqKIodNYwnHVVcOUivNcStxj4CGFYhWAWgXgmuF4JzdMhn6wDUm1DpmFyVY7IvQqeTRdod2v2F8lNn/gcpW+rUsOi9mAmFwlSo3Pw9JQ3p+8bhgnAMkPM613BxOBQqc2FEB4SmPQSAAAiAAAiAAAiAAAiAIAAEQAAEQAAEQPco3wIMADOXgFhOTghuAAAAAElFTkSuQmCC",
        "authenticatorGetInfo": {
          "versions": [
            "FIDO_2_0"
          ],
          "aaguid": "08987058cadc4b81b6e130de50dcbe96",
          "options": {
            "plat": true,
            "rk": true,
            "up": true
          },
          "maxCredentialCountInList": 100,
          "maxCredentialIdLength": 32,
          "transports": [
            "internal"
          ],
          "algorithms": [
            {
              "type": "public-key",
              "alg": -257
            }
          ],
          "minPINLength": 4,
          "firmwareVersion": 19042
        }
      },
      "statusReports": [
        {
          "status": "FIDO_CERTIFIED_L1",
          "effectiveDate": "2020-08-05",
          "certificationDescriptor": "Windows Hello Hardware Authenticator",
          "certificateNumber": "FIDO20020190418002",
          "certificationPolicyVersion": "1.3.6",
          "certificationRequirementsVersion": "1.1.0"
        }
      ],
      "timeOfLastStatusChange": "2020-08-05"
    }
```

You can see there is a lot of metadata that is structured that you can process.

## User Presence vs User Verification

Authenticators can be used as a second factor because they give you assurances about the user having access to something.

This leads us to the user presence versus user verification distinction. 

User presence is saying that there is someone there behind the authenticator who gave permission. All it proves is that you have access to the authenticator.

User verification, on the other hand, is another layer of assurance where the user provides something else. The authenticator could require a pin. It could be a face Id or touch Id challenge. In any case, it is something that ties the user more closely to who we think they are. 

Of the two types, user verification is more prevalent with the platform authenticators than cross platform authenticators.

The initiating server specifies the choice of user verification at the time of authentication. The three choices for user verification are preferred, required, and discouraged. 

* Preferred means that user verification is preferred, but not required. 
* Required means that user verification is required and the authentication will fail if it cannot be performed. 
* Discouraged means that user verification is not preferred and should not be used if possible. 

Make sure to require verification when using WebAuthn as a first factor. 

## Resident Keys

Another WebAuthn feature is resident keys. This is where the user to provider mapping is stored not on the server side, but on the authenticator.

This is only for cross-platform authenticators. The server code does not have to have prior knowledge of the user before they are authenticated. 

Some authenticators support this, but it is less common in the B2C space.

## Implemenation

What do we need to consider when implementing WebAuthn authentication?

- Storing public key data in a safe and secure way
- Streamlining workflows, such as knowing when to prompt the user for WebAuthn
- Prompting users to register their WebAuthn capable device
- Allowing them to use it within the app
- Considering the account recovery process

There are libraries available to help with implementing authentication on the server side. These libraries will help with things like storing data safely and securely, streamlining workflows, and prompting users to register.

You can use any server-side language you want, as long as it supports WebAuthn.

## Summing Up

WebAuthn is a novel new way to let consumers have the security of biometric authentication methods, such as Touch ID and Face ID, without requiring expensive hardware. It is supported by every browser and isn't hard to implement.

