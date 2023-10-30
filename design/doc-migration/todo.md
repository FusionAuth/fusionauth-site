# Doc migration TODOs

* [x]  Handle video embed. See https://fusionauth.io/docs/v1/tech/identity-providers/hypr
  * Video embeds break mobile view, probably fixable via tailwind
  * Lyle - this was handled by using the YouTube component. I belive I got them all in docs.

* [ ] Wide tables break mobile view, can we fix in tailwind? If not we may need to manually add line breaks

* [ ]  Need to make the <code> in the interpolated string work in src/content/docs/_shared/_idp-application-configuration.astro (Lyle - need more info, what's wrong with it?)
* [ ]  “badges” in docs/authenticate/add-login/social/twitter have white interiors. investigate. See asciidoc versiom at https://fusionauth.io/docs/v1/tech/identity-providers/twitter (is this still a thing?)
* [ ]  styling is off on APIURL items, see http://localhost:3000/docs/customize/email-and-messages/deprecated/twilio-push-pre-1-26 (more info?)
* [ ]  Look at the premium edition blurb in http://localhost:3000/docs/customize/email-and-messages/configuring-application-specific-email-templates. The hyperlink isn’t rendering - how do we get the component to treat the content injected into <slot /> as markdown?


* [ ]  Our CSS code highlighting could be more colorful (what do we want to do about this?)

* [ ]  Update <Icon> to use proper font-awesome icons. Some are not quite right. See /docs/get-started/core-concepts/entity-management
* [ ]  We are planning on removing the styles on [uielement] because it isn’t differentiated from [field] and even when it is, it seems confusing as to what it means.
    * [ ]  Old 
    * [ ]  New

