---
layout: blog-post
title: Stop Storing My Password in Plaintext
description: DO NOT store passwords in plaintext! Here's why it's a big deal that you should already know.
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories: blog
tags:
- Security
- Best Practices
- plaintext password
- multifactor authentication
- encryption
image: blogs/plain-text-offender-cu.png
---

Believe it or not there are still companies emailing users with plaintext passwords. Worse yet, some systems are storing plaintext passwords in the database. Storing or emailing plaintext passwords can increase security vulnerabilities by as much as 10x. Just freaking stop!
<!--more--> 

[CU Boulder](http://plaintextoffenders.com/post/140680242967/mycuboulderedu-university-seriously-a-premier "Jump to article about CU Boulder's Passwords"), a premier university, still emails their passwords in plaintext. Regardless of how complex a password is, if it is stored or emailed in plaintext, that password is easily accessible to anyone and security is compromised at a glance.

Bottom line. Do not store or email your passwords in plaintext. It’s a horrible idea. Here’s why:

## Storing plaintext passwords
- If the database is compromised, the hacker now has access to everyone's password. That means people who use the same password across sites are in jeopardy of having their bank accounts drained or their identities stolen.
- If there are vulnerabilities that would allow SQL injection, hackers don't even need access to the database server to get passwords.
- Database backups are also vulnerable. A hacker can now attack a backup server and get access to passwords.

## Emailing plaintext passwords
- Emails can be forwarded accidentally. This could mean a password might be leaked by a user that mistakenly forwards the email to their team or the whole company.
- Some email servers are not secure. Emails are stored plaintext on most email servers, so if a hacker gets access to the server, they can just run a script against the email database and find plaintext passwords.
- Emails are not always encrypted on the wire (when they are sent from your computer to the SMTP server or between SMTP relays). A simple packet sniffer can intercept emails and be trained to look for plaintext passwords. If you are sending emails from a hosting provider that supports multiple companies (like AWS or Rackspace), a hacker can put a packet sniffer on the same network and read your emails.
- Emails are not a direct communication. Emails bounce between servers on their way from your outbox to someone's inbox. Emails are rarely encrypted and therefore might be intercepted as they bounce around and are easily readable by a machine.

## Best practices
1. **Strong encryption** Passwords should always be hashed using a strong, one-way hash algorithm. In addition to using a hashing algorithm, you should also be salting the password and performing multiple hash passes. This will prevent brute force or lookup attacks on passwords. In the event that the user database is compromised, it will still be nearly impossible to reverse engineer a user password from the stored hash. Cryptographic hashes such as MD5, SHA-256 or even HMAC based SHA-256 should be avoided, instead prefer PBKDF2, bcrypt which are designed for password hashing.  
2. **Verification ID** Never email a plaintext password. If a user forgets or needs to change their password, send a link (with a random verification ID) that allows the user to securely change their password within a set time period. The company should never know the user's password.
3. **Multi-factor authentication** If the above fail and the password has been compromised, using MFA or 2FA adds an additional layer to keep the user account secure. Two-factor authentication enhances user login security by requiring something the user knows (password) with something the user possesses (their cellphone for example).
4. **Password invitations** If you are manually creating user accounts and need users to set their own passwords, avoid sending a random or temporary password via email. Instead send the user an email or push notification allowing them to set the password themselves.

## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, code based MFA, brute force login detection, password hashing, forgot password & email templates, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.

## Additional Resources

- [https://spod.cx/blog/emailing_passwords_bad_idea.shtml](https://spod.cx/blog/emailing_passwords_bad_idea.shtml "Jump to Spod.cx article")
- [http://plaintextoffenders.com/post/7006690494/whats-so-wrong-about-sending-a-new-password-in](http://plaintextoffenders.com/post/7006690494/whats-so-wrong-about-sending-a-new-password-in "Jump to Plaintext Offenders post")
- [**Developer’s Guide to the GDPR**](/blog/2019/01/29/white-paper-developers-guide-gdpr "Get the Developer's Guide to the GDPR")

<!--
- Technology
- Strategies
- FusionAuth
-->
