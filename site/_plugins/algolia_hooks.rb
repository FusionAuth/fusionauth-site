module Jekyll
  module Algolia
    module Hooks
     # from https://community.algolia.com/jekyll-algolia/hooks.html
     # don't send entire html
     # not sure if we need it
     def self.before_indexing_each(record, node, context)
        record[:html] = nil
        record
      end

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
        if record[:html] && record[:html].length > 9000
          puts "skipping: " + record[:url] + " as it has a length of " +record[:html].length.to_s
          return nil
        end
        return record
      end
    end
  end
end
