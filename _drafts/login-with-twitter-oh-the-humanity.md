---
layout: blog-post
title: What they don't tell you about Logging in with Twitter
description: FusionAuth makes logging in with Twitter easy
author: Daniel DeGroff
excerpt_separator: "<!--more-->"
categories: blog
tags:
- FusionAuth
- code
image: /blogs/login-with-twitter.png
---
When we built out our social login support in FusionAuth and added Login with Twitter to FusionAuth we were forced to navigate the harrowing path to signing our OAuth v1 requests to Twitter.

If you've ever done this in Java, you may know there isn't a great option off the shelf to make this easy, or if there is I was unable to find it. Since we had to do some heavy lifting, we decided to share our work with the Java community.

<!--more-->

## Following the Twitter Documentation

If you're building a Twitter login, you've likely been reading through the [Twitter documentation](https://developer.twitter.com/en/docs/twitter-for-websites/log-in-with-twitter/guides/implementing-sign-in-with-twitter.html
). 

If you can navigate their documentation, good on you, it is not for the faint of heart. 

The most difficult part of making the OAuth v1 requests is building the required signature.

## Example code

<!-- 
<script src="https://gist.github.com/robotdan/33f5834399b6b30fea2ae59e87823e1d.js"></script>
-->

Twitter provides the following documentation to [sign the request](https://developer.twitter.com/en/docs/basics/authentication/guides/creating-a-signature.html):


{:.text}
> &nbsp;
> &nbsp;
> These values need to be encoded into a single string which will be used later on. The process to build the string is very specific:
> &nbsp;
> &nbsp;
> 1. Percent encode every key and value that will be signed.
> 2. Sort the list of parameters alphabetically [1] by encoded key [2].
> 3. For each key/value pair:
> 4. Append the encoded key to the output string.
> 5. Append the ‘=’ character to the output string.
> 6. Append the encoded value to the output string.
> 7. If there are more key/value pairs remaining, append a ‘&’ character to the output string.

The first time I read this, I threw up in my mouth a little. I then went and read the OAuth Core 1.0 specification to ensure I understood the procedure. If you're interested, go read [section 9](https://oauth.net/core/1.0a/#signing_process) of [OAuth Core 1.0 Revision A](https://oauth.net/core/1.0a/)

To make my life easier, and hopefully some other fellow Java developers, I wrote an OAuth 1 signature builder that I could use to sign my requests to Twitter.

```java
String authorization = new OAuth1AuthorizationHeaderBuilder()
            .withMethod("POST")
            .withURL("https://api.twitter.com/oauth/access_token")
            .withConsumerSecret("twitter_consumer_secret")
            .withTokenSecret("token_secret")
            .withParameter("oauth_consumer_key", "twitter_consumer_key")
            .withParameter("oauth_token", "oauth_token")
            .build();

```

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

  public String generateSignature(String secret, String message) {
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
}
```

Find the source code on [Gist](https://gist.github.com/robotdan/33f5834399b6b30fea2ae59e87823e1d).

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.

<!--
- Technology
- Products
- FusionAuth
-->
