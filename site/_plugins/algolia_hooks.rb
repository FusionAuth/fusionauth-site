module Jekyll
  module Algolia
    module Hooks

      def self.should_be_excluded?(filepath)
        return true if filepath =~ %r{^landing}
        false
      end

      def self.before_indexing_each(record, _node, _context)
        # skip really long records
        if record[:content] && record[:content].length > 9000
          puts "skipping: " + record[:url] + " as it has a length of " +record[:content].length.to_s
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
