---
layout: blog-post
title: How to securely implement OAuth in Angular 
description: A detailed overview of securely integrating an Angular application with an OAuth provider using the OAuth Authorization Code Grant  
author: Dan Moore
image: blogs/fusionauth-example-angular/oauth-angular-fusionauth.png
category: blog
excerpt_separator: "<!--more-->"
---

In this post, we'll walk through setting up an Angular app to securely authenticate with an OAuth2 server. We'll use a proxy server between the Angular application and the OAuth server, in order to use the authorization code grant (rather than the [insecure implicit grant](https://medium.com/oauth-2/why-you-should-stop-using-the-oauth-implicit-grant-2436ced1c926)). 

<!--more-->

At the end of this tutorial, you will have a working Angular application which allows a user to sign in, sign out and view and update profile data. 

We'll be using the following software versions:
- Angular 9.0.6
- Express 4
- FusionAuth 1.15.5

You need to have the following software installed before you begin:
- Docker (optional, but preferred for installing FusionAuth)
- node 12.x (other versions of Node may work, but have not been tested)
- npm (comes with recent versions of node)

You'll also want to make sure your system meets the [memory, storage and CPU requirements](https://fusionauth.io/docs/v1/tech/installation-guide/system-requirements) for FusionAuth.

## Architecture
This application has three main components. All of these will run locally.

The first is the Angular app, which provides the user interface. It is a single page application, with different data displayed when a user is signed in and signed out. This application will be at `http://localhost:4200/` and will be accessed by a browser.

The second part of the application is a lightweight express middleware server. This proxies requests from the Angular app to FusionAuth, our OAuth2 and identity server. Using express keeps sensitive configuration values safe--if we embedded them directly in the Angular app, an attacker could extract them. This server also executes business logic, such as verifying that a user is active in FusionAuth before allowing their information to be retrieved. This server is executed by Node and is at `http://localhost:3000/`. It will be accessed by Angular components.

Finally, there's the FusionAuth OAuth2 and identity server, which is a standalone application accessible at `http://localhost:9011`. This will be accessed by you, during configuration, and by the express server when data is retrieved or stored. 

## Setting up FusionAuth

FusionAuth will be our OAuth2 and identity server for this tutorial. All user data will be persisted there. OAuth2 is the current standard for identity. Using a central identity server like FusionAuth means we can manage users across any number of custom or off the shelf applications in one place.

If you don't already have FusionAuth installed, we recommend the Docker Compose option for the quickest setup:

```shell
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

Check out the [Download FusionAuth page](https://fusionauth.io/download) for other installation options (rpm, deb, etc) if you don't have Docker installed.

After you sign in as a FusionAuth administrator, create a new application. I named mine 'Secure Angular', and will refer to this throughout the tutorial.

Click the OAuth tab and set the following application settings:
- Set `Authorized redirect URLs` to: `http://localhost:3000/oauth-callback` 
  - This is the express server URL which will handle processing the FusionAuth callback.
- Set `Logout URL` to: `http://localhost:4200`
  - This is the URL where the FusionAuth server will send us after logout.

Click `Save`.

Then click the green magnifying glass in the list view for your newly created application. Find these configuration parameters and copy them to a text file, we'll use them later:

- Application ID (also called just 'Id')
- Client ID
- Client Secret

If you edit your new application, your application settings should look like this:

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-angular/admin-application-configuration.png" alt="Application configuration" class="img-fluid" figure=false %}


Next, add a user. This is the account you'll use to authenticate from the Angular application.

The email address doesn't have to be valid because we're not going to send any emails to the user. I used `angularuser@example.com`.  Uncheck `Send email to setup password` so you can set their password in the admin screen. Add the user to the application you just created, by clicking the `Add registration` button and selecting `Secure Angular`. Leave everything else as the default values and click the save icon.

Next, add an API key. This will be used for updating and reading user information. Operations using the API key are not part of the OAuth standard, but are included to showcase other capabilities of FusionAuth. This API key needs to be kept secret and thus will not be used outside of the express middleware.

Navigate to `Settings` then `API keys` and add a new API key. Give it a name such as `For Secure Angular app`. Copy the value of the key to the same text file where you saved the Application ID, Client ID and Client Secret. Scroll down and enable `GET` and `PATCH` for the `/api/user/registration` Endpoint. No other permissions are needed for this tutorial.

Now FusionAuth is set up and ready to roll. Next, let's set up a basic Angular application.

## Basic Angular application

If you don't have the angular-cli tool installed, install it now:

```shell
$ npm install -g @angular/cli
```

At the time of writing, that command installs Angular 9.0.6.

Create an Angular application. (However, if you want to grab all the tutorial code at once rather than step through it, clone [the GitHub repository](https://github.com/FusionAuth/fusionauth-example-angular).)

```shell
$ ng new secure-angular
```

You can accept all defaults for the new application.

If you open a new terminal window and run 

```shell
$ ng serve 
```

You should be able to visit `http://localhost:4200` in your browser and see a default screen. Now, let's clean up the default application and make it a bit simpler.

Edit `src/app/app.component.html` and delete everything, and replace it with:

```html
<h1>
My Secure Angular Application
</h1>
<router-outlet></router-outlet>
```

Next, create a home component:

```shell
$ ng g component home
```

Make the home component the default route:

Edit or create `src/app/app-routing.module.ts` and add the following lines:

```typescript
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

Make sure you import the AppRouting module in `src/app/app.module.ts`, which should look like this:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Restart your Angular server by going to the terminal where you ran `ng serve` and stopping it with a control-C, then restarting:

```shell
$ ng serve
```

You should now see a screen like this when you visit `http://localhost:4200/`

We have a basic application up and running. Next, let's display some fake user information, pulled from the express middleware server. 

## Bring in the Services

As mentioned in the architecture overview, a basic express server will sit between the Angular application and the identity server. At first this information will be hardcoded and not pulled from the identity server, but eventually we'll pull the data from FusionAuth. 

The first step to access remote services from Angular is to add the HttpClient module into our application, that is, into the src/app/app.module.ts file. Here's how that file will look after doing so:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

This module allows us to make http requests from our code. Then we want to generate a service and inject it into our HomeComponent so we can display some remote data.

```shell
$ ng g service user
```

Add this code to src/app/user.service.ts

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private SERVER_URL = "http://localhost:3000/user";

  constructor(private httpClient: HttpClient) { }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  public get() {
    return this.httpClient.get(this.SERVER_URL, {withCredentials: true}).pipe(catchError(this.handleError));
  }
}
```

This service sets up a call to the API at `http://localhost:3000`; it allows whatever code calls get() to actually make the API call. It also provides error handling if there are any issues retrieving the data. 

Now, the previously created HomeComponent must be able to access this service, so we need to make sure to inject it. We need to import the UserService to our HomeComponent class, add a parameter to the constructor and then, on initialization of the component, call out to the service and store the data it returns.

Update `src/app/home/home.component.ts` to look like this:

```typescript
import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user = {`email`:`test@example.com`}
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.get().subscribe((data: any) => {
      console.log(data);
      this.user = data;
    });
  }
}
```

Let's also modify the `src/app/home/home.component.html` to display the user variable.

```html
<p>home works!</p>
User: {{ "{{user.email" }}}}
```

Finally, create the express server to provide the data. Again, right now it will be fake data, but eventually it will pull from our OAuth2 server.

First, install our needed libraries:

```shell
$ npm install cors express express-session request
```

Add this line to package.json under the `scripts` key:

```json

"server": "node server/index.js",
```

This will let us start our server by running `npm run server`.

Make a directory for our server:

```shell
$ mkdir server
```

Create a `config.js` file in the server directory, and add our ports to it:

```javascript
module.exports = {
  // ports
  clientPort: 4200,
  serverPort: 3000,
  fusionAuthPort: 9011
};
```

We'll continue to add to this config.js file as we build out the complete application. Anything that will vary between environments (for example, development, staging, and production) should be put in this file. Note that while config.js is checked into the [example application code repository](https://github.com/FusionAuth/fusionauth-example-angular), for any production grade application, this file contains secrets and should not be in version control. 

Next create an index.js file in the server directory:

```typescript
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const config = require('./config');

const app = express();
app.use(express.json());

app.use(cors({
  origin: true,
  credentials: true
}));

app.use('/user', require('./routes/user'));

app.listen(config.serverPort, () => console.log(`FusionAuth example app listening on port ${config.serverPort}.`));
```

We're using the [cors middleware](https://www.npmjs.com/package/cors) so that our Angular application will have permission to access this server from the browser without any cross domain issues. We also set up one route: `/user`

We need to create a file at server/routes/user.js to service that route.

```typescript
const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../config');

router.get('/', (req, res) => {
  res.send({
    "email" : "angularuser@example.com"
  });
});

module.exports = router;
```

You can see the fake data we're sending back.

Open another terminal window and start the server:

```shell
$ npm run server
```

You should see this line at the bottom of your screen if your server is up and running correctly:

```
FusionAuth example app listening on port 3000.
```

Every time we make a change to the express server, we'll have to restart it. Now, when we visit our Angular application in the browser, we should see the email drawn from the express server.

Now, let's add the ability to authenticate against the FusionAuth identity server.

## Sign in

The first thing we want to do is provide a link to sign in. We're going to proxy through the express server in order to keep our architecture clean. Then we'll show the sign in link only to users who are not signed in. Once a user is, we'll display their email address.

Note that we send the user directly to FusionAuth to sign in. We could have instead built the screen in the express server, but FusionAuth allows you to [style your login page](https://fusionauth.io/docs/v1/tech/themes/) however you'd like. In addition, if you build the login page in express, you technically would not be following the OAuth2 flow.

FusionAuth also needs to know where to send the user after successful authentication, so let's add that to our config.js. Let's also add the application ID, client ID and other OAuth secrets that we saved off in a text file when we configured our FusionAuth API:

```javascript
module.exports = {

  clientID: 'ca4c52d5-be47-442e-8487-3b4fde8af4bb',
  clientSecret: 'ia_YAKiWwdBTXRSbh5x3TiEPykj8o3WV78uFHFhWA_8',
  redirectURI: 'http://localhost:3000/oauth-callback',
  applicationID: 'ca4c52d5-be47-442e-8487-3b4fde8af4bb',

  // our FusionAuth api key
  apiKey: 'hBfNosIjQQ64InDdKC7XlTCtJitq23nwlNp2rQfDMBU',

  //ports
  clientPort: 4200,
  serverPort: 3000,
  fusionAuthPort: 9011
};
```

Except for the ports and the `redirectURI`, your values should be different for all the keys.

We need to enable [sessions](https://www.npmjs.com/package/express-session) for the express server because that is where we'll capture the access_token after authentication. We'll then use that for any interaction with protected resources and to identify the user.

Add the following lines to your `index.js`, anywhere before the routes definition:

```javascript
// configure sessions
app.use(session(
  {
    secret: '1234567890',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: 'auto',
      httpOnly: true,
      maxAge: 3600000
    }
  })
);
```

Next, add the login and oauth-callback routes to `index.js`:

```javascript
app.use('/login', require('./routes/login'));
app.use('/oauth-callback', require('./routes/oauth-callback'));
```

And a corresponding routes/login.js file

```javascript
const express = require('express');
const router = express.Router();
const config = require('../config');

router.get('/', (req, res) => {
  res.redirect(`http://localhost:${config.fusionAuthPort}/oauth2/authorize?client_id=${config.clientID}&redirect_uri=${config.redirectURI}&response_type=code`);
});

module.exports = router;
```

As mentioned above, this is a proxy. We could also put the code directly into the Angular html component if we wanted (no secrets are in that URL, after all), but this is a bit cleaner.

Let's also add the `routes/oauth-callback.js` file:

```javascript
const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../config');

router.get('/', (req, res) => {
  request(
    // POST request to /token endpoint
    {
      method: 'POST',
      uri: `http://localhost:${config.fusionAuthPort}/oauth2/token`,
      form: {
        'client_id': config.clientID,
        'client_secret': config.clientSecret,
        'code': req.query.code,
        'grant_type': 'authorization_code',
        'redirect_uri': config.redirectURI
      }
    },

    // callback
    (error, response, body) => {
      // save token to session
      req.session.token = JSON.parse(body).access_token;

      // redirect to the Angular app
      res.redirect(`http://localhost:${config.clientPort}`);
    }
  );
});

module.exports = router;
```

This is a bit more complicated. When a user successfully signs into FusionAuth, we receive a code. But what we really want is the `access_token`, which allows us to call protected resources. We'll call an endpoint in the FusionAuth server to get the token. This `access_token` is what we save off to the session, and will use in future requests. 

Note that this file illustrates the key difference between the authorization grant code OAuth2 flow and the implicit grant flow. In the implicit grant flow, the `access_token` is returned directly to the client, exposing it to anyone with who can hijack the client. 

We also need to update the `routes/user.js` file to pull the user information from FusionAuth, rather than sending fake data.

```javascript
const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../config');

router.get('/', (req, res) => {
  // token in session -> get user data and send it back to the Angular app
  if (req.session.token) {
    request(
      {
        method: 'GET',
        uri: `http://localhost:${config.fusionAuthPort}/oauth2/userinfo`,
        headers: {
          'Authorization': 'Bearer ' + req.session.token
        }
      },

      // callback
      (error, response, body) => {
        let userInfoResponse = JSON.parse(body);

        // valid token -> get more user data and send it back to the Angular app
        request(
          // GET request to /registration endpoint
          {
            method: 'GET',
            uri: `http://localhost:${config.fusionAuthPort}/api/user/registration/${userInfoResponse.sub}/${config.applicationID}`,
            json: true,
            headers: {
              'Authorization': config.apiKey
            }
          },

          // callback
          (error, response, body) => {
            res.send(
              {
                ...userInfoResponse,
                ...body // body is results from the registration endpoint:w
              }
            );
          }
        );
      }
    );
  }

  // no token -> send nothing
  else {
    res.send({});
  }
});

module.exports = router;
```

If we have a token, we'll get user information, including their email address, via the userinfo endpoint. We'll also retrieve more information from the registration endpoint and return both to our Angular application. If all we want is the data available from the [userinfo endpoint](https://fusionauth.io/docs/v1/tech/oauth/endpoints#userinfo), we don't need to make that second API call.

Restart your express server by going to the terminal where it is running, hitting control-C and then running

```shell
$ npm run server
```

Finally, add a login link to `src/app/home/home.component.html`. Replace the existing file with this:

```html
<div *ngIf="user['email'] != null">
  Hello {{ "{{user['email']" }}}}
</div>
<div *ngIf="user['email'] == null">
  <a href='http://localhost:3000/login'>Log me in</a>
</div>
```

You can also change the user variable initialization statement in `src/app/home/home.component.ts` from

```typescript
user = {'email':'test@example.com'}
```
  
To

```typescript
user = {}
```

This will avoid a flickering 'hello' message that might otherwise appear while the user data is being loaded.

Now you can click the 'login' link and are redirected to the FusionAuth login screen. After entering the correct username and password (created when you set up FusionAuth), you arrive back at the home screen, with your email address displayed.

## Sign out
The next logical step is to enable signing out of the application. Both the express server and FusionAuth have sessions for any successful authentication, so there are two actions required to fully sign out:

- Delete the session in the express server
- Invalidate the session in FusionAuth

Of course, the user has to initiate signing out, so we need to add a logout link to the Angular application. Let's modify the express server first.

Add the logout route to `server/index.js`:

```javascript
// ...
app.use('/logout', require('./routes/logout'));
// ...
```

Then add the route handler at server/routes/logout.js

```javascript
const express = require('express');
const router = express.Router();
const config = require('../config');

router.get('/', (req, res) => {
  // delete the session
  req.session.destroy();

  // end FusionAuth session
  res.redirect(`http://localhost:${config.fusionAuthPort}/oauth2/logout?client_id=${config.clientID}`);
});

module.exports = router;
```

This route destroys the express session and then sends the user to FusionAuth to a crafted URL which invalidates the session via the [logout endpoint](https://fusionauth.io/docs/v1/tech/oauth/endpoints#logout). Again, restart your express server by going to the terminal where it is running, hitting control-C and then running

```shell
$ npm run server
```

Let's change the Angular application and add a link to allow a user to sign out. Add it below the Hello message in src/app/home/home.component.html, because it only makes senses to sign out if you are already authenticated:

```html
...
<div *ngIf="user['email'] != null">
  Hello {{ "{{user['email']" }}}}
