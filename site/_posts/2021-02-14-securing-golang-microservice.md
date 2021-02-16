---
layout: blog-post
title: Securing a Go Microservice with JWT
description: How to use JWTs to secure your golang microservices
author: Krissanawat Kaewsanmuang
image: blogs/orbitvu-fusionauth-story/orbitvu-chose-fusionauth-for-architectural-flexibility-great-support-and-customizability-header-image.png
category: blog
tags: client-golang
excerpt_separator: "<!--more-->"
---

JSON Web Tokens (JWTs) offer a mechanism to share a set of claims or attributes from client to server providing microservices in a cryptographically secure way. JWT addresses securing the service-to-service communication as well as passing end-user context across microservices.

<!--more-->

A JWT token can be used to carry the identity of the calling microservice, or the identity of the client or the system that initiated the request. It can be used to communicate authorization and validation attributes between multiple clients and servers. Using such attributes for validation or access helps secure the microservices.

In this post, we are going to explore the role that JWT plays in securing service-to-service communication in a golang microservices deployment. In the golang programming ecosystem, there is an open source jwt-go package that enables us to generate the JWT token. 

First, we are going to use a package to generate the JWT token and create an endpoint API that serves the token. You also could generate the JWT using an identity server such as FusionAuth, but it can be educational to see how JWTs are created using a library.

Then, we will be creating the microservice server. There will be an authorization middleware that will execute before accessing the golang microservices. This middleware will take the JWT token and validate it to ensure secure access to the microservices. 

So, let's get started!

## Prerequisites

* Install [Golang 1.15.8](https://golang.org/)
* Basic knowledge of JWT based authentication
* Basic knowledge of Go programming

## Implementing the JWT endpoint

In this section, we will be creating an endpoint that generates a JWT and then returns it back to the client. All the code is available on [Github](https://github.com/FusionAuth/fusionauth-example-go-jwt-microservices) if you want to clone it and follow along.

We will be using the HMAC algorithm for encrypting JWT. 

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

### Set up the shared key

Then, we need to define a signing key as shown in the code snippet below. We could hardcode the secret:

```go
var mySigningKey = []byte("unicorns")
```

But for additional security, we can use an environment variable to store the secret key instead of hardcoding it in the application:

```go
var mySigningKey = []byte(os.Getenv("SECRET_KEY"))
```

Then, we can set this environment variable by executing the following commands in a terminal where we will run the go program.

```shell
set SECRET_KEY=unicorns // for windows
export SECRET_KEY=unicorns // for linux or mac
```

You'll need to do this every time you start a new terminal and want to run this code. You can also add this environment variable to your shell startup script.

### Generate the token

To generate the token, we need to create a function called `GetJWT`. In the function, we start by initializing a new instance of `JWT` using the `New` method provided by the `jwt` library. 

We need to configure the signing method algorithm to be `HS256` while initializing the JWT token. There are multiple different supported signing methods, but we are using HMAC, a symmetric signing algorithm, because it is the simplest to implement.

Then, we create the token payload in the `claims` map; you can customize this however you want. We'll set this JWT up to be valid for one minute. 

Finally, we sign the token with the `mySigningKey` variable defined earlier. After that, we return the `tokenString` from the function. 

Here's the `GetJWT` function:

```go
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
```

### Serve the token

Now, let's actually serve up this token. We start by importing the additional packages such as `net/http` and `log` to create the server as shown in the code snippet below:

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

The entire JWT file looks like this:

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

### Running the server

Now, we install the imported packages and also start the server by executing the following commands:

```shell
go get
go run main.go
```

We can quickly test if the server returns the token or not by executing the curl command below:

```shell
curl http://localhost:8080 
```

On success, we will see the token string in response:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJiaWxsaW5nLmp3dGdvLmlvIiwiYXV0aG9yaXplZCI6dHJ1ZSwiY2xpZW50IjoiS3Jpc3NhbmF3YXQiLCJleHAiOjE2MTM1MDk1MDcsImlzcyI6Imp3dGdvLmlvIn0.t7qdqrpLk3nBOZFLBL_UOdciZ_rWei0rJg3tgyJ7cTw
```

Now in the next section, we take this token and send it to a microservice server.

## Implement a simple API gateway

In this section, we will be validating the JWT which will allow clients to interact with the internal services it protects. This server will act as an API gateway for the clients.

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

Inside this new `main.go` file we need to import the similar packages as before:

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

Then, we need to access our signing key too:

```go
var MySigningKey = (byte[])os.Getenv("SECRET_KEY")
```

This key here will be used to validate the JWT received from the other process.

### Create the middleware

After assigning the key, the first thing we need to do is to create a middleware that will intercept all incoming requests. It will check if the token is provided or not before allowing the request to proceed further. Here's the skeleton of this function:

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

We'll build out the `//TODO` section next.

### Build the middleware JWT parsing logic

To do so, we need to parse the token and check credentials. We'll validate that the token is signed, that the signing method is correct, and that the audience and issuer are valid. If any error occurs, we return the error message as a response. 

Otherwise, we let the client request pass to the next endpoint. Here's the logic you'd place in the `//TODO` section:

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

Okay, so `isAuthorized` prevents unauthorized access to an endpoint by validating the JWT. But what is it protecting? For that, we need to create an endpoint to return once the clients' request passes the validation. 


```go
func index(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintf(w, "Super Secret Information")
}
```

We also need to import the server packages as shown in the code snippet below:

```go
import (
  "fmt"
  "log"
  "net/http"

  "github.com/dgrijalva/jwt-go"
)
// ...
```

Then, we need to wrap our index endpoint with the jwt middleware as shown in the code snippet below. We'll also listen on port 9001.

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

That's it, our protected microservice is ready to go. The entire code of `main.go` is below:

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

And then, we need to start the server by executing the following command:

```shell
go run main.go
```

Now we can test the endpoint with curl. 

First, try it without any JWT:

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

Now we can construct the CURL command as shown below:

```shell
curl http://localhost:9001 --header 'Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJiaWxsaW5nLmp3dGdvLmlvIiwiYXV0aG9yaXplZCI6dHJ1ZSwiY2xpZW50IjoiS3Jpc3NhbmF3YXQiLCJleHAiOjE2MTM1MDk1MDcsImlzcyI6Imp3dGdvLmlvIn0.t7qdqrpLk3nBOZFLBL_UOdciZ_rWei0rJg3tgyJ7cTw'
```

If you do this within a minute, you'll be rewarded with:

```
Super Secret Information
```

If you take too long, you'll see a token expiration method.

## Conclusion

This post demonstrated the generation of a JWT in golang. It used the same token to access a golang microservice running in another server. The token generation involved the use of the `go-jwt` module with the HS256 signing method. The generated token was returned to the client after requesting an endpoint. 

Then, for the microservices server, middleware logic validated the token. After validation the request was sent to the microservices endpoint. 

Using a JWT token to secure microservices is widely used as it is a secure and easy mechanism. 

## Go further

All the code is available on [Github](https://github.com/FusionAuth/fusionauth-example-go-jwt-microservices). If you want to play around with JWTs and golang microservices you built here, you could:

* [Set up FusionAuth in 5 minutes](/docs/v1/tech/5-minute-setup-guide/) and have it generate the JWTs based on a user authenticating.
* Change the key in the microservice and see what error message you get back.
* Modify the middleware to use the more standard `Authorization` header and `Bearer` token prefix.
* Use an asymmetric signing algorithm such as RSA to avoid sharing a secret.
* Build more than one golang microservice and have service access authorized by the value of the `roles` claim in the JWT.



