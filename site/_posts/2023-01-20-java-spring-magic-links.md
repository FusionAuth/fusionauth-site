---
layout: blog-post
title: How to add magic links to your Java Spring application
description: It is easy to add magic links to your Java Spring application. Just integate FusionAuth and then configure magic links.
author: Dan Moore
image: blogs/tokens-after-grant/tokens-oauth-authorization-code-grant.png
category: article
tags: java spring magic-links
excerpt_separator: "<!--more-->"
---

## Intro

Magic links are a great way to make it easier for your users to log in to your application. They work by sending the user a one time code in a link, typically as an email or SMS message. When the user clicks on the link, they are then logged in to the application.

In this tutorial, you are going to learn how to add magic links functionality to your Java Spring application. You'll use FusionAuth to augment your application to easily add magic link login.

## Prequisites

You'll need to have Java and Maven installed. 

You'll also need Docker, since that is how you'll install FusionAuth.

## Download and install FusionAuth

First, make a project directory:

```shell
mkdir java-spring-magic-links && cd java-spring-magic-links
```
Then, install FusionAuth:

```bash
curl -o docker-compose.yml https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.yml
https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/docker-compose.override.yml
curl -o .env https://raw.githubusercontent.com/FusionAuth/fusionauth-containers/master/docker/fusionauth/.env
docker-compose up
```

TODO do we want to ship with mailcatcher so that email is taken care of?

## Create a user and an API key

