
# Instructions for migrating blog content 

We're migrating from site/_posts to astro/src/content/blog

Steps:

* Claim 5-10 posts here by putting your name in the 'Who is migrating' column: https://docs.google.com/spreadsheets/d/1_0YX-uLRjGYFESBAZoPYeZ-iMKq4Bt7krywg0A1tTok/edit#gid=1303464598 
  * Start with the oldest posts
* Check out `development`. 
* `git pull origin development` to get the latest code.
* Branch it: `git checkout -b mooreds/migrating-blog-1`
* For each of your posts:
  * `git mv` the file from `site/_posts` to `astro/src/content/blog`
    * Give it a new name with a `.mdx` suffix and no date. `2018-09-11-fusionauth-website-how-we-do-it.md` => `fusionauth-website-how-we-do-it.mdx`
  * Update the frontmatter.
    * Replace `excerpt_separator: "<!--more-->"` with `excerpt_separator: "{/* more */}"`
    * Add a `publish_date`. The value should be the date you removed from the filename.
    * If needed, add a `updated_date`.
  * Copy any images, including the header, to a subdirectory under `astro/public/img/blogs`. For older posts you may need to update the references, for newer posts there should already be a subdirectory.
  * Update image reference. Change it from `{% include _image.liquid src="/assets/img/blogs/bootstrap-studio.png" alt="Bootstrap Studio screenshot" class="img-thumbnail float-left mr-md-4" figure=true %}` to `![Bootstrap Studio screenshot.](/img/blogs/fusionauth-website/bootstrap-studio.png)` 
  * Update the "more excerpt" from `<!--more-->` to `{/* more */}`
  * If there are any `{% raw %}` tags you should remove them, backticks are enough.
  * If there are any callouts, import and use the astro ones instead. More here: https://inversoft.slack.com/archives/C04DGBXKPGC/p1691171143090139
  * If there are any other liquid tags, you should remove them.
  * Remove references to adding a comment (usually at bottom of post)
  * Check to see how it renders: http://localhost:3000/blog/fusionauth-website-how-we-do-it
  * If there are any filename collisions, add a `-2` to the filename and note it in the `Notes` column.
* If you discover any widespread issues, file them here: https://inversoft.slack.com/archives/C04DGBXKPGC/p1691424115389019
* If you have any questions, ask in #documentation-project or add it to the `Notes` column.
* When you are done migrating the 5-10 posts, submit a PR. Open it against `development`.
* Review the PR yourself to make sure you didn't make any errors.
* Review by others TBD?
* Merge the PR to `development`.
* Mark all the posts `Done` in the `Done` column: https://docs.google.com/spreadsheets/d/1_0YX-uLRjGYFESBAZoPYeZ-iMKq4Bt7krywg0A1tTok/edit#gid=1303464598 

## Other notes

* do not check in astro/.astro/types.d.ts
