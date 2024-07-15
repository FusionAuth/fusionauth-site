import Breadcrumb from 'src/components/Breadcrumb.astro';
import InlineField from 'src/components/InlineField.astro';
import InlineUIElement from 'src/components/InlineUIElement.astro';

To set up the application, navigate to the [FusionAuth admin UI](http://localhost:9011/admin) and select <Breadcrumb>Applications</Breadcrumb> on the left-hand navigation bar:

![Set up the application.](/img/blogs/includes/fusionauth/set-up-the-application.png)

Then click on the <InlineUIElement>+</InlineUIElement> button on the top right of the <Breadcrumb>Applications</Breadcrumb> page and fill in the <InlineField>Name</InlineField> field with a name of your choosing (here, it's **"your_application"**):

![Name your application.](/img/blogs/includes/fusionauth/name-the-application.png)

You can leave all the other fields empty because FusionAuth will choose a default value for those fields. Go ahead and save the application in order for the Client Id details to be generated.

Access the <Breadcrumb>Application</Breadcrumb> page again and click on the "Edit Applications" icon (a little edit/notepad icon):

![The list of applications. The edit icon is the blue pencil/notepad.](/img/blogs/includes/fusionauth/edit-application.png)

On the <Breadcrumb>Edit Application</Breadcrumb> page, click on the <Breadcrumb>OAuth</Breadcrumb> tab at the top. You'll need to get some information from this page.