Next, [log into your FusionAuth instance](http://localhost:9011). You'll need to set up a user and a password, as well as accept the terms and conditions.

Then, you're at the FusionAuth admin UI. This lets you configure FusionAuth via clickops. But you're only going to create an API key and then you'll configure FusionAuth using our Java client library. 

Navigate to "Settings" and then "API Keys". Click the + button to add a new API Key. Copy the value of the "Key" field and then save the key. It might be a value like `CY1EUq2oAQrCgE7azl3A2xwG-OEwGPqLryDRBCoz-13IqyFYMn1_Udjt`. This creates an API key that can be used for any FusionAuth API call. Save that off, you'll be using it later.

## Set up FusionAuth

Next, you need to set up FusionAuth. This can be done in different ways, but we're going to use the java client library. The below instructions are not for any IDE, but instead use command line maven.

First, make a directory:

```
mkdir setup-fusionauth && cd setup-fusionauth
```

Now, cut and paste the following file into `pom.xml`.

```
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>io.fusionauth.example</groupId>
  <artifactId>FusionAuthSetupExample</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>FusionAuth-setup</name>
  <description>An example of configuring FusionAuth</description>
  <dependencies>
    <dependency>
      <groupId>io.fusionauth</groupId>
      <artifactId>fusionauth-java-client</artifactId>
      <version>${fusionauth.version}</version>
    </dependency>
  </dependencies>
  <properties>
    <maven.compiler.source>1.8</maven.compiler.source>
    <maven.compiler.target>1.8</maven.compiler.target>
    <fusionauth.version>1.42.0</fusionauth.version>
  </properties>
</project>
```

Then make the directory for your setup class:

```
mkdir -p src/main/java/io/fusionauth/example
```

Then copy and paste the following code into the `src/main/java/io/fusionauth/example/Setup.java` file.

```java
package io.fusionauth.example;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.inversoft.error.Errors;
import com.inversoft.rest.ClientResponse;

import io.fusionauth.client.FusionAuthClient;
import io.fusionauth.domain.Application;
import io.fusionauth.domain.JWTConfiguration;
import io.fusionauth.domain.Key;
import io.fusionauth.domain.Tenant;
import io.fusionauth.domain.User;
import io.fusionauth.domain.UserRegistration;
import io.fusionauth.domain.api.ApplicationRequest;
import io.fusionauth.domain.api.ApplicationResponse;
import io.fusionauth.domain.api.KeyRequest;
import io.fusionauth.domain.api.KeyResponse;
import io.fusionauth.domain.api.TenantResponse;
import io.fusionauth.domain.api.UserResponse;
import io.fusionauth.domain.api.user.RegistrationRequest;
import io.fusionauth.domain.api.user.RegistrationResponse;
import io.fusionauth.domain.api.user.SearchRequest;
import io.fusionauth.domain.api.user.SearchResponse;
import io.fusionauth.domain.oauth2.GrantType;
import io.fusionauth.domain.oauth2.OAuth2Configuration;
import io.fusionauth.domain.oauth2.ProofKeyForCodeExchangePolicy;
import io.fusionauth.domain.search.UserSearchCriteria;

public class Setup {

    public static final String APPLICATION_ID = "E9FDB985-9173-4E01-9D73-AC2D60D1DC8E";

	public static void main(String[] args) throws URISyntaxException {
        final String apiKey = System.getProperty("fusionauth.api.key");
        final FusionAuthClient client = new FusionAuthClient(apiKey, "http://localhost:9011");
        
        // set the issuer up correctly        
        ClientResponse<TenantResponse, Void> retrieveTenantsResponse = client.retrieveTenants();
        if (!retrieveTenantsResponse.wasSuccessful()) {
			throw new RuntimeException("couldn't find tenants");
        }
        
        // should only be one
        Tenant tenant = retrieveTenantsResponse.successResponse.tenants.get(0);

        
        Map<String, Object> issuerUpdateMap = new HashMap<String, Object>();
        Map<String, Object> tenantMap = new HashMap<String, Object>();
        tenantMap.put("issuer","http://localhost:9011");
        issuerUpdateMap.put("tenant", tenantMap);
		ClientResponse<TenantResponse, Errors> patchTenantResponse = client.patchTenant(tenant.id, issuerUpdateMap );
		if (!patchTenantResponse.wasSuccessful()) {
			throw new RuntimeException("couldn't update tenant");
		}
		
        // generate RSA keypair
        UUID rsaKeyId = UUID.fromString("356a6624-b33c-471a-b707-48bbfcfbc593");
        
        Key rsaKey = new Key();
        rsaKey.algorithm = Key.KeyAlgorithm.RS256;
        rsaKey.name = "For JavaExampleApp";
        rsaKey.length = 2048;
        KeyRequest keyRequest = new KeyRequest(rsaKey);
        ClientResponse<KeyResponse, Errors> keyResponse = client.generateKey(rsaKeyId, keyRequest);
		if (!keyResponse.wasSuccessful()) {
			throw new RuntimeException("couldn't create RSA key");
		}
        
        // create application
        Application application = new Application();
        application.oauthConfiguration = new OAuth2Configuration();
        application.oauthConfiguration.authorizedRedirectURLs = new ArrayList<URI>();
        application.oauthConfiguration.authorizedRedirectURLs.add(new URI("http://localhost:8080/login/oauth2/code/fusionauth"));
        application.oauthConfiguration.requireRegistration = true;
        
		application.oauthConfiguration.enabledGrants = new HashSet<GrantType>(Arrays.asList(new GrantType[] {GrantType.authorization_code, GrantType.refresh_token}));
        application.oauthConfiguration.logoutURL = new URI("http://localhost:8080/logout");
        application.oauthConfiguration.proofKeyForCodeExchangePolicy = ProofKeyForCodeExchangePolicy.Required;
        application.name = "JavaExampleApp";
        
        // assign key from above to sign our tokens. This needs to be asymmetric
        application.jwtConfiguration = new JWTConfiguration();
        application.jwtConfiguration.enabled = true;
        application.jwtConfiguration.accessTokenKeyId = rsaKeyId;
        application.jwtConfiguration.idTokenKeyId = rsaKeyId;
        
        UUID clientId = UUID.fromString(APPLICATION_ID);
        String clientSecret = "change-this-in-production-to-be-a-real-secret";
                
        application.oauthConfiguration.clientSecret = clientSecret;
        ApplicationRequest applicationRequest = new ApplicationRequest(application);
        ClientResponse<ApplicationResponse, Errors> applicationResponse = client.createApplication(clientId, applicationRequest);
        if (!applicationResponse.wasSuccessful()) {
        	throw new RuntimeException("couldn't create application");
        }
        
        // register user, there should be only one, so grab the first
        UserSearchCriteria userSearchCriteria = new UserSearchCriteria();
        userSearchCriteria.queryString = "*";
		SearchRequest searchRequest = new SearchRequest(userSearchCriteria );
		
        ClientResponse<SearchResponse, Errors> userSearchResponse = client.searchUsersByQuery(searchRequest);
        if (!userSearchResponse.wasSuccessful()) {
        	throw new RuntimeException("couldn't find users");
        }
        User myUser = userSearchResponse.successResponse.users.get(0);
        
        // patch the user to make sure they have a full name, otherwise OIDC has issues
        Map<String, Object> fullNameUpdateMap = new HashMap<String, Object>();
        Map<String, Object> userMap = new HashMap<String, Object>();
        userMap.put("fullName",myUser.firstName+ " "+myUser.lastName);
        fullNameUpdateMap.put("user", userMap);
		ClientResponse<UserResponse, Errors> patchUserResponse = client.patchUser(myUser.id, fullNameUpdateMap);
		if (!patchUserResponse.wasSuccessful()) {
			throw new RuntimeException("couldn't update user");
		}
        
		// now register the user
        UserRegistration registration = new UserRegistration();
        registration.applicationId = clientId;
        
        // otherwise we try to create the user as well as add the registration
        User nullBecauseWeHaveExistingUser = null;
        
		RegistrationRequest registrationRequest = new RegistrationRequest(nullBecauseWeHaveExistingUser, registration );
		ClientResponse<RegistrationResponse, Errors> registrationResponse = client.register(myUser.id, registrationRequest);
		if (!registrationResponse.wasSuccessful()) {
        	throw new RuntimeException("couldn't register user");
		}
    }
}
```

Then, you can run the setup class. This will create FusionAuth configuration for your Spring application.

```
mvn compile && mvn exec:java -Dexec.mainClass="io.fusionauth.example.Setup" -Dfusionauth.api.key=<your API key>
```

If you want, you can [login to your instance](http://localhost:9011) and examine the new application configuration the script created for you.

## Set up Spring

Now you are going to create a Spring application. While this is starting with a simple Spring application, you can use the same configuration to integrate your Spring application with FusionAuth.

First, make a directory:

```
mkdir ../setup-spring && cd ../setup-spring
```

Then, install the following files in these locations.

Put a `pom.xml` file at the top level. Here are the contents of this file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>2.7.5</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>io.fusionauth.example</groupId>
	<artifactId>FusionAuthSpring</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>FusionAuthSpring</name>
	<description>Demo project for Spring Boot</description>
	<properties>
		<java.version>17</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-oauth2-client</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-thymeleaf</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
			</plugin>
		</plugins>
	</build>

</project>
```

Then, you need to create two directories:

```
mkdir -p src/main/resources/templates && \
mkdir -p src/main/java/io/fusionauth/example/spring/config
``

Paste the below into `src/main/resources/application.properties`. This is mostly the OAuth configuration you need.

```properties
spring.thymeleaf.cache=false
spring.thymeleaf.enabled=true 
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html

spring.application.name=FusionAuth Spring Example

spring.security.oauth2.client.registration.fusionauth-client.client-id=e9fdb985-9173-4e01-9d73-ac2d60d1dc8e
spring.security.oauth2.client.registration.fusionauth-client.client-secret=change-this-in-production-to-be-a-real-secret
spring.security.oauth2.client.registration.fusionauth-client.scope=email,openid,profile
spring.security.oauth2.client.registration.fusionauth-client.redirect-uri=http://localhost:8080/login/oauth2/code/fusionauth
spring.security.oauth2.client.registration.fusionauth-client.client-name=fusionauth
spring.security.oauth2.client.registration.fusionauth-client.provider=fusionauth
spring.security.oauth2.client.registration.fusionauth-client.client-authentication-method=basic
spring.security.oauth2.client.registration.fusionauth-client.authorization-grant-type=authorization_code

spring.security.oauth2.client.provider.fusionauth.authorization-uri=http://localhost:9011/oauth2/authorize
spring.security.oauth2.client.provider.fusionauth.token-uri=http://localhost:9011/oauth2/token
spring.security.oauth2.client.provider.fusionauth.user-info-uri=http://localhost:9011/oauth2/userinfo?schema=openid
spring.security.oauth2.client.provider.fusionauth.user-name-attribute=name
spring.security.oauth2.client.provider.fusionauth.user-info-authentication-method=header
spring.security.oauth2.client.provider.fusionauth.jwk-set-uri=http://localhost:9011/.well-known/jwks.json
```

Then put this HTML in the `src/main/resources/templates/home.html` file. This is going to be the page unauthenticated users see.

```html
<html xmlns:th="http://www.w3.org/1999/xhtml" lang="en">
<head><title>Home Page</title></head>
<body>
	<h1>Hello !</h1>
	<p>Welcome to <span th:text="${appName}">Our App</span></p>

	<p>You can view your profile <a href="/profile">here</a></p>
</body>
</html>
```

And this HTML in the `src/main/resources/templates/profile.html` file. This is going to be the page authenticated users can access. This will only show a JSON representation of the user, but you could put other protected information in this page.

```html
<html xmlns:th="http://www.w3.org/1999/xhtml" lang="en">
<head><title>User Profile</title></head>
<body>
	<h1>Welcome to the protected User page. Below is your OpenID profile information.</h1>
	<p>Profile: <span th:text="${profile}"></span></p>

	<h2>You can logout here: <a href="http://localhost:9011/oauth2/logout?client_id=e9fdb985-9173-4e01-9d73-ac2d60d1dc8e">Logout</a></h2>
</body>
</html>
```

Then, you need to add the java files that comprise your Spring application. There are four: 

* An application startup class
* A configuration class
* Two controllers for the pages you added above

Let's add the startup file first. In `src/main/java/io/fusionauth/example/spring/FusionAuthSpringApplication.java`, put this code:

```java
package io.fusionauth.example.spring;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FusionAuthSpringApplication {

	public static void main(String[] args) {
		SpringApplication.run(FusionAuthSpringApplication.class, args);
	}

}
```

Next, the configuration class. In `src/main/java/io/fusionauth/example/spring/config/SecurityConfiguration.java`, put this code:

```java
package io.fusionauth.example.spring.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestCustomizers;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfiguration {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http, ClientRegistrationRepository repo)
      throws Exception {

    var base_uri = OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI;
    var resolver = new DefaultOAuth2AuthorizationRequestResolver(repo, base_uri);

    resolver.setAuthorizationRequestCustomizer(OAuth2AuthorizationRequestCustomizers.withPkce());

    http
        .authorizeRequests(a -> a
            .antMatchers("/").permitAll()
            .anyRequest().authenticated())
        .oauth2Login(login -> login.authorizationEndpoint().authorizationRequestResolver(resolver));

    http.logout(logout -> logout
        .logoutSuccessUrl("/"));

    return http.build();
  }
}
```

Finally, create the home and profile controllers which back the HTML templates above.

Here's the home controller, which should live in `src/main/java/io/fusionauth/example/spring/FusionAuthSpringApplication.java`, which should contain this code:

```java
package io.fusionauth.example.spring;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {

  @Value("${spring.application.name}")
  String appName;

  @RequestMapping("/")
  public String homePage(Model model) {
      model.addAttribute("appName", appName);
      return "home";
  }  
}
```

Here's the profile controller, which should live in `src/main/java/io/fusionauth/example/spring/HomeController.java`. It should have this code:

```java
package io.fusionauth.example.spring;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ProfileController {

  public ProfileController() {

  } 

  @RequestMapping("/profile")
  public String userPage(Model model, @AuthenticationPrincipal OidcUser principal) {
    if (principal != null) {
      model.addAttribute("profile", principal.getClaims());
    }
    return "profile";
  }
}
```

Once you've set these up, you can start up the Spring application using this command: `mvn spring-boot:run`.

You can now open up an incognito window and visit [the Spring app](http://localhost:8080). Log in using the user you added in FusionAuth, and you'll see a JSON output of your profile on the profile page.

Now, let's enable magic links. Let's create another script. First, go back to the `fusionauth-setup` directory:

```
cd ../setup-fusionauth
```

You'll use the same client library and API key, but run different commands.

Put the below code in `src/main/java/io/fusionauth/example/AddMagicLink.java`.

```java
package io.fusionauth.example;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.inversoft.error.Errors;
import com.inversoft.rest.ClientResponse;

import io.fusionauth.client.FusionAuthClient;
import io.fusionauth.domain.api.ApplicationResponse;

public class AddMagicLink {

    public static void main(String[] args) {
        final String apiKey = System.getProperty("fusionauth.api.key");
        final FusionAuthClient client = new FusionAuthClient(apiKey, "http://localhost:9011");

        // enable magic links
        UUID clientId = UUID.fromString(Setup.APPLICATION_ID);
        
        Map<String, Object> applicationMap = new HashMap<String, Object>();
        Map<String, Object> passwordlessConfigurationMap = new HashMap<String, Object>();
        Map<String, Object> enableMagicLinkUpdateMap = new HashMap<String, Object>();
        
        passwordlessConfigurationMap.put("enabled",true);
        applicationMap.put("passwordlessConfiguration", passwordlessConfigurationMap);
        enableMagicLinkUpdateMap.put("application", applicationMap);

        ClientResponse<ApplicationResponse, Errors> applicationResponse = client.patchApplication(clientId, enableMagicLinkUpdateMap);
        if (!applicationResponse.wasSuccessful()) {
        	throw new RuntimeException("couldn't update application");
        }
    }
}
```

You can run this by using a similar mvn command:

```shell
mvn compile && mvn exec:java -Dexec.mainClass="io.fusionauth.example.AddMagicLinks" -Dfusionauth.api.key=<your API key>
```

Now, test to see that you have magic links enabled for your application. Close any other incognito windows you have open and then open a new one. (This ensures you've logged out of the application.)

Visit [the spring java application](http://localhost:8080) and log in again. Now, on the login page, you should see a magic link button.

TBD image?

If you want to click it and have it work, make sure you [set up your FusionAuth email configuration](/docs/v1/tech/email-templates/configure-email) using a service like Sendgrid or Mailgun.




