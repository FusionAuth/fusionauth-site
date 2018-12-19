---
layout: blog-post
title: Stop Storing My Password in Plaintext
author: Brian Pontarelli
excerpt_separator: "<!--more-->"
categories:
- Technology
- Strategies
- Passport
tags:
- Security
- Best Practices
- plaintext password
- multifactor authentication
- encryption
---
<p>Believe it or not there are still companies emailing users with plaintext passwords. Worse yet, some systems are storing plaintext passwords in the database. <span style="font-weight: 400;">Storing or emailing plaintext passwords can increase security vulnerabilities by as much as 10x. </span></p>
<p><a href="http://plaintextoffenders.com/post/140680242967/mycuboulderedu-university-seriously-a-premier"><span style="font-weight: 400;">CU Boulder</span></a><span style="font-weight: 400;">, a premier university, still emails their passwords in plaintext. </span><span style="font-weight: 400;">Regardless of how complex a password is, if it is stored or emailed in plaintext, that password is easily accessible to anyone and security is compromised at a glance.</span></p>
<p><span style="font-weight: 400;">Bottom line. Do not store or email your passwords in plaintext. It’s a horrible idea. Here’s why: </span></p>
<h2><span style="font-weight: 400;">Storing plaintext passwords</span></h2>
<ul>
<li style="font-weight: 400;">
<span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;">If the database is compromised, the hacker now has access to everyone's password. That means people who use the same password across sites are in jeopardy of having their bank accounts drained or their identities stolen.</span></span></span></span> </li>
<li style="font-weight: 400;">
<span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;">If there are vulnerabilities that would allow SQL injection, hackers don't even need access to the database server to get passwords.</span></span></span></span> </li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Database backups are also vulnerable. A hacker can now attack a backup server and get access to passwords.</span></li>
</ul>
<h2><span style="font-weight: 400;">Emailing plaintext passwords</span></h2>
<ul>
<li style="font-weight: 400;">
<span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;">Emails can be forwarded accidentally. This could mean a password might be leaked by a user that mistakenly forwards the email to their team or the whole company.</span></span></span></span> </li>
<li style="font-weight: 400;">
<span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;">Some email servers aren't secure. Emails are stored plaintext on most email servers, so if a hacker gets access to the server, they can just run a script against the email database and find plaintext passwords.</span></span></span></span> </li>
<li style="font-weight: 400;">
<span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;">Emails aren't always encrypted on the wire (when they are sent from your computer to the SMTP server or between SMTP relays). A simple packet sniffer can intercept emails and be trained to look for plaintext passwords. If you are sending emails from a hosting provider that supports multiple companies (like AWS or Rackspace), a hacker can put a packet sniffer on the same network and read your emails.</span></span></span></span> </li>
<li style="font-weight: 400;"><span style="font-weight: 400;">Emails aren't a direct communication. Emails bounce between servers on their way from your outbox to someone's inbox. Emails are rarely encrypted and therefore might be intercepted as they bounce around and are easily readable by a machine.</span></li>
</ul>
<h2><span style="font-weight: 400;">Best practices </span></h2>
<ol>
<li>
<strong>Strong encryptions.</strong> <span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;">Passwords should always be hashed using a strong, one-way hash algorithm. In addition to using a hashing algorithm, you should also be salting the password and performing multiple hash passes. This will prevent brute force or lookup attacks on passwords. In the event that the user database is compromised, it will still be nearly impossible to reverse engineer a user password from the stored hash.</span></span></span></span> </li>
<li>
<strong>Verification ID. </strong><span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;">Never email a plaintext password. If a user forgets or needs to change their password, send a link (with a random verification ID) that allows the user to securely change their password within a set time period. The company should never know the user's password.</span></span></span></span> </li>
<li>
<strong>Multi-factor authentication.</strong> <span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;"><span style="font-weight: 400;">If the above fail and the password has been compromised, using MFA or 2FA keeps the user account secure. Two-factor authentication enhances user login security by requiring something the user knows (password) with something the user possesses (their cellphone for example).</span></span></span></span> </li>
<li>
<strong>Password invitations.</strong> <span style="font-weight: 400;"><span style="font-weight: 400;">If you are manually creating user accounts and need users to set their own passwords, avoid sending a random or temporary password via email. Instead send the user an email or push notification allowing them to set the password themselves.</span></span>
</li>
</ol>
<p><span style="font-weight: 400;">FusionAuth is a security company, focusing on identity and user management.  Our product, </span><a href="/products/identity-user-management"><span style="font-weight: 400;">FusionAuth</span></a><span style="font-weight: 400;"> ships with code based 2FA, brute force login detection, password hashing, forgot password, email templates and more. </span><span style="font-weight: 400;">See our free </span><b>Guide to User Data Security</b><span style="font-weight: 400;"> for more suggestions on <a href="/guides/2016-guide-to-user-data-security#password-security">Password Security</a>.</span></p>
<p><span style="font-weight: 400;">-------</span></p>
<p><em><span style="font-weight: 400;">Resources<br>
</span><a href="https://spod.cx/blog/emailing_passwords_bad_idea.shtml"><span style="font-weight: 400;">https://spod.cx/blog/emailing_passwords_bad_idea.shtml<br>
</span></a><a href="http://plaintextoffenders.com/post/7006690494/whats-so-wrong-about-sending-a-new-password-in"><span style="font-weight: 400;">http://plaintextoffenders.com/post/7006690494/whats-so-wrong-about-sending-a-new-password-in</span></a></em></p>
<p> </p>
