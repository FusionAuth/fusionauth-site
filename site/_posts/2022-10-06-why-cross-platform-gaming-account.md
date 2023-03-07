---
layout: blog-post
title: Why consider cross-platform gaming accounts?
description: What is a cross-platform gaming account and how is it useful?
author: Rabo James Bature
image: blogs/advantages-cross-platform-gaming-accounts/cross-platform-gaming-account-advantages.png
category: article
tags: gaming cross-platform
excerpt_separator: "<!--more-->"
---

More and more games are launching across two or more platforms. One of the prime reasons why game developers go cross-platform is to leverage a larger market. Being able to sell products to a whole new set of users is an incredible win for game developers, and demand for cross-play from gamers is [increasing as well](https://blog.unity.com/games/why-demand-for-cross-platform-multiplayer-games-is-growing-2021).

<!--more-->

Having a cross-platform gaming account enables users to play games on different platforms while syncing their progress as they switch platforms or consoles.

In this post, you’ll be introduced to cross-platform gaming accounts and why they're so useful.

_This blog post is an excerpt from [Cross-Platform Gaming Accounts: Why and How?](/learn/expert-advice/gaming-entertainment/cross-platform-game-accounts)._

## What Is a Cross-Platform Gaming Account?

A few years ago, one of the major challenges of digital gaming was platform independence and compatibility issues between gaming platforms. For example, PlayStation players couldn’t play with Xbox players, meaning that friends couldn’t play together because their systems didn’t interoperate or because there was no mechanism to abstract away their hardware and allow cross-play. Players, fans, and game developers all wanted a method where games could be accessed and played regardless of the hardware used.

Advancements in technology and shifts in the gaming community have made cross-platform gaming not only possible, but far more common. One way this is achieved is by using *cross-platform accounts*, in which an auth server stores all account data (including progress, level, and cosmetic skins) and authenticates a user.

## Advantages of Cross-Platform Accounts

Cross-platform accounts are a win for both sides of the game market. Gamers get even more playing opportunities without needing to buy multiple consoles, while game developers can increase their market reach.

This paradigm offers several advantages.

### Wider Range of Users

Game developers and publishers are leveraging cross-platform gaming accounts to develop a larger community of gamers across different platforms, because the console limitation is gradually fading away and games are becoming less exclusive.

### Cross-Platform Play

A cross-platform gaming account allows users to play a game on one platform with a particular console and then smoothly transfer to another platform or console. Not only does this enable gamers to save their progress no matter where they’re playing, but it allows them to play their favorite games without worrying about what platform they’re using. 

### Faster Delivery

If you launch a single-platform game, further down the line you may find yourself porting it and spending development days doing the work. It’s easier to have one single codebase that can run on multiple platforms. Apex Legends, for example, is one of the biggest modern games at around [115 million players per month](https://activeplayer.io/apex-legends-live-player-count-and-statistics/). Because it’s written in C/C++, it mostly works out of the box without requiring custom code for all its platforms (it currently runs on PC, PS5, Xbox One, and Nintendo Switch).

## Enabling Cross-Platform Play via Auth Servers

One of the major challenges of implementing cross-platform gaming is determining how to secure and transfer gamers’ accounts from one platform to another.

This is where an authentication server comes into play. Instead of relying on platform-specific gaming authentication mechanisms (like Google Play Games and PSN), you need to use a third-party authentication server to verify a gamer’s login credentials. The authentication server may delegate and link accounts across different game networks, through buttons stating “Log In With Nintendo” or API calls, but the auth server is what the users visit to authenticate. Once verified, you could share their game details such as progress, collectables, and more, directly to the platform that they are playing on.

To walk through how you can use FusionAuth for cross-platform gaming accounts, read [Cross-Platform Gaming Accounts: Why and How?](/learn/expert-advice/gaming-entertainment/cross-platform-game-accounts).
