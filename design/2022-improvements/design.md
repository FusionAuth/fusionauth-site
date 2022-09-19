# 2022 improvements

Currently, the FusionAuth documentation, blog, and expert advice are all managed using Jekyll. This includes guides, tutorials, and API docs. There are a number of pain points with this setup that I'll outline below:

1. Jekyll is slow (this might be Asciidoctor but it's hard to tell). Builds now take 20-30 seconds
2. PlantUML diagrams aren't all that nice looking
3. Asciidoctor is complex, hard to maintain, error prone, and challenging to use overall
4. API docs are not always in sync with code
5. Styling API docs is challenging
6. Table of contents are hard to build and render and generally require JavaScript, which impacts SEO
7. Search is hard to use, inaccurate, and not fully keyboard capable
8. The current design is uggs
9. The docs landing page needs a revamp. It should be customer focused (like a journey). Auth0 has a great journey with a diagram
10. Docs layout still needs IA and UX work


## Ideas for improvement

Here's some ideas on how to improve each of the issue above:

### Jekyll is slow

* Switch to Hugo
* Switch to Hexo
* Switch to Metalsmith or something similar

### PlantUML diagrams aren't all that nice looking

* Switch to Mermaid

### Asciidoctor is complex

* Switch to Markdown or an advanced alternative
* Switch to FreeMarker and use macros
  ```FreeMarker
    [@api]
      [@field required=true type="String"]name[/@field]
    [/@api]
  ```

### API docs are not always in sync with code

* We could use annotations in Java code to generate APIs

This might not be the best idea since our API docs often have a lot of extra information outside of the API itself. They also have admonitions and other complex components in the Asciidoc files.

### Styling API docs is challenging

* Using macros or something similar might help with this

### Table of contents are hard to build

* If we can figure out how to build this outside of the standard build chain. For example, maybe Asciidoc can generate these and we can somehow spit them out into the HTML?
* Otherwise, JavaScript will be the only way to make this work

### Search is hard to use, inaccurate, and not fully keyboard capable

* Find an open source search widget
* Write a custom Algolia plugin and search widget

### The current design is uggs

* Tailwind CSS and update design (rip someone else's design likely)

### The docs landing page needs a revamp

* Sean to design maybe?
* Implement with Tailwind?

