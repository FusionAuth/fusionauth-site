Next, [log into your FusionAuth instance](http://localhost:9011){:target="_blank"}. You’ll need to set up a user and a password, as well as accept the terms and conditions.

Then, you’re at the FusionAuth admin UI.  This lets you configure FusionAuth manually.  But for this tutorial, you're going to create an API key and then you’ll configure FusionAuth using our {{include.language}} client library.

Navigate to <span>Settings -> API Keys</span>{:.breadcrumb}. Click the <span>+</span>{:.uielement} button to add a new API Key.  Copy the value of the <span>Key</span>{:.field} field and then save the key.
It might be a value like `CY1EUq2oAQrCgE7azl3A2xwG-OEwGPqLryDRBCoz-13IqyFYMn1_Udjt`.

Doing so creates an API key that can be used for any FusionAuth API call. Save that key value off as you’ll be using it later.
