---
title: Common Authentication Implementation Risks And How To Mitigate Them
description: What are risks of implementing authentication, authorization and user management, and how can you mitigate them?
author: James Hickey
section: Authentication
tags: risks architecture security planning performance compliance speed-to-market vendor password-hashing open-standards privacy regulatory-compliance cost opportunity-cost integration features 
icon: /img/icons/common-authentication-risks.svg
darkIcon: /img/icons/common-authentication-risks-dark.svg
---

Given the increase of [data beaches in the past few years](https://haveibeenpwned.com/PwnedWebsites), it's more important than ever for software engineering leaders to prioritize security, quality development practices, and robust governance controls. Your customers' trust is on the line—and that's the lifeblood of any business that wants to keep growing.

Your authentication system is one of the areas of your software system that you absolutely have to ensure is secure. Not only could a poorly implemented authentication system cause a loss of customer trust, it could also have major implications for your company's finances, overall reputation, and regulatory compliance.

You need to make sure you're aware of the risks and properly mitigate them. While building your authentication system from scratch can give you more flexibility and control over the low-level details of user authentication, you are also potentially introducing more room for error. Depending on your need to have total control over the low-level details of the user login experience, using a third-party service could significantly reduce the risk of failing in these areas. Bonus, it can also speed up development.

Whether you choose to build it yourself or use a third-party service for auth, this article will help you explore some best practices for keeping yourself and your customers safe.

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

## Performance

There are [several considerations](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) to address in your auth system. These are the first lines of defense against attacks:

- Password strength
- Account lockout policy
- A strong modern hashing algorithm

Let's dive a bit into [password hashing](/articles/security/math-of-password-hashing-algorithms-entropy). Using a modern hashing algorithm is critical. If an individual password hash is leaked (via an SQL injection attack, for example) or perhaps even an entire database is stolen, then an attacker has the opportunity to try to figure out what the plain text passwords are. They can take a list of common or randomized passwords, hash each potential password, and see if the hashes match any in the database. Salting can help here, but not if they have the salt as well.

Consider the [difference between using a strong and weak algorithm](https://www.sjoerdlangkemper.nl/2016/05/25/iterative-password-hashing/):

> "If you use SHA1 to hash a password, an attacker can try 10,000,000,000 passwords per second on commodity hardware. If you use PBKDF2 with many iterations, an attacker can try 10 passwords per second. That makes a big difference when brute-forcing a password."

But wait! Let's look at password hashing from another angle. What if you're already using a very strong hashing algorithm? A strong hashing algorithm is more CPU intensive than a weak one. What would happen if an attacker flooded your login endpoint(s) with a ton of traffic? It's possible your servers wouldn't be able to handle the traffic, denying login to your users. Additionally, your cloud usage (and costs) would skyrocket as more login servers were required.

One way to mitigate this is to [implement rate limiting](https://cloud.google.com/solutions/rate-limiting-strategies-techniques). You might choose to limit requests per IP or per specific email address.

When you're building your own authentication system, prepare to handle these kinds of issues. Third-party services, on the other hand, have already put the hard work into tackling many of these security and performance-related considerations.

## Regulatory Compliance

I remember when [GDPR](https://en.wikipedia.org/wiki/General_Data_Protection_Regulation) had everyone panicking. The company I was working for spent a lot of time preparing their system: 
- New backup schedules
- New backup retention policies
- Extra data encryption measures
- Changes to password algorithms and work-factors
- Adding functionality to allow users to export their data
- Cookie banners
- Additional staff training

If you've had to deal with other kinds of regulatory compliance, then you know GDPR isn't the only standard that can make such broad strokes affecting an entire company or even an industry. SOC2, PCI, HIPAA, COPPA, and ISO are all standards that can put an additional burden on your software systems. This applies especially to your authentication system, as it holds private and sensitive user data that must be protected.

If you're building your own auth system, you might need to build additional functionality to meet such standards, like private information export features and advanced encryption measures.

Again, using a reputable third-party authentication service can take some of the load off. They already need to have a high standard of compliance since they're in the business of dealing with private information. For example, FusionAuth is [GDPR, HIPAA, and COPPA](/security-data-compliance) compliant. You don't need to worry about having to manage the compliance in your auth system with a reputable and compliant third-party vendor.

## Cost and Time

Don't forget to consider time when deciding how you want to go about adding an authentication component to a new or existing system. If your team either builds it all or integrates disparate open source libraries, how much time will that take? We all know that whatever your answer is, it'll take longer! 

As an engineering leader, you need to consider questions like these before you commit to an authentication approach:

- How many developers will be required to plan, develop, test, and deploy your auth system? 
- Do you have any experts or specialized developers who can make sure you don't miss addressing any risks? 
- What if the system goes down?
- Who will maintain it as needs change over time? 
- Are you ready to bear the burden of improving the scalability of your auth system when traffic to your system increases?

So, is it worth the work, time, and cost of building an auth system yourself? Careful consideration of the questions in the previous list, and the risks they expose, is a big reason why many companies will choose a third-party service for authentication. Authentication, after all, is usually not a business differentiator, so why spend your developers' time reinventing the wheel when someone else has already solved the problem for you?

## Integration and Features

When an organization grows to a certain point, and its software system increases in size commensurately, larger and more established clients will start asking for more advanced security features. They'll also ask for integration with other products.

How are you going to authenticate requests coming from other platforms? How will other platforms validate the requests you make to them? You'll need to implement standardized auth protocols like OAuth, OpenID, and SAML to perform such third-party integrations.

If your company has the time, money, and people to invest, and considers authentication as a core business domain/differentiator, then implementing these kinds of additional security features might be the best approach. But for the majority of us, that's not the case. A third-party solution can typically get you these more advanced features out of the box.

## Vendor Assessment

If you're considering using a third-party vendor, then you need to make sure you perform due diligence in [assessing how appropriate and risky that vendor is](/articles/identity-basics/due-diligence-authentication-vendors). Many regulatory programs like SOC2 require some kind of controls around vendor risk management.

While this article has already touched on areas of risk in implementing an auth system, like application security, financials, and performance, assessing a vendor is where the rubber meets the road. It's where you apply all your knowledge about risk in authentication implementation.

For example, you'll want to consider how coupled you'll become to a vendor's solution (otherwise known as [vendor lock-in](https://www.factioninc.com/blog/vendor-lock-in/)). You may want the freedom to replace a vendor in the future, perhaps having found a better auth service that's cheaper or supports a compliance program your current vendor does not. Does the vendor you are considering now make it easy or difficult to switch?

Broadly speaking, make sure you answer each of these questions before deciding to move forward with a vendor:

- Does this vendor meet required security standards like SOC2, HIPAA, or COPPA?
- Does this vendor perform regular penetration testing?
- Is there any risk of this vendor and its services affecting my organization's reputation?
- Is the cost of the vendor's service a potential financial risk?
- How does the vendor calculate pricing? Is it usage based, a flat fee, or something else?
- If our organization ever wanted to switch vendors, does this vendor offer some kind of data export functionality?

Of course, this is just a starting point. These questions bring up other fundamental questions like, "What is our threshold for considering a particular vendor's service as risky?" Your organization will have to answer that, and other subjective questions, based on your own risk tolerance, business agility, and company culture.

## Conclusion

Authentication is not simple. In this article alone, you've seen just how many areas affect and are affected by authentication: security, your organization's reputation, financials, project timelines, governance, and so much more.

Opting for a third-party service like FusionAuth to supply your authentication is a great way to focus your efforts on areas of your system that are true business differentiators. 

However, if you do decide to go with a third-party, remember to properly assess potential vendors. This crucial step will go a long way toward protecting you and your organization from an inappropriate vendor and the risks they may expose you to in the future. 

