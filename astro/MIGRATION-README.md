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
      * For reference in this case `fusionauth-website-how-we-do-it` is the "slug".
  * Update the frontmatter.
    * Replace `excerpt_separator: "<!--more-->"` with `excerpt_separator: "{/* more */}"`
      * most anything could work here but astro will complain about the `<!--more-->` tag specifically, if you have a good reason you can use something else
    * Remove `layout: blog-post`. This is not needed.
    * Add a `publish_date`. The value should be the date you removed from the filename.
      * Note: most places use this field to order the shown posts from newest to oldest (index pages, related posts, etc)
    * If needed, add a `updated_date`.
    * `category` changes to `categories`. We now support multiple (space-separated).
    * `author` changes to `authors`. We now support multiple (comma-separated).
    * (optional): add a `featured_tag`. This will govern what is shown in the `More on...` sidebar. If not provided the first of the `tags` will be used.
    * (optional): add a `featured_category`. This will govern what is shown on the `Related Posts` section. If not provided the first of the `categories` will be used.
  * Copy any images, including the header, to a subdirectory under `astro/public/img/blogs`. For older posts you may need to update the references, for newer posts there should already be a subdirectory.
  * Update image reference. Change it from `{% include _image.liquid src="/assets/img/blogs/bootstrap-studio.png" alt="Bootstrap Studio screenshot" class="img-thumbnail float-left mr-md-4" figure=true %}` to `![Bootstrap Studio screenshot.](/img/blogs/fusionauth-website/bootstrap-studio.png)` 
    * If the caption is not a sentence, make it one.
  * Update the "more excerpt" from `<!--more-->` to `{/* more */}`
    * Per Emily you should try to keep the break before 160 characters
    * we have a hard-coded cap of 160 characters for the excerpt in most places it is used right now if you forget
    * we exclude any line that starts with `import` at the top of the excerpt so you can add any components you need without worry
  * If there are any `{% raw %}` tags you should remove them, backticks are enough.
  * If there are any callouts, import and use the astro ones instead.
    * After your frontmatter: `import Aside from '/src/components/Aside.astro';`
    * Then format the callout with `<Aside type="note">content</Aside>`
    * More here: https://inversoft.slack.com/archives/C04DGBXKPGC/p1691171143090139
  * If there are any blocks with `{% remote_include` replace them with the [Remote Code](src/components/RemoteCode.astro) component
  * If you find a `{% plantuml ...` tag
    * `git mv site/_diagrams/blogs/SUBDIR/DIAGRAM.plantuml astro/src/diagrams/blog/SUBDIR/DIAGRAM.astro`
    * Look at another sequence diagram to update your diagram to be mermaid compliant
      * Change `participant` to `actor` for a user initiating some action
      * Swap the positions of the name and the alias of actors/participants. PlantUML uses `Name as Alias` and Mermaid uses `Alias as Name`
      * Change `->` to `->>` for requests, and `->` to `-->>` for responses
      * Change notes of the form `== ... ==` to `Note over Alias1, Alias2: ...` where `Alias1` and `Alias2` are the participants that you want the note to span
      * Remove any newlines from descriptions
  * If there are any other liquid tags, you should remove them.
      * If there are attributes for a link such as '{:rel="nofollow"}', update to use an html anchor tag since there is not astro equivalent. <a href="https://fitsmallbusiness.com/reviews/single-sign-on-software-reviews/" title="Fit Small Business" rel="nofollow">Fit Small Business - Single Sign On Software</a>
  * Update references to adding a comment (usually at bottom of post) to posting in the forum: "If you have any questions about this blog post, please post in the [forum](/community/forum)."
  * Check to see how it renders: http://localhost:3000/blog/fusionauth-website-how-we-do-it
  * If there are any filename collisions, add a `-2` to the filename and note it in the `Notes` column.
* On the blog landing page the category callouts and pinned posts are defined [near the top of the file](src/pages/blog/index.astro) (this may move)
* You can add an author's link to personal site (such as Twitter) in the [mappings file](src/pages/blog/mappings.ts) (this may move)
* If you discover any widespread issues, file them here: https://inversoft.slack.com/archives/C04DGBXKPGC/p1691424115389019
* If you have any questions, ask in #documentation-project or add it to the `Notes` column.
* When you are done migrating the 5-10 posts, submit a PR. Open it against `development`.
* Review the PR yourself to make sure you didn't make any errors.
* Review by others TBD?
* Merge the PR to `development`.
* Mark all the posts `Done` in the `Done` column: https://docs.google.com/spreadsheets/d/1_0YX-uLRjGYFESBAZoPYeZ-iMKq4Bt7krywg0A1tTok/edit#gid=1303464598 

## Other notes

* do not check in astro/.astro/types.d.ts
* You can use `src/blog-migrate-firstpass.sh 2018-09-18-amazon-cognito-and-fusionauth-comparison.md` to do a first pass of a move.
* You can include other markdown pages if you need

```jsx
// Conent is the conent of the file https://docs.astro.build/en/guides/markdown-content/#the-content-component
import { Content as Install } from '../../components/blog/install-fusionauth.md'; 
...
// use it
<Install />
```
* There are several files in the root of /site/assets/img/blogs that may have been shared.  When the migration is complete, these should be deleted and then the site scanned for broken links.
  
## Handy find-replace regex

### Remote code (remember to import the RemoteCode component!)
you'll need to add the lang after

find:
```regexp
.*```.*\n.*remote_include (.*) %}.*\n```.*
```

replace:
```regexp
<RemoteCode url="$1" lang="" />
```

### Image (assuming you moved to the appropriate section from blogs to blogs)
find:
```regexp
.*include \_image\.liquid src="\/assets\/(.*)" alt="(.*)" c.*
```

replace:
```regexp
![$2.](/$1)
```
Or if you're editing with `vi`:
```
:s#^{%\s*include\s*_image.liquid\s*src="/assets\([^"]*\)"\s*alt="\([^"]*\)".*%}\s*#![\2.](\1)#
```
to update the liquid tag on the current line.
