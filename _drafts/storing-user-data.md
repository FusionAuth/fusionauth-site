---
layout: blog-post
title: Storing User Data in FusionAuth
description: FusionAuth makes it simple to store and manage custom user data.
author: John Philips
excerpt_separator: "<!--more-->"
categories:
- Technology
- Products
- FusionAuth
tags:
- User Management
- FusionAuth
- code
- user data
- Identity Management
image: blog/NEEDIMAGE
---

Storing user data in FusionAuth is not difficult and can save data essential to a user's experience. This article will walk you through the basic steps of storing and retrieving user data in FusionAuth.

To get started, clone or download the [FusionAuth example template](https://github.com/FusionAuth/passport-example-template "Jump to GitHub") from GitHub. If you want to follow along with this how to, you’ll need to have node and npm installed on your machine. (It should work with older versions, but we used node v8.9.4 and npm 5.6.0 which are the current stable releases at the time of writing.)
<!--more-->
NEED TO UPDATE SECTION FOR FUSIONAUTH PROCESS - install no sandbox
If you don’t yet have a FusionAuth account, <a href="/try-passport">you should create one</a>. You can sign up for free 14 day trial without a credit card here:</p>
<p style="text-align: center;"><a class="orange-button-material small w-button" href="/try-passport">TRY PASSPORT</a></p>

## Using the FusionAuth Sandbox

For this example, we are going to use the FusionAuth sandbox as our backend. If you’d rather install and run the backend on your development machine, <a href="/docs/1.x/tech/installation-guide/passport-backend">follow these installation instructions</a>.

First, open the file ``` fusionauth-example-template/server/config/config.json ``` in a text editor, and edit the line below.

change:
```java
"backendUrl": "http://fusionauth.local",
```

to:
```java
"backendUrl": "http://localhost:9011",
```

That’s the URL for the sandbox API endpoint. This config change tells the app to use the sandbox for the backend.

## Configure the Backend

We also need to add an API key for our app, or verify that one is already setup. Log in to the <a href="http://localhost:9011/login?loginId=admin@fusionauth.io" >sandbox backend UI</a>, using the following credentials:

```
username: admin@fusionauth.io
password: password
```

Once you have logged in, go to **Settings → API Keys** and check to see if an API key exists for the **Id** “4ed5eb32-0a97-40eb-a6d7-cca1f9fa3a0c”. Because the sandbox is a shared environment, it may already exist.

If it’s not listed, you should add it by clicking green “+” button at the top of the page. Use the ```apiKey``` listed in the ```config.json``` file we edited earlier.

## Setting Up The App (Installing Node Modules)

Before we can run the app locally, we need finish the install process. The sample app has two parts, a node app in the ```/server/``` directory and a react app in ```/react/```. We need to install dependencies for both.

Open a terminal and ```cd``` into the ```/server``` directory. From there run the following command:

```
$&gt; npm install
```

This installs the node modules need to run the node app.

Now ```cd``` into the ```/react``` directory and run the same command.

```
$&gt; npm install
```

This installs the node modules the react app needs.

## Starting the App

From the terminal, ```cd``` into the ```/server``` directory and run

```
$&gt; npm start
```

This will start the node half of the example app. When the app starts, you may see the following message in the terminal.

```
Unable to retrieve JWT Public Key. Status code from FusionAuth was [undefined]. Error response from FusionAuth was [undefined]
```

If you see this message, you need to do one more bit of configuration:
- Log in to the FusionAuth sandbox.
- Go to **Settings → Application** and locate the application named “Example Application” with the Id “4ed5eb32-0a97-40eb-a6d7-cca1f9fa3a0c”.
- Click the **Edit** button in the **Action** column.
- In the **Options** section, click the **JWT** tab.
- Enable JWT.
- Choose “**RSA using SHA-256**” from the **Signing algorithm** dropdown menu. (Any of the RSA options will work.)
- Click the blue button with the arrow icon to generate your RSA keys.
- Click the save button at the top of the page.

If you had to configure JWT, you need to stop and restart the app.

Open a new terminal window, ```cd``` into the ```/react``` directory and run:

```
$&gt; npm start
```

Go to [http://localhost:3000/](http://localhost:3000/ "Localhost"). You should see a page that looks like this:

<img class="aligncenter size-full wp-image-8089" src="" alt="FusionAuth Login Page" width="1064" height="504">

## Register a New User

- In your browser, click the link “**Sign up here.**”
- Fill out the sign up form.

Because the sandbox is a shared environment, other people can see info about the users you create. For example, the email address of the registered user is shown on the dashboard. You may want to use a testing email address like “test@test.com”.

Once you have registered a user, you will see the following page.

<img class="aligncenter size-full wp-image-8090" src="" alt="FusionAuth Log In Successful Screen" width="1064" height="350"

Congratulations! You have a sample app running that is using FusionAuth to manage users.

## Modifying the App to Store User Data

Now that we have the app running, we can modify it to start storing data about our users. In our sample app, we are going to modify the the file ```HelloWorld.jsx``` in the ```/react/src/``` components directory. This react component verifies that the user is logged in and displays the message “You have successfully authenticated and are logged into your application.”


In the HelloWorld component, this is handled by the render function on line 46:

```javascript
return (
    &lt;div&gt;
        {this.state.message}
    &lt;/div&gt;
);
```

We are going to modify the page to show three buttons, each re-representing a different pricing plan. Edit the ```render``` section so that it looks like this:

```javascript
render() {
   return (
      &lt;div&gt;
         &lt;h1&gt;Chooose a Plan&lt;/h1&gt;
            &lt;button className="button free"&gt;Intro – Free&lt;/button&gt;
            &lt;button className="button basic"&gt;Basic – $5.00&lt;/button&gt;
            &lt;button className="button deluxe"&gt;Deluxe – $10.00&lt;/button&gt;
         &lt;h2&gt;Your Plan&lt;/h2&gt;
         {this.state.plan ? this.state.plan : 'loading'}
      &lt;/div&gt;
   );
}
```

If you are unfamiliar with react, this is JSX code. It looks pretty much like HTML, but there are some differences, like writing ```className=``` instead of ```class=```. The line that reads ```{this.state.plan ? this.state.plan : 'loading'}``` is using using a bit of conditional logic to show this.state.plan only if the variable is set.

The page now looks like this:

<img class="aligncenter size-full wp-image-8091" src="" alt="FusionAuth Buttons Initial before styling" width="1000" height="372">

Let's add some styling to make the buttons look a bit more attractive. Open the file ```/react/src/assets/index.css``` and the following code to the bottom of the file.

```css
body {
   margin: 0;
   padding: 0;
   font-family: 'Open Sans',sans-serif;
   font-size: 1.1em;
   line-height: 1.3em;
}

button.button {
   font-size: 110%;
   font-weight: bold;
   min-width: 10em;
   padding: 7px;
   margin: .5em .5em;
   text-align: center;
   background-color: #eee;
   border-color: rgba(0,0,0,0.3);
   border-radius: 3px;
}

.button.basic {
   background-color: #375989;
   color: white;
}

.button.deluxe {
   background-color: #25B696;
   color: white;
}
```

In a production app, you’d probably want this code somewhere else, but adding it to ```index.css``` is fine for our demo.

Now the page looks like this:

<img class="aligncenter size-full wp-image-8092" src="" alt="FusionAuth Buttons Styled" width="1000" height="436">

## Retrieving the User’s Registration

We are going to store the user’s choice of plan with their registration. FusionAuth supports single sign on. You can have multiple applications and your users can sign into each using the same credentials. The association between the user and the application is stored as a registration. So it makes sense to store application specific data with the registration for that app.

We are going to use these to API endpoints, [retrieve user registration](https://fusionauth.io/docs/1.x/tech/apis/registrations#retrieve-a-user-registration "Jump to FusionAuth Docs") and [update user registration](https://fusionauth.io/docs/1.x/tech/apis/registrations#update-a-user-registration "Jump to FusionAuth Docs"). (If you wanted, you could store the data under their user. In which case you user the [retrieve user](https://fusionauth.io/docs/1.x/tech/apis/users#retrieve-a-user "Jump to FusionAuth Docs") and [update user](https://fusionauth.io/docs/1.x/tech/apis/users#update-a-user "Jump to FusionAuth Docs") endpoints.)

First we are going to retrieve the registration for the logged in user, so we can see what plan, if any, they have chosen.

Modify the line 24 of ```HelloWorld.jsx``` so that it reads

```js
this.state = {
   userId: JSON.parse(localStorage.user).id
};
```
On successful login, the app is storing data about the user in [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage "Jump to Mozilla Docs"). This line adds the user’s ID to the [state of this component](https://reactjs.org/docs/faq-state.html "Jump to ReactJS Docs"). This allows us easy access to the user ID, which we will use for both the API calls we’ll make.

We are going to add a similar bit of code to the ```load``` function. In the ```configuration``` function called at the bottom of ```load```, add this line: ```this.setState({config: config});```. The modified code looks like this:

```js
configuration(function(config) {
   this.setState({config: config});
   this.xhr.open('GET', config.backend.url + '/api/application', true);
   this.xhr.setRequestHeader('Authorization', 'JWT ' + localStorage.access_token);
   this.xhr.send();
}.bind(this));
```

This adds a ```config``` object to the state of this component. We will use this to retrieve the backend URL that we will use in both our API calls.

Now we are ready to add a function ```retrieveReg``` to our component. The complete function looks like this:

```js
retrieveReg() {
   var plan = 'no plan chosen';
   window.fetch(this.state.config.backend.url + '/api/fusionauth/registration/' + this.state.userId)
   .then(function(response) { return response.json(); })
   .then(
      (result) =&gt; {
         if (result.registration &amp;&amp; result.registration.data &amp;&amp; result.registration.data.attributes ){
            plan = result.registration.data.attributes.plan
         };
      //console.log(result);
         this.setState({
            result: result,
            plan: plan
         });
      },
      (error) =&gt; {
         // just adding the error object to state, if it occurs
         this.setState({
            error: error
         });
      }
   )
}
```

We’re using [window.fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API "Jump to Mozilla Docs") to handle AJAX requests. This is supported only by newer browsers, so it wouldn’t be a good choice for a production app, but it simpler and easier read than ```XMLHttpRequest```. (The rest of example template app uses XMLHttpRequest which is a solid choice, but pretty low-level and verbose.)

React is a view library, it doesn’t provide any AJAX or networking support. It doesn’t have any opinions about how to handle this either, leaving developers free to choose. If you don’t want to use XMLHttpRequest you many want a library to help with this. One popular option is good old [jQuery.ajax](https://api.jquery.com/jQuery.ajax/ "Jump to jQuery site"). It gets used a lot because people are familiar with it. There is a [polyfill for fetch](https://github.com/github/fetch "Jump to GitHub"), providing support for older browsers. There is [Superagent](https://visionmedia.github.io/superagent/ "Jump to GitHub"), a callback-based library with a concise syntax. [Axios](https://github.com/mzabriskie/axios "Jump to GitHub") is a popular library, that uses promises instead of callbacks. For this demo, we are just going to use ```window.fetch```, so if you are coding along, keep in made that this will only work in newer browsers, unless you use the polyfill.

Back to the code, the call we are making is:

```js
window.fetch(this.state.config.backend.url + '/api/fusionauth/registration/' + this.state.userId)
```

Which resolves to a URL like ```http://localhost:8080/api/fusionauth/registration/f9c61843-c22a-410e-bd75-79d0dcb58c6a``` where that long GUID on the end is the user ID.

The call is to the “other half” of the app, running in the ```/server``` directory.

The other interesting part of the code is this section:

```js
(result) =&gt; {
   if (result.registration &amp;&amp; result.registration.data &amp;&amp; result.registration.data.attributes ){
      plan = result.registration.data.attributes.plan
   };
   //console.log(result);
   this.setState({
      result: result,
      plan: plan
   });
}
```
This takes the JSON returned by the call and looks to see if a plan is already stored. We are going to store this at ```registration.data.attributes.plan```. By convention, FusionAuth recommends storing app specific data at ```registration.data.attributes```.

This code isn’t doing anything with errors, other than adding a flag to component’s state.

We need to make two more alterations to ```HelloWorld.jsx``` before we are ready to move on. Near the top of the file, in the ```constructor``` we need to define our function with this line:

```js
this.retrieveReg = this.retrieveReg.bind(this);
```

We are going to call this function from ```_handleAJAXResponse``` which handles the data returned by the call in the ```load``` method. Locate the line ```this.setState(response);``` and add the following line ```this.retrieveReg();```.

The updated section of the function looks like this:

SOMETHING IN THIS CODE SECTION SEEMS TO SCREW UP THE FORMATTING. TRUE WHEN RENDERING TOO?
```js
_handleAJAXResponse() {
   if (this.xhr.readyState === XMLHttpRequest.DONE) {
      if (this.xhr.status === 200) {
         const response = JSON.parse(this.xhr.responseText);
         this.setState(response);
         this.retrieveReg();
      } else if (this.xhr.status === 401 || this.xhr.status === 403) {
...
```        

If we look at our app now, we are getting an error in the console. The call we are making to  ```http://localhost:8080/api/fusionauth/registration/{userId}``` is generating a 404 response. We need to add a route to the server to handle this call. Open the file ```server/controllers/fusionauth.js``` and add the following route.

```js
// Retrieve a user registration
router.route('/fusionauth/registration/:id').get((req, res) =&gt; {
   let userId = req.params.id;
   fusionauthClient.retrieveRegistration(userId, config.fusionauth.applicationId )
      .then((response) =&gt; {
         res.send(response.successResponse);
      })
      .catch((response) =&gt; {
         res.status(response.statusCode).send(response.errorResponse);
      });
});
```

The server half of the app uses [Express](https://expressjs.com "Jump to ExpressJS"), a simple web framework for node. The code above defines a [route](https://expressjs.com/en/guide/routing.html "Jump to ExpressJS Guide").


The actual API call to FusionAuth is being made by this line:

```js
fusionauthClient.retrieveRegistration(userId, config.fusionauth.applicationId )
```

We are using [FusionAuth Node Client library](https://github.com/FusionAuth/fusionauth-node-client/blob/master/lib/FusionAuthClient.js "Jump to GitHub/FusionAuth") which makes accessing the FusionAuth API easy. To make this call, we need to supply two parameters, the user ID and application ID, the latter of which is pulled from config (```config.fusionauth.applicationId```).

After adding this route, you need to stop and restart the Express server.

If you go back to the browser and refresh the page, the 404 error in the console will be gone. And if you uncomment the line ```//console.log(result);``` in ```retrieveReg```, you can see the JSON being returned in the console., it will look something like:

```js
{
   "registration": {
   "applicationId": "4ed5eb32-0a97-40eb-a6d7-cca1f9fa3a0c",
   "id": "fd9c3174-5430-4daa-93ad-cecc42283223",
   "insertInstant": 1517500702981,
   "lastLoginInstant": 1517507657923,
   "roles": [
      "user"
   ],
   "usernameStatus": "ACTIVE"
   }
}
```

## Updating the User’s Registration

Now we are ready to add a function that stores the selected plan in the user’s registration. Add the following function to ```HelloWorld.jsx```.

```js

   update(plan, e) {
      e.preventDefault();
      var request = this.state.result;
      request.registration.data = {
         attributes: {
            plan: plan
         }
      };
   window.fetch(this.state.config.backend.url + '/api/fusionauth/update/' + this.state.userId, {
      method: 'PUT',
      body: JSON.stringify(request),
      headers: new Headers({
         'Content-Type': 'application/json'
      })
   }).then(res =&gt; res.json())
   .catch(error =&gt; this.setState({error}))
   .then(
      (response) =&gt; {
         //console.log('Success:', response)
         this.setState({plan: plan});
      }
   )
}
```

We are going to attach this to the buttons on the page. The line ```e.preventDefault()``` keeps the button click event from propagating.

The next part takes the plan parameter that the buttons will pass and appends it to the registration JSON.

The fetch call is a PUT that passes the user ID as a parameter and the updated registration JSON as the body of the request.

To hook up the code, we need to add a line defining the function to the ```constructor``` of our component.

```js
…
this._handleAJAXResponse.bind(this);
this.retrieveReg = this.retrieveReg.bind(this);
this.update = this.update.bind(this);
```

And we need to update the render function, so it looks like this:

```js
render() {
   return (
      &lt;div&gt;
         &lt;h1&gt;Choose a Plan&lt;/h1&gt;
         &lt;button className="button free" onClick={this.update.bind(this,'free')}&gt;Intro – Free&lt;/button&gt;
         &lt;button className="button basic" onClick={this.update.bind(this,'basic')}&gt;Basic – $5.00&lt;/button&gt;
         &lt;button className="button deluxe" onClick={this.update.bind(this,'deluxe')}&gt;Deluxe – $10.00&lt;/button&gt;
         &lt;h2&gt;Your Plan&lt;/h2&gt;
         {this.state.plan ? this.state.plan : 'loading'}
      &lt;/div&gt;
   );
}
```

The only change here is the addition of the ```onClick={this.update.bind(this,'free'}``` handlers to the buttons, which pass the plan name as a parameter.

Next we need to add a route to Express to handle this call. Open ```fusionauth.js``` and add the following route:

```js
router.route('/fusionauth/update/:id').put((req, res) =&gt; {
   let userId = req.params.id;
   fusionauthClient.updateRegistration(userId, req.body )
   .then((response) =&gt; {
      res.send(response.successResponse);
   })
   .catch((response) =&gt; {
      res.status(response.statusCode).send(response.errorResponse);
   });
});
```

This route responds to the PUT method and it takes two parameters, the user ID and updated JSON. As before, the [FusionAuth Node Client library](https://github.com/FusionAuth/fusionauth-node-client/blob/master/lib/FusionAuthClient.js "Jump to GitHub/FusionAuth") is handling the actual API call.

After, you restart the Express app, the new route will be available.

If you refresh your browser, the buttons will now function and the plan will be saved in the user’s registration for this app. If you uncomment the line ```console.log('Success:', response)``` in the ```update``` function, you can see the JSON returned by the API:

```js
{
   "registration": {
      "applicationId": "4ed5eb32-0a97-40eb-a6d7-cca1f9fa3a0c",
      "data": {
         "attributes": {
            "plan": "basic"
         }
      },
      "id": "fd9c3174-5430-4daa-93ad-cecc42283223",
      "insertInstant": 1517500702981,
      "lastLoginInstant": 1517507657923,
      "roles": [
         "user"
      ],
      "usernameStatus": "ACTIVE"
   }
}

## Wrapping Up

This is a pretty simple example, storing just the plan name, but we hope it demonstrates how easy it is to store user data in FusionAuth. In a game application, you could use this to store high scores or player progress through the game. In a shopping site or app, you could store the user’s purchase history or other data that can be used to customize their experience.


## Learn More About FusionAuth

FusionAuth is designed to be the most flexible and secure Customer Identity and Access Management solution available at the best price. We provide registration, login, SSO, MFA, data search, social login, user management and more, 100% free for unlimited users.

[Find out more about FusionAuth](https://fusionauth.io/ "FusionAuth Home") and download it today.
