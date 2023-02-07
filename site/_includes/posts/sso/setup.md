To set up the application, navigate to the [FusionAuth admin UI](http://localhost:9011/admin) and select "Applications" on the left-hand navigation bar:

{% include _image.liquid src="/assets/img/blogs/includes/fusionauth/set-up-the-application.png" alt="Set up the
application." class="img-fluid" figure=true %}

Then click on the "+" button on the top right of the "Applications" page and fill in the "Name" field with a name of your choosing (here, it's **"your_application"**):

{% include _image.liquid src="/assets/img/blogs/includes/fusionauth/name-the-application.png" alt="Name your application." class="img-fluid" figure=true %}

You can leave all the other fields empty because FusionAuth will choose a default value for those fields. Go ahead and save the application in order for the Client Id details to be generated.

Access the "Application" page again and click on the "Edit Applications" icon (a little edit/notepad icon):

{% include _image.liquid src="/assets/img/blogs/includes/fusionauth/edit-application.png" alt="The list of applications. The edit icon is the blue pencil/notepad." class="img-fluid" figure=true %}

On the "Edit Application" page, click on the "OAuth" tab at the top. You'll need to get some information from this page.

{% assign oauthDetailsImage = include.oauthDetailsImage | default: '/assets/img/blogs/includes/fusionauth/oauth-details.png' %}
{% include _image.liquid src=oauthDetailsImage alt="The OAuth details tab." class="img-fluid" figure=true %}

* Record the generated "Client Id" and the "Client Secret" in a text file or to the clipboard. You'll use these below.
* Add the value `{{ include.callbackUrl | | default: "http://localhost:8000/oidc/callback/" }}` to the "Authorized redirect URLs" field. This will be used by FusionAuth to redirect the user to your application page once the user is successfully authenticated.
* Scroll down and check the "Require registration" checkbox. This ensures that users who haven't been registered for this application in FusionAuth aren't able to access it.

After filling in the details, click the "Save" icon.

{% include _callout-tip.liquid content="You aren't limited to one application, by the way. If you have multiple applications, or even other applications like Zendesk or forum software, set them up here to enable SSO." %}
