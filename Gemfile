source "https://rubygems.org"

# Hello! This is where you manage which Jekyll version is used to run.
# When you want to use a different version, change it below, save the
# file and run `bundle install`. Run Jekyll with `bundle exec`, like so:
#
#     bundle exec jekyll serve
#
# This will help ensure the proper Jekyll version is running.
# Happy Jekylling!
gem "jekyll", "4.0.0"
# gem "nokogiri", "1.10.1"

# This is the default theme for new Jekyll sites. You may change this to anything you like.
gem "minima", "2.5.1"

# If you want to use GitHub Pages, remove the "gem "jekyll"" above and
# uncomment the line below. To upgrade, run `bundle update github-pages`.
# gem "github-pages", group: :jekyll_plugins

# If you have any plugins, put them here!
group :jekyll_plugins do
  gem "jekyll-asciidoc", "3.0.0"
  gem "jekyll-feed", "0.12.1"
  gem "jekyll-paginate-v2", "2.1.0", git: "https://github.com/sverrirs/jekyll-paginate-v2"
  gem "jekyll-autoprefixer", "1.0.2"
end

# For the docs
gem "asciidoctor", "2.0.10"
gem "haml", "5.1.2"
gem "thread_safe", "0.3.6"
gem "tilt", "2.0.10"
gem "pygments.rb", "1.2.1"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# Performance-booster for watching directories on Windows
gem "wdm", "0.1.0" if Gem.win_platform?
