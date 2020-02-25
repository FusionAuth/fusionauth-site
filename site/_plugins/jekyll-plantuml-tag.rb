require 'digest'
require 'fileutils'

module Jekyll
  class PlantumlTag < Liquid::Tag
    def initialize(name, param, tokens)
      super
      # @source = param.strip
      @attributes = {}
      param.scan(::Liquid::TagAttributes) do |key, value|
        @attributes[key] = value
      end
    end

    def render(context)
      site = context.registers[:site]
      diagram = File.join(site.source, @attributes['source'])
      unless File.exist?(diagram)
        raise "Missing diagram #{@attributes['source']}"
      end

      slash_index = @attributes['source'].rindex("/")
      output_path = "assets/img/" + @attributes['source'][1, slash_index - 1] # The name includes _diagrams, so I just strip off the underscore
      dot_index = @attributes['source'].rindex(".")
      file_name = @attributes['source'][slash_index + 1, dot_index - slash_index - 1] + ".svg"

      "<figure class='mw-100 mx-auto mb-4 text-center'>
        <img src='#{site.baseurl}/#{output_path}/#{file_name}' class='img-fluid' alt='#{@attributes['alt'].gsub("\"", "")}'/>
        <figcaption class='figure-caption'>#{@attributes['alt'].gsub("\"", "")}</figcaption>
      </figure>"
    end
  end
end

Liquid::Template.register_tag('plantuml', Jekyll::PlantumlTag)