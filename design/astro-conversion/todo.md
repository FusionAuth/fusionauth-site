# ToDo list for the Astro conversion

* [ ] Figure out how to have index pages end with a slash (i.e. /articles/login-authentication-workflows/ -> /articles/login-authentication-workflows/index.md)
* [ ] Figure out how to manage diagrams in articles in dark mode. Most are SVGs but we will need to figure out how to convert them or modify them or convert them to mermaid.
* [ ] Write redirects in the Cloudfront Lambda
* [ ] Figure out how to deploy to the same S3 bucket or a new one via GH Actions
* [ ] Do a final pass of the `Authentication` documents to make sure they got moved over properly. I think they are missing header images and those need to be `moved` to the new images directory
* [ ] Do a final pass of the `Login & Authentication Workflow` documents to make sure they got moved over properly. I think they are missing header images and those need to be `moved` to the new images directory
* [ ] Do a final pass of the `CIAM` documents to make sure they got moved over properly. I think they are missing header images and those need to be `moved` to the new images directory
* [ ] Migrate over the rest of the articles from `/learn/expert-advice`
* [ ] Migrate over the `Dev Tools` (will likely require some new HTML and such)
* [ ] Decide if we move `Dev Tools ` to the top level or keep them under articles (probably should move them but the top nav might get cluttered)
* [ ] Rebuild the Docs landing page in Astro (`/docs/`). I did a decent amount of this work already, but the page still exists in Jekyll and my page isn’t hooked up to anything
* [ ] Click test everything