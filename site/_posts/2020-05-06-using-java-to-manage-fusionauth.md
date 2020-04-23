---
layout: blog-post
title: Using Java to manage FusionAuth
description: How to use Java to manager users, applications and more with FusionAuth
author: Alfrick Opidi
image: blogs/fusionauth-example-angular/oauth-angular-fusionauth.png
category: blog
excerpt_separator: "<!--more-->"
---

FusionAuth allows developers to simplify authentication, authorization, and user management tasks in their applications. One of the greatest benefits of this innovative identity solution is that it can be integrated with any programming language, platform, or anything else. So, it doesn't matter if your preferred language is [Python](https://fusionauth.io/blog/2019/10/01/implementing-fusionauth-python), [Node.js](https://fusionauth.io/blog/2019/02/19/easy-integration-fusionauth-nodejs), [PHP](https://fusionauth.io/blog/2020/03/26/how-to-integrate-fusionauth-with-php), you can use FusionAuth to take your authentication capabilities to the next level.

In this tutorial, we’re going to illustrate how to use Java to accomplish various tasks with FusionAuth, programmatically. More so, to speed up our development time, we’ll use the FusionAuth Java client library, which comes with already-built methods that we’ll use instead of building things from scratch. 

<!--more-->

## What we’ll cover

* Setting up FusionAuth
* Setting up Maven dependency
* Retrieving a user’s profile details
* Changing a user’s password
* Deactivating a user
* Reactivating a user
* Deleting a user
* Retrieving an application’s details
* Deactivating an application
* Reactivating an application
* Deleting an application

