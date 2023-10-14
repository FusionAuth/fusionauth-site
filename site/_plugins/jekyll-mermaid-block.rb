module Jekyll
  class Mermaid < Liquid::Block

    def initialize(tag_name, markup, tokens)
      super
      @attributes = {}
      markup.scan(::Liquid::TagAttributes) do |key, value|
        @attributes[key] = value
      end

    end

    def render(context)
      display = @attributes['display']
      unless display
        display = 'flex'
      end

      @config = context.registers[:site].config['mermaid']
      "<div style=\"width: 100%;display: " + display + "; justify-content: center;\"><div class=\"mermaid\">#{super}</div></div>"
    end
  end
end

Liquid::Template.register_tag('mermaid', Jekyll::Mermaid)
