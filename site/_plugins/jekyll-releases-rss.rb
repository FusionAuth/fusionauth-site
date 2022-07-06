require 'net/http'
require 'uri'
require 'json'
require 'rss'
require 'nokogiri'
require 'date'

module Jekyll
  class ReleasesFeedGenerator < Generator

    def generate(site)
      begin 
        url = 'https://account.fusionauth.io/api/version'
        content = Net::HTTP.get(URI.parse(url))
  
        rn_url = 'https://fusionauth.io/docs/v1/tech/release-notes'
        rn_content = Net::HTTP.get(URI.parse(rn_url))
        rn_doc = Nokogiri::HTML::DocumentFragment.parse(rn_content)
  
        rn_archive_url = 'https://fusionauth.io/docs/v1/tech/archive/release-notes'
        rn_archive_content = Net::HTTP.get(URI.parse(rn_archive_url))
        rn_archive_doc = Nokogiri::HTML::DocumentFragment.parse(rn_archive_content)
  

        releases = JSON.parse(content)
        releaseslist = releases['versions'].reverse()
        latest_date = nil
        rss = RSS::Maker.make("atom") do |maker|
          maker.channel.author = "FusionAuth"
          maker.channel.about = "https://fusionauth.io"
          maker.channel.title = "FusionAuth Releases Feed"
  
          maker.channel.updated = nil
          
          releaseslist.each do |r|
            if /RC/.match(r)
              next
            end
            anchor_text = r.to_s.gsub("\.","-")
            
            fragment = rn_doc.css('#version-'+anchor_text +' + p')
            date = fragment.css('p > em').inner_text
            unless date && date.length > 2
              # look in archive
              fragment = rn_archive_doc.css('#version-'+anchor_text +' + p')
              date = fragment.css('p > em').inner_text
            end
  
            # no valid date? Skip it
            unless (date && date.length > 2)
              next
            end
  
            maker.items.new_item do |item|
              item.link = "https://fusionauth.io/docs/v1/tech/release-notes#version-"+anchor_text
              item.title = "Release "+r.to_s
              if date && date.length > 2
                item.updated = date.to_s
              end
            end
  
            if maker.channel.updated.nil?
              # first time, we want to grab the latest release timestamp
              maker.channel.updated = date.to_s
              latest_date = Time.parse(date.to_s)
            end
          end
        end
  
        file_name = "releases.xml"
        output_dir = "#{site.source}/docs/v1/tech/"
        # Check if the file needs to be re-generated
        output = File.join(output_dir, file_name)
        if !File.exist?(output) || File.mtime(output) < latest_date
          File.open(output_dir+file_name, "w") { |f| f.write rss}
          site.static_files << Jekyll::StaticFile.new(site, '', output_dir, file_name)
        end
      rescue SocketError
        puts "not generating RSS feed, can't connect to hosts"
      end
  
    end
  end
end
