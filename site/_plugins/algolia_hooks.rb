module Jekyll
  module Algolia
    module Hooks

      def self.should_be_excluded?(filepath)
        return true if filepath =~ %r{^landing}
        false
      end

      def self.before_indexing_each(record, _node, _context)
        if _node != nil

          # Simplify h1, h2, h3, h4, h5 and h6 indexing in case of embedded elements.
          # - Specifically, the h1 in release notes includes an inner <a> that does not need to be indexed.
          if %w[h1 h2 h3 h4 h5 h6].include? _node.name
            record[:html] = _node.text.strip
            record[:text] = _node.text
          end

          # Collapse JSON for better searching.
          # - Sort of a variation of https://github.com/algolia/jekyll-algolia/issues/63#issuecomment-380863265
          #   .content, .text, .to_str, and .inner_text are all aliases.
          # - Do we have to also modify record[:html] ?
          if _node.name == 'code' && _node.attr('data-lang') == 'json'
            record[:html] = _node.text.strip
            record[:text] = _node.text
          end

        end

        # skip really long records
        if record[:content] && record[:content].length > 9000
          puts "skipping some content on " + record[:url] + " as it has a length of " +record[:content].length.to_s
          return nil
        end

        # from https://community.algolia.com/jekyll-algolia/hooks.html
        # don't send entire html
        # we don't need it, takes up more space
        record[:html] = nil
        return record
      end
    end
  end
end
