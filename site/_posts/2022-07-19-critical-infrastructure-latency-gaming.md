---
layout: blog-post
title: Critical infrastructure and latency in gaming
description: What is critical infrastructure and how does it affect gaming latency?
author: Kealan Parr
image: blogs/latency-critical-infrastructure/critical-infrastructure-latency-in-gaming.png
category: article
tags: gaming latency
excerpt_separator: "<!--more-->"
---

While esports competitions are high skill cap events, both hobby gamers and elite professionals alike expect optimal network conditions when they play games. A suboptimal network can turn an enjoyable event into an infuriating one that drives players away.

<!--more-->

With [tens of thousands of games](https://www.statista.com/statistics/552623/number-games-released-steam/) released annually, it’s important to keep your players happy, and that involves making the right technical decisions. This is even more important in professional tournaments, where [millions of dollars](https://www.esportsearnings.com/tournaments) are on the line.

One of the biggest decisions you’ll need to make is choosing between self-hosting critical infrastructure or using third-party [infrastructure-as-a-service](https://en.wikipedia.org/wiki/Infrastructure_as_a_service) (IaaS) or [software-as-a-service](https://en.wikipedia.org/wiki/Software_as_a_service) (SaaS) providers. What you choose will directly affect latency and playability for your end users.

This post will take a closer look at such critical infrastructure and latency.

_This blog post is an excerpt from [The Benefits of Self-Hosting Critical Infrastructure to Reduce Latency in Gaming](/learn/expert-advice/gaming-entertainment/benefits-self-hosting-reduce-latency)._

## What Is Critical Infrastructure?

Critical infrastructure is what’s essential for your system to run correctly, whether it’s virtual or physical. This includes:

- Servers that process game logic
- Servers that send data to other players (if multiplayer)
- Authentication servers responsible for login
- Servers that allow your game to be downloaded

All software systems are planned and developed with the idea of [redundancy](https://sg.atsg.net/blog/redundancy-in-cloud-computing-means-checking-four-areas), or ensuring your system can survive if services go down. But there are normally more important and less important parts to your system. For example, the part of your system that processes your game logic will likely be more critical than a store that allows users to change their cosmetic skins in-game.

The way you host this infrastructure will affect multiple aspects of your system:

- Its [availability](https://en.wikipedia.org/wiki/High_availability_software)
- Its ability to [recover from disaster](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)
- Its scalability

A key factor, though, is the latency of your network.

## Why Is Network Latency Important?

In order to ensure good gameplay, the critical infrastructure for your game needs to be hosted in a way that optimizes latency.

If your game is single-player, decreasing network latency won’t significantly increase the game’s quality. But many competitive games rely on fast reflexes. Genres like multiplayer shooters, [real-time strategy](https://en.wikipedia.org/wiki/Real-time_strategy) (RTS) games, and [multiplayer online battle arena](https://en.wikipedia.org/wiki/Multiplayer_online_battle_arena) (MOBA) games require their network latency to be as small as possible. The difference between winning and losing in these games can come down to milliseconds.

For example, professional esports teams worldwide are currently competing for the number one position in the Rocket League Championship Series, which boasts a [$6 million USD prize pool](https://esports.rocketleague.com/news/announcing-the-rlcs-202122-season/) for 2021-2022. However, Psyonix, the company behind Rocket League, has had issues with lag during past competitions. In 2021, a [lag spike](https://diamondlobby.com/tech-guides/how-to-fix-lag-spikes-on-pc) caused a player to [disconnect and concede a goal](https://www.ginx.tv/en/rocket-league/psyonix-lambasted-for-refusing-to-restart-rlcs-match-after-player-disconnected) during a game that decided which team would move into the finals—which is an incredibly high-stakes place to suffer this type of error.

As for shooter games, the community around Apex Legends has for years complained about the game’s [server tick rate being too low](https://www.ea.com/en-gb/games/apex-legends/news/servers-netcode-developer-deep-dive). This can lead to scenarios in which players are shooting opponents, but due to network latency, those opponents are in a different place and the bullets will not register. The player can’t do anything about it.

The network essentially needs to send data from the player to the server, and then on to their opponents. This becomes more difficult with geographically separate players. Because of this, some tournaments will only take place as [LAN](https://en.wikipedia.org/wiki/Local_area_network) events, such as world championships for the [Apex Legends Global Series](https://dotesports.com/apex-legends/news/apexs-2-5-million-algs-championship-lan-kicks-off-in-july). Most games do their best to match players located close together to stop this problem from happening.

To learn about more about hosting options, latency, and more, read [The Benefits of Self-Hosting Critical Infrastructure to Reduce Latency in Gaming](/learn/expert-advice/gaming-entertainment/benefits-self-hosting-reduce-latency).
