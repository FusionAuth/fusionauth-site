---
title: "Getting Started with FusionAuth: A Beginner's Guide"
description: Learn how to set up FusionAuth, integrate authentication into your app, and implement advanced features like magic link logins in this developer-friendly guide.
section: get started
subcategory: start here
navOrder: 0
codeRoot: https://raw.githubusercontent.com/fusionauth/fusionauth-example-express-start-here/main

---
import ListHostedLoginPagesUseCases from 'src/content/docs/_shared/_list-hosted-login-pages-use-cases.mdx';
import StartDiagram from 'src/diagrams/docs/get-started/start-here/launch-delegate-add.astro';
import Breadcrumb from 'src/components/Breadcrumb.astro';
import Aside from 'src/components/Aside.astro';
import InlineField from 'src/components/InlineField.astro';
import InlineUIElement from 'src/components/InlineUIElement.astro';
import DockerComposeFiles from 'src/content/docs/get-started/download-and-install/_docker-compose-files.mdx';
import { YouTube } from '@astro-community/astro-embed-youtube';
import DockerSpinup from 'src/components/quickstarts/DockerSpinup.astro';
import DockerRequirements from 'src/components/get-started/DockerRequirements.astro';
import DockerInstallAndStart from 'src/components/get-started/DockerInstallAndStart.astro';
import GitPodStart from 'src/components/get-started/GitPodStart.astro';
import Code from 'astro/components/Code.astro';
import {RemoteCode} from '@fusionauth/astro-components';

---

Do you care about authentication, authorization and user management?

Sure, you know your application needs it, but do you really want to spend time building undifferentiated functionality like social login, multi-factor authentication, or password reset? By using FusionAuth for authentication, authorization and user management, you get these benefits:

* **pre-built authentication workflows** and integrations accelerate application delivery
* **secure storage of user credentials and profile data**, wherever you want (you host or we host)
* **new functionality and bugfixes** from the security experts on the FusionAuth team, available to your users when you upgrade
* **the same experience** and application whether you develop locally, use FusionAuth in your CI/CD system, or run it in prod
* fine grained control of the version of FusionAuth you use; **upgrades happen on your schedule, not ours**

This guide will walk you through standing up a sample, pre-configured application that uses FusionAuth for login.

You'll also add the ability to log a user in using an emailed magic link.

## Overview of Using FusionAuth

To get started with FusionAuth, you need to do three things:

* Launch FusionAuth
* Delegate authentication
* Add functionality to your application

<StartDiagram alt="Launch, then delegate, then add functionality." />

Let's walk through an example where you'll add `Login With a Magic Link` functionality to an application, with no code changes required.

## Prerequisites

* git
* Docker (if you want to follow the Docker instructions)
* a GitHub account (if you choose to use GitPod instead)
* node (this was tested with `v20.16.0`)

## Launch FusionAuth

FusionAuth is downloadable software, so you need to run it or use FusionAuth Cloud. For this guide, you can either:

* Use Docker to install and run FusionAuth and the application
* Use GitPod to run FusionAuth in the cloud in your GitPod account, with no software install needed.

Expand the section you want to follow and get started.

### Install and Run in Docker
<details>
<summary>Docker</summary>
<DockerInstallAndStart codeRoot={frontmatter.codeRoot} kickstartUri={frontmatter.codeRoot + "/kickstart/kickstart.json"}/>
</details>

### Install and Run in GitPod
<details>
<summary>GitPod</summary>
<GitPodStart codeRoot={frontmatter.codeRoot} kickstartUri={frontmatter.codeRoot + "/kickstart/kickstart.json"}/>

</details>

### What Did You Just Do?

You launched a FusionAuth server with either Docker or GitPod. The server was prepopulated with application and user data.

## Delegate Authentication

Once you have FusionAuth up and running, you need to set up your application or applications to delegate to FusionAuth. For this guide, there's an example `Start Here` application which is already set up to do so. Let's look at that configuration and then start it up so you can log in.

### Open the Admin Interface

* In the previous step, you logged in to the system as an admin user.  Go back to that browser screen, which should be showing the administrative interface for FusionAuth.
* Navigate to <InlineUIElement>Applications</InlineUIElement> in the left-hand sidebar. You may need to use the hamburger icon at the top left of the screen to see all options.
* Choose the `Start Here` application.
* Choose <InlineUIElement>Edit</InlineUIElement> from the <InlineUIElement>Actions</InlineUIElement> dropdown.

### Application Configuration

After the user signs in at FusionAuth, they need to get back to your application. In the FusionAuth application configuration you can view authorized redirect URLs and how tokens are generated/exchanged.

![The edit screen of the application.](/img/docs/get-started/start-here/edit-application.png)

### After the User Authenticates

To understand how the JavaScript application integrates with FusionAuth, take a quick look at some of the code from the GitHub repository.

