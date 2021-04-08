---
layout: blog-post
title: Securing a Go Microservice with JWT
description: How to use JWTs to secure your golang microservices
author: Krissanawat Kaewsanmuang
image: blogs/securing-golang-microservice-jwt/securing-a-go-microservice-with-jwt-header-image.png
category: blog
tags: client-go
excerpt_separator: "<!--more-->"
---

JSON Web Tokens (JWTs) offer a mechanism to share a set of claims or attributes from client to a server providing microservices in a cryptographically secure way. JWT secures the service-to-service communication and also can pass end-user context across microservices.

<!--more-->

A JWT token can be used to carry the identity of the calling microservice, or the identity of the client or the system which initiated the request. It can be used to communicate authorization and validation attributes between multiple clients and servers. Using such attributes secures the microservices and makes sure that only authorized access occurs.

In this post, we are going to explore the role that JWT plays in securing service-to-service communication in an example golang microservices deployment. In the golang programming ecosystem, there is an open source `jwt-go` package that enables us to generate the JWT token. 

First, we are going to use this package to generate the JWT token and create an endpoint API that serves the token. You also could generate the JWT using an auth system such as FusionAuth, but it can be educational to see how JWTs are created at a lower level.

Then, we will be creating the microservice server. There will be an authorization middleware that will execute before access is allowed to the golang microservices. This middleware will take the JWT token and validate it to ensure authorized access to the microservices. 

So, let's get started!

## Prerequisites

