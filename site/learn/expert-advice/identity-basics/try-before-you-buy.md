---
layout: advice
title: The Value of Trying Your Auth Provider Before You Commit
description: What are the benefits of trying an auth system provider before you integrate?
author: Keanan Koppenhaver
image: advice/try-before-you-buy/expert-advice-the-value-of-trying-your-auth-provider-before-you-commit-header-image.png
category: Identity Basics
date: 2021-02-24
dateModified: 2021-02-24
---

Sometimes, despite a salesperson overcoming all your concerns or a landing page perfectly crafted to speak your language in every bullet point, there's a lingering fear that the product you're looking at just might not be what you're looking for. Everyone has experienced buyer's remorse at some point in their life, and most people I know don't want to go through it again.

So what's the only way to know if you'll truly love a product? Trying it risk-free at no monetary cost to you.

This holds especially true for larger or more long-term purchases. When you're evaluating authentication providers, one of the main building blocks of any software product, you want to make sure you won't regret your choice a few months or years later.

Choosing incorrectly could mean a major rewrite of your application logic. Getting months down the road only to realize that a particular provider can't support all your use cases can really kill developer momentum.

## Advantages of Trying an Auth Provider Before You Buy

Trying your authentication provider before you commit can save you lots of headaches in the future and should be an important part of choosing an authentication partner.

Offering a free trial is an increasingly common practice among authentication providers, but if there's no trial option listed publicly, you should ask a salesperson if it's an option. If there still isn't a way to experiment with an auth system before you pick it, you may want to consider working with a different partner. There are many reasons you want to try before you commit, but let's go over a few of the more important ones.

### Your Developers Can Test the API

When making any significant purchase that your development team will use as part of their daily work, it's important to know that your developers can work with it and use it in ways that will benefit the product long term.

If the developers start testing a potential API and they find they can build a relatively simple prototype to prove the API can support all your use cases, then you can be confident that a larger-scale implementation will work as well. Not only will this give you more confidence that the product you're buying is the right one for your business, it will also help your developers work more quickly when they do move to a larger-scale implementation because they will already have experience working with the API.

For example, you may be looking at a few different authentication providers and have one that you've decided is the best candidate for your application. After all, it checks all the boxes! But when your developers start reading the documentation and actually build out a small prototype, they may find the library for your application's language doesn't support [passwordless authentication](/docs/v1/tech/guides/passwordless/). If you had committed to this authentication provider before discovering this, you might have already heavily integrated it into your application—which needs passwordless authentication.

This would be a huge problem leading to a major rewrite or possibly having to drop a key feature of your app. However, if you had built a prototype using a free trial and discovered this limitation ahead of time, you could have simply moved on to choosing a different provider.

### Better Understanding of Costs

Many API-based products such as authentication providers are usage-based, which means as your usage increases, the pricing changes. While looking at the pricing table may have you convinced that you'll be on a free or low-cost plan, actually building out a prototype might reveal otherwise.

There are all sorts of potential hidden costs that you may not have considered from just thinking about your application at a high level. Knowing what this product costs on average for other companies of your scale is helpful.

For example, if you're working with an authentication provider that charges you on a per-authentication basis, you might take a look at your users and how active they are, and estimate how many people will be authenticating every month. With this math, you might conclude that you're well under the threshold for the authentication provider's free plan.

But when you build a prototype, you might notice that every incorrect password attempt counts as authentication, demonstrating that your previous estimates might be severely different from what you should expect for actual usage. You might learn that multiple connections to enterprise identity stores, such as SAML IdPs, cost an arm and a leg.

Catching surprises like this during a free trial can help you understand how to factor your costs correctly, as opposed to finding out when your integration is already in production. It allows your development team a chance to think up different ways to architect your solution to fit within these constraints, or even choose a different provider if a workaround or change in architecture isn't going to be possible.

### Developer Buy-In

Any new initiative will move faster and more efficiently if the whole team is on the same page and giving the new integration their full effort.

Developers can be a particularly stubborn group when it comes to efforts like this. However, using a trial period to give even the most resistant developer time to use the proposed solution and discover any necessary workarounds or implementation details will make an eventual integration with your application easier. It can also reveal the strengths of the solution; you may be pleasantly surprised. 

And if the development team is split as to which solution they think is best, a free trial like this can help opinions converge around the best solution in practice, rather than wasting time on arguments of opinion. One common attempt to resolve a split between solutions is to just have more demo meetings from vendors and opinion-charged internal meetings. This often leads to frustration and the vendor selection process stalling out all together.

As an alternative, consider dividing the development team based on who backs which solution and having each side develop a small prototype to demo to the team. This will quickly bring to light any challenges with one solution or the other and allow for much more productive conversations after the trial is over.

## Running an Effective Trial

It's not enough to simply have a free trial of a potential authentication solution. For your trial to be useful, you need to run it effectively in order to be sure that you've tested for all of your potential use cases and gotten all the information you need to make a more informed decision.

### Decide What You Need to Learn

You might not be able to answer every single one of your questions during the free trial period, so it's important to prioritize what you're hoping to learn during your free trial and then work on answering those questions first.

For example, if you have a web application as well as iOS and Android apps and they all need authentication, does the provider you're trying out allow you to use the same platform across all three of these applications? Is one of them going to be more difficult to support than the others? 

If this is what's most important to your product team, it's important that you have a solid answer to this question to make the most of your free trial.

### Set a Realistic Timeline

Free trials vary in length, usually from around seven to thirty days. However, if you're scoping out a complex integration, a thirty-day trial may not be enough to truly evaluate the product and see whether it's going to work for you.

Some options, like self hosted FusionAuth, are free to run forever. Even if this is the case, setting a deadline can be a forcing function to ensure that a decision is actually made. 

It's important to be realistic. Try to work with the vendor to get an extended trial if you think you'll need it. You don't want to get to the end of your trial and find that your time and effort were wasted because you weren't able to answer your important questions about the product. Some vendors will be able to offer an extended trial if you ask.

Otherwise consider reducing your list of important questions to what you can reasonably verify in the allotted time or signing up for a paid plan with the internal understanding that you aren't necessarily committing.

### Isolate Your Experiment

If you can, it's best to build out your trial prototype or run your experiments in an environment that's similar to your production environment but not _actually_ your production environment. This way, you're protected from any unintended consequences of your experiment affecting live customer data or causing bugs and unexpected behavior for customers trying to use your application, but you aren't building a toy application which doesn't fully exercise the features you need.

If you don't already have a QA environment, this can be a great chance to create one. And even if you don't want to spin up a new environment, you can have someone on the development team run the experiments in their local environment to make sure you can verify all the necessary functionalities.

## Free Trials Are Important

Trying a full version of an authentication provider that you're considering is a very important step in making a final purchasing decision. Because authentication is a crucial component of any application, it's not a decision you want to be forced to reverse down the road. That would not only be costly in terms of dollars but also in developer time that could be spent working on new features for your product.

If you're looking for an authentication provider you can get running in five minutes with an unlimited free plan, check out and download [FusionAuth](https://fusionauth.io/download/).