<br/><a href='http://localhost:3000/logout'>Log me out</a>
</div>
...
```

Visit `http://localhost:4200` and sign in (note that you were logged out because you restarted the express server). You should be able to sign in and sign out at will.

If all you are looking for is Angular and OAuth2 authentication, this tutorial is complete. However, we're also going to add and update user data. FusionAuth can store a number of user attributes that are not part of the OAuth specification, but useful for real world systems.
 
## Storing and Reading User Data

FusionAuth has the ability to store data about users. One field called, aptly enough, `data`, can be used for any kind of textual data. We're going to write to and read from that field.

First, we're going to create an express route to write the field for a signed in user. Then we're going to create an angular component which lets the user modify the field, and finally we'll allow the user to see and modify the data when the user is logged in.

Add the express route to `server/index.js`:

```javascript
app.use('/set-user-data', require('./routes/set-user-data'));
```

And create a `server/routes/set-user-data.js` file:

```javascript
const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('../config');

router.post('/', (req, res) => {
  // fetch the user using the token in the session so that we have their ID
  request(
    {
      method: 'GET',
      uri: `http://localhost:${config.fusionAuthPort}/oauth2/userinfo`,
      headers: {
        'Authorization': 'Bearer ' + req.session.token
      }
    },

    // callback
    (error, response, body) => {
      let userInfoResponse = JSON.parse(body);
      request(
        // PATCH request to /registration endpoint
        {
          method: 'PATCH',
          uri: `http://localhost:${config.fusionAuthPort}/api/user/registration/${userInfoResponse.sub}/${config.applicationID}`,
          headers: {
            'Authorization': config.apiKey
          },
          json: true,
          body: {
            'registration': {
              'data': req.body
            }
          }
        },
        (err2, response2, body2) => {
          if (err2) {
            console.log(err2);
          }
        }
      );
    }
  );
});

