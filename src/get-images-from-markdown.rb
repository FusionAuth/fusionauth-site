require 'open-uri'
require 'optparse'

options = {}

# default options
options[:directory] = "."

OptionParser.new do |opts|
  opts.banner = "Usage: get-images-from-markdown.rb [options]"

  opts.on("-f", "--file FILE", "File containing image urls to download. All images must be on imgur") do |file|
    options[:file] = file
  end

  opts.on("-d", "--directory DIR", "Download directory. Defaults to current directory.") do |directory|
    options[:directory] = directory
  end

  opts.on("-p", "--print-includes", "Print includes.") do |print_includes|
    options[:print_includes] = true
  end

  opts.on("-h", "--help", "Prints this help. This script takes any markdown with a bunch of imgur images in it and downloads the files to a given directory. It can also print out the FusionAuth specific include directives for easy cut and paste. ") do
    puts opts
    exit(false)
  end
end.parse!


file = File.new(options[:file])

seen_filenames = {}

file.readlines.each do |line|
  html_dir = options[:directory].to_s.gsub(/.*assets/,'/assets')
  if line.match(/imgur/)
    #puts(line)
    ob = line.split(/]/)
    desc = ob[0].gsub('!','').gsub('[','').tr('^A-Za-z0-9 ','')
    filename = desc.downcase.gsub(' ','-').tr('^a-z0-9-','') + ".png"
    if seen_filenames[filename]
      filename = filename.gsub(".png","-"+rand(100).to_s+".png")
    else
      seen_filenames[filename] = true
    end
    #puts filename

    url = ob[1].gsub('(','').gsub(')','').strip
    #puts url

    URI.open(url) do |image|
      File.open(options[:directory]+"/"+filename, "wb") do |file|
        file.write(image.read)
      end
    end
    
    if options[:print_includes]
      puts '{% include _image.liquid src="'+html_dir+'/'+filename+'" alt="'+desc+'." class="img-fluid" figure=true %}'
    end
  end
end


