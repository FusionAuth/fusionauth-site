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
  title.content = "{{ page.title | strip_html }} - FusionAuth"
  description = head.at_css("meta[name=\"description\"]")
  description["content"] = "{{ page.description }}"
  head.add_child("<link rel=\"stylesheet\" href=\"/assets/css/highlight.css\">")
  head.add_child("<link rel=\"stylesheet\" href=\"/assets/css/site-local.css\">")
  File.open("#{script_directory}/_includes/_head.html", "w", :encoding => "UTF-8") {|f| f.puts(head.to_s)}

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
  og_image = html_doc.at_css("meta[property=\"share-image\"]")
  og_image_text = og_image != nil ? og_image.attribute("content").value : "fusionauth-share-image.jpg"
  main = html_doc.at_css("main")

  File.open(output_file_name, "w", :encoding => "UTF-8") do |f|
    f.puts("---\nlayout: default\ntitle: #{title_text}\ndescription: #{description_text}\nimage: #{og_image_text}\n---\n")
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
  main.at_css(".post-image")["style"] = "background-image: url('/assets/img/{{ page.image }}');"
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
  main.at_css(".post-image img")["src"] = "/assets/img/{{post.image}}"
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

# Copy all of the landing pages w/out conversion
FileUtils.cp_r("#{export_directory}/landing", script_directory)
