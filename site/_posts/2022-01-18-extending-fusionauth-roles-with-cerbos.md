---
layout: blog-post
title: Extending FusionAuth roles with Cerbos
description: Sometimes RBAC isn't enough and you need more fine-grained permissions. FusionAuth seamlessly integrates with Cerbos to provide that option.
author: Dan Moore
image: blogs/cerbos-authorization/extending-fusionauth-roles-with-cerbos-header-image.png
category: tutorial
tags: tutorial tutorial-integration authorization roles integration
excerpt_separator: "<!--more-->"
---

FusionAuth offers role based access control (RBAC). This is common in auth systems. RBAC tags each user with one or more roles. Roles are interpreted by any application receiving user information from the auth system, often in a JWT to determine what actions are allowed or denied.

<!--more-->

However, there are times when this authorization model isn’t granular enough. When this is the case, layering on an authorization server like Cerbos can help centralize authorization decisions while keeping both your application and your authentication and user management system free of authorization induced complexity.

## Roles in FusionAuth

Anything a person can log into, whether custom web applications, mobile applications, APIs or commercial off the shelf apps, is represented as an application in FusionAuth. Part of the application configuration is the list of roles, which are simply strings with a few pieces of metadata:

{% include _image.liquid src="/assets/img/blogs/cerbos-authorization/creating-role-fusionauth.png" alt="Adding a new role in FusionAuth." class="img-fluid" figure=false %}

Each application in FusionAuth can have an [unlimited number of roles](/docs/v1/tech/core-concepts/roles). Each role is a string. Roles can either be marked as default and attached to every user registered to an application, or designated a super-user role, indicating administrative privileges. If you need a lot of roles, or fine-grained permissions in your application, you can create as many roles in FusionAuth as you’d like, perhaps using the API to automate the process.

But this approach can have challenges in some cases. Many roles make it more difficult to assign proper ones to individual users, even using groups. It also is more difficult to modify accounts as users change positions within your organization. Finally, it can lead to complexity as your application must handle an exploding number of roles in code.

There are also some authorization decisions that simply can’t be handled in an RBAC system like FusionAuth. These include:

* When authorization can’t be determined at the time of authentication
* When it changes during the user session
* If authorization depends on not just the user, but the resource being accessed
* If extra context is required
* If factors such as the requester’s IP address or the request time of day impact authorization.

Some concrete examples of authorization decisions which fall into this category, for a hypothetical application tracking time for billing purposes:

* As a manager, I can edit my timesheet and those of my team, but not my superiors’ or any other employee
* As an employee, I can edit my timesheet for 24 hours after I submit it, but no longer
* Accounting team members can edit any timesheet, but only during business hours

All of these are complex authorization decisions that RBAC offloads to the timesheet application. This is fine when the decisions are relatively simple and few in number, but as they grow, this business logic benefits from being extracted and centralized.

## Enter an authorization server

Luckily, there are authorization servers such as [Cerbos](https://cerbos.dev/) that can help. Cerbos adds a layer of permissions on top of roles provided by FusionAuth. 

Your application code, instead of being an inconsistent tangle of role checks, sets up a policy file and then calls Cerbos with the context and desired action to see if it is allowed. 

Yes, your application still has to make the checks, but they are now done in a consistent manner and you can have one view of applicable policies. This consistency extends across your entire application stack and across applications; any service can make a call to the authorization engine. You also have to run the Cerbos application; that is another tradeoff you make to have the authorization decisions centrally managed.

Here’s an example Cerbos policy file:

```yaml
---
apiVersion: api.cerbos.dev/v1
resourcePolicy:
  version: default
  resource: contact
  rules:
  - actions: ["read", "create"]
    effect: EFFECT_ALLOW
    roles:
      - admin
      - user

  - actions: ["update", "delete"]
    effect: EFFECT_ALLOW
    roles:
      - admin

  - actions: ["update", "delete"]
    effect: EFFECT_ALLOW
    roles:
      - user 
    condition:
      match:
        expr: request.resource.attr.owner == request.principal.id
```

As you can see above, you can have simple rules based on a role, such as the read rule for the contact resource. Or, you may have more complicated rules based on who a user is and who owns a resource, as shown in the update action for users. You can learn more in their documentation.

Here’s an example of how you’d make the authorization decision:

```javascript
  // check user is authorized
  const allowed = await cerbos.check({
    principal: { // pass in the User ID and Roles from FusionAuth session
      id: req.session.user.id,
      roles: req.session.user.roles,
    },
    resource: {
      kind: "contact",
      instances: { // the list of resources to check access against
        [contact.id]: {
          attr: contact,
        },
      },
    },
    actions: ["read"], // the actions to be performed on the resources
  });

  // authorized for read action
  if (allowed.isAuthorized(contact.id, "read")) {
    return res.json(contact);
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }
```

In this example code, both the user id, user roles, action and resource information are provided to Cerbos. All of that contextual data can be used to make an intelligent authorization decision. 

## Example application

Here’s a [full featured example application](https://github.com/cerbos/express-fusionauth-cerbos), including FusionAuth, Cerbos and an express application using both roles managed by FusionAuth and permissions managed by Cerbos.

You can also see a video exploring this same application.

{% include _youtube-video.liquid youtubeid="Uf1jmDn4YSE" %}

## Conclusion

Roles are a useful solution for application authorization, but may fall short as your application grows in complexity and scope. 

Extracting authorization decisions to a full blown authorization server such as Cerbos can allow you to encapsulate complicated business logic in one place, leaving your application logic to focus on the features it is delivering, rather than if a user should have access to them.