* Install [Golang 1.15.8](https://golang.org/)
* Basic knowledge of JWT based authentication
* Basic knowledge of golang programming

## Implementing the JWT endpoint with a go module

In this section, we will be creating an endpoint that generates a JWT and then returns it back to the client. All the code is available on [Github](https://github.com/FusionAuth/fusionauth-example-go-jwt-microservices) if you want to clone it and follow along.

We will be using the HMAC algorithm for encrypting the token. 

First, we will start by creating an endpoint to issue a JWT. For that, we are going to make use of the [jwt-go package from GitHub](https://github.com/dgrijalva/jwt-go).

Before starting to implement this endpoint, we need to create a go project module first. Let's keep things neat and create a folder called `jwt_client`:

```shell
mkdir jwt_client && cd jwt_client
```

Then, create the go module:

```shell
go mod init jwt_client
```

Then, we need to create a file called `main.go`. Inside it, we can start importing the necessary packages as shown in the code snippet below:

```go
package main

import (
  "fmt"
  "time"
  jwt "github.com/dgrijalva/jwt-go"
)
```

### Set up the shared secret key

Next, we define a signing key as shown below. We could hardcode the secret:

```go
var mySigningKey = []byte("unicorns")
```

But for additional security and flexibility, we can use an environment variable to store the secret key rather than hardcoding it in the application:

```go
var mySigningKey = []byte(os.Getenv("SECRET_KEY"))
```

We can set this environment variable by executing the following commands in a terminal where we will run the go program:

```shell
set SECRET_KEY=unicorns // for windows
export SECRET_KEY=unicorns // for linux or mac
```

You'll need to set this value every time you start a new terminal and want to run this code. You can also add this environment variable to your shell startup script to avoid that hassle.

### Generate the JWT 


To generate the token, we need to create a function called `GetJWT`. In the function, we start by initializing a new instance of `JWT` using the `New` method provided by our jwt library. 

We need to configure the signing method algorithm to be `HS256` while initializing the token. There are multiple different supported signing methods, but we are using HMAC, a symmetric signing algorithm, because it is the simplest to implement.

Then, we create the token payload in the `claims` map; you can customize this however you want, but including standard claims like `aud`, `iss` and `exp` as shown is recommended. We'll set this JWT up to be valid for one minute by setting the `exp` claim appropriately. 

Finally, we sign the token with the value of the `mySigningKey` variable defined earlier. After that, we return the `tokenString` from the function. 

Here's the `GetJWT` function in all its glory:

```go
// ...
func GetJWT() (string, error) {
  token := jwt.New(jwt.SigningMethodHS256)

  claims := token.Claims.(jwt.MapClaims)

  claims["authorized"] = true
  claims["client"] = "Krissanawat"
  claims["aud"] = "billing.jwtgo.io"
  claims["iss"] = "jwtgo.io"
  claims["exp"] = time.Now().Add(time.Minute * 1).Unix()

  tokenString, err := token.SignedString(mySigningKey)

  if err != nil {
    fmt.Errorf("Something Went Wrong: %s", err.Error())
    return "", err
  }

  return tokenString, nil
}
// ...
```

### Set up a golang process to serve the JWT 

Now, let's actually serve up this token. We start by importing the additional packages such as `net/http` and `log` to create the server:

```
import (
  "fmt"
  "log"
  "net/http"
  "time"

  jwt "github.com/dgrijalva/jwt-go"
)
// ...
```

We need to create functions to handle HTTP requests made to port 8080 as shown below:

```go
// ...
func Index(w http.ResponseWriter, r *http.Request) {
  validToken, err := GetJWT()
  fmt.Println(validToken)
  if err != nil {
    fmt.Println("Failed to generate token")
  }

  fmt.Fprintf(w, string(validToken))
}

func handleRequests() {
  http.HandleFunc("/", Index)

  log.Fatal(http.ListenAndServe(":8080", nil))
}

func main() {
    handleRequests()
}
```

The entire JWT server looks like this:

```go
package main

import (
  "fmt"
  "log"
  "net/http"
  "os"
  "time"

  jwt "github.com/dgrijalva/jwt-go"
)
var mySigningKey = []byte(os.Getenv("SECRET_KEY"))

func GetJWT() (string, error) {
  token := jwt.New(jwt.SigningMethodHS256)

  claims := token.Claims.(jwt.MapClaims)

  claims["authorized"] = true
  claims["client"] = "Krissanawat"
  claims["aud"] = "billing.jwtgo.io"
  claims["iss"] = "jwtgo.io"
  claims["exp"] = time.Now().Add(time.Minute * 1).Unix()

  tokenString, err := token.SignedString(mySigningKey)

  if err != nil {
    fmt.Errorf("Something Went Wrong: %s", err.Error())
    return "", err
  }

  return tokenString, nil
}

func Index(w http.ResponseWriter, r *http.Request) {
  validToken, err := GetJWT()
  fmt.Println(validToken)
  if err != nil {
    fmt.Println("Failed to generate token")
  }

  fmt.Fprintf(w, string(validToken))
}

func handleRequests() {
  http.HandleFunc("/", Index)

  log.Fatal(http.ListenAndServe(":8080", nil))
}

func main() {
  handleRequests()
}
```

### Spinning up the go server

Now, we install the imported packages and start the server by executing the following commands:

```shell
go get
go run main.go
```

We can quickly test if the server returns the token or not by executing this curl command:

```shell
curl http://localhost:8080 
```

On success, we will see the token string in response:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJiaWxsaW5nLmp3dGdvLmlvIiwiYXV0aG9yaXplZCI6dHJ1ZSwiY2xpZW50IjoiS3Jpc3NhbmF3YXQiLCJleHAiOjE2MTM1MDk1MDcsImlzcyI6Imp3dGdvLmlvIn0.t7qdqrpLk3nBOZFLBL_UOdciZ_rWei0rJg3tgyJ7cTw
```

Now in the next section, we take this token and send it to a microservice.

## Implement a simple API gateway to validate the JWT

In this section, we will be validating the JWT. After the token is found valid, clients can interact with the protected internal services. This server will act as an API gateway for the clients.

Here, we start by creating a new folder called `api_gateway` inside the root project. This folder will be a sibling of `jwt_client`. If you are still in the `jwt_client` folder, run the following commands:

```shell
mkdir ../api_gateway
cd ../api_gateway
```

Now we are in the `api_gateway` folder. We need to create a go project module, as we did before, by executing the following command:

```shell
go mod init api_gateway
```

Then, we need to create another `main.go` file inside the folder.

Inside this new `main.go` file we need to import helper packages as we did previously:

```go
package main

import (
  "fmt"
  "log"
  "net/http"

  "github.com/dgrijalva/jwt-go"
)
```
### Set up the signing key

We need to access our signing key here too:

```go
var MySigningKey = (byte[])os.Getenv("SECRET_KEY")
```

This key will be used to validate the JWT presented to our microservices.

### Create the middleware to intercept incoming requests and validate the JWT


After assigning the key, the first thing we need to do is to create a middleware that will intercept all incoming requests. It will check if the token is provided or not before allowing the request to proceed further. 

Here's the skeleton of this function:

```go
// ...
func isAuthorized(endpoint func(http.ResponseWriter, *http.Request)) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if r.Header["Token"] != nil {
      // TODO
    } else {
      fmt.Fprintf(w, "No Authorization Token provided")
    }
  })
}
// ...
```

We'll build out the code for the `//TODO` section next.

### Build the middleware JWT parsing logic

We need to parse the token and check credentials to determine if a request is authorized. We'll validate that the token is signed, that the signing method is correct, and that the audience and issuer are what we expect. If any error occurs, we return the error message as a response instead of passing the request through. 

In the happy path, however, we let the client request pass to the next endpoint. 

Here's the code for the `//TODO` section:

```go
token, err := jwt.Parse(r.Header["Token"][0], func(token *jwt.Token) (interface{}, error) {
  if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
    return nil, fmt.Errorf(("Invalid Signing Method"))
  }
  if _, ok := token.Claims.(jwt.Claims); !ok && !token.Valid {
    return nil, fmt.Errorf(("Expired token"))
  }
  aud := "billing.jwtgo.io"
  checkAudience := token.Claims.(jwt.MapClaims).VerifyAudience(aud, false)
  if !checkAudience {
    return nil, fmt.Errorf(("invalid aud"))
  }
  iss := "jwtgo.io"
  checkIss := token.Claims.(jwt.MapClaims).VerifyIssuer(iss, false)
  if !checkIss {
    return nil, fmt.Errorf(("invalid iss"))
  }

  return MySigningKey, nil
})
if err != nil {
  fmt.Fprintf(w, err.Error())
}

if token.Valid {
  endpoint(w, r)
}
```

