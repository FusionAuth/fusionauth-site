---
layout: blog-post
title: How to Protect Your Organization From Auth Vendor Lock-in
description: When considering an auth provider, you should pick the best one for your current needs. But how can you avoid implementation pain if your needs change?
author: Cameron Pavey
image: blogs/vendor-lockin/how-to-protect-your-organization-from-auth-vendor-lock-in-header-image.png
category: blog
tags: conference-report
excerpt_separator: "<!--more-->"
---

Years ago your team decided to use a third-party auth system to avoid the time and cost of building one in-house. But now a better option has hit the market and you're wanting to make the switch. Except, hold on, your old system is so deeply ingrained into your organization that you're practically locked-in to your current vendor.

<!--more-->

How can you avoid this? 

Two strategies that work are:

* Insulate your application
* Have a backup plan

_This blog post is an excerpt from [Avoiding Authentication System Lock-in](/learn/expert-advice/identity-basics/avoid-lockin/)._

## Insulate your application

When implementing an authentication system (and various other services provided by third-party vendors, such as storage), there is usually an integration involved. This integration requires writing code in your application to interact with the vendor's service.

It is usually a good idea to write this code so that the vendor is insulated away from your application code. Often, vendors will provide an SDK for interfacing with their service. By wrapping the usage of this SDK and abstracting it with a more generic interface, we can have greater control over how the vendor ties into our application.

If the vendor uses Open Standards as described above, this makes things easier. We can build an interface that describes how we would ideally like to interact with our authentication service and then implement this interface with a wrapper around the vendor's SDK. In the future, if things go south and we need to break away from the vendor, we can just re-implement this interface. We'll write an integration for a new provider, and with any luck (and plenty of testing), things will transition smoothly.

{% include _image.liquid src="/assets/img/advice/avoid-lockin/facade-diagram.jpg" alt="Diagram of Authentication Interface example." class="img-fluid" figure=false %}

As you can see in this simple diagram, by having your core services rely on a generic abstraction of an authentication system rather than a concrete implementation of one, you can retain the freedom to reimplement the interface. This allows you to switch to whatever provider you like. If you built a concrete dependency on one particular provider instead, you would have lots of refactoring and retesting to do when switching implementations. Naturally, even with a well-abstracted interface, you will still need thorough testing.

It's crucial to build integration tests around this kind of abstraction. Having integration tests in place to give you confidence in your abstraction and interface is always good, but especially so when there is the possibility of re-implementing the underlying code at some point. As long as the new implementation holds to the interface, you will have a good level of confidence that things are working as expected and that your application will continue to work after a migration.

## Have a backup plan

Generally, you don't implement one solution while actively planning to swap it out in the future. Because of this, it is easy to accidentally put on the proverbial blinders and only focus on what is right in front of you without seeing the bigger picture and the long-term ramifications of certain design decisions. 

This can lead to situations where implementations become too specific to the current vendor and are prohibitively expensive to change in the future. "If only we had known we were going to switch providers, we would have done things differently." Factoring in and budgeting for a Plan B or future migration can mitigate such tunnel vision.

This works by identifying an alternative solution - whether it be another provider or building it in-house - and keeping it in mind when designing things and makings decisions. You should work it into your project's future budget and just accept it as potentially necessary.

Sure, you hope never to invoke Plan B - and the cost it would entail. Still, if you built everything with this eventuality in mind, your decision-making process is likely to be more deliberative and ultimately less tightly coupled to your chosen vendor. Factoring in the potential resource cost will also help you avoid ending up in a position where you must migrate but don't have the budget. 

This is a similar principle to the test-first mindset. If you write your code with testing as a foremost concern, the output will likely be different - and more testable by nature - than if you conducted testing as an afterthought. Making architectural decisions while mindfully being aware of possible future migrations can lead to more robust system design and easier migrations in the future.

To learn about other ways to avoid lock-in, including the benefit of open standards and portability considerations, read [Avoiding Authentication System Lock-in](/learn/expert-advice/identity-basics/avoid-lockin/).
