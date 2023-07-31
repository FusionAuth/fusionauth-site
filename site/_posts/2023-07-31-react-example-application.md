---
layout: blog-post
title: Using the FusionAuth React SDK in a React application
description: In this guide, we'll showcase how to use the FusionAuth React SDK to implement the login, logout, and registration flows in a React application.
author: Colin Frick
category: blog
image: blogs/react-example-application/react-example-application.png
tags: tutorial tutorial-react tutorial-typescript react typescript oauth javascript
excerpt_separator: "<!--more-->"
---

The React SDK from FusionAuth enables developers to implement the login, logout, and registration flows in a React application with ease.

<!--more-->

To show the React SDK in action, we will be using the FusionDesk application. FusionDesk is a simple help desk example application that allows users to create tickets and view them. The application is built using React and Node.js. It uses a server backend built using Ts.Ed, Node.js, and Typescript.

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-tickets.png" alt="FusionDesk showing the main list of tickets" class="img-fluid" figure=false %}

To get started with your own React application, install the FusionAuth React SDK and follow the [FusionAuth React SDK](/docs/v1/tech/client-libraries/react-sdk) documentation.

```bash
npm install @fusionauth/react-sdk
```

### Prerequisites

To follow along with this article, you will need to have the following installed:

* Node.js
* Git
* Docker with Docker Compose (optional)

