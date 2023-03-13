---
layout: blog-post
title: Security and privacy risks when implementing an auth system
description: When implementing an auth system, what security concerns should be on your radar?
author: Rich Hickey
image: blogs/security-privacy-implementation-risks/security-and-privacy-risks-when-implementing-an-auth-system-header-image.png
category: article
tags: security privacy risks
excerpt_separator: "<!--more-->"
---

Given the increase of data beaches in the past few years, it's more important than ever for software engineering leaders to prioritize security, quality development practices, and robust governance controls. Your customers' trust is on the line—and that's the lifeblood of any business that wants to keep growing.

<!--more-->

_This blog post is an excerpt from [Common Authentication Implementation Risks and How to Mitigate Them](/learn/expert-advice/authentication/common-authentication-implementation-risks)._

Your authentication system is one of the areas of your software system that you absolutely have to ensure is secure. Not only could a poorly implemented authentication system cause a loss of customer trust, it could also have major implications for your company's finances, overall reputation, and regulatory compliance.

You need to make sure you're aware of the risks and properly mitigate them. While building your authentication system from scratch can give you more flexibility and control over the low-level details of user authentication, you are also potentially introducing more room for error. Depending on your need to have total control over the low-level details of the user login experience, using a third-party service could significantly reduce the risk of failing in these areas. Bonus, it can also speed up development.

Whether you choose to build it yourself or use a third-party service for auth, this article explores best practices for keeping yourself and your customers safe.

## Security and Privacy

[OWASP's list of top ten web application risks](https://owasp.org/www-project-top-ten) is a good place to start as you determine how best to defend your company against potential security risks. You need a plan for making sure these risks are avoided or, if encountered, fixed as soon as possible.

A major part of this plan should be to bake security controls directly into your software development process. This can come in many forms, such as:

- Automated code linting
- Static code analysis focused on security risks
- Periodic third-party penetration testing
- Code review
- Coding standards and conventions
- Security training
- Senior developers coaching less-experienced developers
- Pair programming

If your organization is compliant with one of the major security standards, like [SOC 2](https://www.imperva.com/learn/data-security/soc-2-compliance/), then you know that even seemingly insignificant elements of your organization—such as how your team shares code, automated code linting, and having clear coding standards—can impact your system's overall security. To avoid leaks, consider implementing some of the policies in the list above.

To learn about other risks including performance concerns, regulatory compliance, opportunity cost and more, read [Common Authentication Implementation Risks and How to Mitigate Them](/learn/expert-advice/authentication/common-authentication-implementation-risks).
