---
layout: blog-post
title: ! 'Disclosure conference report: a good time was had by all'
description: Disclosure is an annual security conference. I attended and brought back this report.
author: Dan Moore
image: blogs/theming-advanced-forms/how-to-theme-fusionauths-advanced-registration-forms.png
category: blog
excerpt_separator: "<!--more-->"
---

Disclosure is an annual, vendor agnostic security conference. I attended the 2020 incarnation and wanted to share my experience. 

<!--more-->

Here's the [agenda for the 2020 conference](https://www.disclosureconference.com/#agenda). All the videos are available on [youtube](https://www.youtube.com/playlist?list=PLshTZo9V1-aF-rS-TyCYgApAEAQI4q2qe).

There were two tracks; one for developers and one for security folks. Being a developer, I watched videos on the former track.

## Online conferences are a bit different

This was an entirely online conference. This was my first one, so I was curious how it would work. 

The platform was, as far as I can tell, [MeetingPlay](https://www.meetingplay.com/). There were virtual rooms for each talk.

### Videos

Each speaker pre-recorded their presentation but was present during the session to interact with the audience. There was no question and answer session at the end, instead it happened while the video played.

Video playback was solid. I had a few times when a video froze but there was an easy button to push which brought it back online. 

If you were watching in real time you couldn't rewind or pause the videos. If you left the "room" and came back, it didn't pick back up from when you left. So it felt like a real conference; you wouldn't expect a speaker to stop talking when you left a conference room.

### Human to human interaction

There were a number of means to interact with speakers and other attendees.

* You could tweet (and [I did](https://twitter.com/search?q=%23disclosureconference%20(from%3Amooreds)&src=typed_query), as [did others](https://twitter.com/search?q=%23disclosureconference&src=typed_query)). All tweets could be seen from within the conference website. 
* You could publicly ask the speaker questions. I asked a few and the speakers were very responsive.
* There was a chat for each session. If you "checked in" to the session, you could see it. "Checking in" required you to push a button. In my mind it was analogous to sitting down in a conference room. (At every conference I've ever attended, some people sit down and others hover around the door, unsure if they want to stay.) There were some witty or informative messages, but it didn't get out of hand. There were only two levels of comments; a comment and one level of replies. You also had a like button. 
* You could directly message attendees. This seems like it was supposed to encourage random conversations, which are valuable at in-person conferences. With this feature, you could see if someone was online. I tried direct chatting two times during one of the breaks but neither person responded. 

There was also a networking form you filled out before the conference with your interests. The platform provided a list of people with similar ones. It seems like a good idea, but I wasn't able to connect to anyone. I didn't try very hard, though.

They also had session independent chat rooms. Some of the chat rooms were sponsored. I didn't head into any of those, figuring they'd be like a booth at a conference: only good to check out if you're interested in the company, their offerings, or their swag.

There were also a couple of general chat rooms, one for each track. I stuck my head in the developer chat room a few times, but the conversation was minimal, less than twenty messages for the entire day.

Since this was my first synchronous, one hundred percent online conference, I was unsure about how interactions would work. I thought they did a pretty good job providing some of the serendipity and conversation at which meatspace conferences excel. 

## The talks I attended

Ah, the content. I'm not going to break down everything for you, as you can watch the videos and see the talks for yourself. Instead, I'll post my top takeaways.

First up was the keynote, ["Strategic Cyber Warfare: In Great Power Competition, Cybercraft > Kinetic War"](https://youtu.be/_k0MkJMHPi0) from [thegrugq](https://twitter.com/thegrugq). Takeaways:

* Statecraft will be joined by cybercraft as a way of accomplishing political goals. Cybercraft won't necessarily take out critical infrastructure, as that wastes its flexibility. Instead, it'll be one more tool along the spectrum of force, from "hugs to nuclear weapons."
* Cyber attacks can be undertaken by non state actors: "cyberpower now belongs to a k-pop band"
* Cybercraft is best used to sap the will of your enemy to fight. 
* The internet is more entwined with society than we think: "there are not two worlds". The internet and its myriad applications help people fulfill higher levels of Maslow's hierarchy.

Next I watched ["How Ops Work Made Me Better at AppSec"](https://youtu.be/lL7onCeIH0o) from [Breanne Boland](https://twitter.com/breanneboland). Thoughts:

* The reaction of a security team member learning about an issue is important. Don't freak out, or people won't talk to you in the future. 
* Both ops and appsec require you to bridge between desired behavior and people's actual behavior. 
* Having been an SRE, the speaker felt she could understand the tradeoffs and motivations of other employees interacting with the security team, since she'd been in their shoes.

Then, I watched most of ["How to Think About OAuth Security"](https://youtu.be/AwCt2-EHYik) from [Aaron Parecki](https://twitter.com/aaronpk). I arrived too late to see this as a live talk, though I noticed the speaker commenting in the chat even after the video finished. Takeaways:

* This was an overview of [what's new in OAuth 2.1](/blog/2020/04/15/whats-new-in-oauth-2-1), in a friendly video format.
* He used a great analogy for OAuth security. The access token is like a hotel key card; the holder of the keycard (the client) shouldn't care what is on the card, only what it allows access to.
* Another useful analogy the speaker made was that the OAuth back channel is like hand delivering a letter; you know exactly who received it. The OAuth front channel is like throwing a piece of paper over a wall to someone else. They may or may not have received what you sent.

After that talk, I attended ["Open Source Anti-Reconnaissance"](https://youtu.be/UaAMO1EZc7o) from [Vickie Li](https://twitter.com/vickieli7). Key points:

* Assuming attackers can't find your secrets is a bad idea, as many are just a google search away. 
* There are many resources attackers can use, such as [Google Hacking Database](https://www.exploit-db.com/google-hacking-database), [shodan.io](https://www.shodan.io/), and the [open S3 bucket search](https://buckets.grayhatwarfare.com/). But you can also use these resources to audit and secure your systems. 
* Many of these tools reveal information about your system without touching it directly. Beware what you post online.
* Shrink your attack surface as much as possible; this includes disabling [service banners](https://blog.shodan.io/what-is-a-banner/).

Next up, I attended ["Introduction to Public Key Cryptography"](https://youtu.be/G2gxsk_AlJo) from [Kelley Robinson](https://twitter.com/kelleyrobinson). Takeaways: 

* This was a great intro to cryptography, starting with Alice, Bob and Eve and ending with different types of public key cryptographic algorithms.
* Public key encryption allows people to communicate without trusting the other party.
* There are two main use cases for RSA encryption. The first is keeping a communication secret; if you encrypt something with a public key, only the owner of the private key can decrypt it. The second is proving you wrote a message; if you sign with a private key, anyone can verify that signature with your public key, proving you wrote it.
* Public key cryptography works a bit like mixing paint; it's (mostly) a one way trip. Trapdoor functions are easy to calculate going one way but difficult and time consuming to reverse. 
* Make sure you consider security beyond cryptography. [Key size doesn't matter if an attacker can hit you with a wrench](https://xkcd.com/538/).

Then, I checked out ["Lazy, Stupid and Unconcerned - Why You Are the Perfect Target"](https://youtu.be/Zu4zzfbvO_w) from [Rich Jones](https://gun.io). This wasn't so much a talk as a well rehearsed rant. Definitely one to share, as it was quite amusing. Takeaways:

* Target developers and their environments rather than well defended production environments.
* Developers don't have much security sense. They'll absolutely run random pieces of code they find on the internet and typically don't audit dependencies.
* Every developer everywhere will click on a Google calendar invite. 

Finally, I saw most of ["Blasting Browser Security with Extensions"](https://youtu.be/6jgBM8twUIQ) by [Micah Silverman](https://twitter.com/afitnerd). Takeaways:

* The speaker was able to build an extension and have it approved by the Chrome and FireFox web stores. This extension had permissions to take pretty scary actions, including replacing elements on a page, interacting with any page requested, reloading browser tabs, setting headers, and adding parameters to requests.
* It's disconcerting to see a floating head over slides in a video.
* Audit the code or at the very least the permissions before installing any browser extensions. 

And that was it for me for sessions. I unfortunately was unable to attend the closing keynote.

## Would attend again

In my opinion, the best part of a conference is undivided attention. Attendees aren't doing much else when in the conference room. Sure, they might be on their phone or computer, but the offsite location and money spent incline them to pay attention. Virtual conferences don't have those advantages and that focus is diminished; work is only a window flip away. 

That said, I think that the Disclosure conference wasn't easy to flip away from, because there was synchronous communication. It was definitely richer than watching a series of videos. While person to person interaction wasn't as rich as it would have been at an in-person conference, there was enough that it was worthwhile to be present.

One suggestion for the future would be to find a way to encourage person to person conversation. At in person conferences it often happens at the lunch table; I wonder if forced breakout rooms might work?

The topics varied in technical depth, but all delivered new information and perspective on security. I definitely enjoyed the higher level view offered by the keynote, as well as some of the hands on technical resources provided by other speakers.

I encourage you to check out the videos for a flavor of the conference and to attend next year, even if it is still virtual.
