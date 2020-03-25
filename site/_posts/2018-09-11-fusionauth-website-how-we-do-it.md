---
layout: blog-post
title: The FusionAuth website - How we do it
description: How we built the FusionAuth website using BootstrapStudio, Jekyll, JustComments and other tools
author: Brian Pontarelli
image: blogs/fusionauth-website.png
category: blog
excerpt_separator: "<!--more-->"
---

We recently launched the FusionAuth website, so I thought it would be fun to write a blog post about how we build the site. We use a combination of a couple of tools, some scriptage, and Jekyll. If you want to check out our source, this website is stored as a public repository in Github here: [https://github.com/FusionAuth/fusionauth-site](https://github.com/FusionAuth/fusionauth-site).

<!--more--> 

Here's how it all comes together:

## Bootstrap Studio

{% include _image.html src="/assets/img/blogs/bootstrap-studio.png" alt="Bootstrap Studio screenshot" class="img-thumbnail float-left mr-md-4" figure=true %}

I'm personally a big fan of frameworks and while Bootstrap 4 has a couple of things that I'm not a huge fan of, namely their use of padding instead of margin in grid layout, lack of control for fluid snap points, and some of their widgets like add-ons. However, overall Bootstrap is a solid framework. The biggest hurdle is finding an awesome designer that can code Bootstrap - can you say Unicorn? This isn't as much of a hurdle as it once was though. There are now a bunch of decent tools to help designers design and developers tweak. We landed on Bootstrap Studio. It works pretty well, but it still requires quite a bit of knowledge about CSS and HTML. Bryan Giese, our faithful CMO, was able to get the base design busted out and then Daniel and I "bootstrap-ified" it.

One of the other key reasons we selected Bootstrap Studio was that it has the ability to run a script after exporting. This is a big win for us because it allows us to rip apart the HTML that is generated and put it into Jekyll includes. Luckily, Bootstrap Studio creates excellent HTML that is well formed, clean, not deeply nested, and concise. This makes parsing and using it easy.

Here's the quick overview of the tasks our Bootstrap Studio export script does (they are all near the bottom of the script).

1. Covert the `index.html` file (homepage) to a Jekyll page by removing everything except the main content.
2. Build the Jekyll includes (`_head.html`, `_navigation.html`, etc) by parsing `index.html` and finding `<head>`, `<nav>`, etc.
3. Copy all the assets from the Bootstrap Studio `/assets` directory into Jekyll.
4. Build the blog listing page using the file `blog-post-list.html` from Bootstrap Studio. This becomes a Jekyll page at `/blog/index.html` so we can use the Paginate plugin.
5. Build the blog post page using the file `blog-post.html` from Bootstrap. This becomes a Jekyll layout page called `blog-post.html`.
6. Convert the rest of the pages from Bootstrap Studio to Jekyll pages by removing everything except the main content.

Below is the Ruby script that we wrote to do the conversion. Also, you'll see that this uses the awesome [Nokogiri](http://www.nokogiri.org) library for parsing and manipulating HTML. Hats off to the team of contributors to the Nokogiri project, it's epically awesome.

{% raw %}
```ruby
#!/usr/bin/env ruby
require 'fileutils'
require 'nokogiri'

export_directory = ARGV[0]
script_directory = File.dirname(__FILE__)

$log_file = File.open("#{export_directory}/logfile.txt", "w")

def build_includes(html_doc, script_directory)
  # Handle the head
  head = html_doc.at_css("head")
  title = head.at_css("title")
  title.content = "{{page.title}}"
  description = head.at_css("meta[name=\"description\"]")
  description["content"] = "{{page.description}}"
  head.add_child("<link rel=\"stylesheet\" href=\"/assets/css/highlight.css\">")
  File.open("#{script_directory}/_includes/_head.html", "w", :encoding => "UTF-8") {|f| f.puts(head.to_s.gsub(/\.html/, ""))}

  # Handle navigation
  nav = html_doc.at_css("nav")
  nav.children[0].add_previous_sibling("\n{% assign url = page.url | downcase %}\n")
  links = nav.css("a.nav-link")
  links.each do |link|
    href = link.attribute("href").value
    if href == "/index.html"
      link["href"] = "/"
    elsif href.end_with?(".html")
      link["href"] = href[0..-6]
    end

    if href == "/index.html"
      link["class"] = "nav-link {% if url == '/' %}active{% endif %}"
    else
      link["class"] = "nav-link {% if url == '#{href}' %}active{% endif %}"
    end
  end
  File.open("#{script_directory}/_includes/_navigation.html", "w", :encoding => "UTF-8") {|f| f.puts(nav.to_s)}

  # Handle footer (including scripts and everything below the <footer> tag)
  footer = html_doc.at_css("footer")
  File.open("#{script_directory}/_includes/_footer.html", "w", :encoding => "UTF-8") do |f|
    f.puts(footer.to_s.gsub(/\.html/, "").gsub(/a href="\/\//, "a href=\"/"))
    sibling = footer.next_element
    until sibling == nil
      f.puts(sibling.to_s)
      sibling = sibling.next_element
    end
  end
end

def convert_file(html_doc, output_file_name)
  title = html_doc.at_css("title")
  title_text = title != nil ? title.content : ""
  description = html_doc.at_css("meta[name=\"description\"]")
  description_text = description != nil ? description.attribute("content").value : ""
  main = html_doc.at_css("main")

  File.open(output_file_name, "w", :encoding => "UTF-8") do |f|
    f.puts("---\nlayout: default\ntitle: #{title_text}\ndescription: #{description_text}\n---\n")
    f.puts(main.to_s.gsub(/\.html/, ""))
  end
end

def copy_assets(export_directory, script_directory)
  FileUtils.cp_r("#{export_directory}/assets", script_directory)
end

def build_blog_post_layout(html_doc, script_directory)
  main = html_doc.at_css("main")
  main.at_css(".post-title").content = "{{ page.title }}"
  main.at_css(".post-author").content = "{{ page.author }}"
  main.at_css(".post-date").content = "{{ page.date | date_to_string: \"ordinal\", \"US\" }}"
  main.at_css(".post-body-content").content = "\n{% if page.markdown == 1 %}\n  {{ content | markdownify }}\n{% else %}\n  {{ content }}\n{% endif %}"
  main.at_css(".post-image")["style"] = "background-image: url('/assets/img/blogs/{{ page.image }}');"
  File.open("#{script_directory}/_layouts/blog-post.html", "w", :encoding => "UTF-8") do |f|
    f.puts("<!doctype html>\n<html>\n{% include _head.html %}\n<body>\n{% include _navigation.html %}\n")
    f.puts(main.to_s)
    f.puts("{% include _footer.html %}\n</body>\n</html>")
  end
end

def build_blog_post_list_layout(html_doc, script_directory)
  title = html_doc.at_css("title")
  title_text = title != nil ? title.content : ""
  description = html_doc.at_css("meta[name=\"description\"]")
  description_text = description != nil ? description.attribute("content").value : ""

  main = html_doc.at_css("main")
  main.at_css(".post-title").content = "{{ post.title }}"
  main.at_css(".post-author").content = "{{ post.author }}"
  main.at_css(".post-date").content = "{{ post.date | date_to_string: \"ordinal\", \"US\" }}"
  main.at_css("nav").content = "{% include _pagination.html %}"
  main.at_css(".post-link")["href"] = "{{post.url}}"
  main.at_css(".post-image img")["src"] = "/assets/img/blogs/{{post.image}}"
  body = main.at_css(".post-body-content")
  body.content = "{{ post.excerpt }}"
  list = main.at_css(".post-list")
  list.add_previous_sibling("{% for post in paginator.posts %}\n")
  list.add_next_sibling("\n{% endfor %}")
  File.open("#{script_directory}/blog/index.html", "w", :encoding => "UTF-8") do |f|
    f.puts("---\nlayout: default\ntitle: #{title_text}\ndescription: #{description_text}\n---\n")
    f.puts(main.to_s.gsub(/%7B/, "{").gsub(/%7D/, "}")) # Handle the escaping of { } characters in anchor tags by Nokogiri
  end
end

# Grab the home page file and extract the head, nav and footer
html_doc = File.open("#{export_directory}/index.html") { |f| Nokogiri::HTML(f) }
convert_file(html_doc, "#{script_directory}/index.html")
build_includes(html_doc, script_directory)
copy_assets(export_directory, script_directory)

# Handle the blog pages specially
html_doc = File.open("#{export_directory}/blog-post.html") { |f| Nokogiri::HTML(f) }
build_blog_post_layout(html_doc, script_directory)
html_doc = File.open("#{export_directory}/blog-post-list.html") { |f| Nokogiri::HTML(f) }
build_blog_post_list_layout(html_doc, script_directory)

# Handle the rest of the files
Dir.foreach(export_directory) do |file|
  if file.end_with?(".html") && File.file?("#{export_directory}/#{file}") && file != "index.html" && file != "blog-post.html" && file != "blog-post-list.html"
    html_doc = File.open("#{export_directory}/#{file}") { |f| Nokogiri::HTML(f) }
    convert_file(html_doc, "#{script_directory}/#{file}")
  end
end
```
_`BootstrapStudioConvert.rb`_
{: .mt-0 .text-right}
{% endraw %}

This is a work in progress, but you can always see the latest version in the Github repository.

## Jekyll

Once we have the Bootstrap Studio files converted to Jekyll, the rest is pretty straight forward. We use base Jekyll with the `jekyll-paginate` plugin for the blog list page and `jekyll-asciidoc` plugin for our docs. The reason we use Asciidoc for our docs is that they are quite a bit more complicated than can be easily supported with Markdown.

The Jekyll project is run locally while we are deving on the site using this command:

```bash
$ bundle exec jekyll serve
```

## Deployment

The release process is a bit different. We have an Amazon EC2 instance (t2.medium I believe) that is setup with Chef and has separate accounts for the team. Any team member can deploy the site via the command-line. 

To accomplish this, we are using the Savant build tool. Savant makes it very simple to write build files and add build targets that perform arbitrary tasks. We could have written all of our build tasks as separate shell scripts, but since we maintain Savant, we figured we might as well use it. :)

