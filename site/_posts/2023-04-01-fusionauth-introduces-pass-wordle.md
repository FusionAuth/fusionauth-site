---
layout: blog-post
title: FusionAuth announces Pass-wordle&trade;
description: Login gamified.
author: Emily Jansen
image: blogs/pass-wordle/fusionauth-pass-wordle-header-image.png
category: article
tags: passwords gamification
excerpt_separator: "<!--more-->"
---

FusionAuth is proud to announce the next big thing in end user authentication. 
<!--more-->

## Passwords suck

Standards body, such as NIST, no longer recommend using complex password rules as a means to increase password security. 

> Many attacks associated with the use of passwords are not affected by password complexity and length.
> 
> &#45; NIST Digital Identity Guidelines [Appendix A](https://pages.nist.gov/800-63-3/sp800-63b.html#a1-introduction) - Strength of Memorized Secrets,

Despite this reality, it is still common to find these outdated rules enforced by many websites. This isn't the 90's, and it's time to stop treating your users like children that need to be told what to do.

Users are cool, but passwords suck. There has to be a better way.

## The solution

Three words. Password Gamification. 

Through our extensive research, we observed that most users kinda remember their password – they just forget parts of it. Like…did it end with their mom’s birthday, the zip code of their first apartment, or their dog's name?

Because of this forgetful behavior, users just end up resetting their passwords on a regular basis.

This led us to a real breakthrough. Why make a user reset their password at all? Especially when they already know part of it, or could guess it if you gave them a hint.

We call it Pass-wordle&trade;. Passwords, gamified.

With this new technology, when someone forgets their password, it’s no biggie. No support desk or password reset emails are required. Pass-wordle&trade; login allows your users to skip all of the traditional hoop jumping and offers a self-service option.

This new gamified experience lets a user guess their password and and optionally receive hints in the form of colored squares. These hints let the user know when they have guessed incorrectly, or when they are on the right track. To increase the stakes, the user is locked out for the day if they exceed 5 guesses without correctly entering their password. In our user testing, this feature really helped increase the anxiety during login, proving to be a huge leap forward in password technology.

Similar to the familiar idea of FOMO, or fear of missing out. We have coined the term FOBLO, or fear of being locked out. We can’t take total credit for this idea, we found the inspiration for this feature after watching Squid Games.

# Using Pass-wordle&trade;

Adding Pass-wordle&trade; is incredibly easy because we’ve enabled it by default, and you can’t disable it. Here is what it will look like for your end users when logging in with Pass-wordle&trade;.

{% include _image.liquid src="/assets/img/blogs/pass-wordle/fusionauth-pass-wordle-login.png" alt="Login example" style="width: 325px; margin-left: 25%; margin-top: 25px; margin-bottom: 25px; border-radius: 15px;" class="img-fluid" figure=false %}

Users will also see a color-coded legend of squares to help them.

- 🟩 The character is in the password and is in the correct location
- ⬜ The digit is not in the password
- 🟨 The character is in the password but is not in the correct location

“Everyone is always talking about friction as if it is a bad thing. I’ve only been working here for a few months, but I’m pretty sure the best thing we can do enhance user security is to add more friction. Hackers don’t want to spend 30 minutes solving a Wordle… well, unless they like playing Wordle.” said Andy Pai, VP of product delivery.


# What ~~others~~ we are saying about it

We’ve been “dogfooding” it at FusionAuth for a few months to gain employee feedback on the user experience and security enhancements. 

Here is what our employees have had to say about it.

> “The exhilaration of guessing your password without locking your account is super fun. I spent 45 minutes logging in this morning - being super careful not to use up my guesses too quickly. It was great.”
>
> &#45; Brent Halsey, staff software engineer

&nbsp;

> “Who likes having to read the post-it note under your keyboard to log in every morning? I used to dread having to log into my bank account. Or, I did… until now!!”
> 
> &#45; Josh O’Bannon, lead customer support engineer

&nbsp;

> “Logging in has me feeling like a kid in a candy store, except the candy is passwords and the store is a login form. Admittedly the metaphor kind of breaks down.”
> 
> &#45; Blair Ewalt, marketing manager

&nbsp;

When asked how this new technology will affect the industry, Daniel DeGroff emphatically stated, “We are really onto something here, and likely only scratching the surface. There are likely social gaming applications to this technology. In fact, we are currently in discussions with a major New York newspaper to license the technology.”


# What's next

According to the founder and CEO of FusionAuth, Brian Pontarelli, the team is already hard at work on the next evolution of the Pass-wordle&trade; technology.

The new version will dramatically reduce the complexity of user authentication by extending the Pass-wordle&trade; technology and creating a single, shared password for every user every 24 hours.

“We will call it Universal Synchronized Authentication, or USA. This is the future of authentication. Everyone wants to eliminate passwords, and this is basically that.” said CEO, Brian Pontarelli.

By taking this brave next step into the gamification of the login process, we really think users are going to feel part of a larger community as they collectively guess the password of the day.

Your users can have a lot of fun with their friends if they guess the password before they do.

For example, they can withdraw money from their bank account, delete their Netflix subscription, or send funny photos to their relatives using their email accounts. Pass-wordle&trade; is just about having fun; we think you’re going to love it. 

We even have a Twitter integration so your users can share it with their friends when they’ve correctly solved their Pass-wordle&trade;

## Summary

While adding friction to the login process is generally discouraged, we think users will appreciate the warm sensation they get from the friction added with our new product. Once your users experience it, they may find themselves wanting to log in multiple times a day.

&nbsp;

{% include _image.liquid src="/assets/img/blogs/pass-wordle/fusionauth-pass-wordle-footer.png" alt="April Fools!" class="img-fluid" figure=false %}
