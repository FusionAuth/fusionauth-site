---
layout: blog-post
title: Orbitvu chose FusionAuth for architectural flexibility, great support, and customizability
description: Orbitvu, a product photography company, gets more flexibility and value with FusionAuth.
author: Dan Moore
image: blogs/orbitvu-fusionauth-story/orbitvu-chose-fusionauth-for-architectural-flexibility-great-support-and-customizability-header-image.png
category: blog
tags: topic-community-story
excerpt_separator: "<!--more-->"
---


JSON Web Token (JWT) offers a mechanism to a set of claims or attributes from client to server providing microservices cryptographically secure way. JWT mainly addresses securing of service-to-service communication and passing end-user context across microservices in a microservices security design.

<!--more-->
This JWT token can be used to carry the identity of the calling microservice, or the identity of the client or the system that initiated the request. It can be used to communicate authorization/validation attributes between multiple clients and servers. Using such attributes for validation or access helps secure the servers serving the microservices.
In this article, we are going to explore the role that JWT plays in securing service-to-service communication in a GO microservices deployment. In GO programming ecosystem, there is a availability of jwt-go package that enables us to generate the JWT token. First, we are going to use to package to generate the JWT token and create a endpoint API that serves the token. Then, we will be creating the GO microservice server. There will be a validation or authorization middleware that will placed before accessing the GO microservices. This middleware will take the JWT token and validate it to provide access to GO microservices. Here, JWT token will be used as a security key to access the endpoints serving GO mircroservices. Hence, JWT token secures the overall microservices access. So, let's get started!

## Pre-Requirement

* Install Golang 1.15.8
* Basic Knowledge of JWT based authentication
* Basic Knowledge of  Go programming

## Implementing JWT endpoint

In this section, we will be creating an endpoint that generates JWT and then returns it back to the client. We will be using the HMAC algorithm for encrypting JWT. First, we will start by creating an endpoint to issue JWT. For that, we are going to make use of the JWT package from GitHub.
Before starting to implement the JWT endpoint, we need to create a go project module first. For that, we need to create a folder called jwt_client and execute the following command:
go mod init jwt_client

Then, we need to create a file called main.go Inside the file, we can start importing the necessary packages as shown in the code snippet below:

package main

import (
    "fmt"
    "time"
    jwt "github.com/dgrijalva/jwt-go"
)

Then, we need to define a Signing key as shown in the code snippet below:

var mySigningKey = []byte("mysecret")

But for additional security, we can use environment variable to store the secret key in the OS layer instead of the app by using the OS package as shown in the code snippet below:

var mySigningKey = os.Getenv("SECRET_KEY")

Then, we can set the environment variables by executing the following commands in the terminal:

set SECRET_KEY=unicorns // for windows
export SECRET_KEY=unicorns // for linux or mac


To generate JWT, we need to create a function called GetJWT. In the function, we start by initializing a new instance of JWT using the New method provided by jwt. We need to assign the Signing method algorithm to HS256 while initializing the JWT token. Then, we set the token body structure with different variables. Lastly, we sign the token with mySigningKey that we defined earlier. After that, we return the tokenString from the function. The overall coding implementation is provided in the code snippet below:

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

Here, we start by importing the additional packages such as net/http and log to create the server as shown in the code snippet below:

import (
    "fmt"
    "log"
    "net/http"
    "time"

    jwt "github.com/dgrijalva/jwt-go"
)

Then, we need to create a function to handle the server task as shown in the code snippet below:

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

    log.Fatal(http.ListenAndServe(":9000", nil))
}

func main() {
    handleRequests()
}

Now, we install the imported packages and also start the server by executing the following commands:

go get
go run main.go

Now, we can quickly test if the server returns the token or not by executing the CURL command below:
curl --request GET \ --url http://localhost:9000 
On success, we will see the token string in response.
Now in the next step, we take this token and send it to Microservice server.

## Implement Simple API gateway

In this section, we will be creating a simple server to validate JWT which will allow the clients to interact with the internal services. This server will act as an API gateway for the clients.
Here, we start by creating a new folder called api_gateway inside the root project as shown in the screenshot below:


Inside the folder, we need to create a Go project module as before by executing the following command:
go mod init api_gateway

Then, we need to create another main.go file inside the api_gateway folder.
Inside this new main.go file we need to import the similar packages as before as shown in the code snippet below:
package main

import (
    "fmt"
    "log"
    "net/http"

    "github.com/dgrijalva/jwt-go"
)
Then, we need to add our Signing key as before:

var MySigningKey = os.Getenv("SECRET_KEY")

This key here will be used for decryption as well as validating the JWT.
Now after assigning the key, the first thing we need to do is to create a middleware that will intercept all incoming requests. It will check if the token is provided or not before proceeding further. The overall coding implementation is provided in the code snippet below:
func isAuthorized(endpoint func(http.ResponseWriter, *http.Request)) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    if r.Header["Token"] != nil {

    } else {
            fmt.Fprintf(w, "No Authorization Token provided")
        }
  })
}


Then, we need to parse the token and start by checking credentials such as if the Signing method is correct, if the audience and issuer are valid or not based on what we set on the JWT client. If any error occurs, we return the error message as a response. Else, we let the client pass to the next endpoint. The overall implementation of this logic is provided in the code snippet below:
token, err := jwt.Parse(r.Header["Token"][0], func(token *jwt.Token) (interface{}, error) {
                if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                    return nil, fmt.Errorf(("Invalid Signing Method"))
                }
                if _, ok := token.Claims.(jwt.Claims); !ok && !token.Valid {
                    return nil, fmt.Errorf(("Expire token"))
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

Now, we need to create an endpoint to return once the clients' request for microservers passes the validation. For that, we need to create an endpoint server as shown in the code snippet below:
func index(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Our Index endpoint ")
}
Then, we need import the server packages as shown in the code snippet below:

import (
    "fmt"
    "log"
    "net/http"

    "github.com/dgrijalva/jwt-go"
)

Then, we need to wrap wrap our index endpoint with jwt middleware as shown in the code snippet below:

func handleRequests() {
    http.Handle("/", isAuthorized(index))
    log.Fatal(http.ListenAndServe(":9001", nil))
}
func main() {
    fmt.Println("server")
    handleRequests()
}

And then, we need to start the server by executing the following command:

go run main.go

Now we can test the endpoint APIs with CURL. We can construct the CURL command as shown in the snippet below:

curl --request GET \
  --url http://localhost:9001 \
  --header 'Token: Your JWT'

Finally, we were able to generate the JWT token and secure GO microservices by using it.

## Conclusion

The main goal of this article was to demonstrate the generation of JWT token from one endpoint server and using the same token to access GO microservices running on another server. The JWT token generation involved the use of jwt module from jwt package along with the HS256 Signing method. The generated token was returned to the client by formulating an endpoint. Then, for the microservices server, a middleware logic was implemented to validate the JWT token string. After the validate the request was sent to the endpoint through which the GO microservices could be accessed. Each API call was tested successfully using the Postman tool. This method using the JWT token to secure the microservices is widely used as a secure and easy mechanism. The overall steps were easy to understand and implement. Hence, we need to properly understand the mechanism and apply it properly.

All code available on [Github](https://github.com/krissnawat/jwt_go_microservice_example).