The Savant build file contains a target named `push`. On the server, we have a clone of the Github repository. The build target ssh's to the server and then runs the `deploy.sh` script in the directory that contains the clone of the project. Here's the Savant build target we are using to execute the push:

```groovy
target(name: "push", description: "Push the site to fusionauth.io") {
  // Skip checking Git if we are forced to do so (use the force Luke)
  if (!switches.has("force")) {
    output.infoln("Checking git")
    proc = new ProcessBuilder("git", "diff-index", "--quiet", "origin/master", "--")
        .inheritIO()
        .start()
    proc.waitFor()

    if (proc.exitValue() != 0) {
      output.infoln("You must commit and push your changes before running this command. (Use --force to skip this check, but keep in mind that your local changes won't be visible until they are pushed)")
      exit 1
    }
  }

  output.infoln("Deploying...")
  proc = new ProcessBuilder("ssh", "-t", "fusionauth.io", "sudo -u www-data /var/git/fusionauth-site/deploy.sh")
      .inheritIO()
      .start()
  proc.waitFor()
}
``` 

The `deploy.sh` command is simple. It updates the project and then runs a Jekyll build. Here's what the `deploy.sh` script looks like:

```bash
#!/usr/bin/env bash

if [ ! "$(hostname)" = "fusionauth" ]; then
  echo "You are only supposed to run this on fusionauth.io, run sb push instead."
  exit 0
fi

set -e

cd /var/git/fusionauth-site

git pull

bundle exec jekyll build

cp -R _site/* /var/www/fusionauth.io
```

That's basically it. We have a couple of other components like the Mailchimp form at the bottom of the page and the Formspree.io for our Contact Us form. Those are integrated via the HTML, CSS and JavaScript provided by those companies.

Feel free to grab any of these scripts for your own website or clone the Github repo and hack away. If you have any comments or suggestions, leave them below.