## What you’ll need
* FusionAuth (you can see the [FusionAuth system requirements here](https://fusionauth.io/docs/v1/tech/installation-guide/system-requirements))
* The [FusionAuth Maven dependency](https://mvnrepository.com/artifact/io.fusionauth/fusionauth-java-client)
* Java development environment
* Web browser

Ready?
Let’s get going...

## Setting up FusionAuth
FusionAuth can be deployed on nearly any platform. Depending on the platform you’re using, you can get the installation instructions [from here](https://fusionauth.io/download). 

Once FusionAuth is installed on your platform, you can follow this [simple 5-minute guide](https://fusionauth.io/docs/v1/tech/5-minute-setup-guide) to set it up and ensure it’s running properly.

For this tutorial, you’ll need to use your FusionAuth Admin UI to do the following:

* Create and record an API key 
* Create a new user and record their ID
* Create an application and record its ID

(Note that they’ll be no need to configure the OAuth settings).

Then, after completing the setup, and grabbing the things we’ll need, we can move to the next step. 

Shall we?

## Setting up the Maven dependency

To set up the dependencies needed for this project, let’s create a Maven utility project and add the FusionAuth Java client library to the pom.xml file. 
We’ll use [version 1.13.0](https://mvnrepository.com/artifact/io.fusionauth/fusionauth-java-client/1.13.0) of the FusionAuth Maven dependency (but remember to use the version that corresponds to your deployed version of FusionAuth):

```xml
<dependency>
    <groupId>io.fusionauth</groupId>
    <artifactId>fusionauth-java-client</artifactId>
    <version>1.13.0</version>
</dependency>
```

## Retrieving a user’s profile details

In FusionAuth, a [user](https://fusionauth.io/docs/v1/tech/core-concepts/users) refers to someone or something that has been granted the right to use your FusionAuth application—such as an employee, client, or device. So, for the next few sections, we’ll see how you can implement various user management tasks. 

As earlier mentioned, the FusionAuth Java client library comes with already-built methods that allow for easy integration of the FusionAuth REST API in Java environments.

If you go to this [GitHub page](https://github.com/FusionAuth/fusionauth-java-client/blob/master/src/main/java/io/fusionauth/client/FusionAuthClient.java), you can see the various methods alongside their definitions. For example, to retrieve a user’s information, we’ll use the `retrieveUser` method. If you check the method definition, you’ll find that it only requires the userId parameter, which should be supplied as a UUID string. 
So, we just need to provide the `userId` and we’ll get the specified user’s profile details.

That’s a simple way of consuming the [FusionAuth REST API](https://fusionauth.io/docs/v1/tech/apis/). Isn't it?

Here is the code for using the `retrieveUser` method to retrieve a user’s registered information:

```java
import java.util.UUID;
import com.inversoft.error.Errors;
import io.fusionauth.client.FusionAuthClient;
import io.fusionauth.domain.api.UserResponse;
import com.inversoft.rest.ClientResponse;

public class FusionJava {

    public static void main(String[] args) {    
        
        String apiKey = "Z77y_yshOSAIfF3sd370Ns6m4VkKcAOqFpyyzSGfnF4";
        
        String fusionauthURL = "http://localhost:9011";
        
        UUID userId = UUID.fromString("c7f91df7-ed89-410b-87e7-a2b7ade9bf98");
        
        //Initiating the client
        FusionAuthClient client = new FusionAuthClient(apiKey, fusionauthURL);    
        
        //Using the returned ClientResponse object
        ClientResponse<UserResponse, Errors> response = client.retrieveUser(userId);        
           
        if (response.wasSuccessful()) {
            //Outputting the user's profile details
            System.out.println(response.successResponse.user);     
            
            
        } else {
            //Handling errors
            System.out.println(response.errorResponse);
            
        }
    }
}
```

As you can see from the code above, the Java client returns a `ClientResponse` object that contains everything that happened while communicating with the FusionAuth server. Then, we used the `response` object to output the user’s information on the console.

Note that when initiating the FusionAuth client, we specified the API key and the web address that points to our running FusionAuth application. You will need to provide your own unique values for these parameters.

If you run the above code, here’s the result we get on the console:

```json
{
  "encryptionScheme" : null,
  "factor" : null,
  "id" : "c7f91df7-ed89-410b-87e7-a2b7ade9bf98",
  "password" : null,
  "passwordChangeRequired" : false,
  "passwordLastUpdateInstant" : 1587287741465,
  "salt" : null,
  "verified" : true,
  "preferredLanguages" : [ ],
  "memberships" : [ ],
  "registrations" : [ {
    "data" : { },
    "preferredLanguages" : [ ],
    "tokens" : { },
    "applicationId" : "3c219e58-ed0e-4b18-ad48-f4f92793ae32",
    "authenticationToken" : null,
    "cleanSpeakId" : null,
    "id" : "7c105c78-c49d-40c1-a5a1-fcff013fd4eb",
    "insertInstant" : 1587299377006,
    "lastLoginInstant" : null,
    "roles" : [ "admin" ],
    "timezone" : null,
    "username" : null,
    "usernameStatus" : "ACTIVE",
    "verified" : true
  } ],
  "active" : true,
  "birthDate" : null,
  "cleanSpeakId" : null,
  "data" : { },
  "email" : "fusionjava@gmail.com",
  "expiry" : null,
  "firstName" : null,
  "fullName" : null,
  "imageUrl" : null,
  "insertInstant" : 1587287741325,
  "lastLoginInstant" : null,
  "lastName" : null,
  "middleName" : null,
  "mobilePhone" : null,
  "parentEmail" : null,
  "tenantId" : "31626538-3731-3762-3664-303931343339",
  "timezone" : null,
  "twoFactorDelivery" : "None",
  "twoFactorEnabled" : false,
  "twoFactorSecret" : null,
  "username" : "fusionjava",
  "usernameStatus" : "ACTIVE"
}
```

## Changing a user’s password

To change a user’s password, we’ll use the `changePasswordByIdentity` method. This method allows us to change a user’s password using their identity--login ID and current password. 

So, we’ll use the `ChangePasswordRequest` class to create a `request` object, which we’ll pass as an argument to the `changePasswordByIdentity` method. `ChangePasswordRequest` requires three string parameters--the login ID, the current password, and the new password. 

Here is the code:

```java
import com.inversoft.error.Errors;
import io.fusionauth.client.FusionAuthClient;
import io.fusionauth.domain.api.user.ChangePasswordRequest;

import com.inversoft.rest.ClientResponse;

public class FusionJava {

    public static void main(String[] args) {    
        
        String apiKey = "Z77y_yshOSAIfF3sd370Ns6m4VkKcAOqFpyyzSGfnF4";
        
        String fusionauthURL = "http://localhost:9011";    
                
        //Initiating the client
        FusionAuthClient client = new FusionAuthClient(apiKey, fusionauthURL);    
        
        //Creating the request object
        ChangePasswordRequest request = new ChangePasswordRequest("fusionjava@gmail.com", "xxxxxxxxxx", "xxxxxxxxxx");
        
        //Using the returned ClientResponse object
        ClientResponse<Void, Errors> response = client.changePasswordByIdentity(request);                    
           
        if (response.wasSuccessful()) {                        
            System.out.println("Password change successful");
            
        } else {
            //Handling errors
            System.out.println(response.errorResponse);
        }
    }
}
```

## Deactivating a user

To deactivate a user, we’ll use the `deactivateUser` method. We’ll provide the user’s ID as a UUID string in the parameter’s value. Deactivation means they cannot login, which might happen if a user's account is suspended due to misbehavior.

Here is the code:

```java
import java.util.UUID;
import com.inversoft.error.Errors;
import io.fusionauth.client.FusionAuthClient;
import com.inversoft.rest.ClientResponse;

public class FusionJava {

    public static void main(String[] args) {    
        
        String apiKey = "Z77y_yshOSAIfF3sd370Ns6m4VkKcAOqFpyyzSGfnF4";
        
        String fusionauthURL = "http://localhost:9011";
        
        UUID userId = UUID.fromString("c7f91df7-ed89-410b-87e7-a2b7ade9bf98");
        
        //Initiating the client
        FusionAuthClient client = new FusionAuthClient(apiKey, fusionauthURL);    
        
        //Using the returned ClientResponse object
        ClientResponse<Void, Errors> response = client.deactivateUser(userId);        
           
        if (response.wasSuccessful()) {            
            System.out.println("User deactivated successfully");             
            
        } else {
            //Handling errors
            System.out.println(response.errorResponse);
        }
    }
}
```

## Reactivating a user

Next, to reactivate the user we’d deactivated (perhaps they cleaned up their act), let’s use the `reactivateUser` method and provide the ID of the user as its parameter. 

Here is the code:

```java
import java.util.UUID;
import com.inversoft.error.Errors;
import io.fusionauth.client.FusionAuthClient;
import io.fusionauth.domain.api.UserResponse;

import com.inversoft.rest.ClientResponse;

public class FusionJava {

    public static void main(String[] args) {    
        
        String apiKey = "Z77y_yshOSAIfF3sd370Ns6m4VkKcAOqFpyyzSGfnF4";
        
        String fusionauthURL = "http://localhost:9011";
        
        UUID userId = UUID.fromString("c7f91df7-ed89-410b-87e7-a2b7ade9bf98");
        
        //Initiating the client
        FusionAuthClient client = new FusionAuthClient(apiKey, fusionauthURL);    
        
        //Using the returned ClientResponse object
        ClientResponse<UserResponse, Errors> response = client.reactivateUser(userId);        
           
        if (response.wasSuccessful()) {
        //Outputting the user's profile details            
            System.out.println(response.successResponse.user);             
            
        } else {
            //Handling errors
            System.out.println(response.errorResponse);
        }
    }

}
```

If you run the above code, and the request is successful, it’ll reactivate the user and output their profile information on the console. 

## Deleting a user

Finally, let’s see how to delete a user from the FusionAuth application. To do this, we’ll use the `deleteUser` method and provide the ID of the user as its parameter. 

Remember that this method *permanently* deletes all the user information from your application. So, use it cautiously. 

Here is the code:

```java
import java.util.UUID;
import com.inversoft.error.Errors;
import io.fusionauth.client.FusionAuthClient;
import com.inversoft.rest.ClientResponse;

public class FusionJava {

    public static void main(String[] args) {    
        
        String apiKey = "Z77y_yshOSAIfF3sd370Ns6m4VkKcAOqFpyyzSGfnF4";
        
        String fusionauthURL = "http://localhost:9011";
        
        UUID userId = UUID.fromString("c7f91df7-ed89-410b-87e7-a2b7ade9bf98");
        
        //Initiating the client
        FusionAuthClient client = new FusionAuthClient(apiKey, fusionauthURL);    
        
        //Using the returned ClientResponse object
        ClientResponse<Void, Errors> response = client.deleteUser(userId);        
           
        if (response.wasSuccessful()) {            
            System.out.println(response.successResponse);             
            
        } else {
            //Handling errors
            System.out.println(response.errorResponse);
        }
    }
}
```

If you run the above code, and the request is successful, you’ll get a response of `null`, indicating that the user has been deleted from FusionAuth.

## Retrieving an application’s details

Now, after seeing how you can implement various user management tasks using the Java client, let’s explore how you can use it to carry out various application management tasks. 

In FusionAuth, an [application](https://fusionauth.io/docs/v1/tech/core-concepts/applications) refers to where a user can log into. Before you begin integrating authentication capabilities with FusionAuth, you’ll need to create at least one application. With an application, you can register users’ to it, manage users’ roles, monitor users’ activities, and more. 

Do you remember the application ID we created earlier in this tutorial? It’s now time to put it to use. 

Let’s start by showing how you can retrieve an application’s details. To do so, we’ll call the `retrieveApplication` method and provide the application’s ID as a UUID string in the parameter’s value. 

Here is the code:

```java
import java.util.UUID;
import io.fusionauth.client.FusionAuthClient;
import io.fusionauth.domain.api.ApplicationResponse;

import com.inversoft.rest.ClientResponse;

public class FusionJava {

    public static void main(String[] args) {    
        
        String apiKey = "Z77y_yshOSAIfF3sd370Ns6m4VkKcAOqFpyyzSGfnF4";
        
        String fusionauthURL = "http://localhost:9011";
        
        UUID appId = UUID.fromString("3c219e58-ed0e-4b18-ad48-f4f92793ae32");
        
        //Initiating the client
        FusionAuthClient client = new FusionAuthClient(apiKey, fusionauthURL);    
        
        //Using the returned ClientResponse object
        ClientResponse<ApplicationResponse, Void> response = client.retrieveApplication(appId);        
           
        if (response.wasSuccessful()) {    
            //Outputting the application's details
            System.out.println(response.successResponse.application);             
            
        } else {
            //Handling errors
            System.out.println(response.errorResponse);
        }
    }
}
```

If you run the above code, you’ll get the registration details of the specified FusionAuth application.

## Deactivating an application

Next, to deactivate an application, we’ll use the `deactivateApplication` method and provide the ID of the application as its parameter. This disables the application, but does not delete all the data. You might do this if you need to disable logins for all users for system maintenance.

Here is the code:

```java
import java.util.UUID;
import io.fusionauth.client.FusionAuthClient;
import com.inversoft.error.Errors;
import com.inversoft.rest.ClientResponse;

public class FusionJava {

    public static void main(String[] args) {    
        
        String apiKey = "Z77y_yshOSAIfF3sd370Ns6m4VkKcAOqFpyyzSGfnF4";
        
        String fusionauthURL = "http://localhost:9011";
        
        UUID appId = UUID.fromString("991001b4-d196-4204-b483-a0ed5dbf7666");
        
        //Initiating the client
        FusionAuthClient client = new FusionAuthClient(apiKey, fusionauthURL);    
        
        //Using the returned ClientResponse object
        ClientResponse<Void, Errors> response = client.deactivateApplication(appId);        
           
        if (response.wasSuccessful()) {    
            
            System.out.println("Application deactivated successfully");         
            
        } else {
            //Handling errors
            System.out.println(response.errorResponse);
        }
    }
}
```

## Reactivating an application

To reactivate the application we’d deactivated, let’s use the `reactivateApplication` method and provide the ID of the application as its parameter. 

Here is the code:

```java
import java.util.UUID;
import io.fusionauth.client.FusionAuthClient;
import io.fusionauth.domain.api.ApplicationResponse;

import com.inversoft.error.Errors;
import com.inversoft.rest.ClientResponse;

public class FusionJava {

    public static void main(String[] args) {    
        
        String apiKey = "Z77y_yshOSAIfF3sd370Ns6m4VkKcAOqFpyyzSGfnF4";
        
        String fusionauthURL = "http://localhost:9011";
        
        UUID appId = UUID.fromString("991001b4-d196-4204-b483-a0ed5dbf7666");
        
        //Initiating the client
        FusionAuthClient client = new FusionAuthClient(apiKey, fusionauthURL);    
        
        //Using the returned ClientResponse object
        ClientResponse<ApplicationResponse, Errors> response = client.reactivateApplication(appId);        
           
        if (response.wasSuccessful()) {    
            //Outputting the application's details
            System.out.println(response.successResponse.application);        
            
        } else {
            //Handling errors
            System.out.println(response.errorResponse);
        }
    }
}
```

If you run the above code, and the request is successful, it’ll reactivate the application and output its details on the console. 

## Deleting an application

Lastly, let’s see how to delete an application from FusionAuth. To do this, we’ll use the `deleteApplication` method and provide the ID of the application as its parameter. 

Remember that this method permanently deletes the application from FusionAuth. So, you need to use it cautiously. 

Here is the code:

```java
import java.util.UUID;
import io.fusionauth.client.FusionAuthClient;
import io.fusionauth.domain.api.ApplicationResponse;

import com.inversoft.error.Errors;
import com.inversoft.rest.ClientResponse;

public class FusionJava {

    public static void main(String[] args) {    
        
        String apiKey = "Z77y_yshOSAIfF3sd370Ns6m4VkKcAOqFpyyzSGfnF4";
        
        String fusionauthURL = "http://localhost:9011";
        
        UUID appId = UUID.fromString("991001b4-d196-4204-b483-a0ed5dbf7666");
        
        //Initiating the client
        FusionAuthClient client = new FusionAuthClient(apiKey, fusionauthURL);    
        
        //Using the returned ClientResponse object
        ClientResponse<Void, Errors> response = client.deleteApplication(appId);        
           
        if (response.wasSuccessful()) {    
            //Outputting the application's details
            System.out.println(response.successResponse);        
            
        }else {
            //Handling errors
            System.out.println(response.errorResponse);
        }
    }
}
```

If you run the above code, and the request is successful, you’ll get a response of `null`, indicating that the application has been deleted from FusionAuth.

## Conclusion

To this end, you’ve seen how it is easy to integrate FusionAuth with Java using the client library. The library provides an easy-to-use native Java binding to the FusionAuth REST API, which allows you to quickly complete your identity and user management tasks. 

Of course, we’ve just scratched the surface of the things you can achieve with the FusionAuth Java client. You can head over to [the documentation](https://github.com/FusionAuth/fusionauth-java-client) and discover its other awesome capabilities. 

Next steps you might want to take to further explore:

* create a registration, which ties a user to an application
* log a user in
* add a user to a group


