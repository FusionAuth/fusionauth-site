## Introduction
User Actions in FusionAuth are ways to interact with, reward, and discipline users. For example, you could use them to email a user, call another application when a user does something, or temporarily disable a user's login.

This guide refers to User Actions simply as Actions. In the first half you'll learn about all the parts of an Action and their sequences of events. In the second half you'll learn ways to create and apply Actions.

- [Introduction](#introduction)
- [Definitions](#definitions)
- [Types of Actions and Their Purpose](#types-of-actions-and-their-purpose)
  - [Temporal Actions](#temporal-actions)
    - [Subscription Example](#subscription-example)
  - [Instantaneous Actions](#instantaneous-actions)
    - [Survey Example](#survey-example)
- [Applying an Action Automatically](#applying-an-action-automatically)
- [Creating Actions](#creating-actions)
  - [APIs](#apis)
    - [Action parameters](#action-parameters)
    - [Action Reason parameters](#action-reason-parameters)
    - [Action instance parameters](#action-instance-parameters)
  - [Starting the PiedPiper newspaper company](#starting-the-piedpiper-newspaper-company)
  - [Installing FusionAuth](#installing-fusionauth)
  - [Create PiedPiper Application](#create-piedpiper-application)
  - [Create an Administrative User (Actioner)](#create-an-administrative-user-actioner)
  - [Create an Subscriber User (Actionee)](#create-an-subscriber-user-actionee)
  - [Create an API key](#create-an-api-key)
  - [Create welcome email template](#create-welcome-email-template)
  - [Creating a User Action via the API (create both types)](#creating-a-user-action-via-the-api-create-both-types)
  - [Creating a Webhook -- why? so we can feed the subscription and happiness info into our other systems? have an audit trail?](#creating-a-webhook----why-so-we-can-feed-the-subscription-and-happiness-info-into-our-other-systems-have-an-audit-trail)
  - [Set up the Email](#set-up-the-email)
  - [Executing the User Action (execute both)](#executing-the-user-action-execute-both)
    - [Webhook Example](#webhook-example)
    - [Show example of email](#show-example-of-email)
  - [Querying Action Status on a User (query both) and explain why you'd do this](#querying-action-status-on-a-user-query-both-and-explain-why-youd-do-this)
- [Localization -- extract all the localization stuff to here](#localization----extract-all-the-localization-stuff-to-here)
- [Further reading](#further-reading)
- [Todos](#todos)

## Definitions
Below are the terms you'll encounter when working with Actions. They are listed in order of increasing understanding, not alphabetically.

- Action — Can be created on FusionAuth at **Settings**—**User Actions**. An Action is a state or event that can be applied to User. It is reusable for many Users in many Applications. Actually applying Action to a specific User is called an Action instance. This is similar to programming, where you have classes (Actions) and objects (Action instances).

    At its most simple, an Action is just a name, and an Action instance comprises: one User applying the Action on another User, the time of the Action, and the name of the Action.
- Actionee — The user on whom Action is taken.
- Actioner — The user that applies the Action. Every Action has to have an Actioner, even if the instance is automatically applied, in which case the Actioner can be set to the Application's administrator.
- Reason — A text description of why an Action was taken. You don't have to set a Reason when applying an Action, but it's useful for auditing. Reasons can be created on FusionAuth at **Settings**—**User Actions** by clicking the **Reasons** button at the top right.
- Webhook — A webhook is another name for sending a single HTTP request to an API. It's used to inform an external system of some event, and can be triggered by an Action. An example is FusionAuth calling a customer-support service, like _Intercom.com_, to start the customer onboarding process when the user has verified their email in FusionAuth. Another example would be posting a message to a _Slack.com_ channel whenever a new customer signs up. Webhooks can be managed in FusionAuth at **Settings** — **Webhooks** and can be triggered by Actions.

    The webhook/API terminology can be confusing. Note that most web companies, including FusionAuth, call a trigger to _send_ data a _webhook_, but when they _receive_ data they call it an _API_. So if you're looking for a destination for a FusionAuth webhook in an external system, you won't find it under their webhook documentation; you'll find it under API documentation. This is why they are sometimes known as a _reverse API_. However, some companies, like _Slack_, also call incoming requests "incoming webhooks".
- Temporal Actions — Temporal, or time-based, Actions have a duration, as opposed to instantaneous Actions, which have only a start time. Once a temporal Action expires, meaning that it ends automatically as opposed to being cancelled, it will no longer be considered active and will not affect the user. However, you can apply a temporal Action to a user indefinitely by setting a very distant end date. An Action that prevents login must be temporal.

    A temporal Action may be cancelled or modified, unlike an instantaneous Action, which cannot be. An example of an instantaneous Action would be a reward, such as sending a user a discount coupon.
- Active — An active Action can be applied to Users. In contrast, an inactive Action is like a deleted Action, meaning it cannot be applied, but it is still viewable in the list of inactive Actions in FusionAuth. An inactive Action can be reactivated if you want to use it again.

    If a temporal Action instance has ended we do not say that it is not active. _Active_ relates to the Action definition, and _expiry_ relates to a particular instance of the Action.
- Option — A custom text field that you can add to an instantaneous Action, but not to temporal Actions. You can add multiple options to an Action definition, but choose only one for an instance of the Action. Options can be sent through emails and webhooks.
- Localization — A text field with an associated language. It's a way of providing more information to users and administrators who speak different languages. Localizations can be added for an Action name, Reason, and Options.
- Tenant — You can make an Action available to all Tenants or just a few. Below is a visual reminder of [Tenants, Groups, and Applications](https://fusionauth.io/docs/v1/tech/core-concepts/).

    ```mermaid
    flowchart BT
        User-->Tenant
        Application-->Tenant
        Group-->Tenant
        Role-->Application
        User-->Group
        Registration-->User
        Registration-->Application
        User-->Role
        Entity-->Application
    ```

## Types of Actions and Their Purpose
There are two main types of Actions: temporal Actions and instantaneous Actions with options. They are summarized below.

| Type | Purpose | Example of use
| ----------- | ----------- | -----------
| Temporal | When you want to apply a state to a user for a period of time. | Subscription access · Expiring software trial · Forum ban
| Instantaneous (with options) | When you want to apply a state to a user at a single point in time, recording who did so, perhaps with comments. | User surveyed and was happy/indifferent/frustrated · User has earned a sufficient level of trust on your forum and been given an award (possibility increasing their access rights)

> FusionAuth's primary purpose is to simplify authentication (verifying a user's identity) and authorization (giving your app a user's roles). Actions are an additional feature that you might want to use in your app. Think of them as a premade way for you to store extra user fields in FusionAuth instead of your own database, at a specified time, and notify people or systems if these fields change. But FusionAuth has no way to receive payments, and no automated subscription features. So you need to decide carefully if you want to write the code you need to manage such features in FusionAuth using Actions, or in your own app with custom code, or using an external system that specializes in that process, if your needs are complex.

The general process to use an Action is to
- create the Action in the FusionAuth website,
- create any Reasons that you might want to link to the Action instance on the website,
- apply the Action to a User using the User Action API, possibly giving it an expiry date.

You'll see some detailed examples of this process later in this guide.

### Temporal Actions
Temporal action instances have four states they can be in. Each state can trigger a webhook or an email to the user.

```mermaid
flowchart LR
    Started-->Modified
    Modified-->Ended["Ended (Expired)"]
    Modified-->Cancelled
    Started-->Cancelled
    Started-->Ended
    Modified-.->Modified
```

#### Subscription Example
Let's take a temporal Action example where a user purchases a month's subscription to a newspaper website that you manage. Assume you have already created a temporal Action named "Subscription" in FusionAuth. Once the user has made their purchase (either on your newspaper site or through some payment gateway) your code will call the FusionAuth API to apply the Action to the User, and give the Action instance an end-date one month from now. The user will now have access to read the newspaper when authenticated on your site with FusionAuth.

The creation of this Action instance will be the **Started** event shown above. You can set it to trigger the welcome email template that is sent to the user, and a webhook that sends the user's information to another subscription site you manage. That site could then use that email address to advertise to the user, or for targeting Facebook adverts.

Once the Action instance expires (the **Ended** event) it will trigger a goodbye email to the user, and any webhooks that you configured. To prevent the user accessing your site after this date you could either
- check the subscription state of the Action for the User in FusionAuth from your site's code when the user attempts to log in,
- use a webhook at the end of the Action to change the User's Role in FusionAuth and disallow that role in your site,
- or use a webhook at the end of the Action to call your code to create another temporal Action in FusionAuth with an indefinite end date and `preventLogin` set to true.

The last option is probably the simplest and most idiomatic way to use FusionAuth in most cases. In fact, using an Action to prevent login is the most common use case for Actions.

### Instantaneous Actions
An instantaneous Action instance has an Option that can be chosen from a list, but no temporal states. Once you set the Action for a User it is either remains or is removed.

```mermaid
flowchart LR
    Added-.->Removed
```

#### Survey Example
Let's take an instantaneous Action example where a user gives feedback on their interaction with customer support by assigning a rating and giving a comment.

Assume you have already created an instantaneous Action named "Feedback" in FusionAuth, with Options of "Bad", "Neutral", and "Good". Your user chooses "Good" in your application's form and enters the comment "Problem solved quickly". When saving the form your code will call the Action API and create an Action instance for the User with the option "Good" and populate the `comment` field. The `actioner` of the instance will be set to the support User who helped the customer.

At any point in the future you can use the API to retrieve this saved Action instance and create a report of the customer support agent's performance, or your app's approval ratings in general. You could also use a webhook to send this data immediately to an external system when the Action was created.

## Applying an Action Automatically
You have seen that you can apply an Action using the API. FusionAuth can also automatically apply a temporary `preventLogin` Action to a User in the case of repeatedly failing authentication. For more information see this [guide](https://fusionauth.io/docs/v1/tech/tutorials/gating/setting-up-user-account-lockout).

## Creating Actions
The remainder of this guide will demonstrate a practical example of using Actions that you can follow. Let's start with a brief tour of the APIs that you'll use in the example.

### APIs
Three separate APIs manage Actions. Each has its own documentation.
- [Actions](https://fusionauth.io/docs/v1/tech/apis/user-actions) — Defines an Action, updates it, and deletes it. The API path is `/api/user-action`.
- [Action Reasons](https://fusionauth.io/docs/v1/tech/apis/user-action-reasons) — Defies the reason an Action can be taken. The API path is `/api/user-action-reason`.
- [Action instances](https://fusionauth.io/docs/v1/tech/apis/actioning-users) — Applies an existing Action to a User, optionally with a Reason. Can also update or cancel the Action instance. The API path is `/api/user/action`.

Actions and Actions Reasons can be managed on the FusionAuth website. Only Action instances require you to use their API — you cannot apply an Action to a User on the website.

It is faster to use FusionAuth's API wrappers rather than make HTTP calls directly. You can read how to use them in the [client library guide](https://fusionauth.io/docs/v1/tech/client-libraries/) before continuing. This guide uses the Typescript client library.

The Actions API reference documentation is long, and repeats the same parameters for each type of request. For easier understanding, the parameters listed there are grouped and summarized below for each API. Parameters, such as Ids and names, whose purpose is obvious from the earlier [Definitions](#definitions) section are not described here.

#### Action parameters
These are used when creating an Action definition.
- `userActionId`
- `name`, `localizedNames`
- `startEmailTemplateId`, `cancelEmailTemplateId`, `modifyEmailTemplateId`, `endEmailTemplateId`, — The Id of the email template that is used when the Action starts, is cancelled, is modified, or expires. Temporal Actions have all four events, whereas instantaneous Actions have only the start event.
- `includeEmailInEventJSON` — Whether to include the email information in the JSON that is sent to the webhook when an Action is taken.
- `options`, `options[x].name`, `options[x].localizedNames`
- `preventLogin` — User may not log in if true until the Action expires.
- `sendEndEvent` — Whether to call webhooks when this Action instance expires.
- `temporal` — if the Action is temporal.
- `userEmailingEnabled`, `userNotificationsEnabled` — notify doesn't contact the user, it just adds a `notifyUser` field to JSON sent to webhooks.

#### Action Reason parameters
These are used when creating an Action Reason.
- `userActionReasonId`
- `text`, `localizedTexts` — The description of the Reason that a human can understand, possibly in many languages.
- `code` — A short text string to categorize the Reason for software to process.

#### Action instance parameters
These are used when applying an Action to a User, possibly with a Reason.
- `userActionId`
- `actioneeUserId`
- `actionerUserId`
- `applicationIds` — The Action can be applied to the actionee for multiple Applications.
- `broadcast` — Should the Action trigger webhooks
- `comment` — A note by the actioner if they want to add information in addition to the Reason.
- `emailUser` — Should the user be emailed at instance creation.
- `expiry` — Time after which this temporal Action should end.
- `notifyUser` — Should the literal text value, `notifyUser`, be sent to webhooks, for them to act on as they wish.
- `option` — The option the Actioner chose for this instance of the Action.
- `reasonId`

### Starting the PiedPiper newspaper company
You are now going to create the subscription and survey examples described earlier, for a paid newspaper website called _PiedPiper_.

Below is a summary of the steps you'll be completing.
- FusionAuth work:
  - Install FusionAuth
  - Create PiedPiper Application
  - Create administrative User (actioner)
  - Create subscriber User (actionee)
  - Create API key
  - Subscription work:
    - Create welcome email template
    - Create expiry email template
    - Create expired Reason
    - Create preventlogin Action
    - Create signup webhook to Intercom
    - Create subscription Action
  - Survey work:
    - Create survey webhook to Slack
    - Create survey Actions with options
    - Create localization for options
- PiedPiper work:
  - Install Node.js
  - Create app folder with Typescript client library
  - Create mock Intercom API
  - Create mock Slack API
  - Create PiedPiper API to listen for expiry and call preventLogin Action
  - Create mock email service
- Testing:
  - Call subscription Action
  - Check welcome and expiry emails arrive
  - Check Intercom is called
  - Check preventLogin Action was created
  - Call survey Action
  - Check negative survey response was sent to Slack
  - Retrieve all survey Action instances for this User

Below is a diagram of how the system will be used.

```mermaid
sequenceDiagram
    participant U as User
    participant PP as PiedPiper
    participant FA as FusionAuth
    participant I as Intercom
    participant S as Slack

    U->>PP: Pay for a month subscription
    PP->>FA: Apply subscription Action
    FA->>U: Send welcome email
    FA->>I: Send subscription notification

    break One month passes
        U-->PP: Subscription expires
    end

    FA->>U: Send goodbye email
    FA->>PP: Send expiry notification
    PP->>FA: Apply preventLogin Action

    U->>PP: Complete customer survey form
    PP->>FA: Apply survey Action
    FA->>S: Send survey notification
    PP->>FA: Retrieve all Actions for the User
```

### Installing FusionAuth
This guide assumes you have installed FusionAuth by following the [5 minute getting started guide](https://fusionauth.io/docs/v1/tech/getting-started/5-minute-docker). You should be able to log in to FusionAuth at http://localhost:9011/admin and your Node.js test app at http://localhost:3000.

> You can't use the [online FusionAuth sandbox](https://sandbox.fusionauth.io/admin) for this tutorial because you need to point the webhooks and emails to fake localhost services.

### Create PiedPiper Application
- Log into the FusionAuth website and perform the following steps.
- **Applications** — **Add**
- Enter the values:
  - **Id** — `e26304d6-0f93-4648-bbb0-8840d016847d`
  - **Name** — `PiedPiper`
  - **Add Role**
    - **Name** — `admin`
    - **Super Role** — enable
  - **Add Role**
    - **Name** — `customer`
- Switch to the **OAuth** tab
- Add the following **Authorized redirect URLs**
  - `http://localhost:3000/oauth-redirect`
  - Note that you have to enter the text, wait for a popup to appear, then click it to confirm the entry.
- Add the following **Logout URL**
  - http://localhost:3000/logout
  - You do not need to click a popup here as the field can take only one value.
- Record the **Client secret** value for later use. TODO? - Client secret — `aX6vdOBA_rZxI49Lh0C2-5h71EdJJv2uG99XAZhPkew`
- **Save** the new Application

> You can leave the **Id**s of new objects in FusionAuth blank to have them autogenerated, but you'll need to know their values to call them in the API.

### Create an Administrative User (Actioner)
- **Users** — **Add**
- Enter the values:
  - **Email** — `admin@example.com`
  - **Send email to set up password** — Disable
  - **Password** — `password`
  - **Confirm** — `password`
- **Save**
- **Add registration**
  - **Application** — `PiedPiper`
  - **Roles** — `admin`
- **Save**

### Create an Subscriber User (Actionee)
- **Users** — **Add**
- Enter the values:
  - **Email** — `reader@example.com`
  - **Send email to set up password** — Disable
  - **Password** — `password`
  - **Confirm** — `password`
- **Save**
- **Add registration**
  - **Application** — `PiedPiper`
  - **Roles** — `customer`
- **Save**

### Create an API key
You now have an Application with two Users.

In order to apply Actions using the API we need to create an API Key. In reality you should grant as few privileges to a Key as possible, but to save time in this long tutorial you'll make this key a skeleton key. For more information on keys, see their [documentation](https://fusionauth.io/docs/v1/tech/apis/authentication#managing-api-keys).

- **Settings** — **API Keys** — **Add**
- **Id** - `cbf34b5f-cb45-4c97-9b7c-5fda3ad8f08c`
- **Key** - `FTQkSoanK7ObbNjOoU69WDVclfTx8L_zfEJbdR8M0xu-jKotV0iQZiQh`
- (Leave all endpoints disabled to give the key super access.)
- **Save**

### Create welcome email template
You now create two email templates, one for an email sent to the user when they subscribe, and one for when their subscription ends.

TODO

  - **** — ``
  - **** — ``
  - **** — ``
  - **** — ``
  - **** — ``
  - **** — ``
  - **** — ``
  - **** — ``
  - **** — ``
  - **** — ``


    - Create welcome email template
    - Create expiry email template
    - Create expired Reason
    - Create preventlogin Action
    - Create signup webhook to Intercom
    - Create subscription Action
  - Survey work:
    - Create survey webhook to Slack
    - Create survey Actions with options
    - Create localization for options
- PiedPiper work:
  - Install Node.js
  - Create app folder with Typescript client library
  - Create mock Intercom API
  - Create mock Slack API
  - Create PiedPiper API to listen for expiry and call preventLogin Action
  - Create mock email service



You can create an Action on the website at **Settings** — **User Actions**.
![Creating an Action on the website](../../../../assets/img/docs/guides/user-actions/user-actions-edit-email.png)
But to apply an Action to a User you cannot use the website. It can be done only using the APIs.

### Creating a User Action via the API (create both types)

### Creating a Webhook -- why? so we can feed the subscription and happiness info into our other systems? have an audit trail?

### Set up the Email
Set up sending a thank you email to the user when their interaction has been recorded.

An Email Template for Actions can be created in the FusionAuth website at **Customizations** - **Email Templates**.

### Executing the User Action (execute both)

#### Webhook Example
Show example of what webhook would look like when received and link to the webhook event documentation


#### Show example of email

### Querying Action Status on a User (query both) and explain why you'd do this

## Localization -- extract all the localization stuff to here
options
name
emails (point to email templates docs, no need to build this out entirely), but note that the email template is pulled based on the users preferred email
anything else

## Further reading

## Todos
- screenshots
- diagrams
- what does the json that gets sent to a webhook look like
- add sections from last user actions doc
- review the stylesheet readme

