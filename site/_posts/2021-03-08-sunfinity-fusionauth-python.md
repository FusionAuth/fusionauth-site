---
layout: blog-post
title: TBD
description: TBD
author: Dan Moore
image: blogs/softozor-fusionauth-story/softozor-integrated-fusionauth-with-hasura-and-kubernetes-and-saved-development-effort.png
category: blog
tags: topic-community-story topic-upgrade-homegrown
excerpt_separator: "<!--more-->"
---

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as CIO and a bit about what Sunfinity is up to.

**Matthew:** Sunfinity Renewable Energy is an industry leader in renewable energy solutions for residential, commercial and utility scale solar. My title as CIO, though accurate is a bit misleading. Sunfinity is medium sized operation whose needs for a large IT staff are not justified. As a small IT group my daily roles are more akin to Lead Architect, Server/Network Infrastructure Engineer and Lead Developer, though my CIO duties remain the priority. 

I share these roles with my friend and CTO Taylor Billingsley. Together we have not only integrated FusionAuth as our primary authentication platform but also built the network and server infrastructure, virtualization stack, data platforms, development workflows and a slew of custom Python/Angular applications to utilize the stack. The true meaning of "full stack".

We believe in open source or "free as in beer" when possible, and hosting everything (within reason) ourselves. This stack not only hosts 3rd party requirements like IT ticketing systems, asset management solutions, accounting software and CRM/ERP products but also our own custom web and CLI applications. These custom applications help our solar Operations and Sales teams perform their jobs better than the competition. Our build it all yourself and open or free licensing requirements are precisely what makes FusionAuth the perfect fit for Sunfinity's authentication platform.

**Dan:** Why is self hosting so important for you? Cost control? Privacy? Flexibility? Something else?

> We were up and running with a self-hosted FusionAuth in a day and haven't looked back since!

**Matthew:** Well I could go on and on about that question. Just ask my colleagues as their eyes glaze over. I suppose control is the best word as it also encompasses privacy and flexibility. Self hosting isn't for everyone and I never blindly recommend it as such. But if you have the skill, experience and desire to do so, I think it is a great way to go.  IT and Development in my personal career has always been about building everything yourself. I understand that is not everyone's experience in IT. I have had some colleagues from an acquisition who didn't share the same ideas and outsourced everything possible. It didn't take long to realize they chose that path because they had little to no skill or even knowledge of how to do it themselves. They had no confidence and wanted a cushion of blame to fall on. 

In the end what they really lost was control and tons of $$ and their systems are a disorganized wreck where no one really knows how the system is cobbled together. Obviously size of business and scope of project play a key role in deciding on self hosting or using an off the shelf solution. For all the small to medium sized businesses I have worked for, self hosting has been a huge win in control, productivity and cost. 

Also, it is SUPER FUN and unimaginably rewarding to build the infrastructure yourself.

**Dan:** Can you share a full or partial list of the off the shelf applications which FusionAuth is acting as an identity provider for? We love name dropping.

**Matthew:** Some of the names have been dropped elsewhere in the post but here are a few more. So far we have these apps integrated in one SSO fashion or another into FusionAuth: 

* Google GSuite
* OSTicket
* SnipeIT
* ERPNext
* SuiteCRM
* Nextcloud
* Gitlab 

And of course all of our own Angular/VueJS and Python apps.

> FusionAuth gave us the self-hosted identity provider we were always looking for.

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Matthew:** We use FusionAuth as our primary identity provider. All employee and customer user accounts are stored in FusionAuth. All 3rd party applications integrate with FusionAuth using some form of OAuth2, Social Login or SAML. All custom Angular SPA applications authenticate using OIDC and the returned JWT is passed to Kong to verify all API requests.

At the very beginning of Sunfinity we chose to adhere to a HTTPS REST API first microservice architecture. This means full REST APIs as standalone and independent units followed by uncoupled web, mobile and CLI clients/consumers. For this infrastructure we knew a single identity provider supporting authentication standards like OAuth2, SAML and OIDC was a must.

We utilize two external IPs. One for an Haproxy loadbalancer and one for a Kong API Gateway. All custom Angular apps and other 3rd party Python/PHP Web apps like ERPNext, OSTicket, SnipeIT, etc... are served by Haproxy which downstreams to a loadbalanced webfarm running Nginx. All custom Python APIs live on separate subdomains which point to the Kong API Gateway. 

Kong is responsible for JWT validation using FusionAuth's public key and determining how many separate backend APIs a single JWT has access to. Kong then loadbalances downstream requests to our webfarm running Nginx into our python APIs built on the new and amazing Python async Uvicore Framework. Because Kong performs validation, any request into the APIs is pre-validated; therefore Python does no JWT validation.

