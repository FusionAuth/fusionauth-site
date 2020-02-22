---
layout: advice
title: OAuth v1 signed requests
description: Twitter doesn't make it easy to build an OAuth v1 login with Java. Here's how we did it for FusionAuth.
author: Daniel DeGroff
categories: oauth
header_dark: true
image: advice/login-with-twitter-article.png
category: OAuth
date: 2019-11-04
dateModified: 2019-11-04
---

If you've ever had to navigate the harrowing path of signing OAuth v1 requests to Twitter, you'll likely commiserate with the difficulty of implementing this algorithm correctly. In many languages, there aren't great off-the-shelf option to make this easy either. Building out a social login with Twitter requires a lot of heavy lifting to get right. 

This article illustrates how to build OAuth v1 requests that Twitter requires. Our sample code is in Java, but can be easily ported to nearly any language.

**TL;DR See the Java source code in this [Gist](https://gist.github.com/robotdan/33f5834399b6b30fea2ae59e87823e1d).**

## OAuth v1 signed requests

Twitter leverages OAuth v1. This is the first version of the OAuth protocol and most companies have deprecated their use of v1 in favor of v2 of OAuth. For example, Intuit removed OAuth v1 support complete from the QuickBooks Online system in October of 2019.

OAuth 1 uses cryptographic signing, specifically HMAC-SHA1 with a shared secret, in order to verify the validity of requests to the provider. While this offers some security benefits, it comes at a cost of additional programming complexity and is cumbersome to implement correctly. The theory is that the OAuth v1 protocol could be used even if the browser was not using a secure protocol with the servers (i.e. HTTP rather than HTTPS). We the move towards using TLS 1.2 for all web traffic, this concern is no longer entirely valid. In fact, many identity providers and social logins require logins to use HTTPS for all requests.

As a side note, OAuth v2 provides a security mechanism that no longer requires signing but does require the use of HTTPS. The v2 of OAuth is now 9 years old and well tested and verified from a security perspective. Therefore, the benefits from v1 in terms of security are likely not worth the overhead of the additional complexity.

With all of that said, Twitter still uses OAuth v1. Therefore, we still have to write the necessary code to sign the requests.

Let's quickly look at an overview of the OAuth v1 login process to get a sense for how this signing works. Here are the steps an application must take to create the request and send it to the identity provider (in this case Twitter).

1. The user opens their browser and navigates to the application
2. The user clicks the `Login with Twitter` button
3. This redirects the browser to a new path within the application (i.e. `/oauth1/sign-request`)
4. The browser requests this URI and application backend creates the signed request
5. The application backend sends the signed request to the Twitter request endpoint at `https://api.twitter.com/oauth/request_token`
6. Twitter sends back a request token
7. The application backend sends a 302 redirect to the browser that takes it to the Twitter authorize UI

[This page in the Twitter developer documentation](https://developer.twitter.com/en/docs/twitter-for-websites/log-in-with-twitter/guides/implementing-sign-in-with-twitter.html) goes over this process in more detail with diagrams to help with each step.

Most of this process is simple and standard for anyone that has built web applications. The most challenging part of this process is step #4. Twitter has a summary that outlines building the [signed request](https://developer.twitter.com/en/docs/basics/authentication/guides/creating-a-signature.html). Here is a quick rundown of those steps.

{:.text}
> These values need to be encoded into a single string which will be used later on. The process to build the string is very specific:
> <br><br>
> 1. Percent encode every key and value that will be signed.
> 2. Sort the list of parameters alphabetically [1] by encoded key [2].
> 3. For each key/value pair:
> 4. Append the encoded key to the output string.
> 5. Append the '=' character to the output string.
> 6. Append the encoded value to the output string.
> 7. If there are more key/value pairs remaining, append a '&' character to the output string.

This process is called canonicalization and is used by any process that needs a repeatable process for generating signatures. XML signing uses a similar process as well. However, this process can be difficult to understand and implement.

The signed request process is actually part of the OAuth Core 1.0 specification. Specifically, [section 9](https://oauth.net/core/1.0a/#signing_process) of [OAuth Core 1.0 Revision A](https://oauth.net/core/1.0a/) covers how to build signed requests in detail.

If you want to skip all the reading and just get down to some code, the next section goes over a simple Java implementation.

## Gather your Keys

Start by logging into Twitter and navigating the Twitter developer console. Once you're there, navigate to the `Keys and tokens` tab of the application you're integrating. Here you will find a few key pieces of information that you'll need to sign the request.

{% include _image.html src="/assets/img/docs/twitter-keys-tokens.png" alt="Twitter Consumer API Keys" class="img-fluid" figure=false %}

Make note of the two values in the `Consumer API Keys` section, they are suffixed with the labels `API key` and `API secret key`. Once you are in the OAuth v1 world, we'll be using the `API key` value for the consumer key and the `API secret key` value for the consumer secret.

In the above Twitter configuration screenshot we have an `API key` value of `T62nvXkMrZyTeRYK2vBmGiFUq` and an `API secret key` value of `gikDkNsIS7Xpc1eFtgt38lnZFBarywiOtEyyUBGZ3x2fj6d3gz`. We'll use those values in the next section to build an example `Authorization` header.

## Example code

Here is a Java example of building the `Authorization` header value for a `POST` request to the Twitter `request_token` endpoint. This helps us build the HTTP POST request as part of step 4 from above. 

```java
String authorization = new OAuth1AuthorizationHeaderBuilder()
            .withMethod("POST")
            .withURL("https://api.twitter.com/oauth/request_token")
            .withConsumerSecret("gikDkNsIS7Xpc1eFtgt38lnZFBarywiOtEyyUBGZ3x2fj6d3gz")
            .withParameter("oauth_callback", "https://login.piedpiper.com/callback")
            .withParameter("oauth_consumer_key", "T62nvXkMrZyTeRYK2vBmGiFUq")
            .withParameter("oauth_nonce", "tp9pdk9frXwLOwt3")
            .build();
```

Here's the result of this code:

```
OAuth oauth_callback="https%3A%2F%2Flogin.piedpiper.com%2Fcallback", oauth_consumer_key="T62nvXkMrZyTeRYK2vBmGiFUq", oauth_nonce="tp9pdk9frXwLOwt3", oauth_timestamp="1554175774", oauth_signature_method="HMAC-SHA1", oauth_version="1.0", oauth_signature="tYJE4EV0ZoXYX6jsAfQuQvLpjOA%3D"
```

This value is sent to the Twitter endpoint as the `Authorization` HTTP header. Here's what our HTTP header looks like. **NOTE** we added line breaks here to help with readability. In the real request, the value is the same as the long String above:

```
Authorization: OAuth oauth_callback="https%3A%2F%2Flogin.piedpiper.com%2Fcallback",
                     oauth_consumer_key="T62nvXkMrZyTeRYK2vBmGiFUq",
                     oauth_nonce="tp9pdk9frXwLOwt3",
                     oauth_timestamp="1554175774",
                     oauth_signature_method="HMAC-SHA1",
                     oauth_version="1.0",
                     oauth_signature="tYJE4EV0ZoXYX6jsAfQuQvLpjOA%3D"
```

The `OAuth1AuthorizationHeaderBuilder` class is performing all of the logic to generate the signed request so let's review the code for that:

```java
/*
 * Copyright (c) 2019, FusionAuth, All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author Daniel DeGroff
 */
public class OAuth1AuthorizationHeaderBuilder {
  // https://tools.ietf.org/html/rfc3986#section-2.3
  private static final HashSet<Character> UnreservedChars = new HashSet<>(Arrays.asList(
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      '-', '_', '.', '~'));

  public String consumerSecret;

  public String method;

  public String parameterString;

  public Map<String, String> parameters = new LinkedHashMap<>();

  public String signature;

  public String signatureBaseString;

  public String signingKey;

  public String tokenSecret;

  public String url;

  /***
   * Replaces any character not specifically unreserved to an equivalent percent sequence.
   *
   * @param s the string to encode
   * @return and encoded string
   * @see <a href="https://stackoverflow.com/a/51754473/3892636">https://stackoverflow.com/a/51754473/3892636</a>}
   */
  public static String encodeURIComponent(String s) {
    StringBuilder o = new StringBuilder();
    for (char ch : s.toCharArray()) {
      if (isSafe(ch)) {
        o.append(ch);
      } else {
        o.append('%');
        o.append(toHex(ch / 16));
        o.append(toHex(ch % 16));
      }
    }
    return o.toString();
  }

  private static boolean isSafe(char ch) {
    return UnreservedChars.contains(ch);
  }

  private static char toHex(int ch) {
    return (char) (ch < 10 ? '0' + ch : 'A' + ch - 10);
  }

  public String build() {
    // For testing purposes, only add the timestamp if it has not yet been added
    if (!parameters.containsKey("oauth_timestamp")) {
      parameters.put("oauth_timestamp", "" + Instant.now().getEpochSecond());
    }

    // Boiler plate parameters
    parameters.put("oauth_signature_method", "HMAC-SHA1");
    parameters.put("oauth_version", "1.0");

    // Build the parameter string after sorting the keys in lexicographic order per the OAuth v1 spec.
    parameterString = parameters.entrySet().stream()
                                .sorted(Map.Entry.comparingByKey())
                                .map(e -> encodeURIComponent(e.getKey()) + "=" + encodeURIComponent(e.getValue()))
                                .collect(Collectors.joining("&"));

    // Build the signature base string
    signatureBaseString = method.toUpperCase() + "&" + encodeURIComponent(url) + "&" + encodeURIComponent(parameterString);

    // If the signing key was not provided, build it by encoding the consumer secret + the token secret
    if (signingKey == null) {
      signingKey = encodeURIComponent(consumerSecret) + "&" + (tokenSecret == null ? "" : encodeURIComponent(tokenSecret));
    }

    // Sign the Signature Base String
    signature = generateSignature(signingKey, signatureBaseString);

    // Add the signature to be included in the header
    parameters.put("oauth_signature", signature);

    // Build the authorization header value using the order in which the parameters were added
    return "OAuth " + parameters.entrySet().stream()
                                .map(e -> encodeURIComponent(e.getKey()) + "=\"" + encodeURIComponent(e.getValue()) + "\"")
                                .collect(Collectors.joining(", "));
  }

  /**
   * Set the Consumer Secret
   *
   * @param consumerSecret the Consumer Secret
   * @return this
   */
  public OAuth1AuthorizationHeaderBuilder withConsumerSecret(String consumerSecret) {
    this.consumerSecret = consumerSecret;
    return this;
  }

  /**
   * Set the requested HTTP method
   *
   * @param method the HTTP method you are requesting
   * @return this
   */
  public OAuth1AuthorizationHeaderBuilder withMethod(String method) {
    this.method = method;
    return this;
  }

  /**
   * Add a parameter to the be included when building the signature.
   *
   * @param name  the parameter name
   * @param value the parameter value
   * @return this
   */
  public OAuth1AuthorizationHeaderBuilder withParameter(String name, String value) {
    parameters.put(name, value);
    return this;
  }

  /**
   * Set the OAuth Token Secret
   *
   * @param tokenSecret the OAuth Token Secret
   * @return this
   */
  public OAuth1AuthorizationHeaderBuilder withTokenSecret(String tokenSecret) {
    this.tokenSecret = tokenSecret;
    return this;
  }

  /**
   * Set the requested URL in the builder.
   *
   * @param url the URL you are requesting
   * @return this
   */
  public OAuth1AuthorizationHeaderBuilder withURL(String url) {
    this.url = url;
    return this;
  }

  private String generateSignature(String secret, String message) {
    try {
      byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
      Mac mac = Mac.getInstance("HmacSHA1");
      mac.init(new SecretKeySpec(bytes, "HmacSHA1"));
      byte[] result = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
      return Base64.getEncoder().encodeToString(result);
    } catch (InvalidKeyException | NoSuchAlgorithmException e) {
      throw new RuntimeException(e);
    }
  }
}
```

This code is a simple builder that collects the values for each piece of the OAuth v1 `request_token` endpoint and builds and signs the header value. This class can actually be used for any OAuth v1 compliant identity provider, not just Twitter.

{% include _advice-get-started.html intro="If you are looking for a solution that handles all your login and registration needs, including social logins, FusionAuth has you covered." %}
