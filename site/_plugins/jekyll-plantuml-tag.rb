require 'digest'
require 'fileutils'

module Jekyll
  class PlantumlTag < Liquid::Tag
    def initialize(name, param, tokens)
      super
      @source = param.strip
    end

    def render(context)
      site = context.registers[:site]
      diagram = File.join(site.source, @source)
      unless File.exist?(diagram)
        raise "Missing diagram #{@source}"
      end

      slash_index = @source.rindex("/")
      output_path = "assets/img/" + @source[1, slash_index - 1] # The name includes _diagrams, so I just strip off the underscore
      dot_index = @source.rindex(".")
      file_name = @source[slash_index + 1, dot_index - slash_index - 1] + ".svg"

      "<figure class='mw-100 mx-auto mb-4 text-center'>
        <img src='#{site.baseurl}/#{output_path}/#{file_name}' alt='Sequence diagram for the workflow'/>
        <figcaption class='figure-caption'>Sequence diagram for the workflow</figcaption>
      </figure>"
    end
  end
end

Liquid::Template.register_tag('plantuml', Jekyll::PlantumlTag)