We craft a URL that includes the `clientId` from the configuration you reviewed above, as well as some other parameters. This is where the user goes to log in with FusionAuth. TODO need to only show the `redirect(302, `fusionAuthURL/oauth2/authorize` line

<RemoteCode url="https://raw.githubusercontent.com/fusionauth/fusionauth-example-express-start-here/main/app/src/index.ts" lang="javascript" tags="login" />

Once the user authenticates, the code at the configured redirect URL is called. This code sends parameters from the login event (the authorization code), the client identifier (clientId) and other information to get a valid token from FusionAuth. When the app receives this token, the user has fully been authenticated. TODO need to only show the try block here

<RemoteCode url="https://raw.githubusercontent.com/fusionauth/fusionauth-example-express-start-here/main/app/src/index.ts" lang="javascript" tags="oauth-redirect" />

Once you have the token, what should the app do with it? One option is to store it as a secure cookie. We do that here. TODO show cookie saving

We now can protect app functionality. For the account page, which requires authorization, the user's identity is checked and the browser is redirected to the main page if there is no valid token.

<RemoteCode url="https://raw.githubusercontent.com/fusionauth/fusionauth-example-express-start-here/main/app/src/index.ts" lang="javascript" tags="account" />

### Open the Application URL in your Browser and Login

In your shell, type the following to start up the application:

<Code code="cd app && npm install && npm run dev" />

Point your browser to the application:

<details>
<summary>GitPod:</summary>
<Code code="gp preview `gp url 8080` --external" />
</details>

<details>
<summary>Docker:</summary>
Point your browser to <Code code="http://localhost:8080" />
</details>

Now, login to the application in your browser using richard@example.com and 'password' to see the integration working.

### What Did You Just Do?

You looked at some FusionAuth configuration, started a JavaScript application and checked out some cod, and logged in to the application using FusionAuth.

## Add Functionality

By delegating to FusionAuth, your application gets access to authentication and authorization functionality, such as magic link login, multi-factor authentication, social sign-on, self-service registration and more. This is where a lot of the value comes from.

Enabling your users to log in using magic links can reduce friction and user frustration. Let's enable this on the application you just set up.

### Login With Magic Links

To add a `Login With Magic Links` button, you usually have to configure an email server and then FusionAuth. But for this guide, we've already set up the email server. It is a locally running mock email server, and you can visit your inbox at [http://localhost:1080](http://localhost:1080).

<Aside type="note">
Typically you'd need to configure an email server and the email template, but this has been done for you in the setup steps above.
</Aside>

### Update FusionAuth Configuration

Log out of your application and log in to the Admin UI.

To get to the admin UI run the following in the terminal:

<details>
<summary>GitPod:</summary>
<Code code="gp preview `gp url 9011`/admin --external" />
</details>

<details>
<summary>Docker:</summary>
Point your browser to <Code code="http://localhost:8080" />
</details>

Navigate to <Breadcrumb>Applications</Breadcrumb> and then edit the ChangeBank application. Navigate to the <Breadcrumb>Security</Breadcrumb> tab and then the <Breadcrumb>Passwordless login</Breadcrumb> section.

Click the <InlineField>Enable</InlineField> toggle.

![Enable the magic link login.](/img/docs/get-started/start-here/enable-magic-link-login.png)

Click the blue 'save' button to save your configuration change.

![Save the application.](/img/docs/get-started/start-here/save-application.png)

Now, log out of the admin UI.

### Get A Magic Link And Log In

Visit your application.  To get to the application run the following in the terminal:

<details>
<summary>GitPod:</summary>
<Code code="gp preview `gp url 8080` --external" />
</details>

<details>
<summary>Docker:</summary>
Point your browser to <Code code="http://localhost:8080" />
</details>

Click the <InlineUIElement>Login</InlineUIElement> button.

Scroll down if needed. You'll see a 'Login With Magic Link' button (TODO might not be that text).

![Login screen with magic link enabled.](/img/docs/get-started/start-here/login-screen-magic-link-enabled.png)

Click on it and enter your user's email address (`richard@example.com` in the screenshot below) and click <InlineUIElement>Send</InlineUIElement>

![After entering users email address.](/img/docs/get-started/start-here/login-screen-magic-link-enter-email.png)

Now you can visit the [email inbox](http://localhost:1080) and you'll see your magic link email. 

To visit the email inbox, do the following;

<details>
<summary>GitPod:</summary>
<Code code="gp preview `gp url 1080` --external" />
</details>

<details>
<summary>Docker:</summary>
<Code code="open http://localhost:1080" />
</details>

![Email inbox with magic link message.](/img/docs/get-started/start-here/email-inbox-magic-link-message.png)

Click on the link, and you'll be logged into your application.

### What Did You Just Do?

You enabled Magic Link login for your application without touching a single line of code.

Congrats!

Let's talk about next steps.

## Quickstarts

Looking for an example in a particular language? Quickstarts walk you through the Launch and Delegate steps, leaving you with a running application in your framework or language of choice, to which you can add functionality.

If you have Docker installed and one of over 20 frameworks and languages, you can run through [our quickstarts](/docs/quickstarts).

Each quickstart includes a complete runnable application and a shell application you can build out by following the step-by-step integration instructions.

## Next Steps

Now that you know a bit about FusionAuth, if you are interested in learning more about the authentication related functionality it enables, here's additional documentation.

* Set up [other identity providers, including SAML, OIDC and Facebook](/docs/lifecycle/authenticate-users/identity-providers/).
* Learn about [passwordless options including magic links and passkeys](/docs/lifecycle/authenticate-users/passwordless/).
* Enable [self-service registration](/docs/lifecycle/register-users/basic-registration-forms) to let users sign up for your application.
* Enable [multi-factor authentication (MFA)](/docs/lifecycle/authenticate-users/multi-factor-authentication). TOTP MFA is free, but other MFA methods require a paid license.
* Sign up for a [trial FusionAuth Cloud instance](https://account.fusionauth.io/account/free-trial/start) which comes with a free Starter plan to explore [other paid features](/docs/get-started/core-concepts/premium-features).