For our custom Angular SPAs we utilize FusionAuth OIDC Connect with [this angular library](https://github.com/manfredsteyer/angular-oauth2-oidc) to authenticate and receive a FusionAuth JWT. We then use the JWT to contact our own Python API `/userinfo` endpoint which matches the JWT "roles" to the APIs group/role table to produce a set of granular permission strings specific to that API. This "richer" `/userinfo` object is passed back to Angular so the UI can obey those granular permissions. Angular cares not for user groups or roles, only permissions. A single Angular SPA may interact with a dozen completely separate custom APIs (not endpoints, but separate python apps). It does so with a single FusionAuth JWT as Kong governs multi-API access via a single token.

For our 3rd party applications like Google, OSTicket, ERPNext, SnipeIT, NREL and others, we integrate SSO login however they allow. This is usually some type of Social Login, OAuth2 or SAML. Many of our Angular SPAs interact with these 3rd party APIs but we try not to do so directly, not just for auth complexity, but for abstraction. Angular shouldn't be "concerned" with a dozen 3rd party APIs to get data. 

Instead we create our own Python API proxy/passthrough/translation abstration layers. This means only Python, a server side codebase, interacts with 3rd party APIs and translates the required data into better models and validators before Angular sees the results. This abstraction allows us to swap 3rd party "backend sources" without any changes to our Angular code base.

> We love FusionAuth not just for the product but for the team.

**Dan:** How do you map between the roles in FusionAuth and the permissions derived from the roles in the python API? What is an example of this?

First thing many people ask is WHY? Why aren't the roles in a JWT enough? Because they are not low level enough to control code in a way where code never has to change again. 

An example: you have a role in FusionAuth called `post_manager`. You have an API, and an Angular Frontend. Both front and back permission logic MUST be the same. So for both apps, what does `post_manager` mean? Can they edit a post? Can they delete and rename, etc...? If `post_manager` is all you have then the logic of "WHAT" they can do must be coded in both apps directly. If `post_manager` means "show edit button" (or in the API, "allow edit of a post"), fine, that works. 

But two months later you may decide `post_manager` should NOT be able to delete posts. The only way to make this change is edit both sources of code and update both to match and redeploy. Not so bad, but not very flexible. If you instead built granular permission strings like `post_create`, `post_edit`, `post_delete`, `post_rename` etc... then used those strings in your source code `if` statements, the code would never need to change again.

Let's continue the example. The FusionAuth role is still `post_manager`. When Angular uses OIDC to login to FusionAuth it gets a JWT with `roles['post_manager', '...']`. Angular then queries the backend API, one time directly after the login to FusionAuth. A backend endpoint I call `/userinfo`. The API sees the same FusionAuth JWT with the `post_manager` role. It queries its own `groups` or `roles` table and finds a matching role then `JOINS` the `role_permission` table which has actual app specific permission strings attached to that role. 

This query is basically "filling out" the JWT with further app specific information. The JSON blob returned from that `/userinfo` endpoint has everything the JWT has, but also more user data and an array of `permissions`: `['post_edit', 'post_create', 'post_rename']`. So Angular receives that `userinfo` blob (one time, only on login) and stores it in session storage. All Angular code to hide/show pages and buttons is strictly using those permission strings, not roles, not groups. 

In fact I never query "has this group" or "has this role" ever as those are subject to change. Permissions are constants and never change.  On the backend API side, the JWT is still the only thing ever passed (since it is tamper proof). On every API hit, it uses the JWT to do the same thing, derive the actual permissions (cached in redis for speed of course). So the API code itself is also strictly obeying the permission strings only, never roles or groups.

And if you think about separation of concerns, this is the right way to do it. Something I think, "should I store actual permissions in FusionAuth?". The answer is "no". Because those are app specific details. 

FusionAuth is not "concerned" about app specific details. FusionAuth is only concerned about global auth details like apps, users and groups/roles. Adding actual permissions to FusionAuth would allow you to control every detail of every app from one interface but the JWT would be huge (hundreds of permission strings) and you would be mixing concerns.

There is however a deeper issue even with roles in FusionAuth which would be hard for me to go into. It has to do with one Angular app querying multiple backends. Roles are per app but the JWT from a single login has roles for a single app. This means the roles returned must encompass all roles for each of the multiple backends that single JWT is allowed to access. 

So even roles start to look rather lengthy. A quick example, you have three APIs: crm, wiki, blog. You have one Angular app called Dashboard that needs to access all three backends. The user may be an admin of the CRM, but a simple user of the wiki and blog. So you have a Dashboard app in FusionAuth. Angular logs in via OIDC to the Dahsboard FusionAuth app returning a single JWT. That JWT must have enough roles in it to govern that user's permission to all three backends. Roles now must be prefixed like so.

```
roles = [
  'crm.admin',
  'wiki.user',
  'blog.read_only'
]
```

When Angular logs in first time, it calls all three `/userinfo` endpoints. Those backends look at only their prefixed roles and match up the proper permission strings. In the end, Angular's session storage has three userinfo JSON blobs, one for each backend and each with unique permission strings based on CRM admin, Wiki User and Blog Read Only roles. This works great but it causes roles to grow large and complex spanning multiple backends.

A solution to this problem is to not use roles at all, but instead use groups. Unfortunately there is no way to add group names to the JWT as noted in [this github issue](https://github.com/FusionAuth/fusionauth-issues/issues/229). Since I cannot get groups in the JWT, I could mock up each apps roles to be exactly like groups. Or skip groups in FusionAuth altogether and mimic roles to be groups. 

How does this work better? Because groups are a constant identity across all apps. You are always an 'Operations Manager' regardless of which app you are logging into. This lets each app (backend) control what an 'Operations Manager' can do itself, leaving FusionAuth out of the role details. Lets say in the same Dashboard example, I mimic the JWT roles to be something like this:

```
roles (which are groups now) = [
  'Employee',
  'Manager',
  'Operations Manager',
]
```

Angular logs in, gets the single JWT containing those new roles, named like groups. Angular still calls all three `/userinfo` endpoints and still gets three JSON blobs for each app containing detailed permissions. But the API is treating these like groups not roles. This means FusionAuth is not governing the lower level roles but the higher level groups. 

The leaves lower level group->role->permission mapping up to the API. The API now matches those JWT roles up to its `group` table, not its lower level `roles` table. Now the CRM can easily say 'Operations Manager' is like an admin. The Wiki can say 'Operations Manager' is like a regular user. The Blog can say 'Operations Manager' is a read only user.

Obviously I can mock all this up without seeing groups in the JWT by hacking your roles to be more like groups. But it is just more busy work for us in the UI. If we could see groups in the JWT we could leave FusionAuth out of roles altogether which would work best in this situation. Leave the group to role to permission management at the app level where it belongs.

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Matthew:** Auth is complicated, period. It takes a lot of study and research to even understand the landscape and offerings, let alone build and deploy a secure architecture. FusionAuth solved a large portion of this problem by building an intuitive, simple self-hosted solution. Before FusionAuth we were using our own custom authentication, but it wasn't OAuth2, OIDC or SAML. It was home baked. Which works ok, until you want to start collaborating with 3rd parties which nowadays assume auth standards. FusionAuth gave us the self-hosted identity provider we were always looking for.

**Dan:** Why did you choose FusionAuth over the competition?

**Matthew:** When re-designing our entire auth and API stack we looked at Okta, Auth0, Keycloak and GLUU. Immediately Okta and Auth0 were out due to the cost per API hit and the cloud based approach. We did prototype them anyway, and they are indeed great services if you want to pay the premium. For Keycloak and GLUU we built a prototype infrastructure for each and tested CLI apps, SPAs and Kong interactions. To put it simply, those systems (specifically GLUU) are more complicated than they should be and the documentation was lackluster. 

We spend months pulling our hair out with GLUU, never fully understanding the layout of the system with all their 404 linked documentation. When we found FusionAuth it was like a breath of fresh air on top of a 14er in Colorado. The entire layout just made sense. The FusionAuth design of tenants, users, groups, roles, apps, registrations modeled exactly how we think of auth. In a word, perfect. We were up and running with a self-hosted FusionAuth in a day and haven't looked back since!

**Dan:** How much time and money would you say FusionAuth has saved you?

**Matthew:** From prototype to deploy of FusionAuth was literally a day. That said, we already had years of auth knowledge so the learning curve was low. But FusionAuth is such a great product with a simple design that anyone with basic auth knowledge can be up and running within the week. 

Compare that to the months spent trying to setup and even understand GLUU. Money in the bank! Using FusionAuth and Kong ensures that all API hits are free. I would say Okta and Auth0 are similarly easy to get up and running but you pay the premium. If self-hosted / free'ish is your goal, FusionAuth will save you months of effort, time and money. And since our cost per API hit is now ZERO, Im going to say savings cannot be quantified. But a word comes to mind: "priceless"!

> From prototype to deploy of FusionAuth was literally a day.

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**Matthew:** Currently we have a single OpenNebula KVM virtual machine of Debian 10 running FusionAuth with the builtin Elasticsearch. We have a separate PostgreSQL VM for all our custom postgres databases including FusionAuth. We have not yet experimented with a high availability setup for FusionAuth but it's coming soon. FusionAuth is sitting behind an Debian 10 Haproxy loadbalancer which performs SSL termination and proxies into the FusionAuth HTTP port 9011 with proper `X-Forwarded` headers. 

Once an app authenticates via haproxy->FusionAuth we receive a JWT that is then used in all API requests. Those API requests are NOT sent through haproxy but directly to the Kong API Gateway (a separate external IP) where JWT validation and specific backend access is tightly controlled. Kong and Konga are on a separate Debian 10 KVM virtual machine but share the sames PostgreSQL VM with its own "kong" database. All webfarms are Debian 10 and nginx. API code utilizes PostgreSQL, MySQL and MongoDB for databases and Redis for caching and pub/sub queues.

**Dan:** Any general feedback/areas to improve?

**Matthew:** We love FusionAuth not just for the product but for the team. We have watched their videos and podcasts and read the hundreds of resources and blogs on their site. We have interacted with them on GitHub and all issues were promptly responded to and ultimately resolved and coded quickly. You can tell the FusionAuth team is passionate about what they do and it really shows. Keep up the good work and stay free!

-------

We love sharing community stories. You can check out [Sunfinity's website](https://sunfinity.com/) if you'd like to learn more. 
