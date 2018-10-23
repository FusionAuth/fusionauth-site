---
layout: blog-post
title: "Easy Integration of Spring and FusionAuth"
author: Tyler Scott
categories: blog
image: blogs/spring-and-fusionauth-example.jpg
excerpt_separator: <!--more-->
---

Making a Spring application with FusionAuth is easy. Follow the steps below and in about an hour you'll have FusionAuth providing your user login and authorization on your own site. Or you can be up and running in a few minutes by using our example app. It's up to you.
<!--more-->

Don't want to read? [Jump to the example](https://github.com/FusionAuth/fusionauth-spring-security-example).

Steps to get going:
----
1. [Download and Install FusionAuth](/)
2. [Create an Application](/docs/v1/tech/tutorials/create-an-application)
   1. While you are creating an application, create two roles `user` and `admin` (you can create others if you like)
   2. Add a valid redirect url to your OAuth configuration. For our example we will use `http://localhost:8081/login`.
   3. Click save (blue icon at the top right)

3. Copy your `Client id` and `Client secret` from the Application configuration into `application.properties` under the `fusionAuth.clientId` and `fusionAuth.clientSecret` properties (respectively). Below is a template that you can use for the configuration file:

    If you are running FusionAuth inside a container or on a server, you might need to change the URLs below to point to your FusionAuth instance.

    ```properties
    server.port=8081

    # OpenID
    fusionAuth.clientId=
    fusionAuth.clientSecret=
    fusionAuth.accessTokenUri=http://localhost:9011/oauth2/token
    fusionAuth.logoutUri=http://localhost:9011/oauth2/logout
    fusionAuth.userAuthorizationUri=http://localhost:9011/oauth2/authorize
    fusionAuth.userInfoUri=http://localhost:9011/oauth2/userinfo
    fusionAuth.redirectUri=http://localhost:8081/login
    ```

