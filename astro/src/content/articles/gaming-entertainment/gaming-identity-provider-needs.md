---
title: Identity Provider Needs For Gaming Or Esports
description: What are the specific features you need to look for in an identity provider if you’re in the gaming or esports industry?
author: Deborah Ruck
section: Gaming & Entertainment
icon: /img/icons/identity-provider-gaming-esports.svg
darkIcon: /img/icons/identity-provider-gaming-esports-dark.svg
# date: 2022-03-15
# dateModified: 2022-03-15
---

An **identity provider** is a trusted third-party service that offers user authentication as a service to create, manage, and verify digital identities on behalf of an affiliated (subscribing) website, application, or digital service provider. If you’ve used the sign-in with Google, Facebook, or Twitch option when registering for a service, you’ve used an identity provider. 

There are several reasons for using an identity provider, the main one being the ability to outsource the responsibility of authorization and authentication to a trusted third-party specializing in this area. This makes compliance and security requirements painless and ensures that customer data is always protected. Many off-the-shelf identity solutions offer these features, but in the gaming and esports industry, that’s often not enough. 

In gaming and esports, an identity provider must meet some unique requirements. It must be able to handle issues like latency, availability, and scaling, as well as other features, such as linking player accounts across online gaming platforms. In this guide, we’ll discuss the specific features you need to look for in an identity provider if you’re in the gaming or esports industry.

## What Are the Special Needs in Gaming or Esports?

There are several unique needs for the gaming and esports industry. Here are a few noteworthy considerations:

* To deliver the real-time experiences players and spectators expect, low latency and high availability are vital at all levels of gaming, including user authentication and authorization. 
* Popular gaming platforms offer features that allow players to customize several aspects of a game. Your identity provider shouldn’t break your user experience and should offer features for customizing everything from login screens to error messages. 
* Most game companies can develop and deploy their own identity services, but in-house identity management solutions can be complex and expensive to develop. Using an identity provider can shorten development time and reduce the complexity of identity management. 
* In gaming and esports, integration with other gaming platforms goes a long way in simplifying the user login and registration process. External identity providers allow players to more easily log into your gaming platform using a password that is stored and managed by an external identity provider such as PSN or Twitch.  
* As a gaming platform or service grows in popularity, the number of players you need to support will also increase. You’ll need to ensure that your identity provider can support thousands of logins and registrations per second without end-user delays.
* With the many platforms, portals, launchers, and streaming services available, gamers typically have more online accounts than the average user. Being able to use one account across multiple platforms eliminates the frustration of having to go through an onboarding process every time you sign up with a new platform. 

Now, let’s dive a bit deeper and take a more detailed look at why each of these specific needs is important.

### Low Latency and High Availability

The gaming and esports industries are two of the few sectors that [experienced growth](https://www.wepc.com/news/video-game-statistics/) during the height of the COVID-19 pandemic. Platforms support hundreds of thousands of players and spectators from across the world. During new game launches and tournaments on streaming platforms like Twitch and Steam, these users are all attempting to log in at the same time.

Slow response times from authentication servers as users attempt to log in can cause timeouts and authentication errors, as well as delays in sending confirmation and reset password emails. This means latency and availability are critical factors when choosing an identity provider for the gaming and esports industry.

The level of latency will depend on the distance between players and your authentication servers. The further away a player is from your identity verification servers, the greater the latency. An identity provider that supports multi-region deployments lets you authenticate players from the region closest to them to keep latency at a minimum and ensure higher game availability. Another useful way to decrease latency is to self-host your identity provider on your own infrastructure, allowing you to leverage the same networking configuration from which your gaming code benefits. 

### Look and Feel Customization

Many popular games allow players to customize the appearance of their gaming persona, game content, and even the level of difficulty. Customization makes the gaming experience more realistic, connecting players to the game and bringing reality into fiction, giving the players control over what they want to do with their characters. Players get to inject their personality and identity into the game, resulting in a more immersive experience in the gaming world.  

A customized authentication flow can also improve the player’s experience. The user doesn’t need to know that authentication is being handled by a third-party service. Branding and customization features allow you to customize login and registration pages, “forgot password” screens, emails, and messages, giving users a more consistent and familiar experience. 

[Customization features](/platform/extensibility) can also include localization and multiple language support to help you adapt content for specific regions, as well as APIs that allow you to build additional tools on top of the core authentication system to meet custom business requirements. 

### Shorter Development Timelines

In-house identity management solutions can take months to develop and test and, if not done correctly, things can go wrong quickly. While game developers can create a home-grown identity solution, the industry is a prime target for hackers, phishers, and cheaters. Security and compliance requirements are always changing. 

Developers need to have sufficient expertise to build an airtight identity authentication system, and you need to have the financial and human resources to keep it up to date. Failing to protect player identity information can lead to loss of income, compliance penalties, and a diminished reputation. 

A flexible identity management solution that’s easy to implement shortens development time. It allows you to integrate fast and secure authentication without worrying about security risks. Seamless integration with your existing development ecosystem, comprehensive documentation, and developer support can help you implement your solution in no time at all, allowing your developers to focus on core game development.

### Special External Identity Providers

Gamers have to go through the onboarding process and create separate login credentials each time they sign up to a new platform. Authentication and account linking with third-party social networks and popular gaming platforms like PSN and Twitch allow players to authenticate using existing credentials. This is known as federated authentication. 

Federated authentication creates a system of trust between two parties (the main identity provider and the external identity provider) to authenticate users and relay the information needed to authorize the user’s access to resources. It allows you to delegate authentication to an [external identity provider](/docs/lifecycle/authenticate-users/identity-providers/) to simplify the user sign-in and registration process. 

The main identity provider requests user credentials from the external identity provider, which verifies the user and sends the verification information to the first system. This streamlines the player verification process, allowing players to use the same digital identity on multiple platforms to access games faster and easier. 

### High Scalability

Major gaming and esports events can result in hundreds of thousands of authentication requests, often causing players to experience lags and outages during the login process. Roadblocks like this can cause gamer frustration and lower conversion rates. Lack of scalability reduces player confidence in your platform, which may compel them to look for alternative gaming services.

Your identity provider should be able to scale to millions of users without slowing down. Scalable systems increase reliability, helping you to avoid outages during big game launches and to maintain continuous uptime during tournaments.

A flexible identity solution can easily handle dramatic spikes in resource demand. It should be able to scale as games and platforms increase in popularity so that you maintain a smooth customer experience even when demand spikes. Identity providers that support containerization and orchestration technologies like Docker and Kubernetes allow you to take advantage of [auto-scaling features](/platform/enterprise) to easily scale identity management to handle steady growth or spikes in demand. 

### Cross-Save or Cross-Progression Support 

With the increasing popularity of multiplayer games, players want to connect with and play against other users no matter what platform they use. This also means that they’ll want to port game content, assets, and progressions such as character levels and player statistics across platforms. 

Cross-save or cross-progression support allows players to save and access progress on any platform where they have purchased the game. This provides seamless access to unlocked game content and allows players to continue where they left off in the game even if they switch platforms. 

Identity provider features like federated authentication and single sign-on allow players to use one account across multiple gaming platforms. [Single sign-on](/features/single-sign-on)(SSO) allows users to use one set of credentials to log into multiple different gaming applications or websites, which differs from federated authentication in that the identity provider handles the authentication instead of delegating it to an external identity provider. 

## Summing Up

In this guide, we’ve covered some of the unique identity provider needs in the gaming and esports industry. A good identity solution can address the important issues in gaming, such as latency, scalability, and the ability to integrate easily with your existing systems for faster deployment.  

