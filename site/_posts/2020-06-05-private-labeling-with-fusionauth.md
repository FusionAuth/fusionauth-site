---
layout: blog-post
title: Private labeling with tenants
description: Tenants can ease your operational burden.
author: Dan Moore
image: blogs/fusionauth-laravel/user-registration-sign-in-laravel-fusionauth.png
category: blog
tags: api-tenants
excerpt_separator: "<!--more-->"
---

Sometimes you just need a little space, right? Tenants in FusionAuth can provide logical separation of users and applications while letting you manage everything from one FusionAuth installation.

<!--more-->

All editions of FusionAuth support multiple tenants within the same FusionAuth installation. Using this feature eases operational burdens while still maintaining logical divisions.

## Why set up multi-tenant FusionAuth?

Pretend you have a SaaS application which lets people manage their todos. It's a glorious task management application. You started your company, TodoInc, selling individual accounts. That application lives at app.todo.com. You are using FusionAuth as your user data store, and you have other applications using it as well: a [forum application](/blog/2020/05/13/setting-up-single-sign-on-for-nodebb), [Zendesk](/docs/v1/tech/samlv2/zendesk) for customer support and [GSuite](/docs/v1/tech/samlv2/google). 

However, Company1, a large multinational corporation with a big checkbook approaches you. They want a premium edition; they have decided that your todo application is too good to live without. They want their application to be separate, private labeled, and located at todo.company1.com. They're willing to pay a premium price, as well.

You realize you can offer this easily by modifying your application to respond to multiple hostnames. The logic is pretty straightforward.

But what about your users? The accounts at todo.company1.com should be entirely separate from the accounts at app.todo.com. What if the CEO of Company1 already has an account at app.todo.com and signs up for the corporate account? It doesn't make sense to mix personal and business tasks. Further, suppose you sell Organization2 a premium todo application as well. These users should be separate too. 

Also, each standalone application's login pages must be branded; your clients want their apps customized to match their websites. Oh, and by the way, Company1 wants users to authenticate against their ActiveDirectory database, and Organization2 wants users to be able to login with their Facebook accounts. 

_What to do?_

We got ya. You can handle this scenario in two different ways with FusionAuth.

## Separate FusionAuth servers

The first option is running separate FusionAuth installations, each with their own database. This is easy to understand and has some strengths: 

* You can scale each installation independently. 
* The installations can be located in different legal jurisdictions. 
* The FusionAuth admin UI can be made available to clients if desired.

However, operationally this choice leads to complexity. There's the cost of running and maintaining the different servers. You'll need to make sure that admin accounts, webhooks, API keys and other configuration are synced as needed. When any employee of TodoInc departs, you'll need to ensure you remove all their accounts. 

You'll also need to automate your server rollout process so that todo.company1.com doesn't get left behind when you upgrade. And you'll need some way to let your customer service folks know which installation is associated with which client, so that when a request comes in to reset a password, they aren't hunting across different ones. This isn't a big issue when you have only three private labeled accounts, but when you have twenty or two hundred, it becomes problematic.

## Tenants to the rescue

FusionAuth provides an easier way: tenants. Tenants are a first class construct in FusionAuth. When you set up a new instance, there is one tenant: the default one. And sometimes that's enough. 

But you can create as many as you'd like. From the perspective of user signing in, each tenant is a separate installation. Each tenant has its own email templates, themes, application configurations and users. API keys can be scoped to a tenant, so if you want to give a client an API key so they can write their own integrations, you can. 

{% include _image.liquid src="/assets/img/blogs/private-label-with-tenants/creating-new-tenant.png" alt="Creating a new tenant" class="img-fluid" figure=false %}

You can change the token issuer, theme and many other settings at the tenant level. You can also duplicate existing tenants to pick up default settings.

When you have two or more tenants, the admin UI displays a new column showing you with which tenant each application is associated.

{% include _image.liquid src="/assets/img/blogs/private-label-with-tenants/applications-with-multiple-tenants.png" alt="Applications when there are multiple tenants." class="img-fluid" figure=false %}

Normally a user's email address is unique across FusionAuth. But each tenant is a separate userspace, so you can have two different user accounts with the same email, but different data, passwords and application associations.

{% include _image.liquid src="/assets/img/blogs/private-label-with-tenants/duplicate-example-users.png" alt="Two users with the same email address." class="img-fluid" figure=false %}

For user management system administrators, there are significant benefits with tenants. You get ample separation. You can limit API keys and webhooks, allowing for tighter integrations between your todo application and your clients' systems. The look and feel of the login, forgot password and other pages can be customized per tenant.

But as an admin, you have one view into all system activity. Operations has one place to go to add new API keys or webhooks. If your customer service reps need to reset a password, they don't have to track down the correct FusionAuth installation. Central user management makes their lives easier. You also only have one FusionAuth installation to manage, secure, and upgrade.

## How to create tenants via API

Even better, tenant creation can be automated. Every time TodoInc sells a premium subscription, code can create a corresponding tenant, like so:

```ruby
def create_new_tenant(generic_tenant_client, name)
  # create a new tenant based on the default tenant
  tenants_response = generic_tenant_client.retrieve_tenants
  if tenants_response.status != 200
    puts "Unable to retrieve tenants."
    return
  end

  default_tenant_id = tenants_response.success_response.tenants.select { |t| t.name == 'Default' }[0].id
  default_tenant_theme_id = tenants_response.success_response.tenants.select { |t| t.name == 'Default' }[0].themeId

  new_tenant_request = { "sourceTenantId": default_tenant_id, tenant: {"name": "New client - "+name }}
  new_tenant_response = generic_tenant_client.create_tenant(nil, new_tenant_request)

  if new_tenant_response.status != 200
    puts "Unable to create tenant."
    puts new_tenant_response.error_response
    return false
  end
  new_tenant = new_tenant_response.success_response.tenant
  [default_tenant_theme_id, new_tenant]
end
```

In this code, we find the tenant with the name `Default` and create a new tenant with the same settings. We also pass back a theme id, which we can use to automatically create a new theme for this tenant. 

The full [code is available](https://github.com/FusionAuth/fusionauth-example-ruby-tenant-creation) if you want to take a look. This example is written in ruby, but you can use any of our [client libraries](/docs/v1/tech/client-libraries/) to automate this process. 

## Caveats

Once you create a second tenant, all API access needs to [pass in tenant information](/docs/v1/tech/apis/authentication#making-an-api-request-using-a-tenant-id). This isn't difficult, but you should plan for it.

## In conclusion

With tenants, you get operational simplicity as well as logical separation of data. Your ops and customer success teams will thank you for the former, and you'll be able to private label your offering because of the latter.
