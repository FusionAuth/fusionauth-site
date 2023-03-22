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
"If you want to run the example application on another domain than `localhost`, you need to make sure that FusionAuth runs on the same domain as the backend of the application. This is a limitation of the Hosted OAuth Service Provider Endpoints."
%}

{% include _callout-important.liquid
content=
"This article was written using an early look at the FusionAuth Hosted OAuth Service Provider Endpoints. The feature may be not yet available in the latest version of FusionAuth. You can track progress on the issue on [Github fusionauth-issues#1943](https://github.com/FusionAuth/fusionauth-issues/issues/1943)"
%}

### Clone the Repository

To begin, clone the demo application from GitHub using the following command:

```bash
git clone https://github.com/FusionAuth/fusionauth-react-example-app-placeholder-replaceme
```

### Set up the FusionAuth Application

To set up the FusionAuth application, follow the steps below:

```bash
cd fusionauth-react-example-app-placeholder-replaceme
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

The application is now running on `http://localhost:3000`.

Use the following credentials to log in:
- Email: `admin@example.com`
- Password: `password`

This will log you in as an agent. You can also log in as a user by using the following credentials:
- Email: `richard@example.com`
- Password: `password`

### Set up the FusionAuth Instance manually

If you do not want to use Docker, you can set up the FusionAuth instance manually. To do so, follow the steps detailed in the [FusionAuth documentation](/docs/v1/tech/installation-guide/fusionauth-app) and the [README.md](https://github.com/FusionAuth/fusionauth-react-example-app-placeholder-replaceme/blob/main/README.md) of the example application.

## Using Hosted OAuth Service Provider Endpoints

Authentication is hard. We want to make it easy.
That is why we have added the necessary endpoints for the OAuth 2.0 login flow into the FusionAuth API. This means that you can use FusionAuth to authenticate users without setting up a separate back end to handle the token exchange. This is a great way to get started with FusionAuth and to use it as a drop-in replacement for your existing OAuth 2.0 provider. So you can concentrate on providing the best experience for your users.

{% include _callout-important.liquid
content=
"For limitations and prerequisites, see the [Hosted OAuth Service Provider Endpoints](https://fusionauth.io/xyz) documentation."
%}

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-fusionauth-login.png" alt="Login Screen of FusionAuth with the styling of FusionDesk" class="img-fluid" figure=false %}

As you can see - if you inspect the backend of the example application - we do not provide any OAuth 2.0 endpoints. Instead, we use FusionAuth provided functionality to authenticate users.

When the user accesses the backend, we validate the `access_token` cookie. If the cookie is valid, we will return the tickets. If the cookie is not valid, we return a 401 error.

See `server/src/middlewares/fusion-auth.middleware.ts` for the implementation.

{% include _callout-note.liquid
content=
"Currently every request validates the `access_token` with FusionAuth using the `/oauth2/introspect` endpoint. This is not the most efficient way to validate the token. Depending on the security requirements of your application, you might want to cache this information or validate the `access_token` directly without using the FusionAuth API."
%}

We also use the FusionAuth API to retrieve user information for the creator of a ticket. This is done in the `TicketController.ts` file using the `retrieveUser` method of the FusionAuth API client for typescript.

### Theming the Login / Register View in FusionAuth

The login / register view in FusionAuth can be themed using the FusionAuth theme editor. You can find more information about the theme editor in the [FusionAuth documentation](/docs/v1/tech/themes/).

For this example application, we integrate Tailwind CSS and DaisyUI into the theme by automatically generating the css stylesheet based on the FusionAuth theme templates.

## Benefits of the React SDK

The React SDK enables developers to implement the login, logout, and registration flows in a React application.

It provides pre-built buttons for login, logout, and registration. It also provides a `withFusionAuth` [HOC](https://reactjs.org/docs/higher-order-components.html) that can be used to wrap a component and provide the user information to the component.
With `RequireAuth` you can wrap a component and require the user to be authenticated before the component is rendered. The `withRole` option also enables you to restrict the user to a specific role.

`RequireAuth` is used in the `LoggedInMenu` component, which is used to display the user information, profile, and logout button if the user is authenticated.

With the `FusionAuthConfig` you can configure the FusionAuth instance that is used by the React SDK. If you are using a different OAuth 2.0 backend, you will most likely have to configure the route props.

We are using the React Router v6 in the example application. To protect routes, we are using a custom `ProtectedRoutes` component. This component uses the `useFusionAuth` hook to check if the user is authenticated. If the user is authenticated, the component renders the `Outlet` component. If the user is not authenticated, the component redirects the user to the `/` route.

```tsx
export const ProtectedRoutes: FC = () => {
  const {isLoading, isAuthenticated} = useFusionAuth();

  if (isLoading) return null;

  return (isAuthenticated ? <Outlet/> : <Navigate to={'/'} replace={true}/>);
};
```

{% include _callout-note.liquid
content=
"For more information about the React SDK, see the [FusionAuth React SDK](/docs/v1/tech/client-libraries/react-sdk) documentation."
%}

{% include _callout-note.liquid
content=
"Any code snippets in this article are excerpts from the example application. You can find the full source code on GitHub."
%}

### Login Page

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-login.png" alt="Login / Register Prompt if the user is not authenticated" class="img-fluid" figure=false %}

The login page allows the user to login or register using the FusionAuth login / register flow. The login page is implemented in the `LoginPage.tsx` file and displays the `login` and `register` buttons.
To use the button styling provided by DaisyUI, we are not using the pre-built buttons from the React SDK. Instead, we are using the `useFusionAuth` hook to get the `login` and `register` methods from the `FusionAuthContext`.

```tsx
  const {isAuthenticated, isLoading, login, register} = useFusionAuth();

  return (
    <div className="flex flex-col w-full border-opacity-50">
      <button onClick={() => login()} className="btn btn-primary">Login</button>
      <div className="divider">OR</div>
      <button onClick={() => register()} className="btn btn-primary">Register Now</button>
    </div>
  )
```

### Tickets Page

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-tickets.png" alt="Overview of the tickets when the user is authenticated" class="img-fluid" figure=false %}

The tickets page displays the tickets of the user. The tickets are retrieved from the backend using the `/api/tickets` endpoint. The returned tickets depend on the role of the user. If the user is only a `customer`, only the tickets of the user are returned.

We also embed the user information in the backend response. This allows us to display the creator information of the ticket (full name, picture).

```tsx
<div className="flex items-center space-x-3">
  <Avatar name={ticket._creator.firstName + ' ' + ticket._creator.lastName} url={ticket._creator.imageUrl}/>
  <div>{ticket._creator.firstName} {ticket._creator.lastName}</div>
</div>
```

### Ticket Details Page

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-ticket.png" alt="Ticket details" class="img-fluid" figure=false %}

The ticket page allows the user to create or update a ticket. The ticket page is implemented in the `TicketPage.tsx` file.
Depending on the state of the ticket and the role of the user, different actions are available.

Currently, the following flow is implemented:

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-flow.png" alt="The ticket flow inplemented in FusionDesk" class="img-fluid" figure=false %}

If the ticket is open and the user is an `agent`, the user can mark the ticket as `solved`.

The creator of the ticket then has the option to either close or reopen the ticket with `Accept solution` or `Reject solution`.

After the ticket is closed, it cannot be edited anymore.

### Profile Page

{% include _image.liquid src="/assets/img/blogs/react-example-application/fusiondesk-profile.png" alt="Profile screen with information about the logged in user" class="img-fluid" figure=false %}

The profile page displays the user information. The profile page is implemented in the `ProfilePage.tsx` file and displays the information of the FusionAuth `user`.

```tsx
  const {user} = useFusionAuth();

  return (
    { user.picture ?(
      <figure><img src={user.picture} className="w-96 h-96" alt="Avatar"/></figure>
    ) : (
      <figure className="bg-neutral-focus text-neutral-content w-96 h-96">
        <span className="text-8xl">{initials(user.given_name + ' ' + user.family_name)}</span>
      </figure>
    )}
    <div className="card-body">
      <h2 className="card-title">{user.given_name} {user.family_name}</h2>
    
      <table>
        <tbody>
        <tr>
          <td><FontAwesomeIcon icon={faAt}/></td>
          <td>{user.email}</td>
        </tr>
        {user.phone_number &&
          <tr>
            <td><FontAwesomeIcon icon={faPhone}/></td>
            <td>{user.phone_number}</td>
          </tr>
        }
        </tbody>
      </table>
    </div>
  )
```

## Conclusion

In this article, we have shown how to use the FusionAuth React SDK in a React application. We have also shown how to use the FusionAuth OAuth 2.0 login flow in a React application and what the benefits are.
