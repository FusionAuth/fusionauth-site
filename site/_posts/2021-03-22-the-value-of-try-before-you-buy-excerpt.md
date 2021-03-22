---
layout: blog-post
title: How to get the most out of a trial period
description: When you are trialing software, how can you make most effective use of this time?
author: Keanan Koppenhaver
image: blogs/scaling-auth-system/auth-specific-scaling-challenges-header-image.png
category: blog
excerpt_separator: "<!--more-->"
---
When you're evaluating authentication providers, one of the main building blocks of any software product, you want to make sure you won't regret your choice a few months or years later. 

<!--more-->

It's not enough to simply have a free trial of a potential authentication solution. For your trial to be useful, you need to run it effectively in order to be sure that you've tested for all of your potential use cases and gotten all the information you need to make a more informed decision.

What are steps you can take to make sure you maximize the knowledge you gain and minimize your time and monetary investment?

_This blog post is an excerpt from [The Value of Trying Your Auth Provider Before You Commit](/learn/expert-advice/identity-basics/try-before-you-buy/)._

### Decide What You Need to Learn

You might not be able to answer every single one of your questions during the free trial period, so it's important to prioritize what you're hoping to learn during your free trial and then work on answering those questions first.

For example, if you have a web application as well as iOS and Android apps and they all need authentication, does the provider you're trying out allow you to use the same platform across all three of these applications? Is one of them going to be more difficult to support than the others? 

If this is what's most important to your product team, it's important that you have a solid answer to this question to make the most of your free trial.

### Set a Realistic Timeline

Free trials vary in length, usually from around seven to thirty days. However, if you're scoping out a complex integration, a thirty-day trial may not be enough to truly evaluate the product and see whether it's going to work for you.

Some options, like self-hosted FusionAuth, are free to run forever. Even if this is the case, setting a deadline can be a forcing function to ensure that a decision is actually made. 

It's important to be realistic. Try to work with the vendor to get an extended trial if you think you'll need it. You don't want to get to the end of your trial and find that your time and effort were wasted because you weren't able to answer your important questions about the product. Some vendors will be able to offer an extended trial if you ask.

Otherwise consider reducing your list of important questions to what you can reasonably verify in the allotted time or signing up for a paid plan with the internal understanding that you aren’t necessarily committing.

### Isolate Your Experiment

If you can, it's best to build out your trial prototype or run your experiments in an environment that's similar to your production environment but not _actually_ your production environment. This way, you're protected from any unintended consequences of your experiment affecting live customer data or causing bugs and unexpected behavior for customers trying to use your application, but you aren’t building a toy application which doesn’t fully exercise the features you need.

If you don't already have a QA environment, this can be a great chance to create one. And even if you don't want to spin up a new environment, you can have someone on the development team run the experiments in their local environment to make sure you can verify all the necessary functionalities.

To learn about the value of trying an auth provider before you buy, read [The Value of Trying Your Auth Provider Before You Commit](/learn/expert-advice/identity-basics/try-before-you-buy/).
