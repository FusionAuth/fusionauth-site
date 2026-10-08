# FusionAuth Node.js centralized sessions example

This project is two example Node.js applications that illustrates how you can easily implement sessions using refresh tokens to give you fine grained revocation using FusionAuth.

## Prerequisites

Docker and the ability to edit your hostnames file.

## To run

* Create two local aliases in your DNS: `changebank.local` and `changebankforum.local`, both resolving to `127.0.0.1`.
* Run `docker compose up -d`. This will run FusionAuth and configure it using [Kickstart](https://fusionauth.io/docs/get-started/download-and-install/development/kickstart)
  * Two users are created, both with the password `password. 
    * admin@example.com is an admin user that can log into the admin UI, located at http://localhost:9011.
    * richard@example.com is a user that can log into the two application you'll start below. 
  * To stop FusionAuth later, run `docker compose down`
* In the `changebank` directory, run:
  * `npm install`
  * `npm run dev`
* In the `changebankforum` directory, run:
  * `npm install`
  * `npm run dev`

In an incognito window, go to `http://changebank.local:8080/` and login with `richard@example.com`. *Check 'keep me signed in'*.

You'll be able to log into your ChangeBank account and make change. 

Now, say you want to discuss whether nickels are better than dimes? Head over to the forum by clicking on 'Forum' in the navigation. You'll be transparently logged in. 

In the non-incognito window, log into the admin UI using the credentials above. You can then navigate to Richard's account (under 'Users') and view the 'Sessions' tab, which will show you the sessions.

If you log out of ChangeBank Forum, you are only logged out of that application. If you log out of ChangeBank, the user is logged out of everything (all refresh tokens are revoked).

[Learn more about Logout and Session Management in FusionAuth](https://fusionauth.io/docs/lifecycle/authenticate-users/logout-session-management)

## Last updated

This was last reviewed Jun 2024.