4. Setup a basic Spring application and include the FusionAuth Spring Security library in your Maven POM file. (see a full example [pom.xml](https://github.com/FusionAuth/fusionauth-spring-security-example/blob/master/pom.xml))

    ```xml
    <dependency>
        <groupId>io.fusionauth</groupId>
        <artifactId>fusionauth-spring-security</artifactId>
        <version>1.0.2</version>
    </dependency>
    ```

5. Connect our library to your application using a Spring Security configuration.

    In order to connect our library, you need to tell your application how to use it.
    This means first creating a bean (`myfilter` in our example) that returns
    our `OpenIDConnectFilter`. The filter needs to know where you would like your login
    endpoint to be and for our example we will use `"/login"`. The filter also needs
    access to the `OAuth2RestTemplate` as our library builds on top of the built in
    Spring OAuth2 workflow.

    __Quick overview of OpenID workflow__

    1. A user clicks on a login link `<a href="/login">Login</a>`
    2. Spring handles the `/login` request by initiating an OAuth2 redirect to the authorize endpoint
    on the FusionAuth instance.
    3. The user logs in to the FusionAuth instance and gets redirected back to your application with
    an authentication code. In our example they will get redirected back to `/login` and login will
    detect the code to proceed to the next step.
    4. Next, Spring exchanges the auth code for a access token. This token contains user details
    and some data pertaining to the users authority. Unfortunately this token is encoded and we can't touch the data (yet).
    5. Now our filter takes over and we call the `userinfo` API to get all of the data out of the token which we load into the `FusionAuthUserDetails` object from our library which is what
    powers the `@PreAuthorize` annotation methods. This is accessible
    via `SpringContextHolder.getContext().getAuthentication().getPrincipal()`

    __Spring Security annotations__

    For ease of use, we chose to use Spring Security annotations that quickly mark which Controllers
    require what permissions. To enable these annotations you must mark your security configuration
    with `@EnableGlobalMethodSecurity(prePostEnabled = true)` To learn more on this,
    read the Spring Security docs here: https://docs.spring.io/spring-security/site/docs/3.0.x/reference/el-access.html

    __Example `SecurityConfig`__

    ```java
    @Configuration
    @EnableWebSecurity
    @EnableGlobalMethodSecurity(prePostEnabled = true)
    public class SecurityConfig extends WebSecurityConfigurerAdapter {
      @Autowired
      private OAuth2RestTemplate restTemplate;

      @Override
      public void configure(WebSecurity web) {
        web.ignoring().antMatchers("/resources/**");
      }

      @Bean
      public OpenIDConnectFilter myFilter() {
        // This is the core of our library and what is required to get role detection
        OpenIDConnectFilter filter = new OpenIDConnectFilter("/login");
        filter.setRestTemplate(restTemplate);
        return filter;
      }

      @Override
      protected void configure(HttpSecurity http) throws Exception {
        http.addFilterAfter(new OAuth2ClientContextFilter(), AbstractPreAuthenticatedProcessingFilter.class)
            .addFilterAfter(myFilter(), OAuth2ClientContextFilter.class)
            .authorizeRequests()
            .antMatchers("/error").permitAll();
      }
    }
    ```

6. We also need to tell Spring to use our configuration for the OAuth portion of the workflow so we create a few beans.

    ```java
    @Configuration
    @EnableOAuth2Client
    public class FusionAuthOpenIdConnectConfig {
      @Value("${fusionAuth.accessTokenUri}")
      private String accessTokenUri;

      @Value("${fusionAuth.clientId}")
      private String clientId;

      @Value("${fusionAuth.clientSecret}")
      private String clientSecret;

      @Value("${fusionAuth.redirectUri}")
      private String redirectUri;

      @Value("${fusionAuth.userAuthorizationUri}")
      private String userAuthorizationUri;

      @Value("${fusionAuth.userInfoUri}")
      private String userInfoUri;

      @Bean
      public OpenIDAuthorizationCodeResourceDetails fusionAuthOpenId() {
        OpenIDAuthorizationCodeResourceDetails details = new OpenIDAuthorizationCodeResourceDetails();
        details.setClientId(clientId);
        details.setClientSecret(clientSecret);
        details.setAccessTokenUri(accessTokenUri);
        details.settUserInfoUri(userInfoUri);
        details.setUserAuthorizationUri(userAuthorizationUri);
        details.setScope(asList("openid", "email"));
        details.setPreEstablishedRedirectUri(redirectUri);
        details.setUseCurrentUri(false);
        details.setClientAuthenticationScheme(AuthenticationScheme.form);
        return details;
      }

      @Bean
      public OAuth2RestTemplate fusionAuthOpenIdTemplate(final OAuth2ClientContext clientContext) {
        return new OAuth2RestTemplate(fusionAuthOpenId(), clientContext);
      }
    }
    ```

8. Finally we register a few controller endpoints and setup the main application entry point.

    Example controller:
    ```java
    @RequestMapping("/")
    @PreAuthorize("permitAll()")
    public String home() {
      return "hello";
    }
    ```

    Example restricted controller:
    ```java
    @RequestMapping("/profile")
    @PreAuthorize("hasAuthority('user') or hasAuthority('admin')")
    public String profile() {
      return "profile";
    }
    ```

    Application entry point:
    ```java
    @SpringBootApplication
    public class ExampleApplication extends SpringBootServletInitializer {
      public static void main(String[] args) {
        SpringApplication.run(ExampleApplication.class, args);
      }
    }
    ```

Now all of our requests will automatically verify a users authorization.

Registration
------------
In our example application we also handle basic registration of a user. This is completely optional but
your users will need to be registered somehow in order to have roles for this application, this could
mean manual entry in the frontend of the FusionAuth instance or an external application that is
automatically registering users from another source. However if you would like to allow users to register
themselves then this is an easy way to do it.

1. [Create](https://fusionauth.io/docs/v1/tech/tutorials/create-an-api-key)/Copy your FusionAuth
API key and your application id into `application.properties`. Also update the base url to be
the location of your FusionAuth instance.

    ```properties
    # API
    fusionAuth.apiKey=
    fusionAuth.applicationId=
    fusionAuth.baseUrl=https://demo.fusionauth.io
    ```

1. Create a `/register` controller that uses the FusionAuth java client for its backing.

    1. Automatically wire the FusionAuth java client
        ```java
        @Value("${fusionAuth.apiKey}")
        private String apiKey;

        @Value("${fusionAuth.baseUrl}")
        private String baseUrl;

        @Bean
        public FusionAuthClient setupClient() {
          FusionAuthClient client = new FusionAuthClient(apiKey, baseUrl);
          return client;
        }
        ```

    1. Create a basic getter that serves the form
        ```java
        @RequestMapping(value = "/register", method = RequestMethod.GET)
        @PreAuthorize("permitAll()")
        public String registerGet() {
          return "register";
        }
        ```

    1. Create the meat of the registration that can handle both a logged in user (someone who has an account on your fusionauth instance but isn't registered for this application) and a new user.

        For both cases we want to connect a user, its roles, and an application so we use a `UserRegistration` with the application id and the default roles. The new user will automatically
        be added to the registration so you don't need to add their id to that registration as
        it doesn't exist yet anyways.

        After that you can all the clients register method and check the response for any errors.
        If you find any, you should throw an exception and let the handler deal with how to display
        that to a user.


        ```java
        @RequestMapping(value = "/register", method = RequestMethod.POST,
              consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
        @PreAuthorize("permitAll()")
        public View registerPost(@RequestBody MultiValueMap<String, String> body) {
          Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

          ClientResponse response;

          if (authentication.isAuthenticated() && authentication.getPrincipal() instanceof FusionAuthUserDetails) { // User is logged in
            FusionAuthUserDetails userDetails = (FusionAuthUserDetails) authentication.getPrincipal();
            UserRegistration registration = new UserRegistration()
                .with(reg -> reg.userId = UUID.fromString(userDetails.userId))
                .with(reg -> reg.applicationId = UUID.fromString(appId))
                .with(reg -> reg.roles.add("user"));

            response = fusionAuthClient.register(registration.userId, new RegistrationRequest(null, registration));
          } else { // This is a new user
            UserRegistration registration = new UserRegistration()
                .with(reg -> reg.applicationId = UUID.fromString(appId))
                .with(reg -> reg.roles.add("user"));

            User newUser = new User()
                .with(user -> user.username = body.getFirst("username"))
                .with(user -> user.password = body.getFirst("password"))
                .with(user -> user.email = body.getFirst("email"));

            response = fusionAuthClient.register(null, new RegistrationRequest(newUser, registration));
          }

          if (response.wasSuccessful()) {
            return new RedirectView("/");
          } else {
            throw new RegistrationException(response.errorResponse.toString());
          }
        }

        public class RegistrationException extends RuntimeException {
          RegistrationException(String cause) {
            super(cause);
          }
        }
        ```

        A couple notes: The registration api will require that a new user login after they register so that they can get
        a valid token in their cookies. You will want to register an [exception handler](https://github.com/FusionAuth/fusionauth-spring-security-example/blob/master/src/main/java/io/fusionauth/controller/ExceptionHandlers.java)
        for the `RegistrationException`; without this, your errors will show up as 500 exceptions.


Automatic Login
---------------
Say you wanted to have the user automatically log in if they reach an authenticated access point. Well that is pretty easy,
just use this variation of the security config.

```java
http.addFilterAfter(new OAuth2ClientContextFilter(), AbstractPreAuthenticatedProcessingFilter.class)
        .addFilterAfter(myFilter(), OAuth2ClientContextFilter.class)
        .httpBasic().authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login"))
        .and()
        .authorizeRequests()
        .antMatchers("/error").permitAll();
```


----

That's all it takes! When you get set up, send us a link to your site. We'd love to see what you did. If you have any
questions or comments, let us know in the comments below or [contact us](https://fusionauth.io/contact).