module.exports = router;
```

We call the userinfo endpoint to get the user id (the value of the sub parameter) and then make a `PATCH` HTTP call to the endpoint (so we only update the fields we send, rather than all the data).

You might wonder why we only add a route to write the user data. What about reading it? Well, we already added that when we updated the user route to pull data from FusionAuth after login. It was both empty and hidden.

Restart your express server by going to the terminal where it is running, hitting control-C and then running:

```shell
$ npm run server
```

Now, let's create a separate Angular component to allow the user to update their data and call this express endpoint. 

Since we're going to be working with forms, update our `src/app/app.module.ts` file to add the needed supporting modules. We'll be using [template driven forms](https://angular.io/guide/forms#template-driven-forms) for this tutorial. Add 

```typescript
import { FormsModule }   from '@angular/forms'; 
```

to the import section and `FormsModule` to the imports array. 

Then we need to create a class

```shell
$ ng generate class UserData
```

Add a single member variable, so `src/app/user-data.ts` looks like this:

```typescript
export class UserData {
  constructor(public userdata: string) {  }
}
```

Next, we want to generate a service which we'll use to access the express endpoint we added:

```shell
$ ng g service userData
```

Replace the generated `src/app/user-data.service.ts` with

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {  throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  private SERVER_URL = "http://localhost:3000/set-user-data";

  constructor(private httpClient: HttpClient) { }

  handleError(error: HttpErrorResponse) {
    console.log("handle error");
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  public post(body: String){
    const httpOptions = {
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json' 
      })
    };
    return this.httpClient.post(this.SERVER_URL, body, httpOptions).pipe(catchError(this.handleError));
  }
}
```

