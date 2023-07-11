---
layout: blog-post
title: Get More Value Out of FusionAuth Using the APIs for User Maintenance
description: Customizing the order for your favorite food can make a good meal better. Customizing your end-users experience with user maintenance can make their experience with your application even better.
author: Mark Robustelli
image: blogs/get-more-value/get-more-value-header.png
category: article
tags: api user maintenance windows forms c#
excerpt_separator: "<!--more-->"
---

So, you have just set up FusionAuth and are excited to take your new customer authentication and authorization platform out for a spin. You spend some time setting up your Users, Applications, Tenants, etc. in the robust front end provided. Things are looking great. You have integrated your applications and are humming along. Now comes a real test, user maintenance.

<!--more-->

<br>

### Introduction
*“A new user with extra pickles, please.”*

Customizing the order for your favorite food can make a good meal better. Customizing your end-users experience with user maintenance can make their experience with your application even better.

For any secure application, user maintenance is a must. As developers, we can often overlook the time and effort it takes to maintain the users access and permissions for the shiny new application we created. In an ideal world, we do not want to be the ones to maintain the users. We want to give the task of user maintenance to the power users of the applications by making them application administrators. While those power users may be great at using the application, you don’t necessarily want to make them expert users of the FusionAuth front end. Well, we at FusionAuth would think it would be great if everyone was a master with our front end, but you may not share that same vision.

We can harness the full power of FusionAuth in our application, hand off the user maintenance to the power users, and make it seamless for them. The application will need to ensure the user enters the correct information (**Validation**), guide them through setting up the new user correctly (**Workflow**), and we want to make the process feel like it is part of our application (**Branding**). We can accomplish all these through the use of the FusionAuth APIs.

The examples below are written with the assumption that you are familiar with how to make REST calls using the HttpClient in C#, the use of asynchronous calls and Windows Forms applications.  In order for the sample application to run you must have a working FusionAuth server. Even if you are not totally familiar with these concepts, the snippets should be easy enough to follow with general programming knowledge. If you need a refresher on some of these topics, there are some links at the end.

<br>

### Validation
*“With great power, comes great responsibility!”*

