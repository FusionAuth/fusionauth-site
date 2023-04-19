---
layout: doc
title: Integrate Your React Application With FusionAuth
description: Integrate your React application with FusionAuth
navcategory: getting-started
---

== Integrate Your React Application With FusionAuth

TBD intro

{% plantuml source: _diagrams/docs/login-before.plantuml, alt: "Login before FusionAuth." %}

And here's the same application login flow when FusionAuth is introduced.

{% plantuml source: _diagrams/docs/login-after.plantuml, alt: "Login with FusionAuth." %}


== Prerequisites

TBD prequisites

== Download and Install FusionAuth

TBD download and install

== Create a User and an API Key

TBD create a user and API key

== Configure FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we’re going to use the Typescript client library.
The below instructions use maven from the command line, but you can use the client library with an IDE of your preference as well.

First, make a directory:

```shell
mkdir setup-fusionauth && cd setup-fusionauth
```


Now, copy and paste the following file into `package.json`.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/package.json %}
```

Then copy and paste the following file into `setup.js`.

```javascript
{% remote_include https://raw.githubusercontent.com/FusionAuth/fusionauth-example-client-libraries/main/typescript/setup.js %}
```

Next, install the dependencies.

```shell
npm install
```

Then, you can run the setup class. This will create FusionAuth configuration for your React application.

```shell
npm run setup
```

If you want, you can http://localhost:9011[login to your instance] and
examine the new application configuration the script created for you.

== Create Your React Application

Now you are going to create a react application. While this section uses a
simple react application, you can use the same configuration to
integrate your react application with FusionAuth.

First, make a directory:

[source,shell]
----
mkdir ../setup-react && cd ../setup-react
----

At the end, your directory tree should look like: 

```
TODO TREE

```

Once you’ve created this directory structure, you can start up the React application using this command: 

```shell
TODO
```

You can now open up an incognito window and visit http://localhost:3000[the React app].
Log in using the user you created when you first set up FusionAuth, and you'll... TODO

