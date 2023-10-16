# Doc migration TODOs

* [ ]  There are 173 tables. I think they’re probably ok to convert by hand, but we should publish what the caption styling needs to be
* [x]  Update [field]#...# to use the InlineField component
* [x]  Handle video embed. See https://fusionauth.io/docs/v1/tech/identity-providers/hypr
* [ ]  Need to make the <code> in the interpolated string work in src/content/docs/_shared/_idp-application-configuration.astro
* [ ]  “badges” in docs/authenticate/add-login/social/twitter have white interiors. investigate. See asciidoc versiom at https://fusionauth.io/docs/v1/tech/identity-providers/twitter
* [ ]  styling is off on APIURL items, see http://localhost:3000/docs/customize/email-and-messages/deprecated/twilio-push-pre-1-26
* [ ]  Look at the premium edition blurb in http://localhost:3000/docs/customize/email-and-messages/configuring-application-specific-email-templates. The hyperlink isn’t rendering - how do we get the component to treat the content injected into <slot /> as markdown?
* [ ]  We failed on **Jared Dunn **  <jared@piedpiper.com>, thinking <jared@piedpiper.com is a component. 
* [ ]  Our CSS code highlighting could be more colorful
* [ ]  Update <Icon> to use proper font-awesome icons. Some are not quite right. See /docs/get-started/core-concepts/entity-management

* [ ]  We are planning on removing the styles on [uielement] because it isn’t differentiated from [field] and even when it is, it seems confusing as to what it means.
    * [ ]  Old 
    * [ ]  New

* [ ] /apis/overview doesn't work as index.mdx, and chec for other overviews