This is very similar to the user service we created to retrieve the user data. However, we have a different endpoint and HTTP method (we are using `POST` here). Make sure the Content-Type header is set to `application/json`, otherwise express won't parse the body correctly.

Now we need to create the user data form component, which will use the data object and the service we just created.

```shell
$ ng generate component UserDataForm
```

Replace the contents of `src/app/user-data-form/user-data-form.component.ts` with

```typescript
import { Component, Input } from '@angular/core';
import { UserData }	from '../user-data';
import { UserDataService } from '../user-data.service';

@Component({
  selector: 'app-user-data-form',
  templateUrl: './user-data-form.component.html',
  styleUrls: ['./user-data-form.component.css']
})

export class UserDataFormComponent {

  @Input() userdata: string;
  model = new UserData('user data');
  constructor(private userDataService: UserDataService) { }

  submitted = false;

  onSubmit() {
    this.submitted = true;
    let userdata = this.model.userdata;
    let body = JSON.stringify( { userData: userdata });
    console.log(body);
    return this.userDataService.post(body).subscribe();
  }

  ngOnInit(): void {
    this.model = new UserData(this.userdata);
  }
}
```

We inject the `userDataService` into this code so we can make service calls. We have a submitted member variable that we'll use in our html to either show an input field or display read only data. We [must call `subscribe()`](https://angular.io/guide/http#always-subscribe) when we `POST`ing to our service, otherwise the HTTP call won't be made. 

