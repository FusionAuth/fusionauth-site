---
layout: blog-post
title: Softozor integrated FusionAuth with Hasura and Kubernetes to save development effort
description: While working on a consulting project building an ecommerce platform, Softozor choose FusionAuth to manage their authentication.
author: Dan Moore
image: blogs/become-education-story/become-education-chooses-fusionauth-for-idaas.png
category: blog
tags: topic-community-story
excerpt_separator: "<!--more-->"
---

Dr Laurent Michel is a FusionAuth community member and leader at Softozor. He chatted with us over email about how he and his team are using FusionAuth to meet their auth needs. 

<!--more-->

*This interview has been lightly edited for clarity and length.*

-------

**Dan:** Tell me a bit about your work as a developer, software architect and product owner as well as what softozor does.

**Laurent:**  Softozor is a very little company made up by me, my brother and a few friends. Currently, we work together on our free time. We are mostly physicists and mathematicians. My brother and I work in software development companies. Our friends are teachers. One of the goals of the Softozor company is to produce educational video games. In order to achieve that goal, we need money, which we are trying to earn with software development projects. Currently, we are developing an ecommerce platform helping craftsmen to sell their products and make them visible in the regions they are living in. A craftsman can be a farmer, a caterer, a baker, a butcher, etc.

I am the company's official leader. I am energizing the roles of developer, architect, and product owner. I am the only one in the team to have the role of product owner. The roles of developer and architect are taken by other members of the team. Every architectural decision is discussed in the team so that we get as much insight as possible into the possible problems that we might face during the development. This way we also spread the knowledge of everyone across the whole team.  

Nowadays, I essentially develop in C++, C# (.Net / WPF), javascript (VueJs), and python (mainly to write acceptance tests).  

> The ease of installation and the set of features were the most decisive motivations to use [FusionAuth].

**Dan:** Is the craftsman site live? Can you share the URL? 

**Laurent:**  Yes, the [craftsman site is live](https://www.ameising.ch), in a reduced form. In the near future, it will show our customers all the shops we are managing. Currently, no shop is shown yet but they will soon pop on the map that we see on the homepage. The platform is not a traditional e-shop. It manages multiple e-shops where each e-shop has multiple tenants. What you see today is just kind of our crowd-funding: we sell baskets of vegetables, meat, fruits, bread, etc. Also, the project you see on that URL only targets Switzerland, no other country. It is a local project focusing on Switzerland. 

The codebase we've come up with, however, will be used to produce other e-shopping solutions, not necessarily located in Switzerland. 

**Dan:** How do you use FusionAuth? OAuth? User management? Social sign-on? Something else?

**Laurent:** The development of our platform is proceeding slowly. We integrated FusionAuth last year to the platform's admin panel. It is planned to be integrated to the e-shop as well, but that is not a priority. We use FusionAuth for user management. It produces JWTs for us which are then consumed by our hasura API. It is very important to us that FusionAuth provides permission management features. Also the JWT lambdas are critical for us. 

> [FusionAuth's] documentation is outstanding...

**Dan:** How do you use the lambdas? Is it to inject custom permissions (admin, seller, buyer) or for some other use? 

**Laurent:**  In order to be able to issue requests to our hasura API, it is sometimes necessary to have a JWT. JWTs that are compatible with hasura need special data containing the user's allowed roles and id, among other things. Here's a sample populate function that we use in our system: 

```javascript
function populate(jwt, user, registration) { 
  jwt['https://hasura.io/jwt/claims'] = {
    'x-hasura-allowed-roles': jwt.roles,
    'x-hasura-default-role': jwt.roles[0],
    'x-hasura-user-id': user.id
  };
}
```

In our software, JWTs are used on the admin frontend, where the craftsmen can define their inventory, shop managers can monitor sellings, etc. On the shop itself, we are not using JWTs yet, because we aren't supporting customer accounts yet, which would be the only use case where JWTs would be useful. Indeed, the whole shopping frontend is generated following the JAMStack philosophy. Therefore, the sensitive information is gathered from the hasura API with special rights on our CI/CD server and injected into the shop frontend whenever necessary. That leaves users of that frontend with (almost) no way to hack into our API. 

**Dan:** What problems did we solve for you? And how were you solving them before FusionAuth?

**Laurent:** You solve the permission management problem. You provide us with a reliable way to generate JWTs that are compatible with hasura. It's the first time where we had to integrate an authorization and authentication system. 

> Both [the .NET and python SDKs] saved us a lot of time. 

**Dan:** Why did you choose FusionAuth over the competition?

**Laurent:** We evaluated a few options: keycloak, keratin/authn, and fusionauth. The ease of installation and the set of features were the most decisive motivations to use your software. Its documentation is outstanding, that also helped a lot in choosing FusionAuth. 

**Dan:** How much time and money would you say FusionAuth has saved you?

**Laurent:** It saved a lot of time. If we agree that time is money, then it saved us a lot of money too. We could've implemented a reduced set of the features provided by FusionAuth, but that would've taken a lot of time. We could've chosen another solution than FusionAuth and implemented the missing features, but again that would've been a killer. I'd say it saved us something like one man-year of time. 

**Dan:** How do you run FusionAuth (k8s, standalone tomcat server, behind a proxy, etc)?

**Laurent:** We run fusionauth on a k8s cluster. It is completely hidden behind our hasura api. We write hasura actions that interact with fusionauth.  

> I'd say FusionAuth saved us something like one man-year of time.

**Dan:** Can you tell me a bit more about the hasura actions? 

**Laurent:**  Our system bases on the 3-factor app pattern: realtime graphql API, reliable eventing, and async serverless. That is out-of-the-box hasura behavior. 

Whenever some relevant data are changed in our database, some events are triggered, which results in calling some serverless functions (e.g. in our system we use OpenFaaS). In addition to that, we can complete the GraphQL API automatically generated by hasura with additional queries / mutations, which are know as "hasura actions". For example, the automatically generated API does not come out with a login mutation. Either you route the login request from your frontend to fusionauth directly or you decide that you have a central API over which everything should go. 

We chose the latter variant, as we find it clearer. In that case, we had to define a hasura login action. That amounts to tell hasura what the mutation looks like: what name, what input, what output, and then link that mutation with a serverless function. In that context, we are very happy to use the .Net SDK provided by FusionAuth! It has all the necessary REST Client wrappers necessary for us to perform the operations we need on FusionAuth. 

We are also very happy to use the python SDK in our acceptance tests. We use it essentially in order to fill up the users database with the necessary credentials to then interact with our system under test. Both SDKs saved us a lot of time. 

**Dan:** Any general feedback/areas to improve?

**Laurent:**  I think it would be great if fusionauth could produce [pasetos](https://github.com/paragonie/paseto). I know everyone on the web uses JWTs, but those are very easy to handle in an insecure way. They are insecure by default, whereas Pasetos are secure by default. *[Ed note: We have an open feature request for [paseto support](https://github.com/FusionAuth/fusionauth-issues/issues/773).] For our use-cases with hasura, it would not bring anything right now (see [this issue[https://github.com/hasura/graphql-engine/issues/3205)) but I can imagine that they could be useful.

-------

We love sharing community stories. You can check out [Softozor's website](https://softozor.com/) if you'd like to learn more. 
