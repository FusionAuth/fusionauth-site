module Jekyll
  module Algolia
    module Hooks
      def self.should_be_excluded?(filepath)
        return false if filepath =~ %r{^docs}
        true
      end
    end
  end
end