One of FusionAuth’s strengths is its flexibility. However, with the flexibility comes some complexity. To create a user in the FusionAuth front-end, you only need one piece of information. You will need to supply either the username or the email. (If you are using multiple tenants, you will need the tenant ID as well.) The front end gives you other optional fields to fill in as well, however none are required. When using the [Create a User API](/docs/v1/tech/apis/users#create-a-user), only the username or email is still required but there are also over 30 additional request parameters available for customization. Creating a custom front end around the APIs will not only allow you to choose which of the username or email fields to use, but also what other meta-data is appropriate and required for your application. Below is sample code for creating a user using the FusionAuth API.

<br>

#### **Setup**
First, we need to create a few objects to hold some values. By constructing the classes and decorating properties with the proper attributes, we can still use the strongly typed objects and standard naming conventions in our C# application while also using the JSON Serializer to easily format the request body when it is time.

```cs
//For User object
public class User
{
    [JsonProperty(PropertyName = "user")]
    public UserProperties UserProperties;
}

public class UserProperties
{
    [JsonProperty(PropertyName = "firstname")]
    public string FirstName;
    [JsonProperty(PropertyName = "lastname")]
    public string LastName;
    [JsonProperty(PropertyName = "email")]
    public string Email;
    [JsonProperty(PropertyName = "password")]
    public string Password;
}
```

<br>

#### **Input**
Next, we need to take the input from the user and assign them to the values in our User object. In this case, I am performing those actions on a click event from a windows form. We can also take this chance to validate any information deemed relevant to your application. The logic in the IsUserValid function can be edited to suit your needs. Once the validation is successful, we will then pass the user object to the method that will submit our request to the FusionAuth server.

```cs
private async void btnCreateUser_Click(object sender, EventArgs e)
{
    //FusionAuthClient is a class that contains the logic to call the FusionAuth APIs
    var faClient = new FusionAuthClient();

    UserProperties userProperties = new UserProperties()
    {
        Email = txtEmail.Text,
        FirstName = txtFirstName.Text,
        LastName = txtLastName.Text,
        Password = txtPassword.Text
        //add additional properties here
    };

    User userToCreate = new User()
    {
        UserProperties = userProperties
    };

    //perform custom validation logic in the IsUserValid method
    if (IsUserValid(userToCreate))
    {
        ReturnValue userCreatedReturnValue = await faClient.CreateUser(userToCreate);
        if (userCreatedReturnValue.success == true)
        {
            LogResults($"User created with ID: {userCreatedReturnValue.result}");
        }
        else
        {
            LogResults($"User creation failed. {userCreatedReturnValue.result}");
        }
    }
    else
    {
        LogResults($"User data provided is invalid");
    }
}
```
<br>

#### **User Creation**

Because we decorated our User objects correctly using the JSONProperty attribute, we can use the JSON Serializer to serialize the object with the simple JsonConvert.SerializeObject method. We also need to encode it properly before we submit it. Once that is complete, we can submit the request to the FusionAuth server. We do so here using the async pattern so as to not hold up the processing for a request that may take some time or give the application an unresponsive feel. Once we receive the return values, we can interrogate them and act accordingly.

```cs
public async Task<ReturnValue> CreateUser(User userToCreate)
{
    //returns HttpClient with correct setting for instance
    HttpClient httpClient = GetClient();

    //initialize the return value 
    ReturnValue returnVal = new ReturnValue()
    {
        success = false
    };

    try
    {
        //set the endpoint for creating a user
        string apiURL = $"/api/user";

        var payload = JsonConvert.SerializeObject(userToCreate);
        var content = new StringContent(payload, Encoding.UTF8, "application/json");

        HttpResponseMessage response = await httpClient.PostAsync($"{Constants.BASE_URL}{apiURL}", content);

        if (response.IsSuccessStatusCode)
        {
            
            string responseBody = await response.Content.ReadAsStringAsync();
            JObject result = JObject.Parse(responseBody);
            returnVal.success = true;
            //assign the newly created user id to the result
            returnVal.result = result["user"]["id"].ToString();
        }

    }
    catch (Exception ex)
    {
        Console.WriteLine($"There was an error in the request {ex.Message}");
        returnVal.result = ex.Message;
    }
    

    return returnVal;
}
```

<br>

### Workflow
*“Amateurs do it till they get it right. Professionals do it until they can not get it wrong.”*

You may have originally set up the users manually in the FusionAuth front end and that is fine to get started. However, as we add more steps and requirements to creating a user, the more likely something will be missed. There can be several steps required to set up a user correctly such as making sure they belong to the correct group(s). While we may be infallible as developers and get it right every time, most likely our users will not.

We can use the FusionAuth APIs to ensure the user is added to the correct group or groups so their permissions will be set properly. After the user is created, we can take this opportunity to automatically assign the user to a specific group or present a front end to the administrator that will guide them in selecting the proper group(s).

<br>

#### **Setup**
Once again we will need to create a few objects to help us organize our groups. The [Add Users to a Group API](/docs/v1/tech/apis/groups#add-users-to-a-group) call we are using requires a collection of groups that each contain an array of user information. In this case, we will only be using the user ID for the new GroupUser information.

```cs
//For Group object
public class Group
{
    public string ID;
    public List<GroupUser> Users;
}

public class GroupUser
{
    [JsonProperty(PropertyName = "userId")]
    public string UserID;
}
```
<br>

#### **Input**
As with creating the user, we need to take the input from the application and assign the values to our Group objects. We can also validate any data we want before actually adding the user to the group. After we are satisfied the user should be added, we can submit the information to the method that will submit our request to the FusionAuth server.

```cs
private async void btnAddUserToGroup_Click(object sender, EventArgs e)
{
    //FusionAuthClient is a class that contains the logic to call  the FusionAuth APIs
    var faClient = new FusionAuthClient();

    List<GroupUser> users = new List<GroupUser>()
    {
        new GroupUser() 
        {
            UserID = txtUserIDToAddToGroup.Text
        }
    };

    Group group = new Group();

    group.ID = txtGroupIDToAddTo.Text;
    group.Users = users;

    List<Group> groups = new List<Group>();
    groups.Add(group);

    //perform custom validation logic here
    if (IsGroupValid(group))
    {
        ReturnValue addUserToGroupReturnValue = await faClient.AddUserToGroup(groups);
        if (addUserToGroupReturnValue.success == true)
        {
            LogResults($"User has been added to the group: {addUserToGroupReturnValue.result}");
        }
        else
        {
            LogResults($"Adding the user to the group has failed. {addUserToGroupReturnValue.result}");
        }
    }
    else
    {
        LogResults($"User and/or group data provided is invalid");
    }
}
```

<br>

#### **Add the User to the Group**
Because the JSON format expected in the request body is not readily serializable given the Group objects we have created, we will have to perform a little wizardry to manipulate the Group objects. While this does not have to do with FusionAuth specifically, I have abstracted the code for that in the FormatGroupUserJSON function. The code for that will be in the project. Once the API call has returned, you can retrieve whichever values you see as relevant and pass it back in the result object.

```cs
public async Task<ReturnValue> AddUserToGroup(List<Group> groups)
{
    //returns HttpClient with correct setting for instance
    HttpClient httpClient = GetClient();

    //initialize the return value 
    ReturnValue returnVal = new ReturnValue()
    {
        success = false
    };

    try
    {
        //set the endpoint for creating a user
        string apiURL = $"/api/group/member";

        var payload = FormatGroupUserJSON(groups);
        var content = new StringContent(payload, Encoding.UTF8, "application/json");

        HttpResponseMessage response = await httpClient.PostAsync($"{Constants.BASE_URL}{apiURL}", content);

        if (response.IsSuccessStatusCode)
        {

            string responseBody = await response.Content.ReadAsStringAsync();
            JObject result = JObject.Parse(responseBody);
            returnVal.success = true;
            returnVal.result = $"Member ID for added user: {result["members"].First().First()[0]["id"]}";
        }
        else
        {
            returnVal.result = $"Adding user to the group failed.\nPayload\n{payload}\n{response}";
        }

    }
    catch (Exception ex)
    {
        Console.WriteLine($"There was an error in the request {ex.Message}");
        returnVal.result = ex.Message;
    }


    return returnVal;
}
```

<br>

### Branding
*“Design is the silent ambassador of your brand.”*

One of the best parts about using the APIs to allow application admins to manage their own users is they never have to leave your application. Users are accustomed to things such as Single Page Applications or at least applications that have a consistent look and feel. Depending on the use case, a user may feel uncomfortable switching to the FusionAuth front end to manage users. While FusionAuth has a well designed and functional front end, the look and feel will likely be different than your application. By using the APIs you can still use all of your own style sheets and design principles.

You may ask yourself, “If I create a front end for user management in my application, shouldn’t I just create the authentication and authorization framework as well?” The answer to that question is a resounding “No!” The security, power and flexibility FusionAuth gives you has taken a long time to create and perfect. You should focus on providing the unique business value your application provides versus reinventing the authentication wheel. The best part is that you can ride on the shoulders of giants by creating a simple user management interface around the security and power of FusionAuth. You get the best of both worlds. You don’t even have to tell your users you are using FusionAuth. It’s Okay, we don’t mind. We hope we make you look good.

{% include _image.liquid src="/assets/img/blogs/get-more-value/one-does-not-simply.png" alt="One does not simply implement user access management" class="img-fluid" figure=false %}

<br>

### Conclusion
These are a few simple examples of how to use the FusionAuth APIs to get more value out of FusionAuth.  Please take some time to explore the [FusionAuth API documentation](/docs/v1/tech/apis/) and get some more ideas of ways to use them to better serve your development.  For instance, we have used the APIs to create a user, but you can do the same thing when deleting users or removing them from an application.  You can do things like monitor an external application and remove the user from FusionAuth on a given event.  By integrating the FusionAuth APIs not only can you automate the validation process, setup users, and make it all look like your own, but you can add almost any ability within FusionAuth to your application.

<br>

### Links

#### FusionAuth APIs

* [General API Documentation](/docs/v1/tech/apis/)
* [Create a User](/docs/v1/tech/apis/users#create-a-user)
* [Delete a User](/docs/v1/tech/apis/users#delete-a-user)
* [Add Users to a Group](/docs/v1/tech/apis/groups#add-users-to-a-group)

#### FusionAuth Server Setup

* [5-Minute Setup Guide](/docs/v1/tech/5-minute-setup-guide)

#### Sample Application Source

* [FusionAuth API Demo](hhttps://github.com/FusionAuth/fusionauth-example-dotnet-windowsform-api)

#### General

* [HttpClient](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient?view=net-7.0)
* [Asynchronous programming with async and await](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)