### Add a microservice endpoint

Okay, so `isAuthorized` prevents unauthorized access to an endpoint by validating the token. But what is it protecting? We need to create an endpoint to return *something* once the clients' request is validated. Let's do that.

```go
func index(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintf(w, "Super Secret Information")
}
```

(You can feel free to build out something more useful than the above, but for purposes of illustration returning `Super Secret Information` is enough to show the endpoint is protected by examining the JWT.)

We also need to import the server packages at the top of `main.go` as shown in the code snippet below:

```go
import (
  "fmt"
  "log"
  "net/http"

  "github.com/dgrijalva/jwt-go"
)
// ...
```

Then, we need to wrap our index endpoint with the jwt middleware. We'll also listen on port 9001.

```go
// ...
func handleRequests() {
  http.Handle("/", isAuthorized(index))
  log.Fatal(http.ListenAndServe(":9001", nil))
}
func main() {
  fmt.Println("server")
  handleRequests()
}
```

That's it, our protected microservice is ready to go. All of `main.go` is below:

```go
package main

import (
  "fmt"
  "log"
  "net/http"
  "os"

  "github.com/dgrijalva/jwt-go"
)

var MySigningKey = []byte(os.Getenv("SECRET_KEY"))

func homePage(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintf(w, "Super Secret Information")
}
func isAuthorized(endpoint func(http.ResponseWriter, *http.Request)) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if r.Header["Token"] != nil {

      token, err := jwt.Parse(r.Header["Token"][0], func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
          return nil, fmt.Errorf(("Invalid Signing Method"))
        }
        aud := "billing.jwtgo.io"
        checkAudience := token.Claims.(jwt.MapClaims).VerifyAudience(aud, false)
        if !checkAudience {
          return nil, fmt.Errorf(("invalid aud"))
        }
        // verify iss claim
        iss := "jwtgo.io"
        checkIss := token.Claims.(jwt.MapClaims).VerifyIssuer(iss, false)
        if !checkIss {
          return nil, fmt.Errorf(("invalid iss"))
        }

        return MySigningKey, nil
      })
      if err != nil {
        fmt.Fprintf(w, err.Error())
      }

      if token.Valid {
        endpoint(w, r)
      }

    } else {
      fmt.Fprintf(w, "No Authorization Token provided")
    }
  })
}
func handleRequests() {
  http.Handle("/", isAuthorized(homePage))
  log.Fatal(http.ListenAndServe(":9001", nil))
}
func main() {
  fmt.Println("server")
  handleRequests()
}
```

### Start the microservice

We need to start the middleware and microservice server by executing the following command:

```shell
go run main.go
```

Now we can test the endpoint with curl. First, try without any JWT:

```shell
curl http://localhost:9001
```

You'll receive an error message:

```
No Authorization Token provided
```

Next, generate a token:

```
curl http://localhost:8080 
```

You'll see something like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJiaWxsaW5nLmp3dGdvLmlvIiwiYXV0aG9yaXplZCI6dHJ1ZSwiY2xpZW50IjoiS3Jpc3NhbmF3YXQiLCJleHAiOjE2MTM1MDk1MDcsImlzcyI6Imp3dGdvLmlvIn0.t7qdqrpLk3nBOZFLBL_UOdciZ_rWei0rJg3tgyJ7cTw
```

Now we can construct the curl command as shown below:

```shell
curl http://localhost:9001 --header 'Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJiaWxsaW5nLmp3dGdvLmlvIiwiYXV0aG9yaXplZCI6dHJ1ZSwiY2xpZW50IjoiS3Jpc3NhbmF3YXQiLCJleHAiOjE2MTM1MDk1MDcsImlzcyI6Imp3dGdvLmlvIn0.t7qdqrpLk3nBOZFLBL_UOdciZ_rWei0rJg3tgyJ7cTw'
```

If you execute this request this within a minute of when you created the token, you'll be rewarded with:

```
Super Secret Information
```

If you take too long, you'll see a token expiration warning. And no super secret information.

## Conclusion

This post demonstrated the generation of a JWT in golang. It used the same token to access a golang microservice running in another server. The token generation used the `go-jwt` module with the HS256 signing method. The generated token was returned to the client after requesting an endpoint. 

Then, for the microservices server, middleware logic validated the token. After successful validation the request was sent to the microservices endpoint. 

Using a token in this manner to secure microservices is widely used as it is a secure and easy mechanism. 

## Go further

All the code is available on [Github](https://github.com/FusionAuth/fusionauth-example-go-jwt-microservices). If you want to play around with JWTs and the golang microservices you built here, you could:

* [Set up FusionAuth in 5 minutes](/docs/v1/tech/5-minute-setup-guide/) and have it generate the JWTs when a user logs in.
* Learn how to [secure golang applications with OAuth](/blog/2020/10/22/securing-a-golang-app-with-oauth/).
* Modify the middleware and curl scripts to use the more standard `Authorization` header and `Bearer` token prefix.
* Use an asymmetric signing algorithm such as RSA to avoid sharing a secret between the two programs.
* Build more than one golang microservice and have service access controlled by the value of the `roles` claim in the JWT.

Happy coding!