The userdata field can be set from outside the component, which is why it has a [`@Input` decorator](https://angular.io/api/core/Input). We set it because the parent component is already retrieving the data (from the `/user` endpoint) so we'll want that to be the default value displayed (the 'user data' default string is there just in case the network call fails).

Now let's look at the html component:

```html
<div>
  <div [hidden]="submitted">
    <h1>User Data Form</h1>
    <form (ngSubmit)="onSubmit()" #userDataForm="ngForm">
      <div>
        <label for="userdata">User data</label>
        <input type="text" id="userdata" [(ngModel)]="model.userdata" name="userdata">
      </div>

      <button type="submit">Submit</button>
    </form>
  </div>

  <div [hidden]="!submitted">
    <h2>You submitted the following:</h2>
    <div>
      <div>User Data</div>
      <div>{{ "{{model.userdata" }}}}</div>
    </div>
    <br>
    <button (click)="submitted=false">Edit</button>
  </div>
</div>
```

The first div is displayed when the component isn't submitted, and the second is displayed when the form has been submitted: we show the user's input. We also use the ngModel attribute to tie the input field value to the appropriate model member variable.

Finally, let's add this into our home component, updating the div we display for a logged in user to:

```html
<div *ngIf="user['email'] != null">
  Hello {{ "{{user['email']" }}}}
  <br/>
  <app-user-data-form userdata="{{ "{{user['registration']['data']['userData']" }}}}"></app-user-data-form>
  <br/>
  <a href='http://localhost:3000/logout'>Log me out</a>
</div>
...
```

Because we are reaching deep into the user object in the html, we need to set a sane default in `src/app/home/home.component.ts`. Update `ngOnInit` to:

```typescript
ngOnInit(): void {
  this.userService.get().subscribe((data: any) => {
    console.log(data);

    // sane default for user data
    data.registration.data = data.registration.data || {};
    this.user = data;
  });
}
// ...
```

Now you are able to sign in and update your data field. If you sign in using a different browser, you will see your updated user data field.

And you can see it in the back end of the FusionAuth user admin screen:

{% include _image.liquid src="/assets/img/blogs/fusionauth-example-angular/admin-user-data.png" alt="User data in the FusionAuth admin UI" class="img-fluid" figure=false %}


## Next steps

Congratulations! You now have a working Angular application which uses OAuth2 to authenticate your users in a secure fashion. In addition, you can update an attribute of the user in your FusionAuth identity store.

To take it further, consider these enhancements:
- Validate the user's input when they are adding in user data. Perhaps you want to make sure they add no more than 200 characters?
- Set up express to store the sessions across server restarts so you don't have to login every time a new release is deployed. (Hint, [use a different store](https://www.npmjs.com/package/express-session#compatible-session-stores)).
- Move the sensitive values from `config.js` to environment variables.