{% include _callout-tip.liquid
content=
"If you want to run the example application on another domain than `localhost`, you need to make sure that FusionAuth runs on the same domain as the backend of the application.

FusionAuth will set the `SameSite` attribute of the access token `app.at` cookie to `Lax`. This enables the cookie to be sent with requests to applications in the same subdomain. If the backend of the application runs on a different domain, the cookie will not be sent. This will result in the backend not being able to validate the token.

For example, if FusionAuth is running on `https://auth.example.com` and the backend of the application is running on `https://api.example.com`, the access token will be transmitted, but if the backend of the application is running on `https://api.piedpiper.com`, the access token will not be transmitted.

See the [Hosted Backend APIs documentation](/docs/v1/tech/apis/hosted-backend#prerequisites) for more information."
%}

### Clone the Repository

To begin, clone the demo application from GitHub using the following command:

```bash
git clone https://github.com/fusionauth/fusionauth-example-react-fusiondesk
```

### Set up the FusionAuth Application

To set up the FusionAuth application, follow the steps below:

```bash
cd fusionauth-example-react-fusiondesk
docker compose up -d
# Wait until FusionAuth is set up and available at http://localhost:9011
cd server && cp example.env .env && npm install && npm run seed && cd ..
cd client && cp example.env .env && npm install && cd ..
```

### Run the Application

To run the application, follow the steps below:

```bash
cd server && npm run start
```

Open a new terminal and run the following command:

```bash
cd client && npm run start
```

The application is now running on [localhost:3000](http://localhost:3000).

Use the following credentials to log in:
- Email: `admin@example.com`
- Password: `password`

This will log you in as an agent. You can also log in as a user by using the following credentials:
- Email: `richard@example.com`
- Password: `password`

### Set up the FusionAuth Instance manually

If you do not want to use Docker, you can set up the FusionAuth instance manually. To do so, follow the steps detailed in the [FusionAuth documentation](/docs/v1/tech/installation-guide/fusionauth-app) and the [README.md](https://github.com/fusionauth/fusionauth-example-react-fusiondesk/blob/main/README.md) of the example application.

## Using Hosted OAuth Service Provider Endpoints

Authentication is hard. We want to make it easy.
That is why we have added the necessary endpoints for the OAuth 2.0 login flow into the FusionAuth API. This means that you can use FusionAuth to authenticate users without setting up a separate back end to handle the token exchange. This is a great way to get started with FusionAuth and to use it as a drop-in replacement for your existing OAuth 2.0 provider. So you can concentrate on providing the best experience for your users.

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-fusionauth-login.png" alt="Login Screen of FusionAuth with the styling of FusionDesk" class="img-fluid" figure=false %}

As you can see - if you inspect the backend of the example application - we do not provide any OAuth 2.0 endpoints. Instead, we use FusionAuth provided functionality to authenticate users.

After the user has logged in to FusionAuth, the `app.at` is stored in a cookie. This cookie is then sent with every request to the backend, where we validate the token in a middleware. If the token is valid, we allow the request to continue. If the token is invalid, we return a `401` status code.

```typescript
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/server/src/middlewares/fusion-auth.middleware.ts' %}
```

We also use the FusionAuth API to retrieve user information for the creator of a ticket. This is done in the `FindAllTicketsController.ts` file using the `retrieveUser` method of the FusionAuth API client for typescript.

```typescript
const tickets = await this.ticketRepository.find({where, order: {id: 'DESC'}});

// Retrieve uses from FusionAuth
const creators = new Map<string, any>();
const client = new FusionAuthClient(this.apiKey, this.baseUrl);

for await (const ticket of tickets) {
  if (!creators.has(ticket.creator)) {
    const user = await client.retrieveUser(ticket.creator);
    creators.set(ticket.creator, user.response.user);
  }
}
```

### Theming the Login / Register View in FusionAuth

The login / register view in FusionAuth can be themed using the FusionAuth theme editor. You can find more information about the theme editor in the [FusionAuth documentation](/docs/v1/tech/themes/).

For this example application, we integrate Tailwind CSS and DaisyUI into the theme by automatically generating the css stylesheet based on the FusionAuth theme templates. See the [Tailwind CSS documentation](/docs/v1/tech/themes/tailwind) for more information.

## Benefits of the React SDK

The React SDK enables developers to implement the login, logout, and registration flows in a React application.

It provides pre-built buttons for login, logout, and registration. It also provides a `withFusionAuth` [HOC](https://reactjs.org/docs/higher-order-components.html) that can be used to wrap a component and provide the user information to the component.
With `RequireAuth` you can wrap a component and require the user to be authenticated before the component is rendered. The `withRole` option also enables you to restrict the user to a specific role.

`RequireAuth` is used in the `LoggedInMenu` component, which is used to display the user information, profile, and logout button if the user is authenticated.

```tsx
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/client/src/components/LoggedInMenu.tsx' %}
```

With the `FusionAuthConfig` you can configure the FusionAuth instance that is used by the React SDK. If you are using a different OAuth 2.0 backend, you will most likely have to configure the route props.

We are using the React Router v6 in the example application. To protect routes, we are using a custom `ProtectedRoutes` component. This component uses the `useFusionAuth` hook to check if the user is authenticated. If the user is authenticated, the component renders the `Outlet` component. If the user is not authenticated, the component redirects the user to the `/` route.

```tsx
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/client/src/components/ProtectedRoutes.tsx' %}
```

{% include _callout-note.liquid
content=
"For more information about the React SDK, see the [FusionAuth React SDK](/docs/v1/tech/client-libraries/react-sdk) documentation."
%}

### Login Page

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-login.png" alt="Login / Register Prompt if the user is not authenticated" class="img-fluid" figure=false %}

The login page allows the user to login or register using the FusionAuth login / register flow. The login page is implemented in the `LoginPage.tsx` file and displays the `login` and `register` buttons.
To use the button styling provided by DaisyUI instead of the one provided by FusionAuth, we are not using the pre-built buttons from the React SDK. Instead, we are using the `useFusionAuth` hook to get the `login` and `register` methods from the `FusionAuthContext`.

```tsx
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/client/src/pages/LoginPage.tsx' %}
```

### Tickets Page

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-tickets.png" alt="Overview of the tickets when the user is authenticated" class="img-fluid" figure=false %}

The tickets page displays the tickets of the user. The tickets are retrieved from the backend using the `/api/tickets` endpoint. The returned tickets depend on the role of the user. If the user is only a `customer`, only the tickets of the user are returned.

We also embed the user information in the backend response. This allows us to display the creator information of the ticket (full name, picture).

Backend `GET /` endpoint:

```typescript
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/server/src/controllers/rest/ticket/FindAllTicketsController.ts' %}
```

Frontend `TicketsPage.tsx`:

```tsx
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/client/src/pages/TicketsPage.tsx' %}
```

### Ticket Details Page

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-ticket.png" alt="Ticket details" class="img-fluid" figure=false %}

The ticket page allows the user to create or update a ticket. The ticket page is implemented in the `TicketPage.tsx` file.
Depending on the state of the ticket and the role of the user, different actions are available.

Currently, the following flow is implemented:

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-flow.png" alt="The ticket flow implemented in FusionDesk" class="img-fluid" figure=false %}

If the ticket is open and the user is an `agent`, the user can mark the ticket as `solved`.

The creator of the ticket then has the option to either close or reopen the ticket with `Accept solution` or `Reject solution`.

After the ticket is closed, it cannot be edited anymore.

Backend `GET /:id`:

```typescript
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/server/src/controllers/rest/ticket/FindTicketController.ts' %}
```

Backend `POST /`:

```typescript
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/server/src/controllers/rest/ticket/CreateTicketController.ts' %}
```

Backend `PATCH /:id`:

```typescript
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/server/src/controllers/rest/ticket/UpdateTicketController.ts' %}
```

Frontend `TicketPage.tsx`:

```tsx
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/client/src/pages/TicketPage.tsx' %}
```

### Profile Page

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-profile.png" alt="Profile screen with information about the logged in user" class="img-fluid" figure=false %}

The profile page displays the user information. The profile page is implemented in the `ProfilePage.tsx` file and displays the information of the FusionAuth `user`.

```tsx
{% remote_include 'https://raw.githubusercontent.com/fusionauth/fusionauth-example-react-fusiondesk/main/client/src/pages/ProfilePage.tsx' %}
```

## Conclusion

In this article, we have shown how to use the FusionAuth React SDK in a React application. We have also shown how to use the FusionAuth OAuth 2.0 login flow in a React application and what the benefits are.
