---
layout: blog-post
title: Like your avatar? You can keep it.
description: FusionAuth can take advantage of your existing Gravatar account. No problem.
author: Daniel DeGroff
excerpt_separator: "<!--more-->"
categories: blog
tags:
- code
- gravatar
- java
- avatar
- programming
image: blogs/keep-avatar.jpg
---
Did you know that you can now bring your avatar with you when you log into FusionAuth?
[Gravatar](https://en.gravatar.com/ "Jump to Gravatar site") provides users with a globally recognized avatar. If you already have a Gravatar account then you don't need to do anything else, we've taken care of everything. For those without a Gravatar account you'll still see a randomly generated Gravatar. Everyone wins.
<!--more-->

Gravatar simply allow you to take your avatar everywhere you go. You create an account, register one or more email addresses and everywhere you use that email address that also supports Gravatar-boom, your avatar shows up.

If you're using FusionAuth, no coding is required. But if you're not - or you love coding and can't help yourself - by all means read on. Gravatar has some good integration examples, but if you want a Java snippet, here is a condensed version of what we've added to FusionAuth.

```java
public class Gravatar {
  public String getUrl(String email) {
    try {
      MessageDigest md5 = MessageDigest.getInstance("MD5");
      StringBuilder hash = new StringBuilder();
      for (byte b : md5.digest(email.trim().toLowerCase().getBytes(StandardCharsets.UTF_8))) {
        hash.append(Integer.toHexString((b & 0xFF) | 0x100), 1, 3);
      }
      return "//www.gravatar.com/avatar/" + hash.toString() + "?d=identicon&amp;s=250";      
    } catch (NoSuchAlgorithmException e) {
      // No MD5? Buy a lottery ticket, it is your luck day. 
      throw new RuntimeException(e);
    }
  }
}
```

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.

<!--
- Products
- FusionAuth
-->
