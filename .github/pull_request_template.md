### Problem
<!--- A brief description of the purpose for this pull-request. For example, what needs to be fixed, modified, or updated and why --->

### Solution
<!--- Optional: a brief description of a fix that may have been applied --->

### Linked PR
<!--- For example, if this PR is in `fusionauth-site` with other related changes in another PR for `fusionauth-client-builder`.  Include a link --->

### Reviewer Notes
<!--- Any additional notes that may help guide a reviewer with their review.  --->
<!--- Any specific items that you want to call out for someone to review --->

### Self-review Checklist

- [ ] Read aloud to make sure it flows. Prefer direct imperative instructions. Use "you", never "we". "Let's" is acceptable.
- [ ] The software is FusionAuth, never FA. Use "admin UI" to refer to the admin application, and "hosted login pages" to refer to the screens a normal user uses to log in.
- [ ] Run through Google spell/grammar check
- [ ] Run through an LLM of your choosing with the prompt "I'm writing a (blog post|doc) about [topic]. Here it is. The reader is going to be a senior developer. What would you do to improve it?" (You don't have to mindlessly do everything the LLM suggests, but you should see if the suggestions improve your post).
- [ ] Code spacing is 2 spaces per indent
- [ ] Any referenced github repositories points to FusionAuth organization
- [ ] Design has created a header image
- [ ] Title and description are present
- [ ] [RemoteCode](https://github.com/FusionAuth/fusionauth-astro-components) used for any code blocks
- [ ] Diagrams render
- [ ] Images resized appropriately
- [ ] Screenshots of admin UI use PiedPiper characters and local.fusionauth.io. Don't mix PiedPiper users on the same page. Make sure same character is used throughout the page (unless they represent different admin users)
- [ ] Proper nouns are correct, per https://github.com/FusionAuth/fusionauth-site/blob/main/DocsDevREADME.md
- [ ] Do all the checks pass (eslint, contentcheck, etc).

#### Example App

- [ ] If there is an example app, add it to to astro/src/content/json/exampleapps.json 
- [ ] Add a kickstart file, ensure example app runs with kickstart
- [ ] Use the Download widget
- [ ] Add a README to the example app repo

#### Blog Post

- [ ] Add category
- [ ] Add tags

### Post Merge Checklist

- [ ] Reply to any forum posts on the relevant topic (can be found using google and a query like 'fusionauth forum [topic]'
- [ ] Reply or close related GitHub issues
