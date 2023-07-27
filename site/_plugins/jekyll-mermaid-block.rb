module Jekyll
  class Mermaid < Liquid::Block

    def initialize(tag_name, markup, tokens)
      super
    end

    def render(context)
      @config = context.registers[:site].config['mermaid']
      "<div style=\"width: 100%;display: flex;justify-content: center;\"><div class=\"mermaid\">#{super}</div></div>"
    end
  end
end

Liquid::Template.register_tag('mermaid', Jekyll::Mermaid)